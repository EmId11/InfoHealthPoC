import React from 'react';
import type {
  PortfolioSummary,
  PortfolioExecutiveSummary,
  HealthScoreDistribution,
} from '../../../types/multiTeamAssessment';
import { getMaturityLevelConfig } from '../../../types/maturity';

interface PortfolioHealthHeroProps {
  summary: PortfolioSummary;
  executiveSummary: PortfolioExecutiveSummary;
}

const PortfolioHealthHero: React.FC<PortfolioHealthHeroProps> = ({
  summary,
  executiveSummary,
}) => {
  const maturityConfig = getMaturityLevelConfig(summary.overallHealthScore);

  // Calculate percentages for distribution bars
  const totalTeams = summary.teamCount;
  const getPercentage = (count: number) => (count / totalTeams) * 100;

  // CHS-aligned distribution labels and colors (5 standard labels)
  const distributionBars = [
    { label: 'Excellent', count: summary.healthScoreDistribution.excellent, color: '#006644' },
    { label: 'Good', count: summary.healthScoreDistribution.good, color: '#00875A' },
    { label: 'Average', count: summary.healthScoreDistribution.average, color: '#6B778C' },
    { label: 'Below Avg', count: summary.healthScoreDistribution.belowAverage, color: '#FF8B00' },
    { label: 'Needs Attention', count: summary.healthScoreDistribution.needsAttention, color: '#DE350B' },
  ];

  return (
    <div style={styles.heroContainer}>
      <div style={styles.heroContent}>
        {/* Main Health Score */}
        <div style={styles.mainScoreSection}>
          <div style={styles.scoreCard}>
            <div style={styles.scoreGauge}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="#EBECF0"
                  strokeWidth="12"
                />
                {/* Score arc */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke={maturityConfig.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(summary.overallHealthScore / 100) * 377} 377`}
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div style={styles.scoreValue}>
                <span style={{ ...styles.scoreNumber, color: maturityConfig.color }}>
                  {summary.overallHealthScore}
                </span>
                <span style={styles.scoreLabel}>{summary.overallMaturityName}</span>
              </div>
            </div>
            <div style={styles.scoreDescription}>
              <h2 style={styles.descriptionTitle}>Portfolio Health Score</h2>
              <p style={styles.descriptionText}>
                Based on weighted average across {summary.teamCount} teams and{' '}
                {summary.dimensionAggregates.length} health dimensions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{summary.teamCount}</div>
            <div style={styles.statLabel}>Teams Assessed</div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#00875A' }}>
              {summary.teamsImproving}
              <span style={styles.trendIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00875A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg></span>
            </div>
            <div style={styles.statLabel}>Improving</div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#6B778C' }}>
              {summary.teamsStable}
              <span style={styles.trendIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg></span>
            </div>
            <div style={styles.statLabel}>Stable</div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#DE350B' }}>
              {summary.teamsDeclining}
              <span style={styles.trendIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg></span>
            </div>
            <div style={styles.statLabel}>Declining</div>
          </div>
        </div>

        {/* Distribution */}
        <div style={styles.distributionSection}>
          <h3 style={styles.distributionTitle}>Team Distribution by Health Level</h3>

          {/* Stacked bar */}
          <div style={styles.stackedBar}>
            {distributionBars.map((bar) => (
              bar.count > 0 && (
                <div
                  key={bar.label}
                  style={{
                    ...styles.barSegment,
                    backgroundColor: bar.color,
                    width: `${getPercentage(bar.count)}%`,
                  }}
                  title={`${bar.label}: ${bar.count} teams`}
                />
              )
            ))}
          </div>

          {/* Legend */}
          <div style={styles.distributionLegend}>
            {distributionBars.map((bar) => (
              <div key={bar.label} style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: bar.color }} />
                <span style={styles.legendLabel}>{bar.label}</span>
                <span style={styles.legendCount}>{bar.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headline Metrics */}
        <div style={styles.headlineSection}>
          <div style={styles.headlineCard}>
            <span style={styles.headlineLabel}>Critical Gaps</span>
            <span
              style={{
                ...styles.headlineValue,
                color: executiveSummary.headline.criticalGapsCount > 0 ? '#DE350B' : '#00875A',
              }}
            >
              {executiveSummary.headline.criticalGapsCount}
            </span>
          </div>

          <div style={styles.headlineCard}>
            <span style={styles.headlineLabel}>Portfolio Trend</span>
            <span
              style={{
                ...styles.headlineValue,
                color:
                  executiveSummary.headline.healthTrend === 'improving'
                    ? '#00875A'
                    : executiveSummary.headline.healthTrend === 'declining'
                    ? '#DE350B'
                    : '#6B778C',
              }}
            >
              {executiveSummary.headline.healthTrend === 'improving' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg> Improving</>}
              {executiveSummary.headline.healthTrend === 'declining' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg> Declining</>}
              {executiveSummary.headline.healthTrend === 'stable' && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg> Stable</>}
            </span>
          </div>

          <div style={styles.headlineCard}>
            <span style={styles.headlineLabel}>High-Risk Teams</span>
            <span
              style={{
                ...styles.headlineValue,
                color: executiveSummary.riskSummary.criticalRiskCount > 0 ? '#DE350B' : '#00875A',
              }}
            >
              {executiveSummary.riskSummary.criticalRiskCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  heroContainer: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E6E8EB',
    padding: '32px',
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridTemplateRows: 'auto auto',
    gap: '32px',
    alignItems: 'start',
  },
  mainScoreSection: {
    gridRow: '1 / -1',
  },
  scoreCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  scoreGauge: {
    position: 'relative',
    width: '140px',
    height: '140px',
  },
  scoreValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#5E6C84',
    marginTop: '4px',
  },
  scoreDescription: {
    textAlign: 'center',
    maxWidth: '200px',
  },
  descriptionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  descriptionText: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  trendIcon: {
    fontSize: '16px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '4px',
  },
  distributionSection: {
    gridColumn: '2 / -1',
  },
  distributionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  stackedBar: {
    display: 'flex',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#EBECF0',
  },
  barSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  distributionLegend: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  legendCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  headlineSection: {
    display: 'flex',
    gap: '24px',
    gridColumn: '2 / -1',
    marginTop: '8px',
  },
  headlineCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  headlineLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  headlineValue: {
    fontSize: '16px',
    fontWeight: 600,
  },
};

export default PortfolioHealthHero;
