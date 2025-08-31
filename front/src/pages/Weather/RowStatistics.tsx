import React from 'react';
import StatusCircle from '../../atoms/StatusCircle';
import './rowStatistics.css';

interface RowStatisticsProps {
  lastHumidity?: number | null;
  lastPressure?: number | null;
}

const RowStatistics: React.FC<RowStatisticsProps> = ({ lastHumidity, lastPressure }) => {
  const formatPercent = (value?: number | null) =>
    value === null || value === undefined ? '--' : `${Math.round(value)}%`;
  const formatPressure = (value?: number | null) =>
    value === null || value === undefined ? '--' : `${Math.round(value)} hPa`;

  const pressureVariant = (value?: number | null): 'success' | 'warning' | 'danger' => {
    if (value === null || value === undefined) return 'warning';
    if (value >= 1005 && value <= 1025) return 'success';
    if ((value >= 990 && value <= 1004) || (value >= 1026 && value <= 1035)) return 'warning';
    return 'danger';
  };

  const left: { variant: 'success' | 'warning' | 'danger'; text: string }[] = [
    { variant: 'success', text: `Humidité : ${formatPercent(lastHumidity)}` },
    { variant: pressureVariant(lastPressure), text: `Pression : ${formatPressure(lastPressure)}` }
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
          <StatusCircle variant="success" text="40–60%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="30–39/61–70%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="<30%/>70%" size={circleSize} textSize={textSize} />
        </div>
        <div className="row-center-row">
          <StatusCircle variant="success" text="1005–1025 hPa" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="990–1004/1026–1035 hPa" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="<990/>1035 hPa" size={circleSize} textSize={textSize} />
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
