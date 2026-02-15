import React, { useState } from 'react';
import { DimensionResult, IndicatorCategory, IndicatorResult, IndicatorDrillDownState, PassedCheck } from '../../../types/assessment';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE } from '../../../constants/presets';
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
import FieldCompletenessChart from './FieldCompletenessChart';
import DataIntegritySummaryTable from './DataIntegritySummaryTable';

// Field name lookup from field definitions
const FIELD_NAME_MAP = new Map(
  MOCK_JIRA_FIELDS_BY_ISSUE_TYPE.map(f => [f.id, f.name])
);

function getFieldDisplayName(fieldId: string): string {
  return FIELD_NAME_MAP.get(fieldId) || fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
}

interface FieldGroup {
  fieldId: string;
  fieldName: string;
  indicators: IndicatorResult[];
}

/**
 * Group indicators by jiraFieldId, preserving order.
 * Only groups when 2+ indicators share a field.
 */
function groupIndicatorsByField(indicators: IndicatorResult[]): FieldGroup[] {
  const groups: FieldGroup[] = [];
  let currentFieldId: string | undefined;

  for (const indicator of indicators) {
    const fieldId = indicator.jiraFieldId || '';
    if (fieldId !== currentFieldId) {
      groups.push({
        fieldId,
        fieldName: fieldId ? getFieldDisplayName(fieldId) : '',
        indicators: [indicator],
      });
      currentFieldId = fieldId;
    } else {
      groups[groups.length - 1].indicators.push(indicator);
    }
  }

  return groups;
}

interface FieldSuite {
  fieldId: string;
  fieldName: string;
  detected: IndicatorResult[];
  passed: PassedCheck[];
}

function buildFieldSuites(indicators: IndicatorResult[], passedChecks?: PassedCheck[]): FieldSuite[] {
  const groups = groupIndicatorsByField(indicators);
  const passedByField = new Map<string, PassedCheck[]>();
  if (passedChecks) {
    for (const pc of passedChecks) {
      const key = pc.jiraFieldId || '';
      if (!passedByField.has(key)) passedByField.set(key, []);
      passedByField.get(key)!.push(pc);
    }
  }
  const consumedFieldIds = new Set<string>();
  const suites: FieldSuite[] = [];
  for (const group of groups) {
    if (group.fieldId) consumedFieldIds.add(group.fieldId);
    suites.push({
      fieldId: group.fieldId,
      fieldName: group.fieldName,
      detected: group.indicators,
      passed: (group.fieldId && passedByField.get(group.fieldId)) || [],
    });
  }
  // Append passed-only fields (e.g., sprint, components, fixVersions)
  Array.from(passedByField.entries()).forEach(([fieldId, checks]) => {
    if (consumedFieldIds.has(fieldId)) return;
    suites.push({
      fieldId,
      fieldName: fieldId ? getFieldDisplayName(fieldId) : '',
      detected: [],
      passed: checks,
    });
  });
  return suites;
}

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
// Detection Ratio → Tier (for Data Integrity sidebar)
// ============================================================================

/**
 * Map detected/total antipattern ratio to a color + background tint pair.
 * 0% → green, 1-25% → green, 26-50% → blue, 51-75% → orange, 76-100% → red.
 */
