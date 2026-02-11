// Assessment Results Types
// Types for displaying dimension health assessments after wizard completion

import type {
  MaturityLevel,
  MaturityLevelName,
} from './maturity';
import type { OutcomeConfidenceSummary } from './outcomeConfidence';
import type { AssessmentLensResults } from './patterns';

// Re-export maturity types for convenience
export type { MaturityLevel, MaturityLevelName };
export type { OutcomeConfidenceSummary };

// Re-export indicator tier types for convenience
export type {
  IndicatorTier,
  IndicatorTierLevel,
  IndicatorTierName,
  TierDistribution,
  TierDistributionWithDetails,
} from './indicatorTiers';
export {
  INDICATOR_TIERS,
  getIndicatorTier,
  getIndicatorTierLevel,
  getTierDistribution,
  getTierDistributionWithDetails,
  isIndicatorAtRisk,
  getTierLabel,
  getPercentileDescription,
  getCategoryTierDistribution,
} from './indicatorTiers';

// ============================================
// Core Assessment Data Types
// ============================================

/**
 * Risk level based on indicator percentiles compared to similar teams.
 * @deprecated Use MaturityLevel (1-5) instead. This 3-level system is being
 * replaced by the unified 5-level maturity model.
 *
 * High: Bottom quartile (≤25th percentile) - indicators suggest elevated risk
 * Moderate: Middle two quartiles (26-75th percentile) - average risk indicators
 * Low: Top quartile (>75th percentile) - indicators suggest lower risk
 */
export type RiskLevel = 'low' | 'moderate' | 'high';

export type TrendDirection = 'improving' | 'stable' | 'declining';

// Aggregated counts of indicator trends for dimension-level summaries
export interface TrendAggregation {
  improving: number;
  stable: number;
  declining: number;
  total: number;
}

export interface TrendDataPoint {
  period: string;           // e.g., "2024-09", "2024-W38"
  value: number;
  healthScore?: number;     // Your health score for this period (0-100)
  benchmarkValue?: number;  // Average of similar teams
  similarTeamsMin?: number; // 25th percentile of similar teams (for range band)
  similarTeamsMax?: number; // 75th percentile of similar teams (for range band)
}

/**
 * Distribution data for showing how an indicator's value compares to similar teams.
 * Used to render the enhanced distribution spectrum with other teams' positions.
 */
export interface IndicatorDistribution {
  min: number;                    // Minimum value across all similar teams
  max: number;                    // Maximum value across all similar teams
  otherTeamValues: number[];      // Values of other teams in comparison group
}

export interface IndicatorResult {
  id: string;
  name: string;
  description: string;
  whyItMatters?: string;    // Explains why users should care about this indicator (optional)
  value: number;
  displayValue: string;     // Formatted value for display (e.g., "58%", "0.5/day")
  unit: string;             // e.g., "%", "days", "ratio", "/day"
  benchmarkValue: number;
  benchmarkDisplayValue: string;
  benchmarkComparison: string; // e.g., "bottom 10% of comparison group"
  benchmarkPercentile: number; // 0-100, lower = worse
  trend: TrendDirection;
  trendData: TrendDataPoint[];
  higherIsBetter: boolean;  // true = higher value is good (e.g., completion %), false = lower is good (e.g., variability)
  configSource?: 'standard' | 'custom'; // Source of the indicator configuration
  jiraFieldId?: string;     // Jira field ID for field health indicators
  distribution?: IndicatorDistribution; // Optional distribution data for enhanced spectrum
}

