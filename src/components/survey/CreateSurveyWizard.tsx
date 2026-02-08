import React, { useState } from 'react';
import { SurveyCampaign } from '../../types/assessment';
import { MOCK_PROJECTS } from '../../constants/mockSurveyData';
import TeamMemberPicker from './TeamMemberPicker';
import EmailPreview from './EmailPreview';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

interface CreateSurveyWizardProps {
  existingCampaign: SurveyCampaign | null;
  onBack: () => void;
  onComplete: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const CreateSurveyWizard: React.FC<CreateSurveyWizardProps> = ({
  existingCampaign,
  onBack,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [surveyName, setSurveyName] = useState(existingCampaign?.name || '');
  const [selectedProject, setSelectedProject] = useState(existingCampaign?.projectId || MOCK_PROJECTS[0].id);
  const [periodStart, setPeriodStart] = useState(existingCampaign?.periodStart || '2025-01-01');
  const [periodEnd, setPeriodEnd] = useState(existingCampaign?.periodEnd || '2025-03-31');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(existingCampaign?.selectedRoles || []);
  const [sendImmediately, setSendImmediately] = useState(existingCampaign?.notificationSettings.sendImmediately ?? true);
  const [scheduledDate, setScheduledDate] = useState(existingCampaign?.notificationSettings.scheduledFor || '');
  const [reminderDays, setReminderDays] = useState<number[]>(existingCampaign?.notificationSettings.reminderDays || [3, 7]);
  const [closesAt, setClosesAt] = useState(existingCampaign?.closesAt?.split('T')[0] || '2025-03-31');

  const project = MOCK_PROJECTS.find((p) => p.id === selectedProject) || MOCK_PROJECTS[0];

  const steps = [
    { number: 1, title: 'Period', description: 'Select analysis period' },
    { number: 2, title: 'Recipients', description: 'Choose who to survey' },
    { number: 3, title: 'Notifications', description: 'Configure emails' },
    { number: 4, title: 'Review', description: 'Confirm and launch' },
  ];

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return surveyName.trim() !== '' && selectedProject !== '' && periodStart !== '' && periodEnd !== '';
      case 2:
        return selectedRoles.length > 0;
      case 3:
        return (sendImmediately || scheduledDate !== '') && closesAt !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    } else {
      onBack();
    }
  };

  const handleLaunch = () => {
    // In production, this would create the campaign via API
    alert('Survey created and launched! (Demo mode)');
    onComplete();
  };

  const handleSaveDraft = () => {
    alert('Survey saved as draft. (Demo mode)');
    onComplete();
  };

