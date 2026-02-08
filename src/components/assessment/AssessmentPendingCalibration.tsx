import React, { useState, useEffect } from 'react';
import { WizardState, getSurveyDeadlineDate } from '../../types/wizard';
import { SurveyCampaign } from '../../types/assessment';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';

interface AssessmentPendingCalibrationProps {
  wizardState: WizardState;
  campaign: SurveyCampaign;
  onBack: () => void;
  onGenerateCalibrated: () => void;
  onGenerateUncalibrated: () => void;
  onSendReminder: () => void;
}

const AssessmentPendingCalibration: React.FC<AssessmentPendingCalibrationProps> = ({
  wizardState,
  campaign,
  onBack,
  onGenerateCalibrated,
  onGenerateUncalibrated,
  onSendReminder,
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  const totalRecipients = campaign.recipients.length;
  const responseCount = campaign.responses.length;
  const responseRate = totalRecipients > 0 ? (responseCount / totalRecipients) * 100 : 0;
  const quorumMet = responseRate >= wizardState.step6.quorumPercentage;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!campaign.closesAt) {
        setTimeRemaining('No deadline set');
        return;
      }
      const deadline = new Date(campaign.closesAt);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Survey closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} day${days > 1 ? 's' : ''} remaining`);
      } else {
        setTimeRemaining(`${hours} hour${hours > 1 ? 's' : ''} remaining`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [campaign.closesAt]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={onBack}>
            <ArrowLeftIcon label="Back" primaryColor="white" />
            <span>Back to Setup</span>
          </button>

          <div style={styles.titleSection}>
            <h1 style={styles.title}>
              Team Health Assessment
              {wizardState.step1.teamName && (
                <span style={styles.teamName}> — {wizardState.step1.teamName}</span>
              )}
            </h1>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              Awaiting Team Calibration
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Progress Card */}
          <div style={styles.progressCard}>
            <div style={styles.progressHeader}>
              <h2 style={styles.progressTitle}>Survey Responses</h2>
              <span style={styles.timeRemaining}>{timeRemaining}</span>
            </div>

            {/* Progress Visualization */}
            <div style={styles.progressVisualization}>
              <div style={styles.progressCircle}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#EBECF0"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={quorumMet ? '#36B37E' : '#0052CC'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(responseRate / 100) * 440} 440`}
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                  {/* Quorum marker */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#FFE380"
                    strokeWidth="4"
                    strokeDasharray="4 436"
                    transform={`rotate(${(wizardState.step6.quorumPercentage / 100) * 360 - 90} 80 80)`}
                  />
                </svg>
                <div style={styles.progressCenter}>
                  <span style={styles.progressPercent}>{Math.round(responseRate)}%</span>
                  <span style={styles.progressLabel}>response rate</span>
                </div>
              </div>

              <div style={styles.progressStats}>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Responses received</span>
                  <span style={styles.statValue}>{responseCount} of {totalRecipients}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Quorum target</span>
                  <span style={styles.statValue}>{wizardState.step6.quorumPercentage}%</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Survey closes</span>
                  <span style={styles.statValue}>{campaign.closesAt ? formatDate(campaign.closesAt) : 'Not set'}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Reminders sent</span>
                  <span style={styles.statValue}>{campaign.remindersSent}</span>
                </div>
              </div>
            </div>

            {/* Quorum Status */}
            {quorumMet ? (
              <div style={styles.quorumSuccess}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#E3FCEF" />
                  <path d="M8 12l3 3 5-6" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={styles.quorumContent}>
                  <span style={styles.quorumTitle}>Quorum reached!</span>
                  <span style={styles.quorumText}>
                    You have enough responses to generate calibrated results.
                  </span>
                </div>
              </div>
            ) : (
              <div style={styles.quorumPending}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#DEEBFF" />
                  <path d="M12 7v5l3 3" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div style={styles.quorumContent}>
                  <span style={styles.quorumTitle}>
                    {Math.ceil((wizardState.step6.quorumPercentage / 100) * totalRecipients) - responseCount} more responses needed
                  </span>
                  <span style={styles.quorumText}>
                    Waiting for {wizardState.step6.quorumPercentage}% response rate to reach quorum
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={styles.actions}>
              {quorumMet && (
                <button style={styles.primaryButton} onClick={onGenerateCalibrated}>
                  Generate Calibrated Results
                </button>
              )}
              {!quorumMet && (
                <button style={styles.secondaryButton} onClick={onSendReminder}>
                  Send Reminder to Non-Responders
                </button>
              )}
              {quorumMet && (
                <button style={styles.secondaryButton} onClick={() => {}}>
                  Wait for More Responses
                </button>
              )}
            </div>

            {/* Skip Option */}
            <div style={styles.skipSection}>
              <span style={styles.skipDivider}>or</span>
              <button style={styles.skipButton} onClick={onGenerateUncalibrated}>
                Generate Uncalibrated Results
              </button>
              <span style={styles.skipHint}>
                (Skip remaining responses - results will have lower confidence)
              </span>
            </div>
          </div>

          {/* Response Breakdown */}
          <div style={styles.breakdownCard}>
            <h3 style={styles.breakdownTitle}>Response Breakdown by Role</h3>
            <div style={styles.roleBreakdown}>
              {/* Derive unique roles from recipients */}
              {Array.from(new Set(campaign.recipients.map(r => r.role))).map(role => {
                  const roleRecipients = campaign.recipients.filter(r => r.role === role);
                  const roleResponses = roleRecipients.filter(r => r.status === 'completed').length;
                  const roleRate = roleRecipients.length > 0 ? (roleResponses / roleRecipients.length) * 100 : 0;

                  return (
                    <div key={role} style={styles.roleRow}>
                      <div style={styles.roleInfo}>
                        <span style={styles.roleName}>{role}</span>
                        <span style={styles.roleCount}>
                          {roleResponses}/{roleRecipients.length} responded
                        </span>
                      </div>
                      <div style={styles.roleProgressBar}>
                        <div
                          style={{
                            ...styles.roleProgressFill,
                            width: `${roleRate}%`,
                            backgroundColor: roleRate >= 50 ? '#36B37E' : '#FFAB00',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Anonymous responses:</strong> Individual responses cannot be traced back to
              team members. Only aggregated results are used for calibration.
            </p>
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
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: 'white',
  },
  teamName: {
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 500,
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FFE380',
    animation: 'pulse 2s infinite',
  },
  main: {
    padding: '32px 24px',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  progressTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  timeRemaining: {
    padding: '6px 12px',
    backgroundColor: '#FFFAE6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#974F0C',
  },
  progressVisualization: {
    display: 'flex',
    alignItems: 'center',
    gap: '48px',
    marginBottom: '24px',
  },
  progressCircle: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0,
  },
  progressCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  progressStats: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B778C',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  quorumSuccess: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#E3FCEF',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  quorumPending: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  quorumContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  quorumTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  quorumText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
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
  skipSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #EBECF0',
  },
  skipDivider: {
    fontSize: '13px',
    color: '#6B778C',
  },
  skipButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  skipHint: {
    fontSize: '12px',
    color: '#97A0AF',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  breakdownTitle: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  roleBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  roleInfo: {
    width: '160px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  roleName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  roleCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  roleProgressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  roleProgressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  infoBox: {
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
};

export default AssessmentPendingCalibration;
