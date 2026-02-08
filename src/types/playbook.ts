// Playbook Types - Strategic coaching for dimension improvement

// Import from unified maturity system
import type {
  MaturityLevel as UnifiedMaturityLevel,
  MaturityLevelName,
  MaturityLevelConfig,
} from './maturity';
import {
  MATURITY_LEVELS,
  getMaturityLevelConfig,
  getMaturityLevel,
  getMaturityLevelName,
} from './maturity';

// Re-export unified maturity types
export type { MaturityLevelName, MaturityLevelConfig };
export type { UnifiedMaturityLevel };
export {
  MATURITY_LEVELS,
  getMaturityLevelConfig,
  getMaturityLevel,
  getMaturityLevelName,
};

// Maturity level (1-5 scale) - alias for backwards compatibility
export type MaturityLevelNumber = UnifiedMaturityLevel;

// Extended maturity level interface for playbook-specific features
export interface MaturityLevel {
  level: MaturityLevelNumber;
  name: string;
  shortDescription: string;
  characteristics: string[];
  thresholds: {
    minPercentile: number;
    maxPercentile: number;
  };
}

/**
 * Default maturity levels with CHS-aligned thresholds.
 * Thresholds: 70 / 55 / 45 / 30 (50 = baseline average)
 */
export const DEFAULT_MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: 1,
    name: 'Needs Attention',
    shortDescription: 'Significantly below baseline',
    characteristics: [
      'Inconsistent practices across the team',
      'Limited visibility into work patterns',
      'Reactive rather than proactive approach'
    ],
    thresholds: { minPercentile: 0, maxPercentile: 29 }
  },
  {
    level: 2,
    name: 'Below Average',
    shortDescription: 'Under baseline, needs attention',
    characteristics: [
      'Some team members following best practices',
      'Awareness of improvement areas',
      'Beginning to establish patterns'
    ],
    thresholds: { minPercentile: 30, maxPercentile: 44 }
  },
  {
    level: 3,
    name: 'Average',
    shortDescription: 'Near baseline, stable',
    characteristics: [
      'Consistent practices across the team',
      'Regular monitoring and adjustment',
      'Proactive identification of issues'
    ],
    thresholds: { minPercentile: 45, maxPercentile: 54 }
  },
  {
    level: 4,
    name: 'Good',
    shortDescription: 'Above baseline with positive direction',
    characteristics: [
      'Refined and optimized workflows',
      'Data-driven decision making',
      'Continuous improvement culture'
    ],
    thresholds: { minPercentile: 55, maxPercentile: 69 }
  },
  {
    level: 5,
    name: 'Excellent',
    shortDescription: 'Significantly above baseline',
    characteristics: [
      'Best-in-class practices',
      'Innovation and experimentation',
      'Mentoring other teams'
    ],
    thresholds: { minPercentile: 70, maxPercentile: 100 }
  }
];

// Success criterion - benchmark for "good"
export interface SuccessCriterion {
  id: string;
  label: string;
  description: string;
  currentValue: number | string;
  targetValue: number | string;
  unit: string;
  isMet: boolean;
  indicatorId?: string;  // Link to actual indicator for dynamic values
}

// Play categories
export type PlayCategory = 'quick-win' | 'process' | 'culture' | 'tooling';

export interface PlayCategoryConfig {
  id: PlayCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const PLAY_CATEGORIES: PlayCategoryConfig[] = [
  {
    id: 'quick-win',
    label: 'Quick Wins',
    description: 'Start here, minimal disruption',
    icon: '⚡',
    color: '#36B37E'
  },
  {
    id: 'process',
    label: 'Process',
    description: 'Workflow and ceremony improvements',
    icon: '🔄',
    color: '#0052CC'
  },
  {
    id: 'culture',
    label: 'Culture',
    description: 'Team habits and behaviors',
    icon: '👥',
    color: '#6554C0'
  },
  {
    id: 'tooling',
    label: 'Tooling',
    description: 'Jira configuration and automation',
    icon: '⚙️',
    color: '#FF8B00'
  }
];

// Effort and impact levels
export type EffortLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'low' | 'medium' | 'high';

// TryingAction - represents an action the team is currently trying
export interface TryingAction {
  actionId: string;
  dimensionKey: string;      // e.g., 'sprintHygiene'
  dimensionNumber: number;   // e.g., 9
  dimensionName: string;     // e.g., 'Sprint Hygiene'
  title: string;
  category: PlayCategory;
  effort: EffortLevel;
  impact: ImpactLevel;
  addedAt: string;           // ISO timestamp
}

// Play - an action with strategic context
export interface Play {
  id: string;
  title: string;
  description: string;
  category: PlayCategory;
  timeToImplement: string;       // e.g., "15 minutes", "1-2 days"
  effort: EffortLevel;
  impact: ImpactLevel;
  minMaturityLevel?: MaturityLevelNumber;  // Recommended minimum level to attempt this
  prerequisites?: string[];
  expectedOutcome: string;
  howToGuide?: string;           // Detailed guidance (shown in modal)
  relatedIndicators: string[];   // Indicator IDs this play affects
  recommendationId?: string;     // Link to existing recommendation for Action Plan integration
}

// Experiment - time-boxed trial
export type ExperimentDifficulty = 'easy' | 'moderate' | 'challenging';
export type TeamInvolvementType = 'individual' | 'partial' | 'full-team' | 'representatives';
export type TeamInvolvement = TeamInvolvementType | { type: TeamInvolvementType; description: string };

export interface Experiment {
  id: string;
  title: string;
  duration: string;              // e.g., "2 weeks", "1 sprint"
  challenge: string;             // What the team commits to try
  whatYoullLearn: string[];
  successMetrics: string[];
  relatedIndicators: string[];
  difficulty: ExperimentDifficulty;
  teamInvolvement: TeamInvolvement;
}

// Resource - learning material (now integrated into actions)
export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'documentation' | 'template';
  url?: string;
  description: string;
}

