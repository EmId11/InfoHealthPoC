// Impact Timeline Configurations
// Maps play categories and specific plays to their expected impact timelines

import { ImpactTimelineClass, ImpactTimelineConfig } from '../types/impactMeasurement';
import { PlayCategory } from '../types/playbook';
import { InterventionType } from '../types/improvementPlan';

// ============================================
// Timeline Class Configurations
// ============================================

/**
 * Default configuration for each timeline class
 */
export const TIMELINE_CONFIGS: Record<ImpactTimelineClass, ImpactTimelineConfig> = {
  immediate: {
    class: 'immediate',
    minDaysAfterCompletion: 7,
    maxDaysAfterCompletion: 21,
    optimalAssessmentDays: 14,
    displayLabel: 'Immediate (1-2 weeks)',
    rationale: 'Quick-wins and simple tooling changes show impact within days as teams adopt new practices.',
  },
  'short-term': {
    class: 'short-term',
    minDaysAfterCompletion: 14,
    maxDaysAfterCompletion: 35,
    optimalAssessmentDays: 21,
    displayLabel: 'Short-term (2-4 weeks)',
    rationale: 'Behavioral changes and process adjustments need 2-4 weeks to become habits and show measurable impact.',
  },
  'medium-term': {
    class: 'medium-term',
    minDaysAfterCompletion: 30,
    maxDaysAfterCompletion: 90,
    optimalAssessmentDays: 45,
    displayLabel: 'Medium-term (1-3 months)',
    rationale: 'Process improvements need time to mature and for teams to optimize their use of new practices.',
  },
  'long-term': {
    class: 'long-term',
    minDaysAfterCompletion: 60,
    maxDaysAfterCompletion: 180,
    optimalAssessmentDays: 90,
    displayLabel: 'Long-term (3-6 months)',
    rationale: 'Culture changes require sustained effort and time for new mindsets to take root and show measurable results.',
  },
  'very-long-term': {
    class: 'very-long-term',
    minDaysAfterCompletion: 120,
    maxDaysAfterCompletion: 365,
    optimalAssessmentDays: 180,
    displayLabel: 'Very long-term (6+ months)',
    rationale: 'Deep cultural shifts and organizational transformation require extended time to achieve lasting change.',
  },
};

// ============================================
// Default Timeline by Category
// ============================================

/**
 * Default timeline class based on play category
 * Used when no specific override exists for a play
 */
export const CATEGORY_DEFAULT_TIMELINES: Record<PlayCategory, ImpactTimelineClass> = {
  'quick-win': 'immediate',
  'process': 'short-term',
  'culture': 'long-term',
  'tooling': 'short-term',
};

/**
 * Default timeline class based on intervention type
 * Secondary lookup when category doesn't match
 */
export const INTERVENTION_DEFAULT_TIMELINES: Record<InterventionType, ImpactTimelineClass> = {
  'process': 'short-term',
  'culture': 'long-term',
  'tooling': 'short-term',
};

// ============================================
// Per-Play Timeline Overrides
// ============================================

/**
 * Specific timeline overrides for individual plays
 * When a play's expected impact timeline differs from its category default
 */
