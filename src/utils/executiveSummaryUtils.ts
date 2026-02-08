// Executive Summary Calculation Utilities
// Functions for computing aggregated metrics from assessment results

import {
  AssessmentResult,
  DimensionResult,
  ExecutiveSummaryData,
  HealthVerdict,
  RiskLevel,
  TrendDirection,
  PrioritizedRecommendation,
  PriorityQuadrant,
  PriorityQuadrantType,
  PriorityZone,
  PriorityZoneType,
  DimensionSummary,
  ThemeSummary,
  Recommendation,
  MaturityLevel,
  MaturityLevelName,
} from '../types/assessment';
import {
  MATURITY_LEVELS,
  getMaturityLevel,
  getMaturityLevelName,
  getMaturityLevelConfig,
  compareMaturityPriority,
} from '../types/maturity';
import { themeGroups, ThemeGroup } from '../constants/themeGroups';
import { calculateOverallHealthScore } from './healthScoreCalculation';
import { calculateCHSHealthScore } from './chsHealthScoreCalculation';
import { calculateAllOutcomeConfidences } from './outcomeConfidenceCalculation';

// ============================================
// Score and Verdict Calculations
// ============================================

/**
 * Calculate overall health score as weighted average of dimension health scores
 */
export const calculateOverallScore = (dimensions: DimensionResult[]): number => {
  if (dimensions.length === 0) return 0;
  const sum = dimensions.reduce((acc, d) => acc + d.healthScore, 0);
  return Math.round(sum / dimensions.length);
};

/**
 * Get health verdict based on score thresholds
 * @deprecated Use getMaturityLevelName() instead for unified 5-level system
 * CHS thresholds: 55+ = Healthy (Good/Excellent), 30-54 = Needs Attention, <30 = At Risk
 */
export const getHealthVerdict = (score: number): HealthVerdict => {
  if (score >= 55) return 'Healthy';
  if (score >= 30) return 'Needs Attention';
  return 'At Risk';
};

/**
 * Get maturity level name from score (replaces getHealthVerdict)
 * Uses unified 5-level maturity model with even 20-point splits
 */
export const getMaturityVerdict = (score: number): MaturityLevelName => {
  return getMaturityLevelName(score);
};

/**
 * Get risk level from score
 * @deprecated Use getMaturityLevel() instead for unified 5-level system
 * CHS thresholds: 55+ = low risk, 30-54 = moderate risk, <30 = high risk
 */
export const getRiskLevelFromScore = (score: number): RiskLevel => {
  if (score >= 55) return 'low';
  if (score >= 30) return 'moderate';
  return 'high';
};

/**
 * Calculate team rank from average health score
 */
export const calculateTeamRank = (healthScore: number, totalTeams: number): number => {
  // Higher healthScore = better = lower rank number
  return Math.round(((100 - healthScore) / 100) * totalTeams) + 1;
};

// ============================================
// Trend Calculations
// ============================================

/**
 * Calculate trend change (points difference) from trend data
 */
export const calculateTrendChange = (dimensions: DimensionResult[]): number => {
  if (dimensions.length === 0) return 0;

  // Average the change across all dimensions that have trend data
  let totalChange = 0;
  let count = 0;

  for (const dim of dimensions) {
    if (dim.trendData && dim.trendData.length >= 2) {
      const first = dim.trendData[0].value;
      const last = dim.trendData[dim.trendData.length - 1].value;
      totalChange += (last - first);
      count++;
    }
  }

  return count > 0 ? Math.round(totalChange / count) : 0;
};

/**
 * Determine overall trend direction based on trend change
 */
export const getOverallTrend = (trendChange: number): TrendDirection => {
  if (trendChange > 3) return 'improving';
  if (trendChange < -3) return 'declining';
  return 'stable';
};

/**
 * Calculate trend change for a single dimension
 * Returns the difference between first and last period values
 */
export const calculateDimensionTrendChange = (dim: DimensionResult): number => {
  if (!dim.trendData || dim.trendData.length < 2) return 0;
  const first = dim.trendData[0].value;
  const last = dim.trendData[dim.trendData.length - 1].value;
  return Math.round(last - first);
};

