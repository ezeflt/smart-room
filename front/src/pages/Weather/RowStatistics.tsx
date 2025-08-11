import React from 'react';
import StatusCircle from '../../atoms/StatusCircle';
import './rowStatistics.css';

interface RowStatisticsProps {
  humidity?: number | null;
  pressure?: number | null;
}

function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

const RowStatistics: React.FC<RowStatisticsProps> = ({ humidity, pressure }) => {
  // Left column: live values
  const humidityText = humidity !== null && humidity !== undefined ? `Humidité : ${humidity}%` : 'Humidité : N/A';
  const pressureText = pressure !== null && pressure !== undefined ? `Pression : ${pressure} hPa` : 'Pression : N/A';

  // Center: realistic ranges and highlight current bucket
  const humidityRanges = [
    { variant: 'success' as const, label: 'Bon', text: '30–50% (confort)', match: (v: number) => isBetween(v, 30, 50) },
    { variant: 'warning' as const, label: 'Moyen', text: '20–30% ou 50–60%', match: (v: number) => (isBetween(v, 20, 30) || isBetween(v, 50, 60)) },
    { variant: 'danger' as const, label: 'Mauvais', text: '<20% ou >60%', match: (v: number) => (v < 20 || v > 60) },
  ];

  const pressureRanges = [
    { variant: 'success' as const, label: 'Bon', text: '1000–1025 hPa', match: (v: number) => isBetween(v, 1000, 1025) },
    { variant: 'warning' as const, label: 'Moyen', text: '990–1000 ou 1025–1035', match: (v: number) => (isBetween(v, 990, 1000) || isBetween(v, 1025, 1035)) },
    { variant: 'danger' as const, label: 'Mauvais', text: '<990 ou >1035', match: (v: number) => (v < 990 || v > 1035) },
  ];
  
  const getVariantForValue = (
    value: number | null | undefined,
    ranges: { variant: 'success' | 'warning' | 'danger'; match: (v: number) => boolean }[],
  ): 'success' | 'warning' | 'danger' => {
    if (value === null || value === undefined) return 'warning';
    const found = ranges.find((r) => r.match(value));
    return found ? found.variant : 'warning';
  };

  const humidityVariant = getVariantForValue(humidity, humidityRanges);
  const pressureVariant = getVariantForValue(pressure, pressureRanges);

  const left = [
    { variant: humidityVariant, text: humidityText },
    { variant: pressureVariant, text: pressureText },
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

  const humidityHighlights = humidity !== null && humidity !== undefined
    ? humidityRanges.map((r) => ({ ...r, active: r.match(humidity) }))
    : humidityRanges.map((r) => ({ ...r, active: false }));

  const pressureHighlights = pressure !== null && pressure !== undefined
    ? pressureRanges.map((r) => ({ ...r, active: r.match(pressure) }))
    : pressureRanges.map((r) => ({ ...r, active: false }));

  const renderLegend = (
    ranges: { variant: 'success' | 'warning' | 'danger'; label: string; text: string; active: boolean }[],
  ) => (
    <div className="row-center-row">
      {ranges.map((r, idx) => (
        <StatusCircle
          key={idx}
          variant={r.variant}
          text={`${r.label} · ${r.text}`}
          size={circleSize}
          textSize={textSize}
        />
      ))}
    </div>
  );

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
        {renderLegend(humidityHighlights)}
        {renderLegend(pressureHighlights)}
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
