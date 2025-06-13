export interface Dataset {
  features: string[];
  data: number[][];
}

// 解析 csv 文件後的數據結構
export interface ProcessedFileData {
  name: string;
  features: string[];
  timestamps: string[];
  values: number[];
}

// 原始文件數據
export interface FileData {
  name: string;
  path: string;
  content?: string;
}
