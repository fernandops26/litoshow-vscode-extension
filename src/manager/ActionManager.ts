import * as vscode from 'vscode';
import { StorageService } from '../providers/StorageService';

export default class ActionManager {
  private _storage: StorageService;
  constructor(storage: StorageService) {
    this._storage = storage;
  }

  public start({}) {}
}
