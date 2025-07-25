import React, { useState } from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import DataCleaning from './components/DataCleaning/DataCleaning';
import Home from './components/Home';
import ModelTraining from './components/ModelTraining/ModelTraining';
import Navigation from './components/Navigation';
import './index.css';
import { ProcessedFileData, SelectionConfig } from './types';

const App: React.FC = () => {
  // const [selectedModel, setSelectedModel] = useState<string | null>(null);
  // const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);

  const [fileData, setFileData] = useState<ProcessedFileData | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'positive' | 'negative'>('all');

  return (
    <Router>
      <div className="flex h-screen">
        <Navigation />
        <div className="flex-1 p-5 overflow-y-auto custom-scroll">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/data-cleaning"
              element={
                <DataCleaning
                  fileData={fileData}
                  setFileData={setFileData}
                  selectedFeatures={selectedFeatures}
                  setSelectedFeatures={setSelectedFeatures}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                  filterMode={filterMode}
                  setFilterMode={setFilterMode}
                />
              }
            />
            <Route path="/model-training" element={<ModelTraining />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
