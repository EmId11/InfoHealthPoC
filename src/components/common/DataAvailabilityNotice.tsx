import React from 'react';

interface ComponentAvailability {
  css: boolean;
  trs: boolean;
  pgs: boolean;
}

interface DataAvailabilityNoticeProps {
  componentsAvailable: ComponentAvailability;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Show detailed explanation */
  showDetails?: boolean;
}

/**
 * Displays a notice when not all CHS components are available.
 * Explains why data is missing and when it will become available.
 */
const DataAvailabilityNotice: React.FC<DataAvailabilityNoticeProps> = ({
  componentsAvailable,
  compact = false,
  showDetails = true,
}) => {
  const { css, trs, pgs } = componentsAvailable;

  // Full data - no notice needed
  if (css && trs && pgs) return null;

  // Determine the scenario
  const isCssOnly = css && !trs && !pgs;
  const isCssTrsOnly = css && trs && !pgs;

  if (compact) {
    // Compact inline version
    return (
      <div style={styles.compactContainer}>
        <span style={styles.compactIcon}>ℹ</span>
        <span style={styles.compactText}>
          {isCssOnly && 'Based on current state only'}
          {isCssTrsOnly && 'Peer comparison unavailable'}
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0052CC">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <span style={styles.title}>
          {isCssOnly && 'Limited Data Available'}
          {isCssTrsOnly && 'Partial Data Available'}
        </span>
      </div>

      {showDetails && (
        <div style={styles.content}>
          {isCssOnly && (
            <>
              <p style={styles.message}>
                This score is based on <strong>current state only</strong> because this is your first assessment.
              </p>
              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>Current State (CSS)</strong> — Available now</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.pendingIcon}>○</span>
                  <span><strong>Trajectory (TRS)</strong> — Available after your next assessment</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.pendingIcon}>○</span>
                  <span><strong>Peer Growth (PGS)</strong> — Requires 5+ comparable teams with history</span>
                </div>
              </div>
              <p style={styles.note}>
                Your score will become more comprehensive as more data becomes available over time.
              </p>
            </>
          )}

          {isCssTrsOnly && (
            <>
              <p style={styles.message}>
                Peer comparison is not yet available. Your score uses <strong>current state and trajectory</strong>.
              </p>
              <div style={styles.detailsList}>
                <div style={styles.detailItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>Current State (CSS)</strong> — Available</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span><strong>Trajectory (TRS)</strong> — Available</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.pendingIcon}>○</span>
                  <span><strong>Peer Growth (PGS)</strong> — Requires 5+ comparable teams with history</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #B3D4FF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0052CC',
  },
  content: {},
  message: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '13px',
    color: '#42526E',
  },
  checkIcon: {
    color: '#36B37E',
    fontWeight: 700,
    flexShrink: 0,
  },
  pendingIcon: {
    color: '#6B778C',
    fontWeight: 700,
    flexShrink: 0,
  },
  note: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },

  // Compact styles
  compactContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#DEEBFF',
    borderRadius: '12px',
    border: '1px solid #B3D4FF',
  },
  compactIcon: {
    fontSize: '12px',
    color: '#0052CC',
  },
  compactText: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#0052CC',
  },
};

export default DataAvailabilityNotice;

/**
 * Get a short description of data availability status
 */
export function getDataAvailabilityStatus(componentsAvailable: ComponentAvailability): {
  status: 'full' | 'partial' | 'limited';
  label: string;
  shortLabel: string;
} {
  const { css, trs, pgs } = componentsAvailable;

  if (css && trs && pgs) {
    return { status: 'full', label: 'Full Score', shortLabel: 'Full' };
  }
  if (css && trs && !pgs) {
    return { status: 'partial', label: 'Partial Score', shortLabel: 'Partial' };
  }
  return { status: 'limited', label: 'Limited Score', shortLabel: 'Limited' };
}

/**
 * Get explanation text for component availability
 */
export function getComponentAvailabilityExplanation(
  component: 'trs' | 'pgs',
  available: boolean
): string {
  if (available) {
    if (component === 'trs') return 'Comparing early vs recent periods in this assessment';
    if (component === 'pgs') return 'Ranking your improvement against similar teams';
  } else {
    if (component === 'trs') return 'Requires at least 2 assessment periods';
    if (component === 'pgs') return 'Requires 5+ comparable teams with trajectory data';
  }
  return '';
}
