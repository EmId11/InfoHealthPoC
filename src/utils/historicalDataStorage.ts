/**
 * Historical Data Storage for TRS/PGS Calculations
 *
 * This module manages the storage and retrieval of historical assessment data
 * needed for Trajectory Score (TRS) and Peer Growth Score (PGS) calculations.
 *
 * For the PoC, we use in-memory storage with mock historical data.
 * In production, this would integrate with a database or Jira storage.
 */

import {
  HistoricalSnapshot,
  DimensionSnapshot,
  OutcomeSnapshot,
  EntityHistoricalData,
  PeerGrowthData,
  DimensionResult,
} from '../types/assessment';
import { OutcomeConfidenceResult } from '../types/outcomeConfidence';

// ============================================
// Storage Keys and Constants
// ============================================

const STORAGE_KEY_PREFIX = 'jira_health_history_';
const MIN_PERIODS_FOR_TRS = 2;
const MIN_PEERS_FOR_PGS = 5;

// ============================================
// In-Memory Storage (PoC)
// ============================================

// Mock historical snapshots (in production, this would be from database)
let mockSnapshots: Map<string, HistoricalSnapshot[]> = new Map();

/**
 * Initialize mock historical data for a team.
 * Creates 4 periods of historical data for realistic TRS/PGS calculation.
 */
export function initializeMockHistory(
  teamId: string,
  currentDimensions: DimensionResult[],
  currentOutcomes?: OutcomeConfidenceResult[]
): void {
  const periods = generateMockPeriods();
  const snapshots: HistoricalSnapshot[] = [];

  // Generate snapshots for each historical period
  periods.forEach((period, idx) => {
    const isOldest = idx === 0;
    const progressFactor = (idx + 1) / periods.length; // 0.25, 0.5, 0.75, 1.0

    const snapshot = generateMockSnapshot(
      teamId,
      period,
      currentDimensions,
      currentOutcomes,
      progressFactor,
      isOldest
    );
    snapshots.push(snapshot);
  });

  mockSnapshots.set(teamId, snapshots);
}

/**
 * Generate period labels for mock history (4 quarters back).
 */