/**
 * Find dimension with biggest gain (positive change)
 */
export const findBiggestGain = (
  dimensions: DimensionResult[]
): { dimensionName: string; change: number } | null => {
  let maxGain = 0;
  let biggestGainer: DimensionResult | null = null;

  for (const dim of dimensions) {
    if (dim.trendData && dim.trendData.length >= 2) {
      const change = dim.trendData[dim.trendData.length - 1].value - dim.trendData[0].value;
      if (change > maxGain) {
        maxGain = change;
        biggestGainer = dim;
      }
    }
  }

  return biggestGainer && maxGain > 0
    ? { dimensionName: biggestGainer.dimensionName, change: Math.round(maxGain) }
    : null;
};

/**
 * Find dimension with biggest decline (negative change)
 */
export const findBiggestDecline = (
  dimensions: DimensionResult[]
): { dimensionName: string; change: number } | null => {
  let maxDecline = 0;
  let biggestDecliner: DimensionResult | null = null;

  for (const dim of dimensions) {
    if (dim.trendData && dim.trendData.length >= 2) {
      const change = dim.trendData[dim.trendData.length - 1].value - dim.trendData[0].value;
      if (change < maxDecline) {
        maxDecline = change;
        biggestDecliner = dim;
      }
    }
  }

  return biggestDecliner && maxDecline < 0
    ? { dimensionName: biggestDecliner.dimensionName, change: Math.round(maxDecline) }
    : null;
};

// ============================================
// Count Calculations
// ============================================

/**
 * Count dimensions by risk level
 */
export const countByRiskLevel = (dimensions: DimensionResult[]): {
  high: number;
  moderate: number;
  low: number;
} => ({
  high: dimensions.filter(d => d.riskLevel === 'high').length,
  moderate: dimensions.filter(d => d.riskLevel === 'moderate').length,
  low: dimensions.filter(d => d.riskLevel === 'low').length,
});

/**
 * Count dimensions by trend direction
 */
export const countByTrend = (dimensions: DimensionResult[]): {
  improving: number;
  stable: number;
  declining: number;
} => ({
  improving: dimensions.filter(d => d.trend === 'improving').length,
  stable: dimensions.filter(d => d.trend === 'stable').length,
  declining: dimensions.filter(d => d.trend === 'declining').length,
});

/**
 * Count total and flagged indicators across all dimensions
 */
export const countIndicators = (dimensions: DimensionResult[]): {
  total: number;
  flagged: number;
} => {
  let total = 0;
  let flagged = 0;

  for (const dim of dimensions) {
    for (const cat of dim.categories) {
      total += cat.indicators.length;
      // Flagged = bottom quartile (≤25th percentile)
      flagged += cat.indicators.filter(i => i.benchmarkPercentile <= 25).length;
    }
  }

  return { total, flagged };
};

// ============================================
// Recommendation Prioritization
// ============================================

const EFFORT_WEIGHT: Record<Recommendation['effort'], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const IMPACT_WEIGHT: Record<Recommendation['impact'], number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Calculate recommendation priority score
 * Higher score = better ROI (high impact, low effort)
 */
export const calculateRecommendationPriority = (rec: Recommendation): number => {
  return IMPACT_WEIGHT[rec.impact] * 2 - EFFORT_WEIGHT[rec.effort];
};

/**
 * Aggregate and prioritize recommendations from all dimensions
 */
export const getPrioritizedRecommendations = (
  dimensions: DimensionResult[],
  limit = 5
): PrioritizedRecommendation[] => {
  const allRecs: PrioritizedRecommendation[] = [];

  for (const dim of dimensions) {
    for (const rec of dim.recommendations) {
      allRecs.push({
        ...rec,
        sourceDimension: dim.dimensionName,
        sourceDimensionKey: dim.dimensionKey,
        priority: calculateRecommendationPriority(rec),
      });
    }
  }

  // Sort by priority (descending), then by impact, then by effort (ascending)
  return allRecs
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (IMPACT_WEIGHT[b.impact] !== IMPACT_WEIGHT[a.impact]) {
        return IMPACT_WEIGHT[b.impact] - IMPACT_WEIGHT[a.impact];
      }
      return EFFORT_WEIGHT[a.effort] - EFFORT_WEIGHT[b.effort];
    })
    .slice(0, limit);
};

