import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
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
    </nav>
  );
};

export default Navigation;
