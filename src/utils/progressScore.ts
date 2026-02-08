// Composite Progress Score (CPS) Engine
// Core calculation functions for API, CGP, TNV, and CPS aggregation

import {
  CPSIndicator,
  TeamIndicatorSnapshot,
  TeamProgressData,
  APIResult,
  IndicatorContribution,
  CGPResult,
  BaselineGroup,
  TNVResult,
  CPSResult,
  MissingDataResult,
  CPSCategory,
  CPSModelType,
  SensitivityConfiguration,
  WeightConfiguration,
  getCPSCategory,
} from '../types/progressScore';
import {
  STATISTICAL_DEFAULTS,
  DEFAULT_WEIGHTS,
  getSensitivityConfigurations,
  getGroupingConfig,
} from '../constants/progressScoreConfig';
import { CPS_INDICATORS } from './mockCPSData';

// ============================================
// Statistical Utilities
// ============================================

/**
 * Calculate percentile rank within a sorted array
 */
function percentileRank(sortedValues: number[], value: number): number {
  if (sortedValues.length === 0) return 50;

  let count = 0;
  for (const v of sortedValues) {
    if (v < value) count++;
    else if (v === value) count += 0.5;
  }

  return (count / sortedValues.length) * 100;
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation of an array
 */
function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate variance of an array
 */
function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
}

/**
 * Calculate median of an array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate interquartile range
 */
function iqr(values: number[]): number {
  if (values.length < 4) return stdDev(values) * 1.35; // Approximate IQR from std dev
  const sorted = [...values].sort((a, b) => a - b);
  const q1Idx = Math.floor(sorted.length * 0.25);
  const q3Idx = Math.floor(sorted.length * 0.75);
  return sorted[q3Idx] - sorted[q1Idx];
}

/**
 * Get percentile value from sorted array
 */
function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedValues[lower];
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (idx - lower);
}

// ============================================
// Winsorization
// ============================================

/**
 * Winsorize indicator values at specified percentiles
 * Caps extreme values to reduce outlier influence
 */
export function winsorizeIndicatorValues(
  allTeamValues: number[],
  lowerPct: number = STATISTICAL_DEFAULTS.winsorizePercentiles.lower,
  upperPct: number = STATISTICAL_DEFAULTS.winsorizePercentiles.upper
): { lower: number; upper: number } {
  if (allTeamValues.length < 5) {
    return { lower: Math.min(...allTeamValues), upper: Math.max(...allTeamValues) };
  }

  const sorted = [...allTeamValues].sort((a, b) => a - b);
  const lower = getPercentile(sorted, lowerPct);
  const upper = getPercentile(sorted, upperPct);

  return { lower, upper };
}

/**
 * Apply winsorization bounds to a single value
 */
function applyWinsorization(value: number, bounds: { lower: number; upper: number }): {
  value: number;
  wasWinsorized: boolean;
} {
  if (value < bounds.lower) return { value: bounds.lower, wasWinsorized: true };
  if (value > bounds.upper) return { value: bounds.upper, wasWinsorized: true };
  return { value, wasWinsorized: false };
}

// ============================================
// Missing Data Handling
// ============================================

/**
 * Check indicator coverage for a team
 */
export function checkIndicatorCoverage(
  snapshot: TeamIndicatorSnapshot,
  indicators: CPSIndicator[] = CPS_INDICATORS
): MissingDataResult {
  const availableIndicators: string[] = [];
  const missingIndicators: string[] = [];
  let availableWeight = 0;
  let missingWeight = 0;

  for (const indicator of indicators) {
    if (indicator.id in snapshot.indicatorValues && snapshot.indicatorValues[indicator.id] !== undefined) {
      availableIndicators.push(indicator.id);
      availableWeight += indicator.weight;
    } else {
      missingIndicators.push(indicator.id);
      missingWeight += indicator.weight;
    }
  }

  const coveragePercent = availableWeight * 100;
  const meetsThreshold = coveragePercent >= STATISTICAL_DEFAULTS.coverageThreshold * 100;

  let action: 'include' | 'exclude' | 'reweight';
  if (!meetsThreshold) {
    action = 'exclude';
  } else if (missingIndicators.length > 0) {
    action = 'reweight';
  } else {
    action = 'include';
  }

  return {
    teamId: snapshot.teamId,
    teamName: snapshot.teamName,
    totalWeight: 1.0,
    missingWeight,
    coveragePercent,
    missingIndicators,
    availableIndicators,
    meetsThreshold,
    action,
  };
}

