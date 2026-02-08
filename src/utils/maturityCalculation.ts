/**
 * Risk-Adjusted Maturity Calculation
 *
 * This module provides functions for calculating risk-adjusted dimension maturity
 * that factors in:
 * 1. Base health score (current healthScore)
 * 2. Risk density (penalty for indicators in Needs Attention tier)
 * 3. Trend direction (bonus/penalty based on improving/declining indicators)
 *
 * The adjusted maturity provides a more accurate picture of dimension health
 * by penalizing dimensions with clustered risk indicators even if the average
 * health score looks acceptable.
 */

import type { DimensionResult, IndicatorResult, TrendDirection } from '../types/assessment';
import type { MaturityLevel, MaturityLevelName } from '../types/maturity';
import {
  getTierDistribution,
  type TierDistribution,
} from '../types/indicatorTiers';
import { getMaturityLevel, getMaturityLevelName } from '../types/maturity';

/** Configuration for risk penalty calculation */
export interface RiskPenaltyConfig {
  /** Points deducted per Needs Attention indicator (default: 2) */
  needsAttentionPenalty: number;
  /** Maximum total penalty (default: 20) */
  maxPenalty: number;
}

/** Configuration for trend adjustment calculation */
export interface TrendAdjustmentConfig {
  /** Max bonus for improving trends (default: 10) */
  maxBonus: number;
  /** Max penalty for declining trends (default: 10) */
  maxPenalty: number;
}

/** Weights for each component of the adjusted maturity */
export interface MaturityWeights {
  /** Weight for base percentile (default: 0.50) */
  basePercentile: number;
  /** Weight for risk penalty (default: 0.25) */
  riskDensity: number;
  /** Weight for trend adjustment (default: 0.25) */
  trend: number;
}

/** Complete risk-adjusted maturity result */
export interface RiskAdjustedMaturity {
  /** Original dimension percentile */
  basePercentile: number;
  /** Risk penalty (0-20 points, subtracted from base) */
  riskPenalty: number;
  /** Trend adjustment (-10 to +10 based on trend direction) */
  trendAdjustment: number;
  /** Final adjusted percentile (clamped 0-100) */
  adjustedPercentile: number;
  /** Maturity level based on adjusted percentile (1-5) */
  maturityLevel: MaturityLevel;
  /** Human-readable maturity name */
  maturityName: MaturityLevelName;
  /** Whether the adjustment significantly changed the maturity level */
  wasSignificantlyAdjusted: boolean;
  /** Original maturity level before adjustment */
  originalMaturityLevel: MaturityLevel;
  /** Breakdown of indicators by tier */
  tierDistribution: TierDistribution;
  /** Summary of trend directions */
  trendBreakdown: {
    improving: number;
    stable: number;
    declining: number;
  };
}

/** Default configuration values */
export const DEFAULT_RISK_PENALTY_CONFIG: RiskPenaltyConfig = {
  needsAttentionPenalty: 2,
  maxPenalty: 20,
};

export const DEFAULT_TREND_CONFIG: TrendAdjustmentConfig = {
  maxBonus: 10,
  maxPenalty: 10,
};

export const DEFAULT_MATURITY_WEIGHTS: MaturityWeights = {
  basePercentile: 0.50,
  riskDensity: 0.25,
  trend: 0.25,
};

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate the risk penalty based on indicator tier distribution.
 * Penalizes dimensions with indicators in Needs Attention tier.
 *
 * @param distribution - Tier distribution of indicators
 * @param config - Penalty configuration
 * @returns Risk penalty value (0 to maxPenalty)
 */
export function calculateRiskPenalty(
  distribution: TierDistribution,
  config: RiskPenaltyConfig = DEFAULT_RISK_PENALTY_CONFIG
): number {
  const rawPenalty = distribution.needsAttention * config.needsAttentionPenalty;

  return Math.min(rawPenalty, config.maxPenalty);
}

