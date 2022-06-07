import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { EditorProvider } from './EditorProvider';
import { StorageService } from './StorageService';

export class StepRecorder {
  private _storage: StorageService;
  private _disposable: vscode.Disposable;
  private _textEditorManager: EditorProvider;

  constructor(storage: StorageService) {
    this._storage = storage;
    this._textEditorManager = new EditorProvider();

    let suscriptions: vscode.Disposable[] = [];

    vscode.workspace.onDidChangeTextDocument(
      this.onDidChangeTextDocument,
      this,
      suscriptions
    );

    const createMacro = vscode.commands.registerCommand(
      'newlitoshow.createMacro',
      () => {
        vscode.window.showInformationMessage('create macro');

        const macroName = vscode.window.showInputBox({
          title: 'Add name to your macro',
          placeHolder: 'My awesome macro',
        });

        if (!macroName) {
          return;
        }

        this._storage.setValue('currentMacro', macroName);
      }
    );

    this.createStatus();

    this._disposable = vscode.Disposable.from(...suscriptions, createMacro);
  }

  private appendStep(newStep: {
    range: vscode.Range;
    text: string;
    id: string;
  }) {
    const currentSteps = Array.from(this._storage.getValue('steps') || []);

    currentSteps.push(newStep);

    this._storage.setValue('steps', currentSteps);
  }

  private onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    console.log(e);
  }

  public static register(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('register');

    const storage = new StorageService(context.globalState);
    const stepRecorder = new StepRecorder(storage);

    context.subscriptions.push(stepRecorder);
  }

  private createStatus() {
    const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    statusBar.text = '$(beaker) Create Step';
    // statusBar.command = 'newlitoshow.createStep';
    statusBar.show();
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
