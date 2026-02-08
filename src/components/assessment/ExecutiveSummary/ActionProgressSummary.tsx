import React, { useState } from 'react';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import EditorInfoIcon from '@atlaskit/icon/glyph/editor/info';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import { ActionPlanTag, ActionPlanZoneTag } from '../../../types/actionPlan';

// Breakdown by priority zone
export interface PriorityBreakdown {
  fixNow: number;
  urgent: number;
  other: number;
}

export interface ActionProgressData {
  totalActions: number;
  completedActions: number;
  inProgressActions: number;
  pendingActions: number;
  // Breakdown by priority
  completedBreakdown: PriorityBreakdown;
  inProgressBreakdown: PriorityBreakdown;
  pendingBreakdown: PriorityBreakdown;
  // Impact metrics
  scoreChangeOverall: number;        // Points change since actions started
  dimensionsImproved: number;        // Number of dimensions that improved
  dimensionsDeclined: number;        // Number of dimensions that declined
  indicatorsFixed: number;           // Indicators that moved from flagged to healthy
  // Time tracking
  daysSinceFirstAction: number;      // Days since first action was started
  avgDaysToComplete: number;         // Average days to complete an action
  lastCompletedDate: string | null;  // Date when last action was completed
  // Quick wins
  quickWinsAvailable: number;        // High impact, low effort actions remaining
  quickWinsCompleted: number;        // Quick wins already done
}

interface ActionProgressSummaryProps {
  data: ActionProgressData;
  onNavigateToActionPlan: (tag: ActionPlanTag | ActionPlanZoneTag) => void;
}