/**
 * Count quick wins (low effort + high impact)
 */
export const countQuickWins = (dimensions: DimensionResult[]): number => {
  let count = 0;
  for (const dim of dimensions) {
    count += dim.recommendations.filter(
      r => r.effort === 'low' && r.impact === 'high'
    ).length;
  }
  return count;
};

// ============================================
// Priority Matrix
// ============================================

/**
 * Get quadrant for a dimension based on risk and trend
 */
export const getQuadrant = (
  riskLevel: RiskLevel,
  trend: TrendDirection
): PriorityQuadrantType => {
  const isHighRisk = riskLevel === 'high';
  const isDeclining = trend === 'declining';

  if (isHighRisk && isDeclining) return 'fix-now';
  if (isHighRisk) return 'monitor';
  if (isDeclining) return 'watch-out';
  return 'celebrate';
};

/**
 * Calculate indicator stats for a single dimension
 */
const getDimensionIndicatorStats = (dim: DimensionResult) => {
  let total = 0;
  let flagged = 0;
  let improving = 0;
  let declining = 0;
  let stable = 0;

  for (const cat of dim.categories) {
    for (const indicator of cat.indicators) {
      total++;
      // Flagged = bottom quartile (≤25th percentile)
      if (indicator.benchmarkPercentile <= 25) {
        flagged++;
      }
      // Trend direction based on indicator trend
      if (indicator.trend === 'improving') {
        improving++;
      } else if (indicator.trend === 'declining') {
        declining++;
      } else {
        stable++;
      }
    }
  }

  return {
    totalIndicators: total,
    flaggedIndicators: flagged,
    healthyIndicators: total - flagged,
    improvingIndicators: improving,
    decliningIndicators: declining,
    stableIndicators: stable,
  };
};

/**
 * Build priority matrix with dimensions grouped by quadrant (legacy 4-quadrant)
 */
export const buildPriorityMatrix = (dimensions: DimensionResult[]): PriorityQuadrant[] => {
  const quadrants: Record<PriorityQuadrantType, DimensionSummary[]> = {
    'fix-now': [],
    'monitor': [],
    'watch-out': [],
    'celebrate': [],
  };

  for (const dim of dimensions) {
    const quadrant = getQuadrant(dim.riskLevel, dim.trend);
    const trendChange = calculateDimensionTrendChange(dim);
    const indicatorStats = getDimensionIndicatorStats(dim);
    quadrants[quadrant].push({
      dimensionKey: dim.dimensionKey,
      dimensionNumber: dim.dimensionNumber,
      dimensionName: dim.dimensionName,
      riskLevel: dim.riskLevel,
      trend: dim.trend,
      percentile: dim.healthScore, // Use healthScore for consistency
      trendChange,
      ...indicatorStats,
    });
  }

  return [
    {
      quadrant: 'fix-now',
      label: 'Fix Now',
      description: 'High risk and getting worse',
      color: '#DE350B',
      dimensions: quadrants['fix-now'],
    },
    {
      quadrant: 'monitor',
      label: 'Monitor Closely',
      description: 'High risk but stable or improving',
      color: '#FF8B00',
      dimensions: quadrants['monitor'],
    },
    {
      quadrant: 'watch-out',
      label: 'Watch Out',
      description: 'Low risk but declining',
      color: '#FFAB00',
      dimensions: quadrants['watch-out'],
    },
    {
      quadrant: 'celebrate',
      label: 'Celebrate',
      description: 'Low risk and stable or improving',
      color: '#36B37E',
      dimensions: quadrants['celebrate'],
    },
  ];
};

// ============================================
// 9-Zone Priority Matrix
// ============================================

