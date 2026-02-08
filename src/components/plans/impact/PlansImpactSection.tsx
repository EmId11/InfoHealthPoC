// PlansImpactSection Component
// Shows impact metrics specifically related to Improvement Plans
// Separated from general portfolio improvement to capture all improvements, not just plan-driven ones

import React from 'react';
import { PortfolioImpactSummary } from '../../../types/impactMeasurement';
import { ImpactScoreBadge } from '../../assessment/impact/ImpactScoreBadge';

interface PlansImpactSectionProps {
  summary: PortfolioImpactSummary;
  planTeamMap: Map<string, string>;
  onPlanClick?: (planId: string) => void;
  onConfidenceInfoClick: () => void;
}

export const PlansImpactSection: React.FC<PlansImpactSectionProps> = ({
  summary,
  planTeamMap,
  onPlanClick,
  onConfidenceInfoClick,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>IMPACT OF IMPROVEMENT PLANS</h2>
          <p style={styles.subtitle}>
            Track the specific impact of your active improvement plans and plays
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{summary.activePlansCount}</span>
          <span style={styles.statLabel}>Active Plans</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#006644' }}>{summary.plansWithPositiveImpact}</span>
          <span style={styles.statLabel}>With Positive Impact</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.stat}>
          <div style={styles.statValueRow}>
            <span style={styles.statValue}>{summary.avgConfidenceScore}%</span>
            <button
              onClick={onConfidenceInfoClick}
              style={styles.infoButton}
              title="How is confidence calculated?"
            >
              <InfoIcon />
            </button>
          </div>
          <span style={styles.statLabel}>Avg Confidence</span>
        </div>
      </div>

      {/* Top Plans and High-Impact Plays */}
      <div style={styles.twoColumnGrid}>
        {/* Top Performing Plans */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>TOP PERFORMING PLANS</h3>
          {summary.topPerformingPlans.length > 0 ? (
            <div style={styles.planList}>
              {summary.topPerformingPlans.slice(0, 5).map((plan, idx) => (
                <div
                  key={plan.planId}
                  style={styles.planItem}
                  onClick={() => onPlanClick?.(plan.planId)}
                >
                  <div style={styles.planRank}>#{idx + 1}</div>
                  <div style={styles.planInfo}>
                    <span style={styles.planTeam}>{planTeamMap.get(plan.planId) || plan.teamName}</span>
                    <span style={styles.planPlays}>{plan.planName}</span>
                  </div>
                  <ImpactScoreBadge score={plan.impactScore} size="small" />
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No plans with measured impact yet</p>
          )}
        </div>

        {/* High-Impact Plays */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>HIGH-IMPACT PLAYS</h3>
          {summary.topImpactPlays.length > 0 ? (
            <div style={styles.playList}>
              {summary.topImpactPlays.slice(0, 5).map((play) => (
                <div key={play.playId} style={styles.playItem}>
                  <div style={styles.playInfo}>
                    <span style={styles.playName}>{play.playTitle}</span>
                    <span style={styles.playAdoption}>
                      Adopted by {play.teamsUsing} team{play.teamsUsing !== 1 ? 's' : ''} in your portfolio
                    </span>
                  </div>
                  <div style={styles.playImpact}>
                    <span style={{
                      ...styles.impactValue,
                      color: play.avgImpact >= 0 ? '#006644' : '#DE350B',
                    }}>
                      {play.avgImpact >= 0 ? '+' : ''}{play.avgImpact.toFixed(1)}
                    </span>
                    <span style={styles.impactLabel}>avg impact</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No high-impact plays identified yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Info icon component
const InfoIcon: React.FC = () => (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="#6B778C" strokeWidth="1.5" fill="none" />
    <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6B778C">i</text>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 28,
    border: '1px solid #DFE1E6',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B778C',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 48,
    padding: '20px 0',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
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
  infoButton: {
    background: 'none',
    border: 'none',
    padding: 2,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    border: '1px solid #DFE1E6',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 16px 0',
  },
  planList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  planItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  planRank: {
    fontSize: 12,
    fontWeight: 600,
    color: '#5E6C84',
    width: 24,
  },
  planInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  planTeam: {
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
  },
  planPlays: {
    fontSize: 11,
    color: '#6B778C',
  },
  playList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  playItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: 6,
  },
  playInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  playName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
  },
  playAdoption: {
    fontSize: 11,
    color: '#6B778C',
  },
  playImpact: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: 600,
  },
  impactLabel: {
    fontSize: 10,
    color: '#6B778C',
  },
  emptyText: {
    fontSize: 13,
    color: '#6B778C',
    fontStyle: 'italic',
    margin: 0,
    textAlign: 'center',
    padding: 20,
  },
};

export default PlansImpactSection;
