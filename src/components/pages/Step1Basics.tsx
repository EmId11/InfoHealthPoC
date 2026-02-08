import React from 'react';
import Select, { components, OptionProps, SingleValueProps } from '@atlaskit/select';
import { DatePicker } from '@atlaskit/datetime-picker';
import Textfield from '@atlaskit/textfield';
import { Step1Data, DataGrouping, DateRangePresetId, SettingsChoice } from '../../types/wizard';
import { mockTeams, dateRangePresets, TeamOption } from '../../constants/presets';
import { generateDefaultAssessmentName } from '../../types/home';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';

interface Step1Props {
  data: Step1Data;
  onUpdate: (data: Partial<Step1Data>) => void;
}

const groupingOptions = [
  { label: 'Monthly', value: 'monthly' as DataGrouping },
  { label: 'Fortnightly', value: 'fortnightly' as DataGrouping },
  { label: 'Weekly', value: 'weekly' as DataGrouping },
];

const datePresetOptions = dateRangePresets.map((p) => ({
  label: p.label,
  value: p.id as DateRangePresetId,
}));

// Custom option component to show onboarding status
const TeamOptionComponent = (props: OptionProps<TeamOption, false>) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{data.label}</span>
        {data.isOnboarded ? (
          <span style={badgeStyles.configured}>Configured</span>
        ) : (
          <span style={badgeStyles.new}>New</span>
        )}
      </div>
    </components.Option>
  );
};

// Custom single value component to show selected team with badge
const TeamSingleValue = (props: SingleValueProps<TeamOption, false>) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{data.label}</span>
        {data.isOnboarded ? (
          <span style={badgeStyles.configuredSmall}>Configured</span>
        ) : (
          <span style={badgeStyles.newSmall}>New</span>
        )}
      </div>
    </components.SingleValue>
  );
};

const badgeStyles: { [key: string]: React.CSSProperties } = {
  configured: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  new: {
    padding: '2px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  configuredSmall: {
    padding: '1px 6px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '10px',
    fontWeight: 500,
    borderRadius: '8px',
  },
  newSmall: {
    padding: '1px 6px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    fontSize: '10px',
    fontWeight: 500,
    borderRadius: '8px',
  },
};

