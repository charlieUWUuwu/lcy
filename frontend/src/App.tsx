import { useState } from 'react';

import './App.css';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);

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
    <>
      <div>
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <div className="flex justify-center items-center space-x-4">
          {' '}
          {/* 置中並水平排列圖片 */}
          <a href="https://vite.dev" target="_blank" rel="noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleClick}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
