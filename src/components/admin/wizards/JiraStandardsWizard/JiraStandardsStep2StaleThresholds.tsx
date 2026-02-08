import React from 'react';
import { OrganizationDefaults, SettingMode } from '../../../../types/admin';
import { IssueTypeKey, StaleThreshold } from '../../../../types/wizard';
import InfoButton from '../../../common/InfoButton';
import { AdminDefaultsHelp } from '../../../../constants/helpContent';

interface JiraStandardsStep2StaleThresholdsProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const ISSUE_TYPE_LABELS: Record<IssueTypeKey, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const DEFAULT_THRESHOLDS: Record<IssueTypeKey, StaleThreshold> = {
  story: { days: 14, enabled: true },
  bug: { days: 7, enabled: true },
  task: { days: 7, enabled: true },
  epic: { days: 30, enabled: true },
  subtask: { days: 5, enabled: true },
};

const JiraStandardsStep2StaleThresholds: React.FC<JiraStandardsStep2StaleThresholdsProps> = ({
  defaults,
  onUpdate,
}) => {
  const currentMode = defaults.staleThresholds.mode;
  const currentValue = defaults.staleThresholds.value;

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      staleThresholds: {
        mode,
        value: mode === 'org-defined' ? (currentValue || DEFAULT_THRESHOLDS) : null,
      },
    });
  };

  const handleThresholdChange = (issueType: IssueTypeKey, days: number) => {
    if (!currentValue) return;

    onUpdate({
      staleThresholds: {
        mode: currentMode,
        value: {
          ...currentValue,
          [issueType]: { ...currentValue[issueType], days },
        },
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Stale thresholds define how many days an issue can remain inactive before being flagged.
          This helps teams identify work that may be blocked or forgotten.
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
              <span style={styles.modeDesc}>All teams use the values you define here</span>
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
              <span style={styles.modeDesc}>Teams configure their own thresholds</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && currentValue && (
        <div style={styles.thresholdsSection}>
          <h3 style={styles.thresholdsSectionTitle}>Configure thresholds for each issue type</h3>
          <div style={styles.thresholdGrid}>
            {(Object.keys(DEFAULT_THRESHOLDS) as IssueTypeKey[]).map((issueType) => {
              const helpContent: Record<IssueTypeKey, React.ReactNode> = {
                story: AdminDefaultsHelp.storyThreshold,
                bug: AdminDefaultsHelp.bugThreshold,
                task: AdminDefaultsHelp.taskThreshold,
                epic: AdminDefaultsHelp.epicThreshold,
                subtask: AdminDefaultsHelp.subtaskThreshold,
              };
              return (
                <div key={issueType} style={styles.thresholdItem}>
                  <div style={styles.thresholdHeader}>
                    <span style={styles.thresholdLabel}>{ISSUE_TYPE_LABELS[issueType]}</span>
                    <InfoButton title={`${ISSUE_TYPE_LABELS[issueType]} Threshold`} size="inline">
                      {helpContent[issueType]}
                    </InfoButton>
                  </div>
                  <div style={styles.thresholdInputRow}>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={currentValue[issueType]?.days || DEFAULT_THRESHOLDS[issueType].days}
                      onChange={(e) => handleThresholdChange(issueType, parseInt(e.target.value) || 1)}
                      style={styles.numberInput}
                    />
                    <span style={styles.inputSuffix}>days</span>
                  </div>
                </div>
              );
            })}
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
            <p style={styles.teamDecidesTitle}>Teams will configure their own stale thresholds</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will set their own thresholds based on their workflow.
              This is recommended when teams have significantly different processes.
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
  thresholdsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  thresholdsSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  thresholdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  thresholdItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  thresholdHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  thresholdLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  thresholdInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  numberInput: {
    width: '70px',
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: '14px',
    color: '#6B778C',
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

export default JiraStandardsStep2StaleThresholds;
