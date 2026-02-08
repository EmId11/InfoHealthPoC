// Mock Assessment Data for Prototype
// Dimension 1: "Is all the work captured in Jira?" (Invisible Work Risk)

import {
  AssessmentResult,
  DimensionResult,
  IndicatorCategory,
  IndicatorResult,
  IndicatorDistribution,
  Recommendation,
  RiskLevel,
  MaturityLevel,
  MaturityLevelName,
} from '../types/assessment';
import {
  getMaturityLevel,
  getMaturityLevelName,
  getMaturityLevelConfig,
} from '../types/maturity';
import {
  transformPercentileToHealthScore,
  generateMockHealthScore,
  generateMockDimensionCHS,
} from '../utils/dimensionHealthScore';
import { WizardState, getEffectiveDateRange, initialWizardState } from '../types/wizard';
import { MOCK_ATTRIBUTE_VALUES, MOCK_ATTRIBUTES, DEFAULT_FIELD_HEALTH } from './mockAdminData';
import { FieldHealthConfig, StandardFieldConfig, CustomFieldConfig } from '../types/admin';

// ============================================
// Dynamic Field Completeness Generator
// ============================================

/**
 * Generate mock trend data for a field indicator
 */
function generateMockTrendData(baseValue: number): IndicatorResult['trendData'] {
  const variance = 0.15;
  return [
    '2024-03', '2024-04', '2024-05', '2024-06', '2024-07',
    '2024-08', '2024-09', '2024-10', '2024-11'
  ].map((period) => ({
    period,
    value: Math.min(1, Math.max(0, baseValue + (Math.random() - 0.5) * variance)),
    healthScore: Math.floor(30 + Math.random() * 40),
    benchmarkValue: 0.75,
  }));
}

// Number of similar teams in comparison group
const COMPARISON_TEAM_COUNT = 47;

/**
 * Generate distribution data showing how a team's value compares to similar teams.
 * Creates realistic clustering of other team values around different points.
 * Generates all 47 similar teams' values.
 */
function generateDistribution(teamValue: number, higherIsBetter: boolean): IndicatorDistribution {
  // Calculate realistic min/max based on team value
  const spread = teamValue * 0.6; // 60% spread around the value range
  let min = Math.max(0, teamValue - spread - Math.random() * spread * 0.5);
  let max = Math.min(higherIsBetter ? 1 : teamValue * 2, teamValue + spread + Math.random() * spread * 0.5);

  // Ensure min < teamValue < max
  if (teamValue <= min) {
    min = Math.max(0, teamValue - 0.1);
  }
  if (teamValue >= max) {
    max = teamValue + 0.1;
  }

  // Generate ALL comparison team values (47 teams)
  const otherTeamValues: number[] = [];

  for (let i = 0; i < COMPARISON_TEAM_COUNT; i++) {
    // Create realistic distribution with some clustering
    // Use a normal-ish distribution centered around the middle of the range
    const normalRandom = () => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };

    const mean = (min + max) / 2;
    const stdDev = (max - min) / 4;
    const value = mean + normalRandom() * stdDev;
    otherTeamValues.push(Math.max(min, Math.min(max, value)));
  }

  return { min, max, otherTeamValues };
}

/**
 * Generate an indicator result for a standard field
 */
function generateStandardFieldIndicator(field: StandardFieldConfig): IndicatorResult {
  const mockValue = 0.4 + Math.random() * 0.4; // Random value between 40-80%
  const percentile = Math.floor(20 + Math.random() * 60);

  const fieldDescriptions: Record<string, { desc: string; whyMatters: string }> = {
    acceptanceCriteria: {
      desc: 'Percentage of in-progress issues that have acceptance criteria defined.',
      whyMatters: 'Without acceptance criteria, teams can\'t verify work is complete—scope creep and rework become inevitable.',
    },
    linkedIssues: {
      desc: 'Percentage of in-progress issues that have links to related issues, epics, or dependencies.',
      whyMatters: 'Unlinked issues hide dependencies—teams don\'t see blockers or related work until it\'s too late.',
    },
    parentEpic: {
      desc: 'Percentage of issues that are linked to their parent epic.',
      whyMatters: 'Unlinked issues make it impossible to track epic progress or understand work context.',
    },
    estimates: {
      desc: 'Percentage of in-progress issues that have story points or time estimates.',
      whyMatters: 'Without estimates, sprint planning becomes guesswork and capacity management is impossible.',
    },
    assignee: {
      desc: 'Percentage of in-progress issues that have an assignee.',
      whyMatters: 'Unassigned work has no accountability—tasks fall through cracks and status is unclear.',
    },
    dueDate: {
      desc: 'Percentage of issues that have a due date or target completion date.',
      whyMatters: 'Missing due dates prevent deadline tracking and make prioritization difficult.',
    },
    subTasks: {
      desc: 'Percentage of larger issues that have been broken down into sub-tasks.',
      whyMatters: 'Large issues without breakdown are hard to track and often hide complexity.',
    },
    priority: {
      desc: 'Percentage of issues that have priority set.',
      whyMatters: 'Without priority, teams can\'t effectively triage work or make trade-off decisions.',
    },
  };

  const info = fieldDescriptions[field.fieldId] || {
    desc: `Percentage of issues with ${field.fieldName} populated.`,
    whyMatters: `Missing ${field.fieldName} data reduces visibility and tracking accuracy.`,
  };

  return {
    id: field.fieldId,
    name: `Issues with ${field.fieldName.toLowerCase()}`,
    description: info.desc,
    whyItMatters: info.whyMatters,
    value: mockValue,
    displayValue: `${Math.round(mockValue * 100)}%`,
    unit: '%',
    benchmarkValue: 0.75,
    benchmarkDisplayValue: '75%',
    benchmarkComparison: percentile < 50 ? `bottom ${100 - percentile}% of comparison group` : `top ${100 - percentile}% of comparison group`,
    benchmarkPercentile: percentile,
    trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
    trendData: generateMockTrendData(mockValue),
    higherIsBetter: true,
    configSource: 'standard',
    jiraFieldId: field.fieldId,
    distribution: generateDistribution(mockValue, true),
  };
}

/**
 * Generate an indicator result for a custom field
 */
function generateCustomFieldIndicator(field: CustomFieldConfig): IndicatorResult {
  const mockValue = 0.3 + Math.random() * 0.5; // Random value between 30-80%
  const percentile = Math.floor(20 + Math.random() * 60);

  return {
    id: field.id,
    name: `Issues with ${field.displayName.toLowerCase()}`,
    description: field.description || `Percentage of issues with ${field.displayName} populated.`,
    whyItMatters: `Custom field tracking helps ensure organization-specific data requirements are met.`,
    value: mockValue,
    displayValue: `${Math.round(mockValue * 100)}%`,
    unit: '%',
    benchmarkValue: 0.70,
    benchmarkDisplayValue: '70%',
    benchmarkComparison: percentile < 50 ? `bottom ${100 - percentile}% of comparison group` : `top ${100 - percentile}% of comparison group`,
    benchmarkPercentile: percentile,
    trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining',
    trendData: generateMockTrendData(mockValue),
    higherIsBetter: true,
    configSource: 'custom',
    jiraFieldId: field.jiraFieldId,
    distribution: generateDistribution(mockValue, true),
  };
}

/**
 * Generate field completeness indicators based on FieldHealthConfig
 * This function respects the enabled/disabled state of each field
 */
export function generateFieldCompletenessIndicators(
  config: FieldHealthConfig = DEFAULT_FIELD_HEALTH
): IndicatorResult[] {
  const indicators: IndicatorResult[] = [];

  // Generate indicator for each enabled standard field
  config.standardFields
    .filter(f => f.enabled)
    .forEach(field => {
      indicators.push(generateStandardFieldIndicator(field));
    });

  // Generate indicator for each enabled custom field
  config.customFields
    .filter(f => f.enabled)
    .forEach(field => {
      indicators.push(generateCustomFieldIndicator(field));
    });

  return indicators;
}

// ============================================
// Category 1: Dark Matter Indicators
// Variability in throughput not explained by demand
// ============================================

const darkMatterIndicators: IndicatorResult[] = [
  {
    id: 'throughputVariability',
    name: 'Variability in throughput without a corresponding variability in demand',
    description: 'Measures how much our completed work varies compared to incoming demand. High variability without corresponding demand changes indicates potential hidden work.',
    whyItMatters: 'If output swings wildly while incoming work stays steady, hidden work is likely absorbing team capacity unpredictably.',
    value: 0.45,
    displayValue: '0.45',
    unit: 'ratio',
    benchmarkValue: 0.25,
    benchmarkDisplayValue: '0.25',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.28, healthScore: 45, benchmarkValue: 0.25 },
      { period: '2024-04', value: 0.30, healthScore: 40, benchmarkValue: 0.25 },
      { period: '2024-05', value: 0.32, healthScore: 35, benchmarkValue: 0.25 },
      { period: '2024-06', value: 0.35, healthScore: 32, benchmarkValue: 0.25 },
      { period: '2024-07', value: 0.38, healthScore: 28, benchmarkValue: 0.25 },
      { period: '2024-08', value: 0.40, healthScore: 25, benchmarkValue: 0.25 },
      { period: '2024-09', value: 0.42, healthScore: 22, benchmarkValue: 0.25 },
      { period: '2024-10', value: 0.44, healthScore: 21, benchmarkValue: 0.25 },
      { period: '2024-11', value: 0.45, healthScore: 20, benchmarkValue: 0.25 },
    ],
    distribution: { min: 0.15, max: 0.72, otherTeamValues: [0.22, 0.28, 0.31, 0.35, 0.39, 0.44, 0.52, 0.58, 0.64] },
  },
  {
    id: 'workflowStageTimeVariability',
    name: 'Workflow stage time variability',
    description: 'For work of the same size estimate there\'s a wide range of how long stage \'n\' takes. This could indicate hidden work or inconsistent processes.',
    whyItMatters: 'Same-sized work taking wildly different times suggests untracked blockers, interruptions, or parallel invisible work.',
    value: 0.62,
    distribution: { min: 0.18, max: 0.85, otherTeamValues: [0.25, 0.32, 0.38, 0.45, 0.51, 0.58, 0.67, 0.73, 0.79] },
    displayValue: '0.62',
    unit: 'ratio',
    benchmarkValue: 0.30,
    benchmarkDisplayValue: '0.30',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.60, healthScore: 16, benchmarkValue: 0.30 },
      { period: '2024-04', value: 0.59, healthScore: 17, benchmarkValue: 0.30 },
      { period: '2024-05', value: 0.61, healthScore: 15, benchmarkValue: 0.30 },
      { period: '2024-06', value: 0.60, healthScore: 16, benchmarkValue: 0.30 },
      { period: '2024-07', value: 0.62, healthScore: 14, benchmarkValue: 0.30 },
      { period: '2024-08', value: 0.61, healthScore: 15, benchmarkValue: 0.30 },
      { period: '2024-09', value: 0.60, healthScore: 16, benchmarkValue: 0.30 },
      { period: '2024-10', value: 0.61, healthScore: 15, benchmarkValue: 0.30 },
      { period: '2024-11', value: 0.62, healthScore: 15, benchmarkValue: 0.30 },
    ],
  },
  {
    id: 'memberThroughputVariability',
    name: 'Variability in team member throughput without a corresponding variability in demand',
    description: 'Individual team members show high variation in output without matching changes in their assigned work. Also indicates variability in work pick-up patterns.',
    whyItMatters: 'Inconsistent individual output often means people are pulled into untracked meetings, support, or side projects.',
    value: 0.52,
    displayValue: '0.52',
    unit: 'ratio',
    benchmarkValue: 0.28,
    benchmarkDisplayValue: '0.28',
    benchmarkComparison: 'bottom 25% of the comparison group',
    benchmarkPercentile: 25,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.38, healthScore: 42, benchmarkValue: 0.28 },
      { period: '2024-04', value: 0.40, healthScore: 38, benchmarkValue: 0.28 },
      { period: '2024-05', value: 0.42, healthScore: 35, benchmarkValue: 0.28 },
      { period: '2024-06', value: 0.44, healthScore: 32, benchmarkValue: 0.28 },
      { period: '2024-07', value: 0.46, healthScore: 30, benchmarkValue: 0.28 },
      { period: '2024-08', value: 0.48, healthScore: 28, benchmarkValue: 0.28 },
      { period: '2024-09', value: 0.49, healthScore: 27, benchmarkValue: 0.28 },
      { period: '2024-10', value: 0.51, healthScore: 26, benchmarkValue: 0.28 },
      { period: '2024-11', value: 0.52, healthScore: 25, benchmarkValue: 0.28 },
    ],
    distribution: { min: 0.15, max: 0.78, otherTeamValues: [0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.62, 0.68, 0.72] },
  },
  {
    id: 'estimationVariability',
    name: 'High estimation (and issue size) variability',
    description: 'Significant variation in estimates that could not be explained by variable demand or because we\'re estimating without having the context/not refining properly.',
    whyItMatters: 'Erratic estimates signal unclear scope or work being discovered mid-flight that wasn\'t originally planned.',
    value: 0.58,
    displayValue: '0.58',
    unit: 'ratio',
    benchmarkValue: 0.35,
    benchmarkDisplayValue: '0.35',
    benchmarkComparison: 'bottom 30% of the comparison group',
    benchmarkPercentile: 30,
    trend: 'improving',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.72, healthScore: 18, benchmarkValue: 0.35 },
      { period: '2024-04', value: 0.70, healthScore: 20, benchmarkValue: 0.35 },
      { period: '2024-05', value: 0.68, healthScore: 22, benchmarkValue: 0.35 },
      { period: '2024-06', value: 0.66, healthScore: 24, benchmarkValue: 0.35 },
      { period: '2024-07', value: 0.64, healthScore: 26, benchmarkValue: 0.35 },
      { period: '2024-08', value: 0.62, healthScore: 27, benchmarkValue: 0.35 },
      { period: '2024-09', value: 0.60, healthScore: 28, benchmarkValue: 0.35 },
      { period: '2024-10', value: 0.59, healthScore: 29, benchmarkValue: 0.35 },
      { period: '2024-11', value: 0.58, healthScore: 30, benchmarkValue: 0.35 },
    ],
    distribution: { min: 0.20, max: 0.82, otherTeamValues: [0.28, 0.35, 0.42, 0.50, 0.58, 0.65, 0.72, 0.76, 0.80] },
  },
  {
    id: 'inProgressItemsVariability',
    name: 'Variability in the number of \'in-progress\' items we worked on sprint-to-sprint',
    description: 'The number of items we work on varies significantly sprint-to-sprint (not necessarily finished) with no corresponding variability in demand.',
    whyItMatters: 'Unpredictable WIP suggests ad-hoc work is regularly disrupting planned commitments.',
    value: 0.48,
    displayValue: '0.48',
    unit: 'ratio',
    benchmarkValue: 0.22,
    benchmarkDisplayValue: '0.22',
    benchmarkComparison: 'bottom 18% of the comparison group',
    benchmarkPercentile: 18,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.46, benchmarkValue: 0.22 },
      { period: '2024-04', value: 0.47, benchmarkValue: 0.22 },
      { period: '2024-05', value: 0.48, benchmarkValue: 0.22 },
      { period: '2024-06', value: 0.47, benchmarkValue: 0.22 },
      { period: '2024-07', value: 0.49, benchmarkValue: 0.22 },
      { period: '2024-08', value: 0.48, benchmarkValue: 0.22 },
      { period: '2024-09', value: 0.47, benchmarkValue: 0.22 },
      { period: '2024-10', value: 0.48, benchmarkValue: 0.22 },
      { period: '2024-11', value: 0.48, benchmarkValue: 0.22 },
    ],
    distribution: { min: 0.12, max: 0.72, otherTeamValues: [0.18, 0.24, 0.32, 0.40, 0.48, 0.55, 0.62, 0.66, 0.70] },
  },
  {
    id: 'sameSizeTimeVariability',
    name: 'Variability in how long work items of the same size take',
    description: 'The same team member takes very different amounts of time to complete similarly sized items, with no corresponding variability in demand.',
    whyItMatters: 'When similar tasks take vastly different times, hidden complexity or distractions are eating into productivity.',
    value: 0.55,
    displayValue: '0.55',
    unit: 'ratio',
    benchmarkValue: 0.32,
    benchmarkDisplayValue: '0.32',
    benchmarkComparison: 'bottom 22% of the comparison group',
    benchmarkPercentile: 22,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.42, benchmarkValue: 0.32 },
      { period: '2024-04', value: 0.44, benchmarkValue: 0.32 },
      { period: '2024-05', value: 0.46, benchmarkValue: 0.32 },
      { period: '2024-06', value: 0.48, benchmarkValue: 0.32 },
      { period: '2024-07', value: 0.50, benchmarkValue: 0.32 },
      { period: '2024-08', value: 0.52, benchmarkValue: 0.32 },
      { period: '2024-09', value: 0.53, benchmarkValue: 0.32 },
      { period: '2024-10', value: 0.54, benchmarkValue: 0.32 },
      { period: '2024-11', value: 0.55, benchmarkValue: 0.32 },
    ],
    distribution: { min: 0.18, max: 0.75, otherTeamValues: [0.25, 0.32, 0.38, 0.45, 0.52, 0.58, 0.65, 0.70, 0.73] },
  },
  {
    id: 'collaborationVariability',
    name: 'High variability in \'collaboration\' indicators',
    description: 'Things like comments per issue, comments per person, engagement density etc. vary significantly and cannot be explained by demand variability.',
    whyItMatters: 'Inconsistent collaboration patterns may indicate discussions happening outside Jira where decisions aren\'t documented.',
    value: 0.61,
    displayValue: '0.61',
    unit: 'ratio',
    benchmarkValue: 0.38,
    benchmarkDisplayValue: '0.38',
    benchmarkComparison: 'bottom 28% of the comparison group',
    benchmarkPercentile: 28,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.58, benchmarkValue: 0.38 },
      { period: '2024-04', value: 0.59, benchmarkValue: 0.38 },
      { period: '2024-05', value: 0.60, benchmarkValue: 0.38 },
      { period: '2024-06', value: 0.59, benchmarkValue: 0.38 },
      { period: '2024-07', value: 0.61, benchmarkValue: 0.38 },
      { period: '2024-08', value: 0.60, benchmarkValue: 0.38 },
      { period: '2024-09', value: 0.62, benchmarkValue: 0.38 },
      { period: '2024-10', value: 0.61, benchmarkValue: 0.38 },
      { period: '2024-11', value: 0.61, benchmarkValue: 0.38 },
    ],
    distribution: { min: 0.22, max: 0.82, otherTeamValues: [0.30, 0.38, 0.45, 0.52, 0.58, 0.65, 0.72, 0.76, 0.80] },
  },
];

const darkMatterCategory: IndicatorCategory = {
  id: 'darkMatter',
  name: "'Dark matter' indicators: variability in throughput that couldn't be explained by the demand we're seeing",
  shortName: 'Unexplained Variability',
  description: 'These indicators highlight unexplained variability that may suggest invisible work happening outside of Jira.',
  rationale: 'When a team\'s output <strong>fluctuates significantly without corresponding changes in demand</strong>, it suggests that work is entering or leaving the system through unofficial channels. Just like dark matter in physics—we can\'t see it directly, but we can detect its effects. These indicators measure <strong>unexplained variability</strong> in throughput, time-in-stage, individual output, and collaboration patterns. High variability that can\'t be explained by what\'s visible in Jira is a <strong>strong signal that invisible work</strong> is distorting the picture.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 5,
  indicators: darkMatterIndicators,
};

// ============================================
// Category 2: Frequent Use Indicators
// Heightened risk due to not using the tool frequently enough
// ============================================

const frequentUseIndicators: IndicatorResult[] = [
  {
    id: 'staleWorkItems',
    name: '% of current in-progress work items are stale',
    description: 'Percentage of in-progress items that haven\'t seen any change/update/movement in over n weeks. We\'re in the bottom 20% of the comparison group.',
    whyItMatters: 'Stale items suggest work is happening elsewhere or the ticket has become irrelevant but wasn\'t closed.',
    value: 58,
    displayValue: '58%',
    unit: '%',
    benchmarkValue: 15,
    benchmarkDisplayValue: '15%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 32, benchmarkValue: 15 },
      { period: '2024-04', value: 36, benchmarkValue: 15 },
      { period: '2024-05', value: 40, benchmarkValue: 15 },
      { period: '2024-06', value: 44, benchmarkValue: 15 },
      { period: '2024-07', value: 48, benchmarkValue: 15 },
      { period: '2024-08', value: 52, benchmarkValue: 15 },
      { period: '2024-09', value: 54, benchmarkValue: 15 },
      { period: '2024-10', value: 56, benchmarkValue: 15 },
      { period: '2024-11', value: 58, benchmarkValue: 15 },
    ],
    distribution: { min: 8, max: 72, otherTeamValues: [12, 18, 24, 31, 38, 45, 52, 61, 68] },
  },
  {
    id: 'staleEpics',
    name: '% of current in-progress work Epics are stale',
    description: 'Percentage of in-progress Epics that haven\'t seen any change/update/movement in over n months. We\'re in the top 10% of the comparison group.',
    whyItMatters: 'Abandoned epics create noise and make it harder to see what\'s actually active and important.',
    value: 15,
    displayValue: '15%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'top 10% of the comparison group',
    benchmarkPercentile: 90,
    trend: 'improving',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 38, benchmarkValue: 25 },
      { period: '2024-04', value: 34, benchmarkValue: 25 },
      { period: '2024-05', value: 30, benchmarkValue: 25 },
      { period: '2024-06', value: 26, benchmarkValue: 25 },
      { period: '2024-07', value: 24, benchmarkValue: 25 },
      { period: '2024-08', value: 21, benchmarkValue: 25 },
      { period: '2024-09', value: 19, benchmarkValue: 25 },
      { period: '2024-10', value: 17, benchmarkValue: 25 },
      { period: '2024-11', value: 15, benchmarkValue: 25 },
    ],
    distribution: { min: 5, max: 45, otherTeamValues: [8, 12, 18, 22, 28, 32, 38, 42] },
  },
  {
    id: 'unresolvedEpicChildren',
    name: '% of completed Epics that still had child work items that were not resolved',
    description: 'Of the Epics that were moved to \'Done\' in the timespan specified, 80% still had child work items that were not resolved. We\'re in the bottom 5% of the comparison group.',
    whyItMatters: 'Closing epics with open children suggests rushed housekeeping or work that was never actually tracked.',
    value: 80,
    displayValue: '80%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'bottom 5% of the comparison group',
    benchmarkPercentile: 5,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 76, benchmarkValue: 25 },
      { period: '2024-04', value: 78, benchmarkValue: 25 },
      { period: '2024-05', value: 77, benchmarkValue: 25 },
      { period: '2024-06', value: 79, benchmarkValue: 25 },
      { period: '2024-07', value: 78, benchmarkValue: 25 },
      { period: '2024-08', value: 80, benchmarkValue: 25 },
      { period: '2024-09', value: 79, benchmarkValue: 25 },
      { period: '2024-10', value: 80, benchmarkValue: 25 },
      { period: '2024-11', value: 80, benchmarkValue: 25 },
    ],
    distribution: { min: 10, max: 85, otherTeamValues: [15, 22, 28, 35, 42, 50, 58, 65, 72] },
  },
  {
    id: 'bulkChanges',
    name: '% of changes that were done in bulk',
    description: 'Of all the changes that happened to work items in the timespan specified, 20% of those changes were done in bulk (the change happening to more than one work item at the same time). This is 4 times higher than the average of the comparison group (which is 5%). Special focus to issues that were CREATED then moved to done or to the next sprint on the last day of the sprint - indicating they were already being worked on.',
    whyItMatters: 'Bulk updates often indicate retroactive logging—work was done but only recorded later, hiding real timelines.',
    value: 20,
    displayValue: '20%',
    unit: '%',
    benchmarkValue: 5,
    benchmarkDisplayValue: '5%',
    benchmarkComparison: '4 times higher than the comparison group average',
    benchmarkPercentile: 8,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 10, benchmarkValue: 5 },
      { period: '2024-04', value: 11, benchmarkValue: 5 },
      { period: '2024-05', value: 13, benchmarkValue: 5 },
      { period: '2024-06', value: 14, benchmarkValue: 5 },
      { period: '2024-07', value: 15, benchmarkValue: 5 },
      { period: '2024-08', value: 17, benchmarkValue: 5 },
      { period: '2024-09', value: 18, benchmarkValue: 5 },
      { period: '2024-10', value: 19, benchmarkValue: 5 },
      { period: '2024-11', value: 20, benchmarkValue: 5 },
    ],
    distribution: { min: 2, max: 35, otherTeamValues: [3, 5, 7, 10, 12, 15, 18, 22, 28] },
  },
  {
    id: 'avgDailyUpdates',
    name: 'Average Jira issue updates per day',
    description: 'On average, our Jira issues are updated 0.5 times/day. The average of the comparison group is 3 times/day, meaning that we update Jira about 6 times less frequently than the comparison group.',
    whyItMatters: 'Low update frequency means Jira isn\'t reflecting real-time progress—decisions and work are happening without a trace.',
    value: 0.5,
    displayValue: '0.5 times/day',
    unit: '/day',
    benchmarkValue: 3,
    benchmarkDisplayValue: '3 times/day',
    benchmarkComparison: '6x less frequent than the comparison group',
    benchmarkPercentile: 12,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 0.55, benchmarkValue: 3 },
      { period: '2024-04', value: 0.52, benchmarkValue: 3 },
      { period: '2024-05', value: 0.54, benchmarkValue: 3 },
      { period: '2024-06', value: 0.51, benchmarkValue: 3 },
      { period: '2024-07', value: 0.53, benchmarkValue: 3 },
      { period: '2024-08', value: 0.50, benchmarkValue: 3 },
      { period: '2024-09', value: 0.52, benchmarkValue: 3 },
      { period: '2024-10', value: 0.51, benchmarkValue: 3 },
      { period: '2024-11', value: 0.50, benchmarkValue: 3 },
    ],
    distribution: { min: 0.3, max: 5.2, otherTeamValues: [0.8, 1.2, 1.8, 2.4, 2.9, 3.5, 4.1, 4.6] },
  },
  {
    id: 'frequentUseVariability',
    name: 'High variability in frequent use indicators',
    description: 'Not only are we lagging behind but there\'s large variability in how we\'re performing - sometimes we use it diligently, sometimes we don\'t use it at all etc.',
    whyItMatters: 'Inconsistent tool usage means visibility into work comes and goes—some periods are blind spots.',
    value: 0.72,
    displayValue: '0.72',
    unit: 'ratio',
    benchmarkValue: 0.35,
    benchmarkDisplayValue: '0.35',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.48, benchmarkValue: 0.35 },
      { period: '2024-04', value: 0.52, benchmarkValue: 0.35 },
      { period: '2024-05', value: 0.55, benchmarkValue: 0.35 },
      { period: '2024-06', value: 0.58, benchmarkValue: 0.35 },
      { period: '2024-07', value: 0.62, benchmarkValue: 0.35 },
      { period: '2024-08', value: 0.65, benchmarkValue: 0.35 },
      { period: '2024-09', value: 0.68, benchmarkValue: 0.35 },
      { period: '2024-10', value: 0.70, benchmarkValue: 0.35 },
      { period: '2024-11', value: 0.72, benchmarkValue: 0.35 },
    ],
    distribution: { min: 0.15, max: 0.85, otherTeamValues: [0.22, 0.28, 0.35, 0.42, 0.48, 0.55, 0.62, 0.78] },
  },
  {
    id: 'sprintHygiene',
    name: 'Bad sprint hygiene indicators',
    description: 'See indicators of low sprint hygiene below - e.g. not starting and ending on time, no goals, no assignee of in-progress work, bulk update on the last day of sprint, etc.',
    whyItMatters: 'Poor sprint discipline makes it hard to trust what\'s planned vs. what\'s actually happening each iteration.',
    value: 65,
    displayValue: '65%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 60, benchmarkValue: 25 },
      { period: '2024-04', value: 62, benchmarkValue: 25 },
      { period: '2024-05', value: 61, benchmarkValue: 25 },
      { period: '2024-06', value: 63, benchmarkValue: 25 },
      { period: '2024-07', value: 64, benchmarkValue: 25 },
      { period: '2024-08', value: 63, benchmarkValue: 25 },
      { period: '2024-09', value: 64, benchmarkValue: 25 },
      { period: '2024-10', value: 65, benchmarkValue: 25 },
      { period: '2024-11', value: 65, benchmarkValue: 25 },
    ],
    distribution: { min: 10, max: 75, otherTeamValues: [15, 22, 28, 35, 42, 48, 55, 62, 68] },
  },
];

