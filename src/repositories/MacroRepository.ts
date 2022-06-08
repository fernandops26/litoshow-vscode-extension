import { StorageService } from '../providers/StorageService';
import { Macro } from '../types';

export default class MacroRepository {
  private _storage: StorageService;
  private _key = 'macros';

  constructor(storage: StorageService) {
    this._storage = storage;
  }

  public findAll(): Array<Macro> {
    return this._storage.getValue(this._key) ?? [];
  }

  public findOne(id: string) {
    const all = this.findAll();

    return all.find((item) => item.id === id);
  }

  public saveOne(one: Macro) {
    console.log('save one...');
    const all = this.findAll();
    console.log('prev all here: ', all);

    all.push(one);
    console.log('final here: ', all);

    this._storage.setValue(this._key, all);
  }

  public updateOne(one: any) {
    const all = this.findAll();

    const found = this.findOne(one.id);

    if (!found) {
      return;
    }

    const index = all.findIndex((item) => item.id === one.id);

    all.splice(index, 1, found);

    this._storage.setValue(this._key, all);
  }

  public remove(id: any) {
    const all = this.findAll();

    const found = this.findOne(id);

    if (!found) {
      return;
    }

    const index = all.findIndex((item) => item.id === id);

    all.splice(index, 1);

    this._storage.setValue(this._key, all);
  }
}
