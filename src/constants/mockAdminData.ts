// Mock data for Admin features
// Provides realistic sample data for the PoC

import {
  ManagedUser,
  UserGroup,
  OrganizationDefaults,
  OrganizationStructure,
  AdminAnalytics,
  AdminState,
  TeamAttribute,
  AttributeValue,
  TeamAttributeConfig,
  OrgStructureSettings,
  AccessRequest,
  GroupAccessRule,
  UserGroupAccessRule,
  OutcomeOrgStats,
  ImprovementJourneyStats,
  DimensionGapStats,
  OutcomeTrendPoint,
  AdoptionFunnelStats,
  ActionableAlert,
  AdminOverviewStats,
  FieldHealthConfig,
  WorkflowConfig,
  EstimationPolicy,
  BlockerMethodConfig,
  QualityRule,
} from '../types/admin';
import { INITIAL_ADMIN_SETUP_PROGRESS } from '../types/adminSetup';
import { INITIAL_REPORTS_STATE } from './mockReportsData';

// ============================================
// Mock Users
// ============================================
export const MOCK_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'user-1',
    displayName: 'Rachel Garcia',
    email: 'rachel.garcia@company.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-06-15T10:00:00Z',
    lastActiveAt: '2025-01-06T14:30:00Z',
    groupIds: ['group-1'],
  },
  {
    id: 'user-2',
    displayName: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'creator',
    status: 'active',
    createdAt: '2024-07-20T09:00:00Z',
    lastActiveAt: '2025-01-05T16:45:00Z',
    invitedBy: 'Rachel Garcia',
    invitedAt: '2024-07-18T10:00:00Z',
    groupIds: ['group-1', 'group-2'],
  },
  {
    id: 'user-3',
    displayName: 'Tom Anderson',
    email: 'tom.anderson@company.com',
    role: 'creator',
    status: 'active',
    createdAt: '2024-08-10T11:30:00Z',
    lastActiveAt: '2025-01-04T10:15:00Z',
    invitedBy: 'Rachel Garcia',
    invitedAt: '2024-08-08T14:00:00Z',
    groupIds: ['group-2'],
  },
  {
    id: 'user-4',
    displayName: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'viewer',
    status: 'active',
    createdAt: '2024-09-05T14:00:00Z',
    lastActiveAt: '2024-12-28T09:00:00Z',
    invitedBy: 'Sarah Chen',
    invitedAt: '2024-09-03T11:00:00Z',
    groupIds: [],
  },
  {
    id: 'user-5',
    displayName: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'viewer',
    status: 'pending',
    createdAt: '2025-01-02T10:00:00Z',
    invitedBy: 'Rachel Garcia',
    invitedAt: '2025-01-02T10:00:00Z',
    groupIds: [],
  },
  {
    id: 'user-6',
    displayName: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'creator',
    status: 'deactivated',
    createdAt: '2024-05-20T08:00:00Z',
    lastActiveAt: '2024-11-15T12:00:00Z',
    deactivatedAt: '2024-11-20T09:00:00Z',
    deactivatedBy: 'Rachel Garcia',
    groupIds: [],
  },
];

// ============================================
// Mock User Groups
// ============================================
export const MOCK_USER_GROUPS: UserGroup[] = [
  {
    id: 'group-1',
    name: 'Leadership',
    description: 'Engineering managers and directors',
    memberIds: ['user-1', 'user-2'],
    memberCount: 2,
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'group-2',
    name: 'Platform Engineering',
    description: 'Platform team leads and senior engineers',
    memberIds: ['user-3', 'user-4'],
    memberCount: 2,
    createdAt: '2024-07-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
];

// ============================================
// Default Field Health Configuration
// ============================================
export const DEFAULT_FIELD_HEALTH: FieldHealthConfig = {
  standardFields: [
    { fieldId: 'acceptanceCriteria', fieldName: 'Acceptance Criteria', description: 'Defined acceptance criteria for stories', enabled: true, isDefault: true },
    { fieldId: 'linkedIssues', fieldName: 'Linked Issues', description: 'Links to related issues', enabled: true, isDefault: true },
    { fieldId: 'parentEpic', fieldName: 'Parent Epic', description: 'Linked to parent epic', enabled: true, isDefault: true },
    { fieldId: 'estimates', fieldName: 'Estimates', description: 'Story points or time estimates', enabled: true, isDefault: true },
    { fieldId: 'assignee', fieldName: 'Assignee', description: 'Assigned team member', enabled: true, isDefault: true },
    { fieldId: 'dueDate', fieldName: 'Due Date', description: 'Target completion date', enabled: true, isDefault: true },
    { fieldId: 'subTasks', fieldName: 'Sub-tasks', description: 'Has sub-task breakdown', enabled: false, isDefault: true },
    { fieldId: 'priority', fieldName: 'Priority', description: 'Issue priority level', enabled: true, isDefault: true },
  ],
  customFields: [],
};

// ============================================
// Default Workflow Configuration
// ============================================
export const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    issueType: 'Story',
    statuses: [
      { statusId: 'story-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'story-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'story-3', statusName: 'In Review', category: 'in-progress' },
      { statusId: 'story-4', statusName: 'Done', category: 'done' },
    ],
    isInferred: true,
    lastInferredAt: '2024-12-01T10:00:00Z',
  },
  {
    issueType: 'Bug',
    statuses: [
      { statusId: 'bug-1', statusName: 'Open', category: 'todo' },
      { statusId: 'bug-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'bug-3', statusName: 'Fixed', category: 'in-progress' },
      { statusId: 'bug-4', statusName: 'Verified', category: 'in-progress' },
      { statusId: 'bug-5', statusName: 'Closed', category: 'done' },
    ],
    isInferred: true,
    lastInferredAt: '2024-12-01T10:00:00Z',
  },
  {
    issueType: 'Task',
    statuses: [
      { statusId: 'task-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'task-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'task-3', statusName: 'Done', category: 'done' },
    ],
    isInferred: true,
    lastInferredAt: '2024-12-01T10:00:00Z',
  },
  {
    issueType: 'Epic',
    statuses: [
      { statusId: 'epic-1', statusName: 'Draft', category: 'todo' },
      { statusId: 'epic-2', statusName: 'Ready', category: 'todo' },
      { statusId: 'epic-3', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'epic-4', statusName: 'Complete', category: 'done' },
    ],
    isInferred: true,
    lastInferredAt: '2024-12-01T10:00:00Z',
  },
  {
    issueType: 'Sub-task',
    statuses: [
      { statusId: 'sub-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'sub-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'sub-3', statusName: 'Done', category: 'done' },
    ],
    isInferred: true,
    lastInferredAt: '2024-12-01T10:00:00Z',
  },
];

