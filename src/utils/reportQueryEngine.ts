import {
  ReportQuery,
  QueryConditionGroup,
  QueryCondition,
  QueryEntityType,
  ReportResults,
  ReportResultRow,
  ReportColumnDefinition,
  getFieldsForEntity,
  AggregateFunction,
  GroupByDimension,
  AggregateField,
  HavingCondition,
  HealthReport,
} from '../types/reports';
import { JiraHealthReport } from '../constants/healthReports';
import { MOCK_MANAGED_USERS } from '../constants/mockAdminData';
import { MOCK_MY_ASSESSMENTS, MOCK_SHARED_WITH_ME } from '../constants/mockHomeData';
import {
  getMockIssues,
  getMockSprints,
  getMockTeamMetrics,
  getMockSprintMetrics,
} from '../constants/mockJiraQueryData';
import { MOCK_USER_ACTIVITY, MOCK_OUTCOME_CONFIDENCE } from '../constants/mockUserActivityData';

// Mock team data for queries
export const MOCK_TEAMS = [
  { id: 'team-1', teamName: 'Payments Core', teamKey: 'PAY', isOnboarded: true, workType: 'product', teamSize: 'large', process: 'scrum', domain: 'payments', portfolio: 'Consumer Products', tribe: 'Web Experience' },
  { id: 'team-2', teamName: 'Identity Services', teamKey: 'ID', isOnboarded: true, workType: 'platform', teamSize: 'medium', process: 'kanban', domain: 'identity', portfolio: 'Platform Infrastructure', tribe: 'Core APIs' },
  { id: 'team-3', teamName: 'Search Team', teamKey: 'SRCH', isOnboarded: true, workType: 'product', teamSize: 'medium', process: 'scrum', domain: 'search', portfolio: 'Consumer Products', tribe: 'Web Experience' },
  { id: 'team-4', teamName: 'Checkout Flow', teamKey: 'CHK', isOnboarded: true, workType: 'product', teamSize: 'small', process: 'hybrid', domain: 'checkout', portfolio: 'Consumer Products', tribe: 'Web Experience' },
  { id: 'team-5', teamName: 'Platform Infra', teamKey: 'INFRA', isOnboarded: false, workType: 'platform', teamSize: 'large', process: 'kanban', domain: 'identity', portfolio: 'Platform Infrastructure', tribe: 'Core APIs' },
  { id: 'team-6', teamName: 'Support Ops', teamKey: 'OPS', isOnboarded: true, workType: 'bau', teamSize: 'small', process: 'kanban', domain: 'payments', portfolio: 'Enterprise', tribe: 'Operations' },
  { id: 'team-7', teamName: 'Mobile Experience', teamKey: 'MOB', isOnboarded: true, workType: 'product', teamSize: 'medium', process: 'scrum', domain: 'checkout', portfolio: 'Consumer Products', tribe: 'Mobile Experience' },
  { id: 'team-8', teamName: 'API Gateway', teamKey: 'API', isOnboarded: true, workType: 'platform', teamSize: 'small', process: 'scrum', domain: 'identity', portfolio: 'Platform Infrastructure', tribe: 'Core APIs' },
];

// ============================================
// Computed Health Summary for Teams
// ============================================

type RiskLevel = 'low' | 'moderate' | 'high';
type ConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';

interface TeamHealthSummary {
  // From dimensions
  highRiskDimensionCount: number;
  decliningDimensionCount: number;
  avgHealthPercentile: number;
  worstDimensionRisk: RiskLevel;
  // From outcome confidence
  criticalGapCount: number;
  lowestConfidenceLevel: ConfidenceLevel;
  avgConfidenceScore: number;
  // From team metrics
  avgCycleTime: number;
  velocityScore: number;
  staleWorkPercent: number;
  bugRatio: number;
}

/**
 * Get the worst (highest severity) risk level from an array
 */
function getWorstRiskLevel(riskLevels: RiskLevel[]): RiskLevel {
  if (riskLevels.includes('high')) return 'high';
  if (riskLevels.includes('moderate')) return 'moderate';
  return 'low';
}

/**
 * Get the lowest confidence level from an array
 */
function getLowestConfidenceLevel(levels: ConfidenceLevel[]): ConfidenceLevel {
  const order: ConfidenceLevel[] = ['low', 'moderate', 'high', 'very-high'];
  for (const level of order) {
    if (levels.includes(level)) return level;
  }
  return 'high'; // default
}

/**
 * Compute health summary fields for a single team
 */
