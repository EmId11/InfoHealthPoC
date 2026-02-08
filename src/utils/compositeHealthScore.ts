// Composite Health Score (CHS) Calculation Engine
// Based on the CHS Methodology v1.2 specification (2026-01-26)

import {
  CHSResult,
  CSSResult,
  TRSResult,
  PGSResult,
  CHSWeights,
  CHSWeightPreset,
  CHSCategory,
  BaselineNorms,
  BaselineGroup,
  MissingDataResult,
  PortfolioCHSSummary,
  getCHSCategory,
  getCHSWeightsForPreset,
  getGroupingMethod,
  getGroupCount,
} from '../types/progressScore';
import { CPS_INDICATORS } from './mockCPSData';

// ============================================
// Statistical Defaults
// ============================================

const DEFAULTS = {
  averageCorrelation: 0.3,       // ρ̄ between indicators
  defaultKappa: 10,              // Shrinkage intensity
  minGroupSize: 5,               // Minimum teams per baseline group
  coverageThreshold: 0.70,       // 70% indicator coverage required
  seInflation: 1.2,              // SE inflation factor for covariance
  winsorizePercentiles: { lower: 2, upper: 98 },
  trsWinsorizeLimit: 4.5,        // ±4.5 SD for trajectory
};

// ============================================
// CSS (Current State Score) Calculation
// ============================================

/**
 * Calculate CSS for a team using fixed baseline norms
 */
export function calculateCSS(
  teamIndicatorValues: Record<string, number>,
  baselineNorms: BaselineNorms[],
  weights: Record<string, number>,
  directionality: Record<string, 1 | -1>
): CSSResult {
  const indicatorZScores: CSSResult['indicatorZScores'] = [];
  let cssRaw = 0;
  let totalWeight = 0;
  const weightSquaredSum: number[] = [];

  // Calculate z-scores for each indicator
  for (const norm of baselineNorms) {
    const indicatorId = norm.indicatorId;
    const rawValue = teamIndicatorValues[indicatorId];

    if (rawValue === undefined || rawValue === null) continue;

    const weight = weights[indicatorId] || 0;
    const direction = directionality[indicatorId] || 1;

    // Direction adjustment
    const directionAdjusted = direction * rawValue;

    // Z-score against baseline norms
    const zScore = norm.stdDev > 0
      ? (directionAdjusted - (direction * norm.mean)) / norm.stdDev
      : 0;

    // Winsorize z-score at ±3
    const zScoreWinsorized = Math.max(-3, Math.min(3, zScore));

    const weightedContribution = weight * zScoreWinsorized;
    cssRaw += weightedContribution;
    totalWeight += weight;
    weightSquaredSum.push(weight * weight);

    const indicator = CPS_INDICATORS.find(i => i.id === indicatorId);
    indicatorZScores.push({
      indicatorId,
      indicatorName: indicator?.name || indicatorId,
      rawValue,
      directionAdjusted,
      zScore: zScoreWinsorized,
      weightedContribution,
    });
  }

  // Reweight if partial coverage
  if (totalWeight > 0 && totalWeight < 1) {
    cssRaw = cssRaw / totalWeight;
  }

  // Calculate scaling constant (to achieve SD ≈ 15)
  // CORRECTED variance formula (v1.2): Var = Σ(w_i²) × (1 - ρ̄) + ρ̄
  // This is the correct formula for variance of weighted sum of correlated standardized variables
  // when weights sum to 1.0
  const sumWSquared = weightSquaredSum.reduce((a, b) => a + b, 0);
  const varianceFactor = sumWSquared * (1 - DEFAULTS.averageCorrelation) + DEFAULTS.averageCorrelation;
  const kCss = varianceFactor > 0 ? 15 / Math.sqrt(varianceFactor) : 15;

  // Scale to 0-100
  const scaled = Math.max(5, Math.min(95, 50 + kCss * cssRaw));

  // Calculate standard error
  const n = 8; // Approximate number of observations (sprints/weeks)
  const m = weightSquaredSum.length; // Number of indicators
  const seRaw = Math.sqrt(sumWSquared * (2 / (n - 1))) * Math.sqrt(1 + DEFAULTS.averageCorrelation * (m - 1));
  const standardError = kCss * seRaw;

  return {
    raw: cssRaw,
    scaled,
    standardError,
    indicatorZScores,
  };
}

// ============================================
// TRS (Trajectory Score) Calculation
// ============================================

/**
 * Calculate TRS from historical indicator data
 * Uses early vs recent comparison within assessment period
 */
