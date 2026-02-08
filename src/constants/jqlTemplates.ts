// ============================================
// JQL Template System
// Ready-made query templates organized by category
// ============================================

export type JQLTemplateCategory =
  | 'team-health'
  | 'issue-hygiene'
  | 'sprint-health'
  | 'user-activity'
  | 'cross-entity';

export interface JQLTemplate {
  id: string;
  name: string;
  description: string;
  category: JQLTemplateCategory;
  query: string;
  tags: string[];  // For search
}

export const TEMPLATE_CATEGORY_LABELS: Record<JQLTemplateCategory, string> = {
  'team-health': 'Team Health',
  'issue-hygiene': 'Issue Hygiene',
  'sprint-health': 'Sprint Health',
  'user-activity': 'User Activity',
  'cross-entity': 'Cross-Entity Analysis',
};

export const TEMPLATE_CATEGORY_DESCRIPTIONS: Record<JQLTemplateCategory, string> = {
  'team-health': 'Monitor team health metrics, risk levels, and trends',
  'issue-hygiene': 'Identify issues missing key attributes or requiring attention',
  'sprint-health': 'Analyze sprint performance, completion rates, and goals',
  'user-activity': 'Track user engagement and activity patterns',
  'cross-entity': 'Complex queries spanning multiple entity types',
};

// ============================================
// Team Health Templates (8)
// ============================================

const TEAM_HEALTH_TEMPLATES: JQLTemplate[] = [
  {
    id: 'th-001',
    name: 'High Risk Dimensions',
    description: 'Find all high-risk dimensions across teams',
    category: 'team-health',
    query: 'Teams.dimensions WHERE riskLevel = "high"',
    tags: ['risk', 'high-risk', 'danger', 'alert', 'attention'],
  },
  {
    id: 'th-002',
    name: 'Most At-Risk Teams',
    description: 'Teams ranked by number of high-risk dimensions',
    category: 'team-health',
    query: 'Teams WHERE highRiskDimensionCount > 0 ORDER BY highRiskDimensionCount DESC',
    tags: ['risk', 'ranking', 'worst', 'prioritize'],
  },
  {
    id: 'th-003',
    name: 'Declining Health Trends',
    description: 'Dimensions showing declining health trends',
    category: 'team-health',
    query: 'Teams.dimensions WHERE trend = "declining"',
    tags: ['trend', 'declining', 'worsening', 'regression'],
  },
  {
    id: 'th-004',
    name: 'Below Average Health',
    description: 'Teams with health score below 40 (needs attention threshold)',
    category: 'team-health',
    query: 'Teams WHERE avgHealthScore < 40',
    tags: ['below-average', 'low-performing', 'health-score', 'bottom'],
  },
  {
    id: 'th-005',
    name: 'Product Teams at Risk',
    description: 'Product development teams with worst dimension at high risk',
    category: 'team-health',
    query: 'Teams WHERE worstDimensionRisk = "high" AND workType = "product"',
    tags: ['product', 'development', 'risk', 'filtered'],
  },
  {
    id: 'th-006',
    name: 'Critical Outcome Gaps',
    description: 'Outcome confidence records with critical gaps',
    category: 'team-health',
    query: 'Teams.outcomeConfidence WHERE hasCriticalGap = true',
    tags: ['outcome', 'confidence', 'critical', 'gap', 'blocking'],
  },
  {
    id: 'th-007',
    name: 'Low Confidence Teams',
    description: 'Teams with lowest confidence level at "low"',
    category: 'team-health',
    query: 'Teams WHERE lowestConfidenceLevel = "low"',
    tags: ['confidence', 'low', 'outcome', 'forecasting'],
  },
  {
    id: 'th-008',
    name: 'Multiple Critical Gaps',
    description: 'Teams with more than one critical gap',
    category: 'team-health',
    query: 'Teams WHERE criticalGapCount > 1',
    tags: ['critical', 'multiple', 'gaps', 'severe'],
  },
];

