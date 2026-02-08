import React from 'react';

interface SetupRequiredScreenProps {
  organizationName?: string;
  onAdminLogin?: () => void;
  onSkipSetup?: () => void; // Dev only - skip setup wizard
}

const SetupRequiredScreen: React.FC<SetupRequiredScreenProps> = ({
  organizationName = 'your organization',
  onAdminLogin,
  onSkipSetup,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconWrapper}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="#6554C0" strokeWidth="3" fill="#EAE6FF"/>
            <rect x="28" y="20" width="8" height="4" rx="2" fill="#6554C0"/>
            <rect x="26" y="24" width="12" height="20" rx="2" fill="#6554C0"/>
            <circle cx="32" cy="34" r="2" fill="#EAE6FF"/>
            <rect x="30" y="36" width="4" height="6" rx="1" fill="#EAE6FF"/>
          </svg>
        </div>
        <h1 style={styles.title}>Setup In Progress</h1>
        <p style={styles.description}>
          The administrator for {organizationName} is currently configuring this application.
          Please check back soon.
        </p>
        <div style={styles.divider} />
        <p style={styles.helpText}>
          If you believe this is an error or need immediate access, please contact your administrator.
        </p>
        <div style={styles.linkRow}>
          {onAdminLogin && (
            <button style={styles.adminLink} onClick={onAdminLogin}>
              Admin Login →
            </button>
          )}
          {onSkipSetup && (
            <button style={styles.skipLink} onClick={onSkipSetup}>
              Admin Login (Setup Complete) →
            </button>
          )}
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
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center' as const,
  },
  iconWrapper: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#42526E',
  },
  divider: {
    height: '1px',
    backgroundColor: '#DFE1E6',
    margin: '0 0 24px 0',
  },
  helpText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  linkRow: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
  },
  adminLink: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6554C0',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  skipLink: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 400,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default SetupRequiredScreen;
