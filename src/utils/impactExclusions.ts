// Impact Exclusion Utilities
// Functions for determining why plays are excluded from impact calculation

import {
  ExclusionReason,
  ImpactExclusion,
  getExclusionReasonLabel,
  getExclusionReasonDescription,
} from '../types/impactMeasurement';
import { PlanPlay, ImprovementPlan } from '../types/improvementPlan';
import {
  hasAssessmentWindowOpened,
  getDaysUntilAssessmentWindow,
  calculateAssessmentWindow,
} from '../constants/impactTimelines';

// ============================================
// Exclusion Evaluation
// ============================================

/**
 * Evaluate all exclusion criteria for a play
 * Returns exclusion details if play should be excluded, null if eligible
 */
export function evaluateExclusions(
  play: PlanPlay,
  allPlays: PlanPlay[],
  currentDate: Date = new Date()
): ImpactExclusion | null {
  const reasons: ExclusionReason[] = [];

  // Check if play is completed
  if (play.status !== 'completed') {
    if (play.status === 'skipped') {
      // Skipped plays are permanently excluded
      return {
        playId: play.playId,
        planPlayId: play.id,
        reasons: ['play_not_completed'],
        primaryReason: 'play_not_completed',
        explanation: 'This play was skipped and will not be included in impact calculations.',
        isTemporary: false,
      };
    }
    return {
      playId: play.playId,
      planPlayId: play.id,
      reasons: ['play_not_completed'],
      primaryReason: 'play_not_completed',
      explanation: 'This play has not been completed yet. Impact can only be measured after completion.',
      isTemporary: true,
    };
  }

  // Check for completion date
  if (!play.completedAt) {
    reasons.push('insufficient_data');
  }

  // Check if assessment window has opened
  if (play.completedAt) {
    const completionDate = new Date(play.completedAt);
    if (!hasAssessmentWindowOpened(play.playId, play.category, completionDate, currentDate)) {
      const daysRemaining = getDaysUntilAssessmentWindow(
        play.playId,
        play.category,
        completionDate,
        currentDate
      );
      const window = calculateAssessmentWindow(play.playId, play.category, completionDate);

      return {
        playId: play.playId,
        planPlayId: play.id,
        reasons: ['awaiting_window'],
        primaryReason: 'awaiting_window',
        explanation: `Impact assessment will be available in ${daysRemaining} days (${formatDate(window.opensAt)}).`,
        isTemporary: true,
        reevaluateAt: window.opensAt.toISOString(),
      };
    }
  }

  // Check for baseline snapshot
  if (!play.impactMeasurement?.baselineSnapshot) {
    reasons.push('insufficient_data');
  }

  // Check for concurrent play overlap
  const overlapInfo = checkConcurrentPlayOverlap(play, allPlays);
  if (overlapInfo.hasSignificantOverlap) {
    reasons.push('concurrent_plays_overlap');
  }

  // Check for baseline volatility (if we have indicator data)
  if (play.impactMeasurement?.baselineSnapshot) {
    const volatilityInfo = checkBaselineVolatility(play);
    if (volatilityInfo.isVolatile) {
      reasons.push('high_baseline_volatility');
    }
  }

  // If no reasons, play is eligible
  if (reasons.length === 0) {
    return null;
  }

  // Determine primary reason (most important)
  const primaryReason = determinePrimaryReason(reasons);
  const isTemporary = isExclusionTemporary(reasons);

  return {
    playId: play.playId,
    planPlayId: play.id,
    reasons,
    primaryReason,
    explanation: generateExclusionExplanation(reasons, play, overlapInfo),
    isTemporary,
    reevaluateAt: isTemporary ? calculateReevaluateDate(play, currentDate) : undefined,
  };
}

/**
 * Check for significant overlap with concurrent plays
 */
function checkConcurrentPlayOverlap(
  play: PlanPlay,
  allPlays: PlanPlay[]
): { hasSignificantOverlap: boolean; overlappingPlays: string[]; overlapPercentage: number } {
  if (!play.completedAt) {
    return { hasSignificantOverlap: false, overlappingPlays: [], overlapPercentage: 0 };
  }

  const playCompletionDate = new Date(play.completedAt);
  const overlappingPlays: string[] = [];

  // Get plays affecting the same dimension that completed within 30 days
  for (const otherPlay of allPlays) {
    if (otherPlay.id === play.id) continue;
    if (otherPlay.status !== 'completed') continue;
    if (!otherPlay.completedAt) continue;

    // Check if same dimension
    if (otherPlay.sourceDimensionKey !== play.sourceDimensionKey) continue;

    const otherCompletionDate = new Date(otherPlay.completedAt);
    const daysDiff = Math.abs(
      playCompletionDate.getTime() - otherCompletionDate.getTime()
    ) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 30) {
      overlappingPlays.push(otherPlay.playId);
    }
  }

  // Significant overlap is > 30% (more than 1 other play affecting same dimension)
  const hasSignificantOverlap = overlappingPlays.length >= 2;
  const overlapPercentage = Math.min(100, overlappingPlays.length * 33);

  return { hasSignificantOverlap, overlappingPlays, overlapPercentage };
}

/**
 * Check if baseline had high volatility
 */
function checkBaselineVolatility(
  play: PlanPlay
): { isVolatile: boolean; volatilityScore: number } {
  // Simplified check - in practice would analyze indicator variance
  // For now, consider volatile if less than 2 data points in baseline
  const snapshot = play.impactMeasurement?.baselineSnapshot;
  if (!snapshot) {
    return { isVolatile: false, volatilityScore: 0 };
  }

  const indicatorCount = Object.keys(snapshot.indicatorValues).length;
  const dimensionCount = Object.keys(snapshot.dimensionScores).length;

  // Consider volatile if very limited data
  const isVolatile = indicatorCount < 2 && dimensionCount < 1;
  const volatilityScore = isVolatile ? 75 : 25;

  return { isVolatile, volatilityScore };
}

