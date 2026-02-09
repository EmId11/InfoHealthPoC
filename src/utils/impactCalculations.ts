// Impact Calculation Utilities
// Functions for measuring and analyzing impact of improvement plays

import {
  ScoreSnapshot,
  PlayImpactMeasurement,
  ImpactAnalysisResult,
  IndicatorChange,
  DimensionChange,
  OutcomeChange,
  EffectSizeMagnitude,
  ConfidenceAssessment,
  ConfidenceLevel,
  ImpactVerdict,
  PlanImpactSummary,
  PortfolioImpactSummary,
  OutcomeImpact,
  AwaitingAssessmentPlay,
  ImpactTimelineClass,
  DimensionImpact,
  TeamProgressContext,
  TeamPosition,
  ImpactFlow,
  ImpactFlowNode,
  ImpactFlowLink,
  createEmptySnapshot,
  createEmptyPlanImpactSummary,
  createEmptyPortfolioImpactSummary,
} from '../types/impactMeasurement';
import { PlanPlay, ImprovementPlan } from '../types/improvementPlan';
import { DimensionResult, AssessmentResult } from '../types/assessment';
import {
  getTimelineForPlay,
  getTimelineClassForPlay,
  calculateAssessmentWindow,
  hasAssessmentWindowOpened,
  getDaysUntilAssessmentWindow,
} from '../constants/impactTimelines';

// ============================================
// Snapshot Capture
// ============================================

/**
 * Capture a score snapshot from assessment results
 * Extracts dimension health scores, outcome scores, and indicator values
 */
export function captureScoreSnapshot(
  assessmentResults: AssessmentResult | null,
  targetDimensions: string[] = [],
  targetOutcomes: string[] = []
): ScoreSnapshot {
  const snapshot = createEmptySnapshot();

  if (!assessmentResults) {
    return snapshot;
  }

  // Capture dimension scores (healthScores)
  for (const dimension of assessmentResults.dimensions) {
    if (targetDimensions.length === 0 || targetDimensions.includes(dimension.dimensionKey)) {
      snapshot.dimensionScores[dimension.dimensionKey] = dimension.healthScore;

      // Capture indicator values within dimension
      for (const category of dimension.categories) {
        for (const indicator of category.indicators) {
          snapshot.indicatorValues[indicator.id] = indicator.value;
        }
      }
    }
  }

  // Capture outcome scores (if available)
  // Note: In the actual implementation, outcomes would need to be calculated
  // from their contributing dimensions
  for (const outcomeId of targetOutcomes) {
    const outcomeScore = calculateOutcomeScore(assessmentResults, outcomeId);
    if (outcomeScore !== null) {
      snapshot.outcomeScores[outcomeId] = outcomeScore;
    }
  }

  return snapshot;
}

/**
 * Calculate an outcome score from its contributing dimensions
 * This is a simplified calculation - actual implementation would use dimension weights
 */
function calculateOutcomeScore(
  assessmentResults: AssessmentResult,
  outcomeId: string
): number | null {
  // Simplified: average of all dimension health scores
  // In practice, each outcome has specific contributing dimensions with weights
  const dimensions = assessmentResults.dimensions;
  if (dimensions.length === 0) return null;

  const total = dimensions.reduce((sum, d) => sum + d.healthScore, 0);
  return total / dimensions.length;
}

// ============================================
// Statistical Analysis
// ============================================

/**
 * Calculate effect size using Cohen's d formula
 * Cohen's d = (mean2 - mean1) / pooled_std_dev
 *
 * For simplicity, we use a standardized approach:
 * - negligible: d < 0.2
 * - small: 0.2 <= d < 0.5
 * - medium: 0.5 <= d < 0.8
 * - large: d >= 0.8
 */
export function calculateEffectSize(
  baseline: number,
  current: number,
  stdDev: number = 15 // Default standard deviation for percentiles
): { value: number; magnitude: EffectSizeMagnitude } {
  if (stdDev === 0) {
    return { value: 0, magnitude: 'negligible' };
  }

  const d = Math.abs(current - baseline) / stdDev;

  let magnitude: EffectSizeMagnitude;
  if (d < 0.2) {
    magnitude = 'negligible';
  } else if (d < 0.5) {
    magnitude = 'small';
  } else if (d < 0.8) {
    magnitude = 'medium';
  } else {
    magnitude = 'large';
  }

  return { value: d, magnitude };
}

/**
 * Determine if a change is statistically significant
 * Uses a pragmatic threshold-based approach for this POC
 */
export function isChangeSignificant(
  baselineValue: number,
  currentValue: number,
  baselineVolatility: number = 0.3, // Coefficient of variation
  sampleSize: number = 4 // Number of data points
): { isSignificant: boolean; confidence: number } {
  const change = Math.abs(currentValue - baselineValue);

  // Threshold increases with volatility, decreases with sample size
  const volatilityFactor = 1 + baselineVolatility;
  const sampleFactor = Math.sqrt(sampleSize / 4); // Normalize to 4 samples

  // Base threshold: 10 percentile points for significance
  const threshold = 10 * volatilityFactor / sampleFactor;

  const isSignificant = change >= threshold;

  // Confidence calculation (0-100)
  // Higher confidence with larger change, lower volatility, more samples
  let confidence = Math.min(100, (change / threshold) * 60);
  confidence *= Math.max(0.5, 1 - baselineVolatility);
  confidence *= Math.min(2, sampleSize / 2);
  confidence = Math.min(100, Math.max(0, confidence));

  return { isSignificant, confidence: Math.round(confidence) };
}

/**
 * Calculate attribution score for a play
 * Determines how much of the observed change can be attributed to this play
 */
export function calculateAttributionScore(
  play: PlanPlay,
  allPlays: PlanPlay[],
  indicatorChanges: IndicatorChange[]
): number {
  // Find concurrent plays affecting same indicators
  const concurrentPlays = allPlays.filter(p => {
    if (p.id === play.id) return false;
    if (p.status !== 'completed') return false;
    if (!p.completedAt || !play.completedAt) return false;

    // Check if completion dates are within 30 days of each other
    const daysDiff = Math.abs(
      new Date(p.completedAt).getTime() - new Date(play.completedAt).getTime()
    ) / (1000 * 60 * 60 * 24);

    return daysDiff <= 30;
  });

  if (concurrentPlays.length === 0) {
    // No overlap - full attribution
    return 100;
  }

  // Check indicator overlap
  const playIndicators = new Set(play.impactMeasurement?.analysis?.indicatorChanges.map(c => c.indicatorId) || []);
  let overlappingIndicators = 0;

  for (const concurrent of concurrentPlays) {
    const concurrentIndicators = concurrent.impactMeasurement?.analysis?.indicatorChanges.map(c => c.indicatorId) || [];
    for (const ind of concurrentIndicators) {
      if (playIndicators.has(ind)) {
        overlappingIndicators++;
      }
    }
  }

  // Reduce attribution based on overlap
  const overlapPenalty = Math.min(60, overlappingIndicators * 10);
  const concurrencyPenalty = Math.min(30, concurrentPlays.length * 10);

  return Math.max(10, 100 - overlapPenalty - concurrencyPenalty);
}

