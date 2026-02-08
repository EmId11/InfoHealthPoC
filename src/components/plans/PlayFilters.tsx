// PlayFilters - Filter sidebar for play gallery
// Contains view mode toggle and multi-select checkbox filters (collapsible)

import React, { useState } from 'react';
import {
  PlanPlay,
  PlayStatus,
  PlayPriority,
  InterventionType,
} from '../../types/improvementPlan';
import { OUTCOME_DEFINITIONS } from '../../constants/outcomeDefinitions';

export type ViewMode = 'gallery' | 'kanban';

export interface FilterState {
  status: PlayStatus[];
  priority: PlayPriority[];
  interventionType: InterventionType[];
  outcome: string[];
}

interface PlayFiltersProps {
  plays: PlanPlay[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  defaultCollapsed?: boolean;
}

const PlayFilters: React.FC<PlayFiltersProps> = ({
  plays,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  // Calculate counts for each filter value
  const statusCounts = {
    'backlog': plays.filter(p => p.status === 'backlog').length,
    'do-next': plays.filter(p => p.status === 'do-next').length,
    'in-progress': plays.filter(p => p.status === 'in-progress').length,
    'completed': plays.filter(p => p.status === 'completed').length,
  };

  const priorityCounts = {
    'high': plays.filter(p => p.priorityLevel === 'high').length,
    'medium': plays.filter(p => p.priorityLevel === 'medium').length,
    'low': plays.filter(p => p.priorityLevel === 'low').length,
  };

  const typeCounts = {
    'process': plays.filter(p => p.interventionType === 'process').length,
    'culture': plays.filter(p => p.interventionType === 'culture').length,
    'tooling': plays.filter(p => p.interventionType === 'tooling').length,
  };

  // Get unique outcomes from plays
  const outcomeIds = Array.from(new Set(plays.map(p => p.sourceOutcomeId).filter(Boolean))) as string[];
  const outcomeCounts: Record<string, number> = {};
  for (const outcomeId of outcomeIds) {
    outcomeCounts[outcomeId] = plays.filter(p => p.sourceOutcomeId === outcomeId).length;
  }

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.interventionType.length > 0 ||
    filters.outcome.length > 0;

  const toggleStatusFilter = (value: PlayStatus) => {
    const newValues = filters.status.includes(value)
      ? filters.status.filter(v => v !== value)
      : [...filters.status, value];
    onFiltersChange({ ...filters, status: newValues });
  };

  const togglePriorityFilter = (value: PlayPriority) => {
    const newValues = filters.priority.includes(value)
      ? filters.priority.filter(v => v !== value)
      : [...filters.priority, value];
    onFiltersChange({ ...filters, priority: newValues });
  };

  const toggleInterventionTypeFilter = (value: InterventionType) => {
    const newValues = filters.interventionType.includes(value)
      ? filters.interventionType.filter(v => v !== value)
      : [...filters.interventionType, value];
    onFiltersChange({ ...filters, interventionType: newValues });
  };

  const toggleOutcomeFilter = (value: string) => {
    const newValues = filters.outcome.includes(value)
      ? filters.outcome.filter(v => v !== value)
      : [...filters.outcome, value];
    onFiltersChange({ ...filters, outcome: newValues });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      interventionType: [],
      outcome: [],
    });
  };

  const activeFilterCount = filters.status.length + filters.priority.length +
    filters.interventionType.length + filters.outcome.length;

