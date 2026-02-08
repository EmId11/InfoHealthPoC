import React from 'react';

interface JiraStandardsStep1WelcomeProps {
  onGetStarted: () => void;
}

const JiraStandardsStep1Welcome: React.FC<JiraStandardsStep1WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#EAE6FF" />
            <rect x="16" y="16" width="32" height="32" rx="8" fill="#6554C0" />
            <path d="M24 32l4 4 8-8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={styles.title}>Set Up Jira Standards</h1>
        <p style={styles.description}>
          Organization standards ensure consistency across all teams. You'll configure default settings
          that teams will use when creating health assessments.
        </p>

        <div style={styles.stepsPreview}>
          <h3 style={styles.stepsTitle}>What you'll configure:</h3>
          <div style={styles.stepsList}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Stale Thresholds</span>
                <span style={styles.stepDesc}>How many days before issues are flagged as stale</span>
              </div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Sprint Cadence</span>
                <span style={styles.stepDesc}>Default sprint duration for teams</span>
              </div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Dimension Presets</span>
                <span style={styles.stepDesc}>Which assessment templates teams can use</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.infoIcon}>
            <circle cx="10" cy="10" r="8" stroke="#6554C0" strokeWidth="2" />
            <path d="M10 9v4M10 7h.01" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p style={styles.infoText}>
            For each setting, you can choose to enforce an org-wide standard or let teams decide their own values.
            You can change these settings anytime after completing setup.
          </p>
        </div>

        <button style={styles.button} onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '500px',
  },
  content: {
    maxWidth: '560px',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 32px 0',
    fontSize: '16px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  stepsPreview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  stepsTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stepLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDesc: {
    fontSize: '13px',
    color: '#6B778C',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#EAE6FF',
    borderRadius: '8px',
    marginBottom: '32px',
    textAlign: 'left',
  },
  infoIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#403294',
    lineHeight: 1.5,
  },
  button: {
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '3px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default JiraStandardsStep1Welcome;
