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

  const getArrowPath = (): string => {
    switch (direction) {
      case 'improving':
        return 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z';
      case 'declining':
        return 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z';
      case 'stable':
        return 'M4 11h16v2H4z';
    }
  };

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

  return (
    <span style={containerStyle}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={color}
      >
        <path d={getArrowPath()} />
      </svg>
      {showLabel && <span style={labelStyle}>{getLabel()}</span>}
    </span>
  );
};

export default TrendIndicator;
