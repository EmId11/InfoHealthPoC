// ImpactTimelineBadge Component
// Shows the expected impact timeline for a play

import React from 'react';
import {
  ImpactTimelineClass,
  getImpactTimelineLabel,
  getImpactTimelineColor,
} from '../../../types/impactMeasurement';
import { TIMELINE_CONFIGS } from '../../../constants/impactTimelines';

interface ImpactTimelineBadgeProps {
  timelineClass: ImpactTimelineClass;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showTooltip?: boolean;
}

export const ImpactTimelineBadge: React.FC<ImpactTimelineBadgeProps> = ({
  timelineClass,
  size = 'medium',
  showIcon = true,
  showTooltip = false,
}) => {
  const colors = getImpactTimelineColor(timelineClass);
  const label = getImpactTimelineLabel(timelineClass);
  const config = TIMELINE_CONFIGS[timelineClass];

  const icons: Record<ImpactTimelineClass, string> = {
    immediate: '\u26A1', // Lightning bolt
    'short-term': '\u23F0', // Alarm clock
    'medium-term': '\u{1F4C5}', // Calendar
    'long-term': '\u{1F4C8}', // Chart
    'very-long-term': '\u{1F3C6}', // Trophy
  };

  const sizeStyles = {
    small: { fontSize: 11, padding: '2px 6px', iconSize: 10 },
    medium: { fontSize: 12, padding: '3px 8px', iconSize: 12 },
    large: { fontSize: 14, padding: '4px 10px', iconSize: 14 },
  };

  const sizeConfig = sizeStyles[size];

  return (
    <div style={styles.container} title={showTooltip ? config.rationale : undefined}>
      <span
        style={{
          ...styles.badge,
          backgroundColor: colors.bg,
          color: colors.text,
          fontSize: sizeConfig.fontSize,
          padding: sizeConfig.padding,
        }}
      >
        {showIcon && (
          <span style={{ ...styles.icon, fontSize: sizeConfig.iconSize }}>
            {icons[timelineClass]}
          </span>
        )}
        <span>{label}</span>
      </span>
    </div>
  );
};

// Compact version showing just the timeline with days
interface TimelineProgressBadgeProps {
  timelineClass: ImpactTimelineClass;
  completedAt?: string;
  daysRemaining?: number;
}

export const TimelineProgressBadge: React.FC<TimelineProgressBadgeProps> = ({
  timelineClass,
  completedAt,
  daysRemaining,
}) => {
  const colors = getImpactTimelineColor(timelineClass);
  const config = TIMELINE_CONFIGS[timelineClass];

  // Calculate progress if we have completion date
  let progress = 0;
  if (completedAt) {
    const completed = new Date(completedAt);
    const now = new Date();
    const daysSinceCompletion = Math.floor(
      (now.getTime() - completed.getTime()) / (1000 * 60 * 60 * 24)
    );
    progress = Math.min(100, (daysSinceCompletion / config.optimalAssessmentDays) * 100);
  }

  const isReady = progress >= 100 || (daysRemaining !== undefined && daysRemaining <= 0);

  return (
    <div style={styles.progressContainer}>
      <div style={styles.progressHeader}>
        <span style={{ ...styles.progressLabel, color: colors.text }}>
          {getImpactTimelineLabel(timelineClass)}
        </span>
        <span style={styles.progressDays}>
          {isReady ? (
            <span style={{ color: '#36B37E' }}>Ready</span>
          ) : daysRemaining !== undefined ? (
            `${daysRemaining}d remaining`
          ) : null}
        </span>
      </div>
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
            backgroundColor: isReady ? '#36B37E' : colors.text,
          }}
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  icon: {
    lineHeight: 1,
  },
  // Progress styles
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 140,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 500,
  },
  progressDays: {
    fontSize: 11,
    color: '#6B778C',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#DFE1E6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
};

export default ImpactTimelineBadge;
