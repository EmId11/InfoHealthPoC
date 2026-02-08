// BacklogColumn - Backlog panel with phase-based organization (like Cards view)
// Uses PHASE 1, PHASE 2, PHASE 3 grouping with dimension sub-groups

import React, { useState, useMemo } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  PlanPlay,
  PlayPriority,
} from '../../types/improvementPlan';
import { normalizePlanPlay } from '../../utils/improvementPlanUtils';
import PlayCard from './PlayCard';

/**
 * Priority phase definitions - matching Cards view
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
 * Dimension group within a priority phase
 */
interface DimensionGroup {
  dimensionKey: string;
  dimensionName: string;
  plays: PlanPlay[];
}

/**
 * Group plays by priority level
 */
const groupPlaysByPriorityLevel = (plays: PlanPlay[]): Map<PlayPriority, PlanPlay[]> => {
  const groups = new Map<PlayPriority, PlanPlay[]>();
  groups.set('high', []);
  groups.set('medium', []);
  groups.set('low', []);

  for (const play of plays) {
    const normalizedPlay = normalizePlanPlay(play);
    const group = groups.get(normalizedPlay.priorityLevel);
    if (group) {
      group.push(normalizedPlay);
    }
  }

  return groups;
};

/**
 * Group plays by dimension within a priority level
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

interface BacklogColumnProps {
  backlogPlays: PlanPlay[];
  onPlayClick: (play: PlanPlay) => void;
  onMoveToDoNext: (playId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Individual play item with hover state for move button
interface BacklogPlayItemProps {
  play: PlanPlay;
  index: number;
  onPlayClick: (play: PlanPlay) => void;
  onMoveToDoNext: (playId: string) => void;
}

const BacklogPlayItem: React.FC<BacklogPlayItemProps> = ({
  play,
  index,
  onPlayClick,
  onMoveToDoNext,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Draggable draggableId={play.id} index={index}>
      {(dragProvided) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          style={{
            ...dragProvided.draggableProps.style,
            marginBottom: '8px',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={styles.playCardWrapper}>
            <div style={{ flex: 1 }}>
              <PlayCard
                play={play}
                variant="compact"
                onClick={() => onPlayClick(play)}
                rank={play.priority}
              />
            </div>
            {/* Move to Do Next button */}
            <button
              style={{
                ...styles.moveButton,
                opacity: isHovered ? 1 : 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMoveToDoNext(play.id);
              }}
              title="Move to Do Next"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const BacklogColumn: React.FC<BacklogColumnProps> = ({
  backlogPlays,
  onPlayClick,
  onMoveToDoNext,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [collapsedPhases, setCollapsedPhases] = useState<Set<PlayPriority>>(new Set());
  const [collapsedDimensions, setCollapsedDimensions] = useState<Set<string>>(new Set());

  const totalPlays = backlogPlays.length;

  // Group plays by priority level
  const playsByPriority = useMemo(
    () => groupPlaysByPriorityLevel(backlogPlays),
    [backlogPlays]
  );

  const togglePhase = (priority: PlayPriority) => {
    setCollapsedPhases(prev => {
      const next = new Set(prev);
      if (next.has(priority)) {
        next.delete(priority);
      } else {
        next.add(priority);
      }
      return next;
    });
  };

  const toggleDimension = (key: string) => {
    setCollapsedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Collapsed view
  if (isCollapsed) {
    return (
      <div style={styles.collapsedContainer}>
        <button
          style={styles.expandButton}
          onClick={onToggleCollapse}
          title="Expand backlog"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={styles.collapsedContent}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <rect x="2" y="3" width="12" height="2" rx="1" fill="#6B778C" />
            <rect x="2" y="7" width="8" height="2" rx="1" fill="#6B778C" />
            <rect x="2" y="11" width="5" height="2" rx="1" fill="#6B778C" />
          </svg>
          <span style={styles.collapsedTitle}>Backlog</span>
          <span style={styles.collapsedCount}>{totalPlays}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          style={styles.collapseButton}
          onClick={onToggleCollapse}
          title="Collapse backlog"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L4 7L9 11" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={styles.headerTitle}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="3" width="14" height="2" rx="1" fill="#6B778C" />
            <rect x="2" y="8" width="10" height="2" rx="1" fill="#6B778C" />
            <rect x="2" y="13" width="6" height="2" rx="1" fill="#6B778C" />
          </svg>
          <span style={styles.title}>Backlog</span>
        </div>
        <span style={styles.count}>{totalPlays}</span>
      </div>

      {/* Scrollable content with phases */}
      <Droppable droppableId="backlog">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.content,
              backgroundColor: snapshot.isDraggingOver ? '#F4F5F7' : '#FFFFFF',
            }}
          >
            {totalPlays === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No plays in backlog</p>
                <p style={styles.emptySubtext}>
                  All plays have been scheduled or completed
                </p>
              </div>
            ) : (
              <div style={styles.phasesContainer}>
                {PRIORITY_PHASES.map(phase => {
                  const phasePlays = playsByPriority.get(phase.priority) || [];
                  if (phasePlays.length === 0) return null;

                  const isPhaseCollapsed = collapsedPhases.has(phase.priority);
                  const dimensionGroups = groupPlaysByDimension(phasePlays);

                  return (
                    <div key={phase.priority} style={styles.phaseSection}>
                      {/* Phase header - Atlassian style */}
                      <button
                        style={styles.phaseHeader}
                        onClick={() => togglePhase(phase.priority)}
                      >
                        <div style={styles.phaseHeaderLeft}>
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
                        </div>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          style={{
                            transform: isPhaseCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          <path d="M4 5L7 8L10 5" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {!isPhaseCollapsed && (
                        <>
                          <p style={styles.phaseSubtitle}>{phase.subtitle}</p>

                          {/* Dimension groups within this phase */}
                          <div style={styles.dimensionGroupsContainer}>
                            {dimensionGroups.map(dimGroup => {
                              const dimKey = `${phase.priority}-${dimGroup.dimensionKey}`;
                              const isDimCollapsed = collapsedDimensions.has(dimKey);

                              return (
                                <div key={dimGroup.dimensionKey} style={styles.dimensionGroup}>
                                  <button
                                    style={styles.dimensionHeader}
                                    onClick={() => toggleDimension(dimKey)}
                                  >
                                    <div style={styles.dimensionHeaderLeft}>
                                      <span style={styles.dimensionIcon}>📊</span>
                                      <span style={styles.dimensionName}>{dimGroup.dimensionName}</span>
                                    </div>
                                    <div style={styles.dimensionHeaderRight}>
                                      <span style={styles.dimensionCount}>{dimGroup.plays.length}</span>
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        style={{
                                          transform: isDimCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.2s ease',
                                        }}
                                      >
                                        <path d="M3 4L6 7L9 4" stroke="#97A0AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                  </button>

                                  {!isDimCollapsed && (
                                    <div style={styles.playsList}>
                                      {dimGroup.plays.map((play, index) => (
                                        <BacklogPlayItem
                                          key={play.id}
                                          play={play}
                                          index={index}
                                          onPlayClick={onPlayClick}
                                          onMoveToDoNext={onMoveToDoNext}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '380px',
    minWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
    transition: 'width 0.2s ease, min-width 0.2s ease',
  },
  collapsedContainer: {
    width: '48px',
    minWidth: '48px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
    transition: 'width 0.2s ease, min-width 0.2s ease',
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    borderBottom: '1px solid #EBECF0',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  collapsedContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 8px',
  },
  collapsedTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    writingMode: 'vertical-lr',
    transform: 'rotate(180deg)',
    letterSpacing: '1px',
  },
  collapsedCount: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: '#6B778C',
    padding: '4px 8px',
    borderRadius: '10px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    borderBottom: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  collapseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    whiteSpace: 'nowrap',
  },
  count: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
    padding: '2px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '10px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    transition: 'background-color 0.2s ease',
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
  },
  emptySubtext: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#97A0AF',
  },
  phasesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  phaseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  phaseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    backgroundColor: '#F7F8FA',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    width: '100%',
    textAlign: 'left',
  },
  phaseHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
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
    width: '40px',
    height: '3px',
    borderRadius: '2px',
  },
  phaseSubtitle: {
    margin: '0 0 8px',
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
    paddingLeft: '10px',
  },
  dimensionGroupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dimensionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
    padding: '12px',
    border: '1px solid #EBECF0',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 0 8px',
    borderBottom: '1px solid #DFE1E6',
    marginBottom: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  dimensionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dimensionHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dimensionIcon: {
    fontSize: '14px',
  },
  dimensionName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionCount: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
    backgroundColor: '#EBECF0',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  playsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  playCardWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
  },
  moveButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#5243AA',
    border: 'none',
    borderRadius: '4px',
    color: '#FFFFFF',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    zIndex: 10,
  },
};

export default BacklogColumn;
