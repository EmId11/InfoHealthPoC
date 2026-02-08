// Portfolio Aggregation Utilities
// Functions for aggregating multi-team assessment results

import type {
  AssessmentResult,
  DimensionResult,
  Recommendation,
  TrendDirection,
} from '../types/assessment';
import type { MaturityLevel, MaturityLevelName } from '../types/maturity';
import { getMaturityLevelConfig, getMaturityLevel } from '../types/maturity';
import { calculateOverallHealthScore } from './healthScoreCalculation';
import type {
  MultiTeamAssessmentResult,
  PortfolioSummary,
  DimensionAggregate,
  TeamRollup,
  CrossTeamAnalysis,
  TeamDimensionMatrix,
  PerformancePattern,
  CommonGap,
  TrendingDimension,
  PortfolioRecommendation,
  HealthScoreDistribution,
  MaturityDistribution,
  LeadershipInsight,
  InvestmentPriority,
  PortfolioRiskSummary,
  PortfolioExecutiveSummary,
  ScopeSelection,
  ConfigurationStrategy,
} from '../types/multiTeamAssessment';
import {
  calculateVariance,
  calculateStandardDeviation,
  isOutlier,
  calculateHealthScoreDistribution,
} from '../types/multiTeamAssessment';
import type { Step3Data, Step4Data, Step5Data, Step6Data } from '../types/wizard';

// ============================================
// Statistical Helpers
// ============================================

/**
 * Calculate mean of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate mode (most common value) of maturity levels
 */
export function calculateMaturityMode(levels: MaturityLevel[]): MaturityLevel {
  const counts = new Map<MaturityLevel, number>();
  levels.forEach(level => {
    counts.set(level, (counts.get(level) || 0) + 1);
  });

  let maxCount = 0;
  let mode: MaturityLevel = 3;

  counts.forEach((count, level) => {
    if (count > maxCount) {
      maxCount = count;
      mode = level;
    }
  });

  return mode;
}

/**
 * Count trend directions
 */
export function countTrends(trends: TrendDirection[]): {
  improving: number;
  stable: number;
  declining: number;
} {
  const counts = { improving: 0, stable: 0, declining: 0 };
  trends.forEach(trend => {
    counts[trend]++;
  });
  return counts;
}

/**
 * Get aggregate trend based on majority
 */
export function getAggregateTrend(trends: TrendDirection[]): TrendDirection {
  const counts = countTrends(trends);

  if (counts.improving > counts.declining && counts.improving >= counts.stable) {
    return 'improving';
  }
  if (counts.declining > counts.improving && counts.declining >= counts.stable) {
    return 'declining';
  }
  return 'stable';
}

// ============================================
// Team Health Score Calculation
// ============================================

/**
 * Calculate overall health score for a team from their dimensions
 */
export function calculateTeamHealthScore(result: AssessmentResult): number {
  const healthScore = calculateOverallHealthScore(result.dimensions);
  return healthScore.compositeScore;
}

// ============================================
// Dimension Aggregation
// ============================================

/**
 * Aggregate a single dimension across all team results
 */
