import React, { useState } from 'react';
import { VariabilityReport as VariabilityReportType, SimilarTeamComparison } from '../../../../types/assessment';
import PaginationControls from '../shared/PaginationControls';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface VariabilityReportProps {
  report: VariabilityReportType;
}

const VariabilityReport: React.FC<VariabilityReportProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(report.yourSprintData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleSprints = report.yourSprintData.slice(startIndex, startIndex + pageSize);

  const formatValue = (value: number) => {
    if (report.unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    return value.toFixed(1);
  };

  const formatCV = (cv: number) => `${(cv * 100).toFixed(1)}%`;

  const getCVColor = (cv: number) => {
    if (cv > 0.5) return '#DE350B';  // High variability - red
    if (cv > 0.3) return '#FF991F';  // Medium variability - orange
    return '#36B37E';                 // Low variability - green
  };

  const getComparisonColor = (yourValue: number, benchmarkValue: number, lowerIsBetter: boolean = false) => {
    const diff = yourValue - benchmarkValue;
    const threshold = benchmarkValue * 0.1;

    if (lowerIsBetter) {
      if (diff < -threshold) return '#36B37E';  // Your value is significantly lower - good
      if (diff > threshold) return '#DE350B';   // Your value is significantly higher - bad
    } else {
      if (diff > threshold) return '#36B37E';   // Your value is significantly higher - good
      if (diff < -threshold) return '#DE350B';  // Your value is significantly lower - bad
    }
    return '#172B4D';  // Similar values - neutral
  };

  const isWithinRange = (value: number, min: number, max: number) => {
    return value >= min && value <= max;
  };

  return (
    <div style={styles.container}>
      {/* Statistics Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Your Team</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Mean {report.metricName}</span>
              <span style={styles.statValue}>{formatValue(report.yourMean)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Std Deviation</span>
              <span style={styles.statValue}>{formatValue(report.yourStandardDeviation)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Coefficient of Variation</span>
              <span style={{
                ...styles.statValue,
                color: getCVColor(report.yourCoefficientOfVariation),
              }}>
                {formatCV(report.yourCoefficientOfVariation)}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Similar Teams Average</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Mean {report.metricName}</span>
              <span style={styles.statValue}>{formatValue(report.benchmarkMean)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Std Deviation</span>
              <span style={styles.statValue}>{formatValue(report.benchmarkStandardDeviation)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Coefficient of Variation</span>
              <span style={{
                ...styles.statValue,
                color: getCVColor(report.benchmarkCoefficientOfVariation),
              }}>
                {formatCV(report.benchmarkCoefficientOfVariation)}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.comparisonCard}>
          <h4 style={styles.statsTitle}>Variability Comparison</h4>
          <div style={styles.comparisonContent}>
            <div style={styles.comparisonItem}>
              <span style={styles.comparisonLabel}>Your CV vs Similar Teams</span>
              {report.yourCoefficientOfVariation <= report.benchmarkCoefficientOfVariation ? (
                <span style={styles.comparisonGood}>
                  ↓ {formatCV(report.benchmarkCoefficientOfVariation - report.yourCoefficientOfVariation)} lower
                </span>
              ) : (
                <span style={styles.comparisonBad}>
                  ↑ {formatCV(report.yourCoefficientOfVariation - report.benchmarkCoefficientOfVariation)} higher
                </span>
              )}
            </div>
            <p style={styles.comparisonDescription}>{report.description}</p>
          </div>
        </div>
      </div>

      {/* Sprint Data Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Sprint-by-Sprint {report.metricName}</h3>
          <span style={styles.tableSubtitle}>
            Comparing your team's {report.metricName.toLowerCase()} against similar teams over time
          </span>
        </div>

        {report.yourSprintData.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No sprint data available.</p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={{ ...styles.th, width: '140px' }}>Sprint</th>
                    <th style={{ ...styles.th, width: '120px' }}>Your Value</th>
                    <th style={{ ...styles.th, width: '120px' }}>Teams Avg</th>
                    <th style={{ ...styles.th, width: '160px' }}>Teams Range</th>
                    <th style={{ ...styles.th, width: '120px' }}>Difference</th>
                    <th style={{ ...styles.th, width: '100px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSprints.map((sprint) => {
                    const diff = sprint.yourValue - sprint.benchmarkValue;
                    const withinRange = isWithinRange(sprint.yourValue, sprint.benchmarkMin, sprint.benchmarkMax);

                    return (
                      <tr key={sprint.sprintNumber} style={styles.tableRow}>
                        <td style={styles.td}>
                          <span style={styles.sprintName}>{sprint.sprintName}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.valueText,
                            fontWeight: 600,
                          }}>
                            {formatValue(sprint.yourValue)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.valueText}>
                            {formatValue(sprint.benchmarkValue)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.rangeText}>
                            {formatValue(sprint.benchmarkMin)} – {formatValue(sprint.benchmarkMax)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.diffText,
                            color: getComparisonColor(sprint.yourValue, sprint.benchmarkValue, true),
                          }}>
                            {diff >= 0 ? '+' : ''}{formatValue(diff)}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: withinRange ? '#E3FCEF' : '#FFEBE6',
                            color: withinRange ? '#006644' : '#BF2600',
                          }}>
                            {withinRange ? 'In Range' : 'Out of Range'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={report.yourSprintData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="sprints"
            />
          </>
        )}
      </div>

      {/* Trend Line Chart */}
      <div style={styles.chartCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Sprint Trend</h3>
          <span style={styles.tableSubtitle}>
            Your {report.metricName.toLowerCase()} over time vs similar teams average
          </span>
        </div>
        <div style={styles.lineChartContainer}>
          {(() => {
            const displayedSprints = report.yourSprintData.slice(0, 12);
            if (displayedSprints.length === 0) return null;

            const allValues = displayedSprints.flatMap(s => [s.yourValue, s.benchmarkValue]);
            const maxVal = Math.max(...allValues);
            const minVal = Math.min(...allValues);
            const range = maxVal - minVal || 1;
            const padding = range * 0.1;
            const yMin = Math.max(0, minVal - padding);
            const yMax = maxVal + padding;
            const yRange = yMax - yMin;

            const chartWidth = 700;
            const chartHeight = 200;
            const marginLeft = 50;
            const marginRight = 20;
            const marginTop = 20;
            const marginBottom = 40;
            const plotWidth = chartWidth - marginLeft - marginRight;
            const plotHeight = chartHeight - marginTop - marginBottom;

            const getX = (index: number) => marginLeft + (index / (displayedSprints.length - 1 || 1)) * plotWidth;
            const getY = (value: number) => marginTop + plotHeight - ((value - yMin) / yRange) * plotHeight;

            // Create path for your values
            const yourPath = displayedSprints.map((s, i) =>
              `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(s.yourValue)}`
            ).join(' ');

            // Create path for benchmark values
            const benchPath = displayedSprints.map((s, i) =>
              `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(s.benchmarkValue)}`
            ).join(' ');

            // Y-axis labels
            const yTicks = [yMin, yMin + yRange * 0.25, yMin + yRange * 0.5, yMin + yRange * 0.75, yMax];

            return (
              <svg width={chartWidth} height={chartHeight} style={{ display: 'block', margin: '0 auto' }}>
                {/* Grid lines */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={marginLeft}
                      y1={getY(tick)}
                      x2={chartWidth - marginRight}
                      y2={getY(tick)}
                      stroke="#EBECF0"
                      strokeWidth="1"
                    />
                    <text
                      x={marginLeft - 8}
                      y={getY(tick) + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#6B778C"
                    >
                      {tick.toFixed(0)}
                    </text>
                  </g>
                ))}

                {/* Benchmark line (dashed) */}
                <path
                  d={benchPath}
                  fill="none"
                  stroke="#36B37E"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                />

                {/* Your values line (solid) */}
                <path
                  d={yourPath}
                  fill="none"
                  stroke="#0052CC"
                  strokeWidth="2.5"
                />

                {/* Data points for your values */}
                {displayedSprints.map((sprint, i) => (
                  <g key={i}>
                    <circle
                      cx={getX(i)}
                      cy={getY(sprint.yourValue)}
                      r="5"
                      fill="#0052CC"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    >
                      <title>{`${sprint.sprintName}: ${formatValue(sprint.yourValue)}`}</title>
                    </circle>
                    {/* X-axis labels */}
                    <text
                      x={getX(i)}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6B778C"
                    >
                      S{sprint.sprintNumber}
                    </text>
                  </g>
                ))}

                {/* Benchmark points */}
                {displayedSprints.map((sprint, i) => (
                  <circle
                    key={`bench-${i}`}
                    cx={getX(i)}
                    cy={getY(sprint.benchmarkValue)}
                    r="4"
                    fill="#36B37E"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  >
                    <title>{`Teams Avg: ${formatValue(sprint.benchmarkValue)}`}</title>
                  </circle>
                ))}
              </svg>
            );
          })()}
        </div>
        <div style={styles.chartLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#0052CC' }} />
            <span style={styles.legendText}>Your Team</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendLine, borderTop: '2px dashed #36B37E' }} />
            <span style={styles.legendText}>Similar Teams Average</span>
          </div>
        </div>
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel={`CV (${report.metricName})`}
        valueFormatter={(team: SimilarTeamComparison) => formatCV(team.value)}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  statsTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  comparisonCard: {
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px',
  },
  comparisonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  comparisonItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  comparisonGood: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#36B37E',
  },
  comparisonBad: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#DE350B',
  },
  comparisonDescription: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  tableTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  tableSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  headerRow: {
    backgroundColor: '#FAFBFC',
    borderBottom: '2px solid #EBECF0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  sprintName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  valueText: {
    fontSize: '13px',
    color: '#172B4D',
  },
  rangeText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  diffText: {
    fontSize: '13px',
    fontWeight: 600,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#5E6C84',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  barChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '200px',
    padding: '20px 24px',
    gap: '8px',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    maxWidth: '60px',
  },
  barContainer: {
    position: 'relative',
    width: '100%',
    height: '160px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  benchmarkRangeBand: {
    position: 'absolute',
    left: '0',
    right: '0',
    backgroundColor: '#E3FCEF',
    opacity: 0.7,
  },
  yourBar: {
    width: '20px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
    zIndex: 1,
  },
  benchmarkLine: {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: '#36B37E',
  },
  barLabel: {
    marginTop: '8px',
    fontSize: '10px',
    color: '#6B778C',
    fontWeight: 500,
  },
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  legendText: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  lineChartContainer: {
    padding: '24px',
    overflowX: 'auto',
  },
  legendLine: {
    width: '20px',
    height: '0',
    borderTop: '2px dashed',
  },
};

export default VariabilityReport;
