import React from 'react';
import { DistributionReport as DistributionReportType, SimilarTeamComparison } from '../../../../types/assessment';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface DistributionReportProps {
  report: DistributionReportType;
}

const DistributionReport: React.FC<DistributionReportProps> = ({ report }) => {
  const maxPercentage = Math.max(
    ...report.buckets.map(b => Math.max(b.yourPercentage, b.benchmarkPercentage))
  );

  return (
    <div style={styles.container}>
      {/* Statistics Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Your Team</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Mean</span>
              <span style={styles.statValue}>{report.yourMean.toFixed(1)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Median</span>
              <span style={styles.statValue}>{report.yourMedian.toFixed(1)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Mode</span>
              <span style={styles.statValue}>{report.yourMode}</span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Similar Teams Average</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Mean</span>
              <span style={styles.statValue}>{report.benchmarkMean.toFixed(1)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Median</span>
              <span style={styles.statValue}>{report.benchmarkMedian.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div style={styles.comparisonCard}>
          <h4 style={styles.statsTitle}>Distribution Insight</h4>
          <p style={styles.comparisonDescription}>{report.description}</p>
        </div>
      </div>

      {/* Histogram Chart */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>{report.distributionTitle}</h3>
          <span style={styles.chartSubtitle}>
            Comparing your distribution against similar teams
          </span>
        </div>

        <div style={styles.chartArea}>
          <div style={styles.yAxisLabel}>{report.yAxisLabel}</div>

          <div style={styles.histogramContainer}>
            {/* Y-axis gridlines */}
            <div style={styles.gridlines}>
              {[100, 75, 50, 25, 0].map(percent => (
                <div key={percent} style={styles.gridline}>
                  <span style={styles.gridlineLabel}>
                    {Math.round((percent / 100) * maxPercentage)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Bars */}
            <div style={styles.barsContainer}>
              {report.buckets.map((bucket, index) => (
                <div key={index} style={styles.barGroup}>
                  <div style={styles.barsWrapper}>
                    {/* Your bar */}
                    <div
                      style={{
                        ...styles.bar,
                        ...styles.yourBar,
                        height: `${(bucket.yourPercentage / maxPercentage) * 100}%`,
                      }}
                      title={`Your team: ${bucket.yourPercentage.toFixed(1)}% (${bucket.yourCount} items)`}
                    >
                      <span style={styles.barValue}>
                        {bucket.yourPercentage > 5 ? `${bucket.yourPercentage.toFixed(0)}%` : ''}
                      </span>
                    </div>
                    {/* Benchmark bar */}
                    <div
                      style={{
                        ...styles.bar,
                        ...styles.benchmarkBar,
                        height: `${(bucket.benchmarkPercentage / maxPercentage) * 100}%`,
                      }}
                      title={`Similar Teams: ${bucket.benchmarkPercentage.toFixed(1)}%`}
                    >
                      <span style={styles.barValue}>
                        {bucket.benchmarkPercentage > 5 ? `${bucket.benchmarkPercentage.toFixed(0)}%` : ''}
                      </span>
                    </div>
                  </div>
                  <span style={styles.bucketLabel}>{bucket.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.xAxisLabel}>{report.xAxisLabel}</div>
        </div>

        <div style={styles.chartLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#0052CC' }} />
            <span style={styles.legendText}>Your Team</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#36B37E' }} />
            <span style={styles.legendText}>Similar Teams</span>
          </div>
        </div>
      </div>

      {/* Distribution Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Distribution Breakdown</h3>
          <span style={styles.tableSubtitle}>
            Detailed view of each bucket in the distribution
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={{ ...styles.th, width: '25%' }}>Range</th>
                <th style={{ ...styles.th, width: '15%' }}>Your Count</th>
                <th style={{ ...styles.th, width: '20%' }}>Your %</th>
                <th style={{ ...styles.th, width: '20%' }}>Teams %</th>
                <th style={{ ...styles.th, width: '20%' }}>Difference</th>
              </tr>
            </thead>
            <tbody>
              {report.buckets.map((bucket, index) => {
                const diff = bucket.yourPercentage - bucket.benchmarkPercentage;
                return (
                  <tr key={index} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.rangeText}>{bucket.label}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.countText}>{bucket.yourCount}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.percentageCell}>
                        <div style={styles.miniBar}>
                          <div style={{
                            ...styles.miniBarFill,
                            width: `${bucket.yourPercentage}%`,
                            backgroundColor: '#0052CC',
                          }} />
                        </div>
                        <span style={styles.percentageText}>{bucket.yourPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.percentageCell}>
                        <div style={styles.miniBar}>
                          <div style={{
                            ...styles.miniBarFill,
                            width: `${bucket.benchmarkPercentage}%`,
                            backgroundColor: '#36B37E',
                          }} />
                        </div>
                        <span style={styles.percentageText}>{bucket.benchmarkPercentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.diffText,
                        color: diff > 5 ? '#DE350B' : diff < -5 ? '#36B37E' : '#6B778C',
                      }}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel="Distribution Score"
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
  chartArea: {
    padding: '24px',
    position: 'relative',
  },
  yAxisLabel: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%) rotate(-90deg)',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  xAxisLabel: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  histogramContainer: {
    position: 'relative',
    marginLeft: '40px',
    height: '240px',
  },
  gridlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  gridline: {
    borderBottom: '1px solid #EBECF0',
    position: 'relative',
    flex: 1,
  },
  gridlineLabel: {
    position: 'absolute',
    left: '-36px',
    bottom: '-8px',
    fontSize: '10px',
    color: '#6B778C',
  },
  barsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '216px',
    paddingBottom: '24px',
    position: 'relative',
    zIndex: 1,
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    maxWidth: '80px',
  },
  barsWrapper: {
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '24px',
    minHeight: '4px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '4px',
  },
  yourBar: {
    backgroundColor: '#0052CC',
  },
  benchmarkBar: {
    backgroundColor: '#36B37E',
  },
  barValue: {
    fontSize: '9px',
    fontWeight: 600,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
  bucketLabel: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#5E6C84',
    textAlign: 'center',
    maxWidth: '60px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  rangeText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  countText: {
    fontSize: '13px',
    color: '#172B4D',
    fontWeight: 600,
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
};

export default DistributionReport;
