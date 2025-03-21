import React from 'react';
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
import { Line } from 'react-chartjs-2';
import { SENSOR_STATUS, SENSOR_TYPES } from '../constants';
import './SensorDataDisplay.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  value: number;
  timestamp: number;
}

interface SensorDataDisplayProps {
  type: keyof typeof SENSOR_TYPES;
  currentValue: number;
  unit: string;
  status: keyof typeof SENSOR_STATUS;
  historyData: DataPoint[];
  alarmThresholds?: {
    high: number;
    low: number;
  };
}

export const SensorDataDisplay: React.FC<SensorDataDisplayProps> = ({
  type,
  currentValue,
  unit,
  status,
  historyData,
  alarmThresholds
}) => {
  const formatValue = (value: number) => {
    return value.toFixed(2);
  };

  const getStatusColor = (status: keyof typeof SENSOR_STATUS) => {
    switch (status) {
      case 'normal':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'alarm':
        return '#f44336';
      case 'error':
        return '#d32f2f';
      case 'calibrating':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const chartData = {
    labels: historyData.map(point => 
      new Date(point.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: `${type} (${unit})`,
        data: historyData.map(point => point.value),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4
      },
      ...(alarmThresholds ? [
        {
          label: 'High Threshold',
          data: Array(historyData.length).fill(alarmThresholds.high),
          borderColor: '#ff9800',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Low Threshold',
          data: Array(historyData.length).fill(alarmThresholds.low),
          borderColor: '#ff9800',
          borderDash: [5, 5],
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        }
      ] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: `${type} Measurement History`
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      }
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="sensor-data-display">
      <div className="current-value-container">
        <div className="value-display">
          <span className="value">{formatValue(currentValue)}</span>
          <span className="unit">{unit}</span>
        </div>
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(status) }}>
          {SENSOR_STATUS[status]}
        </div>
      </div>
      
      {alarmThresholds && (
        <div className="threshold-display">
          <div className="threshold high">
            <span>High: {formatValue(alarmThresholds.high)} {unit}</span>
          </div>
          <div className="threshold low">
            <span>Low: {formatValue(alarmThresholds.low)} {unit}</span>
          </div>
        </div>
      )}

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}; 
