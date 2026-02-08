import React, { useState } from 'react';
import { DimensionResult, IndicatorCategory, IndicatorResult, IndicatorDrillDownState } from '../../../types/assessment';
import {
  INDICATOR_TIERS,
  getTierDistribution,
  getIndicatorTier,
  type TierDistribution,
} from '../../../types/indicatorTiers';
import { getRiskLevelColor } from '../../../constants/mockAssessmentData';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import Sparkline from './Sparkline';
import TrendChart from './TrendChart';
import DistributionSpectrum from './DistributionSpectrum';

interface IndicatorsTabProps {
  dimension: DimensionResult;
  dimensionIndex: number;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
}

// ============================================================================
// Category Tier Badges Component
// ============================================================================

interface CategoryTierBadgesProps {
  distribution: TierDistribution;
}

const CategoryTierBadges: React.FC<CategoryTierBadgesProps> = ({ distribution }) => {
  // Build tier counts array to show all non-zero tiers (5-tier system)
  const tierData = [
    { tier: INDICATOR_TIERS[0], count: distribution.needsAttention, label: INDICATOR_TIERS[0].name },
    { tier: INDICATOR_TIERS[1], count: distribution.belowAverage, label: INDICATOR_TIERS[1].name },
    { tier: INDICATOR_TIERS[2], count: distribution.average, label: INDICATOR_TIERS[2].name },
    { tier: INDICATOR_TIERS[3], count: distribution.good, label: INDICATOR_TIERS[3].name },
    { tier: INDICATOR_TIERS[4], count: distribution.excellent, label: INDICATOR_TIERS[4].name },
  ];

  // Filter to only show tiers with non-zero counts
  const activeTiers = tierData.filter(t => t.count > 0);

  if (activeTiers.length === 0) {
    return null;
  }

  return (
    <div style={badgeStyles.badgeContainer}>
      {activeTiers.map(({ tier, count, label }) => (
        <span
          key={tier.level}
          style={{
            ...badgeStyles.tierBadgeSummary,
            backgroundColor: tier.bgColor,
            color: tier.color,
          }}
        >
          <span style={{ ...badgeStyles.tierDot, backgroundColor: tier.color }} />
          {count} {label}
        </span>
      ))}
    </div>
  );
};

