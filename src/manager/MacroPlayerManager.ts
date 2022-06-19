import * as vscode from 'vscode';
import { StorageService } from '../providers/StorageService';
import MacroRepository from '../repositories/MacroRepository';
import { v4 as uuid } from 'uuid';
import { EditorProvider } from '../providers/EditorProvider';
import { Macro } from '../types';
import { MacroPlayer } from '../newProviders/MacroPlayer';
import { MacroPlayerViewer } from '../webview/MacroPlayerViewer';
import { EventEmitter } from 'stream';

export default class MacroPlayerManager {
  private _editorProvider: EditorProvider;
  private _extensionUri: vscode.Uri;
  private _eventEmitter: EventEmitter;

  constructor(
    editorProvider: EditorProvider,
    extensionUri: vscode.Uri,
    eventEmitter: EventEmitter
  ) {
    this._editorProvider = editorProvider;
    this._extensionUri = extensionUri;
    this._eventEmitter = eventEmitter;
  }

  public async playMacro(macro: Macro) {
    const player = MacroPlayer.getInstance(
      this._editorProvider,
      this._eventEmitter,
      macro
    );

    MacroPlayerViewer.createOrShow(this._extensionUri, this._eventEmitter);

    await player.play();
  }

  /*private createView(): MacroPlayerViewer {
    //return MacroPlayerViewer.createOrShow(this._extensionUri);
  }*/
}
