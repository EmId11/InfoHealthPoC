// Indicator Metadata - Maps indicators to their drill-down report types
// This file defines the report type for each indicator across all dimensions

import { DrillDownReportType } from '../types/assessment';

export interface IndicatorMetadata {
  id: string;
  reportType: DrillDownReportType;
  issueListTitle?: string;      // For issueList reports
  sprintListTitle?: string;     // For sprintList reports
  metricName?: string;          // For variability reports
  distributionTitle?: string;   // For distribution reports
  correlationTitle?: string;    // For correlation reports
  timelineTitle?: string;       // For timeline reports
  ratioTitle?: string;          // For ratio reports
  xAxisLabel?: string;          // For charts
  yAxisLabel?: string;          // For charts
  description: string;          // Drill-down description
}

// ============================================
// Dimension 0: Data Integrity
// ============================================

const dataIntegrityIndicators: IndicatorMetadata[] = [
  // Story field findings
  {
    id: 'story-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Stories with Placeholder Descriptions',
    description: 'Stories where the description contains TBD, TODO, or template-only content.',
  },
  {
    id: 'story-description-duplicate',
    reportType: 'issueList',
    issueListTitle: 'Stories with Duplicate Descriptions',
    description: 'Stories sharing near-identical description text with other issues.',
  },
  {
    id: 'story-acceptanceCriteria-format',
    reportType: 'issueList',
    issueListTitle: 'Stories Missing Given/When/Then',
    description: 'Stories where Acceptance Criteria does not follow the required Given/When/Then format.',
  },
  {
    id: 'story-storyPoints-clustering',
    reportType: 'distribution',
    distributionTitle: 'Story Point Value Distribution',
    xAxisLabel: 'Story Points',
    yAxisLabel: 'Count',
    description: 'Distribution of story point values showing clustering on a single number.',
  },
  {
    id: 'story-storyPoints-nonstandard',
    reportType: 'distribution',
    distributionTitle: 'Story Points: Fibonacci vs Non-Fibonacci',
    xAxisLabel: 'Story Points',
    yAxisLabel: 'Count',
    description: 'Story point values that fall outside the Fibonacci sequence.',
  },
  {
    id: 'story-priority-default',
    reportType: 'issueList',
    issueListTitle: 'Stories with Default Priority',
    description: 'Stories where Priority remains at the system default "Medium".',
  },
  {
    id: 'story-assignee-inactive',
    reportType: 'issueList',
    issueListTitle: 'Stories Assigned to Inactive Users',
    description: 'Stories assigned to deactivated or departed users.',
  },
  {
    id: 'story-labels-empty',
    reportType: 'issueList',
    issueListTitle: 'Stories with Empty Labels',
    description: 'Stories with no labels or only a single generic label.',
  },

  // Bug field findings
  {
    id: 'bug-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Placeholder Descriptions',
    description: 'Bugs where the description contains placeholder text.',
  },
  {
    id: 'bug-stepsToReproduce-hollow',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Missing Reproduction Steps',
    description: 'Bugs where Steps to Reproduce is empty or contains only placeholder text.',
  },
  {
    id: 'bug-stepsToReproduce-duplicate',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Duplicate Reproduction Steps',
    description: 'Bugs sharing near-identical Steps to Reproduce text.',
  },
  {
    id: 'bug-storyPoints-clustering',
    reportType: 'distribution',
    distributionTitle: 'Bug Story Point Distribution',
    xAxisLabel: 'Story Points',
    yAxisLabel: 'Count',
    description: 'Distribution of bug story point values showing clustering patterns.',
  },
  {
    id: 'bug-priority-default',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Default Priority',
    description: 'Bugs where Priority remains at the system default.',
  },
  {
    id: 'bug-environment-default',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Default Environment',
    description: 'Bugs where Environment is left at the system default.',
  },
  {
    id: 'bug-assignee-inactive',
    reportType: 'issueList',
    issueListTitle: 'Bugs Assigned to Inactive Users',
    description: 'Bugs assigned to deactivated or departed users.',
  },
  {
    id: 'bug-components-empty',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Missing Components',
    description: 'Bugs with no component selected for routing and categorization.',
  },

  // Task field findings
  {
    id: 'task-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Placeholder Descriptions',
    description: 'Tasks where the description contains placeholder text.',
  },
  {
    id: 'task-description-short',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Short Descriptions',
    description: 'Tasks where the description is below the 50-character minimum.',
  },
  {
    id: 'task-storyPoints-empty',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Zero Story Points',
    description: 'Tasks where Story Points is set to 0.',
  },
  {
    id: 'task-priority-default',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Default Priority',
    description: 'Tasks where Priority remains at the system default.',
  },
  {
    id: 'task-assignee-inactive',
    reportType: 'issueList',
    issueListTitle: 'Tasks Assigned to Inactive Users',
    description: 'Tasks assigned to deactivated or departed users.',
  },
  {
    id: 'task-duedate-empty',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Missing Due Date',
    description: 'Tasks with no due date set.',
  },

  // Epic field findings
  {
    id: 'epic-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Epics with Placeholder Descriptions',
    description: 'Epics where the description contains placeholder text.',
  },
  {
    id: 'epic-description-duplicate',
    reportType: 'issueList',
    issueListTitle: 'Epics with Duplicate Descriptions',
    description: 'Epics sharing near-identical description text.',
  },
  {
    id: 'epic-targetDate-empty',
    reportType: 'issueList',
    issueListTitle: 'Epics with Missing Target Date',
    description: 'Epics with no Target Date set for roadmap alignment.',
  },
  {
    id: 'epic-businessPriority-cardinality',
    reportType: 'ratio',
    ratioTitle: 'Business Priority Value Distribution',
    description: 'Business Priority field uses only a small fraction of available values.',
  },
  {
    id: 'epic-priority-default',
    reportType: 'issueList',
    issueListTitle: 'Epics with Default Priority',
    description: 'Epics where Priority remains at the system default.',
  },
  {
    id: 'epic-assignee-inactive',
    reportType: 'issueList',
    issueListTitle: 'Epics Assigned to Inactive Users',
    description: 'Epics assigned to deactivated or departed users.',
  },

  // Risk field findings
  {
    id: 'risk-mitigationStrategy-hollow',
    reportType: 'issueList',
    issueListTitle: 'Risks with Placeholder Mitigation Strategy',
    description: 'Risks where the Mitigation Strategy contains TBD, TODO, or template-only content.',
  },
  {
    id: 'risk-probability-default',
    reportType: 'issueList',
    issueListTitle: 'Risks with Default Probability',
    description: 'Risks where Probability remains at the system default, not reflecting actual likelihood.',
  },
  {
    id: 'risk-impact-default',
    reportType: 'issueList',
    issueListTitle: 'Risks with Default Impact',
    description: 'Risks where Impact remains at the system default, not reflecting actual severity.',
  },
  {
    id: 'risk-riskScore-empty',
    reportType: 'issueList',
    issueListTitle: 'Risks with Empty Risk Score',
    description: 'Risks where Risk Score is 0 or unset, providing no quantitative risk assessment.',
  },
  {
    id: 'risk-riskOwner-inactive',
    reportType: 'issueList',
    issueListTitle: 'Risks with Inactive Risk Owner',
    description: 'Risks assigned to a Risk Owner who is deactivated or departed.',
  },
  {
    id: 'risk-riskCategory-concentration',
    reportType: 'ratio',
    ratioTitle: 'Risk Category Distribution',
    description: 'Risk Category field dominated by a single value, providing no differentiation.',
  },

  // Assumption field findings
  {
    id: 'assumption-impactIfWrong-hollow',
    reportType: 'issueList',
    issueListTitle: 'Assumptions with Placeholder Impact if Wrong',
    description: 'Assumptions where Impact if Wrong contains placeholder text.',
  },
  {
    id: 'assumption-confidenceLevel-default',
    reportType: 'issueList',
    issueListTitle: 'Assumptions with Default Confidence Level',
    description: 'Assumptions where Confidence Level remains at the system default.',
  },
  {
    id: 'assumption-validationStatus-default',
    reportType: 'issueList',
    issueListTitle: 'Assumptions with Default Validation Status',
    description: 'Assumptions where Validation Status remains at the system default.',
  },
  {
    id: 'assumption-validationDate-empty',
    reportType: 'issueList',
    issueListTitle: 'Assumptions with Missing Validation Date',
    description: 'Assumptions with no Validation Date set.',
  },
  {
    id: 'assumption-related-missing',
    reportType: 'issueList',
    issueListTitle: 'Assumptions Missing Related Links',
    description: 'Assumptions that should link to a parent feature or risk but don\'t.',
  },

  // Feature field findings
  {
    id: 'feature-benefitHypothesis-hollow',
    reportType: 'issueList',
    issueListTitle: 'Features with Placeholder Benefit Hypothesis',
    description: 'Features where Benefit Hypothesis contains placeholder or template-only text.',
  },
  {
    id: 'feature-benefitHypothesis-duplicate',
    reportType: 'issueList',
    issueListTitle: 'Features with Duplicate Benefit Hypothesis',
    description: 'Features sharing near-identical Benefit Hypothesis text.',
  },
  {
    id: 'feature-wsjfScore-empty',
    reportType: 'issueList',
    issueListTitle: 'Features with Empty WSJF Score',
    description: 'Features where WSJF Score is 0 or unset.',
  },
  {
    id: 'feature-targetPI-default',
    reportType: 'issueList',
    issueListTitle: 'Features with Default Target PI',
    description: 'Features where Target PI remains at the system default.',
  },
  {
    id: 'feature-featureSize-default',
    reportType: 'issueList',
    issueListTitle: 'Features with Default Feature Size',
    description: 'Features where Feature Size remains at the system default.',
  },
  {
    id: 'feature-description-short',
    reportType: 'issueList',
    issueListTitle: 'Features with Short Descriptions',
    description: 'Features where the description is below the minimum length threshold.',
  },

  // Spike field findings
  {
    id: 'spike-researchQuestion-hollow',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Placeholder Research Question',
    description: 'Spikes where Research Question contains TBD or placeholder text.',
  },
  {
    id: 'spike-timebox-empty',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Empty Time-box',
    description: 'Spikes where Time-box is 0 or unset.',
  },
  {
    id: 'spike-findings-hollow',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Placeholder Findings',
    description: 'Spikes where Findings field contains placeholder text.',
  },
  {
    id: 'spike-decision-default',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Default Decision',
    description: 'Spikes where Decision remains at the system default.',
  },
  {
    id: 'spike-description-short',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Short Descriptions',
    description: 'Spikes where the description is below the minimum length threshold.',
  },

  // Dependency field findings
  {
    id: 'dependency-neededByDate-empty',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Missing Needed By Date',
    description: 'Dependencies with no Needed By Date set.',
  },
  {
    id: 'dependency-providerTeam-default',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Default Provider Team',
    description: 'Dependencies where Provider Team remains at the system default.',
  },
  {
    id: 'dependency-consumerTeam-default',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Default Consumer Team',
    description: 'Dependencies where Consumer Team remains at the system default.',
  },
  {
    id: 'dependency-dependencyType-default',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Default Dependency Type',
    description: 'Dependencies where Dependency Type remains at the system default.',
  },
  {
    id: 'dependency-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Placeholder Descriptions',
    description: 'Dependencies where the description contains placeholder text.',
  },

  // Impediment field findings
  {
    id: 'impediment-resolutionPlan-hollow',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Placeholder Resolution Plan',
    description: 'Impediments where Resolution Plan contains placeholder text.',
  },
  {
    id: 'impediment-severity-default',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Default Severity',
    description: 'Impediments where Severity remains at the system default.',
  },
  {
    id: 'impediment-escalationLevel-default',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Default Escalation Level',
    description: 'Impediments where Escalation Level remains at the system default.',
  },
  {
    id: 'impediment-affectedTeams-empty',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Empty Affected Teams',
    description: 'Impediments with no Affected Teams selected.',
  },
  {
    id: 'impediment-description-short',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Short Descriptions',
    description: 'Impediments where the description is below the minimum length threshold.',
  },

  // Initiative field findings
  {
    id: 'initiative-businessOutcome-hollow',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Placeholder Business Outcome',
    description: 'Initiatives where Business Outcome contains placeholder text.',
  },
  {
    id: 'initiative-strategicTheme-default',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Default Strategic Theme',
    description: 'Initiatives where Strategic Theme remains at the system default.',
  },
  {
    id: 'initiative-targetQuarter-default',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Default Target Quarter',
    description: 'Initiatives where Target Quarter remains at the system default.',
  },
  {
    id: 'initiative-revenueImpact-empty',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Empty Revenue Impact',
    description: 'Initiatives where Expected Revenue Impact is 0 or unset.',
  },
  {
    id: 'initiative-description-hollow',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Placeholder Descriptions',
    description: 'Initiatives where the description contains placeholder text.',
  },
  {
    id: 'initiative-description-duplicate',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Duplicate Descriptions',
    description: 'Initiatives sharing near-identical description text.',
  },

  // Data Freshness — Stale findings
  {
    id: 'freshness-story-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Stories (no activity in 14+ days)',
    description: 'Stories with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-bug-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Bugs (no activity in 7+ days)',
    description: 'Bugs with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-task-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Tasks (no activity in 7+ days)',
    description: 'Tasks with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-epic-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Epics (no activity in 30+ days)',
    description: 'Epics with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-risk-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Risks (no activity in 14+ days)',
    description: 'Risks with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-assumption-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Assumptions (no activity in 14+ days)',
    description: 'Assumptions with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-feature-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Features (no activity in 30+ days)',
    description: 'Features with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-spike-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Spikes (no activity in 7+ days)',
    description: 'Spikes with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-dependency-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Dependencies (no activity in 14+ days)',
    description: 'Dependencies with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-impediment-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Impediments (no activity in 7+ days)',
    description: 'Impediments with no updates in the configured threshold period.',
  },
  {
    id: 'freshness-initiative-stale',
    reportType: 'issueList',
    issueListTitle: 'Stale Initiatives (no activity in 30+ days)',
    description: 'Initiatives with no updates in the configured threshold period.',
  },

  // Data Freshness — Bulk update findings
  {
    id: 'freshness-story-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Stories with Bulk-Updated Fields',
    description: 'Stories where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-bug-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Bugs with Bulk-Updated Fields',
    description: 'Bugs where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-task-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Tasks with Bulk-Updated Fields',
    description: 'Tasks where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-epic-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Epics with Bulk-Updated Fields',
    description: 'Epics where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-risk-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Risks with Bulk-Updated Fields',
    description: 'Risks where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-assumption-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Assumptions with Bulk-Updated Fields',
    description: 'Assumptions where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-feature-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Features with Bulk-Updated Fields',
    description: 'Features where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-spike-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Spikes with Bulk-Updated Fields',
    description: 'Spikes where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-dependency-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Dependencies with Bulk-Updated Fields',
    description: 'Dependencies where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-impediment-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Impediments with Bulk-Updated Fields',
    description: 'Impediments where field changes were part of a bulk operation.',
  },
  {
    id: 'freshness-initiative-bulkUpdated',
    reportType: 'issueList',
    issueListTitle: 'Initiatives with Bulk-Updated Fields',
    description: 'Initiatives where field changes were part of a bulk operation.',
  },

  // Cross-field structural findings
  {
    id: 'cross-status-field-conflicts',
    reportType: 'issueList',
    issueListTitle: 'Issues with Status-Field Conflicts',
    description: 'Issues where status conflicts with other field values (Done with no assignee, In Progress with no estimate).',
  },
  {
    id: 'cross-hierarchy-inconsistency',
    reportType: 'issueList',
    issueListTitle: 'Parent-Child Inconsistencies',
    description: 'Parent issues where child data contradicts parent-level field values.',
  },
  {
    id: 'cross-date-sequence-violations',
    reportType: 'issueList',
    issueListTitle: 'Issues with Date Sequence Violations',
    description: 'Issues where date fields violate logical ordering across fields.',
  },
  {
    id: 'cross-orphaned-references',
    reportType: 'issueList',
    issueListTitle: 'Orphaned and Stale Links',
    description: 'Issue links pointing to deleted, moved, or long-closed targets.',
  },
];

