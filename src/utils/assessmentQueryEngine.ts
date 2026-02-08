// ============================================
// Assessment Query Engine
// Functions for searching and executing assessment queries
// ============================================

import {
  AssessmentQuestionTemplate,
  AssessmentQuestionSuggestion,
  AssessmentQueryResult,
} from '../types/assessmentReports';
import { AssessmentResult } from '../types/assessment';
import { ALL_ASSESSMENT_QUESTION_TEMPLATES } from '../constants/assessmentQuestionTemplates';

// ============================================
// Search & Matching
// ============================================

/**
 * Get matching question suggestions based on search input
 */
export function getAssessmentSuggestions(
  searchInput: string,
  maxResults: number = 6
): AssessmentQuestionSuggestion[] {
  if (!searchInput.trim()) {
    return [];
  }

  const searchTerms = searchInput.toLowerCase().split(/\s+/).filter(Boolean);
  const results: AssessmentQuestionSuggestion[] = [];

  for (const question of ALL_ASSESSMENT_QUESTION_TEMPLATES) {
    const { matchScore, matchedKeywords } = calculateMatchScore(question, searchTerms);

    if (matchScore > 0) {
      results.push({
        question,
        matchScore,
        matchedKeywords,
      });
    }
  }

  // Sort by match score (highest first) and return top results
  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxResults);
}

/**
 * Calculate match score for a question against search terms
 */
function calculateMatchScore(
  question: AssessmentQuestionTemplate,
  searchTerms: string[]
): { matchScore: number; matchedKeywords: string[] } {
  let score = 0;
  const matchedKeywords: string[] = [];

  const questionLower = question.question.toLowerCase();
  const descriptionLower = question.description.toLowerCase();

  for (const term of searchTerms) {
    // Exact keyword match (highest weight)
    if (question.keywords.some(k => k.toLowerCase() === term)) {
      score += 3;
      matchedKeywords.push(term);
    }
    // Partial keyword match
    else if (question.keywords.some(k => k.toLowerCase().includes(term))) {
      score += 2;
      matchedKeywords.push(term);
    }
    // Question text match
    else if (questionLower.includes(term)) {
      score += 1.5;
    }
    // Description match
    else if (descriptionLower.includes(term)) {
      score += 1;
    }
  }

  // Bonus for matching multiple terms
  if (matchedKeywords.length > 1) {
    score += matchedKeywords.length * 0.5;
  }

  return { matchScore: score, matchedKeywords };
}

/**
 * Get the best matching question for a search input
 */
export function getAssessmentBestMatch(
  searchInput: string
): AssessmentQuestionTemplate | null {
  const suggestions = getAssessmentSuggestions(searchInput, 1);
  return suggestions.length > 0 ? suggestions[0].question : null;
}

// ============================================
// Query Execution
// ============================================

/**
 * Execute a question query against an assessment result
 */
export function executeAssessmentQuery(
  question: AssessmentQuestionTemplate,
  assessment: AssessmentResult
): AssessmentQueryResult {
  try {
    return question.queryFn(assessment);
  } catch (error) {
    console.error('Error executing assessment query:', error);
    return {
      title: 'Error',
      description: 'Failed to execute query',
      columns: [],
      rows: [],
      totalCount: 0,
    };
  }
}

// ============================================
// Summary Statistics
// ============================================

/**
 * Get quick summary statistics from an assessment
 */
export function getAssessmentSummaryStats(assessment: AssessmentResult): {
  totalDimensions: number;
  highRiskDimensions: number;
  moderateRiskDimensions: number;
  lowRiskDimensions: number;
  improvingDimensions: number;
  decliningDimensions: number;
  totalIndicators: number;
  flaggedIndicators: number;
} {
  let totalIndicators = 0;
  let flaggedIndicators = 0;

  for (const dimension of assessment.dimensions) {
    for (const category of dimension.categories) {
      totalIndicators += category.indicators.length;
      flaggedIndicators += category.indicators.filter(
        i => i.benchmarkPercentile < 33
      ).length;
    }
  }

  return {
    totalDimensions: assessment.dimensions.length,
    highRiskDimensions: assessment.dimensions.filter(d => d.riskLevel === 'high').length,
    moderateRiskDimensions: assessment.dimensions.filter(d => d.riskLevel === 'moderate').length,
    lowRiskDimensions: assessment.dimensions.filter(d => d.riskLevel === 'low').length,
    improvingDimensions: assessment.dimensions.filter(d => d.trend === 'improving').length,
    decliningDimensions: assessment.dimensions.filter(d => d.trend === 'declining').length,
    totalIndicators,
    flaggedIndicators,
  };
}

// ============================================
// Suggested Questions
// ============================================

/**
 * Get suggested questions based on assessment data
 */
export function getSuggestedQuestionsForAssessment(
  assessment: AssessmentResult,
  maxSuggestions: number = 4
): AssessmentQuestionTemplate[] {
  const stats = getAssessmentSummaryStats(assessment);
  const suggestions: AssessmentQuestionTemplate[] = [];

  // Suggest high-risk question if there are high-risk dimensions
  if (stats.highRiskDimensions > 0) {
    const highRiskQ = ALL_ASSESSMENT_QUESTION_TEMPLATES.find(q => q.id === 'dim-high-risk');
    if (highRiskQ) suggestions.push(highRiskQ);
  }

  // Suggest declining trends if there are declining dimensions
  if (stats.decliningDimensions > 0) {
    const decliningQ = ALL_ASSESSMENT_QUESTION_TEMPLATES.find(q => q.id === 'trend-declining');
    if (decliningQ) suggestions.push(decliningQ);
  }

  // Always suggest quick wins
  const quickWinsQ = ALL_ASSESSMENT_QUESTION_TEMPLATES.find(q => q.id === 'rec-quick-wins');
  if (quickWinsQ) suggestions.push(quickWinsQ);

  // Suggest flagged indicators if there are many
  if (stats.flaggedIndicators > 5) {
    const flaggedQ = ALL_ASSESSMENT_QUESTION_TEMPLATES.find(q => q.id === 'ind-flagged');
    if (flaggedQ) suggestions.push(flaggedQ);
  }

  // Fill remaining slots with other useful questions
  const fallbackIds = ['dim-all', 'comp-below-avg', 'ind-driving-low', 'rec-priority'];
  for (const id of fallbackIds) {
    if (suggestions.length >= maxSuggestions) break;
    if (!suggestions.some(q => q.id === id)) {
      const q = ALL_ASSESSMENT_QUESTION_TEMPLATES.find(question => question.id === id);
      if (q) suggestions.push(q);
    }
  }

  return suggestions.slice(0, maxSuggestions);
}
