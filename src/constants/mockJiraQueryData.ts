// Mock Jira Data for Reports Query Engine
// Generates realistic mock data for issues, sprints, team metrics, and sprint metrics

// ============================================
// Type Definitions for Query Data
// ============================================

export interface MockIssue {
  id: string;
  issueKey: string;
  summary: string;
  issueType: 'Story' | 'Bug' | 'Task' | 'Sub-task' | 'Epic';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  assignee: string | null;
  teamId: string;
  teamName: string;
  sprintId: string | null;
  sprintName: string | null;
  estimatePoints: number | null;
  hasEstimate: boolean;
  daysStale: number;
  daysInStatus: number;           // Days in current status
  leadTime: number | null;        // Total days from created to done (null if not done)
  blockedByExternalTeam: boolean; // For cross-team dependency tracking
  hasAcceptanceCriteria: boolean;
  hasDueDate: boolean;
  hasParentEpic: boolean;
  epicCompletionPercent: number | null; // For epics, % of child issues done
  labels: string[];
  created: string;
  updated: string;
  // Collaboration & hygiene fields
  contributorCount: number;       // Number of unique contributors
  commentCount: number;           // Number of comments
  hasDescription: boolean;        // Has description field filled
  hasLinks: boolean;              // Has issue links
  // Carry-over & sprint behavior
  wasCarriedOver: boolean;        // Was carried over from previous sprint
  carryOverCount: number;         // Number of times carried over
  completedOnLastDay: boolean;    // Completed on last day of sprint
  // Workflow behavior
  wasSentBack: boolean;           // Was sent back to earlier status
  hasSentBackComment: boolean;    // Has comment explaining send-back
  sentBackCount: number;          // Number of times sent back
  wasBulkUpdated: boolean;        // Was updated in bulk operation
  // Epic-specific
  hasUnresolvedChildren: boolean; // Epic has unresolved child issues
  unresolvedChildCount: number;   // Count of unresolved children
}

export interface MockSprint {
  id: string;
  sprintId: string;
  sprintName: string;
  teamId: string;
  teamName: string;
  sprintGoal: string | null;
  hasGoal: boolean;
  startDate: string;
  endDate: string;
  state: 'active' | 'closed' | 'future';
  issueCount: number;
  completedCount: number;
  carriedOverCount: number;
  totalPoints: number;
  completedPoints: number;
}

export interface MockTeamMetrics {
  id: string;
  teamId: string;
  teamName: string;
  periodStart: string;
  periodEnd: string;
  // Estimation metrics
  unestimatedDonePercent: number;
  unestimatedDoneCount: number;
  totalDoneCount: number;
  // Cycle time metrics
  avgCycleTime: number;
  avgLeadTime: number;
  cycleTimeP50: number;
  cycleTimeP90: number;
  // Velocity & throughput
  velocityScore: number;
  avgThroughput: number;
  throughputVariability: number;
  avgVelocity: number;          // NEW: Average sprint velocity in points
  // Work health
  staleWorkPercent: number;
  staleWorkCount: number;
  blockedIssueCount: number;
  inProgressCount: number;      // NEW: Current WIP count
  // Issue composition
  bugCount: number;             // NEW: Total bugs (for quality ratio)
  storyCount: number;           // NEW: Total stories (for quality ratio)
  // Backlog health
  backlogSize: number;
  backlogGrowthRate: number;
  // Attribute compliance
  hasWorkType: boolean;         // NEW: Has required attribute
  hasPortfolio: boolean;        // NEW: Assigned to portfolio
  hasTribe: boolean;            // NEW: Assigned to tribe
}

export interface MockSprintMetrics {
  id: string;
  sprintId: string;
  sprintName: string;
  teamId: string;
  teamName: string;
  startDate: string;
  endDate: string;
  sprintDurationDays: number;   // NEW: Actual sprint length in days
  // Completion metrics
  completionRate: number;
  completedCount: number;
  plannedCount: number;
  // Velocity
  velocityPercent: number;
  completedPoints: number;
  plannedPoints: number;
  // Carry-over
  carryOverCount: number;
  carryOverPercent: number;
  // Scope change
  scopeChangePercent: number;
  addedMidSprint: number;
  removedMidSprint: number;
}

// ============================================
// Constants for Mock Data Generation
// ============================================

const TEAMS = [
  { id: 'team-1', name: 'Payments Core', key: 'PAY' },
  { id: 'team-2', name: 'Identity Services', key: 'ID' },
  { id: 'team-3', name: 'Search Team', key: 'SRCH' },
  { id: 'team-4', name: 'Checkout Flow', key: 'CHK' },
  { id: 'team-5', name: 'Platform Infra', key: 'INFRA' },
  { id: 'team-6', name: 'Support Ops', key: 'OPS' },
  { id: 'team-7', name: 'Mobile Experience', key: 'MOB' },
  { id: 'team-8', name: 'API Gateway', key: 'API' },
];

