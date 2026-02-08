import React, { useState, useCallback } from 'react';
import {
  ImprovementPlan,
  PlayStatus,
  TaskStatus,
  calculatePlanProgress,
  groupPlaysByStatus,
} from '../../../types/improvementPlan';
import PlanPlayCard from '../ExecutiveSummary/ImprovementPlanTab/PlanPlayCard';

interface ImprovementFocusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ImprovementPlan | null;
  onPlayStatusChange: (playId: string, status: PlayStatus) => void;
  onAddTask: (playId: string, title: string) => void;
  onTaskStatusChange: (playId: string, taskId: string, status: TaskStatus) => void;
  onDeleteTask: (playId: string, taskId: string) => void;
  onNavigateToFullPlan: () => void;
  onNavigateToDimension: (dimensionKey: string) => void;
  onCreatePlan: () => void;
}

const ImprovementFocusPanel: React.FC<ImprovementFocusPanelProps> = ({
  isOpen,
  onClose,
  plan,
  onPlayStatusChange,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
  onNavigateToFullPlan,
  onNavigateToDimension,
  onCreatePlan,
}) => {
  const [expandedPlayId, setExpandedPlayId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((playId: string) => {
    setExpandedPlayId(prev => prev === playId ? null : playId);
  }, []);

  if (!isOpen) return null;

  // Calculate progress
  const progress = plan ? calculatePlanProgress(plan.plays) : null;
  const playsByStatus = plan ? groupPlaysByStatus(plan.plays) : null;

  // Get active plays (in-progress first, then do-next)
  const activePlays = playsByStatus
    ? [...playsByStatus.inProgress, ...playsByStatus.doNext]
    : [];

  const hasActivePlan = plan !== null && plan.status !== 'archived';

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 5l-5 5 5 5" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h2 style={styles.title}>Improvement Plan</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5l-10 10" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {!hasActivePlan ? (
            /* No Plan State */
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#DFE1E6" strokeWidth="2"/>
                  <circle cx="24" cy="24" r="8" stroke="#DFE1E6" strokeWidth="2"/>
                  <path d="M24 4v8M24 36v8M4 24h8M36 24h8" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.emptyTitle}>No improvement plan yet</h3>
              <p style={styles.emptyText}>
                Create an improvement plan to track plays and tasks here.
              </p>
              <button style={styles.createButton} onClick={onCreatePlan}>
                Create Plan
              </button>
            </div>
          ) : (
            <>
              {/* Progress Summary */}
              {progress && (
                <div style={styles.summary}>
                  <div style={styles.summaryRow}>
                    <span style={styles.planName}>{plan?.name}</span>
                    <button style={styles.viewFullPlanButton} onClick={onNavigateToFullPlan}>
                      View full plan
                    </button>
                  </div>
                  <div style={styles.progressRow}>
                    <span style={styles.progressText}>
                      <strong>{progress.completed}</strong> of <strong>{progress.totalPlays}</strong> plays completed
                    </span>
                    <span style={styles.progressPercent}>{progress.completionPercentage}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress.completionPercentage}%` }} />
                  </div>
                </div>
              )}

              {/* Active Plays */}
              {activePlays.length === 0 ? (
                <div style={styles.allDone}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" fill="#E3FCEF" stroke="#36B37E" strokeWidth="2" />
                    <path d="M10 16l4 4 8-8" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h4 style={styles.allDoneTitle}>All plays completed!</h4>
                  <p style={styles.allDoneText}>
                    Great work! Consider creating a new plan to continue improving.
                  </p>
                </div>
              ) : (
                <div style={styles.playsList}>
                  {activePlays.slice(0, 5).map((play) => (
                    <PlanPlayCard
                      key={play.id}
                      play={play}
                      isExpanded={expandedPlayId === play.id}
                      onToggleExpand={() => handleToggleExpand(play.id)}
                      onStatusChange={(status) => onPlayStatusChange(play.id, status)}
                      onAddTask={(title) => onAddTask(play.id, title)}
                      onTaskStatusChange={(taskId, status) => onTaskStatusChange(play.id, taskId, status)}
                      onDeleteTask={(taskId) => onDeleteTask(play.id, taskId)}
                      onNavigateToDimension={onNavigateToDimension}
                    />
                  ))}

                  {activePlays.length > 5 && (
                    <button style={styles.viewMoreButton} onClick={onNavigateToFullPlan}>
                      View {activePlays.length - 5} more plays
                    </button>
                  )}
                </div>
              )}

              {/* Tip */}
              <div style={styles.tip}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#FF8B00" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v1" stroke="#FF8B00" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={styles.tipText}>
                  Focus on completing one play at a time for better results.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    zIndex: 1001,
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '420px',
    maxWidth: '90vw',
    height: '100vh',
    backgroundColor: '#FFFFFF',
    boxShadow: '-4px 0 24px rgba(9, 30, 66, 0.25)',
    zIndex: 1002,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  title: {
    flex: 1,
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '20px',
    opacity: 0.6,
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
    maxWidth: '280px',
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  summary: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  planName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  viewFullPlanButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  progressText: {
    fontSize: '13px',
    color: '#172B4D',
  },
  progressPercent: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5243AA',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  allDone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  allDoneTitle: {
    margin: '16px 0 8px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#006644',
  },
  allDoneText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  playsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  viewMoreButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  tip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    border: '1px solid #FFE380',
  },
  tipText: {
    fontSize: '12px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default ImprovementFocusPanel;
