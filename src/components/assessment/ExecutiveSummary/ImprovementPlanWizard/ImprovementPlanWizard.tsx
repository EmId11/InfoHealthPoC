import React, { useState, useCallback, useMemo } from 'react';
import { AssessmentResult } from '../../../../types/assessment';
import { calculateAllOutcomeConfidences } from '../../../../utils/outcomeConfidenceCalculation';
import {
  ImprovementPlan,
  ImprovementPlanWizardState,
  createEmptyWizardState,
  OutcomePriority,
} from '../../../../types/improvementPlan';
import {
  generateOutcomeGroupedPlays,
  createOptimizationTargets,
  createPlanPlaysFromGroups,
  createImprovementPlan,
  generateDefaultPlanName,
} from '../../../../utils/improvementPlanUtils';
import Step1_SelectTargets from './Step1_SelectTargets';
import Step2_ReviewPlays from './Step2_ReviewPlays';
import Step3_Confirm from './Step3_Confirm';

interface ImprovementPlanWizardProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentResult: AssessmentResult;
  onPlanCreated: (plan: ImprovementPlan) => void;
}

const ImprovementPlanWizard: React.FC<ImprovementPlanWizardProps> = ({
  isOpen,
  onClose,
  assessmentResult,
  onPlanCreated,
}) => {
  // Extract what we need from assessment result
  const dimensions = assessmentResult.dimensions;
  const teamId = assessmentResult.teamId;
  const outcomeConfidence = useMemo(
    () => calculateAllOutcomeConfidences(dimensions),
    [dimensions]
  );
  const [wizardState, setWizardState] = useState<ImprovementPlanWizardState>(createEmptyWizardState);

  // Get outcomes from the confidence summary
  const outcomes = outcomeConfidence?.outcomes || [];

  // Reset wizard state when opened
  React.useEffect(() => {
    if (isOpen) {
      setWizardState(createEmptyWizardState());
    }
  }, [isOpen]);

  // Navigation handlers
  const goToStep = useCallback((step: 1 | 2 | 3) => {
    setWizardState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const handleNext = useCallback(() => {
    setWizardState(prev => {
      const nextStep = Math.min(3, prev.currentStep + 1) as 1 | 2 | 3;

      // When moving from step 1 to step 2, generate grouped plays
      if (prev.currentStep === 1 && nextStep === 2) {
        const { outcomeGroups, allPlays } = generateOutcomeGroupedPlays(
          prev.step1.selectedOutcomes,
          dimensions
        );
        return {
          ...prev,
          currentStep: nextStep,
          step2: { suggestedPlays: allPlays, outcomeGroups },
        };
      }

      // When moving from step 2 to step 3, generate default plan name
      if (prev.currentStep === 2 && nextStep === 3) {
        const targets = createOptimizationTargets(
          prev.step1.selectedOutcomes,
          [], // No dimension selection in new flow
          outcomes,
          dimensions
        );
        const defaultName = generateDefaultPlanName(targets);
        return {
          ...prev,
          currentStep: nextStep,
          step3: { planName: defaultName },
        };
      }

      return { ...prev, currentStep: nextStep };
    });
  }, [dimensions, outcomes]);

  const handleBack = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3,
    }));
  }, []);

  // Step 1 handlers - combined selection and prioritization
  const handleOutcomesChange = useCallback((orderedOutcomes: string[]) => {
    setWizardState(prev => ({
      ...prev,
      step1: {
        ...prev.step1,
        selectedOutcomes: orderedOutcomes,
      },
    }));
  }, []);

  // Step 2 handlers
  const handlePlayToggle = useCallback((playId: string) => {
    setWizardState(prev => ({
      ...prev,
      step2: {
        ...prev.step2,
        suggestedPlays: prev.step2.suggestedPlays.map(p =>
          p.playId === playId ? { ...p, isSelected: !p.isSelected } : p
        ),
      },
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      step2: {
        ...prev.step2,
        suggestedPlays: prev.step2.suggestedPlays.map(p => ({ ...p, isSelected: true })),
      },
    }));
  }, []);

  const handleClearAll = useCallback(() => {
    setWizardState(prev => ({
      ...prev,
      step2: {
        ...prev.step2,
        suggestedPlays: prev.step2.suggestedPlays.map(p => ({ ...p, isSelected: false })),
      },
    }));
  }, []);

  // Step 3 handlers
  const handleNameChange = useCallback((name: string) => {
    setWizardState(prev => ({
      ...prev,
      step3: { planName: name },
    }));
  }, []);

  // Create plan handler
  const handleCreatePlan = useCallback(() => {
    // Create optimization targets (outcomes only in new flow)
    const targets = createOptimizationTargets(
      wizardState.step1.selectedOutcomes,
      [], // No dimension selection in new flow
      outcomes,
      dimensions
    );

    // Create outcome priorities
    const outcomePriorities: OutcomePriority[] = wizardState.step1.selectedOutcomes.map(
      (outcomeId, index) => ({
        outcomeId,
        priority: index + 1,
      })
    );

    // Create plan plays from outcome groups
    const planPlays = createPlanPlaysFromGroups(
      wizardState.step2.outcomeGroups,
      wizardState.step2.suggestedPlays
    );

    // Create the plan
    const plan = createImprovementPlan(
      wizardState.step3.planName || 'Improvement Plan',
      targets,
      planPlays,
      teamId,
      outcomePriorities
    );

    onPlanCreated(plan);
    onClose();
  }, [wizardState, outcomes, dimensions, teamId, onPlanCreated, onClose]);

  // Check if we can proceed from current step
  const canProceed = useMemo(() => {
    switch (wizardState.currentStep) {
      case 1:
        return wizardState.step1.selectedOutcomes.length > 0;
      case 2:
        return wizardState.step2.suggestedPlays.some(p => p.isSelected);
      case 3:
        return wizardState.step3.planName.trim().length > 0;
      default:
        return false;
    }
  }, [wizardState]);

  // Get step title
  const getStepTitle = () => {
    switch (wizardState.currentStep) {
      case 1: return 'Select & Prioritize Outcomes';
      case 2: return 'Review Your Improvement Plan';
      case 3: return 'Launch Your Plan';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.stepIndicator}>Step {wizardState.currentStep} of 3</span>
            <h2 style={styles.title}>{getStepTitle()}</h2>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5l-10 10" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(wizardState.currentStep / 3) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {wizardState.currentStep === 1 && (
            <Step1_SelectTargets
              outcomes={outcomes}
              selectedOutcomes={wizardState.step1.selectedOutcomes}
              onOutcomesChange={handleOutcomesChange}
            />
          )}
          {wizardState.currentStep === 2 && (
            <Step2_ReviewPlays
              outcomeGroups={wizardState.step2.outcomeGroups}
              allPlays={wizardState.step2.suggestedPlays}
              onPlayToggle={handlePlayToggle}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          )}
          {wizardState.currentStep === 3 && (
            <Step3_Confirm
              planName={wizardState.step3.planName}
              onNameChange={handleNameChange}
              outcomeGroups={wizardState.step2.outcomeGroups}
              allPlays={wizardState.step2.suggestedPlays}
            />
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.backButton}
            onClick={wizardState.currentStep === 1 ? onClose : handleBack}
          >
            {wizardState.currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            style={{
              ...styles.nextButton,
              opacity: canProceed ? 1 : 0.5,
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
            onClick={wizardState.currentStep === 3 ? handleCreatePlan : handleNext}
            disabled={!canProceed}
          >
            {wizardState.currentStep === 3 ? 'Create Plan' : 'Continue'}
          </button>
        </div>
      </div>
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    zIndex: 1000,
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '720px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 40px rgba(9, 30, 66, 0.25)',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  stepIndicator: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  progressContainer: {
    padding: '0 24px',
  },
  progressBar: {
    height: '3px',
    backgroundColor: '#EBECF0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5243AA',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflow: 'auto',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  nextButton: {
    padding: '10px 24px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

export default ImprovementPlanWizard;
