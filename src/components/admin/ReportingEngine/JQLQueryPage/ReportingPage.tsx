import React, { useState, useCallback, useEffect } from 'react';
import { QuestionQueryBuilder } from '../../QuestionQueryBuilder';
import { SavedJQLReport } from '../../../../types/reports';
import { executeJQL } from '../../../../utils/jqlParser';
import ResultsTable from './ResultsTable';
import { ReportResults } from '../../../../types/reports';

// Storage key for bookmarked reports
const BOOKMARKED_REPORTS_KEY = 'bookmarked-reports';

// Sample bookmarked reports for demo (using question format)
const SAMPLE_BOOKMARKED_REPORTS: SavedJQLReport[] = [
  {
    id: 'sample-1',
    name: 'Which teams are at risk of missing commitments?',
    description: 'Teams with declining sprint predictability or low commitment reliability',
    jqlQuery: 'Teams WHERE dimension.sprintPredictability.trend = "declining"',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    createdByUserId: 'user-001',
    createdByUserName: 'Sarah Chen',
  },
  {
    id: 'sample-2',
    name: 'Which issues haven\'t been updated recently?',
    description: 'In-progress issues with no activity in the last 7 days',
    jqlQuery: 'Issues WHERE status = "In Progress" AND daysStale > 7',
    createdAt: '2026-01-10T14:20:00Z',
    updatedAt: '2026-01-12T09:15:00Z',
    createdByUserId: 'user-001',
    createdByUserName: 'Sarah Chen',
  },
  {
    id: 'sample-3',
    name: 'Which teams have the most stale assessments?',
    description: 'Teams that haven\'t completed an assessment in 30+ days',
    jqlQuery: 'Teams WHERE lastAssessmentDaysAgo > 30 ORDER BY lastAssessmentDaysAgo DESC',
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    createdByUserId: 'user-002',
    createdByUserName: 'Mike Johnson',
  },
];

// Format relative time for display
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Load bookmarked reports from localStorage
const loadBookmarkedReports = (): SavedJQLReport[] => {
  try {
    const stored = localStorage.getItem(BOOKMARKED_REPORTS_KEY);
    const userReports = stored ? JSON.parse(stored) : [];
    return [...SAMPLE_BOOKMARKED_REPORTS, ...userReports];
  } catch {
    return SAMPLE_BOOKMARKED_REPORTS;
  }
};

// Save bookmarked reports to localStorage (only user-created ones)
const persistBookmarkedReports = (reports: SavedJQLReport[]) => {
  try {
    const userReports = reports.filter(r => !r.id.startsWith('sample-'));
    localStorage.setItem(BOOKMARKED_REPORTS_KEY, JSON.stringify(userReports));
  } catch {
    console.error('Failed to save bookmarks to localStorage');
  }
};

// Which tab is active
type ActiveTab = 'ask' | 'bookmarked';

