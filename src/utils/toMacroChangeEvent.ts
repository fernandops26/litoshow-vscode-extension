import * as vscode from 'vscode';
import {
  MacroChange,
  MacroDocumentState,
  MacroDocumentContentChange,
  DocumentChangeRange,
  InititalMacroState,
} from '../types';

export function toInitialMacroChange(
  document: vscode.TextDocument,
  range: vscode.Range,
  text: string
): MacroChange {
  return {
    state: toContentChange({ range, text }),
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
    contentChanges: [],
    reason: undefined,
  };
}

export function toMacroChangeEvent(
  state: MacroDocumentState,
  event: vscode.TextDocumentChangeEvent
): MacroChange {
  const { document, contentChanges, reason } = event;

  return {
    state: toContentChange(state),
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
  return changes.map((item) => toContentChange(item));
};

const toRange = (
  ranges: vscode.Range | DocumentChangeRange
): DocumentChangeRange => {
  return {
    start: ranges.start,
    end: ranges.end,
  };
};

const toContentChange = (
  item: vscode.TextDocumentContentChangeEvent | MacroDocumentState
): MacroDocumentContentChange => {
  return {
    range: toRange(item.range),
    rangeOffset: item.rangeOffset,
    rangeLength: item.rangeLength,
    text: item.text,
  };
};
