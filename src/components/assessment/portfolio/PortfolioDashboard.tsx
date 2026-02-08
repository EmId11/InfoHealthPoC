import React, { useState } from 'react';
import Button from '@atlaskit/button/standard-button';
import type { MultiTeamAssessmentResult } from '../../../types/multiTeamAssessment';
import PortfolioHealthHero from './PortfolioHealthHero';
import TeamRankingTable from './TeamRankingTable';
import TeamComparisonMatrix from './TeamComparisonMatrix';
import DimensionDistributionView from './DimensionDistributionView';
import OutlierHighlightPanel from './OutlierHighlightPanel';

interface PortfolioDashboardProps {
  result: MultiTeamAssessmentResult;
  onBack: () => void;
  onTeamClick: (teamId: string) => void;
  onDimensionClick: (dimensionKey: string) => void;
}

type TabKey = 'overview' | 'teams' | 'dimensions' | 'insights';

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  result,
  onBack,
  onTeamClick,
  onDimensionClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const { portfolioSummary, teamResults, crossTeamAnalysis, executiveSummary } = result;

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'teams', label: `Teams (${portfolioSummary.teamCount})` },
    { key: 'dimensions', label: 'Dimensions' },
    { key: 'insights', label: 'Insights' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={styles.tabContent}>
            <div style={styles.overviewGrid}>
              {/* Outliers Panel */}
              <div style={styles.panelFull}>
                <OutlierHighlightPanel
                  teamResults={teamResults}
                  crossTeamAnalysis={crossTeamAnalysis}
                  onTeamClick={onTeamClick}
                />
              </div>

              {/* Comparison Matrix */}
              <div style={styles.panelFull}>
                <h3 style={styles.sectionTitle}>Team Performance Matrix</h3>
                <TeamComparisonMatrix
                  matrix={crossTeamAnalysis.comparisonMatrix}
                  onTeamClick={onTeamClick}
                  onDimensionClick={onDimensionClick}
                />
              </div>

              {/* Common Gaps */}
              <div style={styles.panelHalf}>
                <h3 style={styles.sectionTitle}>Portfolio-Wide Gaps</h3>
                <div style={styles.gapsList}>
                  {crossTeamAnalysis.commonGaps.slice(0, 5).map((gap) => (
                    <div
                      key={gap.gapId}
                      style={styles.gapItem}
                      onClick={() => onDimensionClick(gap.dimensionKey)}
                    >
                      <div style={styles.gapHeader}>
                        <span style={styles.gapName}>{gap.dimensionName}</span>
                        {gap.isSystemicIssue && (
                          <span style={styles.systemicBadge}>Systemic</span>
                        )}
                      </div>
                      <div style={styles.gapMeta}>
                        <span style={styles.gapTeamCount}>
                          {gap.affectedTeamCount} teams ({gap.percentageOfTeams}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  {crossTeamAnalysis.commonGaps.length === 0 && (
                    <div style={styles.emptyState}>No common gaps identified</div>
                  )}
                </div>
              </div>

              {/* Trending Dimensions */}
              <div style={styles.panelHalf}>
                <h3 style={styles.sectionTitle}>Trending Dimensions</h3>
                <div style={styles.trendingList}>
                  {crossTeamAnalysis.trendingDimensions.slice(0, 5).map((trend) => (
                    <div
                      key={trend.dimensionKey}
                      style={styles.trendItem}
                      onClick={() => onDimensionClick(trend.dimensionKey)}
                    >
                      <span
                        style={{
                          ...styles.trendIcon,
                          color: trend.direction === 'improving' ? '#00875A' : '#DE350B',
                        }}
                      >
                        {trend.direction === 'improving' ? '↑' : '↓'}
                      </span>
                      <span style={styles.trendName}>{trend.dimensionName}</span>
                      <span style={styles.trendCount}>
                        {trend.teamsMoving} teams ({trend.percentageOfTeams}%)
                      </span>
                    </div>
                  ))}
                  {crossTeamAnalysis.trendingDimensions.length === 0 && (
                    <div style={styles.emptyState}>No significant trends detected</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'teams':
        return (
          <div style={styles.tabContent}>
            <TeamRankingTable teamResults={teamResults} onTeamClick={onTeamClick} />
          </div>
        );

      case 'dimensions':
        return (
          <div style={styles.tabContent}>
            <DimensionDistributionView
              dimensionAggregates={portfolioSummary.dimensionAggregates}
              teamResults={teamResults}
              onDimensionClick={onDimensionClick}
              onTeamClick={onTeamClick}
            />
          </div>
        );

      case 'insights':
        return (
          <div style={styles.tabContent}>
            <div style={styles.insightsGrid}>
              {/* Investment Priorities */}
              <div style={styles.insightSection}>
                <h3 style={styles.sectionTitle}>Investment Priorities</h3>
                <div style={styles.prioritiesList}>
                  {executiveSummary.investmentPriorities.map((priority, index) => (
                    <div key={priority.id} style={styles.priorityCard}>
                      <div style={styles.priorityRank}>{index + 1}</div>
                      <div style={styles.priorityContent}>
                        <h4 style={styles.priorityTitle}>{priority.title}</h4>
                        <p style={styles.priorityRationale}>{priority.rationale}</p>
                        <div style={styles.priorityMeta}>
                          <span style={styles.priorityImpact}>
                            {priority.teamsImpacted} teams impacted
                          </span>
                          <span
                            style={{
                              ...styles.impactBadge,
                              backgroundColor:
                                priority.estimatedImpact === 'transformative'
                                  ? '#DEEBFF'
                                  : priority.estimatedImpact === 'significant'
                                  ? '#E3FCEF'
                                  : '#F4F5F7',
                            }}
                          >
                            {priority.estimatedImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership Insights */}
              <div style={styles.insightSection}>
                <h3 style={styles.sectionTitle}>Key Insights</h3>
                <div style={styles.insightsList}>
                  {executiveSummary.insights.map((insight) => (
                    <div
                      key={insight.id}
                      style={{
                        ...styles.insightCard,
                        borderLeftColor:
                          insight.type === 'positive'
                            ? '#00875A'
                            : insight.type === 'concern'
                            ? '#DE350B'
                            : '#FF8B00',
                      }}
                    >
                      <div style={styles.insightHeader}>
                        <span
                          style={{
                            ...styles.insightType,
                            color:
                              insight.type === 'positive'
                                ? '#00875A'
                                : insight.type === 'concern'
                                ? '#DE350B'
                                : '#FF8B00',
                          }}
                        >
                          {insight.type === 'positive' && '✓'}
                          {insight.type === 'concern' && '!'}
                          {insight.type === 'opportunity' && '→'}
                        </span>
                        <span style={styles.insightTitle}>{insight.title}</span>
                      </div>
                      <p style={styles.insightDescription}>{insight.description}</p>
                      <div style={styles.insightAction}>
                        <span style={styles.actionLabel}>Suggested:</span>
                        <span style={styles.actionText}>{insight.suggestedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Summary */}
              <div style={styles.insightSection}>
                <h3 style={styles.sectionTitle}>Risk Summary</h3>
                <div style={styles.riskSummary}>
                  {executiveSummary.riskSummary.highRiskTeams.length > 0 ? (
                    <>
                      <div style={styles.riskAlert}>
                        <span style={styles.riskIcon}>⚠️</span>
                        <span>
                          {executiveSummary.riskSummary.criticalRiskCount} teams require
                          immediate attention
                        </span>
                      </div>
                      <div style={styles.riskTeamList}>
                        {executiveSummary.riskSummary.highRiskTeams.map((team) => (
                          <div
                            key={team.teamId}
                            style={styles.riskTeamItem}
                            onClick={() => onTeamClick(team.teamId)}
                          >
                            <span style={styles.riskTeamName}>{team.teamName}</span>
                            <span style={styles.riskConcern}>{team.primaryConcern}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={styles.noRiskMessage}>
                      <span style={styles.noRiskIcon}>✓</span>
                      <span>No critical risks identified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 10H5M5 10L10 15M5 10L10 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div style={styles.headerTitle}>
              <h1 style={styles.title}>{result.name}</h1>
              <span style={styles.subtitle}>
                {portfolioSummary.teamCount} teams assessed
                <span style={styles.dot}>•</span>
                {result.scope.scopeType === 'portfolio' && result.scope.portfolioName}
                {result.scope.scopeType === 'team-of-teams' && result.scope.teamOfTeamsName}
                {result.scope.scopeType === 'custom-selection' && 'Custom Selection'}
              </span>
            </div>
          </div>
          <div style={styles.headerActions}>
            <Button appearance="subtle">Export</Button>
            <Button appearance="subtle">Share</Button>
          </div>
        </div>
      </header>

      {/* Health Hero */}
      <PortfolioHealthHero summary={portfolioSummary} executiveSummary={executiveSummary} />

      {/* Main Content with Tabs */}
      <div style={styles.mainContent}>
        {/* Custom Tabs */}
        <div style={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.key ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E6E8EB',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#5E6C84',
    transition: 'all 0.15s ease',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B778C',
    marginTop: '2px',
  },
  dot: {
    margin: '0 8px',
    opacity: 0.5,
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '24px 32px',
  },
  tabList: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #E6E8EB',
    marginBottom: '0',
  },
  tabButton: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: '-1px',
  },
  tabButtonActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
    fontWeight: 600,
  },
  tabContent: {
    padding: '24px 0',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  panelFull: {
    gridColumn: '1 / -1',
  },
  panelHalf: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  gapsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  gapItem: {
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  gapHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  gapName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  systemicBadge: {
    padding: '2px 6px',
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  gapMeta: {
    fontSize: '12px',
    color: '#6B778C',
  },
  gapTeamCount: {},
  trendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  trendIcon: {
    fontSize: '16px',
    fontWeight: 700,
  },
  trendName: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  trendCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  emptyState: {
    padding: '24px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  insightSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
  },
  prioritiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  priorityCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  priorityRank: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  priorityRationale: {
    margin: '4px 0 8px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  priorityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  priorityImpact: {
    fontSize: '12px',
    color: '#6B778C',
  },
  impactBadge: {
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
    textTransform: 'capitalize',
    color: '#172B4D',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightCard: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    borderLeft: '4px solid',
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  insightType: {
    fontSize: '14px',
    fontWeight: 700,
  },
  insightTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  insightDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.4,
  },
  insightAction: {
    fontSize: '12px',
    color: '#6B778C',
  },
  actionLabel: {
    fontWeight: 500,
    marginRight: '4px',
  },
  actionText: {
    fontStyle: 'italic',
  },
  riskSummary: {},
  riskAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFEBE6',
    borderRadius: '6px',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#DE350B',
  },
  riskIcon: {
    fontSize: '16px',
  },
  riskTeamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  riskTeamItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  riskTeamName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  riskConcern: {
    fontSize: '12px',
    color: '#DE350B',
  },
  noRiskMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    backgroundColor: '#E3FCEF',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#006644',
  },
  noRiskIcon: {
    fontSize: '18px',
  },
};

export default PortfolioDashboard;
