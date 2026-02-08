import React, { useState, useMemo } from 'react';
import { DimensionResult } from '../../types/assessment';
import Sparkline from './common/Sparkline';
import TableScoreSpectrum from './common/TableScoreSpectrum';
import DimensionHistoryModal from './common/DimensionHistoryModal';
import { prioritizeDimensions, PRIORITY_TIER_CONFIG, PriorityTier } from '../../utils/dimensionPrioritization';
import { getIndicatorTier, INDICATOR_TIERS } from '../../types/indicatorTiers';
import { getDimensionIcon } from '../../constants/dimensionIcons';

// Generate mock comparison team positions for a dimension
// In a real app, this would come from the API
const generateMockTeamPositions = (dimensionKey: string, teamCount: number = 20): number[] => {
  // Use dimensionKey as seed for consistent random positions per dimension
  const seed = dimensionKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const positions: number[] = [];

  for (let i = 0; i < teamCount; i++) {
    const pseudoRandom = Math.sin(seed * (i + 1) * 9999) * 10000;
    const normalized = (pseudoRandom - Math.floor(pseudoRandom));
    const position = Math.max(5, Math.min(95, normalized * 100));
    positions.push(position);
  }

  return positions;
};


interface DimensionTableViewProps {
  dimensions: DimensionResult[];
  onDimensionClick: (dimensionKey: string) => void;
}

type SortField = 'dimensionName' | 'healthScore';
type SortDirection = 'asc' | 'desc';

const focusSortOrder: Record<PriorityTier, number> = { now: 0, next: 1, later: 2 };

