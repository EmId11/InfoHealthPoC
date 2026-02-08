import React from 'react';
import Button from '@atlaskit/button/standard-button';
import type { TeamRollup, DimensionAggregate } from '../../../types/multiTeamAssessment';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface DimensionCrossTeamViewProps {
  dimensionAggregate: DimensionAggregate;
  teamResults: TeamRollup[];
  onBack: () => void;
  onTeamClick: (teamId: string) => void;
}

const DimensionCrossTeamView: React.FC<DimensionCrossTeamViewProps> = ({
  dimensionAggregate,
  teamResults,
  onBack,
  onTeamClick,
}) => {
  const maturityConfig = getMaturityLevelConfig(dimensionAggregate.averageHealthScore);

  // Get team scores for this dimension, sorted by healthScore
  const teamScores = teamResults
    .map((team) => {
      const dim = team.assessmentResult.dimensions.find(
        (d) => d.dimensionKey === dimensionAggregate.dimensionKey
      );
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        healthScore: dim?.healthScore || 0,
        maturityLevel: dim?.maturityLevel || 1,
        isOutlier: dimensionAggregate.outlierTeamIds.includes(team.teamId),
      };
    })
    .sort((a, b) => b.healthScore - a.healthScore);

  // Calculate distribution bars
  const getDistributionBars = () => {
    const dist = dimensionAggregate.maturityDistribution;
    const total = dist.level1 + dist.level2 + dist.level3 + dist.level4 + dist.level5;

    // CHS-aligned labels and colors
    return [
      { level: 5, count: dist.level5, color: '#006644', label: 'Excellent' },
      { level: 4, count: dist.level4, color: '#00875A', label: 'Good' },
      { level: 3, count: dist.level3, color: '#6B778C', label: 'Average' },
      { level: 2, count: dist.level2, color: '#FF8B00', label: 'Below Avg' },
      { level: 1, count: dist.level1, color: '#DE350B', label: 'Attention' },
    ].map((bar) => ({
      ...bar,
      percentage: (bar.count / total) * 100,
    }));
  };

  const distributionBars = getDistributionBars();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Button appearance="subtle" onClick={onBack}>
          ← Back to Portfolio
        </Button>
        <div style={styles.headerContent}>
          <h1 style={styles.dimensionName}>{dimensionAggregate.dimensionName}</h1>
          <p style={styles.questionForm}>{dimensionAggregate.questionForm}</p>
        </div>
      </div>

      {/* Overview Card */}
      <div style={styles.overviewCard}>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Portfolio Average</span>
            <span style={{ ...styles.statValue, color: maturityConfig.color }}>
              {dimensionAggregate.averageHealthScore}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Median</span>
            <span style={styles.statValue}>{dimensionAggregate.medianHealthScore}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Range</span>
            <span style={styles.statValue}>
              {dimensionAggregate.minHealthScore} - {dimensionAggregate.maxHealthScore}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Std Deviation</span>
            <span style={styles.statValue}>{dimensionAggregate.standardDeviation}</span>
          </div>
        </div>

        {/* Badges */}
        <div style={styles.badges}>
          {dimensionAggregate.isHighVariance && (
            <span style={{ ...styles.badge, backgroundColor: '#FFFAE6', color: '#FF8B00' }}>
              High Variance
            </span>
          )}
          {dimensionAggregate.outlierTeamIds.length > 0 && (
            <span style={{ ...styles.badge, backgroundColor: '#DEEBFF', color: '#0052CC' }}>
              {dimensionAggregate.outlierTeamIds.length} Outlier{dimensionAggregate.outlierTeamIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Distribution Section */}
      <div style={styles.distributionCard}>
        <h2 style={styles.sectionTitle}>Team Distribution by Maturity Level</h2>

        {/* Stacked bar */}
        <div style={styles.stackedBar}>
          {distributionBars.map(
            (bar) =>
              bar.percentage > 0 && (
                <div
                  key={bar.level}
                  style={{
                    ...styles.barSegment,
                    backgroundColor: bar.color,
                    width: `${bar.percentage}%`,
                  }}
                  title={`${bar.label}: ${bar.count} teams`}
                />
              )
          )}
        </div>

        {/* Legend */}
        <div style={styles.distributionLegend}>
          {distributionBars.map((bar) => (
            <div key={bar.level} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: bar.color }} />
              <span style={styles.legendLabel}>{bar.label}</span>
              <span style={styles.legendCount}>{bar.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Rankings */}
      <div style={styles.rankingsCard}>
        <h2 style={styles.sectionTitle}>Team Rankings</h2>
        <div style={styles.teamList}>
          {teamScores.map((team, index) => {
            const teamConfig = getMaturityLevelConfig(team.healthScore);
            const isTop = index < 3;
            const isBottom = index >= teamScores.length - 3;

            return (
              <button
                key={team.teamId}
                style={{
                  ...styles.teamRow,
                  ...(isTop ? styles.teamRowTop : {}),
                  ...(isBottom ? styles.teamRowBottom : {}),
                }}
                onClick={() => onTeamClick(team.teamId)}
              >
                <div style={styles.teamRank}>
                  <span style={styles.rankNumber}>{index + 1}</span>
                </div>
                <div style={styles.teamInfo}>
                  <span style={styles.teamName}>{team.teamName}</span>
                  {team.isOutlier && (
                    <span style={styles.outlierBadge}>Outlier</span>
                  )}
                </div>
                <div style={styles.teamScoreSection}>
                  <div style={styles.miniBar}>
                    <div
                      style={{
                        ...styles.miniBarFill,
                        width: `${team.healthScore}%`,
                        backgroundColor: teamConfig.color,
                      }}
                    />
                  </div>
                  <span style={{ ...styles.teamScore, color: teamConfig.color }}>
                    {team.healthScore}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trend Stats */}
      <div style={styles.trendCard}>
        <h2 style={styles.sectionTitle}>Trend Overview</h2>
        <div style={styles.trendStats}>
          <div style={styles.trendItem}>
            <span style={{ ...styles.trendIcon, color: '#00875A' }}>↑</span>
            <span style={styles.trendValue}>{dimensionAggregate.teamsImproving}</span>
            <span style={styles.trendLabel}>Teams Improving</span>
          </div>
          <div style={styles.trendItem}>
            <span style={{ ...styles.trendIcon, color: '#6B778C' }}>→</span>
            <span style={styles.trendValue}>{dimensionAggregate.teamsStable}</span>
            <span style={styles.trendLabel}>Teams Stable</span>
          </div>
          <div style={styles.trendItem}>
            <span style={{ ...styles.trendIcon, color: '#DE350B' }}>↓</span>
            <span style={styles.trendValue}>{dimensionAggregate.teamsDeclining}</span>
            <span style={styles.trendLabel}>Teams Declining</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  headerContent: {
    marginTop: '16px',
  },
  dimensionName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  questionForm: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    color: '#6B778C',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    marginBottom: '24px',
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stackedBar: {
    display: 'flex',
    height: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#EBECF0',
  },
  barSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  distributionLegend: {
    display: 'flex',
    gap: '20px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  legendCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  rankingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    marginBottom: '24px',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  teamRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background-color 0.15s ease',
  },
  teamRowTop: {
    backgroundColor: '#E3FCEF',
  },
  teamRowBottom: {
    backgroundColor: '#FFEBE6',
  },
  teamRank: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '50%',
    flexShrink: 0,
  },
  rankNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  teamInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  teamName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
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
  teamScoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '150px',
  },
  miniBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  teamScore: {
    fontSize: '16px',
    fontWeight: 600,
    minWidth: '32px',
    textAlign: 'right',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  trendStats: {
    display: 'flex',
    gap: '32px',
  },
  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  trendIcon: {
    fontSize: '20px',
    fontWeight: 700,
  },
  trendValue: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
};

export default DimensionCrossTeamView;
