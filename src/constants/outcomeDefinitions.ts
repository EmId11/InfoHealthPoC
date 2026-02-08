// Outcome Area Definitions
// Defines the 7 outcome areas and their dimension mappings

import { OutcomeAreaDefinition } from '../types/outcomeConfidence';

/**
 * Commitments (merged Planning + Forecasting)
 * Question: "Can we use our Jira data to make reliable commitments about what will be delivered when?"
 */
const commitmentsOutcome: OutcomeAreaDefinition = {
  id: 'commitments',
  name: 'Delivery Commitments',
  shortName: 'Commitments',
  question: 'Can we use our Jira data to make reliable commitments about what will be delivered when?',
  description:
    'Measures whether your Jira data supports reliable sprint planning, capacity forecasting, and delivery commitments.',
  spectrumEndpoints: {
    min: {
      label: 'Guesswork',
      description: 'Estimates are missing or wildly inconsistent. Velocity history is unreliable. The data simply cannot support confident delivery predictions.',
    },
    max: {
      label: 'Predictable',
      description: 'Estimates are consistent and comprehensive. Velocity trends are stable. The data provides a solid foundation for making delivery commitments.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'estimationCoverage',
      weight: 0.25,
      whyItMatters:
        'Without estimates, you cannot calculate capacity or predict sprint fit. Unestimated work makes commitments guesswork.',
      criticalThreshold: 30,
    },
    {
      dimensionKey: 'sizingConsistency',
      weight: 0.2,
      whyItMatters:
        'Inconsistent estimates make velocity unstable sprint-to-sprint. Consistent sizing produces predictable throughput.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'workCaptured',
      weight: 0.15,
      whyItMatters:
        'Hidden work means commitments underestimate remaining effort. Invisible work skews all predictions.',
    },
    {
      dimensionKey: 'informationHealth',
      weight: 0.15,
      whyItMatters:
        'Missing details force mid-sprint discovery, disrupting plans. Complete tickets enable accurate commitment.',
    },
    {
      dimensionKey: 'dataFreshness',
      weight: 0.1,
      whyItMatters:
        'Stale data skews velocity calculations. Commitments depend on up-to-date status information.',
    },
    {
      dimensionKey: 'sprintHygiene',
      weight: 0.1,
      whyItMatters:
        'High carryover shows planning commitments are not being met. Clean sprints validate planning accuracy.',
    },
    {
      dimensionKey: 'backlogDiscipline',
      weight: 0.05,
      whyItMatters:
        'A stale or unrefined backlog turns sprint planning into grooming. Ready items enable confident commitments.',
    },
  ],
};

/**
 * Progress Tracking
 * Question: "Can we use our Jira data to track progress towards achieving a goal?"
 */
const progressOutcome: OutcomeAreaDefinition = {
  id: 'progress',
  name: 'Progress Tracking',
  shortName: 'Progress',
  question: 'Can we use our Jira data to track progress towards achieving a goal?',
  description:
    'Measures whether Jira reflects actual work state accurately enough for status reporting and burndowns.',
  spectrumEndpoints: {
    min: {
      label: 'Opaque',
      description: 'Statuses are stale. Significant work isn\'t captured. Burndowns and dashboards show an incomplete picture that can\'t be trusted.',
    },
    max: {
      label: 'Transparent',
      description: 'Statuses are current. All work is tracked. Dashboards accurately reflect reality, making progress visible at a glance.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'dataFreshness',
      weight: 0.3,
      whyItMatters:
        'Stale status makes burndown show wrong state. Fresh data is the foundation of accurate tracking.',
      criticalThreshold: 30,
    },
    {
      dimensionKey: 'workCaptured',
      weight: 0.25,
      whyItMatters:
        'Progress only shows what is in Jira; hidden work skews remaining estimates and completion rates.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'sprintHygiene',
      weight: 0.2,
      whyItMatters:
        'Last-day completion spikes mean progress was uncertain all sprint. Healthy patterns show steady flow.',
    },
    {
      dimensionKey: 'workHierarchy',
      weight: 0.15,
      whyItMatters:
        'Without linkage, epic and initiative progress cannot roll up. Hierarchy enables portfolio tracking.',
    },
    {
      dimensionKey: 'configurationEfficiency',
      weight: 0.1,
      whyItMatters:
        'Too many statuses make progress unclear—is "In Review" different from "In Testing"?',
    },
  ],
};

