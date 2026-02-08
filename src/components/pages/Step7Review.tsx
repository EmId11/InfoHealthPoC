import React from 'react';
import {
  WizardState,
  getEffectiveDateRange,
  getSelectedIssueTypes,
  hasComparisonEnabled,
  MultiTeamWizardState,
  getScopeTypeDisplayName,
  getConfigurationStrategyDescription,
} from '../../types/wizard';
import { OrganizationDefaults } from '../../types/admin';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';

interface Step7Props {
  wizardState: WizardState;
  isMultiTeam?: boolean;
  multiTeamState?: MultiTeamWizardState;
  organizationDefaults?: OrganizationDefaults;
}

const issueTypeLabels: Record<string, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const cadenceLabels: Record<string, string> = {
  weekly: '1 week',
  fortnightly: '2 weeks',
  threeWeeks: '3 weeks',
  monthly: '4 weeks',
  custom: 'Custom',
};

const Step7Review: React.FC<Step7Props> = ({ wizardState, isMultiTeam = false, multiTeamState, organizationDefaults }) => {
  const { step1, step2, step3, step4, step5, step6 } = wizardState;

  // Determine which settings were team-configured vs org-defined
  const isIssueTypesTeamDecides = !organizationDefaults || organizationDefaults.issueTypes.mode === 'team-decides';
  const isSprintCadenceTeamDecides = !organizationDefaults || organizationDefaults.sprintCadence.mode === 'team-decides';
  const isStaleThresholdsTeamDecides = !organizationDefaults || organizationDefaults.staleThresholds.mode === 'team-decides';

  // For multi-team mode, use settings from multiTeamState
  const effectiveStep3 = isMultiTeam && multiTeamState ? multiTeamState.sharedSettings.step3 : step3;
  const effectiveStep4 = isMultiTeam && multiTeamState ? multiTeamState.sharedSettings.step4 : step4;
  const effectiveStep6 = isMultiTeam && multiTeamState ? multiTeamState.step6 : step6;

  const dateRange = isMultiTeam && multiTeamState
    ? { startDate: multiTeamState.step1.customDateRange.startDate, endDate: multiTeamState.step1.customDateRange.endDate }
    : getEffectiveDateRange(step1);
  const selectedIssueTypes = getSelectedIssueTypes(effectiveStep3);
  const hasComparison = !isMultiTeam && hasComparisonEnabled(step2.comparisonCriteria);

  const enabledStaleThresholds = selectedIssueTypes.filter(
    (type) => step5.staleThresholds[type]?.enabled
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Multi-team specific rendering
  if (isMultiTeam && multiTeamState) {
    const scope = multiTeamState.step1.scope;
    const teamCount = scope.resolvedTeamCount;
    const excludedCount = multiTeamState.excludedTeams?.length || 0;
    const activeTeamCount = teamCount - excludedCount;

    return (
      <div style={styles.container}>
        <StepHeader
          icon={StepIcons.review()}
          title="Review Portfolio Configuration"
          description="Review your settings before running the portfolio assessment."
          tourId={7}
          infoContent={
            <>
              <p>Review your portfolio configuration before starting the assessment.</p>
              <p><strong>What happens next:</strong> When you click "Run Assessment", we'll analyze Jira data for all {activeTeamCount} teams based on these settings.</p>
              <p><strong>Results:</strong> You'll receive a portfolio-level dashboard with cross-team comparisons, dimension analysis, and leadership insights.</p>
            </>
          }
        />

        {/* Scope Details */}
        <div style={styles.section} data-tour="review-summary">
          <h3 style={styles.sectionTitle}>Assessment Scope</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Scope Type</span>
              <span style={styles.summaryValue}>{getScopeTypeDisplayName(scope.scopeType)}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Assessment Name</span>
              <span style={styles.summaryValue}>{multiTeamState.step1.displayName || 'Not specified'}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Teams Included</span>
              <span style={styles.summaryValue}>
                {activeTeamCount} team{activeTeamCount !== 1 ? 's' : ''}
                {excludedCount > 0 && (
                  <span style={styles.excludedNote}> ({excludedCount} excluded)</span>
                )}
              </span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Analysis Period</span>
              <span style={styles.summaryValue}>
                {formatDate(dateRange.startDate)} – {formatDate(dateRange.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Strategy */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Configuration Strategy</h3>
          <div style={styles.strategyBox}>
            <span style={styles.strategyName}>
              {multiTeamState.configurationStrategy === 'uniform' && 'Uniform Settings'}
              {multiTeamState.configurationStrategy === 'inherit-defaults' && 'Inherit Defaults'}
              {multiTeamState.configurationStrategy === 'per-team' && 'Per-Team Configuration'}
            </span>
            <span style={styles.strategyDescription}>
              {getConfigurationStrategyDescription(multiTeamState.configurationStrategy).description}
            </span>
          </div>
        </div>

        {/* Issue Types */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Issue Types</h3>
          <div style={styles.tagList}>
            {selectedIssueTypes.map((type) => (
              <span key={type} style={styles.tag}>
                {issueTypeLabels[type]}
              </span>
            ))}
          </div>
        </div>

        {/* Sprint Cadence */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Sprint Cadence</h3>
          <span style={styles.summaryValue}>
            {cadenceLabels[effectiveStep4.sprintCadence]}
            {effectiveStep4.sprintCadence === 'custom' && effectiveStep4.customSprintDays &&
              ` (${effectiveStep4.customSprintDays} days)`
            }
          </span>
        </div>

        {/* Report Options */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Report Options</h3>
          <div style={styles.tagList}>
            {effectiveStep6.includeTrends && <span style={styles.tagSmall}>Historical trends</span>}
            {effectiveStep6.includeDescriptions && <span style={styles.tagSmall}>Descriptions</span>}
            {effectiveStep6.includeWhyItMatters && <span style={styles.tagSmall}>Why it matters</span>}
            {effectiveStep6.includeComparisonOnCards && <span style={styles.tagSmall}>Comparisons</span>}
          </div>
        </div>

        {/* Ready message */}
        <div style={styles.readyBox} data-tour="run-assessment">
          <h4 style={styles.readyTitle}>Ready to run portfolio assessment</h4>
          <p style={styles.readyText}>
            Click "Run Assessment" to analyze Jira data for {activeTeamCount} teams and generate your portfolio health report with cross-team insights.
          </p>
        </div>
      </div>
    );
  }

  // Standard single-team rendering
  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.review()}
        title="Review Your Configuration"
        description="Review your settings before running the assessment."
        tourId={7}
        infoContent={
          <>
            <p>Review your configuration before starting the assessment.</p>
            <p><strong>What happens next:</strong> When you click "Run Assessment", we'll analyze your Jira data based on these settings. This typically takes a few minutes.</p>
            <p><strong>Making changes:</strong> You can go back to any previous step to adjust settings. Use the sidebar or Back button to navigate.</p>
            <p><strong>Saving for later:</strong> If you need to pause, use "Save & Exit" to save your configuration as a draft. You can resume from where you left off.</p>
          </>
        }
      />

      {/* Basic Details */}
      <div style={styles.section} data-tour="review-summary">
        <h3 style={styles.sectionTitle}>Basic Details</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Team</span>
            <span style={styles.summaryValue}>{step1.teamName || 'Not specified'}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Analysis Period</span>
            <span style={styles.summaryValue}>
              {formatDate(dateRange.startDate)} – {formatDate(dateRange.endDate)}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Data Grouping</span>
            <span style={styles.summaryValue}>
              {step1.dataGrouping === 'weekly' ? 'Weekly' :
               step1.dataGrouping === 'fortnightly' ? 'Fortnightly' : 'Monthly'}
            </span>
          </div>
        </div>
      </div>

      {/* Comparisons */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Comparison Group</h3>
        {hasComparison ? (
          <div style={styles.tagList}>
            {step2.comparisonCriteria.compareToOrganisation && (
              <span style={styles.tag}>Organisation teams</span>
            )}
            {step2.comparisonCriteria.compareToScrumTeams && (
              <span style={styles.tag}>Scrum teams</span>
            )}
            {step2.comparisonCriteria.compareToSimilarDemand && (
              <span style={styles.tag}>Similar demand</span>
            )}
            {step2.comparisonCriteria.compareToSimilarVolume && (
              <span style={styles.tag}>Similar volume</span>
            )}
            {step2.comparisonCriteria.compareToMatureTeams && (
              <span style={styles.tag}>Mature teams</span>
            )}
            {step2.comparisonCriteria.compareToTribeTeams && (
              <span style={styles.tag}>Tribe teams</span>
            )}
            {step2.comparisonCriteria.compareToSpecificTeams && (
              <span style={styles.tag}>
                {step2.comparisonCriteria.specificTeamIds.length} specific team(s)
              </span>
            )}
          </div>
        ) : (
          <span style={styles.emptyText}>No comparison group selected</span>
        )}
      </div>

      {/* Issue Types */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Issue Types</h3>
        {isIssueTypesTeamDecides ? (
          <div style={styles.tagList}>
            {selectedIssueTypes.map((type) => (
              <span key={type} style={styles.tag}>
                {issueTypeLabels[type]}
              </span>
            ))}
          </div>
        ) : (
          <span style={styles.orgDefinedBadge}>Set by organization</span>
        )}
      </div>

      {/* Sprint Cadence */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Sprint Cadence</h3>
        {isSprintCadenceTeamDecides ? (
          <>
            <span style={styles.summaryValue}>
              {step4.sprintCadence === 'custom'
                ? `${step4.customSprintDays} days`
                : cadenceLabels[step4.sprintCadence]}
            </span>
            {step4.cadenceHistory.cadenceChanged && step4.cadenceHistory.previousCadence && (
              <div style={styles.subSection}>
                <span style={styles.subLabel}>Previously:</span>
                <span style={styles.subValue}>
                  {step4.cadenceHistory.previousCadence === 'custom'
                    ? `${step4.cadenceHistory.previousCustomDays} days`
                    : cadenceLabels[step4.cadenceHistory.previousCadence]}
                </span>
              </div>
            )}
          </>
        ) : (
          <span style={styles.orgDefinedBadge}>Set by organization</span>
        )}
      </div>

      {/* Stale Thresholds */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Stale Thresholds</h3>
        {isStaleThresholdsTeamDecides ? (
          enabledStaleThresholds.length > 0 ? (
            <div style={styles.staleGrid}>
              {enabledStaleThresholds.map((type) => (
                <div key={type} style={styles.staleItem}>
                  <span style={styles.staleType}>{issueTypeLabels[type]}</span>
                  <span style={styles.staleDays}>
                    {step5.staleThresholds[type].days} days
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span style={styles.emptyText}>No stale thresholds configured</span>
          )
        ) : (
          <span style={styles.orgDefinedBadge}>Set by organization</span>
        )}
      </div>

      {/* Report Options */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Report Options</h3>
        <div style={styles.tagList}>
          {step6.includeTrends && <span style={styles.tagSmall}>Trend analysis</span>}
          {step6.includeDescriptions && <span style={styles.tagSmall}>Descriptions</span>}
          {step6.includeWhyItMatters && <span style={styles.tagSmall}>Why it matters</span>}
          {step6.includeComparisonOnCards && <span style={styles.tagSmall}>Comparison on cards</span>}
        </div>
      </div>

      {/* Ready message */}
      <div style={styles.readyBox} data-tour="run-assessment">
        <h4 style={styles.readyTitle}>Ready to run the assessment</h4>
        <p style={styles.readyText}>
          Click "Run Assessment" to analyse your Jira data and generate your invisible work risk assessment.
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  description: {
    margin: '0 0 32px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #EBECF0',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    padding: '4px 12px',
    backgroundColor: '#E9F2FF',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '16px',
  },
  tagSmall: {
    padding: '2px 8px',
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
    fontSize: '12px',
    borderRadius: '10px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '16px',
  },
  statusBadgeDisabled: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '16px',
  },
  orgDefinedBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#EAE6FF',
    color: '#403294',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '6px',
    fontStyle: 'italic',
  },
  surveyNote: {
    margin: '12px 0 0 0',
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  calibrationDetails: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  calibrationItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  subSection: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  subLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  subValue: {
    fontSize: '13px',
    color: '#172B4D',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  staleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  staleItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  staleType: {
    fontSize: '12px',
    color: '#6B778C',
  },
  staleDays: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  readyBox: {
    marginTop: '8px',
    padding: '20px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  readyTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#006644',
  },
  readyText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  excludedNote: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: 400,
  },
  strategyBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  strategyName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  strategyDescription: {
    fontSize: '13px',
    color: '#6B778C',
  },
};

export default Step7Review;
