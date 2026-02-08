// Mock Data Generator for Indicator Drill-Down Reports
// Generates realistic mock data based on indicator type and metadata

import {
  IndicatorResult,
  DimensionResult,
  DrillDownReport,
  IssueListReport,
  SprintListReport,
  VariabilityReport,
  DistributionReport,
  CorrelationReport,
  TimelineReport,
  RatioReport,
  JiraIssue,
  SprintInfo,
  SimilarTeamComparison,
  SprintDataPoint,
  DistributionBucket,
  CorrelationDataPoint,
  TimelineEvent,
  RatioSegment,
} from '../types/assessment';
import { IndicatorMetadata } from './indicatorMetadata';

// Team names for mock data
const TEAM_NAMES = [
  'Alpha Squad', 'Beta Team', 'Core Platform', 'Data Pipeline', 'Edge Services',
  'Frontend Guild', 'Growth Team', 'Horizon Squad', 'Infrastructure', 'Journey Team',
  'Kernel Dev', 'Lighthouse', 'Mobile Core', 'Network Ops', 'Observability',
  'Platform Core', 'Quality Team', 'Release Eng', 'Security Squad', 'Testing Guild',
  'UX Engineering', 'Velocity Team', 'Web Platform', 'XP Team', 'Yield Optimization',
  'Zeus Team', 'Agile Squad', 'Build Team', 'Cloud Ops', 'DevOps Core',
  'Enterprise Apps', 'Feature Team', 'Governance', 'Hybrid Cloud', 'Integration',
  'Just-in-Time', 'Kubernetes Ops', 'Legacy Migration', 'Microservices', 'Native Apps',
  'Orchestration', 'Product Platform', 'QA Automation', 'Runtime Team', 'Scalability',
  'Tooling Team', 'User Platform',
];

// Issue summaries for mock data
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
];

const ISSUE_TYPES = ['Story', 'Bug', 'Task', 'Sub-task', 'Epic'];
const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
const PRIORITIES = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
const ASSIGNEES = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Kim', null];

// Helper functions
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(1, daysAgo));
  return date.toISOString();
};

// Generate similar team comparisons
const generateSimilarTeams = (
  yourValue: number,
  teamCount: number,
  higherIsBetter: boolean
): SimilarTeamComparison[] => {
  const teams: SimilarTeamComparison[] = [];
  const yourRank = randomInt(1, teamCount);

  // Generate random values for other teams
  const teamValues: { id: string; name: string; value: number }[] = [];

  for (let i = 0; i < teamCount - 1; i++) {
    teamValues.push({
      id: `team-${i}`,
      name: TEAM_NAMES[i % TEAM_NAMES.length],
      value: yourValue + randomFloat(-30, 30),
    });
  }

  // Add your team
  teamValues.push({
    id: 'your-team',
    name: 'Your Team',
    value: yourValue,
  });

  // Sort by value
  teamValues.sort((a, b) => higherIsBetter ? b.value - a.value : a.value - b.value);

  // Assign ranks and percentiles
  teamValues.forEach((team, index) => {
    const rank = index + 1;
    const percentile = Math.round(((teamCount - rank) / (teamCount - 1)) * 100);

    teams.push({
      teamId: team.id,
      teamName: team.name,
      rank,
      value: team.value,
      displayValue: `${team.value.toFixed(1)}%`,
      percentile,
      isYourTeam: team.id === 'your-team',
    });
  });

  return teams;
};

// Generate mock issues for issue list reports
const generateMockIssues = (
  count: number,
  issueListTitle: string
): JiraIssue[] => {
  const issues: JiraIssue[] = [];

  for (let i = 0; i < count; i++) {
    const projectKey = ['PROJ', 'CORE', 'PLAT', 'WEB', 'API'][randomInt(0, 4)];
    const issueNum = randomInt(1000, 9999);

    issues.push({
      issueKey: `${projectKey}-${issueNum}`,
      summary: randomItem(ISSUE_SUMMARIES),
      issueType: randomItem(ISSUE_TYPES),
      status: randomItem(STATUSES),
      assignee: randomItem(ASSIGNEES),
      created: randomDate(90),
      updated: randomDate(30),
      daysStale: issueListTitle.toLowerCase().includes('stale') ? randomInt(7, 60) : undefined,
      priority: randomItem(PRIORITIES),
      estimatePoints: randomInt(1, 13),
      linkedIssueCount: randomInt(0, 5),
      hasAcceptanceCriteria: Math.random() > 0.3,
      hasDueDate: Math.random() > 0.4,
      hasParentEpic: Math.random() > 0.2,
      sprintName: `Sprint ${randomInt(20, 30)}`,
      labels: Math.random() > 0.5 ? ['needs-review', 'technical-debt'] : [],
    });
  }

  return issues;
};

