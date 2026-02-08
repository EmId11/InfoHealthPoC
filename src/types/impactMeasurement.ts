// Impact Measurement Types
// Types for measuring actual change in outcomes from improvement plays

import { PortfolioCPSSummary, PortfolioCHSSummary, CHSResult } from './progressScore';

// ============================================
// Impact Timeline Classes
// ============================================

/**
 * Impact timeline classification - how long after play completion
 * before we can measure meaningful impact
 */
export type ImpactTimelineClass =
  | 'immediate'      // 1-2 weeks (quick-wins, tooling config)
  | 'short-term'     // 2-4 weeks (process changes, behavior)
  | 'medium-term'    // 1-3 months (process + some culture)
  | 'long-term'      // 3-6 months (culture changes)
  | 'very-long-term'; // 6+ months (deep culture shifts)

/**
 * Configuration for impact timeline measurement windows
 */
export interface ImpactTimelineConfig {
  class: ImpactTimelineClass;
  minDaysAfterCompletion: number;
  maxDaysAfterCompletion: number;
  optimalAssessmentDays: number;
  displayLabel: string;
  rationale: string;
}

// ============================================
// Score Snapshots
// ============================================

/**
 * Snapshot of scores at a point in time
 * Captures dimension, outcome, and indicator values for before/after comparison
 */
export interface ScoreSnapshot {
  capturedAt: string; // ISO timestamp
  dimensionScores: Record<string, number>; // dimensionKey -> healthScore (0-100)
  outcomeScores: Record<string, number>;   // outcomeId -> score (0-100)
  indicatorValues: Record<string, number>; // indicatorId -> raw value
}

// ============================================
// Effect Size & Statistical Analysis
// ============================================

/**
 * Effect size magnitude based on Cohen's d
 */
export type EffectSizeMagnitude = 'negligible' | 'small' | 'medium' | 'large';

/**
 * Statistical analysis of a single indicator change
 */
export interface IndicatorChange {
  indicatorId: string;
  indicatorName: string;
  baselineValue: number;
  currentValue: number;
  changeValue: number;
  changePercent: number;
  isSignificant: boolean;
  effectSize: EffectSizeMagnitude;
}

/**
 * Dimension-level change analysis
 */
export interface DimensionChange {
  dimensionKey: string;
  dimensionName: string;
  baselineHealthScore: number;
  currentHealthScore: number;
  healthScoreChange: number;
}

/**
 * Outcome-level change analysis
 */
export interface OutcomeChange {
  outcomeId: string;
  outcomeName: string;
  baselineScore: number;
  currentScore: number;
  scoreChange: number;
}

/**
 * Confidence level for impact analysis
 */
export type ConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';

/**
 * Factors that contribute to confidence score
 */
export interface ConfidenceFactors {
  dataCompleteness: number; // 0-100: how complete is the data
  sampleSize: number;       // 0-100: based on number of data points
  effectMagnitude: number;  // 0-100: larger effects are more confident
  attributionClarity: number; // 0-100: how clearly can we attribute to this play
}

/**
 * Confidence assessment for an analysis
 */
export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number; // 0-100 aggregate confidence
  factors: ConfidenceFactors;
}

/**
 * Verdict on impact
 */
export interface ImpactVerdict {
  hasPositiveImpact: boolean;
  summary: string;
  explanation: string;
}

// ============================================
// Play Impact Analysis
// ============================================

/**
 * Complete analysis result for a single play's impact
 */
export interface ImpactAnalysisResult {
  // Per-indicator changes
  indicatorChanges: IndicatorChange[];

  // Dimension-level changes
  dimensionChange: DimensionChange;

  // Outcome-level changes
  outcomeChanges: OutcomeChange[];

  // Statistical confidence
  confidence: ConfidenceAssessment;

  // Verdict
  verdict: ImpactVerdict;
}

/**
 * Impact measurement tracking for a single play
 */
export interface PlayImpactMeasurement {
  playId: string;      // References Action.id
  planPlayId: string;  // References PlanPlay.id

  // Snapshots captured at different points
  baselineSnapshot?: ScoreSnapshot;   // Captured when play started
  completionSnapshot?: ScoreSnapshot; // Captured when play completed
  assessmentSnapshot?: ScoreSnapshot; // Captured after impact window

  // Timeline configuration
  impactTimelineClass: ImpactTimelineClass;
  assessmentWindowOpensAt?: string;  // ISO timestamp
  assessmentWindowClosesAt?: string; // ISO timestamp

  // Analysis results (populated after assessment window)
  analysis?: ImpactAnalysisResult;
}

// ============================================
// Impact Exclusions
// ============================================

