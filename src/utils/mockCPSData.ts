// Mock CPS Data Generator
// Creates realistic team indicator data for testing the CPS framework

import {
  CPSIndicator,
  TeamIndicatorSnapshot,
  TeamProgressData,
} from '../types/progressScore';

// ============================================
// Indicator Definitions
// ============================================

/**
 * CPS Indicators with weights and directionality
 * Weights sum to 1.0
 */
export const CPS_INDICATORS: CPSIndicator[] = [
  {
    id: 'acceptanceCriteria',
    name: 'AC Coverage',
    weight: 0.10,
    directionality: 1,
    description: 'Percentage of stories with acceptance criteria defined',
  },
  {
    id: 'firstTimePassRate',
    name: 'First Pass Rate',
    weight: 0.08,
    directionality: 1,
    description: 'Percentage of work passing review on first attempt',
  },
  {
    id: 'storyEstimationRate',
    name: 'Story Estimation',
    weight: 0.10,
    directionality: 1,
    description: 'Percentage of stories with point estimates',
  },
  {
    id: 'workCarriedOver',
    name: 'Carryover Rate',
    weight: 0.12,
    directionality: -1,
    description: 'Percentage of work carried over between sprints',
  },
  {
    id: 'midSprintCreations',
    name: 'Scope Change',
    weight: 0.08,
    directionality: -1,
    description: 'Percentage of work added mid-sprint',
  },
  {
    id: 'staleWorkItems',
    name: 'Stale Items',
    weight: 0.07,
    directionality: -1,
    description: 'Percentage of items without updates in 14+ days',
  },
  {
    id: 'avgCommentsPerIssue',
    name: 'Comment Rate',
    weight: 0.08,
    directionality: 1,
    description: 'Average comments per issue (engagement proxy)',
  },
  {
    id: 'singleContributorIssueRate',
    name: 'Solo Work %',
    weight: 0.07,
    directionality: -1,
    description: 'Percentage of issues with only one contributor',
  },
  {
    id: 'throughputVariability',
    name: 'Throughput Var',
    weight: 0.08,
    directionality: -1,
    description: 'Coefficient of variation in sprint throughput',
  },
  {
    id: 'siloedWorkItems',
    name: 'Siloed Work',
    weight: 0.07,
    directionality: -1,
    description: 'Percentage of work not linked to team epics',
  },
  {
    id: 'jiraUpdateFrequency',
    name: 'Update Freq',
    weight: 0.05,
    directionality: 1,
    description: 'Average status updates per day per active issue',
  },
  {
    id: 'lastDayCompletions',
    name: 'Last Day %',
    weight: 0.05,
    directionality: -1,
    description: 'Percentage of work completed on last day of sprint',
  },
  {
    id: 'policyExclusions',
    name: 'Policy Exclusions',
    weight: 0.05,
    directionality: -1,
    description: 'Percentage of items excluded by data quality policies',
  },
];

// ============================================
// Team Names
// ============================================

/**
 * Realistic team names for mock data generation
 */
export const MOCK_TEAM_NAMES: string[] = [
  'Platform Core',
  'Mobile Squad',
  'API Gateway',
  'DevOps',
  'Frontend',
  'Data Engineering',
  'Security',
  'Integrations',
  'Growth Team',
  'Infrastructure',
  'QA Automation',
  'Design Systems',
  'Backend Services',
  'Cloud Ops',
  'Analytics',
  'Release Engineering',
  'Product Core',
  'Payments',
  'Auth Team',
  'Search',
  'ML Platform',
  'Data Pipeline',
  'Mobile Core',
  'Web Platform',
  'Customer Success',
  'Developer Tools',
  'SRE',
  'Observability',
  'Edge Services',
  'Content Team',
  'Notifications',
  'Messaging',
  'Commerce',
  'Billing',
  'Admin Tools',
  'Partner API',
  'Discovery',
  'Recommendations',
  'Feed Team',
  'Social',
  'Media Services',
  'Storage',
  'CDN Team',
  'Gateway',
  'Identity',
  'Compliance',
  'Audit',
  'Risk Management',
  'Performance',
  'Platform Health',
];

// ============================================
// Seeded Random Number Generator
// ============================================

/**
 * Create a seeded random number generator for reproducible results
 */
function createSeededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Generate a random number with normal distribution using Box-Muller transform
 */
