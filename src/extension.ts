// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarWebview } from './vsProviders/SidebarWebview';
import { EventEmitter } from 'events';
import Recorder from './services/Recorder';
import Trigger from './services/Trigger';
import Player from './services/Player';
import { MacroWebview } from './vsProviders/MacroWebview';

export function activate(context: vscode.ExtensionContext) {
  const eventEmitter = new EventEmitter();

  let record = vscode.commands.registerCommand(
    'newlitoshow.createMacro',
    Recorder.register(context)
  );

  Trigger.register(context, eventEmitter);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'litoshow-sidebar',
      new SidebarWebview(context.extensionUri, eventEmitter)
    )
  );

  const player = Player.register(context, eventEmitter);

  let select = vscode.commands.registerCommand(
    'litoshow.selectMacro',
    (data) => {
      player.select(data.id);
      MacroWebview.createOrShow(context.extensionUri, eventEmitter, data.id);
    }
  );

  let deselect = vscode.commands.registerCommand(
    'litoshow.deselectMacro',
    () => {
      player.deselect();
    }
  );

  let newPlay = vscode.commands.registerCommand('litoshow.playMacro', () => {
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

  //let type = vscode.commands.registerCommand('type', Replay.onType);
  context.subscriptions.push(
    record,
    newPlay,
    select,
    deselect,
    restart,
    movePosition,
    pause
  );
}
export function deactivate() {}

// function error handler for the extension
export function errorHandler(error: Error) {
  console.error(error);
}
