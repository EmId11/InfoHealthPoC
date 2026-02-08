import React from 'react';
import { RiskLevel } from '../../../types/assessment';
import { getRiskLevelColor } from '../../../constants/mockAssessmentData';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const riskLabels: Record<RiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'medium',
  showLabel = true,
}) => {
  const colors = getRiskLevelColor(level);

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: '2px 8px',
      fontSize: '11px',
    },
    medium: {
      padding: '4px 12px',
      fontSize: '12px',
    },
    large: {
      padding: '6px 16px',
      fontSize: '14px',
    },
  };

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...sizeStyles[size],
  };

  return (
    <span style={style}>
      {showLabel && riskLabels[level]}
    </span>
  );
};

export default RiskBadge;