function getDetectionTierColors(detected: number, total: number): { color: string; bg: string } {
  if (detected === 0) return { color: '#006644', bg: '#E3FCEF' };
  const ratio = detected / total;
  if (ratio <= 0.25) return { color: '#006644', bg: '#E3FCEF' };
  if (ratio <= 0.50) return { color: '#0052CC', bg: '#DEEBFF' };
  if (ratio <= 0.75) return { color: '#FF8B00', bg: '#FFF7E6' };
  return { color: '#DE350B', bg: '#FFEBE6' };
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
// Summary Toolbar Component — tier bar + trend tokens (or pass/fail counts)
// ============================================================================

interface SummaryToolbarProps {
  indicators: IndicatorResult[];
  totalChecks?: number;
  passedCheckCount?: number;
}

const SummaryToolbar: React.FC<SummaryToolbarProps> = ({ indicators, totalChecks, passedCheckCount }) => {
  const failedCount = indicators.length;
  const passedCount = passedCheckCount ?? 0;

  // Data Integrity mode: show simple pass/fail counts
  if (totalChecks != null) {
    return (
      <div style={toolbarStyles.container}>
        <div style={toolbarStyles.testSummary}>
          {failedCount > 0 && (
            <span style={{ ...toolbarStyles.testCount, color: '#DE350B' }}>
              <span style={{ fontSize: '14px' }}>✕</span> {failedCount} failed
            </span>
          )}
          {failedCount > 0 && passedCount > 0 && (
            <span style={{ color: '#DFE1E6', fontSize: '12px' }}>·</span>
          )}
          {passedCount > 0 && (
            <span style={{ ...toolbarStyles.testCount, color: '#36B37E' }}>
              <span style={{ fontSize: '14px' }}>✓</span> {passedCount} passed
            </span>
          )}
        </div>
      </div>
    );
  }

  // Other dimensions: show tier distribution + trend tokens
  const distribution = getTierDistribution(indicators);
  const { improving, stable, declining } = computeTrendCounts(indicators);

  const tierSegments = [
    { tier: INDICATOR_TIERS[0], count: distribution.needsAttention },
    { tier: INDICATOR_TIERS[1], count: distribution.belowAverage },
    { tier: INDICATOR_TIERS[2], count: distribution.average },
    { tier: INDICATOR_TIERS[3], count: distribution.good },
    { tier: INDICATOR_TIERS[4], count: distribution.excellent },
  ].filter(s => s.count > 0);

  return (
    <div style={toolbarStyles.container}>
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

      <div style={toolbarStyles.divider} />

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
    </div>
  );
};

const toolbarStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 20px',
    backgroundColor: '#FAFBFC',
    borderBottom: 'none',
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
  testSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  testCount: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
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

// ============================================================================
// Test Results Dashboard (Data Integrity table-view replacement)
// ============================================================================

interface TestResultsDashboardProps {
  category: IndicatorCategory;
  passedChecks?: PassedCheck[];
  onIndicatorDrillDown?: (indicator: IndicatorResult) => void;
}

const TestResultsDashboard: React.FC<TestResultsDashboardProps> = ({
  category,
  passedChecks,
  onIndicatorDrillDown,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const suites = buildFieldSuites(category.indicators, passedChecks);
  const hasFieldGroups = suites.some(s => s.fieldId);

  return (
    <div style={dashStyles.container}>
      {suites.map((suite, suiteIdx) => {
        const failedCount = suite.detected.length;
        const passedCount = suite.passed.length;
        const showHeader = hasFieldGroups && suite.fieldId !== '';

        return (
          <div key={suite.fieldId || `suite-${suiteIdx}`}>
            {/* Suite header */}
            {showHeader && (
              <div style={{
                ...dashStyles.suiteHeader,
                ...(suiteIdx === 0 ? { borderTop: 'none' } : {}),
              }}>
                <span style={dashStyles.suiteFieldName}>{suite.fieldName}</span>
                <span style={dashStyles.suiteSummary}>
                  {failedCount > 0 && <span style={{ color: '#97A0AF' }}>{failedCount} ✕</span>}
                  {failedCount > 0 && passedCount > 0 && <span style={{ color: '#DFE1E6' }}> / </span>}
                  {passedCount > 0 && <span style={{ color: '#97A0AF' }}>{passedCount} ✓</span>}
                </span>
              </div>
            )}

            {/* Failed check rows */}
            {suite.detected.map((indicator) => {
              const isHovered = hoveredRowId === indicator.id;

              return (
                <div
                  key={indicator.id}
                  style={{
                    ...dashStyles.row,
                    backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
                    cursor: onIndicatorDrillDown ? 'pointer' : 'default',
                  }}
                  onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
                  onMouseEnter={() => setHoveredRowId(indicator.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <span style={{ color: '#DE350B', fontSize: '15px', flexShrink: 0, width: '16px', textAlign: 'center' as const }}>✕</span>
                  <span style={dashStyles.rowName}>{indicator.name}</span>
                </div>
              );
            })}

            {/* Passed check rows */}
            {suite.passed.map((check) => (
              <div key={check.id} style={dashStyles.passedRow}>
                <span style={{ color: '#36B37E', fontSize: '15px', flexShrink: 0, width: '16px', textAlign: 'center' as const }}>✓</span>
                <span style={dashStyles.passedName}>{check.name}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const IndicatorsTab: React.FC<IndicatorsTabProps> = ({ dimension, dimensionIndex, onIndicatorDrillDown, comparisonTeamCount, comparisonTeamNames }) => {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorResult | null>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [hoveredSidebarIdx, setHoveredSidebarIdx] = useState<number | null>(null);
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

  // Use vertical layout when 5+ categories (e.g., Data Integrity with many issue types)
  const useVerticalTabs = dimension.categories.length >= 5;

  // Find the index of the Cross-Field tab (always last, separated by divider)
  const crossFieldIndex = dimension.categories.findIndex(c => c.id === 'crossField');

  // Split categories into issue types vs cross-cutting
  const issueTypeCategories = dimension.categories.filter(c => c.id !== 'crossField');
  const crossFieldCat = crossFieldIndex >= 0 ? dimension.categories[crossFieldIndex] : null;

  return (
    <div style={styles.container}>
      {/* Tab Selector */}
      {dimension.categories.length > 1 && !useVerticalTabs && (
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

      {/* Data Integrity: field-based summary table */}
      {dimension.dimensionKey === 'dataIntegrity' && (
        <DataIntegritySummaryTable dimension={dimension} />
      )}

      {/* Vertical sidebar layout for 5+ categories */}
      {dimension.categories.length > 1 && useVerticalTabs && dimension.dimensionKey !== 'dataIntegrity' && (
        <div style={verticalStyles.wrapper}>
          <div style={verticalStyles.sidebar}>
            <div style={verticalStyles.sidebarHeader}>Issue Types</div>
            <div style={verticalStyles.sidebarSubtitle}>patterns detected / checked</div>

            {/* Section 1: Issue Types */}
            <div style={verticalStyles.issueTypeList}>
              {issueTypeCategories.map((category) => {
                const idx = dimension.categories.indexOf(category);
                const isActive = idx === activeTabIndex;
                const detected = category.indicators.length;
                const total = category.totalChecks;

                // Determine badge colors
                let dotColor: string;
                let pillBg: string | undefined;
                let pillTextColor: string;
                if (total != null) {
                  const tier = getDetectionTierColors(detected, total);
                  dotColor = tier.color;
                  pillBg = tier.bg;
                  pillTextColor = tier.color;
                } else {
                  const catDist = getTierDistribution(category.indicators);
                  const worstTier = catDist.needsAttention > 0
                    ? INDICATOR_TIERS[0]
                    : catDist.belowAverage > 0
                    ? INDICATOR_TIERS[1]
                    : catDist.average > 0
                    ? INDICATOR_TIERS[2]
                    : catDist.good > 0
                    ? INDICATOR_TIERS[3]
                    : INDICATOR_TIERS[4];
                  dotColor = worstTier.color;
                  pillTextColor = dotColor;
                }
                const isClean = total != null && detected === 0;

                const isHoveredTab = hoveredSidebarIdx === idx;
                const ratioPercent = total != null && total > 0 ? (detected / total) * 100 : 0;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTabIndex(idx)}
                    onMouseEnter={() => setHoveredSidebarIdx(idx)}
                    onMouseLeave={() => setHoveredSidebarIdx(null)}
                    style={{
                      ...verticalStyles.sidebarTab,
                      ...(isActive ? verticalStyles.sidebarTabActive : verticalStyles.sidebarTabInactive),
                      ...(!isActive && isHoveredTab ? { backgroundColor: '#F0F1F4', borderRadius: '6px' } : {}),
                    }}
                  >
                    <span style={{
                      ...verticalStyles.sidebarTabName,
                      color: isActive ? '#172B4D' : '#6B778C',
                    }}>{category.shortName}</span>

                    {total != null ? (
                      <span
                        style={{
                          ...verticalStyles.ratioPill,
                          backgroundColor: pillBg,
                          color: pillTextColor,
                        }}
                        title={`${detected} patterns detected out of ${total} checked`}
                      >
                        {isClean ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M2.5 6.2L5 8.7L9.5 3.5" stroke="#006644" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span style={{ ...verticalStyles.ratioDot, backgroundColor: dotColor }} />
                        )}
                        <span style={{ fontWeight: 700 }}>{detected}</span>
                        <span style={{ opacity: 0.6 }}>/</span>
                        <span style={{ fontWeight: 400, opacity: 0.7 }}>{total}</span>
                      </span>
                    ) : (
                      <div style={verticalStyles.sidebarTabRight}>
                        <span style={{ ...verticalStyles.sidebarDot, backgroundColor: dotColor }} />
                        <span style={{
                          ...verticalStyles.sidebarCount,
                          backgroundColor: isActive ? '#0052CC' : '#C1C7D0',
                        }}>
                          {detected}
                        </span>
                      </div>
                    )}

                    {/* Mini ratio bar at bottom edge */}
                    {total != null && !isClean && (
                      <div style={verticalStyles.ratioBarTrack}>
                        <div style={{
                          width: `${ratioPercent}%`,
                          height: '100%',
                          backgroundColor: dotColor,
                          borderRadius: '0 1px 1px 0',
                          transition: 'width 0.2s ease',
                        }} />
                      </div>
                    )}
                    {total != null && isClean && (
                      <div style={{
                        ...verticalStyles.ratioBarTrack,
                        backgroundColor: '#ABF5D1',
                      }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#36B37E',
                          borderRadius: '1px',
                          opacity: 0.5,
                        }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Section 2: Cross-Cutting Patterns */}
            {crossFieldCat && (() => {
              const idx = crossFieldIndex;
              const isActive = idx === activeTabIndex;
              const detected = crossFieldCat.indicators.length;
              const total = crossFieldCat.totalChecks;

              let dotColor: string;
              let pillBg: string | undefined;
              let pillTextColor: string;
              if (total != null) {
                const tier = getDetectionTierColors(detected, total);
                dotColor = tier.color;
                pillBg = tier.bg;
                pillTextColor = tier.color;
              } else {
                const catDist = getTierDistribution(crossFieldCat.indicators);
                const worstTier = catDist.needsAttention > 0
                  ? INDICATOR_TIERS[0]
                  : catDist.belowAverage > 0
                  ? INDICATOR_TIERS[1]
                  : catDist.average > 0
                  ? INDICATOR_TIERS[2]
                  : catDist.good > 0
                  ? INDICATOR_TIERS[3]
                  : INDICATOR_TIERS[4];
                dotColor = worstTier.color;
                pillTextColor = dotColor;
              }
              const isClean = total != null && detected === 0;
              const isHoveredTab = hoveredSidebarIdx === idx;
              const ratioPercent = total != null && total > 0 ? (detected / total) * 100 : 0;

              return (
                <div style={verticalStyles.crossCuttingSection}>
                  <div style={verticalStyles.crossCuttingSectionHeader}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginRight: '5px' }}>
                      <rect x="1" y="3" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                      <rect x="5" y="5" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                    </svg>
                    Cross-Cutting
                  </div>
                  <div style={verticalStyles.crossCuttingSectionSubtitle}>systemic patterns</div>
                  <div style={{ padding: '4px 8px 8px' }}>
                    <button
                      onClick={() => setActiveTabIndex(idx)}
                      onMouseEnter={() => setHoveredSidebarIdx(idx)}
                      onMouseLeave={() => setHoveredSidebarIdx(null)}
                      style={{
                        ...verticalStyles.sidebarTab,
                        ...(isActive ? verticalStyles.sidebarTabActive : verticalStyles.sidebarTabInactive),
                        ...(!isActive && isHoveredTab ? { backgroundColor: '#F0F1F4', borderRadius: '6px' } : {}),
                      }}
                    >
                      <span style={{
                        ...verticalStyles.sidebarTabName,
                        color: isActive ? '#172B4D' : '#6B778C',
                      }}>{crossFieldCat.shortName}</span>

                      {total != null ? (
                        <span
                          style={{
                            ...verticalStyles.ratioPill,
                            backgroundColor: pillBg,
                            color: pillTextColor,
                          }}
                          title={`${detected} patterns detected out of ${total} checked`}
                        >
                          {isClean ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M2.5 6.2L5 8.7L9.5 3.5" stroke="#006644" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span style={{ ...verticalStyles.ratioDot, backgroundColor: dotColor }} />
                          )}
                          <span style={{ fontWeight: 700 }}>{detected}</span>
                          <span style={{ opacity: 0.6 }}>/</span>
                          <span style={{ fontWeight: 400, opacity: 0.7 }}>{total}</span>
                        </span>
                      ) : (
                        <div style={verticalStyles.sidebarTabRight}>
                          <span style={{ ...verticalStyles.sidebarDot, backgroundColor: dotColor }} />
                          <span style={{
                            ...verticalStyles.sidebarCount,
                            backgroundColor: isActive ? '#0052CC' : '#C1C7D0',
                          }}>
                            {detected}
                          </span>
                        </div>
                      )}

                      {/* Mini ratio bar at bottom edge */}
                      {total != null && !isClean && (
                        <div style={verticalStyles.ratioBarTrack}>
                          <div style={{
                            width: `${ratioPercent}%`,
                            height: '100%',
                            backgroundColor: dotColor,
                            borderRadius: '0 1px 1px 0',
                            transition: 'width 0.2s ease',
                          }} />
                        </div>
                      )}
                      {total != null && isClean && (
                        <div style={{
                          ...verticalStyles.ratioBarTrack,
                          backgroundColor: '#ABF5D1',
                        }}>
                          <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#36B37E',
                            borderRadius: '1px',
                            opacity: 0.5,
                          }} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
          <div style={verticalStyles.content}>
            {activeCategory && (
              <CategorySection
                key={activeCategory.id}
                category={activeCategory}
                categoryIndex={activeTabIndex}
                onIndicatorClick={setSelectedIndicator}
                onIndicatorDrillDown={onIndicatorDrillDown ? (indicator) => handleDrillDown(indicator, activeTabIndex) : undefined}
                comparisonTeamCount={comparisonTeamCount}
                comparisonTeamNames={comparisonTeamNames}
                embedded
                passedChecks={activeCategory.passedChecks}
                dimensionKey={dimension.dimensionKey}
              />
            )}
          </div>
        </div>
      )}

      {/* Active Category Table for horizontal layout (no redundant header) */}
      {activeCategory && !useVerticalTabs && (
        <CategorySection
          key={activeCategory.id}
          category={activeCategory}
          categoryIndex={activeTabIndex}
          onIndicatorClick={setSelectedIndicator}
          onIndicatorDrillDown={onIndicatorDrillDown ? (indicator) => handleDrillDown(indicator, activeTabIndex) : undefined}
          comparisonTeamCount={comparisonTeamCount}
          comparisonTeamNames={comparisonTeamNames}
          passedChecks={activeCategory.passedChecks}
          dimensionKey={dimension.dimensionKey}
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
  onIndicatorClick: (indicator: IndicatorResult) => void;
  onIndicatorDrillDown?: (indicator: IndicatorResult) => void;
  comparisonTeamCount?: number;
  comparisonTeamNames?: string[];
  embedded?: boolean;
  passedChecks?: PassedCheck[];
  dimensionKey?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  categoryIndex,
  onIndicatorClick,
  onIndicatorDrillDown,
  comparisonTeamCount,
  comparisonTeamNames,
  embedded,
  passedChecks,
  dimensionKey,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  return (
    <div style={embedded ? styles.categorySectionEmbedded : styles.categorySection}>
      {/* Summary toolbar */}
      <SummaryToolbar
        indicators={category.indicators}
        totalChecks={category.totalChecks}
        passedCheckCount={passedChecks?.length}
      />

      {/* Render table view */}
      {category.totalChecks != null ? (
        <TestResultsDashboard
          category={category}
          passedChecks={passedChecks}
          onIndicatorDrillDown={onIndicatorDrillDown}
        />
      ) : dimensionKey === 'ticketReadiness' ? (
        <FieldCompletenessChart
          category={category}
          onIndicatorClick={onIndicatorClick}
          onIndicatorDrillDown={onIndicatorDrillDown}
        />
      ) : (
        <div style={styles.tableContainer}>
          {(() => {
            const groups = groupIndicatorsByField(category.indicators);
            const hasFieldGroups = groups.some(g => g.fieldId);

            // Build row array from field groups
            const rows: Array<
              { indicator: IndicatorResult; fieldName: string; isFirstInGroup: boolean; groupSize: number; groupIndex: number }
            > = [];
            let gIdx = 0;
            for (const group of groups) {
              group.indicators.forEach((indicator, idx) => {
                rows.push({
                  indicator,
                  fieldName: group.fieldName,
                  isFirstInGroup: idx === 0,
                  groupSize: group.indicators.length,
                  groupIndex: gIdx,
                });
              });
              gIdx++;
            }

            return (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {hasFieldGroups && <th style={styles.tableHeaderCell}>Field</th>}
                    <th style={styles.tableHeaderCell}>Finding</th>
                    <th style={{ ...styles.tableHeaderCell, width: '160px' }}>Severity</th>
                    <th style={{ ...styles.tableHeaderCell, textAlign: 'center', width: '110px' }}>History</th>
                    {!hasFieldGroups && <th style={styles.tableHeaderCell}>Applies to</th>}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const { indicator, fieldName, isFirstInGroup, groupSize, groupIndex } = row;
                    const indicatorTier = getIndicatorTier(indicator.benchmarkPercentile);
                    const trend = computeIndicatorTrend(indicator);
                    const trendColor = trend.direction === 'up' ? '#36B37E' : trend.direction === 'down' ? '#DE350B' : '#97A0AF';
                    const stripeBg = indicatorTier.level === 1 ? '#FFF8F7'
                      : indicatorTier.level === 2 ? '#FFFCF5'
                      : groupIndex % 2 === 1 ? '#F8F9FA' : '#FFFFFF';
                    const isHovered = hoveredRowId === indicator.id;
                    const rowBg = isHovered ? '#F0F4FF' : stripeBg;
                    const accentColor = indicatorTier.level <= 3 ? indicatorTier.color : indicatorTier.borderColor;

                    return (
                      <tr
                        key={indicator.id}
                        style={{
                          ...styles.tableRow,
                          backgroundColor: rowBg,
                          ...(isFirstInGroup && hasFieldGroups ? styles.tableRowGroupStart : {}),
                          cursor: onIndicatorDrillDown ? 'pointer' : 'default',
                        }}
                        onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
                        onMouseEnter={() => setHoveredRowId(indicator.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        {hasFieldGroups && (
                          isFirstInGroup ? (
                            <td
                              style={{
                                ...styles.tableCellField,
                              }}
                              rowSpan={groupSize}
                            >
                              {fieldName}
                            </td>
                          ) : null
                        )}
                        <td style={{
                          ...styles.tableCellName,
                          borderLeft: `3px solid ${accentColor}`,
                        }}>
                          {indicator.name}
                        </td>
                        <td style={styles.tableCellPeers}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            borderRadius: '10px',
                            backgroundColor: indicatorTier.bgColor,
                          }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: indicatorTier.color,
                            }}>
                              {indicator.displayValue}
                            </span>
                            <span style={{
                              width: '3px',
                              height: '3px',
                              borderRadius: '50%',
                              backgroundColor: indicatorTier.color,
                              opacity: 0.4,
                              flexShrink: 0,
                            }} />
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: indicatorTier.color,
                              opacity: 0.7,
                            }}>
                              {indicatorTier.name}
                            </span>
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {indicator.trendData && indicator.trendData.length >= 2 && (
                              <div
                                style={{ cursor: 'pointer', opacity: 0.85, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                onClick={(e) => { e.stopPropagation(); onIndicatorClick(indicator); }}
                              >
                                <Sparkline data={indicator.trendData} trend={indicator.trend} width={72} height={22} />
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: trendColor,
                                  flexShrink: 0,
                                }} />
                              </div>
                            )}
                          </div>
                        </td>
                        {!hasFieldGroups && (
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
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
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
  categorySectionEmbedded: {
    backgroundColor: '#FAFBFC',
    borderRadius: 0,
    border: 'none',
    overflow: 'hidden',
    flex: 1,
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
    margin: '16px 20px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
    padding: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableHeaderCell: {
    padding: '9px 12px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#7A869A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    borderBottom: '1px solid #E4E6EB',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#FAFBFC',
  },
  tableRow: {
    borderBottom: '1px solid #EBECF0',
    transition: 'background-color 0.1s ease',
  },
  tableCell: {
    padding: '12px',
    fontSize: '13px',
    color: '#172B4D',
    verticalAlign: 'middle' as const,
  },
  tableCellName: {
    padding: '11px 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    verticalAlign: 'middle' as const,
    lineHeight: 1.4,
  },
  tableCellField: {
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#44546F',
    verticalAlign: 'top' as const,
    borderRight: '1px solid #E4E6EB',
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.35,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    backgroundColor: '#F8F9FA',
  },
  tableCellPeers: {
    padding: '10px 12px',
    fontSize: '12px',
    verticalAlign: 'middle' as const,
  },
  peerBadge: {
    display: 'inline-block',
    padding: '3px 9px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  tableRowGroupStart: {
    borderTop: '1px solid #DFE1E6',
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

// ============================================================================
// Vertical Sidebar Tab Styles (for 5+ categories)
// ============================================================================

const verticalStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    border: '1px solid #E4E6EB',
    borderRadius: '12px',
    overflow: 'hidden',
    minHeight: '400px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.06)',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid #E4E6EB',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '8px 0 0',
  },
  sidebarTab: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 16px 14px',
    border: 'none',
    borderLeft: '3px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
    outline: 'none',
    width: '100%',
    minHeight: '44px',
  },
  sidebarTabActive: {
    backgroundColor: '#F4F5F7',
    borderLeft: '3px solid #0052CC',
    boxShadow: 'inset 0 1px 3px rgba(9, 30, 66, 0.06)',
  },
  sidebarTabInactive: {
    backgroundColor: 'transparent',
    borderLeft: '3px solid transparent',
  },
  sidebarTabName: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  sidebarTabRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  sidebarDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  sidebarCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 6px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  ratioPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 9px 3px 7px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    lineHeight: 1,
    flexShrink: 0,
  },
  ratioDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  ratioBarTrack: {
    position: 'absolute' as const,
    bottom: 0,
    left: '3px',
    right: 0,
    height: '2.5px',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    borderRadius: '0 0 2px 0',
  },
  sidebarHeader: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#44546F',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    padding: '12px 16px 4px',
    background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)',
  },
  sidebarSubtitle: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#8993A4',
    padding: '0 16px 10px',
  },
  issueTypeList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    padding: '4px 8px',
  },
  crossCuttingSection: {
    borderTop: '1px solid #E4E6EB',
    background: 'linear-gradient(180deg, #F7F8FA 0%, #F4F5F7 100%)',
  },
  crossCuttingSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 700,
    color: '#44546F',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    padding: '12px 16px 2px',
  },
  crossCuttingSectionSubtitle: {
    fontSize: '10px',
    fontWeight: 400,
    color: '#8993A4',
    padding: '0 16px 4px',
  },
  content: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
};

// ============================================================================
// Test Results Dashboard Styles
// ============================================================================

const dashStyles: Record<string, React.CSSProperties> = {
  container: {
    margin: '8px 20px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  suiteHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 6px',
    borderTop: '1px solid #F4F5F7',
  },
  suiteFieldName: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#44546F',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  suiteSummary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 16px 4px 16px',
    transition: 'background-color 0.1s ease',
    minHeight: '28px',
  },
  rowName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  passedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 16px',
    minHeight: '28px',
  },
  passedName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#8993A4',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
};

export { SummaryToolbar, TestResultsDashboard, buildFieldSuites };
export default IndicatorsTab;
