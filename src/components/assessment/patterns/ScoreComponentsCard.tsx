import React from 'react';
import { AssessmentLensResults, LensType } from '../../../types/patterns';
import {
  computeLensScores,
  getTrustLevel,
  LENS_CONFIG,
  TRUST_LEVELS,
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
          const { level: trustLevel, index: trustIndex } = getTrustLevel(score);
          const isWeakest = lens === weakestDisplayed.lens;

          return (
            <button
              key={lens}
              style={{
                ...styles.lensCard,
                borderTopColor: trustLevel.color,
                ...(isWeakest ? {
                  borderColor: trustLevel.color,
                  borderTopColor: trustLevel.color,
                } : {}),
              }}
              onClick={() => onLensClick?.(lens)}
            >
              {/* Start here tab on top border */}
              {isWeakest && (
                <span style={{
                  ...styles.startHereBadge,
                  color: trustLevel.color,
                  borderColor: trustLevel.color,
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

              {/* Horizontal divider */}
              <div style={styles.horizDivider} />

              {/* Bottom: score + vertical spectrum side by side */}
              <div style={styles.bottomRow}>
                {/* Left: Health Score */}
                <div style={styles.scoreColumn}>
                  <span style={styles.columnHeader}>HEALTH SCORE</span>
                  {(() => {
                    const r = 40;
                    const circ = 2 * Math.PI * r;
                    const filled = (score / 100) * circ;
                    return (
                      <div style={styles.donutWrap}>
                        <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                          <defs>
                            <filter id={`glow-${lens}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <circle cx={48} cy={48} r={r - 4} fill={`${trustLevel.color}08`} />
                          <circle cx={48} cy={48} r={r} fill="none" stroke={`${trustLevel.color}15`} strokeWidth={7} />
                          <circle
                            cx={48} cy={48} r={r}
                            fill="none"
                            stroke={trustLevel.color}
                            strokeWidth={7}
                            strokeDasharray={`${filled} ${circ}`}
                            strokeLinecap="round"
                            filter={`url(#glow-${lens})`}
                          />
                        </svg>
                        <div style={styles.donutLabel}>
                          <span style={{ ...styles.donutNumber, color: trustLevel.color }}>{score}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Divider */}
                <div style={styles.columnDivider} />

                {/* Right: Vertical Spectrum */}
                <div style={styles.spectrumColumn}>
                  {(() => {
                    const levels = [...TRUST_LEVELS].reverse();
                    const nodeCount = levels.length;
                    const nodeX = 8;
                    const labelX = 22;
                    const spacing = 24;
                    const startY = 6;
                    const svgH = startY + (nodeCount - 1) * spacing + 6;

                    return (
                      <svg width={110} height={svgH} viewBox={`0 0 110 ${svgH}`}>
                        {/* Connecting lines */}
                        {levels.map((_, j) => {
                          if (j === nodeCount - 1) return null;
                          const y1 = startY + j * spacing;
                          const y2 = startY + (j + 1) * spacing;
                          const origUpper = nodeCount - 1 - j;
                          const reached = origUpper <= trustIndex;
                          return (
                            <line
                              key={`line-${j}`}
                              x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                              stroke={reached ? levels[j + 1].color : '#DFE1E6'}
                              strokeWidth={2}
                            />
                          );
                        })}
                        {/* Nodes + labels */}
                        {levels.map((level, j) => {
                          const y = startY + j * spacing;
                          const origIdx = nodeCount - 1 - j;
                          const isCurr = origIdx === trustIndex;
                          const isReached = origIdx <= trustIndex;
                          return (
                            <g key={level.name}>
                              {isCurr && (
                                <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.1} />
                              )}
                              <circle
                                cx={nodeX} cy={y}
                                r={isCurr ? 5 : 3}
                                fill={isReached ? level.color : '#FFFFFF'}
                                stroke={isReached ? level.color : '#DFE1E6'}
                                strokeWidth={isReached ? 0 : 1.5}
                              />
                              <text
                                x={labelX} y={y}
                                dominantBaseline="central"
                                fontSize={isCurr ? '11' : '10'}
                                fontWeight={isCurr ? '700' : '400'}
                                fill={isCurr ? level.color : '#A5ADBA'}
                                fontFamily="inherit"
                              >
                                {level.name}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>
              </div>

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
    backgroundColor: '#FFFFFF',
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
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    padding: '2px 10px',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid',
    whiteSpace: 'nowrap' as const,
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
  horizDivider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'rgba(9, 30, 66, 0.08)',
    marginTop: '12px',
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    marginTop: '12px',
    width: '100%',
  },
  scoreColumn: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
  },
  spectrumColumn: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
  },
  columnHeader: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#97A0AF',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  columnDivider: {
    width: '1px',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(9, 30, 66, 0.08)',
    margin: '0 4px',
  },
  donutWrap: {
    position: 'relative' as const,
    width: '96px',
    height: '96px',
  },
  donutLabel: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutNumber: {
    fontSize: '36px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-2px',
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
