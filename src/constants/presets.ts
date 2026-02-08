// Dimension presets for quick selection
export type DimensionKey =
  // Cluster 1: Data Quality & Completeness
  | 'workCaptured'
  | 'informationHealth'
  | 'dataFreshness'
  | 'issueTypeConsistency'
  | 'workHierarchy'
  // Cluster 2: Estimation Health
  | 'estimationCoverage'
  | 'sizingConsistency'
  // Cluster 3: Effective Collaboration (collaborationBreadth merged into teamCollaboration)
  | 'teamCollaboration'
  | 'blockerManagement'
  | 'collaborationFeatureUsage'
  // Cluster 4: Jira Efficiency
  | 'automationOpportunities'
  | 'configurationEfficiency'
  // Cluster 5: Methodology Support
  | 'sprintHygiene'
  | 'backlogDiscipline';

export interface DimensionInfo {
  key: DimensionKey;
  label: string;
  shortDescription: string;
}

export const allDimensions: DimensionInfo[] = [
  // Cluster 1: Data Quality & Completeness
  {
    key: 'workCaptured',
    label: 'Invisible Work',
    shortDescription: 'Is all work being captured in Jira?',
  },
  {
    key: 'informationHealth',
    label: 'Information Health',
    shortDescription: 'Do tickets have the information needed for planning?',
  },
  {
    key: 'dataFreshness',
    label: 'Data Freshness',
    shortDescription: 'Does Jira reflect the current state of work?',
  },
  {
    key: 'issueTypeConsistency',
    label: 'Issue Type Consistency',
    shortDescription: 'Are issue types used consistently?',
  },
  {
    key: 'workHierarchy',
    label: 'Work Hierarchy Linkage',
    shortDescription: 'Is work connected from tasks to strategic goals?',
  },
  // Cluster 2: Estimation Health
  {
    key: 'estimationCoverage',
    label: 'Estimation Coverage',
    shortDescription: 'What proportion of work is estimated?',
  },
  {
    key: 'sizingConsistency',
    label: 'Sizing Consistency',
    shortDescription: 'Are estimates reliable and consistent?',
  },
  // Cluster 3: Effective Collaboration
  {
    key: 'teamCollaboration',
    label: 'Team Collaboration',
    shortDescription: 'How effectively does the team collaborate in Jira?',
  },
  {
    key: 'blockerManagement',
    label: 'Blocker Management',
    shortDescription: 'Are blockers captured and managed effectively?',
  },
  {
    key: 'collaborationFeatureUsage',
    label: 'Collaboration Feature Usage',
    shortDescription: 'Are we leveraging Jira collaboration features?',
  },
  // Cluster 4: Jira Efficiency (collaborationBreadth merged into teamCollaboration)
  {
    key: 'automationOpportunities',
    label: 'Automation Opportunities',
    shortDescription: 'What manual work could be automated?',
  },
  {
    key: 'configurationEfficiency',
    label: 'Configuration Efficiency',
    shortDescription: 'Is our Jira setup lean or bloated?',
  },
  // Cluster 5: Methodology Support
  {
    key: 'sprintHygiene',
    label: 'Sprint Hygiene',
    shortDescription: 'Are sprint best practices being followed?',
  },
  {
    key: 'backlogDiscipline',
    label: 'Backlog Discipline',
    shortDescription: 'Is the backlog well-maintained and ready for planning?',
  },
];

export interface DimensionPreset {
  id: string;
  name: string;
  description: string;
  dimensions: DimensionKey[];
  recommended?: boolean;
}

