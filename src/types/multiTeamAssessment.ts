// Multi-Team Assessment Types
// Types for portfolio-level assessments, enabling leadership to assess multiple teams
// simultaneously with aggregate insights and cross-team comparisons.

import type { AssessmentResult, DimensionResult, Recommendation, TrendDirection } from './assessment';
import type { MaturityLevel, MaturityLevelName } from './maturity';
import type { ConfidenceLevel, OutcomeConfidenceSummary } from './outcomeConfidence';
import type { Step3Data, Step4Data, Step5Data, Step6Data } from './wizard';

// ============================================
// Scope Selection Types
// ============================================

/**
 * Assessment scope determines what teams are included.
 * - single-team: Traditional single team assessment
 * - team-of-teams: All teams within a Team of Teams grouping
 * - portfolio: All teams within a Portfolio
 * - custom-selection: Manually selected set of teams
 */
export type AssessmentScope = 'single-team' | 'team-of-teams' | 'portfolio' | 'custom-selection';

/**
 * Scope selection configuration for multi-team assessments.
 * Captures the user's scope choice and resolves to actual team IDs.
 */
export interface ScopeSelection {
  scopeType: AssessmentScope;
  teamOfTeamsValueId?: string;      // For ToT scope - references AttributeValue.id
  teamOfTeamsName?: string;         // Display name of selected Team of Teams
  portfolioValueId?: string;        // For portfolio scope - references AttributeValue.id
  portfolioName?: string;           // Display name of selected Portfolio
  selectedTeamIds?: string[];       // For custom scope - manually picked teams
  resolvedTeamIds: string[];        // Derived: actual team IDs to assess
  resolvedTeamCount: number;        // Count of resolved teams
}

/**
 * Default scope selection for new assessments
 */
export const initialScopeSelection: ScopeSelection = {
  scopeType: 'single-team',
  resolvedTeamIds: [],
  resolvedTeamCount: 0,
};

// ============================================
// Configuration Strategy Types
// ============================================

/**
 * How settings are applied across teams in a multi-team assessment.
 * - uniform: Same settings for all teams (fastest setup)
 * - inherit-defaults: Use admin-defined defaults with team overrides
 * - per-team: Individual configuration for each team (most flexible)
 */
export type ConfigurationStrategy = 'uniform' | 'inherit-defaults' | 'per-team';

/**
 * Team-specific settings override (for inherit-defaults or per-team strategies)
 */
export interface TeamSettingsOverride {
  teamId: string;
  teamName: string;
  step4Override?: Partial<Step4Data>;  // Sprint cadence overrides
  step5Override?: Partial<Step5Data>;  // Stale threshold overrides
}

// ============================================
// Health Score Distribution
// ============================================

/**
 * Distribution of teams across health score bands
 * Uses standard 5-label system: Needs Attention, Below Average, Average, Good, Excellent
 */
export interface HealthScoreDistribution {
  needsAttention: number;   // Level 1: <30
  belowAverage: number;     // Level 2: 30-44
  average: number;          // Level 3: 45-54
  good: number;             // Level 4: 55-69
  excellent: number;        // Level 5: 70+
}

/**
 * Distribution of teams across maturity levels
 */
export interface MaturityDistribution {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

// ============================================
// Portfolio Summary Types
// ============================================

/**
 * Aggregated portfolio-level summary
 */
export interface PortfolioSummary {
  teamCount: number;
  overallHealthScore: number;        // Weighted average of team scores
  overallMaturityLevel: MaturityLevel;
  overallMaturityName: MaturityLevelName;
  healthScoreDistribution: HealthScoreDistribution;

  // Team trend summary
  teamsImproving: number;
  teamsDeclining: number;
  teamsStable: number;

  // Dimension aggregates
  dimensionAggregates: DimensionAggregate[];

  // Recommendations prioritized for portfolio
  commonQuickWins: PortfolioRecommendation[];
  topPriorities: PortfolioRecommendation[];

