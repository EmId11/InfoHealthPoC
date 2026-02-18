// ImpactSummaryHero Component
// Hero section showing overall impact score and key metrics

import React from 'react';
import { PlanImpactSummary } from '../../../types/impactMeasurement';
import { ImpactScoreBadge } from '../../assessment/impact/ImpactScoreBadge';
import { ConfidenceGauge } from '../../assessment/impact/ConfidenceGauge';

interface ImpactSummaryHeroProps {
  summary: PlanImpactSummary;
  primaryOutcomeName?: string;
  onMethodologyClick: () => void;
}

export const ImpactSummaryHero: React.FC<ImpactSummaryHeroProps> = ({
  summary,
  primaryOutcomeName,
  onMethodologyClick,
}) => {
  const primaryOutcome = summary.outcomeImpacts[0];
  const measuredPlaysCount = summary.playsWithImpact.length;
  const awaitingCount = summary.playsAwaitingAssessment.length;
  const excludedCount = summary.excludedPlays.length;

  return (
    <div style={styles.container}>
      <div style={styles.mainSection}>
        <div style={styles.scoreSection}>
          <div style={styles.scoreLabel}>Overall Impact</div>
          <ImpactScoreBadge
            score={summary.overallImpactScore}
            direction={summary.impactDirection}
            size="large"
            showLabel
          />
          <div style={styles.pointsLabel}>
            health score points
          </div>
        </div>

        {primaryOutcome && (
          <div style={styles.outcomeSection}>
            <div style={styles.outcomeLabel}>Primary Outcome Change</div>
            <div style={styles.outcomeChange}>
              <span style={styles.outcomeName}>
                {primaryOutcome.outcomeName}
              </span>
              <div style={styles.outcomeValues}>
                <span style={styles.outcomeValue}>{primaryOutcome.baselineScore.toFixed(0)}</span>
                <span style={styles.outcomeArrow}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg></span>
                <span style={{
                  ...styles.outcomeValue,
                  color: primaryOutcome.changePoints > 0 ? '#006644' : '#DE350B',
                }}>
                  {primaryOutcome.currentScore.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={styles.confidenceSection}>
          <div style={styles.confidenceLabel}>Confidence</div>
          <ConfidenceGauge
            level={summary.confidenceLevel}
            score={summary.confidenceScore}
            showLabel
            showScore
            size="medium"
          />
        </div>
      </div>

      <div style={styles.statsSection}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{measuredPlaysCount}</span>
          <span style={styles.statLabel}>Plays with Measured Impact</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statValue}>{awaitingCount}</span>
          <span style={styles.statLabel}>Awaiting Assessment</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={styles.statValue}>{excludedCount}</span>
          <span style={styles.statLabel}>Excluded</span>
        </div>
      </div>

      <button onClick={onMethodologyClick} style={styles.methodologyLink}>
        {'\u2139\uFE0F'} How is this calculated?
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  mainSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 32,
    flexWrap: 'wrap',
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6B778C',
    marginTop: -4,
  },
  outcomeSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  outcomeLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  outcomeChange: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  outcomeName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#172B4D',
  },
  outcomeValues: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  outcomeValue: {
    fontSize: 24,
    fontWeight: 600,
    color: '#172B4D',
  },
  outcomeArrow: {
    fontSize: 18,
    color: '#6B778C',
  },
  confidenceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid #DFE1E6',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 600,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B778C',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DFE1E6',
    alignSelf: 'stretch',
  },
  methodologyLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: '#0052CC',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default ImpactSummaryHero;
