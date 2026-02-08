import React, { useState } from 'react';
import { IssueListReport as IssueListReportType, JiraIssue } from '../../../../types/assessment';
import PaginationControls from '../shared/PaginationControls';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface IssueListReportProps {
  report: IssueListReportType;
}

const IssueListReport: React.FC<IssueListReportProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const totalPages = Math.ceil(report.yourIssues.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleIssues = report.yourIssues.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('done') || lowercaseStatus.includes('complete')) {
      return { bg: '#E3FCEF', text: '#006644' };
    }
    if (lowercaseStatus.includes('progress') || lowercaseStatus.includes('review')) {
      return { bg: '#DEEBFF', text: '#0052CC' };
    }
    return { bg: '#F4F5F7', text: '#5E6C84' };
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return { bg: '#F4F5F7', text: '#5E6C84' };
    const p = priority.toLowerCase();
    if (p.includes('highest') || p.includes('critical')) return { bg: '#FFEBE6', text: '#BF2600' };
    if (p.includes('high')) return { bg: '#FFEBE6', text: '#DE350B' };
    if (p.includes('medium')) return { bg: '#FFF5E6', text: '#974F0C' };
    if (p.includes('low')) return { bg: '#E3FCEF', text: '#006644' };
    return { bg: '#F4F5F7', text: '#5E6C84' };
  };

  return (
    <div style={styles.container}>
      {/* Summary Stats */}
      <div style={styles.summaryBar}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryValue}>{report.yourMatchingCount}</span>
          <span style={styles.summaryLabel}>{report.issueListTitle}</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={styles.summaryValue}>{report.yourTotalIssues}</span>
          <span style={styles.summaryLabel}>Total Issues</span>
        </div>
        <div style={styles.summaryDivider} />
        <div style={styles.summaryItem}>
          <span style={{
            ...styles.summaryValue,
            color: report.yourPercentage > 30 ? '#DE350B' : report.yourPercentage > 15 ? '#FF991F' : '#36B37E',
          }}>
            {report.yourPercentage.toFixed(1)}%
          </span>
          <span style={styles.summaryLabel}>Percentage</span>
        </div>
      </div>

      {/* Issue List Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>{report.issueListTitle}</h3>
          <span style={styles.tableSubtitle}>{report.description}</span>
        </div>

        {report.yourIssues.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✓</span>
            <p style={styles.emptyText}>No issues found matching this criteria.</p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={{ ...styles.th, width: '120px' }}>Key</th>
                    <th style={{ ...styles.th, width: '40%' }}>Summary</th>
                    <th style={{ ...styles.th, width: '100px' }}>Type</th>
                    <th style={{ ...styles.th, width: '100px' }}>Status</th>
                    <th style={{ ...styles.th, width: '120px' }}>Assignee</th>
                    {report.yourIssues[0]?.daysStale !== undefined && (
                      <th style={{ ...styles.th, width: '90px' }}>Days Stale</th>
                    )}
                    <th style={{ ...styles.th, width: '100px' }}>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleIssues.map((issue) => {
                    const statusColors = getStatusColor(issue.status);
                    return (
                      <tr key={issue.issueKey} style={styles.tableRow}>
                        <td style={styles.td}>
                          <a
                            href={`#${issue.issueKey}`}
                            style={styles.issueKey}
                            onClick={(e) => e.preventDefault()}
                          >
                            {issue.issueKey}
                          </a>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.issueSummary}>{issue.summary}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.issueType}>{issue.issueType}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                          }}>
                            {issue.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.assignee}>
                            {issue.assignee || <span style={styles.unassigned}>Unassigned</span>}
                          </span>
                        </td>
                        {issue.daysStale !== undefined && (
                          <td style={styles.td}>
                            <span style={{
                              ...styles.daysStale,
                              color: issue.daysStale > 30 ? '#DE350B' : issue.daysStale > 14 ? '#FF991F' : '#172B4D',
                            }}>
                              {issue.daysStale} days
                            </span>
                          </td>
                        )}
                        <td style={styles.td}>
                          <span style={styles.dateText}>{formatDate(issue.updated)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={report.yourIssues.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="issues"
            />
          </>
        )}
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel={`% ${report.issueListTitle}`}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#172B4D',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 500,
  },
  summaryDivider: {
    width: '1px',
    height: '48px',
    backgroundColor: '#DFE1E6',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  tableTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  tableSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  headerRow: {
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #EBECF0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  issueKey: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0052CC',
    textDecoration: 'none',
  },
  issueSummary: {
    fontSize: '13px',
    color: '#172B4D',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
  issueType: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  assignee: {
    fontSize: '13px',
    color: '#172B4D',
  },
  unassigned: {
    color: '#6B778C',
    fontStyle: 'italic',
  },
  daysStale: {
    fontSize: '13px',
    fontWeight: 600,
  },
  dateText: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#E3FCEF',
    color: '#36B37E',
    fontSize: '24px',
    marginBottom: '16px',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
};

export default IssueListReport;