  // Outcome confidence at portfolio level
  outcomeConfidence?: OutcomeConfidenceSummary;
}

/**
 * Aggregated metrics for a single dimension across all teams
 */
export interface DimensionAggregate {
  dimensionKey: string;
  dimensionNumber: number;
  dimensionName: string;
  questionForm: string;

  // Aggregated scores
  averageHealthScore: number;
  medianHealthScore: number;
  minHealthScore: number;
  maxHealthScore: number;
  standardDeviation: number;

  // Maturity distribution
  maturityDistribution: MaturityDistribution;
  aggregateMaturityLevel: MaturityLevel;
  aggregateMaturityName: MaturityLevelName;

  // Trend aggregate
  teamsImproving: number;
  teamsStable: number;
  teamsDeclining: number;
  overallTrend: TrendDirection;

  // Outlier detection
  outlierTeamIds: string[];  // Teams with healthScore > 2 std from mean
  isHighVariance: boolean;   // True if std dev > 25
}

/**
 * Portfolio-level recommendation with affected teams
 */
export interface PortfolioRecommendation extends Recommendation {
  affectedTeamCount: number;
  affectedTeamIds: string[];
  sourceDimensionKey: string;
  sourceDimensionName: string;
  aggregatedImpact: 'critical' | 'high' | 'medium' | 'low';
}

// ============================================
// Team Rollup Types
// ============================================

/**
 * Individual team result within a multi-team assessment
 */
export interface TeamRollup {
  teamId: string;
  teamName: string;
  assessmentResult: AssessmentResult;

  // Ranking within portfolio
  overallRank: number;              // 1 = best health score
  overallHealthScore: number;

  // Per-dimension ranking
  dimensionRanks: Record<string, number>;  // dimensionKey -> rank

  // Deviation analysis
  deviationFromMean: number;        // How far from portfolio average
  isOutlier: boolean;               // More than 2 std dev from mean
  outlierDirection?: 'above' | 'below';

  // Data quality
  dataCompleteness: number;         // 0-100%, based on indicator availability
  isNewTeam: boolean;               // No historical data available
}

// ============================================
// Cross-Team Analysis Types
// ============================================

/**
 * Matrix of team performance across dimensions (heat map data)
 */
export interface TeamDimensionMatrix {
  teamIds: string[];
  teamNames: string[];
  dimensionKeys: string[];
  dimensionNames: string[];

  // 2D array: [teamIndex][dimensionIndex] = healthScore
  values: number[][];

  // Maturity levels for coloring
  maturityLevels: MaturityLevel[][];
}

/**
 * Pattern detected in high-performing teams
 */
export interface PerformancePattern {
  patternId: string;
  title: string;
  description: string;

  // Which dimensions correlate with high performance
  correlatedDimensions: {
    dimensionKey: string;
    dimensionName: string;
    correlationStrength: number;  // 0-1
  }[];

  // Teams exhibiting this pattern
  exemplarTeamIds: string[];
  exemplarTeamNames: string[];
}

/**
 * Common gap identified across multiple teams
 */
export interface CommonGap {
  gapId: string;
  dimensionKey: string;
  dimensionName: string;
  title: string;
  description: string;

  // How many teams have this gap
  affectedTeamCount: number;
  affectedTeamIds: string[];
  percentageOfTeams: number;  // 0-100

  // Severity
  averageGapSeverity: number;  // Average healthScore of affected teams
  isSystemicIssue: boolean;    // > 50% of teams affected

  // Recommended action
  portfolioRecommendation: string;
}

/**
 * Dimension showing significant movement across teams
 */
export interface TrendingDimension {
  dimensionKey: string;
  dimensionName: string;
  direction: 'improving' | 'declining';

  // Movement stats
  teamsMoving: number;
  percentageOfTeams: number;
  averageMovement: number;  // Average healthScore change

