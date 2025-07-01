import React from 'react';

import { SelectionConfig } from '../../types';

interface FeatureSelectionProps {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[], clearLabel: boolean) => void;
  configJson?: string;
  onSelectionConfigChange?: (config: Partial<SelectionConfig>) => void;
}

const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  features,
  selectedFeatures,
  onFeaturesChange,
  onSelectionConfigChange,
}) => {
  const handleFeatureToggle = (feature: string) => {
    const newSelectedFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];

    updateFeatures(newSelectedFeatures, false);
  };

  const updateFeatures = (newFeatures: string[], clearLabel: boolean) => {
    onFeaturesChange(newFeatures, clearLabel);
    if (onSelectionConfigChange) {
      onSelectionConfigChange({ selectedFeatures: newFeatures });
    }
  };

  const handleSelectAll = () => {
    updateFeatures(features, false);
  };

  const handleClearAll = () => {
    updateFeatures([], true);
  };

  return (
    <div className="flex-1 p-2 bg-[#f8f8f8] border border-[#ddd] rounded-[5px]">
      <div className="flex justify-center gap-2">
        <div className="flex w-[80%] justify-center text-center items-center p-[5px] bg-[#f0f0f0] rounded-[3px] mb-[10px] font-bold mb-2">
          Feature Selection
        </div>

        {/* 控制按鈕區域 */}
        <div className="w-[20%] mb-3 flex gap-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSelectAll}
          >
            全選
          </button>
          <button
            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={handleClearAll}
          >
            全部取消
          </button>
        </div>
      </div>

      {/* 勾選欄區域 */}
      <div className="custom-scroll overflow-y-auto max-h-60 border p-2 rounded shadow-sm">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="mb-1">
              <label className="flex items-center gap-[5px]">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="mr-2"
                />
                <span>{feature}</span>
              </label>
            </div>
          ))
        ) : (
          <div className="no-features text-gray-500">No features available</div>
        )}
      </div>
    </div>
  );
};

export default FeatureSelection;