export function calculateTRS(
  earlyPeriodValues: Record<string, number>,
  recentPeriodValues: Record<string, number>,
  pooledStdDevs: Record<string, number>,
  weights: Record<string, number>,
  directionality: Record<string, 1 | -1>
): TRSResult {
  const indicatorTrajectories: TRSResult['indicatorTrajectories'] = [];
  let trsRaw = 0;
  let totalWeight = 0;
  const weightSquaredSum: number[] = [];

  for (const indicatorId of Object.keys(weights)) {
    const earlyValue = earlyPeriodValues[indicatorId];
    const recentValue = recentPeriodValues[indicatorId];
    const pooledStdDev = pooledStdDevs[indicatorId];

    if (earlyValue === undefined || recentValue === undefined) continue;
    if (!pooledStdDev || pooledStdDev === 0) continue;

    const weight = weights[indicatorId];
    const direction = directionality[indicatorId] || 1;

    // Apply direction and calculate effect size
    const earlyAdjusted = direction * earlyValue;
    const recentAdjusted = direction * recentValue;
    const effectSize = (recentAdjusted - earlyAdjusted) / pooledStdDev;

    // Winsorize at ±3
    const effectSizeWinsorized = Math.max(-3, Math.min(3, effectSize));

    const weightedContribution = weight * effectSizeWinsorized;
    trsRaw += weightedContribution;
    totalWeight += weight;
    weightSquaredSum.push(weight * weight);

    const indicator = CPS_INDICATORS.find(i => i.id === indicatorId);
    indicatorTrajectories.push({
      indicatorId,
      indicatorName: indicator?.name || indicatorId,
      earlyMean: earlyValue,
      recentMean: recentValue,
      effectSize: effectSizeWinsorized,
      weightedContribution,
    });
  }

  // Reweight if partial coverage
  if (totalWeight > 0 && totalWeight < 1) {
    trsRaw = trsRaw / totalWeight;
  }

  // Winsorize aggregate at ±4.5
  const wasWinsorized = Math.abs(trsRaw) > DEFAULTS.trsWinsorizeLimit;
  trsRaw = Math.max(-DEFAULTS.trsWinsorizeLimit, Math.min(DEFAULTS.trsWinsorizeLimit, trsRaw));

  // Scale to 0-100 (same as CPS API: 50 + 10 × raw)
  const scaled = Math.max(5, Math.min(95, 50 + 10 * trsRaw));

  // Calculate standard error
  const m = indicatorTrajectories.length;
  const nPeriods = 8;
  const sumWSquared = weightSquaredSum.reduce((a, b) => a + b, 0);
  const seRaw = Math.sqrt(sumWSquared * (2 / (nPeriods - 1))) * Math.sqrt(1 + DEFAULTS.averageCorrelation * (m - 1));
  const standardError = 10 * seRaw;

  return {
    raw: trsRaw,
    scaled,
    standardError,
    wasWinsorized,
    indicatorTrajectories,
  };
}

// ============================================
// PGS (Peer Growth Score) Calculation
// ============================================

/**
 * Create baseline groups for PGS calculation
 */
export function createBaselineGroups(
  teams: Array<{ teamId: string; baselineCSS: number }>,
  teamCount: number
): BaselineGroup[] {
  if (teamCount < 20) return [];

  const method = getGroupingMethod(teamCount);
  const numGroups = getGroupCount(method);
  if (numGroups === 0) return [];

  // Sort teams by baseline CSS
  const sorted = [...teams].sort((a, b) => a.baselineCSS - b.baselineCSS);
  const teamCountPerGroup = Math.ceil(sorted.length / numGroups);

  const groups: BaselineGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    const start = i * teamCountPerGroup;
    const end = Math.min(start + teamCountPerGroup, sorted.length);
    const groupTeams = sorted.slice(start, end);

    if (groupTeams.length === 0) continue;

    groups.push({
      groupIndex: i,
      minPercentile: (i / numGroups) * 100,
      maxPercentile: ((i + 1) / numGroups) * 100,
      teamIds: groupTeams.map(t => t.teamId),
      size: groupTeams.length,
      wasMerged: false,
    });
  }

  // Merge small groups
  return mergeSmallGroups(groups);
}

/**
 * Merge groups with fewer than minimum teams
 */
