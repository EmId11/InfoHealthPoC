// Mock Pattern Detection Data Generator
// Generates realistic mock results for the 3 pattern-based lenses

import {
  AssessmentLensResults,
  CoverageLensData,
  LensResult,
  PatternDetectionResult,
  PatternEvidence,
  PatternConfidence,
  OverallSeverity,
} from '../types/patterns';
import {
  INTEGRITY_PATTERNS,
  TIMING_PATTERNS,
  BEHAVIORAL_PATTERNS,
} from './patternLibrary';
import { Pattern } from '../types/patterns';

// ============================================
// Evidence Generators
// ============================================

const MOCK_ISSUE_KEYS = [
  'PROJ-142', 'PROJ-187', 'PROJ-203', 'PROJ-218', 'PROJ-256',
  'PROJ-271', 'PROJ-289', 'PROJ-305', 'PROJ-319', 'PROJ-334',
  'PROJ-352', 'PROJ-367', 'PROJ-401', 'PROJ-415', 'PROJ-428',
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const EVIDENCE_TEMPLATES: Record<string, () => PatternEvidence[]> = {
  'priority-clustering': () => [
    { description: '68% of issues use "Medium" priority (Jira default)', dataPoints: [68, 15, 12, 5] },
    { issueKey: 'PROJ-142', description: 'Priority unchanged from default since creation', timestamp: '2024-09-15T10:30:00Z' },
    { description: 'Only 5% of issues use "Critical" or "Blocker" priority', dataPoints: [3, 2] },
  ],
  'placeholder-descriptions': () => [
    { issueKey: 'PROJ-203', description: 'Description contains only "TBD"', timestamp: '2024-10-02T14:20:00Z' },
    { issueKey: 'PROJ-271', description: 'Description is a copy of the Jira template with no additions', timestamp: '2024-10-08T09:15:00Z' },
    { issueKey: 'PROJ-334', description: 'Description says "TODO: add details"', timestamp: '2024-10-12T11:45:00Z' },
  ],
  'duplicate-descriptions': () => [
    { description: '4 issues share the exact same description text', dataPoints: [4] },
    { issueKey: 'PROJ-187', description: 'Identical to PROJ-218, PROJ-256, PROJ-289', timestamp: '2024-09-28T16:00:00Z' },
  ],
  'estimation-clustering': () => [
    { description: '54% of stories estimated as 3 points', dataPoints: [54, 22, 15, 6, 3] },
    { description: 'Point distribution: 1pt=6%, 2pt=15%, 3pt=54%, 5pt=22%, 8pt=3%' },
    { issueKey: 'PROJ-305', description: 'Complex feature estimated at 3 points (same as simple bug fix)', timestamp: '2024-10-05T13:30:00Z' },
  ],
  'default-value-fields': () => [
    { description: '42% of issues have priority = "Medium" (the Jira default)', dataPoints: [42] },
    { description: '31% of issues have component field empty (not explicitly set)', dataPoints: [31] },
  ],
  'empty-acceptance-criteria': () => [
    { issueKey: 'PROJ-218', description: 'AC field contains only "- [ ] " checkboxes with no text', timestamp: '2024-10-03T10:00:00Z' },
    { issueKey: 'PROJ-352', description: 'AC field has template headers but no content under them', timestamp: '2024-10-14T15:30:00Z' },
    { description: '8 issues have AC fields with template-only content' },
  ],
  'info-added-after-commitment': () => [
    { issueKey: 'PROJ-142', description: 'Estimates added 2 days after moving to In Progress', timestamp: '2024-09-17T09:00:00Z' },
    { issueKey: 'PROJ-256', description: 'Acceptance criteria written while issue was already in code review', timestamp: '2024-10-06T14:15:00Z' },
    { issueKey: 'PROJ-319', description: 'Priority changed from default after sprint started', timestamp: '2024-10-10T11:00:00Z' },
  ],
  'sprint-boundary-data-entry': () => [
    { description: '38% of field updates occurred on sprint day 1 or day 10', dataPoints: [22, 4, 3, 5, 6, 4, 3, 5, 8, 16] },
    { description: 'Sprint 14: 12 issues updated on final day vs 3/day average' },
  ],
  'late-estimation': () => [
    { issueKey: 'PROJ-187', description: 'Estimated 3 days after sprint start', timestamp: '2024-09-25T10:30:00Z' },
    { issueKey: 'PROJ-367', description: 'Points added after issue moved to In Progress', timestamp: '2024-10-15T16:45:00Z' },
    { description: '14% of stories received estimates after sprint commitment' },
  ],
  'post-decision-population': () => [
    { description: '24 field updates within 2 hours of sprint planning completion', dataPoints: [24] },
    { description: 'Priority and component fields updated post-planning for 8 issues' },
  ],
  'stale-then-sudden-update': () => [
    { issueKey: 'PROJ-289', description: 'No updates for 14 days, then 7 fields changed in one session', timestamp: '2024-10-08T17:00:00Z' },
    { issueKey: 'PROJ-401', description: '12 days dormant, then description + AC + estimate all added at once', timestamp: '2024-10-18T09:30:00Z' },
  ],
  'bulk-update-spike': () => [
    { description: '27 issues updated within 18 minutes on Oct 11', timestamp: '2024-10-11T16:42:00Z', dataPoints: [27] },
    { issueKey: 'PROJ-142', description: 'Part of bulk status transition batch', timestamp: '2024-10-11T16:45:00Z' },
    { description: 'Update pattern: 4 issues/min sustained for 7 minutes' },
  ],
  'single-actor-bulk-edit': () => [
    { description: 'User "jsmith" edited 14 issues in 12 minutes', timestamp: '2024-10-11T16:30:00Z', dataPoints: [14] },
    { issueKey: 'PROJ-256', description: 'Status, priority, and sprint field all changed by same user', timestamp: '2024-10-11T16:35:00Z' },
  ],
  'status-hopscotch': () => [
    { issueKey: 'PROJ-305', description: 'Moved directly from "To Do" to "Done" — no intermediate status', timestamp: '2024-10-07T11:00:00Z' },
    { issueKey: 'PROJ-415', description: 'Skipped "In Progress" and "In Review" statuses', timestamp: '2024-10-16T14:20:00Z' },
    { description: '6 issues completed without entering "In Progress" status' },
  ],
  'velocity-smoothing': () => [
    { description: 'Sprint velocity: 21, 22, 21, 23, 22, 21 (CV = 0.04)', dataPoints: [21, 22, 21, 23, 22, 21] },
    { description: 'Expected CV for teams this size: 0.15-0.25' },
  ],
  'scope-creep-masking': () => [
    { description: '5 items added to Sprint 14 mid-sprint without scope note', dataPoints: [5] },
    { issueKey: 'PROJ-367', description: 'Added to active sprint on day 7 of 10', timestamp: '2024-10-15T10:00:00Z' },
  ],
  'end-of-period-cleanup': () => [
    { description: '42% of status transitions to "Done" occurred in final 2 days of sprint', dataPoints: [42] },
    { description: 'Sprint 14: 11 items closed on day 9-10 vs 2/day average for days 1-8' },
    { issueKey: 'PROJ-428', description: 'Closed on final sprint day with no comments or updates', timestamp: '2024-10-18T17:55:00Z' },
  ],
  'ghost-work': () => [
    { issueKey: 'PROJ-334', description: 'Created and completed with zero comments and zero field changes', timestamp: '2024-10-12T09:00:00Z' },
    { issueKey: 'PROJ-428', description: 'No activity trail between creation and "Done"', timestamp: '2024-10-18T17:00:00Z' },
  ],
};

const RECOMMENDATION_MAP: Record<string, string> = {
  'priority-clustering': 'Review your priority scheme with the team. Consider whether fewer priority levels with clearer definitions would drive better triage decisions.',
  'placeholder-descriptions': 'Add a definition of ready that requires meaningful descriptions. Consider using description templates with required sections rather than free-form text.',
  'duplicate-descriptions': 'Investigate whether duplicate descriptions indicate duplicate work items. Consider using Jira automation to flag issues with similar descriptions.',
  'estimation-clustering': 'Hold an estimation calibration session. Compare past estimates to actuals and discuss reference stories for each point value.',
  'default-value-fields': 'Audit which fields are typically left at defaults. Either make them required with meaningful options or remove them to reduce noise.',
  'empty-acceptance-criteria': 'Strengthen your definition of ready to require substantive acceptance criteria. Block sprint entry for stories without actionable AC.',
  'info-added-after-commitment': 'Ensure key fields are populated before sprint commitment. Add a pre-sprint checklist for estimates, acceptance criteria, and priority.',
  'sprint-boundary-data-entry': 'Encourage real-time updates during the sprint. Consider brief daily check-ins where the team updates their Jira items.',
  'late-estimation': 'Require estimates before sprint planning. Track estimation timing as a team health metric in retrospectives.',
  'post-decision-population': 'Prepare Jira data before planning events. Schedule a data readiness review 1-2 days before sprint planning.',
  'stale-then-sudden-update': 'Set up automated reminders for issues with no updates after 5+ days. Discuss stale items in daily standups.',
  'bulk-update-spike': 'Investigate what triggers bulk updates. If they happen before reviews, ensure data is maintained continuously rather than in cleanup batches.',
  'single-actor-bulk-edit': 'Distribute Jira maintenance across the team. If one person is always "fixing" data, the root cause is that the team is not maintaining it.',
  'status-hopscotch': 'Review your workflow to ensure intermediate statuses are useful. If they are, enforce transitions. If teams consistently skip them, simplify the workflow.',
  'velocity-smoothing': 'Track velocity with explicit acknowledgment of natural variation. Consistent velocity should prompt curiosity, not celebration.',
  'scope-creep-masking': 'Make sprint scope changes visible. Use sprint scope notes and track added/removed items as a sprint metric.',
  'end-of-period-cleanup': 'Investigate why items cluster at sprint end. Are they genuinely finishing, or being closed prematurely? Track items reopened after sprint close.',
  'ghost-work': 'Establish minimum documentation expectations. At minimum, a comment or description update should exist between creation and completion.',
};

const SUMMARY_MAP: Record<string, (affected: number, total: number) => string> = {
  'priority-clustering': (a, t) => `${Math.round(a/t*100)}% of issues use the same priority value, suggesting priority is not meaningfully differentiated.`,
  'placeholder-descriptions': (a, t) => `${a} of ${t} issues have descriptions containing only placeholder text like "TBD" or template content.`,
  'duplicate-descriptions': (a, t) => `${a} issues share identical or near-identical description text with at least one other issue.`,
  'estimation-clustering': (a, t) => `${Math.round(a/t*100)}% of estimated stories use the same point value, suggesting default rather than considered estimation.`,
  'default-value-fields': (a, t) => `${a} of ${t} issues have key fields left at Jira system defaults.`,
  'empty-acceptance-criteria': (a, t) => `${a} issues have acceptance criteria that contain only empty templates or checklists with no content.`,
  'info-added-after-commitment': (a, t) => `${a} of ${t} issues had key fields populated only after moving to "In Progress."`,
  'sprint-boundary-data-entry': (a, t) => `${Math.round(a/t*100)}% of field updates occurred on the first or last day of a sprint.`,
  'late-estimation': (a, t) => `${a} stories received estimates after the sprint had already started.`,
  'post-decision-population': (a, t) => `${a} field updates occurred within hours after planning events rather than before them.`,
  'stale-then-sudden-update': (a, t) => `${a} issues went dormant for 10+ days before receiving a burst of updates in a single session.`,
  'bulk-update-spike': (a, t) => `${a} issues were updated within a 30-minute window, indicating a bulk cleanup session.`,
  'single-actor-bulk-edit': (a, t) => `One team member edited ${a} issues in rapid succession.`,
  'status-hopscotch': (a, t) => `${a} issues jumped directly from "To Do" to "Done" without passing through intermediate statuses.`,
  'velocity-smoothing': (_a, _t) => `Sprint velocity shows unusually low variation (CV < 0.05), suggesting possible point management.`,
  'scope-creep-masking': (a, _t) => `${a} items were added to active sprints without visible scope adjustment.`,
  'end-of-period-cleanup': (a, t) => `${Math.round(a/t*100)}% of status transitions to "Done" occurred in the final 2 days of the sprint.`,
  'ghost-work': (a, t) => `${a} of ${t} completed issues have zero comments or field updates between creation and completion.`,
};

// ============================================
// Mock Detection Result Generator
// ============================================

function generateMockDetectionResult(pattern: Pattern, forceDetected?: boolean): PatternDetectionResult {
  // Detection probability varies by severity
  const detectionProbability = pattern.severity === 'critical' ? 0.35 :
    pattern.severity === 'warning' ? 0.45 : 0.30;

  const detected = forceDetected !== undefined ? forceDetected : Math.random() < detectionProbability;

  const totalIssuesScanned = randomInt(45, 120);
  const affectedIssueCount = detected ? randomInt(3, Math.floor(totalIssuesScanned * 0.4)) : 0;

  const confidence: PatternConfidence = detected
    ? (affectedIssueCount > totalIssuesScanned * 0.2 ? 'high' : affectedIssueCount > totalIssuesScanned * 0.1 ? 'medium' : 'low')
    : 'high';

  const evidenceGenerator = EVIDENCE_TEMPLATES[pattern.id];
  const evidence = detected && evidenceGenerator ? evidenceGenerator() : [];

  const summaryFn = SUMMARY_MAP[pattern.id];
  const summary = detected && summaryFn
    ? summaryFn(affectedIssueCount, totalIssuesScanned)
    : `No instances of ${pattern.name.toLowerCase()} were detected in the scanned issues.`;

  return {
    patternId: pattern.id,
    detected,
    severity: pattern.severity,
    confidence,
    summary,
    evidence,
    affectedIssueCount,
    totalIssuesScanned,
    recommendation: RECOMMENDATION_MAP[pattern.id] || 'Review the flagged patterns with your team.',
  };
}

function determineOverallSeverity(results: PatternDetectionResult[]): OverallSeverity {
  const detected = results.filter(r => r.detected);
  if (detected.some(r => r.severity === 'critical')) return 'critical';
  if (detected.some(r => r.severity === 'warning')) return 'warning';
  return 'clean';
}

function generateLensResult(
  lens: 'integrity' | 'timing' | 'behavioral',
  patterns: Pattern[],
): LensResult {
  const results = patterns.map(p => generateMockDetectionResult(p));
  const detected = results.filter(r => r.detected);

  return {
    lens,
    patternsChecked: patterns.length,
    patternsDetected: detected.length,
    results,
    overallSeverity: determineOverallSeverity(results),
  };
}

// ============================================
// Public API
// ============================================

/**
 * Generate mock pattern detection results for all 3 pattern-based lenses.
 * The coverage lens data is derived from existing dimension scores.
 */
export function generateMockPatternResults(coverageScore?: number): AssessmentLensResults {
  const coverage: CoverageLensData = {
    coveragePercent: coverageScore ?? Math.round(55 + Math.random() * 30),
    totalFields: randomInt(12, 20),
    populatedFields: 0,
  };
  coverage.populatedFields = Math.round(coverage.totalFields * coverage.coveragePercent / 100);

  return {
    coverage,
    integrity: generateLensResult('integrity', INTEGRITY_PATTERNS),
    timing: generateLensResult('timing', TIMING_PATTERNS),
    behavioral: generateLensResult('behavioral', BEHAVIORAL_PATTERNS),
  };
}