export interface IndicatorCategory {
  id: string;
  name: string;
  shortName: string;        // Short name for display in collapsed view
  description: string;
  rationale: string;        // Detailed explanation of why this category matters
  statusColor: string;      // Category header color indicator
  status: RiskLevel;        // Overall status of this category
  issuesCount: number;      // Number of indicators flagged as concerning
  indicators: IndicatorResult[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'process' | 'tooling' | 'culture' | 'governance';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface DimensionResult {
  dimensionKey: string;     // Maps to DimensionKey from presets
  dimensionNumber: number;  // 1-11
  dimensionName: string;    // e.g., "Invisible Work"
  dimensionTitle: string;   // Display title e.g., "Invisible Work"
  questionForm: string;     // e.g., "How much work isn't captured in Jira?"
  riskDescription: string;  // e.g., "work is happening outside Jira" - used in "There's X risk that..."
  spectrumLeftLabel: string;  // Label for left (good) end of spectrum, e.g., "Low invisible work"
  spectrumRightLabel: string; // Label for right (bad) end of spectrum, e.g., "High invisible work"
  verdict: string;          // Plain language answer e.g., "High Risk"
  verdictDescription: string; // Brief explanation of the verdict
  /** @deprecated Use healthScore and maturityLevel instead */
  riskLevel: RiskLevel;     // low, moderate, high based on percentile comparison
  /** @deprecated Use healthScore instead - percentile rank among peers */
  overallPercentile: number; // 0-100, composite percentile from weighted categories
  /**
   * CHS Health Score (0-100) where 50 = baseline average.
   * Calculated as: CSS (50%) + TRS (35%) + PGS (15%)
   * Thresholds: 70+ Excellent, 55-69 Good, 45-54 Average, 30-44 Below Avg, <30 Needs Attention
   */
  healthScore: number;
  /**
   * Current State Score (0-100) - z-score aggregation of indicator values.
   * This is what you'd see if we only measured current state.
   */
  cssScore?: number;
  /**
   * Trajectory Score (0-100) - comparison of early vs recent periods.
   * 50 = no change, >50 = improving, <50 = declining.
   * Null if insufficient historical data.
   */
  trsScore?: number | null;
  /**
   * Peer Growth Score (0-100) - rank of your improvement vs peers who started similarly.
   * 50 = median growth rate, >50 = faster improvement than peers.
   * Null if insufficient peer data.
   */
  pgsScore?: number | null;
  /**
   * Standard error of the health score
   */
  standardError?: number;
  /**
   * 90% confidence interval for the health score
   */
  confidenceInterval?: { lower: number; upper: number };
  /**
   * Component availability - indicates which CHS components have data.
   * CSS is always available; TRS requires 2+ periods; PGS requires 5+ peers with history.
   */
  componentsAvailable?: {
    css: boolean;
    trs: boolean;
    pgs: boolean;
  };
  benchmarkComparison: string; // e.g., "bottom 22% of the comparison group"
  benchmarkPercentile: number;
  trend: TrendDirection;
  trendData: TrendDataPoint[];
  categories: IndicatorCategory[];
  whyItMatters: string;
  whyItMattersPoints: string[];  // Bullet points for why it matters
  recommendations: Recommendation[];
  /** Unified maturity level (1-5) based on healthScore */
  maturityLevel?: MaturityLevel;
  /** Human-readable maturity name */
  maturityName?: MaturityLevelName;
}

export interface ComparisonTeam {
  id: string;
  name: string;
  rank?: number; // Rank for the current dimension (1 = best, lower risk)
}

export interface AssessmentResult {
  teamId: string;
  teamName: string;
  generatedAt: string;      // ISO date string
  dateRange: {
    startDate: string;
    endDate: string;
  };
  dataGrouping: 'monthly' | 'fortnightly' | 'weekly';
  comparisonTeamCount: number;      // Number of teams in the comparison group
  comparisonTeams: ComparisonTeam[]; // The actual teams in the comparison group
  comparisonCriteria: string[];     // Human-readable criteria list
  comparisonGroupDescription: string;
  dimensions: DimensionResult[];
  /** Four-lens data trust assessment results (coverage + 3 pattern lenses) */
  lensResults?: AssessmentLensResults;
}

// ============================================
// Historical Snapshot Types for TRS/PGS Calculation
// ============================================

/**
 * Snapshot of indicator values at a point in time.
 * Used for TRS (Trajectory Score) calculation.
 */
export interface IndicatorSnapshot {
  indicatorId: string;
  value: number;
  displayValue: string;
}

/**
 * Snapshot of a dimension's state at a point in time.
 * Stored after each assessment to enable TRS calculation.
 */
export interface DimensionSnapshot {
  dimensionKey: string;
  /** CSS score at time of snapshot (0-100) */
  cssScore: number;
  /** Individual indicator values for detailed trajectory analysis */
  indicators: IndicatorSnapshot[];
  /** Health score at time of snapshot (may be CSS-only for first assessment) */
  healthScore: number;
}

/**
 * Snapshot of an outcome's state at a point in time.
 */
export interface OutcomeSnapshot {
  outcomeId: string;
  /** CSS score at time of snapshot (0-100) */
  cssScore: number;
  /** Weighted from contributing dimensions */
  healthScore: number;
  /** Contributing dimension CSS scores */
  dimensionContributions: Array<{
    dimensionKey: string;
    cssScore: number;
    weight: number;
  }>;
}

/**
 * Complete snapshot of an assessment at a point in time.
 * This is stored after each assessment run and used for TRS/PGS calculations.
 */
export interface HistoricalSnapshot {
  /** Unique ID for this snapshot */
  id: string;
  /** Team this snapshot belongs to */
  teamId: string;
  /** ISO timestamp when snapshot was taken */
  timestamp: string;
  /** Period label (e.g., "2024-Q3", "2024-09") */
  periodLabel: string;
  /** Assessment date range this snapshot covers */
  dateRange: {
    startDate: string;
    endDate: string;
  };
  /** Dimension-level snapshots */
  dimensions: DimensionSnapshot[];
  /** Outcome-level snapshots */
  outcomes: OutcomeSnapshot[];
  /** Overall health score at time of snapshot */
  overallHealthScore: number;
  /** Overall CSS score */
  overallCssScore: number;
}

/**
 * Historical data for a specific entity (dimension, outcome, or overall).
 * Used as input for TRS/PGS calculation functions.
 */
export interface EntityHistoricalData {
  /** Array of CSS scores from past periods (oldest first) */
  cssHistory: number[];
  /** Array of health scores from past periods (oldest first) */
  healthScoreHistory: number[];
  /** Period labels corresponding to the history arrays */
  periodLabels: string[];
  /** Number of periods of history available */
  periodCount: number;
}

/**
 * Peer comparison data for PGS calculation.
 * Contains TRS values from peer teams/dimensions.
 */
export interface PeerGrowthData {
  /** Peer TRS values for ranking */
  peerTRSValues: number[];
  /** Number of peers in comparison group */
  peerCount: number;
  /** Minimum peers required for PGS calculation */
  minimumPeersRequired: number;
  /** Whether PGS can be calculated */
  hasSufficientPeers: boolean;
}

// ============================================
// Dimension 1 Specific Indicator IDs
// ============================================

export type Dimension1IndicatorId =
  // Dark Matter indicators (Category 1)
  | 'throughputVariability'
  | 'workflowStageTimeVariability'
  | 'memberThroughputVariability'
  | 'estimationVariability'
  | 'inProgressItemsVariability'
  | 'sameSizeTimeVariability'
  | 'collaborationVariability'
  // Frequent Use indicators (Category 2)
  | 'staleWorkItems'
  | 'staleEpics'
  | 'unresolvedEpicChildren'
  | 'bulkChanges'
  | 'avgDailyUpdates'
  | 'frequentUseVariability'
  | 'sprintHygiene'
  // Front Door indicators (Category 3)
  | 'siloedWorkItems'
  | 'midSprintCreations'
  | 'capacitySplitAcrossProjects';

// ============================================
// Dimension 2 Specific Indicator IDs
// ============================================

export type Dimension2IndicatorId =
  // 2.a Availability of Key Information (8 indicators)
  | 'acceptanceCriteria'       // % with acceptance criteria
  | 'linksToIssues'            // % with links to other issues
  | 'parentEpic'               // % with no parent epic
  | 'estimates'                // % with no estimates
  | 'assignee'                 // % with no assignee
  | 'dueDate'                  // % with no due date
  | 'subTasks'                 // % with sub-tasks (for large items)
  | 'prioritySet'              // % with priority other than 'Normal'
  // 2.b Insights (8 indicators)
  | 'infoAddedAfterCommitment' // % where key fields added after in-progress
  | 'midSprintMissingFields'   // % added mid-sprint without key fields
  | 'staleWorkItems'           // % of in-progress items that are stale
  | 'bulkChanges'              // % of updates done in bulk
  | 'jiraUpdateFrequency'      // Average updates per issue per day
  | 'fieldUpdateLag'           // Days between creation and key fields being filled
  | 'descriptionEditFrequency' // % of issues with description edits after creation
  | 'timeToStability';         // Days for priority to stop changing

// ============================================
// Dimension 3 Specific Indicator IDs
// ============================================

export type Dimension3IndicatorId =
  // 3.A Estimation Coverage (5 indicators)
  | 'policyExclusions'          // % of work not estimated by policy (Tasks, Bugs, etc.)
  | 'storyEstimationRate'       // % of estimable stories that have estimates
  | 'epicEstimationRate'        // % of estimable epics that have estimates
  | 'epicRollupCoverage'        // % of epics with >50% of children estimated
  | 'subTaskEstimation'         // % of sub-tasks estimated (if applicable)
  // 3.B Estimate Quality & Reliability (7 indicators)
  | 'storyConsistencyWithin'    // Within-team estimation consistency for stories
  | 'storyConsistencyAcross'    // Across-team estimation consistency for stories
  | 'epicConsistencyWithin'     // Within-team estimation consistency for epics
  | 'epicConsistencyAcross'     // Across-team estimation consistency for epics
  | 'epicDistribution'          // Is work spread across epics or concentrated?
  | 'originalEstimateCapture'   // Do we preserve original estimates when re-estimating?
  | 'reEstimationLearning'      // Do re-estimates reflect actual experience?
  // 3.C Size Consistency - Non-Estimated Work (5 indicators)
  | 'taskSizeConsistencyWithin' // Within-team variance in actual duration of tasks
  | 'taskSizeConsistencyAcross' // Across-team task duration comparison
  | 'epicDurationConsistencyWithin'  // Within-team variance in epic durations
  | 'epicDurationConsistencyAcross'  // Across-team epic duration comparison
  | 'epicConcentration';        // Distribution of non-estimated work across epics

// ============================================
// Collaboration Feature Usage Indicator IDs (Cluster 3)
// ============================================

export type CollaborationFeatureUsageIndicatorId =
  | 'issueLinkAdoptionRate'    // % of issues with at least one link
  | 'crossTeamLinkRate'        // % of links connecting to other projects
  | 'commentEngagementRate'    // % of issues with at least one comment
  | 'multiCommenterRate'       // % of commented issues with 2+ commenters
  | 'atMentionUsageRate'       // % of comments with @mentions
  | 'crossTeamAtMentionRate'   // % of @mentions referencing external team members
  | 'watcherEngagement';       // Average watchers per issue beyond assignee/reporter

// ============================================
// Collaboration Breadth Indicator IDs (Cluster 3)
// ============================================

export type CollaborationBreadthIndicatorId =
  | 'singleContributorIssueRate' // % of issues with only one contributor
  | 'epicCollaborationRate'      // % of epics with 2+ contributors
  | 'componentCollaborationScore' // Average distinct contributors per component
  | 'handoffDocumentationRate';   // % of reassignments with accompanying comment

// ============================================
// Configuration Efficiency Indicator IDs (Cluster 4)
// ============================================

export type ConfigurationEfficiencyIndicatorId =
  | 'workflowStatusCount'      // Number of statuses in workflow
  | 'unusedStatusRate'         // % of statuses rarely entered
  | 'workflowBypassRate'       // % of issues skipping expected statuses
  | 'requiredFieldLoad'        // Count of required fields
  | 'emptyOptionalFieldRate'   // % of optional fields rarely filled
  | 'duplicateTicketPatternRate' // % of tickets with similar titles
  | 'customFieldCount';        // Number of custom fields in project

// ============================================
// Backlog Discipline Indicator IDs (Cluster 5)
// ============================================

export type BacklogDisciplineIndicatorId =
  | 'backlogStalenessDistribution' // % of backlog items by age bucket
  | 'backlogDepthRatio'            // Backlog items / average sprint throughput
  | 'zombieItemCount'              // Items with no updates in 6+ months
  | 'backlogPruningRate'           // Items closed as Won't Do per quarter
  | 'sprintReadyCoverage'          // % of top-20 items with estimates + AC
  | 'refinementLag'                // Days from creation to first estimate
  | 'priorityStabilityIndex'       // Average priority changes before commitment
  | 'refinementToIntakeRatio';     // Items refined / items created per period

// ============================================
// Helper function type for generating mock data
// ============================================

export interface AssessmentConfig {
  teamId: string;
  teamName: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  dataGrouping: 'monthly' | 'fortnightly' | 'weekly';
  comparisonGroupDescription: string;
}

// ============================================
// Project Member Types (for team member display)
// ============================================

export interface ProjectRole {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface ProjectMember {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  roles: string[];
}

// ============================================
// Survey Campaign Types
// ============================================

export type SurveyCampaignStatus = 'draft' | 'active' | 'completed' | 'closed';

export interface SurveyRecipient {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  status: 'pending' | 'sent' | 'completed' | 'reminded';
  sentAt?: string;
  remindedAt?: string;
  completedAt?: string;
}

export interface InvisibleWorkCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface CalibrationSurveyResponse {
  campaignId?: string;
  recipientId?: string;
  submittedAt: string;
  invisibleWorkCategory: InvisibleWorkCategoryLevel; // 1-5 level
  confidence: ConfidenceLevel; // 1-5 confidence level
  invisibleWorkTypes: string[];
  trend: InvisibleWorkTrend;
  additionalContext?: string;
  invisibleWorkCategories?: {
    categoryId: string;
    frequencyRating: number; // 1-5 scale
    impactRating: number;    // 1-5 scale
    examples?: string;
  }[];
  overallEstimate?: number;   // Percentage of invisible work
  comments?: string;
}

export interface SurveyNotificationSettings {
  sendImmediately: boolean;
  scheduledFor?: string;
  reminderDays: number[];
}

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

// InvisibleWorkCategory can be either a numeric level (1-5) for survey responses
// or the full interface for category definitions
export type InvisibleWorkCategoryLevel = 1 | 2 | 3 | 4 | 5;

export type InvisibleWorkTrend = 'increased' | 'stable' | 'decreased';

export interface InvisibleWorkType {
  id: string;
  label: string;
  description: string;
}

export const INVISIBLE_WORK_TYPES: InvisibleWorkType[] = [
  { id: 'meetings', label: 'Meetings & Discussions', description: 'Time spent in meetings, discussions, or calls not tracked as work items' },
  { id: 'code-review', label: 'Code Reviews', description: 'Reviewing pull requests and providing feedback' },
  { id: 'support', label: 'Support & Interruptions', description: 'Helping teammates, answering questions, unplanned support' },
  { id: 'research', label: 'Research & Learning', description: 'Technical research, learning new technologies, reading documentation' },
  { id: 'planning', label: 'Planning & Estimation', description: 'Sprint planning, backlog grooming, estimation sessions' },
  { id: 'technical-debt', label: 'Technical Debt', description: 'Refactoring, cleanup, addressing tech debt not captured in tickets' },
  { id: 'ops', label: 'Operations & Maintenance', description: 'Deployments, monitoring, incident response, infrastructure work' },
  { id: 'other', label: 'Other', description: 'Any other work not captured in Jira' },
];

export interface SurveyCampaign {
  id: string;
  name: string;
  description?: string;
  status: SurveyCampaignStatus;
  projectId: string;
  projectKey: string;
  projectName: string;
  periodStart: string;
  periodEnd: string;
  selectedRoles?: string[];
  notificationSettings: SurveyNotificationSettings;
  createdAt: string;
  createdBy?: string;
  startedAt?: string;
  closedAt?: string;
  closesAt?: string;
  deadline?: string;
  remindersSent?: number;
  recipients: SurveyRecipient[];
  responses: CalibrationSurveyResponse[];
  categories?: InvisibleWorkCategory[];
}

// ============================================
// Executive Summary Types
// ============================================

/**
 * Health verdict based on 3-level system.
 * @deprecated Use MaturityLevelName instead. This 3-level system is being
 * replaced by the unified 5-level maturity model (Basic, Emerging, Established, Advanced, Exemplary).
 */
export type HealthVerdict = 'Healthy' | 'Needs Attention' | 'At Risk';

// 5-point health score scale (now mapped to MaturityLevel for consistency)
export type HealthLevel = 1 | 2 | 3 | 4 | 5;

export interface HealthScoreResult {
  compositeScore: number;      // 0-100 weighted score
  percentileComponent: number; // 0-100 (average of dimension percentiles)
  trendComponent: number;      // 0-100 (improving=100, stable=50, declining=0)
  level: HealthLevel;          // 1-5 scale
  label: string;               // e.g., "On Track", "Minor Tune-up"
  description: string;         // Brief description of level
  actionGuidance: string;      // What action to take
  color: string;               // Text/icon color
  bgColor: string;             // Background color
  /** Unified maturity level (1-5) - same as level but explicitly typed */
  maturityLevel: MaturityLevel;
  /** Human-readable maturity name */
  maturityName: MaturityLevelName;
  /** Standard error of the composite score */
  standardError?: number;
  /** 90% confidence interval for the composite score */
  confidenceInterval?: { lower: number; upper: number };
  /** CHS component scores (0-100 scale) */
  cssScore?: number;
  trsScore?: number | null;
  pgsScore?: number | null;
  /** Which CHS components were available for calculation */
  componentsAvailable?: {
    css: boolean;
    trs: boolean;
    pgs: boolean;
  };
}

export interface ExecutiveSummaryData {
  // Overall health
  overallScore: number;           // 0-100 weighted average of dimension percentiles
  overallVerdict: HealthVerdict;
  overallRiskLevel: RiskLevel;
  overallTrend: TrendDirection;
  overallTrendChange: number;     // Points change from first to last period

  // Ranking
  teamRank: number;
  totalTeams: number;

  // Risk breakdown
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
  totalDimensions: number;

  // Indicators
  totalIndicators: number;
  flaggedIndicators: number;      // Indicators below benchmark (≤25th percentile)

  // Trends
  improvingCount: number;
  decliningCount: number;
  stableCount: number;

  // Biggest movers
  biggestGain: { dimensionName: string; change: number } | null;
  biggestDecline: { dimensionName: string; change: number } | null;

  // Prioritized data
  quickWinCount: number;          // Recommendations with low effort + high impact
  topRecommendations: PrioritizedRecommendation[];
  priorityMatrix: PriorityQuadrant[];  // Legacy 4-quadrant matrix
  priorityZones: PriorityZone[];       // New 9-zone matrix
  themeSummaries: ThemeSummary[];

  // 5-point health score
  healthScore: HealthScoreResult;

  // Outcome-based confidence assessments
  outcomeConfidence?: OutcomeConfidenceSummary;
}

export interface PrioritizedRecommendation extends Recommendation {
  sourceDimension: string;
  sourceDimensionKey: string;
  priority: number;               // Calculated: impact weight - effort weight
}

// Legacy 4-quadrant type (kept for backwards compatibility)
export type PriorityQuadrantType = 'fix-now' | 'monitor' | 'watch-out' | 'celebrate';

// New 9-zone type for 3x3 priority matrix
export type PriorityZoneType =
  | 'act-now' | 'address' | 'keep-pushing'     // High risk row (0-25 percentile)
  | 'act-soon' | 'monitor' | 'good-progress'   // Moderate risk row (26-75 percentile)
  | 'heads-up' | 'maintain' | 'celebrate';     // Low risk row (76-100 percentile)

export interface PriorityQuadrant {
  quadrant: PriorityQuadrantType;
  label: string;
  description: string;
  color: string;
  dimensions: DimensionSummary[];
}

// New 9-zone interface for 3x3 priority matrix
export interface PriorityZone {
  zone: PriorityZoneType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dimensions: DimensionSummary[];
}

export interface DimensionSummary {
  dimensionKey: string;
  dimensionNumber: number;
  dimensionName: string;
  /** @deprecated Use maturityLevel instead */
  riskLevel: RiskLevel;
  trend: TrendDirection;
  percentile: number;
  trendChange: number;  // Numerical trend delta for positioning in matrix
  // Indicator breakdown
  totalIndicators: number;
  flaggedIndicators: number;    // Need attention (below 25th percentile)
  healthyIndicators: number;    // On track (above 25th percentile)
  // Trend breakdown
  improvingIndicators: number;
  decliningIndicators: number;
  stableIndicators: number;
  /** Unified maturity level (1-5) based on percentile */
  maturityLevel?: MaturityLevel;
  /** Human-readable maturity name */
  maturityName?: MaturityLevelName;
}

export interface ThemeSummary {
  themeId: string;
  themeName: string;
  themeQuestion: string;
  concernCount: number;
  isHealthy: boolean;
  dimensions: DimensionSummary[];
  overallTrend: TrendDirection;
}

// ============================================
// Indicator Drill-Down Types
// ============================================

export type DrillDownReportType =
  | 'issueList'
  | 'sprintList'
  | 'variability'
  | 'distribution'
  | 'correlation'
  | 'timeline'
  | 'ratio';

// Base interface for all drill-down reports
export interface DrillDownReportBase {
  indicatorId: string;
  indicatorName: string;
  reportType: DrillDownReportType;
  generatedAt: string;
}

// Similar team data for comparison tables
export interface SimilarTeamComparison {
  teamId: string;
  teamName: string;
  rank: number;
  value: number;
  displayValue: string;
  percentile: number;
  isYourTeam: boolean;
}

// Issue List Report - for indicators that count/measure specific issues
export interface JiraIssue {
  issueKey: string;
  summary: string;
  issueType: string;
  status: string;
  assignee: string | null;
  created: string;
  updated: string;
  daysStale?: number;
  priority?: string;
  estimatePoints?: number;
  linkedIssueCount?: number;
  hasAcceptanceCriteria?: boolean;
  hasDueDate?: boolean;
  hasParentEpic?: boolean;
  sprintName?: string;
  labels?: string[];
}

export interface IssueListReport extends DrillDownReportBase {
  reportType: 'issueList';
  description: string;
  yourIssues: JiraIssue[];
  yourMatchingCount: number;
  yourTotalIssues: number;
  yourPercentage: number;
  similarTeams: SimilarTeamComparison[];
  issueListTitle: string;  // e.g., "Stale Work Items", "Issues Without Acceptance Criteria"
}

// Sprint List Report - for indicators about sprints themselves
export interface SprintInfo {
  sprintId: string;
  sprintName: string;
  sprintGoal: string | null;
  startDate: string;
  endDate: string;
  state: 'active' | 'closed' | 'future';
  issueCount: number;
  completedCount: number;
  carriedOverCount?: number;
  totalPoints?: number;
  completedPoints?: number;
}

export interface SprintListReport extends DrillDownReportBase {
  reportType: 'sprintList';
  description: string;
  yourSprints: SprintInfo[];
  yourMatchingCount: number;
  yourTotalSprints: number;
  yourPercentage: number;
  similarTeams: SimilarTeamComparison[];
  sprintListTitle: string;  // e.g., "Sprints Without Goals"
}

// Variability Report - for indicators measuring variability/consistency over time
export interface SprintDataPoint {
  sprintName: string;
  sprintNumber: number;
  yourValue: number;
  benchmarkValue: number;
  benchmarkMin: number;
  benchmarkMax: number;
}

export interface VariabilityReport extends DrillDownReportBase {
  reportType: 'variability';
  description: string;
  yourSprintData: SprintDataPoint[];
  yourMean: number;
  yourStandardDeviation: number;
  yourCoefficientOfVariation: number;
  benchmarkMean: number;
  benchmarkStandardDeviation: number;
  benchmarkCoefficientOfVariation: number;
  similarTeams: SimilarTeamComparison[];
  metricName: string;  // e.g., "Throughput", "WIP", "Estimation"
  unit: string;
}

// Distribution Report - for indicators measuring distribution/consistency patterns
export interface DistributionBucket {
  label: string;
  rangeMin: number;
  rangeMax: number;
  yourCount: number;
  yourPercentage: number;
  benchmarkPercentage: number;
}

export interface DistributionReport extends DrillDownReportBase {
  reportType: 'distribution';
  description: string;
  buckets: DistributionBucket[];
  yourMedian: number;
  yourMean: number;
  yourMode: string;
  benchmarkMedian: number;
  benchmarkMean: number;
  similarTeams: SimilarTeamComparison[];
  distributionTitle: string;  // e.g., "Story Point Distribution", "Epic Size Distribution"
  xAxisLabel: string;
  yAxisLabel: string;
}

// Correlation Report - for indicators measuring relationships between variables
export interface CorrelationDataPoint {
  issueKey: string;
  xValue: number;
  yValue: number;
  label?: string;
}

export interface CorrelationReport extends DrillDownReportBase {
  reportType: 'correlation';
  description: string;
  dataPoints: CorrelationDataPoint[];
  yourCorrelationCoefficient: number;
  benchmarkCorrelationCoefficient: number;
  yourRSquared: number;
  trendlineSlope: number;
  trendlineIntercept: number;
  similarTeams: SimilarTeamComparison[];
  xAxisLabel: string;
  yAxisLabel: string;
  correlationTitle: string;  // e.g., "Priority vs Delivery Order"
}

// Timeline Report - for indicators measuring time-based metrics
export interface TimelineEvent {
  issueKey: string;
  summary: string;
  eventDate: string;
  durationDays: number;
  category?: string;
}

export interface TimelineReport extends DrillDownReportBase {
  reportType: 'timeline';
  description: string;
  events: TimelineEvent[];
  yourAverageDays: number;
  yourMedianDays: number;
  benchmarkAverageDays: number;
  benchmarkMedianDays: number;
  similarTeams: SimilarTeamComparison[];
  timelineTitle: string;  // e.g., "Time to Resolve Blockers"
}

// Ratio Report - for indicators measuring ratios/breakdowns
export interface RatioSegment {
  label: string;
  yourValue: number;
  yourPercentage: number;
  benchmarkPercentage: number;
  color: string;
}

export interface RatioReport extends DrillDownReportBase {
  reportType: 'ratio';
  description: string;
  segments: RatioSegment[];
  yourTotal: number;
  yourRatio: number;
  yourDisplayRatio: string;
  benchmarkRatio: number;
  benchmarkDisplayRatio: string;
  similarTeams: SimilarTeamComparison[];
  ratioTitle: string;  // e.g., "Blocker-to-Work Ratio", "Capacity Split"
}

// Union type for all drill-down reports
export type DrillDownReport =
  | IssueListReport
  | SprintListReport
  | VariabilityReport
  | DistributionReport
  | CorrelationReport
  | TimelineReport
  | RatioReport;

// Navigation state for drill-down
export interface IndicatorDrillDownState {
  indicatorId: string;
  dimensionIndex: number;
  categoryIndex: number;
  indicatorName: string;
}
