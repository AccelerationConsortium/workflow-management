import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FlowRateChartProps {
  data: Array<{
    timestamp: number;
    value: number;
  }>;
  currentFlowRate: number;
}

export const FlowRateChart: React.FC<FlowRateChartProps> = ({ data, currentFlowRate }) => {
  const chartData = {
    labels: data.map(point => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Flow Rate (mL/min)',
        data: data.map(point => point.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Current Flow Rate',
        data: Array(data.length).fill(currentFlowRate),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Flow Rate History'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Flow Rate (mL/min)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="flow-rate-chart">
      <Line data={chartData} options={options} />
    </div>
  );
}; 
