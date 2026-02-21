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
import CrossIcon from '@atlaskit/icon/glyph/cross';

interface TeamOfTeamsLayoutProps {
  multiTeamResult: MultiTeamAssessmentResult;
  onBack: () => void;
  onTeamClick: (teamId: string) => void;
  onLensClick: (lens: LensType) => void;
}

// ── Helper: compute lens scores for a team rollup ───────────────────
function getTeamLensScores(team: TeamRollup) {
  const ar = team.assessmentResult;
  if (!ar.lensResults) return { coverage: 0, integrity: 0, behavioral: 0, composite: 0 };
  const intDim = ar.dimensions.find(d => d.dimensionKey === 'data-integrity');
  const intScore = intDim ? (intDim.healthScore ?? Math.round(intDim.overallPercentile)) : 50;
  return computeLensScores(ar.lensResults, intScore);
}

// ── Helper: trend arrow ─────────────────────────────────────────────
function trendArrow(direction: 'improving' | 'stable' | 'declining'): { symbol: string; color: string } {
  if (direction === 'improving') return { symbol: '\u2197', color: '#00875A' };
  if (direction === 'declining') return { symbol: '\u2198', color: '#DE350B' };
  return { symbol: '\u2192', color: '#8993A4' };
}

// ── Mini Position Dot-Plot ──────────────────────────────────────────
const MiniPositionPlot: React.FC<{ teamScore: number; allScores: number[] }> = ({ teamScore, allScores }) => {
  return (
    <svg width="80" height="16" viewBox="0 0 80 16">
      <rect x="2" y="7" width="76" height="2" rx="1" fill="#EBECF0" />
      {allScores.map((score, i) => {
        const x = 2 + (score / 100) * 76;
        const isThis = score === teamScore;
        const { level } = getTrustLevel(score);
        return (
          <circle
            key={i}
            cx={x}
            cy="8"
            r={isThis ? 4 : 2.5}
            fill={isThis ? level.color : '#C1C7D0'}
            stroke={isThis ? '#fff' : 'none'}
            strokeWidth={isThis ? 1.5 : 0}
            opacity={isThis ? 1 : 0.5}
          />
        );
      })}
    </svg>
  );
};

