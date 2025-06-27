import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ModelParameters } from '../../types';
import ModelSelection from './ModelSelection';



const ModelTraining: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>('LSTM');
  const [modelParameters, setModelParameters] = useState<ModelParameters>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
  });
  const [configJson, setConfigJson] = useState<string>('');
  const [configChangeSource, setConfigChangeSource] = useState<
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
    <div className="h-[80vh] flex flex-col p-5 md:p-5">
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-5 xl:gap-8 h-full">
        <div className="flex flex-col gap-5 order-1 xl:order-none">
          <ModelSelection
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onParametersChange={handleParametersChange}
            configJson={configJson}
            onConfigJsonChange={handleConfigJsonChange}
          />

          <div className="flex flex-col gap-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="">
                <small>Config source: {configChangeSource}</small>
              </div>
            )}
            <button className="px-3 py-2 text-base bg-[#f0f0f0] 
              border border-[#ddd] rounded-[5px] cursor-pointer my-1 mb-1 
              transition-colors duration-200 hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleTraining} 
              disabled={isTraining}>

              {isTraining ? 'Training...' : 'start training'}
            
            </button>
            <div className="text-[12px] text-[#777]italic py-[10px]">if result not great, select model again to retrain</div>

            
            

            <div className="mt-5 p-[15px] bg-[#f8f9fa] rounded-[6px] border border-[#e9ecef]">
              {/* results*/}
              <div className="mb-2 font-medium">
                <p>Training results will appear here</p>
              </div>
            </div>
          </div>
        </div>{' '}
        {/* model-output-visualization */}
        {/* Model Output Visualization Section */}
        <div className="mt-5 xl:mt-0 p-4 bg-gray-50 rounded-md border border-gray-200 order-2 xl:order-none">
          <div className="border border-gray-300 rounded overflow-hidden h-full flex flex-col my-5">
            {/* Tab Headers */}
            <div className="flex bg-gray-100 border-b border-gray-300 gap-2.5 mb-5">
              <div className="px-4 py-2 bg-white border-b-2 border-blue-500 cursor-pointer transition-colors duration-200">
                feature impact
              </div>
              <div className="px-4 py-2 cursor-pointer transition-colors duration-200 hover:bg-gray-200">
                Model prediction
              </div>
            </div>
            
            {/* Visualization Content */}
            <div className="flex-1 flex items-center justify-center bg-white rounded-md border border-gray-200">
              <div className="text-center text-gray-500 text-lg">
                <p>Visualization content will appear here</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button className="my-4 text-sm bg-[#f0f0f0] border border-[#ddd] rounded-[5px] cursor-pointer transition-all duration-200 hover:bg-[#e0e0e0] hover:border-[#bbb]" onClick={() => navigate('/data-cleaning')}>
            previous
          </button>
        </div>
      </div>{' '}
      {/* closes model-training-content */}
    </div> /* closes model-training-container */
  );
};

export default ModelTraining;
