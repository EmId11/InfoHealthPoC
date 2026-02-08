import React, { useState } from 'react';
import { MATURITY_LEVELS, getMaturityLevelConfig, getDimensionDescription } from '../../../types/maturity';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';

interface ClusterMaturityBarProps {
  /** Percentile (0-100) for the cluster */
  percentile: number;
  /** Cluster key for contextual description */
  clusterKey: string;
  /** Dimension names included in this cluster (for calculation explanation) */
  dimensionNames?: string[];
}

/**
 * ClusterMaturityBar - Compact visual maturity spectrum for clusters
 *
 * Shows a 5-segment progress bar with the current maturity level highlighted,
 * plus an info icon that explains how the cluster maturity is calculated.
 */
const ClusterMaturityBar: React.FC<ClusterMaturityBarProps> = ({
  percentile,
  clusterKey,
  dimensionNames = [],
}) => {
  const [showInfoPopover, setShowInfoPopover] = useState(false);
  const config = getMaturityLevelConfig(percentile);
  const description = getDimensionDescription(config.level, clusterKey);

  return (
    <div style={styles.container}>
      {/* Maturity Spectrum Bar */}
      <div style={styles.spectrumWrapper}>
        <div style={styles.spectrumBar}>
          {MATURITY_LEVELS.map((level, index) => {
            const isActive = level.level <= config.level;

            return (
              <div
                key={level.level}
                style={{
                  ...styles.segment,
                  backgroundColor: isActive ? level.color : '#E4E6EB',
                  borderRadius: index === 0
                    ? '3px 0 0 3px'
                    : index === 4
                      ? '0 3px 3px 0'
                      : '0',
                }}
                title={`${level.name}: ${level.minPercentile}-${level.maxPercentile}%`}
              />
            );
          })}
        </div>

        {/* Only show current level label */}
        <div style={styles.labelRow}>
          <span style={{ ...styles.currentLabel, color: config.color }}>
            {config.name}
          </span>
        </div>
      </div>

      {/* Info Icon */}
      <div style={styles.infoWrapper}>
        <button
          style={styles.infoButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowInfoPopover(!showInfoPopover);
          }}
          title="How is this calculated?"
        >
          <QuestionCircleIcon label="Info" size="small" primaryColor="#6B778C" />
        </button>

        {/* Info Popover */}
        {showInfoPopover && (
          <div style={styles.infoPopover}>
            <button
              style={styles.popoverClose}
              onClick={(e) => {
                e.stopPropagation();
                setShowInfoPopover(false);
              }}
            >
              ×
            </button>

            <div style={styles.popoverHeader}>
              <span style={{ ...styles.levelBadge, backgroundColor: config.backgroundColor, color: config.color, borderColor: config.borderColor }}>
                {config.name}
              </span>
              <span style={styles.percentileText}>Health Score: {percentile}</span>
            </div>

            <p style={styles.descriptionText}>{description}</p>

            <div style={styles.calculationSection}>
              <h5 style={styles.calculationTitle}>How it's calculated</h5>
              <p style={styles.calculationText}>
                This cluster maturity is the <strong>average health score</strong> of all dimensions within this area:
              </p>
              {dimensionNames.length > 0 && (
                <ul style={styles.dimensionList}>
                  {dimensionNames.map((name, i) => (
                    <li key={i} style={styles.dimensionItem}>{name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  spectrumWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '200px',
  },
  spectrumBar: {
    display: 'flex',
    height: '6px',
    gap: '2px',
  },
  segment: {
    flex: 1,
    height: '100%',
    transition: 'background-color 0.2s ease',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '2px',
  },
  currentLabel: {
    fontSize: '11px',
    fontWeight: 600,
  },
  infoWrapper: {
    position: 'relative',
    marginTop: '-2px',
  },
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.15s ease',
  },
  infoPopover: {
    position: 'absolute',
    top: '100%',
    right: 0,
    zIndex: 1000,
    width: '320px',
    padding: '16px',
    marginTop: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
  },
  popoverClose: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  popoverHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  levelBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid',
  },
  percentileText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  descriptionText: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  calculationSection: {
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
  },
  calculationTitle: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#5E6C84',
  },
  calculationText: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#42526E',
    lineHeight: 1.4,
  },
  dimensionList: {
    margin: 0,
    paddingLeft: '16px',
  },
  dimensionItem: {
    fontSize: '12px',
    color: '#42526E',
    marginBottom: '2px',
  },
};

export default ClusterMaturityBar;
