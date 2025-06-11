import React from 'react';
import { SelectionConfig } from './modelConfig';

interface FeatureSelectionProps {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  // For JSON configuration
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
    let newSelectedFeatures: string[];
    
    if (selectedFeatures.includes(feature)) {
      // Remove feature if already selected
      newSelectedFeatures = selectedFeatures.filter((f) => f !== feature);
    } else {
      // Add feature if not already selected
      newSelectedFeatures = [...selectedFeatures, feature];
    }
    
    // Update the parent component
    onFeaturesChange(newSelectedFeatures);
    
    // Update JSON configuration if callback is provided
    if (onSelectionConfigChange) {
      onSelectionConfigChange({
        selectedFeatures: newSelectedFeatures
      });
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
