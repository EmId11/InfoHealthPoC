// CHS to Impact Data Adapter
// Converts CHS (Composite Health Score) data to the format expected by Impact UI components

import {
  PortfolioImpactSummary,
  TeamProgressContext,
  TeamPosition,
  ImpactFlow,
  ImpactFlowNode,
  ImpactFlowLink,
  DimensionImpact,
  PortfolioOutcomeImpact,
} from '../types/impactMeasurement';
import {
  PortfolioCHSSummary,
  CHSResult,
  getCHSCategoryLabel,
} from '../types/progressScore';
import { CPS_INDICATORS } from './mockCPSData';

// Indicator to Dimension mapping
const INDICATOR_DIMENSION_MAP: Record<string, string> = {
  workCarriedOver: 'Delivery',
  throughputVariability: 'Delivery',
  lastDayCompletions: 'Delivery',
  acceptanceCriteria: 'Process Maturity',
  storyEstimationRate: 'Process Maturity',
  policyExclusions: 'Process Maturity',
  avgCommentsPerIssue: 'Collaboration',
  singleContributorIssueRate: 'Collaboration',
  siloedWorkItems: 'Collaboration',
  firstTimePassRate: 'Quality',
  staleWorkItems: 'Quality',
  midSprintCreations: 'Predictability',
  jiraUpdateFrequency: 'Predictability',
};

// Dimension to Outcome mapping
const DIMENSION_OUTCOME_MAP: Record<string, string[]> = {
  'Delivery': ['Predictable Delivery', 'Planning Accuracy'],
  'Process Maturity': ['Sprint Health', 'Team Alignment'],
  'Collaboration': ['Team Health', 'Knowledge Sharing'],
  'Quality': ['Technical Excellence'],
  'Predictability': ['Planning Accuracy', 'Sprint Health'],
};

/**
 * Convert CHS results to PortfolioImpactSummary format
 * This allows the existing UI components to display CHS data
 */
export function convertCHSToImpactSummary(
  beforeCHS: PortfolioCHSSummary,
  afterCHS: PortfolioCHSSummary,
  yourTeamId?: string
): PortfolioImpactSummary {
  const beforeTeams = beforeCHS.teams;
  const afterTeams = afterCHS.teams;

  const yourTeamBefore = yourTeamId
    ? beforeTeams.find(t => t.teamId === yourTeamId) || beforeTeams[0]
    : beforeTeams[0];
  const yourTeamAfter = yourTeamId
    ? afterTeams.find(t => t.teamId === yourTeamId) || afterTeams[0]
    : afterTeams[0];

  // Sort teams by CHS for rank calculations
  const sortedAfter = [...afterTeams].sort((a, b) => b.chs - a.chs);
  const sortedBefore = [...beforeTeams].sort((a, b) => b.chs - a.chs);

  const yourTeamRankAfter = sortedAfter.findIndex(t => t.teamId === yourTeamAfter.teamId) + 1;
  const yourTeamRankBefore = sortedBefore.findIndex(t => t.teamId === yourTeamBefore.teamId) + 1;

  // Convert team positions for TeamProgressComparison
  const teamPositions: TeamPosition[] = afterTeams.map(team => {
    const beforeTeam = beforeTeams.find(t => t.teamId === team.teamId);
    const beforeScore = beforeTeam?.chs || 50;
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      beforeHealthScore: beforeScore,  // Using CHS as the score (0-100)
      afterHealthScore: team.chs,
      change: team.chs - beforeScore,
    };
  });

  // Calculate team progress context
  const changes = teamPositions.map(t => t.change);
  const yourChange = yourTeamAfter.chs - yourTeamBefore.chs;
  const sortedChanges = [...changes].sort((a, b) => a - b);
  const healthScoreRankOfYourChange = Math.round(
    (sortedChanges.filter(c => c <= yourChange).length / changes.length) * 100
  );

  const teamProgressContext: TeamProgressContext = {
    yourChange,
    similarTeamsChanges: changes,
    healthScoreRankOfYourChange,
    averageChange: changes.reduce((a, b) => a + b, 0) / changes.length,
    medianChange: sortedChanges[Math.floor(sortedChanges.length / 2)],
    improvedTeamsCount: teamPositions.filter(t => t.change > 5).length,
    declinedTeamsCount: teamPositions.filter(t => t.change < -5).length,
    totalTeams: afterTeams.length,
    teamPositions,
  };

  // Build impact flow from CHS indicator contributions
  const impactFlow = buildImpactFlowFromCHS(yourTeamAfter);

  // Build dimension impacts
  const impactByDimension = buildDimensionImpacts(yourTeamBefore, yourTeamAfter);

  // Build outcome impacts
  const impactByOutcome = buildOutcomeImpacts(yourTeamBefore, yourTeamAfter);

  // Calculate confidence score from CHS standard error
  // Lower SE = higher confidence
  const seNormalized = Math.min(1, yourTeamAfter.standardError / 15);
  const confidenceScore = Math.round((1 - seNormalized) * 100);

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return {
    // Aggregate metrics
    totalNetImpact: yourChange,
    activePlansCount: 1,
    plansWithPositiveImpact: yourChange > 0 ? 1 : 0,
    plansWithMeasuredImpact: 1,
    avgConfidenceScore: confidenceScore,
    confidenceBreakdown: {
      dataCoverage: Math.round(yourTeamAfter.indicatorCoverage * 100),
      sampleSize: Math.min(100, afterTeams.length * 2),
      effectMagnitude: Math.min(100, Math.abs(yourChange) * 3),
      attributionClarity: 70,
    },

    // Impact breakdowns
    impactByOutcome,
    impactByDimension,

    // Leaderboards (simplified)
    topPerformingPlans: [],
    topImpactPlays: [],

    // Before/after context - THIS IS KEY FOR THE HERO SECTION
    baselineAverageHealthScore: yourTeamBefore.chs,
    currentAverageHealthScore: yourTeamAfter.chs,
    baselineAverageRank: yourTeamRankBefore,
    currentAverageRank: yourTeamRankAfter,
    totalTeamsInComparison: afterTeams.length,

    // Date context
    baselineDate: beforeCHS.calculatedAt,
    measurementDate: afterCHS.calculatedAt,

    // Team progress context
    teamProgressContext,

    // Impact flow
    impactFlow,

    // Include CHS results for additional UI needs
    chsResults: {
      before: beforeCHS,
      after: afterCHS,
      yourTeamBefore,
      yourTeamAfter,
    },

    // Metadata
    generatedAt: now.toISOString(),
  };
}

