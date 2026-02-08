import React, { useState, useMemo, useCallback } from 'react';
import AdminSetupWizardLayout from '../AdminSetupWizardLayout';
import OrgHierarchyStep0Template from './OrgHierarchyStep0Template';
import OrgStructureDesigner from './OrgStructureDesigner';
import OrgHierarchyConfigureLevel from './OrgHierarchyConfigureLevel';
import OrgHierarchyStep5Review from './OrgHierarchyStep5Review';
import { TeamAttributeConfig, OrgStructureSettings, StructureTemplateId, OrgHierarchyLevel } from '../../../../types/admin';
import { WizardStep } from '../../../../types/adminSetup';
import { STRUCTURE_TEMPLATES } from './OrgStructureDesigner/constants';

interface OrgHierarchyWizardProps {
  initialCategorization: TeamAttributeConfig;
  initialSettings: OrgStructureSettings;
  initialStep?: number;
  onSaveExit: (categorization: TeamAttributeConfig, settings: OrgStructureSettings, currentStep: number) => void;
  onFinish: (categorization: TeamAttributeConfig, settings: OrgStructureSettings) => void;
  onBack: () => void;
}

const OrgHierarchyWizard: React.FC<OrgHierarchyWizardProps> = ({
  initialCategorization,
  initialSettings,
  initialStep = 0,
  onSaveExit,
  onFinish,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [categorization, setCategorization] = useState<TeamAttributeConfig>(initialCategorization);
  const [settings, setSettings] = useState<OrgStructureSettings>(initialSettings);

  // Sorted levels for consistent ordering
  const sortedLevels = useMemo(
    () => [...settings.customLevels].sort((a, b) => a.order - b.order),
    [settings.customLevels]
  );

  // Generate dynamic steps based on the structure configuration
  const wizardSteps = useMemo((): WizardStep[] => {
    const steps: WizardStep[] = [
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
  }, [settings.useHierarchy, sortedLevels]);

  // Handle template selection (called from Step 0)
  const handleTemplateSelect = useCallback((templateId: StructureTemplateId) => {
    const template = STRUCTURE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const isFlat = templateId === 'flat';
    const isCustom = templateId === 'custom';

    // Generate completely fresh levels with new unique IDs to fix the bug
    // where old level data persisted after template change
    const newLevels: OrgHierarchyLevel[] = isCustom
      ? settings.customLevels
      : template.defaultLevels.map((level, index) => ({
          ...level,
          id: `level-${Date.now()}-${index}`, // Unique ID per selection
        }));

    setSettings({
      ...settings,
      useHierarchy: !isFlat,
      structureTemplate: templateId,
      customLevels: newLevels,
    });

    // Also sync categorization to remove old org-structure attributes when template changes
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
  }, [settings, categorization]);

  // Handle "Get Started" from Step 0
  const handleStep0GetStarted = useCallback(() => {
    if (settings.structureTemplate === 'flat') {
      // Skip to review for flat structure
      setCurrentStep(wizardSteps.length - 1);
    } else {
      setCurrentStep(1);
    }
  }, [settings.structureTemplate, wizardSteps.length]);

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleSaveExit = () => {
    onSaveExit(categorization, settings, currentStep);
  };

  const handleFinish = () => {
    // Sync the categorization with the new settings structure
    const updatedCategorization = syncCategorizationWithSettings(categorization, settings);
    onFinish(updatedCategorization, settings);
  };

  const handleUpdateSettings = (updates: Partial<OrgStructureSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdateCategorization = (config: TeamAttributeConfig) => {
    setCategorization(config);
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

  const renderStepContent = () => {
    const currentStepData = wizardSteps[currentStep];
    if (!currentStepData) return null;

    // Step 0: Template Selection
    if (currentStepData.id === 'template') {
      return (
        <OrgHierarchyStep0Template
          settings={settings}
          onSelectTemplate={handleTemplateSelect}
          onGetStarted={handleStep0GetStarted}
        />
      );
    }

    // Customize Structure Step
    if (currentStepData.id === 'customize') {
      return (
        <OrgStructureDesigner
          settings={settings}
          onUpdate={handleUpdateSettings}
        />
      );
    }

    // Configure Level Steps (dynamic)
    if (currentStepData.id.startsWith('configure-')) {
      const levelInfo = getLevelForStep(currentStepData.id);
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
    if (currentStepData.id === 'review') {
      return (
        <OrgHierarchyStep5Review
          categorization={categorization}
          settings={settings}
        />
      );
    }

    return null;
  };

  return (
    <AdminSetupWizardLayout
      title="Organization Hierarchy Setup"
      subtitle="Configure team groupings"
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onStepChange={handleStepChange}
      onSaveExit={handleSaveExit}
      onFinish={handleFinish}
    >
      {renderStepContent()}
    </AdminSetupWizardLayout>
  );
};

/**
 * Syncs the TeamAttributeConfig with the OrgStructureSettings.
 * Creates/updates org-structure type attributes to match customLevels.
 *
 * IMPORTANT: This function now uses level ID, not name matching, to fix the bug
 * where old level names persisted after template changes (e.g., "Division" persisting
 * after switching to a template with "Portfolio").
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

  // Build new org-structure attributes from levels
  // Use deterministic ID from level ID, not name matching
  const newOrgAttributes = sortedLevels.map((level, index) => {
    // The attribute ID is derived from level ID for consistency
    const attributeId = `cat-${level.id}`;

    // Try to find existing attribute by ID (not by name - this was the bug)
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
    if (!attr) return false; // Remove orphaned values
    if (attr.type !== 'org-structure') return true; // Keep non-org values
    return newAttributeIds.has(val.attributeId); // Keep org values only if attribute still exists
  });

  const allAttributes = [...nonOrgAttributes, ...newOrgAttributes];

  return {
    attributes: allAttributes,
    attributeValues: existingValidValues,
    categories: allAttributes,
    categoryValues: existingValidValues,
  };
};

export default OrgHierarchyWizard;