// ============================================
// Play Eligibility
// ============================================

/**
 * Check if a play is eligible for impact assessment
 */
export function isPlayEligibleForAssessment(
  play: PlanPlay,
  currentDate: Date = new Date()
): {
  eligible: boolean;
  reason?: string;
  daysRemaining?: number;
} {
  // Must be completed
  if (play.status !== 'completed') {
    return { eligible: false, reason: 'Play not completed' };
  }

  // Must have completion date
  if (!play.completedAt) {
    return { eligible: false, reason: 'No completion date recorded' };
  }

  // Must have baseline snapshot
  if (!play.impactMeasurement?.baselineSnapshot) {
    return { eligible: false, reason: 'No baseline snapshot captured' };
  }

  // Check if assessment window has opened
  const timelineClass = play.impactTimelineClass || 'short-term';
  const completionDate = new Date(play.completedAt);

  if (!hasAssessmentWindowOpened(play.playId, play.category, completionDate, currentDate)) {
    const daysRemaining = getDaysUntilAssessmentWindow(
      play.playId,
      play.category,
      completionDate,
      currentDate
    );
    return {
      eligible: false,
      reason: 'Assessment window not yet open',
      daysRemaining,
    };
  }

  return { eligible: true };
}

// ============================================
// Impact Analysis
// ============================================

/**
 * Analyze impact of a single play by comparing baseline to current scores
 */
export function analyzePlayImpact(
  play: PlanPlay,
  baselineSnapshot: ScoreSnapshot,
  currentSnapshot: ScoreSnapshot,
  allPlays: PlanPlay[]
): ImpactAnalysisResult {
  const indicatorChanges: IndicatorChange[] = [];
  let dimensionChange: DimensionChange = {
    dimensionKey: play.sourceDimensionKey,
    dimensionName: play.sourceDimensionName,
    baselineHealthScore: 0,
    currentHealthScore: 0,
    healthScoreChange: 0,
  };
  const outcomeChanges: OutcomeChange[] = [];

  // Analyze indicator changes
  for (const [indicatorId, baselineValue] of Object.entries(baselineSnapshot.indicatorValues)) {
    const currentValue = currentSnapshot.indicatorValues[indicatorId];
    if (currentValue === undefined) continue;

    const change = currentValue - baselineValue;
    const changePercent = baselineValue !== 0 ? (change / baselineValue) * 100 : 0;
    const { isSignificant, confidence } = isChangeSignificant(baselineValue, currentValue);
    const effectSize = calculateEffectSize(baselineValue, currentValue);

    indicatorChanges.push({
      indicatorId,
      indicatorName: indicatorId, // Would be looked up in practice
      baselineValue,
      currentValue,
      changeValue: change,
      changePercent,
      isSignificant,
      effectSize: effectSize.magnitude,
    });
  }

  // Analyze dimension change
  const baselineDimScore = baselineSnapshot.dimensionScores[play.sourceDimensionKey] || 0;
  const currentDimScore = currentSnapshot.dimensionScores[play.sourceDimensionKey] || 0;
  dimensionChange = {
    dimensionKey: play.sourceDimensionKey,
    dimensionName: play.sourceDimensionName,
    baselineHealthScore: baselineDimScore,
    currentHealthScore: currentDimScore,
    healthScoreChange: currentDimScore - baselineDimScore,
  };

  // Analyze outcome changes
  for (const [outcomeId, baselineScore] of Object.entries(baselineSnapshot.outcomeScores)) {
    const currentScore = currentSnapshot.outcomeScores[outcomeId];
    if (currentScore === undefined) continue;

    outcomeChanges.push({
      outcomeId,
      outcomeName: play.sourceOutcomeName || outcomeId,
      baselineScore,
      currentScore,
      scoreChange: currentScore - baselineScore,
    });
  }

  // Calculate confidence
  const confidence = calculateConfidence(
    indicatorChanges,
    dimensionChange,
    allPlays,
    play
  );

  // Generate verdict
  const verdict = generateVerdict(dimensionChange, outcomeChanges, confidence);

  return {
    indicatorChanges,
    dimensionChange,
    outcomeChanges,
    confidence,
    verdict,
  };
}

/**
 * Calculate confidence assessment for an impact analysis
 */
function calculateConfidence(
  indicatorChanges: IndicatorChange[],
  dimensionChange: DimensionChange,
  allPlays: PlanPlay[],
  play: PlanPlay
): ConfidenceAssessment {
  // Data completeness: based on number of indicators with changes
  const expectedIndicators = 5; // Typical dimension has 5+ indicators
  const dataCompleteness = Math.min(100, (indicatorChanges.length / expectedIndicators) * 100);

  // Sample size: based on having baseline + current snapshots
  const hasBaseline = !!play.impactMeasurement?.baselineSnapshot;
  const hasCurrent = !!play.impactMeasurement?.assessmentSnapshot;
  const sampleSize = (hasBaseline ? 50 : 0) + (hasCurrent ? 50 : 0);

  // Effect magnitude: based on dimension health score change
  const effectMagnitude = Math.min(100, Math.abs(dimensionChange.healthScoreChange) * 5);

  // Attribution clarity: inversely related to concurrent play overlap
  const attributionScore = calculateAttributionScore(play, allPlays, indicatorChanges);
  const attributionClarity = attributionScore;

  // Aggregate score
  const score = (
    dataCompleteness * 0.25 +
    sampleSize * 0.2 +
    effectMagnitude * 0.3 +
    attributionClarity * 0.25
  );

  // Determine level
  let level: ConfidenceLevel;
  if (score >= 80) {
    level = 'very-high';
  } else if (score >= 60) {
    level = 'high';
  } else if (score >= 40) {
    level = 'moderate';
  } else {
    level = 'low';
  }

  return {
    level,
    score: Math.round(score),
    factors: {
      dataCompleteness: Math.round(dataCompleteness),
      sampleSize: Math.round(sampleSize),
      effectMagnitude: Math.round(effectMagnitude),
      attributionClarity: Math.round(attributionClarity),
    },
  };
}

/**
 * Generate verdict based on analysis results
 */
