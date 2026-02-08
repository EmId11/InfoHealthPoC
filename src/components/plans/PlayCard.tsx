// PlayCard - Visual card for gallery view
// Displays play with icon, title, description, badges, impact path, and progress

import React from 'react';
import {
  PlanPlay,
  PlayStatus,
  getTaskProgress,
  getPriorityShortLabel,
  getPriorityColor,
  getInterventionTypeLabel,
  getInterventionTypeColor,
  getPlayStatusColor,
} from '../../types/improvementPlan';
import { normalizePlanPlay, getInterventionTypeIcon } from '../../utils/improvementPlanUtils';
import { OUTCOME_DEFINITIONS } from '../../constants/outcomeDefinitions';

// Play taglines from PlayDetailModal content
const PLAY_TAGLINES: Record<string, string> = {
  'sprint-planning': 'Stop the chaos. Start sprints with clarity and confidence.',
  'backlog-refinement': 'Stop refinement from being a waste of everyone\'s time.',
  'retrospective': 'Stop generating action items that nobody does.',
  'jira-hygiene': 'Because a 500-item backlog isn\'t a backlog, it\'s a graveyard.',
};

const getPlayTagline = (playId: string, playTitle: string): string => {
  // Try exact match
  if (PLAY_TAGLINES[playId]) {
    return PLAY_TAGLINES[playId];
  }

  // Try matching by keywords
  const title = (playTitle || '').toLowerCase();
  const id = (playId || '').toLowerCase();
  const combined = `${title} ${id}`;

  if (combined.includes('sprint') && combined.includes('plan')) {
    return PLAY_TAGLINES['sprint-planning'];
  }
  if (combined.includes('backlog') || combined.includes('refine') || combined.includes('groom')) {
    return PLAY_TAGLINES['backlog-refinement'];
  }
  if (combined.includes('retro')) {
    return PLAY_TAGLINES['retrospective'];
  }
  if (combined.includes('jira') || combined.includes('hygiene') || combined.includes('cleanup')) {
    return PLAY_TAGLINES['jira-hygiene'];
  }

  // Default tagline based on intervention type
  return 'A structured approach to improving your team\'s process.';
};

type IndicatorType = 'start-here' | 'do-next';

interface PlayCardProps {
  play: PlanPlay;
  variant?: 'default' | 'compact';
  onClick: () => void;
  /** Rank number to display (1 = highest priority) */
  rank?: number;
  /** Show indicator banner for top priority item */
  isTopPriority?: boolean;
  /** Type of indicator: 'start-here' (no work in progress) or 'do-next' (has work in progress) */
  indicatorType?: IndicatorType;
}

