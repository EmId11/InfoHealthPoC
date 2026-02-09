// Action Plan Builder Types
// Types for the user-friendly wizard flow that helps users build their action plan
// Step 1: Select dimensions → Step 2: Prioritize dimensions → Step 3: Review actions → Step 4: Launch

import { ActionPlanZoneTag } from './actionPlan';
import { Recommendation, DimensionResult } from './assessment';

/**
 * Dimension explanations - what it means and why users should care
 */
export interface DimensionExplanation {
  title: string;           // User-friendly title
  whatItMeans: string;     // Plain language explanation
  whyItMatters: string;    // Why users should care about this
  impact: string;          // What happens if this is poor
}

/**
 * Dimension explanations for the wizard
 */
export const DIMENSION_EXPLANATIONS: Record<string, DimensionExplanation> = {
  workCaptured: {
    title: 'Work Visibility',
    whatItMeans: 'How much of your team\'s actual work is tracked in Jira',
    whyItMatters: 'When work happens outside Jira, you can\'t measure progress, identify bottlenecks, or plan accurately',
    impact: 'Hidden work leads to unrealistic commitments and burnout',
  },
  ticketReadiness: {
    title: 'Ticket Quality',
    whatItMeans: 'Whether tickets have enough information to be actionable',
    whyItMatters: 'Well-documented tickets reduce back-and-forth questions and help new team members get up to speed',
    impact: 'Poor documentation causes delays, rework, and knowledge loss',
  },
  dataFreshness: {
    title: 'Data Freshness',
    whatItMeans: 'How current and up-to-date your Jira data is',
    whyItMatters: 'Stale data makes dashboards unreliable and hides real project status',
    impact: 'Outdated data leads to wrong decisions and missed deadlines',
  },
  issueTypeConsistency: {
    title: 'Issue Type Consistency',
    whatItMeans: 'Whether your team uses issue types (Story, Bug, Task) consistently',
    whyItMatters: 'Consistent categorization makes reporting accurate and helps identify patterns',
    impact: 'Inconsistent types make it hard to track work types and prioritize correctly',
  },
  workHierarchy: {
    title: 'Work Structure',
    whatItMeans: 'How well your tickets are linked to parent items (Epics, Initiatives)',
    whyItMatters: 'Good structure shows how individual work connects to bigger goals',
    impact: 'Poor structure makes it hard to see progress toward objectives',
  },
  estimationCoverage: {
    title: 'Estimation Coverage',
    whatItMeans: 'What percentage of your work items have size estimates',
    whyItMatters: 'Estimates help with capacity planning and setting realistic sprint goals',
    impact: 'Missing estimates lead to overcommitment and unpredictable delivery',
  },
  sizingConsistency: {
    title: 'Estimation Accuracy',
    whatItMeans: 'How reliable your team\'s estimates are compared to actual effort',
    whyItMatters: 'Accurate estimates improve planning confidence and stakeholder trust',
    impact: 'Poor estimates cause missed deadlines and planning chaos',
  },
  teamCollaboration: {
    title: 'Team Collaboration',
    whatItMeans: 'How visible collaboration is through comments, mentions, and handoffs',
    whyItMatters: 'Visible collaboration reduces silos and keeps everyone aligned',
    impact: 'Poor collaboration leads to duplicated effort and miscommunication',
  },
  blockerManagement: {
    title: 'Blocker Management',
    whatItMeans: 'How well blockers are flagged, tracked, and resolved',
    whyItMatters: 'Quick blocker resolution keeps work flowing smoothly',
    impact: 'Unresolved blockers cause delays and frustration',
  },
  automationOpportunities: {
    title: 'Workflow Efficiency',
    whatItMeans: 'Whether your workflows could benefit from automation',
    whyItMatters: 'Automation reduces manual work and ensures consistency',
    impact: 'Manual processes waste time and introduce errors',
  },
  sprintHygiene: {
    title: 'Sprint Health',
    whatItMeans: 'How well your team follows sprint practices and completes commitments',
    whyItMatters: 'Healthy sprints improve predictability and team morale',
    impact: 'Poor sprint hygiene causes scope creep and burnout',
  },
};

/**
 * Represents a dimension that users can select for improvement
 */
export interface SelectableDimension {
  dimensionKey: string;
  dimensionName: string;
  explanation: DimensionExplanation;
  // Health data
  healthScore: number;  // percentile (0-100)
  healthStatus: 'at-risk' | 'needs-attention' | 'on-track';
  riskLevel: 'high' | 'moderate' | 'low';
  trend: 'improving' | 'stable' | 'declining';
  // Action counts
  totalActions: number;
  quickWinActions: number;
  // Indicators
  flaggedIndicators: number;
  healthyIndicators: number;
  // Selection and priority state
  isSelected: boolean;
  isRecommended: boolean;  // True if health status is not 'on-track'
  priority: number | null;  // null until prioritized in Step 2
}