function computeTeamHealthSummary(teamName: string, teamId: string): TeamHealthSummary {
  // Get dimensions for this team
  const allDimensions = generateMockDimensions();
  const teamDimensions = allDimensions.filter(d => d.teamName === teamName);

  // Get outcome confidence for this team
  const teamOutcomeConfidence = MOCK_OUTCOME_CONFIDENCE.filter(oc =>
    oc.teamName === teamName || oc.teamId === teamId
  );

  // Get team metrics
  const allTeamMetrics = getMockTeamMetrics();
  const teamMetrics = allTeamMetrics.find(m => m.teamName === teamName);

  // Compute dimension-based fields
  const highRiskDimensionCount = teamDimensions.filter(d => d.riskLevel === 'high').length;
  const decliningDimensionCount = teamDimensions.filter(d => d.trend === 'declining').length;
  const avgHealthPercentile = teamDimensions.length > 0
    ? Math.round(teamDimensions.reduce((sum, d) => sum + (d.overallPercentile || 0), 0) / teamDimensions.length)
    : 50;
  const worstDimensionRisk = getWorstRiskLevel(
    teamDimensions.map(d => d.riskLevel as RiskLevel).filter(Boolean)
  );

  // Compute outcome confidence fields
  const criticalGapCount = teamOutcomeConfidence.filter(oc => oc.hasCriticalGap).length;
  const lowestConfidenceLevel = getLowestConfidenceLevel(
    teamOutcomeConfidence.map(oc => oc.confidenceLevel as ConfidenceLevel).filter(Boolean)
  );
  const avgConfidenceScore = teamOutcomeConfidence.length > 0
    ? Math.round(teamOutcomeConfidence.reduce((sum, oc) => sum + (oc.score || 0), 0) / teamOutcomeConfidence.length)
    : 50;

  // Get metrics fields (use defaults if not found)
  // Note: teamMetrics may have additional computed fields beyond the MockTeamMetrics interface
  const metricsData = teamMetrics as Record<string, unknown> | undefined;
  const avgCycleTime = (metricsData?.avgCycleTime as number) ?? 5;
  const velocityScore = (metricsData?.velocityScore as number) ?? 50;
  const staleWorkPercent = (metricsData?.staleWorkPercent as number) ?? 10;
  const bugRatio = (metricsData?.bugRatio as number) ?? 0.2;

  return {
    highRiskDimensionCount,
    decliningDimensionCount,
    avgHealthPercentile,
    worstDimensionRisk,
    criticalGapCount,
    lowestConfidenceLevel,
    avgConfidenceScore,
    avgCycleTime,
    velocityScore,
    staleWorkPercent,
    bugRatio,
  };
}

/**
 * Get teams with computed health summary fields
 */
function getTeamsWithHealthSummary() {
  return MOCK_TEAMS.map(team => ({
    ...team,
    ...computeTeamHealthSummary(team.teamName, team.id),
  }));
}

// Get unique portfolios and tribes
export function getUniquePortfolios(): string[] {
  return Array.from(new Set(MOCK_TEAMS.map(t => t.portfolio))).sort();
}

export function getUniqueTribes(): string[] {
  return Array.from(new Set(MOCK_TEAMS.map(t => t.tribe))).sort();
}

export function getTeamsByPortfolio(portfolio: string): typeof MOCK_TEAMS {
  return MOCK_TEAMS.filter(t => t.portfolio === portfolio);
}

export function getTeamsByTribe(tribe: string): typeof MOCK_TEAMS {
  return MOCK_TEAMS.filter(t => t.tribe === tribe);
}

// Generate mock dimension data from assessments
function generateMockDimensions() {
  const dimensions: any[] = [];
  const allAssessments = [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME];

  allAssessments.forEach(assessment => {
    if (assessment.result?.dimensions) {
      assessment.result.dimensions.forEach(dim => {
        dimensions.push({
          id: `${assessment.id}-${dim.dimensionKey}`,
          teamName: assessment.teamName,
          teamId: assessment.teamId,
          assessmentId: assessment.id,
          assessmentName: assessment.name,
          dimensionKey: dim.dimensionKey,
          dimensionName: dim.dimensionName,
          riskLevel: dim.riskLevel,
          overallPercentile: dim.overallPercentile,
          trend: dim.trend,
        });
      });
    }
  });

  return dimensions;
}

// Generate mock indicator data from assessments
function generateMockIndicators() {
  const indicators: any[] = [];
  const allAssessments = [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME];

  allAssessments.forEach(assessment => {
    if (assessment.result?.dimensions) {
      assessment.result.dimensions.forEach(dim => {
        dim.categories?.forEach(category => {
          category.indicators?.forEach(indicator => {
            indicators.push({
              id: `${assessment.id}-${dim.dimensionKey}-${indicator.id}`,
              teamName: assessment.teamName,
              teamId: assessment.teamId,
              assessmentId: assessment.id,
              dimensionKey: dim.dimensionKey,
              dimensionName: dim.dimensionName,
              indicatorId: indicator.id,
              indicatorName: indicator.name,
              value: indicator.value,
              benchmarkValue: indicator.benchmarkValue,
              benchmarkPercentile: indicator.benchmarkPercentile,
              trend: indicator.trend,
            });
          });
        });
      });
    }
  });

  return indicators;
}

/**
 * Get raw data based on entity type
 */
