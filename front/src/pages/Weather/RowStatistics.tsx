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
  const toHpa = (value?: number | null) =>
    value === null || value === undefined ? null : value / 100;
  const formatPressure = (value?: number | null) => {
    const hpa = toHpa(value);
    return hpa === null ? '--' : `${Math.round(hpa)} hPa`;
  };

  const pressureVariant = (value?: number | null): 'success' | 'warning' | 'danger' => {
    const hpa = toHpa(value);
    if (hpa === null) return 'warning';
    if (hpa >= 1005 && hpa <= 1025) return 'success';
    if ((hpa >= 990 && hpa <= 1004) || (hpa >= 1026 && hpa <= 1035)) return 'warning';
    return 'danger';
  };

  const humidityVariant = (value?: number | null): 'success' | 'warning' | 'danger' => {
    if (value === null || value === undefined) return 'warning';
    if (value >= 40 && value < 60) return 'success';
    if ((value >= 30 && value < 40) || (value >= 60 && value <= 70)) return 'warning';
    return 'danger';
  };

  const left: { variant: 'success' | 'warning' | 'danger'; text: string }[] = [
    { variant: humidityVariant(lastHumidity), text: `Humidité : ${formatPercent(lastHumidity)}` },
    { variant: pressureVariant(lastPressure), text: `Pression : ${formatPressure(lastPressure)}` }
  ];
  // Légende affichée en brut (sans map)

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
      {/* Vertical separator */}
      <div className="row-separator" />
      {/* Right section */}
      <div className="row-right">
        <StatusCircle variant="success" text=" : Température idéale" size={circleSize} textSize={textSize} />
        <StatusCircle variant="warning" text=" : Attention, mais acceptable" size={circleSize} textSize={textSize} />
        <StatusCircle variant="danger" text=" : Très mauvais" size={circleSize} textSize={textSize} />
      </div>
    </div>
  );
};

export default RowStatistics;
