import { EventEmitter } from 'stream';
import { EditorProvider } from '../providers/EditorProvider';
import { Macro, Observer, Subject } from '../types';
import toVSCode from '../utils/rangeParser';

export class MacroPlayer {
  private static instance: MacroPlayer;
  private _status: string;
  private _textEditorManager: EditorProvider;
  private _macro: Macro;
  private _position: number;
  private _eventEmitter: EventEmitter;

  PLAYING: string = 'playing';
  STOPPED: string = 'stopped';
  PAUSED: string = 'paused';

  constructor(
    textEditorManager: EditorProvider,
    eventEmitter: EventEmitter,
    macro: Macro
  ) {
    this._textEditorManager = textEditorManager;
    this._macro = macro;
    this._position = 0;
    this._status = this.PAUSED;
    this._eventEmitter = eventEmitter;

    this._eventEmitter.on('player:restart', () => this.restart());
    this._eventEmitter.on('player:pause', () => this.pause());
    this._eventEmitter.on('player:play', () => this.play());
    this._eventEmitter.on('player:move-position', (number) =>
      this.moveTo(number)
    );
  }

  async restart() {
    await this.restore();
    await this.play();
  }

  notify(eventType: string): void {
    this._eventEmitter.emit(eventType, {
      status: this._status,
      total: this._macro.changes.length,
      current: this._position,
    });
  }

  public static crateInstance(
    textEditorManager: EditorProvider,
    eventEmitter: EventEmitter,
    macro: Macro
  ) {
    return new MacroPlayer(textEditorManager, eventEmitter, macro);
  }

  public static getInstance(
    textEditorManager: EditorProvider,
    eventEmitter: EventEmitter,
    macro: Macro
  ) {
    if (!MacroPlayer.instance) {
      MacroPlayer.instance = new MacroPlayer(
        textEditorManager,
        eventEmitter,
        macro
      );
    }

    if (MacroPlayer.instance._macro.id !== macro.id) {
      MacroPlayer.instance._position = 0;
      MacroPlayer.instance._status = MacroPlayer.instance.PAUSED;
      MacroPlayer.instance._macro = macro;
    }

    return MacroPlayer.instance;
  }

  async restore() {
    this._position = 0;
    const { currentContent } = this._macro.changes[0];
    const vscodeRange = toVSCode(currentContent.range);

    await this._textEditorManager.clear();
    await this._textEditorManager.setContent(vscodeRange, currentContent.text);
  }

  public async play() {
    if (this._status === this.PLAYING) {
      return;
    }

    this._status = this.PLAYING;
    await this.replaceByCurrentContext();
    this.notify('status-changed');
    await this.run();
  }

  public pause() {
    this._status = this.PAUSED;
    this.notify('status-changed');
  }

  public async moveTo(position: number) {
    this._status = this.PAUSED;
    this._position = position;

    console.log('moving to... ', position);
    const { currentContent } = this._macro.changes[this._position];

    await this._textEditorManager.clear();
    await this._textEditorManager.setContent(
      toVSCode(currentContent.range),
      currentContent.text
    );
    this.notify('status-changed');
  }

  private async replaceByCurrentContext() {
    const content = await this._textEditorManager.currentContent();

    if (!content) {
      return;
    }

    const { currentContent } = this._macro.changes[this._position];

    await this._textEditorManager.setContent(
      content.range,
      currentContent.text
    );
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
