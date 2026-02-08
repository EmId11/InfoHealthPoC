// ============================================
// Entity Types for Querying
// ============================================

export type QueryEntityType =
  | 'teams'
  | 'assessments'
  | 'dimensions'
  | 'indicators'
  | 'users'
  | 'issues'
  | 'sprints'
  | 'teamMetrics'
  | 'sprintMetrics'
  | 'userActivity'
  | 'outcomeConfidence';

// ============================================
// Query Operator Types
// ============================================

export type StringOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn';

export type NumberOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between';

export type DateOperator =
  | 'equals'
  | 'before'
  | 'after'
  | 'between'
  | 'inLast';

export type BooleanOperator = 'isTrue' | 'isFalse';

export type EnumOperator = 'equals' | 'notEquals' | 'in' | 'notIn';

export type QueryOperator =
  | StringOperator
  | NumberOperator
  | DateOperator
  | BooleanOperator
  | EnumOperator;

// ============================================
// Aggregation Types (Advanced Mode)
// ============================================

export type QueryMode = 'simple' | 'advanced';

export type AggregateFunction = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'PERCENT_WHERE';

export type GroupByDimension = 'team' | 'sprint' | 'assignee' | 'issueType' | 'status' | 'priority';

export interface AggregateField {
  id: string;
  sourceField: string;
  function: AggregateFunction;
  alias: string;
  // For PERCENT_WHERE - the condition to count
  whereCondition?: QueryCondition;
}

export interface HavingCondition {
  id: string;
  aggregateFieldId: string;
  operator: NumberOperator;
  value: number;
}

// ============================================
// Field Definitions
// ============================================

export type FieldValueType = 'string' | 'number' | 'date' | 'boolean' | 'enum';

export interface EnumOption {
  value: string;
  label: string;
}

export type FieldCategory = 'properties' | 'health' | 'outcome' | 'metrics';

export interface QueryFieldDefinition {
  id: string;
  label: string;
  entityType: QueryEntityType;
  valueType: FieldValueType;
  operators: QueryOperator[];
  enumValues?: EnumOption[];
  category?: FieldCategory;
}

// ============================================
// Query Condition (single row)
// ============================================

export interface QueryCondition {
  id: string;
  fieldId: string;
  operator: QueryOperator;
  value: string | number | boolean | string[] | [number, number] | [string, string];
}

// ============================================
// Condition Group (supports AND/OR)
// ============================================

export type LogicalOperator = 'AND' | 'OR';

export interface QueryConditionGroup {
  id: string;
  logicalOperator: LogicalOperator;
  conditions: QueryCondition[];
}

// ============================================
// Report Query (full query definition)
// ============================================

export interface ReportQuery {
  entityType: QueryEntityType;
  groups: QueryConditionGroup[];
  groupOperator: LogicalOperator;
  // Advanced mode fields
  mode?: QueryMode;
  groupBy?: GroupByDimension[];
  aggregateFields?: AggregateField[];
  havingConditions?: HavingCondition[];
}

// ============================================
// Report Definition
// ============================================

export type ReportStatus = 'draft' | 'saved';

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  query: ReportQuery;
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
  updatedAt: string;
  status: ReportStatus;

  // Sharing
  shareToken?: string;
  sharedAt?: string;
  isPublicLink: boolean;

  // Display configuration
  visibleColumns: string[];
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

// ============================================
// Saved JQL Report (for JQL Query Page)
// ============================================

export interface SavedJQLReport {
  id: string;
  name: string;
  description?: string;
  jqlQuery: string;  // The raw JQL string
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
  updatedAt: string;
  shareToken?: string;
}

// ============================================
// Report Results (query execution output)
// ============================================

