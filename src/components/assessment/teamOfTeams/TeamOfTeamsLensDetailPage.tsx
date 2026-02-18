import React, { useState } from 'react';
import { MultiTeamAssessmentResult, TeamRollup } from '../../../types/multiTeamAssessment';
import { LensType } from '../../../types/patterns';
import {
  computeLensScores,
  getTrustLevel,
  TRUST_LEVELS,
  HERO_GRADIENTS,
  LENS_CONFIG,
} from '../patterns/DataTrustBanner';
import { PersonaSwitcher } from '../../persona';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';

// ── Lens hero question data ─────────────────────────────────────────
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

interface TeamOfTeamsLensDetailPageProps {
  lens: LensType;
  multiTeamResult: MultiTeamAssessmentResult;
  onBack: () => void;
  onTeamClick: (teamId: string) => void;
}

// ── Helper: get a specific lens score for a team ────────────────────
function getTeamLensScore(team: TeamRollup, lens: LensType): number {
  const ar = team.assessmentResult;
  if (!ar.lensResults) return 0;
  const intDim = ar.dimensions.find(d => d.dimensionKey === 'data-integrity');
  const intScore = intDim ? (intDim.healthScore ?? Math.round(intDim.overallPercentile)) : 50;
  const scores = computeLensScores(ar.lensResults, intScore);
  if (lens === 'coverage') return scores.coverage;
  if (lens === 'integrity') return scores.integrity;
  return scores.behavioral;
}

// ── Helper: trend arrow ─────────────────────────────────────────────
function trendArrow(direction: string): { symbol: string; color: string } {
  if (direction === 'improving') return { symbol: '\u2197', color: '#00875A' };
  if (direction === 'declining') return { symbol: '\u2198', color: '#DE350B' };
  return { symbol: '\u2192', color: '#8993A4' };
}