/**
 * Reweight available indicators proportionally
 */
export function reweightIndicators(
  availableIndicatorIds: string[],
  allIndicators: CPSIndicator[] = CPS_INDICATORS
): CPSIndicator[] {
  const available = allIndicators.filter(i => availableIndicatorIds.includes(i.id));
  const totalWeight = available.reduce((sum, i) => sum + i.weight, 0);

  if (totalWeight === 0) return available;

  // Proportional reweighting so weights sum to 1
  return available.map(indicator => ({
    ...indicator,
    weight: indicator.weight / totalWeight,
  }));
}

// ============================================
// API (Absolute Progress Index) Calculation
// ============================================

/**
 * Calculate baseline standard deviations for all indicators across teams
 */
export function calculateBaselineStdDevs(
  allBaselines: TeamIndicatorSnapshot[],
  indicators: CPSIndicator[] = CPS_INDICATORS
): Map<string, number> {
  const stdDevMap = new Map<string, number>();

  for (const indicator of indicators) {
    const values: number[] = [];
    for (const baseline of allBaselines) {
      const value = baseline.indicatorValues[indicator.id];
      if (value !== undefined) {
        // Apply direction adjustment before calculating std dev
        values.push(indicator.directionality * value);
      }
    }

    const sd = stdDev(values);
    stdDevMap.set(indicator.id, sd > 0 ? sd : 1); // Avoid division by zero
  }

  return stdDevMap;
}

/**
 * Calculate API for a single team
 */
export function calculateAPI(
  baseline: TeamIndicatorSnapshot,
  followUp: TeamIndicatorSnapshot,
  indicators: CPSIndicator[],
  baselineStdDevs: Map<string, number>,
  allTeamValues: Map<string, number[]> // For winsorization bounds
): APIResult {
  const contributions: IndicatorContribution[] = [];
  let weightedSum = 0;
  let wasApiWinsorized = false;

  for (const indicator of indicators) {
    const baselineValue = baseline.indicatorValues[indicator.id];
    const followUpValue = followUp.indicatorValues[indicator.id];

    if (baselineValue === undefined || followUpValue === undefined) {
      continue;
    }

    // Step 1: Direction adjustment X̃ = d × X
    const directionAdjustedBaseline = indicator.directionality * baselineValue;
    const directionAdjustedFollowUp = indicator.directionality * followUpValue;

    // Step 2: Indicator-level winsorization
    const allValues = allTeamValues.get(indicator.id) || [];
    const bounds = winsorizeIndicatorValues(allValues);

    const { value: winsorizedBaseline, wasWinsorized: baseWinsorized } =
      applyWinsorization(directionAdjustedBaseline, bounds);
    const { value: winsorizedFollowUp, wasWinsorized: followWinsorized } =
      applyWinsorization(directionAdjustedFollowUp, bounds);

    // Step 3: Calculate effect size (Cohen's d)
    const sigma = baselineStdDevs.get(indicator.id) || 1;
    const effectSize = (winsorizedFollowUp - winsorizedBaseline) / sigma;

    // Step 4: Weighted contribution
    const weightedContribution = indicator.weight * effectSize;
    weightedSum += weightedContribution;

    contributions.push({
      indicatorId: indicator.id,
      indicatorName: indicator.name,
      baselineValue,
      followUpValue,
      directionAdjustedBaseline,
      directionAdjustedFollowUp,
      effectSize,
      weightedContribution,
      wasWinsorized: baseWinsorized || followWinsorized,
    });
  }

  // Step 5: API-level winsorization at ±4.5
  let rawAPI = weightedSum;
  if (Math.abs(rawAPI) > STATISTICAL_DEFAULTS.apiWinsorizeLimit) {
    rawAPI = Math.sign(rawAPI) * STATISTICAL_DEFAULTS.apiWinsorizeLimit;
    wasApiWinsorized = true;
  }

  // Step 6: Scale to 50 + 10 × API, bounded [5, 95]
  let scaledAPI = 50 + 10 * rawAPI;
  scaledAPI = Math.max(5, Math.min(95, scaledAPI));

  // Step 7: Calculate standard error with correlation adjustment
  // SE = √(Σw_i² × 2/(n-1)) × √(1 + ρ̄(m-1))
  const m = contributions.length;
  const rhoBar = STATISTICAL_DEFAULTS.averageCorrelation;
  const correlationFactor = Math.sqrt(1 + rhoBar * (m - 1));

  const sumSquaredWeights = indicators.reduce((sum, i) => sum + i.weight * i.weight, 0);
  const baselineSampleSize = 47; // Approximate portfolio size
  const baseSE = Math.sqrt(sumSquaredWeights * (2 / (baselineSampleSize - 1)));
  const standardError = baseSE * correlationFactor * 10; // Scale to match API scaling

  return {
    raw: rawAPI,
    scaled: Math.round(scaledAPI * 10) / 10,
    standardError: Math.round(standardError * 100) / 100,
    wasWinsorized: wasApiWinsorized,
    indicatorContributions: contributions,
  };
}

