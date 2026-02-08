import React, { useState } from 'react';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { SimilarTeamComparison } from '../../../../types/assessment';

interface SimilarTeamsTableProps {
  teams: SimilarTeamComparison[];
  valueLabel: string;
  pageSize?: number;
  valueFormatter?: (team: SimilarTeamComparison) => string;
}

const SimilarTeamsTable: React.FC<SimilarTeamsTableProps> = ({
  teams,
  valueLabel,
  pageSize = 10,
  valueFormatter,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(teams.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, teams.length);
  const visibleTeams = teams.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 67) return { bg: '#E3FCEF', text: '#006644' };
    if (percentile >= 34) return { bg: '#FFF5E6', text: '#974F0C' };
    return { bg: '#FFEBE6', text: '#BF2600' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Similar Teams Comparison</h3>
        <span style={styles.subtitle}>
          Showing {startIndex + 1}-{endIndex} of {teams.length} teams
        </span>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={{ ...styles.th, width: '60px' }}>Rank</th>
              <th style={{ ...styles.th, width: '40%' }}>Team</th>
              <th style={{ ...styles.th, width: '25%' }}>{valueLabel}</th>
              <th style={{ ...styles.th, width: '25%' }}>Percentile</th>
            </tr>
          </thead>
          <tbody>
            {visibleTeams.map((team) => {
              const percentileColors = getPercentileColor(team.percentile);
              return (
                <tr
                  key={team.teamId}
                  style={{
                    ...styles.tableRow,
                    backgroundColor: team.isYourTeam ? '#DEEBFF' : 'transparent',
                  }}
                >
                  <td style={styles.td}>
                    <span style={{
                      ...styles.rankBadge,
                      backgroundColor: team.rank <= 3 ? '#FFF0B3' : '#F4F5F7',
                      color: team.rank <= 3 ? '#172B4D' : '#5E6C84',
                    }}>
                      #{team.rank}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.teamCell}>
                      <span style={styles.teamName}>
                        {team.teamName}
                        {team.isYourTeam && (
                          <span style={styles.yourTeamBadge}>Your Team</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.valueText}>
                      {valueFormatter ? valueFormatter(team) : team.displayValue}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.percentileBadge,
                      backgroundColor: percentileColors.bg,
                      color: percentileColors.text,
                    }}>
                      {team.percentile}th
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={{
              ...styles.pageButton,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon label="" size="small" primaryColor="#42526E" />
            Previous
          </button>

          <div style={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </div>

          <button
            style={{
              ...styles.pageButton,
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRightIcon label="" size="small" primaryColor="#42526E" />
          </button>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    fontSize: '12px',
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
  rankBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  teamName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  yourTeamBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  percentileBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageIndicator: {
    fontSize: '13px',
    color: '#6B778C',
  },
};

export default SimilarTeamsTable;
