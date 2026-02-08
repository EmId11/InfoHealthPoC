import React, { useEffect } from 'react';
import { Step6Data, CalibrationChoice, QuorumPercentage } from '../../types/wizard';
import { MOCK_PROJECT_MEMBERS } from '../../constants/mockSurveyData';

interface Step6CalibrationOptionsProps {
  data: Step6Data;
  teamName: string;
  onUpdate: (data: Partial<Step6Data>) => void;
}

const Step6CalibrationOptions: React.FC<Step6CalibrationOptionsProps> = ({
  data,
  teamName,
  onUpdate,
}) => {
  // Initialize with all members selected on first render
  useEffect(() => {
    if (data.selectedMemberIds.length === 0) {
      onUpdate({ selectedMemberIds: MOCK_PROJECT_MEMBERS.map(m => m.id) });
    }
  }, []);

  const toggleMember = (memberId: string) => {
    if (data.selectedMemberIds.includes(memberId)) {
      onUpdate({ selectedMemberIds: data.selectedMemberIds.filter(id => id !== memberId) });
    } else {
      onUpdate({ selectedMemberIds: [...data.selectedMemberIds, memberId] });
    }
  };

  const selectAll = () => {
    onUpdate({ selectedMemberIds: MOCK_PROJECT_MEMBERS.map(m => m.id) });
  };

  const deselectAll = () => {
    onUpdate({ selectedMemberIds: [] });
  };

  const selectedCount = data.selectedMemberIds.length;
  const totalCount = MOCK_PROJECT_MEMBERS.length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Calibration Options</h2>
        <p style={styles.subtitle}>
          Choose how to generate your invisible work assessment
        </p>
      </div>

      <div style={styles.optionsContainer}>
        {/* Option 1: Collect Feedback */}
        <button
          style={{
            ...styles.optionCard,
            ...(data.calibrationChoice === 'collectFeedback' ? styles.optionCardSelected : {}),
          }}
          onClick={() => onUpdate({ calibrationChoice: 'collectFeedback' })}
        >
          <div style={styles.optionHeader}>
            <div style={styles.radioCircle}>
              {data.calibrationChoice === 'collectFeedback' && (
                <div style={styles.radioFill} />
              )}
            </div>
            <div style={styles.optionContent}>
              <div style={styles.optionTitleRow}>
                <span style={styles.optionTitle}>Collect Team Feedback First</span>
                <span style={styles.recommendedBadge}>Recommended</span>
              </div>
              <p style={styles.optionDescription}>
                Survey your team before generating results. Assessment will include
                calibration data for higher confidence scores.
              </p>
            </div>
          </div>

          {data.calibrationChoice === 'collectFeedback' && (
            <div style={styles.optionDetails}>
              {/* Team Member Selection */}
              <div style={styles.detailSection}>
                <div style={styles.memberHeaderRow}>
                  <label style={styles.detailLabel}>Team members to survey</label>
                  <div style={styles.selectActions}>
                    <button
                      style={styles.selectActionButton}
                      onClick={(e) => { e.stopPropagation(); selectAll(); }}
                    >
                      Select all
                    </button>
                    <span style={styles.actionDivider}>|</span>
                    <button
                      style={styles.selectActionButton}
                      onClick={(e) => { e.stopPropagation(); deselectAll(); }}
                    >
                      Deselect all
                    </button>
                  </div>
                </div>
                <div style={styles.memberGrid}>
                  {MOCK_PROJECT_MEMBERS.map(member => (
                    <button
                      key={member.id}
                      style={{
                        ...styles.memberChip,
                        ...(data.selectedMemberIds.includes(member.id) ? styles.memberChipSelected : styles.memberChipUnselected),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMember(member.id);
                      }}
                    >
                      <div style={styles.checkbox}>
                        {data.selectedMemberIds.includes(member.id) && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={styles.memberName}>{member.displayName}</span>
                      <span style={styles.memberRole}>{member.roles[0]}</span>
                    </button>
                  ))}
                </div>
                <p style={styles.memberCount}>
                  {selectedCount} of {totalCount} team member{selectedCount !== 1 ? 's' : ''} will be surveyed
                </p>
              </div>

              {/* Quorum */}
              <div style={styles.detailSection}>
                <label style={styles.detailLabel}>Minimum response rate (quorum)</label>
                <div style={styles.quorumOptions}>
                  {([30, 50, 70, 100] as QuorumPercentage[]).map(pct => (
                    <button
                      key={pct}
                      style={{
                        ...styles.quorumButton,
                        ...(data.quorumPercentage === pct ? styles.quorumButtonSelected : {}),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ quorumPercentage: pct });
                      }}
                    >
                      {pct === 100 ? 'All' : `${pct}%`}
                    </button>
                  ))}
                </div>
                <p style={styles.quorumHint}>
                  Results can be generated once {data.quorumPercentage}% of recipients respond
                  {data.quorumPercentage < 100 && ', or you can wait for more'}
                </p>
              </div>

              {/* Deadline */}
              <div style={styles.detailSection}>
                <label style={styles.detailLabel}>Survey deadline</label>
                <div style={styles.deadlineOptions}>
                  {[7, 14, 21, 30].map(days => (
                    <button
                      key={days}
                      style={{
                        ...styles.deadlineButton,
                        ...(data.surveyDeadlineDays === days ? styles.deadlineButtonSelected : {}),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ surveyDeadlineDays: days });
                      }}
                    >
                      {days === 7 ? '1 week' : days === 14 ? '2 weeks' : days === 21 ? '3 weeks' : '1 month'}
                    </button>
                  ))}
                </div>
              </div>

              {/* What happens */}
              <div style={styles.flowPreview}>
                <div style={styles.flowStep}>
                  <div style={styles.flowNumber}>1</div>
                  <span>Survey sent to {selectedCount} team members</span>
                </div>
                <div style={styles.flowConnector} />
                <div style={styles.flowStep}>
                  <div style={styles.flowNumber}>2</div>
                  <span>Wait for {data.quorumPercentage}% responses (or deadline)</span>
                </div>
                <div style={styles.flowConnector} />
                <div style={styles.flowStep}>
                  <div style={styles.flowNumber}>3</div>
                  <span>Generate calibrated results</span>
                </div>
              </div>
            </div>
          )}
        </button>

        {/* Option 2: Generate Now */}
        <button
          style={{
            ...styles.optionCard,
            ...(data.calibrationChoice === 'generateNow' ? styles.optionCardSelected : {}),
          }}
          onClick={() => onUpdate({ calibrationChoice: 'generateNow' })}
        >
          <div style={styles.optionHeader}>
            <div style={styles.radioCircle}>
              {data.calibrationChoice === 'generateNow' && (
                <div style={styles.radioFill} />
              )}
            </div>
            <div style={styles.optionContent}>
              <span style={styles.optionTitle}>Generate Results Now</span>
              <p style={styles.optionDescription}>
                Skip calibration and generate results immediately. Results will be
                marked as "Uncalibrated" with lower confidence indicators.
              </p>
            </div>
          </div>

          {data.calibrationChoice === 'generateNow' && (
            <div style={styles.warningBox}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 6v4M10 14h.01M18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  stroke="#974F0C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                Without team feedback, the assessment relies solely on Jira data patterns.
                Results may be less accurate for your specific team context.
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div style={styles.infoBox}>
        <h4 style={styles.infoTitle}>Why calibrate?</h4>
        <p style={styles.infoText}>
          Invisible work patterns vary between teams. By collecting anonymous feedback from
          {teamName ? ` ${teamName}` : ' your team'}, we can validate our automated detection
          and adjust confidence levels. Teams that calibrate typically see 40% more accurate results.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '700px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #DFE1E6',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  optionCardSelected: {
    border: '2px solid #0052CC',
    backgroundColor: '#FAFBFC',
  },
  optionHeader: {
    display: 'flex',
    gap: '16px',
  },
  radioCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #DFE1E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  radioFill: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
  },
  optionContent: {
    flex: 1,
  },
  optionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  recommendedBadge: {
    padding: '2px 8px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  optionDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: 1.5,
  },
  optionDetails: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #EBECF0',
  },
  detailSection: {
    marginBottom: '20px',
  },
  memberHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  detailLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  selectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectActionButton: {
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '12px',
    color: '#0052CC',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  actionDivider: {
    color: '#DFE1E6',
    fontSize: '12px',
  },
  memberGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '240px',
    overflowY: 'auto',
    marginBottom: '8px',
    padding: '4px',
  },
  memberChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  },
  memberChipSelected: {
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
  },
  memberChipUnselected: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    opacity: 0.6,
  },
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '3px',
    backgroundColor: '#0052CC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberName: {
    flex: 1,
    color: '#172B4D',
    fontWeight: 500,
  },
  memberRole: {
    color: '#6B778C',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  memberCount: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
  },
  quorumOptions: {
    display: 'flex',
    gap: '8px',
  },
  quorumButton: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
  },
  quorumButtonSelected: {
    backgroundColor: '#0052CC',
    border: '1px solid #0052CC',
    color: '#FFFFFF',
  },
  quorumHint: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#6B778C',
  },
  deadlineOptions: {
    display: 'flex',
    gap: '8px',
  },
  deadlineButton: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
  },
  deadlineButtonSelected: {
    backgroundColor: '#0052CC',
    border: '1px solid #0052CC',
    color: '#FFFFFF',
  },
  flowPreview: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  flowStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#172B4D',
  },
  flowNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  flowConnector: {
    flex: 1,
    height: '2px',
    backgroundColor: '#DFE1E6',
    margin: '0 12px',
    minWidth: '20px',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#FFFAE6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#974F0C',
    lineHeight: 1.5,
  },
  infoBox: {
    padding: '16px 20px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0747A6',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.5,
  },
};

export default Step6CalibrationOptions;
