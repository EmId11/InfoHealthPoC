/**
 * Precision Indicator Utility
 *
 * Converts confidence interval width into a user-friendly "Precision" indicator.
 * Based on statistical best practices from GRADE (medical), IPCC (climate science),
 * and psychometric testing standards.
 *
 * Key principle: CI width directly measures estimation precision.
 * Narrower CI = more precise estimate = higher precision tier.
 *
 * IMPORTANT: "Precision" measures how well we've ESTIMATED the score,
 * not whether the score is "accurate" or "correct".
 *
 * References:
 * - Guyatt et al. (2008). GRADE system. BMJ, 336(7650), 924-926.
 * - Spiegelhalter (2017). Risk and uncertainty communication.
 * - AERA, APA, NCME (2014). Standards for Educational and Psychological Testing.
 */

export type PrecisionTier = 'high' | 'moderate' | 'low' | 'insufficient';

export interface PrecisionResult {
  /** Precision tier: high, moderate, low, or insufficient */
  tier: PrecisionTier;
  /** Relative precision as percentage (0-100) */
  percentage: number;
  /** Display label for the tier */
  label: string;
  /** Margin of error (half of CI width) */
  margin: number;
  /** User-friendly explanation of what this precision level means */
  explanation: string;
  /** Color for visual display */
  color: string;
  /** Background color for badges */
  bgColor: string;
}

/**
 * Precision tier thresholds based on CI width as percentage of scale.
 *
 * Rationale for thresholds:
 * - ≤15 pts (≥85%): Can detect ~5 point differences reliably
 * - 16-25 pts (75-84%): Suitable for directional decisions
 * - 26-50 pts (50-74%): Notable uncertainty, use with caution
 * - >50 pts (<50%): Too wide for reliable decisions
 */
const PRECISION_THRESHOLDS = {
  high: 85,      // Relative precision ≥ 85% (CI width ≤ 15)
  moderate: 75,  // Relative precision ≥ 75% (CI width ≤ 25)
  low: 50,       // Relative precision ≥ 50% (CI width ≤ 50)
  // Below 50% = insufficient
};

const PRECISION_CONFIG: Record<PrecisionTier, {
  label: string;
  explanation: string;
  color: string;
  bgColor: string;
}> = {
  high: {
    label: 'High',
    explanation: 'This score is well-determined. Small changes (5-10 points) are likely meaningful.',
    color: '#006644',
    bgColor: '#E3FCEF',
  },
  moderate: {
    label: 'Moderate',
    explanation: 'This score is reasonably well-estimated. Suitable for directional decisions, but differences under 10 points may not be meaningful.',
    color: '#0052CC',
    bgColor: '#DEEBFF',
  },
  low: {
    label: 'Low',
    explanation: 'This score has notable uncertainty. Use for general guidance only; consider collecting more data.',
    color: '#FF8B00',
    bgColor: '#FFF7ED',
  },
  insufficient: {
    label: 'Insufficient',
    explanation: 'Limited data makes this score too uncertain for reliable decisions. More data is needed.',
    color: '#DE350B',
    bgColor: '#FFEBE6',
  },
};

/**
 * Calculate precision indicator from a confidence interval.
 *
 * @param ciLower - Lower bound of confidence interval
 * @param ciUpper - Upper bound of confidence interval
 * @param scaleMin - Minimum of the score scale (default: 0)
 * @param scaleMax - Maximum of the score scale (default: 100)
 * @returns PrecisionResult with tier, percentage, label, and explanation
 *
 * @example
 * // Score 56 with 90% CI [48, 65]
 * const precision = calculatePrecision(48, 65);
 * // Returns: { tier: 'moderate', percentage: 83, label: 'Moderate', margin: 8, ... }
 */
export function calculatePrecision(
  ciLower: number,
  ciUpper: number,
  scaleMin: number = 0,
  scaleMax: number = 100
): PrecisionResult {
  const ciWidth = ciUpper - ciLower;
  const scaleRange = scaleMax - scaleMin;

  // Relative precision: 1 - (CI_width / Scale_range)
  // 100% = perfect precision (impossible), 0% = CI spans entire scale
  const relativePrecision = Math.max(0, Math.min(100, (1 - ciWidth / scaleRange) * 100));
  const percentage = Math.round(relativePrecision);
  const margin = Math.round(ciWidth / 2);

  // Determine tier based on thresholds
  let tier: PrecisionTier;
  if (relativePrecision >= PRECISION_THRESHOLDS.high) {
    tier = 'high';
  } else if (relativePrecision >= PRECISION_THRESHOLDS.moderate) {
    tier = 'moderate';
  } else if (relativePrecision >= PRECISION_THRESHOLDS.low) {
    tier = 'low';
  } else {
    tier = 'insufficient';
  }

  const config = PRECISION_CONFIG[tier];

  return {
    tier,
    percentage,
    label: config.label,
    margin,
    explanation: config.explanation,
    color: config.color,
    bgColor: config.bgColor,
  };
}

/**
 * Get precision from standard error (alternative calculation).
 * Useful when you have SE but not the full CI.
 *
 * @param standardError - Standard error of the estimate
 * @param confidenceLevel - Confidence level (default: 0.90 for 90% CI)
 * @param scaleMax - Maximum of the score scale (default: 100)
 */
export function calculatePrecisionFromSE(
  standardError: number,
  confidenceLevel: number = 0.90,
  scaleMax: number = 100
): PrecisionResult {
  // z-score for confidence level (1.645 for 90%, 1.96 for 95%)
  const z = confidenceLevel === 0.95 ? 1.96 : 1.645;
  const ciWidth = 2 * z * standardError;
  const ciLower = 50 - z * standardError; // Centered at 50 for calculation
  const ciUpper = 50 + z * standardError;

  return calculatePrecision(ciLower, ciUpper, 0, scaleMax);
}

/**
 * Format precision for display with margin of error.
 *
 * @param precision - PrecisionResult from calculatePrecision
 * @returns Formatted string like "Moderate (±8)"
 */
export function formatPrecisionWithMargin(precision: PrecisionResult): string {
  return `${precision.label} (±${precision.margin})`;
}

/**
 * Get the precision tier thresholds for documentation/display.
 */
export function getPrecisionThresholds() {
  return {
    high: {
      minPrecision: PRECISION_THRESHOLDS.high,
      maxCIWidth: 100 - PRECISION_THRESHOLDS.high,
      description: 'CI width ≤ 15 points',
    },
    moderate: {
      minPrecision: PRECISION_THRESHOLDS.moderate,
      maxCIWidth: 100 - PRECISION_THRESHOLDS.moderate,
      description: 'CI width 16-25 points',
    },
    low: {
      minPrecision: PRECISION_THRESHOLDS.low,
      maxCIWidth: 100 - PRECISION_THRESHOLDS.low,
      description: 'CI width 26-50 points',
    },
    insufficient: {
      minPrecision: 0,
      maxCIWidth: 100,
      description: 'CI width > 50 points',
    },
  };
}
