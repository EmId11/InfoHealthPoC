// Composite Progress Score (CPS) Framework Types
// Based on the Progress Measurement Methodology v3.1 specification

// ============================================
// Core Primitives
// ============================================

/**
 * Indicator directionality - whether higher values are better or worse
 * +1: Higher is better (e.g., acceptance criteria coverage)
 * -1: Lower is better (e.g., carryover rate)
 */
export type IndicatorDirectionality = 1 | -1;

/**
 * CPS category based on score thresholds
 */
export type CPSCategory =
  | 'strong-progress'      // ≥ 70
  | 'moderate-progress'    // 55-69
  | 'stable'               // 45-54
  | 'moderate-decline'     // 30-44
  | 'significant-decline'; // < 30

/**
 * Model type determined by measurement interval coefficient of variation
 */
export type CPSModelType = '2-component' | '3-component';

// ============================================
// Indicator Configuration
// ============================================

/**
 * CPS indicator configuration
 * Defines how each indicator contributes to the API calculation
 */
export interface CPSIndicator {
  id: string;
  name: string;
  weight: number;  // Normalized, sums to 1 across all indicators
  directionality: IndicatorDirectionality;
  description?: string;
  baselineStdDev?: number;  // σ_i^(0) from baseline population
}

// ============================================
// Team Snapshots
// ============================================

/**
 * Team snapshot with RAW indicator values (not percentiles)
 * Captures indicator data at a point in time
 */
export interface TeamIndicatorSnapshot {
  teamId: string;
  teamName: string;
  capturedAt: string;  // ISO timestamp
  measurementIntervalMonths: number;  // Δt: time since baseline
  indicatorValues: Record<string, number>;  // indicatorId -> raw value
}

/**
 * Team progress data combining baseline and follow-up
 */
export interface TeamProgressData {
  teamId: string;
  teamName: string;
  baseline: TeamIndicatorSnapshot;
  followUp: TeamIndicatorSnapshot;
  measurementIntervalMonths: number;
}

// ============================================
// API (Absolute Progress Index) Types
// ============================================

/**
 * Contribution of a single indicator to API
 */
export interface IndicatorContribution {
  indicatorId: string;
  indicatorName: string;
  baselineValue: number;
  followUpValue: number;
  directionAdjustedBaseline: number;  // d_i × X
  directionAdjustedFollowUp: number;
  effectSize: number;  // Cohen's d for this indicator
  weightedContribution: number;  // w_i × d_i
  wasWinsorized: boolean;
}

/**
 * API calculation result for a single team
 */
export interface APIResult {
  raw: number;           // Raw effect size (weighted sum of Cohen's d)
  scaled: number;        // 50 + 10 × raw, bounded [5, 95]
  standardError: number; // SE with correlation adjustment
  wasWinsorized: boolean;  // True if API was capped at ±4.5
  indicatorContributions: IndicatorContribution[];
}

// ============================================
// CGP (Conditional Growth Percentile) Types
// ============================================

/**
 * Baseline group for CGP stratification
 */
export interface BaselineGroup {
  groupIndex: number;
  minPercentile: number;
  maxPercentile: number;
  teamIds: string[];
  size: number;
  wasMerged: boolean;
  mergeLog?: string;
  meanGrowthScore?: number;
  varianceGrowthScore?: number;
}

/**
 * CGP calculation result for a single team
 */
export interface CGPResult {
  raw: number;          // Raw percentile within group (0-100)
  shrunk: number;       // Empirical Bayes shrunk value
  scaled: number;       // Final scaled CGP score
  standardError: number;
  baselineGroup: BaselineGroup;
  shrinkageAlpha: number;  // α = κ / (κ + n_g)
  kappa: number;           // Shrinkage strength parameter
  growthScore: number;     // G_t = S_t^(1) - S_t^(0)
  rankWithinGroup: number; // 1-indexed rank
}

// ============================================
// TNV (Time-Normalized Velocity) Types
// ============================================

/**
 * TNV calculation result
 */
