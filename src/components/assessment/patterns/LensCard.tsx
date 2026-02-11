import React from 'react';
import { LensType, LensResult, CoverageLensData, OverallSeverity } from '../../../types/patterns';

interface LensCardProps {
  lens: LensType;
  coverageData?: CoverageLensData;
  lensResult?: LensResult;
  onClick?: () => void;
  isActive?: boolean;
}

const LENS_CONFIG: Record<LensType, { label: string; icon: string; description: string }> = {
  coverage: { label: 'Field Completeness', icon: 'M3 3h18v18H3V3zm2 2v14h14V5H14v6l-2.5-1.5L9 11V5H5z', description: 'Are critical Jira fields filled in before work starts?' },
  integrity: { label: 'Integrity', icon: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.58L18 9.5l-7 7z', description: 'Do field values contain real data or just placeholders?' },
  timing: { label: 'Timing', icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z', description: 'Was information available when decisions were made?' },
  behavioral: { label: 'Behavioral', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', description: 'Are there patterns that may distort your metrics?' },
};

const SEVERITY_STYLES: Record<OverallSeverity, { color: string; bgColor: string; label: string; icon: string }> = {
  critical: { color: '#DE350B', bgColor: '#FFEBE6', label: 'Critical', icon: '\u26D4' },
  warning: { color: '#FF8B00', bgColor: '#FFFAE6', label: 'Warning', icon: '\u26A0' },
  clean: { color: '#00875A', bgColor: '#E3FCEF', label: 'Clean', icon: '\u2713' },
};

function getCoverageSeverity(percent: number): OverallSeverity {
  if (percent >= 70) return 'clean';
  if (percent >= 45) return 'warning';
  return 'critical';
}

const LensCard: React.FC<LensCardProps> = ({ lens, coverageData, lensResult, onClick, isActive }) => {
  const config = LENS_CONFIG[lens];

  const isCoverage = lens === 'coverage';
  const severity = isCoverage
    ? getCoverageSeverity(coverageData?.coveragePercent ?? 0)
    : (lensResult?.overallSeverity ?? 'clean');
  const severityStyle = SEVERITY_STYLES[severity];

  return (
    <button
      style={{
        ...styles.card,
        ...(isActive ? styles.cardActive : {}),
        borderColor: isActive ? '#0052CC' : '#E4E6EB',
      }}
      onClick={onClick}
    >
      {/* Lens Icon + Label */}
      <div style={styles.header}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B778C">
          <path d={config.icon} />
        </svg>
        <span style={styles.label}>{config.label}</span>
      </div>
      <span style={styles.description}>{config.description}</span>

      {/* Main Metric */}
      <div style={styles.metric}>
        {isCoverage ? (
          <>
            <span style={styles.metricValue}>{coverageData?.coveragePercent ?? 0}%</span>
            <span style={styles.metricUnit}>complete</span>
          </>
        ) : (
          <>
            <span style={styles.metricValue}>
              {lensResult?.patternsDetected ?? 0} of {lensResult?.patternsChecked ?? 0}
            </span>
            <span style={styles.metricUnit}>detected</span>
          </>
        )}
      </div>

      {/* Severity Badge */}
      <div style={{ ...styles.badge, backgroundColor: severityStyle.bgColor, color: severityStyle.color }}>
        <span>{severityStyle.icon}</span>
        <span>{severityStyle.label}</span>
      </div>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #E4E6EB',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    minWidth: '140px',
    fontFamily: 'inherit',
  },
  cardActive: {
    boxShadow: '0 2px 8px rgba(0, 82, 204, 0.15)',
    backgroundColor: '#F7FAFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  description: {
    fontSize: '11px',
    color: '#8993A4',
    lineHeight: 1.3,
    textAlign: 'center' as const,
    maxWidth: '180px',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  metricUnit: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
};

export default LensCard;
