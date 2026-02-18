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

// Warm hero gradients tinted by category colour
export const HERO_GRADIENTS: Record<string, string> = {
  'Critical':  'linear-gradient(135deg, #FFF5F2 0%, #FFEDE6 40%, #FFE2D4 100%)',
  'At Risk':   'linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 40%, #FFE8CC 100%)',
  'Fair':      'linear-gradient(135deg, #F0F5FF 0%, #E3EDFF 40%, #D4E4FF 100%)',
  'Healthy':   'linear-gradient(135deg, #F2FFF6 0%, #E4FCE9 40%, #D4F5DC 100%)',
  'Optimal':   'linear-gradient(135deg, #EEFFF3 0%, #DDFCE4 40%, #CCF5D5 100%)',
};

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

// ── Use-Case Score Cards ─────────────────────────────────────────────

// Bottleneck lenses per use case (what most limits that use case)
const USE_CASE_BOTTLENECKS = [
  'Status Accuracy',
  'Sprint Field Coverage',
  'Data Freshness',
  'Estimation Coverage',
  'Workflow Compliance',
  'Cross-Team Linking',
  'Field Completeness',
];

// Generate a mock per-use-case score from composite + threshold
function getUseCaseScore(composite: number, threshold: number, seed: number): number {
  const base = composite + Math.sin(seed * 7919) * 12;
  const offset = (threshold - 60) * 0.3;
  return Math.max(10, Math.min(99, Math.round(base - offset)));
}

// Mock trend delta per use case (seeded from index)
function getUseCaseTrend(seed: number): number {
  const val = Math.sin(seed * 1337) * 10;
  return Math.round(val);
}

// Tier distribution badges (mock counts per tier for each use case)
function getTierDistribution(score: number, seed: number): { color: string; count: number }[] {
  const tiers = [
    { color: '#DE350B' }, // Critical
    { color: '#FF8B00' }, // At Risk
    { color: '#FFAB00' }, // Warning
    { color: '#00875A' }, // Healthy
  ];
  return tiers.map((t, i) => ({
    color: t.color,
    count: Math.max(1, Math.round(Math.abs(Math.sin(seed * (i + 3) * 4999) * 12) + (i === 1 ? score / 15 : 2))),
  }));
}

// Signal bar levels and descriptions per confidence
const CONFIDENCE_LEVELS: Record<string, { bars: number; label: string }> = {
  'High':      { bars: 3, label: 'Strong' },
  'Moderate':  { bars: 2, label: 'Moderate' },
  'Low':       { bars: 1, label: 'Weak' },
  'Very low':  { bars: 1, label: 'Weak' },
};

