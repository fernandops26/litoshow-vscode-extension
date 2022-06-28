import path from 'path';
import * as vscode from 'vscode';
import { ensureFilepath } from './ensureFile';

export async function getEditor(
  workspaceFolderPath: string | undefined,
  fsPath: string
) {
  const filePath = path.join(workspaceFolderPath || '', fsPath);

  let editor = getActiveEditorIfMatch(filePath);

  if (!editor) {
    editor = findOnVisibleEditors(filePath);
  }

  if (!editor) {
    ensureFilepath(filePath);
    const document = await vscode.workspace.openTextDocument(filePath);
    editor = await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Active,
    });
  }

  return editor;
}

const findOnVisibleEditors = (
  filePath: string
): vscode.TextEditor | undefined => {
  return vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.fsPath === filePath
  );
};

const getActiveEditorIfMatch = (
  filePath: string
): vscode.TextEditor | undefined => {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && activeEditor.document.uri.fsPath === filePath) {
    return activeEditor;
  }

  return undefined;
};
