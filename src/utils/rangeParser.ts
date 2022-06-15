import * as vscode from 'vscode';
import { DocumentContentRange } from '../types';

export default function toVSCode(range: DocumentContentRange): vscode.Range {
  return new vscode.Range(
    new vscode.Position(range.start.line, range.start.character),
    new vscode.Position(range.end.line, range.end.character)
  );
}
