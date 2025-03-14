import React, { useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import DataTraining from './components/DataTraining';
import Home from './components/Home';
import LoadModel from './components/LoadModel';
import Navigation from './components/Navigation';
import './index.css';

const App: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [modelRecall, setModelRecall] = useState<number | null>(null);

  const handleClick = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3500/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num1: 1, num2: 5 }),
      });

      if (!response.ok) throw new Error('API 請求失敗');

      const data = await response.json();
      setCount(data.sum); // 更新 count
    } catch (error) {
      console.error('請求錯誤:', error);
    }
  };

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
            <Route
              path="/load-model"
              element={
                <LoadModel
                  selectedModel={selectedModel}
                  modelAccuracy={modelAccuracy}
                  modelRecall={modelRecall}
                  onModelLoaded={(model, accuracy, recall) => {
                    setSelectedModel(model);
                    setModelAccuracy(accuracy);
                    setModelRecall(recall);
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
