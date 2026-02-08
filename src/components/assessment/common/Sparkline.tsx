import React from 'react';
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendDirection, TrendDataPoint } from '../../../types/assessment';

interface SparklineProps {
  data: TrendDataPoint[];
  trend: TrendDirection;
  width?: number;
  height?: number;
  showBenchmark?: boolean;
}

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
}) => {
  if (!data || data.length < 2) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '10px', color: '#97A0AF' }}>--</span>
      </div>
    );
  }

  const lineColor = getTrendColor(trend);

  // Get benchmark value (use first point's benchmark as reference)
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
