// Theme groupings for organizing dimensions on the dashboard

import { DimensionResult } from '../types/assessment';

export interface ThemeGroup {
  id: string;
  name: string;
  question: string;
  description: string;
  dimensionKeys: string[];
}

export const themeGroups: ThemeGroup[] = [
  {
    id: 'dataQuality',
    name: 'Data Quality & Completeness',
    question: 'Is our Jira data complete and accurate?',
    description: 'Measures how well your team captures work in Jira, including field coverage, data integrity, data freshness, and issue hierarchy linkage.',
    dimensionKeys: ['workCaptured', 'ticketReadiness', 'dataFreshness', 'issueTypeConsistency', 'workHierarchy'],
  },
  {
    id: 'estimation',
    name: 'Estimation Health',
    question: 'Is our estimation data reliable?',
    description: 'Evaluates the coverage and consistency of story points or time estimates across your work items.',
    dimensionKeys: ['estimationCoverage', 'sizingConsistency'],
  },
  {
    id: 'collaboration',
    name: 'Effective Collaboration',
    question: 'Are we using Jira as a collaboration tool?',
    description: 'Checks whether Jira is facilitating teamwork or functioning as isolated task lists.',
    dimensionKeys: ['teamCollaboration', 'blockerManagement', 'collaborationFeatureUsage'],
  },
  {
    id: 'efficiency',
    name: 'Jira Efficiency',
    question: 'Are we wasting time in Jira?',
    description: 'Checks whether your Jira setup creates unnecessary overhead.',
    dimensionKeys: ['automationOpportunities', 'configurationEfficiency'],
  },
  {
    id: 'discipline',
    name: 'Methodology Support',
    question: 'Is Jira helping or hindering your methodology?',
    description: 'Checks whether Jira practices support your Scrum, Kanban, or hybrid approach.',
    dimensionKeys: ['sprintHygiene', 'backlogDiscipline'],
  },
];

// Helper to get dimensions for a theme from the full dimensions array
export const getDimensionsForTheme = <T extends { dimensionKey: string }>(
  theme: ThemeGroup,
  allDimensions: T[]
): T[] => {
  return theme.dimensionKeys
    .map(key => allDimensions.find(d => d.dimensionKey === key))
    .filter((d): d is T => d !== undefined);
};

// Calculate cluster (theme) percentile as average of its dimension percentiles
export const calculateClusterPercentile = (
  theme: ThemeGroup,
  dimensions: DimensionResult[]
): number => {
  const themeDimensions = getDimensionsForTheme(theme, dimensions);
  if (themeDimensions.length === 0) return 0;

  const sum = themeDimensions.reduce((acc, dim) => acc + dim.overallPercentile, 0);
  return Math.round(sum / themeDimensions.length);
};