export function aggregateDimension(
  dimensionKey: string,
  teamResults: AssessmentResult[]
): DimensionAggregate | null {
  // Collect this dimension from all teams
  const dimensions: DimensionResult[] = [];

  teamResults.forEach(result => {
    const dim = result.dimensions.find(d => d.dimensionKey === dimensionKey);
    if (dim) {
      dimensions.push(dim);
    }
  });

  if (dimensions.length === 0) return null;

  const firstDim = dimensions[0];
  const healthScores = dimensions.map(d => d.healthScore);
  const trends = dimensions.map(d => d.trend);
  const maturityLevels = dimensions.map(d => d.maturityLevel || getMaturityLevel(d.healthScore));

  const mean = calculateMean(healthScores);
  const stdDev = calculateStandardDeviation(healthScores);

  // Find outlier teams
  const outlierTeamIds: string[] = [];
  teamResults.forEach((result, index) => {
    const dim = result.dimensions.find(d => d.dimensionKey === dimensionKey);
    if (dim && isOutlier(dim.healthScore, mean, stdDev)) {
      outlierTeamIds.push(result.teamId);
    }
  });

  // Calculate maturity distribution
  const maturityDistribution: MaturityDistribution = {
    level1: maturityLevels.filter(l => l === 1).length,
    level2: maturityLevels.filter(l => l === 2).length,
    level3: maturityLevels.filter(l => l === 3).length,
    level4: maturityLevels.filter(l => l === 4).length,
    level5: maturityLevels.filter(l => l === 5).length,
  };

  const trendCounts = countTrends(trends);
  const aggregateMaturityLevel = getMaturityLevel(mean);
  const maturityConfig = getMaturityLevelConfig(mean);

  return {
    dimensionKey,
    dimensionNumber: firstDim.dimensionNumber,
    dimensionName: firstDim.dimensionName,
    questionForm: firstDim.questionForm,

    averageHealthScore: Math.round(mean),
    medianHealthScore: Math.round(calculateMedian(healthScores)),
    minHealthScore: Math.min(...healthScores),
    maxHealthScore: Math.max(...healthScores),
    standardDeviation: Math.round(stdDev * 10) / 10,

    maturityDistribution,
    aggregateMaturityLevel,
    aggregateMaturityName: maturityConfig.name,

    teamsImproving: trendCounts.improving,
    teamsStable: trendCounts.stable,
    teamsDeclining: trendCounts.declining,
    overallTrend: getAggregateTrend(trends),

    outlierTeamIds,
    isHighVariance: stdDev > 25,
  };
}

/**
 * Aggregate all dimensions across team results
 */
export function aggregateAllDimensions(
  teamResults: AssessmentResult[]
): DimensionAggregate[] {
  if (teamResults.length === 0) return [];

  // Get all unique dimension keys from the first team (assuming all teams have same dimensions)
  const dimensionKeys = teamResults[0].dimensions.map(d => d.dimensionKey);

  return dimensionKeys
    .map(key => aggregateDimension(key, teamResults))
    .filter((agg): agg is DimensionAggregate => agg !== null);
}

// ============================================
// Team Rollup Generation
// ============================================

/**
 * Generate team rollup with ranking information
 */
export function generateTeamRollups(
  teamResults: AssessmentResult[]
): TeamRollup[] {
  // Calculate health scores for all teams
  const teamsWithScores = teamResults.map(result => ({
    result,
    healthScore: calculateTeamHealthScore(result),
  }));

  // Sort by health score descending (best first)
  const sortedTeams = [...teamsWithScores].sort((a, b) => b.healthScore - a.healthScore);

  // Calculate portfolio mean and std dev
  const scores = teamsWithScores.map(t => t.healthScore);
  const mean = calculateMean(scores);
  const stdDev = calculateStandardDeviation(scores);

  // Get dimension keys for ranking
  const dimensionKeys = teamResults[0]?.dimensions.map(d => d.dimensionKey) || [];

  // Calculate dimension rankings
  const dimensionRankings: Map<string, { teamId: string; healthScore: number }[]> = new Map();

  dimensionKeys.forEach(key => {
    const teamsWithDim = teamResults
      .map(result => {
        const dim = result.dimensions.find(d => d.dimensionKey === key);
        return dim ? { teamId: result.teamId, healthScore: dim.healthScore } : null;
      })
      .filter((t): t is { teamId: string; healthScore: number } => t !== null)
      .sort((a, b) => b.healthScore - a.healthScore);

    dimensionRankings.set(key, teamsWithDim);
  });

  // Generate rollups
  return sortedTeams.map((team, index) => {
    const deviationFromMean = team.healthScore - mean;
    const teamIsOutlier = isOutlier(team.healthScore, mean, stdDev);

    // Calculate dimension ranks for this team
    const dimensionRanks: Record<string, number> = {};
    dimensionKeys.forEach(key => {
      const rankings = dimensionRankings.get(key) || [];
      const rank = rankings.findIndex(r => r.teamId === team.result.teamId) + 1;
      dimensionRanks[key] = rank || teamResults.length;
    });

    // Data completeness - based on how many indicators have data
    const totalIndicators = team.result.dimensions.reduce(
      (sum, dim) => sum + dim.categories.reduce((catSum, cat) => catSum + cat.indicators.length, 0),
      0
    );
    const dataCompleteness = totalIndicators > 0 ? 100 : 0;

    return {
      teamId: team.result.teamId,
      teamName: team.result.teamName,
      assessmentResult: team.result,
      overallRank: index + 1,
      overallHealthScore: team.healthScore,
      dimensionRanks,
      deviationFromMean: Math.round(deviationFromMean * 10) / 10,
      isOutlier: teamIsOutlier,
      outlierDirection: teamIsOutlier ? (deviationFromMean > 0 ? 'above' : 'below') : undefined,
      dataCompleteness,
      isNewTeam: false, // Would be determined by checking historical data
    };
  });
}

