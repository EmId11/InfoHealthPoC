import { useState, useEffect, useCallback, useMemo } from 'react';
import { DimensionResult, PrioritizedRecommendation, PriorityQuadrantType, PriorityZoneType } from '../types/assessment';
import {
  ActionPlanItem,
  ActionPlanState,
  ActionPlanSection,
  ActionStatus,
  ActionPlanTag,
  ActionPlanZoneTag,
  BaselineSnapshot,
  DimensionPriority,
  QUADRANT_TO_TAG,
  ZONE_TO_TAG,
} from '../types/actionPlan';
import { Action, Play, PlayCategory } from '../types/playbook';
import { themeGroups } from '../constants/themeGroups';
import { BuilderCommitPayload } from '../types/actionPlanBuilder';

const STORAGE_KEY_PREFIX = 'jira-health-action-plan-';
const CURRENT_VERSION = 4; // Bumped version: start with empty plan, users add items explicitly

// Helper to determine quadrant from dimension (legacy)
const getQuadrant = (riskLevel: 'low' | 'moderate' | 'high', trend: 'improving' | 'stable' | 'declining'): PriorityQuadrantType => {
  const isHighRisk = riskLevel === 'high';
  const isDeclining = trend === 'declining';

  if (isHighRisk && isDeclining) return 'fix-now';
  if (isHighRisk) return 'monitor';
  if (isDeclining) return 'watch-out';
  return 'celebrate';
};

// Calculate trend change from dimension's trend data
const calculateDimensionTrendChange = (dim: DimensionResult): number => {
  if (!dim.trendData || dim.trendData.length < 2) return 0;
  const first = dim.trendData[0].value;
  const last = dim.trendData[dim.trendData.length - 1].value;
  return Math.round(last - first);
};

// Helper to determine zone from percentile and trend change (new 9-zone system)
const getZone = (percentile: number, trendChange: number): PriorityZoneType => {
  // Determine risk level from percentile
  const riskLevel = percentile >= 67 ? 'low' : percentile >= 34 ? 'moderate' : 'high';

  // Determine trend direction from numerical change
  const trendDir = trendChange < -3 ? 'declining' : trendChange > 3 ? 'improving' : 'stable';

  // Map to zone based on 3x3 matrix
  if (riskLevel === 'high') {
    if (trendDir === 'declining') return 'act-now';
    if (trendDir === 'stable') return 'address';
    return 'keep-pushing';
  }
  if (riskLevel === 'moderate') {
    if (trendDir === 'declining') return 'act-soon';
    if (trendDir === 'stable') return 'monitor';
    return 'good-progress';
  }
  // Low risk
  if (trendDir === 'declining') return 'heads-up';
  if (trendDir === 'stable') return 'maintain';
  return 'celebrate';
};

// Build prioritized recommendations from dimensions with zone info
const buildRecommendationsFromDimensions = (dimensions: DimensionResult[]): Array<{
  recommendation: PrioritizedRecommendation;
  quadrant: PriorityQuadrantType;
  tag: ActionPlanTag;
  zone: PriorityZoneType;
  zoneTag: ActionPlanZoneTag;
}> => {
  const results: Array<{
    recommendation: PrioritizedRecommendation;
    quadrant: PriorityQuadrantType;
    tag: ActionPlanTag;
    zone: PriorityZoneType;
    zoneTag: ActionPlanZoneTag;
  }> = [];

  for (const dim of dimensions) {
    // Legacy quadrant
    const quadrant = getQuadrant(dim.riskLevel, dim.trend);
    const tag = QUADRANT_TO_TAG[quadrant];

    // New zone calculation
    const trendChange = calculateDimensionTrendChange(dim);
    const zone = getZone(dim.overallPercentile, trendChange);
    const zoneTag = ZONE_TO_TAG[zone];

    for (const rec of dim.recommendations) {
      results.push({
        recommendation: {
          ...rec,
          sourceDimension: dim.dimensionName,
          sourceDimensionKey: dim.dimensionKey,
          priority: calculatePriority(rec.impact, rec.effort),
        },
        quadrant,
        tag,
        zone,
        zoneTag,
      });
    }
  }

  return results;
};

// Priority calculation
const IMPACT_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 };
const EFFORT_WEIGHT: Record<string, number> = { low: 3, medium: 2, high: 1 };

const calculatePriority = (impact: 'low' | 'medium' | 'high', effort: 'low' | 'medium' | 'high'): number => {
  return IMPACT_WEIGHT[impact] * EFFORT_WEIGHT[effort];
};

