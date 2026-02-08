import React from 'react';
import {
  WizardState,
  getEffectiveDateRange,
  getSelectedIssueTypes,
  hasComparisonEnabled,
  getSurveyDeadlineDate,
} from '../../types/wizard';
import { MOCK_PROJECT_MEMBERS } from '../../constants/mockSurveyData';

interface Step10Props {
  wizardState: WizardState;
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

const Step10Review: React.FC<Step10Props> = ({ wizardState }) => {
  const { step1, step2, step3, step4, step5, step6 } = wizardState;

  const dateRange = getEffectiveDateRange(step1);
  const selectedIssueTypes = getSelectedIssueTypes(step3);
  const hasComparison = hasComparisonEnabled(step2.comparisonCriteria);

  const enabledStaleThresholds = selectedIssueTypes.filter(
    (type) => step5.staleThresholds[type]?.enabled
  );

  const selectedMemberNames = step6.selectedMemberIds.map(memberId => {
    const member = MOCK_PROJECT_MEMBERS.find(m => m.id === memberId);
    return member?.displayName || memberId;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Review Your Configuration</h2>
      <p style={styles.description}>
        Here's a summary of your Invisible Work Risk assessment configuration.
        Review the settings below before proceeding.
      </p>

      {/* Basic Details */}
      <div style={styles.section}>
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
      </div>

      {/* Stale Thresholds */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Stale Thresholds</h3>
        {enabledStaleThresholds.length > 0 ? (
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
        )}
      </div>

      {/* Calibration */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Calibration</h3>
        {step6.calibrationChoice === 'collectFeedback' ? (
          <>
            <span style={styles.statusBadge}>Team Survey Enabled</span>
            <div style={styles.calibrationDetails}>
              <div style={styles.calibrationItem}>
                <span style={styles.subLabel}>Survey recipients:</span>
                <div style={styles.tagList}>
                  {selectedMemberNames.map((name) => (
                    <span key={name} style={styles.tagSmall}>{name}</span>
                  ))}
                </div>
              </div>
              <div style={styles.calibrationItem}>
                <span style={styles.subLabel}>Required response rate:</span>
                <span style={styles.subValue}>
                  {step6.quorumPercentage === 100 ? 'All team members' : `${step6.quorumPercentage}% of team`}
                </span>
              </div>
              <div style={styles.calibrationItem}>
                <span style={styles.subLabel}>Survey deadline:</span>
                <span style={styles.subValue}>{formatDate(getSurveyDeadlineDate(step6))}</span>
              </div>
            </div>
          </>
        ) : (
          <span style={styles.statusBadgeDisabled}>No calibration survey</span>
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
      <div style={styles.readyBox}>
        <h4 style={styles.readyTitle}>
          {step6.calibrationChoice === 'collectFeedback'
            ? 'Ready to launch calibration survey'
            : 'Ready to run the assessment'}
        </h4>
        <p style={styles.readyText}>
          {step6.calibrationChoice === 'collectFeedback'
            ? `Click "Launch Survey" to send the calibration survey to your team. Once enough responses are collected (${step6.quorumPercentage}% required), you can generate a calibrated assessment with higher confidence.`
            : 'Click "Run Assessment" to analyse your Jira data based on this configuration. The results will be uncalibrated (lower confidence) since no team survey is being collected.'}
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
};

export default Step10Review;
