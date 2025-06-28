export {};

declare global {
  interface Window {
    electronAPI: {
      openCSV: () => Promise<string>;
      readCSV: (filePath: string) => Promise<string>;
      loadImageBase64: (filePath: string) => Promise<string>;
    };
  }
}
