import * as vscode from 'vscode';
import * as buffers from './BufferManager';
import Storage from '../repositories/MacroRepository';
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
  private _currentMacroName: string | undefined;
  private _currentBuffer: buffers.Buffer | undefined;
  private _eventEmitter: EventEmitter;
  private _currentWorkspaceFolder: string | undefined;

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
  }

  public select(name: string) {
    this.updateStatus(PAUSED);

    if (name !== this._currentMacroName) {
      this._currentMacroName = name;
    }
  }

  public async moveTo(position: number) {
    this._currentBuffer = <buffers.Frame>buffers.get(position);
    const editor = await getEditor(
      this._currentWorkspaceFolder,
      this._currentBuffer.document.relative
    );

    // cast currentBuffer to Frame variable
    const currentBuffer = this._currentBuffer;

    await this.replaceContentOf(editor, currentBuffer.editorContent);

    this.updateStatus(PAUSED);
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

  public restart() {
    this._currentBuffer = undefined;
    // replayQueue.start();
    this.start();
  }

  public async pause() {
    this.updateStatus(PAUSED);
    await vscode.window.showInformationMessage('Macro paused');
  }

  private updateStatus(status: string) {
    this._status = status;
    this.notifyStatusChanged();
  }

  private notifyStatusChanged() {
    this._eventEmitter.emit('status-changed', {
      status: this._status,
      total: buffers.count() - 1,
      current: this._currentBuffer?.position ?? 0,
    });
  }

  public deselect() {
    this._currentMacroName = undefined;
    this._currentBuffer = undefined;
    this.updateStatus(PAUSED);
  }

  private async finished() {
    this.updateStatus(STOPPED);
    this._currentBuffer = undefined;
    await vscode.window.showInformationMessage('Macro finished');
  }

  public async start() {
    const items = this._storage.list();

    if (!this._currentMacroName) {
      const picked = await vscode.window.showQuickPick(
        items.map((item) => item.name)
      );

      if (!picked) {
        return;
      }

      const macro = this._storage.getByName(picked);
      this._currentMacroName = macro.name;
    }

    const workspacePicked = await vscode.window.showQuickPick(
      (vscode.workspace.workspaceFolders || []).map((item) => item.uri.fsPath)
    );

    if (!workspacePicked) {
      vscode.window.showWarningMessage('No workspace folder selected');
      return;
    }

    vscode.window.showInformationMessage(
      'Selected workspace: ' + workspacePicked
    );

    this._currentWorkspaceFolder = workspacePicked;

    this.updateStatus(PLAYING);
    if (!this._currentBuffer) {
      const macro = this._storage.getByName(this._currentMacroName);
      buffers.inject(macro.buffers);

      this._currentBuffer = buffers.get(0);

      if (buffers.isStartingPoint(this._currentBuffer)) {
        await this.setStartingPoint(this._currentBuffer);
      }

      vscode.window.showInformationMessage(
        `Playing ${buffers.count()} actions from ${macro.name} macro!`
      );
    }

    this.autoPlay();

    vscode.window.showInformationMessage(
      `Playing ${buffers.count()} actions from ${this._currentMacroName} macro!`
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
            console.log(e);
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
      if (userInput === stopPointBreakChar) {
        this._currentBuffer = buffers.get(buffer.position + 1);
      }

      return done();
    }

    const { changes, selections } = <buffers.Frame>buffer;

    const editor = await getEditor(
      this._currentWorkspaceFolder,
      buffer.document.relative
    );

    const prevBuffer = <buffers.Frame>buffers.get(buffer.position - 1);
    if (
      prevBuffer &&
      prevBuffer.document.uri.fsPath !== buffer.document.uri.fsPath
    ) {
      await this.replaceContentOf(editor, buffer.editorContent);
    } else {
      if (
        prevBuffer &&
        prevBuffer.editorContent !== editor.document.getText()
      ) {
        await this.replaceContentOf(editor, prevBuffer.editorContent);
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
