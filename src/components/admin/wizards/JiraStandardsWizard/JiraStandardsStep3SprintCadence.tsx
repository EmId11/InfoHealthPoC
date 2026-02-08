import React from 'react';
import { OrganizationDefaults, SettingMode } from '../../../../types/admin';
import { SprintCadence } from '../../../../types/wizard';

interface JiraStandardsStep3SprintCadenceProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const CADENCE_OPTIONS: { value: SprintCadence; label: string; days: number; description: string }[] = [
  { value: 'weekly', label: '1 Week', days: 7, description: 'Fast iteration cycles' },
  { value: 'fortnightly', label: '2 Weeks', days: 14, description: 'Most common choice' },
  { value: 'threeWeeks', label: '3 Weeks', days: 21, description: 'Extended delivery cycles' },
  { value: 'monthly', label: '4 Weeks', days: 28, description: 'Longer planning horizons' },
];

const JiraStandardsStep3SprintCadence: React.FC<JiraStandardsStep3SprintCadenceProps> = ({
  defaults,
  onUpdate,
}) => {
  const currentMode = defaults.sprintCadence.mode;
  const currentValue = defaults.sprintCadence.value;

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      sprintCadence: {
        mode,
        value: mode === 'org-defined' ? (currentValue || { cadence: 'fortnightly', customDays: null }) : null,
      },
    });
  };

  const handleCadenceChange = (cadence: SprintCadence) => {
    onUpdate({
      sprintCadence: {
        mode: currentMode,
        value: { cadence, customDays: null },
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Sprint cadence defines the standard iteration length for teams. Consistent cadence across
          the organization enables better cross-team planning and velocity comparisons.
        </p>
      </div>

      <div style={styles.modeSection}>
        <h3 style={styles.modeSectionTitle}>How should this be configured?</h3>
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeButton,
              ...(currentMode === 'org-defined' ? styles.modeButtonActive : {}),
            }}
            onClick={() => handleModeChange('org-defined')}
          >
            <div style={styles.modeIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={styles.modeContent}>
              <span style={styles.modeLabel}>Set org-wide standard</span>
              <span style={styles.modeDesc}>All teams use the same sprint duration</span>
            </div>
          </button>
          <button
            style={{
              ...styles.modeButton,
              ...(currentMode === 'team-decides' ? styles.modeButtonActive : {}),
            }}
            onClick={() => handleModeChange('team-decides')}
          >
            <div style={styles.modeIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 17v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={styles.modeContent}>
              <span style={styles.modeLabel}>Let teams decide</span>
              <span style={styles.modeDesc}>Teams choose their own sprint duration</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && currentValue && (
        <div style={styles.cadenceSection}>
          <h3 style={styles.cadenceSectionTitle}>Select the standard sprint duration</h3>
          <div style={styles.cadenceGrid}>
            {CADENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                style={{
                  ...styles.cadenceOption,
                  ...(currentValue.cadence === option.value ? styles.cadenceOptionActive : {}),
                }}
                onClick={() => handleCadenceChange(option.value)}
              >
                <div style={styles.cadenceDays}>{option.days}</div>
                <div style={styles.cadenceLabel}>{option.label}</div>
                <div style={styles.cadenceDesc}>{option.description}</div>
                {option.value === 'fortnightly' && (
                  <div style={styles.recommendedBadge}>Recommended</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentMode === 'team-decides' && (
        <div style={styles.teamDecidesInfo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6B778C" strokeWidth="2"/>
            <path d="M12 8v4M12 14h.01" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={styles.teamDecidesContent}>
            <p style={styles.teamDecidesTitle}>Teams will choose their own sprint cadence</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will select their sprint duration based on their
              delivery process. This is helpful when teams operate with different methodologies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  intro: {
    marginBottom: '8px',
  },
  introText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  modeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modeSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modeToggle: {
    display: 'flex',
    gap: '12px',
  },
  modeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBECF0',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  modeButtonActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #6554C0',
  },
  modeIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
    flexShrink: 0,
  },
  modeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modeLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modeDesc: {
    fontSize: '13px',
    color: '#6B778C',
  },
  cadenceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cadenceSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  cadenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  cadenceOption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBECF0',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  cadenceOptionActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #6554C0',
  },
  cadenceDays: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#6554C0',
    lineHeight: 1,
  },
  cadenceLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginTop: '8px',
  },
  cadenceDesc: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '4px',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  teamDecidesInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  teamDecidesContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  teamDecidesTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  teamDecidesDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
};

export default JiraStandardsStep3SprintCadence;
