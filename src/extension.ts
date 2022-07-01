// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarWebview } from './vsProviders/SidebarWebview';
import { EventEmitter } from 'events';
import Recorder from './services/Recorder';
import Trigger from './services/Trigger';
import Player from './services/Player';
import { MacroWebview } from './vsProviders/MacroWebview';
import Storage from './repositories/MacroRepository';
import MacroStatusBar from './vsProviders/MacroStatusBar';

export function activate(context: vscode.ExtensionContext) {
  const eventEmitter = new EventEmitter();
  const macroRepository = Storage.getInstance(context);

  let record = vscode.commands.registerCommand(
    'litoshow.createMacro',
    Recorder.register(context)
  );

  Trigger.register(context, eventEmitter);

  const statusBar = MacroStatusBar.register(context)

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'litoshow-sidebar',
      new SidebarWebview(context.extensionUri, eventEmitter)
    )
  );

  const player = Player.register(context, eventEmitter);

  let select = vscode.commands.registerCommand(
    'litoshow.selectMacro',
    async (data) => {

      let id = data?.id;
      if (id === undefined) {
        const items = macroRepository.list();
        const picked = await vscode.window.showQuickPick(
          items.map((item) => ({id: item.id, label: item.name}))
        );

        if (!picked || !picked.id) {
          vscode.window.showWarningMessage('No macro selected');
          return;
        }

        id = picked.id
      }

      player.select(id);

      const macroSelected = player.getSelectedMacro()
      statusBar.updateMacroName(macroSelected?.name ?? '');

      if (MacroWebview.currentPanel) {
        await vscode.commands.executeCommand('litoshow.openView');
      }
    }
  );

  let openView = vscode.commands.registerCommand('litoshow.openView', () => {
    const macro = player.getSelectedMacro()
    if (macro) {
      MacroWebview.kill();
      MacroWebview.createOrShow(context.extensionUri, eventEmitter, macro.name);
    }
  })

  let remove = vscode.commands.registerCommand(
    'litoshow.removeMacro',
    async (data) => {
      //player.select(data.id);
      // @todo dispose player if macro is selected
      await macroRepository.remove(data.id);
      await vscode.commands.executeCommand('litoshow.updateClientList');
      // remove macro view if selected has been removed -> MacroWebview.kill()
      // deselect if selected has been removed
    }
  );

  let newPlay = vscode.commands.registerCommand('litoshow.playMacro', async () => {
    if (!player.isSelectedMacroName()) {
        const items = macroRepository.list();
        const picked = await vscode.window.showQuickPick(
          items.map((item) => ({id: item.id, label: item.name}))
        , { title: 'Choose a macro to play' });

        if (!picked) {
          vscode.window.showWarningMessage('No macro selected');
          return;
        }

        player.select(picked.id);
        statusBar.updateMacroName(picked.label);
    }

    player.start();
  });

  let restart = vscode.commands.registerCommand('litoshow.restartMacro', () => {
    player.restart();
  });

  let movePosition = vscode.commands.registerCommand(
    'litoshow.moveMacroPosition',
    (data) => {
      player.moveTo(data.position);
    }
  );

  let pause = vscode.commands.registerCommand('litoshow.pauseMacro', () => {
    player.pause();
  });

  let resume = vscode.commands.registerCommand('litoshow.resumeMacro', () => {
    player.resume();
  });

  //let type = vscode.commands.registerCommand('type', Replay.onType);
  context.subscriptions.push(
    openView,
    remove,
    record,
    newPlay,
    select,
    restart,
    movePosition,
    pause,
    resume
  );
}
export function deactivate() {}

// function error handler for the extension
export function errorHandler(error: Error) {
  console.error(error);
}
