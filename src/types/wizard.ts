// Wizard State Types for Invisible Work Assessment
// Supports both single-team and multi-team (portfolio) assessments

import { dateRangePresets, mockDetectedConfig } from '../constants/presets';

// Re-export multi-team types for convenience
export type {
  AssessmentScope,
  ScopeSelection,
  ConfigurationStrategy,
  MultiTeamStep1Data,
  MultiTeamWizardState,
  TeamSettingsOverride,
  TeamExclusion,
} from './multiTeamAssessment';

export {
  initialScopeSelection,
  initialMultiTeamStep1Data,
  isScopeSelectionComplete,
  getScopeTypeDisplayName,
  getConfigurationStrategyDescription,
} from './multiTeamAssessment';

// ============================================
// Step 1: Basic Details
// ============================================
export type DataGrouping = 'monthly' | 'fortnightly' | 'weekly';
export type DateRangePresetId = 'last3Months' | 'last6Months' | 'custom';
export type SettingsChoice = 'usePrevious' | 'startFresh' | null;

export interface Step1Data {
  teamId: string | null;
  teamName: string;
  teamIds: string[];
  teamNames: string[];
  assessmentName: string;
  isTeamOnboarded: boolean;
  settingsChoice: SettingsChoice;
  dateRangePreset: DateRangePresetId;
  customDateRange: {
    startDate: string;
    endDate: string;
  };
  dataGrouping: DataGrouping;
}

// ============================================
// Step 2: Comparison Criteria
// ============================================

// Org structure selection for the team
export interface OrgStructureSelection {
  portfolioValueId: string | null; // Selected Portfolio value ID
  teamOfTeamsValueId: string | null; // Selected Team of Teams value ID
  wasPreSelected: boolean; // true if values came from existing team mapping
}

// Admin-defined category selection
export interface CategorySelection {
  categoryId: string;
  selectedValueIds: string[];
}

export interface ComparisonCriteria {
  // System-based criteria
  compareToOrganisation: boolean;
  compareToScrumTeams: boolean;
  compareToSimilarDemand: boolean;
  compareToSimilarVolume: boolean;
  compareToMatureTeams: boolean;
  compareToTribeTeams: boolean; // Deprecated - use categorySelections instead

  // Admin-defined category selections (new)
  categorySelections: CategorySelection[];

  // Manual team selection
  compareToSpecificTeams: boolean;
  specificTeamIds: string[];
}

export interface Step2Data {
  orgStructure: OrgStructureSelection; // Team's org structure position
  comparisonCriteria: ComparisonCriteria;
}

// ============================================
// Step 3: Issue Types
// ============================================
export interface IssueTypeSelection {
  story: boolean;
  bug: boolean;
  task: boolean;
  epic: boolean;
  subtask: boolean;
}

export type IssueTypeKey = keyof IssueTypeSelection;

// Configuration for a single issue type (used for org defaults)
export interface IssueTypeConfig {
  key: IssueTypeKey;
  enabled: boolean;
  label: string;
}

export interface Step3Data {
  issueTypes: IssueTypeSelection;
}

// ============================================
// Step 4: Sprint Cadence
// ============================================
export type SprintCadence = 'weekly' | 'fortnightly' | 'threeWeeks' | 'monthly' | 'custom';

export interface CadenceHistory {
  cadenceChanged: boolean;
  previousCadence: SprintCadence | null;
  previousCustomDays: number | null;
  changeDate: string | null;
}

export interface Step4Data {
  sprintCadence: SprintCadence;
  customSprintDays: number | null;
  cadenceHistory: CadenceHistory;
}

// ============================================
// Step 5: Stale Thresholds
// ============================================
export interface StaleThreshold {
  days: number;
  enabled: boolean;
}

export interface Step5Data {
  staleThresholds: Record<IssueTypeKey, StaleThreshold>;
}

// ============================================
// Step 6: Report Options
// ============================================
export type CalibrationChoice = 'collectFeedback' | 'sendSurvey' | 'generateNow';
export type QuorumPercentage = 25 | 50 | 75 | 100;

export interface Step6Data {
  includeTrends: boolean;
  includeDescriptions: boolean;
  includeWhyItMatters: boolean;
  includeComparisonOnCards: boolean;
  calibrationChoice: CalibrationChoice;
  quorumPercentage: number;
  surveyDeadlineDays: number;
  selectedMemberIds: string[];
}

// ============================================
// Field Selection (for PlanReady)
// ============================================
export type FieldApplicability = 'all' | string[]; // 'all' teams or specific team IDs

export interface FieldSelection {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  isCustom: boolean;
  enabled: boolean;
  teamApplicability: FieldApplicability;
}

export interface IssueTypeFieldConfig {
  issueTypeKey: IssueTypeKey;
  fields: FieldSelection[];
}

