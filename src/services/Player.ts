import * as vscode from 'vscode';
import * as buffers from './BufferManager';
import Storage from '../repositories/MacroRepository';
//import * as Queue from 'promise-queue';
import PQueue from 'p-queue';
import { EventEmitter } from 'stream';

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
  console.log(
    `Working on item #${++count}.  Size: ${replayQueue.size}  Pending: ${
      replayQueue.pending
    }`
  );
});

replayQueue.on('add', () => {
  console.log(
    `Task is added.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  );
});

replayQueue.on('next', () => {
  console.log(
    `Task is completed.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  );
});

replayQueue.on('idle', () => {
  console.log(
    `Queue idle.  Size: ${replayQueue.size}  Pending: ${replayQueue.pending}`
  );
});

export default class Player {
  private static _instance: Player;
  private _storage: Storage;
  private _status: string = PAUSED;
  private _currentMacroName: string | undefined;
  private _currentBuffer: buffers.Buffer | undefined;
  private _eventEmitter: EventEmitter;

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
    console.log('position: ', position);
    const visibleEditor = vscode.window.visibleTextEditors[0];
    if (!visibleEditor) {
      return;
    }

    this._currentBuffer = buffers.get(position);
    console.log('current buffer: ', this._currentBuffer);
    // cast currentBuffer to Frame variable

    const currentBuffer = <buffers.Frame>this._currentBuffer;

    if (!currentBuffer) {
      return;
    }

    await visibleEditor.edit((edit) => {
      // update initial file content
      const l = visibleEditor.document.lineCount;
      const range = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(
          l,
          Math.max(
            0,
            visibleEditor.document.lineAt(Math.max(0, l - 1)).text.length - 1
          )
        )
      );

      edit.delete(range);
      edit.insert(new vscode.Position(0, 0), currentBuffer.editorContent);
    });
    this.updateStatus(PAUSED);
  }

  public restart() {
    this._currentBuffer = undefined;
    // replayQueue.start();
    this.start();
  }

  public pause() {
    this.updateStatus(PAUSED);
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

  private finished() {
    this.updateStatus(STOPPED);
    this._currentBuffer = undefined;
  }

  public async start() {
    const items = this._storage.list();

    if (!this._currentMacroName) {
      console.log('no current macro name');
      const picked = await vscode.window.showQuickPick(
        items.map((item) => item.name)
      );

      if (!picked) {
        console.log('no macro picked');
        return;
      }

      const macro = this._storage.getByName(picked);
      this._currentMacroName = macro.name;
    }

    this.updateStatus(PLAYING);
    if (!this._currentBuffer) {
      console.log('no current buffer');
      const macro = this._storage.getByName(this._currentMacroName);
      buffers.inject(macro.buffers);

      console.log('injected macro', macro);
      this._currentBuffer = buffers.get(0);
      if (!this._currentBuffer) {
        vscode.window.showErrorMessage('No active recording');
        return;
      }

      //old: const textEditor = vscode.window.activeTextEditor;
      const textEditor = vscode.window.activeTextEditor;
      const visibleEditor = vscode.window.visibleTextEditors[0];
      console.log('text editor: ', textEditor);
      console.log('visible editor: ', visibleEditor);
      if (buffers.isStartingPoint(this._currentBuffer)) {
        await this.setStartingPoint(this._currentBuffer, visibleEditor);
      }

      vscode.window.showInformationMessage(
        `Now playing ${buffers.count()} buffers from ${macro.name}!`
      );
    }

    this.autoPlay();

    vscode.window.showInformationMessage(
      `Now playing ${buffers.count()} buffers from ${this._currentMacroName}!`
    );
  }

  private autoPlay() {
    console.log('autoplay');
    const self = this;
    (function me() {
      if (self._status === PAUSED) {
        console.log('paused :(');
        return;
      }

      setTimeout(async () => {
        console.log('proccess buffer');
        await self.processBuffer();
        me();
      }, 50);
    })();
  }

  private processBuffer() {
    console.log('adding to queue');
    return replayQueue.add(
      () =>
        new Promise((resolve, reject) => {
          try {
            console.log('before advancing buffer');
            this.advanceBuffer(resolve, 'remove this text');
          } catch (e) {
            console.log(e);
            reject(e);
          }
        })
    );
  }

  private async setStartingPoint(
    startingPoint: buffers.StartingPoint,
    textEditor: vscode.TextEditor | undefined
  ) {
    let editor = textEditor;
    // if no open text editor, open one
    if (!editor) {
      vscode.window.showInformationMessage('opening new window');
      const document = await vscode.workspace.openTextDocument({
        language: startingPoint.language,
        content: startingPoint.editorContent,
      });

      editor = await vscode.window.showTextDocument(document);
    } else {
      const existingEditor = editor;
      await existingEditor.edit((edit) => {
        // update initial file content
        const l = existingEditor.document.lineCount;
        const range = new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(
            l,
            Math.max(
              0,
              existingEditor.document.lineAt(Math.max(0, l - 1)).text.length - 1
            )
          )
        );

        edit.delete(range);
        edit.insert(new vscode.Position(0, 0), startingPoint.editorContent);
      });
    }

    if (editor) {
      this.updateSelections(startingPoint.selections, editor);

      // language should always be defined, guard statement here
      // to support old recorded frames before language bit was added
      if (startingPoint.language) {
        // @TODO set editor language once the API becomes available:
        // https://github.com/Microsoft/vscode/issues/1800
      }
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

  private advanceBuffer(done: Function, userInput: string) {
    console.log('advanced buffer');
    //const editor = vscode.window.activeTextEditor;
    const editor = vscode.window.visibleTextEditors[0];
    const buffer = this._currentBuffer;

    if (!editor) {
      vscode.window.showErrorMessage('No active editor');
      return;
    }

    if (!buffer) {
      vscode.window.showErrorMessage('No buffer to advance');
      return;
    }

    if (buffers.isStopPoint(buffer)) {
      if (userInput === stopPointBreakChar) {
        this._currentBuffer = buffers.get(buffer.position + 1);
      }

      return done();
    }

    console.log('----->buffer: ', buffer);
    const { changes, selections } = <buffers.Frame>buffer;

    const updateSelectionAndAdvanceToNextBuffer = () => {
      if (selections.length) {
        this.updateSelections(selections, editor);
      }
      this.notifyStatusChanged();

      // Ran out of buffers? Disable type capture.
      if (buffers.count() - 1 == buffer.position) {
        console.log('finished');
        this.finished();
      } else {
        this._currentBuffer = buffers.get(buffer.position + 1);
      }

      done();
    };
    changes && console.log('changes: ', changes.length);

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
    console.log('applyContentChanges');
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
