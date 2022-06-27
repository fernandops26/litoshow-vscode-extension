import { Memento } from 'vscode';

export class StorageService {
  constructor(private storage: Memento) {}

  public getValue<T>(key: string): T {
    return this.storage.get<T>(key, null as any);
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value);
  }

  public keys(): readonly string[] {
    return this.storage.keys();
  }

  public getAll<T>(): T[] {
    return this.storage.get('', {} as any) as T[];
  }

  public reset(): void {
    this.storage.keys().forEach((key) => this.storage.update(key, undefined));
  }

  public remove<T>(key: string) {
    this.storage.update(key, undefined);
  }
}
