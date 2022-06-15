import { EventEmitter } from 'stream';
import * as vscode from 'vscode';
import { getNonce } from '../getNonce';
import { Observer, StatusUpdate } from '../types';

//import HelloWorldView from '../webviews/pages/HelloWorldView';
//import ReactDOMServer from 'react-dom/server';
//import React from 'react';

export class MacroPlayerViewer implements Observer {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */

  public static currentPanel: MacroPlayerViewer | undefined;

  public static readonly viewType = 'macro-player-viewer';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _eventEmitter: EventEmitter;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    eventEmitter: EventEmitter
  ) {
    const column = undefined; /*vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;*/

    // If we already have a panel, show it.
    if (MacroPlayerViewer.currentPanel) {
      MacroPlayerViewer.currentPanel._panel.reveal(column);
      MacroPlayerViewer.currentPanel._update();

      return MacroPlayerViewer.currentPanel;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      MacroPlayerViewer.viewType,
      'Macro viewer',
      column || vscode.ViewColumn.Two,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'out'),
        ],
      }
    );

    MacroPlayerViewer.currentPanel = new MacroPlayerViewer(
      panel,
      extensionUri,
      eventEmitter
    );

    return MacroPlayerViewer.currentPanel;
  }

  public static kill() {
    MacroPlayerViewer.currentPanel?.dispose();
    MacroPlayerViewer.currentPanel = undefined;
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    eventEmitter: EventEmitter
  ) {
    MacroPlayerViewer.currentPanel = new MacroPlayerViewer(
      panel,
      extensionUri,
      eventEmitter
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    eventEmitter: EventEmitter
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._eventEmitter = eventEmitter;
    this._panel.webview.options = {
      enableScripts: true,
    };

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._eventEmitter.on('status-changed', (status) => {
      this._panel?.webview.postMessage({
        type: 'update-status',
        value: status,
      });
    });

    // // Handle messages from the webview
    // this._panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     switch (message.command) {
    //       case "alert":
    //         vscode.window.showErrorMessage(message.text);
    //         return;
    //     }
    //   },
    //   null,
    //   this._disposables
    // );
  }

  public update(status: StatusUpdate): void {
    //console.log('update received: ', status);
    /*this._panel?.webview.postMessage({
      type: 'update-status',
      value: status,
    });*/
  }

  public dispose() {
    MacroPlayerViewer.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      console.log('data: ', data);
      switch (data.type) {
        case 'move-position': {
          console.log('value received: ', data.value);
          break;
        }
        case 'onInfo': {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case 'onError': {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        // case 'tokens': {
        //   await Util.globalState.update(accessTokenKey, data.accessToken);
        //   await Util.globalState.update(refreshTokenKey, data.refreshToken);
        //   break;
        // }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'MacroPlayer.js')
    );

    // Local path to css styles

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'styles.css')
    );
    // const cssUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/swiper.css')
    // );

    // // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
        <head>
          <meta charset="UTF-8">
          <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
          -->
          <!--<meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">-->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${stylesResetUri}" rel="stylesheet">
          <link href="${stylesMainUri}" rel="stylesheet">
          <script nonce="${nonce}">
            const tsvscode = acquireVsCodeApi();
          </script>
        </head>
        <body></body>
        <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
	</html>`;
  }
}