const PlayCard: React.FC<PlayCardProps> = ({
  play: rawPlay,
  variant = 'default',
  onClick,
  rank,
  isTopPriority = false,
  indicatorType = 'start-here',
}) => {
  const play = normalizePlanPlay(rawPlay);
  const taskProgress = getTaskProgress(play.tasks);
  const statusColors = getPlayStatusColor(play.status);
  const priorityColors = getPriorityColor(play.priorityLevel);
  const typeColors = getInterventionTypeColor(play.interventionType);

  // Get outcome name
  const getOutcomeName = (): string => {
    if (play.sourceOutcomeName) return play.sourceOutcomeName;
    if (play.sourceOutcomeId) {
      const outcome = OUTCOME_DEFINITIONS.find(o => o.id === play.sourceOutcomeId);
      if (outcome) return outcome.name;
    }
    const outcomeByDim = OUTCOME_DEFINITIONS.find(o =>
      o.dimensions.some(d => d.dimensionKey === play.sourceDimensionKey)
    );
    return outcomeByDim?.name || '';
  };

  const outcomeName = getOutcomeName();
  const tagline = getPlayTagline(play.playId, play.title);

  // Status-based border color
  const getStatusBorderColor = (status: PlayStatus): string => {
    switch (status) {
      case 'do-next': return COLORS.statusDoNext;
      case 'in-progress': return COLORS.statusInProgress;
      case 'completed': return COLORS.statusCompleted;
      case 'backlog':
      default: return COLORS.statusBacklog;
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: getStatusBorderColor(play.status),
        ...(isCompact ? styles.cardCompact : {}),
        ...(isTopPriority ? styles.cardTopPriority : {}),
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = COLORS.cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isTopPriority
          ? '0 2px 8px rgba(82, 67, 170, 0.2)'
          : '0 1px 3px rgba(9, 30, 66, 0.12)';
      }}
    >
      {/* Priority indicator banner */}
      {isTopPriority && (
        <div style={styles.startHereBanner}>
          <span style={styles.startHereIcon}>{indicatorType === 'do-next' ? '⏭️' : '👉'}</span>
          <span style={styles.startHereText}>
            {indicatorType === 'do-next' ? 'Do this next' : 'Start here'}
          </span>
        </div>
      )}

      {/* Header with icon and title */}
      <div style={styles.header}>
        {/* Rank badge */}
        {rank !== undefined && (
          <div style={{
            ...styles.rankBadge,
            ...(isTopPriority ? styles.rankBadgeTop : {}),
          }}>
            {rank}
          </div>
        )}
        <div
          style={{
            ...styles.icon,
            backgroundColor: typeColors.bg,
          }}
        >
          <span style={{ fontSize: isCompact ? '16px' : '20px' }}>
            {getInterventionTypeIcon(play.interventionType)}
          </span>
        </div>
        <div style={styles.headerText}>
          <h4 style={{
            ...styles.title,
            ...(isCompact ? styles.titleCompact : {}),
          }}>
            {play.title}
          </h4>
        </div>
      </div>

      {/* Description/Tagline */}
      {!isCompact && (
        <p style={styles.description}>{tagline}</p>
      )}

      {/* Badges row */}
      <div style={styles.badgeRow}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: typeColors.bg,
            color: typeColors.text,
          }}
        >
          {getInterventionTypeLabel(play.interventionType)}
        </span>
        <span
          style={{
            ...styles.badge,
            backgroundColor: priorityColors.bg,
            color: priorityColors.text,
          }}
        >
          {getPriorityShortLabel(play.priorityLevel)} Priority
        </span>
      </div>

      {/* Impact path - Dimension → Outcome */}
      {outcomeName && (
        <div style={styles.impactPath}>
          <span style={styles.impactText}>
            {play.sourceDimensionName} → {outcomeName}
          </span>
        </div>
      )}

      {/* Task progress bar */}
      {play.tasks.length > 0 && (
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${taskProgress.percentage}%`,
              }}
            />
          </div>
          <span style={styles.progressText}>
            {taskProgress.completed}/{taskProgress.total} tasks
          </span>
        </div>
      )}
    </div>
  );
};

// Design tokens
const COLORS = {
  cardBorder: '#E4E6EB',
  cardHoverShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
  statusDoNext: '#5243AA',
  statusInProgress: '#0052CC',
  statusCompleted: '#00875A',
  statusBacklog: '#6B778C',
  priorityHigh: '#DE350B',
  priorityMedium: '#FF8B00',
  priorityLow: '#36B37E',
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: `1px solid ${COLORS.cardBorder}`,
    borderLeft: '4px solid',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.12)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    position: 'relative',
  },
  cardCompact: {
    padding: '12px',
    gap: '8px',
  },
  cardTopPriority: {
    borderColor: '#5243AA',
    boxShadow: '0 2px 8px rgba(82, 67, 170, 0.2)',
    paddingTop: '40px', // Make room for the banner
  },
  startHereBanner: {
    position: 'absolute',
    top: '-1px',
    left: '-1px',
    right: '-1px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    padding: '6px 12px',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 700,
  },
  startHereIcon: {
    fontSize: '14px',
  },
  startHereText: {
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  header: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  rankBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  rankBadgeTop: {
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  titleCompact: {
    fontSize: '14px',
    WebkitLineClamp: 1,
  },
  description: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 600,
  },
  impactPath: {
    paddingTop: '8px',
    borderTop: '1px solid #F4F5F7',
  },
  impactText: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '8px',
    borderTop: '1px solid #F4F5F7',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
};

export default PlayCard;