function generateVerdict(
  dimensionChange: DimensionChange,
  outcomeChanges: OutcomeChange[],
  confidence: ConfidenceAssessment
): ImpactVerdict {
  const dimChange = dimensionChange.healthScoreChange;
  const avgOutcomeChange = outcomeChanges.length > 0
    ? outcomeChanges.reduce((sum, o) => sum + o.scoreChange, 0) / outcomeChanges.length
    : 0;

  const hasPositiveImpact = dimChange > 5 || avgOutcomeChange > 3;

  let summary: string;
  let explanation: string;

  if (dimChange >= 15) {
    summary = 'Strong positive impact';
    explanation = `This play drove a ${dimChange.toFixed(0)} point improvement in ${dimensionChange.dimensionName}.`;
  } else if (dimChange >= 5) {
    summary = 'Moderate positive impact';
    explanation = `This play contributed to a ${dimChange.toFixed(0)} point improvement in ${dimensionChange.dimensionName}.`;
  } else if (dimChange >= -5) {
    summary = 'Minimal measurable impact';
    explanation = `The metrics remained relatively stable (${dimChange > 0 ? '+' : ''}${dimChange.toFixed(0)} point change).`;
  } else {
    summary = 'Impact unclear or negative';
    explanation = `The dimension showed a ${dimChange.toFixed(0)} point change. External factors may be involved.`;
  }

  if (confidence.level === 'low') {
    explanation += ' Note: confidence in this assessment is low due to limited data.';
  }

  return {
    hasPositiveImpact,
    summary,
    explanation,
  };
}

// ============================================
// Plan-Level Impact
// ============================================

/**
 * Calculate plan-level impact summary from all plays
 */
export function calculatePlanImpact(
  plan: ImprovementPlan,
  currentAssessment: AssessmentResult | null
): PlanImpactSummary {
  const summary = createEmptyPlanImpactSummary(plan.id);

  if (!currentAssessment) {
    return summary;
  }

  const now = new Date();
  const playsWithImpact: PlayImpactMeasurement[] = [];
  const playsAwaitingAssessment: AwaitingAssessmentPlay[] = [];
  const outcomeImpactMap = new Map<string, OutcomeImpact>();

  // Initialize outcome impacts from plan targets
  for (const target of plan.optimizationTargets) {
    if (target.type === 'outcome') {
      outcomeImpactMap.set(target.id, {
        outcomeId: target.id,
        outcomeName: target.name,
        baselineScore: plan.baselineScores[target.id] || 0,
        currentScore: 0, // Will be calculated
        changePoints: 0,
        contributingPlays: [],
      });
    }
  }

  // Process each play
  for (const play of plan.plays) {
    if (play.status !== 'completed') continue;

    const eligibility = isPlayEligibleForAssessment(play, now);

    if (!eligibility.eligible) {
      if (play.completedAt && eligibility.daysRemaining !== undefined) {
        const completionDate = new Date(play.completedAt);
        const window = calculateAssessmentWindow(play.playId, play.category, completionDate);

        playsAwaitingAssessment.push({
          playId: play.playId,
          planPlayId: play.id,
          playTitle: play.title,
          eligibleAt: window.opensAt.toISOString(),
          daysRemaining: eligibility.daysRemaining,
          impactTimelineClass: play.impactTimelineClass || getTimelineClassForPlay(play.playId, play.category),
        });
      }
      continue;
    }

    // Play is eligible - check if it has impact measurement
    if (play.impactMeasurement?.analysis) {
      playsWithImpact.push(play.impactMeasurement);

      // Aggregate outcome impacts
      for (const outcomeChange of play.impactMeasurement.analysis.outcomeChanges) {
        const existing = outcomeImpactMap.get(outcomeChange.outcomeId);
        if (existing) {
          existing.contributingPlays.push(play.playId);
          // For simplicity, use the latest score from this play
          existing.currentScore = outcomeChange.currentScore;
          existing.changePoints = existing.currentScore - existing.baselineScore;
        }
      }
    }
  }

  // Calculate overall impact
  const outcomeImpacts = Array.from(outcomeImpactMap.values());
  let totalImpact = 0;
  let impactCount = 0;

  for (const outcome of outcomeImpacts) {
    if (outcome.contributingPlays.length > 0) {
      totalImpact += outcome.changePoints;
      impactCount++;
    }
  }

  const overallImpact = impactCount > 0 ? totalImpact / impactCount : 0;

  // Determine confidence
  let confidenceScore = 0;
  let confidenceCount = 0;

  for (const impact of playsWithImpact) {
    if (impact.analysis) {
      confidenceScore += impact.analysis.confidence.score;
      confidenceCount++;
    }
  }

  const avgConfidence = confidenceCount > 0 ? confidenceScore / confidenceCount : 0;

  let confidenceLevel: ConfidenceLevel;
  if (avgConfidence >= 80) confidenceLevel = 'very-high';
  else if (avgConfidence >= 60) confidenceLevel = 'high';
  else if (avgConfidence >= 40) confidenceLevel = 'moderate';
  else confidenceLevel = 'low';

  // Build summary
  return {
    ...summary,
    overallImpactScore: Math.round(overallImpact * 10) / 10,
    impactDirection: overallImpact > 2 ? 'positive' : overallImpact < -2 ? 'negative' : 'neutral',
    confidenceLevel,
    confidenceScore: Math.round(avgConfidence),
    outcomeImpacts,
    playsWithImpact,
    playsAwaitingAssessment,
    excludedPlays: [], // Populated by exclusion evaluation
    lastCalculatedAt: now.toISOString(),
    measurementPeriod: {
      start: plan.createdAt,
      end: now.toISOString(),
    },
  };
}

// ============================================
// Portfolio-Level Impact
// ============================================

/**
 * Calculate portfolio-level impact summary across all plans
 */
