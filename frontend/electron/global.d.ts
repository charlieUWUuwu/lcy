export {};

interface OpenCSVResult {
  filePath?: string;
  error?: string;
}

declare global {
  interface Window {
    electronAPI: {
      openCSV: () => Promise<OpenCSVResult | null>;
      readCSV: (filePath: string) => Promise<{
        headers: string[];
        sampledTimestamps: string[];
        sampledFeatures: number[][];
      }>;
      loadImageBase64: (filePath: string) => Promise<string>;
    };
  }
}
