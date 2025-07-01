export {};

declare global {
  interface Window {
    electronAPI: {
      openCSV: () => Promise<string>;
      readCSV: (filePath: string) => Promise<{
        headers: string[];
        sampledTimestamps: string[];
        sampledFeatures: number[][];
      }>;
      loadImageBase64: (filePath: string) => Promise<string>;
    };
  }
}
