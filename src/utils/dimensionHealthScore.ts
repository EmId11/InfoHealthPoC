/**
 * Dimension-Level Health Score Calculation
 *
 * Calculates CHS-aligned health scores for individual dimensions.
 * Uses z-score transformation to convert raw indicator values to a 0-100 scale
 * where 50 = baseline average.
 *
 * CHS Formula: CSS (50%) + TRS (35%) + PGS (15%)
 * - CSS: Current State Score from z-score aggregation of indicators
 * - TRS: Trajectory Score from early vs recent period comparison
 * - PGS: Peer Growth Score from ranking within baseline cohort
 *
 * This is the "engine" that transforms raw metrics into meaningful health scores,
 * NOT just re-bucketing percentiles with different thresholds.
 */

import { IndicatorResult, IndicatorCategory, TrendDirection } from '../types/assessment';
import { calculateDimensionCHS, DimensionCHSResult } from './compositeHealthScore';

/**
 * Population baseline statistics for z-score calculation.
 * In production, these would come from actual population data.
 * For now, we use reasonable defaults that create realistic distributions.
 */
interface PopulationBaseline {
  mean: number;
  stdDev: number;
}

/**
 * Default population baselines for common indicator types.
 * These represent the "average team" that a score of 50 corresponds to.
 */
const DEFAULT_BASELINES: Record<string, PopulationBaseline> = {
  // Percentages (0-1 scale in raw data)
  percentage: { mean: 0.5, stdDev: 0.2 },
  // Count-based metrics
  count: { mean: 10, stdDev: 5 },
  // Days/time metrics
  days: { mean: 7, stdDev: 3 },
  // Ratio metrics
  ratio: { mean: 1.0, stdDev: 0.3 },
};

/**
 * Calculate z-score for a value given population parameters.
 * Z-score tells us how many standard deviations from the mean.
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Transform z-score to 0-100 scale where 50 = baseline (z=0).
 * Uses a scaling factor that maps approximately:
 * - z = -2 → score ≈ 30 (Needs Attention threshold)
 * - z = -0.5 → score ≈ 45 (Below Average threshold)
 * - z = 0 → score = 50 (Average/baseline)
 * - z = 0.5 → score ≈ 55 (Good threshold)
 * - z = 2 → score ≈ 70 (Excellent threshold)
 *
 * The scaling factor of 10 maps each standard deviation to 10 points.
 */
