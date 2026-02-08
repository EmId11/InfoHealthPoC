import React, { useEffect, useRef } from 'react';
import { QueryFieldDefinition } from '../../../../types/reports';

interface OptionsDropdownProps {
  sortBy: { field: string; direction: 'asc' | 'desc' } | undefined;
  limit: number | undefined;
  selectedFields: string[];
  fields: QueryFieldDefinition[];
  showQueryPreview: boolean;
  anchorPosition: { top: number; left: number };
  onSortChange: (sortBy: { field: string; direction: 'asc' | 'desc' } | undefined) => void;
  onLimitChange: (limit: number | undefined) => void;
  onToggleQueryPreview: () => void;
  onClose: () => void;
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  sortBy,
  limit,
  selectedFields,
  fields,
  showQueryPreview,
  anchorPosition,
  onSortChange,
  onLimitChange,
  onToggleQueryPreview,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle sort field change
  const handleSortFieldChange = (field: string) => {
    if (!field) {
      onSortChange(undefined);
    } else {
      onSortChange({ field, direction: sortBy?.direction || 'asc' });
    }
  };

  // Toggle sort direction
  const handleToggleDirection = () => {
    if (sortBy) {
      onSortChange({
        ...sortBy,
        direction: sortBy.direction === 'asc' ? 'desc' : 'asc',
      });
    }
  };

  // Handle limit change
  const handleLimitChange = (value: string) => {
    onLimitChange(value ? Number(value) : undefined);
  };

  // Get field label
  const getFieldLabel = (fieldId: string): string => {
    const field = fields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        ...styles.dropdown,
        top: anchorPosition.top,
        left: anchorPosition.left,
      }}
    >
      <div style={styles.header}>
        <span style={styles.headerTitle}>Query Options</span>
      </div>

      <div style={styles.body}>
        {/* Sort By */}
        <div style={styles.row}>
          <label style={styles.label}>Sort by</label>
          <div style={styles.sortRow}>
            <select
              style={styles.select}
              value={sortBy?.field || ''}
              onChange={(e) => handleSortFieldChange(e.target.value)}
            >
              <option value="">None</option>
              {selectedFields.map(fieldId => (
                <option key={fieldId} value={fieldId}>
                  {getFieldLabel(fieldId)}
                </option>
              ))}
            </select>
            {sortBy && (
              <button
                style={styles.directionButton}
                onClick={handleToggleDirection}
                title={sortBy.direction === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortBy.direction === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            )}
          </div>
        </div>

        {/* Limit */}
        <div style={styles.row}>
          <label style={styles.label}>Limit results</label>
          <select
            style={styles.select}
            value={limit || ''}
            onChange={(e) => handleLimitChange(e.target.value)}
          >
            <option value="">All results</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="250">250</option>
            <option value="500">500</option>
          </select>
        </div>

        <div style={styles.divider} />

        {/* Show Query Preview Toggle */}
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showQueryPreview}
            onChange={onToggleQueryPreview}
          />
          <span>Show query preview</span>
        </label>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dropdown: {
    position: 'fixed',
    zIndex: 1000,
    minWidth: '240px',
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
    padding: '12px 16px',
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
  sortRow: {
    display: 'flex',
    gap: '8px',
  },
  select: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  directionButton: {
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '4px 0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
};

export default OptionsDropdown;
