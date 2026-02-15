import React, { useState } from 'react';
import { IndicatorCategory, IndicatorResult } from '../../../types/assessment';
import Sparkline from './Sparkline';

interface FieldCompletenessChartProps {
  category: IndicatorCategory;
  onIndicatorClick: (indicator: IndicatorResult) => void;
  onIndicatorDrillDown?: (indicator: IndicatorResult) => void;
}

// Short name mapping (indicator ID -> display label)
const SHORT_NAME_MAP: Record<string, string> = {
  acceptanceCriteria: 'Acceptance Criteria',
  linksToIssues: 'Related Issues',
  parentEpic: 'Parent Epic',
  estimates: 'Estimates',
  assignee: 'Assignee',
  dueDate: 'Due Date',
  subTasks: 'Sub-task Breakdown',
  prioritySet: 'Priority',
};

function getShortName(indicator: IndicatorResult): string {
  if (SHORT_NAME_MAP[indicator.id]) {
    return SHORT_NAME_MAP[indicator.id];
  }
  // Fallback: strip "What % of..." prefix and title-case
  const name = indicator.name;
  const stripped = name.replace(/^What %.*?\?\s*/i, '').replace(/^How.*?\?\s*/i, '');
  if (stripped && stripped !== name) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return name;
}

function getBarColor(value: number): string {
  if (value >= 80) return '#DE350B'; // red - critical
  if (value >= 50) return '#FF8B00'; // orange - at risk
  if (value >= 30) return '#FFAB00'; // amber - fair
  return '#36B37E';                  // green - healthy
}

const FieldCompletenessChart: React.FC<FieldCompletenessChartProps> = ({
  category,
  onIndicatorClick,
  onIndicatorDrillDown,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Sort indicators by value descending (worst first)
  const sorted = [...category.indicators].sort((a, b) => b.value - a.value);

  return (
    <div style={chartStyles.container}>
      {sorted.map((indicator, idx) => {
        const shortName = getShortName(indicator);
        const barColor = getBarColor(indicator.value);
        const isHovered = hoveredRowId === indicator.id;
        const isLast = idx === sorted.length - 1;

        // Compute trend dot color
        let trendColor = '#97A0AF';
        if (indicator.trendData && indicator.trendData.length >= 2) {
          const first = indicator.trendData[0].value;
          const last = indicator.trendData[indicator.trendData.length - 1].value;
          if (last > first + 2) trendColor = '#36B37E';
          else if (last < first - 2) trendColor = '#DE350B';
        }

        return (
          <div
            key={indicator.id}
            style={{
              ...chartStyles.row,
              backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
              borderBottom: isLast ? 'none' : '1px solid #F4F5F7',
              cursor: onIndicatorDrillDown ? 'pointer' : 'default',
            }}
            onClick={onIndicatorDrillDown ? () => onIndicatorDrillDown(indicator) : undefined}
            onMouseEnter={() => setHoveredRowId(indicator.id)}
            onMouseLeave={() => setHoveredRowId(null)}
          >
            {/* Left: field name + issue type chips */}
            <div style={chartStyles.labelCol}>
              <span style={chartStyles.fieldName}>{shortName}</span>
              {indicator.appliesTo && indicator.appliesTo.length > 0 && (
                <div style={chartStyles.chipRow}>
                  {indicator.appliesTo.map((type, i) => (
                    <React.Fragment key={type}>
                      {i > 0 && <span style={chartStyles.chipSep}>&middot;</span>}
                      <span style={chartStyles.chip}>{type}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Center: horizontal bar */}
            <div style={chartStyles.barCol}>
              <div style={chartStyles.barTrack}>
                <div
                  style={{
                    width: `${Math.min(indicator.value, 100)}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Right: percentage + sparkline + trend dot */}
            <div style={chartStyles.valueCol}>
              <span style={{ ...chartStyles.pctValue, color: barColor }}>
                {indicator.displayValue}
              </span>
              {indicator.trendData && indicator.trendData.length >= 2 && (
                <div
                  style={chartStyles.sparklineWrap}
                  onClick={(e) => { e.stopPropagation(); onIndicatorClick(indicator); }}
                >
                  <Sparkline data={indicator.trendData} trend={indicator.trend} width={56} height={20} />
                  <span style={{
                    ...chartStyles.trendDot,
                    backgroundColor: trendColor,
                  }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const chartStyles: Record<string, React.CSSProperties> = {
  container: {
    margin: '16px 20px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
    padding: '4px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 20px',
    transition: 'background-color 0.1s ease',
  },
  labelCol: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  fieldName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.3,
  },
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    flexWrap: 'wrap' as const,
  },
  chip: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#8993A4',
  },
  chipSep: {
    fontSize: '10px',
    color: '#C1C7D0',
    userSelect: 'none' as const,
  },
  barCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  valueCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    width: '140px',
    justifyContent: 'flex-end',
  },
  pctValue: {
    fontSize: '14px',
    fontWeight: 700,
    minWidth: '36px',
    textAlign: 'right' as const,
  },
  sparklineWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    opacity: 0.85,
    flexShrink: 0,
  },
  trendDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

export default FieldCompletenessChart;
