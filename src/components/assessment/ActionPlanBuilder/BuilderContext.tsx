import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DimensionResult } from '../../../types/assessment';
import { ActionPlanZoneTag } from '../../../types/actionPlan';
import {
  ActionSelection,
  BuilderWizardState,
  BuilderContextValue,
  BuilderCommitPayload,
  SelectableDimension,
  DIMENSION_EXPLANATIONS,
} from '../../../types/actionPlanBuilder';

// Helper to determine zone from percentile and trend change
const getZoneTag = (percentile: number, trendChange: number): ActionPlanZoneTag => {
  const riskLevel = percentile >= 67 ? 'low' : percentile >= 34 ? 'moderate' : 'high';
  const trendDir = trendChange < -3 ? 'declining' : trendChange > 3 ? 'improving' : 'stable';

  if (riskLevel === 'high') {
    if (trendDir === 'declining') return 'critical';
    if (trendDir === 'stable') return 'urgent';
    return 'momentum';
  }
  if (riskLevel === 'moderate') {
    if (trendDir === 'declining') return 'prevent';
    if (trendDir === 'stable') return 'monitor';
    return 'progressing';
  }
  if (trendDir === 'declining') return 'early-warning';
  if (trendDir === 'stable') return 'sustain';
  return 'celebrate';
};

// Calculate trend change from dimension's trend data
const calculateTrendChange = (dim: DimensionResult): number => {
  if (!dim.trendData || dim.trendData.length < 2) return 0;
  const first = dim.trendData[0].value;
  const last = dim.trendData[dim.trendData.length - 1].value;
  return Math.round(last - first);
};

// Get health status from score (CHS thresholds: 55+ = on-track, 30-54 = needs-attention, <30 = at-risk)
const getHealthStatus = (score: number): 'at-risk' | 'needs-attention' | 'on-track' => {
  if (score < 30) return 'at-risk';
  if (score < 55) return 'needs-attention';
  return 'on-track';
};

// Get risk level from score (CHS thresholds: 55+ = low, 30-54 = moderate, <30 = high)
const getRiskLevel = (score: number): 'high' | 'moderate' | 'low' => {
  if (score < 30) return 'high';
  if (score < 55) return 'moderate';
  return 'low';
};

// Context
const BuilderContext = createContext<BuilderContextValue | null>(null);

export const useBuilderContext = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilderContext must be used within BuilderProvider');
  }
  return context;
};

interface BuilderProviderProps {
  children: React.ReactNode;
  dimensions: DimensionResult[];
  onCommit: (payload: BuilderCommitPayload) => void;
  onClose: () => void;
}

