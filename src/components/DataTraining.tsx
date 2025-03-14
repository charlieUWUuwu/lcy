import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import FeatureSelection from './FeatureSelection';
import HeatMap from './HeatMap';
import LabelSelection from './LabelSelection';
import LineChart from './LineChart';
import ModelSelection from './ModelSelection';

// Declare the electronAPI property on the window object
declare global {
  interface Window {
    electronAPI: {
      loadFile: (options: { extensions: string[] }) => Promise<string>;
      readFile: (filePath: string) => Promise<string>;
      saveFile: (options: { defaultPath: string; extensions: string[] }) => Promise<string>;
      writeFile: (filePath: string, content: string) => Promise<void>;
    };
  }
}

interface DataTrainingProps {
  onModelTrained: (model: string, accuracy: number, recall: number) => void;
}

interface FileData {
  name: string;
  path: string;
  content?: string;
}

interface Dataset {
  features: string[];
  data: number[][];
}

interface TrainingResult {
  accuracy: number;
  recall: number;
}
interface CorrelationData {
  features: string[];
  matrix: number[][];
}

const DataTraining: React.FC<DataTrainingProps> = ({ onModelTrained }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<FileData | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('LSTM');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null);

  // Handle file import
  // 改成先將輸入的資料傳送到後端，接著獲得下採樣過後的資料(可慮先做筆數判斷)，再做顯示
  const handleFileImport = useCallback(async () => {
    try {
      // In a real application, this would use the Electron API
      const filePath = await window.electronAPI.loadFile({
        extensions: ['csv', 'json', 'xlsx'],
      });

      if (!filePath) return;

      const fileContent = await window.electronAPI.readFile(filePath);
      const fileName = filePath.split(/[/\\]/).pop();

      // Process the file content (example for CSV)
      // In a real app, you'd need proper parsing based on file type
      const processedData = processFileContent(fileContent);

      setFile({
        name: fileName || 'Unknown file',
        path: filePath,
        content: fileContent,
      });

      setDataset({
        features: processedData.headers,
        data: processedData.rows
          .map((row) =>
            Object.values(row).map((value) =>
              typeof value === 'number' ? value : parseFloat(value),
            ),
          )
          .flat() as number[],
      });

      // Set default values
      if (processedData.headers.length > 0) {
        setSelectedFeatures([processedData.headers[0]]);
        setSelectedLabel(processedData.headers[1]);
      }

      // Generate correlation data
      setCorrelationData(generateCorrelationMatrix(processedData));
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Error importing file. Please try again.');
    }
  }, []);

  const processFileContent = (
    content: string,
  ): { headers: string[]; rows: Record<string, number>[] } => {
    // 假設 CSV 內容是以逗號分隔的
    const rows = content.split('\n').map((row) => row.split(',').map((cell) => cell.trim()));

    // 提取特徵（第一列）
    const features = rows.map((row) => row[0]); // 第一列作為特徵

    // 提取數據行（從第二列開始）
    const dataRows = rows
      .map((row) => {
        const rowData: Record<string, any> = {};
        for (let i = 1; i < row.length; i++) {
          rowData[`Feature_${i}`] = row[i] ? parseFloat(row[i]) : null; // 將數據轉換為數字
        }
        return rowData;
      })
      .slice(1); // 去掉標題行

    return {
      headers: features,
      rows: dataRows,
    };
  };

  // Generate correlation matrix (mock implementation)
  const generateCorrelationMatrix = (data: any) => {
    // In a real app, you'd calculate actual correlations between features
    const features = data.headers;
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

  // Handle data cleaning
  const handleDataCleaning = () => {
    // In a real app, you would implement data cleaning logic here
    alert('Data cleaning applied');
  };

  // Handle model training
  const handleTraining = () => {
    if (!dataset || !selectedFeatures.length || !selectedLabel) {
      alert('Please select a file, features, and label first');
      return;
    }

    setIsTraining(true);

    // In a real app, this would trigger actual model training
    // For this example, we'll simulate training with a timeout
    setTimeout(() => {
      const mockAccuracy = 98;
      const mockRecall = 95;

      setTrainingResult({
        accuracy: mockAccuracy,
        recall: mockRecall,
      });

      onModelTrained(selectedModel, mockAccuracy, mockRecall);
      setIsTraining(false);
    }, 2000);
  };

  // Handle model saving
  const handleSaveModel = async () => {
    try {
      // In a real app, this would save the actual model
      const savePath = await window.electronAPI.saveFile({
        defaultPath: `${selectedModel}_model.json`,
        extensions: ['json'],
      });

      if (!savePath) return;

      const modelData = {
        type: selectedModel,
        features: selectedFeatures,
        label: selectedLabel,
        accuracy: trainingResult?.accuracy || 0,
        recall: trainingResult?.recall || 0,
        timestamp: new Date().toISOString(),
      };

      await window.electronAPI.writeFile(savePath, JSON.stringify(modelData, null, 2));
      alert('Model saved successfully');

      // Navigate to the load model page
      navigate('/load-model');
    } catch (error) {
      console.error('Error saving model:', error);
      alert('Error saving model. Please try again.');
    }
  };

  // Chart data for visualization
  // default data: NULL
  // 後面改成
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Temperature',
        data: [25, 20, 30, 22, 35, 28],
        borderColor: 'blue',
      },
      {
        label: 'Pressure',
        data: [400, 500, 450, 700, 600, 550],
        borderColor: 'green',
      },
      {
        label: 'Humidity',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'orange',
      },
    ],
  };

  return (
    <div className="data-training-container">
      <div className="header">
        <button className="import-button" onClick={handleFileImport}>
          import
        </button>
        <div className="file-name">{file?.name || 'file name'}</div>
      </div>

      <div className="main-content">
        <div className="chart-container">
          <LineChart data={chartData} />
        </div>

        <div className="controls">
          <div className="section-title">說明:</div>

          <div className="selection-container">
            <FeatureSelection
              features={dataset?.features || []}
              selectedFeatures={selectedFeatures}
              onFeaturesChange={setSelectedFeatures}
            />

            <LabelSelection
              features={dataset?.features || []}
              selectedLabel={selectedLabel}
              onLabelChange={setSelectedLabel}
            />
          </div>

          <button className="data-cleaning-button" onClick={handleDataCleaning}>
            data cleaning
          </button>
          <div className="note">(lock before data cleaning)</div>
        </div>
      </div>

      <div className="model-training">
        <ModelSelection selectedModel={selectedModel} onModelChange={setSelectedModel} />

        <div className="note">if result not great, select model again to retrain</div>

        <button className="training-button" onClick={handleTraining} disabled={isTraining}>
          {isTraining ? 'Training...' : 'start training'}
        </button>

        <div className="training-results">
          {trainingResult && (
            <>
              <div>Acc: {trainingResult.accuracy}%</div>
              <div>Recall: ...</div>
            </>
          )}
        </div>
      </div>

      <div className="visualization-tabs">
        <div className="tab-headers">
          <div className="tab-header active">feature impact</div>
          <div className="tab-header">Model prediction</div>
        </div>

        <div className="tab-content">
          {correlationData ? (
            <HeatMap data={correlationData} title="Correlation Coefficient" />
          ) : (
            <div className="placeholder">No correlation data available</div>
          )}
        </div>
      </div>

      <div className="actions">
        <button className="previous-button" onClick={() => navigate('/')}>
          previous
        </button>

        <button className="next-button" onClick={handleSaveModel} disabled={!trainingResult}>
          save model
        </button>
      </div>
    </div>
  );
};
export default DataTraining;
