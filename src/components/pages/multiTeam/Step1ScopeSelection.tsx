import React, { useState, useEffect, useMemo } from 'react';
import Select from '@atlaskit/select';
import { DatePicker } from '@atlaskit/datetime-picker';
import { Checkbox } from '@atlaskit/checkbox';
import StepHeader from '../../shared/StepHeader';
import type {
  AssessmentScope,
  ScopeSelection,
  MultiTeamStep1Data,
} from '../../../types/multiTeamAssessment';
import { getScopeTypeDisplayName } from '../../../types/multiTeamAssessment';
import type { TeamAttributeConfig, AttributeValue } from '../../../types/admin';
import type { DataGrouping, DateRangePresetId } from '../../../types/wizard';
import { dateRangePresets, mockTeams, TeamOption } from '../../../constants/presets';
import { evaluateFilterRule } from '../../../types/admin';

interface Step1ScopeSelectionProps {
  data: MultiTeamStep1Data;
  onUpdate: (data: Partial<MultiTeamStep1Data>) => void;
  teamAttributes: TeamAttributeConfig;
}

type ScopeOption = {
  label: string;
  value: AssessmentScope;
  description: string;
  icon: string;
};

const scopeOptions: ScopeOption[] = [
  {
    value: 'single-team',
    label: 'Single Team',
    description: 'Assess one team individually',
    icon: '👤',
  },
  {
    value: 'team-of-teams',
    label: 'Team of Teams',
    description: 'Assess all teams within a tribe or program',
    icon: '👥',
  },
  {
    value: 'portfolio',
    label: 'Portfolio',
    description: 'Assess all teams across an entire portfolio',
    icon: '🏢',
  },
  {
    value: 'custom-selection',
    label: 'Custom Selection',
    description: 'Hand-pick specific teams to assess together',
    icon: '✋',
  },
];

const groupingOptions = [
  { label: 'Monthly', value: 'monthly' as DataGrouping },
  { label: 'Fortnightly', value: 'fortnightly' as DataGrouping },
  { label: 'Weekly', value: 'weekly' as DataGrouping },
];

const datePresetOptions = dateRangePresets.map((p) => ({
  label: p.label,
  value: p.id as DateRangePresetId,
}));

