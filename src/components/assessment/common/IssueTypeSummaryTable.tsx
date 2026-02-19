import React, { useMemo, useState } from 'react';
import { DimensionResult, IndicatorResult, PassedCheck, TrendDataPoint, TrendDirection } from '../../../types/assessment';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE } from '../../../constants/presets';
import Sparkline from './Sparkline';
import TrendHistoryModal from './TrendHistoryModal';

// ============================================================================
// Constants
// ============================================================================

const ISSUE_TYPES = [
  'Story', 'Bug', 'Task', 'Epic', 'Risk',
  'Assumption', 'Feature', 'Spike', 'Dependency', 'Impediment', 'Initiative',
];

// Timeliness: which indicator field IDs apply to each issue type
const TIMELINESS_INDICATOR_MAP: Record<string, string[]> = {
  Story:      ['acceptanceCriteria', 'linksToIssues', 'parentEpic', 'estimates', 'assignee', 'dueDate', 'subTasks', 'prioritySet'],
  Bug:        ['linksToIssues', 'assignee', 'dueDate', 'prioritySet'],
  Task:       ['assignee', 'dueDate', 'estimates', 'prioritySet'],
  Epic:       ['acceptanceCriteria', 'dueDate', 'assignee', 'prioritySet'],
  Risk:       ['assignee', 'dueDate', 'prioritySet'],
  Assumption: ['assignee', 'dueDate', 'prioritySet'],
  Feature:    ['acceptanceCriteria', 'linksToIssues', 'estimates', 'assignee', 'prioritySet'],
  Spike:      ['estimates', 'assignee', 'dueDate', 'prioritySet'],
  Dependency: ['linksToIssues', 'assignee', 'dueDate', 'prioritySet'],
  Impediment: ['assignee', 'dueDate', 'prioritySet'],
  Initiative: ['acceptanceCriteria', 'linksToIssues', 'dueDate', 'assignee', 'prioritySet'],
};

// ============================================================================
// Field name lookup
// ============================================================================

const FIELD_NAME_MAP = new Map(
  MOCK_JIRA_FIELDS_BY_ISSUE_TYPE.map(f => [f.id, f.name])
);

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

function getFieldDisplayName(fieldId: string): string {
  if (SHORT_NAME_MAP[fieldId]) return SHORT_NAME_MAP[fieldId];
  return FIELD_NAME_MAP.get(fieldId) || fieldId.charAt(0).toUpperCase() + fieldId.slice(1);
}

// ============================================================================
// Severity helpers
// ============================================================================

