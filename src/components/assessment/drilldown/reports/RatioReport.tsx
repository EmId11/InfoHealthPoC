import React from 'react';
import { RatioReport as RatioReportType, SimilarTeamComparison } from '../../../../types/assessment';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface RatioReportProps {
  report: RatioReportType;
}

const RatioReport: React.FC<RatioReportProps> = ({ report }) => {
  const totalYourPercentage = report.segments.reduce((sum, s) => sum + s.yourPercentage, 0);
  const totalBenchmarkPercentage = report.segments.reduce((sum, s) => sum + s.benchmarkPercentage, 0);

  const getRatioComparison = () => {
    const diff = report.yourRatio - report.benchmarkRatio;
    const percentDiff = (Math.abs(diff) / report.benchmarkRatio) * 100;
    return {
      diff,
      percentDiff,
      isBetter: diff <= 0,  // Lower ratio is typically better
    };
  };

  const comparison = getRatioComparison();

  return (
    <div style={styles.container}>
      {/* Statistics Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Your Team</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Ratio</span>
              <span style={styles.statValueLarge}>{report.yourDisplayRatio}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Count</span>
              <span style={styles.statValue}>{report.yourTotal}</span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Similar Teams Average</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Ratio</span>
              <span style={styles.statValueLarge}>{report.benchmarkDisplayRatio}</span>
            </div>
          </div>
        </div>

        <div style={styles.comparisonCard}>
          <h4 style={styles.statsTitle}>Comparison</h4>
          <div style={styles.comparisonContent}>
            {comparison.isBetter ? (
              <span style={styles.comparisonGood}>
                {comparison.percentDiff.toFixed(0)}% better than similar teams
              </span>
            ) : (
              <span style={styles.comparisonBad}>
                {comparison.percentDiff.toFixed(0)}% higher than similar teams
              </span>
            )}
            <p style={styles.comparisonDescription}>{report.description}</p>
          </div>
        </div>
      </div>

      {/* Ratio Visualization */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>{report.ratioTitle}</h3>
          <span style={styles.chartSubtitle}>
            Breakdown comparison between your team and similar teams
          </span>
        </div>

        <div style={styles.chartContent}>
          {/* Stacked bar comparison */}
          <div style={styles.stackedBarsContainer}>
            {/* Your team bar */}
            <div style={styles.barRow}>
              <span style={styles.barRowLabel}>Your Team</span>
              <div style={styles.stackedBar}>
                {report.segments.map((segment, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.stackedSegment,
                      width: `${segment.yourPercentage}%`,
                      backgroundColor: segment.color,
                    }}
                    title={`${segment.label}: ${segment.yourPercentage.toFixed(1)}%`}
                  >
                    {segment.yourPercentage >= 8 && (
                      <span style={styles.segmentLabel}>{segment.yourPercentage.toFixed(0)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Teams bar */}
            <div style={styles.barRow}>
              <span style={styles.barRowLabel}>Teams Avg</span>
              <div style={styles.stackedBar}>
                {report.segments.map((segment, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.stackedSegment,
                      width: `${segment.benchmarkPercentage}%`,
                      backgroundColor: segment.color,
                    }}
                    title={`${segment.label}: ${segment.benchmarkPercentage.toFixed(1)}%`}
                  >
                    {segment.benchmarkPercentage >= 8 && (
                      <span style={styles.segmentLabel}>{segment.benchmarkPercentage.toFixed(0)}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={styles.segmentLegend}>
            {report.segments.map((segment, index) => (
              <div key={index} style={styles.legendItem}>
                <span style={{ ...styles.legendColor, backgroundColor: segment.color }} />
                <span style={styles.legendText}>{segment.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Detailed Breakdown</h3>
          <span style={styles.tableSubtitle}>
            Segment-by-segment comparison
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={{ ...styles.th, width: '30%' }}>Segment</th>
                <th style={{ ...styles.th, width: '15%' }}>Your Count</th>
                <th style={{ ...styles.th, width: '20%' }}>Your %</th>
                <th style={{ ...styles.th, width: '20%' }}>Teams %</th>
                <th style={{ ...styles.th, width: '15%' }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {report.segments.map((segment, index) => {
                const diff = segment.yourPercentage - segment.benchmarkPercentage;
                return (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.segmentCell}>
                        <span style={{ ...styles.segmentDot, backgroundColor: segment.color }} />
                        <span style={styles.segmentName}>{segment.label}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countText}>{segment.yourValue}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.percentageCell}>
                        <div style={styles.miniBar}>
                          <div style={{
                            ...styles.miniBarFill,
                            width: `${segment.yourPercentage}%`,
                            backgroundColor: segment.color,
                          }} />
                        </div>
                        <span style={styles.percentageText}>{segment.yourPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.percentageCell}>
                        <div style={styles.miniBar}>
                          <div style={{
                            ...styles.miniBarFill,
                            width: `${segment.benchmarkPercentage}%`,
                            backgroundColor: segment.color,
                            opacity: 0.5,
                          }} />
                        </div>
                        <span style={styles.percentageText}>{segment.benchmarkPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.diffText,
                        color: Math.abs(diff) < 3 ? '#6B778C' : diff > 0 ? '#DE350B' : '#36B37E',
                      }}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={styles.footerRow}>
                <td style={styles.td}>
                  <span style={styles.totalLabel}>Total</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.totalValue}>{report.yourTotal}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.totalValue}>{totalYourPercentage.toFixed(1)}%</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.totalValue}>{totalBenchmarkPercentage.toFixed(1)}%</span>
                </td>
                <td style={styles.td}>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Donut Charts */}
      <div style={styles.donutGrid}>
        <div style={styles.donutCard}>
          <h4 style={styles.donutTitle}>Your Team Distribution</h4>
          <div style={styles.donutContainer}>
            <svg viewBox="0 0 100 100" style={styles.donutSvg}>
              {(() => {
                let currentAngle = -90;
                return report.segments.map((segment, index) => {
                  const angle = (segment.yourPercentage / 100) * 360;
                  const startAngle = currentAngle;
                  currentAngle += angle;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = ((startAngle + angle) * Math.PI) / 180;

                  const x1 = 50 + 35 * Math.cos(startRad);
                  const y1 = 50 + 35 * Math.sin(startRad);
                  const x2 = 50 + 35 * Math.cos(endRad);
                  const y2 = 50 + 35 * Math.sin(endRad);

                  const largeArcFlag = angle > 180 ? 1 : 0;

                  const pathData = segment.yourPercentage >= 100
                    ? `M 50 15 A 35 35 0 1 1 49.99 15 Z`
                    : `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={segment.color}
                    />
                  );
                });
              })()}
              <circle cx="50" cy="50" r="20" fill="white" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#172B4D">
                {report.yourDisplayRatio}
              </text>
            </svg>
          </div>
        </div>

        <div style={styles.donutCard}>
          <h4 style={styles.donutTitle}>Similar Teams Distribution</h4>
          <div style={styles.donutContainer}>
            <svg viewBox="0 0 100 100" style={styles.donutSvg}>
              {(() => {
                let currentAngle = -90;
                return report.segments.map((segment, index) => {
                  const angle = (segment.benchmarkPercentage / 100) * 360;
                  const startAngle = currentAngle;
                  currentAngle += angle;

                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = ((startAngle + angle) * Math.PI) / 180;

                  const x1 = 50 + 35 * Math.cos(startRad);
                  const y1 = 50 + 35 * Math.sin(startRad);
                  const x2 = 50 + 35 * Math.cos(endRad);
                  const y2 = 50 + 35 * Math.sin(endRad);

                  const largeArcFlag = angle > 180 ? 1 : 0;

                  const pathData = segment.benchmarkPercentage >= 100
                    ? `M 50 15 A 35 35 0 1 1 49.99 15 Z`
                    : `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={segment.color}
                      opacity="0.7"
                    />
                  );
                });
              })()}
              <circle cx="50" cy="50" r="20" fill="white" />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#172B4D">
                {report.benchmarkDisplayRatio}
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel="Ratio"
        valueFormatter={(team: SimilarTeamComparison) => team.displayValue}
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
  statValueLarge: {
    fontSize: '24px',
    fontWeight: 700,
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
    gap: '8px',
  },
  comparisonGood: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#36B37E',
  },
  comparisonBad: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#DE350B',
  },
  comparisonDescription: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
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
  chartContent: {
    padding: '24px',
  },
  stackedBarsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  barRowLabel: {
    width: '100px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    flexShrink: 0,
  },
  stackedBar: {
    flex: 1,
    display: 'flex',
    height: '40px',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: '#F4F5F7',
  },
  stackedSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'width 0.3s ease',
  },
  segmentLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  segmentLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
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
  segmentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  segmentDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  segmentName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  countText: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  percentageCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  miniBar: {
    width: '60px',
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  percentageText: {
    fontSize: '12px',
    color: '#5E6C84',
    minWidth: '40px',
  },
  diffText: {
    fontSize: '13px',
    fontWeight: 600,
  },
  footerRow: {
    backgroundColor: '#FAFBFC',
    borderTop: '2px solid #EBECF0',
  },
  totalLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  totalValue: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#172B4D',
  },
  donutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  donutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #DFE1E6',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
  },
  donutTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  donutContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSvg: {
    width: '160px',
    height: '160px',
  },
};

export default RatioReport;
