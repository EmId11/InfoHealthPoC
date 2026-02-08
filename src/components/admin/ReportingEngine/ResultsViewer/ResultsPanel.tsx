import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ExtendedReportQuery,
  ReportResults,
  ReportResultRow,
  SavedReport,
  QueryEntityType,
  getDrilldownPathsFrom,
  getEntityLabel,
  VisualizationType,
  generateShareToken,
} from '../../../../types/reports';
import { executeQuery } from '../../../../utils/reportQueryEngine';
import DrilldownModal from './DrilldownModal';
import SaveReportModal from './SaveReportModal';

interface ResultsPanelProps {
  query: ExtendedReportQuery;
  results: ReportResults | null;
  isExecuting: boolean;
  onResultsChange: (results: ReportResults | null) => void;
  onDrilldown: (
    targetEntity: QueryEntityType,
    filterField: string,
    filterValue: string,
    parentName: string
  ) => void;
  onSaveReport: (report: SavedReport) => void;
  onQueryChange?: (updates: Partial<ExtendedReportQuery>) => void;
}

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  query,
  results,
  isExecuting,
  onResultsChange,
  onDrilldown,
  onSaveReport,
  onQueryChange,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRow, setSelectedRow] = useState<ReportResultRow | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewMode, setViewMode] = useState<VisualizationType>('table');
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const PAGE_SIZE = 25;

  // Execute query when it changes or when Run is clicked
  useEffect(() => {
    if (isExecuting) {
      const result = executeQuery(query);
      onResultsChange(result);
      setCurrentPage(0);
      setSortConfig(query.sortBy ? { column: query.sortBy.field, direction: query.sortBy.direction } : null);
    }
  }, [isExecuting, query, onResultsChange]);

  // Get drilldown paths for current entity
  const drilldownPaths = useMemo(() => {
    return getDrilldownPathsFrom(query.entityType);
  }, [query.entityType]);

  // Sort and paginate results
  const displayedRows = useMemo(() => {
    if (!results) return [];

    let rows = [...results.rows];

    // Apply sorting
    if (sortConfig) {
      rows.sort((a, b) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    // Apply limit from query
    if (query.limit) {
      rows = rows.slice(0, query.limit);
    }

    // Apply pagination
    const start = currentPage * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [results, sortConfig, currentPage, query.limit]);

  // Total rows after limit
  const totalRows = useMemo(() => {
    if (!results) return 0;
    return query.limit ? Math.min(results.totalCount, query.limit) : results.totalCount;
  }, [results, query.limit]);

  const totalPages = Math.ceil(totalRows / PAGE_SIZE);

  // Handle column sort
  const handleSort = (column: string) => {
    setSortConfig(prev => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  };

  // Handle row click for drilldown
  const handleRowClick = (row: ReportResultRow) => {
    if (drilldownPaths.length > 0) {
      setSelectedRow(row);
      setShowDrilldown(true);
    }
  };

  // Handle drilldown selection
  const handleDrilldownSelect = (targetEntity: QueryEntityType, relationField: string) => {
    if (!selectedRow) return;

    const filterValue = String(selectedRow[relationField] || selectedRow.id);
    const displayName = String(
      selectedRow.teamName ||
      selectedRow.displayName ||
      selectedRow.sprintName ||
      selectedRow.dimensionName ||
      selectedRow.id
    );

    onDrilldown(targetEntity, relationField, filterValue, displayName);
    setShowDrilldown(false);
    setSelectedRow(null);
  };

  // Handle save report
  const handleSaveReport = (name: string, description: string, isPublic: boolean) => {
    const report: SavedReport = {
      id: `rpt-${Date.now()}`,
      name,
      description,
      query: {
        entityType: query.entityType,
        groups: query.groups,
        groupOperator: query.groupOperator,
      },
      createdAt: new Date().toISOString(),
      createdByUserId: 'current-user',
      createdByUserName: 'Current User',
      updatedAt: new Date().toISOString(),
      status: 'saved',
      isPublicLink: isPublic,
      visibleColumns: query.selectedFields,
      sortColumn: query.sortBy?.field,
      sortDirection: query.sortBy?.direction,
      ...(isPublic ? { shareToken: generateShareToken(), sharedAt: new Date().toISOString() } : {}),
    };

    onSaveReport(report);
    setShowSaveModal(false);
  };

  // Handle column toggle
  const handleColumnToggle = (columnId: string) => {
    if (!onQueryChange) return;

    const newFields = query.selectedFields.includes(columnId)
      ? query.selectedFields.filter(f => f !== columnId)
      : [...query.selectedFields, columnId];

    // Don't allow removing all columns
    if (newFields.length > 0) {
      onQueryChange({ selectedFields: newFields });
    }
  };

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (!results || results.rows.length === 0) return;

    const headers = results.columns.map(c => c.label).join(',');
    const rows = results.rows.map(row =>
      results.columns.map(col => {
        const value = row[col.id];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      }).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${query.entityType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, query.entityType]);

  // Render empty state
  if (!results && !isExecuting) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <h3 style={styles.emptyTitle}>Ready to Query</h3>
          <p style={styles.emptyText}>
            Build your query using the panel on the left, then click "Run Query" to see results.
          </p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isExecuting) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.spinner} />
          <p>Executing query...</p>
        </div>
      </div>
    );
  }

  // Filter columns to only show selected fields
  const visibleColumns = results!.columns.filter(col =>
    query.selectedFields.includes(col.id)
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>
            {totalRows} {totalRows === 1 ? 'result' : 'results'}
          </h3>
          <span style={styles.entityBadge}>
            {getEntityLabel(query.entityType)}
          </span>
        </div>
        <div style={styles.headerRight}>
          {/* Column Selector */}
          <div style={styles.columnSelectorContainer}>
            <button
              style={styles.actionButton}
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              Columns ({query.selectedFields.length})
            </button>
            {showColumnSelector && results && (
              <div style={styles.columnDropdown}>
                <div style={styles.columnDropdownHeader}>
                  <span style={styles.columnDropdownTitle}>Show/Hide Columns</span>
                </div>
                <div style={styles.columnList}>
                  {results.columns.map(col => (
                    <label key={col.id} style={styles.columnOption}>
                      <input
                        type="checkbox"
                        checked={query.selectedFields.includes(col.id)}
                        onChange={() => handleColumnToggle(col.id)}
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'table' ? styles.viewButtonActive : {}),
              }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              📋
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'bar' ? styles.viewButtonActive : {}),
              }}
              onClick={() => setViewMode('bar')}
              title="Bar Chart"
            >
              📊
            </button>
          </div>
          <button style={styles.actionButton} onClick={handleExportCSV}>
            Export CSV
          </button>
          <button
            style={{ ...styles.actionButton, ...styles.primaryButton }}
            onClick={() => setShowSaveModal(true)}
          >
            Save Report
          </button>
        </div>
      </div>

      {/* Results Table */}
      {viewMode === 'table' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {drilldownPaths.length > 0 && <th style={styles.drilldownHeader} />}
                {visibleColumns.map(col => (
                  <th
                    key={col.id}
                    style={{
                      ...styles.th,
                      cursor: col.sortable ? 'pointer' : 'default',
                    }}
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <div style={styles.thContent}>
                      {col.label}
                      {sortConfig?.column === col.id && (
                        <span style={styles.sortIndicator}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, index) => (
                <tr
                  key={row.id || index}
                  style={styles.tr}
                  onClick={() => handleRowClick(row)}
                >
                  {drilldownPaths.length > 0 && (
                    <td style={styles.drilldownCell}>
                      <span style={styles.drilldownIcon}>→</span>
                    </td>
                  )}
                  {visibleColumns.map(col => (
                    <td key={col.id} style={styles.td}>
                      {formatCellValue(row[col.id], col.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple Bar Chart View */}
      {viewMode === 'bar' && results && (
        <div style={styles.chartContainer}>
          <SimpleBarChart data={results.rows} columns={visibleColumns} />
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            style={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      {/* Drilldown Modal */}
      {showDrilldown && selectedRow && (
        <DrilldownModal
          row={selectedRow}
          paths={drilldownPaths}
          entityType={query.entityType}
          onSelect={handleDrilldownSelect}
          onClose={() => {
            setShowDrilldown(false);
            setSelectedRow(null);
          }}
        />
      )}

      {/* Save Report Modal */}
      {showSaveModal && (
        <SaveReportModal
          onSave={handleSaveReport}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};

// Format cell value based on type
function formatCellValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span style={{ color: '#97A0AF' }}>—</span>;
  }

  if (type === 'boolean') {
    return value ? '✓' : '✗';
  }

  if (type === 'date') {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }

  if (type === 'number') {
    if (typeof value === 'number') {
      // Format percentages
      if (String(value).includes('.')) {
        return value.toFixed(1);
      }
      return value.toLocaleString();
    }
  }

  if (type === 'enum') {
    // Add colored badges for certain values
    const colorMap: Record<string, string> = {
      high: '#DE350B',
      moderate: '#FF991F',
      low: '#36B37E',
      improving: '#36B37E',
      declining: '#DE350B',
      stable: '#6B778C',
      active: '#36B37E',
      closed: '#6B778C',
      Done: '#36B37E',
      'In Progress': '#0065FF',
      Blocked: '#DE350B',
    };
    const color = colorMap[String(value)];
    if (color) {
      return (
        <span style={{
          padding: '2px 8px',
          backgroundColor: `${color}20`,
          color: color,
          borderRadius: '3px',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {String(value)}
        </span>
      );
    }
  }

  return String(value);
}

// Simple Bar Chart Component
interface SimpleBarChartProps {
  data: ReportResultRow[];
  columns: { id: string; label: string; type: string }[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, columns }) => {
  // Find the first numeric column for the chart
  const numericColumn = columns.find(c => c.type === 'number');
  const labelColumn = columns[0];

  if (!numericColumn || !labelColumn) {
    return (
      <div style={styles.chartPlaceholder}>
        Select numeric fields to visualize data
      </div>
    );
  }

  const chartData = data.slice(0, 10).map(row => ({
    label: String(row[labelColumn.id] || 'Unknown'),
    value: Number(row[numericColumn.id] || 0),
  }));

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div style={styles.simpleChart}>
      <div style={styles.chartTitle}>
        {numericColumn.label} by {labelColumn.label}
      </div>
      {chartData.map((item, index) => (
        <div key={index} style={styles.barRow}>
          <div style={styles.barLabel}>{item.label}</div>
          <div style={styles.barContainer}>
            <div
              style={{
                ...styles.bar,
                width: `${(item.value / maxValue) * 100}%`,
              }}
            />
          </div>
          <div style={styles.barValue}>{item.value}</div>
        </div>
      ))}
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
    padding: '16px',
    borderBottom: '1px solid #EBECF0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  entityBadge: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    borderRadius: '3px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  columnSelectorContainer: {
    position: 'relative',
  },
  columnDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    minWidth: '200px',
    maxHeight: '320px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
    zIndex: 100,
    overflow: 'hidden',
  },
  columnDropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  columnDropdownTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  columnList: {
    maxHeight: '260px',
    overflowY: 'auto',
    padding: '8px 0',
  },
  columnOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  viewToggle: {
    display: 'flex',
    gap: '4px',
    marginRight: '8px',
  },
  viewButton: {
    padding: '6px 10px',
    fontSize: '14px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  viewButtonActive: {
    backgroundColor: '#DEEBFF',
  },
  actionButton: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  primaryButton: {
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
  },
  tableContainer: {
    flex: 1,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    position: 'sticky',
    top: 0,
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #DFE1E6',
    whiteSpace: 'nowrap',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  sortIndicator: {
    color: '#0052CC',
  },
  drilldownHeader: {
    width: '32px',
    padding: '12px 8px',
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #DFE1E6',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
    color: '#172B4D',
  },
  drilldownCell: {
    width: '32px',
    padding: '12px 8px',
    borderBottom: '1px solid #EBECF0',
  },
  drilldownIcon: {
    color: '#0052CC',
    opacity: 0.5,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderTop: '1px solid #EBECF0',
  },
  pageButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#6B778C',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '48px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    maxWidth: '300px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#6B778C',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #EBECF0',
    borderTopColor: '#0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  chartContainer: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
  },
  chartPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6B778C',
    fontSize: '14px',
  },
  simpleChart: {
    padding: '16px',
  },
  chartTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '16px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  barLabel: {
    width: '120px',
    fontSize: '12px',
    color: '#42526E',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  barContainer: {
    flex: 1,
    height: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  barValue: {
    width: '60px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#172B4D',
    textAlign: 'right',
  },
};

export default ResultsPanel;