const frequentUseCategory: IndicatorCategory = {
  id: 'frequentUse',
  name: 'Heightened risk due to not using the tool frequently enough',
  shortName: 'Infrequent Tool Use',
  description: 'If you use Jira sporadically, it is likely that there\'s work you\'re doing that you\'re not capturing on Jira.',
  rationale: 'For Jira to be a <strong>reliable source of truth</strong>, it needs to be used consistently. When teams use the tool sporadically, work inevitably happens in the gaps. These indicators look for signs of <strong>infrequent engagement</strong>: stale items untouched for weeks, bulk "catch-up" updates (suggesting retroactive logging), low daily update frequency, and poor sprint hygiene. If Jira <strong>isn\'t being updated in real-time</strong>, it\'s not reflecting what\'s actually happening—and the missing updates represent invisible work.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: frequentUseIndicators,
};

// ============================================
// Category 3: Front Door Indicators
// Heightened risk due to potential lack of effective front door
// ============================================

const frontDoorIndicators: IndicatorResult[] = [
  {
    id: 'siloedWorkItems',
    name: '% of siloed work items',
    description: 'These are work items where there\'s only 1 person contributing to them (reporter, assignee, no one else puts comments, etc.). If no one else engages with your work, there\'s less incentive to ensure everything is captured.',
    whyItMatters: 'Work without collaboration has no accountability—no one else sees or validates what was actually done.',
    value: 42,
    displayValue: '42%',
    unit: '%',
    benchmarkValue: 20,
    benchmarkDisplayValue: '20%',
    benchmarkComparison: 'bottom 25% of the comparison group',
    benchmarkPercentile: 25,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 28, benchmarkValue: 20 },
      { period: '2024-04', value: 30, benchmarkValue: 20 },
      { period: '2024-05', value: 32, benchmarkValue: 20 },
      { period: '2024-06', value: 34, benchmarkValue: 20 },
      { period: '2024-07', value: 36, benchmarkValue: 20 },
      { period: '2024-08', value: 38, benchmarkValue: 20 },
      { period: '2024-09', value: 39, benchmarkValue: 20 },
      { period: '2024-10', value: 41, benchmarkValue: 20 },
      { period: '2024-11', value: 42, benchmarkValue: 20 },
    ],
    distribution: { min: 10, max: 65, otherTeamValues: [15, 20, 25, 30, 35, 42, 50, 55, 60] },
  },
  {
    id: 'midSprintCreations',
    name: '% of work items that are created directly into the sprint mid-sprint',
    description: 'Work items that weren\'t moved from the backlog but were created directly as in-progress and didn\'t wait their turn. Equivalent in non-sprint is created directly as in-progress.',
    whyItMatters: 'Bypassing planning suggests urgent unplanned work or tasks being logged only when already in flight.',
    value: 35,
    displayValue: '35%',
    unit: '%',
    benchmarkValue: 12,
    benchmarkDisplayValue: '12%',
    benchmarkComparison: 'bottom 18% of the comparison group',
    benchmarkPercentile: 18,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 32, benchmarkValue: 12 },
      { period: '2024-04', value: 33, benchmarkValue: 12 },
      { period: '2024-05', value: 34, benchmarkValue: 12 },
      { period: '2024-06', value: 33, benchmarkValue: 12 },
      { period: '2024-07', value: 35, benchmarkValue: 12 },
      { period: '2024-08', value: 34, benchmarkValue: 12 },
      { period: '2024-09', value: 35, benchmarkValue: 12 },
      { period: '2024-10', value: 34, benchmarkValue: 12 },
      { period: '2024-11', value: 35, benchmarkValue: 12 },
    ],
    distribution: { min: 5, max: 52, otherTeamValues: [8, 12, 18, 24, 30, 38, 42, 46, 50] },
  },
  {
    id: 'capacitySplitAcrossProjects',
    name: '% of team members who at least have 20% of their capacity dedicated to other projects',
    description: 'The hypothesis here is that when one is split among a number of project, it is easy to not care as much about capturing every single piece of work relevant each specific project due to context switching, load etc.',
    whyItMatters: 'Split capacity leads to fragmented tracking—work falls through the cracks between multiple projects.',
    value: 55,
    displayValue: '55%',
    unit: '%',
    benchmarkValue: 30,
    benchmarkDisplayValue: '30%',
    benchmarkComparison: 'bottom 22% of the comparison group',
    benchmarkPercentile: 22,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 35, benchmarkValue: 30 },
      { period: '2024-04', value: 38, benchmarkValue: 30 },
      { period: '2024-05', value: 40, benchmarkValue: 30 },
      { period: '2024-06', value: 43, benchmarkValue: 30 },
      { period: '2024-07', value: 46, benchmarkValue: 30 },
      { period: '2024-08', value: 49, benchmarkValue: 30 },
      { period: '2024-09', value: 51, benchmarkValue: 30 },
      { period: '2024-10', value: 53, benchmarkValue: 30 },
      { period: '2024-11', value: 55, benchmarkValue: 30 },
    ],
    distribution: { min: 15, max: 78, otherTeamValues: [20, 28, 35, 42, 50, 58, 65, 70, 75] },
  },
];

const frontDoorCategory: IndicatorCategory = {
  id: 'frontDoor',
  name: 'Heightened risk due to potential lack of effective front door',
  shortName: 'Work Intake Process',
  description: 'If you don\'t have an effective front-door, then the likelihood of hidden working coming into the team is high (e.g. stakeholders reaching out directly etc.)',
  rationale: 'Without a clear <strong>"front door" for work requests</strong>, tasks sneak in through side channels—direct messages, hallway conversations, ad-hoc stakeholder requests. This bypassed work rarely makes it into Jira until after the fact, if ever. These indicators measure how much <strong>work circumvents normal intake</strong>: items created directly into sprints mid-flight, siloed work with no collaboration, and team members split across projects. A <strong>leaky front door is a primary source</strong> of invisible work.',
  statusColor: '#FFFAE6',
  status: 'moderate',
  issuesCount: 3,
  indicators: frontDoorIndicators,
};

// ============================================
// Dimension 1 Complete Result
// ============================================

// Structured recommendations for better UX
const dimension1Recommendations: Recommendation[] = [
  {
    id: 'front-door',
    title: 'Establish a Front Door Process',
    description: 'Create a clear intake process for all work requests. All work should enter through defined channels before being actioned.',
    category: 'process',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'track-all-work',
    title: 'Track All Work Activities',
    description: 'Set expectations that all work is captured in Jira, including meetings, support, and ad-hoc requests.',
    category: 'culture',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'stale-review',
    title: 'Weekly Stale Item Review',
    description: 'Review and update stale items weekly to ensure Jira reflects current reality.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'bulk-update-root-cause',
    title: 'Address Bulk Update Patterns',
    description: 'Investigate why bulk updates happen at sprint end and address root causes.',
    category: 'governance',
    effort: 'medium',
    impact: 'medium',
  },
  {
    id: 'increase-collaboration',
    title: 'Increase Work Item Collaboration',
    description: 'Encourage team members to engage with each other\'s work items through comments and reviews.',
    category: 'culture',
    effort: 'low',
    impact: 'medium',
  },
];

export const mockDimension1Result: DimensionResult = {
  dimensionKey: 'workCaptured',
  dimensionNumber: 1,
  dimensionName: 'Invisible Work',
  dimensionTitle: 'Invisible Work Risk',
  questionForm: 'How does your team compare on invisible work indicators?',
  riskDescription: 'work is happening outside Jira',
  spectrumLeftLabel: 'Work fully captured in Jira',
  spectrumRightLabel: 'Significant work happening outside Jira',
  verdict: 'Needs Attention',
  verdictDescription: 'Based on multiple indicators, your team shows patterns that suggest this dimension needs attention compared to baseline.',
  // Risk level based on percentile comparison (deprecated)
  riskLevel: 'high',
  overallPercentile: 22, // Composite percentile from weighted category percentiles
  // CHS Health Score: percentile 22 → z≈-0.77 → base 42, declining trend -5 = 37
  healthScore: 37,
  benchmarkComparison: 'bottom 22% of the comparison group',
  benchmarkPercentile: 22,
  trend: 'declining',
  trendData: [
    { period: '2024-06', value: 28, benchmarkValue: 50 },
    { period: '2024-07', value: 25, benchmarkValue: 50 },
    { period: '2024-08', value: 26, benchmarkValue: 50 },
    { period: '2024-09', value: 24, benchmarkValue: 50 },
    { period: '2024-10', value: 22, benchmarkValue: 50 },
    { period: '2024-11', value: 22, benchmarkValue: 50 },
  ],
  categories: [darkMatterCategory, frequentUseCategory, frontDoorCategory],
  whyItMatters: 'When work is invisible, teams cannot plan effectively or deliver predictably.',
  whyItMattersPoints: [
    'Accurate planning and forecasting becomes impossible',
    'Stakeholder trust erodes due to unpredictable delivery',
    'Team capacity and velocity cannot be properly measured',
    'Bottlenecks and blockers remain hidden',
    'Resource allocation decisions are based on incomplete data',
  ],
  recommendations: dimension1Recommendations,
};

// ============================================
// Risk Level Calculation (3 levels based on percentile)
// ============================================
// Statistical approach:
// - 17 indicators across 3 categories
// - Each indicator has a percentile rank vs comparison teams
// - Categories weighted: 40% Dark Matter, 35% Frequent Use, 25% Front Door
// - Output: 3 risk levels based on composite percentile

/**
 * Calculate risk level from percentile
 * @deprecated Use getMaturityLevelFromPercentile instead for unified 5-level system
 * High risk: ≤25th percentile (bottom quartile)
 * Moderate risk: 26-75th percentile (middle two quartiles)
 * Low risk: >75th percentile (top quartile)
 */
export const getRiskLevelFromPercentile = (percentile: number): RiskLevel => {
  if (percentile <= 25) return 'high';
  if (percentile <= 75) return 'moderate';
  return 'low';
};

/**
 * Get maturity level (1-5) from percentile using unified thresholds
 * Uses even 20-point splits: 0-20, 21-40, 41-60, 61-80, 81-100
 */
export const getMaturityLevelFromPercentile = (percentile: number): MaturityLevel => {
  return getMaturityLevel(percentile);
};

/**
 * Get maturity level name from percentile
 */
export const getMaturityNameFromPercentile = (percentile: number): MaturityLevelName => {
  return getMaturityLevelName(percentile);
};

/**
 * Get maturity colors (text and background) from percentile
 */
export const getMaturityColors = (percentile: number): { color: string; bgColor: string; borderColor: string } => {
  const config = getMaturityLevelConfig(percentile);
  return {
    color: config.color,
    bgColor: config.backgroundColor,
    borderColor: config.borderColor,
  };
};

// ============================================
// Mock Comparison Teams (47 realistic team names)
// ============================================

const mockComparisonTeams = [
  { id: 'team-001', name: 'Platform Core' },
  { id: 'team-002', name: 'Checkout Experience' },
  { id: 'team-003', name: 'Search & Discovery' },
  { id: 'team-004', name: 'Payments Integration' },
  { id: 'team-005', name: 'User Authentication' },
  { id: 'team-006', name: 'Mobile iOS' },
  { id: 'team-007', name: 'Mobile Android' },
  { id: 'team-008', name: 'Data Pipeline' },
  { id: 'team-009', name: 'ML Platform' },
  { id: 'team-010', name: 'DevOps Enablement' },
  { id: 'team-011', name: 'Customer Support Tools' },
  { id: 'team-012', name: 'Inventory Management' },
  { id: 'team-013', name: 'Shipping & Logistics' },
  { id: 'team-014', name: 'Vendor Portal' },
  { id: 'team-015', name: 'Analytics Dashboard' },
  { id: 'team-016', name: 'Notification Services' },
  { id: 'team-017', name: 'Content Management' },
  { id: 'team-018', name: 'Recommendations Engine' },
  { id: 'team-019', name: 'Fraud Detection' },
  { id: 'team-020', name: 'API Gateway' },
  { id: 'team-021', name: 'Identity & Access' },
  { id: 'team-022', name: 'Billing Services' },
  { id: 'team-023', name: 'Customer Insights' },
  { id: 'team-024', name: 'Order Fulfillment' },
  { id: 'team-025', name: 'Returns & Refunds' },
  { id: 'team-026', name: 'Product Catalog' },
  { id: 'team-027', name: 'Promotions Engine' },
  { id: 'team-028', name: 'Loyalty Program' },
  { id: 'team-029', name: 'Partner Integration' },
  { id: 'team-030', name: 'Compliance & Audit' },
  { id: 'team-031', name: 'Infrastructure SRE' },
  { id: 'team-032', name: 'Security Operations' },
  { id: 'team-033', name: 'Developer Experience' },
  { id: 'team-034', name: 'Quality Engineering' },
  { id: 'team-035', name: 'Release Management' },
  { id: 'team-036', name: 'Design Systems' },
  { id: 'team-037', name: 'Accessibility' },
  { id: 'team-038', name: 'Performance Engineering' },
  { id: 'team-039', name: 'Localization' },
  { id: 'team-040', name: 'A/B Testing Platform' },
  { id: 'team-041', name: 'Event Processing' },
  { id: 'team-042', name: 'Cache Infrastructure' },
  { id: 'team-043', name: 'Database Platform' },
  { id: 'team-044', name: 'Message Queue' },
  { id: 'team-045', name: 'Service Mesh' },
  { id: 'team-046', name: 'Observability' },
  { id: 'team-047', name: 'Cost Optimization' },
];

// ============================================
// Mock Assessment Result Generator
// ============================================

export const generateMockAssessmentResult = (
  wizardState: WizardState
): AssessmentResult => {
  const dateRange = getEffectiveDateRange(wizardState.step1);

  // Build comparison group description from Team Attributes (categorySelections)
  const comparisonParts: string[] = [];
  const criteria = wizardState.step2.comparisonCriteria;
  const orgStructure = wizardState.step2.orgStructure;

  // Add org structure selections (Portfolio, Team of Teams)
  if (orgStructure?.portfolioValueId) {
    const portfolioValue = MOCK_ATTRIBUTE_VALUES.find(v => v.id === orgStructure.portfolioValueId);
    if (portfolioValue) {
      comparisonParts.push(`Portfolio: ${portfolioValue.name}`);
    }
  }
  if (orgStructure?.teamOfTeamsValueId) {
    const totValue = MOCK_ATTRIBUTE_VALUES.find(v => v.id === orgStructure.teamOfTeamsValueId);
    if (totValue) {
      comparisonParts.push(`Team of Teams: ${totValue.name}`);
    }
  }

  // Helper to format a value with its description/threshold for clarity
  const formatValueWithContext = (value: typeof MOCK_ATTRIBUTE_VALUES[0]): string => {
    // For system attributes with thresholds, include the range
    if (value.threshold) {
      const { min, max } = value.threshold;
      if (min !== undefined && max !== undefined) {
        // Range: e.g., "Medium (6-15 members)"
        if (value.attributeId === 'sys-team-size') {
          return `${value.name} (${min}-${max} members)`;
        } else if (value.attributeId === 'sys-tenure') {
          return `${value.name} (${min}-${max} months)`;
        }
        return `${value.name} (${min}-${max})`;
      } else if (min !== undefined) {
        // Min only: e.g., "Large (16+ members)"
        if (value.attributeId === 'sys-team-size') {
          return `${value.name} (${min}+ members)`;
        } else if (value.attributeId === 'sys-tenure') {
          return `${value.name} (${min}+ months)`;
        }
        return `${value.name} (${min}+)`;
      } else if (max !== undefined) {
        // Max only: e.g., "New (<6 months)"
        if (value.attributeId === 'sys-tenure') {
          return `${value.name} (<${max} months)`;
        }
        return `${value.name} (<${max})`;
      }
    }
    // For non-threshold values, use description if short enough
    if (value.description && value.description.length < 40) {
      return `${value.name} (${value.description.toLowerCase()})`;
    }
    return value.name;
  };

  // Add Team Attribute selections (Team Size, Tenure, Volume, Process, Work Type, Domain, etc.)
  for (const selection of criteria.categorySelections) {
    if (selection.selectedValueIds.length === 0) continue;

    // Find the attribute name
    const attribute = MOCK_ATTRIBUTES.find(a => a.id === selection.categoryId);
    if (!attribute) continue;

    // Find the selected value names with context
    const valueLabels = selection.selectedValueIds
      .map(valueId => {
        const value = MOCK_ATTRIBUTE_VALUES.find(v => v.id === valueId);
        return value ? formatValueWithContext(value) : null;
      })
      .filter((label): label is string => !!label);

    if (valueLabels.length > 0) {
      comparisonParts.push(`${attribute.name}: ${valueLabels.join(', ')}`);
    }
  }

  // Add specific teams if selected
  if (criteria.compareToSpecificTeams && criteria.specificTeamIds.length > 0) {
    comparisonParts.push(`${criteria.specificTeamIds.length} manually selected team(s)`);
  }

  // If no criteria were set (user didn't visit Step 2), use default comparison criteria
  // based on typical team attributes auto-populated from Jira
  if (comparisonParts.length === 0) {
    comparisonParts.push('Team Size: Medium (6-15 members)');
    comparisonParts.push('Tenure: Established (6-18 months)');
    comparisonParts.push('Process: Scrum (teams using sprint cycles)');
  }

  // Mock team count based on criteria (in reality this would come from the backend)
  const comparisonTeamCount = comparisonParts.length > 0 ? 47 : 0;

  const comparisonGroupDescription = comparisonParts.length > 0
    ? `Comparing against ${comparisonTeamCount} teams (${comparisonParts.join(', ')})`
    : 'No comparison group selected';

  // Create dimension results with percentile-based risk levels
  const dimension1Result: DimensionResult = {
    ...mockDimension1Result,
  };

  const dimension2Result: DimensionResult = {
    ...mockDimension2Result,
  };

  return {
    teamId: wizardState.step1.teamId || 'team-001',
    teamName: wizardState.step1.teamName || 'Your Team',
    generatedAt: new Date().toISOString(),
    dateRange,
    dataGrouping: wizardState.step1.dataGrouping,
    comparisonTeamCount,
    comparisonTeams: mockComparisonTeams,
    comparisonCriteria: comparisonParts,
    comparisonGroupDescription,
    dimensions: [dimension1Result, dimension2Result],
  };
};

// ============================================
// Helper Functions
// ============================================

export interface RiskLevelInfo {
  level: RiskLevel;
  label: string;
  description: string;
  color: { bg: string; text: string };
}

export const getRiskLevelInfo = (level: RiskLevel): RiskLevelInfo => {
  switch (level) {
    case 'low':
      return {
        level,
        label: 'Low Risk',
        description: 'Indicators are in the top third compared to similar teams',
        color: { bg: '#E3FCEF', text: '#006644' },
      };
    case 'moderate':
      return {
        level,
        label: 'Moderate Risk',
        description: 'Indicators are in the middle third compared to similar teams',
        color: { bg: '#FFFAE6', text: '#974F0C' },
      };
    case 'high':
      return {
        level,
        label: 'High Risk',
        description: 'Indicators are in the bottom third compared to similar teams',
        color: { bg: '#FFEBE6', text: '#BF2600' },
      };
  }
};

export const getRiskLevelColor = (level: RiskLevel): { bg: string; text: string } => {
  switch (level) {
    case 'low':
      return { bg: '#E3FCEF', text: '#006644' };  // Green
    case 'moderate':
      return { bg: '#FFFAE6', text: '#974F0C' };  // Yellow
    case 'high':
      return { bg: '#FFEBE6', text: '#BF2600' };  // Red
  }
};

export const getTrendColor = (direction: 'improving' | 'stable' | 'declining'): string => {
  switch (direction) {
    case 'improving':
      return '#006644';
    case 'stable':
      return '#6B778C';
    case 'declining':
      return '#BF2600';
  }
};

export const formatPercentile = (percentile: number): string => {
  if (percentile <= 10) return `bottom ${percentile}%`;
  if (percentile >= 90) return `top ${100 - percentile}%`;
  if (percentile < 50) return `bottom ${percentile}%`;
  return `top ${100 - percentile}%`;
};

// ============================================
// DIMENSION 2: Information Health
// "Do the issues capture what needs to be delivered?"
// ============================================

