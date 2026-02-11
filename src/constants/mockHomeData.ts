// Mock data for Home Pages - Users, Saved Assessments, Team Settings

import { AppUser, SavedAssessment, TeamSettingsVersion } from '../types/home';
import { initialWizardState } from '../types/wizard';
import {
  generateHighPerformingTeamAssessment,
  generateSolidTeamAssessment,
  generateAverageTeamAssessment,
  generateMixedResultsTeamAssessment,
  generateImprovingTeamAssessment,
  generateDecliningTeamAssessment,
} from './mockAssessmentData';

// ============================================
// Pre-generated Mock Results for Completed Assessments
// Using 6 different scenarios to showcase different maturity levels
// ============================================

// Scenario 1: High-Performing Team (Great - 88th percentile)
const alphaSquadResult = generateHighPerformingTeamAssessment();

// Scenario 2: Solid Team (Good - 72nd percentile, improving trends)
const platformCoreResult = generateSolidTeamAssessment();

// Scenario 3: Average Team (Satisfactory - 52nd percentile)
const featureTeamBResult = generateAverageTeamAssessment();

// Scenario 4: Mixed Results Team (variable - some dimensions great, others at risk)
const growthSquadResult = generateMixedResultsTeamAssessment();

// Scenario 5: Improving Team (Needs Attention - 35th percentile, but improving)
const phoenixTeamResult = generateImprovingTeamAssessment();

// Scenario 6: Declining Team (Good - 68th percentile, but declining trends)
const legacyCrewResult = generateDecliningTeamAssessment();

// ============================================
// Mock Users
// ============================================

export const CURRENT_USER: AppUser = {
  id: 'user-1',
  displayName: 'Rachel Garcia',
  email: 'rachel.garcia@company.com',
  avatarUrl: undefined,
};

export const MOCK_USERS: AppUser[] = [
  CURRENT_USER,
  {
    id: 'user-2',
    displayName: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    avatarUrl: undefined,
  },
  {
    id: 'user-3',
    displayName: 'Tom Anderson',
    email: 'tom.anderson@company.com',
    avatarUrl: undefined,
  },
  {
    id: 'user-4',
    displayName: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    avatarUrl: undefined,
  },
  {
    id: 'user-5',
    displayName: 'Emily Davis',
    email: 'emily.davis@company.com',
    avatarUrl: undefined,
  },
  {
    id: 'user-6',
    displayName: 'James Wilson',
    email: 'james.wilson@company.com',
    avatarUrl: undefined,
  },
];

// ============================================
// Mock Saved Assessments (for Creator home "My Assessments")
// ============================================

export const MOCK_MY_ASSESSMENTS: SavedAssessment[] = [
  {
    id: 'assessment-1',
    name: 'Platform Team - Dec 2024',
    teamId: 'team-1',
    teamName: 'Platform Team',
    createdAt: '2024-12-15T10:30:00Z',
    lastRefreshed: '2025-01-03T08:15:00Z',
    createdByUserId: 'user-1',
    createdByUserName: 'Rachel Garcia',
    dateRange: { startDate: '2024-10-01', endDate: '2024-12-15' },
    status: 'completed',
    result: platformCoreResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-1',
        teamName: 'Platform Team',
        assessmentName: 'Platform Team - Dec 2024',
      },
    },
    shares: [
      {
        id: 'share-1',
        sharedWithUserId: 'user-2',
        sharedWithUserName: 'Sarah Chen',
        sharedWithUserEmail: 'sarah.chen@company.com',
        permission: 'read-only',
        sharedAt: '2024-12-16T09:00:00Z',
        sharedByUserId: 'user-1',
        sharedByUserName: 'Rachel Garcia',
      },
    ],
    teamSettingsVersionId: 'settings-1',
  },
  {
    id: 'assessment-2',
    name: 'Mobile Squad - Nov 2024',
    teamId: 'team-2',
    teamName: 'Mobile Squad',
    createdAt: '2024-11-20T14:15:00Z',
    lastRefreshed: '2024-12-28T14:30:00Z',
    createdByUserId: 'user-1',
    createdByUserName: 'Rachel Garcia',
    dateRange: { startDate: '2024-09-01', endDate: '2024-11-20' },
    status: 'completed',
    result: alphaSquadResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-2',
        teamName: 'Mobile Squad',
        assessmentName: 'Mobile Squad - Nov 2024',
      },
    },
    shares: [],
    teamSettingsVersionId: 'settings-2',
  },
  {
    id: 'assessment-3',
    name: 'API Team - Jan 2025',
    teamId: 'team-3',
    teamName: 'API Team',
    createdAt: '2025-01-05T11:00:00Z',
    lastRefreshed: '2025-01-05T11:00:00Z',
    createdByUserId: 'user-1',
    createdByUserName: 'Rachel Garcia',
    dateRange: { startDate: '2024-11-01', endDate: '2025-01-05' },
    status: 'draft',
    result: null,
    wizardStateSnapshot: {
      ...initialWizardState,
      currentStep: 3,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-3',
        teamName: 'API Team',
        assessmentName: 'API Team - Jan 2025',
      },
    },
    shares: [],
    teamSettingsVersionId: 'settings-3',
  },
  {
    id: 'assessment-4',
    name: 'Phoenix Team - Dec 2024',
    teamId: 'team-6',
    teamName: 'Phoenix Team',
    createdAt: '2024-12-10T09:00:00Z',
    lastRefreshed: '2025-01-02T10:30:00Z',
    createdByUserId: 'user-1',
    createdByUserName: 'Rachel Garcia',
    dateRange: { startDate: '2024-10-01', endDate: '2024-12-10' },
    status: 'completed',
    result: phoenixTeamResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-6',
        teamName: 'Phoenix Team',
        assessmentName: 'Phoenix Team - Dec 2024',
      },
    },
    shares: [],
    teamSettingsVersionId: 'settings-6',
  },
  {
    id: 'assessment-5',
    name: 'Legacy Crew - Nov 2024',
    teamId: 'team-7',
    teamName: 'Legacy Crew',
    createdAt: '2024-11-15T13:30:00Z',
    lastRefreshed: '2024-12-20T11:15:00Z',
    createdByUserId: 'user-1',
    createdByUserName: 'Rachel Garcia',
    dateRange: { startDate: '2024-09-15', endDate: '2024-11-15' },
    status: 'completed',
    result: legacyCrewResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-7',
        teamName: 'Legacy Crew',
        assessmentName: 'Legacy Crew - Nov 2024',
      },
    },
    shares: [
      {
        id: 'share-3',
        sharedWithUserId: 'user-4',
        sharedWithUserName: 'Mike Johnson',
        sharedWithUserEmail: 'mike.johnson@company.com',
        permission: 'read-only',
        sharedAt: '2024-11-18T14:00:00Z',
        sharedByUserId: 'user-1',
        sharedByUserName: 'Rachel Garcia',
      },
    ],
    teamSettingsVersionId: 'settings-7',
  },
];

