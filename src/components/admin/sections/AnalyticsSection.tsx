import React, { useState } from 'react';
import { AdminAnalytics } from '../../../types/admin';
import InfoButton from '../../common/InfoButton';

interface AnalyticsSectionProps {
  analytics: AdminAnalytics;
}

type TimeRange = '7d' | '30d' | '90d';

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const { usageMetrics, activityOverTime, healthSummary } = analytics;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate max values for chart scaling
  const maxAssessments = Math.max(...activityOverTime.map(d => d.assessmentsCreated));
  const maxReports = Math.max(...activityOverTime.map(d => d.reportsViewed));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} data-tour="analytics-section">
        <div style={styles.headerContent}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>Analytics & Reports</h2>
            <InfoButton title="Analytics & Reports">
              <p>Monitor how teams are using the health assessment tool and track organizational health trends.</p>
              <p><strong>Usage Metrics:</strong> See how many users are active, assessments created, and reports viewed.</p>
              <p><strong>Activity Trends:</strong> Track usage patterns over time to identify adoption trends.</p>
              <p><strong>Health Summary:</strong> Get an overview of team health scores across the organization, including which teams are improving or need attention.</p>
              <p>Use this data to drive adoption and identify teams that could benefit from additional support.</p>
            </InfoButton>
          </div>
          <p style={styles.subtitle}>
            Monitor usage metrics, activity trends, and team health across your organization.
          </p>
        </div>
        <div style={styles.timeRangeSelector}>
          {(['7d', '30d', '90d'] as TimeRange[]).map(range => (
            <button
              key={range}
              style={{
                ...styles.timeRangeButton,
                ...(timeRange === range ? styles.timeRangeButtonActive : {}),
              }}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Metrics */}
      <div style={styles.metricsGrid} data-tour="usage-metrics">
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.metricContent}>
            <span style={styles.metricValue}>{usageMetrics.totalUsers}</span>
            <span style={styles.metricLabel}>Total Users</span>
          </div>
          <div style={styles.metricSubtext}>
            <span style={styles.activeIndicator}>{usageMetrics.activeUsers}</span> active in last 30 days
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12h8M8 8h5M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.metricContent}>
            <span style={styles.metricValue}>{usageMetrics.totalAssessments}</span>
            <span style={styles.metricLabel}>Total Assessments</span>
          </div>
          <div style={styles.metricSubtext}>
            <span style={styles.completedIndicator}>{usageMetrics.completedAssessments}</span> completed
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.metricContent}>
            <span style={styles.metricValue}>{usageMetrics.reportsViewed}</span>
            <span style={styles.metricLabel}>Reports Viewed</span>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.metricContent}>
            <span style={styles.metricValue}>{usageMetrics.avgSessionDuration}m</span>
            <span style={styles.metricLabel}>Avg Session Duration</span>
          </div>
          <div style={styles.metricSubtext}>
            <span style={styles.completedIndicator}>{usageMetrics.totalSessions.toLocaleString()}</span> total sessions
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div style={styles.chartSection} data-tour="activity-chart">
        <h3 style={styles.sectionTitle}>Activity Over Time</h3>
        <div style={styles.chartContainer}>
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#5243AA' }} />
              <span>Assessments Created</span>
            </div>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#00875A' }} />
              <span>Reports Viewed</span>
            </div>
          </div>

          <div style={styles.chart}>
            {activityOverTime.map((data, index) => (
              <div key={index} style={styles.chartColumn}>
                <div style={styles.barsContainer}>
                  <div
                    style={{
                      ...styles.bar,
                      backgroundColor: '#5243AA',
                      height: `${(data.assessmentsCreated / maxAssessments) * 100}%`,
                    }}
                    title={`${data.assessmentsCreated} assessments`}
                  />
                  <div
                    style={{
                      ...styles.bar,
                      backgroundColor: '#00875A',
                      height: `${(data.reportsViewed / maxReports) * 100}%`,
                    }}
                    title={`${data.reportsViewed} reports`}
                  />
                </div>
                <span style={styles.chartLabel}>{formatDate(data.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div style={styles.healthSection} data-tour="health-summary">
        <h3 style={styles.sectionTitle}>Team Health Summary</h3>
        <div style={styles.healthContent}>
          <div style={styles.healthScore}>
            <div style={styles.teamsAssessed}>
              <span style={styles.teamsCount}>{healthSummary.totalTeamsAssessed}</span>
              <span style={styles.teamsLabel}>Teams Assessed</span>
            </div>
          </div>

          <div style={styles.healthTrends}>
            <div style={styles.trendCard}>
              <div style={styles.trendHeader}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 15l5-5 3 3 5-8" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={styles.trendTitle}>Improving</span>
              </div>
              <span style={{ ...styles.trendValue, color: '#00875A' }}>
                {healthSummary.improvingTeams}
              </span>
              <span style={styles.trendSubtext}>teams showing improvement</span>
            </div>

            <div style={styles.trendCard}>
              <div style={styles.trendHeader}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 10h10" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={styles.trendTitle}>Stable</span>
              </div>
              <span style={{ ...styles.trendValue, color: '#6B778C' }}>
                {healthSummary.stableTeams}
              </span>
              <span style={styles.trendSubtext}>teams maintaining health</span>
            </div>

            <div style={styles.trendCard}>
              <div style={styles.trendHeader}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5l5 5 3-3 5 8" stroke="#DE350B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={styles.trendTitle}>Declining</span>
              </div>
              <span style={{ ...styles.trendValue, color: '#DE350B' }}>
                {healthSummary.decliningTeams}
              </span>
              <span style={styles.trendSubtext}>teams need attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div style={styles.footer}>
        <span style={styles.lastUpdated}>
          Last updated: {new Date(analytics.lastUpdated).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <button style={styles.refreshButton}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8A6 6 0 1 1 8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 2l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  timeRangeSelector: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '4px',
  },
  timeRangeButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
    color: '#5243AA',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#F3F0FF',
    color: '#5243AA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  metricContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: '14px',
    color: '#6B778C',
  },
  metricSubtext: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#6B778C',
  },
  activeIndicator: {
    fontWeight: 600,
    color: '#00875A',
  },
  completedIndicator: {
    fontWeight: 600,
    color: '#5243AA',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  chartLegend: {
    display: 'flex',
    gap: '24px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6B778C',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
  chart: {
    display: 'flex',
    gap: '8px',
    height: '200px',
    alignItems: 'flex-end',
  },
  chartColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  barsContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    width: '100%',
    height: '100%',
  },
  bar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease',
  },
  chartLabel: {
    fontSize: '11px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  healthSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  healthContent: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
  },
  healthScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  scoreCircle: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  scoreValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  scoreNumber: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#5243AA',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '11px',
    color: '#6B778C',
  },
  teamsAssessed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  teamsCount: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  teamsLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  healthTrends: {
    flex: 1,
    display: 'flex',
    gap: '16px',
  },
  trendCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trendHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  trendTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendValue: {
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: 1,
  },
  trendSubtext: {
    fontSize: '12px',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: '13px',
    color: '#6B778C',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
  },
};

export default AnalyticsSection;
