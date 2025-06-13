import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Dataset, ProcessedFileData, SelectionConfig } from '../../types';
import FeatureSelection from './FeatureSelection';
import LabelSelection from './LabelSelection';
import LineChart from './LineChart';

interface DataTrainingProps {
  onModelTrained: (model: string, accuracy: number, recall: number) => void;
}

const DataTraining: React.FC<DataTrainingProps> = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State declarations
  const [fileData, setFileData] = useState<ProcessedFileData | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // Update dataset when fileData changes
  useEffect(() => {
    if (fileData) {
      // Convert fileData to dataset format
      const data: number[][] = [];
      const featuresCount = fileData.features.length;
      const rowsCount = fileData.timestamps.length;

      for (let i = 0; i < rowsCount; i++) {
        const row: number[] = [];
        for (let j = 0; j < featuresCount; j++) {
          const index = i * featuresCount + j;
          row.push(fileData.values[index] || 0);
        }
        data.push(row);
      }

      setDataset({
        features: fileData.features,
        data: data,
      });
    }
  }, [fileData]);

  // 用戶選擇訓練特徵
  const updateJsonConfig = useCallback((config: Partial<SelectionConfig>) => {
    setJsonConfig((prev) => ({
      ...prev,
      ...config,
    }));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    console.log('AAA: ', file);

    // 檢查副檔名
    if (!file.name.endsWith('.csv')) {
      alert('請選擇 CSV 檔案');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;

      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map((h) => h.trim());
      const featureHeaders = headers.slice(1); // 假設第一欄是 timestamp

      const timestamps: string[] = [];
      const values: number[] = [];

      lines.slice(1).forEach((line) => {
        const cells = line.split(',').map((c) => c.trim());

        const timestamp = cells[0];
        if (timestamp) {
          timestamps.push(timestamp);
        }

        featureHeaders.forEach((_, i) => {
          const value = Number(cells[i + 1]); // +1 是因為第 0 是 timestamp
          values.push(isNaN(value) ? 0 : value);
        });
      });

      setFileData({
        name: file.name,
        features: featureHeaders,
        timestamps,
        values,
      });

      console.log(file.name);
      console.log(featureHeaders);
      console.log(timestamps);
      console.log(values);
    };

    reader.readAsText(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // 手動觸發 <input> 的 click 事件
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
        <div>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button className="import-button" onClick={handleButtonClick}>
            Import
          </button>
        </div>
        <div className="file-name">{fileData?.name || 'file name'}</div>
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
              onFeaturesChange={(features) => {
                setSelectedFeatures(features);
                setConfigChangeSource('features');
              }}
              onSelectionConfigChange={(config) => {
                updateJsonConfig(config);
              }}
            />

            <LabelSelection
              features={dataset?.features || []}
              selectedLabel={selectedLabel}
              onLabelChange={(label) => {
                setSelectedLabel(label);
                setConfigChangeSource('features');
              }}
              onSelectionConfigChange={(config) => {
                updateJsonConfig(config);
              }}
            />
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="next-button" onClick={() => navigate('/model-training')}>
          next
        </button>
      </div>
    </div>
  );
};

export default DataTraining;
