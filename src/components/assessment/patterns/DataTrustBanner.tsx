import React from 'react';
import { AssessmentLensResults, LensType, OverallSeverity, PatternDetectionResult } from '../../../types/patterns';
import { TrendDataPoint } from '../../../types/assessment';
import Sparkline from '../common/Sparkline';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';

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
  const coverage = lensResults.coverage.coveragePercent;
  const integrity = integrityScore;
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
  coverage:    { label: 'Field Completeness', icon: 'M3 3h18v18H3V3zm2 2v14h14V5H14v6l-2.5-1.5L9 11V5H5z', description: 'Are critical Jira fields filled in before work starts?' },
  integrity:   { label: 'Integrity',          icon: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.58L18 9.5l-7 7z', description: 'Do field values contain real data or just placeholders?' },
  timing:      { label: 'Timing',             icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z', description: 'Was information available when decisions were made?' },
  behavioral:  { label: 'Behavioral',         icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', description: 'Are there patterns that may distort your metrics?' },
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

// ── Trust Spectrum SVG ──────────────────────────────────────────────
const TrustSpectrum: React.FC<{ activeIndex: number; levelColor: string }> = ({ activeIndex, levelColor }) => {
  const nodeCount = TRUST_LEVELS.length;
  const svgWidth = 520;
  const svgHeight = 72;
  const nodeY = 26;
  const labelY = 58;
  const spacing = (svgWidth - 80) / (nodeCount - 1);
  const startX = 40;

  return (
    <svg
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: `${svgWidth}px`, display: 'block', margin: '0 auto' }}
    >
      {/* Connecting lines */}
      {TRUST_LEVELS.map((_, i) => {
        if (i === nodeCount - 1) return null;
        const x1 = startX + i * spacing;
        const x2 = startX + (i + 1) * spacing;
        const reached = i < activeIndex;
        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={nodeY}
            x2={x2}
            y2={nodeY}
            stroke={reached ? TRUST_LEVELS[i].color : '#DFE1E6'}
            strokeWidth={3}
          />
        );
      })}

      {/* Nodes */}
      {TRUST_LEVELS.map((level, i) => {
        const cx = startX + i * spacing;
        const isCurrent = i === activeIndex;
        const isReached = i <= activeIndex;

        return (
          <g key={level.name}>
            {isCurrent && (
              <>
                <circle cx={cx} cy={nodeY} r={20} fill={level.color} opacity={0.06} />
                <circle cx={cx} cy={nodeY} r={14} fill={level.color} opacity={0.10} />
              </>
            )}
            <circle
              cx={cx}
              cy={nodeY}
              r={isCurrent ? 9 : 5}
              fill={isReached ? level.color : '#FFFFFF'}
              stroke={isReached ? level.color : '#DFE1E6'}
              strokeWidth={isReached ? 0 : 1.5}
            />
            <text
              x={cx}
              y={labelY}
              textAnchor="middle"
              style={{
                fontSize: isCurrent ? '12px' : '11px',
                fontWeight: isCurrent ? 700 : 400,
                fill: isCurrent ? level.color : '#A5ADBA',
                letterSpacing: isCurrent ? '0.3px' : '0',
              }}
            >
              {level.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Mock Trend Data ─────────────────────────────────────────────────
const MOCK_COMPOSITE_TREND: TrendDataPoint[] = [
  { period: '2025-05', value: 38, healthScore: 38 },
  { period: '2025-06', value: 36, healthScore: 36 },
  { period: '2025-07', value: 39, healthScore: 39 },
  { period: '2025-08', value: 42, healthScore: 42 },
  { period: '2025-09', value: 41, healthScore: 41 },
  { period: '2025-10', value: 44, healthScore: 44 },
  { period: '2025-11', value: 43, healthScore: 43 },
  { period: '2025-12', value: 46, healthScore: 46 },
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

// ── Banner Component (Hero Only) ────────────────────────────────────
interface DataTrustBannerProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
  trendData?: TrendDataPoint[];
}

const DataTrustBanner: React.FC<DataTrustBannerProps> = ({ lensResults, integrityScore, trendData }) => {
  const scores = computeLensScores(lensResults, integrityScore);
  const { level: trustLevel, index: trustIndex } = getTrustLevel(scores.composite);
  const weakest = getWeakestLens(scores);
  const weakestTrust = getTrustLevel(weakest.score);

  const trend = trendData ?? MOCK_COMPOSITE_TREND;
  const overallTrend = computeTrend(trend);
  const trendLabel = overallTrend === 'up' ? 'Improving' : overallTrend === 'down' ? 'Declining' : 'Stable';
  const trendColor = overallTrend === 'up' ? '#36B37E' : overallTrend === 'down' ? '#DE350B' : '#6B778C';
  const trendArrowPath = overallTrend === 'up'
    ? 'M3,10 L7,3 L11,10 L9,10 L9,12 L5,12 L5,10 Z'
    : 'M3,5 L7,12 L11,5 L9,5 L9,3 L5,3 L5,5 Z';
  const sparkTrend = overallTrend === 'up' ? 'improving' as const : overallTrend === 'down' ? 'declining' as const : 'stable' as const;
  const hasTrendData = trend.length >= 2;

  const reliabilityStatuses = getReliabilityStatuses(trustLevel.name);
  const RELIABILITY_SHORT_NAMES = [
    'Task tracking',
    'Sprint planning',
    'Velocity reporting',
    'Capacity planning',
    'Forecasting',
    'Benchmarking',
    'Strategic reporting',
  ];

  return (
    <div style={{ ...styles.heroCard, background: '#FFFFFF' }}>
      {/* Top accent stripe */}
      <div style={{ ...styles.accentStripe, backgroundColor: trustLevel.color }} />

      <div style={styles.heroTwoColumn}>
        {/* Left: Score, status, spectrum */}
        <div style={styles.heroLeft}>
          <div style={styles.heroTitleRow}>
            <span style={styles.heroSubtitle}>DATA TRUST SCORE</span>
          </div>

          <div style={styles.heroScoreBlock}>
            <span style={{ ...styles.heroBigNumber, color: trustLevel.color }}>
              {scores.composite}
            </span>
            <span style={styles.heroBigDenom}>/100</span>
          </div>

          {/* Category + trend + sparkline as unified chip */}
          <div style={{
            ...styles.heroStatusChip,
            backgroundColor: `${trustLevel.color}18`,
            border: `1.5px solid ${trustLevel.color}40`,
          }}>
            <span style={{ ...styles.heroStatusDot, backgroundColor: trustLevel.color }} />
            <span style={{ ...styles.heroStatusTier, color: trustLevel.color }}>
              {trustLevel.name}
            </span>
            <span style={styles.heroStatusDivider} />
            {overallTrend === 'stable' ? (
              <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                <MediaServicesActualSizeIcon label="" size="small" primaryColor={trendColor} />
              </span>
            ) : (
              <svg width="12" height="12" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                <path d={trendArrowPath} fill={trendColor} />
              </svg>
            )}
            <span style={{ ...styles.heroStatusTrend, color: trendColor }}>
              {trendLabel}
            </span>
            {hasTrendData && (
              <>
                <span style={styles.heroStatusDivider} />
                <span style={styles.heroSparklineWrap}>
                  <Sparkline
                    data={trend}
                    trend={sparkTrend}
                    width={56}
                    height={20}
                  />
                </span>
              </>
            )}
          </div>

          {/* Priority callout */}
          <p style={styles.heroDescription}>
            {weakest.score < 75 ? (
              <>
                <span style={{ color: weakestTrust.level.color, fontWeight: 600 }}>{weakest.label}</span>
                {' '}is your weakest component at{' '}
                <span style={{ color: weakestTrust.level.color, fontWeight: 600 }}>{weakest.score}</span>
                {' '}&mdash; start there to improve fastest.
              </>
            ) : (
              <>All components are performing well. Your data has {trustLevel.description}.</>
            )}
          </p>

          {/* Trust Spectrum */}
          <div style={styles.spectrumWrap}>
            <TrustSpectrum activeIndex={trustIndex} levelColor={trustLevel.color} />
          </div>
        </div>

        {/* Right: Jira Reliability */}
        <div style={styles.heroRight}>
          <span style={styles.reliabilityTitle}>WHAT YOUR JIRA DATA CAN SUPPORT</span>
          <div style={styles.reliabilityRows}>
            {reliabilityStatuses.map((status, i) => {
              const rs = RELIABILITY_STYLES[status];
              const requiredLevel = status !== 'reliable' ? getRequiredLevelForReliable(i) : null;
              return (
                <div key={i} style={styles.reliabilityRow}>
                  <span style={{
                    ...styles.reliabilityIcon,
                    color: rs.color,
                    backgroundColor: `${rs.color}14`,
                  }}>
                    {rs.symbol}
                  </span>
                  <div style={styles.reliabilityTextCol}>
                    <span style={styles.reliabilityName}>{RELIABILITY_SHORT_NAMES[i]}</span>
                    {requiredLevel && (
                      <span style={styles.reliabilityNeeds}>Needs {requiredLevel} or better</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  heroCard: {
    position: 'relative',
    padding: '28px 48px 24px',
    overflow: 'hidden',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
  },
  accentStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
  },
  heroTwoColumn: {
    display: 'flex',
    gap: '0',
    alignItems: 'stretch',
  },
  heroLeft: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  heroRight: {
    flex: '0 0 280px',
    display: 'flex',
    flexDirection: 'column' as const,
    borderLeft: '1px solid rgba(9, 30, 66, 0.08)',
    paddingLeft: '32px',
    marginLeft: '32px',
    justifyContent: 'center',
  },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  heroSubtitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  heroScoreBlock: {
    display: 'flex',
    alignItems: 'baseline',
  },
  heroBigNumber: {
    fontSize: '96px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-4px',
  },
  heroBigDenom: {
    fontSize: '28px',
    fontWeight: 500,
    color: '#97A0AF',
    marginLeft: '4px',
  },
  heroStatusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    marginTop: '8px',
  },
  heroStatusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  heroStatusTier: {
    fontSize: '13px',
    fontWeight: 700,
  },
  heroStatusDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(9, 30, 66, 0.15)',
  },
  heroStatusTrend: {
    fontSize: '13px',
    fontWeight: 600,
  },
  heroSparklineWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    opacity: 0.8,
  } as React.CSSProperties,
  heroDescription: {
    margin: '12px 0 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
    maxWidth: '440px',
  },
  spectrumWrap: {
    padding: '12px 20px 0',
    width: '100%',
    maxWidth: '520px',
  },
  reliabilityTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  reliabilityRows: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  reliabilityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '5px 0',
  },
  reliabilityIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '1px',
  },
  reliabilityTextCol: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  reliabilityName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  reliabilityNeeds: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#97A0AF',
    marginTop: '1px',
  },
};

export default DataTrustBanner;
