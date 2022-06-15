import * as vscode from 'vscode';
import {
  MacroChange,
  MacroDocumentState,
  MacroDocumentContent,
  DocumentContentRange,
} from '../types';

export function toInitialMacroChange(
  document: vscode.TextDocument,
  range: vscode.Range,
  text: string
): MacroChange {
  return {
    currentContent: toContentChange({ range, text }),
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

export function toMacroDocumentChangeEvent(
  state: MacroDocumentState,
  event: vscode.TextDocumentChangeEvent
): MacroChange {
  const { document, contentChanges, reason } = event;

  return {
    currentContent: toContentChange(state),
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

const toContentChanges = (
  changes: readonly vscode.TextDocumentContentChangeEvent[]
): Array<MacroDocumentContent> => {
  return changes.map((item) => toContentChange(item));
};

const toRange = (
  ranges: vscode.Range | DocumentContentRange
): DocumentContentRange => {
  return {
    start: ranges.start,
    end: ranges.end,
  };
};

const toContentChange = (
  item: vscode.TextDocumentContentChangeEvent | MacroDocumentState
): MacroDocumentContent => {
  return {
    range: toRange(item.range),
    rangeOffset: item.rangeOffset,
    rangeLength: item.rangeLength,
    text: item.text,
  };
};
