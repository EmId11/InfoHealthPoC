// Improvement Plan Utilities
// Logic for suggesting and ranking plays based on optimization targets

import { DimensionResult, AssessmentResult } from '../types/assessment';
import { OutcomeConfidenceResult } from '../types/outcomeConfidence';
import { Action, EffortLevel, ImpactLevel, PlayCategory } from '../types/playbook';
import {
  OptimizationTarget,
  SuggestedPlay,
  PlanPlay,
  ImprovementPlan,
  OutcomePlayGroup,
  DimensionPlayGroup,
  OutcomePriority,
  PlayPriority,
  InterventionType,
  generatePlanId,
  generatePlayId,
} from '../types/improvementPlan';
import { PlayImpactMeasurement } from '../types/impactMeasurement';
import { OUTCOME_DEFINITIONS } from '../constants/outcomeDefinitions';
import { DIMENSION_PLAYBOOKS, getPlaybookForDimension } from '../constants/playbookContent';
import { getTimelineClassForPlay, calculateAssessmentWindow } from '../constants/impactTimelines';
import {
  captureBaselineForPlay,
  captureCompletionForPlay,
} from './impactCalculations';

// ============================================
// Priority & Intervention Type Utilities
// ============================================

/**
 * Calculate priority level from effort and impact
 * - High: High impact + Low/Medium effort (quick wins, high value)
 * - Medium: High impact + High effort OR Medium impact
 * - Low: Low impact
 */
export const calculatePriorityLevel = (effort: EffortLevel, impact: ImpactLevel): PlayPriority => {
  // High: High impact with manageable effort
  if (impact === 'high' && effort !== 'high') return 'high';

  // Medium: High effort + high impact, or medium impact
  if (impact === 'high' && effort === 'high') return 'medium';
  if (impact === 'medium') return 'medium';

  // Low: Low impact
  return 'low';
};

/**
 * Infer intervention type from a play's category
 * Maps 'quick-win' to its true intervention type based on action content
 */
export const inferInterventionType = (category: PlayCategory, action?: Action): InterventionType => {
  // If not quick-win, use the category directly
  if (category !== 'quick-win') {
    return category as InterventionType;
  }

  // For quick-wins, infer from action content if available
  if (action) {
    const content = [
      action.title,
      action.knowledge.problemSolved,
      action.implementation.overview,
    ].join(' ').toLowerCase();

    // Check for tooling keywords
    if (content.includes('jira') || content.includes('automation') ||
        content.includes('configure') || content.includes('dashboard') ||
        content.includes('field') || content.includes('workflow')) {
      return 'tooling';
    }

    // Check for culture keywords
    if (content.includes('team') || content.includes('habit') ||
        content.includes('agreement') || content.includes('ritual') ||
        content.includes('communication') || content.includes('standup')) {
      return 'culture';
    }
  }

  // Default quick-wins to process
  return 'process';
};

// ============================================
// Play Suggestion Logic
// ============================================

/**
 * Get all dimensions that contribute to a specific outcome
 */
export const getDimensionsForOutcome = (outcomeId: string): string[] => {
  const outcome = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId);
  if (!outcome) return [];
  return outcome.dimensions.map(d => d.dimensionKey);
};

/**
 * Get all actions for a dimension that are available for the plan
 */
export const getActionsForDimension = (dimensionKey: string): Action[] => {
  const playbook = getPlaybookForDimension(dimensionKey);
  return playbook?.actions || [];
};

/**
 * Suggest plays based on selected optimization targets
 * Returns plays sorted by impact and relevance
 */