// Generate Issue List Report
const generateIssueListReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): IssueListReport => {
  const matchingCount = Math.round((indicator.value / 100) * randomInt(80, 150));
  const totalIssues = randomInt(100, 200);

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'issueList',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    yourIssues: generateMockIssues(matchingCount, metadata.issueListTitle || indicator.name),
    yourMatchingCount: matchingCount,
    yourTotalIssues: totalIssues,
    yourPercentage: (matchingCount / totalIssues) * 100,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    issueListTitle: metadata.issueListTitle || indicator.name,
  };
};

// Generate Sprint List Report
const generateSprintListReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): SprintListReport => {
  const totalSprints = randomInt(12, 24);
  const matchingCount = Math.round((indicator.value / 100) * totalSprints);

  const sprints: SprintInfo[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - (totalSprints * 14)); // Go back in time

  for (let i = 0; i < matchingCount; i++) {
    const sprintDate = new Date(baseDate);
    sprintDate.setDate(sprintDate.getDate() + (i * 14)); // 2-week sprints
    const endDate = new Date(sprintDate);
    endDate.setDate(endDate.getDate() + 13);

    const issueCount = randomInt(15, 40);
    const completedCount = randomInt(Math.floor(issueCount * 0.6), issueCount);

    sprints.push({
      sprintId: `sprint-${i + 1}`,
      sprintName: `Sprint ${i + 1}`,
      sprintGoal: null, // These are sprints WITHOUT goals for this indicator
      startDate: sprintDate.toISOString(),
      endDate: endDate.toISOString(),
      state: i === totalSprints - 1 ? 'active' : 'closed',
      issueCount,
      completedCount,
      carriedOverCount: randomInt(0, 5),
      totalPoints: randomInt(30, 80),
      completedPoints: randomInt(20, 70),
    });
  }

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'sprintList',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    yourSprints: sprints,
    yourMatchingCount: matchingCount,
    yourTotalSprints: totalSprints,
    yourPercentage: (matchingCount / totalSprints) * 100,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    sprintListTitle: metadata.sprintListTitle || indicator.name,
  };
};

// Generate Variability Report
const generateVariabilityReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): VariabilityReport => {
  const sprintData: SprintDataPoint[] = [];
  const baseValue = indicator.value;

  for (let i = 0; i < 6; i++) {
    const yourValue = baseValue + randomFloat(-15, 15);
    const benchmarkValue = baseValue * 0.8 + randomFloat(-10, 10);

    sprintData.push({
      sprintName: `Sprint ${20 + i}`,
      sprintNumber: 20 + i,
      yourValue,
      benchmarkValue,
      benchmarkMin: benchmarkValue - randomFloat(5, 15),
      benchmarkMax: benchmarkValue + randomFloat(5, 15),
    });
  }

  const yourValues = sprintData.map(d => d.yourValue);
  const yourMean = yourValues.reduce((a, b) => a + b, 0) / yourValues.length;
  const yourVariance = yourValues.reduce((sum, v) => sum + Math.pow(v - yourMean, 2), 0) / yourValues.length;
  const yourStd = Math.sqrt(yourVariance);

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'variability',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    yourSprintData: sprintData,
    yourMean,
    yourStandardDeviation: yourStd,
    yourCoefficientOfVariation: yourStd / yourMean,
    benchmarkMean: yourMean * 0.85,
    benchmarkStandardDeviation: yourStd * 0.7,
    benchmarkCoefficientOfVariation: (yourStd * 0.7) / (yourMean * 0.85),
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    metricName: metadata.metricName || indicator.name,
    unit: indicator.unit,
  };
};

// Generate Distribution Report
const generateDistributionReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): DistributionReport => {
  const buckets: DistributionBucket[] = [
    { label: '0-2 pts', rangeMin: 0, rangeMax: 2, yourCount: randomInt(5, 15), yourPercentage: 0, benchmarkPercentage: 12 },
    { label: '3-5 pts', rangeMin: 3, rangeMax: 5, yourCount: randomInt(20, 40), yourPercentage: 0, benchmarkPercentage: 35 },
    { label: '6-8 pts', rangeMin: 6, rangeMax: 8, yourCount: randomInt(15, 30), yourPercentage: 0, benchmarkPercentage: 28 },
    { label: '9-13 pts', rangeMin: 9, rangeMax: 13, yourCount: randomInt(8, 20), yourPercentage: 0, benchmarkPercentage: 18 },
    { label: '14+ pts', rangeMin: 14, rangeMax: 100, yourCount: randomInt(2, 10), yourPercentage: 0, benchmarkPercentage: 7 },
  ];

  const totalCount = buckets.reduce((sum, b) => sum + b.yourCount, 0);
  buckets.forEach(bucket => {
    bucket.yourPercentage = (bucket.yourCount / totalCount) * 100;
  });

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'distribution',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    buckets,
    yourMedian: 5,
    yourMean: 5.8,
    yourMode: '3-5 pts',
    benchmarkMedian: 5,
    benchmarkMean: 5.2,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    distributionTitle: metadata.distributionTitle || indicator.name,
    xAxisLabel: metadata.xAxisLabel || 'Value',
    yAxisLabel: metadata.yAxisLabel || 'Count',
  };
};

