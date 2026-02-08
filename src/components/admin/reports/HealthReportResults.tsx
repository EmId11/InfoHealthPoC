import React, { useState, useMemo } from 'react';
import { JiraHealthReport, JiraHealthSeverity } from '../../../constants/healthReports';
import { ReportResults } from '../../../types/reports';
import {
  MOCK_TEAMS,
  getTeamsByPortfolio,
  getTeamsByTribe,
} from '../../../utils/reportQueryEngine';
import TeamScopeSelector, { TeamScope } from './TeamScopeSelector';
import ReportResultsTable from './ReportResultsTable';

interface HealthReportResultsProps {
  report: JiraHealthReport;
  results: ReportResults;
  categoryLabel: string;
  onBack: () => void;
}

const SEVERITY_COLORS: Record<JiraHealthSeverity, { bg: string; text: string }> = {
  critical: { bg: '#FFEBE6', text: '#DE350B' },
  warning: { bg: '#FFF7D6', text: '#974F0C' },
  info: { bg: '#E6FCFF', text: '#0065FF' },
};

const HealthReportResults: React.FC<HealthReportResultsProps> = ({
  report,
  results,
  categoryLabel,
  onBack,
}) => {
  const [scope, setScope] = useState<TeamScope>({ type: 'all', selectedTeams: [] });

  // Get team names in scope
  const teamsInScope = useMemo((): string[] => {
    switch (scope.type) {
      case 'all':
        return MOCK_TEAMS.map(t => t.teamName);
      case 'portfolio':
        return scope.portfolio ? getTeamsByPortfolio(scope.portfolio).map(t => t.teamName) : [];
      case 'tribe':
        return scope.tribe ? getTeamsByTribe(scope.tribe).map(t => t.teamName) : [];
      case 'teams':
        return scope.selectedTeams;
      default:
        return [];
    }
  }, [scope]);

  // Filter results by team scope
  const filteredResults = useMemo(() => {
    if (scope.type === 'all') {
      return results;
    }
    const filteredRows = results.rows.filter(row => {
      const teamName = row.teamName as string;
      return teamName && teamsInScope.includes(teamName);
    });
    return {
      ...results,
      rows: filteredRows,
      totalCount: filteredRows.length,
    };
  }, [results, scope.type, teamsInScope]);

  // Reorder columns to put Team first
  const orderedColumns = useMemo(() => {
    const teamCol = results.columns.find(col => col.id === 'teamName');
    const otherCols = results.columns.filter(col => col.id !== 'teamName');
    return teamCol ? [teamCol, ...otherCols] : results.columns;
  }, [results.columns]);

  // Reorder results to have Team column first and sort by team
  const orderedResults = useMemo(() => {
    const sortedRows = [...filteredResults.rows].sort((a, b) => {
      const teamA = (a.teamName as string) || '';
      const teamB = (b.teamName as string) || '';
      return teamA.localeCompare(teamB);
    });
    return {
      ...filteredResults,
      columns: orderedColumns,
      rows: sortedRows,
    };
  }, [filteredResults, orderedColumns]);

  // Export to CSV
  const handleExportCSV = () => {
    const columns = orderedColumns;

    // Build CSV header
    const header = columns.map(col => `"${col.label}"`).join(',');

    // Build CSV rows
    const csvRows = orderedResults.rows.map(row => {
      return columns.map(col => {
        const value = row[col.id];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      }).join(',');
    });

    const csvContent = [header, ...csvRows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.id}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const severityColor = SEVERITY_COLORS[report.severity];

  // Count unique teams in results
  const uniqueTeamCount = useMemo(() => {
    const teams = new Set<string>();
    filteredResults.rows.forEach(row => {
      if (row.teamName) teams.add(row.teamName as string);
    });
    return teams.size;
  }, [filteredResults.rows]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to {categoryLabel}
        </button>
      </div>

      {/* Title Section */}
      <div style={styles.titleSection}>
        <div style={styles.titleRow}>
          <span style={{
            ...styles.severityBadge,
            backgroundColor: severityColor.bg,
            color: severityColor.text,
          }}>
            {report.severity}
          </span>
          <h2 style={styles.title}>{report.title}</h2>
        </div>
        <p style={styles.description}>{report.description}</p>
      </div>

      {/* Toolbar: Scope Selector + Summary + Export */}
      <div style={styles.toolbar}>
        <TeamScopeSelector scope={scope} onChange={setScope} />

        <div style={styles.toolbarRight}>
          <div style={styles.summaryText}>
            <strong>{filteredResults.totalCount}</strong> result{filteredResults.totalCount !== 1 ? 's' : ''} across{' '}
            <strong>{uniqueTeamCount}</strong> team{uniqueTeamCount !== 1 ? 's' : ''}
          </div>
          <button style={styles.exportButton} onClick={handleExportCSV}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3M11 7l-3 3-3-3M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div style={styles.tableContainer}>
        {orderedResults.totalCount === 0 ? (
          <div style={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#DFE1E6" strokeWidth="2"/>
              <path d="M24 16v8M24 28h.02" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No results found for the selected teams</p>
          </div>
        ) : (
          <ReportResultsTable results={orderedResults} />
        )}
      </div>

      {/* Footer note */}
      {filteredResults.totalCount > 0 && (
        <div style={styles.footer}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 6v3M7 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>
            These items may need attention. Review each item to determine appropriate action.
          </span>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  severityBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: 0,
    fontSize: '15px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '24px',
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  summaryText: {
    fontSize: '14px',
    color: '#42526E',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#6554C0',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tableContainer: {
    flex: 1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: '#6B778C',
    gap: '16px',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
  },
  footer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#EAE6FF',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#403294',
    lineHeight: 1.4,
  },
};

export default HealthReportResults;
