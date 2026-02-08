// ============================================
// Question Matcher
// Simple fuzzy matching for question templates
// ============================================

import { TemplateQuestion, QuestionSuggestion, QuestionCategory } from '../types/questionBuilder';
import { ALL_QUESTION_TEMPLATES } from '../constants/questionTemplates';

// ============================================
// Word Processing Helpers
// ============================================

/**
 * Normalize a string for comparison:
 * - lowercase
 * - remove punctuation
 * - split into words
 */
function normalizeToWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Common words to ignore in matching (stop words)
 */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
]);

/**
 * Remove stop words from a list of words
 */
function removeStopWords(words: string[]): string[] {
  return words.filter(word => !STOP_WORDS.has(word));
}

// ============================================
// Matching Functions
// ============================================

/**
 * Calculate word overlap score between input and template
 * Returns value between 0 and 1
 */
function calculateWordOverlap(inputWords: string[], templateWords: string[]): number {
  if (inputWords.length === 0) return 0;

  const inputSet = new Set(inputWords);
  let matchCount = 0;

  templateWords.forEach(word => {
    if (inputSet.has(word)) {
      matchCount++;
    }
  });

  // Score based on how many input words matched
  return matchCount / inputWords.length;
}

/**
 * Check if input is a substring of template question
 * Returns value between 0 and 1
 */
function calculateSubstringScore(input: string, template: string): number {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTemplate = template.toLowerCase();

  if (normalizedTemplate.includes(normalizedInput)) {
    // Score based on how much of the template the input covers
    return normalizedInput.length / normalizedTemplate.length;
  }

  return 0;
}

/**
 * Calculate keyword match score
 * Returns value between 0 and 1
 */
function calculateKeywordScore(inputWords: string[], keywords: string[]): { score: number; matched: string[] } {
  if (inputWords.length === 0) return { score: 0, matched: [] };

  const matched: string[] = [];
  const inputSet = new Set(inputWords);

  keywords.forEach(keyword => {
    // Keywords might be multi-word, so check each word
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    if (keywordWords.some(kw => inputSet.has(kw))) {
      matched.push(keyword);
    }
    // Also check if any input word contains the keyword or vice versa
    inputWords.forEach(inputWord => {
      if (
        inputWord.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(inputWord)
      ) {
        if (!matched.includes(keyword)) {
          matched.push(keyword);
        }
      }
    });
  });

  const score = matched.length / Math.max(1, keywords.length);
  return { score, matched };
}

/**
 * Calculate overall match score for a single question template
 */
function scoreTemplate(
  input: string,
  template: TemplateQuestion
): QuestionSuggestion {
  const inputWords = removeStopWords(normalizeToWords(input));
  const questionWords = removeStopWords(normalizeToWords(template.question));
  const descriptionWords = removeStopWords(normalizeToWords(template.description));

  // Calculate various scores
  const substringScore = calculateSubstringScore(input, template.question);
  const questionOverlap = calculateWordOverlap(inputWords, questionWords);
  const descriptionOverlap = calculateWordOverlap(inputWords, descriptionWords);
  const { score: keywordScore, matched: matchedKeywords } = calculateKeywordScore(
    inputWords,
    template.keywords
  );

  // Weighted combination of scores
  // Substring match is most important (exact match)
  // Keyword match is next (user typed keywords we know about)
  // Question word overlap is important
  // Description overlap is least important
  const totalScore =
    substringScore * 0.4 +
    keywordScore * 0.3 +
    questionOverlap * 0.2 +
    descriptionOverlap * 0.1;

  return {
    question: template,
    matchScore: Math.min(1, totalScore),
    matchedKeywords,
  };
}

// ============================================
// Public API
// ============================================

/**
 * Find matching questions for user input
 * Returns sorted list of suggestions (best matches first)
 */
export function findMatchingQuestions(
  input: string,
  limit: number = 10
): QuestionSuggestion[] {
  const trimmedInput = input.trim();

  // If input is empty, return empty array
  if (!trimmedInput) {
    return [];
  }

  // Score all templates
  const scored = ALL_QUESTION_TEMPLATES.map(template =>
    scoreTemplate(trimmedInput, template)
  );

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  // Filter out very low scores and limit results
  const filtered = scored.filter(s => s.matchScore > 0.05);

  return filtered.slice(0, limit);
}

/**
 * Get top suggestions for autocomplete
 * Designed for quick feedback as user types
 */
export function getSuggestions(
  partialInput: string,
  limit: number = 6
): QuestionSuggestion[] {
  return findMatchingQuestions(partialInput, limit);
}

/**
 * Find questions matching a category filter
 */
export function findMatchingQuestionsInCategory(
  input: string,
  category: QuestionCategory,
  limit: number = 10
): QuestionSuggestion[] {
  const allMatches = findMatchingQuestions(input, 50);
  return allMatches
    .filter(s => s.question.category === category)
    .slice(0, limit);
}

/**
 * Get all questions as suggestions (for browsing)
 * Optionally filtered by category
 */
export function getAllQuestionsAsSuggestions(
  category?: QuestionCategory
): QuestionSuggestion[] {
  let templates = ALL_QUESTION_TEMPLATES;

  if (category) {
    templates = templates.filter(t => t.category === category);
  }

  return templates.map(template => ({
    question: template,
    matchScore: 1,
    matchedKeywords: [],
  }));
}

/**
 * Check if input closely matches any template
 * Used to determine if we should show results or suggestions
 */
export function hasExactMatch(input: string): boolean {
  const suggestions = findMatchingQuestions(input, 1);
  return suggestions.length > 0 && suggestions[0].matchScore > 0.8;
}

/**
 * Get the best matching question for input
 * Returns undefined if no good match found
 */
export function getBestMatch(input: string): TemplateQuestion | undefined {
  const suggestions = findMatchingQuestions(input, 1);
  if (suggestions.length > 0 && suggestions[0].matchScore > 0.3) {
    return suggestions[0].question;
  }
  return undefined;
}
