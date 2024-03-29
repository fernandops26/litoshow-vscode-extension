// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as buffers from './BufferManager';
import Storage from '../repositories/MacroRepository';
import { getRelativeFilePath } from '../utils/filePathInfo';
import { v4 as uuidV4 } from 'uuid';

type Mutable<Type> = {
  -readonly [Key in keyof Type]: Type[Key];
};

type Metadata = {
  id: string;
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
  private _buffers = 0;
  private _currentChanges: vscode.TextDocumentContentChangeEvent[] = [];
  private _storage: Storage;
  private _activeMacro: Macro | undefined = undefined;

  public static register(context: vscode.ExtensionContext) {
    const recorder = new Recorder(Storage.getInstance(context));
    context.subscriptions.push(recorder);
  }

  constructor(storage: Storage) {
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

    const createMacro = vscode.commands.registerCommand(
      'litoshow.createMacro',
      this.createMacro,
      this
    );

    const insertNamedStop = vscode.commands.registerCommand(
      'litoshow.insertStop',
      this.insertNamedStop,
      this
    );

    const save = vscode.commands.registerCommand(
      'litoshow.saveMacro',
      async () => this.saveRecording()
    );

    this._disposable = vscode.Disposable.from(
      ...subscriptions,
      createMacro,
      insertNamedStop,
      save
    );
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
      id: uuidV4(),
      name: macroName,
      description: '',
      buffers: [],
    };

    vscode.window.showInformationMessage('Recording your macro.');

    const textEditor = vscode.window.activeTextEditor;
    if (textEditor) {
      this.insertStartingPoint(textEditor);
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
      document: {
        ...textEditor.document,
        relative: getRelativeFilePath(textEditor.document.uri.fsPath),
      },
      type: BufferTypes.Starting,
      position: this._buffers++,
      editorContent: content,
      language,
      selections,
    });
  }

  private insertNamedStop() {
    if (!this._activeMacro) {
      vscode.window.showWarningMessage('No active macro to create stop point.');
      return;
    }

    vscode.window
      .showInputBox({
        prompt: 'What do you want to call your stop point?',
        placeHolder: 'Type a name.',
      })
      .then((name) => {
        if (!name) {
          vscode.window.showInformationMessage('You should specify a name.');
          return;
        }

        this.insertStop(name);
      });
  }

  private insertStop(name: string) {
    buffers.insert({
      type: BufferTypes.Stop,
      stop: {
        name: name,
      },
      changes: [],
      selections: [],
      position: this._buffers++,
    });
  }

  private async saveRecording() {
    if (!this._activeMacro) {
      vscode.window.showWarningMessage('No active macro to save.');
      return;
    }

    const storedMacro = await this._storage.save({
      ...this._activeMacro,
      buffers: buffers.all(),
    });

    vscode.window.showInformationMessage(
      `Saved macro: "${storedMacro.name}".`
    );

    this._activeMacro = undefined;
    vscode.commands.executeCommand('litoshow.updateClientList');
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

    const textEditor = e.textEditor;

    const changes = this._currentChanges;
    const editorSelections = (e.selections || []).map(
      (item) => item as Mutable<vscode.Selection>
    );
    const selections = editorSelections;
    this._currentChanges = [];

    buffers.insert({
      document: {
        ...textEditor.document,
        relative: getRelativeFilePath(textEditor.document.uri.fsPath),
      },
      type: BufferTypes.Change,
      editorContent: textEditor.document.getText(),
      changes,
      selections,
      position: this._buffers++,
    });
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