// Capture baseline snapshot from dimension when action starts
const captureBaselineSnapshot = (
  dimensionKey: string,
  dimensions: DimensionResult[]
): BaselineSnapshot | undefined => {
  const dimension = dimensions.find(d => d.dimensionKey === dimensionKey);
  if (!dimension) return undefined;

  // Collect all indicators from all categories
  const indicators = dimension.categories.flatMap(cat =>
    cat.indicators.map(ind => ({
      indicatorId: ind.id,
      indicatorName: ind.name,
      value: ind.value,
      unit: ind.unit,
    }))
  );

  return {
    capturedAt: new Date().toISOString(),
    dimensionKey: dimension.dimensionKey,
    dimensionHealthScore: dimension.healthScore,
    indicators,
  };
};

// Custom action input type
export interface CustomActionInput {
  title: string;
  description: string;
  category: 'process' | 'tooling' | 'culture' | 'governance';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dimensionKey: string; // Which dimension this action relates to
}

// Edit action input type
export interface EditActionInput {
  id: string; // The action ID to edit
  title: string;
  description: string;
  category: 'process' | 'tooling' | 'culture' | 'governance';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  dimensionKey: string; // Which dimension this action relates to
}

interface UseActionPlanReturn {
  sections: ActionPlanSection[];
  items: ActionPlanItem[];
  updateStatus: (itemId: string, status: ActionStatus) => void;
  reorderWithinSection: (dimensionKey: string, fromIndex: number, toIndex: number) => void;
  getItemById: (itemId: string) => ActionPlanItem | undefined;
  removeItem: (itemId: string) => void;
  addCustomAction: (input: CustomActionInput) => void;
  updateItem: (input: EditActionInput) => void;
  // Playbook integration
  addPlayToPlan: (play: Action | Play, dimensionKey: string, dimensionName: string) => void;
  isPlayInPlan: (playId: string) => boolean;
  itemCount: number;
  completedCount: number;
  inProgressCount: number;
  hasCommittedPlan: boolean;
  clearPlan: () => void;
  replaceWithBuilderPlan: (payload: BuilderCommitPayload) => void;
  // Dimension-level operations
  addDimension: (dimensionKey: string) => void;
  removeDimension: (dimensionKey: string) => void;
  isDimensionInPlan: (dimensionKey: string) => boolean;
  getDimensionItemCount: (dimensionKey: string) => number;
  dimensionPriorities: DimensionPriority[];
  // Theme-level operations
  addTheme: (themeId: string) => void;
  removeTheme: (themeId: string) => void;
  isThemeInPlan: (themeId: string) => boolean;
  isThemePartiallyInPlan: (themeId: string) => boolean;
  getThemeItemCount: (themeId: string) => number;
  getThemeTotalRecommendations: (themeId: string) => number;
}