  const toggleReminderDay = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter((d) => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => a - b));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStep1 = () => (
    <div style={styles.stepContent}>
      <h3 style={styles.stepTitle}>Select Analysis Period</h3>
      <p style={styles.stepDescription}>
        Choose the time period that team members should reflect on when answering the survey.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Survey Name</label>
        <input
          type="text"
          style={styles.input}
          value={surveyName}
          onChange={(e) => setSurveyName(e.target.value)}
          placeholder="e.g., Q1 2025 Survey"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Project</label>
        <select
          style={styles.select}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {MOCK_PROJECTS.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.name} ({proj.key})
            </option>
          ))}
        </select>
      </div>

      <div style={styles.dateRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Period Start</label>
          <input
            type="date"
            style={styles.input}
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Period End</label>
          <input
            type="date"
            style={styles.input}
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.periodPreview}>
        <span style={styles.periodPreviewLabel}>Team members will be asked about:</span>
        <span style={styles.periodPreviewValue}>
          {periodStart && periodEnd ? `${formatDate(periodStart)} - ${formatDate(periodEnd)}` : 'Select dates above'}
        </span>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.stepContent}>
      <h3 style={styles.stepTitle}>Select Recipients</h3>
      <p style={styles.stepDescription}>
        Choose which project roles should receive the survey. Team members are automatically
        derived from Jira project roles.
      </p>

      <TeamMemberPicker
        selectedRoles={selectedRoles}
        onRolesChange={setSelectedRoles}
        projectId={selectedProject}
      />
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.stepContent}>
      <h3 style={styles.stepTitle}>Configure Notifications</h3>
      <p style={styles.stepDescription}>
        Set up when to send invitations and reminders to team members.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Initial Invitation</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              checked={sendImmediately}
              onChange={() => setSendImmediately(true)}
              style={styles.radio}
            />
            <span>Send immediately after launch</span>
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              checked={!sendImmediately}
              onChange={() => setSendImmediately(false)}
              style={styles.radio}
            />
            <span>Schedule for later</span>
          </label>
        </div>
        {!sendImmediately && (
          <input
            type="datetime-local"
            style={{ ...styles.input, marginTop: '12px' }}
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Automatic Reminders</label>
        <p style={styles.formHint}>Send reminders to recipients who haven't responded:</p>
        <div style={styles.reminderOptions}>
          {[3, 5, 7, 14].map((day) => (
            <button
              key={day}
              style={{
                ...styles.reminderButton,
                ...(reminderDays.includes(day) ? styles.reminderButtonActive : {}),
              }}
              onClick={() => toggleReminderDay(day)}
            >
              After {day} days
            </button>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Survey Closes</label>
        <input
          type="date"
          style={styles.input}
          value={closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
        />
        <p style={styles.formHint}>
          No responses will be accepted after this date.
        </p>
      </div>

      <div style={styles.emailPreviewSection}>
        <h4 style={styles.previewTitle}>Email Preview</h4>
        <EmailPreview
          projectName={project.name}
          periodStart={periodStart}
          periodEnd={periodEnd}
          closesAt={closesAt}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div style={styles.stepContent}>
      <h3 style={styles.stepTitle}>Review & Launch</h3>
      <p style={styles.stepDescription}>
        Review your survey settings before launching.
      </p>

      <div style={styles.reviewCard}>
        <div style={styles.reviewSection}>
          <h4 style={styles.reviewLabel}>Survey Details</h4>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Name:</span>
            <span style={styles.reviewItemValue}>{surveyName}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Project:</span>
            <span style={styles.reviewItemValue}>{project.name}</span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Period:</span>
            <span style={styles.reviewItemValue}>
              {formatDate(periodStart)} - {formatDate(periodEnd)}
            </span>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h4 style={styles.reviewLabel}>Recipients</h4>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Roles:</span>
            <span style={styles.reviewItemValue}>
              {selectedRoles.length > 0
                ? selectedRoles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
                : 'None selected'}
            </span>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h4 style={styles.reviewLabel}>Notifications</h4>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Initial Send:</span>
            <span style={styles.reviewItemValue}>
              {sendImmediately ? 'Immediately after launch' : formatDate(scheduledDate)}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Reminders:</span>
            <span style={styles.reviewItemValue}>
              {reminderDays.length > 0
                ? `After ${reminderDays.join(', ')} days`
                : 'No reminders'}
            </span>
          </div>
          <div style={styles.reviewItem}>
            <span style={styles.reviewItemLabel}>Closes:</span>
            <span style={styles.reviewItemValue}>{formatDate(closesAt)}</span>
          </div>
        </div>
      </div>

      <div style={styles.launchNote}>
        <CheckCircleIcon label="" primaryColor="#36B37E" />
        <span>
          Once launched, survey invitations will be sent to all selected recipients via email.
        </span>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={handleBack}>
            <ArrowLeftIcon label="Back" primaryColor="white" />
            <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              {existingCampaign ? 'Edit Survey' : 'Create New Survey'}
            </h1>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressContent}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                style={{
                  ...styles.stepIndicator,
                  ...(currentStep === step.number ? styles.stepIndicatorActive : {}),
                  ...(currentStep > step.number ? styles.stepIndicatorCompleted : {}),
                }}
              >
                <div style={styles.stepCircle}>
                  {currentStep > step.number ? (
                    <CheckCircleIcon label="" size="small" primaryColor="#36B37E" />
                  ) : (
                    <span style={styles.stepNumber}>{step.number}</span>
                  )}
                </div>
                <div style={styles.stepInfo}>
                  <span style={styles.stepName}>{step.title}</span>
                  <span style={styles.stepDesc}>{step.description}</span>
                </div>
              </div>
              {index < steps.length - 1 && <div style={styles.stepConnector} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Actions */}
          <div style={styles.actions}>
            {currentStep === 4 ? (
              <>
                <button style={styles.secondaryButton} onClick={handleSaveDraft}>
                  Save as Draft
                </button>
                <button style={styles.primaryButton} onClick={handleLaunch}>
                  Launch Survey
                </button>
              </>
            ) : (
              <button
                style={{
                  ...styles.primaryButton,
                  ...(canProceed() ? {} : styles.buttonDisabled),
                }}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
              </button>
            )}
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
    padding: '16px 24px',
    color: 'white',
  },
  headerContent: {
    maxWidth: '900px',
    margin: '0 auto',
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
  titleSection: {
    marginTop: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: 'white',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DFE1E6',
    padding: '20px 24px',
  },
  progressContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '900px',
    margin: '0 auto',
    gap: '8px',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    opacity: 0.5,
  },
  stepIndicatorActive: {
    opacity: 1,
    backgroundColor: '#DEEBFF',
  },
  stepIndicatorCompleted: {
    opacity: 1,
  },
  stepCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#DFE1E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5E6C84',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stepName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDesc: {
    fontSize: '11px',
    color: '#6B778C',
  },
  stepConnector: {
    width: '40px',
    height: '2px',
    backgroundColor: '#DFE1E6',
  },
  main: {
    padding: '32px 24px',
  },
  contentWrapper: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  stepContent: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
  },
  stepTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  stepDescription: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  periodPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '6px',
  },
  periodPreviewLabel: {
    fontSize: '13px',
    color: '#0747A6',
  },
  periodPreviewValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0052CC',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
    margin: 0,
  },
  formHint: {
    margin: '8px 0 12px 0',
    fontSize: '12px',
    color: '#6B778C',
  },
  reminderOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  reminderButton: {
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#172B4D',
    cursor: 'pointer',
  },
  reminderButtonActive: {
    backgroundColor: '#DEEBFF',
    border: '1px solid #0052CC',
    color: '#0052CC',
  },
  emailPreviewSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #DFE1E6',
  },
  previewTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  reviewCard: {
    backgroundColor: '#FAFBFC',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
  },
  reviewSection: {
    marginBottom: '20px',
  },
  reviewLabel: {
    margin: '0 0 12px 0',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reviewItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '8px',
  },
  reviewItemLabel: {
    fontSize: '13px',
    color: '#6B778C',
    width: '100px',
    flexShrink: 0,
  },
  reviewItemValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  launchNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    marginTop: '16px',
    fontSize: '14px',
    color: '#006644',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#DFE1E6',
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
};

export default CreateSurveyWizard;
