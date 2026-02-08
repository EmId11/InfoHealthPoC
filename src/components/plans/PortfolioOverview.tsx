// PortfolioOverview - Comprehensive dashboard for improvement plans
// Shows coverage metrics, completion ring, dimension coverage grid, and velocity

import React, { useMemo } from 'react';
import {
  ImprovementPlan,
  calculateCoverageMetrics,
  calculateDimensionCoverage,
  calculateVelocityMetrics,
  calculateAggregatePriorityProgress,
  calculateAggregateOutcomeProgress,
  calculateAggregateInterventionProgress,
  getPriorityShortLabel,
  getPriorityColor,
  getInterventionTypeLabel,
  getInterventionTypeColor,
} from '../../types/improvementPlan';
import CoverageMetricsRow from './CoverageMetricsRow';
import CompletionRing from './CompletionRing';
import DimensionCoverageGrid from './DimensionCoverageGrid';
import ProgressBreakdownCard from './ProgressBreakdownCard';
import VelocityCard from './VelocityCard';

interface PortfolioOverviewProps {
  plans: ImprovementPlan[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  hideHeader?: boolean;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  plans,
  isExpanded,
  onToggleExpanded,
  hideHeader = false,
}) => {
  const coverageMetrics = useMemo(
    () => calculateCoverageMetrics(plans),
    [plans]
  );

  const dimensionCoverage = useMemo(
    () => calculateDimensionCoverage(plans),
    [plans]
  );

  const velocityMetrics = useMemo(
    () => calculateVelocityMetrics(plans),
    [plans]
  );

  const priorityProgress = useMemo(
    () => calculateAggregatePriorityProgress(plans),
    [plans]
  );

  const outcomeProgress = useMemo(
    () => calculateAggregateOutcomeProgress(plans),
    [plans]
  );

  const interventionProgress = useMemo(
    () => calculateAggregateInterventionProgress(plans),
    [plans]
  );

  // Calculate overall completion percentage
  const completionPercentage = coverageMetrics.totalPlays > 0
    ? Math.round((coverageMetrics.completedPlays / coverageMetrics.totalPlays) * 100)
    : 0;

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
    <div style={hideHeader ? styles.containerNoHeader : styles.container}>
      {/* Collapsible header - hidden when used as standalone tab */}
      {!hideHeader && (
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
            <span style={styles.collapseTitle}>Improvement Portfolio</span>
          </div>
          <div style={styles.collapseSummary}>
            <span style={styles.summaryChip}>
              {coverageMetrics.activePlans} plan{coverageMetrics.activePlans !== 1 ? 's' : ''}
            </span>
            <span style={styles.summaryChip}>
              <strong>{coverageMetrics.completedPlays}</strong>/{coverageMetrics.totalPlays} plays
            </span>
            <span style={{ ...styles.summaryChip, color: '#36B37E', fontWeight: 600 }}>
              {completionPercentage}% complete
            </span>
          </div>
        </button>
      )}

      {/* Expandable content - always shown when hideHeader is true */}
      {(isExpanded || hideHeader) && (
        <div style={hideHeader ? styles.expandedContentStandalone : styles.expandedContent}>
          {/* Section 1: Overview - Key Stats + Completion */}
          <div style={hideHeader ? styles.standaloneSection : undefined}>
            {hideHeader && (
              <div style={styles.standaloneSectionHeader}>
                <h3 style={styles.standaloneSectionTitle}>Overview</h3>
                <span style={styles.standaloneSectionSubtitle}>Key metrics across all plans</span>
              </div>
            )}
            <div style={hideHeader ? styles.standaloneSectionContent : undefined}>
              {/* Coverage Metrics Row */}
              <div style={styles.metricsWrapper}>
                <CoverageMetricsRow metrics={coverageMetrics} />
              </div>

              {/* Overall Completion */}
              <div style={{ ...styles.completionSection, marginTop: 24 }}>
                <h4 style={styles.sectionTitle}>Overall Completion</h4>
                <div style={styles.completionContent}>
                  <CompletionRing
                    percentage={completionPercentage}
                    size={100}
                    strokeWidth={10}
                  />
                  <div style={styles.completionDetails}>
                    <div style={styles.completionBar}>
                      <div style={styles.completionBarBackground}>
                        <div
                          style={{
                            ...styles.completionBarFillCompleted,
                            width: `${completionPercentage}%`,
                          }}
                        />
                        {coverageMetrics.inProgressPlays > 0 && (
                          <div
                            style={{
                              ...styles.completionBarFillProgress,
                              width: `${(coverageMetrics.inProgressPlays / coverageMetrics.totalPlays) * 100}%`,
                              left: `${completionPercentage}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div style={styles.statusCounts}>
                      <div style={styles.statusCount}>
                        <span style={{ ...styles.statusDot, backgroundColor: '#36B37E' }} />
                        <span>{coverageMetrics.completedPlays} Completed</span>
                      </div>
                      <div style={styles.statusCount}>
                        <span style={{ ...styles.statusDot, backgroundColor: '#0052CC' }} />
                        <span>{coverageMetrics.inProgressPlays} In Progress</span>
                      </div>
                      <div style={styles.statusCount}>
                        <span style={{ ...styles.statusDot, backgroundColor: '#DFE1E6' }} />
                        <span>{coverageMetrics.remainingPlays - coverageMetrics.inProgressPlays} Remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dimension Coverage Grid */}
          <div style={hideHeader ? styles.standaloneSection : undefined}>
            {hideHeader && (
              <div style={styles.standaloneSectionHeader}>
                <h3 style={styles.standaloneSectionTitle}>Dimension Coverage</h3>
                <span style={styles.standaloneSectionSubtitle}>Health dimensions targeted by your plays</span>
              </div>
            )}
            <div style={hideHeader ? styles.standaloneSectionContent : undefined}>
              <DimensionCoverageGrid
                dimensions={dimensionCoverage}
                totalDimensions={coverageMetrics.totalDimensions}
              />
            </div>
          </div>

          {/* Section 3: Progress Breakdowns + Velocity */}
          <div style={hideHeader ? styles.standaloneSection : undefined}>
            {hideHeader && (
              <div style={styles.standaloneSectionHeader}>
                <h3 style={styles.standaloneSectionTitle}>Progress Breakdown</h3>
                <span style={styles.standaloneSectionSubtitle}>Completion status by different categories</span>
              </div>
            )}
            <div style={hideHeader ? styles.standaloneSectionContent : undefined}>
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
  containerNoHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  expandedContentStandalone: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  standaloneSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: '1px solid #E4E6EB',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  standaloneSectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #F4F5F7',
    backgroundColor: '#FAFBFC',
  },
  standaloneSectionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: '#172B4D',
  },
  standaloneSectionSubtitle: {
    fontSize: 13,
    color: '#6B778C',
  },
  standaloneSectionContent: {
    padding: 20,
  },
  metricsWrapper: {
    marginBottom: 0,
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
    gap: '24px',
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

export default PortfolioOverview;
