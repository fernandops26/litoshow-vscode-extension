import * as vscode from 'vscode'

// get config from vscode
export async function getConfig(key: string): Promise<any> {
  return vscode.workspace.getConfiguration().get(key);
}

//update config in vscode
export function setConfig(key: string, value: any): void {
    vscode.workspace.getConfiguration().update(key, value, vscode.ConfigurationTarget.Global);
}