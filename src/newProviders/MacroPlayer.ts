import * as vscode from 'vscode';
import { EditorProvider } from '../providers/EditorProvider';
import MacroRepository from '../repositories/MacroRepository';
import { Macro, Observer, Subject } from '../types';

type ObserverRegister = {
  [eventType: string]: Observer[];
};

export class MacroPlayer implements Subject {
  private static instance: MacroPlayer;
  private _status: string;
  private _macroRepository: MacroRepository;
  private _textEditorManager: EditorProvider;
  private _macro: Macro;
  private _position: number;
  private _observers: ObserverRegister = {};

  PLAYING: string = 'playing';
  STOPPED: string = 'stopped';
  PAUSED: string = 'paused';

  constructor(
    macroRepository: MacroRepository,
    textEditorManager: EditorProvider,
    macro: Macro
  ) {
    this._macroRepository = macroRepository;
    this._textEditorManager = textEditorManager;
    this._macro = macro;
    this._position = 0;
    this._status = this.STOPPED;
  }

  // who whan observe changes
  attach(eventType: string, observer: Observer): void {
    console.log('attached');
    if (!this._observers[eventType]) {
      this._observers[eventType] = [];
    }

    this._observers[eventType].push(observer);
  }

  detach(eventType: string, observer: Observer): void {
    if (!this._observers[eventType]) {
      return;
    }

    const observerIndex = this._observers[eventType].indexOf(observer);
    if (observerIndex === -1) {
      return console.log('Subject: Nonexistent observer.');
    }

    this._observers[eventType].splice(observerIndex, 1);
  }

  notify(eventType: string): void {
    console.log('nitify');
    if (!this._observers[eventType]) {
      console.log('no found event');
      return;
    }

    for (let observer of this._observers[eventType]) {
      console.log('updating');
      observer.update({
        status: this._status,
        total: this._macro.changes?.length || 0,
        current: this._position,
      });
    }
  }

  public static getInstance(
    macroRepository: MacroRepository,
    textEditorManager: EditorProvider,
    macro: Macro
  ) {
    if (!MacroPlayer.instance) {
      MacroPlayer.instance = new MacroPlayer(
        macroRepository,
        textEditorManager,
        macro
      );
    }

    return MacroPlayer.instance;
  }

  public async play() {
    if (this._status === this.PLAYING) {
      return;
    }

    const state = this._macro.initialState;
    const newRange = new vscode.Range(
      new vscode.Position(state.range[0].line, state.range[0].character),
      new vscode.Position(state.range[1].line, state.range[1].character)
    );

    await this._textEditorManager.clear();
    await this._textEditorManager.setContent(
      newRange,
      this._macro.initialState.text
    );

    this._position = 0;
    this._status = this.PLAYING;
    this.notify('status-changed');
    this.run();
  }

  private pause() {
    this._status = this.PAUSED;
  }

  private run() {
    const changes = this._macro.changes || [];

    const self = this;

    (function me(i) {
      if (self._status === self.PAUSED) {
        return;
      }

      setTimeout(async () => {
        // your code handling here
        console.log(changes[i]);
        if (i <= changes.length - 1) {
          self.notify('status-changed');
          await self.next(i);
          self._position++;
          me(self._position); // self anonymous function recursivally
        } else {
          self._status = self.STOPPED;
          self.notify('status-changed');
        }
      }, 100);
    })(this._position);
  }

  public async next(position: number): Promise<any> {
    const changes = this._macro.changes || [];

    if (position > changes.length - 1) {
      return;
    }

    // @todo append change, in some moment we need to check if is and undo, remove, replace to know how reflec it in the editor

    const contentChanges = changes[position].contentChanges;

    if (contentChanges.length === 0) {
      return;
    }

    const selectedChange = changes[position].contentChanges[0];
    const vsCodePosition = new vscode.Position(
      selectedChange.range[0].line,
      selectedChange.range[0].character
    );

    await this._textEditorManager.insertContent(
      vsCodePosition,
      selectedChange.text
    );
  }

  public previous() {}
}