// Category 2.a: Availability of Key Information
const availabilityIndicators: IndicatorResult[] = [
  {
    id: 'acceptanceCriteria',
    name: 'Issues with acceptance criteria',
    description: 'Percentage of in-progress issues that have acceptance criteria defined. Clear acceptance criteria ensures everyone knows what "done" looks like.',
    whyItMatters: 'Without acceptance criteria, teams can\'t verify work is complete—scope creep and rework become inevitable.',
    value: 5,
    displayValue: '5%',
    unit: '%',
    benchmarkValue: 45,
    benchmarkDisplayValue: '45%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 6, benchmarkValue: 45 },
      { period: '2024-04', value: 5, benchmarkValue: 45 },
      { period: '2024-05', value: 6, benchmarkValue: 45 },
      { period: '2024-06', value: 5, benchmarkValue: 45 },
      { period: '2024-07', value: 6, benchmarkValue: 45 },
      { period: '2024-08', value: 5, benchmarkValue: 45 },
      { period: '2024-09', value: 6, benchmarkValue: 45 },
      { period: '2024-10', value: 5, benchmarkValue: 45 },
      { period: '2024-11', value: 5, benchmarkValue: 45 },
    ],
    distribution: { min: 2, max: 68, otherTeamValues: [8, 15, 22, 31, 38, 45, 52, 58, 62] },
  },
  {
    id: 'linksToIssues',
    name: 'Issues with links to related issues',
    description: 'Percentage of in-progress issues that have links to other issues (blockers, dependencies, related work). Links help teams understand work context and dependencies.',
    whyItMatters: 'Unlinked issues hide dependencies—teams don\'t see blockers or related work until it\'s too late.',
    value: 10,
    displayValue: '10%',
    unit: '%',
    benchmarkValue: 8,
    benchmarkDisplayValue: '8%',
    benchmarkComparison: 'top 20% of the comparison group',
    benchmarkPercentile: 80,
    trend: 'improving',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 4, benchmarkValue: 8 },
      { period: '2024-04', value: 5, benchmarkValue: 8 },
      { period: '2024-05', value: 5, benchmarkValue: 8 },
      { period: '2024-06', value: 6, benchmarkValue: 8 },
      { period: '2024-07', value: 7, benchmarkValue: 8 },
      { period: '2024-08', value: 8, benchmarkValue: 8 },
      { period: '2024-09', value: 8, benchmarkValue: 8 },
      { period: '2024-10', value: 9, benchmarkValue: 8 },
      { period: '2024-11', value: 10, benchmarkValue: 8 },
    ],
    distribution: { min: 2, max: 18, otherTeamValues: [3, 4, 5, 6, 7, 8, 9, 11, 14] },
  },
  {
    id: 'parentEpic',
    name: 'Issues with no parent Epic',
    description: 'Percentage of in-progress issues that have no parent Epic associated. Epics provide strategic context and help track larger initiatives.',
    whyItMatters: 'Orphaned issues lack strategic context—leadership can\'t see how day-to-day work connects to goals.',
    value: 50,
    displayValue: '50%',
    unit: '%',
    benchmarkValue: 20,
    benchmarkDisplayValue: '20%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 30, benchmarkValue: 20 },
      { period: '2024-04', value: 33, benchmarkValue: 20 },
      { period: '2024-05', value: 36, benchmarkValue: 20 },
      { period: '2024-06', value: 39, benchmarkValue: 20 },
      { period: '2024-07', value: 42, benchmarkValue: 20 },
      { period: '2024-08', value: 45, benchmarkValue: 20 },
      { period: '2024-09', value: 47, benchmarkValue: 20 },
      { period: '2024-10', value: 48, benchmarkValue: 20 },
      { period: '2024-11', value: 50, benchmarkValue: 20 },
    ],
    distribution: { min: 10, max: 72, otherTeamValues: [15, 20, 25, 32, 38, 45, 52, 58, 65] },
  },
  {
    id: 'estimates',
    name: 'Issues with no estimates',
    description: 'Percentage of in-progress issues that have no size estimate (story points, hours, or T-shirt size). Estimates enable planning and capacity management.',
    whyItMatters: 'Unestimated work makes capacity planning impossible—you can\'t predict delivery or identify overcommitment.',
    value: 89,
    displayValue: '89%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 87, benchmarkValue: 25 },
      { period: '2024-04', value: 88, benchmarkValue: 25 },
      { period: '2024-05', value: 88, benchmarkValue: 25 },
      { period: '2024-06', value: 89, benchmarkValue: 25 },
      { period: '2024-07', value: 88, benchmarkValue: 25 },
      { period: '2024-08', value: 89, benchmarkValue: 25 },
      { period: '2024-09', value: 88, benchmarkValue: 25 },
      { period: '2024-10', value: 89, benchmarkValue: 25 },
      { period: '2024-11', value: 89, benchmarkValue: 25 },
    ],
    distribution: { min: 12, max: 95, otherTeamValues: [18, 25, 32, 42, 55, 65, 75, 82, 90] },
  },
  {
    id: 'assignee',
    name: 'Issues with no assignee',
    description: 'Percentage of in-progress issues that have no one assigned to them. Unassigned work creates accountability gaps.',
    whyItMatters: 'No owner means no accountability—work sits idle or gets duplicated because nobody feels responsible.',
    value: 15,
    displayValue: '15%',
    unit: '%',
    benchmarkValue: 5,
    benchmarkDisplayValue: '5%',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 14, benchmarkValue: 5 },
      { period: '2024-04', value: 15, benchmarkValue: 5 },
      { period: '2024-05', value: 14, benchmarkValue: 5 },
      { period: '2024-06', value: 15, benchmarkValue: 5 },
      { period: '2024-07', value: 14, benchmarkValue: 5 },
      { period: '2024-08', value: 15, benchmarkValue: 5 },
      { period: '2024-09', value: 14, benchmarkValue: 5 },
      { period: '2024-10', value: 15, benchmarkValue: 5 },
      { period: '2024-11', value: 15, benchmarkValue: 5 },
    ],
    distribution: { min: 2, max: 28, otherTeamValues: [3, 5, 7, 9, 11, 14, 18, 22, 25] },
  },
  {
    id: 'dueDate',
    name: 'Issues with no due date',
    description: 'Percentage of in-progress issues without a due date or target completion. Due dates help manage expectations and prioritisation.',
    whyItMatters: 'Without due dates, everything feels equally urgent—prioritization becomes guesswork.',
    value: 68,
    displayValue: '68%',
    unit: '%',
    benchmarkValue: 30,
    benchmarkDisplayValue: '30%',
    benchmarkComparison: 'bottom 5% of the comparison group',
    benchmarkPercentile: 5,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 50, benchmarkValue: 30 },
      { period: '2024-04', value: 53, benchmarkValue: 30 },
      { period: '2024-05', value: 56, benchmarkValue: 30 },
      { period: '2024-06', value: 58, benchmarkValue: 30 },
      { period: '2024-07', value: 61, benchmarkValue: 30 },
      { period: '2024-08', value: 63, benchmarkValue: 30 },
      { period: '2024-09', value: 65, benchmarkValue: 30 },
      { period: '2024-10', value: 67, benchmarkValue: 30 },
      { period: '2024-11', value: 68, benchmarkValue: 30 },
    ],
    distribution: { min: 15, max: 85, otherTeamValues: [20, 28, 35, 42, 50, 58, 65, 72, 78] },
  },
  {
    id: 'subTasks',
    name: 'Large issues with sub-tasks',
    description: 'Percentage of larger work items (Stories, Tasks) that have been broken down into sub-tasks. Sub-tasks help track progress within larger items.',
    value: 10,
    displayValue: '10%',
    unit: '%',
    benchmarkValue: 35,
    benchmarkDisplayValue: '35%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 12, benchmarkValue: 35 },
      { period: '2024-04', value: 11, benchmarkValue: 35 },
      { period: '2024-05', value: 11, benchmarkValue: 35 },
      { period: '2024-06', value: 10, benchmarkValue: 35 },
      { period: '2024-07', value: 11, benchmarkValue: 35 },
      { period: '2024-08', value: 10, benchmarkValue: 35 },
      { period: '2024-09', value: 11, benchmarkValue: 35 },
      { period: '2024-10', value: 10, benchmarkValue: 35 },
      { period: '2024-11', value: 10, benchmarkValue: 35 },
    ],
    distribution: { min: 5, max: 55, otherTeamValues: [8, 15, 22, 28, 35, 40, 45, 48, 52] },
  },
  {
    id: 'prioritySet',
    name: 'Issues with priority other than Normal',
    description: 'Percentage of work items with an explicit priority set (not defaulting to "Normal"). Meaningful priority helps teams focus on what matters most.',
    value: 10,
    displayValue: '10%',
    unit: '%',
    benchmarkValue: 45,
    benchmarkDisplayValue: '45%',
    benchmarkComparison: 'bottom 85% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 12, benchmarkValue: 45 },
      { period: '2024-04', value: 11, benchmarkValue: 45 },
      { period: '2024-05', value: 12, benchmarkValue: 45 },
      { period: '2024-06', value: 11, benchmarkValue: 45 },
      { period: '2024-07', value: 10, benchmarkValue: 45 },
      { period: '2024-08', value: 11, benchmarkValue: 45 },
      { period: '2024-09', value: 12, benchmarkValue: 45 },
      { period: '2024-10', value: 11, benchmarkValue: 45 },
      { period: '2024-11', value: 10, benchmarkValue: 45 },
    ],
    distribution: { min: 5, max: 62, otherTeamValues: [12, 18, 25, 32, 38, 45, 50, 55, 58] },
  },
];

const availabilityCategory: IndicatorCategory = {
  id: 'availability',
  name: 'Availability of key information in tickets',
  shortName: 'Data Completeness',
  description: 'Measures whether critical fields are populated before work begins.',
  rationale: 'Incomplete tickets force teams to <strong>guess at requirements</strong> or chase down information mid-development. Missing acceptance criteria leads to rework, missing estimates prevents planning, and missing assignees create accountability gaps. These indicators measure the <strong>baseline information health</strong> of your tickets—whether the fields that matter are actually filled in.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: availabilityIndicators,
};

// Category 2.b: Quality of Readiness/Refinement
const readinessIndicators: IndicatorResult[] = [
  {
    id: 'infoAddedAfterCommitment',
    name: 'Key info added after commitment',
    description: 'Percentage of in-progress issues where key information (acceptance criteria, description, etc.) was added after moving to in-progress, suggesting the work was committed before being properly understood.',
    value: 12,
    displayValue: '12%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'top 20% of the comparison group',
    benchmarkPercentile: 80,
    trend: 'improving',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 28, benchmarkValue: 25 },
      { period: '2024-04', value: 26, benchmarkValue: 25 },
      { period: '2024-05', value: 24, benchmarkValue: 25 },
      { period: '2024-06', value: 22, benchmarkValue: 25 },
      { period: '2024-07', value: 20, benchmarkValue: 25 },
      { period: '2024-08', value: 17, benchmarkValue: 25 },
      { period: '2024-09', value: 15, benchmarkValue: 25 },
      { period: '2024-10', value: 14, benchmarkValue: 25 },
      { period: '2024-11', value: 12, benchmarkValue: 25 },
    ],
    distribution: { min: 5, max: 48, otherTeamValues: [8, 15, 20, 25, 30, 35, 38, 42, 45] },
  },
  {
    id: 'creationToCommitmentTime',
    name: 'Average days from creation to commitment',
    description: 'On average, issues are created just 1 day before being committed to a sprint. This is less than 90% of the comparison group, suggesting work is being picked up without adequate refinement.',
    value: 1,
    displayValue: '1 day',
    unit: 'days',
    benchmarkValue: 5,
    benchmarkDisplayValue: '5 days',
    benchmarkComparison: 'less time than 90% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 1.1, benchmarkValue: 5 },
      { period: '2024-04', value: 1.0, benchmarkValue: 5 },
      { period: '2024-05', value: 1.2, benchmarkValue: 5 },
      { period: '2024-06', value: 1.0, benchmarkValue: 5 },
      { period: '2024-07', value: 1.1, benchmarkValue: 5 },
      { period: '2024-08', value: 1.0, benchmarkValue: 5 },
      { period: '2024-09', value: 1.1, benchmarkValue: 5 },
      { period: '2024-10', value: 1.0, benchmarkValue: 5 },
      { period: '2024-11', value: 1.0, benchmarkValue: 5 },
    ],
    distribution: { min: 0.5, max: 12, otherTeamValues: [1.5, 2.5, 3.5, 5, 6, 7.5, 8.5, 10, 11] },
  },
  {
    id: 'midSprintMissingFields',
    name: 'Mid-sprint additions missing key fields',
    description: 'Percentage of issues added mid-sprint and moved directly to in-progress that were missing key fields. These items bypass normal refinement entirely.',
    value: 60,
    displayValue: '60%',
    unit: '%',
    benchmarkValue: 25,
    benchmarkDisplayValue: '25%',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 58, benchmarkValue: 25 },
      { period: '2024-04', value: 59, benchmarkValue: 25 },
      { period: '2024-05', value: 60, benchmarkValue: 25 },
      { period: '2024-06', value: 58, benchmarkValue: 25 },
      { period: '2024-07', value: 59, benchmarkValue: 25 },
      { period: '2024-08', value: 61, benchmarkValue: 25 },
      { period: '2024-09', value: 60, benchmarkValue: 25 },
      { period: '2024-10', value: 59, benchmarkValue: 25 },
      { period: '2024-11', value: 60, benchmarkValue: 25 },
    ],
    distribution: { min: 10, max: 78, otherTeamValues: [15, 20, 25, 32, 40, 48, 55, 65, 72] },
  },
  {
    id: 'firstTimePassRate',
    name: 'First-time-pass rate',
    description: 'Percentage of issues completed without being re-opened or sent back. Low first-time-pass often indicates incomplete requirements or unclear acceptance criteria.',
    value: 25,
    displayValue: '25%',
    unit: '%',
    benchmarkValue: 70,
    benchmarkDisplayValue: '70%',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'declining',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 42, benchmarkValue: 70 },
      { period: '2024-04', value: 40, benchmarkValue: 70 },
      { period: '2024-05', value: 38, benchmarkValue: 70 },
      { period: '2024-06', value: 35, benchmarkValue: 70 },
      { period: '2024-07', value: 33, benchmarkValue: 70 },
      { period: '2024-08', value: 30, benchmarkValue: 70 },
      { period: '2024-09', value: 28, benchmarkValue: 70 },
      { period: '2024-10', value: 26, benchmarkValue: 70 },
      { period: '2024-11', value: 25, benchmarkValue: 70 },
    ],
    distribution: { min: 18, max: 92, otherTeamValues: [28, 38, 48, 58, 68, 75, 80, 85, 88] },
  },
  {
    id: 'creationCommitmentCorrelation',
    name: 'Creation-to-commitment vs. carryover correlation',
    description: 'Strong correlation between short creation-to-commitment time and likelihood of the item being carried over to another sprint. Items rushed into sprints are more likely to not be completed.',
    value: 0.75,
    displayValue: '0.75',
    unit: 'correlation',
    benchmarkValue: 0.30,
    benchmarkDisplayValue: '0.30',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: false,
    whyItMatters: 'High correlation between when issues are created and committed suggests reactive planning rather than proactive roadmap execution.',
    trendData: [
      { period: '2024-03', value: 0.72, benchmarkValue: 0.30 },
      { period: '2024-04', value: 0.73, benchmarkValue: 0.30 },
      { period: '2024-05', value: 0.74, benchmarkValue: 0.30 },
      { period: '2024-06', value: 0.73, benchmarkValue: 0.30 },
      { period: '2024-07', value: 0.75, benchmarkValue: 0.30 },
      { period: '2024-08', value: 0.74, benchmarkValue: 0.30 },
      { period: '2024-09', value: 0.75, benchmarkValue: 0.30 },
      { period: '2024-10', value: 0.74, benchmarkValue: 0.30 },
      { period: '2024-11', value: 0.75, benchmarkValue: 0.30 },
    ],
    distribution: { min: 0.15, max: 0.88, otherTeamValues: [0.22, 0.30, 0.38, 0.45, 0.52, 0.60, 0.68, 0.78, 0.82] },
  },
  {
    id: 'changesCorrelation',
    name: 'Creation-to-commitment vs. changes correlation',
    description: 'Strong correlation between short creation-to-commitment time and likelihood of the item having changes (re-estimation, splitting, scope changes) during development.',
    value: 0.80,
    displayValue: '0.80',
    unit: 'correlation',
    benchmarkValue: 0.35,
    benchmarkDisplayValue: '0.35',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'declining',
    higherIsBetter: false,
    whyItMatters: 'When creation timing correlates with scope changes, it may indicate poor initial requirements gathering or unstable priorities.',
    trendData: [
      { period: '2024-03', value: 0.62, benchmarkValue: 0.35 },
      { period: '2024-04', value: 0.65, benchmarkValue: 0.35 },
      { period: '2024-05', value: 0.68, benchmarkValue: 0.35 },
      { period: '2024-06', value: 0.70, benchmarkValue: 0.35 },
      { period: '2024-07', value: 0.72, benchmarkValue: 0.35 },
      { period: '2024-08', value: 0.75, benchmarkValue: 0.35 },
      { period: '2024-09', value: 0.77, benchmarkValue: 0.35 },
      { period: '2024-10', value: 0.78, benchmarkValue: 0.35 },
      { period: '2024-11', value: 0.80, benchmarkValue: 0.35 },
    ],
    distribution: { min: 0.18, max: 0.92, otherTeamValues: [0.25, 0.32, 0.40, 0.48, 0.55, 0.65, 0.72, 0.82, 0.88] },
  },
  {
    id: 'timeToStability',
    name: 'Time-to-stability for priority',
    description: 'On average, an issue\'s priority rank is finalised 9 days before commitment. Our time-to-stability is longer than 80% of teams, suggesting priorities are being set too early when context is incomplete.',
    value: 9,
    displayValue: '9 days',
    unit: 'days',
    benchmarkValue: 3,
    benchmarkDisplayValue: '3 days',
    benchmarkComparison: 'longer than 80% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: false,
    whyItMatters: 'Long time-to-stability suggests priorities are set speculatively and revised repeatedly, adding noise to planning.',
    trendData: [
      { period: '2024-03', value: 8, benchmarkValue: 3 },
      { period: '2024-04', value: 9, benchmarkValue: 3 },
      { period: '2024-05', value: 8, benchmarkValue: 3 },
      { period: '2024-06', value: 9, benchmarkValue: 3 },
      { period: '2024-07', value: 8, benchmarkValue: 3 },
      { period: '2024-08', value: 9, benchmarkValue: 3 },
      { period: '2024-09', value: 9, benchmarkValue: 3 },
      { period: '2024-10', value: 8, benchmarkValue: 3 },
      { period: '2024-11', value: 9, benchmarkValue: 3 },
    ],
    distribution: { min: 1, max: 15, otherTeamValues: [2, 3, 4, 5, 6, 7, 10, 12, 14] },
  },
];

const readinessCategory: IndicatorCategory = {
  id: 'readiness',
  name: 'Quality of readiness and refinement process',
  shortName: 'Insights',
  description: 'Measures whether work is properly prepared before development begins.',
  rationale: 'Even when fields are filled, <strong>timing matters</strong>. Information added after work starts is a symptom of inadequate refinement. These indicators examine <strong>when</strong> information appears: is it there before commitment, or scrambled together mid-sprint? They also look at <strong>outcomes</strong>—high carryover rates and frequent re-opens often trace back to work that wasn\'t well-understood before it began.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: readinessIndicators,
};

// Dimension 2 Recommendations
const dimension2Recommendations: Recommendation[] = [
  {
    id: 'ac-template',
    title: 'Require Acceptance Criteria Template',
    description: 'Add a mandatory acceptance criteria field with a template. Block items from moving to in-progress without it.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'definition-of-ready',
    title: 'Enforce Definition of Ready',
    description: 'Define and enforce a checklist of required fields before work can be committed to a sprint.',
    category: 'governance',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'refinement-cadence',
    title: 'Establish Regular Refinement',
    description: 'Schedule recurring refinement sessions to ensure work is properly prepared at least one sprint ahead.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'estimate-before-commit',
    title: 'Require Estimates Before Sprint',
    description: 'Make estimation a prerequisite for sprint commitment. Use planning poker or relative sizing.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'priority-review',
    title: 'Review Priority Meaning',
    description: 'Audit whether your priority levels are meaningful. If high priority doesn\'t mean "do first", recalibrate or simplify.',
    category: 'governance',
    effort: 'medium',
    impact: 'medium',
  },
];

// Dimension 2 Complete Result
export const mockDimension2Result: DimensionResult = {
  dimensionKey: 'informationHealth',
  dimensionNumber: 2,
  dimensionName: 'Information Health',
  dimensionTitle: 'Information Health',
  questionForm: 'Do your tickets capture what needs to be delivered, in what order, and why?',
  riskDescription: 'tickets lack key information',
  spectrumLeftLabel: 'Tickets have all key details for delivery',
  spectrumRightLabel: 'Critical information missing from tickets',
  verdict: 'Below Average',
  verdictDescription: 'Your team shows gaps in ticket completeness and refinement quality that may impact delivery predictability.',
  riskLevel: 'moderate',
  overallPercentile: 28,
  // CHS Health Score: percentile 28 → z≈-0.58 → base 44, stable trend +0 = 44
  healthScore: 44,
  benchmarkComparison: 'bottom 28% of the comparison group',
  benchmarkPercentile: 28,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 30, benchmarkValue: 50 },
    { period: '2024-07', value: 29, benchmarkValue: 50 },
    { period: '2024-08', value: 28, benchmarkValue: 50 },
    { period: '2024-09', value: 28, benchmarkValue: 50 },
    { period: '2024-10', value: 28, benchmarkValue: 50 },
    { period: '2024-11', value: 28, benchmarkValue: 50 },
  ],
  categories: [availabilityCategory, readinessCategory],
  whyItMatters: 'Incomplete tickets lead to assumptions, rework, and unpredictable delivery.',
  whyItMattersPoints: [
    'Missing acceptance criteria leads to work being done incorrectly',
    'Unrefined work committed to sprints causes mid-sprint surprises',
    'Poor estimates make capacity planning impossible',
    'Meaningless priorities waste effort on the wrong things',
    'Re-work and carryover erode team morale and stakeholder trust',
  ],
  recommendations: dimension2Recommendations,
};

// ============================================
// DIMENSION 3: Estimation & Sizing Health
// "Can you plan and forecast effectively with your estimation practices?"
// ============================================

// Category 3.A: Estimation Coverage
const estimationCoverageIndicators: IndicatorResult[] = [
  {
    id: 'policyExclusions',
    name: 'Work not estimated by policy',
    description: 'Percentage of completed work that is not estimated by policy (Tasks, Bugs, etc.). These work types are excluded from estimation but still consume capacity.',
    value: 45,
    displayValue: '45%',
    unit: '%',
    benchmarkValue: 30,
    benchmarkDisplayValue: '30%',
    benchmarkComparison: 'higher than 75% of the comparison group',
    benchmarkPercentile: 25,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 43, benchmarkValue: 30 },
      { period: '2024-04', value: 44, benchmarkValue: 30 },
      { period: '2024-05', value: 44, benchmarkValue: 30 },
      { period: '2024-06', value: 45, benchmarkValue: 30 },
      { period: '2024-07', value: 44, benchmarkValue: 30 },
      { period: '2024-08', value: 45, benchmarkValue: 30 },
      { period: '2024-09', value: 44, benchmarkValue: 30 },
      { period: '2024-10', value: 45, benchmarkValue: 30 },
      { period: '2024-11', value: 45, benchmarkValue: 30 },
    ],
    distribution: { min: 15, max: 68, otherTeamValues: [20, 25, 30, 35, 40, 48, 55, 60, 65] },
  },
  {
    id: 'storyEstimationRate',
    name: 'Stories with estimates',
    description: 'Percentage of estimable stories that have size estimates (story points, hours, or T-shirt size). Stories without estimates cannot be used for capacity planning.',
    value: 85,
    displayValue: '85%',
    unit: '%',
    benchmarkValue: 92,
    benchmarkDisplayValue: '92%',
    benchmarkComparison: 'bottom 30% of the comparison group',
    benchmarkPercentile: 30,
    trend: 'improving',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 72, benchmarkValue: 92 },
      { period: '2024-04', value: 74, benchmarkValue: 92 },
      { period: '2024-05', value: 76, benchmarkValue: 92 },
      { period: '2024-06', value: 78, benchmarkValue: 92 },
      { period: '2024-07', value: 80, benchmarkValue: 92 },
      { period: '2024-08', value: 82, benchmarkValue: 92 },
      { period: '2024-09', value: 83, benchmarkValue: 92 },
      { period: '2024-10', value: 84, benchmarkValue: 92 },
      { period: '2024-11', value: 85, benchmarkValue: 92 },
    ],
    distribution: { min: 55, max: 98, otherTeamValues: [62, 70, 78, 85, 90, 92, 94, 96, 97] },
  },
  {
    id: 'epicEstimationRate',
    name: 'Epics with estimates',
    description: 'Percentage of epics that have size estimates at the epic level. Epic estimates enable roadmap planning and portfolio-level forecasting.',
    value: 60,
    displayValue: '60%',
    unit: '%',
    benchmarkValue: 75,
    benchmarkDisplayValue: '75%',
    benchmarkComparison: 'bottom 25% of the comparison group',
    benchmarkPercentile: 25,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 58, benchmarkValue: 75 },
      { period: '2024-04', value: 59, benchmarkValue: 75 },
      { period: '2024-05', value: 60, benchmarkValue: 75 },
      { period: '2024-06', value: 59, benchmarkValue: 75 },
      { period: '2024-07', value: 60, benchmarkValue: 75 },
      { period: '2024-08', value: 59, benchmarkValue: 75 },
      { period: '2024-09', value: 60, benchmarkValue: 75 },
      { period: '2024-10', value: 60, benchmarkValue: 75 },
      { period: '2024-11', value: 60, benchmarkValue: 75 },
    ],
    distribution: { min: 35, max: 92, otherTeamValues: [42, 50, 58, 68, 75, 80, 85, 88, 90] },
  },
  {
    id: 'epicRollupCoverage',
    name: 'Epics with full child coverage',
    description: 'Percentage of epics where more than 50% of child issues have estimates. Low rollup coverage means epic-level forecasts are unreliable.',
    value: 35,
    displayValue: '35%',
    unit: '%',
    benchmarkValue: 65,
    benchmarkDisplayValue: '65%',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'declining',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 52, benchmarkValue: 65 },
      { period: '2024-04', value: 50, benchmarkValue: 65 },
      { period: '2024-05', value: 48, benchmarkValue: 65 },
      { period: '2024-06', value: 45, benchmarkValue: 65 },
      { period: '2024-07', value: 43, benchmarkValue: 65 },
      { period: '2024-08', value: 40, benchmarkValue: 65 },
      { period: '2024-09', value: 38, benchmarkValue: 65 },
      { period: '2024-10', value: 36, benchmarkValue: 65 },
      { period: '2024-11', value: 35, benchmarkValue: 65 },
    ],
    distribution: { min: 20, max: 88, otherTeamValues: [28, 38, 48, 58, 65, 72, 78, 82, 85] },
  },
  {
    id: 'subTaskEstimation',
    name: 'Sub-tasks with estimates',
    description: 'Percentage of sub-tasks that have estimates. Sub-task estimation enables more granular tracking but is optional in most teams.',
    value: 20,
    displayValue: '20%',
    unit: '%',
    benchmarkValue: 40,
    benchmarkDisplayValue: '40%',
    benchmarkComparison: 'bottom 35% of the comparison group',
    benchmarkPercentile: 35,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 22, benchmarkValue: 40 },
      { period: '2024-04', value: 21, benchmarkValue: 40 },
      { period: '2024-05', value: 20, benchmarkValue: 40 },
      { period: '2024-06', value: 21, benchmarkValue: 40 },
      { period: '2024-07', value: 20, benchmarkValue: 40 },
      { period: '2024-08', value: 21, benchmarkValue: 40 },
      { period: '2024-09', value: 20, benchmarkValue: 40 },
      { period: '2024-10', value: 20, benchmarkValue: 40 },
      { period: '2024-11', value: 20, benchmarkValue: 40 },
    ],
    distribution: { min: 5, max: 65, otherTeamValues: [10, 18, 25, 32, 40, 48, 52, 58, 62] },
  },
];

const estimationCoverageCategory: IndicatorCategory = {
  id: 'estimationCoverage',
  name: 'Estimation Coverage',
  shortName: 'Coverage',
  description: 'What proportion of your work is estimated and usable for planning?',
  rationale: 'Before assessing estimate quality, you need to know <strong>how much of your work is even estimated</strong>. If 45% of work is Tasks (unestimated by policy), only 55% contributes to velocity. Of that, if 15% of stories lack estimates, your <strong>planning baseline is incomplete</strong>. These indicators measure the raw coverage of your estimation practices.',
  statusColor: '#FFFAE6',
  status: 'moderate',
  issuesCount: 3,
  indicators: estimationCoverageIndicators,
};

