import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AssessmentResult, IndicatorDrillDownState } from '../../types/assessment';
import { WizardState } from '../../types/wizard';
import { OutcomeAreaId } from '../../types/outcomeConfidence';
import { ImprovementPlan, PlayStatus } from '../../types/improvementPlan';
import { useImprovementPlan } from '../../hooks/useImprovementPlan';
import { TaskStatus } from '../../types/improvementPlan';
import {
  addTaskToPlay,
  updateTaskStatus,
  deleteTask,
} from '../../utils/improvementPlanUtils';
import { ImprovementPlanWizard } from './ExecutiveSummary/ImprovementPlanWizard';
import ComparisonGroupModal from './common/ComparisonGroupModal';
import { ImprovementPlanTab } from './ExecutiveSummary/ImprovementPlanTab';
import { AssessmentReportsTab } from './ExecutiveSummary/ReportsTab';
import { ImprovementFocusFAB, ImprovementFocusPanel } from './ImprovementFocus';
import { calculateExecutiveSummary } from '../../utils/executiveSummaryUtils';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import ShareIcon from '@atlaskit/icon/glyph/share';
import { PersonaSwitcher } from '../persona';
import { LensType } from '../../types/patterns';
import DataTrustBanner from './patterns/DataTrustBanner';
import {
  computeLensScores,
  getTrustLevel,
  LENS_CONFIG,
} from './patterns/DataTrustBanner';
import Sparkline from './common/Sparkline';
import { mockIntegrityDimensionResult, mockDimension6Result, staleFreshFindings } from '../../constants/mockAssessmentData';

// Top-level tabs
type TopLevelTab = 'assessment-results' | 'improvement-plan' | 'reports';

interface AssessmentResultsLayoutProps {
  assessmentResult: AssessmentResult;
  wizardState: WizardState;
  onBackToSetup: () => void;
  onBackToHome?: () => void;
  onShare?: () => void;
  onRerun?: () => void;
  canShare?: boolean;
  canEdit?: boolean;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
  onOutcomeClick?: (outcomeId: OutcomeAreaId) => void;
  initialExpandedDimension?: number | null;
  // Navigation source tracking for smart back navigation
  returnToOutcomeId?: OutcomeAreaId | null;
  onBackToOutcome?: (outcomeId: OutcomeAreaId) => void;
  // Full-page wizard navigation (optional - falls back to modal if not provided)
  onOpenImprovementPlanWizard?: () => void;
  // Navigate to plan detail page
  onOpenPlanDetail?: (plan: ImprovementPlan) => void;
  // Newly created plan ID from App.tsx (for auto-navigation after wizard)
  newlyCreatedPlanIdFromApp?: string | null;
  onClearNewlyCreatedPlanFromApp?: () => void;
  // Lens detail navigation
  onLensClick?: (lens: LensType) => void;
  // Team of Teams breadcrumb
  onBackToTeamOfTeams?: () => void;
}

