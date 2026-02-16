import React from 'react';
import { AssessmentLensResults, LensType } from '../../../types/patterns';
import {
  computeLensScores,
  getTrustLevel,
  LENS_CONFIG,
} from './DataTrustBanner';

interface ScoreComponentsCardProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
  onLensClick?: (lens: LensType) => void;
}

const ScoreComponentsCard: React.FC<ScoreComponentsCardProps> = ({
  lensResults,
  integrityScore,
  onLensClick,
}) => {
  const scores = computeLensScores(lensResults, integrityScore);

  const behavioralScore = lensResults.behavioral.patternsChecked > 0
    ? Math.round((1 - lensResults.behavioral.patternsDetected / lensResults.behavioral.patternsChecked) * 100)
    : 100;

  const LENSES: { lens: LensType; score: number }[] = [
    { lens: 'coverage',   score: scores.coverage },
    { lens: 'integrity',  score: scores.integrity },
    { lens: 'behavioral', score: behavioralScore },
  ];

  const weakestDisplayed = LENSES.reduce((a, b) => a.score < b.score ? a : b);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>SCORE COMPONENTS</span>
        <span style={styles.subtitle}>Click any lens to explore details</span>
      </div>
      <div style={styles.grid}>
        {LENSES.map(({ lens, score }) => {
          const config = LENS_CONFIG[lens];
          const { level: trustLevel } = getTrustLevel(score);
          const isWeakest = lens === weakestDisplayed.lens;

          return (
            <button
              key={lens}
              style={{
                ...styles.lensCard,
                borderTopColor: trustLevel.color,
                ...(isWeakest ? {
                  backgroundColor: trustLevel.bgTint,
                  borderColor: trustLevel.borderTint,
                  borderTopColor: trustLevel.color,
                } : {}),
              }}
              onClick={() => onLensClick?.(lens)}
            >
              {/* Start here badge for weakest */}
              {isWeakest && (
                <span style={{
                  ...styles.startHereBadge,
                  color: trustLevel.color,
                  backgroundColor: `${trustLevel.color}14`,
                }}>
                  START HERE
                </span>
              )}

              {/* Icon + Lens label */}
              <div style={styles.labelRow}>
                <div style={{ ...styles.iconWrap, backgroundColor: `${trustLevel.color}14` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={trustLevel.color}>
                    <path d={config.icon} />
                  </svg>
                </div>
                <span style={styles.lensLabel}>{config.label}</span>
              </div>

              {/* Description */}
              <p style={styles.lensDesc}>{config.description}</p>

              {/* Big hero-style score */}
              <div style={styles.scoreBlock}>
                <span style={{ ...styles.bigNumber, color: trustLevel.color }}>
                  {score}
                </span>
                <span style={styles.bigDenom}>/100</span>
              </div>

              {/* Trust level pill */}
              <span style={{
                ...styles.trustPill,
                color: trustLevel.color,
                backgroundColor: `${trustLevel.color}14`,
              }}>
                {trustLevel.name}
              </span>

              {/* Arrow indicator */}
              <span style={styles.arrow}>&rarr;</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    padding: '28px 32px 32px',
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  subtitle: {
    fontSize: '12px',
    color: '#97A0AF',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  lensCard: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    padding: '24px 24px 16px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #E4E6EB',
    borderTop: '4px solid',
    borderRadius: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center' as const,
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
  },
  startHereBadge: {
    position: 'absolute' as const,
    top: '12px',
    left: '12px',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    flexShrink: 0,
  },
  lensLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  lensDesc: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '280px',
  },
  scoreBlock: {
    display: 'flex',
    alignItems: 'baseline',
    marginTop: '8px',
  },
  bigNumber: {
    fontSize: '56px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-3px',
  },
  bigDenom: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#97A0AF',
    marginLeft: '3px',
  },
  trustPill: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: '10px',
    marginTop: '2px',
  },
  arrow: {
    position: 'absolute' as const,
    top: '18px',
    right: '18px',
    fontSize: '18px',
    color: '#B3BAC5',
    fontWeight: 400,
  },
};

export default ScoreComponentsCard;