/**
 * Represents a single action selection in the builder wizard
 */
export interface ActionSelection {
  recommendationId: string;
  dimensionKey: string;
  dimensionName: string;
  zoneTag: ActionPlanZoneTag;
  recommendation: Recommendation;
  selected: boolean;
  priority: number | null;  // null until prioritized in Step 3
  isFocus: boolean;         // Whether this is a top-priority focus item
}

/**
 * State for the builder wizard
 */
export interface BuilderWizardState {
  currentStep: number;      // 0=Select Dimensions, 1=Review Actions, 2=Prioritize, 3=Confirm
  dimensions: SelectableDimension[];
  selections: ActionSelection[];
  isComplete: boolean;
}

/**
 * Context value exposed by BuilderContext
 */
export interface BuilderContextValue {
  state: BuilderWizardState;
  rawDimensions: DimensionResult[];

  // Actions
  actions: {
    // Navigation
    goToStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Dimension Selection (Step 1)
    toggleDimension: (dimensionKey: string) => void;
    selectAllRecommended: () => void;
    deselectAll: () => void;

    // Dimension Prioritization (Step 2)
    reorderDimensions: (fromIndex: number, toIndex: number) => void;

    // Action Selection (Step 3) - fine-tune auto-selections
    toggleSelection: (recommendationId: string) => void;
    selectAllInDimension: (dimensionKey: string) => void;
    deselectAllInDimension: (dimensionKey: string) => void;

    // Commit (Step 4)
    commit: () => void;
    reset: () => void;
  };

  // Computed values
  computed: {
    // Step 1 computed
    selectedDimensionCount: number;
    recommendedDimensionCount: number;
    // Step 2 computed - prioritized dimensions
    prioritizedDimensions: SelectableDimension[];
    // Step 3 computed - actions
    selectedActionCount: number;
    availableActionCount: number;  // Actions in selected dimensions
    quickWinCount: number;
    selectedItems: ActionSelection[];
    // General
    effortSummary: 'low' | 'medium' | 'high';
    impactSummary: 'low' | 'medium' | 'high';
    // Grouped data - ordered by dimension priority
    actionsByDimension: Map<string, ActionSelection[]>;
  };
}

/**
 * Payload sent when committing the plan
 */
export interface BuilderCommitPayload {
  selections: Array<{
    recommendationId: string;
    dimensionKey: string;
    zoneTag: ActionPlanZoneTag;
    priority: number;
    isFocus: boolean;
    recommendation: Recommendation;
  }>;
  committedAt: string;  // ISO timestamp
}

/**
 * Props for the builder modal
 */
export interface ActionPlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  dimensions: DimensionResult[];
  onCommit: (payload: BuilderCommitPayload) => void;
}

/**
 * Step configuration
 */
export interface BuilderStepConfig {
  number: number;
  title: string;
  description: string;
}

export const BUILDER_STEPS: BuilderStepConfig[] = [
  {
    number: 0,
    title: 'Select Areas',
    description: 'Choose what you want to improve'
  },
  {
    number: 1,
    title: 'Prioritize',
    description: 'Rank your selected areas'
  },
  {
    number: 2,
    title: 'Review Actions',
    description: 'See the recommended actions'
  },
  {
    number: 3,
    title: 'Launch',
    description: 'Confirm and start your plan'
  },
];

// Legacy types kept for compatibility
export interface FocusArea {
  themeId: string;
  themeName: string;
  themeQuestion: string;
  themeDescription: string;
  dimensionKeys: string[];
  healthScore: number | null;
  healthStatus: 'at-risk' | 'needs-attention' | 'on-track';
  totalActions: number;
  criticalActions: number;
  quickWinActions: number;
  isSelected: boolean;
  isRecommended: boolean;
}

export interface GoalRanking {
  themeId: string;
  themeName: string;
  themeQuestion: string;
  themeDescription: string;
  rank: number;
  dimensionKeys: string[];
  actionCount: number;
  criticalCount: number;
  healthScore: number | null;
}

export interface GoalCoverage {
  themeId: string;
  themeName: string;
  rank: number;
  selected: number;
  total: number;
  criticalSelected: number;
  criticalTotal: number;
}

export interface ZoneSummary {
  zoneTag: ActionPlanZoneTag;
  label: string;
  color: string;
  bgColor: string;
  count: number;
  dimensionKeys: string[];
}
