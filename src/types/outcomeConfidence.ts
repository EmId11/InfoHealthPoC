// Outcome Confidence Types
// Types for outcome-based confidence assessments

import { DimensionKey } from '../constants/presets';

// ============================================
// Outcome Area Definitions
// ============================================

/**
 * The 7 outcome areas users care about
 */
export type OutcomeAreaId =
  | 'commitments'
  | 'progress'
  | 'productivity'
  | 'improvement'
  | 'collaboration'
  | 'portfolio'
  | 'awareness';

/**
 * Confidence levels based on score ranges
 */
export type ConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';

/**
 * A dimension's contribution to an outcome area
 */
export interface DimensionContribution {
  dimensionKey: DimensionKey;
  weight: number; // 0-1, should sum to 1 across all contributions
  whyItMatters: string; // Explanation of how this dimension affects the outcome
  criticalThreshold?: number; // If healthScore below this, caps confidence at "moderate"
}

/**
 * Definition of an outcome area
 */
/**
 * Spectrum endpoint with label and narrative description
 */
export interface SpectrumEndpoint {
  label: string;       // Short label (e.g., "Guesswork")
  description: string; // Narrative of what this end looks like
}

/**
 * Definition of an outcome area
 */
export interface OutcomeAreaDefinition {
  id: OutcomeAreaId;
  name: string;
  shortName: string;
  question: string; // The key question this outcome answers
  description: string;
  dimensions: DimensionContribution[];
  spectrumEndpoints: {
    min: SpectrumEndpoint; // What bad looks like
    max: SpectrumEndpoint; // What good looks like
  };
}

// ============================================
// Calculated Confidence Results
// ============================================

/**
 * A dimension's actual contribution to a calculated outcome
 */
export interface DimensionContributionResult {
  dimensionKey: DimensionKey;
  dimensionName: string;
  weight: number;
  healthScore: number;
  weightedScore: number; // healthScore * weight
  whyItMatters: string;
  isCriticalGap: boolean; // true if below critical threshold
  criticalThreshold?: number;
  isMissing: boolean; // true if dimension wasn't in the assessment
}

/**
 * Calculated confidence for a single outcome area
 */
export interface OutcomeConfidenceResult {
  id: OutcomeAreaId;
  name: string;
  shortName: string;
  question: string;
  description: string;
  spectrumEndpoints: {
    min: SpectrumEndpoint;
    max: SpectrumEndpoint;
  };

  // Calculated values (CHS methodology)
  rawScore: number; // 0-100, weighted average before caps
  finalScore: number; // 0-100, after applying critical gap caps (this is the CHS)
  confidenceLevel: ConfidenceLevel;

  /**
   * Current State Score (0-100) - weighted average of dimension CSS scores.
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
   * Standard error of the final score
   */
  standardError?: number;
  /**
   * 90% confidence interval for the final score
   */
  confidenceInterval?: { lower: number; upper: number };
  /**
   * Which CHS components were available for calculation
   */
  componentsAvailable?: {
    css: boolean;
    trs: boolean;
    pgs: boolean;
  };

  // Dimension breakdown
  contributions: DimensionContributionResult[];
  criticalGaps: DimensionContributionResult[]; // Dimensions that capped the score

  // Display helpers
  trend: 'up' | 'down' | 'stable';
  trendLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Summary of all outcome confidences for display
 */
export interface OutcomeConfidenceSummary {
  outcomes: OutcomeConfidenceResult[];
  lowestConfidence: OutcomeConfidenceResult;
  highestConfidence: OutcomeConfidenceResult;
  overallAverage: number;
}

// ============================================
// Confidence Level Configuration
// ============================================

export interface ConfidenceLevelConfig {
  level: ConfidenceLevel;
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const CONFIDENCE_LEVELS: ConfidenceLevelConfig[] = [
  {
    level: 'low',
    label: 'Low',
    minScore: 0,
    maxScore: 39,
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FFBDAD',
    description: 'Significant gaps limit reliability',
  },
  {
    level: 'moderate',
    label: 'Moderate',
    minScore: 40,
    maxScore: 59,
    color: '#FF8B00',
    bgColor: '#FFFAE6',
    borderColor: '#FFE380',
    description: 'Usable with caveats',
  },
  {
    level: 'high',
    label: 'High',
    minScore: 60,
    maxScore: 79,
    color: '#36B37E',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
    description: 'Reliable for most purposes',
  },
  {
    level: 'very-high',
    label: 'Very High',
    minScore: 80,
    maxScore: 100,
    color: '#00875A',
    bgColor: '#E3FCEF',
    borderColor: '#79F2C0',
    description: 'Strong foundation for decisions',
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get confidence level from a score (0-100)
 */
export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= 80) return 'very-high';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
};

/**
 * Get confidence level configuration from a score
 */
export const getConfidenceLevelConfig = (score: number): ConfidenceLevelConfig => {
  const level = getConfidenceLevel(score);
  return CONFIDENCE_LEVELS.find(c => c.level === level) || CONFIDENCE_LEVELS[0];
};

/**
 * Get trend icon for display
 */
export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'stable': return '→';
  }
};