// ============================================
// Cross-Team Analysis
// ============================================

/**
 * Generate team x dimension comparison matrix
 */
export function generateComparisonMatrix(
  teamRollups: TeamRollup[]
): TeamDimensionMatrix {
  if (teamRollups.length === 0) {
    return {
      teamIds: [],
      teamNames: [],
      dimensionKeys: [],
      dimensionNames: [],
      values: [],
      maturityLevels: [],
    };
  }

  const teamIds = teamRollups.map(r => r.teamId);
  const teamNames = teamRollups.map(r => r.teamName);

  // Get dimensions from first team
  const firstResult = teamRollups[0].assessmentResult;
  const dimensionKeys = firstResult.dimensions.map(d => d.dimensionKey);
  const dimensionNames = firstResult.dimensions.map(d => d.dimensionName);

  // Build matrix
  const values: number[][] = [];
  const maturityLevels: MaturityLevel[][] = [];

  teamRollups.forEach(rollup => {
    const teamValues: number[] = [];
    const teamMaturity: MaturityLevel[] = [];

    dimensionKeys.forEach(key => {
      const dim = rollup.assessmentResult.dimensions.find(d => d.dimensionKey === key);
      if (dim) {
        teamValues.push(dim.healthScore);
        teamMaturity.push(dim.maturityLevel || getMaturityLevel(dim.healthScore));
      } else {
        teamValues.push(0);
        teamMaturity.push(1);
      }
    });

    values.push(teamValues);
    maturityLevels.push(teamMaturity);
  });

  return {
    teamIds,
    teamNames,
    dimensionKeys,
    dimensionNames,
    values,
    maturityLevels,
  };
}

/**
 * Identify common gaps across teams
 */
export function identifyCommonGaps(
  dimensionAggregates: DimensionAggregate[],
  teamRollups: TeamRollup[],
  threshold: number = 50  // % of teams below satisfactory
): CommonGap[] {
  const totalTeams = teamRollups.length;
  const gaps: CommonGap[] = [];

  dimensionAggregates.forEach(agg => {
    // Count teams below satisfactory (healthScore < 45 = Below Average in CHS)
    const affectedTeamIds: string[] = [];

    teamRollups.forEach(rollup => {
      const dim = rollup.assessmentResult.dimensions.find(d => d.dimensionKey === agg.dimensionKey);
      if (dim && dim.healthScore < 45) {
        affectedTeamIds.push(rollup.teamId);
      }
    });

    const percentageAffected = (affectedTeamIds.length / totalTeams) * 100;

    if (percentageAffected >= threshold / 2) {  // At least some significant portion
      gaps.push({
        gapId: `gap-${agg.dimensionKey}`,
        dimensionKey: agg.dimensionKey,
        dimensionName: agg.dimensionName,
        title: `${agg.dimensionName} needs improvement`,
        description: `${affectedTeamIds.length} of ${totalTeams} teams are below satisfactory levels`,
        affectedTeamCount: affectedTeamIds.length,
        affectedTeamIds,
        percentageOfTeams: Math.round(percentageAffected),
        averageGapSeverity: agg.averageHealthScore,
        isSystemicIssue: percentageAffected >= 50,
        portfolioRecommendation: `Consider portfolio-wide initiative to address ${agg.dimensionName.toLowerCase()}`,
      });
    }
  });

  // Sort by percentage of teams affected
  return gaps.sort((a, b) => b.percentageOfTeams - a.percentageOfTeams);
}

