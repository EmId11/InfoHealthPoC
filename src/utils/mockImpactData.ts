// Mock Impact Data Generator
// Creates realistic impact measurement data for testing the impact module

import {
  ScoreSnapshot,
  PlayImpactMeasurement,
  ImpactAnalysisResult,
  PlanImpactSummary,
  ImpactExclusion,
  AwaitingAssessmentPlay,
  ConfidenceLevel,
  ImpactTimelineClass,
  EffectSizeMagnitude,
} from '../types/impactMeasurement';
import { ImprovementPlan, PlanPlay } from '../types/improvementPlan';
import { getTimelineClassForPlay } from '../constants/impactTimelines';

// ============================================
// Mock Snapshot Generation
// ============================================

function generateMockSnapshot(
  dimensionKey: string,
  baseScore: number,
  variance: number = 10
): ScoreSnapshot {
  const randomVariance = () => (Math.random() - 0.5) * variance * 2;

  return {
    capturedAt: new Date().toISOString(),
    dimensionScores: {
      [dimensionKey]: Math.max(0, Math.min(100, baseScore + randomVariance())),
    },
    outcomeScores: {
      'delivery': Math.max(0, Math.min(100, 45 + randomVariance())),
      'collaboration': Math.max(0, Math.min(100, 55 + randomVariance())),
      'productivity': Math.max(0, Math.min(100, 50 + randomVariance())),
      'process-maturity': Math.max(0, Math.min(100, 40 + randomVariance())),
    },
    indicatorValues: {
      [`${dimensionKey}-indicator-1`]: Math.random() * 100,
      [`${dimensionKey}-indicator-2`]: Math.random() * 100,
      [`${dimensionKey}-indicator-3`]: Math.random() * 100,
    },
  };
}

// ============================================
// Mock Impact Analysis Generation
// ============================================

function generateMockAnalysis(
  play: PlanPlay,
  baselineScore: number,
  currentScore: number
): ImpactAnalysisResult {
  const healthScoreChange = currentScore - baselineScore;
  const isPositive = healthScoreChange > 5;

  // Determine effect size
  let effectSize: EffectSizeMagnitude;
  const absChange = Math.abs(healthScoreChange);
  if (absChange < 5) effectSize = 'negligible';
  else if (absChange < 10) effectSize = 'small';
  else if (absChange < 20) effectSize = 'medium';
  else effectSize = 'large';

  // Determine confidence
  let confidenceLevel: ConfidenceLevel;
  let confidenceScore: number;
  if (absChange > 15) {
    confidenceLevel = 'very-high';
    confidenceScore = 85 + Math.random() * 15;
  } else if (absChange > 10) {
    confidenceLevel = 'high';
    confidenceScore = 65 + Math.random() * 15;
  } else if (absChange > 5) {
    confidenceLevel = 'moderate';
    confidenceScore = 45 + Math.random() * 15;
  } else {
    confidenceLevel = 'low';
    confidenceScore = 20 + Math.random() * 20;
  }

  return {
    indicatorChanges: [
      {
        indicatorId: `${play.sourceDimensionKey}-indicator-1`,
        indicatorName: 'Primary Indicator',
        baselineValue: 40 + Math.random() * 20,
        currentValue: 50 + Math.random() * 25,
        changeValue: healthScoreChange * 0.8,
        changePercent: healthScoreChange * 1.5,
        isSignificant: absChange > 8,
        effectSize,
      },
      {
        indicatorId: `${play.sourceDimensionKey}-indicator-2`,
        indicatorName: 'Secondary Indicator',
        baselineValue: 35 + Math.random() * 20,
        currentValue: 45 + Math.random() * 20,
        changeValue: healthScoreChange * 0.5,
        changePercent: healthScoreChange * 1.2,
        isSignificant: absChange > 10,
        effectSize: absChange > 10 ? 'small' : 'negligible',
      },
    ],
    dimensionChange: {
      dimensionKey: play.sourceDimensionKey,
      dimensionName: play.sourceDimensionName,
      baselineHealthScore: baselineScore,
      currentHealthScore: currentScore,
      healthScoreChange,
    },
    outcomeChanges: [
      {
        outcomeId: play.sourceOutcomeId || 'delivery',
        outcomeName: play.sourceOutcomeName || 'Delivery',
        baselineScore: baselineScore - 5,
        currentScore: currentScore - 3,
        scoreChange: healthScoreChange + 2,
      },
    ],
    confidence: {
      level: confidenceLevel,
      score: Math.round(confidenceScore),
      factors: {
        dataCompleteness: 70 + Math.random() * 30,
        sampleSize: 60 + Math.random() * 40,
        effectMagnitude: Math.min(100, absChange * 5),
        attributionClarity: 50 + Math.random() * 40,
      },
    },
    verdict: {
      hasPositiveImpact: isPositive,
      summary: isPositive
        ? healthScoreChange > 15
          ? 'Strong positive impact'
          : 'Moderate positive impact'
        : healthScoreChange < -5
          ? 'Impact unclear or negative'
          : 'Minimal measurable impact',
      explanation: isPositive
        ? `This play contributed to a ${healthScoreChange.toFixed(0)} point improvement in ${play.sourceDimensionName}.`
        : `The metrics showed a ${healthScoreChange.toFixed(0)} point change. More time may be needed to see full impact.`,
    },
  };
}

