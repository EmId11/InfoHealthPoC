import React, { useMemo } from 'react';
import { DimensionResult, IndicatorResult, TrendDataPoint, TrendDirection } from '../../../types/assessment';
import { staleFreshFindings } from '../../../constants/mockAssessmentData';
import Sparkline from './Sparkline';

// ============================================================================
// Constants
// ============================================================================

const ISSUE_TYPES = [
  'Story', 'Bug', 'Task', 'Epic', 'Risk',
  'Assumption', 'Feature', 'Spike', 'Dependency', 'Impediment', 'Initiative',
];

// Cross-issue-type indicators (pulled from dimension categories)
const CROSS_ISSUE_INDICATOR_IDS = ['bulkChanges', 'jiraUpdateFrequency', 'invisibleWorkRiskScore'];

// Fields included in freshness analysis per issue type
const ISSUE_TYPE_FIELDS: Record<string, string[]> = {
  Story:      ['Status', 'Assignee', 'Story Points', 'Priority', 'Sprint'],
  Bug:        ['Status', 'Assignee', 'Priority', 'Severity', 'Fix Version'],
  Task:       ['Status', 'Assignee', 'Priority', 'Sprint'],
  Epic:       ['Status', 'Assignee', 'Start Date', 'Due Date', 'Priority'],
  Risk:       ['Status', 'Assignee', 'Priority', 'Impact', 'Likelihood'],
  Assumption: ['Status', 'Assignee', 'Priority', 'Validation Date'],
  Feature:    ['Status', 'Assignee', 'Priority', 'Target Release'],
  Spike:      ['Status', 'Assignee', 'Time Box', 'Priority'],
  Dependency: ['Status', 'Assignee', 'Priority', 'Blocked By'],
  Impediment: ['Status', 'Assignee', 'Priority', 'Resolution'],
  Initiative: ['Status', 'Assignee', 'Priority', 'Start Date', 'Due Date'],
};

// ============================================================================
// Severity helpers
// ============================================================================

function getSeverityFromScore(score: number): { label: string; color: string; bg: string } {
  if (score >= 70) return { label: 'Healthy', color: '#006644', bg: '#E3FCEF' };
  if (score >= 50) return { label: 'Fair', color: '#FFAB00', bg: '#FFFAE6' };
  if (score >= 30) return { label: 'At Risk', color: '#FF8B00', bg: '#FFF7E6' };
  return { label: 'Critical', color: '#DE350B', bg: '#FFEBE6' };
}

// ============================================================================
// Trend helpers
// ============================================================================

function computeTrendDirection(trendData?: TrendDataPoint[]): 'up' | 'down' | 'stable' {
  if (!trendData || trendData.length < 2) return 'stable';
  const first = trendData[0].value;
  const last = trendData[trendData.length - 1].value;
  if (last > first + 2) return 'up';
  if (last < first - 2) return 'down';
  return 'stable';
}

/** Map raw trend direction + higherIsBetter to health trend */
function toHealthTrend(rawTrend: 'up' | 'down' | 'stable', higherIsBetter: boolean): TrendDirection {
  if (rawTrend === 'stable') return 'stable';
  if (higherIsBetter) {
    return rawTrend === 'up' ? 'improving' : 'declining';
  }
  return rawTrend === 'up' ? 'declining' : 'improving';
}

// ============================================================================
// Score computation — convert raw values to 0-100 freshness score
// ============================================================================

function valueToScore(value: number, benchmark: number, higherIsBetter: boolean): number {
  if (higherIsBetter) {
    if (benchmark <= 0) return value > 0 ? 100 : 0;
    const ratio = value / benchmark;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
  } else {
    if (benchmark <= 0) return value > 0 ? 0 : 100;
    const ratio = value / benchmark;
    return Math.max(0, Math.min(100, Math.round(100 - (ratio - 1) * 50)));
  }
}

// ============================================================================
// Score Pill Component — green/red bar with score label
// ============================================================================

