import React from 'react';
import { JiraHealthReport, JiraHealthSeverity } from '../../../constants/healthReports';

interface HealthReportCardProps {
  report: JiraHealthReport;
  resultCount: number | null; // null = not yet loaded
  isLoading?: boolean;
  onClick: () => void;
}

const SEVERITY_STYLES: Record<JiraHealthSeverity, { bg: string; color: string; border: string }> = {
  critical: {
    bg: '#FFEBE6',
    color: '#DE350B',
    border: '#FF8F73',
  },
  warning: {
    bg: '#FFF7D6',
    color: '#974F0C',
    border: '#FFE380',
  },
  info: {
    bg: '#E6FCFF',
    color: '#0065FF',
    border: '#79E2F2',
  },
};

const SEVERITY_ICONS: Record<JiraHealthSeverity, React.ReactNode> = {
  critical: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 6v5M10 13h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 9v5M10 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const HealthReportCard: React.FC<HealthReportCardProps> = ({
  report,
  resultCount,
  isLoading,
  onClick,
}) => {
  const severityStyle = SEVERITY_STYLES[report.severity];

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={{ ...styles.iconContainer, backgroundColor: severityStyle.bg, color: severityStyle.color }}>
        {SEVERITY_ICONS[report.severity]}
      </div>
      <div style={styles.content}>
        <h4 style={styles.title}>{report.title}</h4>
        <p style={styles.description}>{report.description}</p>
      </div>
      <div style={styles.countContainer}>
        {isLoading ? (
          <span style={styles.loading}>...</span>
        ) : resultCount !== null ? (
          <span style={{
            ...styles.count,
            backgroundColor: resultCount > 0 ? severityStyle.bg : '#F4F5F7',
            color: resultCount > 0 ? severityStyle.color : '#6B778C',
          }}>
            {resultCount}
          </span>
        ) : (
          <span style={styles.notLoaded}>-</span>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.arrow}>
        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  countContainer: {
    flexShrink: 0,
  },
  count: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '28px',
    padding: '0 10px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 600,
  },
  loading: {
    color: '#6B778C',
    fontSize: '14px',
  },
  notLoaded: {
    color: '#A5ADBA',
    fontSize: '14px',
  },
  arrow: {
    color: '#6B778C',
    flexShrink: 0,
  },
};

export default HealthReportCard;