// Category 3.B: Estimate Quality & Reliability
const estimateQualityIndicators: IndicatorResult[] = [
  {
    id: 'storyConsistencyWithin',
    name: 'Story estimation consistency (within team)',
    description: 'How consistently does your team estimate similar-sized work? High variability suggests estimation guidelines are unclear or not followed.',
    value: 0.65,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.30,
    benchmarkDisplayValue: 'Low variance',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.62, benchmarkValue: 0.30 },
      { period: '2024-04', value: 0.63, benchmarkValue: 0.30 },
      { period: '2024-05', value: 0.64, benchmarkValue: 0.30 },
      { period: '2024-06', value: 0.63, benchmarkValue: 0.30 },
      { period: '2024-07', value: 0.64, benchmarkValue: 0.30 },
      { period: '2024-08', value: 0.65, benchmarkValue: 0.30 },
      { period: '2024-09', value: 0.64, benchmarkValue: 0.30 },
      { period: '2024-10', value: 0.65, benchmarkValue: 0.30 },
      { period: '2024-11', value: 0.65, benchmarkValue: 0.30 },
    ],
    distribution: { min: 0.15, max: 0.85, otherTeamValues: [0.22, 0.30, 0.38, 0.45, 0.52, 0.60, 0.68, 0.75, 0.80] },
  },
  {
    id: 'storyConsistencyAcross',
    name: 'Story estimation consistency (vs. other teams)',
    description: 'How do your story estimates compare to other teams for similar work? Large deviations suggest calibration issues.',
    value: 0.72,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.35,
    benchmarkDisplayValue: 'Low variance',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.58, benchmarkValue: 0.35 },
      { period: '2024-04', value: 0.60, benchmarkValue: 0.35 },
      { period: '2024-05', value: 0.62, benchmarkValue: 0.35 },
      { period: '2024-06', value: 0.64, benchmarkValue: 0.35 },
      { period: '2024-07', value: 0.66, benchmarkValue: 0.35 },
      { period: '2024-08', value: 0.68, benchmarkValue: 0.35 },
      { period: '2024-09', value: 0.69, benchmarkValue: 0.35 },
      { period: '2024-10', value: 0.71, benchmarkValue: 0.35 },
      { period: '2024-11', value: 0.72, benchmarkValue: 0.35 },
    ],
    distribution: { min: 0.18, max: 0.92, otherTeamValues: [0.25, 0.32, 0.40, 0.50, 0.58, 0.65, 0.75, 0.82, 0.88] },
  },
  {
    id: 'epicConsistencyWithin',
    name: 'Epic estimation consistency (within team)',
    description: 'How consistently does your team estimate epics? Epic estimates should show similar variance to story estimates.',
    value: 0.85,
    displayValue: 'Very high variance',
    unit: 'cv',
    benchmarkValue: 0.45,
    benchmarkDisplayValue: 'Moderate variance',
    benchmarkComparison: 'bottom 5% of the comparison group',
    benchmarkPercentile: 5,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.70, benchmarkValue: 0.45 },
      { period: '2024-04', value: 0.72, benchmarkValue: 0.45 },
      { period: '2024-05', value: 0.74, benchmarkValue: 0.45 },
      { period: '2024-06', value: 0.76, benchmarkValue: 0.45 },
      { period: '2024-07', value: 0.79, benchmarkValue: 0.45 },
      { period: '2024-08', value: 0.81, benchmarkValue: 0.45 },
      { period: '2024-09', value: 0.83, benchmarkValue: 0.45 },
      { period: '2024-10', value: 0.84, benchmarkValue: 0.45 },
      { period: '2024-11', value: 0.85, benchmarkValue: 0.45 },
    ],
    distribution: { min: 0.25, max: 0.95, otherTeamValues: [0.32, 0.40, 0.48, 0.55, 0.62, 0.72, 0.80, 0.88, 0.92] },
  },
  {
    id: 'epicConsistencyAcross',
    name: 'Epic estimation consistency (vs. other teams)',
    description: 'How do your epic estimates compare to other teams? Cross-team calibration is important for portfolio planning.',
    value: 0.78,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.40,
    benchmarkDisplayValue: 'Moderate variance',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.76, benchmarkValue: 0.40 },
      { period: '2024-04', value: 0.77, benchmarkValue: 0.40 },
      { period: '2024-05', value: 0.78, benchmarkValue: 0.40 },
      { period: '2024-06', value: 0.77, benchmarkValue: 0.40 },
      { period: '2024-07', value: 0.78, benchmarkValue: 0.40 },
      { period: '2024-08', value: 0.77, benchmarkValue: 0.40 },
      { period: '2024-09', value: 0.78, benchmarkValue: 0.40 },
      { period: '2024-10', value: 0.77, benchmarkValue: 0.40 },
      { period: '2024-11', value: 0.78, benchmarkValue: 0.40 },
    ],
    distribution: { min: 0.22, max: 0.92, otherTeamValues: [0.30, 0.38, 0.45, 0.52, 0.60, 0.70, 0.78, 0.85, 0.90] },
  },
  {
    id: 'epicDistribution',
    name: 'Work distribution across epics',
    description: 'How evenly is estimated work distributed across epics? Concentration in few epics limits forecasting granularity.',
    value: 80,
    displayValue: '80% in top 3',
    unit: '%',
    benchmarkValue: 50,
    benchmarkDisplayValue: '50% in top 3',
    benchmarkComparison: 'more concentrated than 85% of teams',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 78, benchmarkValue: 50 },
      { period: '2024-04', value: 79, benchmarkValue: 50 },
      { period: '2024-05', value: 80, benchmarkValue: 50 },
      { period: '2024-06', value: 79, benchmarkValue: 50 },
      { period: '2024-07', value: 80, benchmarkValue: 50 },
      { period: '2024-08', value: 79, benchmarkValue: 50 },
      { period: '2024-09', value: 80, benchmarkValue: 50 },
      { period: '2024-10', value: 79, benchmarkValue: 50 },
      { period: '2024-11', value: 80, benchmarkValue: 50 },
    ],
    distribution: { min: 35, max: 95, otherTeamValues: [40, 48, 55, 62, 70, 78, 85, 90, 92] },
  },
  {
    id: 'originalEstimateCapture',
    name: 'Original estimate preservation',
    description: 'Percentage of re-estimated items where the original estimate was preserved. Losing original estimates prevents learning from estimation accuracy.',
    value: 40,
    displayValue: '40%',
    unit: '%',
    benchmarkValue: 85,
    benchmarkDisplayValue: '85%',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 42, benchmarkValue: 85 },
      { period: '2024-04', value: 41, benchmarkValue: 85 },
      { period: '2024-05', value: 40, benchmarkValue: 85 },
      { period: '2024-06', value: 41, benchmarkValue: 85 },
      { period: '2024-07', value: 40, benchmarkValue: 85 },
      { period: '2024-08', value: 41, benchmarkValue: 85 },
      { period: '2024-09', value: 40, benchmarkValue: 85 },
      { period: '2024-10', value: 40, benchmarkValue: 85 },
      { period: '2024-11', value: 40, benchmarkValue: 85 },
    ],
    distribution: { min: 25, max: 95, otherTeamValues: [32, 42, 55, 68, 78, 85, 88, 92, 94] },
  },
  {
    id: 'reEstimationLearning',
    name: 'Re-estimation on carryover',
    description: 'Percentage of carried-over items that were re-estimated based on learnings. Only 5% of your carried-over items get re-estimated.',
    value: 5,
    displayValue: '5%',
    unit: '%',
    benchmarkValue: 35,
    benchmarkDisplayValue: '35%',
    benchmarkComparison: 'bottom 20% of the comparison group',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: true,
    trendData: [
      { period: '2024-03', value: 6, benchmarkValue: 35 },
      { period: '2024-04', value: 5, benchmarkValue: 35 },
      { period: '2024-05', value: 6, benchmarkValue: 35 },
      { period: '2024-06', value: 5, benchmarkValue: 35 },
      { period: '2024-07', value: 5, benchmarkValue: 35 },
      { period: '2024-08', value: 6, benchmarkValue: 35 },
      { period: '2024-09', value: 5, benchmarkValue: 35 },
      { period: '2024-10', value: 5, benchmarkValue: 35 },
      { period: '2024-11', value: 5, benchmarkValue: 35 },
    ],
    distribution: { min: 2, max: 62, otherTeamValues: [8, 15, 22, 30, 38, 45, 52, 55, 58] },
  },
];

const estimateQualityCategory: IndicatorCategory = {
  id: 'estimateQuality',
  name: 'Estimate Quality & Reliability',
  shortName: 'Quality',
  description: 'For work that IS estimated, how consistent and reliable are those estimates?',
  rationale: 'Having estimates isn\'t enough—they need to be <strong>consistent and reliable</strong>. If the same work is estimated as 3 points by one person and 8 by another, planning becomes guesswork. These indicators measure <strong>estimation variance</strong> within your team and compared to others, whether you <strong>preserve original estimates</strong> for learning, and whether you <strong>re-estimate based on experience</strong>.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: estimateQualityIndicators,
};

// Category 3.C: Size Consistency (Non-Estimated Work)
const sizeConsistencyIndicators: IndicatorResult[] = [
  {
    id: 'taskSizeConsistencyWithin',
    name: 'Task duration consistency (within team)',
    description: 'How consistently do tasks (unestimated by policy) take similar time to complete? High variance makes forecasting difficult even without estimates.',
    value: 0.75,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.35,
    benchmarkDisplayValue: 'Low variance',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.58, benchmarkValue: 0.35 },
      { period: '2024-04', value: 0.60, benchmarkValue: 0.35 },
      { period: '2024-05', value: 0.63, benchmarkValue: 0.35 },
      { period: '2024-06', value: 0.65, benchmarkValue: 0.35 },
      { period: '2024-07', value: 0.68, benchmarkValue: 0.35 },
      { period: '2024-08', value: 0.71, benchmarkValue: 0.35 },
      { period: '2024-09', value: 0.73, benchmarkValue: 0.35 },
      { period: '2024-10', value: 0.74, benchmarkValue: 0.35 },
      { period: '2024-11', value: 0.75, benchmarkValue: 0.35 },
    ],
    distribution: { min: 0.18, max: 0.92, otherTeamValues: [0.25, 0.32, 0.40, 0.50, 0.58, 0.68, 0.78, 0.85, 0.88] },
  },
  {
    id: 'taskSizeConsistencyAcross',
    name: 'Task duration consistency (vs. other teams)',
    description: 'How do your task durations compare to similar teams? Large deviations may indicate process differences or scope inconsistencies.',
    value: 0.70,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.40,
    benchmarkDisplayValue: 'Moderate variance',
    benchmarkComparison: 'bottom 15% of the comparison group',
    benchmarkPercentile: 15,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.68, benchmarkValue: 0.40 },
      { period: '2024-04', value: 0.69, benchmarkValue: 0.40 },
      { period: '2024-05', value: 0.70, benchmarkValue: 0.40 },
      { period: '2024-06', value: 0.69, benchmarkValue: 0.40 },
      { period: '2024-07', value: 0.70, benchmarkValue: 0.40 },
      { period: '2024-08', value: 0.69, benchmarkValue: 0.40 },
      { period: '2024-09', value: 0.70, benchmarkValue: 0.40 },
      { period: '2024-10', value: 0.69, benchmarkValue: 0.40 },
      { period: '2024-11', value: 0.70, benchmarkValue: 0.40 },
    ],
    distribution: { min: 0.20, max: 0.88, otherTeamValues: [0.28, 0.35, 0.42, 0.50, 0.58, 0.65, 0.72, 0.80, 0.85] },
  },
  {
    id: 'epicDurationConsistencyWithin',
    name: 'Epic duration consistency (within team)',
    description: 'How consistently do your epics take similar time to complete? Epic duration variance affects roadmap reliability.',
    value: 0.90,
    displayValue: 'Very high variance',
    unit: 'cv',
    benchmarkValue: 0.50,
    benchmarkDisplayValue: 'Moderate variance',
    benchmarkComparison: 'bottom 5% of the comparison group',
    benchmarkPercentile: 5,
    trend: 'declining',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.72, benchmarkValue: 0.50 },
      { period: '2024-04', value: 0.75, benchmarkValue: 0.50 },
      { period: '2024-05', value: 0.78, benchmarkValue: 0.50 },
      { period: '2024-06', value: 0.80, benchmarkValue: 0.50 },
      { period: '2024-07', value: 0.83, benchmarkValue: 0.50 },
      { period: '2024-08', value: 0.86, benchmarkValue: 0.50 },
      { period: '2024-09', value: 0.87, benchmarkValue: 0.50 },
      { period: '2024-10', value: 0.89, benchmarkValue: 0.50 },
      { period: '2024-11', value: 0.90, benchmarkValue: 0.50 },
    ],
    distribution: { min: 0.30, max: 0.98, otherTeamValues: [0.38, 0.45, 0.52, 0.60, 0.70, 0.78, 0.85, 0.92, 0.95] },
  },
  {
    id: 'epicDurationConsistencyAcross',
    name: 'Epic duration consistency (vs. other teams)',
    description: 'How do your epic durations compare to similar teams? Cross-team comparison helps calibrate expectations.',
    value: 0.82,
    displayValue: 'High variance',
    unit: 'cv',
    benchmarkValue: 0.45,
    benchmarkDisplayValue: 'Moderate variance',
    benchmarkComparison: 'bottom 10% of the comparison group',
    benchmarkPercentile: 10,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 0.80, benchmarkValue: 0.45 },
      { period: '2024-04', value: 0.81, benchmarkValue: 0.45 },
      { period: '2024-05', value: 0.82, benchmarkValue: 0.45 },
      { period: '2024-06', value: 0.81, benchmarkValue: 0.45 },
      { period: '2024-07', value: 0.82, benchmarkValue: 0.45 },
      { period: '2024-08', value: 0.81, benchmarkValue: 0.45 },
      { period: '2024-09', value: 0.82, benchmarkValue: 0.45 },
      { period: '2024-10', value: 0.81, benchmarkValue: 0.45 },
      { period: '2024-11', value: 0.82, benchmarkValue: 0.45 },
    ],
    distribution: { min: 0.25, max: 0.95, otherTeamValues: [0.32, 0.40, 0.48, 0.55, 0.65, 0.75, 0.82, 0.88, 0.92] },
  },
  {
    id: 'epicConcentration',
    name: 'Non-estimated work distribution',
    description: 'How is non-estimated work (Tasks, Bugs) distributed across epics? Concentration makes capacity allocation difficult.',
    value: 75,
    displayValue: '75% in top 3',
    unit: '%',
    benchmarkValue: 45,
    benchmarkDisplayValue: '45% in top 3',
    benchmarkComparison: 'more concentrated than 80% of teams',
    benchmarkPercentile: 20,
    trend: 'stable',
    higherIsBetter: false,
    trendData: [
      { period: '2024-03', value: 73, benchmarkValue: 45 },
      { period: '2024-04', value: 74, benchmarkValue: 45 },
      { period: '2024-05', value: 75, benchmarkValue: 45 },
      { period: '2024-06', value: 74, benchmarkValue: 45 },
      { period: '2024-07', value: 75, benchmarkValue: 45 },
      { period: '2024-08', value: 74, benchmarkValue: 45 },
      { period: '2024-09', value: 75, benchmarkValue: 45 },
      { period: '2024-10', value: 74, benchmarkValue: 45 },
      { period: '2024-11', value: 75, benchmarkValue: 45 },
    ],
    distribution: { min: 30, max: 92, otherTeamValues: [38, 45, 52, 58, 65, 72, 80, 85, 88] },
  },
];

const sizeConsistencyCategory: IndicatorCategory = {
  id: 'sizeConsistency',
  name: 'Size Consistency (Non-Estimated Work)',
  shortName: 'Consistency',
  description: 'For work you DON\'T estimate, are actual sizes consistent enough for forecasting?',
  rationale: 'Even if you don\'t estimate Tasks or Bugs by policy, their <strong>actual sizes should be predictable</strong> for effective planning. If Tasks vary wildly in duration, you can\'t reliably forecast capacity. These indicators measure whether your <strong>non-estimated work is naturally consistent</strong>—making estimation optional—or highly variable—making estimation necessary.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 4,
  indicators: sizeConsistencyIndicators,
};

// Dimension 3: Estimation Coverage
const dimension3CoverageRecommendations: Recommendation[] = [
  {
    id: 'estimation-policy',
    title: 'Clarify Estimation Policy',
    description: 'Document which work types require estimates and why. Ensure the team understands what should be estimated vs. what is excluded by policy.',
    category: 'governance',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'epic-coverage',
    title: 'Improve Epic Rollup Coverage',
    description: 'Ensure epics have sufficient child estimates before work begins. Set a minimum threshold (e.g., 50% of children estimated).',
    category: 'process',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'estimate-before-commit',
    title: 'Require Estimates Before Sprint',
    description: 'Make estimation a prerequisite for sprint commitment. Use planning poker or relative sizing.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
];

export const mockDimension3Result: DimensionResult = {
  dimensionKey: 'estimationCoverage',
  dimensionNumber: 3,
  dimensionName: 'Estimation Coverage',
  dimensionTitle: 'Estimation Coverage',
  questionForm: 'How much of your work is estimated?',
  riskDescription: 'your work lacks estimates',
  spectrumLeftLabel: 'Most work items have size estimates',
  spectrumRightLabel: 'Work regularly enters sprints unestimated',
  verdict: 'Below Average',
  verdictDescription: 'A significant portion of your work lacks estimates, limiting your ability to plan and forecast effectively.',
  riskLevel: 'moderate',
  overallPercentile: 26,
  // CHS Health Score: percentile 26 → z≈-0.64 → base 44, stable +0 = 44
  healthScore: 44,
  benchmarkComparison: 'bottom 26% of the comparison group',
  benchmarkPercentile: 26,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 28, benchmarkValue: 50 },
    { period: '2024-07', value: 27, benchmarkValue: 50 },
    { period: '2024-08', value: 26, benchmarkValue: 50 },
    { period: '2024-09', value: 26, benchmarkValue: 50 },
    { period: '2024-10', value: 26, benchmarkValue: 50 },
    { period: '2024-11', value: 26, benchmarkValue: 50 },
  ],
  categories: [estimationCoverageCategory],
  whyItMatters: 'Without estimates on your work, capacity planning and forecasting become guesswork.',
  whyItMattersPoints: [
    'Missing estimates create blind spots in capacity management',
    'Velocity calculations exclude unestimated work',
    'Sprint commitments become unreliable',
    'Roadmap projections lack foundation',
  ],
  recommendations: dimension3CoverageRecommendations,
};

// Dimension 4: Estimation & Sizing Consistency
const dimension4ConsistencyRecommendations: Recommendation[] = [
  {
    id: 'estimation-calibration',
    title: 'Regular Estimation Calibration',
    description: 'Hold quarterly calibration sessions where the team estimates reference stories together to align on sizing standards.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'preserve-originals',
    title: 'Preserve Original Estimates',
    description: 'Configure Jira to capture original estimates in a separate field when items are re-estimated. This enables learning from estimation accuracy.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'carryover-reestimate',
    title: 'Re-estimate Carried Work',
    description: 'Establish a practice of re-estimating carried-over items based on what was learned. Original work remaining is often less than originally thought.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'task-scoping',
    title: 'Standardize Task Scoping',
    description: 'Create guidelines for task scoping to reduce duration variance. Consider time-boxing or breaking large tasks into smaller, consistent chunks.',
    category: 'process',
    effort: 'medium',
    impact: 'medium',
  },
];

export const mockDimension4Result: DimensionResult = {
  dimensionKey: 'sizingConsistency',
  dimensionNumber: 4,
  dimensionName: 'Sizing Consistency',
  dimensionTitle: 'Sizing Consistency',
  questionForm: 'Are your estimates and work sizes reliable for forecasting?',
  riskDescription: 'your estimates are unreliable',
  spectrumLeftLabel: 'Estimates reliably predict actual effort',
  spectrumRightLabel: 'Wide variance between estimates and actuals',
  verdict: 'Needs Attention',
  verdictDescription: 'Your estimates show high variance and non-estimated work sizes are unpredictable, making forecasting unreliable.',
  riskLevel: 'high',
  overallPercentile: 12,
  // CHS Health Score: percentile 12 → z≈-1.17 → base 38, declining -5 = 33
  healthScore: 33,
  benchmarkComparison: 'bottom 12% of the comparison group',
  benchmarkPercentile: 12,
  trend: 'declining',
  trendData: [
    { period: '2024-06', value: 18, benchmarkValue: 50 },
    { period: '2024-07', value: 16, benchmarkValue: 50 },
    { period: '2024-08', value: 15, benchmarkValue: 50 },
    { period: '2024-09', value: 14, benchmarkValue: 50 },
    { period: '2024-10', value: 13, benchmarkValue: 50 },
    { period: '2024-11', value: 12, benchmarkValue: 50 },
  ],
  categories: [estimateQualityCategory, sizeConsistencyCategory],
  whyItMatters: 'Inconsistent estimates and variable work sizes make velocity meaningless and forecasts unreliable.',
  whyItMattersPoints: [
    'High estimation variance means the same work gets wildly different estimates',
    'Non-estimated work with variable durations disrupts sprint commitments',
    'Lost original estimates prevent learning from past accuracy',
    'Poor calibration across teams undermines portfolio planning',
  ],
  recommendations: dimension4ConsistencyRecommendations,
};

// ==========================================
// DIMENSION 5: Issue Type Consistency
// ==========================================

const issueTypeConsistencyCategory: IndicatorCategory = {
  id: 'issueTypeConsistency',
  name: 'Issue Type Usage Patterns',
  shortName: 'Issue Type Consistency',
  description: 'How consistently do you use different issue types?',
  rationale: `
    <strong>Issue type consistency</strong> measures how uniformly your team uses different issue types
    compared to established patterns. When teams use issue types inconsistently, it becomes difficult
    to compare metrics, track work accurately, and generate meaningful reports.
  `,
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 4,
  indicators: [
    {
      id: 'withinTeamIssueTypeConsistency',
      name: 'Within-team Issue Type Consistency',
      description: 'How consistently does your team use issue types compared to your own historical patterns?',
      value: 0.4,
      unit: 'score',
      displayValue: '0.4 (Poor)',
      benchmarkValue: 0.75,
      benchmarkDisplayValue: '0.75 (Good)',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0.38, benchmarkValue: 0.75 },
        { period: '2024-04', value: 0.39, benchmarkValue: 0.75 },
        { period: '2024-05', value: 0.40, benchmarkValue: 0.75 },
        { period: '2024-06', value: 0.42, benchmarkValue: 0.75 },
        { period: '2024-07', value: 0.41, benchmarkValue: 0.75 },
        { period: '2024-08', value: 0.40, benchmarkValue: 0.75 },
        { period: '2024-09', value: 0.39, benchmarkValue: 0.75 },
        { period: '2024-10', value: 0.40, benchmarkValue: 0.75 },
        { period: '2024-11', value: 0.40, benchmarkValue: 0.75 },
      ],
      distribution: { min: 0.25, max: 0.92, otherTeamValues: [0.35, 0.48, 0.55, 0.62, 0.72, 0.78, 0.85, 0.88] },
    },
    {
      id: 'acrossTeamIssueTypeConsistency',
      name: 'Across-team Issue Type Consistency',
      description: 'How consistently does your team use issue types compared to other teams in your organization?',
      value: 0.4,
      unit: 'score',
      displayValue: '0.4 (Poor)',
      benchmarkValue: 0.72,
      benchmarkDisplayValue: '0.72 (Good)',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0.38, benchmarkValue: 0.72 },
        { period: '2024-04', value: 0.40, benchmarkValue: 0.72 },
        { period: '2024-05', value: 0.41, benchmarkValue: 0.72 },
        { period: '2024-06', value: 0.43, benchmarkValue: 0.72 },
        { period: '2024-07', value: 0.42, benchmarkValue: 0.72 },
        { period: '2024-08', value: 0.41, benchmarkValue: 0.72 },
        { period: '2024-09', value: 0.40, benchmarkValue: 0.72 },
        { period: '2024-10', value: 0.40, benchmarkValue: 0.72 },
        { period: '2024-11', value: 0.40, benchmarkValue: 0.72 },
      ],
      distribution: { min: 0.22, max: 0.88, otherTeamValues: [0.32, 0.45, 0.52, 0.58, 0.68, 0.75, 0.82, 0.86] },
    },
    {
      id: 'issueTypeVolumeVariability',
      name: 'Issue Type Volume Variability',
      description: 'How variable is the number of issues created for each issue type over time?',
      value: 2.8,
      unit: 'multiplier',
      displayValue: '2.8x variance',
      benchmarkValue: 1.4,
      benchmarkDisplayValue: '1.4x variance',
      benchmarkComparison: 'bottom 15% of the comparison group',
      benchmarkPercentile: 15,
      trend: 'declining',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 2.1, benchmarkValue: 1.4 },
        { period: '2024-04', value: 2.2, benchmarkValue: 1.4 },
        { period: '2024-05', value: 2.3, benchmarkValue: 1.4 },
        { period: '2024-06', value: 2.4, benchmarkValue: 1.4 },
        { period: '2024-07', value: 2.5, benchmarkValue: 1.4 },
        { period: '2024-08', value: 2.6, benchmarkValue: 1.4 },
        { period: '2024-09', value: 2.7, benchmarkValue: 1.4 },
        { period: '2024-10', value: 2.8, benchmarkValue: 1.4 },
        { period: '2024-11', value: 2.8, benchmarkValue: 1.4 },
      ],
      distribution: { min: 1.1, max: 3.5, otherTeamValues: [1.2, 1.4, 1.6, 1.9, 2.2, 2.5, 2.8, 3.2] },
    },
    {
      id: 'issueTypeSizeVariability',
      name: 'Issue Type Size Variability',
      description: 'How variable are the sizes of issues within each issue type?',
      value: 3.2,
      unit: 'multiplier',
      displayValue: '3.2x variance',
      benchmarkValue: 1.8,
      benchmarkDisplayValue: '1.8x variance',
      benchmarkComparison: 'bottom 12% of the comparison group',
      benchmarkPercentile: 12,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 2.8, benchmarkValue: 1.8 },
        { period: '2024-04', value: 2.9, benchmarkValue: 1.8 },
        { period: '2024-05', value: 2.9, benchmarkValue: 1.8 },
        { period: '2024-06', value: 3.0, benchmarkValue: 1.8 },
        { period: '2024-07', value: 3.1, benchmarkValue: 1.8 },
        { period: '2024-08', value: 3.2, benchmarkValue: 1.8 },
        { period: '2024-09', value: 3.2, benchmarkValue: 1.8 },
        { period: '2024-10', value: 3.2, benchmarkValue: 1.8 },
        { period: '2024-11', value: 3.2, benchmarkValue: 1.8 },
      ],
      distribution: { min: 1.2, max: 4.0, otherTeamValues: [1.4, 1.6, 1.8, 2.1, 2.5, 2.9, 3.4, 3.8] },
    },
  ],
};

const dimension5Recommendations: Recommendation[] = [
  {
    id: 'rec-d5-1',
    title: 'Document Issue Type Definitions',
    description: 'Create clear definitions for when to use each issue type. Include examples and edge cases to reduce ambiguity.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d5-2',
    title: 'Review Issue Type Usage in Sprint Retros',
    description: 'Add a quick check in retrospectives to discuss if issue types were used consistently and identify patterns.',
    category: 'culture',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec-d5-3',
    title: 'Simplify Issue Type Schema',
    description: 'Consider consolidating rarely-used issue types to reduce confusion and improve consistency.',
    category: 'governance',
    effort: 'medium',
    impact: 'high',
  },
];

