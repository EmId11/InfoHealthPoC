import React, { useState } from 'react';
import { IndicatorResult } from '../../../types/assessment';
import TrendIndicator from '../common/TrendIndicator';
import BenchmarkComparison from '../common/BenchmarkComparison';
import TrendChart from './TrendChart';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';

interface IndicatorCardProps {
  indicator: IndicatorResult;
  showTrendChart?: boolean;
  showDescription?: boolean;
  showComparison?: boolean;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({
  indicator,
  showTrendChart = true,
  showDescription = true,
  showComparison = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isPercentage = indicator.unit === '%';

  return (
    <div style={styles.card}>
      <button
        style={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div style={styles.headerLeft}>
          <span style={styles.chevron}>
            {isExpanded ? (
              <ChevronDownIcon label="" size="medium" />
            ) : (
              <ChevronRightIcon label="" size="medium" />
            )}
          </span>
          <div style={styles.headerContent}>
            <span style={styles.indicatorName}>{indicator.name}</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.value}>{indicator.displayValue}</span>
          <TrendIndicator direction={indicator.trend} size="small" />
        </div>
      </button>

      {isExpanded && (
        <div style={styles.content}>
          {showDescription && indicator.description && (
            <p style={styles.description}>{indicator.description}</p>
          )}

          <div style={styles.metrics}>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Your value:</span>
              <span style={styles.metricValue}>{indicator.displayValue}</span>
            </div>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Benchmark:</span>
              <span style={styles.metricValue}>{indicator.benchmarkDisplayValue}</span>
            </div>
            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>Trend:</span>
              <TrendIndicator direction={indicator.trend} size="small" showLabel />
            </div>
          </div>

          {showComparison && (
            <div style={styles.comparisonSection}>
              <BenchmarkComparison
                comparison={indicator.benchmarkComparison}
                percentile={indicator.benchmarkPercentile}
                size="medium"
                showBar
              />
            </div>
          )}

          {showTrendChart && indicator.trendData.length > 0 && (
            <div style={styles.chartSection}>
              <h5 style={styles.chartTitle}>Trend Over Time</h5>
              <TrendChart
                data={indicator.trendData}
                height={160}
                showBenchmark
                isPercentage={isPercentage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    flex: 1,
  },
  chevron: {
    color: '#6B778C',
    flexShrink: 0,
    marginTop: '-2px',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  indicatorName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  value: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  content: {
    padding: '16px',
    borderTop: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
  description: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  metrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#6B778C',
    minWidth: '80px',
  },
  metricValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  comparisonSection: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
  },
  chartSection: {
    marginTop: '16px',
  },
  chartTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default IndicatorCard;
