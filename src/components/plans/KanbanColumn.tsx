// KanbanColumn - Single column in the Kanban board with flat PlayCard list
// No hierarchy - just a simple list of draggable cards

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  PlanPlay,
  PlayStatus,
} from '../../types/improvementPlan';
import PlayCard from './PlayCard';

interface KanbanColumnProps {
  status: PlayStatus;
  plays: PlanPlay[];
  onPlayClick: (play: PlanPlay) => void;
  hasInProgress?: boolean;
}

const COLUMN_CONFIG: Record<PlayStatus, { title: string; color: string; bgColor: string }> = {
  'backlog': {
    title: 'Backlog',
    color: '#6B778C',
    bgColor: '#F4F5F7',
  },
  'do-next': {
    title: 'Do Next',
    color: '#5243AA',
    bgColor: '#EAE6FF',
  },
  'in-progress': {
    title: 'In Progress',
    color: '#0052CC',
    bgColor: '#DEEBFF',
  },
  'completed': {
    title: 'Done',
    color: '#006644',
    bgColor: '#E3FCEF',
  },
  'skipped': {
    title: 'Skipped',
    color: '#5E6C84',
    bgColor: '#F4F5F7',
  },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  plays,
  onPlayClick,
  hasInProgress = false,
}) => {
  const config = COLUMN_CONFIG[status];
  const isDoNext = status === 'do-next';

  return (
    <div style={styles.column}>
      {/* Column header */}
      <div style={styles.header}>
        <div
          style={{
            ...styles.statusIndicator,
            backgroundColor: config.color,
          }}
        />
        <span style={styles.title}>{config.title}</span>
        <span style={styles.count}>{plays.length}</span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.cardList,
              backgroundColor: snapshot.isDraggingOver ? config.bgColor : '#F7F8FA',
            }}
          >
            {plays.length === 0 && !snapshot.isDraggingOver ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>
                  {snapshot.isDraggingOver ? 'Drop here' : 'No plays'}
                </p>
              </div>
            ) : (
              plays.map((play, index) => {
                // Show indicator only for first item in Do Next
                const isFirstDoNext = isDoNext && index === 0;
                const indicatorType = hasInProgress ? 'do-next' : 'start-here';

                return (
                  <Draggable
                    key={play.id}
                    draggableId={play.id}
                    index={index}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          marginBottom: '8px',
                        }}
                      >
                        <PlayCard
                          play={play}
                          variant="compact"
                          onClick={() => onPlayClick(play)}
                          rank={play.priority}
                          isTopPriority={isFirstDoNext}
                          indicatorType={isFirstDoNext ? indicatorType : undefined}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  column: {
    flex: 1,
    minWidth: '300px',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    flex: 1,
  },
  count: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    padding: '2px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '10px',
  },
  cardList: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100px',
    overflow: 'auto',
    transition: 'background-color 0.2s ease',
  },
  emptyState: {
    padding: '24px 16px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default KanbanColumn;
