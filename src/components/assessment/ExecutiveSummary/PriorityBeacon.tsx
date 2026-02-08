import React, { useState, useMemo } from 'react';
import type { DimensionResult } from '../../../types/assessment';
import {
  prioritizeDimensions,
  getTopPriority,
  getPriorityCounts,
  PRIORITY_TIER_CONFIG,
  type PrioritizedDimensions,
} from '../../../utils/dimensionPrioritization';
import PriorityModal from './PriorityModal';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel';

interface PriorityBeaconProps {
  dimensions: DimensionResult[];
  onDimensionClick: (dimensionKey: string) => void;
}

/**
 * PriorityBeacon - Compact spotlight showing where to focus improvement efforts
 *
 * Shows the #1 priority dimension prominently, with chips for other urgent items
 * and a summary of priority tier counts. Expands to full view on click.
 */
const PriorityBeacon: React.FC<PriorityBeaconProps> = ({
  dimensions,
  onDimensionClick,
}) => {
  const [showModal, setShowModal] = useState(false);

  const prioritized = useMemo(
    () => prioritizeDimensions(dimensions),
    [dimensions]
  );

  const topPriority = getTopPriority(prioritized);
  const counts = getPriorityCounts(prioritized);
  const otherNowItems = prioritized.now.slice(1, 4); // Show 2nd, 3rd, 4th items as chips
  const remainingNowCount = Math.max(0, prioritized.now.length - 4);

  // Handle keyboard navigation for priority card
  const handleTopPriorityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (topPriority) {
        onDimensionClick(topPriority.dimension.dimensionKey);
      }
    }
  };

  // If no dimensions need attention, show a positive message
  if (counts.now === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <EditorPanelIcon label="" size="small" primaryColor="#6B778C" />
          <span style={styles.headerText}>Where to Focus</span>
        </div>

        <div style={styles.allGoodMessage}>
          <span style={styles.allGoodIcon}>
            {PRIORITY_TIER_CONFIG.later.icon}
          </span>
          <div style={styles.allGoodContent}>
            <span style={styles.allGoodTitle}>All dimensions on track!</span>
            <span style={styles.allGoodSubtitle}>
              {counts.next > 0
                ? `${counts.next} area${counts.next !== 1 ? 's' : ''} to keep an eye on`
                : `All ${counts.later} dimensions performing well`}
            </span>
          </div>
          <button
            style={styles.seeAllButton}
            onClick={() => setShowModal(true)}
          >
            See details
            <ChevronRightIcon label="" size="small" />
          </button>
        </div>

        <PriorityModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          prioritized={prioritized}
          onDimensionClick={onDimensionClick}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <EditorPanelIcon label="" size="small" primaryColor="#6B778C" />
        <span style={styles.headerText}>Where to Focus</span>
      </div>

      {/* Top Priority Card */}
      {topPriority && (
        <div
          style={styles.topPriorityCard}
          onClick={() => onDimensionClick(topPriority.dimension.dimensionKey)}
          onKeyDown={handleTopPriorityKeyDown}
          role="button"
          tabIndex={0}
        >
          <div style={styles.priorityBadge}>
            <span style={styles.priorityIcon}>{PRIORITY_TIER_CONFIG.now.icon}</span>
            <span style={styles.priorityLabel}>#1 Priority</span>
          </div>
          <div style={styles.priorityContent}>
            <span style={styles.priorityName}>
              {topPriority.dimension.dimensionName}
            </span>
            <span style={styles.priorityReason}>
              {topPriority.reason}
            </span>
          </div>
          <div style={styles.exploreArrow}>
            <ChevronRightIcon label="Explore" size="medium" primaryColor="#DE350B" />
          </div>
        </div>
      )}

      {/* Other Urgent Items as Chips */}
      {otherNowItems.length > 0 && (
        <div style={styles.chipsSection}>
          <span style={styles.chipsLabel}>Also needs attention:</span>
          <div style={styles.chipsRow}>
            {otherNowItems.map((item) => (
              <button
                key={item.dimension.dimensionKey}
                style={styles.chip}
                onClick={() => onDimensionClick(item.dimension.dimensionKey)}
                title={`${item.dimension.dimensionName}: ${item.reason}`}
              >
                <span style={styles.chipDot}>{PRIORITY_TIER_CONFIG.now.icon}</span>
                <span style={styles.chipText}>{item.dimension.dimensionName}</span>
              </button>
            ))}
            {remainingNowCount > 0 && (
              <button
                style={styles.moreChip}
                onClick={() => setShowModal(true)}
              >
                +{remainingNowCount} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div style={styles.footer}>
        <div style={styles.countGroup}>
          <TierCount
            count={counts.now}
            config={PRIORITY_TIER_CONFIG.now}
            label="focus now"
          />
          <span style={styles.countDivider}>•</span>
          <TierCount
            count={counts.next}
            config={PRIORITY_TIER_CONFIG.next}
            label="up next"
          />
          <span style={styles.countDivider}>•</span>
          <TierCount
            count={counts.later}
            config={PRIORITY_TIER_CONFIG.later}
            label="on track"
          />
        </div>
        <button
          style={styles.seeAllButton}
          onClick={() => setShowModal(true)}
        >
          See all priorities
          <ChevronRightIcon label="" size="small" />
        </button>
      </div>

      {/* Priority Modal */}
      <PriorityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        prioritized={prioritized}
        onDimensionClick={onDimensionClick}
      />
    </div>
  );
};

// Helper component for tier counts
interface TierCountProps {
  count: number;
  config: typeof PRIORITY_TIER_CONFIG[keyof typeof PRIORITY_TIER_CONFIG];
  label: string;
}

const TierCount: React.FC<TierCountProps> = ({ count, config, label }) => (
  <span style={{ ...styles.countItem, color: count > 0 ? config.color : '#6B778C' }}>
    <strong>{count}</strong> {label}
  </span>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  headerText: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6B778C',
  },

  // Top Priority Card
  topPriorityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: '#FFEBE6',
    borderRadius: '8px',
    borderLeft: '4px solid #DE350B',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    flexShrink: 0,
  },
  priorityIcon: {
    fontSize: '12px',
    lineHeight: 1,
  },
  priorityLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#DE350B',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  priorityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  priorityName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  priorityReason: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  exploreArrow: {
    flexShrink: 0,
  },

  // Chips Section
  chipsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  chipsLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  chipDot: {
    fontSize: '10px',
    lineHeight: 1,
  },
  chipText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  moreChip: {
    padding: '6px 12px',
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    borderRadius: '16px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },

  // Footer
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '1px solid #E4E6EB',
  },
  countGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countItem: {
    fontSize: '13px',
  },
  countDivider: {
    color: '#DFE1E6',
  },
  seeAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  // All Good State
  allGoodMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    borderLeft: '4px solid #36B37E',
  },
  allGoodIcon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  allGoodContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  allGoodTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#006644',
  },
  allGoodSubtitle: {
    fontSize: '13px',
    color: '#5E6C84',
  },
};

export default PriorityBeacon;