// ============================================
// Issue Hygiene Templates (8)
// ============================================

const ISSUE_HYGIENE_TEMPLATES: JQLTemplate[] = [
  {
    id: 'ih-001',
    name: 'Stale In-Progress Work',
    description: 'Issues in progress with no updates in 7+ days',
    category: 'issue-hygiene',
    query: 'Issues WHERE status = "In Progress" AND daysStale > 7',
    tags: ['stale', 'inactive', 'stuck', 'old', 'blocked'],
  },
  {
    id: 'ih-002',
    name: 'Missing Estimates',
    description: 'Stories and bugs without story point estimates',
    category: 'issue-hygiene',
    query: 'Issues WHERE hasEstimate = false AND issueType IN ("Story", "Bug")',
    tags: ['estimate', 'points', 'missing', 'unestimated'],
  },
  {
    id: 'ih-003',
    name: 'Missing Acceptance Criteria',
    description: 'Stories without acceptance criteria defined',
    category: 'issue-hygiene',
    query: 'Issues WHERE hasAcceptanceCriteria = false AND issueType = "Story"',
    tags: ['acceptance', 'criteria', 'requirements', 'definition'],
  },
  {
    id: 'ih-004',
    name: 'Orphaned Work Items',
    description: 'Stories and tasks not linked to an epic',
    category: 'issue-hygiene',
    query: 'Issues WHERE hasParentEpic = false AND issueType IN ("Story", "Task")',
    tags: ['orphan', 'unlinked', 'epic', 'hierarchy'],
  },
  {
    id: 'ih-005',
    name: 'Unassigned Active Work',
    description: 'Issues beyond To Do that have no assignee',
    category: 'issue-hygiene',
    query: 'Issues WHERE assignee = "Unassigned" AND status != "To Do"',
    tags: ['unassigned', 'ownership', 'responsible', 'nobody'],
  },
  {
    id: 'ih-006',
    name: 'Long Time in Status',
    description: 'Issues stuck in the same status for 14+ days',
    category: 'issue-hygiene',
    query: 'Issues WHERE daysInStatus > 14',
    tags: ['stuck', 'status', 'long', 'blocked', 'waiting'],
  },
  {
    id: 'ih-007',
    name: 'High Priority Not Done',
    description: 'Highest priority issues that are not yet complete',
    category: 'issue-hygiene',
    query: 'Issues WHERE priority = "Highest" AND status != "Done"',
    tags: ['priority', 'urgent', 'critical', 'incomplete'],
  },
  {
    id: 'ih-008',
    name: 'Stale Bugs',
    description: 'Bugs with no activity in 3+ days',
    category: 'issue-hygiene',
    query: 'Issues WHERE issueType = "Bug" AND daysStale > 3',
    tags: ['bug', 'stale', 'defect', 'inactive'],
  },
];

// ============================================
// Sprint Health Templates (8)
// ============================================

