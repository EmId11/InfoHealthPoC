// Mock CHS Data Generator
// Generates realistic team data for CHS demonstration

import {
  CHSResult,
  PortfolioCHSSummary,
  BaselineNorms,
  CHSWeightPreset,
  getCHSWeightsForPreset,
  getCHSCategory,
} from '../types/progressScore';
import { CPS_INDICATORS } from './mockCPSData';
import {
  calculateCSS,
  calculateTRS,
  calculatePGS,
  calculateCHS,
  createBaselineGroups,
  generateBaselineNorms,
} from './compositeHealthScore';

// ============================================
// Team Data Generation
// ============================================

// 47 realistic team names
const TEAM_NAMES = [
  'Platform Core', 'Mobile Squad', 'Frontend Guild', 'API Gateway',
  'Data Pipeline', 'Auth Team', 'Payments', 'Search Engine',
  'Analytics Hub', 'DevOps Core', 'Infrastructure', 'QA Automation',
  'Release Team', 'Security Ops', 'Cloud Services', 'Integration',
  'Notifications', 'User Profile', 'Content Team', 'Recommendations',
  'Checkout Flow', 'Inventory', 'Shipping Logic', 'Customer Support',
  'Admin Panel', 'Reporting', 'Audit Trail', 'Compliance',
  'Partner API', 'Webhooks', 'Event Bus', 'Cache Layer',
  'CDN Team', 'Image Processing', 'Video Streaming', 'Chat Service',
  'Email Service', 'SMS Gateway', 'Push Notifications', 'Scheduler',
  'Background Jobs', 'Rate Limiter', 'Feature Flags', 'A/B Testing',
  'Monitoring', 'Logging', 'Alerting',
];

/**
 * Generate random value with realistic distribution
 */
function generateIndicatorValue(
  indicatorId: string,
  teamPerformanceBias: number // -1 (poor) to +1 (excellent)
): number {
  // Base values and ranges for each indicator
  const indicatorRanges: Record<string, { mean: number; stdDev: number; min: number; max: number }> = {
    acceptanceCriteria: { mean: 65, stdDev: 15, min: 20, max: 100 },
    firstTimePassRate: { mean: 72, stdDev: 12, min: 30, max: 100 },
    storyEstimationRate: { mean: 70, stdDev: 18, min: 15, max: 100 },
    workCarriedOver: { mean: 25, stdDev: 12, min: 0, max: 60 },
    midSprintCreations: { mean: 18, stdDev: 10, min: 0, max: 50 },
    staleWorkItems: { mean: 12, stdDev: 8, min: 0, max: 40 },
    avgCommentsPerIssue: { mean: 2.5, stdDev: 1.2, min: 0, max: 8 },
    singleContributorIssueRate: { mean: 35, stdDev: 15, min: 5, max: 80 },
    throughputVariability: { mean: 30, stdDev: 12, min: 5, max: 60 },
    siloedWorkItems: { mean: 20, stdDev: 10, min: 0, max: 50 },
    jiraUpdateFrequency: { mean: 3.5, stdDev: 1.5, min: 0.5, max: 10 },
    lastDayCompletions: { mean: 28, stdDev: 12, min: 5, max: 60 },
    policyExclusions: { mean: 8, stdDev: 5, min: 0, max: 25 },
  };

  const range = indicatorRanges[indicatorId];
  if (!range) return 50;

  const indicator = CPS_INDICATORS.find(i => i.id === indicatorId);
  const direction = indicator?.directionality || 1;

  // Apply team performance bias (positive bias helps high-is-better indicators)
  const biasEffect = teamPerformanceBias * range.stdDev * 0.8 * direction;

  // Generate value with normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const value = range.mean + (normalRandom * range.stdDev) + biasEffect;

  return Math.max(range.min, Math.min(range.max, value));
}

/**
 * Generate a complete team's indicator values with trajectory
 */
