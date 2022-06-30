import * as vscode from 'vscode';

export default class MacroStatusBar {
   // create singleton for this class
    private _disposable: vscode.Disposable;
    private static _instance: MacroStatusBar;
    private _statusBarItem: vscode.StatusBarItem;

    public static register(context: vscode.ExtensionContext): MacroStatusBar {
        const statusBar = new MacroStatusBar();

        context.subscriptions.push(statusBar);

        return statusBar;
    }

    private constructor() {
        const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBar.text = '$(testing-run-icon) No selected macro';
        statusBar.command = 'litoshow.selectMacro';
        statusBar.tooltip = 'Choose a macro';

        statusBar.show()
        this._statusBarItem = statusBar
        this._disposable = vscode.Disposable.from();
    }

    public updateMacroName(name: string) {
        this._statusBarItem.text = `$(testing-run-icon) ${name}`;
    }

    dispose() {
        if (this._disposable) {
          this._disposable.dispose();
        }
    }
}