/**
 * Identify trending dimensions across the portfolio
 */
export function identifyTrendingDimensions(
  dimensionAggregates: DimensionAggregate[],
  teamRollups: TeamRollup[]
): TrendingDimension[] {
  const trending: TrendingDimension[] = [];

  dimensionAggregates.forEach(agg => {
    const totalTeams = agg.teamsImproving + agg.teamsStable + agg.teamsDeclining;

    // If more than 30% of teams moving in same direction
    const improvingPct = (agg.teamsImproving / totalTeams) * 100;
    const decliningPct = (agg.teamsDeclining / totalTeams) * 100;

    if (improvingPct >= 30) {
      const movers = teamRollups
        .map(rollup => {
          const dim = rollup.assessmentResult.dimensions.find(d => d.dimensionKey === agg.dimensionKey);
          if (dim && dim.trend === 'improving') {
            return {
              teamId: rollup.teamId,
              teamName: rollup.teamName,
              movement: 10, // Mock movement value
            };
          }
          return null;
        })
        .filter((m): m is { teamId: string; teamName: string; movement: number } => m !== null)
        .slice(0, 5);

      trending.push({
        dimensionKey: agg.dimensionKey,
        dimensionName: agg.dimensionName,
        direction: 'improving',
        teamsMoving: agg.teamsImproving,
        percentageOfTeams: Math.round(improvingPct),
        averageMovement: 10,
        biggestMovers: movers,
      });
    } else if (decliningPct >= 30) {
      const movers = teamRollups
        .map(rollup => {
          const dim = rollup.assessmentResult.dimensions.find(d => d.dimensionKey === agg.dimensionKey);
          if (dim && dim.trend === 'declining') {
            return {
              teamId: rollup.teamId,
              teamName: rollup.teamName,
              movement: -10,
            };
          }
          return null;
        })
        .filter((m): m is { teamId: string; teamName: string; movement: number } => m !== null)
        .slice(0, 5);

      trending.push({
        dimensionKey: agg.dimensionKey,
        dimensionName: agg.dimensionName,
        direction: 'declining',
        teamsMoving: agg.teamsDeclining,
        percentageOfTeams: Math.round(decliningPct),
        averageMovement: -10,
        biggestMovers: movers,
      });
    }
  });

  return trending.sort((a, b) => b.percentageOfTeams - a.percentageOfTeams);
}

/**
 * Detect high performer patterns
 */
export function detectHighPerformerPatterns(
  teamRollups: TeamRollup[]
): PerformancePattern[] {
  // Get top 25% of teams by health score
  const sortedTeams = [...teamRollups].sort((a, b) => b.overallHealthScore - a.overallHealthScore);
  const topQuartile = sortedTeams.slice(0, Math.ceil(sortedTeams.length * 0.25));

  if (topQuartile.length < 2) return [];

  // Find dimensions where top performers consistently score well
  const patterns: PerformancePattern[] = [];

  if (topQuartile.length > 0) {
    const firstResult = topQuartile[0].assessmentResult;
    const dimensionKeys = firstResult.dimensions.map(d => d.dimensionKey);

    const correlations = dimensionKeys.map(key => {
      const topTeamPercentiles = topQuartile.map(r => {
        const dim = r.assessmentResult.dimensions.find(d => d.dimensionKey === key);
        return dim?.overallPercentile || 0;
      });

      const avgPercentile = calculateMean(topTeamPercentiles);
      const dim = firstResult.dimensions.find(d => d.dimensionKey === key);

      return {
        dimensionKey: key,
        dimensionName: dim?.dimensionName || key,
        correlationStrength: avgPercentile / 100,
      };
    });

    // Sort by correlation strength and take top 3
    const strongCorrelations = correlations
      .sort((a, b) => b.correlationStrength - a.correlationStrength)
      .slice(0, 3);

    if (strongCorrelations.length > 0) {
      patterns.push({
        patternId: 'pattern-high-performers',
        title: 'High Performer Pattern',
        description: 'Top-performing teams excel in these dimensions consistently',
        correlatedDimensions: strongCorrelations,
        exemplarTeamIds: topQuartile.map(t => t.teamId),
        exemplarTeamNames: topQuartile.map(t => t.teamName),
      });
    }
  }

  return patterns;
}

