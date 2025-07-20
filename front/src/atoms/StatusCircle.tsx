import React from 'react';

interface StatusCircleProps {
  variant: 'success' | 'warning' | 'danger';
  text: string;
  size?: number;
  textSize?: string;
}

const variantColors = {
  success: '#B2F2BB',
  warning: '#FFE0A3',
  danger: '#F2B2B2',
};

const StatusCircle: React.FC<StatusCircleProps> = ({ variant, text, size = 32, textSize = '1rem' }) => {
  const circleColor = variantColors[variant];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          background: circleColor,
          border: '1.5px solid #e0e0e0',
          boxShadow: '3px 3px 8px 0px rgba(44, 62, 80, 0.18)',
        }}
      />
      <span style={{ fontSize: textSize }}>{text}</span>
    </div>
  );
};

export default StatusCircle; 