/**
 * Build ImpactFlow structure from CHS indicator contributions
 */
function buildImpactFlowFromCHS(team: CHSResult): ImpactFlow {
  const nodes: ImpactFlowNode[] = [];
  const links: ImpactFlowLink[] = [];

  // Track dimensions and outcomes
  const dimensionContributions: Record<string, number> = {};
  const outcomeContributions: Record<string, number> = {};

  // 1. Create indicator nodes from CSS z-scores
  const contributions = team.css.indicatorZScores;
  for (const indicator of CPS_INDICATORS) {
    const contribution = contributions.find(c => c.indicatorId === indicator.id);
    const impactValue = contribution ? contribution.weightedContribution * 10 : 0; // Scale for display
    const dimension = INDICATOR_DIMENSION_MAP[indicator.id];

    nodes.push({
      id: `indicator-${indicator.id}`,
      type: 'indicator',
      name: indicator.name,
      impactValue,
      impactUnit: ' pts',
      parentIds: [],
      childIds: dimension ? [`dimension-${dimension.toLowerCase().replace(/ /g, '-')}`] : [],
    });

    // Accumulate dimension contribution
    if (dimension) {
      dimensionContributions[dimension] = (dimensionContributions[dimension] || 0) + impactValue;
    }
  }

  // 2. Create dimension nodes
  const dimensions = ['Delivery', 'Process Maturity', 'Collaboration', 'Quality', 'Predictability'];
  for (const dim of dimensions) {
    const dimId = `dimension-${dim.toLowerCase().replace(/ /g, '-')}`;
    const dimImpact = dimensionContributions[dim] || 0;
    const outcomes = DIMENSION_OUTCOME_MAP[dim] || [];

    nodes.push({
      id: dimId,
      type: 'dimension',
      name: dim,
      impactValue: dimImpact,
      impactUnit: ' pts',
      beforeValue: 50,
      afterValue: 50 + dimImpact,
      parentIds: CPS_INDICATORS
        .filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim)
        .map(i => `indicator-${i.id}`),
      childIds: outcomes.map(o => `outcome-${o.toLowerCase().replace(/ /g, '-')}`),
    });

    // Accumulate outcome contributions
    for (const outcome of outcomes) {
      outcomeContributions[outcome] = (outcomeContributions[outcome] || 0) + dimImpact / outcomes.length;
    }
  }

  // 3. Create outcome nodes
  const allOutcomes = Array.from(new Set(Object.values(DIMENSION_OUTCOME_MAP).flat()));
  for (const outcome of allOutcomes) {
    const outcomeId = `outcome-${outcome.toLowerCase().replace(/ /g, '-')}`;
    const outcomeImpact = outcomeContributions[outcome] || 0;
    const parentDims = dimensions.filter(d => DIMENSION_OUTCOME_MAP[d]?.includes(outcome));

    nodes.push({
      id: outcomeId,
      type: 'outcome',
      name: outcome,
      impactValue: outcomeImpact,
      impactUnit: ' pts',
      beforeValue: 50,
      afterValue: 50 + outcomeImpact,
      parentIds: parentDims.map(d => `dimension-${d.toLowerCase().replace(/ /g, '-')}`),
      childIds: [],
    });
  }

  // 4. Create links
  for (const node of nodes) {
    for (const childId of node.childIds) {
      const childNode = nodes.find(n => n.id === childId);
      if (childNode) {
        links.push({
          source: node.id,
          target: childId,
          value: Math.abs(node.impactValue),
          weight: 0.3,
        });
      }
    }
  }

  return { nodes, links };
}

