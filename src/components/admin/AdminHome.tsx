import React, { useState } from 'react';
import { AppUser, SavedAssessment } from '../../types/home';
import { AdminState, AdminSection, OrganizationDefaults, ManagedUser, UserGroup, TeamAttributeConfig, OrgStructureSettings, AccessRequest, GroupAccessRule, UserGroupAccessRule } from '../../types/admin';
import { SetupType } from '../../types/adminSetup';
import { SavedReport } from '../../types/reports';
import { PersonaSwitcher } from '../persona';
import DefaultsSection from './sections/DefaultsSection';
import UsersSection from './sections/UsersSection';
import OrgStructureSection from './sections/OrgStructureSection';
import OrgHierarchySection from './sections/OrgHierarchySection';
import ReportsSection from './sections/ReportsSection';
import SetupBanner from './SetupBanner';
import { MOCK_TEAM_HEALTH_DATA, TeamHealthData, MOCK_ADMIN_OVERVIEW_STATS } from '../../constants/mockAdminData';
import { OutcomeOrgStats, OutcomeConfidenceLevel } from '../../types/admin';

interface AdminHomeProps {
  currentUser: AppUser;
  adminState: AdminState;
  onUpdateSection: (section: AdminSection) => void;
  onUpdateDefaults: (defaults: Partial<OrganizationDefaults>) => void;
  onUpdateUsers: (users: ManagedUser[]) => void;
  onUpdateGroups: (groups: UserGroup[]) => void;
  onUpdateGroupAccessRules: (rules: GroupAccessRule[]) => void;
  onUpdateUserGroupAccessRules: (rules: UserGroupAccessRule[]) => void;
  onUpdateAttributes: (config: TeamAttributeConfig) => void;
  onUpdateOrgStructureSettings: (settings: OrgStructureSettings) => void;
  onNavigateToCreator: () => void;
  onStartNewAssessment: () => void;
  onViewAssessment: (assessment: SavedAssessment) => void;
  onEditAssessment: (assessment: SavedAssessment) => void;
  onApproveAccessRequest: (requestId: string) => void;
  onDenyAccessRequest: (requestId: string, note?: string) => void;
  onStartSetupWizard: (setupType: SetupType) => void;
  // Reports handlers
  onCreateReport: (report: SavedReport) => void;
  onUpdateReport: (reportId: string, updates: Partial<SavedReport>) => void;
  onDeleteReport: (reportId: string) => void;
  onShareReport: (reportId: string) => string;
}