export const PLAY_TIMELINE_OVERRIDES: Record<string, ImpactTimelineClass> = {
  // Invisible Work (iw) - 6 actions
  'iw-action-1': 'immediate',     // Create Catchall Issue Type - tooling config
  'iw-action-2': 'immediate',     // Daily Work Log Reminder - behavioral trigger
  'iw-action-3': 'short-term',    // Standup Capture Ritual - process change
  'iw-action-4': 'short-term',    // Weekly Invisible Work Audit - process change
  'iw-action-5': 'long-term',     // No Ghost Work Agreement - culture shift
  'iw-action-6': 'short-term',    // Time Tracking Integration - tooling with adoption

  // Issue Hygiene (ih) - 6 actions
  'ih-action-1': 'immediate',     // Required Fields Setup - tooling config
  'ih-action-2': 'immediate',     // Issue Templates - tooling config
  'ih-action-3': 'short-term',    // Quality Gate Reviews - process change
  'ih-action-4': 'medium-term',   // Definition of Ready - process maturity
  'ih-action-5': 'long-term',     // Issue Quality Ownership - culture shift
  'ih-action-6': 'short-term',    // Automation Rules - tooling with adoption

  // Definition Clarity (df) - 6 actions
  'df-action-1': 'immediate',     // Acceptance Criteria Template - tooling config
  'df-action-2': 'short-term',    // Checklist Automation - tooling with behavior
  'df-action-3': 'short-term',    // Three Amigos Sessions - process change
  'df-action-4': 'medium-term',   // Story Mapping Workshops - process maturity
  'df-action-5': 'long-term',     // Collaborative Refinement Culture - culture shift
  'df-action-6': 'short-term',    // AI-Assisted Requirements - tooling with adoption

  // Estimation Coverage (ec) - 6 actions
  'ec-action-1': 'immediate',     // Story Point Reference Guide - tooling config
  'ec-action-2': 'short-term',    // Planning Poker Sessions - process + behavior
  'ec-action-3': 'medium-term',   // Estimation Accuracy Tracking - process maturity
  'ec-action-4': 'medium-term',   // Relative Sizing Workshops - process + skill
  'ec-action-5': 'long-term',     // No-Blame Estimation Culture - culture shift
  'ec-action-6': 'short-term',    // AI Estimation Assistance - tooling with adoption

  // Sprint Commitment (sc) - 6 actions
  'sc-action-1': 'immediate',     // Sprint Goal Template - tooling config
  'sc-action-2': 'short-term',    // Capacity Planning Worksheet - process + behavior
  'sc-action-3': 'medium-term',   // Sprint Health Metrics - process maturity
  'sc-action-4': 'medium-term',   // Commitment vs Forecast - process evolution
  'sc-action-5': 'long-term',     // Sustainable Pace Culture - culture shift
  'sc-action-6': 'short-term',    // Sprint Planning Automation - tooling with adoption

  // In-Sprint Tracking Changes (itc) - 6 actions
  'itc-action-1': 'immediate',    // Scope Change Label - tooling config
  'itc-action-2': 'short-term',   // Mid-Sprint Review Checkpoint - process change
  'itc-action-3': 'medium-term',  // Scope Change Protocol - process maturity
  'itc-action-4': 'medium-term',  // Impact Assessment Practice - process maturity
  'itc-action-5': 'long-term',    // Change Resilience Culture - culture shift
  'itc-action-6': 'short-term',   // Automated Scope Alerts - tooling with adoption

  // Blocker Management (bm) - 6 actions
  'bm-action-1': 'immediate',     // Blocker Issue Type - tooling config
  'bm-action-2': 'short-term',    // Blocker Escalation Path - process + behavior
  'bm-action-3': 'medium-term',   // Daily Blocker Triage - process maturity
  'bm-action-4': 'medium-term',   // Blocker Prevention Analysis - process maturity
  'bm-action-5': 'long-term',     // Proactive Unblocking Culture - culture shift
  'bm-action-6': 'short-term',    // Blocker Detection Automation - tooling with adoption

  // Work Health (wh) - 6 actions
  'wh-action-1': 'immediate',     // WIP Limits Configuration - tooling config
  'wh-action-2': 'short-term',    // Flow Metrics Dashboard - tooling + behavior
  'wh-action-3': 'medium-term',   // Batch Size Reduction - process change
  'wh-action-4': 'medium-term',   // Pull vs Push System - process evolution
  'wh-action-5': 'long-term',     // Flow Efficiency Culture - culture shift
  'wh-action-6': 'short-term',    // Flow Automation - tooling with adoption

  // Status Hygiene (sh) - 6 actions
  'sh-action-1': 'immediate',     // Simplified Workflow - tooling config
  'sh-action-2': 'short-term',    // Status Update Reminders - behavioral trigger
  'sh-action-3': 'medium-term',   // Status Sync Ceremonies - process change
  'sh-action-4': 'medium-term',   // Lead Time Optimization - process maturity
  'sh-action-5': 'long-term',     // Real-Time Update Culture - culture shift
  'sh-action-6': 'short-term',    // Status Transition Rules - tooling with adoption

  // Team Collaboration (tc) - 6 actions
  'tc-action-1': 'immediate',     // @Mention Guidelines - quick behavioral change
  'tc-action-2': 'short-term',    // Pair Programming Setup - process + behavior
  'tc-action-3': 'medium-term',   // Cross-Functional Reviews - process change
  'tc-action-4': 'medium-term',   // Knowledge Sharing Sessions - process maturity
  'tc-action-5': 'long-term',     // Collective Code Ownership - culture shift
  'tc-action-6': 'short-term',    // Collaboration Automation - tooling with adoption

  // Assignment Ownership (ao) - 6 actions
  'ao-action-1': 'immediate',     // Assignee Required Rule - tooling config
  'ao-action-2': 'short-term',    // Assignment Guidelines - process + behavior
  'ao-action-3': 'medium-term',   // Ownership Transfer Protocol - process change
  'ao-action-4': 'medium-term',   // Load Balancing Practice - process maturity
  'ao-action-5': 'long-term',     // Accountability Culture - culture shift
  'ao-action-6': 'short-term',    // Auto-Assignment Rules - tooling with adoption

  // Customer Focus (cfu) - 2 actions
  'cfu-action-1': 'long-term',    // Customer Empathy Sessions - culture shift
  'cfu-action-2': 'short-term',   // Customer Impact Labels - tooling + behavior

  // Collaboration Balance (cb) - 1 action
  'cb-action-1': 'medium-term',   // Collaboration Time Budgets - process change

  // Cycle Efficiency (ce) - 2 actions
  'ce-action-1': 'immediate',     // Cycle Time Dashboard - tooling config
  'ce-action-2': 'medium-term',   // Flow Optimization Sessions - process maturity

  // Backlog Depth (bd) - 2 actions
  'bd-action-1': 'short-term',    // Backlog Grooming Cadence - process change
  'bd-action-2': 'medium-term',   // Backlog Health Metrics - process maturity
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get the timeline configuration for a specific play
 * Uses overrides first, then falls back to category defaults
 */
export function getTimelineForPlay(
  playId: string,
  category: PlayCategory
): ImpactTimelineConfig {
  // Check for specific override
  const overrideClass = PLAY_TIMELINE_OVERRIDES[playId];
  if (overrideClass) {
    return TIMELINE_CONFIGS[overrideClass];
  }

  // Fall back to category default
  const defaultClass = CATEGORY_DEFAULT_TIMELINES[category];
  return TIMELINE_CONFIGS[defaultClass];
}

/**
 * Get the timeline class for a play
 */
export function getTimelineClassForPlay(
  playId: string,
  category: PlayCategory
): ImpactTimelineClass {
  return PLAY_TIMELINE_OVERRIDES[playId] || CATEGORY_DEFAULT_TIMELINES[category];
}

/**
 * Calculate the assessment window dates for a play
 */
export function calculateAssessmentWindow(
  playId: string,
  category: PlayCategory,
  completionDate: Date
): { opensAt: Date; closesAt: Date; optimalDate: Date } {
  const config = getTimelineForPlay(playId, category);

  const opensAt = new Date(completionDate);
  opensAt.setDate(opensAt.getDate() + config.minDaysAfterCompletion);

  const closesAt = new Date(completionDate);
  closesAt.setDate(closesAt.getDate() + config.maxDaysAfterCompletion);

  const optimalDate = new Date(completionDate);
  optimalDate.setDate(optimalDate.getDate() + config.optimalAssessmentDays);

  return { opensAt, closesAt, optimalDate };
}

/**
 * Check if a play is within its assessment window
 */
export function isInAssessmentWindow(
  playId: string,
  category: PlayCategory,
  completionDate: Date,
  currentDate: Date = new Date()
): boolean {
  const window = calculateAssessmentWindow(playId, category, completionDate);
  return currentDate >= window.opensAt && currentDate <= window.closesAt;
}

/**
 * Check if assessment window has opened for a play
 */
export function hasAssessmentWindowOpened(
  playId: string,
  category: PlayCategory,
  completionDate: Date,
  currentDate: Date = new Date()
): boolean {
  const window = calculateAssessmentWindow(playId, category, completionDate);
  return currentDate >= window.opensAt;
}

/**
 * Get days remaining until assessment window opens
 */
export function getDaysUntilAssessmentWindow(
  playId: string,
  category: PlayCategory,
  completionDate: Date,
  currentDate: Date = new Date()
): number {
  const window = calculateAssessmentWindow(playId, category, completionDate);
  const diff = window.opensAt.getTime() - currentDate.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get all plays grouped by timeline class
 */
export function getPlaysByTimelineClass(): Record<ImpactTimelineClass, string[]> {
  const result: Record<ImpactTimelineClass, string[]> = {
    immediate: [],
    'short-term': [],
    'medium-term': [],
    'long-term': [],
    'very-long-term': [],
  };

  for (const [playId, timelineClass] of Object.entries(PLAY_TIMELINE_OVERRIDES)) {
    result[timelineClass].push(playId);
  }

  return result;
}

/**
 * Get summary statistics for timeline classifications
 */
export function getTimelineClassSummary(): Array<{
  class: ImpactTimelineClass;
  count: number;
  percentage: number;
}> {
  const byClass = getPlaysByTimelineClass();
  const total = Object.values(byClass).reduce((sum, arr) => sum + arr.length, 0);

  return Object.entries(byClass).map(([cls, plays]) => ({
    class: cls as ImpactTimelineClass,
    count: plays.length,
    percentage: Math.round((plays.length / total) * 100),
  }));
}
