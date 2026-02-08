import React from 'react';
import { ActionPlanSection, ActionPlanItem } from '../../../types/actionPlan';
import { DimensionResult } from '../../../types/assessment';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import ArrowUpIcon from '@atlaskit/icon/glyph/arrow-up';
import ClockIcon from '@atlaskit/icon/glyph/recent';

interface ActionPlanAnalyticsProps {
  sections: ActionPlanSection[];
  dimensions: DimensionResult[];
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
}

interface DimensionActionCount {
  dimensionKey: string;
  dimensionName: string;
  total: number;
  completed: number;
  pending: number;
}

const ActionPlanAnalytics: React.FC<ActionPlanAnalyticsProps> = ({
  sections,
  dimensions,
  completedCount,
  inProgressCount,
  totalCount,
}) => {
  const pendingCount = totalCount - completedCount - inProgressCount;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // All items flattened
  const allItems = sections.flatMap(s => s.items);

  // Effort distribution
  const effortStats = {
    low: allItems.filter(i => i.recommendation.effort === 'low'),
    medium: allItems.filter(i => i.recommendation.effort === 'medium'),
    high: allItems.filter(i => i.recommendation.effort === 'high'),
  };

  // Impact distribution
  const impactStats = {
    high: allItems.filter(i => i.recommendation.impact === 'high'),
    medium: allItems.filter(i => i.recommendation.impact === 'medium'),
    low: allItems.filter(i => i.recommendation.impact === 'low'),
  };

  // Dimension focus - use sections order (already in priority order from builder)
  const dimensionStats: DimensionActionCount[] = sections.map(section => ({
    dimensionKey: section.dimensionKey,
    dimensionName: section.dimensionName,
    total: section.items.length,
    completed: section.items.filter(i => i.status === 'done').length,
    pending: section.items.filter(i => i.status === 'pending').length,
  }));

  // Quick wins: high impact, low effort
  const quickWins = allItems.filter(
    i => i.recommendation.impact === 'high' && i.recommendation.effort === 'low'
  );
  const quickWinsCompleted = quickWins.filter(i => i.status === 'done').length;
  const quickWinsPending = quickWins.filter(i => i.status === 'pending').length;

  // Velocity mock data (in real app, this would come from timestamps)
  const velocityData = {
    completedThisWeek: Math.min(completedCount, 3),
    completedLastWeek: Math.min(completedCount, 2),
    avgDaysToComplete: completedCount > 0 ? 4.5 : 0,
    lastCompletedAgo: completedCount > 0 ? '2 days ago' : null,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Execution Analytics</h3>
      </div>

      {/* Execution Overview */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Progress Overview</h4>
        <div style={styles.overviewGrid}>
          {/* Donut-style progress */}
          <div style={styles.progressRing}>
            <svg viewBox="0 0 100 100" style={styles.progressSvg}>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F4F5F7"
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#36B37E"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${completionPercent * 2.51} 251`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={styles.progressRingCenter}>
              <span style={styles.progressRingPercent}>{completionPercent}%</span>
              <span style={styles.progressRingLabel}>complete</span>
            </div>
          </div>

          {/* Status counts */}
          <div style={styles.statusCounts}>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusDot, backgroundColor: '#36B37E' }} />
              <span style={styles.statusLabel}>Done</span>
              <span style={styles.statusValue}>{completedCount}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusDot, backgroundColor: '#0052CC' }} />
              <span style={styles.statusLabel}>In Progress</span>
              <span style={styles.statusValue}>{inProgressCount}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={{ ...styles.statusDot, backgroundColor: '#DFE1E6' }} />
              <span style={styles.statusLabel}>Pending</span>
              <span style={styles.statusValue}>{pendingCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Velocity Metrics */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Velocity</h4>
        <div style={styles.velocityGrid}>
          <div style={styles.velocityCard}>
            <div style={styles.velocityIcon}>
              <CheckCircleIcon label="" size="small" primaryColor="#36B37E" />
            </div>
            <div style={styles.velocityContent}>
              <span style={styles.velocityValue}>{velocityData.completedThisWeek}</span>
              <span style={styles.velocityLabel}>this week</span>
            </div>
          </div>
          <div style={styles.velocityCard}>
            <div style={styles.velocityIcon}>
              <ClockIcon label="" size="small" primaryColor="#6B778C" />
            </div>
            <div style={styles.velocityContent}>
              <span style={styles.velocityValue}>
                {velocityData.avgDaysToComplete > 0 ? `${velocityData.avgDaysToComplete}d` : '—'}
              </span>
              <span style={styles.velocityLabel}>avg. to complete</span>
            </div>
          </div>
        </div>
        {velocityData.lastCompletedAgo && (
          <p style={styles.lastCompleted}>
            Last completed: <strong>{velocityData.lastCompletedAgo}</strong>
          </p>
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Dimension Progress - in user's priority order */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Priority Areas</h4>
        <p style={styles.sectionSubtitle}>Progress by prioritized dimension</p>
        <div style={styles.dimensionList}>
          {dimensionStats.map((dim, index) => (
            <div key={dim.dimensionKey} style={styles.dimensionRow}>
              <span style={styles.dimensionRank}>{index + 1}</span>
              <div style={styles.dimensionInfo}>
                <span style={styles.dimensionName}>{dim.dimensionName}</span>
                <div style={styles.dimensionBar}>
                  <div
                    style={{
                      ...styles.dimensionBarFill,
                      width: dim.total > 0 ? `${(dim.completed / dim.total) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
              <span style={styles.dimensionCount}>{dim.completed}/{dim.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Quick Wins */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Quick Wins</h4>
        <p style={styles.quickWinsDesc}>High impact, low effort actions</p>
        <div style={styles.quickWinsStats}>
          <div style={styles.quickWinStat}>
            <span style={styles.quickWinValue}>{quickWinsCompleted}</span>
            <span style={styles.quickWinLabel}>completed</span>
          </div>
          <div style={styles.quickWinDivider} />
          <div style={styles.quickWinStat}>
            <span style={{ ...styles.quickWinValue, color: quickWinsPending > 0 ? '#FF8B00' : '#6B778C' }}>
              {quickWinsPending}
            </span>
            <span style={styles.quickWinLabel}>remaining</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Effort Distribution */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Effort Distribution</h4>
        <div style={styles.effortBars}>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>Low</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(effortStats.low.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#36B37E',
                }}
              />
            </div>
            <span style={styles.effortCount}>{effortStats.low.length}</span>
          </div>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>Medium</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(effortStats.medium.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#FFAB00',
                }}
              />
            </div>
            <span style={styles.effortCount}>{effortStats.medium.length}</span>
          </div>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>High</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(effortStats.high.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#DE350B',
                }}
              />
            </div>
            <span style={styles.effortCount}>{effortStats.high.length}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Impact Distribution */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Impact Distribution</h4>
        <div style={styles.effortBars}>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>High</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(impactStats.high.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#36B37E',
                }}
              />
            </div>
            <span style={styles.effortCount}>{impactStats.high.length}</span>
          </div>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>Medium</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(impactStats.medium.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#FFAB00',
                }}
              />
            </div>
            <span style={styles.effortCount}>{impactStats.medium.length}</span>
          </div>
          <div style={styles.effortRow}>
            <span style={styles.effortLabel}>Low</span>
            <div style={styles.effortBar}>
              <div
                style={{
                  ...styles.effortBarFill,
                  width: allItems.length > 0 ? `${(impactStats.low.length / allItems.length) * 100}%` : '0%',
                  backgroundColor: '#6B778C',
                }}
              />
            </div>
            <span style={styles.effortCount}>{impactStats.low.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #E4E6EB',
    backgroundColor: '#FAFBFC',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  section: {
    padding: '16px 20px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionSubtitle: {
    margin: '-8px 0 12px 0',
    fontSize: '11px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E4E6EB',
    margin: '0 20px',
  },

  // Overview
  overviewGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  progressRing: {
    position: 'relative',
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  progressSvg: {
    width: '100%',
    height: '100%',
  },
  progressRingCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressRingPercent: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  progressRingLabel: {
    fontSize: '9px',
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  statusCounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: '12px',
    color: '#5E6C84',
    flex: 1,
  },
  statusValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },

  // Priority
  priorityBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  priorityRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  priorityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  priorityLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#172B4D',
    flex: 1,
  },
  priorityCount: {
    fontSize: '11px',
    color: '#6B778C',
  },
  priorityBar: {
    height: '6px',
    backgroundColor: '#F4F5F7',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  priorityBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },

  // Velocity
  velocityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  velocityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#F7F8F9',
    borderRadius: '8px',
  },
  velocityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  velocityContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  velocityValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1.2,
  },
  velocityLabel: {
    fontSize: '10px',
    color: '#6B778C',
  },
  lastCompleted: {
    margin: '10px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
  },

  // Dimension
  dimensionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  dimensionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dimensionRank: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dimensionInfo: {
    flex: 1,
    minWidth: 0,
  },
  dimensionName: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dimensionBar: {
    height: '4px',
    backgroundColor: '#F4F5F7',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  dimensionBarFill: {
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '2px',
  },
  dimensionCount: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
    flexShrink: 0,
  },

  // Quick Wins
  quickWinsDesc: {
    margin: '0 0 12px 0',
    fontSize: '11px',
    color: '#6B778C',
  },
  quickWinsStats: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '12px',
    backgroundColor: '#F7F8F9',
    borderRadius: '8px',
  },
  quickWinStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  quickWinValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#36B37E',
  },
  quickWinLabel: {
    fontSize: '10px',
    color: '#6B778C',
  },
  quickWinDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#DFE1E6',
  },

  // Effort / Impact bars
  effortBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  effortRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  effortLabel: {
    width: '50px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#5E6C84',
    flexShrink: 0,
  },
  effortBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  effortBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  effortCount: {
    width: '24px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'right',
    flexShrink: 0,
  },
};

export default ActionPlanAnalytics;
