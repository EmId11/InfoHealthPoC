// Jira Inference Utilities
// Mock inference functions that simulate Jira API analysis for workflow,
// estimation, and custom field discovery

import {
  WorkflowConfig,
  WorkflowStatus,
  EstimationPolicy,
  CustomFieldConfig,
} from '../types/admin';

/**
 * Infer workflows from Jira for each issue type.
 * In production, this would call the Jira API to analyze actual workflows.
 */
export function inferWorkflows(issueTypes: string[]): WorkflowConfig[] {
  const now = new Date().toISOString();

  const workflowTemplates: Record<string, WorkflowStatus[]> = {
    Story: [
      { statusId: 'story-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'story-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'story-3', statusName: 'In Review', category: 'in-progress' },
      { statusId: 'story-4', statusName: 'Done', category: 'done' },
    ],
    Bug: [
      { statusId: 'bug-1', statusName: 'Open', category: 'todo' },
      { statusId: 'bug-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'bug-3', statusName: 'Fixed', category: 'in-progress' },
      { statusId: 'bug-4', statusName: 'Verified', category: 'in-progress' },
      { statusId: 'bug-5', statusName: 'Closed', category: 'done' },
    ],
    Task: [
      { statusId: 'task-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'task-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'task-3', statusName: 'Done', category: 'done' },
    ],
    Epic: [
      { statusId: 'epic-1', statusName: 'Draft', category: 'todo' },
      { statusId: 'epic-2', statusName: 'Ready', category: 'todo' },
      { statusId: 'epic-3', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'epic-4', statusName: 'Complete', category: 'done' },
    ],
    'Sub-task': [
      { statusId: 'sub-1', statusName: 'To Do', category: 'todo' },
      { statusId: 'sub-2', statusName: 'In Progress', category: 'in-progress' },
      { statusId: 'sub-3', statusName: 'Done', category: 'done' },
    ],
  };

  // Default workflow for unknown issue types
  const defaultWorkflow: WorkflowStatus[] = [
    { statusId: 'default-1', statusName: 'To Do', category: 'todo' },
    { statusId: 'default-2', statusName: 'In Progress', category: 'in-progress' },
    { statusId: 'default-3', statusName: 'Done', category: 'done' },
  ];

  return issueTypes.map((issueType) => ({
    issueType,
    statuses: workflowTemplates[issueType] || defaultWorkflow.map((s, i) => ({
      ...s,
      statusId: `${issueType.toLowerCase()}-${i + 1}`,
    })),
    isInferred: true,
    lastInferredAt: now,
  }));
}

/**
 * Infer estimation policies from Jira for each issue type.
 * In production, this would analyze actual Jira data to determine estimation patterns.
 */
export function inferEstimationPolicies(issueTypes: string[]): EstimationPolicy[] {
  const estimationTemplates: Record<string, Partial<EstimationPolicy>> = {
    Story: {
      isEstimated: true,
      estimationField: 'storyPoints',
      estimationTrigger: 'onTransition',
      triggerStatus: 'Ready for Dev',
    },
    Bug: {
      isEstimated: false,
      estimationField: 'storyPoints',
      estimationTrigger: 'manual',
    },
    Task: {
      isEstimated: true,
      estimationField: 'timeEstimate',
      estimationTrigger: 'onCreation',
    },
    Epic: {
      isEstimated: false,
      estimationField: 'storyPoints',
      estimationTrigger: 'manual',
    },
    'Sub-task': {
      isEstimated: true,
      estimationField: 'timeEstimate',
      estimationTrigger: 'onCreation',
    },
  };

  // Default estimation policy for unknown issue types
  const defaultPolicy: Partial<EstimationPolicy> = {
    isEstimated: false,
    estimationField: 'storyPoints',
    estimationTrigger: 'manual',
  };

  return issueTypes.map((issueType) => ({
    issueType,
    isEstimated: estimationTemplates[issueType]?.isEstimated ?? defaultPolicy.isEstimated!,
    estimationField: estimationTemplates[issueType]?.estimationField ?? defaultPolicy.estimationField!,
    estimationTrigger: estimationTemplates[issueType]?.estimationTrigger ?? defaultPolicy.estimationTrigger!,
    triggerStatus: estimationTemplates[issueType]?.triggerStatus,
    isInferred: true,
  }));
}

/**
 * Infer custom fields from Jira.
 * In production, this would call the Jira API to discover custom fields.
 */
export function inferCustomFields(): CustomFieldConfig[] {
  // Mock custom fields that might be discovered in a typical Jira instance
  return [
    {
      id: 'cf-1',
      jiraFieldId: 'customfield_10001',
      displayName: 'Sprint Goal',
      description: 'The goal for the current sprint',
      enabled: false,
    },
    {
      id: 'cf-2',
      jiraFieldId: 'customfield_10002',
      displayName: 'Story Points',
      description: 'Effort estimate in story points',
      enabled: false,
    },
    {
      id: 'cf-3',
      jiraFieldId: 'customfield_10003',
      displayName: 'Release Notes',
      description: 'Notes for release documentation',
      enabled: false,
    },
    {
      id: 'cf-4',
      jiraFieldId: 'customfield_10004',
      displayName: 'Test Cases',
      description: 'Link to test cases',
      enabled: false,
    },
    {
      id: 'cf-5',
      jiraFieldId: 'customfield_10005',
      displayName: 'Customer Impact',
      description: 'Description of customer impact',
      enabled: false,
    },
    {
      id: 'cf-6',
      jiraFieldId: 'customfield_10006',
      displayName: 'Root Cause',
      description: 'Root cause analysis for bugs',
      enabled: false,
    },
    {
      id: 'cf-7',
      jiraFieldId: 'customfield_10007',
      displayName: 'Definition of Done',
      description: 'Custom DoD for this issue',
      enabled: false,
    },
    {
      id: 'cf-8',
      jiraFieldId: 'customfield_10008',
      displayName: 'Technical Approach',
      description: 'Technical implementation details',
      enabled: false,
    },
  ];
}

/**
 * Get default issue types for workflow/estimation configuration.
 */
export function getDefaultIssueTypes(): string[] {
  return ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'];
}

/**
 * Get available status categories for workflow configuration.
 */
export function getStatusCategories(): Array<{ value: 'todo' | 'in-progress' | 'done'; label: string }> {
  return [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];
}

/**
 * Get available estimation fields.
 */
export function getEstimationFields(): Array<{ value: 'storyPoints' | 'timeEstimate' | 'custom'; label: string }> {
  return [
    { value: 'storyPoints', label: 'Story Points' },
    { value: 'timeEstimate', label: 'Time Estimate' },
    { value: 'custom', label: 'Custom Field' },
  ];
}

/**
 * Get available estimation triggers.
 */
export function getEstimationTriggers(): Array<{ value: 'onCreation' | 'onTransition' | 'manual'; label: string }> {
  return [
    { value: 'onCreation', label: 'On Creation' },
    { value: 'onTransition', label: 'On Transition to Status' },
    { value: 'manual', label: 'Manual (No Requirement)' },
  ];
}
