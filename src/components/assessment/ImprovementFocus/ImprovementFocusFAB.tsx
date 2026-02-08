import React from 'react';
import { ImprovementPlan, calculatePlanProgress } from '../../../types/improvementPlan';

interface ImprovementFocusFABProps {
  plan: ImprovementPlan | null;
  onClick: () => void;
}

const ImprovementFocusFAB: React.FC<ImprovementFocusFABProps> = ({ plan, onClick }) => {
  // Calculate active plays count (in-progress + do-next + backlog)
  const progress = plan ? calculatePlanProgress(plan.plays) : null;
  const activeCount = progress ? progress.inProgress + progress.doNext + progress.backlog : 0;
  const totalCount = progress ? progress.totalPlays : 0;

  return (
    <button
      style={styles.fab}
      onClick={onClick}
      aria-label={`Improvement Plan: ${totalCount} plays in plan`}
    >
      <div style={styles.fabContent}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        {totalCount > 0 && (
          <span style={styles.badge}>{totalCount}</span>
        )}
      </div>
      <span style={styles.label}>
        Improvement Plan
      </span>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#5243AA',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(82, 67, 170, 0.4)',
    transition: 'all 0.2s ease',
    zIndex: 1000,
  },
  fabContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    backgroundColor: '#FF5630',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
};

export default ImprovementFocusFAB;
