import * as vscode from 'vscode';
import { StorageService } from './StorageService';

type Step = {
  range: vscode.Range;
  text: string;
  id: string;
};

export class CodelensProvider implements vscode.CodeLensProvider {
  private _storage: StorageService;

  constructor(storage: StorageService) {
    this._storage = storage;
  }

  onDidChangeCodeLenses?: vscode.Event<void> | undefined;
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLens: Array<Step> = this._storage.getValue('steps') ?? [];

    return codeLens.map((codeLen: Step, index) => {
      const codeLensItem = new vscode.CodeLens(codeLen.range);
      codeLensItem.command = {
        title: 'Step' + (index + 1),
        tooltip: 'Step' + (index + 1),
        command: 'newlitoshow.codelensAction',
      };

      return codeLensItem;
    });
  }
}