const ISSUE_SUMMARIES = [
  'Implement user authentication flow',
  'Fix memory leak in background service',
  'Add pagination to search results',
  'Update deprecated API endpoints',
  'Refactor database connection pooling',
  'Improve error handling in checkout',
  'Add unit tests for payment module',
  'Optimize image loading performance',
  'Implement caching for API responses',
  'Fix race condition in state management',
  'Add accessibility features to forms',
  'Update third-party dependencies',
  'Implement retry logic for network calls',
  'Add logging for debugging purposes',
  'Fix timezone handling in scheduler',
  'Implement feature flag system',
  'Add data validation for user inputs',
  'Optimize SQL query performance',
  'Fix CSS layout issues on mobile',
  'Implement SSO integration',
  'Create dashboard analytics widget',
  'Fix payment processing timeout',
  'Add email notification system',
  'Implement search autocomplete',
  'Fix cart abandonment tracking',
  'Add multi-language support',
  'Implement A/B testing framework',
  'Fix session timeout issues',
  'Add export to CSV functionality',
  'Implement webhook integrations',
];

const SPRINT_GOALS = [
  'Complete payment gateway integration',
  'Launch user dashboard MVP',
  'Improve system performance by 20%',
  'Reduce critical bugs to zero',
  'Ship mobile responsive design',
  'Complete API v2 migration',
  'Implement security enhancements',
  null, // Some sprints don't have goals
  null,
];

const ASSIGNEES = [
  'John Smith',
  'Sarah Johnson',
  'Mike Chen',
  'Emily Davis',
  'Alex Kim',
  'Rachel Garcia',
  'David Wilson',
  'Lisa Brown',
  null, // Unassigned
  null,
];

const LABELS = [
  'frontend',
  'backend',
  'api',
  'security',
  'performance',
  'ux',
  'tech-debt',
  'customer-request',
  'documentation',
  'testing',
];

// ============================================
// Helper Functions
// ============================================

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals: number = 1) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const randomItem = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const randomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysAgo));
  return date.toISOString();
};

const pastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// ============================================
// Mock Issue Generator
// ============================================

let issueCounter = 1000;

