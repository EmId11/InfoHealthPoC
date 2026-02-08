import React, { useState, useMemo } from 'react';
import { CorrelationReport as CorrelationReportType, SimilarTeamComparison, CorrelationDataPoint } from '../../../../types/assessment';
import PaginationControls from '../shared/PaginationControls';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface CorrelationReportProps {
  report: CorrelationReportType;
}

const CorrelationReport: React.FC<CorrelationReportProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const totalPages = Math.ceil(report.dataPoints.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleDataPoints = report.dataPoints.slice(startIndex, startIndex + pageSize);

  // Calculate chart dimensions
  const chartDimensions = useMemo(() => {
    if (report.dataPoints.length === 0) {
      return { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
    }
    const xValues = report.dataPoints.map(p => p.xValue);
    const yValues = report.dataPoints.map(p => p.yValue);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;
    return {
      xMin: Math.floor(xMin - xPadding),
      xMax: Math.ceil(xMax + xPadding),
      yMin: Math.floor(yMin - yPadding),
      yMax: Math.ceil(yMax + yPadding),
    };
  }, [report.dataPoints]);

  const getCorrelationStrength = (r: number) => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return { label: 'Strong', color: '#36B37E' };
    if (absR >= 0.4) return { label: 'Moderate', color: '#FFAB00' };
    if (absR >= 0.2) return { label: 'Weak', color: '#FF991F' };
    return { label: 'Very Weak', color: '#DE350B' };
  };

  const getCorrelationDirection = (r: number) => {
    if (r > 0.1) return 'Positive';
    if (r < -0.1) return 'Negative';
    return 'No correlation';
  };

  const yourStrength = getCorrelationStrength(report.yourCorrelationCoefficient);
  const benchmarkStrength = getCorrelationStrength(report.benchmarkCorrelationCoefficient);

  // Convert data point to SVG coordinates
  const toSvgCoords = (x: number, y: number, width: number, height: number) => {
    const padding = 40;
    const svgX = padding + ((x - chartDimensions.xMin) / (chartDimensions.xMax - chartDimensions.xMin)) * (width - padding * 2);
    const svgY = height - padding - ((y - chartDimensions.yMin) / (chartDimensions.yMax - chartDimensions.yMin)) * (height - padding * 2);
    return { svgX, svgY };
  };

  // Calculate trendline endpoints
  const getTrendlinePoints = (width: number, height: number) => {
    const x1 = chartDimensions.xMin;
    const y1 = report.trendlineSlope * x1 + report.trendlineIntercept;
    const x2 = chartDimensions.xMax;
    const y2 = report.trendlineSlope * x2 + report.trendlineIntercept;
    return {
      start: toSvgCoords(x1, y1, width, height),
      end: toSvgCoords(x2, y2, width, height),
    };
  };

  const chartWidth = 600;
  const chartHeight = 400;
  const padding = 40;

  return (
    <div style={styles.container}>
      {/* Statistics Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Your Team Correlation</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Correlation (r)</span>
              <span style={{
                ...styles.statValue,
                color: yourStrength.color,
              }}>
                {report.yourCorrelationCoefficient.toFixed(3)}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>R-Squared (r²)</span>
              <span style={styles.statValue}>{(report.yourRSquared * 100).toFixed(1)}%</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Strength</span>
              <span style={{
                ...styles.strengthBadge,
                backgroundColor: yourStrength.color + '20',
                color: yourStrength.color,
              }}>
                {yourStrength.label} {getCorrelationDirection(report.yourCorrelationCoefficient)}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Similar Teams Correlation</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Correlation (r)</span>
              <span style={{
                ...styles.statValue,
                color: benchmarkStrength.color,
              }}>
                {report.benchmarkCorrelationCoefficient.toFixed(3)}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Strength</span>
              <span style={{
                ...styles.strengthBadge,
                backgroundColor: benchmarkStrength.color + '20',
                color: benchmarkStrength.color,
              }}>
                {benchmarkStrength.label} {getCorrelationDirection(report.benchmarkCorrelationCoefficient)}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.comparisonCard}>
          <h4 style={styles.statsTitle}>Analysis</h4>
          <p style={styles.comparisonDescription}>{report.description}</p>
        </div>
      </div>

      {/* Scatter Plot */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>{report.correlationTitle}</h3>
          <span style={styles.chartSubtitle}>
            Scatter plot showing relationship between {report.xAxisLabel.toLowerCase()} and {report.yAxisLabel.toLowerCase()}
          </span>
        </div>

        <div style={styles.scatterPlot}>
          <svg width={chartWidth} height={chartHeight} style={{ display: 'block', margin: '0 auto' }}>
            {/* Background */}
            <rect x={padding} y={padding} width={chartWidth - padding * 2} height={chartHeight - padding * 2} fill="#FAFBFC" />

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
              const x = padding + fraction * (chartWidth - padding * 2);
              const y = chartHeight - padding - fraction * (chartHeight - padding * 2);
              return (
                <g key={i}>
                  <line x1={x} y1={padding} x2={x} y2={chartHeight - padding} stroke="#EBECF0" strokeWidth="1" />
                  <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#EBECF0" strokeWidth="1" />
                </g>
              );
            })}

            {/* Axes */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#5E6C84" strokeWidth="2" />
            <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#5E6C84" strokeWidth="2" />

            {/* Axis labels */}
            <text x={chartWidth / 2} y={chartHeight - 8} textAnchor="middle" fontSize="11" fill="#5E6C84" fontWeight="600">
              {report.xAxisLabel}
            </text>
            <text x={12} y={chartHeight / 2} textAnchor="middle" fontSize="11" fill="#5E6C84" fontWeight="600" transform={`rotate(-90, 12, ${chartHeight / 2})`}>
              {report.yAxisLabel}
            </text>

            {/* Trendline */}
            {(() => {
              const trendline = getTrendlinePoints(chartWidth, chartHeight);
              return (
                <line
                  x1={Math.max(padding, Math.min(chartWidth - padding, trendline.start.svgX))}
                  y1={Math.max(padding, Math.min(chartHeight - padding, trendline.start.svgY))}
                  x2={Math.max(padding, Math.min(chartWidth - padding, trendline.end.svgX))}
                  y2={Math.max(padding, Math.min(chartHeight - padding, trendline.end.svgY))}
                  stroke="#DE350B"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })()}

            {/* Data points */}
            {report.dataPoints.map((point, index) => {
              const { svgX, svgY } = toSvgCoords(point.xValue, point.yValue, chartWidth, chartHeight);
              const isInBounds = svgX >= padding && svgX <= chartWidth - padding && svgY >= padding && svgY <= chartHeight - padding;
              if (!isInBounds) return null;
              return (
                <circle
                  key={index}
                  cx={svgX}
                  cy={svgY}
                  r="5"
                  fill="#0052CC"
                  opacity="0.7"
                >
                  <title>{`${point.issueKey}: (${point.xValue.toFixed(1)}, ${point.yValue.toFixed(1)})`}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        <div style={styles.chartLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#0052CC' }} />
            <span style={styles.legendText}>Data Points ({report.dataPoints.length} issues)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendLine, borderTopColor: '#DE350B' }} />
            <span style={styles.legendText}>
              Trendline (y = {report.trendlineSlope.toFixed(2)}x + {report.trendlineIntercept.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Data Points Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Data Points</h3>
          <span style={styles.tableSubtitle}>
            Individual data points used in the correlation analysis
          </span>
        </div>

        {report.dataPoints.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No data points available.</p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={{ ...styles.th, width: '120px' }}>Issue Key</th>
                    <th style={{ ...styles.th, width: '40%' }}>Label</th>
                    <th style={{ ...styles.th, width: '120px' }}>{report.xAxisLabel}</th>
                    <th style={{ ...styles.th, width: '120px' }}>{report.yAxisLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDataPoints.map((point, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}>
                        <a href={`#${point.issueKey}`} style={styles.issueKey} onClick={(e) => e.preventDefault()}>
                          {point.issueKey}
                        </a>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.labelText}>{point.label || '-'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.valueText}>{point.xValue.toFixed(1)}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.valueText}>{point.yValue.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={report.dataPoints.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="data points"
            />
          </>
        )}
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel="Correlation (r)"
        valueFormatter={(team: SimilarTeamComparison) => team.value.toFixed(3)}
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
  strengthBadge: {
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  comparisonCard: {
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px',
  },
  comparisonDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  chartHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  chartTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  chartSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  scatterPlot: {
    padding: '24px',
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
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendLine: {
    width: '24px',
    height: '0',
    borderTop: '2px dashed',
  },
  legendText: {
    fontSize: '12px',
    color: '#5E6C84',
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
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  issueKey: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0052CC',
    textDecoration: 'none',
  },
  labelText: {
    fontSize: '13px',
    color: '#172B4D',
  },
  valueText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
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
};

export default CorrelationReport;