export interface TNVResult {
  raw: number;          // API / √(Δt)
  scaled: number;       // Scaled with IQR-based constant
  standardError: number;
  isApplicable: boolean;  // True if CV(Δt) > 0.10
  scalingConstant: number; // k = 20 / IQR(TNV)
}

// ============================================
// Missing Data Handling
// ============================================

/**
 * Result of indicator coverage check
 */
export interface MissingDataResult {
  teamId: string;
  teamName: string;
  totalWeight: number;
  missingWeight: number;
  coveragePercent: number;  // Sum of weights for available indicators
  missingIndicators: string[];
  availableIndicators: string[];
  meetsThreshold: boolean;  // Coverage ≥ 70%
  action: 'include' | 'exclude' | 'reweight';
}

// ============================================
// Sensitivity Analysis
// ============================================

/**
 * Weight configuration for sensitivity analysis
 */
export interface WeightConfiguration {
  name: string;
  api: number;
  cgp: number;
  tnv?: number;
}

/**
 * Sensitivity analysis result for a single configuration
 */
export interface SensitivityConfiguration {
  configuration: WeightConfiguration;
  cps: number;
  category: CPSCategory;
  categoryChanged: boolean;  // Different from default category
}

/**
 * Full sensitivity analysis results
 */
export interface SensitivityAnalysisResult {
  defaultConfiguration: WeightConfiguration;
  defaultCPS: number;
  defaultCategory: CPSCategory;
  configurations: SensitivityConfiguration[];
  teamsWithCategoryChange: number;
  totalTeams: number;
  isSensitive: boolean;  // > 20% teams change category
}

// ============================================
// Complete CPS Result
// ============================================

/**
 * Complete CPS result for a single team
 */
export interface CPSResult {
  teamId: string;
  teamName: string;

  // Component scores
  api: APIResult;
  cgp: CGPResult | null;  // null if n < 20
  tnv: TNVResult | null;  // null if CV(Δt) ≤ 0.10

  // Composite score
  cps: number;
  standardError: number;
  confidenceInterval: { lower: number; upper: number };
  category: CPSCategory;

  // Model info
  modelType: CPSModelType;
  componentWeights: {
    api: number;
    cgp: number;
    tnv?: number;
  };

  // Sensitivity
  sensitivityResults: SensitivityConfiguration[];
  isSensitive: boolean;

  // Data quality
  indicatorCoverage: number;  // 0-100%
  wasReweighted: boolean;
}

// ============================================
// Portfolio Summary
// ============================================

/**
 * Category distribution in portfolio
 */
export interface CategoryDistribution {
  category: CPSCategory;
  count: number;
  percentage: number;
  teamIds: string[];
}

/**
 * Complete CPS summary across all teams in portfolio
 */
export interface PortfolioCPSSummary {
  // All team results
  teams: CPSResult[];
  excludedTeams: MissingDataResult[];

  // Aggregate statistics
  averageCPS: number;
  medianCPS: number;
  stdDevCPS: number;
  minCPS: number;
  maxCPS: number;

  // Category breakdown
  categoryDistribution: CategoryDistribution[];

  // CGP grouping info
  baselineGroups: BaselineGroup[];
  groupingMethod: 'deciles' | 'quintiles' | 'quartiles' | 'none';

  // Model info
  modelType: CPSModelType;
  measurementIntervalCV: number;  // Coefficient of variation

  // Sensitivity summary
  sensitivityAnalysis: SensitivityAnalysisResult;

