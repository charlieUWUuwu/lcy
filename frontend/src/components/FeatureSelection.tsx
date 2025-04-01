import React from 'react';

interface FeatureSelectionProps {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
}

const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  features,
  selectedFeatures,
  onFeaturesChange,
}) => {
  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      // Remove feature if already selected
      onFeaturesChange(selectedFeatures.filter((f) => f !== feature));
    } else {
      // Add feature if not already selected
      onFeaturesChange([...selectedFeatures, feature]);
    }
  };

  return (
    <div className="feature-selection">
      <div className="selection-header">feature selection</div>
      <div className="feature-list">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="feature-item">
              <label className="feature-label">
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                />
                <span>{feature}</span>
              </label>
            </div>
          ))
        ) : (
          <div className="no-features">No features available</div>
        )}
      </div>
    </div>
  );
};

export default FeatureSelection;
