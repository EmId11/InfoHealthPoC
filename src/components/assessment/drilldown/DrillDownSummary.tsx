import React from 'react';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ArrowDownIcon from '@atlaskit/icon/glyph/arrow-down';
import MediaServicesActualSizeIcon from '@atlaskit/icon/glyph/media-services/actual-size';
import { IndicatorResult, DimensionResult } from '../../../types/assessment';
import { IndicatorMetadata } from '../../../constants/indicatorMetadata';
import { getIndicatorTier } from '../../../types/indicatorTiers';

interface DrillDownSummaryProps {
  indicator: IndicatorResult;
  dimension: DimensionResult;
  metadata: IndicatorMetadata;
  similarTeamCount: number;
}

const DrillDownSummary: React.FC<DrillDownSummaryProps> = ({
  indicator,
  dimension,
  metadata,
  similarTeamCount,
}) => {
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
        return { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' };
      case 'declining':
        return { bg: '#FFEBE6', text: '#BF2600', border: '#FFBDAD' };
      default:
        return { bg: '#F4F5F7', text: '#5E6C84', border: '#DFE1E6' };
    }
  };

  const getPercentileText = (percentile: number) => {
    if (percentile >= 96) return 'Top 5%';
    if (percentile >= 91) return 'Top 10%';
    if (percentile >= 81) return 'Top 20%';
    if (percentile >= 71) return 'Top 25%';
    if (percentile >= 51) return 'Top 50%';
    if (percentile >= 31) return 'Bottom 50%';
    if (percentile >= 21) return 'Bottom 25%';
    if (percentile >= 11) return 'Bottom 20%';
    if (percentile >= 6) return 'Bottom 10%';
    return 'Bottom 5%';
  };

  /**
   * Get indicator tier status using the unified 5-tier system.
   * Indicators use benchmark percentile (peer comparison), not CHS health score.
   */
  const getIndicatorStatus = (percentile: number) => {
    const tier = getIndicatorTier(percentile);
    return {
      label: tier.name,
      color: tier.color,
      bg: tier.bgColor,
    };
  };

  const trendColors = getTrendColors(indicator.trend);
  const indicatorStatus = getIndicatorStatus(indicator.benchmarkPercentile);

  return (
    <div style={styles.container}>
      {/* Main Summary Card */}
      <div style={styles.summaryCard}>
        <div style={styles.cardHeader}>
          <div style={styles.titleSection}>
            <h1 style={styles.indicatorName}>{indicator.name}</h1>
            <p style={styles.description}>{indicator.description}</p>
          </div>
          <div style={{
            ...styles.healthBadge,
            backgroundColor: indicatorStatus.bg,
            color: indicatorStatus.color,
          }}>
            {indicatorStatus.label}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {/* Your Value */}
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Your Value</span>
            <span style={styles.statValue}>{indicator.displayValue}</span>
            <span style={styles.statSubtext}>
              {indicator.unit !== '%' && indicator.unit !== '' ? `(${indicator.unit})` : ''}
            </span>
          </div>

          {/* Similar Teams Average */}
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Similar Teams Avg</span>
            <span style={styles.statValue}>{indicator.benchmarkDisplayValue}</span>
            <span style={styles.statSubtext}>{similarTeamCount} teams</span>
          </div>

          {/* Percentile */}
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Percentile</span>
            <span style={{
              ...styles.percentileBadge,
              backgroundColor: indicatorStatus.bg,
              color: indicatorStatus.color,
            }}>
              {getPercentileText(indicator.benchmarkPercentile)}
            </span>
            <span style={styles.statSubtext}>vs {similarTeamCount} similar teams</span>
          </div>

          {/* Trend */}
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Trend</span>
            <div style={{
              ...styles.trendBadge,
              backgroundColor: trendColors.bg,
              color: trendColors.text,
              border: `1px solid ${trendColors.border}`,
            }}>
              {getTrendIcon(indicator.trend)}
              <span>{getTrendLabel(indicator.trend)}</span>
            </div>
            <span style={styles.statSubtext}>Over last 6 periods</span>
          </div>
        </div>

        {/* Drill-down explanation */}
        <div style={styles.explanationSection}>
          <div style={styles.explanationIcon}>
            <InfoIcon />
          </div>
          <div style={styles.explanationContent}>
            <span style={styles.explanationTitle}>What you'll see below</span>
            <p style={styles.explanationText}>{metadata.description}</p>
          </div>
        </div>
      </div>

      {/* Context Card */}
      <div style={styles.contextCard}>
        <div style={styles.contextTitle}>Comparison Context</div>
        <div style={styles.contextGrid}>
          <div style={styles.contextItem}>
            <span style={styles.contextLabel}>Dimension</span>
            <span style={styles.contextValue}>{dimension.dimensionName}</span>
          </div>
          <div style={styles.contextItem}>
            <span style={styles.contextLabel}>Similar Teams</span>
            <span style={styles.contextValue}>{similarTeamCount} teams</span>
          </div>
          <div style={styles.contextItem}>
            <span style={styles.contextLabel}>Data Direction</span>
            <span style={styles.contextValue}>
              {indicator.higherIsBetter ? 'Higher is better' : 'Lower is better'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple info icon component
const InfoIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0052CC" strokeWidth="2" />
    <path d="M12 16V12M12 8H12.01" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  titleSection: {
    flex: 1,
    marginRight: '16px',
  },
  indicatorName: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  healthBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    flexShrink: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statSubtext: {
    fontSize: '12px',
    color: '#6B778C',
  },
  percentileBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    width: 'fit-content',
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    width: 'fit-content',
  },
  explanationSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  explanationIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  explanationContent: {
    flex: 1,
  },
  explanationTitle: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0747A6',
    marginBottom: '4px',
  },
  explanationText: {
    margin: 0,
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.5,
  },
  contextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px 24px',
  },
  contextTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '16px',
  },
  contextGrid: {
    display: 'flex',
    gap: '32px',
  },
  contextItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  contextLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  contextValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
};

export default DrillDownSummary;
