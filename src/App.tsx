import React, { useState, useCallback, useMemo } from 'react';
import {
  WizardState,
  initialWizardState,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  getSelectedIssueTypes,
  MultiTeamWizardState,
  MultiTeamStep1Data,
  ScopeSelection,
  ConfigurationStrategy,
  initialMultiTeamStep1Data,
  initialScopeSelection,
  initialStep3Data,
  initialStep4Data,
  initialStep5Data,
  initialStep6Data,
} from './types/wizard';
import {
  MultiTeamAssessmentResult,
} from './types/multiTeamAssessment';
import { AssessmentResult, IndicatorDrillDownState } from './types/assessment';
import { OutcomeAreaId } from './types/outcomeConfidence';
import { PersonaType, AppView as PersonaAppView } from './types/persona';
import { SavedAssessment, ShareRecord, SavedMultiTeamAssessment, AnySavedAssessment, isMultiTeamAssessment } from './types/home';
import { AdminState, AdminSection, OrganizationDefaults, ManagedUser, UserGroup, TeamAttributeConfig, OrgStructureSettings, AccessRequest, GroupAccessRule, UserGroupAccessRule } from './types/admin';
import { SetupType, isAllSetupComplete } from './types/adminSetup';
import { SavedReport, generateShareToken } from './types/reports';
import { generateMockAssessmentResultWithDim3 } from './constants/mockAssessmentData';
import { generateMultiTeamAssessmentResult } from './utils/portfolioAggregation';
import { initializeMockHistory } from './utils/historicalDataStorage';
import {
  CURRENT_USER,
  MOCK_MY_ASSESSMENTS,
  MOCK_SHARED_WITH_ME,
  MOCK_MY_PORTFOLIO_ASSESSMENTS,
} from './constants/mockHomeData';
import { INITIAL_ADMIN_STATE } from './constants/mockAdminData';
import { PersonaProvider } from './components/persona';
import { TourProvider } from './components/onboarding/TourContext';
import PageGuidance from './components/onboarding/PageGuidance';
import WizardLayout from './components/WizardLayout';
import AssessmentResultsLayout from './components/assessment/AssessmentResultsLayout';
import EditableSettingsPage from './components/assessment/EditableSettingsPage';
import { CreatorHome, ViewerHome, ShareModal } from './components/home';
import { AdminHome } from './components/admin';
import Step0Welcome from './components/pages/Step0Welcome';
import Step1Basics from './components/pages/Step1Basics';
import Step2Comparison from './components/pages/Step2Comparison';
import Step4IssueTypes from './components/pages/Step4IssueTypes';
import Step6SprintCadence from './components/pages/Step6SprintCadence';
import Step8StaleThresholds from './components/pages/Step8StaleThresholds';
import Step6ReportOptions from './components/pages/Step6ReportOptions';
import Step7Review from './components/pages/Step7Review';
import { IndicatorDrillDownPage } from './components/assessment/drilldown';
import OutcomeDetailPage from './components/assessment/ExecutiveSummary/OutcomeDetailPage';
import ComparisonGroupModal from './components/assessment/common/ComparisonGroupModal';
import JiraStandardsWizard from './components/admin/wizards/JiraStandardsWizard';
import OrgHierarchyWizard from './components/admin/wizards/OrgHierarchyWizard';
import TeamAttributesWizard from './components/admin/wizards/TeamAttributesWizard';
import UnifiedSetupWizard from './components/admin/wizards/UnifiedSetupWizard';
import SetupRequiredScreen from './components/SetupRequiredScreen';
import SetupCompleteScreen from './components/SetupCompleteScreen';
import { Step1ScopeSelection, Step2TeamReview, Step3ConfigStrategy } from './components/pages/multiTeam';
import { PortfolioDashboard } from './components/assessment/portfolio';
import { ImprovementPlanWizardPage, PlanDetailPage } from './components/plans';
import { ImprovementPlan, PlayStatus } from './types/improvementPlan';
import { savePlanToStorage, loadPlanFromStorage, updatePlayStatus } from './utils/improvementPlanUtils';

type AppView =
  | 'creator-home'
  | 'viewer-home'
  | 'admin-home'
  | 'wizard'
  | 'multi-team-wizard'
  | 'assessment-results'
  | 'portfolio-results'
  | 'edit-settings'
  | 'indicator-drilldown'
  | 'outcome-detail'
  | 'admin-jira-standards-wizard'
  | 'admin-org-hierarchy-wizard'
  | 'admin-team-attributes-wizard'
  | 'setup-complete'
  | 'improvement-plan-wizard'
  | 'improvement-plan-detail';