/**
 * Determine the primary (most important) exclusion reason
 */
function determinePrimaryReason(reasons: ExclusionReason[]): ExclusionReason {
  // Priority order
  const priorityOrder: ExclusionReason[] = [
    'play_not_completed',
    'awaiting_window',
    'insufficient_time',
    'insufficient_data',
    'high_baseline_volatility',
    'concurrent_plays_overlap',
    'external_factors',
  ];

  for (const reason of priorityOrder) {
    if (reasons.includes(reason)) {
      return reason;
    }
  }

  return reasons[0];
}

/**
 * Check if exclusion is temporary (will eventually resolve)
 */
function isExclusionTemporary(reasons: ExclusionReason[]): boolean {
  const temporaryReasons: ExclusionReason[] = [
    'awaiting_window',
    'insufficient_time',
    'play_not_completed', // Only temporary if not skipped
  ];

  // If any reason is permanent, exclusion is permanent
  const permanentReasons: ExclusionReason[] = [
    'external_factors',
    'high_baseline_volatility',
    'insufficient_data', // Usually permanent - data wasn't captured
  ];

  for (const reason of reasons) {
    if (permanentReasons.includes(reason)) {
      return false;
    }
  }

  return temporaryReasons.some(r => reasons.includes(r));
}

/**
 * Generate human-readable explanation for exclusion
 */
function generateExclusionExplanation(
  reasons: ExclusionReason[],
  play: PlanPlay,
  overlapInfo: { hasSignificantOverlap: boolean; overlappingPlays: string[]; overlapPercentage: number }
): string {
  const parts: string[] = [];

  if (reasons.includes('insufficient_data')) {
    parts.push('Baseline data was not captured when this play started.');
  }

  if (reasons.includes('high_baseline_volatility')) {
    parts.push('The baseline metrics showed high volatility, making comparison unreliable.');
  }

  if (reasons.includes('concurrent_plays_overlap')) {
    const playCount = overlapInfo.overlappingPlays.length;
    parts.push(
      `${playCount} other play${playCount > 1 ? 's are' : ' is'} affecting the same metrics, ` +
      `making it difficult to attribute changes to this specific play.`
    );
  }

  if (parts.length === 0) {
    // Use default description for primary reason
    const primary = determinePrimaryReason(reasons);
    parts.push(getExclusionReasonDescription(primary));
  }

  return parts.join(' ');
}

/**
 * Calculate when to reevaluate the exclusion
 */
function calculateReevaluateDate(
  play: PlanPlay,
  currentDate: Date
): string | undefined {
  if (!play.completedAt) {
    return undefined;
  }

  const completionDate = new Date(play.completedAt);
  const window = calculateAssessmentWindow(play.playId, play.category, completionDate);

  // Reevaluate when window opens
  if (window.opensAt > currentDate) {
    return window.opensAt.toISOString();
  }

  // Or in 7 days if window is already open (for data availability)
  const reevaluate = new Date(currentDate);
  reevaluate.setDate(reevaluate.getDate() + 7);
  return reevaluate.toISOString();
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================
// Bulk Exclusion Evaluation
// ============================================

/**
 * Evaluate exclusions for all plays in a plan
 */
export function evaluatePlanExclusions(
  plan: ImprovementPlan,
  currentDate: Date = new Date()
): {
  eligiblePlays: PlanPlay[];
  excludedPlays: ImpactExclusion[];
} {
  const eligiblePlays: PlanPlay[] = [];
  const excludedPlays: ImpactExclusion[] = [];

  for (const play of plan.plays) {
    const exclusion = evaluateExclusions(play, plan.plays, currentDate);

    if (exclusion) {
      excludedPlays.push(exclusion);
    } else {
      eligiblePlays.push(play);
    }
  }

  return { eligiblePlays, excludedPlays };
}

/**
 * Check if an exclusion should be reassessed
 */
export function shouldReassessExclusion(
  exclusion: ImpactExclusion,
  currentDate: Date = new Date()
): boolean {
  if (!exclusion.isTemporary) {
    return false;
  }

  if (!exclusion.reevaluateAt) {
    return false;
  }

  const reevaluateDate = new Date(exclusion.reevaluateAt);
  return currentDate >= reevaluateDate;
}

/**
 * Get summary of exclusions by reason
 */
export function getExclusionSummary(
  exclusions: ImpactExclusion[]
): Array<{ reason: ExclusionReason; count: number; label: string }> {
  const counts = new Map<ExclusionReason, number>();

  for (const exclusion of exclusions) {
    const current = counts.get(exclusion.primaryReason) || 0;
    counts.set(exclusion.primaryReason, current + 1);
  }

  return Array.from(counts.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      label: getExclusionReasonLabel(reason),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get plays that will become eligible soon (within N days)
 */
export function getUpcomingEligiblePlays(
  exclusions: ImpactExclusion[],
  daysAhead: number = 14,
  currentDate: Date = new Date()
): Array<{ exclusion: ImpactExclusion; daysRemaining: number }> {
  const cutoff = new Date(currentDate);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return exclusions
    .filter(e => {
      if (!e.isTemporary || !e.reevaluateAt) return false;
      if (e.primaryReason !== 'awaiting_window') return false;

      const reevaluateDate = new Date(e.reevaluateAt);
      return reevaluateDate <= cutoff;
    })
    .map(e => ({
      exclusion: e,
      daysRemaining: Math.ceil(
        (new Date(e.reevaluateAt!).getTime() - currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}
