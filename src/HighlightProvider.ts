import * as vscode from 'vscode';

export class HighlightProvider implements vscode.DocumentHighlightProvider {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    vscode.workspace.onDidChangeTextDocument((_) => {
      console.log('change');
      //this._onDidChangeCodeLenses.fire();
    });

    vscode.window.onDidChangeWindowState(console.log);
  }

  provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentHighlight[]> {
    //const { activeTextEditor } = vscode.window;

    //if (!activeTextEditor) {
    //  vscode.window.showErrorMessage('No active Editor!');
    //return;
    //}

    //document.positionAt(1);

    const list = [];

    const range = new vscode.Range(position, position);

    const item = new vscode.DocumentHighlight(
      range,
      vscode.DocumentHighlightKind.Read
    );

    list.push(item);

    return list;
  }
}