// Get initial app view based on stored persona
const getInitialAppView = (): AppView => {
  try {
    const storedPersona = localStorage.getItem('invisible-work-persona');
    if (storedPersona === 'viewer') {
      return 'viewer-home';
    }
    if (storedPersona === 'admin') {
      return 'admin-home';
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'creator-home'; // Default for creator
};

// Initial multi-team wizard state
const initialMultiTeamWizardState: MultiTeamWizardState = {
  currentStep: 0,
  step1: initialMultiTeamStep1Data,
  excludedTeams: [],
  configurationStrategy: 'uniform',
  sharedSettings: {
    step3: initialStep3Data,
    step4: initialStep4Data,
    step5: initialStep5Data,
  },
  teamOverrides: [],
  step6: initialStep6Data,
};

// Step configuration for dynamic wizard steps
export interface WizardStepConfig {
  id: string;
  label: string;
  type: 'basics' | 'teamProfile' | 'issueTypes' | 'sprintCadence' | 'staleThresholds' | 'reportOptions' | 'review';
}

// Compute which wizard steps should be visible based on admin configuration
const getVisibleSteps = (defaults: OrganizationDefaults): WizardStepConfig[] => {
  const steps: WizardStepConfig[] = [
    { id: 'basics', label: 'Basics', type: 'basics' },
    { id: 'teamProfile', label: 'Team Profile', type: 'teamProfile' },
  ];

  // Only show Issue Types step if admin set it to 'team-decides'
  if (defaults.issueTypes.mode === 'team-decides') {
    steps.push({ id: 'issueTypes', label: 'Issue Types', type: 'issueTypes' });
  }

  // Only show Sprint Cadence step if admin set it to 'team-decides'
  if (defaults.sprintCadence.mode === 'team-decides') {
    steps.push({ id: 'sprintCadence', label: 'Sprint Cadence', type: 'sprintCadence' });
  }

  // Only show Stale Thresholds step if admin set it to 'team-decides'
  if (defaults.staleThresholds.mode === 'team-decides') {
    steps.push({ id: 'staleThresholds', label: 'Stale Thresholds', type: 'staleThresholds' });
  }

  // Always show Report Options and Review
  steps.push({ id: 'reportOptions', label: 'Report Options', type: 'reportOptions' });
  steps.push({ id: 'review', label: 'Review', type: 'review' });

  return steps;
};

const App: React.FC = () => {
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState);
  const [appView, setAppView] = useState<AppView>(getInitialAppView);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Multi-team state
  const [multiTeamWizardState, setMultiTeamWizardState] = useState<MultiTeamWizardState>(initialMultiTeamWizardState);
  const [multiTeamResult, setMultiTeamResult] = useState<MultiTeamAssessmentResult | null>(null);

  // Home page state
  const [myAssessments, setMyAssessments] = useState<SavedAssessment[]>(MOCK_MY_ASSESSMENTS);
  const [myMultiTeamAssessments, setMyMultiTeamAssessments] = useState<SavedMultiTeamAssessment[]>(MOCK_MY_PORTFOLIO_ASSESSMENTS);
  const [sharedWithMe] = useState<SavedAssessment[]>(MOCK_SHARED_WITH_ME);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [shareModalAssessment, setShareModalAssessment] = useState<SavedAssessment | null>(null);
  const [homeActiveTab, setHomeActiveTab] = useState<'my' | 'shared' | 'portfolio'>('my');

  // Drill-down state
  const [drillDownState, setDrillDownState] = useState<IndicatorDrillDownState | null>(null);

  // Outcome detail state
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<OutcomeAreaId | null>(null);

  // Improvement plan detail state
  const [currentViewingPlan, setCurrentViewingPlan] = useState<ImprovementPlan | null>(null);

  // Track newly created plan ID for auto-navigation after wizard
  const [newlyCreatedPlanId, setNewlyCreatedPlanId] = useState<string | null>(null);

  // Track if we came from an outcome page (for back navigation)
  const [returnToOutcomeId, setReturnToOutcomeId] = useState<OutcomeAreaId | null>(null);

  // Comparison modal state (for outcome detail page)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Admin state
  const [adminState, setAdminState] = useState<AdminState>(INITIAL_ADMIN_STATE);

  // Admin wizard state for tracking initial step when resuming
  const [adminWizardInitialStep, setAdminWizardInitialStep] = useState(0);

  // Compute visible wizard steps based on admin config
  const visibleSteps = useMemo(() => {
    return getVisibleSteps(adminState.organizationDefaults);
  }, [adminState.organizationDefaults]);

  // Access requests handler - create a new access request
  const handleRequestCreatorAccess = (reason: string) => {
    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: CURRENT_USER.id,
      requesterName: CURRENT_USER.displayName,
      requesterEmail: CURRENT_USER.email,
      currentRole: 'viewer',
      requestedRole: 'creator',
      reason,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setAdminState(prev => ({
      ...prev,
      accessRequests: [...prev.accessRequests, newRequest],
    }));
  };

  // Get pending access request for current user (for ViewerHome)
  const currentUserPendingRequest = adminState.accessRequests.find(
    req => req.requesterId === CURRENT_USER.id && req.status === 'pending'
  ) || null;

  // Access request approval/denial handlers (for Admin)
  const handleApproveAccessRequest = (requestId: string) => {
    setAdminState(prev => ({
      ...prev,
      accessRequests: prev.accessRequests.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'approved' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: CURRENT_USER.id,
            }
          : req
      ),
      // Update user role to creator
      users: prev.users.map(user => {
        const request = prev.accessRequests.find(r => r.id === requestId);
        if (request && user.id === request.requesterId) {
          return { ...user, role: 'creator' as const };
        }
        return user;
      }),
    }));
  };

  const handleDenyAccessRequest = (requestId: string, note?: string) => {
    setAdminState(prev => ({
      ...prev,
      accessRequests: prev.accessRequests.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'denied' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: CURRENT_USER.id,
              reviewerNote: note,
            }
          : req
      ),
    }));
  };

  // Report handlers
  const handleCreateReport = (report: SavedReport) => {
    setAdminState(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        myReports: [...prev.reports.myReports, report],
      },
    }));
  };

  const handleUpdateReport = (reportId: string, updates: Partial<SavedReport>) => {
    setAdminState(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        myReports: prev.reports.myReports.map(r =>
          r.id === reportId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        ),
      },
    }));
  };

  const handleDeleteReport = (reportId: string) => {
    setAdminState(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        myReports: prev.reports.myReports.filter(r => r.id !== reportId),
      },
    }));
  };

  const handleShareReport = (reportId: string): string => {
    const shareToken = generateShareToken();
    setAdminState(prev => ({
      ...prev,
      reports: {
        ...prev.reports,
        myReports: prev.reports.myReports.map(r =>
          r.id === reportId
            ? { ...r, shareToken, sharedAt: new Date().toISOString(), isPublicLink: true }
            : r
        ),
      },
    }));
    return shareToken;
  };

  // Handle persona switch - reset state and navigate to persona's home view
  const handlePersonaSwitch = useCallback((persona: PersonaType, homeView: PersonaAppView) => {
    // Reset all wizard and assessment state
    setWizardState(initialWizardState);
    setAssessmentResult(null);
    // Navigate to persona's home view
    setAppView(homeView as AppView);
  }, []);

  // Wizard navigation - dynamic steps (0 = welcome, 1+ = visible steps)
  // Total steps = welcome (0) + visible steps
  const totalWizardSteps = visibleSteps.length;

  const handleNext = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, totalWizardSteps),
    }));
  };

  const handleBack = () => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const handleStepChange = (step: number) => {
    setWizardState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  // Multi-team wizard navigation - 7 steps (0-6)
  const handleMultiTeamNext = () => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 6),
    }));
  };

  const handleMultiTeamBack = () => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const handleMultiTeamStepChange = (step: number) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  };

  // Multi-team step data update handlers
  const updateMultiTeamStep1Data = (data: Partial<MultiTeamStep1Data>) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateMultiTeamScope = (scope: Partial<ScopeSelection>) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        scope: { ...prev.step1.scope, ...scope },
      },
    }));
  };

  const updateConfigurationStrategy = (strategy: ConfigurationStrategy) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      configurationStrategy: strategy,
    }));
  };

  const updateMultiTeamSharedSettings = (settings: Partial<MultiTeamWizardState['sharedSettings']>) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      sharedSettings: { ...prev.sharedSettings, ...settings },
    }));
  };

  const updateMultiTeamStep6Data = (data: Partial<Step6Data>) => {
    setMultiTeamWizardState((prev) => ({
      ...prev,
      step6: { ...prev.step6, ...data },
    }));
  };

  // Step data update handlers
  const updateStep1Data = (data: Partial<Step1Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateStep2Data = (data: Partial<Step2Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step2: { ...prev.step2, ...data },
    }));
  };

  const updateStep3Data = (data: Partial<Step3Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
    }));
  };

  const updateStep4Data = (data: Partial<Step4Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step4: { ...prev.step4, ...data },
    }));
  };

  const updateStep5Data = (data: Partial<Step5Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step5: { ...prev.step5, ...data },
    }));
  };

  const updateStep6Data = (data: Partial<Step6Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step6: { ...prev.step6, ...data },
    }));
  };

  // Handle wizard completion
  const handleFinish = () => {
    const result = generateMockAssessmentResultWithDim3(wizardState);

    // Initialize mock historical data for TRS/PGS calculations
    initializeMockHistory(result.teamId, result.dimensions);

    setAssessmentResult(result);
    setAppView('assessment-results');
  };

  // Handle multi-team wizard completion
  const handleMultiTeamFinish = () => {
    // Generate results for each team then aggregate
    const teamResults = multiTeamWizardState.step1.scope.resolvedTeamIds.map((teamId, index) => {
      // Create a wizard state for this team
      const teamWizardState: WizardState = {
        ...wizardState,
        step1: {
          ...wizardState.step1,
          teamId,
          teamName: `Team ${index + 1}`,
        },
        step3: multiTeamWizardState.sharedSettings.step3,
        step4: multiTeamWizardState.sharedSettings.step4,
        step5: multiTeamWizardState.sharedSettings.step5,
      };
      return generateMockAssessmentResultWithDim3(teamWizardState);
    });

    const result = generateMultiTeamAssessmentResult(
      `portfolio-${Date.now()}`, // id
      multiTeamWizardState.step1.displayName || 'Portfolio Assessment', // name
      multiTeamWizardState.step1.scope, // scope
      teamResults, // teamResults
      {
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      }, // dateRange
      multiTeamWizardState.configurationStrategy, // configurationStrategy
      {
        step3: multiTeamWizardState.sharedSettings.step3,
        step4: multiTeamWizardState.sharedSettings.step4,
        step5: multiTeamWizardState.sharedSettings.step5,
        step6: multiTeamWizardState.step6,
      } // sharedSettings
    );
    setMultiTeamResult(result);
    setAppView('portfolio-results');
  };

  // Portfolio dashboard navigation handlers
  const handleTeamDrillDown = (teamId: string) => {
    // Find the team result and show individual assessment
    if (multiTeamResult) {
      const teamRollup = multiTeamResult.teamResults.find(t => t.teamId === teamId);
      if (teamRollup) {
        setAssessmentResult(teamRollup.assessmentResult);
        setAppView('assessment-results');
      }
    }
  };

  const handleDimensionDrillDown = (dimensionKey: string) => {
    // For now, just log - could navigate to dimension cross-team view
    console.log('Dimension drill-down:', dimensionKey);
  };

  const handleBackFromPortfolio = () => {
    // Go back to appropriate home based on current persona
    const storedPersona = localStorage.getItem('invisible-work-persona');
    if (storedPersona === 'admin') {
      setAppView('admin-home');
    } else {
      setAppView('creator-home');
    }
  };

  const handleBackToSetup = () => {
    setAppView('wizard');
  };

  const handleEditSettings = () => {
    setAppView('edit-settings');
  };

  const handleSaveSettings = (updatedState: WizardState) => {
    setWizardState(updatedState);
    // Re-generate assessment with new settings
    const result = generateMockAssessmentResultWithDim3(updatedState);
    setAssessmentResult(result);
    setAppView('assessment-results');
  };

  const handleCancelEditSettings = () => {
    setAppView('assessment-results');
  };

  // State to track which dimension to return to after drill-down
  const [returnToDimensionIndex, setReturnToDimensionIndex] = useState<number | null>(null);

  // Drill-down navigation handlers
  const handleIndicatorDrillDown = (state: IndicatorDrillDownState) => {
    setDrillDownState(state);
    setAppView('indicator-drilldown');
  };

  const handleBackFromDrillDown = () => {
    // Save the dimension index to return to before clearing drill-down state
    const dimensionToReturnTo = drillDownState?.dimensionIndex ?? null;
    setReturnToDimensionIndex(dimensionToReturnTo);
    setDrillDownState(null);
    setAppView('assessment-results');
  };

  // Outcome detail navigation handlers
  const handleOutcomeClick = (outcomeId: OutcomeAreaId) => {
    setSelectedOutcomeId(outcomeId);
    setAppView('outcome-detail');
  };

  const handleBackFromOutcomeDetail = () => {
    setSelectedOutcomeId(null);
    setReturnToDimensionIndex(null); // Reset so we go back to executive summary, not a dimension
    setReturnToOutcomeId(null); // Clear any outcome source tracking
    setAppView('assessment-results');
  };

  // Handler for navigating back to an outcome from dimension detail
  const handleBackToOutcome = (outcomeId: OutcomeAreaId) => {
    setReturnToDimensionIndex(null); // Clear dimension tracking
    setReturnToOutcomeId(null); // Clear outcome source tracking
    setSelectedOutcomeId(outcomeId); // Navigate back to the outcome
    setAppView('outcome-detail');
  };

  // Handler for rerunning assessment with current settings
  const handleRerunAssessment = () => {
    const result = generateMockAssessmentResultWithDim3(wizardState);
    setAssessmentResult(result);
  };

  // Improvement plan wizard handlers
  const handleOpenImprovementPlanWizard = () => {
    setAppView('improvement-plan-wizard');
  };

  const handleImprovementPlanCreated = (plan: ImprovementPlan) => {
    // Save the plan to localStorage
    savePlanToStorage(plan);
    // Track the newly created plan for auto-navigation
    setNewlyCreatedPlanId(plan.id);
    // Navigate back to assessment results (the ImprovementPlanTab will auto-navigate to the plan)
    setAppView('assessment-results');
  };

  const handleBackFromImprovementPlanWizard = () => {
    setAppView('assessment-results');
  };

  // Improvement plan detail handlers
  const handleOpenPlanDetail = (plan: ImprovementPlan) => {
    setCurrentViewingPlan(plan);
    setAppView('improvement-plan-detail');
  };

  const handleBackFromPlanDetail = () => {
    setCurrentViewingPlan(null);
    setAppView('assessment-results');
  };

  const handlePlanPlayStatusChange = (playId: string, status: PlayStatus) => {
    if (!currentViewingPlan) return;
    const updatedPlan = updatePlayStatus(currentViewingPlan, playId, status);
    savePlanToStorage(updatedPlan);
    setCurrentViewingPlan(updatedPlan);
  };

  const handleArchivePlan = () => {
    if (!currentViewingPlan) return;
    const updatedPlan: ImprovementPlan = {
      ...currentViewingPlan,
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };
    savePlanToStorage(updatedPlan);
    setCurrentViewingPlan(null);
    setAppView('assessment-results');
  };

  // Home page handlers
  const handleCreateAssessment = () => {
    // Reset wizard state for new assessment
    setWizardState(initialWizardState);
    setAssessmentResult(null);
    setCurrentAssessmentId(null);
    setAppView('wizard');
  };

  // Multi-team assessment handlers
  const handleCreateMultiTeamAssessment = () => {
    // Reset multi-team wizard state for new assessment
    setMultiTeamWizardState(initialMultiTeamWizardState);
    setMultiTeamResult(null);
    setCurrentAssessmentId(null);
    setAppView('multi-team-wizard');
  };

  const handleViewMultiTeamAssessment = (assessment: SavedMultiTeamAssessment) => {
    setCurrentAssessmentId(assessment.id);
    setMultiTeamWizardState(assessment.wizardStateSnapshot);
    if (assessment.result) {
      setMultiTeamResult(assessment.result);
      setAppView('portfolio-results');
    } else {
      setAppView('multi-team-wizard');
    }
  };

  const handleViewAssessment = (assessment: SavedAssessment) => {
    setCurrentAssessmentId(assessment.id);
    setWizardState(assessment.wizardStateSnapshot);

    if (assessment.result) {
      // Has existing results - show them
      setAssessmentResult(assessment.result as AssessmentResult);
      setAppView('assessment-results');
    } else if (assessment.status === 'completed') {
      // Completed but no cached result - generate mock results for demo
      const result = generateMockAssessmentResultWithDim3(assessment.wizardStateSnapshot);
      setAssessmentResult(result);
      setAppView('assessment-results');
    } else {
      // Draft - continue editing (only for owned assessments)
      setAppView('wizard');
    }
  };

  const handleEditAssessment = (assessment: SavedAssessment) => {
    setCurrentAssessmentId(assessment.id);
    setWizardState(assessment.wizardStateSnapshot);
    setAppView('wizard');
  };

  const handleShareAssessment = (assessment: SavedAssessment) => {
    setShareModalAssessment(assessment);
  };

  const handleDeleteAssessment = (assessment: SavedAssessment) => {
    if (window.confirm(`Are you sure you want to delete "${assessment.name}"? This cannot be undone.`)) {
      setMyAssessments(prev => prev.filter(a => a.id !== assessment.id));
    }
  };

  const handleDuplicateAssessment = (assessment: SavedAssessment) => {
    const now = new Date().toISOString();
    const duplicated: SavedAssessment = {
      ...assessment,
      id: `assessment-${Date.now()}`,
      name: `${assessment.name} (Copy)`,
      createdAt: now,
      lastRefreshed: now,
      status: 'draft',
      result: null,
      shares: [],
    };
    setMyAssessments(prev => [duplicated, ...prev]);
  };

  const handleRenameAssessment = (assessment: SavedAssessment) => {
    const newName = window.prompt('Enter a new name:', assessment.name);
    if (newName && newName.trim() && newName !== assessment.name) {
      setMyAssessments(prev =>
        prev.map(a => (a.id === assessment.id ? { ...a, name: newName.trim() } : a))
      );
    }
  };

  const handleCloseShareModal = () => {
    setShareModalAssessment(null);
  };

  const handleSaveShares = (assessmentId: string, shares: ShareRecord[]) => {
    setMyAssessments(prev =>
      prev.map(a => (a.id === assessmentId ? { ...a, shares } : a))
    );
  };

  // Admin handlers
  const handleUpdateAdminSection = (section: AdminSection) => {
    setAdminState(prev => ({ ...prev, currentSection: section }));
  };

  const handleUpdateDefaults = (defaults: Partial<OrganizationDefaults>) => {
    setAdminState(prev => ({
      ...prev,
      organizationDefaults: { ...prev.organizationDefaults, ...defaults },
    }));
  };

  const handleUpdateUsers = (users: ManagedUser[]) => {
    setAdminState(prev => ({ ...prev, users }));
  };

  const handleUpdateGroupAccessRules = (groupAccessRules: GroupAccessRule[]) => {
    setAdminState(prev => ({ ...prev, groupAccessRules }));
  };

  const handleUpdateGroups = (userGroups: UserGroup[]) => {
    setAdminState(prev => ({ ...prev, userGroups }));
  };

  const handleUpdateUserGroupAccessRules = (userGroupAccessRules: UserGroupAccessRule[]) => {
    setAdminState(prev => ({ ...prev, userGroupAccessRules }));
  };

  const handleUpdateAttributes = (config: TeamAttributeConfig) => {
    setAdminState(prev => ({ ...prev, teamAttributes: config }));
  };

  const handleUpdateOrgStructureSettings = (settings: OrgStructureSettings) => {
    setAdminState(prev => ({ ...prev, orgStructureSettings: settings }));
  };

  // Admin setup wizard handlers
  const handleStartAdminWizard = (setupType: SetupType) => {
    const progress = adminState.setupProgress[setupType];
    const initialStep = progress.status === 'in-progress' ? progress.currentStep : 0;
    setAdminWizardInitialStep(initialStep);

    switch (setupType) {
      case 'jiraStandards':
        setAppView('admin-jira-standards-wizard');
        break;
      case 'orgHierarchy':
        setAppView('admin-org-hierarchy-wizard');
        break;
      case 'teamAttributes':
        setAppView('admin-team-attributes-wizard');
        break;
    }
  };

  const handleJiraStandardsSaveExit = (defaults: OrganizationDefaults, currentStep: number) => {
    setAdminState(prev => ({
      ...prev,
      organizationDefaults: defaults,
      setupProgress: {
        ...prev.setupProgress,
        jiraStandards: {
          ...prev.setupProgress.jiraStandards,
          status: 'in-progress',
          currentStep,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleJiraStandardsFinish = (defaults: OrganizationDefaults) => {
    setAdminState(prev => ({
      ...prev,
      organizationDefaults: defaults,
      setupProgress: {
        ...prev.setupProgress,
        jiraStandards: {
          ...prev.setupProgress.jiraStandards,
          status: 'completed',
          currentStep: prev.setupProgress.jiraStandards.totalSteps - 1,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleOrgHierarchySaveExit = (
    categorization: TeamAttributeConfig,
    settings: OrgStructureSettings,
    currentStep: number
  ) => {
    setAdminState(prev => ({
      ...prev,
      teamAttributes: categorization,
      orgStructureSettings: settings,
      setupProgress: {
        ...prev.setupProgress,
        orgHierarchy: {
          ...prev.setupProgress.orgHierarchy,
          status: 'in-progress',
          currentStep,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleOrgHierarchyFinish = (categorization: TeamAttributeConfig, settings: OrgStructureSettings) => {
    setAdminState(prev => ({
      ...prev,
      teamAttributes: categorization,
      orgStructureSettings: settings,
      setupProgress: {
        ...prev.setupProgress,
        orgHierarchy: {
          ...prev.setupProgress.orgHierarchy,
          status: 'completed',
          currentStep: prev.setupProgress.orgHierarchy.totalSteps - 1,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleTeamAttributesSaveExit = (categorization: TeamAttributeConfig, currentStep: number) => {
    setAdminState(prev => ({
      ...prev,
      teamAttributes: categorization,
      setupProgress: {
        ...prev.setupProgress,
        teamAttributes: {
          ...prev.setupProgress.teamAttributes,
          status: 'in-progress',
          currentStep,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleTeamAttributesFinish = (categorization: TeamAttributeConfig) => {
    setAdminState(prev => ({
      ...prev,
      teamAttributes: categorization,
      setupProgress: {
        ...prev.setupProgress,
        teamAttributes: {
          ...prev.setupProgress.teamAttributes,
          status: 'completed',
          currentStep: prev.setupProgress.teamAttributes.totalSteps - 1,
        },
      },
    }));
    setAppView('admin-home');
  };

  const handleBackFromAdminWizard = () => {
    setAppView('admin-home');
  };

  // Unified setup wizard completion handler
  const handleUnifiedSetupComplete = (
    categorization: TeamAttributeConfig,
    settings: OrgStructureSettings,
    defaults: OrganizationDefaults
  ) => {
    setAdminState(prev => ({
      ...prev,
      teamAttributes: categorization,
      orgStructureSettings: settings,
      organizationDefaults: defaults,
      setupProgress: {
        orgHierarchy: {
          ...prev.setupProgress.orgHierarchy,
          status: 'completed',
          currentStep: prev.setupProgress.orgHierarchy.totalSteps - 1,
        },
        jiraStandards: {
          ...prev.setupProgress.jiraStandards,
          status: 'completed',
          currentStep: prev.setupProgress.jiraStandards.totalSteps - 1,
        },
        teamAttributes: {
          ...prev.setupProgress.teamAttributes,
          status: 'completed',
          currentStep: prev.setupProgress.teamAttributes.totalSteps - 1,
        },
      },
    }));
    setAppView('setup-complete');
  };

  // Handlers for setup complete screen
  const handleInviteTeamFromSuccess = () => {
    setAdminState(prev => ({ ...prev, currentSection: 'users' }));
    setAppView('admin-home');
  };

  const handleGoToDashboardFromSuccess = () => {
    setAdminState(prev => ({ ...prev, currentSection: 'overview' }));
    setAppView('admin-home');
  };

  const handleNavigateToCreator = () => {
    setAppView('creator-home');
  };

  const handleBackToHome = () => {
    // Reset current assessment context
    setCurrentAssessmentId(null);
    // Go back to appropriate home based on current persona
    const storedPersona = localStorage.getItem('invisible-work-persona');
    if (storedPersona === 'viewer') {
      setAppView('viewer-home');
    } else if (storedPersona === 'admin') {
      setAppView('admin-home');
    } else {
      setAppView('creator-home');
    }
  };

  const handleSaveDraft = () => {
    // Only save if we have a team selected (minimum required data)
    if (!wizardState.step1.teamId) {
      alert('Please select a team before saving.');
      return;
    }

    const assessmentName = wizardState.step1.assessmentName ||
      `${wizardState.step1.teamName} - Draft`;

    if (currentAssessmentId) {
      // Update existing draft
      setMyAssessments(prev =>
        prev.map(a =>
          a.id === currentAssessmentId
            ? {
                ...a,
                name: assessmentName,
                wizardStateSnapshot: wizardState,
              }
            : a
        )
      );
    } else {
      // Create new draft
      const now = new Date().toISOString();
      const newDraft: SavedAssessment = {
        id: `assessment-${Date.now()}`,
        name: assessmentName,
        teamId: wizardState.step1.teamId,
        teamName: wizardState.step1.teamName,
        createdAt: now,
        lastRefreshed: now,
        createdByUserId: CURRENT_USER.id,
        createdByUserName: CURRENT_USER.displayName,
        dateRange: wizardState.step1.customDateRange,
        status: 'draft',
        result: null,
        wizardStateSnapshot: wizardState,
        shares: [],
        teamSettingsVersionId: '',
      };
      setMyAssessments(prev => [newDraft, ...prev]);
      setCurrentAssessmentId(newDraft.id);
    }

    // Navigate back to home
    setAppView('creator-home');
  };

  // Get selected issue types for stale thresholds step
  const selectedIssueTypes = getSelectedIssueTypes(wizardState.step3);

  const renderCurrentStep = () => {
    // Step 0 is always the welcome screen
    if (wizardState.currentStep === 0) {
      return <Step0Welcome onGetStarted={handleNext} />;
    }

    // Get the step config for current step (step 1+ maps to visibleSteps[step-1])
    const stepIndex = wizardState.currentStep - 1;
    if (stepIndex < 0 || stepIndex >= visibleSteps.length) {
      return null;
    }

    const currentStepConfig = visibleSteps[stepIndex];

    // Render based on step type
    switch (currentStepConfig.type) {
      case 'basics':
        return <Step1Basics data={wizardState.step1} onUpdate={updateStep1Data} />;
      case 'teamProfile':
        return (
          <Step2Comparison
            data={wizardState.step2}
            onUpdate={updateStep2Data}
            teamCategorization={adminState.teamAttributes}
            currentTeamId={wizardState.step1.teamId}
            orgStructureSettings={adminState.orgStructureSettings}
            organizationDefaults={adminState.organizationDefaults}
          />
        );
      case 'issueTypes':
        return (
          <Step4IssueTypes
            data={wizardState.step3}
            onUpdate={updateStep3Data}
          />
        );
      case 'sprintCadence':
        return <Step6SprintCadence data={wizardState.step4} onUpdate={updateStep4Data} />;
      case 'staleThresholds':
        return (
          <Step8StaleThresholds
            data={{ staleThresholds: wizardState.step5.staleThresholds }}
            selectedIssueTypes={selectedIssueTypes}
            onUpdate={(data) => updateStep5Data({ staleThresholds: data.staleThresholds })}
          />
        );
      case 'reportOptions':
        return <Step6ReportOptions data={wizardState.step6} onUpdate={updateStep6Data} />;
      case 'review':
        return (
          <Step7Review
            wizardState={wizardState}
            organizationDefaults={adminState.organizationDefaults}
          />
        );
      default:
        return null;
    }
  };


  // Render content based on current view
  const renderAppContent = () => {
    // Check if setup is complete
    const setupComplete = isAllSetupComplete(adminState.setupProgress);
    const storedPersona = localStorage.getItem('invisible-work-persona') as PersonaType | null;

    // Hard block: non-admin users cannot access app if setup incomplete
    if (!setupComplete && storedPersona !== 'admin') {
      return (
        <SetupRequiredScreen
          onAdminLogin={() => {
            localStorage.setItem('invisible-work-persona', 'admin');
            setAppView('admin-home'); // Trigger re-render
          }}
          onSkipSetup={() => {
            // Mark all setup as complete and go to admin home
            localStorage.setItem('invisible-work-persona', 'admin');
            setAdminState(prev => ({
              ...prev,
              setupProgress: {
                orgHierarchy: {
                  ...prev.setupProgress.orgHierarchy,
                  status: 'completed',
                  currentStep: prev.setupProgress.orgHierarchy.totalSteps - 1,
                },
                jiraStandards: {
                  ...prev.setupProgress.jiraStandards,
                  status: 'completed',
                  currentStep: prev.setupProgress.jiraStandards.totalSteps - 1,
                },
                teamAttributes: {
                  ...prev.setupProgress.teamAttributes,
                  status: 'completed',
                  currentStep: prev.setupProgress.teamAttributes.totalSteps - 1,
                },
              },
            }));
            setAppView('admin-home');
          }}
        />
      );
    }

    // Force admin into unified setup wizard when setup incomplete
    if (!setupComplete && storedPersona === 'admin') {
      return (
        <UnifiedSetupWizard
          initialCategorization={adminState.teamAttributes}
          initialSettings={adminState.orgStructureSettings}
          initialDefaults={adminState.organizationDefaults}
          onComplete={handleUnifiedSetupComplete}
          onSkipSetup={() => {
            // Mark all setup as complete and go to admin home
            setAdminState(prev => ({
              ...prev,
              setupProgress: {
                orgHierarchy: {
                  ...prev.setupProgress.orgHierarchy,
                  status: 'completed',
                  currentStep: prev.setupProgress.orgHierarchy.totalSteps - 1,
                },
                jiraStandards: {
                  ...prev.setupProgress.jiraStandards,
                  status: 'completed',
                  currentStep: prev.setupProgress.jiraStandards.totalSteps - 1,
                },
                teamAttributes: {
                  ...prev.setupProgress.teamAttributes,
                  status: 'completed',
                  currentStep: prev.setupProgress.teamAttributes.totalSteps - 1,
                },
              },
            }));
            setAppView('admin-home');
          }}
        />
      );
    }

    // Setup complete screen
    if (appView === 'setup-complete') {
      return (
        <SetupCompleteScreen
          onInviteTeam={handleInviteTeamFromSuccess}
          onGoToDashboard={handleGoToDashboardFromSuccess}
        />
      );
    }

    // Home views
    if (appView === 'creator-home') {
      return (
        <>
          <CreatorHome
            currentUser={CURRENT_USER}
            myAssessments={myAssessments}
            sharedWithMe={sharedWithMe}
            myMultiTeamAssessments={myMultiTeamAssessments}
            activeTab={homeActiveTab}
            onTabChange={setHomeActiveTab}
            onCreateAssessment={handleCreateAssessment}
            onCreateMultiTeamAssessment={handleCreateMultiTeamAssessment}
            onViewAssessment={handleViewAssessment}
            onViewMultiTeamAssessment={handleViewMultiTeamAssessment}
            onEditAssessment={handleEditAssessment}
            onShareAssessment={handleShareAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onDuplicateAssessment={handleDuplicateAssessment}
            onRenameAssessment={handleRenameAssessment}
          />
          {shareModalAssessment && (
            <ShareModal
              isOpen={true}
              assessment={shareModalAssessment}
              onClose={handleCloseShareModal}
              onShare={handleSaveShares}
            />
          )}
        </>
      );
    }

    if (appView === 'viewer-home') {
      return (
        <ViewerHome
          currentUser={CURRENT_USER}
          sharedWithMe={sharedWithMe}
          onViewAssessment={handleViewAssessment}
          pendingAccessRequest={currentUserPendingRequest}
          onRequestCreatorAccess={handleRequestCreatorAccess}
        />
      );
    }

    if (appView === 'admin-home') {
      return (
        <AdminHome
          currentUser={CURRENT_USER}
          adminState={adminState}
          onUpdateSection={handleUpdateAdminSection}
          onUpdateDefaults={handleUpdateDefaults}
          onUpdateUsers={handleUpdateUsers}
          onUpdateGroups={handleUpdateGroups}
          onUpdateGroupAccessRules={handleUpdateGroupAccessRules}
          onUpdateUserGroupAccessRules={handleUpdateUserGroupAccessRules}
          onUpdateAttributes={handleUpdateAttributes}
          onUpdateOrgStructureSettings={handleUpdateOrgStructureSettings}
          onNavigateToCreator={handleNavigateToCreator}
          onStartNewAssessment={handleCreateAssessment}
          onViewAssessment={handleViewAssessment}
          onEditAssessment={handleEditAssessment}
          onApproveAccessRequest={handleApproveAccessRequest}
          onDenyAccessRequest={handleDenyAccessRequest}
          onStartSetupWizard={handleStartAdminWizard}
          onCreateReport={handleCreateReport}
          onUpdateReport={handleUpdateReport}
          onDeleteReport={handleDeleteReport}
          onShareReport={handleShareReport}
        />
      );
    }

    // Admin setup wizards
    if (appView === 'admin-jira-standards-wizard') {
      return (
        <JiraStandardsWizard
          initialDefaults={adminState.organizationDefaults}
          initialStep={adminWizardInitialStep}
          onSaveExit={handleJiraStandardsSaveExit}
          onFinish={handleJiraStandardsFinish}
          onBack={handleBackFromAdminWizard}
        />
      );
    }

    if (appView === 'admin-org-hierarchy-wizard') {
      return (
        <OrgHierarchyWizard
          initialCategorization={adminState.teamAttributes}
          initialSettings={adminState.orgStructureSettings}
          initialStep={adminWizardInitialStep}
          onSaveExit={handleOrgHierarchySaveExit}
          onFinish={handleOrgHierarchyFinish}
          onBack={handleBackFromAdminWizard}
        />
      );
    }

    if (appView === 'admin-team-attributes-wizard') {
      return (
        <TeamAttributesWizard
          initialCategorization={adminState.teamAttributes}
          initialStep={adminWizardInitialStep}
          onSaveExit={handleTeamAttributesSaveExit}
          onFinish={handleTeamAttributesFinish}
          onBack={handleBackFromAdminWizard}
        />
      );
    }

    // Edit settings view
    if (appView === 'edit-settings') {
      const assessment = currentAssessmentId
        ? myAssessments.find(a => a.id === currentAssessmentId) ||
          sharedWithMe.find(a => a.id === currentAssessmentId)
        : null;
      const assessmentName = assessment?.name || wizardState.step1.assessmentName || 'Assessment';

      return (
        <EditableSettingsPage
          wizardState={wizardState}
          onSave={handleSaveSettings}
          onCancel={handleCancelEditSettings}
          assessmentName={assessmentName}
        />
      );
    }

    // Indicator drill-down view
    if (appView === 'indicator-drilldown' && assessmentResult && drillDownState) {
      return (
        <IndicatorDrillDownPage
          drillDownState={drillDownState}
          assessmentResult={assessmentResult}
          onBack={handleBackFromDrillDown}
        />
      );
    }

    // Outcome detail view
    if (appView === 'outcome-detail' && assessmentResult && selectedOutcomeId) {
      // Calculate outcome confidence to get the selected outcome data
      const { calculateExecutiveSummary } = require('./utils/executiveSummaryUtils');
      const summaryData = calculateExecutiveSummary(assessmentResult);
      const selectedOutcome = summaryData.outcomeConfidence?.outcomes.find(
        (o: { id: OutcomeAreaId }) => o.id === selectedOutcomeId
      );

      if (selectedOutcome) {
        return (
          <>
            <OutcomeDetailPage
              outcome={selectedOutcome}
              dimensions={assessmentResult.dimensions}
              onBack={handleBackFromOutcomeDetail}
              onDimensionClick={(dimensionKey) => {
                // Navigate to dimension detail, tracking that we came from this outcome
                const dimIndex = assessmentResult.dimensions.findIndex(
                  d => d.dimensionKey === dimensionKey
                );
                if (dimIndex >= 0) {
                  setReturnToOutcomeId(selectedOutcomeId); // Track the outcome we came from
                  setSelectedOutcomeId(null);
                  setReturnToDimensionIndex(dimIndex);
                  setAppView('assessment-results');
                }
              }}
              teamName={assessmentResult.teamName}
              dateRange={assessmentResult.dateRange}
              dataGrouping={assessmentResult.dataGrouping}
              comparisonTeamCount={assessmentResult.comparisonTeamCount}
              comparisonTeams={assessmentResult.comparisonTeams}
              comparisonCriteria={assessmentResult.comparisonCriteria}
              onViewComparisonTeams={() => setIsComparisonModalOpen(true)}
            />
            <ComparisonGroupModal
              isOpen={isComparisonModalOpen}
              onClose={() => setIsComparisonModalOpen(false)}
              teams={assessmentResult.comparisonTeams}
              criteria={assessmentResult.comparisonCriteria}
              teamCount={assessmentResult.comparisonTeamCount}
            />
          </>
        );
      }
    }

    // Improvement plan wizard view
    if (appView === 'improvement-plan-wizard' && assessmentResult) {
      return (
        <ImprovementPlanWizardPage
          assessmentResult={assessmentResult}
          onPlanCreated={handleImprovementPlanCreated}
          onCancel={handleBackFromImprovementPlanWizard}
        />
      );
    }

    // Improvement plan detail view
    if (appView === 'improvement-plan-detail' && currentViewingPlan && assessmentResult) {
      return (
        <PlanDetailPage
          plan={currentViewingPlan}
          teamName={assessmentResult.teamName}
          onBack={handleBackFromPlanDetail}
          onPlayStatusChange={handlePlanPlayStatusChange}
          onArchivePlan={handleArchivePlan}
        />
      );
    }

    // Assessment results view
    if (appView === 'assessment-results' && assessmentResult) {
      const isOwner = currentAssessmentId
        ? myAssessments.some(a => a.id === currentAssessmentId)
        : true; // New assessment is always owned by current user

      // Check if user has editable permission on a shared assessment
      const sharedAssessment = sharedWithMe.find(a => a.id === currentAssessmentId);
      const hasEditablePermission = sharedAssessment?.shares.some(
        s => s.sharedWithUserId === CURRENT_USER.id && s.permission === 'editable'
      );
      const canEdit = isOwner || hasEditablePermission;

      return (
        <>
          <AssessmentResultsLayout
            assessmentResult={assessmentResult}
            wizardState={wizardState}
            onBackToSetup={handleEditSettings}
            onBackToHome={handleBackToHome}
            onRerun={handleRerunAssessment}
            onShare={() => {
              const assessment = myAssessments.find(a => a.id === currentAssessmentId);
              if (assessment) {
                setShareModalAssessment(assessment);
              }
            }}
            canShare={isOwner}
            canEdit={canEdit}
            onIndicatorDrillDown={handleIndicatorDrillDown}
            onOutcomeClick={handleOutcomeClick}
            initialExpandedDimension={returnToDimensionIndex}
            returnToOutcomeId={returnToOutcomeId}
            onBackToOutcome={handleBackToOutcome}
            onOpenImprovementPlanWizard={handleOpenImprovementPlanWizard}
            onOpenPlanDetail={handleOpenPlanDetail}
            newlyCreatedPlanIdFromApp={newlyCreatedPlanId}
            onClearNewlyCreatedPlanFromApp={() => setNewlyCreatedPlanId(null)}
          />
          {shareModalAssessment && (
            <ShareModal
              isOpen={true}
              assessment={shareModalAssessment}
              onClose={handleCloseShareModal}
              onShare={handleSaveShares}
            />
          )}
        </>
      );
    }

    // Portfolio results view
    if (appView === 'portfolio-results' && multiTeamResult) {
      return (
        <PortfolioDashboard
          result={multiTeamResult}
          onTeamClick={handleTeamDrillDown}
          onDimensionClick={handleDimensionDrillDown}
          onBack={handleBackFromPortfolio}
        />
      );
    }

    // Multi-team wizard view
    if (appView === 'multi-team-wizard') {
      const renderMultiTeamStep = () => {
        switch (multiTeamWizardState.currentStep) {
          case 0:
            return (
              <Step1ScopeSelection
                data={multiTeamWizardState.step1}
                onUpdate={updateMultiTeamStep1Data}
                teamAttributes={adminState.teamAttributes}
              />
            );
          case 1:
            return (
              <Step2TeamReview
                scope={multiTeamWizardState.step1.scope}
                teamAttributes={adminState.teamAttributes}
                onUpdateExclusions={(exclusions) =>
                  setMultiTeamWizardState((prev) => ({ ...prev, excludedTeams: exclusions }))
                }
                excludedTeams={multiTeamWizardState.excludedTeams}
              />
            );
          case 2:
            return (
              <Step3ConfigStrategy
                strategy={multiTeamWizardState.configurationStrategy}
                onUpdate={updateConfigurationStrategy}
                teamCount={multiTeamWizardState.step1.scope.resolvedTeamIds.length}
              />
            );
          case 3:
            return (
              <Step4IssueTypes
                data={multiTeamWizardState.sharedSettings.step3}
                onUpdate={(data) => updateMultiTeamSharedSettings({ step3: { ...multiTeamWizardState.sharedSettings.step3, ...data } })}
              />
            );
          case 4:
            return (
              <Step6SprintCadence
                data={multiTeamWizardState.sharedSettings.step4}
                onUpdate={(data) => updateMultiTeamSharedSettings({ step4: { ...multiTeamWizardState.sharedSettings.step4, ...data } })}
              />
            );
          case 5:
            return (
              <Step6ReportOptions
                data={multiTeamWizardState.step6}
                onUpdate={updateMultiTeamStep6Data}
              />
            );
          case 6:
            return <Step7Review wizardState={wizardState} isMultiTeam multiTeamState={multiTeamWizardState} />;
          default:
            return null;
        }
      };

      return (
        <WizardLayout
          currentStep={multiTeamWizardState.currentStep}
          totalSteps={6}
          onNext={handleMultiTeamNext}
          onBack={handleMultiTeamBack}
          onStepChange={handleMultiTeamStepChange}
          onFinish={handleMultiTeamFinish}
          onSaveDraft={handleSaveDraft}
          teamName={multiTeamWizardState.step1.displayName || 'Portfolio Assessment'}
          isMultiTeam
        >
          {renderMultiTeamStep()}
        </WizardLayout>
      );
    }

    // Default: Wizard view
    return (
      <WizardLayout
        currentStep={wizardState.currentStep}
        totalSteps={totalWizardSteps}
        onNext={handleNext}
        onBack={handleBack}
        onStepChange={handleStepChange}
        onFinish={handleFinish}
        onSaveDraft={handleSaveDraft}
        teamName={wizardState.step1.teamName}
        stepLabels={visibleSteps.map(s => s.label)}
      >
        {renderCurrentStep()}
      </WizardLayout>
    );
  };

  return (
    <TourProvider>
      <PersonaProvider onPersonaSwitch={handlePersonaSwitch}>
        {renderAppContent()}
        <PageGuidance />
      </PersonaProvider>
    </TourProvider>
  );
};

export default App;
