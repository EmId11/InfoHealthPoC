// Progress Score Configuration Constants
// Statistical parameters and thresholds for CPS calculation

import { CPSCategory, CPSModelType, WeightConfiguration } from '../types/progressScore';

// ============================================
// Component Weights
// ============================================

/**
 * Default component weights by model type
 */
export const DEFAULT_WEIGHTS: Record<CPSModelType, { api: number; cgp: number; tnv?: number }> = {
  '3-component': { api: 0.35, cgp: 0.40, tnv: 0.25 },
  '2-component': { api: 0.45, cgp: 0.55 },
};

/**
 * Weight configurations for sensitivity analysis - 3-component model
 */
export const SENSITIVITY_CONFIGURATIONS_3C: WeightConfiguration[] = [
  { name: 'Default', api: 0.35, cgp: 0.40, tnv: 0.25 },
  { name: 'API-Dominant', api: 0.55, cgp: 0.30, tnv: 0.15 },
  { name: 'CGP-Dominant', api: 0.25, cgp: 0.55, tnv: 0.20 },
  { name: 'Equal', api: 0.33, cgp: 0.34, tnv: 0.33 },
];

/**
 * Weight configurations for sensitivity analysis - 2-component model
 */
export const SENSITIVITY_CONFIGURATIONS_2C: WeightConfiguration[] = [
  { name: 'Default', api: 0.45, cgp: 0.55 },
  { name: 'API-Dominant', api: 0.65, cgp: 0.35 },
  { name: 'CGP-Dominant', api: 0.35, cgp: 0.65 },
  { name: 'Equal', api: 0.50, cgp: 0.50 },
];

/**
 * Get sensitivity configurations for a model type
 */
export const getSensitivityConfigurations = (modelType: CPSModelType): WeightConfiguration[] => {
  return modelType === '3-component' ? SENSITIVITY_CONFIGURATIONS_3C : SENSITIVITY_CONFIGURATIONS_2C;
};

// ============================================
// Category Thresholds
// ============================================

/**
 * CPS category definitions with thresholds and colors
 */
export interface CPSCategoryConfig {
  category: CPSCategory;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  shortLabel: string;
  description: string;
}

// Updated 2026-01-26: Adjusted thresholds based on statistical review
// Key change: Narrower "Stable" band centered on 50 (true "no change" point)
export const CPS_CATEGORIES: CPSCategoryConfig[] = [
  {
    category: 'strong-progress',
    min: 70,
    max: 100,
    color: '#006644',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
    label: 'Exceptional Progress',
    shortLabel: 'Exceptional',
    description: 'Demonstrating significant improvement across measured indicators with high confidence.',
  },
  {
    category: 'moderate-progress',
    min: 52,
    max: 69.99,
    color: '#00875A',
    bgColor: '#E3FCEF',
    borderColor: '#79F2C0',
    label: 'Moderate Progress',
    shortLabel: 'Progress',
    description: 'Showing positive movement on key indicators, trending in the right direction.',
  },
  {
    category: 'stable',
    min: 48,
    max: 51.99,
    color: '#6B778C',
    bgColor: '#F4F5F7',
    borderColor: '#DFE1E6',
    label: 'Stable',
    shortLabel: 'Stable',
    description: 'Maintaining consistent performance without significant change. CPS near 50 indicates no meaningful change.',
  },
  {
    category: 'moderate-decline',
    min: 40,
    max: 47.99,
    color: '#FF8B00',
    bgColor: '#FFF0B3',
    borderColor: '#FFE380',
    label: 'Slight Decline',
    shortLabel: 'Declining',
    description: 'Experiencing some regression on measured indicators that warrants attention.',
  },
  {
    category: 'significant-decline',
    min: 0,
    max: 39.99,
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FFBDAD',
    label: 'Significant Regression',
    shortLabel: 'Regression',
    description: 'Showing notable decline that requires immediate focus and intervention.',
  },
];

/**
 * Get category config by category type
 */
export const getCategoryConfig = (category: CPSCategory): CPSCategoryConfig => {
  return CPS_CATEGORIES.find(c => c.category === category) || CPS_CATEGORIES[2]; // Default to stable
};

/**
 * Get category config by CPS score
 */
export const getCategoryConfigByScore = (cps: number): CPSCategoryConfig => {
  for (const config of CPS_CATEGORIES) {
    if (cps >= config.min && cps <= config.max) {
      return config;
    }
  }
  return CPS_CATEGORIES[2]; // Default to stable
};

