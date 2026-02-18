import React, { useState, useMemo } from 'react';
import { AssessmentQueryResult, AssessmentQueryColumn, AssessmentQueryResultRow } from '../../../../types/assessmentReports';

interface AssessmentQueryResultsProps {
  results: AssessmentQueryResult | null;
  isLoading: boolean;
  onRowClick?: (rowId: string) => void;
}

const AssessmentQueryResults: React.FC<AssessmentQueryResultsProps> = ({
  results,
  isLoading,
  onRowClick,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Sort and paginate rows
  const { displayRows, totalPages } = useMemo(() => {
    if (!results) {
      return { displayRows: [], totalPages: 0 };
    }

    let rows = [...results.rows];

    // Apply sorting
    if (sortColumn) {
      rows.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        let cmp: number;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'desc' ? -cmp : cmp;
      });
    }

    const start = page * pageSize;
    const displayRows = rows.slice(start, start + pageSize);
    const totalPages = Math.ceil(rows.length / pageSize);

    return { displayRows, totalPages };
  }, [results, sortColumn, sortDirection, page]);

  // Handle column header click for sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!results) return;

    const headers = results.columns.map(c => c.label);
    const rows = results.rows.map(row =>
      results.columns.map(c => formatCellValue(row[c.id], c))
    );

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-query-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format cell value for display
  const formatCellValue = (value: unknown, column: AssessmentQueryColumn): string => {
    if (value === null || value === undefined) return '-';

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (column.type === 'percentage') {
      const num = Number(value);
      if (!isNaN(num)) {
        return `${Math.round(num)}%`;
      }
    }

    if (column.type === 'number') {
      const num = Number(value);
      if (!isNaN(num)) {
        if (Number.isInteger(num)) {
          return num.toLocaleString();
        }
        return num.toFixed(2);
      }
    }

    return String(value);
  };

  // Get cell style based on value type
  const getCellStyle = (value: unknown, column: AssessmentQueryColumn): React.CSSProperties => {
    const base: React.CSSProperties = { ...styles.cell };

    if (column.type === 'number' || column.type === 'percentage') {
      base.textAlign = 'right';
      base.fontVariantNumeric = 'tabular-nums';
    }

    // Highlight risk levels
    if (column.type === 'riskLevel') {
      const strVal = String(value).toLowerCase();
      if (strVal === 'high') {
        base.color = '#DE350B';
        base.fontWeight = 500;
      } else if (strVal === 'moderate') {
        base.color = '#FF8B00';
      } else if (strVal === 'low') {
        base.color = '#00875A';
      }
    }

    // Highlight trends
    if (column.type === 'trend') {
      const strVal = String(value).toLowerCase();
      if (strVal === 'declining') {
        base.color = '#DE350B';
      } else if (strVal === 'improving') {
        base.color = '#00875A';
      }
    }

    return base;
  };

  // Format display value with icons
  const formatDisplayValue = (value: unknown, column: AssessmentQueryColumn): React.ReactNode => {
    if (column.type === 'trend') {
      const strVal = String(value).toLowerCase();
      const color = strVal === 'improving' ? '#36B37E' : strVal === 'declining' ? '#DE350B' : '#6B778C';
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {strVal === 'improving' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
          {strVal === 'declining' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
          {strVal === 'stable' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
          {String(value)}
        </span>
      );
    }
    if (column.type === 'riskLevel') {
      const strVal = String(value).toLowerCase();
      const dot = strVal === 'high' ? '\u25CF' : strVal === 'moderate' ? '\u25CF' : '\u25CF';
      return `${dot} ${value}`;
    }
    return formatCellValue(value, column);
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Loading results...</span>
      </div>
    );
  }

  // Empty state
  if (!results) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>?</div>
        <div style={styles.emptyTitle}>Select a question to get started</div>
        <div style={styles.emptySubtitle}>
          Choose a question from the browser or search above
        </div>
      </div>
    );
  }

  // No results
  if (results.rows.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>0</div>
        <div style={styles.emptyTitle}>No results found</div>
        <div style={styles.emptySubtitle}>
          {results.description || 'Try a different question'}
        </div>
      </div>
    );
  }

  const handleRowClick = (row: AssessmentQueryResultRow) => {
    if (results.rowClickable && onRowClick) {
      onRowClick(row.id);
    }
  };

  return (
    <div style={styles.container}>
      {/* Results header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <div style={styles.resultTitle}>{results.title}</div>
          <div style={styles.resultDescription}>{results.description}</div>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.resultCount}>
            {results.totalCount} {results.totalCount === 1 ? 'result' : 'results'}
          </span>
          <button onClick={handleExportCSV} style={styles.exportButton}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {results.columns.map(column => (
                <th
                  key={column.id}
                  style={{
                    ...styles.headerCell,
                    textAlign: column.type === 'number' || column.type === 'percentage' ? 'right' : 'left',
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div style={styles.headerContent}>
                    <span>{column.label}</span>
                    {sortColumn === column.id && (
                      <span style={styles.sortIndicator}>
                        {sortDirection === 'asc' ? ' \u2191' : ' \u2193'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                  cursor: results.rowClickable ? 'pointer' : 'default',
                }}
                onClick={() => handleRowClick(row)}
              >
                {results.columns.map(column => (
                  <td key={column.id} style={getCellStyle(row[column.id], column)}>
                    {formatDisplayValue(row[column.id], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              ...styles.pageButton,
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              ...styles.pageButton,
              opacity: page >= totalPages - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Row click hint */}
      {results.rowClickable && (
        <div style={styles.clickHint}>
          Click on a row to view details
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
    gap: '16px',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '4px',
  },
  resultDescription: {
    fontSize: '13px',
    color: '#6B778C',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  resultCount: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
  },
  exportButton: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  tableWrapper: {
    flex: 1,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  headerCell: {
    padding: '10px 12px',
    backgroundColor: '#F4F5F7',
    borderBottom: '2px solid #DFE1E6',
    fontWeight: 600,
    color: '#172B4D',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'inherit',
    gap: '4px',
  },
  sortIndicator: {
    color: '#0052CC',
  },
  cell: {
    padding: '10px 12px',
    borderBottom: '1px solid #EBECF0',
    color: '#172B4D',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  pageButton: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#6B778C',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '16px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #EBECF0',
    borderTopColor: '#0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B778C',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '8px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
  },
  emptyIcon: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: '50%',
    fontSize: '20px',
    color: '#6B778C',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#172B4D',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#6B778C',
    textAlign: 'center',
  },
  clickHint: {
    padding: '8px 16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#6B778C',
    backgroundColor: '#FAFBFC',
    borderTop: '1px solid #EBECF0',
  },
};

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const styleId = 'assessment-query-results-spinner';
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

export default AssessmentQueryResults;