export const mockDimension5Result: DimensionResult = {
  dimensionKey: 'issueTypeConsistency',
  dimensionNumber: 5,
  dimensionName: 'Issue Type Consistency',
  dimensionTitle: 'Issue Type Consistency',
  questionForm: 'Do we use issue types consistently?',
  riskDescription: 'issue types are used inconsistently',
  spectrumLeftLabel: 'Issue types used predictably and meaningfully',
  spectrumRightLabel: 'Issue types used arbitrarily or inconsistently',
  verdict: 'Below Average',
  verdictDescription: 'Your issue type usage is inconsistent both within your team and compared to other teams.',
  riskLevel: 'high',
  overallPercentile: 12,
  // CHS Health Score: percentile 12 → z≈-1.17 → base 38, stable +0 = 38
  healthScore: 38,
  benchmarkComparison: 'bottom 12% of the comparison group',
  benchmarkPercentile: 12,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 14, benchmarkValue: 50 },
    { period: '2024-07', value: 13, benchmarkValue: 50 },
    { period: '2024-08', value: 12, benchmarkValue: 50 },
    { period: '2024-09', value: 12, benchmarkValue: 50 },
    { period: '2024-10', value: 12, benchmarkValue: 50 },
    { period: '2024-11', value: 12, benchmarkValue: 50 },
  ],
  categories: [issueTypeConsistencyCategory],
  whyItMatters: 'Inconsistent issue type usage makes metrics unreliable and prevents meaningful comparison across teams.',
  whyItMattersPoints: [
    'Inconsistent usage means the same type of work gets categorized differently',
    'Metrics like velocity and throughput become misleading',
    'Cross-team comparisons and portfolio reporting become meaningless',
    'Automation and workflows may not trigger correctly',
  ],
  recommendations: dimension5Recommendations,
};

// ==========================================
// DIMENSION 6: Data Freshness
// ==========================================

const dataFreshnessCategory: IndicatorCategory = {
  id: 'dataFreshness',
  name: 'Data Freshness & Staleness',
  shortName: 'Data Freshness',
  description: 'Does the data in Jira represent an up-to-date view of the work?',
  rationale: `
    <strong>Data freshness</strong> measures whether your Jira data accurately reflects the current state
    of work. Stale data leads to inaccurate reporting, missed deadlines, and poor decision-making.
    Teams with fresh data can respond quickly to changes and maintain accurate forecasts.
  `,
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: [
    {
      id: 'staleWorkItems',
      name: 'Stale In-Progress Work Items',
      description: 'Percentage of current in-progress work items that haven\'t seen any change/update/movement in over n weeks.',
      value: 58,
      unit: '%',
      displayValue: '58%',
      benchmarkValue: 25,
      benchmarkDisplayValue: '25%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'declining',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 42, benchmarkValue: 25 },
        { period: '2024-04', value: 44, benchmarkValue: 25 },
        { period: '2024-05', value: 46, benchmarkValue: 25 },
        { period: '2024-06', value: 48, benchmarkValue: 25 },
        { period: '2024-07', value: 50, benchmarkValue: 25 },
        { period: '2024-08', value: 52, benchmarkValue: 25 },
        { period: '2024-09', value: 55, benchmarkValue: 25 },
        { period: '2024-10', value: 56, benchmarkValue: 25 },
        { period: '2024-11', value: 58, benchmarkValue: 25 },
      ],
      distribution: { min: 10, max: 72, otherTeamValues: [15, 22, 28, 35, 42, 50, 58, 65, 70] },
    },
    {
      id: 'staleEpics',
      name: 'Stale In-Progress Epics',
      description: 'Percentage of current in-progress Epics that haven\'t seen any change/update/movement in over n months.',
      value: 15,
      unit: '%',
      displayValue: '15%',
      benchmarkValue: 20,
      benchmarkDisplayValue: '20%',
      benchmarkComparison: 'top 10% of the comparison group',
      benchmarkPercentile: 90,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 28, benchmarkValue: 20 },
        { period: '2024-04', value: 26, benchmarkValue: 20 },
        { period: '2024-05', value: 24, benchmarkValue: 20 },
        { period: '2024-06', value: 22, benchmarkValue: 20 },
        { period: '2024-07', value: 20, benchmarkValue: 20 },
        { period: '2024-08', value: 18, benchmarkValue: 20 },
        { period: '2024-09', value: 17, benchmarkValue: 20 },
        { period: '2024-10', value: 16, benchmarkValue: 20 },
        { period: '2024-11', value: 15, benchmarkValue: 20 },
      ],
      distribution: { min: 5, max: 45, otherTeamValues: [8, 12, 18, 22, 28, 32, 38, 42] },
    },
    {
      id: 'epicsWithUnresolvedChildren',
      name: 'Done Epics with Unresolved Children',
      description: 'Percentage of Epics moved to Done that still had child work items not specified or resolved.',
      value: 80,
      unit: '%',
      displayValue: '80%',
      benchmarkValue: 15,
      benchmarkDisplayValue: '15%',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 76, benchmarkValue: 15 },
        { period: '2024-04', value: 77, benchmarkValue: 15 },
        { period: '2024-05', value: 77, benchmarkValue: 15 },
        { period: '2024-06', value: 78, benchmarkValue: 15 },
        { period: '2024-07', value: 79, benchmarkValue: 15 },
        { period: '2024-08', value: 80, benchmarkValue: 15 },
        { period: '2024-09', value: 80, benchmarkValue: 15 },
        { period: '2024-10', value: 80, benchmarkValue: 15 },
        { period: '2024-11', value: 80, benchmarkValue: 15 },
      ],
      distribution: { min: 5, max: 85, otherTeamValues: [10, 18, 25, 35, 45, 55, 65, 75, 82] },
    },
    {
      id: 'bulkChanges',
      name: 'Bulk Changes',
      description: 'Percentage of changes that happened to work items that were done in bulk (multiple items at the same time).',
      value: 20,
      unit: '%',
      displayValue: '20%',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5%',
      benchmarkComparison: 'bottom 8% of the comparison group',
      benchmarkPercentile: 8,
      trend: 'declining',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 12, benchmarkValue: 5 },
        { period: '2024-04', value: 13, benchmarkValue: 5 },
        { period: '2024-05', value: 14, benchmarkValue: 5 },
        { period: '2024-06', value: 15, benchmarkValue: 5 },
        { period: '2024-07', value: 16, benchmarkValue: 5 },
        { period: '2024-08', value: 17, benchmarkValue: 5 },
        { period: '2024-09', value: 18, benchmarkValue: 5 },
        { period: '2024-10', value: 19, benchmarkValue: 5 },
        { period: '2024-11', value: 20, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 35, otherTeamValues: [3, 5, 8, 12, 16, 20, 25, 30] },
    },
    {
      id: 'parentNotDoneAfterChildren',
      name: 'Stories Not Done After Sub-tasks Complete',
      description: 'Percentage of issues with sub-tasks that were still not marked done for at least a week after all sub-tasks completed.',
      value: 65,
      unit: '%',
      displayValue: '65%',
      benchmarkValue: 20,
      benchmarkDisplayValue: '20%',
      benchmarkComparison: 'bottom 8% of the comparison group',
      benchmarkPercentile: 8,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 60, benchmarkValue: 20 },
        { period: '2024-04', value: 61, benchmarkValue: 20 },
        { period: '2024-05', value: 62, benchmarkValue: 20 },
        { period: '2024-06', value: 63, benchmarkValue: 20 },
        { period: '2024-07', value: 64, benchmarkValue: 20 },
        { period: '2024-08', value: 64, benchmarkValue: 20 },
        { period: '2024-09', value: 65, benchmarkValue: 20 },
        { period: '2024-10', value: 65, benchmarkValue: 20 },
        { period: '2024-11', value: 65, benchmarkValue: 20 },
      ],
      distribution: { min: 8, max: 75, otherTeamValues: [12, 20, 28, 35, 42, 50, 58, 68] },
    },
    {
      id: 'epicsNotDoneAfterChildren',
      name: 'Epics Not Done After Children Complete',
      description: 'Percentage of Epics still marked not done for at least a week after all their child issues were completed.',
      value: 30,
      unit: '%',
      displayValue: '30%',
      benchmarkValue: 10,
      benchmarkDisplayValue: '10%',
      benchmarkComparison: 'bottom 15% of the comparison group',
      benchmarkPercentile: 15,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 35, benchmarkValue: 10 },
        { period: '2024-04', value: 34, benchmarkValue: 10 },
        { period: '2024-05', value: 33, benchmarkValue: 10 },
        { period: '2024-06', value: 32, benchmarkValue: 10 },
        { period: '2024-07', value: 31, benchmarkValue: 10 },
        { period: '2024-08', value: 30, benchmarkValue: 10 },
        { period: '2024-09', value: 30, benchmarkValue: 10 },
        { period: '2024-10', value: 30, benchmarkValue: 10 },
        { period: '2024-11', value: 30, benchmarkValue: 10 },
      ],
      distribution: { min: 5, max: 50, otherTeamValues: [8, 12, 18, 22, 28, 35, 42, 48] },
    },
    {
      id: 'jiraUpdateFrequency',
      name: 'Jira Update Frequency',
      description: 'How frequently are Jira issues updated on average?',
      value: 0.5,
      unit: 'updates/day',
      displayValue: '0.5 updates/day',
      benchmarkValue: 3,
      benchmarkDisplayValue: '3 updates/day',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'declining',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 1.2, benchmarkValue: 3 },
        { period: '2024-04', value: 1.1, benchmarkValue: 3 },
        { period: '2024-05', value: 1.0, benchmarkValue: 3 },
        { period: '2024-06', value: 0.8, benchmarkValue: 3 },
        { period: '2024-07', value: 0.7, benchmarkValue: 3 },
        { period: '2024-08', value: 0.6, benchmarkValue: 3 },
        { period: '2024-09', value: 0.6, benchmarkValue: 3 },
        { period: '2024-10', value: 0.5, benchmarkValue: 3 },
        { period: '2024-11', value: 0.5, benchmarkValue: 3 },
      ],
      distribution: { min: 0.2, max: 5.5, otherTeamValues: [0.8, 1.5, 2.2, 2.8, 3.4, 4.0, 4.6, 5.2] },
    },
    {
      id: 'invisibleWorkRiskScore',
      name: 'Invisible Work Risk Score',
      description: 'Risk score indicating likelihood that work is happening outside of Jira and not being captured.',
      value: 0.6,
      unit: 'score',
      displayValue: '0.6 (High)',
      benchmarkValue: 0.25,
      benchmarkDisplayValue: '0.25 (Low)',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'declining',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 0.42, benchmarkValue: 0.25 },
        { period: '2024-04', value: 0.45, benchmarkValue: 0.25 },
        { period: '2024-05', value: 0.48, benchmarkValue: 0.25 },
        { period: '2024-06', value: 0.5, benchmarkValue: 0.25 },
        { period: '2024-07', value: 0.52, benchmarkValue: 0.25 },
        { period: '2024-08', value: 0.55, benchmarkValue: 0.25 },
        { period: '2024-09', value: 0.57, benchmarkValue: 0.25 },
        { period: '2024-10', value: 0.58, benchmarkValue: 0.25 },
        { period: '2024-11', value: 0.6, benchmarkValue: 0.25 },
      ],
      distribution: { min: 0.1, max: 0.75, otherTeamValues: [0.15, 0.22, 0.28, 0.35, 0.42, 0.50, 0.58, 0.68] },
    },
  ],
};

const dimension6Recommendations: Recommendation[] = [
  {
    id: 'rec-d6-1',
    title: 'Set Up Stale Issue Alerts',
    description: 'Configure automated alerts for issues that haven\'t been updated in a specified time period.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec-d6-2',
    title: 'Add Jira Update to Definition of Done',
    description: 'Include "Update Jira status" as an explicit step in your team\'s Definition of Done.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d6-3',
    title: 'Implement Auto-Transition Rules',
    description: 'Configure automation rules to transition parent issues when all children are complete.',
    category: 'tooling',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'rec-d6-4',
    title: 'Review Stale Items in Standups',
    description: 'Add a quick review of stale items during daily standups to encourage regular updates.',
    category: 'culture',
    effort: 'low',
    impact: 'medium',
  },
];

export const mockDimension6Result: DimensionResult = {
  dimensionKey: 'dataFreshness',
  dimensionNumber: 6,
  dimensionName: 'Data Freshness',
  dimensionTitle: 'Data Freshness',
  questionForm: 'Does the data that we see represent an up-to-date view of the work?',
  riskDescription: 'your data is stale or outdated',
  spectrumLeftLabel: 'Jira reflects current work status accurately',
  spectrumRightLabel: 'Data is outdated or rarely updated',
  verdict: 'Needs Attention',
  verdictDescription: 'Your Jira data is significantly stale and may not reflect the actual state of work.',
  riskLevel: 'high',
  overallPercentile: 15,
  // CHS Health Score: percentile 15 → z≈-1.04 → base 40, declining -5 = 35
  healthScore: 35,
  benchmarkComparison: 'bottom 15% of the comparison group',
  benchmarkPercentile: 15,
  trend: 'declining',
  trendData: [
    { period: '2024-06', value: 22, benchmarkValue: 50 },
    { period: '2024-07', value: 20, benchmarkValue: 50 },
    { period: '2024-08', value: 18, benchmarkValue: 50 },
    { period: '2024-09', value: 17, benchmarkValue: 50 },
    { period: '2024-10', value: 16, benchmarkValue: 50 },
    { period: '2024-11', value: 15, benchmarkValue: 50 },
  ],
  categories: [dataFreshnessCategory],
  whyItMatters: 'Stale data leads to inaccurate reporting, missed dependencies, and poor decision-making.',
  whyItMattersPoints: [
    'Stale work items give a false picture of progress and capacity',
    'Bulk updates indicate data is being backfilled rather than kept current',
    'Parent issues not updated after children complete breaks hierarchy integrity',
    'Low update frequency suggests work is happening outside of Jira',
  ],
  recommendations: dimension6Recommendations,
};

// ==========================================
// DIMENSION 7: Blocker Management
// ==========================================

const blockerManagementCategory: IndicatorCategory = {
  id: 'blockerManagement',
  name: 'Blocker & Impediment Tracking',
  shortName: 'Blocker Management',
  description: 'How effectively do you capture and manage blockers in Jira?',
  rationale: `
    <strong>Blocker management</strong> measures how well your team captures and resolves impediments.
    When blockers aren't properly tracked, issues fester silently, dependencies go unnoticed,
    and teams lose visibility into what's actually slowing them down.
  `,
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 3,
  indicators: [
    {
      id: 'blockerToWorkItemRatio',
      name: 'Blocker-to-Active-Work-Item Ratio',
      description: 'The ratio of blocker issues to active work items. A very low ratio may indicate blockers are not being captured.',
      value: 0.017,
      unit: 'ratio',
      displayValue: '1:60',
      benchmarkValue: 0.1,
      benchmarkDisplayValue: '1:10',
      benchmarkComparison: 'bottom 7% of the comparison group',
      benchmarkPercentile: 7,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0.020, benchmarkValue: 0.1 },
        { period: '2024-04', value: 0.019, benchmarkValue: 0.1 },
        { period: '2024-05', value: 0.019, benchmarkValue: 0.1 },
        { period: '2024-06', value: 0.018, benchmarkValue: 0.1 },
        { period: '2024-07', value: 0.017, benchmarkValue: 0.1 },
        { period: '2024-08', value: 0.016, benchmarkValue: 0.1 },
        { period: '2024-09', value: 0.017, benchmarkValue: 0.1 },
        { period: '2024-10', value: 0.017, benchmarkValue: 0.1 },
        { period: '2024-11', value: 0.017, benchmarkValue: 0.1 },
      ],
      distribution: { min: 0.01, max: 0.18, otherTeamValues: [0.02, 0.04, 0.06, 0.08, 0.10, 0.12, 0.14, 0.16] },
    },
    {
      id: 'blockerResolutionTime',
      name: 'Average Time to Remove Blockers',
      description: 'The average number of days it takes to resolve a blocker once raised.',
      value: 10,
      unit: 'days',
      displayValue: '10 days',
      benchmarkValue: 12,
      benchmarkDisplayValue: '12 days',
      benchmarkComparison: 'top 20% of the comparison group',
      benchmarkPercentile: 80,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 18, benchmarkValue: 12 },
        { period: '2024-04', value: 17, benchmarkValue: 12 },
        { period: '2024-05', value: 16, benchmarkValue: 12 },
        { period: '2024-06', value: 14, benchmarkValue: 12 },
        { period: '2024-07', value: 13, benchmarkValue: 12 },
        { period: '2024-08', value: 12, benchmarkValue: 12 },
        { period: '2024-09', value: 11, benchmarkValue: 12 },
        { period: '2024-10', value: 10, benchmarkValue: 12 },
        { period: '2024-11', value: 10, benchmarkValue: 12 },
      ],
      distribution: { min: 3, max: 25, otherTeamValues: [5, 8, 10, 12, 14, 17, 20, 23] },
    },
    {
      id: 'blockersWithoutDescription',
      name: 'Blockers Without Description',
      description: 'Percentage of blocker issues raised without a description explaining the impediment.',
      value: 80,
      unit: '%',
      displayValue: '80%',
      benchmarkValue: 30,
      benchmarkDisplayValue: '30%',
      benchmarkComparison: 'bottom 30% of the comparison group',
      benchmarkPercentile: 30,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 75, benchmarkValue: 30 },
        { period: '2024-04', value: 76, benchmarkValue: 30 },
        { period: '2024-05', value: 77, benchmarkValue: 30 },
        { period: '2024-06', value: 78, benchmarkValue: 30 },
        { period: '2024-07', value: 79, benchmarkValue: 30 },
        { period: '2024-08', value: 80, benchmarkValue: 30 },
        { period: '2024-09', value: 80, benchmarkValue: 30 },
        { period: '2024-10', value: 80, benchmarkValue: 30 },
        { period: '2024-11', value: 80, benchmarkValue: 30 },
      ],
      distribution: { min: 15, max: 90, otherTeamValues: [22, 30, 38, 45, 55, 65, 75, 85] },
    },
    {
      id: 'blockerVisibilityAcrossProjects',
      name: 'Blocker Visibility Across Projects',
      description: 'Number of other projects where blockers from this project are visible, indicating cross-team visibility.',
      value: 0,
      unit: 'projects',
      displayValue: '0 projects',
      benchmarkValue: 3,
      benchmarkDisplayValue: '3 projects',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0, benchmarkValue: 3 },
        { period: '2024-04', value: 0, benchmarkValue: 3 },
        { period: '2024-05', value: 0, benchmarkValue: 3 },
        { period: '2024-06', value: 0, benchmarkValue: 3 },
        { period: '2024-07', value: 0, benchmarkValue: 3 },
        { period: '2024-08', value: 0, benchmarkValue: 3 },
        { period: '2024-09', value: 0, benchmarkValue: 3 },
        { period: '2024-10', value: 0, benchmarkValue: 3 },
        { period: '2024-11', value: 0, benchmarkValue: 3 },
      ],
      distribution: { min: 0, max: 8, otherTeamValues: [1, 2, 3, 4, 5, 6, 7, 8] },
    },
  ],
};

const dimension7Recommendations: Recommendation[] = [
  {
    id: 'rec-d7-1',
    title: 'Establish Blocker Flagging Standards',
    description: 'Define clear criteria for what constitutes a blocker and ensure all team members understand how to flag them properly.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d7-2',
    title: 'Require Blocker Descriptions',
    description: 'Make description a required field for blocker issues to ensure context is always captured.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec-d7-3',
    title: 'Create Cross-Project Blocker Dashboard',
    description: 'Build a shared dashboard showing blockers across all related projects to improve visibility.',
    category: 'tooling',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'rec-d7-4',
    title: 'Review Blockers in Daily Standups',
    description: 'Dedicate time in standups specifically for discussing and escalating blockers.',
    category: 'culture',
    effort: 'low',
    impact: 'high',
  },
];

export const mockDimension7Result: DimensionResult = {
  dimensionKey: 'blockerManagement',
  dimensionNumber: 7,
  dimensionName: 'Blocker Management',
  dimensionTitle: 'Blocker Management',
  questionForm: 'Do we promptly capture blockers & impediments in Jira so that they could be effectively managed?',
  riskDescription: "blockers aren't being tracked",
  spectrumLeftLabel: 'Blockers captured and resolved promptly',
  spectrumRightLabel: 'Blockers go untracked or unresolved',
  verdict: 'Below Average',
  verdictDescription: 'Blockers are not being effectively captured or managed, reducing visibility into impediments.',
  riskLevel: 'high',
  overallPercentile: 20,
  // CHS Health Score: percentile 20 → z≈-0.84 → base 42, stable +0 = 42
  healthScore: 42,
  benchmarkComparison: 'bottom 20% of the comparison group',
  benchmarkPercentile: 20,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 22, benchmarkValue: 50 },
    { period: '2024-07', value: 21, benchmarkValue: 50 },
    { period: '2024-08', value: 20, benchmarkValue: 50 },
    { period: '2024-09', value: 20, benchmarkValue: 50 },
    { period: '2024-10', value: 20, benchmarkValue: 50 },
    { period: '2024-11', value: 20, benchmarkValue: 50 },
  ],
  categories: [blockerManagementCategory],
  whyItMatters: 'Untracked blockers lead to silent delays, missed dependencies, and reduced team velocity.',
  whyItMattersPoints: [
    'Low blocker ratio suggests impediments are going unreported',
    'Blockers without descriptions make it hard to understand or resolve issues',
    'Limited cross-project visibility means dependencies may be missed',
    'Effective blocker management enables faster resolution and better planning',
  ],
  recommendations: dimension7Recommendations,
};

// ==========================================
// DIMENSION 8: Work Hierarchy Linkage
// ==========================================

const workHierarchyCategory: IndicatorCategory = {
  id: 'workHierarchy',
  name: 'Work Hierarchy & Linkage',
  shortName: 'Work Hierarchy',
  description: 'How well is work connected from tasks up to epics and initiatives?',
  rationale: `
    <strong>Work hierarchy linkage</strong> measures how well your team connects individual work items
    to higher-level goals. When stories and tasks aren't linked to epics, you lose the ability to track
    progress toward strategic objectives and understand how day-to-day work contributes to larger goals.
  `,
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 1,
  indicators: [
    {
      id: 'issuesNotLinkedToEpics',
      name: 'In-Progress Issues Not Linked to Epics',
      description: 'Percentage of in-progress issues that are not linked to any epic.',
      value: 70,
      unit: '%',
      displayValue: '70%',
      benchmarkValue: 20,
      benchmarkDisplayValue: '20%',
      benchmarkComparison: 'bottom 7% of the comparison group',
      benchmarkPercentile: 7,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 65, benchmarkValue: 20 },
        { period: '2024-04', value: 66, benchmarkValue: 20 },
        { period: '2024-05', value: 67, benchmarkValue: 20 },
        { period: '2024-06', value: 68, benchmarkValue: 20 },
        { period: '2024-07', value: 69, benchmarkValue: 20 },
        { period: '2024-08', value: 70, benchmarkValue: 20 },
        { period: '2024-09', value: 70, benchmarkValue: 20 },
        { period: '2024-10', value: 70, benchmarkValue: 20 },
        { period: '2024-11', value: 70, benchmarkValue: 20 },
      ],
      distribution: { min: 8, max: 80, otherTeamValues: [12, 20, 28, 35, 45, 55, 65, 75] },
    },
  ],
};

const dimension8Recommendations: Recommendation[] = [
  {
    id: 'rec-d8-1',
    title: 'Require Epic Links for New Issues',
    description: 'Configure Jira to require an epic link when creating new stories and tasks.',
    category: 'tooling',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d8-2',
    title: 'Create Catch-All Epics',
    description: 'For work that doesn\'t fit existing epics, create operational epics to maintain linkage while keeping structure.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec-d8-3',
    title: 'Review Unlinked Issues in Refinement',
    description: 'Add a step in backlog refinement to review and link any orphaned issues.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d8-4',
    title: 'Use Automation to Flag Unlinked Issues',
    description: 'Set up automation rules to notify when issues are moved to in-progress without an epic link.',
    category: 'tooling',
    effort: 'medium',
    impact: 'medium',
  },
];

export const mockDimension8Result: DimensionResult = {
  dimensionKey: 'workHierarchy',
  dimensionNumber: 8,
  dimensionName: 'Work Hierarchy Linkage',
  dimensionTitle: 'Work Hierarchy Linkage',
  questionForm: 'Is the work connected in such a way that I can see how progress on stories & tasks adds up to higher level Epics & Initiatives?',
  riskDescription: 'work items lack proper linkage',
  spectrumLeftLabel: 'Work items connected to epics and initiatives',
  spectrumRightLabel: 'Work items orphaned without parent context',
  verdict: 'Needs Attention',
  verdictDescription: 'Most work is not linked to higher-level objectives, making it hard to track progress toward strategic goals.',
  riskLevel: 'high',
  overallPercentile: 7,
  // CHS Health Score: percentile 7 → z≈-1.48 → base 35, stable +0 = 35
  healthScore: 35,
  benchmarkComparison: 'bottom 7% of the comparison group',
  benchmarkPercentile: 7,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 8, benchmarkValue: 50 },
    { period: '2024-07', value: 8, benchmarkValue: 50 },
    { period: '2024-08', value: 7, benchmarkValue: 50 },
    { period: '2024-09', value: 7, benchmarkValue: 50 },
    { period: '2024-10', value: 7, benchmarkValue: 50 },
    { period: '2024-11', value: 7, benchmarkValue: 50 },
  ],
  categories: [workHierarchyCategory],
  whyItMatters: 'Unlinked work items break the connection between daily tasks and strategic objectives.',
  whyItMattersPoints: [
    'Cannot track progress toward epics and initiatives accurately',
    'Roadmap reporting becomes unreliable or requires manual aggregation',
    'Difficult to understand capacity allocation across strategic priorities',
    'Work may be done that doesn\'t align with current objectives',
  ],
  recommendations: dimension8Recommendations,
};

// ==========================================
// DIMENSION 9: Sprint Hygiene
// ==========================================