  // Metadata
  totalTeams: number;
  includedTeams: number;
  calculatedAt: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get CPS category from score
 * Updated 2026-01-26: Adjusted thresholds based on statistical review
 * Key change: Narrower "Stable" band [48, 52) centered on 50 (true "no change")
 */
export const getCPSCategory = (cps: number): CPSCategory => {
  if (cps >= 70) return 'strong-progress';
  if (cps >= 52) return 'moderate-progress';
  if (cps >= 48) return 'stable';
  if (cps >= 40) return 'moderate-decline';
  return 'significant-decline';
};

/**
 * Get display label for CPS category
 * Updated 2026-01-26: Adjusted labels based on statistical review
 */
export const getCPSCategoryLabel = (category: CPSCategory): string => {
  switch (category) {
    case 'strong-progress': return 'Exceptional Progress';
    case 'moderate-progress': return 'Moderate Progress';
    case 'stable': return 'Stable';
    case 'moderate-decline': return 'Slight Decline';
    case 'significant-decline': return 'Significant Regression';
  }
};

/**
 * Get color for CPS category (Atlaskit color tokens)
 */
export const getCPSCategoryColor = (category: CPSCategory): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'strong-progress':
      return { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' };
    case 'moderate-progress':
      return { bg: '#E3FCEF', text: '#00875A', border: '#79F2C0' };
    case 'stable':
      return { bg: '#F4F5F7', text: '#6B778C', border: '#DFE1E6' };
    case 'moderate-decline':
      return { bg: '#FFF0B3', text: '#FF8B00', border: '#FFE380' };
    case 'significant-decline':
      return { bg: '#FFEBE6', text: '#DE350B', border: '#FFBDAD' };
  }
};

/**
 * Get description for CPS category
 * Updated 2026-01-26: Adjusted descriptions based on statistical review
 */
export const getCPSCategoryDescription = (category: CPSCategory): string => {
  switch (category) {
    case 'strong-progress':
      return 'Demonstrating significant improvement across measured indicators with high confidence.';
    case 'moderate-progress':
      return 'Showing positive movement on key indicators, trending in the right direction.';
    case 'stable':
      return 'Maintaining consistent performance without significant change. CPS near 50 indicates no meaningful change.';
    case 'moderate-decline':
      return 'Experiencing some regression on measured indicators that warrants attention.';
    case 'significant-decline':
      return 'Showing notable decline that requires immediate focus and intervention.';
  }
};

/**
 * Format CPS score for display
 */