// ============================================
// Mock Play Impact Measurement
// ============================================

function generateMockPlayImpact(
  play: PlanPlay,
  scenario: 'positive' | 'negative' | 'neutral' | 'awaiting' | 'excluded'
): PlayImpactMeasurement | null {
  const timelineClass = getTimelineClassForPlay(play.playId, play.category);

  if (scenario === 'excluded') {
    return null; // Will be handled separately
  }

  const baselineScore = 30 + Math.random() * 25; // 30-55
  let currentScore: number;

  switch (scenario) {
    case 'positive':
      currentScore = baselineScore + 10 + Math.random() * 20; // +10 to +30
      break;
    case 'negative':
      currentScore = baselineScore - 5 - Math.random() * 10; // -5 to -15
      break;
    case 'neutral':
      currentScore = baselineScore + (Math.random() - 0.5) * 8; // -4 to +4
      break;
    case 'awaiting':
      currentScore = baselineScore; // No change yet
      break;
    default:
      currentScore = baselineScore;
  }

  const now = new Date();
  const completionDate = new Date(now);
  completionDate.setDate(completionDate.getDate() - (scenario === 'awaiting' ? 5 : 45));

  const windowOpenDate = new Date(completionDate);
  windowOpenDate.setDate(windowOpenDate.getDate() + 14);

  const windowCloseDate = new Date(completionDate);
  windowCloseDate.setDate(windowCloseDate.getDate() + 35);

  const measurement: PlayImpactMeasurement = {
    playId: play.playId,
    planPlayId: play.id,
    impactTimelineClass: timelineClass,
    baselineSnapshot: generateMockSnapshot(play.sourceDimensionKey, baselineScore),
    completionSnapshot: generateMockSnapshot(play.sourceDimensionKey, baselineScore + 2),
    assessmentWindowOpensAt: windowOpenDate.toISOString(),
    assessmentWindowClosesAt: windowCloseDate.toISOString(),
  };

  // Add assessment and analysis for non-awaiting scenarios
  if (scenario !== 'awaiting') {
    measurement.assessmentSnapshot = generateMockSnapshot(play.sourceDimensionKey, currentScore);
    measurement.analysis = generateMockAnalysis(play, baselineScore, currentScore);
  }

  return measurement;
}

// ============================================
// Mock Exclusion Generation
// ============================================

function generateMockExclusion(play: PlanPlay): ImpactExclusion {
  const reasons: Array<{
    reason: ImpactExclusion['primaryReason'];
    explanation: string;
    isTemporary: boolean;
  }> = [
    {
      reason: 'insufficient_data',
      explanation: 'Baseline data was not captured when this play started.',
      isTemporary: false,
    },
    {
      reason: 'high_baseline_volatility',
      explanation: 'The baseline metrics showed high volatility, making comparison unreliable.',
      isTemporary: false,
    },
    {
      reason: 'concurrent_plays_overlap',
      explanation: '3 other plays are affecting the same metrics, making attribution unclear.',
      isTemporary: true,
    },
  ];

  const selected = reasons[Math.floor(Math.random() * reasons.length)];

  return {
    playId: play.playId,
    planPlayId: play.id,
    reasons: [selected.reason],
    primaryReason: selected.reason,
    explanation: selected.explanation,
    isTemporary: selected.isTemporary,
    reevaluateAt: selected.isTemporary
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
  };
}

// ============================================
// Mock Awaiting Assessment Play
// ============================================

function generateMockAwaitingPlay(play: PlanPlay): AwaitingAssessmentPlay {
  const daysRemaining = Math.floor(Math.random() * 21) + 1; // 1-21 days
  const eligibleAt = new Date();
  eligibleAt.setDate(eligibleAt.getDate() + daysRemaining);

  return {
    playId: play.playId,
    planPlayId: play.id,
    playTitle: play.title,
    eligibleAt: eligibleAt.toISOString(),
    daysRemaining,
    impactTimelineClass: getTimelineClassForPlay(play.playId, play.category),
  };
}

// ============================================
// Main Mock Data Generator
// ============================================

/**
 * Generate mock impact data for a plan
 * Modifies the plan in place and returns the updated plan
 */
