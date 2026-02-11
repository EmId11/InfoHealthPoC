import React from 'react';
import Button from '@atlaskit/button/standard-button';
import { PersonaSwitcher } from './persona';

interface WizardLayoutProps {
  currentStep: number; // 0 = welcome, 1-n = actual steps
  totalSteps: number; // Number of actual steps (doesn't count welcome)
  onNext: () => void;
  onBack: () => void;
  onStepChange: (step: number) => void;
  onFinish: () => void;
  onSaveDraft?: () => void;
  onExit?: () => void;
  teamName: string;
  children: React.ReactNode;
  stepLabels?: string[]; // Optional custom step labels (for dynamic steps)
}

const defaultStepLabels = [
  'Basics',
  'Issue Types',
  'Field Selection',
  'Review',
];

const WizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onStepChange,
  onFinish,
  onSaveDraft,
  onExit,
  teamName,
  children,
  stepLabels,
}) => {
  const isWelcome = currentStep === 0;
  const displayStep = currentStep; // 1-based for display
  const isLastStep = displayStep === totalSteps;
  const progress = isWelcome ? 0 : ((displayStep - 1) / (totalSteps - 1)) * 100;
  const labels = stepLabels || defaultStepLabels;
  const headerTitle = 'TicketReady Assessment';

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0065FF" />
                    <stop offset="100%" stopColor="#0052CC" />
                  </linearGradient>
                </defs>
                <rect width="36" height="36" rx="8" fill="url(#logoGradient)" />
                <path d="M10 26L18 10L26 26H10Z" fill="white" opacity="0.9" />
                <circle cx="18" cy="20" r="2.5" fill="white" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>{headerTitle}</h1>
              {!isWelcome && teamName && (
                <span style={styles.teamIndicator}>{teamName}</span>
              )}
            </div>
          </div>
          {/* Header Actions */}
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
                <span style={styles.sidebarProgress}>{displayStep} of {totalSteps}</span>
              </div>
              <div style={styles.sidebarProgressBar}>
                <div style={{ ...styles.sidebarProgressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.stepsList}>
                {labels.map((label, index) => {
                  const stepNum = index + 1;
                  const isCompleted = stepNum < displayStep;
                  const isCurrent = stepNum === displayStep;
                  const isUpcoming = stepNum > displayStep;
                  const isClickable = stepNum <= displayStep;
                  const handleStepClick = () => {
                    if (isClickable) {
                      onStepChange(stepNum);
                    }
                  };

                  return (
                    <button
                      key={stepNum}
                      onClick={handleStepClick}
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
                      <span style={styles.stepLabel}>{label}</span>
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
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation - hide on welcome */}
      {!isWelcome && (
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLeft}>
              <Button appearance="subtle" onClick={onBack}>
                Back
              </Button>
              {onSaveDraft && (
                <Button appearance="subtle" onClick={onSaveDraft}>
                  Save & Exit
                </Button>
              )}
            </div>
            <div>
              {isLastStep ? (
                <Button appearance="primary" onClick={onFinish}>
                  Run Assessment
                </Button>
              ) : (
                <Button appearance="primary" onClick={onNext}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
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
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
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
    backgroundColor: '#0052CC',
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
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
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
    backgroundColor: '#0052CC',
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
    backgroundColor: '#0052CC',
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
};

export default WizardLayout;