const sprintHygieneCategory: IndicatorCategory = {
  id: 'sprintHygiene',
  name: 'Sprint Practices & Hygiene',
  shortName: 'Sprint Hygiene',
  description: 'How well does your team follow sprint management best practices?',
  rationale: `
    <strong>Sprint hygiene</strong> measures how well your team maintains healthy sprint practices.
    Poor sprint hygiene—inconsistent cadence, missing goals, excessive carryover—makes planning unreliable
    and velocity metrics meaningless. Good hygiene enables predictable delivery and continuous improvement.
  `,
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 6,
  indicators: [
    {
      id: 'sprintDurationVariance',
      name: 'Sprint Duration Variance',
      description: 'Percentage of sprints that take significantly longer or shorter than planned.',
      value: 15,
      unit: '%',
      displayValue: '15%',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 18, benchmarkValue: 5 },
        { period: '2024-04', value: 17, benchmarkValue: 5 },
        { period: '2024-05', value: 16, benchmarkValue: 5 },
        { period: '2024-06', value: 16, benchmarkValue: 5 },
        { period: '2024-07', value: 15, benchmarkValue: 5 },
        { period: '2024-08', value: 15, benchmarkValue: 5 },
        { period: '2024-09', value: 15, benchmarkValue: 5 },
        { period: '2024-10', value: 15, benchmarkValue: 5 },
        { period: '2024-11', value: 15, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 25, otherTeamValues: [3, 5, 7, 10, 12, 15, 18, 22] },
    },
    {
      id: 'sprintsWithoutGoals',
      name: 'Sprints Without Goals',
      description: 'Percentage of sprints that have no sprint goal defined.',
      value: 80,
      unit: '%',
      displayValue: '80%',
      benchmarkValue: 10,
      benchmarkDisplayValue: '10%',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 85, benchmarkValue: 10 },
        { period: '2024-04', value: 84, benchmarkValue: 10 },
        { period: '2024-05', value: 83, benchmarkValue: 10 },
        { period: '2024-06', value: 82, benchmarkValue: 10 },
        { period: '2024-07', value: 81, benchmarkValue: 10 },
        { period: '2024-08', value: 80, benchmarkValue: 10 },
        { period: '2024-09', value: 80, benchmarkValue: 10 },
        { period: '2024-10', value: 80, benchmarkValue: 10 },
        { period: '2024-11', value: 80, benchmarkValue: 10 },
      ],
      distribution: { min: 5, max: 90, otherTeamValues: [8, 15, 25, 35, 50, 65, 75, 85] },
    },
    {
      id: 'workCarriedOver',
      name: 'Incomplete Work Carried Over',
      description: 'Percentage of unfinished work at sprint end that is moved directly to the next sprint.',
      value: 95,
      unit: '%',
      displayValue: '95%',
      benchmarkValue: 50,
      benchmarkDisplayValue: '50%',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 92, benchmarkValue: 50 },
        { period: '2024-04', value: 93, benchmarkValue: 50 },
        { period: '2024-05', value: 93, benchmarkValue: 50 },
        { period: '2024-06', value: 94, benchmarkValue: 50 },
        { period: '2024-07', value: 95, benchmarkValue: 50 },
        { period: '2024-08', value: 95, benchmarkValue: 50 },
        { period: '2024-09', value: 95, benchmarkValue: 50 },
        { period: '2024-10', value: 95, benchmarkValue: 50 },
        { period: '2024-11', value: 95, benchmarkValue: 50 },
      ],
      distribution: { min: 20, max: 98, otherTeamValues: [28, 38, 48, 55, 65, 75, 85, 92] },
    },
    {
      id: 'lastDayCompletions',
      name: 'Work Completed on Last Day',
      description: 'Percentage of sprint work that is moved to Done on the last day of the sprint.',
      value: 35,
      unit: '%',
      displayValue: '35%',
      benchmarkValue: 15,
      benchmarkDisplayValue: '15%',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 30, benchmarkValue: 15 },
        { period: '2024-04', value: 31, benchmarkValue: 15 },
        { period: '2024-05', value: 32, benchmarkValue: 15 },
        { period: '2024-06', value: 33, benchmarkValue: 15 },
        { period: '2024-07', value: 34, benchmarkValue: 15 },
        { period: '2024-08', value: 35, benchmarkValue: 15 },
        { period: '2024-09', value: 35, benchmarkValue: 15 },
        { period: '2024-10', value: 35, benchmarkValue: 15 },
        { period: '2024-11', value: 35, benchmarkValue: 15 },
      ],
      distribution: { min: 5, max: 55, otherTeamValues: [8, 12, 18, 22, 28, 35, 42, 50] },
    },
    {
      id: 'sprintCadenceAlignment',
      name: 'Sprint Cadence Alignment',
      description: 'Percentage of teams in your organization with matching sprint cadence.',
      value: 60,
      unit: '%',
      displayValue: '60%',
      benchmarkValue: 80,
      benchmarkDisplayValue: '80%',
      benchmarkComparison: 'bottom 40% of the comparison group',
      benchmarkPercentile: 40,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 55, benchmarkValue: 80 },
        { period: '2024-04', value: 56, benchmarkValue: 80 },
        { period: '2024-05', value: 57, benchmarkValue: 80 },
        { period: '2024-06', value: 58, benchmarkValue: 80 },
        { period: '2024-07', value: 59, benchmarkValue: 80 },
        { period: '2024-08', value: 60, benchmarkValue: 80 },
        { period: '2024-09', value: 60, benchmarkValue: 80 },
        { period: '2024-10', value: 60, benchmarkValue: 80 },
        { period: '2024-11', value: 60, benchmarkValue: 80 },
      ],
      distribution: { min: 40, max: 95, otherTeamValues: [48, 55, 65, 72, 78, 85, 90, 94] },
    },
    {
      id: 'crossProjectSprintItems',
      name: 'Work Assigned to Other Projects\' Sprints',
      description: 'Percentage of active work items assigned to sprints belonging to other Jira projects.',
      value: 15,
      unit: '%',
      displayValue: '15%',
      benchmarkValue: 2,
      benchmarkDisplayValue: '2%',
      benchmarkComparison: 'bottom 1% of the comparison group',
      benchmarkPercentile: 1,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 12, benchmarkValue: 2 },
        { period: '2024-04', value: 13, benchmarkValue: 2 },
        { period: '2024-05', value: 13, benchmarkValue: 2 },
        { period: '2024-06', value: 14, benchmarkValue: 2 },
        { period: '2024-07', value: 15, benchmarkValue: 2 },
        { period: '2024-08', value: 15, benchmarkValue: 2 },
        { period: '2024-09', value: 15, benchmarkValue: 2 },
        { period: '2024-10', value: 15, benchmarkValue: 2 },
        { period: '2024-11', value: 15, benchmarkValue: 2 },
      ],
      distribution: { min: 1, max: 25, otherTeamValues: [2, 4, 6, 8, 10, 14, 18, 22] },
    },
    {
      id: 'inProgressWithoutAssignee',
      name: 'In-Progress Issues Without Assignee',
      description: 'Percentage of in-progress issues that have no assignee.',
      value: 15,
      unit: '%',
      displayValue: '15%',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5%',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 18, benchmarkValue: 5 },
        { period: '2024-04', value: 17, benchmarkValue: 5 },
        { period: '2024-05', value: 17, benchmarkValue: 5 },
        { period: '2024-06', value: 16, benchmarkValue: 5 },
        { period: '2024-07', value: 15, benchmarkValue: 5 },
        { period: '2024-08', value: 15, benchmarkValue: 5 },
        { period: '2024-09', value: 15, benchmarkValue: 5 },
        { period: '2024-10', value: 15, benchmarkValue: 5 },
        { period: '2024-11', value: 15, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 25, otherTeamValues: [3, 5, 8, 10, 13, 17, 20, 23] },
    },
  ],
};

const dimension9Recommendations: Recommendation[] = [
  {
    id: 'rec-d9-1',
    title: 'Define Sprint Goals for Every Sprint',
    description: 'Establish a practice of setting clear, focused sprint goals during sprint planning.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d9-2',
    title: 'Review Carryover Patterns in Retrospectives',
    description: 'Analyze why work is consistently carried over and address root causes.',
    category: 'culture',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec-d9-3',
    title: 'Standardize Sprint Cadence',
    description: 'Align sprint start/end dates with other teams to improve cross-team coordination.',
    category: 'process',
    effort: 'medium',
    impact: 'medium',
  },
  {
    id: 'rec-d9-4',
    title: 'Require Assignee Before Moving to In-Progress',
    description: 'Configure workflow to require an assignee when transitioning issues to in-progress.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec-d9-5',
    title: 'Monitor Last-Day Completions',
    description: 'Track and discuss last-day completion spikes—they often indicate scope-fitting rather than genuine completion.',
    category: 'culture',
    effort: 'low',
    impact: 'medium',
  },
];

export const mockDimension9Result: DimensionResult = {
  dimensionKey: 'sprintHygiene',
  dimensionNumber: 9,
  dimensionName: 'Sprint Hygiene',
  dimensionTitle: 'Sprint Hygiene',
  questionForm: 'How good is our sprint hygiene?',
  riskDescription: 'sprint practices are inconsistent',
  spectrumLeftLabel: 'Sprints are clean and commitments are met',
  spectrumRightLabel: 'High carryover and scope changes mid-sprint',
  verdict: 'Below Average',
  verdictDescription: 'Sprint practices show significant gaps that undermine planning reliability and velocity metrics.',
  riskLevel: 'high',
  overallPercentile: 12,
  // CHS Health Score: percentile 12 → z≈-1.17 → base 38, stable +0 = 38
  healthScore: 38,
  benchmarkComparison: 'bottom 12% of the comparison group',
  benchmarkPercentile: 12,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 14, benchmarkValue: 50 },
    { period: '2024-07', value: 13, benchmarkValue: 50 },
    { period: '2024-08', value: 12, benchmarkValue: 50 },
    { period: '2024-09', value: 12, benchmarkValue: 50 },
    { period: '2024-10', value: 12, benchmarkValue: 50 },
    { period: '2024-11', value: 12, benchmarkValue: 50 },
  ],
  categories: [sprintHygieneCategory],
  whyItMatters: 'Poor sprint hygiene makes velocity unreliable and planning unpredictable.',
  whyItMattersPoints: [
    'Missing sprint goals mean sprints lack focus and purpose',
    'High carryover rates indicate chronic over-commitment or scope creep',
    'Last-day completion spikes suggest scope-fitting rather than genuine delivery',
    'Misaligned cadence complicates cross-team coordination and release planning',
  ],
  recommendations: dimension9Recommendations,
};

// ============================================
// DIMENSION 10: Team Collaboration
// Are we using Jira to collaborate effectively (within our team and with other teams)?
// ============================================

const teamCollaborationCategory: IndicatorCategory = {
  id: 'teamCollaboration',
  name: 'Team Collaboration',
  shortName: 'Collaboration',
  description: 'Measures whether work involves genuine collaboration - communication quality, involvement breadth, and knowledge sharing.',
  rationale: 'Jira is not just a task tracker—it should facilitate team communication, knowledge sharing, and collaborative work patterns.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 12,
  indicators: [
    {
      id: 'avgCommentsPerIssue',
      name: 'Average comments per in-progress issue',
      description: 'Our average # of comments per in-progress issue is 0.30. We\'re in the top 20% of the comparison group.',
      value: 0.30,
      displayValue: '0.30',
      unit: 'comments/issue',
      benchmarkValue: 0.25,
      benchmarkDisplayValue: '0.25',
      benchmarkComparison: 'top 20% of the comparison group',
      benchmarkPercentile: 80,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0.24, benchmarkValue: 0.25 },
        { period: '2024-04', value: 0.25, benchmarkValue: 0.25 },
        { period: '2024-05', value: 0.26, benchmarkValue: 0.25 },
        { period: '2024-06', value: 0.27, benchmarkValue: 0.25 },
        { period: '2024-07', value: 0.27, benchmarkValue: 0.25 },
        { period: '2024-08', value: 0.28, benchmarkValue: 0.25 },
        { period: '2024-09', value: 0.28, benchmarkValue: 0.25 },
        { period: '2024-10', value: 0.29, benchmarkValue: 0.25 },
        { period: '2024-11', value: 0.30, benchmarkValue: 0.25 },
      ],
      distribution: { min: 0.08, max: 0.55, otherTeamValues: [0.12, 0.18, 0.22, 0.28, 0.35, 0.42, 0.48, 0.52] },
    },
    {
      id: 'closedWithoutComments',
      name: 'Issues closed without comments on status change',
      description: '90% of issues moved to \'closed\' (not Done) have no comments accompanying the status change to communicate WHY we\'re closing this piece of work.',
      value: 90,
      displayValue: '90%',
      unit: '%',
      benchmarkValue: 70,
      benchmarkDisplayValue: '70%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 85, benchmarkValue: 70 },
        { period: '2024-04', value: 86, benchmarkValue: 70 },
        { period: '2024-05', value: 86, benchmarkValue: 70 },
        { period: '2024-06', value: 87, benchmarkValue: 70 },
        { period: '2024-07', value: 87, benchmarkValue: 70 },
        { period: '2024-08', value: 88, benchmarkValue: 70 },
        { period: '2024-09', value: 88, benchmarkValue: 70 },
        { period: '2024-10', value: 89, benchmarkValue: 70 },
        { period: '2024-11', value: 90, benchmarkValue: 70 },
      ],
      distribution: { min: 45, max: 95, otherTeamValues: [52, 58, 65, 72, 78, 82, 88, 92] },
    },
    {
      id: 'commentConcentration',
      name: 'Comment concentration among team members',
      description: '10% of team members generate 85% of the comments captured. We\'re in the bottom 10% of the comparison group.',
      value: 85,
      displayValue: '85%',
      unit: '% of comments',
      benchmarkValue: 60,
      benchmarkDisplayValue: '60%',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 80, benchmarkValue: 60 },
        { period: '2024-04', value: 81, benchmarkValue: 60 },
        { period: '2024-05', value: 81, benchmarkValue: 60 },
        { period: '2024-06', value: 82, benchmarkValue: 60 },
        { period: '2024-07', value: 82, benchmarkValue: 60 },
        { period: '2024-08', value: 83, benchmarkValue: 60 },
        { period: '2024-09', value: 83, benchmarkValue: 60 },
        { period: '2024-10', value: 84, benchmarkValue: 60 },
        { period: '2024-11', value: 85, benchmarkValue: 60 },
      ],
      distribution: { min: 40, max: 92, otherTeamValues: [45, 52, 58, 65, 72, 78, 84, 88] },
    },
    {
      id: 'teamInteractionScore',
      name: 'Team interaction through Jira score (network density)',
      description: 'Our Team interaction through Jira score is 0.21 [poor]. We\'re in the bottom 5% of the comparison group. (this is network density).',
      value: 0.21,
      displayValue: '0.21 (poor)',
      unit: 'score',
      benchmarkValue: 0.55,
      benchmarkDisplayValue: '0.55',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'declining',
      higherIsBetter: true,
      trendData: [
        { period: '2024-03', value: 0.32, benchmarkValue: 0.55 },
        { period: '2024-04', value: 0.30, benchmarkValue: 0.55 },
        { period: '2024-05', value: 0.29, benchmarkValue: 0.55 },
        { period: '2024-06', value: 0.28, benchmarkValue: 0.55 },
        { period: '2024-07', value: 0.27, benchmarkValue: 0.55 },
        { period: '2024-08', value: 0.26, benchmarkValue: 0.55 },
        { period: '2024-09', value: 0.25, benchmarkValue: 0.55 },
        { period: '2024-10', value: 0.23, benchmarkValue: 0.55 },
        { period: '2024-11', value: 0.21, benchmarkValue: 0.55 },
      ],
      distribution: { min: 0.15, max: 0.75, otherTeamValues: [0.22, 0.32, 0.42, 0.50, 0.58, 0.65, 0.70, 0.74] },
    },
    {
      id: 'sentBackWithoutComments',
      name: 'Work sent backward without explanation',
      description: 'In 55% of cases where work is sent backward, there are no comments added to the ticket or change in the description (or any other field) to explain why it was sent back or what additional work is needed.',
      value: 55,
      displayValue: '55%',
      unit: '%',
      benchmarkValue: 35,
      benchmarkDisplayValue: '35%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 48, benchmarkValue: 35 },
        { period: '2024-04', value: 49, benchmarkValue: 35 },
        { period: '2024-05', value: 50, benchmarkValue: 35 },
        { period: '2024-06', value: 51, benchmarkValue: 35 },
        { period: '2024-07', value: 51, benchmarkValue: 35 },
        { period: '2024-08', value: 52, benchmarkValue: 35 },
        { period: '2024-09', value: 52, benchmarkValue: 35 },
        { period: '2024-10', value: 54, benchmarkValue: 35 },
        { period: '2024-11', value: 55, benchmarkValue: 35 },
      ],
      distribution: { min: 15, max: 70, otherTeamValues: [22, 28, 35, 42, 48, 55, 62, 68] },
    },
    {
      id: 'staleCarryoverIssues',
      name: 'Stale issues carried over 3+ sprints without comments',
      description: '90% of issues that have been carried over across 3 sprints or more have no comments added explaining why. They don\'t get split nor see any change in description, estimate, or any field other than assigned sprint. We\'re in the bottom 1% of the comparison group.',
      value: 90,
      displayValue: '90%',
      unit: '%',
      benchmarkValue: 40,
      benchmarkDisplayValue: '40%',
      benchmarkComparison: 'bottom 1% of the comparison group',
      benchmarkPercentile: 1,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 85, benchmarkValue: 40 },
        { period: '2024-04', value: 86, benchmarkValue: 40 },
        { period: '2024-05', value: 86, benchmarkValue: 40 },
        { period: '2024-06', value: 87, benchmarkValue: 40 },
        { period: '2024-07', value: 87, benchmarkValue: 40 },
        { period: '2024-08', value: 88, benchmarkValue: 40 },
        { period: '2024-09', value: 88, benchmarkValue: 40 },
        { period: '2024-10', value: 89, benchmarkValue: 40 },
        { period: '2024-11', value: 90, benchmarkValue: 40 },
      ],
      distribution: { min: 20, max: 95, otherTeamValues: [28, 38, 48, 55, 65, 75, 85, 92] },
    },
    {
      id: 'blockersWithoutDescription',
      name: 'Blockers raised without description',
      description: '80% of blockers raised (via flagging issues) are added with no description. We\'re in the bottom 30% of the comparison group. (If methods other than flags were used, we will ask how they communicate the context/description of the blocker)',
      value: 80,
      displayValue: '80%',
      unit: '%',
      benchmarkValue: 50,
      benchmarkDisplayValue: '50%',
      benchmarkComparison: 'bottom 30% of the comparison group',
      benchmarkPercentile: 30,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 74, benchmarkValue: 50 },
        { period: '2024-04', value: 75, benchmarkValue: 50 },
        { period: '2024-05', value: 76, benchmarkValue: 50 },
        { period: '2024-06', value: 76, benchmarkValue: 50 },
        { period: '2024-07', value: 77, benchmarkValue: 50 },
        { period: '2024-08', value: 78, benchmarkValue: 50 },
        { period: '2024-09', value: 78, benchmarkValue: 50 },
        { period: '2024-10', value: 79, benchmarkValue: 50 },
        { period: '2024-11', value: 80, benchmarkValue: 50 },
      ],
      distribution: { min: 25, max: 90, otherTeamValues: [32, 42, 50, 58, 65, 72, 80, 85] },
    },
    // Indicators merged from Collaboration Breadth (formerly Dim 13)
    {
      id: 'singleContributorIssueRate',
      name: 'Single-Contributor Issue Rate',
      description: 'Percentage of issues where only one person made any updates.',
      whyItMatters: 'When work flows through individuals without collaboration, Jira is just a task list.',
      value: 48,
      displayValue: '48%',
      unit: '%',
      benchmarkValue: 35,
      benchmarkDisplayValue: '35%',
      benchmarkComparison: 'bottom 30% of the comparison group',
      benchmarkPercentile: 30,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 50, benchmarkValue: 35 },
        { period: '2024-07', value: 49, benchmarkValue: 35 },
        { period: '2024-08', value: 48, benchmarkValue: 35 },
        { period: '2024-09', value: 48, benchmarkValue: 35 },
        { period: '2024-10', value: 48, benchmarkValue: 35 },
        { period: '2024-11', value: 48, benchmarkValue: 35 },
      ],
      distribution: { min: 18, max: 65, otherTeamValues: [22, 28, 35, 40, 48, 52, 58, 62] },
    },
    {
      id: 'epicSingleContributorRate',
      name: 'Epics with Single Contributor',
      description: 'Percentage of epics where only one person contributed.',
      whyItMatters: 'Epics represent larger efforts. Single-contributor epics lack diverse perspectives and create knowledge silos.',
      value: 65,
      displayValue: '65%',
      unit: '%',
      benchmarkValue: 25,
      benchmarkDisplayValue: '25%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 66, benchmarkValue: 25 },
        { period: '2024-07', value: 65, benchmarkValue: 25 },
        { period: '2024-08', value: 65, benchmarkValue: 25 },
        { period: '2024-09', value: 65, benchmarkValue: 25 },
        { period: '2024-10', value: 65, benchmarkValue: 25 },
        { period: '2024-11', value: 65, benchmarkValue: 25 },
      ],
      distribution: { min: 12, max: 78, otherTeamValues: [18, 25, 32, 40, 50, 58, 68, 75] },
    },
    {
      id: 'avgContributorsPerEpic',
      name: 'Average Contributors per Epic',
      description: 'Average number of different contributors per epic.',
      whyItMatters: 'Epics with few contributors create knowledge silos and single points of failure.',
      value: 2.1,
      displayValue: '2.1',
      unit: 'contributors',
      benchmarkValue: 3.5,
      benchmarkDisplayValue: '3.5',
      benchmarkComparison: 'bottom 35% of the comparison group',
      benchmarkPercentile: 35,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 2.0, benchmarkValue: 3.5 },
        { period: '2024-07', value: 2.1, benchmarkValue: 3.5 },
        { period: '2024-08', value: 2.1, benchmarkValue: 3.5 },
        { period: '2024-09', value: 2.1, benchmarkValue: 3.5 },
        { period: '2024-10', value: 2.1, benchmarkValue: 3.5 },
        { period: '2024-11', value: 2.1, benchmarkValue: 3.5 },
      ],
      distribution: { min: 1.2, max: 5.8, otherTeamValues: [1.8, 2.4, 2.9, 3.4, 3.9, 4.5, 5.0, 5.5] },
    },
    {
      id: 'handoffDocumentationRate',
      name: 'Handoff Documentation Rate',
      description: 'Percentage of assignee changes with a comment added within 24 hours.',
      whyItMatters: 'Silent handoffs lose context. Comments within 24 hours of a handoff preserve knowledge and provide the new assignee with necessary context.',
      value: 32,
      displayValue: '32%',
      unit: '%',
      benchmarkValue: 60,
      benchmarkDisplayValue: '60%',
      benchmarkComparison: 'bottom 25% of the comparison group',
      benchmarkPercentile: 25,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 28, benchmarkValue: 60 },
        { period: '2024-07', value: 29, benchmarkValue: 60 },
        { period: '2024-08', value: 30, benchmarkValue: 60 },
        { period: '2024-09', value: 31, benchmarkValue: 60 },
        { period: '2024-10', value: 31, benchmarkValue: 60 },
        { period: '2024-11', value: 32, benchmarkValue: 60 },
      ],
      distribution: { min: 15, max: 82, otherTeamValues: [22, 32, 42, 50, 58, 65, 72, 78] },
    },
    // Indicators moved from Collaboration Feature Usage (Dim 12)
    {
      id: 'commentEngagementRate',
      name: 'Comment Engagement Rate',
      description: 'Percentage of issues with at least one comment before completion.',
      whyItMatters: 'Comments create a record of collaboration. Issues without comments suggest discussion happened elsewhere.',
      value: 55,
      displayValue: '55%',
      unit: '%',
      benchmarkValue: 70,
      benchmarkDisplayValue: '70%',
      benchmarkComparison: '40th percentile',
      benchmarkPercentile: 40,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 54, benchmarkValue: 70 },
        { period: '2024-07', value: 55, benchmarkValue: 70 },
        { period: '2024-08', value: 55, benchmarkValue: 70 },
        { period: '2024-09', value: 54, benchmarkValue: 70 },
        { period: '2024-10', value: 55, benchmarkValue: 70 },
        { period: '2024-11', value: 55, benchmarkValue: 70 },
      ],
      distribution: { min: 35, max: 88, otherTeamValues: [42, 50, 58, 65, 72, 78, 82, 86] },
    },
    {
      id: 'multiCommenterRate',
      name: 'Multi-Commenter Rate',
      description: 'Percentage of issues with comments from multiple people.',
      whyItMatters: 'When only one person comments, there is no discussion—just monologue.',
      value: 28,
      displayValue: '28%',
      unit: '%',
      benchmarkValue: 45,
      benchmarkDisplayValue: '45%',
      benchmarkComparison: 'bottom 25% of the comparison group',
      benchmarkPercentile: 25,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 27, benchmarkValue: 45 },
        { period: '2024-07', value: 28, benchmarkValue: 45 },
        { period: '2024-08', value: 28, benchmarkValue: 45 },
        { period: '2024-09', value: 28, benchmarkValue: 45 },
        { period: '2024-10', value: 28, benchmarkValue: 45 },
        { period: '2024-11', value: 28, benchmarkValue: 45 },
      ],
      distribution: { min: 12, max: 65, otherTeamValues: [18, 25, 32, 40, 48, 55, 58, 62] },
    },
  ],
};

