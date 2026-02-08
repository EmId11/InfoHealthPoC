// PlayAttribution Component
// Section showing which plays contributed to the measured impact

import React from 'react';
import { PlayImpactMeasurement } from '../../../types/impactMeasurement';
import { PlayImpactBar } from '../../assessment/impact/PlayImpactBar';

interface PlayAttributionProps {
  playsWithImpact: PlayImpactMeasurement[];
  playTitleMap: Record<string, string>;
  onPlayClick?: (playId: string) => void;
}

export const PlayAttribution: React.FC<PlayAttributionProps> = ({
  playsWithImpact,
  playTitleMap,
  onPlayClick,
}) => {
  if (playsWithImpact.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Play Attribution</h3>
        <div style={styles.emptyState}>
          <p>No plays have measured impact yet.</p>
          <p style={styles.emptyHint}>
            Impact is measured after plays have been completed long enough for changes to manifest.
          </p>
        </div>
      </div>
    );
  }

  // Sort by dimension change (most positive first)
  const sortedPlays = [...playsWithImpact].sort((a, b) => {
    const aChange = a.analysis?.dimensionChange.healthScoreChange || 0;
    const bChange = b.analysis?.dimensionChange.healthScoreChange || 0;
    return bChange - aChange;
  });

  // Find max impact for scaling bars
  const maxImpact = Math.max(
    ...sortedPlays.map(p => Math.abs(p.analysis?.dimensionChange.healthScoreChange || 0)),
    10 // Minimum of 10 for scaling
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Play Attribution</h3>
        <span style={styles.subtitle}>
          Plays ranked by their contribution to score changes
        </span>
      </div>

      <div style={styles.playList}>
        {sortedPlays.map((play, idx) => {
          const title = playTitleMap[play.playId] || play.playId;
          const impactScore = play.analysis?.dimensionChange.healthScoreChange || 0;
          const confidence = play.analysis?.confidence.level || 'low';

          return (
            <PlayImpactBar
              key={play.planPlayId}
              playTitle={title}
              impactScore={impactScore}
              maxImpact={maxImpact}
              confidenceLevel={confidence}
              rank={idx + 1}
              onClick={onPlayClick ? () => onPlayClick(play.playId) : undefined}
            />
          );
        })}
      </div>

      <div style={styles.noteContainer}>
        <p style={styles.note}>
          {'\u2139\uFE0F'} Attribution reflects the correlation between play completion and score changes.
          Multiple plays affecting the same metrics may share attribution.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B778C',
  },
  playList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  noteContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #DFE1E6',
  },
  note: {
    fontSize: 12,
    color: '#6B778C',
    margin: 0,
    lineHeight: 1.5,
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6B778C',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 8,
  },
};

export default PlayAttribution;
