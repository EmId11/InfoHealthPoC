import React, { useMemo, useEffect, useState } from 'react';
import { AssessmentResult } from '../../../types/assessment';
import { ImprovementPlan } from '../../../types/improvementPlan';
import { OutcomeAreaId } from '../../../types/outcomeConfidence';
import { calculateExecutiveSummary } from '../../../utils/executiveSummaryUtils';
import HealthScoreHero from './HealthScoreHero';
import DimensionTableView from '../DimensionTableView';
import OutcomeConfidenceHero from './OutcomeConfidenceHero';
import { ImprovementPlanTab } from './ImprovementPlanTab';
import { AssessmentReportsTab } from './ReportsTab';

// Top-level tabs
type TopLevelTab = 'assessment-results' | 'improvement-plan' | 'reports';

// Sub-view within Assessment Results
type AssessmentSubView = 'outcomes' | 'dimensions';

// Inject keyframe animation once
const ANIMATION_INJECTED_KEY = 'exec-summary-animations-injected';
const injectAnimations = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIMATION_INJECTED_KEY)) return;

  const style = document.createElement('style');
  style.id = ANIMATION_INJECTED_KEY;
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
};

interface ExecutiveSummaryPageProps {
  assessmentResult: AssessmentResult;
  onThemeClick: (themeId: string) => void;
  onDimensionClick: (dimensionKey: string) => void;
  onOutcomeClick: (outcomeId: OutcomeAreaId) => void;
  // Multi-plan support
  plans?: ImprovementPlan[];
  selectedPlan?: ImprovementPlan | null;
  onSelectPlan?: (planId: string) => void;
  onPlanUpdate?: (plan: ImprovementPlan) => void;
  onArchivePlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
  onOpenPlanWizard?: () => void;
  onOpenPlanDetail?: (plan: ImprovementPlan) => void;
  // Newly created plan auto-navigation
  newlyCreatedPlanId?: string | null;
  onClearNewlyCreatedPlan?: () => void;
}

