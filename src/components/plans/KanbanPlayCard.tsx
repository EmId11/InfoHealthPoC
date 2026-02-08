// KanbanPlayCard - Compact card for Kanban board display
// Shows priority + intervention type badges, dimension and outcome info

import React from 'react';
import {
  PlanPlay,
  getTaskProgress,
  getPriorityShortLabel,
  getPriorityColor,
  getInterventionTypeLabel,
  getInterventionTypeColor,
} from '../../types/improvementPlan';
import { getInterventionTypeIcon, normalizePlanPlay } from '../../utils/improvementPlanUtils';
import { OUTCOME_DEFINITIONS } from '../../constants/outcomeDefinitions';

interface KanbanPlayCardProps {
  play: PlanPlay;
  onClick: () => void;
  isDragging?: boolean;
}

const KanbanPlayCard: React.FC<KanbanPlayCardProps> = ({
  play: rawPlay,
  onClick,
  isDragging = false,
}) => {
  // Normalize play to ensure new fields exist
  const play = normalizePlanPlay(rawPlay);
  const taskProgress = getTaskProgress(play.tasks);

  // Get outcome name from the play's sourceOutcomeId
  const getOutcomeName = (): string => {
    if (play.sourceOutcomeName) {
      return play.sourceOutcomeName;
    }
    if (play.sourceOutcomeId) {
      const outcome = OUTCOME_DEFINITIONS.find(o => o.id === play.sourceOutcomeId);
      if (outcome) return outcome.name;
    }
    // Fallback: try to find outcome by dimension key
    const outcomeByDim = OUTCOME_DEFINITIONS.find(o =>
      o.dimensions.some(d => d.dimensionKey === play.sourceDimensionKey)
    );
    return outcomeByDim?.name || '';
  };

  const outcomeName = getOutcomeName();
  const priorityColor = getPriorityColor(play.priorityLevel);
  const typeColor = getInterventionTypeColor(play.interventionType);

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: isDragging
          ? '0 8px 16px rgba(9, 30, 66, 0.25)'
          : '0 1px 3px rgba(9, 30, 66, 0.12)',
        transform: isDragging ? 'rotate(3deg)' : 'none',
      }}
      onClick={onClick}
    >
      {/* Dual badges row */}
      <div style={styles.badgeRow}>
        {/* Priority badge */}
        <span
          style={{
            ...styles.badge,
            backgroundColor: priorityColor.bg,
            color: priorityColor.text,
          }}
        >
          {getPriorityShortLabel(play.priorityLevel)}
        </span>

        {/* Intervention type badge */}
        <span
          style={{
            ...styles.badge,
            backgroundColor: typeColor.bg,
            color: typeColor.text,
          }}
        >
          {getInterventionTypeIcon(play.interventionType)} {getInterventionTypeLabel(play.interventionType)}
        </span>
      </div>

      {/* Title */}
      <h4 style={styles.title}>{play.title}</h4>

      {/* Task progress */}
      {play.tasks.length > 0 && (
        <div style={styles.taskProgress}>
          <div style={styles.taskProgressBar}>
            <div
              style={{
                ...styles.taskProgressFill,
                width: `${taskProgress.percentage}%`,
              }}
            />
          </div>
          <span style={styles.taskProgressText}>
            {taskProgress.completed}/{taskProgress.total} tasks
          </span>
        </div>
      )}

      {/* Source info: Dimension + Outcome */}
      <div style={styles.sourceSection}>
        {/* Dimension - primary */}
        <div style={styles.sourceRow}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#0052CC" strokeWidth="1.5" />
          </svg>
          <span style={styles.dimensionName}>{play.sourceDimensionName}</span>
        </div>

        {/* Outcome - secondary */}
        {outcomeName && (
          <div style={styles.sourceRow}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#5243AA" strokeWidth="1.5" fill="none" />
              <circle cx="7" cy="7" r="3" stroke="#5243AA" strokeWidth="1.5" fill="none" />
              <circle cx="7" cy="7" r="1" fill="#5243AA" />
            </svg>
            <span style={styles.outcomeName}>{outcomeName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
    border: '1px solid #EBECF0',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    fontWeight: 600,
  },
  title: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  taskProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  taskProgressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#EBECF0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  taskProgressText: {
    fontSize: '10px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  sourceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '6px',
    borderTop: '1px solid #F4F5F7',
  },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dimensionName: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#0052CC',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  outcomeName: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#5243AA',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default KanbanPlayCard;
