import React from 'react';
import StatusCircle from '../../atoms/StatusCircle';
import './rowStatistics.css';
import {
  MOBILE_BREAKPOINT,
  CIRCLE_SIZE_MOBILE,
  CIRCLE_SIZE_DESKTOP,
  TEXT_SIZE_MOBILE,
  TEXT_SIZE_DESKTOP,
  HUMIDITY_IDEAL_MIN,
  HUMIDITY_IDEAL_MAX,
  HUMIDITY_WARN_LOW_MIN,
  HUMIDITY_WARN_LOW_MAX,
  HUMIDITY_WARN_HIGH_MIN,
  HUMIDITY_WARN_HIGH_MAX,
  PRESSURE_IDEAL_MIN,
  PRESSURE_IDEAL_MAX,
  PRESSURE_WARN_LOW_MIN,
  PRESSURE_WARN_LOW_MAX,
  PRESSURE_WARN_HIGH_MIN,
  PRESSURE_WARN_HIGH_MAX,
} from './constants';

type Variant = 'success' | 'warning' | 'danger';

interface RowStatisticsProps {
  lastHumidity?: number | null;
  lastPressure?: number | null;
}

// Formatting helpers
const formatPercent = (value?: number | null) =>
  value === null || value === undefined ? '--' : `${Math.round(value)}%`;

const toHpa = (value?: number | null) =>
  value === null || value === undefined ? null : value / 100;

const formatPressure = (value?: number | null) => {
  const hpa = toHpa(value);
  return hpa === null ? '--' : `${Math.round(hpa)} hPa`;
};

// Thresholds and variants
const pressureVariant = (value?: number | null): Variant => {
  const hpa = toHpa(value);
  if (hpa === null) return 'warning';
  if (hpa >= PRESSURE_IDEAL_MIN && hpa <= PRESSURE_IDEAL_MAX) return 'success';
  if ((hpa >= PRESSURE_WARN_LOW_MIN && hpa <= PRESSURE_WARN_LOW_MAX) || (hpa >= PRESSURE_WARN_HIGH_MIN && hpa <= PRESSURE_WARN_HIGH_MAX)) return 'warning';
  return 'danger';
};

const humidityVariant = (value?: number | null): Variant => {
  if (value === null || value === undefined) return 'warning';
  if (value >= HUMIDITY_IDEAL_MIN && value < HUMIDITY_IDEAL_MAX) return 'success';
  if ((value >= HUMIDITY_WARN_LOW_MIN && value <= HUMIDITY_WARN_LOW_MAX) || (value >= HUMIDITY_WARN_HIGH_MIN && value <= HUMIDITY_WARN_HIGH_MAX)) return 'warning';
  return 'danger';
};

// Responsive helper
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const RowStatistics: React.FC<RowStatisticsProps> = ({ lastHumidity, lastPressure }) => {
  const isMobile = useIsMobile();
  const circleSize = isMobile ? CIRCLE_SIZE_MOBILE : CIRCLE_SIZE_DESKTOP;
  const textSize = isMobile ? TEXT_SIZE_MOBILE : TEXT_SIZE_DESKTOP;

  const left: { variant: Variant; text: string }[] = [
    { variant: humidityVariant(lastHumidity), text: `Humidité : ${formatPercent(lastHumidity)}` },
    { variant: pressureVariant(lastPressure), text: `Pression : ${formatPressure(lastPressure)}` }
  ];

  const humidityLegend: { variant: Variant; text: string }[] = [
    { variant: 'success', text: '40–60%' },
    { variant: 'warning', text: '30–39/61–70%' },
    { variant: 'danger', text: '<30%/>70%' },
  ];

  const pressureLegend: { variant: Variant; text: string }[] = [
    { variant: 'success', text: '1005–1025 hPa' },
    { variant: 'warning', text: '990–1004/1026–1035 hPa' },
    { variant: 'danger', text: '<990/>1035 hPa' },
  ];

  const meaningLegend: { variant: Variant; text: string }[] = [
    { variant: 'success', text: ' : Valeur idéale' },
    { variant: 'warning', text: ' : Attention, mais acceptable' },
    { variant: 'danger', text: ' : Très mauvais' },
  ];

  return (
    <div className={`row-statistics${isMobile ? ' mobile' : ''}`} role="region" aria-label="Statistiques d'humidité et de pression">
      <div className="row-left" aria-live="polite">
        {left.map((item) => (
          <StatusCircle key={`${item.variant}:${item.text}`} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
        ))}
      </div>
      <div className="row-separator" />
      <div className="row-center">
        <div className="row-center-row" aria-label="Légende humidité">
          {humidityLegend.map((item) => (
            <StatusCircle key={`hum-${item.variant}-${item.text}`} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
          ))}
        </div>
        <div className="row-center-row" aria-label="Légende pression">
          {pressureLegend.map((item) => (
            <StatusCircle key={`prs-${item.variant}-${item.text}`} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
          ))}
        </div>
      </div>
      <div className="row-separator" />
      <div className="row-right" aria-label="Signification des couleurs">
        {meaningLegend.map((item) => (
          <StatusCircle key={`m-${item.variant}-${item.text}`} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
        ))}
      </div>
    </div>
  );
};

export default RowStatistics;