export function useActionPlan(assessmentId: string, dimensions: DimensionResult[]): UseActionPlanReturn {
  const storageKey = `${STORAGE_KEY_PREFIX}${assessmentId}`;

  // Build initial items from dimensions
  const initialItems = useMemo(() => {
    const recommendations = buildRecommendationsFromDimensions(dimensions);
    const now = new Date().toISOString();

    return recommendations.map((rec, index) => ({
      id: `action-${rec.recommendation.id}`,
      recommendationId: rec.recommendation.id,
      recommendation: rec.recommendation,
      tag: rec.tag,
      zoneTag: rec.zoneTag,
      sourceQuadrant: rec.quadrant,
      sourceZone: rec.zone,
      position: index,
      status: 'pending' as ActionStatus,
      subTasks: { total: 0, completed: 0 },
      addedAt: now,
    }));
  }, [dimensions]);

  const [state, setState] = useState<ActionPlanState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ActionPlanState;
        if (parsed.version === CURRENT_VERSION && Array.isArray(parsed.items)) {
          // If user has committed a plan, use stored items directly
          if (parsed.hasCommittedPlan) {
            // If dimensionPriorities not stored, derive from items for backwards compatibility
            let dimensionPriorities = parsed.dimensionPriorities;
            if (!dimensionPriorities || dimensionPriorities.length === 0) {
              // Extract unique dimensions from items in order of first appearance
              const dimMap = new Map<string, { name: string; priority: number }>();
              parsed.items.forEach(item => {
                const key = item.recommendation.sourceDimensionKey;
                if (key && !dimMap.has(key)) {
                  const dim = dimensions.find(d => d.dimensionKey === key);
                  dimMap.set(key, {
                    name: item.recommendation.sourceDimension || dim?.dimensionName || key,
                    priority: dimMap.size,
                  });
                }
              });
              dimensionPriorities = Array.from(dimMap.entries()).map(([key, val]) => ({
                dimensionKey: key,
                dimensionName: val.name,
                priority: val.priority,
              }));
            }

            return {
              version: CURRENT_VERSION,
              items: parsed.items,
              assessmentId,
              lastModified: parsed.lastModified,
              hasCommittedPlan: true,
              committedAt: parsed.committedAt,
              dimensionPriorities,
            };
          }
          // Legacy: if hasCommittedPlan is not set but items exist with status changes,
          // treat as committed (backwards compatibility)
          const hasProgress = parsed.items.some(item => item.status !== 'pending');
          if (hasProgress) {
            // Merge stored state with current recommendations
            const storedItemMap = new Map(parsed.items.map(item => [item.recommendationId, item]));
            const mergedItems = initialItems.map(newItem => {
              const storedItem = storedItemMap.get(newItem.recommendationId);
              if (storedItem) {
                return {
                  ...newItem,
                  status: storedItem.status,
                  subTasks: storedItem.subTasks,
                  startedAt: storedItem.startedAt,
                  completedAt: storedItem.completedAt,
                  position: storedItem.position,
                  baselineSnapshot: storedItem.baselineSnapshot,
                };
              }
              return newItem;
            });

            // Derive dimension priorities from merged items
            const dimMap = new Map<string, { name: string; priority: number }>();
            mergedItems.forEach(item => {
              const key = item.recommendation.sourceDimensionKey;
              if (key && !dimMap.has(key)) {
                const dim = dimensions.find(d => d.dimensionKey === key);
                dimMap.set(key, {
                  name: item.recommendation.sourceDimension || dim?.dimensionName || key,
                  priority: dimMap.size,
                });
              }
            });
            const dimensionPriorities = Array.from(dimMap.entries()).map(([key, val]) => ({
              dimensionKey: key,
              dimensionName: val.name,
              priority: val.priority,
            }));

            return {
              version: CURRENT_VERSION,
              items: mergedItems,
              assessmentId,
              lastModified: new Date().toISOString(),
              hasCommittedPlan: true,  // Assume committed if there's progress
              dimensionPriorities,
            };
          }
        }
      }
    } catch (e) {
      console.error('Failed to load action plan from localStorage:', e);
    }

    // No stored state or no committed plan - start EMPTY (builder mode)
    return {
      version: CURRENT_VERSION,
      items: [],  // Start empty until user builds plan
      assessmentId,
      lastModified: new Date().toISOString(),
      hasCommittedPlan: false,
    };
  });

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save action plan to localStorage:', e);
    }
  }, [state, storageKey]);

  // Update status of an action
  const updateStatus = useCallback((itemId: string, status: ActionStatus) => {
    setState(prev => {
      const now = new Date().toISOString();
      const updatedItems = prev.items.map(item => {
        if (item.id !== itemId) return item;

        const updates: Partial<ActionPlanItem> = { status };

        // Track timestamps and capture baseline when starting
        if (status === 'in-progress' && !item.startedAt) {
          updates.startedAt = now;
          // Capture baseline indicator values at the moment action starts
          if (!item.baselineSnapshot) {
            updates.baselineSnapshot = captureBaselineSnapshot(
              item.recommendation.sourceDimensionKey,
              dimensions
            );
          }
        }
        if (status === 'done' && !item.completedAt) {
          updates.completedAt = now;
        }
        // Clear completedAt if moving back from done
        if (status !== 'done' && item.completedAt) {
          updates.completedAt = undefined;
        }

        return { ...item, ...updates };
      });

      return {
        ...prev,
        items: updatedItems,
        lastModified: now,
      };
    });
  }, [dimensions]);

  // Reorder within a section (using dimensionKey for dimension-based grouping)
  const reorderWithinSection = useCallback((dimensionKey: string, fromIndex: number, toIndex: number) => {
    setState(prev => {
      // Get items for this dimension, sorted by position
      const dimensionItems = prev.items
        .filter(item => item.recommendation.sourceDimensionKey === dimensionKey)
        .sort((a, b) => a.position - b.position);

      // Reorder
      const [removed] = dimensionItems.splice(fromIndex, 1);
      dimensionItems.splice(toIndex, 0, removed);

      // Update positions
      const updatedDimensionItems = dimensionItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      // Merge back with other items
      const otherItems = prev.items.filter(item => item.recommendation.sourceDimensionKey !== dimensionKey);
      const allItems = [...otherItems, ...updatedDimensionItems];

      return {
        ...prev,
        items: allItems,
        lastModified: new Date().toISOString(),
      };
    });
  }, []);

  // Get item by ID
  const getItemById = useCallback((itemId: string) => {
    return state.items.find(item => item.id === itemId);
  }, [state.items]);

  // Remove an item
  const removeItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
      lastModified: new Date().toISOString(),
    }));
  }, []);

  // Add a custom action
  const addCustomAction = useCallback((input: CustomActionInput) => {
    setState(prev => {
      const now = new Date().toISOString();
      const customId = `custom-${Date.now()}`;

      // Look up the dimension to calculate zone automatically
      const dimension = dimensions.find(d => d.dimensionKey === input.dimensionKey);

      // Calculate zone from dimension's position on the priority matrix
      let zone: PriorityZoneType = 'monitor'; // Default fallback
      let quadrant: PriorityQuadrantType = 'monitor';
      let sourceDimension = 'Custom Action';
      let sourceDimensionKey = 'custom';

      if (dimension) {
        const trendChange = calculateDimensionTrendChange(dimension);
        zone = getZone(dimension.overallPercentile, trendChange);
        quadrant = getQuadrant(dimension.riskLevel, dimension.trend);
        sourceDimension = dimension.dimensionName;
        sourceDimensionKey = dimension.dimensionKey;
      }

      const zoneTag = ZONE_TO_TAG[zone];

      const newItem: ActionPlanItem = {
        id: customId,
        recommendationId: customId,
        recommendation: {
          id: customId,
          title: input.title,
          description: input.description,
          category: input.category,
          effort: input.effort,
          impact: input.impact,
          priority: calculatePriority(input.impact, input.effort),
          sourceDimension,
          sourceDimensionKey,
        },
        tag: QUADRANT_TO_TAG[quadrant],
        zoneTag,
        sourceQuadrant: quadrant,
        sourceZone: zone,
        position: prev.items.filter(i => i.zoneTag === zoneTag).length,
        status: 'pending',
        subTasks: { total: 0, completed: 0 },
        addedAt: now,
      };

      return {
        ...prev,
        items: [...prev.items, newItem],
        lastModified: now,
      };
    });
  }, [dimensions]);

  // Add an Action or Play from the Playbook to the plan
  const addPlayToPlan = useCallback((item: Action | Play, dimensionKey: string, dimensionName: string) => {
    setState(prev => {
      // Check if item is already in plan
      const itemIdToCheck = item.recommendationId || item.id;
      const alreadyExists = prev.items.some(planItem =>
        planItem.recommendationId === itemIdToCheck ||
        planItem.id === `play-${item.id}`
      );
      if (alreadyExists) return prev;

      const now = new Date().toISOString();
      const playActionId = `play-${item.id}`;

      // Look up the dimension to calculate zone
      const dimension = dimensions.find(d => d.dimensionKey === dimensionKey);

      let zone: PriorityZoneType = 'monitor';
      let quadrant: PriorityQuadrantType = 'monitor';

      if (dimension) {
        const trendChange = calculateDimensionTrendChange(dimension);
        zone = getZone(dimension.overallPercentile, trendChange);
        quadrant = getQuadrant(dimension.riskLevel, dimension.trend);
      }

      const zoneTag = ZONE_TO_TAG[zone];

      // Map PlayCategory to action category
      const categoryMap: Record<PlayCategory, 'process' | 'tooling' | 'culture' | 'governance'> = {
        'quick-win': 'process',
        'process': 'process',
        'culture': 'culture',
        'tooling': 'tooling',
      };

      // Determine if this is an Action (new type) or Play (old type)
      const isAction = 'knowledge' in item && 'implementation' in item;

      // Extract fields based on type
      const description = isAction
        ? (item as Action).knowledge.problemSolved
        : (item as Play).description;
      const effort = isAction
        ? (item as Action).implementation.effort
        : (item as Play).effort;
      const impact = item.impact;

      const newItem: ActionPlanItem = {
        id: playActionId,
        recommendationId: item.recommendationId || item.id,
        recommendation: {
          id: item.recommendationId || item.id,
          title: item.title,
          description,
          category: categoryMap[item.category] || 'process',
          effort,
          impact,
          priority: calculatePriority(impact, effort),
          sourceDimension: dimensionName,
          sourceDimensionKey: dimensionKey,
        },
        tag: QUADRANT_TO_TAG[quadrant],
        zoneTag,
        sourceQuadrant: quadrant,
        sourceZone: zone,
        position: prev.items.filter(i =>
          i.recommendation.sourceDimensionKey === dimensionKey
        ).length,
        status: 'pending',
        subTasks: { total: 0, completed: 0 },
        addedAt: now,
        // Store full Action object to preserve all content (5 tabs)
        fullAction: isAction ? (item as Action) : undefined,
      };

      // Add to dimensionPriorities if dimension not already there
      let newDimensionPriorities = prev.dimensionPriorities || [];
      if (!newDimensionPriorities.some(dp => dp.dimensionKey === dimensionKey)) {
        newDimensionPriorities = [
          ...newDimensionPriorities,
          {
            dimensionKey,
            dimensionName,
            priority: newDimensionPriorities.length,
          },
        ];
      }

      return {
        ...prev,
        items: [...prev.items, newItem],
        dimensionPriorities: newDimensionPriorities,
        hasCommittedPlan: true, // Mark as committed when adding plays
        lastModified: now,
      };
    });
  }, [dimensions]);

  // Check if a play is already in the plan
  const isPlayInPlan = useCallback((playId: string): boolean => {
    return state.items.some(item =>
      item.recommendationId === playId ||
      item.id === `play-${playId}`
    );
  }, [state.items]);

  // Update an existing action
  const updateItem = useCallback((input: EditActionInput) => {
    setState(prev => {
      const now = new Date().toISOString();

      // Look up the dimension to calculate zone automatically
      const dimension = dimensions.find(d => d.dimensionKey === input.dimensionKey);

      // Calculate zone from dimension's position on the priority matrix
      let zone: PriorityZoneType = 'monitor'; // Default fallback
      let quadrant: PriorityQuadrantType = 'monitor';
      let sourceDimension = 'Custom Action';
      let sourceDimensionKey = 'custom';

      if (dimension) {
        const trendChange = calculateDimensionTrendChange(dimension);
        zone = getZone(dimension.overallPercentile, trendChange);
        quadrant = getQuadrant(dimension.riskLevel, dimension.trend);
        sourceDimension = dimension.dimensionName;
        sourceDimensionKey = dimension.dimensionKey;
      }

      const zoneTag = ZONE_TO_TAG[zone];

      const updatedItems = prev.items.map(item => {
        if (item.id !== input.id) return item;

        // Preserve status, timestamps, baseline, but update content and recalculate zone
        return {
          ...item,
          recommendation: {
            ...item.recommendation,
            title: input.title,
            description: input.description,
            category: input.category,
            effort: input.effort,
            impact: input.impact,
            priority: calculatePriority(input.impact, input.effort),
            sourceDimension,
            sourceDimensionKey,
          },
          tag: QUADRANT_TO_TAG[quadrant],
          zoneTag,
          sourceQuadrant: quadrant,
          sourceZone: zone,
          // Update position if zone changed
          position: item.zoneTag !== zoneTag
            ? prev.items.filter(i => i.zoneTag === zoneTag && i.id !== input.id).length
            : item.position,
        };
      });

      return {
        ...prev,
        items: updatedItems,
        lastModified: now,
      };
    });
  }, [dimensions]);

  // Group items into sections by dimension (user's priority order)
  const sections = useMemo((): ActionPlanSection[] => {
    // If no dimension priorities stored, derive from items
    const priorities = state.dimensionPriorities || [];

    if (priorities.length === 0 && state.items.length > 0) {
      // Fallback: derive from items in their order of appearance
      const dimMap = new Map<string, { name: string; items: ActionPlanItem[] }>();
      state.items.forEach(item => {
        const key = item.recommendation.sourceDimensionKey;
        if (!key) return;

        if (!dimMap.has(key)) {
          const dim = dimensions.find(d => d.dimensionKey === key);
          dimMap.set(key, {
            name: item.recommendation.sourceDimension || dim?.dimensionName || key,
            items: [],
          });
        }
        dimMap.get(key)!.items.push(item);
      });

      return Array.from(dimMap.entries()).map(([key, val], index) => {
        const dim = dimensions.find(d => d.dimensionKey === key);
        return {
          dimensionKey: key,
          dimensionName: val.name,
          priority: index,
          healthScore: dim?.overallPercentile,
          healthStatus: dim?.riskLevel === 'high' ? 'at-risk' :
                        dim?.riskLevel === 'moderate' ? 'needs-attention' : 'on-track',
          items: val.items.sort((a, b) => a.position - b.position),
        };
      });
    }

    // Use stored dimension priorities - group items by dimension in priority order
    return priorities
      .sort((a, b) => a.priority - b.priority)
      .map(dimPriority => {
        const dimItems = state.items
          .filter(item => item.recommendation.sourceDimensionKey === dimPriority.dimensionKey)
          .sort((a, b) => a.position - b.position);

        const dim = dimensions.find(d => d.dimensionKey === dimPriority.dimensionKey);

        return {
          dimensionKey: dimPriority.dimensionKey,
          dimensionName: dimPriority.dimensionName,
          priority: dimPriority.priority,
          healthScore: dimPriority.healthScore || dim?.overallPercentile,
          healthStatus: dimPriority.healthStatus ||
                        (dim?.riskLevel === 'high' ? 'at-risk' :
                         dim?.riskLevel === 'moderate' ? 'needs-attention' : 'on-track'),
          items: dimItems,
        };
      })
      .filter(section => section.items.length > 0);  // Only show sections with items
  }, [state.items, state.dimensionPriorities, dimensions]);

  // Counts
  const itemCount = state.items.length;
  const completedCount = state.items.filter(item => item.status === 'done').length;
  const inProgressCount = state.items.filter(item => item.status === 'in-progress').length;

  // Clear the plan and reset to empty state
  const clearPlan = useCallback(() => {
    setState({
      version: CURRENT_VERSION,
      items: [],
      assessmentId,
      lastModified: new Date().toISOString(),
      hasCommittedPlan: false,
    });
  }, [assessmentId]);

  // Replace action plan with builder selections (commit the plan from wizard)
  const replaceWithBuilderPlan = useCallback((payload: BuilderCommitPayload) => {
    const now = new Date().toISOString();

    // Extract unique dimensions in the order they appear (which reflects user's priority)
    const dimPriorityMap = new Map<string, { name: string; priority: number; healthScore?: number; healthStatus?: DimensionPriority['healthStatus'] }>();
    payload.selections.forEach(selection => {
      if (!dimPriorityMap.has(selection.dimensionKey)) {
        const dim = dimensions.find(d => d.dimensionKey === selection.dimensionKey);
        dimPriorityMap.set(selection.dimensionKey, {
          name: dim?.dimensionName || 'Unknown',
          priority: dimPriorityMap.size,  // Preserve order as priority
          healthScore: dim?.overallPercentile,
          healthStatus: dim?.riskLevel === 'high' ? 'at-risk' :
                        dim?.riskLevel === 'moderate' ? 'needs-attention' : 'on-track',
        });
      }
    });

    // Build dimension priorities array
    const dimensionPriorities: DimensionPriority[] = Array.from(dimPriorityMap.entries()).map(([key, val]) => ({
      dimensionKey: key,
      dimensionName: val.name,
      priority: val.priority,
      healthScore: val.healthScore,
      healthStatus: val.healthStatus,
    }));

    // Convert builder selections to ActionPlanItems
    // Position within each dimension group (not global)
    const positionCounters = new Map<string, number>();

    const newItems: ActionPlanItem[] = payload.selections.map((selection) => {
      // Find the dimension for zone calculation
      const dimension = dimensions.find(d => d.dimensionKey === selection.dimensionKey);

      // Calculate zone from dimension
      let zone: PriorityZoneType = 'monitor';
      let quadrant: PriorityQuadrantType = 'monitor';

      if (dimension) {
        const trendChange = calculateDimensionTrendChange(dimension);
        zone = getZone(dimension.overallPercentile, trendChange);
        quadrant = getQuadrant(dimension.riskLevel, dimension.trend);
      }

      const zoneTag = ZONE_TO_TAG[zone];

      // Track position within each dimension
      const currentPos = positionCounters.get(selection.dimensionKey) || 0;
      positionCounters.set(selection.dimensionKey, currentPos + 1);

      return {
        id: `action-${selection.recommendationId}`,
        recommendationId: selection.recommendationId,
        recommendation: {
          ...selection.recommendation,
          sourceDimension: dimension?.dimensionName || 'Unknown',
          sourceDimensionKey: selection.dimensionKey,
          priority: selection.priority,
        },
        tag: QUADRANT_TO_TAG[quadrant],
        zoneTag: selection.zoneTag,
        sourceQuadrant: quadrant,
        sourceZone: zone,
        position: currentPos,  // Position within dimension section
        status: 'pending' as ActionStatus,
        subTasks: { total: 0, completed: 0 },
        addedAt: now,
      };
    });

    setState({
      version: CURRENT_VERSION,
      items: newItems,
      assessmentId,
      lastModified: now,
      hasCommittedPlan: true,
      committedAt: payload.committedAt,
      dimensionPriorities,
    });
  }, [dimensions, assessmentId]);

  // ═══════════════════════════════════════════════════════════════════
  // DIMENSION-LEVEL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  // Add all recommendations from a dimension to the plan
  const addDimension = useCallback((dimensionKey: string) => {
    const dim = dimensions.find(d => d.dimensionKey === dimensionKey);
    if (!dim) return;

    setState(prev => {
      const now = new Date().toISOString();
      const trendChange = calculateDimensionTrendChange(dim);
      const zone = getZone(dim.overallPercentile, trendChange);
      const zoneTag = ZONE_TO_TAG[zone];
      const quadrant = getQuadrant(dim.riskLevel, dim.trend);

      // Filter out recommendations that are already in the plan
      const existingIds = new Set(prev.items.map(i => i.recommendationId));
      const newItems = dim.recommendations
        .filter(rec => !existingIds.has(rec.id))
        .map((rec, index) => ({
          id: `action-${rec.id}`,
          recommendationId: rec.id,
          recommendation: {
            ...rec,
            sourceDimension: dim.dimensionName,
            sourceDimensionKey: dim.dimensionKey,
            priority: calculatePriority(rec.impact, rec.effort),
          },
          tag: QUADRANT_TO_TAG[quadrant],
          zoneTag,
          sourceQuadrant: quadrant,
          sourceZone: zone,
          position: prev.items.filter(i => i.zoneTag === zoneTag).length + index,
          status: 'pending' as ActionStatus,
          subTasks: { total: 0, completed: 0 },
          addedAt: now,
        }));

      if (newItems.length === 0) return prev;

      return {
        ...prev,
        items: [...prev.items, ...newItems],
        lastModified: now,
        hasCommittedPlan: true,
      };
    });
  }, [dimensions]);

  // Remove all recommendations from a dimension from the plan
  const removeDimension = useCallback((dimensionKey: string) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.recommendation.sourceDimensionKey !== dimensionKey),
      lastModified: new Date().toISOString(),
    }));
  }, []);

  // Check if all recommendations from a dimension are in the plan
  const isDimensionInPlan = useCallback((dimensionKey: string): boolean => {
    const dim = dimensions.find(d => d.dimensionKey === dimensionKey);
    if (!dim || dim.recommendations.length === 0) return false;

    const inPlanCount = state.items.filter(
      i => i.recommendation.sourceDimensionKey === dimensionKey
    ).length;

    return inPlanCount === dim.recommendations.length;
  }, [dimensions, state.items]);

  // Get count of items from a dimension that are in the plan
  const getDimensionItemCount = useCallback((dimensionKey: string): number => {
    return state.items.filter(
      i => i.recommendation.sourceDimensionKey === dimensionKey
    ).length;
  }, [state.items]);

  // ═══════════════════════════════════════════════════════════════════
  // THEME-LEVEL OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  // Add all dimensions in a theme to the plan
  const addTheme = useCallback((themeId: string) => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return;

    // Add each dimension in sequence (state updates are batched by React)
    setState(prev => {
      const now = new Date().toISOString();
      let newItems: ActionPlanItem[] = [];
      const existingIds = new Set(prev.items.map(i => i.recommendationId));

      for (const dimensionKey of theme.dimensionKeys) {
        const dim = dimensions.find(d => d.dimensionKey === dimensionKey);
        if (!dim) continue;

        const trendChange = calculateDimensionTrendChange(dim);
        const zone = getZone(dim.overallPercentile, trendChange);
        const zoneTag = ZONE_TO_TAG[zone];
        const quadrant = getQuadrant(dim.riskLevel, dim.trend);

        const dimItems = dim.recommendations
          .filter(rec => !existingIds.has(rec.id))
          .map((rec, index) => {
            existingIds.add(rec.id); // Track newly added items
            return {
              id: `action-${rec.id}`,
              recommendationId: rec.id,
              recommendation: {
                ...rec,
                sourceDimension: dim.dimensionName,
                sourceDimensionKey: dim.dimensionKey,
                priority: calculatePriority(rec.impact, rec.effort),
              },
              tag: QUADRANT_TO_TAG[quadrant],
              zoneTag,
              sourceQuadrant: quadrant,
              sourceZone: zone,
              position: prev.items.filter(i => i.zoneTag === zoneTag).length + newItems.filter(i => i.zoneTag === zoneTag).length + index,
              status: 'pending' as ActionStatus,
              subTasks: { total: 0, completed: 0 },
              addedAt: now,
            };
          });

        newItems = [...newItems, ...dimItems];
      }

      if (newItems.length === 0) return prev;

      return {
        ...prev,
        items: [...prev.items, ...newItems],
        lastModified: now,
        hasCommittedPlan: true,
      };
    });
  }, [dimensions]);

  // Remove all dimensions in a theme from the plan
  const removeTheme = useCallback((themeId: string) => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return;

    setState(prev => ({
      ...prev,
      items: prev.items.filter(
        item => !theme.dimensionKeys.includes(item.recommendation.sourceDimensionKey)
      ),
      lastModified: new Date().toISOString(),
    }));
  }, []);

  // Check if ALL dimensions in a theme are fully in the plan
  const isThemeInPlan = useCallback((themeId: string): boolean => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return false;

    // Every dimension in the theme must be fully in the plan
    return theme.dimensionKeys.every(dimKey => {
      const dim = dimensions.find(d => d.dimensionKey === dimKey);
      if (!dim || dim.recommendations.length === 0) return true; // Empty dimensions count as "in plan"

      const inPlanCount = state.items.filter(
        i => i.recommendation.sourceDimensionKey === dimKey
      ).length;

      return inPlanCount === dim.recommendations.length;
    });
  }, [dimensions, state.items]);

  // Check if SOME but not ALL dimensions in a theme are in the plan
  const isThemePartiallyInPlan = useCallback((themeId: string): boolean => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return false;

    let hasAnyInPlan = false;
    let hasAnyNotInPlan = false;

    for (const dimKey of theme.dimensionKeys) {
      const dim = dimensions.find(d => d.dimensionKey === dimKey);
      if (!dim || dim.recommendations.length === 0) continue;

      const inPlanCount = state.items.filter(
        i => i.recommendation.sourceDimensionKey === dimKey
      ).length;

      if (inPlanCount > 0) hasAnyInPlan = true;
      if (inPlanCount < dim.recommendations.length) hasAnyNotInPlan = true;
    }

    return hasAnyInPlan && hasAnyNotInPlan;
  }, [dimensions, state.items]);

  // Get total count of items from all dimensions in a theme that are in the plan
  const getThemeItemCount = useCallback((themeId: string): number => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return 0;

    return state.items.filter(
      item => theme.dimensionKeys.includes(item.recommendation.sourceDimensionKey)
    ).length;
  }, [state.items]);

  // Get TOTAL possible recommendations for a theme (not just what's in plan)
  const getThemeTotalRecommendations = useCallback((themeId: string): number => {
    const theme = themeGroups.find(t => t.id === themeId);
    if (!theme) return 0;

    return theme.dimensionKeys.reduce((total, dimKey) => {
      const dim = dimensions.find(d => d.dimensionKey === dimKey);
      return total + (dim?.recommendations.length || 0);
    }, 0);
  }, [dimensions]);

  return {
    sections,
    items: state.items,
    updateStatus,
    reorderWithinSection,
    getItemById,
    removeItem,
    addCustomAction,
    updateItem,
    // Playbook integration
    addPlayToPlan,
    isPlayInPlan,
    itemCount,
    completedCount,
    inProgressCount,
    hasCommittedPlan: state.hasCommittedPlan,
    clearPlan,
    // Dimension-level operations
    addDimension,
    removeDimension,
    isDimensionInPlan,
    getDimensionItemCount,
    dimensionPriorities: state.dimensionPriorities || [],
    // Theme-level operations
    addTheme,
    removeTheme,
    isThemeInPlan,
    isThemePartiallyInPlan,
    getThemeItemCount,
    getThemeTotalRecommendations,
    // Builder wizard operations
    replaceWithBuilderPlan,
  };
}
