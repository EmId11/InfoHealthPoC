// ImpactScoreBadge Component
// Displays impact score with +/- indicator and appropriate coloring

import React from 'react';
import { ImpactDirection, getImpactDirectionColor, formatImpactScore } from '../../../types/impactMeasurement';

interface ImpactScoreBadgeProps {
  score: number;
  direction?: ImpactDirection;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ImpactScoreBadge: React.FC<ImpactScoreBadgeProps> = ({
  score,
  direction,
  size = 'medium',
  showLabel = false,
}) => {
  // Auto-determine direction if not provided
  const impactDirection = direction || (score > 2 ? 'positive' : score < -2 ? 'negative' : 'neutral');
  const colors = getImpactDirectionColor(impactDirection);

  const sizeStyles = {
    small: { fontSize: 12, padding: '2px 6px' },
    medium: { fontSize: 14, padding: '4px 10px' },
    large: { fontSize: 18, padding: '6px 14px' },
  };

  const labelText = impactDirection === 'positive'
    ? 'Improvement'
    : impactDirection === 'negative'
    ? 'Decline'
    : 'No Change';

  return (
    <div style={styles.container}>
      <span
        style={{
          ...styles.badge,
          backgroundColor: colors.bg,
          color: colors.text,
          ...sizeStyles[size],
        }}
      >
        <span style={styles.score}>{formatImpactScore(score)}</span>
        {showLabel && <span style={styles.label}> {labelText}</span>}
      </span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 4,
    fontWeight: 600,
  },
  score: {
    fontVariantNumeric: 'tabular-nums',
  },
  label: {
    fontWeight: 500,
    marginLeft: 4,
  },
};

export default ImpactScoreBadge;