// Short explanations per use case at each confidence tier
const USE_CASE_DESCRIPTIONS: Record<string, string[]> = {
  Strong: [
    'Status fields are consistently updated and reflect real work progress. Teams can rely on board views and filters for day-to-day coordination without second-guessing the data.',
    'Sprint scope, story points, and assignee fields are well-maintained. Planning sessions can trust the backlog to accurately represent upcoming work and team capacity.',
    'Completed work is reliably tracked with consistent field usage. Velocity charts and throughput metrics reflect actual delivery patterns teams can use for improvement.',
    'Story point estimates and time tracking fields are filled in consistently. Managers can use this data to make realistic capacity decisions for upcoming sprints.',
    'Enough historical data exists with consistent patterns to generate meaningful forecasts. Delivery date predictions and burn-down projections carry reasonable confidence.',
    'Teams follow similar Jira practices, making cross-team comparisons meaningful. Metrics like velocity and cycle time can be used to identify shared challenges.',
    'Data quality is high enough to feed into executive dashboards and quarterly reviews. Leadership can reference these numbers when making strategic resourcing decisions.',
  ],
  Moderate: [
    'Most tickets have status updates, but some lag behind or skip states. Day-to-day tracking works for the most part — just verify critical items manually before acting on them.',
    'Sprint fields are partially filled — enough to run planning sessions, but gaps in estimates or acceptance criteria mean some discussions happen without full context.',
    'Velocity trends point in the right direction but the underlying data is noisy. Use these numbers to spot broad patterns, not to make precise commitments.',
    'Some teams estimate consistently while others skip it. Capacity plans based on this data will be directionally useful but should be treated as rough guides.',
    'Data gaps and inconsistencies limit how far out you can reliably forecast. Short-term predictions may work, but multi-sprint forecasts need manual adjustment.',
    'Differing practices across teams make direct comparisons unreliable. Benchmarking can highlight broad differences but shouldn\'t drive specific decisions.',
    'Suitable for high-level reporting with caveats. The numbers tell a reasonable story but aren\'t precise enough to anchor major strategic decisions without additional context.',
  ],
  Weak: [
    'Status fields are inconsistently maintained — many tickets sit in incorrect states or are updated in bulk long after work completes. Board views don\'t reflect reality.',
    'Sprint fields are too sparse to support reliable planning. Missing estimates, undefined scope, and unassigned tickets mean planning sessions rely heavily on tribal knowledge.',
    'Velocity data is unreliable due to inconsistent completion tracking, reopened tickets, and scope changes that aren\'t reflected in the data. Throughput numbers are misleading.',
    'Estimation data is too sparse or inconsistent for capacity planning. Most tickets lack story points or time estimates, making workload distribution largely guesswork.',
    'There isn\'t enough clean historical data to generate meaningful forecasts. Delivery predictions based on this data would be unreliable and potentially misleading.',
    'Jira practices vary so much across teams that comparing metrics is not meaningful. Any benchmarking exercise would reflect process differences, not performance differences.',
    'Data quality is insufficient to support strategic decisions. Executive reports built from this data risk presenting a misleading picture of team performance and delivery health.',
  ],
};