export const formatCPS = (cps: number, includeSign: boolean = false): string => {
  const rounded = Math.round(cps * 10) / 10;
  if (includeSign && rounded !== 50) {
    const diff = rounded - 50;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)} from baseline`;
  }
  return rounded.toFixed(1);
};

/**
 * Format confidence interval for display
 */
export const formatConfidenceInterval = (ci: { lower: number; upper: number }): string => {
  return `${ci.lower.toFixed(1)} – ${ci.upper.toFixed(1)}`;
};

/**
 * Get grouping method based on team count
 */
export const getGroupingMethod = (teamCount: number): 'deciles' | 'quintiles' | 'quartiles' | 'none' => {
  if (teamCount >= 50) return 'deciles';
  if (teamCount >= 30) return 'quintiles';
  if (teamCount >= 20) return 'quartiles';
  return 'none';
};

/**
 * Get number of groups for grouping method
 */
export const getGroupCount = (method: 'deciles' | 'quintiles' | 'quartiles' | 'none'): number => {
  switch (method) {
    case 'deciles': return 10;
    case 'quintiles': return 5;
    case 'quartiles': return 4;
    case 'none': return 0;
  }
};

/**
 * Check if CGP should be calculated based on team count
 */
export const shouldCalculateCGP = (teamCount: number): boolean => {
  return teamCount >= 20;
};

/**
 * Check if TNV should be included based on measurement interval CV
 */
export const shouldIncludeTNV = (measurementIntervalCV: number): boolean => {
  return measurementIntervalCV > 0.10;
};

/**
 * Create an empty CPS result for a team
 */
export const createEmptyCPSResult = (teamId: string, teamName: string): CPSResult => ({
  teamId,
  teamName,
  api: {
    raw: 0,
    scaled: 50,
    standardError: 0,
    wasWinsorized: false,
    indicatorContributions: [],
  },
  cgp: null,
  tnv: null,
  cps: 50,
  standardError: 0,
  confidenceInterval: { lower: 50, upper: 50 },
  category: 'stable',
  modelType: '2-component',
  componentWeights: { api: 0.45, cgp: 0.55 },
  sensitivityResults: [],
  isSensitive: false,
  indicatorCoverage: 0,
  wasReweighted: false,
});

// ============================================
// CHS (Composite Health Score) Types
// ============================================

/**
 * CHS category based on score thresholds
 */
export type CHSCategory =
  | 'excellent-health'    // ≥ 70
  | 'good-health'         // 55-69
  | 'average-health'      // 45-54
  | 'below-average'       // 30-44
  | 'needs-attention';    // < 30

/**
 * CHS weight configuration preset
 */
export type CHSWeightPreset =
  | 'balanced'        // 0.50, 0.35, 0.15 (default)
  | 'snapshot-focus'  // 0.65, 0.25, 0.10
  | 'growth-focus'    // 0.40, 0.45, 0.15
  | 'peer-comparison'; // 0.45, 0.30, 0.25

/**
 * CHS weight configuration
 */
export interface CHSWeights {
  css: number;  // Current State Score weight (0.30-0.70)
  trs: number;  // Trajectory Score weight (0.15-0.50)
  pgs: number;  // Peer Growth Score weight (0-0.30)
}

/**
 * Baseline norms for CSS calculation
 */
export interface BaselineNorms {
  indicatorId: string;
  mean: number;       // μ_baseline
  stdDev: number;     // σ_baseline
  calibratedAt: string;
}

/**
 * CSS (Current State Score) result
 */
export interface CSSResult {
  raw: number;           // Raw weighted z-score
  scaled: number;        // Scaled to 0-100
  standardError: number;
  indicatorZScores: Array<{
    indicatorId: string;
    indicatorName: string;
    rawValue: number;
    directionAdjusted: number;
    zScore: number;
    weightedContribution: number;
  }>;
}

/**
 * TRS (Trajectory Score) result
 */
export interface TRSResult {
  raw: number;           // Raw effect size
  scaled: number;        // Scaled to 0-100 (50 = stable)
  standardError: number;
  wasWinsorized: boolean;
  indicatorTrajectories: Array<{
    indicatorId: string;
    indicatorName: string;
    earlyMean: number;
    recentMean: number;
    effectSize: number;
    weightedContribution: number;
  }>;
}

/**
 * PGS (Peer Growth Score) result
 */
export interface PGSResult {
  raw: number;           // Raw percentile within group
  shrunk: number;        // Empirical Bayes shrunk value
  standardError: number;
  baselineGroup: BaselineGroup;
  shrinkageAlpha: number;
  kappa: number;
  rankWithinGroup: number;
}

/**
 * Complete CHS result for a single team
 */
export interface CHSResult {
  teamId: string;
  teamName: string;

  // Component scores
  css: CSSResult;
  trs: TRSResult;
  pgs: PGSResult | null;  // null if n < 20

  // Composite score
  chs: number;
  standardError: number;
  confidenceInterval: { lower: number; upper: number };
  category: CHSCategory;

  // Weights used
  weights: CHSWeights;
  weightPreset: CHSWeightPreset;

  // Data quality
  indicatorCoverage: number;
  wasReweighted: boolean;
  isProvisional: boolean;  // < 8 weeks of data

  // Metadata
  assessmentPeriodMonths: number;
  calculatedAt: string;
}

/**
 * Portfolio CHS summary
 */
export interface PortfolioCHSSummary {
  teams: CHSResult[];
  excludedTeams: MissingDataResult[];

  // Aggregate statistics
  averageCHS: number;
  medianCHS: number;
  stdDevCHS: number;

  // Category distribution
  categoryDistribution: Array<{
    category: CHSCategory;
    count: number;
    percentage: number;
    teamIds: string[];
  }>;

  // Grouping info for PGS
  baselineGroups: BaselineGroup[];
  groupingMethod: 'deciles' | 'quintiles' | 'quartiles' | 'none';

  // Configuration
  weights: CHSWeights;
  weightPreset: CHSWeightPreset;
  baselineNorms: BaselineNorms[];

  // Metadata
  totalTeams: number;
  includedTeams: number;
  calculatedAt: string;
}

// ============================================
// CHS Helper Functions
// ============================================

/**
 * Get CHS category from score
 */
export const getCHSCategory = (chs: number): CHSCategory => {
  if (chs >= 70) return 'excellent-health';
  if (chs >= 55) return 'good-health';
  if (chs >= 45) return 'average-health';
  if (chs >= 30) return 'below-average';
  return 'needs-attention';
};

/**
 * Get display label for CHS category
 */
export const getCHSCategoryLabel = (category: CHSCategory): string => {
  switch (category) {
    case 'excellent-health': return 'Excellent';
    case 'good-health': return 'Good';
    case 'average-health': return 'Average';
    case 'below-average': return 'Below Average';
    case 'needs-attention': return 'Needs Attention';
  }
};

/**
 * Get color for CHS category
 */
export const getCHSCategoryColor = (category: CHSCategory): { bg: string; text: string; border: string } => {
  switch (category) {
    case 'excellent-health':
      return { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' };
    case 'good-health':
      return { bg: '#E3FCEF', text: '#00875A', border: '#79F2C0' };
    case 'average-health':
      return { bg: '#F4F5F7', text: '#6B778C', border: '#DFE1E6' };
    case 'below-average':
      return { bg: '#FFF0B3', text: '#FF8B00', border: '#FFE380' };
    case 'needs-attention':
      return { bg: '#FFEBE6', text: '#DE350B', border: '#FFBDAD' };
  }
};

/**
 * Get CHS weights for a preset
 */
export const getCHSWeightsForPreset = (preset: CHSWeightPreset): CHSWeights => {
  switch (preset) {
    case 'balanced':
      return { css: 0.50, trs: 0.35, pgs: 0.15 };
    case 'snapshot-focus':
      return { css: 0.65, trs: 0.25, pgs: 0.10 };
    case 'growth-focus':
      return { css: 0.40, trs: 0.45, pgs: 0.15 };
    case 'peer-comparison':
      return { css: 0.45, trs: 0.30, pgs: 0.25 };
  }
};

/**
 * Get preset label for display
 */
export const getCHSPresetLabel = (preset: CHSWeightPreset): string => {
  switch (preset) {
    case 'balanced': return 'Balanced (Recommended)';
    case 'snapshot-focus': return 'Snapshot Focus';
    case 'growth-focus': return 'Growth Focus';
    case 'peer-comparison': return 'Peer Comparison';
  }
};

/**
 * Get preset description
 */
export const getCHSPresetDescription = (preset: CHSWeightPreset): string => {
  switch (preset) {
    case 'balanced':
      return 'Equal emphasis on current practices and improvement trajectory';
    case 'snapshot-focus':
      return 'Emphasize where teams are today over where they\'re heading';
    case 'growth-focus':
      return 'Emphasize improvement trajectory over current position';
    case 'peer-comparison':
      return 'Stronger emphasis on how teams compare to similar peers';
  }
};

/**
 * Create an empty portfolio CPS summary
 */
export const createEmptyPortfolioCPSSummary = (): PortfolioCPSSummary => ({
  teams: [],
  excludedTeams: [],
  averageCPS: 50,
  medianCPS: 50,
  stdDevCPS: 0,
  minCPS: 50,
  maxCPS: 50,
  categoryDistribution: [
    { category: 'strong-progress', count: 0, percentage: 0, teamIds: [] },
    { category: 'moderate-progress', count: 0, percentage: 0, teamIds: [] },
    { category: 'stable', count: 0, percentage: 0, teamIds: [] },
    { category: 'moderate-decline', count: 0, percentage: 0, teamIds: [] },
    { category: 'significant-decline', count: 0, percentage: 0, teamIds: [] },
  ],
  baselineGroups: [],
  groupingMethod: 'none',
  modelType: '2-component',
  measurementIntervalCV: 0,
  sensitivityAnalysis: {
    defaultConfiguration: { name: 'Default', api: 0.45, cgp: 0.55 },
    defaultCPS: 50,
    defaultCategory: 'stable',
    configurations: [],
    teamsWithCategoryChange: 0,
    totalTeams: 0,
    isSensitive: false,
  },
  totalTeams: 0,
  includedTeams: 0,
  calculatedAt: new Date().toISOString(),
});
