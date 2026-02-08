import React, { useState, useMemo } from 'react';
import { DimensionResult } from '../../../types/assessment';
import { DimensionContributionResult } from '../../../types/outcomeConfidence';
import Sparkline from '../common/Sparkline';
import TableScoreSpectrum from '../common/TableScoreSpectrum';
import DimensionHistoryModal from '../common/DimensionHistoryModal';
import {
  prioritizeDimensionsForOutcome,
  PRIORITY_TIER_CONFIG,
  PriorityTier,
} from '../../../utils/dimensionPrioritization';
import { getDimensionIcon } from '../../../constants/dimensionIcons';

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


interface OutcomeDimensionTableProps {
  dimensions: DimensionResult[];
  contributions: DimensionContributionResult[];
  onDimensionClick: (dimensionKey: string) => void;
}

const focusSortOrder: Record<PriorityTier, number> = { now: 0, next: 1, later: 2 };

/**
 * OutcomeDimensionTable - Table view of dimensions for a specific outcome area
 *
 * Shows dimensions contributing to an outcome with:
 * - Focus (NOW/NEXT/LATER) based on this outcome's dimensions only
 * - Dimension name and question
 * - Why It Matters (outcome-specific explanation)
 * - Percentile, History, Maturity, Indicators
 */
const OutcomeDimensionTable: React.FC<OutcomeDimensionTableProps> = ({
  dimensions,
  contributions,
  onDimensionClick,
}) => {
  const [selectedDimensionForHistory, setSelectedDimensionForHistory] = useState<DimensionResult | null>(null);

  // Map dimension keys to contributions for quick lookup
  const contributionMap = useMemo(() => {
    const map = new Map<string, DimensionContributionResult>();
    for (const c of contributions) {
      if (!c.isMissing) {
        map.set(c.dimensionKey, c);
      }
    }
    return map;
  }, [contributions]);

  // Filter dimensions to only those in this outcome
  const outcomeDimensionKeys = useMemo(
    () => contributions.filter(c => !c.isMissing).map(c => c.dimensionKey),
    [contributions]
  );

  const outcomeDimensions = useMemo(
    () => dimensions.filter(d => contributionMap.has(d.dimensionKey)),
    [dimensions, contributionMap]
  );

  // Calculate priorities for this outcome's dimensions only
  const priorityMap = useMemo(() => {
    const prioritized = prioritizeDimensionsForOutcome(dimensions, outcomeDimensionKeys);
    const map = new Map<string, PriorityTier>();

    prioritized.now.forEach(p => map.set(p.dimension.dimensionKey, 'now'));
    prioritized.next.forEach(p => map.set(p.dimension.dimensionKey, 'next'));
    prioritized.later.forEach(p => map.set(p.dimension.dimensionKey, 'later'));

    return map;
  }, [dimensions, outcomeDimensionKeys]);

  // Sort by priority tier, then by percentile within tier
  const sortedDimensions = useMemo(() => {
    return [...outcomeDimensions].sort((a, b) => {
      const tierA = priorityMap.get(a.dimensionKey) || 'later';
      const tierB = priorityMap.get(b.dimensionKey) || 'later';
      let comparison = focusSortOrder[tierA] - focusSortOrder[tierB];
      if (comparison === 0) {
        comparison = (a.healthScore ?? a.overallPercentile) - (b.healthScore ?? b.overallPercentile);
      }
      return comparison;
    });
  }, [outcomeDimensions, priorityMap]);

  const getRowStyle = (tier: PriorityTier): React.CSSProperties => {
    const config = PRIORITY_TIER_CONFIG[tier];
    return {
      ...styles.row,
      borderLeft: `4px solid ${config.color}`,
    };
  };

  if (sortedDimensions.length === 0) {
    return (
      <div style={styles.emptyState}>
        No dimensions found for this outcome area.
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={{ ...styles.headerCell, ...styles.dimensionColumn }}>
              Dimension
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
            const contribution = contributionMap.get(dimension.dimensionKey);

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
                  <span style={styles.whyText}>
                    {contribution?.whyItMatters || dimension.whyItMatters}
                  </span>
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
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  container: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
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
    minWidth: '180px',
    maxWidth: '220px',
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

export default OutcomeDimensionTable;