// ── Main Component ──────────────────────────────────────────────────
const TeamOfTeamsLensDetailPage: React.FC<TeamOfTeamsLensDetailPageProps> = ({
  lens,
  multiTeamResult,
  onBack,
  onTeamClick,
}) => {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  const { teamResults } = multiTeamResult;
  const config = LENS_CONFIG[lens];
  const heroData = LENS_HERO_DATA[lens];

  // Compute per-team lens scores and sort by this lens score descending
  const teamsWithScores = teamResults.map(team => ({
    team,
    lensScore: getTeamLensScore(team, lens),
  })).sort((a, b) => b.lensScore - a.lensScore);

  // Aggregate lens score (mean)
  const avgScore = Math.round(
    teamsWithScores.reduce((sum, t) => sum + t.lensScore, 0) / teamsWithScores.length
  );
  const { level: trustLevel, index: trustIndex } = getTrustLevel(avgScore);
  const gradient = HERO_GRADIENTS[trustLevel.name] || HERO_GRADIENTS['Fair'];

  // All lens scores for position plot
  const allLensScores = teamsWithScores.map(t => t.lensScore);
  const minScore = Math.min(...allLensScores);
  const maxScore = Math.max(...allLensScores);
  const spread = maxScore - minScore;

  // Trust level distribution for this lens
  const trustDist = TRUST_LEVELS.map(tl => ({
    ...tl,
    count: teamsWithScores.filter(t => {
      const { level } = getTrustLevel(t.lensScore);
      return level.name === tl.name;
    }).length,
  }));

  // Trend counts (using majority trend per team)
  const trendCounts = { improving: 0, stable: 0, declining: 0 };
  teamsWithScores.forEach(({ team }) => {
    const dims = team.assessmentResult.dimensions;
    const tc = dims.reduce((acc, d) => {
      acc[d.trend]++;
      return acc;
    }, { improving: 0, stable: 0, declining: 0 } as Record<string, number>);
    const majorityTrend = (tc.improving || 0) > (tc.declining || 0) ? 'improving'
      : (tc.declining || 0) > (tc.improving || 0) ? 'declining' : 'stable';
    trendCounts[majorityTrend as keyof typeof trendCounts]++;
  });

  // Majority trend across teams
  const majorityTrend = trendCounts.improving > trendCounts.declining ? 'improving'
    : trendCounts.declining > trendCounts.improving ? 'declining' : 'stable';
  const trendInfo = trendArrow(majorityTrend);

  // Donut ring
  const r = 84;
  const circ = 2 * Math.PI * r;
  const filled = (avgScore / 100) * circ;

  return (
    <div style={styles.page}>
      {/* Navigation header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={onBack} title="Back to Team of Teams">
              <ArrowLeftIcon label="Back" primaryColor="white" size="medium" />
            </button>
            <div>
              <h1 style={styles.headerTitle}>{config.label}</h1>
              <span style={styles.headerSubtitle}>
                {multiTeamResult.name} &middot; {teamResults.length} teams
              </span>
            </div>
          </div>
          <PersonaSwitcher />
        </div>
      </header>

      <main style={styles.main}>
        {/* ── Hero Section ──────────────────────────────────────── */}
        <div style={styles.heroCard}>
          <div style={{ ...styles.accentBar, background: trustLevel.color }} />
          <div style={{ ...styles.heroTop, background: gradient }}>
            <div style={styles.heroDecor1} />
            <div style={styles.heroDecor2} />
            <div style={styles.heroColumns}>
              {/* Left — question text */}
              <div style={styles.questionContent}>
                <span style={styles.questionEyebrow}>{config.label.toUpperCase()}</span>
                <h2 style={styles.questionText}>
                  {heroData.q1}<span style={{ color: '#FF8B00' }}>{heroData.h1}</span>
                  {heroData.q2}<span style={{ color: '#0052CC' }}>{heroData.h2}</span>
                  {heroData.q3}
                </h2>
                <p style={styles.questionSubtext}>
                  {heroData.subtext}{' '}
                  <strong style={{ color: trustLevel.color }}>
                    Across {teamResults.length} teams, the average score is {avgScore} ({trustLevel.name}).
                  </strong>
                </p>
              </div>

              {/* Divider */}
              <div style={styles.heroDivider}>
                <div style={styles.heroDividerLine} />
                <div style={styles.heroDividerDot} />
                <div style={styles.heroDividerLine} />
              </div>

              {/* Right — score donut */}
              <div style={styles.scoreFloat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                    <span style={styles.scoreLabel}>{config.label.toUpperCase()} SCORE</span>
                    <div style={styles.scoreDisc}>
                      <div style={styles.scoreDiscBg} />
                      <svg width={186} height={186} viewBox="0 0 186 186" style={{ display: 'block', position: 'relative' as const, zIndex: 1, transform: 'rotate(-90deg)' }}>
                        <defs>
                          <filter id="tot-lens-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx={93} cy={93} r={r} fill="none" stroke={`${trustLevel.color}14`} strokeWidth={9} />
                        <circle cx={93} cy={93} r={r} fill="none" stroke={trustLevel.color} strokeWidth={9}
                          strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" filter="url(#tot-lens-glow)" />
                      </svg>
                      <div style={styles.scoreContent}>
                        <span style={{ ...styles.scoreNumber, color: trustLevel.color, position: 'relative' as const }}>
                          {avgScore}
                          <button
                            className="lens-trend-spark-btn"
                            type="button"
                            title={`Lens trend: ${majorityTrend}`}
                            style={{
                              position: 'absolute' as const,
                              top: '-4px',
                              right: '-32px',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                            }}>
                            <style>{`.lens-trend-spark-btn:hover { background: ${trendInfo.color}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendInfo.color}22; } .lens-trend-spark-btn:active { transform: scale(1.05); }`}</style>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={trendInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              {majorityTrend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
                              {majorityTrend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
                              {majorityTrend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
                            </svg>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical trust level spectrum */}
                  <svg width={90} height={126} viewBox="0 0 90 126">
                    {(() => {
                      const levels = [...TRUST_LEVELS].reverse();
                      const nodeX = 8, labelX = 22, spacing = 26, startY = 12;
                      return (
                        <>
                          {levels.map((_, j) => {
                            if (j === levels.length - 1) return null;
                            const y1 = startY + j * spacing;
                            const y2 = startY + (j + 1) * spacing;
                            const origIdx = TRUST_LEVELS.length - 1 - j;
                            const reached = origIdx <= trustIndex;
                            return (
                              <line key={`line-${j}`} x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                                stroke={reached ? levels[j + 1].color : '#DFE1E6'} strokeWidth={2} />
                            );
                          })}
                          {levels.map((level, j) => {
                            const y = startY + j * spacing;
                            const origIdx = TRUST_LEVELS.length - 1 - j;
                            const isCurr = origIdx === trustIndex;
                            const isReached = origIdx <= trustIndex;
                            return (
                              <g key={level.name}>
                                {isCurr && <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.12} />}
                                <circle cx={nodeX} cy={y} r={isCurr ? 5 : 3}
                                  fill={isReached ? level.color : '#FFFFFF'}
                                  stroke={isReached ? level.color : '#DFE1E6'}
                                  strokeWidth={isReached ? 0 : 1.5} />
                                <text x={labelX} y={y} dominantBaseline="central"
                                  fontSize={isCurr ? '11.5' : '10'} fontWeight={isCurr ? '700' : '400'}
                                  fill={isCurr ? level.color : '#A5ADBA'}>
                                  {level.name}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Statistics Banner ─────────────────────────────────── */}
        {(() => {
          const totalTeams = teamsWithScores.length;
          const atRiskTeams = teamsWithScores.filter(t => t.lensScore < 50);

          // Top and bottom teams (by lens score)
          const topTeam = teamsWithScores[0];
          const bottomTeam = teamsWithScores[teamsWithScores.length - 1];
          const scoreGap = topTeam.lensScore - bottomTeam.lensScore;

          // Overall portfolio score for comparison
          const overallPortfolioScore = multiTeamResult.portfolioSummary.overallHealthScore;

          return (
            <div style={styles.statsBanner}>
              {/* ── ROW 1: Lens Health Distribution Bar ── */}
              <div style={styles.statsDistRow}>
                <span style={styles.statsSectionLabel}>{config.label.toUpperCase()} HEALTH DISTRIBUTION</span>
                <div style={{ display: 'flex', height: '38px', borderRadius: '6px', overflow: 'hidden' as const, gap: '2px' }}>
                  {trustDist.filter(d => d.count > 0).map(d => (
                    <div key={d.name} style={{ flex: d.count, backgroundColor: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'flex 0.3s', minWidth: '60px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>{d.count}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── ROW 2: Four Insight Tiles ── */}
              <div style={styles.statsInsightsRow}>
                {/* Tile 1: Overall vs This Lens (score pills) */}
                <div style={styles.statsInsightTile}>
                  <div style={styles.statsSectionLabel}>OVERALL vs THIS LENS</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '2px' }}>
                    {[
                      { label: config.label, score: avgScore },
                      { label: 'Portfolio', score: overallPortfolioScore },
                    ].map(item => {
                      const { level } = getTrustLevel(item.score);
                      return (
                        <div key={item.label}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: level.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#42526E', flex: 1 }}>{item.label}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: level.color }}>{item.score}</span>
                          </div>
                          <div style={{ height: '4px', borderRadius: '2px', background: '#EBECF0', overflow: 'hidden' as const }}>
                            <div style={{ width: `${item.score}%`, height: '100%', borderRadius: '2px', backgroundColor: level.color, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#6B778C', marginTop: '6px', lineHeight: 1.4 }}>
                    {avgScore >= overallPortfolioScore
                      ? `${config.label} is ${avgScore - overallPortfolioScore}pts above overall`
                      : `${config.label} is ${overallPortfolioScore - avgScore}pts below overall`}
                  </div>
                </div>

                {/* Tile 2: Needs Attention */}
                <div style={styles.statsInsightTile}>
                  <div style={styles.statsSectionLabel}>NEEDS ATTENTION</div>
                  {atRiskTeams.length === 0 ? (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#00875A', marginTop: '2px' }}>All teams above 50</div>
                  ) : (
                    <>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#FF8B00', lineHeight: 1.3 }}>
                        {atRiskTeams.length} <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B778C' }}>of {totalTeams} teams below 50</span>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        {atRiskTeams.map(({ team, lensScore }) => {
                          const { level } = getTrustLevel(lensScore);
                          return (
                            <div key={team.teamId} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: level.color, flexShrink: 0 }} />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#172B4D', flex: 1 }}>{team.teamName}</span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: level.color }}>{lensScore}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Tile 3: Trend */}
                <div style={styles.statsInsightTile}>
                  <div style={styles.statsSectionLabel}>TREND</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00875A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#00875A', lineHeight: 1 }}>{trendCounts.improving}</span>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: '#6B778C' }}>improving</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8993A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#8993A4', lineHeight: 1 }}>{trendCounts.stable}</span>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: '#6B778C' }}>stable</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#DE350B', lineHeight: 1 }}>{trendCounts.declining}</span>
                      <span style={{ fontSize: '10px', fontWeight: 500, color: '#6B778C' }}>declining</span>
                    </div>
                  </div>
                </div>

                {/* Tile 4: Top & Bottom */}
                <div style={{ ...styles.statsInsightTile, borderRight: 'none' }}>
                  <div style={styles.statsSectionLabel}>TOP &amp; BOTTOM</div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginTop: '2px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#00875A', background: '#E3FCEF', padding: '1px 6px', borderRadius: '4px' }}>BEST</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{topTeam.team.teamName}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: getTrustLevel(topTeam.lensScore).level.color, marginLeft: 'auto' }}>{topTeam.lensScore}</span>
                      </div>
                    </div>
                    <div style={{ height: '1px', background: '#EBECF0' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#DE350B', background: '#FFEBE6', padding: '1px 6px', borderRadius: '4px' }}>LOW</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{bottomTeam.team.teamName}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: getTrustLevel(bottomTeam.lensScore).level.color, marginLeft: 'auto' }}>{bottomTeam.lensScore}</span>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C', marginTop: '4px', lineHeight: 1.4 }}>{scoreGap}pt gap between top and bottom</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Visual separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #DFE1E6)' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#97A0AF', letterSpacing: '1.5px', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>TEAM BREAKDOWN</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #DFE1E6)' }} />
        </div>

        {/* ── Teams Table for this lens ─────────────────────────── */}
        <div style={styles.tableSection}>
          <div style={styles.tableTitleRow}>
            <h3 style={styles.tableTitle}>{config.label} by Team</h3>
            <span style={styles.tableSubtitle}>{teamResults.length} teams &middot; sorted by {config.label.toLowerCase()} score</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={{ ...styles.th, textAlign: 'left' as const }}>Team</th>
                  <th style={styles.th}>{config.label} Score</th>
                  <th style={styles.th}>Overall Score</th>
                  <th style={styles.th}>Trust Level</th>
                  <th style={styles.th}>Trend</th>
                  <th style={styles.th}>Position</th>
                </tr>
              </thead>
              <tbody>
                {teamsWithScores.map(({ team, lensScore }, idx) => {
                  const { level: lensLevel } = getTrustLevel(lensScore);
                  const { level: overallLevel } = getTrustLevel(team.overallHealthScore);
                  const isHovered = hoveredTeamId === team.teamId;

                  // Determine trend for this team
                  const dims = team.assessmentResult.dimensions;
                  const tc = dims.reduce((acc, d) => {
                    acc[d.trend]++;
                    return acc;
                  }, { improving: 0, stable: 0, declining: 0 } as Record<string, number>);
                  const majorityTrend = (tc.improving || 0) > (tc.declining || 0) ? 'improving'
                    : (tc.declining || 0) > (tc.improving || 0) ? 'declining' : 'stable';
                  const arrow = trendArrow(majorityTrend);

                  return (
                    <tr
                      key={team.teamId}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isHovered ? '#F4F5F7' : (idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC'),
                        transition: 'background 0.1s',
                      }}
                      onClick={() => onTeamClick(team.teamId)}
                      onMouseEnter={() => setHoveredTeamId(team.teamId)}
                      onMouseLeave={() => setHoveredTeamId(null)}
                    >
                      <td style={styles.td}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>{idx + 1}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'left' as const }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: lensLevel.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{team.teamName}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: lensLevel.color }}>{lensScore}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: overallLevel.color }}>{team.overallHealthScore}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                          color: lensLevel.color, backgroundColor: lensLevel.bgTint,
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: lensLevel.color }} />
                          {lensLevel.name}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={arrow.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          {majorityTrend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
                          {majorityTrend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
                          {majorityTrend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
                        </svg>
                      </td>
                      <td style={styles.td}>
                        <svg width="80" height="16" viewBox="0 0 80 16">
                          <rect x="2" y="7" width="76" height="2" rx="1" fill="#EBECF0" />
                          {allLensScores.map((score, i) => {
                            const x = 2 + (score / 100) * 76;
                            const isThis = score === lensScore && i === idx;
                            const { level: dotLvl } = getTrustLevel(score);
                            return (
                              <circle key={i} cx={x} cy="8" r={isThis ? 4 : 2.5}
                                fill={isThis ? dotLvl.color : '#C1C7D0'}
                                stroke={isThis ? '#fff' : 'none'}
                                strokeWidth={isThis ? 1.5 : 0}
                                opacity={isThis ? 1 : 0.5}
                              />
                            );
                          })}
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust level legend */}
        <div style={styles.legendRow}>
          {TRUST_LEVELS.map(tl => (
            <span key={tl.name} style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', color: '#6B778C', padding: '3px 8px',
              backgroundColor: tl.bgTint, borderRadius: '10px', border: `1px solid ${tl.borderTint}`,
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tl.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: tl.color }}>{tl.name}</span>
              <span>{tl.range[0]}–{tl.range[1]}</span>
            </span>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeamOfTeamsLensDetailPage;

// ── Styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#F4F5F7' },
  header: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
    padding: '0 32px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: '1200px', margin: '0 auto', padding: '12px 0',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  backButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px', borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer', flexShrink: 0,
  },
  headerTitle: { margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 },
  headerSubtitle: { fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 },
  main: {
    maxWidth: '1200px', margin: '0 auto', padding: '24px 32px 48px',
    display: 'flex', flexDirection: 'column' as const, gap: '24px',
  },
  // Hero
  heroCard: { position: 'relative' as const, background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E4E6EB', overflow: 'hidden' },
  accentBar: { height: '5px' },
  heroTop: { position: 'relative' as const, overflow: 'hidden' },
  heroDecor1: {
    position: 'absolute' as const, top: '-40px', right: '-30px', width: '180px', height: '180px',
    borderRadius: '50%', background: 'rgba(255, 139, 0, 0.06)', border: '1px solid rgba(255, 139, 0, 0.08)',
  },
  heroDecor2: {
    position: 'absolute' as const, bottom: '-20px', left: '-40px', width: '120px', height: '120px',
    borderRadius: '50%', background: 'rgba(0, 82, 204, 0.04)', border: '1px solid rgba(0, 82, 204, 0.06)',
  },
  heroColumns: {
    position: 'relative' as const, zIndex: 1, display: 'flex', alignItems: 'center',
    minHeight: '220px', padding: '24px 36px 24px 56px', gap: '32px',
  },
  questionContent: { position: 'relative' as const, zIndex: 1, flex: '1 1 0%', maxWidth: '600px' },
  questionEyebrow: {
    display: 'inline-block', fontSize: '10px', fontWeight: 800, letterSpacing: '2px',
    color: '#BF6A02', marginBottom: '12px', textTransform: 'uppercase' as const,
  },
  questionText: { margin: '0 0 16px', fontSize: '28px', fontWeight: 800, lineHeight: 1.25, color: '#172B4D', letterSpacing: '-0.5px' },
  questionSubtext: { margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#44546F', fontWeight: 400 },
  heroDivider: {
    flex: '0 0 auto', display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    alignSelf: 'stretch', gap: '0', padding: '16px 0',
  },
  heroDividerLine: { flex: 1, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255, 139, 0, 0.25), rgba(255, 139, 0, 0.35))' },
  heroDividerDot: {
    width: '8px', height: '8px', borderRadius: '2px', transform: 'rotate(45deg)',
    background: 'rgba(255, 139, 0, 0.3)', border: '1px solid rgba(255, 139, 0, 0.15)',
    margin: '8px 0', flexShrink: 0,
  },
  scoreFloat: {
    position: 'relative' as const, zIndex: 1, flex: '0 0 auto',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', marginLeft: '16px',
  },
  scoreLabel: { fontSize: '10px', fontWeight: 700, color: '#8993A4', letterSpacing: '1.2px', textTransform: 'uppercase' as const, marginBottom: '4px' },
  scoreDisc: { position: 'relative' as const, width: '186px', height: '186px' },
  scoreDiscBg: {
    position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: '150px', height: '150px', borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 6px 40px rgba(9, 30, 66, 0.10), 0 0 0 1px rgba(9, 30, 66, 0.04)',
  },
  scoreContent: {
    position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  scoreNumber: { fontSize: '64px', fontWeight: 800, lineHeight: 1, letterSpacing: '-3px' },
  // Stats banner
  statsBanner: {
    display: 'flex', flexDirection: 'column' as const,
    backgroundColor: '#FAFBFC', borderRadius: '10px', border: '1px solid #EBECF0',
    overflow: 'hidden' as const,
  },
  statsDistRow: {
    padding: '16px 24px 14px',
  },
  statsInsightsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
    borderTop: '1px solid #EBECF0',
  },
  statsInsightTile: {
    padding: '16px 20px', borderRight: '1px solid #EBECF0',
  },
  statsSectionLabel: {
    fontSize: '9px', fontWeight: 700, color: '#7A869A', textTransform: 'uppercase' as const,
    letterSpacing: '0.8px', marginBottom: '6px', display: 'block',
  },
  // Table
  tableSection: { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E6EB', overflow: 'hidden' },
  tableTitleRow: { display: 'flex', alignItems: 'baseline', gap: '12px', padding: '20px 24px 0' },
  tableTitle: { margin: 0, fontSize: '16px', fontWeight: 700, color: '#172B4D' },
  tableSubtitle: { fontSize: '12px', color: '#6B778C', fontWeight: 500 },
  tableWrapper: { padding: '12px 0', overflowX: 'auto' as const },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: {
    padding: '8px 16px', fontSize: '10px', fontWeight: 700, color: '#6B778C',
    textTransform: 'uppercase' as const, letterSpacing: '0.5px', textAlign: 'center' as const,
    borderBottom: '1px solid #EBECF0', whiteSpace: 'nowrap' as const,
  },
  td: { padding: '10px 16px', textAlign: 'center' as const, borderBottom: '1px solid #F4F5F7', whiteSpace: 'nowrap' as const },
  legendRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' },
};
