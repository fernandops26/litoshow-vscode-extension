import * as vscode from 'vscode';

let buffers: Buffer[] = [];

enum BufferTypes {
  Starting = 1,
  Change = 2,
  Stop = 3,
}

type WithPosition = {
  position: number;
};

type WithType = {
  type: number;
};

type WithDocument = {
  document: any;
};

export type StartingPoint = WithPosition &
  WithType &
  WithDocument & {
    editorContent: string;
    language: string;
    selections: vscode.Selection[];
  };

export type StopPoint = WithPosition &
  WithType & {
    stop: {
      name: string;
    };
  };

export type Frame = WithPosition &
  WithType &
  WithDocument & {
    editorContent: string;
    changes: vscode.TextDocumentContentChangeEvent[];
    selections: vscode.Selection[];
  };

export type Buffer = StartingPoint | StopPoint | Frame;

export function isStartingPoint(buffer: Buffer): buffer is StartingPoint {
  return (<StartingPoint>buffer).type === BufferTypes.Starting;
}

export function isChange(buffer: Buffer): buffer is Frame {
  return (<StartingPoint>buffer).type === BufferTypes.Change;
}

export function isStopPoint(buffer: Buffer): buffer is StopPoint {
  return (<StopPoint>buffer).type === BufferTypes.Stop;
}

export function all() {
  return buffers;
}

export function get(position: number): Buffer {
  return buffers[position];
}

// @TODO LOL delete this shit
export function inject(_buffers: Buffer[]) {
  buffers = _buffers;
}

export function insert(buffer: Buffer) {
  buffers.push(buffer);
}

export function getStopPoints(): StopPoint[] {
  return buffers.filter(isStopPoint);
}

export function clear() {
  buffers = [];
}

export function count() {
  return buffers.length;
}
