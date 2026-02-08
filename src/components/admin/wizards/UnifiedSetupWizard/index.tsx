import React, { useState } from 'react';
import UnifiedSetupLayout, { SetupPhase } from './UnifiedSetupLayout';
import SetupWelcome from './SetupWelcome';
import { TeamAttributeConfig, OrgStructureSettings, OrganizationDefaults } from '../../../../types/admin';
import { ORG_HIERARCHY_STEPS, JIRA_STANDARDS_STEPS, TEAM_ATTRIBUTES_STEPS } from '../../../../types/adminSetup';

// Import step components from existing wizards
import OrgHierarchyStep1Welcome from '../OrgHierarchyWizard/OrgHierarchyStep1Welcome';
import OrgHierarchyStep0Template from '../OrgHierarchyWizard/OrgHierarchyStep0Template';
import OrgStructureDesigner from '../OrgHierarchyWizard/OrgStructureDesigner';
import OrgHierarchyConfigureLevel from '../OrgHierarchyWizard/OrgHierarchyConfigureLevel';
import OrgHierarchyStep5Review from '../OrgHierarchyWizard/OrgHierarchyStep5Review';
import { STRUCTURE_TEMPLATES } from '../OrgHierarchyWizard/OrgStructureDesigner/constants';
import { StructureTemplateId, OrgHierarchyLevel } from '../../../../types/admin';

import JiraStandardsStep1Welcome from '../JiraStandardsWizard/JiraStandardsStep1Welcome';
import JiraStandardsStep2IssueTypes from '../JiraStandardsWizard/JiraStandardsStep2IssueTypes';
import JiraStandardsStep2StaleThresholds from '../JiraStandardsWizard/JiraStandardsStep2StaleThresholds';
import JiraStandardsStep3SprintCadence from '../JiraStandardsWizard/JiraStandardsStep3SprintCadence';
import JiraStandardsStep4DimensionPresets from '../JiraStandardsWizard/JiraStandardsStep4DimensionPresets';
import JiraStandardsStep5FieldHealth from '../JiraStandardsWizard/JiraStandardsStep5FieldHealth';
import JiraStandardsStep6Workflows from '../JiraStandardsWizard/JiraStandardsStep6Workflows';
import JiraStandardsStep7Estimation from '../JiraStandardsWizard/JiraStandardsStep7Estimation';
import JiraStandardsStep8Blockers from '../JiraStandardsWizard/JiraStandardsStep8Blockers';
import JiraStandardsStep9Review from '../JiraStandardsWizard/JiraStandardsStep9Review';

import TeamAttributesStep1Welcome from '../TeamAttributesWizard/TeamAttributesStep1Welcome';
import TeamAttributesStep2SystemAttrs from '../TeamAttributesWizard/TeamAttributesStep2SystemAttrs';
import TeamAttributesStep3CustomAttrs from '../TeamAttributesWizard/TeamAttributesStep3CustomAttrs';
import TeamAttributesStep4Review from '../TeamAttributesWizard/TeamAttributesStep4Review';

interface UnifiedSetupWizardProps {
  initialCategorization: TeamAttributeConfig;
  initialSettings: OrgStructureSettings;
  initialDefaults: OrganizationDefaults;
  onComplete: (
    categorization: TeamAttributeConfig,
    settings: OrgStructureSettings,
    defaults: OrganizationDefaults
  ) => void;
  onSkipSetup?: () => void; // Dev only - skip setup wizard
}