const ScorePill: React.FC<{ score: number }> = ({ score }) => {
  const greenColor = score >= 70 ? '#36B37E' : score >= 50 ? '#FFAB00' : score >= 30 ? '#FF8B00' : '#DE350B';
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
      {/* Score portion */}
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
      {/* Remainder portion */}
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
// Issue type row data shape
// ============================================================================

interface IssueTypeRow {
  issueType: string;
  score: number;
  severityLabel: string;
  severityColor: string;
  severityBg: string;
  syntheticTrend: TrendDirection;
  staleness: IndicatorResult;
}

// ============================================================================
// Component
// ============================================================================

interface DataFreshnessSummaryTableProps {
  dimension: DimensionResult;
}

const DataFreshnessSummaryTable: React.FC<DataFreshnessSummaryTableProps> = ({ dimension }) => {
  // Build rows from staleness findings only
  const { rows, stats } = useMemo(() => {
    const issueTypeRows: IssueTypeRow[] = ISSUE_TYPES.map((issueType, i) => {
      const stale = staleFreshFindings[i];
      const score = valueToScore(stale.value, stale.benchmarkValue, stale.higherIsBetter);
      const sev = getSeverityFromScore(score);
      const rawTrend = computeTrendDirection(stale.trendData);
      const synthTrend = toHealthTrend(rawTrend, stale.higherIsBetter);
      return {
        issueType,
        score,
        severityLabel: sev.label,
        severityColor: sev.color,
        severityBg: sev.bg,
        syntheticTrend: synthTrend,
        staleness: stale,
      };
    });

    // Sort worst-first (lowest score first)
    issueTypeRows.sort((a, b) => a.score - b.score);

    // Stats
    const sevCounts = { Critical: 0, 'At Risk': 0, Fair: 0, Healthy: 0 };
    let improving = 0, declining = 0, stable = 0;
    for (const r of issueTypeRows) {
      if (r.severityLabel in sevCounts) sevCounts[r.severityLabel as keyof typeof sevCounts]++;
      if (r.syntheticTrend === 'improving') improving++;
      else if (r.syntheticTrend === 'declining') declining++;
      else stable++;
    }

    return {
      rows: issueTypeRows,
      stats: { sevCounts, improving, declining, stable, total: issueTypeRows.length },
    };
  }, []);

  // Cross-issue-type indicators from dimension categories
  const crossIndicators = useMemo(() => {
    const allIndicators = dimension.categories.flatMap(c => c.indicators);
    return CROSS_ISSUE_INDICATOR_IDS
      .map(id => allIndicators.find(ind => ind.id === id))
      .filter(Boolean) as IndicatorResult[];
  }, [dimension]);

  // Overall health score
  const healthScore = dimension.healthScore ?? Math.round(dimension.overallPercentile);
  const scoreAngle = Math.round((healthScore / 100) * 360);
  const scoreColor = healthScore >= 70 ? '#36B37E' : healthScore >= 50 ? '#FFAB00' : healthScore >= 30 ? '#FF8B00' : '#DE350B';

  // Trend from dimension
  const trendIcon = dimension.trend === 'improving' ? 'up' : dimension.trend === 'declining' ? 'down' : 'stable';
  const trendLabel = dimension.trend === 'improving' ? 'Improving' : dimension.trend === 'declining' ? 'Declining' : 'Stable';
  const trendColor = dimension.trend === 'improving' ? '#36B37E' : dimension.trend === 'declining' ? '#DE350B' : '#6B778C';
  const trendBg = dimension.trend === 'improving' ? '#E3FCEF' : dimension.trend === 'declining' ? '#FFEBE6' : '#F4F5F7';

  // Overall severity
  const overallSevLabel = healthScore >= 70 ? 'Healthy' : healthScore >= 50 ? 'Fair' : healthScore >= 30 ? 'At Risk' : 'Critical';
  const overallSevColor = scoreColor;
  const overallSevBg = healthScore >= 70 ? '#E3FCEF' : healthScore >= 50 ? '#FFFAE6' : healthScore >= 30 ? '#FFF7E6' : '#FFEBE6';

  // Worst row for callout
  const worstRow = rows.length > 0 ? rows[0] : null;

  return (
    <div>
      {/* Summary Stats Banner */}
      <div style={bannerStyles.container}>
        {/* Left Column - Health Ring */}
        <div style={bannerStyles.ringColumn}>
          <div style={{
            ...bannerStyles.ringOuter,
            background: `conic-gradient(${scoreColor} 0deg ${scoreAngle}deg, #E4E6EB ${scoreAngle}deg 360deg)`,
          }}>
            <div style={bannerStyles.ringInner}>
              <span style={bannerStyles.ringScore}>{healthScore}</span>
              <span style={bannerStyles.ringUnit}>/100</span>
            </div>
          </div>

          {/* Severity badge */}
          <span style={{
            ...bannerStyles.sevBadge,
            backgroundColor: overallSevBg,
            color: overallSevColor,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: overallSevColor, flexShrink: 0,
            }} />
            {overallSevLabel}
          </span>

          {/* Trend badge */}
          <span style={{ ...bannerStyles.trendBadge, backgroundColor: trendBg, color: trendColor }}>
            {trendIcon === 'up' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></svg>}
            {trendIcon === 'down' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></svg>}
            {trendIcon === 'stable' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4,12 C8,8 16,16 20,12" /></svg>}
            {' '}{trendLabel}
          </span>

          {/* Issue type count */}
          <span style={{ fontSize: '11px', color: '#6B778C', marginTop: '2px' }}>
            {stats.total} issue types
          </span>
        </div>

        {/* Vertical divider */}
        <div style={bannerStyles.verticalDivider} />

        {/* Right Column - Details */}
        <div style={bannerStyles.detailsColumn}>
          {/* Severity Distribution */}
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
            {/* Issue types by Health heatmap */}
            <div style={bannerStyles.heatmapSection}>
              <div style={bannerStyles.sectionLabel}>Issue Types by Health</div>
              <div style={bannerStyles.heatmapGrid}>
                {rows.map((r) => (
                  <div
                    key={r.issueType}
                    title={`${r.issueType} \u2014 ${r.severityLabel} (${r.score})`}
                    style={{
                      width: '20px', height: '20px', borderRadius: '3px',
                      backgroundColor: r.severityColor === '#006644' ? '#36B37E' : r.severityColor,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              {worstRow && worstRow.severityLabel !== 'Healthy' && (
                <div style={bannerStyles.worstCallout}>
                  Worst: {worstRow.issueType}
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
                unit="/100"
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
              <th style={{ ...tableStyles.th, width: '20%' }}>Issue Type</th>
              <th style={{ ...tableStyles.th, width: '12%' }}>Freshness</th>
              <th style={{ ...tableStyles.th, width: '14%' }}>Score</th>
              <th style={{ ...tableStyles.th, width: '28%' }}>Fields Analyzed</th>
              <th style={tableStyles.th}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <IssueTypeRowComponent key={row.issueType} row={row} />
            ))}

            {/* Cross-Issue-Type Separator */}
            <tr>
              <td colSpan={5} style={{ padding: 0 }}>
                <div style={tableStyles.crossSeparator}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="1" y="3" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                    <rect x="5" y="5" width="8" height="6" rx="1.5" stroke="#7A869A" strokeWidth="1.2" fill="none" />
                  </svg>
                  <span style={tableStyles.crossLabel}>CROSS-ISSUE-TYPE</span>
                  <div style={tableStyles.crossLine} />
                </div>
              </td>
            </tr>

            {/* Cross-issue-type indicator rows */}
            {crossIndicators.map((ind, idx) => (
              <CrossIndicatorRow
                key={ind.id}
                indicator={ind}
                isLast={idx === crossIndicators.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// Issue Type Row Component (non-expandable, staleness-only)
// ============================================================================

const IssueTypeRowComponent: React.FC<{ row: IssueTypeRow }> = ({ row }) => {
  const [hovered, setHovered] = React.useState(false);
  const fields = ISSUE_TYPE_FIELDS[row.issueType] || [];
  const trendData = row.staleness.trendData;

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F4F5F7' : 'transparent',
        borderBottom: '1px solid #F4F5F7',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* Issue type name */}
      <td style={tableStyles.tdName}>{row.issueType}</td>

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
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: row.severityColor, flexShrink: 0,
          }} />
          {row.severityLabel}
        </span>
      </td>

      {/* Score pill bar */}
      <td style={tableStyles.td}>
        <ScorePill score={row.score} />
      </td>

      {/* Fields analyzed */}
      <td style={tableStyles.td}>
        <div style={tableStyles.fieldTags}>
          {fields.map(f => (
            <span key={f} style={tableStyles.fieldTag}>{f}</span>
          ))}
        </div>
      </td>

      {/* Trend sparkline */}
      <td style={{ ...tableStyles.td, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {trendData && trendData.length >= 2 ? (
            <Sparkline
              data={trendData}
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
// Cross-Issue-Type Indicator Row (direct row, not nested)
// ============================================================================

const CrossIndicatorRow: React.FC<{
  indicator: IndicatorResult;
  isLast?: boolean;
}> = ({ indicator, isLast }) => {
  const [hovered, setHovered] = React.useState(false);
  const score = valueToScore(indicator.value, indicator.benchmarkValue, indicator.higherIsBetter);
  const sev = getSeverityFromScore(score);
  const rawTrend = computeTrendDirection(indicator.trendData);
  const synthTrend = toHealthTrend(rawTrend, indicator.higherIsBetter);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F0F1F4' : '#FAFBFC',
        borderBottom: isLast ? 'none' : '1px solid #F4F5F7',
        transition: 'background-color 0.1s ease',
      }}
    >
      {/* Indicator name */}
      <td style={tableStyles.tdName}>{indicator.name}</td>

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
          backgroundColor: sev.bg,
          color: sev.color,
          whiteSpace: 'nowrap' as const,
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: sev.color, flexShrink: 0,
          }} />
          {sev.label}
        </span>
      </td>

      {/* Score pill */}
      <td style={tableStyles.td}>
        <ScorePill score={score} />
      </td>

      {/* Scope label */}
      <td style={tableStyles.td}>
        <span style={{ fontSize: '11px', color: '#8993A4', fontStyle: 'italic' as const }}>System-wide</span>
      </td>

      {/* Trend sparkline */}
      <td style={{ ...tableStyles.td, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          {indicator.trendData && indicator.trendData.length >= 2 ? (
            <Sparkline
              data={indicator.trendData}
              trend={synthTrend}
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
  crossSeparator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 12px 8px',
    borderTop: '2px solid #E4E6EB',
  },
  crossLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#44546F',
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap' as const,
  },
  crossLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#E4E6EB',
  },
};

export default DataFreshnessSummaryTable;