function generateMockPeriods(): { label: string; startDate: string; endDate: string }[] {
  const now = new Date();
  const periods: { label: string; startDate: string; endDate: string }[] = [];

  for (let i = 3; i >= 0; i--) {
    const periodDate = new Date(now);
    periodDate.setMonth(periodDate.getMonth() - (i * 3));

    const quarter = Math.floor(periodDate.getMonth() / 3) + 1;
    const year = periodDate.getFullYear();

    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);

    periods.push({
      label: `${year}-Q${quarter}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }

  return periods;
}

/**
 * Generate a mock snapshot with realistic variance from current state.
 */
function generateMockSnapshot(
  teamId: string,
  period: { label: string; startDate: string; endDate: string },
  currentDimensions: DimensionResult[],
  currentOutcomes: OutcomeConfidenceResult[] | undefined,
  progressFactor: number,
  isOldest: boolean
): HistoricalSnapshot {
  // Generate dimension snapshots with variance
  const dimensionSnapshots: DimensionSnapshot[] = currentDimensions.map(dim => {
    // Historical scores should be lower than current (showing improvement)
    // Or higher (showing decline) - add some randomness
    const trend = Math.random() > 0.3 ? 'improving' : Math.random() > 0.5 ? 'stable' : 'declining';

    let historicalCss: number;
    const currentCss = dim.cssScore ?? dim.healthScore ?? 50;

    if (trend === 'improving') {
      // Historical CSS was lower, we've improved
      const improvement = (1 - progressFactor) * (10 + Math.random() * 15);
      historicalCss = Math.max(10, currentCss - improvement);
    } else if (trend === 'declining') {
      // Historical CSS was higher, we've declined
      const decline = (1 - progressFactor) * (5 + Math.random() * 10);
      historicalCss = Math.min(90, currentCss + decline);
    } else {
      // Stable - add small random variance
      historicalCss = currentCss + (Math.random() - 0.5) * 5;
    }

    // Generate indicator snapshots
    const indicatorSnapshots = dim.categories.flatMap(cat =>
      cat.indicators.map(ind => ({
        indicatorId: ind.id,
        value: ind.value * (0.8 + progressFactor * 0.4), // Scale by progress
        displayValue: ind.displayValue,
      }))
    );

    return {
      dimensionKey: dim.dimensionKey,
      cssScore: Math.round(historicalCss * 10) / 10,
      healthScore: Math.round(historicalCss * 10) / 10, // For old periods, healthScore ≈ cssScore
      indicators: indicatorSnapshots,
    };
  });

  // Generate outcome snapshots
  const outcomeSnapshots: OutcomeSnapshot[] = (currentOutcomes || []).map(outcome => {
    const currentCss = outcome.cssScore ?? outcome.finalScore ?? 50;
    const variance = (1 - progressFactor) * (Math.random() - 0.3) * 15;
    const historicalCss = Math.max(10, Math.min(90, currentCss - variance));

    return {
      outcomeId: outcome.id,
      cssScore: Math.round(historicalCss * 10) / 10,
      healthScore: Math.round(historicalCss * 10) / 10,
      dimensionContributions: outcome.contributions.map(c => ({
        dimensionKey: c.dimensionKey,
        cssScore: dimensionSnapshots.find(d => d.dimensionKey === c.dimensionKey)?.cssScore || 50,
        weight: c.weight,
      })),
    };
  });

  // Calculate overall scores
  const overallCss = dimensionSnapshots.length > 0
    ? dimensionSnapshots.reduce((sum, d) => sum + d.cssScore, 0) / dimensionSnapshots.length
    : 50;

  return {
    id: `snapshot_${teamId}_${period.label}`,
    teamId,
    timestamp: new Date(period.endDate).toISOString(),
    periodLabel: period.label,
    dateRange: {
      startDate: period.startDate,
      endDate: period.endDate,
    },
    dimensions: dimensionSnapshots,
    outcomes: outcomeSnapshots,
    overallHealthScore: Math.round(overallCss * 10) / 10,
    overallCssScore: Math.round(overallCss * 10) / 10,
  };
}

// ============================================
// Snapshot Storage Operations
// ============================================

/**
 * Save a new snapshot after an assessment.
 */
export function saveSnapshot(snapshot: HistoricalSnapshot): void {
  const existing = mockSnapshots.get(snapshot.teamId) || [];
  existing.push(snapshot);
  mockSnapshots.set(snapshot.teamId, existing);

  // Also persist to localStorage for session persistence
  try {
    const key = `${STORAGE_KEY_PREFIX}${snapshot.teamId}`;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    console.warn('Failed to persist snapshot to localStorage:', e);
  }
}

/**
 * Create a snapshot from current assessment results.
 */
export function createSnapshotFromAssessment(
  teamId: string,
  dimensions: DimensionResult[],
  outcomes?: OutcomeConfidenceResult[],
  periodLabel?: string
): HistoricalSnapshot {
  const now = new Date();
  const label = periodLabel || `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;

  const dimensionSnapshots: DimensionSnapshot[] = dimensions.map(dim => ({
    dimensionKey: dim.dimensionKey,
    cssScore: dim.cssScore ?? dim.healthScore ?? 50,
    healthScore: dim.healthScore ?? 50,
    indicators: dim.categories.flatMap(cat =>
      cat.indicators.map(ind => ({
        indicatorId: ind.id,
        value: ind.value,
        displayValue: ind.displayValue,
      }))
    ),
  }));

  const outcomeSnapshots: OutcomeSnapshot[] = (outcomes || []).map(outcome => ({
    outcomeId: outcome.id,
    cssScore: outcome.cssScore ?? outcome.finalScore ?? 50,
    healthScore: outcome.finalScore ?? 50,
    dimensionContributions: outcome.contributions.map(c => ({
      dimensionKey: c.dimensionKey,
      cssScore: dimensionSnapshots.find(d => d.dimensionKey === c.dimensionKey)?.cssScore || 50,
      weight: c.weight,
    })),
  }));

  const overallCss = dimensionSnapshots.length > 0
    ? dimensionSnapshots.reduce((sum, d) => sum + d.cssScore, 0) / dimensionSnapshots.length
    : 50;

  return {
    id: `snapshot_${teamId}_${Date.now()}`,
    teamId,
    timestamp: now.toISOString(),
    periodLabel: label,
    dateRange: {
      startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    },
    dimensions: dimensionSnapshots,
    outcomes: outcomeSnapshots,
    overallHealthScore: Math.round(overallCss * 10) / 10,
    overallCssScore: Math.round(overallCss * 10) / 10,
  };
}

/**
 * Get all snapshots for a team.
 */
export function getSnapshots(teamId: string): HistoricalSnapshot[] {
  return mockSnapshots.get(teamId) || [];
}

/**
 * Clear all snapshots for a team.
 */
export function clearSnapshots(teamId: string): void {
  mockSnapshots.delete(teamId);
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${teamId}`);
  } catch (e) {
    // Ignore localStorage errors
  }
}

// ============================================
// Historical Data Retrieval for TRS
// ============================================

/**
 * Get historical CSS values for a dimension (for TRS calculation).
 */
export function getDimensionHistory(
  teamId: string,
  dimensionKey: string
): EntityHistoricalData {
  const snapshots = getSnapshots(teamId);

  const cssHistory: number[] = [];
  const healthScoreHistory: number[] = [];
  const periodLabels: string[] = [];

  // Sort by timestamp (oldest first)
  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const snapshot of sorted) {
    const dimSnapshot = snapshot.dimensions.find(d => d.dimensionKey === dimensionKey);
    if (dimSnapshot) {
      cssHistory.push(dimSnapshot.cssScore);
      healthScoreHistory.push(dimSnapshot.healthScore);
      periodLabels.push(snapshot.periodLabel);
    }
  }

  return {
    cssHistory,
    healthScoreHistory,
    periodLabels,
    periodCount: cssHistory.length,
  };
}

/**
 * Get historical CSS values for an outcome (for TRS calculation).
 */
export function getOutcomeHistory(
  teamId: string,
  outcomeId: string
): EntityHistoricalData {
  const snapshots = getSnapshots(teamId);

  const cssHistory: number[] = [];
  const healthScoreHistory: number[] = [];
  const periodLabels: string[] = [];

  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const snapshot of sorted) {
    const outcomeSnapshot = snapshot.outcomes.find(o => o.outcomeId === outcomeId);
    if (outcomeSnapshot) {
      cssHistory.push(outcomeSnapshot.cssScore);
      healthScoreHistory.push(outcomeSnapshot.healthScore);
      periodLabels.push(snapshot.periodLabel);
    }
  }

  return {
    cssHistory,
    healthScoreHistory,
    periodLabels,
    periodCount: cssHistory.length,
  };
}

/**
 * Get overall health history for a team.
 */
export function getOverallHistory(teamId: string): EntityHistoricalData {
  const snapshots = getSnapshots(teamId);

  const cssHistory: number[] = [];
  const healthScoreHistory: number[] = [];
  const periodLabels: string[] = [];

  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const snapshot of sorted) {
    cssHistory.push(snapshot.overallCssScore);
    healthScoreHistory.push(snapshot.overallHealthScore);
    periodLabels.push(snapshot.periodLabel);
  }

  return {
    cssHistory,
    healthScoreHistory,
    periodLabels,
    periodCount: cssHistory.length,
  };
}

/**
 * Check if sufficient history exists for TRS calculation.
 */
export function hasSufficientHistoryForTRS(history: EntityHistoricalData): boolean {
  return history.periodCount >= MIN_PERIODS_FOR_TRS;
}

// ============================================
// Peer Data Retrieval for PGS
// ============================================

/**
 * Mock peer TRS values for PGS calculation.
 * In production, this would query peer teams' trajectory scores.
 */
export function getPeerTRSValues(
  dimensionKey: string,
  peerTeamIds: string[]
): PeerGrowthData {
  // Generate mock peer TRS values with realistic distribution
  // Centered around 50 (no change) with some variance
  const peerTRSValues: number[] = [];

  for (let i = 0; i < peerTeamIds.length; i++) {
    // Use seeded random for consistency
    const seed = dimensionKey.charCodeAt(0) + i;
    const pseudoRandom = Math.sin(seed * 9999) * 10000;
    const normalized = pseudoRandom - Math.floor(pseudoRandom);

    // Normal-ish distribution centered at 50
    const trs = 35 + normalized * 30; // Range roughly 35-65
    peerTRSValues.push(Math.round(trs * 10) / 10);
  }

  return {
    peerTRSValues,
    peerCount: peerTRSValues.length,
    minimumPeersRequired: MIN_PEERS_FOR_PGS,
    hasSufficientPeers: peerTRSValues.length >= MIN_PEERS_FOR_PGS,
  };
}

/**
 * Get peer growth data for outcome-level PGS.
 */
export function getOutcomePeerTRSValues(
  outcomeId: string,
  peerTeamIds: string[]
): PeerGrowthData {
  // Similar to dimension, generate mock peer TRS values
  const peerTRSValues: number[] = [];

  for (let i = 0; i < peerTeamIds.length; i++) {
    const seed = outcomeId.charCodeAt(0) + outcomeId.charCodeAt(1) + i;
    const pseudoRandom = Math.sin(seed * 9999) * 10000;
    const normalized = pseudoRandom - Math.floor(pseudoRandom);
    const trs = 35 + normalized * 30;
    peerTRSValues.push(Math.round(trs * 10) / 10);
  }

  return {
    peerTRSValues,
    peerCount: peerTRSValues.length,
    minimumPeersRequired: MIN_PEERS_FOR_PGS,
    hasSufficientPeers: peerTRSValues.length >= MIN_PEERS_FOR_PGS,
  };
}

// ============================================
// TRS Calculation Helpers
// ============================================

/**
 * Calculate TRS from historical CSS values.
 * TRS = 50 + (recentMean - earlyMean) scaled to 0-100.
 */
export function calculateTRSFromHistory(history: EntityHistoricalData): number | null {
  if (!hasSufficientHistoryForTRS(history)) {
    return null;
  }

  const { cssHistory } = history;
  const midpoint = Math.floor(cssHistory.length / 2);

  const earlyValues = cssHistory.slice(0, midpoint);
  const recentValues = cssHistory.slice(midpoint);

  const earlyMean = earlyValues.reduce((a, b) => a + b, 0) / earlyValues.length;
  const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;

  // Effect size: change in CSS score
  const effectSize = recentMean - earlyMean;

  // Scale: ±15 CSS points = 0-100 TRS range
  const trs = Math.max(5, Math.min(95, 50 + (effectSize / 15) * 50));

  return Math.round(trs * 10) / 10;
}

/**
 * Calculate PGS from peer TRS values.
 * PGS = percentile rank of team's TRS among peers.
 */
export function calculatePGSFromPeers(
  teamTRS: number,
  peerData: PeerGrowthData
): number | null {
  if (!peerData.hasSufficientPeers) {
    return null;
  }

  const { peerTRSValues } = peerData;
  const sorted = [...peerTRSValues].sort((a, b) => a - b);

  // Rank with continuity correction
  const rank = sorted.filter(v => v < teamTRS).length + 0.5;
  const rawPGS = (rank / sorted.length) * 100;

  // Apply shrinkage toward 50 for small groups
  const shrinkageAlpha = Math.min(1, (peerTRSValues.length - 1) / (peerTRSValues.length + 9));
  const shrunkPGS = shrinkageAlpha * rawPGS + (1 - shrinkageAlpha) * 50;

  return Math.round(shrunkPGS * 10) / 10;
}

// ============================================
// Debug View Helpers
// ============================================

/**
 * Get a summary of historical data for debug display.
 */
export function getHistorySummary(teamId: string): {
  snapshotCount: number;
  periodLabels: string[];
  oldestSnapshot: string | null;
  newestSnapshot: string | null;
  dimensionsTracked: number;
  outcomesTracked: number;
} {
  const snapshots = getSnapshots(teamId);

  if (snapshots.length === 0) {
    return {
      snapshotCount: 0,
      periodLabels: [],
      oldestSnapshot: null,
      newestSnapshot: null,
      dimensionsTracked: 0,
      outcomesTracked: 0,
    };
  }

  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return {
    snapshotCount: snapshots.length,
    periodLabels: sorted.map(s => s.periodLabel),
    oldestSnapshot: sorted[0].timestamp,
    newestSnapshot: sorted[sorted.length - 1].timestamp,
    dimensionsTracked: sorted[0].dimensions.length,
    outcomesTracked: sorted[0].outcomes.length,
  };
}

/**
 * Get detailed history for a specific dimension (for debug view).
 */
export function getDimensionHistoryDetails(
  teamId: string,
  dimensionKey: string
): Array<{
  period: string;
  timestamp: string;
  cssScore: number;
  healthScore: number;
  indicatorCount: number;
}> {
  const snapshots = getSnapshots(teamId);
  const details: Array<{
    period: string;
    timestamp: string;
    cssScore: number;
    healthScore: number;
    indicatorCount: number;
  }> = [];

  const sorted = [...snapshots].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  for (const snapshot of sorted) {
    const dimSnapshot = snapshot.dimensions.find(d => d.dimensionKey === dimensionKey);
    if (dimSnapshot) {
      details.push({
        period: snapshot.periodLabel,
        timestamp: snapshot.timestamp,
        cssScore: dimSnapshot.cssScore,
        healthScore: dimSnapshot.healthScore,
        indicatorCount: dimSnapshot.indicators.length,
      });
    }
  }

  return details;
}
