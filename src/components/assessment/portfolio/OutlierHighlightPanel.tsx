import React from 'react';
import type { TeamRollup, CrossTeamAnalysis } from '../../../types/multiTeamAssessment';

interface OutlierHighlightPanelProps {
  teamResults: TeamRollup[];
  crossTeamAnalysis: CrossTeamAnalysis;
  onTeamClick: (teamId: string) => void;
}

const OutlierHighlightPanel: React.FC<OutlierHighlightPanelProps> = ({
  teamResults,
  crossTeamAnalysis,
  onTeamClick,
}) => {
  // Split outliers into above and below average
  const outliersAbove = teamResults.filter(
    (t) => t.isOutlier && t.outlierDirection === 'above'
  );
  const outliersBelow = teamResults.filter(
    (t) => t.isOutlier && t.outlierDirection === 'below'
  );

  // Get high performer patterns
  const patterns = crossTeamAnalysis.highPerformerPatterns;

  if (outliersAbove.length === 0 && outliersBelow.length === 0 && patterns.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Portfolio Highlights</h3>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>✓</span>
          <span>Teams are performing consistently across the portfolio</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Portfolio Highlights</h3>

      <div style={styles.highlightsGrid}>
        {/* Top Performers */}
        {outliersAbove.length > 0 && (
          <div style={styles.highlightCard}>
            <div style={{ ...styles.cardHeader, backgroundColor: '#E3FCEF' }}>
              <span style={styles.cardIcon}>⭐</span>
              <h4 style={{ ...styles.cardTitle, color: '#006644' }}>Top Performers</h4>
              <span style={styles.cardCount}>{outliersAbove.length}</span>
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardDescription}>
                These teams are significantly outperforming the portfolio average.
              </p>
              <div style={styles.teamList}>
                {outliersAbove.map((team) => (
                  <button
                    key={team.teamId}
                    style={styles.teamButton}
                    onClick={() => onTeamClick(team.teamId)}
                  >
                    <span style={styles.teamName}>{team.teamName}</span>
                    <span style={{ ...styles.teamScore, color: '#00875A' }}>
                      {team.overallHealthScore}
                      <span style={styles.deviation}>
                        (+{team.deviationFromMean.toFixed(1)})
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {patterns.length > 0 && (
                <div style={styles.patternBox}>
                  <h5 style={styles.patternTitle}>What they have in common:</h5>
                  <ul style={styles.patternList}>
                    {patterns[0].correlatedDimensions.slice(0, 3).map((dim) => (
                      <li key={dim.dimensionKey} style={styles.patternItem}>
                        Strong {dim.dimensionName.toLowerCase()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teams Needing Focus */}
        {outliersBelow.length > 0 && (
          <div style={styles.highlightCard}>
            <div style={{ ...styles.cardHeader, backgroundColor: '#FFEBE6' }}>
              <span style={styles.cardIcon}>⚠️</span>
              <h4 style={{ ...styles.cardTitle, color: '#DE350B' }}>Needs Attention</h4>
              <span style={styles.cardCount}>{outliersBelow.length}</span>
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardDescription}>
                These teams are significantly below the portfolio average.
              </p>
              <div style={styles.teamList}>
                {outliersBelow.map((team) => {
                  // Find the team's biggest gap
                  const lowestDim = team.assessmentResult.dimensions
                    .sort((a, b) => (a.healthScore ?? a.overallPercentile) - (b.healthScore ?? b.overallPercentile))[0];

                  return (
                    <button
                      key={team.teamId}
                      style={styles.teamButton}
                      onClick={() => onTeamClick(team.teamId)}
                    >
                      <div style={styles.teamInfo}>
                        <span style={styles.teamName}>{team.teamName}</span>
                        <span style={styles.teamGap}>
                          Primary gap: {lowestDim?.dimensionName || 'N/A'}
                        </span>
                      </div>
                      <span style={{ ...styles.teamScore, color: '#DE350B' }}>
                        {team.overallHealthScore}
                        <span style={styles.deviation}>
                          ({team.deviationFromMean.toFixed(1)})
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Systemic Issues */}
        {crossTeamAnalysis.commonGaps.filter((g) => g.isSystemicIssue).length > 0 && (
          <div style={styles.highlightCard}>
            <div style={{ ...styles.cardHeader, backgroundColor: '#FFFAE6' }}>
              <span style={styles.cardIcon}>🔍</span>
              <h4 style={{ ...styles.cardTitle, color: '#FF8B00' }}>Portfolio-Wide Gaps</h4>
              <span style={styles.cardCount}>
                {crossTeamAnalysis.commonGaps.filter((g) => g.isSystemicIssue).length}
              </span>
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardDescription}>
                These dimensions are common challenges across multiple teams.
              </p>
              <div style={styles.gapList}>
                {crossTeamAnalysis.commonGaps
                  .filter((g) => g.isSystemicIssue)
                  .slice(0, 3)
                  .map((gap) => (
                    <div key={gap.gapId} style={styles.gapItem}>
                      <div style={styles.gapInfo}>
                        <span style={styles.gapName}>{gap.dimensionName}</span>
                        <span style={styles.gapTeamCount}>
                          {gap.affectedTeamCount} teams ({gap.percentageOfTeams}%)
                        </span>
                      </div>
                      <div style={styles.gapBar}>
                        <div
                          style={{
                            ...styles.gapBarFill,
                            width: `${gap.percentageOfTeams}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Variance Analysis */}
        <div style={styles.highlightCard}>
          <div style={{ ...styles.cardHeader, backgroundColor: '#F4F5F7' }}>
            <span style={styles.cardIcon}>📊</span>
            <h4 style={{ ...styles.cardTitle, color: '#5E6C84' }}>Consistency Analysis</h4>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.consistencyStats}>
              <div style={styles.consistencyStat}>
                <span style={styles.consistencyLabel}>Most Consistent</span>
                <span style={styles.consistencyValue}>
                  {crossTeamAnalysis.mostConsistentDimension || 'N/A'}
                </span>
                <span style={styles.consistencySubtext}>
                  Low variance across teams
                </span>
              </div>
              <div style={styles.consistencyStat}>
                <span style={styles.consistencyLabel}>Least Consistent</span>
                <span style={styles.consistencyValue}>
                  {crossTeamAnalysis.leastConsistentDimension || 'N/A'}
                </span>
                <span style={styles.consistencySubtext}>
                  High variance - consider standardization
                </span>
              </div>
              <div style={styles.consistencyStat}>
                <span style={styles.consistencyLabel}>Portfolio Variance</span>
                <span style={styles.consistencyValue}>
                  {crossTeamAnalysis.portfolioVariance.toFixed(0)}
                </span>
                <span style={styles.consistencySubtext}>
                  Overall health score spread
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    backgroundColor: '#E3FCEF',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#006644',
  },
  emptyIcon: {
    fontSize: '20px',
  },
  highlightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  highlightCard: {
    border: '1px solid #E6E8EB',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
  },
  cardIcon: {
    fontSize: '16px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    flex: 1,
  },
  cardCount: {
    padding: '2px 8px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'inherit',
  },
  cardContent: {
    padding: '16px',
  },
  cardDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  teamButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
    width: '100%',
  },
  teamInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  teamName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  teamGap: {
    fontSize: '11px',
    color: '#6B778C',
  },
  teamScore: {
    fontSize: '16px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  deviation: {
    fontSize: '11px',
    fontWeight: 500,
    opacity: 0.8,
  },
  patternBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#E3FCEF',
    borderRadius: '6px',
  },
  patternTitle: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#006644',
  },
  patternList: {
    margin: 0,
    paddingLeft: '16px',
    fontSize: '12px',
    color: '#006644',
    lineHeight: 1.6,
  },
  patternItem: {},
  gapList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  gapItem: {},
  gapInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  gapName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  gapTeamCount: {
    fontSize: '11px',
    color: '#6B778C',
  },
  gapBar: {
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  gapBarFill: {
    height: '100%',
    backgroundColor: '#FF8B00',
    borderRadius: '3px',
  },
  consistencyStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  consistencyStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  consistencyLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  consistencyValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  consistencySubtext: {
    fontSize: '11px',
    color: '#6B778C',
  },
};

export default OutlierHighlightPanel;
