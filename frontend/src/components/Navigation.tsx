import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavigationProps {
  selectedModel: string | null;
  modelAccuracy: number | null;
}

const Navigation: React.FC<NavigationProps> = ({ selectedModel, modelAccuracy }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <NavLink to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        Home
      </NavLink>
      <NavLink
        to="/data-training"
        className={`nav-item ${isActive('/data-training') ? 'active' : ''}`}
      >
        Data Cleaning
      </NavLink>
      <NavLink
        to="/model-training"
        className={`nav-item ${isActive('/model-training') ? 'active' : ''}`}
      >
        Model Training
      </NavLink>

      {selectedModel && modelAccuracy && (
        <div className="model-info">
          <p>Model: {selectedModel}</p>
          <p>Acc: {modelAccuracy}%</p>
          <p>Recall: ...</p>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
