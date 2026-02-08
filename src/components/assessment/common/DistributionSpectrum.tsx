import React, { useMemo, useState } from 'react';
import { INDICATOR_TIERS, getIndicatorTier } from '../../../types/indicatorTiers';

// Number of similar teams to always show
const SIMILAR_TEAMS_COUNT = 47;

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}

interface DistributionSpectrumProps {
  // Original percentile-based mode (for backward compatibility)
  percentile?: number; // 0-100, where higher is better

  // Enhanced value-based mode
  value?: number;             // Team's actual value
  minValue?: number;          // Minimum in distribution
  maxValue?: number;          // Maximum in distribution
  otherTeamValues?: number[]; // Other teams' values for dots
  higherIsBetter?: boolean;   // Controls spectrum direction (default: true)
  unit?: string;              // For formatting end labels (e.g., "%", "days")
  displayValue?: string;      // Pre-formatted value label

  // Common props
  width?: number;
  height?: number;
  showLabel?: boolean;
  subLabel?: string;            // Text shown below the value label (e.g., "Bottom 50%")
}

/**
 * Generate 47 team values from seed data using interpolation and jitter
 */
function generateAllTeamValues(
  seedValues: number[],
  min: number,
  max: number
): number[] {
  if (seedValues.length >= SIMILAR_TEAMS_COUNT) {
    return seedValues.slice(0, SIMILAR_TEAMS_COUNT);
  }

  const result: number[] = [...seedValues];
  const range = max - min;

  // Generate additional values to reach 47 total
  while (result.length < SIMILAR_TEAMS_COUNT) {
    // Use a seeded random approach for consistency
    const seed = result.length * 9973;
    const normalRandom = () => {
      const u1 = ((seed * 9301 + 49297) % 233280) / 233280;
      const u2 = ((seed * 9302 + 49298) % 233280) / 233280;
      return Math.sqrt(-2 * Math.log(Math.max(0.0001, u1))) * Math.cos(2 * Math.PI * u2);
    };

    // Create normally distributed values around the center
    const mean = (min + max) / 2;
    const stdDev = range / 4;
    const newValue = mean + normalRandom() * stdDev;
    result.push(Math.max(min, Math.min(max, newValue)));
  }

  return result;
}

/**
 * Visual spectrum showing where a team falls relative to others.
 * Matches the TableScoreSpectrum style with banded gradient and zone dividers.
 */