function getRawDataForEntity(entityType: QueryEntityType): any[] {
  switch (entityType) {
    case 'teams':
      return getTeamsWithHealthSummary();
    case 'assessments':
      return [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME].map(a => ({
        id: a.id,
        assessmentName: a.name,
        teamId: a.teamId,
        teamName: a.teamName,
        status: a.status,
        createdAt: a.createdAt,
        createdByUserId: a.createdByUserId,
        createdByUserName: a.createdByUserName,
      }));
    case 'dimensions':
      return generateMockDimensions();
    case 'indicators':
      return generateMockIndicators();
    case 'users':
      return MOCK_MANAGED_USERS.map(u => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      }));
    case 'issues':
      return getMockIssues();
    case 'sprints':
      return getMockSprints();
    case 'teamMetrics':
      return getMockTeamMetrics();
    case 'sprintMetrics':
      return getMockSprintMetrics();
    case 'userActivity':
      return MOCK_USER_ACTIVITY;
    case 'outcomeConfidence':
      return MOCK_OUTCOME_CONFIDENCE;
    default:
      return [];
  }
}

/**
 * Get column definitions for an entity type
 */
function getColumnsForEntity(entityType: QueryEntityType): ReportColumnDefinition[] {
  switch (entityType) {
    case 'teams':
      return [
        // Team Properties
        { id: 'teamName', label: 'Team Name', type: 'string', sortable: true, filterable: true },
        { id: 'teamKey', label: 'Key', type: 'string', sortable: true, filterable: false },
        { id: 'workType', label: 'Work Type', type: 'enum', sortable: true, filterable: true },
        { id: 'teamSize', label: 'Size', type: 'enum', sortable: true, filterable: true },
        { id: 'process', label: 'Process', type: 'enum', sortable: true, filterable: true },
        { id: 'domain', label: 'Domain', type: 'enum', sortable: true, filterable: true },
        { id: 'isOnboarded', label: 'Onboarded', type: 'boolean', sortable: true, filterable: true },
        // Health Summary
        { id: 'highRiskDimensionCount', label: 'High Risk Dims', type: 'number', sortable: true, filterable: true },
        { id: 'decliningDimensionCount', label: 'Declining Dims', type: 'number', sortable: true, filterable: true },
        { id: 'avgHealthPercentile', label: 'Avg Health %', type: 'number', sortable: true, filterable: true },
        { id: 'worstDimensionRisk', label: 'Worst Risk', type: 'enum', sortable: true, filterable: true },
        // Outcome Confidence
        { id: 'criticalGapCount', label: 'Critical Gaps', type: 'number', sortable: true, filterable: true },
        { id: 'lowestConfidenceLevel', label: 'Lowest Confidence', type: 'enum', sortable: true, filterable: true },
        { id: 'avgConfidenceScore', label: 'Avg Confidence', type: 'number', sortable: true, filterable: true },
        // Team Metrics
        { id: 'avgCycleTime', label: 'Avg Cycle Time', type: 'number', sortable: true, filterable: true },
        { id: 'velocityScore', label: 'Velocity Score', type: 'number', sortable: true, filterable: true },
        { id: 'staleWorkPercent', label: 'Stale Work %', type: 'number', sortable: true, filterable: true },
        { id: 'bugRatio', label: 'Bug Ratio', type: 'number', sortable: true, filterable: true },
      ];
    case 'assessments':
      return [
        { id: 'assessmentName', label: 'Assessment', type: 'string', sortable: true, filterable: true },
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'status', label: 'Status', type: 'enum', sortable: true, filterable: true },
        { id: 'createdAt', label: 'Created', type: 'date', sortable: true, filterable: false },
        { id: 'createdByUserName', label: 'Created By', type: 'string', sortable: true, filterable: true },
      ];
    case 'dimensions':
      return [
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'dimensionName', label: 'Dimension', type: 'string', sortable: true, filterable: true },
        { id: 'riskLevel', label: 'Risk Level', type: 'enum', sortable: true, filterable: true },
        { id: 'overallPercentile', label: 'Percentile', type: 'number', sortable: true, filterable: true },
        { id: 'trend', label: 'Trend', type: 'enum', sortable: true, filterable: true },
      ];
    case 'indicators':
      return [
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'dimensionName', label: 'Dimension', type: 'string', sortable: true, filterable: true },
        { id: 'indicatorName', label: 'Indicator', type: 'string', sortable: true, filterable: true },
        { id: 'benchmarkPercentile', label: 'Percentile', type: 'number', sortable: true, filterable: true },
        { id: 'trend', label: 'Trend', type: 'enum', sortable: true, filterable: true },
      ];
    case 'users':
      return [
        { id: 'displayName', label: 'Name', type: 'string', sortable: true, filterable: true },
        { id: 'email', label: 'Email', type: 'string', sortable: true, filterable: true },
        { id: 'role', label: 'Role', type: 'enum', sortable: true, filterable: true },
        { id: 'status', label: 'Status', type: 'enum', sortable: true, filterable: true },
        { id: 'lastActiveAt', label: 'Last Active', type: 'date', sortable: true, filterable: false },
      ];
    case 'issues':
      return [
        { id: 'issueKey', label: 'Key', type: 'string', sortable: true, filterable: true },
        { id: 'summary', label: 'Summary', type: 'string', sortable: false, filterable: false },
        { id: 'issueType', label: 'Type', type: 'enum', sortable: true, filterable: true },
        { id: 'status', label: 'Status', type: 'enum', sortable: true, filterable: true },
        { id: 'priority', label: 'Priority', type: 'enum', sortable: true, filterable: true },
        { id: 'assignee', label: 'Assignee', type: 'string', sortable: true, filterable: true },
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'sprintName', label: 'Sprint', type: 'string', sortable: true, filterable: false },
        { id: 'estimatePoints', label: 'Points', type: 'number', sortable: true, filterable: true },
        { id: 'daysStale', label: 'Days Stale', type: 'number', sortable: true, filterable: true },
        { id: 'daysInStatus', label: 'Days in Status', type: 'number', sortable: true, filterable: true },
        { id: 'leadTime', label: 'Lead Time', type: 'number', sortable: true, filterable: true },
        { id: 'labels', label: 'Labels', type: 'string', sortable: false, filterable: true },
        { id: 'epicCompletionPercent', label: 'Epic Completion %', type: 'number', sortable: true, filterable: true },
      ];
    case 'sprints':
      return [
        { id: 'sprintName', label: 'Sprint', type: 'string', sortable: true, filterable: true },
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'state', label: 'State', type: 'enum', sortable: true, filterable: true },
        { id: 'hasGoal', label: 'Has Goal', type: 'boolean', sortable: true, filterable: true },
        { id: 'issueCount', label: 'Issues', type: 'number', sortable: true, filterable: true },
        { id: 'completedCount', label: 'Completed', type: 'number', sortable: true, filterable: true },
        { id: 'totalPoints', label: 'Points', type: 'number', sortable: true, filterable: true },
        { id: 'completedPoints', label: 'Completed Pts', type: 'number', sortable: true, filterable: true },
        { id: 'startDate', label: 'Start', type: 'date', sortable: true, filterable: false },
        { id: 'endDate', label: 'End', type: 'date', sortable: true, filterable: false },
      ];
    case 'teamMetrics':
      return [
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'unestimatedDonePercent', label: 'Unestimated %', type: 'number', sortable: true, filterable: true },
        { id: 'avgCycleTime', label: 'Avg Cycle Time', type: 'number', sortable: true, filterable: true },
        { id: 'avgLeadTime', label: 'Avg Lead Time', type: 'number', sortable: true, filterable: true },
        { id: 'velocityScore', label: 'Velocity Score', type: 'number', sortable: true, filterable: true },
        { id: 'staleWorkPercent', label: 'Stale Work %', type: 'number', sortable: true, filterable: true },
        { id: 'blockedIssueCount', label: 'Blocked', type: 'number', sortable: true, filterable: true },
        { id: 'backlogSize', label: 'Backlog Size', type: 'number', sortable: true, filterable: true },
        { id: 'avgVelocity', label: 'Avg Velocity', type: 'number', sortable: true, filterable: true },
        { id: 'avgThroughput', label: 'Avg Throughput', type: 'number', sortable: true, filterable: true },
        { id: 'inProgressCount', label: 'In Progress', type: 'number', sortable: true, filterable: true },
        { id: 'bugCount', label: 'Bugs', type: 'number', sortable: true, filterable: true },
        { id: 'storyCount', label: 'Stories', type: 'number', sortable: true, filterable: true },
        { id: 'bugRatio', label: 'Bug Ratio', type: 'number', sortable: true, filterable: true },
        { id: 'wipRatio', label: 'WIP Ratio', type: 'number', sortable: true, filterable: true },
        { id: 'workloadVariance', label: 'Workload Var.', type: 'number', sortable: true, filterable: true },
        { id: 'totalDoneCount', label: 'Total Done', type: 'number', sortable: true, filterable: true },
      ];
    case 'sprintMetrics':
      return [
        { id: 'sprintName', label: 'Sprint', type: 'string', sortable: true, filterable: true },
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'completionRate', label: 'Completion %', type: 'number', sortable: true, filterable: true },
        { id: 'velocityPercent', label: 'Velocity %', type: 'number', sortable: true, filterable: true },
        { id: 'completedPoints', label: 'Completed Pts', type: 'number', sortable: true, filterable: true },
        { id: 'plannedPoints', label: 'Planned Pts', type: 'number', sortable: true, filterable: true },
        { id: 'carryOverPercent', label: 'Carry Over %', type: 'number', sortable: true, filterable: true },
        { id: 'scopeChangePercent', label: 'Scope Change %', type: 'number', sortable: true, filterable: true },
        { id: 'startDate', label: 'Start', type: 'date', sortable: true, filterable: false },
        { id: 'sprintDurationDays', label: 'Duration (days)', type: 'number', sortable: true, filterable: true },
        { id: 'avgVelocity', label: 'Avg Velocity', type: 'number', sortable: true, filterable: true },
        { id: 'commitmentRatio', label: 'Commitment Ratio', type: 'number', sortable: true, filterable: true },
      ];
    case 'userActivity':
      return [
        { id: 'displayName', label: 'Name', type: 'string', sortable: true, filterable: true },
        { id: 'email', label: 'Email', type: 'string', sortable: true, filterable: true },
        { id: 'role', label: 'Role', type: 'enum', sortable: true, filterable: true },
        { id: 'lastVisit', label: 'Last Visit', type: 'date', sortable: true, filterable: false },
        { id: 'visitCount', label: 'Visits (30d)', type: 'number', sortable: true, filterable: true },
        { id: 'daysSinceLastVisit', label: 'Days Inactive', type: 'number', sortable: true, filterable: true },
        { id: 'assessmentsCreated', label: 'Created', type: 'number', sortable: true, filterable: true },
        { id: 'assessmentsViewed', label: 'Viewed', type: 'number', sortable: true, filterable: true },
        { id: 'avgSessionMinutes', label: 'Avg Session (min)', type: 'number', sortable: true, filterable: true },
      ];
    case 'outcomeConfidence':
      return [
        { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
        { id: 'outcomeArea', label: 'Outcome Area', type: 'enum', sortable: true, filterable: true },
        { id: 'confidenceLevel', label: 'Confidence', type: 'enum', sortable: true, filterable: true },
        { id: 'score', label: 'Score', type: 'number', sortable: true, filterable: true },
        { id: 'hasCriticalGap', label: 'Critical Gap', type: 'boolean', sortable: true, filterable: true },
      ];
    default:
      return [];
  }
}

