// Improvement Plan Types
// Types for the Improvement Plan feature - dedicated tab for tracking improvement plays

import { PlayCategory, EffortLevel, ImpactLevel } from './playbook';
import {
  ImpactTimelineClass,
  PlayImpactMeasurement,
  PlanImpactSummary,
} from './impactMeasurement';

// ============================================
// Urgency & Intervention Types
// ============================================

/**
 * Priority level - calculated from effort/impact
 * - 'high': High impact with low/medium effort - do these first
 * - 'medium': Medium impact OR high effort + high impact
 * - 'low': Low impact - defer these
 */
export type PlayPriority = 'high' | 'medium' | 'low';

/**
 * Intervention type - pure classification of what kind of change this is
 * (Excludes 'quick-win' which is now represented as urgency='now')
 */
export type InterventionType = 'process' | 'culture' | 'tooling';

// ============================================
// Optimization Targets
// ============================================

/**
 * Type of optimization target - can be either an outcome area or a dimension
 */
export type OptimizationTargetType = 'outcome' | 'dimension';

/**
 * An optimization target selected for the improvement plan
 */
export interface OptimizationTarget {
  type: OptimizationTargetType;
  id: string; // outcomeId (e.g., 'planning') or dimensionKey (e.g., 'estimationCoverage')
  name: string; // Display name
  currentScore: number; // 0-100 score at time of selection
}

// ============================================
// Tasks within Plays
// ============================================

/**
 * Status of a task within a play
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed';

/**
 * A task within a play in the improvement plan
 */
export interface PlanTask {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp when completed
}

// ============================================
// Plays in the Plan
// ============================================

/**
 * Status of a play in the improvement plan
 * - backlog: In prioritized list, not yet scheduled for work
 * - do-next: Scheduled to be done, in the "Do Next" column
 * - in-progress: Currently being worked on
 * - completed: Done
 * - skipped: Decided not to do
 */
export type PlayStatus = 'backlog' | 'do-next' | 'in-progress' | 'completed' | 'skipped';

/**
 * A play that's part of the improvement plan
 */
export interface PlanPlay {
  id: string; // Unique ID for this plan play instance
  playId: string; // References Action.id from playbookContent
  title: string;
  category: PlayCategory; // Legacy - kept for backward compat

  // New dual-label system
  interventionType: InterventionType; // Process, Culture, or Tooling
  priorityLevel: PlayPriority; // High, Medium, or Low (calculated from effort/impact)

  // Effort/Impact - kept for calculation, not displayed
  effort: EffortLevel;
  impact: ImpactLevel;

  // Source tracking - supports multiple outcomes/dimensions
  sourceDimensionKey: string; // Primary dimension
  sourceDimensionName: string;
  sourceOutcomeId?: string; // Primary outcome this play is associated with
  sourceOutcomeIds?: string[]; // All outcomes this affects (may affect multiple)
  sourceDimensionKeys?: string[]; // All dimensions this affects

  // Display helpers
  sourceOutcomeName?: string; // Cached outcome name for display
  sourceOutcomeNames?: string[]; // All outcome names for display

  status: PlayStatus;
  priority: number; // Lower = higher priority (1 = first)
  tasks: PlanTask[];
  notes?: string;
  startedAt?: string; // ISO timestamp when started
  completedAt?: string; // ISO timestamp when completed

  // Impact Measurement fields
  impactTimelineClass?: ImpactTimelineClass; // Expected impact timeline for this play
  impactMeasurement?: PlayImpactMeasurement; // Impact tracking data
}

// ============================================
// The Improvement Plan
// ============================================

/**
 * Status of the overall improvement plan
 * - draft: Being created
 * - active: Currently being worked on
 * - paused: Temporarily on hold (can be resumed)
 * - completed: All plays done
 * - archived: No longer active, kept for history
 */
export type PlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

/**
 * Outcome priority tracking
 */
export interface OutcomePriority {
  outcomeId: string;
  priority: number; // 1 = highest priority
}

/**
 * The improvement plan - one active at a time per team
 */
