import React from 'react';
import { ComputedMaturity, DEFAULT_MATURITY_LEVELS, MaturityLevelNumber } from '../../../types/playbook';
import { DimensionPlaybook } from '../../../types/playbook';

interface MaturitySnapshotProps {
  maturity: ComputedMaturity;
  playbook: DimensionPlaybook;
}

const MaturitySnapshot: React.FC<MaturitySnapshotProps> = ({ maturity, playbook }) => {
  const guidance = playbook.maturityGuidance[maturity.level as MaturityLevelNumber];

  const getLevelColor = (level: MaturityLevelNumber): string => {
    switch (level) {
      case 1: return '#DE350B';
      case 2: return '#FF8B00';
      case 3: return '#FFAB00';
      case 4: return '#36B37E';
      case 5: return '#00875A';
    }
  };

  const color = getLevelColor(maturity.level);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Maturity Level</h3>
      </div>

      <div style={styles.content}>
        {/* Main level display */}
        <div style={styles.levelDisplay}>
          <span style={{ ...styles.levelName, color }}>{maturity.levelInfo.name}</span>
          <span style={styles.levelNumber}>(Level {maturity.level} of 5)</span>
        </div>
        <p style={styles.levelDescription}>{maturity.levelInfo.shortDescription}</p>

        {/* Progress bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressBar}>
            {DEFAULT_MATURITY_LEVELS.map((level) => (
              <div
                key={level.level}
                style={{
                  ...styles.progressSegment,
                  backgroundColor: level.level <= maturity.level ? color : '#DFE1E6',
                }}
              />
            ))}
          </div>
          <div style={styles.levelLabels}>
            {DEFAULT_MATURITY_LEVELS.map((level) => (
              <span
                key={level.level}
                style={{
                  ...styles.levelLabel,
                  fontWeight: level.level === maturity.level ? 600 : 400,
                  color: level.level === maturity.level ? color : '#6B778C',
                }}
              >
                {level.name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statValue}>{maturity.healthyIndicatorCount}</span>
            <span style={styles.statLabel}>of {maturity.totalIndicatorCount} indicators healthy</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>{maturity.healthScore}</span>
            <span style={styles.statLabel}>health score</span>
          </div>
        </div>

        {/* Guidance */}
        {guidance && (
          <div style={styles.guidance}>
            <div style={styles.guidanceItem}>
              <span style={styles.guidanceIcon}>🎯</span>
              <div>
                <span style={styles.guidanceLabel}>Focus on:</span>
                <span style={styles.guidanceText}>{guidance.focus}</span>
              </div>
            </div>
            <div style={styles.guidanceItem}>
              <span style={styles.guidanceIcon}>⚠️</span>
              <div>
                <span style={styles.guidanceLabel}>Avoid:</span>
                <span style={styles.guidanceText}>{guidance.avoid}</span>
              </div>
            </div>
            <div style={styles.guidanceItem}>
              <span style={styles.guidanceIcon}>⬆️</span>
              <div>
                <span style={styles.guidanceLabel}>Next step:</span>
                <span style={styles.guidanceText}>{guidance.nextStep}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #E4E6EB',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    padding: '20px',
  },
  levelDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '4px',
  },
  levelName: {
    fontSize: '24px',
    fontWeight: 700,
  },
  levelNumber: {
    fontSize: '14px',
    color: '#6B778C',
  },
  levelDescription: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  progressSection: {
    marginBottom: '20px',
  },
  progressBar: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
  },
  progressSegment: {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
  },
  levelLabels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  levelLabel: {
    fontSize: '11px',
    flex: 1,
    textAlign: 'center',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statLabel: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  guidance: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F0F7FF',
    borderRadius: '8px',
    border: '1px solid #BAE7FF',
  },
  guidanceItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  guidanceIcon: {
    fontSize: '14px',
    flexShrink: 0,
    marginTop: '1px',
  },
  guidanceLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    marginRight: '6px',
  },
  guidanceText: {
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.4,
  },
};

export default MaturitySnapshot;