export const suggestPlaysForTargets = (
  selectedOutcomes: string[],
  selectedDimensions: string[],
  dimensions: DimensionResult[]
): SuggestedPlay[] => {
  const suggestedPlays: SuggestedPlay[] = [];
  const seenPlayIds = new Set<string>();

  // Get all dimension keys we should look at
  const relevantDimensionKeys = new Set<string>(selectedDimensions);

  // Add dimensions from selected outcomes
  for (const outcomeId of selectedOutcomes) {
    const dimensionKeys = getDimensionsForOutcome(outcomeId);
    dimensionKeys.forEach(key => relevantDimensionKeys.add(key));
  }

  // For each relevant dimension, get its plays
  for (const dimensionKey of Array.from(relevantDimensionKeys)) {
    const playbook = getPlaybookForDimension(dimensionKey);
    if (!playbook?.actions) continue;

    // Find the dimension data for percentile info
    const dimensionData = dimensions.find(d => d.dimensionKey === dimensionKey);
    const dimensionScore = dimensionData?.overallPercentile || 50;

    for (const action of playbook.actions) {
      // Skip if we've already added this play
      if (seenPlayIds.has(action.id)) continue;
      seenPlayIds.add(action.id);

      // Determine which targets this play is relevant to
      const relevantTargets: string[] = [];

      // Check direct dimension selection
      if (selectedDimensions.includes(dimensionKey)) {
        relevantTargets.push(dimensionKey);
      }

      // Check outcomes that include this dimension
      for (const outcomeId of selectedOutcomes) {
        const dimensionKeys = getDimensionsForOutcome(outcomeId);
        if (dimensionKeys.includes(dimensionKey)) {
          relevantTargets.push(outcomeId);
        }
      }

      const suggestedPlay: SuggestedPlay = {
        playId: action.id,
        title: action.title,
        category: action.category,
        effort: action.implementation.effort,
        impact: action.impact,
        sourceDimensionKey: dimensionKey,
        sourceDimensionName: playbook.dimensionName,
        relevantTargets,
        isSelected: true, // Default to selected
      };

      suggestedPlays.push(suggestedPlay);
    }
  }

  // Sort plays by:
  // 1. Impact (high > medium > low)
  // 2. Quick wins first
  // 3. Lower effort
  return suggestedPlays.sort((a, b) => {
    // Impact priority
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    if (impactDiff !== 0) return impactDiff;

    // Quick wins first
    if (a.category === 'quick-win' && b.category !== 'quick-win') return -1;
    if (b.category === 'quick-win' && a.category !== 'quick-win') return 1;

    // Lower effort
    const effortOrder = { low: 0, medium: 1, high: 2 };
    return effortOrder[a.effort] - effortOrder[b.effort];
  });
};

/**
 * Calculate a score for ranking plays (higher = better to do first)
 */
export const calculatePlayScore = (play: SuggestedPlay): number => {
  const impactScore = play.impact === 'high' ? 30 : play.impact === 'medium' ? 20 : 10;
  const effortScore = play.effort === 'low' ? 20 : play.effort === 'medium' ? 10 : 0;
  const quickWinBonus = play.category === 'quick-win' ? 15 : 0;
  const relevanceBonus = play.relevantTargets.length * 5;

  return impactScore + effortScore + quickWinBonus + relevanceBonus;
};

/**
 * Generate plays grouped by outcome → dimension hierarchy
 * For the new simplified wizard flow
 */