/**
 * Generate complete cross-team analysis
 */
export function generateCrossTeamAnalysis(
  teamRollups: TeamRollup[],
  dimensionAggregates: DimensionAggregate[]
): CrossTeamAnalysis {
  const comparisonMatrix = generateComparisonMatrix(teamRollups);
  const commonGaps = identifyCommonGaps(dimensionAggregates, teamRollups);
  const trendingDimensions = identifyTrendingDimensions(dimensionAggregates, teamRollups);
  const highPerformerPatterns = detectHighPerformerPatterns(teamRollups);

  // Calculate overall variance
  const scores = teamRollups.map(r => r.overallHealthScore);
  const portfolioVariance = calculateVariance(scores);

  // Find most/least consistent dimensions
  const sortedByVariance = [...dimensionAggregates].sort((a, b) => a.standardDeviation - b.standardDeviation);
  const mostConsistentDimension = sortedByVariance[0]?.dimensionKey || '';
  const leastConsistentDimension = sortedByVariance[sortedByVariance.length - 1]?.dimensionKey || '';

  return {
    comparisonMatrix,
    highPerformerPatterns,
    commonGaps,
    trendingDimensions,
    portfolioVariance: Math.round(portfolioVariance),
    mostConsistentDimension,
    leastConsistentDimension,
  };
}

// ============================================
// Portfolio Summary Generation
// ============================================

/**
 * Generate portfolio-level recommendations
 */
export function generatePortfolioRecommendations(
  dimensionAggregates: DimensionAggregate[],
  commonGaps: CommonGap[]
): { quickWins: PortfolioRecommendation[]; topPriorities: PortfolioRecommendation[] } {
  const quickWins: PortfolioRecommendation[] = [];
  const topPriorities: PortfolioRecommendation[] = [];

  // Generate recommendations based on common gaps
  commonGaps.forEach((gap, index) => {
    const recommendation: PortfolioRecommendation = {
      id: `portfolio-rec-${gap.gapId}`,
      title: `Address ${gap.dimensionName} across teams`,
      description: gap.portfolioRecommendation,
      category: 'process',
      effort: gap.affectedTeamCount > 5 ? 'high' : 'medium',
      impact: gap.isSystemicIssue ? 'high' : 'medium',
      affectedTeamCount: gap.affectedTeamCount,
      affectedTeamIds: gap.affectedTeamIds,
      sourceDimensionKey: gap.dimensionKey,
      sourceDimensionName: gap.dimensionName,
      aggregatedImpact: gap.isSystemicIssue ? 'critical' : 'high',
    };

    if (recommendation.effort === 'medium' || recommendation.effort === 'low') {
      quickWins.push(recommendation);
    } else {
      topPriorities.push(recommendation);
    }
  });

  return {
    quickWins: quickWins.slice(0, 5),
    topPriorities: topPriorities.slice(0, 5),
  };
}

/**
 * Generate portfolio summary from team results
 */
