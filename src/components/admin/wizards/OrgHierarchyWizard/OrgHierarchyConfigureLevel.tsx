import React, { useState, useMemo } from 'react';
import {
  OrgHierarchyLevel,
  TeamAttributeConfig,
  AttributeValue,
  FilterRule,
  FilterCondition,
  FilterField,
  FilterOperator,
  evaluateFilterRule,
} from '../../../../types/admin';
import { mockTeams, TeamOption } from '../../../../constants/presets';

interface OrgHierarchyConfigureLevelProps {
  level: OrgHierarchyLevel;
  parentLevel?: OrgHierarchyLevel;
  categorization: TeamAttributeConfig;
  onUpdateCategorization: (config: TeamAttributeConfig) => void;
}

/**
 * Dynamic step component for creating values for a specific hierarchy level.
 * Shows CRUD list of values with parent selection and filter rule builder.
 */
const OrgHierarchyConfigureLevel: React.FC<OrgHierarchyConfigureLevelProps> = ({
  level,
  parentLevel,
  categorization,
  onUpdateCategorization,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);

  // Get the attribute for this level
  const levelAttribute = categorization.attributes.find(
    (attr) => attr.type === 'org-structure' && attr.name.toLowerCase() === level.name.toLowerCase()
  );

  // Get values for this level
  const levelValues = categorization.attributeValues.filter(
    (val) => val.attributeId === levelAttribute?.id
  );

  // Get parent attribute and its values (if applicable)
  const parentAttribute = parentLevel
    ? categorization.attributes.find(
        (attr) => attr.type === 'org-structure' && attr.name.toLowerCase() === parentLevel.name.toLowerCase()
      )
    : null;

  const parentValues = parentAttribute
    ? categorization.attributeValues.filter((val) => val.attributeId === parentAttribute.id)
    : [];

  const handleAddValue = () => {
    setEditingValue(null);
    setIsEditorOpen(true);
  };

  const handleEditValue = (value: AttributeValue) => {
    setEditingValue(value);
    setIsEditorOpen(true);
  };

  const handleDeleteValue = (valueId: string) => {
    const updatedValues = categorization.attributeValues.filter((v) => v.id !== valueId);
    onUpdateCategorization({
      ...categorization,
      attributeValues: updatedValues,
      categoryValues: updatedValues,
    });
  };

  const handleSaveValue = (value: AttributeValue) => {
    let updatedValues: AttributeValue[];
    if (editingValue) {
      // Update existing
      updatedValues = categorization.attributeValues.map((v) =>
        v.id === editingValue.id ? value : v
      );
    } else {
      // Add new
      updatedValues = [...categorization.attributeValues, value];
    }
    onUpdateCategorization({
      ...categorization,
      attributeValues: updatedValues,
      categoryValues: updatedValues,
    });
    setIsEditorOpen(false);
    setEditingValue(null);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingValue(null);
  };

  // Get parent name for a value
  const getParentName = (parentValueId?: string) => {
    if (!parentValueId) return null;
    const parentValue = parentValues.find((pv) => pv.id === parentValueId);
    return parentValue?.name || 'Unknown';
  };

  // Count teams matching a value
  const getMatchingTeamCount = (value: AttributeValue): number => {
    const filterMatched = mockTeams.filter((team) =>
      evaluateFilterRule(value.filterRule, { label: team.label, value: team.value, isOnboarded: team.isOnboarded })
    );
    const manualCount = value.manualTeamIds?.length || 0;
    const uniqueTeams = new Set([...filterMatched.map((t) => t.value), ...(value.manualTeamIds || [])]);
    return uniqueTeams.size;
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Create your {level.pluralName.toLowerCase()}. Each {level.name.toLowerCase()} can contain
          {parentLevel ? ` multiple ${parentLevel.pluralName.toLowerCase()} and` : ''} multiple teams.
          You can use filter rules to automatically assign teams based on their name or key.
        </p>
      </div>

      {/* Values List */}
      <div style={styles.valuesList}>
        {levelValues.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="32" height="24" rx="4" stroke="#DFE1E6" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M24 20v8M20 24h8" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p style={styles.emptyText}>
              No {level.pluralName.toLowerCase()} created yet.
            </p>
            <button style={styles.primaryButton} onClick={handleAddValue}>
              Create First {level.name}
            </button>
          </div>
        ) : (
          <>
            <div style={styles.listHeader}>
              <span style={styles.listTitle}>{levelValues.length} {levelValues.length === 1 ? level.name : level.pluralName}</span>
              <button style={styles.addButton} onClick={handleAddValue}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Add {level.name}
              </button>
            </div>
            <div style={styles.valuesGrid}>
              {levelValues.map((value) => (
                <div key={value.id} style={styles.valueCard}>
                  <div style={styles.valueHeader}>
                    <div
                      style={{
                        ...styles.colorDot,
                        backgroundColor: level.color,
                      }}
                    />
                    <span style={styles.valueName}>{value.name}</span>
                  </div>
                  {parentLevel && value.parentValueId && (
                    <div style={styles.parentInfo}>
                      <span style={styles.parentLabel}>{parentLevel.name}:</span>
                      <span style={styles.parentValue}>{getParentName(value.parentValueId)}</span>
                    </div>
                  )}
                  <div style={styles.valueStats}>
                    <span style={styles.teamCount}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M7 5h4M5 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {getMatchingTeamCount(value)} teams
                    </span>
                    {value.filterRule && value.filterRule.conditions.length > 0 && (
                      <span style={styles.filterBadge}>Auto-assign</span>
                    )}
                  </div>
                  <div style={styles.valueActions}>
                    <button style={styles.iconButton} onClick={() => handleEditValue(value)} title="Edit">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M10 2l2 2L5 11H3V9l7-7z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button style={styles.iconButton} onClick={() => handleDeleteValue(value.id)} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1m1 0v7a1 1 0 01-1 1H5a1 1 0 01-1-1V4h6z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Value Editor Modal */}
      {isEditorOpen && (
        <ValueEditorModal
          level={level}
          parentLevel={parentLevel}
          parentValues={parentValues}
          attributeId={levelAttribute?.id || `cat-${level.id}`}
          value={editingValue}
          allTeams={mockTeams}
          onSave={handleSaveValue}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
};

// ============================================
// Value Editor Modal
// ============================================
interface ValueEditorModalProps {
  level: OrgHierarchyLevel;
  parentLevel?: OrgHierarchyLevel;
  parentValues: AttributeValue[];
  attributeId: string;
  value: AttributeValue | null;
  allTeams: TeamOption[];
  onSave: (value: AttributeValue) => void;
  onClose: () => void;
}

const ValueEditorModal: React.FC<ValueEditorModalProps> = ({
  level,
  parentLevel,
  parentValues,
  attributeId,
  value,
  allTeams,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(value?.name || '');
  const [parentValueId, setParentValueId] = useState(value?.parentValueId || '');
  const [filterRule, setFilterRule] = useState<FilterRule>(
    value?.filterRule || { conditions: [] }
  );
  const [manualTeamIds, setManualTeamIds] = useState<string[]>(value?.manualTeamIds || []);

  // Get teams matching the filter rule
  const filterMatchedTeamIds = useMemo(() => {
    return allTeams
      .filter((team) =>
        evaluateFilterRule(filterRule, { label: team.label, value: team.value, isOnboarded: team.isOnboarded })
      )
      .map((t) => t.value);
  }, [filterRule, allTeams]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newValue: AttributeValue = {
      id: value?.id || `val-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      attributeId,
      categoryId: attributeId,
      name: name.trim(),
      filterRule: filterRule.conditions.length > 0 ? filterRule : null,
      manualTeamIds,
      parentValueId: parentValueId || undefined,
      createdAt: value?.createdAt || new Date().toISOString(),
      createdBy: value?.createdBy || 'System',
    };

    onSave(newValue);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            {value ? `Edit ${level.name}` : `Create ${level.name}`}
          </h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          {/* Name Input */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g., Consumer ${level.name}`}
              style={modalStyles.input}
              autoFocus
            />
          </div>

          {/* Parent Selection (if applicable) */}
          {parentLevel && parentValues.length > 0 && (
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Belongs to {parentLevel.name}</label>
              <select
                value={parentValueId}
                onChange={(e) => setParentValueId(e.target.value)}
                style={modalStyles.select}
              >
                <option value="">None (independent)</option>
                {parentValues.map((pv) => (
                  <option key={pv.id} value={pv.id}>
                    {pv.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Rule Builder */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Auto-assign teams matching</label>
            <FilterRuleBuilder rule={filterRule} onChange={setFilterRule} />
          </div>

          {/* Team Preview */}
          <div style={modalStyles.previewSection}>
            <div style={modalStyles.previewHeader}>
              <span style={modalStyles.previewTitle}>Team Assignment Preview</span>
              <span style={modalStyles.previewCount}>
                {new Set([...filterMatchedTeamIds, ...manualTeamIds]).size} teams selected
              </span>
            </div>
            <TeamPicker
              allTeams={allTeams}
              selectedTeamIds={manualTeamIds}
              filterMatchedTeamIds={filterMatchedTeamIds}
              onChange={setManualTeamIds}
            />
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={modalStyles.submitButton}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {value ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Filter Rule Builder Component
// ============================================
interface FilterRuleBuilderProps {
  rule: FilterRule;
  onChange: (rule: FilterRule) => void;
}

const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: 'teamName', label: 'Team Name' },
  { value: 'teamKey', label: 'Team Key' },
  { value: 'isOnboarded', label: 'Is Onboarded' },
];

const OPERATOR_OPTIONS: { value: FilterOperator; label: string; forFields: FilterField[] }[] = [
  { value: 'equals', label: 'equals', forFields: ['teamName', 'teamKey'] },
  { value: 'notEquals', label: 'not equals', forFields: ['teamName', 'teamKey'] },
  { value: 'contains', label: 'contains', forFields: ['teamName', 'teamKey'] },
  { value: 'startsWith', label: 'starts with', forFields: ['teamName', 'teamKey'] },
  { value: 'endsWith', label: 'ends with', forFields: ['teamName', 'teamKey'] },
  { value: 'isTrue', label: 'is true', forFields: ['isOnboarded'] },
  { value: 'isFalse', label: 'is false', forFields: ['isOnboarded'] },
];

const FilterRuleBuilder: React.FC<FilterRuleBuilderProps> = ({ rule, onChange }) => {
  const addCondition = () => {
    onChange({
      conditions: [
        ...rule.conditions,
        { field: 'teamName', operator: 'contains', value: '' },
      ],
    });
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...rule.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };

    if (updates.operator === 'isTrue' || updates.operator === 'isFalse') {
      newConditions[index].value = true;
    }

    onChange({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    onChange({
      conditions: rule.conditions.filter((_, i) => i !== index),
    });
  };

  const getOperatorsForField = (field: FilterField) => {
    return OPERATOR_OPTIONS.filter((op) => op.forFields.includes(field));
  };

  return (
    <div style={filterStyles.container}>
      {rule.conditions.length > 0 && (
        <p style={filterStyles.hint}>All conditions must match (AND logic)</p>
      )}

      {rule.conditions.map((condition, index) => (
        <div key={index} style={filterStyles.condition}>
          <select
            value={condition.field}
            onChange={(e) => {
              const newField = e.target.value as FilterField;
              const validOperators = getOperatorsForField(newField);
              const newOperator = validOperators[0]?.value || 'equals';
              updateCondition(index, { field: newField, operator: newOperator, value: '' });
            }}
            style={filterStyles.select}
          >
            {FIELD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={condition.operator}
            onChange={(e) => updateCondition(index, { operator: e.target.value as FilterOperator })}
            style={filterStyles.select}
          >
            {getOperatorsForField(condition.field).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {condition.operator !== 'isTrue' && condition.operator !== 'isFalse' && (
            <input
              type="text"
              value={typeof condition.value === 'string' ? condition.value : ''}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              placeholder="Value"
              style={filterStyles.input}
            />
          )}

          <button style={filterStyles.removeButton} onClick={() => removeCondition(index)} title="Remove">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}

      <button style={filterStyles.addButton} onClick={addCondition}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add Condition
      </button>
    </div>
  );
};

// ============================================
// Team Picker Component
// ============================================
interface TeamPickerProps {
  allTeams: TeamOption[];
  selectedTeamIds: string[];
  filterMatchedTeamIds: string[];
  onChange: (teamIds: string[]) => void;
}

const TeamPicker: React.FC<TeamPickerProps> = ({
  allTeams,
  selectedTeamIds,
  filterMatchedTeamIds,
  onChange,
}) => {
  const [search, setSearch] = useState('');

  const filteredTeams = allTeams.filter((team) =>
    team.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      onChange(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      onChange([...selectedTeamIds, teamId]);
    }
  };

  return (
    <div style={pickerStyles.container}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search teams..."
        style={pickerStyles.search}
      />
      <div style={pickerStyles.list}>
        {filteredTeams.map((team) => {
          const isFilterMatched = filterMatchedTeamIds.includes(team.value);
          const isManuallySelected = selectedTeamIds.includes(team.value);

          return (
            <label
              key={team.value}
              style={{
                ...pickerStyles.item,
                backgroundColor: isFilterMatched ? '#DEEBFF' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isManuallySelected || isFilterMatched}
                disabled={isFilterMatched}
                onChange={() => toggleTeam(team.value)}
                style={pickerStyles.checkbox}
              />
              <span style={pickerStyles.teamName}>{team.label}</span>
              {isFilterMatched && (
                <span style={pickerStyles.filterBadge}>via filter</span>
              )}
              {isManuallySelected && !isFilterMatched && (
                <span style={pickerStyles.manualBadge}>manual</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// Styles
// ============================================
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
  valuesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    border: '2px dashed #DFE1E6',
  },
  emptyIcon: {
    marginBottom: '16px',
  },
  emptyText: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  valueCard: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  valueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  colorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  valueName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  parentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  parentLabel: {
    color: '#6B778C',
  },
  parentValue: {
    color: '#172B4D',
    fontWeight: 500,
  },
  valueStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  teamCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6B778C',
  },
  filterBadge: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: '3px',
    textTransform: 'uppercase',
  },
  valueActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '4px',
    marginTop: '4px',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 20px 32px rgba(9, 30, 66, 0.25)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  previewCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#F4F5F7',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 16px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

const filterStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
  },
  hint: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  condition: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  select: {
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    border: '1px dashed #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    width: 'fit-content',
  },
};

const pickerStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    maxHeight: '200px',
    overflow: 'hidden',
  },
  search: {
    padding: '8px 12px',
    border: 'none',
    borderBottom: '1px solid #EBECF0',
    fontSize: '13px',
    outline: 'none',
  },
  list: {
    overflowY: 'auto',
    maxHeight: '160px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  checkbox: {
    marginRight: '4px',
  },
  teamName: {
    flex: 1,
    color: '#172B4D',
  },
  filterBadge: {
    fontSize: '10px',
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  manualBadge: {
    fontSize: '10px',
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: '3px',
  },
};

export default OrgHierarchyConfigureLevel;
