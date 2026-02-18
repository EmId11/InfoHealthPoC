import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useBuilderContext } from '../BuilderContext';
import { DIMENSION_EXPLANATIONS } from '../../../../types/actionPlanBuilder';
import DragHandlerIcon from '@atlaskit/icon/glyph/drag-handler';
import EditorInfoIcon from '@atlaskit/icon/glyph/editor/info';

const PrioritizeDimensionsStep: React.FC = () => {
  const { actions, computed } = useBuilderContext();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    actions.reorderDimensions(result.source.index, result.destination.index);
  };

  // Get trend icon
  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    const color = trend === 'improving' ? '#006644' : trend === 'declining' ? '#DE350B' : '#6B778C';
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {trend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
        {trend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
        {trend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
      </svg>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Rank your priorities</h3>
        <p style={styles.subtitle}>
          Drag and drop to reorder. The areas at the top will be your highest priority.
        </p>
      </div>

      {/* Tip Card */}
      <div style={styles.tipCard}>
        <EditorInfoIcon label="" size="small" primaryColor="#0052CC" />
        <div style={styles.tipContent}>
          <strong>Tip:</strong> Consider tackling areas with the worst health scores first,
          or focus on quick wins to build momentum.
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        <span style={styles.summaryText}>
          {computed.prioritizedDimensions.length} area{computed.prioritizedDimensions.length !== 1 ? 's' : ''} to prioritize
        </span>
        <span style={styles.summaryActions}>
          {computed.selectedActionCount} action{computed.selectedActionCount !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Draggable list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="prioritize-dimensions">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={styles.list}
            >
              {computed.prioritizedDimensions.map((dim, index) => {
                const explanation = DIMENSION_EXPLANATIONS[dim.dimensionKey] || {
                  title: dim.dimensionName,
                  whatItMeans: '',
                };

                return (
                  <Draggable
                    key={dim.dimensionKey}
                    draggableId={dim.dimensionKey}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...styles.priorityItem,
                          ...(snapshot.isDragging ? styles.priorityItemDragging : {}),
                          ...provided.draggableProps.style,
                        }}
                      >
                        {/* Drag handle */}
                        <div {...provided.dragHandleProps} style={styles.dragHandle}>
                          <DragHandlerIcon label="" size="medium" />
                        </div>

                        {/* Priority number */}
                        <div style={{
                          ...styles.priorityNumber,
                          backgroundColor: index < 3 ? '#0052CC' : '#F4F5F7',
                          color: index < 3 ? '#FFFFFF' : '#6B778C',
                        }}>
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div style={styles.itemContent}>
                          <div style={styles.itemHeader}>
                            <span style={styles.itemTitle}>{explanation.title}</span>
                            <div style={styles.itemBadges}>
                              {/* Trend indicator */}
                              <div style={styles.trendBadge}>
                                {getTrendIcon(dim.trend)}
                              </div>
                              {/* Health score */}
                              <div style={{
                                ...styles.healthBadge,
                                backgroundColor: dim.healthStatus === 'at-risk' ? '#FFEBE6' :
                                                 dim.healthStatus === 'needs-attention' ? '#FFFAE6' : '#E3FCEF',
                                color: dim.healthStatus === 'at-risk' ? '#DE350B' :
                                       dim.healthStatus === 'needs-attention' ? '#FF8B00' : '#006644',
                              }}>
                                {dim.healthScore}%
                              </div>
                            </div>
                          </div>
                          <div style={styles.itemMeta}>
                            <span>{dim.totalActions} action{dim.totalActions !== 1 ? 's' : ''}</span>
                            {dim.quickWinActions > 0 && (
                              <>
                                <span style={styles.metaDot}>•</span>
                                <span style={styles.quickWinText}>
                                  {dim.quickWinActions} quick win{dim.quickWinActions !== 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* What this affects */}
      <div style={styles.infoCard}>
        <h4 style={styles.infoTitle}>What does this affect?</h4>
        <p style={styles.infoText}>
          Your priority order determines how actions are organized in your plan.
          Actions from higher-priority areas appear first, making it easier to
          focus on what matters most.
        </p>
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

  // Summary Row
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  summaryText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  summaryActions: {
    fontSize: '13px',
    color: '#6B778C',
  },

  // List
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  priorityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    transition: 'all 0.15s ease',
  },
  priorityItemDragging: {
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    border: '1px solid #0052CC',
  },
  dragHandle: {
    cursor: 'grab',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
  },
  priorityNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '4px',
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  itemBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  trendBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stableTrend: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
  },
  healthBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6B778C',
  },
  metaDot: {
    color: '#DFE1E6',
  },
  quickWinText: {
    color: '#006644',
    fontWeight: 500,
  },

  // Info Card
  infoCard: {
    padding: '16px 20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginTop: '8px',
  },
  infoTitle: {
    margin: '0 0 8px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
};

export default PrioritizeDimensionsStep;