// ============================================
// Dimension 1: Invisible Work
// ============================================

const dimension1Indicators: IndicatorMetadata[] = [
  // Category 1: Dark Matter (variability indicators)
  {
    id: 'throughputVariability',
    reportType: 'variability',
    metricName: 'Throughput',
    description: 'Sprint-by-sprint throughput showing completed items per sprint compared to similar teams.',
  },
  {
    id: 'workflowStageTimeVariability',
    reportType: 'variability',
    metricName: 'Workflow Stage Time',
    description: 'Time spent in each workflow stage per sprint compared to similar teams.',
  },
  {
    id: 'memberThroughputVariability',
    reportType: 'variability',
    metricName: 'Member Throughput',
    description: 'Individual team member throughput variation compared to similar teams.',
  },
  {
    id: 'estimationVariability',
    reportType: 'variability',
    metricName: 'Estimation Accuracy',
    description: 'Variation between estimated and actual effort per sprint.',
  },
  {
    id: 'inProgressItemsVariability',
    reportType: 'variability',
    metricName: 'WIP Count',
    description: 'Work-in-progress item count variation across sprints.',
  },
  {
    id: 'sameSizeTimeVariability',
    reportType: 'variability',
    metricName: 'Same Size Time',
    description: 'Time variation for similarly-sized work items.',
  },
  {
    id: 'collaborationVariability',
    reportType: 'variability',
    metricName: 'Collaboration',
    description: 'Variation in collaboration patterns (comments, transitions) across sprints.',
  },

  // Category 2: Frequent Use (issue list indicators)
  {
    id: 'staleWorkItems',
    reportType: 'issueList',
    issueListTitle: 'Stale Work Items',
    description: 'Work items that haven\'t been updated beyond the configured stale threshold.',
  },
  {
    id: 'staleEpics',
    reportType: 'issueList',
    issueListTitle: 'Stale Epics',
    description: 'Epics that haven\'t been updated beyond the configured stale threshold.',
  },
  {
    id: 'unresolvedEpicChildren',
    reportType: 'issueList',
    issueListTitle: 'Epics with Unresolved Children',
    description: 'Epics marked as done but still have unresolved child issues.',
  },
  {
    id: 'bulkChanges',
    reportType: 'issueList',
    issueListTitle: 'Bulk Changes',
    description: 'Issues that were modified in bulk operations.',
  },
  {
    id: 'avgDailyUpdates',
    reportType: 'ratio',
    ratioTitle: 'Daily Update Frequency',
    description: 'Average number of Jira updates per day compared to similar teams.',
  },
  {
    id: 'frequentUseVariability',
    reportType: 'variability',
    metricName: 'Jira Usage',
    description: 'Variation in Jira usage patterns across sprints.',
  },
  {
    id: 'sprintHygiene',
    reportType: 'ratio',
    ratioTitle: 'Sprint Hygiene Score',
    description: 'Breakdown of sprint hygiene factors.',
  },

  // Category 3: Front Door (issue list indicators)
  {
    id: 'siloedWorkItems',
    reportType: 'issueList',
    issueListTitle: 'Siloed Work Items',
    description: 'Work items that were handled by a single person without collaboration.',
  },
  {
    id: 'midSprintCreations',
    reportType: 'issueList',
    issueListTitle: 'Mid-Sprint Additions',
    description: 'Issues added to sprints after the sprint started.',
  },
  {
    id: 'capacitySplitAcrossProjects',
    reportType: 'ratio',
    ratioTitle: 'Capacity Split Across Projects',
    description: 'How team capacity is distributed across different projects.',
  },
];

