// PlayGalleryView - Main container for card gallery view
// Displays plays in a visual card layout organized by status sections
// Supports drag and drop between sections

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  ImprovementPlan,
  PlanPlay,
  PlayStatus,
  PlayPriority,
  TaskStatus,
  getPlayStatusLabel,
  getPlayStatusColor,
  PlaysGroupedByStatus,
} from '../../types/improvementPlan';
import { normalizePlanPlay } from '../../utils/improvementPlanUtils';
import PlayCard from './PlayCard';
import PlayFilters, { FilterState, ViewMode } from './PlayFilters';
import PlayDetailModal from './PlayDetailModal';
import { updatePlayStatus } from '../../utils/improvementPlanUtils';

// Priority order for sorting (lower = higher priority)
const PRIORITY_ORDER: Record<PlayPriority, number> = {
  'high': 0,
  'medium': 1,
  'low': 2,
};

// Effort order for sorting (lower = easier/do first)
const EFFORT_ORDER: Record<string, number> = {
  'low': 0,
  'medium': 1,
  'high': 2,
};

/**
 * Smart sorting for plays - prioritizes by:
 * 1. Priority level (high > medium > low)
 * 2. Effort level (low effort first - quick wins)
 * 3. Original priority number as tiebreaker
 */
const sortPlaysByPriority = (plays: PlanPlay[]): PlanPlay[] => {
  return [...plays].sort((a, b) => {
    // First by priority level
    const priorityDiff = PRIORITY_ORDER[a.priorityLevel] - PRIORITY_ORDER[b.priorityLevel];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by effort (lower effort first)
    const effortDiff = EFFORT_ORDER[a.effort] - EFFORT_ORDER[b.effort];
    if (effortDiff !== 0) return effortDiff;

    // Finally by original priority number
    return a.priority - b.priority;
  });
};

/**
 * Group plays by status with smart priority sorting
 */
const groupPlaysByStatusSorted = (plays: PlanPlay[]): PlaysGroupedByStatus => {
  return {
    backlog: sortPlaysByPriority(plays.filter(p => p.status === 'backlog')),
    doNext: sortPlaysByPriority(plays.filter(p => p.status === 'do-next')),
    inProgress: sortPlaysByPriority(plays.filter(p => p.status === 'in-progress')),
    completed: sortPlaysByPriority(plays.filter(p => p.status === 'completed')),
    skipped: sortPlaysByPriority(plays.filter(p => p.status === 'skipped')),
  };
};

/**
 * Priority phase definitions - like Atlassian's STEP 1, STEP 2, etc.
 */
interface PriorityPhase {
  priority: PlayPriority;
  label: string;
  subtitle: string;
  color: string;
}

const PRIORITY_PHASES: PriorityPhase[] = [
  {
    priority: 'high',
    label: 'PHASE 1',
    subtitle: 'Quick Wins - High impact, start here',
    color: '#DE350B',
  },
  {
    priority: 'medium',
    label: 'PHASE 2',
    subtitle: 'Core Improvements - Solid impact plays',
    color: '#FF8B00',
  },
  {
    priority: 'low',
    label: 'PHASE 3',
    subtitle: 'Long Term - Lower priority, tackle later',
    color: '#36B37E',
  },
];

/**
 * Group plays by priority level within a status
 */
const groupPlaysByPriorityLevel = (plays: PlanPlay[]): Map<PlayPriority, PlanPlay[]> => {
  const groups = new Map<PlayPriority, PlanPlay[]>();
  groups.set('high', []);
  groups.set('medium', []);
  groups.set('low', []);

  for (const play of plays) {
    const group = groups.get(play.priorityLevel);
    if (group) {
      group.push(play);
    }
  }

  return groups;
};

/**
 * Dimension group within a priority phase
 */
interface DimensionGroup {
  dimensionKey: string;
  dimensionName: string;
  plays: PlanPlay[];
}

/**
 * Group plays by dimension within a priority level
 * Returns plays organized by dimension for better visual grouping
 */
const groupPlaysByDimension = (plays: PlanPlay[]): DimensionGroup[] => {
  const dimensionMap = new Map<string, DimensionGroup>();

  for (const play of plays) {
    const key = play.sourceDimensionKey;
    if (!dimensionMap.has(key)) {
      dimensionMap.set(key, {
        dimensionKey: key,
        dimensionName: play.sourceDimensionName,
        plays: [],
      });
    }
    dimensionMap.get(key)!.plays.push(play);
  }

  // Sort dimension groups by number of plays (most plays first)
  return Array.from(dimensionMap.values()).sort((a, b) => b.plays.length - a.plays.length);
};

