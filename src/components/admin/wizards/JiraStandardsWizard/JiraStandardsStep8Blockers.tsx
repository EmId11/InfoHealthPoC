import React from 'react';
import {
  OrganizationDefaults,
  SettingMode,
  BlockerMethodConfig,
} from '../../../../types/admin';

interface JiraStandardsStep8BlockersProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const DEFAULT_BLOCKER_CONFIG: BlockerMethodConfig = {
  useFlags: true,
  flagNames: ['Blocked', 'Impediment'],
  useLabels: false,
  labelPatterns: [],
  useStatus: false,
  blockedStatuses: [],
  useLinks: true,
  linkTypes: ['is blocked by'],
};

const JiraStandardsStep8Blockers: React.FC<JiraStandardsStep8BlockersProps> = ({
  defaults,
  onUpdate,
}) => {
  const currentMode = defaults.blockers?.mode || 'org-defined';
  const currentValue = defaults.blockers?.value || DEFAULT_BLOCKER_CONFIG;

  // Get workflow statuses for blocked status selection
  const allStatuses = defaults.workflows?.value?.flatMap((wf) =>
    wf.statuses.map((s) => s.statusName)
  ) || [];
  const uniqueStatuses = Array.from(new Set(allStatuses));

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      blockers: {
        mode,
        value: mode === 'org-defined' ? currentValue : null,
      },
    });
  };

  const handleToggleMethod = (method: 'useFlags' | 'useLabels' | 'useStatus' | 'useLinks') => {
    onUpdate({
      blockers: {
        mode: currentMode,
        value: { ...currentValue, [method]: !currentValue[method] },
      },
    });
  };

  const handleFlagNamesChange = (value: string) => {
    const flags = value.split(',').map((s) => s.trim()).filter(Boolean);
    onUpdate({
      blockers: {
        mode: currentMode,
        value: { ...currentValue, flagNames: flags },
      },
    });
  };

  const handleLabelPatternsChange = (value: string) => {
    const patterns = value.split(',').map((s) => s.trim()).filter(Boolean);
    onUpdate({
      blockers: {
        mode: currentMode,
        value: { ...currentValue, labelPatterns: patterns },
      },
    });
  };

  const handleBlockedStatusesChange = (statuses: string[]) => {
    onUpdate({
      blockers: {
        mode: currentMode,
        value: { ...currentValue, blockedStatuses: statuses },
      },
    });
  };

  const handleLinkTypesChange = (value: string) => {
    const types = value.split(',').map((s) => s.trim()).filter(Boolean);
    onUpdate({
      blockers: {
        mode: currentMode,
        value: { ...currentValue, linkTypes: types },
      },
    });
  };

  const toggleBlockedStatus = (status: string) => {
    const current = currentValue.blockedStatuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    handleBlockedStatusesChange(updated);
  };

  // Generate a preview of the blocker detection logic
  const getBlockerPreview = () => {
    const conditions: string[] = [];
    if (currentValue.useFlags && currentValue.flagNames?.length) {
      conditions.push(`Flag = "${currentValue.flagNames.join('" OR Flag = "')}"`);
    }
    if (currentValue.useLabels && currentValue.labelPatterns?.length) {
      conditions.push(`Labels CONTAINS "${currentValue.labelPatterns.join('" OR Labels CONTAINS "')}"`);
    }
    if (currentValue.useStatus && currentValue.blockedStatuses?.length) {
      conditions.push(`Status IN ("${currentValue.blockedStatuses.join('", "')}")`);
    }
    if (currentValue.useLinks && currentValue.linkTypes?.length) {
      conditions.push(`"${currentValue.linkTypes.join('" OR "')}"`);
    }
    return conditions.length > 0 ? conditions.join('\nOR\n') : 'No methods selected';
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Configure how blockers are detected in your Jira issues. Teams may use different
          methods to indicate blocked work - select all methods that apply to your organization.
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
              <span style={styles.modeDesc}>Define how blockers are identified for all teams</span>
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
              <span style={styles.modeDesc}>Teams configure their own blocker detection</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && (
        <>
          <div style={styles.methodsSection}>
            <h3 style={styles.sectionTitle}>Blocker Detection Methods</h3>
            <p style={styles.sectionDesc}>
              Select all methods your teams use to indicate blocked work. Multiple methods can be combined.
            </p>

            {/* Flags Method */}
            <div style={styles.methodCard}>
              <div
                style={styles.methodHeader}
                onClick={() => handleToggleMethod('useFlags')}
              >
                <div style={styles.methodCheckbox}>
                  {currentValue.useFlags ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="4" fill="#6554C0"/>
                      <path d="M5 10l3 3 7-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1" y="1" width="18" height="18" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div style={styles.methodInfo}>
                  <span style={styles.methodName}>Using Flags</span>
                  <span style={styles.methodDesc}>Detect blocked issues via Jira flags</span>
                </div>
              </div>
              {currentValue.useFlags && (
                <div style={styles.methodConfig}>
                  <label style={styles.configLabel}>Flag names (comma-separated):</label>
                  <input
                    type="text"
                    style={styles.configInput}
                    value={currentValue.flagNames?.join(', ') || ''}
                    onChange={(e) => handleFlagNamesChange(e.target.value)}
                    placeholder="Blocked, Impediment"
                  />
                </div>
              )}
            </div>

            {/* Labels Method */}
            <div style={styles.methodCard}>
              <div
                style={styles.methodHeader}
                onClick={() => handleToggleMethod('useLabels')}
              >
                <div style={styles.methodCheckbox}>
                  {currentValue.useLabels ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="4" fill="#6554C0"/>
                      <path d="M5 10l3 3 7-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1" y="1" width="18" height="18" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div style={styles.methodInfo}>
                  <span style={styles.methodName}>Using Labels</span>
                  <span style={styles.methodDesc}>Detect blocked issues via label patterns</span>
                </div>
              </div>
              {currentValue.useLabels && (
                <div style={styles.methodConfig}>
                  <label style={styles.configLabel}>Label patterns (comma-separated):</label>
                  <input
                    type="text"
                    style={styles.configInput}
                    value={currentValue.labelPatterns?.join(', ') || ''}
                    onChange={(e) => handleLabelPatternsChange(e.target.value)}
                    placeholder="blocked, impediment, waiting-on"
                  />
                </div>
              )}
            </div>

            {/* Status Method */}
            <div style={styles.methodCard}>
              <div
                style={styles.methodHeader}
                onClick={() => handleToggleMethod('useStatus')}
              >
                <div style={styles.methodCheckbox}>
                  {currentValue.useStatus ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="4" fill="#6554C0"/>
                      <path d="M5 10l3 3 7-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1" y="1" width="18" height="18" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div style={styles.methodInfo}>
                  <span style={styles.methodName}>Using a 'Blocked' Status</span>
                  <span style={styles.methodDesc}>Detect blocked issues via workflow status</span>
                </div>
              </div>
              {currentValue.useStatus && (
                <div style={styles.methodConfig}>
                  <label style={styles.configLabel}>Select blocked statuses:</label>
                  <div style={styles.statusGrid}>
                    {uniqueStatuses.length > 0 ? (
                      uniqueStatuses.map((status) => (
                        <button
                          key={status}
                          style={{
                            ...styles.statusButton,
                            ...(currentValue.blockedStatuses?.includes(status) ? styles.statusButtonActive : {}),
                          }}
                          onClick={() => toggleBlockedStatus(status)}
                        >
                          {status}
                        </button>
                      ))
                    ) : (
                      <p style={styles.noStatusesHint}>
                        Configure workflows first to select blocked statuses
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Links Method */}
            <div style={styles.methodCard}>
              <div
                style={styles.methodHeader}
                onClick={() => handleToggleMethod('useLinks')}
              >
                <div style={styles.methodCheckbox}>
                  {currentValue.useLinks ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect width="20" height="20" rx="4" fill="#6554C0"/>
                      <path d="M5 10l3 3 7-7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="1" y="1" width="18" height="18" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
                <div style={styles.methodInfo}>
                  <span style={styles.methodName}>Linking to Blocking Issues</span>
                  <span style={styles.methodDesc}>Detect blocked issues via issue links</span>
                </div>
              </div>
              {currentValue.useLinks && (
                <div style={styles.methodConfig}>
                  <label style={styles.configLabel}>Link types (comma-separated):</label>
                  <input
                    type="text"
                    style={styles.configInput}
                    value={currentValue.linkTypes?.join(', ') || ''}
                    onChange={(e) => handleLinkTypesChange(e.target.value)}
                    placeholder="is blocked by, depends on"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div style={styles.previewSection}>
            <h4 style={styles.previewTitle}>Detection Logic Preview</h4>
            <div style={styles.previewBox}>
              <pre style={styles.previewCode}>{getBlockerPreview()}</pre>
            </div>
            <p style={styles.previewHint}>
              Issues matching any of these conditions will be identified as blocked.
            </p>
          </div>
        </>
      )}

      {currentMode === 'team-decides' && (
        <div style={styles.teamDecidesInfo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6B778C" strokeWidth="2"/>
            <path d="M12 8v4M12 14h.01" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={styles.teamDecidesContent}>
            <p style={styles.teamDecidesTitle}>Teams will configure their own blocker detection</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will select how they indicate blocked work.
              This is recommended when teams have different conventions for tracking blockers.
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
  methodsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  methodHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  methodCheckbox: {
    flexShrink: 0,
  },
  methodInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  methodName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  methodDesc: {
    fontSize: '13px',
    color: '#6B778C',
  },
  methodConfig: {
    padding: '12px 16px 16px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#F7F8FA',
  },
  configLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  configInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  statusGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  statusButton: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  statusButtonActive: {
    backgroundColor: '#6554C0',
    borderColor: '#6554C0',
    color: '#FFFFFF',
  },
  noStatusesHint: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  previewSection: {
    padding: '16px 20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  previewTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  previewBox: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #DFE1E6',
    overflow: 'auto',
  },
  previewCode: {
    margin: 0,
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#172B4D',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  previewHint: {
    margin: '12px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
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

export default JiraStandardsStep8Blockers;
