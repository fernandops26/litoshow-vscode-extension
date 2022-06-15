import * as vscode from 'vscode';

export interface Step {
  range: vscode.Range;
  text: string;
  id: string;
}

export interface Macro {
  id: string;
  initialState?: InititalMacroState;
  name: string;
  changes: MacroChange[];
}

export interface InititalMacroState {
  readonly document: MacroChangeDocument;
  readonly content: MacroDocumentContentChange;
}

export interface MacroDocumentState extends MacroDocumentContentChange {}

export interface MacroChange {
  readonly state: MacroDocumentContentChange;
  readonly document: MacroChangeDocument;
  readonly contentChanges: readonly MacroDocumentContentChange[];
  readonly reason?: number;
}

export interface DocumentChangeRange {
  start: DocumentChangePositition;
  end: DocumentChangePositition;
}

export interface DocumentChangePositition {
  line: number;
  character: number;
}

export interface MacroDocumentContentChange {
  range: DocumentChangeRange;
  rangeOffset?: number;
  rangeLength?: number;
  text: string;
}

export interface MacroChangeDocumentUri {
  $mid: number;
  fsPath: string;
  external: string;
  path: string;
  scheme: string;
}

export interface MacroChangeDocument {
  uri: MacroChangeDocumentUri;
  fileName: string;
  isUntitled: boolean;
  languageId: string;
  version: number;
  isClosed: boolean;
  isDirty: boolean;
  eol: number;
  lineCount: number;
}

export type StatusUpdate = {
  status: string;
  total: number;
  current: number;
};

// observer
export interface Observer {
  // Receive update from subject.
  update(status: StatusUpdate): void;
}

// update status
// { status: 'playing', total: 5, current: 1 }
// { status: 'stopped', total: 5, current: 0 }
// { status: 'paused', total: 5, current: 4 },

// observed
export interface Subject {
  // Attach an observer to the subject.
  attach(eventType: string, observer: Observer): void;

  // Detach an observer from the subject.
  detach(eventType: string, observer: Observer): void;

  // Notify all observers about an event.
  notify(eventType: string, data: any): void;
}
