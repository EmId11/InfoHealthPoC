import React from 'react';
import Button from '@atlaskit/button/standard-button';
import type { TeamRollup, PortfolioSummary, DimensionAggregate } from '../../../types/multiTeamAssessment';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface TeamWithinPortfolioViewProps {
  teamRollup: TeamRollup;
  portfolioSummary: PortfolioSummary;
  totalTeams: number;
  onBack: () => void;
}

const TeamWithinPortfolioView: React.FC<TeamWithinPortfolioViewProps> = ({
  teamRollup,
  portfolioSummary,
  totalTeams,
  onBack,
}) => {
  const maturityConfig = getMaturityLevelConfig(teamRollup.overallHealthScore);

  // Get portfolio average for comparison
  const portfolioAverage = portfolioSummary.overallHealthScore;
  const deviation = teamRollup.deviationFromMean;

  // Get dimension comparisons
  const getDimensionComparison = (dimensionKey: string) => {
    const portfolioDim = portfolioSummary.dimensionAggregates.find(
      (d) => d.dimensionKey === dimensionKey
    );
    const teamDim = teamRollup.assessmentResult.dimensions.find(
      (d) => d.dimensionKey === dimensionKey
    );
    if (!portfolioDim || !teamDim) return null;

    const teamScore = teamDim.healthScore;
    const portfolioAvg = portfolioDim.averageHealthScore;
    const diff = teamScore - portfolioAvg;

    return {
      teamScore,
      portfolioAvg,
      diff,
      dimensionName: teamDim.dimensionName,
    };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Button appearance="subtle" onClick={onBack}>
          ← Back to Portfolio
        </Button>
        <div style={styles.headerContent}>
          <h1 style={styles.teamName}>{teamRollup.teamName}</h1>
          <div style={styles.rankBadge}>
            Rank {teamRollup.overallRank} of {totalTeams} teams
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div style={styles.overviewCard}>
        <div style={styles.scoreSection}>
          <div style={styles.scoreCircle}>
            <span style={{ ...styles.scoreValue, color: maturityConfig.color }}>
              {teamRollup.overallHealthScore}
            </span>
            <span style={styles.scoreLabel}>Health Score</span>
          </div>
          <div style={styles.comparisonSection}>
            <div style={styles.comparisonItem}>
              <span style={styles.comparisonLabel}>Portfolio Average</span>
              <span style={styles.comparisonValue}>{portfolioAverage}</span>
            </div>
            <div style={styles.comparisonItem}>
              <span style={styles.comparisonLabel}>Difference</span>
              <span
                style={{
                  ...styles.comparisonValue,
                  color: deviation > 0 ? '#00875A' : deviation < 0 ? '#DE350B' : '#6B778C',
                }}
              >
                {deviation > 0 ? '+' : ''}
                {deviation.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div style={styles.statusBadges}>
          {teamRollup.isOutlier && (
            <span
              style={{
                ...styles.badge,
                backgroundColor:
                  teamRollup.outlierDirection === 'above' ? '#E3FCEF' : '#FFEBE6',
                color: teamRollup.outlierDirection === 'above' ? '#006644' : '#DE350B',
              }}
            >
              {teamRollup.outlierDirection === 'above' ? 'Top Performer' : 'Needs Focus'}
            </span>
          )}
          {teamRollup.isNewTeam && (
            <span style={{ ...styles.badge, backgroundColor: '#DEEBFF', color: '#0052CC' }}>
              New Team
            </span>
          )}
        </div>
      </div>

      {/* Dimension Comparison */}
      <div style={styles.dimensionsCard}>
        <h2 style={styles.sectionTitle}>Dimension Performance vs Portfolio</h2>
        <div style={styles.dimensionsList}>
          {teamRollup.assessmentResult.dimensions.map((dim) => {
            const comparison = getDimensionComparison(dim.dimensionKey);
            if (!comparison) return null;

            const dimConfig = getMaturityLevelConfig(comparison.teamScore);

            return (
              <div key={dim.dimensionKey} style={styles.dimensionRow}>
                <div style={styles.dimensionInfo}>
                  <span style={styles.dimensionName}>{comparison.dimensionName}</span>
                </div>
                <div style={styles.dimensionScores}>
                  <div style={styles.scoreBar}>
                    {/* Portfolio average marker */}
                    <div
                      style={{
                        ...styles.avgMarker,
                        left: `${comparison.portfolioAvg}%`,
                      }}
                      title={`Portfolio Avg: ${comparison.portfolioAvg}`}
                    />
                    {/* Team score bar */}
                    <div
                      style={{
                        ...styles.teamBar,
                        width: `${comparison.teamScore}%`,
                        backgroundColor: dimConfig.color,
                      }}
                    />
                  </div>
                  <div style={styles.scoreValues}>
                    <span style={{ ...styles.teamScoreValue, color: dimConfig.color }}>
                      {comparison.teamScore}
                    </span>
                    <span
                      style={{
                        ...styles.diffValue,
                        color:
                          comparison.diff > 0
                            ? '#00875A'
                            : comparison.diff < 0
                            ? '#DE350B'
                            : '#6B778C',
                      }}
                    >
                      {comparison.diff > 0 ? '+' : ''}
                      {comparison.diff.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={styles.legendBar} />
            <span style={styles.legendText}>Team Score</span>
          </div>
          <div style={styles.legendItem}>
            <span style={styles.legendMarker} />
            <span style={styles.legendText}>Portfolio Average</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div style={styles.insightsCard}>
        <h2 style={styles.sectionTitle}>Key Insights</h2>
        <div style={styles.insightsList}>
          {/* Strengths */}
          {teamRollup.assessmentResult.dimensions
            .filter((d) => {
              const comp = getDimensionComparison(d.dimensionKey);
              return comp && comp.diff > 5;
            })
            .slice(0, 3).length > 0 && (
            <div style={styles.insightGroup}>
              <h3 style={{ ...styles.insightGroupTitle, color: '#006644' }}>
                Strengths (Above Portfolio Average)
              </h3>
              <ul style={styles.insightList}>
                {teamRollup.assessmentResult.dimensions
                  .filter((d) => {
                    const comp = getDimensionComparison(d.dimensionKey);
                    return comp && comp.diff > 5;
                  })
                  .slice(0, 3)
                  .map((d) => {
                    const comp = getDimensionComparison(d.dimensionKey);
                    return (
                      <li key={d.dimensionKey} style={styles.insightItem}>
                        {comp?.dimensionName} (+{comp?.diff.toFixed(0)} vs avg)
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {teamRollup.assessmentResult.dimensions
            .filter((d) => {
              const comp = getDimensionComparison(d.dimensionKey);
              return comp && comp.diff < -5;
            })
            .slice(0, 3).length > 0 && (
            <div style={styles.insightGroup}>
              <h3 style={{ ...styles.insightGroupTitle, color: '#DE350B' }}>
                Areas for Improvement (Below Portfolio Average)
              </h3>
              <ul style={styles.insightList}>
                {teamRollup.assessmentResult.dimensions
                  .filter((d) => {
                    const comp = getDimensionComparison(d.dimensionKey);
                    return comp && comp.diff < -5;
                  })
                  .slice(0, 3)
                  .map((d) => {
                    const comp = getDimensionComparison(d.dimensionKey);
                    return (
                      <li key={d.dimensionKey} style={styles.insightItem}>
                        {comp?.dimensionName} ({comp?.diff.toFixed(0)} vs avg)
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
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
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
  },
  teamName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  rankBadge: {
    padding: '6px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5E6C84',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    marginBottom: '24px',
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '48px',
  },
  scoreCircle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 32px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  scoreValue: {
    fontSize: '48px',
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    marginTop: '8px',
  },
  comparisonSection: {
    display: 'flex',
    gap: '32px',
  },
  comparisonItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  comparisonLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  comparisonValue: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statusBadges: {
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
  dimensionsCard: {
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
  dimensionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dimensionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  dimensionInfo: {
    width: '180px',
    flexShrink: 0,
  },
  dimensionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  dimensionScores: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  scoreBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    position: 'relative',
  },
  teamBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  avgMarker: {
    position: 'absolute',
    top: '-4px',
    width: '2px',
    height: '16px',
    backgroundColor: '#5E6C84',
    transform: 'translateX(-50%)',
  },
  scoreValues: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '80px',
    justifyContent: 'flex-end',
  },
  teamScoreValue: {
    fontSize: '14px',
    fontWeight: 600,
  },
  diffValue: {
    fontSize: '12px',
    fontWeight: 500,
  },
  legend: {
    display: 'flex',
    gap: '24px',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendBar: {
    width: '16px',
    height: '8px',
    backgroundColor: '#0052CC',
    borderRadius: '4px',
  },
  legendMarker: {
    width: '2px',
    height: '16px',
    backgroundColor: '#5E6C84',
  },
  legendText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  insightGroup: {},
  insightGroupTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
  },
  insightList: {
    margin: 0,
    paddingLeft: '20px',
  },
  insightItem: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
};

export default TeamWithinPortfolioView;
