import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import QuestionInput from './QuestionInput';
import QuestionSuggestions from './QuestionSuggestions';
import QuestionCategoryBrowser from './QuestionCategoryBrowser';
import InterpretedQueryDisplay from './InterpretedQueryDisplay';
import QuickFilterBar from './QuickFilterBar';
import {
  TemplateQuestion,
  QuestionSuggestion,
  QuickFilterType,
} from '../../../types/questionBuilder';
import { ReportResults, QueryConditionGroup, SavedJQLReport } from '../../../types/reports';
import { getSuggestions, getBestMatch } from '../../../utils/questionMatcher';
import { executeJQL } from '../../../utils/jqlParser';
import { ALL_QUESTION_TEMPLATES } from '../../../constants/questionTemplates';
import ResultsTable from '../ReportingEngine/JQLQueryPage/ResultsTable';

// Storage key for bookmarked reports
const BOOKMARKED_REPORTS_KEY = 'bookmarked-reports';

// Load bookmarked reports from localStorage
const loadBookmarkedReports = (): SavedJQLReport[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKED_REPORTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save bookmarked reports to localStorage
const saveBookmarkedReports = (reports: SavedJQLReport[]) => {
  try {
    localStorage.setItem(BOOKMARKED_REPORTS_KEY, JSON.stringify(reports));
  } catch {
    console.error('Failed to save bookmarks to localStorage');
  }
};

// Check if a question is already bookmarked
const isQuestionBookmarked = (questionId: string): boolean => {
  const bookmarks = loadBookmarkedReports();
  return bookmarks.some(b => b.id === `question-${questionId}`);
};

type ViewMode = 'search' | 'results';

const QuestionQueryBuilder: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedQuestion, setSelectedQuestion] = useState<TemplateQuestion | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<QuickFilterType, string>>({
    portfolio: 'all',
    teamSize: 'all',
    timePeriod: '30',
    workType: 'all',
  });
  const [results, setResults] = useState<ReportResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Computed suggestions
  const suggestions = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }
    return getSuggestions(searchInput, 6);
  }, [searchInput]);

  // Get suggested questions for initial browse
  const suggestedQuestions = useMemo(() => {
    const seen = new Set<string>();
    const suggested: TemplateQuestion[] = [];

    for (const q of ALL_QUESTION_TEMPLATES) {
      if (!seen.has(q.category)) {
        suggested.push(q);
        seen.add(q.category);
        if (suggested.length >= 4) break;
      }
    }
    return suggested;
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check bookmark status when question changes
  useEffect(() => {
    if (selectedQuestion) {
      setIsBookmarked(isQuestionBookmarked(selectedQuestion.id));
    }
  }, [selectedQuestion]);

  // Execute query for a question
  const executeQuestion = useCallback((question: TemplateQuestion) => {
    setIsLoading(true);
    setError(null);
    setSelectedQuestion(question);
    setViewMode('results');
    setShowSuggestions(false);
    setIsBookmarked(isQuestionBookmarked(question.id));

    const queryStr = generateQueryString(question);

    setTimeout(() => {
      const result = executeJQL(queryStr);

      if (result.success && result.results) {
        setResults(result.results);
        setError(null);
      } else {
        setResults(null);
        setError(result.error || 'Query execution failed');
      }

      setIsLoading(false);
    }, 300);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setHighlightedIndex(-1);

    if (value.trim()) {
      setShowSuggestions(true);
    }
  }, []);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    if (!searchInput.trim()) return;

    if (suggestions.length > 0) {
      const index = highlightedIndex >= 0 ? highlightedIndex : 0;
      executeQuestion(suggestions[index].question);
      return;
    }

    const bestMatch = getBestMatch(searchInput);
    if (bestMatch) {
      executeQuestion(bestMatch);
    }
  }, [searchInput, suggestions, highlightedIndex, executeQuestion]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: QuestionSuggestion) => {
    setSearchInput(suggestion.question.question);
    executeQuestion(suggestion.question);
  }, [executeQuestion]);

  // Handle question selection from category browser
  const handleQuestionSelect = useCallback((question: TemplateQuestion) => {
    setSearchInput(question.question);
    executeQuestion(question);
  }, [executeQuestion]);

  // Handle filter change
  const handleFilterChange = useCallback((filterType: QuickFilterType, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  // Handle re-run query with filters
  const handleRunQuery = useCallback(() => {
    if (selectedQuestion) {
      executeQuestion(selectedQuestion);
    }
  }, [selectedQuestion, executeQuestion]);

  // Handle back to search
  const handleBackToSearch = useCallback(() => {
    setViewMode('search');
    setSelectedQuestion(null);
    setResults(null);
    setError(null);
    setSearchInput('');
    setIsBookmarked(false);
  }, []);

  // Handle bookmark
  const handleBookmark = useCallback(() => {
    if (!selectedQuestion) return;

    const bookmarks = loadBookmarkedReports();
    const bookmarkId = `question-${selectedQuestion.id}`;

    if (isBookmarked) {
      // Remove bookmark
      const updated = bookmarks.filter(b => b.id !== bookmarkId);
      saveBookmarkedReports(updated);
      setIsBookmarked(false);
    } else {
      // Add bookmark
      const queryStr = generateQueryString(selectedQuestion);
      const newBookmark: SavedJQLReport = {
        id: bookmarkId,
        name: selectedQuestion.question,
        description: selectedQuestion.description,
        jqlQuery: queryStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByUserId: 'user-001',
        createdByUserName: 'Current User',
      };
      saveBookmarkedReports([newBookmark, ...bookmarks]);
      setIsBookmarked(true);
      setShowBookmarkToast(true);
      setTimeout(() => setShowBookmarkToast(false), 2000);
    }
  }, [selectedQuestion, isBookmarked]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions.length]);

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onKeyDown={handleKeyDown}
    >
      {/* Search View */}
      {viewMode === 'search' && (
        <>
          {/* Search Input Section */}
          <div style={styles.searchSection}>
            <div style={styles.inputContainer}>
              <QuestionInput
                value={searchInput}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onFocus={() => searchInput.trim() && setShowSuggestions(true)}
                isLoading={isLoading}
                showSuggestions={showSuggestions}
              />

              {/* Suggestions Dropdown */}
              <QuestionSuggestions
                suggestions={suggestions}
                onSelect={handleSuggestionSelect}
                highlightedIndex={highlightedIndex}
                onHighlight={setHighlightedIndex}
                isVisible={showSuggestions && suggestions.length > 0}
              />
            </div>
          </div>

          {/* Category Browser */}
          <div style={styles.browserSection}>
            <QuestionCategoryBrowser
              onSelectQuestion={handleQuestionSelect}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </>
      )}

      {/* Results View */}
      {viewMode === 'results' && selectedQuestion && (
        <>
          {/* Back button and Bookmark button */}
          <div style={styles.resultsHeader}>
            <button onClick={handleBackToSearch} style={styles.backButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to Questions
            </button>
            <button
              onClick={handleBookmark}
              style={{
                ...styles.bookmarkButton,
                ...(isBookmarked ? styles.bookmarkButtonActive : {}),
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "#FFAB00" : "none"} stroke={isBookmarked ? "#FFAB00" : "currentColor"} strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
          </div>

          {/* Bookmark Toast */}
          {showBookmarkToast && (
            <div style={styles.toast}>
              Bookmarked! View in the Bookmarked tab.
            </div>
          )}

          {/* Interpreted Query Display */}
          <InterpretedQueryDisplay
            question={selectedQuestion}
          />

          {/* Quick Filters */}
          {selectedQuestion.suggestedFilters && selectedQuestion.suggestedFilters.length > 0 && (
            <QuickFilterBar
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              availableFilters={selectedQuestion.suggestedFilters}
              onRunQuery={handleRunQuery}
              isLoading={isLoading}
            />
          )}

          {/* Error Display */}
          {error && (
            <div style={styles.errorBanner}>
              {error}
            </div>
          )}

          {/* Results Table */}
          <div style={styles.resultsTableContainer}>
            <ResultsTable
              results={results}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Generate query string from question for display/execution
function generateQueryString(question: TemplateQuestion): string {
  const { underlyingQuery } = question;
  const { entityType, groups, groupOperator, sortBy, limit } = underlyingQuery;

  const entityNames: Record<string, string> = {
    teams: 'Teams',
    assessments: 'Assessments',
    dimensions: 'Dimensions',
    indicators: 'Indicators',
    users: 'Users',
    issues: 'Issues',
    sprints: 'Sprints',
    teamMetrics: 'TeamMetrics',
    sprintMetrics: 'SprintMetrics',
    userActivity: 'UserActivity',
    outcomeConfidence: 'OutcomeConfidence',
  };

  let queryStr = entityNames[entityType] || entityType;

  const conditionParts: string[] = [];

  groups.forEach((group: QueryConditionGroup) => {
    const groupConditions = group.conditions
      .filter((c) => c.fieldId && c.value !== '')
      .map((c) => {
        const opStr = getOperatorString(c.operator);
        let valueStr: string;

        if (typeof c.value === 'boolean') {
          valueStr = c.value ? 'true' : 'false';
        } else if (Array.isArray(c.value)) {
          valueStr = `(${c.value.map(v => `"${v}"`).join(', ')})`;
        } else {
          valueStr = typeof c.value === 'string' ? `"${c.value}"` : String(c.value);
        }

        return `${c.fieldId} ${opStr} ${valueStr}`;
      });

    if (groupConditions.length > 0) {
      const groupStr = groupConditions.join(` ${group.logicalOperator} `);
      conditionParts.push(groupConditions.length > 1 ? `(${groupStr})` : groupStr);
    }
  });

  if (conditionParts.length > 0) {
    queryStr += ` WHERE ${conditionParts.join(` ${groupOperator} `)}`;
  }

  if (sortBy) {
    queryStr += ` ORDER BY ${sortBy.field} ${sortBy.direction.toUpperCase()}`;
  }

  if (limit) {
    queryStr += ` LIMIT ${limit}`;
  }

  return queryStr;
}

function getOperatorString(operator: string): string {
  const opMap: Record<string, string> = {
    equals: '=',
    notEquals: '!=',
    contains: '~',
    startsWith: '~',
    endsWith: '~',
    in: 'IN',
    notIn: 'NOT IN',
    greaterThan: '>',
    lessThan: '<',
    greaterThanOrEqual: '>=',
    lessThanOrEqual: '<=',
    between: 'BETWEEN',
    before: '<',
    after: '>',
    inLast: 'IN LAST',
    isTrue: '= true',
    isFalse: '= false',
  };
  return opMap[operator] || '=';
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    padding: '32px 24px 0 24px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #EBECF0',
  },
  inputContainer: {
    position: 'relative',
    maxWidth: '800px',
    margin: '0 auto',
    paddingBottom: '24px',
  },
  browserSection: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#FAFBFC',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bookmarkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bookmarkButtonActive: {
    backgroundColor: '#FFFAE6',
    borderColor: '#FFAB00',
    color: '#172B4D',
  },
  toast: {
    position: 'absolute',
    top: '60px',
    right: '24px',
    padding: '12px 20px',
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 100,
  },
  errorBanner: {
    padding: '12px 24px',
    backgroundColor: '#FFEBE6',
    borderBottom: '1px solid #DE350B',
    color: '#DE350B',
    fontSize: '13px',
  },
  resultsTableContainer: {
    flex: 1,
    overflow: 'hidden',
  },
};

export default QuestionQueryBuilder;