function generateMockIssue(team: typeof TEAMS[0], sprint: MockSprint | null): MockIssue {
  const issueType = randomItem(['Story', 'Bug', 'Task', 'Sub-task', 'Epic'] as const);
  const status = randomItem(['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'] as const);
  const hasEstimate = Math.random() > 0.25; // 75% have estimates
  const estimatePoints = hasEstimate ? randomItem([1, 2, 3, 5, 8, 13]) : null;

  // Calculate days stale based on status
  let daysStale = 0;
  if (status !== 'Done') {
    daysStale = randomInt(0, status === 'Blocked' ? 14 : 7);
  }

  // Calculate days in current status
  const daysInStatus = status === 'Done' ? 0 : randomInt(0, status === 'In Review' ? 5 : 10);

  // Calculate lead time (only for done issues)
  const leadTime = status === 'Done' ? randomInt(3, 30) : null;

  // Cross-team blocking (only for blocked issues)
  const blockedByExternalTeam = status === 'Blocked' ? Math.random() > 0.6 : false;

  // Epic completion (only for epics)
  const epicCompletionPercent = issueType === 'Epic' ? randomInt(0, 100) : null;

  // Collaboration metrics
  const contributorCount = status === 'Done' ? randomInt(1, 4) : randomInt(1, 2);
  const commentCount = status === 'Done' ? randomInt(0, 10) : randomInt(0, 5);

  // Workflow behavior
  const wasSentBack = Math.random() > 0.85; // 15% sent back
  const wasCarriedOver = sprint ? Math.random() > 0.8 : false; // 20% carried over
  const completedOnLastDay = status === 'Done' && sprint ? Math.random() > 0.75 : false; // 25% on last day

  // Epic children (for done epics, some might have unresolved children)
  const hasUnresolvedChildren = issueType === 'Epic' && ['Done', 'Closed'].includes(status)
    ? Math.random() > 0.7 // 30% of done epics have issues
    : false;

  issueCounter++;

  return {
    id: `issue-${issueCounter}`,
    issueKey: `${team.key}-${issueCounter}`,
    summary: randomItem(ISSUE_SUMMARIES),
    issueType,
    status,
    priority: randomItem(['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const),
    assignee: randomItem(ASSIGNEES),
    teamId: team.id,
    teamName: team.name,
    sprintId: sprint?.sprintId || null,
    sprintName: sprint?.sprintName || null,
    estimatePoints,
    hasEstimate,
    daysStale,
    daysInStatus,
    leadTime,
    blockedByExternalTeam,
    hasAcceptanceCriteria: issueType === 'Story' ? Math.random() > 0.2 : Math.random() > 0.5,
    hasDueDate: Math.random() > 0.6,
    hasParentEpic: issueType !== 'Epic' && Math.random() > 0.3,
    epicCompletionPercent,
    labels: randomItems(LABELS, randomInt(0, 3)),
    created: randomDate(90),
    updated: randomDate(30),
    // Collaboration & hygiene
    contributorCount,
    commentCount,
    hasDescription: Math.random() > 0.15, // 85% have descriptions
    hasLinks: Math.random() > 0.4, // 60% have links
    // Carry-over & sprint behavior
    wasCarriedOver,
    carryOverCount: wasCarriedOver ? randomInt(1, 3) : 0,
    completedOnLastDay,
    // Workflow behavior
    wasSentBack,
    hasSentBackComment: wasSentBack ? Math.random() > 0.5 : false, // 50% have comments when sent back
    sentBackCount: wasSentBack ? randomInt(1, 3) : 0,
    wasBulkUpdated: Math.random() > 0.9, // 10% bulk updated
    // Epic-specific
    hasUnresolvedChildren,
    unresolvedChildCount: hasUnresolvedChildren ? randomInt(1, 5) : 0,
  };
}

// ============================================
// Mock Sprint Generator
// ============================================

let sprintCounter = 1;

function generateMockSprint(team: typeof TEAMS[0], weeksAgo: number, state: 'active' | 'closed' | 'future'): MockSprint {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksAgo * 14)); // 2-week sprints
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 14);

  const issueCount = randomInt(8, 20);
  const completedCount = state === 'closed'
    ? randomInt(Math.floor(issueCount * 0.6), issueCount)
    : state === 'active'
    ? randomInt(0, Math.floor(issueCount * 0.7))
    : 0;

  const totalPoints = randomInt(20, 50);
  const completedPoints = state === 'closed'
    ? randomInt(Math.floor(totalPoints * 0.6), totalPoints)
    : state === 'active'
    ? randomInt(0, Math.floor(totalPoints * 0.5))
    : 0;

  const sprintGoal = randomItem(SPRINT_GOALS);
  sprintCounter++;

  return {
    id: `sprint-${team.id}-${sprintCounter}`,
    sprintId: `sprint-${sprintCounter}`,
    sprintName: `${team.name} Sprint ${sprintCounter}`,
    teamId: team.id,
    teamName: team.name,
    sprintGoal,
    hasGoal: sprintGoal !== null,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    state,
    issueCount,
    completedCount,
    carriedOverCount: state === 'closed' ? randomInt(0, 5) : 0,
    totalPoints,
    completedPoints,
  };
}

// ============================================
// Mock Team Metrics Generator
// ============================================

function generateMockTeamMetrics(team: typeof TEAMS[0]): MockTeamMetrics & { bugRatio: number; wipRatio: number; workloadVariance: number; hasFutureSprint: boolean } {
  const totalDoneCount = randomInt(20, 80);
  const unestimatedDoneCount = randomInt(0, Math.floor(totalDoneCount * 0.4));
  const backlogSize = randomInt(30, 150);
  const bugCount = randomInt(5, 25);
  const storyCount = randomInt(15, 50);
  const avgThroughput = randomFloat(5, 20);
  const inProgressCount = randomInt(3, 15);

  // Calculated metrics
  const bugRatio = storyCount > 0 ? Number((bugCount / storyCount).toFixed(2)) : 0;
  const wipRatio = avgThroughput > 0 ? Number((inProgressCount / avgThroughput).toFixed(2)) : 0;
  const workloadVariance = randomFloat(0.1, 0.8);

  return {
    id: `metrics-${team.id}`,
    teamId: team.id,
    teamName: team.name,
    periodStart: pastDate(90),
    periodEnd: pastDate(0),
    // Estimation
    unestimatedDonePercent: Math.round((unestimatedDoneCount / totalDoneCount) * 100),
    unestimatedDoneCount,
    totalDoneCount,
    // Cycle time
    avgCycleTime: randomFloat(2, 12),
    avgLeadTime: randomFloat(5, 20),
    cycleTimeP50: randomFloat(1.5, 8),
    cycleTimeP90: randomFloat(8, 25),
    // Velocity
    velocityScore: randomFloat(60, 100),
    avgThroughput,
    throughputVariability: randomFloat(0.1, 0.5),
    avgVelocity: randomFloat(25, 45),
    // Work health
    staleWorkPercent: randomFloat(5, 30),
    staleWorkCount: randomInt(2, 15),
    blockedIssueCount: randomInt(0, 8),
    inProgressCount,
    // Issue composition
    bugCount,
    storyCount,
    // Backlog
    backlogSize,
    backlogGrowthRate: randomFloat(-5, 15),
    // Attribute compliance (some teams missing attributes for demo)
    hasWorkType: Math.random() > 0.15,  // 85% have work type
    hasPortfolio: Math.random() > 0.25, // 75% have portfolio
    hasTribe: Math.random() > 0.3,      // 70% have tribe
    // Computed ratios for reports
    bugRatio,
    wipRatio,
    workloadVariance,
    hasFutureSprint: Math.random() > 0.2, // 80% have future sprints
  };
}

