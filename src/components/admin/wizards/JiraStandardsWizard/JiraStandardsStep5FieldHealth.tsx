import React, { useState } from 'react';
import {
  OrganizationDefaults,
  SettingMode,
  FieldHealthConfig,
  StandardFieldConfig,
  CustomFieldConfig,
} from '../../../../types/admin';
import { inferCustomFields } from '../../../../utils/jiraInference';

interface JiraStandardsStep5FieldHealthProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const DEFAULT_STANDARD_FIELDS: StandardFieldConfig[] = [
  { fieldId: 'acceptanceCriteria', fieldName: 'Acceptance Criteria', description: 'Defined acceptance criteria for stories', enabled: true, isDefault: true },
  { fieldId: 'linkedIssues', fieldName: 'Linked Issues', description: 'Links to related issues', enabled: true, isDefault: true },
  { fieldId: 'parentEpic', fieldName: 'Parent Epic', description: 'Linked to parent epic', enabled: true, isDefault: true },
  { fieldId: 'estimates', fieldName: 'Estimates', description: 'Story points or time estimates', enabled: true, isDefault: true },
  { fieldId: 'assignee', fieldName: 'Assignee', description: 'Assigned team member', enabled: true, isDefault: true },
  { fieldId: 'dueDate', fieldName: 'Due Date', description: 'Target completion date', enabled: true, isDefault: true },
  { fieldId: 'subTasks', fieldName: 'Sub-tasks', description: 'Has sub-task breakdown', enabled: false, isDefault: true },
  { fieldId: 'priority', fieldName: 'Priority', description: 'Issue priority level', enabled: true, isDefault: true },
];

const DEFAULT_FIELD_HEALTH: FieldHealthConfig = {
  standardFields: DEFAULT_STANDARD_FIELDS,
  customFields: [],
};

