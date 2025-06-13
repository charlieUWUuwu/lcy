import React, { useCallback, useEffect, useState } from 'react';

import '../../styles/ModelSelection.css';
import { ModelParameters, getDefaultParameters } from '../../types';

interface ModelSelectionProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onParametersChange?: (parameters: ModelParameters) => void;
  // For JSON configuration
  configJson?: string;
  onConfigJsonChange?: (configJson: string) => void;
}

// Type guards to check parameter types safely
const hasNeuralNetworkParams = (
  params: ModelParameters,
): params is ModelParameters & {
  hiddenLayers: number;
  hiddenUnits: number;
  dropout: number;
} => {
  return 'hiddenLayers' in params && 'hiddenUnits' in params && 'dropout' in params;
};

const hasCNNParams = (
  params: ModelParameters,
): params is ModelParameters & {
  kernelSize: number;
  filters: number;
  poolSize: number;
} => {
  return 'kernelSize' in params && 'filters' in params && 'poolSize' in params;
};

const hasTreeParams = (
  params: ModelParameters,
): params is ModelParameters & {
  nEstimators: number;
  maxDepth: number;
} => {
  return 'nEstimators' in params && 'maxDepth' in params;
};

const hasRandomForestParams = (
  params: ModelParameters,
): params is ModelParameters & {
  nEstimators: number;
  maxDepth: number;
  minSamplesSplit: number;
} => {
  return hasTreeParams(params) && 'minSamplesSplit' in params;
};

const hasXGBoostParams = (
  params: ModelParameters,
): params is ModelParameters & {
  nEstimators: number;
  maxDepth: number;
  gamma: number;
} => {
  return hasTreeParams(params) && 'gamma' in params;
};

