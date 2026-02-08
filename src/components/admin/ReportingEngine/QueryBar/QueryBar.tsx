import React, { useState, useRef, useCallback } from 'react';
import {
  ExtendedReportQuery,
  QueryEntityType,
  QueryCondition,
  LogicalOperator,
  getFieldsForEntity,
  getEntityLabel,
  getOperatorLabel,
  createEmptyConditionGroup,
} from '../../../../types/reports';
import FilterGroup from './FilterGroup';
import GroupOperatorSeparator from './GroupOperatorSeparator';
import FilterEditor from './FilterEditor';
import OptionsDropdown from './OptionsDropdown';

interface QueryBarProps {
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

const QueryBar: React.FC<QueryBarProps> = ({
  query,
  onQueryChange,
  onEntityChange,
  onExecute,
  isExecuting,
}) => {
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [showFilterEditor, setShowFilterEditor] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showQueryPreview, setShowQueryPreview] = useState(false);
  const [editingCondition, setEditingCondition] = useState<QueryCondition | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 });
  const [optionsPosition, setOptionsPosition] = useState({ top: 0, left: 0 });

  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const entityButtonRef = useRef<HTMLButtonElement>(null);

  const fields = getFieldsForEntity(query.entityType);
  const hasMultipleGroups = query.groups.length > 1;

  // Handle adding a new filter to a specific group
  const handleAddFilterToGroup = (groupId: string, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setEditorPosition({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 300),
    });
    setEditingCondition(null);
    setEditingGroupId(groupId);
    setShowFilterEditor(true);
  };

  // Handle editing an existing filter
  const handleEditFilter = (condition: QueryCondition, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setEditorPosition({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 300),
    });
    // Find which group this condition belongs to
    const group = query.groups.find(g => g.conditions.some(c => c.id === condition.id));
    setEditingCondition(condition);
    setEditingGroupId(group?.id || null);
    setShowFilterEditor(true);
  };

  // Handle saving a filter (new or edit)
  const handleSaveFilter = (condition: QueryCondition) => {
    const newGroups = [...query.groups];

    if (editingCondition) {
      // Update existing condition
      for (let i = 0; i < newGroups.length; i++) {
        const condIndex = newGroups[i].conditions.findIndex(c => c.id === editingCondition.id);
        if (condIndex !== -1) {
          newGroups[i].conditions[condIndex] = condition;
          break;
        }
      }
    } else if (editingGroupId) {
      // Add new condition to specific group
      const groupIndex = newGroups.findIndex(g => g.id === editingGroupId);
      if (groupIndex !== -1) {
        newGroups[groupIndex].conditions.push(condition);
      }
    } else {
      // Fallback: add to first group
      newGroups[0].conditions.push(condition);
    }

    onQueryChange({ groups: newGroups });
    setShowFilterEditor(false);
    setEditingCondition(null);
    setEditingGroupId(null);
  };

  // Handle deleting a filter
  const handleDeleteFilter = (conditionId?: string) => {
    const targetId = conditionId || editingCondition?.id;
    if (!targetId) return;

    const newGroups = query.groups.map(group => ({
      ...group,
      conditions: group.conditions.filter(c => c.id !== targetId),
    }));

    onQueryChange({ groups: newGroups });
    setShowFilterEditor(false);
    setEditingCondition(null);
    setEditingGroupId(null);
  };

  // Toggle logical operator within a group (AND <-> OR)
  const handleToggleGroupOperator = (groupId: string) => {
    const newGroups = query.groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          logicalOperator: (group.logicalOperator === 'AND' ? 'OR' : 'AND') as LogicalOperator,
        };
      }
      return group;
    });
    onQueryChange({ groups: newGroups });
  };

  // Toggle operator between groups (AND <-> OR)
  const handleToggleGroupsOperator = () => {
    const newOperator: LogicalOperator = query.groupOperator === 'AND' ? 'OR' : 'AND';
    onQueryChange({ groupOperator: newOperator });
  };

  // Add a new group
  const handleAddGroup = () => {
    const newGroup = createEmptyConditionGroup();
    // Clear the empty condition from new group since we'll add via editor
    newGroup.conditions = [];
    onQueryChange({
      groups: [...query.groups, newGroup],
      // When adding a group, default to OR between groups
      groupOperator: 'OR' as LogicalOperator,
    });
  };

  // Remove a group
  const handleRemoveGroup = (groupId: string) => {
    const newGroups = query.groups.filter(g => g.id !== groupId);
    // Ensure at least one group exists
    if (newGroups.length === 0) {
      newGroups.push(createEmptyConditionGroup());
    }
    onQueryChange({ groups: newGroups });
  };

  // Handle opening options dropdown
  const handleOpenOptions = () => {
    if (optionsButtonRef.current) {
      const rect = optionsButtonRef.current.getBoundingClientRect();
      setOptionsPosition({
        top: rect.bottom + 8,
        left: Math.max(0, rect.right - 260),
      });
    }
    setShowOptionsDropdown(true);
  };

  // Generate query preview text
  const getQueryPreview = useCallback((): string => {
    const entityLabel = getEntityLabel(query.entityType);
    const conditionParts: string[] = [];

    query.groups.forEach((group) => {
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
  }, [query, fields]);

  return (
    <div style={styles.wrapper}>
      {/* Drilldown Breadcrumb */}
      {query.drilldownFrom && (
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLabel}>Drilldown from:</span>
          <span style={styles.breadcrumbEntity}>
            {getEntityLabel(query.drilldownFrom.entityType)}: {query.drilldownFrom.entityName}
          </span>
        </div>
      )}

      {/* Main Query Bar */}
      <div style={styles.queryBar}>
        {/* Header Row: Entity Selector + Actions */}
        <div style={styles.headerRow}>
          {/* Entity Selector */}
          <div style={styles.entitySelector}>
            <button
              ref={entityButtonRef}
              style={styles.entityButton}
              onClick={() => setShowEntityDropdown(!showEntityDropdown)}
            >
              <span style={styles.entityIcon}>{ENTITY_CONFIG[query.entityType].icon}</span>
              <span style={styles.entityName}>{getEntityLabel(query.entityType)}</span>
              <span style={styles.chevron}>▼</span>
            </button>

            {showEntityDropdown && (
              <div style={styles.entityDropdown}>
                {ENTITY_ORDER.map(entityType => (
                  <button
                    key={entityType}
                    style={{
                      ...styles.entityOption,
                      ...(entityType === query.entityType ? styles.entityOptionActive : {}),
                    }}
                    onClick={() => {
                      onEntityChange(entityType);
                      setShowEntityDropdown(false);
                    }}
                  >
                    <span style={styles.entityOptionIcon}>{ENTITY_CONFIG[entityType].icon}</span>
                    <div style={styles.entityOptionText}>
                      <span style={styles.entityOptionName}>{getEntityLabel(entityType)}</span>
                      <span style={styles.entityOptionDesc}>{ENTITY_CONFIG[entityType].description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div style={styles.spacer} />

          {/* Options Button */}
          <button
            ref={optionsButtonRef}
            style={styles.optionsButton}
            onClick={handleOpenOptions}
            title="Query options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>

          {/* Run Button */}
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
                <span>Running...</span>
              </>
            ) : (
              <>
                <span style={styles.playIcon}>▶</span>
                <span>Run</span>
              </>
            )}
          </button>
        </div>

        {/* Filter Groups */}
        <div style={styles.groupsContainer}>
          {query.groups.map((group, index) => (
            <React.Fragment key={group.id}>
              {/* Group separator with OR/AND badge */}
              {index > 0 && (
                <GroupOperatorSeparator
                  operator={query.groupOperator}
                  onToggle={handleToggleGroupsOperator}
                />
              )}

              {/* Filter Group */}
              <FilterGroup
                group={group}
                fields={fields}
                onConditionAdd={(e) => handleAddFilterToGroup(group.id, e)}
                onConditionEdit={handleEditFilter}
                onConditionRemove={(conditionId) => handleDeleteFilter(conditionId)}
                onOperatorToggle={() => handleToggleGroupOperator(group.id)}
                onGroupRemove={hasMultipleGroups ? () => handleRemoveGroup(group.id) : undefined}
                isOnlyGroup={!hasMultipleGroups}
                groupIndex={index}
              />
            </React.Fragment>
          ))}

          {/* Add Group Button */}
          <button
            style={styles.addGroupButton}
            onClick={handleAddGroup}
          >
            <span style={styles.plusIcon}>+</span>
            <span>Add Group (OR)</span>
          </button>
        </div>
      </div>

      {/* Query Preview */}
      {showQueryPreview && (
        <div style={styles.queryPreview}>
          <code style={styles.queryPreviewText}>{getQueryPreview()}</code>
        </div>
      )}

      {/* Filter Editor Popover */}
      {showFilterEditor && (
        <FilterEditor
          condition={editingCondition}
          fields={fields}
          anchorPosition={editorPosition}
          onSave={handleSaveFilter}
          onDelete={() => handleDeleteFilter()}
          onClose={() => {
            setShowFilterEditor(false);
            setEditingCondition(null);
          }}
          isNew={!editingCondition}
        />
      )}

      {/* Options Dropdown */}
      {showOptionsDropdown && (
        <OptionsDropdown
          sortBy={query.sortBy}
          limit={query.limit}
          selectedFields={query.selectedFields}
          fields={fields}
          showQueryPreview={showQueryPreview}
          anchorPosition={optionsPosition}
          onSortChange={(sortBy) => onQueryChange({ sortBy })}
          onLimitChange={(limit) => onQueryChange({ limit })}
          onToggleQueryPreview={() => setShowQueryPreview(!showQueryPreview)}
          onClose={() => setShowOptionsDropdown(false)}
        />
      )}

      {/* Click outside handler for entity dropdown */}
      {showEntityDropdown && (
        <div
          style={styles.overlay}
          onClick={() => setShowEntityDropdown(false)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
  queryBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  entitySelector: {
    position: 'relative',
  },
  entityButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  entityIcon: {
    fontSize: '16px',
  },
  entityName: {
    whiteSpace: 'nowrap',
  },
  chevron: {
    fontSize: '10px',
    color: '#6B778C',
    marginLeft: '4px',
  },
  entityDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    minWidth: '280px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
    zIndex: 100,
  },
  entityOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  entityOptionActive: {
    backgroundColor: '#DEEBFF',
  },
  entityOptionIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  entityOptionText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  entityOptionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  entityOptionDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  addGroupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px dashed #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    transition: 'all 0.15s ease',
    alignSelf: 'flex-start',
  },
  plusIcon: {
    fontSize: '14px',
    fontWeight: 600,
  },
  spacer: {
    flex: 1,
    minWidth: '8px',
  },
  optionsButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  runButtonDisabled: {
    backgroundColor: '#B3D4FF',
    cursor: 'not-allowed',
  },
  playIcon: {
    fontSize: '10px',
  },
  spinner: {
    width: '12px',
    height: '12px',
    border: '2px solid #FFFFFF',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  queryPreview: {
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'auto',
  },
  queryPreviewText: {
    fontSize: '12px',
    fontFamily: 'Monaco, Consolas, monospace',
    color: '#172B4D',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
};

export default QueryBar;
