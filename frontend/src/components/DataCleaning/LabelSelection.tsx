import React from 'react';

import { SelectionConfig } from '../../types';

interface LabelSelectionProps {
  features: string[];
  selectedLabel: string | null;
  onLabelChange: (label: string | null) => void;
  // For JSON configuration
  configJson?: string;
  onSelectionConfigChange?: (config: Partial<SelectionConfig>) => void;
}

const LabelSelection: React.FC<LabelSelectionProps> = ({
  features,
  selectedLabel,
  onLabelChange,
  onSelectionConfigChange,
}) => {
  const handleLabelChange = (feature: string) => {
    // Update the parent component
    onLabelChange(feature);

    // Update JSON configuration if callback is provided
    if (onSelectionConfigChange) {
      onSelectionConfigChange({
        selectedLabel: feature,
      });
    }
  };

  return (
    <div className="flex-1 p-2 bg-[#f8f8f8] border border-[#ddd] rounded-[5px]">
      <div className="selection-header">label selection</div>
      <div className="label-list">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="label-item">
              <label className="label-radio">
                <input
                  type="radio"
                  name="label-selection"
                  checked={selectedLabel === feature}
                  onChange={() => handleLabelChange(feature)}
                />
                <span>{feature}</span>
              </label>
            </div>
          ))
        ) : (
          <div className="no-labels">No features available</div>
        )}
      </div>
    </div>
  );
};

export default LabelSelection;
