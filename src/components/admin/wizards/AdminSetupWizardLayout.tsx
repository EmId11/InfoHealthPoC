import React from 'react';
import Button from '@atlaskit/button/standard-button';
import { PersonaSwitcher } from '../../persona';
import { WizardStep } from '../../../types/adminSetup';

interface AdminSetupWizardLayoutProps {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  currentStep: number; // 0 = welcome, 1+ = actual steps
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onStepChange: (step: number) => void;
  onSaveExit: () => void;
  onFinish: () => void;
}

const AdminSetupWizardLayout: React.FC<AdminSetupWizardLayoutProps> = ({
  title,
  subtitle,
  steps,
  currentStep,
  children,
  onNext,
  onBack,
  onStepChange,
  onSaveExit,
  onFinish,
}) => {
  const isWelcome = currentStep === 0;
  const displayStep = currentStep;
  const totalSteps = steps.length;
  const isLastStep = displayStep === totalSteps - 1;
  const progress = isWelcome ? 0 : (displayStep / (totalSteps - 1)) * 100;

  const currentStepData = steps[currentStep];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="adminLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6554C0" />
                    <stop offset="100%" stopColor="#5243AA" />
                  </linearGradient>
                </defs>
                <rect width="36" height="36" rx="8" fill="url(#adminLogoGradient)" />
                <path d="M10 26L18 10L26 26H10Z" fill="white" opacity="0.9" />
                <circle cx="18" cy="20" r="2.5" fill="white" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>{title}</h1>
              {subtitle && <span style={styles.teamIndicator}>{subtitle}</span>}
            </div>
          </div>
          <div style={styles.headerActions}>
            <PersonaSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={isWelcome ? styles.contentWrapper : styles.contentWithSidebar}>
          {/* Steps Sidebar - only show after welcome */}
          {!isWelcome && (
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <span style={styles.sidebarTitle}>Setup Steps</span>
                <span style={styles.sidebarProgress}>{displayStep} of {totalSteps - 1}</span>
              </div>
              <div style={styles.sidebarProgressBar}>
                <div style={{ ...styles.sidebarProgressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.stepsList}>
                {steps.slice(1).map((step, index) => {
                  const stepNum = index + 1;
                  const isCompleted = stepNum < displayStep;
                  const isCurrent = stepNum === displayStep;
                  const isUpcoming = stepNum > displayStep;
                  const isClickable = stepNum <= displayStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => isClickable && onStepChange(stepNum)}
                      disabled={isUpcoming}
                      style={{
                        ...styles.stepItem,
                        ...(isCurrent ? styles.stepItemCurrent : {}),
                        ...(isCompleted ? styles.stepItemCompleted : {}),
                        ...(isUpcoming ? styles.stepItemUpcoming : {}),
                      }}
                    >
                      <span style={{
                        ...styles.stepIcon,
                        ...(isCurrent ? styles.stepIconCurrent : {}),
                        ...(isCompleted ? styles.stepIconCompleted : {}),
                      }}>
                        {isCompleted ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          stepNum
                        )}
                      </span>
                      <span style={styles.stepLabel}>{step.label}</span>
                      {isCurrent && <span style={styles.currentIndicator} />}
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* Main Content Card */}
          <div style={isWelcome ? styles.welcomeCard : styles.mainContentArea}>
            <div style={isWelcome ? undefined : styles.contentCard}>
              {/* Step header for non-welcome steps */}
              {!isWelcome && currentStepData && (
                <div style={styles.stepHeader}>
                  <h2 style={styles.stepTitle}>{currentStepData.label}</h2>
                  {currentStepData.description && (
                    <p style={styles.stepDescription}>{currentStepData.description}</p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation - show on all steps including welcome */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <Button appearance="subtle" onClick={onBack}>
              {isWelcome ? 'Cancel' : 'Back'}
            </Button>
            {!isWelcome && (
              <Button appearance="subtle" onClick={onSaveExit}>
                Save & Exit
              </Button>
            )}
          </div>
          <div>
            {isLastStep ? (
              <Button appearance="primary" onClick={onFinish} style={styles.primaryButton}>
                Finish Setup
              </Button>
            ) : !isWelcome ? (
              <Button appearance="primary" onClick={onNext} style={styles.primaryButton}>
                Continue
              </Button>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F7F8F9',
  },
  header: {
    background: 'linear-gradient(135deg, #5243AA 0%, #6554C0 100%)',
    padding: '16px 32px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  teamIndicator: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  main: {
    flex: 1,
    padding: '32px',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  contentWithSidebar: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    gap: '24px',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    padding: '20px 16px',
    height: 'fit-content',
    position: 'sticky' as const,
    top: '32px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sidebarTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sidebarProgress: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  sidebarProgressBar: {
    height: '4px',
    backgroundColor: '#EBECF0',
    borderRadius: '2px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  sidebarProgressFill: {
    height: '100%',
    backgroundColor: '#6554C0',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  stepItemCurrent: {
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    fontWeight: 600,
  },
  stepItemCompleted: {
    color: '#172B4D',
    cursor: 'pointer',
  },
  stepItemUpcoming: {
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
  stepIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    flexShrink: 0,
  },
  stepIconCurrent: {
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
  },
  stepIconCompleted: {
    backgroundColor: '#E3FCEF',
    color: '#00875A',
  },
  stepLabel: {
    flex: 1,
  },
  currentIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#6554C0',
  },
  mainContentArea: {
    flex: 1,
    minWidth: 0,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    padding: '32px',
    minHeight: '400px',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    padding: '40px',
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #EBECF0',
  },
  stepTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDescription: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E6E8EB',
    padding: '16px 32px',
  },
  footerContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  primaryButton: {
    backgroundColor: '#6554C0',
  },
};

export default AdminSetupWizardLayout;
