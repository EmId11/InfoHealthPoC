import React, { useState } from 'react';
import type { DimensionAggregate, TeamRollup } from '../../../types/multiTeamAssessment';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface DimensionDistributionViewProps {
  dimensionAggregates: DimensionAggregate[];
  teamResults: TeamRollup[];
  onDimensionClick: (dimensionKey: string) => void;
  onTeamClick: (teamId: string) => void;
}

const DimensionDistributionView: React.FC<DimensionDistributionViewProps> = ({
  dimensionAggregates,
  teamResults,
  onDimensionClick,
  onTeamClick,
}) => {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  const getDistributionBars = (agg: DimensionAggregate) => {
    const total =
      agg.maturityDistribution.level1 +
      agg.maturityDistribution.level2 +
      agg.maturityDistribution.level3 +
      agg.maturityDistribution.level4 +
      agg.maturityDistribution.level5;

    // CHS-aligned labels and colors
    return [
      { level: 5, count: agg.maturityDistribution.level5, color: '#006644', label: 'Excellent' },
      { level: 4, count: agg.maturityDistribution.level4, color: '#00875A', label: 'Good' },
      { level: 3, count: agg.maturityDistribution.level3, color: '#6B778C', label: 'Average' },
      { level: 2, count: agg.maturityDistribution.level2, color: '#FF8B00', label: 'Below Avg' },
      { level: 1, count: agg.maturityDistribution.level1, color: '#DE350B', label: 'Attention' },
    ].map((bar) => ({
      ...bar,
      percentage: (bar.count / total) * 100,
    }));
  };

  // Get teams for a dimension grouped by maturity level
  const getTeamsForDimension = (dimensionKey: string) => {
    const groups: Record<number, { teamId: string; teamName: string; healthScore: number }[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    teamResults.forEach((team) => {
      const dim = team.assessmentResult.dimensions.find(
        (d) => d.dimensionKey === dimensionKey
      );
      if (dim) {
        const score = dim.healthScore ?? dim.overallPercentile;
        const level = dim.maturityLevel || Math.ceil(score / 20) || 1;
        const clampedLevel = Math.min(5, Math.max(1, level));
        groups[clampedLevel].push({
          teamId: team.teamId,
          teamName: team.teamName,
          healthScore: score,
        });
      }
    });

    return groups;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Dimension Analysis</h3>
        <p style={styles.subtitle}>
          See how teams are distributed across maturity levels for each dimension
        </p>
      </div>

      <div style={styles.dimensionsList}>
        {dimensionAggregates.map((agg) => {
          const bars = getDistributionBars(agg);
          const isExpanded = expandedDimension === agg.dimensionKey;
          const maturityConfig = getMaturityLevelConfig(agg.averageHealthScore);
          const teamsGrouped = isExpanded ? getTeamsForDimension(agg.dimensionKey) : null;

          return (
            <div key={agg.dimensionKey} style={styles.dimensionCard}>
              {/* Header */}
              <div
                style={styles.dimensionHeader}
                onClick={() =>
                  setExpandedDimension(isExpanded ? null : agg.dimensionKey)
                }
              >
                <div style={styles.dimensionInfo}>
                  <div style={styles.dimensionTitleRow}>
                    <h4 style={styles.dimensionName}>{agg.dimensionName}</h4>
                    <div style={styles.dimensionBadges}>
                      {agg.isHighVariance && (
                        <span style={styles.varianceBadge}>High Variance</span>
                      )}
                      {agg.outlierTeamIds.length > 0 && (
                        <span style={styles.outlierBadge}>
                          {agg.outlierTeamIds.length} Outliers
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={styles.dimensionQuestion}>{agg.questionForm}</p>
                </div>

                <div style={styles.dimensionStats}>
                  <div style={styles.avgScore}>
                    <span
                      style={{ ...styles.avgScoreValue, color: maturityConfig.color }}
                    >
                      {agg.averageHealthScore}
                    </span>
                    <span style={styles.avgScoreLabel}>Avg</span>
                  </div>
                  <div style={styles.trendStats}>
                    <span style={{ ...styles.trendStat, color: '#00875A' }}>
                      ↑ {agg.teamsImproving}
                    </span>
                    <span style={{ ...styles.trendStat, color: '#6B778C' }}>
                      → {agg.teamsStable}
                    </span>
                    <span style={{ ...styles.trendStat, color: '#DE350B' }}>
                      ↓ {agg.teamsDeclining}
                    </span>
                  </div>
                </div>

                <div style={styles.expandIcon}>{isExpanded ? '−' : '+'}</div>
              </div>

              {/* Distribution Bar */}
              <div style={styles.distributionBar}>
                {bars.map(
                  (bar) =>
                    bar.percentage > 0 && (
                      <div
                        key={bar.level}
                        style={{
                          ...styles.barSegment,
                          backgroundColor: bar.color,
                          width: `${bar.percentage}%`,
                        }}
                        title={`${bar.label}: ${bar.count} teams (${Math.round(bar.percentage)}%)`}
                      />
                    )
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && teamsGrouped && (
                <div style={styles.expandedContent}>
                  <div style={styles.statsRow}>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Min</span>
                      <span style={styles.statValue}>{agg.minHealthScore}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Median</span>
                      <span style={styles.statValue}>{agg.medianHealthScore}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Max</span>
                      <span style={styles.statValue}>{agg.maxHealthScore}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Std Dev</span>
                      <span style={styles.statValue}>{agg.standardDeviation}</span>
                    </div>
                  </div>

                  <div style={styles.teamsGrouped}>
                    {[5, 4, 3, 2, 1].map((level) => {
                      const teams = teamsGrouped[level];
                      if (teams.length === 0) return null;

                      const levelConfig = getMaturityLevelConfig((level - 1) * 20 + 10);

                      return (
                        <div key={level} style={styles.teamGroup}>
                          <div
                            style={{
                              ...styles.groupHeader,
                              backgroundColor: levelConfig.backgroundColor,
                              borderLeft: `3px solid ${levelConfig.color}`,
                            }}
                          >
                            <span style={{ color: levelConfig.color, fontWeight: 600 }}>
                              {levelConfig.name}
                            </span>
                            <span style={styles.groupCount}>{teams.length} teams</span>
                          </div>
                          <div style={styles.teamChips}>
                            {teams
                              .sort((a, b) => b.healthScore - a.healthScore)
                              .map((team) => (
                                <button
                                  key={team.teamId}
                                  style={styles.teamChip}
                                  onClick={() => onTeamClick(team.teamId)}
                                >
                                  {team.teamName}
                                  <span style={styles.chipHealthScore}>{team.healthScore}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    style={styles.viewAllButton}
                    onClick={() => onDimensionClick(agg.dimensionKey)}
                  >
                    View Dimension Details →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {},
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  dimensionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dimensionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    overflow: 'hidden',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    gap: '16px',
  },
  dimensionInfo: {
    flex: 1,
    minWidth: 0,
  },
  dimensionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
  },
  dimensionName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionBadges: {
    display: 'flex',
    gap: '8px',
  },
  varianceBadge: {
    padding: '2px 6px',
    backgroundColor: '#FFFAE6',
    color: '#FF8B00',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  outlierBadge: {
    padding: '2px 6px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  dimensionQuestion: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dimensionStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexShrink: 0,
  },
  avgScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avgScoreValue: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
  },
  avgScoreLabel: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#6B778C',
    marginTop: '2px',
  },
  trendStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  trendStat: {
    fontSize: '11px',
    fontWeight: 500,
  },
  expandIcon: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#6B778C',
    width: '24px',
    textAlign: 'center',
  },
  distributionBar: {
    display: 'flex',
    height: '8px',
    marginTop: '-8px',
    marginBottom: '0',
    backgroundColor: '#EBECF0',
  },
  barSegment: {
    height: '100%',
  },
  expandedContent: {
    padding: '20px',
    backgroundColor: '#FAFBFC',
    borderTop: '1px solid #E6E8EB',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E6E8EB',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    marginTop: '2px',
  },
  teamsGrouped: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  teamGroup: {},
  groupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    marginBottom: '8px',
  },
  groupCount: {
    fontSize: '11px',
    color: '#6B778C',
  },
  teamChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    paddingLeft: '12px',
  },
  teamChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#172B4D',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  chipHealthScore: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
  },
  viewAllButton: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

export default DimensionDistributionView;
