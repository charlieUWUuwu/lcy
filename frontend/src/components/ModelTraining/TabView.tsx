import React from 'react';

import { ProcessedFileData } from '../../types';
import LineChart from '../LineChart';

interface Props {
  images: {
    all: string;
    positive: string;
    negative: string;
  } | null;
  selected: 'all' | 'positive' | 'negative';
  setSelected: React.Dispatch<React.SetStateAction<'all' | 'positive' | 'negative'>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  fileData: ProcessedFileData;
  selectedFeatures: string[];
}

const ModelOutputVisualization: React.FC<Props> = ({
  images,
  selected,
  setSelected,
  activeTab,
  setActiveTab,
  fileData,
  selectedFeatures,
}) => {
  return (
    <div className="mt-5 xl:mt-0 p-4 bg-gray-50 rounded-md border border-gray-200 order-2 xl:order-none">
      <div className="h-full flex flex-col">
        {/* Tab Headers */}
        <div className="w-full flex bg-gray-100 border-b border-gray-300 gap-2.5 mb-5">
          <div
            className={`px-4 py-2 cursor-pointer transition-colors duration-200 ${
              activeTab === 'feature' ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('feature')}
          >
            Feature impact
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
  );
};

export default ModelOutputVisualization;
