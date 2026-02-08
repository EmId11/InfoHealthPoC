import React, { useState } from 'react';
import AdminSetupWizardLayout from '../AdminSetupWizardLayout';
import TeamAttributesStep1Welcome from './TeamAttributesStep1Welcome';
import TeamAttributesStep2SystemAttrs from './TeamAttributesStep2SystemAttrs';
import TeamAttributesStep3CustomAttrs from './TeamAttributesStep3CustomAttrs';
import TeamAttributesStep4Review from './TeamAttributesStep4Review';
import { TeamAttributeConfig } from '../../../../types/admin';
import { TEAM_ATTRIBUTES_STEPS } from '../../../../types/adminSetup';

interface TeamAttributesWizardProps {
  initialCategorization: TeamAttributeConfig;
  initialStep?: number;
  onSaveExit: (categorization: TeamAttributeConfig, currentStep: number) => void;
  onFinish: (categorization: TeamAttributeConfig) => void;
  onBack: () => void;
}

const TeamAttributesWizard: React.FC<TeamAttributesWizardProps> = ({
  initialCategorization,
  initialStep = 0,
  onSaveExit,
  onFinish,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [categorization, setCategorization] = useState<TeamAttributeConfig>(initialCategorization);

  const handleNext = () => {
    if (currentStep < TEAM_ATTRIBUTES_STEPS.length - 1) {
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
    onSaveExit(categorization, currentStep);
  };

  const handleFinish = () => {
    onFinish(categorization);
  };

  const handleUpdateCategorization = (config: TeamAttributeConfig) => {
    setCategorization(config);
  };

  const renderStepContent = () => {
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
      default:
        return null;
    }
  };

  return (
    <AdminSetupWizardLayout
      title="Team Attributes Setup"
      subtitle="Configure team categorizations"
      steps={TEAM_ATTRIBUTES_STEPS}
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

export default TeamAttributesWizard;