/**
 * Reasons why a play might be excluded from impact calculation
 */
export type ExclusionReason =
  | 'awaiting_window'           // Impact window hasn't opened yet
  | 'insufficient_time'         // Not enough time since completion
  | 'insufficient_data'         // Not enough data points
  | 'high_baseline_volatility'  // Baseline too unstable
  | 'concurrent_plays_overlap'  // Too many plays affecting same metrics
  | 'external_factors'          // External events confounding results
  | 'play_not_completed';       // Play wasn't fully completed

/**
 * Details about why a play is excluded from impact calculation
 */
export interface ImpactExclusion {
  playId: string;
  planPlayId: string;
  reasons: ExclusionReason[];
  primaryReason: ExclusionReason;
  explanation: string;
  isTemporary: boolean;        // Will this exclusion eventually resolve?
  reevaluateAt?: string;       // ISO timestamp for when to check again
}

// ============================================
// Plan-Level Impact Summary
// ============================================

/**
 * Impact direction indicator
 */
export type ImpactDirection = 'positive' | 'neutral' | 'negative';

/**
 * Impact summary for a single outcome within a plan
 */
export interface OutcomeImpact {
  outcomeId: string;
  outcomeName: string;
  baselineScore: number;
  currentScore: number;
  changePoints: number;
  contributingPlays: string[]; // playIds that contributed to this change
}

/**
 * Play that is awaiting its assessment window
 */
export interface AwaitingAssessmentPlay {
  playId: string;
  planPlayId: string;
  playTitle: string;
  eligibleAt: string;      // ISO timestamp when assessment window opens
  daysRemaining: number;
  impactTimelineClass: ImpactTimelineClass;
}

/**
 * Complete impact summary for an improvement plan
 */
export interface PlanImpactSummary {
  planId: string;

  // Overall impact
  overallImpactScore: number; // Net change across targeted outcomes (-100 to +100)
  impactDirection: ImpactDirection;

  // Confidence
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;

  // Breakdown by outcome
  outcomeImpacts: OutcomeImpact[];

  // Play categorization
  playsWithImpact: PlayImpactMeasurement[];
  playsAwaitingAssessment: AwaitingAssessmentPlay[];
  excludedPlays: ImpactExclusion[];

  // Metadata
  lastCalculatedAt: string;
  measurementPeriod: {
    start: string;
    end: string;
  };
}

// ============================================
// Portfolio-Level Impact Summary
// ============================================

/**
 * Impact aggregated by outcome across the portfolio
 */
export interface PortfolioOutcomeImpact {
  outcomeId: string;
  outcomeName: string;
  baselineScore: number;
  currentScore: number;
  totalImpact: number;
  plansContributing: number;
}

/**
 * Top performing plan in the portfolio
 */
export interface TopPerformingPlan {
  planId: string;
  planName: string;
  teamName: string;
  impactScore: number;
  confidenceLevel: ConfidenceLevel;
}

/**
 * High impact play across the portfolio
 */
export interface HighImpactPlay {
  playId: string;
  playTitle: string;
  avgImpact: number;
  teamsUsing: number;
  confidenceLevel: ConfidenceLevel;
}

/**
 * Impact by dimension (parallel to Impact by Outcome)
 */
export interface DimensionImpact {
  dimensionKey: string;
  dimensionName: string;
  baselineHealthScore: number;
  currentHealthScore: number;
  healthScoreChange: number;
  baselineRank: number;        // e.g., 31 (meaning 31st of 48 teams)
  currentRank: number;         // e.g., 19 (meaning 19th of 48 teams)
  totalTeams: number;          // e.g., 48
  contributingPlays: string[];
}

/**
 * Individual team's position data for animation
 */
export interface TeamPosition {
  teamId: string;
  teamName: string;
  beforeHealthScore: number;
  afterHealthScore: number;
  change: number;
}

/**
 * Other teams' progress for health score context
 */
export interface TeamProgressContext {
  yourChange: number;                    // e.g., +12.4
  similarTeamsChanges: number[];         // Array of all similar teams' changes
  healthScoreRankOfYourChange: number;   // Your improvement ranked (e.g., 82 = top 18%)
  averageChange: number;
  medianChange: number;
  improvedTeamsCount: number;
  declinedTeamsCount: number;
  totalTeams: number;
  // NEW: Individual team positions for animation
  teamPositions: TeamPosition[];
}

/**
 * Flow node for tree visualization
 * Flow: INDICATORS → DIMENSIONS → OUTCOMES (no plays - this is about data lineage)
 */
