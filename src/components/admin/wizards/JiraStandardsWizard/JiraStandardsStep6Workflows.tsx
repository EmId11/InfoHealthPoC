import React, { useState } from 'react';
import {
  OrganizationDefaults,
  SettingMode,
  WorkflowConfig,
  WorkflowStatus,
} from '../../../../types/admin';
import {
  inferWorkflows,
  getDefaultIssueTypes,
  getStatusCategories,
} from '../../../../utils/jiraInference';

interface JiraStandardsStep6WorkflowsProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'todo': { bg: '#DEEBFF', text: '#0747A6', border: '#4C9AFF' },
  'in-progress': { bg: '#EAE6FF', text: '#403294', border: '#8777D9' },
  'done': { bg: '#E3FCEF', text: '#006644', border: '#57D9A3' },
};

const JiraStandardsStep6Workflows: React.FC<JiraStandardsStep6WorkflowsProps> = ({
  defaults,
  onUpdate,
}) => {
  const [expandedIssueType, setExpandedIssueType] = useState<string | null>('Story');
  const [isInferring, setIsInferring] = useState(false);

  const currentMode = defaults.workflows?.mode || 'org-defined';
  const currentValue = defaults.workflows?.value || [];
  const statusCategories = getStatusCategories();

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      workflows: {
        mode,
        value: mode === 'org-defined' ? (currentValue.length > 0 ? currentValue : inferWorkflows(getDefaultIssueTypes())) : null,
      },
    });
  };

  const handleInferFromJira = async () => {
    setIsInferring(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const inferredWorkflows = inferWorkflows(getDefaultIssueTypes());
    onUpdate({
      workflows: {
        mode: currentMode,
        value: inferredWorkflows,
      },
    });
    setIsInferring(false);
  };

  const handleStatusCategoryChange = (
    issueType: string,
    statusId: string,
    newCategory: 'todo' | 'in-progress' | 'done'
  ) => {
    const updatedWorkflows = currentValue.map((wf) => {
      if (wf.issueType !== issueType) return wf;
      return {
        ...wf,
        statuses: wf.statuses.map((s) =>
          s.statusId === statusId ? { ...s, category: newCategory } : s
        ),
      };
    });
    onUpdate({
      workflows: {
        mode: currentMode,
        value: updatedWorkflows,
      },
    });
  };

  const handleAddStatus = (issueType: string) => {
    const updatedWorkflows = currentValue.map((wf) => {
      if (wf.issueType !== issueType) return wf;
      const newStatus: WorkflowStatus = {
        statusId: `${issueType.toLowerCase()}-custom-${Date.now()}`,
        statusName: 'New Status',
        category: 'in-progress',
      };
      return {
        ...wf,
        statuses: [...wf.statuses, newStatus],
        isInferred: false,
      };
    });
    onUpdate({
      workflows: {
        mode: currentMode,
        value: updatedWorkflows,
      },
    });
  };

  const handleRemoveStatus = (issueType: string, statusId: string) => {
    const updatedWorkflows = currentValue.map((wf) => {
      if (wf.issueType !== issueType) return wf;
      return {
        ...wf,
        statuses: wf.statuses.filter((s) => s.statusId !== statusId),
        isInferred: false,
      };
    });
    onUpdate({
      workflows: {
        mode: currentMode,
        value: updatedWorkflows,
      },
    });
  };

  const handleStatusNameChange = (issueType: string, statusId: string, newName: string) => {
    const updatedWorkflows = currentValue.map((wf) => {
      if (wf.issueType !== issueType) return wf;
      return {
        ...wf,
        statuses: wf.statuses.map((s) =>
          s.statusId === statusId ? { ...s, statusName: newName } : s
        ),
        isInferred: false,
      };
    });
    onUpdate({
      workflows: {
        mode: currentMode,
        value: updatedWorkflows,
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Configure workflow statuses for each issue type. Understanding your workflow helps
          the assessment accurately categorize work states and identify issues stuck in progress.
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
              <span style={styles.modeDesc}>Define workflows that all teams use</span>
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
              <span style={styles.modeDesc}>Teams use their project's workflows</span>
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
              Analyzes your Jira projects to detect workflow configurations
            </span>
          </div>

          <div style={styles.workflowsSection}>
            {currentValue.map((workflow) => (
              <div key={workflow.issueType} style={styles.workflowCard}>
                <button
                  style={styles.workflowHeader}
                  onClick={() => setExpandedIssueType(
                    expandedIssueType === workflow.issueType ? null : workflow.issueType
                  )}
                >
                  <div style={styles.workflowHeaderLeft}>
                    <span style={styles.workflowTitle}>{workflow.issueType}</span>
                    <span style={styles.workflowStatusCount}>
                      {workflow.statuses.length} statuses
                    </span>
                    {workflow.isInferred && (
                      <span style={styles.inferredBadge}>Inferred</span>
                    )}
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      transform: expandedIssueType === workflow.issueType ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {expandedIssueType === workflow.issueType && (
                  <div style={styles.workflowContent}>
                    <div style={styles.statusList}>
                      {workflow.statuses.map((status) => (
                        <div key={status.statusId} style={styles.statusItem}>
                          <input
                            type="text"
                            value={status.statusName}
                            onChange={(e) => handleStatusNameChange(workflow.issueType, status.statusId, e.target.value)}
                            style={styles.statusNameInput}
                          />
                          <div style={styles.categorySelector}>
                            {statusCategories.map((cat) => (
                              <button
                                key={cat.value}
                                style={{
                                  ...styles.categoryButton,
                                  ...(status.category === cat.value ? {
                                    backgroundColor: CATEGORY_COLORS[cat.value].bg,
                                    color: CATEGORY_COLORS[cat.value].text,
                                    borderColor: CATEGORY_COLORS[cat.value].border,
                                  } : {}),
                                }}
                                onClick={() => handleStatusCategoryChange(workflow.issueType, status.statusId, cat.value)}
                              >
                                {cat.label}
                              </button>
                            ))}
                          </div>
                          <button
                            style={styles.removeStatusButton}
                            onClick={() => handleRemoveStatus(workflow.issueType, status.statusId)}
                            title="Remove status"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      style={styles.addStatusButton}
                      onClick={() => handleAddStatus(workflow.issueType)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Add Status
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={styles.categoryLegend}>
            <span style={styles.legendLabel}>Status Categories:</span>
            {statusCategories.map((cat) => (
              <div
                key={cat.value}
                style={{
                  ...styles.legendItem,
                  backgroundColor: CATEGORY_COLORS[cat.value].bg,
                  color: CATEGORY_COLORS[cat.value].text,
                }}
              >
                {cat.label}
              </div>
            ))}
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
            <p style={styles.teamDecidesTitle}>Workflows will be auto-detected per project</p>
            <p style={styles.teamDecidesDesc}>
              The assessment will automatically detect each team's workflow configuration from
              their Jira project settings. This is recommended when teams use different workflows.
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
  workflowsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  workflowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  workflowHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  workflowHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  workflowTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  workflowStatusCount: {
    fontSize: '12px',
    color: '#6B778C',
    padding: '2px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
  },
  inferredBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#00875A',
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    borderRadius: '4px',
  },
  workflowContent: {
    padding: '0 16px 16px 16px',
    borderTop: '1px solid #EBECF0',
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
  },
  statusNameInput: {
    flex: 1,
    padding: '6px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '120px',
  },
  categorySelector: {
    display: 'flex',
    gap: '4px',
  },
  categoryButton: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  removeStatusButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
    transition: 'all 0.15s ease',
  },
  addStatusButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    marginTop: '12px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  categoryLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  legendLabel: {
    fontSize: '13px',
    color: '#6B778C',
    fontWeight: 500,
  },
  legendItem: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
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

export default JiraStandardsStep6Workflows;
