import React, { useState } from 'react';
import { SurveyCampaign } from '../../types/assessment';
import { MOCK_SURVEY_CAMPAIGNS } from '../../constants/mockSurveyData';
import SurveyCard from './SurveyCard';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import AddIcon from '@atlaskit/icon/glyph/add';

interface SurveyDashboardProps {
  onBack: () => void;
  onCreateSurvey: () => void;
  onViewResults: (campaign: SurveyCampaign) => void;
  onEditSurvey: (campaign: SurveyCampaign) => void;
  onTakeSurvey: (campaign: SurveyCampaign) => void;
}

type TabType = 'active' | 'completed' | 'drafts';

const SurveyDashboard: React.FC<SurveyDashboardProps> = ({
  onBack,
  onCreateSurvey,
  onViewResults,
  onEditSurvey,
  onTakeSurvey,
}) => {
  const [campaigns, setCampaigns] = useState<SurveyCampaign[]>(MOCK_SURVEY_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const completedCampaigns = campaigns.filter((c) => c.status === 'closed');
  const draftCampaigns = campaigns.filter((c) => c.status === 'draft');

  const getTabCampaigns = (): SurveyCampaign[] => {
    switch (activeTab) {
      case 'active':
        return activeCampaigns;
      case 'completed':
        return completedCampaigns;
      case 'drafts':
        return draftCampaigns;
    }
  };

  const handleSendReminder = (campaign: SurveyCampaign) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? { ...c, remindersSent: (c.remindersSent ?? 0) + 1 }
          : c
      )
    );
    alert(`Reminder sent to ${campaign.recipients.filter((r) => r.status !== 'completed').length} recipients`);
  };

  const handleCloseSurvey = (campaign: SurveyCampaign) => {
    if (window.confirm('Are you sure you want to close this survey? No more responses will be accepted.')) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id ? { ...c, status: 'closed' } : c
        )
      );
    }
  };

  const handleLaunch = (campaign: SurveyCampaign) => {
    if (window.confirm('Launch this survey? Invitations will be sent to all selected recipients.')) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaign.id
            ? {
                ...c,
                status: 'active',
                recipients: c.recipients.map((r) => ({
                  ...r,
                  status: 'sent',
                  sentAt: new Date().toISOString(),
                })),
              }
            : c
        )
      );
      setActiveTab('active');
    }
  };

  const tabCounts = {
    active: activeCampaigns.length,
    completed: completedCampaigns.length,
    drafts: draftCampaigns.length,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={onBack}>
            <ArrowLeftIcon label="Back" primaryColor="white" />
            <span>Back</span>
          </button>

          <div style={styles.titleSection}>
            <h1 style={styles.title}>Calibration Surveys</h1>
            <p style={styles.subtitle}>
              Collect team-wide feedback to improve invisible work detection accuracy
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Action Bar */}
          <div style={styles.actionBar}>
            <div style={styles.tabs}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'active' ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab('active')}
              >
                Active
                {tabCounts.active > 0 && (
                  <span style={styles.tabCount}>{tabCounts.active}</span>
                )}
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'completed' ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab('completed')}
              >
                Completed
                {tabCounts.completed > 0 && (
                  <span style={styles.tabCountMuted}>{tabCounts.completed}</span>
                )}
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'drafts' ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab('drafts')}
              >
                Drafts
                {tabCounts.drafts > 0 && (
                  <span style={styles.tabCountMuted}>{tabCounts.drafts}</span>
                )}
              </button>
            </div>

            <button style={styles.createButton} onClick={onCreateSurvey}>
              <AddIcon label="" size="small" />
              <span>New Survey</span>
            </button>
          </div>

          {/* Survey List */}
          <div style={styles.surveyList}>
            {getTabCampaigns().length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="8" width="32" height="32" rx="4" stroke="#DFE1E6" strokeWidth="2" fill="none" />
                    <path d="M16 20h16M16 28h10" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 style={styles.emptyTitle}>
                  {activeTab === 'active' && 'No active surveys'}
                  {activeTab === 'completed' && 'No completed surveys'}
                  {activeTab === 'drafts' && 'No draft surveys'}
                </h3>
                <p style={styles.emptyText}>
                  {activeTab === 'active' && 'Create a new survey to start collecting team feedback.'}
                  {activeTab === 'completed' && 'Completed surveys will appear here.'}
                  {activeTab === 'drafts' && 'Draft surveys you\'re still setting up will appear here.'}
                </p>
                {activeTab !== 'completed' && (
                  <button style={styles.emptyButton} onClick={onCreateSurvey}>
                    Create Survey
                  </button>
                )}
              </div>
            ) : (
              getTabCampaigns().map((campaign) => (
                <SurveyCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewResults={onViewResults}
                  onSendReminder={handleSendReminder}
                  onCloseSurvey={handleCloseSurvey}
                  onEdit={onEditSurvey}
                  onLaunch={handleLaunch}
                />
              ))
            )}
          </div>

          {/* Demo Note */}
          <div style={styles.demoNote}>
            <p style={styles.demoText}>
              <strong>Demo Mode:</strong> Click "View Results" on any survey to see aggregated response data,
              or use "New Survey" to explore the survey creation flow.
            </p>
          </div>

          {/* Preview Survey Experience Link */}
          {activeCampaigns.length > 0 && (
            <div style={styles.previewSection}>
              <div style={styles.previewCard}>
                <div style={styles.previewContent}>
                  <h4 style={styles.previewTitle}>Preview Survey Experience</h4>
                  <p style={styles.previewText}>
                    See what team members experience when they receive a survey invitation.
                  </p>
                </div>
                <button
                  style={styles.previewButton}
                  onClick={() => onTakeSurvey(activeCampaigns[0])}
                >
                  Take Survey as Team Member
                </button>
              </div>
            </div>
          )}
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
    maxWidth: '1000px',
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
    transition: 'background-color 0.2s ease',
  },
  titleSection: {
    marginTop: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: 'white',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  main: {
    padding: '24px',
  },
  contentWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#FFFFFF',
    padding: '4px',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
  },
  tabCount: {
    padding: '2px 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
  },
  tabCountMuted: {
    padding: '2px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  surveyList: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#6B778C',
    maxWidth: '300px',
  },
  emptyButton: {
    padding: '10px 20px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  demoNote: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '8px',
  },
  demoText: {
    margin: 0,
    fontSize: '13px',
    color: '#974F0C',
    lineHeight: 1.5,
  },
  previewSection: {
    marginTop: '24px',
  },
  previewCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  previewText: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  previewButton: {
    padding: '10px 16px',
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    border: '1px solid #0052CC',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    marginLeft: '16px',
  },
};

export default SurveyDashboard;