function generateTeamData(
  teamId: string,
  teamName: string,
  performanceBias: number, // Overall team quality
  trajectoryBias: number   // Improvement direction
): {
  current: Record<string, number>;
  early: Record<string, number>;
  recent: Record<string, number>;
  pooledStdDevs: Record<string, number>;
} {
  const current: Record<string, number> = {};
  const early: Record<string, number> = {};
  const recent: Record<string, number> = {};
  const pooledStdDevs: Record<string, number> = {};

  for (const indicator of CPS_INDICATORS) {
    // Generate current value
    current[indicator.id] = generateIndicatorValue(indicator.id, performanceBias);

    // Generate early and recent values for trajectory
    // Early is before improvement, recent is after
    const improvementEffect = trajectoryBias * 8 * indicator.directionality;

    early[indicator.id] = generateIndicatorValue(indicator.id, performanceBias - trajectoryBias * 0.3);
    recent[indicator.id] = generateIndicatorValue(indicator.id, performanceBias + trajectoryBias * 0.3);

    // Pooled standard deviation (approximation)
    pooledStdDevs[indicator.id] = Math.abs(recent[indicator.id] - early[indicator.id]) / 2 + 5;
  }

  return { current, early, recent, pooledStdDevs };
}

// ============================================
// Mock Portfolio Generator
// ============================================

/**
 * Generate a complete mock CHS portfolio with 47 teams
 */
export function generateMockCHSPortfolio(
  weightPreset: CHSWeightPreset = 'balanced',
  yourTeamIndex: number = 0
): PortfolioCHSSummary {
  const weights = getCHSWeightsForPreset(weightPreset);

  // Generate teams with varied performance levels
  // Distribution: ~15% excellent, ~25% good, ~35% average, ~20% below average, ~5% needs attention
  const teamProfiles = TEAM_NAMES.map((name, i) => {
    let performanceBias: number;
    let trajectoryBias: number;

    // Create realistic distribution
    const rand = Math.random();
    if (rand < 0.05) {
      // Needs attention (5%)
      performanceBias = -0.8 + Math.random() * 0.3;
      trajectoryBias = -0.3 + Math.random() * 0.4;
    } else if (rand < 0.25) {
      // Below average (20%)
      performanceBias = -0.4 + Math.random() * 0.4;
      trajectoryBias = -0.1 + Math.random() * 0.4;
    } else if (rand < 0.60) {
      // Average (35%)
      performanceBias = -0.2 + Math.random() * 0.4;
      trajectoryBias = 0 + Math.random() * 0.4;
    } else if (rand < 0.85) {
      // Good (25%)
      performanceBias = 0.2 + Math.random() * 0.4;
      trajectoryBias = 0.1 + Math.random() * 0.4;
    } else {
      // Excellent (15%)
      performanceBias = 0.5 + Math.random() * 0.3;
      trajectoryBias = 0.2 + Math.random() * 0.5;
    }

    // Make "your team" have good performance for demo purposes
    if (i === yourTeamIndex) {
      performanceBias = 0.4;
      trajectoryBias = 0.5;
    }

    return {
      teamId: `team-${i}`,
      teamName: name,
      performanceBias,
      trajectoryBias,
    };
  });

  // Generate indicator data for all teams
  const teamsData = teamProfiles.map(profile => {
    const data = generateTeamData(
      profile.teamId,
      profile.teamName,
      profile.performanceBias,
      profile.trajectoryBias
    );

    // Calculate baseline CSS (for grouping)
    const baselineCSS = 50 + profile.performanceBias * 15;

    return {
      teamId: profile.teamId,
      teamName: profile.teamName,
      currentIndicatorValues: data.current,
      earlyPeriodValues: data.early,
      recentPeriodValues: data.recent,
      pooledStdDevs: data.pooledStdDevs,
      baselineCSS,
    };
  });

  // Generate baseline norms from all teams
  const baselineNorms = generateBaselineNorms(
    teamsData.map(t => t.currentIndicatorValues)
  );

  // Build indicator maps
  const indicatorWeights: Record<string, number> = {};
  const indicatorDirectionality: Record<string, 1 | -1> = {};
  for (const indicator of CPS_INDICATORS) {
    indicatorWeights[indicator.id] = indicator.weight;
    indicatorDirectionality[indicator.id] = indicator.directionality;
  }

  // Create baseline groups for PGS
  const baselineGroups = createBaselineGroups(
    teamsData.map(t => ({ teamId: t.teamId, baselineCSS: t.baselineCSS })),
    teamsData.length
  );

  // Calculate TRS for all teams first (needed for PGS)
  const allTeamsTRS = teamsData.map(team => {
    const trs = calculateTRS(
      team.earlyPeriodValues,
      team.recentPeriodValues,
      team.pooledStdDevs,
      indicatorWeights,
      indicatorDirectionality
    );
    return { teamId: team.teamId, trs: trs.raw };
  });

  // Calculate CHS for all teams
  const results: CHSResult[] = teamsData.map(team => {
    const css = calculateCSS(
      team.currentIndicatorValues,
      baselineNorms,
      indicatorWeights,
      indicatorDirectionality
    );

    const trs = calculateTRS(
      team.earlyPeriodValues,
      team.recentPeriodValues,
      team.pooledStdDevs,
      indicatorWeights,
      indicatorDirectionality
    );

    const teamBaselineGroup = baselineGroups.find(g => g.teamIds.includes(team.teamId));
    const pgs = teamBaselineGroup
      ? calculatePGS(team.teamId, trs.raw, allTeamsTRS, baselineGroups, teamBaselineGroup)
      : null;

    const { chs, standardError, confidenceInterval } = calculateCHS(css, trs, pgs, weights);
    const category = getCHSCategory(chs);

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      css,
      trs,
      pgs,
      chs,
      standardError,
      confidenceInterval,
      category,
      weights,
      weightPreset,
      indicatorCoverage: 1,
      wasReweighted: false,
      isProvisional: false,
      assessmentPeriodMonths: 6,
      calculatedAt: new Date().toISOString(),
    };
  });

  // Calculate aggregate statistics
  const chsValues = results.map(r => r.chs).sort((a, b) => a - b);
  const averageCHS = chsValues.reduce((a, b) => a + b, 0) / chsValues.length;
  const medianCHS = chsValues[Math.floor(chsValues.length / 2)];
  const variance = chsValues.reduce((sum, v) => sum + Math.pow(v - averageCHS, 2), 0) / chsValues.length;
  const stdDevCHS = Math.sqrt(variance);

  // Category distribution
  const categories: Array<CHSResult['category']> = [
    'excellent-health', 'good-health', 'average-health', 'below-average', 'needs-attention'
  ];
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
    excludedTeams: [],
    averageCHS,
    medianCHS,
    stdDevCHS,
    categoryDistribution,
    baselineGroups,
    groupingMethod: 'quintiles',
    weights,
    weightPreset,
    baselineNorms,
    totalTeams: results.length,
    includedTeams: results.length,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Get standard mock CHS portfolio (cached for performance)
 */