const UnifiedSetupWizard: React.FC<UnifiedSetupWizardProps> = ({
  initialCategorization,
  initialSettings,
  initialDefaults,
  onComplete,
  onSkipSetup,
}) => {
  // Global welcome state - shows before any phase
  const [showGlobalWelcome, setShowGlobalWelcome] = useState(true);

  // Phase and step tracking
  const [currentPhase, setCurrentPhase] = useState<SetupPhase>('orgHierarchy');
  const [currentStep, setCurrentStep] = useState(0);
  const [phaseComplete, setPhaseComplete] = useState<Record<SetupPhase, boolean>>({
    orgHierarchy: false,
    jiraStandards: false,
    teamAttributes: false,
  });

  // Wizard state
  const [categorization, setCategorization] = useState<TeamAttributeConfig>(initialCategorization);
  const [settings, setSettings] = useState<OrgStructureSettings>(initialSettings);
  const [defaults, setDefaults] = useState<OrganizationDefaults>(initialDefaults);

  // Sorted levels for consistent ordering
  const sortedLevels = [...settings.customLevels].sort((a, b) => a.order - b.order);

  // Dynamic org hierarchy steps based on structure configuration
  const getOrgHierarchySteps = () => {
    const steps = [
      { id: 'welcome', label: 'Welcome', description: 'Learn about organization structure' },
      { id: 'template', label: 'Choose Template', description: 'Select your organization structure' },
    ];

    // Only add customize and configure steps if not flat and has levels
    if (settings.useHierarchy && sortedLevels.length > 0) {
      steps.push({ id: 'customize', label: 'Customize Structure', description: 'Adjust level names and settings' });

      // Add one step per level for value creation
      sortedLevels.forEach((level) => {
        steps.push({
          id: `configure-${level.id}`,
          label: `Create ${level.pluralName}`,
          description: `Define your ${level.pluralName.toLowerCase()}`,
        });
      });
    }

    steps.push({ id: 'review', label: 'Review', description: 'Review your configuration' });
    return steps;
  };

  // Get step info for current phase
  const getStepInfo = () => {
    switch (currentPhase) {
      case 'orgHierarchy':
        const orgSteps = getOrgHierarchySteps();
        return { steps: orgSteps, totalSteps: orgSteps.length };
      case 'jiraStandards':
        return { steps: JIRA_STANDARDS_STEPS, totalSteps: JIRA_STANDARDS_STEPS.length };
      case 'teamAttributes':
        return { steps: TEAM_ATTRIBUTES_STEPS, totalSteps: TEAM_ATTRIBUTES_STEPS.length };
    }
  };

  const { steps: currentSteps, totalSteps } = getStepInfo();
  const currentStepData = currentSteps[currentStep];
  const isWelcomeStep = currentStep === 0;
  const isLastStepOfPhase = currentStep === totalSteps - 1;
  const isLastPhase = currentPhase === 'teamAttributes';
  const isLastStep = isLastPhase && isLastStepOfPhase;

  // Handle template selection for org hierarchy
  const handleTemplateSelect = (templateId: StructureTemplateId) => {
    const template = STRUCTURE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const isFlat = templateId === 'flat';
    const isCustom = templateId === 'custom';

    // Generate completely fresh levels with new unique IDs
    const newLevels: OrgHierarchyLevel[] = isCustom
      ? settings.customLevels
      : template.defaultLevels.map((level, index) => ({
          ...level,
          id: `level-${Date.now()}-${index}`,
        }));

    setSettings({
      ...settings,
      useHierarchy: !isFlat,
      structureTemplate: templateId,
      customLevels: newLevels,
    });

    // Sync categorization
    if (!isFlat) {
      const updatedCategorization = syncCategorizationWithSettings(categorization, {
        ...settings,
        useHierarchy: true,
        structureTemplate: templateId,
        customLevels: newLevels,
      });
      setCategorization(updatedCategorization);
    } else {
      // For flat, remove all org-structure attributes
      const filteredAttributes = categorization.attributes.filter(
        (attr) => attr.type !== 'org-structure'
      );
      const filteredValues = categorization.attributeValues.filter(
        (val) => !categorization.attributes.find(
          (attr) => attr.id === val.attributeId && attr.type === 'org-structure'
        )
      );
      setCategorization({
        attributes: filteredAttributes,
        attributeValues: filteredValues,
        categories: filteredAttributes,
        categoryValues: filteredValues,
      });
    }
  };

  // Handle "Get Started" from global welcome
  const handleGlobalWelcomeGetStarted = () => {
    setShowGlobalWelcome(false);
    // Start at step 0 of org hierarchy (which is now the org hierarchy welcome)
    setCurrentStep(0);
  };

  // Handle "Get Started" from org hierarchy welcome step
  const handleOrgHierarchyWelcomeGetStarted = () => {
    setCurrentStep(1); // Move to template selection
  };

  // Handle "Get Started" from template selection step
  const handleOrgHierarchyTemplateGetStarted = () => {
    if (settings.structureTemplate === 'flat') {
      // Skip to review for flat structure
      const orgSteps = getOrgHierarchySteps();
      setCurrentStep(orgSteps.length - 1);
    } else {
      setCurrentStep(2); // Move to customize (was 1, now 2 because of welcome step)
    }
  };

  // Handle next - either next step, next phase, or complete
  const handleNext = () => {
    if (isLastStep) {
      // Complete the entire setup
      onComplete(categorization, settings, defaults);
    } else if (isLastStepOfPhase) {
      // Move to next phase
      setPhaseComplete(prev => ({ ...prev, [currentPhase]: true }));
      const nextPhase = currentPhase === 'orgHierarchy' ? 'jiraStandards' : 'teamAttributes';
      setCurrentPhase(nextPhase);
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle back - previous step or previous phase
  const handleBack = () => {
    if (currentStep === 0) {
      // Go back to previous phase's last step
      if (currentPhase === 'jiraStandards') {
        setCurrentPhase('orgHierarchy');
        const orgSteps = getOrgHierarchySteps();
        setCurrentStep(orgSteps.length - 1); // Go to review step
      } else if (currentPhase === 'teamAttributes') {
        setCurrentPhase('jiraStandards');
        setCurrentStep(JIRA_STANDARDS_STEPS.length - 1); // Review step
      }
      // Can't go back from first step of first phase
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update handlers
  const handleUpdateSettings = (updates: Partial<OrgStructureSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateCategorization = (config: TeamAttributeConfig) => {
    setCategorization(config);
  };

  const handleUpdateDefaults = (updates: Partial<OrganizationDefaults>) => {
    setDefaults(prev => ({ ...prev, ...updates }));
  };

  // Get the level for a configure step
  const getLevelForStep = (stepId: string): { level: OrgHierarchyLevel; parentLevel?: OrgHierarchyLevel } | null => {
    if (!stepId.startsWith('configure-')) return null;
    const levelId = stepId.replace('configure-', '');
    const levelIndex = sortedLevels.findIndex((l) => l.id === levelId);
    if (levelIndex === -1) return null;
    return {
      level: sortedLevels[levelIndex],
      parentLevel: levelIndex > 0 ? sortedLevels[levelIndex - 1] : undefined,
    };
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentPhase) {
      case 'orgHierarchy':
        const orgStepData = currentSteps[currentStep];
        if (!orgStepData) return null;

        // Org Hierarchy Welcome Step
        if (orgStepData.id === 'welcome') {
          return (
            <OrgHierarchyStep1Welcome
              onGetStarted={handleOrgHierarchyWelcomeGetStarted}
            />
          );
        }

        // Template Selection Step
        if (orgStepData.id === 'template') {
          return (
            <OrgHierarchyStep0Template
              settings={settings}
              onSelectTemplate={handleTemplateSelect}
              onGetStarted={handleOrgHierarchyTemplateGetStarted}
            />
          );
        }

        // Customize Structure Step
        if (orgStepData.id === 'customize') {
          return (
            <OrgStructureDesigner
              settings={settings}
              onUpdate={handleUpdateSettings}
            />
          );
        }

        // Configure Level Steps (dynamic)
        if (orgStepData.id.startsWith('configure-')) {
          const levelInfo = getLevelForStep(orgStepData.id);
          if (levelInfo) {
            // Ensure categorization is synced before rendering
            const syncedCategorization = syncCategorizationWithSettings(categorization, settings);
            if (JSON.stringify(syncedCategorization) !== JSON.stringify(categorization)) {
              setCategorization(syncedCategorization);
            }
            return (
              <OrgHierarchyConfigureLevel
                level={levelInfo.level}
                parentLevel={levelInfo.parentLevel}
                categorization={syncedCategorization}
                onUpdateCategorization={handleUpdateCategorization}
              />
            );
          }
        }

        // Review Step
        if (orgStepData.id === 'review') {
          return (
            <OrgHierarchyStep5Review
              categorization={categorization}
              settings={settings}
            />
          );
        }

        return null;

      case 'jiraStandards':
        switch (currentStep) {
          case 0:
            return <JiraStandardsStep1Welcome onGetStarted={handleNext} />;
          case 1:
            return (
              <JiraStandardsStep2IssueTypes
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 2:
            return (
              <JiraStandardsStep2StaleThresholds
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 3:
            return (
              <JiraStandardsStep3SprintCadence
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 4:
            return (
              <JiraStandardsStep4DimensionPresets
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 5:
            return (
              <JiraStandardsStep5FieldHealth
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 6:
            return (
              <JiraStandardsStep6Workflows
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 7:
            return (
              <JiraStandardsStep7Estimation
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 8:
            return (
              <JiraStandardsStep8Blockers
                defaults={defaults}
                onUpdate={handleUpdateDefaults}
              />
            );
          case 9:
            return <JiraStandardsStep9Review defaults={defaults} />;
        }
        break;

      case 'teamAttributes':
        switch (currentStep) {
          case 0:
            return <TeamAttributesStep1Welcome onGetStarted={handleNext} />;
          case 1:
            return <TeamAttributesStep2SystemAttrs />;
          case 2:
            return (
              <TeamAttributesStep3CustomAttrs
                categorization={categorization}
                onUpdate={handleUpdateCategorization}
              />
            );
          case 3:
            return <TeamAttributesStep4Review categorization={categorization} />;
        }
        break;
    }

    return null;
  };

  // Render global welcome screen before any phase
  if (showGlobalWelcome) {
    return (
      <UnifiedSetupLayout
        currentPhase={currentPhase}
        currentStep={currentStep}
        phaseComplete={phaseComplete}
        onNext={handleGlobalWelcomeGetStarted}
        onBack={() => {}}
        isLastStep={false}
        isWelcomeStep={true}
        isGlobalWelcome={true}
        onSkipSetup={onSkipSetup}
      >
        <SetupWelcome onGetStarted={handleGlobalWelcomeGetStarted} />
      </UnifiedSetupLayout>
    );
  }

  return (
    <UnifiedSetupLayout
      currentPhase={currentPhase}
      currentStep={currentStep}
      phaseComplete={phaseComplete}
      stepLabel={!isWelcomeStep ? currentStepData?.label : undefined}
      stepDescription={!isWelcomeStep ? currentStepData?.description : undefined}
      onNext={handleNext}
      onBack={handleBack}
      isLastStep={isLastStep}
      isWelcomeStep={isWelcomeStep}
      onSkipSetup={onSkipSetup}
    >
      {renderStepContent()}
    </UnifiedSetupLayout>
  );
};

/**
 * Syncs the TeamAttributeConfig with the OrgStructureSettings.
 * Creates/updates org-structure type attributes to match customLevels.
 */
const syncCategorizationWithSettings = (
  categorization: TeamAttributeConfig,
  settings: OrgStructureSettings
): TeamAttributeConfig => {
  // If flat structure, remove org-structure attributes
  if (!settings.useHierarchy || settings.customLevels.length === 0) {
    const filteredAttributes = categorization.attributes.filter(
      (attr) => attr.type !== 'org-structure'
    );
    const filteredValues = categorization.attributeValues.filter(
      (val) => !categorization.attributes.find(
        (attr) => attr.id === val.attributeId && attr.type === 'org-structure'
      )
    );
    return {
      attributes: filteredAttributes,
      attributeValues: filteredValues,
      categories: filteredAttributes,
      categoryValues: filteredValues,
    };
  }

  // Create org-structure attributes from customLevels
  const sortedLevels = [...settings.customLevels].sort((a, b) => a.order - b.order);
  const existingOrgAttributes = categorization.attributes.filter(
    (attr) => attr.type === 'org-structure'
  );
  const nonOrgAttributes = categorization.attributes.filter(
    (attr) => attr.type !== 'org-structure'
  );

  // Build new org-structure attributes from levels using level ID
  const newOrgAttributes = sortedLevels.map((level, index) => {
    const attributeId = `cat-${level.id}`;
    const existingAttr = existingOrgAttributes.find((attr) => attr.id === attributeId);
    const parentLevelId = index > 0 ? `cat-${sortedLevels[index - 1].id}` : undefined;

    return {
      id: attributeId,
      name: level.name,
      description: `${level.name} grouping for teams`,
      type: 'org-structure' as const,
      color: level.color,
      isRequired: level.isMandatory,
      allowMultiple: false,
      parentAttributeId: parentLevelId,
      createdAt: existingAttr?.createdAt || new Date().toISOString(),
      createdBy: existingAttr?.createdBy || 'System',
    };
  });

  // Keep existing values that belong to still-existing attributes (by ID)
  const newAttributeIds = new Set(newOrgAttributes.map((a) => a.id));
  const existingValidValues = categorization.attributeValues.filter((val) => {
    const attr = categorization.attributes.find((a) => a.id === val.attributeId);
    if (!attr) return false;
    if (attr.type !== 'org-structure') return true;
    return newAttributeIds.has(val.attributeId);
  });

  const allAttributes = [...nonOrgAttributes, ...newOrgAttributes];

  return {
    attributes: allAttributes,
    attributeValues: existingValidValues,
    categories: allAttributes,
    categoryValues: existingValidValues,
  };
};

export default UnifiedSetupWizard;
