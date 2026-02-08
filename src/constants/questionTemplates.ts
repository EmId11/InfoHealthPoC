// ============================================
// Question Templates
// Pre-defined questions organized by user intent
// ============================================

import {
  TemplateQuestion,
  QuestionCategory,
  DEFAULT_QUICK_FILTERS,
} from '../types/questionBuilder';
import { createEmptyConditionGroup } from '../types/reports';

// ============================================
// Team Health Questions
// ============================================

const TEAM_HEALTH_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'th-001',
    question: 'Which teams are at risk of missing commitments?',
    description: 'Teams with high-risk dimensions or declining health scores',
    category: 'team-health',
    keywords: ['teams', 'risk', 'missing', 'commitments', 'high-risk', 'at risk', 'struggling'],
    underlyingQuery: {
      entityType: 'teams',
      groups: [{
        id: 'g1',
        logicalOperator: 'OR',
        conditions: [
          { id: 'c1', fieldId: 'highRiskDimensionCount', operator: 'greaterThan', value: 0 },
          { id: 'c2', fieldId: 'worstDimensionRisk', operator: 'equals', value: 'high' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'highRiskDimensionCount', 'worstDimensionRisk', 'avgHealthScore'],
      sortBy: { field: 'highRiskDimensionCount', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'th-002',
    question: 'Which teams have declining health scores?',
    description: 'Teams with dimensions trending downward over time',
    category: 'team-health',
    keywords: ['teams', 'declining', 'health', 'scores', 'getting worse', 'decreasing', 'down'],
    underlyingQuery: {
      entityType: 'teams',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'decliningDimensionCount', operator: 'greaterThan', value: 0 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'decliningDimensionCount', 'avgHealthScore', 'worstDimensionRisk'],
      sortBy: { field: 'decliningDimensionCount', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'th-003',
    question: 'Which teams are improving the fastest?',
    description: 'Teams with the most dimensions showing improvement',
    category: 'team-health',
    keywords: ['teams', 'improving', 'fastest', 'best', 'getting better', 'growth', 'improvement'],
    underlyingQuery: {
      entityType: 'dimensions',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'trend', operator: 'equals', value: 'improving' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'dimensionName', 'healthScore', 'trend'],
      sortBy: { field: 'healthScore', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'th-004',
    question: 'Which teams have stale assessments?',
    description: 'Teams whose assessments haven\'t been updated recently',
    category: 'team-health',
    keywords: ['teams', 'stale', 'assessments', 'outdated', 'old', 'not updated', 'refresh'],
    underlyingQuery: {
      entityType: 'assessments',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'createdAt', operator: 'before', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'assessmentName', 'createdAt', 'createdByUserName'],
      sortBy: { field: 'createdAt', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'th-005',
    question: 'Which dimensions are most commonly high risk?',
    description: 'Dimension types that frequently appear as high risk across teams',
    category: 'team-health',
    keywords: ['dimensions', 'high risk', 'common', 'frequent', 'worst', 'problematic'],
    underlyingQuery: {
      entityType: 'dimensions',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'riskLevel', operator: 'equals', value: 'high' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['dimensionName', 'teamName', 'riskLevel', 'healthScore'],
      sortBy: { field: 'healthScore', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'th-006',
    question: 'Which teams have the best overall health?',
    description: 'Top performing teams by health score',
    category: 'team-health',
    keywords: ['teams', 'best', 'health', 'top', 'performing', 'healthy', 'strong'],
    underlyingQuery: {
      entityType: 'teams',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'avgHealthScore', operator: 'greaterThan', value: 70 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'avgHealthScore', 'highRiskDimensionCount', 'portfolio'],
      sortBy: { field: 'avgHealthScore', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
];

// ============================================
// Outcome Confidence Questions
// ============================================

const OUTCOMES_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'oc-001',
    question: 'Which teams have low planning confidence?',
    description: 'Teams struggling with planning outcome confidence',
    category: 'outcomes',
    keywords: ['teams', 'low', 'planning', 'confidence', 'plan', 'planning ability'],
    underlyingQuery: {
      entityType: 'outcomeConfidence',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'outcomeArea', operator: 'equals', value: 'commitments' },
          { id: 'c2', fieldId: 'confidenceLevel', operator: 'equals', value: 'low' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'outcomeArea', 'confidenceLevel', 'score'],
      sortBy: { field: 'score', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'oc-002',
    question: 'Which teams have critical confidence gaps?',
    description: 'Teams with critical gaps in any outcome area',
    category: 'outcomes',
    keywords: ['teams', 'critical', 'gaps', 'confidence', 'severe', 'urgent'],
    underlyingQuery: {
      entityType: 'outcomeConfidence',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'hasCriticalGap', operator: 'isTrue', value: true },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'outcomeArea', 'confidenceLevel', 'hasCriticalGap'],
      sortBy: { field: 'score', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'oc-003',
    question: 'Which outcomes need the most improvement?',
    description: 'Outcome areas with the lowest average confidence scores',
    category: 'outcomes',
    keywords: ['outcomes', 'improvement', 'lowest', 'need work', 'worst', 'weakest'],
    underlyingQuery: {
      entityType: 'outcomeConfidence',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'confidenceLevel', operator: 'in', value: ['low', 'moderate'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['outcomeArea', 'teamName', 'confidenceLevel', 'score'],
      sortBy: { field: 'score', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'oc-004',
    question: 'Which teams have high forecasting confidence?',
    description: 'Teams confident in their ability to forecast delivery',
    category: 'outcomes',
    keywords: ['teams', 'high', 'forecasting', 'confidence', 'predict', 'estimation'],
    underlyingQuery: {
      entityType: 'outcomeConfidence',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'outcomeArea', operator: 'equals', value: 'productivity' },
          { id: 'c2', fieldId: 'confidenceLevel', operator: 'in', value: ['high', 'very-high'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'outcomeArea', 'confidenceLevel', 'score'],
      sortBy: { field: 'score', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'oc-005',
    question: 'Which teams struggle with progress visibility?',
    description: 'Teams with low confidence in progress tracking',
    category: 'outcomes',
    keywords: ['teams', 'progress', 'visibility', 'tracking', 'awareness', 'struggle'],
    underlyingQuery: {
      entityType: 'outcomeConfidence',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'outcomeArea', operator: 'equals', value: 'progress' },
          { id: 'c2', fieldId: 'confidenceLevel', operator: 'equals', value: 'low' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'outcomeArea', 'confidenceLevel', 'score'],
      sortBy: { field: 'score', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
];

// ============================================
// Data Quality Questions
// ============================================

const DATA_QUALITY_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'dq-001',
    question: 'Which issues are missing estimates?',
    description: 'Issues without story points or time estimates',
    category: 'data-quality',
    keywords: ['issues', 'missing', 'estimates', 'story points', 'no estimate', 'unestimated'],
    underlyingQuery: {
      entityType: 'issues',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'hasEstimate', operator: 'isFalse', value: false },
          { id: 'c2', fieldId: 'status', operator: 'notIn', value: ['Done'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['issueKey', 'summary', 'issueType', 'teamName', 'status'],
      sortBy: { field: 'created', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'dq-002',
    question: 'Which issues haven\'t been updated recently?',
    description: 'Issues that are stale and may need attention',
    category: 'data-quality',
    keywords: ['issues', 'updated', 'stale', 'inactive', 'old', 'not touched', 'abandoned'],
    underlyingQuery: {
      entityType: 'issues',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'daysStale', operator: 'greaterThan', value: 7 },
          { id: 'c2', fieldId: 'status', operator: 'notIn', value: ['Done'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['issueKey', 'summary', 'status', 'daysStale', 'teamName'],
      sortBy: { field: 'daysStale', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'dq-003',
    question: 'Which teams have the most data hygiene issues?',
    description: 'Teams with highest count of issues missing key fields',
    category: 'data-quality',
    keywords: ['teams', 'data', 'hygiene', 'issues', 'quality', 'missing fields', 'incomplete'],
    underlyingQuery: {
      entityType: 'teamMetrics',
      groups: [createEmptyConditionGroup()],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'unestimatedDonePercent', 'staleWorkPercent', 'backlogSize'],
      sortBy: { field: 'unestimatedDonePercent', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'dq-004',
    question: 'Which issues are missing acceptance criteria?',
    description: 'Stories and tasks without defined acceptance criteria',
    category: 'data-quality',
    keywords: ['issues', 'missing', 'acceptance criteria', 'AC', 'definition', 'requirements'],
    underlyingQuery: {
      entityType: 'issues',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'hasAcceptanceCriteria', operator: 'isFalse', value: false },
          { id: 'c2', fieldId: 'issueType', operator: 'in', value: ['Story', 'Task'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['issueKey', 'summary', 'issueType', 'teamName', 'status'],
      sortBy: { field: 'created', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'dq-005',
    question: 'Which issues are blocked by external teams?',
    description: 'Issues waiting on dependencies from other teams',
    category: 'data-quality',
    keywords: ['issues', 'blocked', 'external', 'teams', 'dependencies', 'waiting', 'blockers'],
    underlyingQuery: {
      entityType: 'issues',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'blockedByExternalTeam', operator: 'isTrue', value: true },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['issueKey', 'summary', 'teamName', 'status', 'daysInStatus'],
      sortBy: { field: 'daysInStatus', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'dq-006',
    question: 'Which sprints don\'t have goals defined?',
    description: 'Sprints without a sprint goal',
    category: 'data-quality',
    keywords: ['sprints', 'goals', 'missing', 'no goal', 'undefined', 'sprint goal'],
    underlyingQuery: {
      entityType: 'sprints',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'hasGoal', operator: 'isFalse', value: false },
          { id: 'c2', fieldId: 'state', operator: 'in', value: ['active', 'future'] },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['sprintName', 'teamName', 'state', 'startDate'],
      sortBy: { field: 'startDate', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
];

// ============================================
// Trend Questions
// ============================================

const TRENDS_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'tr-001',
    question: 'How is velocity trending across teams?',
    description: 'Team velocity scores and variability',
    category: 'trends',
    keywords: ['velocity', 'trending', 'teams', 'speed', 'throughput', 'performance'],
    underlyingQuery: {
      entityType: 'teamMetrics',
      groups: [createEmptyConditionGroup()],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'velocityScore', 'avgVelocity', 'throughputVariability'],
      sortBy: { field: 'velocityScore', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'tr-002',
    question: 'Which indicators are getting worse?',
    description: 'Indicators showing declining trends',
    category: 'trends',
    keywords: ['indicators', 'worse', 'declining', 'degrading', 'decreasing', 'down'],
    underlyingQuery: {
      entityType: 'indicators',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'trend', operator: 'equals', value: 'declining' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['indicatorName', 'dimensionName', 'benchmarkPercentile', 'trend'],
      sortBy: { field: 'benchmarkPercentile', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'tr-003',
    question: 'Which teams have increasing carryover?',
    description: 'Teams with growing sprint carryover percentages',
    category: 'trends',
    keywords: ['teams', 'carryover', 'increasing', 'spillover', 'incomplete', 'rollover'],
    underlyingQuery: {
      entityType: 'sprintMetrics',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'carryOverPercent', operator: 'greaterThan', value: 20 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'sprintName', 'carryOverPercent', 'carryOverCount'],
      sortBy: { field: 'carryOverPercent', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'tr-004',
    question: 'Which teams have the best cycle times?',
    description: 'Teams with fastest issue completion times',
    category: 'trends',
    keywords: ['teams', 'cycle time', 'fast', 'quick', 'efficient', 'lead time'],
    underlyingQuery: {
      entityType: 'teamMetrics',
      groups: [createEmptyConditionGroup()],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'avgCycleTime', 'cycleTimeP50', 'cycleTimeP90'],
      sortBy: { field: 'avgCycleTime', direction: 'asc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'tr-005',
    question: 'Which teams have growing backlogs?',
    description: 'Teams where backlog is growing faster than completion',
    category: 'trends',
    keywords: ['teams', 'backlog', 'growing', 'increasing', 'pile up', 'accumulating'],
    underlyingQuery: {
      entityType: 'teamMetrics',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'backlogGrowthRate', operator: 'greaterThan', value: 10 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['teamName', 'backlogSize', 'backlogGrowthRate', 'avgThroughput'],
      sortBy: { field: 'backlogGrowthRate', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
  {
    id: 'tr-006',
    question: 'Which sprints had the most scope change?',
    description: 'Sprints with significant mid-sprint changes',
    category: 'trends',
    keywords: ['sprints', 'scope change', 'added', 'removed', 'churn', 'mid-sprint'],
    underlyingQuery: {
      entityType: 'sprintMetrics',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'scopeChangePercent', operator: 'greaterThan', value: 15 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['sprintName', 'teamName', 'scopeChangePercent', 'addedMidSprint', 'removedMidSprint'],
      sortBy: { field: 'scopeChangePercent', direction: 'desc' },
    },
    suggestedFilters: DEFAULT_QUICK_FILTERS,
  },
];

// ============================================
// User Activity Questions
// ============================================

const USERS_QUESTIONS: TemplateQuestion[] = [
  {
    id: 'ua-001',
    question: 'Which users haven\'t logged in recently?',
    description: 'Users who may need re-engagement',
    category: 'users',
    keywords: ['users', 'logged in', 'inactive', 'dormant', 'not using', 'absent'],
    underlyingQuery: {
      entityType: 'userActivity',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'daysSinceLastVisit', operator: 'greaterThan', value: 14 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['displayName', 'email', 'role', 'daysSinceLastVisit', 'lastVisit'],
      sortBy: { field: 'daysSinceLastVisit', direction: 'desc' },
    },
    suggestedFilters: [],
  },
  {
    id: 'ua-002',
    question: 'Who are the most active users?',
    description: 'Users with highest engagement',
    category: 'users',
    keywords: ['users', 'active', 'engaged', 'power users', 'frequent', 'most'],
    underlyingQuery: {
      entityType: 'userActivity',
      groups: [createEmptyConditionGroup()],
      groupOperator: 'AND',
      selectedFields: ['displayName', 'email', 'role', 'visitCount', 'assessmentsCreated'],
      sortBy: { field: 'visitCount', direction: 'desc' },
    },
    suggestedFilters: [],
  },
  {
    id: 'ua-003',
    question: 'Which users have created the most assessments?',
    description: 'Top contributors by assessment count',
    category: 'users',
    keywords: ['users', 'created', 'assessments', 'contributors', 'most', 'top'],
    underlyingQuery: {
      entityType: 'userActivity',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'assessmentsCreated', operator: 'greaterThan', value: 0 },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['displayName', 'email', 'role', 'assessmentsCreated', 'visitCount'],
      sortBy: { field: 'assessmentsCreated', direction: 'desc' },
    },
    suggestedFilters: [],
  },
  {
    id: 'ua-004',
    question: 'Which users are viewers only?',
    description: 'Users who view but don\'t create',
    category: 'users',
    keywords: ['users', 'viewers', 'only', 'view', 'read only', 'passive'],
    underlyingQuery: {
      entityType: 'userActivity',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'role', operator: 'equals', value: 'viewer' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['displayName', 'email', 'role', 'assessmentsViewed', 'visitCount'],
      sortBy: { field: 'visitCount', direction: 'desc' },
    },
    suggestedFilters: [],
  },
  {
    id: 'ua-005',
    question: 'Who are the admin users?',
    description: 'All users with admin privileges',
    category: 'users',
    keywords: ['admin', 'users', 'administrators', 'privileges', 'access'],
    underlyingQuery: {
      entityType: 'userActivity',
      groups: [{
        id: 'g1',
        logicalOperator: 'AND',
        conditions: [
          { id: 'c1', fieldId: 'role', operator: 'equals', value: 'admin' },
        ],
      }],
      groupOperator: 'AND',
      selectedFields: ['displayName', 'email', 'role', 'lastVisit', 'visitCount'],
      sortBy: { field: 'displayName', direction: 'asc' },
    },
    suggestedFilters: [],
  },
];

// ============================================
// All Templates Combined
// ============================================

export const ALL_QUESTION_TEMPLATES: TemplateQuestion[] = [
  ...TEAM_HEALTH_QUESTIONS,
  ...OUTCOMES_QUESTIONS,
  ...DATA_QUALITY_QUESTIONS,
  ...TRENDS_QUESTIONS,
  ...USERS_QUESTIONS,
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get all questions for a specific category
 */
export function getQuestionsByCategory(category: QuestionCategory): TemplateQuestion[] {
  return ALL_QUESTION_TEMPLATES.filter(q => q.category === category);
}

/**
 * Get featured questions for each category (top 3)
 */
export function getFeaturedQuestions(): Map<QuestionCategory, TemplateQuestion[]> {
  const featured = new Map<QuestionCategory, TemplateQuestion[]>();

  const categories: QuestionCategory[] = ['team-health', 'outcomes', 'data-quality', 'trends', 'users'];

  categories.forEach(category => {
    const questions = getQuestionsByCategory(category);
    featured.set(category, questions.slice(0, 3));
  });

  return featured;
}

/**
 * Get a question template by ID
 */
export function getQuestionById(id: string): TemplateQuestion | undefined {
  return ALL_QUESTION_TEMPLATES.find(q => q.id === id);
}

/**
 * Count questions by category
 */
export function getQuestionCountByCategory(): Map<QuestionCategory, number> {
  const counts = new Map<QuestionCategory, number>();

  ALL_QUESTION_TEMPLATES.forEach(q => {
    const current = counts.get(q.category) || 0;
    counts.set(q.category, current + 1);
  });

  return counts;
}