// ============================================
// Dimension 2: Jira as Source of Truth
// ============================================

const dimension2Indicators: IndicatorMetadata[] = [
  // Category 2.A: Availability of Key Information
  {
    id: 'acceptanceCriteria',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Acceptance Criteria',
    description: 'Issues that don\'t have acceptance criteria defined.',
  },
  {
    id: 'linksToIssues',
    reportType: 'issueList',
    issueListTitle: 'Unlinked Issues',
    description: 'Issues that don\'t have links to other related issues.',
  },
  {
    id: 'parentEpic',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Parent Epic',
    description: 'Issues that are not linked to a parent epic.',
  },
  {
    id: 'estimates',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Estimates',
    description: 'Estimable issues that don\'t have story points or time estimates.',
  },
  {
    id: 'assignee',
    reportType: 'issueList',
    issueListTitle: 'Unassigned Issues',
    description: 'Issues that don\'t have an assignee.',
  },
  {
    id: 'dueDate',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Due Date',
    description: 'Issues that don\'t have a due date set.',
  },
  {
    id: 'subTasks',
    reportType: 'issueList',
    issueListTitle: 'Large Issues Without Sub-tasks',
    description: 'Large issues (>8 points) that haven\'t been broken into sub-tasks.',
  },
  {
    id: 'prioritySet',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Priority',
    description: 'Issues with default "Normal" priority that may need prioritization.',
  },

  // Category 2.B: Quality of Readiness/Refinement
  {
    id: 'infoAddedAfterCommitment',
    reportType: 'issueList',
    issueListTitle: 'Info Added After Commitment',
    description: 'Issues where key fields were added after work began.',
  },
  {
    id: 'midSprintMissingFields',
    reportType: 'issueList',
    issueListTitle: 'Mid-Sprint Items Missing Key Fields',
    description: 'Issues added mid-sprint that were missing key information.',
  },
  {
    id: 'staleWorkItems',
    reportType: 'issueList',
    issueListTitle: 'Stale In-Progress Items',
    description: 'In-progress items with no updates in over 2 weeks.',
  },
  {
    id: 'bulkChanges',
    reportType: 'issueList',
    issueListTitle: 'Bulk-Updated Issues',
    description: 'Issues where fields were updated in batch rather than individually.',
  },
  {
    id: 'jiraUpdateFrequency',
    reportType: 'timeline',
    timelineTitle: 'Update Frequency Over Time',
    description: 'Average meaningful updates per in-progress issue per day.',
  },
  {
    id: 'fieldUpdateLag',
    reportType: 'timeline',
    timelineTitle: 'Field Population Lag',
    description: 'Days between issue creation and key fields being populated.',
  },
  {
    id: 'descriptionEditFrequency',
    reportType: 'issueList',
    issueListTitle: 'Issues With Description Edits',
    description: 'Issues where the description was updated after initial creation.',
  },
  {
    id: 'timeToStability',
    reportType: 'timeline',
    timelineTitle: 'Time to Priority Stability',
    description: 'Days until issue priority stops changing.',
  },
];

