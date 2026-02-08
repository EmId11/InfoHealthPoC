import React, { useMemo, useState } from 'react';
import { HealthScoreResult, TrendDirection } from '../../../types/assessment';
import { getCHSCategoryConfig, CHS_CATEGORIES, getCeilingGuidance } from '../../../constants/chsCategories';
import { calculatePrecision } from '../../../utils/precisionIndicator';
import HeroInfoButton from '../../common/HeroInfoButton';
import CalculationButton from '../../common/CalculationButton';
import { ASSESSMENT_EXPLANATION } from '../../../constants/pageExplanations';

interface HealthScoreHeroProps {
  healthScore: HealthScoreResult;
  overallTrend: TrendDirection;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}

// Generate mock comparison team positions for spectrum visualization
const generateComparisonTeams = (teamCount: number = 47): number[] => {
  const seed = 42; // Fixed seed for consistent positions
  const positions: number[] = [];

  for (let i = 0; i < teamCount; i++) {
    const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
    const normalized = (pseudoRandom - Math.floor(pseudoRandom));
    const position = Math.max(5, Math.min(95, normalized * 100));
    positions.push(position);
  }

  return positions;
};

const HealthScoreHero: React.FC<HealthScoreHeroProps> = ({
  healthScore,
  overallTrend,
}) => {
  // Tooltip state
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  });

  // Precision tooltip state
  const [showPrecisionTooltip, setShowPrecisionTooltip] = useState(false);

  // Get the CHS category based on the composite score
  const chsCategory = getCHSCategoryConfig(healthScore.compositeScore);

  // Spectrum visualization data
  const comparisonTeamPositions = useMemo(() => generateComparisonTeams(47), []);
  // Map CHS score directly to position (score 50 = 50% position)
  const yourPosition = healthScore.compositeScore;

  // Tooltip handlers
  const handleDotMouseEnter = (e: React.MouseEvent, position: number, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Convert position back to approximate score
    const estimatedScore = Math.round(position);
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: `Team ${idx + 1}`,
      value: `Score: ${estimatedScore}`,
    });
  };

  const handleMarkerMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      label: 'Your Team',
      value: `Score: ${healthScore.compositeScore}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Spectrum endpoints for overall Jira health
  const spectrumEndpoints = {
    min: {
      label: 'Needs Attention',
      description: 'Jira data has significant gaps that limit its usefulness',
    },
    max: {
      label: 'Excellent',
      description: 'Jira accurately reflects work state, enabling confident decisions',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Banner - Blue Gradient */}
      <div style={styles.hero}>
        {/* Page Type Label */}
        <div style={styles.pageTypeLabel}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.85)">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span style={styles.pageTypeLabelText}>ASSESSMENT OVERVIEW</span>
        </div>

        {/* Info Button - Top Right of Hero */}
        <div style={styles.heroInfoButtonContainer}>
          <HeroInfoButton title={ASSESSMENT_EXPLANATION.title}>
            <div style={styles.infoModalBody}>
              <div style={styles.infoSection}>
                <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                <p style={styles.infoText}>{ASSESSMENT_EXPLANATION.whatThisShows}</p>
              </div>
              <div style={styles.infoSection}>
                <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                <ul style={styles.infoList}>
                  <li><strong>Score:</strong> {ASSESSMENT_EXPLANATION.keyMetrics.score}</li>
                  <li><strong>Rating:</strong> {ASSESSMENT_EXPLANATION.keyMetrics.rating}</li>
                  <li><strong>Trend:</strong> {ASSESSMENT_EXPLANATION.keyMetrics.trend}</li>
                </ul>
              </div>
              <div style={styles.infoSection}>
                <h4 style={styles.infoSectionTitle}>How To Use This</h4>
                <ul style={styles.infoList}>
                  {ASSESSMENT_EXPLANATION.howToUse.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </HeroInfoButton>
        </div>
        <div style={styles.heroContent}>
          <h1 style={styles.question}>Can you trust your Jira data?</h1>
          <p style={styles.description}>
            This score reflects your team's Jira health across all dimensions,
            enabling confident planning, forecasting, and decision-making.
          </p>

          {/* Redesigned Hero Metrics Card */}
          {(() => {
            // Get component values and availability
            const cssScoreRaw = healthScore.cssScore ?? healthScore.percentileComponent;
            const trsScoreRaw = healthScore.trsScore;
            const pgsScoreRaw = healthScore.pgsScore;

            const cssScore = Math.round(cssScoreRaw ?? 50);
            const trsScore = trsScoreRaw !== null && trsScoreRaw !== undefined ? Math.round(trsScoreRaw) : null;
            const pgsScore = pgsScoreRaw !== null && pgsScoreRaw !== undefined ? Math.round(pgsScoreRaw) : null;

            // Determine component availability
            const componentsAvailable = healthScore.componentsAvailable ?? {
              css: true,
              trs: trsScore !== null,
              pgs: pgsScore !== null,
            };

            const ciLower = healthScore.confidenceInterval?.lower ?? healthScore.compositeScore - 8;
            const ciUpper = healthScore.confidenceInterval?.upper ?? healthScore.compositeScore + 8;
            const precision = calculatePrecision(ciLower, ciUpper);

            const isFullScore = componentsAvailable.css && componentsAvailable.trs && componentsAvailable.pgs;
            const isLimitedScore = componentsAvailable.css && !componentsAvailable.trs && !componentsAvailable.pgs;

            // Ring gauge component with unavailable state
            const RingGauge: React.FC<{ score: number | null; color: string; size?: number; available?: boolean }> = ({
              score, color, size = 52, available = true
            }) => {
              const strokeWidth = 5;
              const radius = (size - strokeWidth) / 2;
              const circumference = 2 * Math.PI * radius;
              const progress = available && score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0;
              const dashOffset = circumference * (1 - progress);

              return (
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', opacity: available ? 1 : 0.4 }}>
                  {/* Background circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E4E6EB"
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={available ? color : '#C1C7D0'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
              );
            };

            // Calculate weighted contributions for hover display
            const cssContribution = Math.round(cssScore * 0.50);
            const trsContribution = componentsAvailable.trs && trsScore !== null ? Math.round(trsScore * 0.35) : 0;
            const pgsContribution = componentsAvailable.pgs && pgsScore !== null ? Math.round(pgsScore * 0.15) : 0;

            // State for hover
            const [showBreakdown, setShowBreakdown] = React.useState(false);

            return (
              <div style={styles.heroCard}>
                {/* Methodology icon button - top right */}
                <CalculationButton title="How is this calculated?" variant="icon">
                  <div style={styles.modalBody}>
                    <p style={styles.modalIntro}>
                      Your Health Score uses the <strong>Composite Health Score (CHS)</strong> methodology,
                      combining three components weighted by their importance to overall Jira health.
                    </p>
                    <div style={styles.formulaSection}>
                      <h4 style={styles.formulaSectionTitle}>The Formula</h4>
                      <div style={styles.formulaBox}>
                        <div style={styles.formulaItem}>
                          <span style={styles.formulaNumber}>{cssScore}</span>
                          <span style={styles.formulaLabel}>Current State</span>
                          <span style={styles.formulaWeight}>× 50%</span>
                        </div>
                        <span style={styles.formulaOperator}>+</span>
                        <div style={styles.formulaItem}>
                          <span style={styles.formulaNumber}>{trsScore ?? '—'}</span>
                          <span style={styles.formulaLabel}>Trajectory</span>
                          <span style={styles.formulaWeight}>× 35%</span>
                        </div>
                        <span style={styles.formulaOperator}>+</span>
                        <div style={styles.formulaItem}>
                          <span style={styles.formulaNumber}>{pgsScore ?? '—'}</span>
                          <span style={styles.formulaLabel}>Peer Growth</span>
                          <span style={styles.formulaWeight}>× 15%</span>
                        </div>
                        <span style={styles.formulaOperator}>=</span>
                        <div style={styles.formulaItem}>
                          <span style={{...styles.formulaNumber, color: chsCategory.color}}>{healthScore.compositeScore}</span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.componentExplainer}>
                      <h4 style={styles.componentExplainerTitle}>What Each Component Measures</h4>
                      <div style={styles.componentExplainerList}>
                        <div style={styles.componentExplainerItem}>
                          <div style={{...styles.componentDot, backgroundColor: '#0052CC'}} />
                          <div>
                            <strong>Current State (CSS)</strong>: How your indicators compare to peers right now
                          </div>
                        </div>
                        <div style={styles.componentExplainerItem}>
                          <div style={{...styles.componentDot, backgroundColor: '#36B37E'}} />
                          <div>
                            <strong>Trajectory (TRS)</strong>: Whether you're improving, stable, or declining over time
                          </div>
                        </div>
                        <div style={styles.componentExplainerItem}>
                          <div style={{...styles.componentDot, backgroundColor: '#6554C0'}} />
                          <div>
                            <strong>Peer Growth (PGS)</strong>: How your improvement rate compares to similar teams
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={styles.scaleReference}>
                      <h4 style={styles.scaleReferenceTitle}>Health Score Categories</h4>
                      <div style={styles.scaleReferenceBar}>
                        {[...CHS_CATEGORIES].reverse().map(cat => (
                          <div key={cat.category} style={{...styles.scaleRefSegment, backgroundColor: cat.color}}>
                            <span>{cat.min}-{cat.max === 101 ? 100 : cat.max}</span>
                            <span>{cat.shortLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CalculationButton>

                {/* LEFT: Score with hover breakdown */}
                <div style={styles.scoreSection}>
                  <div
                    style={styles.scoreRingWrapper}
                    onMouseEnter={() => setShowBreakdown(true)}
                    onMouseLeave={() => setShowBreakdown(false)}
                  >
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      {/* Background circle */}
                      <circle
                        cx="90"
                        cy="90"
                        r="75"
                        fill="none"
                        stroke="#E4E6EB"
                        strokeWidth="16"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="90"
                        cy="90"
                        r="75"
                        fill="none"
                        stroke={chsCategory.color}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 75}
                        strokeDashoffset={2 * Math.PI * 75 * (1 - healthScore.compositeScore / 100)}
                        transform="rotate(-90 90 90)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div style={styles.scoreCenter}>
                      <span style={styles.scoreBig}>{healthScore.compositeScore}</span>
                      <span style={styles.scoreOf100}>/100</span>
                    </div>

                    {/* Hover breakdown tooltip */}
                    {showBreakdown && (
                      <div style={styles.breakdownTooltip}>
                        <div style={styles.breakdownTitle}>Score Breakdown</div>
                        <div style={styles.breakdownRow}>
                          <span style={{...styles.breakdownDot, backgroundColor: '#0052CC'}} />
                          <span style={styles.breakdownLabel}>Current State</span>
                          <span style={styles.breakdownCalc}>{cssScore} × 50%</span>
                          <span style={styles.breakdownValue}>= {cssContribution}</span>
                        </div>
                        <div style={{...styles.breakdownRow, opacity: componentsAvailable.trs ? 1 : 0.5}}>
                          <span style={{...styles.breakdownDot, backgroundColor: '#36B37E'}} />
                          <span style={styles.breakdownLabel}>Trajectory</span>
                          <span style={styles.breakdownCalc}>{trsScore ?? '—'} × 35%</span>
                          <span style={styles.breakdownValue}>= {componentsAvailable.trs ? trsContribution : '—'}</span>
                        </div>
                        <div style={{...styles.breakdownRow, opacity: componentsAvailable.pgs ? 1 : 0.5}}>
                          <span style={{...styles.breakdownDot, backgroundColor: '#6554C0'}} />
                          <span style={styles.breakdownLabel}>Peer Growth</span>
                          <span style={styles.breakdownCalc}>{pgsScore ?? '—'} × 15%</span>
                          <span style={styles.breakdownValue}>= {componentsAvailable.pgs ? pgsContribution : '—'}</span>
                        </div>
                        <div style={styles.breakdownTotal}>
                          <span>Total</span>
                          <span style={{color: chsCategory.color, fontWeight: 700}}>{healthScore.compositeScore}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{
                    ...styles.ratingPill,
                    backgroundColor: chsCategory.bgColor,
                    color: chsCategory.color,
                    borderColor: chsCategory.borderColor,
                  }}>
                    {chsCategory.name} Health
                  </div>
                  <span style={styles.hoverHint}>Hover for breakdown</span>
                </div>

                {/* Vertical Divider */}
                <div style={styles.verticalDivider} />

                {/* RIGHT: Precision with CI visualization */}
                <div style={styles.precisionSection}>
                  <span style={styles.sectionTitle}>PRECISION</span>

                  <div style={{
                    ...styles.precisionBadge,
                    backgroundColor: precision.bgColor,
                    borderColor: precision.color,
                  }}>
                    <span style={{...styles.precisionDot, backgroundColor: precision.color}} />
                    <span style={{...styles.precisionLabel, color: precision.color}}>{precision.label}</span>
                  </div>

                  {/* CI Visualization - horizontal bar */}
                  <div style={styles.ciContainer}>
                    <div style={styles.ciBar}>
                      {/* Scale markers */}
                      <div style={styles.ciScaleMarkers}>
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                      {/* The bar */}
                      <div style={styles.ciTrackBar}>
                        {/* CI Range */}
                        <div style={{
                          ...styles.ciRangeBar,
                          left: `${ciLower}%`,
                          width: `${ciUpper - ciLower}%`,
                          backgroundColor: `${precision.color}25`,
                          borderColor: precision.color,
                        }} />
                        {/* Score marker */}
                        <div style={{
                          ...styles.ciScoreMarker,
                          left: `${healthScore.compositeScore}%`,
                          backgroundColor: chsCategory.color,
                        }} />
                      </div>
                    </div>
                    {/* CI range display - centered, non-overlapping */}
                    <div style={styles.ciRangeDisplay}>
                      <span style={styles.ciRangeValue}>{ciLower}</span>
                      <span style={styles.ciRangeSeparator}>—</span>
                      <span style={{...styles.ciRangeValue, fontWeight: 700, color: chsCategory.color}}>{healthScore.compositeScore}</span>
                      <span style={styles.ciRangeSeparator}>—</span>
                      <span style={styles.ciRangeValue}>{ciUpper}</span>
                    </div>
                    <div style={styles.ciCaption}>90% confidence interval</div>
                  </div>

                  <p style={styles.precisionText}>
                    {precision.explanation}
                  </p>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Ceiling Guidance for High-Performing Teams (CHS >= 75) */}
      {(() => {
        const ceilingGuidance = getCeilingGuidance(healthScore.compositeScore);
        if (!ceilingGuidance) return null;
        return (
          <div style={styles.ceilingGuidanceBanner}>
            <div style={styles.ceilingGuidanceIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#006644">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div style={styles.ceilingGuidanceContent}>
              <h3 style={styles.ceilingGuidanceTitle}>{ceilingGuidance.title}</h3>
              <p style={styles.ceilingGuidanceMessage}>{ceilingGuidance.message}</p>
              <p style={styles.ceilingGuidanceCPS}>{ceilingGuidance.cpsInterpretation}</p>
            </div>
          </div>
        );
      })()}

      {/* How You Compare Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How You Compare</h2>

        {/* Tooltip */}
        {tooltip.visible && (
          <div style={{
            ...styles.tooltip,
            left: tooltip.x,
            top: tooltip.y - 8,
          }}>
            <div style={styles.tooltipLabel}>{tooltip.label}</div>
            <div style={styles.tooltipValue}>{tooltip.value}</div>
            <div style={styles.tooltipArrow} />
          </div>
        )}

        <div style={styles.spectrumLayout}>
          {/* Left endpoint */}
          <div style={styles.endpointLeft}>
            <span style={styles.endpointLabel}>← {spectrumEndpoints.min.label.toUpperCase()}</span>
            <p style={styles.endpointDescription}>{spectrumEndpoints.min.description}</p>
          </div>

          {/* Center: Spectrum visualization */}
          <div style={styles.spectrumCenter}>
            {/* Comparison teams scattered above */}
            <div style={styles.comparisonTeamsArea}>
              {comparisonTeamPositions.map((pos, idx) => {
                const verticalOffset = ((Math.sin(idx * 1234) + 1) / 2) * 18 + 4;
                const dotCategory = getCHSCategoryConfig(Math.round(pos));
                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.comparisonDot,
                      left: `${pos}%`,
                      bottom: `${verticalOffset}px`,
                      backgroundColor: dotCategory.color,
                      opacity: 0.6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => handleDotMouseEnter(e, pos, idx)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </div>

            {/* Baseline indicator - label above with info button, dotted line going down */}
            <div style={styles.baselineContainer}>
              <div style={styles.baselineLabelRow}>
                <span style={styles.baselineLabel}>Baseline (50)</span>
                <button
                  style={styles.baselineInfoButton}
                  title="50 represents the average across all similar teams. Scores above 50 indicate better-than-average Jira health, while scores below 50 indicate areas for improvement."
                >
                  ?
                </button>
              </div>
              <div style={styles.baselineDottedLine} />
            </div>

            {/* Spectrum bar with gradient and position indicators */}
            <div style={styles.spectrumBarContainer}>
              {/* Score labels at ends */}
              <span style={styles.spectrumScoreLeft}>0</span>
              <span style={styles.spectrumScoreRight}>100</span>
              <div style={styles.spectrumGradient} />
              {/* Team position circle on the spectrum bar */}
              <div
                style={{
                  ...styles.teamPositionCircle,
                  left: `${yourPosition}%`,
                  backgroundColor: chsCategory.color,
                  boxShadow: `0 0 0 4px ${chsCategory.color}40`,
                }}
              />
              {/* "You are here" indicator - positioned above the circle */}
              <div
                style={{ ...styles.youAreHereContainer, left: `${yourPosition}%`, cursor: 'pointer' }}
                onMouseEnter={handleMarkerMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <span style={styles.youAreHereText}>YOU ARE HERE</span>
                <div style={{ ...styles.youAreHereArrow, borderTopColor: chsCategory.color }} />
              </div>
            </div>
          </div>

          {/* Right endpoint */}
          <div style={styles.endpointRight}>
            <span style={styles.endpointLabelGood}>{spectrumEndpoints.max.label.toUpperCase()} →</span>
            <p style={styles.endpointDescription}>{spectrumEndpoints.max.description}</p>
          </div>
        </div>
      </section>

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '24px',
  },

  // Hero Banner - Blue Gradient (matching OutcomeDetailPage)
  hero: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '32px 24px 48px',
    borderRadius: '12px',
    position: 'relative',
    marginBottom: '24px',
  },

  // Page Type Label
  pageTypeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  pageTypeLabelText: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  heroInfoButtonContainer: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },

  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },

  question: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: 'white',
    lineHeight: 1.3,
  },

  description: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.5,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  // Redesigned Hero Card - 2 columns
  heroCard: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: '700px',
    margin: '0 auto',
    overflow: 'visible',
  },

  // LEFT: Score Section with hover
  scoreSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 40px',
  },
  scoreRingWrapper: {
    position: 'relative',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  scoreCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  scoreBig: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
    display: 'block',
  },
  scoreOf100: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#6B778C',
  },
  ratingPill: {
    fontSize: '13px',
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: '20px',
    border: '1px solid',
    letterSpacing: '0.3px',
    marginBottom: '8px',
  },
  hoverHint: {
    fontSize: '11px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },

  // Breakdown tooltip on hover
  breakdownTooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '12px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    border: '1px solid #E4E6EB',
    padding: '16px',
    minWidth: '280px',
    zIndex: 100,
  },
  breakdownTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '13px',
  },
  breakdownDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  breakdownLabel: {
    flex: 1,
    color: '#42526E',
  },
  breakdownCalc: {
    color: '#97A0AF',
    fontSize: '12px',
  },
  breakdownValue: {
    fontWeight: 600,
    color: '#172B4D',
    minWidth: '36px',
    textAlign: 'right' as const,
  },
  breakdownTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '10px',
    marginTop: '4px',
    borderTop: '1px solid #E4E6EB',
    fontSize: '14px',
    fontWeight: 600,
  },

  // RIGHT: Precision Section
  precisionSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 32px',
    backgroundColor: '#FAFBFC',
    borderTopRightRadius: '16px',
    borderBottomRightRadius: '16px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  precisionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '20px',
  },
  precisionDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  precisionLabel: {
    fontSize: '16px',
    fontWeight: 600,
  },
  precisionText: {
    fontSize: '12px',
    color: '#6B778C',
    textAlign: 'center',
    lineHeight: 1.5,
    margin: '16px 0 0 0',
    maxWidth: '240px',
  },

  // CI Visualization
  ciContainer: {
    width: '100%',
    maxWidth: '240px',
  },
  ciBar: {
    position: 'relative',
    paddingTop: '16px',
    paddingBottom: '24px',
  },
  ciScaleMarkers: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#97A0AF',
    marginBottom: '4px',
  },
  ciTrackBar: {
    position: 'relative',
    height: '12px',
    backgroundColor: '#E4E6EB',
    borderRadius: '6px',
  },
  ciRangeBar: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    borderRadius: '6px',
    border: '2px solid',
  },
  ciScoreMarker: {
    position: 'absolute',
    top: '-4px',
    width: '6px',
    height: '20px',
    borderRadius: '3px',
    transform: 'translateX(-50%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  ciRangeDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  ciRangeValue: {
    fontSize: '13px',
    color: '#6B778C',
    fontWeight: 500,
  },
  ciRangeSeparator: {
    fontSize: '12px',
    color: '#C1C7D0',
  },
  ciCaption: {
    fontSize: '10px',
    color: '#97A0AF',
    textAlign: 'center',
    marginTop: '4px',
  },

  // Legacy styles kept for other parts
  columnTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  scoreRangeLabel: {
    fontSize: '10px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  scoreRangeValues: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreRangeBound: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#6B778C',
  },
  scoreRangeDash: {
    fontSize: '14px',
    color: '#C1C7D0',
  },
  scoreRangeCenter: {
    fontSize: '22px',
    fontWeight: 700,
  },
  ciVisual: {
    width: '100%',
    maxWidth: '140px',
  },
  ciTrack: {
    position: 'relative',
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  ciRange: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    borderRadius: '4px',
    border: '1px solid',
  },
  ciMarker: {
    position: 'absolute',
    top: '-2px',
    width: '4px',
    height: '12px',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
  },
  ciLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#6B778C',
  },
  ciLabelCenter: {
    fontWeight: 600,
    color: '#172B4D',
  },

  precisionTooltipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  precisionTooltipTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  precisionTooltipClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6B778C',
    padding: '0',
    lineHeight: 1,
  },
  precisionTooltipText: {
    fontSize: '11px',
    color: '#42526E',
    lineHeight: 1.5,
    margin: 0,
  },

  // Confidence Band Visualization
  confidenceBand: {
    width: '100%',
    maxWidth: '180px',
  },
  confidenceTrack: {
    position: 'relative',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  confidenceZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    opacity: 0.6,
  },
  confidenceRange: {
    position: 'absolute',
    top: '2px',
    bottom: '2px',
    backgroundColor: 'rgba(23, 43, 77, 0.25)',
    borderRadius: '4px',
    border: '1px solid rgba(23, 43, 77, 0.3)',
  },
  scoreMarker: {
    position: 'absolute',
    top: '-2px',
    bottom: '-2px',
    width: '4px',
    backgroundColor: '#172B4D',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  confidenceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  confidenceLabelLeft: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  confidenceLabelCenter: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  confidenceLabelRight: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },

  // VERTICAL DIVIDER
  verticalDivider: {
    width: '1px',
    backgroundColor: '#EBECF0',
    margin: '20px 0',
  },

  // RIGHT SECTION: Component Cards
  componentsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 28px',
  },
  componentsSectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  componentCards: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  componentCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    backgroundColor: '#FAFBFC',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
  },
  componentCardUnavailable: {
    backgroundColor: '#F4F5F7',
    borderStyle: 'dashed',
    borderColor: '#DFE1E6',
  },
  componentGaugeWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  componentGaugeValue: {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
  },
  componentCardName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center',
    marginBottom: '2px',
  },
  componentCardWeight: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },

  // Component Explainer in Modal
  componentExplainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
  },
  componentExplainerTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  componentExplainerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  componentExplainerItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  componentDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },
  componentBarInner: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  // Legacy styles kept for modal content
  componentsBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  componentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  componentInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    minWidth: '110px',
  },
  componentName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
  },
  componentWeight: {
    fontSize: '10px',
    color: '#6B778C',
  },
  componentScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  componentScore: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#172B4D',
    minWidth: '24px',
    textAlign: 'right' as const,
  },
  componentTrendIndicator: {
    fontSize: '14px',
    fontWeight: 700,
  },
  componentBarContainer: {
    flex: 1,
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  componentBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  // Section Styles
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  // Ceiling Guidance Banner for High-Performing Teams
  ceilingGuidanceBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px 24px',
    backgroundColor: '#E3FCEF',
    borderRadius: '12px',
    border: '1px solid #ABF5D1',
    marginBottom: '24px',
  },
  ceilingGuidanceIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  ceilingGuidanceContent: {
    flex: 1,
  },
  ceilingGuidanceTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#006644',
  },
  ceilingGuidanceMessage: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#1E4620',
    lineHeight: 1.5,
  },
  ceilingGuidanceCPS: {
    margin: 0,
    fontSize: '13px',
    color: '#00875A',
    fontStyle: 'italic',
  },

  // Tooltip styles
  tooltip: {
    position: 'fixed',
    transform: 'translate(-50%, -100%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    pointerEvents: 'none',
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: '2px',
  },
  tooltipValue: {
    color: '#B3BAC5',
  },
  tooltipArrow: {
    position: 'absolute',
    left: '50%',
    bottom: '-6px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },

  howCalculatedLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.15s ease',
  },

  // Spectrum Visualization (3-column layout)
  spectrumLayout: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },

  endpointLeft: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  endpointRight: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'right',
  },

  endpointLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#CA3521',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  endpointLabelGood: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#216E4E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  endpointDescription: {
    margin: 0,
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#6B778C',
    lineHeight: 1.4,
  },

  spectrumCenter: {
    flex: 1,
    position: 'relative',
    minHeight: '90px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  comparisonTeamsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35px',
  },

  comparisonDot: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
  },

  youAreHereContainer: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: '2px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 4,
  },

  youAreHereText: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    marginBottom: '3px',
  },

  youAreHereArrow: {
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '7px solid #5E6C84',
  },

  spectrumBarContainer: {
    position: 'relative',
    height: '24px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },

  spectrumScoreLeft: {
    position: 'absolute',
    left: '-20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },

  spectrumScoreRight: {
    position: 'absolute',
    right: '-28px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },

  spectrumGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '8px',
    borderRadius: '4px',
    // CHS 5-zone gradient: Needs Attention (0-30), Below Average (30-45), Average (45-55), Good (55-70), Excellent (70-100)
    background: 'linear-gradient(to right, #DE350B 0%, #DE350B 30%, #FF8B00 30%, #FF8B00 45%, #6B778C 45%, #6B778C 55%, #00875A 55%, #00875A 70%, #006644 70%, #006644 100%)',
    opacity: 0.5,
  },

  baselineContainer: {
    position: 'absolute',
    left: '50%',
    top: '-10px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
  },

  baselineLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '2px',
  },

  baselineLabel: {
    fontSize: '9px',
    color: '#6B778C',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '1px 6px',
    borderRadius: '2px',
  },

  baselineInfoButton: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '1px solid #6B778C',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: '9px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },

  baselineDottedLine: {
    width: '1px',
    height: '65px',
    backgroundImage: 'repeating-linear-gradient(to bottom, #6B778C 0, #6B778C 3px, transparent 3px, transparent 6px)',
    opacity: 0.5,
  },

  teamPositionCircle: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '3px solid white',
    zIndex: 3,
  },

  teamCountLabel: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#97A0AF',
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    maxWidth: '720px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  modalBody: {
    padding: '24px',
  },
  modalIntro: {
    fontSize: '15px',
    color: '#42526E',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
  },

  // Formula section
  formulaSection: {
    marginBottom: '32px',
  },
  formulaBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    flexWrap: 'wrap',
  },
  formulaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  formulaNumber: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
  },
  formulaLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  formulaWeight: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: 600,
  },
  formulaOperator: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#6B778C',
  },

  // Steps section
  stepsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  step: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
  },
  stepTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepContent: {
    paddingLeft: '40px',
  },
  stepDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.5,
  },

  // Final score visual
  finalScoreVisual: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '12px',
  },
  scoreComponent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  scoreComponentBar: {
    height: '8px',
    backgroundColor: '#E4E6EB',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  scoreComponentFill: {
    height: '100%',
    borderRadius: '4px',
  },
  scoreComponentLabel: {
    fontSize: '13px',
    color: '#42526E',
  },

  // Scale reference
  scaleReference: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
  },
  scaleReferenceTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  scaleReferenceBar: {
    display: 'flex',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  scaleRefSegment: {
    flex: 1,
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
    textAlign: 'center',
  },

  // Info Modal Content Styles
  infoModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  infoSection: {
    padding: '16px 0',
    borderBottom: '1px solid #EBECF0',
  },
  infoSectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#42526E',
    lineHeight: 1.7,
  },
  infoList: {
    margin: 0,
    paddingLeft: '0',
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
};

export default HealthScoreHero;
