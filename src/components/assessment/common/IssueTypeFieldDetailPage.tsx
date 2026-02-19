import React, { useMemo, useState } from 'react';
import { IndicatorResult, PassedCheck, TrendDataPoint, TrendDirection } from '../../../types/assessment';
import { MOCK_JIRA_FIELDS_BY_ISSUE_TYPE } from '../../../constants/presets';
import Sparkline from './Sparkline';
import TrendHistoryModal from './TrendHistoryModal';

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
// Field suite shape (for Trustworthiness)
// ============================================================================

interface FieldSuite {
  fieldId: string;
  fieldName: string;
  detected: IndicatorResult[];
  passed: PassedCheck[];
}

function buildFieldSuites(indicators: IndicatorResult[], passedChecks: PassedCheck[]): FieldSuite[] {
  const fieldMap = new Map<string, { detected: IndicatorResult[]; passed: PassedCheck[] }>();

  for (const ind of indicators) {
    const fid = ind.jiraFieldId || ind.id;
    if (!fieldMap.has(fid)) fieldMap.set(fid, { detected: [], passed: [] });
    fieldMap.get(fid)!.detected.push(ind);
  }
  for (const pc of passedChecks) {
    const fid = pc.jiraFieldId || pc.id;
    if (!fieldMap.has(fid)) fieldMap.set(fid, { detected: [], passed: [] });
    fieldMap.get(fid)!.passed.push(pc);
  }

  const suites: FieldSuite[] = [];
  fieldMap.forEach((data, fid) => {
    suites.push({
      fieldId: fid,
      fieldName: getFieldDisplayName(fid),
      detected: data.detected,
      passed: data.passed,
    });
  });

  // Sort: most issues first, then failed-heavy first
  suites.sort((a, b) => b.detected.length - a.detected.length || (b.detected.length + b.passed.length) - (a.detected.length + a.passed.length));
  return suites;
}

// ============================================================================
// Timeliness field row shape
// ============================================================================

interface TimelinessFieldRow {
  indicator: IndicatorResult;
  fieldName: string;
  incompleteRate: number;
  severityLabel: string;
  severityColor: string;
  severityBg: string;
}

// ============================================================================
// Component
// ============================================================================

interface IssueTypeFieldDetailPageProps {
  issueType: string;
  displayName: string;
  dimensionKey: string;
  dimensionName: string;
  indicators: IndicatorResult[];
  passedChecks: PassedCheck[];
  totalChecks?: number;
  onBack: () => void;
}

