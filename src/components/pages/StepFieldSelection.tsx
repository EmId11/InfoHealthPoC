import React, { useEffect, useState } from 'react';
import { IssueTypeKey, FieldSelectionData, IssueTypeFieldConfig } from '../../types/wizard';
import { generateDefaultFieldConfig, generatePerTeamFieldConfigs } from '../../utils/fieldSelectionUtils';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE } from '../../constants/presets';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';

interface StepFieldSelectionProps {
  data: FieldSelectionData;
  onUpdate: (data: Partial<FieldSelectionData>) => void;
  selectedIssueTypes: IssueTypeKey[];
  selectedTeamIds: string[];
  selectedTeamNames: string[];
}

const issueTypeLabels: Record<string, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};


const fieldTypeBadgeColors: Record<string, { bg: string; color: string }> = {
  text: { bg: '#E3FCEF', color: '#006644' },
  number: { bg: '#DEEBFF', color: '#0747A6' },
  date: { bg: '#EAE6FF', color: '#403294' },
  select: { bg: '#FFF0B3', color: '#172B4D' },
  user: { bg: '#FFEBE6', color: '#BF2600' },
  'multi-select': { bg: '#FFF0B3', color: '#172B4D' },
  link: { bg: '#F4F5F7', color: '#5E6C84' },
};

// Build a deduplicated list of all fields across all issue types
interface MatrixField {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  isCustom: boolean;
  applicableIssueTypes: IssueTypeKey[];
}

function getMatrixFields(selectedIssueTypes: IssueTypeKey[]): MatrixField[] {
  const seen = new Set<string>();
  const fields: MatrixField[] = [];

  for (const jiraField of MOCK_JIRA_FIELDS_BY_ISSUE_TYPE) {
    if (seen.has(jiraField.id)) continue;
    const applicable = jiraField.applicableIssueTypes.filter((t) =>
      selectedIssueTypes.includes(t as IssueTypeKey)
    ) as IssueTypeKey[];
    if (applicable.length === 0) continue;

    seen.add(jiraField.id);
    fields.push({
      fieldId: jiraField.id,
      fieldName: jiraField.name,
      fieldType: jiraField.type,
      isCustom: jiraField.isCustom,
      applicableIssueTypes: applicable,
    });
  }
  return fields;
}

/**
 * Get matrix fields filtered by what a specific team has available.
 * For per-team mode, we derive the applicable fields from the team's config.
 */
function getMatrixFieldsForTeam(
  selectedIssueTypes: IssueTypeKey[],
  teamConfigs: IssueTypeFieldConfig[]
): MatrixField[] {
  const seen = new Set<string>();
  const fields: MatrixField[] = [];

  for (const config of teamConfigs) {
    if (!selectedIssueTypes.includes(config.issueTypeKey)) continue;
    for (const field of config.fields) {
      if (seen.has(field.fieldId)) {
        // Add issue type to existing entry
        const existing = fields.find(f => f.fieldId === field.fieldId);
        if (existing && !existing.applicableIssueTypes.includes(config.issueTypeKey)) {
          existing.applicableIssueTypes.push(config.issueTypeKey);
        }
      } else {
        seen.add(field.fieldId);
        fields.push({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          isCustom: field.isCustom,
          applicableIssueTypes: [config.issueTypeKey],
        });
      }
    }
  }
  return fields;
}

