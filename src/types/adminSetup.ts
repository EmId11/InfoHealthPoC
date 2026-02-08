// Admin Setup Wizard Types
// Types for tracking setup wizard progress and state for Org Hierarchy, Jira Standards, and Team Attributes

import { OrganizationDefaults, TeamAttributeConfig, OrgStructureSettings } from './admin';

// ============================================
// Setup Status and Types
// ============================================

export type SetupType = 'orgHierarchy' | 'jiraStandards' | 'teamAttributes';
export type SetupStatus = 'not-started' | 'in-progress' | 'completed';

// ============================================
// Jira Standards Setup Data
// ============================================

export interface JiraStandardsSetupData {
  currentStep: number;
  // Step data mirrors the OrganizationDefaults structure
  issueTypesConfigured: boolean;
  staleThresholdsConfigured: boolean;
  sprintCadenceConfigured: boolean;
  dimensionPresetsConfigured: boolean;
  fieldHealthConfigured: boolean;
  workflowsConfigured: boolean;
  estimationConfigured: boolean;
  blockersConfigured: boolean;
  // The actual values are stored in the main OrganizationDefaults
}

// ============================================
// Organization Hierarchy Setup Data
// ============================================

export interface OrgHierarchySetupData {
  currentStep: number;
  // Step data mirrors the OrgStructureSettings and hierarchy values
  hierarchyEnabled: boolean | null; // null = not yet decided
  portfoliosConfigured: boolean;
  teamOfTeamsConfigured: boolean;
  // The actual values are stored in the main TeamAttributeConfig
}

// ============================================
// Team Attributes Setup Data
// ============================================

export interface TeamAttributesSetupData {
  currentStep: number;
  // Step data tracks which parts have been reviewed/configured
  systemAttributesReviewed: boolean;
  customAttributesConfigured: boolean;
  // The actual values are stored in the main TeamAttributeConfig
}

// ============================================
// Setup Progress Tracking
// ============================================

export interface SetupProgressItem<T> {
  status: SetupStatus;
  currentStep: number;
  totalSteps: number;
  snapshot?: T;
}

export interface AdminSetupProgress {
  orgHierarchy: SetupProgressItem<OrgHierarchySetupData>;
  jiraStandards: SetupProgressItem<JiraStandardsSetupData>;
  teamAttributes: SetupProgressItem<TeamAttributesSetupData>;
}

// ============================================
// Wizard Step Definitions
// ============================================

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

export const ORG_HIERARCHY_STEPS: WizardStep[] = [
  { id: 'welcome', label: 'Welcome', description: 'Learn about organizational hierarchy' },
  { id: 'design', label: 'Design Structure', description: 'Choose and customize your hierarchy' },
  { id: 'review', label: 'Review', description: 'Review your configuration' },
];

export const JIRA_STANDARDS_STEPS: WizardStep[] = [
  { id: 'welcome', label: 'Welcome', description: 'Learn about organization-wide standards' },
  { id: 'issueTypes', label: 'Issue Types', description: 'Choose which issue types to include' },
  { id: 'staleThresholds', label: 'Stale Thresholds', description: 'Define when issues become stale' },
  { id: 'sprintCadence', label: 'Sprint Cadence', description: 'Set default sprint duration' },
  { id: 'dimensionPresets', label: 'Dimension Presets', description: 'Choose assessment templates' },
  { id: 'fieldHealth', label: 'Field Health', description: 'Configure which fields to assess for completeness' },
  { id: 'workflows', label: 'Workflows', description: 'Review/edit inferred workflows per issue type' },
  { id: 'estimation', label: 'Estimation', description: 'Configure when estimation is expected' },
  { id: 'blockers', label: 'Blockers', description: 'Configure how blockers are captured' },
  { id: 'review', label: 'Review', description: 'Review your standards' },
];

export const TEAM_ATTRIBUTES_STEPS: WizardStep[] = [
  { id: 'welcome', label: 'Welcome', description: 'Learn about team attributes' },
  { id: 'systemAttributes', label: 'System Attributes', description: 'Review auto-calculated attributes' },
  { id: 'customAttributes', label: 'Custom Attributes', description: 'Create custom team classifications' },
  { id: 'review', label: 'Review', description: 'Review your attributes' },
];

// ============================================
// Initial/Default Values
// ============================================

export const INITIAL_ORG_HIERARCHY_SETUP: SetupProgressItem<OrgHierarchySetupData> = {
  status: 'not-started',
  currentStep: 0,
  totalSteps: ORG_HIERARCHY_STEPS.length,
  snapshot: undefined,
};

export const INITIAL_JIRA_STANDARDS_SETUP: SetupProgressItem<JiraStandardsSetupData> = {
  status: 'not-started',
  currentStep: 0,
  totalSteps: JIRA_STANDARDS_STEPS.length, // Now 10 steps (welcome, issueTypes, staleThresholds, sprintCadence, dimensionPresets, fieldHealth, workflows, estimation, blockers, review)
  snapshot: undefined,
};

export const INITIAL_TEAM_ATTRIBUTES_SETUP: SetupProgressItem<TeamAttributesSetupData> = {
  status: 'not-started',
  currentStep: 0,
  totalSteps: TEAM_ATTRIBUTES_STEPS.length,
  snapshot: undefined,
};

export const INITIAL_ADMIN_SETUP_PROGRESS: AdminSetupProgress = {
  orgHierarchy: INITIAL_ORG_HIERARCHY_SETUP,
  jiraStandards: INITIAL_JIRA_STANDARDS_SETUP,
  teamAttributes: INITIAL_TEAM_ATTRIBUTES_SETUP,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get the step label for displaying progress
 */
export function getSetupStepLabel(setupType: SetupType, currentStep: number): string {
  const steps = setupType === 'orgHierarchy'
    ? ORG_HIERARCHY_STEPS
    : setupType === 'jiraStandards'
      ? JIRA_STANDARDS_STEPS
      : TEAM_ATTRIBUTES_STEPS;

  return steps[currentStep]?.label || 'Unknown';
}

/**
 * Get human-readable setup type name
 */
export function getSetupTypeName(setupType: SetupType): string {
  switch (setupType) {
    case 'orgHierarchy':
      return 'Organization Hierarchy';
    case 'jiraStandards':
      return 'Jira Standards';
    case 'teamAttributes':
      return 'Team Attributes';
    default:
      return 'Setup';
  }
}

/**
 * Check if all setup wizards are completed
 */
export function isAllSetupComplete(progress: AdminSetupProgress): boolean {
  return (
    progress.orgHierarchy.status === 'completed' &&
    progress.jiraStandards.status === 'completed' &&
    progress.teamAttributes.status === 'completed'
  );
}
