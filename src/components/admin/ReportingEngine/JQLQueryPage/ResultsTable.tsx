import React, { useState, useMemo } from 'react';
import { ReportResults, ReportColumnDefinition, ReportResultRow } from '../../../../types/reports';

interface ResultsTableProps {
  results: ReportResults | null;
  isLoading: boolean;
  onSave?: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading, onSave }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Sort and paginate rows
  const { sortedRows, displayRows, totalPages } = useMemo(() => {
    if (!results) {
      return { sortedRows: [], displayRows: [], totalPages: 0 };
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

    return { sortedRows: rows, displayRows, totalPages };
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
    a.download = `query-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format cell value for display
  const formatCellValue = (value: unknown, column: ReportColumnDefinition): string => {
    if (value === null || value === undefined) return '-';

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (column.type === 'date') {
      try {
        return new Date(String(value)).toLocaleDateString();
      } catch {
        return String(value);
      }
    }

    if (column.type === 'number') {
      const num = Number(value);
      if (!isNaN(num)) {
        // Format with commas for large numbers, 2 decimal places for decimals
        if (Number.isInteger(num)) {
          return num.toLocaleString();
        }
        return num.toFixed(2);
      }
    }

    return String(value);
  };

  // Get cell style based on value type
  const getCellStyle = (value: unknown, column: ReportColumnDefinition): React.CSSProperties => {
    const base: React.CSSProperties = { ...styles.cell };

    if (column.type === 'number') {
      base.textAlign = 'right';
      base.fontVariantNumeric = 'tabular-nums';
    }

    // Highlight risk levels
    if (column.id === 'riskLevel' || column.id === 'worstDimensionRisk') {
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

    // Highlight confidence levels
    if (column.id === 'confidenceLevel' || column.id === 'lowestConfidenceLevel') {
      const strVal = String(value).toLowerCase();
      if (strVal === 'low') {
        base.color = '#DE350B';
        base.fontWeight = 500;
      } else if (strVal === 'moderate') {
        base.color = '#FF8B00';
      } else if (strVal === 'high' || strVal === 'very-high') {
        base.color = '#00875A';
      }
    }

    // Highlight trends
    if (column.id === 'trend') {
      const strVal = String(value).toLowerCase();
      if (strVal === 'declining') {
        base.color = '#DE350B';
      } else if (strVal === 'improving') {
        base.color = '#00875A';
      }
    }

    return base;
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Executing query...</span>
      </div>
    );
  }

  // Empty state
  if (!results) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>?</div>
        <div style={styles.emptyTitle}>Enter a query to get started</div>
        <div style={styles.emptySubtitle}>
          Type a JQL query above and click Run to see results
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
          Try adjusting your query conditions
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Results header */}
      <div style={styles.header}>
        <div style={styles.resultCount}>
          {results.totalCount} {results.totalCount === 1 ? 'result' : 'results'}
        </div>
        <div style={styles.headerActions}>
          {onSave && (
            <button onClick={onSave} style={styles.saveButton}>
              Save Report
            </button>
          )}
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
                    textAlign: column.type === 'number' ? 'right' : 'left',
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
                }}
              >
                {results.columns.map(column => (
                  <td key={column.id} style={getCellStyle(row[column.id], column)}>
                    {formatCellValue(row[column.id], column)}
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
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  resultCount: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  saveButton: {
    padding: '6px 12px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#FFFFFF',
    cursor: 'pointer',
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
    cursor: 'pointer',
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
  },
};

// Add keyframes for spinner animation (inject into document)
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ResultsTable;
