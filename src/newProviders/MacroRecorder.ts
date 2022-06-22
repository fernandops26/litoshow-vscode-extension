import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import MacroRepository from '../repositories/MacroRepository';
import { Macro } from '../types';
import { EditorProvider } from '../providers/EditorProvider';
import { TreeDataProvider } from './TreeDataProvider';
import {
  toInitialMacroChange,
  toMacroDocumentChangeEvent,
} from '../utils/toMacroChangeEvent';
import { EventEmitter } from 'stream';

export class MacroRecorder {
  private _macroRepository: MacroRepository;
  private _disposable: vscode.Disposable;
  private _textEditorManager: EditorProvider;
  private _activeMacro: Macro | null;
  private _eventEmitter: EventEmitter;

  constructor(_macroRepository: MacroRepository, _eventEmitter: EventEmitter) {
    this._macroRepository = _macroRepository;
    this._eventEmitter = _eventEmitter;
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

        const currentState = this._textEditorManager.getState();

        if (!currentState.document || !currentState.content) {
          return;
        }

        //console.log('current content: ', currentContent);
        // { context: 'a', changes: '' }, -> on move: pos: 0 (context + changes) | on play: (changes)
        // { context: 'a', changes: 'b' }, -> a pos: 1 (context + changes) | on play: (changes)
        // { context: 'ab', changes: 'c' } -> a pos: 2 (context + changes) | on play: (changes)
        // { context: 'abc', changes: 'd' } -> a pos: 3 (context + changes) | on play: (changes)
        // { context: 'abcd', changes: 'e' } -> a pos: 4 (context + changes) | on play: (changes)

        const macro: Macro = {
          id: uuidv4(),
          name: macroName,
          changes: [
            toInitialMacroChange(
              currentState.document,
              currentState.content.range,
              currentState.content.text
            ),
          ],
        };

        this._activeMacro = macro;
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
        const list = this._macroRepository.findAll();

        this._eventEmitter.emit('client:updateMacroList', { macros: list });
        this._activeMacro = null;
      }
    );

    this.createStatus();

    this._disposable = vscode.Disposable.from(
      ...suscriptions,
      createMacro,
      saveMacro
    );
  }

  private _onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): void {
    if (null === this._activeMacro) {
      return;
    }

    const content = this._textEditorManager.currentContent();

    if (!content) {
      return;
    }

    this._activeMacro.changes.push(toMacroDocumentChangeEvent(content, e));
  }

  public static register(
    context: vscode.ExtensionContext,
    macroRepository: MacroRepository,
    eventEmitter: EventEmitter
  ) {
    const macroRecorder = new MacroRecorder(macroRepository, eventEmitter);

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