export function calculatePortfolioImpact(
  plans: ImprovementPlan[]
): PortfolioImpactSummary {
  const summary = createEmptyPortfolioImpactSummary();

  const activePlans = plans.filter(p => p.status !== 'archived');

  let totalImpact = 0;
  let plansWithPositiveImpact = 0;
  let plansWithMeasuredImpact = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  const outcomeImpactMap = new Map<string, {
    outcomeId: string;
    outcomeName: string;
    baselineScore: number;
    currentScore: number;
    totalImpact: number;
    plansContributing: number;
  }>();

  const planPerformance: Array<{
    planId: string;
    planName: string;
    teamName: string;
    impactScore: number;
    confidenceLevel: ConfidenceLevel;
  }> = [];

  const playImpactMap = new Map<string, {
    playId: string;
    playTitle: string;
    impacts: number[];
    teams: Set<string>;
  }>();

  // Process each plan
  for (const plan of activePlans) {
    if (!plan.impactSummary) continue;

    const impact = plan.impactSummary;

    if (impact.playsWithImpact.length > 0) {
      plansWithMeasuredImpact++;

      totalImpact += impact.overallImpactScore;

      if (impact.impactDirection === 'positive') {
        plansWithPositiveImpact++;
      }

      totalConfidence += impact.confidenceScore;
      confidenceCount++;

      // Track plan performance
      planPerformance.push({
        planId: plan.id,
        planName: plan.name,
        teamName: plan.teamId, // Would be resolved to name in practice
        impactScore: impact.overallImpactScore,
        confidenceLevel: impact.confidenceLevel,
      });

      // Aggregate outcome impacts
      for (const outcomeImpact of impact.outcomeImpacts) {
        const existing = outcomeImpactMap.get(outcomeImpact.outcomeId);
        if (existing) {
          existing.totalImpact += outcomeImpact.changePoints;
          existing.currentScore = Math.max(existing.currentScore, outcomeImpact.currentScore);
          existing.plansContributing++;
        } else {
          outcomeImpactMap.set(outcomeImpact.outcomeId, {
            outcomeId: outcomeImpact.outcomeId,
            outcomeName: outcomeImpact.outcomeName,
            baselineScore: outcomeImpact.baselineScore,
            currentScore: outcomeImpact.currentScore,
            totalImpact: outcomeImpact.changePoints,
            plansContributing: 1,
          });
        }
      }

      // Track play impacts
      for (const playImpact of impact.playsWithImpact) {
        const dimChange = playImpact.analysis?.dimensionChange.healthScoreChange || 0;

        const existing = playImpactMap.get(playImpact.playId);
        if (existing) {
          existing.impacts.push(dimChange);
          existing.teams.add(plan.teamId);
        } else {
          // Get play title from plan
          const planPlay = plan.plays.find(p => p.playId === playImpact.playId);
          playImpactMap.set(playImpact.playId, {
            playId: playImpact.playId,
            playTitle: planPlay?.title || playImpact.playId,
            impacts: [dimChange],
            teams: new Set([plan.teamId]),
          });
        }
      }
    }
  }

  // Sort and limit top performing plans
  const topPerformingPlans = planPerformance
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5);

  // Calculate top impact plays
  const topImpactPlays = Array.from(playImpactMap.values())
    .map(play => ({
      playId: play.playId,
      playTitle: play.playTitle,
      avgImpact: play.impacts.reduce((a, b) => a + b, 0) / play.impacts.length,
      teamsUsing: play.teams.size,
      confidenceLevel: 'moderate' as ConfidenceLevel, // Simplified
    }))
    .sort((a, b) => b.avgImpact - a.avgImpact)
    .slice(0, 5);

  // Calculate before/after context
  const avgImpact = confidenceCount > 0 ? totalImpact / confidenceCount : 0;
  const baselineAverageHealthScore = 42; // Mock baseline
  const currentAverageHealthScore = Math.round((baselineAverageHealthScore + avgImpact) * 10) / 10;
  const totalTeamsInComparison = 48;
  const baselineAverageRank = 31;
  const currentAverageRank = Math.max(1, Math.round(baselineAverageRank - (avgImpact / 2)));

  // Calculate baseline date (earliest plan start date)
  const baselineDate = calculateBaselineDate(plans);
  const measurementDate = new Date().toISOString();

  // Calculate impact by dimension
  const impactByDimension = generateDimensionImpacts(plans, avgImpact);

  // Calculate team progress context
  const teamProgressContext = generateTeamProgressContext(avgImpact, totalTeamsInComparison, baselineAverageHealthScore);

  // Generate impact flow
  const impactFlow = generateImpactFlow(plans, topImpactPlays, impactByDimension, Array.from(outcomeImpactMap.values()));

  // Calculate confidence breakdown
  const confidenceBreakdown = calculateConfidenceBreakdown(plans, plansWithMeasuredImpact, avgImpact);

  return {
    totalNetImpact: Math.round(totalImpact * 10) / 10,
    activePlansCount: activePlans.length,
    plansWithPositiveImpact,
    plansWithMeasuredImpact,
    avgConfidenceScore: confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0,
    confidenceBreakdown,
    impactByOutcome: Array.from(outcomeImpactMap.values()),
    topPerformingPlans,
    topImpactPlays,
    // Before/after context
    baselineAverageHealthScore,
    currentAverageHealthScore,
    baselineAverageRank,
    currentAverageRank,
    totalTeamsInComparison,
    baselineDate,
    measurementDate,
    // Impact by dimension
    impactByDimension,
    // Health score context
    teamProgressContext,
    // Impact flow
    impactFlow,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate baseline date - the earliest date any play was started
 */
function calculateBaselineDate(plans: ImprovementPlan[]): string {
  let earliestDate: Date | null = null;

  for (const plan of plans) {
    for (const play of plan.plays) {
      if (play.startedAt) {
        const startDate = new Date(play.startedAt);
        if (!earliestDate || startDate < earliestDate) {
          earliestDate = startDate;
        }
      }
    }
  }

  // If no plays started, use the earliest plan creation date
  if (!earliestDate) {
    for (const plan of plans) {
      const createdDate = new Date(plan.createdAt);
      if (!earliestDate || createdDate < earliestDate) {
        earliestDate = createdDate;
      }
    }
  }

  // Default to 90 days ago if no data
  if (!earliestDate) {
    earliestDate = new Date();
    earliestDate.setDate(earliestDate.getDate() - 90);
  }

  return earliestDate.toISOString();
}

// ============================================
// Portfolio Impact Helpers
// ============================================

/**
 * Calculate detailed confidence breakdown for portfolio
 */
function calculateConfidenceBreakdown(
  plans: ImprovementPlan[],
  plansWithMeasuredImpact: number,
  avgImpact: number
): {
  dataCoverage: number;
  sampleSize: number;
  effectMagnitude: number;
  attributionClarity: number;
} {
  // Data coverage: based on how many plans have impact measurements
  const activePlans = plans.filter(p => p.status !== 'archived');
  const dataCoverage = activePlans.length > 0
    ? Math.round((plansWithMeasuredImpact / activePlans.length) * 100)
    : 0;

  // Sample size: based on total plays with impact analysis
  let totalPlaysWithImpact = 0;
  for (const plan of plans) {
    if (plan.impactSummary?.playsWithImpact) {
      totalPlaysWithImpact += plan.impactSummary.playsWithImpact.length;
    }
  }
  // Score higher with more plays (cap at 100, 10 plays = 100)
  const sampleSize = Math.min(100, Math.round((totalPlaysWithImpact / 10) * 100));

  // Effect magnitude: based on the size of the average impact
  // Larger impacts are easier to measure confidently
  const effectMagnitude = Math.min(100, Math.round(Math.abs(avgImpact) * 5));

  // Attribution clarity: based on how overlapping the plays are
  // For simplicity, use a baseline value adjusted by plan count
  let totalOverlap = 0;
  for (const plan of plans) {
    if (plan.impactSummary?.playsWithImpact) {
      // Check for concurrent plays
      const playsWithImpact = plan.impactSummary.playsWithImpact;
      for (let i = 0; i < playsWithImpact.length; i++) {
        for (let j = i + 1; j < playsWithImpact.length; j++) {
          const analysis1 = playsWithImpact[i].analysis;
          const analysis2 = playsWithImpact[j].analysis;
          if (analysis1 && analysis2) {
            const dim1 = analysis1.dimensionChange.dimensionKey;
            const dim2 = analysis2.dimensionChange.dimensionKey;
            if (dim1 === dim2) {
              totalOverlap++;
            }
          }
        }
      }
    }
  }
  // Higher overlap = lower clarity
  const attributionClarity = Math.max(20, 100 - totalOverlap * 10);

  return {
    dataCoverage: Math.max(0, Math.min(100, dataCoverage)),
    sampleSize: Math.max(0, Math.min(100, sampleSize)),
    effectMagnitude: Math.max(0, Math.min(100, effectMagnitude)),
    attributionClarity: Math.max(0, Math.min(100, attributionClarity)),
  };
}

/**
 * Generate dimension impacts for portfolio view
 */
function generateDimensionImpacts(
  plans: ImprovementPlan[],
  avgImpact: number
): DimensionImpact[] {
  const dimensionMap = new Map<string, {
    dimensionKey: string;
    dimensionName: string;
    baselineSum: number;
    currentSum: number;
    count: number;
    contributingPlays: Set<string>;
  }>();

  // Aggregate dimension impacts from all plans
  for (const plan of plans) {
    if (!plan.impactSummary) continue;

    for (const playImpact of plan.impactSummary.playsWithImpact) {
      if (playImpact.analysis?.dimensionChange) {
        const dim = playImpact.analysis.dimensionChange;
        const existing = dimensionMap.get(dim.dimensionKey);

        if (existing) {
          existing.baselineSum += dim.baselineHealthScore;
          existing.currentSum += dim.currentHealthScore;
          existing.count++;
          existing.contributingPlays.add(playImpact.playId);
        } else {
          dimensionMap.set(dim.dimensionKey, {
            dimensionKey: dim.dimensionKey,
            dimensionName: dim.dimensionName,
            baselineSum: dim.baselineHealthScore,
            currentSum: dim.currentHealthScore,
            count: 1,
            contributingPlays: new Set([playImpact.playId]),
          });
        }
      }
    }
  }

  // If no dimension data, generate mock dimensions
  if (dimensionMap.size === 0) {
    const mockDimensions = [
      { key: 'ticket-readiness', name: 'Ticket Readiness', baseline: 32, change: 8.2 },
      { key: 'sprint-hygiene', name: 'Sprint Hygiene', baseline: 28, change: 12.5 },
      { key: 'estimation', name: 'Estimation Coverage', baseline: 45, change: 3.1 },
      { key: 'data-freshness', name: 'Data Freshness', baseline: 52, change: -2.3 },
    ];

    return mockDimensions.map((d, idx) => ({
      dimensionKey: d.key,
      dimensionName: d.name,
      baselineHealthScore: d.baseline,
      currentHealthScore: Math.round((d.baseline + d.change) * 10) / 10,
      healthScoreChange: d.change,
      baselineRank: 35 - idx * 3,
      currentRank: Math.max(1, 35 - idx * 3 - Math.round(d.change / 2)),
      totalTeams: 48,
      contributingPlays: idx < 3 ? [`play-${idx + 1}`, `play-${idx + 2}`] : [],
    }));
  }

  // Convert map to array with calculated averages
  return Array.from(dimensionMap.values())
    .map(dim => {
      const baselineHealthScore = Math.round((dim.baselineSum / dim.count) * 10) / 10;
      const currentHealthScore = Math.round((dim.currentSum / dim.count) * 10) / 10;
      const healthScoreChange = Math.round((currentHealthScore - baselineHealthScore) * 10) / 10;
      const baselineRank = Math.round(48 * (1 - baselineHealthScore / 100));
      const currentRank = Math.round(48 * (1 - currentHealthScore / 100));

      return {
        dimensionKey: dim.dimensionKey,
        dimensionName: dim.dimensionName,
        baselineHealthScore,
        currentHealthScore,
        healthScoreChange,
        baselineRank: Math.max(1, baselineRank),
        currentRank: Math.max(1, currentRank),
        totalTeams: 48,
        contributingPlays: Array.from(dim.contributingPlays),
      };
    })
    .sort((a, b) => b.healthScoreChange - a.healthScoreChange);
}

/**
 * Generate team progress context for health score comparison
 */
const mockTeamNames = [
  'Platform Team', 'Mobile Squad', 'Core API', 'DevOps',
  'Frontend Team', 'Data Engineering', 'Security', 'Integrations',
  'Growth Team', 'Infrastructure', 'QA Team', 'Design Systems',
  'Backend Services', 'Cloud Ops', 'Analytics', 'Release Team',
  'Product Core', 'Payments', 'Auth Team', 'Search',
  'ML Platform', 'Data Pipeline', 'Mobile Core', 'Web Platform',
  'Customer Success', 'Developer Tools', 'SRE', 'Observability',
  'Edge Services', 'Content Team', 'Notifications', 'Messaging',
  'Commerce', 'Billing', 'Admin Tools', 'Partner API',
  'Discovery', 'Recommendations', 'Feed Team', 'Social',
  'Media', 'Storage', 'CDN Team', 'Gateway',
  'Identity', 'Compliance', 'Audit', 'Risk'
];

function generateTeamProgressContext(
  yourChange: number,
  totalTeams: number,
  yourBaselineHealthScore: number
): TeamProgressContext {
  // Use seeded random for consistent results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Generate team positions with before/after for animation
  const teamPositions: TeamPosition[] = [];
  const similarTeamsChanges: number[] = [];

  // Add your team first
  teamPositions.push({
    teamId: 'your-team',
    teamName: 'Your Team',
    beforeHealthScore: yourBaselineHealthScore,
    afterHealthScore: yourBaselineHealthScore + yourChange,
    change: yourChange,
  });
  similarTeamsChanges.push(yourChange);

  // Generate other teams with CONVERGENCE pattern (wide spread before → narrow spread after)
  // This creates a clear visual in the slope chart where lines converge toward the middle
  for (let i = 0; i < totalTeams - 1; i++) {
    // Generate baseline positions with WIDE spread (10-90 range, more at extremes)
    const baselineSeed = seededRandom(i * 3 + 1);
    // Spread teams out more - some very low, some very high
    let beforeHealthScore: number;
    if (baselineSeed < 0.3) {
      // Low performers: 10-30
      beforeHealthScore = Math.round(10 + baselineSeed * 67);
    } else if (baselineSeed > 0.7) {
      // High performers: 70-90
      beforeHealthScore = Math.round(70 + (baselineSeed - 0.7) * 67);
    } else {
      // Middle performers: 30-70
      beforeHealthScore = Math.round(30 + (baselineSeed - 0.3) * 100);
    }

    // Generate change that CONVERGES teams toward the middle (around 55-60)
    // Low teams improve more, high teams improve less (or slightly decline)
    const targetCenter = 58; // Where teams converge to
    const distanceFromCenter = beforeHealthScore - targetCenter;

    // Convergence factor: how much teams move toward center (0.4 = 40% closer)
    const convergenceFactor = 0.35 + seededRandom(i * 11 + 5) * 0.3; // 35-65% convergence
    const convergenceChange = -distanceFromCenter * convergenceFactor;

    // Add some noise
    const noiseSeed = seededRandom(i * 7 + 2);
    const noise = (noiseSeed - 0.5) * 8; // ±4 points noise

    const change = Math.round((convergenceChange + noise) * 10) / 10;
    const afterHealthScore = Math.max(5, Math.min(95, Math.round(beforeHealthScore + change)));

    teamPositions.push({
      teamId: `team-${i}`,
      teamName: mockTeamNames[i % mockTeamNames.length],
      beforeHealthScore,
      afterHealthScore,
      change: afterHealthScore - beforeHealthScore, // Recalculate to match clamped value
    });
    similarTeamsChanges.push(afterHealthScore - beforeHealthScore);
  }

  similarTeamsChanges.sort((a, b) => a - b);

  // Calculate statistics
  const improvedTeamsCount = similarTeamsChanges.filter(c => c > 0).length;
  const declinedTeamsCount = similarTeamsChanges.filter(c => c < 0).length;
  const averageChange = Math.round((similarTeamsChanges.reduce((a, b) => a + b, 0) / similarTeamsChanges.length) * 10) / 10;
  const medianChange = similarTeamsChanges[Math.floor(similarTeamsChanges.length / 2)];

  // Calculate your health score rank
  const yourRank = similarTeamsChanges.filter(c => c <= yourChange).length;
  const healthScoreRankOfYourChange = Math.round((yourRank / similarTeamsChanges.length) * 100);

  return {
    yourChange,
    similarTeamsChanges,
    healthScoreRankOfYourChange,
    averageChange,
    medianChange,
    improvedTeamsCount,
    declinedTeamsCount,
    totalTeams,
    teamPositions,
  };
}

/**
 * Mock indicator definitions per dimension for impact flow visualization
 * Maps dimension keys to their key indicators with realistic names
 */
const DIMENSION_INDICATORS: Record<string, Array<{ id: string; name: string }>> = {
  // Ticket Readiness
  'ticketReadiness': [
    { id: 'acceptanceCriteria', name: 'AC Coverage' },
    { id: 'firstTimePassRate', name: 'First Pass Rate' },
    { id: 'midSprintMissingFields', name: 'Description Quality' },
  ],
  'info-health': [
    { id: 'acceptanceCriteria', name: 'AC Coverage' },
    { id: 'firstTimePassRate', name: 'First Pass Rate' },
    { id: 'midSprintMissingFields', name: 'Description Quality' },
  ],
  // Estimation
  'estimationCoverage': [
    { id: 'storyEstimationRate', name: 'Story Points %' },
    { id: 'policyExclusions', name: 'Estimation Accuracy' },
  ],
  'estimation': [
    { id: 'storyEstimationRate', name: 'Story Points %' },
    { id: 'policyExclusions', name: 'Estimation Accuracy' },
  ],
  // Sprint Hygiene
  'sprintHygiene': [
    { id: 'workCarriedOver', name: 'Carryover Rate' },
    { id: 'lastDayCompletions', name: 'Completion Rate' },
    { id: 'midSprintCreations', name: 'Scope Change' },
  ],
  'sprint-hygiene': [
    { id: 'workCarriedOver', name: 'Carryover Rate' },
    { id: 'lastDayCompletions', name: 'Completion Rate' },
    { id: 'midSprintCreations', name: 'Scope Change' },
  ],
  // Data Freshness
  'dataFreshness': [
    { id: 'staleWorkItems', name: 'Update Frequency' },
    { id: 'jiraUpdateFrequency', name: 'Status Freshness' },
  ],
  'data-freshness': [
    { id: 'staleWorkItems', name: 'Update Frequency' },
    { id: 'jiraUpdateFrequency', name: 'Status Freshness' },
  ],
  // Sizing Consistency
  'sizingConsistency': [
    { id: 'storyConsistencyWithin', name: 'Point Calibration' },
    { id: 'sameSizeTimeVariability', name: 'Size Variance' },
  ],
  // Work Captured / Invisible Work
  'workCaptured': [
    { id: 'siloedWorkItems', name: 'Captured Work %' },
    { id: 'throughputVariability', name: 'Throughput Stability' },
  ],
  'invisibleWork': [
    { id: 'siloedWorkItems', name: 'Captured Work %' },
    { id: 'throughputVariability', name: 'Throughput Var.' },
    { id: 'midSprintCreations', name: 'Mid-Sprint Adds' },
  ],
  // Blocker Management
  'blockerManagement': [
    { id: 'blockerResolutionTime', name: 'Resolution Time' },
    { id: 'blockerToWorkItemRatio', name: 'Flag Rate' },
  ],
  // Team Collaboration
  'teamCollaboration': [
    { id: 'avgCommentsPerIssue', name: 'Comment Rate' },
    { id: 'singleContributorIssueRate', name: 'Collaboration %' },
  ],
  // Work Hierarchy
  'workHierarchy': [
    { id: 'issuesNotLinkedToEpics', name: 'Epic Linkage' },
    { id: 'parentEpic', name: 'Hierarchy %' },
  ],
  // Backlog Discipline
  'backlogDiscipline': [
    { id: 'backlogStalenessDistribution', name: 'Backlog Health' },
    { id: 'refinementLag', name: 'Refinement Pace' },
  ],
  // Collaboration Feature Usage
  'collaborationFeatureUsage': [
    { id: 'issueLinkAdoptionRate', name: 'Link Usage' },
    { id: 'atMentionUsageRate', name: '@Mention Rate' },
  ],
  // Configuration Efficiency
  'configurationEfficiency': [
    { id: 'workflowStatusCount', name: 'Workflow Simplicity' },
    { id: 'unusedStatusRate', name: 'Status Usage' },
  ],
  // Issue Type Consistency
  'issueTypeConsistency': [
    { id: 'withinTeamIssueTypeConsistency', name: 'Type Consistency' },
    { id: 'issueTypeVolumeVariability', name: 'Volume Stability' },
  ],
  // Automation Opportunities
  'automationOpportunities': [
    { id: 'recreatingTickets', name: 'Template Usage' },
    { id: 'duplicateTicketPatternRate', name: 'Duplicate Rate' },
  ],
};

/**
 * Normalize outcome ID to match the icon map keys
 */
function normalizeOutcomeId(outcomeId: string): string {
  const idMap: Record<string, string> = {
    'delivery': 'commitments',
    'Delivery': 'commitments',
    'forecasting': 'commitments',
    'planning': 'commitments',
  };
  return idMap[outcomeId] || outcomeId;
}

/**
 * Generate impact flow data for tree visualization
 * Flow: INDICATORS → DIMENSIONS → OUTCOMES (no plays - this is about data lineage)
 *
 * Links include actual weights from outcome definitions for dimension→outcome relationships
 */
function generateImpactFlow(
  plans: ImprovementPlan[],
  topPlays: Array<{ playId: string; playTitle: string; avgImpact: number }>,
  dimensions: DimensionImpact[],
  outcomes: Array<{ outcomeId: string; outcomeName: string; totalImpact: number }>
): ImpactFlow {
  const nodes: ImpactFlowNode[] = [];
  const links: ImpactFlowLink[] = [];

  // If no dimensions, return empty flow
  if (dimensions.length === 0) {
    return { nodes, links };
  }

  // Use dimensions that have actual changes, limit to 5
  const dimensionsToUse = dimensions.slice(0, 5);

  // Generate mock outcomes if we don't have enough (use correct IDs for icons)
  const mockOutcomes = [
    { outcomeId: 'commitments', outcomeName: 'Delivery', totalImpact: 36.7, baselineScore: 21, currentScore: 57 },
    { outcomeId: 'collaboration', outcomeName: 'Collaboration', totalImpact: 27.5, baselineScore: 28, currentScore: 56 },
    { outcomeId: 'productivity', outcomeName: 'Productivity', totalImpact: 41.3, baselineScore: 17, currentScore: 58 },
  ];

  // Use actual outcomes if available, but ensure proper outcome IDs
  const outcomesToUse = outcomes.length >= 2
    ? outcomes.slice(0, 3).map(o => ({
        ...o,
        outcomeId: normalizeOutcomeId(o.outcomeId),
        baselineScore: 30, // Default if not available
        currentScore: 30 + o.totalImpact,
      }))
    : mockOutcomes;

  // Build a map of dimension key -> outcome weights from the definitions
  // This maps dimension keys to which outcomes they contribute to and their weights
  const dimensionOutcomeWeights: Record<string, Array<{ outcomeId: string; weight: number }>> = {
    'teamCollaboration': [
      { outcomeId: 'collaboration', weight: 0.30 },
      { outcomeId: 'productivity', weight: 0.10 },
    ],
    'estimationCoverage': [
      { outcomeId: 'commitments', weight: 0.25 },
      { outcomeId: 'productivity', weight: 0.20 },
    ],
    'sizingConsistency': [
      { outcomeId: 'commitments', weight: 0.20 },
      { outcomeId: 'productivity', weight: 0.20 },
    ],
    'dataFreshness': [
      { outcomeId: 'progress', weight: 0.30 },
      { outcomeId: 'commitments', weight: 0.10 },
    ],
    'sprintHygiene': [
      { outcomeId: 'improvement', weight: 0.25 },
      { outcomeId: 'commitments', weight: 0.10 },
    ],
    'ticketReadiness': [
      { outcomeId: 'commitments', weight: 0.15 },
      { outcomeId: 'portfolio', weight: 0.15 },
    ],
    'workCaptured': [
      { outcomeId: 'productivity', weight: 0.25 },
      { outcomeId: 'commitments', weight: 0.15 },
    ],
    'blockerManagement': [
      { outcomeId: 'awareness', weight: 0.30 },
      { outcomeId: 'collaboration', weight: 0.20 },
    ],
    'workHierarchy': [
      { outcomeId: 'portfolio', weight: 0.30 },
      { outcomeId: 'progress', weight: 0.15 },
    ],
    'collaborationFeatureUsage': [
      { outcomeId: 'collaboration', weight: 0.25 },
    ],
    'backlogDiscipline': [
      { outcomeId: 'commitments', weight: 0.05 },
    ],
    'configurationEfficiency': [
      { outcomeId: 'progress', weight: 0.10 },
      { outcomeId: 'collaboration', weight: 0.10 },
    ],
    'issueTypeConsistency': [
      { outcomeId: 'portfolio', weight: 0.10 },
    ],
    'automationOpportunities': [
      { outcomeId: 'improvement', weight: 0.15 },
      { outcomeId: 'collaboration', weight: 0.15 },
    ],
  };

  // Normalize dimension key for lookups
  const normalizeDimKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      'ticket-readiness': 'ticketReadiness',
      'sprint-hygiene': 'sprintHygiene',
      'estimation': 'estimationCoverage',
      'data-freshness': 'dataFreshness',
    };
    return keyMap[key] || key;
  };

  // Generate indicator nodes for each dimension
  let indicatorIdx = 0;

  dimensionsToUse.forEach((dim, dimIdx) => {
    const normalizedKey = normalizeDimKey(dim.dimensionKey);
    // Get indicators for this dimension, or use defaults
    const dimIndicators = DIMENSION_INDICATORS[normalizedKey] || DIMENSION_INDICATORS[dim.dimensionKey] || [
      { id: `${dim.dimensionKey}-1`, name: 'Primary Metric' },
      { id: `${dim.dimensionKey}-2`, name: 'Secondary Metric' },
    ];

    // Calculate how many indicators contribute to this dimension's change
    const numIndicators = Math.min(dimIndicators.length, 2);
    // Distribute the dimension change across indicators with some variance
    const indicatorWeights = numIndicators === 1 ? [1.0] : [0.6, 0.4];

    // Generate proportional indicator changes based on dimension change
    dimIndicators.slice(0, numIndicators).forEach((indicator, i) => {
      const weight = indicatorWeights[i] || 0.5;
      // Generate before/after values for indicator
      const indicatorImpact = Math.round(dim.healthScoreChange * weight * (0.8 + Math.random() * 0.4) * 10) / 10;
      const beforeValue = Math.round(40 + Math.random() * 20);
      const afterValue = Math.round(beforeValue + indicatorImpact);

      const nodeId = `indicator-${indicatorIdx}`;

      nodes.push({
        id: nodeId,
        type: 'indicator',
        name: indicator.name,
        impactValue: indicatorImpact,
        impactUnit: '%',
        beforeValue,
        afterValue,
        parentIds: [],
        childIds: [`dimension-${dimIdx}`],
      });

      // Link indicator to dimension with weight
      links.push({
        source: nodeId,
        target: `dimension-${dimIdx}`,
        value: Math.abs(indicatorImpact),
        weight: weight, // Indicator's contribution to dimension
      });

      indicatorIdx++;
    });
  });

  // Create dimension nodes with before/after values
  dimensionsToUse.forEach((dim, dimIdx) => {
    const normalizedKey = normalizeDimKey(dim.dimensionKey);

    // Find which indicators link to this dimension
    const indicatorIds = nodes
      .filter(n => n.type === 'indicator' && n.childIds.includes(`dimension-${dimIdx}`))
      .map(n => n.id);

    // Find which outcomes this dimension contributes to based on definitions
    const outcomeContributions = dimensionOutcomeWeights[normalizedKey] || [];
    const outcomeIds: string[] = [];

    outcomesToUse.forEach((outcome, outcomeIdx) => {
      const contribution = outcomeContributions.find(c => c.outcomeId === outcome.outcomeId);
      if (contribution) {
        outcomeIds.push(`outcome-${outcomeIdx}`);
      }
    });

    // If no specific mapping, connect to first outcome
    if (outcomeIds.length === 0 && outcomesToUse.length > 0) {
      outcomeIds.push(`outcome-${dimIdx % outcomesToUse.length}`);
    }

    nodes.push({
      id: `dimension-${dimIdx}`,
      type: 'dimension',
      name: dim.dimensionName,
      impactValue: dim.healthScoreChange,
      impactUnit: 'pts',
      beforeValue: dim.baselineHealthScore,
      afterValue: dim.currentHealthScore,
      parentIds: indicatorIds,
      childIds: outcomeIds,
    });
  });

  // Create outcome nodes
  outcomesToUse.forEach((outcome, outcomeIdx) => {
    // Find which dimensions link to this outcome
    const dimensionIds = nodes
      .filter(n => n.type === 'dimension' && n.childIds.includes(`outcome-${outcomeIdx}`))
      .map(n => n.id);

    nodes.push({
      id: `outcome-${outcomeIdx}`,
      type: 'outcome',
      name: outcome.outcomeName,
      impactValue: outcome.totalImpact,
      impactUnit: 'pts',
      beforeValue: outcome.baselineScore,
      afterValue: outcome.currentScore,
      parentIds: dimensionIds,
      childIds: [],
    });

    // Link dimensions to outcomes with actual weights
    dimensionIds.forEach(dimId => {
      const dimNode = nodes.find(n => n.id === dimId);
      if (dimNode) {
        // Look up the actual weight from outcome definitions
        const normalizedDimKey = normalizeDimKey(dimNode.name.toLowerCase().replace(/\s+/g, ''));
        // Try to find the dimension key from our data
        const dimData = dimensionsToUse.find(d => `dimension-${dimensionsToUse.indexOf(d)}` === dimId);
        const dimKey = dimData ? normalizeDimKey(dimData.dimensionKey) : normalizedDimKey;

        const outcomeContributions = dimensionOutcomeWeights[dimKey] || [];
        const contribution = outcomeContributions.find(c => c.outcomeId === outcome.outcomeId);
        const weight = contribution?.weight || 0.15; // Default weight if not found

        links.push({
          source: dimId,
          target: `outcome-${outcomeIdx}`,
          value: Math.abs(dimNode.impactValue * weight),
          weight: weight, // Actual weight from outcome definitions
        });
      }
    });
  });

  return { nodes, links };
}

