import React from 'react';
import StatusCircle from '../../atoms/StatusCircle';

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
  const gap = isMobile ? 'clamp(0.7rem, 3vw, 1.5rem)' : 'clamp(2rem, 8vw, 8rem)';
  const colGap = isMobile ? '1.2rem' : '2.2rem';
  const minWidth = isMobile ? 120 : 180;
  const centerMinWidth = isMobile ? 180 : 350;
  const separatorHeight = isMobile ? '60px' : '100px';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        background: 'rgba(255,255,255,0.0)',
        borderRadius: '12px',
        padding: isMobile ? '0.5rem 0.5rem' : '0.5rem 0',
        width: '100%',
        minHeight: isMobile ? 'auto' : '90px',
        boxSizing: 'border-box',
        gap: isMobile ? '1.5rem' : undefined,
      }}
    >
      {/* Left section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: colGap, minWidth }}>
        {left.map((item, idx) => (
          <StatusCircle key={idx} variant={item.variant} text={item.text} size={circleSize} textSize={textSize} />
        ))}
      </div>
      {/* Vertical separator */}
      <div
        style={
          isMobile
            ? {
                width: '80%',
                height: '2px',
                background: 'linear-gradient(to right, rgb(255,246,246) 0%, #888888 100%)',
                margin: '2rem auto',
                borderRadius: '8px',
                boxShadow: '0 0 6px 0 rgba(180,180,180,0.25)',
                opacity: 0.9,
              }
            : {
                width: '2px',
                height: separatorHeight,
                background: 'linear-gradient(to bottom,rgb(255, 246, 246) 0%, #888888 100%)',
                margin: '0 5rem',
                borderRadius: '8px',
                alignSelf: 'center',
                boxShadow: '0 0 6px 0 rgba(180,180,180,0.25)',
                opacity: 0.9,
              }
        }
      />
      {/* Center section (static) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: colGap,
          minWidth: centerMinWidth,
          flex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap,
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <StatusCircle variant="success" text="10/20%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="20/50%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="50/100%" size={circleSize} textSize={textSize} />
        </div>
        <div
          style={{
            display: 'flex',
            gap,
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <StatusCircle variant="success" text="10/20%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="warning" text="20/50%" size={circleSize} textSize={textSize} />
          <StatusCircle variant="danger" text="50/100%" size={circleSize} textSize={textSize} />
        </div>
      </div>
      {/* Right section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: colGap,
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          flex: 1,
          marginLeft: isMobile ? 0 : '2.5rem',
          minWidth: isMobile ? 120 : 220,
          maxWidth: isMobile ? 250 : 400,
        }}
      >
        {right.map((txt, idx) => (
          <span
            key={idx}
            style={{
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              color: '#222',
              fontWeight: 400,
              width: '100%',
              textAlign: isMobile ? 'left' : 'right',
              wordBreak: 'break-word',
            }}
          >
            {txt}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RowStatistics;
