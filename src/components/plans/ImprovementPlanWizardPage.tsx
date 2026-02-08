// ImprovementPlanWizardPage - Full-page wizard for creating improvement plans
// Replaces the modal-based wizard with a full-page experience

import React, { useState, useCallback, useMemo } from 'react';
import { AssessmentResult } from '../../types/assessment';
import { calculateAllOutcomeConfidences } from '../../utils/outcomeConfidenceCalculation';
import {
  ImprovementPlan,
  ImprovementPlanWizardState,
  createEmptyWizardState,
  OutcomePriority,
} from '../../types/improvementPlan';
import {
  generateOutcomeGroupedPlays,
  createOptimizationTargets,
  createPlanPlaysFromGroups,
  createImprovementPlan,
  generateDefaultPlanName,
} from '../../utils/improvementPlanUtils';
import Step1_SelectTargets from '../assessment/ExecutiveSummary/ImprovementPlanWizard/Step1_SelectTargets';
import Step2_ReviewPlays from '../assessment/ExecutiveSummary/ImprovementPlanWizard/Step2_ReviewPlays';
import Step3_Confirm from '../assessment/ExecutiveSummary/ImprovementPlanWizard/Step3_Confirm';

interface ImprovementPlanWizardPageProps {
  assessmentResult: AssessmentResult;
  onPlanCreated: (plan: ImprovementPlan) => void;
  onCancel: () => void;
}

const STEP_LABELS = [
  'Select Outcomes',
  'Review Plays',
  'Confirm',
];

