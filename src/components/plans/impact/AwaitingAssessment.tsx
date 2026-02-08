// AwaitingAssessment Component
// Shows plays that are waiting for their assessment window to open

import React, { useState } from 'react';
import { AwaitingAssessmentPlay } from '../../../types/impactMeasurement';
import { TimelineProgressBadge } from '../../assessment/impact/ImpactTimelineBadge';

interface AwaitingAssessmentProps {
  plays: AwaitingAssessmentPlay[];
  playTitleMap?: Record<string, string>;
  initialExpanded?: boolean;
}

export const AwaitingAssessment: React.FC<AwaitingAssessmentProps> = ({
  plays,
  playTitleMap = {},
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  if (plays.length === 0) {
    return null;
  }

  // Sort by days remaining (soonest first)
  const sortedPlays = [...plays].sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Group by timeline proximity
  const soonPlays = sortedPlays.filter(p => p.daysRemaining <= 7);
  const laterPlays = sortedPlays.filter(p => p.daysRemaining > 7);

  return (
    <div style={styles.container}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <div style={styles.headerLeft}>
          <span style={styles.expandIcon}>{isExpanded ? '\u25BC' : '\u25B6'}</span>
          <h3 style={styles.title}>Awaiting Assessment</h3>
          <span style={styles.count}>{plays.length}</span>
        </div>
        {!isExpanded && soonPlays.length > 0 && (
          <span style={styles.soonBadge}>
            {soonPlays.length} ready within a week
          </span>
        )}
      </button>

      {isExpanded && (
        <div style={styles.content}>
          <p style={styles.description}>
            These plays have been completed but need more time before their impact can be measured.
          </p>

          {soonPlays.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                {'\u{1F525}'} Ready Soon
              </h4>
              <div style={styles.playList}>
                {soonPlays.map(play => (
                  <AwaitingPlayCard
                    key={play.planPlayId}
                    play={play}
                    title={playTitleMap[play.playId] || play.playTitle}
                  />
                ))}
              </div>
            </div>
          )}

          {laterPlays.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}>
                {'\u23F3'} Waiting
              </h4>
              <div style={styles.playList}>
                {laterPlays.map(play => (
                  <AwaitingPlayCard
                    key={play.planPlayId}
                    play={play}
                    title={playTitleMap[play.playId] || play.playTitle}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={styles.infoBox}>
            <strong>Why the wait?</strong>
            <p style={styles.infoText}>
              Different types of plays take different amounts of time to show measurable impact.
              Quick-wins typically show results in 1-2 weeks, while culture changes may take 3-6 months.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface AwaitingPlayCardProps {
  play: AwaitingAssessmentPlay;
  title: string;
}

const AwaitingPlayCard: React.FC<AwaitingPlayCardProps> = ({ play, title }) => {
  const eligibleDate = new Date(play.eligibleAt);
  const formattedDate = eligibleDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div style={styles.playCard}>
      <div style={styles.playInfo}>
        <span style={styles.playTitle}>{title}</span>
        <span style={styles.playDate}>
          Eligible: {formattedDate}
        </span>
      </div>
      <TimelineProgressBadge
        timelineClass={play.impactTimelineClass}
        daysRemaining={play.daysRemaining}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  expandIcon: {
    fontSize: 10,
    color: '#6B778C',
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    margin: 0,
  },
  count: {
    backgroundColor: '#DFE1E6',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 500,
    color: '#5E6C84',
  },
  soonBadge: {
    fontSize: 12,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    padding: '4px 8px',
    borderRadius: 4,
  },
  content: {
    padding: '0 20px 20px',
  },
  description: {
    fontSize: 13,
    color: '#6B778C',
    margin: '0 0 16px 0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#5E6C84',
    margin: '0 0 8px 0',
  },
  playList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  playCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    border: '1px solid #DFE1E6',
  },
  playInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  playTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#172B4D',
  },
  playDate: {
    fontSize: 11,
    color: '#6B778C',
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#DEEBFF',
    borderRadius: 8,
    fontSize: 13,
  },
  infoText: {
    margin: '4px 0 0 0',
    color: '#172B4D',
    lineHeight: 1.4,
  },
};

export default AwaitingAssessment;
