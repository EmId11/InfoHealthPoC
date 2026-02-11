import React, { useState } from 'react';
import { DimensionResult, IndicatorCategory, IndicatorResult, IndicatorDrillDownState } from '../../../types/assessment';
import {
  INDICATOR_TIERS,
  getTierDistribution,
  getIndicatorTier,
  getPercentileDescription,
  type TierDistribution,
} from '../../../types/indicatorTiers';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import TrendChart from './TrendChart';
import DistributionSpectrum from './DistributionSpectrum';
import Sparkline from './Sparkline';

type ViewMode = 'cards' | 'table';


interface IndicatorsTabProps {
  dimension: DimensionResult;
  dimensionIndex: number;
  onIndicatorDrillDown?: (state: IndicatorDrillDownState) => void;
  comparisonTeamCount?: number;
  comparisonTeamNames?: string[];
}

// ============================================================================
// Trend Helpers
// ============================================================================

function computeIndicatorTrend(indicator: IndicatorResult): { direction: 'up' | 'down' | 'stable'; label: string; color: string } {
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (indicator.trendData && indicator.trendData.length >= 2) {
    const first = indicator.trendData[0].value;
    const last = indicator.trendData[indicator.trendData.length - 1].value;
    if (last > first + 2) direction = 'up';
    else if (last < first - 2) direction = 'down';
  }
  const label = direction === 'up' ? 'Improving' : direction === 'down' ? 'Declining' : 'Stable';
  const color = direction === 'up' ? '#36B37E' : direction === 'down' ? '#DE350B' : '#6B778C';
  return { direction, label, color };
}