// Generate Correlation Report
const generateCorrelationReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): CorrelationReport => {
  const dataPoints: CorrelationDataPoint[] = [];

  for (let i = 0; i < 50; i++) {
    const x = randomFloat(1, 20);
    // Add some correlation with noise
    const y = x * 0.5 + randomFloat(-5, 5);

    dataPoints.push({
      issueKey: `PROJ-${randomInt(1000, 9999)}`,
      xValue: x,
      yValue: Math.max(1, y),
      label: randomItem(ISSUE_SUMMARIES).slice(0, 30),
    });
  }

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'correlation',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    dataPoints,
    yourCorrelationCoefficient: randomFloat(0.3, 0.7),
    benchmarkCorrelationCoefficient: randomFloat(0.5, 0.8),
    yourRSquared: randomFloat(0.1, 0.5),
    trendlineSlope: 0.5,
    trendlineIntercept: 2,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    xAxisLabel: metadata.xAxisLabel || 'X Value',
    yAxisLabel: metadata.yAxisLabel || 'Y Value',
    correlationTitle: metadata.correlationTitle || indicator.name,
  };
};

// Generate Timeline Report
const generateTimelineReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): TimelineReport => {
  const events: TimelineEvent[] = [];

  for (let i = 0; i < 30; i++) {
    events.push({
      issueKey: `PROJ-${randomInt(1000, 9999)}`,
      summary: randomItem(ISSUE_SUMMARIES),
      eventDate: randomDate(60),
      durationDays: randomInt(1, 14),
      category: randomItem(['Bug', 'Story', 'Task']),
    });
  }

  // Sort by duration
  events.sort((a, b) => b.durationDays - a.durationDays);

  const durations = events.map(e => e.durationDays);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const sorted = [...durations].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'timeline',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    events,
    yourAverageDays: avg,
    yourMedianDays: median,
    benchmarkAverageDays: avg * 0.7,
    benchmarkMedianDays: median * 0.75,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    timelineTitle: metadata.timelineTitle || indicator.name,
  };
};

// Generate Ratio Report
const generateRatioReport = (
  indicator: IndicatorResult,
  metadata: IndicatorMetadata,
  teamCount: number
): RatioReport => {
  const segments: RatioSegment[] = [
    { label: 'Stories', yourValue: randomInt(30, 50), yourPercentage: 0, benchmarkPercentage: 45, color: '#0052CC' },
    { label: 'Bugs', yourValue: randomInt(15, 25), yourPercentage: 0, benchmarkPercentage: 20, color: '#DE350B' },
    { label: 'Tasks', yourValue: randomInt(20, 35), yourPercentage: 0, benchmarkPercentage: 25, color: '#00875A' },
    { label: 'Other', yourValue: randomInt(5, 15), yourPercentage: 0, benchmarkPercentage: 10, color: '#6B778C' },
  ];

  const total = segments.reduce((sum, s) => sum + s.yourValue, 0);
  segments.forEach(segment => {
    segment.yourPercentage = (segment.yourValue / total) * 100;
  });

  return {
    indicatorId: indicator.id,
    indicatorName: indicator.name,
    reportType: 'ratio',
    generatedAt: new Date().toISOString(),
    description: metadata.description,
    segments,
    yourTotal: total,
    yourRatio: indicator.value / 100,
    yourDisplayRatio: `${indicator.value.toFixed(1)}%`,
    benchmarkRatio: indicator.benchmarkValue / 100,
    benchmarkDisplayRatio: `${indicator.benchmarkValue.toFixed(1)}%`,
    similarTeams: generateSimilarTeams(indicator.value, teamCount, indicator.higherIsBetter),
    ratioTitle: metadata.ratioTitle || indicator.name,
  };
};

// Main function to generate drill-down report based on type
export const generateDrillDownReport = (
  indicator: IndicatorResult,
  dimension: DimensionResult,
  metadata: IndicatorMetadata,
  teamCount: number
): DrillDownReport => {
  switch (metadata.reportType) {
    case 'issueList':
      return generateIssueListReport(indicator, metadata, teamCount);
    case 'sprintList':
      return generateSprintListReport(indicator, metadata, teamCount);
    case 'variability':
      return generateVariabilityReport(indicator, metadata, teamCount);
    case 'distribution':
      return generateDistributionReport(indicator, metadata, teamCount);
    case 'correlation':
      return generateCorrelationReport(indicator, metadata, teamCount);
    case 'timeline':
      return generateTimelineReport(indicator, metadata, teamCount);
    case 'ratio':
      return generateRatioReport(indicator, metadata, teamCount);
    default:
      return generateIssueListReport(indicator, metadata, teamCount);
  }
};