/**
 * Productivity Measurement
 * Question: "Can we use our Jira data to measure our productivity?"
 */
const productivityOutcome: OutcomeAreaDefinition = {
  id: 'productivity',
  name: 'Productivity Measurement',
  shortName: 'Productivity',
  question: 'Can we use our Jira data to measure our productivity?',
  description:
    'Measures whether your Jira data supports accurate individual and team productivity measurement, including velocity, throughput, and effort tracking.',
  spectrumEndpoints: {
    min: {
      label: 'Unmeasurable',
      description: 'Estimates are sparse or inconsistent. Much work lives outside Jira. The data doesn\'t support meaningful productivity measurement.',
    },
    max: {
      label: 'Data-driven',
      description: 'Estimates are calibrated and consistent. All work is captured. The data enables objective, reliable productivity metrics.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'workCaptured',
      weight: 0.25,
      whyItMatters:
        'If significant work happens outside Jira, productivity metrics only capture part of the picture. Invisible work makes throughput look lower than reality.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'estimationCoverage',
      weight: 0.2,
      whyItMatters:
        'Without estimates, productivity becomes ticket counting rather than effort measurement. Velocity requires story points to be meaningful.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'sizingConsistency',
      weight: 0.2,
      whyItMatters:
        'Inconsistent estimates make productivity comparisons unfair. A "5-point story" should represent similar effort across team members.',
      criticalThreshold: 20,
    },
    {
      dimensionKey: 'dataFreshness',
      weight: 0.15,
      whyItMatters:
        'Stale data means productivity dashboards show outdated information. Real-time status updates enable accurate throughput tracking.',
    },
    {
      dimensionKey: 'teamCollaboration',
      weight: 0.1,
      whyItMatters:
        'Single-contributor issues enable clear individual attribution. Highly collaborative work complicates individual productivity metrics.',
    },
    {
      dimensionKey: 'sprintHygiene',
      weight: 0.1,
      whyItMatters:
        'Velocity metrics require clean sprint boundaries. Carryover and scope changes make sprint-over-sprint comparisons unreliable.',
    },
  ],
};

/**
 * Continuous Improvement
 * Question: "Can we use our Jira data to determine how we might improve our processes?"
 */
const improvementOutcome: OutcomeAreaDefinition = {
  id: 'improvement',
  name: 'Continuous Improvement',
  shortName: 'Improvement',
  question: 'Can we use our Jira data to determine how we might improve our processes?',
  description:
    'Measures whether your Jira data provides the insights needed to identify process bottlenecks, inefficiencies, and improvement opportunities.',
  spectrumEndpoints: {
    min: {
      label: 'No insights',
      description: 'Sprint data is messy. Cycle times are unreliable. The data can\'t reveal bottlenecks or validate whether process changes helped.',
    },
    max: {
      label: 'Clear patterns',
      description: 'Sprint boundaries are clean. Workflow data is consistent. The data reveals trends and patterns that inform process improvements.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'sprintHygiene',
      weight: 0.25,
      whyItMatters:
        'Velocity trends and carryover patterns reveal process health over time. Clean sprint data enables meaningful retrospectives.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'dataFreshness',
      weight: 0.2,
      whyItMatters:
        'Stale data masks real bottlenecks. Current state information is essential for identifying where processes break down.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'estimationCoverage',
      weight: 0.15,
      whyItMatters:
        'Without estimates, you cannot analyze estimation accuracy or identify sizing problems. Velocity trends require points.',
    },
    {
      dimensionKey: 'sizingConsistency',
      weight: 0.15,
      whyItMatters:
        'Inconsistent estimates obscure true cycle time patterns. Calibration issues indicate team alignment needs.',
    },
    {
      dimensionKey: 'automationOpportunities',
      weight: 0.15,
      whyItMatters:
        'Identifying manual repetitive work reveals process improvement opportunities. Automation potential signals efficiency gains.',
    },
    {
      dimensionKey: 'teamCollaboration',
      weight: 0.1,
      whyItMatters:
        'In-Jira discussions create a record for retrospectives. Silent issues never get addressed in process reviews.',
    },
  ],
};

