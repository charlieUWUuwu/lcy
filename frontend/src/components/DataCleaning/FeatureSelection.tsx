import React, { useState } from 'react';
import { getTopFeatures } from '../../apiService';

interface Props {
  features: string[];
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  selectedLabel?: string | null;
  setSelectedLabel: (label: string | null) => void;
}

interface CorrelationDetails {
  correlation: number;
  abs_correlation: number;
  rank: number;
  meets_threshold: boolean;
}

const FeatureSelection: React.FC<Props> = ({
  features,
  selectedFeatures,
  onFeaturesChange,
  selectedLabel,
  setSelectedLabel,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [topFeatures, setTopFeatures] = useState<string[]>([]);
  const [correlationDetails, setCorrelationDetails] = useState<Record<string, CorrelationDetails>>({});
  const [analysisInfo, setAnalysisInfo] = useState<{
    threshold: number;
    featuresAboveThreshold: number;
    usedThresholdFilter: boolean;
  } | null>(null);

  const handleSelectAll = () => {
    onFeaturesChange(features);
  };

  const handleDeselectAll = () => {
    onFeaturesChange([]);
    setTopFeatures([]);
    setCorrelationDetails({});
    setAnalysisInfo(null);
  };

  const handleCalculateTop10 = async () => {
    if (!selectedLabel) {
      alert('請先選擇一個標籤');
      return;
    }

    setIsCalculating(true);
    try {
      const result = await getTopFeatures(selectedLabel, features, 10, 0.4);
      
      // Update the selected features to the recommended ones
      onFeaturesChange(result.top_features);
      
      // Store analysis results for highlighting
      setTopFeatures(result.top_features);
      setCorrelationDetails(result.correlation_details);
      setAnalysisInfo({
        threshold: result.threshold_used,
        featuresAboveThreshold: result.features_above_threshold,
        usedThresholdFilter: result.used_threshold_filter
      });
      
      console.log('Top features analysis completed:', result);
      
      // Create success message
      const aboveThreshold = result.features_above_threshold;
      const threshold = result.threshold_used;
      const topFeaturesList = result.top_features.slice(0, 5).map((feature, idx) => 
        `${idx + 1}. ${feature} (r=${result.correlations[feature].toFixed(3)}${result.correlation_details[feature].meets_threshold ? ' ✓' : ''})`
      ).join('\n');
      
      let message = `計算完成！找到 ${result.top_features.length} 個推薦特徵\n\n`;
      
      if (result.used_threshold_filter) {
        message += `符合閾值 (>${threshold}) 的特徵數: ${aboveThreshold}\n\n`;
      } else {
        message += `無特徵符合閾值 (>${threshold})，已選擇相關性最高的特徵\n\n`;
      }
      
      message += `前5名:\n${topFeaturesList}\n${result.top_features.length > 5 ? '...' : ''}`;
      
      alert(message);
      
    } catch (error) {
      console.error('Error calculating top features:', error);
      // alert(`計算失敗: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    const isSelected = selectedFeatures.includes(feature);
    if (isSelected) {
      onFeaturesChange(selectedFeatures.filter(f => f !== feature));
    } else {
      onFeaturesChange([...selectedFeatures, feature]);
    }
  };

  const getFeatureDisplayInfo = (feature: string) => {
    if (correlationDetails[feature]) {
      const details = correlationDetails[feature];
      return {
        rank: details.rank,
        correlation: details.correlation,
        meetsThreshold: details.meets_threshold,
        isTop: true
      };
    }
    return { isTop: false };
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">特徵選擇</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            全選
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            全部取消
          </button>
          <button
            onClick={handleCalculateTop10}
            disabled={isCalculating}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isCalculating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title={!selectedLabel ? '請先選擇標籤' : '計算與標籤相關性>0.4的前10個特徵'}
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
            閾值: {'>'}{analysisInfo.threshold} | 
            符合條件: {analysisInfo.featuresAboveThreshold} 個 | 
            已選擇: {topFeatures.length} 個
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
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {displayInfo.isTop && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                        displayInfo.meetsThreshold 
                          ? 'bg-green-400 text-green-900'
                          : 'bg-yellow-400 text-yellow-900'
                      }`}>
                        #{displayInfo.rank}
                      </span>
                    )}
                    <span className={`text-sm truncate ${displayInfo.isTop ? 'font-medium' : ''}`}>
                      {feature}
                    </span>
                  </div>
                  {displayInfo.isTop && (
                    <div className="text-xs text-gray-600 mt-1 flex items-center space-x-2">
                      <span>相關性: {displayInfo.correlation?.toFixed(4)}</span>
                      {displayInfo.meetsThreshold && (
                        <span className="text-green-600 font-medium">✓ {'>'}0.4</span>
                      )}
                    </div>
                  )}
                </div>
                {displayInfo.isTop && (
                  <span className={displayInfo.meetsThreshold ? 'text-green-600' : 'text-yellow-600'}>
                    ⭐
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-600 border-t pt-2">
        <div>已選擇: {selectedFeatures.length} / {features.length}</div>
        {topFeatures.length > 0 && (
          <div className="text-green-600">
            推薦特徵: {selectedFeatures.filter(f => topFeatures.includes(f)).length} / {topFeatures.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureSelection;