// Pattern Library — All predefined pattern checks for the Data Trust Assessment
// These are the "checks" the system runs across 3 pattern-based lenses.

import { Pattern } from '../types/patterns';

// ============================================
// Data Integrity Patterns (6)
// ============================================

export const INTEGRITY_PATTERNS: Pattern[] = [
  {
    id: 'priority-clustering',
    name: 'Priority Clustering',
    description: 'Overuse of a single priority value (e.g., >60% of issues set to "Medium").',
    whyItMatters: 'Suggests priority is not meaningfully assigned. When most issues share the same priority, it provides no signal for triage or sequencing decisions.',
    lens: 'integrity',
    severity: 'warning',
  },
  {
    id: 'placeholder-descriptions',
    name: 'Placeholder Descriptions',
    description: 'Descriptions containing boilerplate or placeholder text ("TBD", "TODO", template-only content, empty beyond a heading).',
    whyItMatters: 'The field is "filled" but not "meaningful." Coverage metrics look good while the actual information is absent, creating a false sense of data quality.',
    lens: 'integrity',
    severity: 'warning',
  },
  {
    id: 'duplicate-descriptions',
    name: 'Duplicate Descriptions',
    description: 'Multiple issues sharing identical or near-identical description text.',
    whyItMatters: 'Copy-paste descriptions suggest no real thought went into defining the work. Each issue should describe a distinct piece of work with specific context.',
    lens: 'integrity',
    severity: 'info',
  },
  {
    id: 'estimation-clustering',
    name: 'Estimation Clustering',
    description: 'Story points heavily clustered on a single value (e.g., >50% of stories are "3").',
    whyItMatters: 'Suggests "default" rather than real estimation. When everything is a 3, the team is not differentiating between small and large work, making velocity meaningless for forecasting.',
    lens: 'integrity',
    severity: 'warning',
  },
  {
    id: 'default-value-fields',
    name: 'Default Value Fields',
    description: 'Fields left at system defaults (e.g., priority = "Medium" when it is the Jira default).',
    whyItMatters: 'Populated does not mean intentional. Fields left at defaults inflate completeness scores while providing no actual information about the work.',
    lens: 'integrity',
    severity: 'info',
  },
  {
    id: 'empty-acceptance-criteria',
    name: 'Empty Acceptance Criteria',
    description: 'Acceptance criteria field exists but contains only a template or checklist with no content filled in.',
    whyItMatters: 'Template-only acceptance criteria give the illusion of definition-of-done without providing actionable criteria. Developers cannot validate their work against empty templates.',
    lens: 'integrity',
    severity: 'critical',
  },
];

// ============================================
// Timing Patterns (5)
// ============================================

export const TIMING_PATTERNS: Pattern[] = [
  {
    id: 'info-added-after-commitment',
    name: 'Info Added After Commitment',
    description: 'Key fields (estimates, acceptance criteria, priority) populated after the issue moved to "In Progress."',
    whyItMatters: 'The data did not inform the commitment. If estimates are added after work starts, the sprint plan was made without knowing the size of the work.',
    lens: 'timing',
    severity: 'critical',
  },
  {
    id: 'sprint-boundary-data-entry',
    name: 'Sprint Boundary Data Entry',
    description: 'A significant share of field updates occur on the first or last day of a sprint.',
    whyItMatters: 'Suggests retroactive bookkeeping rather than real-time tracking. Data entered at sprint boundaries was not available when decisions were made during the sprint.',
    lens: 'timing',
    severity: 'warning',
  },
  {
    id: 'late-estimation',
    name: 'Late Estimation',
    description: 'Estimates added after sprint start or after work has begun.',
    whyItMatters: 'The plan was made without knowing the size of the work. Late estimates are often fitted to actual effort rather than being genuine predictions, undermining forecasting.',
    lens: 'timing',
    severity: 'warning',
  },
  {
    id: 'post-decision-population',
    name: 'Post-Decision Population',
    description: 'Field updates cluster after known planning events (sprint planning, quarterly reviews) rather than before them.',
    whyItMatters: 'Data that arrives after decisions are made cannot inform those decisions. If fields are updated after planning, the planning was done without this information.',
    lens: 'timing',
    severity: 'warning',
  },
  {
    id: 'stale-then-sudden-update',
    name: 'Stale Then Sudden Update',
    description: 'Issues with no updates for 10+ days followed by a burst of 5+ field changes in one session.',
    whyItMatters: 'Suggests "catching up" rather than continuous tracking. The issue was not being maintained in real-time, and the burst update is retroactive record-keeping.',
    lens: 'timing',
    severity: 'info',
  },
];

// ============================================
// Behavioral Patterns (7)
// ============================================

export const BEHAVIORAL_PATTERNS: Pattern[] = [
  {
    id: 'bulk-update-spike',
    name: 'Bulk Update Spike',
    description: 'Large number of issues (>20) updated within a short window (<30 min).',
    whyItMatters: 'Classic "cleanup" behaviour that distorts metrics. Bulk updates often happen before reviews or reporting, making the data look better without reflecting actual work state.',
    lens: 'behavioral',
    severity: 'critical',
  },
  {
    id: 'single-actor-bulk-edit',
    name: 'Single-Actor Bulk Edit',
    description: 'One person editing 10+ issues in rapid succession.',
    whyItMatters: 'Often a lead "fixing" data before a review. When one person updates many issues at once, the changes likely reflect desired state rather than observed state.',
    lens: 'behavioral',
    severity: 'warning',
  },
  {
    id: 'status-hopscotch',
    name: 'Status Hopscotch',
    description: 'Issues jumping directly from "To Do" to "Done" skipping intermediate statuses.',
    whyItMatters: 'Work happened but was not tracked through the workflow. The issue history does not reflect the actual process, making cycle time and flow metrics unreliable.',
    lens: 'behavioral',
    severity: 'warning',
  },
  {
    id: 'velocity-smoothing',
    name: 'Velocity Smoothing',
    description: 'Suspiciously consistent sprint velocity (low coefficient of variation across sprints).',
    whyItMatters: 'May indicate point manipulation to hit targets. Real velocity naturally varies; consistent numbers suggest estimates or scope are being adjusted to match expectations.',
    lens: 'behavioral',
    severity: 'info',
  },
  {
    id: 'scope-creep-masking',
    name: 'Scope Creep Masking',
    description: 'Items added to an active sprint without sprint scope being visibly adjusted.',
    whyItMatters: 'Hides the true commitment. When scope increases are not visible, stakeholders believe the original plan is intact while the team is actually doing more work.',
    lens: 'behavioral',
    severity: 'warning',
  },
  {
    id: 'end-of-period-cleanup',
    name: 'End-of-Period Cleanup',
    description: 'Disproportionate number of status transitions and closures in the final 2 days of a sprint or quarter.',
    whyItMatters: 'Suggests rushed closures or gaming of completion metrics. Work completed at the last minute may not meet quality standards, or items may be closed prematurely.',
    lens: 'behavioral',
    severity: 'warning',
  },
  {
    id: 'ghost-work',
    name: 'Ghost Work',
    description: 'Issues moved to "Done" with zero comments, zero field updates between creation and completion.',
    whyItMatters: 'No trail of work exists. These issues leave no evidence of how the work was done, making it impossible to learn from them or verify they were completed properly.',
    lens: 'behavioral',
    severity: 'info',
  },
];

// ============================================
// Combined Pattern Library
// ============================================

export const ALL_PATTERNS: Pattern[] = [
  ...INTEGRITY_PATTERNS,
  ...TIMING_PATTERNS,
  ...BEHAVIORAL_PATTERNS,
];

export const getPatternById = (id: string): Pattern | undefined =>
  ALL_PATTERNS.find(p => p.id === id);

export const getPatternsForLens = (lens: 'integrity' | 'timing' | 'behavioral'): Pattern[] =>
  ALL_PATTERNS.filter(p => p.lens === lens);
