import React, { useMemo, useState } from 'react';
import {
  OutcomeConfidenceResult,
} from '../../../types/outcomeConfidence';
import { DimensionResult, ComparisonTeam } from '../../../types/assessment';
import { getIndicatorTier, INDICATOR_TIERS } from '../../../types/indicatorTiers';
import { getCHSCategoryConfig, CHS_CATEGORIES } from '../../../constants/chsCategories';
import { calculatePrecision } from '../../../utils/precisionIndicator';
import OutcomeDimensionTable from './OutcomeDimensionTable';
import NavigationBar from '../common/NavigationBar';
import HeroInfoButton from '../../common/HeroInfoButton';
import CalculationButton from '../../common/CalculationButton';
import ComparisonExplainer from '../common/ComparisonExplainer';
import { OUTCOME_EXPLANATIONS } from '../../../constants/pageExplanations';
import { OUTCOME_CALCULATION } from '../../../constants/calculationExplanations';
import { getOutcomeIcon } from '../../../constants/dimensionIcons';

interface OutcomeDetailPageProps {
  outcome: OutcomeConfidenceResult;
  dimensions: DimensionResult[];
  onBack: () => void;
  onDimensionClick: (dimensionKey: string) => void;
  // Team context info for header
  teamName?: string;
  dateRange?: { startDate: string; endDate: string };
  dataGrouping?: string;
  // Comparison group info
  comparisonTeamCount?: number;
  comparisonTeams?: ComparisonTeam[];
  comparisonCriteria?: string[];
  onViewComparisonTeams?: () => void;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
}


// Get trend display with colors optimized for blue background
const getTrendDisplay = (trend: 'up' | 'down' | 'stable'): { icon: string; label: string; color: string } => {
  switch (trend) {
    case 'up': return { icon: 'up', label: 'Improving', color: '#57D9A3' }; // Vibrant green
    case 'down': return { icon: 'down', label: 'Declining', color: '#FF7452' }; // Vibrant coral
    case 'stable': return { icon: 'stable', label: 'Stable', color: '#FFFFFF' }; // Full white
  }
};

// Generate mock comparison team positions for spectrum visualization
const generateComparisonTeams = (outcomeId: string, teamCount: number = 47): number[] => {
  const seed = outcomeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const positions: number[] = [];

  for (let i = 0; i < teamCount; i++) {
    const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
    const normalized = (pseudoRandom - Math.floor(pseudoRandom));
    const position = Math.max(5, Math.min(95, normalized * 100));
    positions.push(position);
  }

  return positions;
};