// ============================================
// CGP (Conditional Growth Percentile) Calculation
// ============================================

/**
 * Create baseline groups based on team count
 */
export function createBaselineGroups(
  teams: Array<{ teamId: string; baselineScore: number }>,
  teamCount: number
): BaselineGroup[] {
  const config = getGroupingConfig(teamCount);

  if (config.method === 'none') {
    return [];
  }

  // Sort teams by baseline score
  const sortedTeams = [...teams].sort((a, b) => a.baselineScore - b.baselineScore);
  const groupCount = config.groupCount;
  const teamsPerGroup = Math.floor(teamCount / groupCount);
  const remainder = teamCount % groupCount;

  const groups: BaselineGroup[] = [];
  let currentIndex = 0;

  for (let g = 0; g < groupCount; g++) {
    // Distribute remainder teams to first groups
    const groupSize = teamsPerGroup + (g < remainder ? 1 : 0);
    const groupTeams = sortedTeams.slice(currentIndex, currentIndex + groupSize);

    const minPercentile = (g / groupCount) * 100;
    const maxPercentile = ((g + 1) / groupCount) * 100;

    groups.push({
      groupIndex: g,
      minPercentile,
      maxPercentile,
      teamIds: groupTeams.map(t => t.teamId),
      size: groupSize,
      wasMerged: false,
    });

    currentIndex += groupSize;
  }

  return groups;
}

/**
 * Merge small groups toward distribution center
 */
export function mergeSmallGroups(
  groups: BaselineGroup[],
  minSize: number = STATISTICAL_DEFAULTS.minGroupSize
): { groups: BaselineGroup[]; mergeLog: string[] } {
  const mergeLog: string[] = [];
  let result = [...groups];

  // Find center of distribution
  const centerIndex = Math.floor(result.length / 2);

  // Keep merging until all groups meet minimum size
  let merged = true;
  while (merged) {
    merged = false;

    for (let i = 0; i < result.length; i++) {
      if (result[i].size < minSize) {
        // Determine merge direction (toward center)
        let mergeTarget: number;
        if (i < centerIndex && i + 1 < result.length) {
          mergeTarget = i + 1;
        } else if (i > 0) {
          mergeTarget = i - 1;
        } else if (i + 1 < result.length) {
          mergeTarget = i + 1;
        } else {
          continue; // Can't merge
        }

        // Perform merge
        const smaller = result[i];
        const target = result[mergeTarget];

        const mergedGroup: BaselineGroup = {
          groupIndex: Math.min(smaller.groupIndex, target.groupIndex),
          minPercentile: Math.min(smaller.minPercentile, target.minPercentile),
          maxPercentile: Math.max(smaller.maxPercentile, target.maxPercentile),
          teamIds: [...smaller.teamIds, ...target.teamIds],
          size: smaller.size + target.size,
          wasMerged: true,
          mergeLog: `Merged groups ${smaller.groupIndex} and ${target.groupIndex}`,
        };

        mergeLog.push(`Merged group ${smaller.groupIndex} (n=${smaller.size}) into group ${target.groupIndex} (n=${target.size})`);

        // Replace in array
        const minIdx = Math.min(i, mergeTarget);
        const maxIdx = Math.max(i, mergeTarget);
        result.splice(maxIdx, 1);
        result.splice(minIdx, 1, mergedGroup);

        // Renumber groups
        result = result.map((g, idx) => ({ ...g, groupIndex: idx }));

        merged = true;
        break;
      }
    }
  }

  return { groups: result, mergeLog };
}

