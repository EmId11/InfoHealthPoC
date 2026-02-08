import React from 'react';
import type {
  PrioritizedDimensions,
  PrioritizedDimension,
} from '../../../utils/dimensionPrioritization';
import { PRIORITY_TIER_CONFIG } from '../../../utils/dimensionPrioritization';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import TrendingUpIcon from '@atlaskit/icon/glyph/arrow-up';
import TrendingDownIcon from '@atlaskit/icon/glyph/arrow-down';
import TrendingFlatIcon from '@atlaskit/icon/glyph/editor/horizontal-rule';

interface PriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  prioritized: PrioritizedDimensions;
  onDimensionClick: (dimensionKey: string) => void;
}

/**
 * PriorityModal - Full expanded view of all dimensions by priority tier
 *
 * Shows a 3-column layout with Focus Now, Up Next, and On Track sections
 */
const PriorityModal: React.FC<PriorityModalProps> = ({
  isOpen,
  onClose,
  prioritized,
  onDimensionClick,
}) => {
  if (!isOpen) return null;

  const handleDimensionClick = (dimensionKey: string) => {
    onDimensionClick(dimensionKey);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h2 style={styles.title}>Improvement Priorities</h2>
            <p style={styles.subtitle}>
              Dimensions prioritized by health score and trend direction
            </p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <p style={styles.description}>
            Focus on <strong style={{ color: PRIORITY_TIER_CONFIG.now.color }}>red items first</strong>,
            then move to <strong style={{ color: PRIORITY_TIER_CONFIG.next.color }}>yellow</strong>,
            and maintain <strong style={{ color: PRIORITY_TIER_CONFIG.later.color }}>green</strong>.
          </p>

          <div style={styles.columnsContainer}>
            {/* Focus Now Column */}
            <TierColumn
              tier="now"
              items={prioritized.now}
              onItemClick={handleDimensionClick}
            />

            {/* Up Next Column */}
            <TierColumn
              tier="next"
              items={prioritized.next}
              onItemClick={handleDimensionClick}
            />

            {/* On Track Column */}
            <TierColumn
              tier="later"
              items={prioritized.later}
              onItemClick={handleDimensionClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Column component for each tier
interface TierColumnProps {
  tier: 'now' | 'next' | 'later';
  items: PrioritizedDimension[];
  onItemClick: (dimensionKey: string) => void;
}

const TierColumn: React.FC<TierColumnProps> = ({ tier, items, onItemClick }) => {
  const config = PRIORITY_TIER_CONFIG[tier];

  return (
    <div style={styles.column}>
      <div
        style={{
          ...styles.columnHeader,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        }}
      >
        <span style={styles.columnIcon}>{config.icon}</span>
        <span style={{ ...styles.columnTitle, color: config.color }}>
          {config.label}
        </span>
        <span style={styles.columnCount}>({items.length})</span>
      </div>

      <div style={styles.columnBody}>
        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>
              {tier === 'now'
                ? 'No urgent issues!'
                : tier === 'next'
                  ? 'Nothing queued'
                  : 'No dimensions here'}
            </span>
          </div>
        ) : (
          items.map((item, index) => (
            <DimensionCard
              key={item.dimension.dimensionKey}
              item={item}
              tier={tier}
              rank={tier === 'now' ? index + 1 : undefined}
              onClick={() => onItemClick(item.dimension.dimensionKey)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual dimension card
interface DimensionCardProps {
  item: PrioritizedDimension;
  tier: 'now' | 'next' | 'later';
  rank?: number;
  onClick: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ item, tier, rank, onClick }) => {
  const config = PRIORITY_TIER_CONFIG[tier];
  const trend = item.dimension.trend;

  const TrendIcon = trend === 'improving'
    ? TrendingUpIcon
    : trend === 'declining'
      ? TrendingDownIcon
      : TrendingFlatIcon;

  const trendColor = trend === 'improving'
    ? '#36B37E'
    : trend === 'declining'
      ? '#DE350B'
      : '#6B778C';

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      style={{
        ...styles.dimensionCard,
        borderLeftColor: config.color,
      }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div style={styles.cardTop}>
        {rank !== undefined && (
          <span style={{ ...styles.rankBadge, backgroundColor: config.bgColor, color: config.color }}>
            #{rank}
          </span>
        )}
        <span style={styles.dimensionName}>{item.dimension.dimensionName}</span>
        <ChevronRightIcon label="" size="small" primaryColor="#B3BAC5" />
      </div>

      <div style={styles.cardBottom}>
        <span style={styles.percentileText}>
          Health Score: {item.dimension.healthScore ?? item.dimension.overallPercentile}
        </span>
        <span style={styles.trendPill}>
          <TrendIcon label="" size="small" primaryColor={trendColor} />
          <span style={{ color: trendColor, textTransform: 'capitalize' }}>
            {trend}
          </span>
        </span>
      </div>

      <p style={styles.reasonText}>{item.reason}</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Modal overlay & container
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #E4E6EB',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  body: {
    padding: '20px 24px 24px',
    overflowY: 'auto',
    flex: 1,
  },
  description: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Columns layout
  columnsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '200px',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    borderRadius: '8px 8px 0 0',
    borderBottom: '2px solid',
  },
  columnIcon: {
    fontSize: '14px',
    lineHeight: 1,
  },
  columnTitle: {
    fontSize: '14px',
    fontWeight: 600,
  },
  columnCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  columnBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '0 0 8px 8px',
    border: '1px solid #E4E6EB',
    borderTop: 'none',
    maxHeight: '350px',
    overflowY: 'auto',
  },

  // Empty state
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '80px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },

  // Dimension card
  dimensionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    borderLeft: '3px solid',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rankBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    flexShrink: 0,
  },
  dimensionName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  percentileText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  trendPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px',
    fontWeight: 500,
  },
  reasonText: {
    margin: 0,
    fontSize: '11px',
    color: '#7A869A',
    lineHeight: 1.4,
  },
};

export default PriorityModal;
