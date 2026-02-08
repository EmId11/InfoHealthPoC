// TeamProgressComparison Component
// Shows how your improvement compares to other teams with tier-based colors

import React, { useState } from 'react';
import { TeamProgressContext, TeamPosition } from '../../../types/impactMeasurement';
import { getIndicatorTier, INDICATOR_TIERS } from '../../../types/indicatorTiers';

interface TeamProgressComparisonProps {
  context: TeamProgressContext;
  baselineDate: string;
  measurementDate: string;
  onSimilarTeamsClick: () => void;
}

// Get tier color for a percentile
const getTierColor = (percentile: number): string => {
  return getIndicatorTier(percentile).color;
};

// Get color for a delta value: green positive, red negative, grey stable
const getDeltaColor = (change: number): string => {
  if (change > 0.5) return '#006644';   // Green for positive
  if (change < -0.5) return '#BF2600';  // Red for negative
  return '#6B778C';                      // Grey for stable
};

// Format date helper
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Calculate standard deviation (spread) of an array
const calculateStdDev = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
};

// Calculate spread metrics from team positions
const calculateSpreadMetrics = (teamPositions: TeamPosition[]) => {
  const beforeValues = teamPositions.map(t => t.beforeHealthScore);
  const afterValues = teamPositions.map(t => t.afterHealthScore);

  const beforeSpread = calculateStdDev(beforeValues);
  const afterSpread = calculateStdDev(afterValues);
  const spreadChange = afterSpread - beforeSpread;
  const spreadChangePercent = beforeSpread > 0 ? (spreadChange / beforeSpread) * 100 : 0;

  return {
    beforeSpread,
    afterSpread,
    spreadChange,
    spreadChangePercent,
    isConverging: spreadChange < -1, // More than 1 point decrease = converging
    isDiverging: spreadChange > 1,   // More than 1 point increase = diverging
  };
};


