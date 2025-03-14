import React from 'react';

interface ModelSelectionProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({ selectedModel, onModelChange }) => {
  const models = [
    { id: 'LSTM', name: 'LSTM' },
    { id: 'GRU', name: 'GRU' },
    { id: 'CNN', name: 'CNN' },
    { id: 'RF', name: 'Random Forest' },
    { id: 'XGB', name: 'XGBoost' },
  ];

  return (
    <div className="model-selection">
      <div className="selection-label">model selection</div>
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
  );
};

export default ModelSelection;