const Step1ScopeSelection: React.FC<Step1ScopeSelectionProps> = ({
  data,
  onUpdate,
  teamAttributes,
}) => {
  // Get Portfolio and Team of Teams attribute values
  const portfolioAttribute = teamAttributes.attributes.find(
    (attr) => attr.type === 'org-structure' && attr.name === 'Portfolio'
  );
  const teamOfTeamsAttribute = teamAttributes.attributes.find(
    (attr) => attr.type === 'org-structure' && attr.name === 'Team of Teams'
  );

  const portfolioValues = useMemo(() => {
    if (!portfolioAttribute) return [];
    return teamAttributes.attributeValues.filter(
      (val) => val.attributeId === portfolioAttribute.id
    );
  }, [portfolioAttribute, teamAttributes.attributeValues]);

  const teamOfTeamsValues = useMemo(() => {
    if (!teamOfTeamsAttribute) return [];
    return teamAttributes.attributeValues.filter(
      (val) => val.attributeId === teamOfTeamsAttribute.id
    );
  }, [teamOfTeamsAttribute, teamAttributes.attributeValues]);

  // Resolve teams for a given scope
  const resolveTeamsForScope = (
    scopeType: AssessmentScope,
    portfolioId?: string,
    totId?: string,
    selectedTeamIds?: string[]
  ): string[] => {
    const allTeams = mockTeams;

    switch (scopeType) {
      case 'single-team':
        return selectedTeamIds?.slice(0, 1) || [];

      case 'team-of-teams': {
        if (!totId) return [];
        const totValue = teamOfTeamsValues.find((v) => v.id === totId);
        if (!totValue) return [];

        // Find teams matching the filter rule or manually assigned
        const matchingTeams: string[] = [];
        allTeams.forEach((team) => {
          const matchesFilter = evaluateFilterRule(totValue.filterRule, {
            label: team.label,
            value: team.value,
            isOnboarded: team.isOnboarded,
          });
          const isManual = totValue.manualTeamIds.includes(team.value);
          if (matchesFilter || isManual) {
            matchingTeams.push(team.value);
          }
        });
        return matchingTeams;
      }

      case 'portfolio': {
        if (!portfolioId) return [];
        const portfolioValue = portfolioValues.find((v) => v.id === portfolioId);
        if (!portfolioValue) return [];

        // Find Teams of Teams belonging to this Portfolio
        const totsInPortfolio = teamOfTeamsValues.filter(
          (tot) => tot.parentValueId === portfolioId ||
            portfolioValue.manualTeamOfTeamsIds?.includes(tot.id)
        );

        // Find all teams in those Teams of Teams
        const matchingTeams = new Set<string>();
        totsInPortfolio.forEach((tot) => {
          allTeams.forEach((team) => {
            const matchesFilter = evaluateFilterRule(tot.filterRule, {
              label: team.label,
              value: team.value,
              isOnboarded: team.isOnboarded,
            });
            const isManual = tot.manualTeamIds.includes(team.value);
            if (matchesFilter || isManual) {
              matchingTeams.add(team.value);
            }
          });
        });
        return Array.from(matchingTeams);
      }

      case 'custom-selection':
        return selectedTeamIds || [];

      default:
        return [];
    }
  };

  // Handle scope type change
  const handleScopeTypeChange = (scopeType: AssessmentScope) => {
    const newScope: ScopeSelection = {
      scopeType,
      resolvedTeamIds: [],
      resolvedTeamCount: 0,
    };

    onUpdate({
      scope: newScope,
      displayName: '',
    });
  };

  // Handle portfolio selection
  const handlePortfolioChange = (option: { value: string; label: string } | null) => {
    if (!option) {
      onUpdate({
        scope: {
          ...data.scope,
          portfolioValueId: undefined,
          portfolioName: undefined,
          resolvedTeamIds: [],
          resolvedTeamCount: 0,
        },
        displayName: '',
      });
      return;
    }

    const resolvedTeamIds = resolveTeamsForScope('portfolio', option.value);
    onUpdate({
      scope: {
        ...data.scope,
        portfolioValueId: option.value,
        portfolioName: option.label,
        resolvedTeamIds,
        resolvedTeamCount: resolvedTeamIds.length,
      },
      displayName: option.label,
    });
  };

  // Handle Team of Teams selection
  const handleTeamOfTeamsChange = (option: { value: string; label: string } | null) => {
    if (!option) {
      onUpdate({
        scope: {
          ...data.scope,
          teamOfTeamsValueId: undefined,
          teamOfTeamsName: undefined,
          resolvedTeamIds: [],
          resolvedTeamCount: 0,
        },
        displayName: '',
      });
      return;
    }

    const resolvedTeamIds = resolveTeamsForScope('team-of-teams', undefined, option.value);
    onUpdate({
      scope: {
        ...data.scope,
        teamOfTeamsValueId: option.value,
        teamOfTeamsName: option.label,
        resolvedTeamIds,
        resolvedTeamCount: resolvedTeamIds.length,
      },
      displayName: option.label,
    });
  };

  // Handle custom team selection
  const handleTeamToggle = (teamId: string, checked: boolean) => {
    const currentTeams = data.scope.selectedTeamIds || [];
    let newTeams: string[];

    if (checked) {
      newTeams = [...currentTeams, teamId];
    } else {
      newTeams = currentTeams.filter((id) => id !== teamId);
    }

    onUpdate({
      scope: {
        ...data.scope,
        selectedTeamIds: newTeams,
        resolvedTeamIds: newTeams,
        resolvedTeamCount: newTeams.length,
      },
      displayName: `${newTeams.length} Teams Selected`,
    });
  };

  // Handle date preset change
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

  // Handle grouping change
  const handleGroupingChange = (option: { label: string; value: DataGrouping }) => {
    onUpdate({ dataGrouping: option.value });
  };

  const selectedDatePreset = datePresetOptions.find(
    (p) => p.value === data.dateRangePreset
  );

  // Dropdown options
  const portfolioOptions = portfolioValues.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  const teamOfTeamsOptions = teamOfTeamsValues.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  const selectedPortfolio = portfolioOptions.find(
    (p) => p.value === data.scope.portfolioValueId
  );
  const selectedTeamOfTeams = teamOfTeamsOptions.find(
    (t) => t.value === data.scope.teamOfTeamsValueId
  );

  return (
    <div style={styles.container}>
      <StepHeader
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
        }
        title="Assessment Scope"
        description="Choose which teams to include in this assessment."
        tourId={1}
        infoContent={
          <>
            <p>Select the scope of your assessment:</p>
            <p><strong>Single Team:</strong> Traditional single-team assessment</p>
            <p><strong>Team of Teams:</strong> Assess all teams within a tribe or program together</p>
            <p><strong>Portfolio:</strong> Assess all teams across an entire portfolio for executive insights</p>
            <p><strong>Custom Selection:</strong> Hand-pick specific teams to assess together</p>
          </>
        }
      />

      <div style={styles.form}>
        {/* Scope Type Selection */}
        <div style={styles.field}>
          <label style={styles.label}>What would you like to assess?</label>
          <div style={styles.scopeCards}>
            {scopeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleScopeTypeChange(option.value)}
                style={{
                  ...styles.scopeCard,
                  ...(data.scope.scopeType === option.value ? styles.scopeCardSelected : {}),
                }}
              >
                <span style={styles.scopeIcon}>{option.icon}</span>
                <span style={styles.scopeCardTitle}>{option.label}</span>
                <span style={styles.scopeCardDesc}>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Selection */}
        {data.scope.scopeType === 'portfolio' && (
          <div style={styles.field}>
            <label style={styles.label}>Select Portfolio</label>
            <p style={styles.fieldDescription}>
              Choose which portfolio to assess. All teams within this portfolio will be included.
            </p>
            <Select
              inputId="portfolio-select"
              options={portfolioOptions}
              value={selectedPortfolio}
              onChange={handlePortfolioChange}
              placeholder="Select a portfolio..."
              isClearable
            />
            {data.scope.resolvedTeamCount > 0 && (
              <div style={styles.teamCountBadge}>
                <span style={styles.teamCountIcon}>👥</span>
                <span>{data.scope.resolvedTeamCount} teams will be assessed</span>
              </div>
            )}
          </div>
        )}

        {/* Team of Teams Selection */}
        {data.scope.scopeType === 'team-of-teams' && (
          <div style={styles.field}>
            <label style={styles.label}>Select Team of Teams</label>
            <p style={styles.fieldDescription}>
              Choose which tribe or program to assess. All teams within this grouping will be included.
            </p>
            <Select
              inputId="tot-select"
              options={teamOfTeamsOptions}
              value={selectedTeamOfTeams}
              onChange={handleTeamOfTeamsChange}
              placeholder="Select a team of teams..."
              isClearable
            />
            {data.scope.resolvedTeamCount > 0 && (
              <div style={styles.teamCountBadge}>
                <span style={styles.teamCountIcon}>👥</span>
                <span>{data.scope.resolvedTeamCount} teams will be assessed</span>
              </div>
            )}
          </div>
        )}

        {/* Custom Team Selection */}
        {data.scope.scopeType === 'custom-selection' && (
          <div style={styles.field}>
            <label style={styles.label}>Select Teams</label>
            <p style={styles.fieldDescription}>
              Choose which teams to include in this assessment. Select at least 2 teams.
            </p>
            <div style={styles.teamCheckboxList}>
              {mockTeams.map((team) => (
                <label key={team.value} style={styles.teamCheckboxItem}>
                  <Checkbox
                    isChecked={data.scope.selectedTeamIds?.includes(team.value) || false}
                    onChange={(e) => handleTeamToggle(team.value, e.target.checked)}
                  />
                  <span style={styles.teamCheckboxLabel}>{team.label}</span>
                  {team.isOnboarded ? (
                    <span style={styles.configuredBadge}>Configured</span>
                  ) : (
                    <span style={styles.newBadge}>New</span>
                  )}
                </label>
              ))}
            </div>
            {data.scope.resolvedTeamCount > 0 && (
              <div style={styles.teamCountBadge}>
                <span style={styles.teamCountIcon}>✓</span>
                <span>{data.scope.resolvedTeamCount} teams selected</span>
              </div>
            )}
          </div>
        )}

        {/* Single Team Selection */}
        {data.scope.scopeType === 'single-team' && (
          <div style={styles.field}>
            <label style={styles.label}>Select Team</label>
            <p style={styles.fieldDescription}>
              Choose which team to assess.
            </p>
            <Select
              inputId="single-team-select"
              options={mockTeams.map((t) => ({ value: t.value, label: t.label }))}
              value={
                data.scope.selectedTeamIds?.[0]
                  ? { value: data.scope.selectedTeamIds[0], label: mockTeams.find((t) => t.value === data.scope.selectedTeamIds?.[0])?.label || '' }
                  : null
              }
              onChange={(option) => {
                if (option) {
                  onUpdate({
                    scope: {
                      ...data.scope,
                      selectedTeamIds: [option.value],
                      resolvedTeamIds: [option.value],
                      resolvedTeamCount: 1,
                    },
                    displayName: option.label,
                  });
                }
              }}
              placeholder="Select a team..."
              isClearable
            />
          </div>
        )}

        {/* Divider */}
        {data.scope.scopeType !== 'single-team' && (
          <div style={styles.divider} />
        )}

        {/* Date Range */}
        <div style={styles.field}>
          <label style={styles.label}>Analysis Period</label>
          <p style={styles.fieldDescription}>
            Choose the date range for the assessment. We recommend at least 3 months of data.
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
                  onChange={(value: string) =>
                    onUpdate({
                      customDateRange: { ...data.customDateRange, startDate: value },
                    })
                  }
                  placeholder="Start date"
                />
              </div>
              <span style={styles.dateSeparator}>to</span>
              <div style={styles.datePicker}>
                <DatePicker
                  id="end-date"
                  value={data.customDateRange.endDate}
                  onChange={(value: string) =>
                    onUpdate({
                      customDateRange: { ...data.customDateRange, endDate: value },
                    })
                  }
                  placeholder="End date"
                />
              </div>
            </div>
          )}
        </div>

        {/* Data Grouping */}
        <div style={styles.field}>
          <label style={styles.label}>Data Grouping</label>
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
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '640px',
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
  scopeCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginTop: '8px',
  },
  scopeCard: {
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
  scopeCardSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#DEEBFF',
  },
  scopeIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  scopeCardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  scopeCardDesc: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  teamCountBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#E3FCEF',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#006644',
    marginTop: '8px',
  },
  teamCountIcon: {
    fontSize: '14px',
  },
  teamCheckboxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '12px',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    backgroundColor: '#FAFBFC',
  },
  teamCheckboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  teamCheckboxLabel: {
    flex: 1,
    fontSize: '14px',
    color: '#172B4D',
  },
  configuredBadge: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  newBadge: {
    padding: '2px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '10px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#DFE1E6',
    margin: '8px 0',
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

export default Step1ScopeSelection;
