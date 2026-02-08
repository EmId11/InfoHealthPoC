import React from 'react';
import { QuestionSuggestion, QUESTION_CATEGORY_LABELS } from '../../../types/questionBuilder';

interface QuestionSuggestionsProps {
  suggestions: QuestionSuggestion[];
  onSelect: (suggestion: QuestionSuggestion) => void;
  highlightedIndex?: number;
  onHighlight?: (index: number) => void;
  isVisible: boolean;
}

const QuestionSuggestions: React.FC<QuestionSuggestionsProps> = ({
  suggestions,
  onSelect,
  highlightedIndex = -1,
  onHighlight,
  isVisible,
}) => {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>Suggested questions</span>
      </div>
      <div style={styles.list}>
        {suggestions.map((suggestion, index) => {
          const isHighlighted = index === highlightedIndex;
          return (
            <div
              key={suggestion.question.id}
              style={{
                ...styles.item,
                ...(isHighlighted ? styles.itemHighlighted : {}),
              }}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => onHighlight?.(index)}
            >
              <div style={styles.itemContent}>
                <div style={styles.questionText}>
                  {suggestion.question.question}
                </div>
                <div style={styles.itemMeta}>
                  <span style={styles.categoryBadge}>
                    {QUESTION_CATEGORY_LABELS[suggestion.question.category]}
                  </span>
                  {suggestion.matchedKeywords.length > 0 && (
                    <span style={styles.matchInfo}>
                      Matched: {suggestion.matchedKeywords.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.matchScore}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 12L10 8L6 4"
                    stroke="#97A0AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.footer}>
        <span style={styles.footerHint}>
          Press Enter to run, or click a suggestion
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    overflow: 'hidden',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  headerText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  list: {
    maxHeight: '320px',
    overflowY: 'auto' as const,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    borderBottom: '1px solid #F4F5F7',
  },
  itemHighlighted: {
    backgroundColor: '#F4F5F7',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  questionText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '4px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  categoryBadge: {
    padding: '2px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#5E6C84',
  },
  matchInfo: {
    fontSize: '12px',
    color: '#97A0AF',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footer: {
    padding: '10px 16px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  footerHint: {
    fontSize: '12px',
    color: '#97A0AF',
  },
};

export default QuestionSuggestions;