const ReportingPage: React.FC = () => {
  // Which tab is selected
  const [activeTab, setActiveTab] = useState<ActiveTab>('ask');

  // Bookmarked reports state
  const [bookmarkedReports, setBookmarkedReports] = useState<SavedJQLReport[]>(loadBookmarkedReports);
  const [bookmarksSearch, setBookmarksSearch] = useState('');

  // Results state for bookmarked reports
  const [results, setResults] = useState<ReportResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [showingResults, setShowingResults] = useState(false);

  // Persist bookmarked reports when they change
  useEffect(() => {
    persistBookmarkedReports(bookmarkedReports);
  }, [bookmarkedReports]);

  // Handle bookmarked report selection
  const handleBookmarkedReportSelect = useCallback((report: SavedJQLReport) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(report.jqlQuery);
    setShowingResults(true);

    setTimeout(() => {
      const result = executeJQL(report.jqlQuery);

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

  // Handle remove bookmark
  const handleRemoveBookmark = useCallback((reportId: string) => {
    setBookmarkedReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  // Handle back from results
  const handleBackFromResults = useCallback(() => {
    setShowingResults(false);
    setResults(null);
    setError(null);
  }, []);

  // Switch to a tab
  const switchToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setShowingResults(false);
    setResults(null);
    setError(null);
  };

  // Filter bookmarked reports by search
  const filteredBookmarks = bookmarkedReports.filter(r =>
    bookmarksSearch === '' ||
    r.name.toLowerCase().includes(bookmarksSearch.toLowerCase()) ||
    r.description?.toLowerCase().includes(bookmarksSearch.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Top Tab Bar */}
      <div style={styles.topTabBar}>
        <button
          onClick={() => switchToTab('ask')}
          style={{
            ...styles.topTabButton,
            ...(activeTab === 'ask' ? styles.topTabButtonActive : {}),
          }}
        >
          Ask
        </button>
        <button
          onClick={() => switchToTab('bookmarked')}
          style={{
            ...styles.topTabButton,
            ...(activeTab === 'bookmarked' ? styles.topTabButtonActive : {}),
          }}
        >
          Bookmarked ({bookmarkedReports.length})
        </button>
      </div>

      {/* Content Area */}
      <div style={styles.contentSection}>
        {/* Ask tab - Question Query Builder */}
        {activeTab === 'ask' && (
          <div style={styles.askView}>
            <QuestionQueryBuilder />
          </div>
        )}

        {/* Bookmarked Reports tab */}
        {activeTab === 'bookmarked' && (
          <>
            {showingResults ? (
              <div style={styles.resultsContainer}>
                {/* Back button and header */}
                <div style={styles.resultsHeader}>
                  <button onClick={handleBackFromResults} style={styles.backButton}>
                    ← Back to Bookmarks
                  </button>
                </div>
                {/* Query display */}
                <div style={styles.queryDisplay}>
                  <code style={styles.queryCode}>{currentQuery}</code>
                </div>
                {/* Error display */}
                {error && (
                  <div style={styles.errorBanner}>
                    {error}
                  </div>
                )}
                <ResultsTable
                  results={results}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div style={styles.bookmarksView}>
                {/* Search bar */}
                <div style={styles.bookmarksSearchBar}>
                  <input
                    type="text"
                    placeholder="Search bookmarked reports..."
                    value={bookmarksSearch}
                    onChange={(e) => setBookmarksSearch(e.target.value)}
                    style={styles.bookmarksSearchInput}
                  />
                </div>

                {/* Bookmarked reports grid */}
                <div style={styles.bookmarksGrid}>
                  {filteredBookmarks.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#97A0AF" strokeWidth="1.5">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div style={styles.emptyTitle}>No bookmarked reports</div>
                      <div style={styles.emptySubtitle}>
                        {bookmarksSearch ? 'Try a different search term' : 'Bookmark reports from the Ask tab to see them here'}
                      </div>
                    </div>
                  ) : (
                    filteredBookmarks.map(report => (
                      <div
                        key={report.id}
                        style={styles.bookmarkCard}
                        onClick={() => handleBookmarkedReportSelect(report)}
                      >
                        <div style={styles.cardIconRow}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFAB00" stroke="#FFAB00" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </div>
                        <div style={styles.cardQuestion}>"{report.name}"</div>
                        {report.description && (
                          <div style={styles.cardDescription}>{report.description}</div>
                        )}
                        <div style={styles.bookmarkCardMeta}>
                          <span>{report.createdByUserName}</span>
                          <span style={styles.metaDot}>•</span>
                          <span>{formatRelativeTime(report.updatedAt)}</span>
                          {!report.id.startsWith('sample-') && (
                            <>
                              <span style={styles.metaDot}>•</span>
                              <button
                                style={styles.removeButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveBookmark(report.id);
                                }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  topTabBar: {
    display: 'flex',
    gap: '0',
    padding: '0 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  topTabButton: {
    padding: '14px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '-1px',
  },
  topTabButtonActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
    backgroundColor: '#FFFFFF',
  },
  contentSection: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  askView: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  // Results styles
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
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
  queryDisplay: {
    padding: '12px 20px',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #EBECF0',
  },
  queryCode: {
    fontSize: '13px',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    color: '#172B4D',
  },
  errorBanner: {
    padding: '12px 20px',
    backgroundColor: '#FFEBE6',
    borderBottom: '1px solid #DE350B',
    color: '#DE350B',
    fontSize: '13px',
  },
  // Bookmarks view styles
  bookmarksView: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  bookmarksSearchBar: {
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  bookmarksSearchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '10px 14px',
    border: '2px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  bookmarksGrid: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
    alignContent: 'start',
  },
  bookmarkCard: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardIconRow: {
    marginBottom: '12px',
  },
  cardQuestion: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    fontStyle: 'italic',
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  cardDescription: {
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
    marginBottom: '16px',
  },
  bookmarkCardMeta: {
    fontSize: '12px',
    color: '#97A0AF',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaDot: {
    color: '#DFE1E6',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#DE350B',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  // Empty state styles
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#6B778C',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#6B778C',
  },
};

export default ReportingPage;