/**
 * Estimate kappa (shrinkage strength) from data
 */
export function estimateKappa(
  groups: BaselineGroup[],
  growthScores: Map<string, number>
): number {
  if (groups.length < 2) return STATISTICAL_DEFAULTS.defaultKappa;

  // Calculate within-group variance
  const groupVariances: number[] = [];
  let totalWithinVariance = 0;
  let totalN = 0;

  for (const group of groups) {
    const groupGrowth = group.teamIds
      .map(id => growthScores.get(id))
      .filter((g): g is number => g !== undefined);

    if (groupGrowth.length >= 2) {
      const v = variance(groupGrowth);
      groupVariances.push(v);
      totalWithinVariance += v * groupGrowth.length;
      totalN += groupGrowth.length;
    }
  }

  if (groupVariances.length === 0 || totalN === 0) {
    return STATISTICAL_DEFAULTS.defaultKappa;
  }

  const avgWithinVariance = totalWithinVariance / totalN;
  const avgGroupSize = totalN / groups.length;

  // Calculate between-group variance
  const groupMeans = groups.map(g => {
    const growth = g.teamIds
      .map(id => growthScores.get(id))
      .filter((v): v is number => v !== undefined);
    return mean(growth);
  });
  const betweenVariance = variance(groupMeans);

  // κ = V̄_g / (n̄ × V_B)
  if (betweenVariance < STATISTICAL_DEFAULTS.kappaStabilityThreshold) {
    return STATISTICAL_DEFAULTS.defaultKappa;
  }

  const kappa = avgWithinVariance / (avgGroupSize * betweenVariance);

  // Bound kappa to reasonable range [1, 50]
  return Math.max(1, Math.min(50, kappa));
}

/**
 * Calculate CGP for a single team
 */
export function calculateCGP(
  teamId: string,
  apiScore: number,
  baselineApiScore: number,
  groups: BaselineGroup[],
  growthScores: Map<string, number>,
  kappa: number
): CGPResult | null {
  if (groups.length === 0) return null;

  // Find team's baseline group
  let baselineGroup: BaselineGroup | undefined;
  for (const group of groups) {
    if (group.teamIds.includes(teamId)) {
      baselineGroup = group;
      break;
    }
  }

  if (!baselineGroup) return null;

  // Calculate growth score for this team
  const growthScore = apiScore - baselineApiScore;

  // Get growth scores for teams in same group
  const groupGrowthScores = baselineGroup.teamIds
    .map(id => growthScores.get(id))
    .filter((g): g is number => g !== undefined)
    .sort((a, b) => a - b);

  if (groupGrowthScores.length === 0) return null;

  // Calculate rank within group (1-indexed)
  let rank = 1;
  for (const g of groupGrowthScores) {
    if (g < growthScore) rank++;
  }

  // Raw CGP with continuity correction
  const n_g = groupGrowthScores.length;
  const rawCGP = ((rank - 0.5) / n_g) * 100;

  // Empirical Bayes shrinkage: α = κ / (κ + n_g)
  const alpha = kappa / (kappa + n_g);
  const shrunkCGP = alpha * 50 + (1 - alpha) * rawCGP;

  // Calculate standard error using order-statistic approximation
  // SE ≈ 50/√n_g
  const standardError = 50 / Math.sqrt(n_g);

  // Calculate mean and variance for the group
  baselineGroup.meanGrowthScore = mean(groupGrowthScores);
  baselineGroup.varianceGrowthScore = variance(groupGrowthScores);

  return {
    raw: Math.round(rawCGP * 10) / 10,
    shrunk: Math.round(shrunkCGP * 10) / 10,
    scaled: Math.round(shrunkCGP * 10) / 10, // CGP is already on 0-100 scale
    standardError: Math.round(standardError * 10) / 10,
    baselineGroup,
    shrinkageAlpha: Math.round(alpha * 1000) / 1000,
    kappa,
    growthScore: Math.round(growthScore * 10) / 10,
    rankWithinGroup: rank,
  };
}

