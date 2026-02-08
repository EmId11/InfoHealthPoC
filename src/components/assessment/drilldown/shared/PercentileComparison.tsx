import React from 'react';
import { IndicatorResult, TrendDataPoint } from '../../../../types/assessment';
import { getIndicatorTier } from '../../../../types/indicatorTiers';

interface PercentileComparisonProps {
  indicator: IndicatorResult;
  similarTeamCount: number;
}

const PercentileComparison: React.FC<PercentileComparisonProps> = ({
  indicator,
  similarTeamCount,
}) => {
  const percentile = indicator.benchmarkPercentile;
  const yourRank = Math.round((1 - percentile / 100) * similarTeamCount) + 1;

  /**
   * Get color and label from the unified 5-tier indicator system.
   * This is benchmark percentile (peer comparison), not CHS health score.
   */
  const getPercentileColor = (p: number) => {
    return getIndicatorTier(p).color;
  };

  const getPercentileLabel = (p: number) => {
    return getIndicatorTier(p).name;
  };

  // Calculate where the marker should be on the distribution curve
  const markerPosition = percentile;

  return (
    <div style={styles.container}>
      {/* Benchmark Percentile Card */}
      <div style={styles.rankCard}>
        <div style={styles.rankHeader}>
          <h3 style={styles.rankTitle}>Your Benchmark Percentile</h3>
          <span style={styles.rankSubtitle}>
            How this indicator compares to {similarTeamCount} similar teams
          </span>
        </div>

        <div style={styles.rankDisplay}>
          <div style={styles.rankNumber}>
            <span style={{
              ...styles.rankValue,
              color: getPercentileColor(percentile),
            }}>
              {percentile}
            </span>
            <span style={styles.rankSuffix}>th</span>
          </div>
          <div style={styles.rankMeta}>
            <span style={{
              ...styles.rankBadge,
              backgroundColor: getPercentileColor(percentile) + '15',
              color: getPercentileColor(percentile),
            }}>
              {getPercentileLabel(percentile)}
            </span>
            <span style={styles.rankExplanation}>
              {percentile <= 50
                ? `${yourRank} of ${similarTeamCount} teams are performing better`
                : `You're outperforming ${similarTeamCount - yourRank} of ${similarTeamCount} teams`
              }
            </span>
          </div>
        </div>

        {/* Distribution Visualization */}
        <div style={styles.distributionSection}>
          <div style={styles.distributionHeader}>
            <span style={styles.distributionLabel}>Distribution of Similar Teams</span>
          </div>

          <div style={styles.distribution}>
            {/* Bell curve approximation using bars */}
            <div style={styles.distributionBars}>
              {[5, 12, 20, 28, 35, 35, 28, 20, 12, 5].map((height, index) => {
                const barPercentile = (index + 0.5) * 10;
                const isYourPosition = Math.abs(barPercentile - percentile) < 10;
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.distributionBar,
                      height: `${height * 2}px`,
                      backgroundColor: isYourPosition ? getPercentileColor(percentile) : '#DFE1E6',
                      opacity: isYourPosition ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </div>

            {/* Your position marker */}
            <div style={{
              ...styles.positionMarker,
              left: `${markerPosition}%`,
            }}>
              <div style={{
                ...styles.markerDot,
                backgroundColor: getPercentileColor(percentile),
              }} />
              <span style={styles.markerLabel}>You</span>
            </div>

            {/* Axis labels */}
            <div style={styles.axisLabels}>
              <span style={styles.axisLabel}>0</span>
              <span style={styles.axisLabel}>25th</span>
              <span style={styles.axisLabel}>50th</span>
              <span style={styles.axisLabel}>75th</span>
              <span style={styles.axisLabel}>100th</span>
            </div>

            {/* Zone indicators */}
            <div style={styles.zones}>
              <div style={{ ...styles.zone, backgroundColor: '#FFEBE6', width: '25%' }}>
                <span style={styles.zoneLabel}>Bottom Quartile</span>
              </div>
              <div style={{ ...styles.zone, backgroundColor: '#FFF5E6', width: '50%' }}>
                <span style={styles.zoneLabel}>Middle Quartiles</span>
              </div>
              <div style={{ ...styles.zone, backgroundColor: '#E3FCEF', width: '25%' }}>
                <span style={styles.zoneLabel}>Top Quartile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Over Time */}
      {indicator.trendData && indicator.trendData.length > 0 && (
        <div style={styles.trendCard}>
          <div style={styles.trendHeader}>
            <h3 style={styles.trendTitle}>Benchmark Trend Over Time</h3>
            <span style={styles.trendSubtitle}>How your ranking vs peers has changed</span>
          </div>

          <div style={styles.trendChart}>
            {/* Trend line visualization */}
            <div style={styles.trendLine}>
              {indicator.trendData.slice(-9).map((point, index, arr) => {
                const ptPercentile = point.healthScore ?? indicator.benchmarkPercentile;
                const x = (index / (arr.length - 1)) * 100;
                const y = 100 - ptPercentile;
                const isLast = index === arr.length - 1;

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.trendPoint,
                      left: `${x}%`,
                      bottom: `${ptPercentile}%`,
                      backgroundColor: isLast ? getPercentileColor(ptPercentile) : '#0052CC',
                      width: isLast ? '12px' : '8px',
                      height: isLast ? '12px' : '8px',
                      zIndex: isLast ? 2 : 1,
                    }}
                    title={`${point.period}: ${ptPercentile}th percentile`}
                  />
                );
              })}
            </div>

            {/* Reference lines */}
            <div style={{ ...styles.refLine, bottom: '75%' }}>
              <span style={styles.refLabel}>75th</span>
            </div>
            <div style={{ ...styles.refLine, bottom: '25%' }}>
              <span style={styles.refLabel}>25th</span>
            </div>

            {/* Period labels */}
            <div style={styles.periodLabels}>
              {indicator.trendData.slice(-9).filter((_, i, arr) => i === 0 || i === arr.length - 1).map((point, index) => (
                <span key={index} style={styles.periodLabel}>{point.period}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  rankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  rankHeader: {
    marginBottom: '20px',
  },
  rankTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  rankSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  rankDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
  },
  rankNumber: {
    display: 'flex',
    alignItems: 'baseline',
  },
  rankValue: {
    fontSize: '56px',
    fontWeight: 700,
    lineHeight: 1,
  },
  rankSuffix: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#6B778C',
    marginLeft: '2px',
  },
  rankMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  rankBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 600,
    width: 'fit-content',
  },
  rankExplanation: {
    fontSize: '14px',
    color: '#5E6C84',
  },
  distributionSection: {
    marginTop: '16px',
  },
  distributionHeader: {
    marginBottom: '12px',
  },
  distributionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  distribution: {
    position: 'relative',
    padding: '16px 0 48px 0',
  },
  distributionBars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '70px',
    gap: '4px',
  },
  distributionBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.2s ease',
  },
  positionMarker: {
    position: 'absolute',
    bottom: '48px',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  markerDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '3px solid #FFFFFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  markerLabel: {
    marginTop: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#172B4D',
  },
  axisLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #DFE1E6',
  },
  axisLabel: {
    fontSize: '10px',
    color: '#6B778C',
  },
  zones: {
    display: 'flex',
    marginTop: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  zone: {
    padding: '6px 8px',
    textAlign: 'center',
  },
  zoneLabel: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#5E6C84',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  trendHeader: {
    marginBottom: '16px',
  },
  trendTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  trendChart: {
    position: 'relative',
    height: '120px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '24px',
  },
  trendLine: {
    position: 'relative',
    height: '100%',
  },
  trendPoint: {
    position: 'absolute',
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
    transition: 'all 0.2s ease',
  },
  refLine: {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '1px',
    borderTop: '1px dashed #DFE1E6',
  },
  refLabel: {
    position: 'absolute',
    right: '4px',
    top: '-8px',
    fontSize: '9px',
    color: '#6B778C',
  },
  periodLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  periodLabel: {
    fontSize: '10px',
    color: '#6B778C',
  },
};

export default PercentileComparison;