// ============================================================
// NEW ACTION STRUCTURE - Comprehensive experiment-based actions
// ============================================================

// Implementation step within an action
export interface ImplementationStep {
  title: string;
  description: string;
  duration?: string;
}

// Mini-experiment within an action's validation
export interface ActionExperiment {
  name: string;
  description: string;
  duration: string;
  howToMeasure: string;
}

// Success metric for validation
export interface SuccessMetric {
  metric: string;
  target: string;
  howToMeasure: string;
}

// FAQ item
export interface FAQItem {
  question: string;
  answer: string;
}

// Action - comprehensive experiment-based improvement
export interface Action {
  id: string;
  title: string;
  category: PlayCategory;

  // 1. Knowledge Component (Why & Background)
  knowledge: {
    problemSolved: string;
    whyItWorks: string;
    background?: string;
    resources: Omit<Resource, 'id'>[];  // Relevant resources integrated here
  };

  // 2. Implementation (End-to-End How)
  implementation: {
    overview: string;
    steps: ImplementationStep[];
    teamInvolvement: TeamInvolvement;
    timeToImplement: string;
    effort: EffortLevel;
    prerequisites?: string[];
    toolsRequired?: string[];
  };

  // 3. Experiments & Success Metrics (How We Know It's Working)
  validation: {
    experiments: ActionExperiment[];
    successMetrics: SuccessMetric[];
    leadingIndicators: string[];
    laggingIndicators: string[];
  };

  // 4. Pitfalls (What to Watch Out For)
  pitfalls: {
    commonMistakes: string[];
    antiPatterns: string[];
    warningSignals: string[];
    whenToPivot: string;
  };

  // 5. FAQ
  faq: FAQItem[];

  // Metadata
  impact: ImpactLevel;
  minMaturityLevel?: MaturityLevelNumber;
  relatedIndicators: string[];
  recommendationId?: string;  // Link to Action Plan integration
}

// ============================================================

// Full playbook content for a dimension
export interface DimensionPlaybook {
  dimensionKey: string;
  dimensionName: string;
  overview: string;              // Brief intro to this dimension's importance
  successCriteria: Omit<SuccessCriterion, 'currentValue' | 'isMet'>[];  // Templates (values computed at runtime)
  actions?: Action[];            // NEW: Comprehensive experiment-based actions
  maturityGuidance: {            // Level-specific advice
    [key in MaturityLevelNumber]?: {
      focus: string;             // What to focus on at this level
      avoid: string;             // Common mistakes at this level
      nextStep: string;          // How to reach the next level
    };
  };
  // DEPRECATED - kept for migration, will be removed when all dimensions use actions
  plays?: Play[];
  experiments?: Experiment[];
  resources?: Resource[];
}

// Computed maturity result (at runtime)
export interface ComputedMaturity {
  level: MaturityLevelNumber;
  levelInfo: MaturityLevel;
  healthScore: number;
  healthyIndicatorCount: number;
  totalIndicatorCount: number;
  healthyIndicatorRatio: number;
}

/**
 * Compute maturity level from health score using CHS thresholds.
 * CHS thresholds: 70+ Excellent, 55-69 Good, 45-54 Average, 30-44 Below Avg, <30 Needs Attention
 */
export function computeMaturityLevel(healthScore: number): ComputedMaturity['levelInfo'] {
  // Use unified maturity config, then map to playbook's extended format
  const unifiedConfig = getMaturityLevelConfig(healthScore);
  const playBookLevel = DEFAULT_MATURITY_LEVELS.find(l => l.level === unifiedConfig.level);
  return playBookLevel || DEFAULT_MATURITY_LEVELS[0];
}

// Helper to get play category config
export function getPlayCategoryConfig(category: PlayCategory): PlayCategoryConfig {
  return PLAY_CATEGORIES.find(c => c.id === category) || PLAY_CATEGORIES[0];
}