const AssessmentResultsLayout: React.FC<AssessmentResultsLayoutProps> = ({
  assessmentResult,
  wizardState,
  onBackToSetup,
  onBackToHome,
  onShare,
  onRerun,
  canShare = false,
  canEdit = false,
  onIndicatorDrillDown,
  onOutcomeClick,
  initialExpandedDimension = null,
  returnToOutcomeId = null,
  onBackToOutcome,
  onOpenImprovementPlanWizard,
  onOpenPlanDetail,
  newlyCreatedPlanIdFromApp,
  onClearNewlyCreatedPlanFromApp,
  onLensClick,
  onBackToTeamOfTeams,
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Top-level tab state
  const [activeTab, setActiveTab] = useState<TopLevelTab>('assessment-results');

  // State for comparison group modal
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonModalContext, setComparisonModalContext] = useState<{
    yourRank?: number;
    dimensionName?: string;
  }>({});

  // Improvement Plan state (multi-plan support)
  const {
    activePlans,
    selectedPlan,
    selectPlan,
    addPlan,
    updatePlan,
    archivePlan,
    deletePlan,
    setPlayStatus,
    newlyCreatedPlanId,
    clearNewlyCreatedPlan,
  } = useImprovementPlan(assessmentResult.teamId);

  // State for Improvement Focus panel
  const [isImprovementPanelOpen, setIsImprovementPanelOpen] = useState(false);

  // State for Improvement Plan wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Handler for play status changes from the panel
  const handlePlayStatusChange = useCallback((playId: string, status: PlayStatus) => {
    setPlayStatus(playId, status);
  }, [setPlayStatus]);

  // Handler for adding tasks to a play
  const handleAddTask = useCallback((playId: string, title: string) => {
    if (!selectedPlan) return;
    const updatedPlan = addTaskToPlay(selectedPlan, playId, title);
    updatePlan(updatedPlan);
  }, [selectedPlan, updatePlan]);

  // Handler for updating task status
  const handleTaskStatusChange = useCallback((playId: string, taskId: string, status: TaskStatus) => {
    if (!selectedPlan) return;
    const updatedPlan = updateTaskStatus(selectedPlan, playId, taskId, status);
    updatePlan(updatedPlan);
  }, [selectedPlan, updatePlan]);

  // Handler for deleting a task
  const handleDeleteTask = useCallback((playId: string, taskId: string) => {
    if (!selectedPlan) return;
    const updatedPlan = deleteTask(selectedPlan, playId, taskId);
    updatePlan(updatedPlan);
  }, [selectedPlan, updatePlan]);

  // Handler for navigating to a dimension from the panel
  const handleNavigateToDimension = useCallback((dimensionKey: string) => {
    setIsImprovementPanelOpen(false);
    setActiveTab('assessment-results');
  }, []);

  // Handler to navigate to the Improvement Plan tab
  const handleNavigateToFullPlan = useCallback(() => {
    setIsImprovementPanelOpen(false);
    setActiveTab('improvement-plan');
  }, []);

  // Handler to open the wizard
  const handleOpenPlanWizard = useCallback(() => {
    // Use full-page navigation if provided, otherwise fall back to modal
    if (onOpenImprovementPlanWizard) {
      onOpenImprovementPlanWizard();
    } else {
      setIsWizardOpen(true);
    }
  }, [onOpenImprovementPlanWizard]);

  // Handler to save the plan from the wizard (creates new plan)
  const handleSavePlan = useCallback((newPlan: ImprovementPlan) => {
    addPlan(newPlan);
    setIsWizardOpen(false);
  }, [addPlan]);

  // State for rerun loading animation
  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunProgress, setRerunProgress] = useState(0);
  const [rerunStep, setRerunStep] = useState('');


  // Handler for rerun with loading animation
  const handleRerunWithAnimation = () => {
    if (!onRerun || isRerunning) return;

    setIsRerunning(true);
    setRerunProgress(0);
    setRerunStep('Connecting to Jira...');

    // Simulate multi-step processing
    const steps = [
      { progress: 15, step: 'Fetching project data...', delay: 400 },
      { progress: 30, step: 'Analyzing issue types...', delay: 500 },
      { progress: 45, step: 'Calculating sprint metrics...', delay: 600 },
      { progress: 60, step: 'Evaluating team health indicators...', delay: 500 },
      { progress: 75, step: 'Comparing with similar teams...', delay: 400 },
      { progress: 90, step: 'Generating recommendations...', delay: 300 },
      { progress: 100, step: 'Finalizing assessment...', delay: 200 },
    ];

    let currentDelay = 300;
    steps.forEach(({ progress, step, delay }) => {
      setTimeout(() => {
        setRerunProgress(progress);
        setRerunStep(step);
      }, currentDelay);
      currentDelay += delay;
    });

    // Complete after all steps
    setTimeout(() => {
      onRerun();
      setIsRerunning(false);
      setRerunProgress(0);
      setRerunStep('');
    }, currentDelay + 200);
  };


  // Auto-switch to improvement-plan tab when a new plan is created
  useEffect(() => {
    if (newlyCreatedPlanIdFromApp || newlyCreatedPlanId) {
      setActiveTab('improvement-plan');
    }
  }, [newlyCreatedPlanIdFromApp, newlyCreatedPlanId]);

  // Calculate executive summary data for improvement plan tab
  const summaryData = useMemo(
    () => calculateExecutiveSummary(assessmentResult),
    [assessmentResult]
  );

  // Inject CSS keyframes for spin animation
  useEffect(() => {
    const styleId = 'rerun-spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .comp-summary-row:hover {
          background-color: #F8F9FA !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={styles.container}>
      {/* Rerun Loading Overlay */}
      {isRerunning && (
        <div style={styles.rerunOverlay}>
          <div style={styles.rerunModal}>
            <div style={styles.rerunSpinner}>
              <RefreshIcon label="" size="xlarge" primaryColor="#0052CC" />
            </div>
            <h3 style={styles.rerunTitle}>Refreshing Assessment</h3>
            <p style={styles.rerunStep}>{rerunStep}</p>
            <div style={styles.rerunProgressBar}>
              <div
                style={{
                  ...styles.rerunProgressFill,
                  width: `${rerunProgress}%`,
                }}
              />
            </div>
            <span style={styles.rerunProgressText}>{rerunProgress}%</span>
          </div>
        </div>
      )}

      {/* Header - Compact single row */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Left side: back button + title */}
          <div style={styles.headerLeft}>
            <button
              style={styles.iconButton}
              onClick={onBackToHome || onBackToSetup}
              title={onBackToTeamOfTeams ? 'Back to Team of Teams' : onBackToHome ? 'Back to Home' : 'Back to Setup'}
            >
              <ArrowLeftIcon label="Back" primaryColor="white" size="medium" />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' as const }}>
              {onBackToTeamOfTeams && (
                <button
                  onClick={onBackToTeamOfTeams}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left' as const,
                    marginBottom: '2px',
                  }}
                >
                  ← Back to Team of Teams
                </button>
              )}
              <h1 style={styles.title}>
                Data Trust Assessment
                {assessmentResult.teamName && (
                  <span style={styles.teamNameInline}> — {assessmentResult.teamName}</span>
                )}
              </h1>
            </div>
          </div>

          {/* Right side: metadata + action buttons */}
          <div style={styles.headerRight}>
            <div style={styles.metadataInline}>
              <div style={styles.metadataItem}>
                <span style={styles.metadataLabel}>Analysis Period</span>
                <span style={styles.metadataValue}>
                  {formatDate(assessmentResult.dateRange.startDate)} - {formatDate(assessmentResult.dateRange.endDate)}
                </span>
              </div>
              <div style={styles.metadataItem}>
                <span style={styles.metadataLabel}>Data Grouping</span>
                <span style={styles.metadataValue}>
                  {assessmentResult.dataGrouping.charAt(0).toUpperCase() + assessmentResult.dataGrouping.slice(1)}
                </span>
              </div>
            </div>

            <div style={styles.headerActions}>
              {onRerun && (
                <button
                  style={{
                    ...styles.iconButton,
                    ...(isRerunning ? styles.iconButtonSpinning : {}),
                  }}
                  onClick={handleRerunWithAnimation}
                  title="Rerun Assessment"
                  disabled={isRerunning}
                >
                  <RefreshIcon label="Rerun" primaryColor="white" size="medium" />
                </button>
              )}
              {canEdit && (
                <button
                  style={styles.iconButton}
                  onClick={onBackToSetup}
                  title="Edit Settings"
                >
                  <SettingsIcon label="Settings" primaryColor="white" size="medium" />
                </button>
              )}
              {canShare && onShare && (
                <button
                  style={styles.iconButton}
                  onClick={onShare}
                  title="Share Assessment"
                >
                  <ShareIcon label="Share" primaryColor="white" size="medium" />
                </button>
              )}
              <PersonaSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Comparison Group Modal */}
          <ComparisonGroupModal
            isOpen={isComparisonModalOpen}
            onClose={() => setIsComparisonModalOpen(false)}
            teams={assessmentResult.comparisonTeams}
            criteria={assessmentResult.comparisonCriteria}
            teamCount={assessmentResult.comparisonTeamCount}
            yourRank={comparisonModalContext.yourRank}
            dimensionName={comparisonModalContext.dimensionName}
          />

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
              ASSESSMENT RESULTS TAB - Four-Lens Data Trust View
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'assessment-results' && assessmentResult.lensResults && (() => {
            const intScore = mockIntegrityDimensionResult.healthScore;
            // Compute data for component summary table
            const scores = computeLensScores(assessmentResult.lensResults, intScore);
            const TICKET_READINESS_INDEX = 1;
            const coverageDim = assessmentResult.dimensions[TICKET_READINESS_INDEX];
            const integrityDim = mockIntegrityDimensionResult;
            const behavioralDim = mockDimension6Result;

            const sevFromRate = (rate: number) => rate >= 0.80 ? 'Critical' : rate >= 0.50 ? 'At Risk' : rate >= 0.30 ? 'Fair' : 'Healthy';
            const sevFromScore = (sc: number) => sc >= 70 ? 'Healthy' : sc >= 50 ? 'Fair' : sc >= 30 ? 'At Risk' : 'Critical';
            const vtScore = (val: number, bench: number, hib: boolean) => {
              if (hib) return bench <= 0 ? (val > 0 ? 100 : 0) : Math.max(0, Math.min(100, Math.round((val / bench) * 100)));
              return bench <= 0 ? (val > 0 ? 0 : 100) : Math.max(0, Math.min(100, Math.round(100 - ((val / bench) - 1) * 50)));
            };
            const fieldDisplayNames: Record<string, string> = {
              acceptanceCriteria: 'Acceptance Criteria', assignee: 'Assignee', dueDate: 'Due Date',
              estimates: 'Estimates', linksToIssues: 'Related Issues', parentEpic: 'Parent Epic',
              prioritySet: 'Priority', subTasks: 'Sub-tasks',
            };
            const getFieldName = (fid: string) => fieldDisplayNames[fid] || fid.charAt(0).toUpperCase() + fid.slice(1);

            // Coverage stats
            const coverageIndicators = coverageDim.categories.flatMap(c => c.indicators);
            const covSev: Record<string, number> = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
            let covImp = 0, covStab = 0, covDec = 0;
            let covWorstName = '', covWorstRate = 0;
            for (const ind of coverageIndicators) {
              const rate = ind.value / 100;
              covSev[sevFromRate(rate)]++;
              if (rate > covWorstRate) {
                covWorstRate = rate;
                covWorstName = ind.name.replace(/^What %.*?\?\s*/i, '').replace(/^How.*?\?\s*/i, '') || ind.name;
              }
              if (ind.trendData && ind.trendData.length >= 2) {
                const d = ind.trendData[ind.trendData.length - 1].value - ind.trendData[0].value;
                if (d > 2) covImp++; else if (d < -2) covDec++; else covStab++;
              } else covStab++;
            }
            const covAvg = coverageIndicators.length > 0 ? coverageIndicators.reduce((s, i) => s + i.value, 0) / coverageIndicators.length / 100 : 0;

            // Integrity stats
            const intSev: Record<string, number> = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
            let intImp = 0, intStab = 0, intDec = 0, intFieldCount = 0, intChecks = 0, intFailed = 0;
            let intWorstFid = '', intWorstFRate = 0;
            const intFieldMap = new Map<string, { failed: number; passed: number; indicators: any[] }>();
            for (const cat of integrityDim.categories) {
              if (cat.id === 'crossField') continue;
              for (const ind of cat.indicators) {
                const fid = (ind as any).jiraFieldId || '__unknown__';
                if (!intFieldMap.has(fid)) intFieldMap.set(fid, { failed: 0, passed: 0, indicators: [] });
                const e = intFieldMap.get(fid)!;
                e.failed++; e.indicators.push(ind);
              }
              if ((cat as any).passedChecks) {
                for (const pc of (cat as any).passedChecks) {
                  const fid = pc.jiraFieldId || '__unknown__';
                  if (!intFieldMap.has(fid)) intFieldMap.set(fid, { failed: 0, passed: 0, indicators: [] });
                  intFieldMap.get(fid)!.passed++;
                }
              }
            }
            intFieldMap.forEach((data, fid) => {
              intFieldCount++;
              const tot = data.failed + data.passed;
              intChecks += tot; intFailed += data.failed;
              const fr = tot > 0 ? data.failed / tot : 0;
              intSev[sevFromRate(fr)]++;
              if (fr > intWorstFRate) { intWorstFRate = fr; intWorstFid = fid; }
              let up = 0, dn = 0;
              for (const ind of data.indicators) {
                if (ind.trendData && ind.trendData.length >= 2) {
                  const d = ind.trendData[ind.trendData.length - 1].value - ind.trendData[0].value;
                  if (d > 2) up++; else if (d < -2) dn++;
                }
              }
              if (up > dn) intImp++; else if (dn > up) intDec++; else intStab++;
            });
            const intPassRate = intChecks > 0 ? Math.round((1 - intFailed / intChecks) * 100) : 100;

            // Freshness stats
            const freshSev: Record<string, number> = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
            let freshImp = 0, freshStab = 0, freshDec = 0;
            const FRESH_TYPES = ['Story', 'Bug', 'Task', 'Epic', 'Risk', 'Assumption', 'Feature', 'Spike', 'Dependency', 'Impediment', 'Initiative'];
            let freshWorstName = '', freshWorstScore = 101;
            for (let i = 0; i < FRESH_TYPES.length && i < staleFreshFindings.length; i++) {
              const stale = staleFreshFindings[i];
              const sc = vtScore(stale.value, stale.benchmarkValue, stale.higherIsBetter);
              freshSev[sevFromScore(sc)]++;
              if (sc < freshWorstScore) { freshWorstScore = sc; freshWorstName = FRESH_TYPES[i]; }
              if (stale.trendData && stale.trendData.length >= 2) {
                const rawD = stale.trendData[stale.trendData.length - 1].value - stale.trendData[0].value;
                const rawT = rawD > 2 ? 'up' : rawD < -2 ? 'down' : 'stable';
                const ht = rawT === 'stable' ? 'stable' : stale.higherIsBetter ? (rawT === 'up' ? 'improving' : 'declining') : (rawT === 'up' ? 'declining' : 'improving');
                if (ht === 'improving') freshImp++; else if (ht === 'declining') freshDec++; else freshStab++;
              } else freshStab++;
            }
            const freshHealth = behavioralDim.healthScore ?? Math.round(behavioralDim.overallPercentile);

            const componentRows = [
              {
                key: 'coverage' as LensType, label: 'Timeliness', score: scores.coverage, weight: '30%',
                dimension: coverageDim, icon: LENS_CONFIG.coverage.icon,
                sevCounts: covSev, improving: covImp, stable: covStab, declining: covDec,
                detail: `${coverageIndicators.length} fields`, primaryMetric: `${Math.round((1 - covAvg) * 100)}% complete`,
                worst: covWorstRate > 0.3 ? `${covWorstName} (${Math.round(covWorstRate * 100)}% incomplete)` : null,
              },
              {
                key: 'integrity' as LensType, label: 'Trustworthiness', score: scores.integrity, weight: '30%',
                dimension: integrityDim, icon: LENS_CONFIG.integrity.icon,
                sevCounts: intSev, improving: intImp, stable: intStab, declining: intDec,
                detail: `${intChecks} checks`, primaryMetric: `${intPassRate}% pass`,
                worst: intWorstFRate > 0.3 ? `${getFieldName(intWorstFid)} (${Math.round(intWorstFRate * 100)}% fail)` : null,
              },
              {
                key: 'behavioral' as LensType, label: 'Freshness', score: scores.behavioral, weight: '20%',
                dimension: behavioralDim, icon: LENS_CONFIG.behavioral.icon,
                sevCounts: freshSev, improving: freshImp, stable: freshStab, declining: freshDec,
                detail: `${FRESH_TYPES.length} issue types`, primaryMetric: `${freshHealth}/100`,
                worst: freshWorstScore < 50 ? `${freshWorstName} (score ${freshWorstScore})` : null,
              },
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                <DataTrustBanner
                  lensResults={assessmentResult.lensResults}
                  integrityScore={intScore}
                  comparisonTeams={assessmentResult.comparisonTeams}
                  comparisonTeamCount={assessmentResult.comparisonTeamCount}
                  comparisonCriteria={assessmentResult.comparisonCriteria}
                  onLensClick={(lens) => onLensClick?.(lens)}
                />

                {/* ── Component Summary Table ──────────────────────────── */}
                <div style={compTableStyles.container}>
                  <div style={compTableStyles.headerRow}>
                    <span style={compTableStyles.headerLabel}>COMPONENT OVERVIEW</span>
                    <span style={compTableStyles.headerSub}>Click a component to explore detailed analysis</span>
                  </div>
                  {componentRows.map((comp, idx) => {
                    const trust = getTrustLevel(comp.score);
                    return (
                      <button
                        key={comp.key}
                        className="comp-summary-row"
                        onClick={() => onLensClick?.(comp.key)}
                        style={{
                          ...compTableStyles.row,
                          borderTop: idx > 0 ? '1px solid #F4F5F7' : 'none',
                        }}
                      >
                        {/* Score Donut + Name */}
                        <div style={compTableStyles.scoreCol}>
                          {(() => {
                            const r = 24;
                            const circ = 2 * Math.PI * r;
                            const filled = (comp.score / 100) * circ;
                            return (
                              <div style={compTableStyles.donutWrap}>
                                <svg width={58} height={58} viewBox="0 0 58 58" style={{ transform: 'rotate(-90deg)' }}>
                                  <defs>
                                    <filter id={`glow-comp-${comp.key}`} x="-30%" y="-30%" width="160%" height="160%">
                                      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                                      <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                      </feMerge>
                                    </filter>
                                  </defs>
                                  <circle cx={29} cy={29} r={r - 4} fill={`${trust.level.color}08`} />
                                  <circle cx={29} cy={29} r={r} fill="none" stroke={`${trust.level.color}15`} strokeWidth={5} />
                                  <circle
                                    cx={29} cy={29} r={r}
                                    fill="none"
                                    stroke={trust.level.color}
                                    strokeWidth={5}
                                    strokeDasharray={`${filled} ${circ}`}
                                    strokeLinecap="round"
                                    filter={`url(#glow-comp-${comp.key})`}
                                  />
                                </svg>
                                <div style={compTableStyles.donutLabel}>
                                  <span style={{ fontSize: '18px', fontWeight: 800, color: trust.level.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{comp.score}</span>
                                </div>
                              </div>
                            );
                          })()}
                          <div style={compTableStyles.nameBlock}>
                            <div style={compTableStyles.compNameRow}>
                              <span style={compTableStyles.compName}>{comp.label}</span>
                              <span style={compTableStyles.weightPill}>{comp.weight}</span>
                              <span style={compTableStyles.detailPill}>{comp.detail}</span>
                            </div>
                            <div style={compTableStyles.compDesc}>{LENS_CONFIG[comp.key].description}</div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={compTableStyles.colDivider} />

                        {/* Severity Distribution */}
                        <div style={compTableStyles.sevCol}>
                          <div style={compTableStyles.colLabel}>SEVERITY</div>
                          <div style={compTableStyles.sevBar}>
                            {comp.sevCounts.Critical > 0 && <div style={{ flex: comp.sevCounts.Critical, backgroundColor: '#DE350B' }} />}
                            {comp.sevCounts['At Risk'] > 0 && <div style={{ flex: comp.sevCounts['At Risk'], backgroundColor: '#FF8B00' }} />}
                            {comp.sevCounts.Fair > 0 && <div style={{ flex: comp.sevCounts.Fair, backgroundColor: '#FFAB00' }} />}
                            {comp.sevCounts.Healthy > 0 && <div style={{ flex: comp.sevCounts.Healthy, backgroundColor: '#36B37E' }} />}
                          </div>
                          <div style={compTableStyles.sevLegend}>
                            {comp.sevCounts.Critical > 0 && <span style={compTableStyles.sevItem}><span style={{ ...compTableStyles.sevDot, backgroundColor: '#DE350B' }} />{comp.sevCounts.Critical} Crit</span>}
                            {comp.sevCounts['At Risk'] > 0 && <span style={compTableStyles.sevItem}><span style={{ ...compTableStyles.sevDot, backgroundColor: '#FF8B00' }} />{comp.sevCounts['At Risk']} At Risk</span>}
                            {comp.sevCounts.Fair > 0 && <span style={compTableStyles.sevItem}><span style={{ ...compTableStyles.sevDot, backgroundColor: '#FFAB00' }} />{comp.sevCounts.Fair} Fair</span>}
                            {comp.sevCounts.Healthy > 0 && <span style={compTableStyles.sevItem}><span style={{ ...compTableStyles.sevDot, backgroundColor: '#36B37E' }} />{comp.sevCounts.Healthy} OK</span>}
                          </div>
                          {comp.worst && (
                            <div style={compTableStyles.worstCallout}>Worst: {comp.worst}</div>
                          )}
                        </div>

                        {/* Divider */}
                        <div style={compTableStyles.colDivider} />

                        {/* Trend */}
                        <div style={compTableStyles.trendCol}>
                          <div style={compTableStyles.colLabel}>TREND</div>
                          <div style={compTableStyles.sparklineWrap}>
                            <Sparkline data={comp.dimension.trendData} trend={comp.dimension.trend} width={110} height={28} />
                          </div>
                          <div style={compTableStyles.trendCounts}>
                            <span style={{ color: '#36B37E', fontWeight: 600, fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>
                              {comp.improving}
                            </span>
                            <span style={{ color: '#6B778C', fontWeight: 600, fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>
                              {comp.stable}
                            </span>
                            <span style={{ color: '#DE350B', fontWeight: 600, fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>
                              {comp.declining}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div style={compTableStyles.arrowCol}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B3BAC5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9,18 15,12 9,6" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════════════════
              IMPROVEMENT PLAN TAB
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'improvement-plan' && (
            <ImprovementPlanTab
              assessmentResult={assessmentResult}
              outcomeConfidence={summaryData.outcomeConfidence}
              plans={activePlans}
              selectedPlan={selectedPlan}
              onSelectPlan={selectPlan}
              onPlanUpdate={updatePlan}
              onArchivePlan={archivePlan}
              onDeletePlan={deletePlan}
              onCreatePlan={handleOpenPlanWizard}
              onNavigateToDimension={() => {
                setActiveTab('assessment-results');
              }}
              onOpenPlanDetail={onOpenPlanDetail}
              newlyCreatedPlanId={newlyCreatedPlanIdFromApp || newlyCreatedPlanId}
              onClearNewlyCreatedPlan={() => {
                if (onClearNewlyCreatedPlanFromApp) onClearNewlyCreatedPlanFromApp();
                clearNewlyCreatedPlan();
              }}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              REPORTS TAB
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'reports' && (
            <AssessmentReportsTab
              assessmentResult={assessmentResult}
              onNavigateToDimension={() => {
                setActiveTab('assessment-results');
              }}
            />
          )}

          {/* Footer Note */}
          <div style={styles.footerNote}>
            <p style={styles.footerText}>
              This assessment was generated on {formatDate(assessmentResult.generatedAt)}.
              The indicators and scores are based on mock data for demonstration purposes.
            </p>
          </div>
        </div>
      </main>

      {/* Improvement Focus FAB and Panel */}
      <ImprovementFocusFAB
        plan={selectedPlan}
        onClick={() => setIsImprovementPanelOpen(true)}
      />
      <ImprovementFocusPanel
        isOpen={isImprovementPanelOpen}
        onClose={() => setIsImprovementPanelOpen(false)}
        plan={selectedPlan}
        onPlayStatusChange={handlePlayStatusChange}
        onAddTask={handleAddTask}
        onTaskStatusChange={handleTaskStatusChange}
        onDeleteTask={handleDeleteTask}
        onNavigateToFullPlan={handleNavigateToFullPlan}
        onNavigateToDimension={handleNavigateToDimension}
        onCreatePlan={handleOpenPlanWizard}
      />

      {/* Improvement Plan Wizard - only render modal when full-page navigation not available */}
      {!onOpenImprovementPlanWizard && (
        <ImprovementPlanWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          assessmentResult={assessmentResult}
          onPlanCreated={handleSavePlan}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8F9',
  },
  header: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '16px 24px',
    color: 'white',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconButtonSpinning: {
    animation: 'spin 1s linear infinite',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  // Rerun loading overlay styles
  rerunOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  rerunModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '40px 48px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    minWidth: '320px',
  },
  rerunSpinner: {
    marginBottom: '20px',
    animation: 'spin 1.5s linear infinite',
    display: 'inline-block',
  },
  rerunTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  rerunStep: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#6B778C',
    minHeight: '20px',
  },
  rerunProgressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#DFE1E6',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  rerunProgressFill: {
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  rerunProgressText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: 'white',
  },
  teamNameInline: {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metadataInline: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metadataLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metadataValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  main: {
    padding: '32px 24px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  // Top-level tabs
  topTabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
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
  } as React.CSSProperties,
  topTabButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
  },
  fullWidthContent: {
    width: '100%',
  },
  comparisonInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  comparisonLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  comparisonValue: {
    fontSize: '14px',
    color: '#172B4D',
  },
  // Dashboard styles
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  themeSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dimensionContentSection: {
    marginBottom: '32px',
  },
  overview: {
    marginBottom: '24px',
  },
  overviewTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  overviewDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  dimensionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dimensionSection: {
    marginBottom: '32px',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px',
  },
  dimensionNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 700,
    flexShrink: 0,
  },
  dimensionHeaderText: {
    flex: 1,
  },
  dimensionTitle: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionQuestion: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
  // Hero Banner — dark premium design
  dimensionBlueBanner: {
    background: '#FFFFFF',
    padding: '36px 48px 40px',
    borderRadius: '16px',
    marginBottom: '24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    border: '1px solid #E2E8F0',
  },
  heroBgPattern: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.03,
    backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    pointerEvents: 'none' as const,
  },
  heroAmbientGlow: {
    position: 'absolute' as const,
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '160%',
    pointerEvents: 'none' as const,
    opacity: 0.5,
  },
  heroCenterFlow: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  heroSubtitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  heroScoreBlock: {
    display: 'flex',
    alignItems: 'baseline',
  },
  heroSparklineWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    opacity: 0.8,
  } as React.CSSProperties,
  scoreHistoryOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  scoreHistoryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '640px',
    width: '90%',
    overflow: 'hidden',
  },
  scoreHistoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
  },
  scoreHistoryTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  scoreHistoryClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6B778C',
    outline: 'none',
  },
  scoreHistoryBody: {
    padding: '24px',
  },
  heroStatusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    marginTop: '12px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'filter 0.15s ease',
  } as React.CSSProperties,
  heroStatusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  heroStatusTier: {
    fontSize: '13px',
    fontWeight: 700,
  },
  heroStatusDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.15)',
  },
  heroStatusTrend: {
    fontSize: '13px',
    fontWeight: 600,
  },
  heroDescription: {
    margin: '16px 0 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '440px',
  },
  // Hero stats panels — indicator health + trends
  heroStatsRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #EBECF0',
    width: '100%',
  },
  heroPanel: {
    padding: '14px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    border: '1px solid #EBECF0',
  },
  heroPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  heroPanelLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.8px',
  },
  heroPanelCount: {
    fontSize: '11px',
    color: '#97A0AF',
  },
  heroStackedBar: {
    display: 'flex',
    height: '26px',
    borderRadius: '6px',
    overflow: 'hidden' as const,
    gap: '2px',
  },
  heroLegendRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
    flexWrap: 'wrap' as const,
  },
  heroLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#6B778C',
  },
  heroLegendDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  heroTrendStats: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  heroTrendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  heroTrendArrow: {
    fontSize: '14px',
    fontWeight: 700,
    width: '16px',
    textAlign: 'center' as const,
  },
  heroTrendCount: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
    minWidth: '20px',
  },
  heroTrendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  // Page Type Label — breadcrumb style
  pageTypeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '20px',
  },
  pageTypeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  pageTypeLabelText: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
  },
  pageTypeSep: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.2)',
    margin: '0 2px',
  },
  pageTypeDimName: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.65)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
  },
  heroInfoInline: {
    display: 'inline',
  },
  blueBannerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  blueBannerQuestion: {
    margin: '0 0 14px 0',
    fontSize: '34px',
    fontWeight: 700,
    color: '#F1F5F9',
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
  },
  blueBannerDescription: {
    margin: 0,
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.58)',
    lineHeight: 1.6,
    maxWidth: '480px',
  },
  // Unified Metrics Card
  unifiedMetricsCard: {
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px 0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    gap: '0',
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
  },
  metricsSection: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '0 24px',
  },
  metricsDivider: {
    width: '1px',
    backgroundColor: '#E4E6EB',
    alignSelf: 'stretch',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  metricValue: {
    display: 'flex',
    alignItems: 'baseline',
  },
  // Precision Indicator Styles
  precisionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  precisionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  precisionLabel: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  precisionBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '3px',
  },
  precisionMargin: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  precisionInfoButton: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1px solid #6B778C',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: '9px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  ratingValue: {
    fontSize: '28px',
    fontWeight: 700,
    textTransform: 'capitalize',
    lineHeight: 1.2,
  },
  // Components Breakdown Styles
  componentsSectionWide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '280px',
  },
  componentsBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  componentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  componentInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    minWidth: '110px',
  },
  componentName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  componentWeight: {
    fontSize: '10px',
    color: '#6B778C',
  },
  componentScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  componentScore: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
    minWidth: '24px',
    textAlign: 'right' as const,
  },
  componentTrendIndicator: {
    fontSize: '14px',
    fontWeight: 700,
  },
  componentBarContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  componentBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  // Influences Section (in blue banner)
  influencesSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  influencesLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  influencesChips: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  influenceChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    fontFamily: 'inherit',
  },
  influenceChipIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  influenceChipText: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
  },

  // Influences Section (outside hero - for consistent hero height)
  influencesSectionOutside: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  influencesLabelOutside: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  influencesChipsOutside: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  influenceChipOutside: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '16px',
    border: '1px solid #DFE1E6',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    fontFamily: 'inherit',
  },
  influenceChipIconOutside: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  influenceChipTextOutside: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
  },

  // Tooltip styles
  tooltip: {
    position: 'fixed' as const,
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    pointerEvents: 'none' as const,
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: '2px',
  },
  tooltipValue: {
    color: '#B3BAC5',
  },
  tooltipArrow: {
    position: 'absolute' as const,
    left: '50%',
    bottom: '-6px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },
  // Inline spectrum styles (compact peer comparison inside hero)
  inlineSpectrumContainer: {
    marginTop: '24px',
    padding: '16px 24px',
    backgroundColor: 'rgba(9, 30, 66, 0.03)',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '480px',
  } as React.CSSProperties,
  inlineSpectrumHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  } as React.CSSProperties,
  inlineSpectrumTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,
  inlineSpectrumLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  inlineSpectrumBar: {
    position: 'relative' as const,
    height: '24px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  inlineSpectrumTrack: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(to right, #DE350B 0%, #DE350B 30%, #FF8B00 30%, #FF8B00 45%, #2684FF 45%, #2684FF 55%, #00875A 55%, #00875A 70%, #006644 70%, #006644 100%)',
    opacity: 0.45,
  } as React.CSSProperties,
  inlineSpectrumMin: {
    position: 'absolute' as const,
    left: '-16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  } as React.CSSProperties,
  inlineSpectrumMax: {
    position: 'absolute' as const,
    right: '-22px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  } as React.CSSProperties,
  inlinePeerRangeBand: {
    position: 'absolute' as const,
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'rgba(9, 30, 66, 0.10)',
    transform: 'translateY(0)',
    cursor: 'pointer',
    zIndex: 1,
    transition: 'background-color 0.15s ease',
  } as React.CSSProperties,
  inlinePeerMedianTick: {
    position: 'absolute' as const,
    width: '2px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.25)',
    borderRadius: '1px',
    transform: 'translateX(-50%)',
    zIndex: 2,
    pointerEvents: 'none' as const,
  } as React.CSSProperties,
  inlineYourTeamMarker: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2.5px solid white',
    zIndex: 3,
    cursor: 'pointer',
  } as React.CSSProperties,
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Stats Section Styles
  statsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    padding: '24px',
    marginBottom: '24px',
  },
  statsSectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statsSummaryBar: {
    display: 'flex',
    alignItems: 'stretch',
    padding: '16px 20px',
    backgroundColor: '#F7F8F9',
    borderRadius: '10px',
    gap: '20px',
  },
  statsPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
  },
  statsPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  statsPanelLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statsPanelValue: {
    fontSize: '11px',
    color: '#6B778C',
  },
  statsDivider: {
    width: '1px',
    backgroundColor: '#DFE1E6',
    alignSelf: 'stretch',
  },
  stackedBar: {
    display: 'flex',
    height: '28px',
    borderRadius: '5px',
    overflow: 'hidden',
    gap: '2px',
  },
  barSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
  },
  segmentCount: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
  legendText: {
    fontSize: '10px',
    color: '#6B778C',
  },
  trendStats: {
    display: 'flex',
    gap: '16px',
  },
  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  trendIcon: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
  },
  trendCount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },
  trendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  indicatorStatsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  attentionCount: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
  },
  attentionLabel: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  indicatorTrends: {
    display: 'flex',
    gap: '10px',
  },
  miniTrend: {
    fontSize: '12px',
    fontWeight: 600,
  },

  // Info Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  infoModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  infoModalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
  },
  infoModalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  infoModalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#6B778C',
  },
  infoModalContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoModalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoModalIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    marginBottom: '4px',
  },
  infoModalSectionTitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoModalText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },

  // Dimension Hero Styles (kept for backward compatibility but no longer used in main flow)
  dimensionHero: {
    marginBottom: '24px',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  // Hero big score — giant centered number
  heroBigNumber: {
    fontSize: '96px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-4px',
  },
  heroBigDenom: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#97A0AF',
    marginLeft: '4px',
    alignSelf: 'baseline',
  },
  heroScore: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  // Score ring — large with glow
  scoreRing: {
    position: 'relative' as const,
    width: '168px',
    height: '168px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  scoreArc: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
  } as React.CSSProperties,
  scoreNumber: {
    position: 'relative' as const,
    fontSize: '48px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-2px',
    color: '#F8FAFC',
    fontFeatureSettings: "'tnum'" as any,
    zIndex: 1,
  },

  // Category pill — ghost style with stronger fill
  heroCategoryPill: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.4px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  // Trend — colored and readable
  heroTrend: {
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.2px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as React.CSSProperties,
  heroTrendIcon: {
    fontSize: '15px',
  },

  // Key Signals section (relocated from hero)
  keySignalsSection: {
    marginBottom: '24px',
  },
  keySignalsSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  keySignalsRow: {
    display: 'flex',
    gap: '16px',
  },
  keySignalCard: {
    flex: 1,
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  keySignalName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    lineHeight: 1.3,
  },
  keySignalValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  keySignalValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  keySignalBenchmark: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#8993A4',
  },
  // Breakdown tooltip on hover
  breakdownTooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '16px',
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '18px',
    minWidth: '290px',
    zIndex: 100,
    backdropFilter: 'blur(12px)',
  },
  breakdownTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    fontSize: '13px',
  },
  breakdownDot: {
    width: '8px',
    height: '8px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  breakdownLabel: {
    flex: 1,
    color: '#CBD5E1',
  },
  breakdownCalc: {
    color: '#64748B',
    fontSize: '12px',
  },
  breakdownValue: {
    fontWeight: 600,
    color: '#F1F5F9',
    minWidth: '36px',
    textAlign: 'right' as const,
  },
  breakdownTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    marginTop: '4px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#F1F5F9',
  },

  // Legacy stubs (no longer used in hero)
  verticalDivider: {
    display: 'none',
  },
  heroStatsSection: {
    display: 'none',
  } as React.CSSProperties,
  // Legacy signal styles (kept for backward compat)
  signalName: { fontSize: '13px', fontWeight: 500, color: '#6B778C' },
  signalValueRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  signalValue: { fontSize: '24px', fontWeight: 700, color: '#172B4D' },
  signalTrend: { fontSize: '12px', fontWeight: 600 },
  signalBenchmark: { fontSize: '12px', fontWeight: 600 },
  signalNoData: { fontSize: '13px', color: '#B3BAC5', fontStyle: 'italic' },

  // Formula styles for modal
  formulaSection: {
    marginBottom: '20px',
  },
  formulaSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  formulaBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  formulaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  formulaNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  formulaLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  formulaWeight: {
    fontSize: '11px',
    color: '#0052CC',
    fontWeight: 600,
  },
  formulaOperator: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#6B778C',
  },

  // Legacy styles kept for backward compatibility
  scoreMain: {
    marginBottom: '8px',
  },
  scoreValue: {
    fontSize: '64px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  confidenceBand: {
    width: '100%',
    maxWidth: '180px',
  },
  confidenceTrack: {
    position: 'relative',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  confidenceZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.6,
  },
  confidenceRange: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    backgroundColor: 'rgba(23, 43, 77, 0.25)',
    borderRadius: '4px',
    border: '1px solid rgba(23, 43, 77, 0.3)',
  },
  scoreMarker: {
    position: 'absolute',
    top: '-2px',
    bottom: '-2px',
    width: '4px',
    backgroundColor: '#172B4D',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  confidenceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  confidenceLabelLeft: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  confidenceLabelCenter: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  confidenceLabelRight: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  componentsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 28px',
  },
  componentsSectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  componentCards: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  componentCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    backgroundColor: '#FAFBFC',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
  },
  componentGaugeWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  componentGaugeValue: {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
  },
  componentCardName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center',
    marginBottom: '2px',
  },
  componentCardWeight: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  componentCardUnavailable: {
    backgroundColor: '#F4F5F7',
    borderStyle: 'dashed',
    borderColor: '#DFE1E6',
  },

  // Limited Data Badge (when TRS/PGS unavailable)
  limitedDataBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#DEEBFF',
    borderRadius: '12px',
    border: '1px solid #B3D4FF',
    marginBottom: '12px',
  },
  limitedDataIcon: {
    fontSize: '12px',
    color: '#0052CC',
  },
  limitedDataText: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#0052CC',
  },

  // Component Explainer in Modal
  componentExplainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
    marginBottom: '16px',
  },
  componentExplainerTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  componentExplainerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  componentExplainerItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  componentDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  heroCardBlue: {
    backgroundColor: '#F4F8FF',
    borderColor: '#B3D4FF',
  },
  heroCardOrange: {
    backgroundColor: '#FFFBF5',
    borderColor: '#FFE0B2',
  },
  heroCardGreen: {
    backgroundColor: '#F1FBF6',
    borderColor: '#ABF5D1',
  },
  heroIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    marginBottom: '4px',
  },
  heroIconBlue: {
    backgroundColor: '#DEEBFF',
  },
  heroIconOrange: {
    backgroundColor: '#FFF3E0',
  },
  heroIconGreen: {
    backgroundColor: '#E3FCEF',
  },
  heroCardTitle: {
    margin: 0,
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  heroCardText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
  footerNote: {
    marginTop: '32px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Info Modal Content Styles
  infoModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  infoSection: {
    padding: '16px 0',
    borderBottom: '1px solid #EBECF0',
  },
  infoSectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.7,
  },
  infoList: {
    margin: 0,
    paddingLeft: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  // Calculation Modal Content Styles
  calculationModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  calculationIntro: {
    margin: 0,
    fontSize: '15px',
    color: '#42526E',
    lineHeight: 1.7,
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '4px solid #0052CC',
  },
  categoriesSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E4E6EB',
  },
  categoriesSectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'white',
    borderRadius: '6px',
    border: '1px solid #E4E6EB',
  },
  categoryName: {
    fontSize: '13px',
    color: '#172B4D',
    fontWeight: 500,
  },
  categoryCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  stepsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  step: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDescription: {
    margin: 0,
    paddingLeft: '36px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  additionalInfo: {
    margin: 0,
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0052CC',
    lineHeight: 1.5,
  },

  // Scale reference for Health Score Categories
  scaleReference: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
    marginTop: '16px',
  },
  scaleReferenceTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center' as const,
  },
  scaleReferenceBar: {
    display: 'flex',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  scaleRefSegment: {
    flex: 1,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
  },

  // Health Categories list (inside info modal)
  healthCategoriesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
    marginTop: '12px',
  } as React.CSSProperties,
  healthCategoryRow: {
    padding: '10px 0',
    borderBottom: '1px solid #F4F5F7',
  } as React.CSSProperties,
  healthCategoryHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  } as React.CSSProperties,
  healthCategoryName: {
    fontSize: '14px',
    fontWeight: 700,
  } as React.CSSProperties,
  healthCategoryRange: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#8993A4',
  } as React.CSSProperties,
  healthCategoryDesc: {
    margin: 0,
    fontSize: '13px',
    lineHeight: 1.55,
    color: '#42526E',
  } as React.CSSProperties,

  // CHS Formula Styles
  chsFormulaSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  chsFormulaTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsFormulaDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  chsFormulaComponent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    minWidth: '70px',
  },
  chsComponentLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsComponentScore: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  chsComponentWeight: {
    fontSize: '10px',
    color: '#6B778C',
  },
  chsFormulaOperator: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#6B778C',
  },
  chsFormulaResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 18px',
    backgroundColor: '#0052CC',
    borderRadius: '8px',
    minWidth: '70px',
  },
  chsResultScore: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  chsNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    border: '1px solid #FFE380',
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
    marginBottom: '12px',
  },
  chsNoteIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  chsConfidenceRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
    marginTop: '8px',
  },
  chsConfidenceLabel: {
    color: '#6B778C',
  },
  chsConfidenceValue: {
    fontWeight: 600,
    color: '#172B4D',
  },
  chsLegendSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E4E6EB',
    marginBottom: '16px',
  },
  chsLegendTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsLegendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chsLegendItem: {
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  categoriesSubtitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
};

