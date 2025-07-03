import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { generateFeatureAnalysis } from '../../apiService';
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
  setImages: React.Dispatch<
    React.SetStateAction<{
      all: string;
      positive: string;
      negative: string;
    } | null>
  >;
}

const DataCleaning: React.FC<DataCleaningProps> = ({
  fileData,
  setFileData,
  selectedFeatures,
  setSelectedFeatures,
  selectedLabel,
  setSelectedLabel,
  setImages,
}) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenFile = async () => {
    setIsLoading(true); // 開始 loading

    try {
      const result = await window.electronAPI.openCSV();

      if (!result) {
        setIsLoading(false);
        return;
      }

      if ('error' in result) {
        alert(result.error);
        setIsLoading(false);
        return;
      }

      const filePath = result.filePath;
      if (!filePath || !filePath.endsWith('.csv')) {
        alert('請選擇 CSV 檔案');
        setIsLoading(false);
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

  const handleNext = async () => {
    if (!selectedFeatures.length || !selectedLabel) {
      alert('Please select features and a label before proceeding');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate feature analysis before navigating
      const results = await generateFeatureAnalysis(selectedFeatures, selectedLabel);
      setImages({
        all: results.all,
        positive: results.positive,
        negative: results.negative,
      });

      // Navigate to model training page
      navigate('/model-training');
    } catch (error) {
      console.error('Error generating feature analysis:', error);
      alert('Failed to generate feature analysis. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
              csv_pth={fileData?.name || ''}
              features={fileData?.features || []}
              selectedFeatures={selectedFeatures}
              selectedLabel={selectedLabel}
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
          className="px-6 py-2 bg-green-600 text-white rounded transition
             hover:bg-green-700
             disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
          onClick={handleNext}
          disabled={selectedFeatures.length === 0 || selectedLabel === null || isGenerating}
        >
          {isGenerating ? 'Generating Analysis...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default DataCleaning;
