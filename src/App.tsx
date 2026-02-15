import React, { useState, useCallback, useMemo } from 'react';
import {
  WizardState,
  initialWizardState,
  Step1Data,
  Step3Data,
  FieldSelectionData,
  getSelectedIssueTypes,
} from './types/wizard';
import { AssessmentResult, IndicatorDrillDownState } from './types/assessment';
import { OutcomeAreaId } from './types/outcomeConfidence';
import { PersonaType, AppView as PersonaAppView } from './types/persona';
import { SavedAssessment, ShareRecord } from './types/home';
import { AdminState, AdminSection, OrganizationDefaults, ManagedUser, UserGroup, TeamAttributeConfig, OrgStructureSettings, AccessRequest, GroupAccessRule, UserGroupAccessRule } from './types/admin';
import { SetupType, isAllSetupComplete } from './types/adminSetup';
import { SavedReport, generateShareToken } from './types/reports';
import { generateMockAssessmentResultWithDim3 } from './constants/mockAssessmentData';
import { generateMockPatternResults } from './constants/mockPatternData';
import { initializeMockHistory } from './utils/historicalDataStorage';
import {
  CURRENT_USER,
  MOCK_MY_ASSESSMENTS,
  MOCK_SHARED_WITH_ME,
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
import Step4IssueTypes from './components/pages/Step4IssueTypes';
import StepFieldSelection from './components/pages/StepFieldSelection';
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
import { ImprovementPlanWizardPage, PlanDetailPage } from './components/plans';
import { ImprovementPlan, PlayStatus } from './types/improvementPlan';
import { savePlanToStorage, loadPlanFromStorage, updatePlayStatus } from './utils/improvementPlanUtils';
import DataIntegrityCategoryDetailPage from './components/assessment/dataIntegrity/DataIntegrityCategoryDetailPage';
import { mockIntegrityDimensionResult } from './constants/mockAssessmentData';

type AppView =
  | 'creator-home'
  | 'viewer-home'
  | 'admin-home'
  | 'wizard'
  | 'assessment-results'
  | 'edit-settings'
  | 'indicator-drilldown'
  | 'outcome-detail'
  | 'admin-jira-standards-wizard'
  | 'admin-org-hierarchy-wizard'
  | 'admin-team-attributes-wizard'
  | 'setup-complete'
  | 'improvement-plan-wizard'
  | 'improvement-plan-detail'
  | 'data-integrity-category-detail';

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

// Step configuration for the wizard (4 fixed steps)
export interface WizardStepConfig {
  id: string;
  label: string;
  type: 'basics' | 'issueTypes' | 'fieldSelection' | 'review';
}

const getVisibleSteps = (): WizardStepConfig[] => [
  { id: 'basics', label: 'Basics', type: 'basics' },
  { id: 'issueTypes', label: 'Issue Types', type: 'issueTypes' },
  { id: 'fieldSelection', label: 'Field Selection', type: 'fieldSelection' },
  { id: 'review', label: 'Review', type: 'review' },
];

const App: React.FC = () => {
  const [wizardState, setWizardState] = useState<WizardState>(initialWizardState);
  const [appView, setAppView] = useState<AppView>(getInitialAppView);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Home page state
  const [myAssessments, setMyAssessments] = useState<SavedAssessment[]>(MOCK_MY_ASSESSMENTS);
  const [sharedWithMe] = useState<SavedAssessment[]>(MOCK_SHARED_WITH_ME);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [shareModalAssessment, setShareModalAssessment] = useState<SavedAssessment | null>(null);
  const [homeActiveTab, setHomeActiveTab] = useState<'my' | 'shared'>('my');

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

  // Data Integrity category detail state
  const [selectedIntegrityCategoryIndex, setSelectedIntegrityCategoryIndex] = useState<number | null>(null);

  // Comparison modal state (for outcome detail page)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Admin state
  const [adminState, setAdminState] = useState<AdminState>(INITIAL_ADMIN_STATE);

  // Admin wizard state for tracking initial step when resuming
  const [adminWizardInitialStep, setAdminWizardInitialStep] = useState(0);

  // Compute visible wizard steps (fixed 4-step flow)
  const visibleSteps = useMemo(() => {
    return getVisibleSteps();
  }, []);

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

  // Step data update handlers
  const updateStep1Data = (data: Partial<Step1Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step1: { ...prev.step1, ...data },
    }));
  };

  const updateStep3Data = (data: Partial<Step3Data>) => {
    setWizardState((prev) => ({
      ...prev,
      step3: { ...prev.step3, ...data },
    }));
  };

  const updateFieldSelectionData = (data: Partial<FieldSelectionData>) => {
    setWizardState((prev) => ({
      ...prev,
      fieldSelection: { ...prev.fieldSelection, ...data },
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

  // Data Integrity category detail handlers
  const handleCategoryDetail = (categoryIndex: number) => {
    setSelectedIntegrityCategoryIndex(categoryIndex);
    setAppView('data-integrity-category-detail');
  };

  const handleBackFromCategoryDetail = () => {
    setSelectedIntegrityCategoryIndex(null);
    setReturnToDimensionIndex(0); // Data Integrity is dimension 0
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

  const handleViewAssessment = (assessment: SavedAssessment) => {
    setCurrentAssessmentId(assessment.id);
    setWizardState(assessment.wizardStateSnapshot);

    if (assessment.result) {
      // Has existing results - show them (backfill lensResults if missing)
      const result = assessment.result as AssessmentResult;
      if (!result.lensResults) {
        const trDim = result.dimensions?.[1];
        const coverageScore = trDim ? (trDim.healthScore ?? Math.round(trDim.overallPercentile)) : 60;
        result.lensResults = generateMockPatternResults(coverageScore);
      }
      setAssessmentResult(result);
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
      case 'issueTypes':
        return (
          <Step4IssueTypes
            data={wizardState.step3}
            onUpdate={updateStep3Data}
          />
        );
      case 'fieldSelection':
        return (
          <StepFieldSelection
            data={wizardState.fieldSelection}
            onUpdate={updateFieldSelectionData}
            selectedIssueTypes={selectedIssueTypes}
            selectedTeamIds={wizardState.step1.teamIds}
            selectedTeamNames={wizardState.step1.teamNames}
          />
        );
      case 'review':
        return (
          <Step7Review
            wizardState={wizardState}
            onStepChange={handleStepChange}
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
            activeTab={homeActiveTab}
            onTabChange={setHomeActiveTab}
            onCreateAssessment={handleCreateAssessment}
            onViewAssessment={handleViewAssessment}
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

    // Data Integrity category detail view
    if (appView === 'data-integrity-category-detail' && selectedIntegrityCategoryIndex != null) {
      const category = mockIntegrityDimensionResult.categories[selectedIntegrityCategoryIndex];
      if (category) {
        return (
          <DataIntegrityCategoryDetailPage
            category={category}
            dimensionName="Data Integrity"
            onBack={handleBackFromCategoryDetail}
            onIndicatorDrillDown={handleIndicatorDrillDown}
          />
        );
      }
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