// Histogram showing distribution of team improvements with your position highlighted
const ImprovementDistributionChart: React.FC<{
  teamChanges: number[];
  yourChange: number;
  percentile: number;
}> = ({ teamChanges, yourChange, percentile }) => {
  // Create buckets for the histogram: -15 to +25 in steps of 5
  const buckets = [
    { min: -20, max: -10, label: '-10' },
    { min: -10, max: -5, label: '-5' },
    { min: -5, max: 0, label: '0' },
    { min: 0, max: 5, label: '+5' },
    { min: 5, max: 10, label: '+10' },
    { min: 10, max: 15, label: '+15' },
    { min: 15, max: 20, label: '+20' },
    { min: 20, max: 30, label: '+25' },
  ];

  // Count teams in each bucket
  const bucketCounts = buckets.map(bucket => {
    return teamChanges.filter(c => c >= bucket.min && c < bucket.max).length;
  });

  // Find which bucket "you" are in
  const yourBucketIndex = buckets.findIndex(b => yourChange >= b.min && yourChange < b.max);

  // Max count for scaling
  const maxCount = Math.max(...bucketCounts, 1);

  // Colors
  const highlightColor = '#F5A623';
  const defaultColor = '#DFE1E6';

  return (
    <div style={{ width: '100%' }}>
      {/* Chart with Y-axis label */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
        {/* Y-axis label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: 9,
          color: '#97A0AF',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          No. of teams
        </div>

        {/* Bars and X-axis */}
        <div style={{ flex: 1 }}>
          {/* Bars */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            height: 80,
          }}>
            {bucketCounts.map((count, idx) => {
              const isYourBucket = idx === yourBucketIndex;
              const height = Math.max((count / maxCount) * 100, 12);
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    backgroundColor: isYourBucket ? highlightColor : defaultColor,
                    borderRadius: 3,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Team count inside bar */}
                  {count > 0 && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isYourBucket ? '#FFFFFF' : '#6B778C',
                    }}>
                      {count}
                    </span>
                  )}
                  {isYourBucket && (
                    <div style={{
                      position: 'absolute',
                      top: -18,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: highlightColor,
                      whiteSpace: 'nowrap',
                    }}>
                      YOU
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* X-axis range labels under each bar */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginTop: 4,
          }}>
            {buckets.map((bucket, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 8,
                  color: '#97A0AF',
                }}
              >
                {bucket.min >= 0 ? '+' : ''}{bucket.min}
              </div>
            ))}
          </div>

          {/* X-axis title */}
          <div style={{
            textAlign: 'center',
            fontSize: 9,
            color: '#97A0AF',
            marginTop: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Health score change (pts)
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeamProgressComparison: React.FC<TeamProgressComparisonProps> = ({
  context,
  baselineDate,
  measurementDate,
  onSimilarTeamsClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'before' | 'transitioning' | 'after'>('after');
  const [hoveredTeam, setHoveredTeam] = useState<TeamPosition | null>(null);
  const [showSpreadTooltip, setShowSpreadTooltip] = useState(false);

  const isTopPerformer = context.healthScoreRankOfYourChange >= 80;

  // Your team and other teams
  const yourTeam = context.teamPositions.find(t => t.teamId === 'your-team');
  const otherTeams = context.teamPositions.filter(t => t.teamId !== 'your-team');

  // Get tier colors for your team
  const beforeTier = yourTeam ? getIndicatorTier(yourTeam.beforeHealthScore) : INDICATOR_TIERS[2];
  const afterTier = yourTeam ? getIndicatorTier(yourTeam.afterHealthScore) : INDICATOR_TIERS[3];

  // Handle animation
  const handleAnimateClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimationPhase('before');

    setTimeout(() => {
      setAnimationPhase('transitioning');
      setTimeout(() => {
        setAnimationPhase('after');
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }, 1500);
    }, 2000);
  };

  // Get team position based on animation phase
  const getTeamPosition = (team: TeamPosition) => {
    if (animationPhase === 'before') {
      return team.beforeHealthScore;
    }
    return team.afterHealthScore;
  };

  // Show before marker (ghost) after animation completes
  const showBeforeMarker = animationPhase === 'after' && !isAnimating;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>HOW YOUR IMPROVEMENT COMPARES</h3>
          <p style={styles.subtitle}>
            See how all teams progressed from {formatDate(baselineDate)} to {formatDate(measurementDate)}
          </p>
        </div>
        <button
          onClick={handleAnimateClick}
          style={{
            ...styles.animateButton,
            opacity: isAnimating ? 0.7 : 1,
          }}
          disabled={isAnimating}
        >
          {isAnimating ? (
            <>
              <span style={styles.playIcon}>●</span>
              {animationPhase === 'before' ? 'Showing baseline...' : 'Moving to current...'}
            </>
          ) : (
            <>
              <span style={styles.playIcon}>▶</span>
              Watch Teams Progress
            </>
          )}
        </button>
      </div>

      {/* Tooltip */}
      {hoveredTeam && (
        <div style={styles.tooltip}>
          <div style={styles.tooltipLabel}>{hoveredTeam.teamName}</div>
          <div style={styles.tooltipValue}>
            {hoveredTeam.beforeHealthScore}% → {hoveredTeam.afterHealthScore.toFixed(0)}%
          </div>
          <div style={{
            ...styles.tooltipChange,
            color: hoveredTeam.change >= 0 ? '#36B37E' : '#DE350B',
          }}>
            ({hoveredTeam.change >= 0 ? '+' : ''}{hoveredTeam.change.toFixed(1)} pts)
          </div>
          <div style={styles.tooltipArrow} />
        </div>
      )}

      {/* Spectrum Layout */}
      <div style={styles.spectrumLayout}>
        {/* Left endpoint */}
        <div style={styles.endpointLeft}>
          <span style={styles.endpointLabel}>← NEEDS ATTENTION</span>
          <p style={styles.endpointDescription}>
            Jira data has significant gaps that limit its usefulness
          </p>
        </div>

        {/* Center: Spectrum visualization */}
        <div style={styles.spectrumCenter}>
          {/* Comparison teams scattered above */}
          <div style={styles.comparisonTeamsArea}>
            {otherTeams.map((team, idx) => {
              const verticalOffset = ((Math.sin(idx * 1234) + 1) / 2) * 20 + 5;
              const teamColor = getTierColor(getTeamPosition(team));
              return (
                <div
                  key={team.teamId}
                  style={{
                    ...styles.comparisonDot,
                    left: `${getTeamPosition(team)}%`,
                    bottom: `${verticalOffset}px`,
                    backgroundColor: teamColor,
                    opacity: 0.6,
                    transition: isAnimating ? 'left 1.2s ease-in-out, background-color 1.2s ease-in-out' : 'none',
                  }}
                  onMouseEnter={() => setHoveredTeam(team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                />
              );
            })}
          </div>

          {/* "You were here" ghost marker - shown after animation */}
          {yourTeam && showBeforeMarker && !isAnimating && (
            <div
              style={{
                ...styles.youWereHereContainer,
                left: `${yourTeam.beforeHealthScore}%`,
              }}
            >
              <span style={styles.youWereHereText}>YOU WERE HERE</span>
              <div style={{ ...styles.youWereHereArrow, borderTopColor: beforeTier.color }} />
              <div style={{
                ...styles.ghostMarker,
                backgroundColor: beforeTier.color,
                opacity: 0.4,
              }} />
            </div>
          )}

          {/* "You are now here" indicator */}
          {yourTeam && (
            <div
              style={{
                ...styles.youAreHereContainer,
                left: `${getTeamPosition(yourTeam)}%`,
                transition: isAnimating ? 'left 1.2s ease-in-out' : 'none',
              }}
              onMouseEnter={() => setHoveredTeam(yourTeam)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              <span style={styles.youAreHereText}>
                {animationPhase === 'before' ? 'YOU WERE HERE' : 'YOU ARE NOW HERE'}
              </span>
              <div style={{ ...styles.youAreHereArrow, borderTopColor: getTierColor(getTeamPosition(yourTeam)) }} />
            </div>
          )}

          {/* Spectrum bar with gradient */}
          <div style={styles.spectrumBarContainer}>
            <div style={styles.spectrumGradient} />
            {/* Tier markers */}
            <div style={styles.tierMarkers}>
              {INDICATOR_TIERS.map((tier) => {
                const yourPos = yourTeam ? getTeamPosition(yourTeam) : 50;
                const isYou = yourPos >= tier.minPercentile && yourPos <= tier.maxPercentile;

                return (
                  <div
                    key={tier.level}
                    style={{
                      ...styles.tierMarker,
                      width: isYou ? '20px' : '10px',
                      height: isYou ? '20px' : '10px',
                      backgroundColor: isYou ? tier.color : '#DFE1E6',
                      boxShadow: isYou ? `0 0 0 4px ${tier.color}40` : 'none',
                      border: '2px solid white',
                      transition: isAnimating ? 'all 0.3s ease' : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Team count */}
          <div style={styles.teamCountLabel}>
            <button onClick={onSimilarTeamsClick} style={styles.similarTeamsLink}>
              {otherTeams.length} similar teams
            </button>
          </div>
        </div>

        {/* Right endpoint */}
        <div style={styles.endpointRight}>
          <span style={styles.endpointLabelGood}>EXCELLENT HEALTH →</span>
          <p style={styles.endpointDescription}>
            Jira accurately reflects work state, enabling confident decisions
          </p>
        </div>
      </div>

      {/* Two Column Summary Stats */}
      <div style={styles.summaryPanels}>
        {/* Column 1: HOW YOU COMPARE - with histogram */}
        <div style={{
          ...styles.summaryColumn,
          background: context.healthScoreRankOfYourChange >= 80
            ? 'linear-gradient(135deg, #E3FCEF 0%, #FFFFFF 100%)'
            : context.healthScoreRankOfYourChange >= 50
              ? 'linear-gradient(135deg, #DEEBFF 0%, #FFFFFF 100%)'
              : 'linear-gradient(135deg, #FFF7E6 0%, #FFFFFF 100%)',
          borderTop: `3px solid ${context.healthScoreRankOfYourChange >= 80 ? '#006644' : context.healthScoreRankOfYourChange >= 50 ? '#0052CC' : '#FF8B00'}`,
        }}>
          <div style={styles.columnHeaderWithInfo}>
            <span style={styles.columnHeader}>How You Compare</span>
            <div style={styles.infoIconWrapper} title="This histogram shows how all similar teams improved over the same period. Each bar represents a range of improvement values. Your team's improvement is highlighted in orange.">
              <span style={styles.infoIcon}>?</span>
            </div>
          </div>

          {/* Histogram - with spacing */}
          <div style={{ marginTop: 12, width: '100%', padding: '0 16px' }}>
            <ImprovementDistributionChart
              teamChanges={context.similarTeamsChanges}
              yourChange={context.yourChange}
              percentile={context.healthScoreRankOfYourChange}
            />
          </div>

          {/* Separator */}
          <div style={styles.chartSeparator} />

          {/* Your ranking section */}
          <div style={styles.rankingSection}>
            <div style={{
              ...styles.rankBadge,
              backgroundColor: context.healthScoreRankOfYourChange >= 80 ? '#E3FCEF' : context.healthScoreRankOfYourChange >= 50 ? '#DEEBFF' : '#FFF7E6',
              borderColor: context.healthScoreRankOfYourChange >= 80 ? '#006644' : context.healthScoreRankOfYourChange >= 50 ? '#0052CC' : '#FF8B00',
            }}>
              <span style={{
                ...styles.rankBadgeText,
                color: context.healthScoreRankOfYourChange >= 80 ? '#006644' : context.healthScoreRankOfYourChange >= 50 ? '#0052CC' : '#FF8B00',
              }}>
                TOP {100 - context.healthScoreRankOfYourChange}%
              </span>
            </div>

            <div style={styles.rankContext}>
              Your <strong style={{ color: getDeltaColor(context.yourChange) }}>
                {context.yourChange > 0 ? '+' : ''}{context.yourChange.toFixed(1)}
              </strong> vs avg <strong style={{ color: getDeltaColor(context.averageChange) }}>
                {context.averageChange > 0 ? '+' : ''}{context.averageChange.toFixed(1)}
              </strong>
            </div>
          </div>
        </div>

        {/* Column 2: SCORE SPREAD - Horizontal spectrum with all teams */}
        {(() => {
          const spread = calculateSpreadMetrics(context.teamPositions);

          // Get ALL teams for visualization
          const allTeams = context.teamPositions.filter(t => t.teamId !== 'your-team');

          // Generate consistent vertical jitter for each team
          const getJitter = (idx: number, seed: number) => {
            const x = Math.sin(idx * 12.9898 + seed * 78.233) * 43758.5453;
            return (x - Math.floor(x)); // 0 to 1
          };

          // Narrative based on spread change
          const narrative = spread.isConverging
            ? `Teams are converging toward similar Jira health levels. The gap between top and bottom performers has narrowed by ${Math.abs(spread.spreadChangePercent).toFixed(0)}%, suggesting that improvement initiatives are lifting lower-performing teams while best practices spread across the organization.`
            : spread.isDiverging
              ? `The performance gap between teams is widening. Top performers are pulling further ahead while some teams lag behind. Consider targeted support for struggling teams and knowledge sharing from high performers.`
              : 'Team performance spread remains stable. Teams are maintaining their relative positions without significant convergence or divergence in Jira health practices.';

          return (
            <div style={styles.summaryColumn}>
              <div style={styles.columnHeaderBlock}>
                <div style={styles.columnHeader}>Score Spread</div>
                <div style={styles.columnSubtitle}>How similar teams' scores are distributed</div>
              </div>

              {/* Before spectrum */}
              <div style={styles.spectrumRow}>
                <span style={styles.spectrumRowLabel}>Before</span>
                <div style={styles.miniSpectrum}>
                  <div style={styles.miniSpectrumDotsArea}>
                    {allTeams.map((team, idx) => (
                      <div
                        key={`before-${team.teamId}`}
                        style={{
                          position: 'absolute',
                          left: `${team.beforeHealthScore}%`,
                          bottom: `${2 + getJitter(idx, 1) * 16}px`,
                          transform: 'translateX(-50%)',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: '#6B778C',
                          opacity: 0.5,
                        }}
                      />
                    ))}
                  </div>
                  <div style={styles.miniSpectrumBar} />
                </div>
              </div>

              {/* After spectrum */}
              <div style={styles.spectrumRow}>
                <span style={styles.spectrumRowLabel}>After</span>
                <div style={styles.miniSpectrum}>
                  <div style={styles.miniSpectrumDotsArea}>
                    {allTeams.map((team, idx) => (
                      <div
                        key={`after-${team.teamId}`}
                        style={{
                          position: 'absolute',
                          left: `${team.afterHealthScore}%`,
                          bottom: `${2 + getJitter(idx, 2) * 16}px`,
                          transform: 'translateX(-50%)',
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: '#6B778C',
                          opacity: 0.5,
                        }}
                      />
                    ))}
                  </div>
                  <div style={styles.miniSpectrumBar} />
                </div>
              </div>

              {/* Stats card */}
              <div style={styles.spreadStatsCard}>
                <div style={styles.spreadStatsRow}>
                  <span style={styles.spreadStatsLabel}>Standard deviation</span>
                  <span style={styles.spreadStatsValue}>
                    {spread.beforeSpread.toFixed(1)} → {spread.afterSpread.toFixed(1)}
                    <span style={{
                      ...styles.spreadStatsChange,
                      color: spread.isConverging ? '#006644' : spread.isDiverging ? '#DE350B' : '#6B778C',
                    }}>
                      ({spread.spreadChange > 0 ? '+' : ''}{spread.spreadChange.toFixed(1)})
                    </span>
                  </span>
                </div>
                <p style={styles.spreadNarrative}>{narrative}</p>
                <button
                  style={styles.whyTrackButton}
                  title="Score spread measures how uniformly teams perform. Converging scores suggest best practices are spreading; diverging scores may indicate some teams need additional support."
                >
                  Why does spread matter?
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    border: '1px solid #DFE1E6',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B778C',
    margin: 0,
  },
  animateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    border: '1px solid #B3D4FF',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  playIcon: {
    fontSize: 10,
  },
  tooltip: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 12,
    whiteSpace: 'nowrap',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  tooltipLabel: {
    fontWeight: 600,
    marginBottom: 2,
  },
  tooltipValue: {
    color: '#B3BAC5',
  },
  tooltipChange: {
    fontWeight: 600,
    marginTop: 2,
  },
  tooltipArrow: {
    position: 'absolute',
    left: '50%',
    bottom: -6,
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #172B4D',
  },
  spectrumLayout: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: '1px solid #EBECF0',
  },
  endpointLeft: {
    width: 160,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  endpointRight: {
    width: 160,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    textAlign: 'right',
  },
  endpointLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#CA3521',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  endpointLabelGood: {
    fontSize: 11,
    fontWeight: 700,
    color: '#216E4E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  endpointDescription: {
    margin: 0,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  spectrumCenter: {
    flex: 1,
    position: 'relative',
    minHeight: 110,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  comparisonTeamsArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  comparisonDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.8)',
  },
  youWereHereContainer: {
    position: 'absolute',
    top: 38,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.6,
  },
  youWereHereText: {
    fontSize: 8,
    fontWeight: 600,
    color: '#97A0AF',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    marginBottom: 2,
  },
  youWereHereArrow: {
    width: 0,
    height: 0,
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '5px solid #97A0AF',
  },
  ghostMarker: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid white',
    marginTop: 2,
  },
  youAreHereContainer: {
    position: 'absolute',
    top: 38,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
    cursor: 'pointer',
  },
  youAreHereText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    marginBottom: 3,
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
    height: 24,
    display: 'flex',
    alignItems: 'center',
  },
  spectrumGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    background: 'linear-gradient(to right, #AE2E24 0%, #DE350B 10%, #F57C00 25%, #FFCC00 50%, #22A06B 75%, #006644 100%)',
    opacity: 0.5,
  },
  tierMarkers: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 1,
  },
  tierMarker: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  teamCountLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#97A0AF',
    textAlign: 'center',
  },
  similarTeamsLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#0052CC',
    fontSize: 11,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  similarTeamsLinkInline: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'inherit',
    fontSize: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  // Three Column Summary Styles
  summaryPanels: {
    display: 'flex',
    gap: 16,
  },
  summaryColumn: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderRadius: 10,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  columnHeaderWithInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  columnHeaderBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginBottom: 8,
  },
  columnSubtitle: {
    fontSize: 11,
    color: '#97A0AF',
    fontWeight: 400,
  },
  infoIconWrapper: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '1px solid #B3BAC5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'help',
  },
  infoIcon: {
    fontSize: 10,
    fontWeight: 600,
    color: '#6B778C',
    lineHeight: 1,
  },
  chartSeparator: {
    width: '80%',
    height: 1,
    backgroundColor: '#E4E6EB',
    margin: '8px 0',
  },
  rankingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  rankBadge: {
    padding: '6px 16px',
    borderRadius: 50,
    border: '2px solid',
  },
  rankBadgeText: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  rankContext: {
    fontSize: 12,
    color: '#5E6C84',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  // Metric cards for stats - 2x2 grid
  metricCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    width: '100%',
    flex: 1,
  },
  metricCardsRow: {
    display: 'flex',
    gap: 8,
    width: '100%',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  metricIcon: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#6B778C',
  },
  // Mini spectrum for spread visualization
  spectrumRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%',
  },
  spectrumRowLabel: {
    fontSize: 9,
    color: '#97A0AF',
    textTransform: 'uppercase',
    width: 36,
    textAlign: 'right',
    flexShrink: 0,
    paddingBottom: 2,
  },
  miniSpectrum: {
    flex: 1,
    position: 'relative',
    height: 28,
  },
  miniSpectrumDotsArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    height: 24,
  },
  miniSpectrumBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    background: 'linear-gradient(to right, #DE350B 0%, #FFCC00 50%, #006644 100%)',
    opacity: 0.4,
  },
  spreadBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 10,
    marginTop: 'auto',
  },
  spreadStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    marginTop: 8,
  },
  spreadStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #EBECF0',
  },
  spreadStatsLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B778C',
  },
  spreadStatsValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  spreadStatsChange: {
    fontSize: 13,
    fontWeight: 600,
  },
  spreadNarrative: {
    fontSize: 12,
    color: '#5E6C84',
    margin: 0,
    lineHeight: 1.5,
  },
  whyTrackButton: {
    marginTop: 12,
    padding: 0,
    border: 'none',
    background: 'none',
    fontSize: 12,
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'help',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  infoButtonContainer: {
    position: 'relative',
    display: 'inline-block',
    marginLeft: 4,
  },
  infoButton: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '1px solid #B3BAC5',
    backgroundColor: 'transparent',
    color: '#6B778C',
    fontSize: 9,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  infoTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 8,
    padding: '10px 12px',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    fontSize: 11,
    lineHeight: 1.5,
    borderRadius: 6,
    width: 200,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 100,
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.2s, visibility 0.2s',
    pointerEvents: 'none',
  },
};

export default TeamProgressComparison;