const dimension10Recommendations: Recommendation[] = [
  {
    id: 'rec10-1',
    title: 'Implement comment requirements for status changes',
    description: 'Require a comment when moving issues to closed or when sending work backward to improve communication.',
    category: 'process',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec10-2',
    title: 'Run collaboration workshops',
    description: 'Train the team on using Jira as a collaboration tool, not just a task tracker. Emphasize the value of context in comments.',
    category: 'culture',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'rec10-3',
    title: 'Set up blocker templates',
    description: 'Create templates for blockers that prompt for context, impact, and needed resolution to improve blocker documentation.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec10-4',
    title: 'Review stale carryover items in retrospectives',
    description: 'Regularly review items carried over multiple sprints and either split them, update estimates, or remove them.',
    category: 'process',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec10-5',
    title: 'Encourage pair work documentation',
    description: 'When pair programming or collaborating, have both contributors comment on the issue to spread knowledge and create a record.',
    category: 'culture',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec10-6',
    title: 'Rotate component ownership',
    description: 'Periodically rotate who works on different components to spread knowledge and reduce single points of failure.',
    category: 'process',
    effort: 'medium',
    impact: 'high',
  },
  {
    id: 'rec10-7',
    title: 'Add handoff documentation prompts',
    description: 'When reassigning issues, prompt the assignor to add a comment explaining context and next steps.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
];

export const mockDimension10Result: DimensionResult = {
  dimensionKey: 'teamCollaboration',
  dimensionNumber: 10,
  dimensionName: 'Team Collaboration',
  dimensionTitle: 'Team Collaboration',
  questionForm: 'Are we using Jira to collaborate effectively (within our team and with other teams)?',
  riskDescription: 'collaboration patterns are weak',
  spectrumLeftLabel: 'Team actively collaborates through Jira',
  spectrumRightLabel: 'Collaboration happens outside Jira',
  verdict: 'Needs Attention',
  verdictDescription: 'Collaboration patterns indicate Jira is being used as a task tracker rather than a collaboration platform.',
  riskLevel: 'high',
  overallPercentile: 15,
  // CHS Health Score: percentile 15 → z≈-1.04 → base 40, declining -5 = 35
  healthScore: 35,
  benchmarkComparison: 'bottom 15% of the comparison group',
  benchmarkPercentile: 15,
  trend: 'declining',
  trendData: [
    { period: '2024-06', value: 20, benchmarkValue: 50 },
    { period: '2024-07', value: 18, benchmarkValue: 50 },
    { period: '2024-08', value: 17, benchmarkValue: 50 },
    { period: '2024-09', value: 16, benchmarkValue: 50 },
    { period: '2024-10', value: 15, benchmarkValue: 50 },
    { period: '2024-11', value: 15, benchmarkValue: 50 },
  ],
  categories: [teamCollaborationCategory],
  whyItMatters: 'Poor collaboration in Jira leads to knowledge silos, communication gaps, and single points of failure.',
  whyItMattersPoints: [
    'Issues without comments lack context for future reference',
    'Single-contributor work creates knowledge silos and bus factor risks',
    'Components with single owners become bottlenecks and single points of failure',
    'Silent handoffs lose context and create rework',
    'Work without review misses opportunities to catch issues and spread knowledge',
    'Poor blocker documentation delays resolution and affects planning',
  ],
  recommendations: dimension10Recommendations,
};

// ============================================
// DIMENSION 11: Automation Opportunities
// Is there manual/repetitive work that could be optimised via Jira Automation?
// ============================================

const repetitiveWorkCategory: IndicatorCategory = {
  id: 'repetitiveWork',
  name: 'Repetitive Work',
  shortName: 'Repetitive',
  description: 'Indicators identifying repetitive manual work that could be automated.',
  rationale: 'Repetitive ticket creation and updates consume capacity that could be automated.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 1,
  indicators: [
    {
      id: 'recreatingTickets',
      name: 'Sprint capacity on recreating tickets',
      description: '10% of our sprint capacity goes to recreating the same tickets every cycle [same title, description etc.]. We\'re in the bottom 5% of the comparison group. (Instead of sprint, we might want to look at the entire analysis period and calculate the number of work items that are identical to other work items)',
      value: 10,
      displayValue: '10%',
      unit: '%',
      benchmarkValue: 3,
      benchmarkDisplayValue: '3%',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 8, benchmarkValue: 3 },
        { period: '2024-04', value: 8, benchmarkValue: 3 },
        { period: '2024-05', value: 9, benchmarkValue: 3 },
        { period: '2024-06', value: 9, benchmarkValue: 3 },
        { period: '2024-07', value: 9, benchmarkValue: 3 },
        { period: '2024-08', value: 9, benchmarkValue: 3 },
        { period: '2024-09', value: 9, benchmarkValue: 3 },
        { period: '2024-10', value: 10, benchmarkValue: 3 },
        { period: '2024-11', value: 10, benchmarkValue: 3 },
      ],
      distribution: { min: 1, max: 18, otherTeamValues: [2, 3, 5, 7, 9, 12, 14, 16] },
    },
  ],
};

const automaticStatusCategory: IndicatorCategory = {
  id: 'automaticStatus',
  name: 'Automatic Status Updates',
  shortName: 'Auto Status',
  description: 'Indicators for status updates that could be automated based on rules.',
  rationale: 'Status updates based on child issue completion can be automated to reduce manual overhead.',
  statusColor: '#FFEBE6',
  status: 'high',
  issuesCount: 4,
  indicators: [
    {
      id: 'staleInProgressWork',
      name: 'Stale in-progress work items',
      description: '58% of our current in-progress work items are stale (haven\'t seen any change/update/movement in over n weeks). We\'re in the bottom 20% of the comparison group.',
      value: 58,
      displayValue: '58%',
      unit: '%',
      benchmarkValue: 30,
      benchmarkDisplayValue: '30%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 50, benchmarkValue: 30 },
        { period: '2024-04', value: 51, benchmarkValue: 30 },
        { period: '2024-05', value: 52, benchmarkValue: 30 },
        { period: '2024-06', value: 53, benchmarkValue: 30 },
        { period: '2024-07', value: 54, benchmarkValue: 30 },
        { period: '2024-08', value: 55, benchmarkValue: 30 },
        { period: '2024-09', value: 55, benchmarkValue: 30 },
        { period: '2024-10', value: 57, benchmarkValue: 30 },
        { period: '2024-11', value: 58, benchmarkValue: 30 },
      ],
      distribution: { min: 15, max: 72, otherTeamValues: [22, 28, 35, 42, 50, 58, 65, 70] },
    },
    {
      id: 'staleInProgressEpics',
      name: 'Stale in-progress Epics',
      description: '15% of our current in-progress work Epics are stale (haven\'t seen any change/update/movement in over n months). We\'re in the top 10% of the comparison group.',
      value: 15,
      displayValue: '15%',
      unit: '%',
      benchmarkValue: 25,
      benchmarkDisplayValue: '25%',
      benchmarkComparison: 'top 10% of the comparison group',
      benchmarkPercentile: 90,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 28, benchmarkValue: 25 },
        { period: '2024-04', value: 26, benchmarkValue: 25 },
        { period: '2024-05', value: 25, benchmarkValue: 25 },
        { period: '2024-06', value: 24, benchmarkValue: 25 },
        { period: '2024-07', value: 22, benchmarkValue: 25 },
        { period: '2024-08', value: 21, benchmarkValue: 25 },
        { period: '2024-09', value: 20, benchmarkValue: 25 },
        { period: '2024-10', value: 18, benchmarkValue: 25 },
        { period: '2024-11', value: 15, benchmarkValue: 25 },
      ],
      distribution: { min: 5, max: 45, otherTeamValues: [8, 12, 18, 22, 28, 32, 38, 42] },
    },
    {
      id: 'epicsClosedWithOpenChildren',
      name: 'Epics closed with unresolved children',
      description: 'Of the Epics that were moved to \'Done\' in the timespan specified, 80% still had child work items that were not resolved. We\'re in the bottom 5% of the comparison group.',
      value: 80,
      displayValue: '80%',
      unit: '%',
      benchmarkValue: 30,
      benchmarkDisplayValue: '30%',
      benchmarkComparison: 'bottom 5% of the comparison group',
      benchmarkPercentile: 5,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 75, benchmarkValue: 30 },
        { period: '2024-04', value: 76, benchmarkValue: 30 },
        { period: '2024-05', value: 76, benchmarkValue: 30 },
        { period: '2024-06', value: 77, benchmarkValue: 30 },
        { period: '2024-07', value: 77, benchmarkValue: 30 },
        { period: '2024-08', value: 78, benchmarkValue: 30 },
        { period: '2024-09', value: 78, benchmarkValue: 30 },
        { period: '2024-10', value: 79, benchmarkValue: 30 },
        { period: '2024-11', value: 80, benchmarkValue: 30 },
      ],
      distribution: { min: 12, max: 88, otherTeamValues: [18, 28, 38, 48, 58, 68, 78, 85] },
    },
    {
      id: 'delayedSubtaskCompletion',
      name: 'Delayed parent completion after sub-tasks done',
      description: '65% of issues that had sub-tasks were still marked not done for at least a week after all their sub-tasks where completed. (another way to put this is e.g. it takes on average 5 days after the last sub-task is marked done before the story is moved to Done)',
      value: 65,
      displayValue: '65%',
      unit: '%',
      benchmarkValue: 25,
      benchmarkDisplayValue: '25%',
      benchmarkComparison: 'bottom 10% of the comparison group',
      benchmarkPercentile: 10,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 58, benchmarkValue: 25 },
        { period: '2024-04', value: 59, benchmarkValue: 25 },
        { period: '2024-05', value: 59, benchmarkValue: 25 },
        { period: '2024-06', value: 60, benchmarkValue: 25 },
        { period: '2024-07', value: 61, benchmarkValue: 25 },
        { period: '2024-08', value: 62, benchmarkValue: 25 },
        { period: '2024-09', value: 62, benchmarkValue: 25 },
        { period: '2024-10', value: 64, benchmarkValue: 25 },
        { period: '2024-11', value: 65, benchmarkValue: 25 },
      ],
      distribution: { min: 10, max: 78, otherTeamValues: [18, 25, 35, 45, 55, 62, 70, 75] },
    },
    {
      id: 'delayedEpicCompletion',
      name: 'Delayed Epic completion after children done',
      description: '30% of Epics were still marked not done for at least a week after all their child issues where completed. (another way to put this is e.g. it takes on average 5 days after the last child of an Epic is marked done before the Epic is moved to Done)',
      value: 30,
      displayValue: '30%',
      unit: '%',
      benchmarkValue: 15,
      benchmarkDisplayValue: '15%',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-03', value: 25, benchmarkValue: 15 },
        { period: '2024-04', value: 26, benchmarkValue: 15 },
        { period: '2024-05', value: 26, benchmarkValue: 15 },
        { period: '2024-06', value: 27, benchmarkValue: 15 },
        { period: '2024-07', value: 27, benchmarkValue: 15 },
        { period: '2024-08', value: 28, benchmarkValue: 15 },
        { period: '2024-09', value: 28, benchmarkValue: 15 },
        { period: '2024-10', value: 29, benchmarkValue: 15 },
        { period: '2024-11', value: 30, benchmarkValue: 15 },
      ],
      distribution: { min: 5, max: 48, otherTeamValues: [8, 12, 18, 22, 28, 35, 40, 45] },
    },
  ],
};

const dimension11Recommendations: Recommendation[] = [
  {
    id: 'rec11-1',
    title: 'Set up recurring ticket automation',
    description: 'Use Jira Automation to create recurring tickets automatically instead of manual recreation each sprint.',
    category: 'tooling',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec11-2',
    title: 'Implement auto-transition rules',
    description: 'Create automation rules to automatically move parent issues to Done when all children are completed.',
    category: 'tooling',
    effort: 'low',
    impact: 'high',
  },
  {
    id: 'rec11-3',
    title: 'Set up stale issue alerts',
    description: 'Create automations to flag or notify when in-progress items haven\'t been updated in a specified time period.',
    category: 'tooling',
    effort: 'low',
    impact: 'medium',
  },
  {
    id: 'rec11-4',
    title: 'Add Epic completion validation',
    description: 'Set up automation rules that prevent Epics from being closed while they still have unresolved children.',
    category: 'governance',
    effort: 'low',
    impact: 'high',
  },
];

export const mockDimension11Result: DimensionResult = {
  dimensionKey: 'automationOpportunities',
  dimensionNumber: 11,
  dimensionName: 'Automation Opportunities',
  dimensionTitle: 'Automation Opportunities',
  questionForm: 'Is there manual/repetitive work that could be optimised via Jira Automation?',
  riskDescription: 'manual work could be automated',
  spectrumLeftLabel: 'Repetitive tasks automated via rules',
  spectrumRightLabel: 'Manual effort on automatable tasks',
  verdict: 'Below Average',
  verdictDescription: 'Significant manual overhead exists that could be automated to improve efficiency.',
  riskLevel: 'high',
  overallPercentile: 18,
  // CHS Health Score: percentile 18 → z≈-0.92 → base 41, stable +0 = 41
  healthScore: 41,
  benchmarkComparison: 'bottom 18% of the comparison group',
  benchmarkPercentile: 18,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 20, benchmarkValue: 50 },
    { period: '2024-07', value: 19, benchmarkValue: 50 },
    { period: '2024-08', value: 18, benchmarkValue: 50 },
    { period: '2024-09', value: 18, benchmarkValue: 50 },
    { period: '2024-10', value: 18, benchmarkValue: 50 },
    { period: '2024-11', value: 18, benchmarkValue: 50 },
  ],
  categories: [repetitiveWorkCategory, automaticStatusCategory],
  whyItMatters: 'Manual repetitive work wastes capacity and introduces human error.',
  whyItMattersPoints: [
    'Recreating tickets manually wastes sprint capacity on non-value work',
    'Delayed status updates cause stale data and unreliable metrics',
    'Closing Epics with open children creates data integrity issues',
    'Manual status management increases cognitive load on team members',
  ],
  recommendations: dimension11Recommendations,
};

// ============================================
// Dimension 12: Collaboration Feature Usage
// ============================================

const collaborationFeatureCategory: IndicatorCategory = {
  id: 'feature-adoption',
  name: 'Feature Adoption',
  shortName: 'Adoption',
  description: 'Measures whether teams are using Jira\'s collaboration features for links, mentions, and watchers.',
  rationale: 'Jira provides tools for making relationships visible and routing attention. Underused features mean missed collaboration opportunities.',
  statusColor: '#0747A6',
  status: 'moderate',
  issuesCount: 5,
  indicators: [
    {
      id: 'issueLinkAdoptionRate',
      name: 'Issue Link Adoption Rate',
      description: 'Percentage of issues with at least one link to another issue.',
      whyItMatters: 'Links make relationships visible. Without links, dependencies and context exist only in people\'s heads.',
      value: 42,
      displayValue: '42%',
      unit: '%',
      benchmarkValue: 60,
      benchmarkDisplayValue: '60%',
      benchmarkComparison: 'bottom 35% of the comparison group',
      benchmarkPercentile: 35,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 35, benchmarkValue: 60 },
        { period: '2024-07', value: 37, benchmarkValue: 60 },
        { period: '2024-08', value: 38, benchmarkValue: 60 },
        { period: '2024-09', value: 39, benchmarkValue: 60 },
        { period: '2024-10', value: 41, benchmarkValue: 60 },
        { period: '2024-11', value: 42, benchmarkValue: 60 },
      ],
      distribution: { min: 22, max: 82, otherTeamValues: [28, 38, 48, 55, 62, 70, 75, 80] },
    },
    {
      id: 'crossTeamLinkRate',
      name: 'Cross-Team Link Rate',
      description: 'Percentage of links that connect to issues owned by other teams.',
      whyItMatters: 'Cross-team links reveal dependencies between teams that need coordination.',
      value: 18,
      displayValue: '18%',
      unit: '%',
      benchmarkValue: 25,
      benchmarkDisplayValue: '25%',
      benchmarkComparison: 'bottom 35% of the comparison group',
      benchmarkPercentile: 35,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 17, benchmarkValue: 25 },
        { period: '2024-07', value: 18, benchmarkValue: 25 },
        { period: '2024-08', value: 18, benchmarkValue: 25 },
        { period: '2024-09', value: 18, benchmarkValue: 25 },
        { period: '2024-10', value: 18, benchmarkValue: 25 },
        { period: '2024-11', value: 18, benchmarkValue: 25 },
      ],
      distribution: { min: 8, max: 45, otherTeamValues: [12, 18, 22, 28, 32, 38, 42, 44] },
    },
    {
      id: 'atMentionUsageRate',
      name: '@Mention Usage Rate',
      description: 'Percentage of comments that include @mentions to draw people in.',
      whyItMatters: '@mentions route attention efficiently. Without them, people miss relevant discussions.',
      value: 22,
      displayValue: '22%',
      unit: '%',
      benchmarkValue: 35,
      benchmarkDisplayValue: '35%',
      benchmarkComparison: 'bottom 30% of the comparison group',
      benchmarkPercentile: 30,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 18, benchmarkValue: 35 },
        { period: '2024-07', value: 19, benchmarkValue: 35 },
        { period: '2024-08', value: 20, benchmarkValue: 35 },
        { period: '2024-09', value: 21, benchmarkValue: 35 },
        { period: '2024-10', value: 21, benchmarkValue: 35 },
        { period: '2024-11', value: 22, benchmarkValue: 35 },
      ],
      distribution: { min: 10, max: 55, otherTeamValues: [15, 22, 28, 35, 42, 48, 52, 54] },
    },
    {
      id: 'crossTeamAtMentionRate',
      name: 'Cross-Team @Mention Rate',
      description: 'Percentage of @mentions that tag people from other teams.',
      whyItMatters: 'Cross-team mentions indicate active coordination beyond team boundaries.',
      value: 8,
      displayValue: '8%',
      unit: '%',
      benchmarkValue: 15,
      benchmarkDisplayValue: '15%',
      benchmarkComparison: 'bottom 35% of the comparison group',
      benchmarkPercentile: 35,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 7, benchmarkValue: 15 },
        { period: '2024-07', value: 8, benchmarkValue: 15 },
        { period: '2024-08', value: 8, benchmarkValue: 15 },
        { period: '2024-09', value: 8, benchmarkValue: 15 },
        { period: '2024-10', value: 8, benchmarkValue: 15 },
        { period: '2024-11', value: 8, benchmarkValue: 15 },
      ],
      distribution: { min: 3, max: 28, otherTeamValues: [5, 8, 12, 15, 18, 22, 25, 27] },
    },
    {
      id: 'watcherEngagement',
      name: 'Watcher Engagement',
      description: 'Average number of watchers per issue.',
      whyItMatters: 'Watchers indicate stakeholder interest. No watchers means no one is paying attention.',
      value: 1.2,
      displayValue: '1.2',
      unit: 'watchers',
      benchmarkValue: 2.5,
      benchmarkDisplayValue: '2.5',
      benchmarkComparison: 'bottom 40% of the comparison group',
      benchmarkPercentile: 40,
      trend: 'stable',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 1.1, benchmarkValue: 2.5 },
        { period: '2024-07', value: 1.2, benchmarkValue: 2.5 },
        { period: '2024-08', value: 1.2, benchmarkValue: 2.5 },
        { period: '2024-09', value: 1.2, benchmarkValue: 2.5 },
        { period: '2024-10', value: 1.2, benchmarkValue: 2.5 },
        { period: '2024-11', value: 1.2, benchmarkValue: 2.5 },
      ],
      distribution: { min: 0.5, max: 4.2, otherTeamValues: [0.8, 1.4, 1.8, 2.2, 2.8, 3.2, 3.6, 4.0] },
    },
  ],
};

export const mockDimension12Result: DimensionResult = {
  dimensionKey: 'collaborationFeatureUsage',
  dimensionNumber: 12,
  dimensionName: 'Collaboration Feature Usage',
  dimensionTitle: 'Collaboration Feature Usage',
  questionForm: 'Are we leveraging Jira\'s collaboration features?',
  riskDescription: 'collaboration features are underutilized',
  spectrumLeftLabel: 'Comments, mentions, and links used actively',
  spectrumRightLabel: 'Collaboration features rarely used',
  verdict: 'Average',
  verdictDescription: 'Some collaboration features are used, but there are opportunities to improve.',
  riskLevel: 'moderate',
  overallPercentile: 38,
  // CHS Health Score: percentile 38 → z≈-0.31 → base 47, improving +5 = 52
  healthScore: 52,
  benchmarkComparison: '38th percentile',
  benchmarkPercentile: 38,
  trend: 'improving',
  trendData: [
    { period: '2024-06', value: 32, benchmarkValue: 50 },
    { period: '2024-07', value: 34, benchmarkValue: 50 },
    { period: '2024-08', value: 35, benchmarkValue: 50 },
    { period: '2024-09', value: 36, benchmarkValue: 50 },
    { period: '2024-10', value: 37, benchmarkValue: 50 },
    { period: '2024-11', value: 38, benchmarkValue: 50 },
  ],
  categories: [collaborationFeatureCategory],
  whyItMatters: 'Jira provides features for making relationships visible and routing attention that are often underutilized.',
  whyItMattersPoints: [
    'Issue links make dependencies and relationships visible',
    '@mentions draw the right people into conversations',
    'Cross-team links and mentions reveal coordination needs',
    'Watchers keep stakeholders informed without requiring action',
  ],
  recommendations: [
    {
      id: 'rec12-1',
      title: 'Encourage issue linking',
      description: 'Remind the team to link related issues during refinement and daily standups.',
      category: 'culture',
      effort: 'low',
      impact: 'medium',
    },
    {
      id: 'rec12-2',
      title: 'Use @mentions for attention routing',
      description: 'Train the team to @mention stakeholders when input is needed instead of relying on manual follow-ups.',
      category: 'culture',
      effort: 'low',
      impact: 'medium',
    },
    {
      id: 'rec12-3',
      title: 'Add watchers for visibility',
      description: 'Encourage adding relevant stakeholders as watchers to keep them informed without requiring action.',
      category: 'culture',
      effort: 'low',
      impact: 'low',
    },
  ],
  maturityLevel: 2,
  maturityName: 'Below Average',
};

// ============================================
// Dimension 14: Configuration Efficiency
// (Note: Dimension 13 "Collaboration Breadth" was merged into Dimension 10 "Team Collaboration")
// ============================================

const configurationEfficiencyCategory: IndicatorCategory = {
  id: 'config-efficiency',
  name: 'Configuration Overhead',
  shortName: 'Overhead',
  description: 'Measures workflow complexity and unused configuration',
  rationale: 'Every configuration element has a cost. Unnecessary complexity creates friction.',
  statusColor: '#FF991F',
  status: 'high',
  issuesCount: 7,
  indicators: [
    {
      id: 'workflowStatusCount',
      name: 'Workflow Status Count',
      description: 'Number of statuses in the team\'s workflow.',
      whyItMatters: 'Too many statuses creates confusion and overhead. 6-8 is optimal.',
      value: 14,
      displayValue: '14',
      unit: 'statuses',
      benchmarkValue: 7,
      benchmarkDisplayValue: '7',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 14, benchmarkValue: 7 },
        { period: '2024-07', value: 14, benchmarkValue: 7 },
        { period: '2024-08', value: 14, benchmarkValue: 7 },
        { period: '2024-09', value: 14, benchmarkValue: 7 },
        { period: '2024-10', value: 14, benchmarkValue: 7 },
        { period: '2024-11', value: 14, benchmarkValue: 7 },
      ],
      distribution: { min: 4, max: 22, otherTeamValues: [5, 6, 7, 9, 11, 14, 17, 20] },
    },
    {
      id: 'unusedStatusRate',
      name: 'Unused Status Rate',
      description: 'Percentage of workflow statuses that issues rarely enter.',
      whyItMatters: 'Unused statuses are pure overhead - they exist but add no value.',
      value: 35,
      displayValue: '35%',
      unit: '%',
      benchmarkValue: 10,
      benchmarkDisplayValue: '10%',
      benchmarkComparison: 'bottom 15% of the comparison group',
      benchmarkPercentile: 15,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 35, benchmarkValue: 10 },
        { period: '2024-07', value: 35, benchmarkValue: 10 },
        { period: '2024-08', value: 35, benchmarkValue: 10 },
        { period: '2024-09', value: 35, benchmarkValue: 10 },
        { period: '2024-10', value: 35, benchmarkValue: 10 },
        { period: '2024-11', value: 35, benchmarkValue: 10 },
      ],
      distribution: { min: 5, max: 50, otherTeamValues: [8, 12, 18, 22, 28, 35, 42, 48] },
    },
    {
      id: 'workflowBypassRate',
      name: 'Workflow Bypass Rate',
      description: 'Percentage of issues that skipped expected intermediate workflow states.',
      whyItMatters: 'Bypasses suggest the workflow doesn\'t match how work actually flows.',
      value: 22,
      displayValue: '22%',
      unit: '%',
      benchmarkValue: 8,
      benchmarkDisplayValue: '8%',
      benchmarkComparison: 'bottom 25% of the comparison group',
      benchmarkPercentile: 25,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 24, benchmarkValue: 8 },
        { period: '2024-07', value: 23, benchmarkValue: 8 },
        { period: '2024-08', value: 22, benchmarkValue: 8 },
        { period: '2024-09', value: 22, benchmarkValue: 8 },
        { period: '2024-10', value: 22, benchmarkValue: 8 },
        { period: '2024-11', value: 22, benchmarkValue: 8 },
      ],
      distribution: { min: 3, max: 35, otherTeamValues: [5, 8, 12, 16, 20, 25, 30, 34] },
    },
    {
      id: 'requiredFieldLoad',
      name: 'Required Field Load',
      description: 'Count of required fields on creation and transition screens.',
      whyItMatters: 'Too many required fields slow down work entry and encourage workarounds.',
      value: 12,
      displayValue: '12',
      unit: 'fields',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5',
      benchmarkComparison: 'bottom 20% of the comparison group',
      benchmarkPercentile: 20,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 12, benchmarkValue: 5 },
        { period: '2024-07', value: 12, benchmarkValue: 5 },
        { period: '2024-08', value: 12, benchmarkValue: 5 },
        { period: '2024-09', value: 12, benchmarkValue: 5 },
        { period: '2024-10', value: 12, benchmarkValue: 5 },
        { period: '2024-11', value: 12, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 18, otherTeamValues: [3, 4, 5, 7, 9, 11, 14, 17] },
    },
    {
      id: 'emptyOptionalFieldRate',
      name: 'Empty Optional Field Rate',
      description: 'Percentage of optional fields that are typically left empty.',
      whyItMatters: 'Consistently empty optional fields are clutter that should be removed.',
      value: 68,
      displayValue: '68%',
      unit: '%',
      benchmarkValue: 40,
      benchmarkDisplayValue: '40%',
      benchmarkComparison: 'bottom 30% of the comparison group',
      benchmarkPercentile: 30,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 70, benchmarkValue: 40 },
        { period: '2024-07', value: 69, benchmarkValue: 40 },
        { period: '2024-08', value: 68, benchmarkValue: 40 },
        { period: '2024-09', value: 68, benchmarkValue: 40 },
        { period: '2024-10', value: 68, benchmarkValue: 40 },
        { period: '2024-11', value: 68, benchmarkValue: 40 },
      ],
      distribution: { min: 25, max: 82, otherTeamValues: [32, 40, 48, 55, 62, 70, 75, 80] },
    },
    {
      id: 'duplicateTicketPatternRate',
      name: 'Duplicate Ticket Pattern Rate',
      description: 'Percentage of tickets with highly similar titles/descriptions.',
      whyItMatters: 'Similar tickets suggest templates are needed or work is being duplicated.',
      value: 15,
      displayValue: '15%',
      unit: '%',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5%',
      benchmarkComparison: 'bottom 22% of the comparison group',
      benchmarkPercentile: 22,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 20, benchmarkValue: 5 },
        { period: '2024-07', value: 18, benchmarkValue: 5 },
        { period: '2024-08', value: 17, benchmarkValue: 5 },
        { period: '2024-09', value: 16, benchmarkValue: 5 },
        { period: '2024-10', value: 15, benchmarkValue: 5 },
        { period: '2024-11', value: 15, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 28, otherTeamValues: [3, 5, 8, 12, 16, 20, 24, 27] },
    },
    {
      id: 'customFieldCount',
      name: 'Custom Field Count',
      description: 'Number of custom fields configured in the project.',
      whyItMatters: 'Excessive custom fields make Jira projects non-standard and harder to maintain, report on, and onboard new team members.',
      value: 47,
      displayValue: '47',
      unit: 'fields',
      benchmarkValue: 15,
      benchmarkDisplayValue: '15',
      benchmarkComparison: 'bottom 12% of the comparison group',
      benchmarkPercentile: 12,
      trend: 'declining',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 42, benchmarkValue: 15 },
        { period: '2024-07', value: 44, benchmarkValue: 15 },
        { period: '2024-08', value: 45, benchmarkValue: 15 },
        { period: '2024-09', value: 46, benchmarkValue: 15 },
        { period: '2024-10', value: 46, benchmarkValue: 15 },
        { period: '2024-11', value: 47, benchmarkValue: 15 },
      ],
      distribution: { min: 8, max: 65, otherTeamValues: [12, 18, 25, 32, 40, 48, 55, 62] },
    },
  ],
};