const JiraStandardsStep5FieldHealth: React.FC<JiraStandardsStep5FieldHealthProps> = ({
  defaults,
  onUpdate,
}) => {
  const [showAddCustomField, setShowAddCustomField] = useState(false);
  const [availableCustomFields] = useState<CustomFieldConfig[]>(inferCustomFields());

  const currentMode = defaults.fieldHealth?.mode || 'org-defined';
  const currentValue = defaults.fieldHealth?.value || DEFAULT_FIELD_HEALTH;

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      fieldHealth: {
        mode,
        value: mode === 'org-defined' ? currentValue : null,
      },
    });
  };

  const handleToggleStandardField = (fieldId: string) => {
    if (!currentValue) return;

    const updatedFields = currentValue.standardFields.map((f) =>
      f.fieldId === fieldId ? { ...f, enabled: !f.enabled } : f
    );

    onUpdate({
      fieldHealth: {
        mode: currentMode,
        value: { ...currentValue, standardFields: updatedFields },
      },
    });
  };

  const handleAddCustomField = (field: CustomFieldConfig) => {
    if (!currentValue) return;

    const alreadyAdded = currentValue.customFields.some((f) => f.id === field.id);
    if (alreadyAdded) return;

    onUpdate({
      fieldHealth: {
        mode: currentMode,
        value: {
          ...currentValue,
          customFields: [...currentValue.customFields, { ...field, enabled: true }],
        },
      },
    });
    setShowAddCustomField(false);
  };

  const handleToggleCustomField = (fieldId: string) => {
    if (!currentValue) return;

    const updatedFields = currentValue.customFields.map((f) =>
      f.id === fieldId ? { ...f, enabled: !f.enabled } : f
    );

    onUpdate({
      fieldHealth: {
        mode: currentMode,
        value: { ...currentValue, customFields: updatedFields },
      },
    });
  };

  const handleRemoveCustomField = (fieldId: string) => {
    if (!currentValue) return;

    onUpdate({
      fieldHealth: {
        mode: currentMode,
        value: {
          ...currentValue,
          customFields: currentValue.customFields.filter((f) => f.id !== fieldId),
        },
      },
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Configure which Jira fields to assess for completeness. Field health metrics help teams
          understand their data quality and ensure issues have the necessary information for
          planning and tracking.
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
              <span style={styles.modeDesc}>All teams assess the same fields</span>
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
              <span style={styles.modeDesc}>Teams configure their own field checks</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && currentValue && (
        <>
          <div style={styles.fieldsSection}>
            <h3 style={styles.fieldsSectionTitle}>Standard Fields</h3>
            <p style={styles.fieldsSectionDesc}>
              Select the Jira fields to include in data trust assessments.
            </p>
            <div style={styles.fieldGrid}>
              {currentValue.standardFields.map((field) => (
                <div
                  key={field.fieldId}
                  style={{
                    ...styles.fieldItem,
                    ...(field.enabled ? styles.fieldItemEnabled : styles.fieldItemDisabled),
                  }}
                  onClick={() => handleToggleStandardField(field.fieldId)}
                >
                  <div style={styles.fieldCheckbox}>
                    {field.enabled ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect width="18" height="18" rx="4" fill="#6554C0"/>
                        <path d="M5 9l2.5 2.5L13 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="1" y="1" width="16" height="16" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                      </svg>
                    )}
                  </div>
                  <div style={styles.fieldContent}>
                    <span style={styles.fieldName}>{field.fieldName}</span>
                    <span style={styles.fieldDesc}>{field.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.customFieldsSection}>
            <div style={styles.customFieldsHeader}>
              <div>
                <h3 style={styles.fieldsSectionTitle}>Custom Fields</h3>
                <p style={styles.fieldsSectionDesc}>
                  Add Jira custom fields to include in assessments.
                </p>
              </div>
              <button
                style={styles.addFieldButton}
                onClick={() => setShowAddCustomField(!showAddCustomField)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Custom Field
              </button>
            </div>

            {showAddCustomField && (
              <div style={styles.addFieldDropdown}>
                <p style={styles.dropdownLabel}>Select a custom field from Jira:</p>
                <div style={styles.dropdownList}>
                  {availableCustomFields
                    .filter((f) => !currentValue.customFields.some((cf) => cf.id === f.id))
                    .map((field) => (
                      <button
                        key={field.id}
                        style={styles.dropdownItem}
                        onClick={() => handleAddCustomField(field)}
                      >
                        <span style={styles.dropdownItemName}>{field.displayName}</span>
                        <span style={styles.dropdownItemDesc}>{field.description}</span>
                      </button>
                    ))}
                  {availableCustomFields.filter(
                    (f) => !currentValue.customFields.some((cf) => cf.id === f.id)
                  ).length === 0 && (
                    <p style={styles.noFieldsText}>All available custom fields have been added.</p>
                  )}
                </div>
              </div>
            )}

            {currentValue.customFields.length > 0 ? (
              <div style={styles.customFieldList}>
                {currentValue.customFields.map((field) => (
                  <div
                    key={field.id}
                    style={{
                      ...styles.customFieldItem,
                      ...(field.enabled ? styles.customFieldItemEnabled : styles.customFieldItemDisabled),
                    }}
                  >
                    <div
                      style={styles.customFieldToggle}
                      onClick={() => handleToggleCustomField(field.id)}
                    >
                      {field.enabled ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect width="18" height="18" rx="4" fill="#6554C0"/>
                          <path d="M5 9l2.5 2.5L13 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="1" y="1" width="16" height="16" rx="3" stroke="#DFE1E6" strokeWidth="2"/>
                        </svg>
                      )}
                    </div>
                    <div style={styles.customFieldContent}>
                      <span style={styles.customFieldName}>{field.displayName}</span>
                      <span style={styles.customFieldJiraId}>{field.jiraFieldId}</span>
                    </div>
                    <button
                      style={styles.removeFieldButton}
                      onClick={() => handleRemoveCustomField(field.id)}
                      title="Remove custom field"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noCustomFields}>
                <p style={styles.noCustomFieldsText}>
                  No custom fields added yet. Click "Add Custom Field" to include additional Jira fields.
                </p>
              </div>
            )}
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
            <p style={styles.teamDecidesTitle}>Teams will configure their own field health checks</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, each team will select which fields to include in their
              data trust analysis. This is recommended when teams have different
              documentation requirements.
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
  fieldsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  fieldsSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  fieldsSectionDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  fieldItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '1px solid #EBECF0',
  },
  fieldItemEnabled: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6554C0',
  },
  fieldItemDisabled: {
    backgroundColor: '#FFFFFF',
  },
  fieldCheckbox: {
    flexShrink: 0,
    marginTop: '2px',
  },
  fieldContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  fieldName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  fieldDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  customFieldsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
  },
  customFieldsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addFieldButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  addFieldDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    padding: '16px',
  },
  dropdownLabel: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  dropdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  dropdownItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dropdownItemName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  dropdownItemDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  noFieldsText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '12px',
  },
  customFieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  customFieldItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  customFieldItemEnabled: {
    backgroundColor: '#FFFFFF',
  },
  customFieldItemDisabled: {
    backgroundColor: '#F7F8FA',
    opacity: 0.7,
  },
  customFieldToggle: {
    cursor: 'pointer',
    flexShrink: 0,
  },
  customFieldContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  customFieldName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  customFieldJiraId: {
    fontSize: '12px',
    color: '#6B778C',
    fontFamily: 'monospace',
  },
  removeFieldButton: {
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
  noCustomFields: {
    padding: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    textAlign: 'center',
  },
  noCustomFieldsText: {
    margin: 0,
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

export default JiraStandardsStep5FieldHealth;
