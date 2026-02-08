import React from 'react';
import { Step6Data } from '../../types/wizard';
import StepHeader from '../shared/StepHeader';
import { StepIcons } from '../../constants/stepIcons';
import InfoButton from '../common/InfoButton';
import { WizardReportOptionsHelp } from '../../constants/helpContent';

interface Step6Props {
  data: Step6Data;
  onUpdate: (data: Partial<Step6Data>) => void;
}

interface ReportOption {
  key: keyof Step6Data;
  title: string;
  description: string;
}

const reportOptions: ReportOption[] = [
  {
    key: 'includeTrends',
    title: 'Include trend analysis',
    description:
      'Show how each dimension has changed over the analysis period, helping you understand whether things are improving or declining.',
  },
  {
    key: 'includeDescriptions',
    title: 'Include detailed descriptions',
    description:
      'Add explanations of what each dimension measures and how scores are calculated.',
  },
  {
    key: 'includeWhyItMatters',
    title: 'Include "why it matters" sections',
    description:
      'Explain the practical impact of each dimension and why improving it benefits your team.',
  },
  {
    key: 'includeComparisonOnCards',
    title: 'Show comparisons on indicator cards',
    description:
      'Display how your team compares to the selected benchmark teams directly on each health indicator card.',
  },
];

const Step6ReportOptions: React.FC<Step6Props> = ({ data, onUpdate }) => {
  const handleToggle = (key: keyof Step6Data) => {
    onUpdate({ [key]: !data[key] });
  };

  const enabledCount = Object.values(data).filter(Boolean).length;

  return (
    <div style={styles.container}>
      <StepHeader
        icon={StepIcons.report()}
        title="Report Options"
        description="Customise what appears in your assessment report."
        tourId={6}
        infoContent={
          <>
            <p>Customize how your assessment results are presented and shared.</p>
            <p><strong>Report Sections:</strong> Choose which dimensions and metrics to include in the final report. You can focus on specific areas of concern.</p>
            <p><strong>Comparison Views:</strong> Include or exclude comparisons with similar teams or organizational benchmarks.</p>
            <p><strong>Sharing:</strong> Control who can access the report and whether it should be visible to leadership dashboards.</p>
            <p>All data remains private to your team unless explicitly shared.</p>
          </>
        }
      />

      <div style={styles.section} data-tour="report-options">
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionTitle}>Report content</h3>
          <InfoButton title="Report Content" size="inline">
            {WizardReportOptionsHelp.reportContentSection}
          </InfoButton>
        </div>
        <p style={styles.sectionDescription}>
          Select which sections and features to include in your report.
        </p>

        <div style={styles.optionsList}>
          {reportOptions.map((option) => (
            <div key={option.key} style={styles.optionItem}>
              <div style={styles.optionHeader}>
                <button
                  type="button"
                  onClick={() => handleToggle(option.key)}
                  style={{
                    ...styles.toggleSwitch,
                    ...(data[option.key] ? styles.toggleSwitchOn : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.toggleKnob,
                      ...(data[option.key] ? styles.toggleKnobOn : {}),
                    }}
                  />
                </button>
                <div style={styles.optionInfo}>
                  <span style={styles.optionTitle}>{option.title}</span>
                  <span style={styles.optionDescription}>{option.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <span style={styles.countText}>
          {enabledCount} of {reportOptions.length} options enabled
        </span>
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
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  optionItem: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '16px',
  },
  optionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
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
    marginTop: '2px',
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
  optionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  optionTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  optionDescription: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  countText: {
    fontSize: '12px',
    color: '#6B778C',
  },
};

export default Step6ReportOptions;