const SPRINT_HEALTH_TEMPLATES: JQLTemplate[] = [
  {
    id: 'sh-001',
    name: 'Sprints Without Goals',
    description: 'Sprints that have no sprint goal defined',
    category: 'sprint-health',
    query: 'Sprints WHERE hasGoal = false',
    tags: ['goal', 'missing', 'objective', 'purpose'],
  },
  {
    id: 'sh-002',
    name: 'Low Progress Active Sprints',
    description: 'Active sprints with fewer than 3 completed items',
    category: 'sprint-health',
    query: 'Sprints WHERE state = "active" AND completedCount < 3',
    tags: ['active', 'progress', 'slow', 'behind'],
  },
  {
    id: 'sh-003',
    name: 'High Carryover',
    description: 'Sprints with more than 30% carryover',
    category: 'sprint-health',
    query: 'SprintMetrics WHERE carryOverPercent > 30',
    tags: ['carryover', 'incomplete', 'spillover', 'overflow'],
  },
  {
    id: 'sh-004',
    name: 'Significant Scope Change',
    description: 'Sprints with scope changes exceeding 20%',
    category: 'sprint-health',
    query: 'SprintMetrics WHERE scopeChangePercent > 20',
    tags: ['scope', 'change', 'creep', 'churn'],
  },
  {
    id: 'sh-005',
    name: 'Low Completion Rate',
    description: 'Sprints completing less than 70% of committed work',
    category: 'sprint-health',
    query: 'SprintMetrics WHERE completionRate < 70',
    tags: ['completion', 'rate', 'underperforming', 'missed'],
  },
  {
    id: 'sh-006',
    name: 'Top Performing Sprints',
    description: 'Closed sprints ranked by completed points',
    category: 'sprint-health',
    query: 'Sprints WHERE state = "closed" ORDER BY completedPoints DESC LIMIT 10',
    tags: ['top', 'best', 'performing', 'velocity', 'ranking'],
  },
  {
    id: 'sh-007',
    name: 'Large Active Sprints',
    description: 'Active sprints with many issues',
    category: 'sprint-health',
    query: 'Sprints WHERE state = "active" AND issueCount > 15',
    tags: ['large', 'overloaded', 'too-many', 'capacity'],
  },
  {
    id: 'sh-008',
    name: 'Future Sprints Ready',
    description: 'Upcoming sprints with work planned',
    category: 'sprint-health',
    query: 'Sprints WHERE state = "future" AND totalPoints > 0',
    tags: ['future', 'planned', 'upcoming', 'ready'],
  },
];

// ============================================
// User Activity Templates (6)
// ============================================

const USER_ACTIVITY_TEMPLATES: JQLTemplate[] = [
  {
    id: 'ua-001',
    name: 'Inactive Users',
    description: 'Users who have not visited in 14+ days',
    category: 'user-activity',
    query: 'UserActivity WHERE daysSinceLastVisit > 14',
    tags: ['inactive', 'dormant', 'absent', 'churn'],
  },
  {
    id: 'ua-002',
    name: 'Inactive Creators',
    description: 'Creators who have not created any assessments',
    category: 'user-activity',
    query: 'UserActivity WHERE role = "creator" AND assessmentsCreated = 0',
    tags: ['creator', 'inactive', 'zero', 'unused'],
  },
  {
    id: 'ua-003',
    name: 'Power Users',
    description: 'Users with high engagement (20+ visits)',
    category: 'user-activity',
    query: 'UserActivity WHERE visitCount > 20 ORDER BY avgSessionMinutes DESC',
    tags: ['power', 'engaged', 'active', 'frequent'],
  },
  {
    id: 'ua-004',
    name: 'Active Viewers',
    description: 'Active users with viewer role',
    category: 'user-activity',
    query: 'Users WHERE status = "active" AND role = "viewer"',
    tags: ['viewer', 'active', 'stakeholder', 'consumer'],
  },
  {
    id: 'ua-005',
    name: 'Recent New Users',
    description: 'Users with very recent first activity',
    category: 'user-activity',
    query: 'UserActivity WHERE visitCount < 5 AND daysSinceLastVisit < 7',
    tags: ['new', 'recent', 'onboarding', 'fresh'],
  },
  {
    id: 'ua-006',
    name: 'Admin Users',
    description: 'All users with admin role',
    category: 'user-activity',
    query: 'Users WHERE role = "admin"',
    tags: ['admin', 'administrator', 'privileged', 'staff'],
  },
];

// ============================================
// Cross-Entity Analysis Templates (8)
// ============================================

