import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import MacroRepository from '../repositories/MacroRepository';
import { Macro } from '../types';
import { EditorProvider } from '../providers/EditorProvider';
import { StorageService } from '../providers/StorageService';
import { TreeDataProvider } from './TreeDataProvider';
import { MacroPlayer } from './MacroPlayer';

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

        const macro: Macro = {
          id: uuidv4(),
          name: macroName,
          initialState: {
            range: currentContent[0],
            text: currentContent[1],
          },
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

    /*const playMacro = vscode.commands.registerCommand(
      'newlitoshow.playMacro',
      async (command) => {
        console.log(command);
        vscode.window.showInformationMessage('play macro id : ' + command.id);

        const macroToPlay = this._macroRepository.findOne(command.id);

        if (!macroToPlay) {
          vscode.window.showWarningMessage('Macro does not found!');
          return null;
        }

        const player = MacroPlayer.getInstance(
          this._macroRepository,
          this._textEditorManager,
          macroToPlay
        );

        await player.play();
        //const document = this._textEditorManager
      }
    );*/

    this.createStatus();

    this._disposable = vscode.Disposable.from(
      ...suscriptions,
      createMacro,
      saveMacro
      // stepCreator
    );
  }

  /*private appendStep(newStep: {
    range: vscode.Range;
    text: string;
    id: string;
  }) {
    const currentSteps = Array.from(this._storage.getValue('steps') || []);

    currentSteps.push(newStep);

    this._storage.setValue('steps', currentSteps);
  }*/

  private _onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    if (null === this._activeMacro) {
      return;
    }
    console.log(e.contentChanges);

    this._activeMacro.changes?.push({
      document: e.document,
      contentChanges: e.contentChanges,
      reason: e.reason,
    });
  }

  public static register(
    context: vscode.ExtensionContext,
    treeProvider: TreeDataProvider
  ) {
    vscode.window.showInformationMessage('register recorder');

    const storage = new StorageService(context.globalState);
    const macroRepository = new MacroRepository(storage);
    const stepRecorder = new MacroRecorder(macroRepository, treeProvider);

    context.subscriptions.push(stepRecorder);
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
