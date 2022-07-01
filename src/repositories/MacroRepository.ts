import * as vscode from 'vscode';
//import * as Cache from 'vscode-cache';
import { StorageService } from '../providers/StorageService';
import { Buffer } from '../services/BufferManager';
import { SerializedBuffer, rehydrateBuffer } from '../utils/rehydrate';

const MACROS = 'litoshow.macros';

type Metadata = {
  id: string;
  name: string;
  description: string;
};

export type Macro = Metadata & {
  buffers: Buffer[];
};

/*
  Stores macros in a persistent caches, where
  - Individual buffers are stored in in namespace ${MACROS}
*/
export default class MacroRepository {
  // Singleton because we need ExtensionContext to initialize
  // a cache, and we can only do it upon activation, but we also
  // only want to initialize it once  ¯\_(ツ)_/¯
  private static _instance: MacroRepository | undefined;
  public static getInstance(context: vscode.ExtensionContext) {
    if (MacroRepository._instance) {
      return MacroRepository._instance;
    }

    return (MacroRepository._instance = new MacroRepository(context));
  }

  private _macros: StorageService;
  // replace private var using vscode.context

  private constructor(context: vscode.ExtensionContext) {
    const macros = new StorageService(context.globalState);

    //macros.reset();

    this._macros = macros;
  }

  /**
   * List all metadata items
   */
  public list(): Macro[] {
    return this._macros.getValue(MACROS) || [];
  }

  /**
   * Get full macro metadata and buffers by name
   * @param name Get
   */
  public getByName(name: string): Macro {
    const all = this.list();

    const found = all.find((item) => item.name === name) as Macro;
    const buffers: Array<any> = found.buffers;

    return {
      ...(found as Macro),
      buffers: buffers.map(rehydrateBuffer) || [],
    };
  }

  public getById(id: string): Macro {
    const all = this.list();

    const found = all.find((item) => item.id === id) as Macro;
    const buffers: Array<any> = found.buffers;

    return {
      ...(found as Macro),
      buffers: buffers.map(rehydrateBuffer) || [],
    };
  }

  /**
   * Saves the given macro
   * @param macro Macro metadata and buffers to store
   */
  public save(macro: Macro): Promise<Macro> {
    const { buffers, ...metadata } = macro;
    const list = this.list();

    list.push({
      ...metadata,
      buffers: JSON.parse(JSON.stringify(buffers)),
    });

    const operations = [this._macros.setValue(MACROS, list)];

    return Promise.all(operations).then(() => {
      console.log('saving: ', macro);
      return macro;
    });
  }

  public remove(name: string): void {
    const list = this.list();

    const index = list.findIndex((item) => item.name === name);

    list.splice(index, 1);

    this._macros.setValue(MACROS, list);
  }
}
