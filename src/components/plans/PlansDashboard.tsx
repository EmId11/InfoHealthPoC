// PlansDashboard - Executive dashboard for all improvement plans
// Shows aggregate breakdowns by outcome, priority, and intervention type
// Includes Impact view for measuring portfolio-wide outcomes

import React, { useState, useMemo } from 'react';
import {
  ImprovementPlan,
  calculatePlanProgress,
  calculateCoverageMetrics,
} from '../../types/improvementPlan';
import { calculatePortfolioImpact } from '../../utils/impactCalculations';
import PortfolioOverview from './PortfolioOverview';
import { PortfolioImpactDashboard } from './impact/PortfolioImpactDashboard';

type DashboardView = 'overview' | 'progress' | 'impact';

interface PlansDashboardProps {
  plans: ImprovementPlan[];
  onViewPlan: (plan: ImprovementPlan) => void;
  onPausePlan: (plan: ImprovementPlan) => void;
  onResumePlan: (plan: ImprovementPlan) => void;
  onArchivePlan: (plan: ImprovementPlan) => void;
  onDeletePlan: (plan: ImprovementPlan) => void;
  onCreatePlan: () => void;
}

const PlansDashboard: React.FC<PlansDashboardProps> = ({
  plans,
  onViewPlan,
  onPausePlan,
  onResumePlan,
  onArchivePlan,
  onDeletePlan,
  onCreatePlan,
}) => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isProgressExpanded, setIsProgressExpanded] = useState(true);

  // Separate active and archived plans
  const activePlans = useMemo(
    () => plans.filter(p => p.status !== 'archived'),
    [plans]
  );
  const archivedPlans = useMemo(
    () => plans.filter(p => p.status === 'archived'),
    [plans]
  );

  // Calculate coverage metrics for section headers
  const coverageMetrics = useMemo(
    () => calculateCoverageMetrics(plans),
    [plans]
  );

  // Calculate portfolio impact metrics for Impact section header
  const impactMetrics = useMemo(() => {
    const summary = calculatePortfolioImpact(plans);
    const dimensionsImproved = summary.impactByDimension.filter(d => d.healthScoreChange > 0).length;
    const totalDimensions = summary.impactByDimension.length;
    const totalImpact = Math.round(summary.totalNetImpact * 10) / 10;
    return { dimensionsImproved, totalDimensions, totalImpact };
  }, [plans]);

  // Format date for display (relative)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Format created date (always show full date)
  const formatCreatedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status style
  const getStatusStyle = (plan: ImprovementPlan) => {
    const progress = calculatePlanProgress(plan.plays);

    if (plan.status === 'paused') {
      return { bg: '#FFF0B3', text: '#B65C02', label: 'Paused' };
    }
    if (progress.completionPercentage >= 100) {
      return { bg: '#E3FCEF', text: '#006644', label: 'Completed' };
    }
    if (progress.inProgress > 0) {
      return { bg: '#DEEBFF', text: '#0052CC', label: 'In Progress' };
    }
    if (progress.doNext > 0) {
      return { bg: '#EAE6FF', text: '#5243AA', label: 'Ready' };
    }
    return { bg: '#F4F5F7', text: '#6B778C', label: 'Not Started' };
  };

  return (
    <div style={styles.container}>
      {/* Header with title and create button */}
      <div style={styles.header}>
        <h2 style={styles.title}>Improvements</h2>
        <button style={styles.createButton} onClick={onCreatePlan}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Improvement Plan
        </button>
      </div>

      {/* View Tabs */}
      {activePlans.length > 0 && (
        <div style={styles.viewTabs}>
          <button
            style={{
              ...styles.viewTab,
              ...(activeView === 'overview' ? styles.activeViewTab : {}),
            }}
            onClick={() => setActiveView('overview')}
          >
            Plans
          </button>
          <button
            style={{
              ...styles.viewTab,
              ...(activeView === 'progress' ? styles.activeViewTab : {}),
            }}
            onClick={() => setActiveView('progress')}
          >
            Progress Tracker
          </button>
          <button
            style={{
              ...styles.viewTab,
              ...(activeView === 'impact' ? styles.activeViewTab : {}),
            }}
            onClick={() => setActiveView('impact')}
          >
            Impact Tracker
          </button>
        </div>
      )}

      {activePlans.length > 0 ? (
        <>
          {activeView === 'impact' ? (
            <>
              {/* Impact Tracker Intro */}
              <div style={styles.tabIntro}>
                <div style={styles.tabIntroIconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3v18h18" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 14l4-4 4 4 5-6" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={styles.tabIntroContent}>
                  <h3 style={styles.tabIntroTitle}>Impact Tracker</h3>
                  <p style={styles.tabIntroDescription}>
                    See the measurable results of your improvement efforts. This dashboard shows how your portfolio's
                    health has changed over time, comparing your position against similar teams.
                  </p>
                  <div style={styles.tabIntroFlow}>
                    <button style={styles.flowStep} onClick={() => setActiveView('overview')}>
                      <span style={styles.flowStepNumber}>1</span>
                      <span style={styles.flowStepLabel}>Plans</span>
                    </button>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <button style={styles.flowStep} onClick={() => setActiveView('progress')}>
                      <span style={styles.flowStepNumber}>2</span>
                      <span style={styles.flowStepLabel}>Progress</span>
                    </button>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <div style={{ ...styles.flowStep, ...styles.flowStepActive }}>
                      <span style={{ ...styles.flowStepNumber, ...styles.flowStepNumberActive }}>3</span>
                      <span style={{ ...styles.flowStepLabel, ...styles.flowStepLabelActive }}>Impact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionHeaderTitle}>Measured Impact</h3>
                <span style={styles.sectionHeaderCount}>
                  {impactMetrics.totalImpact >= 0 ? '+' : ''}{impactMetrics.totalImpact} health score points overall
                </span>
              </div>

              {/* Impact Dashboard */}
              <PortfolioImpactDashboard
                plans={plans}
                onPlanClick={(planId) => {
                  const plan = plans.find(p => p.id === planId);
                  if (plan) onViewPlan(plan);
                }}
              />
            </>
          ) : activeView === 'progress' ? (
            <>
              {/* Progress Tracker Intro */}
              <div style={styles.tabIntro}>
                <div style={styles.tabIntroIconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="#5243AA" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="#5243AA" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="#5243AA" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="#5243AA" strokeWidth="2"/>
                    <path d="M6.5 6.5h0M17.5 6.5h0M6.5 17.5h0M17.5 17.5h0" stroke="#5243AA" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={styles.tabIntroContent}>
                  <h3 style={styles.tabIntroTitle}>Progress Tracker</h3>
                  <p style={styles.tabIntroDescription}>
                    Monitor the execution of your improvement plans. Track how many plays are completed,
                    see coverage across outcomes and dimensions, and identify bottlenecks in your improvement velocity.
                  </p>
                  <div style={styles.tabIntroFlow}>
                    <button style={styles.flowStep} onClick={() => setActiveView('overview')}>
                      <span style={styles.flowStepNumber}>1</span>
                      <span style={styles.flowStepLabel}>Plans</span>
                    </button>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <div style={{ ...styles.flowStep, ...styles.flowStepActive }}>
                      <span style={{ ...styles.flowStepNumber, ...styles.flowStepNumberActive }}>2</span>
                      <span style={{ ...styles.flowStepLabel, ...styles.flowStepLabelActive }}>Progress</span>
                    </div>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <button style={styles.flowStep} onClick={() => setActiveView('impact')}>
                      <span style={styles.flowStepNumber}>3</span>
                      <span style={styles.flowStepLabel}>Impact</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionHeaderTitle}>Implementation Progress</h3>
                <span style={styles.sectionHeaderCount}>{coverageMetrics.completedPlays} of {coverageMetrics.totalPlays} plays completed</span>
              </div>

              {/* Progress Tracker - Portfolio metrics with sections */}
              <PortfolioOverview
                plans={plans}
                isExpanded={true}
                onToggleExpanded={() => {}}
                hideHeader={true}
              />
            </>
          ) : (
            <>
              {/* Plans Tab Intro */}
              <div style={styles.tabIntro}>
                <div style={styles.tabIntroIconBox}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#5243AA" strokeWidth="2" strokeLinecap="round"/>
                    <rect x="9" y="3" width="6" height="4" rx="1" stroke="#5243AA" strokeWidth="2"/>
                    <path d="M9 12h6M9 16h4" stroke="#5243AA" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={styles.tabIntroContent}>
                  <h3 style={styles.tabIntroTitle}>Improvement Plans</h3>
                  <p style={styles.tabIntroDescription}>
                    Your improvement plans contain plays — specific actions designed to improve your Jira health.
                    Each plan targets specific outcomes or dimensions. Click on a plan to view and manage its plays.
                  </p>
                  <div style={styles.tabIntroFlow}>
                    <div style={{ ...styles.flowStep, ...styles.flowStepActive }}>
                      <span style={{ ...styles.flowStepNumber, ...styles.flowStepNumberActive }}>1</span>
                      <span style={{ ...styles.flowStepLabel, ...styles.flowStepLabelActive }}>Plans</span>
                    </div>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <button style={styles.flowStep} onClick={() => setActiveView('progress')}>
                      <span style={styles.flowStepNumber}>2</span>
                      <span style={styles.flowStepLabel}>Progress</span>
                    </button>
                    <div style={styles.flowConnector}>
                      <div style={styles.flowLine} />
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="#C1C7D0"><path d="M0 0L8 4L0 8V0Z"/></svg>
                    </div>
                    <button style={styles.flowStep} onClick={() => setActiveView('impact')}>
                      <span style={styles.flowStepNumber}>3</span>
                      <span style={styles.flowStepLabel}>Impact</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Plans Section Header */}
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionHeaderTitle}>Your Plans</h3>
                <span style={styles.sectionHeaderCount}>{activePlans.length} plan{activePlans.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Plans Grid */}
              <div style={styles.planCardsGrid}>
              {activePlans.map(plan => {
                const progress = calculatePlanProgress(plan.plays);
                const statusStyle = getStatusStyle(plan);
                const isMenuOpen = menuOpenId === plan.id;

                return (
                  <div
                    key={plan.id}
                    style={styles.planCard}
                    onClick={() => onViewPlan(plan)}
                  >
                    {/* Card header with status and menu */}
                    <div style={styles.cardHeader}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                      <div style={styles.menuContainer} onClick={e => e.stopPropagation()}>
                        <button
                          style={styles.menuButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(isMenuOpen ? null : plan.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1.5" fill="#97A0AF" />
                            <circle cx="8" cy="8" r="1.5" fill="#97A0AF" />
                            <circle cx="8" cy="13" r="1.5" fill="#97A0AF" />
                          </svg>
                        </button>
                        {isMenuOpen && (
                          <>
                            <div
                              style={styles.menuBackdrop}
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div style={styles.menuDropdown}>
                              {plan.status === 'paused' ? (
                                <button
                                  style={styles.menuItem}
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onResumePlan(plan);
                                  }}
                                >
                                  Resume
                                </button>
                              ) : (
                                <button
                                  style={styles.menuItem}
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onPausePlan(plan);
                                  }}
                                >
                                  Pause
                                </button>
                              )}
                              <button
                                style={styles.menuItem}
                                onClick={() => {
                                  setMenuOpenId(null);
                                  onArchivePlan(plan);
                                }}
                              >
                                Archive
                              </button>
                              <button
                                style={{ ...styles.menuItem, color: '#DE350B' }}
                                onClick={() => {
                                  setMenuOpenId(null);
                                  onDeletePlan(plan);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Plan name */}
                    <h4 style={styles.cardTitle}>{plan.name}</h4>

                    {/* Description if exists */}
                    {plan.description && (
                      <p style={styles.cardDescription}>{plan.description}</p>
                    )}

                    {/* Plays count */}
                    <p style={styles.cardMeta}>{plan.plays.length} plays</p>

                    {/* Progress section */}
                    <div style={styles.cardProgress}>
                      <div style={styles.progressBarLarge}>
                        <div
                          style={{
                            ...styles.progressFillLarge,
                            width: `${progress.completionPercentage}%`,
                            backgroundColor: progress.completionPercentage > 0 ? '#36B37E' : '#DFE1E6',
                          }}
                        />
                      </div>
                      <div style={styles.progressStats}>
                        <span style={styles.progressFraction}>
                          {progress.completed} of {progress.totalPlays - progress.skipped}
                        </span>
                        <span style={styles.progressPercent}>
                          {progress.completionPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Footer with creator and dates */}
                    <div style={styles.cardFooter}>
                      {plan.createdByUserName && (
                        <>
                          <span style={styles.footerItem}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="3.5" r="2" stroke="#97A0AF" strokeWidth="1.2" />
                              <path d="M2 10.5c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5" stroke="#97A0AF" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            {plan.createdByUserName}
                          </span>
                          <span style={styles.footerSeparator}>·</span>
                        </>
                      )}
                      <span style={styles.footerItem}>
                        Created {formatCreatedDate(plan.createdAt)}
                      </span>
                      <span style={styles.footerSeparator}>·</span>
                      <span style={styles.footerItem}>
                        Updated {formatDate(plan.updatedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}
        </>
      ) : (
        /* Empty state */
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#C1C7D0" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="24" cy="24" r="10" stroke="#C1C7D0" strokeWidth="2" />
              <circle cx="24" cy="24" r="3" fill="#C1C7D0" />
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No improvement plans yet</h3>
          <p style={styles.emptyText}>
            Create your first improvement plan to start tracking progress toward better outcomes.
          </p>
          <button style={styles.emptyButton} onClick={onCreatePlan}>
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Archived plans section */}
      {archivedPlans.length > 0 && (
        <div style={styles.archivedSection}>
          <h4 style={styles.archivedTitle}>Archived ({archivedPlans.length})</h4>
          <div style={styles.archivedList}>
            {archivedPlans.map(plan => (
              <div key={plan.id} style={styles.archivedRow}>
                <span style={styles.archivedName}>{plan.name}</span>
                <span style={styles.archivedDate}>{formatDate(plan.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#5243AA',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  viewTabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#FFFFFF',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    width: 'fit-content',
  },
  viewTab: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  activeViewTab: {
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
  },
  tabIntro: {
    display: 'flex',
    gap: 16,
    padding: 20,
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    border: '1px solid #E6E3F5',
    boxShadow: '0 1px 3px rgba(82, 67, 170, 0.06)',
  },
  tabIntroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tabIntroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1,
  },
  tabIntroTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#172B4D',
  },
  tabIntroDescription: {
    margin: 0,
    fontSize: 14,
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  tabIntroFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    marginTop: 4,
  },
  flowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  flowStepActive: {
    backgroundColor: '#5243AA',
    cursor: 'default',
  },
  flowStepNumber: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowStepNumberActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
  flowStepLabel: {
    color: '#6B778C',
  },
  flowStepLabelActive: {
    color: '#FFFFFF',
  },
  flowConnector: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 4px',
  },
  flowLine: {
    width: 24,
    height: 2,
    backgroundColor: '#DFE1E6',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
  },
  sectionHeaderTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionHeaderCount: {
    fontSize: 13,
    color: '#6B778C',
  },
  plansSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  planCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  planCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  cardDescription: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  cardMeta: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#97A0AF',
  },
  cardProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #F4F5F7',
  },
  progressBarLarge: {
    width: '100%',
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressFraction: {
    fontSize: '13px',
    color: '#6B778C',
  },
  progressPercent: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#36B37E',
  },
  cardFooter: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #F4F5F7',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '6px',
  },
  footerItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#97A0AF',
  },
  footerSeparator: {
    fontSize: '11px',
    color: '#C1C7D0',
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  menuBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  menuDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    padding: '4px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.18)',
    zIndex: 11,
    minWidth: '120px',
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '20px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: '0 0 28px',
    fontSize: '14px',
    color: '#6B778C',
    maxWidth: '360px',
    lineHeight: 1.6,
  },
  emptyButton: {
    padding: '12px 24px',
    backgroundColor: '#5243AA',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  archivedSection: {
    marginTop: '8px',
  },
  archivedTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
  },
  archivedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  archivedRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  archivedName: {
    fontSize: '13px',
    color: '#6B778C',
  },
  archivedDate: {
    fontSize: '12px',
    color: '#97A0AF',
  },
};

export default PlansDashboard;
