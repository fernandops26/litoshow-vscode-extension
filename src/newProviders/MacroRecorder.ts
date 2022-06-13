import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import MacroRepository from '../repositories/MacroRepository';
import { Macro } from '../types';
import { EditorProvider } from '../providers/EditorProvider';
import { TreeDataProvider } from './TreeDataProvider';
import {
  toInititalMacroState,
  toMacroChangeEvent,
} from '../utils/toMacroChangeEvent';

export class MacroRecorder {
  private _macroRepository: MacroRepository;
  private _disposable: vscode.Disposable;
  private _textEditorManager: EditorProvider;
  private _activeMacro: Macro | null;
  private _treeProvider: TreeDataProvider;

  constructor(
    _macroRepository: MacroRepository,
    _treeProvider: TreeDataProvider
  ) {
    this._macroRepository = _macroRepository;
    this._treeProvider = _treeProvider;
    this._textEditorManager = new EditorProvider();
    this._activeMacro = null;

    let suscriptions: vscode.Disposable[] = [];

    vscode.workspace.onDidChangeTextDocument(
      this._onDidChangeTextDocument,
      this,
      suscriptions
    );

    const createMacro = vscode.commands.registerCommand(
      'newlitoshow.createMacro',
      async () => {
        if (this._activeMacro) {
          vscode.window.showWarningMessage(
            'You are currently recording a macro.'
          );
          return;
        }

        vscode.window.showInformationMessage('create macro');

        const macroName: string | undefined = await vscode.window.showInputBox({
          title: 'Add name to your macro',
          placeHolder: 'My awesome macro',
        });

        if (!macroName) {
          vscode.window.showInformationMessage('You should specify a name.');
          return;
        }

        const currentContent = this._textEditorManager.currentContent();
        const currentDocument = this._textEditorManager.currentDocument();

        if (!currentContent || !currentDocument) {
          return;
        }

        console.log('current content: ', currentContent);

        const macro: Macro = {
          id: uuidv4(),
          name: macroName,
          initialState: toInititalMacroState(
            currentDocument,
            currentContent.range,
            currentContent.text
          ),
          changes: [],
        };

        this._activeMacro = macro;

        // active macro
      }
    );

    const saveMacro = vscode.commands.registerCommand(
      'newlitoshow.saveMacro',
      async () => {
        if (!this._activeMacro) {
          vscode.window.showWarningMessage('No active macro.');
          return;
        }

        this._macroRepository.saveOne(this._activeMacro);
        this._treeProvider.refresh();
        this._activeMacro = null;
      }
    );

    this.createStatus();

    this._disposable = vscode.Disposable.from(
      ...suscriptions,
      createMacro,
      saveMacro
      // stepCreator
    );
  }

  private _onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    if (null === this._activeMacro) {
      return;
    }

    this._activeMacro.changes.push(toMacroChangeEvent(e));
  }

  public static register(
    context: vscode.ExtensionContext,
    macroRepository: MacroRepository,
    treeProvider: TreeDataProvider
  ) {
    vscode.window.showInformationMessage('register recorder');

    const macroRecorder = new MacroRecorder(macroRepository, treeProvider);

    context.subscriptions.push(macroRecorder);
  }

  private createStatus() {
    /*const statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right
    );
    statusBar.text = '$(beaker) Create Step';
    statusBar.command = 'newlitoshow.createStep';
    statusBar.show();*/
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
