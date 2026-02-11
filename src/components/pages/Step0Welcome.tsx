import React from 'react';
import Button from '@atlaskit/button/standard-button';

interface Step0Props {
  onGetStarted: () => void;
}

const Step0Welcome: React.FC<Step0Props> = ({ onGetStarted }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.iconContainer}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="8" fill="#DEEBFF" />
              <path d="M16 20h16M16 26h10M16 32h13" stroke="#0052CC" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="34" cy="32" r="6" fill="#0052CC" />
              <path d="M32 32l1.5 1.5L36 31" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={styles.title}>Are Your Tickets Ready for Work?</h1>
          <p style={styles.subtitle}>
            Discover how complete your Jira fields are and find data gaps before they impact delivery.
          </p>
        </div>

        {/* Why It Matters - Impact Cards */}
        <div style={styles.impactSection}>
          <h2 style={styles.sectionTitle}>Why This Matters</h2>
          <p style={styles.sectionIntro}>
            Incomplete Jira tickets create blind spots that affect planning and delivery:
          </p>

          <div style={styles.impactGrid}>
            <div style={styles.impactCard}>
              <div style={styles.impactIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#DE350B" strokeWidth="2"/>
                  <path d="M8 12h8M8 8h4M8 16h6" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.impactContent}>
                <strong style={styles.impactTitle}>Incomplete Requirements</strong>
                <span style={styles.impactText}>Missing acceptance criteria and descriptions force developers to guess</span>
              </div>
            </div>

            <div style={styles.impactCard}>
              <div style={styles.impactIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#DE350B" strokeWidth="2"/>
                  <path d="M12 8v4M12 15h.01" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.impactContent}>
                <strong style={styles.impactTitle}>Missing Context</strong>
                <span style={styles.impactText}>Empty priority, components, and labels make triage and reporting unreliable</span>
              </div>
            </div>

            <div style={styles.impactCard}>
              <div style={styles.impactIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="#DE350B" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 17l4-6 4 3 5-7" stroke="#DE350B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.impactContent}>
                <strong style={styles.impactTitle}>Data Gaps</strong>
                <span style={styles.impactText}>Inconsistent field usage across teams undermines portfolio-level metrics</span>
              </div>
            </div>
          </div>
        </div>

        {/* What We'll Do */}
        <div style={styles.processSection}>
          <h2 style={styles.sectionTitle}>What This Assessment Does</h2>
          <div style={styles.processSteps}>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>1</div>
              <div style={styles.processContent}>
                <strong>Scan Jira fields</strong>
                <span style={styles.processDesc}>Check which fields are populated across your selected issue types</span>
              </div>
            </div>
            <div style={styles.processArrow}>&rarr;</div>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>2</div>
              <div style={styles.processContent}>
                <strong>Measure completeness</strong>
                <span style={styles.processDesc}>Calculate a readiness score for each field and issue type</span>
              </div>
            </div>
            <div style={styles.processArrow}>&rarr;</div>
            <div style={styles.processStep}>
              <div style={styles.processNumber}>3</div>
              <div style={styles.processContent}>
                <strong>Provide insights</strong>
                <span style={styles.processDesc}>Show where data gaps exist and which fields need attention</span>
              </div>
            </div>
          </div>
          <p style={styles.modelNote}>
            TicketReady analyses your Jira field data to measure how consistently tickets are filled out.
            Your Readiness Score reflects the completeness of the fields you choose to track.
          </p>
        </div>

        {/* Time Estimate & CTA */}
        <div style={styles.ctaSection}>
          <div style={styles.timeBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="8" cy="8" r="7" stroke="#0052CC" strokeWidth="1.5"/>
              <path d="M8 4v4l2.5 2.5" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={styles.timeText}>Setup takes about 2-3 minutes</span>
          </div>

          <Button
            appearance="primary"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100%',
    padding: '32px 20px',
  },
  content: {
    maxWidth: '640px',
    textAlign: 'center',
  },

  // Hero
  heroSection: {
    marginBottom: '32px',
  },
  iconContainer: {
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#172B4D',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Impact Section
  impactSection: {
    marginBottom: '32px',
    textAlign: 'left',
  },
  sectionTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionIntro: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  impactGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  impactCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#FFEBE6',
    borderRadius: '8px',
    borderLeft: '3px solid #DE350B',
  },
  impactIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  impactContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  impactTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  impactText: {
    fontSize: '13px',
    color: '#5E6C84',
  },

  // Process Section
  processSection: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  processSteps: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  processStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  processNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  processDesc: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  modelNote: {
    margin: '16px 0 0 0',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    textAlign: 'center',
  },
  processArrow: {
    color: '#B3BAC5',
    fontSize: '18px',
    marginTop: '4px',
    flexShrink: 0,
  },

  // CTA Section
  ctaSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '8px',
  },
  timeBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '20px',
  },
  timeText: {
    fontSize: '13px',
    color: '#0747A6',
    fontWeight: 500,
  },
};

export default Step0Welcome;