/* ── Component Summary Table Styles ────────────────────────────────── */
const compTableStyles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.06)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #F4F5F7',
    backgroundColor: '#FAFBFC',
  },
  headerLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#7A869A',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  headerSub: {
    fontSize: '11px',
    color: '#97A0AF',
    fontWeight: 400,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 20px',
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    transition: 'background-color 0.1s ease',
    gap: '0',
  },
  scoreCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: '280px',
    flex: '0 0 280px',
  },
  donutWrap: {
    position: 'relative' as const,
    width: '58px',
    height: '58px',
    flexShrink: 0,
  },
  donutLabel: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
    minWidth: 0,
  },
  compNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  compName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
  },
  weightPill: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '1px 7px',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
  },
  detailPill: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '1px 7px',
    borderRadius: '8px',
    whiteSpace: 'nowrap' as const,
  },
  compDesc: {
    fontSize: '11.5px',
    lineHeight: 1.45,
    color: '#626F86',
    fontWeight: 400,
  },
  colDivider: {
    width: '1px',
    alignSelf: 'stretch',
    backgroundColor: '#F4F5F7',
    margin: '0 16px',
    flexShrink: 0,
  },
  sevCol: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    minWidth: 0,
  },
  colLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#97A0AF',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
  },
  sevBar: {
    display: 'flex',
    height: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  sevLegend: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  sevItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#505F79',
  },
  sevDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  worstCallout: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#6B778C',
    fontStyle: 'italic' as const,
  },
  trendCol: {
    flex: '0 0 140px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    alignItems: 'flex-start',
  },
  sparklineWrap: {
    overflow: 'hidden',
    width: '100%',
  },
  trendCounts: {
    display: 'flex',
    gap: '8px',
  },
  arrowCol: {
    flex: '0 0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '8px',
  },
};

export default AssessmentResultsLayout;
