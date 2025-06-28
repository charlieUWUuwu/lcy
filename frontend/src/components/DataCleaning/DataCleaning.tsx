import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProcessedFileData, SelectionConfig } from '../../types';
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

  const handleOpenFile = async () => {
    const filePath = await window.electronAPI.openCSV();
    if (!filePath) return;

    if (!filePath.endsWith('.csv')) {
      alert('請選擇 CSV 檔案');
      return;
    }

    // 清空狀態（清除圖表與特徵選擇）
    setFileData(null);
    setSelectedFeatures([]);
    setSelectedLabel(null);

    const fileContent = await window.electronAPI.readCSV(filePath);
    const lines = fileContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map((h) => h.trim());
    const featureHeaders = headers.slice(1); // 第一欄是 timestamp

    const rawTimestamps: string[] = [];
    const rawFeatures: number[][] = Array.from({ length: featureHeaders.length }, () => []);

    lines.slice(1).forEach((line) => {
      const cells = line.split(',').map((c) => c.trim());
      const timestamp = cells[0];
      if (timestamp) rawTimestamps.push(timestamp);

      featureHeaders.forEach((_, i) => {
        const value = Number(cells[i + 1]);
        rawFeatures[i].push(isNaN(value) ? 0 : value);
      });
    });

    // === 下採樣邏輯 ===
    const maxTotalPoints = 2100;
    const N = rawTimestamps.length;
    const M = featureHeaders.length;
    let factor = 1;

    if (N * M > maxTotalPoints) {
      factor = Math.ceil((N * M) / maxTotalPoints);
    }

    console.log(`原始資料點數: ${N * M}，特徵數: ${M}，計算下採樣因子: ${factor}`);

    const sampledTimestamps = rawTimestamps.filter((_, i) => i % factor === 0);
    const sampledFeatures = rawFeatures.map((featureArray) =>
      featureArray.filter((_, i) => i % factor === 0),
    );

    // 把所有 feature 合併成一個 values[]，方便傳到前端繪圖
    const values: number[] = [];
    sampledFeatures.forEach((featureArray) => {
      values.push(...featureArray);
    });

    setFileData({
      name: filePath,
      features: featureHeaders,
      timestamps: sampledTimestamps,
      values,
    });

    console.log('採樣後資料長度', sampledTimestamps.length, '特徵數量', featureHeaders.length);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header 區塊 */}
      <div className="h-[5%] flex items-center">
        <button
          className="bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleOpenFile}
        >
          Import
        </button>
        <div className="text-gray-600 pl-6 text-lg">{fileData?.name || 'file name'}</div>
      </div>

      {/* 主體區域 */}
      <div className="h-[50%] flex flex-col gap-4 flex-1 overflow-auto custom-scroll">
        {/* 圖表區 */}
        <div className="h-[60%] bg-white shadow rounded-lg p-4 flex justify-center items-center">
          {fileData ? (
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