export interface ImpactFlowNode {
  id: string;
  type: 'indicator' | 'dimension' | 'outcome';
  name: string;
  impactValue: number;
  impactUnit?: string;   // '%' for indicators, 'pts' for dimensions/outcomes
  beforeValue?: number;  // For dimensions: before score
  afterValue?: number;   // For dimensions: after score
  parentIds: string[];   // upstream nodes
  childIds: string[];    // downstream nodes
}

/**
 * Impact flow link for visualization
 */
export interface ImpactFlowLink {
  source: string;
  target: string;
  value: number;
  weight?: number;  // Actual weight/contribution (e.g., 0.25 = 25% contribution)
}

/**
 * Complete impact flow structure
 */
export interface ImpactFlow {
  nodes: ImpactFlowNode[];
  links: ImpactFlowLink[];
}

/**
 * Breakdown of confidence score factors
 */
export interface ConfidenceBreakdown {
  dataCoverage: number;        // 0-100: how complete is the data capture
  sampleSize: number;          // 0-100: based on number of data points
  effectMagnitude: number;     // 0-100: larger effects are more confident
  attributionClarity: number;  // 0-100: how clearly can we attribute changes
}

/**
 * Complete impact summary across all improvement plans (portfolio level)
 */
export interface PortfolioImpactSummary {
  // Aggregate metrics
  totalNetImpact: number;
  activePlansCount: number;
  plansWithPositiveImpact: number;
  plansWithMeasuredImpact: number;
  avgConfidenceScore: number;
  confidenceBreakdown?: ConfidenceBreakdown; // NEW: Detailed breakdown of confidence factors

  // Impact by outcome
  impactByOutcome: PortfolioOutcomeImpact[];

  // Leaderboards
  topPerformingPlans: TopPerformingPlan[];
  topImpactPlays: HighImpactPlay[];

  // NEW: Before/after context
  baselineAverageHealthScore: number;
  currentAverageHealthScore: number;
  baselineAverageRank: number;
  currentAverageRank: number;
  totalTeamsInComparison: number;

  // NEW: Date context for before/after
  baselineDate: string;           // ISO timestamp - when baseline was captured (before first plan started)
  measurementDate: string;        // ISO timestamp - "After" date (user-selectable, defaults to now)

  // NEW: Impact by dimension
  impactByDimension: DimensionImpact[];

  // NEW: Health score context
  teamProgressContext: TeamProgressContext;

  // NEW: Impact flow data
  impactFlow: ImpactFlow;

  // NEW: Composite Progress Score results
  cpsResults?: PortfolioCPSSummary;

  // NEW: Composite Health Score results (for before/after)
  chsResults?: {
    before: PortfolioCHSSummary;
    after: PortfolioCHSSummary;
    yourTeamBefore: CHSResult;
    yourTeamAfter: CHSResult;
  };

  // Metadata
  generatedAt: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get display label for impact timeline class
 */
export const getImpactTimelineLabel = (timelineClass: ImpactTimelineClass): string => {
  switch (timelineClass) {
    case 'immediate': return 'Immediate (1-2 weeks)';
    case 'short-term': return 'Short-term (2-4 weeks)';
    case 'medium-term': return 'Medium-term (1-3 months)';
    case 'long-term': return 'Long-term (3-6 months)';
    case 'very-long-term': return 'Very long-term (6+ months)';
  }
};

/**
 * Get color for impact timeline badge
 */
export const getImpactTimelineColor = (timelineClass: ImpactTimelineClass): { bg: string; text: string } => {
  switch (timelineClass) {
    case 'immediate':
      return { bg: '#E3FCEF', text: '#006644' }; // Green
    case 'short-term':
      return { bg: '#DEEBFF', text: '#0052CC' }; // Blue
    case 'medium-term':
      return { bg: '#EAE6FF', text: '#5243AA' }; // Purple
    case 'long-term':
      return { bg: '#FFF0B3', text: '#B65C02' }; // Orange
    case 'very-long-term':
      return { bg: '#FFEBE6', text: '#DE350B' }; // Red
  }
};

/**
 * Get display label for confidence level
 */
export const getConfidenceLevelLabel = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'low': return 'Low Confidence';
    case 'moderate': return 'Moderate Confidence';
    case 'high': return 'High Confidence';
    case 'very-high': return 'Very High Confidence';
  }
};

/**
 * Get color for confidence level
 */
export const getConfidenceLevelColor = (level: ConfidenceLevel): { bg: string; text: string } => {
  switch (level) {
    case 'low':
      return { bg: '#FFEBE6', text: '#DE350B' };
    case 'moderate':
      return { bg: '#FFF0B3', text: '#B65C02' };
    case 'high':
      return { bg: '#DEEBFF', text: '#0052CC' };
    case 'very-high':
      return { bg: '#E3FCEF', text: '#006644' };
  }
};

