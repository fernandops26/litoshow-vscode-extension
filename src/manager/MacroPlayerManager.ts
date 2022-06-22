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
  private _macroPlayer: MacroPlayer | undefined;

  constructor(
    editorProvider: EditorProvider,
    extensionUri: vscode.Uri,
    eventEmitter: EventEmitter
  ) {
    this._editorProvider = editorProvider;
    this._extensionUri = extensionUri;
    this._eventEmitter = eventEmitter;

    this._eventEmitter.on('player:restart', () => this.restart());
    this._eventEmitter.on('player:pause', () => this.pause());
    this._eventEmitter.on('player:play', () => this.play());
    this._eventEmitter.on('player:move-position', (number) =>
      this.moveTo(number)
    );
  }

  private restart() {
    console.log('restart');
    this._macroPlayer?.restart();
  }

  private pause() {
    console.log('pause');
    this._macroPlayer?.pause();
  }

  private play() {
    console.log('play');
    this._macroPlayer?.play();
  }

  private moveTo(number: number) {
    console.log('move to');
    this._macroPlayer?.moveTo(number);
  }

  public async openPlayer(macro: Macro) {
    this._macroPlayer = MacroPlayer.getInstance(
      this._editorProvider,
      this._eventEmitter,
      macro
    );

    // @todo I think we should listen and push events of each player

    MacroPlayerViewer.currentPanel?.dispose();
    MacroPlayerViewer.createOrShow(
      this._extensionUri,
      this._eventEmitter,
      macro.name
    );
  }

  /*private createView(): MacroPlayerViewer {
    //return MacroPlayerViewer.createOrShow(this._extensionUri);
  }*/
}
