import React from 'react';
import { OrganizationDefaults, SettingMode } from '../../../../types/admin';
import { IssueTypeKey, IssueTypeConfig } from '../../../../types/wizard';

interface JiraStandardsStep2IssueTypesProps {
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

const ISSUE_TYPE_DESCRIPTIONS: Record<IssueTypeKey, string> = {
  story: 'User-facing features or functionality',
  bug: 'Defects or issues to fix',
  task: 'Technical work or administrative items',
  epic: 'Large bodies of work spanning multiple sprints',
  subtask: 'Child items under stories, bugs, or tasks',
};

const DEFAULT_ISSUE_TYPES: IssueTypeConfig[] = [
  { key: 'story', enabled: true, label: 'Story' },
  { key: 'bug', enabled: true, label: 'Bug' },
  { key: 'task', enabled: true, label: 'Task' },
  { key: 'epic', enabled: false, label: 'Epic' },
  { key: 'subtask', enabled: false, label: 'Sub-task' },
];

const JiraStandardsStep2IssueTypes: React.FC<JiraStandardsStep2IssueTypesProps> = ({
  defaults,
  onUpdate,
}) => {
  const currentMode = defaults.issueTypes.mode;
  const currentValue = defaults.issueTypes.value;

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      issueTypes: {
        mode,
        value: mode === 'org-defined' ? (currentValue || DEFAULT_ISSUE_TYPES) : null,
      },
    });
  };

  const handleIssueTypeToggle = (issueType: IssueTypeKey) => {
    if (!currentValue) return;

    onUpdate({
      issueTypes: {
        mode: currentMode,
        value: currentValue.map((config) =>
          config.key === issueType
            ? { ...config, enabled: !config.enabled }
            : config
        ),
      },
    });
  };

  const getEnabledCount = () => {
    if (!currentValue) return 0;
    return currentValue.filter((c) => c.enabled).length;
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Issue types determine which Jira work items are included in health assessments.
          Choose whether all teams use the same types or let each team decide.
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
              <span style={styles.modeDesc}>All teams assess the same issue types</span>
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
              <span style={styles.modeDesc}>Teams choose their own issue types</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && currentValue && (
        <div style={styles.issueTypesSection}>
          <div style={styles.issueTypesSectionHeader}>
            <h3 style={styles.issueTypesSectionTitle}>Select issue types to include</h3>
            <span style={styles.selectedCount}>{getEnabledCount()} selected</span>
          </div>
          <div style={styles.issueTypeGrid}>
            {(Object.keys(ISSUE_TYPE_LABELS) as IssueTypeKey[]).map((issueType) => {
              const config = currentValue.find((c) => c.key === issueType);
              const isEnabled = config?.enabled ?? false;
              return (
                <button
                  key={issueType}
                  style={{
                    ...styles.issueTypeItem,
                    ...(isEnabled ? styles.issueTypeItemActive : {}),
                  }}
                  onClick={() => handleIssueTypeToggle(issueType)}
                >
                  <div style={styles.issueTypeHeader}>
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(isEnabled ? styles.checkboxActive : {}),
                      }}
                    >
                      {isEnabled && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span style={styles.issueTypeLabel}>{ISSUE_TYPE_LABELS[issueType]}</span>
                  </div>
                  <p style={styles.issueTypeDesc}>{ISSUE_TYPE_DESCRIPTIONS[issueType]}</p>
                </button>
              );
            })}
          </div>
          {getEnabledCount() === 0 && (
            <div style={styles.warningBox}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 5v3M8 10h.01M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z"
                  stroke="#DE350B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={styles.warningText}>Select at least one issue type</span>
            </div>
          )}
        </div>
      )}

      {currentMode === 'team-decides' && (
        <div style={styles.teamDecidesInfo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6B778C" strokeWidth="2"/>
            <path d="M12 8v4M12 14h.01" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={styles.teamDecidesContent}>
            <p style={styles.teamDecidesTitle}>Teams will choose their own issue types</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will select which issue types to include
              in their health assessment. This is useful when teams work with different
              types of work items.
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
  issueTypesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  issueTypesSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issueTypesSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  selectedCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  issueTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  issueTypeItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '2px solid #EBECF0',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  issueTypeItemActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #6554C0',
  },
  issueTypeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: '#6554C0',
    border: '2px solid #6554C0',
  },
  issueTypeLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  issueTypeDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#FFEBE6',
    borderRadius: '6px',
    border: '1px solid #FFBDAD',
  },
  warningText: {
    fontSize: '13px',
    color: '#DE350B',
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

export default JiraStandardsStep2IssueTypes;
