import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendDataPoint } from '../../../types/assessment';

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  showBenchmark?: boolean;
  valueLabel?: string;
  benchmarkLabel?: string;
  isPercentage?: boolean;
  mini?: boolean;
  fixedYAxis?: boolean; // When true, Y-axis is fixed 0-1 with 0.1 increments
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 200,
  showBenchmark = true,
  valueLabel = 'Your Team',
  benchmarkLabel = 'Benchmark',
  isPercentage = false,
  mini = false,
  fixedYAxis = false,
}) => {
  const formatValue = (value: number): string => {
    if (isPercentage) {
      return `${value}%`;
    }
    return value.toFixed(2);
  };

  const formatPeriod = (period: string): string => {
    // Convert "2024-09" to "Sep" or "2024-W38" to "W38"
    if (period.includes('-W')) {
      return period.split('-W')[1] ? `W${period.split('-W')[1]}` : period;
    }
    const [year, month] = period.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    return monthNames[monthIndex] || period;
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: mini ? 60 : height,
  };

  if (mini) {
    // Simplified mini sparkline for indicator cards
    return (
      <div style={containerStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0052CC"
              strokeWidth={2}
              dot={false}
            />
            {showBenchmark && data[0]?.benchmarkValue !== undefined && (
              <Line
                type="monotone"
                dataKey="benchmarkValue"
                stroke="#6B778C"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ ...styles.tooltipValue, color: entry.stroke }}>
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={containerStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="period"
            tickFormatter={formatPeriod}
            tick={{ fontSize: 12, fill: '#6B778C' }}
            axisLine={{ stroke: '#DFE1E6' }}
            tickLine={{ stroke: '#DFE1E6' }}
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fontSize: 12, fill: '#6B778C' }}
            axisLine={{ stroke: '#DFE1E6' }}
            tickLine={{ stroke: '#DFE1E6' }}
            width={50}
            domain={fixedYAxis ? [0, 1] : ['auto', 'auto']}
            ticks={fixedYAxis ? [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />

          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke="#0052CC"
            strokeWidth={2.5}
            dot={{ fill: '#0052CC', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#0052CC', strokeWidth: 2 }}
          />

          {showBenchmark && data[0]?.benchmarkValue !== undefined && (
            <Line
              type="monotone"
              dataKey="benchmarkValue"
              name={benchmarkLabel}
              stroke="#FF8B00"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ fill: '#FF8B00', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#FF8B00', strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  tooltipLabel: {
    margin: '0 0 4px 0',
    fontWeight: 600,
    color: '#172B4D',
    fontSize: '12px',
  },
  tooltipValue: {
    margin: '2px 0',
    fontSize: '12px',
  },
};

export default TrendChart;
