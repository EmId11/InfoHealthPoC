// ExclusionReasonBadge Component
// Shows why a play is excluded from impact calculation

import React, { useState } from 'react';
import {
  ExclusionReason,
  ImpactExclusion,
  getExclusionReasonLabel,
  getExclusionReasonDescription,
} from '../../../types/impactMeasurement';

interface ExclusionReasonBadgeProps {
  reason: ExclusionReason;
  size?: 'small' | 'medium';
  showTooltip?: boolean;
}

export const ExclusionReasonBadge: React.FC<ExclusionReasonBadgeProps> = ({
  reason,
  size = 'medium',
  showTooltip = true,
}) => {
  const label = getExclusionReasonLabel(reason);
  const description = getExclusionReasonDescription(reason);
  const colors = getReasonColors(reason);

  const sizeStyles = {
    small: { fontSize: 10, padding: '1px 4px' },
    medium: { fontSize: 11, padding: '2px 6px' },
  };

  return (
    <span
      style={{
        ...styles.badge,
        backgroundColor: colors.bg,
        color: colors.text,
        ...sizeStyles[size],
      }}
      title={showTooltip ? description : undefined}
    >
      {colors.icon} {label}
    </span>
  );
};

// Full exclusion card with details
interface ExclusionCardProps {
  exclusion: ImpactExclusion;
  playTitle?: string;
  onDismiss?: () => void;
}

export const ExclusionCard: React.FC<ExclusionCardProps> = ({
  exclusion,
  playTitle,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  const primaryColors = getReasonColors(exclusion.primaryReason);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitleSection}>
          {playTitle && <span style={styles.playTitle}>{playTitle}</span>}
          <ExclusionReasonBadge reason={exclusion.primaryReason} />
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={styles.dismissButton}>
            &times;
          </button>
        )}
      </div>

      <p style={styles.explanation}>{exclusion.explanation}</p>

      {exclusion.reasons.length > 1 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          {expanded ? 'Hide' : 'Show'} {exclusion.reasons.length - 1} more reason{exclusion.reasons.length > 2 ? 's' : ''}
        </button>
      )}

      {expanded && (
        <div style={styles.additionalReasons}>
          {exclusion.reasons
            .filter(r => r !== exclusion.primaryReason)
            .map((reason, idx) => (
              <div key={idx} style={styles.additionalReason}>
                <ExclusionReasonBadge reason={reason} size="small" />
                <span style={styles.additionalDescription}>
                  {getExclusionReasonDescription(reason)}
                </span>
              </div>
            ))}
        </div>
      )}

      <div style={styles.cardFooter}>
        {exclusion.isTemporary ? (
          <span style={styles.temporaryBadge}>
            {'\u23F0'} Temporary
            {exclusion.reevaluateAt && (
              <span style={styles.reevaluateDate}>
                - Check again {formatDate(new Date(exclusion.reevaluateAt))}
              </span>
            )}
          </span>
        ) : (
          <span style={styles.permanentBadge}>
            {'\u{1F512}'} Permanent exclusion
          </span>
        )}
      </div>
    </div>
  );
};

// List of exclusions summary
interface ExclusionListProps {
  exclusions: ImpactExclusion[];
  maxShow?: number;
  playTitleMap?: Record<string, string>;
}

export const ExclusionList: React.FC<ExclusionListProps> = ({
  exclusions,
  maxShow = 5,
  playTitleMap = {},
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayExclusions = showAll ? exclusions : exclusions.slice(0, maxShow);

  if (exclusions.length === 0) {
    return null;
  }

  return (
    <div style={styles.list}>
      {displayExclusions.map((exclusion, idx) => (
        <ExclusionCard
          key={idx}
          exclusion={exclusion}
          playTitle={playTitleMap[exclusion.playId]}
        />
      ))}

      {exclusions.length > maxShow && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={styles.showAllButton}
        >
          {showAll ? 'Show less' : `Show ${exclusions.length - maxShow} more`}
        </button>
      )}
    </div>
  );
};

// Helper to get colors for each reason type
function getReasonColors(reason: ExclusionReason): { bg: string; text: string; icon: string } {
  switch (reason) {
    case 'awaiting_window':
      return { bg: '#DEEBFF', text: '#0052CC', icon: '\u23F3' }; // Hourglass
    case 'insufficient_time':
      return { bg: '#FFF0B3', text: '#B65C02', icon: '\u23F0' }; // Clock
    case 'insufficient_data':
      return { bg: '#F4F5F7', text: '#6B778C', icon: '\u{1F4CA}' }; // Chart
    case 'high_baseline_volatility':
      return { bg: '#EAE6FF', text: '#5243AA', icon: '\u{1F4C9}' }; // Chart down
    case 'concurrent_plays_overlap':
      return { bg: '#FFF0B3', text: '#B65C02', icon: '\u{1F500}' }; // Shuffle
    case 'external_factors':
      return { bg: '#FFEBE6', text: '#DE350B', icon: '\u26A0' }; // Warning
    case 'play_not_completed':
      return { bg: '#F4F5F7', text: '#6B778C', icon: '\u23F8' }; // Pause
    default:
      return { bg: '#F4F5F7', text: '#6B778C', icon: '\u2753' }; // Question
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  // Card styles
  card: {
    padding: 12,
    backgroundColor: '#FAFBFC',
    border: '1px solid #DFE1E6',
    borderRadius: 8,
    marginBottom: 8,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  playTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#172B4D',
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#6B778C',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  explanation: {
    fontSize: 13,
    color: '#5E6C84',
    margin: 0,
    lineHeight: 1.4,
  },
  expandButton: {
    background: 'none',
    border: 'none',
    color: '#0052CC',
    fontSize: 12,
    cursor: 'pointer',
    padding: '4px 0',
    textDecoration: 'underline',
  },
  additionalReasons: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1px solid #DFE1E6',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  additionalReason: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  additionalDescription: {
    fontSize: 12,
    color: '#6B778C',
    lineHeight: 1.4,
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px solid #DFE1E6',
  },
  temporaryBadge: {
    fontSize: 11,
    color: '#0052CC',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  permanentBadge: {
    fontSize: 11,
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  reevaluateDate: {
    color: '#6B778C',
  },
  // List styles
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  showAllButton: {
    background: 'none',
    border: '1px solid #DFE1E6',
    borderRadius: 4,
    padding: '8px 12px',
    color: '#0052CC',
    fontSize: 13,
    cursor: 'pointer',
    textAlign: 'center',
  },
};

export default ExclusionReasonBadge;
