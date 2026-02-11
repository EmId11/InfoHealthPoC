import React, { useState } from 'react';
import { DimensionResult, TrendAggregation, ComparisonTeam } from '../../../types/assessment';
import { INDICATOR_TIERS, getTierDistribution } from '../../../types/indicatorTiers';
import { aggregateDimensionTrends } from '../../../utils/trendCalculations';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import IndicatorTrendsChart from './IndicatorTrendsChart';
import ComparisonGroupModal from './ComparisonGroupModal';

interface HeroContextSectionProps {
  dimension: DimensionResult;
  totalIndicators: number;
  flaggedIndicators: number;
  similarTeamsCount?: number;
  onViewSimilarTeams?: () => void;
  comparisonTeams?: ComparisonTeam[];
  comparisonCriteria?: string[];
}

const HeroContextSection: React.FC<HeroContextSectionProps> = ({
  dimension,
  totalIndicators,
  similarTeamsCount = 0,
  comparisonTeams = [],
  comparisonCriteria = [],
}) => {
  const [showIndicatorTrends, setShowIndicatorTrends] = useState(false);
  const [showSimilarTeamsModal, setShowSimilarTeamsModal] = useState(false);

  // Calculate tier distribution for all indicators
  const allIndicators = dimension.categories.flatMap(cat => cat.indicators);
  const tierDistribution = getTierDistribution(allIndicators);

  // Calculate aggregated indicator trends
  const trendAggregation: TrendAggregation = aggregateDimensionTrends(dimension.categories);

  // Human-readable percentile range descriptions (short form)
  const percentileRanges: Record<string, string> = {
    needsAttention: 'Bottom 25%',
    belowAverage: 'Bottom 50%',
    average: 'Top 50%',
    good: 'Top 25%',
    excellent: 'Top 10%',
  };

  // Get tier counts for display (5-tier system)
  const tierCounts = [
    { tier: INDICATOR_TIERS[0], count: tierDistribution.needsAttention, key: 'needsAttention' },
    { tier: INDICATOR_TIERS[1], count: tierDistribution.belowAverage, key: 'belowAverage' },
    { tier: INDICATOR_TIERS[2], count: tierDistribution.average, key: 'average' },
    { tier: INDICATOR_TIERS[3], count: tierDistribution.good, key: 'good' },
    { tier: INDICATOR_TIERS[4], count: tierDistribution.excellent, key: 'excellent' },
  ];

  return (
    <div style={styles.container}>
      {/* Single unified card for Indicator Health */}
      <div style={styles.heroCard}>
        {/* Header */}
        <div style={styles.heroHeader}>
          <div style={styles.headerLeft}>
            <h3 style={styles.heroTitle}>Indicator Health Summary</h3>
            {similarTeamsCount > 0 && (
              <span style={styles.heroSubtitle}>
                Viewing alongside{' '}
                <button
                  style={styles.similarTeamsLink}
                  onClick={() => setShowSimilarTeamsModal(true)}
                >
                  {similarTeamsCount} other team{similarTeamsCount !== 1 ? 's' : ''}
                </button>
                {' '}in this assessment
              </span>
            )}
          </div>
          <div style={styles.headerRight}>
            <span style={styles.totalCount}>{totalIndicators}</span>
            <span style={styles.totalLabel}>Total Indicators</span>
          </div>
        </div>

        {/* LARGE Tier Distribution Grid */}
        <div style={styles.tierGrid}>
          {tierCounts.map(({ tier, count, key }) => (
            <div
              key={tier.level}
              style={{
                ...styles.tierCell,
                backgroundColor: tier.bgColor,
                borderColor: tier.borderColor,
              }}
            >
              <span style={{
                ...styles.tierCount,
                color: tier.color,
              }}>
                {count}
              </span>
              <span style={{
                ...styles.tierName,
                color: tier.color,
              }}>
                {tier.name}
              </span>
              <span style={styles.tierPercentile}>
                {percentileRanges[key]}
              </span>
            </div>
          ))}
        </div>

        {/* Distribution Bar - Large */}
        <div style={styles.distributionBarContainer}>
          <div style={styles.distributionBar}>
            {tierCounts.map(({ tier, count }) => {
              const percentage = totalIndicators > 0 ? (count / totalIndicators) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={tier.level}
                  style={{
                    height: '100%',
                    width: `${percentage}%`,
                    backgroundColor: tier.color,
                  }}
                  title={`${tier.name}: ${count} (${Math.round(percentage)}%)`}
                />
              );
            })}
          </div>
        </div>

        {/* Trend Summary Row - Integrated */}
        <div style={styles.trendSection}>
          <div style={styles.trendHeader}>
            <span style={styles.trendTitle}>Indicator Trends</span>
            <button style={styles.linkBtn} onClick={() => setShowIndicatorTrends(true)}>
              View details →
            </button>
          </div>
          <div style={styles.trendRow}>
            <div style={styles.trendItem}>
              <span style={styles.trendArrow}>↑</span>
              <span style={styles.trendLabel}>Improving</span>
              <span style={{ ...styles.trendValue, color: '#006644' }}>{trendAggregation.improving}</span>
            </div>
            <div style={styles.trendDivider} />
            <div style={styles.trendItem}>
              <span style={{ ...styles.trendArrow, color: '#6B778C' }}>→</span>
              <span style={styles.trendLabel}>Stable</span>
              <span style={styles.trendValue}>{trendAggregation.stable}</span>
            </div>
            <div style={styles.trendDivider} />
            <div style={styles.trendItem}>
              <span style={{ ...styles.trendArrow, color: '#DE350B' }}>↓</span>
              <span style={styles.trendLabel}>Declining</span>
              <span style={{ ...styles.trendValue, color: '#DE350B' }}>{trendAggregation.declining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Trends Modal */}
      {showIndicatorTrends && (
        <div style={styles.modalOverlay} onClick={() => setShowIndicatorTrends(false)}>
          <div style={styles.chartModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Indicator Trends</h3>
              <button style={styles.modalClose} onClick={() => setShowIndicatorTrends(false)}>
                <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
              </button>
            </div>
            <div style={styles.chartBody}>
              <IndicatorTrendsChart
                categories={dimension.categories}
                dimensionName={dimension.dimensionName}
                height={280}
              />
            </div>
          </div>
        </div>
      )}

      {/* Comparison Group Modal */}
      <ComparisonGroupModal
        isOpen={showSimilarTeamsModal}
        onClose={() => setShowSimilarTeamsModal(false)}
        teams={comparisonTeams}
        criteria={comparisonCriteria}
        teamCount={similarTeamsCount}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Hero Card - Full Width, Large
  heroCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '32px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
  },

  // Header
  heroHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  heroTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
    letterSpacing: '-0.2px',
  },
  heroSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  totalCount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  totalLabel: {
    fontSize: '12px',
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // LARGE Tier Grid
  tierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
  },
  tierCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    borderRadius: '12px',
    border: '2px solid',
    textAlign: 'center',
    minHeight: '120px',
  },
  tierCount: {
    fontSize: '42px',
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: '8px',
  },
  tierName: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  tierPercentile: {
    fontSize: '11px',
    color: '#8993A4',
    fontWeight: 500,
  },

  // Distribution Bar - Large
  distributionBarContainer: {
    width: '100%',
  },
  distributionBar: {
    display: 'flex',
    height: '16px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },

  // Trend Section - Integrated
  trendSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '20px 24px',
    backgroundColor: '#FAFBFC',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
  },
  trendHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  },
  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  trendArrow: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#36B37E',
    lineHeight: 1,
  },
  trendLabel: {
    fontSize: '14px',
    color: '#5E6C84',
  },
  trendValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  trendDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#DFE1E6',
  },
  similarTeamsLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: 'inherit',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Link Button
  linkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'none',
  },

  // Modals
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
  },
  chartModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '700px',
    width: '90%',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  chartBody: {
    padding: '24px',
  },
};

export default HeroContextSection;
