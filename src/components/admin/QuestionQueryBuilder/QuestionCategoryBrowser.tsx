import React, { useState } from 'react';
import {
  QuestionCategory,
  ALL_QUESTION_CATEGORIES,
  QUESTION_CATEGORY_LABELS,
  QUESTION_CATEGORY_DESCRIPTIONS,
  TemplateQuestion,
} from '../../../types/questionBuilder';
import { getQuestionsByCategory, getQuestionCountByCategory } from '../../../constants/questionTemplates';

interface QuestionCategoryBrowserProps {
  onSelectQuestion: (question: TemplateQuestion) => void;
  suggestedQuestions?: TemplateQuestion[];
}

// Category icons as simple emoji/text
const CATEGORY_ICONS: Record<QuestionCategory, string> = {
  'team-health': 'heart',
  'outcomes': 'target',
  'data-quality': 'check',
  'trends': 'trending',
  'users': 'users',
};

// Get icon SVG for category
const getCategoryIcon = (category: QuestionCategory) => {
  switch (category) {
    case 'team-health':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#FF5630" />
        </svg>
      );
    case 'outcomes':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#0052CC" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="#0052CC" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="#0052CC" />
        </svg>
      );
    case 'data-quality':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#00875A" strokeWidth="2" />
        </svg>
      );
    case 'trends':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h6v6" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'users':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#5E6C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="#5E6C84" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#5E6C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#5E6C84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
};

const QuestionCategoryBrowser: React.FC<QuestionCategoryBrowserProps> = ({
  onSelectQuestion,
  suggestedQuestions = [],
}) => {
  const [expandedCategory, setExpandedCategory] = useState<QuestionCategory | null>(null);
  const questionCounts = getQuestionCountByCategory();

  const handleCategoryClick = (category: QuestionCategory) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div style={styles.container}>
      {/* Suggested For You Section */}
      {suggestedQuestions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Suggested for you</h3>
          <div style={styles.suggestionsList}>
            {suggestedQuestions.slice(0, 4).map((question) => (
              <div
                key={question.id}
                style={styles.suggestionCard}
                onClick={() => onSelectQuestion(question)}
              >
                <div style={styles.suggestionText}>{question.question}</div>
                <div style={styles.suggestionMeta}>
                  <span style={styles.categoryTag}>
                    {QUESTION_CATEGORY_LABELS[question.category]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse by Topic Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Browse by topic</h3>
        <div style={styles.categoriesGrid}>
          {ALL_QUESTION_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category;
            const questions = getQuestionsByCategory(category);
            const count = questionCounts.get(category) || 0;

            return (
              <div key={category} style={styles.categorySection}>
                <div
                  style={{
                    ...styles.categoryCard,
                    ...(isExpanded ? styles.categoryCardExpanded : {}),
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div style={styles.categoryIcon}>
                    {getCategoryIcon(category)}
                  </div>
                  <div style={styles.categoryContent}>
                    <div style={styles.categoryName}>
                      {QUESTION_CATEGORY_LABELS[category]}
                    </div>
                    <div style={styles.categoryDescription}>
                      {QUESTION_CATEGORY_DESCRIPTIONS[category]}
                    </div>
                    <div style={styles.categoryCount}>
                      {count} questions
                    </div>
                  </div>
                  <div style={{
                    ...styles.expandIcon,
                    ...(isExpanded ? styles.expandIconExpanded : {}),
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="#6B778C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Questions List */}
                {isExpanded && (
                  <div style={styles.questionsList}>
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        style={styles.questionItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuestion(question);
                        }}
                      >
                        <span style={styles.questionItemText}>{question.question}</span>
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
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  suggestionsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  suggestionCard: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  suggestionText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  suggestionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  categoryTag: {
    padding: '3px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#5E6C84',
  },
  categoriesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  categoryCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'transparent',
  },
  categoryIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    flexShrink: 0,
  },
  categoryContent: {
    flex: 1,
    minWidth: 0,
  },
  categoryName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '4px',
  },
  categoryDescription: {
    fontSize: '13px',
    color: '#6B778C',
    marginBottom: '4px',
    lineHeight: 1.4,
  },
  categoryCount: {
    fontSize: '12px',
    color: '#97A0AF',
  },
  expandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 0.2s ease',
  },
  expandIconExpanded: {
    transform: 'rotate(180deg)',
  },
  questionsList: {
    backgroundColor: '#FAFBFC',
    border: '1px solid #DFE1E6',
    borderTop: 'none',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    padding: '8px 0',
  },
  questionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
  },
  questionItemText: {
    fontSize: '14px',
    color: '#172B4D',
    flex: 1,
  },
};

export default QuestionCategoryBrowser;
