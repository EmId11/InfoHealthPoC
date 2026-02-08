import React from 'react';
import { Step3Data, IssueTypeKey } from '../../types/wizard';
import { mockDetectedConfig } from '../../constants/presets';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';
import InfoButton from '../common/InfoButton';
import { WizardStep4Help } from '../../constants/helpContent';

interface Step4Props {
  data: Step3Data;
  onUpdate: (data: Partial<Step3Data>) => void;
}

const issueTypeLabels: Record<IssueTypeKey, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const Step4IssueTypes: React.FC<Step4Props> = ({ data, onUpdate }) => {
  const handleIssueTypeToggle = (key: IssueTypeKey) => {
    onUpdate({
      issueTypes: {
        ...data.issueTypes,
        [key]: !data.issueTypes[key],
      },
    });
  };

  const selectedCount = Object.values(data.issueTypes).filter(Boolean).length;

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.issueTypes()}
        title="Issue Types"
        description="Select which Jira issue types to include in the analysis."
        tourId={3}
        infoContent={
          <>
            <p>Choose which Jira issue types to include in the health assessment.</p>
            <p><strong>Why this matters:</strong> Different issue types may have different workflow patterns. Including the right types ensures accurate analysis.</p>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Include Stories, Bugs, and Tasks for a complete picture</li>
              <li>Include Epics if you track them at the team level</li>
              <li>Sub-tasks can be included or excluded based on how you use them</li>
            </ul>
            <p>The assessment will detect patterns like stale issues, incomplete work, and invisible tasks across the selected types.</p>
          </>
        }
      />

      {/* Issue Types Section */}
      <div style={styles.section} data-tour="issue-types">
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Issue types to include</h3>
          <InfoButton title="Issue Types" size="inline">
            {WizardStep4Help.issueTypesSection}
          </InfoButton>
          <span style={styles.detectedBadge}>Detected from Jira</span>
        </div>
        <p style={styles.sectionDescription}>
          Deselect any issue types you don't want to include in the analysis.
        </p>

        <div style={styles.chipGrid}>
          {mockDetectedConfig.issueTypes.map((type) => {
            const key = type.key as IssueTypeKey;
            const isSelected = data.issueTypes[key];
            return (
              <button
                key={type.key}
                type="button"
                style={{
                  ...styles.chip,
                  ...(isSelected ? styles.chipSelected : styles.chipUnselected),
                }}
                onClick={() => handleIssueTypeToggle(key)}
              >
                {issueTypeLabels[key] || type.name}
              </button>
            );
          })}
        </div>
        <span style={styles.chipCount}>
          {selectedCount} type{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>

      {/* Info about issue types */}
      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          The assessment will analyse patterns across these issue types to detect potential
          invisible work. Including all relevant types helps provide a more accurate risk assessment.
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
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  detectedBadge: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  sectionDescription: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  chip: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: '2px solid transparent',
  },
  chipSelected: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: '2px solid #0052CC',
  },
  chipUnselected: {
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    border: '2px solid #DFE1E6',
  },
  chipCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
};

export default Step4IssueTypes;
