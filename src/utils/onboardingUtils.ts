import { AdminState, OnboardingStepId, ADMIN_ONBOARDING_STEPS } from '../types/admin';

/**
 * Determines if a specific onboarding step is complete based on AdminState.
 */
export function isStepComplete(stepId: OnboardingStepId, adminState: AdminState): boolean {
  switch (stepId) {
    case 'invite-users':
      // Complete if there are users beyond the initial admin (more than 1 active user)
      return adminState.users.filter(u => u.status !== 'deactivated').length > 1;

    case 'configure-hierarchy':
      // Complete if hierarchy is disabled OR if there are Portfolio/ToT values
      if (!adminState.orgStructureSettings.useHierarchy) {
        return true; // Explicitly chose flat structure
      }
      // Check if org-structure attributes have values
      const orgStructureAttributes = adminState.teamAttributes.attributes.filter(
        a => a.type === 'org-structure'
      );
      const orgStructureValues = adminState.teamAttributes.attributeValues.filter(
        v => orgStructureAttributes.some(a => a.id === v.attributeId)
      );
      return orgStructureValues.length > 0;

    case 'setup-attributes':
      // Complete if at least one admin-defined attribute has values
      const adminAttributes = adminState.teamAttributes.attributes.filter(
        a => a.type === 'admin'
      );
      const adminAttributeValues = adminState.teamAttributes.attributeValues.filter(
        v => adminAttributes.some(a => a.id === v.attributeId)
      );
      return adminAttributeValues.length > 0;

    case 'define-standards':
      // Complete if at least one setting is org-defined (showing intentional configuration)
      return (
        adminState.organizationDefaults.staleThresholds.mode === 'org-defined' ||
        adminState.organizationDefaults.sprintCadence.mode === 'org-defined' ||
        adminState.organizationDefaults.dimensionPresets.mode === 'org-defined'
      );

    case 'create-assessment':
      // Complete if any assessment has been created
      return adminState.analytics.usageMetrics.totalAssessments > 0;

    default:
      return false;
  }
}

/**
 * Returns completion status for all onboarding steps.
 */
export function getOnboardingProgress(adminState: AdminState): {
  completedCount: number;
  totalCount: number;
  steps: Array<{ stepId: OnboardingStepId; isComplete: boolean }>;
  allComplete: boolean;
} {
  const steps = ADMIN_ONBOARDING_STEPS.map(step => ({
    stepId: step.id,
    isComplete: isStepComplete(step.id, adminState),
  }));

  const completedCount = steps.filter(s => s.isComplete).length;
  const totalCount = steps.length;

  return {
    completedCount,
    totalCount,
    steps,
    allComplete: completedCount === totalCount,
  };
}