export interface ImprovementPlan {
  id: string;
  name: string;
  description?: string; // Optional user-provided description
  status: PlanStatus;
  optimizationTargets: OptimizationTarget[];
  plays: PlanPlay[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  createdByUserId?: string; // User ID of who created the plan
  createdByUserName?: string; // Display name of who created the plan
  baselineScores: Record<string, number>; // targetId -> score at plan creation
  teamId: string;
  outcomePriorities?: OutcomePriority[]; // Track outcome priority in plan

  // Impact Measurement fields
  impactSummary?: PlanImpactSummary; // Aggregated impact across all plays
  impactCalculatedAt?: string; // ISO timestamp of last impact calculation
}

// ============================================
// Wizard State Types
// ============================================

/**
 * State for the improvement plan wizard - step 1 (select & prioritize outcomes)
 */
export interface WizardStep1State {
  selectedOutcomes: string[]; // outcomeIds (ordered by priority - first = highest)
  selectedDimensions: string[]; // kept for backward compatibility, always empty in new flow
}

/**
 * A suggested play for review in step 2
 */
export interface SuggestedPlay {
  playId: string;
  title: string;
  category: PlayCategory;
  effort: EffortLevel;
  impact: ImpactLevel;
  sourceDimensionKey: string;
  sourceDimensionName: string;
  relevantTargets: string[]; // Which targets this play helps
  isSelected: boolean;
  alsoImproves?: string[]; // Other outcomes this play also improves (for dedup display)
}

/**
 * Dimension with its plays grouped together
 */
export interface DimensionPlayGroup {
  dimensionKey: string;
  dimensionName: string;
  weight: number; // Contribution weight to the parent outcome (0-1)
  currentScore: number;
  plays: SuggestedPlay[];
}

/**
 * Outcome with its contributing dimensions and plays
 */
export interface OutcomePlayGroup {
  outcomeId: string;
  outcomeName: string;
  priority: number; // 1 = highest priority
  dimensions: DimensionPlayGroup[];
}

/**
 * State for the improvement plan wizard - step 2 (review generated plan)
 */
export interface WizardStep2State {
  suggestedPlays: SuggestedPlay[]; // Flat list for backward compat and easy lookup
  outcomeGroups: OutcomePlayGroup[]; // Hierarchical structure for display
}

/**
 * State for the improvement plan wizard - step 3 (confirm)
 */
export interface WizardStep3State {
  planName: string;
}

/**
 * Complete wizard state (simplified to 3 steps)
 */
export interface ImprovementPlanWizardState {
  currentStep: 1 | 2 | 3;
  step1: WizardStep1State;
  step2: WizardStep2State;
  step3: WizardStep3State;
}

// ============================================
// Helper Types for UI
// ============================================

/**
 * Progress summary for the improvement plan
 */
export interface PlanProgress {
  totalPlays: number;
  backlog: number;
  doNext: number;
  inProgress: number;
  completed: number;
  skipped: number;
  completionPercentage: number;
}

/**
 * Play grouped by status for display
 */
export interface PlaysGroupedByStatus {
  backlog: PlanPlay[];
  doNext: PlanPlay[];
  inProgress: PlanPlay[];
  completed: PlanPlay[];
  skipped: PlanPlay[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique ID for plan entities
 */
export const generatePlanId = (): string => {
  return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate a unique ID for plan plays
 */
export const generatePlayId = (): string => {
  return `play-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate a unique ID for tasks
 */
export const generateTaskId = (): string => {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Calculate progress from plan plays
 */
export const calculatePlanProgress = (plays: PlanPlay[]): PlanProgress => {
  const total = plays.length;
  const backlog = plays.filter(p => p.status === 'backlog').length;
  const doNext = plays.filter(p => p.status === 'do-next').length;
  const inProgress = plays.filter(p => p.status === 'in-progress').length;
  const completed = plays.filter(p => p.status === 'completed').length;
  const skipped = plays.filter(p => p.status === 'skipped').length;

  // Completion percentage excludes skipped and backlog from calculation
  // Only counts plays that have been scheduled (do-next, in-progress, completed)
  const activeTotal = total - skipped - backlog;
  const completionPercentage = activeTotal > 0 ? Math.round((completed / activeTotal) * 100) : 0;

  return {
    totalPlays: total,
    backlog,
    doNext,
    inProgress,
    completed,
    skipped,
    completionPercentage,
  };
};

/**
 * Group plays by their status
 */
export const groupPlaysByStatus = (plays: PlanPlay[]): PlaysGroupedByStatus => {
  return {
    backlog: plays.filter(p => p.status === 'backlog').sort((a, b) => a.priority - b.priority),
    doNext: plays.filter(p => p.status === 'do-next').sort((a, b) => a.priority - b.priority),
    inProgress: plays.filter(p => p.status === 'in-progress').sort((a, b) => a.priority - b.priority),
    completed: plays.filter(p => p.status === 'completed').sort((a, b) => a.priority - b.priority),
    skipped: plays.filter(p => p.status === 'skipped').sort((a, b) => a.priority - b.priority),
  };
};

/**
 * Get the task progress for a play
 */
export const getTaskProgress = (tasks: PlanTask[]): { completed: number; total: number; percentage: number } => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
};

/**
 * Create an empty improvement plan wizard state
 */
export const createEmptyWizardState = (): ImprovementPlanWizardState => ({
  currentStep: 1,
  step1: {
    selectedOutcomes: [],
    selectedDimensions: [], // Kept for backward compat, always empty in new flow
  },
  step2: {
    suggestedPlays: [],
    outcomeGroups: [],
  },
  step3: {
    planName: '',
  },
});

/**
 * Check if a plan has any active (in-progress, do-next, or backlog) plays
 */
export const hasActivePlays = (plan: ImprovementPlan): boolean => {
  return plan.plays.some(p =>
    p.status === 'in-progress' || p.status === 'do-next' || p.status === 'backlog'
  );
};

/**
 * Get display label for play status
 */
export const getPlayStatusLabel = (status: PlayStatus): string => {
  switch (status) {
    case 'backlog': return 'Backlog';
    case 'do-next': return 'Do Next';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'skipped': return 'Skipped';
  }
};

/**
 * Get color for play status
 */
export const getPlayStatusColor = (status: PlayStatus): { text: string; bg: string; border: string } => {
  switch (status) {
    case 'backlog':
      return { text: '#6B778C', bg: '#F4F5F7', border: '#DFE1E6' };
    case 'do-next':
      return { text: '#5243AA', bg: '#EAE6FF', border: '#998DD9' };
    case 'in-progress':
      return { text: '#0052CC', bg: '#DEEBFF', border: '#4C9AFF' };
    case 'completed':
      return { text: '#006644', bg: '#E3FCEF', border: '#57D9A3' };
    case 'skipped':
      return { text: '#5E6C84', bg: '#F4F5F7', border: '#C1C7D0' };
  }
};

/**
 * Get display label for priority level
 */
export const getPriorityLabel = (priority: PlayPriority): string => {
  switch (priority) {
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
  }
};

/**
 * Get short label for priority (for compact displays)
 */
export const getPriorityShortLabel = (priority: PlayPriority): string => {
  switch (priority) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
  }
};

/**
 * Get color for priority badge
 */
export const getPriorityColor = (priority: PlayPriority): { text: string; bg: string } => {
  switch (priority) {
    case 'high':
      return { bg: '#FFEBE6', text: '#DE350B' }; // Red/urgent
    case 'medium':
      return { bg: '#FFF0B3', text: '#FF8B00' }; // Orange
    case 'low':
      return { bg: '#E3FCEF', text: '#006644' }; // Green/calm
  }
};

/**
 * Get display label for intervention type
 */
export const getInterventionTypeLabel = (type: InterventionType): string => {
  switch (type) {
    case 'process': return 'Process';
    case 'culture': return 'Culture';
    case 'tooling': return 'Tooling';
  }
};

/**
 * Get color for intervention type badge
 */
export const getInterventionTypeColor = (type: InterventionType): { text: string; bg: string; icon: string } => {
  switch (type) {
    case 'process':
      return { bg: '#DEEBFF', text: '#0052CC', icon: '🔄' };
    case 'culture':
      return { bg: '#EAE6FF', text: '#5243AA', icon: '👥' };
    case 'tooling':
      return { bg: '#FFF0B3', text: '#B65C02', icon: '⚙️' };
  }
};

// ============================================
// Plan List Types (for Phase 3 - Plan Management)
// ============================================

/**
 * Summary item for plan list display without loading full plan
 */
export interface PlanListItem {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  progress: number; // 0-100 percentage
  playCount: number;
  completedPlayCount: number;
  outcomeNames: string[];
  assessmentId?: string;
}

/**
 * Progress by dimension for plan detail view
 */
export interface DimensionProgress {
  dimensionKey: string;
  dimensionName: string;
  totalPlays: number;
  completedPlays: number;
  skippedPlays: number;
  progress: number; // 0-100 percentage
}

/**
 * Progress by outcome for plan detail view
 */
export interface OutcomeProgress {
  outcomeId: string;
  outcomeName: string;
  priority: number;
  dimensions: DimensionProgress[];
  overallProgress: number; // Weighted progress across dimensions
}

/**
 * Calculate progress for a single dimension
 */
export const calculateDimensionProgress = (
  plays: PlanPlay[],
  dimensionKey: string
): DimensionProgress => {
  const dimPlays = plays.filter(p => p.sourceDimensionKey === dimensionKey);
  const completed = dimPlays.filter(p => p.status === 'completed').length;
  const skipped = dimPlays.filter(p => p.status === 'skipped').length;
  const total = dimPlays.length;
  const activeTotal = total - skipped;
  const progress = activeTotal > 0 ? Math.round((completed / activeTotal) * 100) : 0;

  // Get dimension name from first play
  const dimensionName = dimPlays[0]?.sourceDimensionName || dimensionKey;

  return {
    dimensionKey,
    dimensionName,
    totalPlays: total,
    completedPlays: completed,
    skippedPlays: skipped,
    progress,
  };
};

/**
 * Create a PlanListItem from a full ImprovementPlan
 */
export const createPlanListItem = (
  plan: ImprovementPlan,
  teamName: string
): PlanListItem => {
  const progress = calculatePlanProgress(plan.plays);
  const outcomeNames = plan.outcomePriorities?.map(op => {
    // Get outcome name from optimization targets
    const target = plan.optimizationTargets.find(t => t.id === op.outcomeId);
    return target?.name || op.outcomeId;
  }) || [];

  return {
    id: plan.id,
    name: plan.name,
    teamId: plan.teamId,
    teamName,
    status: plan.status,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    progress: progress.completionPercentage,
    playCount: plan.plays.length,
    completedPlayCount: progress.completed,
    outcomeNames,
  };
};

// ============================================
// Priority Progress Types & Functions
// ============================================

/**
 * Progress breakdown by priority level
 */
export interface PriorityProgress {
  priority: PlayPriority;
  totalPlays: number;
  completedPlays: number;
  percentage: number;
}

/**
 * Progress breakdown by outcome
 */
export interface OutcomeProgressSummary {
  outcomeId: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

/**
 * Aggregate progress across multiple plans
 */
export interface AggregateProgress {
  totalPlans: number;
  activePlans: number;
  totalPlays: number;
  completedPlays: number;
  percentage: number;
}

/**
 * Calculate progress breakdown by priority level
 */
export const calculatePriorityProgress = (plays: PlanPlay[]): PriorityProgress[] => {
  const priorities: PlayPriority[] = ['high', 'medium', 'low'];

  return priorities.map(priority => {
    const priorityPlays = plays.filter(p => p.priorityLevel === priority && p.status !== 'skipped');
    const completedPlays = priorityPlays.filter(p => p.status === 'completed').length;
    const totalPlays = priorityPlays.length;
    const percentage = totalPlays > 0 ? Math.round((completedPlays / totalPlays) * 100) : 0;

    return {
      priority,
      totalPlays,
      completedPlays,
      percentage,
    };
  });
};

/**
 * Calculate progress breakdown by outcome
 */
export const calculateOutcomeProgressSummary = (
  plays: PlanPlay[],
  outcomePriorities: OutcomePriority[]
): OutcomeProgressSummary[] => {
  // Create a map of outcome IDs to their plays
  const outcomeMap = new Map<string, { name: string; plays: PlanPlay[] }>();

  // Initialize with outcome priorities to maintain order
  for (const op of outcomePriorities) {
    outcomeMap.set(op.outcomeId, { name: '', plays: [] });
  }

  // Group plays by their source outcome
  for (const play of plays) {
    if (play.status === 'skipped') continue;

    const outcomeId = play.sourceOutcomeId;
    if (!outcomeId) continue;

    if (!outcomeMap.has(outcomeId)) {
      outcomeMap.set(outcomeId, { name: play.sourceOutcomeName || outcomeId, plays: [] });
    }

    const entry = outcomeMap.get(outcomeId)!;
    if (!entry.name && play.sourceOutcomeName) {
      entry.name = play.sourceOutcomeName;
    }
    entry.plays.push(play);
  }

  // Calculate progress for each outcome
  const result: OutcomeProgressSummary[] = [];

  Array.from(outcomeMap.entries()).forEach(([outcomeId, { name, plays: outcomePlays }]) => {
    if (outcomePlays.length === 0) return;

    const completed = outcomePlays.filter(p => p.status === 'completed').length;
    const total = outcomePlays.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    result.push({
      outcomeId,
      name: name || outcomeId,
      completed,
      total,
      percentage,
    });
  });

  return result;
};

/**
 * Calculate aggregate progress across multiple plans
 */
export const calculateAggregateProgress = (plans: ImprovementPlan[]): AggregateProgress => {
  const activePlans = plans.filter(p => p.status !== 'archived');

  let totalPlays = 0;
  let completedPlays = 0;

  for (const plan of activePlans) {
    const progress = calculatePlanProgress(plan.plays);
    totalPlays += progress.totalPlays - progress.skipped;
    completedPlays += progress.completed;
  }

  const percentage = totalPlays > 0 ? Math.round((completedPlays / totalPlays) * 100) : 0;

  return {
    totalPlans: plans.length,
    activePlans: activePlans.length,
    totalPlays,
    completedPlays,
    percentage,
  };
};

/**
 * Intervention type progress breakdown
 */
export interface InterventionTypeProgress {
  type: InterventionType;
  totalPlays: number;
  completedPlays: number;
  percentage: number;
}

/**
 * Calculate aggregate priority progress across multiple plans
 */
export const calculateAggregatePriorityProgress = (plans: ImprovementPlan[]): PriorityProgress[] => {
  const activePlans = plans.filter(p => p.status !== 'archived');
  const allPlays = activePlans.flatMap(p => p.plays);
  return calculatePriorityProgress(allPlays);
};

/**
 * Calculate aggregate outcome progress across multiple plans
 */
export const calculateAggregateOutcomeProgress = (plans: ImprovementPlan[]): OutcomeProgressSummary[] => {
  const activePlans = plans.filter(p => p.status !== 'archived');

  // Collect all plays and build outcome map
  const outcomeMap = new Map<string, { name: string; completed: number; total: number }>();

  for (const plan of activePlans) {
    for (const play of plan.plays) {
      if (play.status === 'skipped') continue;

      const outcomeId = play.sourceOutcomeId;
      if (!outcomeId) continue;

      if (!outcomeMap.has(outcomeId)) {
        outcomeMap.set(outcomeId, {
          name: play.sourceOutcomeName || outcomeId,
          completed: 0,
          total: 0,
        });
      }

      const entry = outcomeMap.get(outcomeId)!;
      entry.total++;
      if (play.status === 'completed') {
        entry.completed++;
      }
    }
  }

  // Convert to array and calculate percentages
  const result: OutcomeProgressSummary[] = [];
  Array.from(outcomeMap.entries()).forEach(([outcomeId, { name, completed, total }]) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    result.push({ outcomeId, name, completed, total, percentage });
  });

  // Sort by total plays descending
  return result.sort((a, b) => b.total - a.total);
};

/**
 * Calculate aggregate intervention type progress across multiple plans
 */
export const calculateAggregateInterventionProgress = (plans: ImprovementPlan[]): InterventionTypeProgress[] => {
  const activePlans = plans.filter(p => p.status !== 'archived');
  const allPlays = activePlans.flatMap(p => p.plays);

  const types: InterventionType[] = ['process', 'culture', 'tooling'];

  return types.map(type => {
    const typePlays = allPlays.filter(p => p.interventionType === type && p.status !== 'skipped');
    const completedPlays = typePlays.filter(p => p.status === 'completed').length;
    const totalPlays = typePlays.length;
    const percentage = totalPlays > 0 ? Math.round((completedPlays / totalPlays) * 100) : 0;

    return { type, totalPlays, completedPlays, percentage };
  });
};

// ============================================
// Portfolio Overview Types & Functions
// ============================================

/**
 * Coverage metrics for the portfolio overview
 */
export interface CoverageMetrics {
  activePlans: number;
  plansInProgress: number;
  outcomesTargeted: number;
  totalOutcomes: number;
  dimensionsAffected: number;
  totalDimensions: number;
  totalPlays: number;
  completedPlays: number;
  inProgressPlays: number;
  remainingPlays: number;
}

/**
 * Intensity level for dimension coverage visualization
 */
export type CoverageIntensity = 'none' | 'low' | 'medium' | 'high';

/**
 * Coverage information for a single dimension
 */
export interface DimensionCoverage {
  dimensionKey: string;
  dimensionName: string;
  playCount: number;
  completedCount: number;
  inProgressCount: number;
  intensity: CoverageIntensity;
}

/**
 * Velocity and burn rate metrics
 */
export interface VelocityMetrics {
  thisWeek: number;
  lastWeek: number;
  avgPerWeek: number;
  remainingPlays: number;
  estimatedWeeksToComplete: number | null;
}

/**
 * Calculate coverage metrics across all plans
 */
export const calculateCoverageMetrics = (plans: ImprovementPlan[]): CoverageMetrics => {
  const activePlans = plans.filter(p => p.status !== 'archived');
  const plansInProgress = activePlans.filter(p =>
    p.plays.some(play => play.status === 'in-progress')
  ).length;

  // Collect unique outcomes and dimensions
  const outcomeIds = new Set<string>();
  const dimensionKeys = new Set<string>();

  let totalPlays = 0;
  let completedPlays = 0;
  let inProgressPlays = 0;

  for (const plan of activePlans) {
    for (const play of plan.plays) {
      if (play.status === 'skipped') continue;

      totalPlays++;
      if (play.status === 'completed') completedPlays++;
      if (play.status === 'in-progress') inProgressPlays++;

      if (play.sourceOutcomeId) {
        outcomeIds.add(play.sourceOutcomeId);
      }
      if (play.sourceOutcomeIds) {
        play.sourceOutcomeIds.forEach(id => outcomeIds.add(id));
      }
      if (play.sourceDimensionKey) {
        dimensionKeys.add(play.sourceDimensionKey);
      }
      if (play.sourceDimensionKeys) {
        play.sourceDimensionKeys.forEach(key => dimensionKeys.add(key));
      }
    }
  }

  return {
    activePlans: activePlans.length,
    plansInProgress,
    outcomesTargeted: outcomeIds.size,
    totalOutcomes: 4, // Fixed: Delivery, Collaboration, Productivity, Process Maturity
    dimensionsAffected: dimensionKeys.size,
    totalDimensions: 15, // Standard dimension count
    totalPlays,
    completedPlays,
    inProgressPlays,
    remainingPlays: totalPlays - completedPlays,
  };
};

/**
 * Calculate dimension coverage across all plans
 */
export const calculateDimensionCoverage = (plans: ImprovementPlan[]): DimensionCoverage[] => {
  const activePlans = plans.filter(p => p.status !== 'archived');

  // Group plays by dimension
  const dimensionMap = new Map<string, {
    name: string;
    total: number;
    completed: number;
    inProgress: number;
  }>();

  for (const plan of activePlans) {
    for (const play of plan.plays) {
      if (play.status === 'skipped') continue;

      const key = play.sourceDimensionKey;
      if (!dimensionMap.has(key)) {
        dimensionMap.set(key, {
          name: play.sourceDimensionName,
          total: 0,
          completed: 0,
          inProgress: 0,
        });
      }

      const entry = dimensionMap.get(key)!;
      entry.total++;
      if (play.status === 'completed') entry.completed++;
      if (play.status === 'in-progress') entry.inProgress++;
    }
  }

  // Convert to array and calculate intensity
  const coverage: DimensionCoverage[] = [];

  dimensionMap.forEach((data, key) => {
    let intensity: CoverageIntensity = 'none';
    if (data.total > 0) {
      if (data.total <= 10) intensity = 'low';
      else if (data.total <= 25) intensity = 'medium';
      else intensity = 'high';
    }

    coverage.push({
      dimensionKey: key,
      dimensionName: data.name,
      playCount: data.total,
      completedCount: data.completed,
      inProgressCount: data.inProgress,
      intensity,
    });
  });

  // Sort by play count descending
  return coverage.sort((a, b) => b.playCount - a.playCount);
};

/**
 * Calculate velocity metrics from completed plays
 */
export const calculateVelocityMetrics = (plans: ImprovementPlan[]): VelocityMetrics => {
  const activePlans = plans.filter(p => p.status !== 'archived');
  const now = new Date();

  // Calculate week boundaries
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  let thisWeekCount = 0;
  let lastWeekCount = 0;
  let totalCompleted = 0;
  let remainingPlays = 0;
  let earliestCompletedDate: Date | null = null;

  for (const plan of activePlans) {
    for (const play of plan.plays) {
      if (play.status === 'skipped') continue;

      if (play.status === 'completed' && play.completedAt) {
        const completedDate = new Date(play.completedAt);
        totalCompleted++;

        if (!earliestCompletedDate || completedDate < earliestCompletedDate) {
          earliestCompletedDate = completedDate;
        }

        if (completedDate >= thisWeekStart) {
          thisWeekCount++;
        } else if (completedDate >= lastWeekStart && completedDate <= lastWeekEnd) {
          lastWeekCount++;
        }
      } else if (play.status !== 'completed') {
        remainingPlays++;
      }
    }
  }

  // Calculate average per week
  let avgPerWeek = 0;
  if (earliestCompletedDate && totalCompleted > 0) {
    const weeksElapsed = Math.max(1,
      Math.ceil((now.getTime() - earliestCompletedDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    );
    avgPerWeek = Math.round((totalCompleted / weeksElapsed) * 10) / 10;
  }

  // Estimate weeks to complete
  let estimatedWeeksToComplete: number | null = null;
  if (avgPerWeek > 0 && remainingPlays > 0) {
    estimatedWeeksToComplete = Math.ceil(remainingPlays / avgPerWeek);
  }

  return {
    thisWeek: thisWeekCount,
    lastWeek: lastWeekCount,
    avgPerWeek,
    remainingPlays,
    estimatedWeeksToComplete,
  };
};

// ============================================
// Single Plan Overview Types & Functions
// ============================================

/**
 * Metrics for a single plan overview (similar to portfolio CoverageMetrics)
 */
export interface SinglePlanMetrics {
  outcomesTargeted: number;
  totalOutcomes: number;
  dimensionsAffected: number;
  totalDimensions: number;
  totalPlays: number;
  completedPlays: number;
  inProgressPlays: number;
  doNextPlays: number;
  backlogPlays: number;
  skippedPlays: number;
  remainingPlays: number;
  completionPercentage: number;
}

/**
 * Calculate metrics for a single plan
 */
export const calculateSinglePlanMetrics = (plan: ImprovementPlan): SinglePlanMetrics => {
  const outcomeIds = new Set<string>();
  const dimensionKeys = new Set<string>();

  let totalPlays = 0;
  let completedPlays = 0;
  let inProgressPlays = 0;
  let doNextPlays = 0;
  let backlogPlays = 0;
  let skippedPlays = 0;

  for (const play of plan.plays) {
    totalPlays++;

    switch (play.status) {
      case 'completed': completedPlays++; break;
      case 'in-progress': inProgressPlays++; break;
      case 'do-next': doNextPlays++; break;
      case 'backlog': backlogPlays++; break;
      case 'skipped': skippedPlays++; break;
    }

    if (play.status === 'skipped') continue;

    if (play.sourceOutcomeId) {
      outcomeIds.add(play.sourceOutcomeId);
    }
    if (play.sourceOutcomeIds) {
      play.sourceOutcomeIds.forEach(id => outcomeIds.add(id));
    }
    if (play.sourceDimensionKey) {
      dimensionKeys.add(play.sourceDimensionKey);
    }
    if (play.sourceDimensionKeys) {
      play.sourceDimensionKeys.forEach(key => dimensionKeys.add(key));
    }
  }

  const activePlays = totalPlays - skippedPlays;
  const completionPercentage = activePlays > 0 ? Math.round((completedPlays / activePlays) * 100) : 0;

  return {
    outcomesTargeted: outcomeIds.size,
    totalOutcomes: 4,
    dimensionsAffected: dimensionKeys.size,
    totalDimensions: 15,
    totalPlays,
    completedPlays,
    inProgressPlays,
    doNextPlays,
    backlogPlays,
    skippedPlays,
    remainingPlays: activePlays - completedPlays,
    completionPercentage,
  };
};

/**
 * Calculate dimension coverage for a single plan
 */
export const calculateSinglePlanDimensionCoverage = (plan: ImprovementPlan): DimensionCoverage[] => {
  const dimensionMap = new Map<string, {
    name: string;
    total: number;
    completed: number;
    inProgress: number;
  }>();

  for (const play of plan.plays) {
    if (play.status === 'skipped') continue;

    const key = play.sourceDimensionKey;
    if (!dimensionMap.has(key)) {
      dimensionMap.set(key, {
        name: play.sourceDimensionName,
        total: 0,
        completed: 0,
        inProgress: 0,
      });
    }

    const entry = dimensionMap.get(key)!;
    entry.total++;
    if (play.status === 'completed') entry.completed++;
    if (play.status === 'in-progress') entry.inProgress++;
  }

  const coverage: DimensionCoverage[] = [];

  dimensionMap.forEach((data, key) => {
    let intensity: CoverageIntensity = 'none';
    if (data.total > 0) {
      if (data.total <= 5) intensity = 'low';
      else if (data.total <= 15) intensity = 'medium';
      else intensity = 'high';
    }

    coverage.push({
      dimensionKey: key,
      dimensionName: data.name,
      playCount: data.total,
      completedCount: data.completed,
      inProgressCount: data.inProgress,
      intensity,
    });
  });

  return coverage.sort((a, b) => b.playCount - a.playCount);
};

/**
 * Calculate velocity metrics for a single plan
 */
export const calculateSinglePlanVelocity = (plan: ImprovementPlan): VelocityMetrics => {
  const now = new Date();

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  let thisWeekCount = 0;
  let lastWeekCount = 0;
  let totalCompleted = 0;
  let remainingPlays = 0;
  let earliestCompletedDate: Date | null = null;

  for (const play of plan.plays) {
    if (play.status === 'skipped') continue;

    if (play.status === 'completed' && play.completedAt) {
      const completedDate = new Date(play.completedAt);
      totalCompleted++;

      if (!earliestCompletedDate || completedDate < earliestCompletedDate) {
        earliestCompletedDate = completedDate;
      }

      if (completedDate >= thisWeekStart) {
        thisWeekCount++;
      } else if (completedDate >= lastWeekStart && completedDate <= lastWeekEnd) {
        lastWeekCount++;
      }
    } else if (play.status !== 'completed') {
      remainingPlays++;
    }
  }

  let avgPerWeek = 0;
  if (earliestCompletedDate && totalCompleted > 0) {
    const weeksElapsed = Math.max(1,
      Math.ceil((now.getTime() - earliestCompletedDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    );
    avgPerWeek = Math.round((totalCompleted / weeksElapsed) * 10) / 10;
  }

  let estimatedWeeksToComplete: number | null = null;
  if (avgPerWeek > 0 && remainingPlays > 0) {
    estimatedWeeksToComplete = Math.ceil(remainingPlays / avgPerWeek);
  }

  return {
    thisWeek: thisWeekCount,
    lastWeek: lastWeekCount,
    avgPerWeek,
    remainingPlays,
    estimatedWeeksToComplete,
  };
};
