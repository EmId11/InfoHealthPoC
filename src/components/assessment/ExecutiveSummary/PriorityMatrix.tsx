import React, { useState } from 'react';
import { PriorityZone, DimensionSummary, PriorityZoneType, RiskLevel } from '../../../types/assessment';
import { ZONE_TO_TAG, ActionPlanZoneTag, ActionPlanTag } from '../../../types/actionPlan';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import FlagFilledIcon from '@atlaskit/icon/glyph/flag-filled';
import ClockIcon from '@atlaskit/icon/glyph/recent';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import WatchIcon from '@atlaskit/icon/glyph/watch';
import GraphLineIcon from '@atlaskit/icon/glyph/graph-line';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import StarIcon from '@atlaskit/icon/glyph/star';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface PriorityMatrixProps {
  zones: PriorityZone[];
  onDimensionClick: (dimensionKey: string) => void;
  onNavigateToActionPlan: (tag: ActionPlanTag | ActionPlanZoneTag) => void;
}

// Urgency levels for simpler color coding
type UrgencyLevel = 'critical' | 'attention' | 'on-track';

const getUrgencyLevel = (zone: PriorityZoneType): UrgencyLevel => {
  if (['act-now', 'address'].includes(zone)) return 'critical';
  if (['act-soon', 'keep-pushing', 'heads-up'].includes(zone)) return 'attention';
  return 'on-track';
};

const URGENCY_COLORS: Record<UrgencyLevel, { primary: string; bg: string; text: string; chipBg: string }> = {
  critical: { primary: '#DE350B', bg: '#FFEBE6', text: '#BF2600', chipBg: '#FFEBE6' },
  attention: { primary: '#FF8B00', bg: '#FFF7E6', text: '#FF8B00', chipBg: '#FFF7E6' },
  'on-track': { primary: '#36B37E', bg: '#E3FCEF', text: '#006644', chipBg: '#E3FCEF' },
};

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'high': return '#DE350B';
    case 'moderate': return '#FF8B00';
    case 'low': return '#36B37E';
  }
};

// Zone icons
const getZoneIcon = (zone: PriorityZoneType, color: string) => {
  const iconProps = { label: '', size: 'medium' as const, primaryColor: color };
  switch (zone) {
    case 'act-now': return <WarningIcon {...iconProps} />;
    case 'address': return <FlagFilledIcon {...iconProps} />;
    case 'act-soon': return <ClockIcon {...iconProps} />;
    case 'keep-pushing': return <ArrowUpIcon {...iconProps} />;
    case 'heads-up': return <WatchIcon {...iconProps} />;
    case 'monitor': return <GraphLineIcon {...iconProps} />;
    case 'good-progress': return <ArrowUpIcon {...iconProps} />;
    case 'maintain': return <CheckCircleIcon {...iconProps} />;
    case 'celebrate': return <StarIcon {...iconProps} />;
  }
};

// Priority order - most urgent first
const PRIORITY_ORDER: PriorityZoneType[] = [
  'act-now',      // High risk + declining
  'address',      // High risk + stable
  'act-soon',     // Moderate risk + declining
  'keep-pushing', // High risk + improving
  'heads-up',     // Low risk + declining
  'monitor',      // Moderate risk + stable
  'good-progress',// Moderate risk + improving
  'maintain',     // Low risk + stable
  'celebrate',    // Low risk + improving
];

// Short criteria for each zone (shown inline)
const ZONE_CRITERIA: Record<PriorityZoneType, string> = {
  'act-now': 'High risk · Declining',
  'address': 'High risk · Stable',
  'act-soon': 'Moderate risk · Declining',
  'keep-pushing': 'High risk · Improving',
  'heads-up': 'Low risk · Declining',
  'monitor': 'Moderate risk · Stable',
  'good-progress': 'Moderate risk · Improving',
  'maintain': 'Low risk · Stable',
  'celebrate': 'Low risk · Improving',
};

// Full explanation for each zone (tooltip)
const ZONE_LOGIC: Record<PriorityZoneType, string> = {
  'act-now': 'Critical issues getting worse – address first',
  'address': 'Significant issues not improving – needs focused attention',
  'act-soon': 'Moderate issues worsening – prevent escalation',
  'keep-pushing': 'Your efforts are working – maintain focus',
  'heads-up': 'Healthy but declining – investigate early',
  'monitor': 'Stable but not ideal – address after priorities',
  'good-progress': 'Improving steadily – on track to become healthy',
  'maintain': 'Healthy and stable – continue current practices',
  'celebrate': 'Healthy and improving – share what\'s working',
};