// ============================================
// Dimension 3: Estimation Practices
// ============================================

const dimension3Indicators: IndicatorMetadata[] = [
  // Category 3.A: Estimation Coverage
  {
    id: 'policyExclusions',
    reportType: 'ratio',
    ratioTitle: 'Work by Estimation Policy',
    description: 'Breakdown of work by issue types that do/don\'t require estimation.',
  },
  {
    id: 'storyEstimationRate',
    reportType: 'issueList',
    issueListTitle: 'Stories Without Estimates',
    description: 'Stories that should be estimated but aren\'t.',
  },
  {
    id: 'epicEstimationRate',
    reportType: 'issueList',
    issueListTitle: 'Epics Without Estimates',
    description: 'Epics that should be estimated but aren\'t.',
  },
  {
    id: 'epicRollupCoverage',
    reportType: 'issueList',
    issueListTitle: 'Epics with Low Child Estimation',
    description: 'Epics where less than 50% of children have estimates.',
  },
  {
    id: 'subTaskEstimation',
    reportType: 'issueList',
    issueListTitle: 'Sub-tasks Without Estimates',
    description: 'Sub-tasks that should be estimated but aren\'t.',
  },

  // Category 3.B: Estimate Quality & Reliability
  {
    id: 'storyConsistencyWithin',
    reportType: 'distribution',
    distributionTitle: 'Story Point Distribution (Within Team)',
    xAxisLabel: 'Story Points',
    yAxisLabel: 'Count',
    description: 'Distribution of story point values used within the team.',
  },
  {
    id: 'storyConsistencyAcross',
    reportType: 'distribution',
    distributionTitle: 'Story Point Distribution (vs Similar Teams)',
    xAxisLabel: 'Story Points',
    yAxisLabel: 'Percentage',
    description: 'How your story point distribution compares to similar teams.',
  },
  {
    id: 'epicConsistencyWithin',
    reportType: 'distribution',
    distributionTitle: 'Epic Size Distribution (Within Team)',
    xAxisLabel: 'Epic Size (Points)',
    yAxisLabel: 'Count',
    description: 'Distribution of epic sizes within the team.',
  },
  {
    id: 'epicConsistencyAcross',
    reportType: 'distribution',
    distributionTitle: 'Epic Size Distribution (vs Similar Teams)',
    xAxisLabel: 'Epic Size (Points)',
    yAxisLabel: 'Percentage',
    description: 'How your epic size distribution compares to similar teams.',
  },
  {
    id: 'epicDistribution',
    reportType: 'ratio',
    ratioTitle: 'Work Distribution Across Epics',
    description: 'How work is distributed across epics.',
  },
  {
    id: 'originalEstimateCapture',
    reportType: 'issueList',
    issueListTitle: 'Re-estimated Without Original',
    description: 'Issues that were re-estimated without preserving the original estimate.',
  },
  {
    id: 'reEstimationLearning',
    reportType: 'distribution',
    distributionTitle: 'Re-estimation Accuracy',
    xAxisLabel: 'Estimate Change (%)',
    yAxisLabel: 'Count',
    description: 'How re-estimates compare to original estimates.',
  },

  // Category 3.C: Size Consistency - Non-Estimated Work
  {
    id: 'taskSizeConsistencyWithin',
    reportType: 'distribution',
    distributionTitle: 'Task Duration Distribution (Within Team)',
    xAxisLabel: 'Duration (Days)',
    yAxisLabel: 'Count',
    description: 'Distribution of task durations within the team.',
  },
  {
    id: 'taskSizeConsistencyAcross',
    reportType: 'distribution',
    distributionTitle: 'Task Duration Distribution (vs Similar Teams)',
    xAxisLabel: 'Duration (Days)',
    yAxisLabel: 'Percentage',
    description: 'How your task durations compare to similar teams.',
  },
  {
    id: 'epicDurationConsistencyWithin',
    reportType: 'distribution',
    distributionTitle: 'Epic Duration Distribution (Within Team)',
    xAxisLabel: 'Duration (Days)',
    yAxisLabel: 'Count',
    description: 'Distribution of epic durations within the team.',
  },
  {
    id: 'epicDurationConsistencyAcross',
    reportType: 'distribution',
    distributionTitle: 'Epic Duration Distribution (vs Similar Teams)',
    xAxisLabel: 'Duration (Days)',
    yAxisLabel: 'Percentage',
    description: 'How your epic durations compare to similar teams.',
  },
  {
    id: 'epicConcentration',
    reportType: 'ratio',
    ratioTitle: 'Non-Estimated Work by Epic',
    description: 'Distribution of non-estimated work across epics.',
  },
];