let cachedPortfolio: PortfolioCHSSummary | null = null;

export function getStandardCHSPortfolio(): PortfolioCHSSummary {
  if (!cachedPortfolio) {
    cachedPortfolio = generateMockCHSPortfolio('balanced', 0);
  }
  return cachedPortfolio;
}

/**
 * Generate before/after CHS data for Impact Tracker
 * This simulates having two CHS calculations: one at baseline, one at current
 */
export function generateImpactCHSData(
  yourTeamIndex: number = 0
): {
  before: PortfolioCHSSummary;
  after: PortfolioCHSSummary;
  yourTeamId: string;
} {
  // Generate "after" (current) portfolio
  const after = generateMockCHSPortfolio('balanced', yourTeamIndex);

  // Generate "before" portfolio with slightly lower scores
  // This simulates the team having improved
  const beforeTeams = after.teams.map(team => ({
    ...team,
    chs: Math.max(5, team.chs - (10 + Math.random() * 15)), // 10-25 point improvement
    css: {
      ...team.css,
      scaled: Math.max(5, team.css.scaled - (5 + Math.random() * 10)),
    },
    trs: {
      ...team.trs,
      scaled: Math.max(5, team.trs.scaled - (5 + Math.random() * 10)),
    },
  }));

  // Recalculate category for before scores
  const beforeResults: CHSResult[] = beforeTeams.map(team => ({
    ...team,
    category: getCHSCategory(team.chs),
    confidenceInterval: {
      lower: Math.max(5, team.chs - 1.645 * team.standardError),
      upper: Math.min(95, team.chs + 1.645 * team.standardError),
    },
  }));

  const beforeChsValues = beforeResults.map(r => r.chs).sort((a, b) => a - b);
  const beforeAverageCHS = beforeChsValues.reduce((a, b) => a + b, 0) / beforeChsValues.length;
  const beforeMedianCHS = beforeChsValues[Math.floor(beforeChsValues.length / 2)];

  const before: PortfolioCHSSummary = {
    ...after,
    teams: beforeResults,
    averageCHS: beforeAverageCHS,
    medianCHS: beforeMedianCHS,
    calculatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
  };

  return {
    before,
    after,
    yourTeamId: `team-${yourTeamIndex}`,
  };
}
