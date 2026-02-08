// useImprovementPlan Hook
// Manages multiple improvement plans with localStorage persistence

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ImprovementPlan,
  PlanPlay,
  PlanTask,
  PlayStatus,
  TaskStatus,
  PlanProgress,
  PlaysGroupedByStatus,
  calculatePlanProgress,
  groupPlaysByStatus,
} from '../types/improvementPlan';
import {
  loadAllPlansForTeam,
  loadPlanById,
  savePlanToStorage,
  deletePlanFromStorage,
  updatePlayStatus,
  addTaskToPlay,
  updateTaskStatus,
  deleteTask,
  updatePlayNotes,
  reorderPlays,
} from '../utils/improvementPlanUtils';
import { generateMockImpactDataForPlan } from '../utils/mockImpactData';

// Flag to enable mock impact data for testing
const ENABLE_MOCK_IMPACT_DATA = true;

interface UseImprovementPlanResult {
  // All plans
  allPlans: ImprovementPlan[];
  activePlans: ImprovementPlan[];
  archivedPlans: ImprovementPlan[];

  // Selected plan
  selectedPlan: ImprovementPlan | null;
  hasPlans: boolean;
  isLoading: boolean;

  // Newly created plan ID for auto-navigation
  newlyCreatedPlanId: string | null;
  clearNewlyCreatedPlan: () => void;

  // Computed values for selected plan
  progress: PlanProgress;
  playsByStatus: PlaysGroupedByStatus;
  activePlayCount: number;

  // Plan selection
  selectPlan: (planId: string) => void;

  // Plan actions
  addPlan: (plan: ImprovementPlan) => void;
  updatePlan: (plan: ImprovementPlan) => void;
  archivePlan: (planId?: string) => void;
  deletePlan: (planId: string) => void;

  // Play actions (for selected plan)
  setPlayStatus: (playId: string, status: PlayStatus) => void;
  setPlayNotes: (playId: string, notes: string) => void;
  reorderPlanPlays: (orderedPlayIds: string[]) => void;

  // Task actions (for selected plan)
  addTask: (playId: string, title: string) => void;
  setTaskStatus: (playId: string, taskId: string, status: TaskStatus) => void;
  removeTask: (playId: string, taskId: string) => void;

  // Refresh
  refreshPlans: () => void;
}

/**
 * Hook for managing multiple improvement plans with localStorage persistence
 */
