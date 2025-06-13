import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="logo-container">
        <h1 className="logo">LCY</h1>
      </div>
      <div className="button-container">
        <button className="action-button" onClick={() => navigate('/data-cleaning')}>
          Start Data Training
        </button>
      </div>
    </div>
  );
};

export default Home;