export function generateMockImpactDataForPlan(plan: ImprovementPlan): ImprovementPlan {
  const completedPlays = plan.plays.filter(p => p.status === 'completed');

  if (completedPlays.length === 0) {
    // If no completed plays, simulate some completions
    const playsToComplete = plan.plays.slice(0, Math.min(5, plan.plays.length));
    playsToComplete.forEach((play, idx) => {
      play.status = 'completed';
      const completedDate = new Date();
      completedDate.setDate(completedDate.getDate() - (idx * 10 + 20));
      play.completedAt = completedDate.toISOString();
      play.startedAt = new Date(completedDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    });
  }

  const nowCompletedPlays = plan.plays.filter(p => p.status === 'completed');
  const playsWithImpact: PlayImpactMeasurement[] = [];
  const playsAwaitingAssessment: AwaitingAssessmentPlay[] = [];
  const excludedPlays: ImpactExclusion[] = [];

  // Distribute plays across scenarios
  nowCompletedPlays.forEach((play, idx) => {
    const scenario = idx % 5;

    switch (scenario) {
      case 0:
      case 1:
        // Positive impact (40%)
        const positiveMeasurement = generateMockPlayImpact(play, 'positive');
        if (positiveMeasurement) {
          play.impactMeasurement = positiveMeasurement;
          play.impactTimelineClass = positiveMeasurement.impactTimelineClass;
          playsWithImpact.push(positiveMeasurement);
        }
        break;
      case 2:
        // Neutral impact (20%)
        const neutralMeasurement = generateMockPlayImpact(play, 'neutral');
        if (neutralMeasurement) {
          play.impactMeasurement = neutralMeasurement;
          play.impactTimelineClass = neutralMeasurement.impactTimelineClass;
          playsWithImpact.push(neutralMeasurement);
        }
        break;
      case 3:
        // Awaiting assessment (20%)
        const awaitingMeasurement = generateMockPlayImpact(play, 'awaiting');
        if (awaitingMeasurement) {
          play.impactMeasurement = awaitingMeasurement;
          play.impactTimelineClass = awaitingMeasurement.impactTimelineClass;
        }
        playsAwaitingAssessment.push(generateMockAwaitingPlay(play));
        break;
      case 4:
        // Excluded (20%)
        excludedPlays.push(generateMockExclusion(play));
        break;
    }
  });

  // Calculate overall impact
  let totalImpact = 0;
  let impactCount = 0;
  let totalConfidence = 0;

  playsWithImpact.forEach(p => {
    if (p.analysis) {
      totalImpact += p.analysis.dimensionChange.healthScoreChange;
      totalConfidence += p.analysis.confidence.score;
      impactCount++;
    }
  });

  const avgImpact = impactCount > 0 ? totalImpact / impactCount : 0;
  const avgConfidence = impactCount > 0 ? totalConfidence / impactCount : 0;

  // Determine confidence level
  let confidenceLevel: ConfidenceLevel;
  if (avgConfidence >= 80) confidenceLevel = 'very-high';
  else if (avgConfidence >= 60) confidenceLevel = 'high';
  else if (avgConfidence >= 40) confidenceLevel = 'moderate';
  else confidenceLevel = 'low';

  // Build plan impact summary
  const impactSummary: PlanImpactSummary = {
    planId: plan.id,
    overallImpactScore: Math.round(avgImpact * 10) / 10,
    impactDirection: avgImpact > 2 ? 'positive' : avgImpact < -2 ? 'negative' : 'neutral',
    confidenceLevel,
    confidenceScore: Math.round(avgConfidence),
    outcomeImpacts: [
      {
        outcomeId: 'delivery',
        outcomeName: 'Delivery',
        baselineScore: 42,
        currentScore: 42 + avgImpact * 0.8,
        changePoints: Math.round(avgImpact * 0.8 * 10) / 10,
        contributingPlays: playsWithImpact.slice(0, 3).map(p => p.playId),
      },
      {
        outcomeId: 'collaboration',
        outcomeName: 'Collaboration',
        baselineScore: 55,
        currentScore: 55 + avgImpact * 0.6,
        changePoints: Math.round(avgImpact * 0.6 * 10) / 10,
        contributingPlays: playsWithImpact.slice(1, 4).map(p => p.playId),
      },
      {
        outcomeId: 'productivity',
        outcomeName: 'Productivity',
        baselineScore: 48,
        currentScore: 48 + avgImpact * 0.9,
        changePoints: Math.round(avgImpact * 0.9 * 10) / 10,
        contributingPlays: playsWithImpact.slice(0, 2).map(p => p.playId),
      },
    ],
    playsWithImpact,
    playsAwaitingAssessment,
    excludedPlays,
    lastCalculatedAt: new Date().toISOString(),
    measurementPeriod: {
      start: plan.createdAt,
      end: new Date().toISOString(),
    },
  };

  plan.impactSummary = impactSummary;
  plan.impactCalculatedAt = new Date().toISOString();

  return plan;
}

/**
 * Generate mock impact data for all plans
 */
export function generateMockImpactDataForAllPlans(plans: ImprovementPlan[]): ImprovementPlan[] {
  return plans.map(plan => generateMockImpactDataForPlan({ ...plan, plays: [...plan.plays] }));
}

// ============================================
// CPS Integration
// ============================================

/**
 * Generate mock impact data with CPS for a plan
 * Integrates traditional impact with CPS framework
 */
export function generateMockImpactDataWithCPS(
  plans: ImprovementPlan[],
  teamCount: number = 47
): ImprovementPlan[] {
  // Generate standard mock impact data
  const plansWithImpact = generateMockImpactDataForAllPlans(plans);

  // CPS results are generated separately via progressScorePortfolio.ts
  // and integrated at the portfolio level in PortfolioImpactDashboard

  return plansWithImpact;
}
