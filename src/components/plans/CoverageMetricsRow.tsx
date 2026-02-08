// CoverageMetricsRow - Top row of 4 metric cards with icons
// Shows: Active Plans, Outcomes Targeted, Dimensions Affected, Total Plays

import React from 'react';
import { CoverageMetrics } from '../../types/improvementPlan';

interface CoverageMetricsRowProps {
  metrics: CoverageMetrics;
}

const CoverageMetricsRow: React.FC<CoverageMetricsRowProps> = ({ metrics }) => {
  const cards = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      ),
      value: metrics.activePlans,
      label: 'Active Plans',
      subtext: `${metrics.plansInProgress} in progress`,
      iconBg: '#F3F0FF',
      iconColor: '#5243AA',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      value: metrics.outcomesTargeted,
      label: 'Outcomes',
      subtext: `of ${metrics.totalOutcomes} targeted`,
      iconBg: '#DEEBFF',
      iconColor: '#0052CC',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 14l4-4 4 4 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      value: metrics.dimensionsAffected,
      label: 'Dimensions',
      subtext: `of ${metrics.totalDimensions} affected`,
      iconBg: '#E3FCEF',
      iconColor: '#006644',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" />
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
          <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      value: metrics.totalPlays,
      label: 'Total Plays',
      subtext: `${metrics.completedPlays} completed`,
      iconBg: '#FFF0B3',
      iconColor: '#B65C02',
    },
  ];

  return (
    <div style={styles.container}>
      {cards.map((card, index) => (
        <div key={index} style={styles.card}>
          <div style={{ ...styles.iconContainer, backgroundColor: card.iconBg, color: card.iconColor }}>
            {card.icon}
          </div>
          <div style={styles.content}>
            <span style={styles.value}>{card.value}</span>
            <span style={styles.label}>{card.label}</span>
          </div>
          <div style={styles.subtext}>{card.subtext}</div>
        </div>
      ))}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  value: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  label: {
    fontSize: '14px',
    color: '#6B778C',
  },
  subtext: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#6B778C',
  },
};

export default CoverageMetricsRow;