function mergeSmallGroups(groups: BaselineGroup[]): BaselineGroup[] {
  const merged = [...groups];
  let iterations = 0;
  const maxIterations = 20;

  while (merged.some(g => g.size < DEFAULTS.minGroupSize) && iterations < maxIterations) {
    iterations++;

    // Find smallest group
    const smallestIdx = merged.reduce((minIdx, g, idx) =>
      g.size < merged[minIdx].size ? idx : minIdx, 0);

    const smallest = merged[smallestIdx];
    if (smallest.size >= DEFAULTS.minGroupSize) break;

    // Determine merge direction (toward center)
    let mergeTargetIdx: number;
    if (smallestIdx === 0) {
      mergeTargetIdx = 1;
    } else if (smallestIdx === merged.length - 1) {
      mergeTargetIdx = merged.length - 2;
    } else {
      // Merge toward center
      const medianIdx = Math.floor(merged.length / 2);
      mergeTargetIdx = smallestIdx < medianIdx ? smallestIdx - 1 : smallestIdx + 1;
    }

    if (mergeTargetIdx < 0 || mergeTargetIdx >= merged.length) break;

    // Merge
    const target = merged[mergeTargetIdx];
    const newGroup: BaselineGroup = {
      groupIndex: Math.min(smallest.groupIndex, target.groupIndex),
      minPercentile: Math.min(smallest.minPercentile, target.minPercentile),
      maxPercentile: Math.max(smallest.maxPercentile, target.maxPercentile),
      teamIds: [...smallest.teamIds, ...target.teamIds],
      size: smallest.size + target.size,
      wasMerged: true,
      mergeLog: `Groups ${smallest.groupIndex} and ${target.groupIndex} merged`,
    };

    // Remove old, add new
    merged.splice(Math.max(smallestIdx, mergeTargetIdx), 1);
    merged.splice(Math.min(smallestIdx, mergeTargetIdx), 1, newGroup);

    // Reindex
    merged.forEach((g, idx) => { g.groupIndex = idx; });
  }

  return merged;
}

/**
 * Calculate PGS for a team
 */
export function calculatePGS(
  teamId: string,
  teamTRS: number,
  allTeamsTRS: Array<{ teamId: string; trs: number }>,
  baselineGroups: BaselineGroup[],
  teamBaselineGroup: BaselineGroup
): PGSResult | null {
  if (baselineGroups.length === 0) return null;

  // Get TRS values for teams in the same baseline group
  const groupTeamIds = new Set(teamBaselineGroup.teamIds);
  const groupTRSValues = allTeamsTRS
    .filter(t => groupTeamIds.has(t.teamId))
    .map(t => t.trs)
    .sort((a, b) => a - b);

  if (groupTRSValues.length === 0) return null;

  // Calculate rank with continuity correction
  const rank = groupTRSValues.filter(v => v < teamTRS).length + 0.5;
  const rawPGS = (rank / groupTRSValues.length) * 100;

  // Calculate kappa for shrinkage
  // Using method of moments approximation
  const groupMean = groupTRSValues.reduce((a, b) => a + b, 0) / groupTRSValues.length;
  const groupVariance = groupTRSValues.reduce((sum, v) =>
    sum + Math.pow(v - groupMean, 2), 0) / (groupTRSValues.length - 1 || 1);

  // Between-group variance (approximate)
  const allTRSValues = allTeamsTRS.map(t => t.trs);
  const overallMean = allTRSValues.reduce((a, b) => a + b, 0) / allTRSValues.length;
  const betweenGroupVar = baselineGroups.reduce((sum, g) => {
    const gTeams = allTeamsTRS.filter(t => g.teamIds.includes(t.teamId));
    if (gTeams.length === 0) return sum;
    const gMean = gTeams.reduce((a, t) => a + t.trs, 0) / gTeams.length;
    return sum + Math.pow(gMean - overallMean, 2);
  }, 0) / (baselineGroups.length || 1);

  const kappa = betweenGroupVar > 0
    ? (groupVariance / teamBaselineGroup.size) / betweenGroupVar
    : DEFAULTS.defaultKappa;

  // Apply Empirical Bayes shrinkage
  const alpha = (teamBaselineGroup.size - 1) / (teamBaselineGroup.size - 1 + kappa);
  const shrunkPGS = alpha * rawPGS + (1 - alpha) * 50;

  // Standard error (order-statistic approximation)
  const seRaw = 50 / Math.sqrt(teamBaselineGroup.size);
  const seShrunk = alpha * seRaw;

  return {
    raw: rawPGS,
    shrunk: shrunkPGS,
    standardError: seShrunk,
    baselineGroup: teamBaselineGroup,
    shrinkageAlpha: alpha,
    kappa,
    rankWithinGroup: Math.round(rank + 0.5),
  };
}

// ============================================
// CHS Aggregation
// ============================================

/**
 * Calculate composite CHS from components
 */
