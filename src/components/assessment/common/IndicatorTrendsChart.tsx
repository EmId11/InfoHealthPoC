import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { IndicatorCategory, IndicatorResult } from '../../../types/assessment';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';

interface IndicatorTrendsChartProps {
  categories: IndicatorCategory[];
  height?: number;
  dimensionName?: string;
}

interface IndicatorOption {
  indicator: IndicatorResult;
  categoryName: string;
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

const formatValue = (value: number, unit?: string): string => {
  let formatted: string;

  if (value >= 1000) {
    formatted = value.toLocaleString();
  } else if (value < 0.01 && value > 0) {
    formatted = value.toFixed(3);
  } else if (value % 1 !== 0) {
    formatted = value.toFixed(2);
  } else {
    formatted = value.toString();
  }

  // Append unit if provided
  if (unit) {
    // Handle units that should be prefixed or suffixed
    if (unit === '%') {
      return `${formatted}%`;
    }
    return `${formatted} ${unit}`;
  }

  return formatted;
};

const CustomTooltip = ({ active, payload, label, unit, benchmarkValue }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload;
    const value = dataPoint?.value;

    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
        <div style={styles.tooltipRow}>
          <span style={{ ...styles.tooltipDot, backgroundColor: '#0052CC' }} />
          <span style={styles.tooltipText}>
            Value: <strong>{formatValue(value, unit)}</strong>
          </span>
        </div>
        {benchmarkValue !== undefined && (
          <div style={styles.tooltipRow}>
            <span style={{ ...styles.tooltipDot, backgroundColor: '#FF991F' }} />
            <span style={styles.tooltipText}>
              Benchmark: <strong>{formatValue(benchmarkValue, unit)}</strong>
            </span>
          </div>
        )}
        {dataPoint?.benchmarkValue !== undefined && dataPoint.benchmarkValue !== benchmarkValue && (
          <div style={styles.tooltipRow}>
            <span style={{ ...styles.tooltipDot, backgroundColor: '#FF991F', opacity: 0.6 }} />
            <span style={styles.tooltipText}>
              Period benchmark: <strong>{formatValue(dataPoint.benchmarkValue, unit)}</strong>
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const IndicatorTrendsChart: React.FC<IndicatorTrendsChartProps> = ({
  categories,
  height = 400,
}) => {
  // Collect all indicators with their category names
  const indicatorOptions: IndicatorOption[] = useMemo(() => {
    return categories.flatMap(cat =>
      cat.indicators.map(ind => ({
        indicator: ind,
        categoryName: cat.name,
      }))
    );
  }, [categories]);

  // State for selected indicator
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>(
    indicatorOptions[0]?.indicator.id || ''
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get the selected indicator
  const selectedOption = indicatorOptions.find(
    opt => opt.indicator.id === selectedIndicatorId
  );
  const selectedIndicator = selectedOption?.indicator;

  if (!selectedIndicator || !selectedIndicator.trendData || selectedIndicator.trendData.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No trend data available for this indicator</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = selectedIndicator.trendData.map(point => ({
    period: point.period,
    value: point.value,
    benchmarkValue: point.benchmarkValue,
  }));

  // Calculate Y-axis domain with some padding
  const allValues = chartData.flatMap(d => [d.value, d.benchmarkValue].filter(v => v !== undefined)) as number[];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.15 || maxValue * 0.1 || 0.1;
  const yMin = Math.max(0, minValue - padding);
  const yMax = maxValue + padding;

  // Get the current benchmark value for reference line
  const currentBenchmark = selectedIndicator.benchmarkValue;

  // Determine unit for formatting
  const unit = selectedIndicator.unit;

  // Determine trend color based on whether indicator improved
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const improved = selectedIndicator.higherIsBetter
    ? lastValue > firstValue
    : lastValue < firstValue;
  const trendColor = improved ? '#36B37E' : lastValue === firstValue ? '#6B778C' : '#DE350B';

  return (
    <div style={styles.container}>
      {/* Dropdown Selector */}
      <div style={styles.selectorContainer}>
        <label style={styles.selectorLabel}>Select Indicator:</label>
        <div style={styles.dropdownWrapper}>
          <button
            style={styles.dropdownButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span style={styles.dropdownButtonText}>
              {selectedIndicator.name}
            </span>
            <span style={styles.dropdownIcon}>
              <ChevronDownIcon label="" size="small" />
            </span>
          </button>

          {isDropdownOpen && (
            <div style={styles.dropdownMenu}>
              {categories.map(category => (
                <div key={category.name}>
                  <div style={styles.dropdownCategoryHeader}>
                    {category.name}
                  </div>
                  {category.indicators.map(ind => (
                    <button
                      key={ind.id}
                      style={{
                        ...styles.dropdownItem,
                        ...(ind.id === selectedIndicatorId ? styles.dropdownItemSelected : {}),
                      }}
                      onClick={() => {
                        setSelectedIndicatorId(ind.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {ind.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Value Summary */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Current Value</span>
          <span style={{ ...styles.summaryValue, color: trendColor }}>
            {formatValue(selectedIndicator.value, unit)}
          </span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Benchmark</span>
          <span style={styles.summaryValue}>
            {formatValue(currentBenchmark, unit)}
          </span>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Trend</span>
          <span style={{ ...styles.summaryValue, color: trendColor }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              {improved ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg> Improving</>
              ) : lastValue === firstValue ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg> Stable</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg> Declining</>
              )}
            </span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: height - 100 }}>
        <ResponsiveContainer width="100%" height="100%">
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
              domain={[yMin, yMax]}
              tick={{ fontSize: 11, fill: '#6B778C' }}
              axisLine={{ stroke: '#DFE1E6' }}
              tickLine={{ stroke: '#DFE1E6' }}
              width={60}
              tickFormatter={(value) => formatValue(value, unit)}
            />
            <Tooltip
              content={<CustomTooltip unit={unit} benchmarkValue={currentBenchmark} />}
            />

            {/* Benchmark reference line */}
            <ReferenceLine
              y={currentBenchmark}
              stroke="#FF991F"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Benchmark: ${formatValue(currentBenchmark, unit)}`,
                position: 'right',
                fill: '#FF991F',
                fontSize: 11,
              }}
            />

            {/* Value line */}
            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#0052CC"
              strokeWidth={2}
              dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0052CC', stroke: '#fff', strokeWidth: 2 }}
            />

            <Legend
              content={() => (
                <div style={styles.legend}>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendLine, backgroundColor: '#0052CC' }} />
                    <span style={styles.legendText}>Indicator Value</span>
                  </div>
                  <div style={styles.legendItem}>
                    <span style={{ ...styles.legendLine, backgroundColor: '#FF991F', borderStyle: 'dashed' }} />
                    <span style={styles.legendText}>Benchmark</span>
                  </div>
                </div>
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  selectorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  selectorLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#5E6C84',
  },
  dropdownWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px',
  },
  dropdownButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#172B4D',
    textAlign: 'left',
  },
  dropdownButtonText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownIcon: {
    marginLeft: '8px',
    color: '#6B778C',
    flexShrink: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 100,
  },
  dropdownCategoryHeader: {
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    backgroundColor: '#F4F5F7',
    borderBottom: '1px solid #EBECF0',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '8px 12px 8px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '13px',
    color: '#172B4D',
    textAlign: 'left',
    cursor: 'pointer',
  },
  dropdownItemSelected: {
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    fontWeight: 500,
  },
  summaryRow: {
    display: 'flex',
    gap: '24px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#6B778C',
    fontSize: '14px',
  },
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    padding: '12px 14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minWidth: '160px',
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
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendLine: {
    width: '20px',
    height: '3px',
    borderRadius: '1px',
  },
  legendText: {
    fontSize: '12px',
    color: '#5E6C84',
  },
};

export default IndicatorTrendsChart;
