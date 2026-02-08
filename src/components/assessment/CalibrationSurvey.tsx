import React, { useState } from 'react';
import {
  InvisibleWorkCategoryLevel,
  ConfidenceLevel,
  InvisibleWorkTrend,
  INVISIBLE_WORK_TYPES,
  CalibrationSurveyResponse,
  DimensionResult,
} from '../../types/assessment';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

interface CalibrationSurveyProps {
  dimension: DimensionResult;
  campaignId: string;
  dateRange: { startDate: string; endDate: string };
  onSubmit: (response: CalibrationSurveyResponse) => void;
  onClose: () => void;
  onSkip: () => void;
}

type SurveyStep = 'intro' | 'core' | 'details' | 'submitted';

const CalibrationSurvey: React.FC<CalibrationSurveyProps> = ({
  dimension,
  campaignId,
  dateRange,
  onSubmit,
  onClose,
  onSkip,
}) => {
  const [step, setStep] = useState<SurveyStep>('intro');
  const [invisibleWorkCategory, setInvisibleWorkCategory] = useState<InvisibleWorkCategoryLevel | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(3);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [trend, setTrend] = useState<InvisibleWorkTrend>('stable');
  const [additionalContext, setAdditionalContext] = useState('');

  const categoryOptions: { value: InvisibleWorkCategoryLevel; label: string; description: string }[] = [
    { value: 1, label: 'Less than 20%', description: 'Most work is captured in Jira' },
    { value: 2, label: '20% – 40%', description: 'Some work happens outside Jira' },
    { value: 3, label: '40% – 60%', description: 'A fair amount isn\'t tracked' },
    { value: 4, label: '60% – 80%', description: 'Most work isn\'t in Jira' },
    { value: 5, label: 'More than 80%', description: 'Very little is captured' },
  ];

  const confidenceLabels = ['Very uncertain', 'Somewhat uncertain', 'Neutral', 'Fairly confident', 'Very confident'];

  const trendOptions: { value: InvisibleWorkTrend; label: string; icon: string }[] = [
    { value: 'decreased', label: 'Decreased', icon: '↓' },
    { value: 'stable', label: 'About the same', icon: '→' },
    { value: 'increased', label: 'Increased', icon: '↑' },
  ];

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = () => {
    if (!invisibleWorkCategory) return;

    // Anonymous response - no respondentId, teamId, or period info (comes from campaign)
    const response: CalibrationSurveyResponse = {
      campaignId,
      invisibleWorkCategory,
      confidence,
      invisibleWorkTypes: selectedTypes,
      trend,
      additionalContext,
      submittedAt: new Date().toISOString(),
    };

    setStep('submitted');
    setTimeout(() => {
      onSubmit(response);
    }, 2000);
  };

  const formatDateRange = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  const renderIntro = () => (
    <div style={styles.stepContent}>
      <div style={styles.introIcon}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="#DEEBFF" />
          <path d="M32 18v14l8 8" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="4" fill="#0052CC" />
          <path d="M20 44l-4 4M44 44l4 4" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 style={styles.introTitle}>Help Us Improve Our Accuracy</h3>
      <p style={styles.introText}>
        We've analyzed your team's Jira data and identified patterns that suggest invisible work.
        Your input helps us calibrate our model to provide more accurate assessments.
      </p>
      <div style={styles.introHighlight}>
        <span style={styles.introHighlightLabel}>This takes about 1 minute</span>
        <span style={styles.introHighlightValue}>Your response is anonymous</span>
      </div>
      <div style={styles.introActions}>
        <button style={styles.primaryButton} onClick={() => setStep('core')}>
          Start Survey
        </button>
        <button style={styles.textButton} onClick={onSkip}>
          Maybe later
        </button>
      </div>
    </div>
  );

  const renderCoreQuestion = () => (
    <div style={styles.stepContent}>
      <div style={styles.questionHeader}>
        <span style={styles.stepIndicator}>Question 1 of 2</span>
        <h3 style={styles.questionTitle}>
          Over the period <strong>{formatDateRange()}</strong>, what percentage of your team's
          actual work effort was <strong>NOT</strong> reflected in Jira?
        </h3>
        <p style={styles.questionSubtext}>
          Think about all work: meetings, ad-hoc requests, support, learning, etc.
        </p>
      </div>

      <div style={styles.optionsGrid}>
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            style={{
              ...styles.optionCard,
              ...(invisibleWorkCategory === option.value ? styles.optionCardSelected : {}),
            }}
            onClick={() => setInvisibleWorkCategory(option.value)}
          >
            <span style={styles.optionLabel}>{option.label}</span>
            <span style={styles.optionDescription}>{option.description}</span>
            {invisibleWorkCategory === option.value && (
              <span style={styles.optionCheck}>
                <CheckCircleIcon label="" primaryColor="#0052CC" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Confidence slider */}
      <div style={styles.confidenceSection}>
        <label style={styles.confidenceLabel}>
          How confident are you in this estimate?
        </label>
        <div style={styles.confidenceSlider}>
          <input
            type="range"
            min="1"
            max="5"
            value={confidence}
            onChange={(e) => setConfidence(parseInt(e.target.value) as ConfidenceLevel)}
            style={styles.slider}
          />
          <div style={styles.confidenceLabels}>
            {confidenceLabels.map((label, i) => (
              <span
                key={i}
                style={{
                  ...styles.confidenceLabelItem,
                  fontWeight: confidence === i + 1 ? 600 : 400,
                  color: confidence === i + 1 ? '#0052CC' : '#6B778C',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.stepActions}>
        <button style={styles.secondaryButton} onClick={() => setStep('intro')}>
          Back
        </button>
        <button
          style={{
            ...styles.primaryButton,
            opacity: invisibleWorkCategory ? 1 : 0.5,
          }}
          onClick={() => invisibleWorkCategory && setStep('details')}
          disabled={!invisibleWorkCategory}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div style={styles.stepContent}>
      <div style={styles.questionHeader}>
        <span style={styles.stepIndicator}>Question 2 of 2 (Optional)</span>
        <h3 style={styles.questionTitle}>
          What types of work are most often invisible?
        </h3>
        <p style={styles.questionSubtext}>
          Select all that apply. This helps us understand patterns.
        </p>
      </div>

      <div style={styles.typesGrid}>
        {INVISIBLE_WORK_TYPES.map((type) => (
          <button
            key={type.id}
            style={{
              ...styles.typeChip,
              ...(selectedTypes.includes(type.id) ? styles.typeChipSelected : {}),
            }}
            onClick={() => handleTypeToggle(type.id)}
          >
            <span style={styles.typeLabel}>{type.label}</span>
            {selectedTypes.includes(type.id) && (
              <span style={styles.typeCheck}>✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Trend question */}
      <div style={styles.trendSection}>
        <label style={styles.trendLabel}>
          Compared to the previous period, has invisible work...
        </label>
        <div style={styles.trendOptions}>
          {trendOptions.map((option) => (
            <button
              key={option.value}
              style={{
                ...styles.trendButton,
                ...(trend === option.value ? styles.trendButtonSelected : {}),
              }}
              onClick={() => setTrend(option.value)}
            >
              <span style={styles.trendIcon}>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional context */}
      <div style={styles.contextSection}>
        <label style={styles.contextLabel}>
          Anything else you'd like to share? (Optional)
        </label>
        <textarea
          style={styles.contextInput}
          placeholder="E.g., 'We had a major incident this quarter' or 'New team members ramping up'"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          rows={3}
        />
      </div>

      <div style={styles.stepActions}>
        <button style={styles.secondaryButton} onClick={() => setStep('core')}>
          Back
        </button>
        <button style={styles.primaryButton} onClick={handleSubmit}>
          Submit Survey
        </button>
      </div>
    </div>
  );

  const renderSubmitted = () => (
    <div style={styles.submittedContent}>
      <div style={styles.submittedIcon}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="36" fill="#E3FCEF" />
          <path
            d="M26 40l10 10 18-20"
            stroke="#006644"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 style={styles.submittedTitle}>Thank You!</h3>
      <p style={styles.submittedText}>
        Your response helps improve our invisible work detection for all teams.
      </p>
      <div style={styles.submittedComparison}>
        <span style={styles.comparisonLabel}>Your estimate</span>
        <span style={styles.comparisonValue}>
          {categoryOptions.find(o => o.value === invisibleWorkCategory)?.label}
        </span>
        <span style={styles.comparisonLabel}>Our detection</span>
        <span style={styles.comparisonValue}>
          {dimension.riskLevel === 'high' ? 'High risk detected'
            : dimension.riskLevel === 'moderate' ? 'Moderate risk detected'
            : 'Low risk detected'}
        </span>
      </div>
    </div>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {step !== 'submitted' && (
          <button style={styles.closeButton} onClick={onClose}>
            <CrossIcon label="Close" size="medium" />
          </button>
        )}

        <div style={styles.content}>
          {step === 'intro' && renderIntro()}
          {step === 'core' && renderCoreQuestion()}
          {step === 'details' && renderDetails()}
          {step === 'submitted' && renderSubmitted()}
        </div>

        {step !== 'intro' && step !== 'submitted' && (
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: step === 'core' ? '50%' : '100%',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
    padding: '40px',
  },
  modal: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: 'calc(100vh - 80px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 12px 48px rgba(9, 30, 66, 0.25)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6B778C',
    zIndex: 10,
  },
  content: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1,
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#DFE1E6',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0052CC',
    transition: 'width 0.3s ease',
  },

  // Intro step
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  introIcon: {
    marginBottom: '20px',
  },
  introTitle: {
    margin: '0 0 12px 0',
    fontSize: '22px',
    fontWeight: 600,
    color: '#172B4D',
  },
  introText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.6,
    maxWidth: '400px',
  },
  introHighlight: {
    display: 'flex',
    gap: '24px',
    marginBottom: '28px',
  },
  introHighlightLabel: {
    fontSize: '13px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  introHighlightValue: {
    fontSize: '13px',
    color: '#6B778C',
  },
  introActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '280px',
  },

  // Question header
  questionHeader: {
    marginBottom: '24px',
    textAlign: 'left',
    width: '100%',
  },
  stepIndicator: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'block',
  },
  questionTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 500,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  questionSubtext: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },

  // Options grid
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginBottom: '24px',
  },
  optionCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '14px 16px',
    backgroundColor: '#FAFBFC',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  optionCardSelected: {
    backgroundColor: '#DEEBFF',
    border: '2px solid #0052CC',
  },
  optionLabel: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '2px',
  },
  optionDescription: {
    fontSize: '13px',
    color: '#6B778C',
  },
  optionCheck: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
  },

  // Confidence section
  confidenceSection: {
    width: '100%',
    marginBottom: '24px',
  },
  confidenceLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '12px',
  },
  confidenceSlider: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: 'linear-gradient(to right, #DFE1E6 0%, #0052CC 100%)',
    outline: 'none',
    cursor: 'pointer',
  },
  confidenceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  confidenceLabelItem: {
    fontSize: '11px',
    textAlign: 'center',
    flex: 1,
  },

  // Step actions
  stepActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: '8px',
  },

  // Buttons
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#F4F5F7',
    color: '#42526E',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  textButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
  },

  // Types grid
  typesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    width: '100%',
    marginBottom: '24px',
  },
  typeChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  typeChipSelected: {
    backgroundColor: '#DEEBFF',
    border: '1px solid #0052CC',
    color: '#0052CC',
  },
  typeLabel: {
    fontWeight: 500,
  },
  typeCheck: {
    fontSize: '12px',
    fontWeight: 700,
  },

  // Trend section
  trendSection: {
    width: '100%',
    marginBottom: '24px',
  },
  trendLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '12px',
  },
  trendOptions: {
    display: 'flex',
    gap: '10px',
  },
  trendButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#42526E',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  trendButtonSelected: {
    backgroundColor: '#DEEBFF',
    border: '2px solid #0052CC',
    color: '#0052CC',
  },
  trendIcon: {
    fontSize: '18px',
  },

  // Context section
  contextSection: {
    width: '100%',
    marginBottom: '16px',
  },
  contextLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    marginBottom: '8px',
  },
  contextInput: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#172B4D',
    resize: 'vertical',
    fontFamily: 'inherit',
  },

  // Submitted step
  submittedContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px 0',
  },
  submittedIcon: {
    marginBottom: '20px',
  },
  submittedTitle: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#006644',
  },
  submittedText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#5E6C84',
  },
  submittedComparison: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 24px',
    padding: '16px 24px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  comparisonLabel: {
    fontSize: '12px',
    color: '#6B778C',
    textAlign: 'center',
  },
  comparisonValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    textAlign: 'center',
  },
};

export default CalibrationSurvey;
