export {};

declare global {
  interface Window {
    electronAPI: {
      loadFile: (options: { extensions: string[] }) => Promise<string>;
      readFile: (filePath: string) => Promise<string>;
    };
  }
}
