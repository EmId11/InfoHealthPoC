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
              <path d="M14 18h20M14 24h14M14 30h17" stroke="#0052CC" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="35" cy="30" r="6" fill="#0052CC" />
              <path d="M33 30l1.5 1.5L37 29" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={styles.title}>Can You Trust Your Jira Data?</h1>
          <p style={styles.subtitle}>
            Go beyond field completeness. Assess data integrity, timing, and behavioral patterns
            that determine whether your Jira data can be trusted for planning and decisions.
          </p>
        </div>

        {/* Why It Matters - Impact Cards */}
        <div style={styles.impactSection}>
          <h2 style={styles.sectionTitle}>Why This Matters</h2>
          <p style={styles.sectionIntro}>
            Untrustworthy Jira data creates blind spots that affect planning and delivery:
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
                <strong style={styles.impactTitle}>Incomplete Fields</strong>
                <span style={styles.impactText}>Missing fields create gaps in reporting and force teams to guess at context</span>
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
                <strong style={styles.impactTitle}>Data That Looks Right But Isn't</strong>
                <span style={styles.impactText}>Fields filled with defaults, placeholders, or copy-paste content inflate quality metrics</span>
              </div>
            </div>

            <div style={styles.impactCard}>
              <div style={styles.impactIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#DE350B" strokeWidth="2"/>
                  <path d="M12 7v5l3 3" stroke="#DE350B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.impactContent}>
                <strong style={styles.impactTitle}>Data That Arrives Too Late</strong>
                <span style={styles.impactText}>Information added after decisions are made cannot inform those decisions</span>
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
                <strong style={styles.impactTitle}>Patterns That Distort Metrics</strong>
                <span style={styles.impactText}>Bulk updates, status skipping, and cleanup sprints make velocity and progress unreliable</span>
              </div>
            </div>
          </div>
        </div>

        {/* What We'll Do - 4 steps for 4 lenses */}
        <div style={styles.processSection}>
          <h2 style={styles.sectionTitle}>What This Assessment Does</h2>
          <div style={styles.processStepsVertical}>
            <div style={styles.processStepRow}>
              <div style={styles.processNumber}>1</div>
              <div style={styles.processContent}>
                <strong>Check field coverage</strong>
                <span style={styles.processDesc}>Measure which fields are populated across your selected issue types</span>
              </div>
            </div>
            <div style={styles.processStepRow}>
              <div style={styles.processNumber}>2</div>
              <div style={styles.processContent}>
                <strong>Analyse data integrity</strong>
                <span style={styles.processDesc}>Detect placeholder content, default values, and clustering that undermine data quality</span>
              </div>
            </div>
            <div style={styles.processStepRow}>
              <div style={styles.processNumber}>3</div>
              <div style={styles.processContent}>
                <strong>Audit information timing</strong>
                <span style={styles.processDesc}>Check whether data was available when decisions were made, not added retroactively</span>
              </div>
            </div>
            <div style={styles.processStepRow}>
              <div style={styles.processNumber}>4</div>
              <div style={styles.processContent}>
                <strong>Detect behavioural patterns</strong>
                <span style={styles.processDesc}>Identify bulk updates, status skipping, and other patterns that distort your metrics</span>
              </div>
            </div>
          </div>
          <p style={styles.modelNote}>
            PlanReady analyses your Jira data through four lenses — coverage, integrity, timing, and behaviour —
            to determine whether your data can be trusted for planning, forecasting, and decision-making.
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
  processStepsVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  processStepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'left',
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
