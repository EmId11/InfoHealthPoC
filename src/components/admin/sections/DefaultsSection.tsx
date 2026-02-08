import React, { useState } from 'react';
import { OrganizationDefaults, SettingMode } from '../../../types/admin';
import { IssueTypeKey, SprintCadence } from '../../../types/wizard';
import InfoButton from '../../common/InfoButton';
import { AdminDefaultsHelp } from '../../../constants/helpContent';

interface DefaultsSectionProps {
  defaults: OrganizationDefaults;
  onUpdate: (defaults: Partial<OrganizationDefaults>) => void;
}

const ISSUE_TYPE_LABELS: Record<IssueTypeKey, string> = {
  story: 'Story',
  bug: 'Bug',
  task: 'Task',
  epic: 'Epic',
  subtask: 'Sub-task',
};

const CADENCE_OPTIONS: { value: SprintCadence; label: string; days?: number }[] = [
  { value: 'weekly', label: '1 Week', days: 7 },
  { value: 'fortnightly', label: '2 Weeks', days: 14 },
  { value: 'threeWeeks', label: '3 Weeks', days: 21 },
  { value: 'monthly', label: '4 Weeks', days: 28 },
  { value: 'custom', label: 'Custom' },
];

const PRESET_OPTIONS = [
  { id: 'quickStart', label: 'Quick Start', description: '6 essential dimensions' },
  { id: 'comprehensive', label: 'Comprehensive', description: 'All 12 dimensions' },
  { id: 'planningFocus', label: 'Planning Focus', description: '7 planning dimensions' },
  { id: 'executionFocus', label: 'Execution Focus', description: '7 execution dimensions' },
];