// ── Main Component ──────────────────────────────────────────────────
const TeamOfTeamsLayout: React.FC<TeamOfTeamsLayoutProps> = ({
  multiTeamResult,
  onBack,
  onTeamClick,
  onLensClick,
}) => {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [isUseCasesOpen, setIsUseCasesOpen] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [orgShowPrevious, setOrgShowPrevious] = useState(false);

  const { portfolioSummary, teamResults } = multiTeamResult;
  const overallScore = portfolioSummary.overallHealthScore;
  const { level: trustLevel, index: trustIndex } = getTrustLevel(overallScore);

  // Donut ring math
  const r = 84;
  const circ = 2 * Math.PI * r;
  const filled = (overallScore / 100) * circ;

  // Sorted teams for table (by overall score descending)
  const sortedTeams = [...teamResults].sort((a, b) => b.overallHealthScore - a.overallHealthScore);
  const allScores = sortedTeams.map(t => t.overallHealthScore);

  // Aggregate lens scores (mean across teams)
  const aggregateLens = (() => {
    let covSum = 0, intSum = 0, behSum = 0;
    let count = 0;
    teamResults.forEach(team => {
      const scores = getTeamLensScores(team);
      if (scores.composite > 0) {
        covSum += scores.coverage;
        intSum += scores.integrity;
        behSum += scores.behavioral;
        count++;
      }
    });
    if (count === 0) return { coverage: 0, integrity: 0, behavioral: 0 };
    return {
      coverage: Math.round(covSum / count),
      integrity: Math.round(intSum / count),
      behavioral: Math.round(behSum / count),
    };
  })();

  // Determine majority trend across teams
  const { teamsImproving, teamsStable, teamsDeclining } = portfolioSummary;
  const majorityTrend = teamsImproving > teamsDeclining ? 'improving' : teamsDeclining > teamsImproving ? 'declining' : 'stable';
  const trendInfo = trendArrow(majorityTrend);

  return (
    <div style={styles.page}>
      {/* Navigation header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={onBack} title="Back to Home">
              <ArrowLeftIcon label="Back" primaryColor="white" size="medium" />
            </button>
            <div>
              <h1 style={styles.headerTitle}>{multiTeamResult.name}</h1>
              <span style={styles.headerSubtitle}>{teamResults.length} teams &middot; Team of Teams Assessment</span>
            </div>
          </div>
          <PersonaSwitcher />
        </div>
      </header>

      <main style={styles.main}>
        {/* ── SECTION 1: Aggregate Hero ────────────────────────────── */}
        <div style={styles.heroCard}>
          <div style={{ ...styles.accentBar, background: trustLevel.color }} />
          <div style={{ ...styles.heroTop, background: HERO_GRADIENTS[trustLevel.name] || HERO_GRADIENTS['Fair'] }}>
            <div style={styles.heroDecor1} />
            <div style={styles.heroDecor2} />

            <div style={styles.heroColumns}>
              {/* Left — question text */}
              <div style={styles.questionContent}>
                <span style={styles.questionEyebrow}>THE CORE QUESTION</span>
                <h2 style={styles.questionText}>
                  How <span style={{ color: '#FF8B00' }}>trustworthy</span> is your Jira data across <span style={{ color: '#0052CC' }}>{teamResults.length} teams</span>?
                </h2>
                <p style={styles.questionSubtext}>
                  This assessment aggregates data trust scores across your entire engineering organisation. <strong style={{ color: trustLevel.color }}>Overall, your portfolio shows {trustLevel.description}.</strong>
                </p>
                {/* Dual action bar */}
                <div style={styles.dualActionBar}>
                  <button type="button" onClick={() => setIsUseCasesOpen(true)} style={styles.dualBtnLeft}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <path d="M9 14l2 2 4-4" />
                    </svg>
                    Can we trust Jira?
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  <div style={styles.dualDivider} />
                  <button type="button" onClick={() => setIsImproveOpen(true)} style={styles.dualBtnRight}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    How might we improve?
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={styles.heroDivider}>
                <div style={styles.heroDividerLine} />
                <div style={styles.heroDividerDot} />
                <div style={styles.heroDividerLine} />
              </div>

              {/* Right — score donut + component breakdown */}
              <div style={styles.scoreFloat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
                    <span style={styles.scoreLabel}>DATA TRUST SCORE</span>
                    <div style={styles.scoreDisc}>
                      <div style={styles.scoreDiscBg} />
                      <svg width={186} height={186} viewBox="0 0 186 186" style={{ display: 'block', position: 'relative' as const, zIndex: 1, transform: 'rotate(-90deg)' }}>
                        <defs>
                          <filter id="tot-hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx={93} cy={93} r={r} fill="none" stroke={`${trustLevel.color}14`} strokeWidth={9} />
                        <circle cx={93} cy={93} r={r} fill="none" stroke={trustLevel.color} strokeWidth={9}
                          strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" filter="url(#tot-hero-glow)" />
                      </svg>
                      <div style={styles.scoreContent}>
                        <span style={{ ...styles.scoreNumber, color: trustLevel.color, position: 'relative' as const }}>
                          {overallScore}
                          <button
                            className="tot-trend-spark-btn"
                            type="button"
                            title={`Portfolio trend: ${majorityTrend}`}
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
                            <style>{`.tot-trend-spark-btn:hover { background: ${trendInfo.color}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendInfo.color}22; } .tot-trend-spark-btn:active { transform: scale(1.05); }`}</style>
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

                  {/* Component score breakdown — replaces the trust spectrum */}
                  <div style={styles.breakdownPanel}>
                    <span style={styles.breakdownTitle}>SCORE BREAKDOWN</span>
                    <div style={styles.breakdownList}>
                      {([
                        { key: 'coverage' as LensType, label: 'Timeliness', score: aggregateLens.coverage, weight: '30%' },
                        { key: 'integrity' as LensType, label: 'Trustworthiness', score: aggregateLens.integrity, weight: '30%' },
                        { key: 'behavioral' as LensType, label: 'Freshness', score: aggregateLens.behavioral, weight: '20%' },
                      ]).map((comp) => {
                        const compTrust = getTrustLevel(comp.score);
                        return (
                          <button
                            key={comp.key}
                            className="tot-breakdown-row"
                            style={styles.breakdownRow}
                            onClick={() => onLensClick(comp.key)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#172B4D' }}>{comp.label}</span>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: compTrust.level.color, letterSpacing: '-0.5px' }}>{comp.score}</span>
                                <span style={{ fontSize: '9px', color: '#97A0AF', fontWeight: 500 }}>{comp.weight}</span>
                              </div>
                            </div>
                            <div style={styles.barTrack}>
                              <div style={{
                                ...styles.barFill,
                                width: `${comp.score}%`,
                                background: `linear-gradient(90deg, ${compTrust.level.color}90, ${compTrust.level.color})`,
                                boxShadow: `0 0 6px ${compTrust.level.color}40`,
                              }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <style>{`.tot-breakdown-row:hover { background: rgba(255,255,255,0.5) !important; } .tot-breakdown-row:hover .bar-chevron { opacity: 1 !important; }`}</style>

                    {/* Trust level + info link */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(9,30,66,0.06)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: trustLevel.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: trustLevel.color }}>{trustLevel.name}</span>
                      <button
                        type="button"
                        onClick={() => setIsUseCasesOpen(true)}
                        className="tot-whatmean-btn"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          background: 'none', border: 'none', padding: '1px 3px',
                          fontSize: '9.5px', fontWeight: 500, color: trustLevel.color,
                          opacity: 0.55, cursor: 'pointer', borderRadius: '4px',
                          transition: 'opacity 0.15s', marginLeft: 'auto',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        What does this mean?
                      </button>
                      <style>{`.tot-whatmean-btn:hover { opacity: 1 !important; }`}</style>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual separator between aggregate view and team breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #DFE1E6)' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#97A0AF', letterSpacing: '1.5px', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const }}>TEAM BREAKDOWN</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #DFE1E6)' }} />
        </div>

        {/* ── SECTION 3: Teams Table ──────────────────────────────── */}
        <div style={styles.tableSection}>
          <div style={styles.tableTitleRow}>
            <h3 style={styles.tableTitle}>Team Breakdown</h3>
            <span style={styles.tableSubtitle}>{teamResults.length} teams &middot; sorted by overall score</span>
          </div>

          {/* Statistics banner */}
          {(() => {
            // Trust level distribution
            const trustDist = TRUST_LEVELS.map(tl => ({
              ...tl,
              count: sortedTeams.filter(t => {
                const { level } = getTrustLevel(t.overallHealthScore);
                return level.name === tl.name;
              }).length,
            }));
            const totalTeams = sortedTeams.length;

            // At-risk teams (score below 50)
            const atRiskTeams = sortedTeams.filter(t => t.overallHealthScore < 50);

            // Top and bottom teams
            const topTeam = sortedTeams[0];
            const bottomTeam = sortedTeams[sortedTeams.length - 1];
            const scoreGap = topTeam.overallHealthScore - bottomTeam.overallHealthScore;

            // Component scores sorted for weakest-first display
            const components = [
              { label: 'Timeliness', score: aggregateLens.coverage },
              { label: 'Trustworthiness', score: aggregateLens.integrity },
              { label: 'Freshness', score: aggregateLens.behavioral },
            ].sort((a, b) => a.score - b.score);

            return (
              <div style={styles.statsBanner}>
                {/* ── ROW 1: Team Health Strip ── */}
                <div style={styles.statsDistRow}>
                  <span style={styles.statsSectionLabel}>PORTFOLIO HEALTH &amp; TREND</span>
                  {/* Team chips grouped by tier — single row */}
                  {(() => {
                    // Group teams by tier
                    const tierGroups = TRUST_LEVELS.map(tl => ({
                      ...tl,
                      teams: [...sortedTeams]
                        .filter(t => {
                          const { level } = getTrustLevel(t.overallHealthScore);
                          return level.name === tl.name;
                        })
                        .sort((a, b) => a.overallHealthScore - b.overallHealthScore)
                        .map(team => {
                          const dims = team.assessmentResult.dimensions;
                          const tC = dims.reduce((acc, d) => { acc[d.trend]++; return acc; }, { improving: 0, stable: 0, declining: 0 } as Record<string, number>);
                          const tt = (tC.improving || 0) > (tC.declining || 0) ? 'improving' : (tC.declining || 0) > (tC.improving || 0) ? 'declining' : 'stable';
                          const ta = trendArrow(tt as 'improving' | 'stable' | 'declining');
                          const scores = getTeamLensScores(team);
                          return { team, ta, trendLabel: tt, scores };
                        }),
                    })).filter(g => g.teams.length > 0);

                    return (
                      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
                        {tierGroups.map(group => (
                          <div
                            key={group.name}
                            style={{
                              flex: group.teams.length,
                              backgroundColor: `${group.color}10`,
                              border: `1px solid ${group.color}20`,
                              borderRadius: '8px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              minWidth: 0,
                            }}
                          >
                            {/* Tier label */}
                            <span style={{ fontSize: '9px', fontWeight: 700, color: group.color, letterSpacing: '0.3px', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, flexShrink: 0 }}>{group.name}</span>
                            {/* Team chips — single row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' as const }}>
                              {group.teams.map(({ team, ta, trendLabel, scores }) => (
                                <div
                                  key={team.teamId}
                                  style={{
                                    position: 'relative' as const,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '3px 8px',
                                    borderRadius: '10px',
                                    backgroundColor: '#FFFFFF',
                                    border: `1.5px solid ${group.color}40`,
                                    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
                                    whiteSpace: 'nowrap' as const,
                                    cursor: 'default',
                                  }}
                                  className="health-chip"
                                  title={`${team.teamName}\nScore: ${team.overallHealthScore} · Trend: ${trendLabel}\nTimeliness: ${scores.coverage} · Trustworthiness: ${scores.integrity} · Freshness: ${scores.behavioral}\nRank: #${team.overallRank} of ${sortedTeams.length}`}
                                >
                                  <span style={{ fontSize: '11px', fontWeight: 800, color: group.color }}>{team.overallHealthScore}</span>
                                  <span style={{ fontSize: '9px', color: ta.color, lineHeight: 1 }}>{ta.symbol}</span>
                                </div>
                              ))}
                            </div>
                            {/* Count badge */}
                            <span style={{ fontSize: '10px', fontWeight: 700, color: group.color, opacity: 0.5, marginLeft: 'auto', flexShrink: 0 }}>{group.teams.length}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Summary counts row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {trustDist.filter(d => d.count > 0).map(d => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: d.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: d.color }}>{d.count}</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>{d.name}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00875A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#00875A' }}>{teamsImproving}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>improved</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8993A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#8993A4' }}>{teamsStable}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>stable</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#DE350B' }}>{teamsDeclining}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>declined</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ROW 2: Three Insight Tiles ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1.8fr', borderTop: '1.5px solid #D5D9E0' }}>
                  {/* Tile 1: Component Scores (score pills) */}
                  <div style={styles.statsInsightTile}>
                    <div style={styles.statsSectionLabel}>COMPONENT SCORES</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '2px' }}>
                      {components.map(comp => {
                        const { level } = getTrustLevel(comp.score);
                        return (
                          <div key={comp.label}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: level.color, flexShrink: 0 }} />
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#42526E', flex: 1 }}>{comp.label}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: level.color }}>{comp.score}</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: '#EBECF0', overflow: 'hidden' as const }}>
                              <div style={{ width: `${comp.score}%`, height: '100%', borderRadius: '2px', backgroundColor: level.color, transition: 'width 0.3s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tile 2: Key Stats */}
                  <div style={styles.statsInsightTile}>
                    <div style={styles.statsSectionLabel}>KEY STATS</div>
                    {(() => {
                      const mean = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
                      const sortedS = [...allScores].sort((a, b) => a - b);
                      const stdDev = Math.round(Math.sqrt(allScores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / allScores.length));
                      const statItems = [
                        { label: 'Below 50', value: `${atRiskTeams.length} of ${totalTeams}`, sub: `${Math.round((atRiskTeams.length / totalTeams) * 100)}%`, color: atRiskTeams.length > 0 ? '#FF8B00' : '#00875A' },
                        { label: 'Lowest score', value: String(bottomTeam.overallHealthScore), sub: bottomTeam.teamName, color: getTrustLevel(bottomTeam.overallHealthScore).level.color },
                        { label: 'Top – bottom gap', value: `${scoreGap}pts`, sub: `${sortedS[0]}–${sortedS[sortedS.length - 1]}`, color: scoreGap > 40 ? '#DE350B' : scoreGap > 25 ? '#FF8B00' : '#00875A' },
                        { label: 'Std deviation', value: `±${stdDev}`, sub: stdDev > 15 ? 'High variance' : 'Moderate', color: stdDev > 15 ? '#FF8B00' : '#42526E' },
                      ];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px', marginTop: '2px' }}>
                          {statItems.map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: s.color, minWidth: '36px', flexShrink: 0 }}>{s.value}</span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '10px', fontWeight: 600, color: '#42526E', lineHeight: 1.2 }}>{s.label}</div>
                                <div style={{ fontSize: '9px', fontWeight: 500, color: '#8993A4', lineHeight: 1.2 }}>{s.sub}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tile 3: Org Comparison (wide) */}
                  <div style={{ ...styles.statsInsightTile, borderRight: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <div style={styles.statsSectionLabel}>ORG COMPARISON</div>
                      <button
                        onClick={() => setOrgShowPrevious(p => !p)}
                        style={{
                          fontSize: '9px', fontWeight: 600, color: orgShowPrevious ? '#0052CC' : '#6B778C',
                          background: orgShowPrevious ? '#DEEBFF' : '#F4F5F7', border: `1px solid ${orgShowPrevious ? '#B3D4FF' : '#DFE1E6'}`,
                          borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {orgShowPrevious ? 'Showing previous' : 'Show previous'}
                      </button>
                    </div>
                    {(() => {
                      // Current org scores (~100 teams)
                      const orgAllScores = [
                        72, 68, 55, 61, 43, 77, 84, 50, 63, 47, 59, 71, 66, 38, 82, 74, 56, 45, 69, 53,
                        78, 41, 64, 58, 75, 33, 70, 62, 80, 49, 67, 54, 73, 46, 81, 57, 65, 44, 76, 52,
                        60, 42, 79, 48, 83, 36, 51, 88, 29, 74, 63, 58, 71, 55, 67, 85, 40, 53, 69, 46,
                        61, 77, 34, 50, 72, 59, 44, 66, 81, 48, 57, 37, 73, 64, 52, 86, 43, 70, 56, 62,
                        78, 39, 68, 54, 75, 47, 60, 83, 41, 65, 51, 79, 35, 58, 74, 45, 69, 53, 87, 42,
                      ];
                      // Previous period scores (slightly lower to simulate improvement)
                      const orgPrevScores = orgAllScores.map((s, i) => Math.max(10, Math.min(100, s - Math.round(Math.sin(i * 2.1) * 6 + 3))));
                      const portPrevScores = allScores.map((s, i) => Math.max(10, Math.min(100, s - Math.round(Math.sin(i * 3.7) * 8 + 4))));

                      const portfolioScores = orgShowPrevious ? portPrevScores : allScores;
                      const orgScores = orgShowPrevious ? orgPrevScores : orgAllScores;

                      // Deterministic jitter
                      const jitterY = (i: number, seed: number, areaH: number, radius: number) => {
                        const h = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
                        return radius + (h - Math.floor(h)) * (areaH - radius * 2);
                      };

                      const svgW = 400;
                      const dotArea = 30;
                      const barH = 5;
                      const dotR = 3.5;
                      const scoreToX = (s: number) => (s / 100) * svgW;

                      // Stats helpers
                      const medianOf = (arr: number[]) => {
                        const sorted = [...arr].sort((a, b) => a - b);
                        return sorted.length % 2 === 0
                          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                          : sorted[Math.floor(sorted.length / 2)];
                      };
                      const pMed = Math.round(medianOf(portfolioScores));
                      const oMed = Math.round(medianOf(orgScores));
                      const pMean = Math.round(portfolioScores.reduce((a, b) => a + b, 0) / portfolioScores.length);
                      const oMean = Math.round(orgScores.reduce((a, b) => a + b, 0) / orgScores.length);

                      // Tier distribution
                      const tierPct = (scores: number[], lo: number, hi: number) =>
                        Math.round((scores.filter(s => s >= lo && s <= hi).length / scores.length) * 100);
                      const pAtRisk = tierPct(portfolioScores, 0, 50);
                      const oAtRisk = tierPct(orgScores, 0, 50);
                      const pFair = tierPct(portfolioScores, 51, 75);
                      const oFair = tierPct(orgScores, 51, 75);
                      const pHealthy = tierPct(portfolioScores, 76, 100);
                      const oHealthy = tierPct(orgScores, 76, 100);

                      // Trend comparison (mock: org-wide improvement rate)
                      const pImproved = Math.round((teamsImproving / totalTeams) * 100);
                      const oImproved = 38; // mock org-wide % improved

                      const deltaCalc = (pVal: number, oVal: number, lowerIsBetter = false) => {
                        const d = pVal - oVal;
                        const good = lowerIsBetter ? d < 0 : d > 0;
                        return {
                          text: `${d > 0 ? '+' : ''}${d}`,
                          color: d === 0 ? '#8993A4' : good ? '#00875A' : '#DE350B',
                        };
                      };

                      const rows = [
                        { label: 'Median', port: String(pMed), org: String(oMed), ...deltaCalc(pMed, oMed) },
                        { label: 'At risk or below', port: `${pAtRisk}%`, org: `${oAtRisk}%`, ...deltaCalc(pAtRisk, oAtRisk, true) },
                        { label: 'Fair', port: `${pFair}%`, org: `${oFair}%`, ...deltaCalc(pFair, oFair) },
                        { label: 'Healthy or above', port: `${pHealthy}%`, org: `${oHealthy}%`, ...deltaCalc(pHealthy, oHealthy) },
                        { label: 'Improving', port: `${pImproved}%`, org: `${oImproved}%`, ...deltaCalc(pImproved, oImproved) },
                      ];

                      const thStyle: React.CSSProperties = { textAlign: 'right', fontWeight: 700, color: '#6B778C', fontSize: '9px', letterSpacing: '0.4px', paddingBottom: '4px', borderBottom: '1.5px solid #DFE1E6' };
                      const tdBase: React.CSSProperties = { padding: '4px 0', fontSize: '11px', borderBottom: '1px solid #F4F5F7' };

                      return (
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {/* Left: Spectrum strips */}
                          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                            {[
                              { label: 'THIS PORTFOLIO', scores: portfolioScores, count: allScores.length, seed: 1 },
                              { label: 'ALL ORG TEAMS', scores: orgScores, count: orgAllScores.length, seed: 2 },
                            ].map((row, ri) => (
                              <div key={ri} style={{ marginBottom: ri === 0 ? '14px' : 0 }}>
                                <div style={{ fontSize: '8px', fontWeight: 700, color: '#5E6C84', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                  {row.label} <span style={{ fontWeight: 500, color: '#8993A4' }}>· {row.count} teams</span>
                                  {orgShowPrevious && <span style={{ fontWeight: 500, color: '#0052CC', marginLeft: '4px' }}>(previous)</span>}
                                </div>
                                <svg width="100%" viewBox={`0 0 ${svgW} ${dotArea + barH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                                  <defs>
                                    <linearGradient id={`orgcomp-grad-${ri}`} x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#DE350B" stopOpacity="0.3" />
                                      <stop offset="30%" stopColor="#FF8B00" stopOpacity="0.3" />
                                      <stop offset="50%" stopColor="#FFAB00" stopOpacity="0.3" />
                                      <stop offset="75%" stopColor="#36B37E" stopOpacity="0.3" />
                                      <stop offset="100%" stopColor="#006644" stopOpacity="0.3" />
                                    </linearGradient>
                                  </defs>
                                  <rect x={0} y={dotArea} width={svgW} height={barH} rx={barH / 2} fill={`url(#orgcomp-grad-${ri})`} />
                                  {row.scores.map((score, i) => (
                                    <circle
                                      key={i}
                                      cx={scoreToX(score)}
                                      cy={jitterY(i, row.seed, dotArea, dotR)}
                                      r={dotR}
                                      fill={getTrustLevel(score).level.color}
                                      opacity={0.65}
                                      style={{ transition: 'cx 0.6s ease-in-out' }}
                                    />
                                  ))}
                                </svg>
                              </div>
                            ))}
                          </div>

                          {/* Right: Comparison table */}
                          <div style={{ flex: '0 0 auto', minWidth: '190px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                              <thead>
                                <tr>
                                  <th style={{ ...thStyle, textAlign: 'left' }}></th>
                                  <th style={{ ...thStyle, paddingLeft: '10px' }}>PORT</th>
                                  <th style={{ ...thStyle, paddingLeft: '10px' }}>ORG</th>
                                  <th style={{ ...thStyle, paddingLeft: '10px' }}>Δ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, i) => (
                                  <tr key={i}>
                                    <td style={{ ...tdBase, fontWeight: 600, color: '#42526E', whiteSpace: 'nowrap' as const, borderBottom: i < rows.length - 1 ? '1px solid #F4F5F7' : 'none', paddingRight: '8px' }}>{row.label}</td>
                                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700, color: '#172B4D', paddingLeft: '10px', borderBottom: i < rows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>{row.port}</td>
                                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 500, color: '#6B778C', paddingLeft: '10px', borderBottom: i < rows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>{row.org}</td>
                                    <td style={{ ...tdBase, textAlign: 'right', fontWeight: 700, color: row.color, paddingLeft: '10px', borderBottom: i < rows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>{row.text}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={{ ...styles.th, textAlign: 'left' as const }}>Team</th>
                  <th style={styles.th}>Overall</th>
                  <th style={styles.th}>Timeliness</th>
                  <th style={styles.th}>Trustworthiness</th>
                  <th style={styles.th}>Freshness</th>
                  <th style={styles.th}>Position</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((team, idx) => {
                  const scores = getTeamLensScores(team);
                  const { level: overallLevel } = getTrustLevel(team.overallHealthScore);
                  const isHovered = hoveredTeamId === team.teamId;

                  // Determine majority trend for this team
                  const dims = team.assessmentResult.dimensions;
                  const tCounts = dims.reduce((acc, d) => {
                    acc[d.trend]++;
                    return acc;
                  }, { improving: 0, stable: 0, declining: 0 } as Record<string, number>);
                  const teamTrend = (tCounts.improving || 0) > (tCounts.declining || 0) ? 'improving'
                    : (tCounts.declining || 0) > (tCounts.improving || 0) ? 'declining' : 'stable';
                  const teamArrow = trendArrow(teamTrend as 'improving' | 'stable' | 'declining');

                  const renderScoreCell = (score: number) => {
                    const { level } = getTrustLevel(score);
                    return (
                      <span style={{ fontSize: '13px', fontWeight: 700, color: level.color }}>
                        {score}
                      </span>
                    );
                  };

                  return (
                    <tr
                      key={team.teamId}
                      style={{
                        ...styles.tr,
                        cursor: 'pointer',
                        backgroundColor: isHovered ? '#F4F5F7' : (idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC'),
                        transition: 'background 0.1s',
                      }}
                      onClick={() => onTeamClick(team.teamId)}
                      onMouseEnter={() => setHoveredTeamId(team.teamId)}
                      onMouseLeave={() => setHoveredTeamId(null)}
                    >
                      <td style={styles.td}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B778C' }}>
                          {idx + 1}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'left' as const }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: overallLevel.color,
                            flexShrink: 0,
                          }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>
                            {team.teamName}
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: overallLevel.color }}>
                            {team.overallHealthScore}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={teamArrow.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {teamTrend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
                            {teamTrend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
                            {teamTrend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
                          </svg>
                        </div>
                      </td>
                      <td style={styles.td}>{renderScoreCell(scores.coverage)}</td>
                      <td style={styles.td}>{renderScoreCell(scores.integrity)}</td>
                      <td style={styles.td}>{renderScoreCell(scores.behavioral)}</td>
                      <td style={styles.td}>
                        <MiniPositionPlot teamScore={team.overallHealthScore} allScores={allScores} />
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#6B778C',
              padding: '3px 8px',
              backgroundColor: tl.bgTint,
              borderRadius: '10px',
              border: `1px solid ${tl.borderTint}`,
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tl.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, color: tl.color }}>{tl.name}</span>
              <span>{tl.range[0]}–{tl.range[1]}</span>
            </span>
          ))}
        </div>
      </main>

      {/* "Can we trust Jira?" Modal — aggregate use-case confidence */}
      {isUseCasesOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsUseCasesOpen(false)}>
          <div style={{ ...styles.modalCard, maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Can we trust our Jira data across {teamResults.length} teams?</h2>
              <button style={styles.modalCloseBtn} onClick={() => setIsUseCasesOpen(false)}>
                <CrossIcon label="Close" size="small" />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ marginTop: 0, marginBottom: '20px', fontSize: '14px', color: '#44546F', lineHeight: 1.6 }}>
                Based on an aggregate trust score of <strong style={{ color: trustLevel.color }}>{overallScore}</strong> across {teamResults.length} teams, here's how reliably the portfolio can use Jira data for each purpose.
              </p>
              {(() => {
                const useCases = [
                  { name: 'Basic task tracking', threshold: 25 },
                  { name: 'Sprint planning', threshold: 45 },
                  { name: 'Velocity reporting', threshold: 60 },
                  { name: 'Capacity planning', threshold: 70 },
                  { name: 'Forecasting', threshold: 80 },
                  { name: 'Cross-team benchmarking', threshold: 88 },
                  { name: 'Strategic reporting', threshold: 95 },
                ];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                    {useCases.map(uc => {
                      const confident = overallScore >= uc.threshold;
                      const borderline = !confident && overallScore >= uc.threshold * 0.75;
                      const color = confident ? '#00875A' : borderline ? '#FF8B00' : '#DE350B';
                      const label = confident ? 'Reliable' : borderline ? 'Use with caution' : 'Not recommended';
                      const symbol = confident ? '\u2713' : borderline ? '~' : '\u2717';
                      // Count teams that meet this threshold
                      const meetCount = teamResults.filter(t => t.overallHealthScore >= uc.threshold).length;
                      return (
                        <div key={uc.name} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#FAFBFC',
                          borderLeft: `3px solid ${color}`,
                        }}>
                          <span style={{ fontSize: '16px', color, fontWeight: 700, width: '20px', textAlign: 'center' as const }}>{symbol}</span>
                          <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{uc.name}</span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color, padding: '2px 8px', borderRadius: '10px', backgroundColor: `${color}12`, border: `1px solid ${color}30` }}>{label}</span>
                          <span style={{ fontSize: '11px', color: '#6B778C', whiteSpace: 'nowrap' as const }}>{meetCount}/{teamResults.length} teams</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.modalCloseButton} onClick={() => setIsUseCasesOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* "How might we improve?" Modal — aggregate improvement roadmap */}
      {isImproveOpen && (() => {
        const lensData = [
          { label: LENS_CONFIG.coverage.label, score: aggregateLens.coverage, lensType: 'coverage' as LensType },
          { label: LENS_CONFIG.integrity.label, score: aggregateLens.integrity, lensType: 'integrity' as LensType },
          { label: LENS_CONFIG.behavioral.label, score: aggregateLens.behavioral, lensType: 'behavioral' as LensType },
        ].sort((a, b) => a.score - b.score);

        const TIPS: Record<string, { quick: string; medium: string; strategic: string }> = {
          coverage: {
            quick: 'Set up required-field rules so tickets can\'t be created without key information like description, acceptance criteria, and priority.',
            medium: 'Run a weekly backlog triage where teams review and fill in incomplete tickets before they enter a sprint.',
            strategic: 'Create issue templates per work type (bug, story, task) that pre-populate required fields and guide contributors.',
          },
          integrity: {
            quick: 'Identify and clean up tickets with placeholder values like "TBD", "N/A", or default story points that were never updated.',
            medium: 'Add validation rules that flag suspiciously uniform fields — e.g., all stories estimated at the same point value.',
            strategic: 'Build a quarterly data-quality review into your process where leads audit a sample of tickets for genuine, meaningful content.',
          },
          behavioral: {
            quick: 'Close or archive tickets that haven\'t been updated in 30+ days — if they\'re still relevant, refresh their status.',
            medium: 'Set up automated reminders for tickets that go stale, nudging assignees to update status, comments, or estimates.',
            strategic: 'Establish a "definition of current" standard: every in-progress ticket must be updated at least once per sprint.',
          },
        };

        // Count struggling teams per lens
        const lensTeamCounts = lensData.map(lens => {
          const count = teamResults.filter(t => {
            const scores = getTeamLensScores(t);
            const lensScore = lens.lensType === 'coverage' ? scores.coverage : lens.lensType === 'integrity' ? scores.integrity : scores.behavioral;
            return lensScore < 50;
          }).length;
          return count;
        });

        return (
          <div style={styles.modalOverlay} onClick={() => setIsImproveOpen(false)}>
            <div style={{ ...styles.modalCard, maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>How might we improve across {teamResults.length} teams?</h2>
                <button style={styles.modalCloseBtn} onClick={() => setIsImproveOpen(false)}>
                  <CrossIcon label="Close" size="small" />
                </button>
              </div>
              <div style={styles.modalBody}>
                <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#44546F', lineHeight: 1.6 }}>
                  Based on aggregate scores, here's a prioritised roadmap. Focus areas are ordered by impact — start with the weakest dimension and work up.
                </p>
                {lensData.map((lens, i) => {
                  const { level } = getTrustLevel(lens.score);
                  const tips = TIPS[lens.lensType];
                  return (
                    <div key={lens.lensType} style={{ borderLeft: `4px solid ${level.color}`, borderRadius: '8px', backgroundColor: '#FAFBFC', padding: '16px 20px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#6B778C', backgroundColor: '#EBECF0', padding: '2px 8px', borderRadius: '4px' }}>
                          Priority {i + 1}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: level.color, flex: 1 }}>{lens.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6B778C' }}>{lens.score}/100</span>
                        <span style={{ fontSize: '11px', color: '#DE350B', fontWeight: 500 }}>{lensTeamCounts[i]} teams below 50</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                        {[
                          { tag: 'Quick win', bg: '#E3FCEF', color: '#006644', text: tips.quick },
                          { tag: 'Medium term', bg: '#DEEBFF', color: '#0052CC', text: tips.medium },
                          { tag: 'Strategic', bg: '#EAE6FF', color: '#6554C0', text: tips.strategic },
                        ].map(tip => (
                          <div key={tip.tag} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: tip.bg, color: tip.color, whiteSpace: 'nowrap' as const, marginTop: '2px' }}>{tip.tag}</span>
                            <span style={{ fontSize: '13px', color: '#44546F', lineHeight: 1.55 }}>{tip.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={styles.modalFooter}>
                <button style={styles.modalCloseButton} onClick={() => setIsImproveOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TeamOfTeamsLayout;

// ── Styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#F4F5F7',
  },
  header: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
    padding: '0 32px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 32px 48px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  // Hero card
  heroCard: {
    position: 'relative' as const,
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  accentBar: {
    height: '5px',
  },
  heroTop: {
    position: 'relative' as const,
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute' as const,
    top: '-40px',
    right: '-30px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(255, 139, 0, 0.06)',
    border: '1px solid rgba(255, 139, 0, 0.08)',
  },
  heroDecor2: {
    position: 'absolute' as const,
    bottom: '-20px',
    left: '-40px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(0, 82, 204, 0.04)',
    border: '1px solid rgba(0, 82, 204, 0.06)',
  },
  heroColumns: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    minHeight: '260px',
    padding: '24px 36px 24px 56px',
    gap: '32px',
  },
  questionContent: {
    position: 'relative' as const,
    zIndex: 1,
    flex: '1 1 0%',
    maxWidth: '600px',
  },
  questionEyebrow: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 800,
    letterSpacing: '2px',
    color: '#BF6A02',
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
  },
  questionText: {
    margin: '0 0 16px',
    fontSize: '28px',
    fontWeight: 800,
    lineHeight: 1.25,
    color: '#172B4D',
    letterSpacing: '-0.5px',
  },
  questionSubtext: {
    margin: '0 0 16px',
    fontSize: '14px',
    lineHeight: 1.7,
    color: '#44546F',
    fontWeight: 400,
  },
  dualActionBar: {
    display: 'inline-flex',
    alignItems: 'stretch',
    borderRadius: '8px',
    border: '1px solid rgba(9, 30, 66, 0.12)',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    overflow: 'hidden' as const,
    marginTop: '12px',
  },
  dualBtnLeft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    border: 'none',
    background: 'transparent',
    color: '#172B4D',
    fontSize: '12.5px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  dualDivider: {
    width: '1px',
    backgroundColor: 'rgba(9, 30, 66, 0.1)',
    margin: '6px 0',
  },
  dualBtnRight: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    border: 'none',
    background: 'transparent',
    color: '#172B4D',
    fontSize: '12.5px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  heroDivider: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: '0',
    padding: '16px 0',
  },
  heroDividerLine: {
    flex: 1,
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, rgba(255, 139, 0, 0.25), rgba(255, 139, 0, 0.35))',
  },
  heroDividerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    transform: 'rotate(45deg)',
    background: 'rgba(255, 139, 0, 0.3)',
    border: '1px solid rgba(255, 139, 0, 0.15)',
    margin: '8px 0',
    flexShrink: 0,
  },
  scoreFloat: {
    position: 'relative' as const,
    zIndex: 1,
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0',
    marginLeft: '16px',
  },
  scoreLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#8993A4',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  },
  scoreDisc: {
    position: 'relative' as const,
    width: '186px',
    height: '186px',
  },
  scoreDiscBg: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 6px 40px rgba(9, 30, 66, 0.10), 0 0 0 1px rgba(9, 30, 66, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  scoreContent: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  scoreNumber: {
    fontSize: '64px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-3px',
  },
  breakdownPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: '200px',
  },
  breakdownTitle: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#97A0AF',
    letterSpacing: '1.2px',
    marginBottom: '10px',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  breakdownRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '6px 8px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left' as const,
    transition: 'background 0.15s',
  },
  barTrack: {
    width: '100%',
    height: '5px',
    borderRadius: '3px',
    background: 'rgba(9, 30, 66, 0.06)',
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  // Table section
  tableSection: {
    background: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  tableTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    padding: '20px 24px 0',
  },
  tableTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },
  tableSubtitle: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 500,
  },
  // Stats banner
  statsBanner: {
    display: 'flex',
    flexDirection: 'column' as const,
    margin: '16px 16px 0',
    background: 'linear-gradient(135deg, #EAF0FB 0%, #F0F4FA 50%, #EEF1F8 100%)',
    borderRadius: '12px',
    border: '1px solid #C7D2E0',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08), 0 0 1px rgba(9, 30, 66, 0.12)',
    overflow: 'hidden' as const,
  },
  statsDistRow: {
    padding: '16px 24px 14px',
  },
  statsInsightsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    borderTop: '1px solid #EBECF0',
  },
  statsInsightTile: {
    padding: '16px 20px',
    borderRight: '1px solid #D5D9E0',
  },
  statsSectionLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#7A869A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    marginBottom: '6px',
    display: 'block',
  },
  tableWrapper: {
    padding: '12px 0',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    padding: '8px 16px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #EBECF0',
    whiteSpace: 'nowrap' as const,
  },
  tr: {},
  td: {
    padding: '10px 16px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #F4F5F7',
    whiteSpace: 'nowrap' as const,
  },
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
  },
  modalCloseButton: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
