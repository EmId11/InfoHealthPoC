/**
 * CHS (Composite Health Score) Categories
 *
 * This is the SINGLE SOURCE OF TRUTH for health score categorization.
 * All components displaying health levels should reference this file.
 *
 * Key Semantic Difference from Old System:
 * - CHS is centered at 50 (meaning "baseline/no change from average")
 * - A score of 50 is NOT "satisfactory" - it's "stable at baseline"
 * - Progress is measured relative to baseline, not absolute percentile rank
 *
 * Thresholds: 70 / 55 / 45 / 30
 * - 70+: Excellent (significantly above baseline)
 * - 55-69: Good Health (above baseline with positive direction)
 * - 45-54: Average (near baseline, stable)
 * - 30-44: Below Average (under baseline, needs attention)
 * - <30: Needs Attention (significantly below, intervention required)
 */

import { MaturityLevel, MaturityLevelName } from '../types/maturity';

/** CHS Category identifier */
export type CHSCategory =
  | 'excellent'
  | 'good'
  | 'average'
  | 'below-average'
  | 'needs-attention';

/** Configuration for a single CHS category */
export interface CHSCategoryConfig {
  /** Category identifier */
  category: CHSCategory;
  /** Maturity level (1-5) for backward compatibility */
  level: MaturityLevel;
  /** Display name */
  name: MaturityLevelName;
  /** Short label for badges */
  shortLabel: string;
  /** Minimum score (inclusive) */
  min: number;
  /** Maximum score (exclusive, except for highest tier) */
  max: number;
  /** Primary color for text and icons */
  color: string;
  /** Background color for badges and cards */
  bgColor: string;
  /** Border color for containers */
  borderColor: string;
  /** Brief description of this category */
  description: string;
  /** Action guidance for this category */
  guidance: string;
}

/**
 * CHS category definitions - the canonical source for health score categorization.
 * Uses asymmetric thresholds optimized for progress measurement:
 * - 70/55/45/30 (not even 20-point splits)
 * - 50 = baseline (no change from average)
 */
export const CHS_CATEGORIES: readonly CHSCategoryConfig[] = [
  {
    category: 'excellent',
    level: 5,
    name: 'Excellent' as MaturityLevelName,
    shortLabel: 'Excellent',
    min: 70,
    max: 101, // Inclusive upper bound
    color: '#006644',
    bgColor: '#E3FCEF',
    borderColor: '#ABF5D1',
    description: 'Significantly above baseline with strong trajectory',
    guidance: 'Exceptional performance! Consider mentoring other teams and documenting your approach.',
  },
  {
    category: 'good',
    level: 4,
    name: 'Good' as MaturityLevelName,
    shortLabel: 'Good',
    min: 55,
    max: 70,
    color: '#00875A',
    bgColor: '#E3FCEF',
    borderColor: '#79F2C0',
    description: 'Above baseline with positive direction',
    guidance: 'Strong performance! Fine-tune and share best practices with other teams.',
  },
  {
    category: 'average',
    level: 3,
    name: 'Average' as MaturityLevelName,
    shortLabel: 'Average',
    min: 45,
    max: 55,
    color: '#6B778C',
    bgColor: '#F4F5F7',
    borderColor: '#DFE1E6',
    description: 'Near baseline, stable performance',
    guidance: 'You have stable practices in place. Look for improvement opportunities.',
  },
  {
    category: 'below-average',
    level: 2,
    name: 'Below Average' as MaturityLevelName,
    shortLabel: 'Below Avg',
    min: 30,
    max: 45,
    color: '#FF8B00',
    bgColor: '#FFF7ED',
    borderColor: '#FFE380',
    description: 'Under baseline, needs attention',
    guidance: 'Focus on building stronger practices. Identify and address key gaps.',
  },
  {
    category: 'needs-attention',
    level: 1,
    name: 'Needs Attention' as MaturityLevelName,
    shortLabel: 'Attention',
    min: 0,
    max: 30,
    color: '#DE350B',
    bgColor: '#FFEBE6',
    borderColor: '#FFBDAD',
    description: 'Significantly below baseline, intervention required',
    guidance: 'Requires immediate focus. Establish basic processes and capture work consistently.',
  },
] as const;

