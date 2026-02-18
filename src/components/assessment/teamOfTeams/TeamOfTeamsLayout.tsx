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
                {/* ── ROW 1: Portfolio Health Distribution Bar ── */}
                <div style={styles.statsDistRow}>
                  <span style={styles.statsSectionLabel}>PORTFOLIO HEALTH DISTRIBUTION</span>
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
                          {atRiskTeams.map(team => {
                            const { level } = getTrustLevel(team.overallHealthScore);
                            return (
                              <div key={team.teamId} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: level.color, flexShrink: 0 }} />
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#172B4D', flex: 1 }}>{team.teamName}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: level.color }}>{team.overallHealthScore}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tile 3: Trend + Score Distribution */}
                  <div style={styles.statsInsightTile}>
                    <div style={styles.statsSectionLabel}>TREND</div>
                    {/* Trend counts — proper sizing */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00875A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#00875A' }}>{teamsImproving}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>improved</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8993A4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#8993A4' }}>{teamsStable}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>stable</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#DE350B' }}>{teamsDeclining}</span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C' }}>declined</span>
                      </div>
                    </div>
                    {/* Divider */}
                    <div style={{ height: '1px', background: '#EBECF0', margin: '10px 0 8px' }} />
                    {/* Score distribution — density ridge over gradient */}
                    <div style={styles.statsSectionLabel}>SCORE SPREAD</div>
                    {(() => {
                      const w = 1000;
                      const curveH = 60;
                      const barH = 10;
                      const barY = curveH;
                      const totalH = curveH + barH;
                      // Kernel density estimation (Gaussian, bandwidth ~8)
                      const bw = 8;
                      const steps = 100;
                      const density: number[] = [];
                      let maxD = 0;
                      for (let i = 0; i <= steps; i++) {
                        const x = (i / steps) * 100;
                        let d = 0;
                        allScores.forEach(s => {
                          const z = (x - s) / bw;
                          d += Math.exp(-0.5 * z * z);
                        });
                        density.push(d);
                        if (d > maxD) maxD = d;
                      }
                      // Build SVG path for the density curve
                      const points = density.map((d, i) => {
                        const x = (i / steps) * w;
                        const y = curveH - (maxD > 0 ? (d / maxD) * (curveH - 4) : 0);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });
                      const areaPath = `M0,${curveH} L${points.join(' L')} L${w},${curveH} Z`;
                      // Median line
                      const sortedScores = [...allScores].sort((a, b) => a - b);
                      const mid = sortedScores.length;
                      const median = mid % 2 === 0
                        ? (sortedScores[mid / 2 - 1] + sortedScores[mid / 2]) / 2
                        : sortedScores[Math.floor(mid / 2)];
                      const medianX = (median / 100) * w;
                      // Spread stats
                      const minScore = sortedScores[0];
                      const maxScore = sortedScores[sortedScores.length - 1];
                      const range = maxScore - minScore;
                      const mean = allScores.reduce((a, b) => a + b, 0) / allScores.length;
                      const stdDev = Math.round(Math.sqrt(allScores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / allScores.length));
                      // IQR
                      const q1Idx = Math.floor(sortedScores.length * 0.25);
                      const q3Idx = Math.floor(sortedScores.length * 0.75);
                      const iqr = sortedScores[q3Idx] - sortedScores[q1Idx];
                      return (
                        <>
                        <svg width="100%" viewBox={`0 0 ${w} ${totalH}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', marginTop: '4px' }}>
                          <defs>
                            <linearGradient id="tot-dist-grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#DE350B" />
                              <stop offset="25%" stopColor="#FF8B00" />
                              <stop offset="50%" stopColor="#FFAB00" />
                              <stop offset="75%" stopColor="#2684FF" />
                              <stop offset="90%" stopColor="#00875A" />
                              <stop offset="100%" stopColor="#006644" />
                            </linearGradient>
                            <linearGradient id="tot-curve-grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#DE350B" stopOpacity="0.18" />
                              <stop offset="25%" stopColor="#FF8B00" stopOpacity="0.18" />
                              <stop offset="50%" stopColor="#FFAB00" stopOpacity="0.18" />
                              <stop offset="75%" stopColor="#2684FF" stopOpacity="0.18" />
                              <stop offset="90%" stopColor="#00875A" stopOpacity="0.18" />
                              <stop offset="100%" stopColor="#006644" stopOpacity="0.18" />
                            </linearGradient>
                            <linearGradient id="tot-stroke-grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#DE350B" stopOpacity="0.5" />
                              <stop offset="25%" stopColor="#FF8B00" stopOpacity="0.5" />
                              <stop offset="50%" stopColor="#FFAB00" stopOpacity="0.5" />
                              <stop offset="75%" stopColor="#2684FF" stopOpacity="0.5" />
                              <stop offset="90%" stopColor="#00875A" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#006644" stopOpacity="0.5" />
                            </linearGradient>
                          </defs>
                          {/* Filled density area */}
                          <path d={areaPath} fill="url(#tot-curve-grad)" />
                          {/* Density outline */}
                          <polyline points={points.join(' ')} fill="none" stroke="url(#tot-stroke-grad)" strokeWidth={2} />
                          {/* Gradient bar */}
                          <rect x={0} y={barY} width={w} height={barH} rx={barH / 2} fill="url(#tot-dist-grad)" opacity={0.45} />
                          {/* Median marker */}
                          <line x1={medianX} y1={4} x2={medianX} y2={barY + barH} stroke="#42526E" strokeWidth={2} strokeDasharray="6,4" opacity={0.35} />
                          {/* Individual team tick marks on the bar */}
                          {allScores.map((score, i) => {
                            const x = (score / 100) * w;
                            const { level } = getTrustLevel(score);
                            return (
                              <line key={i} x1={x} y1={barY - 1} x2={x} y2={barY + barH + 1}
                                stroke={level.color} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
                            );
                          })}
                        </svg>
                        {/* Spread stats row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 2px' }}>
                          <div style={{ textAlign: 'center' as const }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: getTrustLevel(Math.round(median)).level.color }}>{Math.round(median)}</span>
                            <span style={{ fontSize: '9px', fontWeight: 500, color: '#8993A4', marginLeft: '2px' }}>median</span>
                          </div>
                          <div style={{ textAlign: 'center' as const }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#42526E' }}>{minScore}–{maxScore}</span>
                            <span style={{ fontSize: '9px', fontWeight: 500, color: '#8993A4', marginLeft: '2px' }}>range</span>
                          </div>
                          <div style={{ textAlign: 'center' as const }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#42526E' }}>{iqr}</span>
                            <span style={{ fontSize: '9px', fontWeight: 500, color: '#8993A4', marginLeft: '2px' }}>IQR</span>
                          </div>
                          <div style={{ textAlign: 'center' as const }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: stdDev > 15 ? '#FF8B00' : '#42526E' }}>±{stdDev}</span>
                            <span style={{ fontSize: '9px', fontWeight: 500, color: '#8993A4', marginLeft: '2px' }}>std dev</span>
                          </div>
                        </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Tile 4: Top & Bottom */}
                  <div style={{ ...styles.statsInsightTile, borderRight: 'none' }}>
                    <div style={styles.statsSectionLabel}>TOP &amp; BOTTOM</div>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px', marginTop: '2px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#00875A', background: '#E3FCEF', padding: '1px 6px', borderRadius: '4px' }}>BEST</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{topTeam.teamName}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: getTrustLevel(topTeam.overallHealthScore).level.color, marginLeft: 'auto' }}>{topTeam.overallHealthScore}</span>
                        </div>
                      </div>
                      <div style={{ height: '1px', background: '#EBECF0' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#DE350B', background: '#FFEBE6', padding: '1px 6px', borderRadius: '4px' }}>LOW</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#172B4D' }}>{bottomTeam.teamName}</span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: getTrustLevel(bottomTeam.overallHealthScore).level.color, marginLeft: 'auto' }}>{bottomTeam.overallHealthScore}</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B778C', marginTop: '4px', lineHeight: 1.4 }}>{scoreGap}pt gap between top and bottom</div>
                      </div>
                    </div>
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
    borderRight: '1px solid #EBECF0',
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