const ImprovementPlanWizardPage: React.FC<ImprovementPlanWizardPageProps> = ({
  assessmentResult,
  onPlanCreated,
  onCancel,
}) => {
  const dimensions = assessmentResult.dimensions;
  const teamId = assessmentResult.teamId;
  const outcomeConfidence = useMemo(
    () => calculateAllOutcomeConfidences(dimensions),
    [dimensions]
  );

  const [wizardState, setWizardState] = useState<ImprovementPlanWizardState>(createEmptyWizardState);
  const outcomes = outcomeConfidence?.outcomes || [];

  // Navigation handlers
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
          [],
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

  const handleStepChange = useCallback((step: number) => {
    // Only allow navigating to completed steps or current + 1
    if (step <= wizardState.currentStep || step === wizardState.currentStep + 1) {
      if (step === 2 && wizardState.currentStep === 1) {
        // Need to generate plays when jumping to step 2
        handleNext();
      } else if (step <= wizardState.currentStep) {
        setWizardState(prev => ({
          ...prev,
          currentStep: step as 1 | 2 | 3,
        }));
      }
    }
  }, [wizardState.currentStep, handleNext]);

  // Step 1 handlers
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
    const targets = createOptimizationTargets(
      wizardState.step1.selectedOutcomes,
      [],
      outcomes,
      dimensions
    );

    const outcomePriorities: OutcomePriority[] = wizardState.step1.selectedOutcomes.map(
      (outcomeId, index) => ({
        outcomeId,
        priority: index + 1,
      })
    );

    const planPlays = createPlanPlaysFromGroups(
      wizardState.step2.outcomeGroups,
      wizardState.step2.suggestedPlays
    );

    const plan = createImprovementPlan(
      wizardState.step3.planName || 'Improvement Plan',
      targets,
      planPlays,
      teamId,
      outcomePriorities
    );

    onPlanCreated(plan);
  }, [wizardState, outcomes, dimensions, teamId, onPlanCreated]);

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

  // Render current step content
  const renderStepContent = () => {
    switch (wizardState.currentStep) {
      case 1:
        return (
          <Step1_SelectTargets
            outcomes={outcomes}
            selectedOutcomes={wizardState.step1.selectedOutcomes}
            onOutcomesChange={handleOutcomesChange}
          />
        );
      case 2:
        return (
          <Step2_ReviewPlays
            outcomeGroups={wizardState.step2.outcomeGroups}
            allPlays={wizardState.step2.suggestedPlays}
            onPlayToggle={handlePlayToggle}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        );
      case 3:
        return (
          <Step3_Confirm
            planName={wizardState.step3.planName}
            onNameChange={handleNameChange}
            outcomeGroups={wizardState.step2.outcomeGroups}
            allPlays={wizardState.step2.suggestedPlays}
          />
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logoArea}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="#5243AA" />
                <path d="M9 14L12 17L19 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={styles.logoText}>Improvement Plan</span>
            </div>
          </div>
          <div style={styles.headerCenter}>
            <span style={styles.teamName}>{assessmentResult.teamName}</span>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div style={styles.main}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <nav style={styles.stepNav}>
            {STEP_LABELS.map((label, index) => {
              const stepNum = index + 1;
              const isActive = wizardState.currentStep === stepNum;
              const isCompleted = wizardState.currentStep > stepNum;
              const isClickable = stepNum <= wizardState.currentStep;

              return (
                <button
                  key={label}
                  style={{
                    ...styles.stepItem,
                    ...(isActive ? styles.stepItemActive : {}),
                    ...(isCompleted ? styles.stepItemCompleted : {}),
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: isClickable ? 1 : 0.5,
                  }}
                  onClick={() => isClickable && handleStepChange(stepNum)}
                  disabled={!isClickable}
                >
                  <div
                    style={{
                      ...styles.stepNumber,
                      ...(isActive ? styles.stepNumberActive : {}),
                      ...(isCompleted ? styles.stepNumberCompleted : {}),
                    }}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    style={{
                      ...styles.stepLabel,
                      ...(isActive ? styles.stepLabelActive : {}),
                    }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar help section */}
          <div style={styles.sidebarHelp}>
            <div style={styles.helpIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#5243AA" strokeWidth="1.5" />
                <path d="M10 7v3M10 12v1" stroke="#5243AA" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={styles.helpContent}>
              <span style={styles.helpTitle}>Need help?</span>
              <span style={styles.helpText}>
                Select outcomes to focus on, then review and customize the suggested plays.
              </span>
            </div>
          </div>
        </aside>

        {/* Content area */}
        <div style={styles.content}>
          {/* Step header */}
          <div style={styles.stepHeader}>
            <span style={styles.stepIndicator}>Step {wizardState.currentStep} of 3</span>
            <h1 style={styles.stepTitle}>{getStepTitle()}</h1>
          </div>

          {/* Step content */}
          <div style={styles.stepContent}>
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <button
            style={styles.backButton}
            onClick={wizardState.currentStep === 1 ? onCancel : handleBack}
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
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#F4F5F7',
  },
  // Header
  header: {
    backgroundColor: '#5243AA',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  headerCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  teamName: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 500,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  cancelButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Main content
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  // Sidebar
  sidebar: {
    width: '260px',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E4E6EB',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 0',
  },
  stepNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 16px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  stepItemActive: {
    backgroundColor: '#F4F0FF',
  },
  stepItemCompleted: {
    // No additional styles needed
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: '#DFE1E6',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    flexShrink: 0,
  },
  stepNumberActive: {
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
  },
  stepNumberCompleted: {
    backgroundColor: '#36B37E',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: '14px',
    color: '#6B778C',
    fontWeight: 500,
  },
  stepLabelActive: {
    color: '#172B4D',
    fontWeight: 600,
  },
  sidebarHelp: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    margin: '0 16px',
    backgroundColor: '#F4F0FF',
    borderRadius: '8px',
  },
  helpIcon: {
    flexShrink: 0,
  },
  helpContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  helpTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  helpText: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  // Content area
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '32px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  stepHeader: {
    marginBottom: '24px',
  },
  stepIndicator: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#5243AA',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'block',
  },
  stepTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepContent: {
    flex: 1,
  },
  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E4E6EB',
    padding: '16px 0',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 32px',
    width: '100%',
    boxSizing: 'border-box',
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

export default ImprovementPlanWizardPage;
