import React from 'react';
import { LensType, LensResult, CoverageLensData, OverallSeverity } from '../../../types/patterns';

interface LensCardProps {
  lens: LensType;
  coverageData?: CoverageLensData;
  lensResult?: LensResult;
  integrityScore?: number;
  onClick?: () => void;
  isActive?: boolean;
  embedded?: boolean;
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

const LensCard: React.FC<LensCardProps> = ({ lens, coverageData, lensResult, integrityScore, onClick, isActive, embedded }) => {
  const config = LENS_CONFIG[lens];

  const isCoverage = lens === 'coverage';
  const isIntegrity = lens === 'integrity' && integrityScore !== undefined;
  const severity = isCoverage
    ? getCoverageSeverity(coverageData?.coveragePercent ?? 0)
    : isIntegrity
      ? getCoverageSeverity(integrityScore)
      : (lensResult?.overallSeverity ?? 'clean');
  const severityStyle = SEVERITY_STYLES[severity];

  // When embedded, treat cards as always "visually active" (full opacity, colored)
  // since they serve as navigation tiles on the summary page
  const embeddedActive = embedded ? true : isActive;

  const embeddedCardStyle: React.CSSProperties = embedded ? {
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    backgroundColor: isActive ? '#F7FAFF' : 'transparent',
    opacity: 1,
    position: 'relative' as const,
  } : {};

  return (
    <div style={{ position: 'relative' as const, flex: 1, minWidth: '140px' }}>
      <button
        style={{
          ...styles.card,
          ...(embedded ? {} : (isActive ? styles.cardActive : styles.cardInactive)),
          ...(embedded ? {} : { borderColor: isActive ? '#0052CC' : '#E4E6EB' }),
          ...embeddedCardStyle,
        }}
        onClick={onClick}
      >
        {/* Blue top accent bar for active embedded card */}
        {embedded && isActive && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: '#0052CC',
          }} />
        )}
        {/* Lens Icon + Label */}
        <div style={styles.header}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={embeddedActive ? '#0052CC' : '#A5ADBA'}>
            <path d={config.icon} />
          </svg>
          <span style={{ ...styles.label, color: embeddedActive ? '#0052CC' : '#A5ADBA' }}>{config.label}</span>
        </div>
        <span style={{ ...styles.description, color: embeddedActive ? '#8993A4' : '#C1C7D0' }}>{config.description}</span>

        {/* Main Metric */}
        <div style={styles.metric}>
          {isCoverage ? (
            <>
              <span style={{ ...styles.metricValue, color: embeddedActive ? '#172B4D' : '#A5ADBA' }}>{coverageData?.coveragePercent ?? 0}%</span>
              <span style={{ ...styles.metricUnit, color: embeddedActive ? '#6B778C' : '#C1C7D0' }}>complete</span>
            </>
          ) : isIntegrity ? (
            <>
              <span style={{ ...styles.metricValue, color: embeddedActive ? '#172B4D' : '#A5ADBA' }}>{integrityScore}</span>
              <span style={{ ...styles.metricUnit, color: embeddedActive ? '#6B778C' : '#C1C7D0' }}>/100</span>
            </>
          ) : (
            <>
              <span style={{ ...styles.metricValue, color: embeddedActive ? '#172B4D' : '#A5ADBA' }}>
                {lensResult?.patternsDetected ?? 0} of {lensResult?.patternsChecked ?? 0}
              </span>
              <span style={{ ...styles.metricUnit, color: embeddedActive ? '#6B778C' : '#C1C7D0' }}>detected</span>
            </>
          )}
        </div>

        {/* Severity Badge */}
        <div style={{
          ...styles.badge,
          backgroundColor: embeddedActive ? severityStyle.bgColor : '#F4F5F7',
          color: embeddedActive ? severityStyle.color : '#A5ADBA',
        }}>
          <span>{severityStyle.icon}</span>
          <span>{severityStyle.label}</span>
        </div>
      </button>

      {/* Downward pointer connecting active card to content */}
      {isActive && !embedded && (
        <div style={styles.pointer}>
          <svg width="20" height="10" viewBox="0 0 20 10">
            <polygon points="0,0 10,10 20,0" fill="#0052CC" />
          </svg>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
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
    fontFamily: 'inherit',
  },
  cardActive: {
    boxShadow: '0 2px 8px rgba(0, 82, 204, 0.15)',
    backgroundColor: '#F7FAFF',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
  },
  cardInactive: {
    backgroundColor: '#FAFBFC',
    opacity: 0.75,
  },
  pointer: {
    position: 'absolute' as const,
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
    lineHeight: 0,
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