function normalRandom(random: () => number, mean: number = 0, stdDev: number = 1): number {
  const u1 = random();
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// ============================================
// Indicator Value Distributions
// ============================================

/**
 * Get realistic baseline distribution parameters for each indicator
 * Returns { mean, stdDev } for normal distribution
 */
function getIndicatorDistribution(indicatorId: string): { mean: number; stdDev: number; min: number; max: number } {
  const distributions: Record<string, { mean: number; stdDev: number; min: number; max: number }> = {
    acceptanceCriteria: { mean: 65, stdDev: 18, min: 10, max: 98 },
    firstTimePassRate: { mean: 72, stdDev: 15, min: 30, max: 95 },
    storyEstimationRate: { mean: 70, stdDev: 20, min: 15, max: 98 },
    workCarriedOver: { mean: 22, stdDev: 12, min: 0, max: 60 },
    midSprintCreations: { mean: 18, stdDev: 10, min: 0, max: 50 },
    staleWorkItems: { mean: 15, stdDev: 10, min: 0, max: 50 },
    avgCommentsPerIssue: { mean: 3.5, stdDev: 1.8, min: 0.5, max: 12 },
    singleContributorIssueRate: { mean: 45, stdDev: 18, min: 10, max: 90 },
    throughputVariability: { mean: 0.35, stdDev: 0.15, min: 0.05, max: 0.80 },
    siloedWorkItems: { mean: 25, stdDev: 15, min: 0, max: 70 },
    jiraUpdateFrequency: { mean: 1.2, stdDev: 0.5, min: 0.2, max: 3.0 },
    lastDayCompletions: { mean: 28, stdDev: 12, min: 5, max: 70 },
    policyExclusions: { mean: 8, stdDev: 6, min: 0, max: 35 },
  };

  return distributions[indicatorId] || { mean: 50, stdDev: 15, min: 0, max: 100 };
}

// ============================================
// Baseline Data Generation
// ============================================

/**
 * Generate baseline indicator data for all teams
 */
export function generateBaselineData(
  teamCount: number = 47,
  seed: number = 12345
): Map<string, TeamIndicatorSnapshot> {
  const random = createSeededRandom(seed);
  const baseline = new Map<string, TeamIndicatorSnapshot>();
  const now = new Date();

  // Baseline captured 3-4 months ago
  const baselineDate = new Date(now);
  baselineDate.setMonth(baselineDate.getMonth() - 3);

  for (let i = 0; i < teamCount; i++) {
    const teamId = `team-${i + 1}`;
    const teamName = MOCK_TEAM_NAMES[i % MOCK_TEAM_NAMES.length];

    const indicatorValues: Record<string, number> = {};

    // Generate correlated indicator values
    // Teams have an underlying "health" factor that influences all indicators
    const teamHealthFactor = normalRandom(random, 0, 1);

    for (const indicator of CPS_INDICATORS) {
      const dist = getIndicatorDistribution(indicator.id);

      // Base value from distribution
      let value = normalRandom(random, dist.mean, dist.stdDev);

      // Apply team health factor (ρ ≈ 0.3 correlation)
      const correlationStrength = 0.3;
      const healthAdjustment = teamHealthFactor * dist.stdDev * correlationStrength;

      // For negative directionality, flip the health effect
      value += indicator.directionality * healthAdjustment;

      // Clamp to valid range
      value = Math.max(dist.min, Math.min(dist.max, value));

      // Round appropriately
      if (indicator.id === 'avgCommentsPerIssue' || indicator.id === 'jiraUpdateFrequency') {
        value = Math.round(value * 100) / 100;
      } else if (indicator.id === 'throughputVariability') {
        value = Math.round(value * 1000) / 1000;
      } else {
        value = Math.round(value * 10) / 10;
      }

      indicatorValues[indicator.id] = value;
    }

    baseline.set(teamId, {
      teamId,
      teamName,
      capturedAt: baselineDate.toISOString(),
      measurementIntervalMonths: 0,
      indicatorValues,
    });
  }

  return baseline;
}

// ============================================
// Follow-up Data Generation
// ============================================

/**
 * Improvement pattern for a team
 */
type ImprovementPattern =
  | 'strong-improver'      // Effect size 0.5-1.0 (20%)
  | 'moderate-improver'    // Effect size 0.2-0.5 (30%)
  | 'stable'               // Effect size -0.2 to 0.2 (30%)
  | 'slight-decline'       // Effect size -0.2 to -0.5 (15%)
  | 'significant-decline'; // Effect size -0.5 to -0.8 (5%)

/**
 * Assign improvement patterns to teams based on distribution
 */
function assignImprovementPattern(random: () => number): ImprovementPattern {
  const roll = random();
  if (roll < 0.20) return 'strong-improver';
  if (roll < 0.50) return 'moderate-improver';
  if (roll < 0.80) return 'stable';
  if (roll < 0.95) return 'slight-decline';
  return 'significant-decline';
}

/**
 * Get effect size range for an improvement pattern
 */
function getEffectSizeRange(pattern: ImprovementPattern): { min: number; max: number } {
  switch (pattern) {
    case 'strong-improver': return { min: 0.5, max: 1.0 };
    case 'moderate-improver': return { min: 0.2, max: 0.5 };
    case 'stable': return { min: -0.2, max: 0.2 };
    case 'slight-decline': return { min: -0.5, max: -0.2 };
    case 'significant-decline': return { min: -0.8, max: -0.5 };
  }
}

/**
 * Generate follow-up data with realistic improvement patterns
 */
export function generateFollowUpData(
  baseline: Map<string, TeamIndicatorSnapshot>,
  seed: number = 54321
): Map<string, TeamIndicatorSnapshot> {
  const random = createSeededRandom(seed);
  const followUp = new Map<string, TeamIndicatorSnapshot>();
  const now = new Date();

  baseline.forEach((baselineSnapshot, teamId) => {
    const pattern = assignImprovementPattern(random);
    const effectRange = getEffectSizeRange(pattern);

    // Target effect size for this team
    const targetEffectSize = effectRange.min + random() * (effectRange.max - effectRange.min);

    const indicatorValues: Record<string, number> = {};

    for (const indicator of CPS_INDICATORS) {
      const baselineValue = baselineSnapshot.indicatorValues[indicator.id];
      const dist = getIndicatorDistribution(indicator.id);

      // Calculate change based on effect size and indicator's std dev
      // Effect size = change / std_dev, so change = effect_size * std_dev
      let change = targetEffectSize * dist.stdDev;

      // Add some noise (individual indicator variance)
      const noise = normalRandom(random, 0, dist.stdDev * 0.3);
      change += noise;

      // Apply directionality: positive effect means improvement
      // For directionality=1 (higher is better): positive change
      // For directionality=-1 (lower is better): negative change
      let newValue = baselineValue + (indicator.directionality * change);

      // Clamp to valid range
      newValue = Math.max(dist.min, Math.min(dist.max, newValue));

      // Round appropriately
      if (indicator.id === 'avgCommentsPerIssue' || indicator.id === 'jiraUpdateFrequency') {
        newValue = Math.round(newValue * 100) / 100;
      } else if (indicator.id === 'throughputVariability') {
        newValue = Math.round(newValue * 1000) / 1000;
      } else {
        newValue = Math.round(newValue * 10) / 10;
      }

      indicatorValues[indicator.id] = newValue;
    }

    followUp.set(teamId, {
      teamId,
      teamName: baselineSnapshot.teamName,
      capturedAt: now.toISOString(),
      measurementIntervalMonths: 3, // Default 3 months
      indicatorValues,
    });
  });

  return followUp;
}

// ============================================
// Measurement Intervals
// ============================================

/**
 * Generate measurement intervals for teams
 *
 * @param teamCount Number of teams
 * @param mode 'uniform' for ~3 months (CV ≤ 0.10), 'varied' for 2-6 months (CV > 0.10)
 * @param seed Random seed
 */
export function generateMeasurementIntervals(
  teamCount: number,
  mode: 'uniform' | 'varied' = 'varied',
  seed: number = 67890
): number[] {
  const random = createSeededRandom(seed);
  const intervals: number[] = [];

  for (let i = 0; i < teamCount; i++) {
    if (mode === 'uniform') {
      // Uniform: 2.8-3.2 months (CV ≈ 0.05)
      intervals.push(2.8 + random() * 0.4);
    } else {
      // Varied: 2-6 months (CV ≈ 0.30)
      intervals.push(2 + random() * 4);
    }
  }

  return intervals.map(i => Math.round(i * 10) / 10);
}

/**
 * Calculate coefficient of variation for measurement intervals
 */
export function calculateIntervalCV(intervals: number[]): number {
  if (intervals.length === 0) return 0;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (mean === 0) return 0;

  const variance = intervals.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  return stdDev / mean;
}

// ============================================
// Missing Data Generation
// ============================================

/**
 * Introduce missing data for some teams
 * Returns set of (teamId, indicatorId) pairs that should be marked as missing
 */
export function generateMissingData(
  teamCount: number,
  missingRate: number = 0.12,
  seed: number = 11111
): Set<string> {
  const random = createSeededRandom(seed);
  const missingSet = new Set<string>();

  // ~10-15% of teams have some missing data
  const teamsWithMissing = Math.floor(teamCount * missingRate);

  // Pick random teams to have missing data
  const teamIndices = new Set<number>();
  while (teamIndices.size < teamsWithMissing) {
    teamIndices.add(Math.floor(random() * teamCount));
  }

  // For each affected team, remove 1-4 indicators
  teamIndices.forEach(teamIdx => {
    const teamId = `team-${teamIdx + 1}`;
    const indicatorsToRemove = 1 + Math.floor(random() * 4);

    const removedIndicators = new Set<number>();
    while (removedIndicators.size < indicatorsToRemove) {
      removedIndicators.add(Math.floor(random() * CPS_INDICATORS.length));
    }

    removedIndicators.forEach(indicatorIdx => {
      const key = `${teamId}:${CPS_INDICATORS[indicatorIdx].id}`;
      missingSet.add(key);
    });
  });

  return missingSet;
}

/**
 * Apply missing data to snapshots
 */
export function applyMissingData(
  snapshots: Map<string, TeamIndicatorSnapshot>,
  missingSet: Set<string>
): Map<string, TeamIndicatorSnapshot> {
  const result = new Map<string, TeamIndicatorSnapshot>();

  snapshots.forEach((snapshot, teamId) => {
    const filteredValues: Record<string, number> = {};

    for (const [indicatorId, value] of Object.entries(snapshot.indicatorValues)) {
      const key = `${teamId}:${indicatorId}`;
      if (!missingSet.has(key)) {
        filteredValues[indicatorId] = value;
      }
    }

    result.set(teamId, {
      ...snapshot,
      indicatorValues: filteredValues,
    });
  });

  return result;
}

// ============================================
// Combined Team Progress Data
// ============================================

/**
 * Combine baseline and follow-up into TeamProgressData
 */
export function combineProgressData(
  baseline: Map<string, TeamIndicatorSnapshot>,
  followUp: Map<string, TeamIndicatorSnapshot>,
  intervals: number[]
): TeamProgressData[] {
  const progressData: TeamProgressData[] = [];
  let i = 0;

  baseline.forEach((baselineSnapshot, teamId) => {
    const followUpSnapshot = followUp.get(teamId);
    if (!followUpSnapshot) return;

    const interval = intervals[i] || 3;
    i++;

    // Update follow-up with correct interval
    followUpSnapshot.measurementIntervalMonths = interval;

    progressData.push({
      teamId,
      teamName: baselineSnapshot.teamName,
      baseline: baselineSnapshot,
      followUp: followUpSnapshot,
      measurementIntervalMonths: interval,
    });
  });

  return progressData;
}

// ============================================
// Master Generator
// ============================================

export interface MockCPSPortfolio {
  baseline: Map<string, TeamIndicatorSnapshot>;
  followUp: Map<string, TeamIndicatorSnapshot>;
  intervals: number[];
  indicators: CPSIndicator[];
  progressData: TeamProgressData[];
  missingDataSet: Set<string>;
  intervalCV: number;
}

/**
 * Generate complete mock CPS portfolio data
 *
 * @param teamCount Number of teams (default 47 for quintile grouping)
 * @param intervalMode 'uniform' or 'varied' measurement intervals
 * @param includeMissingData Whether to include missing data simulation
 * @param seed Base random seed for reproducibility
 */
export function generateMockCPSPortfolio(
  teamCount: number = 47,
  intervalMode: 'uniform' | 'varied' = 'varied',
  includeMissingData: boolean = true,
  seed: number = 42
): MockCPSPortfolio {
  // Generate baseline data
  const baseline = generateBaselineData(teamCount, seed);

  // Generate follow-up data with improvement patterns
  let followUp = generateFollowUpData(baseline, seed + 1000);

  // Generate measurement intervals
  const intervals = generateMeasurementIntervals(teamCount, intervalMode, seed + 2000);
  const intervalCV = calculateIntervalCV(intervals);

  // Optionally introduce missing data
  let missingDataSet = new Set<string>();
  if (includeMissingData) {
    missingDataSet = generateMissingData(teamCount, 0.12, seed + 3000);
    followUp = applyMissingData(followUp, missingDataSet);
  }

  // Combine into progress data
  const progressData = combineProgressData(baseline, followUp, intervals);

  return {
    baseline,
    followUp,
    intervals,
    indicators: CPS_INDICATORS,
    progressData,
    missingDataSet,
    intervalCV,
  };
}

// ============================================
// Pre-generated Dataset
// ============================================

/**
 * Get a pre-generated standard dataset for consistent demo
 * Uses fixed seed for reproducibility
 */
let cachedPortfolio: MockCPSPortfolio | null = null;

export function getStandardMockPortfolio(): MockCPSPortfolio {
  if (!cachedPortfolio) {
    cachedPortfolio = generateMockCPSPortfolio(47, 'varied', true, 42);
  }
  return cachedPortfolio;
}

/**
 * Clear cached portfolio (useful for testing)
 */
export function clearCachedPortfolio(): void {
  cachedPortfolio = null;
}
