import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from 'recharts';
import { DimensionResult, RiskLevel } from '../../../types/assessment';

interface TrendOverviewProps {
  dimensions: DimensionResult[];
  onDimensionClick: (dimensionKey: string) => void;
}

const getRiskColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'high': return '#DE350B';
    case 'moderate': return '#FF8B00';
    case 'low': return '#36B37E';
  }
};

// Color palette for dimension lines (distinct colors)
const DIMENSION_COLORS = [
  '#0052CC', // Blue
  '#00875A', // Green
  '#FF5630', // Red
  '#6554C0', // Purple
  '#00B8D9', // Cyan
  '#FFAB00', // Yellow
  '#36B37E', // Teal
  '#FF8B00', // Orange
  '#5E6C84', // Gray
  '#403294', // Dark purple
  '#008DA6', // Dark cyan
];

const TrendOverview: React.FC<TrendOverviewProps> = ({ dimensions, onDimensionClick }) => {
  const [activeDimensions, setActiveDimensions] = useState<Set<string>>(
    new Set(dimensions.map(d => d.dimensionKey))
  );

  // Get all unique periods across all dimensions
  const allPeriods = new Set<string>();
  dimensions.forEach(dim => {
    dim.trendData.forEach(td => allPeriods.add(td.period));
  });
  const sortedPeriods = Array.from(allPeriods).sort();

  // Build chart data: one row per period, columns for each dimension
  const chartData = sortedPeriods.map(period => {
    const row: Record<string, string | number> = { period };
    dimensions.forEach(dim => {
      const point = dim.trendData.find(td => td.period === period);
      if (point) {
        row[dim.dimensionKey] = point.value;
      }
    });
    return row;
  });

  const formatPeriod = (period: string): string => {
    if (period.includes('-W')) {
      return `W${period.split('-W')[1]}`;
    }
    const [, month] = period.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = parseInt(month, 10) - 1;
    return monthNames[monthIndex] || period;
  };

  const toggleDimension = (dimensionKey: string) => {
    const newActive = new Set(activeDimensions);
    if (newActive.has(dimensionKey)) {
      // Don't allow deselecting all
      if (newActive.size > 1) {
        newActive.delete(dimensionKey);
      }
    } else {
      newActive.add(dimensionKey);
    }
    setActiveDimensions(newActive);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{formatPeriod(label)}</p>
          {payload.map((entry: any) => {
            const dim = dimensions.find(d => d.dimensionKey === entry.dataKey);
            return (
              <p key={entry.dataKey} style={{ ...styles.tooltipValue, color: entry.color }}>
                {dim?.dimensionName}: <strong>{Math.round(entry.value)}%</strong>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.sectionTitle}>Trend Overview</h3>
        <p style={styles.sectionSubtitle}>
          All dimensions over time (click legend to toggle)
        </p>
      </div>

      <div style={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            {/* Risk zone backgrounds */}
            <ReferenceArea y1={0} y2={25} fill="#FFEDEB" fillOpacity={0.5} />
            <ReferenceArea y1={25} y2={75} fill="#FFF4E5" fillOpacity={0.5} />
            <ReferenceArea y1={75} y2={100} fill="#DCFFF1" fillOpacity={0.5} />

            <XAxis
              dataKey="period"
              tickFormatter={formatPeriod}
              tick={{ fontSize: 11, fill: '#6B778C' }}
              axisLine={{ stroke: '#DFE1E6' }}
              tickLine={{ stroke: '#DFE1E6' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 33, 66, 100]}
              tick={{ fontSize: 11, fill: '#6B778C' }}
              axisLine={{ stroke: '#DFE1E6' }}
              tickLine={false}
              width={40}
              reversed={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              onClick={(e) => toggleDimension(e.dataKey as string)}
              wrapperStyle={{ paddingTop: '16px', cursor: 'pointer' }}
              formatter={(value, entry) => {
                const dim = dimensions.find(d => d.dimensionKey === value);
                const isActive = activeDimensions.has(value as string);
                return (
                  <span style={{
                    color: isActive ? '#172B4D' : '#97A0AF',
                    fontSize: '12px',
                    textDecoration: isActive ? 'none' : 'line-through',
                  }}>
                    {dim?.dimensionName || value}
                  </span>
                );
              }}
            />

            {dimensions.map((dim, index) => (
              <Line
                key={dim.dimensionKey}
                type="monotone"
                dataKey={dim.dimensionKey}
                name={dim.dimensionKey}
                stroke={DIMENSION_COLORS[index % DIMENSION_COLORS.length]}
                strokeWidth={activeDimensions.has(dim.dimensionKey) ? 2 : 0}
                dot={activeDimensions.has(dim.dimensionKey) ? { r: 3 } : false}
                activeDot={activeDimensions.has(dim.dimensionKey) ? { r: 5 } : false}
                opacity={activeDimensions.has(dim.dimensionKey) ? 1 : 0.2}
                style={{ cursor: 'pointer' }}
                onClick={() => onDimensionClick(dim.dimensionKey)}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Risk zone legend */}
      <div style={styles.zoneLegend}>
        <div style={styles.zoneItem}>
          <span style={{ ...styles.zoneBox, backgroundColor: '#FFEDEB' }} />
          <span style={styles.zoneLabel}>High Risk (0-25%)</span>
        </div>
        <div style={styles.zoneItem}>
          <span style={{ ...styles.zoneBox, backgroundColor: '#FFF4E5' }} />
          <span style={styles.zoneLabel}>Moderate Risk (26-75%)</span>
        </div>
        <div style={styles.zoneItem}>
          <span style={{ ...styles.zoneBox, backgroundColor: '#DCFFF1' }} />
          <span style={styles.zoneLabel}>Low Risk (76-100%)</span>
        </div>
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    padding: '20px',
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
    margin: '0 0 8px 0',
    fontWeight: 600,
    color: '#172B4D',
    fontSize: '13px',
  },
  tooltipValue: {
    margin: '4px 0',
    fontSize: '12px',
  },
  zoneLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  zoneItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  zoneBox: {
    width: '16px',
    height: '12px',
    borderRadius: '2px',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  zoneLabel: {
    fontSize: '11px',
    color: '#6B778C',
  },
};

export default TrendOverview;
