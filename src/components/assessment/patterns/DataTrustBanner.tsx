import React, { useState } from 'react';
import { AssessmentLensResults, LensType, OverallSeverity, PatternDetectionResult } from '../../../types/patterns';
import { TrendDataPoint, ComparisonTeam } from '../../../types/assessment';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import HeroInfoButton from '../../common/HeroInfoButton';

// ── Trust Levels ────────────────────────────────────────────────────
export interface TrustLevel {
  name: string;
  range: [number, number];
  color: string;
  bgTint: string;
  borderTint: string;
  description: string;
}

export const TRUST_LEVELS: TrustLevel[] = [
  { name: 'Critical',  range: [0, 25],   color: '#DE350B', bgTint: '#FFEBE6',               borderTint: '#FFBDAD', description: 'critical data gaps that undermine decision-making' },
  { name: 'At Risk',   range: [26, 50],  color: '#FF8B00', bgTint: '#FFF7ED',               borderTint: '#FFE380', description: 'data gaps common enough to cause problems' },
  { name: 'Fair',      range: [51, 75],  color: '#2684FF', bgTint: '#DEEBFF',               borderTint: '#B3D4FF', description: 'emerging data practices with room for improvement' },
  { name: 'Healthy',   range: [76, 90],  color: '#00875A', bgTint: '#E3FCEF',               borderTint: '#79F2C0', description: 'strong and reliable information practices' },
  { name: 'Optimal',   range: [91, 100], color: '#006644', bgTint: '#E3FCEF',               borderTint: '#ABF5D1', description: 'high-confidence data suitable for strategic decisions' },
];

export function getTrustLevel(composite: number): { level: TrustLevel; index: number } {
  for (let i = 0; i < TRUST_LEVELS.length; i++) {
    const l = TRUST_LEVELS[i];
    if (composite >= l.range[0] && composite <= l.range[1]) {
      return { level: l, index: i };
    }
  }
  return { level: TRUST_LEVELS[0], index: 0 };
}

// ── Score Computation ───────────────────────────────────────────────
export function computeLensScores(lensResults: AssessmentLensResults, integrityScore: number) {
  const coverage = Math.round(lensResults.coverage.coveragePercent);
  const integrity = Math.round(integrityScore);
  const timingLens = lensResults.timing;
  const timing = timingLens.patternsChecked > 0
    ? Math.round((1 - timingLens.patternsDetected / timingLens.patternsChecked) * 100)
    : 100;
  const behavioralLens = lensResults.behavioral;
  const behavioral = behavioralLens.patternsChecked > 0
    ? Math.round((1 - behavioralLens.patternsDetected / behavioralLens.patternsChecked) * 100)
    : 100;

  const composite = Math.round(
    coverage * 0.3 + integrity * 0.3 + timing * 0.2 + behavioral * 0.2
  );

  return { coverage, integrity, timing, behavioral, composite };
}

// ── Pattern Insights ────────────────────────────────────────────────
export function aggregatePatternInsights(lensResults: AssessmentLensResults) {
  const allResults: PatternDetectionResult[] = [
    ...lensResults.integrity.results,
    ...lensResults.timing.results,
    ...lensResults.behavioral.results,
  ];
  const detected = allResults.filter(r => r.detected);

  const criticalCount = detected.filter(r => r.severity === 'critical').length;
  const warningCount = detected.filter(r => r.severity === 'warning').length;

  const totalAffected = detected.reduce((sum, r) => sum + r.affectedIssueCount, 0);

  const severityRank: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  const topFinding = detected.length > 0
    ? [...detected].sort((a, b) =>
        severityRank[a.severity] - severityRank[b.severity]
        || b.affectedIssueCount - a.affectedIssueCount
      )[0]
    : null;

  return { criticalCount, warningCount, totalAffected, topFinding };
}

// ── Insight Bullets ─────────────────────────────────────────────────
export interface InsightBullet {
  label: string;
  labelColor: string;
  labelBg: string;
  text: string;
}

export const SEVERITY_PILLS: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' },
  atRisk:   { label: 'At Risk',  color: '#FF8B00', bg: '#FFF7ED' },
  fair:     { label: 'Fair',     color: '#2684FF', bg: '#DEEBFF' },
  healthy:  { label: 'Healthy',  color: '#00875A', bg: '#E3FCEF' },
};

export type ReliabilityStatus = 'reliable' | 'caution' | 'not-recommended';

export const JIRA_USE_CASES = [
  'Basic task tracking & status updates',
  'Sprint planning & backlog management',
  'Velocity & throughput reporting',
  'Capacity planning',
  'Forecasting & delivery predictions',
  'Cross-team benchmarking',
  'Executive & strategic reporting',
];

