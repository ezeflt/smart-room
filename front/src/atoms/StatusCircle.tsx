import React from 'react';
import './StatusCircle.css';

interface StatusCircleProps {
  variant: 'success' | 'warning' | 'danger';
  text: string;
  size?: number;
  textSize?: string;
}

const StatusCircle: React.FC<StatusCircleProps> = ({ variant, text, size = 32, textSize = '1rem' }) => {
  const diameterStyle = { width: size, height: size, minWidth: size, minHeight: size } as React.CSSProperties;
  return (
    <div className="status-circle-row">
      <span aria-hidden="true" className={`status-circle ${variant}`} style={diameterStyle} />
      <span style={{ fontSize: textSize }}>{text}</span>
    </div>
  );
};

export default StatusCircle; 