const ActionProgressSummary: React.FC<ActionProgressSummaryProps> = ({ data, onNavigateToActionPlan }) => {
  const [showImpactInfo, setShowImpactInfo] = useState(false);

  const completionPercent = data.totalActions > 0
    ? Math.round((data.completedActions / data.totalActions) * 100)
    : 0;

  const inProgressPercent = data.totalActions > 0
    ? Math.round((data.inProgressActions / data.totalActions) * 100)
    : 0;

  return (
    <div style={styles.container}>
      {/* Progress Overview */}
      <div style={styles.progressSection}>
        <h4 style={styles.sectionTitle}>Action Plan Progress</h4>

        {/* Progress Bar */}
        <div style={styles.progressBarContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFillDone,
                width: `${completionPercent}%`
              }}
            />
            <div
              style={{
                ...styles.progressFillInProgress,
                width: `${inProgressPercent}%`,
                left: `${completionPercent}%`,
              }}
            />
          </div>
          <div style={styles.progressLabels}>
            <span style={styles.progressPercent}>{completionPercent}% complete</span>
          </div>
        </div>

        {/* Status Counts with Breakdown */}
        <div style={styles.statusGrid}>
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={{ ...styles.statusDot, backgroundColor: '#36B37E' }} />
              <span style={styles.statusCount}>{data.completedActions}</span>
              <span style={styles.statusLabel}>Done</span>
            </div>
            {data.completedActions > 0 && (
              <div style={styles.breakdown}>
                {data.completedBreakdown.fixNow > 0 && (
                  <span style={styles.breakdownItem}>
                    <span style={styles.breakdownDot} />
                    {data.completedBreakdown.fixNow} fix now
                  </span>
                )}
                {data.completedBreakdown.urgent > 0 && (
                  <span style={styles.breakdownItem}>
                    <span style={styles.breakdownDot} />
                    {data.completedBreakdown.urgent} urgent
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={{ ...styles.statusDot, backgroundColor: '#0052CC' }} />
              <span style={styles.statusCount}>{data.inProgressActions}</span>
              <span style={styles.statusLabel}>In Progress</span>
            </div>
            {data.inProgressActions > 0 && (
              <div style={styles.breakdown}>
                {data.inProgressBreakdown.fixNow > 0 && (
                  <span style={styles.breakdownItem}>
                    <span style={styles.breakdownDot} />
                    {data.inProgressBreakdown.fixNow} fix now
                  </span>
                )}
                {data.inProgressBreakdown.urgent > 0 && (
                  <span style={styles.breakdownItem}>
                    <span style={styles.breakdownDot} />
                    {data.inProgressBreakdown.urgent} urgent
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={{ ...styles.statusDot, backgroundColor: '#DFE1E6' }} />
              <span style={styles.statusCount}>{data.pendingActions}</span>
              <span style={styles.statusLabel}>Pending</span>
            </div>
            {data.pendingActions > 0 && (
              <div style={styles.breakdown}>
                {data.pendingBreakdown.fixNow > 0 && (
                  <span style={{ ...styles.breakdownItem, color: '#DE350B' }}>
                    <span style={{ ...styles.breakdownDot, backgroundColor: '#DE350B' }} />
                    {data.pendingBreakdown.fixNow} fix now
                  </span>
                )}
                {data.pendingBreakdown.urgent > 0 && (
                  <span style={{ ...styles.breakdownItem, color: '#DE350B' }}>
                    <span style={{ ...styles.breakdownDot, backgroundColor: '#DE350B' }} />
                    {data.pendingBreakdown.urgent} urgent
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Impact Section */}
      <div style={styles.impactSection}>
        <div style={styles.impactHeader}>
          <h4 style={styles.sectionTitle}>Impact So Far</h4>
          <button
            style={styles.infoBtn}
            onClick={() => setShowImpactInfo(!showImpactInfo)}
            onMouseEnter={() => setShowImpactInfo(true)}
            onMouseLeave={() => setShowImpactInfo(false)}
          >
            <EditorInfoIcon label="" size="small" primaryColor="#6B778C" />
          </button>
          {showImpactInfo && (
            <div style={styles.infoTooltip}>
              Impact is measured by comparing current scores to when actions were first started.
            </div>
          )}
        </div>

        <div style={styles.impactGrid}>
          {/* Dimensions Improved */}
          <div style={styles.impactCard}>
            <div style={styles.impactValue}>
              <span style={{ ...styles.impactNumber, color: '#36B37E' }}>
                {data.dimensionsImproved}
              </span>
              <span style={styles.impactSuffix}>
                / {data.dimensionsImproved + data.dimensionsDeclined + (11 - data.dimensionsImproved - data.dimensionsDeclined)}
              </span>
            </div>
            <span style={styles.impactLabel}>Dimensions improved</span>
          </div>

          {/* Indicators Fixed */}
          <div style={styles.impactCard}>
            <div style={styles.impactValue}>
              <CheckCircleIcon label="" size="medium" primaryColor="#36B37E" />
              <span style={{ ...styles.impactNumber, color: '#172B4D' }}>
                {data.indicatorsFixed}
              </span>
            </div>
            <span style={styles.impactLabel}>Indicators fixed</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Last Activity */}
      <div style={styles.quickStatsSection}>
        <div style={styles.quickStatRow}>
          <span style={styles.quickStatLabel}>Last action completed</span>
          <span style={styles.quickStatValue}>
            {data.lastCompletedDate || '—'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Action Plan Link */}
      <div style={styles.actionPlanLink}>
        <button
          style={styles.viewPlanBtn}
          onClick={() => onNavigateToActionPlan('must-do')}
        >
          View full action plan
          <ChevronRightIcon label="" size="small" primaryColor="#FFFFFF" />
        </button>
        <p style={styles.planHint}>
          You can reorder, add, or remove actions to fit your team's needs.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Progress Section
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '12px',
    fontWeight: 600,
    color: '#0052CC',
    cursor: 'pointer',
  },

  // Progress Bar
  progressBarContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  progressBar: {
    position: 'relative',
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFillDone: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#36B37E',
    borderRadius: '4px 0 0 4px',
    transition: 'width 0.3s ease',
  },
  progressFillInProgress: {
    position: 'absolute',
    top: 0,
    height: '100%',
    backgroundColor: '#0052CC',
    transition: 'width 0.3s ease, left 0.3s ease',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  progressPercent: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#36B37E',
  },

  // Status Grid
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statusCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusCount: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statusLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingLeft: '14px',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#6B778C',
  },
  breakdownDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#97A0AF',
  },

  // Divider
  divider: {
    height: '1px',
    backgroundColor: '#E4E6EB',
  },

  // Impact Section
  impactSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  impactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
  },
  infoBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    opacity: 0.6,
  },
  infoTooltip: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    padding: '8px 12px',
    backgroundColor: '#172B4D',
    color: '#FFFFFF',
    fontSize: '12px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.25)',
    zIndex: 10,
    maxWidth: '280px',
    lineHeight: 1.4,
  },

  // Impact Grid
  impactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  impactCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#F7F8F9',
    borderRadius: '8px',
  },
  impactValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  impactNumber: {
    fontSize: '20px',
    fontWeight: 700,
  },
  impactSuffix: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
  },
  impactLabel: {
    fontSize: '11px',
    color: '#6B778C',
    textAlign: 'center',
  },

  // Quick Stats
  quickStatsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quickStatRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickStatLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '13px',
    color: '#6B778C',
  },
  quickWinHint: {
    fontSize: '10px',
    color: '#97A0AF',
    fontStyle: 'italic',
  },
  quickStatValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  quickWinBadge: {
    padding: '2px 8px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
  },
  quickStatNote: {
    fontSize: '12px',
    fontWeight: 400,
    color: '#6B778C',
  },

  // Action Plan Link
  actionPlanLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
  },
  viewPlanBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  planHint: {
    margin: 0,
    fontSize: '11px',
    color: '#5E6C84',
    textAlign: 'center',
  },
};

export default ActionProgressSummary;
