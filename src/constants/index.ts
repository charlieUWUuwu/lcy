import { ModelType } from '../types/models';

// Application constants
export const APP_NAME = 'Production Line Dashboard';
export const APP_VERSION = '1.0.0';

// Chart colors
export const CHART_COLORS = {
  temperature: 'rgb(255, 99, 132)',
  pressure: 'rgb(54, 162, 235)',
  humidity: 'rgb(255, 206, 86)',
  vibration: 'rgb(75, 192, 192)',
  default: 'rgb(153, 102, 255)',
};

// Model configuration
export const MODEL_TYPES: { id: ModelType; name: string }[] = [
  { id: 'LSTM', name: 'LSTM Network' },
  { id: 'GRU', name: 'GRU Network' },
  { id: 'CNN', name: 'Convolutional Network' },
  { id: 'RF', name: 'Random Forest' },
  { id: 'XGB', name: 'XGBoost' },
];

// Default time steps for time series models
export const DEFAULT_TIME_STEPS = 10;

// Default data processing options
export const DEFAULT_DATA_PROCESSING = {
  normalization: 'min-max' as const,
  missingValues: 'mean' as const,
  outliers: 'clip' as const,
};

// Default chart options
export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
  },
  scales: {
    x: {
      grid: {
        display: true,
        drawOnChartArea: false,
      },
    },
    y: {
      grid: {
        display: true,
        drawOnChartArea: true,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
};

// Path constants
export const PATHS = {
  models: process.env.NODE_ENV === 'development' ? './public/models' : './resources/models',
};

// Default sensor features
export const DEFAULT_SENSOR_FEATURES = ['temperature', 'pressure', 'humidity', 'vibration'];

// Sample rate for real-time data (in milliseconds)
export const DEFAULT_SAMPLE_RATE = 1000;

// Max data points to keep in memory
export const MAX_DATA_POINTS = 300;
