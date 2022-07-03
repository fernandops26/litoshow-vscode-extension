import EventEmitter from 'events';
import * as vscode from 'vscode';

const NO_INITIATED: string = 'no-initiated';
const PLAYING: string = 'playing';
const STOPPED: string = 'stopped';
const PAUSED: string = 'paused';

export default class MacroStatusBar {
   // create singleton for this class
    //private _disposable: vscode.Disposable;
    // private static _instance: MacroStatusBar;
    private _macroSelectorStatusBar: vscode.StatusBarItem;
    private _playerBarItem: vscode.StatusBarItem;
    private _eventEmitter: EventEmitter;

    public static register(context: vscode.ExtensionContext, eventEmitter: EventEmitter): MacroStatusBar {
        const statusBar = new MacroStatusBar(eventEmitter);
        //context.subscriptions.push(statusBar);

        return statusBar;
    }

    private constructor(eventEmitter: EventEmitter) {
        this._eventEmitter = eventEmitter;

        const macroStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        macroStatusBar.text = '$(list-selection)';
        macroStatusBar.command = 'litoshow.selectMacro';
        macroStatusBar.tooltip = 'Click to choose a macro';
        macroStatusBar.show()
        this._macroSelectorStatusBar = macroStatusBar

        const playerStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        playerStatusBar.hide()
        this._playerBarItem = playerStatusBar

        this._eventEmitter.on('status-changed', (status) => this.updateStatus(status))
    }

    private updateStatus({ status } : { status: string }) {
        if (status === NO_INITIATED) {
            this._playerBarItem.text = '$(play)';
            this._playerBarItem.command = 'litoshow.playMacro';
            this._playerBarItem.show()
        }

        if (status == PLAYING) {
            this._playerBarItem.text = '$(debug-pause)';
            this._playerBarItem.command = 'litoshow.pauseMacro';
            this._playerBarItem.tooltip = 'Pause macro';
            this._playerBarItem.show()
        }

        if (status == PAUSED) {
            this._playerBarItem.text = '$(play)';
            this._playerBarItem.command = 'litoshow.resumeMacro';
            this._playerBarItem.tooltip = 'Resume macro';
            this._playerBarItem.show()
        }

        if (status == STOPPED) {
            this._playerBarItem.text = '$(debug-restart)';
            this._playerBarItem.command = 'litoshow.restartMacro';
            this._playerBarItem.tooltip = 'Restart macro';
            this._playerBarItem.show()
        }
    }

    public updateMacroName(name: string) {
        this._macroSelectorStatusBar.tooltip = `Macro selected: ${name}. Click to change`;
    }

    /*dispose() {
        if (this._disposable) {
          this._disposable.dispose();
        }
    }*/
}