export function generatePortfolioSummary(
  teamRollups: TeamRollup[],
  dimensionAggregates: DimensionAggregate[],
  crossTeamAnalysis: CrossTeamAnalysis
): PortfolioSummary {
  const healthScores = teamRollups.map(r => r.overallHealthScore);
  const trends = teamRollups.map(r => {
    // Get overall trend from dimensions
    const dimTrends = r.assessmentResult.dimensions.map(d => d.trend);
    return getAggregateTrend(dimTrends);
  });

  const trendCounts = countTrends(trends);
  const avgScore = calculateMean(healthScores);
  const distribution = calculateHealthScoreDistribution(healthScores);

  const { quickWins, topPriorities } = generatePortfolioRecommendations(
    dimensionAggregates,
    crossTeamAnalysis.commonGaps
  );

  const maturityLevel = getMaturityLevel(avgScore);
  const maturityConfig = getMaturityLevelConfig(avgScore);

  return {
    teamCount: teamRollups.length,
    overallHealthScore: Math.round(avgScore),
    overallMaturityLevel: maturityLevel,
    overallMaturityName: maturityConfig.name,
    healthScoreDistribution: distribution,
    teamsImproving: trendCounts.improving,
    teamsDeclining: trendCounts.declining,
    teamsStable: trendCounts.stable,
    dimensionAggregates,
    commonQuickWins: quickWins,
    topPriorities,
  };
}

// ============================================
// Executive Summary Generation
// ============================================

/**
 * Generate leadership insights
 */
export function generateLeadershipInsights(
  portfolioSummary: PortfolioSummary,
  crossTeamAnalysis: CrossTeamAnalysis,
  teamRollups: TeamRollup[]
): LeadershipInsight[] {
  const insights: LeadershipInsight[] = [];

  // Positive insight for improving teams
  if (portfolioSummary.teamsImproving > portfolioSummary.teamsDeclining) {
    insights.push({
      id: 'insight-improving-teams',
      type: 'positive',
      title: 'Portfolio Health Improving',
      description: `${portfolioSummary.teamsImproving} of ${portfolioSummary.teamCount} teams are showing improvement`,
      affectedTeamIds: [],
      affectedTeamNames: [],
      suggestedAction: 'Continue current initiatives and share best practices',
      actionPriority: 'medium',
    });
  }

  // Concern for declining teams
  if (portfolioSummary.teamsDeclining > 0) {
    const decliningTeams = teamRollups.filter(r => {
      const dimTrends = r.assessmentResult.dimensions.map(d => d.trend);
      return getAggregateTrend(dimTrends) === 'declining';
    });

    insights.push({
      id: 'insight-declining-teams',
      type: 'concern',
      title: 'Teams Requiring Attention',
      description: `${portfolioSummary.teamsDeclining} teams are showing decline in Jira health`,
      affectedTeamIds: decliningTeams.map(t => t.teamId),
      affectedTeamNames: decliningTeams.map(t => t.teamName),
      suggestedAction: 'Schedule health check sessions with affected teams',
      actionPriority: 'high',
    });
  }

  // Opportunity for systemic gaps
  const systemicGaps = crossTeamAnalysis.commonGaps.filter(g => g.isSystemicIssue);
  if (systemicGaps.length > 0) {
    const gap = systemicGaps[0];
    insights.push({
      id: 'insight-systemic-gap',
      type: 'opportunity',
      title: 'Portfolio-Wide Improvement Opportunity',
      description: `${gap.dimensionName} is a common challenge across ${gap.percentageOfTeams}% of teams`,
      affectedTeamIds: gap.affectedTeamIds,
      affectedTeamNames: [],
      relatedDimensionKey: gap.dimensionKey,
      relatedDimensionName: gap.dimensionName,
      suggestedAction: gap.portfolioRecommendation,
      actionPriority: 'high',
    });
  }

  return insights.slice(0, 5);
}

/**
 * Generate investment priorities
 */
export function generateInvestmentPriorities(
  crossTeamAnalysis: CrossTeamAnalysis,
  portfolioSummary: PortfolioSummary
): InvestmentPriority[] {
  return crossTeamAnalysis.commonGaps.slice(0, 3).map((gap, index) => ({
    id: `priority-${gap.gapId}`,
    dimensionKey: gap.dimensionKey,
    dimensionName: gap.dimensionName,
    title: `Improve ${gap.dimensionName}`,
    rationale: `${gap.affectedTeamCount} teams are below target, impacting overall portfolio health`,
    teamsImpacted: gap.affectedTeamCount,
    estimatedImpact: gap.isSystemicIssue ? 'transformative' : 'significant',
    suggestedApproach: gap.portfolioRecommendation,
  }));
}

