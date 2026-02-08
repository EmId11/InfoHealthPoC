// SinglePlanOverview - Comprehensive dashboard for a single improvement plan
// Uses the same visual patterns as PortfolioOverview for consistency

import React, { useMemo } from 'react';
import {
  ImprovementPlan,
  calculateSinglePlanMetrics,
  calculateSinglePlanDimensionCoverage,
  calculateSinglePlanVelocity,
  calculatePriorityProgress,
  calculateOutcomeProgressSummary,
  calculateAggregateInterventionProgress,
  getPriorityShortLabel,
  getPriorityColor,
  getInterventionTypeLabel,
  getInterventionTypeColor,
} from '../../types/improvementPlan';
import CompletionRing from './CompletionRing';
import DimensionCoverageGrid from './DimensionCoverageGrid';
import ProgressBreakdownCard from './ProgressBreakdownCard';
import VelocityCard from './VelocityCard';

interface SinglePlanOverviewProps {
  plan: ImprovementPlan;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const SinglePlanOverview: React.FC<SinglePlanOverviewProps> = ({
  plan,
  isExpanded,
  onToggleExpanded,
}) => {
  const planMetrics = useMemo(
    () => calculateSinglePlanMetrics(plan),
    [plan]
  );

  const dimensionCoverage = useMemo(
    () => calculateSinglePlanDimensionCoverage(plan),
    [plan]
  );

  const velocityMetrics = useMemo(
    () => calculateSinglePlanVelocity(plan),
    [plan]
  );

  const priorityProgress = useMemo(
    () => calculatePriorityProgress(plan.plays),
    [plan.plays]
  );

  const outcomeProgress = useMemo(
    () => calculateOutcomeProgressSummary(plan.plays, plan.outcomePriorities || []),
    [plan.plays, plan.outcomePriorities]
  );

  const interventionProgress = useMemo(
    () => calculateAggregateInterventionProgress([plan]),
    [plan]
  );

  // Transform for breakdown cards
  const priorityItems = priorityProgress
    .filter(p => p.totalPlays > 0)
    .map(p => ({
      label: getPriorityShortLabel(p.priority),
      completed: p.completedPlays,
      total: p.totalPlays,
      percentage: p.percentage,
      color: getPriorityColor(p.priority).text,
    }));

  const outcomeItems = outcomeProgress.map(o => ({
    label: o.name,
    completed: o.completed,
    total: o.total,
    percentage: o.percentage,
    color: '#5243AA',
  }));

  const interventionItems = interventionProgress
    .filter(i => i.totalPlays > 0)
    .map(i => ({
      label: getInterventionTypeLabel(i.type),
      completed: i.completedPlays,
      total: i.totalPlays,
      percentage: i.percentage,
      color: getInterventionTypeColor(i.type).text,
    }));

  return (
    <div style={styles.container}>
      {/* Collapsible header */}
      <button
        style={styles.collapseHeader}
        onClick={onToggleExpanded}
      >
        <div style={styles.collapseHeaderLeft}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="M6 8L10 12L14 8" stroke="#6B778C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={styles.collapseTitle}>Plan Progress</span>
        </div>
        <div style={styles.collapseSummary}>
          <span style={styles.summaryChip}>
            <strong>{planMetrics.completedPlays}</strong>/{planMetrics.totalPlays - planMetrics.skippedPlays} plays
          </span>
          <span style={{ ...styles.summaryChip, color: '#36B37E', fontWeight: 600 }}>
            {planMetrics.completionPercentage}% complete
          </span>
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          {/* Section 1: Coverage Metrics Row */}
          <div style={styles.metricsRow}>
            <div style={styles.metricCard}>
              <div style={{ ...styles.iconContainer, backgroundColor: '#DEEBFF', color: '#0052CC' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div style={styles.metricContent}>
                <span style={styles.metricValue}>{planMetrics.outcomesTargeted}</span>
                <span style={styles.metricLabel}>Outcomes</span>
              </div>
              <div style={styles.metricSubtext}>of {planMetrics.totalOutcomes} targeted</div>
            </div>

            <div style={styles.metricCard}>
              <div style={{ ...styles.iconContainer, backgroundColor: '#E3FCEF', color: '#006644' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M7 14l4-4 4 4 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={styles.metricContent}>
                <span style={styles.metricValue}>{planMetrics.dimensionsAffected}</span>
                <span style={styles.metricLabel}>Dimensions</span>
              </div>
              <div style={styles.metricSubtext}>affected</div>
            </div>

            <div style={styles.metricCard}>
              <div style={{ ...styles.iconContainer, backgroundColor: '#FFF0B3', color: '#B65C02' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" />
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                  <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={styles.metricContent}>
                <span style={styles.metricValue}>{planMetrics.totalPlays}</span>
                <span style={styles.metricLabel}>Total Plays</span>
              </div>
              <div style={styles.metricSubtext}>{planMetrics.completedPlays} completed</div>
            </div>
          </div>

          {/* Section 2: Overall Completion */}
          <div style={styles.completionSection}>
            <h4 style={styles.sectionTitle}>Overall Completion</h4>
            <div style={styles.completionContent}>
              <CompletionRing
                percentage={planMetrics.completionPercentage}
                size={100}
                strokeWidth={10}
              />
              <div style={styles.completionDetails}>
                <div style={styles.completionBar}>
                  <div style={styles.completionBarBackground}>
                    <div
                      style={{
                        ...styles.completionBarFillCompleted,
                        width: `${planMetrics.completionPercentage}%`,
                      }}
                    />
                    {planMetrics.inProgressPlays > 0 && (
                      <div
                        style={{
                          ...styles.completionBarFillProgress,
                          width: `${((planMetrics.inProgressPlays) / (planMetrics.totalPlays - planMetrics.skippedPlays)) * 100}%`,
                          left: `${planMetrics.completionPercentage}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
                <div style={styles.statusCounts}>
                  <div style={styles.statusCount}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#36B37E' }} />
                    <span>{planMetrics.completedPlays} Completed</span>
                  </div>
                  <div style={styles.statusCount}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#0052CC' }} />
                    <span>{planMetrics.inProgressPlays} In Progress</span>
                  </div>
                  <div style={styles.statusCount}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#5243AA' }} />
                    <span>{planMetrics.doNextPlays} Do Next</span>
                  </div>
                  <div style={styles.statusCount}>
                    <span style={{ ...styles.statusDot, backgroundColor: '#DFE1E6' }} />
                    <span>{planMetrics.backlogPlays} Backlog</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dimension Coverage Grid */}
          {dimensionCoverage.length > 0 && (
            <DimensionCoverageGrid
              dimensions={dimensionCoverage}
              totalDimensions={planMetrics.totalDimensions}
            />
          )}

          {/* Section 4: Progress Breakdowns + Velocity */}
          <div style={styles.breakdownsGrid}>
            {outcomeItems.length > 0 && (
              <ProgressBreakdownCard
                title="By Outcome"
                items={outcomeItems}
              />
            )}
            {priorityItems.length > 0 && (
              <ProgressBreakdownCard
                title="By Priority"
                items={priorityItems}
              />
            )}
            {interventionItems.length > 0 && (
              <ProgressBreakdownCard
                title="By Intervention Type"
                items={interventionItems}
              />
            )}
            <VelocityCard velocity={velocityMetrics} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E4E6EB',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  collapseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  collapseHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  collapseTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  collapseSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  summaryChip: {
    fontSize: '13px',
    color: '#6B778C',
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '0 20px 20px',
    borderTop: '1px solid #EBECF0',
    paddingTop: '20px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
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
  completionSection: {
    backgroundColor: '#FAFBFC',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  completionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  completionDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  completionBar: {
    width: '100%',
  },
  completionBarBackground: {
    position: 'relative',
    height: '12px',
    backgroundColor: '#EBECF0',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  completionBarFillCompleted: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  completionBarFillProgress: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#0052CC',
    transition: 'width 0.3s ease',
  },
  statusCounts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  statusCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#5E6C84',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  breakdownsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
};

export default SinglePlanOverview;
