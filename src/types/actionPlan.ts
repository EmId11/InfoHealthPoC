import { PrioritizedRecommendation, PriorityQuadrantType, PriorityZoneType } from './assessment';
import {
  MaturityLevel,
  MaturityLevelName,
  MATURITY_LEVELS,
  getMaturityLevelConfig,
} from './maturity';
import { Action } from './playbook';

// Re-export maturity types for convenience
export type { MaturityLevel, MaturityLevelName };

/** @deprecated Use ActionPlanMaturityTag instead */
export type ActionPlanTag = 'must-do' | 'watch' | 'investigate' | 'maintain';

/**
 * 9-zone tag type
 * @deprecated Use ActionPlanMaturityTag instead. Zone-based tags are being
 * replaced by maturity-based tags for consistency.
 */
export type ActionPlanZoneTag =
  | 'critical'       // fix-now: High risk + declining
  | 'urgent'         // urgent: High risk + stable
  | 'momentum'       // keep-pushing: High risk + improving
  | 'prevent'        // act-soon: Moderate risk + declining
  | 'monitor'        // monitor: Moderate risk + stable
  | 'progressing'    // good-progress: Moderate risk + improving
  | 'early-warning'  // watch-out: Low risk + declining
  | 'sustain'        // maintain: Low risk + stable
  | 'celebrate';     // celebrate: Low risk + improving

/**
 * Maturity-based tag type - maps directly to maturity levels.
 * Lower levels are higher priority.
 */
export type ActionPlanMaturityTag = 'basic' | 'emerging' | 'established' | 'advanced' | 'exemplary';

// Action status
export type ActionStatus = 'pending' | 'in-progress' | 'done';

// Mapping from quadrant to tag (legacy)
export const QUADRANT_TO_TAG: Record<PriorityQuadrantType, ActionPlanTag> = {
  'fix-now': 'must-do',
  'monitor': 'watch',
  'watch-out': 'investigate',
  'celebrate': 'maintain',
};

// Mapping from 9-zone to tag
export const ZONE_TO_TAG: Record<PriorityZoneType, ActionPlanZoneTag> = {
  'act-now': 'critical',
  'address': 'urgent',
  'keep-pushing': 'momentum',
  'act-soon': 'prevent',
  'monitor': 'monitor',
  'good-progress': 'progressing',
  'heads-up': 'early-warning',
  'maintain': 'sustain',
  'celebrate': 'celebrate',
};

// Priority order for displaying sections (highest priority first)
export const TAG_PRIORITY_ORDER: ActionPlanTag[] = ['must-do', 'watch', 'investigate', 'maintain'];

/**
 * Priority order for 9-zone tags (highest priority first)
 * @deprecated Use MATURITY_TAG_PRIORITY_ORDER instead
 */
export const ZONE_TAG_PRIORITY_ORDER: ActionPlanZoneTag[] = [
  'critical', 'urgent', 'momentum',      // High risk row
  'prevent', 'monitor', 'progressing',   // Moderate risk row
  'early-warning', 'sustain', 'celebrate' // Low risk row
];

/** Priority order for maturity tags (highest priority first - Basic needs most attention) */
export const MATURITY_TAG_PRIORITY_ORDER: ActionPlanMaturityTag[] = [
  'basic', 'emerging', 'established', 'advanced', 'exemplary'
];

/** Map maturity level to tag */
export const MATURITY_LEVEL_TO_TAG: Record<MaturityLevel, ActionPlanMaturityTag> = {
  1: 'basic',
  2: 'emerging',
  3: 'established',
  4: 'advanced',
  5: 'exemplary',
};

/** Map tag back to maturity level */
export const TAG_TO_MATURITY_LEVEL: Record<ActionPlanMaturityTag, MaturityLevel> = {
  'basic': 1,
  'emerging': 2,
  'established': 3,
  'advanced': 4,
  'exemplary': 5,
};

