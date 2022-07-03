import * as vscode from 'vscode';
import { EventEmitter } from 'stream';
import { getNonce } from './../getNonce';

export class SidebarWebview implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _eventEmitter: EventEmitter
  ) {
    this._eventEmitter.on('client:updateMacroList', (data) => {
      this._view?.webview.postMessage({
        type: 'updateMacroList',
        value: data,
      });
    });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

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
      switch (data.type) {
        case 'requestMacroList': {
          vscode.commands.executeCommand('litoshow.updateClientList');
          break;
        }
        case 'selectMacro': {
          await vscode.commands.executeCommand('litoshow.selectMacro', {
            id: data.data.macroId,
          });
          await vscode.commands.executeCommand('litoshow.openView');
          break;
        }
        case 'removeMacro': {
          await vscode.commands.executeCommand('litoshow.removeMacro', {
            id: data.data.macroId,
          });
          break;
        }
        case 'onError': {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
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
      vscode.Uri.joinPath(this._extensionUri, 'out', 'Sidebar.js')
    );

    // const styleMainUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/sidebar.css')
    // );

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
