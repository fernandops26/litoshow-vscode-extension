import { Memento } from 'vscode';

export class StorageService {
  constructor(private storage: Memento) {}

  public getValue<T>(key: string): T {
    return this.storage.get<T>(key, null as any);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }
}