// ============================================
// TNV (Time-Normalized Velocity) Calculation
// ============================================

/**
 * Check if TNV should be included based on measurement interval CV
 */
export function shouldCalculateTNV(intervals: number[]): boolean {
  if (intervals.length < 2) return false;

  const m = mean(intervals);
  if (m === 0) return false;

  const cv = stdDev(intervals) / m;
  return cv > STATISTICAL_DEFAULTS.tnvCVThreshold;
}

/**
 * Calculate TNV for a single team
 */
export function calculateTNV(
  apiScaled: number,
  measurementInterval: number,
  allTeamTNVs: number[]
): TNVResult | null {
  if (measurementInterval <= 0) return null;

  // TNV = API / √(Δt)
  const rawTNV = (apiScaled - 50) / Math.sqrt(measurementInterval);

  // Calculate scaling constant k = 20 / IQR(TNV)
  const iqrValue = iqr(allTeamTNVs);
  const k = iqrValue > 0 ? 20 / iqrValue : 1;

  // Scale TNV
  const scaledTNV = 50 + k * rawTNV;

  // Bound to [5, 95]
  const boundedTNV = Math.max(5, Math.min(95, scaledTNV));

  // Standard error approximation
  const standardError = Math.sqrt(STATISTICAL_DEFAULTS.averageCorrelation) * 10;

  return {
    raw: Math.round(rawTNV * 100) / 100,
    scaled: Math.round(boundedTNV * 10) / 10,
    standardError: Math.round(standardError * 10) / 10,
    isApplicable: true,
    scalingConstant: Math.round(k * 1000) / 1000,
  };
}

// ============================================
// CPS Aggregation
// ============================================

/**
 * Calculate final CPS score from components
 */
export function calculateCPSScore(
  api: APIResult,
  cgp: CGPResult | null,
  tnv: TNVResult | null,
  modelType: CPSModelType
): {
  cps: number;
  se: number;
  weights: { api: number; cgp: number; tnv?: number };
} {
  const weights = DEFAULT_WEIGHTS[modelType];

  if (modelType === '3-component' && tnv) {
    // 3-component: 0.35×API + 0.40×CGP + 0.25×TNV
    const cgpValue = cgp?.scaled || 50;
    const tnvValue = tnv.scaled;

    const cps = weights.api * api.scaled + weights.cgp * cgpValue + (weights.tnv || 0) * tnvValue;

    // Combined SE with inflation factor
    const seCombined = Math.sqrt(
      Math.pow(weights.api * api.standardError, 2) +
      Math.pow(weights.cgp * (cgp?.standardError || 0), 2) +
      Math.pow((weights.tnv || 0) * tnv.standardError, 2)
    );
    const seInflated = seCombined * STATISTICAL_DEFAULTS.seInflation;

    return {
      cps: Math.round(cps * 10) / 10,
      se: Math.round(seInflated * 10) / 10,
      weights: { api: weights.api, cgp: weights.cgp, tnv: weights.tnv },
    };
  } else {
    // 2-component: 0.45×API + 0.55×CGP
    const cgpValue = cgp?.scaled || api.scaled; // Use API as fallback if no CGP

    const cps = weights.api * api.scaled + weights.cgp * cgpValue;

    // Combined SE with inflation factor
    const seCombined = Math.sqrt(
      Math.pow(weights.api * api.standardError, 2) +
      Math.pow(weights.cgp * (cgp?.standardError || api.standardError), 2)
    );
    const seInflated = seCombined * STATISTICAL_DEFAULTS.seInflation;

    return {
      cps: Math.round(cps * 10) / 10,
      se: Math.round(seInflated * 10) / 10,
      weights: { api: weights.api, cgp: weights.cgp },
    };
  }
}