export const generateOutcomeGroupedPlays = (
  selectedOutcomes: string[], // Ordered by priority (first = highest)
  dimensions: DimensionResult[]
): { outcomeGroups: OutcomePlayGroup[]; allPlays: SuggestedPlay[] } => {
  const allPlays: SuggestedPlay[] = [];
  const seenPlayIds = new Set<string>();
  const playToOutcomes = new Map<string, string[]>(); // playId -> outcomeIds that use it

  // First pass: collect all plays and track which outcomes each play serves
  for (const outcomeId of selectedOutcomes) {
    const outcome = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId);
    if (!outcome) continue;

    for (const dimContribution of outcome.dimensions) {
      const playbook = getPlaybookForDimension(dimContribution.dimensionKey);
      if (!playbook?.actions) continue;

      for (const action of playbook.actions) {
        // Track which outcomes this play serves
        if (!playToOutcomes.has(action.id)) {
          playToOutcomes.set(action.id, []);
        }
        playToOutcomes.get(action.id)!.push(outcomeId);
      }
    }
  }

  // Build outcome groups with plays
  const outcomeGroups: OutcomePlayGroup[] = selectedOutcomes.map((outcomeId, index) => {
    const outcome = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId)!;
    const dimensionGroups: DimensionPlayGroup[] = [];

    for (const dimContribution of outcome.dimensions) {
      const playbook = getPlaybookForDimension(dimContribution.dimensionKey);
      if (!playbook?.actions) continue;

      const dimensionData = dimensions.find(d => d.dimensionKey === dimContribution.dimensionKey);
      const dimensionScore = dimensionData?.overallPercentile || 50;

      const dimensionPlays: SuggestedPlay[] = [];

      for (const action of playbook.actions) {
        const playOutcomes = playToOutcomes.get(action.id) || [];

        // This play's primary outcome is the first one in priority order
        const primaryOutcomeId = selectedOutcomes.find(oid => playOutcomes.includes(oid))!;
        const isPrimaryOutcome = primaryOutcomeId === outcomeId;

        // Skip if this isn't the primary outcome for this play (dedup)
        if (!isPrimaryOutcome) continue;

        // Calculate "also improves" - other outcomes this play helps
        const alsoImproves = playOutcomes
          .filter(oid => oid !== outcomeId)
          .map(oid => OUTCOME_DEFINITIONS.find(o => o.id === oid)?.name || oid);

        const suggestedPlay: SuggestedPlay = {
          playId: action.id,
          title: action.title,
          category: action.category,
          effort: action.implementation.effort,
          impact: action.impact,
          sourceDimensionKey: dimContribution.dimensionKey,
          sourceDimensionName: playbook.dimensionName,
          relevantTargets: [outcomeId],
          isSelected: true,
          alsoImproves: alsoImproves.length > 0 ? alsoImproves : undefined,
        };

        if (!seenPlayIds.has(action.id)) {
          seenPlayIds.add(action.id);
          allPlays.push(suggestedPlay);
        }

        dimensionPlays.push(suggestedPlay);
      }

      // Sort plays by impact and effort
      dimensionPlays.sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
        if (impactDiff !== 0) return impactDiff;

        if (a.category === 'quick-win' && b.category !== 'quick-win') return -1;
        if (b.category === 'quick-win' && a.category !== 'quick-win') return 1;

        const effortOrder = { low: 0, medium: 1, high: 2 };
        return effortOrder[a.effort] - effortOrder[b.effort];
      });

      if (dimensionPlays.length > 0) {
        dimensionGroups.push({
          dimensionKey: dimContribution.dimensionKey,
          dimensionName: playbook.dimensionName,
          weight: dimContribution.weight,
          currentScore: dimensionScore,
          plays: dimensionPlays,
        });
      }
    }

    // Sort dimensions by weight (highest first)
    dimensionGroups.sort((a, b) => b.weight - a.weight);

    return {
      outcomeId,
      outcomeName: outcome.name,
      priority: index + 1,
      dimensions: dimensionGroups,
    };
  });

  return { outcomeGroups, allPlays };
};

// ============================================
// Plan Creation
// ============================================

/**
 * Create optimization targets from selected outcomes and dimensions
 */
export const createOptimizationTargets = (
  selectedOutcomes: string[],
  selectedDimensions: string[],
  outcomeResults: OutcomeConfidenceResult[],
  dimensions: DimensionResult[]
): OptimizationTarget[] => {
  const targets: OptimizationTarget[] = [];

  // Add outcome targets
  for (const outcomeId of selectedOutcomes) {
    const outcomeResult = outcomeResults.find(o => o.id === outcomeId);
    if (outcomeResult) {
      targets.push({
        type: 'outcome',
        id: outcomeId,
        name: outcomeResult.name,
        currentScore: outcomeResult.finalScore,
      });
    }
  }

  // Add dimension targets
  for (const dimensionKey of selectedDimensions) {
    const dimension = dimensions.find(d => d.dimensionKey === dimensionKey);
    if (dimension) {
      targets.push({
        type: 'dimension',
        id: dimensionKey,
        name: dimension.dimensionName,
        currentScore: dimension.overallPercentile,
      });
    }
  }

  return targets;
};

/**
 * Convert suggested plays to plan plays with priority order
 * @deprecated Use createPlanPlaysFromGroups for the new wizard flow
 */