const IssueTypeFieldDetailPage: React.FC<IssueTypeFieldDetailPageProps> = ({
  issueType,
  displayName,
  dimensionKey,
  dimensionName,
  indicators,
  passedChecks,
  totalChecks,
  onBack,
}) => {
  const isTimeliness = dimensionKey === 'ticketReadiness';

  // Compute summary stats
  const failedCount = indicators.length;
  const passedCount = passedChecks.length;
  const total = totalChecks ?? (failedCount + passedCount);
  const failRate = total > 0 ? failedCount / total : 0;
  const score = isTimeliness
    ? Math.round((1 - (indicators.length > 0 ? indicators.reduce((s, ind) => s + ind.value / 100, 0) / indicators.length : 0)) * 100)
    : Math.round((1 - failRate) * 100);
  const severity = getSeverityFromScore(score);

  // Timeliness: field-level rows
  const timelinessRows = useMemo<TimelinessFieldRow[]>(() => {
    if (!isTimeliness) return [];
    return indicators.map(ind => {
      const rate = ind.value / 100;
      const fieldScore = Math.round((1 - rate) * 100);
      const sev = getSeverityFromScore(fieldScore);
      const fieldName = SHORT_NAME_MAP[ind.id] || ind.name;
      return {
        indicator: ind,
        fieldName,
        incompleteRate: rate,
        severityLabel: sev.label,
        severityColor: sev.color,
        severityBg: sev.bg,
      };
    }).sort((a, b) => b.incompleteRate - a.incompleteRate);
  }, [indicators, isTimeliness]);

  // Trustworthiness: field suites
  const fieldSuites = useMemo(() => {
    if (isTimeliness) return [];
    return buildFieldSuites(indicators, passedChecks);
  }, [indicators, passedChecks, isTimeliness]);

  // Count fields with failures for Trustworthiness summary
  const fieldsWithFailures = fieldSuites.filter(s => s.detected.length > 0).length;
  const fieldsAllPassed = fieldSuites.filter(s => s.detected.length === 0 && s.passed.length > 0).length;

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [trendModalRow, setTrendModalRow] = useState<TimelinessFieldRow | null>(null);

  return (
    <div>
      {/* Trend History Modal */}
      {trendModalRow && trendModalRow.indicator.trendData && trendModalRow.indicator.trendData.length >= 2 && (
        <TrendHistoryModal
          title={trendModalRow.fieldName}
          score={Math.round((1 - trendModalRow.incompleteRate) * 100)}
          severityLabel={trendModalRow.severityLabel}
          severityColor={trendModalRow.severityColor}
          trend={trendModalRow.indicator.trend}
          trendData={trendModalRow.indicator.trendData}
          unit="%"
          onClose={() => setTrendModalRow(null)}
        />
      )}

      {/* Back button + breadcrumb */}
      <button
        onClick={onBack}
        style={detailStyles.backButton}
        type="button"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M10 3L5 8l5 5" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to {dimensionName}
      </button>

      {/* Issue type header */}
      <div style={detailStyles.headerCard}>
        <div style={detailStyles.headerTop}>
          <h2 style={detailStyles.headerTitle}>{displayName}</h2>
          <span style={{
            ...detailStyles.severityBadge,
            backgroundColor: severity.bg,
            color: severity.color,
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: severity.color, flexShrink: 0,
            }} />
            {severity.label}
          </span>
        </div>
        <div style={detailStyles.headerStats}>
          {!isTimeliness && (
            <>
              {failedCount > 0 && (
                <span style={{ ...detailStyles.statItem, color: '#DE350B' }}>
                  <span style={{ fontSize: '14px' }}>&#10005;</span> {failedCount} failed
                </span>
              )}
              {failedCount > 0 && passedCount > 0 && (
                <span style={{ color: '#DFE1E6', fontSize: '12px' }}>&middot;</span>
              )}
              {passedCount > 0 && (
                <span style={{ ...detailStyles.statItem, color: '#36B37E' }}>
                  <span style={{ fontSize: '14px' }}>&#10003;</span> {passedCount} passed
                </span>
              )}
              <span style={{ color: '#DFE1E6', fontSize: '12px' }}>&middot;</span>
              <span style={detailStyles.statItem}>
                {fieldsWithFailures} field{fieldsWithFailures !== 1 ? 's' : ''} with issues
              </span>
            </>
          )}
          {isTimeliness && (
            <span style={detailStyles.statItem}>
              {indicators.length} field{indicators.length !== 1 ? 's' : ''} analyzed
            </span>
          )}
        </div>
      </div>

      {/* Timeliness: field-level table */}
      {isTimeliness && (
        <div style={detailStyles.tableContainer}>
          <table style={detailStyles.table}>
            <thead>
              <tr>
                <th style={{ ...detailStyles.th, width: '22%' }}>Field</th>
                <th style={{ ...detailStyles.th, width: '14%' }}>Completeness</th>
                <th style={{ ...detailStyles.th, width: '32%' }}>Missing Rate</th>
                <th style={{ ...detailStyles.th, width: '32%' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {timelinessRows.map((row) => {
                const completeRate = 1 - row.incompleteRate;
                const isHovered = hoveredRowId === row.indicator.id;
                const hasTrend = row.indicator.trendData && row.indicator.trendData.length >= 2;
                return (
                  <tr
                    key={row.indicator.id}
                    onMouseEnter={() => setHoveredRowId(row.indicator.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
                      borderBottom: '1px solid #F4F5F7',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    <td style={detailStyles.tdName}>{row.fieldName}</td>
                    <td style={detailStyles.td}>
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
                    <td style={detailStyles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '3px' }}>
                        <div style={detailStyles.pillBar}>
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
                    <td
                      style={{ ...detailStyles.td, overflow: 'hidden', cursor: hasTrend ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (hasTrend) {
                          setTrendModalRow(row);
                        }
                      }}
                    >
                      <div style={{ width: '100%', overflow: 'hidden' }}>
                        {hasTrend ? (
                          <Sparkline
                            data={row.indicator.trendData!}
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
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trustworthiness: field-level table with tests */}
      {!isTimeliness && (
        <div style={detailStyles.tableContainer}>
          <table style={detailStyles.table}>
            <thead>
              <tr>
                <th style={{ ...detailStyles.th, width: '18%' }}>Field</th>
                <th style={detailStyles.th}>Tests</th>
                <th style={{ ...detailStyles.th, width: '10%', textAlign: 'center' as const }}>Passed</th>
                <th style={{ ...detailStyles.th, width: '10%', textAlign: 'center' as const }}>Failed</th>
              </tr>
            </thead>
            <tbody>
              {fieldSuites.map((suite) => {
                const sFailedCount = suite.detected.length;
                const sPassedCount = suite.passed.length;
                const isHovered = hoveredRowId === suite.fieldId;
                const hasFailures = sFailedCount > 0;

                return (
                  <tr
                    key={suite.fieldId}
                    onMouseEnter={() => setHoveredRowId(suite.fieldId)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    style={{
                      backgroundColor: isHovered ? '#F4F5F7' : 'transparent',
                      borderBottom: '1px solid #F4F5F7',
                      transition: 'background-color 0.1s ease',
                      verticalAlign: 'top',
                    }}
                  >
                    {/* Field name */}
                    <td style={{
                      ...detailStyles.tdName,
                      verticalAlign: 'top',
                      paddingTop: '12px',
                    }}>
                      {suite.fieldName}
                    </td>

                    {/* Tests list */}
                    <td style={{ ...detailStyles.td, verticalAlign: 'top', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                        {suite.detected.map((ind) => (
                          <div key={ind.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minHeight: '22px' }}>
                            <span style={{ color: '#DE350B', fontSize: '13px', flexShrink: 0, lineHeight: '22px' }}>&#10005;</span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#172B4D',
                              lineHeight: '22px',
                              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                            }}>
                              {ind.name}
                            </span>
                          </div>
                        ))}
                        {suite.passed.map((check) => (
                          <div key={check.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minHeight: '22px' }}>
                            <span style={{ color: '#36B37E', fontSize: '13px', flexShrink: 0, lineHeight: '22px' }}>&#10003;</span>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#8993A4',
                              lineHeight: '22px',
                              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                            }}>
                              {check.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Passed count */}
                    <td style={{
                      ...detailStyles.td,
                      textAlign: 'center' as const,
                      verticalAlign: 'top',
                      paddingTop: '12px',
                    }}>
                      {sPassedCount > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '24px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#E3FCEF',
                          color: '#006644',
                        }}>
                          {sPassedCount}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#C1C7D0' }}>0</span>
                      )}
                    </td>

                    {/* Failed count */}
                    <td style={{
                      ...detailStyles.td,
                      textAlign: 'center' as const,
                      verticalAlign: 'top',
                      paddingTop: '12px',
                    }}>
                      {sFailedCount > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '24px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#FFEBE6',
                          color: '#DE350B',
                        }}>
                          {sFailedCount}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#C1C7D0' }}>0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const detailStyles: Record<string, React.CSSProperties> = {
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    marginBottom: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.06)',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#172B4D',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statItem: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  tableContainer: {
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

export default IssueTypeFieldDetailPage;