const OutcomeDetailPage: React.FC<OutcomeDetailPageProps> = ({
  outcome,
  dimensions,
  onBack,
  onDimensionClick,
  teamName,
  dateRange,
  dataGrouping,
  comparisonTeamCount = 47,
  comparisonTeams = [],
  comparisonCriteria = [],
  onViewComparisonTeams,
}) => {
  // Tooltip state
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
  });

  // Tooltip handlers
  const handleDotMouseEnter = (e: React.MouseEvent, position: number, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
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
      value: `Score: ${outcome.finalScore}`,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  const tier = getIndicatorTier(outcome.finalScore);
  const chsCategory = getCHSCategoryConfig(outcome.finalScore);

  // Filter dimensions to only those that contribute to this outcome
  const outcomeDimensions = useMemo(() => {
    const contributingKeys = new Set<string>(
      outcome.contributions
        .filter(c => !c.isMissing)
        .map(c => c.dimensionKey as string)
    );
    return dimensions.filter(d => contributingKeys.has(d.dimensionKey));
  }, [dimensions, outcome.contributions]);

  const missingContributions = outcome.contributions.filter(c => c.isMissing);

  // Calculate stats for the summary bar
  const dimensionStats = useMemo(() => {
    const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let improved = 0, declined = 0, stable = 0;

    outcomeDimensions.forEach(d => {
      const t = getIndicatorTier(d.healthScore);
      tierCounts[t.level]++;

      if (d.trendData && d.trendData.length >= 2) {
        const firstHealthScore = d.trendData[0].healthScore ?? d.trendData[0].value;
        const lastHealthScore = d.trendData[d.trendData.length - 1].healthScore ?? d.healthScore;
        const firstTier = getIndicatorTier(firstHealthScore).level;
        const lastTier = getIndicatorTier(lastHealthScore).level;
        if (lastTier > firstTier) improved++;
        else if (lastTier < firstTier) declined++;
        else stable++;
      } else {
        stable++;
      }
    });

    return { tierCounts, improved, declined, stable, total: outcomeDimensions.length };
  }, [outcomeDimensions]);

  const indicatorStats = useMemo(() => {
    let total = 0, needingAttention = 0, improving = 0, declining = 0, stable = 0;

    outcomeDimensions.forEach(d => {
      d.categories.forEach(cat => {
        cat.indicators.forEach(ind => {
          total++;
          if (getIndicatorTier(ind.benchmarkPercentile).level <= 2) needingAttention++;
          if (ind.trend === 'improving') improving++;
          else if (ind.trend === 'declining') declining++;
          else stable++;
        });
      });
    });

    return { total, needingAttention, improving, declining, stable };
  }, [outcomeDimensions]);

  // Build tier segments for stacked bar (only non-zero)
  const tierSegments = INDICATOR_TIERS
    .map(t => ({ tier: t, count: dimensionStats.tierCounts[t.level] }))
    .filter(s => s.count > 0);

  const attentionPct = indicatorStats.total > 0
    ? Math.round((indicatorStats.needingAttention / indicatorStats.total) * 100)
    : 0;

  // Spectrum visualization data
  const comparisonTeamPositions = useMemo(
    () => generateComparisonTeams(outcome.id, 47),
    [outcome.id]
  );
  // Map score directly to position (score 50 = 50% position)
  const yourPosition = outcome.finalScore;

  return (
    <div style={styles.container}>
      {/* Team Context Header (compact single row - matching IndicatorDrillDownPage) */}
      <header style={styles.teamHeader}>
        <div style={styles.teamHeaderContent}>
          <h1 style={styles.teamTitle}>
            Jira Health Assessment
            {teamName && (
              <span style={styles.teamNameInline}> — {teamName}</span>
            )}
          </h1>

          {dateRange && (
            <div style={styles.metadata}>
              <div style={styles.metadataItem}>
                <span style={styles.metadataLabel}>Analysis Period</span>
                <span style={styles.metadataValue}>
                  {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </span>
              </div>
              {dataGrouping && (
                <div style={styles.metadataItem}>
                  <span style={styles.metadataLabel}>Data Grouping</span>
                  <span style={styles.metadataValue}>
                    {dataGrouping.charAt(0).toUpperCase() + dataGrouping.slice(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.content}>
          {/* Navigation Bar with back button and breadcrumb */}
          <NavigationBar
            backLabel="Back to Outcomes"
            onBack={onBack}
            breadcrumbItems={['Executive Summary', outcome.name]}
          />

          {/* Comparison Explainer - consistent across pages */}
          {onViewComparisonTeams && (
            <ComparisonExplainer
              teamCount={comparisonTeamCount}
              teams={comparisonTeams}
              criteria={comparisonCriteria}
              onViewTeams={onViewComparisonTeams}
            />
          )}

          {/* Hero Banner */}
          <div style={styles.hero}>
            {/* Page Type Label */}
            <div style={styles.pageTypeLabel}>
              <span style={styles.pageTypeIcon}>
                {getOutcomeIcon(outcome.id, 'small', 'rgba(255, 255, 255, 0.85)')}
              </span>
              <span style={styles.pageTypeLabelText}>OUTCOME · {outcome.shortName}</span>
            </div>

            {/* Info Button - Top Right of Hero */}
            <div style={styles.heroInfoButtonContainer}>
              <HeroInfoButton title={OUTCOME_EXPLANATIONS[outcome.id]?.title || `About ${outcome.name}`}>
                <div style={styles.infoModalBody}>
                  <div style={styles.infoSection}>
                    <h4 style={styles.infoSectionTitle}>What This Shows</h4>
                    <p style={styles.infoText}>
                      {OUTCOME_EXPLANATIONS[outcome.id]?.whatThisShows || outcome.description}
                    </p>
                  </div>
                  <div style={styles.infoSection}>
                    <h4 style={styles.infoSectionTitle}>Key Metrics</h4>
                    <ul style={styles.infoList}>
                      <li><strong>Score:</strong> {OUTCOME_EXPLANATIONS[outcome.id]?.keyMetrics.score || 'How well your data supports this outcome (0-100).'}</li>
                      <li><strong>Rating:</strong> {OUTCOME_EXPLANATIONS[outcome.id]?.keyMetrics.rating || 'Your reliability level for this outcome.'}</li>
                      <li><strong>Trend:</strong> {OUTCOME_EXPLANATIONS[outcome.id]?.keyMetrics.trend || 'Whether this capability is improving or declining.'}</li>
                    </ul>
                  </div>
                  <div style={styles.infoSection}>
                    <h4 style={styles.infoSectionTitle}>How To Use This</h4>
                    <ul style={styles.infoList}>
                      {(OUTCOME_EXPLANATIONS[outcome.id]?.howToUse || [
                        'Review the contributing dimensions to understand what affects this score.',
                        'Focus on dimensions with the highest weights for maximum impact.',
                        'Check for dimensions below critical thresholds that may be blocking improvement.',
                      ]).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </HeroInfoButton>
            </div>
            <div style={styles.heroContent}>
              <h1 style={styles.heroQuestion}>{outcome.question}</h1>
              <p style={styles.description}>{outcome.description}</p>

              {/* Unified Metrics Card */}
              {(() => {
                const trendDisplay = getTrendDisplay(outcome.trend);
                // Get darker colors for the white card
                const trendColors = {
                  up: '#36B37E',
                  down: '#FF5630',
                  stable: '#6B778C',
                }[outcome.trend];

                // Get component values and availability
                const cssScoreRaw = outcome.cssScore;
                const trsScoreRaw = outcome.trsScore;
                const pgsScoreRaw = outcome.pgsScore;

                const cssScore = cssScoreRaw !== undefined ? Math.round(cssScoreRaw) : 50;
                const trsScore = trsScoreRaw !== null && trsScoreRaw !== undefined ? Math.round(trsScoreRaw) : null;
                const pgsScore = pgsScoreRaw !== null && pgsScoreRaw !== undefined ? Math.round(pgsScoreRaw) : null;

                // Determine component availability
                const componentsAvailable = outcome.componentsAvailable ?? {
                  css: true,
                  trs: trsScore !== null,
                  pgs: pgsScore !== null,
                };

                const ciLower = outcome.confidenceInterval?.lower ?? outcome.finalScore - 8;
                const ciUpper = outcome.confidenceInterval?.upper ?? outcome.finalScore + 8;
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
                      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E4E6EB" strokeWidth={strokeWidth} />
                      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={available ? color : '#C1C7D0'} strokeWidth={strokeWidth}
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                    </svg>
                  );
                };

                // Calculate weighted contributions for hover
                const cssContribution = Math.round(cssScore * 0.50);
                const trsContribution = componentsAvailable.trs && trsScore !== null ? Math.round(trsScore * 0.35) : 0;
                const pgsContribution = componentsAvailable.pgs && pgsScore !== null ? Math.round(pgsScore * 0.15) : 0;

                // State for hover breakdown
                const [showBreakdown, setShowBreakdown] = React.useState(false);

                return (
                  <div style={styles.heroCard}>
                    {/* Methodology icon button - top right */}
                    <CalculationButton title="How is this calculated?" variant="icon">
                      <div style={styles.calculationModalBody}>
                        <p style={styles.calculationIntro}>
                          This score uses the <strong>Composite Health Score (CHS)</strong> methodology,
                          combining current state, trajectory, and peer comparison.
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
                              <span style={{...styles.formulaNumber, color: chsCategory.color}}>{outcome.finalScore}</span>
                            </div>
                          </div>
                        </div>
                        <div style={styles.componentExplainer}>
                          <h4 style={styles.componentExplainerTitle}>What Each Component Measures</h4>
                          <div style={styles.componentExplainerList}>
                            <div style={styles.componentExplainerItem}>
                              <div style={{...styles.componentDot, backgroundColor: '#0052CC'}} />
                              <div><strong>Current State</strong>: How indicators in this outcome compare to peers right now</div>
                            </div>
                            <div style={styles.componentExplainerItem}>
                              <div style={{...styles.componentDot, backgroundColor: '#36B37E'}} />
                              <div><strong>Trajectory</strong>: Whether you're improving, stable, or declining over time</div>
                            </div>
                            <div style={styles.componentExplainerItem}>
                              <div style={{...styles.componentDot, backgroundColor: '#6554C0'}} />
                              <div><strong>Peer Growth</strong>: How your improvement rate compares to similar teams</div>
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
                          <circle cx="90" cy="90" r="75" fill="none" stroke="#E4E6EB" strokeWidth="16" />
                          <circle
                            cx="90" cy="90" r="75" fill="none"
                            stroke={chsCategory.color} strokeWidth="16" strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 75}
                            strokeDashoffset={2 * Math.PI * 75 * (1 - outcome.finalScore / 100)}
                            transform="rotate(-90 90 90)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                          />
                        </svg>
                        <div style={styles.scoreCenter}>
                          <span style={styles.scoreBig}>{outcome.finalScore}</span>
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
                              <span style={{color: chsCategory.color, fontWeight: 700}}>{outcome.finalScore}</span>
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
                      <span style={styles.sectionTitleSmall}>PRECISION</span>

                      <div style={{
                        ...styles.precisionBadgeLarge,
                        backgroundColor: precision.bgColor,
                        borderColor: precision.color,
                      }}>
                        <span style={{...styles.precisionDotLarge, backgroundColor: precision.color}} />
                        <span style={{...styles.precisionLabelLarge, color: precision.color}}>{precision.label}</span>
                      </div>

                      {/* CI Visualization */}
                      <div style={styles.ciContainer}>
                        <div style={styles.ciBar}>
                          <div style={styles.ciScaleMarkers}>
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                          </div>
                          <div style={styles.ciTrackBar}>
                            <div style={{
                              ...styles.ciRangeBar,
                              left: `${ciLower}%`,
                              width: `${ciUpper - ciLower}%`,
                              backgroundColor: `${precision.color}25`,
                              borderColor: precision.color,
                            }} />
                            <div style={{
                              ...styles.ciScoreMarker,
                              left: `${outcome.finalScore}%`,
                              backgroundColor: chsCategory.color,
                            }} />
                          </div>
                        </div>
                        {/* CI range display - centered, non-overlapping */}
                        <div style={styles.ciRangeDisplay}>
                          <span style={styles.ciRangeValue}>{ciLower}</span>
                          <span style={styles.ciRangeSeparator}>—</span>
                          <span style={{...styles.ciRangeValue, fontWeight: 700, color: chsCategory.color}}>{outcome.finalScore}</span>
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
                <span style={styles.endpointLabel}>← {outcome.spectrumEndpoints.min.label.toUpperCase()}</span>
                <p style={styles.endpointDescription}>{outcome.spectrumEndpoints.min.description}</p>
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
                <span style={styles.endpointLabelGood}>{outcome.spectrumEndpoints.max.label.toUpperCase()} →</span>
                <p style={styles.endpointDescription}>{outcome.spectrumEndpoints.max.description}</p>
              </div>
            </div>
          </section>

          {/* Contributing Dimensions Table */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Contributing Dimensions</h2>

            {/* Stats Summary Bar */}
            <div style={styles.statsSummaryBar}>
              {/* Dimension Health */}
              <div style={styles.statsPanel}>
                <div style={styles.statsPanelHeader}>
                  <span style={styles.statsPanelLabel}>Dimension Health</span>
                  <span style={styles.statsPanelValue}>{dimensionStats.total} dimensions</span>
                </div>
                <div style={styles.stackedBar}>
                  {tierSegments.map(({ tier: t, count }) => (
                    <div
                      key={t.level}
                      style={{
                        ...styles.barSegment,
                        flex: count,
                        backgroundColor: t.color,
                      }}
                      title={`${count} ${t.name}`}
                    >
                      <span style={styles.segmentCount}>{count}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.legendRow}>
                  {tierSegments.map(({ tier: t }) => (
                    <span key={t.level} style={styles.legendItem}>
                      <span style={{ ...styles.legendDot, backgroundColor: t.color }} />
                      <span style={styles.legendText}>{t.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.statsDivider} />

              {/* Trend Movement */}
              <div style={styles.statsPanel}>
                <div style={styles.statsPanelHeader}>
                  <span style={styles.statsPanelLabel}>Trend Movement</span>
                </div>
                <div style={styles.trendStats}>
                  <div style={styles.trendItem}>
                    <span style={{ ...styles.trendIcon, color: '#36B37E' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg></span>
                    <span style={styles.trendCount}>{dimensionStats.improved}</span>
                    <span style={styles.trendLabel}>improved</span>
                  </div>
                  <div style={styles.trendItem}>
                    <span style={{ ...styles.trendIcon, color: '#DE350B' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg></span>
                    <span style={styles.trendCount}>{dimensionStats.declined}</span>
                    <span style={styles.trendLabel}>declined</span>
                  </div>
                  <div style={styles.trendItem}>
                    <span style={{ ...styles.trendIcon, color: '#6B778C' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg></span>
                    <span style={styles.trendCount}>{dimensionStats.stable}</span>
                    <span style={styles.trendLabel}>stable</span>
                  </div>
                </div>
              </div>

              <div style={styles.statsDivider} />

              {/* Indicators */}
              <div style={styles.statsPanel}>
                <div style={styles.statsPanelHeader}>
                  <span style={styles.statsPanelLabel}>Indicators</span>
                  <span style={styles.statsPanelValue}>{indicatorStats.total} total</span>
                </div>
                <div style={styles.indicatorStatsRow}>
                  <span style={{
                    ...styles.attentionCount,
                    color: indicatorStats.needingAttention > 0 ? '#DE350B' : '#36B37E',
                  }}>
                    {indicatorStats.needingAttention}
                  </span>
                  <span style={styles.attentionLabel}>need attention ({attentionPct}%)</span>
                </div>
                <div style={styles.indicatorTrends}>
                  <span style={{ ...styles.miniTrend, color: '#36B37E', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>{indicatorStats.improving}</span>
                  <span style={{ ...styles.miniTrend, color: '#DE350B', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>{indicatorStats.declining}</span>
                  <span style={{ ...styles.miniTrend, color: '#6B778C', display: 'inline-flex', alignItems: 'center', gap: '2px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>{indicatorStats.stable}</span>
                </div>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <OutcomeDimensionTable
                dimensions={dimensions}
                contributions={outcome.contributions}
                onDimensionClick={onDimensionClick}
              />
            </div>

            {/* Missing dimensions notice */}
            {missingContributions.length > 0 && (
              <div style={styles.missingNotice}>
                <span style={styles.missingLabel}>Not in this assessment:</span>
                <span style={styles.missingList}>
                  {missingContributions.map(c => c.dimensionName).join(', ')}
                </span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8F9',
  },

  // Team Context Header Styles (compact single row - matching IndicatorDrillDownPage)
  teamHeader: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '16px 24px',
    color: 'white',
  },
  teamHeaderContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  teamTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: 'white',
  },
  teamNameInline: {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metadata: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metadataLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metadataValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  hero: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '32px 24px 48px',
    borderRadius: '12px',
    marginBottom: '24px',
    position: 'relative',
  },

  // Page Type Label
  pageTypeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  pageTypeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  heroQuestion: {
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

  // VERTICAL DIVIDER
  verticalDivider: {
    width: '1px',
    backgroundColor: '#EBECF0',
    margin: '20px 0',
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
  sectionTitleSmall: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  precisionBadgeLarge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '20px',
  },
  precisionDotLarge: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  precisionLabelLarge: {
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

  // Formula styles for modal
  formulaSection: {
    marginBottom: '20px',
  },
  formulaSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  formulaBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  formulaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  formulaNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  formulaLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  formulaWeight: {
    fontSize: '11px',
    color: '#0052CC',
    fontWeight: 600,
  },
  formulaOperator: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#6B778C',
  },

  // Limited Data Badge (when TRS/PGS unavailable)
  limitedDataBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#DEEBFF',
    borderRadius: '12px',
    border: '1px solid #B3D4FF',
    marginBottom: '12px',
  },
  limitedDataIcon: {
    fontSize: '12px',
    color: '#0052CC',
  },
  limitedDataText: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#0052CC',
  },

  // Component Explainer in Modal
  componentExplainer: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
    marginBottom: '16px',
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
  // Legacy styles kept for compatibility
  precisionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  precisionLabel: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  precisionBadge: {
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '3px',
  },
  precisionMargin: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  precisionInfoButton: {
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
    lineHeight: 1,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
  },
  ratingWord: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  ratingLabel: {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  // Components Breakdown Styles
  componentsSectionWide: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '280px',
  },
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

  tierMarker: {
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },

  teamCountLabel: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#97A0AF',
    textAlign: 'center',
  },

  // Main Content
  main: {
    padding: '32px 24px',
  },

  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    padding: '24px',
    marginBottom: '24px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },

  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
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

  tableContainer: {
    overflow: 'auto',
  },

  missingNotice: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#6B778C',
  },

  missingLabel: {
    fontWeight: 600,
    marginRight: '8px',
  },

  missingList: {
    fontStyle: 'italic',
  },

  // Stats Summary Bar
  statsSummaryBar: {
    display: 'flex',
    alignItems: 'stretch',
    padding: '16px 20px',
    marginBottom: '20px',
    backgroundColor: '#F7F8F9',
    borderRadius: '10px',
    gap: '20px',
  },

  statsPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    minWidth: 0,
  },

  statsPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },

  statsPanelLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  statsPanelValue: {
    fontSize: '11px',
    color: '#6B778C',
  },

  statsDivider: {
    width: '1px',
    backgroundColor: '#DFE1E6',
    alignSelf: 'stretch',
  },

  stackedBar: {
    display: 'flex',
    height: '28px',
    borderRadius: '5px',
    overflow: 'hidden',
    gap: '2px',
  },

  barSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
  },

  segmentCount: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },

  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },

  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },

  legendText: {
    fontSize: '10px',
    color: '#6B778C',
  },

  trendStats: {
    display: 'flex',
    gap: '16px',
  },

  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },


  trendCount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },

  trendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },

  indicatorStatsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },

  attentionCount: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
  },

  attentionLabel: {
    fontSize: '12px',
    color: '#5E6C84',
  },

  indicatorTrends: {
    display: 'flex',
    gap: '10px',
  },

  miniTrend: {
    fontSize: '12px',
    fontWeight: 600,
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

  // Calculation Modal Content Styles
  calculationModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  calculationIntro: {
    margin: 0,
    fontSize: '15px',
    color: '#42526E',
    lineHeight: 1.7,
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '4px solid #0052CC',
  },
  contributionsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E4E6EB',
  },
  contributionsSectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  contributionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contributionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  contributionBar: {
    width: '60px',
    height: '8px',
    backgroundColor: '#E4E6EB',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  contributionFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #0052CC 0%, #0065FF 100%)',
    borderRadius: '4px',
  },
  contributionName: {
    fontSize: '13px',
    color: '#172B4D',
    minWidth: '140px',
  },
  contributionWeight: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0052CC',
    minWidth: '40px',
    textAlign: 'right',
  },
  stepsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDescription: {
    margin: 0,
    paddingLeft: '36px',
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  additionalInfo: {
    margin: 0,
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0052CC',
    lineHeight: 1.5,
  },

  // Scale reference for Health Score Categories
  scaleReference: {
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #E4E6EB',
    marginTop: '16px',
  },
  scaleReferenceTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center' as const,
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
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
  },

  // CHS Formula Styles
  chsFormulaSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  chsFormulaTitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsFormulaDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  chsFormulaComponent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    minWidth: '70px',
  },
  chsComponentLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsComponentScore: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  chsComponentWeight: {
    fontSize: '10px',
    color: '#6B778C',
  },
  chsFormulaOperator: {
    fontSize: '20px',
    fontWeight: 500,
    color: '#6B778C',
  },
  chsFormulaResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 18px',
    backgroundColor: '#0052CC',
    borderRadius: '8px',
    minWidth: '70px',
  },
  chsResultScore: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  chsNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    border: '1px solid #FFE380',
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
    marginBottom: '12px',
  },
  chsNoteIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  chsConfidenceRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
    marginTop: '8px',
  },
  chsConfidenceLabel: {
    color: '#6B778C',
  },
  chsConfidenceValue: {
    fontWeight: 600,
    color: '#172B4D',
  },
  chsLegendSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E4E6EB',
    marginBottom: '16px',
  },
  chsLegendTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 700,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chsLegendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  chsLegendItem: {
    fontSize: '13px',
    color: '#42526E',
    lineHeight: 1.5,
  },
  contributionsSubtitle: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  contributionScore: {
    fontSize: '12px',
    color: '#6B778C',
    marginLeft: 'auto',
  },
};

export default OutcomeDetailPage;