/**
 * Calculate confidence interval for CPS
 */
export function calculateConfidenceInterval(
  cps: number,
  se: number,
  level: number = STATISTICAL_DEFAULTS.confidenceLevel
): { lower: number; upper: number } {
  const z = STATISTICAL_DEFAULTS.zScore95;
  const margin = z * se;

  return {
    lower: Math.max(0, Math.round((cps - margin) * 10) / 10),
    upper: Math.min(100, Math.round((cps + margin) * 10) / 10),
  };
}

// ============================================
// Sensitivity Analysis
// ============================================

/**
 * Run sensitivity analysis with different weight configurations
 */
export function runSensitivityAnalysis(
  api: APIResult,
  cgp: CGPResult | null,
  tnv: TNVResult | null,
  modelType: CPSModelType,
  defaultCPS: number,
  defaultCategory: CPSCategory
): SensitivityConfiguration[] {
  const configurations = getSensitivityConfigurations(modelType);
  const results: SensitivityConfiguration[] = [];

  for (const config of configurations) {
    let cps: number;

    if (modelType === '3-component' && tnv) {
      const cgpValue = cgp?.scaled || 50;
      cps = config.api * api.scaled + config.cgp * cgpValue + (config.tnv || 0) * tnv.scaled;
    } else {
      const cgpValue = cgp?.scaled || api.scaled;
      cps = config.api * api.scaled + config.cgp * cgpValue;
    }

    cps = Math.round(cps * 10) / 10;
    const category = getCPSCategory(cps);

    results.push({
      configuration: config,
      cps,
      category,
      categoryChanged: category !== defaultCategory,
    });
  }

  return results;
}

// ============================================
// Complete Team CPS Calculation
// ============================================

/**
 * Calculate complete CPS result for a single team
 */
export function calculateTeamCPS(
  teamProgress: TeamProgressData,
  allTeamsProgress: TeamProgressData[],
  baselineGroups: BaselineGroup[],
  growthScores: Map<string, number>,
  kappa: number,
  baselineStdDevs: Map<string, number>,
  allTeamIndicatorValues: Map<string, number[]>,
  allTeamTNVs: number[],
  modelType: CPSModelType,
  indicators: CPSIndicator[] = CPS_INDICATORS
): CPSResult {
  const { teamId, teamName, baseline, followUp, measurementIntervalMonths } = teamProgress;

  // Check indicator coverage
  const coverage = checkIndicatorCoverage(followUp, indicators);

  // Get indicators to use (potentially reweighted)
  const effectiveIndicators = coverage.action === 'reweight'
    ? reweightIndicators(coverage.availableIndicators, indicators)
    : indicators;

  // Calculate API
  const api = calculateAPI(
    baseline,
    followUp,
    effectiveIndicators,
    baselineStdDevs,
    allTeamIndicatorValues
  );

  // Calculate baseline API for growth score
  const baselineApi = 50; // Baseline is always 50 (no change)

  // Calculate CGP
  const cgp = calculateCGP(
    teamId,
    api.scaled,
    baselineApi,
    baselineGroups,
    growthScores,
    kappa
  );

  // Calculate TNV
  const tnv = modelType === '3-component' && allTeamTNVs.length > 0
    ? calculateTNV(api.scaled, measurementIntervalMonths, allTeamTNVs)
    : null;

  // Calculate final CPS
  const { cps, se, weights } = calculateCPSScore(api, cgp, tnv, modelType);

  // Calculate confidence interval
  const confidenceInterval = calculateConfidenceInterval(cps, se);

  // Determine category
  const category = getCPSCategory(cps);

  // Run sensitivity analysis
  const sensitivityResults = runSensitivityAnalysis(api, cgp, tnv, modelType, cps, category);
  const isSensitive = sensitivityResults.some(r => r.categoryChanged);

  return {
    teamId,
    teamName,
    api,
    cgp,
    tnv,
    cps,
    standardError: se,
    confidenceInterval,
    category,
    modelType,
    componentWeights: weights,
    sensitivityResults,
    isSensitive,
    indicatorCoverage: coverage.coveragePercent,
    wasReweighted: coverage.action === 'reweight',
  };
}
