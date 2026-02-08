import React from 'react';
import { OutcomePlayGroup, SuggestedPlay } from '../../../../types/improvementPlan';

interface Step3_ConfirmProps {
  planName: string;
  onNameChange: (name: string) => void;
  outcomeGroups: OutcomePlayGroup[];
  allPlays: SuggestedPlay[];
}

const Step3_Confirm: React.FC<Step3_ConfirmProps> = ({
  planName,
  onNameChange,
  outcomeGroups,
  allPlays,
}) => {
  const selectedPlaysCount = allPlays.filter(p => p.isSelected).length;

  // Count selected plays per outcome
  const getOutcomeSelectedCount = (outcomeGroup: OutcomePlayGroup) => {
    let count = 0;
    for (const dim of outcomeGroup.dimensions) {
      for (const play of dim.plays) {
        const selected = allPlays.find(p => p.playId === play.playId);
        if (selected?.isSelected) count++;
      }
    }
    return count;
  };

  return (
    <div style={styles.container}>
      <p style={styles.description}>
        You're almost ready to launch your improvement plan! Give it a name and review the summary below.
      </p>

      {/* Plan name input */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Plan Name</label>
        <input
          type="text"
          value={planName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Q1 Jira Health Improvement"
          style={styles.input}
        />
        <p style={styles.hint}>
          Choose a name that helps you identify this improvement initiative
        </p>
      </div>

      {/* Summary card */}
      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>Plan Summary</h3>

        {/* Outcomes */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#5243AA" strokeWidth="2" />
              <circle cx="10" cy="10" r="4" stroke="#5243AA" strokeWidth="2" />
              <circle cx="10" cy="10" r="1" fill="#5243AA" />
            </svg>
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>
              {outcomeGroups.length} outcome{outcomeGroups.length !== 1 ? 's' : ''} to improve
            </span>
            <div style={styles.outcomesList}>
              {outcomeGroups.map((og, index) => (
                <div key={og.outcomeId} style={styles.outcomeItem}>
                  <span style={styles.outcomePriority}>{index + 1}.</span>
                  <span style={styles.outcomeName}>{og.outcomeName}</span>
                  <span style={styles.outcomePlayCount}>
                    ({getOutcomeSelectedCount(og)} plays)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plays */}
        <div style={styles.summaryRow}>
          <div style={styles.summaryIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 5h16M2 10h16M2 15h10" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={styles.summaryContent}>
            <span style={styles.summaryLabel}>{selectedPlaysCount} plays to work through</span>
            <p style={styles.summaryDetail}>
              Organized by outcome priority and ready to track
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div style={styles.recommendation}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10 5.5L15 6L11.5 9.5L12.5 14.5L8 12L3.5 14.5L4.5 9.5L1 6L6 5.5L8 1Z" fill="#FFE380" stroke="#FF8B00" strokeWidth="1" />
          </svg>
          <span>
            Focus on completing 1-2 plays at a time for best results. You can always adjust priorities later.
          </span>
        </div>
      </div>

      {/* Launch info */}
      <div style={styles.launchInfo}>
        <div style={styles.launchIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L19 7V17L12 21L5 17V7L12 3Z" stroke="#36B37E" strokeWidth="2" fill="#E3FCEF" />
            <path d="M9 12L11 14L15 10" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={styles.launchText}>
          <span style={styles.launchTitle}>Ready to launch!</span>
          <span style={styles.launchSubtitle}>
            Click "Create Plan" to start tracking your improvement journey
          </span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '15px',
    color: '#172B4D',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  hint: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  summaryCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#FAFBFC',
    borderRadius: '10px',
    border: '1px solid #EBECF0',
  },
  summaryTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  summaryIcon: {
    flexShrink: 0,
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F0FF',
    borderRadius: '8px',
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  summaryLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  summaryDetail: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  outcomesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  outcomeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
  },
  outcomePriority: {
    fontWeight: 600,
    color: '#5243AA',
    minWidth: '16px',
  },
  outcomeName: {
    color: '#172B4D',
  },
  outcomePlayCount: {
    color: '#6B778C',
    fontSize: '12px',
  },
  recommendation: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    border: '1px solid #FFE380',
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
    marginTop: '4px',
  },
  launchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#E3FCEF',
    borderRadius: '10px',
    border: '1px solid #ABF5D1',
  },
  launchIcon: {
    flexShrink: 0,
  },
  launchText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  launchTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#006644',
  },
  launchSubtitle: {
    fontSize: '13px',
    color: '#00875A',
  },
};

export default Step3_Confirm;