export const RELIABILITY_STYLES: Record<ReliabilityStatus, { color: string; symbol: string; label: string }> = {
  reliable:          { color: '#00875A', symbol: '\u2713', label: 'Reliable' },
  caution:           { color: '#FF8B00', symbol: '~', label: 'Use with caution' },
  'not-recommended': { color: '#DE350B', symbol: '\u2717', label: 'Not recommended' },
};

export const TRUST_RELIABILITY: Record<string, ReliabilityStatus[]> = {
  'Critical':  ['caution','not-recommended','not-recommended','not-recommended','not-recommended','not-recommended','not-recommended'],
  'At Risk':   ['reliable','caution','not-recommended','not-recommended','not-recommended','not-recommended','not-recommended'],
  'Fair':      ['reliable','reliable','caution','caution','not-recommended','not-recommended','caution'],
  'Healthy':   ['reliable','reliable','reliable','reliable','caution','caution','reliable'],
  'Optimal':   ['reliable','reliable','reliable','reliable','reliable','reliable','reliable'],
};

export function getReliabilityStatuses(levelName: string): ReliabilityStatus[] {
  return TRUST_RELIABILITY[levelName] ?? TRUST_RELIABILITY['Critical'];
}

// ── Lens Config ─────────────────────────────────────────────────────
export const LENS_CONFIG: Record<LensType, { label: string; icon: string; description: string }> = {
  coverage:    { label: 'Timeliness',       icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z', description: 'Does data arrive before the decisions it needs to inform?' },
  integrity:   { label: 'Trustworthiness',  icon: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.58L18 9.5l-7 7z', description: 'Can you rely on field values to reflect genuine work activity?' },
  timing:      { label: 'Timing',           icon: 'M3 3h18v18H3V3zm2 2v14h14V5H14v6l-2.5-1.5L9 11V5H5z', description: 'Was information available when decisions were made?' },
  behavioral:  { label: 'Freshness',         icon: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', description: 'Does your data reflect how things actually stand right now?' },
};

export const LENS_SEVERITY_STYLES: Record<OverallSeverity, { color: string; bgColor: string; label: string; icon: string }> = {
  critical: { color: '#DE350B', bgColor: '#FFEBE6', label: 'Critical', icon: '\u26D4' },
  warning:  { color: '#FF8B00', bgColor: '#FFFAE6', label: 'Warning',  icon: '\u26A0' },
  clean:    { color: '#00875A', bgColor: '#E3FCEF', label: 'Clean',    icon: '\u2713' },
};

export function getCoverageSeverity(percent: number): OverallSeverity {
  if (percent >= 70) return 'clean';
  if (percent >= 45) return 'warning';
  return 'critical';
}

export function generateInsights(
  scores: ReturnType<typeof computeLensScores>,
  insights: ReturnType<typeof aggregatePatternInsights>,
): InsightBullet[] {
  const bullets: InsightBullet[] = [];

  const covPill = scores.coverage < 45 ? SEVERITY_PILLS.critical
    : scores.coverage < 60 ? SEVERITY_PILLS.atRisk
    : scores.coverage < 75 ? SEVERITY_PILLS.fair
    : SEVERITY_PILLS.healthy;
  bullets.push({
    label: covPill.label,
    labelColor: covPill.color,
    labelBg: covPill.bg,
    text: scores.coverage < 50
      ? `${scores.coverage}% field coverage \u2014 nearly half of critical fields lack values`
      : scores.coverage < 70
        ? `${scores.coverage}% field coverage \u2014 a notable portion of critical fields are incomplete`
        : `${scores.coverage}% field coverage \u2014 most critical fields are populated`,
  });

  const patternParts: string[] = [];
  if (insights.criticalCount > 0) patternParts.push(`${insights.criticalCount} critical`);
  if (insights.warningCount > 0) patternParts.push(`${insights.warningCount} warning`);
  if (patternParts.length > 0) {
    const total = insights.criticalCount + insights.warningCount;
    const pill = insights.criticalCount > 0 ? SEVERITY_PILLS.critical : SEVERITY_PILLS.atRisk;
    bullets.push({
      label: pill.label,
      labelColor: pill.color,
      labelBg: pill.bg,
      text: `${patternParts.join(' and ')} pattern${total !== 1 ? 's' : ''} detected across ${insights.totalAffected} issues`,
    });
  }

  const lensNames: Record<string, string> = { coverage: 'Field Completeness', integrity: 'Integrity', timing: 'Timing', behavioral: 'Behavioral' };
  const lensScores = [
    { key: 'coverage', score: scores.coverage },
    { key: 'integrity', score: scores.integrity },
    { key: 'timing', score: scores.timing },
    { key: 'behavioral', score: scores.behavioral },
  ];
  const worst = lensScores.reduce((a, b) => a.score < b.score ? a : b);
  if (worst.score < 50) {
    const pill = worst.score < 30 ? SEVERITY_PILLS.critical : SEVERITY_PILLS.atRisk;
    bullets.push({
      label: pill.label,
      labelColor: pill.color,
      labelBg: pill.bg,
      text: `${lensNames[worst.key]} is the weakest lens at ${worst.score}%`,
    });
  }

  if (insights.topFinding) {
    const summary = insights.topFinding.summary.length > 120
      ? insights.topFinding.summary.slice(0, 117) + '...'
      : insights.topFinding.summary;
    const pill = insights.topFinding.severity === 'critical' ? SEVERITY_PILLS.critical : SEVERITY_PILLS.atRisk;
    bullets.push({
      label: pill.label,
      labelColor: pill.color,
      labelBg: pill.bg,
      text: summary,
    });
  }

  return bullets;
}

// ── Weakest Lens Helper ────────────────────────────────────────────
export function getWeakestLens(scores: ReturnType<typeof computeLensScores>) {
  const lenses: { key: string; label: string; score: number; lensType: LensType }[] = [
    { key: 'coverage', label: LENS_CONFIG.coverage.label, score: scores.coverage, lensType: 'coverage' },
    { key: 'integrity', label: LENS_CONFIG.integrity.label, score: scores.integrity, lensType: 'integrity' },
    { key: 'timing', label: LENS_CONFIG.timing.label, score: scores.timing, lensType: 'timing' },
    { key: 'behavioral', label: LENS_CONFIG.behavioral.label, score: scores.behavioral, lensType: 'behavioral' },
  ];
  return lenses.reduce((a, b) => a.score < b.score ? a : b);
}

// ── Required Level Helper ──────────────────────────────────────────
export function getRequiredLevelForReliable(useCaseIndex: number): string | null {
  const levelOrder = ['Critical', 'At Risk', 'Fair', 'Healthy', 'Optimal'];
  for (const levelName of levelOrder) {
    const statuses = TRUST_RELIABILITY[levelName];
    if (statuses && statuses[useCaseIndex] === 'reliable') {
      return levelName;
    }
  }
  return null;
}

// ── Confidence Computation ──────────────────────────────────────────
const USE_CASE_THRESHOLDS = [25, 45, 60, 70, 80, 88, 95];

function getConfidence(composite: number, threshold: number): number {
  if (composite >= threshold) return Math.min(98, Math.round(80 + (composite - threshold) / (100 - threshold) * 20));
  return Math.max(5, Math.round((composite / threshold) * 75));
}

const CONFIDENCE_SHORT_NAMES = [
  'Task tracking',
  'Sprint planning',
  'Velocity reporting',
  'Capacity planning',
  'Forecasting',
  'Benchmarking',
  'Strategic reporting',
];

function getConfidenceLabel(status: ReliabilityStatus, confidence: number): { label: string; color: string } {
  if (status === 'reliable') return { label: 'High', color: '#00875A' };
  if (status === 'caution') return { label: 'Moderate', color: '#FF8B00' };
  if (confidence >= 30) return { label: 'Low', color: '#DE350B' };
  return { label: 'Very low', color: '#BF2600' };
}

// ── Mock Trend Data ─────────────────────────────────────────────────
// Spans Critical → At Risk to show multi-category colour transitions
const MOCK_COMPOSITE_TREND: TrendDataPoint[] = [
  { period: '2025-05-12', value: 18, healthScore: 18 },
  { period: '2025-06-09', value: 23, healthScore: 23 },
  { period: '2025-07-14', value: 30, healthScore: 30 },
  { period: '2025-08-11', value: 35, healthScore: 35 },
  { period: '2025-09-08', value: 38, healthScore: 38 },
  { period: '2025-10-13', value: 41, healthScore: 41 },
  { period: '2025-11-10', value: 44, healthScore: 44 },
  { period: '2025-12-08', value: 46, healthScore: 46 },
];

function computeTrend(data: TrendDataPoint[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  const first = data[0].healthScore ?? data[0].value;
  const last = data[data.length - 1].healthScore ?? data[data.length - 1].value;
  const firstLevel = getTrustLevel(first).index;
  const lastLevel = getTrustLevel(last).index;
  if (lastLevel > firstLevel) return 'up';
  if (lastLevel < firstLevel) return 'down';
  return 'stable';
}

// ── Chart coordinate helpers ─────────────────────────────────────────
const CHART_W = 800;
const CHART_H = 290;
const CHART_START_X = 48;
const CHART_END_X = 752;

const MONTH_ABBRS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Format a period string into a compact date label.
 *  "2025-05-12" → "12 May"   |   "2025-05" → "May '25" */
function formatPeriodLabel(period: string): string {
  const parts = period.split('-');
  const monthIdx = parseInt(parts[1], 10) - 1;
  const mon = MONTH_ABBRS[monthIdx] || '';
  if (parts[2]) {
    const day = parseInt(parts[2], 10);
    return `${day} ${mon}`;
  }
  return `${mon} '${parts[0].slice(2)}`;
}

function computeChartPoints(data: TrendDataPoint[]) {
  const step = data.length > 1 ? (CHART_END_X - CHART_START_X) / (data.length - 1) : 0;
  return data.map((d, i) => ({
    x: CHART_START_X + i * step,
    y: CHART_H * (1 - (d.healthScore ?? d.value) / 100),
    value: d.healthScore ?? d.value,
    period: d.period,
  }));
}

// ── Chart Backdrop Sub-component (multi-colour area fill + line) ─────
const ChartBackdrop: React.FC<{ points: { x: number; y: number; value: number }[] }> = ({ points }) => {
  const getColor = (v: number) => getTrustLevel(v).level.color;

  return (
    <svg style={styles.chartBackdrop} viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
      <defs>
        {points.map((p, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          const c1 = getColor(prev.value);
          const c2 = getColor(p.value);
          return (
            <React.Fragment key={`defs-${i}`}>
              <linearGradient id={`seg-line-${i}`} x1={prev.x} y1="0" x2={p.x} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
              <linearGradient id={`seg-area-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c2} stopOpacity={0.12} />
                <stop offset="100%" stopColor={c2} stopOpacity={0.01} />
              </linearGradient>
            </React.Fragment>
          );
        })}
      </defs>
      {/* Area fills per segment */}
      {points.map((p, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        const pts = `${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${CHART_H - 20} ${prev.x.toFixed(1)},${CHART_H - 20}`;
        return <polygon key={`area-${i}`} points={pts} fill={`url(#seg-area-${i})`} />;
      })}
      {/* Line segments with gradient transitions */}
      {points.map((p, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        return (
          <line key={`line-${i}`}
            x1={prev.x.toFixed(1)} y1={prev.y.toFixed(1)}
            x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
            stroke={`url(#seg-line-${i})`}
            strokeWidth={2} strokeLinecap="round" opacity={0.5}
          />
        );
      })}
    </svg>
  );
};

// ── Chart Data Points Overlay (HTML — stays crisp) ──────────────────
const ChartDataPoints: React.FC<{ points: { x: number; y: number; value: number; period: string }[] }> = ({ points }) => (
  <div style={styles.dataPointOverlay}>
    {points.map((p, i) => {
      const pointColor = getTrustLevel(p.value).level.color;
      const leftPct = (p.x / CHART_W) * 100;
      const topPct = (p.y / CHART_H) * 100;
      const isLast = i === points.length - 1;
      // Hide labels that would be behind the centered score disc
      const isBehindDisc = leftPct > 33 && leftPct < 67;
      const dateLabel = formatPeriodLabel(p.period);

      return (
        <React.Fragment key={i}>
          {/* Dot */}
          <div style={{
            position: 'absolute' as const,
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: 'translate(-50%, -50%)',
            width: isLast ? 8 : 7,
            height: isLast ? 8 : 7,
            borderRadius: '50%',
            background: pointColor,
            border: `${isLast ? 2 : 1.5}px solid #fff`,
            opacity: isLast ? 0.65 : 0.5,
            zIndex: 1,
          }} />
          {/* Value label above dot */}
          {!isBehindDisc && (
            <span style={{
              position: 'absolute' as const,
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: 'translate(-50%, calc(-100% - 6px))',
              fontSize: '13px',
              fontWeight: 700,
              color: pointColor,
              opacity: isLast ? 0.9 : 0.7,
              whiteSpace: 'nowrap' as const,
              pointerEvents: 'none' as const,
              zIndex: 1,
            }}>
              {p.value}
            </span>
          )}
          {/* Month label below dot */}
          {!isBehindDisc && (
            <span style={{
              position: 'absolute' as const,
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: 'translate(-50%, 8px)',
              fontSize: '8.5px',
              fontWeight: 700,
              color: pointColor,
              opacity: isLast ? 0.6 : 0.45,
              letterSpacing: '0.3px',
              textTransform: 'uppercase' as const,
              whiteSpace: 'nowrap' as const,
              pointerEvents: 'none' as const,
              zIndex: 1,
            }}>
              {dateLabel}
            </span>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Confidence Gauges Sub-component ─────────────────────────────────
const ConfidenceGauges: React.FC<{ composite: number; reliabilityStatuses: ReliabilityStatus[] }> = ({ composite, reliabilityStatuses }) => {
  const arcRadius = 26;
  const totalArc = Math.PI * arcRadius; // ~81.68

  return (
    <div style={styles.confidenceSection}>
      <div style={styles.confidenceTitle}>
        How confidently can you use your Jira data for each purpose?
      </div>
      <div style={styles.gaugeRow}>
        {CONFIDENCE_SHORT_NAMES.map((name, i) => {
          const confidence = getConfidence(composite, USE_CASE_THRESHOLDS[i]);
          const status = reliabilityStatuses[i];
          const { label, color } = getConfidenceLabel(status, confidence);
          const filled = (confidence / 100) * totalArc;

          return (
            <div key={i} style={{
              ...styles.gaugeTile,
              background: `${color}0A`,
              borderColor: `${color}14`,
            }}>
              <svg width={64} height={40} viewBox="0 0 64 40" style={{ display: 'block' }}>
                <path d="M 6,34 A 26,26 0 0,1 58,34" fill="none" stroke="#EBECF0" strokeWidth={5.5} strokeLinecap="round" />
                <path d="M 6,34 A 26,26 0 0,1 58,34" fill="none" stroke={color} strokeWidth={5.5} strokeLinecap="round"
                  strokeDasharray={`${filled.toFixed(1)} ${totalArc.toFixed(1)}`} />
              </svg>
              <span style={{ ...styles.gaugePct, color }}>{confidence}%</span>
              <span style={styles.gaugeName}>{name}</span>
              <span style={{ ...styles.gaugeStatus, color }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Team Comparison Modal ────────────────────────────────────────────
interface TeamComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  composite: number;
  trustLevelColor: string;
  comparisonTeams: ComparisonTeam[];
  comparisonTeamCount: number;
}

const TeamComparisonModal: React.FC<TeamComparisonModalProps> = ({
  isOpen, onClose, composite, trustLevelColor, comparisonTeams, comparisonTeamCount,
}) => {
  if (!isOpen) return null;

  const teamsAhead = Math.round((1 - composite / 100) * comparisonTeamCount);
  const yourRank = teamsAhead + 1;

  // Generate mock peer positions using seeded random
  const seed = 'composite-trust'.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const peerPositions: number[] = [];
  for (let i = 0; i < comparisonTeamCount; i++) {
    const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
    const normalized = pseudoRandom - Math.floor(pseudoRandom);
    peerPositions.push(Math.max(5, Math.min(95, normalized * 100)));
  }
  const sorted = [...peerPositions].sort((a, b) => a - b);
  const peerMin = sorted[0] ?? 0;
  const peerMax = sorted[sorted.length - 1] ?? 100;
  const peerMedian = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 50;

  // Build ranked team lists
  const ranksToAssign = Array.from({ length: comparisonTeamCount }, (_, i) => i + 1)
    .filter(r => r !== yourRank);
  const shuffledRanks = [...ranksToAssign].sort((a, b) => {
    const teamA = comparisonTeams[ranksToAssign.indexOf(a) % comparisonTeams.length];
    const teamB = comparisonTeams[ranksToAssign.indexOf(b) % comparisonTeams.length];
    return (teamA?.name || '').localeCompare(teamB?.name || '');
  });
  const teamsWithRanks = comparisonTeams.map((team, idx) => ({
    ...team,
    rank: shuffledRanks[idx % shuffledRanks.length] || idx + 1,
  })).sort((a, b) => a.rank - b.rank);
  const betterTeams = teamsWithRanks.filter(t => t.rank < yourRank);
  const worseTeams = teamsWithRanks.filter(t => t.rank > yourRank);

  return (
    <div style={styles.compareOverlay} onClick={onClose}>
      <div style={styles.compareModal} onClick={e => e.stopPropagation()}>
        <div style={styles.compareHeader}>
          <h2 style={styles.compareTitle}>Data Trust — Team Comparison</h2>
          <button style={styles.compareCloseBtn} onClick={onClose}>
            <CrossIcon label="Close" size="small" />
          </button>
        </div>
        <div style={styles.compareBody}>
          <p style={styles.compareIntro}>
            Your team is ranked <strong>#{yourRank}</strong> of {comparisonTeamCount + 1} for overall Data Trust.
          </p>

          {/* Spectrum */}
          <div style={styles.spectrumContainer}>
            <div style={styles.spectrumLabel}>Peer Score Distribution</div>
            <div style={styles.spectrumBarWrap}>
              <div style={styles.spectrumTrack} />
              <span style={styles.spectrumMin}>0</span>
              <span style={styles.spectrumMax}>100</span>
              <div style={{
                ...styles.spectrumRangeBand,
                left: `${peerMin}%`,
                width: `${peerMax - peerMin}%`,
              }} />
              <div style={{
                ...styles.spectrumMedianTick,
                left: `${peerMedian}%`,
              }} />
              <div style={{
                ...styles.spectrumYourMarker,
                left: `${composite}%`,
                backgroundColor: trustLevelColor,
                boxShadow: `0 0 0 3px ${trustLevelColor}40`,
              }} />
            </div>
            <div style={styles.spectrumLegend}>
              <span style={styles.spectrumLegendItem}>
                <span style={{ ...styles.spectrumLegendDot, backgroundColor: 'rgba(9,30,66,0.15)' }} />
                Peer range ({Math.round(peerMin)}–{Math.round(peerMax)})
              </span>
              <span style={styles.spectrumLegendItem}>
                <span style={{ ...styles.spectrumLegendDot, backgroundColor: trustLevelColor }} />
                Your team ({composite})
              </span>
            </div>
          </div>

          {/* Teams above */}
          {betterTeams.length > 0 && (
            <div style={styles.compareTeamsSection}>
              <h4 style={{ ...styles.compareTeamsSectionTitle, color: '#006644' }}>
                Teams scoring higher ({betterTeams.length})
              </h4>
              <div style={styles.compareTeamsList}>
                {betterTeams.map(team => (
                  <div key={team.id} style={{ ...styles.compareTeamItem, borderLeft: '3px solid #36B37E' }}>
                    <span style={{ ...styles.compareTeamRank, color: '#006644' }}>#{team.rank}</span>
                    <span style={styles.compareTeamName}>{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Your team divider */}
          <div style={styles.compareYourDivider}>
            <div style={styles.compareYourLine} />
            <span style={styles.compareYourBadge}>Your team — #{yourRank}</span>
            <div style={styles.compareYourLine} />
          </div>

          {/* Teams below */}
          {worseTeams.length > 0 && (
            <div style={styles.compareTeamsSection}>
              <h4 style={{ ...styles.compareTeamsSectionTitle, color: '#DE350B' }}>
                Teams scoring lower ({worseTeams.length})
              </h4>
              <div style={styles.compareTeamsList}>
                {worseTeams.map(team => (
                  <div key={team.id} style={{ ...styles.compareTeamItem, borderLeft: '3px solid #FF8B00' }}>
                    <span style={{ ...styles.compareTeamRank, color: '#DE350B' }}>#{team.rank}</span>
                    <span style={styles.compareTeamName}>{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={styles.compareNote}>
            Rankings reflect overall Data Trust composite scores. Individual lens rankings may differ.
          </p>
        </div>
        <div style={styles.compareFooter}>
          <button style={styles.compareCloseButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Banner Component (Hero Only) ────────────────────────────────────
interface DataTrustBannerProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
  trendData?: TrendDataPoint[];
  comparisonTeams?: ComparisonTeam[];
  comparisonTeamCount?: number;
  comparisonCriteria?: string[];
}

const DataTrustBanner: React.FC<DataTrustBannerProps> = ({
  lensResults, integrityScore, trendData,
  comparisonTeams = [], comparisonTeamCount = 0, comparisonCriteria = [],
}) => {
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const scores = computeLensScores(lensResults, integrityScore);
  const { level: trustLevel } = getTrustLevel(scores.composite);
  const weakest = getWeakestLens(scores);

  const trend = trendData ?? MOCK_COMPOSITE_TREND;
  const overallTrend = computeTrend(trend);
  const trendLabel = overallTrend === 'up' ? 'Improving' : overallTrend === 'down' ? 'Declining' : 'Stable';
  const trendArrow = overallTrend === 'up' ? '\u2197' : overallTrend === 'down' ? '\u2198' : '\u2192';

  const reliabilityStatuses = getReliabilityStatuses(trustLevel.name);

  // Donut ring math
  const r = 84;
  const circ = 2 * Math.PI * r;
  const filled = (scores.composite / 100) * circ;

  // Chart points — computed once, shared between backdrop SVG and HTML overlay
  const chartPoints = computeChartPoints(trend);

  return (
    <div style={styles.heroCard}>
      {/* Accent bar — gradient stripe */}
      <div style={styles.accentBar} />

      {/* Hero top — chart backdrop + floating score */}
      <div style={styles.heroTop}>
        <ChartBackdrop points={chartPoints} />
        <ChartDataPoints points={chartPoints} />

        <div style={styles.scoreFloat}>
          <div style={styles.scoreLabelRow}>
            <span style={styles.scoreLabel}>DATA TRUST SCORE</span>
            <HeroInfoButton title="Understanding Your Data Trust Score">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>What the Score Represents</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#42526E', lineHeight: 1.7 }}>
                    Your Data Trust Score is a composite measure from 0–100 that reflects the overall trustworthiness of your Jira data across four lenses. A higher score means your data is more reliable for making informed decisions.
                  </p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Lens Weights</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { name: 'Timeliness', weight: '30%', color: '#0052CC' },
                      { name: 'Trustworthiness', weight: '30%', color: '#6554C0' },
                      { name: 'Timing', weight: '20%', color: '#00B8D9' },
                      { name: 'Freshness', weight: '20%', color: '#36B37E' },
                    ].map(l => (
                      <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#F4F5F7', borderRadius: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#172B4D' }}>{l.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: l.color }}>{l.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#0052CC', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Trust Level Thresholds</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {TRUST_LEVELS.map(tl => (
                      <div key={tl.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', backgroundColor: tl.bgTint, borderRadius: '6px', borderLeft: `3px solid ${tl.color}` }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: tl.color, minWidth: '70px' }}>{tl.name}</span>
                        <span style={{ fontSize: '12px', color: '#6B778C' }}>{tl.range[0]}–{tl.range[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', backgroundColor: '#DEEBFF', borderRadius: '6px', border: '1px solid #B3D4FF' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#0052CC', lineHeight: 1.5 }}>
                    The confidence gauges below the score show how reliably you can use your Jira data for each purpose, derived from the composite score against use-case-specific thresholds.
                  </p>
                </div>
              </div>
            </HeroInfoButton>
          </div>

          <div style={styles.scoreDisc}>
            {/* Halo — fades chart line smoothly behind the donut */}
            <div style={styles.scoreHalo} />
            {/* Frosted glass circle */}
            <div style={styles.scoreDiscBg} />
            {/* Donut ring SVG */}
            <svg width={186} height={186} viewBox="0 0 186 186" style={{ ...styles.scoreRing, transform: 'rotate(-90deg)' }}>
              <defs>
                <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Track */}
              <circle cx={93} cy={93} r={r} fill="none" stroke={`${trustLevel.color}14`} strokeWidth={9} />
              {/* Filled arc */}
              <circle cx={93} cy={93} r={r} fill="none" stroke={trustLevel.color} strokeWidth={9}
                strokeDasharray={`${filled.toFixed(1)} ${circ.toFixed(1)}`} strokeLinecap="round" filter="url(#hero-glow)" />
            </svg>
            {/* Score number overlay */}
            <div style={styles.scoreContent}>
              <span style={{ ...styles.scoreNumber, color: trustLevel.color }}>{scores.composite}</span>
            </div>
          </div>

          {/* Badge row */}
          <div style={styles.badgeRow}>
            <span style={{
              ...styles.badge,
              background: `${trustLevel.color}1F`,
              border: `1.5px solid ${trustLevel.color}4D`,
              color: trustLevel.color,
            }}>
              <span style={{ ...styles.badgeDot, backgroundColor: trustLevel.color }} />
              {trustLevel.name}
            </span>
            <span style={styles.badgeTrend}>
              {trendArrow} {trendLabel}
            </span>
            {comparisonTeamCount > 0 && (
              <button
                style={styles.compareBadge}
                onClick={() => setIsCompareOpen(true)}
                type="button"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6c0-2.76 2.24-5 5-5s5 2.24 5 5H3zm10-8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm1.5 2h-.52a3.98 3.98 0 0 1 1.52 3.13V14H16v-2c0-1.1-.9-2-2-2h-.5zM3 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM.5 8H0c-1.1 0-2 .9-2 2v2h2v-2.13c0-1.2.47-2.3 1.25-3.12L.5 8z" />
                </svg>
                vs {comparisonTeamCount} teams
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Insight callout */}
      <div style={styles.insightBar}>
        <div style={styles.insightIcon}>
          <svg width={12} height={12} viewBox="0 0 16 16" fill="none">
            <path d="M8 2L2 14h12L8 2z" fill="#fff" />
            <rect x="7.25" y="6" width="1.5" height="4" rx="0.75" fill="#FF8B00" />
            <circle cx="8" cy="11.5" r="0.85" fill="#FF8B00" />
          </svg>
        </div>
        <p style={styles.insightText}>
          {weakest.score < 75 ? (
            <>
              <span style={styles.insightHl}>{weakest.label}</span>
              {' '}is your weakest component at{' '}
              <span style={styles.insightHl}>{weakest.score}</span>
              {' '}&mdash; start there to improve fastest.
            </>
          ) : (
            <>All components are performing well. Your data has {trustLevel.description}.</>
          )}
        </p>
      </div>

      <div style={{ height: '12px' }} />
      <div style={styles.sectionDivider} />

      {/* Confidence gauges */}
      <ConfidenceGauges composite={scores.composite} reliabilityStatuses={reliabilityStatuses} />

      {/* Team Comparison Modal */}
      <TeamComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        composite={scores.composite}
        trustLevelColor={trustLevel.color}
        comparisonTeams={comparisonTeams}
        comparisonTeamCount={comparisonTeamCount}
      />
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  heroCard: {
    position: 'relative',
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    overflow: 'hidden',
  },
  accentBar: {
    height: '5px',
    background: 'linear-gradient(90deg, #FF8B00, #FFAB00)',
  },
  heroTop: {
    position: 'relative' as const,
    minHeight: '290px',
    overflow: 'hidden',
  },
  chartBackdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  dataPointOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
  },
  scoreFloat: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px 0 12px',
  },
  scoreLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  scoreLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#8993A4',
    letterSpacing: '1.2px',
    textTransform: 'uppercase' as const,
  },
  scoreDisc: {
    position: 'relative' as const,
    width: '186px',
    height: '186px',
  },
  scoreHalo: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.95) 32%, rgba(255,255,255,0.65) 52%, rgba(255,255,255,0) 72%)',
    pointerEvents: 'none' as const,
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
  scoreRing: {
    display: 'block',
    position: 'relative' as const,
    zIndex: 1,
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
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  badgeTrend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1.5px solid rgba(9, 30, 66, 0.1)',
    color: '#44546F',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
  },
  compareBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    background: 'rgba(255, 255, 255, 0.7)',
    border: '1.5px solid rgba(9, 30, 66, 0.1)',
    color: '#44546F',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  // Team Comparison Modal styles
  compareOverlay: {
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
  compareModal: {
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
  compareHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  compareTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  compareCloseBtn: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBody: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  compareIntro: {
    marginTop: 0,
    marginBottom: '20px',
    lineHeight: 1.6,
    fontSize: '14px',
    color: '#172B4D',
  },
  compareFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
  },
  compareCloseButton: {
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
  // Spectrum bar styles
  spectrumContainer: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  spectrumLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  spectrumBarWrap: {
    position: 'relative' as const,
    height: '24px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    margin: '0 16px',
    boxSizing: 'border-box' as const,
  },
  spectrumTrack: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: '6px',
    borderRadius: '3px',
    background: 'linear-gradient(to right, #DE350B 0%, #DE350B 30%, #FF8B00 30%, #FF8B00 45%, #2684FF 45%, #2684FF 55%, #00875A 55%, #00875A 70%, #006644 70%, #006644 100%)',
    opacity: 0.45,
  },
  spectrumRangeBand: {
    position: 'absolute' as const,
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'rgba(9, 30, 66, 0.10)',
    zIndex: 1,
  },
  spectrumMedianTick: {
    position: 'absolute' as const,
    width: '2px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.25)',
    borderRadius: '1px',
    transform: 'translateX(-50%)',
    zIndex: 2,
    pointerEvents: 'none' as const,
  },
  spectrumYourMarker: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2.5px solid white',
    zIndex: 3,
  },
  spectrumMin: {
    position: 'absolute' as const,
    left: '-16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  },
  spectrumMax: {
    position: 'absolute' as const,
    right: '-22px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '10px',
    fontWeight: 600,
    color: '#97A0AF',
  },
  spectrumLegend: {
    display: 'flex',
    gap: '16px',
    marginTop: '10px',
    marginLeft: '16px',
  },
  spectrumLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#6B778C',
  },
  spectrumLegendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Team ranking list styles
  compareTeamsSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
  },
  compareTeamsSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  compareTeamsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  compareTeamItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '13px',
  },
  compareTeamRank: {
    fontSize: '12px',
    fontWeight: 600,
    minWidth: '28px',
  },
  compareTeamName: {
    color: '#172B4D',
    fontWeight: 500,
  },
  compareYourDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0',
  },
  compareYourLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#0052CC',
  },
  compareYourBadge: {
    padding: '6px 12px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  compareNote: {
    margin: '16px 0 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    fontStyle: 'italic' as const,
  },
  insightBar: {
    position: 'relative' as const,
    zIndex: 1,
    margin: '0 28px 0',
    padding: '10px 16px',
    background: 'rgba(255, 247, 237, 0.95)',
    borderLeft: '3px solid #FF8B00',
    borderRadius: '0 8px 8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  insightIcon: {
    flexShrink: 0,
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#FF8B00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#44546F',
    lineHeight: 1.4,
    margin: 0,
  },
  insightHl: {
    fontWeight: 700,
    color: '#FF8B00',
  },
  sectionDivider: {
    height: '1px',
    background: '#EBECF0',
    margin: 0,
  },
  confidenceSection: {
    padding: '18px 32px 22px',
    background: '#FAFBFC',
  },
  confidenceTitle: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#44546F',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  gaugeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  gaugeTile: {
    flex: '1',
    maxWidth: '128px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    gap: '3px',
    padding: '12px 6px 10px',
    borderRadius: '12px',
    border: '1px solid transparent',
  },
  gaugePct: {
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1,
    marginTop: '-1px',
  },
  gaugeName: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.25,
    minHeight: '26px',
    display: 'flex',
    alignItems: 'center',
  },
  gaugeStatus: {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
  },
};

export default DataTrustBanner;
