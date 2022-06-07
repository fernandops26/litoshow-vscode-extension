//import * as _vscode from 'vscode';
export {};

declare global {
  const tsvscode: {
    postMessage: ({ type: string, value: any }: any) => void;
    getState: () => any;
    setState: (state: any) => void;
  };
}