// ============================================
// Snapshot Capture Hooks
// ============================================

/**
 * Capture baseline snapshot when a play starts
 * Should be called when play status changes to 'in-progress'
 */
export function captureBaselineForPlay(
  play: PlanPlay,
  assessment: AssessmentResult | null
): PlayImpactMeasurement {
  const targetDimensions = [play.sourceDimensionKey];
  const targetOutcomes = play.sourceOutcomeIds || (play.sourceOutcomeId ? [play.sourceOutcomeId] : []);

  const baselineSnapshot = captureScoreSnapshot(assessment, targetDimensions, targetOutcomes);
  const timelineClass = getTimelineClassForPlay(play.playId, play.category);

  return {
    playId: play.playId,
    planPlayId: play.id,
    baselineSnapshot,
    impactTimelineClass: timelineClass,
  };
}

/**
 * Capture completion snapshot when a play completes
 * Should be called when play status changes to 'completed'
 */
export function captureCompletionForPlay(
  play: PlanPlay,
  assessment: AssessmentResult | null,
  existingMeasurement?: PlayImpactMeasurement
): PlayImpactMeasurement {
  const targetDimensions = [play.sourceDimensionKey];
  const targetOutcomes = play.sourceOutcomeIds || (play.sourceOutcomeId ? [play.sourceOutcomeId] : []);

  const completionSnapshot = captureScoreSnapshot(assessment, targetDimensions, targetOutcomes);
  const completionDate = new Date();

  const window = calculateAssessmentWindow(
    play.playId,
    play.category,
    completionDate
  );

  return {
    ...existingMeasurement,
    playId: play.playId,
    planPlayId: play.id,
    completionSnapshot,
    impactTimelineClass: existingMeasurement?.impactTimelineClass || getTimelineClassForPlay(play.playId, play.category),
    assessmentWindowOpensAt: window.opensAt.toISOString(),
    assessmentWindowClosesAt: window.closesAt.toISOString(),
  };
}