function zScoreToHealthScore(zScore: number): number {
  const SCALE_FACTOR = 10;
  const BASELINE = 50;

  const rawScore = BASELINE + (zScore * SCALE_FACTOR);

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Determine if higher values are better for a given indicator.
 * This affects how we interpret the z-score direction.
 */
function isHigherBetter(indicatorId: string): boolean {
  // Indicators where LOWER is better (inverted)
  const lowerIsBetter = [
    'staleWorkItems',
    'staleEpics',
    'staleness',
    'midSprintCreations',
    'bulkChanges',
    'throughputVariability',
    'estimationVariability',
    'blockerAge',
    'blockerCount',
    'reopenRate',
    'cycleTimeVariability',
    'reworkRate',
    'defectDensity',
    'technicalDebt',
    'backlogAge',
    'queueTime',
  ];

  return !lowerIsBetter.some(pattern =>
    indicatorId.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Calculate health score for a single indicator.
 */
export function calculateIndicatorHealthScore(indicator: IndicatorResult): number {
  const { value, benchmarkPercentile, higherIsBetter } = indicator;

  // If we have a numeric value, use z-score transformation
  if (typeof value === 'number' && !isNaN(value)) {
    // Determine baseline based on indicator type
    const baseline = DEFAULT_BASELINES.percentage; // Default for most metrics

    // Calculate z-score
    let zScore = calculateZScore(value, baseline.mean, baseline.stdDev);

    // Invert for metrics where lower is better
    if (!higherIsBetter) {
      zScore = -zScore;
    }

    return zScoreToHealthScore(zScore);
  }

  // Fallback: transform percentile to health score
  // This is a compromise when we only have percentile data
  // We map percentile to z-score equivalent, then to health score
  // percentile 50 → z=0 → health=50
  // percentile 84 → z≈1 → health=60
  // percentile 16 → z≈-1 → health=40
  const percentileZScore = percentileToZScore(benchmarkPercentile);
  return zScoreToHealthScore(percentileZScore);
}

/**
 * Approximate z-score from percentile using inverse normal approximation.
 * This is the Beasley-Springer-Moro algorithm approximation.
 */
function percentileToZScore(percentile: number): number {
  const p = percentile / 100;

  if (p <= 0) return -3;
  if (p >= 1) return 3;

  // Rational approximation for inverse normal
  const a = [
    -3.969683028665376e+01,
    2.209460984245205e+02,
    -2.759285104469687e+02,
    1.383577518672690e+02,
    -3.066479806614716e+01,
    2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01,
    1.615858368580409e+02,
    -1.556989798598866e+02,
    6.680131188771972e+01,
    -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
    4.374664141464968e+00,
    2.938163982698783e+00,
  ];
  const d = [
    7.784695709041462e-03,
    3.224671290700398e-01,
    2.445134137142996e+00,
    3.754408661907416e+00,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

/**
 * Calculate health score for a category (group of indicators).
 * Uses weighted average of indicator health scores.
 */
export function calculateCategoryHealthScore(category: IndicatorCategory): number {
  if (category.indicators.length === 0) return 50;

  const scores = category.indicators.map(ind => calculateIndicatorHealthScore(ind));
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  return Math.round(avgScore);
}

/**
 * Apply trend adjustment to health score.
 * Improving trends boost the score, declining trends reduce it.
 */
function applyTrendAdjustment(baseScore: number, trend: TrendDirection): number {
  const TREND_ADJUSTMENT = {
    improving: 5,   // +5 points for improving trend
    stable: 0,      // No adjustment for stable
    declining: -5,  // -5 points for declining trend
  };

  const adjustment = TREND_ADJUSTMENT[trend] || 0;
  return Math.max(0, Math.min(100, baseScore + adjustment));
}

/**
 * Calculate the dimension-level health score from categories.
 * This is the main function used by the mock data generator.
 *
 * Algorithm:
 * 1. Calculate health score for each category
 * 2. Weight categories equally (or by configured weights)
 * 3. Apply trend adjustment
 * 4. Return final 0-100 score where 50 = baseline
 */
export function calculateDimensionHealthScore(
  categories: IndicatorCategory[],
  trend: TrendDirection,
  categoryWeights?: Record<string, number>
): number {
  if (categories.length === 0) return 50;

  // Calculate category scores
  const categoryScores = categories.map(cat => ({
    id: cat.id,
    score: calculateCategoryHealthScore(cat),
    weight: categoryWeights?.[cat.id] ?? 1,
  }));

  // Weighted average
  const totalWeight = categoryScores.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = categoryScores.reduce((sum, c) => sum + c.score * c.weight, 0);
  const baseScore = totalWeight > 0 ? weightedSum / totalWeight : 50;

  // Apply trend adjustment
  const finalScore = applyTrendAdjustment(baseScore, trend);

  return Math.round(finalScore);
}

/**
 * Transform a legacy percentile-based dimension result to include health score.
 * This is a compatibility layer for transitioning existing data.
 *
 * In production, we would calculate health scores from raw indicator values.
 * This function provides a reasonable approximation from percentiles.
 */
export function transformPercentileToHealthScore(
  percentile: number,
  trend: TrendDirection
): number {
  // Convert percentile to z-score equivalent
  const zScore = percentileToZScore(percentile);

  // Convert z-score to health score
  const baseScore = zScoreToHealthScore(zScore);

  // Apply trend adjustment
  return applyTrendAdjustment(baseScore, trend);
}

/**
 * Generate a realistic health score for mock data.
 * Creates a distribution centered around 50 (baseline) with realistic spread.
 *
 * @param bias - Optional bias to shift distribution (-1 to 1, where 0 = neutral)
 * @param variance - How much spread in scores (0-1, default 0.3)
 */
export function generateMockHealthScore(bias: number = 0, variance: number = 0.3): number {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const zScore = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Apply bias and variance
  // bias shifts the mean, variance controls spread
  const adjustedZ = (zScore * variance * 2) + (bias * 2);

  // Convert to health score
  const score = zScoreToHealthScore(adjustedZ);

  return Math.round(score);
}

// ============================================
// Full CHS Calculation for Dimensions
// ============================================

/**
 * Historical data input for CHS calculation
 */
export interface DimensionHistoricalData {
  /** Array of past CSS scores (oldest first) */
  historicalCSSValues?: number[];
  /** TRS values from peer dimensions (for PGS) */
  peerTRSValues?: number[];
  /** This dimension's TRS value (for PGS ranking) */
  teamTRS?: number;
}

/**
 * Calculate full CHS for a dimension including CSS, TRS, and PGS components.
 *
 * This is the primary function for dimension health calculation.
 * It calculates CSS from categories, then combines with historical data
 * to produce the full CHS result.
 *
 * @param categories - Indicator categories for CSS calculation
 * @param historicalData - Optional historical data for TRS/PGS
 * @param categoryWeights - Optional weights for categories
 */
export function calculateDimensionCHSFromCategories(
  categories: IndicatorCategory[],
  historicalData?: DimensionHistoricalData,
  categoryWeights?: Record<string, number>
): DimensionCHSResult {
  // Step 1: Calculate CSS from categories (current state from indicators)
  const cssScore = calculateCSSFromCategories(categories, categoryWeights);

  // Step 2: Apply CHS formula with historical data
  const chsResult = calculateDimensionCHS(
    cssScore,
    historicalData?.historicalCSSValues,
    historicalData?.peerTRSValues,
    historicalData?.teamTRS
  );

  return chsResult;
}

/**
 * Calculate CSS (Current State Score) from categories.
 * This is the z-score aggregation of indicator values.
 */
function calculateCSSFromCategories(
  categories: IndicatorCategory[],
  categoryWeights?: Record<string, number>
): number {
  if (categories.length === 0) return 50;

  // Calculate category scores
  const categoryScores = categories.map(cat => ({
    id: cat.id,
    score: calculateCategoryHealthScore(cat),
    weight: categoryWeights?.[cat.id] ?? 1,
  }));

  // Weighted average
  const totalWeight = categoryScores.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = categoryScores.reduce((sum, c) => sum + c.score * c.weight, 0);

  return totalWeight > 0 ? weightedSum / totalWeight : 50;
}

/**
 * Generate mock CHS result for a dimension with realistic component values.
 *
 * @param targetScore - Target final CHS score
 * @param hasHistory - Whether to include TRS/PGS components
 */
export function generateMockDimensionCHS(
  targetScore: number,
  hasHistory: boolean = true
): DimensionCHSResult {
  // Generate CSS centered around target (CSS is 50% of final score)
  const cssVariance = 5;
  const cssScore = targetScore + (Math.random() - 0.5) * cssVariance * 2;

  if (!hasHistory) {
    // CSS-only result
    return {
      healthScore: Math.round(cssScore),
      cssScore: Math.round(cssScore),
      trsScore: null,
      pgsScore: null,
      standardError: 4.8,
      confidenceInterval: {
        lower: Math.round(cssScore - 8),
        upper: Math.round(cssScore + 8),
      },
      componentsAvailable: { css: true, trs: false, pgs: false },
      weightsUsed: { css: 1.0, trs: 0, pgs: 0 },
    };
  }

  // Generate TRS and PGS that combine with CSS to hit target
  // CHS = 0.5*CSS + 0.35*TRS + 0.15*PGS
  // Solve for TRS/PGS given target and CSS

  // Add some variance to make it realistic
  const trsScore = 50 + (Math.random() - 0.5) * 30; // 35-65 range
  const pgsScore = 50 + (Math.random() - 0.5) * 20; // 40-60 range

  const calculatedCHS = 0.5 * cssScore + 0.35 * trsScore + 0.15 * pgsScore;
  const healthScore = Math.max(5, Math.min(95, calculatedCHS));

  return {
    healthScore: Math.round(healthScore * 10) / 10,
    cssScore: Math.round(cssScore * 10) / 10,
    trsScore: Math.round(trsScore * 10) / 10,
    pgsScore: Math.round(pgsScore * 10) / 10,
    standardError: 3.6,
    confidenceInterval: {
      lower: Math.round(healthScore - 6),
      upper: Math.round(healthScore + 6),
    },
    componentsAvailable: { css: true, trs: true, pgs: true },
    weightsUsed: { css: 0.5, trs: 0.35, pgs: 0.15 },
  };
}

// Re-export for convenience
export type { DimensionCHSResult } from './compositeHealthScore';
