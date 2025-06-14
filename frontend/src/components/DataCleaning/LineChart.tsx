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
  selectedFeatures: string[];
};

const getChartData = (fileData: ProcessedFileData, selectedFeatures: string[]) => {
  const { timestamps, features, values } = fileData;
  const featureIndexMap = new Map(features.map((f, idx) => [f, idx]));
  const total = selectedFeatures.length;

  const datasets = selectedFeatures
    .map((feature, i) => {
      const featureIndex = featureIndexMap.get(feature);
      if (featureIndex === undefined) return null;

      const data = timestamps.map((_, i) => {
        const valueIndex = featureIndex * timestamps.length + i;
        return values[valueIndex];
      });

      const hue = (360 / total) * i;
      const color = `hsl(${hue}, 70%, 50%)`;

      return {
        label: feature,
        data,
        fill: false,
        borderColor: color,
        tension: 0.2,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  return {
    labels: timestamps,
    datasets,
  };
};

const LineChart: React.FC<Props> = ({ fileData, selectedFeatures }) => {
  if (!fileData.timestamps.length || !fileData.features.length) {
    return <div>檔案內無資料</div>;
  }

  if (selectedFeatures.length === 0) {
    return <div className="text-gray-500">請選擇至少一個特徵</div>;
  }

  const chartData = getChartData(fileData, selectedFeatures);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
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
