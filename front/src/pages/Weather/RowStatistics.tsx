import React from 'react';
import StatusCircle from '../../atoms/StatusCircle';
import './rowStatistics.css';

const RowStatistics: React.FC = () => {
  // Static data
  const left = [
    { variant: 'success', text: 'Humidité : 10%' },
    { variant: 'warning', text: 'Pression : 35%' }
  ];
  const right = [
    'Réduire de 30% → vert',
    'Réduire de 10% → vert'
  ];

  // Responsive
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < 700);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
  };
  const isMobile = useIsMobile();
  const circleSize = isMobile ? 32 : 48;
  const textSize = isMobile ? '1rem' : '1.25rem';

  return (
    <div className={`row-statistics${isMobile ? ' mobile' : ''}`}>
      {/* Left section */}
      <div className="row-left">
        {left.map((item, idx) => (
          <StatusCircle key={idx} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
        ))}
      </div>
      {/* Vertical separator */}
      <div className="row-separator" />
      {/* Center section (legends) */}
      <div className="row-center">
        <div className="row-center-row">
          <StatusCircle variant="success" text="10/20%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="20/50%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="50/100%" size={circleSize} textSize={textSize} />
        </div>
        <div className="row-center-row">
          <StatusCircle variant="success" text="10/20%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="20/50%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="50/100%" size={circleSize} textSize={textSize} />
        </div>
      </div>
      {/* Right section */}
      <div className="row-right">
        {right.map((txt, idx) => (
          <span key={idx} className="row-text">{txt}</span>
        ))}
      </div>
    </div>
  );
};

export default RowStatistics;
