import * as vscode from 'vscode';
import { EventEmitter } from 'stream';
import Storage from '../repositories/MacroRepository';

export default class Trigger {
  private _disposable: vscode.Disposable;
  private _storage: Storage;
  private _eventEmitter: EventEmitter;

  public static register(
    context: vscode.ExtensionContext,
    eventEmitter: EventEmitter
  ) {
    const trigger = new Trigger(Storage.getInstance(context), eventEmitter);
    context.subscriptions.push(trigger);
  }

  constructor(storage: Storage, eventEmitter: EventEmitter) {
    this._storage = storage;
    this._eventEmitter = eventEmitter;

    const updateList = vscode.commands.registerCommand(
      'litoshow.updateClientList',
      this.updateClientList,
      this
    );

    this._disposable = vscode.Disposable.from(updateList);
  }

  updateClientList() {
    this._eventEmitter.emit('client:updateMacroList', {
      macros: this._storage.list(),
    });
  }

  dispose() {
    if (this._disposable) {
      this._disposable.dispose();
    }
  }
}
