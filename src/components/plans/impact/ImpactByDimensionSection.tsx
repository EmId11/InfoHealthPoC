// ImpactByDimensionSection Component
// Shows impact breakdown by dimension with icons and team comparison toggle

import React from 'react';
import { DimensionImpact } from '../../../types/impactMeasurement';
import { getDimensionIcon } from '../../../constants/dimensionIcons';

interface ImpactByDimensionSectionProps {
  dimensions: DimensionImpact[];
  embedded?: boolean;  // When true, removes container styling for embedding in parent
}

// Get color based on change direction
const getChangeColor = (change: number): string => {
  if (change > 0.5) return '#006644';   // Green for positive
  if (change < -0.5) return '#BF2600';  // Red for negative
  return '#6B778C';                      // Grey for stable
};

// Get background color for row based on direction
const getRowBackground = (change: number): string => {
  if (change > 0.5) return '#F1FDF7';   // Light green
  if (change < -0.5) return '#FFF5F3';  // Light red
  return '#FAFBFC';                      // Light grey
};

// Get direction indicator
const getDirectionIndicator = (change: number): { icon: string; label: string } => {
  if (change > 0.5) return { icon: '↑', label: 'improved' };
  if (change < -0.5) return { icon: '↓', label: 'declined' };
  return { icon: '~', label: 'stable' };
};

export const ImpactByDimensionSection: React.FC<ImpactByDimensionSectionProps> = ({
  dimensions,
  embedded = false,
}) => {
  const containerStyle = embedded ? styles.containerEmbedded : styles.container;

  if (dimensions.length === 0) {
    return (
      <div style={containerStyle}>
        <h3 style={styles.title}>IMPACT BY DIMENSION</h3>
        <p style={styles.emptyText}>No dimension impact data available yet.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h3 style={styles.title}>IMPACT BY DIMENSION</h3>

      <div style={styles.dimensionList}>
        {dimensions.map(dimension => (
          <DimensionRow
            key={dimension.dimensionKey}
            dimension={dimension}
          />
        ))}
      </div>
    </div>
  );
};

interface DimensionRowProps {
  dimension: DimensionImpact;
}

const DimensionRow: React.FC<DimensionRowProps> = ({
  dimension,
}) => {
  const changeColor = getChangeColor(dimension.healthScoreChange);
  const direction = getDirectionIndicator(dimension.healthScoreChange);
  const rowBg = getRowBackground(dimension.healthScoreChange);

  return (
    <div style={{ ...styles.dimensionRow, backgroundColor: rowBg }}>
      <div style={styles.dimensionMain}>
        {/* Icon */}
        <div style={{ ...styles.dimensionIcon, color: changeColor }}>
          {getDimensionIcon(dimension.dimensionKey, 'medium', changeColor)}
        </div>

        {/* Name and change info */}
        <div style={styles.dimensionInfo}>
          <span style={{ ...styles.dimensionName, color: changeColor }}>
            {dimension.dimensionName}
          </span>
          <div style={styles.changeRow}>
            <span style={styles.fromTo}>
              {Math.round(dimension.baselineHealthScore)}
            </span>
            <span style={styles.arrow}>→</span>
            <span style={{ ...styles.fromTo, fontWeight: 600 }}>
              {Math.round(dimension.currentHealthScore)}
            </span>
            <span style={styles.healthScoreLabel}>health score</span>
            <span style={{
              ...styles.directionBadge,
              backgroundColor: dimension.healthScoreChange > 0.5 ? '#E3FCEF' :
                dimension.healthScoreChange < -0.5 ? '#FFEBE6' : '#F4F5F7',
              color: changeColor,
            }}>
              {direction.icon} {direction.label}
            </span>
          </div>
        </div>

        {/* Delta value */}
        <div style={styles.deltaSection}>
          <span style={{ ...styles.deltaValue, color: changeColor }}>
            {dimension.healthScoreChange >= 0 ? '+' : ''}{dimension.healthScoreChange.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Mini spectrum */}
      <div style={styles.miniSpectrum}>
        <div style={styles.spectrumTrack}>
          {/* Before marker */}
          <div
            style={{
              ...styles.spectrumDot,
              left: `${dimension.baselineHealthScore}%`,
              backgroundColor: '#97A0AF',
              zIndex: dimension.healthScoreChange < 0 ? 2 : 1,
            }}
          />

          {/* After marker */}
          <div
            style={{
              ...styles.spectrumDot,
              left: `${dimension.currentHealthScore}%`,
              backgroundColor: changeColor,
              zIndex: dimension.healthScoreChange >= 0 ? 2 : 1,
            }}
          />

          {/* Connection line */}
          <div
            style={{
              ...styles.spectrumConnection,
              left: `${Math.min(dimension.baselineHealthScore, dimension.currentHealthScore)}%`,
              width: `${Math.abs(dimension.healthScoreChange)}%`,
              backgroundColor: dimension.healthScoreChange > 0.5
                ? 'rgba(0, 102, 68, 0.3)'
                : dimension.healthScoreChange < -0.5
                  ? 'rgba(191, 38, 0, 0.3)'
                  : 'rgba(107, 119, 140, 0.3)',
            }}
          />
        </div>
      </div>

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  containerEmbedded: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRight: '1px solid #F4F5F7',
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 20px 0',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B778C',
    textAlign: 'center',
    padding: '24px 0',
    margin: 0,
  },
  dimensionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  dimensionRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 12,
    borderRadius: 8,
  },
  dimensionMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  dimensionIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dimensionInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  dimensionName: {
    fontSize: 14,
    fontWeight: 600,
  },
  changeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fromTo: {
    fontSize: 13,
    color: '#172B4D',
  },
  arrow: {
    fontSize: 12,
    color: '#97A0AF',
  },
  healthScoreLabel: {
    fontSize: 12,
    color: '#6B778C',
  },
  directionBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 10,
    marginLeft: 4,
  },
  deltaSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  deltaValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  miniSpectrum: {
    padding: '0 4px',
    marginLeft: 44,
  },
  spectrumTrack: {
    position: 'relative',
    height: 10,
    backgroundColor: '#EBECF0',
    borderRadius: 5,
  },
  spectrumDot: {
    position: 'absolute',
    top: 1,
    width: 8,
    height: 8,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    border: '1.5px solid white',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  spectrumConnection: {
    position: 'absolute',
    top: 3,
    height: 4,
    borderRadius: 2,
  },
};

export default ImpactByDimensionSection;