/**
 * Calculate trend adjustment based on indicator trend directions.
 * Rewards dimensions with improving indicators, penalizes declining.
 *
 * @param indicators - Array of indicator results
 * @param config - Trend adjustment configuration
 * @returns Trend adjustment value (-maxPenalty to +maxBonus)
 */
export function calculateTrendAdjustment(
  indicators: IndicatorResult[],
  config: TrendAdjustmentConfig = DEFAULT_TREND_CONFIG
): number {
  if (indicators.length === 0) return 0;

  let improving = 0;
  let declining = 0;

  for (const indicator of indicators) {
    if (indicator.trend === 'improving') improving++;
    if (indicator.trend === 'declining') declining++;
  }

  const total = indicators.length;
  const improvingRatio = improving / total;
  const decliningRatio = declining / total;

  // Net trend score: positive for improving, negative for declining
  // Scale by the ratio of indicators in that state
  const netTrendScore = improvingRatio - decliningRatio;

  if (netTrendScore > 0) {
    // Mostly improving: bonus up to maxBonus
    return Math.round(netTrendScore * config.maxBonus);
  } else if (netTrendScore < 0) {
    // Mostly declining: penalty up to maxPenalty
    return Math.round(netTrendScore * config.maxPenalty);
  }

  return 0; // Balanced or all stable
}

/**
 * Get the trend breakdown for a set of indicators.
 *
 * @param indicators - Array of indicator results
 * @returns Object with counts of improving, stable, declining
 */
export function getTrendBreakdown(
  indicators: IndicatorResult[]
): { improving: number; stable: number; declining: number } {
  const breakdown = { improving: 0, stable: 0, declining: 0 };

  for (const indicator of indicators) {
    if (indicator.trend === 'improving') breakdown.improving++;
    else if (indicator.trend === 'declining') breakdown.declining++;
    else breakdown.stable++;
  }

  return breakdown;
}

/**
 * Calculate risk-adjusted maturity for a dimension.
 *
 * The calculation:
 * 1. Start with base percentile
 * 2. Subtract risk penalty (based on Critical/At Risk indicator count)
 * 3. Add/subtract trend adjustment (based on improving/declining trends)
 * 4. Clamp result to 0-100
 *
 * @param dimension - The dimension result to analyze
 * @param penaltyConfig - Risk penalty configuration
 * @param trendConfig - Trend adjustment configuration
 * @returns Complete RiskAdjustedMaturity result
 */
export function calculateRiskAdjustedMaturity(
  dimension: DimensionResult,
  penaltyConfig: RiskPenaltyConfig = DEFAULT_RISK_PENALTY_CONFIG,
  trendConfig: TrendAdjustmentConfig = DEFAULT_TREND_CONFIG
): RiskAdjustedMaturity {
  // Gather all indicators from all categories
  const allIndicators = dimension.categories.flatMap(cat => cat.indicators);

  // Get tier distribution
  const tierDistribution = getTierDistribution(allIndicators);

  // Calculate components
  const basePercentile = dimension.overallPercentile;
  const riskPenalty = calculateRiskPenalty(tierDistribution, penaltyConfig);
  const trendAdjustment = calculateTrendAdjustment(allIndicators, trendConfig);
  const trendBreakdown = getTrendBreakdown(allIndicators);

  // Calculate adjusted percentile
  const rawAdjusted = basePercentile - riskPenalty + trendAdjustment;
  const adjustedPercentile = Math.max(0, Math.min(100, rawAdjusted));

  // Get maturity levels
  const originalMaturityLevel = getMaturityLevel(basePercentile);
  const maturityLevel = getMaturityLevel(adjustedPercentile);
  const maturityName = getMaturityLevelName(adjustedPercentile);

  // Check if adjustment was significant (changed maturity level)
  const wasSignificantlyAdjusted = maturityLevel !== originalMaturityLevel;

  return {
    basePercentile,
    riskPenalty,
    trendAdjustment,
    adjustedPercentile,
    maturityLevel,
    maturityName,
    wasSignificantlyAdjusted,
    originalMaturityLevel,
    tierDistribution,
    trendBreakdown,
  };
}