/**
 * Evaluate a single condition against a data row
 */
function evaluateCondition(condition: QueryCondition, row: any): boolean {
  const { fieldId, operator, value } = condition;
  const fieldValue = row[fieldId];

  // Handle null/undefined field values
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  switch (operator) {
    case 'equals':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase() === value.toLowerCase();
      }
      return fieldValue === value;

    case 'notEquals':
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.toLowerCase() !== value.toLowerCase();
      }
      return fieldValue !== value;

    case 'contains':
      // Handle array fields like labels
      if (Array.isArray(fieldValue) && typeof value === 'string') {
        return fieldValue.some(v =>
          typeof v === 'string' && v.toLowerCase().includes(value.toLowerCase())
        );
      }
      return typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().includes(value.toLowerCase());

    case 'startsWith':
      return typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().startsWith(value.toLowerCase());

    case 'endsWith':
      return typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().endsWith(value.toLowerCase());

    case 'in':
      if (Array.isArray(value)) {
        if (typeof fieldValue === 'string') {
          return (value as string[]).some(v =>
            typeof v === 'string' && fieldValue.toLowerCase() === v.toLowerCase()
          );
        }
        return (value as unknown[]).includes(fieldValue);
      }
      return false;

    case 'notIn':
      if (Array.isArray(value)) {
        if (typeof fieldValue === 'string') {
          return !(value as string[]).some(v =>
            typeof v === 'string' && fieldValue.toLowerCase() === v.toLowerCase()
          );
        }
        return !(value as unknown[]).includes(fieldValue);
      }
      return true;

    case 'greaterThan':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;

    case 'lessThan':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;

    case 'greaterThanOrEqual':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue >= value;

    case 'lessThanOrEqual':
      return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue <= value;

    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        if (typeof fieldValue === 'number') {
          return fieldValue >= value[0] && fieldValue <= value[1];
        }
        // Date between
        const fieldDate = new Date(fieldValue).getTime();
        const startDate = new Date(value[0]).getTime();
        const endDate = new Date(value[1]).getTime();
        return fieldDate >= startDate && fieldDate <= endDate;
      }
      return false;

    case 'before':
      const beforeDate = new Date(fieldValue).getTime();
      const beforeTarget = new Date(value as string).getTime();
      return beforeDate < beforeTarget;

    case 'after':
      const afterDate = new Date(fieldValue).getTime();
      const afterTarget = new Date(value as string).getTime();
      return afterDate > afterTarget;

    case 'inLast':
      const now = Date.now();
      const fieldTime = new Date(fieldValue).getTime();
      const daysAgo = now - (value as number) * 24 * 60 * 60 * 1000;
      return fieldTime >= daysAgo;

    case 'isTrue':
      return fieldValue === true;

    case 'isFalse':
      return fieldValue === false;

    default:
      return true;
  }
}

