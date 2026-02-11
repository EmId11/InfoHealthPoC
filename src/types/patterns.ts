// Pattern-based Data Trust Assessment Types
// Types for the 4-lens assessment model: Coverage, Integrity, Timing, Behavioral

// ============================================
// Core Pattern Types
// ============================================

export type PatternLens = 'integrity' | 'timing' | 'behavioral';
export type LensType = 'coverage' | PatternLens;
export type PatternSeverity = 'critical' | 'warning' | 'info';
export type PatternConfidence = 'high' | 'medium' | 'low';
export type OverallSeverity = 'critical' | 'warning' | 'clean';

/**
 * Definition of a pattern check that the system runs.
 * These are static definitions — the "what we look for".
 */
export interface Pattern {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  lens: PatternLens;
  severity: PatternSeverity;
}

/**
 * Evidence supporting a pattern detection — specific examples from the data.
 */
export interface PatternEvidence {
  issueKey?: string;
  description: string;
  timestamp?: string;
  dataPoints?: number[];
}

/**
 * Result of running a single pattern check against actual data.
 */
export interface PatternDetectionResult {
  patternId: string;
  detected: boolean;
  severity: PatternSeverity;
  confidence: PatternConfidence;
  summary: string;
  evidence: PatternEvidence[];
  affectedIssueCount: number;
  totalIssuesScanned: number;
  recommendation: string;
}

/**
 * Aggregated results for a single lens (integrity, timing, or behavioral).
 */
export interface LensResult {
  lens: LensType;
  patternsChecked: number;
  patternsDetected: number;
  results: PatternDetectionResult[];
  overallSeverity: OverallSeverity;
}

/**
 * Coverage lens data — maps to existing field completeness metrics.
 */
export interface CoverageLensData {
  coveragePercent: number;
  totalFields: number;
  populatedFields: number;
}

/**
 * Combined results for all 4 lenses.
 */
export interface AssessmentLensResults {
  coverage: CoverageLensData;
  integrity: LensResult;
  timing: LensResult;
  behavioral: LensResult;
}
