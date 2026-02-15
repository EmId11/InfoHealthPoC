import React from 'react';
import { AssessmentLensResults, PatternDetectionResult } from '../../../types/patterns';

interface DataTrustBannerProps {
  lensResults: AssessmentLensResults;
  integrityScore: number;
}

// ── Trust Levels ────────────────────────────────────────────────────
interface TrustLevel {
  name: string;
  range: [number, number];
  color: string;
  bgTint: string;
  description: string;
}

const TRUST_LEVELS: TrustLevel[] = [
  { name: 'Unreliable',  range: [0, 24],   color: '#DE350B', bgTint: 'rgba(222,53,11,0.04)',  description: 'significant trust deficits that undermine decision-making' },
  { name: 'Concerning',  range: [25, 44],  color: '#FF5630', bgTint: 'rgba(255,86,48,0.04)',  description: 'significant trust gaps that warrant attention' },
  { name: 'Developing',  range: [45, 59],  color: '#FF8B00', bgTint: 'rgba(255,139,0,0.04)',  description: 'emerging data practices with room for improvement' },
  { name: 'Dependable',  range: [60, 79],  color: '#36B37E', bgTint: 'rgba(54,179,126,0.04)', description: 'reasonably trustworthy data with minor gaps' },
  { name: 'Exemplary',   range: [80, 100], color: '#00875A', bgTint: 'rgba(0,135,90,0.04)',   description: 'high-confidence data suitable for strategic decisions' },
];

function getTrustLevel(composite: number): { level: TrustLevel; index: number } {
  for (let i = 0; i < TRUST_LEVELS.length; i++) {
    const l = TRUST_LEVELS[i];
    if (composite >= l.range[0] && composite <= l.range[1]) {
      return { level: l, index: i };
    }
  }
  return { level: TRUST_LEVELS[0], index: 0 };
}

// ── Score Computation (internal only) ───────────────────────────────
function computeLensScores(lensResults: AssessmentLensResults, integrityScore: number) {
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
function aggregatePatternInsights(lensResults: AssessmentLensResults) {
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
            {/* Outer halo for current node */}
            {isCurrent && (
              <>
                <circle cx={cx} cy={nodeY} r={20} fill={level.color} opacity={0.06} />
                <circle cx={cx} cy={nodeY} r={14} fill={level.color} opacity={0.10} />
              </>
            )}
            {/* Node circle */}
            <circle
              cx={cx}
              cy={nodeY}
              r={isCurrent ? 9 : 5}
              fill={isReached ? level.color : '#FFFFFF'}
              stroke={isReached ? level.color : '#DFE1E6'}
              strokeWidth={isReached ? 0 : 1.5}
            />
            {/* Label */}
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

// ── Insight Bullets ─────────────────────────────────────────────────
interface InsightBullet {
  label: string;
  labelColor: string;
  labelBg: string;
  text: string;
}

const SEVERITY_PILLS: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' },
  atRisk:   { label: 'At Risk',  color: '#FF8B00', bg: '#FFF7ED' },
  fair:     { label: 'Fair',     color: '#2684FF', bg: '#DEEBFF' },
  healthy:  { label: 'Healthy',  color: '#00875A', bg: '#E3FCEF' },
};

function generateInsights(
  scores: ReturnType<typeof computeLensScores>,
  insights: ReturnType<typeof aggregatePatternInsights>,
): InsightBullet[] {
  const bullets: InsightBullet[] = [];

  // Coverage observation
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

  // Pattern count summary
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

  // Worst lens callout
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

  // Top finding
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

// ── Banner Component ────────────────────────────────────────────────
const DataTrustBanner: React.FC<DataTrustBannerProps> = ({ lensResults, integrityScore }) => {
  const scores = computeLensScores(lensResults, integrityScore);
  const { level: trustLevel, index: trustIndex } = getTrustLevel(scores.composite);
  const insights = aggregatePatternInsights(lensResults);
  const bullets = generateInsights(scores, insights);

  return (
    <div style={{
      ...styles.container,
      background: `linear-gradient(180deg, ${trustLevel.bgTint} 0%, #FFFFFF 100%)`,
    }}>
      {/* Top accent stripe */}
      <div style={{ ...styles.accentStripe, backgroundColor: trustLevel.color }} />

      {/* Hero Section — centered */}
      <div style={styles.heroSection}>
        <div style={styles.overline}>DATA TRUST ASSESSMENT</div>
        <div style={{ ...styles.trustLevelName, color: trustLevel.color }}>
          {trustLevel.name}
        </div>
        <div style={styles.heroDesc}>
          Your Jira data has {trustLevel.description}.
        </div>
      </div>

      {/* Spectrum */}
      <div style={styles.spectrumWrap}>
        <TrustSpectrum activeIndex={trustIndex} levelColor={trustLevel.color} />
      </div>

      {/* Divider */}
      <div style={styles.findingsDivider} />

      {/* Key Findings */}
      <div style={styles.findingsSection}>
        <div style={styles.findingsLabel}>KEY FINDINGS</div>
        <div style={styles.findingsList}>
          {bullets.map((bullet, i) => (
            <div key={i} style={styles.findingRow}>
              <span style={{
                ...styles.severityPill,
                color: bullet.labelColor,
                backgroundColor: bullet.labelBg,
              }}>
                {bullet.label}
              </span>
              <span style={styles.findingText}>{bullet.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Styles ──────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '0',
  },
  accentStripe: {
    height: '4px',
    width: '100%',
  },
  heroSection: {
    textAlign: 'center',
    padding: '32px 40px 8px',
  },
  overline: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    color: '#8993A4',
    marginBottom: '12px',
  },
  trustLevelName: {
    fontSize: '36px',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  heroDesc: {
    fontSize: '16px',
    color: '#42526E',
    lineHeight: 1.5,
    maxWidth: '560px',
    margin: '0 auto',
  },
  spectrumWrap: {
    padding: '12px 40px 16px',
  },
  findingsDivider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '0 36px',
  },
  findingsSection: {
    padding: '20px 40px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  findingsLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    color: '#8993A4',
  },
  findingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  findingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  severityPill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 10px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    whiteSpace: 'nowrap' as const,
    minWidth: '64px',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  findingText: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default DataTrustBanner;