// ============================================
// Default Estimation Policies
// ============================================
export const DEFAULT_ESTIMATION_POLICIES: EstimationPolicy[] = [
  {
    issueType: 'Story',
    isEstimated: true,
    estimationField: 'storyPoints',
    estimationTrigger: 'onTransition',
    triggerStatus: 'Ready for Dev',
    isInferred: true,
  },
  {
    issueType: 'Bug',
    isEstimated: false,
    estimationField: 'storyPoints',
    estimationTrigger: 'manual',
    isInferred: true,
  },
  {
    issueType: 'Task',
    isEstimated: true,
    estimationField: 'timeEstimate',
    estimationTrigger: 'onCreation',
    isInferred: true,
  },
  {
    issueType: 'Epic',
    isEstimated: false,
    estimationField: 'storyPoints',
    estimationTrigger: 'manual',
    isInferred: true,
  },
  {
    issueType: 'Sub-task',
    isEstimated: true,
    estimationField: 'timeEstimate',
    estimationTrigger: 'onCreation',
    isInferred: true,
  },
];

// ============================================
// Default Blocker Configuration
// ============================================
export const DEFAULT_BLOCKER_CONFIG: BlockerMethodConfig = {
  useFlags: true,
  flagNames: ['Blocked', 'Impediment'],
  useLabels: false,
  labelPatterns: [],
  useStatus: false,
  blockedStatuses: [],
  useLinks: true,
  linkTypes: ['is blocked by'],
};

// ============================================
// Mock Quality Rules
// ============================================
export const MOCK_QUALITY_RULES: QualityRule[] = [
  {
    id: 'qr-ac-given-when-then',
    name: 'AC must use Given/When/Then',
    description: 'Acceptance criteria should follow the Given/When/Then format for testability.',
    fieldId: 'acceptanceCriteria',
    fieldType: 'text',
    ruleType: 'text-contains-pattern',
    config: { pattern: '(?i)(given|when|then)' },
    appliesTo: ['story', 'bug'],
    enabled: true,
    severity: 'required',
  },
  {
    id: 'qr-desc-min-length',
    name: 'Description minimum 50 characters',
    description: 'All descriptions must contain at least 50 characters of meaningful content.',
    fieldId: 'description',
    fieldType: 'text',
    ruleType: 'text-minimum-length',
    config: { minLength: 50 },
    appliesTo: ['story', 'bug', 'task'],
    enabled: true,
    severity: 'required',
  },
  {
    id: 'qr-desc-no-placeholder',
    name: 'Description must not contain placeholders',
    description: 'Descriptions should not contain placeholder text like TBD, TODO, or N/A.',
    fieldId: 'description',
    fieldType: 'text',
    ruleType: 'text-no-placeholder',
    config: { placeholderPhrases: ['TBD', 'TODO', 'N/A', 'To be determined', 'Fill in later'] },
    appliesTo: ['story', 'bug', 'task'],
    enabled: true,
    severity: 'recommended',
  },
  {
    id: 'qr-story-points-fibonacci',
    name: 'Story points must use Fibonacci values',
    description: 'Story point estimates must be from the Fibonacci sequence.',
    fieldId: 'storyPoints',
    fieldType: 'number',
    ruleType: 'number-in-set',
    config: { allowedValues: [1, 2, 3, 5, 8, 13, 21] },
    appliesTo: ['story'],
    enabled: true,
    severity: 'required',
  },
  {
    id: 'qr-story-points-range',
    name: 'Story points within reasonable range',
    description: 'Story points should be between 1 and 13 for individual stories.',
    fieldId: 'storyPoints',
    fieldType: 'number',
    ruleType: 'number-in-range',
    config: { min: 1, max: 13 },
    appliesTo: ['story'],
    enabled: true,
    severity: 'recommended',
  },
  {
    id: 'qr-priority-not-default',
    name: 'Priority must be deliberately set',
    description: 'Priority should not remain at the system default "Medium".',
    fieldId: 'priority',
    fieldType: 'select',
    ruleType: 'select-not-default',
    config: { defaultValue: 'Medium' },
    appliesTo: ['story', 'bug', 'task'],
    enabled: true,
    severity: 'recommended',
  },
  {
    id: 'qr-component-set',
    name: 'Component must be selected',
    description: 'At least one component must be selected for categorization.',
    fieldId: 'components',
    fieldType: 'multi-select',
    ruleType: 'multi-select-min-count',
    config: { minCount: 1 },
    appliesTo: ['story', 'bug'],
    enabled: true,
    severity: 'recommended',
  },
];

// ============================================
// Mock Organization Defaults
// ============================================
export const MOCK_ORG_DEFAULTS: OrganizationDefaults = {
  id: 'defaults-1',
  issueTypes: {
    mode: 'team-decides',  // Default to team-decides for backward compatibility
    value: null,
  },
  staleThresholds: {
    mode: 'org-defined',
    value: {
      story: { days: 14, enabled: true },
      bug: { days: 7, enabled: true },
      task: { days: 7, enabled: true },
      epic: { days: 30, enabled: true },
      subtask: { days: 5, enabled: true },
    },
  },
  sprintCadence: {
    mode: 'team-decides',
    value: null,
  },
  dimensionPresets: {
    mode: 'org-defined',
    value: ['quickStart', 'comprehensive', 'planningFocus', 'executionFocus'],
  },
  fieldHealth: {
    mode: 'org-defined',
    value: DEFAULT_FIELD_HEALTH,
  },
  workflows: {
    mode: 'org-defined',
    value: DEFAULT_WORKFLOWS,
  },
  estimation: {
    mode: 'org-defined',
    value: DEFAULT_ESTIMATION_POLICIES,
  },
  blockers: {
    mode: 'org-defined',
    value: DEFAULT_BLOCKER_CONFIG,
  },
  qualityRules: {
    mode: 'org-defined',
    value: MOCK_QUALITY_RULES,
  },
  updatedAt: '2024-12-01T10:00:00Z',
  updatedBy: 'Rachel Garcia',
};