export const useImprovementPlan = (teamId: string): UseImprovementPlanResult => {
  const [allPlans, setAllPlans] = useState<ImprovementPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyCreatedPlanId, setNewlyCreatedPlanId] = useState<string | null>(null);

  // Clear newly created plan ID
  const clearNewlyCreatedPlan = useCallback(() => {
    setNewlyCreatedPlanId(null);
  }, []);

  // Load all plans from storage on mount
  const refreshPlans = useCallback(() => {
    setIsLoading(true);
    let plans = loadAllPlansForTeam(teamId);

    // Inject mock impact data for testing if enabled
    if (ENABLE_MOCK_IMPACT_DATA && plans.length > 0) {
      plans = plans.map(plan => {
        // Only generate mock data if plan doesn't already have impact data
        if (!plan.impactSummary) {
          return generateMockImpactDataForPlan({ ...plan, plays: plan.plays.map(p => ({ ...p })) });
        }
        return plan;
      });
    }

    setAllPlans(plans);

    // If no plan selected, auto-select the first active plan
    if (!selectedPlanId || !plans.find(p => p.id === selectedPlanId)) {
      const firstActive = plans.find(p => p.status !== 'archived');
      setSelectedPlanId(firstActive?.id || null);
    }

    setIsLoading(false);
  }, [teamId, selectedPlanId]);

  useEffect(() => {
    refreshPlans();
  }, [teamId]);

  // Get selected plan
  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    return allPlans.find(p => p.id === selectedPlanId) || null;
  }, [allPlans, selectedPlanId]);

  // Filter plans by status
  const activePlans = useMemo(() =>
    allPlans.filter(p => p.status !== 'archived'),
    [allPlans]
  );

  const archivedPlans = useMemo(() =>
    allPlans.filter(p => p.status === 'archived'),
    [allPlans]
  );

  // Computed values for selected plan
  const hasPlans = activePlans.length > 0;

  const progress = useMemo((): PlanProgress => {
    if (!selectedPlan) {
      return {
        totalPlays: 0,
        backlog: 0,
        doNext: 0,
        inProgress: 0,
        completed: 0,
        skipped: 0,
        completionPercentage: 0,
      };
    }
    return calculatePlanProgress(selectedPlan.plays);
  }, [selectedPlan]);

  const playsByStatus = useMemo((): PlaysGroupedByStatus => {
    if (!selectedPlan) {
      return { backlog: [], doNext: [], inProgress: [], completed: [], skipped: [] };
    }
    return groupPlaysByStatus(selectedPlan.plays);
  }, [selectedPlan]);

  const activePlayCount = useMemo(() => {
    return progress.backlog + progress.doNext + progress.inProgress;
  }, [progress]);

  // Plan selection
  const selectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
  }, []);

  // Helper to update a plan in state and storage
  const updatePlanInState = useCallback((updatedPlan: ImprovementPlan) => {
    savePlanToStorage(updatedPlan);
    setAllPlans(prev =>
      prev.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    );
  }, []);

  // Plan actions
  const addPlan = useCallback((plan: ImprovementPlan) => {
    savePlanToStorage(plan);
    setAllPlans(prev => [plan, ...prev]);
    setSelectedPlanId(plan.id);
    // Track newly created plan for auto-navigation
    setNewlyCreatedPlanId(plan.id);
  }, []);

  const updatePlan = useCallback((plan: ImprovementPlan) => {
    updatePlanInState(plan);
  }, [updatePlanInState]);

  const archivePlan = useCallback((planId?: string) => {
    const idToArchive = planId || selectedPlanId;
    if (!idToArchive) return;

    const plan = allPlans.find(p => p.id === idToArchive);
    if (!plan) return;

    const archivedPlan = {
      ...plan,
      status: 'archived' as const,
      updatedAt: new Date().toISOString(),
    };
    updatePlanInState(archivedPlan);

    // If we archived the selected plan, select the next active one
    if (idToArchive === selectedPlanId) {
      const nextActive = allPlans.find(p => p.id !== idToArchive && p.status !== 'archived');
      setSelectedPlanId(nextActive?.id || null);
    }
  }, [allPlans, selectedPlanId, updatePlanInState]);

  const deletePlan = useCallback((planId: string) => {
    const plan = allPlans.find(p => p.id === planId);
    if (!plan) return;

    deletePlanFromStorage(plan);
    setAllPlans(prev => prev.filter(p => p.id !== planId));

    // If we deleted the selected plan, select the next one
    if (planId === selectedPlanId) {
      const remaining = allPlans.filter(p => p.id !== planId && p.status !== 'archived');
      setSelectedPlanId(remaining[0]?.id || null);
    }
  }, [allPlans, selectedPlanId]);

  // Play actions (for selected plan)
  const setPlayStatus = useCallback((playId: string, status: PlayStatus) => {
    if (!selectedPlan) return;
    updatePlanInState(updatePlayStatus(selectedPlan, playId, status));
  }, [selectedPlan, updatePlanInState]);

  const setPlayNotes = useCallback((playId: string, notes: string) => {
    if (!selectedPlan) return;
    updatePlanInState(updatePlayNotes(selectedPlan, playId, notes));
  }, [selectedPlan, updatePlanInState]);

  const reorderPlanPlays = useCallback((orderedPlayIds: string[]) => {
    if (!selectedPlan) return;
    updatePlanInState(reorderPlays(selectedPlan, orderedPlayIds));
  }, [selectedPlan, updatePlanInState]);

  // Task actions (for selected plan)
  const addTask = useCallback((playId: string, title: string) => {
    if (!selectedPlan) return;
    updatePlanInState(addTaskToPlay(selectedPlan, playId, title));
  }, [selectedPlan, updatePlanInState]);

  const setTaskStatus = useCallback((playId: string, taskId: string, status: TaskStatus) => {
    if (!selectedPlan) return;
    updatePlanInState(updateTaskStatus(selectedPlan, playId, taskId, status));
  }, [selectedPlan, updatePlanInState]);

  const removeTask = useCallback((playId: string, taskId: string) => {
    if (!selectedPlan) return;
    updatePlanInState(deleteTask(selectedPlan, playId, taskId));
  }, [selectedPlan, updatePlanInState]);

  return {
    // All plans
    allPlans,
    activePlans,
    archivedPlans,

    // Selected plan
    selectedPlan,
    hasPlans,
    isLoading,

    // Newly created plan for auto-navigation
    newlyCreatedPlanId,
    clearNewlyCreatedPlan,

    // Computed values
    progress,
    playsByStatus,
    activePlayCount,

    // Plan selection
    selectPlan,

    // Plan actions
    addPlan,
    updatePlan,
    archivePlan,
    deletePlan,

    // Play actions
    setPlayStatus,
    setPlayNotes,
    reorderPlanPlays,

    // Task actions
    addTask,
    setTaskStatus,
    removeTask,

    // Refresh
    refreshPlans,
  };
};

export default useImprovementPlan;
