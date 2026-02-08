import React, { useState } from 'react';
import {
  AssessmentQuestionCategory,
  AssessmentQuestionTemplate,
  ALL_ASSESSMENT_QUESTION_CATEGORIES,
  ASSESSMENT_QUESTION_CATEGORY_LABELS,
  ASSESSMENT_QUESTION_CATEGORY_DESCRIPTIONS,
} from '../../../../types/assessmentReports';
import {
  getAssessmentQuestionsByCategory,
  getAssessmentQuestionCountByCategory,
} from '../../../../constants/assessmentQuestionTemplates';

interface AssessmentQuestionBrowserProps {
  onSelectQuestion: (question: AssessmentQuestionTemplate) => void;
  suggestedQuestions?: AssessmentQuestionTemplate[];
  bookmarkedQuestions?: AssessmentQuestionTemplate[];
}

// Get icon SVG for category
const getCategoryIcon = (category: AssessmentQuestionCategory) => {
  switch (category) {
    case 'dimensions':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="#0052CC" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="#0052CC" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="#0052CC" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="#0052CC" strokeWidth="2" />
        </svg>
      );
    case 'indicators':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v20M2 12h20" stroke="#00875A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="#00875A" strokeWidth="2" />
        </svg>
      );
    case 'comparison':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="#6554C0" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trends':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="#FF8B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h6v6" stroke="#FF8B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'recommendations':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="#FF5630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#FF5630" strokeWidth="2" />
        </svg>
      );
  }
};

const AssessmentQuestionBrowser: React.FC<AssessmentQuestionBrowserProps> = ({
  onSelectQuestion,
  suggestedQuestions = [],
  bookmarkedQuestions = [],
}) => {
  const [expandedCategory, setExpandedCategory] = useState<AssessmentQuestionCategory | null>(null);
  const questionCounts = getAssessmentQuestionCountByCategory();

  const handleCategoryClick = (category: AssessmentQuestionCategory) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div style={styles.container}>
      {/* Bookmarked Questions Section */}
      {bookmarkedQuestions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <span style={styles.bookmarkIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFAB00" stroke="#FFAB00" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            Your Bookmarks
          </h3>
          <div style={styles.suggestionsList}>
            {bookmarkedQuestions.map((question) => (
              <div
                key={question.id}
                style={styles.bookmarkCard}
                onClick={() => onSelectQuestion(question)}
              >
                <div style={styles.suggestionText}>{question.question}</div>
                <div style={styles.suggestionMeta}>
                  <span style={styles.categoryTag}>
                    {ASSESSMENT_QUESTION_CATEGORY_LABELS[question.category]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested For You Section */}
      {suggestedQuestions.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Suggested for this assessment</h3>
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
                    {ASSESSMENT_QUESTION_CATEGORY_LABELS[question.category]}
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
          {ALL_ASSESSMENT_QUESTION_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category;
            const questions = getAssessmentQuestionsByCategory(category);
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
                      {ASSESSMENT_QUESTION_CATEGORY_LABELS[category]}
                    </div>
                    <div style={styles.categoryDescription}>
                      {ASSESSMENT_QUESTION_CATEGORY_DESCRIPTIONS[category]}
                    </div>
                    <div style={styles.categoryCount}>
                      {count} question{count !== 1 ? 's' : ''}
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  bookmarkIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  bookmarkCard: {
    padding: '16px',
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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

export default AssessmentQuestionBrowser;