/**
 * Get zone for a dimension based on health score and trend change
 * Uses CHS thresholds: 70+ Excellent, 55-69 Good, 45-54 Average, 30-44 Below Avg, <30 Needs Attention
 */
export const getZone = (healthScore: number, trendChange: number): PriorityZoneType => {
  // Determine risk level from healthScore using CHS thresholds
  const riskLevel: 'low' | 'moderate' | 'high' =
    healthScore >= 55 ? 'low' : healthScore >= 30 ? 'moderate' : 'high';

  // Determine trend direction from trend change
  const trendDir: 'declining' | 'stable' | 'improving' =
    trendChange < -3 ? 'declining' : trendChange > 3 ? 'improving' : 'stable';

  // Map to zone based on risk level and trend direction
  const zoneMap: Record<string, PriorityZoneType> = {
    'high-declining': 'act-now',
    'high-stable': 'address',
    'high-improving': 'keep-pushing',
    'moderate-declining': 'act-soon',
    'moderate-stable': 'monitor',
    'moderate-improving': 'good-progress',
    'low-declining': 'heads-up',
    'low-stable': 'maintain',
    'low-improving': 'celebrate',
  };

  return zoneMap[`${riskLevel}-${trendDir}`];
};

// Zone configuration for display
const ZONE_CONFIG: Record<PriorityZoneType, { label: string; description: string; color: string; bgColor: string; borderColor: string }> = {
  'act-now': {
    label: 'Act Now',
    description: 'Critical issues getting worse. Address first.',
    color: '#DE350B',
    bgColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  'address': {
    label: 'Address',
    description: 'Significant issues not improving on their own.',
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FFBDAD',
  },
  'keep-pushing': {
    label: 'Keep Pushing',
    description: 'Your efforts are working - maintain focus.',
    color: '#FF8B00',
    bgColor: '#FFFAE6',
    borderColor: '#FFE380',
  },
  'act-soon': {
    label: 'Act Soon',
    description: 'Moderate issues worsening. Prevent escalation.',
    color: '#FF8B00',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  'monitor': {
    label: 'Monitor',
    description: 'Stable but not ideal. Address after priorities.',
    color: '#FFAB00',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  'good-progress': {
    label: 'Good Progress',
    description: 'Improving steadily. On track to become healthy.',
    color: '#36B37E',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
  },
  'heads-up': {
    label: 'Heads Up',
    description: 'Healthy but declining. Investigate early.',
    color: '#FFAB00',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  'maintain': {
    label: 'Maintain',
    description: 'Healthy and stable. Continue current practices.',
    color: '#36B37E',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  'celebrate': {
    label: 'Celebrate',
    description: 'Healthy and improving. Share what\'s working.',
    color: '#00875A',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
  },
};

/**
 * Build 9-zone priority matrix with dimensions grouped by zone
 */
export const buildPriorityZones = (dimensions: DimensionResult[]): PriorityZone[] => {
  const zones: Record<PriorityZoneType, DimensionSummary[]> = {
    'act-now': [],
    'address': [],
    'keep-pushing': [],
    'act-soon': [],
    'monitor': [],
    'good-progress': [],
    'heads-up': [],
    'maintain': [],
    'celebrate': [],
  };

  for (const dim of dimensions) {
    const trendChange = calculateDimensionTrendChange(dim);
    const zone = getZone(dim.healthScore, trendChange);
    const indicatorStats = getDimensionIndicatorStats(dim);
    zones[zone].push({
      dimensionKey: dim.dimensionKey,
      dimensionNumber: dim.dimensionNumber,
      dimensionName: dim.dimensionName,
      riskLevel: dim.riskLevel,
      trend: dim.trend,
      percentile: dim.healthScore, // Use healthScore for consistency
      trendChange,
      ...indicatorStats,
    });
  }

  // Return zones in display order (high risk row, moderate risk row, low risk row)
  const zoneOrder: PriorityZoneType[] = [
    'act-now', 'address', 'keep-pushing',      // High risk row
    'act-soon', 'monitor', 'good-progress',    // Moderate risk row
    'heads-up', 'maintain', 'celebrate',       // Low risk row
  ];

  return zoneOrder.map(zoneType => ({
    zone: zoneType,
    label: ZONE_CONFIG[zoneType].label,
    description: ZONE_CONFIG[zoneType].description,
    color: ZONE_CONFIG[zoneType].color,
    bgColor: ZONE_CONFIG[zoneType].bgColor,
    borderColor: ZONE_CONFIG[zoneType].borderColor,
    dimensions: zones[zoneType],
  }));
};

// ============================================
// Maturity-Based Grouping (Unified 5-Level System)
// ============================================

export interface MaturityGroup {
  level: MaturityLevel;
  name: MaturityLevelName;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  dimensions: DimensionSummary[];
}

/**
 * Build maturity-based priority list (replaces 9-zone matrix)
 * Groups dimensions by maturity level (1-5), sorted by priority
 * Within each level, sorts by trend (declining > stable > improving)
 */
export const buildMaturityPriorities = (dimensions: DimensionResult[]): MaturityGroup[] => {
  // Create groups for each maturity level
  const groups: Record<MaturityLevel, DimensionSummary[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  // Group dimensions by maturity level (now based on healthScore)
  for (const dim of dimensions) {
    // Use healthScore for maturity level calculation
    const maturityLevel = getMaturityLevel(dim.healthScore);
    const trendChange = calculateDimensionTrendChange(dim);
    const indicatorStats = getDimensionIndicatorStats(dim);

    const summary: DimensionSummary = {
      dimensionKey: dim.dimensionKey,
      dimensionNumber: dim.dimensionNumber,
      dimensionName: dim.dimensionName,
      riskLevel: dim.riskLevel,
      trend: dim.trend,
      percentile: dim.overallPercentile, // Keep for backward compat
      trendChange,
      ...indicatorStats,
      maturityLevel,
      maturityName: getMaturityLevelName(dim.healthScore),
    };

    groups[maturityLevel].push(summary);
  }

  // Sort dimensions within each group by priority (declining first, then stable, then improving)
  for (const level of [1, 2, 3, 4, 5] as MaturityLevel[]) {
    groups[level].sort((a, b) => compareMaturityPriority(
      { level: a.maturityLevel || level, trend: a.trend },
      { level: b.maturityLevel || level, trend: b.trend }
    ));
  }

  // Return as array sorted by maturity level (Basic first = highest priority)
  return ([1, 2, 3, 4, 5] as MaturityLevel[]).map(level => {
    const config = MATURITY_LEVELS[level - 1];
    return {
      level,
      name: config.name as MaturityLevelName,
      color: config.color,
      bgColor: config.backgroundColor,
      borderColor: config.borderColor,
      description: config.description,
      dimensions: groups[level],
    };
  });
};

/**
 * Count dimensions by maturity level (based on healthScore)
 */
export const countByMaturityLevel = (dimensions: DimensionResult[]): Record<MaturityLevel, number> => {
  const counts: Record<MaturityLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const dim of dimensions) {
    const level = getMaturityLevel(dim.healthScore);
    counts[level]++;
  }
  return counts;
};

// ============================================
// Theme Summaries
// ============================================

/**
 * Get dominant trend for a set of dimensions
 */
const getDominantTrend = (dimensions: DimensionResult[]): TrendDirection => {
  const counts = countByTrend(dimensions);
  if (counts.declining > counts.improving) return 'declining';
  if (counts.improving > counts.declining) return 'improving';
  return 'stable';
};

/**
 * Build theme summaries from dimensions
 */
export const buildThemeSummaries = (dimensions: DimensionResult[]): ThemeSummary[] => {
  return themeGroups.map((theme: ThemeGroup) => {
    const themeDimensions = theme.dimensionKeys
      .map(key => dimensions.find(d => d.dimensionKey === key))
      .filter((d): d is DimensionResult => d !== undefined);

    const concernCount = themeDimensions.filter(d => d.riskLevel === 'high').length;

    return {
      themeId: theme.id,
      themeName: theme.name,
      themeQuestion: theme.question,
      concernCount,
      isHealthy: concernCount === 0,
      dimensions: themeDimensions.map(d => {
        const indicatorStats = getDimensionIndicatorStats(d);
        return {
          dimensionKey: d.dimensionKey,
          dimensionNumber: d.dimensionNumber,
          dimensionName: d.dimensionName,
          riskLevel: d.riskLevel,
          trend: d.trend,
          percentile: d.healthScore, // Use healthScore for consistency
          trendChange: calculateDimensionTrendChange(d),
          ...indicatorStats,
        };
      }),
      overallTrend: getDominantTrend(themeDimensions),
    };
  });
};

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate complete executive summary data from assessment result
 */
export const calculateExecutiveSummary = (
  assessmentResult: AssessmentResult
): ExecutiveSummaryData => {
  const { dimensions, comparisonTeamCount } = assessmentResult;
  const totalTeams = comparisonTeamCount + 1; // Include the assessed team

  // Overall score and verdict
  const overallScore = calculateOverallScore(dimensions);
  const overallVerdict = getHealthVerdict(overallScore);
  const overallRiskLevel = getRiskLevelFromScore(overallScore);

  // Trend calculations
  const overallTrendChange = calculateTrendChange(dimensions);
  const overallTrend = getOverallTrend(overallTrendChange);

  // Ranking
  const teamRank = calculateTeamRank(overallScore, totalTeams);

  // Risk breakdown
  const riskCounts = countByRiskLevel(dimensions);
  const trendCounts = countByTrend(dimensions);

  // Indicators
  const indicatorCounts = countIndicators(dimensions);

  // Biggest movers
  const biggestGain = findBiggestGain(dimensions);
  const biggestDecline = findBiggestDecline(dimensions);

  // Recommendations
  const quickWinCount = countQuickWins(dimensions);
  const topRecommendations = getPrioritizedRecommendations(dimensions, 5);

  // Priority matrix (legacy 4-quadrant)
  const priorityMatrix = buildPriorityMatrix(dimensions);

  // Priority zones (new 9-zone)
  const priorityZones = buildPriorityZones(dimensions);

  // Theme summaries
  const themeSummaries = buildThemeSummaries(dimensions);

  // Composite Health Score (CHS methodology)
  // Uses CSS (Current State) + TRS (Trajectory) + PGS (Peer Growth)
  const healthScore = calculateCHSHealthScore(dimensions);

  // Outcome-based confidence scores
  const outcomeConfidence = calculateAllOutcomeConfidences(dimensions);

  return {
    overallScore,
    overallVerdict,
    overallRiskLevel,
    overallTrend,
    overallTrendChange,
    teamRank,
    totalTeams,
    highRiskCount: riskCounts.high,
    moderateRiskCount: riskCounts.moderate,
    lowRiskCount: riskCounts.low,
    totalDimensions: dimensions.length,
    totalIndicators: indicatorCounts.total,
    flaggedIndicators: indicatorCounts.flagged,
    improvingCount: trendCounts.improving,
    decliningCount: trendCounts.declining,
    stableCount: trendCounts.stable,
    biggestGain,
    biggestDecline,
    quickWinCount,
    topRecommendations,
    priorityMatrix,
    priorityZones,
    themeSummaries,
    healthScore,
    outcomeConfidence,
  };
};

// ============================================
// Display Helpers
// ============================================

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Get color for health verdict
 */
export const getVerdictColor = (verdict: HealthVerdict): string => {
  switch (verdict) {
    case 'Healthy': return '#36B37E';
    case 'Needs Attention': return '#FF8B00';
    case 'At Risk': return '#DE350B';
  }
};

/**
 * Get background color for health verdict
 */
export const getVerdictBackgroundColor = (verdict: HealthVerdict): string => {
  switch (verdict) {
    case 'Healthy': return '#E3FCEF';
    case 'Needs Attention': return '#FFFAE6';
    case 'At Risk': return '#FFEBE6';
  }
};
