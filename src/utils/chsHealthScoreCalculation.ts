// CHS-based Health Score Calculation
// Implements Composite Health Score (CHS) methodology for assessment results
// Replaces the old 80% percentile + 20% trend approach

import {
  DimensionResult,
  IndicatorResult,
  TrendDirection,
  HealthLevel,
  HealthScoreResult,
  MaturityLevel,
  MaturityLevelName,
} from '../types/assessment';
import {
  MATURITY_LEVELS,
} from '../types/maturity';
import { HEALTH_LEVELS } from './healthScoreCalculation';

// ============================================
// CHS Constants (from methodology v1.1)
// ============================================

// Default weights for CHS components
const CHS_WEIGHTS = {
  css: 0.50,  // Current State Score - 50%
  trs: 0.35,  // Trajectory Score - 35%
  pgs: 0.15,  // Peer Growth Score - 15%
};

// Statistical defaults
const DEFAULTS = {
  averageCorrelation: 0.3,  // Average inter-indicator correlation
  defaultKappa: 10,         // Shrinkage intensity
  winsorizeLimit: 3,        // Z-score winsorization limit
  trsWinsorizeLimit: 4.5,   // TRS aggregate winsorization
};

// ============================================
// CSS (Current State Score) Calculation
// ============================================

/**
 * Calculate CSS from indicator values using z-score standardization.
 * Uses benchmark data as proxy for population norms.
 */
function calculateCSS(indicators: IndicatorResult[]): {
  scaled: number;
  raw: number;
  standardError: number;
  contributions: Array<{ id: string; name: string; zScore: number; weight: number }>;
} {
  if (indicators.length === 0) {
    return { scaled: 50, raw: 0, standardError: 0, contributions: [] };
  }

  const contributions: Array<{ id: string; name: string; zScore: number; weight: number }> = [];
  let cssRaw = 0;
  const weightSquaredSum: number[] = [];

  // Equal weights for indicators (can be customized)
  const weight = 1 / indicators.length;

  for (const indicator of indicators) {
    // Use benchmark value as population mean estimate
    // Estimate population SD from the range implied by percentile
    // If percentile is 30 and value is X, and benchmark (mean) is Y,
    // then z ≈ -0.52 (inverse normal of 0.30)

    // More direct approach: use the percentile to derive z-score
    // z = Φ^(-1)(percentile/100) where Φ^(-1) is inverse normal CDF
    const percentile = Math.max(1, Math.min(99, indicator.benchmarkPercentile));
    let zScore = percentileToZScore(percentile / 100);

    // Apply directionality - if lower is better, flip the z-score
    // (benchmarkPercentile is already adjusted for directionality in our system)
    // Higher percentile = better, so z-score sign is correct

    // Winsorize at ±3
    zScore = Math.max(-DEFAULTS.winsorizeLimit, Math.min(DEFAULTS.winsorizeLimit, zScore));

    cssRaw += weight * zScore;
    weightSquaredSum.push(weight * weight);

    contributions.push({
      id: indicator.id,
      name: indicator.name,
      zScore,
      weight,
    });
  }

  // Scale to 0-100 (50 = average)
  // Using scaling constant that achieves SD ≈ 15
  const m = indicators.length;
  const sumWSquared = weightSquaredSum.reduce((a, b) => a + b, 0);
  const varianceFactor = sumWSquared * (1 + DEFAULTS.averageCorrelation * (m - 1));
  const kCss = varianceFactor > 0 ? 15 / Math.sqrt(varianceFactor) : 15;

  const scaled = Math.max(5, Math.min(95, 50 + kCss * cssRaw));

  // Standard error calculation
  const n = 8; // Approximate number of observations
  const seRaw = Math.sqrt(sumWSquared * (2 / (n - 1))) * Math.sqrt(1 + DEFAULTS.averageCorrelation * (m - 1));
  const standardError = kCss * seRaw;

  return { scaled, raw: cssRaw, standardError, contributions };
}

/**
 * Convert percentile (0-1) to z-score using inverse normal CDF approximation.
 * Uses Abramowitz and Stegun approximation.
 */
function percentileToZScore(p: number): number {
  // Clamp to avoid infinity
  p = Math.max(0.001, Math.min(0.999, p));

  // For p > 0.5, use symmetry
  const sign = p < 0.5 ? -1 : 1;
  const pAdjusted = p < 0.5 ? p : 1 - p;

  // Approximation constants
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  const t = Math.sqrt(-2 * Math.log(pAdjusted));
  const z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);

  return sign * z;
}

// ============================================
// TRS (Trajectory Score) Calculation
// ============================================

/**
 * Calculate TRS from indicator trend data.
 * Uses effect size between early and recent periods.
 */
