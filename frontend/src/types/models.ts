export type ModelType = 'LSTM' | 'GRU' | 'CNN' | 'RF' | 'XGB';

export interface ModelMetadata {
  id: string;
  type: ModelType;
  name: string;
  description?: string;
  features: string[];
  label: string;
  createdAt: string;
  accuracy: number;
  recall: number;
  precision?: number;
  f1Score?: number;
  params?: Record<string, unknown>;
}

export interface TrainingOptions {
  epochs?: number;
  batchSize?: number;
  learningRate?: number;
  validationSplit?: number;
  earlyStoppingPatience?: number;
  timeSteps?: number;
}

export interface PredictionResult {
  timestamp: string;
  actual: number;
  predicted: number;
  error: number;
  percentError: number;
}

export interface ModelEvaluation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rmse: number;
  mae: number;
  mape: number;
  confusionMatrix?: number[][];
}

export interface LSTMModel {
  type: 'LSTM';
  timeSteps: number;
  features: number;
  hiddenLayers: number[];
  dropout?: number;
}

export interface CNNModel {
  type: 'CNN';
  kernelSize: number;
  filters: number[];
  poolSize?: number;
  activation: string;
}

export interface RFModel {
  type: 'RF';
  nEstimators: number;
  maxDepth?: number;
  minSamplesSplit?: number;
}

export interface ModelConfig {
  lstm?: LSTMModel;
  cnn?: CNNModel;
  rf?: RFModel;
  [key: string]: unknown;
}