const ConfidenceGauges: React.FC<{ composite: number; reliabilityStatuses: ReliabilityStatus[]; comparisonTeamCount: number }> = ({ composite, reliabilityStatuses, comparisonTeamCount }) => (
  <div style={ucStyles.section}>
    <div style={ucStyles.cardGrid}>
      {CONFIDENCE_SHORT_NAMES.map((name, i) => {
        const confidence = getConfidence(composite, USE_CASE_THRESHOLDS[i]);
        const status = reliabilityStatuses[i];
        const { label, color } = getConfidenceLabel(status, confidence);
        const level = CONFIDENCE_LEVELS[label] ?? CONFIDENCE_LEVELS['Weak'];
        const trendDelta = getUseCaseTrend(i + 1);
        const trendDir: 'up' | 'down' | 'stable' = trendDelta > 0 ? 'up' : trendDelta < 0 ? 'down' : 'stable';
        const trendColor = trendDir === 'up' ? '#00875A' : trendDir === 'down' ? '#DE350B' : '#8993A4';
        const dist = getTierDistribution(composite, i + 1);
        const description = (USE_CASE_DESCRIPTIONS[level.label] ?? USE_CASE_DESCRIPTIONS['Weak'])[i];

        return (
          <div key={i} style={{ ...ucStyles.item, borderLeftColor: color }}>
            {/* Header: name + confidence pill */}
            <div style={ucStyles.cardHeader}>
              <span style={ucStyles.cardName}>{name}</span>
              <span style={{
                ...ucStyles.levelPill,
                color,
                backgroundColor: `${color}12`,
                borderColor: `${color}30`,
              }}>{level.label}</span>
            </div>

            {/* Thin confidence gauge */}
            <div style={ucStyles.gaugeWrapper}>
              <div style={ucStyles.gaugeTrack}>
                <div style={{
                  ...ucStyles.gaugeFill,
                  width: level.bars === 1 ? '33%' : level.bars === 2 ? '66%' : '100%',
                  background: color,
                  boxShadow: `0 0 6px 1px ${color}50`,
                }} />
              </div>
              <div style={{
                ...ucStyles.gaugeDot,
                left: level.bars === 1 ? '33%' : level.bars === 2 ? '66%' : '98%',
                background: color,
                boxShadow: `0 0 6px 2px ${color}40`,
              }} />
            </div>

            {/* Description */}
            <span style={ucStyles.cardDesc}>{description}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const ucStyles: Record<string, React.CSSProperties> = {
  section: {
    padding: '24px 32px 28px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#44546F',
    marginBottom: '20px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '36px 32px',
  },
  item: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    padding: '16px 20px',
    borderRadius: '10px',
    background: '#FAFBFC',
    borderLeft: '3px solid #E4E6EB',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
  },
  levelPill: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid',
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  gaugeWrapper: {
    position: 'relative' as const,
    height: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  gaugeTrack: {
    width: '100%',
    height: '2px',
    borderRadius: '1px',
    background: '#E4E6EB',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: '1px',
    position: 'relative' as const,
  },
  gaugeDot: {
    position: 'absolute' as const,
    top: '50%',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
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

// ── Trend History Modal ──────────────────────────────────────────────
interface TrendHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartPoints: { x: number; y: number; value: number; period: string }[];
  composite: number;
  trustLevelColor: string;
  trendLabel: string;
}

const MODAL_CHART_W = 560;
const MODAL_CHART_H = 220;

const TrendHistoryModal: React.FC<TrendHistoryModalProps> = ({
  isOpen, onClose, chartPoints, composite, trustLevelColor, trendLabel,
}) => {
  if (!isOpen) return null;

  // Recompute points scaled to modal chart dimensions
  const step = chartPoints.length > 1 ? (MODAL_CHART_W - 80) / (chartPoints.length - 1) : 0;
  const modalPoints = chartPoints.map((p, i) => ({
    x: 40 + i * step,
    y: MODAL_CHART_H * (1 - p.value / 100),
    value: p.value,
    period: p.period,
  }));

  const getColor = (v: number) => getTrustLevel(v).level.color;

  return (
    <div style={styles.compareOverlay} onClick={onClose}>
      <div style={{ ...styles.compareModal, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div style={styles.compareHeader}>
          <h2 style={styles.compareTitle}>Score History</h2>
          <button style={styles.compareCloseBtn} onClick={onClose}>
            <CrossIcon label="Close" size="small" />
          </button>
        </div>
        <div style={styles.compareBody}>
          <p style={styles.compareIntro}>
            Current score: <strong style={{ color: trustLevelColor }}>{composite}</strong> &mdash; trend is <strong>{trendLabel.toLowerCase()}</strong> over the last {chartPoints.length} periods.
          </p>

          {/* Full-width trend chart */}
          <div style={{ position: 'relative' as const, marginBottom: '16px' }}>
            <svg width="100%" viewBox={`0 0 ${MODAL_CHART_W} ${MODAL_CHART_H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
              <defs>
                {modalPoints.map((p, i) => {
                  if (i === 0) return null;
                  const prev = modalPoints[i - 1];
                  const c1 = getColor(prev.value);
                  const c2 = getColor(p.value);
                  return (
                    <React.Fragment key={`modal-defs-${i}`}>
                      <linearGradient id={`modal-seg-line-${i}`} x1={prev.x} y1="0" x2={p.x} y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={c1} />
                        <stop offset="100%" stopColor={c2} />
                      </linearGradient>
                      <linearGradient id={`modal-seg-area-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c2} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={c2} stopOpacity={0.02} />
                      </linearGradient>
                    </React.Fragment>
                  );
                })}
              </defs>

              {/* Trust level band stripes */}
              {TRUST_LEVELS.map(tl => {
                const yTop = MODAL_CHART_H * (1 - tl.range[1] / 100);
                const yBot = MODAL_CHART_H * (1 - tl.range[0] / 100);
                return (
                  <rect key={tl.name} x={0} y={yTop} width={MODAL_CHART_W} height={yBot - yTop}
                    fill={tl.color} opacity={0.04} />
                );
              })}

              {/* Area fills */}
              {modalPoints.map((p, i) => {
                if (i === 0) return null;
                const prev = modalPoints[i - 1];
                const pts = `${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${MODAL_CHART_H} ${prev.x.toFixed(1)},${MODAL_CHART_H}`;
                return <polygon key={`modal-area-${i}`} points={pts} fill={`url(#modal-seg-area-${i})`} />;
              })}

              {/* Line segments */}
              {modalPoints.map((p, i) => {
                if (i === 0) return null;
                const prev = modalPoints[i - 1];
                return (
                  <line key={`modal-line-${i}`}
                    x1={prev.x.toFixed(1)} y1={prev.y.toFixed(1)}
                    x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
                    stroke={`url(#modal-seg-line-${i})`}
                    strokeWidth={2.5} strokeLinecap="round"
                  />
                );
              })}

              {/* Data point dots + labels */}
              {modalPoints.map((p, i) => {
                const pointColor = getColor(p.value);
                const isLast = i === modalPoints.length - 1;
                const dateLabel = formatPeriodLabel(p.period);
                return (
                  <React.Fragment key={`modal-pt-${i}`}>
                    <circle cx={p.x} cy={p.y} r={isLast ? 5 : 4} fill={pointColor} stroke="#fff" strokeWidth={2} />
                    {/* Value label above */}
                    <text x={p.x} y={p.y - 10} textAnchor="middle"
                      fontSize="12" fontWeight="700" fill={pointColor}>
                      {p.value}
                    </text>
                    {/* Date label below */}
                    <text x={p.x} y={p.y + 18} textAnchor="middle"
                      fontSize="8.5" fontWeight="600" fill={pointColor} opacity={0.7}
                      style={{ textTransform: 'uppercase' as const } as React.CSSProperties}>
                      {dateLabel}
                    </text>
                  </React.Fragment>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' }}>
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUseCasesOpen, setIsUseCasesOpen] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);

  const scores = computeLensScores(lensResults, integrityScore);
  const { level: trustLevel, index: trustIndex } = getTrustLevel(scores.composite);

  const trend = trendData ?? MOCK_COMPOSITE_TREND;
  const overallTrend = computeTrend(trend);
  const trendLabel = overallTrend === 'up' ? 'Improving' : overallTrend === 'down' ? 'Declining' : 'Stable';
  const trendColor = overallTrend === 'up' ? '#00875A' : overallTrend === 'down' ? '#DE350B' : '#8993A4';

  const reliabilityStatuses = getReliabilityStatuses(trustLevel.name);

  // Donut ring math
  const r = 84;
  const circ = 2 * Math.PI * r;
  const filled = (scores.composite / 100) * circ;

  // Chart points — computed once, shared between backdrop SVG and HTML overlay
  const chartPoints = computeChartPoints(trend);

  return (
    <>
    <div style={styles.heroCard}>
      {/* Accent bar — gradient stripe */}
      <div style={{ ...styles.accentBar, background: trustLevel.color }} />

      {/* Hero top — warm gradient background spans full width */}
      <div style={{ ...styles.heroTop, background: HERO_GRADIENTS[trustLevel.name] || HERO_GRADIENTS['At Risk'] }}>
        {/* Decorative background circles */}
        <div style={styles.questionDecor1} />
        <div style={styles.questionDecor2} />

        <div style={styles.heroColumns}>
          {/* Left — question text */}
          <div style={styles.questionContent}>
            <span style={styles.questionEyebrow}>THE CORE QUESTION</span>
            <h2 style={styles.questionText}>
              Can you <span style={styles.questionHighlight}>trust</span> the data behind your <span style={styles.questionHighlight2}>decisions</span>?
            </h2>
            <p style={styles.questionSubtext}>
              Your Jira data flows into sprint reviews, capacity planning, velocity reports, and executive dashboards. This assessment measures whether that data is complete, accurate, timely, and fresh enough to rely on. <strong style={{ color: trustLevel.color }}>Right now, your data shows {trustLevel.description}.</strong>
            </p>
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

          {/* Right — score visualization */}
          <div style={styles.scoreFloat}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center' }}>
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
                <span style={{ ...styles.scoreNumber, color: trustLevel.color, position: 'relative' as const }}>
                  {scores.composite}
                  <button
                    className="trend-spark-btn"
                    onClick={() => setIsHistoryOpen(true)}
                    type="button"
                    title="View score history"
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
                    <style>{`.trend-spark-btn:hover { background: ${trendColor}18 !important; transform: scale(1.15); box-shadow: 0 0 0 3px ${trendColor}22; } .trend-spark-btn:active { transform: scale(1.05); }`}</style>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {overallTrend === 'up' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
                      {overallTrend === 'down' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
                      {overallTrend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            {/* Badge row — centered under donut */}
            <div style={styles.badgeRow}>
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

            {/* Vertical trust level spectrum */}
            <svg width={200} height={126} viewBox="0 0 200 126">
              {(() => {
                const levels = [...TRUST_LEVELS].reverse(); // Optimal at top
                const nodeX = 8;
                const labelX = 22;
                const spacing = 26;
                const startY = 12;
                const currLevelName = trustLevel.name;
                const linkX = labelX + currLevelName.length * 7 + 8;
                return (
                  <>
                    {/* Connecting lines */}
                    {levels.map((_, j) => {
                      if (j === levels.length - 1) return null;
                      const y1 = startY + j * spacing;
                      const y2 = startY + (j + 1) * spacing;
                      const origIdx1 = TRUST_LEVELS.length - 1 - j;
                      const reached = origIdx1 <= trustIndex;
                      return (
                        <line key={`line-${j}`} x1={nodeX} y1={y1} x2={nodeX} y2={y2}
                          stroke={reached ? levels[j + 1].color : '#DFE1E6'} strokeWidth={2} />
                      );
                    })}
                    {/* Nodes + labels */}
                    {levels.map((level, j) => {
                      const y = startY + j * spacing;
                      const origIdx = TRUST_LEVELS.length - 1 - j;
                      const isCurr = origIdx === trustIndex;
                      const isReached = origIdx <= trustIndex;
                      return (
                        <g key={level.name}>
                          {isCurr && (
                            <circle cx={nodeX} cy={y} r={10} fill={level.color} opacity={0.12} />
                          )}
                          <circle cx={nodeX} cy={y} r={isCurr ? 5 : 3}
                            fill={isReached ? level.color : '#FFFFFF'}
                            stroke={isReached ? level.color : '#DFE1E6'}
                            strokeWidth={isReached ? 0 : 1.5} />
                          <text x={labelX} y={y} dominantBaseline="central"
                            fontSize={isCurr ? '11.5' : '10'} fontWeight={isCurr ? '700' : '400'}
                            fill={isCurr ? level.color : '#A5ADBA'}>
                            {level.name}
                          </text>
                          {isCurr && (
                            <g
                              style={{ cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); setIsUseCasesOpen(true); }}
                              className="dtb-spectrum-link"
                            >
                              <circle cx={linkX} cy={y} r={5.5} fill="none" stroke={level.color} strokeWidth={1} opacity={0.5} />
                              <text x={linkX} y={y} textAnchor="middle" dominantBaseline="central"
                                fontSize="7.5" fontWeight="700" fill={level.color} opacity={0.6}>?</text>
                              <text x={linkX + 10} y={y} dominantBaseline="central"
                                fontSize="9" fontWeight="500" fill={level.color} opacity={0.6}>
                                What does this mean?
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
            <style>{`.dtb-spectrum-link:hover text { opacity: 1 !important; } .dtb-spectrum-link:hover circle { opacity: 0.8 !important; }`}</style>
          </div>

        </div>
        </div>

      </div>

      {/* Composition footer — shows which dimensions feed into the overall score */}
      <div style={styles.compositionFooter}>
        {([
          { label: 'Timeliness', score: scores.coverage, weight: '30%' },
          { label: 'Trustworthiness', score: scores.integrity, weight: '30%' },
          { label: 'Freshness', score: scores.behavioral, weight: '20%' },
        ] as const).map((seg, i) => {
          const segTrust = getTrustLevel(seg.score);
          return (
            <div
              key={seg.label}
              style={{
                ...styles.compositionSeg,
                borderBottomColor: segTrust.level.color,
                ...(i < 2 ? { borderRight: '1px solid rgba(9, 30, 66, 0.06)' } : {}),
              }}
            >
              <span style={{ ...styles.compositionSegLabel, color: segTrust.level.color }}>{seg.label}</span>
              <span style={styles.compositionSegMeta}>{seg.score} &middot; {seg.weight}</span>
            </div>
          );
        })}
      </div>

    </div>

    {/* Use Cases Modal */}
    {isUseCasesOpen && (
      <div style={styles.compareOverlay} onClick={() => setIsUseCasesOpen(false)}>
        <div style={{ ...styles.compareModal, maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
          <div style={styles.compareHeader}>
            <h2 style={styles.compareTitle}>Can we trust our Jira data for these purposes?</h2>
            <button style={styles.compareCloseBtn} onClick={() => setIsUseCasesOpen(false)}>
              <CrossIcon label="Close" size="small" />
            </button>
          </div>
          <div style={styles.compareBody}>
            <ConfidenceGauges composite={scores.composite} reliabilityStatuses={reliabilityStatuses} comparisonTeamCount={comparisonTeamCount} />
          </div>
          <div style={styles.compareFooter}>
            <button style={styles.compareCloseButton} onClick={() => setIsUseCasesOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {/* Improvement Roadmap Modal */}
    {isImproveOpen && (() => {
      const allLenses = [
        { label: LENS_CONFIG.coverage.label, score: scores.coverage, lensType: 'coverage' as LensType },
        { label: LENS_CONFIG.integrity.label, score: scores.integrity, lensType: 'integrity' as LensType },
        { label: LENS_CONFIG.behavioral.label, score: scores.behavioral, lensType: 'behavioral' as LensType },
      ].sort((a, b) => a.score - b.score);

      const IMPROVEMENT_TIPS: Record<string, { quick: string; medium: string; strategic: string }> = {
        coverage: {
          quick: 'Set up required-field rules so tickets can\'t be created without key information like description, acceptance criteria, and priority.',
          medium: 'Run a weekly backlog triage where the team reviews and fills in incomplete tickets before they enter a sprint.',
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

      return (
        <div style={styles.compareOverlay} onClick={() => setIsImproveOpen(false)}>
          <div style={{ ...styles.compareModal, maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.compareHeader}>
              <h2 style={styles.compareTitle}>How might we improve?</h2>
              <button style={styles.compareCloseBtn} onClick={() => setIsImproveOpen(false)}>
                <CrossIcon label="Close" size="small" />
              </button>
            </div>
            <div style={styles.compareBody}>
              <p style={styles.roadmapIntro}>
                Based on your current scores, here's a prioritised roadmap. Focus areas are ordered by impact — start with your weakest dimension and work up.
              </p>

              {allLenses.map((lens, i) => {
                const { level } = getTrustLevel(lens.score);
                const tips = IMPROVEMENT_TIPS[lens.lensType];
                return (
                  <div key={lens.lensType} style={{ ...styles.roadmapCard, borderLeftColor: level.color }}>
                    <div style={styles.roadmapCardHeader}>
                      <span style={styles.roadmapPriority}>
                        {i === 0 ? 'Priority 1' : i === 1 ? 'Priority 2' : 'Priority 3'}
                      </span>
                      <span style={{ ...styles.roadmapLensName, color: level.color }}>{lens.label}</span>
                      <span style={styles.roadmapScore}>{lens.score}/100</span>
                    </div>
                    <div style={styles.roadmapTips}>
                      <div style={styles.roadmapTip}>
                        <span style={styles.roadmapTipTag}>Quick win</span>
                        <span style={styles.roadmapTipText}>{tips.quick}</span>
                      </div>
                      <div style={styles.roadmapTip}>
                        <span style={{ ...styles.roadmapTipTag, backgroundColor: '#DEEBFF', color: '#0052CC' }}>Medium term</span>
                        <span style={styles.roadmapTipText}>{tips.medium}</span>
                      </div>
                      <div style={styles.roadmapTip}>
                        <span style={{ ...styles.roadmapTipTag, backgroundColor: '#EAE6FF', color: '#6554C0' }}>Strategic</span>
                        <span style={styles.roadmapTipText}>{tips.strategic}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={styles.compareFooter}>
              <button style={styles.compareCloseButton} onClick={() => setIsImproveOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* Score History Modal */}
    <TrendHistoryModal
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      chartPoints={chartPoints}
      composite={scores.composite}
      trustLevelColor={trustLevel.color}
      trendLabel={trendLabel}
    />

    {/* Team Comparison Modal */}
    <TeamComparisonModal
      isOpen={isCompareOpen}
      onClose={() => setIsCompareOpen(false)}
      composite={scores.composite}
      trustLevelColor={trustLevel.color}
      comparisonTeams={comparisonTeams}
      comparisonTeamCount={comparisonTeamCount}
    />
    </>
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
  compositionFooter: {
    display: 'flex',
    borderTop: '1px solid rgba(9, 30, 66, 0.06)',
  },
  compositionSeg: {
    flex: '1 1 0%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderBottom: '3px solid transparent',
  },
  compositionSegLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
  compositionSegMeta: {
    fontSize: '11px',
    color: '#97A0AF',
    fontWeight: 500,
  },
  accentBar: {
    height: '5px',
    background: 'linear-gradient(90deg, #FF8B00, #FFAB00)',
  },
  heroTop: {
    position: 'relative' as const,
    overflow: 'hidden',
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
  questionDecor1: {
    position: 'absolute' as const,
    top: '-40px',
    right: '-30px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(255, 139, 0, 0.06)',
    border: '1px solid rgba(255, 139, 0, 0.08)',
  },
  questionDecor2: {
    position: 'absolute' as const,
    bottom: '-20px',
    left: '-40px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(0, 82, 204, 0.04)',
    border: '1px solid rgba(0, 82, 204, 0.06)',
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
  questionHighlight: {
    color: '#FF8B00',
    position: 'relative' as const,
  },
  questionHighlight2: {
    color: '#0052CC',
    position: 'relative' as const,
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
  roadmapIntro: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#44546F',
    lineHeight: 1.6,
  },
  roadmapCard: {
    borderLeft: '4px solid transparent',
    borderRadius: '8px',
    backgroundColor: '#FAFBFC',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  roadmapCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  roadmapPriority: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#6B778C',
    backgroundColor: '#EBECF0',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  roadmapLensName: {
    fontSize: '14px',
    fontWeight: 700,
    flex: 1,
  },
  roadmapScore: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
  },
  roadmapTips: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  roadmapTip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  roadmapTipTag: {
    flexShrink: 0,
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    whiteSpace: 'nowrap' as const,
    marginTop: '2px',
  },
  roadmapTipText: {
    fontSize: '13px',
    color: '#44546F',
    lineHeight: 1.55,
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
  confidenceCard: {
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    marginTop: '16px',
    overflow: 'hidden',
  },
  sectionDivider: {
    height: '1px',
    background: '#EBECF0',
    margin: 0,
  },
};

export default DataTrustBanner;