// ============================================
// Dimension 4: Issue Type Usage
// ============================================

const dimension4Indicators: IndicatorMetadata[] = [
  {
    id: 'withinTeamIssueTypeConsistency',
    reportType: 'distribution',
    distributionTitle: 'Issue Type Usage (Within Team)',
    xAxisLabel: 'Issue Type',
    yAxisLabel: 'Percentage',
    description: 'Distribution of issue types used within the team.',
  },
  {
    id: 'acrossTeamIssueTypeConsistency',
    reportType: 'distribution',
    distributionTitle: 'Issue Type Usage (vs Similar Teams)',
    xAxisLabel: 'Issue Type',
    yAxisLabel: 'Percentage',
    description: 'How your issue type usage compares to similar teams.',
  },
  {
    id: 'issueTypeVolumeVariability',
    reportType: 'variability',
    metricName: 'Issue Type Volume',
    description: 'Variation in issue type volumes across sprints.',
  },
  {
    id: 'issueTypeSizeVariability',
    reportType: 'variability',
    metricName: 'Issue Type Size',
    description: 'Variation in issue sizes by type across sprints.',
  },
];

// ============================================
// Dimension 5: Data Freshness
// ============================================

const dimension5Indicators: IndicatorMetadata[] = [
  {
    id: 'staleWorkItems',
    reportType: 'issueList',
    issueListTitle: 'Stale Work Items',
    description: 'Work items that haven\'t been updated beyond the configured threshold.',
  },
  {
    id: 'staleEpics',
    reportType: 'issueList',
    issueListTitle: 'Stale Epics',
    description: 'Epics that haven\'t been updated beyond the configured threshold.',
  },
  {
    id: 'epicsWithUnresolvedChildren',
    reportType: 'issueList',
    issueListTitle: 'Closed Epics with Open Children',
    description: 'Epics marked as resolved but still have open child issues.',
  },
  {
    id: 'bulkChanges',
    reportType: 'issueList',
    issueListTitle: 'Bulk Updated Issues',
    description: 'Issues that were updated in bulk operations.',
  },
  {
    id: 'parentNotDoneAfterChildren',
    reportType: 'issueList',
    issueListTitle: 'Parents Not Done After Children',
    description: 'Parent issues still open after all children were completed.',
  },
  {
    id: 'epicsNotDoneAfterChildren',
    reportType: 'issueList',
    issueListTitle: 'Epics Not Done After Children',
    description: 'Epics still open after all children were completed.',
  },
  {
    id: 'jiraUpdateFrequency',
    reportType: 'ratio',
    ratioTitle: 'Jira Update Frequency',
    description: 'Breakdown of update frequency by day of week and time.',
  },
  {
    id: 'invisibleWorkRiskScore',
    reportType: 'ratio',
    ratioTitle: 'Invisible Work Risk Factors',
    description: 'Breakdown of factors contributing to invisible work risk.',
  },
];