export const dimensionPresets: DimensionPreset[] = [
  {
    id: 'quickStart',
    name: 'Quick Start',
    description: '6 essential dimensions to get started quickly',
    recommended: true,
    dimensions: [
      'workCaptured',
      'informationHealth',
      'estimationCoverage',
      'dataFreshness',
      'sprintHygiene',
      'blockerManagement',
    ],
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'All 14 dimensions for a thorough assessment',
    dimensions: [
      'workCaptured',
      'informationHealth',
      'dataFreshness',
      'issueTypeConsistency',
      'workHierarchy',
      'estimationCoverage',
      'sizingConsistency',
      'teamCollaboration',
      'blockerManagement',
      'collaborationFeatureUsage',
      'automationOpportunities',
      'configurationEfficiency',
      'sprintHygiene',
      'backlogDiscipline',
    ],
  },
  {
    id: 'planningFocus',
    name: 'Planning Focus',
    description: '7 dimensions focused on planning and estimation',
    dimensions: [
      'estimationCoverage',
      'sizingConsistency',
      'informationHealth',
      'workHierarchy',
      'issueTypeConsistency',
      'sprintHygiene',
      'backlogDiscipline',
    ],
  },
  {
    id: 'executionFocus',
    name: 'Execution Focus',
    description: '8 dimensions focused on work execution and tracking',
    dimensions: [
      'workCaptured',
      'dataFreshness',
      'blockerManagement',
      'teamCollaboration',
      'collaborationFeatureUsage',
      'sprintHygiene',
      'automationOpportunities',
      'configurationEfficiency',
    ],
  },
];

// Mock detected Jira configuration (simulates what Forge API would return)
export interface DetectedIssueType {
  key: string;
  name: string;
  detected: boolean;
}

export interface DetectedField {
  id: string;
  name: string;
  type: 'number' | 'text' | 'date' | 'select';
}

export interface MockJiraConfig {
  issueTypes: DetectedIssueType[];
  estimationField: DetectedField | null;
  customFields: DetectedField[];
}

export const mockDetectedConfig: MockJiraConfig = {
  issueTypes: [
    { key: 'story', name: 'Story', detected: true },
    { key: 'bug', name: 'Bug', detected: true },
    { key: 'task', name: 'Task', detected: true },
    { key: 'epic', name: 'Epic', detected: true },
    { key: 'subtask', name: 'Sub-task', detected: true },
  ],
  estimationField: {
    id: 'customfield_10002',
    name: 'Story Points',
    type: 'number',
  },
  customFields: [
    { id: 'customfield_10001', name: 'Acceptance Criteria', type: 'text' },
    { id: 'customfield_10002', name: 'Story Points', type: 'number' },
    { id: 'customfield_10003', name: 'Epic Link', type: 'select' },
    { id: 'customfield_10004', name: 'Sprint', type: 'select' },
  ],
};

// Mock teams for dropdown
export interface TeamSetupInfo {
  setupDate: string; // ISO date string
  setupByName: string;
  setupByEmail: string;
  setupByIsAdmin: boolean;
}

// System attribute values auto-detected from Jira
export interface TeamSystemAttributes {
  teamSize: string;    // Value ID: val-size-small, val-size-medium, val-size-large
  tenure: string;      // Value ID: val-tenure-new, val-tenure-established, val-tenure-mature
  volume: string;      // Value ID: val-volume-low, val-volume-medium, val-volume-high
  process: string;     // Value ID: val-process-scrum, val-process-kanban, val-process-hybrid
}

export interface TeamOption {
  label: string;
  value: string;
  isOnboarded: boolean;
  setupInfo?: TeamSetupInfo;
  systemAttributes?: TeamSystemAttributes; // Auto-calculated from Jira data
}

