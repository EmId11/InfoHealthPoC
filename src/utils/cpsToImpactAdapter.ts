// CPS to Impact Data Adapter
// Converts CPS framework data to the format expected by existing Impact UI components

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
  PortfolioCPSSummary,
  CPSResult,
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
 * Convert CPS results to PortfolioImpactSummary format
 * This allows the existing UI components to display CPS data
 */
export function convertCPSToImpactSummary(
  cpsResults: PortfolioCPSSummary,
  yourTeamId?: string
): PortfolioImpactSummary {
  const teams = cpsResults.teams;
  const yourTeam = yourTeamId
    ? teams.find(t => t.teamId === yourTeamId) || teams[0]
    : teams[0];

  // Sort teams by CPS for rank calculations
  const sortedTeams = [...teams].sort((a, b) => b.cps - a.cps);
  const yourTeamRank = sortedTeams.findIndex(t => t.teamId === yourTeam.teamId) + 1;

  // Calculate baseline rank (where team would rank if CPS was 50)
  const teamsAbove50 = teams.filter(t => t.cps > 50).length;
  const baselineRank = Math.round(teams.length / 2); // Middle of the pack

  // Convert team positions for TeamProgressComparison
  const teamPositions: TeamPosition[] = teams.map(team => ({
    teamId: team.teamId,
    teamName: team.teamName,
    beforeHealthScore: 50, // CPS baseline is always 50
    afterHealthScore: team.cps,
    change: team.cps - 50,
  }));

  // Calculate team progress context
  const changes = teams.map(t => t.cps - 50);
  const yourChange = yourTeam.cps - 50;
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
    improvedTeamsCount: teams.filter(t => t.cps > 55).length,
    declinedTeamsCount: teams.filter(t => t.cps < 45).length,
    totalTeams: teams.length,
    teamPositions,
  };

  // Build impact flow from CPS indicators
  const impactFlow = buildImpactFlowFromCPS(yourTeam);

  // Build dimension impacts
  const impactByDimension = buildDimensionImpacts(yourTeam);

  // Build outcome impacts
  const impactByOutcome = buildOutcomeImpacts(yourTeam);

  // Calculate confidence score from CPS standard error
  // Lower SE = higher confidence
  const seNormalized = Math.min(1, yourTeam.standardError / 15); // Normalize SE
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
      dataCoverage: Math.round(yourTeam.indicatorCoverage * 100),
      sampleSize: Math.min(100, teams.length * 2),
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
    baselineAverageHealthScore: 50, // CPS baseline
    currentAverageHealthScore: yourTeam.cps, // Current CPS
    baselineAverageRank: baselineRank,
    currentAverageRank: yourTeamRank,
    totalTeamsInComparison: teams.length,

    // Date context
    baselineDate: threeMonthsAgo.toISOString(),
    measurementDate: now.toISOString(),

    // Team progress context
    teamProgressContext,

    // Impact flow
    impactFlow,

    // Include original CPS results
    cpsResults,

    // Metadata
    generatedAt: now.toISOString(),
  };
}

/**
 * Build ImpactFlow structure from CPS indicator contributions
 */
function buildImpactFlowFromCPS(team: CPSResult): ImpactFlow {
  const nodes: ImpactFlowNode[] = [];
  const links: ImpactFlowLink[] = [];

  // Track dimensions and outcomes
  const dimensionContributions: Record<string, number> = {};
  const outcomeContributions: Record<string, number> = {};

  // 1. Create indicator nodes
  const contributions = team.api.indicatorContributions;
  for (const indicator of CPS_INDICATORS) {
    const contribution = contributions.find(c => c.indicatorId === indicator.id);
    const impactValue = contribution ? contribution.weightedContribution * 100 : 0;
    const dimension = INDICATOR_DIMENSION_MAP[indicator.id];

    nodes.push({
      id: `indicator-${indicator.id}`,
      type: 'indicator',
      name: indicator.name,
      impactValue,
      impactUnit: '%',
      parentIds: [],
      childIds: dimension ? [`dimension-${dimension.toLowerCase().replace(' ', '-')}`] : [],
    });

    // Accumulate dimension contribution
    if (dimension) {
      dimensionContributions[dimension] = (dimensionContributions[dimension] || 0) + impactValue;
    }
  }

  // 2. Create dimension nodes
  const dimensions = ['Delivery', 'Process Maturity', 'Collaboration', 'Quality', 'Predictability'];
  for (const dim of dimensions) {
    const dimId = `dimension-${dim.toLowerCase().replace(' ', '-')}`;
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
      parentIds: parentDims.map(d => `dimension-${d.toLowerCase().replace(' ', '-')}`),
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
          weight: 0.3, // Approximate weight
        });
      }
    }
  }

  return { nodes, links };
}

/**
 * Build dimension impacts from CPS data
 */
function buildDimensionImpacts(team: CPSResult): DimensionImpact[] {
  const dimensions = ['Delivery', 'Process Maturity', 'Collaboration', 'Quality', 'Predictability'];
  const contributions = team.api.indicatorContributions;

  return dimensions.map(dim => {
    const dimIndicators = CPS_INDICATORS.filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim);
    const totalContribution = dimIndicators.reduce((sum, indicator) => {
      const contrib = contributions.find(c => c.indicatorId === indicator.id);
      return sum + (contrib ? contrib.weightedContribution * 100 : 0);
    }, 0);

    return {
      dimensionKey: dim.toLowerCase().replace(' ', '-'),
      dimensionName: dim,
      baselineHealthScore: 50,
      currentHealthScore: 50 + totalContribution,
      healthScoreChange: totalContribution,
      baselineRank: 25,
      currentRank: Math.max(1, 25 - Math.round(totalContribution)),
      totalTeams: 47,
      contributingPlays: [],
    };
  });
}

/**
 * Build outcome impacts from CPS data
 */
function buildOutcomeImpacts(team: CPSResult): PortfolioOutcomeImpact[] {
  const allOutcomes = Array.from(new Set(Object.values(DIMENSION_OUTCOME_MAP).flat()));
  const contributions = team.api.indicatorContributions;

  return allOutcomes.map(outcome => {
    // Find dimensions that affect this outcome
    const affectingDims = Object.entries(DIMENSION_OUTCOME_MAP)
      .filter(([_, outcomes]) => outcomes.includes(outcome))
      .map(([dim]) => dim);

    // Sum contributions from those dimensions
    let totalImpact = 0;
    for (const dim of affectingDims) {
      const dimIndicators = CPS_INDICATORS.filter(i => INDICATOR_DIMENSION_MAP[i.id] === dim);
      for (const indicator of dimIndicators) {
        const contrib = contributions.find(c => c.indicatorId === indicator.id);
        if (contrib) {
          totalImpact += contrib.weightedContribution * 100 / affectingDims.length;
        }
      }
    }

    return {
      outcomeId: outcome.toLowerCase().replace(/ /g, '-'),
      outcomeName: outcome,
      baselineScore: 50,
      currentScore: 50 + totalImpact,
      totalImpact,
      plansContributing: 1,
    };
  });
}