export const BuilderProvider: React.FC<BuilderProviderProps> = ({
  children,
  dimensions,
  onCommit,
  onClose,
}) => {
  // Build selectable dimensions from raw dimension results
  const initialSelectableDimensions = useMemo((): SelectableDimension[] => {
    return dimensions.map((dim) => {
      const healthScore = dim.healthScore ?? dim.overallPercentile;
      const healthStatus = getHealthStatus(healthScore);
      const riskLevel = getRiskLevel(healthScore);
      const isRecommended = healthStatus !== 'on-track';

      // Count actions
      let totalActions = 0;
      let quickWinActions = 0;
      for (const rec of dim.recommendations) {
        totalActions++;
        if (rec.effort === 'low' && rec.impact === 'high') {
          quickWinActions++;
        }
      }

      // Count indicators from categories
      let flaggedIndicators = 0;
      let healthyIndicators = 0;
      for (const category of dim.categories) {
        for (const indicator of category.indicators) {
          if (indicator.benchmarkPercentile < 34) {
            flaggedIndicators++;
          } else {
            healthyIndicators++;
          }
        }
      }

      // Get explanation or create a default one
      const explanation = DIMENSION_EXPLANATIONS[dim.dimensionKey] || {
        title: dim.dimensionName,
        whatItMeans: `How well your team performs in ${dim.dimensionName.toLowerCase()}`,
        whyItMatters: 'Improving this area helps your team work more effectively',
        impact: 'Poor performance in this area can slow down your team',
      };

      return {
        dimensionKey: dim.dimensionKey,
        dimensionName: dim.dimensionName,
        explanation,
        healthScore,
        healthStatus,
        riskLevel,
        trend: dim.trend,
        totalActions,
        quickWinActions,
        flaggedIndicators,
        healthyIndicators,
        isSelected: isRecommended, // Pre-select dimensions that need attention
        isRecommended,
        priority: null, // Will be set in Step 2
      };
    });
  }, [dimensions]);

  // Build all action selections from dimensions
  const buildSelections = useCallback((selectableDims: SelectableDimension[]): ActionSelection[] => {
    const selections: ActionSelection[] = [];
    const selectedDimKeys = new Set(selectableDims.filter(d => d.isSelected).map(d => d.dimensionKey));

    for (const dim of dimensions) {
      const trendChange = calculateTrendChange(dim);
      const zoneTag = getZoneTag(dim.healthScore ?? dim.overallPercentile, trendChange);
      const isInSelectedDimension = selectedDimKeys.has(dim.dimensionKey);

      for (const rec of dim.recommendations) {
        selections.push({
          recommendationId: rec.id,
          dimensionKey: dim.dimensionKey,
          dimensionName: dim.dimensionName,
          zoneTag,
          recommendation: rec,
          // Auto-select actions when their dimension is selected
          selected: isInSelectedDimension,
          priority: null,
          isFocus: false,
        });
      }
    }

    return selections;
  }, [dimensions]);

  const [state, setState] = useState<BuilderWizardState>(() => ({
    currentStep: 0,
    dimensions: initialSelectableDimensions,
    selections: buildSelections(initialSelectableDimensions),
    isComplete: false,
  }));

  // Navigation actions
  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: Math.max(0, Math.min(3, step)) }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      // When moving from Step 1 to Step 2, assign initial priorities based on health status
      if (prev.currentStep === 0) {
        const selectedDims = prev.dimensions.filter(d => d.isSelected);
        // Sort by health: at-risk first, then needs-attention, then on-track
        const sorted = [...selectedDims].sort((a, b) => {
          const order = { 'at-risk': 0, 'needs-attention': 1, 'on-track': 2 };
          return order[a.healthStatus] - order[b.healthStatus];
        });

        const priorityMap = new Map(sorted.map((d, i) => [d.dimensionKey, i]));

        return {
          ...prev,
          currentStep: 1,
          dimensions: prev.dimensions.map(dim => ({
            ...dim,
            priority: priorityMap.get(dim.dimensionKey) ?? null,
          })),
        };
      }
      return { ...prev, currentStep: Math.min(3, prev.currentStep + 1) };
    });
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  }, []);

  // Dimension Selection (Step 1)
  const toggleDimension = useCallback((dimensionKey: string) => {
    setState(prev => {
      const dimension = prev.dimensions.find(d => d.dimensionKey === dimensionKey);
      const wasSelected = dimension?.isSelected ?? false;
      const willBeSelected = !wasSelected;

      return {
        ...prev,
        dimensions: prev.dimensions.map(dim =>
          dim.dimensionKey === dimensionKey ? { ...dim, isSelected: willBeSelected, priority: null } : dim
        ),
        // Auto-select/deselect all actions for this dimension
        selections: prev.selections.map(sel =>
          sel.dimensionKey === dimensionKey ? { ...sel, selected: willBeSelected } : sel
        ),
      };
    });
  }, []);

  const selectAllRecommended = useCallback(() => {
    setState(prev => {
      const recommendedDimKeys = new Set(
        prev.dimensions.filter(d => d.isRecommended).map(d => d.dimensionKey)
      );

      return {
        ...prev,
        dimensions: prev.dimensions.map(dim => ({
          ...dim,
          isSelected: dim.isRecommended,
          priority: null,
        })),
        selections: prev.selections.map(sel => ({
          ...sel,
          selected: recommendedDimKeys.has(sel.dimensionKey),
        })),
      };
    });
  }, []);

  const deselectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(dim => ({ ...dim, isSelected: false, priority: null })),
      selections: prev.selections.map(sel => ({ ...sel, selected: false })),
    }));
  }, []);

  // Dimension Prioritization (Step 2)
  const reorderDimensions = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      // Get selected dimensions sorted by priority
      const selectedDims = prev.dimensions
        .filter(d => d.isSelected)
        .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

      // Reorder
      const [removed] = selectedDims.splice(fromIndex, 1);
      selectedDims.splice(toIndex, 0, removed);

      // Assign new priorities
      const priorityMap = new Map(selectedDims.map((d, i) => [d.dimensionKey, i]));

      return {
        ...prev,
        dimensions: prev.dimensions.map(dim => ({
          ...dim,
          priority: priorityMap.get(dim.dimensionKey) ?? dim.priority,
        })),
      };
    });
  }, []);

  // Action Selection (Step 3) - fine-tune individual actions
  const toggleSelection = useCallback((recommendationId: string) => {
    setState(prev => ({
      ...prev,
      selections: prev.selections.map(sel =>
        sel.recommendationId === recommendationId
          ? { ...sel, selected: !sel.selected }
          : sel
      ),
    }));
  }, []);

  const selectAllInDimension = useCallback((dimensionKey: string) => {
    setState(prev => ({
      ...prev,
      selections: prev.selections.map(sel =>
        sel.dimensionKey === dimensionKey ? { ...sel, selected: true } : sel
      ),
    }));
  }, []);

  const deselectAllInDimension = useCallback((dimensionKey: string) => {
    setState(prev => ({
      ...prev,
      selections: prev.selections.map(sel =>
        sel.dimensionKey === dimensionKey ? { ...sel, selected: false } : sel
      ),
    }));
  }, []);

  // Commit action (Step 4)
  const commit = useCallback(() => {
    // Get selected dimensions sorted by priority
    const prioritizedDims = state.dimensions
      .filter(d => d.isSelected)
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

    // Order actions by dimension priority
    const orderedActions: ActionSelection[] = [];
    for (const dim of prioritizedDims) {
      const dimActions = state.selections
        .filter(s => s.selected && s.dimensionKey === dim.dimensionKey)
        .sort((a, b) => {
          // Within dimension, sort by impact (high first) then effort (low first)
          const impactOrder = { high: 0, medium: 1, low: 2 };
          const effortOrder = { low: 0, medium: 1, high: 2 };
          const impactDiff = impactOrder[a.recommendation.impact] - impactOrder[b.recommendation.impact];
          if (impactDiff !== 0) return impactDiff;
          return effortOrder[a.recommendation.effort] - effortOrder[b.recommendation.effort];
        });
      orderedActions.push(...dimActions);
    }

    const payload: BuilderCommitPayload = {
      selections: orderedActions.map((sel, idx) => ({
        recommendationId: sel.recommendationId,
        dimensionKey: sel.dimensionKey,
        zoneTag: sel.zoneTag,
        priority: idx,
        isFocus: idx < 3, // Top 3 actions are marked as focus
        recommendation: sel.recommendation,
      })),
      committedAt: new Date().toISOString(),
    };

    onCommit(payload);
    setState(prev => ({ ...prev, isComplete: true }));
  }, [state.dimensions, state.selections, onCommit]);

  const reset = useCallback(() => {
    setState({
      currentStep: 0,
      dimensions: initialSelectableDimensions,
      selections: buildSelections(initialSelectableDimensions),
      isComplete: false,
    });
  }, [initialSelectableDimensions, buildSelections]);

  // Computed values
  const computed = useMemo(() => {
    const selectedDimensions = state.dimensions.filter(d => d.isSelected);
    const selectedDimKeys = new Set(selectedDimensions.map(d => d.dimensionKey));

    // Prioritized dimensions (sorted by priority)
    const prioritizedDimensions = [...selectedDimensions].sort(
      (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
    );

    // Only consider actions from selected dimensions
    const availableActions = state.selections.filter(s => selectedDimKeys.has(s.dimensionKey));
    const selectedItems = availableActions.filter(s => s.selected);

    const quickWinCount = availableActions.filter(
      s => s.recommendation.effort === 'low' && s.recommendation.impact === 'high'
    ).length;

    // Calculate effort summary
    const avgEffort = selectedItems.length > 0
      ? selectedItems.reduce((sum, s) => {
          const val = s.recommendation.effort === 'low' ? 1 : s.recommendation.effort === 'medium' ? 2 : 3;
          return sum + val;
        }, 0) / selectedItems.length
      : 2;

    // Calculate impact summary
    const avgImpact = selectedItems.length > 0
      ? selectedItems.reduce((sum, s) => {
          const val = s.recommendation.impact === 'low' ? 1 : s.recommendation.impact === 'medium' ? 2 : 3;
          return sum + val;
        }, 0) / selectedItems.length
      : 2;

    // Actions grouped by dimension (ordered by dimension priority)
    const actionsByDimension = new Map<string, ActionSelection[]>();
    for (const dim of prioritizedDimensions) {
      const dimActions = state.selections
        .filter(s => s.dimensionKey === dim.dimensionKey)
        .sort((a, b) => {
          // Sort: quick wins first, then by impact
          const aQuickWin = a.recommendation.effort === 'low' && a.recommendation.impact === 'high';
          const bQuickWin = b.recommendation.effort === 'low' && b.recommendation.impact === 'high';
          if (aQuickWin !== bQuickWin) return aQuickWin ? -1 : 1;

          const impactOrder = { high: 0, medium: 1, low: 2 };
          return impactOrder[a.recommendation.impact] - impactOrder[b.recommendation.impact];
        });
      actionsByDimension.set(dim.dimensionKey, dimActions);
    }

    const effortSummary: 'low' | 'medium' | 'high' = avgEffort <= 1.5 ? 'low' : avgEffort <= 2.5 ? 'medium' : 'high';
    const impactSummary: 'low' | 'medium' | 'high' = avgImpact <= 1.5 ? 'low' : avgImpact <= 2.5 ? 'medium' : 'high';

    return {
      selectedDimensionCount: selectedDimensions.length,
      recommendedDimensionCount: state.dimensions.filter(d => d.isRecommended).length,
      prioritizedDimensions,
      selectedActionCount: selectedItems.length,
      availableActionCount: availableActions.length,
      quickWinCount,
      selectedItems,
      effortSummary,
      impactSummary,
      actionsByDimension,
    };
  }, [state.dimensions, state.selections]);

  const contextValue: BuilderContextValue = {
    state,
    rawDimensions: dimensions,
    actions: {
      goToStep,
      nextStep,
      prevStep,
      toggleDimension,
      selectAllRecommended,
      deselectAll,
      reorderDimensions,
      toggleSelection,
      selectAllInDimension,
      deselectAllInDimension,
      commit,
      reset,
    },
    computed,
  };

  return (
    <BuilderContext.Provider value={contextValue}>
      {children}
    </BuilderContext.Provider>
  );
};

export default BuilderContext;
