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
import { TrendDataPoint, TrendDirection } from '../../../types/assessment';

// ============================================================================
// Types
// ============================================================================

interface TrendHistoryModalProps {
  title: string;
  score: number;
  severityLabel: string;
  severityColor: string;
  trend: TrendDirection;
  trendData: TrendDataPoint[];
  unit?: '%' | 'score';
  description?: string;
  onClose: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPeriod = (period: string): string => {
  if (period.includes('-W')) {
    return period.split('-W')[1] ? `W${period.split('-W')[1]}` : period;
  }
  const [, month] = period.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return MONTH_NAMES[monthIndex] || period;
};

const getTrendText = (trend: TrendDirection): { text: string; icon: 'up' | 'down' | 'stable'; color: string } => {
  switch (trend) {
    case 'improving':
      return { text: 'Improving', icon: 'up', color: '#36B37E' };
    case 'declining':
      return { text: 'Declining', icon: 'down', color: '#DE350B' };
    case 'stable':
    default:
      return { text: 'Stable', icon: 'stable', color: '#6B778C' };
  }
};

function getSeverityFromScore(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'Healthy', color: '#006644' };
  if (score >= 50) return { label: 'Fair', color: '#FFAB00' };
  if (score >= 30) return { label: 'At Risk', color: '#FF8B00' };
  return { label: 'Critical', color: '#DE350B' };
}

// ============================================================================
// Custom Tooltip
// ============================================================================

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    const rawValue = payload[0]?.value;
    const displayValue = Math.round(rawValue);
    const sev = getSeverityFromScore(displayValue);

    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
        <div style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: '#0052CC' }} />
          <span style={styles.tooltipText}>
            Score: <strong>{displayValue}{unit === '%' ? '%' : ''}</strong>
          </span>
        </div>
        <div style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: sev.color }} />
          <span style={styles.tooltipText}>
            Tier: <strong style={{ color: sev.color }}>{sev.label}</strong>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// ============================================================================
// Component
// ============================================================================

const TrendHistoryModal: React.FC<TrendHistoryModalProps> = ({
  title,
  score,
  severityLabel,
  severityColor,
  trend,
  trendData,
  unit = '%',
  description,
  onClose,
}) => {
  const trendInfo = getTrendText(trend);

  // Prepare chart data — values might be in 0-1 form for percentages
  const alreadyPercent = trendData.some(d => d.value > 1);
  const chartData = trendData.map(point => ({
    period: point.period,
    score: alreadyPercent ? point.value : point.value * 100,
  }));

  if (chartData.length === 0) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>{title}</h3>
            <button style={styles.closeButton} onClick={onClose}>
              <CrossIcon label="Close" size="small" />
            </button>
          </div>
          <div style={styles.emptyState}>
            <p>No historical data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="small" />
          </button>
        </div>

        <div style={styles.modalContent}>
          {/* Summary Row */}
          <div style={styles.summaryRow}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>CURRENT VALUE</span>
              <span style={{ ...styles.summaryValue, color: severityColor }}>
                {score}{unit === '%' ? '%' : ''}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>HEALTH TIER</span>
              <span style={{ ...styles.summaryValue, color: severityColor }}>
                {severityLabel}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>TREND</span>
              <span style={{ ...styles.summaryValue, color: trendInfo.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {trendInfo.icon === 'up' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
                {trendInfo.icon === 'down' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
                {trendInfo.icon === 'stable' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={trendInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
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
                  tickFormatter={(val: number) => unit === '%' ? `${val}%` : `${val}`}
                />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#0052CC"
                  strokeWidth={2}
                  dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#0052CC', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Description */}
          {description && (
            <div style={styles.description}>
              <p style={styles.descriptionText}>{description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

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

export default TrendHistoryModal;