function calculateTRS(indicators: IndicatorResult[]): {
  scaled: number;
  raw: number;
  standardError: number;
  wasWinsorized: boolean;
} {
  if (indicators.length === 0) {
    return { scaled: 50, raw: 0, standardError: 0, wasWinsorized: false };
  }

  let trsRaw = 0;
  const weight = 1 / indicators.length;
  const weightSquaredSum: number[] = [];

  for (const indicator of indicators) {
    const trendData = indicator.trendData || [];

    if (trendData.length < 4) {
      // Not enough data for trajectory - assume stable (0 effect)
      weightSquaredSum.push(weight * weight);
      continue;
    }

    // Split into early and recent periods
    const midpoint = Math.floor(trendData.length / 2);
    const earlyPeriods = trendData.slice(0, midpoint);
    const recentPeriods = trendData.slice(midpoint);

    // Calculate means
    const earlyMean = earlyPeriods.reduce((s, d) => s + d.value, 0) / earlyPeriods.length;
    const recentMean = recentPeriods.reduce((s, d) => s + d.value, 0) / recentPeriods.length;

    // Calculate pooled standard deviation
    const allValues = trendData.map(d => d.value);
    const overallMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    const variance = allValues.reduce((s, v) => s + Math.pow(v - overallMean, 2), 0) / (allValues.length - 1);
    const pooledSD = Math.sqrt(variance) || 1;

    // Effect size (Cohen's d)
    let effectSize = (recentMean - earlyMean) / pooledSD;

    // Apply directionality - if lower is better, flip
    if (!indicator.higherIsBetter) {
      effectSize = -effectSize;
    }

    // Winsorize at ±3
    effectSize = Math.max(-DEFAULTS.winsorizeLimit, Math.min(DEFAULTS.winsorizeLimit, effectSize));

    trsRaw += weight * effectSize;
    weightSquaredSum.push(weight * weight);
  }

  // Winsorize aggregate at ±4.5
  const wasWinsorized = Math.abs(trsRaw) > DEFAULTS.trsWinsorizeLimit;
  trsRaw = Math.max(-DEFAULTS.trsWinsorizeLimit, Math.min(DEFAULTS.trsWinsorizeLimit, trsRaw));

  // Scale to 0-100 (50 = stable, same as CPS API scaling)
  const scaled = Math.max(5, Math.min(95, 50 + 10 * trsRaw));

  // Standard error calculation
  const m = indicators.length;
  const nPeriods = 8;
  const sumWSquared = weightSquaredSum.reduce((a, b) => a + b, 0);
  const seRaw = Math.sqrt(sumWSquared * (2 / (nPeriods - 1))) * Math.sqrt(1 + DEFAULTS.averageCorrelation * (m - 1));
  const standardError = 10 * seRaw;

  return { scaled, raw: trsRaw, standardError, wasWinsorized };
}

// ============================================
// PGS (Peer Growth Score) Calculation
// ============================================

/**
 * Calculate PGS - simplified version using trend comparison.
 * Full implementation would require peer team trajectory data.
 * This uses the dimension trends as a proxy.
 */
function calculatePGS(dimensions: DimensionResult[], trsRaw: number): {
  scaled: number;
  shrunk: number;
  standardError: number;
} {
  if (dimensions.length === 0) {
    return { scaled: 50, shrunk: 50, standardError: 10 };
  }

  // Count trend directions across dimensions
  const trendScores: Record<TrendDirection, number> = {
    improving: 75,
    stable: 50,
    declining: 25,
  };

  // Calculate average trend score
  const avgTrendScore = dimensions.reduce((sum, dim) =>
    sum + trendScores[dim.trend], 0) / dimensions.length;

  // Combine with TRS to get raw PGS
  // If TRS shows improvement (>0), boost the score
  const trsBoost = trsRaw > 0.3 ? 15 : trsRaw > 0 ? 8 : trsRaw < -0.3 ? -15 : trsRaw < 0 ? -8 : 0;
  const rawPGS = Math.max(0, Math.min(100, avgTrendScore + trsBoost));

  // Apply Empirical Bayes shrinkage toward 50
  // Simplified: use a fixed shrinkage factor since we don't have full peer data
  const groupSize = 47; // Mock comparison group size
  const kappa = DEFAULTS.defaultKappa;
  const alpha = (groupSize - 1) / (groupSize - 1 + kappa);
  const shrunk = alpha * rawPGS + (1 - alpha) * 50;

  // Standard error (order-statistic approximation)
  const seRaw = 50 / Math.sqrt(groupSize);
  const standardError = alpha * seRaw;

  return { scaled: rawPGS, shrunk, standardError };
}

// ============================================
// Main CHS Calculation
// ============================================

/**
 * Calculate Composite Health Score using CHS methodology.
 * Replaces the old 80% percentile + 20% trend approach.
 */
