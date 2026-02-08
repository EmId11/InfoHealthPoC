import React, { useState } from 'react';
import {
  OrganizationDefaults,
  SettingMode,
  EstimationPolicy,
} from '../../../../types/admin';
import {
  inferEstimationPolicies,
  getDefaultIssueTypes,
  getEstimationFields,
  getEstimationTriggers,
} from '../../../../utils/jiraInference';

interface JiraStandardsStep7EstimationProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const JiraStandardsStep7Estimation: React.FC<JiraStandardsStep7EstimationProps> = ({
  defaults,
  onUpdate,
}) => {
  const [isInferring, setIsInferring] = useState(false);

  const currentMode = defaults.estimation?.mode || 'org-defined';
  const currentValue = defaults.estimation?.value || [];
  const estimationFields = getEstimationFields();
  const estimationTriggers = getEstimationTriggers();

  // Get workflow statuses for trigger selection
  const workflowStatuses = defaults.workflows?.value?.flatMap((wf) =>
    wf.statuses.map((s) => ({ issueType: wf.issueType, ...s }))
  ) || [];

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      estimation: {
        mode,
        value: mode === 'org-defined'
          ? (currentValue.length > 0 ? currentValue : inferEstimationPolicies(getDefaultIssueTypes()))
          : null,
      },
    });
  };

  const handleInferFromJira = async () => {
    setIsInferring(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const inferredPolicies = inferEstimationPolicies(getDefaultIssueTypes());
    onUpdate({
      estimation: {
        mode: currentMode,
        value: inferredPolicies,
      },
    });
    setIsInferring(false);
  };

  const handleToggleEstimation = (issueType: string) => {
    const updatedPolicies = currentValue.map((p) =>
      p.issueType === issueType ? { ...p, isEstimated: !p.isEstimated, isInferred: false } : p
    );
    onUpdate({
      estimation: {
        mode: currentMode,
        value: updatedPolicies,
      },
    });
  };

  const handleFieldChange = (issueType: string, field: 'storyPoints' | 'timeEstimate' | 'custom') => {
    const updatedPolicies = currentValue.map((p) =>
      p.issueType === issueType ? { ...p, estimationField: field, isInferred: false } : p
    );
    onUpdate({
      estimation: {
        mode: currentMode,
        value: updatedPolicies,
      },
    });
  };

  const handleTriggerChange = (issueType: string, trigger: 'onCreation' | 'onTransition' | 'manual') => {
    const updatedPolicies = currentValue.map((p) =>
      p.issueType === issueType
        ? { ...p, estimationTrigger: trigger, triggerStatus: undefined, isInferred: false }
        : p
    );
    onUpdate({
      estimation: {
        mode: currentMode,
        value: updatedPolicies,
      },
    });
  };

  const handleTriggerStatusChange = (issueType: string, statusName: string) => {
    const updatedPolicies = currentValue.map((p) =>
      p.issueType === issueType ? { ...p, triggerStatus: statusName, isInferred: false } : p
    );
    onUpdate({
      estimation: {
        mode: currentMode,
        value: updatedPolicies,
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Configure estimation requirements for each issue type. Define when and how issues
          should be estimated to help teams maintain accurate planning and forecasting.
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
              <span style={styles.modeDesc}>Define estimation requirements for all teams</span>
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
              <span style={styles.modeDesc}>Teams configure their own estimation policies</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && (
        <>
          <div style={styles.inferSection}>
            <button
              style={styles.inferButton}
              onClick={handleInferFromJira}
              disabled={isInferring}
            >
              {isInferring ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="8"/>
                  </svg>
                  Inferring...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.76 3.76l1.41 1.41M10.83 10.83l1.41 1.41M3.76 12.24l1.41-1.41M10.83 5.17l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Infer from Jira
                </>
              )}
            </button>
            <span style={styles.inferHint}>
              Analyzes your Jira projects to detect estimation patterns
            </span>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Issue Type</th>
                  <th style={styles.tableHeader}>Estimated?</th>
                  <th style={styles.tableHeader}>Field</th>
                  <th style={styles.tableHeader}>When?</th>
                </tr>
              </thead>
              <tbody>
                {currentValue.map((policy) => (
                  <tr key={policy.issueType} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.issueTypeCell}>
                        <span style={styles.issueTypeName}>{policy.issueType}</span>
                        {policy.isInferred && (
                          <span style={styles.inferredBadge}>Inferred</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        style={{
                          ...styles.toggleButton,
                          ...(policy.isEstimated ? styles.toggleButtonActive : {}),
                        }}
                        onClick={() => handleToggleEstimation(policy.issueType)}
                      >
                        <div style={{
                          ...styles.toggleKnob,
                          ...(policy.isEstimated ? styles.toggleKnobActive : {}),
                        }} />
                      </button>
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        style={styles.selectInput}
                        value={policy.estimationField}
                        onChange={(e) => handleFieldChange(
                          policy.issueType,
                          e.target.value as 'storyPoints' | 'timeEstimate' | 'custom'
                        )}
                        disabled={!policy.isEstimated}
                      >
                        {estimationFields.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.triggerCell}>
                        <select
                          style={styles.selectInput}
                          value={policy.estimationTrigger}
                          onChange={(e) => handleTriggerChange(
                            policy.issueType,
                            e.target.value as 'onCreation' | 'onTransition' | 'manual'
                          )}
                          disabled={!policy.isEstimated}
                        >
                          {estimationTriggers.map((trigger) => (
                            <option key={trigger.value} value={trigger.value}>
                              {trigger.label}
                            </option>
                          ))}
                        </select>
                        {policy.estimationTrigger === 'onTransition' && policy.isEstimated && (
                          <select
                            style={styles.statusSelectInput}
                            value={policy.triggerStatus || ''}
                            onChange={(e) => handleTriggerStatusChange(policy.issueType, e.target.value)}
                          >
                            <option value="">Select status...</option>
                            {workflowStatuses
                              .filter((s) => s.issueType === policy.issueType)
                              .map((s) => (
                                <option key={s.statusId} value={s.statusName}>
                                  {s.statusName}
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.legendBox}>
            <h4 style={styles.legendTitle}>Understanding Estimation Triggers</h4>
            <div style={styles.legendItems}>
              <div style={styles.legendItem}>
                <span style={styles.legendLabel}>On Creation:</span>
                <span style={styles.legendDesc}>Issue must be estimated when created</span>
              </div>
              <div style={styles.legendItem}>
                <span style={styles.legendLabel}>On Transition:</span>
                <span style={styles.legendDesc}>Issue must be estimated when moving to a specific status</span>
              </div>
              <div style={styles.legendItem}>
                <span style={styles.legendLabel}>Manual:</span>
                <span style={styles.legendDesc}>No requirement enforced; estimation is optional</span>
              </div>
            </div>
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
            <p style={styles.teamDecidesTitle}>Teams will configure their own estimation policies</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will define when estimation is required for
              different issue types. This is recommended when teams have different estimation
              practices.
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
  inferSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  inferButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  inferHint: {
    fontSize: '13px',
    color: '#6B778C',
  },
  tableContainer: {
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textAlign: 'left',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #EBECF0',
  },
  tableRow: {
    borderBottom: '1px solid #EBECF0',
  },
  tableCell: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  issueTypeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  issueTypeName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  inferredBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#00875A',
    padding: '2px 6px',
    backgroundColor: '#E3FCEF',
    borderRadius: '4px',
  },
  toggleButton: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#DFE1E6',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.15s ease',
  },
  toggleButtonActive: {
    backgroundColor: '#6554C0',
  },
  toggleKnob: {
    width: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: '3px',
    left: '3px',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleKnobActive: {
    left: '23px',
  },
  selectInput: {
    padding: '8px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    minWidth: '140px',
  },
  triggerCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusSelectInput: {
    padding: '6px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#172B4D',
    backgroundColor: '#F7F8FA',
  },
  legendBox: {
    padding: '16px 20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  legendTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  legendItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  legendLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    minWidth: '100px',
  },
  legendDesc: {
    fontSize: '13px',
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

export default JiraStandardsStep7Estimation;