const CROSS_ENTITY_TEMPLATES: JQLTemplate[] = [
  {
    id: 'ce-001',
    name: 'Blocked Issues by Team',
    description: 'Find blocked issues across teams',
    category: 'cross-entity',
    query: 'Teams.issues WHERE status = "Blocked"',
    tags: ['blocked', 'impediment', 'stuck', 'waiting'],
  },
  {
    id: 'ce-002',
    name: 'Multiple High-Risk Dimensions',
    description: 'High-risk dimensions from teams with 2+ high-risk dimensions',
    category: 'cross-entity',
    query: 'Teams.dimensions WHERE riskLevel = "high" HAVING COUNT > 2',
    tags: ['multiple', 'risk', 'severe', 'critical'],
  },
  {
    id: 'ce-003',
    name: 'Sprints Without Goals',
    description: 'Find sprints without goals across teams',
    category: 'cross-entity',
    query: 'Teams.sprints WHERE hasGoal = false',
    tags: ['sprint', 'goal', 'planning', 'objective'],
  },
  {
    id: 'ce-004',
    name: 'High Performing Sprints',
    description: 'Sprints with 80%+ completion rate',
    category: 'cross-entity',
    query: 'Teams.sprints WHERE completionRate > 80',
    tags: ['high-performing', 'consistent', 'reliable', 'excellent'],
  },
  {
    id: 'ce-005',
    name: 'Teams with Stale Work',
    description: 'Team metrics showing stale work over 20%',
    category: 'cross-entity',
    query: 'Teams.teamMetrics WHERE staleWorkPercent > 20',
    tags: ['stale', 'inactive', 'old', 'stuck'],
  },
  {
    id: 'ce-006',
    name: 'Low Forecasting Confidence',
    description: 'Low confidence outcomes in forecasting area',
    category: 'cross-entity',
    query: 'Teams.outcomeConfidence WHERE confidenceLevel = "low" AND outcomeArea = "forecasting"',
    tags: ['forecasting', 'prediction', 'estimate', 'confidence'],
  },
  {
    id: 'ce-007',
    name: 'Improving Dimensions',
    description: 'Dimensions showing improvement from teams with 2+ improving',
    category: 'cross-entity',
    query: 'Teams.dimensions WHERE trend = "improving" HAVING COUNT > 2',
    tags: ['improving', 'trending', 'better', 'growth'],
  },
  {
    id: 'ce-008',
    name: 'Platform Teams Health',
    description: 'Platform teams with their health summary',
    category: 'cross-entity',
    query: 'Teams WHERE workType = "platform" ORDER BY avgHealthScore DESC',
    tags: ['platform', 'infrastructure', 'health', 'sorted'],
  },
];

// ============================================
// All Templates Combined
// ============================================

export const JQL_TEMPLATES: JQLTemplate[] = [
  ...TEAM_HEALTH_TEMPLATES,
  ...ISSUE_HYGIENE_TEMPLATES,
  ...SPRINT_HEALTH_TEMPLATES,
  ...USER_ACTIVITY_TEMPLATES,
  ...CROSS_ENTITY_TEMPLATES,
];

// ============================================
// Helper Functions
// ============================================

export function getTemplatesByCategory(category: JQLTemplateCategory): JQLTemplate[] {
  return JQL_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(searchQuery: string): JQLTemplate[] {
  const query = searchQuery.toLowerCase().trim();
  if (!query) return JQL_TEMPLATES;

  return JQL_TEMPLATES.filter(template => {
    const searchableText = [
      template.name,
      template.description,
      ...template.tags,
    ].join(' ').toLowerCase();

    return searchableText.includes(query);
  });
}

export function filterTemplates(
  searchQuery: string,
  category: JQLTemplateCategory | 'all'
): JQLTemplate[] {
  let results = searchQuery ? searchTemplates(searchQuery) : JQL_TEMPLATES;

  if (category !== 'all') {
    results = results.filter(t => t.category === category);
  }

  return results;
}

export function getTemplateById(id: string): JQLTemplate | undefined {
  return JQL_TEMPLATES.find(t => t.id === id);
}

export const ALL_TEMPLATE_CATEGORIES: JQLTemplateCategory[] = [
  'team-health',
  'issue-hygiene',
  'sprint-health',
  'user-activity',
  'cross-entity',
];
