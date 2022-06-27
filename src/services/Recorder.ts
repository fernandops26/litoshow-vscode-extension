// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as buffers from './BufferManager';
import Storage from '../repositories/MacroRepository';

type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

type Metadata = {
  name: string;
  description: string;
};

type Macro = Metadata & {
  buffers: Buffer[];
};

enum BufferTypes {
  Starting = 1,
  Change = 2,
  Stop = 3,
}

export default class Recorder {
  private _disposable: vscode.Disposable;
  private _textEditor: vscode.TextEditor | undefined;
  private _buffers = 0;
  private _currentChanges: vscode.TextDocumentContentChangeEvent[] = [];
  private _storage: Storage;
  private _activeMacro: Macro | undefined = undefined;

  public static register(context: vscode.ExtensionContext) {
    return () => {
      // reset global buffer

      //vscode.window.showInformationMessage('Hacker Typer is now recording!');
      const recorder = new Recorder(Storage.getInstance(context));
      context.subscriptions.push(recorder);
    };
  }

  constructor(storage: Storage) {
    console.log('constructor here');
    this._storage = storage;

    let subscriptions: vscode.Disposable[] = [];

    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      subscriptions
    );

    vscode.window.onDidChangeTextEditorSelection(
      this.onDidChangeTextEditorSelection,
      this,
      subscriptions
    );

    /*const createMacro = vscode.commands.registerCommand(
      'newlitoshow.createMacro',
      this.createMacro,
      this
    );*/

    const insertNamedStop = vscode.commands.registerCommand(
      'litoshow.experiment.insertNamedStop',
      this.insertNamedStop,
      this
    );

    const insertStop = vscode.commands.registerCommand(
      'litoshow.experiment.insertStop',
      () => {
        this.insertStop(null);
      }
    );

    const save = vscode.commands.registerCommand(
      'newlitoshow.saveMacro',
      async () => this.saveRecording(save)
    );

    // Why?
    //this._textEditor = vscode.window.activeTextEditor;
    this._disposable = vscode.Disposable.from(
      ...subscriptions,
      //createMacro,
      insertNamedStop,
      insertStop,
      save
    );

    this.createMacro();

    /*if (this._textEditor) {
      this.insertStartingPoint(this._textEditor);
    }*/
  }

  private async createMacro() {
    if (this._activeMacro) {
      vscode.window.showWarningMessage('You are currently recording a macro.');
      return;
    }

    const macroName: string | undefined = await vscode.window.showInputBox({
      title: 'Add name to your macro',
      placeHolder: 'My awesome macro',
    });

    if (!macroName) {
      vscode.window.showInformationMessage('You should specify a name.');
      return;
    }

    this._activeMacro = {
      name: macroName,
      description: '',
      buffers: [],
    };

    vscode.window.showInformationMessage('Recording your macro.');

    this._textEditor = vscode.window.activeTextEditor;
    if (this._textEditor) {
      this.insertStartingPoint(this._textEditor);
    }
  }

  private insertStartingPoint(textEditor: vscode.TextEditor) {
    const content = textEditor.document.getText();

    const editorSelections = textEditor.selections.map(
      (item) => item as Mutable<vscode.Selection>
    );
    const selections = editorSelections;
    const language = textEditor.document.languageId;

    buffers.clear();
    buffers.insert({
      type: BufferTypes.Starting,
      position: this._buffers++,
      editorContent: content,
      language,
      selections,
    });
  }

  private insertNamedStop() {
    vscode.window
      .showInputBox({
        prompt: 'What do you want to call your stop point?',
        placeHolder: 'Type a name or ENTER for unnamed stop point',
      })
      .then((name) => {
        this.insertStop(name || null);
      });
  }

  private insertStop(name: string | null) {
    buffers.insert({
      type: BufferTypes.Stop,
      stop: {
        name: name || null,
      },
      changes: [],
      selections: [],
      position: this._buffers++,
    });
  }

  private async saveRecording(command: vscode.Disposable) {
    if (!this._activeMacro) {
      vscode.window.showWarningMessage('No active macro to save.');
      return;
    }

    const storedMacro = await this._storage.save({
      ...this._activeMacro,
      buffers: buffers.all(),
    });
    console.log('stored macro: ', storedMacro);

    vscode.window.showInformationMessage(
      `Saved ${storedMacro.buffers.length} buffers under "${storedMacro.name}".`
    );

    this._activeMacro = undefined;
    vscode.commands.executeCommand('litoshow.updateClientList');

    command.dispose();
    this.dispose();
  }

  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    if (!this._activeMacro) {
      return;
    }
    // @TODO: Gets called while playing -- need to stop recording once over

    // store changes, selection change will commit
    const contentChanges = e.contentChanges.map(
      (item) => item as Mutable<vscode.TextDocumentContentChangeEvent>
    );
    this._currentChanges = contentChanges;
  }

  private onDidChangeTextEditorSelection(
    e: vscode.TextEditorSelectionChangeEvent
  ) {
    // @TODO: Gets called while playing -- need to stop recording once over

    // Only allow recording to one active editor at a time
    // Breaks when you leave but that's fine for now.

    if (!this._activeMacro) {
      return;
    }

    if (e.textEditor !== this._textEditor) {
      return;
    }

    const changes = this._currentChanges;
    console.log('current changes: ', changes);
    const editorSelections = (e.selections || []).map(
      (item) => item as Mutable<vscode.Selection>
    );
    const selections = editorSelections;
    this._currentChanges = [];

    buffers.insert({
      type: BufferTypes.Change,
      editorContent: this._textEditor.document.getText(),
      changes,
      selections,
      position: this._buffers++,
    });
  }

  dispose() {
    console.log('disposing recorder', this._disposable);
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
