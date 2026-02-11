import React, { useState, useRef, useEffect } from 'react';
import Select from '@atlaskit/select';
import { DatePicker } from '@atlaskit/datetime-picker';
import Textfield from '@atlaskit/textfield';
import { Step1Data, DataGrouping, DateRangePresetId } from '../../types/wizard';
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

const Step1Basics: React.FC<Step1Props> = ({ data, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTeams = mockTeams.filter(
    (t) =>
      !data.teamIds.includes(t.value) &&
      t.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTeam = (team: TeamOption) => {
    const newTeamIds = [...data.teamIds, team.value];
    const newTeamNames = [...data.teamNames, team.label];
    onUpdate({
      teamId: newTeamIds[0],
      teamName: newTeamNames.join(', '),
      teamIds: newTeamIds,
      teamNames: newTeamNames,
      assessmentName: data.assessmentName || generateDefaultAssessmentName(newTeamNames[0]),
      isTeamOnboarded: mockTeams.find(t => t.value === newTeamIds[0])?.isOnboarded || false,
      settingsChoice: null,
    });
    setSearchQuery('');
    searchRef.current?.focus();
  };

  const handleRemoveTeam = (teamValue: string) => {
    const newTeamIds = data.teamIds.filter(id => id !== teamValue);
    const newTeamNames = data.teamNames.filter((_, i) => data.teamIds[i] !== teamValue);

    if (newTeamIds.length > 0) {
      onUpdate({
        teamId: newTeamIds[0],
        teamName: newTeamNames.join(', '),
        teamIds: newTeamIds,
        teamNames: newTeamNames,
        isTeamOnboarded: mockTeams.find(t => t.value === newTeamIds[0])?.isOnboarded || false,
        settingsChoice: null,
      });
    } else {
      onUpdate({
        teamId: null,
        teamName: '',
        teamIds: [],
        teamNames: [],
        assessmentName: '',
        isTeamOnboarded: false,
        settingsChoice: null,
      });
    }
  };

  const handleAssessmentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ assessmentName: event.target.value });
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

  const selectedTeams = data.teamIds.length > 0
    ? mockTeams.filter((t) => data.teamIds.includes(t.value))
    : [];
  const selectedDatePreset = datePresetOptions.find(
    (p) => p.value === data.dateRangePreset
  );

  const showDropdown = isSearchFocused && (filteredTeams.length > 0 || searchQuery.length > 0);

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.team()}
        title="Basic Details"
        description="Select the teams whose Jira data you want to assess."
        infoContent={
          <>
            <p>Start by selecting your teams and the time period for analysis.</p>
            <p><strong>Team Selection:</strong> Search for and add the Jira boards or projects you want to assess. You can add multiple teams.</p>
            <p><strong>Date Range:</strong> Select how far back to analyze. Longer periods provide more data but may include outdated patterns. We recommend 3-6 months for most teams.</p>
            <p><strong>Data Grouping:</strong> Choose how to break down the analysis (weekly, fortnightly, or monthly) based on your sprint cadence.</p>
          </>
        }
      />

      <div style={styles.form}>
        {/* Team Selection */}
        <div style={styles.field} data-tour="team-select">
          <label style={styles.label}>Teams</label>
          <p style={styles.fieldDescription}>
            Search for teams to add. You can assess multiple teams together.
          </p>

          {/* Selected team chips */}
          {selectedTeams.length > 0 && (
            <div style={styles.chipContainer}>
              {selectedTeams.map((team) => (
                <span key={team.value} style={styles.chip}>
                  {team.label}
                  <button
                    style={styles.chipRemove}
                    onClick={() => handleRemoveTeam(team.value)}
                    aria-label={`Remove ${team.label}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div style={styles.searchContainer} ref={containerRef}>
            <div style={{
              ...styles.searchInputWrapper,
              ...(isSearchFocused ? styles.searchInputWrapperFocused : {}),
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.searchIcon}>
                <circle cx="6.5" cy="6.5" r="5" stroke="#6B778C" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={selectedTeams.length > 0 ? 'Add another team...' : 'Search for a team...'}
                style={styles.searchInput}
              />
            </div>

            {showDropdown && (
              <div style={styles.searchDropdown}>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => (
                    <button
                      key={team.value}
                      style={styles.searchResult}
                      onClick={() => handleAddTeam(team)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="6" r="3" stroke="#6B778C" strokeWidth="1.25"/>
                        <path d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="#6B778C" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                      <span>{team.label}</span>
                    </button>
                  ))
                ) : (
                  <div style={styles.noResults}>
                    No teams matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assessment Name - only show if team selected */}
        {selectedTeams.length > 0 && (
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

        {/* Date Range - only show if team selected */}
        {selectedTeams.length > 0 && (
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
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px 4px 12px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 500,
  },
  chipRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#0747A6',
    transition: 'background-color 0.1s',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    backgroundColor: '#FAFBFC',
    transition: 'border-color 0.15s, background-color 0.15s',
  },
  searchInputWrapperFocused: {
    borderColor: '#0052CC',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#172B4D',
    fontFamily: 'inherit',
  },
  searchDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.15)',
    zIndex: 100,
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '4px 0',
  },
  searchResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'background-color 0.1s',
  },
  noResults: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
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
