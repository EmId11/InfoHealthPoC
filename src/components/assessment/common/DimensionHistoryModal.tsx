import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { DimensionResult, TrendDirection } from '../../../types/assessment';
import { getIndicatorTier } from '../../../types/indicatorTiers';

interface DimensionHistoryModalProps {
  dimension: DimensionResult;
  onClose: () => void;
}

const formatPeriod = (period: string): string => {
  if (period.includes('-W')) {
    return period.split('-W')[1] ? `W${period.split('-W')[1]}` : period;
  }
  const [, month] = period.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  return monthNames[monthIndex] || period;
};

const getTrendText = (trend: TrendDirection): { text: string; color: string } => {
  switch (trend) {
    case 'improving':
      return { text: '↑ Improving', color: '#36B37E' };
    case 'declining':
      return { text: '↓ Declining', color: '#DE350B' };
    case 'stable':
    default:
      return { text: '→ Stable', color: '#6B778C' };
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0]?.value;
    const tier = getIndicatorTier(value);

    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
        <div style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: '#0052CC' }} />
          <span style={styles.tooltipText}>
            Health Score: <strong>{Math.round(value)}</strong>
          </span>
        </div>
        <div style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: tier.color }} />
          <span style={styles.tooltipText}>
            Tier: <strong style={{ color: tier.color }}>{tier.name}</strong>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const DimensionHistoryModal: React.FC<DimensionHistoryModalProps> = ({
  dimension,
  onClose,
}) => {
  const trendData = dimension.trendData || [];
  const currentHealthScore = dimension.healthScore;
  const tier = getIndicatorTier(currentHealthScore);
  const trendInfo = getTrendText(dimension.trend);

  // Prepare chart data - use health score values over time
  const chartData = trendData.map(point => ({
    period: point.period,
    healthScore: point.healthScore ?? point.value, // Use healthScore if available, otherwise value
  }));

  if (chartData.length === 0) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>{dimension.questionForm}</h3>
            <button style={styles.closeButton} onClick={onClose}>
              <CrossIcon label="Close" size="small" />
            </button>
          </div>
          <div style={styles.emptyState}>
            <p>No historical data available for this dimension</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{dimension.questionForm}</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="small" />
          </button>
        </div>

        <div style={styles.modalContent}>
          {/* Summary Row */}
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>CURRENT VALUE</span>
              <span style={{ ...styles.summaryValue, color: tier.color }}>
                {Math.round(currentHealthScore)}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>HEALTH TIER</span>
              <span style={{ ...styles.summaryValue, color: tier.color }}>
                {tier.name}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>TREND</span>
              <span style={{ ...styles.summaryValue, color: trendInfo.color }}>
                {trendInfo.text}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <XAxis
                  dataKey="period"
                  tickFormatter={formatPeriod}
                  tick={{ fontSize: 11, fill: '#6B778C' }}
                  axisLine={{ stroke: '#DFE1E6' }}
                  tickLine={{ stroke: '#DFE1E6' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#6B778C' }}
                  axisLine={{ stroke: '#DFE1E6' }}
                  tickLine={{ stroke: '#DFE1E6' }}
                  width={40}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Health Score line */}
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  name="Health Score"
                  stroke="#0052CC"
                  strokeWidth={2}
                  dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0052CC', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Description */}
          <div style={styles.description}>
            <p style={styles.descriptionText}>{dimension.whyItMatters}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
    paddingRight: '16px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalContent: {
    padding: '20px 24px 24px',
  },
  summaryRow: {
    display: 'flex',
    gap: '32px',
    padding: '16px 20px',
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
    fontWeight: 500,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  chartContainer: {
    width: '100%',
    marginBottom: '16px',
  },
  description: {
    borderTop: '1px solid #EBECF0',
    paddingTop: '16px',
  },
  descriptionText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.6,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: '#6B778C',
    fontSize: '14px',
  },
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    padding: '12px 14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minWidth: '140px',
  },
  tooltipLabel: {
    margin: '0 0 10px 0',
    fontWeight: 600,
    color: '#172B4D',
    fontSize: '13px',
    borderBottom: '1px solid #F0F1F3',
    paddingBottom: '8px',
  },
  tooltipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  tooltipDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  tooltipText: {
    fontSize: '12px',
    color: '#5E6C84',
  },
};

export default DimensionHistoryModal;