// ============================================
// Dimension 6: Blocker Management
// ============================================

const dimension6Indicators: IndicatorMetadata[] = [
  {
    id: 'blockerToWorkItemRatio',
    reportType: 'ratio',
    ratioTitle: 'Blocker to Work Item Ratio',
    description: 'Ratio of blockers to regular work items.',
  },
  {
    id: 'blockerResolutionTime',
    reportType: 'timeline',
    timelineTitle: 'Blocker Resolution Time',
    description: 'Time taken to resolve blockers.',
  },
  {
    id: 'blockersWithoutDescription',
    reportType: 'issueList',
    issueListTitle: 'Blockers Without Description',
    description: 'Blocker issues that don\'t have a description.',
  },
  {
    id: 'blockerVisibilityAcrossProjects',
    reportType: 'issueList',
    issueListTitle: 'Cross-Project Blockers',
    description: 'Blockers that affect multiple projects.',
  },
];

// ============================================
// Dimension 7: Work Hierarchy
// ============================================

const dimension7Indicators: IndicatorMetadata[] = [
  {
    id: 'issuesNotLinkedToEpics',
    reportType: 'issueList',
    issueListTitle: 'Issues Not Linked to Epics',
    description: 'Issues that should be linked to an epic but aren\'t.',
  },
];

// ============================================
// Dimension 8: Sprint Hygiene
// ============================================

const dimension8Indicators: IndicatorMetadata[] = [
  {
    id: 'sprintDurationVariance',
    reportType: 'variability',
    metricName: 'Sprint Duration',
    description: 'Variation in sprint durations.',
  },
  {
    id: 'sprintsWithoutGoals',
    reportType: 'sprintList',
    sprintListTitle: 'Sprints Without Goals',
    description: 'Sprints that don\'t have a defined goal.',
  },
  {
    id: 'workCarriedOver',
    reportType: 'issueList',
    issueListTitle: 'Work Carried Over',
    description: 'Issues that were carried over from previous sprints.',
  },
  {
    id: 'lastDayCompletions',
    reportType: 'issueList',
    issueListTitle: 'Last Day Completions',
    description: 'Issues completed on the last day of the sprint.',
  },
  {
    id: 'sprintCadenceAlignment',
    reportType: 'ratio',
    ratioTitle: 'Sprint Cadence Alignment',
    description: 'How well sprint timing aligns with the expected cadence.',
  },
  {
    id: 'crossProjectSprintItems',
    reportType: 'issueList',
    issueListTitle: 'Cross-Project Sprint Items',
    description: 'Sprint items that belong to different projects.',
  },
  {
    id: 'inProgressWithoutAssignee',
    reportType: 'issueList',
    issueListTitle: 'In-Progress Without Assignee',
    description: 'Issues in progress without an assigned owner.',
  },
];

// ============================================
// Dimension 9: Team Collaboration
// ============================================