export function calculateCHS(
  css: CSSResult,
  trs: TRSResult,
  pgs: PGSResult | null,
  weights: CHSWeights
): {
  chs: number;
  standardError: number;
  confidenceInterval: { lower: number; upper: number };
} {
  // Calculate weighted composite
  let chs: number;
  let seRaw: number;

  if (pgs) {
    chs = weights.css * css.scaled + weights.trs * trs.scaled + weights.pgs * pgs.shrunk;
    seRaw = Math.sqrt(
      Math.pow(weights.css * css.standardError, 2) +
      Math.pow(weights.trs * trs.standardError, 2) +
      Math.pow(weights.pgs * pgs.standardError, 2)
    );
  } else {
    // 2-component model: redistribute PGS weight to CSS and TRS
    const adjustedCssWeight = weights.css + (weights.pgs * weights.css / (weights.css + weights.trs));
    const adjustedTrsWeight = weights.trs + (weights.pgs * weights.trs / (weights.css + weights.trs));
    chs = adjustedCssWeight * css.scaled + adjustedTrsWeight * trs.scaled;
    seRaw = Math.sqrt(
      Math.pow(adjustedCssWeight * css.standardError, 2) +
      Math.pow(adjustedTrsWeight * trs.standardError, 2)
    );
  }

  // Apply SE inflation for component covariance
  const standardError = DEFAULTS.seInflation * seRaw;

  // 90% confidence interval
  const z = 1.645;
  const confidenceInterval = {
    lower: Math.max(5, chs - z * standardError),
    upper: Math.min(95, chs + z * standardError),
  };

  return { chs, standardError, confidenceInterval };
}

// ============================================
// Complete CHS Calculation
// ============================================

/**
 * Calculate CHS for a single team
 */