export function calculateCHSHealthScore(
  dimensions: DimensionResult[]
): HealthScoreResult & {
  cssScore: number;
  trsScore: number;
  pgsScore: number;
  cssContributions: Array<{ id: string; name: string; zScore: number; weight: number }>;
  chsStandardError: number;
  chsConfidenceInterval: { lower: number; upper: number };
} {
  // Handle empty assessment
  if (!dimensions || dimensions.length === 0) {
    const defaultLevel = HEALTH_LEVELS[2];
    return {
      compositeScore: 50,
      percentileComponent: 50,
      trendComponent: 50,
      level: defaultLevel.level,
      label: defaultLevel.label,
      description: defaultLevel.description,
      actionGuidance: defaultLevel.actionGuidance,
      color: defaultLevel.color,
      bgColor: defaultLevel.bgColor,
      maturityLevel: defaultLevel.maturityLevel,
      maturityName: defaultLevel.maturityName,
      cssScore: 50,
      trsScore: 50,
      pgsScore: 50,
      cssContributions: [],
      chsStandardError: 0,
      chsConfidenceInterval: { lower: 50, upper: 50 },
    };
  }

  // Collect all indicators across dimensions
  const allIndicators: IndicatorResult[] = [];
  for (const dim of dimensions) {
    for (const cat of dim.categories) {
      allIndicators.push(...cat.indicators);
    }
  }

  // Calculate CSS (Current State Score)
  const css = calculateCSS(allIndicators);

  // Calculate TRS (Trajectory Score)
  const trs = calculateTRS(allIndicators);

  // Calculate PGS (Peer Growth Score)
  const pgs = calculatePGS(dimensions, trs.raw);

  // Calculate composite CHS
  const chs = CHS_WEIGHTS.css * css.scaled +
              CHS_WEIGHTS.trs * trs.scaled +
              CHS_WEIGHTS.pgs * pgs.shrunk;

  // Round to integer for display
  const compositeScore = Math.round(Math.max(0, Math.min(100, chs)));

  // Calculate combined standard error
  const seRaw = Math.sqrt(
    Math.pow(CHS_WEIGHTS.css * css.standardError, 2) +
    Math.pow(CHS_WEIGHTS.trs * trs.standardError, 2) +
    Math.pow(CHS_WEIGHTS.pgs * pgs.standardError, 2)
  );
  const chsStandardError = 1.2 * seRaw; // Apply 20% inflation

  // 90% confidence interval
  const z = 1.645;
  const chsConfidenceInterval = {
    lower: Math.max(0, Math.round(chs - z * chsStandardError)),
    upper: Math.min(100, Math.round(chs + z * chsStandardError)),
  };

  // Get health level from composite score
  const healthLevel = HEALTH_LEVELS.find(
    l => compositeScore >= l.minScore && compositeScore < l.maxScore
  ) ?? HEALTH_LEVELS[4];

  // For backward compatibility, map CSS to percentileComponent and TRS to trendComponent
  // This allows existing UI to work while we transition
  const percentileComponent = Math.round(css.scaled);
  const trendComponent = Math.round(trs.scaled);

  return {
    compositeScore,
    percentileComponent,
    trendComponent,
    level: healthLevel.level,
    label: healthLevel.label,
    description: healthLevel.description,
    actionGuidance: healthLevel.actionGuidance,
    color: healthLevel.color,
    bgColor: healthLevel.bgColor,
    maturityLevel: healthLevel.maturityLevel,
    maturityName: healthLevel.maturityName,
    // Standard error and confidence interval (for HealthScoreResult interface)
    standardError: Math.round(chsStandardError * 10) / 10,
    confidenceInterval: chsConfidenceInterval,
    // CHS-specific fields
    cssScore: Math.round(css.scaled),
    trsScore: Math.round(trs.scaled),
    pgsScore: Math.round(pgs.shrunk),
    cssContributions: css.contributions,
    chsStandardError,
    chsConfidenceInterval,
  };
}

/**
 * Get the CHS component weights for display.
 */
export function getCHSWeights() {
  return { ...CHS_WEIGHTS };
}

/**
 * Explain how the CHS score was calculated.
 */
export function getCHSExplanation() {
  return {
    methodology: 'Composite Health Score (CHS)',
    components: [
      {
        name: 'CSS (Current State Score)',
        weight: `${CHS_WEIGHTS.css * 100}%`,
        description: 'Measures where your team is NOW relative to baseline population norms using z-score standardization.',
      },
      {
        name: 'TRS (Trajectory Score)',
        weight: `${CHS_WEIGHTS.trs * 100}%`,
        description: 'Measures how your team is TRENDING within the assessment period using effect size calculation.',
      },
      {
        name: 'PGS (Peer Growth Score)',
        weight: `${CHS_WEIGHTS.pgs * 100}%`,
        description: 'Compares your growth trajectory to teams that started at a similar level.',
      },
    ],
    categories: [
      { name: 'Excellent', range: '70-100', color: '#006644' },
      { name: 'Good', range: '55-69', color: '#00875A' },
      { name: 'Average', range: '45-54', color: '#6B778C' },
      { name: 'Below Average', range: '30-44', color: '#FF8B00' },
      { name: 'Needs Attention', range: '0-29', color: '#DE350B' },
    ],
    advantage: 'Unlike pure percentile scoring, CHS captures real improvement even when all teams improve together. A score of 50 represents the baseline average, with higher scores indicating better health.',
  };
}