/**
 * Collaboration Effectiveness
 * Question: "Are we using Jira to collaborate effectively?"
 */
const collaborationOutcome: OutcomeAreaDefinition = {
  id: 'collaboration',
  name: 'Collaboration Effectiveness',
  shortName: 'Collaboration',
  question: 'Are we using Jira to collaborate effectively?',
  description:
    'Measures whether your team uses Jira as an effective collaboration hub rather than just a task dump.',
  spectrumEndpoints: {
    min: {
      label: 'Siloed',
      description: 'Issues lack comments and links. Discussions happen elsewhere. The data shows isolated tickets, not connected collaboration.',
    },
    max: {
      label: 'Connected',
      description: 'Issues are linked and commented. @mentions and watchers are used. The data reflects a team actively coordinating in Jira.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'teamCollaboration',
      weight: 0.3,
      whyItMatters:
        'Low comments and single-contributor issues indicate task dump, not collaboration hub.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'collaborationFeatureUsage',
      weight: 0.25,
      whyItMatters:
        'Underused linking, @mentions, and watchers mean team is not coordinating in Jira.',
    },
    {
      dimensionKey: 'blockerManagement',
      weight: 0.2,
      whyItMatters:
        'Active blocker flagging shows team responsiveness. Silent blockers indicate coordination gaps.',
    },
    {
      dimensionKey: 'automationOpportunities',
      weight: 0.15,
      whyItMatters:
        'Manual repetitive work wastes capacity for higher-value activities. Automation frees time for collaboration.',
    },
    {
      dimensionKey: 'configurationEfficiency',
      weight: 0.1,
      whyItMatters:
        'Bloated configuration creates friction that discourages engagement. Lean setup promotes usage.',
    },
  ],
};

/**
 * Portfolio Planning
 * Question: "Is our Jira data reliable enough to be used in portfolio-level planning or decision-making?"
 */
const portfolioOutcome: OutcomeAreaDefinition = {
  id: 'portfolio',
  name: 'Portfolio Planning',
  shortName: 'Portfolio',
  question: 'Is our Jira data reliable enough to be used in portfolio-level planning or decision-making?',
  description:
    'Measures whether your Jira data supports strategic portfolio decisions, cross-team coordination, and executive reporting.',
  spectrumEndpoints: {
    min: {
      label: 'Fragmented',
      description: 'Stories aren\'t linked to epics. Hierarchy is incomplete. The data can\'t roll up to provide portfolio-level visibility.',
    },
    max: {
      label: 'Unified view',
      description: 'Work is properly hierarchied. Stories link to epics link to initiatives. The data supports accurate portfolio-level reporting.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'workHierarchy',
      weight: 0.3,
      whyItMatters:
        'Without epic and initiative linkage, work cannot roll up to portfolio level. Hierarchy is essential for strategic visibility.',
      criticalThreshold: 30,
    },
    {
      dimensionKey: 'estimationCoverage',
      weight: 0.2,
      whyItMatters:
        'Portfolio capacity planning requires estimates across teams. Missing points make resource allocation guesswork.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'workCaptured',
      weight: 0.15,
      whyItMatters:
        'Portfolio views only show tracked work. Hidden work creates blind spots in strategic planning.',
    },
    {
      dimensionKey: 'informationHealth',
      weight: 0.15,
      whyItMatters:
        'Epics and initiatives need clear descriptions for stakeholder understanding. Sparse details undermine executive confidence.',
    },
    {
      dimensionKey: 'issueTypeConsistency',
      weight: 0.1,
      whyItMatters:
        'Inconsistent categorization makes cross-team comparisons unreliable. Clean types enable accurate aggregation.',
    },
    {
      dimensionKey: 'dataFreshness',
      weight: 0.1,
      whyItMatters:
        'Strategic decisions require current state. Stale portfolio data leads to misallocated resources.',
    },
  ],
};

