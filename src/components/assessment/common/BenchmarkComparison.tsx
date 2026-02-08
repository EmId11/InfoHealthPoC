import React from 'react';
import { getCHSCategoryConfig, CHS_THRESHOLDS } from '../../../constants/chsCategories';

interface BenchmarkComparisonProps {
  comparison: string;
  percentile: number;
  size?: 'small' | 'medium';
  showBar?: boolean;
}

const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  comparison,
  percentile,
  size = 'medium',
  showBar = true,
}) => {
  // Determine color based on CHS thresholds (70/55/45/30)
  const getPercentileColor = (): { bg: string; fill: string } => {
    const category = getCHSCategoryConfig(percentile);
    return { bg: category.bgColor, fill: category.color };
  };

  const colors = getPercentileColor();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const textStyle: React.CSSProperties = {
    fontSize: size === 'small' ? '11px' : '12px',
    color: '#5E6C84',
    fontStyle: 'italic',
  };

  const barContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: size === 'small' ? '80px' : '120px',
    height: size === 'small' ? '4px' : '6px',
    backgroundColor: colors.bg,
    borderRadius: '3px',
    overflow: 'hidden',
  };

  const barFillStyle: React.CSSProperties = {
    width: `${percentile}%`,
    height: '100%',
    backgroundColor: colors.fill,
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{comparison}</span>
      {showBar && (
        <div style={barContainerStyle}>
          <div style={barFillStyle} />
        </div>
      )}
    </div>
  );
};

export default BenchmarkComparison;
