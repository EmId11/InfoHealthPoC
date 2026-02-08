import React from 'react';

interface NoPlanStateProps {
  onCreatePlan: () => void;
}

const NoPlanState: React.FC<NoPlanStateProps> = ({ onCreatePlan }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Icon */}
        <div style={styles.iconWrapper}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* Target/bullseye icon */}
            <circle cx="40" cy="40" r="32" stroke="#DFE1E6" strokeWidth="3" />
            <circle cx="40" cy="40" r="20" stroke="#DFE1E6" strokeWidth="3" />
            <circle cx="40" cy="40" r="8" fill="#5243AA" />
            {/* Arrow pointing to center */}
            <path
              d="M60 20L40 40"
              stroke="#5243AA"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M60 20L52 22M60 20L58 28"
              stroke="#5243AA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title and description */}
        <h2 style={styles.title}>No Improvement Plan Yet</h2>
        <p style={styles.description}>
          Create a focused improvement plan by selecting the outcomes or dimensions you want to
          optimize. We'll suggest plays tailored to your goals and help you track progress.
        </p>

        {/* Benefits list */}
        <div style={styles.benefitsList}>
          <div style={styles.benefitItem}>
            <div style={styles.benefitIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z"
                  stroke="#36B37E"
                  strokeWidth="1.5"
                  fill="#E3FCEF"
                />
              </svg>
            </div>
            <span style={styles.benefitText}>Get personalized play suggestions based on your data</span>
          </div>
          <div style={styles.benefitItem}>
            <div style={styles.benefitIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="6" width="4" height="11" rx="1" fill="#DEEBFF" stroke="#0052CC" strokeWidth="1.5" />
                <rect x="8" y="4" width="4" height="13" rx="1" fill="#DEEBFF" stroke="#0052CC" strokeWidth="1.5" />
                <rect x="13" y="2" width="4" height="15" rx="1" fill="#DEEBFF" stroke="#0052CC" strokeWidth="1.5" />
              </svg>
            </div>
            <span style={styles.benefitText}>Track progress with tasks and status updates</span>
          </div>
          <div style={styles.benefitItem}>
            <div style={styles.benefitIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#6554C0" strokeWidth="1.5" fill="#EAE6FF" />
                <path d="M7 10L9 12L13 8" stroke="#6554C0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={styles.benefitText}>Focus on 3-5 plays for maximum impact</span>
          </div>
        </div>

        {/* CTA Button */}
        <button style={styles.createButton} onClick={onCreatePlan}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Create Improvement Plan
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    padding: '40px 20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '480px',
  },
  iconWrapper: {
    marginBottom: '24px',
    opacity: 0.9,
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 32px 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
    width: '100%',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  benefitIcon: {
    flexShrink: 0,
  },
  benefitText: {
    fontSize: '14px',
    color: '#172B4D',
    textAlign: 'left',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(82, 67, 170, 0.3)',
  },
};

export default NoPlanState;