/**
 * Risk Detection (Early Warning)
 * Question: "Can we use our Jira data to identify risks and blockers early?"
 */
const awarenessOutcome: OutcomeAreaDefinition = {
  id: 'awareness',
  name: 'Risk Detection',
  shortName: 'Risk Detection',
  question: 'Can we use our Jira data to identify risks and blockers early?',
  description:
    'Measures whether Jira helps surface risks, blockers, and dependencies before they become emergencies.',
  spectrumEndpoints: {
    min: {
      label: 'Blind spots',
      description: 'Blockers aren\'t flagged. Dependencies aren\'t linked. The data hides risks until they become emergencies.',
    },
    max: {
      label: 'Early warning',
      description: 'Blockers are flagged promptly. Dependencies are visible. The data surfaces risks early while there\'s time to act.',
    },
  },
  dimensions: [
    {
      dimensionKey: 'blockerManagement',
      weight: 0.3,
      whyItMatters:
        'If blockers are not flagged, you learn about delays at deadline. Active flagging enables early intervention.',
      criticalThreshold: 30,
    },
    {
      dimensionKey: 'dataFreshness',
      weight: 0.25,
      whyItMatters:
        'Stale items hide true state—you cannot flag what you do not know. Fresh data surfaces emerging risks.',
      criticalThreshold: 25,
    },
    {
      dimensionKey: 'teamCollaboration',
      weight: 0.2,
      whyItMatters:
        'Risks discussed outside Jira never reach stakeholders. In-Jira collaboration creates visibility.',
    },
    {
      dimensionKey: 'collaborationFeatureUsage',
      weight: 0.15,
      whyItMatters:
        'Links surface dependencies, @mentions route attention. Underused features mean missed early warnings.',
    },
    {
      dimensionKey: 'workHierarchy',
      weight: 0.1,
      whyItMatters:
        'Without hierarchy, you cannot see how a blocked story impacts epics and releases.',
    },
  ],
};

/**
 * All outcome definitions in display order
 */
export const OUTCOME_DEFINITIONS: OutcomeAreaDefinition[] = [
  commitmentsOutcome,
  progressOutcome,
  productivityOutcome,
  improvementOutcome,
  collaborationOutcome,
  portfolioOutcome,
  awarenessOutcome,
];

/**
 * Get an outcome definition by ID
 */
export const getOutcomeDefinition = (id: string): OutcomeAreaDefinition | undefined => {
  return OUTCOME_DEFINITIONS.find(o => o.id === id);
};

/**
 * Get all dimension keys that contribute to any outcome
 */
export const getAllOutcomeDimensionKeys = (): Set<string> => {
  const keys = new Set<string>();
  for (const outcome of OUTCOME_DEFINITIONS) {
    for (const dim of outcome.dimensions) {
      keys.add(dim.dimensionKey);
    }
  }
  return keys;
};

/**
 * Get all outcomes that a dimension contributes to
 * Returns outcomes sorted by the dimension's weight (highest first)
 */
export const getOutcomesForDimension = (dimensionKey: string): Array<{
  outcome: OutcomeAreaDefinition;
  weight: number;
  whyItMatters: string;
}> => {
  const results: Array<{
    outcome: OutcomeAreaDefinition;
    weight: number;
    whyItMatters: string;
  }> = [];

  for (const outcome of OUTCOME_DEFINITIONS) {
    const contribution = outcome.dimensions.find(d => d.dimensionKey === dimensionKey);
    if (contribution) {
      results.push({
        outcome,
        weight: contribution.weight,
        whyItMatters: contribution.whyItMatters,
      });
    }
  }

  // Sort by weight descending
  return results.sort((a, b) => b.weight - a.weight);
};