export const createPlanPlays = (
  suggestedPlays: SuggestedPlay[],
  orderedPlayIds: string[]
): PlanPlay[] => {
  const selectedPlays = suggestedPlays.filter(p => p.isSelected);

  return orderedPlayIds
    .map((playId, index) => {
      const suggested = selectedPlays.find(p => p.playId === playId);
      if (!suggested) return null;

      // Calculate priority level and intervention type
      const priorityLevel = calculatePriorityLevel(suggested.effort, suggested.impact);
      const interventionType = inferInterventionType(suggested.category);

      const planPlay: PlanPlay = {
        id: generatePlayId(),
        playId: suggested.playId,
        title: suggested.title,
        category: suggested.category,
        interventionType,
        priorityLevel,
        effort: suggested.effort,
        impact: suggested.impact,
        sourceDimensionKey: suggested.sourceDimensionKey,
        sourceDimensionName: suggested.sourceDimensionName,
        status: 'backlog',
        priority: index + 1,
        tasks: [],
      };

      return planPlay;
    })
    .filter((p): p is PlanPlay => p !== null);
};

/**
 * Create plan plays from outcome groups (new wizard flow)
 * Plays are ordered by outcome priority, then by dimension weight, then by impact
 */
export const createPlanPlaysFromGroups = (
  outcomeGroups: OutcomePlayGroup[],
  allPlays: SuggestedPlay[]
): PlanPlay[] => {
  const planPlays: PlanPlay[] = [];
  let priorityIndex = 1;

  // Create a map of playId -> SuggestedPlay for selection status lookup
  const playSelectionMap = new Map(allPlays.map(p => [p.playId, p]));

  // Build a map of playId -> all outcomes it affects
  const playToOutcomes = new Map<string, { ids: string[], names: string[] }>();
  for (const outcomeGroup of outcomeGroups) {
    for (const dimensionGroup of outcomeGroup.dimensions) {
      for (const play of dimensionGroup.plays) {
        if (!playToOutcomes.has(play.playId)) {
          playToOutcomes.set(play.playId, { ids: [], names: [] });
        }
        const entry = playToOutcomes.get(play.playId)!;
        if (!entry.ids.includes(outcomeGroup.outcomeId)) {
          entry.ids.push(outcomeGroup.outcomeId);
          entry.names.push(outcomeGroup.outcomeName);
        }
      }
    }
  }

  for (const outcomeGroup of outcomeGroups) {
    for (const dimensionGroup of outcomeGroup.dimensions) {
      for (const play of dimensionGroup.plays) {
        // Check if this play is selected
        const suggestedPlay = playSelectionMap.get(play.playId);
        if (!suggestedPlay?.isSelected) continue;

        // Calculate priority level and intervention type
        const priorityLevel = calculatePriorityLevel(play.effort, play.impact);
        const interventionType = inferInterventionType(play.category);

        // Get all outcomes this play affects
        const outcomeInfo = playToOutcomes.get(play.playId) || { ids: [], names: [] };

        const planPlay: PlanPlay = {
          id: generatePlayId(),
          playId: play.playId,
          title: play.title,
          category: play.category, // Keep for backward compat
          interventionType,
          priorityLevel,
          effort: play.effort,
          impact: play.impact,
          sourceDimensionKey: play.sourceDimensionKey,
          sourceDimensionName: play.sourceDimensionName,
          sourceOutcomeId: outcomeGroup.outcomeId,
          sourceOutcomeIds: outcomeInfo.ids,
          sourceOutcomeName: outcomeGroup.outcomeName,
          sourceOutcomeNames: outcomeInfo.names,
          status: 'backlog',
          priority: priorityIndex++,
          tasks: [],
        };

        planPlays.push(planPlay);
      }
    }
  }

  return planPlays;
};

/**
 * Create a new improvement plan from wizard data
 */
export const createImprovementPlan = (
  name: string,
  optimizationTargets: OptimizationTarget[],
  planPlays: PlanPlay[],
  teamId: string,
  outcomePriorities?: OutcomePriority[],
  createdByUserId?: string,
  createdByUserName?: string
): ImprovementPlan => {
  const now = new Date().toISOString();

  // Create baseline scores record
  const baselineScores: Record<string, number> = {};
  for (const target of optimizationTargets) {
    baselineScores[target.id] = target.currentScore;
  }

  return {
    id: generatePlanId(),
    name,
    status: 'active',
    optimizationTargets,
    plays: planPlays,
    createdAt: now,
    updatedAt: now,
    createdByUserId: createdByUserId || 'current-user',
    createdByUserName: createdByUserName || 'Current User',
    baselineScores,
    teamId,
    outcomePriorities,
  };
};

