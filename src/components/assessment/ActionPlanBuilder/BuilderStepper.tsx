import React from 'react';
import { BUILDER_STEPS } from '../../../types/actionPlanBuilder';
import CheckIcon from '@atlaskit/icon/glyph/check';

interface BuilderStepperProps {
  currentStep: number;
}

const BuilderStepper: React.FC<BuilderStepperProps> = ({ currentStep }) => {
  return (
    <div style={styles.container}>
      {BUILDER_STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === BUILDER_STEPS.length - 1;

        return (
          <React.Fragment key={step.number}>
            <div style={styles.stepItem}>
              <div
                style={{
                  ...styles.stepCircle,
                  ...(isActive ? styles.stepCircleActive : {}),
                  ...(isCompleted ? styles.stepCircleCompleted : {}),
                }}
              >
                {isCompleted ? (
                  <CheckIcon label="" size="small" primaryColor="#FFFFFF" />
                ) : (
                  <span style={{
                    ...styles.stepNumber,
                    ...(isActive ? styles.stepNumberActive : {}),
                  }}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div style={styles.stepContent}>
                <span
                  style={{
                    ...styles.stepTitle,
                    ...(isActive ? styles.stepTitleActive : {}),
                    ...(isCompleted ? styles.stepTitleCompleted : {}),
                  }}
                >
                  {step.title}
                </span>
                {isActive && (
                  <span style={styles.stepDescription}>{step.description}</span>
                )}
              </div>
            </div>
            {!isLast && (
              <div
                style={{
                  ...styles.connector,
                  ...(isCompleted ? styles.connectorCompleted : {}),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    padding: '16px 24px',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #E4E6EB',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    border: '2px solid #DFE1E6',
    flexShrink: 0,
  },
  stepCircleActive: {
    backgroundColor: '#0052CC',
    border: '2px solid #0052CC',
  },
  stepCircleCompleted: {
    backgroundColor: '#36B37E',
    border: '2px solid #36B37E',
  },
  stepNumber: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stepTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  stepTitleActive: {
    color: '#172B4D',
    fontWeight: 600,
  },
  stepTitleCompleted: {
    color: '#36B37E',
  },
  stepDescription: {
    fontSize: '11px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  connector: {
    flex: 1,
    height: '2px',
    backgroundColor: '#DFE1E6',
    margin: '0 12px',
    marginTop: '13px',
    minWidth: '24px',
  },
  connectorCompleted: {
    backgroundColor: '#36B37E',
  },
};

export default BuilderStepper;
