import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ModelParameters, ProcessedFileData } from '../../types';
import LineChart from '../LineChart';
import ModelSelection from './ModelSelection';

const ModelTraining: React.FC = () => {
  // line chart
  const [activeTab, setActiveTab] = useState('feature');

  // image
  const [images, setImages] = useState<{
    all: string;
    positive: string;
    negative: string;
  } | null>(null);
  const [selected, setSelected] = useState<'all' | 'positive' | 'negative'>('all');

  useEffect(() => {
    const loadImages = async () => {
      // 之後改成用後端傳來的 png 路徑
      const all_base64 = await window.electronAPI.loadImageBase64('<PNG_PATH>');
      const pos_base64 = await window.electronAPI.loadImageBase64('<PNG_PATH>');
      const neg_base64 = await window.electronAPI.loadImageBase64('<PNG_PATH>');
      setImages({ all: all_base64, positive: pos_base64, negative: neg_base64 });
    };

    loadImages();
  }, []);

  // useEffect(() => {
  //   // 模擬載入圖片，可替換為 Electron API
  //   const load = async () => {
  //   const toFileUrl = (path: string) =>
  //     `file:///${path.replace(/\\/g, '/')}`; // 把 '\' 變成 '/' 並加上前綴

  //   const all = toFileUrl('C:\\Users\\tzu-yi\\Pictures\\kisspng-bert-ernie-big-bird-count-von-count-oscar-the-grou-5ae7a0332294d3.5290421215251292671417.png');
  //   const positive = '';
  //   const negative = '';
  //     setImages({ all, positive, negative });
  //   };

  //   load();
  // }, []);

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

  const fileData: ProcessedFileData = {
    name: 'demo.csv',
    features: ['truth', 'predict'],
    timestamps: [
      '2025-01-01 00:00',
      '2025-01-01 01:00',
      '2025-01-01 02:00',
      '2025-01-01 03:00',
      '2025-01-01 04:00',
      '2025-01-01 05:00',
      '2025-01-01 06:00',
      '2025-01-01 07:00',
    ],
    values: [20, 21, 19, 22, 23, 24, 23.5, 25, 1.0, 1.1, 1.05, 1.2, 1.15, 1.1, 1.12, 1.3], // truth, predict 對應的各自 8 筆值
  };
  const selectedFeatures = ['truth', 'predict'];

  return (
    <div className="h-full flex flex-col md:p-5">
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
            <button
              className="px-3 py-2 text-base bg-[#2a9d8f] text-white
              border border-[#ddd] rounded-[5px] cursor-pointer my-1 mb-1 
              transition-colors duration-200 hover:bg-[#264653] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleTraining}
              disabled={isTraining}
            >
              {isTraining ? 'Training...' : 'Start Training'}
            </button>
            <div className="text-[12px] text-[#777]italic py-[10px]">
              if result not great, select model again to retrain
            </div>

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
          <div className="h-full flex flex-col">
            {/* Tab Headers */}
            <div className="w-full flex bg-gray-100 border-b border-gray-300 gap-2.5 mb-5">
              <div
                className={`px-4 py-2 cursor-pointer transition-colors duration-200 ${
                  activeTab === 'feature'
                    ? 'bg-white border-b-2 border-blue-500'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('feature')}
              >
                feature impact
              </div>
              <div
                className={`px-4 py-2 cursor-pointer transition-colors duration-200 ${
                  activeTab === 'prediction'
                    ? 'bg-white border-b-2 border-blue-500'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('prediction')}
              >
                Model prediction
              </div>
            </div>

            {/* Visualization Content */}
            <div className="border border-gray-300 p-2 rounded flex items-center justify-center bg-gray-50 mb-4 w-full h-full">
              {activeTab === 'feature' ? (
                images ? (
                <img
                  src={images[selected]}
                  alt={selected}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">Loading...</div>
                )
              ) : (
                <LineChart fileData={fileData} selectedFeatures={selectedFeatures} />
              )}
            </div>

            <div className="flex gap-4 justify-center">
              {['all', 'positive', 'negative'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelected(type as 'all' | 'positive' | 'negative')}
                  className={`px-4 py-2 rounded ${
                    selected === type ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex order-3 xl:order-none">
          <button
            className="my-4 text-sm bg-[#f4a261] border border-[#ddd] rounded-[5px] cursor-pointer transition-all duration-200 hover:bg-[#e76f51] text-white"
            onClick={() => navigate('/data-cleaning')}
          >
            Previous
          </button>
        </div>
      </div>
      {/* closes model-training-content */}
    </div> /* closes model-training-container */
  );
};

export default ModelTraining;