interface ZoneRowProps {
  zone: PriorityZone;
  onDimensionClick: (dimensionKey: string) => void;
  onNavigateToActionPlan: (tag: ActionPlanTag | ActionPlanZoneTag) => void;
}

const ZoneRow: React.FC<ZoneRowProps> = ({ zone, onDimensionClick, onNavigateToActionPlan }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tag = ZONE_TO_TAG[zone.zone];
  const urgency = getUrgencyLevel(zone.zone);
  const colors = URGENCY_COLORS[urgency];

  const handleRowClick = () => {
    onNavigateToActionPlan(tag);
  };

  return (
    <div
      style={{
        ...styles.zoneRow,
        borderLeftColor: colors.primary,
        ...(isHovered ? styles.zoneRowHovered : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRowClick}
    >
      {/* Zone Icon */}
      <div style={styles.iconWrapper}>
        {getZoneIcon(zone.zone, colors.primary)}
      </div>

      {/* Zone Info */}
      <div style={styles.zoneInfo}>
        <div style={styles.zoneHeader}>
          <h4 style={{ ...styles.zoneName, color: colors.text }}>{zone.label}</h4>
          <span style={styles.zoneCriteria}>{ZONE_CRITERIA[zone.zone]}</span>
          <button
            style={styles.whyBtn}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            title={ZONE_LOGIC[zone.zone]}
          >
            <QuestionCircleIcon label="" size="small" primaryColor="#6B778C" />
          </button>
          {showTooltip && (
            <div style={styles.tooltip}>
              {ZONE_LOGIC[zone.zone]}
            </div>
          )}
        </div>

        {/* Dimensions - with colored backgrounds */}
        <div style={styles.dimensionList}>
          {zone.dimensions.map((dim: DimensionSummary) => (
            <button
              key={dim.dimensionKey}
              style={{
                ...styles.dimChip,
                backgroundColor: colors.chipBg,
                border: `1px solid ${colors.primary}40`,
                ...(hoveredDim === dim.dimensionKey ? {
                  ...styles.dimChipHovered,
                  border: `1px solid ${colors.primary}`,
                } : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDimensionClick(dim.dimensionKey);
              }}
              onMouseEnter={() => setHoveredDim(dim.dimensionKey)}
              onMouseLeave={() => setHoveredDim(null)}
              title={`View actions for ${dim.dimensionName}`}
            >
              <span style={{ ...styles.dimDot, backgroundColor: getRiskColor(dim.riskLevel) }} />
              <span style={styles.dimName}>{dim.dimensionName}</span>
              <ChevronRightIcon label="" size="small" primaryColor="#6B778C" />
            </button>
          ))}
        </div>
      </div>

      {/* View Actions Button */}
      <button
        style={{
          ...styles.viewActionsBtn,
          backgroundColor: isHovered ? colors.primary : 'transparent',
          color: isHovered ? '#FFFFFF' : colors.primary,
          border: `1px solid ${colors.primary}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNavigateToActionPlan(tag);
        }}
      >
        <span style={styles.viewActionsText}>View actions</span>
        <ChevronRightIcon label="" size="small" primaryColor={isHovered ? '#FFFFFF' : colors.primary} />
      </button>
    </div>
  );
};

const PriorityMatrix: React.FC<PriorityMatrixProps> = ({ zones, onDimensionClick, onNavigateToActionPlan }) => {
  const [showLegend, setShowLegend] = useState(false);

  // Sort zones by priority and filter out empty ones
  const sortedZones = PRIORITY_ORDER
    .map(type => zones.find(z => z.zone === type)!)
    .filter(z => z && z.dimensions.length > 0);

  // Get counts for specific zone types
  const actNowCount = zones.find(z => z.zone === 'act-now')?.dimensions.length || 0;
  const addressCount = zones.find(z => z.zone === 'address')?.dimensions.length || 0;
  const attentionCount = zones
    .filter(z => ['act-soon', 'keep-pushing', 'heads-up'].includes(z.zone))
    .reduce((sum, z) => sum + z.dimensions.length, 0);
  const onTrackCount = zones
    .filter(z => ['monitor', 'good-progress', 'maintain', 'celebrate'].includes(z.zone))
    .reduce((sum, z) => sum + z.dimensions.length, 0);

  if (sortedZones.length === 0) {
    return (
      <div style={styles.emptyState}>
        <CheckCircleIcon label="" size="xlarge" primaryColor="#36B37E" />
        <h4 style={styles.emptyTitle}>All Clear!</h4>
        <p style={styles.emptyText}>No dimensions need immediate attention. Keep up the good work!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Section Title */}
      <div style={styles.titleRow}>
        <h4 style={styles.sectionTitle}>Recommended Priorities</h4>
        <button
          style={styles.howItWorksBtn}
          onClick={() => setShowLegend(!showLegend)}
        >
          <QuestionCircleIcon label="" size="small" primaryColor="#6B778C" />
          <span>How we prioritize</span>
        </button>
      </div>

      {/* Summary Pills - separated by zone type */}
      <div style={styles.summaryPills}>
        {actNowCount > 0 && (
          <span style={{ ...styles.pill, ...styles.pillActNow }}>
            {actNowCount} act now
          </span>
        )}
        {addressCount > 0 && (
          <span style={{ ...styles.pill, ...styles.pillAddress }}>
            {addressCount} address
          </span>
        )}
        {attentionCount > 0 && (
          <span style={{ ...styles.pill, ...styles.pillAttention }}>
            {attentionCount} need attention
          </span>
        )}
        {onTrackCount > 0 && (
          <span style={{ ...styles.pill, ...styles.pillOnTrack }}>
            {onTrackCount} on track
          </span>
        )}
      </div>

      {/* Legend/Explanation Panel */}
      {showLegend && (
        <div style={styles.legendPanel}>
          <div style={styles.legendHeader}>
            <h4 style={styles.legendTitle}>Prioritization Logic</h4>
            <p style={styles.legendSubtitle}>
              Dimensions are prioritized based on their risk level and trend direction
            </p>
          </div>
          <div style={styles.legendGrid}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: URGENCY_COLORS.critical.primary }} />
              <div>
                <strong>Critical</strong>
                <span style={styles.legendDesc}> – High risk, declining or stable</span>
              </div>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: URGENCY_COLORS.attention.primary }} />
              <div>
                <strong>Needs Attention</strong>
                <span style={styles.legendDesc}> – Moderate/high risk with mixed trends</span>
              </div>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: URGENCY_COLORS['on-track'].primary }} />
              <div>
                <strong>On Track</strong>
                <span style={styles.legendDesc}> – Low/moderate risk, stable or improving</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority List */}
      <div style={styles.list}>
        {sortedZones.map((zone) => (
          <ZoneRow
            key={zone.zone}
            zone={zone}
            onDimensionClick={onDimensionClick}
            onNavigateToActionPlan={onNavigateToActionPlan}
          />
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Title Row
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  howItWorksBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Summary Pills
  summaryPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  pillActNow: {
    backgroundColor: '#FFEBE6',
    color: '#BF2600',
  },
  pillAddress: {
    backgroundColor: '#FFF5F5',
    color: '#DE350B',
  },
  pillAttention: {
    backgroundColor: URGENCY_COLORS.attention.bg,
    color: URGENCY_COLORS.attention.text,
  },
  pillOnTrack: {
    backgroundColor: URGENCY_COLORS['on-track'].bg,
    color: URGENCY_COLORS['on-track'].text,
  },

  // Legend Panel
  legendPanel: {
    padding: '16px',
    backgroundColor: '#F7F8F9',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
  },
  legendHeader: {
    marginBottom: '12px',
  },
  legendTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  legendSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
  },
  legendGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#172B4D',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendDesc: {
    color: '#6B778C',
    fontWeight: 400,
  },

  // List
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  // Zone Row - neutral background now
  zoneRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    borderLeft: '4px solid',
    border: '1px solid #E4E6EB',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  zoneRowHovered: {
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.12)',
    border: '1px solid #DFE1E6',
  },

  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },

  zoneInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
  },
  zoneHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    position: 'relative',
  },
  zoneName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
  },
  zoneCriteria: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  whyBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.6,
    transition: 'opacity 0.15s ease',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    padding: '8px 12px',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    fontSize: '12px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    zIndex: 10,
    maxWidth: '280px',
    lineHeight: 1.4,
  },

  dimensionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  // Dimension chips now have colored backgrounds
  dimChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dimChipHovered: {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.1)',
  },
  dimDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dimName: {
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  viewActionsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    marginTop: '2px',
  },
  viewActionsText: {
    // inherits color from parent
  },

  // Empty State
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    backgroundColor: '#E3FCEF',
    borderRadius: '12px',
    textAlign: 'center',
    gap: '12px',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#006644',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
};

export default PriorityMatrix;