/**
 * Get display label for effect size magnitude
 */
export const getEffectSizeLabel = (magnitude: EffectSizeMagnitude): string => {
  switch (magnitude) {
    case 'negligible': return 'Negligible';
    case 'small': return 'Small Effect';
    case 'medium': return 'Medium Effect';
    case 'large': return 'Large Effect';
  }
};

/**
 * Get display label for exclusion reason
 */
export const getExclusionReasonLabel = (reason: ExclusionReason): string => {
  switch (reason) {
    case 'awaiting_window': return 'Awaiting Assessment Window';
    case 'insufficient_time': return 'Insufficient Time';
    case 'insufficient_data': return 'Insufficient Data';
    case 'high_baseline_volatility': return 'Unstable Baseline';
    case 'concurrent_plays_overlap': return 'Overlapping Plays';
    case 'external_factors': return 'External Factors';
    case 'play_not_completed': return 'Play Not Completed';
  }
};

/**
 * Get description for exclusion reason
 */
export const getExclusionReasonDescription = (reason: ExclusionReason): string => {
  switch (reason) {
    case 'awaiting_window':
      return 'The impact assessment window has not yet opened. Impact will be measured after sufficient time has passed.';
    case 'insufficient_time':
      return 'Not enough time has passed since play completion to measure meaningful impact.';
    case 'insufficient_data':
      return 'There are not enough data points to perform a statistically meaningful analysis.';
    case 'high_baseline_volatility':
      return 'The baseline metrics were too volatile to establish a reliable comparison point.';
    case 'concurrent_plays_overlap':
      return 'Multiple plays are affecting the same metrics, making it difficult to attribute changes to specific plays.';
    case 'external_factors':
      return 'External events or factors are confounding the results, making impact measurement unreliable.';
    case 'play_not_completed':
      return 'The play was not fully completed, so impact cannot be measured.';
  }
};

/**
 * Get color for impact direction
 */
export const getImpactDirectionColor = (direction: ImpactDirection): { bg: string; text: string } => {
  switch (direction) {
    case 'positive':
      return { bg: '#E3FCEF', text: '#006644' };
    case 'neutral':
      return { bg: '#F4F5F7', text: '#6B778C' };
    case 'negative':
      return { bg: '#FFEBE6', text: '#DE350B' };
  }
};

/**
 * Format impact score for display
 */
export const formatImpactScore = (score: number): string => {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(1)}`;
};

/**
 * Create an empty score snapshot
 */
export const createEmptySnapshot = (): ScoreSnapshot => ({
  capturedAt: new Date().toISOString(),
  dimensionScores: {},
  outcomeScores: {},
  indicatorValues: {},
});

/**
 * Create an empty plan impact summary
 */
export const createEmptyPlanImpactSummary = (planId: string): PlanImpactSummary => ({
  planId,
  overallImpactScore: 0,
  impactDirection: 'neutral',
  confidenceLevel: 'low',
  confidenceScore: 0,
  outcomeImpacts: [],
  playsWithImpact: [],
  playsAwaitingAssessment: [],
  excludedPlays: [],
  lastCalculatedAt: new Date().toISOString(),
  measurementPeriod: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
  },
});

/**
 * Create an empty portfolio impact summary
 */
export const createEmptyPortfolioImpactSummary = (): PortfolioImpactSummary => ({
  totalNetImpact: 0,
  activePlansCount: 0,
  plansWithPositiveImpact: 0,
  plansWithMeasuredImpact: 0,
  avgConfidenceScore: 0,
  confidenceBreakdown: {
    dataCoverage: 0,
    sampleSize: 0,
    effectMagnitude: 0,
    attributionClarity: 0,
  },
  impactByOutcome: [],
  topPerformingPlans: [],
  topImpactPlays: [],
  // Before/after context
  baselineAverageHealthScore: 0,
  currentAverageHealthScore: 0,
  baselineAverageRank: 0,
  currentAverageRank: 0,
  totalTeamsInComparison: 0,
  baselineDate: new Date().toISOString(),
  measurementDate: new Date().toISOString(),
  // Impact by dimension
  impactByDimension: [],
  // Health score context
  teamProgressContext: {
    yourChange: 0,
    similarTeamsChanges: [],
    healthScoreRankOfYourChange: 0,
    averageChange: 0,
    medianChange: 0,
    improvedTeamsCount: 0,
    declinedTeamsCount: 0,
    totalTeams: 0,
    teamPositions: [],
  },
  // Impact flow
  impactFlow: {
    nodes: [],
    links: [],
  },
  generatedAt: new Date().toISOString(),
});
