import React, { useState } from 'react';
import {
  SurveyCampaign,
  InvisibleWorkCategoryLevel,
  ConfidenceLevel,
  InvisibleWorkTrend,
  INVISIBLE_WORK_TYPES,
} from '../../types/assessment';

interface StandaloneSurveyFormProps {
  campaign: SurveyCampaign;
  onSubmit: () => void;
  onBack: () => void;
}

type SurveyStep = 'intro' | 'question1' | 'question2' | 'question3' | 'submitted';

const StandaloneSurveyForm: React.FC<StandaloneSurveyFormProps> = ({
  campaign,
  onSubmit,
  onBack,
}) => {
  const [step, setStep] = useState<SurveyStep>('intro');
  const [category, setCategory] = useState<InvisibleWorkCategoryLevel | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(3);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [trend, setTrend] = useState<InvisibleWorkTrend | null>(null);

  const formatPeriod = (): string => {
    const start = new Date(campaign.periodStart);
    const end = new Date(campaign.periodEnd);
    return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleNext = () => {
    switch (step) {
      case 'intro':
        setStep('question1');
        break;
      case 'question1':
        setStep('question2');
        break;
      case 'question2':
        setStep('question3');
        break;
      case 'question3':
        setStep('submitted');
        break;
    }
  };

  const handleBackStep = () => {
    switch (step) {
      case 'question1':
        setStep('intro');
        break;
      case 'question2':
        setStep('question1');
        break;
      case 'question3':
        setStep('question2');
        break;
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'intro':
        return true;
      case 'question1':
        return category !== null;
      case 'question2':
        return true; // Optional
      case 'question3':
        return true; // Optional
      default:
        return false;
    }
  };

  const renderIntro = () => (
    <div style={styles.stepContent}>
      <div style={styles.logoContainer}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="8" fill="#0052CC" />
          <path
            d="M12 24c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12z"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M24 18v8M20 26h8"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h1 style={styles.introTitle}>Jira Health Check Survey</h1>
      <p style={styles.introProject}>{campaign.projectName}</p>

      <div style={styles.periodCard}>
        <span style={styles.periodLabel}>Survey Period</span>
        <span style={styles.periodValue}>{formatPeriod()}</span>
      </div>

      <p style={styles.introText}>
        This quick survey helps calibrate our invisible work detection system.
        Your response is anonymous and takes about 1 minute to complete.
      </p>

      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>What is "invisible work"?</h4>
        <p style={styles.infoText}>
          Work that your team does but isn't captured in Jira - like ad-hoc requests,
          quick fixes, support work, or meetings that don't have associated tickets.
        </p>
      </div>
    </div>
  );

  const renderQuestion1 = () => (
    <div style={styles.stepContent}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: '33%' }} />
      </div>

      <h2 style={styles.questionTitle}>
        Over the period <strong>{formatPeriod()}</strong>, what percentage of your
        team's actual work effort was NOT reflected in Jira?
      </h2>

      <div style={styles.categoryOptions}>
        {([1, 2, 3, 4, 5] as InvisibleWorkCategoryLevel[]).map((cat) => {
          const labels: Record<InvisibleWorkCategoryLevel, { title: string; desc: string }> = {
            1: { title: 'Less than 20%', desc: 'Most work is captured in Jira' },
            2: { title: '20% - 40%', desc: 'Some work happens outside Jira' },
            3: { title: '40% - 60%', desc: 'About half the work is invisible' },
            4: { title: '60% - 80%', desc: 'Most work happens outside Jira' },
            5: { title: 'More than 80%', desc: 'Very little work is in Jira' },
          };

          return (
            <button
              key={cat}
              style={{
                ...styles.categoryButton,
                ...(category === cat ? styles.categoryButtonSelected : {}),
              }}
              onClick={() => setCategory(cat)}
            >
              <div style={styles.categoryButtonContent}>
                <span style={styles.categoryButtonTitle}>{labels[cat].title}</span>
                <span style={styles.categoryButtonDesc}>{labels[cat].desc}</span>
              </div>
              {category === cat && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#0052CC" />
                  <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div style={styles.confidenceSection}>
        <label style={styles.confidenceLabel}>
          How confident are you in this estimate?
        </label>
        <div style={styles.confidenceSlider}>
          <span style={styles.confidenceEndLabel}>Not at all</span>
          <div style={styles.confidenceButtons}>
            {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => (
              <button
                key={level}
                style={{
                  ...styles.confidenceButton,
                  ...(confidence === level ? styles.confidenceButtonSelected : {}),
                }}
                onClick={() => setConfidence(level)}
              >
                {level}
              </button>
            ))}
          </div>
          <span style={styles.confidenceEndLabel}>Very confident</span>
        </div>
      </div>
    </div>
  );

  const renderQuestion2 = () => (
    <div style={styles.stepContent}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: '66%' }} />
      </div>

      <h2 style={styles.questionTitle}>
        What types of work are most commonly not captured in Jira?
      </h2>
      <p style={styles.questionSubtitle}>Select all that apply (optional)</p>

      <div style={styles.typeGrid}>
        {INVISIBLE_WORK_TYPES.map((type) => (
          <button
            key={type.id}
            style={{
              ...styles.typeButton,
              ...(selectedTypes.includes(type.id) ? styles.typeButtonSelected : {}),
            }}
            onClick={() => toggleType(type.id)}
          >
            <div style={styles.typeContent}>
              <span style={styles.typeLabel}>{type.label}</span>
              <span style={styles.typeDesc}>{type.description}</span>
            </div>
            {selectedTypes.includes(type.id) && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8l3 3 5-6" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuestion3 = () => (
    <div style={styles.stepContent}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: '100%' }} />
      </div>

      <h2 style={styles.questionTitle}>
        Compared to previous periods, has invisible work...
      </h2>
      <p style={styles.questionSubtitle}>Optional - skip if unsure</p>

      <div style={styles.trendOptions}>
        {(['increased', 'stable', 'decreased'] as InvisibleWorkTrend[]).map((t) => {
          const labels: Record<InvisibleWorkTrend, { icon: string; label: string }> = {
            increased: { icon: '↑', label: 'Increased' },
            stable: { icon: '→', label: 'Stayed about the same' },
            decreased: { icon: '↓', label: 'Decreased' },
          };

          return (
            <button
              key={t}
              style={{
                ...styles.trendButton,
                ...(trend === t ? styles.trendButtonSelected : {}),
              }}
              onClick={() => setTrend(trend === t ? null : t)}
            >
              <span style={styles.trendIcon}>{labels[t].icon}</span>
              <span style={styles.trendLabel}>{labels[t].label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSubmitted = () => (
    <div style={styles.submittedContent}>
      <div style={styles.successIcon}>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="#E3FCEF" stroke="#36B37E" strokeWidth="3" />
          <path d="M22 32l8 8 12-14" stroke="#36B37E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 style={styles.successTitle}>Thank you!</h1>
      <p style={styles.successText}>
        Your response has been recorded and will help improve invisible work
        detection for your entire team.
      </p>

      <div style={styles.successNote}>
        <p style={styles.successNoteText}>
          Your response is anonymous. Results are only viewed in aggregate
          to calibrate the detection system.
        </p>
      </div>

      <button style={styles.doneButton} onClick={onSubmit}>
        Done
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.surveyCard}>
        {step === 'intro' && renderIntro()}
        {step === 'question1' && renderQuestion1()}
        {step === 'question2' && renderQuestion2()}
        {step === 'question3' && renderQuestion3()}
        {step === 'submitted' && renderSubmitted()}

        {step !== 'submitted' && (
          <div style={styles.actions}>
            {step !== 'intro' && (
              <button style={styles.backButton} onClick={handleBackStep}>
                Back
              </button>
            )}
            <button
              style={{
                ...styles.nextButton,
                ...(canProceed() ? {} : styles.buttonDisabled),
              }}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === 'question3' ? 'Submit' : 'Continue'}
            </button>
          </div>
        )}
      </div>

      {/* Demo Note */}
      <div style={styles.demoNote}>
        <p style={styles.demoText}>
          <strong>Demo Mode:</strong> This is what team members see when they click
          the survey link from their email. Responses are simulated in this demo.
        </p>
        <button style={styles.exitDemo} onClick={onBack}>
          Exit Demo
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F4F5F7',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  surveyCard: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  stepContent: {
    padding: '32px',
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#DFE1E6',
    borderRadius: '2px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  introTitle: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: '#172B4D',
    textAlign: 'center',
  },
  introProject: {
    margin: '0 0 24px 0',
    fontSize: '16px',
    color: '#6B778C',
    textAlign: 'center',
  },
  periodCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  periodLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#0747A6',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  periodValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0052CC',
  },
  introText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#172B4D',
    lineHeight: 1.6,
    textAlign: 'center',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    borderLeft: '3px solid #0052CC',
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  questionTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
    lineHeight: 1.4,
  },
  questionSubtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  categoryOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  categoryButtonSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#DEEBFF',
  },
  categoryButtonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  categoryButtonTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  categoryButtonDesc: {
    fontSize: '13px',
    color: '#6B778C',
  },
  confidenceSection: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  confidenceLabel: {
    display: 'block',
    marginBottom: '12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  confidenceSlider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  confidenceEndLabel: {
    fontSize: '11px',
    color: '#6B778C',
    width: '70px',
  },
  confidenceButtons: {
    display: 'flex',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
  },
  confidenceButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '2px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    color: '#6B778C',
    cursor: 'pointer',
  },
  confidenceButtonSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  typeButton: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
  },
  typeButtonSelected: {
    border: '1px solid #0052CC',
    backgroundColor: '#DEEBFF',
  },
  typeContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  typeLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  typeDesc: {
    fontSize: '11px',
    color: '#6B778C',
  },
  trendOptions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  trendButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 32px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  trendButtonSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#DEEBFF',
  },
  trendIcon: {
    fontSize: '24px',
    color: '#0052CC',
  },
  trendLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 32px 32px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  nextButton: {
    padding: '12px 24px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  buttonDisabled: {
    backgroundColor: '#DFE1E6',
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
  submittedContent: {
    padding: '48px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  successIcon: {
    marginBottom: '24px',
  },
  successTitle: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: 700,
    color: '#172B4D',
  },
  successText: {
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#5E6C84',
    lineHeight: 1.6,
    maxWidth: '400px',
  },
  successNote: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  successNoteText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  doneButton: {
    padding: '12px 32px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  demoNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '600px',
    marginTop: '24px',
    padding: '12px 16px',
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '8px',
  },
  demoText: {
    margin: 0,
    fontSize: '12px',
    color: '#974F0C',
  },
  exitDemo: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#172B4D',
    cursor: 'pointer',
    marginLeft: '16px',
    flexShrink: 0,
  },
};

export default StandaloneSurveyForm;
