// Outcome Confidence Calculation Utilities
// Functions for computing outcome-based confidence scores from assessment results
//
// CHS Formula: CSS (50%) + TRS (35%) + PGS (15%)
// - CSS: Current State Score from weighted dimension health scores
// - TRS: Trajectory Score from early vs recent period comparison
// - PGS: Peer Growth Score from ranking within baseline cohort

import { DimensionResult, TrendDirection } from '../types/assessment';
import {
  OutcomeConfidenceResult,
  OutcomeConfidenceSummary,
  DimensionContributionResult,
  getConfidenceLevel,
  getConfidenceLevelConfig,
} from '../types/outcomeConfidence';
import { OUTCOME_DEFINITIONS } from '../constants/outcomeDefinitions';
import { DimensionKey, allDimensions } from '../constants/presets';
import { calculateOutcomeCHS, OutcomeCHSResult, OutcomeDimensionInput } from './compositeHealthScore';

// Maximum score when a critical gap is present
const CRITICAL_GAP_SCORE_CAP = 55;

/**
 * Get dimension name from dimension key
 */
const getDimensionName = (key: DimensionKey): string => {
  const dim = allDimensions.find(d => d.key === key);
  return dim?.label || key;
};

/**
 * Calculate trend direction from dimension trend data
 */
const calculateTrend = (
  contributions: DimensionContributionResult[],
  dimensions: DimensionResult[]
): { trend: 'up' | 'down' | 'stable'; label: string } => {
  let improvingWeight = 0;
  let decliningWeight = 0;

  for (const contrib of contributions) {
    if (contrib.isMissing) continue;

    const dim = dimensions.find(d => d.dimensionKey === contrib.dimensionKey);
    if (!dim) continue;

    if (dim.trend === 'improving') {
      improvingWeight += contrib.weight;
    } else if (dim.trend === 'declining') {
      decliningWeight += contrib.weight;
    }
  }

  // Determine overall trend based on weighted trends
  if (improvingWeight > decliningWeight + 0.1) {
    return { trend: 'up', label: 'Improving' };
  }
  if (decliningWeight > improvingWeight + 0.1) {
    return { trend: 'down', label: 'Declining' };
  }
  return { trend: 'stable', label: 'Stable' };
};

/**
 * Historical data for outcome CHS calculation
 */
export interface OutcomeHistoricalData {
  /** Array of past outcome CSS scores (oldest first) */
  historicalCSSValues?: number[];
  /** TRS values from peer outcomes (for PGS) */
  peerTRSValues?: number[];
  /** This outcome's TRS value (for PGS ranking) */
  teamTRS?: number;
}

/**
 * Calculate confidence for a single outcome area using CHS methodology
 *
 * CHS = CSS (50%) + TRS (35%) + PGS (15%)
 * - CSS: Weighted average of dimension health scores (current state)
 * - TRS: Trajectory from historical data (if available)
 * - PGS: Peer growth comparison (if available)
 */
