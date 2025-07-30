import React, { createContext, useContext, useState } from 'react';

import { ProcessedFileData } from '../types';

export type FilterMode = 'all' | 'positive' | 'negative';

interface DataCleaningContextType {
  fileData: ProcessedFileData | null;
  setFileData: (data: ProcessedFileData | null) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
}

const DataCleaningContext = createContext<DataCleaningContextType | null>(null);

export const DataCleaningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileData, setFileData] = useState<ProcessedFileData | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  return (
    <DataCleaningContext.Provider
      value={{
        fileData,
        setFileData,
        selectedFeatures,
        setSelectedFeatures,
        selectedLabel,
        setSelectedLabel,
        filterMode,
        setFilterMode,
      }}
    >
      {children}
    </DataCleaningContext.Provider>
  );
};

export const useDataCleaningContext = (): DataCleaningContextType => {
  const context = useContext(DataCleaningContext);
  if (!context) {
    throw new Error('useDataCleaningContext must be used within a DataCleaningProvider');
  }
  return context;
};