  // Notable teams
  biggestMovers: {
    teamId: string;
    teamName: string;
    movement: number;
  }[];
}

/**
 * Complete cross-team analysis
 */
export interface CrossTeamAnalysis {
  comparisonMatrix: TeamDimensionMatrix;
  highPerformerPatterns: PerformancePattern[];
  commonGaps: CommonGap[];
  trendingDimensions: TrendingDimension[];

  // Summary stats
  portfolioVariance: number;        // Overall variance across teams
  mostConsistentDimension: string;  // Lowest variance
  leastConsistentDimension: string; // Highest variance
}

// ============================================
// Leadership Insights
// ============================================

/**
 * Types of leadership insights
 */
export type LeadershipInsightType = 'positive' | 'concern' | 'opportunity';

/**
 * A leadership-focused insight about the portfolio
 */
export interface LeadershipInsight {
  id: string;
  type: LeadershipInsightType;
  title: string;
  description: string;

  // Context
  affectedTeamIds: string[];
  affectedTeamNames: string[];
  relatedDimensionKey?: string;
  relatedDimensionName?: string;

  // Action
  suggestedAction: string;
  actionPriority: 'high' | 'medium' | 'low';

  // Evidence
  evidenceMetric?: string;
  evidenceValue?: number;
}

/**
 * Investment priority recommendation
 */
export interface InvestmentPriority {
  id: string;
  dimensionKey: string;
  dimensionName: string;
  title: string;
  rationale: string;

  // Impact
  teamsImpacted: number;
  estimatedImpact: 'transformative' | 'significant' | 'moderate';

  // Approach
  suggestedApproach: string;
}

/**
 * Risk summary for portfolio
 */
export interface PortfolioRiskSummary {
  criticalRiskCount: number;
  highRiskTeams: {
    teamId: string;
    teamName: string;
    primaryConcern: string;
  }[];

  systemicRisks: {
    riskId: string;
    title: string;
    description: string;
    affectedTeamCount: number;
  }[];
}

/**
 * Executive summary for portfolio
 */
export interface PortfolioExecutiveSummary {
  headline: {
    healthScore: number;
    healthTrend: TrendDirection;
    teamsAssessed: number;
    criticalGapsCount: number;
  };

  insights: LeadershipInsight[];
  investmentPriorities: InvestmentPriority[];
  riskSummary: PortfolioRiskSummary;
}

// ============================================
// Multi-Team Assessment Result
// ============================================

/**
 * Complete multi-team assessment result
 */
export interface MultiTeamAssessmentResult {
  id: string;
  name: string;
  scope: ScopeSelection;
  generatedAt: string;
  dateRange: { startDate: string; endDate: string };

  // Aggregated summary
  portfolioSummary: PortfolioSummary;

  // Individual team results
  teamResults: TeamRollup[];

  // Cross-team analysis
  crossTeamAnalysis: CrossTeamAnalysis;

  // Executive view
  executiveSummary: PortfolioExecutiveSummary;

  // Configuration used
  configurationStrategy: ConfigurationStrategy;
  sharedSettings: {
    step3: Step3Data;
    step4: Step4Data;
    step5: Step5Data;
    step6: Step6Data;
  };
  teamOverrides?: TeamSettingsOverride[];
}

// ============================================
// Multi-Team Wizard State
// ============================================

/**
 * Extended Step1 data for multi-team assessments
 */
export interface MultiTeamStep1Data {
  isMultiTeam: boolean;
  scope: ScopeSelection;
  displayName: string;           // Portfolio/ToT name or "Custom Selection"

  // Date range (shared with single-team)
  dateRangePreset: 'last3Months' | 'last6Months' | 'custom';
  customDateRange: {
    startDate: string;
    endDate: string;
  };
  dataGrouping: 'monthly' | 'fortnightly' | 'weekly';
}

/**
 * Team exclusion for Step 2 (Team Review)
 */
export interface TeamExclusion {
  teamId: string;
  teamName: string;
  reason?: string;
}

/**
 * Complete multi-team wizard state
 */
export interface MultiTeamWizardState {
  currentStep: number;

  // Step 1: Scope Selection
  step1: MultiTeamStep1Data;