// ============================================
// Plan Updates
// ============================================

/**
 * Update a play's status
 */
/**
 * Update a play's status with optional impact measurement capture
 * When assessment data is provided:
 * - Captures baseline snapshot when starting a play (in-progress)
 * - Captures completion snapshot when completing a play
 */
export const updatePlayStatus = (
  plan: ImprovementPlan,
  playId: string,
  newStatus: PlanPlay['status'],
  assessment?: AssessmentResult | null
): ImprovementPlan => {
  const now = new Date().toISOString();

  return {
    ...plan,
    updatedAt: now,
    plays: plan.plays.map(play => {
      if (play.id !== playId) return play;

      const updates: Partial<PlanPlay> = { status: newStatus };

      // Set timestamps based on status change
      if (newStatus === 'in-progress' && !play.startedAt) {
        updates.startedAt = now;

        // Capture baseline snapshot for impact measurement
        if (assessment) {
          const impactMeasurement = captureBaselineForPlay(play, assessment);
          updates.impactMeasurement = impactMeasurement;
          updates.impactTimelineClass = impactMeasurement.impactTimelineClass;
        } else {
          // Even without assessment, set the timeline class
          updates.impactTimelineClass = getTimelineClassForPlay(play.playId, play.category);
        }
      }

      if (newStatus === 'completed') {
        updates.completedAt = now;

        // Capture completion snapshot for impact measurement
        if (assessment) {
          const existingMeasurement = play.impactMeasurement;
          const impactMeasurement = captureCompletionForPlay(play, assessment, existingMeasurement);
          updates.impactMeasurement = impactMeasurement;
        } else if (play.impactMeasurement) {
          // Update assessment window dates even without assessment
          const completionDate = new Date();
          const window = calculateAssessmentWindow(
            play.playId,
            play.category,
            completionDate
          );
          updates.impactMeasurement = {
            ...play.impactMeasurement,
            assessmentWindowOpensAt: window.opensAt.toISOString(),
            assessmentWindowClosesAt: window.closesAt.toISOString(),
          };
        }
      }

      return { ...play, ...updates };
    }),
  };
};

/**
 * Update a play's status (legacy version without impact measurement)
 * Use updatePlayStatus with assessment parameter for full impact tracking
 */
export const updatePlayStatusSimple = (
  plan: ImprovementPlan,
  playId: string,
  newStatus: PlanPlay['status']
): ImprovementPlan => {
  return updatePlayStatus(plan, playId, newStatus);
};

/**
 * Add a task to a play
 */
export const addTaskToPlay = (
  plan: ImprovementPlan,
  playId: string,
  taskTitle: string
): ImprovementPlan => {
  const now = new Date().toISOString();

  return {
    ...plan,
    updatedAt: now,
    plays: plan.plays.map(play => {
      if (play.id !== playId) return play;

      return {
        ...play,
        tasks: [
          ...play.tasks,
          {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: taskTitle,
            status: 'pending',
            createdAt: now,
          },
        ],
      };
    }),
  };
};

/**
 * Update a task's status
 */
export const updateTaskStatus = (
  plan: ImprovementPlan,
  playId: string,
  taskId: string,
  newStatus: 'pending' | 'in-progress' | 'completed'
): ImprovementPlan => {
  const now = new Date().toISOString();

  return {
    ...plan,
    updatedAt: now,
    plays: plan.plays.map(play => {
      if (play.id !== playId) return play;

      return {
        ...play,
        tasks: play.tasks.map(task => {
          if (task.id !== taskId) return task;

          return {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? now : task.completedAt,
          };
        }),
      };
    }),
  };
};

/**
 * Delete a task from a play
 */
export const deleteTask = (
  plan: ImprovementPlan,
  playId: string,
  taskId: string
): ImprovementPlan => {
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    plays: plan.plays.map(play => {
      if (play.id !== playId) return play;

      return {
        ...play,
        tasks: play.tasks.filter(task => task.id !== taskId),
      };
    }),
  };
};

/**
 * Update play notes
 */
export const updatePlayNotes = (
  plan: ImprovementPlan,
  playId: string,
  notes: string
): ImprovementPlan => {
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    plays: plan.plays.map(play => {
      if (play.id !== playId) return play;
      return { ...play, notes };
    }),
  };
};

