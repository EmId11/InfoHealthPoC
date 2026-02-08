// Health Score Calculation Utility
// Calculates overall Jira health score from indicator percentiles and trends

import {
  DimensionResult,
  TrendDirection,
  HealthLevel,
  HealthScoreResult,
  MaturityLevel,
  MaturityLevelName,
} from '../types/assessment';
import {
  MATURITY_LEVELS,
  getMaturityLevelConfig,
} from '../types/maturity';

// ============================================
// Constants
// ============================================

const PERCENTILE_WEIGHT = 0.80;
const TREND_WEIGHT = 0.20;

// Trend direction to numerical score mapping
const TREND_SCORES: Record<TrendDirection, number> = {
  improving: 100,
  stable: 50,
  declining: 0,
};

// 5-level health scale configuration using unified maturity model
interface HealthLevelConfig {
  level: HealthLevel;
  maturityLevel: MaturityLevel;
  maturityName: MaturityLevelName;
  label: string;
  description: string;
  minScore: number;  // Inclusive
  maxScore: number;  // Exclusive (except level 5)
  color: string;
  bgColor: string;
  actionGuidance: string;
}

/**
 * Health levels aligned with CHS (Composite Health Score) thresholds.
 * Uses CHS thresholds: 70 / 55 / 45 / 30
 *
 * Key semantic: 50 = baseline average (not "satisfactory")
 *
 * Level 5 (Excellent)        = 70-100
 * Level 4 (Good)             = 55-69
 * Level 3 (Average)          = 45-54
 * Level 2 (Below Average)    = 30-44
 * Level 1 (Needs Attention)  = 0-29
 */
export const HEALTH_LEVELS: HealthLevelConfig[] = [
  {
    level: 5,
    maturityLevel: 5,
    maturityName: 'Excellent',
    label: 'Excellent',
    description: MATURITY_LEVELS[4].description,
    minScore: 70,
    maxScore: 101,
    color: MATURITY_LEVELS[4].color,
    bgColor: MATURITY_LEVELS[4].backgroundColor,
    actionGuidance: MATURITY_LEVELS[4].guidance,
  },
  {
    level: 4,
    maturityLevel: 4,
    maturityName: 'Good',
    label: 'Good',
    description: MATURITY_LEVELS[3].description,
    minScore: 55,
    maxScore: 70,
    color: MATURITY_LEVELS[3].color,
    bgColor: MATURITY_LEVELS[3].backgroundColor,
    actionGuidance: MATURITY_LEVELS[3].guidance,
  },
  {
    level: 3,
    maturityLevel: 3,
    maturityName: 'Average',
    label: 'Average',
    description: MATURITY_LEVELS[2].description,
    minScore: 45,
    maxScore: 55,
    color: MATURITY_LEVELS[2].color,
    bgColor: MATURITY_LEVELS[2].backgroundColor,
    actionGuidance: MATURITY_LEVELS[2].guidance,
  },
  {
    level: 2,
    maturityLevel: 2,
    maturityName: 'Below Average',
    label: 'Below Average',
    description: MATURITY_LEVELS[1].description,
    minScore: 30,
    maxScore: 45,
    color: MATURITY_LEVELS[1].color,
    bgColor: MATURITY_LEVELS[1].backgroundColor,
    actionGuidance: MATURITY_LEVELS[1].guidance,
  },
  {
    level: 1,
    maturityLevel: 1,
    maturityName: 'Needs Attention',
    label: 'Needs Attention',
    description: MATURITY_LEVELS[0].description,
    minScore: 0,
    maxScore: 30,
    color: MATURITY_LEVELS[0].color,
    bgColor: MATURITY_LEVELS[0].backgroundColor,
    actionGuidance: MATURITY_LEVELS[0].guidance,
  },
];

// ============================================
// Core Calculation Functions
// ============================================

/**
 * Calculate percentile component from dimension overallPercentile values
 * Uses simple average - dimensions are equally weighted
 */
export const calculatePercentileComponent = (
  dimensions: DimensionResult[]
): number => {
  if (dimensions.length === 0) return 50;

  const sum = dimensions.reduce((acc, dim) => acc + dim.overallPercentile, 0);
  return sum / dimensions.length;
};

/**
 * Calculate trend component from dimension trend directions
 * improving=100, stable=50, declining=0
 */
export const calculateTrendComponent = (
  dimensions: DimensionResult[]
): number => {
  if (dimensions.length === 0) return 50;

  const sum = dimensions.reduce((acc, dim) => {
    return acc + TREND_SCORES[dim.trend];
  }, 0);

  return sum / dimensions.length;
};

/**
 * Combine percentile and trend components with 80/20 weighting
 */
export const calculateCompositeScore = (
  percentileComponent: number,
  trendComponent: number
): number => {
  return Math.round(
    (percentileComponent * PERCENTILE_WEIGHT) +
    (trendComponent * TREND_WEIGHT)
  );
};

/**
 * Get health level configuration for a given composite score
 */
export const getHealthLevelFromScore = (
  compositeScore: number
): HealthLevelConfig => {
  const level = HEALTH_LEVELS.find(
    l => compositeScore >= l.minScore && compositeScore < l.maxScore
  );
  return level ?? HEALTH_LEVELS[4]; // Default to Needs Attention (lowest level)
};

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate overall health score from dimension results
 *
 * @param dimensions - Array of dimension results with percentiles and trends
 * @returns HealthScoreResult with composite score, level info, and maturity data
 */
export const calculateOverallHealthScore = (
  dimensions: DimensionResult[]
): HealthScoreResult => {
  // Handle empty assessment
  if (!dimensions || dimensions.length === 0) {
    const defaultLevel = HEALTH_LEVELS[2]; // Average (baseline)
    return {
      compositeScore: 50,
      percentileComponent: 50,
      trendComponent: 50,
      level: defaultLevel.level,
      label: defaultLevel.label,
      description: defaultLevel.description,
      actionGuidance: defaultLevel.actionGuidance,
      color: defaultLevel.color,
      bgColor: defaultLevel.bgColor,
      maturityLevel: defaultLevel.maturityLevel,
      maturityName: defaultLevel.maturityName,
    };
  }

  // Calculate components
  const percentileComponent = calculatePercentileComponent(dimensions);
  const trendComponent = calculateTrendComponent(dimensions);
  const compositeScore = calculateCompositeScore(
    percentileComponent,
    trendComponent
  );

  // Get level
  const healthLevel = getHealthLevelFromScore(compositeScore);

  return {
    compositeScore,
    percentileComponent: Math.round(percentileComponent),
    trendComponent: Math.round(trendComponent),
    level: healthLevel.level,
    label: healthLevel.label,
    description: healthLevel.description,
    actionGuidance: healthLevel.actionGuidance,
    color: healthLevel.color,
    bgColor: healthLevel.bgColor,
    maturityLevel: healthLevel.maturityLevel,
    maturityName: healthLevel.maturityName,
  };
};
