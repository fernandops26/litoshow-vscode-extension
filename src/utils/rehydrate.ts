import * as vscode from 'vscode';
import * as buffers from './../services/BufferManager';

enum BufferTypes {
  Starting = 1,
  Change = 2,
  Stop = 3,
}

type SerializedPosition = {
  line: number;
  character: number;
};

type SerializedRange = SerializedPosition[];

interface SerializedDocument {
  uri: string;
  languageId: string;
  version: number;
  fileName: string;
  scheme: string;
}

interface SerializedChangeEvent {
  range: SerializedRange;
  rangeOffset: number;
  rangeLength: number;
  text: string;
}

interface SerializedSelection {
  start: SerializedPosition;
  end: SerializedPosition;
  active: SerializedPosition;
  anchor: SerializedPosition;
}

export interface SerializedStartingPoint {
  type: BufferTypes.Starting;
  editorContent: string;
  language: string;
  position: number;
  selections: SerializedSelection[];
  document: SerializedDocument;
}

export interface SerializedStopPoint {
  type: BufferTypes.Stop;
  stop: { name: string | null };
  position: number;
}

export interface SerializedFrame {
  type: BufferTypes.Change;
  editorContent: string;
  changes: SerializedChangeEvent[];
  selections: SerializedSelection[];
  position: number;
  document: SerializedDocument;
}

export type SerializedBuffer =
  | SerializedFrame
  | SerializedStopPoint
  | SerializedStartingPoint;

function isStartingPoint(
  buffer: SerializedBuffer
): buffer is SerializedStartingPoint {
  return (<SerializedStartingPoint>buffer).type === BufferTypes.Starting;
}

function isStopPoint(buffer: SerializedBuffer): buffer is SerializedStopPoint {
  return (<SerializedStopPoint>buffer).type === BufferTypes.Stop;
}

function rehydratePosition(serialized: SerializedPosition): vscode.Position {
  return new vscode.Position(serialized.line, serialized.character);
}

function rehydrateRange([start, stop]: SerializedRange): vscode.Range {
  return new vscode.Range(rehydratePosition(start), rehydratePosition(stop));
}

function rehydrateSelection(serialized: SerializedSelection): vscode.Selection {
  return new vscode.Selection(
    rehydratePosition(serialized.anchor),
    rehydratePosition(serialized.active)
  );
}

function rehydrateChangeEvent(
  serialized: SerializedChangeEvent
): vscode.TextDocumentContentChangeEvent {
  return {
    ...serialized,
    range: rehydrateRange(serialized.range),
  };
}

function rehydrateDocument(document: vscode.TextDocument): SerializedDocument {
  return {
    uri: document.uri.path,
    languageId: document.languageId,
    version: document.version,
    fileName: document.fileName,
    scheme: document.uri.scheme,
  };
}

export function rehydrateBuffer(serialized: SerializedBuffer): buffers.Buffer {
  if (isStopPoint(serialized)) {
    return {
      type: BufferTypes.Stop,
      position: serialized.position,
      stop: {
        name: serialized.stop.name || null,
      },
    };
  }

  if (isStartingPoint(serialized)) {
    return {
      document: serialized.document,
      type: BufferTypes.Starting,
      position: serialized.position,
      editorContent: serialized.editorContent,
      language: serialized.language,
      selections: serialized.selections.map(rehydrateSelection),
    };
  }

  return {
    document: serialized.document,
    type: BufferTypes.Change,
    editorContent: serialized.editorContent,
    position: serialized.position,
    changes: serialized.changes.map(rehydrateChangeEvent),
    selections: serialized.selections.map(rehydrateSelection),
  };
}