/**
 * Calculate risk-adjusted maturity using weighted components.
 * Alternative approach that directly weights each factor.
 *
 * @param dimension - The dimension result to analyze
 * @param weights - Component weights (should sum to 1.0)
 * @returns Adjusted percentile (0-100)
 */
export function calculateWeightedMaturity(
  dimension: DimensionResult,
  weights: MaturityWeights = DEFAULT_MATURITY_WEIGHTS
): number {
  const allIndicators = dimension.categories.flatMap(cat => cat.indicators);
  const tierDistribution = getTierDistribution(allIndicators);

  // Base component
  const baseComponent = dimension.overallPercentile * weights.basePercentile;

  // Risk density component (convert penalty to 0-100 scale)
  // More risk = lower score, scaled so max penalty (20) maps to 0
  const riskPenalty = calculateRiskPenalty(tierDistribution);
  const riskScore = Math.max(0, 100 - riskPenalty * 5); // 20 penalty = 0 score
  const riskComponent = riskScore * weights.riskDensity;

  // Trend component (convert adjustment to 0-100 scale)
  // Map -10 to +10 range to 0-100
  const trendAdjustment = calculateTrendAdjustment(allIndicators);
  const trendScore = 50 + trendAdjustment * 5; // -10 = 0, 0 = 50, +10 = 100
  const trendComponent = trendScore * weights.trend;

  return Math.max(0, Math.min(100, baseComponent + riskComponent + trendComponent));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a human-readable summary of the maturity adjustment.
 *
 * @param result - Risk-adjusted maturity result
 * @returns Summary string describing the adjustment
 */
export function getAdjustmentSummary(result: RiskAdjustedMaturity): string {
  const parts: string[] = [];

  if (result.riskPenalty > 0) {
    if (result.tierDistribution.needsAttention > 0) {
      parts.push(`-${result.riskPenalty} for ${result.tierDistribution.needsAttention} needs-attention indicators`);
    }
  }

  if (result.trendAdjustment > 0) {
    parts.push(`+${result.trendAdjustment} for improving trends`);
  } else if (result.trendAdjustment < 0) {
    parts.push(`${result.trendAdjustment} for declining trends`);
  }

  if (parts.length === 0) {
    return 'No adjustment needed';
  }

  return `Base: ${result.basePercentile} health score, ${parts.join(', ')}`;
}

/**
 * Determine if a dimension requires attention based on risk-adjusted analysis.
 *
 * @param result - Risk-adjusted maturity result
 * @returns true if the dimension should be prioritized
 */
export function requiresAttention(result: RiskAdjustedMaturity): boolean {
  // Requires attention if:
  // 1. Adjusted maturity is low (1-2)
  // 2. Has indicators in Needs Attention tier
  // 3. Majority of indicators are declining
  return (
    result.maturityLevel <= 2 ||
    result.tierDistribution.needsAttention > 0 ||
    result.trendBreakdown.declining > result.trendBreakdown.improving
  );
}

/**
 * Compare two dimensions by risk-adjusted maturity for sorting.
 * Lower maturity (worse) comes first.
 *
 * @param a - First dimension's adjusted maturity
 * @param b - Second dimension's adjusted maturity
 * @returns Negative if a should come first (is worse)
 */
export function compareByAdjustedMaturity(
  a: RiskAdjustedMaturity,
  b: RiskAdjustedMaturity
): number {
  // First by maturity level
  if (a.maturityLevel !== b.maturityLevel) {
    return a.maturityLevel - b.maturityLevel;
  }
  // Then by adjusted percentile
  return a.adjustedPercentile - b.adjustedPercentile;
}
