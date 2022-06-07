import * as vscode from 'vscode';

type Step = {
  startLine: number;
  endLine: number;
};

export class CodelensProvider implements vscode.CodeLensProvider {
  private context: vscode.ExtensionContext;
  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
    new vscode.EventEmitter<void>();

  public readonly onDidChangeCodeLenses: vscode.Event<void> =
    this._onDidChangeCodeLenses.event;

  constructor(context: vscode.ExtensionContext) {
    console.log('constructor');
    this.regex = /(.+)/g;
    this.context = context;

    vscode.workspace.onDidChangeConfiguration((_) => {
      console.log('change');
      //this._onDidChangeCodeLenses.fire();
    });

    vscode.window.onDidChangeWindowState(console.log);
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    console.log('provide');

    const codeLens: Array<Step> =
      this.context.globalState.get('codeLenses') ?? [];

    this.codeLenses = codeLens.map((codeLen: Step, index) => {
      const range = new vscode.Range(
        new vscode.Position(codeLen.startLine, 10),
        new vscode.Position(codeLen.endLine, 0)
      );

      const codeLensItem = new vscode.CodeLens(range);
      codeLensItem.command = {
        title: 'Step' + (index + 1),
        tooltip: 'Step' + (index + 1),
        command: 'newlitoshow.codelensAction',
      };

      return codeLensItem;
    });
    /*const regex = new RegExp(this.regex);
    const text = document.getText();
    let matches;
    while ((matches = regex.exec(text)) !== null) {
      const line = document.lineAt(document.positionAt(matches.index).line);
      const indexOf = line.text.indexOf(matches[0]);
      const position = new vscode.Position(line.lineNumber, indexOf);
      const range = document.getWordRangeAtPosition(
        position,
        new RegExp(this.regex)
      );

      if (range) {
        this.codeLenses.push(new vscode.CodeLens(range));
      }
    }*/

    return this.codeLenses;
  }

  /*public resolveCodeLens(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ) {
    console.log('resolve');
    codeLens.command = {
      title: 'Codelens provided by sample extension',
      tooltip: 'Tooltip provided by sample extension',
      command: 'newlitoshow.codelensAction',
      arguments: ['Argument 1', false],
    };

    return codeLens;
  }*/
}
