import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

import { ProcessedFileData } from '../../types/';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

type Props = {
  fileData: ProcessedFileData;
};

const getChartData = (fileData: ProcessedFileData) => {
  const { timestamps, features, values } = fileData;

  const datasets = features.map((feature, featureIndex) => {
    const data = timestamps.map((_, i) => {
      const valueIndex = i + featureIndex * timestamps.length;
      return values[valueIndex];
    });

    const color = `hsl(${(featureIndex * 60) % 360}, 70%, 50%)`; // 彩色區分

    return {
      label: feature,
      data,
      fill: false,
      borderColor: color,
      tension: 0.2,
    };
  });

  return {
    labels: timestamps,
    datasets,
  };
};

const LineChart: React.FC<Props> = ({ fileData }) => {
  if (!fileData.timestamps.length || !fileData.features.length) {
    return <div>檔案內無資料</div>;
  }

  const chartData = getChartData(fileData);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: fileData.name,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '時間',
        },
      },
      y: {
        title: {
          display: true,
          text: '數值',
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex justify-center items-center overflow-auto">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
