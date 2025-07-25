import React from 'react';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import DataCleaning from './components/DataCleaning/DataCleaning';
import Home from './components/Home';
import ModelTraining from './components/ModelTraining/ModelTraining';
import Navigation from './components/Navigation';
import { DataCleaningProvider } from './contexts/DataCleaningContext';
import './index.css';

const App: React.FC = () => {
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
                <DataCleaningProvider>
                  <DataCleaning />
                </DataCleaningProvider>
              }
            />
            <Route
              path="/model-training"
              element={
                <DataCleaningProvider>
                  <ModelTraining />
                </DataCleaningProvider>
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
