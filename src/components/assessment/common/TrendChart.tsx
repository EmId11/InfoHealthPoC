import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ComposedChart,
  ReferenceDot,
  Line,
} from 'recharts';
import { TrendDataPoint } from '../../../types/assessment';

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  mini?: boolean;
  highlightLatest?: boolean;
  // For indicator-level charts that show raw values, not risk scores
  indicatorMode?: boolean;
  isPercentage?: boolean;
  // Hide the benchmark/median line in indicator mode
  hideBenchmark?: boolean;
  // Show percentile trend instead of value (for indicator percentile charts)
  percentileMode?: boolean;
  // Total teams count for calculating rank (including your team)
  totalTeamsCount?: number;
  // Dimension name for Y-axis labels (e.g., "invisible work")
  dimensionName?: string;
  // Legacy props - kept for backwards compatibility
  showSimilarTeams?: boolean;
  similarTeamsCount?: number;
  showPercentileBand?: boolean;
  showBenchmark?: boolean;
  valueLabel?: string;
  benchmarkLabel?: string;
  fixedYAxis?: boolean;
  showRiskZones?: boolean;
  showAreaFill?: boolean;
  showSimilarTeamsRange?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 220,
  mini = false,
  highlightLatest = true,
  indicatorMode = false,
  isPercentage = false,
  hideBenchmark = false,
  percentileMode = false,
  totalTeamsCount = 48,
  dimensionName = '',
}) => {
  const formatPeriod = (period: string): string => {
    if (period.includes('-W')) {
      return period.split('-W')[1] ? `W${period.split('-W')[1]}` : period;
    }
    const [, month] = period.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    return monthNames[monthIndex] || period;
  };

  // Use health score directly (higher = better performance)
  const processedData = data.map((point) => ({
    period: point.period,
    healthScore: Math.round(point.value),
  }));

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: mini ? 60 : height,
  };

  if (mini) {
    return (
      <div style={containerStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={indicatorMode ? data : processedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <Line
              type="monotone"
              dataKey={indicatorMode ? 'value' : 'healthScore'}
              stroke="#0052CC"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Health score trend mode - show health score trend over time
  if (percentileMode) {
    // Check if data has health score values, otherwise use raw value
    const hasHealthScoreData = data.some(d => d.healthScore !== undefined);

    return (
      <div style={containerStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 10, fill: '#6B778C' }}
              axisLine={{ stroke: '#E4E6EB' }}
              tickLine={{ stroke: '#E4E6EB' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: 10, fill: '#6B778C' }}
              axisLine={{ stroke: '#E4E6EB' }}
              tickLine={{ stroke: '#E4E6EB' }}
              width={40}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? [`${Math.round(value)}`, 'Health Score'] : ['', '']}
              labelFormatter={formatPeriod}
            />
            <Line
              type="monotone"
              dataKey={hasHealthScoreData ? 'healthScore' : 'value'}
              name="Health Score"
              stroke="#6554C0"
              strokeWidth={2}
              dot={{ fill: '#6554C0', strokeWidth: 1, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Simple indicator mode - just show the raw value trend without risk zones
  if (indicatorMode) {
    const formatValue = (value: number): string => {
      if (isPercentage) return `${Math.round(value)}%`;
      if (value < 1 && value > 0) return value.toFixed(2);
      return Math.round(value).toString();
    };

    return (
      <div style={containerStyle}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 10, fill: '#6B778C' }}
              axisLine={{ stroke: '#E4E6EB' }}
              tickLine={{ stroke: '#E4E6EB' }}
            />
            <YAxis
              tickFormatter={formatValue}
              tick={{ fontSize: 10, fill: '#6B778C' }}
              axisLine={{ stroke: '#E4E6EB' }}
              tickLine={{ stroke: '#E4E6EB' }}
              width={40}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? [formatValue(value), 'Value'] : ['', '']}
              labelFormatter={formatPeriod}
            />
            <Line
              type="monotone"
              dataKey="value"
              name="Your Value"
              stroke="#0052CC"
              strokeWidth={2}
              dot={{ fill: '#0052CC', strokeWidth: 1, r: 3 }}
            />
            {!hideBenchmark && data[0]?.benchmarkValue !== undefined && (
              <Line
                type="monotone"
                dataKey="benchmarkValue"
                name="Median"
                stroke="#FF8B00"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ fill: '#FF8B00', strokeWidth: 1, r: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Get risk zone info based on percentile (higher percentile = better)
  const getRiskZone = (percentile: number): { label: string; color: string } => {
    if (percentile <= 25) return { label: 'High Risk', color: '#DE350B' };
    if (percentile <= 75) return { label: 'Moderate Risk', color: '#FF8B00' };
    return { label: 'Low Risk', color: '#36B37E' };
  };

  // Calculate rank from percentile (lower percentile = higher rank number = worse)
  const getRankFromPercentile = (percentile: number): number => {
    // If percentile is 22, team is at 22nd percentile (bottom 22%)
    // That means they're ranked around (100-22)/100 * totalTeams from the top
    return Math.round(((100 - percentile) / 100) * totalTeamsCount) + 1;
  };

  // Get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const healthScorePayload = payload.find((p: any) => p.dataKey === 'healthScore');
      const percentile = healthScorePayload?.value;
      const riskZone = percentile !== undefined ? getRiskZone(percentile) : null;
      const rank = percentile !== undefined ? getRankFromPercentile(percentile) : null;

      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
          {riskZone && (
            <p style={{ ...styles.tooltipZone, color: riskZone.color }}>
              {riskZone.label}
            </p>
          )}
          {rank !== null && (
            <p style={{ ...styles.tooltipValue, color: '#0052CC' }}>
              <strong>{getOrdinalSuffix(rank)}</strong> of {totalTeamsCount} similar teams
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick component for multi-line labels
  // Y-axis is inverted: 100 at bottom (low risk), 0 at top (high risk)
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const value = payload.value;
    let line1 = '';
    let line2 = '';

    // With inverted axis: 16 is near top (high risk), 83 is near bottom (low risk)
    if (value === 16) {
      line1 = 'High risk of';
      line2 = dimensionName ? dimensionName.toLowerCase() : '';
    } else if (value === 50) {
      line1 = 'Moderate risk of';
      line2 = dimensionName ? dimensionName.toLowerCase() : '';
    } else if (value === 83) {
      line1 = 'Low risk of';
      line2 = dimensionName ? dimensionName.toLowerCase() : '';
    }

    if (!line1) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={-6}
          textAnchor="end"
          fill="#6B778C"
          fontSize={9}
        >
          {line1}
        </text>
        {line2 && (
          <text
            x={0}
            y={0}
            dy={6}
            textAnchor="end"
            fill="#6B778C"
            fontSize={9}
          >
            {line2}
          </text>
        )}
      </g>
    );
  };

  // Get the latest data point for highlighting
  const latestPoint = processedData.length > 0 ? processedData[processedData.length - 1] : null;

  return (
    <div style={containerStyle}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={processedData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          {/* Health score zone background bands - inverted: high risk (red) at top, low risk (green) at bottom */}
          <ReferenceArea y1={0} y2={25} fill="#FFEDEB" fillOpacity={1} />
          <ReferenceArea y1={25} y2={75} fill="#FFF4E5" fillOpacity={1} />
          <ReferenceArea y1={75} y2={100} fill="#DCFFF1" fillOpacity={1} />

          <XAxis
            dataKey="period"
            tickFormatter={formatPeriod}
            tick={{ fontSize: 11, fill: '#6B778C' }}
            axisLine={{ stroke: '#DFE1E6' }}
            tickLine={{ stroke: '#DFE1E6' }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[16, 50, 83]}
            tick={<CustomYAxisTick />}
            axisLine={{ stroke: '#DFE1E6' }}
            tickLine={false}
            width={dimensionName ? 100 : 70}
            reversed={true}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Your team's health score line */}
          <Line
            type="monotone"
            dataKey="healthScore"
            name="Your Team"
            stroke="#0052CC"
            strokeWidth={3}
            dot={{ fill: '#0052CC', strokeWidth: 2, r: 4, stroke: '#FFFFFF' }}
            activeDot={{ r: 6, stroke: '#0052CC', strokeWidth: 2, fill: '#FFFFFF' }}
          />

          {/* Highlight the latest data point */}
          {highlightLatest && latestPoint && (
            <ReferenceDot
              x={latestPoint.period}
              y={latestPoint.healthScore}
              r={8}
              fill="#0052CC"
              stroke="#FFFFFF"
              strokeWidth={3}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid #E4E6EB',
    borderRadius: '8px',
    padding: '12px 14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    minWidth: '180px',
  },
  tooltipLabel: {
    margin: '0 0 8px 0',
    fontWeight: 600,
    color: '#172B4D',
    fontSize: '13px',
  },
  tooltipZone: {
    margin: '0 0 8px 0',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tooltipValue: {
    margin: '4px 0',
    fontSize: '12px',
  },
  tooltipGap: {
    margin: '8px 0 0 0',
    fontSize: '11px',
    fontWeight: 500,
    paddingTop: '8px',
    borderTop: '1px solid #F0F1F3',
  },
};

export default TrendChart;