const Step1Basics: React.FC<Step1Props> = ({ data, onUpdate }) => {
  const handleTeamChange = (option: TeamOption | null) => {
    if (option) {
      onUpdate({
        teamId: option.value,
        teamName: option.label,
        assessmentName: data.assessmentName || generateDefaultAssessmentName(option.label),
        isTeamOnboarded: option.isOnboarded,
        settingsChoice: option.isOnboarded ? null : null, // Reset choice when team changes
      });
    } else {
      onUpdate({
        teamId: null,
        teamName: '',
        assessmentName: '',
        isTeamOnboarded: false,
        settingsChoice: null,
      });
    }
  };

  const handleAssessmentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ assessmentName: event.target.value });
  };

  const handleSettingsChoice = (choice: SettingsChoice) => {
    onUpdate({ settingsChoice: choice });
  };

  const handleDatePresetChange = (
    option: { label: string; value: DateRangePresetId } | null
  ) => {
    if (!option) return;
    const preset = dateRangePresets.find((p) => p.id === option.value);
    if (preset) {
      onUpdate({
        dateRangePreset: option.value,
        customDateRange: preset.getRange(),
      });
    }
  };

  const handleGroupingChange = (option: { label: string; value: DataGrouping }) => {
    onUpdate({ dataGrouping: option.value });
  };

  const handleStartDateChange = (value: string) => {
    onUpdate({
      customDateRange: { ...data.customDateRange, startDate: value },
    });
  };

  const handleEndDateChange = (value: string) => {
    onUpdate({
      customDateRange: { ...data.customDateRange, endDate: value },
    });
  };

  const selectedTeam = mockTeams.find((t) => t.value === data.teamId) || null;
  const selectedDatePreset = datePresetOptions.find(
    (p) => p.value === data.dateRangePreset
  );

  const formatLastSetupDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.team()}
        title="Basic Details"
        description="Select your team and the time period to analyse."
        tourId={1}
        infoContent={
          <>
            <p>Start by selecting your team and the time period for analysis.</p>
            <p><strong>Team Selection:</strong> Choose the Jira board or project that represents your team's work. Teams marked as "Configured" have been assessed before and may have saved settings.</p>
            <p><strong>Date Range:</strong> Select how far back to analyze. Longer periods provide more data but may include outdated patterns. We recommend 3-6 months for most teams.</p>
            <p><strong>Data Grouping:</strong> Choose how to break down the analysis (weekly, fortnightly, or monthly) based on your sprint cadence.</p>
          </>
        }
      />

      <div style={styles.form}>
        {/* Team Selection */}
        <div style={styles.field} data-tour="team-select">
          <label style={styles.label}>Team</label>
          <p style={styles.fieldDescription}>
            Select the team whose Jira data you want to assess.
          </p>
          <Select
            inputId="team-select"
            options={mockTeams}
            value={selectedTeam}
            onChange={handleTeamChange}
            placeholder="Select a team..."
            isClearable
            components={{
              Option: TeamOptionComponent,
              SingleValue: TeamSingleValue,
            }}
          />
        </div>

        {/* Team Status Message */}
        {selectedTeam && (
          <div style={styles.teamStatusSection}>
            {selectedTeam.isOnboarded ? (
              <>
                <div style={styles.onboardedBox}>
                  <div style={styles.onboardedHeader}>
                    <span style={styles.onboardedIcon}>✓</span>
                    <span style={styles.onboardedTitle}>Team previously configured</span>
                  </div>
                  <p style={styles.onboardedText}>
                    {selectedTeam.label} was last set up on {formatLastSetupDate(selectedTeam.setupInfo?.setupDate)}.
                    You can use the previous settings or start fresh with a new configuration.
                  </p>
                </div>

                <div style={styles.settingsChoice}>
                  <label style={styles.choiceLabel}>How would you like to proceed?</label>
                  <div style={styles.choiceButtons}>
                    <button
                      type="button"
                      onClick={() => handleSettingsChoice('usePrevious')}
                      style={{
                        ...styles.choiceButton,
                        ...(data.settingsChoice === 'usePrevious' ? styles.choiceButtonSelected : {}),
                      }}
                    >
                      <span style={styles.choiceButtonTitle}>Use previous settings</span>
                      <span style={styles.choiceButtonDesc}>
                        Quick set-up using your existing configuration
                      </span>
                      <span style={styles.timeEstimate}>~1 min</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingsChoice('startFresh')}
                      style={{
                        ...styles.choiceButton,
                        ...(data.settingsChoice === 'startFresh' ? styles.choiceButtonSelected : {}),
                      }}
                    >
                      <span style={styles.choiceButtonTitle}>Start fresh</span>
                      <span style={styles.choiceButtonDesc}>
                        Configure all settings from scratch
                      </span>
                      <span style={styles.timeEstimate}>~3 min</span>
                    </button>
                  </div>
                </div>

                {data.settingsChoice === 'usePrevious' && selectedTeam.setupInfo && (
                  <div style={styles.setupDetailsBox}>
                    <div style={styles.setupDetailsHeader}>Previous setup details</div>
                    <div style={styles.setupDetailsGrid}>
                      <div style={styles.setupDetailItem}>
                        <span style={styles.setupDetailLabel}>Set up by</span>
                        <span style={styles.setupDetailValue}>
                          {selectedTeam.setupInfo.setupByName}
                          {selectedTeam.setupInfo.setupByIsAdmin && (
                            <span style={styles.adminBadge}>Admin</span>
                          )}
                        </span>
                      </div>
                      <div style={styles.setupDetailItem}>
                        <span style={styles.setupDetailLabel}>Date</span>
                        <span style={styles.setupDetailValue}>
                          {formatLastSetupDate(selectedTeam.setupInfo.setupDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.newTeamBox}>
                <div style={styles.newTeamHeader}>
                  <span style={styles.newTeamIcon}>★</span>
                  <span style={styles.newTeamTitle}>First-time set-up</span>
                </div>
                <p style={styles.newTeamText}>
                  This is the first health assessment for {selectedTeam.label}. We'll guide you
                  through configuring your Jira setup and team practices. This takes about
                  2-3 minutes and only needs to be done once — future assessments will
                  remember your settings.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Assessment Name - only show if team selected and (not onboarded OR has made a choice) */}
        {selectedTeam && (!selectedTeam.isOnboarded || data.settingsChoice) && (
          <div style={styles.field}>
            <label style={styles.label}>Assessment Name</label>
            <p style={styles.fieldDescription}>
              Give this assessment a name to help you identify it later.
            </p>
            <Textfield
              value={data.assessmentName}
              onChange={handleAssessmentNameChange}
              placeholder="e.g., Platform Team - Jan 2025"
            />
          </div>
        )}

        {/* Date Range - only show if team selected and (not onboarded OR has made a choice) */}
        {selectedTeam && (!selectedTeam.isOnboarded || data.settingsChoice) && (
          <>
            <div style={styles.field} data-tour="date-range">
              <label style={styles.label}>Analysis period</label>
              <p style={styles.fieldDescription}>
                Choose the date range for the assessment. We recommend at least 3 months of data
                for meaningful insights.
              </p>
              <Select
                inputId="date-preset"
                options={datePresetOptions}
                value={selectedDatePreset}
                onChange={handleDatePresetChange}
                placeholder="Select date range..."
              />
              {data.dateRangePreset === 'custom' && (
                <div style={styles.datePickerRow}>
                  <div style={styles.datePicker}>
                    <DatePicker
                      id="start-date"
                      value={data.customDateRange.startDate}
                      onChange={handleStartDateChange}
                      placeholder="Start date"
                    />
                  </div>
                  <span style={styles.dateSeparator}>to</span>
                  <div style={styles.datePicker}>
                    <DatePicker
                      id="end-date"
                      value={data.customDateRange.endDate}
                      onChange={handleEndDateChange}
                      placeholder="End date"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Grouping */}
            <div style={styles.field} data-tour="data-grouping">
              <label style={styles.label}>Data grouping</label>
              <p style={styles.fieldDescription}>
                How should we group data points in charts and trends?
              </p>
              <div style={styles.pillGroup}>
                {groupingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.pill,
                      ...(data.dataGrouping === option.value ? styles.pillSelected : {}),
                    }}
                    onClick={() => handleGroupingChange(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  fieldDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  teamStatusSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  onboardedBox: {
    padding: '16px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    border: '1px solid #ABF5D1',
  },
  onboardedHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  onboardedIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#006644',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardedTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#006644',
  },
  onboardedText: {
    margin: 0,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  settingsChoice: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  choiceLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  choiceButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  choiceButton: {
    padding: '16px',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    transition: 'all 0.15s ease',
  },
  choiceButtonSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#F4F5F7',
  },
  choiceButtonTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  choiceButtonDesc: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  timeEstimate: {
    marginTop: '8px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#0052CC',
  },
  setupDetailsBox: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  setupDetailsHeader: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    marginBottom: '12px',
  },
  setupDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  setupDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  setupDetailLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  setupDetailValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminBadge: {
    padding: '2px 6px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '8px',
    textTransform: 'uppercase',
  },
  newTeamBox: {
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  newTeamHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  newTeamIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newTeamTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0747A6',
  },
  newTeamText: {
    margin: 0,
    fontSize: '13px',
    color: '#172B4D',
    lineHeight: 1.5,
  },
  datePickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  datePicker: {
    flex: 1,
  },
  dateSeparator: {
    color: '#6B778C',
    fontSize: '14px',
  },
  pillGroup: {
    display: 'flex',
    gap: '8px',
  },
  pill: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid #DFE1E6',
    borderRadius: '20px',
    backgroundColor: '#FFFFFF',
    color: '#5E6C84',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pillSelected: {
    backgroundColor: '#0052CC',
    border: '1px solid #0052CC',
    color: '#FFFFFF',
  },
};

export default Step1Basics;
