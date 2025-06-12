import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ModelSelection from '../Model Training/ModelSelection';
import { ModelParameters } from '../modelConfig';
import './ModelTraining.css';

interface TrainingResult {
  accuracy: number;
  recall: number;
}

const ModelTraining: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>('LSTM');
  const [modelParameters, setModelParameters] = useState<ModelParameters>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    earlyStoppingPatience: 3,
  });
  const [configJson, setConfigJson] = useState<string>('');
  const [configChangeSource, setConfigChangeSource] = useState
    'ui' | 'model' | 'json' | 'init' | 'features'
  >('init');
  const [isTraining, setIsTraining] = useState<boolean>(false);

  useEffect(() => {
    if (selectedModel && Object.keys(modelParameters).length > 0) {
      const config = {
        model: selectedModel,
        parameters: modelParameters,
      };
      setConfigJson(JSON.stringify(config, null, 2));
    }
  }, [selectedModel, modelParameters]);

  const handleModelChange = useCallback((model: string) => {
    setSelectedModel(model);
    setConfigChangeSource('model');
  }, []);

  const handleParametersChange = useCallback((parameters: ModelParameters) => {
    setModelParameters(parameters);
    setConfigChangeSource('ui');
  }, []);

  const handleConfigJsonChange = useCallback(
    (newConfigJson: string) => {
      setConfigJson(newConfigJson);
      setConfigChangeSource('json');

      try {
        const config = JSON.parse(newConfigJson);

        if (
          (config.model && config.model !== selectedModel) ||
          (config.modelType && config.modelType !== selectedModel)
        ) {
          setSelectedModel(config.model || config.modelType);
        }

        if (config.parameters) {
          setModelParameters(config.parameters);
        }
      } catch (error) {
        console.error('Error parsing JSON configuration:', error);
      }
    },
    [selectedModel],
  );

  const handleTraining = async () => {
    if (!selectedModel) {
      alert('Please select a model first');
      return;
    }

    setIsTraining(true);
    // try {
    //   const response = await axios.post('/api/train', {
    //     model: selectedModel,
    //     parameters: modelParameters,
    //   });

    //   setTrainingResult({
    //     accuracy: response.data.accuracy,
    //     recall: response.data.recall,
    //   });

    //   if (response.data.modelPath) {
    //     setModelPath(response.data.modelPath);
    //   }
    // } catch (error) {
    //   console.error('Training error:', error);
    //   alert('An error occurred during training. Please check your connection and try again.');
    // } finally {
    //   setIsTraining(false);
    // }
  };

  return (
    <div className="model-training-container">
      <div className="model-training-content">
        <div className="model-selection-section">
          <ModelSelection
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onParametersChange={handleParametersChange}
            configJson={configJson}
            onConfigJsonChange={handleConfigJsonChange}
          />

          <div className="training-controls">
            <div className="note">if result not great, select model again to retrain</div>

            {process.env.NODE_ENV === 'development' && (
              <div className="debug-info">
                <small>Config source: {configChangeSource}</small>
              </div>
            )}
            <button className="training-button" onClick={handleTraining} disabled={isTraining}>
              {isTraining ? 'Training...' : 'start training'}
            </button>

            <div className="training-results">
              {/* results*/}
              <div className="placeholder-results">
                <p>Training results will appear here</p>
              </div>
            </div>
          </div>
        </div> {/* closes model-selection-section */}

        <div className="visualization-section">
          <div className="visualization-tabs">
            <div className="tab-headers">
              <div className="tab-header active">feature impact</div>
              <div className="tab-header">Model prediction</div>
            </div>
            <div className="visualization-content">
              <div className="placeholder-chart">
                <p>Visualization content will appear here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="previous-button" onClick={() => navigate('/data-training')}>
            previous
          </button>
        </div>
      </div> {/* closes model-training-content */}
    </div> /* closes model-training-container */
  );
};

export default ModelTraining;