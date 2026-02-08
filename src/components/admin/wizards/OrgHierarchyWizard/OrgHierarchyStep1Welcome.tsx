import React from 'react';

interface OrgHierarchyStep1WelcomeProps {
  onGetStarted: () => void;
}

const OrgHierarchyStep1Welcome: React.FC<OrgHierarchyStep1WelcomeProps> = ({
  onGetStarted,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#EAE6FF" />
            <rect x="24" y="12" width="16" height="12" rx="3" fill="#6554C0" />
            <rect x="8" y="40" width="16" height="12" rx="3" fill="#6554C0" />
            <rect x="40" y="40" width="16" height="12" rx="3" fill="#6554C0" />
            <path d="M32 24v8M32 32L16 40M32 32L48 40" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={styles.title}>Set Up Organization Structure</h1>
        <p style={styles.description}>
          Choose how to organize your teams. You can keep things simple with a flat structure,
          or group teams into levels that match how your organization works.
        </p>


        <div style={styles.stepsPreview}>
          <h3 style={styles.stepsTitle}>What you'll configure:</h3>
          <div style={styles.stepsList}>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Design Your Structure</span>
                <span style={styles.stepDesc}>Choose a template or build a custom hierarchy</span>
              </div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Customize Levels</span>
                <span style={styles.stepDesc}>Name your levels and set mandatory requirements</span>
              </div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <span style={styles.stepLabel}>Review Configuration</span>
                <span style={styles.stepDesc}>Confirm your structure before saving</span>
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
            Not sure what structure to use? You can start with a flat structure and add
            groupings later as your needs evolve.
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
  stepsPreview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
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

export default OrgHierarchyStep1Welcome;
