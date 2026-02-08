// Home Page Types - Assessment management, sharing, and persistence

import { AssessmentResult } from './assessment';
import { WizardState, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data } from './wizard';
import type {
  MultiTeamAssessmentResult,
  MultiTeamWizardState,
  ScopeSelection,
  AssessmentScope,
} from './multiTeamAssessment';

// ============================================
// Sharing Types
// ============================================

export type SharePermission = 'read-only' | 'editable';

export interface ShareRecord {
  id: string;
  sharedWithUserId: string;
  sharedWithUserName: string;
  sharedWithUserEmail: string;
  permission: SharePermission;
  sharedAt: string;
  sharedByUserId: string;
  sharedByUserName: string;
}

// ============================================
// User Types (for mock data and sharing)
// ============================================

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

// ============================================
// Saved Assessment Types
// ============================================

export type AssessmentStatus = 'draft' | 'completed';

export interface SavedAssessment {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  createdAt: string;
  lastRefreshed: string;
  createdByUserId: string;
  createdByUserName: string;
  dateRange: { startDate: string; endDate: string };
  status: AssessmentStatus;
  result: AssessmentResult | null;
  wizardStateSnapshot: WizardState;
  shares: ShareRecord[];
  teamSettingsVersionId: string;

  // Multi-team assessment flag
  isMultiTeam?: false;
}

// ============================================
// Multi-Team Saved Assessment Types
// ============================================

export type MultiTeamAssessmentStatus = 'draft' | 'completed';

export interface SavedMultiTeamAssessment {
  id: string;
  name: string;
  createdAt: string;
  lastRefreshed: string;
  createdByUserId: string;
  createdByUserName: string;
  dateRange: { startDate: string; endDate: string };
  status: MultiTeamAssessmentStatus;

  // Multi-team specific
  isMultiTeam: true;
  scope: ScopeSelection;
  scopeType: AssessmentScope;
  teamCount: number;
  teamNames: string[];  // For display without loading full result

  // Results
  result: MultiTeamAssessmentResult | null;
  wizardStateSnapshot: MultiTeamWizardState;

  // Sharing
  shares: ShareRecord[];
}

/**
 * Union type for any saved assessment (single or multi-team)
 */
export type AnySavedAssessment = SavedAssessment | SavedMultiTeamAssessment;

/**
 * Type guard to check if assessment is multi-team
 */
export function isMultiTeamAssessment(
  assessment: AnySavedAssessment
): assessment is SavedMultiTeamAssessment {
  return assessment.isMultiTeam === true;
}

/**
 * Type guard to check if assessment is single-team
 */
export function isSingleTeamAssessment(
  assessment: AnySavedAssessment
): assessment is SavedAssessment {
  return !assessment.isMultiTeam;
}

// ============================================
// Team Settings Versioning
// ============================================

export interface TeamSettings {
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
}

export interface TeamSettingsVersion {
  id: string;
  teamId: string;
  teamName: string;
  createdAt: string;
  settings: TeamSettings;
  sourceAssessmentId: string | null;
}

// ============================================
// localStorage Keys
// ============================================

export const STORAGE_KEYS = {
  ASSESSMENTS: 'invisible-work-assessments',
  MULTI_TEAM_ASSESSMENTS: 'invisible-work-multi-team-assessments',
  TEAM_SETTINGS: 'invisible-work-team-settings',
  PERSONA: 'invisible-work-persona',
} as const;

// ============================================
// Helper Functions
// ============================================

export const generateDefaultAssessmentName = (teamName: string): string => {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const year = now.getFullYear();
  return `${teamName} - ${month} ${year}`;
};

export const generateDefaultMultiTeamAssessmentName = (
  scopeType: AssessmentScope,
  scopeName?: string,
  teamCount?: number
): string => {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const year = now.getFullYear();

  if (scopeName) {
    return `${scopeName} - ${month} ${year}`;
  }

  if (scopeType === 'custom-selection' && teamCount) {
    return `${teamCount} Teams - ${month} ${year}`;
  }

  return `Portfolio Assessment - ${month} ${year}`;
};

export const getRiskLabel = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return 'Low';
    case 'moderate': return 'Moderate';
    case 'high': return 'High';
    default: return 'Unknown';
  }
};

export const getStatusLabel = (status: AssessmentStatus): string => {
  switch (status) {
    case 'draft': return 'Draft';
    case 'completed': return 'Completed';
  }
};

export const getStatusColor = (status: AssessmentStatus): string => {
  switch (status) {
    case 'draft': return '#6B778C';
    case 'completed': return '#00875A';
  }
};
