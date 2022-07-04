import * as vscode from 'vscode';
import { EventEmitter } from 'stream';
import { getNonce } from './../getNonce';
import { formatStopPointList } from '../utils/getStopPointsList';
import { StopPoint } from '../services/BufferManager';

export class MacroStopPointsWebview implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  private _stopPoints: Array<StopPoint> = [];

  public static register(context: vscode.ExtensionContext, eventEmitter: EventEmitter): MacroStopPointsWebview {
    const provider = new MacroStopPointsWebview(
      context.extensionUri,
      eventEmitter
    );

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(
        'litoshow-macro-stop-points-webview',
        provider
      )
    );

    return provider;
  }

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _eventEmitter: EventEmitter
  ) {
    this._eventEmitter.on('status-changed', (status) => {
        this._view?.webview.postMessage({
          type: 'update-status',
          value: status,
        });
    });
  }

  public async updateStopPointList(stopPoints: Array<any>) {
    this._stopPoints = stopPoints;
    this.sendCurrentStopPointToView();
  }

  private sendCurrentStopPointToView() {
    this._view?.webview.postMessage({
      type: 'updateStopPointList',
      value: formatStopPointList(this._stopPoints),
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    this._view?.onDidChangeVisibility(() => this.sendCurrentStopPointToView());

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'out'),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {}
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );

    const stylesResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );
    const stylesMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'styles.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'StopPoints.js')
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${stylesResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${stylesMainUri}" rel="stylesheet">
            <script nonce="${nonce}">
                const tsvscode = acquireVsCodeApi();
            </script>
        </head>
        <body>
        </body>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
    </html>`;
  }
}
