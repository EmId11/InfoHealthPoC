import React from 'react';

interface SurveyPromptProps {
  onStartSurvey: () => void;
  onDismiss: () => void;
  hasCompletedSurvey: boolean;
  lastSurveyDate: string | null;
}

const SurveyPrompt: React.FC<SurveyPromptProps> = ({
  onStartSurvey,
  onDismiss,
  hasCompletedSurvey,
  lastSurveyDate,
}) => {
  if (hasCompletedSurvey) {
    return (
      <div style={styles.completedBanner}>
        <div style={styles.completedIcon}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" fill="#E3FCEF" stroke="#36B37E" strokeWidth="2" />
            <path d="M6 10l3 3 5-6" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={styles.completedContent}>
          <span style={styles.completedText}>
            Thanks for contributing to the model!
          </span>
          <span style={styles.completedSubtext}>
            Your response helps improve predictions for all teams.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.promptBanner}>
      <div style={styles.promptLeft}>
        <div style={styles.promptIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#DEEBFF" />
            <path d="M12 7v5l3 3" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="2" fill="#0052CC" />
          </svg>
        </div>
        <div style={styles.promptContent}>
          <span style={styles.promptTitle}>Help improve the model</span>
          <span style={styles.promptSubtext}>
            Your anonymous feedback helps predict invisible work more accurately
          </span>
        </div>
      </div>
      <div style={styles.promptActions}>
        <button style={styles.startButton} onClick={onStartSurvey}>
          Start Survey
        </button>
        <button style={styles.dismissButton} onClick={onDismiss}>
          Not now
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  promptBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #B3D4FF',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 82, 204, 0.1)',
  },
  promptLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  promptIcon: {
    flexShrink: 0,
  },
  promptContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  promptTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  promptSubtext: {
    fontSize: '13px',
    color: '#6B778C',
  },
  promptActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  startButton: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  dismissButton: {
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
  },

  // Completed state
  completedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#E3FCEF',
    border: '1px solid #ABF5D1',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  completedIcon: {
    flexShrink: 0,
  },
  completedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  completedText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#006644',
  },
  completedSubtext: {
    fontSize: '13px',
    color: '#006644',
    opacity: 0.8,
  },
};

export default SurveyPrompt;
