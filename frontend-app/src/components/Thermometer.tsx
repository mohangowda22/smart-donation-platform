import React from 'react';
import './../styles/Thermometer.css'; // Import thermometer-specific styles

interface ThermometerProps {
  currentAmount: number;
  targetAmount: number;
}

const Thermometer: React.FC<ThermometerProps> = ({ currentAmount, targetAmount }) => {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100); // Calculate progress percentage

  return (
    <div className="thermometer">
      <div
        className="thermometer-fill"
        style={{ width: `${progress}%` }}
      ></div>
      <span className="thermometer-text">{Math.round(progress)}%</span>
    </div>
  );
};

export default Thermometer;