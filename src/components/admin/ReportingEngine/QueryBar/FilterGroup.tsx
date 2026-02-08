import React, { useRef } from 'react';
import {
  QueryCondition,
  QueryConditionGroup,
  QueryFieldDefinition,
} from '../../../../types/reports';
import FilterChip from './FilterChip';

interface FilterGroupProps {
  group: QueryConditionGroup;
  fields: QueryFieldDefinition[];
  onConditionAdd: (event: React.MouseEvent) => void;
  onConditionEdit: (condition: QueryCondition, event: React.MouseEvent) => void;
  onConditionRemove: (conditionId: string) => void;
  onOperatorToggle: () => void;
  onGroupRemove?: () => void;
  isOnlyGroup: boolean;
  groupIndex: number;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  group,
  fields,
  onConditionAdd,
  onConditionEdit,
  onConditionRemove,
  onOperatorToggle,
  onGroupRemove,
  isOnlyGroup,
  groupIndex,
}) => {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const validConditions = group.conditions.filter(c => c.fieldId);

  return (
    <div style={styles.groupContainer}>
      {/* Group Header - only show for multiple groups */}
      {!isOnlyGroup && (
        <div style={styles.groupHeader}>
          <span style={styles.groupLabel}>Group {groupIndex + 1}</span>
          {onGroupRemove && (
            <button
              style={styles.removeGroupButton}
              onClick={onGroupRemove}
              title="Remove group"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M9.41 3L6 6.41 2.59 3 2 3.59 5.41 7 2 10.41l.59.59L6 7.59 9.41 11l.59-.59L6.59 7 10 3.59z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Filter chips with inline operators */}
      <div style={styles.chipsRow}>
        {validConditions.map((condition, index) => (
          <React.Fragment key={condition.id}>
            <FilterChip
              condition={condition}
              field={fields.find(f => f.id === condition.fieldId)}
              onClick={(e) => onConditionEdit(condition, e)}
              onRemove={() => onConditionRemove(condition.id)}
            />

            {/* Inline operator toggle between chips */}
            {index < validConditions.length - 1 && (
              <button
                style={styles.inlineOperator}
                onClick={onOperatorToggle}
                title={`Click to switch to ${group.logicalOperator === 'AND' ? 'OR' : 'AND'}`}
              >
                {group.logicalOperator}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Add filter button */}
        <button
          ref={addButtonRef}
          style={styles.addButton}
          onClick={(e) => onConditionAdd(e)}
        >
          <span style={styles.plusIcon}>+</span>
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  groupContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  groupLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  removeGroupButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
    transition: 'all 0.15s ease',
  },
  chipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  inlineOperator: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 8px',
    backgroundColor: '#EAE6FF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#6554C0',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.3px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  plusIcon: {
    fontSize: '13px',
    fontWeight: 600,
  },
};

export default FilterGroup;
