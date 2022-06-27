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

export type StartingPoint = WithPosition &
  WithType & {
    editorContent: string;
    language: string;
    selections: vscode.Selection[];
  };

export type StopPoint = WithPosition &
  WithType & {
    stop: {
      name: string | null;
    };
  };

export type Frame = WithPosition &
  WithType & {
    editorContent: string;
    changes: vscode.TextDocumentContentChangeEvent[];
    selections: vscode.Selection[];
  };

export type Buffer = StartingPoint | StopPoint | Frame;

export function isStartingPoint(buffer: Buffer): buffer is StartingPoint {
  return (<StartingPoint>buffer).type === BufferTypes.Starting;
}

export function isStopPoint(buffer: Buffer): buffer is StopPoint {
  return (<StopPoint>buffer).type === BufferTypes.Stop;
}

export function all() {
  return buffers;
}

export function get(position: number) {
  return buffers[position];
}

// @TODO LOL delete this shit
export function inject(_buffers: Buffer[]) {
  buffers = _buffers;
}

export function insert(buffer: Buffer) {
  console.log('pushing: ', buffer);
  buffers.push(buffer);
}

export function clear() {
  buffers = [];
}

export function count() {
  return buffers.length;
}
