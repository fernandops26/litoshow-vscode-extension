import * as vscode from 'vscode';

export interface Step {
  range: vscode.Range;
  text: string;
  id: string;
}

export interface Macro {
  id: string;
  name: string;
  changes: MacroChange[];
}

export interface MacroDocumentState extends MacroDocumentContent {}

export interface MacroChange {
  readonly currentContent: MacroDocumentContent;
  readonly document: MacroDocumentInfo;
  readonly contentChanges: readonly MacroDocumentContent[];
  readonly reason?: number;
}

export interface DocumentContentRange {
  start: DocumentChangePositition;
  end: DocumentChangePositition;
}

export interface DocumentChangePositition {
  line: number;
  character: number;
}

export interface MacroDocumentContent {
  range: DocumentContentRange;
  rangeOffset?: number;
  rangeLength?: number;
  text: string;
}

export interface MacroDocumentUri {
  $mid: number;
  fsPath: string;
  external: string;
  path: string;
  scheme: string;
}

export interface MacroDocumentInfo {
  uri: MacroDocumentUri;
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
