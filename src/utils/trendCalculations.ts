// Trend Calculation Utilities
// Calculate trends based on actual indicator value changes (not percentile/rank changes)

import { TrendDirection, TrendDataPoint, IndicatorResult, TrendAggregation } from '../types/assessment';

// Thresholds for classifying trends based on actual value changes
export const TREND_THRESHOLDS = {
  // Percentage change threshold for considering a trend significant
  percentChangeThreshold: 5, // 5% change required
  // Absolute change threshold (for small values like ratios 0-1)
  absoluteChangeThreshold: 0.05,
  // Minimum data points required for reliable trend calculation
  minDataPoints: 3,
};

/**
 * Calculate trend direction from actual value changes
 * Uses both percentage and absolute thresholds depending on value magnitude
 *
 * @param trendData - Array of historical data points
 * @param higherIsBetter - Whether higher values indicate improvement
 * @returns TrendDirection based on value change
 */
export function calculateTrendFromValues(
  trendData: TrendDataPoint[],
  higherIsBetter: boolean = true
): TrendDirection {
  if (!trendData || trendData.length < TREND_THRESHOLDS.minDataPoints) {
    return 'stable';
  }

  const firstValue = trendData[0].value;
  const lastValue = trendData[trendData.length - 1].value;
  const change = lastValue - firstValue;

  // Calculate percentage change (avoid division by zero)
  const percentChange = firstValue !== 0
    ? (change / Math.abs(firstValue)) * 100
    : (change !== 0 ? 100 : 0); // If starting from 0, any change is 100%

  // Check if change is significant using either threshold
  const isPercentSignificant = Math.abs(percentChange) >= TREND_THRESHOLDS.percentChangeThreshold;
  const isAbsoluteSignificant = Math.abs(change) >= TREND_THRESHOLDS.absoluteChangeThreshold;

  // For small values (0-1 range like ratios), use absolute threshold
  // For larger values, use percentage threshold
  const isSmallValue = Math.abs(firstValue) <= 1;
  const isSignificant = isSmallValue ? isAbsoluteSignificant : isPercentSignificant;

  if (!isSignificant) {
    return 'stable';
  }

  // Determine direction based on whether higher values are better
  if (higherIsBetter) {
    // Higher is better: increase = improving, decrease = declining
    return change > 0 ? 'improving' : 'declining';
  } else {
    // Lower is better (e.g., variability): decrease = improving, increase = declining
    return change < 0 ? 'improving' : 'declining';
  }
}

/**
 * Calculate the actual value change (last - first)
 */
export function calculateValueChange(trendData: TrendDataPoint[]): number {
  if (!trendData || trendData.length < 2) {
    return 0;
  }
  return trendData[trendData.length - 1].value - trendData[0].value;
}

/**
 * Calculate the percentage change from first to last value
 */
export function calculatePercentChange(trendData: TrendDataPoint[]): number {
  if (!trendData || trendData.length < 2) {
    return 0;
  }
  const firstValue = trendData[0].value;
  const change = calculateValueChange(trendData);

  if (firstValue === 0) {
    return change !== 0 ? 100 : 0;
  }
  return (change / Math.abs(firstValue)) * 100;
}

/**
 * Aggregate indicator trends for dimension-level summary
 *
 * @param indicators - Array of indicators to aggregate
 * @returns TrendAggregation with counts of improving/stable/declining
 */
export function aggregateIndicatorTrends(
  indicators: IndicatorResult[]
): TrendAggregation {
  const aggregation: TrendAggregation = {
    improving: 0,
    stable: 0,
    declining: 0,
    total: 0,
  };

  for (const indicator of indicators) {
    aggregation[indicator.trend]++;
    aggregation.total++;
  }

  return aggregation;
}

/**
 * Determine the dominant trend from an aggregation
 *
 * @param aggregation - TrendAggregation counts
 * @returns The dominant TrendDirection
 */
export function getDominantTrendFromAggregation(
  aggregation: TrendAggregation
): TrendDirection {
  if (aggregation.declining > aggregation.improving) {
    return 'declining';
  }
  if (aggregation.improving > aggregation.declining) {
    return 'improving';
  }
  return 'stable';
}

/**
 * Get a human-readable summary of the trend aggregation
 *
 * @param aggregation - TrendAggregation counts
 * @returns Summary string like "3 improving, 2 stable, 1 declining"
 */
export function getTrendAggregationSummary(aggregation: TrendAggregation): string {
  const parts: string[] = [];

  if (aggregation.improving > 0) {
    parts.push(`${aggregation.improving} improving`);
  }
  if (aggregation.stable > 0) {
    parts.push(`${aggregation.stable} stable`);
  }
  if (aggregation.declining > 0) {
    parts.push(`${aggregation.declining} declining`);
  }

  return parts.join(', ') || 'No trend data';
}

/**
 * Calculate trend aggregation from all indicators in a dimension's categories
 *
 * @param categories - Array of indicator categories
 * @returns TrendAggregation with counts
 */
export function aggregateDimensionTrends(
  categories: { indicators: IndicatorResult[] }[]
): TrendAggregation {
  const allIndicators = categories.flatMap(cat => cat.indicators);
  return aggregateIndicatorTrends(allIndicators);
}
