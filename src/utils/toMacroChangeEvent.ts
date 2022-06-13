import * as vscode from 'vscode';
import {
  MacroChangeEvent,
  MacroDocumentContentChange,
  DocumentChangeRange,
  InititalMacroState,
} from '../types';

export function toMacroChangeEvent(
  event: vscode.TextDocumentChangeEvent
): MacroChangeEvent {
  const { document, contentChanges, reason } = event;

  return {
    document: {
      uri: document.uri.toJSON(),
      fileName: document.fileName,
      isUntitled: document.isUntitled,
      languageId: document.languageId,
      version: document.version,
      isClosed: document.isClosed,
      isDirty: document.isDirty,
      eol: document.eol,
      lineCount: document.lineCount,
    },
    contentChanges: toContentChanges(contentChanges),
    reason,
  };
}

export function toInititalMacroState(
  document: vscode.TextDocument,
  range: vscode.Range,
  text: string
): InititalMacroState {
  return {
    document: {
      uri: document.uri.toJSON(),
      fileName: document.fileName,
      isUntitled: document.isUntitled,
      languageId: document.languageId,
      version: document.version,
      isClosed: document.isClosed,
      isDirty: document.isDirty,
      eol: document.eol,
      lineCount: document.lineCount,
    },
    content: {
      range: toRange(range),
      text,
    },
  };
}

const toContentChanges = (
  changes: readonly vscode.TextDocumentContentChangeEvent[]
): Array<MacroDocumentContentChange> => {
  return changes.map((item) => ({
    range: toRange(item.range),
    rangeOffset: item.rangeOffset,
    rangeLength: item.rangeLength,
    text: item.text,
  }));
};

const toRange = (ranges: vscode.Range): DocumentChangeRange => {
  return {
    start: ranges.start,
    end: ranges.end,
  };
};