const ExecutiveSummaryPage: React.FC<ExecutiveSummaryPageProps> = ({
  assessmentResult,
  onThemeClick,
  onDimensionClick,
  onOutcomeClick,
  plans = [],
  selectedPlan = null,
  onSelectPlan,
  onPlanUpdate,
  onArchivePlan,
  onDeletePlan,
  onOpenPlanWizard,
  onOpenPlanDetail,
  newlyCreatedPlanId,
  onClearNewlyCreatedPlan,
}) => {
  const [activeTab, setActiveTab] = useState<TopLevelTab>('assessment-results');
  const [assessmentSubView, setAssessmentSubView] = useState<AssessmentSubView>('outcomes');

  // Handler to open the plan wizard
  const handleCreatePlan = () => {
    if (onOpenPlanWizard) {
      onOpenPlanWizard();
    }
  };

  // Handler for plan updates
  const handlePlanUpdate = (updatedPlan: ImprovementPlan) => {
    if (onPlanUpdate) {
      onPlanUpdate(updatedPlan);
    }
  };

  const summaryData = useMemo(
    () => calculateExecutiveSummary(assessmentResult),
    [assessmentResult]
  );

  // Inject animations on mount
  useEffect(() => {
    injectAnimations();
  }, []);

  // Auto-switch to improvement-plan tab when a new plan is created
  useEffect(() => {
    if (newlyCreatedPlanId) {
      setActiveTab('improvement-plan');
    }
  }, [newlyCreatedPlanId]);

  return (
    <div style={styles.container}>
      {/* ═══════════════════════════════════════════════════════════════════
          TOP-LEVEL TABS: Assessment Results | Improvement Plan | Reports
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={styles.topTabsContainer}>
        <div style={styles.topTabs}>
          <button
            style={{
              ...styles.topTabButton,
              ...(activeTab === 'assessment-results' ? styles.topTabButtonActive : {}),
            }}
            onClick={() => setActiveTab('assessment-results')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            Assessment Results
          </button>
          <button
            style={{
              ...styles.topTabButton,
              ...(activeTab === 'improvement-plan' ? styles.topTabButtonActive : {}),
            }}
            onClick={() => setActiveTab('improvement-plan')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
            </svg>
            Improvements
          </button>
          <button
            style={{
              ...styles.topTabButton,
              ...(activeTab === 'reports' ? styles.topTabButtonActive : {}),
            }}
            onClick={() => setActiveTab('reports')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            Reports
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ASSESSMENT RESULTS TAB
          Contains shared hero header + toggle between Outcomes/Dimensions
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'assessment-results' && (
        <>
          {/* Shared Hero Header - "Can you trust your Jira data?" */}
          <HealthScoreHero
            healthScore={summaryData.healthScore}
            overallTrend={summaryData.overallTrend}
          />

          {/* Sub-view Toggle: Outcomes | Dimensions */}
          <div style={styles.subViewToggleContainer}>
            <div style={styles.subViewToggle}>
              <button
                style={{
                  ...styles.subViewButton,
                  ...(assessmentSubView === 'outcomes' ? styles.subViewButtonActive : {}),
                }}
                onClick={() => setAssessmentSubView('outcomes')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                By Outcome
              </button>
              <button
                style={{
                  ...styles.subViewButton,
                  ...(assessmentSubView === 'dimensions' ? styles.subViewButtonActive : {}),
                }}
                onClick={() => setAssessmentSubView('dimensions')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
                </svg>
                All Dimensions
              </button>
            </div>
          </div>

          {/* Outcomes Sub-View */}
          {assessmentSubView === 'outcomes' && summaryData.outcomeConfidence && (
            <OutcomeConfidenceHero
              confidenceSummary={summaryData.outcomeConfidence}
              onOutcomeClick={onOutcomeClick}
              hideHeader={true}
            />
          )}

          {/* Dimensions Sub-View */}
          {assessmentSubView === 'dimensions' && (
            <section style={styles.areasSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionTitleGroup}>
                  <h2 style={styles.sectionTitle}>All Dimensions</h2>
                  <p style={styles.sectionSubtitle}>
                    Dimensions with outcome impact indicators
                  </p>
                </div>
              </div>
              <div style={styles.areasCard}>
                <DimensionTableView
                  dimensions={assessmentResult.dimensions}
                  onDimensionClick={onDimensionClick}
                />
              </div>
            </section>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          IMPROVEMENT PLAN TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'improvement-plan' && (
        <ImprovementPlanTab
          assessmentResult={assessmentResult}
          outcomeConfidence={summaryData.outcomeConfidence}
          plans={plans}
          selectedPlan={selectedPlan}
          onSelectPlan={onSelectPlan || (() => {})}
          onPlanUpdate={handlePlanUpdate}
          onArchivePlan={onArchivePlan || (() => {})}
          onDeletePlan={onDeletePlan || (() => {})}
          onCreatePlan={handleCreatePlan}
          onNavigateToDimension={onDimensionClick}
          onOpenPlanDetail={onOpenPlanDetail}
          newlyCreatedPlanId={newlyCreatedPlanId}
          onClearNewlyCreatedPlan={onClearNewlyCreatedPlan}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          REPORTS TAB
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <AssessmentReportsTab
          assessmentResult={assessmentResult}
          onNavigateToDimension={onDimensionClick}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    // No padding or maxWidth - this component is already wrapped by AssessmentResultsLayout's contentWrapper
  },

  // Top-level tabs
  topTabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  topTabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '4px',
  },
  topTabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  topTabButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
  },

  // Sub-view toggle (within Assessment Results)
  subViewToggleContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  subViewToggle: {
    display: 'inline-flex',
    gap: '2px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    padding: '3px',
    border: '1px solid #DFE1E6',
  },
  subViewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  subViewButtonActive: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
  },

  // Sections
  areasSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'fadeInUp 0.4s ease-out',
  },
  areasCard: {
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '2px solid #E4E6EB',
  },
  sectionTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
};

export default ExecutiveSummaryPage;
