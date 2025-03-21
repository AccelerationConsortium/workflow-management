import React, { useEffect, useRef, useState } from 'react';
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
import { DeviceStatus, HotplateParameters } from '../../../../../services/lcp/types';
import { HOTPLATE_CONSTANTS } from '../constants';
import '../styles.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ParameterChartProps {
  status: DeviceStatus<HotplateParameters> | null;
}

interface DataPoint {
  timestamp: string;
  temperature: number;
  stirringSpeed: number;
}

const MAX_DATA_POINTS = 60; // Show last 2 minutes of data (2s update interval)

export const ParameterChart: React.FC<ParameterChartProps> = ({ status }) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const chartRef = useRef<ChartJS>(null);

  useEffect(() => {
    if (status?.parameters) {
      const newPoint = {
        timestamp: new Date().toISOString(),
        temperature: status.parameters.current_temperature,
        stirringSpeed: status.parameters.current_stirring_speed
      };

      setDataPoints(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-MAX_DATA_POINTS);
      });
    }
  }, [status]);

  const chartData = {
    labels: dataPoints.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleTimeString();
    }),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: dataPoints.map(point => point.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'temperature'
      },
      {
        label: 'Stirring Speed (RPM)',
        data: dataPoints.map(point => point.stirringSpeed),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'stirringSpeed'
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      temperature: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: HOTPLATE_CONSTANTS.TEMPERATURE.MAX,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      stirringSpeed: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        min: 0,
        max: HOTPLATE_CONSTANTS.STIRRING_SPEED.MAX,
        title: {
          display: true,
          text: 'Stirring Speed (RPM)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="parameter-chart-container">
      <Line data={chartData} options={options} ref={chartRef} />
      {status?.parameters && (
        <div className="parameter-targets">
          <div className="target-item">
            <span className="target-label">Target Temperature:</span>
            <span className="target-value">{status.parameters.target_temperature}°C</span>
          </div>
          <div className="target-item">
            <span className="target-label">Target Stirring Speed:</span>
            <span className="target-value">{status.parameters.target_stirring_speed} RPM</span>
          </div>
        </div>
      )}
    </div>
  );
}; 
