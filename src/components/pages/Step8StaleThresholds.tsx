import React from 'react';
import { Step5Data, IssueTypeKey } from '../../types/wizard';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';
import InfoButton from '../common/InfoButton';
import { WizardStep8Help } from '../../constants/helpContent';

interface Step8Props {
  data: Step5Data;
  selectedIssueTypes: IssueTypeKey[];
  onUpdate: (data: Partial<Step5Data>) => void;
}

const issueTypeLabels: Record<IssueTypeKey, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const issueTypeDescriptions: Record<IssueTypeKey, string> = {
  story: 'User stories that haven\'t been updated',
  bug: 'Bugs that have been sitting without progress',
  task: 'Tasks that haven\'t moved forward',
  epic: 'Epics without recent activity',
  subtask: 'Sub-tasks left without updates',
};

const Step8StaleThresholds: React.FC<Step8Props> = ({ data, selectedIssueTypes, onUpdate }) => {
  const handleToggle = (issueType: IssueTypeKey) => {
    onUpdate({
      staleThresholds: {
        ...data.staleThresholds,
        [issueType]: {
          ...data.staleThresholds[issueType],
          enabled: !data.staleThresholds[issueType].enabled,
        },
      },
    });
  };

  const handleDaysChange = (issueType: IssueTypeKey, value: string) => {
    const days = parseInt(value, 10);
    onUpdate({
      staleThresholds: {
        ...data.staleThresholds,
        [issueType]: {
          ...data.staleThresholds[issueType],
          days: isNaN(days) ? 0 : Math.max(1, days),
        },
      },
    });
  };

  const enabledCount = selectedIssueTypes.filter(
    (type) => data.staleThresholds[type].enabled
  ).length;

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.stale()}
        title="Stale Item Thresholds"
        description="Set how many days before issues are considered stuck or forgotten."
        tourId={5}
        infoContent={
          <>
            <p>Stale thresholds help identify work items that may need attention.</p>
            <p><strong>What counts as stale:</strong> An issue is considered stale when it hasn't been updated (comments, status changes, or field updates) for the specified number of days.</p>
            <p><strong>Setting thresholds:</strong></p>
            <ul>
              <li><strong>Stories/Tasks:</strong> Typically 7-14 days during active development</li>
              <li><strong>Bugs:</strong> Often shorter (5-10 days) to ensure timely fixes</li>
              <li><strong>Epics:</strong> Can be longer (14-30 days) as they track broader initiatives</li>
            </ul>
            <p>You can adjust these based on your team's workflow. Issues flagged as stale will appear in the assessment report for review.</p>
          </>
        }
      />

      <div style={styles.section} data-tour="stale-thresholds">
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionTitle}>Days until considered stale</h3>
          <InfoButton title="Stale Thresholds" size="inline">
            {WizardStep8Help.staleThresholdsSection}
          </InfoButton>
        </div>
        <p style={styles.sectionDescription}>
          For each issue type, set how many days without activity makes an item stale.
          Different issue types often have different expectations—bugs may need faster
          attention than epics.
        </p>

        <div style={styles.thresholdsList}>
          {selectedIssueTypes.map((issueType) => {
            const threshold = data.staleThresholds[issueType];
            return (
              <div key={issueType} style={styles.thresholdItem}>
                <div style={styles.thresholdHeader}>
                  <button
                    type="button"
                    onClick={() => handleToggle(issueType)}
                    style={{
                      ...styles.checkbox,
                      ...(threshold.enabled ? styles.checkboxChecked : {}),
                    }}
                  >
                    {threshold.enabled && <span style={styles.checkmark}>✓</span>}
                  </button>
                  <div style={styles.thresholdInfo}>
                    <span style={styles.thresholdName}>{issueTypeLabels[issueType]}</span>
                    <span style={styles.thresholdDescription}>
                      {issueTypeDescriptions[issueType]}
                    </span>
                  </div>
                </div>

                {threshold.enabled && (
                  <div style={styles.thresholdConfig}>
                    <div style={styles.daysInput}>
                      <input
                        type="number"
                        name={`stale-${issueType}`}
                        value={threshold.days}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleDaysChange(issueType, e.target.value)
                        }
                        min={1}
                        style={styles.numberInput}
                      />
                      <span style={styles.daysLabel}>days</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span style={styles.countText}>
          {enabledCount} of {selectedIssueTypes.length} issue types configured
        </span>
      </div>

      {enabledCount === 0 && (
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            No stale thresholds enabled. The assessment will skip stale item analysis.
            If your team doesn't track stale items, that's okay—you can proceed.
          </p>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '560px',
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
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px',
  },
  sectionDescription: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  thresholdsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  thresholdItem: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  thresholdHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    marginTop: '2px',
  },
  checkboxChecked: {
    backgroundColor: '#0052CC',
    border: '2px solid #0052CC',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 700,
  },
  thresholdInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  thresholdName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  thresholdDescription: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  thresholdConfig: {
    padding: '0 16px 16px 48px',
  },
  daysInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  numberInput: {
    width: '60px',
    padding: '6px 10px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    textAlign: 'center' as const,
    outline: 'none',
  },
  daysLabel: {
    fontSize: '14px',
    color: '#6B778C',
  },
  countText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
};

export default Step8StaleThresholds;