export const mockTeams: TeamOption[] = [
  {
    label: 'Platform Team',
    value: 'platform',
    isOnboarded: true,
    setupInfo: {
      setupDate: '2024-11-15',
      setupByName: 'Sarah Chen',
      setupByEmail: 'sarah.chen@company.com',
      setupByIsAdmin: true,
    },
    systemAttributes: {
      teamSize: 'val-size-large',
      tenure: 'val-tenure-mature',
      volume: 'val-volume-high',
      process: 'val-process-scrum',
    },
  },
  {
    label: 'Mobile Squad',
    value: 'mobile',
    isOnboarded: true,
    setupInfo: {
      setupDate: '2024-10-22',
      setupByName: 'James Wilson',
      setupByEmail: 'james.wilson@company.com',
      setupByIsAdmin: false,
    },
    systemAttributes: {
      teamSize: 'val-size-medium',
      tenure: 'val-tenure-established',
      volume: 'val-volume-high',
      process: 'val-process-scrum',
    },
  },
  {
    label: 'API Team',
    value: 'api',
    isOnboarded: false,
    systemAttributes: {
      teamSize: 'val-size-small',
      tenure: 'val-tenure-new',
      volume: 'val-volume-medium',
      process: 'val-process-kanban',
    },
  },
  {
    label: 'Frontend Crew',
    value: 'frontend',
    isOnboarded: true,
    setupInfo: {
      setupDate: '2024-12-01',
      setupByName: 'Emily Rodriguez',
      setupByEmail: 'emily.rodriguez@company.com',
      setupByIsAdmin: true,
    },
    systemAttributes: {
      teamSize: 'val-size-medium',
      tenure: 'val-tenure-established',
      volume: 'val-volume-medium',
      process: 'val-process-scrum',
    },
  },
  {
    label: 'Data Engineering',
    value: 'data',
    isOnboarded: false,
    systemAttributes: {
      teamSize: 'val-size-small',
      tenure: 'val-tenure-mature',
      volume: 'val-volume-low',
      process: 'val-process-kanban',
    },
  },
  {
    label: 'DevOps Team',
    value: 'devops',
    isOnboarded: false,
    systemAttributes: {
      teamSize: 'val-size-small',
      tenure: 'val-tenure-established',
      volume: 'val-volume-high',
      process: 'val-process-hybrid',
    },
  },
];

// Date range presets
export interface DateRangePreset {
  id: string;
  label: string;
  getRange: () => { startDate: string; endDate: string };
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const dateRangePresets: DateRangePreset[] = [
  {
    id: 'last3Months',
    label: 'Last 3 months',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    },
  },
  {
    id: 'last6Months',
    label: 'Last 6 months',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      return { startDate: formatDate(start), endDate: formatDate(end) };
    },
  },
  {
    id: 'custom',
    label: 'Custom range',
    getRange: () => ({ startDate: '', endDate: '' }),
  },
];

// ============================================
// Mock Jira Fields for Dropdowns
// ============================================

export interface JiraField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'user' | 'multi-select';
}

// Acceptance Criteria field options
export const mockAcceptanceCriteriaFields: JiraField[] = [
  { id: 'customfield_10001', name: 'Acceptance Criteria', type: 'text' },
  { id: 'customfield_10010', name: 'AC', type: 'text' },
  { id: 'description', name: 'Description (use for AC)', type: 'text' },
  { id: 'none', name: 'Not configured', type: 'text' },
];

// Parent/Epic link field options
export const mockParentEpicFields: JiraField[] = [
  { id: 'parent', name: 'Parent', type: 'select' },
  { id: 'customfield_10003', name: 'Epic Link', type: 'select' },
  { id: 'customfield_10014', name: 'Parent Link', type: 'select' },
  { id: 'none', name: 'Not configured', type: 'select' },
];

// Estimate field options
export const mockEstimateFields: JiraField[] = [
  { id: 'customfield_10002', name: 'Story Points', type: 'number' },
  { id: 'customfield_10005', name: 'Original Estimate', type: 'number' },
  { id: 'timeoriginalestimate', name: 'Time Estimate', type: 'number' },
  { id: 'customfield_10020', name: 'T-Shirt Size', type: 'select' },
  { id: 'none', name: 'Not configured', type: 'number' },
];

