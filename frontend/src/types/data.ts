export interface SensorData {
  timestamp: number;
  temperature: number;
  pressure: number;
  humidity: number;
  vibration: number;
  [key: string]: number | string; // Allow for additional sensor values
}

export interface DatasetFeature {
  name: string;
  type: 'numeric' | 'categorical';
  selected: boolean;
}

export interface Dataset {
  name: string;
  features: DatasetFeature[];
  data: Record<string, unknown>[];
  timestamp: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  tension?: number;
}

export interface HeatMapData {
  features: string[];
  matrix: number[][];
}

export interface TimeSeriesData {
  timestamp: string | number | Date;
  values: Record<string, number>;
}

export interface DataProcessingOptions {
  normalization?: 'min-max' | 'z-score' | 'none';
  missingValues?: 'mean' | 'median' | 'mode' | 'remove' | 'none';
  outliers?: 'clip' | 'remove' | 'none';
  windowSize?: number;
}