/**
 * Reorder plays by updating their priorities
 */
export const reorderPlays = (
  plan: ImprovementPlan,
  orderedPlayIds: string[]
): ImprovementPlan => {
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    plays: plan.plays.map(play => {
      const newPriority = orderedPlayIds.indexOf(play.id);
      if (newPriority === -1) return play;
      return { ...play, priority: newPriority + 1 };
    }),
  };
};

// ============================================
// Storage Utilities
// ============================================

const STORAGE_KEY_PREFIX = 'improvement-plan-';
const PLANS_INDEX_KEY = 'improvement-plans-index';

/**
 * Get the storage key for a specific plan
 */
export const getStorageKey = (planId: string): string => {
  return `${STORAGE_KEY_PREFIX}${planId}`;
};

/**
 * Get the storage key for a team's plans (legacy - for migration)
 */
export const getLegacyStorageKey = (teamId: string): string => {
  return `${STORAGE_KEY_PREFIX}${teamId}`;
};

/**
 * Get all plan IDs for a team from the index
 */
export const getTeamPlanIds = (teamId: string): string[] => {
  try {
    const indexStr = localStorage.getItem(PLANS_INDEX_KEY);
    if (!indexStr) return [];
    const index: Record<string, string[]> = JSON.parse(indexStr);
    return index[teamId] || [];
  } catch (e) {
    console.error('Failed to get team plan IDs', e);
    return [];
  }
};

/**
 * Update the plans index for a team
 */