// Due Date field options
export const mockDueDateFields: JiraField[] = [
  { id: 'duedate', name: 'Due Date', type: 'date' },
  { id: 'customfield_10015', name: 'Target Date', type: 'date' },
  { id: 'customfield_10016', name: 'Completion Date', type: 'date' },
  { id: 'none', name: 'Not configured', type: 'date' },
];

// Priority field options
export const mockPriorityFields: JiraField[] = [
  { id: 'priority', name: 'Priority', type: 'select' },
  { id: 'customfield_10017', name: 'Business Priority', type: 'select' },
  { id: 'customfield_10018', name: 'Urgency', type: 'select' },
  { id: 'none', name: 'Not configured', type: 'select' },
];

// All custom fields available for mapping
export const mockAllJiraFields: JiraField[] = [
  { id: 'customfield_10001', name: 'Acceptance Criteria', type: 'text' },
  { id: 'customfield_10002', name: 'Story Points', type: 'number' },
  { id: 'customfield_10003', name: 'Epic Link', type: 'select' },
  { id: 'customfield_10004', name: 'Sprint', type: 'select' },
  { id: 'customfield_10005', name: 'Original Estimate', type: 'number' },
  { id: 'customfield_10010', name: 'AC', type: 'text' },
  { id: 'customfield_10014', name: 'Parent Link', type: 'select' },
  { id: 'customfield_10015', name: 'Target Date', type: 'date' },
  { id: 'customfield_10016', name: 'Completion Date', type: 'date' },
  { id: 'customfield_10017', name: 'Business Priority', type: 'select' },
  { id: 'customfield_10018', name: 'Urgency', type: 'select' },
  { id: 'customfield_10019', name: 'Release', type: 'select' },
  { id: 'customfield_10020', name: 'T-Shirt Size', type: 'select' },
  { id: 'customfield_10021', name: 'Business Value', type: 'number' },
  { id: 'assignee', name: 'Assignee', type: 'user' },
  { id: 'reporter', name: 'Reporter', type: 'user' },
  { id: 'duedate', name: 'Due Date', type: 'date' },
  { id: 'priority', name: 'Priority', type: 'select' },
  { id: 'labels', name: 'Labels', type: 'multi-select' },
  { id: 'components', name: 'Components', type: 'multi-select' },
  { id: 'fixVersions', name: 'Fix Version', type: 'multi-select' },
];

// ============================================
// Mock Workflow States
// ============================================

export interface WorkflowStateOption {
  id: string;
  name: string;
  category: 'todo' | 'in-progress' | 'done';
}

export const mockWorkflowStates: WorkflowStateOption[] = [
  { id: 'open', name: 'Open', category: 'todo' },
  { id: 'ready', name: 'Ready for Dev', category: 'todo' },
  { id: 'inProgress', name: 'In Progress', category: 'in-progress' },
  { id: 'review', name: 'Code Review', category: 'in-progress' },
  { id: 'testing', name: 'Testing', category: 'in-progress' },
  { id: 'done', name: 'Done', category: 'done' },
];

// ============================================
// Mock Labels (for blocker detection)
// ============================================

export interface LabelOption {
  value: string;
  label: string;
}

export const mockBlockerLabels: LabelOption[] = [
  { value: 'blocked', label: 'blocked' },
  { value: 'blocker', label: 'blocker' },
  { value: 'impediment', label: 'impediment' },
  { value: 'waiting', label: 'waiting' },
  { value: 'on-hold', label: 'on-hold' },
  { value: 'dependency', label: 'dependency' },
  { value: 'external-dependency', label: 'external-dependency' },
  { value: 'waiting-for-review', label: 'waiting-for-review' },
  { value: 'waiting-for-info', label: 'waiting-for-info' },
];

// ============================================
// Mock Statuses (for blocker detection)
// ============================================

export interface StatusOption {
  value: string;
  label: string;
  category: 'todo' | 'in-progress' | 'done';
}

