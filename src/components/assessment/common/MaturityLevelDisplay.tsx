import React from 'react';
import {
  MaturityLevel,
  MaturityLevelName,
  MATURITY_LEVELS,
  getMaturityLevelConfig,
  getDimensionDescription,
} from '../../../types/maturity';
import type { RiskAdjustedMaturity } from '../../../utils/maturityCalculation';

interface MaturityLevelDisplayProps {
  /** Percentile (0-100) to display maturity for */
  percentile: number;
  /** Optional title override (default: "YOUR MATURITY LEVEL") */
  title?: string;
  /** Whether to show the description text */
  showDescription?: boolean;
  /** Compact mode - smaller text and spacing */
  compact?: boolean;
  /** Optional dimension key for contextual description */
  dimensionKey?: string;
  /** Optional risk-adjusted maturity data for enhanced display */
  riskAdjustedMaturity?: RiskAdjustedMaturity;
  /** Whether to show the adjustment breakdown */
  showAdjustmentBreakdown?: boolean;
}

/**
 * MaturityLevelDisplay - Visual maturity level indicator with progress bar
 *
 * Shows:
 * - Title header
 * - Large colored maturity name with "Level X of 5"
 * - Description text
 * - 5-segment progress bar with current level highlighted
 * - Optional risk-adjusted breakdown showing penalties and adjustments
 */
const MaturityLevelDisplay: React.FC<MaturityLevelDisplayProps> = ({
  percentile,
  title = 'YOUR MATURITY LEVEL',
  showDescription = true,
  compact = false,
  dimensionKey,
  riskAdjustedMaturity,
  showAdjustmentBreakdown = false,
}) => {
  // Use risk-adjusted percentile if available, otherwise use raw percentile
  const displayPercentile = riskAdjustedMaturity
    ? riskAdjustedMaturity.adjustedPercentile
    : percentile;
  const config = getMaturityLevelConfig(displayPercentile);
  // Get contextual description if dimensionKey provided, otherwise use default
  const description = getDimensionDescription(config.level, dimensionKey);

  // Check if there was a significant adjustment
  const wasAdjusted = riskAdjustedMaturity?.wasSignificantlyAdjusted;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{
        ...styles.header,
        fontSize: compact ? '11px' : '12px',
        marginBottom: compact ? '8px' : '12px',
      }}>
        {title}
        {wasAdjusted && (
          <span style={styles.adjustedBadge}>Risk-Adjusted</span>
        )}
      </div>

      {/* Level name and indicator */}
      <div style={styles.levelRow}>
        <span style={{
          ...styles.levelName,
          color: config.color,
          fontSize: compact ? '20px' : '24px',
        }}>
          {config.name}
        </span>
        <span style={{
          ...styles.levelIndicator,
          fontSize: compact ? '13px' : '14px',
        }}>
          (Level {config.level} of 5)
        </span>
      </div>

      {/* Description */}
      {showDescription && (
        <p style={{
          ...styles.description,
          fontSize: compact ? '13px' : '14px',
          marginBottom: compact ? '12px' : '16px',
        }}>
          {description}
        </p>
      )}

      {/* Risk Adjustment Breakdown */}
      {showAdjustmentBreakdown && riskAdjustedMaturity && (
        <div style={styles.adjustmentBreakdown}>
          <div style={styles.breakdownRow}>
            <span style={styles.breakdownLabel}>Base health score:</span>
            <span style={styles.breakdownValue}>{riskAdjustedMaturity.basePercentile}%</span>
          </div>
          {riskAdjustedMaturity.riskPenalty > 0 && (
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>Risk penalty:</span>
              <span style={{ ...styles.breakdownValue, color: '#DE350B' }}>
                -{riskAdjustedMaturity.riskPenalty}
                <span style={styles.breakdownDetail}>
                  ({riskAdjustedMaturity.tierDistribution.needsAttention} needs attention)
                </span>
              </span>
            </div>
          )}
          {riskAdjustedMaturity.trendAdjustment !== 0 && (
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>Trend adjustment:</span>
              <span style={{
                ...styles.breakdownValue,
                color: riskAdjustedMaturity.trendAdjustment > 0 ? '#36B37E' : '#DE350B',
              }}>
                {riskAdjustedMaturity.trendAdjustment > 0 ? '+' : ''}{riskAdjustedMaturity.trendAdjustment}
                <span style={styles.breakdownDetail}>
                  ({riskAdjustedMaturity.trendBreakdown.improving} improving, {riskAdjustedMaturity.trendBreakdown.declining} declining)
                </span>
              </span>
            </div>
          )}
          <div style={{ ...styles.breakdownRow, borderTop: '1px solid #E4E6EB', paddingTop: '8px', marginTop: '8px' }}>
            <span style={{ ...styles.breakdownLabel, fontWeight: 600 }}>Adjusted health score:</span>
            <span style={{ ...styles.breakdownValue, fontWeight: 600, color: config.color }}>
              {Math.round(riskAdjustedMaturity.adjustedPercentile)}%
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          {MATURITY_LEVELS.map((level, index) => {
            const isActive = level.level <= config.level;
            const isCurrent = level.level === config.level;

            return (
              <div
                key={level.level}
                style={{
                  ...styles.progressSegment,
                  backgroundColor: isActive ? level.color : '#E4E6EB',
                  borderRadius: index === 0
                    ? '4px 0 0 4px'
                    : index === 4
                      ? '0 4px 4px 0'
                      : '0',
                }}
              />
            );
          })}
        </div>

        {/* Labels below progress bar */}
        <div style={styles.labelsRow}>
          {MATURITY_LEVELS.map((level) => {
            const isCurrent = level.level === config.level;

            return (
              <span
                key={level.level}
                style={{
                  ...styles.label,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? config.color : '#6B778C',
                  fontSize: compact ? '11px' : '12px',
                }}
              >
                {level.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  adjustedBadge: {
    fontSize: '10px',
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#E6FCFF',
    color: '#0747A6',
    textTransform: 'none',
    letterSpacing: 'normal',
  },
  levelRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  },
  levelName: {
    fontWeight: 700,
  },
  levelIndicator: {
    color: '#6B778C',
  },
  description: {
    margin: 0,
    color: '#42526E',
    lineHeight: 1.4,
  },
  adjustmentBreakdown: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    fontSize: '13px',
    marginBottom: '6px',
  },
  breakdownLabel: {
    color: '#5E6C84',
  },
  breakdownValue: {
    color: '#172B4D',
    textAlign: 'right',
  },
  breakdownDetail: {
    display: 'block',
    fontSize: '11px',
    color: '#8993A4',
    fontWeight: 400,
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressBar: {
    display: 'flex',
    height: '8px',
    gap: '3px',
  },
  progressSegment: {
    flex: 1,
    height: '100%',
  },
  labelsRow: {
    display: 'flex',
  },
  label: {
    flex: 1,
    textAlign: 'center',
  },
};

export default MaturityLevelDisplay;
