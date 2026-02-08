import React, { useState } from 'react';
import { TimelineReport as TimelineReportType, SimilarTeamComparison } from '../../../../types/assessment';
import PaginationControls from '../shared/PaginationControls';
import SimilarTeamsTable from '../shared/SimilarTeamsTable';

interface TimelineReportProps {
  report: TimelineReportType;
}

const TimelineReport: React.FC<TimelineReportProps> = ({ report }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(report.events.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleEvents = report.events.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDurationColor = (days: number, average: number) => {
    if (days <= average * 0.5) return '#36B37E';  // Much better than average
    if (days <= average) return '#00B8D9';         // Better than average
    if (days <= average * 1.5) return '#FFAB00';   // Slightly worse
    return '#DE350B';                              // Much worse
  };

  const getDurationBadgeStyle = (days: number, average: number) => {
    const color = getDurationColor(days, average);
    return {
      backgroundColor: color + '15',
      color: color,
    };
  };

  // Calculate max duration for bar scaling
  const maxDuration = Math.max(...report.events.map(e => e.durationDays), report.benchmarkAverageDays);

  return (
    <div style={styles.container}>
      {/* Statistics Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Your Team</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Average Duration</span>
              <span style={{
                ...styles.statValue,
                color: getDurationColor(report.yourAverageDays, report.benchmarkAverageDays),
              }}>
                {report.yourAverageDays.toFixed(1)} days
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Median Duration</span>
              <span style={styles.statValue}>{report.yourMedianDays.toFixed(1)} days</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Events</span>
              <span style={styles.statValue}>{report.events.length}</span>
            </div>
          </div>
        </div>

        <div style={styles.statsCard}>
          <h4 style={styles.statsTitle}>Similar Teams Average</h4>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Average Duration</span>
              <span style={styles.statValue}>{report.benchmarkAverageDays.toFixed(1)} days</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Median Duration</span>
              <span style={styles.statValue}>{report.benchmarkMedianDays.toFixed(1)} days</span>
            </div>
          </div>
        </div>

        <div style={styles.comparisonCard}>
          <h4 style={styles.statsTitle}>Performance</h4>
          <div style={styles.comparisonContent}>
            {report.yourAverageDays <= report.benchmarkAverageDays ? (
              <span style={styles.comparisonGood}>
                {((1 - report.yourAverageDays / report.benchmarkAverageDays) * 100).toFixed(0)}% faster than similar teams
              </span>
            ) : (
              <span style={styles.comparisonBad}>
                {((report.yourAverageDays / report.benchmarkAverageDays - 1) * 100).toFixed(0)}% slower than similar teams
              </span>
            )}
            <p style={styles.comparisonDescription}>{report.description}</p>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>{report.timelineTitle}</h3>
          <span style={styles.chartSubtitle}>
            Duration visualization for each event
          </span>
        </div>

        <div style={styles.timelineContainer}>
          {/* Similar Teams Average line */}
          <div style={styles.benchmarkLine}>
            <span style={styles.benchmarkLabel}>
              Teams Avg: {report.benchmarkAverageDays.toFixed(1)} days
            </span>
            <div style={{
              ...styles.benchmarkMarker,
              left: `${(report.benchmarkAverageDays / maxDuration) * 100}%`,
            }} />
          </div>

          {/* Duration bars */}
          <div style={styles.barsContainer}>
            {visibleEvents.map((event, index) => (
              <div key={index} style={styles.eventRow}>
                <div style={styles.eventInfo}>
                  <a
                    href={`#${event.issueKey}`}
                    style={styles.eventKey}
                    onClick={(e) => e.preventDefault()}
                  >
                    {event.issueKey}
                  </a>
                  <span style={styles.eventSummary}>{event.summary}</span>
                </div>
                <div style={styles.barWrapper}>
                  <div style={{
                    ...styles.durationBar,
                    width: `${(event.durationDays / maxDuration) * 100}%`,
                    backgroundColor: getDurationColor(event.durationDays, report.benchmarkAverageDays),
                  }}>
                    <span style={styles.barLabel}>{event.durationDays} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chartLegend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#36B37E' }} />
            <span style={styles.legendText}>Excellent (≤50% of avg)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#00B8D9' }} />
            <span style={styles.legendText}>Good (≤100% of avg)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#FFAB00' }} />
            <span style={styles.legendText}>Fair (≤150% of avg)</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendColor, backgroundColor: '#DE350B' }} />
            <span style={styles.legendText}>Needs Improvement</span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>All Events</h3>
          <span style={styles.tableSubtitle}>
            Detailed list of all timeline events
          </span>
        </div>

        {report.events.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No events available.</p>
          </div>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={{ ...styles.th, width: '100px' }}>Issue Key</th>
                    <th style={{ ...styles.th, width: '40%' }}>Summary</th>
                    <th style={{ ...styles.th, width: '100px' }}>Date</th>
                    <th style={{ ...styles.th, width: '100px' }}>Duration</th>
                    <th style={{ ...styles.th, width: '100px' }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEvents.map((event, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.td}>
                        <a href={`#${event.issueKey}`} style={styles.issueKey} onClick={(e) => e.preventDefault()}>
                          {event.issueKey}
                        </a>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.summaryText}>{event.summary}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.dateText}>{formatDate(event.eventDate)}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.durationBadge,
                          ...getDurationBadgeStyle(event.durationDays, report.benchmarkAverageDays),
                        }}>
                          {event.durationDays} days
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryText}>{event.category || 'General'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={report.events.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="events"
            />
          </>
        )}
      </div>

      {/* Similar Teams Comparison */}
      <SimilarTeamsTable
        teams={report.similarTeams}
        valueLabel="Avg Duration (days)"
        valueFormatter={(team: SimilarTeamComparison) => `${team.value.toFixed(1)} days`}
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
  timelineContainer: {
    padding: '24px',
  },
  benchmarkLine: {
    position: 'relative',
    height: '30px',
    marginBottom: '16px',
    borderBottom: '2px dashed #DE350B',
  },
  benchmarkLabel: {
    position: 'absolute',
    top: '0',
    right: '0',
    fontSize: '11px',
    color: '#DE350B',
    fontWeight: 600,
  },
  benchmarkMarker: {
    position: 'absolute',
    bottom: '-6px',
    width: '12px',
    height: '12px',
    backgroundColor: '#DE350B',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  eventInfo: {
    width: '200px',
    flexShrink: 0,
  },
  eventKey: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    textDecoration: 'none',
    marginBottom: '2px',
  },
  eventSummary: {
    fontSize: '11px',
    color: '#6B778C',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  barWrapper: {
    flex: 1,
    height: '24px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  durationBar: {
    height: '100%',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '8px',
    minWidth: '50px',
    transition: 'width 0.3s ease',
  },
  barLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
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
    fontSize: '11px',
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
  summaryText: {
    fontSize: '13px',
    color: '#172B4D',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  dateText: {
    fontSize: '12px',
    color: '#5E6C84',
  },
  durationBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  categoryText: {
    fontSize: '12px',
    color: '#5E6C84',
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

export default TimelineReport;
