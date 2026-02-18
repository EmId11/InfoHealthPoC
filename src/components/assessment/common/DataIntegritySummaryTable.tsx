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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // Aggregate all indicators/passedChecks across categories by jiraFieldId
  const { fieldRows, crossFieldRow, issueTypeList, stats } = useMemo(() => {
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
        trendArrow: trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : 'stable',
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
      trendArrow: cfTrend === 'up' ? 'up' : cfTrend === 'down' ? 'down' : 'stable',
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

    // Collect all unique issue types across all data
    const allIssueTypes = new Set<string>();
    for (const r of rows) {
      for (const t of r.issueTypes) allIssueTypes.add(t);
    }
    if (crossRow) {
      for (const t of crossRow.issueTypes) allIssueTypes.add(t);
    }
    const issueTypeList = Array.from(allIssueTypes).sort();

    return {
      fieldRows: rows,
      crossFieldRow: crossRow,
      issueTypeList,
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

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Filtered view when issue type chips are selected
  const { filteredFieldRows, filteredCrossFieldRow, filteredStats } = useMemo(() => {
    const isAllFields = selectedTypes.size === 0;
    if (isAllFields) {
      return { filteredFieldRows: fieldRows, filteredCrossFieldRow: crossFieldRow, filteredStats: stats };
    }

    const issueFilters = new Set(selectedTypes);
    const crossFieldSelected = issueFilters.delete('__crossField__');
    const hasIssueFilters = issueFilters.size > 0;

    // Filter a row's checks to only those matching selected issue types
    const filterRowByIssueTypes = (row: FieldSummary): FieldSummary | null => {
      if (!hasIssueFilters) return row; // no issue type filter, pass through
      const filteredFailed = row.failedIndicators.filter(ind => ind.appliesTo?.some(t => issueFilters.has(t)));
      const filteredPassed = row.passedChecks.filter(pc => pc.appliesTo?.some(t => issueFilters.has(t)));
      const totalChecks = filteredFailed.length + filteredPassed.length;
      if (totalChecks === 0) return null;
      const failRate = filteredFailed.length / totalChecks;
      const severity = getSeverity(failRate);
      const trendDir = computeTrendDirection(filteredFailed);
      const syntheticData = buildSyntheticTrendData(filteredFailed);
      return {
        ...row,
        failedIndicators: filteredFailed,
        passedChecks: filteredPassed,
        failedCount: filteredFailed.length,
        passedCount: filteredPassed.length,
        totalChecks,
        failRate,
        severityLabel: severity.label,
        severityColor: severity.color,
        severityBg: severity.bg,
        trendDirection: trendDir,
        trendArrow: trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : 'stable',
        trendColor: trendDir === 'up' ? '#36B37E' : trendDir === 'down' ? '#DE350B' : '#6B778C',
        syntheticTrendData: syntheticData,
        syntheticTrend: trendDir === 'up' ? 'improving' : trendDir === 'down' ? 'declining' : 'stable',
      };
    };

    // Field rows: only shown when issue type filters are active
    const filtered = hasIssueFilters
      ? fieldRows.map(filterRowByIssueTypes).filter((r): r is FieldSummary => r !== null)
      : [];

    // Cross-field row: only shown when cross-field chip is selected
    let filteredCross: FieldSummary | null = null;
    if (crossFieldSelected && crossFieldRow) {
      filteredCross = filterRowByIssueTypes(crossFieldRow);
    }

    // Recompute banner stats
    const allRows = [...filtered, ...(filteredCross ? [filteredCross] : [])];
    const totalFields = filtered.length;
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
      filteredFieldRows: filtered,
      filteredCrossFieldRow: filteredCross,
      filteredStats: {
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
  }, [fieldRows, crossFieldRow, stats, selectedTypes]);

  const isAllFields = selectedTypes.size === 0;

  // ── Derived values for redesigned banner ──
  const allDisplayRows = [...filteredFieldRows, ...(filteredCrossFieldRow ? [filteredCrossFieldRow] : [])];
  const sevCounts = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
  for (const row of allDisplayRows) {
    if (row.severityLabel in sevCounts) sevCounts[row.severityLabel as keyof typeof sevCounts]++;
  }

  // Fields sorted worst-to-best for heatmap
  const sortedFields = [...allDisplayRows].sort((a, b) => b.failRate - a.failRate);
  const worstField = sortedFields.length > 0 ? sortedFields[0] : null;

  // Ring angle
  const passRate = filteredStats.totalChecks > 0 ? 1 - filteredStats.overallFailRate : 1;
  const passAngle = Math.round(passRate * 360);

  // Trend helpers (from dimension prop — stable across filters)
  const trendIcon = dimension.trend === 'improving' ? 'up' : dimension.trend === 'declining' ? 'down' : 'stable';
  const trendLabel = dimension.trend === 'improving' ? 'Improving' : dimension.trend === 'declining' ? 'Declining' : 'Stable';
  const trendColor = dimension.trend === 'improving' ? '#36B37E' : dimension.trend === 'declining' ? '#DE350B' : '#6B778C';
  const trendBg = dimension.trend === 'improving' ? '#E3FCEF' : dimension.trend === 'declining' ? '#FFEBE6' : '#F4F5F7';

  return (
    <div>
      {/* ── Issue Type Filter Chips ── */}
      {(issueTypeList.length >= 2 || crossFieldRow) && (
        <div style={filterStyles.container}>
          <button
            style={isAllFields ? filterStyles.chipActive : filterStyles.chip}
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
          {crossFieldRow && (
            <button
              style={selectedTypes.has('__crossField__') ? filterStyles.chipActive : filterStyles.chip}
              onClick={() => toggleType('__crossField__')}
            >
              Cross-Field
            </button>
          )}
        </div>
      )}

      {/* ── Summary Stats Banner ── */}
      <div style={bannerStyles.container}>
        {/* Left Column — Health Ring */}
        <div style={bannerStyles.ringColumn}>
          {/* Donut ring */}
          <div style={{
            ...bannerStyles.ringOuter,
            background: allDisplayRows.length > 0
              ? `conic-gradient(#36B37E 0deg ${passAngle}deg, #DE350B ${passAngle}deg 360deg)`
              : '#E4E6EB',
          }}>
            <div style={bannerStyles.ringInner}>
              <span style={bannerStyles.ringScore}>{Math.round(passRate * 100)}</span>
              <span style={bannerStyles.ringUnit}>% pass</span>
            </div>
          </div>

          {/* Severity badge */}
          <span style={{
            ...bannerStyles.sevBadge,
            backgroundColor: filteredStats.overallSevBg,
            color: filteredStats.overallSevColor,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: filteredStats.overallSevColor, flexShrink: 0,
            }} />
            {filteredStats.overallSevLabel}
          </span>

          {/* Trend badge */}
          <span style={{ ...bannerStyles.trendBadge, backgroundColor: trendBg, color: trendColor }}>
            {trendIcon === 'up' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
            {trendIcon === 'down' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
            {trendIcon === 'stable' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
            {' '}{trendLabel}
          </span>

          {/* Total checks */}
          <span style={{ fontSize: '11px', color: '#6B778C', marginTop: '2px' }}>
            {filteredStats.totalChecks} checks
          </span>
        </div>

        {/* Vertical divider */}
        <div style={bannerStyles.verticalDivider} />

        {/* Right Column — Details */}
        <div style={bannerStyles.detailsColumn}>
          {/* Top: Severity Distribution */}
          <div style={bannerStyles.sevSection}>
            <div style={bannerStyles.sectionLabel}>Severity Distribution</div>
            {/* Proportional bar */}
            <div style={bannerStyles.sevBar}>
              {sevCounts.Critical > 0 && (
                <div style={{ flex: sevCounts.Critical, backgroundColor: '#DE350B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts.Critical > 1 && <span style={bannerStyles.sevBarText}>{sevCounts.Critical}</span>}
                </div>
              )}
              {sevCounts['At Risk'] > 0 && (
                <div style={{ flex: sevCounts['At Risk'], backgroundColor: '#FF8B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts['At Risk'] > 1 && <span style={bannerStyles.sevBarText}>{sevCounts['At Risk']}</span>}
                </div>
              )}
              {sevCounts.Fair > 0 && (
                <div style={{ flex: sevCounts.Fair, backgroundColor: '#FFAB00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts.Fair > 1 && <span style={bannerStyles.sevBarText}>{sevCounts.Fair}</span>}
                </div>
              )}
              {sevCounts.Healthy > 0 && (
                <div style={{ flex: sevCounts.Healthy, backgroundColor: '#36B37E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts.Healthy > 1 && <span style={bannerStyles.sevBarText}>{sevCounts.Healthy}</span>}
                </div>
              )}
            </div>
            {/* Legend */}
            <div style={bannerStyles.sevLabels}>
              {sevCounts.Critical > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#DE350B' }} />
                  {sevCounts.Critical} Critical
                </span>
              )}
              {sevCounts['At Risk'] > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#FF8B00' }} />
                  {sevCounts['At Risk']} At Risk
                </span>
              )}
              {sevCounts.Fair > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#FFAB00' }} />
                  {sevCounts.Fair} Fair
                </span>
              )}
              {sevCounts.Healthy > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#36B37E' }} />
                  {sevCounts.Healthy} Healthy
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
                    key={f.fieldId}
                    title={`${f.fieldName} — ${f.severityLabel} (${Math.round(f.failRate * 100)}% fail)`}
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
                  Worst: {worstField.fieldName} ({Math.round(worstField.failRate * 100)}% fail rate)
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
                <span style={{ color: '#36B37E', fontWeight: 600, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>{filteredStats.improving}
                </span>
                <span style={{ color: '#6B778C', fontWeight: 600, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>{filteredStats.stable}
                </span>
                <span style={{ color: '#DE350B', fontWeight: 600, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>{filteredStats.declining}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Field Table ── */}
      {!isAllFields && filteredFieldRows.length === 0 && filteredCrossFieldRow === null ? (
        <div style={filterStyles.emptyState}>
          No field checks match the selected filters.
        </div>
      ) : (
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
            {filteredFieldRows.map((row) => (
              <FieldRow key={row.fieldId} row={row} onRowClick={setModalRow} />
            ))}

            {/* Cross-field separator */}
            {filteredCrossFieldRow && (
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
                <FieldRow row={filteredCrossFieldRow} onRowClick={setModalRow} />
              </>
            )}
          </tbody>
        </table>
      </div>
      )}

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
    minHeight: '180px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  // ── Left Column: Health Ring ──
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
  // ── Dividers ──
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
  // ── Right Column: Details ──
  detailsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '16px 20px',
    gap: '12px',
  },
  // Severity Distribution section
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
  // Bottom row
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

export default DataIntegritySummaryTable;