function computeTrendCounts(indicators: IndicatorResult[]): { improving: number; stable: number; declining: number } {
  let improving = 0, stable = 0, declining = 0;
  indicators.forEach(ind => {
    const { direction } = computeIndicatorTrend(ind);
    if (direction === 'up') improving++;
    else if (direction === 'down') declining++;
    else stable++;
  });
  return { improving, stable, declining };
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

// ============================================================================
// Summary Toolbar Component — tier bar + trend tokens + view toggle
// ============================================================================

interface SummaryToolbarProps {
  indicators: IndicatorResult[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const SummaryToolbar: React.FC<SummaryToolbarProps> = ({ indicators, viewMode, onViewModeChange }) => {
  const distribution = getTierDistribution(indicators);
  const total = indicators.length;
  const { improving, stable, declining } = computeTrendCounts(indicators);

  // Build tier segments for stacked bar
  const tierSegments = [
    { tier: INDICATOR_TIERS[0], count: distribution.needsAttention },
    { tier: INDICATOR_TIERS[1], count: distribution.belowAverage },
    { tier: INDICATOR_TIERS[2], count: distribution.average },
    { tier: INDICATOR_TIERS[3], count: distribution.good },
    { tier: INDICATOR_TIERS[4], count: distribution.excellent },
  ].filter(s => s.count > 0);

  return (
    <div style={toolbarStyles.container}>
      {/* Left: Stacked tier bar + compact legend */}
      <div style={toolbarStyles.tierGroup}>
        <div style={toolbarStyles.stackedBar}>
          {tierSegments.map(({ tier, count }) => (
            <div
              key={tier.level}
              style={{
                flex: count,
                height: '100%',
                backgroundColor: tier.color,
                minWidth: '4px',
              }}
              title={`${count} ${tier.name}`}
            />
          ))}
        </div>
        <div style={toolbarStyles.tierLegend}>
          {tierSegments.map(({ tier, count }) => (
            <span key={tier.level} style={{ ...toolbarStyles.tierToken, color: tier.color }}>
              {count} {tier.name}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={toolbarStyles.divider} />

      {/* Center: Compact trend tokens */}
      <div style={toolbarStyles.trendGroup}>
        {improving > 0 && (
          <span style={{ ...toolbarStyles.trendToken, color: '#006644' }}>
            ↗ {improving}
          </span>
        )}
        {stable > 0 && (
          <span style={{ ...toolbarStyles.trendToken, color: '#6B778C' }}>
            <MediaServicesActualSizeIcon label="" size="small" primaryColor="#6B778C" />
            {stable}
          </span>
        )}
        {declining > 0 && (
          <span style={{ ...toolbarStyles.trendToken, color: '#DE350B' }}>
            ↘ {declining}
          </span>
        )}
      </div>

      {/* Right: View toggle */}
      <ViewToggle viewMode={viewMode} onToggle={onViewModeChange} />
    </div>
  );
};

const toolbarStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 20px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E4E6EB',
  },
  tierGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stackedBar: {
    display: 'flex',
    width: '60px',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  tierLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tierToken: {
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#E4E6EB',
    flexShrink: 0,
  },
  trendGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  trendToken: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
};

// ============================================================================
// View Mode Toggle Component
// ============================================================================

interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onToggle }) => (
  <div style={toggleStyles.container}>
    <button
      style={{
        ...toggleStyles.button,
        ...(viewMode === 'cards' ? toggleStyles.buttonActive : {}),
      }}
      onClick={() => onToggle('cards')}
      title="Card view"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill={viewMode === 'cards' ? '#0052CC' : '#6B778C'}>
        <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" />
        <rect x="8" y="0.5" width="5.5" height="5.5" rx="1" />
        <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" />
        <rect x="8" y="8" width="5.5" height="5.5" rx="1" />
      </svg>
    </button>
    <button
      style={{
        ...toggleStyles.button,
        ...(viewMode === 'table' ? toggleStyles.buttonActive : {}),
      }}
      onClick={() => onToggle('table')}
      title="Table view"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill={viewMode === 'table' ? '#0052CC' : '#6B778C'}>
        <rect x="0.5" y="1" width="13" height="2" rx="0.5" />
        <rect x="0.5" y="6" width="13" height="2" rx="0.5" />
        <rect x="0.5" y="11" width="13" height="2" rx="0.5" />
      </svg>
    </button>
  </div>
);

const toggleStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    border: '1px solid #E4E6EB',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '28px',
    padding: 0,
    backgroundColor: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  buttonActive: {
    backgroundColor: '#F0F4FF',
  },
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

const IndicatorsTab: React.FC<IndicatorsTabProps> = ({ dimension, dimensionIndex, onIndicatorDrillDown, comparisonTeamCount, comparisonTeamNames }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorResult | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

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
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onIndicatorClick={setSelectedIndicator}
          onIndicatorDrillDown={onIndicatorDrillDown ? (indicator) => handleDrillDown(indicator, activeTabIndex) : undefined}
          comparisonTeamCount={comparisonTeamCount}
          comparisonTeamNames={comparisonTeamNames}
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
              {/* Score History chart with tier zone bands */}
              <div style={styles.chartContainer}>
                <TrendChart
                  data={selectedIndicator.trendData.map(d => ({
                    ...d,
                    healthScore: d.value,
                  }))}
                  height={260}
                  dimensionName={selectedIndicator.name}
                />
              </div>

              {/* Peer Comparison */}
              <div style={styles.peerComparisonSection}>
                <h4 style={styles.peerComparisonTitle}>Peer Comparison</h4>
                {(() => {
                  const rangeLabel = getPercentileDescription(selectedIndicator.benchmarkPercentile);
                  return selectedIndicator.distribution ? (
                    <DistributionSpectrum
                      value={selectedIndicator.value}
                      minValue={selectedIndicator.distribution.min}
                      maxValue={selectedIndicator.distribution.max}
                      otherTeamValues={selectedIndicator.distribution.otherTeamValues}
                      higherIsBetter={selectedIndicator.higherIsBetter}
                      unit={selectedIndicator.unit}
                      displayValue={selectedIndicator.displayValue}
                      width={500}
                      showLabel={true}
                      subLabel={rangeLabel}
                      comparisonTeamCount={comparisonTeamCount}
                      comparisonTeamNames={comparisonTeamNames}
                    />
                  ) : (
                    <DistributionSpectrum
                      percentile={selectedIndicator.benchmarkPercentile}
                      width={500}
                      showLabel={true}
                      subLabel={rangeLabel}
                      comparisonTeamCount={comparisonTeamCount}
                      comparisonTeamNames={comparisonTeamNames}
                    />
                  );
                })()}
              </div>
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
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onIndicatorClick: (indicator: IndicatorResult) => void;
  onIndicatorDrillDown?: (indicator: IndicatorResult) => void;
  comparisonTeamCount?: number;
  comparisonTeamNames?: string[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  categoryIndex,
  viewMode,
  onViewModeChange,
  onIndicatorClick,
  onIndicatorDrillDown,
  comparisonTeamCount,
  comparisonTeamNames,
}) => {
  return (
    <div style={styles.categorySection}>
      {/* Summary toolbar — always shown */}
      <SummaryToolbar
        indicators={category.indicators}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {/* Render card grid or table based on viewMode */}
      {viewMode === 'table' ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeaderCell}>Indicator</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>Value</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>Health</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>Trend</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'center' }}>History</th>
                <th style={styles.tableHeaderCell}>Applies to</th>
              </tr>
            </thead>
            <tbody>
              {category.indicators.map((indicator) => {
                const indicatorTier = getIndicatorTier(indicator.benchmarkPercentile);
                const trend = computeIndicatorTrend(indicator);
                const trendIcon = trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : null;

                return (
                  <tr
                    key={indicator.id}
                    style={{
                      ...styles.tableRow,
                      cursor: onIndicatorDrillDown ? 'pointer' : 'default',
                    }}
                    onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
                  >
                    <td style={styles.tableCellName}>{indicator.name}</td>
                    <td style={{ ...styles.tableCell, textAlign: 'center', fontWeight: 700, color: indicatorTier.color }}>
                      {indicator.displayValue}
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <span style={{
                        ...badgeStyles.tierBadgeSummary,
                        backgroundColor: indicatorTier.bgColor,
                        color: indicatorTier.color,
                        fontSize: '11px',
                      }}>
                        <span style={{ ...badgeStyles.tierDot, backgroundColor: indicatorTier.color }} />
                        {indicatorTier.name}
                      </span>
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      <span style={{ color: trend.color, fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        {trendIcon ?? <MediaServicesActualSizeIcon label="" size="small" primaryColor="#6B778C" />} {trend.label}
                      </span>
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                      {indicator.trendData && indicator.trendData.length >= 2 ? (
                        <div
                          style={{ display: 'inline-block', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onIndicatorClick(indicator);
                          }}
                        >
                          <Sparkline
                            data={indicator.trendData}
                            trend={indicator.trend}
                            width={70}
                            height={24}
                          />
                        </div>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#97A0AF' }}>--</span>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      {indicator.appliesTo && indicator.appliesTo.length > 0 && (
                        <div style={styles.issueTypeRow}>
                          {indicator.appliesTo.map((type, i) => (
                            <React.Fragment key={type}>
                              {i > 0 && <span style={styles.issueTypeSep}>&middot;</span>}
                              <span style={styles.issueTypeLabel}>{type}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {category.indicators.map((indicator) => {
            const indicatorTier = getIndicatorTier(indicator.benchmarkPercentile);
            const numStr = indicator.displayValue.replace('%', '');
            const isPercent = indicator.unit === '%';
            const trend = computeIndicatorTrend(indicator);
            const trendIcon = trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : <MediaServicesActualSizeIcon label="" size="small" primaryColor="#6B778C" />;

            return (
              <div
                key={indicator.id}
                style={{
                  ...styles.indicatorCard,
                  borderLeftColor: indicatorTier.color,
                  cursor: onIndicatorDrillDown ? 'pointer' : 'default',
                }}
                onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
              >
                {/* Header: name + scope */}
                <div style={styles.cardHeader}>
                  <span style={styles.cardName}>{indicator.name}</span>
                  {indicator.appliesTo && indicator.appliesTo.length > 0 && (
                    <span style={styles.cardScope}>
                      Applies to {indicator.appliesTo.join(' · ')}
                    </span>
                  )}
                </div>

                {/* Metric value */}
                <div style={styles.cardMetric}>
                  <span style={{ ...styles.cardValue, color: indicatorTier.color }}>{numStr}</span>
                  {isPercent && <span style={{ ...styles.cardPercent, color: indicatorTier.color }}>%</span>}
                </div>

                {/* Status row: tier + trend + sparkline */}
                <div style={styles.cardStatusRow}>
                  <span style={{ ...styles.statusDot, backgroundColor: indicatorTier.color }} />
                  <span style={{ ...styles.statusTierName, color: indicatorTier.color }}>{indicatorTier.name}</span>
                  <span style={styles.statusSep}>·</span>
                  <span style={{ ...styles.statusTrend, color: trend.color }}>
                    {trendIcon} {trend.label}
                  </span>
                  {indicator.trendData && indicator.trendData.length >= 2 && (
                    <div
                      style={styles.statusSparkline}
                      onClick={(e) => { e.stopPropagation(); onIndicatorClick(indicator); }}
                      title="View trend history"
                    >
                      <Sparkline data={indicator.trendData} trend={indicator.trend} width={56} height={20} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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

  // Category Section
  categorySection: {
    backgroundColor: '#FAFBFC',
    borderRadius: '0 0 12px 12px',
    border: '1px solid #E4E6EB',
    borderTop: 'none',
    overflow: 'hidden',
  },

  // Card Grid — hero-style indicator cards
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    padding: '20px',
  },
  indicatorCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    borderLeft: '4px solid transparent',
    padding: '20px 20px 18px',
    transition: 'box-shadow 0.15s ease',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  cardName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.35,
  },
  cardScope: {
    fontSize: '11px',
    color: '#97A0AF',
    lineHeight: 1.3,
  },
  cardMetric: {
    display: 'flex',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: '44px',
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: '-1.5px',
  },
  cardPercent: {
    fontSize: '20px',
    fontWeight: 600,
    marginLeft: '2px',
  },
  cardStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F7F8F9',
    padding: '6px 10px',
    borderRadius: '8px',
  },
  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusTierName: {
    fontSize: '12px',
    fontWeight: 600,
  },
  statusSep: {
    fontSize: '12px',
    color: '#C1C7D0',
  },
  statusTrend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusSparkline: {
    marginLeft: 'auto',
    cursor: 'pointer',
    opacity: 0.7,
    flexShrink: 0,
  },
  // Issue types in table view
  issueTypeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  issueTypeLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#8993A4',
  },
  issueTypeSep: {
    fontSize: '11px',
    color: '#C1C7D0',
    userSelect: 'none' as const,
  },

  // Table styles
  tableContainer: {
    padding: '16px 20px 20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHeaderCell: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '2px solid #E4E6EB',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
  },
  tableRow: {
    borderBottom: '1px solid #F0F1F4',
    transition: 'background-color 0.1s ease',
  },
  tableCell: {
    padding: '12px',
    fontSize: '13px',
    color: '#172B4D',
    verticalAlign: 'middle' as const,
  },
  tableCellName: {
    padding: '12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    maxWidth: '300px',
    verticalAlign: 'middle' as const,
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
    maxWidth: '680px',
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
  chartContainer: {
    marginBottom: '16px',
  },
  peerComparisonSection: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #E4E6EB',
  },
  peerComparisonTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

};

export default IndicatorsTab;
