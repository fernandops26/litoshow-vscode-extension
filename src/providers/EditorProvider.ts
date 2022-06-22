import * as vscode from 'vscode';

export class EditorProvider {
  private _editor: vscode.TextEditor | undefined;

  constructor() {
    this._editor = vscode.window.visibleTextEditors[0];
  }

  public getState() {
    return {
      document: this.currentDocument(),
      content: this.currentContent(),
    };
  }

  public currentDocument(): vscode.TextDocument | undefined {
    return this._editor?.document;
  }

  public currentContent(): { range: vscode.Range; text: string } | null {
    const editor = this._editor;

    if (!editor) {
      return null;
    }

    const doc = editor.document;

    const totalLines = doc.lineCount;
    const firstLine = doc.lineAt(0);
    const lastLine = doc.lineAt(totalLines - 1);

    const range = new vscode.Range(firstLine.range.start, lastLine.range.end);
    const text = doc.getText(range);

    return { range, text };
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
    if (!this._editor) {
      return '';
    }

    await this._editor.edit((builder: vscode.TextEditorEdit) => {
      builder.replace(range, text);
    });
  }

  public async insertContent(position: vscode.Position, text: string) {
    if (!this._editor) {
      return;
    }

    await this._editor?.edit((builder: vscode.TextEditorEdit) => {
      builder.insert(position, text);
    });
  }

  public async clear() {
    const content = this.currentContent();

    const doc = this._editor;
    if (!doc || !content) {
      return '';
    }

    await this._editor?.edit((builder: vscode.TextEditorEdit) => {
      builder.delete(content.range);
    });
  }

  private isActiveEditor(): boolean {
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
