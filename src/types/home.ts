// Home Page Types - Assessment management, sharing, and persistence

import { AssessmentResult } from './assessment';
import { WizardState } from './wizard';

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
  teamIds?: string[];
  teamNames?: string[];
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
}

// ============================================
// Team Settings Versioning
// ============================================

export interface TeamSettingsVersion {
  id: string;
  teamId: string;
  teamName: string;
  createdAt: string;
  sourceAssessmentId: string | null;
}

// ============================================
// localStorage Keys
// ============================================

export const STORAGE_KEYS = {
  ASSESSMENTS: 'invisible-work-assessments',
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