const dimension9Indicators: IndicatorMetadata[] = [
  {
    id: 'avgCommentsPerIssue',
    reportType: 'ratio',
    ratioTitle: 'Average Comments per Issue',
    description: 'Distribution of comments across issues.',
  },
  {
    id: 'closedWithoutComments',
    reportType: 'issueList',
    issueListTitle: 'Closed Without Comments',
    description: 'Issues closed without any comments or discussion.',
  },
  {
    id: 'commentConcentration',
    reportType: 'distribution',
    distributionTitle: 'Comment Distribution',
    xAxisLabel: 'Comments per Issue',
    yAxisLabel: 'Percentage',
    description: 'How comments are distributed across issues.',
  },
  {
    id: 'teamInteractionScore',
    reportType: 'ratio',
    ratioTitle: 'Team Interaction Breakdown',
    description: 'Factors contributing to team interaction score.',
  },
  {
    id: 'sentBackWithoutComments',
    reportType: 'issueList',
    issueListTitle: 'Sent Back Without Comments',
    description: 'Issues sent back to earlier states without explanation.',
  },
  {
    id: 'staleCarryoverIssues',
    reportType: 'issueList',
    issueListTitle: 'Stale Carryover Issues Without Comments',
    description: 'Carried-over issues (3+ sprints) with no comments explaining why.',
  },
  {
    id: 'blockersWithoutDescription',
    reportType: 'issueList',
    issueListTitle: 'Blockers Without Description',
    description: 'Blocker issues without proper documentation.',
  },
  // Indicators merged from Collaboration Breadth (formerly a separate dimension)
  {
    id: 'singleContributorIssueRate',
    reportType: 'issueList',
    issueListTitle: 'Single-Contributor Issues',
    description: 'Issues where only one person made any updates (siloed work).',
  },
  {
    id: 'epicSingleContributorRate',
    reportType: 'issueList',
    issueListTitle: 'Single-Contributor Epics',
    description: 'Epics where only one person contributed.',
  },
  {
    id: 'avgContributorsPerEpic',
    reportType: 'ratio',
    ratioTitle: 'Contributors per Epic',
    description: 'Average number of different contributors per epic.',
  },
  {
    id: 'handoffDocumentationRate',
    reportType: 'issueList',
    issueListTitle: 'Silent Reassignments',
    description: 'Issues reassigned without a comment added within 24 hours.',
  },
  // Indicators moved from Collaboration Feature Usage
  {
    id: 'commentEngagementRate',
    reportType: 'issueList',
    issueListTitle: 'Issues Completed Without Comments',
    description: 'Issues that were completed without any comments or discussion.',
  },
  {
    id: 'multiCommenterRate',
    reportType: 'ratio',
    ratioTitle: 'Comment Collaboration',
    description: 'Breakdown of issues by number of unique commenters.',
  },
];

// ============================================
// Dimension 10: Repetitive Work
// ============================================

const dimension10Indicators: IndicatorMetadata[] = [
  {
    id: 'recreatingTickets',
    reportType: 'issueList',
    issueListTitle: 'Recreated Tickets',
    description: 'Tickets that appear to be duplicates or recreations of previous work.',
  },
];

// ============================================
// Dimension 11: Automatic Status
// ============================================

const dimension11Indicators: IndicatorMetadata[] = [
  {
    id: 'staleInProgressWork',
    reportType: 'issueList',
    issueListTitle: 'Stale In-Progress Work',
    description: 'In-progress issues that haven\'t been updated recently.',
  },
  {
    id: 'staleInProgressEpics',
    reportType: 'issueList',
    issueListTitle: 'Stale In-Progress Epics',
    description: 'In-progress epics that haven\'t been updated recently.',
  },
  {
    id: 'epicsClosedWithOpenChildren',
    reportType: 'issueList',
    issueListTitle: 'Epics Closed with Open Children',
    description: 'Epics marked closed but have open child issues.',
  },
  {
    id: 'delayedSubtaskCompletion',
    reportType: 'issueList',
    issueListTitle: 'Delayed Sub-task Completion',
    description: 'Sub-tasks completed after their parent was closed.',
  },
  {
    id: 'delayedEpicCompletion',
    reportType: 'issueList',
    issueListTitle: 'Delayed Epic Completion',
    description: 'Epics completed well after all children were done.',
  },
];

// ============================================
// Collaboration Feature Usage (Cluster 3)
// ============================================

const collaborationFeatureUsageIndicators: IndicatorMetadata[] = [
  {
    id: 'issueLinkAdoptionRate',
    reportType: 'issueList',
    issueListTitle: 'Issues Without Links',
    description: 'Issues that have no links to other issues, missing relationship context.',
  },
  {
    id: 'crossTeamLinkRate',
    reportType: 'ratio',
    ratioTitle: 'Link Distribution by Project',
    description: 'Breakdown of issue links within your project vs. cross-project.',
  },
  {
    id: 'atMentionUsageRate',
    reportType: 'ratio',
    ratioTitle: '@Mention Usage',
    description: 'Percentage of comments that include @mentions to involve others.',
  },
  {
    id: 'crossTeamAtMentionRate',
    reportType: 'ratio',
    ratioTitle: '@Mention Distribution',
    description: 'Breakdown of @mentions within team vs. cross-team.',
  },
  {
    id: 'watcherEngagement',
    reportType: 'distribution',
    distributionTitle: 'Watcher Distribution',
    xAxisLabel: 'Watchers per Issue',
    yAxisLabel: 'Count',
    description: 'Distribution of additional watchers beyond assignee and reporter.',
  },
];

// ============================================
// Configuration Efficiency (Cluster 4)
// (Note: Collaboration Breadth indicators were merged into dimension9Indicators above)
// ============================================

const configurationEfficiencyIndicators: IndicatorMetadata[] = [
  {
    id: 'workflowStatusCount',
    reportType: 'ratio',
    ratioTitle: 'Workflow Complexity',
    description: 'Number of statuses in your workflow compared to recommendations.',
  },
  {
    id: 'unusedStatusRate',
    reportType: 'ratio',
    ratioTitle: 'Status Usage Distribution',
    description: 'Breakdown of how often each workflow status is used.',
  },
  {
    id: 'workflowBypassRate',
    reportType: 'issueList',
    issueListTitle: 'Workflow Bypasses',
    description: 'Issues that skipped expected intermediate workflow states.',
  },
  {
    id: 'requiredFieldLoad',
    reportType: 'ratio',
    ratioTitle: 'Required Field Breakdown',
    description: 'Count of required fields on creation and transition screens.',
  },
  {
    id: 'emptyOptionalFieldRate',
    reportType: 'ratio',
    ratioTitle: 'Optional Field Usage',
    description: 'Breakdown of optional fields by population rate.',
  },
  {
    id: 'duplicateTicketPatternRate',
    reportType: 'issueList',
    issueListTitle: 'Similar Tickets',
    description: 'Tickets with highly similar titles/descriptions suggesting templates are needed.',
  },
  {
    id: 'customFieldCount',
    reportType: 'ratio',
    ratioTitle: 'Custom Fields by Type',
    description: 'Count of custom fields configured in the project, broken down by field type.',
  },
];

