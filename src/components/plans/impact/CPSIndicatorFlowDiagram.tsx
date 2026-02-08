// CPSIndicatorFlowDiagram Component
// Three-column flow diagram mapping CPS indicators → dimensions → outcomes
// Shows weighted contributions from indicator data

import React, { useState, useMemo } from 'react';
import {
  CPSResult,
  IndicatorContribution,
  getCPSCategoryColor,
} from '../../../types/progressScore';
import { CPS_INDICATORS } from '../../../utils/mockCPSData';

interface CPSIndicatorFlowDiagramProps {
  teams: CPSResult[];
  yourTeam: CPSResult;
  onIndicatorClick?: (indicatorId: string) => void;
}

// Indicator to Dimension mapping
const INDICATOR_DIMENSION_MAP: Record<string, string> = {
  workCarriedOver: 'Delivery',
  throughputVariability: 'Delivery',
  lastDayCompletions: 'Delivery',
  acceptanceCriteria: 'Process Maturity',
  storyEstimationRate: 'Process Maturity',
  policyExclusions: 'Process Maturity',
  avgCommentsPerIssue: 'Collaboration',
  singleContributorIssueRate: 'Collaboration',
  siloedWorkItems: 'Collaboration',
  firstTimePassRate: 'Quality',
  staleWorkItems: 'Quality',
  midSprintCreations: 'Predictability',
  jiraUpdateFrequency: 'Predictability',
};

// Dimension colors
const DIMENSION_COLORS: Record<string, string> = {
  'Delivery': '#0052CC',
  'Process Maturity': '#5243AA',
  'Collaboration': '#00875A',
  'Quality': '#FF8B00',
  'Predictability': '#6B778C',
};

// Dimension to Outcome mapping
const DIMENSION_OUTCOME_MAP: Record<string, string[]> = {
  'Delivery': ['Predictable Delivery', 'Planning Accuracy'],
  'Process Maturity': ['Sprint Health', 'Team Alignment'],
  'Collaboration': ['Team Health', 'Knowledge Sharing'],
  'Quality': ['Technical Excellence', 'Customer Satisfaction'],
  'Predictability': ['Planning Accuracy', 'Sprint Health'],
};

// All unique outcomes
const ALL_OUTCOMES = ['Predictable Delivery', 'Planning Accuracy', 'Sprint Health', 'Team Alignment', 'Team Health', 'Knowledge Sharing', 'Technical Excellence', 'Customer Satisfaction'];

