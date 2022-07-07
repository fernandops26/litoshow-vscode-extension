import * as vscode from 'vscode';
import * as buffers from './BufferManager';
import Storage, { Macro } from '../repositories/MacroRepository';
import PQueue from 'p-queue';
import { EventEmitter } from 'stream';
import { getEditor } from '../utils/editorResolver';

const stopPointBreakChar = `\n`; // ENTER
const replayConcurrency = 1;
//const replayQueueMaxSize = Number.MAX_SAFE_INTEGER;
const replayQueue = new PQueue({
  //concurrency: replayConcurrency,
  autoStart: true,
});

let count = 0;

const NO_INITIATED: string = 'no-initiated';
const PLAYING: string = 'playing';
const STOPPED: string = 'stopped';
const PAUSED: string = 'paused';

replayQueue.on('active', () => {
  // console.log(
  //   `Working on item #${++count}.  Size: ${replayQueue.size}  Pending: ${
  //     replayQueue.pending
  //   }`
  // );
});

replayQueue.on('add', () => {
  // console.log(
  //   `Task is added.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  // );
});

replayQueue.on('next', () => {
  // console.log(
  //   `Task is completed.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  // );
});

replayQueue.on('idle', () => {
  // console.log(
  //   `Queue idle.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  // );
});

export default class Player {
  private static _instance: Player;
  private _storage: Storage;
  private _status: string = PAUSED;
  private _currentBuffer: buffers.Buffer | undefined;
  private _eventEmitter: EventEmitter;
  private _currentWorkspaceFolder: string | undefined;
  private _currentMacro: Macro | undefined;

  public static register(
    context: vscode.ExtensionContext,
    eventEmitter: EventEmitter
  ) {
    if (!Player._instance) {
      Player._instance = new Player(Storage.getInstance(context), eventEmitter);
    }

    return Player._instance;
  }

  constructor(storage: Storage, eventEmitter: EventEmitter) {
    this._storage = storage;
    this._eventEmitter = eventEmitter;

    this._eventEmitter.on('request-macro-player-context', this.sendMacroContextInfo)
  }

  public select(id: string) {
    if (id !== this._currentMacro?.id) {
      const macro = this._storage.getById(id);
      this._currentMacro = macro;
      buffers.inject(macro.buffers);
      this._currentBuffer = buffers.get(0);
      this.updateStatus(NO_INITIATED);
      return
    }

    this.updateStatus(PAUSED);
  }

  public isSelectedMacroName(): boolean {
    return this._currentMacro !== undefined;
  }

  public getSelectedMacro(): Macro | undefined {
    return this._currentMacro;
  }

  public getMacroId(): string | undefined {
    return this._currentMacro?.id;
  }

  public async moveTo(position: number) {
    this._currentBuffer = <buffers.Frame>buffers.get(position);
    let currentBuffer = this._currentBuffer;
    this.updateStatus(PAUSED);

    if (buffers.isStopPoint(currentBuffer)) {
      this._currentBuffer = buffers.get(position + 1);
      return
    }

    const editor = await getEditor(
      this._currentWorkspaceFolder,
      currentBuffer.document.relative
    );

    await this.replaceContentOf(editor, currentBuffer.editorContent);
  }

