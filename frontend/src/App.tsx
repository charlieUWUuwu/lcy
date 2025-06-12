import React, { useState } from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import DataTraining from './components/DataCleaning/DataCleaning';
import Home from './components/Home';
import ModelTraining from './components/ModelTraining/ModelTraining';
// import LoadModel from './components/LoadModel';
import Navigation from './components/Navigation';
import './index.css';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);

  return (
    <Router>
      <div className="app-container">
        <Navigation selectedModel={selectedModel} modelAccuracy={modelAccuracy} />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/data-training"
              element={
                <DataTraining
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