/**
 * Evaluate a condition group against a data row
 */
function evaluateConditionGroup(group: QueryConditionGroup, row: any): boolean {
  const conditionResults = group.conditions
    .filter(c => c.fieldId && c.value !== '') // Only evaluate complete conditions
    .map(condition => evaluateCondition(condition, row));

  if (conditionResults.length === 0) return true;

  return group.logicalOperator === 'AND'
    ? conditionResults.every(Boolean)
    : conditionResults.some(Boolean);
}

/**
 * Execute a report query and return results
 */
export function executeQuery(query: ReportQuery): ReportResults {
  const { entityType, groups, groupOperator } = query;

  // Get raw data
  const rawData = getRawDataForEntity(entityType);

  // Filter rows based on query conditions
  const filteredRows = rawData.filter(row => {
    const groupResults = groups.map(group => evaluateConditionGroup(group, row));

    // If no valid groups, return all
    if (groupResults.length === 0) return true;

    return groupOperator === 'AND'
      ? groupResults.every(Boolean)
      : groupResults.some(Boolean);
  });

  // Transform to result rows
  const rows: ReportResultRow[] = filteredRows.map(row => ({
    id: row.id || `row-${Math.random().toString(36).substr(2, 9)}`,
    ...row,
  }));

  return {
    columns: getColumnsForEntity(entityType),
    rows,
    totalCount: rows.length,
    executedAt: new Date().toISOString(),
  };
}

