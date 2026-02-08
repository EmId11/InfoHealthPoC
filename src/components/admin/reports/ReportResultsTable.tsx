import React, { useState } from 'react';
import { ReportResults, ReportColumnDefinition } from '../../../types/reports';

interface ReportResultsTableProps {
  results: ReportResults;
  maxRows?: number;
}

const ReportResultsTable: React.FC<ReportResultsTableProps> = ({
  results,
  maxRows,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Sort rows
  const sortedRows = React.useMemo(() => {
    if (!sortColumn) return results.rows;

    return [...results.rows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [results.rows, sortColumn, sortDirection]);

  const displayRows = maxRows ? sortedRows.slice(0, maxRows) : sortedRows;

  if (results.rows.length === 0) {
    return (
      <div style={styles.emptyState}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="6" width="24" height="28" rx="3" stroke="#A5ADBA" strokeWidth="2"/>
          <path d="M14 14h12M14 20h12M14 26h8" stroke="#A5ADBA" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p style={styles.emptyText}>No results match your query</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            {results.columns.map(column => (
              <th
                key={column.id}
                style={{
                  ...styles.th,
                  ...(column.sortable ? styles.thSortable : {}),
                }}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div style={styles.thContent}>
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span style={styles.sortIcon}>
                      {sortColumn === column.id ? (
                        sortDirection === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, index) => (
            <tr key={row.id || index} style={styles.tr}>
              {results.columns.map(column => (
                <td key={column.id} style={styles.td}>
                  {formatCellValue(row[column.id], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatCellValue(value: any, column: ReportColumnDefinition): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: '#A5ADBA' }}>—</span>;
  }

  switch (column.type) {
    case 'boolean':
      return value ? (
        <span style={styles.boolTrue}>Yes</span>
      ) : (
        <span style={styles.boolFalse}>No</span>
      );

    case 'date':
      try {
        return new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return value;
      }

    case 'enum':
      // Format enum values nicely
      if (typeof value === 'string') {
        // Convert camelCase or snake_case to Title Case
        return value
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/^\w/, c => c.toUpperCase())
          .trim();
      }
      return value;

    case 'number':
      if (typeof value === 'number') {
        // Format numbers with commas
        return value.toLocaleString();
      }
      return value;

    default:
      return String(value);
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    overflowX: 'auto',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #EBECF0',
    textAlign: 'left',
    fontWeight: 600,
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  thSortable: {
    cursor: 'pointer',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sortIcon: {
    fontSize: '12px',
    color: '#A5ADBA',
  },
  tr: {
    borderBottom: '1px solid #EBECF0',
  },
  td: {
    padding: '12px 16px',
    color: '#172B4D',
    verticalAlign: 'top',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  emptyText: {
    margin: '12px 0 0 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  boolTrue: {
    color: '#00875A',
    fontWeight: 500,
  },
  boolFalse: {
    color: '#6B778C',
  },
};

export default ReportResultsTable;
