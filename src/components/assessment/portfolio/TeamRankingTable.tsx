import React, { useState, useMemo } from 'react';
import Textfield from '@atlaskit/textfield';
import type { TeamRollup } from '../../../types/multiTeamAssessment';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface TeamRankingTableProps {
  teamResults: TeamRollup[];
  onTeamClick: (teamId: string) => void;
}

type SortField = 'rank' | 'teamName' | 'healthScore' | 'deviation';
type SortDirection = 'asc' | 'desc';

const TeamRankingTable: React.FC<TeamRankingTableProps> = ({
  teamResults,
  onTeamClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter and sort teams
  const filteredTeams = useMemo(() => {
    let teams = [...teamResults];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      teams = teams.filter((team) =>
        team.teamName.toLowerCase().includes(query)
      );
    }

    // Sort
    teams.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'rank':
          comparison = a.overallRank - b.overallRank;
          break;
        case 'teamName':
          comparison = a.teamName.localeCompare(b.teamName);
          break;
        case 'healthScore':
          comparison = b.overallHealthScore - a.overallHealthScore;
          break;
        case 'deviation':
          comparison = Math.abs(b.deviationFromMean) - Math.abs(a.deviationFromMean);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return teams;
  }, [teamResults, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Get trend from assessment result
  const getTeamTrend = (team: TeamRollup): string => {
    const dimensions = team.assessmentResult.dimensions;
    let improving = 0;
    let declining = 0;

    dimensions.forEach((dim) => {
      if (dim.trend === 'improving') improving++;
      if (dim.trend === 'declining') declining++;
    });

    if (improving > declining) return '↑';
    if (declining > improving) return '↓';
    return '→';
  };

  const getTrendColor = (team: TeamRollup): string => {
    const trend = getTeamTrend(team);
    if (trend === '↑') return '#00875A';
    if (trend === '↓') return '#DE350B';
    return '#6B778C';
  };

  // Find lowest dimension for each team
  const getLowestDimension = (team: TeamRollup): string => {
    const dimensions = team.assessmentResult.dimensions;
    if (dimensions.length === 0) return '-';

    const lowest = dimensions.reduce((min, dim) =>
      (dim.healthScore ?? dim.overallPercentile) < (min.healthScore ?? min.overallPercentile) ? dim : min
    );

    return lowest.dimensionName;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>All Teams</h3>
        <div style={styles.searchBox}>
          <Textfield
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th
                style={{ ...styles.th, width: '60px', cursor: 'pointer' }}
                onClick={() => handleSort('rank')}
              >
                Rank {getSortIcon('rank')}
              </th>
              <th
                style={{ ...styles.th, cursor: 'pointer' }}
                onClick={() => handleSort('teamName')}
              >
                Team {getSortIcon('teamName')}
              </th>
              <th
                style={{ ...styles.th, width: '120px', cursor: 'pointer' }}
                onClick={() => handleSort('healthScore')}
              >
                Health Score {getSortIcon('healthScore')}
              </th>
              <th style={{ ...styles.th, width: '80px' }}>Trend</th>
              <th
                style={{ ...styles.th, width: '100px', cursor: 'pointer' }}
                onClick={() => handleSort('deviation')}
              >
                vs. Avg {getSortIcon('deviation')}
              </th>
              <th style={{ ...styles.th, width: '180px' }}>Top Gap</th>
              <th style={{ ...styles.th, width: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => {
              const maturityConfig = getMaturityLevelConfig(team.overallHealthScore);
              const isOutlierAbove = team.isOutlier && team.outlierDirection === 'above';
              const isOutlierBelow = team.isOutlier && team.outlierDirection === 'below';

              return (
                <tr
                  key={team.teamId}
                  style={styles.tableRow}
                  onClick={() => onTeamClick(team.teamId)}
                >
                  <td style={styles.td}>
                    <span style={styles.rank}>{team.overallRank}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.teamCell}>
                      <span style={styles.teamName}>{team.teamName}</span>
                      {team.isOutlier && (
                        <span
                          style={{
                            ...styles.outlierBadge,
                            backgroundColor: isOutlierAbove ? '#E3FCEF' : '#FFEBE6',
                            color: isOutlierAbove ? '#006644' : '#DE350B',
                          }}
                        >
                          {isOutlierAbove ? 'Top Performer' : 'Needs Focus'}
                        </span>
                      )}
                      {team.isNewTeam && (
                        <span style={styles.newBadge}>New</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.scoreCell}>
                      <div
                        style={{
                          ...styles.scoreBar,
                          width: `${team.overallHealthScore}%`,
                          backgroundColor: maturityConfig.color,
                        }}
                      />
                      <span style={styles.scoreValue}>{team.overallHealthScore}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.trendIndicator,
                        color: getTrendColor(team),
                      }}
                    >
                      {getTeamTrend(team)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.deviation,
                        color:
                          team.deviationFromMean > 0
                            ? '#00875A'
                            : team.deviationFromMean < 0
                            ? '#DE350B'
                            : '#6B778C',
                      }}
                    >
                      {team.deviationFromMean > 0 ? '+' : ''}
                      {team.deviationFromMean.toFixed(1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.topGap}>{getLowestDimension(team)}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTeamClick(team.teamId);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTeams.length === 0 && (
          <div style={styles.emptyState}>No teams match your search</div>
        )}
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        Showing {filteredTeams.length} of {teamResults.length} teams
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #E6E8EB',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  searchBox: {
    width: '240px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#F4F5F7',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    borderBottom: '1px solid #DFE1E6',
    userSelect: 'none',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#172B4D',
  },
  rank: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#F4F5F7',
    borderRadius: '50%',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  teamName: {
    fontWeight: 500,
  },
  outlierBadge: {
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  newBadge: {
    padding: '2px 6px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  scoreCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreBar: {
    height: '6px',
    borderRadius: '3px',
    flexShrink: 0,
    maxWidth: '60px',
  },
  scoreValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    minWidth: '28px',
  },
  trendIndicator: {
    fontSize: '18px',
    fontWeight: 700,
  },
  deviation: {
    fontWeight: 500,
    fontSize: '13px',
  },
  topGap: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  viewButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    color: '#172B4D',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
  },
  summary: {
    padding: '12px 20px',
    fontSize: '13px',
    color: '#6B778C',
    borderTop: '1px solid #E6E8EB',
  },
};

export default TeamRankingTable;