export const CPSIndicatorFlowDiagram: React.FC<CPSIndicatorFlowDiagramProps> = ({
  teams,
  yourTeam,
  onIndicatorClick,
}) => {
  const [hoveredElement, setHoveredElement] = useState<{
    type: 'indicator' | 'dimension' | 'outcome';
    id: string;
  } | null>(null);

  // Calculate indicator contributions for your team
  const indicatorData = useMemo(() => {
    const contributions = yourTeam.api.indicatorContributions;
    return CPS_INDICATORS.map(indicator => {
      const contribution = contributions.find(c => c.indicatorId === indicator.id);
      return {
        ...indicator,
        contribution: contribution?.weightedContribution || 0,
        effectSize: contribution?.effectSize || 0,
        dimension: INDICATOR_DIMENSION_MAP[indicator.id],
      };
    });
  }, [yourTeam]);

  // Calculate dimension aggregates
  const dimensionData = useMemo(() => {
    const dimensions = ['Delivery', 'Process Maturity', 'Collaboration', 'Quality', 'Predictability'];

    return dimensions.map(dim => {
      const dimIndicators = indicatorData.filter(i => i.dimension === dim);
      const totalContribution = dimIndicators.reduce((sum, i) => sum + i.contribution, 0);
      const avgContribution = dimIndicators.length > 0 ? totalContribution / dimIndicators.length : 0;

      return {
        name: dim,
        color: DIMENSION_COLORS[dim],
        indicatorCount: dimIndicators.length,
        totalContribution,
        avgContribution,
        indicators: dimIndicators.map(i => i.id),
        outcomes: DIMENSION_OUTCOME_MAP[dim],
      };
    });
  }, [indicatorData]);

  // Calculate outcome aggregates (sum contributions from dimensions that affect them)
  const outcomeData = useMemo(() => {
    return ALL_OUTCOMES.map(outcome => {
      const affectingDimensions = dimensionData.filter(d => d.outcomes.includes(outcome));
      const totalContribution = affectingDimensions.reduce((sum, d) => sum + d.totalContribution, 0);

      return {
        name: outcome,
        totalContribution,
        dimensionCount: affectingDimensions.length,
        dimensions: affectingDimensions.map(d => d.name),
      };
    });
  }, [dimensionData]);

  // Get highlight state for elements
  const getHighlightState = (type: string, id: string): 'normal' | 'highlighted' | 'dimmed' => {
    if (!hoveredElement) return 'normal';

    if (hoveredElement.type === 'indicator') {
      if (type === 'indicator' && id === hoveredElement.id) return 'highlighted';
      if (type === 'dimension') {
        const indicator = indicatorData.find(i => i.id === hoveredElement.id);
        if (indicator?.dimension === id) return 'highlighted';
      }
      if (type === 'outcome') {
        const indicator = indicatorData.find(i => i.id === hoveredElement.id);
        const dimension = dimensionData.find(d => d.name === indicator?.dimension);
        if (dimension?.outcomes.includes(id)) return 'highlighted';
      }
      return 'dimmed';
    }

    if (hoveredElement.type === 'dimension') {
      if (type === 'dimension' && id === hoveredElement.id) return 'highlighted';
      if (type === 'indicator') {
        const indicator = indicatorData.find(i => i.id === id);
        if (indicator?.dimension === hoveredElement.id) return 'highlighted';
      }
      if (type === 'outcome') {
        const dimension = dimensionData.find(d => d.name === hoveredElement.id);
        if (dimension?.outcomes.includes(id)) return 'highlighted';
      }
      return 'dimmed';
    }

    if (hoveredElement.type === 'outcome') {
      if (type === 'outcome' && id === hoveredElement.id) return 'highlighted';
      const outcome = outcomeData.find(o => o.name === hoveredElement.id);
      if (type === 'dimension' && outcome?.dimensions.includes(id)) return 'highlighted';
      if (type === 'indicator') {
        const indicator = indicatorData.find(i => i.id === id);
        const dimension = dimensionData.find(d => d.name === indicator?.dimension);
        if (outcome?.dimensions.includes(dimension?.name || '')) return 'highlighted';
      }
      return 'dimmed';
    }

    return 'normal';
  };

  // Color helper based on contribution
  const getContributionColor = (contribution: number): string => {
    if (contribution > 0.02) return '#006644';
    if (contribution > 0) return '#00875A';
    if (contribution > -0.02) return '#6B778C';
    return '#DE350B';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>IMPACT FLOW</h3>
          <p style={styles.subtitle}>
            How indicator changes flow through dimensions to outcomes
          </p>
        </div>
      </div>

      {/* Three Column Flow */}
      <div style={styles.flowContainer}>
        {/* Column 1: Indicators */}
        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <span style={styles.columnTitle}>Indicators</span>
            <span style={styles.columnCount}>{indicatorData.length} metrics</span>
          </div>
          <div style={styles.columnContent}>
            {indicatorData.map(indicator => {
              const state = getHighlightState('indicator', indicator.id);
              const contributionColor = getContributionColor(indicator.contribution);

              return (
                <div
                  key={indicator.id}
                  style={{
                    ...styles.indicatorCard,
                    opacity: state === 'dimmed' ? 0.4 : 1,
                    borderColor: state === 'highlighted' ? DIMENSION_COLORS[indicator.dimension] : '#EBECF0',
                    borderWidth: state === 'highlighted' ? 2 : 1,
                  }}
                  onMouseEnter={() => setHoveredElement({ type: 'indicator', id: indicator.id })}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => onIndicatorClick?.(indicator.id)}
                >
                  <div style={styles.indicatorHeader}>
                    <span style={styles.indicatorName}>{indicator.name}</span>
                    <span style={{
                      ...styles.indicatorWeight,
                      backgroundColor: DIMENSION_COLORS[indicator.dimension] + '20',
                      color: DIMENSION_COLORS[indicator.dimension],
                    }}>
                      {(indicator.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={styles.indicatorBar}>
                    <div
                      style={{
                        ...styles.indicatorBarFill,
                        width: `${Math.min(100, Math.abs(indicator.contribution) * 500 + 10)}%`,
                        backgroundColor: contributionColor,
                        marginLeft: indicator.contribution < 0 ? 'auto' : 0,
                      }}
                    />
                  </div>
                  <span style={{ ...styles.indicatorContribution, color: contributionColor }}>
                    {indicator.contribution >= 0 ? '+' : ''}{(indicator.contribution * 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Dimensions */}
        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <span style={styles.columnTitle}>Dimensions</span>
            <span style={styles.columnCount}>{dimensionData.length} areas</span>
          </div>
          <div style={styles.columnContent}>
            {dimensionData.map(dimension => {
              const state = getHighlightState('dimension', dimension.name);
              const contributionColor = getContributionColor(dimension.avgContribution);

              return (
                <div
                  key={dimension.name}
                  style={{
                    ...styles.dimensionCard,
                    opacity: state === 'dimmed' ? 0.4 : 1,
                    borderColor: state === 'highlighted' ? dimension.color : '#EBECF0',
                    borderWidth: state === 'highlighted' ? 2 : 1,
                  }}
                  onMouseEnter={() => setHoveredElement({ type: 'dimension', id: dimension.name })}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <div style={styles.dimensionHeader}>
                    <div style={{ ...styles.dimensionDot, backgroundColor: dimension.color }} />
                    <span style={styles.dimensionName}>{dimension.name}</span>
                  </div>
                  <div style={styles.dimensionStats}>
                    <span style={styles.dimensionIndicatorCount}>
                      {dimension.indicatorCount} indicators
                    </span>
                    <span style={{ ...styles.dimensionContribution, color: contributionColor }}>
                      {dimension.avgContribution >= 0 ? '+' : ''}{(dimension.avgContribution * 100).toFixed(1)}
                    </span>
                  </div>
                  <div style={styles.dimensionBar}>
                    <div
                      style={{
                        ...styles.dimensionBarFill,
                        width: `${Math.min(100, Math.abs(dimension.avgContribution) * 400 + 20)}%`,
                        backgroundColor: dimension.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Outcomes */}
        <div style={styles.column}>
          <div style={styles.columnHeader}>
            <span style={styles.columnTitle}>Outcomes</span>
            <span style={styles.columnCount}>{outcomeData.length} goals</span>
          </div>
          <div style={styles.columnContent}>
            {outcomeData.map(outcome => {
              const state = getHighlightState('outcome', outcome.name);
              const contributionColor = getContributionColor(outcome.totalContribution / (outcome.dimensionCount || 1));

              return (
                <div
                  key={outcome.name}
                  style={{
                    ...styles.outcomeCard,
                    opacity: state === 'dimmed' ? 0.4 : 1,
                    borderColor: state === 'highlighted' ? '#0052CC' : '#EBECF0',
                    borderWidth: state === 'highlighted' ? 2 : 1,
                  }}
                  onMouseEnter={() => setHoveredElement({ type: 'outcome', id: outcome.name })}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <span style={styles.outcomeName}>{outcome.name}</span>
                  <div style={styles.outcomeStats}>
                    <span style={styles.outcomeDimensionCount}>
                      {outcome.dimensionCount} dimensions
                    </span>
                    <span style={{ ...styles.outcomeContribution, color: contributionColor }}>
                      {outcome.totalContribution >= 0 ? '+' : ''}{(outcome.totalContribution * 100).toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flow Lines (SVG overlay) */}
      <svg style={styles.flowLines} width="100%" height="100%">
        {/* Lines would be rendered here based on hover state */}
        {/* Simplified for now - complex path calculations omitted */}
      </svg>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendTitle}>Contribution scale:</span>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#006644' }} />
          <span>Strong positive</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#00875A' }} />
          <span>Positive</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#6B778C' }} />
          <span>Neutral</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendDot, backgroundColor: '#DE350B' }} />
          <span>Negative</span>
        </div>
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
  headerLeft: {},
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
  flowContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 24,
  },
  column: {},
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2px solid #EBECF0',
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  columnCount: {
    fontSize: 11,
    color: '#6B778C',
  },
  columnContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  indicatorCard: {
    padding: 10,
    backgroundColor: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  indicatorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  indicatorName: {
    fontSize: 11,
    fontWeight: 500,
    color: '#172B4D',
  },
  indicatorWeight: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 10,
  },
  indicatorBar: {
    height: 4,
    backgroundColor: '#EBECF0',
    borderRadius: 2,
    marginBottom: 4,
    display: 'flex',
  },
  indicatorBarFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.2s ease',
  },
  indicatorContribution: {
    fontSize: 12,
    fontWeight: 700,
    display: 'block',
    textAlign: 'right',
  },
  dimensionCard: {
    padding: 12,
    backgroundColor: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dimensionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dimensionDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  dimensionName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
  },
  dimensionStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionIndicatorCount: {
    fontSize: 11,
    color: '#6B778C',
  },
  dimensionContribution: {
    fontSize: 14,
    fontWeight: 700,
  },
  dimensionBar: {
    height: 6,
    backgroundColor: '#EBECF0',
    borderRadius: 3,
  },
  dimensionBarFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.2s ease',
  },
  outcomeCard: {
    padding: 12,
    backgroundColor: '#FAFBFC',
    border: '1px solid #EBECF0',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  outcomeName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#172B4D',
    display: 'block',
    marginBottom: 6,
  },
  outcomeStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  outcomeDimensionCount: {
    fontSize: 11,
    color: '#6B778C',
  },
  outcomeContribution: {
    fontSize: 14,
    fontWeight: 700,
  },
  flowLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #EBECF0',
    fontSize: 11,
    color: '#6B778C',
  },
  legendTitle: {
    fontWeight: 500,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
};

export default CPSIndicatorFlowDiagram;
