/**
 * Dimension Prioritization Utility
 *
 * Categorizes dimensions into 3 priority tiers (NOW, NEXT, LATER) based on
 * health score and trend direction.
 *
 * Uses CHS thresholds: 30/45/55/70
 */

import type { DimensionResult, TrendDirection } from '../types/assessment';

export type PriorityTier = 'now' | 'next' | 'later';

export interface PrioritizedDimension {
  dimension: DimensionResult;
  tier: PriorityTier;
  priorityScore: number; // Lower = higher priority (for sorting)
  reason: string; // Human-readable explanation
}

export interface PrioritizedDimensions {
  now: PrioritizedDimension[];
  next: PrioritizedDimension[];
  later: PrioritizedDimension[];
}

/**
 * Trend weight for sorting within tiers.
 * Declining trends are prioritized higher (lower score = higher priority)
 */
const TREND_WEIGHTS: Record<TrendDirection, number> = {
  declining: 0,
  stable: 1,
  improving: 2,
};

/**
 * Generates a human-readable reason for why a dimension is in its tier.
 * Uses CHS thresholds: 30/45/55/70
 */
function getReason(healthScore: number, trend: TrendDirection, tier: PriorityTier): string {
  // CHS category descriptions
  const scoreDesc = healthScore < 30
    ? 'needs attention'
    : healthScore < 45
      ? 'below average'
      : healthScore < 55
        ? 'average performance'
        : healthScore < 70
          ? 'good performance'
          : 'excellent performance';

  const trendDesc = trend === 'declining'
    ? 'declining trend'
    : trend === 'stable'
      ? 'stable trend'
      : 'improving trend';

  if (tier === 'now') {
    if (healthScore < 45) {
      return `${scoreDesc} (score: ${healthScore})${trend === 'declining' ? ' with ' + trendDesc : ''}`;
    }
    return `${trendDesc} despite ${scoreDesc} (score: ${healthScore})`;
  }

  if (tier === 'next') {
    if (trend === 'declining') {
      return `${trendDesc} from ${scoreDesc} (score: ${healthScore})`;
    }
    return `${scoreDesc} (score: ${healthScore}), ${trendDesc}`;
  }

  // 'later' tier
  return `${scoreDesc} (score: ${healthScore}), ${trendDesc}`;
}

/**
 * Calculates priority score for sorting within tiers.
 * Lower score = higher priority
 *
 * Score is calculated as: healthScore + (trend_weight * 100)
 * This ensures health score is the primary factor, with trend as secondary
 */
function calculatePriorityScore(healthScore: number, trend: TrendDirection): number {
  return healthScore + (TREND_WEIGHTS[trend] * 100);
}

/**
 * Determines which priority tier a dimension belongs to based on rules:
 * Uses CHS thresholds: 30/45/55/70
 *
 * NOW:   healthScore < 45 OR (healthScore < 55 AND declining)
 * NEXT:  healthScore 45-54 (not declining) OR (healthScore >= 55 AND declining)
 * LATER: healthScore >= 55 AND (stable OR improving)
 */
function determineTier(healthScore: number, trend: TrendDirection): PriorityTier {
  // NOW: Below Average or worse, OR Average that is declining
  if (healthScore < 45) {
    return 'now';
  }
  if (healthScore < 55 && trend === 'declining') {
    return 'now';
  }

  // LATER: Good or better that aren't declining
  if (healthScore >= 55 && trend !== 'declining') {
    return 'later';
  }

  // NEXT: Everything else
  // - Average performers (45-54) that are stable/improving
  // - Good or better (55+) that are declining
  return 'next';
}

/**
 * Prioritizes all dimensions into 3 tiers based on health score and trend.
 *
 * @param dimensions - Array of DimensionResult from assessment
 * @returns Object with dimensions sorted into now, next, later arrays
 */
export function prioritizeDimensions(dimensions: DimensionResult[]): PrioritizedDimensions {
  const result: PrioritizedDimensions = {
    now: [],
    next: [],
    later: [],
  };

  for (const dimension of dimensions) {
    // Use healthScore if available, fall back to overallPercentile for backward compatibility
    const healthScore = dimension.healthScore ?? dimension.overallPercentile;
    const trend = dimension.trend;
    const tier = determineTier(healthScore, trend);
    const priorityScore = calculatePriorityScore(healthScore, trend);
    const reason = getReason(healthScore, trend, tier);

    const prioritized: PrioritizedDimension = {
      dimension,
      tier,
      priorityScore,
      reason,
    };

    result[tier].push(prioritized);
  }

  // Sort each tier by priority score (lower = higher priority)
  result.now.sort((a, b) => a.priorityScore - b.priorityScore);
  result.next.sort((a, b) => a.priorityScore - b.priorityScore);
  result.later.sort((a, b) => a.priorityScore - b.priorityScore);

  return result;
}

/**
 * Gets the top priority dimension (if any exist in 'now' tier)
 */
export function getTopPriority(prioritized: PrioritizedDimensions): PrioritizedDimension | null {
  return prioritized.now[0] || null;
}

/**
 * Gets summary counts for each tier
 */
export function getPriorityCounts(prioritized: PrioritizedDimensions): {
  now: number;
  next: number;
  later: number;
  total: number;
} {
  return {
    now: prioritized.now.length,
    next: prioritized.next.length,
    later: prioritized.later.length,
    total: prioritized.now.length + prioritized.next.length + prioritized.later.length,
  };
}

/**
 * Prioritizes dimensions for a specific outcome area.
 * Filters to only dimensions that contribute to the given outcome, then
 * calculates NOW/NEXT/LATER based on their percentiles.
 *
 * @param dimensions - Array of DimensionResult from assessment
 * @param outcomeDimensionKeys - Array of dimension keys that contribute to this outcome
 * @returns Object with dimensions sorted into now, next, later arrays
 */
export function prioritizeDimensionsForOutcome(
  dimensions: DimensionResult[],
  outcomeDimensionKeys: string[]
): PrioritizedDimensions {
  const keySet = new Set(outcomeDimensionKeys);
  const filtered = dimensions.filter(d => keySet.has(d.dimensionKey));
  return prioritizeDimensions(filtered);
}

/**
 * Gets the priority tier for a single dimension
 */
export function getDimensionPriorityTier(dimension: DimensionResult): PriorityTier {
  return determineTier(dimension.overallPercentile, dimension.trend);
}

/**
 * Tier display configuration for consistent styling
 */
export const PRIORITY_TIER_CONFIG = {
  now: {
    label: 'Focus Now',
    shortLabel: 'Now',
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FF8F73',
    icon: '🔴',
    description: 'These dimensions need immediate attention',
  },
  next: {
    label: 'Up Next',
    shortLabel: 'Next',
    color: '#FF8B00',
    bgColor: '#FFF7E6',
    borderColor: '#FFD666',
    icon: '🟡',
    description: 'Keep an eye on these areas',
  },
  later: {
    label: 'On Track',
    shortLabel: 'Later',
    color: '#36B37E',
    bgColor: '#E3FCEF',
    borderColor: '#79F2C0',
    icon: '🟢',
    description: 'These dimensions are performing well',
  },
} as const;
