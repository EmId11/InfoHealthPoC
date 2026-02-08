import React, { useState } from 'react';

interface EmailPreviewProps {
  projectName: string;
  periodStart: string;
  periodEnd: string;
  closesAt: string;
}

type EmailType = 'invitation' | 'reminder';

const EmailPreview: React.FC<EmailPreviewProps> = ({
  projectName,
  periodStart,
  periodEnd,
  closesAt,
}) => {
  const [emailType, setEmailType] = useState<EmailType>('invitation');

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPeriod = (): string => {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <div style={styles.container}>
      {/* Email Type Toggle */}
      <div style={styles.toggleContainer}>
        <button
          style={{
            ...styles.toggleButton,
            ...(emailType === 'invitation' ? styles.toggleButtonActive : {}),
          }}
          onClick={() => setEmailType('invitation')}
        >
          Initial Invitation
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(emailType === 'reminder' ? styles.toggleButtonActive : {}),
          }}
          onClick={() => setEmailType('reminder')}
        >
          Reminder Email
        </button>
      </div>

      {/* Preview Banner */}
      <div style={styles.previewBanner}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#974F0C" strokeWidth="1.5" />
          <path d="M8 5v3M8 10v1" stroke="#974F0C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>This is a preview. Actual email will use Atlassian notification templates.</span>
      </div>

      {/* Email Preview */}
      <div style={styles.emailContainer}>
        {/* Email Header */}
        <div style={styles.emailHeader}>
          <div style={styles.emailMeta}>
            <div style={styles.emailMetaRow}>
              <span style={styles.emailLabel}>From:</span>
              <span style={styles.emailValue}>Jira Health Check &lt;noreply@atlassian.com&gt;</span>
            </div>
            <div style={styles.emailMetaRow}>
              <span style={styles.emailLabel}>To:</span>
              <span style={styles.emailValue}>
                <span style={styles.token}>{'{{recipient.email}}'}</span>
              </span>
            </div>
            <div style={styles.emailMetaRow}>
              <span style={styles.emailLabel}>Subject:</span>
              <span style={styles.emailValue}>
                {emailType === 'invitation'
                  ? `Quick survey: Help improve your team's Jira health`
                  : `Reminder: Team survey closes soon`}
              </span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div style={styles.emailBody}>
          <p style={styles.greeting}>
            Hi <span style={styles.token}>{'{{recipient.firstName}}'}</span>,
          </p>

          {emailType === 'invitation' ? (
            <>
              <p style={styles.paragraph}>
                Your team lead has requested feedback on Jira usage for the{' '}
                <strong>{projectName}</strong> project.
              </p>
              <p style={styles.paragraph}>
                This 1-minute survey helps calibrate our invisible work detection system.
                Your response is anonymous and helps improve accuracy for your entire team.
              </p>
              <p style={styles.paragraph}>
                We're asking about the period: <strong>{formatPeriod()}</strong>
              </p>
            </>
          ) : (
            <>
              <p style={styles.paragraph}>
                Just a friendly reminder that the Jira Health survey for{' '}
                <strong>{projectName}</strong> is still waiting for your response.
              </p>
              <p style={styles.paragraph}>
                It only takes about 1 minute to complete, and your input helps improve
                invisible work detection for your team.
              </p>
            </>
          )}

          {/* CTA Button */}
          <div style={styles.ctaContainer}>
            <button style={styles.ctaButton}>
              Take the Survey
            </button>
          </div>

          <p style={styles.footerText}>
            Survey closes: <strong>{formatDate(closesAt)}</strong>
          </p>

          <hr style={styles.divider} />

          <p style={styles.legalText}>
            You received this email because you're a member of the {projectName} project in Jira.
            If you believe this was sent in error, please contact your project administrator.
          </p>

          <div style={styles.atlassianFooter}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.2 9.9c-.2-.2-.5-.2-.6 0L2 15.6c-.2.3 0 .7.4.7h5.2c.2 0 .4-.1.5-.3.7-1.4.4-4.4-1.9-6.1zM9.7 3.2c-2.3 3.3-2.1 6.8-.5 9.3.1.2.3.3.5.3h5.2c.4 0 .6-.4.4-.7L10.3 3.2c-.2-.3-.5-.3-.6 0z"
                fill="#2684FF"
              />
            </svg>
            <span style={styles.atlassianText}>Powered by Atlassian</span>
          </div>
        </div>
      </div>

      {/* Tokens Legend */}
      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>Personalization Tokens</h4>
        <div style={styles.tokenList}>
          <div style={styles.tokenItem}>
            <code style={styles.tokenCode}>{'{{recipient.email}}'}</code>
            <span style={styles.tokenDesc}>Recipient's email address</span>
          </div>
          <div style={styles.tokenItem}>
            <code style={styles.tokenCode}>{'{{recipient.firstName}}'}</code>
            <span style={styles.tokenDesc}>Recipient's first name</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  toggleContainer: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#F4F5F7',
    padding: '4px',
    borderRadius: '6px',
    width: 'fit-content',
  },
  toggleButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  previewBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#974F0C',
  },
  emailContainer: {
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  emailHeader: {
    backgroundColor: '#F4F5F7',
    padding: '16px',
    borderBottom: '1px solid #DFE1E6',
  },
  emailMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  emailMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  emailLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    width: '50px',
  },
  emailValue: {
    fontSize: '13px',
    color: '#172B4D',
  },
  token: {
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#0052CC',
  },
  emailBody: {
    padding: '24px',
  },
  greeting: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    color: '#172B4D',
  },
  paragraph: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.6,
  },
  ctaContainer: {
    margin: '24px 0',
    textAlign: 'center',
  },
  ctaButton: {
    padding: '12px 32px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'default',
  },
  footerText: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    textAlign: 'center',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #DFE1E6',
    margin: '24px 0',
  },
  legalText: {
    margin: '0 0 16px 0',
    fontSize: '11px',
    color: '#97A0AF',
    lineHeight: 1.5,
  },
  atlassianFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    paddingTop: '16px',
  },
  atlassianText: {
    fontSize: '11px',
    color: '#6B778C',
  },
  legend: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  legendTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tokenList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tokenItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tokenCode: {
    padding: '4px 8px',
    backgroundColor: '#DEEBFF',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#0052CC',
  },
  tokenDesc: {
    fontSize: '13px',
    color: '#5E6C84',
  },
};

export default EmailPreview;
