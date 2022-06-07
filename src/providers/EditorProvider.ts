import * as vscode from 'vscode';

export class EditorProvider {
  private _editor: vscode.TextEditor | undefined;

  constructor() {
    this._editor = vscode.window.visibleTextEditors[0];
  }

  public currentContent() {
    if (!this.isActiveEditor()) {
      return '';
    }

    const text = this._editor?.document.getText() || '';
    const lines = text.split('\n');

    const range = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(lines?.length - 1, lines[lines?.length - 1].length)
    );

    return [range, text];
  }

  public selectedText() {
    if (!this.isActiveEditor()) {
      return '';
    }

    return this._editor?.document.getText(this._editor.selection);
  }

  public selectedRange(): vscode.Range | vscode.Selection | undefined {
    if (!this.isActiveEditor()) {
      return undefined;
    }

    return this._editor?.selection;
  }

  public async setContent(
    range: vscode.Range | vscode.Selection,
    text: string
  ) {
    if (!this.isActiveEditor()) {
      return '';
    }

    await this._editor?.edit((builder: vscode.TextEditorEdit) => {
      /*console.group('initial');
      console.log('range: ', range);
      console.log('text: ', text);
      console.groupEnd();*/
      builder.replace(range, text);
    });
  }

  public async insertContent(position: vscode.Position, text: string) {
    if (!this.isActiveEditor()) {
      return '';
    }

    await this._editor?.edit((builder: vscode.TextEditorEdit) => {
      builder.insert(position, text);
    });
  }

  public async clear() {
    if (!this.isActiveEditor()) {
      return '';
    }

    const text = this._editor?.document.getText() ?? '';
    const lines = text.split('\n');

    const range = new vscode.Range(0, 0, lines.length - 1, lines[0].length);

    await this._editor?.edit((builder: vscode.TextEditorEdit) => {
      builder.delete(range);
    });
  }

  private isActiveEditor() {
    return this._editor !== undefined;
  }

  public decorateText(range: vscode.Range | vscode.Selection) {
    const bgRed = vscode.window.createTextEditorDecorationType({
      border: 'solid 2px #dddddd',
      after: {
        border: 'solid 4px #eefefe',
      },
    });

    const decorations: vscode.DecorationOptions[] = [];
    const decoration = {
      range: range,
      hoverMessage: 'Number ** **',
      after: true,
    };
    decorations.push(decoration);

    this._editor?.setDecorations(bgRed, decorations);
  }
}