  // Step 2: Team Review
  excludedTeams: TeamExclusion[];

  // Step 3: Configuration Strategy
  configurationStrategy: ConfigurationStrategy;

  // Shared settings (for uniform/inherit strategies)
  sharedSettings: {
    step3: Step3Data;  // Issue types
    step4: Step4Data;  // Sprint cadence (default)
    step5: Step5Data;  // Stale thresholds (default)
  };

  // Team overrides (for inherit/per-team strategies)
  teamOverrides: TeamSettingsOverride[];

  // Step 6: Report Options (shared)
  step6: Step6Data;
}

// ============================================
// Initial/Default Values
// ============================================

/**
 * Initial multi-team step 1 data
 */
export const initialMultiTeamStep1Data: MultiTeamStep1Data = {
  isMultiTeam: true,
  scope: initialScopeSelection,
  displayName: '',
  dateRangePreset: 'last3Months',
  customDateRange: {
    startDate: '',
    endDate: '',
  },
  dataGrouping: 'fortnightly',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Check if scope selection is complete and valid
 */
export function isScopeSelectionComplete(scope: ScopeSelection): boolean {
  switch (scope.scopeType) {
    case 'single-team':
      return scope.resolvedTeamIds.length === 1;
    case 'team-of-teams':
      return !!scope.teamOfTeamsValueId && scope.resolvedTeamIds.length > 0;
    case 'portfolio':
      return !!scope.portfolioValueId && scope.resolvedTeamIds.length > 0;
    case 'custom-selection':
      return scope.resolvedTeamIds.length >= 2;
    default:
      return false;
  }
}

/**
 * Get display name for scope type
 */
export function getScopeTypeDisplayName(scopeType: AssessmentScope): string {
  switch (scopeType) {
    case 'single-team':
      return 'Single Team';
    case 'team-of-teams':
      return 'Team of Teams';
    case 'portfolio':
      return 'Portfolio';
    case 'custom-selection':
      return 'Custom Selection';
    default:
      return 'Unknown';
  }
}

/**
 * Get configuration strategy description
 */
export function getConfigurationStrategyDescription(strategy: ConfigurationStrategy): {
  title: string;
  description: string;
  timeEstimate: string;
} {
  switch (strategy) {
    case 'uniform':
      return {
        title: 'Uniform Settings',
        description: 'Apply the same configuration to all teams. Fastest option for consistent teams.',
        timeEstimate: '~2 min',
      };
    case 'inherit-defaults':
      return {
        title: 'Inherit Defaults',
        description: 'Start with organization defaults, allow team-specific overrides where needed.',
        timeEstimate: '~3-5 min',
      };
    case 'per-team':
      return {
        title: 'Per-Team Configuration',
        description: 'Configure each team individually. Most flexible but takes longer.',
        timeEstimate: '~5-10 min',
      };
    default:
      return {
        title: 'Unknown',
        description: '',
        timeEstimate: '',
      };
  }
}

/**
 * Calculate health score distribution from team scores
 * Uses CHS thresholds: 30/45/55/70
 */
export function calculateHealthScoreDistribution(
  teamScores: number[]
): HealthScoreDistribution {
  const distribution: HealthScoreDistribution = {
    needsAttention: 0,
    belowAverage: 0,
    average: 0,
    good: 0,
    excellent: 0,
  };

  for (const score of teamScores) {
    if (score < 30) distribution.needsAttention++;
    else if (score < 45) distribution.belowAverage++;
    else if (score < 55) distribution.average++;
    else if (score < 70) distribution.good++;
    else distribution.excellent++;
  }

  return distribution;
}

/**
 * Determine if a team is an outlier based on standard deviation
 */
export function isOutlier(
  value: number,
  mean: number,
  standardDeviation: number,
  threshold: number = 2
): boolean {
  return Math.abs(value - mean) > threshold * standardDeviation;
}

/**
 * Calculate variance of an array of numbers
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function calculateStandardDeviation(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}