const StepFieldSelection: React.FC<StepFieldSelectionProps> = ({
  data,
  onUpdate,
  selectedIssueTypes,
  selectedTeamIds,
  selectedTeamNames,
}) => {
  const [activeTeamTab, setActiveTeamTab] = useState<string>(selectedTeamIds[0] || '');
  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const hasMultipleTeams = selectedTeamIds.length > 1;

  // Initialize configs if empty or issue types changed
  useEffect(() => {
    if (data.configs.length === 0 || !configsMatchIssueTypes(data.configs, selectedIssueTypes)) {
      const defaultConfigs = generateDefaultFieldConfig(selectedIssueTypes, selectedTeamIds);
      onUpdate({ configs: defaultConfigs });
    }
  }, [selectedIssueTypes.join(',')]); // eslint-disable-line

  // Keep activeTeamTab valid
  useEffect(() => {
    if (!selectedTeamIds.includes(activeTeamTab)) {
      setActiveTeamTab(selectedTeamIds[0] || '');
    }
  }, [selectedTeamIds, activeTeamTab]);

  const configsMatchIssueTypes = (configs: IssueTypeFieldConfig[], issueTypes: IssueTypeKey[]) => {
    const configKeys = configs.map(c => c.issueTypeKey).sort();
    const typeKeys = [...issueTypes].sort();
    return configKeys.length === typeKeys.length && configKeys.every((k, i) => k === typeKeys[i]);
  };

  // Get the active configs (shared or per-team)
  const getActiveConfigs = (): IssueTypeFieldConfig[] => {
    if (data.isPerTeamCustomisation && activeTeamTab) {
      return data.perTeamConfigs[activeTeamTab] || [];
    }
    return data.configs;
  };

  // Get matrix fields for current view
  const activeConfigs = getActiveConfigs();
  const matrixFields = data.isPerTeamCustomisation && activeTeamTab
    ? getMatrixFieldsForTeam(selectedIssueTypes, activeConfigs)
    : getMatrixFields(selectedIssueTypes);
  const standardFields = matrixFields.filter(f => !f.isCustom);
  const customFields = matrixFields.filter(f => f.isCustom);

  // Check if a field is enabled for a given issue type
  const isFieldEnabled = (fieldId: string, issueTypeKey: IssueTypeKey): boolean => {
    const config = activeConfigs.find(c => c.issueTypeKey === issueTypeKey);
    const field = config?.fields.find(f => f.fieldId === fieldId);
    return field?.enabled ?? false;
  };

  // Check if field exists in configs (for per-team mode, a field may not be available)
  const isFieldAvailable = (fieldId: string, issueTypeKey: IssueTypeKey): boolean => {
    const config = activeConfigs.find(c => c.issueTypeKey === issueTypeKey);
    return config?.fields.some(f => f.fieldId === fieldId) ?? false;
  };

  // Update either shared or per-team configs
  const updateConfigs = (newConfigs: IssueTypeFieldConfig[]) => {
    if (data.isPerTeamCustomisation && activeTeamTab) {
      onUpdate({
        perTeamConfigs: {
          ...data.perTeamConfigs,
          [activeTeamTab]: newConfigs,
        },
      });
    } else {
      onUpdate({ configs: newConfigs });
    }
  };

  // Toggle a single cell
  const handleCellToggle = (fieldId: string, issueTypeKey: IssueTypeKey) => {
    const newConfigs = activeConfigs.map(config => {
      if (config.issueTypeKey !== issueTypeKey) return config;
      return {
        ...config,
        fields: config.fields.map(f =>
          f.fieldId === fieldId ? { ...f, enabled: !f.enabled } : f
        ),
      };
    });
    updateConfigs(newConfigs);
  };

  // Toggle entire row (all issue types for a field)
  const handleRowToggle = (field: MatrixField) => {
    const applicableInConfigs = field.applicableIssueTypes.filter(it =>
      isFieldAvailable(field.fieldId, it)
    );
    const allEnabled = applicableInConfigs.every(it => isFieldEnabled(field.fieldId, it));
    const newEnabled = !allEnabled;

    const newConfigs = activeConfigs.map(config => {
      if (!applicableInConfigs.includes(config.issueTypeKey)) return config;
      return {
        ...config,
        fields: config.fields.map(f =>
          f.fieldId === field.fieldId ? { ...f, enabled: newEnabled } : f
        ),
      };
    });
    updateConfigs(newConfigs);
  };

  // Toggle entire column (all fields for an issue type)
  const handleColumnToggle = (issueTypeKey: IssueTypeKey) => {
    const config = activeConfigs.find(c => c.issueTypeKey === issueTypeKey);
    if (!config) return;

    const allEnabled = config.fields.every(f => f.enabled);
    const newEnabled = !allEnabled;

    const newConfigs = activeConfigs.map(c => {
      if (c.issueTypeKey !== issueTypeKey) return c;
      return {
        ...c,
        fields: c.fields.map(f => ({ ...f, enabled: newEnabled })),
      };
    });
    updateConfigs(newConfigs);
  };

  // Handle per-team customisation toggle
  const handlePerTeamToggle = () => {
    if (!data.isPerTeamCustomisation) {
      // Turning ON: generate per-team configs from team availability data
      const perTeamConfigs = generatePerTeamFieldConfigs(selectedIssueTypes, selectedTeamIds);
      onUpdate({
        isPerTeamCustomisation: true,
        perTeamConfigs,
      });
      setActiveTeamTab(selectedTeamIds[0] || '');
    } else {
      // Turning OFF: take the active team's config as the new shared config
      const sharedConfigs = activeTeamTab && data.perTeamConfigs[activeTeamTab]
        ? data.perTeamConfigs[activeTeamTab]
        : data.configs;
      onUpdate({
        isPerTeamCustomisation: false,
        configs: sharedConfigs,
        perTeamConfigs: {},
      });
    }
  };

  // Copy one team's config to the current team
  const handleCopyFrom = (sourceTeamId: string) => {
    const sourceConfigs = data.perTeamConfigs[sourceTeamId];
    if (!sourceConfigs || !activeTeamTab) return;

    // Deep clone the source configs
    const cloned = JSON.parse(JSON.stringify(sourceConfigs)) as IssueTypeFieldConfig[];
    onUpdate({
      perTeamConfigs: {
        ...data.perTeamConfigs,
        [activeTeamTab]: cloned,
      },
    });
    setCopyFromOpen(false);
  };

  // Count enabled per issue type
  const getColumnCount = (issueTypeKey: IssueTypeKey) => {
    const config = activeConfigs.find(c => c.issueTypeKey === issueTypeKey);
    if (!config) return { enabled: 0, total: 0 };
    return {
      enabled: config.fields.filter(f => f.enabled).length,
      total: config.fields.length,
    };
  };

  const renderFieldGroup = (label: string, fields: MatrixField[]) => {
    if (fields.length === 0) return null;
    return (
      <>
        <tr>
          <td
            colSpan={selectedIssueTypes.length + 1}
            style={styles.groupHeaderCell}
          >
            {label}
          </td>
        </tr>
        {fields.map((field) => {
          const typeBadge = fieldTypeBadgeColors[field.fieldType] || fieldTypeBadgeColors.text;
          const applicableInConfigs = field.applicableIssueTypes.filter(it =>
            isFieldAvailable(field.fieldId, it)
          );
          const allEnabled = applicableInConfigs.length > 0 && applicableInConfigs.every(it => isFieldEnabled(field.fieldId, it));
          const someEnabled = applicableInConfigs.some(it => isFieldEnabled(field.fieldId, it));

          return (
            <tr key={field.fieldId} style={styles.fieldRow}>
              <td style={styles.fieldNameCell}>
                <label style={styles.rowLabel} onClick={() => handleRowToggle(field)}>
                  <input
                    type="checkbox"
                    checked={allEnabled}
                    ref={(el) => {
                      if (el) el.indeterminate = !allEnabled && someEnabled;
                    }}
                    onChange={() => handleRowToggle(field)}
                    style={styles.checkbox}
                  />
                  <span style={styles.fieldName}>{field.fieldName}</span>
                  <span style={{
                    ...styles.typeBadge,
                    backgroundColor: typeBadge.bg,
                    color: typeBadge.color,
                  }}>
                    {field.fieldType}
                  </span>
                </label>
              </td>
              {selectedIssueTypes.map((it) => {
                const isApplicable = field.applicableIssueTypes.includes(it);
                const isAvailable = isFieldAvailable(field.fieldId, it);
                if (!isApplicable || !isAvailable) {
                  return (
                    <td key={it} style={styles.matrixCell}>
                      <span style={styles.notApplicable}>--</span>
                    </td>
                  );
                }
                const enabled = isFieldEnabled(field.fieldId, it);
                return (
                  <td key={it} style={styles.matrixCell}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleCellToggle(field.fieldId, it)}
                      style={styles.matrixCheckbox}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </>
    );
  };

  // Total summary
  const totalEnabled = activeConfigs.reduce(
    (sum, c) => sum + c.fields.filter(f => f.enabled).length, 0
  );
  const totalCells = activeConfigs.reduce((sum, c) => sum + c.fields.length, 0);

  // Team name lookup
  const getTeamName = (teamId: string) => {
    const idx = selectedTeamIds.indexOf(teamId);
    return idx >= 0 ? selectedTeamNames[idx] : teamId;
  };

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.issueTypes()}
        title="Field Selection"
        description="Choose which Jira fields to measure for each issue type."
        infoContent={
          <>
            <p>Select the Jira fields you want to measure for completeness.</p>
            <p><strong>Matrix view:</strong> Rows are fields, columns are issue types. Check individual cells, or click the row checkbox to toggle a field across all issue types.</p>
            <p><strong>"--"</strong> means a field doesn't apply to that issue type.</p>
            <p><strong>Standard fields</strong> are built-in Jira fields. <strong>Custom fields</strong> are fields your organisation has added.</p>
          </>
        }
      />

      {/* Per-team toggle (only shown when multiple teams selected) */}
      {hasMultipleTeams && (
        <div style={styles.toggleContainer}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={data.isPerTeamCustomisation}
              onChange={handlePerTeamToggle}
              style={styles.checkbox}
            />
            <div>
              <span style={styles.toggleText}>Customise fields per team</span>
              <span style={styles.toggleDescription}>Different teams may track different fields.</span>
            </div>
          </label>
        </div>
      )}

      {/* Team tabs (when per-team customisation is ON) */}
      {data.isPerTeamCustomisation && hasMultipleTeams && (
        <div style={styles.teamTabSection}>
          <div style={styles.teamTabs}>
            {selectedTeamIds.map((teamId) => (
              <button
                key={teamId}
                style={activeTeamTab === teamId ? styles.teamTabActive : styles.teamTab}
                onClick={() => { setActiveTeamTab(teamId); setCopyFromOpen(false); }}
              >
                {getTeamName(teamId)}
              </button>
            ))}
          </div>
          <div style={styles.teamContextBar}>
            <span style={styles.teamContextText}>
              Editing fields for <strong>{getTeamName(activeTeamTab)}</strong>
            </span>
            <div style={styles.copyFromWrapper}>
              <button
                style={styles.copyFromButton}
                onClick={() => setCopyFromOpen(!copyFromOpen)}
              >
                Import from another team
              </button>
              {copyFromOpen && (
                <div style={styles.copyFromDropdown}>
                  <div style={styles.copyFromHeader}>
                    Import settings to {getTeamName(activeTeamTab)} from:
                  </div>
                  {selectedTeamIds
                    .filter(id => id !== activeTeamTab)
                    .map(teamId => (
                      <button
                        key={teamId}
                        style={styles.copyFromOption}
                        onClick={() => handleCopyFrom(teamId)}
                      >
                        {getTeamName(teamId)}'s settings
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.fieldColumnHeader}>Field</th>
              {selectedIssueTypes.map((it) => {
                const counts = getColumnCount(it);
                const allEnabled = counts.enabled === counts.total && counts.total > 0;
                const someEnabled = counts.enabled > 0 && counts.enabled < counts.total;
                return (
                  <th key={it} style={styles.issueTypeHeader}>
                    <label style={styles.columnHeaderLabel}>
                      <input
                        type="checkbox"
                        checked={allEnabled}
                        ref={(el) => {
                          if (el) el.indeterminate = someEnabled;
                        }}
                        onChange={() => handleColumnToggle(it)}
                        style={styles.checkbox}
                      />
                      <span style={styles.columnHeaderText}>
                        {issueTypeLabels[it] || it}
                      </span>
                    </label>
                    <span style={styles.columnCount}>{counts.enabled}/{counts.total}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {renderFieldGroup('Standard Fields', standardFields)}
            {renderFieldGroup('Custom Fields', customFields)}
          </tbody>
        </table>
      </div>

      <div style={styles.summaryBar}>
        {totalEnabled} of {totalCells} field-checks enabled across {selectedIssueTypes.length} issue type{selectedIssueTypes.length !== 1 ? 's' : ''}
        {data.isPerTeamCustomisation && activeTeamTab && (
          <> for {getTeamName(activeTeamTab)}</>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
  },
  toggleContainer: {
    marginBottom: '16px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
  },
  toggleText: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  toggleDescription: {
    display: 'block',
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '2px',
  },
  teamTabSection: {
    marginBottom: '12px',
  },
  teamTabs: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap' as const,
    marginBottom: '8px',
  },
  teamTab: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  teamTabActive: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    border: '1px solid #B3D4FF',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  teamContextBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  teamContextText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  copyFromWrapper: {
    position: 'relative' as const,
    flexShrink: 0,
  },
  copyFromButton: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  copyFromDropdown: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: 'white',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    boxShadow: '0 4px 8px rgba(9, 30, 66, 0.15)',
    zIndex: 10,
    minWidth: '200px',
    overflow: 'hidden',
  },
  copyFromHeader: {
    padding: '8px 14px 4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
    borderBottom: '1px solid #F4F5F7',
  },
  copyFromOption: {
    display: 'block',
    width: '100%',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    cursor: 'pointer',
  },
  tableWrapper: {
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  fieldColumnHeader: {
    padding: '10px 14px',
    textAlign: 'left' as const,
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #EBECF0',
    width: '280px',
  },
  issueTypeHeader: {
    padding: '8px 6px',
    textAlign: 'center' as const,
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #EBECF0',
    verticalAlign: 'bottom',
  },
  columnHeaderLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  columnHeaderText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  columnCount: {
    display: 'block',
    fontSize: '10px',
    color: '#A5ADBA',
    marginTop: '2px',
  },
  groupHeaderCell: {
    padding: '10px 14px 6px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    backgroundColor: '#F4F5F7',
    borderTop: '1px solid #EBECF0',
  },
  fieldRow: {
    borderBottom: '1px solid #F4F5F7',
  },
  fieldNameCell: {
    padding: '6px 14px',
  },
  rowLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '15px',
    height: '15px',
    cursor: 'pointer',
    accentColor: '#0052CC',
    flexShrink: 0,
  },
  fieldName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    flex: 1,
    minWidth: 0,
  },
  typeBadge: {
    padding: '1px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 500,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  },
  matrixCell: {
    padding: '6px',
    textAlign: 'center' as const,
  },
  matrixCheckbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#0052CC',
  },
  notApplicable: {
    color: '#DFE1E6',
    fontSize: '12px',
    fontWeight: 500,
  },
  summaryBar: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
};

export default StepFieldSelection;
