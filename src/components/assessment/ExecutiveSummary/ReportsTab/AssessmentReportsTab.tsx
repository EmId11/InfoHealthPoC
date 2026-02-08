import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AssessmentResult } from '../../../../types/assessment';
import {
  AssessmentQuestionTemplate,
  AssessmentQuestionSuggestion,
  AssessmentQueryResult,
} from '../../../../types/assessmentReports';
import {
  getAssessmentSuggestions,
  getAssessmentBestMatch,
  executeAssessmentQuery,
  getSuggestedQuestionsForAssessment,
} from '../../../../utils/assessmentQueryEngine';
import { ALL_ASSESSMENT_QUESTION_TEMPLATES } from '../../../../constants/assessmentQuestionTemplates';
import AssessmentQuestionInput from './AssessmentQuestionInput';
import AssessmentQuestionBrowser from './AssessmentQuestionBrowser';
import AssessmentQueryResults from './AssessmentQueryResults';

// Storage key for bookmarked assessment questions
const ASSESSMENT_BOOKMARKS_KEY = 'assessment-bookmarked-questions';

// Load bookmarked question IDs from localStorage
const loadBookmarkedQuestionIds = (): string[] => {
  try {
    const stored = localStorage.getItem(ASSESSMENT_BOOKMARKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save bookmarked question IDs to localStorage
const saveBookmarkedQuestionIds = (ids: string[]) => {
  try {
    localStorage.setItem(ASSESSMENT_BOOKMARKS_KEY, JSON.stringify(ids));
  } catch {
    console.error('Failed to save bookmarks to localStorage');
  }
};

// Check if a question is bookmarked
const isQuestionBookmarked = (questionId: string): boolean => {
  const bookmarks = loadBookmarkedQuestionIds();
  return bookmarks.includes(questionId);
};

// Get bookmarked questions
const getBookmarkedQuestions = (): AssessmentQuestionTemplate[] => {
  const bookmarkIds = loadBookmarkedQuestionIds();
  return ALL_ASSESSMENT_QUESTION_TEMPLATES.filter(q => bookmarkIds.includes(q.id));
};

interface AssessmentReportsTabProps {
  assessmentResult: AssessmentResult;
  onNavigateToDimension?: (dimensionKey: string) => void;
}

type ViewMode = 'search' | 'results';

const AssessmentReportsTab: React.FC<AssessmentReportsTabProps> = ({
  assessmentResult,
  onNavigateToDimension,
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestionTemplate | null>(null);
  const [results, setResults] = useState<AssessmentQueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<AssessmentQuestionTemplate[]>([]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Load bookmarked questions on mount
  useEffect(() => {
    setBookmarkedQuestions(getBookmarkedQuestions());
  }, []);

  // Computed suggestions
  const suggestions = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }
    return getAssessmentSuggestions(searchInput, 6);
  }, [searchInput]);

  // Get suggested questions based on assessment data
  const suggestedQuestions = useMemo(() => {
    return getSuggestedQuestionsForAssessment(assessmentResult, 4);
  }, [assessmentResult]);

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

  // Execute query for a question
  const executeQuestion = useCallback((question: AssessmentQuestionTemplate) => {
    setIsLoading(true);
    setSelectedQuestion(question);
    setViewMode('results');
    setShowSuggestions(false);
    setIsBookmarked(isQuestionBookmarked(question.id));

    // Simulate async execution (for visual feedback)
    setTimeout(() => {
      const result = executeAssessmentQuery(question, assessmentResult);
      setResults(result);
      setIsLoading(false);
    }, 200);
  }, [assessmentResult]);

  // Handle bookmark toggle
  const handleBookmark = useCallback(() => {
    if (!selectedQuestion) return;

    const bookmarkIds = loadBookmarkedQuestionIds();

    if (isBookmarked) {
      // Remove bookmark
      const updated = bookmarkIds.filter(id => id !== selectedQuestion.id);
      saveBookmarkedQuestionIds(updated);
      setIsBookmarked(false);
      setBookmarkedQuestions(getBookmarkedQuestions());
    } else {
      // Add bookmark
      saveBookmarkedQuestionIds([selectedQuestion.id, ...bookmarkIds]);
      setIsBookmarked(true);
      setBookmarkedQuestions(getBookmarkedQuestions());
      setShowBookmarkToast(true);
      setTimeout(() => setShowBookmarkToast(false), 2000);
    }
  }, [selectedQuestion, isBookmarked]);

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

    const bestMatch = getAssessmentBestMatch(searchInput);
    if (bestMatch) {
      executeQuestion(bestMatch);
    }
  }, [searchInput, suggestions, highlightedIndex, executeQuestion]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: AssessmentQuestionSuggestion) => {
    setSearchInput(suggestion.question.question);
    executeQuestion(suggestion.question);
  }, [executeQuestion]);

  // Handle question selection from category browser
  const handleQuestionSelect = useCallback((question: AssessmentQuestionTemplate) => {
    setSearchInput(question.question);
    executeQuestion(question);
  }, [executeQuestion]);

  // Handle back to search
  const handleBackToSearch = useCallback(() => {
    setViewMode('search');
    setSelectedQuestion(null);
    setResults(null);
    setSearchInput('');
    setIsBookmarked(false);
  }, []);

  // Handle row click (navigate to dimension)
  const handleRowClick = useCallback((rowId: string) => {
    if (onNavigateToDimension) {
      onNavigateToDimension(rowId);
    }
  }, [onNavigateToDimension]);

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
              <AssessmentQuestionInput
                value={searchInput}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
                onFocus={() => searchInput.trim() && setShowSuggestions(true)}
                isLoading={isLoading}
                showSuggestions={showSuggestions}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestionsDropdown}>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.question.id}
                      style={{
                        ...styles.suggestionItem,
                        ...(index === highlightedIndex ? styles.suggestionItemHighlighted : {}),
                      }}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div style={styles.suggestionQuestion}>
                        {suggestion.question.question}
                      </div>
                      <div style={styles.suggestionDescription}>
                        {suggestion.question.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Browser */}
          <div style={styles.browserSection}>
            <AssessmentQuestionBrowser
              onSelectQuestion={handleQuestionSelect}
              suggestedQuestions={suggestedQuestions}
              bookmarkedQuestions={bookmarkedQuestions}
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
            <div style={styles.questionDisplay}>
              <span style={styles.questionIcon}>?</span>
              <span style={styles.questionText}>{selectedQuestion.question}</span>
            </div>
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
              Bookmarked! Find it in your bookmarks section.
            </div>
          )}

          {/* Results Table */}
          <div style={styles.resultsTableContainer}>
            <AssessmentQueryResults
              results={results}
              isLoading={isLoading}
              onRowClick={handleRowClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '500px',
    animation: 'fadeInUp 0.3s ease-out',
  },
  searchSection: {
    padding: '24px 0 0 0',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #EBECF0',
    borderRadius: '8px 8px 0 0',
  },
  inputContainer: {
    position: 'relative',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px 24px 24px',
  },
  browserSection: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#FAFBFC',
    borderRadius: '0 0 8px 8px',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: '24px',
    right: '24px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    maxHeight: '400px',
    overflow: 'auto',
  },
  suggestionItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #EBECF0',
    transition: 'background-color 0.1s ease',
  },
  suggestionItemHighlighted: {
    backgroundColor: '#F4F5F7',
  },
  suggestionQuestion: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '4px',
  },
  suggestionDescription: {
    fontSize: '12px',
    color: '#6B778C',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px 8px 0 0',
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
    flexShrink: 0,
  },
  questionDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    minWidth: 0,
  },
  questionIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  questionText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  resultsTableContainer: {
    flex: 1,
    padding: '0 24px 24px 24px',
    backgroundColor: '#FAFBFC',
    borderRadius: '0 0 8px 8px',
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
    flexShrink: 0,
  },
  bookmarkButtonActive: {
    backgroundColor: '#FFFAE6',
    borderColor: '#FFAB00',
    color: '#172B4D',
  },
  toast: {
    position: 'absolute' as const,
    top: '70px',
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
};

export default AssessmentReportsTab;
