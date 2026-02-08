import React from 'react';
import {
  QuickFilter,
  QuickFilterType,
  PORTFOLIO_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TIME_PERIOD_OPTIONS,
} from '../../../types/questionBuilder';

interface QuickFilterBarProps {
  activeFilters: Record<QuickFilterType, string>;
  onFilterChange: (filterType: QuickFilterType, value: string) => void;
  availableFilters?: QuickFilter[];
  onRunQuery: () => void;
  isLoading?: boolean;
}

// Default filters to show
const DEFAULT_FILTERS: QuickFilter[] = [
  {
    type: 'portfolio',
    label: 'Portfolio',
    options: PORTFOLIO_OPTIONS,
    defaultValue: 'all',
  },
  {
    type: 'teamSize',
    label: 'Team Size',
    options: TEAM_SIZE_OPTIONS,
    defaultValue: 'all',
  },
  {
    type: 'timePeriod',
    label: 'Time Period',
    options: TIME_PERIOD_OPTIONS,
    defaultValue: '30',
  },
];

const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  activeFilters,
  onFilterChange,
  availableFilters = DEFAULT_FILTERS,
  onRunQuery,
  isLoading = false,
}) => {
  // Check if any filters have non-default values
  const hasActiveFilters = availableFilters.some(
    filter => activeFilters[filter.type] !== filter.defaultValue
  );

  const handleClearFilters = () => {
    availableFilters.forEach(filter => {
      onFilterChange(filter.type, filter.defaultValue);
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.label}>Refine:</div>

      <div style={styles.filtersWrapper}>
        {availableFilters.map(filter => (
          <div key={filter.type} style={styles.filterGroup}>
            <label style={styles.filterLabel}>{filter.label}</label>
            <select
              value={activeFilters[filter.type] || filter.defaultValue}
              onChange={(e) => onFilterChange(filter.type, e.target.value)}
              style={{
                ...styles.select,
                ...(activeFilters[filter.type] !== filter.defaultValue ? styles.selectActive : {}),
              }}
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            style={styles.clearButton}
          >
            Clear filters
          </button>
        )}
      </div>

      <button
        onClick={onRunQuery}
        disabled={isLoading}
        style={{
          ...styles.runButton,
          ...(isLoading ? styles.runButtonLoading : {}),
        }}
      >
        {isLoading ? 'Running...' : 'Run Query'}
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #EBECF0',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    flexShrink: 0,
  },
  filtersWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterLabel: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  select: {
    padding: '6px 28px 6px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B778C' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    minWidth: '120px',
  },
  selectActive: {
    borderColor: '#0052CC',
    backgroundColor: '#E6F0FF',
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '12px',
    color: '#6B778C',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  runButton: {
    padding: '10px 24px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  runButtonLoading: {
    backgroundColor: '#97A0AF',
    cursor: 'not-allowed',
  },
};

export default QuickFilterBar;
