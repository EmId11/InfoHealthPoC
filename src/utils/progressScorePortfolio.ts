// Portfolio-Level CPS Orchestration
// Coordinates CPS calculation across all teams and generates portfolio summary

import {
  CPSIndicator,
  TeamProgressData,
  CPSResult,
  PortfolioCPSSummary,
  MissingDataResult,
  BaselineGroup,
  CPSCategory,
  CPSModelType,
  CategoryDistribution,
  SensitivityAnalysisResult,
  getCPSCategory,
  createEmptyPortfolioCPSSummary,
} from '../types/progressScore';
import {
  calculateBaselineStdDevs,
  checkIndicatorCoverage,
  createBaselineGroups,
  mergeSmallGroups,
  estimateKappa,
  shouldCalculateTNV,
  calculateTeamCPS,
  reweightIndicators,
  calculateAPI,
} from './progressScore';
import {
  CPS_INDICATORS,
  generateMockCPSPortfolio,
  MockCPSPortfolio,
  getStandardMockPortfolio,
  calculateIntervalCV,
} from './mockCPSData';
import {
  STATISTICAL_DEFAULTS,
  DEFAULT_WEIGHTS,
  getSensitivityConfigurations,
  getGroupingConfig,
} from '../constants/progressScoreConfig';

// ============================================
// Statistical Helpers
// ============================================

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

// ============================================
// Portfolio CPS Calculation
// ============================================

/**
 * Calculate CPS for all teams in portfolio
 */