const DistributionSpectrum: React.FC<DistributionSpectrumProps> = ({
  percentile,
  value,
  minValue,
  maxValue,
  otherTeamValues,
  higherIsBetter = true,
  unit = '',
  displayValue,
  width = 280,
  showLabel = true,
  subLabel,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  });

  // Determine which mode we're in
  const isValueMode = value !== undefined && minValue !== undefined && maxValue !== undefined;

  // For value mode: calculate position as percentage of range
  const getValuePosition = () => {
    if (!isValueMode || maxValue === minValue) return 50;
    const clampedValue = Math.max(minValue!, Math.min(maxValue!, value!));
    return ((clampedValue - minValue!) / (maxValue! - minValue!)) * 100;
  };

  // For percentile mode (backward compatibility)
  const clampedPercentile = percentile !== undefined
    ? Math.max(0, Math.min(100, percentile))
    : 50;

  // Calculate marker position
  const markerPosition = isValueMode ? getValuePosition() : clampedPercentile;

  // Get the tier for coloring
  const effectivePercentile = isValueMode
    ? (higherIsBetter ? markerPosition : 100 - markerPosition)
    : clampedPercentile;
  const tier = getIndicatorTier(effectivePercentile);

  // Format value for display
  const formatValue = (val: number): string => {
    if (unit === '%') {
      const percentVal = val > 1 ? val : val * 100;
      return `${Math.round(percentVal)}%`;
    }
    if (unit === 'days' || unit === 'd') {
      return `${val.toFixed(1)}d`;
    }
    if (val >= 1) {
      return val.toFixed(1);
    }
    return val.toFixed(2);
  };

  // Generate all 47 team positions
  const allTeamPositions = useMemo(() => {
    if (isValueMode && otherTeamValues && minValue !== undefined && maxValue !== undefined) {
      // Value mode: generate 47 values and convert to positions
      const allValues = generateAllTeamValues(otherTeamValues, minValue, maxValue);
      const range = maxValue - minValue;
      if (range === 0) return [];
      return allValues.map((v, idx) => ({
        position: ((v - minValue) / range) * 100,
        value: v,
        idx,
      }));
    } else {
      // Percentile mode: generate 47 pseudo-random positions
      const positions: { position: number; value: number; idx: number }[] = [];
      for (let i = 0; i < SIMILAR_TEAMS_COUNT; i++) {
        // Seeded random for consistency
        const seed = (clampedPercentile + 1) * (i + 1) * 9973;
        const normalRandom = () => {
          const u1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const u2 = ((seed * 9302 + 49298) % 233280) / 233280;
          return Math.sqrt(-2 * Math.log(Math.max(0.0001, u1))) * Math.cos(2 * Math.PI * u2);
        };
        const pos = 50 + normalRandom() * 25;
        positions.push({
          position: Math.max(2, Math.min(98, pos)),
          value: pos,
          idx: i,
        });
      }
      return positions;
    }
  }, [isValueMode, otherTeamValues, minValue, maxValue, clampedPercentile]);

  const barHeight = 8;
  const markerSize = 14;
  const dotsAreaHeight = 20;
  const labelWidth = 28;
  const spectrumWidth = width - (labelWidth * 2) - 8;

  // Build 5-tier banded gradient using tier colors (matching How You Compare spectrum)
  const getGradient = () => {
    if (higherIsBetter) {
      // Left = bad (red), Right = good (green) - 5-tier system
      return `linear-gradient(to right,
        ${INDICATOR_TIERS[0].color} 0%,
        ${INDICATOR_TIERS[0].color} 25%,
        ${INDICATOR_TIERS[1].color} 25%,
        ${INDICATOR_TIERS[1].color} 50%,
        ${INDICATOR_TIERS[2].color} 50%,
        ${INDICATOR_TIERS[2].color} 75%,
        ${INDICATOR_TIERS[3].color} 75%,
        ${INDICATOR_TIERS[3].color} 90%,
        ${INDICATOR_TIERS[4].color} 90%,
        ${INDICATOR_TIERS[4].color} 100%
      )`;
    } else {
      // Left = good (green), Right = bad (red) - 5-tier system
      return `linear-gradient(to right,
        ${INDICATOR_TIERS[4].color} 0%,
        ${INDICATOR_TIERS[4].color} 10%,
        ${INDICATOR_TIERS[3].color} 10%,
        ${INDICATOR_TIERS[3].color} 25%,
        ${INDICATOR_TIERS[2].color} 25%,
        ${INDICATOR_TIERS[2].color} 50%,
        ${INDICATOR_TIERS[1].color} 50%,
        ${INDICATOR_TIERS[1].color} 75%,
        ${INDICATOR_TIERS[0].color} 75%,
        ${INDICATOR_TIERS[0].color} 100%
      )`;
    }
  };

  // Zone boundaries for 5-tier system
  const zoneBoundaries = [25, 50, 75, 90];

  const handleDotMouseEnter = (
    e: React.MouseEvent,
    dotValue: number,
    idx: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: `Team ${idx + 1}`,
      value: isValueMode ? formatValue(dotValue) : `${Math.round(dotValue)}%`,
    });
  };

  const handleMarkerMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: 'Your Team',
      value: displayValue || (isValueMode && value !== undefined ? formatValue(value) : `${Math.round(clampedPercentile)}%`),
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Get endpoint colors based on direction (5-tier system: index 0-4)
  const leftEndpointTier = higherIsBetter ? INDICATOR_TIERS[0] : INDICATOR_TIERS[4];
  const rightEndpointTier = higherIsBetter ? INDICATOR_TIERS[4] : INDICATOR_TIERS[0];

  return (
    <div style={{ width, display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#172B4D',
            color: '#FFFFFF',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 2 }}>{tooltip.label}</div>
          <div style={{ color: '#B3BAC5' }}>{tooltip.value}</div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: -6,
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #172B4D',
            }}
          />
        </div>
      )}

      {/* Spectrum */}
      <div style={{ width, flexShrink: 0 }}>
        {/* Scattered dots area */}
        <div style={{ height: dotsAreaHeight, position: 'relative' }}>
          {allTeamPositions.map(dot => {
            const seed = (dot.position * 7 + dot.idx * 13) % 100;
            const y = 2 + (seed % 16);
            return (
              <div
                key={dot.idx}
                style={{
                  position: 'absolute',
                  left: `${dot.position}%`,
                  top: y,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(107, 119, 140, 0.35)',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease, background-color 0.1s ease',
                }}
                onMouseEnter={(e) => handleDotMouseEnter(e, dot.value, dot.idx)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </div>

        {/* Gradient bar with marker */}
        <div style={{ position: 'relative', height: markerSize }}>
          {/* Background gradient bar */}
          <div
            style={{
              position: 'absolute',
              top: (markerSize - barHeight) / 2,
              left: 0,
              right: 0,
              height: barHeight,
              borderRadius: barHeight / 2,
              background: getGradient(),
              opacity: 0.5,
            }}
          />

          {/* Zone boundary dividers */}
          {zoneBoundaries.map(pos => (
            <div
              key={pos}
              style={{
                position: 'absolute',
                top: (markerSize - barHeight) / 2,
                left: `${pos}%`,
                width: 1,
                height: barHeight,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              }}
            />
          ))}

          {/* Endpoint circles */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: (markerSize - 8) / 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: leftEndpointTier.bgColor,
              border: `1.5px solid ${leftEndpointTier.color}`,
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: (markerSize - 8) / 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: rightEndpointTier.bgColor,
              border: `1.5px solid ${rightEndpointTier.color}`,
              transform: 'translateX(50%)',
            }}
          />

          {/* Your team marker */}
          <div
            style={{
              position: 'absolute',
              left: `${markerPosition}%`,
              top: 0,
              width: markerSize,
              height: markerSize,
              borderRadius: '50%',
              backgroundColor: tier.color,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              transform: 'translateX(-50%)',
              zIndex: 2,
              cursor: 'pointer',
            }}
            onMouseEnter={handleMarkerMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </div>

        {/* Value label below marker */}
        {showLabel && (
          <div style={{ position: 'relative', height: subLabel ? 32 : 18, marginTop: 4 }}>
            <div
              style={{
                position: 'absolute',
                left: `${markerPosition}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: tier.color,
                }}
              >
                {displayValue || (isValueMode && value !== undefined ? formatValue(value) : '')}
              </span>
              {subLabel && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: '#6B778C',
                    marginTop: 1,
                  }}
                >
                  {subLabel}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DistributionSpectrum;
