import { EventEmitter } from 'stream';
import MacroRepository from './../repositories/MacroRepository';
import MacroPlayerManager from './MacroPlayerManager';

export default class MacroLocalManager {
  constructor(
    private readonly _eventEmitter: EventEmitter,
    private readonly _macroRepository: MacroRepository,
    private readonly _macroPlayerManager: MacroPlayerManager
  ) {
    this.attach();
  }

  private attach() {
    this._eventEmitter.on('triggerRefreshMacroList', async () => {
      const list = this._macroRepository.findAll();

      this._eventEmitter.emit('client:updateMacroList', { macros: list });
    });

    //this._eventEmitter.on('')
  }
}