const DimensionTableView: React.FC<DimensionTableViewProps> = ({
  dimensions,
  onDimensionClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('healthScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedDimensionForHistory, setSelectedDimensionForHistory] = useState<DimensionResult | null>(null);

  // Calculate priorities for all dimensions
  const priorityMap = useMemo(() => {
    const prioritized = prioritizeDimensions(dimensions);
    const map = new Map<string, PriorityTier>();

    prioritized.now.forEach(p => map.set(p.dimension.dimensionKey, 'now'));
    prioritized.next.forEach(p => map.set(p.dimension.dimensionKey, 'next'));
    prioritized.later.forEach(p => map.set(p.dimension.dimensionKey, 'later'));

    return map;
  }, [dimensions]);

  // Calculate stats for the summary bar (matching OutcomeDetailPage style)
  const dimensionStats = useMemo(() => {
    const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let improved = 0, declined = 0, stable = 0;

    dimensions.forEach(d => {
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

    return { tierCounts, improved, declined, stable, total: dimensions.length };
  }, [dimensions]);

  const indicatorStats = useMemo(() => {
    let total = 0, needingAttention = 0, improving = 0, declining = 0, stable = 0;

    dimensions.forEach(d => {
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
  }, [dimensions]);

  // Build tier segments for stacked bar (only non-zero)
  const tierSegments = INDICATOR_TIERS
    .map(t => ({ tier: t, count: dimensionStats.tierCounts[t.level] }))
    .filter(s => s.count > 0);

  const attentionPct = indicatorStats.total > 0
    ? Math.round((indicatorStats.needingAttention / indicatorStats.total) * 100)
    : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDimensions = useMemo(() => {
    const sorted = [...dimensions].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'dimensionName':
          comparison = a.dimensionName.localeCompare(b.dimensionName);
          break;
        case 'healthScore':
          comparison = (a.healthScore ?? a.overallPercentile) - (b.healthScore ?? b.overallPercentile);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [dimensions, sortField, sortDirection]);

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const getRowStyle = (tier: PriorityTier): React.CSSProperties => {
    const config = PRIORITY_TIER_CONFIG[tier];
    return {
      ...styles.row,
      borderLeft: `4px solid ${config.color}`,
    };
  };

  return (
    <div style={styles.container}>
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
              <span style={{ ...styles.trendIcon, color: '#36B37E' }}>↑</span>
              <span style={styles.trendCount}>{dimensionStats.improved}</span>
              <span style={styles.trendLabel}>improved</span>
            </div>
            <div style={styles.trendItem}>
              <span style={{ ...styles.trendIcon, color: '#DE350B' }}>↓</span>
              <span style={styles.trendCount}>{dimensionStats.declined}</span>
              <span style={styles.trendLabel}>declined</span>
            </div>
            <div style={styles.trendItem}>
              <span style={{ ...styles.trendIcon, color: '#6B778C' }}>→</span>
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
            <span style={{ ...styles.miniTrend, color: '#36B37E' }}>↑{indicatorStats.improving}</span>
            <span style={{ ...styles.miniTrend, color: '#DE350B' }}>↓{indicatorStats.declining}</span>
            <span style={{ ...styles.miniTrend, color: '#6B778C' }}>→{indicatorStats.stable}</span>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
          <tr style={styles.headerRow}>
            <th
              style={{ ...styles.headerCell, ...styles.dimensionColumn }}
              onClick={() => handleSort('dimensionName')}
            >
              Dimension{getSortIndicator('dimensionName')}
            </th>
            <th style={{ ...styles.headerCell, ...styles.whyColumn }}>
              Why It Matters
            </th>
            <th style={{ ...styles.headerCell, ...styles.historyColumn }}>
              History
            </th>
            <th style={{ ...styles.headerCell, ...styles.spectrumColumn }}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDimensions.map((dimension) => {
            const tier = priorityMap.get(dimension.dimensionKey) || 'later';

            return (
              <tr
                key={dimension.dimensionKey}
                style={getRowStyle(tier)}
                onClick={() => onDimensionClick(dimension.dimensionKey)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4F5F7';
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <td style={{ ...styles.cell, ...styles.dimensionColumn }}>
                  <div style={styles.dimensionCell}>
                    <span style={styles.dimensionIconWrapper}>
                      {getDimensionIcon(dimension.dimensionKey, 'small', '#0052CC')}
                    </span>
                    <div style={styles.dimensionTextWrapper}>
                      <span style={styles.dimensionTitle}>{dimension.dimensionName.toUpperCase()}</span>
                      <span style={styles.questionText}>{dimension.questionForm}</span>
                    </div>
                  </div>
                </td>
                <td style={{ ...styles.cell, ...styles.whyColumn }}>
                  <span style={styles.whyText}>{dimension.whyItMatters}</span>
                </td>
                <td
                  style={{ ...styles.cell, ...styles.historyColumn, textAlign: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDimensionForHistory(dimension);
                  }}
                >
                  <div style={styles.sparklineWrapper}>
                    <Sparkline
                      data={dimension.trendData}
                      trend={dimension.trend}
                      width={80}
                      height={24}
                    />
                  </div>
                </td>
                <td style={{ ...styles.cell, ...styles.spectrumColumn }}>
                  <TableScoreSpectrum
                    score={dimension.healthScore ?? dimension.overallPercentile}
                    otherTeamScores={generateMockTeamPositions(dimension.dimensionKey)}
                    leftLabel={dimension.spectrumLeftLabel}
                    rightLabel={dimension.spectrumRightLabel}
                    width={400}
                  />
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      {/* Dimension History Modal */}
      {selectedDimensionForHistory && (
        <DimensionHistoryModal
          dimension={selectedDimensionForHistory}
          onClose={() => setSelectedDimensionForHistory(null)}
        />
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

  // Stats Summary Bar (matching OutcomeDetailPage)
  statsSummaryBar: {
    display: 'flex',
    alignItems: 'stretch',
    padding: '16px 20px',
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

  trendIcon: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1,
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
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  headerRow: {
    backgroundColor: '#F4F5F7',
    borderBottom: '2px solid #DFE1E6',
  },
  headerCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#172B4D',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background-color 0.2s ease',
  },
  row: {
    borderBottom: '1px solid #EBECF0',
    transition: 'background-color 0.15s ease',
  },
  cell: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  spectrumColumn: {
    width: '420px',
    minWidth: '420px',
  },
  dimensionColumn: {
    minWidth: '220px',
    maxWidth: '300px',
  },
  whyColumn: {
    minWidth: '140px',
    maxWidth: '200px',
  },
  historyColumn: {
    width: '90px',
  },
  dimensionCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  dimensionIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  dimensionTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  dimensionTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#172B4D',
    letterSpacing: '0.5px',
  },
  questionText: {
    color: '#5E6C84',
    fontSize: '12px',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  whyText: {
    color: '#5E6C84',
    fontSize: '12px',
    lineHeight: 1.5,
  },
  sparklineWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
};

export default DimensionTableView;
