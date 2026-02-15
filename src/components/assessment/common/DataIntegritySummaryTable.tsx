import React, { useMemo, useState } from 'react';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import { DimensionResult, IndicatorResult, PassedCheck, TrendDataPoint, TrendDirection } from '../../../types/assessment';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE } from '../../../constants/presets';
import Sparkline from './Sparkline';

// ============================================================================
// Field name + description lookups
// ============================================================================

const FIELD_NAME_MAP = new Map(
  MOCK_JIRA_FIELDS_BY_ISSUE_TYPE.map(f => [f.id, f.name])
);

function getFieldDisplayName(fieldId: string): string {
  return FIELD_NAME_MAP.get(fieldId) || fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
}

// ============================================================================
// Severity helpers
// ============================================================================

function getSeverity(failRate: number): { label: string; color: string; bg: string } {
  if (failRate >= 0.80) return { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' };
  if (failRate >= 0.50) return { label: 'At Risk', color: '#FF8B00', bg: '#FFF7E6' };
  if (failRate >= 0.30) return { label: 'Fair', color: '#FFAB00', bg: '#FFFAE6' };
  return { label: 'Healthy', color: '#006644', bg: '#E3FCEF' };
}

// ============================================================================
// Trend helpers
// ============================================================================

function computeTrendDirection(indicators: { trendData?: TrendDataPoint[] }[]): 'up' | 'down' | 'stable' {
  let up = 0, down = 0;
  for (const ind of indicators) {
    if (ind.trendData && ind.trendData.length >= 2) {
      const first = ind.trendData[0].value;
      const last = ind.trendData[ind.trendData.length - 1].value;
      if (last > first + 2) up++;
      else if (last < first - 2) down++;
    }
  }
  if (up > down) return 'up';
  if (down > up) return 'down';
  return 'stable';
}

function buildSyntheticTrendData(indicators: { trendData?: TrendDataPoint[] }[]): TrendDataPoint[] {
  const withData = indicators.filter(ind => ind.trendData && ind.trendData.length >= 2);
  if (withData.length === 0) return [];
  const template = withData[0].trendData!;
  return template.map((dp, periodIdx) => {
    let sum = 0, count = 0;
    for (const ind of withData) {
      if (ind.trendData && ind.trendData[periodIdx]) {
        sum += ind.trendData[periodIdx].value;
        count++;
      }
    }
    return { period: dp.period, value: count > 0 ? sum / count : 0 };
  });
}

// ============================================================================
// Field summary data shape
// ============================================================================

interface FieldSummary {
  fieldId: string;
  fieldName: string;
  issueTypes: string[];
  failedCount: number;
  passedCount: number;
  totalChecks: number;
  failRate: number;
  severityLabel: string;
  severityColor: string;
  severityBg: string;
  trendDirection: 'up' | 'down' | 'stable';
  trendArrow: string;
  trendColor: string;
  syntheticTrendData: TrendDataPoint[];
  syntheticTrend: TrendDirection;
  isCrossField: boolean;
  failedIndicators: IndicatorResult[];
  passedChecks: PassedCheck[];
}

// ============================================================================
// Component
// ============================================================================

interface DataIntegritySummaryTableProps {
  dimension: DimensionResult;
}

const DataIntegritySummaryTable: React.FC<DataIntegritySummaryTableProps> = ({ dimension }) => {
  const [modalRow, setModalRow] = useState<FieldSummary | null>(null);

  // Aggregate all indicators/passedChecks across categories by jiraFieldId
  const { fieldRows, crossFieldRow, stats } = useMemo(() => {
    const fieldMap = new Map<string, {
      indicators: IndicatorResult[];
      failedCount: number;
      passedCount: number;
      passedChecks: PassedCheck[];
      issueTypeSet: Set<string>;
    }>();

    // Collect cross-field indicators separately (jiraFieldId is undefined)
    const crossFieldIndicators: IndicatorResult[] = [];
    const crossFieldPassedChecks: PassedCheck[] = [];
    let crossFieldFailed = 0;
    let crossFieldPassed = 0;
    const crossFieldIssueTypes = new Set<string>();

    for (const category of dimension.categories) {
      const isCrossField = category.id === 'crossField';

      if (isCrossField) {
        for (const ind of category.indicators) {
          crossFieldIndicators.push(ind);
          crossFieldFailed++;
          if (ind.appliesTo) ind.appliesTo.forEach(t => crossFieldIssueTypes.add(t));
        }
        if (category.passedChecks) {
          for (const pc of category.passedChecks) {
            crossFieldPassedChecks.push(pc);
            crossFieldPassed++;
            if (pc.appliesTo) pc.appliesTo.forEach(t => crossFieldIssueTypes.add(t));
          }
        }
        continue;
      }

      // Field-based indicators
      for (const ind of category.indicators) {
        const fid = ind.jiraFieldId || '__unknown__';
        if (!fieldMap.has(fid)) {
          fieldMap.set(fid, { indicators: [], failedCount: 0, passedCount: 0, passedChecks: [], issueTypeSet: new Set() });
        }
        const entry = fieldMap.get(fid)!;
        entry.indicators.push(ind);
        entry.failedCount++;
        if (ind.appliesTo) ind.appliesTo.forEach(t => entry.issueTypeSet.add(t));
      }

      if (category.passedChecks) {
        for (const pc of category.passedChecks) {
          const fid = pc.jiraFieldId || '__unknown__';
          if (!fieldMap.has(fid)) {
            fieldMap.set(fid, { indicators: [], failedCount: 0, passedCount: 0, passedChecks: [], issueTypeSet: new Set() });
          }
          const entry = fieldMap.get(fid)!;
          entry.passedChecks.push(pc);
          entry.passedCount++;
          if (pc.appliesTo) pc.appliesTo.forEach(t => entry.issueTypeSet.add(t));
        }
      }
    }

    // Build field summaries
    const rows: FieldSummary[] = [];
    fieldMap.forEach((data, fid) => {
      const totalChecks = data.failedCount + data.passedCount;
      const failRate = totalChecks > 0 ? data.failedCount / totalChecks : 0;
      const severity = getSeverity(failRate);
      const trendDir = computeTrendDirection(data.indicators);
      const syntheticData = buildSyntheticTrendData(data.indicators);

      rows.push({
        fieldId: fid,
        fieldName: getFieldDisplayName(fid),
        issueTypes: Array.from(data.issueTypeSet),
        failedCount: data.failedCount,
        passedCount: data.passedCount,
        totalChecks,
        failRate,
        severityLabel: severity.label,
        severityColor: severity.color,
        severityBg: severity.bg,
        trendDirection: trendDir,
        trendArrow: trendDir === 'up' ? '\u2197' : trendDir === 'down' ? '\u2198' : '\u2014',
        trendColor: trendDir === 'up' ? '#36B37E' : trendDir === 'down' ? '#DE350B' : '#6B778C',
        syntheticTrendData: syntheticData,
        syntheticTrend: trendDir === 'up' ? 'improving' : trendDir === 'down' ? 'declining' : 'stable',
        isCrossField: false,
        failedIndicators: data.indicators,
        passedChecks: data.passedChecks,
      });
    });

    // Sort: most-tested fields first
    rows.sort((a, b) => b.totalChecks - a.totalChecks);

    // Cross-field summary
    const cfTotal = crossFieldFailed + crossFieldPassed;
    const cfFailRate = cfTotal > 0 ? crossFieldFailed / cfTotal : 0;
    const cfSev = getSeverity(cfFailRate);
    const cfTrend = computeTrendDirection(crossFieldIndicators);
    const cfSynthData = buildSyntheticTrendData(crossFieldIndicators);

    const crossRow: FieldSummary | null = (crossFieldFailed + crossFieldPassed) > 0 ? {
      fieldId: '__crossField__',
      fieldName: 'Cross-Field',
      issueTypes: Array.from(crossFieldIssueTypes),
      failedCount: crossFieldFailed,
      passedCount: crossFieldPassed,
      totalChecks: cfTotal,
      failRate: cfFailRate,
      severityLabel: cfSev.label,
      severityColor: cfSev.color,
      severityBg: cfSev.bg,
      trendDirection: cfTrend,
      trendArrow: cfTrend === 'up' ? '\u2197' : cfTrend === 'down' ? '\u2198' : '\u2014',
      trendColor: cfTrend === 'up' ? '#36B37E' : cfTrend === 'down' ? '#DE350B' : '#6B778C',
      syntheticTrendData: cfSynthData,
      syntheticTrend: cfTrend === 'up' ? 'improving' : cfTrend === 'down' ? 'declining' : 'stable',
      isCrossField: true,
      failedIndicators: crossFieldIndicators,
      passedChecks: crossFieldPassedChecks,
    } : null;

    // Aggregate stats for banner
    const allRows = [...rows, ...(crossRow ? [crossRow] : [])];
    const totalFields = rows.length;
    const totalFailed = allRows.reduce((s, r) => s + r.failedCount, 0);
    const totalPassed = allRows.reduce((s, r) => s + r.passedCount, 0);
    const totalAll = totalFailed + totalPassed;
    const overallFailRate = totalAll > 0 ? totalFailed / totalAll : 0;
    const overallSev = getSeverity(overallFailRate);

    let improving = 0, declining = 0, stable = 0;
    for (const r of allRows) {
      if (r.trendDirection === 'up') improving++;
      else if (r.trendDirection === 'down') declining++;
      else stable++;
    }

    return {
      fieldRows: rows,
      crossFieldRow: crossRow,
      stats: {
        totalFields,
        totalFailed,
        totalPassed,
        totalChecks: totalAll,
        overallFailRate,
        overallSevLabel: overallSev.label,
        overallSevColor: overallSev.color,
        overallSevBg: overallSev.bg,
        improving,
        declining,
        stable,
      },
    };
  }, [dimension]);

  return (
    <div>
      {/* ── Summary Stats Banner ── */}
      <div style={bannerStyles.container}>
        {/* Panel 1: Field Health */}
        <div style={bannerStyles.panel}>
          <div style={bannerStyles.panelLabel}>Field Health</div>
          <div style={bannerStyles.panelMain}>
            <span style={bannerStyles.bigNumber}>{stats.totalFields}</span>
            <span style={bannerStyles.bigUnit}>fields</span>
          </div>
          <div style={bannerStyles.miniBar}>
            {stats.totalPassed > 0 && (
              <div style={{
                flex: stats.totalPassed,
                height: '100%',
                backgroundColor: '#36B37E',
                borderRadius: stats.totalFailed > 0 ? '3px 0 0 3px' : '3px',
              }} />
            )}
            {stats.totalFailed > 0 && (
              <div style={{
                flex: stats.totalFailed,
                height: '100%',
                backgroundColor: '#DE350B',
                borderRadius: stats.totalPassed > 0 ? '0 3px 3px 0' : '3px',
              }} />
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#6B778C' }}>
            <span style={{ color: '#36B37E', fontWeight: 600 }}>{stats.totalPassed} passed</span>
            {' \u00B7 '}
            <span style={{ color: '#DE350B', fontWeight: 600 }}>{stats.totalFailed} failed</span>
          </span>
        </div>

        <div style={bannerStyles.divider} />

        {/* Panel 2: Trend Movement */}
        <div style={bannerStyles.panel}>
          <div style={bannerStyles.panelLabel}>Trend Movement</div>
          <div style={bannerStyles.panelMain}>
            <span style={bannerStyles.bigNumber}>
              {Math.max(stats.improving, stats.declining, stats.stable)}
            </span>
            <span style={bannerStyles.bigUnit}>
              {stats.stable >= stats.improving && stats.stable >= stats.declining
                ? 'stable'
                : stats.improving >= stats.declining
                  ? 'improving'
                  : 'declining'}
            </span>
          </div>
          <div style={bannerStyles.trendRow}>
            {stats.improving > 0 && (
              <span style={{ ...bannerStyles.trendToken, color: '#006644' }}>
                ↗ {stats.improving} improved
              </span>
            )}
            {stats.declining > 0 && (
              <span style={{ ...bannerStyles.trendToken, color: '#DE350B' }}>
                ↘ {stats.declining} declined
              </span>
            )}
            {stats.stable > 0 && (
              <span style={{ ...bannerStyles.trendToken, color: '#6B778C' }}>
                → {stats.stable} stable
              </span>
            )}
          </div>
        </div>

        <div style={bannerStyles.divider} />

        {/* Panel 3: Checks */}
        <div style={bannerStyles.panel}>
          <div style={bannerStyles.panelLabel}>Checks</div>
          <div style={bannerStyles.panelMain}>
            <span style={bannerStyles.bigNumber}>{stats.totalChecks}</span>
            <span style={bannerStyles.bigUnit}>total</span>
          </div>
          <div style={bannerStyles.miniBar}>
            {stats.totalPassed > 0 && (
              <div style={{
                flex: stats.totalPassed,
                height: '100%',
                backgroundColor: '#36B37E',
                borderRadius: stats.totalFailed > 0 ? '3px 0 0 3px' : '3px',
              }} />
            )}
            {stats.totalFailed > 0 && (
              <div style={{
                flex: stats.totalFailed,
                height: '100%',
                backgroundColor: '#DE350B',
                borderRadius: stats.totalPassed > 0 ? '0 3px 3px 0' : '3px',
              }} />
            )}
          </div>
          <span style={{ fontSize: '11px', color: '#36B37E', fontWeight: 600 }}>
            {stats.totalPassed} passed ({stats.totalChecks > 0 ? Math.round((1 - stats.overallFailRate) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* ── Field Table ── */}
      <div style={tableStyles.container}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ ...tableStyles.th, width: '15%' }}>Field</th>
              <th style={{ ...tableStyles.th, width: '15%' }}>Field Reliability</th>
              <th style={{ ...tableStyles.th, width: '20%' }}>Issue Types</th>
              <th style={{ ...tableStyles.th, width: '25%' }}>Pass / Fail</th>
              <th style={{ ...tableStyles.th, width: '25%' }}>History</th>
            </tr>
          </thead>
          <tbody>
            {fieldRows.map((row) => (
              <FieldRow key={row.fieldId} row={row} onRowClick={setModalRow} />
            ))}

            {/* Cross-field separator */}
            {crossFieldRow && (
              <>
                <tr>
                  <td colSpan={5} style={tableStyles.separatorRow}>
                    <div style={tableStyles.separatorLine}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <rect x="1" y="3" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                        <rect x="5" y="5" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                      </svg>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#7A869A', letterSpacing: '0.6px', textTransform: 'uppercase' as const }}>
                        Cross-Field Patterns
                      </span>
                    </div>
                  </td>
                </tr>
                <FieldRow row={crossFieldRow} onRowClick={setModalRow} />
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Field Detail Modal ── */}
      {modalRow && (
        <div style={modalStyles.overlay} onClick={() => setModalRow(null)}>
          <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={modalStyles.header}>
              <div>
                <h3 style={modalStyles.title}>{modalRow.fieldName}</h3>
                <span style={{ fontSize: '12px', color: '#6B778C' }}>
                  {modalRow.issueTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' \u00B7 ')}
                </span>
              </div>
              <button style={modalStyles.close} onClick={() => setModalRow(null)}>
                <CrossIcon label="Close" size="small" primaryColor="#6B778C" />
              </button>
            </div>

            {/* Summary bar */}
            <div style={modalStyles.summaryBar}>
              <span style={modalStyles.summaryBadge}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: modalRow.severityColor,
                  flexShrink: 0,
                }} />
                {modalRow.severityLabel}
              </span>
              {modalRow.failedCount > 0 && (
                <span style={{ ...modalStyles.summaryCount, color: '#DE350B' }}>
                  <span style={{ fontSize: '14px' }}>✕</span> {modalRow.failedCount} failed
                </span>
              )}
              {modalRow.failedCount > 0 && modalRow.passedCount > 0 && (
                <span style={{ color: '#DFE1E6', fontSize: '12px' }}>&middot;</span>
              )}
              {modalRow.passedCount > 0 && (
                <span style={{ ...modalStyles.summaryCount, color: '#36B37E' }}>
                  <span style={{ fontSize: '14px' }}>✓</span> {modalRow.passedCount} passed
                </span>
              )}
            </div>

            {/* Check list */}
            <div style={modalStyles.body}>
              <div style={modalStyles.checkList}>
                {/* Failed indicators */}
                {modalRow.failedIndicators.map((ind) => (
                  <div key={ind.id} style={modalStyles.row}>
                    <span style={{ color: '#DE350B', fontSize: '15px', flexShrink: 0, width: '16px', textAlign: 'center' as const }}>✕</span>
                    <span style={modalStyles.rowName}>{ind.name}</span>
                  </div>
                ))}
                {/* Passed checks */}
                {modalRow.passedChecks.map((pc) => (
                  <div key={pc.id} style={modalStyles.passedRow}>
                    <span style={{ color: '#36B37E', fontSize: '15px', flexShrink: 0, width: '16px', textAlign: 'center' as const }}>✓</span>
                    <span style={modalStyles.passedName}>{pc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Row component
// ============================================================================

const FieldRow: React.FC<{
  row: FieldSummary;
  onRowClick: (row: FieldSummary) => void;
}> = ({ row, onRowClick }) => {
  const [hovered, setHovered] = React.useState(false);

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

      {/* Field Reliability: severity badge */}
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

      {/* Pass / Fail pill */}
      <td style={tableStyles.td}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
          <div style={tableStyles.pillBar}>
            {row.passedCount > 0 && (
              <div style={{
                flex: row.passedCount,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#36B37E',
                borderRadius: row.failedCount > 0 ? '10px 0 0 10px' : '10px',
                minWidth: '24px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{row.passedCount}</span>
              </div>
            )}
            {row.failedCount > 0 && (
              <div style={{
                flex: row.failedCount,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#DE350B',
                borderRadius: row.passedCount > 0 ? '0 10px 10px 0' : '10px',
                minWidth: '24px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{row.failedCount}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: '10px', color: '#8993A4' }}>
            {row.totalChecks} check{row.totalChecks !== 1 ? 's' : ''}
          </span>
        </div>
      </td>

      {/* History sparkline */}
      <td style={{ ...tableStyles.td, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {row.syntheticTrendData.length >= 2 ? (
            <Sparkline
              data={row.syntheticTrendData}
              trend={row.syntheticTrend}
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
// Banner styles
// ============================================================================

const bannerStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'stretch',
    margin: '16px 0 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  panel: {
    flex: 1,
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  panelLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#7A869A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  panelMain: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  bigNumber: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  bigUnit: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  miniBar: {
    display: 'flex',
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  divider: {
    width: '1px',
    backgroundColor: '#E4E6EB',
    flexShrink: 0,
  },
  trendRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    marginTop: '4px',
  },
  trendToken: {
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
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
  separatorRow: {
    padding: '0',
    borderBottom: 'none',
  },
  separatorLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px 4px',
    borderTop: '2px solid #DFE1E6',
  },
};

// ============================================================================
// Modal styles
// ============================================================================

const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
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
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
    maxWidth: '680px',
    width: '90%',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E4E6EB',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  close: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #F4F5F7',
  },
  summaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: '#F4F5F7',
    color: '#505F79',
  },
  summaryCount: {
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  body: {
    padding: '0',
    maxHeight: '60vh',
    overflowY: 'auto' as const,
  },
  checkList: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 24px',
    transition: 'background-color 0.1s ease',
    minHeight: '28px',
  },
  rowName: {
    flex: 1,
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
  passedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 24px',
    minHeight: '28px',
  },
  passedName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#8993A4',
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
  },
};

export default DataIntegritySummaryTable;