// ============================================
// Mock Organization Structure
// ============================================
export const MOCK_ORG_STRUCTURE: OrganizationStructure = {
  hierarchyLevels: [
    { id: 'level-1', name: 'Portfolio', pluralName: 'Portfolios', order: 0, color: '#0052CC' },
    { id: 'level-2', name: 'Tribe', pluralName: 'Tribes', order: 1, color: '#00875A' },
    { id: 'level-3', name: 'Squad', pluralName: 'Squads', order: 2, color: '#FF8B00' },
  ],
  nodes: [
    {
      id: 'node-1',
      name: 'Consumer Products',
      levelId: 'level-1',
      parentId: null,
      teamIds: [],
      createdAt: '2024-06-01T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-2',
      name: 'Platform Infrastructure',
      levelId: 'level-1',
      parentId: null,
      teamIds: [],
      createdAt: '2024-06-01T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-3',
      name: 'Mobile Experience',
      levelId: 'level-2',
      parentId: 'node-1',
      teamIds: [],
      createdAt: '2024-06-15T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-4',
      name: 'Web Experience',
      levelId: 'level-2',
      parentId: 'node-1',
      teamIds: [],
      createdAt: '2024-06-15T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-5',
      name: 'Core APIs',
      levelId: 'level-2',
      parentId: 'node-2',
      teamIds: [],
      createdAt: '2024-06-15T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-6',
      name: 'Mobile Squad',
      levelId: 'level-3',
      parentId: 'node-3',
      teamIds: ['mobile'],
      createdAt: '2024-07-01T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-7',
      name: 'Platform Team',
      levelId: 'level-3',
      parentId: 'node-5',
      teamIds: ['platform'],
      createdAt: '2024-07-01T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
    {
      id: 'node-8',
      name: 'Frontend Crew',
      levelId: 'level-3',
      parentId: 'node-4',
      teamIds: ['frontend'],
      createdAt: '2024-07-01T10:00:00Z',
      createdBy: 'Rachel Garcia',
    },
  ],
};

// ============================================
// Mock Team Attributes (Admin-Defined)
// ============================================
export const MOCK_ADMIN_ATTRIBUTES: TeamAttribute[] = [
  {
    id: 'cat-work-type',
    name: 'Work Type',
    description: 'The type of work this team primarily focuses on',
    type: 'admin',
    color: '#0052CC',
    isRequired: true,
    allowMultiple: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'cat-portfolio',
    name: 'Portfolio',
    description: 'A structure that houses teams of teams - e.g., business unit, department, portfolio, value stream, etc.',
    type: 'org-structure',
    color: '#403294',
    isRequired: false,
    allowMultiple: false,
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'cat-tribe',
    name: 'Team of Teams',
    description: 'A structure comprising multiple teams - e.g., program, tribe, release train, project team, squad, etc.',
    type: 'org-structure',
    color: '#00875A',
    isRequired: false,
    allowMultiple: false,
    parentAttributeId: 'cat-portfolio', // Team of Teams belongs to Portfolio
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'cat-domain',
    name: 'Domain',
    description: 'The business domain or area of expertise',
    type: 'admin',
    color: '#FF8B00',
    isRequired: false,
    allowMultiple: true,
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
];

// ============================================
// Mock System Attributes (Auto-Calculated)
// ============================================
export const MOCK_SYSTEM_ATTRIBUTES: TeamAttribute[] = [
  {
    id: 'sys-team-size',
    name: 'Team Size',
    description: 'Auto-calculated from Jira contributor count (last 90 days)',
    type: 'system',
    color: '#6554C0',
    isRequired: false,
    allowMultiple: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'sys-tenure',
    name: 'Tenure',
    description: 'Auto-calculated from time since first Jira activity',
    type: 'system',
    color: '#00B8D9',
    isRequired: false,
    allowMultiple: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'sys-volume',
    name: 'Volume',
    description: 'Auto-calculated from issues completed per month',
    type: 'system',
    color: '#36B37E',
    isRequired: false,
    allowMultiple: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'sys-process',
    name: 'Process',
    description: 'Auto-detected from sprint usage patterns in Jira',
    type: 'system',
    color: '#FF5630',
    isRequired: false,
    allowMultiple: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
];

// Combined attributes (admin + system)
export const MOCK_ATTRIBUTES: TeamAttribute[] = [
  ...MOCK_ADMIN_ATTRIBUTES,
  ...MOCK_SYSTEM_ATTRIBUTES,
];

// Legacy alias for backward compatibility
export const MOCK_CATEGORIES = MOCK_ATTRIBUTES;

export const MOCK_ATTRIBUTE_VALUES: AttributeValue[] = [
  // Work Type values
  {
    id: 'val-product',
    attributeId: 'cat-work-type',
    categoryId: 'cat-work-type', // Legacy alias for backward compatibility
    name: 'Product Development',
    description: 'Teams building new features and products',
    filterRule: null,
    manualTeamIds: ['mobile', 'frontend'],
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-platform',
    attributeId: 'cat-work-type',
    categoryId: 'cat-work-type',
    name: 'Platform',
    description: 'Teams maintaining core infrastructure and platforms',
    filterRule: {
      conditions: [
        { field: 'teamKey', operator: 'startsWith', value: 'platform' },
      ],
    },
    manualTeamIds: [],
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-bau',
    attributeId: 'cat-work-type',
    categoryId: 'cat-work-type',
    name: 'BAU / Support',
    description: 'Teams handling operations and support activities',
    filterRule: {
      conditions: [
        { field: 'teamName', operator: 'contains', value: 'ops' },
      ],
    },
    manualTeamIds: [],
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  // Portfolio values (top-level team-of-teams)
  {
    id: 'val-consumer-portfolio',
    attributeId: 'cat-portfolio',
    categoryId: 'cat-portfolio',
    name: 'Consumer Products',
    description: 'Customer-facing products and experiences',
    filterRule: null,
    manualTeamIds: [],
    // Teams of Teams assignment for Portfolio
    teamOfTeamsFilterRule: {
      conditions: [
        { field: 'teamName', operator: 'contains', value: 'experience' },
      ],
    },
    manualTeamOfTeamsIds: ['val-mobile-tribe', 'val-web-tribe'],
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-platform-portfolio',
    attributeId: 'cat-portfolio',
    categoryId: 'cat-portfolio',
    name: 'Platform Infrastructure',
    description: 'Core platform and infrastructure teams',
    filterRule: null,
    manualTeamIds: [],
    // Teams of Teams assignment for Portfolio
    teamOfTeamsFilterRule: undefined,
    manualTeamOfTeamsIds: ['val-core-tribe'],
    createdAt: '2024-06-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  // Tribe values (belong to Portfolios)
  {
    id: 'val-mobile-tribe',
    attributeId: 'cat-tribe',
    categoryId: 'cat-tribe',
    name: 'Mobile Experience',
    description: 'Teams working on mobile applications',
    filterRule: {
      conditions: [
        { field: 'teamName', operator: 'contains', value: 'mobile' },
      ],
    },
    manualTeamIds: [],
    parentValueId: 'val-consumer-portfolio', // Belongs to Consumer Products
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-web-tribe',
    attributeId: 'cat-tribe',
    categoryId: 'cat-tribe',
    name: 'Web Experience',
    description: 'Teams working on web applications',
    filterRule: {
      conditions: [
        { field: 'teamName', operator: 'contains', value: 'frontend' },
      ],
    },
    manualTeamIds: [],
    parentValueId: 'val-consumer-portfolio', // Belongs to Consumer Products
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-core-tribe',
    attributeId: 'cat-tribe',
    categoryId: 'cat-tribe',
    name: 'Core APIs',
    description: 'Teams building and maintaining core APIs',
    filterRule: {
      conditions: [
        { field: 'teamName', operator: 'contains', value: 'api' },
      ],
    },
    manualTeamIds: ['platform'],
    parentValueId: 'val-platform-portfolio', // Belongs to Platform Infrastructure
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  // Domain values
  {
    id: 'val-payments',
    attributeId: 'cat-domain',
    categoryId: 'cat-domain',
    name: 'Payments',
    description: 'Payment processing and transactions',
    filterRule: {
      conditions: [
        { field: 'teamKey', operator: 'in', value: ['payments-core', 'payments-fraud', 'payments-ops'] },
      ],
    },
    manualTeamIds: [],
    createdAt: '2024-07-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-identity',
    attributeId: 'cat-domain',
    categoryId: 'cat-domain',
    name: 'Identity & Auth',
    description: 'User identity, authentication, and authorization',
    filterRule: null,
    manualTeamIds: [],
    createdAt: '2024-07-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  {
    id: 'val-search',
    attributeId: 'cat-domain',
    categoryId: 'cat-domain',
    name: 'Search & Discovery',
    description: 'Search functionality and product discovery',
    filterRule: null,
    manualTeamIds: [],
    createdAt: '2024-07-01T10:00:00Z',
    createdBy: 'Rachel Garcia',
  },
  // System Attribute Values - Team Size
  {
    id: 'val-size-small',
    attributeId: 'sys-team-size',
    categoryId: 'sys-team-size',
    name: 'Small',
    description: '1-5 contributors',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 1, max: 5 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-size-medium',
    attributeId: 'sys-team-size',
    categoryId: 'sys-team-size',
    name: 'Medium',
    description: '6-15 contributors',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 6, max: 15 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-size-large',
    attributeId: 'sys-team-size',
    categoryId: 'sys-team-size',
    name: 'Large',
    description: '16+ contributors',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 16 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  // System Attribute Values - Tenure
  {
    id: 'val-tenure-new',
    attributeId: 'sys-tenure',
    categoryId: 'sys-tenure',
    name: 'New',
    description: 'Less than 6 months',
    filterRule: null,
    manualTeamIds: [],
    threshold: { max: 6 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-tenure-established',
    attributeId: 'sys-tenure',
    categoryId: 'sys-tenure',
    name: 'Good',
    description: '6-18 months',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 6, max: 18 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-tenure-mature',
    attributeId: 'sys-tenure',
    categoryId: 'sys-tenure',
    name: 'Mature',
    description: '18+ months',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 18 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  // System Attribute Values - Volume
  {
    id: 'val-volume-low',
    attributeId: 'sys-volume',
    categoryId: 'sys-volume',
    name: 'Low',
    description: 'Bottom third by issues/month',
    filterRule: null,
    manualTeamIds: [],
    threshold: { max: 33 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-volume-medium',
    attributeId: 'sys-volume',
    categoryId: 'sys-volume',
    name: 'Medium',
    description: 'Middle third by issues/month',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 33, max: 66 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-volume-high',
    attributeId: 'sys-volume',
    categoryId: 'sys-volume',
    name: 'High',
    description: 'Top third by issues/month',
    filterRule: null,
    manualTeamIds: [],
    threshold: { min: 66 },
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  // System Attribute Values - Process
  {
    id: 'val-process-scrum',
    attributeId: 'sys-process',
    categoryId: 'sys-process',
    name: 'Scrum',
    description: 'Teams using regular sprint cycles',
    filterRule: null,
    manualTeamIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-process-kanban',
    attributeId: 'sys-process',
    categoryId: 'sys-process',
    name: 'Kanban',
    description: 'Teams with continuous flow (no sprints)',
    filterRule: null,
    manualTeamIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
  {
    id: 'val-process-hybrid',
    attributeId: 'sys-process',
    categoryId: 'sys-process',
    name: 'Hybrid',
    description: 'Teams mixing sprint and flow-based work',
    filterRule: null,
    manualTeamIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'System',
  },
];

// Legacy alias for backward compatibility
export const MOCK_CATEGORY_VALUES = MOCK_ATTRIBUTE_VALUES;

export const MOCK_TEAM_ATTRIBUTES: TeamAttributeConfig = {
  // New naming
  attributes: MOCK_ATTRIBUTES,
  attributeValues: MOCK_ATTRIBUTE_VALUES,
  // Legacy aliases for backward compatibility
  categories: MOCK_ATTRIBUTES,
  categoryValues: MOCK_ATTRIBUTE_VALUES,
};

// Legacy alias for backward compatibility
export const MOCK_TEAM_CATEGORIZATION = MOCK_TEAM_ATTRIBUTES;

// ============================================
// Mock Team Health Data (for distribution visualization)
// ============================================
export interface TeamHealthData {
  id: string;
  name: string;
  healthScore: number;
  trend: 'improving' | 'stable' | 'declining';
  trendChange: number; // percentage change
  lastAssessment: string;
  workType: string;
  portfolio: string;
}

export const MOCK_TEAM_HEALTH_DATA: TeamHealthData[] = [
  // Thriving (80-100)
  { id: 'team-1', name: 'Payments Core', healthScore: 92, trend: 'improving', trendChange: 8, lastAssessment: '2025-01-05', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-2', name: 'Mobile Experience', healthScore: 88, trend: 'improving', trendChange: 12, lastAssessment: '2025-01-06', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-3', name: 'Search Team', healthScore: 85, trend: 'stable', trendChange: 1, lastAssessment: '2025-01-04', workType: 'Product Development', portfolio: 'Platform Infrastructure' },
  { id: 'team-4', name: 'API Gateway', healthScore: 82, trend: 'improving', trendChange: 5, lastAssessment: '2025-01-03', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-5', name: 'Identity Services', healthScore: 81, trend: 'stable', trendChange: 0, lastAssessment: '2025-01-05', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-6', name: 'Frontend Crew', healthScore: 80, trend: 'improving', trendChange: 6, lastAssessment: '2025-01-06', workType: 'Product Development', portfolio: 'Consumer Products' },
  // Healthy (60-79)
  { id: 'team-7', name: 'Data Platform', healthScore: 78, trend: 'stable', trendChange: 2, lastAssessment: '2025-01-04', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-8', name: 'Checkout Flow', healthScore: 75, trend: 'improving', trendChange: 4, lastAssessment: '2025-01-05', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-9', name: 'Notifications', healthScore: 72, trend: 'stable', trendChange: -1, lastAssessment: '2025-01-03', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-10', name: 'Analytics Team', healthScore: 70, trend: 'stable', trendChange: 0, lastAssessment: '2025-01-02', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-11', name: 'Content Management', healthScore: 68, trend: 'declining', trendChange: -5, lastAssessment: '2025-01-04', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-12', name: 'Order Management', healthScore: 65, trend: 'stable', trendChange: 1, lastAssessment: '2025-01-05', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-13', name: 'Inventory System', healthScore: 63, trend: 'improving', trendChange: 7, lastAssessment: '2025-01-06', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-14', name: 'User Profiles', healthScore: 61, trend: 'stable', trendChange: 0, lastAssessment: '2025-01-03', workType: 'Product Development', portfolio: 'Consumer Products' },
  // Developing (40-59)
  { id: 'team-15', name: 'Reporting Tools', healthScore: 58, trend: 'improving', trendChange: 9, lastAssessment: '2025-01-04', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
  { id: 'team-16', name: 'Customer Support', healthScore: 55, trend: 'stable', trendChange: 2, lastAssessment: '2025-01-05', workType: 'BAU / Support', portfolio: 'Consumer Products' },
  { id: 'team-17', name: 'DevOps', healthScore: 52, trend: 'declining', trendChange: -8, lastAssessment: '2025-01-06', workType: 'Platform', portfolio: 'Platform Infrastructure' },
  { id: 'team-18', name: 'QA Automation', healthScore: 48, trend: 'stable', trendChange: 1, lastAssessment: '2025-01-02', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
  { id: 'team-19', name: 'Documentation', healthScore: 45, trend: 'improving', trendChange: 5, lastAssessment: '2025-01-03', workType: 'BAU / Support', portfolio: 'Consumer Products' },
  { id: 'team-20', name: 'Legacy Systems', healthScore: 42, trend: 'stable', trendChange: 0, lastAssessment: '2025-01-04', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
  // Needs Work (20-39)
  { id: 'team-21', name: 'Beta Features', healthScore: 38, trend: 'declining', trendChange: -23, lastAssessment: '2025-01-05', workType: 'Product Development', portfolio: 'Consumer Products' },
  { id: 'team-22', name: 'Internal Tools', healthScore: 32, trend: 'stable', trendChange: -2, lastAssessment: '2024-12-15', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
  { id: 'team-23', name: 'Compliance', healthScore: 28, trend: 'declining', trendChange: -12, lastAssessment: '2024-12-20', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
  // Critical (0-19)
  { id: 'team-24', name: 'Decommissioned APIs', healthScore: 15, trend: 'declining', trendChange: -18, lastAssessment: '2024-12-01', workType: 'BAU / Support', portfolio: 'Platform Infrastructure' },
];

// ============================================
// Mock Smart Alerts Data
// ============================================
export interface SmartAlert {
  id: string;
  type: 'team_decline' | 'access_request' | 'stale_team' | 'at_risk' | 'setup_incomplete';
  severity: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  teamId?: string;
  teamName?: string;
  actionLabel: string;
  actionTarget: string;
  timestamp: string;
}

export const MOCK_SMART_ALERTS: SmartAlert[] = [
  {
    id: 'alert-1',
    type: 'team_decline',
    severity: 'urgent',
    title: 'Beta Features team health dropped 23%',
    description: 'Sprint Hygiene and Blocker Management declining significantly',
    teamId: 'team-21',
    teamName: 'Beta Features',
    actionLabel: 'View Team Details',
    actionTarget: 'team-21',
    timestamp: '2025-01-06T10:00:00Z',
  },
  {
    id: 'alert-2',
    type: 'access_request',
    severity: 'warning',
    title: '2 access requests awaiting review',
    description: 'Mike Johnson and Emily Davis requested Creator role',
    actionLabel: 'Review Requests',
    actionTarget: 'users',
    timestamp: '2025-01-06T09:15:00Z',
  },
  {
    id: 'alert-3',
    type: 'stale_team',
    severity: 'warning',
    title: '3 teams haven\'t run assessments in 30+ days',
    description: 'Internal Tools, Compliance, and Decommissioned APIs teams',
    actionLabel: 'View Stale Teams',
    actionTarget: 'stale-teams',
    timestamp: '2025-01-06T08:00:00Z',
  },
  {
    id: 'alert-4',
    type: 'at_risk',
    severity: 'warning',
    title: 'Compliance team at risk',
    description: 'Low health (28) combined with declining trend (-12%)',
    teamId: 'team-23',
    teamName: 'Compliance',
    actionLabel: 'View Team',
    actionTarget: 'team-23',
    timestamp: '2025-01-05T14:00:00Z',
  },
];

// ============================================
// Mock Weekly Highlights
// ============================================
export interface WeeklyHighlight {
  id: string;
  type: 'improvement' | 'decline' | 'milestone' | 'trend';
  icon: 'up' | 'down' | 'star' | 'chart';
  text: string;
  teamName?: string;
}

export const MOCK_WEEKLY_HIGHLIGHTS: WeeklyHighlight[] = [
  {
    id: 'highlight-1',
    type: 'improvement',
    icon: 'up',
    text: 'Mobile Experience improved from "Healthy" to "Thriving" (+12 pts)',
    teamName: 'Mobile Experience',
  },
  {
    id: 'highlight-2',
    type: 'decline',
    icon: 'down',
    text: 'Beta Features team declined significantly: Sprint Hygiene down 23%',
    teamName: 'Beta Features',
  },
  {
    id: 'highlight-3',
    type: 'milestone',
    icon: 'star',
    text: '12 assessments completed this week - highest since November',
  },
  {
    id: 'highlight-4',
    type: 'trend',
    icon: 'chart',
    text: 'Data Quality theme showing org-wide improvement trend (+8% avg)',
  },
];

// ============================================
// Mock Analytics
// ============================================
export const MOCK_ANALYTICS: AdminAnalytics = {
  usageMetrics: {
    totalUsers: 45,
    activeUsers: 32, // Active in last 30 days
    weeklyActiveUsers: 24, // Active in last 7 days
    dailyActiveUsers: 8, // Active today
    newUsersThisMonth: 5,
    totalAssessments: 156,
    completedAssessments: 142,
    assessmentsThisWeek: 12,
    assessmentsThisMonth: 38,
    avgAssessmentsPerWeek: 9.5,
    reportsViewed: 892,
    totalSessions: 1247,
    avgSessionDuration: 12.4, // minutes
  },
  activityOverTime: [
    { date: '2024-12-09', assessmentsCreated: 6, activeUsers: 18, sessionsCount: 42, reportsViewed: 35 },
    { date: '2024-12-10', assessmentsCreated: 8, activeUsers: 22, sessionsCount: 56, reportsViewed: 48 },
    { date: '2024-12-11', assessmentsCreated: 5, activeUsers: 19, sessionsCount: 38, reportsViewed: 32 },
    { date: '2024-12-12', assessmentsCreated: 9, activeUsers: 24, sessionsCount: 62, reportsViewed: 55 },
    { date: '2024-12-13', assessmentsCreated: 4, activeUsers: 15, sessionsCount: 28, reportsViewed: 22 },
    { date: '2024-12-14', assessmentsCreated: 2, activeUsers: 8, sessionsCount: 14, reportsViewed: 12 },
    { date: '2024-12-15', assessmentsCreated: 3, activeUsers: 10, sessionsCount: 18, reportsViewed: 15 },
    { date: '2024-12-16', assessmentsCreated: 7, activeUsers: 21, sessionsCount: 48, reportsViewed: 42 },
    { date: '2024-12-17', assessmentsCreated: 10, activeUsers: 26, sessionsCount: 68, reportsViewed: 58 },
    { date: '2024-12-18', assessmentsCreated: 6, activeUsers: 20, sessionsCount: 44, reportsViewed: 38 },
    { date: '2024-12-19', assessmentsCreated: 8, activeUsers: 23, sessionsCount: 52, reportsViewed: 45 },
    { date: '2024-12-20', assessmentsCreated: 5, activeUsers: 16, sessionsCount: 32, reportsViewed: 28 },
    { date: '2024-12-21', assessmentsCreated: 2, activeUsers: 7, sessionsCount: 12, reportsViewed: 10 },
    { date: '2024-12-22', assessmentsCreated: 3, activeUsers: 9, sessionsCount: 16, reportsViewed: 14 },
  ],
  weeklyTrends: [
    { metric: 'Active Users', currentValue: 24, previousValue: 21, changePercent: 14.3, trend: 'up' },
    { metric: 'Assessments Created', currentValue: 38, previousValue: 32, changePercent: 18.8, trend: 'up' },
    { metric: 'Avg Session Time', currentValue: 12.4, previousValue: 11.8, changePercent: 5.1, trend: 'up' },
    { metric: 'Reports Viewed', currentValue: 245, previousValue: 268, changePercent: -8.6, trend: 'down' },
  ],
  featureUsage: [
    { feature: 'Run Assessment', usageCount: 156, uniqueUsers: 28, percentOfUsers: 62 },
    { feature: 'View Results', usageCount: 892, uniqueUsers: 38, percentOfUsers: 84 },
    { feature: 'Export to PDF', usageCount: 124, uniqueUsers: 22, percentOfUsers: 49 },
    { feature: 'Share Assessment', usageCount: 89, uniqueUsers: 18, percentOfUsers: 40 },
    { feature: 'Action Plan', usageCount: 67, uniqueUsers: 15, percentOfUsers: 33 },
    { feature: 'Comparison View', usageCount: 45, uniqueUsers: 12, percentOfUsers: 27 },
  ],
  topUsers: [
    { userId: 'user-2', userName: 'Sarah Chen', assessmentsCreated: 28, lastActive: '2025-01-06T16:45:00Z' },
    { userId: 'user-3', userName: 'Tom Anderson', assessmentsCreated: 24, lastActive: '2025-01-06T10:15:00Z' },
    { userId: 'user-1', userName: 'Rachel Garcia', assessmentsCreated: 18, lastActive: '2025-01-06T14:30:00Z' },
    { userId: 'user-7', userName: 'Alex Kim', assessmentsCreated: 15, lastActive: '2025-01-05T11:20:00Z' },
    { userId: 'user-8', userName: 'Lisa Wong', assessmentsCreated: 12, lastActive: '2025-01-04T15:45:00Z' },
  ],
  indicatorImpact: {
    totalIndicatorsTracked: 847, // Total indicator measurements across all teams
    indicatorsImproved: 312, // Indicators where VALUE improved
    indicatorsDeclined: 128,
    indicatorsStable: 407,
    improvementRate: 36.8, // 312/847 = 36.8%
    topImprovingIndicators: [
      { indicatorName: 'Story Point Estimation', teamsImproved: 18, avgValueChange: 12.4 },
      { indicatorName: 'Acceptance Criteria', teamsImproved: 16, avgValueChange: 15.2 },
      { indicatorName: 'Sprint Goal Achievement', teamsImproved: 14, avgValueChange: 8.7 },
      { indicatorName: 'Work Item Linking', teamsImproved: 13, avgValueChange: 22.1 },
      { indicatorName: 'Due Date Compliance', teamsImproved: 11, avgValueChange: 9.3 },
    ],
    teamsWithMostImprovements: [
      { teamName: 'Payments Core', indicatorsImproved: 24, totalIndicators: 32 },
      { teamName: 'Mobile Experience', indicatorsImproved: 21, totalIndicators: 32 },
      { teamName: 'Search Team', indicatorsImproved: 19, totalIndicators: 32 },
      { teamName: 'API Gateway', indicatorsImproved: 18, totalIndicators: 32 },
      { teamName: 'Identity Services', indicatorsImproved: 17, totalIndicators: 32 },
    ],
  },
  healthSummary: {
    totalTeamsAssessed: 24,
    improvingTeams: 8,
    decliningTeams: 4,
    stableTeams: 12,
  },
  lastUpdated: '2025-01-06T12:00:00Z',
};

// ============================================
// Org Structure Settings
// ============================================
export const MOCK_ORG_STRUCTURE_SETTINGS: OrgStructureSettings = {
  useHierarchy: true, // By default, use hierarchy
  structureTemplate: 'standard', // Standard 2-level hierarchy
  customLevels: [
    {
      id: 'level-portfolio',
      name: 'Portfolio',
      pluralName: 'Portfolios',
      color: '#6554C0', // Purple
      isMandatory: false,
      order: 0,
    },
    {
      id: 'level-tot',
      name: 'Team of Teams',
      pluralName: 'Teams of Teams',
      color: '#0065FF', // Blue
      isMandatory: false,
      order: 1,
    },
  ],
  // DEPRECATED: Use customLevels[n].isMandatory instead
  teamOfTeamsMandatory: false,
  portfolioMandatory: false,
};

// ============================================
// Mock Access Requests
// ============================================
export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-1',
    requesterId: 'user-4',
    requesterName: 'Mike Johnson',
    requesterEmail: 'mike.johnson@company.com',
    currentRole: 'viewer',
    requestedRole: 'creator',
    reason: 'I need to create assessments for my team as part of our quarterly health checks.',
    requestedAt: '2025-01-05T14:30:00Z',
    status: 'pending',
  },
  {
    id: 'req-2',
    requesterId: 'user-5',
    requesterName: 'Emily Davis',
    requesterEmail: 'emily.davis@company.com',
    currentRole: 'viewer',
    requestedRole: 'creator',
    reason: 'Taking over team lead responsibilities and need to run assessments.',
    requestedAt: '2025-01-06T09:15:00Z',
    status: 'pending',
  },
];

// ============================================
// Mock Admin Overview Stats (Value-Centric Dashboard)
// ============================================

export const MOCK_OUTCOME_ORG_STATS: OutcomeOrgStats[] = [
  {
    outcomeId: 'commitments',
    outcomeName: 'Commitments',
    avgScore: 72,
    confidenceLevel: 'high',
    teamsAtLow: 3,
    teamsAtModerate: 8,
    teamsAtHigh: 10,
    teamsAtVeryHigh: 3,
    criticalGaps: [
      { dimensionKey: 'estimation-coverage', dimensionName: 'Estimation Coverage', teamCount: 12 },
      { dimensionKey: 'backlog-readiness', dimensionName: 'Backlog Readiness', teamCount: 8 },
    ],
    trend: 'improving',
    trendChange: 5,
  },
  {
    outcomeId: 'productivity',
    outcomeName: 'Productivity',
    avgScore: 58,
    confidenceLevel: 'moderate',
    teamsAtLow: 6,
    teamsAtModerate: 11,
    teamsAtHigh: 6,
    teamsAtVeryHigh: 1,
    criticalGaps: [
      { dimensionKey: 'velocity-stability', dimensionName: 'Velocity Stability', teamCount: 14 },
      { dimensionKey: 'estimation-accuracy', dimensionName: 'Estimation Accuracy', teamCount: 11 },
    ],
    trend: 'stable',
    trendChange: 1,
  },
  {
    outcomeId: 'awareness',
    outcomeName: 'Awareness',
    avgScore: 81,
    confidenceLevel: 'high',
    teamsAtLow: 1,
    teamsAtModerate: 5,
    teamsAtHigh: 12,
    teamsAtVeryHigh: 6,
    criticalGaps: [
      { dimensionKey: 'blocker-visibility', dimensionName: 'Blocker Visibility', teamCount: 5 },
    ],
    trend: 'improving',
    trendChange: 8,
  },
  {
    outcomeId: 'progress',
    outcomeName: 'Progress',
    avgScore: 65,
    confidenceLevel: 'moderate',
    teamsAtLow: 4,
    teamsAtModerate: 10,
    teamsAtHigh: 8,
    teamsAtVeryHigh: 2,
    criticalGaps: [
      { dimensionKey: 'workflow-compliance', dimensionName: 'Workflow Compliance', teamCount: 10 },
      { dimensionKey: 'status-freshness', dimensionName: 'Status Freshness', teamCount: 9 },
    ],
    trend: 'declining',
    trendChange: -3,
  },
  {
    outcomeId: 'collaboration',
    outcomeName: 'Collaboration',
    avgScore: 69,
    confidenceLevel: 'moderate',
    teamsAtLow: 3,
    teamsAtModerate: 9,
    teamsAtHigh: 9,
    teamsAtVeryHigh: 3,
    criticalGaps: [
      { dimensionKey: 'cross-team-linking', dimensionName: 'Cross-Team Linking', teamCount: 7 },
    ],
    trend: 'improving',
    trendChange: 4,
  },
];

export const MOCK_IMPROVEMENT_JOURNEY_STATS: ImprovementJourneyStats = {
  plansCreated: 18,
  plansActive: 12,
  plansCompleted: 4,
  playsInFlight: 23,
  tasksCompleted: 67,
  tasksTotal: 124,
  stalledPlanCount: 3,
  teamsWithPlans: 12,
  teamsWithoutPlans: 12,
};

export const MOCK_DIMENSION_GAP_STATS: DimensionGapStats[] = [
  {
    dimensionKey: 'estimation-coverage',
    dimensionName: 'Estimation Coverage',
    teamsAtRisk: 5,
    teamsNeedsAttention: 7,
    avgMaturityLevel: 2.1,
    impactedOutcomes: ['Commitments', 'Productivity'],
  },
  {
    dimensionKey: 'velocity-stability',
    dimensionName: 'Velocity Stability',
    teamsAtRisk: 6,
    teamsNeedsAttention: 8,
    avgMaturityLevel: 1.9,
    impactedOutcomes: ['Productivity'],
  },
  {
    dimensionKey: 'workflow-compliance',
    dimensionName: 'Workflow Compliance',
    teamsAtRisk: 4,
    teamsNeedsAttention: 6,
    avgMaturityLevel: 2.3,
    impactedOutcomes: ['Progress', 'Awareness'],
  },
  {
    dimensionKey: 'status-freshness',
    dimensionName: 'Status Freshness',
    teamsAtRisk: 3,
    teamsNeedsAttention: 6,
    avgMaturityLevel: 2.4,
    impactedOutcomes: ['Progress', 'Awareness'],
  },
  {
    dimensionKey: 'backlog-readiness',
    dimensionName: 'Backlog Readiness',
    teamsAtRisk: 2,
    teamsNeedsAttention: 6,
    avgMaturityLevel: 2.6,
    impactedOutcomes: ['Commitments'],
  },
  {
    dimensionKey: 'cross-team-linking',
    dimensionName: 'Cross-Team Linking',
    teamsAtRisk: 2,
    teamsNeedsAttention: 5,
    avgMaturityLevel: 2.5,
    impactedOutcomes: ['Collaboration'],
  },
];

export const MOCK_OUTCOME_TREND_POINTS: OutcomeTrendPoint[] = [
  {
    period: 'Aug',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 61 },
      { outcomeId: 'productivity', avgScore: 52 },
      { outcomeId: 'awareness', avgScore: 68 },
      { outcomeId: 'progress', avgScore: 70 },
      { outcomeId: 'collaboration', avgScore: 58 },
    ],
  },
  {
    period: 'Sep',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 63 },
      { outcomeId: 'productivity', avgScore: 54 },
      { outcomeId: 'awareness', avgScore: 71 },
      { outcomeId: 'progress', avgScore: 69 },
      { outcomeId: 'collaboration', avgScore: 61 },
    ],
  },
  {
    period: 'Oct',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 66 },
      { outcomeId: 'productivity', avgScore: 55 },
      { outcomeId: 'awareness', avgScore: 74 },
      { outcomeId: 'progress', avgScore: 68 },
      { outcomeId: 'collaboration', avgScore: 64 },
    ],
  },
  {
    period: 'Nov',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 68 },
      { outcomeId: 'productivity', avgScore: 56 },
      { outcomeId: 'awareness', avgScore: 77 },
      { outcomeId: 'progress', avgScore: 67 },
      { outcomeId: 'collaboration', avgScore: 66 },
    ],
  },
  {
    period: 'Dec',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 70 },
      { outcomeId: 'productivity', avgScore: 57 },
      { outcomeId: 'awareness', avgScore: 79 },
      { outcomeId: 'progress', avgScore: 66 },
      { outcomeId: 'collaboration', avgScore: 68 },
    ],
  },
  {
    period: 'Jan',
    outcomes: [
      { outcomeId: 'commitments', avgScore: 72 },
      { outcomeId: 'productivity', avgScore: 58 },
      { outcomeId: 'awareness', avgScore: 81 },
      { outcomeId: 'progress', avgScore: 65 },
      { outcomeId: 'collaboration', avgScore: 69 },
    ],
  },
];

export const MOCK_ADOPTION_FUNNEL_STATS: AdoptionFunnelStats = {
  totalTeams: 31,
  teamsEverAssessed: 24,
  teamsFreshlyAssessed: 18,
  teamsWithPlans: 12,
  teamsWithActiveProgress: 8,
};

export const MOCK_ACTIONABLE_ALERTS: ActionableAlert[] = [
  {
    id: 'alert-critical-1',
    type: 'critical_gap',
    priority: 'high',
    title: '12 teams capped by Estimation Coverage',
    description: 'Planning confidence cannot exceed "Moderate" until Estimation Coverage improves across these teams.',
    dimensionKey: 'estimation-coverage',
    outcomeId: 'commitments',
    actionLabel: 'View Teams',
    actionTarget: 'dimension-teams',
    metadata: { teamCount: 12, dimension: 'Estimation Coverage' },
  },
  {
    id: 'alert-stalled-1',
    type: 'stalled_plan',
    priority: 'high',
    title: '3 improvement plans stalled (14+ days)',
    description: 'Mobile Experience, Data Platform, and Checkout Flow teams haven\'t logged progress recently.',
    actionLabel: 'Review Plans',
    actionTarget: 'stalled-plans',
    metadata: { stalledDays: 14 },
  },
  {
    id: 'alert-declining-1',
    type: 'declining_team',
    priority: 'medium',
    title: 'Progress confidence declining (-3 pts)',
    description: 'Workflow Compliance and Status Freshness metrics are trending down across the organization.',
    outcomeId: 'progress',
    actionLabel: 'Investigate',
    actionTarget: 'outcome-details',
  },
  {
    id: 'alert-stale-1',
    type: 'stale_assessment',
    priority: 'medium',
    title: '6 teams with stale assessments (60+ days)',
    description: 'Internal Tools, Compliance, Legacy Systems, and 3 others haven\'t run assessments recently.',
    actionLabel: 'View Teams',
    actionTarget: 'stale-teams',
    metadata: { teamCount: 6, staleDays: 60 },
  },
  {
    id: 'alert-quickwin-1',
    type: 'quick_win',
    priority: 'low',
    title: '4 teams close to "High" Forecasting confidence',
    description: 'These teams need only minor improvements in Velocity Stability to unlock better forecasting.',
    outcomeId: 'productivity',
    actionLabel: 'View Quick Wins',
    actionTarget: 'quick-wins',
    metadata: { teamCount: 4, pointsNeeded: 5 },
  },
];

export const MOCK_ADMIN_OVERVIEW_STATS: AdminOverviewStats = {
  outcomeStats: MOCK_OUTCOME_ORG_STATS,
  improvementJourney: MOCK_IMPROVEMENT_JOURNEY_STATS,
  dimensionGaps: MOCK_DIMENSION_GAP_STATS,
  outcomeTrends: MOCK_OUTCOME_TREND_POINTS,
  adoptionFunnel: MOCK_ADOPTION_FUNNEL_STATS,
  actionableAlerts: MOCK_ACTIONABLE_ALERTS,
};

// ============================================
// Initial Admin State
// ============================================
// Mock Group Access Rules (Jira Group → App Role mappings)
export const MOCK_GROUP_ACCESS_RULES: GroupAccessRule[] = [
  {
    id: 'rule-1',
    jiraGroupName: 'jira-administrators',
    jiraGroupId: 'jira-admins',
    appRole: 'admin',
    createdAt: '2024-12-01T10:00:00Z',
    createdBy: 'Sarah Admin',
    memberCount: 5,
    isActive: true,
  },
  {
    id: 'rule-2',
    jiraGroupName: 'project-administrators',
    jiraGroupId: 'project-admins',
    appRole: 'creator',
    createdAt: '2024-12-05T14:30:00Z',
    createdBy: 'Sarah Admin',
    memberCount: 12,
    isActive: true,
  },
];

// ============================================
// Mock User Group Access Rules
// ============================================
export const MOCK_USER_GROUP_ACCESS_RULES: UserGroupAccessRule[] = [
  {
    id: 'ug-rule-1',
    userGroupId: 'group-1',
    userGroupName: 'Leadership',
    appRole: 'creator',
    createdAt: '2024-12-10T10:00:00Z',
    createdBy: 'Rachel Garcia',
    memberCount: 2,
    isActive: true,
  },
];

export const INITIAL_ADMIN_STATE: AdminState = {
  currentSection: 'overview',
  organizationDefaults: MOCK_ORG_DEFAULTS,
  users: MOCK_MANAGED_USERS,
  userGroups: MOCK_USER_GROUPS,
  accessRequests: MOCK_ACCESS_REQUESTS,
  groupAccessRules: MOCK_GROUP_ACCESS_RULES,
  userGroupAccessRules: MOCK_USER_GROUP_ACCESS_RULES,
  organizationStructure: MOCK_ORG_STRUCTURE,
  teamAttributes: MOCK_TEAM_ATTRIBUTES,
  orgStructureSettings: MOCK_ORG_STRUCTURE_SETTINGS,
  analytics: MOCK_ANALYTICS,
  setupProgress: INITIAL_ADMIN_SETUP_PROGRESS,
  reports: INITIAL_REPORTS_STATE,
};