const ModelSelection: React.FC<ModelSelectionProps> = ({
  selectedModel,
  onModelChange,
  onParametersChange,
  configJson,
  onConfigJsonChange,
}) => {
  const [internalParameters, setInternalParameters] = useState<ModelParameters>(
    getDefaultParameters(selectedModel),
  );

  const [paramChangeSource, setParamChangeSource] = useState<'ui' | 'json' | 'model' | 'init'>(
    'init',
  );

  const models = [
    { id: 'LSTM', name: 'LSTM' },
    { id: 'GRU', name: 'GRU' },
    { id: 'CNN', name: 'CNN' },
    { id: 'RF', name: 'Random Forest' },
    { id: 'XGB', name: 'XGBoost' },
  ];

  useEffect(() => {
    if (paramChangeSource === 'ui' || paramChangeSource === 'model') {
      if (onParametersChange) {
        onParametersChange(internalParameters);
      }
    }
  }, [internalParameters, onParametersChange, paramChangeSource]);

  useEffect(() => {
    if ((paramChangeSource === 'ui' || paramChangeSource === 'model') && onConfigJsonChange) {
      try {
        const newConfig = {
          modelType: selectedModel,
          parameters: internalParameters,
        };
        onConfigJsonChange(JSON.stringify(newConfig, null, 2));
      } catch (error) {
        console.error('Error updating JSON configuration:', error);
      }
    }
  }, [internalParameters, selectedModel, onConfigJsonChange, paramChangeSource]);

  useEffect(() => {
    const newDefaultParams = getDefaultParameters(selectedModel);
    setInternalParameters(newDefaultParams);
    setParamChangeSource('model');
  }, [selectedModel]);

  useEffect(() => {
    if (configJson && paramChangeSource !== 'ui' && paramChangeSource !== 'model') {
      try {
        const config = JSON.parse(configJson);
        if (config.parameters) {
          setInternalParameters(config.parameters);
          setParamChangeSource('json');
        }
      } catch (error) {
        console.error('Error parsing JSON configuration:', error);
      }
    }
  }, [configJson, paramChangeSource]);

  const handleParameterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInternalParameters((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
    setParamChangeSource('ui');
  }, []);

  const handleJsonConfigChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      try {
        const jsonValue = e.target.value;
        const config = JSON.parse(jsonValue);

        // 直接將 JSON 傳遞給父組件，不經過內部狀態更新
        if (onConfigJsonChange) {
          onConfigJsonChange(jsonValue);
        }

        // 更新模型類型（如果有變化）
        if (config.modelType && config.modelType !== selectedModel && onModelChange) {
          onModelChange(config.modelType);
        }

        // 更新參數
        if (config.parameters) {
          setInternalParameters(config.parameters);
          setParamChangeSource('json');
        }
      } catch (error) {
        console.error('Invalid JSON configuration:', error);
      }
    },
    [onConfigJsonChange, selectedModel, onModelChange],
  );

  return (
    <div className="model-selection">
      <div className="selection-label">model selection</div>
      <div className="div-30">
        <div className="select-container">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="model-select"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="select-arrow">▼</div>
        </div>
      </div>

      {selectedModel && (
        <div className="parameter-selection">
          <div className="parameter-label">model parameters</div>

          <div className="parameter-group">
            <label htmlFor="batchSize">Batch Size:</label>
            <input
              type="number"
              id="batchSize"
              name="batchSize"
              value={internalParameters.batchSize}
              onChange={handleParameterChange}
              step="1"
              min="1"
            />
          </div>

          <div className="parameter-group">
            <label htmlFor="epochs">Epochs:</label>
            <input
              type="number"
              id="epochs"
              name="epochs"
              value={internalParameters.epochs}
              onChange={handleParameterChange}
              step="1"
              min="1"
            />
          </div>

          <div className="parameter-group">
            <label htmlFor="earlyStoppingPatience">Early Stopping (patience):</label>
            <input
              type="number"
              id="earlyStoppingPatience"
              name="earlyStoppingPatience"
              value={internalParameters.earlyStoppingPatience}
              onChange={handleParameterChange}
              step="1"
              min="0"
            />
          </div>

          {/* Neural Network specific parameters (LSTM, GRU) */}
          {hasNeuralNetworkParams(internalParameters) && (
            <>
              <div className="parameter-group">
                <label htmlFor="hiddenLayers">Hidden Layers:</label>
                <input
                  type="number"
                  id="hiddenLayers"
                  name="hiddenLayers"
                  value={internalParameters.hiddenLayers}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="hiddenUnits">Hidden Units:</label>
                <input
                  type="number"
                  id="hiddenUnits"
                  name="hiddenUnits"
                  value={internalParameters.hiddenUnits}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="dropout">Dropout:</label>
                <input
                  type="number"
                  id="dropout"
                  name="dropout"
                  value={internalParameters.dropout}
                  onChange={handleParameterChange}
                  step="0.01"
                  min="0"
                  max="0.9"
                />
              </div>
            </>
          )}

          {/* CNN specific parameters */}
          {hasCNNParams(internalParameters) && (
            <>
              <div className="parameter-group">
                <label htmlFor="kernelSize">Kernel Size:</label>
                <input
                  type="number"
                  id="kernelSize"
                  name="kernelSize"
                  value={internalParameters.kernelSize}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="filters">Filters:</label>
                <input
                  type="number"
                  id="filters"
                  name="filters"
                  value={internalParameters.filters}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="poolSize">Pool Size:</label>
                <input
                  type="number"
                  id="poolSize"
                  name="poolSize"
                  value={internalParameters.poolSize}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
            </>
          )}

          {/* Tree-based model parameters (Random Forest, XGBoost) */}
          {hasTreeParams(internalParameters) && (
            <>
              <div className="parameter-group">
                <label htmlFor="nEstimators">N Estimators:</label>
                <input
                  type="number"
                  id="nEstimators"
                  name="nEstimators"
                  value={internalParameters.nEstimators}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              <div className="parameter-group">
                <label htmlFor="maxDepth">Max Depth:</label>
                <input
                  type="number"
                  id="maxDepth"
                  name="maxDepth"
                  value={internalParameters.maxDepth}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              {/* Random Forest specific parameter */}
              {hasRandomForestParams(internalParameters) && (
                <div className="parameter-group">
                  <label htmlFor="minSamplesSplit">Min Samples Split:</label>
                  <input
                    type="number"
                    id="minSamplesSplit"
                    name="minSamplesSplit"
                    value={internalParameters.minSamplesSplit}
                    onChange={handleParameterChange}
                    step="1"
                    min="2"
                  />
                </div>
              )}
              {/* XGBoost specific parameter */}
              {hasXGBoostParams(internalParameters) && (
                <div className="parameter-group">
                  <label htmlFor="gamma">Gamma:</label>
                  <input
                    type="number"
                    id="gamma"
                    name="gamma"
                    value={internalParameters.gamma}
                    onChange={handleParameterChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}
            </>
          )}

          {/* JSON Configuration Display/Editor */}
          <div className="json-config-section">
            <div className="parameter-label">JSON Configuration</div>
            <textarea
              className="json-config-editor"
              value={
                configJson ||
                JSON.stringify(
                  { modelType: selectedModel, parameters: internalParameters },
                  null,
                  2,
                )
              }
              onChange={handleJsonConfigChange}
              rows={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelection;