// Display configuration for tags
export interface ActionTagConfig {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const ACTION_TAG_CONFIG: Record<ActionPlanTag, ActionTagConfig> = {
  'must-do': {
    label: 'Must Do',
    color: '#DE350B',
    bgColor: '#FFEBE6',
    description: 'Critical actions requiring immediate attention'
  },
  'watch': {
    label: 'Watch',
    color: '#FF8B00',
    bgColor: '#FFFAE6',
    description: 'High risk areas trending positively - monitor closely'
  },
  'investigate': {
    label: 'Investigate',
    color: '#FFAB00',
    bgColor: '#FFF7ED',
    description: 'Low risk but declining - investigate root cause'
  },
  'maintain': {
    label: 'Maintain',
    color: '#36B37E',
    bgColor: '#E3FCEF',
    description: 'Healthy areas - maintain current practices'
  },
};

// Configuration for 9-zone tags
export const ZONE_TAG_CONFIG: Record<ActionPlanZoneTag, ActionTagConfig> = {
  'critical': {
    label: 'Critical',
    color: '#DE350B',
    bgColor: '#FFEBE6',
    description: 'High risk and getting worse - immediate action required'
  },
  'urgent': {
    label: 'Urgent',
    color: '#DE350B',
    bgColor: '#FFF5F5',
    description: 'High risk and stable - needs immediate attention'
  },
  'momentum': {
    label: 'Keep Going',
    color: '#FF8B00',
    bgColor: '#FFFAE6',
    description: 'High risk but improving - maintain momentum'
  },
  'prevent': {
    label: 'Prevent',
    color: '#FF8B00',
    bgColor: '#FFF7ED',
    description: 'Moderate risk and declining - act to prevent escalation'
  },
  'monitor': {
    label: 'Monitor',
    color: '#FFAB00',
    bgColor: '#FFFBEB',
    description: 'Moderate risk and stable - keep watching'
  },
  'progressing': {
    label: 'Progressing',
    color: '#36B37E',
    bgColor: '#E3FCEF',
    description: 'Moderate risk but improving - on the right track'
  },
  'early-warning': {
    label: 'Early Warning',
    color: '#FFAB00',
    bgColor: '#FFF7ED',
    description: 'Low risk but declining - address early'
  },
  'sustain': {
    label: 'Sustain',
    color: '#36B37E',
    bgColor: '#F0FDF4',
    description: 'Low risk and stable - maintain practices'
  },
  'celebrate': {
    label: 'Celebrate',
    color: '#00875A',
    bgColor: '#E3FCEF',
    description: 'Low risk and improving - success story'
  },
};

/** Configuration for maturity-based tags (derives from MATURITY_LEVELS) */
export const MATURITY_TAG_CONFIG: Record<ActionPlanMaturityTag, ActionTagConfig> = {
  'basic': {
    label: MATURITY_LEVELS[0].name,
    color: MATURITY_LEVELS[0].color,
    bgColor: MATURITY_LEVELS[0].backgroundColor,
    description: MATURITY_LEVELS[0].description,
  },
  'emerging': {
    label: MATURITY_LEVELS[1].name,
    color: MATURITY_LEVELS[1].color,
    bgColor: MATURITY_LEVELS[1].backgroundColor,
    description: MATURITY_LEVELS[1].description,
  },
  'established': {
    label: MATURITY_LEVELS[2].name,
    color: MATURITY_LEVELS[2].color,
    bgColor: MATURITY_LEVELS[2].backgroundColor,
    description: MATURITY_LEVELS[2].description,
  },
  'advanced': {
    label: MATURITY_LEVELS[3].name,
    color: MATURITY_LEVELS[3].color,
    bgColor: MATURITY_LEVELS[3].backgroundColor,
    description: MATURITY_LEVELS[3].description,
  },
  'exemplary': {
    label: MATURITY_LEVELS[4].name,
    color: MATURITY_LEVELS[4].color,
    bgColor: MATURITY_LEVELS[4].backgroundColor,
    description: MATURITY_LEVELS[4].description,
  },
};

/** Get maturity tag from health score */
export function getMaturityTagFromHealthScore(healthScore: number): ActionPlanMaturityTag {
  const config = getMaturityLevelConfig(healthScore);
  return MATURITY_LEVEL_TO_TAG[config.level];
}

// Status configuration
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const STATUS_CONFIG: Record<ActionStatus, StatusConfig> = {
  'pending': {
    label: 'Pending',
    color: '#6B778C',
    bgColor: '#F4F5F7',
    icon: '○',
  },
  'in-progress': {
    label: 'In Progress',
    color: '#0052CC',
    bgColor: '#DEEBFF',
    icon: '◐',
  },
  'done': {
    label: 'Done',
    color: '#36B37E',
    bgColor: '#E3FCEF',
    icon: '●',
  },
};

// Sub-tasks tracking
export interface SubTasksProgress {
  total: number;
  completed: number;
}

// Baseline snapshot of indicator values when action started
export interface IndicatorBaseline {
  indicatorId: string;
  indicatorName: string;
  value: number;
  unit: string;
}

export interface BaselineSnapshot {
  capturedAt: string;                  // ISO timestamp when baseline was captured
  dimensionKey: string;
  dimensionHealthScore: number;
  indicators: IndicatorBaseline[];
}

// Action plan item (extends recommendation with status and tracking)
export interface ActionPlanItem {
  id: string;                          // Unique ID for this plan item
  recommendationId: string;            // Original recommendation ID
  recommendation: PrioritizedRecommendation;
  /** @deprecated Use maturityTag instead */
  tag: ActionPlanTag;                  // Legacy 4-quadrant tag (kept for compatibility)
  /** @deprecated Use maturityTag instead */
  zoneTag: ActionPlanZoneTag;          // New 9-zone tag
  /** @deprecated Use sourceMaturityLevel instead */
  sourceQuadrant: PriorityQuadrantType; // Legacy quadrant (kept for compatibility)
  /** @deprecated Use sourceMaturityLevel instead */
  sourceZone: PriorityZoneType;        // New 9-zone source
  /** Maturity-based tag derived from dimension percentile */
  maturityTag?: ActionPlanMaturityTag;
  /** Source dimension's maturity level (1-5) */
  sourceMaturityLevel?: MaturityLevel;
  position: number;                    // Order within its section (0-indexed)
  status: ActionStatus;
  subTasks: SubTasksProgress;
  addedAt: string;                     // ISO timestamp - when auto-populated
  startedAt?: string;                  // ISO timestamp - when moved to in-progress
  completedAt?: string;                // ISO timestamp - when marked done
  baselineSnapshot?: BaselineSnapshot; // Indicator values captured when action started
  fullAction?: Action;                 // Full playbook action with all content (5 tabs)
}

// Legacy: Grouped actions by zone tag for display (new 9-zone system)
export interface ActionPlanZoneSection {
  zoneTag: ActionPlanZoneTag;
  config: ActionTagConfig;
  items: ActionPlanItem[];
}

// Dimension priority stored from the Action Plan Builder
export interface DimensionPriority {
  dimensionKey: string;
  dimensionName: string;
  priority: number;                 // 0 = highest priority
  healthScore?: number;             // Percentile at time of plan creation
  healthStatus?: 'at-risk' | 'needs-attention' | 'on-track';
}

// Grouped actions by dimension for display (user-prioritized)
export interface ActionPlanSection {
  dimensionKey: string;
  dimensionName: string;
  priority: number;                 // Display order (0 = first)
  healthScore?: number;
  healthStatus?: string;
  items: ActionPlanItem[];
}

// Full action plan state for localStorage
export interface ActionPlanState {
  version: number;                     // For future migrations
  items: ActionPlanItem[];
  assessmentId: string;
  lastModified: string;
  hasCommittedPlan: boolean;           // True if user has gone through builder wizard
  committedAt?: string;                // ISO timestamp of when plan was committed
  dimensionPriorities?: DimensionPriority[];  // User's prioritized dimensions from builder
}
