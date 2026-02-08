import React, { useState } from 'react';
import {
  WizardState,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  getEffectiveDateRange,
  getSelectedIssueTypes,
  hasComparisonEnabled,
} from '../../types/wizard';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import { PersonaSwitcher } from '../persona';
import { mockTeams } from '../../constants/presets';

interface EditableSettingsPageProps {
  wizardState: WizardState;
  onSave: (updatedState: WizardState) => void;
  onCancel: () => void;
  assessmentName: string;
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

const EditableSettingsPage: React.FC<EditableSettingsPageProps> = ({
  wizardState,
  onSave,
  onCancel,
  assessmentName,
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [step1, setStep1] = useState<Step1Data>({ ...wizardState.step1 });
  const [step2, setStep2] = useState<Step2Data>({ ...wizardState.step2 });
  const [step3, setStep3] = useState<Step3Data>({ ...wizardState.step3 });
  const [step4, setStep4] = useState<Step4Data>({ ...wizardState.step4 });
  const [step5, setStep5] = useState<Step5Data>({ ...wizardState.step5 });
  const [step6, setStep6] = useState<Step6Data>({ ...wizardState.step6 });

  const dateRange = getEffectiveDateRange(step1);
  const selectedIssueTypes = getSelectedIssueTypes(step3);
  const hasComparison = hasComparisonEnabled(step2.comparisonCriteria);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSave = () => {
    const updatedState: WizardState = {
      ...wizardState,
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
    };
    onSave(updatedState);
  };

  const toggleIssueType = (type: string) => {
    setStep3(prev => ({
      ...prev,
      issueTypes: {
        ...prev.issueTypes,
        [type]: !prev.issueTypes[type as keyof typeof prev.issueTypes],
      },
    }));
  };

  const renderEditButton = (section: string) => (
    <button
      style={styles.editButton}
      onClick={() => setEditingSection(editingSection === section ? null : section)}
    >
      {editingSection === section ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 7l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Done
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 2.5l1 1M2 12l.5-1.5 7-7 1 1-7 7L2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit
        </>
      )}
    </button>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <button style={styles.backButton} onClick={onCancel}>
              <ArrowLeftIcon label="Back" primaryColor="white" />
              <span>Back to Report</span>
            </button>
            <div style={styles.headerActions}>
              <PersonaSwitcher />
            </div>
          </div>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Edit Assessment Settings</h1>
            <p style={styles.subtitle}>{assessmentName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Basic Details */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Basic Details</h3>
              {renderEditButton('basics')}
            </div>

            {editingSection === 'basics' ? (
              <div style={styles.editForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Team</label>
                  <select
                    style={styles.select}
                    value={step1.teamId || ''}
                    onChange={(e) => {
                      const team = mockTeams.find(t => t.value === e.target.value);
                      setStep1(prev => ({
                        ...prev,
                        teamId: e.target.value,
                        teamName: team?.label || '',
                      }));
                    }}
                  >
                    {mockTeams.map(team => (
                      <option key={team.value} value={team.value}>{team.label}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Start Date</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={step1.customDateRange.startDate}
                      onChange={(e) => setStep1(prev => ({
                        ...prev,
                        customDateRange: { ...prev.customDateRange, startDate: e.target.value },
                      }))}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>End Date</label>
                    <input
                      type="date"
                      style={styles.input}
                      value={step1.customDateRange.endDate}
                      onChange={(e) => setStep1(prev => ({
                        ...prev,
                        customDateRange: { ...prev.customDateRange, endDate: e.target.value },
                      }))}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Data Grouping</label>
                  <div style={styles.radioGroup}>
                    {['weekly', 'fortnightly', 'monthly'].map(option => (
                      <label key={option} style={styles.radioLabel}>
                        <input
                          type="radio"
                          name="dataGrouping"
                          value={option}
                          checked={step1.dataGrouping === option}
                          onChange={(e) => setStep1(prev => ({ ...prev, dataGrouping: e.target.value as any }))}
                          style={styles.radio}
                        />
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
                    {step1.dataGrouping.charAt(0).toUpperCase() + step1.dataGrouping.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Group */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Comparison Group</h3>
              {renderEditButton('comparison')}
            </div>

            {editingSection === 'comparison' ? (
              <div style={styles.editForm}>
                <div style={styles.checkboxGrid}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToOrganisation}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToOrganisation: !prev.comparisonCriteria.compareToOrganisation,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Organisation teams
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToScrumTeams}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToScrumTeams: !prev.comparisonCriteria.compareToScrumTeams,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Scrum teams
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToSimilarDemand}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToSimilarDemand: !prev.comparisonCriteria.compareToSimilarDemand,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Similar demand
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToSimilarVolume}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToSimilarVolume: !prev.comparisonCriteria.compareToSimilarVolume,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Similar volume
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToMatureTeams}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToMatureTeams: !prev.comparisonCriteria.compareToMatureTeams,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Mature teams
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step2.comparisonCriteria.compareToTribeTeams}
                      onChange={() => setStep2(prev => ({
                        ...prev,
                        comparisonCriteria: {
                          ...prev.comparisonCriteria,
                          compareToTribeTeams: !prev.comparisonCriteria.compareToTribeTeams,
                        },
                      }))}
                      style={styles.checkbox}
                    />
                    Tribe teams
                  </label>
                </div>
              </div>
            ) : hasComparison ? (
              <div style={styles.tagList}>
                {step2.comparisonCriteria.compareToOrganisation && <span style={styles.tag}>Organisation teams</span>}
                {step2.comparisonCriteria.compareToScrumTeams && <span style={styles.tag}>Scrum teams</span>}
                {step2.comparisonCriteria.compareToSimilarDemand && <span style={styles.tag}>Similar demand</span>}
                {step2.comparisonCriteria.compareToSimilarVolume && <span style={styles.tag}>Similar volume</span>}
                {step2.comparisonCriteria.compareToMatureTeams && <span style={styles.tag}>Mature teams</span>}
                {step2.comparisonCriteria.compareToTribeTeams && <span style={styles.tag}>Tribe teams</span>}
              </div>
            ) : (
              <span style={styles.emptyText}>No comparison group selected</span>
            )}
          </div>

          {/* Issue Types */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Issue Types</h3>
              {renderEditButton('issueTypes')}
            </div>

            {editingSection === 'issueTypes' ? (
              <div style={styles.editForm}>
                <div style={styles.checkboxGrid}>
                  {Object.entries(issueTypeLabels).map(([type, label]) => (
                    <label key={type} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={step3.issueTypes[type as keyof typeof step3.issueTypes]}
                        onChange={() => toggleIssueType(type)}
                        style={styles.checkbox}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.tagList}>
                {selectedIssueTypes.map((type) => (
                  <span key={type} style={styles.tag}>{issueTypeLabels[type]}</span>
                ))}
              </div>
            )}
          </div>

          {/* Sprint Cadence */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Sprint Cadence</h3>
              {renderEditButton('cadence')}
            </div>

            {editingSection === 'cadence' ? (
              <div style={styles.editForm}>
                <div style={styles.radioGroup}>
                  {Object.entries(cadenceLabels).map(([value, label]) => (
                    <label key={value} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="cadence"
                        value={value}
                        checked={step4.sprintCadence === value}
                        onChange={(e) => setStep4(prev => ({ ...prev, sprintCadence: e.target.value as any }))}
                        style={styles.radio}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {step4.sprintCadence === 'custom' && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Custom days</label>
                    <input
                      type="number"
                      style={{ ...styles.input, width: '100px' }}
                      value={step4.customSprintDays || 14}
                      onChange={(e) => setStep4(prev => ({ ...prev, customSprintDays: parseInt(e.target.value) || 14 }))}
                      min={1}
                      max={60}
                    />
                  </div>
                )}
              </div>
            ) : (
              <span style={styles.summaryValue}>
                {step4.sprintCadence === 'custom'
                  ? `${step4.customSprintDays} days`
                  : cadenceLabels[step4.sprintCadence]}
              </span>
            )}
          </div>

          {/* Stale Thresholds */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Stale Thresholds</h3>
              {renderEditButton('stale')}
            </div>

            {editingSection === 'stale' ? (
              <div style={styles.editForm}>
                {selectedIssueTypes.map((type) => (
                  <div key={type} style={styles.staleEditRow}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={step5.staleThresholds[type]?.enabled || false}
                        onChange={() => setStep5(prev => ({
                          ...prev,
                          staleThresholds: {
                            ...prev.staleThresholds,
                            [type]: {
                              ...prev.staleThresholds[type],
                              enabled: !prev.staleThresholds[type]?.enabled,
                            },
                          },
                        }))}
                        style={styles.checkbox}
                      />
                      {issueTypeLabels[type]}
                    </label>
                    {step5.staleThresholds[type]?.enabled && (
                      <div style={styles.staleInputGroup}>
                        <input
                          type="number"
                          style={{ ...styles.input, width: '80px' }}
                          value={step5.staleThresholds[type]?.days || 14}
                          onChange={(e) => setStep5(prev => ({
                            ...prev,
                            staleThresholds: {
                              ...prev.staleThresholds,
                              [type]: {
                                ...prev.staleThresholds[type],
                                days: parseInt(e.target.value) || 14,
                              },
                            },
                          }))}
                          min={1}
                        />
                        <span style={styles.staleInputLabel}>days</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.staleGrid}>
                {selectedIssueTypes
                  .filter(type => step5.staleThresholds[type]?.enabled)
                  .map((type) => (
                    <div key={type} style={styles.staleItem}>
                      <span style={styles.staleType}>{issueTypeLabels[type]}</span>
                      <span style={styles.staleDays}>{step5.staleThresholds[type]?.days || 14} days</span>
                    </div>
                  ))}
                {selectedIssueTypes.filter(type => step5.staleThresholds[type]?.enabled).length === 0 && (
                  <span style={styles.emptyText}>No stale thresholds configured</span>
                )}
              </div>
            )}
          </div>

          {/* Report Options */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Report Options</h3>
              {renderEditButton('report')}
            </div>

            {editingSection === 'report' ? (
              <div style={styles.editForm}>
                <div style={styles.checkboxGrid}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step6.includeTrends}
                      onChange={() => setStep6(prev => ({ ...prev, includeTrends: !prev.includeTrends }))}
                      style={styles.checkbox}
                    />
                    Include trend analysis
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step6.includeDescriptions}
                      onChange={() => setStep6(prev => ({ ...prev, includeDescriptions: !prev.includeDescriptions }))}
                      style={styles.checkbox}
                    />
                    Include descriptions
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step6.includeWhyItMatters}
                      onChange={() => setStep6(prev => ({ ...prev, includeWhyItMatters: !prev.includeWhyItMatters }))}
                      style={styles.checkbox}
                    />
                    Include "why it matters"
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={step6.includeComparisonOnCards}
                      onChange={() => setStep6(prev => ({ ...prev, includeComparisonOnCards: !prev.includeComparisonOnCards }))}
                      style={styles.checkbox}
                    />
                    Show comparison on cards
                  </label>
                </div>
              </div>
            ) : (
              <div style={styles.tagList}>
                {step6.includeTrends && <span style={styles.tagSmall}>Trend analysis</span>}
                {step6.includeDescriptions && <span style={styles.tagSmall}>Descriptions</span>}
                {step6.includeWhyItMatters && <span style={styles.tagSmall}>Why it matters</span>}
                {step6.includeComparisonOnCards && <span style={styles.tagSmall}>Comparison on cards</span>}
                {!step6.includeTrends && !step6.includeDescriptions && !step6.includeWhyItMatters && !step6.includeComparisonOnCards && (
                  <span style={styles.emptyText}>No report options selected</span>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={styles.footer}>
            <button style={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button style={styles.saveButton} onClick={handleSave}>
              Save & Re-run Assessment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F4F5F7',
  },
  header: {
    background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
    padding: '16px 24px 24px',
    color: 'white',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  titleSection: {},
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: 'white',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  main: {
    padding: '32px 24px',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.1)',
    padding: '32px',
  },
  section: {
    marginBottom: '28px',
    paddingBottom: '28px',
    borderBottom: '1px solid #EBECF0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  editButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#0052CC',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  editForm: {
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #E6E8EB',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '6px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  radio: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
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
    padding: '6px 14px',
    backgroundColor: '#E9F2FF',
    color: '#0052CC',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '16px',
  },
  tagSmall: {
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
    fontSize: '12px',
    borderRadius: '10px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
  staleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  staleItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '10px 14px',
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
  staleEditRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #EBECF0',
  },
  staleInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  staleInputLabel: {
    fontSize: '14px',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #EBECF0',
    marginTop: '8px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};

export default EditableSettingsPage;
