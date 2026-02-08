// VelocityCard - Burn rate and velocity metrics display
// Shows completion velocity and estimated time to complete

import React from 'react';
import { VelocityMetrics } from '../../types/improvementPlan';

interface VelocityCardProps {
  velocity: VelocityMetrics;
}

const VelocityCard: React.FC<VelocityCardProps> = ({ velocity }) => {
  const maxValue = Math.max(velocity.thisWeek, velocity.lastWeek, velocity.avgPerWeek, 1);

  const getBarWidth = (value: number): string => {
    return `${Math.max(8, (value / maxValue) * 100)}%`;
  };

  const formatEstimate = (): string => {
    if (velocity.estimatedWeeksToComplete === null) {
      return 'N/A';
    }
    if (velocity.estimatedWeeksToComplete === 1) {
      return '~1 week';
    }
    if (velocity.estimatedWeeksToComplete <= 4) {
      return `~${velocity.estimatedWeeksToComplete} weeks`;
    }
    const months = Math.round(velocity.estimatedWeeksToComplete / 4);
    return `~${months} month${months > 1 ? 's' : ''}`;
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Velocity & Burn Rate</h4>

      <div style={styles.barsSection}>
        <div style={styles.barRow}>
          <span style={styles.barLabel}>This Week</span>
          <div style={styles.barContainer}>
            <div style={{ ...styles.bar, width: getBarWidth(velocity.thisWeek), backgroundColor: '#5243AA' }} />
          </div>
          <span style={styles.barValue}>{velocity.thisWeek}</span>
        </div>

        <div style={styles.barRow}>
          <span style={styles.barLabel}>Last Week</span>
          <div style={styles.barContainer}>
            <div style={{ ...styles.bar, width: getBarWidth(velocity.lastWeek), backgroundColor: '#998DD9' }} />
          </div>
          <span style={styles.barValue}>{velocity.lastWeek}</span>
        </div>

        <div style={styles.barRow}>
          <span style={styles.barLabel}>Avg/Week</span>
          <div style={styles.barContainer}>
            <div style={{ ...styles.bar, width: getBarWidth(velocity.avgPerWeek), backgroundColor: '#00875A' }} />
          </div>
          <span style={styles.barValue}>{velocity.avgPerWeek}</span>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.estimateSection}>
        <div style={styles.estimateRow}>
          <span style={styles.estimateLabel}>Remaining plays:</span>
          <span style={styles.estimateValue}>{velocity.remainingPlays}</span>
        </div>
        <div style={styles.estimateRow}>
          <span style={styles.estimateLabel}>At current velocity:</span>
          <span style={{ ...styles.estimateValue, color: '#5243AA' }}>{formatEstimate()}</span>
        </div>
      </div>

      {velocity.avgPerWeek > 0 && velocity.remainingPlays > 0 && (
        <div style={styles.trendIndicator}>
          {velocity.thisWeek >= velocity.avgPerWeek ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12l4-4 3 3 4-7" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ ...styles.trendText, color: '#00875A' }}>On track this week</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l4 4 3-3 4 7" stroke="#FF8B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ ...styles.trendText, color: '#FF8B00' }}>Below average this week</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    minWidth: '200px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  barsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '12px',
    color: '#5E6C84',
    width: '70px',
    flexShrink: 0,
  },
  barContainer: {
    flex: 1,
    height: '8px',
    backgroundColor: '#DFE1E6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  barValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    width: '28px',
    textAlign: 'right',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '16px 0',
  },
  estimateSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  estimateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimateLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  estimateValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  trendText: {
    fontSize: '12px',
    fontWeight: 500,
  },
};

export default VelocityCard;