// ============================================
// Aggregation Engine (Advanced Mode)
// ============================================

/**
 * Map GroupByDimension to actual field names
 */
function getGroupByField(dimension: GroupByDimension): string {
  const fieldMap: Record<GroupByDimension, string> = {
    team: 'teamName',
    sprint: 'sprintName',
    assignee: 'assignee',
    issueType: 'issueType',
    status: 'status',
    priority: 'priority',
  };
  return fieldMap[dimension];
}

/**
 * Group rows by specified dimensions
 */
function groupByDimensions(
  rows: any[],
  groupBy: GroupByDimension[]
): Map<string, any[]> {
  const groups = new Map<string, any[]>();

  rows.forEach(row => {
    // Create a composite key from all group-by fields
    const keyParts = groupBy.map(dim => {
      const field = getGroupByField(dim);
      return String(row[field] || 'Unknown');
    });
    const key = keyParts.join('|');

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  return groups;
}

/**
 * Calculate a single aggregate value
 */
function calculateAggregate(
  rows: any[],
  field: AggregateField
): number {
  const { sourceField, function: func, whereCondition } = field;

  switch (func) {
    case 'COUNT':
      return rows.length;

    case 'SUM': {
      const values = rows.map(r => Number(r[sourceField]) || 0);
      return values.reduce((a, b) => a + b, 0);
    }

    case 'AVG': {
      const values = rows.map(r => Number(r[sourceField]) || 0);
      return values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    }

    case 'MIN': {
      const values = rows.map(r => Number(r[sourceField])).filter(v => !isNaN(v));
      return values.length > 0 ? Math.min(...values) : 0;
    }

    case 'MAX': {
      const values = rows.map(r => Number(r[sourceField])).filter(v => !isNaN(v));
      return values.length > 0 ? Math.max(...values) : 0;
    }

    case 'PERCENT_WHERE': {
      if (!whereCondition || rows.length === 0) return 0;
      const matchingCount = rows.filter(row => evaluateCondition(whereCondition, row)).length;
      return (matchingCount / rows.length) * 100;
    }

    default:
      return 0;
  }
}

/**
 * Apply having conditions to aggregated results
 */
function applyHavingConditions(
  aggregatedRows: any[],
  conditions: HavingCondition[]
): any[] {
  if (!conditions || conditions.length === 0) return aggregatedRows;

  return aggregatedRows.filter(row => {
    return conditions.every(condition => {
      const fieldValue = row[condition.aggregateFieldId];
      if (typeof fieldValue !== 'number') return false;

      switch (condition.operator) {
        case 'greaterThan':
          return fieldValue > condition.value;
        case 'lessThan':
          return fieldValue < condition.value;
        case 'greaterThanOrEqual':
          return fieldValue >= condition.value;
        case 'lessThanOrEqual':
          return fieldValue <= condition.value;
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        default:
          return true;
      }
    });
  });
}

/**
 * Execute an advanced query with aggregation
 */
export function executeAdvancedQuery(query: ReportQuery): ReportResults {
  const { entityType, groups, groupOperator, groupBy, aggregateFields, havingConditions } = query;

  // If not advanced mode or no aggregation, fall back to simple query
  if (!groupBy || groupBy.length === 0 || !aggregateFields || aggregateFields.length === 0) {
    return executeQuery(query);
  }

  // Get raw data
  const rawData = getRawDataForEntity(entityType);

  // Apply WHERE conditions first
  const filteredRows = rawData.filter(row => {
    const groupResults = groups.map(group => evaluateConditionGroup(group, row));
    if (groupResults.length === 0) return true;
    return groupOperator === 'AND'
      ? groupResults.every(Boolean)
      : groupResults.some(Boolean);
  });

  // Group by specified dimensions
  const groupedData = groupByDimensions(filteredRows, groupBy);

  // Calculate aggregates for each group
  const aggregatedRows: ReportResultRow[] = [];
  let rowIndex = 0;

  groupedData.forEach((groupRows, key) => {
    const keyParts = key.split('|');
    const row: ReportResultRow = {
      id: `agg-${rowIndex++}`,
    };

    // Add group-by dimension values
    groupBy.forEach((dim, i) => {
      row[getGroupByField(dim)] = keyParts[i];
    });

    // Add row count
    row._count = groupRows.length;

    // Calculate each aggregate field
    aggregateFields.forEach(field => {
      const value = calculateAggregate(groupRows, field);
      row[field.alias || field.id] = Math.round(value * 100) / 100; // Round to 2 decimals
    });

    aggregatedRows.push(row);
  });

  // Apply HAVING conditions
  const finalRows = applyHavingConditions(aggregatedRows, havingConditions || []);

  // Build column definitions for aggregated results
  const columns: ReportColumnDefinition[] = [
    // Group-by columns first
    ...groupBy.map(dim => ({
      id: getGroupByField(dim),
      label: dim.charAt(0).toUpperCase() + dim.slice(1),
      type: 'string' as const,
      sortable: true,
      filterable: false,
    })),
    // Count column
    {
      id: '_count',
      label: 'Count',
      type: 'number' as const,
      sortable: true,
      filterable: false,
    },
    // Aggregate columns
    ...aggregateFields.map(field => ({
      id: field.alias || field.id,
      label: field.alias || `${field.function}(${field.sourceField})`,
      type: 'number' as const,
      sortable: true,
      filterable: false,
    })),
  ];

  return {
    columns,
    rows: finalRows,
    totalCount: finalRows.length,
    executedAt: new Date().toISOString(),
  };
}

// ============================================
// Health Report Execution
// ============================================

/**
 * Execute a pre-defined health report
 */
export function executeHealthReport(report: HealthReport): ReportResults {
  // This function is kept for backwards compatibility but delegates to generateCrossTeamReportData
  return generateCrossTeamReportData(report);
}

// ============================================
// Cross-Team Report Data Generation
// For Jira Health Reports based on indicators
// ============================================

/**
 * Generate cross-team aggregated data for a Jira health report
 * Maps indicator IDs to their corresponding data filters
 */
export function generateCrossTeamReportData(report: JiraHealthReport): ReportResults {
  const { indicatorId, reportType } = report;

  // Get base data based on report type
  const issues = getMockIssues();
  const sprints = getMockSprints();

  // Filter based on indicator ID
  let filteredRows: any[] = [];
  let columns: ReportColumnDefinition[] = [];

  switch (indicatorId) {
    // Issue Hygiene Reports
    case 'siloedWorkItems':
      // Issues with only one contributor
      filteredRows = issues.filter(i =>
        i.status === 'Done' && i.contributorCount === 1
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'assignee', 'status']);
      break;

    case 'staleWorkItems':
      // Issues not updated in 14+ days
      filteredRows = issues.filter(i =>
        i.status !== 'Done' && i.daysStale > 14
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'daysStale', 'assignee']);
      break;

    case 'staleEpics':
      // Epics not updated in 30+ days
      filteredRows = issues.filter(i =>
        i.issueType === 'Epic' && i.daysStale > 30
      );
      columns = getIssueColumns(['issueKey', 'summary', 'teamName', 'status', 'daysStale', 'epicCompletionPercent']);
      break;

    case 'estimates':
      // Estimable issues without estimates
      filteredRows = issues.filter(i =>
        ['Story', 'Bug', 'Task'].includes(i.issueType) && !i.hasEstimate
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'assignee']);
      break;

    case 'acceptanceCriteria':
      // Issues without acceptance criteria
      filteredRows = issues.filter(i =>
        ['Story', 'Bug'].includes(i.issueType) && !i.hasAcceptanceCriteria
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'assignee']);
      break;

    case 'linksToIssues':
      // Unlinked issues
      filteredRows = issues.filter(i => !i.hasLinks);
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'assignee']);
      break;

    case 'parentEpic':
      // Issues without parent epic
      filteredRows = issues.filter(i =>
        ['Story', 'Bug', 'Task'].includes(i.issueType) && !i.hasParentEpic
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'sprintName']);
      break;

    case 'assignee':
      // Unassigned issues
      filteredRows = issues.filter(i =>
        !i.assignee || i.assignee === 'Unassigned'
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'priority', 'sprintName']);
      break;

    case 'dueDate':
      // Issues without due date
      filteredRows = issues.filter(i =>
        !i.hasDueDate && ['Story', 'Bug'].includes(i.issueType)
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'priority']);
      break;

    case 'prioritySet':
      // Issues with default priority
      filteredRows = issues.filter(i =>
        i.priority === 'Medium' || !i.priority
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'priority']);
      break;

    case 'inProgressWithoutAssignee':
      // In-progress issues without assignee
      filteredRows = issues.filter(i =>
        i.status === 'In Progress' && (!i.assignee || i.assignee === 'Unassigned')
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'daysInStatus']);
      break;

    case 'blockersWithoutDescription':
      // Blocker issues without description
      filteredRows = issues.filter(i =>
        i.priority === 'Highest' && !i.hasDescription
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'priority', 'assignee']);
      break;

    // Sprint Hygiene Reports
    case 'sprintsWithoutGoals':
      // Sprints without goals
      filteredRows = sprints.filter(s => !s.hasGoal);
      columns = getSprintColumns(['sprintName', 'teamName', 'state', 'issueCount', 'startDate', 'endDate']);
      break;

    case 'workCarriedOver':
      // Issues carried over from previous sprints
      filteredRows = issues.filter(i => i.wasCarriedOver);
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'sprintName', 'carryOverCount']);
      break;

    case 'lastDayCompletions':
      // Issues completed on the last day of sprint
      filteredRows = issues.filter(i => i.completedOnLastDay);
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'sprintName', 'assignee']);
      break;

    // Epic Health Reports
    case 'unresolvedEpicChildren':
    case 'epicsWithUnresolvedChildren':
      // Epics marked as done with open children
      filteredRows = issues.filter(i =>
        i.issueType === 'Epic' &&
        ['Done', 'Closed'].includes(i.status) &&
        i.hasUnresolvedChildren
      );
      columns = getIssueColumns(['issueKey', 'summary', 'teamName', 'status', 'unresolvedChildCount', 'epicCompletionPercent']);
      break;

    // Collaboration Reports
    case 'closedWithoutComments':
      // Issues closed without any comments
      filteredRows = issues.filter(i =>
        i.status === 'Done' && i.commentCount === 0
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'assignee', 'leadTime']);
      break;

    case 'sentBackWithoutComments':
      // Issues sent back without comments
      filteredRows = issues.filter(i => i.wasSentBack && !i.hasSentBackComment);
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'assignee', 'sentBackCount']);
      break;

    // Data Freshness Reports
    case 'bulkChanges':
      // Issues updated in bulk operations
      filteredRows = issues.filter(i => i.wasBulkUpdated);
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'status', 'updated']);
      break;

    case 'staleInProgressWork':
      // In-progress issues not updated recently
      filteredRows = issues.filter(i =>
        i.status === 'In Progress' && i.daysStale > 7
      );
      columns = getIssueColumns(['issueKey', 'summary', 'issueType', 'teamName', 'assignee', 'daysStale', 'daysInStatus']);
      break;

    default:
      // Default: return empty results
      filteredRows = [];
      columns = [];
  }

  // Transform to result rows with IDs
  const rows: ReportResultRow[] = filteredRows.map((row, index) => ({
    id: row.id || row.issueKey || row.sprintId || `row-${index}`,
    ...row,
  }));

  return {
    columns,
    rows,
    totalCount: rows.length,
    executedAt: new Date().toISOString(),
  };
}

