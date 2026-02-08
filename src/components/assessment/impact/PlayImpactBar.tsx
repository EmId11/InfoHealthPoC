// PlayImpactBar Component
// Horizontal bar showing a play's attributed impact contribution

import React from 'react';
import { ConfidenceLevel, getConfidenceLevelColor } from '../../../types/impactMeasurement';

interface PlayImpactBarProps {
  playTitle: string;
  impactScore: number;
  maxImpact?: number;
  confidenceLevel?: ConfidenceLevel;
  rank?: number;
  onClick?: () => void;
}

export const PlayImpactBar: React.FC<PlayImpactBarProps> = ({
  playTitle,
  impactScore,
  maxImpact = 100,
  confidenceLevel = 'moderate',
  rank,
  onClick,
}) => {
  const fillPercentage = Math.min(100, Math.max(0, (Math.abs(impactScore) / maxImpact) * 100));
  const isPositive = impactScore >= 0;
  const confidenceColors = getConfidenceLevelColor(confidenceLevel);

  return (
    <div
      style={{
        ...styles.container,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <div style={styles.header}>
        <div style={styles.titleSection}>
          {rank !== undefined && (
            <span style={styles.rank}>#{rank}</span>
          )}
          <span style={styles.title}>{playTitle}</span>
        </div>
        <div style={styles.scoreSection}>
          <span
            style={{
              ...styles.score,
              color: isPositive ? '#006644' : '#DE350B',
            }}
          >
            {impactScore >= 0 ? '+' : ''}{impactScore.toFixed(1)}
          </span>
          {confidenceLevel && (
            <span
              style={{
                ...styles.confidenceBadge,
                backgroundColor: confidenceColors.bg,
                color: confidenceColors.text,
              }}
            >
              {confidenceLevel === 'very-high' ? 'V. High' :
               confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1)}
            </span>
          )}
        </div>
      </div>

      <div style={styles.barContainer}>
        <div
          style={{
            ...styles.barFill,
            width: `${fillPercentage}%`,
            backgroundColor: isPositive ? '#36B37E' : '#DE350B',
          }}
        />
        <div style={styles.barBackground} />
      </div>
    </div>
  );
};

// Compact version for lists
interface PlayImpactBarCompactProps {
  playTitle: string;
  impactScore: number;
  maxImpact?: number;
}

export const PlayImpactBarCompact: React.FC<PlayImpactBarCompactProps> = ({
  playTitle,
  impactScore,
  maxImpact = 50,
}) => {
  const fillPercentage = Math.min(100, Math.max(0, (Math.abs(impactScore) / maxImpact) * 100));
  const isPositive = impactScore >= 0;

  return (
    <div style={styles.compactContainer}>
      <span style={styles.compactTitle}>{playTitle}</span>
      <div style={styles.compactBarSection}>
        <div style={styles.compactBarContainer}>
          <div
            style={{
              ...styles.compactBarFill,
              width: `${fillPercentage}%`,
              backgroundColor: isPositive ? '#36B37E' : '#DE350B',
            }}
          />
        </div>
        <span
          style={{
            ...styles.compactScore,
            color: isPositive ? '#006644' : '#DE350B',
          }}
        >
          {impactScore >= 0 ? '+' : ''}{impactScore.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
    transition: 'box-shadow 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  rank: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  confidenceBadge: {
    fontSize: 10,
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  barContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F5F7',
    zIndex: 0,
  },
  barFill: {
    position: 'relative',
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
    zIndex: 1,
  },
  // Compact styles
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '6px 0',
  },
  compactTitle: {
    fontSize: 13,
    color: '#172B4D',
    width: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  compactBarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  compactBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F4F5F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  compactScore: {
    fontSize: 12,
    fontWeight: 600,
    width: 40,
    textAlign: 'right',
  },
};

export default PlayImpactBar;