export function calculateTeamCHS(
  teamId: string,
  teamName: string,
  currentIndicatorValues: Record<string, number>,
  earlyPeriodValues: Record<string, number>,
  recentPeriodValues: Record<string, number>,
  pooledStdDevs: Record<string, number>,
  baselineNorms: BaselineNorms[],
  weights: CHSWeights,
  weightPreset: CHSWeightPreset,
  baselineGroups: BaselineGroup[],
  allTeamsTRS: Array<{ teamId: string; trs: number }>,
  assessmentPeriodMonths: number = 6
): CHSResult {
  // Build weight and directionality maps
  const indicatorWeights: Record<string, number> = {};
  const indicatorDirectionality: Record<string, 1 | -1> = {};
  for (const indicator of CPS_INDICATORS) {
    indicatorWeights[indicator.id] = indicator.weight;
    indicatorDirectionality[indicator.id] = indicator.directionality;
  }

  // Calculate CSS
  const css = calculateCSS(
    currentIndicatorValues,
    baselineNorms,
    indicatorWeights,
    indicatorDirectionality
  );

  // Calculate TRS
  const trs = calculateTRS(
    earlyPeriodValues,
    recentPeriodValues,
    pooledStdDevs,
    indicatorWeights,
    indicatorDirectionality
  );

  // Find team's baseline group
  const teamBaselineGroup = baselineGroups.find(g => g.teamIds.includes(teamId));

  // Calculate PGS
  const pgs = teamBaselineGroup
    ? calculatePGS(teamId, trs.raw, allTeamsTRS, baselineGroups, teamBaselineGroup)
    : null;

  // Calculate composite CHS
  const { chs, standardError, confidenceInterval } = calculateCHS(css, trs, pgs, weights);

  // Determine category
  const category = getCHSCategory(chs);

  // Calculate indicator coverage
  const availableIndicators = Object.keys(currentIndicatorValues).filter(
    id => currentIndicatorValues[id] !== undefined && currentIndicatorValues[id] !== null
  );
  const totalWeight = CPS_INDICATORS.reduce((sum, i) => sum + i.weight, 0);
  const availableWeight = CPS_INDICATORS
    .filter(i => availableIndicators.includes(i.id))
    .reduce((sum, i) => sum + i.weight, 0);
  const indicatorCoverage = availableWeight / totalWeight;

  return {
    teamId,
    teamName,
    css,
    trs,
    pgs,
    chs,
    standardError,
    confidenceInterval,
    category,
    weights,
    weightPreset,
    indicatorCoverage,
    wasReweighted: indicatorCoverage < 1 && indicatorCoverage >= 0.7,
    isProvisional: assessmentPeriodMonths < 2,
    assessmentPeriodMonths,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// Portfolio-Level CHS Calculation
// ============================================

/**
 * Calculate CHS for all teams in a portfolio
 */
export function calculatePortfolioCHS(
  teams: Array<{
    teamId: string;
    teamName: string;
    currentIndicatorValues: Record<string, number>;
    earlyPeriodValues: Record<string, number>;
    recentPeriodValues: Record<string, number>;
    pooledStdDevs: Record<string, number>;
    baselineCSS: number;
  }>,
  baselineNorms: BaselineNorms[],
  weightPreset: CHSWeightPreset = 'balanced'
): PortfolioCHSSummary {
  const weights = getCHSWeightsForPreset(weightPreset);

  // Check coverage and exclude teams with insufficient data
  const includedTeams: typeof teams = [];
  const excludedTeams: MissingDataResult[] = [];

  for (const team of teams) {
    const availableIndicators = Object.keys(team.currentIndicatorValues).filter(
      id => team.currentIndicatorValues[id] !== undefined
    );
    const totalWeight = CPS_INDICATORS.reduce((sum, i) => sum + i.weight, 0);
    const availableWeight = CPS_INDICATORS
      .filter(i => availableIndicators.includes(i.id))
      .reduce((sum, i) => sum + i.weight, 0);
    const coverage = availableWeight / totalWeight;

    if (coverage >= DEFAULTS.coverageThreshold) {
      includedTeams.push(team);
    } else {
      excludedTeams.push({
        teamId: team.teamId,
        teamName: team.teamName,
        totalWeight,
        missingWeight: totalWeight - availableWeight,
        coveragePercent: coverage * 100,
        missingIndicators: CPS_INDICATORS
          .filter(i => !availableIndicators.includes(i.id))
          .map(i => i.id),
        availableIndicators,
        meetsThreshold: false,
        action: 'exclude',
      });
    }
  }

  // Create baseline groups for PGS
  const baselineGroups = createBaselineGroups(
    includedTeams.map(t => ({ teamId: t.teamId, baselineCSS: t.baselineCSS })),
    includedTeams.length
  );

  // First pass: calculate TRS for all teams (needed for PGS)
  const indicatorWeights: Record<string, number> = {};
  const indicatorDirectionality: Record<string, 1 | -1> = {};
  for (const indicator of CPS_INDICATORS) {
    indicatorWeights[indicator.id] = indicator.weight;
    indicatorDirectionality[indicator.id] = indicator.directionality;
  }

  const allTeamsTRS = includedTeams.map(team => {
    const trs = calculateTRS(
      team.earlyPeriodValues,
      team.recentPeriodValues,
      team.pooledStdDevs,
      indicatorWeights,
      indicatorDirectionality
    );
    return { teamId: team.teamId, trs: trs.raw };
  });

  // Second pass: calculate full CHS for all teams
  const results: CHSResult[] = includedTeams.map(team =>
    calculateTeamCHS(
      team.teamId,
      team.teamName,
      team.currentIndicatorValues,
      team.earlyPeriodValues,
      team.recentPeriodValues,
      team.pooledStdDevs,
      baselineNorms,
      weights,
      weightPreset,
      baselineGroups,
      allTeamsTRS
    )
  );

  // Calculate aggregate statistics
  const chsValues = results.map(r => r.chs).sort((a, b) => a - b);
  const averageCHS = chsValues.reduce((a, b) => a + b, 0) / chsValues.length;
  const medianCHS = chsValues[Math.floor(chsValues.length / 2)];
  const variance = chsValues.reduce((sum, v) => sum + Math.pow(v - averageCHS, 2), 0) / chsValues.length;
  const stdDevCHS = Math.sqrt(variance);

  // Category distribution
  const categories: CHSCategory[] = ['excellent-health', 'good-health', 'average-health', 'below-average', 'needs-attention'];
  const categoryDistribution = categories.map(category => {
    const matchingTeams = results.filter(r => r.category === category);
    return {
      category,
      count: matchingTeams.length,
      percentage: (matchingTeams.length / results.length) * 100,
      teamIds: matchingTeams.map(r => r.teamId),
    };
  });

  return {
    teams: results,
    excludedTeams,
    averageCHS,
    medianCHS,
    stdDevCHS,
    categoryDistribution,
    baselineGroups,
    groupingMethod: getGroupingMethod(includedTeams.length),
    weights,
    weightPreset,
    baselineNorms,
    totalTeams: teams.length,
    includedTeams: includedTeams.length,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Generate baseline norms from a population of teams
 */
export function generateBaselineNorms(
  allTeamsIndicatorValues: Array<Record<string, number>>
): BaselineNorms[] {
  const norms: BaselineNorms[] = [];

  for (const indicator of CPS_INDICATORS) {
    const values = allTeamsIndicatorValues
      .map(t => t[indicator.id])
      .filter(v => v !== undefined && v !== null);

    if (values.length === 0) continue;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    norms.push({
      indicatorId: indicator.id,
      mean,
      stdDev: stdDev > 0 ? stdDev : 1, // Prevent division by zero
      calibratedAt: new Date().toISOString(),
    });
  }

  return norms;
}

/**
 * Calculate pooled standard deviation across time periods
 */
export function calculatePooledStdDev(
  timePeriodValues: number[]
): number {
  if (timePeriodValues.length < 2) return 1;

  const mean = timePeriodValues.reduce((a, b) => a + b, 0) / timePeriodValues.length;
  const variance = timePeriodValues.reduce((sum, v) =>
    sum + Math.pow(v - mean, 2), 0) / (timePeriodValues.length - 1);

  return Math.sqrt(variance) || 1;
}

// ============================================
// Dimension-Level CHS Calculation
// ============================================

/**
 * Result of dimension-level CHS calculation
 */
export interface DimensionCHSResult {
  /** Final composite health score (0-100) */
  healthScore: number;
  /** Current State Score component (0-100) */
  cssScore: number;
  /** Trajectory Score component (0-100), null if insufficient history */
  trsScore: number | null;
  /** Peer Growth Score component (0-100), null if insufficient peer data */
  pgsScore: number | null;
  /** Standard error of the composite score */
  standardError: number;
  /** 90% confidence interval */
  confidenceInterval: { lower: number; upper: number };
  /** Which components were available for calculation */
  componentsAvailable: {
    css: boolean;
    trs: boolean;
    pgs: boolean;
  };
  /** Weights actually used (may differ if components missing) */
  weightsUsed: {
    css: number;
    trs: number;
    pgs: number;
  };
}

/**
 * Calculate CHS for a dimension
 *
 * @param cssScore - Current State Score (0-100), from z-score aggregation of indicators
 * @param historicalCSSValues - Array of past CSS values for TRS calculation (oldest first)
 * @param peerTRSValues - Array of TRS values from peer dimensions for PGS calculation
 * @param teamTRS - This team's TRS value (for PGS ranking)
 */
export function calculateDimensionCHS(
  cssScore: number,
  historicalCSSValues?: number[],
  peerTRSValues?: number[],
  teamTRS?: number
): DimensionCHSResult {
  const baseWeights = { css: 0.50, trs: 0.35, pgs: 0.15 };

  // Calculate TRS if we have historical data (need at least 2 periods)
  let trsScore: number | null = null;
  let trsStandardError = 0;

  if (historicalCSSValues && historicalCSSValues.length >= 2) {
    // Split into early and recent periods
    const midpoint = Math.floor(historicalCSSValues.length / 2);
    const earlyValues = historicalCSSValues.slice(0, midpoint);
    const recentValues = historicalCSSValues.slice(midpoint);

    const earlyMean = earlyValues.reduce((a, b) => a + b, 0) / earlyValues.length;
    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

    // Effect size (change in CSS units, already on 0-100 scale)
    const effectSize = recentMean - earlyMean;

    // Scale to 0-100 where 50 = no change
    // ±15 points of CSS change maps to 0-100 TRS range
    trsScore = Math.max(5, Math.min(95, 50 + (effectSize / 15) * 50));

    // Standard error based on variance in historical values
    const allVariance = historicalCSSValues.reduce((sum, v) =>
      sum + Math.pow(v - cssScore, 2), 0) / historicalCSSValues.length;
    trsStandardError = Math.sqrt(allVariance) / Math.sqrt(historicalCSSValues.length);
  }

  // Calculate PGS if we have peer data
  let pgsScore: number | null = null;
  let pgsStandardError = 0;

  if (peerTRSValues && peerTRSValues.length >= 5 && teamTRS !== undefined) {
    // Rank this team's TRS among peers
    const sortedPeers = [...peerTRSValues].sort((a, b) => a - b);
    const rank = sortedPeers.filter(v => v < teamTRS).length + 0.5;
    pgsScore = (rank / sortedPeers.length) * 100;

    // Apply shrinkage toward 50 for small groups
    const shrinkageAlpha = Math.min(1, (peerTRSValues.length - 1) / (peerTRSValues.length + 9));
    pgsScore = shrinkageAlpha * pgsScore + (1 - shrinkageAlpha) * 50;

    pgsStandardError = 50 / Math.sqrt(peerTRSValues.length) * shrinkageAlpha;
  }

  // Determine which components are available
  const componentsAvailable = {
    css: true,
    trs: trsScore !== null,
    pgs: pgsScore !== null,
  };

  // Calculate actual weights based on availability
  let weightsUsed = { ...baseWeights };
  let healthScore: number;
  let standardError: number;

  if (componentsAvailable.trs && componentsAvailable.pgs) {
    // Full 3-component model
    healthScore =
      weightsUsed.css * cssScore +
      weightsUsed.trs * trsScore! +
      weightsUsed.pgs * pgsScore!;

    standardError = Math.sqrt(
      Math.pow(weightsUsed.css * 4, 2) + // Assume CSS SE ≈ 4
      Math.pow(weightsUsed.trs * trsStandardError, 2) +
      Math.pow(weightsUsed.pgs * pgsStandardError, 2)
    ) * DEFAULTS.seInflation;

  } else if (componentsAvailable.trs) {
    // 2-component model: CSS + TRS, redistribute PGS weight
    weightsUsed = {
      css: baseWeights.css + (baseWeights.pgs * baseWeights.css / (baseWeights.css + baseWeights.trs)),
      trs: baseWeights.trs + (baseWeights.pgs * baseWeights.trs / (baseWeights.css + baseWeights.trs)),
      pgs: 0,
    };
    healthScore = weightsUsed.css * cssScore + weightsUsed.trs * trsScore!;

    standardError = Math.sqrt(
      Math.pow(weightsUsed.css * 4, 2) +
      Math.pow(weightsUsed.trs * trsStandardError, 2)
    ) * DEFAULTS.seInflation;

  } else {
    // CSS-only model
    weightsUsed = { css: 1.0, trs: 0, pgs: 0 };
    healthScore = cssScore;
    standardError = 4 * DEFAULTS.seInflation; // Base CSS standard error
  }

  // Clamp to valid range
  healthScore = Math.max(5, Math.min(95, healthScore));

  // 90% confidence interval
  const z = 1.645;
  const confidenceInterval = {
    lower: Math.max(5, healthScore - z * standardError),
    upper: Math.min(95, healthScore + z * standardError),
  };

  return {
    healthScore: Math.round(healthScore * 10) / 10,
    cssScore: Math.round(cssScore * 10) / 10,
    trsScore: trsScore !== null ? Math.round(trsScore * 10) / 10 : null,
    pgsScore: pgsScore !== null ? Math.round(pgsScore * 10) / 10 : null,
    standardError: Math.round(standardError * 10) / 10,
    confidenceInterval: {
      lower: Math.round(confidenceInterval.lower * 10) / 10,
      upper: Math.round(confidenceInterval.upper * 10) / 10,
    },
    componentsAvailable,
    weightsUsed,
  };
}

// ============================================
// Outcome-Level CHS Calculation
// ============================================

/**
 * Result of outcome-level CHS calculation
 */
export interface OutcomeCHSResult {
  /** Final composite health score (0-100) */
  healthScore: number;
  /** Current State Score component (0-100), weighted average of dimension CSS */
  cssScore: number;
  /** Trajectory Score component (0-100), null if insufficient history */
  trsScore: number | null;
  /** Peer Growth Score component (0-100), null if insufficient peer data */
  pgsScore: number | null;
  /** Standard error of the composite score */
  standardError: number;
  /** 90% confidence interval */
  confidenceInterval: { lower: number; upper: number };
  /** Which components were available for calculation */
  componentsAvailable: {
    css: boolean;
    trs: boolean;
    pgs: boolean;
  };
  /** Weights actually used (may differ if components missing) */
  weightsUsed: {
    css: number;
    trs: number;
    pgs: number;
  };
  /** Breakdown of contributing dimensions */
  dimensionContributions: Array<{
    dimensionKey: string;
    weight: number;
    cssScore: number;
    weightedContribution: number;
  }>;
}

/**
 * Input for a contributing dimension
 */
export interface OutcomeDimensionInput {
  dimensionKey: string;
  weight: number; // 0-1, should sum to 1 across all dimensions
  cssScore: number; // Current state score (0-100)
}

/**
 * Calculate CHS for an outcome
 *
 * @param dimensions - Array of contributing dimensions with their weights and CSS scores
 * @param historicalCSSValues - Array of past outcome CSS values for TRS calculation (oldest first)
 * @param peerTRSValues - Array of TRS values from peer outcomes for PGS calculation
 * @param teamTRS - This team's TRS value (for PGS ranking)
 */
export function calculateOutcomeCHS(
  dimensions: OutcomeDimensionInput[],
  historicalCSSValues?: number[],
  peerTRSValues?: number[],
  teamTRS?: number
): OutcomeCHSResult {
  const baseWeights = { css: 0.50, trs: 0.35, pgs: 0.15 };

  // Calculate outcome CSS as weighted average of dimension CSS scores
  let totalWeight = 0;
  let cssScore = 0;
  const dimensionContributions: OutcomeCHSResult['dimensionContributions'] = [];

  for (const dim of dimensions) {
    const weightedContribution = dim.weight * dim.cssScore;
    cssScore += weightedContribution;
    totalWeight += dim.weight;

    dimensionContributions.push({
      dimensionKey: dim.dimensionKey,
      weight: dim.weight,
      cssScore: dim.cssScore,
      weightedContribution,
    });
  }

  // Normalize if weights don't sum to 1
  if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.01) {
    cssScore = cssScore / totalWeight;
    dimensionContributions.forEach(d => {
      d.weightedContribution = d.weightedContribution / totalWeight;
    });
  }

  // Calculate TRS if we have historical data (need at least 2 periods)
  let trsScore: number | null = null;
  let trsStandardError = 0;

  if (historicalCSSValues && historicalCSSValues.length >= 2) {
    const midpoint = Math.floor(historicalCSSValues.length / 2);
    const earlyValues = historicalCSSValues.slice(0, midpoint);
    const recentValues = historicalCSSValues.slice(midpoint);

    const earlyMean = earlyValues.reduce((a, b) => a + b, 0) / earlyValues.length;
    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

    const effectSize = recentMean - earlyMean;
    trsScore = Math.max(5, Math.min(95, 50 + (effectSize / 15) * 50));

    const allVariance = historicalCSSValues.reduce((sum, v) =>
      sum + Math.pow(v - cssScore, 2), 0) / historicalCSSValues.length;
    trsStandardError = Math.sqrt(allVariance) / Math.sqrt(historicalCSSValues.length);
  }

  // Calculate PGS if we have peer data
  let pgsScore: number | null = null;
  let pgsStandardError = 0;

  if (peerTRSValues && peerTRSValues.length >= 5 && teamTRS !== undefined) {
    const sortedPeers = [...peerTRSValues].sort((a, b) => a - b);
    const rank = sortedPeers.filter(v => v < teamTRS).length + 0.5;
    pgsScore = (rank / sortedPeers.length) * 100;

    const shrinkageAlpha = Math.min(1, (peerTRSValues.length - 1) / (peerTRSValues.length + 9));
    pgsScore = shrinkageAlpha * pgsScore + (1 - shrinkageAlpha) * 50;
    pgsStandardError = 50 / Math.sqrt(peerTRSValues.length) * shrinkageAlpha;
  }

  const componentsAvailable = {
    css: true,
    trs: trsScore !== null,
    pgs: pgsScore !== null,
  };

  let weightsUsed = { ...baseWeights };
  let healthScore: number;
  let standardError: number;

  // Calculate composite based on available components
  const dimensionCount = dimensions.length;
  const baseCssSE = 4 / Math.sqrt(dimensionCount); // SE decreases with more dimensions

  if (componentsAvailable.trs && componentsAvailable.pgs) {
    healthScore =
      weightsUsed.css * cssScore +
      weightsUsed.trs * trsScore! +
      weightsUsed.pgs * pgsScore!;

    standardError = Math.sqrt(
      Math.pow(weightsUsed.css * baseCssSE, 2) +
      Math.pow(weightsUsed.trs * trsStandardError, 2) +
      Math.pow(weightsUsed.pgs * pgsStandardError, 2)
    ) * DEFAULTS.seInflation;

  } else if (componentsAvailable.trs) {
    weightsUsed = {
      css: baseWeights.css + (baseWeights.pgs * baseWeights.css / (baseWeights.css + baseWeights.trs)),
      trs: baseWeights.trs + (baseWeights.pgs * baseWeights.trs / (baseWeights.css + baseWeights.trs)),
      pgs: 0,
    };
    healthScore = weightsUsed.css * cssScore + weightsUsed.trs * trsScore!;

    standardError = Math.sqrt(
      Math.pow(weightsUsed.css * baseCssSE, 2) +
      Math.pow(weightsUsed.trs * trsStandardError, 2)
    ) * DEFAULTS.seInflation;

  } else {
    weightsUsed = { css: 1.0, trs: 0, pgs: 0 };
    healthScore = cssScore;
    standardError = baseCssSE * DEFAULTS.seInflation;
  }

  healthScore = Math.max(5, Math.min(95, healthScore));

  const z = 1.645;
  const confidenceInterval = {
    lower: Math.max(5, healthScore - z * standardError),
    upper: Math.min(95, healthScore + z * standardError),
  };

  return {
    healthScore: Math.round(healthScore * 10) / 10,
    cssScore: Math.round(cssScore * 10) / 10,
    trsScore: trsScore !== null ? Math.round(trsScore * 10) / 10 : null,
    pgsScore: pgsScore !== null ? Math.round(pgsScore * 10) / 10 : null,
    standardError: Math.round(standardError * 10) / 10,
    confidenceInterval: {
      lower: Math.round(confidenceInterval.lower * 10) / 10,
      upper: Math.round(confidenceInterval.upper * 10) / 10,
    },
    componentsAvailable,
    weightsUsed,
    dimensionContributions,
  };
}