/**
 * Get issue column definitions for specified columns
 */
function getIssueColumns(columnIds: string[]): ReportColumnDefinition[] {
  const allIssueColumns: Record<string, ReportColumnDefinition> = {
    issueKey: { id: 'issueKey', label: 'Key', type: 'string', sortable: true, filterable: true },
    summary: { id: 'summary', label: 'Summary', type: 'string', sortable: false, filterable: false },
    issueType: { id: 'issueType', label: 'Type', type: 'enum', sortable: true, filterable: true },
    status: { id: 'status', label: 'Status', type: 'enum', sortable: true, filterable: true },
    priority: { id: 'priority', label: 'Priority', type: 'enum', sortable: true, filterable: true },
    assignee: { id: 'assignee', label: 'Assignee', type: 'string', sortable: true, filterable: true },
    teamName: { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
    sprintName: { id: 'sprintName', label: 'Sprint', type: 'string', sortable: true, filterable: false },
    daysStale: { id: 'daysStale', label: 'Days Stale', type: 'number', sortable: true, filterable: true },
    daysInStatus: { id: 'daysInStatus', label: 'Days in Status', type: 'number', sortable: true, filterable: true },
    leadTime: { id: 'leadTime', label: 'Lead Time', type: 'number', sortable: true, filterable: true },
    estimatePoints: { id: 'estimatePoints', label: 'Points', type: 'number', sortable: true, filterable: true },
    epicCompletionPercent: { id: 'epicCompletionPercent', label: 'Epic %', type: 'number', sortable: true, filterable: true },
    unresolvedChildCount: { id: 'unresolvedChildCount', label: 'Unresolved Children', type: 'number', sortable: true, filterable: true },
    carryOverCount: { id: 'carryOverCount', label: 'Times Carried', type: 'number', sortable: true, filterable: true },
    sentBackCount: { id: 'sentBackCount', label: 'Times Sent Back', type: 'number', sortable: true, filterable: true },
    updated: { id: 'updated', label: 'Updated', type: 'date', sortable: true, filterable: false },
  };

  return columnIds
    .map(id => allIssueColumns[id])
    .filter((col): col is ReportColumnDefinition => col !== undefined);
}

/**
 * Get sprint column definitions for specified columns
 */
function getSprintColumns(columnIds: string[]): ReportColumnDefinition[] {
  const allSprintColumns: Record<string, ReportColumnDefinition> = {
    sprintName: { id: 'sprintName', label: 'Sprint', type: 'string', sortable: true, filterable: true },
    teamName: { id: 'teamName', label: 'Team', type: 'string', sortable: true, filterable: true },
    state: { id: 'state', label: 'State', type: 'enum', sortable: true, filterable: true },
    hasGoal: { id: 'hasGoal', label: 'Has Goal', type: 'boolean', sortable: true, filterable: true },
    issueCount: { id: 'issueCount', label: 'Issues', type: 'number', sortable: true, filterable: true },
    completedCount: { id: 'completedCount', label: 'Completed', type: 'number', sortable: true, filterable: true },
    totalPoints: { id: 'totalPoints', label: 'Points', type: 'number', sortable: true, filterable: true },
    completedPoints: { id: 'completedPoints', label: 'Completed Pts', type: 'number', sortable: true, filterable: true },
    startDate: { id: 'startDate', label: 'Start', type: 'date', sortable: true, filterable: false },
    endDate: { id: 'endDate', label: 'End', type: 'date', sortable: true, filterable: false },
  };

  return columnIds
    .map(id => allSprintColumns[id])
    .filter((col): col is ReportColumnDefinition => col !== undefined);
}
