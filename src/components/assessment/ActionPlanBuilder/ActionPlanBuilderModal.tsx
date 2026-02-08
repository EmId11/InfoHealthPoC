import React from 'react';
import { DimensionResult } from '../../../types/assessment';
import { BuilderCommitPayload, ActionPlanBuilderModalProps } from '../../../types/actionPlanBuilder';
import { BuilderProvider, useBuilderContext } from './BuilderContext';
import BuilderStepper from './BuilderStepper';
import SelectAreasStep from './steps/SelectAreasStep';
import PrioritizeDimensionsStep from './steps/PrioritizeDimensionsStep';
import ChooseActionsStep from './steps/ChooseActionsStep';
import ConfirmStep from './steps/ConfirmStep';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import Button from '@atlaskit/button/standard-button';

interface BuilderContentProps {
  onClose: () => void;
}

const BuilderContent: React.FC<BuilderContentProps> = ({ onClose }) => {
  const { state, actions, computed } = useBuilderContext();

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <SelectAreasStep />;
      case 1:
        return <PrioritizeDimensionsStep />;
      case 2:
        return <ChooseActionsStep />;
      case 3:
        return <ConfirmStep />;
      default:
        return <SelectAreasStep />;
    }
  };

  const canProceed = () => {
    if (state.currentStep === 0) {
      // Step 1: Need at least one dimension selected
      return computed.selectedDimensionCount > 0;
    }
    if (state.currentStep === 2) {
      // Step 3: Need at least one action selected
      return computed.selectedActionCount > 0;
    }
    return true;
  };

  const getNextLabel = () => {
    switch (state.currentStep) {
      case 0: return 'Set Priorities';
      case 1: return 'Review Actions';
      case 2: return 'Review Plan';
      case 3: return 'Launch Plan';
      default: return 'Next';
    }
  };

  const handleNext = () => {
    if (state.currentStep === 3) {
      actions.commit();
      onClose();
    } else {
      actions.nextStep();
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Build Your Improvement Plan</h1>
            <p style={styles.subtitle}>
              Create a personalized plan to improve your Jira health
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" />
          </button>
        </div>

        {/* Stepper */}
        <BuilderStepper currentStep={state.currentStep} />

        {/* Content */}
        <div style={styles.content}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerLeft}>
            {state.currentStep > 0 && (
              <Button appearance="subtle" onClick={actions.prevStep}>
                Back
              </Button>
            )}
          </div>
          <div style={styles.footerRight}>
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleNext}
              isDisabled={!canProceed()}
            >
              {getNextLabel()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionPlanBuilderModal: React.FC<ActionPlanBuilderModalProps> = ({
  isOpen,
  onClose,
  dimensions,
  onCommit,
}) => {
  if (!isOpen) return null;

  return (
    <BuilderProvider dimensions={dimensions} onCommit={onCommit} onClose={onClose}>
      <BuilderContent onClose={onClose} />
    </BuilderProvider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90vw',
    maxWidth: '1000px',
    height: '85vh',
    maxHeight: '800px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #E4E6EB',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

export default ActionPlanBuilderModal;
