import React from 'react';
import { OrganizationDefaults } from '../../../../types/admin';
import { IssueTypeKey } from '../../../../types/wizard';

interface JiraStandardsStep9ReviewProps {
  defaults: OrganizationDefaults;
}

const ISSUE_TYPE_LABELS: Record<IssueTypeKey, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const CADENCE_LABELS: Record<string, string> = {
  weekly: '1 Week',
  fortnightly: '2 Weeks',
  threeWeeks: '3 Weeks',
  monthly: '4 Weeks',
  custom: 'Custom',
};

const PRESET_LABELS: Record<string, { label: string; description: string }> = {
  quickStart: { label: 'Quick Start', description: '6 essential dimensions' },
  comprehensive: { label: 'Comprehensive', description: 'All 12 dimensions' },
  planningFocus: { label: 'Planning Focus', description: '7 planning dimensions' },
  executionFocus: { label: 'Execution Focus', description: '7 execution dimensions' },
};

const JiraStandardsStep9Review: React.FC<JiraStandardsStep9ReviewProps> = ({ defaults }) => {
  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Review your organization standards below. You can edit these settings anytime from the
          Jira Standards section of the admin dashboard.
        </p>
      </div>

      {/* Issue Types */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 6h8M6 10h8M6 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Issue Types</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.issueTypes?.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.issueTypes?.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.issueTypes?.mode === 'org-defined' && defaults.issueTypes?.value ? (
          <div style={styles.issueTypesList}>
            {defaults.issueTypes.value
              .filter((it) => it.enabled)
              .map((it) => (
                <div key={it.key} style={styles.issueTypeItem}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={styles.issueTypeLabel}>{ISSUE_TYPE_LABELS[it.key]}</span>
                </div>
              ))}
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will choose their own issue types during assessment setup.
          </p>
        )}
      </div>

      {/* Stale Thresholds */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Stale Thresholds</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.staleThresholds.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.staleThresholds.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.staleThresholds.mode === 'org-defined' && defaults.staleThresholds.value ? (
          <div style={styles.thresholdGrid}>
            {(Object.keys(defaults.staleThresholds.value) as IssueTypeKey[]).map((issueType) => (
              <div key={issueType} style={styles.thresholdItem}>
                <span style={styles.thresholdLabel}>{ISSUE_TYPE_LABELS[issueType]}</span>
                <span style={styles.thresholdValue}>
                  {defaults.staleThresholds.value![issueType].days} days
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will configure their own stale thresholds during assessment setup.
          </p>
        )}
      </div>

      {/* Sprint Cadence */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Sprint Cadence</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.sprintCadence.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.sprintCadence.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.sprintCadence.mode === 'org-defined' && defaults.sprintCadence.value ? (
          <div style={styles.cadenceDisplay}>
            <span style={styles.cadenceValue}>
              {CADENCE_LABELS[defaults.sprintCadence.value.cadence]}
            </span>
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will choose their own sprint cadence during assessment setup.
          </p>
        )}
      </div>

      {/* Dimension Presets */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Dimension Presets</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.dimensionPresets.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.dimensionPresets.mode === 'org-defined' ? 'Controlled by org' : 'All available'}
            </span>
          </div>
        </div>

        {defaults.dimensionPresets.mode === 'org-defined' && defaults.dimensionPresets.value ? (
          <div style={styles.presetList}>
            {defaults.dimensionPresets.value.map((presetId) => {
              const preset = PRESET_LABELS[presetId];
              if (!preset) return null;
              return (
                <div key={presetId} style={styles.presetItem}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 6-6" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={styles.presetContent}>
                    <span style={styles.presetLabel}>{preset.label}</span>
                    <span style={styles.presetDesc}>{preset.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will have access to all dimension presets during assessment setup.
          </p>
        )}
      </div>

      {/* Field Health */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 8h8M6 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Field Health</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.fieldHealth?.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.fieldHealth?.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.fieldHealth?.mode === 'org-defined' && defaults.fieldHealth?.value ? (
          <div style={styles.fieldHealthSummary}>
            <span style={styles.summaryText}>
              {defaults.fieldHealth.value.standardFields.filter(f => f.enabled).length} standard fields
              {defaults.fieldHealth.value.customFields.length > 0 && `, ${defaults.fieldHealth.value.customFields.filter(f => f.enabled).length} custom fields`}
            </span>
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will configure their own field health checks during assessment setup.
          </p>
        )}
      </div>

      {/* Workflows */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h4M12 10h4M10 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Workflows</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.workflows?.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.workflows?.mode === 'org-defined' ? 'Org-wide standard' : 'Auto-detected'}
            </span>
          </div>
        </div>

        {defaults.workflows?.mode === 'org-defined' && defaults.workflows?.value ? (
          <div style={styles.workflowSummary}>
            <span style={styles.summaryText}>
              {defaults.workflows.value.length} issue types configured
            </span>
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Workflows will be auto-detected from each team's Jira project.
          </p>
        )}
      </div>

      {/* Estimation */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 9h3M6 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="10" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Estimation</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.estimation?.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.estimation?.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.estimation?.mode === 'org-defined' && defaults.estimation?.value ? (
          <div style={styles.estimationSummary}>
            <span style={styles.summaryText}>
              {defaults.estimation.value.filter(p => p.isEstimated).length} of {defaults.estimation.value.length} issue types require estimation
            </span>
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will configure their own estimation policies during assessment setup.
          </p>
        )}
      </div>

      {/* Blockers */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={styles.sectionTitleContainer}>
            <h3 style={styles.sectionTitle}>Blockers</h3>
            <span style={{
              ...styles.modeBadge,
              ...(defaults.blockers?.mode === 'org-defined' ? styles.modeBadgeOrg : styles.modeBadgeTeam),
            }}>
              {defaults.blockers?.mode === 'org-defined' ? 'Org-wide standard' : 'Teams decide'}
            </span>
          </div>
        </div>

        {defaults.blockers?.mode === 'org-defined' && defaults.blockers?.value ? (
          <div style={styles.blockerSummary}>
            <span style={styles.summaryText}>
              {[
                defaults.blockers.value.useFlags && 'Flags',
                defaults.blockers.value.useLabels && 'Labels',
                defaults.blockers.value.useStatus && 'Status',
                defaults.blockers.value.useLinks && 'Links',
              ].filter(Boolean).join(', ') || 'No methods configured'}
            </span>
          </div>
        ) : (
          <p style={styles.teamDecidesText}>
            Teams will configure their own blocker detection during assessment setup.
          </p>
        )}
      </div>

      <div style={styles.successBox}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#E3FCEF"/>
          <path d="M8 12l2.5 2.5L16 9" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div style={styles.successContent}>
          <p style={styles.successTitle}>Ready to complete setup</p>
          <p style={styles.successDesc}>
            Click "Finish Setup" to save these standards. Teams will see these settings when
            creating new assessments.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  intro: {
    marginBottom: '8px',
  },
  introText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.6,
  },
  section: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
  },
  sectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    width: 'fit-content',
  },
  modeBadgeOrg: {
    backgroundColor: '#EAE6FF',
    color: '#5243AA',
  },
  modeBadgeTeam: {
    backgroundColor: '#E3FCEF',
    color: '#006644',
  },
  issueTypesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  issueTypeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
  },
  issueTypeLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  thresholdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  },
  thresholdItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    textAlign: 'center',
  },
  thresholdLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
  },
  thresholdValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  teamDecidesText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  cadenceDisplay: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  cadenceValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  presetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  presetItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  presetContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  presetLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  presetDesc: {
    fontSize: '12px',
    color: '#6B778C',
  },
  fieldHealthSummary: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  summaryText: {
    fontSize: '14px',
    color: '#172B4D',
  },
  workflowSummary: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  estimationSummary: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  blockerSummary: {
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
  },
  successBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  successContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  successTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#006644',
  },
  successDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#006644',
    lineHeight: 1.5,
  },
};

export default JiraStandardsStep9Review;