const AdminHome: React.FC<AdminHomeProps> = ({
  currentUser,
  adminState,
  onUpdateSection,
  onUpdateDefaults,
  onUpdateUsers,
  onUpdateGroups,
  onUpdateGroupAccessRules,
  onUpdateUserGroupAccessRules,
  onUpdateAttributes,
  onUpdateOrgStructureSettings,
  onNavigateToCreator,
  onStartNewAssessment,
  onViewAssessment,
  onEditAssessment,
  onApproveAccessRequest,
  onDenyAccessRequest,
  onStartSetupWizard,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onShareReport,
}) => {
  const { currentSection, analytics, users, organizationDefaults, teamAttributes, orgStructureSettings } = adminState;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (name: string) => name.split(' ')[0];

  // State for expanded tabs
  const [expandedTabs, setExpandedTabs] = useState<string[]>(['appSettings']);

  // Check if current section is an App Settings sub-section
  const isAppSettingsSection = (section: AdminSection) =>
    section === 'appSettings' ||
    section === 'appSettings.orgHierarchy' ||
    section === 'appSettings.jiraStandards' ||
    section === 'appSettings.teamAttributes';

  interface TabConfig {
    id: AdminSection;
    label: string;
    icon: React.ReactNode;
    children?: TabConfig[];
  }

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users & Access',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 16v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'appSettings',
      label: 'App Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
      children: [
        {
          id: 'appSettings.orgHierarchy',
          label: 'Org Hierarchy',
          icon: (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="6" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="12" y="9" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 5v2M3.5 9V8c0-.5.5-1 1-1h9c.5 0 1 .5 1 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          id: 'appSettings.jiraStandards',
          label: 'Jira Standards',
          icon: (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 9h6M6 6h4M6 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          id: 'appSettings.teamAttributes',
          label: 'Team Attributes',
          icon: (
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="6" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="12" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="12" y="12" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 6v4M9 10H3.5v2M9 10h5.5v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
      ],
    },
  ];

  const handleTabClick = (tab: TabConfig) => {
    if (tab.children && tab.children.length > 0) {
      // Toggle expand/collapse for parent tabs
      setExpandedTabs(prev =>
        prev.includes(tab.id)
          ? prev.filter(t => t !== tab.id)
          : [...prev, tab.id]
      );
    } else {
      // Navigate for leaf tabs
      onUpdateSection(tab.id);
    }
  };

  const { setupProgress } = adminState;

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'appSettings.jiraStandards':
        // Only show content if setup is completed, otherwise show banner only
        if (setupProgress.jiraStandards.status !== 'completed') {
          return (
            <SetupBanner
              title="Jira Standards"
              status={setupProgress.jiraStandards.status}
              currentStep={setupProgress.jiraStandards.currentStep}
              totalSteps={setupProgress.jiraStandards.totalSteps}
              onStartSetup={() => onStartSetupWizard('jiraStandards')}
            />
          );
        }
        return (
          <DefaultsSection
            defaults={organizationDefaults}
            onUpdate={onUpdateDefaults}
          />
        );
      case 'users':
        return (
          <UsersSection
            users={users}
            groups={adminState.userGroups}
            onUpdateUsers={onUpdateUsers}
            onUpdateGroups={onUpdateGroups}
            accessRequests={adminState.accessRequests}
            onApproveAccessRequest={onApproveAccessRequest}
            onDenyAccessRequest={onDenyAccessRequest}
            groupAccessRules={adminState.groupAccessRules}
            onUpdateGroupAccessRules={onUpdateGroupAccessRules}
            userGroupAccessRules={adminState.userGroupAccessRules}
            onUpdateUserGroupAccessRules={onUpdateUserGroupAccessRules}
          />
        );
      case 'reports':
        return <ReportsSection />;
      case 'appSettings.orgHierarchy':
        // Only show content if setup is completed, otherwise show banner only
        if (setupProgress.orgHierarchy.status !== 'completed') {
          return (
            <SetupBanner
              title="Organization Hierarchy"
              status={setupProgress.orgHierarchy.status}
              currentStep={setupProgress.orgHierarchy.currentStep}
              totalSteps={setupProgress.orgHierarchy.totalSteps}
              onStartSetup={() => onStartSetupWizard('orgHierarchy')}
            />
          );
        }
        return (
          <OrgHierarchySection
            categorization={teamAttributes}
            onUpdate={onUpdateAttributes}
            orgStructureSettings={orgStructureSettings}
            onUpdateSettings={onUpdateOrgStructureSettings}
          />
        );
      case 'appSettings.teamAttributes':
        // Only show content if setup is completed, otherwise show banner only
        if (setupProgress.teamAttributes.status !== 'completed') {
          return (
            <SetupBanner
              title="Team Attributes"
              status={setupProgress.teamAttributes.status}
              currentStep={setupProgress.teamAttributes.currentStep}
              totalSteps={setupProgress.teamAttributes.totalSteps}
              onStartSetup={() => onStartSetupWizard('teamAttributes')}
            />
          );
        }
        return (
          <OrgStructureSection
            categorization={teamAttributes}
            onUpdate={onUpdateAttributes}
          />
        );
      case 'appSettings':
        // Landing page for App Settings - show first sub-section
        onUpdateSection('appSettings.orgHierarchy');
        return null;
      case 'overview':
      default:
        return renderOverview();
    }
  };

  // Value-centric dashboard data
  const { outcomeStats, improvementJourney, dimensionGaps, outcomeTrends, adoptionFunnel, actionableAlerts } = MOCK_ADMIN_OVERVIEW_STATS;

  // Helper functions for confidence level styling
  const getConfidenceLevelColor = (level: OutcomeConfidenceLevel) => {
    switch (level) {
      case 'low': return '#DE350B';
      case 'moderate': return '#FF8B00';
      case 'high': return '#36B37E';
      case 'very-high': return '#006644';
    }
  };

  const getConfidenceLevelLabel = (level: OutcomeConfidenceLevel) => {
    switch (level) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'very-high': return 'Very High';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    const color = trend === 'improving' ? '#36B37E' : trend === 'declining' ? '#DE350B' : '#6B778C';
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {trend === 'improving' && (<><polyline points="3,18 8,13 12,16 21,6" /><polyline points="16,6 21,6 21,11" /></>)}
        {trend === 'declining' && (<><polyline points="3,6 8,11 12,8 21,18" /><polyline points="16,18 21,18 21,13" /></>)}
        {trend === 'stable' && (<><path d="M4,12 C8,8 16,16 20,12" /></>)}
      </svg>
    );
  };

  // Calculate setup progress
  const setupItems = [
    { key: 'orgHierarchy', label: 'Organization Hierarchy', status: setupProgress.orgHierarchy.status },
    { key: 'jiraStandards', label: 'Jira Standards', status: setupProgress.jiraStandards.status },
    { key: 'teamAttributes', label: 'Team Attributes', status: setupProgress.teamAttributes.status },
  ];
  const completedSetup = setupItems.filter(s => s.status === 'completed').length;
  const isSetupComplete = completedSetup === setupItems.length;

  // Calculate task completion percentage
  const taskCompletionPercent = Math.round((improvementJourney.tasksCompleted / improvementJourney.tasksTotal) * 100);

  // Outcome colors for trend chart
  const outcomeColors: Record<string, string> = {
    planning: '#0052CC',
    forecasting: '#00B8D9',
    awareness: '#36B37E',
    progress: '#6554C0',
    collaboration: '#FF8B00',
  };

  const renderOverview = () => (
    <div style={styles.overviewContainer} data-tour="overview-section">
      {/* ============================================
          SECTION 0: SETUP PROGRESS (conditional)
          ============================================ */}
      {!isSetupComplete && (
        <div style={styles.setupProgressSection}>
          <div style={styles.setupProgressHeader}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
              <circle cx="10" cy="10" r="8" stroke="#5243AA" strokeWidth="2"/>
              <path d="M10 6v4l2.5 2.5" stroke="#5243AA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={styles.setupProgressTitle}>Setup Progress</span>
            <span style={styles.setupProgressPercent}>{Math.round((completedSetup / setupItems.length) * 100)}%</span>
          </div>
          <div style={styles.setupItemsList}>
            {setupItems.map((item, i) => (
              <div key={i} style={styles.setupItem}>
                {item.status === 'completed' ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" fill="#36B37E"/>
                    <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="8" stroke="#DFE1E6" strokeWidth="2"/>
                  </svg>
                )}
                <span style={{ ...styles.setupItemLabel, color: item.status === 'completed' ? '#172B4D' : '#6B778C' }}>
                  {item.label}
                </span>
                {item.status !== 'completed' && (
                  <button
                    style={styles.setupStartBtn}
                    onClick={() => onStartSetupWizard(item.key as SetupType)}
                  >
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          SECTION 1: OUTCOME CONFIDENCE DASHBOARD (Hero)
          ============================================ */}
      <div style={styles.outcomeConfidenceSection}>
        <div style={styles.outcomeSectionHeader}>
          <h3 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
              <circle cx="10" cy="10" r="8" stroke="#0052CC" strokeWidth="2"/>
              <path d="M6 10l2.5 2.5 5-5" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Outcome Confidence
          </h3>
          <span style={styles.outcomeSectionSubtitle}>Can we trust our Jira data for these purposes?</span>
        </div>

        <div style={styles.outcomeGaugesGrid}>
          {outcomeStats.map((outcome) => (
            <div key={outcome.outcomeId} style={styles.outcomeGaugeCard}>
              <div style={styles.outcomeGaugeHeader}>
                <span style={styles.outcomeGaugeName}>{outcome.outcomeName}</span>
                <span style={styles.outcomeGaugeTrend}>
                  {getTrendIcon(outcome.trend)}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: outcome.trend === 'improving' ? '#36B37E' : outcome.trend === 'declining' ? '#DE350B' : '#6B778C',
                    marginLeft: '4px',
                  }}>
                    {outcome.trendChange > 0 ? '+' : ''}{outcome.trendChange}
                  </span>
                </span>
              </div>

              {/* Confidence Bar */}
              <div style={styles.outcomeConfidenceBarWrap}>
                <div style={styles.outcomeConfidenceBarTrack}>
                  <div style={{
                    ...styles.outcomeConfidenceBarFill,
                    width: `${outcome.avgScore}%`,
                    backgroundColor: getConfidenceLevelColor(outcome.confidenceLevel),
                  }} />
                </div>
                <span style={styles.outcomeConfidenceScore}>{outcome.avgScore}</span>
              </div>

              <div style={styles.outcomeConfidenceMeta}>
                <span style={{
                  ...styles.confidenceLevelBadge,
                  backgroundColor: `${getConfidenceLevelColor(outcome.confidenceLevel)}15`,
                  color: getConfidenceLevelColor(outcome.confidenceLevel),
                }}>
                  {getConfidenceLevelLabel(outcome.confidenceLevel)}
                </span>

                {/* Team Distribution Mini */}
                <div style={styles.teamDistMini}>
                  <div style={{ ...styles.teamDistDot, backgroundColor: '#DE350B' }} title="Low"><span>{outcome.teamsAtLow}</span></div>
                  <div style={{ ...styles.teamDistDot, backgroundColor: '#FF8B00' }} title="Moderate"><span>{outcome.teamsAtModerate}</span></div>
                  <div style={{ ...styles.teamDistDot, backgroundColor: '#36B37E' }} title="High"><span>{outcome.teamsAtHigh}</span></div>
                  <div style={{ ...styles.teamDistDot, backgroundColor: '#006644' }} title="Very High"><span>{outcome.teamsAtVeryHigh}</span></div>
                </div>
              </div>

              {/* Critical Gap Indicator */}
              {outcome.criticalGaps.length > 0 && (
                <div style={styles.criticalGapIndicator}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="#FF8B00" strokeWidth="1.5"/>
                    <path d="M6 3.5v3M6 8v.5" stroke="#FF8B00" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>{outcome.criticalGaps[0].teamCount} teams capped by {outcome.criticalGaps[0].dimensionName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================
          SECTION 2: IMPROVEMENT JOURNEY
          ============================================ */}
      <div style={styles.improvementJourneySection}>
        <h3 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
            <path d="M3 17l4-6 4 3 6-10" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Improvement Journey
        </h3>

        <div style={styles.journeyContent}>
          {/* Funnel Visualization */}
          <div style={styles.journeyFunnel}>
            <div style={styles.funnelStage}>
              <div style={{ ...styles.funnelBar, width: '100%', backgroundColor: '#DEEBFF' }}>
                <span style={styles.funnelBarText}>{improvementJourney.plansCreated} Plans Created</span>
              </div>
            </div>
            <div style={styles.funnelStage}>
              <div style={{ ...styles.funnelBar, width: `${(improvementJourney.plansActive / improvementJourney.plansCreated) * 100}%`, backgroundColor: '#B3D4FF' }}>
                <span style={styles.funnelBarText}>{improvementJourney.plansActive} Active</span>
              </div>
            </div>
            <div style={styles.funnelStage}>
              <div style={{ ...styles.funnelBar, width: `${(improvementJourney.plansCompleted / improvementJourney.plansCreated) * 100}%`, backgroundColor: '#0052CC' }}>
                <span style={{ ...styles.funnelBarText, color: '#FFFFFF' }}>{improvementJourney.plansCompleted} Completed</span>
              </div>
            </div>
          </div>

          {/* Stats Column */}
          <div style={styles.journeyStats}>
            {/* Task Completion Ring */}
            <div style={styles.taskCompletionCard}>
              <div style={styles.taskRing}>
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="30" fill="none" stroke="#EBECF0" strokeWidth="5"/>
                  <circle cx="35" cy="35" r="30" fill="none" stroke="#36B37E" strokeWidth="5"
                    strokeDasharray={`${(taskCompletionPercent / 100) * 188} 188`}
                    strokeLinecap="round" transform="rotate(-90 35 35)"/>
                </svg>
                <div style={styles.taskRingCenter}>
                  <span style={styles.taskRingValue}>{taskCompletionPercent}%</span>
                </div>
              </div>
              <div style={styles.taskRingMeta}>
                <span style={styles.taskRingLabel}>Tasks Completed</span>
                <span style={styles.taskRingDetail}>{improvementJourney.tasksCompleted}/{improvementJourney.tasksTotal}</span>
              </div>
            </div>

            {/* Plays In Flight */}
            <div style={styles.journeyStatItem}>
              <span style={styles.journeyStatValue}>{improvementJourney.playsInFlight}</span>
              <span style={styles.journeyStatLabel}>Plays In-Flight</span>
            </div>
          </div>

          {/* Stalled Alert */}
          {improvementJourney.stalledPlanCount > 0 && (
            <div style={styles.stalledAlert}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#FF8B00" strokeWidth="1.5"/>
                <path d="M8 4v5M8 11v1" stroke="#FF8B00" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{improvementJourney.stalledPlanCount} plans stalled (14+ days)</span>
            </div>
          )}

          {/* Teams Coverage */}
          <div style={styles.teamsCoverageBar}>
            <div style={styles.teamsCoverageLabel}>
              <span>Teams with plans</span>
              <span style={styles.teamsCoverageValue}>{improvementJourney.teamsWithPlans} of {improvementJourney.teamsWithPlans + improvementJourney.teamsWithoutPlans}</span>
            </div>
            <div style={styles.teamsCoverageTrack}>
              <div style={{
                ...styles.teamsCoverageFill,
                width: `${(improvementJourney.teamsWithPlans / (improvementJourney.teamsWithPlans + improvementJourney.teamsWithoutPlans)) * 100}%`,
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          SECTION 3: DATA QUALITY GAPS
          ============================================ */}
      <div style={styles.dataQualitySection}>
        <h3 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
            <rect x="2" y="4" width="16" height="3" rx="1" stroke="#DE350B" strokeWidth="1.5"/>
            <rect x="2" y="9" width="12" height="3" rx="1" stroke="#FF8B00" strokeWidth="1.5"/>
            <rect x="2" y="14" width="8" height="3" rx="1" stroke="#6B778C" strokeWidth="1.5"/>
          </svg>
          Data Quality Gaps
        </h3>
        <p style={styles.dataQualitySubtitle}>Dimensions blocking outcome confidence across the org</p>

        <div style={styles.gapsContainer}>
          {dimensionGaps.slice(0, 5).map((gap, index) => {
            const totalTeamsImpacted = gap.teamsAtRisk + gap.teamsNeedsAttention;
            return (
              <div key={gap.dimensionKey} style={styles.gapRow}>
                <span style={styles.gapRank}>{index + 1}</span>
                <div style={styles.gapContent}>
                  <div style={styles.gapHeader}>
                    <span style={styles.gapName}>{gap.dimensionName}</span>
                    <span style={styles.gapImpact}>{totalTeamsImpacted} teams</span>
                  </div>
                  <div style={styles.gapBarTrack}>
                    <div style={{
                      ...styles.gapBarFillRisk,
                      width: `${(gap.teamsAtRisk / 24) * 100}%`,
                    }} />
                    <div style={{
                      ...styles.gapBarFillAttention,
                      width: `${(gap.teamsNeedsAttention / 24) * 100}%`,
                      marginLeft: `${(gap.teamsAtRisk / 24) * 100}%`,
                    }} />
                  </div>
                  <div style={styles.gapOutcomes}>
                    {gap.impactedOutcomes.map((outcome, i) => (
                      <span key={i} style={styles.gapOutcomeTag}>{outcome}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.gapLegend}>
          <span style={styles.gapLegendItem}><span style={{ ...styles.gapLegendDot, backgroundColor: '#DE350B' }}></span> At Risk</span>
          <span style={styles.gapLegendItem}><span style={{ ...styles.gapLegendDot, backgroundColor: '#FF8B00' }}></span> Needs Attention</span>
        </div>
      </div>

      {/* ============================================
          SECTION 4: OUTCOME TRENDS OVER TIME
          ============================================ */}
      <div style={styles.trendChartSection}>
        <h3 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
            <path d="M3 17l4-6 4 3 6-10" stroke="#5243AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Outcome Trends (6 months)
        </h3>

        {/* Simple bar chart representation */}
        <div style={styles.trendChartContainer}>
          <div style={styles.trendChartGrid}>
            {outcomeTrends.map((point, periodIndex) => (
              <div key={point.period} style={styles.trendChartColumn}>
                <div style={styles.trendChartBars}>
                  {point.outcomes.map((outcome) => (
                    <div
                      key={outcome.outcomeId}
                      style={{
                        ...styles.trendChartBar,
                        height: `${outcome.avgScore}%`,
                        backgroundColor: outcomeColors[outcome.outcomeId],
                        opacity: periodIndex === outcomeTrends.length - 1 ? 1 : 0.4 + (periodIndex * 0.1),
                      }}
                      title={`${outcome.outcomeId}: ${outcome.avgScore}`}
                    />
                  ))}
                </div>
                <span style={styles.trendChartLabel}>{point.period}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={styles.trendChartLegend}>
            {outcomeStats.map((outcome) => (
              <div key={outcome.outcomeId} style={styles.trendLegendItem}>
                <span style={{ ...styles.trendLegendDot, backgroundColor: outcomeColors[outcome.outcomeId] }}></span>
                <span style={styles.trendLegendLabel}>{outcome.outcomeName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight callout */}
        <div style={styles.trendInsight}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="#0052CC" strokeWidth="1.5"/>
            <path d="M8 5v3M8 10v1" stroke="#0052CC" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Teams with active improvement plans improved <strong>23% more</strong> than teams without plans</span>
        </div>
      </div>

      {/* ============================================
          SECTION 5: ADOPTION FUNNEL (Compact)
          ============================================ */}
      <div style={styles.adoptionFunnelSection}>
        <h3 style={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
            <circle cx="10" cy="6" r="3" stroke="#6554C0" strokeWidth="1.5"/>
            <path d="M4 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="#6554C0" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Adoption Funnel
        </h3>

        <div style={styles.adoptionFunnelContainer}>
          {[
            { label: 'Total Teams', value: adoptionFunnel.totalTeams, color: '#EBECF0' },
            { label: 'Ever Assessed', value: adoptionFunnel.teamsEverAssessed, color: '#DEEBFF', dropoff: Math.round(((adoptionFunnel.totalTeams - adoptionFunnel.teamsEverAssessed) / adoptionFunnel.totalTeams) * 100) },
            { label: 'Fresh (30d)', value: adoptionFunnel.teamsFreshlyAssessed, color: '#B3D4FF', dropoff: Math.round(((adoptionFunnel.teamsEverAssessed - adoptionFunnel.teamsFreshlyAssessed) / adoptionFunnel.teamsEverAssessed) * 100) },
            { label: 'With Plans', value: adoptionFunnel.teamsWithPlans, color: '#4C9AFF', dropoff: Math.round(((adoptionFunnel.teamsFreshlyAssessed - adoptionFunnel.teamsWithPlans) / adoptionFunnel.teamsFreshlyAssessed) * 100) },
            { label: 'Active Progress', value: adoptionFunnel.teamsWithActiveProgress, color: '#0052CC', dropoff: Math.round(((adoptionFunnel.teamsWithPlans - adoptionFunnel.teamsWithActiveProgress) / adoptionFunnel.teamsWithPlans) * 100) },
          ].map((stage, i, arr) => (
            <div key={stage.label} style={styles.adoptionStage}>
              <div style={{
                ...styles.adoptionStageBar,
                width: `${(stage.value / adoptionFunnel.totalTeams) * 100}%`,
                backgroundColor: stage.color,
              }}>
                <span style={{ ...styles.adoptionStageValue, color: i >= 3 ? '#FFFFFF' : '#172B4D' }}>{stage.value}</span>
              </div>
              <span style={styles.adoptionStageLabel}>{stage.label}</span>
              {stage.dropoff !== undefined && stage.dropoff > 0 && (
                <span style={styles.adoptionDropoff}>-{stage.dropoff}%</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================
          SECTION 6: ACTIONABLE ALERTS
          ============================================ */}
      {actionableAlerts.length > 0 && (
        <div style={styles.actionableAlertsSection}>
          <h3 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '8px' }}>
              <path d="M10 2l8 14H2L10 2z" stroke="#FF8B00" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M10 8v4M10 14v1" stroke="#FF8B00" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Actionable Alerts ({actionableAlerts.length})
          </h3>

          <div style={styles.actionableAlertsList}>
            {actionableAlerts.map((alert) => {
              const priorityColors = {
                high: { bg: '#FFEBE6', border: '#DE350B', badge: '#DE350B' },
                medium: { bg: '#FFFAE6', border: '#FF8B00', badge: '#FF8B00' },
                low: { bg: '#E3FCEF', border: '#36B37E', badge: '#36B37E' },
              };
              const colors = priorityColors[alert.priority];

              return (
                <div
                  key={alert.id}
                  style={{
                    ...styles.actionableAlertCard,
                    borderLeftColor: colors.border,
                  }}
                >
                  <div style={styles.actionableAlertContent}>
                    <div style={styles.actionableAlertHeader}>
                      <span style={{
                        ...styles.actionableAlertPriority,
                        backgroundColor: colors.bg,
                        color: colors.badge,
                      }}>
                        {alert.priority.toUpperCase()}
                      </span>
                      <span style={styles.actionableAlertType}>
                        {alert.type === 'critical_gap' && 'Critical Gap'}
                        {alert.type === 'stalled_plan' && 'Stalled Plans'}
                        {alert.type === 'declining_team' && 'Declining'}
                        {alert.type === 'stale_assessment' && 'Stale Data'}
                        {alert.type === 'quick_win' && 'Quick Win'}
                      </span>
                    </div>
                    <h4 style={styles.actionableAlertTitle}>{alert.title}</h4>
                    <p style={styles.actionableAlertDescription}>{alert.description}</p>
                  </div>
                  <button style={styles.actionableAlertAction}>
                    {alert.actionLabel}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================
          QUICK ACTIONS FOOTER
          ============================================ */}
      <div style={styles.quickActionsFooter}>
        <button style={styles.footerAction} onClick={() => onUpdateSection('users')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Invite User
        </button>
        <button style={styles.footerAction} onClick={() => onUpdateSection('appSettings.jiraStandards')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 2v2M9 14v2M2 9h2M14 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Configure Standards
        </button>
        <button style={styles.footerAction} onClick={onStartNewAssessment}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 9h6M6 6h4M6 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Create Assessment
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGradientAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#logoGradientAdmin)" />
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.95" />
                <circle cx="20" cy="22" r="3" fill="rgba(0,82,204,0.8)" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <span style={styles.titleSmall}>Jira Health Check</span>
              <h1 style={styles.title}>Admin Dashboard</h1>
            </div>
          </div>
          <div style={styles.headerActions}>
            <PersonaSwitcher />
            <div style={styles.userPill}>
              <div style={styles.userAvatar}>
                {getInitials(currentUser.displayName)}
              </div>
              <span style={styles.userName}>{getFirstName(currentUser.displayName)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <h2 style={styles.greeting}>
              {getGreeting()}, {getFirstName(currentUser.displayName)}
            </h2>
            <p style={styles.heroSubtitle}>
              Manage organization settings, users, and view analytics across all teams.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            {/* Active Users */}
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="6" r="3" stroke="white" strokeWidth="2"/>
                  <path d="M4 17v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{analytics.usageMetrics.activeUsers}</span>
                <span style={styles.statLabel}>Users Active (30 days)</span>
              </div>
            </div>

            {/* Teams Assessed */}
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                  <rect x="12" y="2" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                  <rect x="2" y="12" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                  <rect x="12" y="12" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{analytics.healthSummary.totalTeamsAssessed} <span style={styles.statSecondary}>of 31</span></span>
                <span style={styles.statLabel}>Teams Assessed</span>
              </div>
            </div>

            {/* Assessments This Month */}
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="white" strokeWidth="2"/>
                  <path d="M7 10h6M7 7h4M7 13h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValueRow}>
                  <span style={styles.statValue}>12</span>
                  <span style={styles.statTrend}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 8l4-4 4 4" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    vs last month
                  </span>
                </div>
                <span style={styles.statLabel}>Assessments This Month</span>
              </div>
            </div>

            {/* Teams Improving */}
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 17l4-6 4 3 6-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>
                  {analytics.healthSummary.improvingTeams} <span style={styles.statSecondary}>of {analytics.healthSummary.totalTeamsAssessed}</span>
                </span>
                <span style={styles.statLabel}>Teams Improved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Sidebar Navigation */}
          <aside style={styles.sidebar}>
            <nav style={styles.sidebarNav}>
              {tabs.map(tab => {
                const hasChildren = tab.children && tab.children.length > 0;
                const isExpanded = expandedTabs.includes(tab.id);
                const isParentActive = hasChildren && tab.children?.some(child => currentSection === child.id);
                const isActive = currentSection === tab.id || isParentActive;

                return (
                  <React.Fragment key={tab.id}>
                    <button
                      style={{
                        ...styles.sidebarTab,
                        ...(isActive ? styles.sidebarTabActive : {}),
                      }}
                      onClick={() => handleTabClick(tab)}
                    >
                      <span style={styles.sidebarTabIcon}>{tab.icon}</span>
                      <span style={styles.sidebarTabLabel}>{tab.label}</span>
                      {hasChildren && (
                        <span style={{
                          ...styles.chevron,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                    {hasChildren && isExpanded && tab.children?.map(child => (
                      <button
                        key={child.id}
                        style={{
                          ...styles.sidebarTab,
                          ...styles.sidebarTabNested,
                          ...(currentSection === child.id ? styles.sidebarTabActive : {}),
                        }}
                        onClick={() => onUpdateSection(child.id)}
                      >
                        <span style={styles.sidebarTabIcon}>{child.icon}</span>
                        <span style={styles.sidebarTabLabel}>{child.label}</span>
                      </button>
                    ))}
                  </React.Fragment>
                );
              })}
            </nav>
          </aside>

          {/* Section Content */}
          <div style={styles.sectionContent}>
            {renderSectionContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
  },
  header: {
    background: 'linear-gradient(135deg, #403294 0%, #5243AA 50%, #6554C0 100%)',
    padding: '14px 32px',
    boxShadow: '0 2px 8px rgba(64, 50, 148, 0.15)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleSmall: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#5243AA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  heroSection: {
    background: 'linear-gradient(180deg, #5243AA 0%, #403294 100%)',
    padding: '32px 32px 48px',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '40px',
  },
  heroLeft: {
    flex: '0 0 auto',
  },
  greeting: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    margin: 0,
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '400px',
    lineHeight: 1.5,
  },
  statsGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '14px 16px',
    minWidth: '130px',
    flex: '1 1 auto',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  statPercent: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#36B37E',
  },
  statSecondary: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  main: {
    padding: '24px 32px 32px',
    marginTop: '-24px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08), 0 8px 24px rgba(9, 30, 66, 0.08)',
    display: 'flex',
    minHeight: '600px',
  },
  sidebar: {
    width: '250px',
    flexShrink: 0,
    borderRight: '1px solid #EBECF0',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFBFC',
    borderTopLeftRadius: '12px',
    borderBottomLeftRadius: '12px',
  },
  sidebarNav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sidebarTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  sidebarTabActive: {
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    fontWeight: 600,
  },
  sidebarTabNested: {
    paddingLeft: '36px',
    fontSize: '13px',
  },
  chevron: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    color: '#A5ADBA',
  },
  sidebarTabIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  sidebarTabLabel: {
    whiteSpace: 'nowrap',
  },
  sectionContent: {
    flex: 1,
    padding: '24px',
    minHeight: '400px',
    overflow: 'auto',
  },
  // Overview styles
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  overviewHeader: {
    marginBottom: '0',
  },
  overviewTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  overviewSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  overviewCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  overviewCardTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  quickActionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  quickActionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    color: '#5243AA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  userSummaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  userSummaryValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
    marginBottom: '4px',
  },
  userSummaryLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  healthSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  healthScoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '4px solid #5243AA',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScoreValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#5243AA',
    lineHeight: 1,
  },
  healthScoreLabel: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '4px',
  },
  healthTrends: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  healthTrendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #EBECF0',
  },
  trendValue: {
    fontSize: '18px',
    fontWeight: 700,
  },
  trendLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  settingsStatus: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  settingStatusItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  settingName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  settingBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  // New merged Overview styles
  attentionSection: {
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '12px',
    padding: '20px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
  },
  attentionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  },
  attentionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #FFE380',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left' as const,
  },
  attentionIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#FFF0B3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  attentionContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  attentionValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  attentionLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  attentionArrow: {
    fontSize: '18px',
    color: '#6B778C',
    marginLeft: 'auto',
  },
  dashboardSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  impactGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '24px',
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  healthScoreDisplay: {
    position: 'relative' as const,
    width: '100px',
    height: '100px',
    margin: '0 auto',
  },
  healthScoreCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
  },
  healthScoreNum: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 700,
    color: '#5243AA',
    lineHeight: 1,
  },
  healthScoreSub: {
    display: 'block',
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '2px',
  },
  healthScoreMeta: {
    textAlign: 'center' as const,
    marginTop: '12px',
    fontSize: '13px',
    color: '#6B778C',
  },
  impactCardTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  trendBars: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  trendBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  trendBarLabel: {
    width: '70px',
    fontSize: '13px',
    color: '#6B778C',
    flexShrink: 0,
  },
  trendBarTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  trendBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  trendBarValue: {
    width: '24px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'right' as const,
  },
  adoptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  adoptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  adoptionCardTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  userBreakdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '16px',
  },
  userBreakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userBreakdownDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  userBreakdownLabel: {
    flex: 1,
    fontSize: '13px',
    color: '#6B778C',
  },
  userBreakdownValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  userTotal: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
    fontSize: '13px',
    color: '#172B4D',
  },
  userActiveNote: {
    fontSize: '12px',
    color: '#6B778C',
  },
  activityStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  activityStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  activityStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  activityStatLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  miniChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '40px',
    marginBottom: '8px',
  },
  miniChartBar: {
    flex: 1,
    height: '100%',
    backgroundColor: '#EBECF0',
    borderRadius: '2px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  miniChartFill: {
    width: '100%',
    backgroundColor: '#5243AA',
    borderRadius: '2px',
    transition: 'height 0.3s ease',
  },
  chartCaption: {
    fontSize: '11px',
    color: '#A5ADBA',
    textAlign: 'center' as const,
    display: 'block',
  },
  quickActionsFooter: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
    marginTop: '8px',
  },
  // ============================================
  // NEW OVERVIEW STYLES
  // ============================================
  healthPulseSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  healthPulseContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  healthScoreCircleWrap: {
    position: 'relative' as const,
    width: '120px',
    height: '120px',
    flexShrink: 0,
  },
  healthScoreInner: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
  },
  healthScoreBig: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  healthScoreMax: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
  },
  healthNarrative: {
    flex: 1,
  },
  healthNarrativeTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  healthLabel: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  maturityBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  healthProgressBar: {
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden' as const,
    marginBottom: '12px',
  },
  healthProgressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  healthTrendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  healthTrendText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#36B37E',
  },
  trendDistribution: {
    display: 'flex',
    gap: '24px',
    paddingLeft: '24px',
    borderLeft: '1px solid #DFE1E6',
  },
  trendDistItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  trendDistValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  trendDistLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  trendDistBar: {
    height: '4px',
    minWidth: '40px',
    borderRadius: '2px',
  },
  compactStatsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    gap: '24px',
  },
  compactStat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
  },
  compactStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
  },
  compactStatLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  compactStatTrend: {
    fontSize: '11px',
    color: '#36B37E',
  },
  compactStatDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#EBECF0',
  },
  setupProgressSection: {
    backgroundColor: '#EAE6FF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #C0B6F2',
  },
  setupProgressHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  setupProgressTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#403294',
    flex: 1,
  },
  setupProgressPercent: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#5243AA',
  },
  setupItemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  setupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  setupItemLabel: {
    fontSize: '14px',
    fontWeight: 500,
    flex: 1,
  },
  setupStartBtn: {
    padding: '6px 16px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  smartAlertsSection: {
    backgroundColor: '#FFFAE6',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #FFE380',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  alertCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    borderLeft: '4px solid',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  alertSeverity: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  alertDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  alertAction: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  twoColumnSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  highlightsCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  sectionTitleSmall: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
  },
  highlightsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  highlightItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  highlightIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highlightText: {
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  distributionCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  healthDistBars: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginBottom: '20px',
  },
  healthDistRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  healthDistLabel: {
    width: '120px',
    fontSize: '12px',
    color: '#6B778C',
    flexShrink: 0,
  },
  healthDistBarTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  healthDistBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  healthDistCount: {
    width: '24px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'right' as const,
  },
  attributeSection: {
    paddingTop: '16px',
    borderTop: '1px solid #DFE1E6',
  },
  attributeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  attributeLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  attributeSelect: {
    padding: '4px 8px',
    fontSize: '12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  attributeBreakdown: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  attributeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  attributeName: {
    width: '110px',
    fontSize: '12px',
    color: '#172B4D',
    flexShrink: 0,
  },
  attributeBarTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden' as const,
  },
  attributeBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  attributeScore: {
    width: '28px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'right' as const,
  },
  focusTag: {
    padding: '2px 6px',
    backgroundColor: '#FFEBE6',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    color: '#DE350B',
    marginLeft: '4px',
  },
  impactMetricsGridSmall: {
    display: 'flex',
    gap: '16px',
    marginLeft: '24px',
  },
  impactMetricCardSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px 16px',
    border: '1px solid #EBECF0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  impactMetricValueSmall: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1,
  },
  impactMetricLabelSmall: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '4px',
  },
  footerAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  // Usage Statistics styles
  usageStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  usageStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #EBECF0',
  },
  usageStatHeader: {
    marginBottom: '12px',
  },
  usageStatTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  usageStatMetrics: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  usageMetricItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
  },
  usageMetricValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  usageMetricLabel: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '4px',
    textAlign: 'center' as const,
  },
  usageStatFooter: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  usageStatFooterText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  // Usage Trends styles
  trendsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #EBECF0',
  },
  trendCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  trendMetricName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
  },
  trendBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  trendValues: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  trendCurrentValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#172B4D',
  },
  trendPreviousValue: {
    fontSize: '12px',
    color: '#A5ADBA',
  },
  activityChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #EBECF0',
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  activityChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '80px',
    marginBottom: '8px',
  },
  activityChartBarGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  activityChartBars: {
    display: 'flex',
    gap: '2px',
    alignItems: 'flex-end',
    height: '60px',
  },
  activityChartBar: {
    width: '8px',
    borderRadius: '2px',
    transition: 'height 0.3s ease',
  },
  activityChartLabel: {
    fontSize: '10px',
    color: '#A5ADBA',
  },
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #EBECF0',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B778C',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
  // Impact styles
  impactSummary: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  impactSummaryCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #EBECF0',
  },
  impactRing: {
    position: 'relative' as const,
    width: '80px',
    height: '80px',
  },
  impactRingCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  impactRingValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#36B37E',
  },
  impactRingLabel: {
    marginTop: '8px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B778C',
  },
  impactMetricsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  impactMetricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #EBECF0',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  impactMetricValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    lineHeight: 1,
  },
  impactMetricLabel: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '6px',
    textAlign: 'center' as const,
  },
  impactDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  impactDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #EBECF0',
  },
  impactDetailTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  impactList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  impactListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
  },
  impactListRank: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  impactListContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  impactListName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  impactListStat: {
    fontSize: '11px',
    color: '#6B778C',
  },
  impactListChange: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#36B37E',
  },
  impactListPercent: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5243AA',
  },
  // Feature Usage styles
  featureUsageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '14px',
    border: '1px solid #EBECF0',
  },
  featureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  featureName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  featurePercent: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5243AA',
  },
  featureBar: {
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    overflow: 'hidden' as const,
    marginBottom: '8px',
  },
  featureBarFill: {
    height: '100%',
    backgroundColor: '#5243AA',
    borderRadius: '3px',
  },
  featureStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#6B778C',
  },
  // Top Users styles
  topUsersGrid: {
    display: 'flex',
    gap: '12px',
  },
  topUserCard: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  topUserRank: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topUserAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topUserInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    minWidth: 0,
  },
  topUserName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  topUserStat: {
    fontSize: '11px',
    color: '#6B778C',
  },
  // ============================================
  // VALUE-CENTRIC DASHBOARD STYLES
  // ============================================

  // Section 1: Outcome Confidence Dashboard
  outcomeConfidenceSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  outcomeSectionHeader: {
    marginBottom: '20px',
  },
  outcomeSectionSubtitle: {
    fontSize: '13px',
    color: '#6B778C',
    marginTop: '4px',
    display: 'block',
  },
  outcomeGaugesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  outcomeGaugeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #EBECF0',
  },
  outcomeGaugeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  outcomeGaugeName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  outcomeGaugeTrend: {
    display: 'flex',
    alignItems: 'center',
  },
  outcomeConfidenceBarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  outcomeConfidenceBarTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  outcomeConfidenceBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  outcomeConfidenceScore: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
    minWidth: '32px',
    textAlign: 'right' as const,
  },
  outcomeConfidenceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  confidenceLevelBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  teamDistMini: {
    display: 'flex',
    gap: '4px',
  },
  teamDistDot: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  criticalGapIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#FF8B00',
    marginTop: '8px',
  },

  // Section 2: Improvement Journey
  improvementJourneySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  journeyContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  journeyFunnel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  funnelStage: {
    display: 'flex',
    alignItems: 'center',
  },
  funnelBar: {
    height: '36px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    transition: 'width 0.3s ease',
  },
  funnelBarText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  journeyStats: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  taskCompletionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '10px',
  },
  taskRing: {
    position: 'relative' as const,
    width: '70px',
    height: '70px',
    flexShrink: 0,
  },
  taskRingCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  taskRingValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#36B37E',
  },
  taskRingMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  taskRingLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  taskRingDetail: {
    fontSize: '12px',
    color: '#6B778C',
  },
  journeyStatItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  journeyStatValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#5243AA',
  },
  journeyStatLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  stalledAlert: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    backgroundColor: '#FFFAE6',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#FF8B00',
  },
  teamsCoverageBar: {
    gridColumn: '1 / -1',
    marginTop: '8px',
  },
  teamsCoverageLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#6B778C',
  },
  teamsCoverageValue: {
    fontWeight: 600,
    color: '#172B4D',
  },
  teamsCoverageTrack: {
    height: '8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    overflow: 'hidden' as const,
  },
  teamsCoverageFill: {
    height: '100%',
    backgroundColor: '#5243AA',
    borderRadius: '4px',
  },

  // Section 3: Data Quality Gaps
  dataQualitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  dataQualitySubtitle: {
    margin: '-8px 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  gapsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  gapRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  gapRank: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#EBECF0',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gapContent: {
    flex: 1,
  },
  gapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  gapName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  gapImpact: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#DE350B',
  },
  gapBarTrack: {
    height: '6px',
    backgroundColor: '#EBECF0',
    borderRadius: '3px',
    marginBottom: '8px',
    position: 'relative' as const,
  },
  gapBarFillRisk: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#DE350B',
    borderRadius: '3px',
  },
  gapBarFillAttention: {
    position: 'absolute' as const,
    top: 0,
    height: '100%',
    backgroundColor: '#FF8B00',
    borderRadius: '3px',
  },
  gapOutcomes: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const,
  },
  gapOutcomeTag: {
    padding: '2px 8px',
    backgroundColor: '#DEEBFF',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
    color: '#0052CC',
  },
  gapLegend: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  gapLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B778C',
  },
  gapLegendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },

  // Section 4: Outcome Trends
  trendChartSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  trendChartContainer: {
    marginTop: '16px',
  },
  trendChartGrid: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    height: '120px',
    alignItems: 'flex-end',
  },
  trendChartColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    height: '100%',
  },
  trendChartBars: {
    flex: 1,
    display: 'flex',
    gap: '2px',
    alignItems: 'flex-end',
    width: '100%',
  },
  trendChartBar: {
    flex: 1,
    borderRadius: '2px 2px 0 0',
    transition: 'height 0.3s ease',
  },
  trendChartLabel: {
    fontSize: '11px',
    color: '#6B778C',
    marginTop: '8px',
  },
  trendChartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  trendLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  trendLegendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
  trendLegendLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  trendInsight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#0052CC',
  },

  // Section 5: Adoption Funnel
  adoptionFunnelSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #EBECF0',
  },
  adoptionFunnelContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '16px',
  },
  adoptionStage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  adoptionStageBar: {
    height: '32px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '12px',
    transition: 'width 0.3s ease',
    minWidth: '60px',
  },
  adoptionStageValue: {
    fontSize: '14px',
    fontWeight: 700,
  },
  adoptionStageLabel: {
    fontSize: '13px',
    color: '#6B778C',
    width: '100px',
    flexShrink: 0,
  },
  adoptionDropoff: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    padding: '2px 6px',
    borderRadius: '4px',
  },

  // Section 6: Actionable Alerts
  actionableAlertsSection: {
    backgroundColor: '#FFFAE6',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #FFE380',
  },
  actionableAlertsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  actionableAlertCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    borderLeft: '4px solid',
  },
  actionableAlertContent: {
    flex: 1,
  },
  actionableAlertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  actionableAlertPriority: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  actionableAlertType: {
    fontSize: '11px',
    color: '#6B778C',
    fontWeight: 500,
  },
  actionableAlertTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  actionableAlertDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  actionableAlertAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    alignSelf: 'center',
  },
};

export default AdminHome;
