// PlanDetailPage - Individual plan detail view with progress tracking by outcome
// Simplified: Shows plays directly under outcomes (no dimension grouping)
// Includes Impact tab for measuring play effectiveness

import React, { useState, useMemo } from 'react';
import {
  ImprovementPlan,
  PlanPlay,
  PlayStatus,
  calculatePlanProgress,
  getPlayStatusColor,
  getPlayStatusLabel,
} from '../../types/improvementPlan';
import { OUTCOME_DEFINITIONS } from '../../constants/outcomeDefinitions';
import SinglePlanOverview from './SinglePlanOverview';
import { PlanImpactTab } from './impact/PlanImpactTab';

type DetailTab = 'plays' | 'impact';

interface PlanDetailPageProps {
  plan: ImprovementPlan;
  teamName: string;
  onBack: () => void;
  onPlayStatusChange: (playId: string, status: PlayStatus) => void;
  onArchivePlan?: () => void;
}

interface OutcomeSection {
  outcomeId: string;
  outcomeName: string;
  priority: number;
  plays: PlanPlay[];
  overallProgress: number;
}

const PlanDetailPage: React.FC<PlanDetailPageProps> = ({
  plan,
  teamName,
  onBack,
  onPlayStatusChange,
  onArchivePlan,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('plays');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    // Start with all sections expanded
    new Set(plan.outcomePriorities?.map(op => op.outcomeId) || [])
  );
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(true);

  // Calculate overall plan progress
  const planProgress = useMemo(() => calculatePlanProgress(plan.plays), [plan.plays]);

  // Build outcome sections with plays grouped by outcome (no dimension layer)
  const outcomeSections: OutcomeSection[] = useMemo(() => {
    if (!plan.outcomePriorities || plan.outcomePriorities.length === 0) {
      // If no outcome priorities, create a single section with all plays
      return [{
        outcomeId: 'all',
        outcomeName: 'All Plays',
        priority: 1,
        plays: plan.plays.sort((a, b) => a.priority - b.priority),
        overallProgress: planProgress.completionPercentage,
      }];
    }

    return plan.outcomePriorities.map(op => {
      const outcomeDef = OUTCOME_DEFINITIONS.find(o => o.id === op.outcomeId);
      const outcomeName = outcomeDef?.name || op.outcomeId;

      // Get dimensions for this outcome
      const outcomeDimKeys: string[] = outcomeDef?.dimensions.map(d => d.dimensionKey) || [];

      // Get plays for this outcome - either by sourceOutcomeId or by dimension
      const outcomePlays = plan.plays.filter(p =>
        p.sourceOutcomeId === op.outcomeId || outcomeDimKeys.includes(p.sourceDimensionKey)
      ).sort((a, b) => a.priority - b.priority);

      // Calculate progress for this outcome
      const totalPlaysInOutcome = outcomePlays.length;
      const completedPlaysInOutcome = outcomePlays.filter(p => p.status === 'completed').length;
      const skippedPlaysInOutcome = outcomePlays.filter(p => p.status === 'skipped').length;
      const activePlaysInOutcome = totalPlaysInOutcome - skippedPlaysInOutcome;
      const overallProgress = activePlaysInOutcome > 0
        ? Math.round((completedPlaysInOutcome / activePlaysInOutcome) * 100)
        : 0;

      return {
        outcomeId: op.outcomeId,
        outcomeName,
        priority: op.priority,
        plays: outcomePlays,
        overallProgress,
      };
    });
  }, [plan.plays, plan.outcomePriorities, planProgress.completionPercentage]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Get status badge for a play
  const renderStatusBadge = (status: PlayStatus) => {
    const colors = getPlayStatusColor(status);
    return (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
        }}
      >
        {getPlayStatusLabel(status)}
      </span>
    );
  };

  // Get progress bar color
  const getProgressColor = (progress: number): string => {
    if (progress >= 75) return '#36B37E';
    if (progress >= 50) return '#FFAB00';
    if (progress >= 25) return '#FF8B00';
    return '#5243AA';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 5L7 10L12 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back</span>
            </button>
          </div>
          <div style={styles.headerCenter}>
            <div style={styles.planBadge}>Improvement Plan</div>
            <h1 style={styles.planName}>{plan.name}</h1>
            <span style={styles.teamLabel}>{teamName}</span>
          </div>
          <div style={styles.headerRight}>
            {onArchivePlan && (
              <button style={styles.archiveButton} onClick={onArchivePlan}>
                Archive Plan
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Overview - consistent with portfolio view */}
      <div style={styles.progressSummary}>
        <SinglePlanOverview
          plan={plan}
          isExpanded={isOverviewExpanded}
          onToggleExpanded={() => setIsOverviewExpanded(!isOverviewExpanded)}
        />
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'plays' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('plays')}
          >
            Plays
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'impact' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('impact')}
          >
            Impact
            {plan.impactSummary?.playsWithImpact?.length ? (
              <span style={styles.tabBadge}>
                {plan.impactSummary.playsWithImpact.length}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'impact' ? (
        <div style={styles.content}>
          <PlanImpactTab plan={plan} />
        </div>
      ) : (
      /* Outcome Sections */
      <div style={styles.content}>
        {outcomeSections.map((outcome) => {
          const isExpanded = expandedSections.has(outcome.outcomeId);

          return (
            <div key={outcome.outcomeId} style={styles.outcomeSection}>
              {/* Outcome Header - clickable to expand/collapse */}
              <button
                style={styles.outcomeHeader}
                onClick={() => toggleSection(outcome.outcomeId)}
              >
                <div style={styles.outcomePriority}>
                  <span style={styles.priorityNumber}>{outcome.priority}</span>
                </div>
                <div style={styles.outcomeInfo}>
                  <h2 style={styles.outcomeName}>{outcome.outcomeName}</h2>
                  <div style={styles.outcomeProgress}>
                    <span style={styles.playsCount}>
                      {outcome.plays.filter(p => p.status === 'completed').length}/{outcome.plays.length} plays
                    </span>
                    <div style={styles.miniProgressBar}>
                      <div
                        style={{
                          ...styles.miniProgressFill,
                          width: `${outcome.overallProgress}%`,
                          backgroundColor: getProgressColor(outcome.overallProgress),
                        }}
                      />
                    </div>
                    <span style={styles.outcomeProgressText}>{outcome.overallProgress}%</span>
                  </div>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Plays list */}
              {isExpanded && (
                <div style={styles.playsList}>
                  {outcome.plays.map((play) => (
                    <div key={play.id} style={styles.playCard}>
                      <div style={styles.playMain}>
                        <span style={styles.playTitle}>{play.title}</span>
                        <div style={styles.playMeta}>
                          <span style={styles.categoryBadge}>{play.category}</span>
                          <span style={styles.metaDot}>·</span>
                          <span style={styles.effortBadge}>{play.effort} effort</span>
                          <span style={styles.metaDot}>·</span>
                          <span style={styles.impactBadge}>{play.impact} impact</span>
                        </div>
                      </div>
                      <div style={styles.playActions}>
                        {renderStatusBadge(play.status)}
                        <select
                          value={play.status}
                          onChange={(e) => onPlayStatusChange(play.id, e.target.value as PlayStatus)}
                          style={styles.statusSelect}
                        >
                          <option value="backlog">Backlog</option>
                          <option value="do-next">Do Next</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="skipped">Skipped</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {outcome.plays.length === 0 && (
                    <div style={styles.emptyPlays}>
                      <p style={styles.emptyText}>No plays for this outcome.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {outcomeSections.length === 0 && (
          <div style={styles.emptyState}>
            <p>No outcomes configured for this plan.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F4F5F7',
  },
  header: {
    backgroundColor: '#5243AA',
    padding: '16px 0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: '0 0 auto',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flex: '0 0 auto',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  planBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  planName: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  teamLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: '4px',
    display: 'block',
  },
  archiveButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  progressSummary: {
    maxWidth: '1200px',
    margin: '-20px auto 0',
    padding: '0 24px',
    position: 'relative',
    zIndex: 1,
  },
  tabContainer: {
    maxWidth: '1200px',
    margin: '24px auto 0',
    padding: '0 24px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#FFFFFF',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    width: 'fit-content',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  activeTab: {
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
  },
  tabBadge: {
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
  },
  content: {
    maxWidth: '1200px',
    margin: '32px auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  outcomeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  outcomeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    borderBottom: '1px solid #EBECF0',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  outcomePriority: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5243AA',
    borderRadius: '8px',
    flexShrink: 0,
  },
  priorityNumber: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  outcomeInfo: {
    flex: 1,
  },
  outcomeName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '6px',
  },
  outcomeProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  playsCount: {
    fontSize: '13px',
    color: '#6B778C',
    minWidth: '80px',
  },
  miniProgressBar: {
    flex: 1,
    maxWidth: '200px',
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  outcomeProgressText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5243AA',
    minWidth: '40px',
  },
  playsList: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  playCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    transition: 'border-color 0.15s ease',
  },
  playMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  playTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  playMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B778C',
  },
  categoryBadge: {
    textTransform: 'capitalize',
  },
  metaDot: {
    color: '#C1C7D0',
  },
  effortBadge: {
    textTransform: 'capitalize',
  },
  impactBadge: {
    textTransform: 'capitalize',
  },
  playActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusSelect: {
    padding: '6px 10px',
    fontSize: '12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  emptyPlays: {
    padding: '24px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: '#6B778C',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
  },
};

export default PlanDetailPage;
