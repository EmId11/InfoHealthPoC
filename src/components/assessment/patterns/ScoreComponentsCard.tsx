import React from 'react';
import { AssessmentLensResults, LensType } from '../../../types/patterns';
import {
  computeLensScores,
  getTrustLevel,
  LENS_CONFIG,
  TRUST_LEVELS,
  HERO_GRADIENTS,
} from './DataTrustBanner';

interface ScoreComponentsCardProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
  onLensClick?: (lens: LensType) => void;
}

/* Per-lens hero-style question data (matches LensDetailPage heroes) */
const LENS_HERO_DATA: Record<string, {
  q1: string; h1: string; q2: string; h2: string; q3: string; subtext: string;
}> = {
  coverage: {
    q1: 'Are your tickets ', h1: 'ready', q2: ' before work ', h2: 'begins', q3: '?',
    subtext: 'Measures whether required fields, descriptions, and acceptance criteria are filled in before a ticket enters a sprint.',
  },
  integrity: {
    q1: 'Is your Jira data ', h1: 'meaningful', q2: ' or just ', h2: 'placeholder', q3: '?',
    subtext: 'Evaluates whether field values represent genuine work activity rather than placeholder or default values.',
  },
  behavioral: {
    q1: 'Does your Jira ', h1: 'reflect', q2: " what's actually ", h2: 'happening', q3: '?',
    subtext: 'Checks whether tickets are updated regularly to reflect the current state of work.',
  },
};

const ScoreComponentsCard: React.FC<ScoreComponentsCardProps> = ({
  lensResults,
  integrityScore,
  onLensClick,
}) => {
  const scores = computeLensScores(lensResults, integrityScore);

  const LENSES: { lens: LensType; score: number }[] = [
    { lens: 'coverage',   score: scores.coverage },
    { lens: 'integrity',  score: scores.integrity },
    { lens: 'behavioral', score: scores.behavioral },
  ];

  const weakestDisplayed = LENSES.reduce((a, b) => a.score < b.score ? a : b);

  const lensColors = LENSES.map(l => getTrustLevel(l.score).level.color);

  return (
    <div style={styles.wrapper}>
      {/* Connector lines bridging from hero composition footer to cards */}
      <div style={styles.connectorRow}>
        {LENSES.map(({ lens }, i) => (
          <div key={`conn-${lens}`} style={styles.connectorCell}>
            <svg width="10" height="7" viewBox="0 0 10 7" style={{ display: 'block', flexShrink: 0 }}>
              <polygon points="1,7 9,7 5,1" fill={lensColors[i]} opacity="0.7" />
            </svg>
            <div style={{ ...styles.connectorLine, background: `linear-gradient(to bottom, ${lensColors[i]}30, ${lensColors[i]})` }} />
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        {LENSES.map(({ lens, score }) => {
          const config = LENS_CONFIG[lens];
          const { level: trustLevel, index: trustIndex } = getTrustLevel(score);
          const isWeakest = lens === weakestDisplayed.lens;
          const heroData = LENS_HERO_DATA[lens];
          const gradient = HERO_GRADIENTS[trustLevel.name] || HERO_GRADIENTS['Fair'];

          return (
            <button
              key={lens}
              style={{
                ...styles.lensCard,
                ...(isWeakest ? { borderColor: trustLevel.color } : {}),
              }}
              onClick={() => onLensClick?.(lens)}
            >
              {/* Accent bar */}
              <div style={{ ...styles.accentBar, background: trustLevel.color }} />

              {/* Question section — hero-style with gradient background */}
              <div style={{ ...styles.questionSection, background: gradient }}>
                {/* Decorative circles */}
                <div style={styles.decor1} />
                <div style={styles.decor2} />

                <div style={styles.eyebrowRow}>
                  <span style={styles.eyebrow}>{config.label.toUpperCase()}</span>
                  {isWeakest && (
                    <span style={{ ...styles.focusPill, color: trustLevel.color, backgroundColor: `${trustLevel.color}12`, borderColor: `${trustLevel.color}35` }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill={trustLevel.color}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      Start here
                    </span>
                  )}
                </div>
                <h3 style={styles.questionText}>
                  {heroData.q1}<span style={styles.highlight1}>{heroData.h1}</span>{heroData.q2}<span style={styles.highlight2}>{heroData.h2}</span>{heroData.q3}
                </h3>
                <p style={styles.subtext}>
                  {heroData.subtext}
                </p>
              </div>

              {/* Score section — white background */}
              <div style={styles.scoreSection}>
                {/* Left: Health Score donut */}
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
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  connectorRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginTop: '-14px',
    marginBottom: '-2px',
  },
  connectorCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  connectorLine: {
    width: '2px',
    height: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },

  /* ── Card shell ─────────────────────────────────────────── */
  lensCard: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E6EB',
    borderRadius: '16px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    padding: 0,
    transition: 'box-shadow 0.15s ease, transform 0.15s ease',
    boxShadow: '0 2px 12px rgba(9, 30, 66, 0.08)',
  },
  accentBar: {
    height: '5px',
    flexShrink: 0,
  },

  /* ── Question section (gradient bg) — exactly 50% ────────── */
  questionSection: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '20px 24px 16px',
    flex: '1 1 0%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center' as const,
  },
  decor1: {
    position: 'absolute' as const,
    top: '-30px',
    right: '-20px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 139, 0, 0.05)',
    border: '1px solid rgba(255, 139, 0, 0.07)',
    pointerEvents: 'none' as const,
  },
  decor2: {
    position: 'absolute' as const,
    bottom: '-15px',
    left: '-25px',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(0, 82, 204, 0.04)',
    border: '1px solid rgba(0, 82, 204, 0.05)',
    pointerEvents: 'none' as const,
  },
  eyebrowRow: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  eyebrow: {
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '2px',
    color: '#BF6A02',
    textTransform: 'uppercase' as const,
  },
  focusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid',
    whiteSpace: 'nowrap' as const,
  },
  questionText: {
    position: 'relative' as const,
    zIndex: 1,
    margin: '0 0 12px',
    fontSize: '19px',
    fontWeight: 800,
    lineHeight: 1.3,
    color: '#172B4D',
    letterSpacing: '-0.3px',
  },
  highlight1: {
    color: '#FF8B00',
  },
  highlight2: {
    color: '#0052CC',
  },
  subtext: {
    position: 'relative' as const,
    zIndex: 1,
    margin: 0,
    fontSize: '12.5px',
    lineHeight: 1.65,
    color: '#44546F',
    fontWeight: 400,
  },

  /* ── Score section (white bg) — exactly 50% ──────────────── */
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center' as const,
    flex: '1 1 0%',
    padding: '16px 20px',
    borderTop: '1px solid rgba(9, 30, 66, 0.06)',
    backgroundColor: '#FFFFFF',
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
    top: '28px',
    right: '18px',
    fontSize: '18px',
    color: '#B3BAC5',
    fontWeight: 400,
    zIndex: 1,
  },
};

export default ScoreComponentsCard;
