// ============================================
// Question Builder Types
// Question-first query building interface
// ============================================

import { ExtendedReportQuery } from './reports';

// ============================================
// Question Categories
// Organized by user intent, not entity type
// ============================================

export type QuestionCategory =
  | 'team-health'
  | 'outcomes'
  | 'data-quality'
  | 'trends'
  | 'users';

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  'team-health': 'Team Health',
  'outcomes': 'Outcomes',
  'data-quality': 'Data Quality',
  'trends': 'Trends',
  'users': 'User Activity',
};

export const QUESTION_CATEGORY_DESCRIPTIONS: Record<QuestionCategory, string> = {
  'team-health': 'Questions about team risk levels, health scores, and performance',
  'outcomes': 'Questions about outcome confidence, critical gaps, and planning',
  'data-quality': 'Questions about missing data, stale issues, and hygiene',
  'trends': 'Questions about velocity trends, improving/declining metrics',
  'users': 'Questions about user activity, engagement, and adoption',
};

export const ALL_QUESTION_CATEGORIES: QuestionCategory[] = [
  'team-health',
  'outcomes',
  'data-quality',
  'trends',
  'users',
];

// ============================================
// Template Question Definition
// ============================================

export interface TemplateQuestion {
  id: string;
  question: string;           // The natural language question
  description: string;        // Brief explanation of what this reveals
  category: QuestionCategory;
  keywords: string[];         // Words used for fuzzy matching
  underlyingQuery: ExtendedReportQuery;

  // Display configuration
  resultColumns?: string[];   // Which columns to show in results
  suggestedFilters?: QuickFilter[]; // Filters that make sense for this question
}

// ============================================
// Quick Filters
// Common refinements users want to apply
// ============================================

export type QuickFilterType = 'portfolio' | 'teamSize' | 'timePeriod' | 'workType';

export interface QuickFilterOption {
  value: string;
  label: string;
}

export interface QuickFilter {
  type: QuickFilterType;
  label: string;
  options: QuickFilterOption[];
  defaultValue: string;
}

export const PORTFOLIO_OPTIONS: QuickFilterOption[] = [
  { value: 'all', label: 'All Portfolios' },
  { value: 'consumer', label: 'Consumer Products' },
  { value: 'platform', label: 'Platform Infrastructure' },
  { value: 'enterprise', label: 'Enterprise Solutions' },
];

export const TEAM_SIZE_OPTIONS: QuickFilterOption[] = [
  { value: 'all', label: 'All Sizes' },
  { value: 'small', label: 'Small (1-5)' },
  { value: 'medium', label: 'Medium (6-15)' },
  { value: 'large', label: 'Large (16+)' },
];

export const TIME_PERIOD_OPTIONS: QuickFilterOption[] = [
  { value: '30', label: 'Last 30 days' },
  { value: '60', label: 'Last 60 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export const WORK_TYPE_OPTIONS: QuickFilterOption[] = [
  { value: 'all', label: 'All Work Types' },
  { value: 'product', label: 'Product Development' },
  { value: 'platform', label: 'Platform' },
  { value: 'bau', label: 'BAU / Support' },
];

export const DEFAULT_QUICK_FILTERS: QuickFilter[] = [
  {
    type: 'portfolio',
    label: 'Portfolio',
    options: PORTFOLIO_OPTIONS,
    defaultValue: 'all',
  },
  {
    type: 'teamSize',
    label: 'Team Size',
    options: TEAM_SIZE_OPTIONS,
    defaultValue: 'all',
  },
  {
    type: 'timePeriod',
    label: 'Time Period',
    options: TIME_PERIOD_OPTIONS,
    defaultValue: '30',
  },
];

// ============================================
// Question Suggestion (search result)
// ============================================

export interface QuestionSuggestion {
  question: TemplateQuestion;
  matchScore: number;         // 0-1, higher is better match
  matchedKeywords: string[];  // Which keywords matched
}

// ============================================
// Query Interpretation
// How we display the parsed query to users
// ============================================

export interface QueryPill {
  id: string;
  type: 'entity' | 'field' | 'operator' | 'value';
  label: string;
  editable: boolean;
}

export interface InterpretedQuery {
  pills: QueryPill[];
  naturalDescription: string;  // Human-readable summary
}

// ============================================
// Question Query Builder State
// ============================================

export type QuestionBuilderView = 'search' | 'results';

export interface QuestionBuilderState {
  // Current view
  view: QuestionBuilderView;

  // Search state
  searchInput: string;
  suggestions: QuestionSuggestion[];
  selectedCategory: QuestionCategory | null;

  // Selected question
  selectedQuestion: TemplateQuestion | null;

  // Quick filters
  activeFilters: Record<QuickFilterType, string>;

  // Results
  isLoading: boolean;
  error: string | null;
}

export function createInitialQuestionBuilderState(): QuestionBuilderState {
  return {
    view: 'search',
    searchInput: '',
    suggestions: [],
    selectedCategory: null,
    selectedQuestion: null,
    activeFilters: {
      portfolio: 'all',
      teamSize: 'all',
      timePeriod: '30',
      workType: 'all',
    },
    isLoading: false,
    error: null,
  };
}