// ============================================
// Backlog Discipline (Cluster 5)
// ============================================

const backlogDisciplineIndicators: IndicatorMetadata[] = [
  {
    id: 'backlogStalenessDistribution',
    reportType: 'distribution',
    distributionTitle: 'Backlog Age Distribution',
    xAxisLabel: 'Age (Days)',
    yAxisLabel: 'Count',
    description: 'Shows how old your backlog items are. Measured by counting days since each item was created and grouping into buckets (<30d, 30-90d, 90-180d, 180-365d, >1yr). A healthy backlog has most items under 90 days old.',
  },
  {
    id: 'backlogDepthRatio',
    reportType: 'ratio',
    ratioTitle: 'Backlog Depth',
    description: 'How many sprints worth of work is in your backlog. Calculated as: (total backlog story points) ÷ (average story points completed per sprint). A ratio of 2-4 sprints is ideal—less means you might run out of refined work, more suggests a bloated backlog.',
  },
  {
    id: 'zombieItemCount',
    reportType: 'issueList',
    issueListTitle: 'Zombie Items',
    description: 'Backlog items that have been untouched for 6+ months but are still open. Identified by checking the "updated" timestamp on all backlog items. These zombies clutter prioritization and should be closed or archived.',
  },
  {
    id: 'backlogPruningRate',
    reportType: 'ratio',
    ratioTitle: 'Backlog Maintenance',
    description: 'How actively the team maintains backlog hygiene. Measured by counting items resolved as "Won\'t Do", "Obsolete", or "Duplicate" over the last 90 days, divided by total backlog size. Healthy teams prune 5-10% of their backlog quarterly.',
  },
  {
    id: 'sprintReadyCoverage',
    reportType: 'issueList',
    issueListTitle: 'Top Backlog Not Sprint-Ready',
    description: 'Top-priority backlog items that lack required fields (estimates, acceptance criteria). Checked by examining the top 20 items by priority/rank for empty Story Points or missing AC field. These items would slow down sprint planning.',
  },
  {
    id: 'refinementLag',
    reportType: 'timeline',
    timelineTitle: 'Time to First Estimate',
    description: 'Average days between item creation and receiving its first estimate. Calculated by measuring the gap between "created" date and when Story Points field was first populated. A lag over 14 days suggests refinement isn\'t keeping pace with intake.',
  },
  {
    id: 'priorityStabilityIndex',
    reportType: 'distribution',
    distributionTitle: 'Priority Changes Before Commitment',
    xAxisLabel: 'Priority Changes',
    yAxisLabel: 'Count',
    description: 'How often item priorities change before sprint commitment. Measured by counting Priority field changes in issue history for items eventually pulled into sprints. Frequent changes (>2 per item) indicate unclear prioritization criteria.',
  },
  {
    id: 'refinementToIntakeRatio',
    reportType: 'ratio',
    ratioTitle: 'Refinement vs. Intake',
    description: 'Whether refinement keeps up with new work creation. Calculated as: (items that received estimates this period) ÷ (new items created this period). A ratio below 1.0 means the backlog is accumulating unrefined work faster than it\'s being groomed.',
  },
];

// ============================================
// Combined Registry
// ============================================

const allIndicators: IndicatorMetadata[] = [
  ...dataIntegrityIndicators,
  ...dimension1Indicators,
  ...dimension2Indicators,
  ...dimension3Indicators,
  ...dimension4Indicators,
  ...dimension5Indicators,
  ...dimension6Indicators,
  ...dimension7Indicators,
  ...dimension8Indicators,
  ...dimension9Indicators,
  ...dimension10Indicators,
  ...dimension11Indicators,
  // New dimensions (collaborationBreadthIndicators merged into dimension9Indicators)
  ...collaborationFeatureUsageIndicators,
  ...configurationEfficiencyIndicators,
  ...backlogDisciplineIndicators,
];

// Create a lookup map for quick access
const indicatorMetadataMap = new Map<string, IndicatorMetadata>(
  allIndicators.map(indicator => [indicator.id, indicator])
);

// ============================================
// Export Functions
// ============================================

export const getIndicatorMetadata = (indicatorId: string): IndicatorMetadata | undefined => {
  return indicatorMetadataMap.get(indicatorId);
};

export const getIndicatorReportType = (indicatorId: string): DrillDownReportType => {
  const metadata = indicatorMetadataMap.get(indicatorId);
  return metadata?.reportType ?? 'issueList'; // Default to issueList
};

export const getAllIndicatorsByReportType = (reportType: DrillDownReportType): IndicatorMetadata[] => {
  return allIndicators.filter(indicator => indicator.reportType === reportType);
};

export const getReportTypeCounts = (): Record<DrillDownReportType, number> => {
  const counts: Record<DrillDownReportType, number> = {
    issueList: 0,
    sprintList: 0,
    variability: 0,
    distribution: 0,
    correlation: 0,
    timeline: 0,
    ratio: 0,
  };

  allIndicators.forEach(indicator => {
    counts[indicator.reportType]++;
  });

  return counts;
};

export {
  dataIntegrityIndicators,
  dimension1Indicators,
  dimension2Indicators,
  dimension3Indicators,
  dimension4Indicators,
  dimension5Indicators,
  dimension6Indicators,
  dimension7Indicators,
  dimension8Indicators,
  dimension9Indicators,
  dimension10Indicators,
  dimension11Indicators,
  // New dimension indicators (collaborationBreadthIndicators merged into dimension9Indicators)
  collaborationFeatureUsageIndicators,
  configurationEfficiencyIndicators,
  backlogDisciplineIndicators,
  allIndicators,
};
