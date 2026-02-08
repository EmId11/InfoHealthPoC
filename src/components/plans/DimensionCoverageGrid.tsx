// DimensionCoverageGrid - Heat map visualization showing dimension coverage
// Displays which dimensions have plays with color intensity

import React from 'react';
import { DimensionCoverage, CoverageIntensity } from '../../types/improvementPlan';

interface DimensionCoverageGridProps {
  dimensions: DimensionCoverage[];
  totalDimensions: number;
}

const DimensionCoverageGrid: React.FC<DimensionCoverageGridProps> = ({
  dimensions,
  totalDimensions,
}) => {
  const coveredCount = dimensions.length;
  const coveragePercent = totalDimensions > 0
    ? Math.round((coveredCount / totalDimensions) * 100)
    : 0;

  const getIntensityStyle = (intensity: CoverageIntensity): React.CSSProperties => {
    switch (intensity) {
      case 'high':
        return { backgroundColor: '#5243AA', color: '#FFFFFF' };
      case 'medium':
        return { backgroundColor: '#998DD9', color: '#FFFFFF' };
      case 'low':
        return { backgroundColor: '#EAE6FF', color: '#5243AA' };
      default:
        return { backgroundColor: '#F4F5F7', color: '#6B778C' };
    }
  };

  const getIntensityBars = (intensity: CoverageIntensity): number => {
    switch (intensity) {
      case 'high': return 4;
      case 'medium': return 3;
      case 'low': return 2;
      default: return 0;
    }
  };

  if (dimensions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h4 style={styles.title}>Dimension Coverage</h4>
          <span style={styles.coverageCount}>0 of {totalDimensions} (0%)</span>
        </div>
        <div style={styles.emptyState}>
          <span style={styles.emptyText}>No dimensions have plays yet</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Dimension Coverage</h4>
        <span style={styles.coverageCount}>
          {coveredCount} of {totalDimensions} ({coveragePercent}%)
        </span>
      </div>

      <div style={styles.grid}>
        {dimensions.map((dim) => {
          const intensityStyle = getIntensityStyle(dim.intensity);
          const barCount = getIntensityBars(dim.intensity);

          return (
            <div key={dim.dimensionKey} style={{ ...styles.cell, ...intensityStyle }}>
              <div style={styles.cellContent}>
                <span style={styles.dimensionName}>{dim.dimensionName}</span>
                <div style={styles.statsRow}>
                  <div style={styles.intensityBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.intensityBar,
                          opacity: i <= barCount ? 1 : 0.3,
                          backgroundColor: dim.intensity === 'low' ? '#5243AA' : 'currentColor',
                        }}
                      />
                    ))}
                  </div>
                  <span style={styles.playCount}>{dim.playCount} plays</span>
                </div>
              </div>
              {dim.completedCount > 0 && (
                <span style={styles.completedBadge}>
                  {dim.completedCount} done
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <span style={styles.legendLabel}>Coverage:</span>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendSwatch, backgroundColor: '#F4F5F7' }} />
            <span>None</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendSwatch, backgroundColor: '#EAE6FF' }} />
            <span>Low</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendSwatch, backgroundColor: '#998DD9' }} />
            <span>Medium</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendSwatch, backgroundColor: '#5243AA' }} />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  coverageCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5243AA',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  cell: {
    position: 'relative',
    padding: '14px 16px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: '70px',
  },
  cellContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dimensionName: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  intensityBars: {
    display: 'flex',
    gap: '2px',
  },
  intensityBar: {
    width: '4px',
    height: '12px',
    borderRadius: '1px',
  },
  playCount: {
    fontSize: '12px',
    opacity: 0.9,
  },
  completedBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  legendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  legendItems: {
    display: 'flex',
    gap: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B778C',
  },
  legendSwatch: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #DFE1E6',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B778C',
  },
};

export default DimensionCoverageGrid;
