import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { StorageService } from '../providers/StorageService';
import MacroRepository from './../repositories/MacroRepository';
import { EditorProvider } from './../providers/EditorProvider';
import { Macro } from '../types';
import { MacroPlayerViewer } from '../webview/MacroPlayerViewer';
import MacroPlayerManager from '../manager/MacroPlayerManager';

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private _repository: MacroRepository;
  private _macroManager: MacroPlayerManager;
  private _disposable: vscode.Disposable;
  private _data: Macro[] = [];
  private _extensionUri: vscode.Uri;
  //private _textEditorManager: EditorProvider;

  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | void
  > = new vscode.EventEmitter<TreeItem | undefined | void>();

  readonly onDidChangeTreeData?: vscode.Event<
    void | TreeItem | TreeItem[] | undefined
  > = this._onDidChangeTreeData.event;

  constructor(
    repository: MacroRepository,
    macroManager: MacroPlayerManager,
    macroList: Macro[],
    extensionUri: vscode.Uri
  ) {
    this._repository = repository;
    this._macroManager = macroManager;
    this._data = macroList;
    this._extensionUri = extensionUri;
    //this._textEditorManager = textEditorManager;

    let suscriptions: vscode.Disposable[] = [];

    const viewPlayer = vscode.commands.registerCommand(
      'newlitoshow.viewPlayer',
      (stepId) => {
        //MacroPlayerViewer.createOrShow(this._extensionUri);
      }
    );

    const playMacro = vscode.commands.registerCommand(
      'newlitoshow.playMacro',
      async (command) => {
        //vscode.window.showInformationMessage('play... ' + command);
        console.log(command.id);

        const macroToPlay = this._repository.findOne(command.id);

        if (!macroToPlay) {
          vscode.window.showWarningMessage('Macro does not found!');
          return null;
        }

        await this._macroManager.playMacro(macroToPlay);
      }
    );

    const refreshMacro = vscode.commands.registerCommand(
      'newlitoshow.refreshMacro',
      () => {
        vscode.window.showInformationMessage('refresh');
        this.refresh();
      }
    );

    const deleteMacro = vscode.commands.registerCommand(
      'newlitoshow.removeMacro',
      (macro) => {
        vscode.window.showInformationMessage('removing... ' + macro.id);
        this._repository.remove(macro.id);
        this.refresh();
      }
    );

    this._disposable = vscode.Disposable.from(
      ...suscriptions,
      viewPlayer,
      refreshMacro,
      deleteMacro,
      playMacro
    );
  }

  onDidChange?: vscode.Event<vscode.Uri> | undefined;

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
    //const macros: Macro[] = this._repository.findAll();

    if (element == undefined) {
      return this._toTreeItemList(this._data);
    }

    //return element.children;
  }

  public static register(
    context: vscode.ExtensionContext,
    macroManager: MacroPlayerManager
  ) {
    const storage = new StorageService(context.globalState);
    const macroRepository = new MacroRepository(storage);
    const macros: Macro[] = macroRepository.findAll();

    const dataProvider = new TreeDataProvider(
      macroRepository,
      macroManager,
      macros,
      context.extensionUri
    );

    return dataProvider;
  }

  private _toTreeItemList(macros: Macro[]) {
    return macros.map((item) => {
      const command: vscode.Command = {
        title: 'some',
        command: 'newlitoshow.viewPlayer',
        arguments: [item.id],
      };

      return new TreeItem(
        item.id,
        item.name,
        vscode.TreeItemCollapsibleState.None,
        command
      );
    });
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    //this.tooltip = `${this.label}-(${this.fromLine} - ${this.toLine})`;
    //this.description = `(${this.fromLine} - ${this.toLine})`;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'media', 'note.svg'),
    dark: path.join(__filename, '..', '..', 'media', 'note-white.svg'),
  };

  contextValue = this.id;
}
