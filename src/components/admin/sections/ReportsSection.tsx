import React from 'react';
import ReportingEngineLayout from '../ReportingEngine/ReportingEngineLayout';

const ReportsSection: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Reports</h2>
        <p style={styles.subtitle}>
          Explore pre-built report templates, build custom queries with visual filters, and save reports
          for quick access. Search across teams, dimensions, issues, and more.
        </p>
      </div>
      <ReportingEngineLayout />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
};

export default ReportsSection;