export interface ReportResultRow {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportColumnDefinition {
  id: string;
  label: string;
  type: FieldValueType;
  sortable: boolean;
  filterable: boolean;
}

export interface ReportResults {
  columns: ReportColumnDefinition[];
  rows: ReportResultRow[];
  totalCount: number;
  executedAt: string;
}

// ============================================
// Reports State (for AdminState)
// ============================================

export interface ReportsState {
  myReports: SavedReport[];
  sharedWithMe: SavedReport[];
  currentReport: SavedReport | null;
  currentResults: ReportResults | null;
  isExecuting: boolean;
}

// ============================================
// Field Definitions per Entity
// ============================================

export const TEAM_FIELDS: QueryFieldDefinition[] = [
  // ============================================
  // Team Properties
  // ============================================
  {
    id: 'teamName',
    label: 'Team Name',
    entityType: 'teams',
    valueType: 'string',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith'],
    category: 'properties',
  },
  {
    id: 'teamKey',
    label: 'Team Key',
    entityType: 'teams',
    valueType: 'string',
    operators: ['equals', 'notEquals', 'contains', 'startsWith'],
    category: 'properties',
  },
  {
    id: 'isOnboarded',
    label: 'Is Onboarded',
    entityType: 'teams',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse'],
    category: 'properties',
  },
  {
    id: 'workType',
    label: 'Work Type',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'notEquals', 'in'],
    enumValues: [
      { value: 'product', label: 'Product Development' },
      { value: 'platform', label: 'Platform' },
      { value: 'bau', label: 'BAU / Support' },
    ],
    category: 'properties',
  },
  {
    id: 'teamSize',
    label: 'Team Size',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'small', label: 'Small (1-5)' },
      { value: 'medium', label: 'Medium (6-15)' },
      { value: 'large', label: 'Large (16+)' },
    ],
    category: 'properties',
  },
  {
    id: 'process',
    label: 'Process',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'scrum', label: 'Scrum' },
      { value: 'kanban', label: 'Kanban' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
    category: 'properties',
  },
  {
    id: 'domain',
    label: 'Domain',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'payments', label: 'Payments' },
      { value: 'identity', label: 'Identity & Auth' },
      { value: 'search', label: 'Search & Discovery' },
      { value: 'checkout', label: 'Checkout' },
    ],
    category: 'properties',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'consumer', label: 'Consumer Products' },
      { value: 'platform', label: 'Platform Infrastructure' },
      { value: 'enterprise', label: 'Enterprise Solutions' },
    ],
    category: 'properties',
  },
  // ============================================
  // Health Summary (from Dimensions)
  // ============================================
  {
    id: 'highRiskDimensionCount',
    label: 'High Risk Dimensions',
    entityType: 'teams',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual'],
    category: 'health',
  },
  {
    id: 'decliningDimensionCount',
    label: 'Declining Dimensions',
    entityType: 'teams',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual'],
    category: 'health',
  },
  {
    id: 'avgHealthScore',
    label: 'Avg Health Score',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'health',
  },
  {
    id: 'worstDimensionRisk',
    label: 'Worst Dimension Risk',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
    ],
    category: 'health',
  },
  // ============================================
  // Outcome Confidence
  // ============================================
  {
    id: 'criticalGapCount',
    label: 'Critical Gaps',
    entityType: 'teams',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'greaterThanOrEqual'],
    category: 'outcome',
  },
  {
    id: 'lowestConfidenceLevel',
    label: 'Lowest Confidence',
    entityType: 'teams',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'very-high', label: 'Very High' },
    ],
    category: 'outcome',
  },
  {
    id: 'avgConfidenceScore',
    label: 'Avg Confidence Score',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'outcome',
  },
  // ============================================
  // Team Metrics
  // ============================================
  {
    id: 'avgCycleTime',
    label: 'Avg Cycle Time (days)',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'metrics',
  },
  {
    id: 'velocityScore',
    label: 'Velocity Score',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'metrics',
  },
  {
    id: 'staleWorkPercent',
    label: 'Stale Work %',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'metrics',
  },
  {
    id: 'bugRatio',
    label: 'Bug Ratio',
    entityType: 'teams',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between'],
    category: 'metrics',
  },
];

export const ASSESSMENT_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'assessmentName',
    label: 'Assessment Name',
    entityType: 'assessments',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'assessments',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'status',
    label: 'Status',
    entityType: 'assessments',
    valueType: 'enum',
    operators: ['equals'],
    enumValues: [
      { value: 'draft', label: 'Draft' },
      { value: 'completed', label: 'Completed' },
    ]
  },
  {
    id: 'createdAt',
    label: 'Created Date',
    entityType: 'assessments',
    valueType: 'date',
    operators: ['equals', 'before', 'after', 'between', 'inLast']
  },
  {
    id: 'createdByUserName',
    label: 'Created By',
    entityType: 'assessments',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
];

