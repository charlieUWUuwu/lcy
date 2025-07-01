export {};

declare global {
  interface Window {
    electronAPI: {
      selectDirectory: () => Promise<string | null>;
      openCSV: () => Promise<string>;
      readCSV: (filePath: string) => Promise<string>;
      loadImageBase64: (filePath: string) => Promise<string>;
    };
  }
}
