import React from 'react';

interface SetupWelcomeProps {
  onGetStarted: () => void;
}

const SetupWelcome: React.FC<SetupWelcomeProps> = ({ onGetStarted }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Welcome Icon */}
        <div style={styles.iconContainer}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="20" fill="#EAE6FF" />
            {/* Gear/settings icon with sparkle */}
            <circle cx="40" cy="40" r="16" stroke="#6554C0" strokeWidth="3" fill="none" />
            <circle cx="40" cy="40" r="6" fill="#6554C0" />
            {/* Gear teeth */}
            <rect x="38" y="18" width="4" height="8" rx="2" fill="#6554C0" />
            <rect x="38" y="54" width="4" height="8" rx="2" fill="#6554C0" />
            <rect x="18" y="38" width="8" height="4" rx="2" fill="#6554C0" />
            <rect x="54" y="38" width="8" height="4" rx="2" fill="#6554C0" />
            {/* Diagonal teeth */}
            <rect x="22" y="22" width="4" height="8" rx="2" fill="#6554C0" transform="rotate(-45 24 26)" />
            <rect x="54" y="54" width="4" height="8" rx="2" fill="#6554C0" transform="rotate(-45 56 58)" />
            <rect x="54" y="22" width="4" height="8" rx="2" fill="#6554C0" transform="rotate(45 56 26)" />
            <rect x="22" y="54" width="4" height="8" rx="2" fill="#6554C0" transform="rotate(45 24 58)" />
            {/* Sparkle */}
            <circle cx="60" cy="20" r="3" fill="#FFAB00" />
            <path d="M60 14v4M60 18v4M56 20h4M58 20h4" stroke="#FFAB00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={styles.title}>Welcome to Initial Setup</h1>
        <p style={styles.description}>
          Let's configure your organization's health assessment settings. This setup ensures
          consistency across all teams and makes it easy for everyone to get started.
        </p>

        {/* What you'll set up */}
        <div style={styles.phasesPreview}>
          <h3 style={styles.phasesTitle}>You'll configure three key areas:</h3>
          <div style={styles.phasesList}>
            <div style={styles.phaseItem}>
              <div style={styles.phaseNumber}>1</div>
              <div style={styles.phaseContent}>
                <span style={styles.phaseLabel}>Organization Structure</span>
                <span style={styles.phaseDesc}>Define how teams are grouped (portfolios, tribes, etc.)</span>
              </div>
            </div>
            <div style={styles.phaseItem}>
              <div style={styles.phaseNumber}>2</div>
              <div style={styles.phaseContent}>
                <span style={styles.phaseLabel}>Jira Standards</span>
                <span style={styles.phaseDesc}>Set default thresholds, cadences, and assessment options</span>
              </div>
            </div>
            <div style={styles.phaseItem}>
              <div style={styles.phaseNumber}>3</div>
              <div style={styles.phaseContent}>
                <span style={styles.phaseLabel}>Team Attributes</span>
                <span style={styles.phaseDesc}>Create categories for comparing similar teams</span>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful note */}
        <div style={styles.infoBox}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={styles.infoIcon}>
            <circle cx="10" cy="10" r="8" stroke="#6554C0" strokeWidth="2" />
            <path d="M10 9v4M10 7h.01" stroke="#6554C0" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p style={styles.infoText}>
            This setup takes about 10-15 minutes. You can save progress and return anytime.
            All settings can be changed later from the Admin dashboard.
          </p>
        </div>

        <button style={styles.button} onClick={onGetStarted}>
          Let's Get Started
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
    maxWidth: '580px',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '28px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '32px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 36px 0',
    fontSize: '16px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  phasesPreview: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  phasesTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  phasesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  phaseItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  phaseNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },
  phaseContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  phaseLabel: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  phaseDesc: {
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
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
    padding: '14px 32px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default SetupWelcome;
