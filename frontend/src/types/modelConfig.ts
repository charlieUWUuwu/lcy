// Model configuration types and utilities

// Feature and label selection
export interface SelectionConfig {
  features: string[];
  selectedFeatures: string[];
  selectedLabel: string | null;
}

export interface DLModelParameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
}

export interface MLModelParameters {
  iterations: number;
  learningRate: number;
  depth: number;
}

// Union type for all possible model parameters
export type ModelParameters = DLModelParameters | MLModelParameters;

// Complete training configuration
export interface TrainingConfig {
  selection: SelectionConfig;
  modelType: string;
  parameters: ModelParameters;
}

// Default parameter values for each model type
export const defaultParameters: Record<string, ModelParameters> = {
  LSTM: {
    epochs: 10,
    learningRate: 0.001,
    batchSize: 32,
  },
  RNN: {
    epochs: 10,
    learningRate: 0.0001,
    batchSize: 16,
  },
  XGBoost: {
    iterations: 300,
    learningRate: 0.1,
    depth: 10,
  },
  CatBoost: {
    iterations: 100,
    learningRate: 0.01,
    depth: 5,
  },
  LightGBM: {
    iterations: 50,
    learningRate: 0.01,
    depth: 5,
  },
};

// 根據 defaultParameters 自動產生模型下拉選單選項
export const MODEL_OPTIONS = Object.keys(defaultParameters).map((key) => ({
  id: key,
  name: key,
}));

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
