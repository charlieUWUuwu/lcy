import React, { useCallback, useEffect, useState } from 'react';

import {
  DLModelParameters,
  MLModelParameters,
  MODEL_OPTIONS,
  ModelParameters,
  getDefaultParameters,
} from '../../types';
import './ModelSelection.css';

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
  onConfigJsonChange,
}) => {
  const [internalParameters, setInternalParameters] = useState<ModelParameters>(
    getDefaultParameters(selectedModel),
  );

  const [paramChangeSource, setParamChangeSource] = useState<'ui' | 'json' | 'model' | 'init'>(
    'init',
  );

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

  const renderParameterInputs = () => {
    if (selectedModel === 'LSTM' || selectedModel === 'RNN') {
      const params = internalParameters as DLModelParameters;
      return (
        <>
          <div className="parameter-group">
            <label htmlFor="learningRate">Learning Rate:</label>
            <input
              type="number"
              id="learningRate"
              name="learningRate"
              value={params.learningRate}
              onChange={handleParameterChange}
              step="0.001"
              min="0"
            />
          </div>
          <div className="parameter-group">
            <label htmlFor="batchSize">Batch Size:</label>
            <input
              type="number"
              id="batchSize"
              name="batchSize"
              value={params.batchSize}
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
              value={params.epochs}
              onChange={handleParameterChange}
              step="1"
              min="1"
            />
          </div>
        </>
      );
    } else if (
      selectedModel === 'XGBoost' ||
      selectedModel === 'CatBoost' ||
      selectedModel === 'LightGBM'
    ) {
      const params = internalParameters as MLModelParameters;
      return (
        <>
          <div className="parameter-group">
            <label htmlFor="iterations">Iterations:</label>
            <input
              type="number"
              id="iterations"
              name="iterations"
              value={params.iterations}
              onChange={handleParameterChange}
              step="1"
              min="1"
            />
          </div>
          <div className="parameter-group">
            <label htmlFor="learningRate">Learning Rate:</label>
            <input
              type="number"
              id="learningRate"
              name="learningRate"
              value={params.learningRate}
              onChange={handleParameterChange}
              step="0.01"
              min="0"
            />
          </div>
          <div className="parameter-group">
            <label htmlFor="depth">Depth:</label>
            <input
              type="number"
              id="depth"
              name="depth"
              value={params.depth}
              onChange={handleParameterChange}
              step="1"
              min="1"
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="items-center gap-[10px]">
      <div className="font-semibold mb-2 text-left">model selection</div>
      <div className="w-[30%]">
        <div className="relative w-[120px] mb-4">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-[10px] pr-[25px] py-[5px] appearance-none border border-[#ddd] rounded-[5px] bg-white"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="absolute right-[10px] top-[75%] -translate-y-1/2 pointer-events-none text-[10px] text-[#666]">
            ▼
          </div>
        </div>
      </div>

      {selectedModel && (
        <div className="bg-[#f5f5f5] mt-3">
          <div className="font-semibold mb-3 text-left text-[#333]">model parameters</div>
          {renderParameterInputs()}

          <div className="mt-5 mt-5 border-t border-[#ddd] pt-[15px]">
            <div className="font-semibold mb-3 text-left text-[#333]">JSON Configuration</div>
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
