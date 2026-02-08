import React from 'react';
import { DatePicker } from '@atlaskit/datetime-picker';
import { Step4Data, SprintCadence } from '../../types/wizard';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';
import InfoButton from '../common/InfoButton';
import { WizardStep6Help } from '../../constants/helpContent';

interface Step6Props {
  data: Step4Data;
  onUpdate: (data: Partial<Step4Data>) => void;
}

const cadenceOptions: { value: SprintCadence; label: string }[] = [
  { value: 'weekly', label: '1 week' },
  { value: 'fortnightly', label: '2 weeks' },
  { value: 'threeWeeks', label: '3 weeks' },
  { value: 'monthly', label: '4 weeks' },
  { value: 'custom', label: 'Other' },
];

const Step6SprintCadence: React.FC<Step6Props> = ({ data, onUpdate }) => {
  const handleCadenceChange = (cadence: SprintCadence) => {
    onUpdate({
      sprintCadence: cadence,
      customSprintDays: cadence === 'custom' ? data.customSprintDays : null,
    });
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value, 10);
    onUpdate({ customSprintDays: isNaN(days) ? null : days });
  };

  const handleCadenceChangedToggle = () => {
    const cadenceChanged = !data.cadenceHistory.cadenceChanged;
    onUpdate({
      cadenceHistory: {
        ...data.cadenceHistory,
        cadenceChanged,
        previousCadence: cadenceChanged ? data.cadenceHistory.previousCadence : null,
        previousCustomDays: cadenceChanged ? data.cadenceHistory.previousCustomDays : null,
        changeDate: cadenceChanged ? data.cadenceHistory.changeDate : null,
      },
    });
  };

  const handlePreviousCadenceChange = (cadence: SprintCadence) => {
    onUpdate({
      cadenceHistory: {
        ...data.cadenceHistory,
        previousCadence: cadence,
        previousCustomDays: cadence === 'custom' ? data.cadenceHistory.previousCustomDays : null,
      },
    });
  };

  const handlePreviousCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const days = parseInt(e.target.value, 10);
    onUpdate({
      cadenceHistory: {
        ...data.cadenceHistory,
        previousCustomDays: isNaN(days) ? null : days,
      },
    });
  };

  const handleChangeDateChange = (value: string) => {
    onUpdate({
      cadenceHistory: {
        ...data.cadenceHistory,
        changeDate: value,
      },
    });
  };

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.sprint()}
        title="Sprint Cadence"
        description="Define your sprint rhythm and any recent changes to your cadence."
        tourId={4}
        infoContent={
          <>
            <p>Understanding your sprint cadence helps calibrate the analysis to your team's rhythm.</p>
            <p><strong>Sprint Length:</strong> Select your typical sprint duration. This affects how we measure velocity, completion rates, and carry-over.</p>
            <p><strong>Cadence Changes:</strong> If your team recently changed sprint lengths, the analysis will account for this transition period.</p>
            <p><strong>Non-Sprint Teams:</strong> If you use Kanban or don't have fixed sprints, select the cycle length that best represents your typical delivery rhythm.</p>
          </>
        }
      />

      {/* Current Sprint Length */}
      <div style={styles.section} data-tour="sprint-cadence">
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionTitle}>Current sprint length</h3>
          <InfoButton title="Sprint Length" size="inline">
            {WizardStep6Help.sprintLengthSection}
          </InfoButton>
        </div>
        <p style={styles.sectionDescription}>
          How long are your sprints?
        </p>

        <div style={styles.pillGroup}>
          {cadenceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              style={{
                ...styles.pill,
                ...(data.sprintCadence === option.value ? styles.pillSelected : {}),
              }}
              onClick={() => handleCadenceChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {data.sprintCadence === 'custom' && (
          <div style={styles.customDaysRow}>
            <input
              type="number"
              name="custom-days"
              placeholder="10"
              value={data.customSprintDays || ''}
              onChange={handleCustomDaysChange}
              min={1}
              style={styles.numberInput}
            />
            <span style={styles.daysLabel}>days</span>
          </div>
        )}
      </div>

      {/* Cadence History */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Cadence history</h3>
        <p style={styles.sectionDescription}>
          Did your sprint cadence change during the analysis period? If so, we can account
          for this when analysing your data.
        </p>

        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>
            Our sprint cadence changed during this period
          </span>
          <button
            type="button"
            onClick={handleCadenceChangedToggle}
            style={{
              ...styles.toggleSwitch,
              ...(data.cadenceHistory.cadenceChanged ? styles.toggleSwitchOn : {}),
            }}
          >
            <span
              style={{
                ...styles.toggleKnob,
                ...(data.cadenceHistory.cadenceChanged ? styles.toggleKnobOn : {}),
              }}
            />
          </button>
        </div>

        {data.cadenceHistory.cadenceChanged && (
          <div style={styles.previousCadenceSection}>
            <div style={styles.previousCadenceField}>
              <label style={styles.fieldLabel}>Previous sprint length</label>
              <div style={styles.smallPillGroup}>
                {cadenceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.smallPill,
                      ...(data.cadenceHistory.previousCadence === option.value
                        ? styles.smallPillSelected
                        : {}),
                    }}
                    onClick={() => handlePreviousCadenceChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {data.cadenceHistory.previousCadence === 'custom' && (
                <div style={styles.customDaysRow}>
                  <input
                    type="number"
                    name="previous-custom-days"
                    placeholder="10"
                    value={data.cadenceHistory.previousCustomDays || ''}
                    onChange={handlePreviousCustomDaysChange}
                    min={1}
                    style={styles.numberInput}
                  />
                  <span style={styles.daysLabel}>days</span>
                </div>
              )}
            </div>

            <div style={styles.previousCadenceField}>
              <label style={styles.fieldLabel}>When did it change?</label>
              <div style={{ maxWidth: '200px' }}>
                <DatePicker
                  id="cadence-change-date"
                  value={data.cadenceHistory.changeDate || ''}
                  onChange={handleChangeDateChange}
                  placeholder="Select date..."
                />
              </div>
            </div>
          </div>
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
  section: {
    marginBottom: '28px',
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
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  pillGroup: {
    display: 'flex',
    flexWrap: 'wrap',
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
  smallPillGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  smallPill: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #DFE1E6',
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    color: '#5E6C84',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  smallPillSelected: {
    backgroundColor: '#0052CC',
    border: '1px solid #0052CC',
    color: '#FFFFFF',
  },
  customDaysRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '16px',
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
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  toggleLabel: {
    fontSize: '14px',
    color: '#172B4D',
  },
  toggleSwitch: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#DFE1E6',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
    padding: 0,
    flexShrink: 0,
  },
  toggleSwitchOn: {
    backgroundColor: '#0052CC',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleKnobOn: {
    left: '22px',
  },
  previousCadenceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  previousCadenceField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
};

export default Step6SprintCadence;