/**
 * CHS Thresholds for quick reference
 */
export const CHS_THRESHOLDS = {
  excellent: 70,
  good: 55,
  average: 45,
  belowAverage: 30,
  needsAttention: 0,
} as const;

/**
 * Get CHS category configuration for a given score.
 *
 * @param score - Value from 0-100
 * @returns The matching CHSCategoryConfig
 */
export function getCHSCategoryConfig(score: number): CHSCategoryConfig {
  const clampedScore = Math.max(0, Math.min(100, score));

  for (const config of CHS_CATEGORIES) {
    if (clampedScore >= config.min && clampedScore < config.max) {
      return config;
    }
  }

  // Default to needs-attention for edge cases
  return CHS_CATEGORIES[4];
}

/**
 * Get the CHS category for a given score.
 *
 * @param score - Value from 0-100
 * @returns CHSCategory
 */
export function getCHSCategory(score: number): CHSCategory {
  return getCHSCategoryConfig(score).category;
}

/**
 * Get the maturity level (1-5) for a CHS score.
 * Maps CHS categories to legacy maturity levels for backward compatibility.
 *
 * @param score - Value from 0-100
 * @returns MaturityLevel (1-5)
 */
export function getCHSMaturityLevel(score: number): MaturityLevel {
  return getCHSCategoryConfig(score).level;
}

/**
 * Check if a CHS score indicates good health (55+).
 *
 * @param score - Value from 0-100
 * @returns true if score is in Good or Excellent category
 */
export function isHealthy(score: number): boolean {
  return score >= CHS_THRESHOLDS.good;
}

/**
 * Check if a CHS score indicates below baseline performance (<45).
 *
 * @param score - Value from 0-100
 * @returns true if score is in Below Average or Needs Attention category
 */
export function needsImprovement(score: number): boolean {
  return score < CHS_THRESHOLDS.average;
}

/**
 * Get the color for a CHS score.
 *
 * @param score - Value from 0-100
 * @returns Color hex string
 */
export function getCHSColor(score: number): string {
  return getCHSCategoryConfig(score).color;
}

/**
 * CHS component weights (from methodology)
 */
export const CHS_WEIGHTS = {
  css: 0.50,  // Current State Score - 50%
  trs: 0.35,  // Trajectory Score - 35%
  pgs: 0.15,  // Peer Growth Score - 15%
} as const;

/**
 * Get the interpretation for a CHS score.
 */
export function getCHSInterpretation(score: number): string {
  if (score >= 70) {
    return 'Significantly above baseline with strong trajectory';
  } else if (score >= 55) {
    return 'Above baseline with positive direction';
  } else if (score >= 45) {
    return 'Near baseline, stable performance';
  } else if (score >= 30) {
    return 'Below baseline, needs attention';
  } else {
    return 'Significantly below baseline, intervention required';
  }
}

/**
 * Ceiling Effect Guidance for High-Performing Teams
 *
 * Teams with CHS ≥ 80 may have limited room for improvement.
 * This function provides appropriate guidance for these teams.
 *
 * @param score - CHS score (0-100)
 * @returns Ceiling guidance object, or null if not applicable
 */
export function getCeilingGuidance(score: number): {
  title: string;
  message: string;
  cpsInterpretation: string;
} | null {
  if (score >= 80) {
    return {
      title: 'Maintaining Excellence',
      message: 'Your team is operating at a high level. At this stage, maintaining excellence is itself an achievement. Focus on sustaining your strong practices and mentoring other teams.',
      cpsInterpretation: 'A Composite Progress Score (CPS) of 48-55 indicates "Sustained Excellence" — holding steady at a high level is a positive outcome.',
    };
  } else if (score >= 75) {
    return {
      title: 'Near Excellence',
      message: 'Your team is performing very well with moderate room for improvement. A CPS of 50-55 is a healthy target.',
      cpsInterpretation: 'Focus on fine-tuning specific areas rather than expecting large score jumps.',
    };
  }
  return null;
}
