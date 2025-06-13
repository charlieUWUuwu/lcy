// Model configuration types and utilities

// Feature and label selection
export interface SelectionConfig {
  features: string[];
  selectedFeatures: string[];
  selectedLabel: string | null;
}

// Base model parameters that all models share
export interface BaseModelParameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  earlyStoppingPatience: number;
}

// Specific model parameters (can be extended for different model types)
export interface LSTMParameters extends BaseModelParameters {
  hiddenLayers: number;
  hiddenUnits: number;
  dropout: number;
}

export interface CNNParameters extends BaseModelParameters {
  kernelSize: number;
  filters: number;
  poolSize: number;
}

export interface RFParameters extends BaseModelParameters {
  nEstimators: number;
  maxDepth: number;
  minSamplesSplit: number;
}

export interface XGBParameters extends BaseModelParameters {
  nEstimators: number;
  maxDepth: number;
  learningRate: number;
  gamma: number;
}

// Union type for all possible model parameters
export type ModelParameters =
  | BaseModelParameters
  | LSTMParameters
  | CNNParameters
  | RFParameters
  | XGBParameters;

// Complete training configuration
export interface TrainingConfig {
  selection: SelectionConfig;
  modelType: string;
  parameters: ModelParameters;
}

// Default parameter values for each model type
export const defaultParameters: Record<string, ModelParameters> = {
  LSTM: {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    earlyStoppingPatience: 3,
    hiddenLayers: 2,
    hiddenUnits: 64,
    dropout: 0.2,
  },
  GRU: {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    earlyStoppingPatience: 3,
    hiddenLayers: 2,
    hiddenUnits: 64,
    dropout: 0.2,
  },
  CNN: {
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    earlyStoppingPatience: 3,
    kernelSize: 3,
    filters: 64,
    poolSize: 2,
  },
  RF: {
    learningRate: 0.1,
    batchSize: 32,
    epochs: 1,
    earlyStoppingPatience: 0,
    nEstimators: 100,
    maxDepth: 10,
    minSamplesSplit: 2,
  },
  XGB: {
    learningRate: 0.1,
    batchSize: 32,
    epochs: 100,
    earlyStoppingPatience: 5,
    nEstimators: 100,
    maxDepth: 6,
    gamma: 0,
  },
};

// Get default parameters for a specific model type
export function getDefaultParameters(modelType: string): ModelParameters {
  return defaultParameters[modelType] || defaultParameters.LSTM;
}

// Convert training configuration to JSON
export function configToJson(config: TrainingConfig): string {
  return JSON.stringify(config, null, 2);
}

// Parse JSON to training configuration
export function jsonToConfig(json: string): TrainingConfig {
  try {
    return JSON.parse(json) as TrainingConfig;
  } catch (error) {
    console.error('Error parsing JSON config:', error);
    throw new Error('Invalid configuration JSON');
  }
}
