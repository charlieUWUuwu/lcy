import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LineChart from './DataCleaning/LineChart';

interface LoadModelProps {
  selectedModel: string | null;
  modelAccuracy: number | null;
  modelRecall: number | null;
  onModelLoaded: (model: string, accuracy: number, recall: number) => void;
}

interface ModelData {
  type: string;
  features: string[];
  label: string;
  accuracy: number;
  recall: number;
  timestamp: string;
}

// 為 predictionData 定義明確的介面
interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// 為 streamData 定義明確的介面
interface StreamDataPoint {
  time: string;
  pressure: number;
  prediction: number;
  timestamp?: string;
  [key: string]: unknown; // 使用 unknown 替代 any，更安全
}

// 為 correlationData 定義明確的介面
interface CorrelationData {
  features: string[];
  matrix: number[][];
}

// 定義 ProductionData 介面
interface ProductionData {
  timestamp: string | number | Date;
  pressure: number;
  [key: string]: unknown;
}

const LoadModel: React.FC<LoadModelProps> = ({
  // selectedModel,
  // modelAccuracy,
  // modelRecall,
  onModelLoaded,
}) => {
  const navigate = useNavigate();
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<ChartData | null>(null);
  const [activeTab, setActiveTab] = useState<'feature' | 'prediction'>('feature');
  const [streamData, setStreamData] = useState<StreamDataPoint[]>([]);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);

  // Load model from local storage
  const handleLoadModel = useCallback(async () => {
    try {
      // In a real application, this would use the Electron API
      const filePath = await window.electronAPI.loadFile({
        extensions: ['json'],
      });

      if (!filePath) {
        return;
      }

      const fileContent = await window.electronAPI.readFile(filePath);
      const modelData = JSON.parse(fileContent) as ModelData;

      setModelPath(filePath);
      setModelData(modelData);

      // Update parent component with model info
      onModelLoaded(modelData.type, modelData.accuracy, modelData.recall);

      // Generate correlation data for visualization
      const mockCorrelationData = generateMockCorrelationData(modelData.features);
      setCorrelationData(mockCorrelationData);
    } catch (error) {
      console.error('Error loading model:', error);
      alert('Error loading model. Please try again.');
    }
  }, [onModelLoaded]);

  // Generate mock correlation data
  const generateMockCorrelationData = (features: string[]): CorrelationData => {
    const matrix = [];

    for (let i = 0; i < features.length; i++) {
      const row = [];
      for (let j = 0; j < features.length; j++) {
        // Generate random correlation values for demo
        row.push(Math.random() * 2 - 1); // Values between -1 and 1
      }
      matrix.push(row);
    }

    return {
      features,
      matrix,
    };
  };

  // Start real-time prediction
  const handleStartPrediction = useCallback(async () => {
    if (!modelData) return;

    setIsPredicting(true);

    try {
      // In a real app, this would connect to your production line data source
      await window.electronAPI.getProductionData();

      // Listen for data updates
      window.electronAPI.onDataUpdate((data: ProductionData) => {
        // Add timestamp for charting
        const timestamp = new Date(data.timestamp);
        const formattedTime = `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;

        // Make "prediction" by adding some calculated value
        // In a real app, this would use your loaded model
        const prediction = data.pressure * 1.1 + Math.random() * 20;

        // Add to stream data
        setStreamData((prevData) => {
          const newData = [
            ...prevData,
            {
              ...data,
              prediction,
              time: formattedTime,
            } as StreamDataPoint,
          ];
          // Keep only the last 30 data points for visualization
          return newData.slice(-30);
        });
      });

      // Generate initial chart data
      const initialPredictionData: ChartData = {
        labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
        datasets: [
          {
            label: 'Actual',
            data: [400, 600, 300, 900, 800, 400],
            borderColor: 'blue',
          },
          {
            label: 'Predicted',
            data: [350, 650, 320, 850, 750, 480],
            borderColor: 'orange',
          },
        ],
      };

      setPredictionData(initialPredictionData);
    } catch (error) {
      console.error('Error starting prediction:', error);
      alert('Error connecting to data stream. Please try again.');
      setIsPredicting(false);
    }
  }, [modelData]);

  // Update chart with real-time data
  useEffect(() => {
    if (streamData.length > 0) {
      const labels = streamData.map((d) => d.time);
      const actualData = streamData.map((d) => d.pressure);
      const predictedData = streamData.map((d) => d.prediction);

      setPredictionData({
        labels,
        datasets: [
          {
            label: 'Actual',
            data: actualData,
            borderColor: 'blue',
          },
          {
            label: 'Predicted',
            data: predictedData,
            borderColor: 'orange',
          },
        ],
      });
    }
  }, [streamData]);

  return (
    <div className="load-model-container">
      <div className="header">
        <button className="import-button" onClick={handleLoadModel}>
          import
        </button>
        <div className="file-name">{modelPath?.split(/[/\\]/).pop() || 'model name'}</div>
      </div>

      <div className="model-controls">
        <div>select model from local</div>
        <button
          className="start-prediction-button"
          onClick={handleStartPrediction}
          disabled={!modelData || isPredicting}
        >
          start predicting
        </button>

        <div className="model-message">
          {modelData ? (
            <div>
              {modelData.features.join(', ')} !== {modelData.label}?
              顯示錯誤訊息(請重新載入模型或資料集) : 顯示 Acc: {modelData.accuracy}% Recall: ...
            </div>
          ) : (
            <div>(若特徵與當初訓練模型使用的不同，顯示錯誤訊息(請重新載入模型或資料集))</div>
          )}
        </div>
      </div>

      <div className="visualization-tabs">
        <div className="tab-headers">
          <div
            className={`tab-header ${activeTab === 'feature' ? 'active' : ''}`}
            onClick={() => setActiveTab('feature')}
          >
            feature impact
          </div>
          <div
            className={`tab-header ${activeTab === 'prediction' ? 'active' : ''}`}
            onClick={() => setActiveTab('prediction')}
          >
            Model prediction
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'feature' && correlationData ? (
            <p>heap map png...</p>
          ) : activeTab === 'prediction' && predictionData ? (
            <LineChart data={predictionData} />
          ) : (
            <div className="placeholder">
              {activeTab === 'feature'
                ? 'No feature impact data available'
                : 'No prediction data available'}
            </div>
          )}
        </div>
      </div>

      <div className="note">(其他內容...)</div>

      <div className="actions">
        <button className="previous-button" onClick={() => navigate('/data-training')}>
          previous
        </button>
      </div>
    </div>
  );
};

export default LoadModel;