function getSeverityFromScore(score: number): { label: string; color: string; bg: string } {
  if (score >= 70) return { label: 'Healthy', color: '#00875A', bg: '#E3FCEF' };
  if (score >= 50) return { label: 'Fair', color: '#2684FF', bg: '#DEEBFF' };
  if (score >= 30) return { label: 'At Risk', color: '#FF8B00', bg: '#FFF7ED' };
  return { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' };
}

// ============================================================================
// Trend helpers — pre-built distinct shapes per issue type
// ============================================================================

const PERIODS = ['2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11'];

function makeTrend(values: number[]): TrendDataPoint[] {
  return values.map((v, i) => ({ period: PERIODS[i], value: v }));
}

// Timeliness: values represent "% missing" — higher = worse
// Each issue type gets a visually distinct shape
const TIMELINESS_TRENDS: Record<string, { data: TrendDataPoint[]; dir: 'up' | 'down' | 'stable' }> = {
  // Story: declining — getting worse steadily
  Story:      { dir: 'down', data: makeTrend([38, 40, 43, 45, 47, 49, 50, 51, 52]) },
  // Bug: improving — team fixed linking & assignment gaps
  Bug:        { dir: 'up',   data: makeTrend([55, 52, 48, 44, 42, 40, 38, 37, 36]) },
  // Task: V-shape — got worse mid-year, then recovered
  Task:       { dir: 'stable', data: makeTrend([40, 44, 50, 54, 52, 48, 44, 42, 41]) },
  // Epic: plateau then sharp drop
  Epic:       { dir: 'down', data: makeTrend([35, 36, 36, 37, 38, 42, 46, 48, 50]) },
  // Risk: improving steadily
  Risk:       { dir: 'up',   data: makeTrend([52, 48, 45, 42, 40, 38, 36, 35, 34]) },
  // Assumption: stable flat
  Assumption: { dir: 'stable', data: makeTrend([34, 35, 33, 35, 34, 36, 35, 34, 35]) },
  // Feature: sharp improvement
  Feature:    { dir: 'up',   data: makeTrend([62, 58, 52, 48, 44, 42, 40, 39, 38]) },
  // Spike: declining — was good, now worse
  Spike:      { dir: 'down', data: makeTrend([30, 32, 35, 38, 40, 42, 44, 45, 46]) },
  // Dependency: oscillating / noisy
  Dependency: { dir: 'stable', data: makeTrend([40, 36, 42, 38, 44, 40, 38, 42, 40]) },
  // Impediment: improving then plateau
  Impediment: { dir: 'up',   data: makeTrend([48, 44, 40, 37, 35, 35, 34, 35, 34]) },
  // Initiative: worsening sharply
  Initiative: { dir: 'down', data: makeTrend([32, 35, 38, 42, 45, 48, 50, 52, 54]) },
};

// Trustworthiness: values represent fail rate (0-1 scale) → displayed as sparkline
// Each category gets a distinct pattern
const TRUSTWORTHINESS_TRENDS: Record<string, { data: TrendDataPoint[]; dir: 'up' | 'down' | 'stable' }> = {
  // Story: declining — more failures appearing
  story:       { dir: 'down', data: makeTrend([0.38, 0.40, 0.42, 0.45, 0.48, 0.50, 0.52, 0.53, 0.53]) },
  // Bug: improving steadily
  bug:         { dir: 'up',   data: makeTrend([0.62, 0.58, 0.54, 0.50, 0.47, 0.45, 0.43, 0.42, 0.44]) },
  // Task: sharp improvement then plateau
  task:        { dir: 'up',   data: makeTrend([0.48, 0.44, 0.38, 0.34, 0.31, 0.30, 0.30, 0.29, 0.30]) },
  // Epic: V-shape — got worse then recovered
  epic:        { dir: 'stable', data: makeTrend([0.35, 0.38, 0.42, 0.48, 0.46, 0.42, 0.40, 0.39, 0.40]) },
  // Risk: worsening dramatically
  risk:        { dir: 'down', data: makeTrend([0.55, 0.58, 0.62, 0.65, 0.68, 0.72, 0.74, 0.75, 0.75]) },
  // Assumption: stable flat (bad)
  assumption:  { dir: 'stable', data: makeTrend([0.82, 0.83, 0.81, 0.83, 0.82, 0.84, 0.83, 0.82, 0.83]) },
  // Feature: improving then slight regression
  feature:     { dir: 'up',   data: makeTrend([0.65, 0.60, 0.55, 0.50, 0.48, 0.47, 0.48, 0.50, 0.50]) },
  // Spike: steady improvement
  spike:       { dir: 'up',   data: makeTrend([0.42, 0.38, 0.35, 0.32, 0.28, 0.26, 0.25, 0.24, 0.25]) },
  // Dependency: getting much worse
  dependency:  { dir: 'down', data: makeTrend([0.50, 0.54, 0.58, 0.60, 0.64, 0.67, 0.70, 0.71, 0.71]) },
  // Impediment: oscillating
  impediment:  { dir: 'stable', data: makeTrend([0.40, 0.36, 0.42, 0.38, 0.44, 0.40, 0.38, 0.42, 0.38]) },
  // Initiative: plateau then drop
  initiative:  { dir: 'down', data: makeTrend([0.45, 0.46, 0.46, 0.48, 0.52, 0.56, 0.58, 0.60, 0.60]) },
  // Cross-field: improving
  crossField:  { dir: 'up',   data: makeTrend([0.60, 0.56, 0.52, 0.50, 0.48, 0.50, 0.48, 0.46, 0.50]) },
};

// ============================================================================
// Score Pill Component
// ============================================================================

const ScorePill: React.FC<{ score: number }> = ({ score }) => {
  const greenColor = score >= 70 ? '#00875A' : score >= 50 ? '#2684FF' : score >= 30 ? '#FF8B00' : '#DE350B';
  const remainder = 100 - score;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: '22px',
      borderRadius: '11px',
      overflow: 'hidden',
      backgroundColor: '#F4F5F7',
      minWidth: '80px',
      position: 'relative' as const,
    }}>
      <div style={{
        flex: score,
        height: '100%',
        backgroundColor: greenColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: score > 8 ? undefined : '0px',
      }}>
        {score >= 15 && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1,
          }}>
            {score}
          </span>
        )}
      </div>
      {remainder > 0 && (
        <div style={{
          flex: remainder,
          height: '100%',
          backgroundColor: '#DE350B',
          opacity: 0.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {score < 15 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#DE350B',
              lineHeight: 1,
            }}>
              {score}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Issue type row shape
// ============================================================================

export interface IssueTypeRow {
  issueType: string;
  displayName: string;
  indicators: IndicatorResult[];
  passedChecks: PassedCheck[];
  fieldNames: string[];
  score: number;
  totalChecks: number;
  failRate: number;
  severityLabel: string;
  severityColor: string;
  severityBg: string;
  trendDirection: 'up' | 'down' | 'stable';
  trendColor: string;
  syntheticTrendData: TrendDataPoint[];
  syntheticTrend: TrendDirection;
  isCrossField: boolean;
}

// ============================================================================
// Component
// ============================================================================

interface IssueTypeSummaryTableProps {
  dimension: DimensionResult;
  onIssueTypeDrillDown: (issueType: string, row: IssueTypeRow) => void;
}

const IssueTypeSummaryTable: React.FC<IssueTypeSummaryTableProps> = ({ dimension, onIssueTypeDrillDown }) => {
  const { issueTypeRows, crossFieldRow, stats } = useMemo(() => {
    const isTimeliness = dimension.dimensionKey === 'ticketReadiness';

    if (isTimeliness) {
      // Build indicator lookup by ID
      const indicatorById = new Map<string, IndicatorResult>();
      for (const category of dimension.categories) {
        for (const ind of category.indicators) {
          indicatorById.set(ind.id, ind);
        }
      }

      const rows: IssueTypeRow[] = ISSUE_TYPES.map(issueType => {
        const fieldIds = TIMELINESS_INDICATOR_MAP[issueType] || [];
        const indicators = fieldIds
          .map(id => indicatorById.get(id))
          .filter(Boolean) as IndicatorResult[];
        const fieldNames = fieldIds.map(id => SHORT_NAME_MAP[id] || id);

        const avgIncomplete = indicators.length > 0
          ? indicators.reduce((s, ind) => s + ind.value / 100, 0) / indicators.length
          : 0;
        const score = Math.round((1 - avgIncomplete) * 100);
        const severity = getSeverityFromScore(score);

        // Use pre-built trend shapes (visually distinct per issue type)
        const trendEntry = TIMELINESS_TRENDS[issueType] || { dir: 'stable' as const, data: [] };
        const trendDir = trendEntry.dir;
        const syntheticData = trendEntry.data;

        return {
          issueType,
          displayName: issueType,
          indicators,
          passedChecks: [] as PassedCheck[],
          fieldNames,
          score,
          totalChecks: indicators.length,
          failRate: avgIncomplete,
          severityLabel: severity.label,
          severityColor: severity.color,
          severityBg: severity.bg,
          trendDirection: trendDir,
          trendColor: trendDir === 'up' ? '#36B37E' : trendDir === 'down' ? '#DE350B' : '#6B778C',
          syntheticTrendData: syntheticData,
          syntheticTrend: (trendDir === 'up' ? 'improving' : trendDir === 'down' ? 'declining' : 'stable') as TrendDirection,
          isCrossField: false,
        };
      });

      // Sort by score ascending (worst first)
      rows.sort((a, b) => a.score - b.score);

      // Aggregate stats
      const avgRate = rows.length > 0 ? rows.reduce((s, r) => s + r.failRate, 0) / rows.length : 0;
      const overallScore = Math.round((1 - avgRate) * 100);
      const overallSev = getSeverityFromScore(overallScore);
      let improving = 0, declining = 0, stable = 0;
      for (const r of rows) {
        if (r.trendDirection === 'up') improving++;
        else if (r.trendDirection === 'down') declining++;
        else stable++;
      }

      return {
        issueTypeRows: rows,
        crossFieldRow: null as IssueTypeRow | null,
        stats: {
          overallFailRate: avgRate,
          overallSevLabel: overallSev.label,
          overallSevColor: overallSev.color,
          overallSevBg: overallSev.bg,
          improving,
          declining,
          stable,
        },
      };
    } else {
      // Trustworthiness (dataIntegrity): each category IS one issue type
      const rows: IssueTypeRow[] = [];
      let crossRow: IssueTypeRow | null = null;

      for (const category of dimension.categories) {
        const isCrossField = category.id === 'crossField';
        const failed = category.indicators.length;
        const passed = category.passedChecks?.length ?? 0;
        const total = category.totalChecks ?? (failed + passed);
        const failRate = total > 0 ? failed / total : 0;
        const score = Math.round((1 - failRate) * 100);
        const severity = getSeverityFromScore(score);

        // Use pre-built trend shapes (visually distinct per category)
        const trendEntry = TRUSTWORTHINESS_TRENDS[category.id] || { dir: 'stable' as const, data: [] };
        const trendDir = trendEntry.dir;
        const syntheticData = trendEntry.data;

        // Extract field names from indicators and passedChecks
        const fieldSet = new Set<string>();
        for (const ind of category.indicators) {
          if (ind.jiraFieldId) fieldSet.add(getFieldDisplayName(ind.jiraFieldId));
        }
        if (category.passedChecks) {
          for (const pc of category.passedChecks) {
            if (pc.jiraFieldId) fieldSet.add(getFieldDisplayName(pc.jiraFieldId));
          }
        }
        const fieldNames = Array.from(fieldSet);

        const row: IssueTypeRow = {
          issueType: category.id,
          displayName: category.shortName,
          indicators: category.indicators,
          passedChecks: category.passedChecks || [],
          fieldNames,
          score,
          totalChecks: total,
          failRate,
          severityLabel: severity.label,
          severityColor: severity.color,
          severityBg: severity.bg,
          trendDirection: trendDir,
          trendColor: trendDir === 'up' ? '#36B37E' : trendDir === 'down' ? '#DE350B' : '#6B778C',
          syntheticTrendData: syntheticData,
          syntheticTrend: (trendDir === 'up' ? 'improving' : trendDir === 'down' ? 'declining' : 'stable') as TrendDirection,
          isCrossField,
        };

        if (isCrossField) {
          crossRow = row;
        } else {
          rows.push(row);
        }
      }

      // Sort by score ascending (worst first)
      rows.sort((a, b) => a.score - b.score);

      // Aggregate stats
      const allRows = [...rows, ...(crossRow ? [crossRow] : [])];
      const totalFailed = allRows.reduce((s, r) => s + r.indicators.length, 0);
      const totalAll = allRows.reduce((s, r) => s + r.totalChecks, 0);
      const overallFailRate = totalAll > 0 ? totalFailed / totalAll : 0;
      const overallScore = Math.round((1 - overallFailRate) * 100);
      const overallSev = getSeverityFromScore(overallScore);

      let improving = 0, declining = 0, stable = 0;
      for (const r of allRows) {
        if (r.trendDirection === 'up') improving++;
        else if (r.trendDirection === 'down') declining++;
        else stable++;
      }

      return {
        issueTypeRows: rows,
        crossFieldRow: crossRow,
        stats: {
          overallFailRate,
          overallSevLabel: overallSev.label,
          overallSevColor: overallSev.color,
          overallSevBg: overallSev.bg,
          improving,
          declining,
          stable,
        },
      };
    }
  }, [dimension]);

  // Derived values for banner
  const allDisplayRows = [...issueTypeRows, ...(crossFieldRow ? [crossFieldRow] : [])];
  const sevCounts = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
  for (const row of allDisplayRows) {
    if (row.severityLabel in sevCounts) sevCounts[row.severityLabel as keyof typeof sevCounts]++;
  }

  // Sorted worst-to-best for heatmap
  const sortedRows = [...allDisplayRows].sort((a, b) => a.score - b.score);
  const worstRow = sortedRows.length > 0 ? sortedRows[0] : null;

  // Ring angle
  const isTimeliness = dimension.dimensionKey === 'ticketReadiness';
  const passRate = 1 - stats.overallFailRate;
  const passAngle = Math.round(passRate * 360);

  // Trend helpers
  const trendIcon = dimension.trend === 'improving' ? 'up' : dimension.trend === 'declining' ? 'down' : 'stable';
  const trendLabel = dimension.trend === 'improving' ? 'Improving' : dimension.trend === 'declining' ? 'Declining' : 'Stable';
  const trendColor = dimension.trend === 'improving' ? '#36B37E' : dimension.trend === 'declining' ? '#DE350B' : '#6B778C';
  const trendBg = dimension.trend === 'improving' ? '#E3FCEF' : dimension.trend === 'declining' ? '#FFEBE6' : '#F4F5F7';

  const [trendModalRow, setTrendModalRow] = useState<IssueTypeRow | null>(null);

  return (
    <div>
      {/* Trend History Modal */}
      {trendModalRow && trendModalRow.syntheticTrendData.length >= 2 && (
        <TrendHistoryModal
          title={trendModalRow.displayName}
          score={trendModalRow.score}
          severityLabel={trendModalRow.severityLabel}
          severityColor={trendModalRow.severityColor}
          trend={trendModalRow.syntheticTrend}
          trendData={trendModalRow.syntheticTrendData}
          unit="%"
          onClose={() => setTrendModalRow(null)}
        />
      )}

      {/* Summary Stats Banner */}
      <div style={bannerStyles.container}>
        {/* Left Column — Health Ring */}
        <div style={bannerStyles.ringColumn}>
          <div style={{
            ...bannerStyles.ringOuter,
            background: allDisplayRows.length > 0
              ? `conic-gradient(#36B37E 0deg ${passAngle}deg, #DE350B ${passAngle}deg 360deg)`
              : '#E4E6EB',
          }}>
            <div style={bannerStyles.ringInner}>
              <span style={bannerStyles.ringScore}>{Math.round(passRate * 100)}</span>
              <span style={bannerStyles.ringUnit}>
                {isTimeliness ? '% complete' : '% pass'}
              </span>
            </div>
          </div>

          {/* Severity badge */}
          <span style={{
            ...bannerStyles.sevBadge,
            backgroundColor: stats.overallSevBg,
            color: stats.overallSevColor,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: stats.overallSevColor, flexShrink: 0,
            }} />
            {stats.overallSevLabel}
          </span>

          {/* Trend badge */}
          <span style={{ ...bannerStyles.trendBadge, backgroundColor: trendBg, color: trendColor }}>
            {trendIcon === 'up' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
            {trendIcon === 'down' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
            {trendIcon === 'stable' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
            {' '}{trendLabel}
          </span>

          {/* Total */}
          <span style={{ fontSize: '11px', color: '#6B778C', marginTop: '2px' }}>
            {allDisplayRows.length} issue type{allDisplayRows.length !== 1 ? 's' : ''}
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
                <div style={{ flex: sevCounts.Fair, backgroundColor: '#2684FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts.Fair > 1 && <span style={bannerStyles.sevBarText}>{sevCounts.Fair}</span>}
                </div>
              )}
              {sevCounts.Healthy > 0 && (
                <div style={{ flex: sevCounts.Healthy, backgroundColor: '#00875A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sevCounts.Healthy > 1 && <span style={bannerStyles.sevBarText}>{sevCounts.Healthy}</span>}
                </div>
              )}
            </div>
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
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#2684FF' }} />
                  {sevCounts.Fair} Fair
                </span>
              )}
              {sevCounts.Healthy > 0 && (
                <span style={bannerStyles.sevLabelItem}>
                  <span style={{ ...bannerStyles.sevDot, backgroundColor: '#00875A' }} />
                  {sevCounts.Healthy} Healthy
                </span>
              )}
            </div>
          </div>

          {/* Horizontal divider */}
          <div style={bannerStyles.horizontalDivider} />

          {/* Bottom: Heatmap + Trend */}
          <div style={bannerStyles.bottomRow}>
            <div style={bannerStyles.heatmapSection}>
              <div style={bannerStyles.sectionLabel}>Issue Types by Health</div>
              <div style={bannerStyles.heatmapGrid}>
                {sortedRows.map((r) => (
                  <div
                    key={r.issueType}
                    title={`${r.displayName} — ${r.severityLabel} (score ${r.score})`}
                    style={{
                      width: '20px', height: '20px', borderRadius: '3px',
                      backgroundColor: r.severityColor,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              {worstRow && worstRow.severityLabel !== 'Healthy' && (
                <div style={bannerStyles.worstCallout}>
                  Worst: {worstRow.displayName} (score {worstRow.score})
                </div>
              )}
            </div>

            <div style={bannerStyles.subDivider} />

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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#36B37E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>{stats.improving}
                </span>
                <span style={{ color: '#6B778C', fontWeight: 600, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B778C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>{stats.stable}
                </span>
                <span style={{ color: '#DE350B', fontWeight: 600, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DE350B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>{stats.declining}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Type Table */}
      <div style={tableStyles.container}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ ...tableStyles.th, width: '18%' }}>Issue Type</th>
              <th style={{ ...tableStyles.th, width: '12%' }}>{isTimeliness ? 'Timeliness' : 'Trustworthiness'}</th>
              <th style={{ ...tableStyles.th, width: '14%' }}>{isTimeliness ? 'Completed %' : 'Score'}</th>
              <th style={{ ...tableStyles.th, width: '30%' }}>Fields Analyzed</th>
              <th style={tableStyles.th}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {issueTypeRows.map((row) => (
              <IssueTypeRowComponent
                key={row.issueType}
                row={row}
                onRowClick={() => onIssueTypeDrillDown(row.issueType, row)}
                onOpenTrendModal={() => setTrendModalRow(row)}
              />
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
                <IssueTypeRowComponent
                  row={crossFieldRow}
                  onRowClick={() => onIssueTypeDrillDown(crossFieldRow.issueType, crossFieldRow)}
                  onOpenTrendModal={() => setTrendModalRow(crossFieldRow)}
                />
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// Row component
// ============================================================================

const IssueTypeRowComponent: React.FC<{
  row: IssueTypeRow;
  onRowClick: () => void;
  onOpenTrendModal: () => void;
}> = ({ row, onRowClick, onOpenTrendModal }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <tr
      onClick={onRowClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F4F5F7' : 'transparent',
        borderBottom: '1px solid #F4F5F7',
        transition: 'background-color 0.1s ease',
        cursor: 'pointer',
      }}
    >
      {/* Issue Type name */}
      <td style={tableStyles.tdName}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{row.displayName}</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: hovered ? 0.6 : 0 , transition: 'opacity 0.15s' }}>
            <path d="M6 3l5 5-5 5" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </td>

      {/* Severity badge */}
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

      {/* Score pill */}
      <td style={tableStyles.td}>
        <ScorePill score={row.score} />
      </td>

      {/* Fields Analyzed: pill badges */}
      <td style={tableStyles.td}>
        {row.fieldNames.length > 0 ? (
          <div style={tableStyles.fieldTags}>
            {row.fieldNames.map(f => (
              <span key={f} style={tableStyles.fieldTag}>{f}</span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: '#8993A4', fontStyle: 'italic' as const }}>
            {row.isCrossField ? 'Cross-field' : 'No fields'}
          </span>
        )}
      </td>

      {/* Trend sparkline — click opens modal */}
      <td
        style={{ ...tableStyles.td, overflow: 'hidden', cursor: row.syntheticTrendData.length >= 2 ? 'pointer' : 'default' }}
        onClick={(e) => {
          e.stopPropagation();
          if (row.syntheticTrendData.length >= 2) {
            onOpenTrendModal();
          }
        }}
      >
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {row.syntheticTrendData.length >= 2 ? (
            <Sparkline
              data={row.syntheticTrendData}
              trend={row.syntheticTrend}
              width={140}
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
// Banner styles (mirrors Data Integrity / Field Completeness)
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
  fieldTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
  },
  fieldTag: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
    color: '#505F79',
    backgroundColor: '#F4F5F7',
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.5,
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

export default IssueTypeSummaryTable;
