import React, { useState, useCallback } from 'react';
import {
  ExtendedReportQuery,
  QueryEntityType,
  QueryCondition,
  QueryConditionGroup,
  QueryFieldDefinition,
  getFieldsForEntity,
  getEntityLabel,
  getOperatorLabel,
  createEmptyCondition,
  createEmptyConditionGroup,
} from '../../../../types/reports';

interface QueryBuilderPanelProps {
  query: ExtendedReportQuery;
  onQueryChange: (updates: Partial<ExtendedReportQuery>) => void;
  onEntityChange: (entityType: QueryEntityType) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

// Entity type icons and descriptions
const ENTITY_CONFIG: Record<QueryEntityType, { icon: string; description: string }> = {
  teams: { icon: '👥', description: 'Team configuration and attributes' },
  assessments: { icon: '📋', description: 'Health assessments' },
  dimensions: { icon: '📐', description: 'Health dimension scores' },
  indicators: { icon: '📊', description: 'Specific health indicators' },
  users: { icon: '👤', description: 'System users' },
  issues: { icon: '🎫', description: 'Jira issues' },
  sprints: { icon: '🏃', description: 'Sprint data' },
  teamMetrics: { icon: '📈', description: 'Aggregated team metrics' },
  sprintMetrics: { icon: '📉', description: 'Sprint-level metrics' },
  userActivity: { icon: '👁️', description: 'User engagement data' },
  outcomeConfidence: { icon: '🎯', description: 'Outcome confidence scores' },
};

const ENTITY_ORDER: QueryEntityType[] = [
  'teams',
  'dimensions',
  'indicators',
  'issues',
  'sprints',
  'teamMetrics',
  'sprintMetrics',
  'assessments',
  'users',
  'userActivity',
  'outcomeConfidence',
];

const QueryBuilderPanel: React.FC<QueryBuilderPanelProps> = ({
  query,
  onQueryChange,
  onEntityChange,
  onExecute,
  isExecuting,
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const fields = getFieldsForEntity(query.entityType);

  // Handle field toggle
  const handleFieldToggle = (fieldId: string) => {
    const newFields = query.selectedFields.includes(fieldId)
      ? query.selectedFields.filter(f => f !== fieldId)
      : [...query.selectedFields, fieldId];
    onQueryChange({ selectedFields: newFields });
  };

  // Handle condition change
  const handleConditionChange = (
    groupIndex: number,
    conditionIndex: number,
    updates: Partial<QueryCondition>
  ) => {
    const newGroups = [...query.groups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      conditions: newGroups[groupIndex].conditions.map((c, i) =>
        i === conditionIndex ? { ...c, ...updates } : c
      ),
    };
    onQueryChange({ groups: newGroups });
  };

  // Add condition to group
  const handleAddCondition = (groupIndex: number) => {
    const newGroups = [...query.groups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      conditions: [...newGroups[groupIndex].conditions, createEmptyCondition()],
    };
    onQueryChange({ groups: newGroups });
  };

  // Remove condition from group
  const handleRemoveCondition = (groupIndex: number, conditionIndex: number) => {
    const newGroups = [...query.groups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      conditions: newGroups[groupIndex].conditions.filter((_, i) => i !== conditionIndex),
    };
    // Remove empty groups
    if (newGroups[groupIndex].conditions.length === 0 && newGroups.length > 1) {
      newGroups.splice(groupIndex, 1);
    }
    onQueryChange({ groups: newGroups });
  };

  // Add new OR group
  const handleAddGroup = () => {
    onQueryChange({
      groups: [...query.groups, createEmptyConditionGroup()],
      groupOperator: 'OR',
    });
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    const newDirection = query.sortBy?.field === field && query.sortBy.direction === 'asc'
      ? 'desc'
      : 'asc';
    onQueryChange({ sortBy: { field, direction: newDirection } });
  };

  // Handle limit change
  const handleLimitChange = (limit: number | undefined) => {
    onQueryChange({ limit });
  };

  // Generate query preview text
  const getQueryPreview = (): string => {
    const entityLabel = getEntityLabel(query.entityType);
    const conditionParts: string[] = [];

    query.groups.forEach((group, gi) => {
      const groupConditions = group.conditions
        .filter(c => c.fieldId && c.value !== '')
        .map(c => {
          const field = fields.find(f => f.id === c.fieldId);
          const fieldLabel = field?.label || c.fieldId;
          const opLabel = getOperatorLabel(c.operator);
          const valueStr = Array.isArray(c.value)
            ? `[${c.value.join(', ')}]`
            : String(c.value);
          return `${fieldLabel} ${opLabel} ${valueStr}`;
        });

      if (groupConditions.length > 0) {
        const groupStr = groupConditions.join(` ${group.logicalOperator} `);
        conditionParts.push(groupConditions.length > 1 ? `(${groupStr})` : groupStr);
      }
    });

    let preview = entityLabel;
    if (conditionParts.length > 0) {
      preview += ` WHERE ${conditionParts.join(` ${query.groupOperator} `)}`;
    }
    if (query.sortBy) {
      preview += ` ORDER BY ${query.sortBy.field} ${query.sortBy.direction.toUpperCase()}`;
    }
    if (query.limit) {
      preview += ` LIMIT ${query.limit}`;
    }
    return preview;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Query Builder</h3>
        <label style={styles.advancedToggle}>
          <input
            type="checkbox"
            checked={isAdvancedMode}
            onChange={(e) => setIsAdvancedMode(e.target.checked)}
          />
          <span>Advanced Mode</span>
        </label>
      </div>

      {/* Drilldown Breadcrumb */}
      {query.drilldownFrom && (
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLabel}>Drilldown from:</span>
          <span style={styles.breadcrumbEntity}>
            {getEntityLabel(query.drilldownFrom.entityType)}: {query.drilldownFrom.entityName}
          </span>
        </div>
      )}

      {/* Entity Selector */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Entity</label>
        <div style={styles.entitySelectContainer}>
          <span style={styles.entityIcon}>{ENTITY_CONFIG[query.entityType].icon}</span>
          <select
            style={styles.entitySelect}
            value={query.entityType}
            onChange={(e) => onEntityChange(e.target.value as QueryEntityType)}
          >
            {ENTITY_ORDER.map(entityType => (
              <option key={entityType} value={entityType}>
                {getEntityLabel(entityType)}
              </option>
            ))}
          </select>
          <span style={styles.entityDescription}>
            {ENTITY_CONFIG[query.entityType].description}
          </span>
        </div>
      </div>

      {/* Field Selector */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>
          Select Fields
          <span style={styles.fieldCount}>
            ({query.selectedFields.length} selected)
          </span>
        </label>
        <div style={styles.fieldPills}>
          {fields.map(field => (
            <button
              key={field.id}
              style={{
                ...styles.fieldPill,
                ...(query.selectedFields.includes(field.id) ? styles.fieldPillActive : {}),
              }}
              onClick={() => handleFieldToggle(field.id)}
            >
              {field.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Builder */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Where</label>
        <div style={styles.conditionGroups}>
          {query.groups.map((group, groupIndex) => (
            <div key={group.id} style={styles.conditionGroup}>
              {groupIndex > 0 && (
                <div style={styles.groupOperator}>OR</div>
              )}
              <div style={styles.conditionsContainer}>
                {group.conditions.map((condition, condIndex) => (
                  <ConditionRow
                    key={condition.id}
                    condition={condition}
                    fields={fields}
                    isFirst={condIndex === 0}
                    logicalOperator={group.logicalOperator}
                    onChange={(updates) => handleConditionChange(groupIndex, condIndex, updates)}
                    onRemove={() => handleRemoveCondition(groupIndex, condIndex)}
                  />
                ))}
                <button
                  style={styles.addConditionButton}
                  onClick={() => handleAddCondition(groupIndex)}
                >
                  + Add condition
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          style={styles.addGroupButton}
          onClick={handleAddGroup}
        >
          + Add group (OR)
        </button>
      </div>

      {/* Sort & Limit */}
      <div style={styles.section}>
        <label style={styles.sectionLabel}>Sort & Limit</label>
        <div style={styles.sortLimitRow}>
          <div style={styles.sortControl}>
            <label style={styles.miniLabel}>Sort by</label>
            <select
              style={styles.select}
              value={query.sortBy?.field || ''}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="">None</option>
              {query.selectedFields.map(fieldId => {
                const field = fields.find(f => f.id === fieldId);
                return (
                  <option key={fieldId} value={fieldId}>
                    {field?.label || fieldId}
                  </option>
                );
              })}
            </select>
            {query.sortBy && (
              <button
                style={styles.directionButton}
                onClick={() => onQueryChange({
                  sortBy: {
                    ...query.sortBy!,
                    direction: query.sortBy!.direction === 'asc' ? 'desc' : 'asc',
                  },
                })}
              >
                {query.sortBy.direction === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            )}
          </div>
          <div style={styles.limitControl}>
            <label style={styles.miniLabel}>Limit</label>
            <select
              style={styles.select}
              value={query.limit || ''}
              onChange={(e) => handleLimitChange(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Query Preview */}
      <div style={styles.previewSection}>
        <label style={styles.sectionLabel}>Query Preview</label>
        <div style={styles.queryPreview}>
          {getQueryPreview()}
        </div>
      </div>

      {/* Run Button */}
      <div style={styles.actions}>
        <button
          style={{
            ...styles.runButton,
            ...(isExecuting ? styles.runButtonDisabled : {}),
          }}
          onClick={onExecute}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <span style={styles.spinner} />
              Running...
            </>
          ) : (
            <>▶ Run Query</>
          )}
        </button>
      </div>
    </div>
  );
};

// Condition Row Component
interface ConditionRowProps {
  condition: QueryCondition;
  fields: QueryFieldDefinition[];
  isFirst: boolean;
  logicalOperator: string;
  onChange: (updates: Partial<QueryCondition>) => void;
  onRemove: () => void;
}

const ConditionRow: React.FC<ConditionRowProps> = ({
  condition,
  fields,
  isFirst,
  logicalOperator,
  onChange,
  onRemove,
}) => {
  const selectedField = fields.find(f => f.id === condition.fieldId);
  const operators = selectedField?.operators || [];

  return (
    <div style={styles.conditionRow}>
      {!isFirst && (
        <span style={styles.conditionOperator}>{logicalOperator}</span>
      )}
      <select
        style={styles.fieldSelect}
        value={condition.fieldId}
        onChange={(e) => onChange({ fieldId: e.target.value, value: '' })}
      >
        <option value="">Select field...</option>
        {fields.map(field => (
          <option key={field.id} value={field.id}>{field.label}</option>
        ))}
      </select>
      <select
        style={styles.operatorSelect}
        value={condition.operator}
        onChange={(e) => onChange({ operator: e.target.value as any })}
        disabled={!condition.fieldId}
      >
        {operators.map(op => (
          <option key={op} value={op}>{getOperatorLabel(op)}</option>
        ))}
      </select>
      <ValueInput
        field={selectedField}
        value={condition.value}
        operator={condition.operator}
        onChange={(value) => onChange({ value })}
      />
      <button
        style={styles.removeButton}
        onClick={onRemove}
        title="Remove condition"
      >
        ×
      </button>
    </div>
  );
};

// Value Input Component
interface ValueInputProps {
  field: QueryFieldDefinition | undefined;
  value: QueryCondition['value'];
  operator: string;
  onChange: (value: QueryCondition['value']) => void;
}

const ValueInput: React.FC<ValueInputProps> = ({ field, value, operator, onChange }) => {
  if (!field) {
    return <input style={styles.valueInput} disabled placeholder="Select field first" />;
  }

  // Boolean operators don't need value input
  if (operator === 'isTrue' || operator === 'isFalse') {
    return null;
  }

  // Enum field with multiple selection
  if (field.valueType === 'enum' && field.enumValues) {
    if (operator === 'in' || operator === 'notIn') {
      const selectedValues: string[] = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div style={styles.multiSelectContainer}>
          {field.enumValues.map(opt => (
            <label key={opt.value} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...selectedValues, opt.value]
                    : selectedValues.filter(v => v !== opt.value);
                  onChange(newValue);
                }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    return (
      <select
        style={styles.valueInput}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {field.enumValues.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  // Number input
  if (field.valueType === 'number') {
    if (operator === 'between') {
      const rangeValue = Array.isArray(value) ? value : [0, 100];
      const min = Number(rangeValue[0]) || 0;
      const max = Number(rangeValue[1]) || 100;
      return (
        <div style={styles.rangeInputs}>
          <input
            type="number"
            style={styles.rangeInput}
            value={min}
            onChange={(e) => onChange([Number(e.target.value), max])}
            placeholder="Min"
          />
          <span style={styles.rangeSeparator}>to</span>
          <input
            type="number"
            style={styles.rangeInput}
            value={max}
            onChange={(e) => onChange([min, Number(e.target.value)])}
            placeholder="Max"
          />
        </div>
      );
    }
    return (
      <input
        type="number"
        style={styles.valueInput}
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder="Enter value..."
      />
    );
  }

  // Date input
  if (field.valueType === 'date') {
    if (operator === 'inLast') {
      return (
        <div style={styles.dateRangeContainer}>
          <input
            type="number"
            style={styles.dateInput}
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder="Days"
          />
          <span style={styles.dateLabel}>days</span>
        </div>
      );
    }
    if (operator === 'between') {
      const rangeValue = Array.isArray(value) ? value : ['', ''];
      const start = String(rangeValue[0] || '');
      const end = String(rangeValue[1] || '');
      return (
        <div style={styles.rangeInputs}>
          <input
            type="date"
            style={styles.dateInput}
            value={start}
            onChange={(e) => onChange([e.target.value, end] as [string, string])}
          />
          <span style={styles.rangeSeparator}>to</span>
          <input
            type="date"
            style={styles.dateInput}
            value={end}
            onChange={(e) => onChange([start, e.target.value] as [string, string])}
          />
        </div>
      );
    }
    return (
      <input
        type="date"
        style={styles.dateInput}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  // Default string input
  return (
    <input
      type="text"
      style={styles.valueInput}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value..."
    />
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  advancedToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#DEEBFF',
    borderRadius: '4px',
    fontSize: '13px',
  },
  breadcrumbLabel: {
    color: '#0052CC',
    fontWeight: 500,
  },
  breadcrumbEntity: {
    color: '#172B4D',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fieldCount: {
    fontWeight: 400,
    textTransform: 'none',
    fontSize: '11px',
  },
  entitySelectContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  entitySelect: {
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    minWidth: '160px',
  },
  entityIcon: {
    fontSize: '20px',
  },
  entityDescription: {
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  fieldPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  fieldPill: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#F4F5F7',
    border: '1px solid transparent',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  fieldPillActive: {
    backgroundColor: '#DEEBFF',
    borderColor: '#4C9AFF',
    color: '#0052CC',
  },
  conditionGroups: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  conditionGroup: {
    position: 'relative',
  },
  groupOperator: {
    position: 'absolute',
    left: '-16px',
    top: '0',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6554C0',
    backgroundColor: '#EAE6FF',
    borderRadius: '4px',
    transform: 'translateX(-50%)',
  },
  conditionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  conditionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  conditionOperator: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6554C0',
    minWidth: '32px',
  },
  fieldSelect: {
    flex: '1 1 150px',
    minWidth: '120px',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  operatorSelect: {
    flex: '0 0 130px',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  valueInput: {
    flex: '1 1 150px',
    minWidth: '120px',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  removeButton: {
    padding: '4px 8px',
    fontSize: '16px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  addConditionButton: {
    alignSelf: 'flex-start',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  addGroupButton: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6554C0',
    backgroundColor: '#EAE6FF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sortLimitRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sortControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  limitControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  miniLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  select: {
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  directionButton: {
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  previewSection: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  queryPreview: {
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'Monaco, Consolas, monospace',
    color: '#172B4D',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actions: {
    paddingTop: '12px',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  runButtonDisabled: {
    backgroundColor: '#B3D4FF',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid #FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  multiSelectContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    flex: '1 1 200px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  rangeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 1 200px',
  },
  rangeInput: {
    flex: 1,
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  rangeSeparator: {
    fontSize: '12px',
    color: '#6B778C',
  },
  dateRangeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 1 150px',
  },
  dateInput: {
    flex: 1,
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  dateLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default QueryBuilderPanel;
