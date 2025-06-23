import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-12">
        <h1 className="text-[120px] text-[#ccc]">LCY</h1>
      </div>
      <div className="flex flex-col gap-5">
        <button className="px-6 py-3 text-base bg-[#f0f0f0] border border-[#ddd] rounded-[5px] cursor-pointer transition-colors duration-300 hover:bg-[#e0e0e0]" onClick={() => navigate('/data-cleaning')}>
          Start Data Training
        </button>
      </div>
    </div>
  );
};

export default Home;
