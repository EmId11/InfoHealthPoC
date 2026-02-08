import React from 'react';
import { useBuilderContext } from '../BuilderContext';
import { SelectableDimension } from '../../../../types/actionPlanBuilder';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import EditorInfoIcon from '@atlaskit/icon/glyph/editor/info';
import LightbulbIcon from '@atlaskit/icon/glyph/lightbulb';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';

const SelectAreasStep: React.FC = () => {
  const { state, actions, computed } = useBuilderContext();

  // Group dimensions by health status for better organization
  const atRiskDimensions = state.dimensions.filter(d => d.healthStatus === 'at-risk');
  const needsAttentionDimensions = state.dimensions.filter(d => d.healthStatus === 'needs-attention');
  const onTrackDimensions = state.dimensions.filter(d => d.healthStatus === 'on-track');

  return (
    <div style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.welcomeSection}>
        <h3 style={styles.welcomeTitle}>What would you like to improve?</h3>
        <p style={styles.welcomeSubtitle}>
          Select the areas you want to focus on. We'll show you specific actions
          you can take to improve each one.
        </p>
      </div>

      {/* Explanation Card */}
      <div style={styles.explainerCard}>
        <EditorInfoIcon label="" size="medium" primaryColor="#0052CC" />
        <div style={styles.explainerContent}>
          <strong>How this works:</strong>
          <p style={styles.explainerText}>
            Each area below represents a specific aspect of your Jira health.
            Areas that need improvement are pre-selected. When you select an area,
            all relevant actions will be added to your plan automatically.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <span style={styles.quickActionsLabel}>
          {computed.selectedDimensionCount} of {state.dimensions.length} areas selected
          {computed.selectedActionCount > 0 && (
            <span style={styles.actionPreview}>
              {' '}• {computed.selectedActionCount} action{computed.selectedActionCount !== 1 ? 's' : ''} will be added
            </span>
          )}
        </span>
        <div style={styles.quickActionsButtons}>
          <button
            style={styles.quickActionButton}
            onClick={actions.selectAllRecommended}
          >
            Select recommended
          </button>
          <button
            style={styles.quickActionButton}
            onClick={actions.deselectAll}
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Dimensions by Health Status */}
      <div style={styles.dimensionSections}>
        {/* At Risk Section */}
        {atRiskDimensions.length > 0 && (
          <div style={styles.dimensionSection}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionBadge, backgroundColor: '#FFEBE6', color: '#DE350B' }}>
                <WarningIcon label="" size="small" primaryColor="#DE350B" />
                Needs Improvement
              </div>
              <span style={styles.sectionCount}>
                {atRiskDimensions.length} area{atRiskDimensions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={styles.dimensionsGrid}>
              {atRiskDimensions.map((dim) => (
                <DimensionCard
                  key={dim.dimensionKey}
                  dimension={dim}
                  onToggle={() => actions.toggleDimension(dim.dimensionKey)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention Section */}
        {needsAttentionDimensions.length > 0 && (
          <div style={styles.dimensionSection}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionBadge, backgroundColor: '#FFFAE6', color: '#FF8B00' }}>
                <WarningIcon label="" size="small" primaryColor="#FF8B00" />
                Could Be Better
              </div>
              <span style={styles.sectionCount}>
                {needsAttentionDimensions.length} area{needsAttentionDimensions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={styles.dimensionsGrid}>
              {needsAttentionDimensions.map((dim) => (
                <DimensionCard
                  key={dim.dimensionKey}
                  dimension={dim}
                  onToggle={() => actions.toggleDimension(dim.dimensionKey)}
                />
              ))}
            </div>
          </div>
        )}

        {/* On Track Section */}
        {onTrackDimensions.length > 0 && (
          <div style={styles.dimensionSection}>
            <div style={styles.sectionHeader}>
              <div style={{ ...styles.sectionBadge, backgroundColor: '#E3FCEF', color: '#006644' }}>
                <CheckCircleIcon label="" size="small" primaryColor="#006644" />
                Looking Good
              </div>
              <span style={styles.sectionCount}>
                {onTrackDimensions.length} area{onTrackDimensions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p style={styles.onTrackHint}>
              These areas are healthy, but you can still select them if you want to make further improvements.
            </p>
            <div style={styles.dimensionsGrid}>
              {onTrackDimensions.map((dim) => (
                <DimensionCard
                  key={dim.dimensionKey}
                  dimension={dim}
                  onToggle={() => actions.toggleDimension(dim.dimensionKey)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State Warning */}
      {computed.selectedDimensionCount === 0 && (
        <div style={styles.warningBox}>
          <WarningIcon label="" size="small" primaryColor="#FF8B00" />
          <span>Select at least one area to continue</span>
        </div>
      )}
    </div>
  );
};

// Dimension Card Component
interface DimensionCardProps {
  dimension: SelectableDimension;
  onToggle: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ dimension, onToggle }) => {
  const getHealthColor = () => {
    switch (dimension.healthStatus) {
      case 'at-risk': return '#DE350B';
      case 'needs-attention': return '#FF8B00';
      case 'on-track': return '#006644';
    }
  };

  const getTrendIcon = () => {
    switch (dimension.trend) {
      case 'improving':
        return <ArrowUpIcon label="Improving" size="small" primaryColor="#006644" />;
      case 'declining':
        return <ArrowDownIcon label="Declining" size="small" primaryColor="#DE350B" />;
      default:
        return <span style={styles.stableTrend}>—</span>;
    }
  };

  return (
    <div
      style={{
        ...styles.dimensionCard,
        border: dimension.isSelected ? '2px solid #0052CC' : '2px solid #E4E6EB',
        backgroundColor: dimension.isSelected ? '#F4F7FF' : '#FFFFFF',
      }}
      onClick={onToggle}
    >
      {/* Selection Checkbox */}
      <div style={styles.checkboxArea}>
        <div style={{
          ...styles.checkbox,
          backgroundColor: dimension.isSelected ? '#0052CC' : 'transparent',
          border: dimension.isSelected ? '2px solid #0052CC' : '2px solid #DFE1E6',
        }}>
          {dimension.isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.dimensionContent}>
        {/* Header Row */}
        <div style={styles.dimensionHeader}>
          <h4 style={styles.dimensionTitle}>{dimension.explanation.title}</h4>
          <div style={styles.healthScoreRow}>
            <div style={styles.trendIcon}>{getTrendIcon()}</div>
            <span style={{ ...styles.scoreValue, color: getHealthColor() }}>
              {dimension.healthScore}%
            </span>
          </div>
        </div>

        {/* What It Means */}
        <p style={styles.whatItMeans}>{dimension.explanation.whatItMeans}</p>

        {/* Why It Matters */}
        <div style={styles.whySection}>
          <LightbulbIcon label="" size="small" primaryColor="#6B778C" />
          <span style={styles.whyText}>{dimension.explanation.whyItMatters}</span>
        </div>

        {/* Impact Warning - only show for non-healthy dimensions */}
        {dimension.healthStatus !== 'on-track' && (
          <div style={styles.impactSection}>
            <WarningIcon label="" size="small" primaryColor="#FF8B00" />
            <span style={styles.impactText}>{dimension.explanation.impact}</span>
          </div>
        )}

        {/* Stats Row */}
        <div style={styles.dimensionStats}>
          <span style={styles.statItem}>
            {dimension.totalActions} action{dimension.totalActions !== 1 ? 's' : ''} available
          </span>
          {dimension.quickWinActions > 0 && (
            <>
              <span style={styles.statDot}>•</span>
              <span style={styles.statItemGreen}>
                {dimension.quickWinActions} quick win{dimension.quickWinActions !== 1 ? 's' : ''}
              </span>
            </>
          )}
          {dimension.flaggedIndicators > 0 && (
            <>
              <span style={styles.statDot}>•</span>
              <span style={styles.statItemRed}>
                {dimension.flaggedIndicators} indicator{dimension.flaggedIndicators !== 1 ? 's' : ''} flagged
              </span>
            </>
          )}
        </div>

        {/* Recommended Badge */}
        {dimension.isRecommended && !dimension.isSelected && (
          <div style={styles.recommendedBadge}>
            Recommended
          </div>
        )}
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

  // Welcome Section
  welcomeSection: {
    textAlign: 'center',
    paddingBottom: '8px',
  },
  welcomeTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 600,
    color: '#172B4D',
  },
  welcomeSubtitle: {
    margin: '12px 0 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.5,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // Explainer Card
  explainerCard: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    alignItems: 'flex-start',
  },
  explainerContent: {
    flex: 1,
  },
  explainerText: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },

  // Quick Actions
  quickActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  quickActionsLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  actionPreview: {
    fontWeight: 400,
    color: '#0052CC',
  },
  quickActionsButtons: {
    display: 'flex',
    gap: '12px',
  },
  quickActionButton: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    color: '#0052CC',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 500,
  },

  // Dimension Sections
  dimensionSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  dimensionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
  },
  sectionCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  onTrackHint: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
  },

  // Dimensions Grid
  dimensionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  // Dimension Card
  dimensionCard: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  checkboxArea: {
    paddingTop: '2px',
  },
  checkbox: {
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  dimensionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  dimensionTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 600,
    color: '#172B4D',
  },
  healthScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  trendIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stableTrend: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
  },
  scoreValue: {
    fontSize: '15px',
    fontWeight: 700,
  },
  whatItMeans: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  whySection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
  },
  whyText: {
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  impactSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
  },
  impactText: {
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  dimensionStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6B778C',
    marginTop: '4px',
  },
  statItem: {},
  statDot: {
    color: '#DFE1E6',
  },
  statItemGreen: {
    color: '#006644',
    fontWeight: 500,
  },
  statItemRed: {
    color: '#DE350B',
    fontWeight: 500,
  },
  recommendedBadge: {
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '4px 10px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginTop: '4px',
  },

  // Warning Box
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#FFFAE6',
    borderRadius: '8px',
    color: '#FF8B00',
    fontSize: '14px',
    fontWeight: 500,
  },
};

export default SelectAreasStep;
