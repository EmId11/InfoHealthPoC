import React from 'react';
import { TrendDirection } from '../../../types/assessment';
import { getTrendColor } from '../../../constants/mockAssessmentData';

interface TrendIndicatorProps {
  direction: TrendDirection;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  size = 'medium',
  showLabel = false,
}) => {
  const color = getTrendColor(direction);

  const sizeMap = {
    small: { icon: 12, font: '12px', weight: 500 },
    medium: { icon: 18, font: '16px', weight: 600 },
    large: { icon: 22, font: '20px', weight: 700 },
  };

  const { icon: iconSize, font: fontSize, weight: fontWeight } = sizeMap[size];

  const getLabel = (): string => {
    switch (direction) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      case 'stable':
        return 'Stable';
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color,
  };

  const labelStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
  };

  const renderIcon = () => {
    if (direction === 'improving') {
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,18 8,13 12,16 21,6" />
          <polyline points="16,6 21,6 21,11" />
        </svg>
      );
    }
    if (direction === 'declining') {
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,6 8,11 12,8 21,18" />
          <polyline points="16,18 21,18 21,13" />
        </svg>
      );
    }
    // stable — smooth S-curve tilde
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4,12 C8,8 16,16 20,12" />
      </svg>
    );
  };

  return (
    <span style={containerStyle}>
      {renderIcon()}
      {showLabel && <span style={labelStyle}>{getLabel()}</span>}
    </span>
  );
};

export default TrendIndicator;
