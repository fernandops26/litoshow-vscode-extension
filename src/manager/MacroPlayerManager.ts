import * as vscode from 'vscode';
import { StorageService } from '../providers/StorageService';
import MacroRepository from '../repositories/MacroRepository';
import { v4 as uuid } from 'uuid';
import { EditorProvider } from '../providers/EditorProvider';
import { Macro } from '../types';
import { MacroPlayer } from '../newProviders/MacroPlayer';
import { MacroPlayerViewer } from '../webview/MacroPlayerViewer';

export default class MacroPlayerManager {
  private _macroRepository: MacroRepository;
  private _editorProvider: EditorProvider;
  private _extensionUri: vscode.Uri;

  constructor(
    macroRepository: MacroRepository,
    editorProvider: EditorProvider,
    extensionUri: vscode.Uri
  ) {
    this._macroRepository = macroRepository;
    this._editorProvider = editorProvider;
    this._extensionUri = extensionUri;
  }

  public async playMacro(macro: Macro) {
    const player = MacroPlayer.getInstance(
      this._macroRepository,
      this._editorProvider,
      macro
    );

    const view = MacroPlayerViewer.createOrShow(this._extensionUri);
    player.attach('status-changed', view);

    await player.play();
  }

  /*private createView(): MacroPlayerViewer {
    //return MacroPlayerViewer.createOrShow(this._extensionUri);
  }*/
}
