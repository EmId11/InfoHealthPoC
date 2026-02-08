import React from 'react';
import { Step9Data } from '../../types/wizard';

interface Step9Props {
  data: Step9Data;
  onUpdate: (data: Partial<Step9Data>) => void;
}

interface ReportOption {
  key: keyof Step9Data;
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

const Step9ReportOptions: React.FC<Step9Props> = ({ data, onUpdate }) => {
  const handleToggle = (key: keyof Step9Data) => {
    onUpdate({ [key]: !data[key] });
  };

  const enabledCount = Object.values(data).filter(Boolean).length;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Report Options</h2>
      <p style={styles.description}>
        Customise what information appears in your health assessment report. All options
        are enabled by default to give you the most comprehensive view, but you can
        simplify the report if preferred.
      </p>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Report content</h3>
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
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
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

export default Step9ReportOptions;
