import React, { useState } from 'react';
import { useBuilderContext } from '../BuilderContext';
import { ActionSelection, DIMENSION_EXPLANATIONS } from '../../../../types/actionPlanBuilder';
import { ZONE_TAG_CONFIG } from '../../../../types/actionPlan';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import CheckboxIcon from '@atlaskit/icon/glyph/checkbox';
import EditorInfoIcon from '@atlaskit/icon/glyph/editor/info';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

const ChooseActionsStep: React.FC = () => {
  const { state, actions, computed } = useBuilderContext();

  // All selected dimensions expanded by default
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    () => new Set(state.dimensions.filter(d => d.isSelected).map(d => d.dimensionKey))
  );

  const toggleDimensionExpanded = (dimensionKey: string) => {
    setExpandedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dimensionKey)) {
        next.delete(dimensionKey);
      } else {
        next.add(dimensionKey);
      }
      return next;
    });
  };

  // Use prioritized dimensions for ordering
  const selectedDimensions = computed.prioritizedDimensions;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Review your actions</h3>
        <p style={styles.subtitle}>
          All actions for your selected areas are included by default.
          You can deselect any actions you don't want to include in your plan.
        </p>
      </div>

      {/* Success Card */}
      <div style={styles.successCard}>
        <CheckCircleIcon label="" size="small" primaryColor="#006644" />
        <div style={styles.successContent}>
          <strong>{computed.selectedActionCount} action{computed.selectedActionCount !== 1 ? 's' : ''}</strong> ready to add to your plan
          {computed.quickWinCount > 0 && (
            <span style={styles.quickWinHighlight}>
              {' '}including {computed.quickWinCount} quick win{computed.quickWinCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tip Card */}
      <div style={styles.tipCard}>
        <EditorInfoIcon label="" size="small" primaryColor="#0052CC" />
        <div style={styles.tipContent}>
          <strong>Tip:</strong> Focus on quality over quantity. It's better to complete a few actions
          well than to overwhelm your team with too many changes at once.
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statsLeft}>
          <span style={styles.statNumber}>{computed.selectedActionCount}</span>
          <span style={styles.statLabel}>
            of {computed.availableActionCount} actions selected
          </span>
        </div>
        <div style={styles.statsRight}>
          <div style={styles.badge}>
            <span style={styles.badgeLabel}>Effort</span>
            <span style={{
              ...styles.badgeValue,
              color: computed.effortSummary === 'low' ? '#36B37E' :
                     computed.effortSummary === 'medium' ? '#FFAB00' : '#DE350B'
            }}>
              {computed.effortSummary}
            </span>
          </div>
          <div style={styles.badge}>
            <span style={styles.badgeLabel}>Impact</span>
            <span style={{
              ...styles.badgeValue,
              color: computed.impactSummary === 'high' ? '#36B37E' :
                     computed.impactSummary === 'medium' ? '#FFAB00' : '#DE350B'
            }}>
              {computed.impactSummary}
            </span>
          </div>
        </div>
      </div>

      {/* Action Sections by Dimension */}
      <div style={styles.dimensionSections}>
        {selectedDimensions.map(dimension => {
          const dimensionActions = computed.actionsByDimension.get(dimension.dimensionKey) || [];
          if (dimensionActions.length === 0) return null;

          const isExpanded = expandedDimensions.has(dimension.dimensionKey);
          const selectedInDimension = dimensionActions.filter(a => a.selected).length;
          const quickWinsInDimension = dimensionActions.filter(
            a => a.recommendation.effort === 'low' && a.recommendation.impact === 'high'
          ).length;

          const explanation = DIMENSION_EXPLANATIONS[dimension.dimensionKey] || {
            title: dimension.dimensionName,
          };

          return (
            <div key={dimension.dimensionKey} style={styles.dimensionSection}>
              {/* Dimension Header */}
              <div
                style={styles.dimensionSectionHeader}
                onClick={() => toggleDimensionExpanded(dimension.dimensionKey)}
              >
                <div style={styles.dimensionHeaderLeft}>
                  {isExpanded ? (
                    <ChevronDownIcon label="" size="medium" />
                  ) : (
                    <ChevronRightIcon label="" size="medium" />
                  )}
                  <div style={styles.dimensionHeaderInfo}>
                    <span style={styles.dimensionHeaderName}>{explanation.title}</span>
                    <span style={styles.dimensionHeaderScore}>
                      Health: {dimension.healthScore}%
                    </span>
                  </div>
                </div>
                <div style={styles.dimensionHeaderRight}>
                  <span style={{
                    ...styles.dimensionSelectedCount,
                    color: selectedInDimension === dimensionActions.length ? '#006644' : '#6B778C',
                  }}>
                    {selectedInDimension}/{dimensionActions.length} selected
                  </span>
                  <div style={styles.dimensionHeaderActions}>
                    <button
                      style={styles.dimensionActionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedInDimension === dimensionActions.length) {
                          actions.deselectAllInDimension(dimension.dimensionKey);
                        } else {
                          actions.selectAllInDimension(dimension.dimensionKey);
                        }
                      }}
                    >
                      {selectedInDimension === dimensionActions.length ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dimension Actions */}
              {isExpanded && (
                <div style={styles.actionsContainer}>
                  {dimensionActions.map(action => (
                    <ActionCard
                      key={action.recommendationId}
                      action={action}
                      onToggle={() => actions.toggleSelection(action.recommendationId)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {computed.selectedActionCount === 0 && (
        <div style={styles.warningBox}>
          <WarningIcon label="" size="small" primaryColor="#FF8B00" />
          <span>Select at least one action to continue</span>
        </div>
      )}
    </div>
  );
};

// Action Card Component
interface ActionCardProps {
  action: ActionSelection;
  onToggle: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onToggle }) => {
  const isQuickWin = action.recommendation.effort === 'low' && action.recommendation.impact === 'high';
  const zoneConfig = ZONE_TAG_CONFIG[action.zoneTag];

  // Effort and impact labels with explanations
  const effortLabel = {
    low: 'Low effort',
    medium: 'Medium effort',
    high: 'High effort',
  }[action.recommendation.effort];

  const impactLabel = {
    low: 'Low impact',
    medium: 'Medium impact',
    high: 'High impact',
  }[action.recommendation.impact];

  return (
    <div
      style={{
        ...styles.actionCard,
        border: action.selected ? '2px solid #0052CC' : '2px solid #E4E6EB',
        backgroundColor: action.selected ? '#F4F7FF' : '#FFFFFF',
      }}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div style={styles.actionCheckbox}>
        {action.selected ? (
          <CheckboxIcon label="" primaryColor="#0052CC" />
        ) : (
          <div style={styles.emptyCheckbox} />
        )}
      </div>

      {/* Content */}
      <div style={styles.actionContent}>
        {/* Title Row */}
        <div style={styles.actionTitleRow}>
          <span style={styles.actionTitle}>{action.recommendation.title}</span>
          <div style={styles.actionBadges}>
            {isQuickWin && (
              <span style={styles.quickWinBadge}>Quick Win</span>
            )}
            <span style={{
              ...styles.zoneBadge,
              backgroundColor: zoneConfig.bgColor,
              color: zoneConfig.color,
            }}>
              {zoneConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={styles.actionDescription}>{action.recommendation.description}</p>

        {/* Meta Info */}
        <div style={styles.actionMeta}>
          <span style={{
            ...styles.metaEffort,
            color: action.recommendation.effort === 'low' ? '#006644' :
                   action.recommendation.effort === 'high' ? '#DE350B' : '#5E6C84',
          }}>
            {effortLabel}
          </span>
          <span style={styles.metaDot}>•</span>
          <span style={{
            ...styles.metaImpact,
            color: action.recommendation.impact === 'high' ? '#006644' :
                   action.recommendation.impact === 'low' ? '#DE350B' : '#5E6C84',
          }}>
            {impactLabel}
          </span>
        </div>
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

  // Header
  header: {
    textAlign: 'center',
    paddingBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '12px 0 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },

  // Success Card
  successCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  successContent: {
    fontSize: '14px',
    color: '#006644',
  },
  quickWinHighlight: {
    color: '#00875A',
  },

  // Tip Card
  tipCard: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    alignItems: 'center',
  },
  tipContent: {
    fontSize: '14px',
    color: '#172B4D',
  },

  // Stats Bar
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  statsLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0052CC',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B778C',
  },
  statsRight: {
    display: 'flex',
    gap: '12px',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '6px 14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  badgeLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  badgeValue: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },

  // Dimension Sections
  dimensionSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dimensionSection: {
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  dimensionSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    backgroundColor: '#FAFBFC',
    cursor: 'pointer',
  },
  dimensionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  dimensionHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dimensionHeaderName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionHeaderScore: {
    fontSize: '12px',
    color: '#6B778C',
  },
  dimensionHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  dimensionSelectedCount: {
    fontSize: '13px',
    fontWeight: 500,
  },
  dimensionHeaderActions: {
    display: 'flex',
    gap: '8px',
  },
  dimensionActionButton: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: '#0052CC',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 500,
  },

  // Actions Container
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
  },

  // Action Card
  actionCard: {
    display: 'flex',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionCheckbox: {
    flexShrink: 0,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '2px',
  },
  emptyCheckbox: {
    width: '16px',
    height: '16px',
    borderRadius: '3px',
    border: '2px solid #DFE1E6',
  },
  actionContent: {
    flex: 1,
    minWidth: 0,
  },
  actionTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '6px',
  },
  actionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  actionBadges: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  quickWinBadge: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  zoneBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  actionDescription: {
    margin: '0 0 10px',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  actionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  metaDot: {
    color: '#DFE1E6',
  },
  metaEffort: {
    fontWeight: 500,
  },
  metaImpact: {
    fontWeight: 500,
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

export default ChooseActionsStep;
