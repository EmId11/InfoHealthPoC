// KanbanBoard - Kanban view for managing plays with Backlog
// Now supports dual view modes: Kanban (traditional) and Gallery (card-based)

import React, { useState, useCallback, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import {
  ImprovementPlan,
  PlanPlay,
  PlayStatus,
  PlayPriority,
  TaskStatus,
  groupPlaysByStatus,
} from '../../types/improvementPlan';
import { updatePlayStatus, normalizePlanPlay } from '../../utils/improvementPlanUtils';
import KanbanColumn from './KanbanColumn';
import BacklogColumn from './BacklogColumn';
import PlayDetailModal from './PlayDetailModal';
import PlayGalleryView from './PlayGalleryView';
import PlayFilters, { FilterState, ViewMode } from './PlayFilters';

interface KanbanBoardProps {
  plan: ImprovementPlan;
  onPlanUpdate: (plan: ImprovementPlan) => void;
  onAddTask: (playId: string, title: string) => void;
  onTaskStatusChange: (playId: string, taskId: string, status: TaskStatus) => void;
  onDeleteTask: (playId: string, taskId: string) => void;
  onNavigateToDimension?: (dimensionKey: string) => void;
}

// The Kanban columns (excluding backlog which is separate)
// Note: 'skipped' plays are tracked but not shown as a column - users skip via play menu
const KANBAN_COLUMNS: PlayStatus[] = ['do-next', 'in-progress', 'completed'];

// Priority order for sorting
const PRIORITY_ORDER: Record<PlayPriority, number> = {
  'high': 0,
  'medium': 1,
  'low': 2,
};

// Effort order for sorting
const EFFORT_ORDER: Record<string, number> = {
  'low': 0,
  'medium': 1,
  'high': 2,
};

/**
 * Smart sorting for plays
 */
const sortPlaysByPriority = (plays: PlanPlay[]): PlanPlay[] => {
  return [...plays].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priorityLevel] - PRIORITY_ORDER[b.priorityLevel];
    if (priorityDiff !== 0) return priorityDiff;
    const effortDiff = EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort];
    if (effortDiff !== 0) return effortDiff;
    return a.priority - b.priority;
  });
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  plan,
  onPlanUpdate,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
  onNavigateToDimension,
}) => {
  // Default to gallery view (new visual design)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedPlay, setSelectedPlay] = useState<PlanPlay | null>(null);
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    interventionType: [],
    outcome: [],
  });

  // Normalize all plays
  const normalizedPlays = useMemo(
    () => plan.plays.map(normalizePlanPlay),
    [plan.plays]
  );

  // Apply filters
  const filteredPlays = useMemo(() => {
    return normalizedPlays.filter(play => {
      if (filters.status.length > 0 && !filters.status.includes(play.status)) {
        return false;
      }
      if (filters.priority.length > 0 && !filters.priority.includes(play.priorityLevel)) {
        return false;
      }
      if (filters.interventionType.length > 0 && !filters.interventionType.includes(play.interventionType)) {
        return false;
      }
      if (filters.outcome.length > 0 && play.sourceOutcomeId && !filters.outcome.includes(play.sourceOutcomeId)) {
        return false;
      }
      return true;
    });
  }, [normalizedPlays, filters]);

  // Group filtered plays by status with sorting
  const playsByStatus = useMemo(() => ({
    backlog: sortPlaysByPriority(filteredPlays.filter(p => p.status === 'backlog')),
    doNext: sortPlaysByPriority(filteredPlays.filter(p => p.status === 'do-next')),
    inProgress: sortPlaysByPriority(filteredPlays.filter(p => p.status === 'in-progress')),
    completed: sortPlaysByPriority(filteredPlays.filter(p => p.status === 'completed')),
    skipped: sortPlaysByPriority(filteredPlays.filter(p => p.status === 'skipped')),
  }), [filteredPlays]);

  // Handle drag end
  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable
    if (!destination) return;

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Same column reordering
    if (source.droppableId === destination.droppableId) {
      // Get plays in this column
      const statusKey = source.droppableId as PlayStatus;
      const columnPlays = [...plan.plays].filter(p => p.status === statusKey);

      // Reorder within the column
      const [movedPlay] = columnPlays.splice(source.index, 1);
      columnPlays.splice(destination.index, 0, movedPlay);

      // Update priorities for all plays in this column
      const updatedPlays = plan.plays.map(play => {
        if (play.status !== statusKey) return play;
        const newIndex = columnPlays.findIndex(p => p.id === play.id);
        return { ...play, priority: newIndex + 1 };
      });

      const updatedPlan = { ...plan, plays: updatedPlays };
      onPlanUpdate(updatedPlan);
      return;
    }

    // Get the new status from the destination droppable ID
    const newStatus = destination.droppableId as PlayStatus;

    // Find the play being moved
    const movedPlay = plan.plays.find(p => p.id === draggableId);
    const previousStatus = movedPlay?.status;

    // Update the play status
    let updatedPlan = updatePlayStatus(plan, draggableId, newStatus);

    // Auto-promote logic: if moving FROM do-next, ensure we maintain MIN_DO_NEXT_COUNT
    const MIN_DO_NEXT_COUNT = 2;
    if (previousStatus === 'do-next' && newStatus !== 'do-next') {
      const doNextPlays = updatedPlan.plays.filter(p => p.status === 'do-next');
      const shortfall = MIN_DO_NEXT_COUNT - doNextPlays.length;

      if (shortfall > 0) {
        const backlogPlays = sortPlaysByPriority(
          updatedPlan.plays.filter(p => p.status === 'backlog').map(normalizePlanPlay)
        );
        const playsToPromote = backlogPlays.slice(0, shortfall);
        for (const playToPromote of playsToPromote) {
          updatedPlan = updatePlayStatus(updatedPlan, playToPromote.id, 'do-next');
        }
      }
    }

    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  // Handle play click - open detail modal
  const handlePlayClick = useCallback((play: PlanPlay) => {
    setSelectedPlay(play);
  }, []);

  // Handle play status change from modal
  const handlePlayStatusChange = useCallback((status: PlayStatus) => {
    if (!selectedPlay) return;

    const previousStatus = selectedPlay.status;
    let updatedPlan = updatePlayStatus(plan, selectedPlay.id, status);

    // Auto-promote logic: if moving FROM do-next, ensure we maintain MIN_DO_NEXT_COUNT
    const MIN_DO_NEXT_COUNT = 2;
    if (previousStatus === 'do-next' && status !== 'do-next') {
      const doNextPlays = updatedPlan.plays.filter(p => p.status === 'do-next');
      const shortfall = MIN_DO_NEXT_COUNT - doNextPlays.length;

      if (shortfall > 0) {
        const backlogPlays = sortPlaysByPriority(
          updatedPlan.plays.filter(p => p.status === 'backlog').map(normalizePlanPlay)
        );
        const playsToPromote = backlogPlays.slice(0, shortfall);
        for (const playToPromote of playsToPromote) {
          updatedPlan = updatePlayStatus(updatedPlan, playToPromote.id, 'do-next');
        }
      }
    }

    onPlanUpdate(updatedPlan);

    // Update the selected play reference
    const updatedPlay = updatedPlan.plays.find(p => p.id === selectedPlay.id);
    if (updatedPlay) {
      setSelectedPlay(normalizePlanPlay(updatedPlay));
    }
  }, [plan, selectedPlay, onPlanUpdate]);

  // Move play from backlog to do-next
  const handleMoveToDoNext = useCallback((playId: string) => {
    const updatedPlan = updatePlayStatus(plan, playId, 'do-next');
    onPlanUpdate(updatedPlan);
  }, [plan, onPlanUpdate]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedPlay(null);
  }, []);

  // Render gallery view when in gallery mode
  if (viewMode === 'gallery') {
    return (
      <PlayGalleryView
        plan={plan}
        onPlanUpdate={onPlanUpdate}
        onAddTask={onAddTask}
        onTaskStatusChange={onTaskStatusChange}
        onDeleteTask={onDeleteTask}
        onNavigateToDimension={onNavigateToDimension}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    );
  }

  // Check if there's any work in progress (for indicator type)
  const hasInProgress = playsByStatus.inProgress.length > 0;

  // Render traditional Kanban view
  return (
    <div style={styles.container}>
      {/* Filter Toolbar - same position as Cards view */}
      <PlayFilters
        plays={normalizedPlays}
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        defaultCollapsed={true}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={styles.layout}>
          {/* Backlog - left side with phase-based organization */}
          <BacklogColumn
            backlogPlays={playsByStatus.backlog}
            onPlayClick={handlePlayClick}
            onMoveToDoNext={handleMoveToDoNext}
            isCollapsed={isBacklogCollapsed}
            onToggleCollapse={() => setIsBacklogCollapsed(!isBacklogCollapsed)}
          />

          {/* Kanban columns - right side */}
          <div style={styles.kanbanSection}>
            <div style={styles.board}>
              {KANBAN_COLUMNS.map(status => {
                // Map PlayStatus to PlaysGroupedByStatus keys
                const getStatusKey = (s: PlayStatus): keyof typeof playsByStatus => {
                  switch (s) {
                    case 'do-next': return 'doNext';
                    case 'in-progress': return 'inProgress';
                    default: return s as keyof typeof playsByStatus;
                  }
                };
                const statusKey = getStatusKey(status);
                return (
                  <KanbanColumn
                    key={status}
                    status={status}
                    plays={playsByStatus[statusKey] || []}
                    onPlayClick={handlePlayClick}
                    hasInProgress={hasInProgress}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Play detail modal */}
      {selectedPlay && (
        <PlayDetailModal
          isOpen={true}
          play={selectedPlay}
          onClose={handleCloseModal}
          onStatusChange={handlePlayStatusChange}
          onAddTask={(title) => onAddTask(selectedPlay.id, title)}
          onTaskStatusChange={(taskId, status) => onTaskStatusChange(selectedPlay.id, taskId, status)}
          onDeleteTask={(taskId) => onDeleteTask(selectedPlay.id, taskId)}
          onNavigateToDimension={onNavigateToDimension}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  layout: {
    display: 'flex',
    gap: '24px',
    minHeight: '500px',
  },
  kanbanSection: {
    flex: 1,
    overflowX: 'auto',
  },
  board: {
    display: 'flex',
    gap: '16px',
    padding: '4px',
    minWidth: 'min-content',
  },
};

export default KanbanBoard;
