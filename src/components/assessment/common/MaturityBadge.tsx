import React from 'react';
import {
  MaturityLevel,
  MaturityLevelName,
  getMaturityLevelConfig,
  TrendDirection,
  getTrendConfig,
  getDimensionDescription,
} from '../../../types/maturity';

type BadgeVariant = 'badge' | 'chip' | 'minimal';
type BadgeSize = 'small' | 'medium' | 'large';

interface MaturityBadgeProps {
  /** Maturity level (1-5) OR percentile (0-100) - if > 5, treated as percentile */
  level: MaturityLevel | number;
  /** Badge variant: badge (full pill), chip (compact), minimal (dot + text) */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Optional trend indicator to display alongside */
  trend?: TrendDirection;
  /** Show trend as arrow icon */
  showTrendIcon?: boolean;
  /** Additional className */
  className?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
  /** Optional dimension key for contextual tooltip description */
  dimensionKey?: string;
}

/**
 * MaturityBadge - Unified badge component for displaying maturity levels
 *
 * Accepts either:
 * - Maturity level (1-5) directly
 * - Percentile (0-100) which is converted to maturity level
 *
 * Variants:
 * - badge: Full pill with background and border
 * - chip: Compact rounded badge
 * - minimal: Just dot + text
 */
const MaturityBadge: React.FC<MaturityBadgeProps> = ({
  level,
  variant = 'badge',
  size = 'medium',
  showLabel = true,
  trend,
  showTrendIcon = false,
  style,
  dimensionKey,
}) => {
  // If level > 5, treat it as percentile
  const percentile = level > 5 ? level : undefined;
  const config = percentile !== undefined
    ? getMaturityLevelConfig(percentile)
    : getMaturityLevelConfig(((level as MaturityLevel) - 1) * 20 + 10); // Map level to middle of range

  const trendConfig = trend ? getTrendConfig(trend) : null;

  // Get contextual description for tooltip
  const tooltipText = getDimensionDescription(config.level, dimensionKey);

  // Size configurations
  const sizeConfig = {
    small: {
      fontSize: '11px',
      padding: variant === 'badge' ? '2px 8px' : '2px 6px',
      dotSize: '6px',
      gap: '4px',
    },
    medium: {
      fontSize: '12px',
      padding: variant === 'badge' ? '4px 12px' : '4px 8px',
      dotSize: '8px',
      gap: '6px',
    },
    large: {
      fontSize: '14px',
      padding: variant === 'badge' ? '6px 16px' : '6px 10px',
      dotSize: '10px',
      gap: '8px',
    },
  }[size];

  // Render based on variant
  if (variant === 'minimal') {
    return (
      <span style={{ ...styles.minimal, ...style }} title={tooltipText}>
        <span
          style={{
            ...styles.dot,
            backgroundColor: config.color,
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
          }}
        />
        {showLabel && (
          <span style={{ ...styles.minimalLabel, color: config.color, fontSize: sizeConfig.fontSize }}>
            {config.name}
          </span>
        )}
        {showTrendIcon && trendConfig && (
          <span style={{ ...styles.trendIcon, color: trendConfig.color, fontSize: sizeConfig.fontSize }}>
            {trendConfig.icon}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <span
        title={tooltipText}
        style={{
          ...styles.chip,
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontSize: sizeConfig.fontSize,
          padding: sizeConfig.padding,
          ...style,
        }}
      >
        {showLabel ? config.name : config.level}
        {showTrendIcon && trendConfig && (
          <span style={{ ...styles.trendIcon, color: trendConfig.color }}>
            {trendConfig.icon}
          </span>
        )}
      </span>
    );
  }

  // Default: badge variant
  return (
    <span
      title={tooltipText}
      style={{
        ...styles.badge,
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        color: config.color,
        fontSize: sizeConfig.fontSize,
        padding: sizeConfig.padding,
        gap: sizeConfig.gap,
        ...style,
      }}
    >
      <span
        style={{
          ...styles.dot,
          backgroundColor: config.color,
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
        }}
      />
      {showLabel && <span>{config.name}</span>}
      {showTrendIcon && trendConfig && (
        <span style={{ ...styles.trendIcon, color: trendConfig.color }}>
          {trendConfig.icon}
        </span>
      )}
    </span>
  );
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '20px',
    border: '1px solid',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '4px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  minimal: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  minimalLabel: {
    fontWeight: 500,
  },
  dot: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  trendIcon: {
    marginLeft: '4px',
    fontWeight: 700,
  },
};

export default MaturityBadge;

// Also export a simpler function component for inline use
export const MaturityDot: React.FC<{ level: MaturityLevel | number; size?: number }> = ({
  level,
  size = 8,
}) => {
  const config = level > 5
    ? getMaturityLevelConfig(level)
    : getMaturityLevelConfig(((level as MaturityLevel) - 1) * 20 + 10);

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: config.color,
      }}
    />
  );
};
