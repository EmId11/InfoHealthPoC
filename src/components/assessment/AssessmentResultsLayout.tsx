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
import Dimension2Results from './dimension2/Dimension2Results';
import TrendChart from './common/TrendChart';
import { getDimensionQuestion } from './common/ThemeSection';
import ComparisonExplainer from './common/ComparisonExplainer';
import ComparisonGroupModal from './common/ComparisonGroupModal';
import { ImprovementPlanTab } from './ExecutiveSummary/ImprovementPlanTab';
import { AssessmentReportsTab } from './ExecutiveSummary/ReportsTab';
import { ImprovementFocusFAB, ImprovementFocusPanel } from './ImprovementFocus';
import { getIndicatorTier, INDICATOR_TIERS } from '../../types/indicatorTiers';
import { CHS_CATEGORIES, getCHSCategoryConfig } from '../../constants/chsCategories';
import HeroInfoButton from '../common/HeroInfoButton';
import CalculationButton from '../common/CalculationButton';
import { DIMENSION_EXPLANATION } from '../../constants/pageExplanations';
import { calculateExecutiveSummary } from '../../utils/executiveSummaryUtils';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import ShareIcon from '@atlaskit/icon/glyph/share';
import { PersonaSwitcher } from '../persona';
import { getDimensionDescription } from '../../constants/clusterDescriptions';
import { getOutcomesForDimension } from '../../constants/outcomeDefinitions';
import { getDimensionIcon, getOutcomeIcon } from '../../constants/dimensionIcons';

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
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
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

  // Information Health is always dimension index 1
  const INFORMATION_HEALTH_INDEX = 1;

  // State for comparison group modal
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonModalContext, setComparisonModalContext] = useState<{
    yourRank?: number;
    dimensionName?: string;
  }>({});

  // Tooltip state for spectrum
  const [showScoreHistory, setShowScoreHistory] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  });

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

  // State for hero score breakdown hover
  const [showBreakdown, setShowBreakdown] = useState(false);


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

  // Open comparison modal with dimension context
  const openComparisonModal = (dimensionIndex?: number) => {
    if (dimensionIndex !== undefined && assessmentResult.dimensions[dimensionIndex]) {
      const dimension = assessmentResult.dimensions[dimensionIndex];
      // Calculate rank from health score
      const score = dimension.healthScore ?? dimension.overallPercentile;
      const teamsAhead = Math.round((1 - score / 100) * assessmentResult.comparisonTeamCount);
      const yourRank = teamsAhead + 1;
      setComparisonModalContext({
        yourRank,
        dimensionName: dimension.dimensionName,
      });
    } else {
      setComparisonModalContext({});
    }
    setIsComparisonModalOpen(true);
  };


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
              title={onBackToHome ? 'Back to Home' : 'Back to Setup'}
            >
              <ArrowLeftIcon label="Back" primaryColor="white" size="medium" />
            </button>
            <h1 style={styles.title}>
              Jira Health Assessment
              {assessmentResult.teamName && (
                <span style={styles.teamNameInline}> — {assessmentResult.teamName}</span>
              )}
            </h1>
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
              ASSESSMENT RESULTS TAB - Information Health Dimension Detail
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'assessment-results' && assessmentResult.dimensions[INFORMATION_HEALTH_INDEX] && (() => {
                const dimension = assessmentResult.dimensions[INFORMATION_HEALTH_INDEX];
                const dimDesc = getDimensionDescription(dimension.dimensionKey);
                const tier = getIndicatorTier(dimension.healthScore ?? dimension.overallPercentile);

                // Generate mock comparison team positions for spectrum
                const seed = dimension.dimensionKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const comparisonTeamPositions: number[] = [];
                for (let i = 0; i < assessmentResult.comparisonTeamCount; i++) {
                  const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
                  const normalized = (pseudoRandom - Math.floor(pseudoRandom));
                  comparisonTeamPositions.push(Math.max(5, Math.min(95, normalized * 100)));
                }
                // Map score directly to position (score 50 = 50% position)
                const yourPosition = dimension.healthScore ?? dimension.overallPercentile;

                // Calculate indicator stats
                const allIndicators = dimension.categories.flatMap(cat => cat.indicators);
                const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                let improved = 0, declined = 0, stable = 0, needingAttention = 0;

                allIndicators.forEach(ind => {
                  const indTier = getIndicatorTier(ind.benchmarkPercentile);
                  tierCounts[indTier.level]++;
                  if (indTier.level <= 2) needingAttention++;
                  if (ind.trend === 'improving') improved++;
                  else if (ind.trend === 'declining') declined++;
                  else stable++;
                });

                const tierSegments = INDICATOR_TIERS
                  .map(t => ({ tier: t, count: tierCounts[t.level] }))
                  .filter(s => s.count > 0);

                const attentionPct = allIndicators.length > 0
                  ? Math.round((needingAttention / allIndicators.length) * 100)
                  : 0;

                // Extract "Key info added after commitment" from current dimension's readiness category
                const readinessCat = dimension.categories.find(c => c.id === 'readiness');
                const infoAfterCommitment = readinessCat?.indicators.find(i => i.id === 'infoAddedAfterCommitment');

                // Extract "Stale In-Progress Work Items" from Data Freshness dimension
                const dataFreshnessDim = assessmentResult.dimensions.find(d => d.dimensionKey === 'dataFreshness');
                const staleItemsCat = dataFreshnessDim?.categories.find(c => c.id === 'dataFreshness');
                const staleWorkItems = staleItemsCat?.indicators.find(i => i.id === 'staleWorkItems');

                return (
                  <>
                    {/* Comparison Explainer - consistent across pages */}
                    <ComparisonExplainer
                      teamCount={assessmentResult.comparisonTeamCount}
                      teams={assessmentResult.comparisonTeams}
                      criteria={assessmentResult.comparisonCriteria}
                      onViewTeams={() => openComparisonModal(INFORMATION_HEALTH_INDEX)}
                    />

                    <div style={{...styles.dimensionBlueBanner, background: tier.bgColor, borderColor: tier.borderColor}}>
                      {/* Centered single-column flow */}
                      <div style={styles.heroCenterFlow}>
                        {/* Title row with info button */}
                        <div style={styles.heroTitleRow}>
                          <span style={styles.heroSubtitle}>{dimension.dimensionName} Score</span>
                          <span style={styles.heroInfoInline}>
                            <HeroInfoButton title={`About ${dimension.dimensionName}`}>
                              <div style={styles.infoModalBody}>
                                <div style={styles.infoSection}>
                                  <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                                  <p style={styles.infoText}>
                                    {dimDesc?.whatWeMeasure || DIMENSION_EXPLANATION.whatThisShows}
                                  </p>
                                </div>
                                <div style={styles.infoSection}>
                                  <h4 style={styles.infoSectionTitle}>Why It Matters</h4>
                                  <p style={styles.infoText}>
                                    {dimDesc?.whyItMatters || 'This dimension affects your overall Jira health and the reliability of your data for planning and decision-making.'}
                                  </p>
                                </div>
                                <div style={styles.infoSection}>
                                  <h4 style={styles.infoSectionTitle}>What You Can Do</h4>
                                  <p style={styles.infoText}>
                                    {dimDesc?.whatYouCanDo || 'Review the indicators below to identify specific areas for improvement.'}
                                  </p>
                                </div>
                                <div style={styles.infoSection}>
                                  <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                                  <ul style={styles.infoList}>
                                    <li><strong>Score:</strong> {DIMENSION_EXPLANATION.keyMetrics.score}</li>
                                    <li><strong>Rating:</strong> {DIMENSION_EXPLANATION.keyMetrics.rating}</li>
                                    <li><strong>Trend:</strong> {DIMENSION_EXPLANATION.keyMetrics.trend}</li>
                                  </ul>
                                </div>
                                <div style={styles.infoSection}>
                                  <h4 style={styles.infoSectionTitle}>Health Categories</h4>
                                  <p style={styles.infoText}>
                                    Your score maps to one of five health categories.
                                  </p>
                                  <div style={styles.healthCategoriesList}>
                                    {[...INDICATOR_TIERS].reverse().map(t => (
                                      <div key={t.level} style={styles.healthCategoryRow}>
                                        <div style={styles.healthCategoryHeader}>
                                          <span style={{...styles.healthCategoryName, color: t.color}}>{t.name}</span>
                                          <span style={styles.healthCategoryRange}>{t.minPercentile}–{t.maxPercentile}</span>
                                        </div>
                                        <p style={styles.healthCategoryDesc}>{t.detailedDescription}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </HeroInfoButton>
                          </span>
                        </div>

                        {/* Giant score */}
                        {(() => {
                          let overallTrend: 'up' | 'down' | 'stable' = 'stable';
                          if (dimension.trendData && dimension.trendData.length >= 2) {
                            const firstHealthScore = dimension.trendData[0].healthScore ?? dimension.trendData[0].value;
                            const lastHealthScore = dimension.trendData[dimension.trendData.length - 1].healthScore ?? dimension.healthScore;
                            const firstTier = getIndicatorTier(firstHealthScore).level;
                            const lastTier = getIndicatorTier(lastHealthScore).level;
                            if (lastTier > firstTier) overallTrend = 'up';
                            else if (lastTier < firstTier) overallTrend = 'down';
                          }
                          const healthScore = dimension.healthScore ?? Math.round(dimension.overallPercentile);
                          const trendIcon = overallTrend === 'up' ? '↗' : overallTrend === 'down' ? '↘' : '→';
                          const trendLabel = overallTrend === 'up' ? 'Improving' : overallTrend === 'down' ? 'Declining' : 'Stable';
                          const trendColor = overallTrend === 'up' ? '#36B37E' : overallTrend === 'down' ? '#DE350B' : '#6B778C';

                          const sparkTrend = overallTrend === 'up' ? 'improving' as const : overallTrend === 'down' ? 'declining' as const : 'stable' as const;

                          return (
                            <>
                              <div style={styles.heroScoreBlock}>
                                <span style={{...styles.heroBigNumber, color: tier.color}}>{healthScore}</span>
                                <span style={styles.heroBigDenom}>/100</span>
                              </div>

                              {/* Category + trend as unified status chip */}
                              <div style={styles.heroMetaRow}>
                                <span style={{
                                  ...styles.heroStatusChip,
                                  backgroundColor: `${tier.color}18`,
                                  border: `1.5px solid ${tier.color}40`,
                                }}>
                                  <span style={{...styles.heroStatusDot, backgroundColor: tier.color}} />
                                  <span style={{...styles.heroStatusTier, color: tier.color}}>{tier.name}</span>
                                  <span style={styles.heroStatusDivider} />
                                  <span style={{...styles.heroStatusTrend, color: trendColor}}>
                                    {trendIcon} {trendLabel}
                                  </span>
                                </span>
                                {dimension.trendData && dimension.trendData.length >= 2 && (
                                  <button
                                    onClick={() => setShowScoreHistory(true)}
                                    style={styles.heroHistoryBtn}
                                    title="View score history"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                      <polyline points="1,11 3.5,7 6,8.5 8.5,3.5 11,6 13,2" stroke="#6B778C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </button>
                                )}
                              </div>

                              {/* Score history modal */}
                              {showScoreHistory && dimension.trendData && dimension.trendData.length >= 2 && (
                                <div style={styles.scoreHistoryOverlay} onClick={() => setShowScoreHistory(false)}>
                                  <div style={styles.scoreHistoryModal} onClick={(e) => e.stopPropagation()}>
                                    <div style={styles.scoreHistoryHeader}>
                                      <h3 style={styles.scoreHistoryTitle}>Score History</h3>
                                      <button onClick={() => setShowScoreHistory(false)} style={styles.scoreHistoryClose}>✕</button>
                                    </div>
                                    <div style={styles.scoreHistoryBody}>
                                      <TrendChart
                                        data={dimension.trendData}
                                        height={280}
                                        dimensionName="Information Health"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Description */}
                        <p style={styles.heroDescription}>
                          {dimDesc?.summary || `Analysis of ${dimension.dimensionName} across your team's Jira data.`}
                        </p>

                      </div>
                    </div>

                    {/* How You Compare Section */}
                    <section style={styles.spectrumSection}>
                      <h2 style={styles.spectrumSectionTitle}>How You Compare</h2>

                      {/* Tooltip */}
                      {tooltip.visible && (
                        <div style={{
                          ...styles.tooltip,
                          left: tooltip.x,
                          top: tooltip.y - 8,
                        }}>
                          <div style={styles.tooltipLabel}>{tooltip.label}</div>
                          <div style={styles.tooltipValue}>{tooltip.value}</div>
                          <div style={styles.tooltipArrow} />
                        </div>
                      )}

                      <div style={styles.spectrumLayout}>
                        {/* Left endpoint */}
                        <div style={styles.endpointLeft}>
                          <span style={styles.endpointLabel}>← {dimension.spectrumLeftLabel || 'NEEDS WORK'}</span>
                          <p style={styles.endpointDescription}>
                            Below average performance. Opportunities for improvement identified.
                          </p>
                        </div>

                        {/* Center: Spectrum visualization */}
                        <div style={styles.spectrumCenter}>
                          {/* Comparison teams scattered above */}
                          <div style={styles.comparisonTeamsArea}>
                            {comparisonTeamPositions.map((pos, idx) => {
                              const verticalOffset = ((Math.sin(idx * 1234) + 1) / 2) * 18 + 4;
                              const dotCategory = getCHSCategoryConfig(Math.round(pos));
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    ...styles.comparisonDot,
                                    left: `${pos}%`,
                                    bottom: `${verticalOffset}px`,
                                    backgroundColor: dotCategory.color,
                                    opacity: 0.6,
                                    cursor: 'pointer',
                                  }}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const estimatedScore = Math.round(pos);
                                    setTooltip({
                                      visible: true,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top,
                                      label: `Team ${idx + 1}`,
                                      value: `Score: ${estimatedScore}`,
                                    });
                                  }}
                                  onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                                />
                              );
                            })}
                          </div>

                          {/* Baseline indicator - label above with info button, dotted line going down */}
                          <div style={styles.baselineContainer}>
                            <div style={styles.baselineLabelRow}>
                              <span style={styles.baselineLabel}>Baseline (50)</span>
                              <button
                                style={styles.baselineInfoButton}
                                title="50 represents the average across all similar teams. Scores above 50 indicate better-than-average Jira health, while scores below 50 indicate areas for improvement."
                              >
                                ?
                              </button>
                            </div>
                            <div style={styles.baselineDottedLine} />
                          </div>

                          {/* Spectrum bar with gradient */}
                          <div style={styles.spectrumBarContainer}>
                            {/* Score labels at ends */}
                            <span style={styles.spectrumScoreLeft}>0</span>
                            <span style={styles.spectrumScoreRight}>100</span>
                            <div style={styles.spectrumGradient} />
                            {/* Team position circle on the spectrum bar */}
                            <div
                              style={{
                                ...styles.teamPositionCircle,
                                left: `${yourPosition}%`,
                                backgroundColor: tier.color,
                                boxShadow: `0 0 0 4px ${tier.color}40`,
                              }}
                            />
                            {/* "You are here" indicator - positioned above the circle */}
                            <div
                              style={{ ...styles.youAreHereContainer, left: `${yourPosition}%`, cursor: 'pointer' }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({
                                  visible: true,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                  label: 'Your Team',
                                  value: `Score: ${dimension.healthScore ?? Math.round(dimension.overallPercentile)}`,
                                });
                              }}
                              onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
                            >
                              <span style={styles.youAreHereText}>YOU ARE HERE</span>
                              <div style={{ ...styles.youAreHereArrow, borderTopColor: tier.color }} />
                            </div>
                          </div>
                        </div>

                        {/* Right endpoint */}
                        <div style={styles.endpointRight}>
                          <span style={styles.endpointLabelGood}>{dimension.spectrumRightLabel || 'EXCELLENT'} →</span>
                          <p style={styles.endpointDescription}>
                            Above average performance. Strong practices in place.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Information Health Dimension Detail (Dimension2Results) */}
                    <div style={styles.dimensionContentSection}>
                      <Dimension2Results
                        dimension={assessmentResult.dimensions[INFORMATION_HEALTH_INDEX]}
                        reportOptions={wizardState.step6}
                        teamId={assessmentResult.teamId}
                        dateRange={assessmentResult.dateRange}
                        similarTeamsCount={assessmentResult.comparisonTeamCount}
                        onViewSimilarTeams={() => openComparisonModal(INFORMATION_HEALTH_INDEX)}
                        dimensionIndex={INFORMATION_HEALTH_INDEX}
                        onIndicatorDrillDown={onIndicatorDrillDown}
                      />
                    </div>
                  </>
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
  heroHistoryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    padding: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.06)',
    border: '1px solid rgba(9, 30, 66, 0.12)',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.15s ease',
  },
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
  heroMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '12px',
  },
  heroStatusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
  },
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

  // Spectrum Section Styles
  spectrumSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    padding: '24px',
    marginBottom: '24px',
  },
  spectrumHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  spectrumSectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
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
  spectrumLayout: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  endpointLeft: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  endpointRight: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'right',
  },
  endpointLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#CA3521',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  endpointLabelGood: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#216E4E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  endpointDescription: {
    margin: 0,
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  spectrumCenter: {
    flex: 1,
    position: 'relative',
    minHeight: '90px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  comparisonTeamsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35px',
  },
  comparisonDot: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
  },
  youAreHereContainer: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: '2px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 4,
  },
  youAreHereText: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    marginBottom: '3px',
  },
  youAreHereArrow: {
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '7px solid #5E6C84',
  },
  spectrumBarContainer: {
    position: 'relative',
    height: '24px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  spectrumScoreLeft: {
    position: 'absolute',
    left: '-20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  spectrumScoreRight: {
    position: 'absolute',
    right: '-28px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  spectrumGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '8px',
    borderRadius: '4px',
    // CHS 5-zone gradient: Needs Attention (0-30), Below Average (30-45), Average (45-55), Good (55-70), Excellent (70-100)
    background: 'linear-gradient(to right, #DE350B 0%, #DE350B 30%, #FF8B00 30%, #FF8B00 45%, #2684FF 45%, #2684FF 55%, #00875A 55%, #00875A 70%, #006644 70%, #006644 100%)',
    opacity: 0.5,
  },
  baselineContainer: {
    position: 'absolute',
    left: '50%',
    top: '-10px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
  },
  baselineLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '2px',
  },
  baselineLabel: {
    fontSize: '9px',
    color: '#6B778C',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '1px 6px',
    borderRadius: '2px',
  },
  baselineInfoButton: {
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
  },
  baselineDottedLine: {
    width: '1px',
    height: '65px',
    backgroundImage: 'repeating-linear-gradient(to bottom, #6B778C 0, #6B778C 3px, transparent 3px, transparent 6px)',
    opacity: 0.5,
  },
  teamPositionCircle: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '3px solid white',
    zIndex: 3,
  },
  tierMarker: {
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  teamCountLabel: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#97A0AF',
    textAlign: 'center',
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

export default AssessmentResultsLayout;
