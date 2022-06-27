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

export function rehydrateBuffer(serialized: SerializedBuffer): buffers.Buffer {
  if (isStopPoint(serialized)) {
    console.log('here1');
    return {
      type: BufferTypes.Stop,
      position: serialized.position,
      stop: {
        name: serialized.stop.name || null,
      },
    };
  }

  if (isStartingPoint(serialized)) {
    console.log('here2');
    return {
      type: BufferTypes.Starting,
      position: serialized.position,
      editorContent: serialized.editorContent,
      language: serialized.language,
      selections: serialized.selections.map(rehydrateSelection),
    };
  }

  console.log('|| changes in rehydrate: ', serialized.changes);
  return {
    type: BufferTypes.Change,
    editorContent: serialized.editorContent,
    position: serialized.position,
    changes: serialized.changes.map(rehydrateChangeEvent),
    selections: serialized.selections.map(rehydrateSelection),
  };
}
