import React from 'react';
import { LineChart, Line, ResponsiveContainer, ReferenceLine, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendDirection, TrendDataPoint } from '../../../types/assessment';

interface SparklineProps {
  data: TrendDataPoint[];
  trend: TrendDirection;
  width?: number;
  height?: number;
  showBenchmark?: boolean;
  enhanced?: boolean;
  unit?: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getTrendColor = (trend: TrendDirection): string => {
  switch (trend) {
    case 'improving':
      return '#36B37E'; // Green
    case 'declining':
      return '#DE350B'; // Red
    case 'stable':
    default:
      return '#6B778C'; // Gray
  }
};

const Sparkline: React.FC<SparklineProps> = ({
  data,
  trend,
  width = 70,
  height = 24,
  showBenchmark = false,
  enhanced = false,
  unit,
}) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '10px', color: '#97A0AF' }}>--</span>
      </div>
    );
  }

  // Enhanced mode: richer chart with axes, dots, and month labels
  if (enhanced) {
    const isPercent = unit === '%';

    // Format data: add month labels and scale percentage values for display
    // Auto-detect if percent data is already in 0-100 form (any value > 1) vs 0-1 form
    const alreadyPercent = isPercent && data.some(d => d.value > 1);
    const formattedData = data.map((d) => {
      const parts = d.period.split('-');
      let label: string;
      if (parts.length === 2 && !parts[1].startsWith('W')) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        label = MONTH_LABELS[monthIndex] || d.period;
      } else {
        label = d.period;
      }
      return {
        ...d,
        label,
        displayVal: (isPercent && !alreadyPercent) ? d.value * 100 : d.value,
      };
    });

    const values = formattedData.map(d => d.displayVal);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    // Compute nice domain bounds with padding
    const step = isPercent ? 2 : range / 4;
    const domainMin = Math.max(0, Math.floor((minVal - range * 0.2) / step) * step);
    const domainMax = Math.ceil((maxVal + range * 0.2) / step) * step;

    const formatYTick = (val: number) => {
      if (isPercent) return `${Math.round(val)}%`;
      if (val % 1 === 0) return `${val}`;
      if (Math.abs(val) < 10) return `${Math.round(val * 100) / 100}`;
      return `${Math.round(val * 10) / 10}`;
    };

    return (
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 4, right: 8, bottom: 2, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0F1F4" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: '#8993A4' }}
              axisLine={{ stroke: '#E4E6EB' }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[domainMin, domainMax]}
              tickFormatter={formatYTick}
              tick={{ fontSize: 9, fill: '#8993A4' }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
              width={34}
            />
            <Line
              type="monotone"
              dataKey="displayVal"
              stroke={getTrendColor(trend)}
              strokeWidth={2}
              dot={{ r: 3, fill: getTrendColor(trend), stroke: '#FFFFFF', strokeWidth: 1.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Simple sparkline mode (original)
  const lineColor = getTrendColor(trend);
  const benchmarkValue = data[0]?.benchmarkValue;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          {showBenchmark && benchmarkValue !== undefined && (
            <ReferenceLine
              y={benchmarkValue}
              stroke="#DFE1E6"
              strokeDasharray="2 2"
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;
