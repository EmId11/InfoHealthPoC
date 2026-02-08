import React from 'react';

interface TeamAttributesStep1WelcomeProps {
  onGetStarted: () => void;
}

const TeamAttributesStep1Welcome: React.FC<TeamAttributesStep1WelcomeProps> = ({ onGetStarted }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#EAE6FF" />
            <rect x="12" y="16" width="16" height="12" rx="3" fill="#6554C0" />
            <rect x="36" y="16" width="16" height="12" rx="3" fill="#6554C0" />
            <rect x="12" y="36" width="16" height="12" rx="3" fill="#6554C0" />
            <rect x="36" y="36" width="16" height="12" rx="3" fill="#6554C0" />
          </svg>
        </div>
        <h1 style={styles.title}>Set Up Team Attributes</h1>
        <p style={styles.description}>
          Team attributes help you categorize and filter teams for analysis. They enable you to compare
          health metrics across similar teams and identify patterns by team type.
        </p>

        <div style={styles.attributeTypesPreview}>
          <div style={styles.previewHeader}>Two types of attributes:</div>
          <div style={styles.typeCards}>
            <div style={styles.typeCard}>
              <div style={styles.typeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6554C0" strokeWidth="2" />
                  <path d="M9 9l6 6M15 9l-6 6" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.typeContent}>
                <span style={styles.typeLabel}>System Attributes</span>
                <span style={styles.typeDesc}>Auto-calculated based on team data (Team Size, Tenure, Volume)</span>
              </div>
            </div>
            <div style={styles.typeCard}>
              <div style={styles.typeIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6554C0" strokeWidth="2" />
                  <path d="M12 8v8M8 12h8" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.typeContent}>
                <span style={styles.typeLabel}>Custom Attributes</span>
                <span style={styles.typeDesc}>Your own categories (Work Type, Domain, Product Area)</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.stepsPreview}>
          <h3 style={styles.stepsTitle}>What you'll configure:</h3>
          <div style={styles.stepsList}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>System Attributes</span>
                <span style={styles.stepDesc}>Review auto-calculated team classifications</span>
              </div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Custom Attributes</span>
                <span style={styles.stepDesc}>Create your own team categorizations</span>
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
            Team attributes are used throughout the app for filtering, comparisons, and reporting.
            You can add more attributes or modify these settings anytime after setup.
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
    maxWidth: '600px',
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
  attributeTypesPreview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  previewHeader: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '16px',
  },
  typeCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  typeCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  typeIcon: {
    flexShrink: 0,
  },
  typeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  typeLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  typeDesc: {
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
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

export default TeamAttributesStep1Welcome;