/**
 * Build dimension impacts from CHS data
 */
function buildDimensionImpacts(beforeTeam: CHSResult, afterTeam: CHSResult): DimensionImpact[] {
  const dimensions = ['Delivery', 'Process Maturity', 'Collaboration', 'Quality', 'Predictability'];

  return dimensions.map(dim => {
    const dimIndicators = CPS_INDICATORS.filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim);

    // Calculate before and after dimension scores from CSS z-scores
    const beforeContributions = beforeTeam.css.indicatorZScores;
    const afterContributions = afterTeam.css.indicatorZScores;

    const beforeTotal = dimIndicators.reduce((sum, indicator) => {
      const contrib = beforeContributions.find(c => c.indicatorId === indicator.id);
      return sum + (contrib ? contrib.zScore * 10 + 50 : 50);
    }, 0) / dimIndicators.length;

    const afterTotal = dimIndicators.reduce((sum, indicator) => {
      const contrib = afterContributions.find(c => c.indicatorId === indicator.id);
      return sum + (contrib ? contrib.zScore * 10 + 50 : 50);
    }, 0) / dimIndicators.length;

    return {
      dimensionKey: dim.toLowerCase().replace(/ /g, '-'),
      dimensionName: dim,
      baselineHealthScore: beforeTotal,
      currentHealthScore: afterTotal,
      healthScoreChange: afterTotal - beforeTotal,
      baselineRank: 25,
      currentRank: Math.max(1, 25 - Math.round((afterTotal - beforeTotal) / 2)),
      totalTeams: 47,
      contributingPlays: [],
    };
  });
}

/**
 * Build outcome impacts from CHS data
 */
function buildOutcomeImpacts(beforeTeam: CHSResult, afterTeam: CHSResult): PortfolioOutcomeImpact[] {
  const allOutcomes = Array.from(new Set(Object.values(DIMENSION_OUTCOME_MAP).flat()));

  return allOutcomes.map(outcome => {
    // Find dimensions that affect this outcome
    const affectingDims = Object.entries(DIMENSION_OUTCOME_MAP)
      .filter(([_, outcomes]) => outcomes.includes(outcome))
      .map(([dim]) => dim);

    // Calculate before/after scores
    let beforeTotal = 0;
    let afterTotal = 0;

    for (const dim of affectingDims) {
      const dimIndicators = CPS_INDICATORS.filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim);

      const beforeContributions = beforeTeam.css.indicatorZScores;
      const afterContributions = afterTeam.css.indicatorZScores;

      for (const indicator of dimIndicators) {
        const beforeContrib = beforeContributions.find(c => c.indicatorId === indicator.id);
        const afterContrib = afterContributions.find(c => c.indicatorId === indicator.id);

        beforeTotal += beforeContrib ? beforeContrib.zScore * 10 + 50 : 50;
        afterTotal += afterContrib ? afterContrib.zScore * 10 + 50 : 50;
      }
    }

    const numIndicators = affectingDims.reduce((sum, dim) =>
      sum + CPS_INDICATORS.filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim).length, 0);

    beforeTotal = beforeTotal / (numIndicators || 1);
    afterTotal = afterTotal / (numIndicators || 1);

    return {
      outcomeId: outcome.toLowerCase().replace(/ /g, '-'),
      outcomeName: outcome,
      baselineScore: beforeTotal,
      currentScore: afterTotal,
      totalImpact: afterTotal - beforeTotal,
      plansContributing: 1,
    };
  });
}
