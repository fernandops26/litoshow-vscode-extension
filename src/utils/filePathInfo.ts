import path from 'path';
import fs from 'fs';
import * as vscode from 'vscode';

export default function getInfoOf(file: string) {
  const fileInfo = path.parse(file);
  return {
    name: fileInfo.name,
    extension: fileInfo.ext,
    dir: fileInfo.dir,
    base: fileInfo.base,
    full: fileInfo.base,
  };
}

// 1. receive the filepath(string) as paramenter
// 2. filter the file path that match in vscode.workspaces path list
export function getRelativeFilePath(filePath: string) {
  const workspaces = vscode.workspace.workspaceFolders || [];

  const workspaceFound = workspaces.find((workspace) =>
    filePath.startsWith(workspace.uri.fsPath)
  );

  if (!workspaceFound) {
    return '';
  }

  return filePath.replace(workspaceFound.uri.fsPath, '');
}