/**
 * Capture assessment snapshot and run analysis
 * Should be called when assessment window opens or on demand
 */
export function captureAssessmentForPlay(
  play: PlanPlay,
  assessment: AssessmentResult | null,
  allPlays: PlanPlay[]
): PlayImpactMeasurement | null {
  if (!play.impactMeasurement?.baselineSnapshot) {
    return null;
  }

  const targetDimensions = [play.sourceDimensionKey];
  const targetOutcomes = play.sourceOutcomeIds || (play.sourceOutcomeId ? [play.sourceOutcomeId] : []);

  const assessmentSnapshot = captureScoreSnapshot(assessment, targetDimensions, targetOutcomes);

  const analysis = analyzePlayImpact(
    play,
    play.impactMeasurement.baselineSnapshot,
    assessmentSnapshot,
    allPlays
  );

  return {
    ...play.impactMeasurement,
    assessmentSnapshot,
    analysis,
  };
}

// ============================================
// CPS Integration
// ============================================

/**
 * Calculate portfolio impact with CPS results integrated
 * Combines traditional impact metrics with CPS framework
 */
export function calculatePortfolioImpactWithCPS(
  plans: ImprovementPlan[]
): PortfolioImpactSummary {
  // Calculate standard portfolio impact
  const portfolioImpact = calculatePortfolioImpact(plans);

  // Import CPS calculation dynamically to avoid circular dependencies
  // In a real implementation, CPS would be calculated here
  // For now, we return the portfolio impact with cpsResults potentially populated elsewhere

  return portfolioImpact;
}
