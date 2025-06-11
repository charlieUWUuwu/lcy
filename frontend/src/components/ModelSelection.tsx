import React, { useState, useEffect, useCallback } from 'react';
import '../styles/ModelSelection.css';
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
  // 使用狀態來追蹤參數變化的來源
  const [internalParameters, setInternalParameters] = useState<ModelParameters>(
    getDefaultParameters(selectedModel)
  );
  
  // 使用狀態來追蹤參數變化的來源
  const [paramChangeSource, setParamChangeSource] = useState<'ui' | 'json' | 'model' | 'init'>('init');

  const models = [
    { id: 'LSTM', name: 'LSTM' },
    { id: 'GRU', name: 'GRU' },
    { id: 'CNN', name: 'CNN' },
    { id: 'RF', name: 'Random Forest' },
    { id: 'XGB', name: 'XGBoost' },
  ];

  // 當內部參數變化時，通知父組件
  useEffect(() => {
    // 只有當參數變化來源是 UI 或模型變化時，才通知父組件
    if (paramChangeSource === 'ui' || paramChangeSource === 'model') {
      if (onParametersChange) {
        onParametersChange(internalParameters);
      }
    }
  }, [internalParameters, onParametersChange, paramChangeSource]);
  
  // 當內部參數或模型類型變化時，更新 JSON 配置
  useEffect(() => {
    // 只有當參數變化來源是 UI 或模型變化時，才更新 JSON
    if ((paramChangeSource === 'ui' || paramChangeSource === 'model') && onConfigJsonChange) {
      try {
        // 創建新的配置
        const newConfig = {
          modelType: selectedModel,
          parameters: internalParameters
        };
        onConfigJsonChange(JSON.stringify(newConfig, null, 2));
      } catch (error) {
        console.error('Error updating JSON configuration:', error);
      }
    }
  }, [internalParameters, selectedModel, onConfigJsonChange, paramChangeSource]);

  // 當模型變化時，更新參數為該模型的默認值
  useEffect(() => {
    const newDefaultParams = getDefaultParameters(selectedModel);
    setInternalParameters(newDefaultParams);
    setParamChangeSource('model');
  }, [selectedModel]);
  
  // 當從父組件接收到新的 configJson 時，解析並更新內部狀態
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
    setInternalParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
    setParamChangeSource('ui');
  }, []);
  
  // 處理 JSON 編輯器輸入
  const handleJsonConfigChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      // 無效的 JSON 不更新狀態
    }
  }, [onConfigJsonChange, selectedModel, onModelChange]);

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
              value={internalParameters.learningRate}
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
          
          {/* Model-specific parameters based on the selected model */}
          {'hiddenLayers' in internalParameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="hiddenLayers">Hidden Layers:</label>
                <input
                  type="number"
                  id="hiddenLayers"
                  name="hiddenLayers"
                  value={(internalParameters as any).hiddenLayers}
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
                  value={(internalParameters as any).hiddenUnits}
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
                  value={(internalParameters as any).dropout}
                  onChange={handleParameterChange}
                  step="0.01"
                  min="0"
                  max="0.9"
                />
              </div>
            </>
          )}
          
          {'kernelSize' in internalParameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="kernelSize">Kernel Size:</label>
                <input
                  type="number"
                  id="kernelSize"
                  name="kernelSize"
                  value={(internalParameters as any).kernelSize}
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
                  value={(internalParameters as any).filters}
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
                  value={(internalParameters as any).poolSize}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
            </>
          )}
          
          {'nEstimators' in internalParameters && (
            <>
              <div className="parameter-group">
                <label htmlFor="nEstimators">N Estimators:</label>
                <input
                  type="number"
                  id="nEstimators"
                  name="nEstimators"
                  value={(internalParameters as any).nEstimators}
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
                  value={(internalParameters as any).maxDepth}
                  onChange={handleParameterChange}
                  step="1"
                  min="1"
                />
              </div>
              {'minSamplesSplit' in internalParameters && (
                <div className="parameter-group">
                  <label htmlFor="minSamplesSplit">Min Samples Split:</label>
                  <input
                    type="number"
                    id="minSamplesSplit"
                    name="minSamplesSplit"
                    value={(internalParameters as any).minSamplesSplit}
                    onChange={handleParameterChange}
                    step="1"
                    min="2"
                  />
                </div>
              )}
              {'gamma' in internalParameters && (
                <div className="parameter-group">
                  <label htmlFor="gamma">Gamma:</label>
                  <input
                    type="number"
                    id="gamma"
                    name="gamma"
                    value={(internalParameters as any).gamma}
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
              value={configJson || JSON.stringify({ modelType: selectedModel, parameters: internalParameters }, null, 2)}
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
