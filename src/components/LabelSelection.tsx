import React from 'react';

interface LabelSelectionProps {
  features: string[];
  selectedLabel: string | null;
  onLabelChange: (label: string | null) => void;
}

const LabelSelection: React.FC<LabelSelectionProps> = ({
  features,
  selectedLabel,
  onLabelChange,
}) => {
  const handleLabelChange = (feature: string) => {
    onLabelChange(feature);
  };

  return (
    <div className="label-selection">
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
