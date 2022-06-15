import { EventEmitter } from 'stream';
import { EditorProvider } from '../providers/EditorProvider';
import MacroRepository from '../repositories/MacroRepository';
import { Macro, Observer, Subject } from '../types';
import toVSCode from '../utils/rangeParser';

type ObserverRegister = {
  [eventType: string]: Observer[];
};

export class MacroPlayer {
  private static instance: MacroPlayer;
  private _status: string;
  private _macroRepository: MacroRepository;
  private _textEditorManager: EditorProvider;
  private _macro: Macro;
  private _position: number;
  private _eventEmitter: EventEmitter;

  PLAYING: string = 'playing';
  STOPPED: string = 'stopped';
  PAUSED: string = 'paused';

  constructor(
    macroRepository: MacroRepository,
    textEditorManager: EditorProvider,
    eventEmitter: EventEmitter,
    macro: Macro
  ) {
    this._macroRepository = macroRepository;
    this._textEditorManager = textEditorManager;
    this._macro = macro;
    this._position = 0;
    this._status = this.STOPPED;
    this._eventEmitter = eventEmitter;
  }

  notify(eventType: string): void {
    this._eventEmitter.emit(eventType, {
      status: this._status,
      total: this._macro.changes.length,
      current: this._position,
    });
  }

  public static getInstance(
    macroRepository: MacroRepository,
    textEditorManager: EditorProvider,
    eventEmitter: EventEmitter,
    macro: Macro
  ) {
    if (!MacroPlayer.instance) {
      MacroPlayer.instance = new MacroPlayer(
        macroRepository,
        textEditorManager,
        eventEmitter,
        macro
      );
    }

    MacroPlayer.instance._macro = macro;

    return MacroPlayer.instance;
  }

  public async play() {
    if (this._status === this.PLAYING) {
      return;
    }

    const { currentContent } = this._macro.changes[0];
    const vscodeRange = toVSCode(currentContent.range);

    await this._textEditorManager.clear();
    await this._textEditorManager.setContent(vscodeRange, currentContent.text);

    this._position = 0;
    this._status = this.PLAYING;
    this.notify('status-changed');
    this.run();
  }

  private pause() {
    this._status = this.PAUSED;
  }

  private moveTo(position: number) {
    this._status = this.PAUSED;
    this._position = position;
  }

  private run() {
    const changes = this._macro.changes;

    const self = this;

    (function me(i) {
      if (self._status === self.PAUSED) {
        return;
      }

      setTimeout(async () => {
        // your code handling here
        if (i <= changes.length - 1) {
          self.notify('status-changed');
          await self.next(i);
          self._position++;
          me(self._position); // self anonymous function recursivally
        } else {
          self._status = self.STOPPED;
          self.notify('status-changed');
        }
      }, 50);
    })(this._position);
  }

  public async next(position: number): Promise<any> {
    const changes = this._macro.changes;

    if (position > changes.length - 1) {
      return;
    }

    // @todo append change, in some moment we need to check if is and undo, remove, replace to know how reflec it in the editor

    const contentChanges = changes[position].contentChanges;

    if (contentChanges.length === 0) {
      return;
    }

    for (let change of contentChanges) {
      const vsCodeRange = toVSCode(change.range);

      await this._textEditorManager.setContent(vsCodeRange, change.text);
    }
  }

  public previous() {}
}
