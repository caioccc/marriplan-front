import React from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ value, size = 72, stroke = 6, color = '#C4756A' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDE8E0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="progress-ring-label" style={{ fontSize: size * 0.23 }}>{value}%</span>
    </div>
  );
};

export default ProgressRing;