export const calculateOutcomeConfidence = (
  outcomeId: string,
  dimensions: DimensionResult[],
  historicalData?: OutcomeHistoricalData
): OutcomeConfidenceResult | null => {
  const definition = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId);
  if (!definition) return null;

  // Build contribution results for each dimension
  const contributions: DimensionContributionResult[] = [];
  const criticalGaps: DimensionContributionResult[] = [];
  const dimensionInputs: OutcomeDimensionInput[] = [];

  for (const dimContrib of definition.dimensions) {
    const dim = dimensions.find(d => d.dimensionKey === dimContrib.dimensionKey);

    if (dim) {
      // Use dimension's CSS score if available, otherwise use healthScore
      const cssScore = dim.cssScore ?? dim.healthScore;
      const weightedScore = cssScore * dimContrib.weight;
      const isCriticalGap =
        dimContrib.criticalThreshold !== undefined &&
        dim.healthScore < dimContrib.criticalThreshold;

      const result: DimensionContributionResult = {
        dimensionKey: dimContrib.dimensionKey,
        dimensionName: getDimensionName(dimContrib.dimensionKey),
        weight: dimContrib.weight,
        healthScore: dim.healthScore,
        weightedScore,
        whyItMatters: dimContrib.whyItMatters,
        isCriticalGap,
        criticalThreshold: dimContrib.criticalThreshold,
        isMissing: false,
      };

      contributions.push(result);

      // Add to CHS input
      dimensionInputs.push({
        dimensionKey: dimContrib.dimensionKey,
        weight: dimContrib.weight,
        cssScore,
      });

      if (isCriticalGap) {
        criticalGaps.push(result);
      }
    } else {
      // Dimension not in assessment - mark as missing
      contributions.push({
        dimensionKey: dimContrib.dimensionKey,
        dimensionName: getDimensionName(dimContrib.dimensionKey),
        weight: dimContrib.weight,
        healthScore: 0,
        weightedScore: 0,
        whyItMatters: dimContrib.whyItMatters,
        isCriticalGap: false,
        criticalThreshold: dimContrib.criticalThreshold,
        isMissing: true,
      });
    }
  }

  // Calculate CHS using the unified formula
  const chsResult = calculateOutcomeCHS(
    dimensionInputs,
    historicalData?.historicalCSSValues,
    historicalData?.peerTRSValues,
    historicalData?.teamTRS
  );

  // Apply critical gap cap to the CHS score
  let finalScore = Math.round(chsResult.healthScore);
  if (criticalGaps.length > 0 && finalScore > CRITICAL_GAP_SCORE_CAP) {
    finalScore = CRITICAL_GAP_SCORE_CAP;
  }

  // Get confidence level and colors
  const confidenceLevel = getConfidenceLevel(finalScore);
  const config = getConfidenceLevelConfig(finalScore);

  // Calculate trend
  const { trend, label: trendLabel } = calculateTrend(contributions, dimensions);

  return {
    id: definition.id,
    name: definition.name,
    shortName: definition.shortName,
    question: definition.question,
    description: definition.description,
    spectrumEndpoints: definition.spectrumEndpoints,
    rawScore: Math.round(chsResult.cssScore), // CSS is the "raw" score before TRS/PGS
    finalScore,
    confidenceLevel,
    // CHS components
    cssScore: chsResult.cssScore,
    trsScore: chsResult.trsScore,
    pgsScore: chsResult.pgsScore,
    standardError: chsResult.standardError,
    confidenceInterval: chsResult.confidenceInterval,
    componentsAvailable: chsResult.componentsAvailable,
    // Dimension breakdown
    contributions,
    criticalGaps,
    // Display helpers
    trend,
    trendLabel,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.borderColor,
  };
};

/**
 * Calculate confidence for all outcome areas
 */
export const calculateAllOutcomeConfidences = (
  dimensions: DimensionResult[]
): OutcomeConfidenceSummary => {
  const outcomes: OutcomeConfidenceResult[] = [];

  for (const definition of OUTCOME_DEFINITIONS) {
    const result = calculateOutcomeConfidence(definition.id, dimensions);
    if (result) {
      outcomes.push(result);
    }
  }

  // Find lowest and highest
  const sorted = [...outcomes].sort((a, b) => a.finalScore - b.finalScore);
  const lowestConfidence = sorted[0];
  const highestConfidence = sorted[sorted.length - 1];

  // Calculate overall average
  const overallAverage =
    outcomes.length > 0
      ? Math.round(
          outcomes.reduce((sum, o) => sum + o.finalScore, 0) / outcomes.length
        )
      : 0;

  return {
    outcomes,
    lowestConfidence,
    highestConfidence,
    overallAverage,
  };
};

/**
 * Get a brief summary for an outcome's confidence level
 */
export const getConfidenceSummary = (result: OutcomeConfidenceResult): string => {
  const { confidenceLevel, criticalGaps } = result;

  if (criticalGaps.length > 0) {
    const gapNames = criticalGaps.map(g => g.dimensionName).join(', ');
    return `Limited by critical gaps in: ${gapNames}`;
  }

  switch (confidenceLevel) {
    case 'very-high':
      return 'Strong foundation for decisions';
    case 'high':
      return 'Reliable for most purposes';
    case 'moderate':
      return 'Usable with caveats';
    case 'low':
      return 'Significant gaps limit reliability';
  }
};

/**
 * Get actionable insight for an outcome
 */
export const getOutcomeInsight = (result: OutcomeConfidenceResult): string => {
  const { id, confidenceLevel, criticalGaps, contributions } = result;

  // If there are critical gaps, focus on those
  if (criticalGaps.length > 0) {
    const topGap = criticalGaps[0];
    return `Address ${topGap.dimensionName} first—it's limiting your ${result.shortName.toLowerCase()} confidence.`;
  }

  // Find weakest non-critical dimension
  const nonMissing = contributions.filter(c => !c.isMissing);
  const weakest = nonMissing.sort((a, b) => a.healthScore - b.healthScore)[0];

  if (confidenceLevel === 'very-high') {
    return `${result.shortName} confidence is excellent. Maintain current practices.`;
  }

  if (confidenceLevel === 'high') {
    return `Good ${result.shortName.toLowerCase()} reliability. Small improvements in ${weakest?.dimensionName || 'any area'} could push it higher.`;
  }

  if (weakest) {
    return `Improving ${weakest.dimensionName} would most impact your ${result.shortName.toLowerCase()} confidence.`;
  }

  return `Review contributing dimensions to identify improvement opportunities.`;
};
