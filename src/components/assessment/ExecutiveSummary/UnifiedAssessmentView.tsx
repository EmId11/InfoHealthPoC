import React, { useState } from 'react';
import { ExecutiveSummaryData, ThemeSummary, DimensionSummary, RiskLevel, TrendDirection } from '../../../types/assessment';
import { getClusterDescription, getDimensionDescription } from '../../../constants/clusterDescriptions';
import { getMaturityLevelConfig } from '../../../types/maturity';
import ClusterMaturityBar from '../common/ClusterMaturityBar';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import InfoIcon from '@atlaskit/icon/glyph/info';
// Dimension icons
import WatchIcon from '@atlaskit/icon/glyph/watch';
import DocumentIcon from '@atlaskit/icon/glyph/document';
import RefreshIcon from '@atlaskit/icon/glyph/refresh';
import GraphBarIcon from '@atlaskit/icon/glyph/graph-bar';
import EditorLayoutThreeEqualIcon from '@atlaskit/icon/glyph/editor/layout-three-equal';
import LabelIcon from '@atlaskit/icon/glyph/label';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import LinkIcon from '@atlaskit/icon/glyph/link';
import SprintIcon from '@atlaskit/icon/glyph/sprint';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';
import BoardIcon from '@atlaskit/icon/glyph/board';
import ActivityIcon from '@atlaskit/icon/glyph/activity';

interface UnifiedAssessmentViewProps {
  data: ExecutiveSummaryData;
  onThemeClick: (themeId: string) => void;
  onDimensionClick: (dimensionKey: string) => void;
}

// Simple risk classification: needs attention vs on track
const needsAttention = (riskLevel: RiskLevel): boolean => {
  return riskLevel === 'high' || riskLevel === 'moderate';
};

// Calculate theme percentile from its dimensions
const calculateThemePercentile = (dimensions: DimensionSummary[]): number => {
  if (dimensions.length === 0) return 0;
  const sum = dimensions.reduce((acc, dim) => acc + dim.percentile, 0);
  return Math.round(sum / dimensions.length);
};

// Trend icon helper
const getTrendIcon = (trend: TrendDirection, size: 'small' | 'medium' = 'small') => {
  switch (trend) {
    case 'improving':
      return <ArrowUpIcon label="Improving" size={size} primaryColor="#006644" />;
    case 'declining':
      return <ArrowDownIcon label="Declining" size={size} primaryColor="#DE350B" />;
    default:
      return <MediaServicesActualSizeIcon label="Stable" size={size} primaryColor="#6B778C" />;
  }
};

// Dimension icons mapping
const getDimensionIcon = (dimensionKey: string, color: string) => {
  const iconProps = { label: '', size: 'small' as const, primaryColor: color };

  switch (dimensionKey) {
    case 'workCaptured':
      return <WatchIcon {...iconProps} />;
    case 'ticketReadiness':
      return <DocumentIcon {...iconProps} />;
    case 'dataFreshness':
      return <RefreshIcon {...iconProps} />;
    case 'estimationCoverage':
      return <GraphBarIcon {...iconProps} />;
    case 'sizingConsistency':
      return <EditorLayoutThreeEqualIcon {...iconProps} />;
    case 'issueTypeConsistency':
      return <LabelIcon {...iconProps} />;
    case 'blockerManagement':
      return <CrossCircleIcon {...iconProps} />;
    case 'workHierarchy':
      return <LinkIcon {...iconProps} />;
    case 'sprintHygiene':
      return <SprintIcon {...iconProps} />;
    case 'teamCollaboration':
      return <PeopleIcon {...iconProps} />;
    case 'automationOpportunities':
      return <SettingsIcon {...iconProps} />;
    // New dimensions (collaborationBreadth merged into teamCollaboration)
    case 'collaborationFeatureUsage':
      return <ActivityIcon {...iconProps} />;
    case 'configurationEfficiency':
      return <SettingsIcon {...iconProps} />;
    case 'backlogDiscipline':
      return <BoardIcon {...iconProps} />;
    default:
      return <QuestionCircleIcon {...iconProps} />;
  }
};