  private async replaceContentOf(editor: vscode.TextEditor, content: string) {
    await editor.edit((edit) => {
      // update initial file content
      const l = editor.document.lineCount;
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(
          l,
          Math.max(
            0,
            editor.document.lineAt(Math.max(0, l - 1)).text.length - 1
          )
        )
      );

      edit.delete(range);
      edit.insert(new vscode.Position(0, 0), content);
    });
  }

  public async pause() {
    this.updateStatus(PAUSED);
    await vscode.window.showInformationMessage('🧘 Macro paused');
  }

  private updateStatus(status: string) {
    this._status = status;
    this.notifyStatusChanged();
  }

  private sendMacroContextInfo = () => {
    const currentPosition = this._currentBuffer?.position ?? 0;

    this._eventEmitter.emit('macro-player-context-info', {
      status: this._status,
      total: buffers.count() - 1,
      current: (currentPosition > 0 ? currentPosition - 1  : 0),
      stopPoints: this.stopPoints()
    });
  }

  private notifyStatusChanged() {
    this._eventEmitter.emit('status-changed', {
      status: this._status,
      total: buffers.count() - 1,
      current: this._currentBuffer?.position ?? 0,
    });
  }

  private async finished() {
    this.updateStatus(STOPPED);
    this._currentBuffer = undefined;
    await vscode.window.showInformationMessage('🙌 Macro finished');
  }

  public stopPoints(): buffers.StopPoint[] {
    return buffers.getStopPoints();
  }

  public async resume() {
    if (!this._currentBuffer) {
      vscode.window.showWarningMessage('No active macro to resume.')
    }
    this.updateStatus(PLAYING);
    this.autoPlay();
  }

  public async clear() {
    this._currentBuffer = undefined;
    this._currentMacro = undefined;
    this._currentWorkspaceFolder = undefined;
    buffers.clear();
  }

  public async start() {
    const workspacePicked = await vscode.window.showQuickPick(
      (vscode.workspace.workspaceFolders || []).map((item) => item.uri.fsPath)
    );

    if (workspacePicked === undefined) {
      vscode.window.showWarningMessage('No workspace folder selected');
      return;
    }

    this._currentWorkspaceFolder = workspacePicked;

    this._currentBuffer = buffers.get(0);

    this.updateStatus(PLAYING);

    if (buffers.isStartingPoint(this._currentBuffer)) {
      await this.setStartingPoint(this._currentBuffer);
    }

    this.autoPlay();

    vscode.window.showInformationMessage(
      `🚀 Playing: ${this._currentMacro?.name}`
    );
  }

  private autoPlay() {
    const self = this;
    (function me() {
      if (self._status === PAUSED || self._status === STOPPED) {
        return;
      }

      setTimeout(async () => {
        await self.processBuffer();
        me();
      }, 50);
    })();
  }

  private processBuffer() {
    return replayQueue.add(
      () =>
        new Promise((resolve, reject) => {
          try {
            this.advanceBuffer(resolve, 'remove this text');
          } catch (e) {
            reject(e);
          }
        })
    );
  }

  private async setStartingPoint(startingPoint: buffers.StartingPoint) {
    const editor = await getEditor(
      this._currentWorkspaceFolder,
      startingPoint.document.relative
    );

    await this.replaceContentOf(editor, startingPoint.editorContent);

    if (editor) {
      this.updateSelections(startingPoint.selections, editor);

      // language should always be defined, guard statement here
      // to support old recorded frames before language bit was added
      //if (startingPoint.language) {
      // @TODO set editor language once the API becomes available:
      // https://github.com/Microsoft/vscode/issues/1800
      //}
    }

    // move to next frame
    this._currentBuffer = buffers.get(startingPoint.position + 1);
  }

  private updateSelections(
    selections: vscode.Selection[],
    editor: vscode.TextEditor
  ) {
    editor.selections = selections;

    // move scroll focus if needed
    const { start, end } = editor.selections[0];
    editor.revealRange(
      new vscode.Range(start, end),
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    );
  }

  private async advanceBuffer(done: Function, userInput: string) {
    const buffer = this._currentBuffer;

    if (!buffer) {
      vscode.window.showErrorMessage('No buffer to advance');
      this.finished();
      return done();
    }

    if (buffers.isStopPoint(buffer)) {
      this.updateStatus(PAUSED);
      vscode.window.showInformationMessage(`🚩 ${buffer.stop.name}`);
      this._currentBuffer = buffers.get(buffer.position + 1);

      return done();
    }

    const { changes, selections } = <buffers.Frame>buffer;

    const editor = await getEditor(
      this._currentWorkspaceFolder,
      buffer.document.relative
    );

    const prevBuffer = <buffers.Frame>buffers.get(buffer.position - 1);

    if (prevBuffer && buffers.isChange(prevBuffer)) {
      if (prevBuffer.document.uri.fsPath !== buffer.document.uri.fsPath) {
        await this.replaceContentOf(editor, buffer.editorContent);
      } else {
        if (prevBuffer.editorContent !== editor.document.getText()) {
          await this.replaceContentOf(editor, prevBuffer.editorContent);
        }
      }
    }

    const updateSelectionAndAdvanceToNextBuffer = () => {
      if (selections.length) {
        this.updateSelections(selections, editor);
      }
      this.notifyStatusChanged();

      // Ran out of buffers? Disable type capture.
      if (buffers.count() - 1 == buffer.position) {
        this.finished();
      } else {
        this._currentBuffer = buffers.get(buffer.position + 1);
      }

      done();
    };

    if (changes && changes.length > 0) {
      editor
        .edit((edit) => this.applyContentChanges(changes, edit))
        .then(updateSelectionAndAdvanceToNextBuffer);
    } else {
      updateSelectionAndAdvanceToNextBuffer();
    }
  }

  private applyContentChanges(
    changes: vscode.TextDocumentContentChangeEvent[],
    edit: vscode.TextEditorEdit
  ) {
    changes.forEach((change) => this.applyContentChange(change, edit));
  }

  private applyContentChange(
    change: vscode.TextDocumentContentChangeEvent,
    edit: vscode.TextEditorEdit
  ) {
    if (change.text === '') {
      edit.delete(change.range);
    } else if (change.rangeLength === 0) {
      edit.insert(change.range.start, change.text);
    } else {
      edit.replace(change.range, change.text);
    }
  }
}
