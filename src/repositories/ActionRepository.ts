import { StorageService } from '../providers/StorageService';

export default class ActionRepository {
  private _storage: StorageService;
  private _key = 'actions';

  constructor(storage: StorageService) {
    this._storage = storage;
  }

  public findAll(): Array<any> {
    return this._storage.getValue(this._key);
  }

  public findOne(id: string) {
    const all = this.findAll();

    return all.find((item) => item.id === id);
  }

  public saveOne(one: any) {
    const all = this.findAll();

    all.push(one);

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
}
