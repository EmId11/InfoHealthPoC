import { ReportTemplate, TemplateCategory, ExtendedReportQuery } from '../types/reports';

// Helper to create a template query
function createQuery(
  entityType: ExtendedReportQuery['entityType'],
  conditions: Array<{ fieldId: string; operator: string; value: any }>,
  selectedFields: string[],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limit?: number
): ExtendedReportQuery {
  return {
    entityType,
    groups: conditions.length > 0 ? [{
      id: `group-${Date.now()}`,
      logicalOperator: 'AND',
      conditions: conditions.map((c, i) => ({
        id: `cond-${i}`,
        fieldId: c.fieldId,
        operator: c.operator as any,
        value: c.value,
      })),
    }] : [{
      id: `group-${Date.now()}`,
      logicalOperator: 'AND',
      conditions: [],
    }],
    groupOperator: 'AND',
    selectedFields,
    sortBy,
    limit,
  };
}

// ============================================
// Team Health Templates
// ============================================

const teamHealthTemplates: ReportTemplate[] = [
  {
    id: 'tpl-team-at-risk',
    name: 'Teams at Risk',
    description: 'Teams with high-risk dimensions that need attention',
    category: 'team-health',
    query: createQuery(
      'dimensions',
      [{ fieldId: 'riskLevel', operator: 'equals', value: 'high' }],
      ['teamName', 'dimensionName', 'riskLevel', 'overallPercentile', 'trend'],
      { field: 'overallPercentile', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-dimension-breakdown',
    name: 'Dimension Breakdown by Team',
    description: 'All dimensions across all teams with risk levels',
    category: 'team-health',
    query: createQuery(
      'dimensions',
      [],
      ['teamName', 'dimensionName', 'riskLevel', 'overallPercentile', 'trend'],
      { field: 'teamName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-improving-teams',
    name: 'Improving Teams',
    description: 'Teams showing improvement in their health scores',
    category: 'team-health',
    query: createQuery(
      'dimensions',
      [{ fieldId: 'trend', operator: 'equals', value: 'improving' }],
      ['teamName', 'dimensionName', 'trend', 'overallPercentile', 'riskLevel'],
      { field: 'overallPercentile', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-declining-teams',
    name: 'Declining Teams',
    description: 'Teams with declining health scores that need intervention',
    category: 'team-health',
    query: createQuery(
      'dimensions',
      [{ fieldId: 'trend', operator: 'equals', value: 'declining' }],
      ['teamName', 'dimensionName', 'trend', 'overallPercentile', 'riskLevel'],
      { field: 'overallPercentile', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-stale-assessments',
    name: 'Stale Assessments',
    description: 'Assessments not updated in the last 30 days',
    category: 'team-health',
    query: createQuery(
      'assessments',
      [{ fieldId: 'createdAt', operator: 'before', value: '2024-01-01' }],
      ['assessmentName', 'teamName', 'status', 'createdAt', 'createdByUserName'],
      { field: 'createdAt', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
];

// ============================================
// Indicator Analysis Templates
// ============================================

const indicatorTemplates: ReportTemplate[] = [
  {
    id: 'tpl-worst-indicators',
    name: 'Worst Performing Indicators',
    description: 'Indicators with lowest benchmark percentiles',
    category: 'indicator-analysis',
    query: createQuery(
      'indicators',
      [{ fieldId: 'benchmarkPercentile', operator: 'lessThan', value: 30 }],
      ['teamName', 'dimensionName', 'indicatorName', 'benchmarkPercentile', 'trend'],
      { field: 'benchmarkPercentile', direction: 'asc' },
      25
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-improving-indicators',
    name: 'Improving Indicators',
    description: 'Indicators showing positive trends',
    category: 'indicator-analysis',
    query: createQuery(
      'indicators',
      [{ fieldId: 'trend', operator: 'equals', value: 'improving' }],
      ['teamName', 'dimensionName', 'indicatorName', 'benchmarkPercentile', 'trend'],
      { field: 'benchmarkPercentile', direction: 'desc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-cross-team-indicators',
    name: 'Cross-Team Indicator Comparison',
    description: 'Compare indicator performance across all teams',
    category: 'indicator-analysis',
    query: createQuery(
      'indicators',
      [],
      ['indicatorName', 'teamName', 'benchmarkPercentile', 'trend'],
      { field: 'indicatorName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
];

// ============================================
// Outcome Confidence Templates
// ============================================

const outcomeConfidenceTemplates: ReportTemplate[] = [
  {
    id: 'tpl-critical-gaps',
    name: 'Critical Confidence Gaps',
    description: 'Teams with critical gaps blocking outcome confidence',
    category: 'outcome-confidence',
    query: createQuery(
      'outcomeConfidence',
      [{ fieldId: 'hasCriticalGap', operator: 'isTrue', value: true }],
      ['teamName', 'outcomeArea', 'confidenceLevel', 'score', 'hasCriticalGap'],
      { field: 'score', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-low-confidence',
    name: 'Low Confidence Outcomes',
    description: 'Outcome areas with low confidence across teams',
    category: 'outcome-confidence',
    query: createQuery(
      'outcomeConfidence',
      [{ fieldId: 'confidenceLevel', operator: 'equals', value: 'low' }],
      ['teamName', 'outcomeArea', 'confidenceLevel', 'score'],
      { field: 'score', direction: 'asc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-planning-confidence',
    name: 'Planning Confidence by Team',
    description: 'Planning outcome confidence across all teams',
    category: 'outcome-confidence',
    query: createQuery(
      'outcomeConfidence',
      [{ fieldId: 'outcomeArea', operator: 'equals', value: 'commitments' }],
      ['teamName', 'outcomeArea', 'confidenceLevel', 'score', 'hasCriticalGap'],
      { field: 'score', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-forecasting-gaps',
    name: 'Forecasting Gaps',
    description: 'Teams with low forecasting confidence',
    category: 'outcome-confidence',
    query: createQuery(
      'outcomeConfidence',
      [
        { fieldId: 'outcomeArea', operator: 'equals', value: 'productivity' },
        { fieldId: 'confidenceLevel', operator: 'in', value: ['low', 'moderate'] },
      ],
      ['teamName', 'confidenceLevel', 'score', 'hasCriticalGap'],
      { field: 'score', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
];

// ============================================
// User Activity Templates
// ============================================

const userActivityTemplates: ReportTemplate[] = [
  {
    id: 'tpl-inactive-users',
    name: 'Inactive Users (14+ days)',
    description: 'Users who haven\'t logged in for 14 or more days',
    category: 'user-activity',
    query: createQuery(
      'userActivity',
      [{ fieldId: 'daysSinceLastVisit', operator: 'greaterThan', value: 14 }],
      ['displayName', 'email', 'role', 'lastVisit', 'daysSinceLastVisit', 'visitCount'],
      { field: 'daysSinceLastVisit', direction: 'desc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-power-users',
    name: 'Power Users',
    description: 'Most active users by visit count and session time',
    category: 'user-activity',
    query: createQuery(
      'userActivity',
      [{ fieldId: 'visitCount', operator: 'greaterThan', value: 20 }],
      ['displayName', 'role', 'visitCount', 'avgSessionMinutes', 'assessmentsCreated', 'assessmentsViewed'],
      { field: 'visitCount', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-user-engagement',
    name: 'User Engagement Overview',
    description: 'All users with their engagement metrics',
    category: 'user-activity',
    query: createQuery(
      'userActivity',
      [],
      ['displayName', 'role', 'lastVisit', 'visitCount', 'assessmentsCreated', 'avgSessionMinutes'],
      { field: 'lastVisit', direction: 'desc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-creator-activity',
    name: 'Creator Activity',
    description: 'Assessment creation activity by creators',
    category: 'user-activity',
    query: createQuery(
      'userActivity',
      [{ fieldId: 'role', operator: 'equals', value: 'creator' }],
      ['displayName', 'assessmentsCreated', 'assessmentsViewed', 'visitCount', 'avgSessionMinutes'],
      { field: 'assessmentsCreated', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
];

// ============================================
// Data Quality Templates
// ============================================

const dataQualityTemplates: ReportTemplate[] = [
  {
    id: 'tpl-unestimated-issues',
    name: 'Unestimated Issues',
    description: 'Issues missing story point estimates',
    category: 'data-quality',
    query: createQuery(
      'issues',
      [{ fieldId: 'hasEstimate', operator: 'isFalse', value: false }],
      ['issueKey', 'summary', 'issueType', 'teamName', 'status', 'assignee'],
      { field: 'teamName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-stale-issues',
    name: 'Stale Issues',
    description: 'Issues not updated in 14+ days',
    category: 'data-quality',
    query: createQuery(
      'issues',
      [{ fieldId: 'daysStale', operator: 'greaterThan', value: 14 }],
      ['issueKey', 'summary', 'teamName', 'status', 'daysStale', 'assignee'],
      { field: 'daysStale', direction: 'desc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-orphan-issues',
    name: 'Orphan Issues (No Epic)',
    description: 'Issues without a parent epic',
    category: 'data-quality',
    query: createQuery(
      'issues',
      [{ fieldId: 'hasParentEpic', operator: 'isFalse', value: false }],
      ['issueKey', 'summary', 'issueType', 'teamName', 'status', 'sprintName'],
      { field: 'teamName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-missing-ac',
    name: 'Missing Acceptance Criteria',
    description: 'Stories and bugs without acceptance criteria',
    category: 'data-quality',
    query: createQuery(
      'issues',
      [
        { fieldId: 'hasAcceptanceCriteria', operator: 'isFalse', value: false },
        { fieldId: 'issueType', operator: 'in', value: ['Story', 'Bug'] },
      ],
      ['issueKey', 'summary', 'issueType', 'teamName', 'status'],
      { field: 'teamName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-unassigned-inprogress',
    name: 'In Progress Without Assignee',
    description: 'Issues in progress but not assigned',
    category: 'data-quality',
    query: createQuery(
      'issues',
      [
        { fieldId: 'status', operator: 'equals', value: 'In Progress' },
        { fieldId: 'assignee', operator: 'equals', value: 'Unassigned' },
      ],
      ['issueKey', 'summary', 'issueType', 'teamName', 'daysInStatus'],
      { field: 'daysInStatus', direction: 'desc' }
    ),
    suggestedVisualization: 'table',
  },
];

// ============================================
// Trend Analysis Templates
// ============================================

const trendTemplates: ReportTemplate[] = [
  {
    id: 'tpl-sprint-velocity',
    name: 'Sprint Velocity Trends',
    description: 'Team velocity across recent sprints',
    category: 'trend-analysis',
    query: createQuery(
      'sprintMetrics',
      [{ fieldId: 'state', operator: 'equals', value: 'closed' }],
      ['teamName', 'sprintName', 'completedPoints', 'plannedPoints', 'velocityPercent', 'completionRate'],
      { field: 'startDate', direction: 'desc' }
    ),
    suggestedVisualization: 'line',
  },
  {
    id: 'tpl-carryover-trends',
    name: 'Sprint Carryover Trends',
    description: 'Work carried over between sprints',
    category: 'trend-analysis',
    query: createQuery(
      'sprintMetrics',
      [{ fieldId: 'carryOverPercent', operator: 'greaterThan', value: 10 }],
      ['teamName', 'sprintName', 'carryOverPercent', 'carryOverCount', 'completionRate'],
      { field: 'carryOverPercent', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-team-metrics-overview',
    name: 'Team Metrics Overview',
    description: 'Key metrics across all teams',
    category: 'trend-analysis',
    query: createQuery(
      'teamMetrics',
      [],
      ['teamName', 'avgVelocity', 'avgCycleTime', 'staleWorkPercent', 'bugRatio', 'backlogSize'],
      { field: 'teamName', direction: 'asc' }
    ),
    suggestedVisualization: 'table',
  },
  {
    id: 'tpl-scope-change',
    name: 'Sprint Scope Changes',
    description: 'Sprints with significant scope changes',
    category: 'trend-analysis',
    query: createQuery(
      'sprintMetrics',
      [{ fieldId: 'scopeChangePercent', operator: 'greaterThan', value: 15 }],
      ['teamName', 'sprintName', 'scopeChangePercent', 'addedMidSprint', 'removedMidSprint'],
      { field: 'scopeChangePercent', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
  {
    id: 'tpl-backlog-growth',
    name: 'Backlog Growth Analysis',
    description: 'Teams with growing backlogs',
    category: 'trend-analysis',
    query: createQuery(
      'teamMetrics',
      [{ fieldId: 'backlogGrowthRate', operator: 'greaterThan', value: 0.1 }],
      ['teamName', 'backlogSize', 'backlogGrowthRate', 'avgThroughput', 'inProgressCount'],
      { field: 'backlogGrowthRate', direction: 'desc' }
    ),
    suggestedVisualization: 'bar',
  },
];

// ============================================
// All Templates Combined
// ============================================

export const REPORT_TEMPLATES: ReportTemplate[] = [
  ...teamHealthTemplates,
  ...indicatorTemplates,
  ...outcomeConfidenceTemplates,
  ...userActivityTemplates,
  ...dataQualityTemplates,
  ...trendTemplates,
];

export function getTemplatesByCategory(category: TemplateCategory): ReportTemplate[] {
  return REPORT_TEMPLATES.filter(t => t.category === category);
}

export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.id === id);
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  'team-health': 'Team Health Deep-Dives',
  'indicator-analysis': 'Indicator Analysis',
  'outcome-confidence': 'Outcome Confidence',
  'user-activity': 'User Activity',
  'data-quality': 'Data Quality',
  'trend-analysis': 'Trend Analysis',
};

export const TEMPLATE_CATEGORY_DESCRIPTIONS: Record<TemplateCategory, string> = {
  'team-health': 'Analyze team health scores, risks, and trends',
  'indicator-analysis': 'Deep dive into specific health indicators',
  'outcome-confidence': 'Track confidence in achieving outcomes',
  'user-activity': 'Monitor user engagement and activity',
  'data-quality': 'Identify data hygiene issues in Jira',
  'trend-analysis': 'Track metrics and performance over time',
};