// ============================================
// Mock Sprint Metrics Generator
// ============================================

function generateMockSprintMetrics(sprint: MockSprint): MockSprintMetrics & { avgVelocity: number; commitmentRatio: number } {
  const plannedCount = sprint.issueCount;
  const completedCount = sprint.completedCount;
  const plannedPoints = sprint.totalPoints;
  const completedPoints = sprint.completedPoints;

  const carryOverCount = sprint.carriedOverCount;
  const addedMidSprint = randomInt(0, 5);
  const removedMidSprint = randomInt(0, 3);

  // Calculate sprint duration in days (with some variation)
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const sprintDurationDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Team's historical average velocity (simulated)
  const avgVelocity = randomFloat(25, 45);
  // Commitment ratio = plannedPoints / avgVelocity
  const commitmentRatio = avgVelocity > 0 ? Number((plannedPoints / avgVelocity).toFixed(2)) : 0;

  return {
    id: `sprint-metrics-${sprint.sprintId}`,
    sprintId: sprint.sprintId,
    sprintName: sprint.sprintName,
    teamId: sprint.teamId,
    teamName: sprint.teamName,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    sprintDurationDays,
    // Completion
    completionRate: plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0,
    completedCount,
    plannedCount,
    // Velocity
    velocityPercent: plannedPoints > 0 ? Math.round((completedPoints / plannedPoints) * 100) : 0,
    completedPoints,
    plannedPoints,
    // Carry-over
    carryOverCount,
    carryOverPercent: plannedCount > 0 ? Math.round((carryOverCount / plannedCount) * 100) : 0,
    // Scope change
    scopeChangePercent: plannedCount > 0
      ? Math.round(((addedMidSprint + removedMidSprint) / plannedCount) * 100)
      : 0,
    addedMidSprint,
    removedMidSprint,
    // Planning metrics
    avgVelocity,
    commitmentRatio,
  };
}

// ============================================
// Generate All Mock Data
// ============================================

// Generate sprints for all teams
const allSprints: MockSprint[] = [];
TEAMS.forEach(team => {
  // 3 closed sprints, 1 active, 1 future
  allSprints.push(generateMockSprint(team, 6, 'closed'));
  allSprints.push(generateMockSprint(team, 4, 'closed'));
  allSprints.push(generateMockSprint(team, 2, 'closed'));
  allSprints.push(generateMockSprint(team, 0, 'active'));
  allSprints.push(generateMockSprint(team, -2, 'future'));
});

// Generate issues for all teams
const allIssues: MockIssue[] = [];
TEAMS.forEach(team => {
  // Get sprints for this team
  const teamSprints = allSprints.filter(s => s.teamId === team.id);

  // Generate issues in sprints
  teamSprints.forEach(sprint => {
    const issueCount = randomInt(8, 15);
    for (let i = 0; i < issueCount; i++) {
      allIssues.push(generateMockIssue(team, sprint));
    }
  });

  // Generate backlog issues (no sprint)
  const backlogCount = randomInt(15, 40);
  for (let i = 0; i < backlogCount; i++) {
    allIssues.push(generateMockIssue(team, null));
  }
});

// Generate team metrics
const allTeamMetrics: MockTeamMetrics[] = TEAMS.map(team => generateMockTeamMetrics(team));

// Generate sprint metrics
const allSprintMetrics: MockSprintMetrics[] = allSprints
  .filter(s => s.state !== 'future')
  .map(sprint => generateMockSprintMetrics(sprint));

// ============================================
// Exported Data Access Functions
// ============================================

export function getMockIssues(): MockIssue[] {
  return allIssues;
}

export function getMockSprints(): MockSprint[] {
  return allSprints;
}

export function getMockTeamMetrics(): MockTeamMetrics[] {
  return allTeamMetrics;
}

export function getMockSprintMetrics(): MockSprintMetrics[] {
  return allSprintMetrics;
}

// Summary statistics for debugging
export const MOCK_DATA_STATS = {
  totalIssues: allIssues.length,
  totalSprints: allSprints.length,
  totalTeams: TEAMS.length,
  issuesByTeam: TEAMS.map(t => ({
    team: t.name,
    count: allIssues.filter(i => i.teamId === t.id).length,
  })),
  sprintsByState: {
    active: allSprints.filter(s => s.state === 'active').length,
    closed: allSprints.filter(s => s.state === 'closed').length,
    future: allSprints.filter(s => s.state === 'future').length,
  },
};
