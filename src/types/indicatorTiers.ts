/**
 * Unified Indicator Tier System
 *
 * This module defines a 5-tier model for classifying indicator health based on
 * BENCHMARK PERCENTILE rankings against peer teams.
 *
 * ============================================================================
 * IMPORTANT: INDICATOR PERCENTILE vs DIMENSION HEALTH SCORE
 * ============================================================================
 *
 * INDICATORS use "Benchmark Percentile" (this module):
 * - Compares your raw metric value against peer teams' values
 * - True percentile ranking: "You're in the 73rd percentile of similar teams"
 * - Percentile-based thresholds (quartiles): 0-25, 26-50, 51-75, 76-90, 91-100
 * - This is the ONE valid use of "percentile" terminology in the app
 *
 * DIMENSIONS/OUTCOMES/OVERALL use "Health Score" (CHS methodology):
 * - Composite Health Score = 0.50×CSS + 0.35×TRS + 0.15×PGS
 * - Baseline-centered scoring where 50 = typical/baseline practices
 * - Different thresholds: <30, 30-44, 45-54, 55-69, 70+
 * - Uses "health score" terminology, NOT "percentile"
 *
 * ============================================================================
 *
 * Indicator Tiers (percentile-based for peer comparison):
 * 1. Needs Attention (0-25%) - Bottom quartile, requires focus
 * 2. Below Average (26-50%) - Below median, room for improvement
 * 3. Average (51-75%) - Above median, meeting expectations
 * 4. Good (76-90%) - Top quartile, above average
 * 5. Excellent (91-100%) - Top 10%, exceptional performer
 */

import type { IndicatorResult } from './assessment';

/** Indicator tier level as a numeric value (1-5) */
export type IndicatorTierLevel = 1 | 2 | 3 | 4 | 5;

/** Human-readable tier names - matches dimension health score labels */
export type IndicatorTierName =
  | 'Needs Attention'
  | 'Below Average'
  | 'Average'
  | 'Good'
  | 'Excellent';

/** Configuration for a single indicator tier */
export interface IndicatorTier {
  /** Numeric level (1-5, where 1 is worst) */
  level: IndicatorTierLevel;
  /** Human-readable name */
  name: IndicatorTierName;
  /** Minimum percentile (inclusive) */
  minPercentile: number;
  /** Maximum percentile (inclusive) */
  maxPercentile: number;
  /** Primary color for text and icons */
  color: string;
  /** Background color for badges and cards */
  bgColor: string;
  /** Border color for containers */
  borderColor: string;
  /** Whether this tier represents risk (tiers 1-2) */
  isRisk: boolean;
  /** Short description of what this tier means */
  description: string;
}

/**
 * The canonical indicator tier definitions.
 * Uses 5 tiers matching dimension health score labels.
 * Percentile thresholds are optimized for indicator comparison.
 */
export const INDICATOR_TIERS: readonly IndicatorTier[] = [
  {
    level: 1,
    name: 'Needs Attention',
    minPercentile: 0,
    maxPercentile: 25,
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FFBDAD',
    isRisk: true,
    description: 'Below benchmark, requires focus',
  },
  {
    level: 2,
    name: 'Below Average',
    minPercentile: 26,
    maxPercentile: 50,
    color: '#FF8B00',
    bgColor: '#FFF7ED',
    borderColor: '#FFE380',
    isRisk: false,
    description: 'Room for improvement',
  },
  {
    level: 3,
    name: 'Average',
    minPercentile: 51,
    maxPercentile: 75,
    color: '#6B778C',
    bgColor: '#F4F5F7',
    borderColor: '#DFE1E6',
    isRisk: false,
    description: 'Meeting expectations',
  },
  {
    level: 4,
    name: 'Good',
    minPercentile: 76,
    maxPercentile: 90,
    color: '#00875A',
    bgColor: '#E3FCEF',
    borderColor: '#79F2C0',
    isRisk: false,
    description: 'Above average',
  },
  {
    level: 5,
    name: 'Excellent',
    minPercentile: 91,
    maxPercentile: 100,
    color: '#006644',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
    isRisk: false,
    description: 'Top performer',
  },
] as const;

/** Distribution of indicators across all 5 tiers */
export interface TierDistribution {
  /** Count of indicators in each tier */
  needsAttention: number;
  belowAverage: number;
  average: number;
  good: number;
  excellent: number;
  /** Total indicators analyzed */
  total: number;
  /** Risk count (Needs Attention tier) */
  riskCount: number;
  /** Combined healthy count (Good + Excellent) */
  healthyCount: number;
}