const badgeStyles: Record<string, React.CSSProperties> = {
  badgeContainer: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tierBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  tierBadgeSummary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tierDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

const IndicatorsTab: React.FC<IndicatorsTabProps> = ({ dimension, dimensionIndex, onIndicatorDrillDown }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorResult | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Handle drill-down navigation
  const handleDrillDown = (indicator: IndicatorResult, categoryIndex: number) => {
    if (onIndicatorDrillDown) {
      onIndicatorDrillDown({
        indicatorId: indicator.id,
        dimensionIndex,
        categoryIndex,
        indicatorName: indicator.name,
      });
    }
  };

  const getTrendIcon = (trend: IndicatorResult['trend']) => {
    switch (trend) {
      case 'improving':
        return <ArrowUpIcon label="" size="small" primaryColor="#36B37E" />;
      case 'declining':
        return <ArrowDownIcon label="" size="small" primaryColor="#DE350B" />;
      default:
        return <MediaServicesActualSizeIcon label="" size="small" primaryColor="#6B778C" />;
    }
  };

  const getTrendLabel = (trend: IndicatorResult['trend']) => {
    switch (trend) {
      case 'improving': return 'Improving';
      case 'declining': return 'Declining';
      default: return 'Stable';
    }
  };

  const getTrendColors = (trend: IndicatorResult['trend']) => {
    switch (trend) {
      case 'improving':
        return { bg: '#E3FCEF', text: '#006644' };
      case 'declining':
        return { bg: '#FFEBE6', text: '#DE350B' };
      default:
        return { bg: '#F4F5F7', text: '#5E6C84' };
    }
  };

  const getPercentileText = (percentile: number) => {
    const tier = getIndicatorTier(percentile);
    return tier.name;
  };

  const activeCategory = dimension.categories[activeTabIndex];

  // Compute tier distribution for active category (used in unified header)
  const activeTierDistribution = activeCategory ? getTierDistribution(activeCategory.indicators) : null;

  return (
    <div style={styles.container}>
      {/* Tab Selector */}
      {dimension.categories.length > 1 && (
        <div style={styles.tabHeader}>
          <div style={styles.tabBar}>
            {dimension.categories.map((category, idx) => {
              const isActive = idx === activeTabIndex;
              const catDist = getTierDistribution(category.indicators);
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTabIndex(idx)}
                  style={{
                    ...styles.tab,
                    ...(isActive ? styles.tabActive : styles.tabInactive),
                  }}
                >
                  <div style={styles.tabTop}>
                    <span style={{
                      ...styles.tabName,
                      color: isActive ? '#172B4D' : '#6B778C',
                    }}>{category.shortName}</span>
                    <span style={{
                      ...styles.tabCount,
                      backgroundColor: isActive ? '#0052CC' : '#C1C7D0',
                      color: '#FFFFFF',
                    }}>
                      {category.indicators.length}
                    </span>
                  </div>
                  <p style={{
                    ...styles.tabDescription,
                    color: isActive ? '#5E6C84' : '#97A0AF',
                  }}>{category.description}</p>
                  {isActive && (
                    <div style={styles.tabBadges}>
                      <CategoryTierBadges distribution={catDist} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Category Table (no redundant header) */}
      {activeCategory && (
        <CategorySection
          key={activeCategory.id}
          category={activeCategory}
          categoryIndex={activeTabIndex}
          showHeader={dimension.categories.length <= 1}
          getTrendIcon={getTrendIcon}
          getTrendLabel={getTrendLabel}
          getTrendColors={getTrendColors}
          getPercentileText={getPercentileText}
          onIndicatorClick={setSelectedIndicator}
          onIndicatorDrillDown={onIndicatorDrillDown ? (indicator) => handleDrillDown(indicator, activeTabIndex) : undefined}
        />
      )}

      {/* Indicator Detail Modal */}
      {selectedIndicator && (
        <div style={styles.modalOverlay} onClick={() => setSelectedIndicator(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedIndicator.name}</h3>
              <button style={styles.modalClose} onClick={() => setSelectedIndicator(null)}>
                <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
              </button>
            </div>
            <div style={styles.modalBody}>
              {/* Summary stats */}
              <div style={styles.indicatorSummary}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Current Value</span>
                  <span style={styles.summaryValue}>{selectedIndicator.displayValue}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Health Tier</span>
                  <span style={{
                    ...styles.summaryValue,
                    color: getIndicatorTier(selectedIndicator.benchmarkPercentile).color,
                  }}>
                    {getIndicatorTier(selectedIndicator.benchmarkPercentile).name}
                  </span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Trend</span>
                  <span style={{
                    ...styles.trendBadgeSmall,
                    backgroundColor: getTrendColors(selectedIndicator.trend).bg,
                    color: getTrendColors(selectedIndicator.trend).text,
                  }}>
                    {getTrendIcon(selectedIndicator.trend)}
                    {getTrendLabel(selectedIndicator.trend)}
                  </span>
                </div>
              </div>

              {/* Value Chart */}
              <div style={styles.chartContainer}>
                <TrendChart
                  data={selectedIndicator.trendData}
                  height={200}
                  indicatorMode={true}
                  hideBenchmark={true}
                  isPercentage={selectedIndicator.unit === '%'}
                />
              </div>

              <p style={styles.indicatorDescription}>{selectedIndicator.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Category Section Component
interface CategorySectionProps {
  category: IndicatorCategory;
  categoryIndex: number;
  showHeader?: boolean;
  getTrendIcon: (trend: IndicatorResult['trend']) => React.ReactNode;
  getTrendLabel: (trend: IndicatorResult['trend']) => string;
  getTrendColors: (trend: IndicatorResult['trend']) => { bg: string; text: string };
  getPercentileText: (percentile: number) => string;
  onIndicatorClick: (indicator: IndicatorResult) => void;
  onIndicatorDrillDown?: (indicator: IndicatorResult) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  categoryIndex,
  showHeader = true,
  getTrendIcon,
  getTrendLabel,
  getTrendColors,
  getPercentileText,
  onIndicatorClick,
  onIndicatorDrillDown,
}) => {
  const statusColors = getRiskLevelColor(category.status);
  // Calculate tier distribution for this category
  const categoryTierDistribution = getTierDistribution(category.indicators);
  const hasNeedsAttention = categoryTierDistribution.needsAttention > 0;
  const hasRisk = categoryTierDistribution.riskCount > 0;

  // Determine accent color based on worst tier present
  const getAccentColor = () => {
    if (hasNeedsAttention) {
      return '#DE350B';
    }
    if (hasRisk) {
      return '#DE350B';
    }
    return '#36B37E';
  };

  const accentColor = getAccentColor();

  return (
    <div style={styles.categorySection}>
      {/* Category Header - only shown when not using tabs */}
      {showHeader && (
        <div style={{
          ...styles.categoryHeader,
          borderLeft: `4px solid ${accentColor}`,
        }}>
          <div style={styles.categoryHeaderContent}>
            <div style={styles.categoryHeaderLeft}>
              <div style={{
                ...styles.categoryNumber,
                backgroundColor: accentColor,
              }}>
                {categoryIndex + 1}
              </div>
              <div style={styles.categoryInfo}>
                <h4 style={styles.categoryName}>
                  {category.shortName}
                </h4>
                <p style={styles.categoryDescription}>{category.description}</p>
              </div>
            </div>
            <div style={styles.categoryHeaderRight}>
              <CategoryTierBadges distribution={categoryTierDistribution} />
            </div>
          </div>
        </div>
      )}

      {/* Indicators Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{ ...styles.th, width: '18%' }}>Indicator</th>
              <th style={{ ...styles.th, width: '18%' }}>Why It Matters</th>
              <th style={{ ...styles.th, width: '28%' }}>
                <span>Peer Comparison</span>
                <span style={styles.historyHint}>(your value vs others)</span>
              </th>
              <th style={{ ...styles.th, width: '12%' }}>
                <span>Health</span>
                <span style={styles.historyHint}>(indicator tier)</span>
              </th>
              <th style={{ ...styles.th, width: '12%' }}>
                <span>History</span>
                <span style={styles.historyHint}>(click to expand)</span>
              </th>
              <th style={{ ...styles.th, width: '12%' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {category.indicators.map((indicator) => {
              const indicatorTier = getIndicatorTier(indicator.benchmarkPercentile);
              const trendColors = getTrendColors(indicator.trend);

              return (
                <tr
                  key={indicator.id}
                  style={{
                    ...styles.tableRow,
                    cursor: onIndicatorDrillDown ? 'pointer' : 'default',
                  }}
                  onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
                >
                  {/* Indicator Name */}
                  <td style={styles.td}>
                    <div style={styles.indicatorCell}>
                      <span style={{
                        ...styles.statusIndicator,
                        backgroundColor: indicatorTier.color,
                      }} />
                      <div style={styles.indicatorInfo}>
                        <span style={styles.indicatorName}>{indicator.name}</span>
                        <span style={styles.directionHint}>
                          <span style={styles.directionArrow}>
                            {indicator.higherIsBetter ? '↑' : '↓'}
                          </span>
                          {indicator.higherIsBetter ? ' higher better' : ' lower better'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Why It Matters */}
                  <td style={styles.td}>
                    <span style={styles.whyItMattersText}>
                      {indicator.whyItMatters || '—'}
                    </span>
                  </td>

                  {/* Distribution Spectrum - Enhanced */}
                  <td style={styles.td}>
                    {(() => {
                      const rangeLabel = indicatorTier.level <= 2
                        ? `Bottom ${indicatorTier.maxPercentile}%`
                        : indicatorTier.level >= 5
                          ? `Top ${100 - indicatorTier.minPercentile + 1}%`
                          : `${indicatorTier.minPercentile}–${indicatorTier.maxPercentile}%`;
                      return indicator.distribution ? (
                        <DistributionSpectrum
                          value={indicator.value}
                          minValue={indicator.distribution.min}
                          maxValue={indicator.distribution.max}
                          otherTeamValues={indicator.distribution.otherTeamValues}
                          higherIsBetter={indicator.higherIsBetter}
                          unit={indicator.unit}
                          displayValue={indicator.displayValue}
                          width={280}
                          showLabel={true}
                          subLabel={rangeLabel}
                        />
                      ) : (
                        <DistributionSpectrum
                          percentile={indicator.benchmarkPercentile}
                          width={240}
                          showLabel={true}
                          subLabel={rangeLabel}
                        />
                      );
                    })()}
                  </td>

                  {/* Health Tier Badge */}
                  <td style={styles.td}>
                    <div style={styles.percentileBadgeContainer}>
                      <span style={{
                        ...styles.percentileBadge,
                        backgroundColor: indicatorTier.bgColor,
                        color: indicatorTier.color,
                      }}>
                        {indicatorTier.name}
                      </span>
                    </div>
                  </td>

                  {/* History Sparkline - Clickable */}
                  <td style={styles.td}>
                    <div
                      style={styles.sparklineClickable}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIndicatorClick(indicator);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onIndicatorClick(indicator)}
                      title="Click to see trend details"
                    >
                      <Sparkline
                        data={indicator.trendData}
                        trend={indicator.trend}
                        width={70}
                        height={24}
                      />
                    </div>
                  </td>

                  {/* Trend */}
                  <td style={styles.td}>
                    <span style={{
                      ...styles.trendBadge,
                      backgroundColor: trendColors.bg,
                      color: trendColors.text,
                    }}>
                      {getTrendIcon(indicator.trend)}
                      {getTrendLabel(indicator.trend)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },

  // Tab Header
  tabHeader: {
    marginBottom: '0',
  },
  tabBar: {
    display: 'flex',
    gap: '0',
    borderRadius: '12px 12px 0 0',
    border: '1px solid #E4E6EB',
    borderBottom: 'none',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    padding: '18px 20px',
    borderTop: '3px solid transparent',
    borderRight: '0px solid transparent',
    borderBottom: 'none',
    borderLeft: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
    outline: 'none',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderTop: '3px solid #0052CC',
    borderRight: '0px solid transparent',
  },
  tabInactive: {
    backgroundColor: '#F4F5F7',
    borderTop: '3px solid transparent',
    borderRight: '1px solid #E4E6EB',
  },
  tabTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  tabName: {
    fontSize: '15px',
    fontWeight: 600,
  },
  tabCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
  },
  tabDescription: {
    margin: 0,
    fontSize: '12px',
    lineHeight: 1.4,
  },
  tabBadges: {
    marginTop: '10px',
  },

  // Category Section - matching "Indicators Overview" section style
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '0 0 12px 12px',
    border: '1px solid #E4E6EB',
    borderTop: 'none',
    overflow: 'hidden',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E4E6EB',
  },
  categoryHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    padding: '20px 24px',
  },
  categoryHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  categoryNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    flexShrink: 0,
  },
  categoryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categoryName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'none',
    letterSpacing: 'normal',
  },
  categoryDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  categoryHeaderRight: {
    display: 'flex',
    alignItems: 'center',
  },
  concernBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#DE350B',
    color: '#FFFFFF',
  },
  healthyBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#36B37E',
    color: '#FFFFFF',
  },

  // Table Styles
  tableWrapper: {
    padding: 0,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  tableHeaderRow: {
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #E4E6EB',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    transition: 'all 0.15s ease',
  },
  td: {
    padding: '16px',
    verticalAlign: 'middle',
  },

  // Indicator Cell
  indicatorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  indicatorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  indicatorName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  directionHint: {
    fontSize: 10,
    color: '#6B778C',
    marginTop: 2,
    display: 'block',
  },
  directionArrow: {
    color: '#36B37E',
    fontWeight: 600,
  },

  // Why It Matters
  whyItMattersText: {
    fontSize: '12px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },

  // Value cells
  valueText: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#172B4D',
  },
  percentileBadgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  percentileBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  percentileRange: {
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },

  // Clickable sparkline
  sparklineClickable: {
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.15s ease',
    display: 'inline-block',
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
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '600px',
    width: '90%',
    overflow: 'hidden',
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
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  modalBody: {
    padding: '24px',
  },

  // Indicator summary in modal
  indicatorSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendBadgeSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    width: 'fit-content',
  },
  chartSection: {
    marginBottom: '24px',
  },
  chartSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  chartContainer: {
    marginBottom: '16px',
  },
  indicatorDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  historyHint: {
    display: 'block',
    fontSize: '9px',
    fontWeight: 400,
    color: '#8993A4',
    textTransform: 'none',
    letterSpacing: 'normal',
  },

};

export default IndicatorsTab;
