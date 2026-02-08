import React, { useState } from 'react';
import { ImprovementPlan } from '../../../../types/improvementPlan';
import { formatTargetList } from '../../../../utils/improvementPlanUtils';
import SinglePlanOverview from '../../../plans/SinglePlanOverview';

interface PlanHeaderProps {
  plan: ImprovementPlan;
  onArchive: () => void;
  onCreateNew: () => void;
  onViewFullPlan?: () => void;
}

const PlanHeader: React.FC<PlanHeaderProps> = ({
  plan,
  onArchive,
  onCreateNew,
  onViewFullPlan,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // Format targets for display
  const targetsList = formatTargetList(plan.optimizationTargets);

  return (
    <div style={styles.container}>
      {/* Top row with title and actions */}
      <div style={styles.topRow}>
        <div style={styles.titleSection}>
          <div style={styles.labelRow}>
            <span style={styles.label}>IMPROVEMENT PLAN</span>
          </div>
          <h2 style={styles.planName}>{plan.name}</h2>
        </div>

        <div style={styles.actions}>
          <div style={styles.actionsDropdown}>
            <button
              style={styles.actionsButton}
              onClick={() => setShowActions(!showActions)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1.5" fill="#6B778C" />
                <circle cx="8" cy="8" r="1.5" fill="#6B778C" />
                <circle cx="8" cy="13" r="1.5" fill="#6B778C" />
              </svg>
            </button>

            {showActions && (
              <>
                <div
                  style={styles.actionsBackdrop}
                  onClick={() => setShowActions(false)}
                />
                <div style={styles.actionsMenu}>
                  {onViewFullPlan && (
                    <button
                      style={styles.actionItem}
                      onClick={() => {
                        setShowActions(false);
                        onViewFullPlan();
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="12" height="12" rx="1" stroke="#172B4D" strokeWidth="1.5" />
                        <path d="M5 5H11M5 8H11M5 11H8" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      View Full Plan
                    </button>
                  )}
                  <button
                    style={styles.actionItem}
                    onClick={() => {
                      setShowActions(false);
                      onCreateNew();
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    New Plan
                  </button>
                  <button
                    style={styles.actionItem}
                    onClick={() => {
                      setShowActions(false);
                      onArchive();
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="4" width="12" height="10" rx="1" stroke="#172B4D" strokeWidth="1.5" />
                      <path d="M2 4L3 2H13L14 4" stroke="#172B4D" strokeWidth="1.5" />
                      <path d="M6 8H10" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Archive Plan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Targets */}
      <div style={styles.targetsRow}>
        <span style={styles.targetsLabel}>Targets:</span>
        <span style={styles.targetsValue}>{targetsList}</span>
      </div>

      {/* Single Plan Overview - consistent with portfolio view */}
      <SinglePlanOverview
        plan={plan}
        isExpanded={isOverviewExpanded}
        onToggleExpanded={() => setIsOverviewExpanded(!isOverviewExpanded)}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  planName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  actions: {
    position: 'relative',
  },
  actionsDropdown: {
    position: 'relative',
  },
  actionsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionsBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  actionsMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    padding: '4px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.16)',
    zIndex: 11,
    minWidth: '140px',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  targetsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  targetsLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  targetsValue: {
    fontSize: '13px',
    color: '#172B4D',
  },
};

export default PlanHeader;