interface PlayGalleryViewProps {
  plan: ImprovementPlan;
  onPlanUpdate: (plan: ImprovementPlan) => void;
  onAddTask: (playId: string, title: string) => void;
  onTaskStatusChange: (playId: string, taskId: string, status: TaskStatus) => void;
  onDeleteTask: (playId: string, taskId: string) => void;
  onNavigateToDimension?: (dimensionKey: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// Order for status sections in gallery view
const STATUS_ORDER: PlayStatus[] = ['do-next', 'in-progress', 'backlog', 'completed'];

const PlayGalleryView: React.FC<PlayGalleryViewProps> = ({
  plan,
  onPlanUpdate,
  onAddTask,
  onTaskStatusChange,
  onDeleteTask,
  onNavigateToDimension,
  viewMode,
  onViewModeChange,
}) => {
  const [selectedPlay, setSelectedPlay] = useState<PlanPlay | null>(null);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
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
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(play.status)) {
        return false;
      }
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(play.priorityLevel)) {
        return false;
      }
      // Intervention type filter
      if (filters.interventionType.length > 0 && !filters.interventionType.includes(play.interventionType)) {
        return false;
      }
      // Outcome filter
      if (filters.outcome.length > 0 && play.sourceOutcomeId && !filters.outcome.includes(play.sourceOutcomeId)) {
        return false;
      }
      return true;
    });
  }, [normalizedPlays, filters]);

  // Group filtered plays by status with smart priority sorting
  const playsByStatus = useMemo(
    () => groupPlaysByStatusSorted(filteredPlays),
    [filteredPlays]
  );

  // Minimum number of plays to keep in "Do Next" queue
  const MIN_DO_NEXT_COUNT = 2;

  // Auto-promote plays from backlog to "Do Next" on initial load to ensure minimum count
  useEffect(() => {
    const doNextPlays = plan.plays.filter(p => p.status === 'do-next');
    const backlogPlays = plan.plays.filter(p => p.status === 'backlog');
    const shortfall = MIN_DO_NEXT_COUNT - doNextPlays.length;

    if (shortfall > 0 && backlogPlays.length > 0) {
      // Get backlog plays sorted by priority
      const sortedBacklog = sortPlaysByPriority(backlogPlays.map(normalizePlanPlay));
      const playsToPromote = sortedBacklog.slice(0, Math.min(shortfall, sortedBacklog.length));

      if (playsToPromote.length > 0) {
        let updatedPlan = plan;
        for (const playToPromote of playsToPromote) {
          updatedPlan = updatePlayStatus(updatedPlan, playToPromote.id, 'do-next');
        }
        onPlanUpdate(updatedPlan);
      }
    }
  }, []); // Only run once on mount

  // Handle play click
  const handlePlayClick = useCallback((play: PlanPlay) => {
    setSelectedPlay(play);
  }, []);

  // Handle play status change from modal with auto-promote logic
  const handlePlayStatusChange = useCallback((status: PlayStatus) => {
    if (!selectedPlay) return;

    let updatedPlan = updatePlayStatus(plan, selectedPlay.id, status);

    // Auto-promote: If a play moves out of "do-next", ensure we maintain MIN_DO_NEXT_COUNT plays
    const previousStatus = selectedPlay.status;
    if (previousStatus === 'do-next' && status !== 'do-next') {
      // Count current "do-next" plays after the move
      const doNextPlays = updatedPlan.plays.filter(p => p.status === 'do-next');
      const shortfall = MIN_DO_NEXT_COUNT - doNextPlays.length;

      if (shortfall > 0) {
        // Get backlog plays sorted by priority (high > medium > low, then by effort)
        const backlogPlays = sortPlaysByPriority(
          updatedPlan.plays.filter(p => p.status === 'backlog').map(normalizePlanPlay)
        );

        // Promote top N plays from backlog to do-next
        const playsToPromote = backlogPlays.slice(0, shortfall);
        for (const playToPromote of playsToPromote) {
          updatedPlan = updatePlayStatus(updatedPlan, playToPromote.id, 'do-next');
        }
      }
    }

    onPlanUpdate(updatedPlan);

    // Update selected play reference
    const updatedPlay = updatedPlan.plays.find(p => p.id === selectedPlay.id);
    if (updatedPlay) {
      setSelectedPlay(normalizePlanPlay(updatedPlay));
    }
  }, [plan, selectedPlay, onPlanUpdate]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedPlay(null);
  }, []);

  // Get status key for playsByStatus
  const getStatusKey = (status: PlayStatus): keyof typeof playsByStatus => {
    switch (status) {
      case 'do-next': return 'doNext';
      case 'in-progress': return 'inProgress';
      default: return status as keyof typeof playsByStatus;
    }
  };

  // Check if there's any work in progress
  const hasInProgress = playsByStatus.inProgress.length > 0;

  // Handle drag and drop between sections
  const handleDragEnd = useCallback((result: DropResult) => {
    const { draggableId, destination } = result;

    // Dropped outside a valid area
    if (!destination) return;

    // Get the new status from the droppable ID
    const newStatus = destination.droppableId as PlayStatus;

    // Find the play being dragged
    const play = plan.plays.find(p => p.id === draggableId);
    if (!play || play.status === newStatus) return;

    // Update the play's status
    let updatedPlan = updatePlayStatus(plan, draggableId, newStatus);

    // Auto-promote logic: if moving FROM do-next, ensure we maintain MIN_DO_NEXT_COUNT
    if (play.status === 'do-next' && newStatus !== 'do-next') {
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

  // Render a section of plays
  const renderSection = (status: PlayStatus) => {
    const statusKey = getStatusKey(status);
    const plays = playsByStatus[statusKey] || [];
    const statusLabel = getPlayStatusLabel(status);
    const statusColors = getPlayStatusColor(status);
    const isCompleted = status === 'completed';
    const isBacklog = status === 'backlog';
    const isDoNext = status === 'do-next';

    // Always show Do Next, In Progress, and Backlog for drag/drop support
    // Only hide empty Completed and Skipped sections
    const alwaysShowStatuses: PlayStatus[] = ['do-next', 'in-progress', 'backlog'];
    if (plays.length === 0 && !alwaysShowStatuses.includes(status) && filters.status.length === 0) {
      return null;
    }

    // Handle collapsed completed section
    if (isCompleted && plays.length > 0 && !isCompletedExpanded && filters.status.length === 0) {
      return (
        <div key={status} style={styles.section}>
          <button
            style={styles.collapsedSection}
            onClick={() => setIsCompletedExpanded(true)}
          >
            <div style={styles.collapsedHeader}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: statusColors.border,
                }}
              />
              <span style={styles.collapsedTitle}>
                {statusLabel.toUpperCase()} ({plays.length})
              </span>
            </div>
            <span style={styles.collapsedHint}>
              {plays.length} plays completed - click to expand
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#6B778C">
              <path d="M8 10.5L3 5.5L4 4.5L8 8.5L12 4.5L13 5.5L8 10.5Z" />
            </svg>
          </button>
        </div>
      );
    }

    // Section descriptions to help users understand prioritization
    const getSectionDescription = (s: PlayStatus): string | null => {
      switch (s) {
        case 'do-next':
          return 'Queued up and ready to start. Work through these in order.';
        case 'backlog':
          return 'Future plays organized by priority phase and dimension. Move to "Do Next" when ready.';
        case 'in-progress':
          return 'Currently being worked on by your team.';
        default:
          return null;
      }
    };

    const description = getSectionDescription(status);

    // Only show phases in Backlog
    const shouldShowPhases = isBacklog && plays.length > 0;

    // Group plays by priority level for phased display
    const playsByPriority = groupPlaysByPriorityLevel(plays);

    return (
      <div key={status} style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitleColumn}>
            <div style={styles.sectionTitleRow}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: statusColors.border,
                }}
              />
              <h3 style={styles.sectionTitle}>
                {statusLabel.toUpperCase()} ({plays.length})
              </h3>
            </div>
            {description && plays.length > 0 && (
              <p style={styles.sectionDescription}>{description}</p>
            )}
          </div>
          {isCompleted && isCompletedExpanded && (
            <button
              style={styles.collapseButton}
              onClick={() => setIsCompletedExpanded(false)}
            >
              Collapse
            </button>
          )}
        </div>

        {plays.length > 0 ? (
          shouldShowPhases ? (
            // Render Backlog plays grouped by priority phases, then by dimension
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    ...styles.phasesContainer,
                    backgroundColor: snapshot.isDraggingOver ? '#F4F5F7' : 'transparent',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {PRIORITY_PHASES.map(phase => {
                    const phasePlays = playsByPriority.get(phase.priority) || [];
                    if (phasePlays.length === 0) return null;

                    // Group plays within this phase by dimension
                    const dimensionGroups = groupPlaysByDimension(phasePlays);

                    return (
                      <div key={phase.priority} style={styles.phaseSection}>
                        {/* Phase header - Atlassian style */}
                        <div style={styles.phaseHeader}>
                          <div style={styles.phaseLabelRow}>
                            <span style={styles.phaseLabel}>{phase.label}</span>
                            <span style={styles.phaseCount}>({phasePlays.length} plays)</span>
                          </div>
                          <div
                            style={{
                              ...styles.phaseUnderline,
                              backgroundColor: phase.color,
                            }}
                          />
                          <p style={styles.phaseSubtitle}>{phase.subtitle}</p>
                        </div>

                        {/* Dimension groups within this phase */}
                        <div style={styles.dimensionGroupsContainer}>
                          {dimensionGroups.map(dimGroup => (
                            <div key={dimGroup.dimensionKey} style={styles.dimensionGroup}>
                              <div style={styles.dimensionHeader}>
                                <div style={styles.dimensionHeaderLeft}>
                                  <div style={styles.dimensionIcon}>📊</div>
                                  <span style={styles.dimensionName}>{dimGroup.dimensionName}</span>
                                </div>
                                <span style={styles.dimensionCount}>{dimGroup.plays.length} plays</span>
                              </div>
                              <div style={styles.cardGrid}>
                                {dimGroup.plays.map((play, index) => (
                                  <Draggable key={play.id} draggableId={play.id} index={index}>
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        style={{
                                          ...dragProvided.draggableProps.style,
                                          opacity: dragSnapshot.isDragging ? 0.8 : 1,
                                        }}
                                      >
                                        <PlayCard
                                          play={play}
                                          onClick={() => handlePlayClick(play)}
                                          rank={play.priority}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            // Simple grid for Do Next, In Progress, and Completed with drag/drop
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    ...styles.cardGrid,
                    backgroundColor: snapshot.isDraggingOver ? '#F4F5F7' : 'transparent',
                    borderRadius: '8px',
                    padding: snapshot.isDraggingOver ? '8px' : '0',
                    transition: 'all 0.2s ease',
                    minHeight: '100px',
                  }}
                >
                  {plays.map((play, index) => {
                    // Show "Do this next" indicator only for first item in Do Next
                    const isFirstDoNext = isDoNext && index === 0;
                    const showIndicator = isFirstDoNext;
                    const indicatorType = hasInProgress ? 'do-next' : 'start-here';

                    return (
                      <Draggable key={play.id} draggableId={play.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: dragSnapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <PlayCard
                              play={play}
                              onClick={() => handlePlayClick(play)}
                              rank={play.priority}
                              isTopPriority={showIndicator}
                              indicatorType={showIndicator ? indicatorType : undefined}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )
        ) : (
          // Empty droppable section
          <Droppable droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  ...styles.emptySection,
                  backgroundColor: snapshot.isDraggingOver ? '#E3FCEF' : '#FAFBFC',
                  borderColor: snapshot.isDraggingOver ? '#36B37E' : '#DFE1E6',
                }}
              >
                {snapshot.isDraggingOver ? 'Drop here' : 'No plays in this status'}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Filter Toolbar - now at the top */}
      <PlayFilters
        plays={normalizedPlays}
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        defaultCollapsed={true}
      />

      {/* Main Content - uses full width */}
      <div style={styles.mainContent}>
        {/* Status Sections with Drag and Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={styles.sections}>
            {STATUS_ORDER.map(status => renderSection(status))}
          </div>
        </DragDropContext>

        {/* Empty state when all filtered out */}
        {filteredPlays.length === 0 && normalizedPlays.length > 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No plays match your filters</h3>
            <p style={styles.emptyText}>
              Try adjusting your filters to see more plays.
            </p>
            <button
              style={styles.clearFiltersButton}
              onClick={() => setFilters({
                status: [],
                priority: [],
                interventionType: [],
                outcome: [],
              })}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

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
  mainContent: {
    width: '100%',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitleColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#8993A4',
    paddingLeft: '20px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  collapseButton: {
    padding: '4px 8px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  phasesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  phaseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  phaseHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  phaseLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  phaseLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#172B4D',
    letterSpacing: '0.5px',
  },
  phaseCount: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  phaseUnderline: {
    width: '48px',
    height: '4px',
    borderRadius: '2px',
  },
  phaseSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  dimensionGroupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  dimensionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #EBECF0',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid #DFE1E6',
    marginBottom: '4px',
  },
  dimensionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dimensionIcon: {
    fontSize: '18px',
  },
  dimensionName: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionCount: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
    backgroundColor: '#EBECF0',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  emptySection: {
    padding: '24px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px dashed #DFE1E6',
  },
  collapsedSection: {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  collapsedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  collapsedTitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  collapsedHint: {
    fontSize: '13px',
    color: '#8993A4',
    flex: 1,
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px dashed #DFE1E6',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#6B778C',
    textAlign: 'center',
  },
  clearFiltersButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default PlayGalleryView;
