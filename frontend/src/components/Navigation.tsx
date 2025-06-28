import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-[150px] bg-[#f0f0f0] border-r border-[#ddd] py-5 flex flex-col items-center">
      <NavLink to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        Home
      </NavLink>
      <NavLink
        to="/data-cleaning"
        className={`nav-item ${isActive('/data-cleaning') ? 'active' : ''}`}
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
