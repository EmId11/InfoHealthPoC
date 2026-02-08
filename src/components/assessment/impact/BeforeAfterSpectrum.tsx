// BeforeAfterSpectrum Component
// Visualizes before/after score positions on a gradient spectrum

import React from 'react';

interface BeforeAfterSpectrumProps {
  beforeScore: number;
  afterScore: number;
  label?: string;
  minScore?: number;
  maxScore?: number;
  showValues?: boolean;
  height?: number;
}

export const BeforeAfterSpectrum: React.FC<BeforeAfterSpectrumProps> = ({
  beforeScore,
  afterScore,
  label,
  minScore = 0,
  maxScore = 100,
  showValues = true,
  height = 24,
}) => {
  const range = maxScore - minScore;
  const beforePosition = ((beforeScore - minScore) / range) * 100;
  const afterPosition = ((afterScore - minScore) / range) * 100;
  const change = afterScore - beforeScore;
  const isImprovement = change > 0;

  // Calculate arrow path
  const arrowStart = Math.min(beforePosition, afterPosition);
  const arrowEnd = Math.max(beforePosition, afterPosition);
  const arrowWidth = arrowEnd - arrowStart;

  return (
    <div style={styles.container}>
      {label && <div style={styles.label}>{label}</div>}

      <div style={{ ...styles.spectrumContainer, height }}>
        {/* Gradient background */}
        <div style={styles.gradient} />

        {/* Segment lines */}
        <div style={{ ...styles.segmentLine, left: '25%' }} />
        <div style={{ ...styles.segmentLine, left: '50%' }} />
        <div style={{ ...styles.segmentLine, left: '75%' }} />

        {/* Before marker */}
        <div
          style={{
            ...styles.marker,
            ...styles.beforeMarker,
            left: `${beforePosition}%`,
          }}
        >
          <div style={styles.markerDot} />
          {showValues && (
            <div style={styles.markerLabel}>
              <span style={styles.markerText}>Before</span>
              <span style={styles.markerValue}>{beforeScore.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* After marker */}
        <div
          style={{
            ...styles.marker,
            ...styles.afterMarker,
            left: `${afterPosition}%`,
          }}
        >
          <div style={{ ...styles.markerDot, backgroundColor: '#0052CC' }} />
          {showValues && (
            <div style={{ ...styles.markerLabel, top: 'auto', bottom: -40 }}>
              <span style={styles.markerValue}>{afterScore.toFixed(0)}</span>
              <span style={styles.markerText}>After</span>
            </div>
          )}
        </div>

        {/* Change arrow */}
        {arrowWidth > 2 && (
          <div
            style={{
              ...styles.arrow,
              left: `${arrowStart}%`,
              width: `${arrowWidth}%`,
            }}
          >
            <svg
              width="100%"
              height="12"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="4"
                  refY="4"
                  orient="auto"
                >
                  <path
                    d={isImprovement ? 'M0,0 L8,4 L0,8 Z' : 'M8,0 L0,4 L8,8 Z'}
                    fill={isImprovement ? '#36B37E' : '#DE350B'}
                  />
                </marker>
              </defs>
              <line
                x1={isImprovement ? '0' : '100'}
                y1="6"
                x2={isImprovement ? '92' : '8'}
                y2="6"
                stroke={isImprovement ? '#36B37E' : '#DE350B'}
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Change indicator */}
      <div style={styles.changeContainer}>
        <span
          style={{
            ...styles.changeValue,
            color: isImprovement ? '#006644' : change < 0 ? '#DE350B' : '#6B778C',
          }}
        >
          {change > 0 ? '+' : ''}{change.toFixed(1)} health score points
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '20px 0 40px',
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B778C',
    marginBottom: 4,
  },
  spectrumContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 4,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    background: 'linear-gradient(to right, #FFEBE6 0%, #FFF0B3 25%, #E3FCEF 50%, #DEEBFF 75%, #E3FCEF 100%)',
  },
  segmentLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
  },
  beforeMarker: {},
  afterMarker: {},
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: '#6B778C',
    border: '2px solid white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  markerLabel: {
    position: 'absolute',
    top: -40,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  markerText: {
    fontSize: 10,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  markerValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  changeContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 4,
  },
  changeValue: {
    fontSize: 13,
    fontWeight: 500,
  },
};

export default BeforeAfterSpectrum;