export const mockStatuses: StatusOption[] = [
  { value: 'backlog', label: 'Backlog', category: 'todo' },
  { value: 'open', label: 'Open', category: 'todo' },
  { value: 'ready', label: 'Ready', category: 'todo' },
  { value: 'blocked', label: 'Blocked', category: 'in-progress' },
  { value: 'on-hold', label: 'On Hold', category: 'in-progress' },
  { value: 'in-progress', label: 'In Progress', category: 'in-progress' },
  { value: 'code-review', label: 'Code Review', category: 'in-progress' },
  { value: 'testing', label: 'Testing', category: 'in-progress' },
  { value: 'done', label: 'Done', category: 'done' },
  { value: 'closed', label: 'Closed', category: 'done' },
];

// Statuses that commonly indicate blocked items
export const mockBlockedStatuses: StatusOption[] = [
  { value: 'blocked', label: 'Blocked', category: 'in-progress' },
  { value: 'on-hold', label: 'On Hold', category: 'in-progress' },
  { value: 'waiting', label: 'Waiting', category: 'in-progress' },
];

// ============================================
// Mock Link Types (for blocker detection)
// ============================================

export interface LinkTypeOption {
  value: string;
  label: string;
  inwardDescription: string;
  outwardDescription: string;
}

export const mockLinkTypes: LinkTypeOption[] = [
  { value: 'blocks', label: 'Blocks', inwardDescription: 'is blocked by', outwardDescription: 'blocks' },
  { value: 'depends-on', label: 'Depends On', inwardDescription: 'is depended upon by', outwardDescription: 'depends on' },
  { value: 'relates-to', label: 'Relates To', inwardDescription: 'relates to', outwardDescription: 'relates to' },
  { value: 'clones', label: 'Clones', inwardDescription: 'is cloned by', outwardDescription: 'clones' },
  { value: 'duplicates', label: 'Duplicates', inwardDescription: 'is duplicated by', outwardDescription: 'duplicates' },
];

// ============================================
// Estimation System Options
// ============================================

export interface EstimationSystemOption {
  id: string;
  name: string;
  description: string;
  example: string;
}

export const estimationSystems: EstimationSystemOption[] = [
  { id: 'fibonacci', name: 'Fibonacci', description: 'Modified Fibonacci sequence', example: '1, 2, 3, 5, 8, 13, 21' },
  { id: 'integers', name: 'Linear (1-10)', description: 'Simple integer scale', example: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10' },
  { id: 'fractions', name: 'Fractional Days', description: 'Day fractions', example: '0.5, 1, 1.5, 2, 3, 5' },
  { id: 'tshirt', name: 'T-Shirt Sizes', description: 'Relative sizing', example: 'XS, S, M, L, XL' },
  { id: 'custom', name: 'Custom', description: 'Define your own scale', example: 'Enter custom values...' },
];

// ============================================
// Comparison Criteria Labels
// ============================================

export const comparisonCriteriaLabels: Record<string, { label: string; description: string }> = {
  compareToOrganisation: {
    label: 'Other teams in organisation',
    description: 'Compare against all teams in your organisation',
  },
  compareToScrumTeams: {
    label: 'Other Scrum teams',
    description: 'Compare against teams using Scrum methodology',
  },
  compareToSimilarDemand: {
    label: 'Teams with similar demand variability',
    description: 'Compare against teams with similar work demand patterns',
  },
  compareToSimilarVolume: {
    label: 'Teams with similar volume of work',
    description: 'Compare against teams processing similar issue counts',
  },
  compareToMatureTeams: {
    label: 'Teams active for >6 months',
    description: 'Compare against established teams with history',
  },
  compareToTribeTeams: {
    label: 'Other Tribe teams',
    description: 'Compare against teams in your Tribe/department',
  },
  compareToSpecificTeams: {
    label: 'Specific teams',
    description: 'Compare against hand-picked teams',
  },
};
