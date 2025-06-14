import React from 'react';

import { SelectionConfig } from '../../types';

interface FeatureSelectionProps {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
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

    updateFeatures(newSelectedFeatures);
  };

  const updateFeatures = (newFeatures: string[]) => {
    onFeaturesChange(newFeatures);
    if (onSelectionConfigChange) {
      onSelectionConfigChange({ selectedFeatures: newFeatures });
    }
  };

  const handleSelectAll = () => {
    updateFeatures(features);
  };

  const handleClearAll = () => {
    updateFeatures([]);
  };

  return (
    <div className="feature-selection">
      <div className="selection-header font-bold mb-2">Feature Selection</div>

      {/* 控制按鈕區域 */}
      <div className="mb-3 flex gap-2">
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

      {/* 勾選欄區域 */}
      <div className="feature-list max-h-60 overflow-y-auto border p-2 rounded shadow-sm">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="feature-item">
              <label className="feature-label">
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