export const DIMENSION_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'dimensionName',
    label: 'Dimension',
    entityType: 'dimensions',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'dim1', label: 'Sprint Predictability' },
      { value: 'dim2', label: 'Quality & Technical Debt' },
      { value: 'dim3', label: 'Backlog & Requirements Maturity' },
      { value: 'dim4', label: 'Flow Efficiency' },
      { value: 'dim5', label: 'Delivery Throughput' },
      { value: 'dim6', label: 'Issue Hygiene' },
      { value: 'dim7', label: 'Dependencies & Blockers' },
      { value: 'dim8', label: 'Team Collaboration' },
      { value: 'dim9', label: 'Continuous Improvement' },
      { value: 'dim10', label: 'Stakeholder Alignment' },
      { value: 'dim11', label: 'Invisible Work' },
    ]
  },
  {
    id: 'riskLevel',
    label: 'Risk Level',
    entityType: 'dimensions',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
    ]
  },
  {
    id: 'healthScore',
    label: 'Health Score',
    entityType: 'dimensions',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'trend',
    label: 'Trend',
    entityType: 'dimensions',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'improving', label: 'Improving' },
      { value: 'stable', label: 'Stable' },
      { value: 'declining', label: 'Declining' },
    ]
  },
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'dimensions',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'assessmentName',
    label: 'Assessment',
    entityType: 'dimensions',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
];

export const INDICATOR_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'indicatorName',
    label: 'Indicator Name',
    entityType: 'indicators',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'dimensionName',
    label: 'Dimension',
    entityType: 'indicators',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'dim1', label: 'Sprint Predictability' },
      { value: 'dim2', label: 'Quality & Technical Debt' },
      { value: 'dim3', label: 'Backlog & Requirements Maturity' },
      { value: 'dim4', label: 'Flow Efficiency' },
      { value: 'dim5', label: 'Delivery Throughput' },
      { value: 'dim6', label: 'Issue Hygiene' },
      { value: 'dim7', label: 'Dependencies & Blockers' },
      { value: 'dim8', label: 'Team Collaboration' },
      { value: 'dim9', label: 'Continuous Improvement' },
      { value: 'dim10', label: 'Stakeholder Alignment' },
      { value: 'dim11', label: 'Invisible Work' },
    ]
  },
  {
    id: 'benchmarkPercentile',
    label: 'Benchmark Percentile',
    entityType: 'indicators',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'trend',
    label: 'Trend',
    entityType: 'indicators',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'improving', label: 'Improving' },
      { value: 'stable', label: 'Stable' },
      { value: 'declining', label: 'Declining' },
    ]
  },
];

export const USER_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'displayName',
    label: 'Name',
    entityType: 'users',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'email',
    label: 'Email',
    entityType: 'users',
    valueType: 'string',
    operators: ['equals', 'contains', 'endsWith']
  },
  {
    id: 'role',
    label: 'Role',
    entityType: 'users',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'admin', label: 'Admin' },
      { value: 'creator', label: 'Creator' },
      { value: 'viewer', label: 'Viewer' },
    ]
  },
  {
    id: 'status',
    label: 'Status',
    entityType: 'users',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'deactivated', label: 'Deactivated' },
    ]
  },
  {
    id: 'lastActiveAt',
    label: 'Last Active',
    entityType: 'users',
    valueType: 'date',
    operators: ['before', 'after', 'inLast']
  },
];

// ============================================
// Issue Fields (Jira Issues)
// ============================================

