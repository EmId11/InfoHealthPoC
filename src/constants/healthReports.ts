// Jira Health Reports - Indicator-based reports for Jira hygiene
// Flat list leveraging indicator drill-down data tables

import { DrillDownReportType } from '../types/assessment';

// ============================================
// Jira Health Report Definition
// ============================================

export type JiraHealthSeverity = 'critical' | 'warning' | 'info';

export interface JiraHealthReport {
  id: string;
  title: string;
  description: string;
  indicatorId: string;           // Maps to indicator metadata
  reportType: DrillDownReportType;
  severity: JiraHealthSeverity;
}

// ============================================
// Jira Health Reports (Flat List)
// ============================================

export const JIRA_HEALTH_REPORTS: JiraHealthReport[] = [
  // Issue Hygiene Reports
  {
    id: 'siloed-work',
    title: 'Siloed Work Items',
    description: 'Work items handled by a single person without collaboration',
    indicatorId: 'siloedWorkItems',
    reportType: 'issueList',
    severity: 'warning',
  },
  {
    id: 'stale-work',
    title: 'Stale Work Items',
    description: 'Work items that haven\'t been updated beyond the configured threshold',
    indicatorId: 'staleWorkItems',
    reportType: 'issueList',
    severity: 'warning',
  },
  {
    id: 'stale-epics',
    title: 'Stale Epics',
    description: 'Epics that haven\'t been updated recently',
    indicatorId: 'staleEpics',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'missing-estimates',
    title: 'Issues Without Estimates',
    description: 'Estimable issues that don\'t have story points or time estimates',
    indicatorId: 'estimates',
    reportType: 'issueList',
    severity: 'warning',
  },
  {
    id: 'missing-ac',
    title: 'Issues Without Acceptance Criteria',
    description: 'Issues that don\'t have acceptance criteria defined',
    indicatorId: 'acceptanceCriteria',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'unlinked-issues',
    title: 'Unlinked Issues',
    description: 'Issues that don\'t have links to other related issues',
    indicatorId: 'linksToIssues',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'no-parent-epic',
    title: 'Issues Without Parent Epic',
    description: 'Issues that are not linked to a parent epic',
    indicatorId: 'parentEpic',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'unassigned-issues',
    title: 'Unassigned Issues',
    description: 'Issues that don\'t have an assignee',
    indicatorId: 'assignee',
    reportType: 'issueList',
    severity: 'warning',
  },
  {
    id: 'no-due-date',
    title: 'Issues Without Due Date',
    description: 'Issues that don\'t have a due date set',
    indicatorId: 'dueDate',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'missing-priority',
    title: 'Issues Without Priority',
    description: 'Issues with default priority that may need prioritization',
    indicatorId: 'prioritySet',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'in-progress-no-assignee',
    title: 'In-Progress Without Assignee',
    description: 'Issues in progress without an assigned owner',
    indicatorId: 'inProgressWithoutAssignee',
    reportType: 'issueList',
    severity: 'critical',
  },
  {
    id: 'blocked-issues',
    title: 'Blockers Without Description',
    description: 'Blocker issues that don\'t have proper documentation',
    indicatorId: 'blockersWithoutDescription',
    reportType: 'issueList',
    severity: 'critical',
  },

  // Sprint Hygiene Reports
  {
    id: 'sprints-no-goals',
    title: 'Sprints Without Goals',
    description: 'Sprints that don\'t have a defined goal',
    indicatorId: 'sprintsWithoutGoals',
    reportType: 'sprintList',
    severity: 'warning',
  },
  {
    id: 'work-carried-over',
    title: 'Work Carried Over',
    description: 'Issues that were carried over from previous sprints',
    indicatorId: 'workCarriedOver',
    reportType: 'issueList',
    severity: 'warning',
  },
  {
    id: 'last-day-completions',
    title: 'Last Day Completions',
    description: 'Issues completed on the last day of the sprint',
    indicatorId: 'lastDayCompletions',
    reportType: 'issueList',
    severity: 'info',
  },

  // Epic Health Reports
  {
    id: 'epics-unresolved-children',
    title: 'Epics with Unresolved Children',
    description: 'Epics marked as done but still have unresolved child issues',
    indicatorId: 'unresolvedEpicChildren',
    reportType: 'issueList',
    severity: 'critical',
  },
  {
    id: 'epics-closed-open-children',
    title: 'Closed Epics with Open Children',
    description: 'Epics marked as resolved but still have open child issues',
    indicatorId: 'epicsWithUnresolvedChildren',
    reportType: 'issueList',
    severity: 'critical',
  },

  // Collaboration Reports
  {
    id: 'closed-no-comments',
    title: 'Closed Without Comments',
    description: 'Issues closed without any comments or discussion',
    indicatorId: 'closedWithoutComments',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'sent-back-no-comments',
    title: 'Sent Back Without Comments',
    description: 'Issues sent back to earlier states without explanation',
    indicatorId: 'sentBackWithoutComments',
    reportType: 'issueList',
    severity: 'warning',
  },

  // Data Freshness Reports
  {
    id: 'bulk-changes',
    title: 'Bulk Updated Issues',
    description: 'Issues that were updated in bulk operations',
    indicatorId: 'bulkChanges',
    reportType: 'issueList',
    severity: 'info',
  },
  {
    id: 'stale-in-progress',
    title: 'Stale In-Progress Work',
    description: 'In-progress issues that haven\'t been updated recently',
    indicatorId: 'staleInProgressWork',
    reportType: 'issueList',
    severity: 'warning',
  },
];

// ============================================
// Helper Functions
// ============================================

export function getJiraHealthReportById(reportId: string): JiraHealthReport | undefined {
  return JIRA_HEALTH_REPORTS.find(r => r.id === reportId);
}

export function getJiraHealthReportsByType(reportType: DrillDownReportType): JiraHealthReport[] {
  return JIRA_HEALTH_REPORTS.filter(r => r.reportType === reportType);
}

export function getJiraHealthReportsBySeverity(severity: JiraHealthSeverity): JiraHealthReport[] {
  return JIRA_HEALTH_REPORTS.filter(r => r.severity === severity);
}

export function getJiraHealthReportCount(): number {
  return JIRA_HEALTH_REPORTS.length;
}