/** Distribution with tier details for display */
export interface TierDistributionWithDetails {
  distribution: TierDistribution;
  tiers: Array<{
    tier: IndicatorTier;
    count: number;
    percentage: number;
  }>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the indicator tier for a given percentile.
 *
 * @param percentile - Value from 0-100
 * @returns The matching IndicatorTier
 */
export function getIndicatorTier(percentile: number): IndicatorTier {
  // Clamp percentile to valid range
  const clampedPercentile = Math.max(0, Math.min(100, percentile));

  // Find matching tier
  const tier = INDICATOR_TIERS.find(
    t => clampedPercentile >= t.minPercentile && clampedPercentile <= t.maxPercentile
  );

  // Should always find a match, but default to Needs Attention if not
  return tier || INDICATOR_TIERS[0];
}

/**
 * Get the tier level (1-5) for a given percentile.
 *
 * @param percentile - Value from 0-100
 * @returns IndicatorTierLevel (1-5)
 */
export function getIndicatorTierLevel(percentile: number): IndicatorTierLevel {
  return getIndicatorTier(percentile).level;
}

/**
 * Calculate the distribution of indicators across all tiers.
 *
 * @param indicators - Array of indicator results
 * @returns TierDistribution with counts for each tier
 */
export function getTierDistribution(indicators: IndicatorResult[]): TierDistribution {
  const distribution: TierDistribution = {
    needsAttention: 0,
    belowAverage: 0,
    average: 0,
    good: 0,
    excellent: 0,
    total: indicators.length,
    riskCount: 0,
    healthyCount: 0,
  };

  for (const indicator of indicators) {
    const tier = getIndicatorTier(indicator.benchmarkPercentile);

    switch (tier.level) {
      case 1:
        distribution.needsAttention++;
        break;
      case 2:
        distribution.belowAverage++;
        break;
      case 3:
        distribution.average++;
        break;
      case 4:
        distribution.good++;
        break;
      case 5:
        distribution.excellent++;
        break;
    }
  }

  // Calculate aggregates
  distribution.riskCount = distribution.needsAttention;
  distribution.healthyCount = distribution.good + distribution.excellent;

  return distribution;
}

/**
 * Get tier distribution with full tier details for display.
 *
 * @param indicators - Array of indicator results
 * @returns TierDistributionWithDetails including tier configs and percentages
 */
export function getTierDistributionWithDetails(
  indicators: IndicatorResult[]
): TierDistributionWithDetails {
  const distribution = getTierDistribution(indicators);
  const total = distribution.total || 1; // Avoid division by zero

  const counts = [
    distribution.needsAttention,
    distribution.belowAverage,
    distribution.average,
    distribution.good,
    distribution.excellent,
  ];

  const tiers = INDICATOR_TIERS.map((tier, index) => ({
    tier,
    count: counts[index],
    percentage: Math.round((counts[index] / total) * 100),
  }));

  return { distribution, tiers };
}

/**
 * Check if an indicator is in a risk tier (Needs Attention).
 *
 * @param percentile - The indicator's benchmark percentile
 * @returns true if in Needs Attention tier
 */
export function isIndicatorAtRisk(percentile: number): boolean {
  return getIndicatorTier(percentile).isRisk;
}

/**
 * Get a human-readable tier label for a percentile.
 * Similar to getPercentileText but uses tier names.
 *
 * @param percentile - Value from 0-100
 * @returns Tier name with percentile range
 */
export function getTierLabel(percentile: number): string {
  const tier = getIndicatorTier(percentile);
  return tier.name;
}

/**
 * Get a detailed percentile description for display.
 *
 * @param percentile - Value from 0-100
 * @returns Human-readable percentile description (e.g., "Bottom 5%", "Top 10%")
 */
export function getPercentileDescription(percentile: number): string {
  if (percentile <= 5) return 'Bottom 5%';
  if (percentile <= 10) return 'Bottom 10%';
  if (percentile <= 20) return 'Bottom 20%';
  if (percentile <= 25) return 'Bottom 25%';
  if (percentile <= 50) return 'Bottom 50%';
  if (percentile <= 75) return 'Top 50%';
  if (percentile <= 80) return 'Top 25%';
  if (percentile <= 90) return 'Top 20%';
  if (percentile <= 95) return 'Top 10%';
  return 'Top 5%';
}

/**
 * Calculate category-level tier distribution.
 *
 * @param categories - Array of indicator categories
 * @returns Aggregated tier distribution across all categories
 */
export function getCategoryTierDistribution(
  categories: Array<{ indicators: IndicatorResult[] }>
): TierDistribution {
  const allIndicators = categories.flatMap(cat => cat.indicators);
  return getTierDistribution(allIndicators);
}