// ============================================
// Mock Shared Assessments (for "Shared With Me")
// ============================================

export const MOCK_SHARED_WITH_ME: SavedAssessment[] = [
  {
    id: 'assessment-shared-1',
    name: 'Frontend Crew - Nov 2024',
    teamId: 'team-4',
    teamName: 'Frontend Crew',
    createdAt: '2024-11-10T09:30:00Z',
    lastRefreshed: '2024-12-20T16:00:00Z',
    createdByUserId: 'user-2',
    createdByUserName: 'Sarah Chen',
    dateRange: { startDate: '2024-09-01', endDate: '2024-11-10' },
    status: 'completed',
    result: featureTeamBResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-4',
        teamName: 'Frontend Crew',
        assessmentName: 'Frontend Crew - Nov 2024',
      },
    },
    shares: [
      {
        id: 'share-shared-1',
        sharedWithUserId: 'user-1',
        sharedWithUserName: 'Rachel Garcia',
        sharedWithUserEmail: 'rachel.garcia@company.com',
        permission: 'read-only',
        sharedAt: '2024-11-12T10:00:00Z',
        sharedByUserId: 'user-2',
        sharedByUserName: 'Sarah Chen',
      },
    ],
    teamSettingsVersionId: 'settings-4',
  },
  {
    id: 'assessment-shared-2',
    name: 'Data Team - Oct 2024',
    teamId: 'team-5',
    teamName: 'Data Team',
    createdAt: '2024-10-25T16:45:00Z',
    lastRefreshed: '2024-12-15T09:45:00Z',
    createdByUserId: 'user-3',
    createdByUserName: 'Tom Anderson',
    dateRange: { startDate: '2024-08-01', endDate: '2024-10-25' },
    status: 'completed',
    result: growthSquadResult,
    wizardStateSnapshot: {
      ...initialWizardState,
      step1: {
        ...initialWizardState.step1,
        teamId: 'team-5',
        teamName: 'Data Team',
        assessmentName: 'Data Team - Oct 2024',
      },
    },
    shares: [
      {
        id: 'share-shared-2',
        sharedWithUserId: 'user-1',
        sharedWithUserName: 'Rachel Garcia',
        sharedWithUserEmail: 'rachel.garcia@company.com',
        permission: 'editable',
        sharedAt: '2024-10-27T11:30:00Z',
        sharedByUserId: 'user-3',
        sharedByUserName: 'Tom Anderson',
      },
    ],
    teamSettingsVersionId: 'settings-5',
  },
];

// ============================================
// Mock Team Settings Versions
// ============================================

export const MOCK_TEAM_SETTINGS: TeamSettingsVersion[] = [
  {
    id: 'settings-1',
    teamId: 'team-1',
    teamName: 'Platform Team',
    createdAt: '2024-12-15T10:30:00Z',
    sourceAssessmentId: 'assessment-1',
  },
  {
    id: 'settings-2',
    teamId: 'team-2',
    teamName: 'Mobile Squad',
    createdAt: '2024-11-20T14:15:00Z',
    sourceAssessmentId: 'assessment-2',
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get the share record for current user from an assessment
 */
export const getMyShareRecord = (assessment: SavedAssessment, userId: string) => {
  return assessment.shares.find(s => s.sharedWithUserId === userId);
};

/**
 * Check if current user can edit an assessment
 */
export const canEditAssessment = (assessment: SavedAssessment, userId: string): boolean => {
  // Owner can always edit
  if (assessment.createdByUserId === userId) {
    return true;
  }
  // Check for editable share permission
  const share = getMyShareRecord(assessment, userId);
  return share?.permission === 'editable';
};

/**
 * Get latest team settings for a given team
 */
export const getLatestTeamSettings = (
  teamId: string,
  settingsHistory: TeamSettingsVersion[]
): TeamSettingsVersion | null => {
  return settingsHistory
    .filter(v => v.teamId === teamId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
};

/**
 * Format relative time (e.g., "2 days ago", "3 weeks ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Format date for display (e.g., "Dec 15, 2024")
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

