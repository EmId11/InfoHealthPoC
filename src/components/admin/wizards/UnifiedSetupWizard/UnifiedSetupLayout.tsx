import React from 'react';
import Button from '@atlaskit/button/standard-button';

export type SetupPhase = 'orgHierarchy' | 'jiraStandards' | 'teamAttributes';

interface PhaseInfo {
  id: SetupPhase;
  label: string;
  description: string;
  totalSteps: number;
}

export const SETUP_PHASES: PhaseInfo[] = [
  { id: 'orgHierarchy', label: 'Organization Hierarchy', description: 'Configure team groupings', totalSteps: 5 },
  { id: 'jiraStandards', label: 'Jira Standards', description: 'Define organization defaults', totalSteps: 5 },
  { id: 'teamAttributes', label: 'Team Attributes', description: 'Set up team classifications', totalSteps: 4 },
];

interface UnifiedSetupLayoutProps {
  currentPhase: SetupPhase;
  currentStep: number; // Step within the current phase
  phaseComplete: Record<SetupPhase, boolean>;
  stepLabel?: string;
  stepDescription?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  isLastStep: boolean;
  isWelcomeStep: boolean;
  isGlobalWelcome?: boolean; // True when showing the initial setup welcome before any phase
  onSkipSetup?: () => void; // Dev only - skip setup wizard
}

const UnifiedSetupLayout: React.FC<UnifiedSetupLayoutProps> = ({
  currentPhase,
  currentStep,
  phaseComplete,
  stepLabel,
  stepDescription,
  children,
  onNext,
  onBack,
  isLastStep,
  isWelcomeStep,
  isGlobalWelcome = false,
  onSkipSetup,
}) => {
  const currentPhaseIndex = SETUP_PHASES.findIndex(p => p.id === currentPhase);
  const currentPhaseInfo = SETUP_PHASES[currentPhaseIndex];

  // Calculate overall progress
  const totalSteps = SETUP_PHASES.reduce((sum, p) => sum + p.totalSteps, 0);
  const completedSteps = SETUP_PHASES.slice(0, currentPhaseIndex).reduce((sum, p) => sum + p.totalSteps, 0) + currentStep;
  const overallProgress = (completedSteps / totalSteps) * 100;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <defs>
                  <linearGradient id="unifiedLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6554C0" />
                    <stop offset="100%" stopColor="#5243AA" />
                  </linearGradient>
                </defs>
                <rect width="36" height="36" rx="8" fill="url(#unifiedLogoGradient)" />
                <path d="M10 26L18 10L26 26H10Z" fill="white" opacity="0.9" />
                <circle cx="18" cy="20" r="2.5" fill="white" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <h1 style={styles.title}>Initial Setup</h1>
              <span style={styles.subtitle}>Configure your organization</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.headerProgress}>
              <span style={styles.progressLabel}>Overall Progress</span>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${overallProgress}%` }} />
              </div>
              <span style={styles.progressText}>{Math.round(overallProgress)}%</span>
            </div>
            {onSkipSetup && (
              <button style={styles.skipLink} onClick={onSkipSetup}>
                Skip Setup →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={isGlobalWelcome ? styles.contentLayoutCentered : styles.contentLayout}>
          {/* Phase Sidebar - hidden during global welcome */}
          {!isGlobalWelcome && (
          <aside style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <span style={styles.sidebarTitle}>Setup Phases</span>
            </div>
            <div style={styles.phasesList}>
              {SETUP_PHASES.map((phase, index) => {
                const isCurrent = phase.id === currentPhase;
                const isCompleted = phaseComplete[phase.id];
                const isUpcoming = index > currentPhaseIndex;

                return (
                  <div
                    key={phase.id}
                    style={{
                      ...styles.phaseItem,
                      ...(isCurrent ? styles.phaseItemCurrent : {}),
                      ...(isCompleted ? styles.phaseItemCompleted : {}),
                      ...(isUpcoming ? styles.phaseItemUpcoming : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.phaseIcon,
                        ...(isCurrent ? styles.phaseIconCurrent : {}),
                        ...(isCompleted ? styles.phaseIconCompleted : {}),
                      }}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div style={styles.phaseContent}>
                      <span style={styles.phaseLabel}>{phase.label}</span>
                      <span style={styles.phaseDesc}>{phase.description}</span>
                    </div>
                    {isCurrent && <span style={styles.currentIndicator} />}
                  </div>
                );
              })}
            </div>

            {/* Current phase progress */}
            {!isWelcomeStep && (
              <div style={styles.phaseProgress}>
                <div style={styles.phaseProgressHeader}>
                  <span style={styles.phaseProgressLabel}>Phase Progress</span>
                  <span style={styles.phaseProgressCount}>
                    Step {currentStep} of {currentPhaseInfo.totalSteps - 1}
                  </span>
                </div>
                <div style={styles.phaseProgressBar}>
                  <div
                    style={{
                      ...styles.phaseProgressFill,
                      width: `${(currentStep / (currentPhaseInfo.totalSteps - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </aside>
          )}

          {/* Main Content Card */}
          <div style={styles.mainContentArea}>
            <div style={isWelcomeStep ? styles.welcomeCard : styles.contentCard}>
              {/* Step header for non-welcome steps */}
              {!isWelcomeStep && stepLabel && (
                <div style={styles.stepHeader}>
                  <div style={styles.stepBadge}>{currentPhaseInfo.label}</div>
                  <h2 style={styles.stepTitle}>{stepLabel}</h2>
                  {stepDescription && (
                    <p style={styles.stepDescription}>{stepDescription}</p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      {!isWelcomeStep && (
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerLeft}>
              <Button appearance="subtle" onClick={onBack}>
                Back
              </Button>
            </div>
            <div>
              <Button appearance="primary" onClick={onNext} style={styles.primaryButton}>
                {isLastStep ? 'Complete Setup' : 'Continue'}
              </Button>
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
  subtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: '2px',
  },
  headerProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  progressBar: {
    width: '120px',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
    minWidth: '36px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  skipLink: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  main: {
    flex: 1,
    padding: '32px',
  },
  contentLayout: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    gap: '24px',
  },
  contentLayoutCentered: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  sidebar: {
    width: '260px',
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
    marginBottom: '16px',
  },
  sidebarTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  phasesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  phaseItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    position: 'relative',
  },
  phaseItemCurrent: {
    backgroundColor: '#EAE6FF',
  },
  phaseItemCompleted: {},
  phaseItemUpcoming: {
    opacity: 0.6,
  },
  phaseIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    flexShrink: 0,
  },
  phaseIconCurrent: {
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
  },
  phaseIconCompleted: {
    backgroundColor: '#E3FCEF',
    color: '#00875A',
  },
  phaseContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  phaseLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  phaseDesc: {
    fontSize: '11px',
    color: '#6B778C',
  },
  currentIndicator: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#6554C0',
  },
  phaseProgress: {
    borderTop: '1px solid #EBECF0',
    paddingTop: '16px',
  },
  phaseProgressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  phaseProgressLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  phaseProgressCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  phaseProgressBar: {
    height: '4px',
    backgroundColor: '#EBECF0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: '#6554C0',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
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
  stepBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: '#EAE6FF',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5243AA',
    marginBottom: '8px',
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
    maxWidth: '1100px',
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

export default UnifiedSetupLayout;
