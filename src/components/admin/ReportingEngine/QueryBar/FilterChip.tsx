import React from 'react';
import {
  QueryCondition,
  QueryFieldDefinition,
  getOperatorLabel,
} from '../../../../types/reports';

interface FilterChipProps {
  condition: QueryCondition;
  field: QueryFieldDefinition | undefined;
  onClick: (event: React.MouseEvent) => void;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  condition,
  field,
  onClick,
  onRemove,
}) => {
  // Format the display value
  const formatValue = (): string => {
    const { value, operator } = condition;

    // Boolean operators
    if (operator === 'isTrue') return 'Yes';
    if (operator === 'isFalse') return 'No';

    // Array values (in, notIn)
    if (Array.isArray(value)) {
      if (operator === 'between') {
        return `${value[0]} - ${value[1]}`;
      }
      // For enum arrays, try to get labels
      if (field?.enumValues) {
        const labels = (value as string[]).map(v => {
          const enumVal = field.enumValues?.find(e => e.value === v);
          return enumVal?.label || v;
        });
        return labels.length > 2 ? `${labels.slice(0, 2).join(', ')}...` : labels.join(', ');
      }
      return (value as string[]).join(', ');
    }

    // Enum single value
    if (field?.enumValues) {
      const enumVal = field.enumValues.find(e => e.value === value);
      return enumVal?.label || String(value);
    }

    // Date values
    if (field?.valueType === 'date' && operator === 'inLast') {
      return `${value} days`;
    }

    return String(value);
  };

  // Get short operator label
  const getShortOperator = (): string => {
    const { operator } = condition;
    const shortLabels: Record<string, string> = {
      equals: ':',
      notEquals: '!=',
      contains: '~',
      greaterThan: '>',
      lessThan: '<',
      greaterThanOrEqual: '>=',
      lessThanOrEqual: '<=',
      between: ':',
      in: ':',
      notIn: 'not:',
      before: '<',
      after: '>',
      inLast: ':',
      isTrue: '',
      isFalse: '',
    };
    return shortLabels[operator] || ':';
  };

  const fieldLabel = field?.label || condition.fieldId;
  const displayValue = formatValue();
  const operator = getShortOperator();

  return (
    <div style={styles.chip} onClick={(e) => onClick(e)}>
      <span style={styles.label}>
        {fieldLabel}
        {operator && <span style={styles.operator}>{operator}</span>}
        <span style={styles.value}>{displayValue}</span>
      </span>
      <button
        style={styles.removeButton}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove filter"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M9.41 3L6 6.41 2.59 3 2 3.59 5.41 7 2 10.41l.59.59L6 7.59 9.41 11l.59-.59L6.59 7 10 3.59z" />
        </svg>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: '28px',
    padding: '0 8px 0 12px',
    backgroundColor: '#DEEBFF',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  operator: {
    color: '#6B778C',
    margin: '0 1px',
  },
  value: {
    color: '#172B4D',
    fontWeight: 400,
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    padding: 0,
    marginLeft: '4px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

export default FilterChip;
