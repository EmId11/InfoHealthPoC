// ============================================
// Assessment Reports Types
// Types for the assessment-level Reports tab
// ============================================

import { AssessmentResult, DimensionResult, IndicatorResult, TrendDirection, RiskLevel } from './assessment';

// ============================================
// Assessment Question Categories
// Organized by what users want to know about their assessment
// ============================================

export type AssessmentQuestionCategory =
  | 'dimensions'
  | 'indicators'
  | 'comparison'
  | 'trends'
  | 'recommendations';

export const ASSESSMENT_QUESTION_CATEGORY_LABELS: Record<AssessmentQuestionCategory, string> = {
  'dimensions': 'Dimensions',
  'indicators': 'Indicators',
  'comparison': 'Comparison',
  'trends': 'Trends',
  'recommendations': 'Recommendations',
};

export const ASSESSMENT_QUESTION_CATEGORY_DESCRIPTIONS: Record<AssessmentQuestionCategory, string> = {
  'dimensions': 'Questions about dimension health, risk levels, and scores',
  'indicators': 'Questions about specific indicators driving your scores',
  'comparison': 'Questions about how you compare to similar teams',
  'trends': 'Questions about what\'s improving or declining over time',
  'recommendations': 'Questions about what to prioritize and quick wins',
};

export const ALL_ASSESSMENT_QUESTION_CATEGORIES: AssessmentQuestionCategory[] = [
  'dimensions',
  'indicators',
  'comparison',
  'trends',
  'recommendations',
];

// ============================================
// Assessment Query Result Types
// ============================================

export interface AssessmentQueryColumn {
  id: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'riskLevel' | 'trend' | 'percentage';
  sortable?: boolean;
}

export interface AssessmentQueryResultRow {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AssessmentQueryResult {
  title: string;
  description: string;
  columns: AssessmentQueryColumn[];
  rows: AssessmentQueryResultRow[];
  totalCount: number;
  // Optional navigation callback for clickable rows
  rowClickable?: boolean;
  onRowClick?: (rowId: string) => void;
}

// ============================================
// Assessment Question Template
// ============================================

export interface AssessmentQuestionTemplate {
  id: string;
  question: string;
  description: string;
  category: AssessmentQuestionCategory;
  keywords: string[];
  queryFn: (assessment: AssessmentResult) => AssessmentQueryResult;
}

// ============================================
// Assessment Question Suggestion (search result)
// ============================================

export interface AssessmentQuestionSuggestion {
  question: AssessmentQuestionTemplate;
  matchScore: number;
  matchedKeywords: string[];
}

// ============================================
// Helper Types for Query Results
// ============================================

export interface DimensionQueryRow extends AssessmentQueryResultRow {
  dimensionKey: string;
  dimensionName: string;
  percentile: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
  flaggedIndicators: number;
  totalIndicators: number;
}

export interface IndicatorQueryRow extends AssessmentQueryResultRow {
  indicatorId: string;
  indicatorName: string;
  dimensionName: string;
  value: string;
  benchmarkValue: string;
  percentile: number;
  trend: TrendDirection;
}

export interface RecommendationQueryRow extends AssessmentQueryResultRow {
  recommendationId: string;
  title: string;
  description: string;
  dimensionName: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
}

// ============================================
// Assessment Reports State
// ============================================

export type AssessmentReportsViewMode = 'search' | 'results';

export interface AssessmentReportsState {
  viewMode: AssessmentReportsViewMode;
  searchInput: string;
  selectedQuestion: AssessmentQuestionTemplate | null;
  results: AssessmentQueryResult | null;
  isLoading: boolean;
  error: string | null;
}

export function createInitialAssessmentReportsState(): AssessmentReportsState {
  return {
    viewMode: 'search',
    searchInput: '',
    selectedQuestion: null,
    results: null,
    isLoading: false,
    error: null,
  };
}