export const mockDimension14Result: DimensionResult = {
  dimensionKey: 'configurationEfficiency',
  dimensionNumber: 14,
  dimensionName: 'Configuration Efficiency',
  dimensionTitle: 'Configuration Efficiency',
  questionForm: 'Is our Jira setup lean or bloated?',
  riskDescription: 'Jira configuration creates unnecessary overhead',
  spectrumLeftLabel: 'Workflows and fields are streamlined',
  spectrumRightLabel: 'Excessive statuses, fields, or complexity',
  verdict: 'Below Average',
  verdictDescription: 'Jira configuration has accumulated complexity that should be simplified.',
  riskLevel: 'high',
  overallPercentile: 18,
  // CHS Health Score: percentile 18 → z≈-0.92 → base 41, stable +0 = 41
  healthScore: 41,
  benchmarkComparison: 'bottom 18% of the comparison group',
  benchmarkPercentile: 18,
  trend: 'stable',
  trendData: [
    { period: '2024-06', value: 18, benchmarkValue: 50 },
    { period: '2024-07', value: 18, benchmarkValue: 50 },
    { period: '2024-08', value: 18, benchmarkValue: 50 },
    { period: '2024-09', value: 18, benchmarkValue: 50 },
    { period: '2024-10', value: 18, benchmarkValue: 50 },
    { period: '2024-11', value: 18, benchmarkValue: 50 },
  ],
  categories: [configurationEfficiencyCategory],
  whyItMatters: 'Over-engineered Jira creates friction and leads to workarounds that undermine data quality.',
  whyItMattersPoints: [
    'Too many statuses creates cognitive overhead',
    'Unused statuses and fields are clutter',
    'Workflow bypasses indicate mismatch with reality',
    'Excessive required fields slow down work',
  ],
  recommendations: [
    {
      id: 'rec14-1',
      title: 'Audit and simplify workflow',
      description: 'Review which statuses are rarely used and consider consolidating or removing them.',
      category: 'tooling',
      effort: 'medium',
      impact: 'high',
    },
  ],
  maturityLevel: 1,
  maturityName: 'Needs Attention',
};

// ============================================
// Dimension 16: Backlog Discipline
// ============================================

const backlogDisciplineCategory: IndicatorCategory = {
  id: 'backlog-discipline',
  name: 'Backlog Health',
  shortName: 'Health',
  description: 'Measures backlog staleness and bloat',
  rationale: 'A stale, bloated backlog slows down planning and contains obsolete items.',
  statusColor: '#00875A',
  status: 'low',
  issuesCount: 8,
  indicators: [
    {
      id: 'backlogStalenessDistribution',
      name: 'Backlog Age Distribution',
      description: 'Distribution of backlog items by age: <30 days, 30-90, 90-180, 180-365, >1 year.',
      whyItMatters: 'Old backlog items are often obsolete. Fresh backlogs enable responsive planning.',
      value: 35,
      displayValue: '35%',
      unit: '% over 6 months',
      benchmarkValue: 20,
      benchmarkDisplayValue: '20%',
      benchmarkComparison: 'bottom 40% of the comparison group',
      benchmarkPercentile: 40,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 45, benchmarkValue: 20 },
        { period: '2024-07', value: 42, benchmarkValue: 20 },
        { period: '2024-08', value: 40, benchmarkValue: 20 },
        { period: '2024-09', value: 38, benchmarkValue: 20 },
        { period: '2024-10', value: 36, benchmarkValue: 20 },
        { period: '2024-11', value: 35, benchmarkValue: 20 },
      ],
      distribution: { min: 8, max: 55, otherTeamValues: [12, 18, 25, 32, 40, 48, 52, 54] },
    },
    {
      id: 'backlogDepthRatio',
      name: 'Backlog Depth Ratio',
      description: 'Backlog size relative to average sprint throughput (in sprints worth).',
      whyItMatters: 'Too deep a backlog is overwhelming; too shallow means poor planning ahead.',
      value: 8.5,
      displayValue: '8.5',
      unit: 'sprints',
      benchmarkValue: 4,
      benchmarkDisplayValue: '4',
      benchmarkComparison: 'bottom 35% of the comparison group',
      benchmarkPercentile: 35,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 12, benchmarkValue: 4 },
        { period: '2024-07', value: 11, benchmarkValue: 4 },
        { period: '2024-08', value: 10, benchmarkValue: 4 },
        { period: '2024-09', value: 9.5, benchmarkValue: 4 },
        { period: '2024-10', value: 9, benchmarkValue: 4 },
        { period: '2024-11', value: 8.5, benchmarkValue: 4 },
      ],
      distribution: { min: 2, max: 15, otherTeamValues: [2.5, 3.5, 4.5, 5.5, 7, 9, 11, 13] },
    },
    {
      id: 'zombieItemCount',
      name: 'Zombie Item Count',
      description: 'Items in backlog with no updates in 6+ months but still open.',
      whyItMatters: 'Zombie items are obsolete clutter. They should be refreshed or closed.',
      value: 8,
      displayValue: '8',
      unit: 'items',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5',
      benchmarkComparison: '55th percentile',
      benchmarkPercentile: 55,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 15, benchmarkValue: 5 },
        { period: '2024-07', value: 14, benchmarkValue: 5 },
        { period: '2024-08', value: 12, benchmarkValue: 5 },
        { period: '2024-09', value: 10, benchmarkValue: 5 },
        { period: '2024-10', value: 9, benchmarkValue: 5 },
        { period: '2024-11', value: 8, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 20, otherTeamValues: [3, 4, 5, 7, 9, 12, 15, 18] },
    },
    {
      id: 'backlogPruningRate',
      name: 'Backlog Pruning Rate',
      description: 'Items closed as Won\'t Do, Obsolete, or Duplicate per quarter.',
      whyItMatters: 'Regular pruning keeps the backlog relevant and manageable.',
      value: 12,
      displayValue: '12',
      unit: 'items/quarter',
      benchmarkValue: 8,
      benchmarkDisplayValue: '8',
      benchmarkComparison: '65th percentile',
      benchmarkPercentile: 65,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 5, benchmarkValue: 8 },
        { period: '2024-07', value: 7, benchmarkValue: 8 },
        { period: '2024-08', value: 8, benchmarkValue: 8 },
        { period: '2024-09', value: 10, benchmarkValue: 8 },
        { period: '2024-10', value: 11, benchmarkValue: 8 },
        { period: '2024-11', value: 12, benchmarkValue: 8 },
      ],
      distribution: { min: 2, max: 22, otherTeamValues: [4, 6, 8, 10, 13, 16, 18, 20] },
    },
    {
      id: 'sprintReadyCoverage',
      name: 'Sprint-Ready Coverage',
      description: 'Percentage of top backlog items that have estimates and acceptance criteria.',
      whyItMatters: 'Sprint-ready items enable smooth sprint planning without delays.',
      value: 72,
      displayValue: '72%',
      unit: '%',
      benchmarkValue: 80,
      benchmarkDisplayValue: '80%',
      benchmarkComparison: '55th percentile',
      benchmarkPercentile: 55,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 55, benchmarkValue: 80 },
        { period: '2024-07', value: 60, benchmarkValue: 80 },
        { period: '2024-08', value: 64, benchmarkValue: 80 },
        { period: '2024-09', value: 68, benchmarkValue: 80 },
        { period: '2024-10', value: 70, benchmarkValue: 80 },
        { period: '2024-11', value: 72, benchmarkValue: 80 },
      ],
      distribution: { min: 45, max: 95, otherTeamValues: [52, 60, 68, 75, 82, 88, 92, 94] },
    },
    {
      id: 'refinementLag',
      name: 'Refinement Lag',
      description: 'Average days from item creation to receiving first estimate.',
      whyItMatters: 'Long refinement lag means items sit unreviewed, blocking planning.',
      value: 8,
      displayValue: '8',
      unit: 'days',
      benchmarkValue: 5,
      benchmarkDisplayValue: '5',
      benchmarkComparison: '60th percentile',
      benchmarkPercentile: 60,
      trend: 'improving',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 14, benchmarkValue: 5 },
        { period: '2024-07', value: 12, benchmarkValue: 5 },
        { period: '2024-08', value: 11, benchmarkValue: 5 },
        { period: '2024-09', value: 10, benchmarkValue: 5 },
        { period: '2024-10', value: 9, benchmarkValue: 5 },
        { period: '2024-11', value: 8, benchmarkValue: 5 },
      ],
      distribution: { min: 2, max: 18, otherTeamValues: [3, 4, 5, 7, 9, 12, 15, 17] },
    },
    {
      id: 'priorityStabilityIndex',
      name: 'Priority Stability Index',
      description: 'Average number of priority changes before an item is committed to a sprint.',
      whyItMatters: 'Frequent priority changes signal unclear strategy or reactive leadership.',
      value: 2.1,
      displayValue: '2.1',
      unit: 'changes',
      benchmarkValue: 1.5,
      benchmarkDisplayValue: '1.5',
      benchmarkComparison: '58th percentile',
      benchmarkPercentile: 58,
      trend: 'stable',
      higherIsBetter: false,
      trendData: [
        { period: '2024-06', value: 2.3, benchmarkValue: 1.5 },
        { period: '2024-07', value: 2.2, benchmarkValue: 1.5 },
        { period: '2024-08', value: 2.2, benchmarkValue: 1.5 },
        { period: '2024-09', value: 2.1, benchmarkValue: 1.5 },
        { period: '2024-10', value: 2.1, benchmarkValue: 1.5 },
        { period: '2024-11', value: 2.1, benchmarkValue: 1.5 },
      ],
      distribution: { min: 0.8, max: 4.2, otherTeamValues: [1.0, 1.3, 1.5, 1.8, 2.2, 2.8, 3.4, 3.9] },
    },
    {
      id: 'refinementToIntakeRatio',
      name: 'Refinement to Intake Ratio',
      description: 'Ratio of items refined to items created per period.',
      whyItMatters: 'If intake exceeds refinement, backlog will grow stale over time.',
      value: 0.85,
      displayValue: '0.85',
      unit: 'ratio',
      benchmarkValue: 1.0,
      benchmarkDisplayValue: '1.0',
      benchmarkComparison: '55th percentile',
      benchmarkPercentile: 55,
      trend: 'improving',
      higherIsBetter: true,
      trendData: [
        { period: '2024-06', value: 0.65, benchmarkValue: 1.0 },
        { period: '2024-07', value: 0.70, benchmarkValue: 1.0 },
        { period: '2024-08', value: 0.75, benchmarkValue: 1.0 },
        { period: '2024-09', value: 0.78, benchmarkValue: 1.0 },
        { period: '2024-10', value: 0.82, benchmarkValue: 1.0 },
        { period: '2024-11', value: 0.85, benchmarkValue: 1.0 },
      ],
      distribution: { min: 0.5, max: 1.4, otherTeamValues: [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3] },
    },
  ],
};

export const mockDimension16Result: DimensionResult = {
  dimensionKey: 'backlogDiscipline',
  dimensionNumber: 16,
  dimensionName: 'Backlog Discipline',
  dimensionTitle: 'Backlog Discipline',
  questionForm: 'Is the backlog well-maintained and ready for planning?',
  riskDescription: 'backlog health issues undermine planning effectiveness',
  spectrumLeftLabel: 'Backlog is current, groomed, and prioritized',
  spectrumRightLabel: 'Backlog cluttered with stale or unrefined items',
  verdict: 'Good',
  verdictDescription: 'Backlog is reasonably well-maintained with active pruning happening.',
  riskLevel: 'low',
  overallPercentile: 68,
  // CHS Health Score: percentile 68 → z≈0.47 → base 55, improving +5 = 60
  healthScore: 60,
  benchmarkComparison: '68th percentile',
  benchmarkPercentile: 68,
  trend: 'improving',
  trendData: [
    { period: '2024-06', value: 52, benchmarkValue: 50 },
    { period: '2024-07', value: 56, benchmarkValue: 50 },
    { period: '2024-08', value: 60, benchmarkValue: 50 },
    { period: '2024-09', value: 63, benchmarkValue: 50 },
    { period: '2024-10', value: 66, benchmarkValue: 50 },
    { period: '2024-11', value: 68, benchmarkValue: 50 },
  ],
  categories: [backlogDisciplineCategory],
  whyItMatters: 'A healthy backlog is the foundation of effective planning.',
  whyItMattersPoints: [
    'Stale items slow down refinement',
    'Zombie items are obsolete clutter',
    'Sprint-ready items enable smooth planning',
    'Timely refinement keeps pace with intake',
  ],
  recommendations: [
    {
      id: 'rec16-1',
      title: 'Continue backlog pruning',
      description: 'Keep up the good work! Consider scheduling monthly backlog reviews.',
      category: 'process',
      effort: 'low',
      impact: 'medium',
    },
  ],
  maturityLevel: 4,
  maturityName: 'Good',
};

// Updated generator to include Dimension 2
export const generateMockAssessmentResultWithDim2 = (
  wizardState: WizardState
): AssessmentResult => {
  const baseResult = generateMockAssessmentResult(wizardState);

  return {
    ...baseResult,
    dimensions: [baseResult.dimensions[0], mockDimension2Result],
  };
};

// Updated generator to include all 14 dimensions (Dim 13 was merged into Dim 10, Dim 15 and 17 removed)
export const generateMockAssessmentResultWithDim3 = (
  wizardState: WizardState
): AssessmentResult => {
  const baseResult = generateMockAssessmentResult(wizardState);

  return {
    ...baseResult,
    dimensions: [
      baseResult.dimensions[0],
      mockDimension2Result,
      mockDimension3Result,
      mockDimension4Result,
      mockDimension5Result,
      mockDimension6Result,
      mockDimension7Result,
      mockDimension8Result,
      mockDimension9Result,
      mockDimension10Result,
      mockDimension11Result,
      mockDimension12Result,
      mockDimension14Result,
      mockDimension16Result,
    ],
  };
};

// ============================================
// Scenario-Based Assessment Generator
// ============================================

export type TrendBias = 'improving' | 'stable' | 'declining' | 'mixed';

export interface AssessmentScenario {
  teamId: string;
  teamName: string;
  targetPercentile: number;
  percentileVariance: number;
  trendBias: TrendBias;
}

// All 14 base dimensions for transformation (Dim 13 was merged into Dim 10, Dim 15 and 17 removed)
const allBaseDimensions: DimensionResult[] = [
  mockDimension1Result,
  mockDimension2Result,
  mockDimension3Result,
  mockDimension4Result,
  mockDimension5Result,
  mockDimension6Result,
  mockDimension7Result,
  mockDimension8Result,
  mockDimension9Result,
  mockDimension10Result,
  mockDimension11Result,
  mockDimension12Result,
  mockDimension14Result,
  mockDimension16Result,
];

/**
 * Deep clone helper to avoid mutating original data
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a random number within a range, with seeding based on index for consistency
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Get trend direction based on bias
 */
function getTrendForBias(trendBias: TrendBias, index: number): 'improving' | 'stable' | 'declining' {
  if (trendBias === 'improving') {
    // 70% improving, 20% stable, 10% declining
    const rand = seededRandom(index);
    if (rand < 0.7) return 'improving';
    if (rand < 0.9) return 'stable';
    return 'declining';
  }
  if (trendBias === 'declining') {
    // 70% declining, 20% stable, 10% improving
    const rand = seededRandom(index);
    if (rand < 0.7) return 'declining';
    if (rand < 0.9) return 'stable';
    return 'improving';
  }
  if (trendBias === 'stable') {
    // 70% stable, 15% improving, 15% declining
    const rand = seededRandom(index);
    if (rand < 0.7) return 'stable';
    if (rand < 0.85) return 'improving';
    return 'declining';
  }
  // mixed: roughly equal distribution
  const rand = seededRandom(index);
  if (rand < 0.33) return 'improving';
  if (rand < 0.66) return 'stable';
  return 'declining';
}

/**
 * Get risk level and verdict from percentile
 */
function getRiskFromPercentile(percentile: number): { riskLevel: RiskLevel; verdict: string } {
  if (percentile >= 67) {
    return { riskLevel: 'low', verdict: 'Low Risk' };
  } else if (percentile >= 34) {
    return { riskLevel: 'moderate', verdict: 'Moderate Risk' };
  } else {
    return { riskLevel: 'high', verdict: 'High Risk' };
  }
}

/**
 * Get benchmark comparison text from percentile
 */
function getBenchmarkComparisonText(percentile: number): string {
  if (percentile >= 90) return `top ${100 - percentile}% of the comparison group`;
  if (percentile >= 75) return `top ${100 - percentile}% of the comparison group`;
  if (percentile >= 50) return `top ${100 - percentile}% of the comparison group`;
  return `bottom ${percentile}% of the comparison group`;
}

/**
 * Generate trend data for a dimension based on target percentile and trend
 */
function generateDimensionTrendData(
  targetPercentile: number,
  trend: 'improving' | 'stable' | 'declining'
): Array<{ period: string; value: number; benchmarkValue: number }> {
  const periods = [
    '2024-03', '2024-04', '2024-05', '2024-06', '2024-07',
    '2024-08', '2024-09', '2024-10', '2024-11'
  ];

  const trendData: Array<{ period: string; value: number; benchmarkValue: number }> = [];

  for (let i = 0; i < periods.length; i++) {
    let value: number;
    if (trend === 'improving') {
      // Start lower, end at target
      const startPercentile = Math.max(5, targetPercentile - 25);
      value = Math.round(startPercentile + (targetPercentile - startPercentile) * (i / (periods.length - 1)));
    } else if (trend === 'declining') {
      // Start higher, end at target
      const startPercentile = Math.min(95, targetPercentile + 25);
      value = Math.round(startPercentile - (startPercentile - targetPercentile) * (i / (periods.length - 1)));
    } else {
      // Stable: small variations around target
      value = Math.round(targetPercentile + (seededRandom(i * 17) * 6 - 3));
    }
    value = Math.max(1, Math.min(99, value));
    trendData.push({ period: periods[i], value, benchmarkValue: 50 });
  }

  return trendData;
}

/**
 * Transform a dimension to a new target percentile with specified trend
 */
function transformDimension(
  baseDimension: DimensionResult,
  targetPercentile: number,
  trend: 'improving' | 'stable' | 'declining'
): DimensionResult {
  const dim = deepClone(baseDimension);

  // Generate CHS components for this dimension
  const chsResult = generateMockDimensionCHS(targetPercentile, true);

  // Update overall percentile and healthScore with CHS data
  dim.overallPercentile = targetPercentile;
  dim.healthScore = chsResult.healthScore;
  dim.cssScore = chsResult.cssScore;
  dim.trsScore = chsResult.trsScore;
  dim.pgsScore = chsResult.pgsScore;
  dim.standardError = chsResult.standardError;
  dim.confidenceInterval = chsResult.confidenceInterval;
  dim.benchmarkPercentile = targetPercentile;
  dim.benchmarkComparison = getBenchmarkComparisonText(targetPercentile);

  // Update risk/maturity
  const { riskLevel, verdict } = getRiskFromPercentile(targetPercentile);
  dim.riskLevel = riskLevel;
  dim.verdict = verdict;
  dim.maturityLevel = getMaturityLevel(targetPercentile);
  dim.maturityName = getMaturityLevelName(targetPercentile);

  // Update verdict description based on level
  if (targetPercentile >= 81) {
    dim.verdictDescription = `Your team is performing excellently in ${dim.dimensionName.toLowerCase()}.`;
  } else if (targetPercentile >= 61) {
    dim.verdictDescription = `Your team is performing well in ${dim.dimensionName.toLowerCase()}.`;
  } else if (targetPercentile >= 41) {
    dim.verdictDescription = `Your team has satisfactory practices for ${dim.dimensionName.toLowerCase()}.`;
  } else if (targetPercentile >= 21) {
    dim.verdictDescription = `Your team needs attention in ${dim.dimensionName.toLowerCase()}.`;
  } else {
    dim.verdictDescription = `Your team is at risk in ${dim.dimensionName.toLowerCase()}.`;
  }

  // Update trend
  dim.trend = trend;
  dim.trendData = generateDimensionTrendData(targetPercentile, trend);

  // Update categories and indicators proportionally
  if (dim.categories) {
    const originalOverall = baseDimension.overallPercentile || 22;
    const scaleFactor = targetPercentile / originalOverall;

    for (const category of dim.categories) {
      // Update category status
      const catRisk = getRiskFromPercentile(targetPercentile);
      category.status = catRisk.riskLevel;

      // Scale indicator percentiles
      if (category.indicators) {
        for (let indIdx = 0; indIdx < category.indicators.length; indIdx++) {
          const indicator = category.indicators[indIdx];
          const originalPercentile = indicator.benchmarkPercentile || 20;
          let newPercentile = Math.round(originalPercentile * scaleFactor);
          newPercentile = Math.max(5, Math.min(95, newPercentile));
          indicator.benchmarkPercentile = newPercentile;
          indicator.benchmarkComparison = getBenchmarkComparisonText(newPercentile);

          // Vary indicator trends based on dimension trend with some variation
          // Use a unique seed based on indicator index to create variety
          const indicatorSeed = indIdx * 7 + newPercentile;
          const rand = seededRandom(indicatorSeed);
          if (trend === 'improving') {
            // 50% improving, 30% stable, 20% declining
            indicator.trend = rand < 0.5 ? 'improving' : rand < 0.8 ? 'stable' : 'declining';
          } else if (trend === 'declining') {
            // 50% declining, 30% stable, 20% improving
            indicator.trend = rand < 0.5 ? 'declining' : rand < 0.8 ? 'stable' : 'improving';
          } else {
            // Stable dimension: 40% stable, 30% improving, 30% declining
            indicator.trend = rand < 0.4 ? 'stable' : rand < 0.7 ? 'improving' : 'declining';
          }

          // Scale trend data if present
          if (indicator.trendData) {
            indicator.trendData = generateDimensionTrendData(newPercentile, indicator.trend);
          }
        }
      }
    }
  }

  return dim;
}

/**
 * Generate assessment with specified scenario configuration
 */
export function generateScenarioAssessment(
  scenario: AssessmentScenario,
  wizardState?: WizardState
): AssessmentResult {
  const baseState = wizardState || initialWizardState;
  const dateRange = getEffectiveDateRange(baseState.step1);

  // Generate transformed dimensions
  const dimensions: DimensionResult[] = [];

  for (let i = 0; i < allBaseDimensions.length; i++) {
    // Calculate this dimension's percentile with variance
    const variance = (seededRandom(i * 31) * 2 - 1) * scenario.percentileVariance;
    let dimPercentile = Math.round(scenario.targetPercentile + variance);
    dimPercentile = Math.max(5, Math.min(95, dimPercentile));

    // Get trend for this dimension
    const trend = getTrendForBias(scenario.trendBias, i);

    // Transform the dimension
    const transformedDim = transformDimension(allBaseDimensions[i], dimPercentile, trend);
    dimensions.push(transformedDim);
  }

  return {
    teamId: scenario.teamId,
    teamName: scenario.teamName,
    generatedAt: new Date().toISOString(),
    dateRange,
    dataGrouping: baseState.step1.dataGrouping,
    comparisonTeamCount: 47,
    comparisonTeams: mockComparisonTeams,
    comparisonCriteria: ['Team Size: Medium (6-15 members)', 'Tenure: Established (6-18 months)', 'Process: Scrum'],
    comparisonGroupDescription: 'Comparing against 47 teams (Team Size: Medium, Tenure: Established, Process: Scrum)',
    dimensions,
  };
}

// ============================================
// Pre-defined Scenario Configurations
// ============================================

export const SCENARIO_HIGH_PERFORMING: AssessmentScenario = {
  teamId: 'team-high',
  teamName: 'Alpha Squad',
  targetPercentile: 88,
  percentileVariance: 7,
  trendBias: 'stable',
};

export const SCENARIO_SOLID_TEAM: AssessmentScenario = {
  teamId: 'team-solid',
  teamName: 'Platform Core',
  targetPercentile: 72,
  percentileVariance: 10,
  trendBias: 'improving',
};

export const SCENARIO_AVERAGE_TEAM: AssessmentScenario = {
  teamId: 'team-average',
  teamName: 'Feature Team B',
  targetPercentile: 52,
  percentileVariance: 8,
  trendBias: 'stable',
};

export const SCENARIO_MIXED_RESULTS: AssessmentScenario = {
  teamId: 'team-mixed',
  teamName: 'Growth Squad',
  targetPercentile: 50,
  percentileVariance: 35,
  trendBias: 'mixed',
};

export const SCENARIO_IMPROVING_TEAM: AssessmentScenario = {
  teamId: 'team-improving',
  teamName: 'Phoenix Team',
  targetPercentile: 35,
  percentileVariance: 10,
  trendBias: 'improving',
};

export const SCENARIO_DECLINING_TEAM: AssessmentScenario = {
  teamId: 'team-declining',
  teamName: 'Legacy Crew',
  targetPercentile: 68,
  percentileVariance: 12,
  trendBias: 'declining',
};

// ============================================
// Named Generator Functions for Each Scenario
// ============================================

export const generateHighPerformingTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_HIGH_PERFORMING, wizardState);
};

export const generateSolidTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_SOLID_TEAM, wizardState);
};

export const generateAverageTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_AVERAGE_TEAM, wizardState);
};

export const generateMixedResultsTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_MIXED_RESULTS, wizardState);
};

export const generateImprovingTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_IMPROVING_TEAM, wizardState);
};

export const generateDecliningTeamAssessment = (wizardState?: WizardState): AssessmentResult => {
  return generateScenarioAssessment(SCENARIO_DECLINING_TEAM, wizardState);
};
