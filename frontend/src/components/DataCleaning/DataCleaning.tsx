import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProcessedFileData } from '../../types';
import LineChart from '../LineChart';
import FeatureSelection from './FeatureSelection';
import LabelSelection from './LabelSelection';

interface DataCleaningProps {
  fileData: ProcessedFileData | null;
  setFileData: (data: ProcessedFileData | null) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
}

const DataCleaning: React.FC<DataCleaningProps> = ({
  fileData,
  setFileData,
  selectedFeatures,
  setSelectedFeatures,
  selectedLabel,
  setSelectedLabel,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenFile = async () => {
    setIsLoading(true); // 開始 loading

    try {
    const filePath = await window.electronAPI.openCSV();
      if (!filePath) {
        setIsLoading(false);
        return;
      }

    if (!filePath.endsWith('.csv')) {
      alert('請選擇 CSV 檔案');
      return;
    }

    // 清空狀態（清除圖表與特徵選擇）
    setFileData(null);
    setSelectedFeatures([]);
    setSelectedLabel(null);

    const { headers, sampledTimestamps, sampledFeatures } =
      await window.electronAPI.readCSV(filePath);

    if (sampledTimestamps.length === 0 || sampledFeatures.length === 0) return;

    // 將所有 feature 資料攤平成 values[]
    const values: number[] = [];
    sampledFeatures.forEach((featureArray) => {
      values.push(...featureArray);
    });

    setFileData({
      name: filePath,
      features: headers,
      timestamps: sampledTimestamps,
      values,
    });

    console.log('採樣後資料長度', sampledTimestamps.length, '特徵數量', headers.length);
    } catch (error) {
      console.error('讀取 CSV 錯誤:', error);
    }
    setIsLoading(false); // 結束 loading
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header 區塊 */}
      <div className="h-[5%] flex items-center">
        <button
          className="bg-blue-600 text-white rounded hover:bg-blue-700 transition
             disabled:bg-blue-300 disabled:cursor-not-allowed disabled:hover:bg-blue-300"
          onClick={handleOpenFile}
          disabled={isLoading}
        >
          {isLoading ? 'Importing...' : 'Import'}
        </button>
        <div className="text-gray-600 pl-6 text-lg">{fileData?.name || 'file name'}</div>
      </div>

      {/* 主體區域 */}
      <div className="h-[50%] flex flex-col gap-4 flex-1 overflow-auto custom-scroll">
        {/* 圖表區 */}
        <div className="h-[60%] bg-white shadow rounded-lg p-4 flex justify-center items-center">
          {isLoading ? (
            <div className="text-gray-400 text-lg">Loading...</div>
          ) : fileData ? (
            <LineChart fileData={fileData} selectedFeatures={selectedFeatures} />
          ) : (
            <div className="text-gray-500 text-lg">尚未上傳資料</div>
          )}
        </div>

        {/* 控制區（說明區） */}
        <div className="h-[40%] bg-gray-100 shadow-inner rounded-lg">
          <div className="h-full grid gap-4 md:grid-cols-2">
            <FeatureSelection
              features={fileData?.features || []}
              selectedFeatures={selectedFeatures}
              onFeaturesChange={(features) => {
                setSelectedFeatures(features);
              }}
            />

            <LabelSelection
              features={selectedFeatures || []}
              selectedLabel={selectedLabel}
              onLabelChange={(label) => {
                setSelectedLabel(label);
              }}
            />
          </div>
        </div>
      </div>

      {/* 底部操作按鈕 */}
      <div className="h-[5%] flex justify-end">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          onClick={() => navigate('/model-training')}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataCleaning;