export function calculatePortfolioCPS(
  teamProgressData: TeamProgressData[],
  indicators: CPSIndicator[] = CPS_INDICATORS
): PortfolioCPSSummary {
  if (teamProgressData.length === 0) {
    return createEmptyPortfolioCPSSummary();
  }

  // Step 1: Check missing data for all teams
  const coverageResults: MissingDataResult[] = [];
  const teamsToInclude: TeamProgressData[] = [];
  const excludedTeams: MissingDataResult[] = [];

  for (const team of teamProgressData) {
    const coverage = checkIndicatorCoverage(team.followUp, indicators);
    coverageResults.push(coverage);

    if (coverage.meetsThreshold) {
      teamsToInclude.push(team);
    } else {
      excludedTeams.push(coverage);
    }
  }

  if (teamsToInclude.length === 0) {
    const summary = createEmptyPortfolioCPSSummary();
    summary.excludedTeams = excludedTeams;
    summary.totalTeams = teamProgressData.length;
    return summary;
  }

  // Step 2: Calculate baseline std devs from all teams
  const allBaselines = teamsToInclude.map(t => t.baseline);
  const baselineStdDevs = calculateBaselineStdDevs(allBaselines, indicators);

  // Step 3: Collect all indicator values for winsorization bounds
  const allTeamIndicatorValues = new Map<string, number[]>();
  for (const indicator of indicators) {
    const values: number[] = [];
    for (const team of teamsToInclude) {
      // Collect both baseline and follow-up values for bounds
      const baselineVal = team.baseline.indicatorValues[indicator.id];
      const followUpVal = team.followUp.indicatorValues[indicator.id];

      if (baselineVal !== undefined) {
        values.push(indicator.directionality * baselineVal);
      }
      if (followUpVal !== undefined) {
        values.push(indicator.directionality * followUpVal);
      }
    }
    allTeamIndicatorValues.set(indicator.id, values);
  }

  // Step 4: Determine model type based on measurement interval CV
  const intervals = teamsToInclude.map(t => t.measurementIntervalMonths);
  const intervalCV = calculateIntervalCV(intervals);
  const includeTNV = shouldCalculateTNV(intervals);
  const modelType: CPSModelType = includeTNV ? '3-component' : '2-component';

  // Step 5: Calculate preliminary API scores for baseline grouping
  const preliminaryApiScores: Array<{ teamId: string; baselineScore: number }> = [];

  for (const team of teamsToInclude) {
    // Use API scaled score as baseline score for grouping
    // For baseline, we use a simple average of direction-adjusted indicators
    let baselineScore = 0;
    let weightSum = 0;

    for (const indicator of indicators) {
      const value = team.baseline.indicatorValues[indicator.id];
      if (value !== undefined) {
        // Normalize to 0-100 scale based on typical ranges
        const normalizedValue = indicator.directionality > 0
          ? value // Higher is better
          : (100 - value); // Lower is better, invert

        baselineScore += indicator.weight * normalizedValue;
        weightSum += indicator.weight;
      }
    }

    if (weightSum > 0) {
      baselineScore = baselineScore / weightSum;
    }

    preliminaryApiScores.push({
      teamId: team.teamId,
      baselineScore,
    });
  }

  // Step 6: Create baseline groups for CGP
  const teamCount = teamsToInclude.length;
  const groupingConfig = getGroupingConfig(teamCount);
  let baselineGroups: BaselineGroup[] = [];

  if (groupingConfig.method !== 'none') {
    const rawGroups = createBaselineGroups(preliminaryApiScores, teamCount);
    const { groups: mergedGroups, mergeLog } = mergeSmallGroups(rawGroups);
    baselineGroups = mergedGroups;
  }

  // Step 7: Calculate API for all teams to get growth scores
  const growthScores = new Map<string, number>();
  const apiResults = new Map<string, ReturnType<typeof calculateAPI>>();

  for (const team of teamsToInclude) {
    const coverage = coverageResults.find(c => c.teamId === team.teamId);
    const effectiveIndicators = coverage?.action === 'reweight'
      ? reweightIndicators(coverage.availableIndicators, indicators)
      : indicators;

    const api = calculateAPI(
      team.baseline,
      team.followUp,
      effectiveIndicators,
      baselineStdDevs,
      allTeamIndicatorValues
    );

    apiResults.set(team.teamId, api);
    growthScores.set(team.teamId, api.scaled - 50); // Growth = API - baseline (50)
  }

  // Step 8: Estimate kappa for shrinkage
  const kappa = baselineGroups.length > 0
    ? estimateKappa(baselineGroups, growthScores)
    : STATISTICAL_DEFAULTS.defaultKappa;

  // Step 9: Calculate raw TNV values for all teams (if applicable)
  const allTeamTNVs: number[] = [];
  if (includeTNV) {
    for (const team of teamsToInclude) {
      const api = apiResults.get(team.teamId);
      if (api && team.measurementIntervalMonths > 0) {
        const rawTNV = (api.scaled - 50) / Math.sqrt(team.measurementIntervalMonths);
        allTeamTNVs.push(rawTNV);
      }
    }
  }

  // Step 10: Calculate complete CPS for all teams
  const teamResults: CPSResult[] = [];

  for (const team of teamsToInclude) {
    const result = calculateTeamCPS(
      team,
      teamsToInclude,
      baselineGroups,
      growthScores,
      kappa,
      baselineStdDevs,
      allTeamIndicatorValues,
      allTeamTNVs,
      modelType,
      indicators
    );

    teamResults.push(result);
  }

  // Step 11: Calculate aggregate statistics
  const cpsValues = teamResults.map(r => r.cps);
  const averageCPS = Math.round(mean(cpsValues) * 10) / 10;
  const medianCPS = Math.round(median(cpsValues) * 10) / 10;
  const stdDevCPS = Math.round(stdDev(cpsValues) * 10) / 10;
  const minCPS = Math.min(...cpsValues);
  const maxCPS = Math.max(...cpsValues);

  // Step 12: Calculate category distribution
  const categoryDistribution = calculateCategoryDistribution(teamResults);

  // Step 13: Run portfolio-level sensitivity analysis
  const sensitivityAnalysis = calculatePortfolioSensitivity(teamResults, modelType);

  return {
    teams: teamResults,
    excludedTeams,
    averageCPS,
    medianCPS,
    stdDevCPS,
    minCPS,
    maxCPS,
    categoryDistribution,
    baselineGroups,
    groupingMethod: groupingConfig.method,
    modelType,
    measurementIntervalCV: Math.round(intervalCV * 1000) / 1000,
    sensitivityAnalysis,
    totalTeams: teamProgressData.length,
    includedTeams: teamsToInclude.length,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate category distribution from team results
 */
function calculateCategoryDistribution(teamResults: CPSResult[]): CategoryDistribution[] {
  const categories: CPSCategory[] = [
    'strong-progress',
    'moderate-progress',
    'stable',
    'moderate-decline',
    'significant-decline',
  ];

  const distribution: CategoryDistribution[] = [];

  for (const category of categories) {
    const teams = teamResults.filter(t => t.category === category);
    distribution.push({
      category,
      count: teams.length,
      percentage: Math.round((teams.length / teamResults.length) * 1000) / 10,
      teamIds: teams.map(t => t.teamId),
    });
  }

  return distribution;
}

/**
 * Calculate portfolio-level sensitivity analysis
 */
function calculatePortfolioSensitivity(
  teamResults: CPSResult[],
  modelType: CPSModelType
): SensitivityAnalysisResult {
  const configurations = getSensitivityConfigurations(modelType);
  const defaultConfig = configurations[0];
  const defaultWeights = DEFAULT_WEIGHTS[modelType];

  // Count teams that change category under different configurations
  let teamsWithCategoryChange = 0;

  for (const team of teamResults) {
    if (team.sensitivityResults.some(r => r.categoryChanged)) {
      teamsWithCategoryChange++;
    }
  }

  const isSensitive = (teamsWithCategoryChange / teamResults.length) > 0.20;

  return {
    defaultConfiguration: {
      name: 'Default',
      api: defaultWeights.api,
      cgp: defaultWeights.cgp,
      tnv: defaultWeights.tnv,
    },
    defaultCPS: Math.round(mean(teamResults.map(t => t.cps)) * 10) / 10,
    defaultCategory: getCPSCategory(mean(teamResults.map(t => t.cps))),
    configurations: teamResults[0]?.sensitivityResults || [],
    teamsWithCategoryChange,
    totalTeams: teamResults.length,
    isSensitive,
  };
}

// ============================================
// Mock Data Integration
// ============================================

/**
 * Generate mock portfolio CPS summary
 */
export function generateMockPortfolioCPS(
  teamCount: number = 47,
  intervalMode: 'uniform' | 'varied' = 'varied',
  seed: number = 42
): PortfolioCPSSummary {
  const mockData = generateMockCPSPortfolio(teamCount, intervalMode, true, seed);
  return calculatePortfolioCPS(mockData.progressData, mockData.indicators);
}

/**
 * Get standard mock portfolio CPS summary (cached for consistent demo)
 */
let cachedPortfolioCPS: PortfolioCPSSummary | null = null;

export function getStandardPortfolioCPS(): PortfolioCPSSummary {
  if (!cachedPortfolioCPS) {
    const mockData = getStandardMockPortfolio();
    cachedPortfolioCPS = calculatePortfolioCPS(mockData.progressData, mockData.indicators);
  }
  return cachedPortfolioCPS;
}

/**
 * Clear cached portfolio CPS (useful for testing)
 */
export function clearCachedPortfolioCPS(): void {
  cachedPortfolioCPS = null;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get top performers by CPS
 */
export function getTopPerformers(
  summary: PortfolioCPSSummary,
  count: number = 5
): CPSResult[] {
  return [...summary.teams]
    .sort((a, b) => b.cps - a.cps)
    .slice(0, count);
}

/**
 * Get teams needing attention (significant decline)
 */
export function getTeamsNeedingAttention(summary: PortfolioCPSSummary): CPSResult[] {
  return summary.teams.filter(t =>
    t.category === 'significant-decline' || t.category === 'moderate-decline'
  );
}

/**
 * Get teams by category
 */
export function getTeamsByCategory(
  summary: PortfolioCPSSummary,
  category: CPSCategory
): CPSResult[] {
  return summary.teams.filter(t => t.category === category);
}

/**
 * Get team CPS result by ID
 */
export function getTeamCPSById(
  summary: PortfolioCPSSummary,
  teamId: string
): CPSResult | undefined {
  return summary.teams.find(t => t.teamId === teamId);
}

/**
 * Calculate percentile rank of a team's CPS within portfolio
 */
export function getTeamCPSPercentile(
  summary: PortfolioCPSSummary,
  teamId: string
): number | null {
  const team = getTeamCPSById(summary, teamId);
  if (!team) return null;

  const allScores = summary.teams.map(t => t.cps).sort((a, b) => a - b);
  let count = 0;
  for (const score of allScores) {
    if (score < team.cps) count++;
    else if (score === team.cps) count += 0.5;
  }

  return Math.round((count / allScores.length) * 100);
}
