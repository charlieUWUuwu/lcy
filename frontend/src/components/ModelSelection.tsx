import React, { useState, useEffect } from 'react';
import './ModelSelection.css';
import { ModelParameters, getDefaultParameters } from './modelConfig';

interface ModelSelectionProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onParametersChange?: (parameters: ModelParameters) => void;
  // For JSON configuration
  configJson?: string;
  onConfigJsonChange?: (configJson: string) => void;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({
  selectedModel,
  onModelChange,
  onParametersChange,
  configJson,
  onConfigJsonChange
}) => {
  // Initialize parameters with default values for the selected model
  const [parameters, setParameters] = useState<ModelParameters>(
    getDefaultParameters(selectedModel)
  );

  const models = [
    { id: 'LSTM', name: 'LSTM' },
    { id: 'GRU', name: 'GRU' },
    { id: 'CNN', name: 'CNN' },
    { id: 'RF', name: 'Random Forest' },
    { id: 'XGB', name: 'XGBoost' },
  ];

  // Update parent component when parameters change
  useEffect(() => {
    if (onParametersChange) {
      onParametersChange(parameters);
    }
    
    // Update JSON configuration if callback is provided
    if (onConfigJsonChange) {
      const config = {
        modelType: selectedModel,
        parameters: parameters
      };
      onConfigJsonChange(JSON.stringify(config, null, 2));
    }
  }, [parameters, onParametersChange, selectedModel, onConfigJsonChange]);

  // When model changes, update parameters to defaults for that model
  useEffect(() => {
    const newDefaultParams = getDefaultParameters(selectedModel);
    setParameters(newDefaultParams);
  }, [selectedModel]);

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Function to handle direct JSON configuration input
  const handleJsonConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const config = JSON.parse(e.target.value);
      if (config.modelType && config.parameters) {
        // Update the model type if it's changed in the JSON
        if (config.modelType !== selectedModel && onModelChange) {
          onModelChange(config.modelType);
        }
        // Update parameters
        setParameters(config.parameters);
      }
      // Update the raw JSON if callback is provided
      if (onConfigJsonChange) {
        onConfigJsonChange(e.target.value);
      }
    } catch (error) {
      console.error('Invalid JSON configuration:', error);
      // Don't update state for invalid JSON
    }
  };

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
            <label htmlFor="learningRate">Learning Rate:</label>
            <input
              type="number"
              id="learningRate"
              name="learningRate"
              value={parameters.learningRate}
              onChange={handleParameterChange}
              step="0.0001"
              min="0.0001"
              max="1"
            />
          </div>

          <div className="parameter-group">
            <label htmlFor="batchSize">Batch Size:</label>
            <input
              type="number"
              id="batchSize"
              name="batchSize"
              value={parameters.batchSize}
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
              value={parameters.epochs}
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
              value={parameters.earlyStoppingPatience}
              onChange={handleParameterChange}
              step="1"
              min="0"
            />
          </div>
          
          {/* Model-specific parameters based on the selected model */}
          {'hiddenLayers' in parameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="hiddenLayers">Hidden Layers:</label>
                <input
                  type="number"
                  id="hiddenLayers"
                  name="hiddenLayers"
                  value={(parameters as any).hiddenLayers}
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
                  value={(parameters as any).hiddenUnits}
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
                  value={(parameters as any).dropout}
                  onChange={handleParameterChange}
                  step="0.01"
                  min="0"
                  max="0.9"
                />
              </div>
            </>
          )}
          
          {'kernelSize' in parameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="kernelSize">Kernel Size:</label>
                <input
                  type="number"
                  id="kernelSize"
                  name="kernelSize"
                  value={(parameters as any).kernelSize}
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
                  value={(parameters as any).filters}
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
                  value={(parameters as any).poolSize}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
            </>
          )}
          
          {'nEstimators' in parameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="nEstimators">N Estimators:</label>
                <input
                  type="number"
                  id="nEstimators"
                  name="nEstimators"
                  value={(parameters as any).nEstimators}
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
                  value={(parameters as any).maxDepth}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              {'minSamplesSplit' in parameters && (
                <div className="parameter-group">
                  <label htmlFor="minSamplesSplit">Min Samples Split:</label>
                  <input
                    type="number"
                    id="minSamplesSplit"
                    name="minSamplesSplit"
                    value={(parameters as any).minSamplesSplit}
                    onChange={handleParameterChange}
                    step="1"
                    min="2"
                  />
                </div>
              )}
              {'gamma' in parameters && (
                <div className="parameter-group">
                  <label htmlFor="gamma">Gamma:</label>
                  <input
                    type="number"
                    id="gamma"
                    name="gamma"
                    value={(parameters as any).gamma}
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
              value={configJson || JSON.stringify({ modelType: selectedModel, parameters }, null, 2)}
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
