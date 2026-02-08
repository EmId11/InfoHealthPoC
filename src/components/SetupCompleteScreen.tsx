import React from 'react';

interface SetupCompleteScreenProps {
  onInviteTeam: () => void;
  onGoToDashboard: () => void;
}

const SetupCompleteScreen: React.FC<SetupCompleteScreenProps> = ({
  onInviteTeam,
  onGoToDashboard,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={styles.iconWrapper}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" fill="#E3FCEF" stroke="#00875A" strokeWidth="3"/>
            <path
              d="M26 42L35 51L54 32"
              stroke="#00875A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 style={styles.title}>Setup Complete!</h1>
        <p style={styles.subtitle}>
          Your organization is ready to start assessing team health.
        </p>

        {/* Summary */}
        <div style={styles.summaryBox}>
          <div style={styles.summaryItem}>
            <span style={styles.checkIcon}>✓</span>
            <span>Organization hierarchy configured</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.checkIcon}>✓</span>
            <span>Jira standards defined</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.checkIcon}>✓</span>
            <span>Team attributes set up</span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Next Steps */}
        <div style={styles.nextSteps}>
          <h2 style={styles.nextStepsTitle}>What's next?</h2>

          {/* Primary CTA */}
          <button style={styles.primaryCTA} onClick={onInviteTeam}>
            <div style={styles.ctaIconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path
                  d="M20 8V14M17 11H23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={styles.ctaContent}>
              <span style={styles.ctaTitle}>Invite Your Team</span>
              <span style={styles.ctaDescription}>Add users who will create or view assessments</span>
            </div>
            <span style={styles.ctaArrow}>→</span>
          </button>

          {/* Secondary CTA */}
          <button style={styles.secondaryCTA} onClick={onGoToDashboard}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    padding: '48px',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center' as const,
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    lineHeight: 1.5,
    color: '#42526E',
  },
  summaryBox: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '16px 20px',
    textAlign: 'left' as const,
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#172B4D',
    padding: '6px 0',
  },
  checkIcon: {
    color: '#00875A',
    fontWeight: 600,
  },
  divider: {
    height: '1px',
    backgroundColor: '#DFE1E6',
    margin: '24px 0',
  },
  nextSteps: {
    textAlign: 'left' as const,
  },
  nextStepsTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  primaryCTA: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #6554C0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
  },
  ctaIconWrapper: {
    width: '48px',
    height: '48px',
    backgroundColor: '#EAE6FF',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6554C0',
    flexShrink: 0,
  },
  ctaContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  ctaTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  ctaDescription: {
    fontSize: '13px',
    color: '#6B778C',
  },
  ctaArrow: {
    fontSize: '18px',
    color: '#6554C0',
    fontWeight: 500,
  },
  secondaryCTA: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6554C0',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center' as const,
  },
};

export default SetupCompleteScreen;
