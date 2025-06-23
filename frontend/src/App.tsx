import React, { useState } from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import DataCleaning from './components/DataCleaning/DataCleaning';
import Home from './components/Home';
import ModelTraining from './components/ModelTraining/ModelTraining';
import Navigation from './components/Navigation';
import './index.css';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);

  return (
    <Router>
      <div className="flex h-screen">
        <Navigation />
        <div className="flex-1 p-5 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/data-cleaning"
              element={
                <DataCleaning
                  onModelTrained={(model, accuracy, recall) => {
                    setSelectedModel(model);
                    setModelAccuracy(accuracy);
                    setModelRecall(recall);
                  }}
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
