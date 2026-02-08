import React from 'react';
import { ReportingPage } from './JQLQueryPage';

/**
 * ReportingEngineLayout - Main layout for the reporting system
 *
 * This component provides an intuitive interface for querying health data
 * across teams, dimensions, issues, and other entities.
 *
 * Features:
 * - Pre-built report templates organized by category
 * - Visual query builder with dropdown-based filtering
 * - Saved reports for frequently used queries
 * - Sortable, paginated results table
 * - CSV export
 */
const ReportingEngineLayout: React.FC = () => {
  return (
    <div style={styles.container}>
      <ReportingPage />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: 'calc(100vh - 180px)',
    minHeight: '600px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #DFE1E6',
  },
};

export default ReportingEngineLayout;
