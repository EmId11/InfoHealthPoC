import React, { useMemo, useState } from 'react';
import { DimensionResult, IndicatorResult, IndicatorDrillDownState, TrendDataPoint } from '../../../types/assessment';
import Sparkline from './Sparkline';

// ============================================================================
// Field name lookup
// ============================================================================

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

function getFieldName(indicatorId: string, indicatorName: string): string {
  if (SHORT_NAME_MAP[indicatorId]) return SHORT_NAME_MAP[indicatorId];
  const stripped = indicatorName.replace(/^What %.*?\?\s*/i, '').replace(/^How.*?\?\s*/i, '');
  if (stripped && stripped !== indicatorName) return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  return indicatorName;
}

// ============================================================================
// Severity helpers (same thresholds as Data Integrity)
// ============================================================================

function getSeverity(rate: number): { label: string; color: string; bg: string } {
  if (rate >= 0.80) return { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' };
  if (rate >= 0.50) return { label: 'At Risk', color: '#FF8B00', bg: '#FFF7E6' };
  if (rate >= 0.30) return { label: 'Fair', color: '#FFAB00', bg: '#FFFAE6' };
  return { label: 'Healthy', color: '#006644', bg: '#E3FCEF' };
}

// ============================================================================
// Internal row shape
// ============================================================================

interface FieldRow {
  indicator: IndicatorResult;
  fieldName: string;
  issueTypes: string[];
  incompleteRate: number;   // 0-1
  severityLabel: string;
  severityColor: string;
  severityBg: string;
  categoryIndex: number;
}

// ============================================================================
// Component
// ============================================================================

interface FieldCompletenessSummaryTableProps {
  dimension: DimensionResult;
  dimensionIndex: number;
  onFieldDrillDown?: (state: IndicatorDrillDownState) => void;
}

const FieldCompletenessSummaryTable: React.FC<FieldCompletenessSummaryTableProps> = ({
  dimension,
  dimensionIndex,
  onFieldDrillDown,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // Build field rows from all indicators across categories
  const { allRows, issueTypeList } = useMemo(() => {
    const rows: FieldRow[] = [];
    const issueTypes = new Set<string>();

    dimension.categories.forEach((category, catIdx) => {
      for (const indicator of category.indicators) {
        const incompleteRate = indicator.value / 100;
        const severity = getSeverity(incompleteRate);
        const types = indicator.appliesTo || [];
        types.forEach(t => issueTypes.add(t));

        rows.push({
          indicator,
          fieldName: getFieldName(indicator.id, indicator.name),
          issueTypes: types,
          incompleteRate,
          severityLabel: severity.label,
          severityColor: severity.color,
          severityBg: severity.bg,
          categoryIndex: catIdx,
        });
      }
    });

    // Sort worst-first
    rows.sort((a, b) => b.incompleteRate - a.incompleteRate);

    return { allRows: rows, issueTypeList: Array.from(issueTypes).sort() };
  }, [dimension]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Apply issue-type filtering
  const filteredRows = useMemo(() => {
    if (selectedTypes.size === 0) return allRows;
    return allRows.filter(row =>
      row.issueTypes.length === 0 || row.issueTypes.some(t => selectedTypes.has(t))
    );
  }, [allRows, selectedTypes]);

  // Compute stats from filtered rows
  const stats = useMemo(() => {
    const rows = filteredRows;
    if (rows.length === 0) {
      return {
        avgIncompleteRate: 0,
        completionRate: 1,
        sevCounts: { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 },
        improving: 0,
        stable: 0,
        declining: 0,
        totalFields: 0,
      };
    }

    const sum = rows.reduce((s, r) => s + r.incompleteRate, 0);
    const avgIncompleteRate = sum / rows.length;
    const completionRate = 1 - avgIncompleteRate;

    const sevCounts = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
    let improving = 0, stable = 0, declining = 0;

    for (const row of rows) {
      if (row.severityLabel in sevCounts) {
        sevCounts[row.severityLabel as keyof typeof sevCounts]++;
      }
      const ind = row.indicator;
      if (ind.trendData && ind.trendData.length >= 2) {
        const first = ind.trendData[0].value;
        const last = ind.trendData[ind.trendData.length - 1].value;
        if (last > first + 2) improving++;
        else if (last < first - 2) declining++;
        else stable++;
      } else {
        stable++;
      }
    }

    return {
      avgIncompleteRate,
      completionRate,
      sevCounts,
      improving,
      stable,
      declining,
      totalFields: rows.length,
    };
  }, [filteredRows]);

  // Sorted for heatmap (worst-first)
  const sortedFields = [...filteredRows].sort((a, b) => b.incompleteRate - a.incompleteRate);
  const worstField = sortedFields.length > 0 ? sortedFields[0] : null;

  // Ring
  const completionAngle = Math.round(stats.completionRate * 360);

  // Dimension-level trend
  const trendArrow = dimension.trend === 'improving' ? '↗' : dimension.trend === 'declining' ? '↘' : '→';
  const trendLabel = dimension.trend === 'improving' ? 'Improving' : dimension.trend === 'declining' ? 'Declining' : 'Stable';
  const trendColor = dimension.trend === 'improving' ? '#36B37E' : dimension.trend === 'declining' ? '#DE350B' : '#6B778C';
  const trendBg = dimension.trend === 'improving' ? '#E3FCEF' : dimension.trend === 'declining' ? '#FFEBE6' : '#F4F5F7';

  const isAll = selectedTypes.size === 0;

  const handleRowClick = (row: FieldRow) => {
    if (onFieldDrillDown) {
      onFieldDrillDown({
        indicatorId: row.indicator.id,
        dimensionIndex,
        categoryIndex: row.categoryIndex,
        indicatorName: row.indicator.name,
      });
    }
  };

  // Overall severity
  const overallSev = getSeverity(stats.avgIncompleteRate);

  return (
    <div>
      {/* ── Issue Type Filter Chips ── */}
      {issueTypeList.length >= 2 && (
        <div style={filterStyles.container}>
          <button
            style={isAll ? filterStyles.chipActive : filterStyles.chip}
            onClick={() => setSelectedTypes(new Set())}
          >
            All Fields
          </button>
          {issueTypeList.map(type => (
            <button
              key={type}
              style={selectedTypes.has(type) ? filterStyles.chipActive : filterStyles.chip}
              onClick={() => toggleType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* ── Summary Stats Banner ── */}
      <div style={bannerStyles.container}>
        {/* Left Column — Completion Ring */}
        <div style={bannerStyles.ringColumn}>
          <div style={{
            ...bannerStyles.ringOuter,
            background: filteredRows.length > 0
              ? `conic-gradient(#36B37E 0deg ${completionAngle}deg, #DE350B ${completionAngle}deg 360deg)`
              : '#E4E6EB',
          }}>
            <div style={bannerStyles.ringInner}>
              <span style={bannerStyles.ringScore}>{Math.round(stats.completionRate * 100)}</span>
              <span style={bannerStyles.ringUnit}>% complete</span>
            </div>
          </div>

          {/* Severity badge */}
          <span style={{
            ...bannerStyles.sevBadge,
            backgroundColor: overallSev.bg,
            color: overallSev.color,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: overallSev.color, flexShrink: 0,
            }} />
            {overallSev.label}
          </span>

          {/* Trend badge */}
          <span style={{ ...bannerStyles.trendBadge, backgroundColor: trendBg, color: trendColor }}>
            {trendArrow} {trendLabel}
          </span>

          {/* Field count */}
          <span style={{ fontSize: '11px', color: '#6B778C', marginTop: '2px' }}>
            {stats.totalFields} field{stats.totalFields !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Vertical divider */}
        <div style={bannerStyles.verticalDivider} />

        {/* Right Column — Details */}
        <div style={bannerStyles.detailsColumn}>
          {/* Top: Severity Distribution */}
          <div style={bannerStyles.sevSection}>
            <div style={bannerStyles.sectionLabel}>Severity Distribution</div>
            <div style={bannerStyles.sevBar}>
              {stats.sevCounts.Critical > 0 && (
                <div style={{ flex: stats.sevCounts.Critical, backgroundColor: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.sevCounts.Critical > 1 && <span style={bannerStyles.sevBarText}>{stats.sevCounts.Critical}</span>}
                </div>
              )}
              {stats.sevCounts['At Risk'] > 0 && (
                <div style={{ flex: stats.sevCounts['At Risk'], backgroundColor: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.sevCounts['At Risk'] > 1 && <span style={bannerStyles.sevBarText}>{stats.sevCounts['At Risk']}</span>}
                </div>
              )}
              {stats.sevCounts.Fair > 0 && (
                <div style={{ flex: stats.sevCounts.Fair, backgroundColor: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.sevCounts.Fair > 1 && <span style={bannerStyles.sevBarText}>{stats.sevCounts.Fair}</span>}
                </div>
              )}
              {stats.sevCounts.Healthy > 0 && (
                <div style={{ flex: stats.sevCounts.Healthy, backgroundColor: '#36B37E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stats.sevCounts.Healthy > 1 && <span style={bannerStyles.sevBarText}>{stats.sevCounts.Healthy}</span>}
                </div>
              )}
            </div>
            {/* Legend */}
            <div style={bannerStyles.sevLabels}>
              {stats.sevCounts.Critical > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#DE350B' }} />
                  {stats.sevCounts.Critical} Critical
                </span>
              )}
              {stats.sevCounts['At Risk'] > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#FF8B00' }} />
                  {stats.sevCounts['At Risk']} At Risk
                </span>
              )}
              {stats.sevCounts.Fair > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#FFAB00' }} />
                  {stats.sevCounts.Fair} Fair
                </span>
              )}
              {stats.sevCounts.Healthy > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#36B37E' }} />
                  {stats.sevCounts.Healthy} Healthy
                </span>
              )}
            </div>
          </div>

          {/* Horizontal divider */}
          <div style={bannerStyles.horizontalDivider} />

          {/* Bottom: Heatmap + Trend */}
          <div style={bannerStyles.bottomRow}>
            {/* Fields by Health heatmap */}
            <div style={bannerStyles.heatmapSection}>
              <div style={bannerStyles.sectionLabel}>Fields by Health</div>
              <div style={bannerStyles.heatmapGrid}>
                {sortedFields.map((f) => (
                  <div
                    key={f.indicator.id}
                    title={`${f.fieldName} — ${f.severityLabel} (${Math.round(f.incompleteRate * 100)}% incomplete)`}
                    style={{
                      width: '20px', height: '20px', borderRadius: '3px',
                      backgroundColor: f.severityColor === '#006644' ? '#36B37E' : f.severityColor,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              {worstField && worstField.severityLabel !== 'Healthy' && (
                <div style={bannerStyles.worstCallout}>
                  Worst: {worstField.fieldName} ({Math.round(worstField.incompleteRate * 100)}% incomplete)
                </div>
              )}
            </div>

            {/* Sub-divider */}
            <div style={bannerStyles.subDivider} />

            {/* Trend sparkline */}
            <div style={bannerStyles.trendSection}>
              <div style={bannerStyles.sectionLabel}>Trend</div>
              <Sparkline
                data={dimension.trendData}
                trend={dimension.trend}
                enhanced
                height={56}
                unit="%"
              />
              <div style={bannerStyles.trendTokenRow}>
                <span style={{ color: '#36B37E', fontWeight: 600, fontSize: '11px' }}>
                  ↗{stats.improving}
                </span>
                <span style={{ color: '#6B778C', fontWeight: 600, fontSize: '11px' }}>
                  →{stats.stable}
                </span>
                <span style={{ color: '#DE350B', fontWeight: 600, fontSize: '11px' }}>
                  ↘{stats.declining}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Field Table ── */}
      {!isAll && filteredRows.length === 0 ? (
        <div style={filterStyles.emptyState}>
          No fields match the selected filters.
        </div>
      ) : (
        <div style={tableStyles.container}>
          <table style={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ ...tableStyles.th, width: '18%' }}>Field</th>
                <th style={{ ...tableStyles.th, width: '14%' }}>Completeness</th>
                <th style={{ ...tableStyles.th, width: '18%' }}>Issue Types</th>
                <th style={{ ...tableStyles.th, width: '25%' }}>Missing Rate</th>
                <th style={{ ...tableStyles.th, width: '25%' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <FieldRowComponent key={row.indicator.id} row={row} onRowClick={handleRowClick} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Row component
// ============================================================================

const FieldRowComponent: React.FC<{
  row: FieldRow;
  onRowClick: (row: FieldRow) => void;
}> = ({ row, onRowClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const completeRate = 1 - row.incompleteRate;

  return (
    <tr
      onClick={() => onRowClick(row)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F4F5F7' : 'transparent',
        borderBottom: '1px solid #F4F5F7',
        transition: 'background-color 0.1s ease',
        cursor: 'pointer',
      }}
    >
      {/* Field name */}
      <td style={tableStyles.tdName}>{row.fieldName}</td>

      {/* Completeness: severity badge */}
      <td style={tableStyles.td}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: row.severityBg,
          color: row.severityColor,
          whiteSpace: 'nowrap' as const,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: row.severityColor,
            flexShrink: 0,
          }} />
          {row.severityLabel}
        </span>
      </td>

      {/* Issue Types */}
      <td style={tableStyles.td}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: '#8993A4', lineHeight: 1.4 }}>
          {row.issueTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' \u00B7 ')}
        </span>
      </td>

      {/* Missing Rate bar */}
      <td style={tableStyles.td}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
          <div style={tableStyles.pillBar}>
            {completeRate > 0 && (
              <div style={{
                flex: completeRate,
                backgroundColor: '#36B37E',
                borderRadius: row.incompleteRate > 0 ? '10px 0 0 10px' : '10px',
                minWidth: '2px',
              }} />
            )}
            {row.incompleteRate > 0 && (
              <div style={{
                flex: row.incompleteRate,
                backgroundColor: '#DE350B',
                borderRadius: completeRate > 0 ? '0 10px 10px 0' : '10px',
                minWidth: '2px',
              }} />
            )}
          </div>
          <span style={{ fontSize: '10px', color: '#8993A4' }}>
            {row.indicator.displayValue} incomplete
          </span>
        </div>
      </td>

      {/* History sparkline */}
      <td style={{ ...tableStyles.td, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {row.indicator.trendData && row.indicator.trendData.length >= 2 ? (
            <Sparkline
              data={row.indicator.trendData}
              trend={row.indicator.trend}
              width={200}
              height={24}
            />
          ) : (
            <span style={{ fontSize: '10px', color: '#97A0AF' }}>--</span>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// Banner styles (mirrors Data Integrity)
// ============================================================================

const bannerStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'stretch',
    margin: '16px 0 12px',
    minHeight: '180px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  ringColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 28px',
    minWidth: '180px',
    backgroundColor: '#FAFBFC',
    gap: '8px',
  },
  ringOuter: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: '92px',
    height: '92px',
    borderRadius: '50%',
    backgroundColor: '#FAFBFC',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringScore: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#172B4D',
    lineHeight: 1,
  },
  ringUnit: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '2px',
  },
  sevBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  verticalDivider: {
    width: '1px',
    backgroundColor: '#E4E6EB',
    flexShrink: 0,
  },
  horizontalDivider: {
    height: '1px',
    backgroundColor: '#F4F5F7',
    flexShrink: 0,
  },
  subDivider: {
    width: '1px',
    backgroundColor: '#F4F5F7',
    flexShrink: 0,
  },
  detailsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '16px 20px',
    gap: '12px',
  },
  sevSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  sectionLabel: {
    fontSize: '9px',
    fontWeight: 700,
    color: '#7A869A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  sevBar: {
    display: 'flex',
    width: '100%',
    height: '28px',
    borderRadius: '14px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  sevBarText: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  sevLabels: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  sevLabelItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#505F79',
  },
  sevDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  bottomRow: {
    display: 'flex',
    flex: 1,
    gap: '0px',
  },
  heatmapSection: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    paddingRight: '16px',
  },
  heatmapGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '3px',
  },
  worstCallout: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B778C',
    fontStyle: 'italic' as const,
  },
  trendSection: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    minWidth: '180px',
    paddingLeft: '16px',
  },
  trendTokenRow: {
    display: 'flex',
    gap: '12px',
  },
};

// ============================================================================
// Table styles
// ============================================================================

const tableStyles: Record<string, React.CSSProperties> = {
  container: {
    margin: '0',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    tableLayout: 'fixed' as const,
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '8px 12px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#7A869A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    borderBottom: '1px solid #E4E6EB',
    textAlign: 'left' as const,
    whiteSpace: 'nowrap' as const,
    backgroundColor: '#FAFBFC',
  },
  td: {
    padding: '8px 12px',
    fontSize: '13px',
    color: '#172B4D',
    verticalAlign: 'middle' as const,
  },
  tdName: {
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    verticalAlign: 'middle' as const,
  },
  pillBar: {
    display: 'flex',
    width: '100%',
    height: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
};

// ============================================================================
// Filter chip styles
// ============================================================================

const filterStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    margin: '16px 0 0',
  },
  chip: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
    color: '#505F79',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    lineHeight: 1.4,
  },
  chipActive: {
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #0052CC',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    lineHeight: 1.4,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    fontSize: '14px',
    color: '#6B778C',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
  },
};

export default FieldCompletenessSummaryTable;