/**
 * Generate portfolio risk summary
 */
export function generatePortfolioRiskSummary(
  teamRollups: TeamRollup[],
  crossTeamAnalysis: CrossTeamAnalysis
): PortfolioRiskSummary {
  // Find high-risk teams (score < 30 = Needs Attention in CHS)
  const highRiskTeams = teamRollups
    .filter(r => r.overallHealthScore < 30)
    .map(r => {
      // Find their biggest gap
      const lowestDim = r.assessmentResult.dimensions
        .sort((a, b) => (a.healthScore ?? a.overallPercentile) - (b.healthScore ?? b.overallPercentile))[0];

      return {
        teamId: r.teamId,
        teamName: r.teamName,
        primaryConcern: lowestDim?.dimensionName || 'Overall health',
      };
    });

  // Systemic risks from common gaps
  const systemicRisks = crossTeamAnalysis.commonGaps
    .filter(g => g.isSystemicIssue)
    .map(g => ({
      riskId: `risk-${g.gapId}`,
      title: `Systemic ${g.dimensionName} Gap`,
      description: `${g.percentageOfTeams}% of teams affected`,
      affectedTeamCount: g.affectedTeamCount,
    }));

  return {
    criticalRiskCount: highRiskTeams.length,
    highRiskTeams,
    systemicRisks,
  };
}

/**
 * Generate complete executive summary
 */
export function generateExecutiveSummary(
  portfolioSummary: PortfolioSummary,
  crossTeamAnalysis: CrossTeamAnalysis,
  teamRollups: TeamRollup[]
): PortfolioExecutiveSummary {
  const insights = generateLeadershipInsights(portfolioSummary, crossTeamAnalysis, teamRollups);
  const investmentPriorities = generateInvestmentPriorities(crossTeamAnalysis, portfolioSummary);
  const riskSummary = generatePortfolioRiskSummary(teamRollups, crossTeamAnalysis);

  // Determine overall trend
  let healthTrend: TrendDirection = 'stable';
  if (portfolioSummary.teamsImproving > portfolioSummary.teamsDeclining) {
    healthTrend = 'improving';
  } else if (portfolioSummary.teamsDeclining > portfolioSummary.teamsImproving) {
    healthTrend = 'declining';
  }

  return {
    headline: {
      healthScore: portfolioSummary.overallHealthScore,
      healthTrend,
      teamsAssessed: portfolioSummary.teamCount,
      criticalGapsCount: crossTeamAnalysis.commonGaps.filter(g => g.isSystemicIssue).length,
    },
    insights,
    investmentPriorities,
    riskSummary,
  };
}

// ============================================
// Full Multi-Team Assessment Generation
// ============================================

/**
 * Generate complete multi-team assessment result
 */
export function generateMultiTeamAssessmentResult(
  id: string,
  name: string,
  scope: ScopeSelection,
  teamResults: AssessmentResult[],
  dateRange: { startDate: string; endDate: string },
  configurationStrategy: ConfigurationStrategy,
  sharedSettings: {
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
    step6: Step6Data;
  }
): MultiTeamAssessmentResult {
  // Generate team rollups with rankings
  const teamRollups = generateTeamRollups(teamResults);

  // Aggregate dimensions
  const dimensionAggregates = aggregateAllDimensions(teamResults);

  // Cross-team analysis
  const crossTeamAnalysis = generateCrossTeamAnalysis(teamRollups, dimensionAggregates);

  // Portfolio summary
  const portfolioSummary = generatePortfolioSummary(teamRollups, dimensionAggregates, crossTeamAnalysis);

  // Executive summary
  const executiveSummary = generateExecutiveSummary(portfolioSummary, crossTeamAnalysis, teamRollups);

  return {
    id,
    name,
    scope,
    generatedAt: new Date().toISOString(),
    dateRange,
    portfolioSummary,
    teamResults: teamRollups,
    crossTeamAnalysis,
    executiveSummary,
    configurationStrategy,
    sharedSettings,
  };
}
