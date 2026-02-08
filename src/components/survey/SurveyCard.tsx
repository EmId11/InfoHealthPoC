import React from 'react';
import { SurveyCampaign, SurveyCampaignStatus } from '../../types/assessment';
import { calculateSurveyStats } from '../../constants/mockSurveyData';

interface SurveyCardProps {
  campaign: SurveyCampaign;
  onViewResults: (campaign: SurveyCampaign) => void;
  onSendReminder: (campaign: SurveyCampaign) => void;
  onCloseSurvey: (campaign: SurveyCampaign) => void;
  onEdit: (campaign: SurveyCampaign) => void;
  onLaunch: (campaign: SurveyCampaign) => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({
  campaign,
  onViewResults,
  onSendReminder,
  onCloseSurvey,
  onEdit,
  onLaunch,
}) => {
  const stats = calculateSurveyStats(campaign);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: SurveyCampaignStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', style: styles.statusDraft };
      case 'active':
        return { label: 'Active', style: styles.statusActive };
      case 'completed':
        return { label: 'Completed', style: styles.statusClosed };
      case 'closed':
        return { label: 'Closed', style: styles.statusClosed };
      default:
        return { label: 'Unknown', style: styles.statusDraft };
    }
  };

  const getResponseRateColor = (rate: number): string => {
    if (rate >= 80) return '#36B37E';
    if (rate >= 50) return '#FFAB00';
    return '#DE350B';
  };

  const statusBadge = getStatusBadge(campaign.status);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.headerLeft}>
          <h3 style={styles.campaignName}>{campaign.name}</h3>
          <span style={{ ...styles.statusBadge, ...statusBadge.style }}>
            {campaign.status === 'active' && <span style={styles.activeDot} />}
            {statusBadge.label}
          </span>
        </div>
        <span style={styles.projectBadge}>{campaign.projectKey}</span>
      </div>

      <div style={styles.periodRow}>
        <span style={styles.periodLabel}>Analysis Period:</span>
        <span style={styles.periodValue}>
          {formatDate(campaign.periodStart)} - {formatDate(campaign.periodEnd)}
        </span>
      </div>

      {campaign.status !== 'draft' && (
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={styles.responseRateContainer}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${stats.responseRate}%`,
                    backgroundColor: getResponseRateColor(stats.responseRate),
                  }}
                />
              </div>
              <span style={styles.responseRateText}>
                {stats.responseCount}/{stats.totalRecipients} responses ({Math.round(stats.responseRate)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {campaign.status === 'draft' && (
        <div style={styles.draftInfo}>
          <span style={styles.draftText}>
            {campaign.selectedRoles?.length || 0} role(s) selected
          </span>
          <span style={styles.draftDot}>-</span>
          <span style={styles.draftText}>
            {campaign.notificationSettings.sendImmediately
              ? 'Sends immediately on launch'
              : `Scheduled for ${formatDate(campaign.notificationSettings.scheduledFor || '')}`}
          </span>
        </div>
      )}

      <div style={styles.actionsRow}>
        {campaign.status === 'draft' && (
          <>
            <button style={styles.secondaryButton} onClick={() => onEdit(campaign)}>
              Edit
            </button>
            <button style={styles.primaryButton} onClick={() => onLaunch(campaign)}>
              Launch Survey
            </button>
          </>
        )}

        {campaign.status === 'active' && (
          <>
            <button style={styles.primaryButton} onClick={() => onViewResults(campaign)}>
              View Results
            </button>
            <button style={styles.secondaryButton} onClick={() => onSendReminder(campaign)}>
              Send Reminder
            </button>
            <button style={styles.dangerButton} onClick={() => onCloseSurvey(campaign)}>
              Close Survey
            </button>
          </>
        )}

        {campaign.status === 'closed' && (
          <button style={styles.primaryButton} onClick={() => onViewResults(campaign)}>
            View Results
          </button>
        )}
      </div>

      {(campaign.remindersSent ?? 0) > 0 && campaign.status === 'active' && (
        <div style={styles.reminderNote}>
          {campaign.remindersSent} reminder{(campaign.remindersSent ?? 0) > 1 ? 's' : ''} sent
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  campaignName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  statusDraft: {
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
  },
  statusActive: {
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
  },
  statusClosed: {
    backgroundColor: '#E3FCEF',
    color: '#006644',
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    animation: 'pulse 2s infinite',
  },
  projectBadge: {
    padding: '4px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5E6C84',
    fontFamily: 'monospace',
  },
  periodRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  periodLabel: {
    fontSize: '13px',
    color: '#6B778C',
  },
  periodValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  statsRow: {
    marginBottom: '16px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  responseRateContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  responseRateText: {
    fontSize: '13px',
    color: '#5E6C84',
  },
  draftInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
  },
  draftText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  draftDot: {
    color: '#DFE1E6',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    color: '#172B4D',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  dangerButton: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    color: '#DE350B',
    border: '1px solid #FFEBE6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  reminderNote: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
};

export default SurveyCard;