// Dimension context - pulled from centralized descriptions
const getDimensionContext = (dimensionKey: string): string => {
  const desc = getDimensionDescription(dimensionKey);
  return desc?.headline || '';
};

const UnifiedAssessmentView: React.FC<UnifiedAssessmentViewProps> = ({
  data,
  onThemeClick,
  onDimensionClick,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const [openInfoPopover, setOpenInfoPopover] = useState<string | null>(null);
  const [hoveredInfoButton, setHoveredInfoButton] = useState<string | null>(null);

  // Calculate risk counts (2 categories: needs attention vs on track)
  const allDimensions = data.themeSummaries.flatMap(t => t.dimensions);
  const needsAttentionCount = allDimensions.filter(d => needsAttention(d.riskLevel)).length;
  const onTrackCount = allDimensions.filter(d => !needsAttention(d.riskLevel)).length;

  return (
    <div style={styles.container}>
      {/* Summary Row */}
      <div style={styles.summaryRow}>
        {/* Risk Status Pills (2 categories) */}
        <div style={styles.riskPills}>
          {needsAttentionCount > 0 && (
            <span style={styles.pillAttention}>
              <WarningIcon label="" size="small" primaryColor="#DE350B" />
              {needsAttentionCount} need attention
            </span>
          )}
          {onTrackCount > 0 && (
            <span style={styles.pillOnTrack}>
              <CheckCircleIcon label="" size="small" primaryColor="#006644" />
              {onTrackCount} on track
            </span>
          )}
        </div>
      </div>

      {/* Theme Rows */}
      <div style={styles.themeList}>
        {data.themeSummaries.map((theme, themeIndex) => {
          const isHovered = hoveredRow === theme.themeId;
          const themePercentile = calculateThemePercentile(theme.dimensions);
          const maturityConfig = getMaturityLevelConfig(themePercentile);

          return (
            <div
              key={theme.themeId}
              style={{
                ...styles.themeRow,
                ...(isHovered ? styles.themeRowHovered : {}),
              }}
              onMouseEnter={() => setHoveredRow(theme.themeId)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Maturity accent bar */}
              <div style={{
                ...styles.maturityAccent,
                backgroundColor: maturityConfig.color,
              }} />
              {/* Theme Header - Groups are for visual organization only, not clickable */}
              <div style={styles.themeHeader}>
                <div style={styles.themeNumber}>
                  {themeIndex + 1}
                </div>
                <div style={styles.themeInfo}>
                  <div style={styles.themeNameRow}>
                    <h4 style={styles.themeName}>{theme.themeName}</h4>
                    {/* Info button with popover */}
                    <div style={{ position: 'relative' }}>
                      <button
                        style={{
                          ...styles.infoButton,
                          opacity: hoveredInfoButton === theme.themeId || openInfoPopover === theme.themeId ? 1 : 0.5,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenInfoPopover(openInfoPopover === theme.themeId ? null : theme.themeId);
                        }}
                        onMouseEnter={() => setHoveredInfoButton(theme.themeId)}
                        onMouseLeave={() => setHoveredInfoButton(null)}
                        title="Learn more about this cluster"
                      >
                        <InfoIcon label="Info" size="small" primaryColor={hoveredInfoButton === theme.themeId || openInfoPopover === theme.themeId ? '#0052CC' : '#6B778C'} />
                      </button>
                      {openInfoPopover === theme.themeId && (() => {
                        const clusterDesc = getClusterDescription(theme.themeId);
                        return (
                          <div style={styles.infoPopover}>
                            <button
                              style={styles.popoverClose}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenInfoPopover(null);
                              }}
                            >
                              ×
                            </button>
                            <div style={styles.popoverSection}>
                              <h5 style={styles.popoverLabel}>What we measure</h5>
                              <p style={styles.popoverText}>{clusterDesc?.whatWeMeasure || 'No description available.'}</p>
                            </div>
                            <div style={styles.popoverSection}>
                              <h5 style={styles.popoverLabel}>Why it matters</h5>
                              <p style={styles.popoverText}>{clusterDesc?.whyItMatters || ''}</p>
                            </div>
                            <div style={styles.popoverSection}>
                              <h5 style={styles.popoverLabel}>What you can do</h5>
                              <p style={styles.popoverText}>{clusterDesc?.whatYouCanDo || ''}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <p style={styles.themeQuestion}>{theme.themeQuestion}</p>
                </div>
                <div style={styles.maturityBarWrapper}>
                  <ClusterMaturityBar
                    percentile={calculateThemePercentile(theme.dimensions)}
                    clusterKey={theme.themeId}
                    dimensionNames={theme.dimensions.map(d => d.dimensionName)}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div style={styles.dimensionList}>
                {theme.dimensions.map((dim) => {
                  const isDimHovered = hoveredDim === dim.dimensionKey;
                  const context = getDimensionContext(dim.dimensionKey);

                  return (
                    <DimensionCard
                      key={dim.dimensionKey}
                      dim={dim}
                      context={context}
                      isHovered={isDimHovered}
                      onHover={setHoveredDim}
                      onClick={() => onDimensionClick(dim.dimensionKey)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Risk label config for Invisible Work prediction dimension
const getRiskLabelConfig = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case 'high':
      return {
        label: 'High Risk',
        bgColor: '#FFEBE6',
        borderColor: '#FFBDAD',
        textColor: '#BF2600',
      };
    case 'moderate':
      return {
        label: 'Moderate Risk',
        bgColor: '#FFF7E6',
        borderColor: '#FFE380',
        textColor: '#974F0C',
      };
    case 'low':
      return {
        label: 'Low Risk',
        bgColor: '#E3FCEF',
        borderColor: '#ABF5D1',
        textColor: '#006644',
      };
  }
};

// Separate component for dimension card with indicator stats
interface DimensionCardProps {
  dim: DimensionSummary;
  context: string;
  isHovered: boolean;
  onHover: (key: string | null) => void;
  onClick: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({
  dim,
  context,
  isHovered,
  onHover,
  onClick,
}) => {
  const dimNeedsAttention = needsAttention(dim.riskLevel);
  const iconColor = dimNeedsAttention ? '#DE350B' : '#006644';
  const bgColor = dimNeedsAttention ? '#FFFAFA' : '#F8FFF8';

  // Special handling for Invisible Work (prediction) dimension
  const isInvisibleWork = dim.dimensionKey === 'workCaptured';
  const riskLabelConfig = isInvisibleWork ? getRiskLabelConfig(dim.riskLevel) : null;

  // Risk level tooltip text
  const riskTooltip = dim.riskLevel === 'high'
    ? 'High risk: This dimension needs immediate attention'
    : dim.riskLevel === 'moderate'
    ? 'Moderate risk: This dimension could use some improvement'
    : 'Low risk: This dimension is performing well';

  return (
    <div
      style={{
        ...styles.dimensionCard,
        backgroundColor: bgColor,
        ...(isHovered ? styles.dimensionCardHovered : {}),
      }}
      onMouseEnter={() => onHover(dim.dimensionKey)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Dimension Icon */}
      <div style={{
        ...styles.dimensionIcon,
        backgroundColor: dimNeedsAttention ? '#FFEBE6' : '#E3FCEF',
      }}>
        {getDimensionIcon(dim.dimensionKey, iconColor)}
      </div>

      {/* Content */}
      <div style={styles.dimensionContent}>
        {/* Header: Name and risk label for prediction dimension */}
        <div style={styles.dimensionHeader}>
          <span style={styles.dimensionName}>{dim.dimensionName}</span>
          {riskLabelConfig && (
            <span
              title={riskTooltip}
              style={{
                ...styles.riskLabel,
                backgroundColor: riskLabelConfig.bgColor,
                border: `1px solid ${riskLabelConfig.borderColor}`,
                color: riskLabelConfig.textColor,
              }}
            >
              {riskLabelConfig.label}
            </span>
          )}
        </div>
        {context && (
          <span style={styles.dimensionContext}>{context}</span>
        )}

        {/* Indicator Stats and Trend */}
        <div style={styles.indicatorStats}>
          {/* Status breakdown */}
          <div style={styles.statGroup}>
            {dim.flaggedIndicators > 0 && (
              <span
                title={`${dim.flaggedIndicators} indicator${dim.flaggedIndicators > 1 ? 's' : ''} need attention`}
                style={styles.statBadgeRed}
              >
                <WarningIcon label="" size="small" primaryColor="#DE350B" />
                {dim.flaggedIndicators}
              </span>
            )}
            {dim.healthyIndicators > 0 && (
              <span
                title={`${dim.healthyIndicators} indicator${dim.healthyIndicators > 1 ? 's' : ''} on track`}
                style={styles.statBadgeGreen}
              >
                <CheckCircleIcon label="" size="small" primaryColor="#006644" />
                {dim.healthyIndicators}
              </span>
            )}
          </div>
          {/* Trend breakdown */}
          <div style={styles.trendGroup}>
            {dim.improvingIndicators > 0 && (
              <span
                title={`${dim.improvingIndicators} indicator${dim.improvingIndicators > 1 ? 's' : ''} improving`}
                style={styles.trendBadgeUp}
              >
                <ArrowUpIcon label="" size="small" primaryColor="#006644" />
                {dim.improvingIndicators}
              </span>
            )}
            {dim.decliningIndicators > 0 && (
              <span
                title={`${dim.decliningIndicators} indicator${dim.decliningIndicators > 1 ? 's' : ''} declining`}
                style={styles.trendBadgeDown}
              >
                <ArrowDownIcon label="" size="small" primaryColor="#DE350B" />
                {dim.decliningIndicators}
              </span>
            )}
            {dim.stableIndicators > 0 && (
              <span
                title={`${dim.stableIndicators} indicator${dim.stableIndicators > 1 ? 's' : ''} stable`}
                style={styles.trendBadgeStable}
              >
                <MediaServicesActualSizeIcon label="" size="small" primaryColor="#6B778C" />
                {dim.stableIndicators}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Summary Row
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  riskPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pillAttention: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: '#FFEBE6',
    color: '#BF2600',
    border: '1px solid #FFBDAD',
  },
  pillOnTrack: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: '#E3FCEF',
    color: '#006644',
    border: '1px solid #ABF5D1',
  },

  // Theme List
  themeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Theme Row
  themeRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    padding: '18px 20px',
    paddingLeft: '24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  maturityAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: '12px 0 0 12px',
  },
  themeRowHovered: {
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.1)',
  },

  // Theme Header
  themeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  themeNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    flexShrink: 0,
    fontSize: '18px',
    fontWeight: 700,
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
  },
  themeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  themeNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  themeName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  themeQuestion: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  maturityBarWrapper: {
    marginLeft: 'auto',
    flexShrink: 0,
  },
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.6,
    transition: 'opacity 0.15s ease',
  },
  infoPopover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 1000,
    width: '360px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    border: '1px solid #DFE1E6',
    marginTop: '8px',
  },
  popoverClose: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  popoverSection: {
    marginBottom: '14px',
  },
  popoverLabel: {
    margin: '0 0 4px 0',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#5E6C84',
  },
  popoverText: {
    margin: 0,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },

  // Dimension List
  dimensionList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '10px',
  },

  // Dimension Card
  dimensionCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dimensionCardHovered: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.12)',
  },

  // Dimension Icon
  dimensionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    flexShrink: 0,
  },

  // Dimension Content
  dimensionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: 0,
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  dimensionName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dimensionContext: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.3,
  },

  // Indicator Stats
  indicatorStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '4px',
  },
  statGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statBadgeRed: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#FFEBE6',
    color: '#BF2600',
    fontSize: '12px',
    fontWeight: 600,
  },
  statBadgeGreen: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '12px',
    fontWeight: 600,
  },
  trendGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  trendBadgeUp: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#006644',
  },
  trendBadgeDown: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#DE350B',
  },
  trendBadgeStable: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
  },

  // Risk label for prediction dimension (Invisible Work)
  riskLabel: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};

export default UnifiedAssessmentView;
