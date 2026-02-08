import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QueryCondition,
  QueryFieldDefinition,
  QueryOperator,
  getOperatorLabel,
  groupFieldsByCategory,
} from '../../../../types/reports';

interface FilterEditorProps {
  condition: QueryCondition | null;
  fields: QueryFieldDefinition[];
  anchorPosition: { top: number; left: number };
  onSave: (condition: QueryCondition) => void;
  onDelete: () => void;
  onClose: () => void;
  isNew?: boolean;
}

const FilterEditor: React.FC<FilterEditorProps> = ({
  condition,
  fields,
  anchorPosition,
  onSave,
  onDelete,
  onClose,
  isNew = false,
}) => {
  const [localCondition, setLocalCondition] = useState<QueryCondition>(
    condition || {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fieldId: '',
      operator: 'equals',
      value: '',
    }
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  // Get selected field definition
  const selectedField = fields.find(f => f.id === localCondition.fieldId);
  const operators = selectedField?.operators || [];

  // Group fields by category for display
  const fieldGroups = useMemo(() => {
    const hasCategories = fields.some(f => f.category);
    if (!hasCategories) return null;
    return groupFieldsByCategory(fields);
  }, [fields]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Update operator when field changes
  const handleFieldChange = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const defaultOperator = field?.operators[0] || 'equals';
    const defaultValue = getDefaultValue(field, defaultOperator);

    setLocalCondition(prev => ({
      ...prev,
      fieldId,
      operator: defaultOperator,
      value: defaultValue,
    }));
  };

  // Handle operator change
  const handleOperatorChange = (operator: QueryOperator) => {
    const defaultValue = getDefaultValue(selectedField, operator);
    setLocalCondition(prev => ({
      ...prev,
      operator,
      value: defaultValue,
    }));
  };

  // Get default value based on field type and operator
  const getDefaultValue = (field: QueryFieldDefinition | undefined, operator: QueryOperator): QueryCondition['value'] => {
    if (!field) return '';

    if (operator === 'isTrue' || operator === 'isFalse') return '';
    if (operator === 'in' || operator === 'notIn') return [];
    if (operator === 'between') {
      return field.valueType === 'date' ? ['', ''] : [0, 100];
    }
    if (field.valueType === 'number') return 0;
    if (field.valueType === 'boolean') return true;

    return '';
  };

  // Handle save
  const handleSave = () => {
    if (localCondition.fieldId) {
      onSave(localCondition);
    }
  };

  // Render value input based on field type and operator
  const renderValueInput = () => {
    if (!selectedField) {
      return <input style={styles.input} disabled placeholder="Select a field first" />;
    }

    const { operator, value } = localCondition;

    // Boolean operators don't need value
    if (operator === 'isTrue' || operator === 'isFalse') {
      return null;
    }

    // Enum with checkboxes for in/notIn
    if (selectedField.valueType === 'enum' && selectedField.enumValues) {
      if (operator === 'in' || operator === 'notIn') {
        const selectedValues: string[] = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div style={styles.checkboxGroup}>
            {selectedField.enumValues.map(opt => (
              <label key={opt.value} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter(v => v !== opt.value);
                    setLocalCondition(prev => ({ ...prev, value: newValue }));
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <select
          style={styles.select}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
        >
          <option value="">Select...</option>
          {selectedField.enumValues.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    // Number with range for between
    if (selectedField.valueType === 'number') {
      if (operator === 'between') {
        const rangeValue = Array.isArray(value) ? value : [0, 100];
        return (
          <div style={styles.rangeInputs}>
            <input
              type="number"
              style={styles.rangeInput}
              value={Number(rangeValue[0]) || 0}
              onChange={(e) => setLocalCondition(prev => ({
                ...prev,
                value: [Number(e.target.value), Number(rangeValue[1] || 100)]
              }))}
              placeholder="Min"
            />
            <span style={styles.rangeSeparator}>to</span>
            <input
              type="number"
              style={styles.rangeInput}
              value={Number(rangeValue[1]) || 100}
              onChange={(e) => setLocalCondition(prev => ({
                ...prev,
                value: [Number(rangeValue[0] || 0), Number(e.target.value)]
              }))}
              placeholder="Max"
            />
          </div>
        );
      }
      return (
        <input
          type="number"
          style={styles.input}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => setLocalCondition(prev => ({ ...prev, value: Number(e.target.value) }))}
          placeholder="Enter value..."
        />
      );
    }

    // Date input
    if (selectedField.valueType === 'date') {
      if (operator === 'inLast') {
        return (
          <div style={styles.dateLastRow}>
            <input
              type="number"
              style={styles.dateInput}
              value={typeof value === 'number' ? value : ''}
              onChange={(e) => setLocalCondition(prev => ({ ...prev, value: Number(e.target.value) }))}
              placeholder="Days"
            />
            <span style={styles.dateLabel}>days</span>
          </div>
        );
      }
      if (operator === 'between') {
        const rangeValue = Array.isArray(value) ? value : ['', ''];
        return (
          <div style={styles.rangeInputs}>
            <input
              type="date"
              style={styles.dateInput}
              value={String(rangeValue[0] || '')}
              onChange={(e) => setLocalCondition(prev => ({
                ...prev,
                value: [e.target.value, String(rangeValue[1] || '')]
              }))}
            />
            <span style={styles.rangeSeparator}>to</span>
            <input
              type="date"
              style={styles.dateInput}
              value={String(rangeValue[1] || '')}
              onChange={(e) => setLocalCondition(prev => ({
                ...prev,
                value: [String(rangeValue[0] || ''), e.target.value]
              }))}
            />
          </div>
        );
      }
      return (
        <input
          type="date"
          style={styles.input}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
        />
      );
    }

    // Default string input
    return (
      <input
        type="text"
        style={styles.input}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => setLocalCondition(prev => ({ ...prev, value: e.target.value }))}
        placeholder="Enter value..."
      />
    );
  };

  return (
    <div
      ref={popoverRef}
      style={{
        ...styles.popover,
        top: anchorPosition.top,
        left: anchorPosition.left,
      }}
    >
      <div style={styles.header}>
        <span style={styles.headerTitle}>{isNew ? 'Add Filter' : 'Edit Filter'}</span>
      </div>

      <div style={styles.body}>
        {/* Field selector */}
        <div style={styles.row}>
          <label style={styles.label}>Field</label>
          <select
            style={styles.select}
            value={localCondition.fieldId}
            onChange={(e) => handleFieldChange(e.target.value)}
          >
            <option value="">Select field...</option>
            {fieldGroups ? (
              // Render with optgroups when categories are available
              Array.from(fieldGroups.entries()).map(([category, categoryFields]) => (
                <optgroup key={category} label={category}>
                  {categoryFields.map(field => (
                    <option key={field.id} value={field.id}>{field.label}</option>
                  ))}
                </optgroup>
              ))
            ) : (
              // Render flat list when no categories
              fields.map(field => (
                <option key={field.id} value={field.id}>{field.label}</option>
              ))
            )}
          </select>
        </div>

        {/* Operator selector */}
        {selectedField && (
          <div style={styles.row}>
            <label style={styles.label}>Operator</label>
            <select
              style={styles.select}
              value={localCondition.operator}
              onChange={(e) => handleOperatorChange(e.target.value as QueryOperator)}
            >
              {operators.map(op => (
                <option key={op} value={op}>{getOperatorLabel(op)}</option>
              ))}
            </select>
          </div>
        )}

        {/* Value input */}
        {selectedField && (
          <div style={styles.row}>
            <label style={styles.label}>Value</label>
            {renderValueInput()}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        {!isNew && (
          <button style={styles.deleteButton} onClick={onDelete}>
            Delete
          </button>
        )}
        <div style={styles.footerRight}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...styles.applyButton,
              ...(localCondition.fieldId ? {} : styles.applyButtonDisabled),
            }}
            onClick={handleSave}
            disabled={!localCondition.fieldId}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  popover: {
    position: 'fixed',
    zIndex: 1000,
    minWidth: '280px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  headerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  rangeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rangeInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  rangeSeparator: {
    fontSize: '13px',
    color: '#6B778C',
  },
  dateLastRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  dateLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #EBECF0',
    gap: '12px',
  },
  footerRight: {
    display: 'flex',
    gap: '8px',
    marginLeft: 'auto',
  },
  deleteButton: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#DE350B',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  applyButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  applyButtonDisabled: {
    backgroundColor: '#B3D4FF',
    cursor: 'not-allowed',
  },
};

export default FilterEditor;
