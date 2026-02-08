// ExcludedPlays Component
// Shows plays excluded from impact calculation with reasons

import React, { useState } from 'react';
import { ImpactExclusion } from '../../../types/impactMeasurement';
import { ExclusionCard, ExclusionReasonBadge } from '../../assessment/impact/ExclusionReasonBadge';
import { getExclusionSummary } from '../../../utils/impactExclusions';

interface ExcludedPlaysProps {
  exclusions: ImpactExclusion[];
  playTitleMap?: Record<string, string>;
  initialExpanded?: boolean;
}

export const ExcludedPlays: React.FC<ExcludedPlaysProps> = ({
  exclusions,
  playTitleMap = {},
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  if (exclusions.length === 0) {
    return null;
  }

  const summary = getExclusionSummary(exclusions);
  const temporaryCount = exclusions.filter(e => e.isTemporary).length;
  const permanentCount = exclusions.length - temporaryCount;

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <div style={styles.headerLeft}>
          <span style={styles.expandIcon}>{isExpanded ? '\u25BC' : '\u25B6'}</span>
          <h3 style={styles.title}>Excluded from Calculation</h3>
          <span style={styles.count}>{exclusions.length}</span>
        </div>
        {!isExpanded && (
          <div style={styles.summaryCounts}>
            {temporaryCount > 0 && (
              <span style={styles.temporaryBadge}>
                {temporaryCount} temporary
              </span>
            )}
            {permanentCount > 0 && (
              <span style={styles.permanentBadge}>
                {permanentCount} permanent
              </span>
            )}
          </div>
        )}
      </button>

      {isExpanded && (
        <div style={styles.content}>
          <p style={styles.description}>
            These plays cannot be included in impact calculations. Some exclusions are temporary
            and will resolve over time.
          </p>

          {/* Summary by reason */}
          <div style={styles.reasonSummary}>
            {summary.map(({ reason, count, label }) => (
              <div key={reason} style={styles.reasonItem}>
                <ExclusionReasonBadge reason={reason} size="small" showTooltip={false} />
                <span style={styles.reasonCount}>x{count}</span>
              </div>
            ))}
          </div>

          {/* Exclusion cards */}
          <div style={styles.exclusionList}>
            {exclusions.map((exclusion, idx) => (
              <ExclusionCard
                key={idx}
                exclusion={exclusion}
                playTitle={playTitleMap[exclusion.playId]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  expandIcon: {
    fontSize: 10,
    color: '#6B778C',
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: 0,
  },
  count: {
    backgroundColor: '#DFE1E6',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 500,
    color: '#5E6C84',
  },
  summaryCounts: {
    display: 'flex',
    gap: 8,
  },
  temporaryBadge: {
    fontSize: 11,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '2px 6px',
    borderRadius: 4,
  },
  permanentBadge: {
    fontSize: 11,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 6px',
    borderRadius: 4,
  },
  content: {
    padding: '0 20px 20px',
  },
  description: {
    fontSize: 13,
    color: '#6B778C',
    margin: '0 0 16px 0',
  },
  reasonSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
  },
  reasonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  reasonCount: {
    fontSize: 12,
    fontWeight: 500,
    color: '#5E6C84',
  },
  exclusionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
};

export default ExcludedPlays;
