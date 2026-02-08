import React, { useState } from 'react';
import { SprintListReport as SprintListReportType, SimilarTeamComparison } from '../../../../types/assessment';
import PaginationControls from '../shared/PaginationControls';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface SprintListReportProps {
  report: SprintListReportType;
}

const SprintListReport: React.FC<SprintListReportProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(report.yourSprints.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleSprints = report.yourSprints.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'active': return { bg: '#DEEBFF', color: '#0747A6' };
      case 'closed': return { bg: '#E3FCEF', color: '#006644' };
      case 'future': return { bg: '#F4F5F7', color: '#5E6C84' };
      default: return { bg: '#F4F5F7', color: '#5E6C84' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Summary Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{report.yourMatchingCount}</span>
          <span style={styles.statLabel}>Matching Sprints</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{report.yourTotalSprints}</span>
          <span style={styles.statLabel}>Total Sprints</span>
        </div>
        <div style={styles.statCard}>
          <span style={{
            ...styles.statValue,
            color: report.yourPercentage > 30 ? '#DE350B' : report.yourPercentage > 15 ? '#FF991F' : '#36B37E',
          }}>
            {report.yourPercentage.toFixed(0)}%
          </span>
          <span style={styles.statLabel}>Match Rate</span>
        </div>
      </div>

      {/* Sprint Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>{report.sprintListTitle}</h3>
          <span style={styles.tableSubtitle}>{report.description}</span>
        </div>

        {report.yourSprints.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={styles.emptyTitle}>No matching sprints</p>
            <p style={styles.emptyText}>All sprints meet the expected criteria.</p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={{ ...styles.th, width: '25%' }}>Sprint Name</th>
                    <th style={{ ...styles.th, width: '20%' }}>Goal</th>
                    <th style={{ ...styles.th, width: '15%' }}>Start Date</th>
                    <th style={{ ...styles.th, width: '15%' }}>End Date</th>
                    <th style={{ ...styles.th, width: '10%' }}>Issues</th>
                    <th style={{ ...styles.th, width: '15%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSprints.map((sprint) => {
                    const stateStyle = getStateColor(sprint.state);
                    return (
                      <tr key={sprint.sprintId} style={styles.tableRow}>
                        <td style={styles.td}>
                          <span style={styles.sprintName}>{sprint.sprintName}</span>
                        </td>
                        <td style={styles.td}>
                          {sprint.sprintGoal ? (
                            <span style={styles.goalText}>{sprint.sprintGoal}</span>
                          ) : (
                            <span style={styles.noGoal}>No goal set</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dateText}>{formatDate(sprint.startDate)}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dateText}>{formatDate(sprint.endDate)}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.issueCount}>
                            {sprint.completedCount}/{sprint.issueCount}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: stateStyle.bg,
                            color: stateStyle.color,
                          }}>
                            {sprint.state.charAt(0).toUpperCase() + sprint.state.slice(1)}
                          </span>
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
              totalItems={report.yourSprints.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="sprints"
            />
          </>
        )}
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel="% Matching"
        valueFormatter={(team: SimilarTeamComparison) => `${team.value.toFixed(0)}%`}
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
  statsRow: {
    display: 'flex',
    gap: '16px',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6B778C',
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
  sprintName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  goalText: {
    fontSize: '13px',
    color: '#172B4D',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  noGoal: {
    fontSize: '13px',
    color: '#DE350B',
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  issueCount: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
};

export default SprintListReport;
