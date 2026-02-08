import React, { useState } from 'react';
import AdminSetupWizardLayout from '../AdminSetupWizardLayout';
import JiraStandardsStep1Welcome from './JiraStandardsStep1Welcome';
import JiraStandardsStep2IssueTypes from './JiraStandardsStep2IssueTypes';
import JiraStandardsStep2StaleThresholds from './JiraStandardsStep2StaleThresholds';
import JiraStandardsStep3SprintCadence from './JiraStandardsStep3SprintCadence';
import JiraStandardsStep4DimensionPresets from './JiraStandardsStep4DimensionPresets';
import JiraStandardsStep5FieldHealth from './JiraStandardsStep5FieldHealth';
import JiraStandardsStep6Workflows from './JiraStandardsStep6Workflows';
import JiraStandardsStep7Estimation from './JiraStandardsStep7Estimation';
import JiraStandardsStep8Blockers from './JiraStandardsStep8Blockers';
import JiraStandardsStep9Review from './JiraStandardsStep9Review';
import { OrganizationDefaults } from '../../../../types/admin';
import { JIRA_STANDARDS_STEPS } from '../../../../types/adminSetup';

interface JiraStandardsWizardProps {
  initialDefaults: OrganizationDefaults;
  initialStep?: number;
  onSaveExit: (defaults: OrganizationDefaults, currentStep: number) => void;
  onFinish: (defaults: OrganizationDefaults) => void;
  onBack: () => void;
}

const JiraStandardsWizard: React.FC<JiraStandardsWizardProps> = ({
  initialDefaults,
  initialStep = 0,
  onSaveExit,
  onFinish,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [defaults, setDefaults] = useState<OrganizationDefaults>(initialDefaults);

  const handleNext = () => {
    if (currentStep < JIRA_STANDARDS_STEPS.length - 1) {
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
    onSaveExit(defaults, currentStep);
  };

  const handleFinish = () => {
    onFinish(defaults);
  };

  const handleUpdateDefaults = (updates: Partial<OrganizationDefaults>) => {
    setDefaults((prev) => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
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
      default:
        return null;
    }
  };

  return (
    <AdminSetupWizardLayout
      title="Jira Standards Setup"
      subtitle="Configure organization-wide defaults"
      steps={JIRA_STANDARDS_STEPS}
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

export default JiraStandardsWizard;
