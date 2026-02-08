// ConfidenceGauge Component
// Visual indicator of confidence level with optional breakdown

import React from 'react';
import {
  ConfidenceLevel,
  ConfidenceAssessment,
  getConfidenceLevelLabel,
  getConfidenceLevelColor,
} from '../../../types/impactMeasurement';

interface ConfidenceGaugeProps {
  level: ConfidenceLevel;
  score?: number;
  showLabel?: boolean;
  showScore?: boolean;
  size?: 'small' | 'medium' | 'large';
  assessment?: ConfidenceAssessment;
  showBreakdown?: boolean;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  level,
  score,
  showLabel = true,
  showScore = false,
  size = 'medium',
  assessment,
  showBreakdown = false,
}) => {
  const colors = getConfidenceLevelColor(level);
  const label = getConfidenceLevelLabel(level);

  // Map level to fill percentage
  const fillPercentage = {
    'low': 25,
    'moderate': 50,
    'high': 75,
    'very-high': 100,
  }[level];

  const sizeConfig = {
    small: { width: 60, height: 6, fontSize: 11 },
    medium: { width: 100, height: 8, fontSize: 12 },
    large: { width: 140, height: 10, fontSize: 14 },
  };

  const config = sizeConfig[size];

  return (
    <div style={styles.container}>
      <div style={styles.gaugeContainer}>
        <div
          style={{
            ...styles.track,
            width: config.width,
            height: config.height,
          }}
        >
          <div
            style={{
              ...styles.fill,
              width: `${fillPercentage}%`,
              backgroundColor: colors.text,
            }}
          />
          {/* Segment markers */}
          <div style={{ ...styles.marker, left: '25%' }} />
          <div style={{ ...styles.marker, left: '50%' }} />
          <div style={{ ...styles.marker, left: '75%' }} />
        </div>
      </div>

      {(showLabel || showScore) && (
        <div style={{ ...styles.labelContainer, fontSize: config.fontSize }}>
          {showLabel && (
            <span style={{ ...styles.label, color: colors.text }}>{label}</span>
          )}
          {showScore && score !== undefined && (
            <span style={styles.score}>({score}%)</span>
          )}
        </div>
      )}

      {showBreakdown && assessment && (
        <div style={styles.breakdown}>
          <ConfidenceBreakdownRow
            label="Data Completeness"
            value={assessment.factors.dataCompleteness}
          />
          <ConfidenceBreakdownRow
            label="Sample Size"
            value={assessment.factors.sampleSize}
          />
          <ConfidenceBreakdownRow
            label="Effect Magnitude"
            value={assessment.factors.effectMagnitude}
          />
          <ConfidenceBreakdownRow
            label="Attribution Clarity"
            value={assessment.factors.attributionClarity}
          />
        </div>
      )}
    </div>
  );
};

interface BreakdownRowProps {
  label: string;
  value: number;
}

const ConfidenceBreakdownRow: React.FC<BreakdownRowProps> = ({ label, value }) => {
  return (
    <div style={styles.breakdownRow}>
      <span style={styles.breakdownLabel}>{label}</span>
      <div style={styles.breakdownBar}>
        <div
          style={{
            ...styles.breakdownFill,
            width: `${value}%`,
            backgroundColor: value >= 60 ? '#36B37E' : value >= 40 ? '#FFAB00' : '#DE350B',
          }}
        />
      </div>
      <span style={styles.breakdownValue}>{value}%</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  gaugeContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  track: {
    position: 'relative',
    backgroundColor: '#DFE1E6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  label: {
    fontWeight: 500,
  },
  score: {
    color: '#6B778C',
  },
  breakdown: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    backgroundColor: '#F4F5F7',
    borderRadius: 4,
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B778C',
    width: 120,
    flexShrink: 0,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#DFE1E6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#172B4D',
    fontWeight: 500,
    width: 36,
    textAlign: 'right',
  },
};

export default ConfidenceGauge;
