export {};

declare global {
  interface Window {
    electronAPI: {
      openCSV: () => Promise<string>;
      readCSV: (filePath: string) => Promise<string>;
    };
  }
}
