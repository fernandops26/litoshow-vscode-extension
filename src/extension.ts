// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HelloWorldPanel } from './HelloWorldPanel';
import { HighlightProvider } from './HighlightProvider';
import { MacroRecorder } from './newProviders/MacroRecorder';
import { SidebarProvider } from './providers/SidebarProvider';
import { TreeDataProvider } from './newProviders/TreeDataProvider';
import { MacroPlayerViewer } from './webview/MacroPlayerViewer';
import MacroPlayerManager from './manager/MacroPlayerManager';
import { StorageService } from './providers/StorageService';
import MacroRepository from './repositories/MacroRepository';
import { EditorProvider } from './providers/EditorProvider';

export function activate(context: vscode.ExtensionContext) {
  const storage = new StorageService(context.globalState);
  const macroRepository = new MacroRepository(storage);
  const editorProvider = new EditorProvider();

  const macroManager = new MacroPlayerManager(
    macroRepository,
    editorProvider,
    context.extensionUri
  );

  const treeProvider = TreeDataProvider.register(
    context,
    macroRepository,
    macroManager
  );

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('litoshow-tree', treeProvider)
  );

  /*context.subscriptions.push(
    vscode.commands.registerCommand('newlitoshow.viewPlayer', () => {
      MacroPlayerViewer.createOrShow(context.extensionUri);
    })
  );*/

  MacroRecorder.register(context, macroRepository, treeProvider);

  /*const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'litoshow-sidebar',
      sidebarProvider
    )
  );*/

  //HelloWorldPanel.createOrShow(context.extensionUri);
}
// export function activate(context: vscode.ExtensionContext) {
//   console.log('Congratulations, your extension "newlitoshow" is now active!');

//context.globalState.update('codeLenses', []);

// const sidebarProvider = new SidebarProvider(context.extensionUri);

// const statusBar = vscode.window.createStatusBarItem(
//   vscode.StatusBarAlignment.Right
// );
// statusBar.text = '$(beaker) Play';
// statusBar.command = 'newlitoshow.testStatus';
// statusBar.show();

// context.subscriptions.push(
//   vscode.window.registerWebviewViewProvider(
//     'litoshow-sidebar',
//     sidebarProvider
//   )
// );

// context.subscriptions.push(
//   vscode.commands.registerCommand('newlitoshow.testStatus', () => {
//     const { activeTextEditor } = vscode.window;

//     if (!activeTextEditor) {
//       vscode.window.showErrorMessage('No active Editor!');
//       return;
//     }

//     const start = activeTextEditor.selection.start.line;
//     const end = activeTextEditor.selection.end.line;

//     const list: Array<any> = context.globalState.get('codeLenses') ?? [];

//     context.globalState.update('codeLenses', [
//       ...list,
//       {
//         startLine: start,
//         endLine: end,
//       },
//     ]);

//     const range = new vscode.Range(
//       activeTextEditor.selection.start,
//       activeTextEditor.selection.end
//     );

//     const bgRed = vscode.window.createTextEditorDecorationType({
//       border: 'solid 2px #dddddd',
//       after: {
//         border: 'solid 4px #eefefe',
//       },
//     });

//     //const text = activeTextEditor.document.getText(range);

//     const decorations: vscode.DecorationOptions[] = [];
//     const decoration = { range: range, hoverMessage: 'Number ** **' };
//     decorations.push(decoration);

//     activeTextEditor.setDecorations(bgRed, decorations);

//     sidebarProvider._view?.webview.postMessage({
//       type: 'add-step',
//       value: {
//         startLine: start,
//         endLine: end,
//       },
//     });
//   })
// );

// context.subscriptions.push(
//   vscode.commands.registerCommand('newlitoshow.helloWorld', () => {
//     HelloWorldPanel.createOrShow(context.extensionUri);
//   })
// );

// context.subscriptions.push(
//   vscode.commands.registerCommand('newlitoshow.refreshWebviews', async () => {
//     // HelloWorldPanel.kill();
//     // HelloWorldPanel.createOrShow(context.extensionUri);
//     await vscode.commands.executeCommand('workbench.action.closeSidebar');
//     await vscode.commands.executeCommand(
//       'workbench.view.extension.litoshow-sidebar-view'
//     );
//     setTimeout(
//       () =>
//         vscode.commands.executeCommand(
//           'workbench.action.webview.openDeveloperTools'
//         ),
//       500
//     );
//   })
// );

// context.subscriptions.push(
//   vscode.languages.registerDocumentHighlightProvider(
//     '*',
//     new HighlightProvider(context)
//   )
// );
// }
// this method is called when your extension is deactivated
export function deactivate() {}