  return (
    <div style={styles.container}>
      {/* Top row: View mode toggle + Filters toggle + Clear button */}
      <div style={styles.topRow}>
        {/* View Mode Toggle */}
        <div style={styles.viewToggle}>
          <button
            style={{
              ...styles.viewButton,
              ...(viewMode === 'gallery' ? styles.viewButtonActive : {}),
            }}
            onClick={() => onViewModeChange('gallery')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            Cards
          </button>
          <button
            style={{
              ...styles.viewButton,
              ...(viewMode === 'kanban' ? styles.viewButtonActive : {}),
            }}
            onClick={() => onViewModeChange('kanban')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="4" height="14" rx="1" />
              <rect x="6" y="1" width="4" height="10" rx="1" />
              <rect x="11" y="1" width="4" height="7" rx="1" />
            </svg>
            Kanban
          </button>
        </div>

        {/* Filters toggle button */}
        <button
          style={{
            ...styles.filtersToggle,
            ...(isCollapsed ? {} : styles.filtersToggleActive),
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3.5h12M2 8h12M2 12.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span style={styles.filterBadge}>{activeFilterCount}</span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
              marginLeft: '4px',
            }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button style={styles.clearButton} onClick={clearAllFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Expandable Filter Options */}
      {!isCollapsed && (
        <div style={styles.filterRow}>
          {/* Status Filter */}
          <div style={styles.filterGroup}>
            <div style={styles.filterGroupTitle}>Status</div>
            <div style={styles.filterChips}>
              <FilterChip
                label="Do Next"
                count={statusCounts['do-next']}
                checked={filters.status.includes('do-next')}
                onChange={() => toggleStatusFilter('do-next')}
                color="#5243AA"
              />
              <FilterChip
                label="In Progress"
                count={statusCounts['in-progress']}
                checked={filters.status.includes('in-progress')}
                onChange={() => toggleStatusFilter('in-progress')}
                color="#0052CC"
              />
              <FilterChip
                label="Backlog"
                count={statusCounts['backlog']}
                checked={filters.status.includes('backlog')}
                onChange={() => toggleStatusFilter('backlog')}
                color="#6B778C"
              />
              <FilterChip
                label="Completed"
                count={statusCounts['completed']}
                checked={filters.status.includes('completed')}
                onChange={() => toggleStatusFilter('completed')}
                color="#00875A"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div style={styles.filterGroup}>
            <div style={styles.filterGroupTitle}>Priority</div>
            <div style={styles.filterChips}>
              <FilterChip
                label="High"
                count={priorityCounts['high']}
                checked={filters.priority.includes('high')}
                onChange={() => togglePriorityFilter('high')}
                color="#DE350B"
              />
              <FilterChip
                label="Medium"
                count={priorityCounts['medium']}
                checked={filters.priority.includes('medium')}
                onChange={() => togglePriorityFilter('medium')}
                color="#FF8B00"
              />
              <FilterChip
                label="Low"
                count={priorityCounts['low']}
                checked={filters.priority.includes('low')}
                onChange={() => togglePriorityFilter('low')}
                color="#36B37E"
              />
            </div>
          </div>

          {/* Intervention Type Filter */}
          <div style={styles.filterGroup}>
            <div style={styles.filterGroupTitle}>Type</div>
            <div style={styles.filterChips}>
              <FilterChip
                label="Process"
                count={typeCounts['process']}
                checked={filters.interventionType.includes('process')}
                onChange={() => toggleInterventionTypeFilter('process')}
              />
              <FilterChip
                label="Culture"
                count={typeCounts['culture']}
                checked={filters.interventionType.includes('culture')}
                onChange={() => toggleInterventionTypeFilter('culture')}
              />
              <FilterChip
                label="Tooling"
                count={typeCounts['tooling']}
                checked={filters.interventionType.includes('tooling')}
                onChange={() => toggleInterventionTypeFilter('tooling')}
              />
            </div>
          </div>

          {/* Outcome Filter */}
          {outcomeIds.length > 0 && (
            <div style={styles.filterGroup}>
              <div style={styles.filterGroupTitle}>Outcome</div>
              <div style={styles.filterChips}>
                {outcomeIds.map(outcomeId => {
                  const outcome = OUTCOME_DEFINITIONS.find(o => o.id === outcomeId);
                  if (!outcome) return null;
                  return (
                    <FilterChip
                      key={outcomeId}
                      label={outcome.shortName || outcome.name}
                      count={outcomeCounts[outcomeId]}
                      checked={filters.outcome.includes(outcomeId)}
                      onChange={() => toggleOutcomeFilter(outcomeId)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// FilterChip component - horizontal chip style for toolbar
interface FilterChipProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  color?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  checked,
  onChange,
  color,
}) => (
  <button
    style={{
      ...styles.filterChip,
      ...(checked ? {
        backgroundColor: color ? `${color}15` : '#DEEBFF',
        borderColor: color || '#0052CC',
        color: color || '#0052CC',
      } : {}),
    }}
    onClick={onChange}
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ marginRight: '4px' }}>
        <path d="M4.5 7.5L2.5 5.5L1.5 6.5L4.5 9.5L10.5 3.5L9.5 2.5L4.5 7.5Z" />
      </svg>
    )}
    {label}
    <span style={styles.chipCount}>({count})</span>
  </button>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  viewToggle: {
    display: 'flex',
    gap: '2px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    padding: '3px',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  viewButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
  },
  filtersToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filtersToggleActive: {
    backgroundColor: '#F4F5F7',
    borderColor: '#B3BAC5',
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    borderRadius: '9px',
    fontSize: '11px',
    fontWeight: 600,
  },
  clearButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#DE350B',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    paddingTop: '8px',
    borderTop: '1px solid #EBECF0',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterGroupTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
  },
  filterChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  chipCount: {
    marginLeft: '4px',
    opacity: 0.7,
  },
};

export default PlayFilters;
