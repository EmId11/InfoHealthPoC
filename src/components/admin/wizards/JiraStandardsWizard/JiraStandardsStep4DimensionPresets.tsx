import React from 'react';
import { OrganizationDefaults, SettingMode } from '../../../../types/admin';
import InfoButton from '../../../common/InfoButton';
import { AdminDefaultsHelp } from '../../../../constants/helpContent';

interface JiraStandardsStep4DimensionPresetsProps {
  defaults: OrganizationDefaults;
  onUpdate: (updates: Partial<OrganizationDefaults>) => void;
}

const PRESET_OPTIONS = [
  {
    id: 'quickStart',
    label: 'Quick Start',
    description: '6 essential dimensions for a fast initial assessment',
    dimensions: 6,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'comprehensive',
    label: 'Comprehensive',
    description: 'All 12 dimensions for a thorough health check',
    dimensions: 12,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'planningFocus',
    label: 'Planning Focus',
    description: '7 dimensions focused on backlog and sprint planning',
    dimensions: 7,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 2v4M8 2v4M3 10h18M8 14h4M8 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'executionFocus',
    label: 'Execution Focus',
    description: '7 dimensions focused on delivery and flow',
    dimensions: 7,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const JiraStandardsStep4DimensionPresets: React.FC<JiraStandardsStep4DimensionPresetsProps> = ({
  defaults,
  onUpdate,
}) => {
  const currentMode = defaults.dimensionPresets.mode;
  const currentValue = defaults.dimensionPresets.value;

  const handleModeChange = (mode: SettingMode) => {
    onUpdate({
      dimensionPresets: {
        mode,
        value: mode === 'org-defined'
          ? (currentValue || PRESET_OPTIONS.map(p => p.id))
          : null,
      },
    });
  };

  const handlePresetToggle = (presetId: string) => {
    if (!currentValue) return;

    const newValue = currentValue.includes(presetId)
      ? currentValue.filter(p => p !== presetId)
      : [...currentValue, presetId];

    // Ensure at least one preset is selected
    if (newValue.length === 0) return;

    onUpdate({
      dimensionPresets: {
        mode: currentMode,
        value: newValue,
      },
    });
  };

  const presetHelpContent: Record<string, React.ReactNode> = {
    quickStart: AdminDefaultsHelp.quickStartPreset,
    comprehensive: AdminDefaultsHelp.comprehensivePreset,
    planningFocus: AdminDefaultsHelp.planningFocusPreset,
    executionFocus: AdminDefaultsHelp.executionFocusPreset,
  };

  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <p style={styles.introText}>
          Dimension presets are templates that determine which health indicators are included in an assessment.
          Control which presets teams can choose from when setting up their assessments.
        </p>
      </div>

      <div style={styles.modeSection}>
        <h3 style={styles.modeSectionTitle}>How should this be configured?</h3>
        <div style={styles.modeToggle}>
          <button
            style={{
              ...styles.modeButton,
              ...(currentMode === 'org-defined' ? styles.modeButtonActive : {}),
            }}
            onClick={() => handleModeChange('org-defined')}
          >
            <div style={styles.modeIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={styles.modeContent}>
              <span style={styles.modeLabel}>Control available presets</span>
              <span style={styles.modeDesc}>Select which presets teams can use</span>
            </div>
          </button>
          <button
            style={{
              ...styles.modeButton,
              ...(currentMode === 'team-decides' ? styles.modeButtonActive : {}),
            }}
            onClick={() => handleModeChange('team-decides')}
          >
            <div style={styles.modeIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 17v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={styles.modeContent}>
              <span style={styles.modeLabel}>Allow all presets</span>
              <span style={styles.modeDesc}>Teams can choose any preset</span>
            </div>
          </button>
        </div>
      </div>

      {currentMode === 'org-defined' && currentValue && (
        <div style={styles.presetsSection}>
          <h3 style={styles.presetsSectionTitle}>Select available presets</h3>
          <p style={styles.presetsSectionDesc}>
            Teams will only see the presets you enable here. At least one preset must be selected.
          </p>
          <div style={styles.presetGrid}>
            {PRESET_OPTIONS.map((preset) => {
              const isSelected = currentValue.includes(preset.id);
              return (
                <button
                  key={preset.id}
                  style={{
                    ...styles.presetCard,
                    ...(isSelected ? styles.presetCardActive : {}),
                  }}
                  onClick={() => handlePresetToggle(preset.id)}
                >
                  <div style={styles.presetHeader}>
                    <div style={{
                      ...styles.presetIcon,
                      ...(isSelected ? styles.presetIconActive : {}),
                    }}>
                      {preset.icon}
                    </div>
                    <div style={styles.presetCheckbox}>
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect width="16" height="16" rx="4" fill="#6554C0"/>
                          <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {!isSelected && (
                        <div style={styles.uncheckedBox} />
                      )}
                    </div>
                  </div>
                  <div style={styles.presetContent}>
                    <div style={styles.presetLabelRow}>
                      <span style={styles.presetLabel}>{preset.label}</span>
                      <InfoButton title={`${preset.label} Preset`} size="inline">
                        {presetHelpContent[preset.id]}
                      </InfoButton>
                    </div>
                    <span style={styles.presetDesc}>{preset.description}</span>
                    <span style={styles.presetDimensions}>{preset.dimensions} dimensions</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentMode === 'team-decides' && (
        <div style={styles.teamDecidesInfo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#6B778C" strokeWidth="2"/>
            <path d="M12 8v4M12 14h.01" stroke="#6B778C" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div style={styles.teamDecidesContent}>
            <p style={styles.teamDecidesTitle}>Teams will have access to all dimension presets</p>
            <p style={styles.teamDecidesDesc}>
              During assessment setup, teams can choose from any available preset based on their
              assessment goals. This provides maximum flexibility for different use cases.
            </p>
          </div>
        </div>
      )}
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
  modeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modeSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modeToggle: {
    display: 'flex',
    gap: '12px',
  },
  modeButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBECF0',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  modeButtonActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #6554C0',
  },
  modeIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
    flexShrink: 0,
  },
  modeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modeLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modeDesc: {
    fontSize: '13px',
    color: '#6B778C',
  },
  presetsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  presetsSectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  presetsSectionDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  presetCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBECF0',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  presetCardActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #6554C0',
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  presetIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6B778C',
  },
  presetIconActive: {
    backgroundColor: '#6554C0',
    color: '#FFFFFF',
  },
  presetCheckbox: {
    width: '20px',
    height: '20px',
  },
  uncheckedBox: {
    width: '16px',
    height: '16px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
  },
  presetContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  presetLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  presetLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  presetDesc: {
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.4,
  },
  presetDimensions: {
    fontSize: '12px',
    color: '#6554C0',
    fontWeight: 500,
    marginTop: '4px',
  },
  teamDecidesInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  teamDecidesContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  teamDecidesTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  teamDecidesDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
};

export default JiraStandardsStep4DimensionPresets;