const updatePlansIndex = (teamId: string, planIds: string[]): void => {
  try {
    const indexStr = localStorage.getItem(PLANS_INDEX_KEY);
    const index: Record<string, string[]> = indexStr ? JSON.parse(indexStr) : {};
    index[teamId] = planIds;
    localStorage.setItem(PLANS_INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.error('Failed to update plans index', e);
  }
};

/**
 * Save a plan to localStorage (supports multiple plans)
 */
export const savePlanToStorage = (plan: ImprovementPlan): void => {
  try {
    // Save the plan itself
    const key = getStorageKey(plan.id);
    localStorage.setItem(key, JSON.stringify(plan));

    // Update the index
    const planIds = getTeamPlanIds(plan.teamId);
    if (!planIds.includes(plan.id)) {
      planIds.push(plan.id);
      updatePlansIndex(plan.teamId, planIds);
    }
  } catch (e) {
    console.error('Failed to save improvement plan to storage', e);
  }
};

/**
 * Load a specific plan from localStorage by ID
 */
export const loadPlanById = (planId: string): ImprovementPlan | null => {
  try {
    const key = getStorageKey(planId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const plan = JSON.parse(stored) as ImprovementPlan;
    // Normalize to include new fields for backward compat
    return normalizePlan(plan);
  } catch (e) {
    console.error('Failed to load improvement plan from storage', e);
    return null;
  }
};

/**
 * Load all plans for a team from localStorage
 */
export const loadAllPlansForTeam = (teamId: string): ImprovementPlan[] => {
  try {
    const planIds = getTeamPlanIds(teamId);
    const plans: ImprovementPlan[] = [];

    for (const planId of planIds) {
      const plan = loadPlanById(planId);
      if (plan) {
        plans.push(plan);
      }
    }

    // Also check for legacy single-plan storage and migrate
    const legacyKey = getLegacyStorageKey(teamId);
    const legacyStored = localStorage.getItem(legacyKey);
    if (legacyStored) {
      try {
        const legacyPlan = JSON.parse(legacyStored) as ImprovementPlan;
        // Check if this plan is already in the new format
        if (!plans.find(p => p.id === legacyPlan.id)) {
          // Migrate to new format
          savePlanToStorage(legacyPlan);
          plans.push(legacyPlan);
        }
        // Remove legacy storage
        localStorage.removeItem(legacyKey);
      } catch (e) {
        // Invalid legacy data, just remove it
        localStorage.removeItem(legacyKey);
      }
    }

    // Sort by updatedAt descending (most recent first)
    return plans.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (e) {
    console.error('Failed to load plans for team', e);
    return [];
  }
};

/**
 * Load a plan from localStorage (legacy compatibility - returns first active plan)
 */
export const loadPlanFromStorage = (teamId: string): ImprovementPlan | null => {
  const plans = loadAllPlansForTeam(teamId);
  // Return the first active (non-archived) plan
  return plans.find(p => p.status !== 'archived') || null;
};

/**
 * Delete a plan from localStorage
 */
export const deletePlanFromStorage = (plan: ImprovementPlan): void => {
  try {
    // Remove the plan
    const key = getStorageKey(plan.id);
    localStorage.removeItem(key);

    // Update the index
    const planIds = getTeamPlanIds(plan.teamId);
    const updatedIds = planIds.filter(id => id !== plan.id);
    updatePlansIndex(plan.teamId, updatedIds);
  } catch (e) {
    console.error('Failed to delete improvement plan from storage', e);
  }
};

/**
 * Clear a plan from localStorage (legacy alias)
 */
export const clearPlanFromStorage = (teamId: string): void => {
  // For legacy compatibility, this now does nothing
  // Use deletePlanFromStorage instead
  console.warn('clearPlanFromStorage is deprecated, use deletePlanFromStorage');
};

// ============================================
// Display Helpers
// ============================================

/**
 * Get a suggested default name for the plan based on targets
 */
export const generateDefaultPlanName = (targets: OptimizationTarget[]): string => {
  if (targets.length === 0) return 'Improvement Plan';

  if (targets.length === 1) {
    return `Improve ${targets[0].name}`;
  }

  if (targets.length === 2) {
    return `Improve ${targets[0].name} & ${targets[1].name}`;
  }

  // More than 2 targets
  const firstTarget = targets[0].name;
  const remaining = targets.length - 1;
  return `Improve ${firstTarget} + ${remaining} more`;
};

/**
 * Get display string for target list
 */
export const formatTargetList = (targets: OptimizationTarget[]): string => {
  return targets.map(t => t.name).join(', ');
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'quick-win': return '⚡';
    case 'process': return '🔄';
    case 'culture': return '👥';
    case 'tooling': return '⚙️';
    default: return '📋';
  }
};

/**
 * Get intervention type icon
 */
export const getInterventionTypeIcon = (type: string): string => {
  switch (type) {
    case 'process': return '🔄';
    case 'culture': return '👥';
    case 'tooling': return '⚙️';
    default: return '📋';
  }
};

/**
 * Get priority icon
 */
export const getPriorityIcon = (priority: string): string => {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟠';
    case 'low': return '🟢';
    default: return '⚪';
  }
};

/**
 * Normalize a legacy PlanPlay to include new fields
 * Call this when loading plans from storage to ensure backward compat
 */
export const normalizePlanPlay = (play: PlanPlay): PlanPlay => {
  // If already has new fields, return as-is
  if (play.priorityLevel && play.interventionType) {
    return play;
  }

  // Calculate missing fields
  const priorityLevel = play.priorityLevel || calculatePriorityLevel(play.effort, play.impact);
  const interventionType = play.interventionType || inferInterventionType(play.category);

  return {
    ...play,
    priorityLevel,
    interventionType,
    sourceOutcomeIds: play.sourceOutcomeIds || (play.sourceOutcomeId ? [play.sourceOutcomeId] : []),
    sourceOutcomeNames: play.sourceOutcomeNames || (play.sourceOutcomeName ? [play.sourceOutcomeName] : []),
  };
};

/**
 * Normalize a plan to include new fields for backward compatibility
 */
export const normalizePlan = (plan: ImprovementPlan): ImprovementPlan => {
  return {
    ...plan,
    // Add default creator info for plans created before this field was added
    createdByUserId: plan.createdByUserId || 'system',
    createdByUserName: plan.createdByUserName || 'System',
    plays: plan.plays.map(normalizePlanPlay),
  };
};

/**
 * Get effort label
 */
export const getEffortLabel = (effort: string): string => {
  switch (effort) {
    case 'low': return 'Low Effort';
    case 'medium': return 'Medium Effort';
    case 'high': return 'High Effort';
    default: return effort;
  }
};

/**
 * Get impact label
 */
export const getImpactLabel = (impact: string): string => {
  switch (impact) {
    case 'low': return 'Low Impact';
    case 'medium': return 'Medium Impact';
    case 'high': return 'High Impact';
    default: return impact;
  }
};