// ============================================
// Statistical Defaults
// ============================================

/**
 * Statistical parameters for CPS calculations
 */
export const STATISTICAL_DEFAULTS = {
  // Correlation adjustment
  averageCorrelation: 0.3,          // ρ̄: average inter-indicator correlation

  // Shrinkage parameters
  defaultKappa: 10,                  // κ: default shrinkage strength when unstable
  kappaStabilityThreshold: 2,        // Min V_B for stable κ estimation

  // Group size constraints
  minGroupSize: 5,                   // Minimum teams per baseline group
  minTeamsForCGP: 20,                // Minimum teams to calculate CGP

  // Data quality thresholds
  coverageThreshold: 0.70,           // Minimum indicator coverage (70%)
  missingIndicatorThreshold: 3,      // Max missing indicators before reweighting

  // Standard error adjustments
  seInflation: 1.2,                  // SE inflation factor for CPS

  // Winsorization
  winsorizePercentiles: {
    lower: 2,                        // 2nd percentile
    upper: 98,                       // 98th percentile
  },
  apiWinsorizeLimit: 4.5,            // API effect size cap

  // TNV configuration
  tnvCVThreshold: 0.10,              // CV(Δt) threshold for including TNV
  tnvScalingIQRMultiplier: 20,       // k = 20 / IQR(TNV)

  // Confidence interval
  confidenceLevel: 0.95,             // 95% CI
  zScore95: 1.96,                    // Z-score for 95% CI
};

// ============================================
// Grouping Configuration
// ============================================

/**
 * Configuration for baseline grouping by team count
 */
export interface GroupingConfig {
  method: 'deciles' | 'quintiles' | 'quartiles' | 'none';
  groupCount: number;
  minTeams: number;
  maxTeams: number;
  description: string;
}

export const GROUPING_CONFIGS: GroupingConfig[] = [
  {
    method: 'deciles',
    groupCount: 10,
    minTeams: 50,
    maxTeams: Infinity,
    description: '10 groups (deciles) for large portfolios',
  },
  {
    method: 'quintiles',
    groupCount: 5,
    minTeams: 30,
    maxTeams: 49,
    description: '5 groups (quintiles) for medium portfolios',
  },
  {
    method: 'quartiles',
    groupCount: 4,
    minTeams: 20,
    maxTeams: 29,
    description: '4 groups (quartiles) for small portfolios',
  },
  {
    method: 'none',
    groupCount: 0,
    minTeams: 0,
    maxTeams: 19,
    description: 'No CGP grouping (insufficient teams)',
  },
];

/**
 * Get grouping configuration based on team count
 */
export const getGroupingConfig = (teamCount: number): GroupingConfig => {
  for (const config of GROUPING_CONFIGS) {
    if (teamCount >= config.minTeams && teamCount <= config.maxTeams) {
      return config;
    }
  }
  return GROUPING_CONFIGS[3]; // Default to none
};

// ============================================
// Display Configuration
// ============================================

/**
 * Number formatting for CPS display
 */
export const DISPLAY_CONFIG = {
  cpsDecimalPlaces: 1,
  seDecimalPlaces: 1,
  percentDecimalPlaces: 1,
  effectSizeDecimalPlaces: 2,
  weightDecimalPlaces: 2,
};

/**
 * Score interpretation guidelines
 * Updated 2026-01-26: Adjusted thresholds based on statistical review
 */
export const SCORE_INTERPRETATION = {
  baseline: 50,                      // CPS baseline (no change)
  exceptionalThreshold: 70,          // Exceptional progress threshold
  progressThreshold: 52,             // Moderate progress threshold
  stableUpperBound: 52,              // Upper bound of stable band
  stableLowerBound: 48,              // Lower bound of stable band
  declineThreshold: 48,              // Decline threshold (below stable band)
  regressionThreshold: 40,           // Significant regression threshold
};

// ============================================
// Export All
// ============================================

export const PROGRESS_SCORE_CONFIG = {
  weights: DEFAULT_WEIGHTS,
  sensitivity: {
    '3-component': SENSITIVITY_CONFIGURATIONS_3C,
    '2-component': SENSITIVITY_CONFIGURATIONS_2C,
  },
  categories: CPS_CATEGORIES,
  statistical: STATISTICAL_DEFAULTS,
  grouping: GROUPING_CONFIGS,
  display: DISPLAY_CONFIG,
  interpretation: SCORE_INTERPRETATION,
};
