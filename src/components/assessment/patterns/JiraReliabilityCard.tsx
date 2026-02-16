import React from 'react';
import {
  JIRA_USE_CASES,
  RELIABILITY_STYLES,
  getReliabilityStatuses,
  getRequiredLevelForReliable,
  ReliabilityStatus,
} from './DataTrustBanner';

interface JiraReliabilityCardProps {
  trustLevelName: string;
}

const ROW_TINTS: Record<ReliabilityStatus, string> = {
  reliable:          'rgba(0, 135, 90, 0.06)',
  caution:           'rgba(255, 139, 0, 0.06)',
  'not-recommended': 'rgba(222, 53, 11, 0.06)',
};

const JiraReliabilityCard: React.FC<JiraReliabilityCardProps> = ({ trustLevelName }) => {
  const statuses = getReliabilityStatuses(trustLevelName);

  return (
    <div style={styles.card}>
      <div style={styles.headerSection}>
        <span style={styles.title}>JIRA RELIABILITY GUIDE</span>
        <p style={styles.subtitle}>
          Based on your <strong>{trustLevelName}</strong> trust score, here's what you can and can't rely on Jira for:
        </p>
      </div>

      <div style={styles.rows}>
        {JIRA_USE_CASES.map((useCase, i) => {
          const status = statuses[i];
          const rs = RELIABILITY_STYLES[status];
          const requiredLevel = status !== 'reliable' ? getRequiredLevelForReliable(i) : null;
          return (
            <div
              key={i}
              style={{
                ...styles.row,
                backgroundColor: ROW_TINTS[status],
              }}
            >
              <div style={styles.rowLeft}>
                <span style={{
                  ...styles.statusIcon,
                  color: rs.color,
                  backgroundColor: `${rs.color}14`,
                }}>
                  {rs.symbol}
                </span>
                <span style={styles.useCaseName}>{useCase}</span>
              </div>
              <div style={styles.rowRight}>
                <span style={{
                  ...styles.statusLabel,
                  color: rs.color,
                }}>
                  {rs.label}
                </span>
                {requiredLevel && (
                  <span style={styles.guidanceText}>Needs {requiredLevel} or better</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    padding: '24px 32px 20px',
  },
  headerSection: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '12px',
    color: '#97A0AF',
    lineHeight: 1.5,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderRadius: '8px',
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rowRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '2px',
  },
  statusIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  useCaseName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  statusLabel: {
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  guidanceText: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#97A0AF',
  },
};

export default JiraReliabilityCard;
