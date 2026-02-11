import React from 'react';
import {
  WizardState,
  getEffectiveDateRange,
  getSelectedIssueTypes,
} from '../../types/wizard';
import { countEnabledFields } from '../../utils/fieldSelectionUtils';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';

interface Step7Props {
  wizardState: WizardState;
  onStepChange?: (step: number) => void;
}

const issueTypeLabels: Record<string, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const Step7Review: React.FC<Step7Props> = ({ wizardState, onStepChange }) => {
  const { step1, step3, fieldSelection } = wizardState;

  const dateRange = getEffectiveDateRange(step1);
  const selectedIssueTypes = getSelectedIssueTypes(step3);
  const groupingLabel = step1.dataGrouping === 'weekly' ? 'Weekly' :
    step1.dataGrouping === 'fortnightly' ? 'Fortnightly' : 'Monthly';

  const enabledFieldCount = countEnabledFields(fieldSelection.configs);
  const issueTypeCount = selectedIssueTypes.length;
  const isPerTeam = fieldSelection.isPerTeamCustomisation;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const teamDisplay = step1.teamNames.length > 0
    ? step1.teamNames.join(', ')
    : step1.teamName || 'Not selected';

  const rows = [
    {
      label: 'Teams',
      value: teamDisplay,
      editStep: 1,
    },
    {
      label: 'Date Range',
      value: `${formatDate(dateRange.startDate)} – ${formatDate(dateRange.endDate)} (${groupingLabel})`,
      editStep: 1,
    },
    {
      label: 'Issue Types',
      value: selectedIssueTypes.map(t => issueTypeLabels[t] || t).join(', '),
      editStep: 2,
    },
    {
      label: 'Fields',
      value: `${enabledFieldCount} fields across ${issueTypeCount} issue type${issueTypeCount !== 1 ? 's' : ''}${isPerTeam ? ' (customised per team)' : ''}`,
      editStep: 3,
    },
  ];

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.review()}
        title="Review Your Configuration"
        description="Review your settings before running the assessment."
        infoContent={
          <>
            <p>Review your configuration before starting the assessment.</p>
            <p><strong>What happens next:</strong> When you click "Run Assessment", we'll analyse your Jira data based on these settings.</p>
            <p><strong>Making changes:</strong> Click "Edit" on any row to go back to that step.</p>
          </>
        }
      />

      {/* Settings Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Setting</th>
              <th style={styles.th}>Value</th>
              <th style={{ ...styles.th, width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} style={styles.tr}>
                <td style={styles.tdLabel}>{row.label}</td>
                <td style={styles.tdValue}>{row.value}</td>
                <td style={styles.tdAction}>
                  {onStepChange && (
                    <button
                      style={styles.editButton}
                      onClick={() => onStepChange(row.editStep)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ready message */}
      <div style={styles.readyBox}>
        <h4 style={styles.readyTitle}>Ready to run the assessment</h4>
        <p style={styles.readyText}>
          Click "Run Assessment" to analyse your Jira data and generate your ticket readiness report.
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '600px',
  },
  tableWrapper: {
    marginBottom: '24px',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #EBECF0',
  },
  tr: {
    borderBottom: '1px solid #F4F5F7',
  },
  tdLabel: {
    padding: '14px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
    width: '120px',
    verticalAlign: 'top',
  },
  tdValue: {
    padding: '14px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  tdAction: {
    padding: '14px 16px',
    textAlign: 'right',
    verticalAlign: 'top',
  },
  editButton: {
    padding: '4px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
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

export default Step7Review;