const DefaultsSection: React.FC<DefaultsSectionProps> = ({ defaults, onUpdate }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [localDefaults, setLocalDefaults] = useState(defaults);

  const handleModeChange = (setting: 'staleThresholds' | 'sprintCadence' | 'dimensionPresets', mode: SettingMode) => {
    const newDefaults = { ...localDefaults };

    if (setting === 'staleThresholds') {
      newDefaults.staleThresholds = {
        mode,
        value: mode === 'org-defined' ? (defaults.staleThresholds.value || {
          story: { days: 14, enabled: true },
          bug: { days: 7, enabled: true },
          task: { days: 7, enabled: true },
          epic: { days: 30, enabled: true },
          subtask: { days: 5, enabled: true },
        }) : null,
      };
    } else if (setting === 'sprintCadence') {
      newDefaults.sprintCadence = {
        mode,
        value: mode === 'org-defined' ? (defaults.sprintCadence.value || { cadence: 'fortnightly', customDays: null }) : null,
      };
    } else if (setting === 'dimensionPresets') {
      newDefaults.dimensionPresets = {
        mode,
        value: mode === 'org-defined' ? (defaults.dimensionPresets.value || ['quickStart', 'comprehensive', 'planningFocus', 'executionFocus']) : null,
      };
    }

    setLocalDefaults(newDefaults);
    setHasChanges(true);
  };

  const handleThresholdChange = (issueType: IssueTypeKey, days: number) => {
    if (!localDefaults.staleThresholds.value) return;

    const newDefaults = {
      ...localDefaults,
      staleThresholds: {
        ...localDefaults.staleThresholds,
        value: {
          ...localDefaults.staleThresholds.value,
          [issueType]: { ...localDefaults.staleThresholds.value[issueType], days },
        },
      },
    };
    setLocalDefaults(newDefaults);
    setHasChanges(true);
  };

  const handleCadenceChange = (cadence: SprintCadence) => {
    const newDefaults = {
      ...localDefaults,
      sprintCadence: {
        ...localDefaults.sprintCadence,
        value: { cadence, customDays: cadence === 'custom' ? 14 : null },
      },
    };
    setLocalDefaults(newDefaults);
    setHasChanges(true);
  };

  const handlePresetToggle = (presetId: string) => {
    if (!localDefaults.dimensionPresets.value) return;

    const currentPresets = localDefaults.dimensionPresets.value;
    const newPresets = currentPresets.includes(presetId)
      ? currentPresets.filter(p => p !== presetId)
      : [...currentPresets, presetId];

    const newDefaults = {
      ...localDefaults,
      dimensionPresets: {
        ...localDefaults.dimensionPresets,
        value: newPresets,
      },
    };
    setLocalDefaults(newDefaults);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localDefaults);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    setLocalDefaults(defaults);
    setHasChanges(false);
  };

  const renderModeToggle = (
    setting: 'staleThresholds' | 'sprintCadence' | 'dimensionPresets',
    currentMode: SettingMode
  ) => (
    <div style={styles.modeToggle}>
      <div style={styles.modeButtonWrapper}>
        <button
          style={{
            ...styles.modeButton,
            ...(currentMode === 'org-defined' ? styles.modeButtonActive : {}),
          }}
          onClick={() => handleModeChange(setting, 'org-defined')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Set org-wide standard
        </button>
        <InfoButton title="Set Org-Wide Standard" size="inline">
          {AdminDefaultsHelp.orgWideStandard}
        </InfoButton>
      </div>
      <div style={styles.modeButtonWrapper}>
        <button
          style={{
            ...styles.modeButton,
            ...(currentMode === 'team-decides' ? styles.modeButtonActive : {}),
          }}
          onClick={() => handleModeChange(setting, 'team-decides')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 14v-.5a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Let teams decide
        </button>
        <InfoButton title="Let Teams Decide" size="inline">
          {AdminDefaultsHelp.letTeamsDecide}
        </InfoButton>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>Organization Standards</h2>
          <InfoButton title="Organization Standards">
              <h4>What Are Organization Standards?</h4>
              <p>
                Organization standards are the <strong>default settings that apply across all teams</strong> in your
                organization. As an administrator, you control whether these settings are enforced uniformly
                or left to individual teams to customize.
              </p>

              <h4>The Three Core Settings</h4>
              <ul>
                <li>
                  <strong>Stale Thresholds:</strong> How many days before issues are flagged as potentially stuck.
                  This helps surface work that needs attention before it becomes a bigger problem.
                </li>
                <li>
                  <strong>Sprint Cadence:</strong> The standard sprint duration (1-4 weeks). Consistent cadence
                  enables better cross-team planning and velocity comparisons.
                </li>
                <li>
                  <strong>Dimension Presets:</strong> Which health assessment templates teams can use. Control
                  the focus areas available for assessments.
                </li>
              </ul>

              <h4>Org-Wide vs. Team Choice</h4>
              <p>For each setting, you choose between two approaches:</p>
              <ul>
                <li>
                  <strong>Set org-wide standard:</strong> All teams must use the value you define here.
                  Teams will see the setting as read-only with a note that it's set by the organization.
                </li>
                <li>
                  <strong>Let teams decide:</strong> Each team can set their own value during assessment setup.
                  Your value becomes a suggestion, not a requirement.
                </li>
              </ul>

              <h4>When to Enforce Standards</h4>
              <p>Consider enforcing org-wide standards when:</p>
              <ul>
                <li>You need consistent metrics for cross-team comparisons</li>
                <li>Leadership reporting requires uniform definitions</li>
                <li>Compliance or governance mandates standardization</li>
                <li>You want to prevent teams from hiding problems with lenient settings</li>
              </ul>

              <h4>When to Allow Team Choice</h4>
              <p>Consider letting teams decide when:</p>
              <ul>
                <li>Teams have genuinely different workflows (support vs. product)</li>
                <li>You want to encourage experimentation and learning</li>
                <li>Teams are mature and can make informed decisions</li>
                <li>Strict uniformity would create friction without adding value</li>
              </ul>
            </InfoButton>
          </div>
        <p style={styles.subtitle}>
          Configure default settings that apply across all teams. Teams will see org-defined settings as read-only.
        </p>
        {hasChanges && (
          <div style={styles.actions}>
            <button style={styles.discardButton} onClick={handleDiscard}>
              Discard
            </button>
            <button style={styles.saveButton} onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Stale Thresholds */}
      <div style={styles.section} data-tour="stale-thresholds-section">
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={styles.sectionTitleRow}>
              <h3 style={styles.sectionTitle}>Stale Thresholds</h3>
              <InfoButton title="Stale Thresholds">
                {AdminDefaultsHelp.staleThresholdsSection}
              </InfoButton>
            </div>
            <p style={styles.sectionDescription}>
              Define how many days before an issue is considered stale (inactive).
            </p>
          </div>
        </div>

        {renderModeToggle('staleThresholds', localDefaults.staleThresholds.mode)}

        {localDefaults.staleThresholds.mode === 'org-defined' && localDefaults.staleThresholds.value && (
          <div style={styles.thresholdGrid}>
            {(Object.keys(localDefaults.staleThresholds.value) as IssueTypeKey[]).map(issueType => {
              const helpContent: Record<IssueTypeKey, React.ReactNode> = {
                story: AdminDefaultsHelp.storyThreshold,
                bug: AdminDefaultsHelp.bugThreshold,
                task: AdminDefaultsHelp.taskThreshold,
                epic: AdminDefaultsHelp.epicThreshold,
                subtask: AdminDefaultsHelp.subtaskThreshold,
              };
              return (
                <div key={issueType} style={styles.thresholdItem}>
                  <div style={styles.thresholdLabelRow}>
                    <span style={styles.thresholdLabel}>{ISSUE_TYPE_LABELS[issueType]}</span>
                    <InfoButton title={`${ISSUE_TYPE_LABELS[issueType]} Threshold`} size="inline">
                      {helpContent[issueType]}
                    </InfoButton>
                  </div>
                  <div style={styles.thresholdInput}>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={localDefaults.staleThresholds.value![issueType].days}
                      onChange={(e) => handleThresholdChange(issueType, parseInt(e.target.value) || 1)}
                      style={styles.numberInput}
                    />
                    <span style={styles.inputSuffix}>days</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {localDefaults.staleThresholds.mode === 'team-decides' && (
          <div style={styles.teamDecidesNote}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#6B778C" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10h.01" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Teams will configure their own stale thresholds during assessment setup.
          </div>
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
          <div>
            <div style={styles.sectionTitleRow}>
              <h3 style={styles.sectionTitle}>Sprint Cadence</h3>
              <InfoButton title="Sprint Cadence">
                {AdminDefaultsHelp.sprintCadenceSection}
              </InfoButton>
            </div>
            <p style={styles.sectionDescription}>
              Set the default sprint duration for all teams.
            </p>
          </div>
        </div>

        {renderModeToggle('sprintCadence', localDefaults.sprintCadence.mode)}

        {localDefaults.sprintCadence.mode === 'org-defined' && localDefaults.sprintCadence.value && (
          <div style={styles.cadenceOptions}>
            {CADENCE_OPTIONS.map(option => (
              <button
                key={option.value}
                style={{
                  ...styles.cadenceOption,
                  ...(localDefaults.sprintCadence.value?.cadence === option.value ? styles.cadenceOptionActive : {}),
                }}
                onClick={() => handleCadenceChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {localDefaults.sprintCadence.mode === 'team-decides' && (
          <div style={styles.teamDecidesNote}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#6B778C" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10h.01" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Teams will configure their own sprint cadence during assessment setup.
          </div>
        )}
      </div>

      {/* Dimension Presets */}
      <div style={styles.section} data-tour="dimension-presets">
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <div style={styles.sectionTitleRow}>
              <h3 style={styles.sectionTitle}>Dimension Presets</h3>
              <InfoButton title="Dimension Presets">
                {AdminDefaultsHelp.dimensionPresetsSection}
              </InfoButton>
            </div>
            <p style={styles.sectionDescription}>
              Control which assessment presets are available to teams.
            </p>
          </div>
        </div>

        {renderModeToggle('dimensionPresets', localDefaults.dimensionPresets.mode)}

        {localDefaults.dimensionPresets.mode === 'org-defined' && localDefaults.dimensionPresets.value && (
          <div style={styles.presetList}>
            {PRESET_OPTIONS.map(preset => {
              const presetHelpContent: Record<string, React.ReactNode> = {
                quickStart: AdminDefaultsHelp.quickStartPreset,
                comprehensive: AdminDefaultsHelp.comprehensivePreset,
                planningFocus: AdminDefaultsHelp.planningFocusPreset,
                executionFocus: AdminDefaultsHelp.executionFocusPreset,
              };
              return (
                <label key={preset.id} style={styles.presetItem}>
                  <input
                    type="checkbox"
                    checked={localDefaults.dimensionPresets.value!.includes(preset.id)}
                    onChange={() => handlePresetToggle(preset.id)}
                    style={styles.checkbox}
                  />
                  <div style={styles.presetInfo}>
                    <div style={styles.presetLabelRow}>
                      <span style={styles.presetLabel}>{preset.label}</span>
                      <InfoButton title={`${preset.label} Preset`} size="inline">
                        {presetHelpContent[preset.id]}
                      </InfoButton>
                    </div>
                    <span style={styles.presetDescription}>{preset.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {localDefaults.dimensionPresets.mode === 'team-decides' && (
          <div style={styles.teamDecidesNote}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#6B778C" strokeWidth="1.5"/>
              <path d="M8 5v3M8 10h.01" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Teams will have access to all dimension presets during assessment setup.
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  discardButton: {
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  section: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  sectionHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  sectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDescription: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  modeButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  modeToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modeButtonActive: {
    backgroundColor: '#F3F0FF',
    border: '1px solid #5243AA',
    color: '#5243AA',
  },
  thresholdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
  },
  thresholdItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  thresholdLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  thresholdLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  thresholdInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  numberInput: {
    width: '60px',
    padding: '6px 8px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: '13px',
    color: '#6B778C',
  },
  teamDecidesNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    fontSize: '13px',
    color: '#6B778C',
  },
  cadenceOptions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  cadenceOption: {
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #EBECF0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cadenceOptionActive: {
    backgroundColor: '#F3F0FF',
    border: '1px solid #5243AA',
    color: '#5243AA',
  },
  presetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  presetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#5243AA',
  },
  presetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  presetLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  presetLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  presetDescription: {
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default DefaultsSection;