export const ISSUE_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'issueKey',
    label: 'Issue Key',
    entityType: 'issues',
    valueType: 'string',
    operators: ['equals', 'contains', 'startsWith']
  },
  {
    id: 'summary',
    label: 'Summary',
    entityType: 'issues',
    valueType: 'string',
    operators: ['contains']
  },
  {
    id: 'issueType',
    label: 'Issue Type',
    entityType: 'issues',
    valueType: 'enum',
    operators: ['equals', 'in', 'notIn'],
    enumValues: [
      { value: 'Story', label: 'Story' },
      { value: 'Bug', label: 'Bug' },
      { value: 'Task', label: 'Task' },
      { value: 'Sub-task', label: 'Sub-task' },
      { value: 'Epic', label: 'Epic' },
    ]
  },
  {
    id: 'status',
    label: 'Status',
    entityType: 'issues',
    valueType: 'enum',
    operators: ['equals', 'in', 'notIn'],
    enumValues: [
      { value: 'To Do', label: 'To Do' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'In Review', label: 'In Review' },
      { value: 'Done', label: 'Done' },
      { value: 'Blocked', label: 'Blocked' },
    ]
  },
  {
    id: 'priority',
    label: 'Priority',
    entityType: 'issues',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'Highest', label: 'Highest' },
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
      { value: 'Lowest', label: 'Lowest' },
    ]
  },
  {
    id: 'assignee',
    label: 'Assignee',
    entityType: 'issues',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'issues',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'sprintName',
    label: 'Sprint',
    entityType: 'issues',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'estimatePoints',
    label: 'Story Points',
    entityType: 'issues',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'hasEstimate',
    label: 'Has Estimate',
    entityType: 'issues',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'daysStale',
    label: 'Days Stale',
    entityType: 'issues',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'hasAcceptanceCriteria',
    label: 'Has Acceptance Criteria',
    entityType: 'issues',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'hasDueDate',
    label: 'Has Due Date',
    entityType: 'issues',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'hasParentEpic',
    label: 'Has Parent Epic',
    entityType: 'issues',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'created',
    label: 'Created Date',
    entityType: 'issues',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
  {
    id: 'updated',
    label: 'Updated Date',
    entityType: 'issues',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
  {
    id: 'labels',
    label: 'Labels',
    entityType: 'issues',
    valueType: 'string',
    operators: ['contains', 'equals']
  },
  {
    id: 'daysInStatus',
    label: 'Days in Status',
    entityType: 'issues',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'leadTime',
    label: 'Lead Time (days)',
    entityType: 'issues',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'blockedByExternalTeam',
    label: 'Blocked by External Team',
    entityType: 'issues',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'epicCompletionPercent',
    label: 'Epic Completion %',
    entityType: 'issues',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
];

// ============================================
// Sprint Fields
// ============================================

export const SPRINT_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'sprintName',
    label: 'Sprint Name',
    entityType: 'sprints',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'sprints',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'state',
    label: 'State',
    entityType: 'sprints',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
      { value: 'future', label: 'Future' },
    ]
  },
  {
    id: 'hasGoal',
    label: 'Has Sprint Goal',
    entityType: 'sprints',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'issueCount',
    label: 'Issue Count',
    entityType: 'sprints',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'completedCount',
    label: 'Completed Issues',
    entityType: 'sprints',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'totalPoints',
    label: 'Total Points',
    entityType: 'sprints',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'completedPoints',
    label: 'Completed Points',
    entityType: 'sprints',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'carriedOverCount',
    label: 'Carried Over',
    entityType: 'sprints',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'startDate',
    label: 'Start Date',
    entityType: 'sprints',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
  {
    id: 'endDate',
    label: 'End Date',
    entityType: 'sprints',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
];

// ============================================
// Team Metrics Fields (Pre-aggregated)
// ============================================

export const TEAM_METRICS_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'teamName',
    label: 'Team Name',
    entityType: 'teamMetrics',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'unestimatedDonePercent',
    label: 'Unestimated Done %',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'unestimatedDoneCount',
    label: 'Unestimated Done Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'totalDoneCount',
    label: 'Total Done Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'avgCycleTime',
    label: 'Avg Cycle Time (days)',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'avgLeadTime',
    label: 'Avg Lead Time (days)',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'cycleTimeP50',
    label: 'Cycle Time P50',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'cycleTimeP90',
    label: 'Cycle Time P90',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'velocityScore',
    label: 'Velocity Score',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'avgThroughput',
    label: 'Avg Throughput',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'throughputVariability',
    label: 'Throughput Variability',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'staleWorkPercent',
    label: 'Stale Work %',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'staleWorkCount',
    label: 'Stale Work Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'blockedIssueCount',
    label: 'Blocked Issues',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'backlogSize',
    label: 'Backlog Size',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'backlogGrowthRate',
    label: 'Backlog Growth Rate',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'avgVelocity',
    label: 'Average Velocity',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'inProgressCount',
    label: 'In Progress Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'bugCount',
    label: 'Bug Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'storyCount',
    label: 'Story Count',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'bugRatio',
    label: 'Bug Ratio',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'wipRatio',
    label: 'WIP Ratio',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'workloadVariance',
    label: 'Workload Variance',
    entityType: 'teamMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'hasWorkType',
    label: 'Has Work Type',
    entityType: 'teamMetrics',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'hasPortfolio',
    label: 'Has Portfolio',
    entityType: 'teamMetrics',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'hasTribe',
    label: 'Has Tribe',
    entityType: 'teamMetrics',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
  {
    id: 'hasFutureSprint',
    label: 'Has Future Sprint',
    entityType: 'teamMetrics',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
];

// ============================================
// Sprint Metrics Fields (Pre-aggregated)
// ============================================

export const SPRINT_METRICS_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'sprintName',
    label: 'Sprint Name',
    entityType: 'sprintMetrics',
    valueType: 'string',
    operators: ['equals', 'contains']
  },
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'sprintMetrics',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'completionRate',
    label: 'Completion Rate %',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'velocityPercent',
    label: 'Velocity %',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'completedPoints',
    label: 'Completed Points',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'plannedPoints',
    label: 'Planned Points',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'carryOverCount',
    label: 'Carry Over Count',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'carryOverPercent',
    label: 'Carry Over %',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'scopeChangePercent',
    label: 'Scope Change %',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'addedMidSprint',
    label: 'Added Mid-Sprint',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'removedMidSprint',
    label: 'Removed Mid-Sprint',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'equals']
  },
  {
    id: 'startDate',
    label: 'Start Date',
    entityType: 'sprintMetrics',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
  {
    id: 'endDate',
    label: 'End Date',
    entityType: 'sprintMetrics',
    valueType: 'date',
    operators: ['before', 'after', 'between', 'inLast']
  },
  {
    id: 'sprintDurationDays',
    label: 'Sprint Duration (days)',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['equals', 'notEquals', 'greaterThan', 'lessThan']
  },
  {
    id: 'avgVelocity',
    label: 'Average Velocity',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
  {
    id: 'commitmentRatio',
    label: 'Commitment Ratio',
    entityType: 'sprintMetrics',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
];

// ============================================
// Helper Functions
// ============================================

export function getFieldsForEntity(entityType: QueryEntityType): QueryFieldDefinition[] {
  switch (entityType) {
    case 'teams': return TEAM_FIELDS;
    case 'assessments': return ASSESSMENT_FIELDS;
    case 'dimensions': return DIMENSION_FIELDS;
    case 'indicators': return INDICATOR_FIELDS;
    case 'users': return USER_FIELDS;
    case 'issues': return ISSUE_FIELDS;
    case 'sprints': return SPRINT_FIELDS;
    case 'teamMetrics': return TEAM_METRICS_FIELDS;
    case 'sprintMetrics': return SPRINT_METRICS_FIELDS;
    case 'userActivity': return USER_ACTIVITY_FIELDS;
    case 'outcomeConfidence': return OUTCOME_CONFIDENCE_FIELDS;
  }
}

export function getFieldById(fieldId: string, entityType: QueryEntityType): QueryFieldDefinition | undefined {
  return getFieldsForEntity(entityType).find(f => f.id === fieldId);
}

export function getCategoryLabel(category: FieldCategory | undefined): string {
  if (!category) return 'Other';
  const labels: Record<FieldCategory, string> = {
    properties: 'Team Properties',
    health: 'Health Summary',
    outcome: 'Outcome Confidence',
    metrics: 'Team Metrics',
  };
  return labels[category] || 'Other';
}

export function groupFieldsByCategory(fields: QueryFieldDefinition[]): Map<string, QueryFieldDefinition[]> {
  const groups = new Map<string, QueryFieldDefinition[]>();

  fields.forEach(field => {
    const category = getCategoryLabel(field.category);
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(field);
  });

  return groups;
}

export function getOperatorLabel(operator: QueryOperator): string {
  const labels: Record<QueryOperator, string> = {
    equals: 'equals',
    notEquals: 'does not equal',
    contains: 'contains',
    startsWith: 'starts with',
    endsWith: 'ends with',
    in: 'is any of',
    notIn: 'is not any of',
    greaterThan: 'is greater than',
    lessThan: 'is less than',
    greaterThanOrEqual: 'is at least',
    lessThanOrEqual: 'is at most',
    between: 'is between',
    before: 'is before',
    after: 'is after',
    inLast: 'is in the last',
    isTrue: 'is true',
    isFalse: 'is false',
  };
  return labels[operator] || operator;
}

export function getEntityLabel(entityType: QueryEntityType): string {
  const labels: Record<QueryEntityType, string> = {
    teams: 'Teams',
    assessments: 'Assessments',
    dimensions: 'Dimensions',
    indicators: 'Indicators',
    users: 'Users',
    issues: 'Issues',
    sprints: 'Sprints',
    teamMetrics: 'Team Metrics',
    sprintMetrics: 'Sprint Metrics',
    userActivity: 'User Activity',
    outcomeConfidence: 'Outcome Confidence',
  };
  return labels[entityType];
}

export function createEmptyCondition(): QueryCondition {
  return {
    id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fieldId: '',
    operator: 'equals',
    value: '',
  };
}

export function createEmptyConditionGroup(): QueryConditionGroup {
  return {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    logicalOperator: 'AND',
    conditions: [createEmptyCondition()],
  };
}

export function createEmptyQuery(entityType: QueryEntityType = 'teams'): ReportQuery {
  return {
    entityType,
    groups: [createEmptyConditionGroup()],
    groupOperator: 'AND',
  };
}

export function generateShareToken(): string {
  return `rpt_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Jira Health Reports Types
// Re-exported from healthReports.ts for convenience
// ============================================

export type { JiraHealthSeverity, JiraHealthReport } from '../constants/healthReports';

// Backwards-compatible aliases
export type HealthReportSeverity = import('../constants/healthReports').JiraHealthSeverity;
export type HealthReport = import('../constants/healthReports').JiraHealthReport;

// ============================================
// Extended Query Types (Visual Query Builder)
// ============================================

export type VisualizationType = 'table' | 'bar' | 'line' | 'pie';

export interface ExtendedReportQuery extends ReportQuery {
  selectedFields: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
  drilldownFrom?: { entityType: QueryEntityType; entityId: string; entityName: string };
}

// ============================================
// Template System
// ============================================

export type TemplateCategory =
  | 'team-health'
  | 'indicator-analysis'
  | 'outcome-confidence'
  | 'user-activity'
  | 'data-quality'
  | 'trend-analysis';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  query: ExtendedReportQuery;
  suggestedVisualization: VisualizationType;
}

// ============================================
// Drilldown System
// ============================================

export interface DrilldownPath {
  from: QueryEntityType;
  to: QueryEntityType;
  relationField: string;
  description: string;
}

export interface DrilldownState {
  breadcrumbs: Array<{ entityType: QueryEntityType; entityId: string; entityName: string }>;
  currentEntity: { type: QueryEntityType; id: string; name: string } | null;
}

export const DRILLDOWN_PATHS: DrilldownPath[] = [
  { from: 'teams', to: 'dimensions', relationField: 'teamName', description: 'View team dimensions' },
  { from: 'teams', to: 'issues', relationField: 'teamName', description: 'View team issues' },
  { from: 'teams', to: 'sprints', relationField: 'teamName', description: 'View team sprints' },
  { from: 'teams', to: 'teamMetrics', relationField: 'teamName', description: 'View team metrics' },
  { from: 'dimensions', to: 'indicators', relationField: 'dimensionKey', description: 'View dimension indicators' },
  { from: 'sprints', to: 'issues', relationField: 'sprintName', description: 'View sprint issues' },
  { from: 'sprints', to: 'sprintMetrics', relationField: 'sprintName', description: 'View sprint metrics' },
  { from: 'users', to: 'userActivity', relationField: 'userId', description: 'View user activity' },
  { from: 'users', to: 'assessments', relationField: 'createdByUserId', description: 'View user assessments' },
];

export function getDrilldownPathsFrom(entityType: QueryEntityType): DrilldownPath[] {
  return DRILLDOWN_PATHS.filter(path => path.from === entityType);
}

// ============================================
// User Activity Entity
// ============================================

export type UserRole = 'admin' | 'creator' | 'viewer';

export interface UserActivityRecord {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  lastVisit: string;
  visitCount: number;
  daysSinceLastVisit: number;
  assessmentsCreated: number;
  assessmentsViewed: number;
  avgSessionMinutes: number;
}

// ============================================
// Outcome Confidence Entity
// ============================================

export type OutcomeArea = 'commitments' | 'progress' | 'productivity' | 'improvement' | 'collaboration' | 'portfolio' | 'awareness';
export type ConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';

export interface OutcomeConfidenceRecord {
  id: string;
  teamId: string;
  teamName: string;
  outcomeArea: OutcomeArea;
  confidenceLevel: ConfidenceLevel;
  score: number;
  hasCriticalGap: boolean;
  blockingDimensions: string[];
}

// ============================================
// User Activity Field Definitions
// ============================================

export const USER_ACTIVITY_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'displayName',
    label: 'Name',
    entityType: 'userActivity',
    valueType: 'string',
    operators: ['equals', 'contains', 'startsWith']
  },
  {
    id: 'email',
    label: 'Email',
    entityType: 'userActivity',
    valueType: 'string',
    operators: ['equals', 'contains', 'endsWith']
  },
  {
    id: 'role',
    label: 'Role',
    entityType: 'userActivity',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'admin', label: 'Admin' },
      { value: 'creator', label: 'Creator' },
      { value: 'viewer', label: 'Viewer' },
    ]
  },
  {
    id: 'lastVisit',
    label: 'Last Visit',
    entityType: 'userActivity',
    valueType: 'date',
    operators: ['before', 'after', 'inLast']
  },
  {
    id: 'visitCount',
    label: 'Visit Count (30 days)',
    entityType: 'userActivity',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'daysSinceLastVisit',
    label: 'Days Since Last Visit',
    entityType: 'userActivity',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'assessmentsCreated',
    label: 'Assessments Created',
    entityType: 'userActivity',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'assessmentsViewed',
    label: 'Assessments Viewed',
    entityType: 'userActivity',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'avgSessionMinutes',
    label: 'Avg Session (minutes)',
    entityType: 'userActivity',
    valueType: 'number',
    operators: ['greaterThan', 'lessThan', 'between']
  },
];

// ============================================
// Outcome Confidence Field Definitions
// ============================================

export const OUTCOME_CONFIDENCE_FIELDS: QueryFieldDefinition[] = [
  {
    id: 'teamName',
    label: 'Team',
    entityType: 'outcomeConfidence',
    valueType: 'string',
    operators: ['equals', 'contains', 'in']
  },
  {
    id: 'outcomeArea',
    label: 'Outcome Area',
    entityType: 'outcomeConfidence',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'commitments', label: 'Commitments' },
      { value: 'progress', label: 'Progress' },
      { value: 'productivity', label: 'Productivity' },
      { value: 'improvement', label: 'Improvement' },
      { value: 'collaboration', label: 'Collaboration' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'awareness', label: 'Risk Detection' },
    ]
  },
  {
    id: 'confidenceLevel',
    label: 'Confidence Level',
    entityType: 'outcomeConfidence',
    valueType: 'enum',
    operators: ['equals', 'in'],
    enumValues: [
      { value: 'low', label: 'Low' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'high', label: 'High' },
      { value: 'very-high', label: 'Very High' },
    ]
  },
  {
    id: 'score',
    label: 'Confidence Score',
    entityType: 'outcomeConfidence',
    valueType: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'between']
  },
  {
    id: 'hasCriticalGap',
    label: 'Has Critical Gap',
    entityType: 'outcomeConfidence',
    valueType: 'boolean',
    operators: ['isTrue', 'isFalse']
  },
];