export interface FieldSelectionData {
  configs: IssueTypeFieldConfig[];
  isPerTeamCustomisation: boolean;
  perTeamConfigs: Record<string, IssueTypeFieldConfig[]>;
}

// ============================================
// Full Wizard State
// ============================================
export interface WizardState {
  currentStep: number; // 0 = welcome, 1-4 = actual steps
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  fieldSelection: FieldSelectionData;
}

// ============================================
// Initial/Default Values
// ============================================
const defaultRange = dateRangePresets[0].getRange();

export const initialStep1Data: Step1Data = {
  teamId: null,
  teamName: '',
  teamIds: [],
  teamNames: [],
  assessmentName: '',
  isTeamOnboarded: false,
  settingsChoice: null,
  dateRangePreset: 'last3Months',
  customDateRange: defaultRange,
  dataGrouping: 'fortnightly',
};

export const initialComparisonCriteria: ComparisonCriteria = {
  compareToOrganisation: true,
  compareToScrumTeams: true,
  compareToSimilarDemand: true,
  compareToSimilarVolume: false,
  compareToMatureTeams: false,
  compareToTribeTeams: false,
  categorySelections: [], // Will be populated from admin categories
  compareToSpecificTeams: false,
  specificTeamIds: [],
};

export const initialOrgStructureSelection: OrgStructureSelection = {
  portfolioValueId: null,
  teamOfTeamsValueId: null,
  wasPreSelected: false,
};

export const initialStep2Data: Step2Data = {
  orgStructure: initialOrgStructureSelection,
  comparisonCriteria: initialComparisonCriteria,
};

export const initialStep3Data: Step3Data = {
  issueTypes: {
    story: true,
    bug: true,
    task: true,
    epic: true,
    subtask: false,
  },
};

export const initialStep4Data: Step4Data = {
  sprintCadence: 'fortnightly',
  customSprintDays: null,
  cadenceHistory: {
    cadenceChanged: false,
    previousCadence: null,
    previousCustomDays: null,
    changeDate: null,
  },
};

export const initialStep5Data: Step5Data = {
  staleThresholds: {
    story: { days: 14, enabled: true },
    bug: { days: 7, enabled: true },
    task: { days: 7, enabled: true },
    epic: { days: 30, enabled: true },
    subtask: { days: 5, enabled: false },
  },
};

export const initialStep6Data: Step6Data = {
  includeTrends: true,
  includeDescriptions: true,
  includeWhyItMatters: true,
  includeComparisonOnCards: true,
  calibrationChoice: 'collectFeedback',
  quorumPercentage: 50,
  surveyDeadlineDays: 14,
  selectedMemberIds: [],
};

export const initialFieldSelectionData: FieldSelectionData = {
  configs: [],
  isPerTeamCustomisation: false,
  perTeamConfigs: {},
};

export const initialWizardState: WizardState = {
  currentStep: 0,
  step1: initialStep1Data,
  step2: initialStep2Data,
  step3: initialStep3Data,
  step4: initialStep4Data,
  step5: initialStep5Data,
  step6: initialStep6Data,
  fieldSelection: initialFieldSelectionData,
};

// ============================================
// Helper Functions
// ============================================

export const getEffectiveDateRange = (step1: Step1Data): { startDate: string; endDate: string } => {
  if (step1.dateRangePreset === 'custom') {
    return step1.customDateRange;
  }
  const preset = dateRangePresets.find(p => p.id === step1.dateRangePreset);
  return preset?.getRange() || { startDate: '', endDate: '' };
};

export const getSelectedIssueTypes = (step3: Step3Data): IssueTypeKey[] => {
  return (Object.entries(step3.issueTypes) as [IssueTypeKey, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
};

export const hasComparisonEnabled = (criteria: ComparisonCriteria): boolean => {
  const hasSystemCriteria = criteria.compareToOrganisation ||
    criteria.compareToScrumTeams ||
    criteria.compareToSimilarDemand ||
    criteria.compareToSimilarVolume ||
    criteria.compareToMatureTeams ||
    criteria.compareToTribeTeams ||
    criteria.compareToSpecificTeams;

  const hasCategorySelections = criteria.categorySelections.some(
    cs => cs.selectedValueIds.length > 0
  );

  return hasSystemCriteria || hasCategorySelections;
};

// Calculate survey deadline date from Step6Data
export const getSurveyDeadlineDate = (step6: Step6Data): string => {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + step6.surveyDeadlineDays);
  return deadline.toISOString().split('T')[0];
};

// Legacy compatibility - map old step9/step7 to new step6 for components that use it
export type Step7Data = Step6Data;
export type Step9Data = Step6Data;
export const initialStep7Data = initialStep6Data;
export const initialStep9Data = initialStep6Data;
