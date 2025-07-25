import React from 'react';

interface LabelSelectionProps {
  features: string[];
  selectedLabel: string | null;
  filterMode: 'all' | 'positive' | 'negative';
  onLabelChange: (label: string | null) => void;
  onFilterModeChange: (mode: 'all' | 'positive' | 'negative') => void;
  // For JSON configuration
  configJson?: string;
}

const LabelSelection: React.FC<LabelSelectionProps> = ({
  features,
  selectedLabel,
  filterMode,
  onLabelChange,
  onFilterModeChange,
}) => {
  const handleLabelChange = (feature: string) => {
    onLabelChange(feature);
  };

  const handleFilterModeChange = (mode: 'all' | 'positive' | 'negative') => {
    onFilterModeChange(mode);
  };

  return (
    <div className="flex-1 p-2 bg-[#f8f8f8] border border-[#ddd] rounded-[5px]">
      <div className="text-center p-[5px] bg-[#f0f0f0] rounded-[3px] mb-[10px] font-bold">
        Label Selection
      </div>
      <div className="max-h-60 overflow-y-auto custom-scroll border p-2 rounded shadow-sm">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div key={index} className="mb-2">
              <label className="flex items-center gap-[5px]">
                <input
                  type="radio"
                  name="label-selection"
                  checked={selectedLabel === feature}
                  onChange={() => handleLabelChange(feature)}
                />
                <span>{feature}</span>
              </label>
              {/* 有選擇 feature 才顯示 all/positive/negative 選項 */}
              {selectedLabel === feature && (
                <div className="ml-5 mt-2 bg-gray-100 p-2 rounded border border-gray-300 text-sm flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="filter-mode"
                      value="all"
                      checked={filterMode === 'all'}
                      onChange={() => handleFilterModeChange('all')}
                    />
                    All
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="filter-mode"
                      value="positive"
                      checked={filterMode === 'positive'}
                      onChange={() => handleFilterModeChange('positive')}
                    />
                    Positive
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="filter-mode"
                      value="negative"
                      checked={filterMode === 'negative'}
                      onChange={() => handleFilterModeChange('negative')}
                    />
                    Negative
                  </label>
                </div>
              )}
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
