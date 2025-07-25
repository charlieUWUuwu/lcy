import React, { useState } from 'react';

import { getTopFeatures } from '../../apiService';
import { useDataCleaningContext } from '../../contexts/DataCleaningContext';
import { SelectionConfig } from '../../types';

interface Props {
  csv_pth: string;
  features: string[];
  onSelectionConfigChange?: (config: Partial<SelectionConfig>) => void;
}

interface CorrelationDetails {
  correlation: number;
  abs_correlation: number;
  rank: number;
  meets_threshold: boolean;
}

const FeatureSelection: React.FC<Props> = ({ csv_pth, features, onSelectionConfigChange }) => {
  const { selectedFeatures, setSelectedFeatures, selectedLabel, setSelectedLabel } =
    useDataCleaningContext();

  const [isCalculating, setIsCalculating] = useState(false);
  const [topFeatures, setTopFeatures] = useState<string[]>([]);
  const [correlationDetails, setCorrelationDetails] = useState<Record<string, CorrelationDetails>>(
    {},
  );
  const [analysisInfo, setAnalysisInfo] = useState<{
    threshold: number;
    featuresAboveThreshold: number;
    usedThresholdFilter: boolean;
  } | null>(null);

  const handleFeatureToggle = (feature: string) => {
    const newSelected = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];

    updateFeatures(newSelected, false);
  };

  const updateFeatures = (newFeatures: string[], clearLabel: boolean) => {
    setSelectedFeatures(newFeatures);
    if (clearLabel) {
      setSelectedLabel(null);
    }

    if (onSelectionConfigChange) {
      onSelectionConfigChange({ selectedFeatures: newFeatures });
    }
  };

  const getFeatureDisplayInfo = (feature: string) => {
    const details = correlationDetails[feature];
    return details
      ? {
          rank: details.rank,
          correlation: details.correlation,
          meetsThreshold: details.meets_threshold,
          isTop: true,
        }
      : { isTop: false };
  };

  const handleSelectAll = () => {
    setSelectedFeatures(features);
  };

  const handleDeselectAll = () => {
    setSelectedFeatures([]);
    setTopFeatures([]);
    setCorrelationDetails({});
    setAnalysisInfo(null);
    setSelectedLabel(null);
  };

  const handleCalculateTop = async () => {
    if (!selectedLabel) {
      alert('請先選擇一個標籤');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await getTopFeatures(csv_pth, selectedLabel, selectedFeatures);
      const newSelectedFeatures = [...result.top_features, selectedLabel];

      setSelectedFeatures(newSelectedFeatures);
      setTopFeatures(result.top_features);
      setCorrelationDetails(result.correlation_details);
      setAnalysisInfo({
        threshold: result.threshold_used,
        featuresAboveThreshold: result.features_above_threshold,
        usedThresholdFilter: result.used_threshold_filter,
      });

      const topList = result.top_features
        .slice(0, 5)
        .map(
          (f, i) =>
            `${i + 1}. ${f} (r=${result.correlations[f].toFixed(3)}${
              result.correlation_details[f].meets_threshold ? ' ✓' : ''
            })`,
        )
        .join('\n');

      let message = `計算完成！找到 ${result.top_features.length} 個推薦特徵\n\n`;
      if (result.used_threshold_filter) {
        message += `符合閾值 (>${result.threshold_used}) 的特徵數: ${result.features_above_threshold}\n\n`;
      } else {
        message += `無特徵符合閾值，已選擇相關性最高的特徵\n\n`;
      }
      message += `前5名:\n${topList}${result.top_features.length > 5 ? '\n...' : ''}`;
      alert(message);
    } catch (e) {
      console.error('Error calculating top features:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">特徵選擇</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSelectAll} className="btn bg-blue-500 hover:bg-blue-600">
            全選
          </button>
          <button onClick={handleDeselectAll} className="btn bg-gray-500 hover:bg-gray-600">
            全部取消
          </button>
          <button
            onClick={handleCalculateTop}
            disabled={isCalculating}
            className={`btn ${
              isCalculating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isCalculating ? '計算中...' : 'Top 特徵'}
          </button>
        </div>
      </div>

      {analysisInfo && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
          <div className="text-green-800 font-medium">
            ✨ 已選擇推薦的重要特徵 (基於與 {selectedLabel} 的相關性)
          </div>
          <div className="text-green-700 text-xs mt-1">
            閾值: &gt;{analysisInfo.threshold} | 符合條件: {analysisInfo.featuresAboveThreshold} 個
            | 已選擇: {topFeatures.length} 個
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scroll">
        <div className="space-y-2">
          {features.map((feature) => {
            const displayInfo = getFeatureDisplayInfo(feature);
            const isSelected = selectedFeatures.includes(feature);

            return (
              <label
                key={feature}
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded transition-colors ${
                  displayInfo.isTop
                    ? displayInfo.meetsThreshold
                      ? 'bg-green-50 border border-green-300 hover:bg-green-100'
                      : 'bg-yellow-50 border border-yellow-300 hover:bg-yellow-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleFeatureToggle(feature)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {displayInfo.isTop && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          displayInfo.meetsThreshold
                            ? 'bg-green-400 text-green-900'
                            : 'bg-yellow-400 text-yellow-900'
                        }`}
                      >
                        #{displayInfo.rank}
                      </span>
                    )}
                    <span className={`text-sm truncate ${displayInfo.isTop ? 'font-medium' : ''}`}>
                      {feature}
                    </span>
                  </div>
                  {displayInfo.isTop && (
                    <div className="text-xs text-gray-600 mt-1">
                      相關性: {displayInfo.correlation?.toFixed(4)}
                      {displayInfo.meetsThreshold && (
                        <span className="text-green-600 ml-2 font-medium">✓ &gt;0.4</span>
                      )}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-600 border-t pt-2">
        <div>
          已選擇: {selectedFeatures.length} / {features.length}
        </div>
        {topFeatures.length > 0 && (
          <div className="text-green-600">
            推薦特徵: {selectedFeatures.filter((f) => topFeatures.includes(f)).length} /{' '}
            {topFeatures.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureSelection;
