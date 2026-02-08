import React from 'react';
import { SurveyCampaign, InvisibleWorkCategoryLevel } from '../../types/assessment';
import { calculateSurveyStats, getRecipientsByStatus } from '../../constants/mockSurveyData';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';

interface SurveyResultsProps {
  campaign: SurveyCampaign;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<InvisibleWorkCategoryLevel, { label: string; range: string; color: string }> = {
  1: { label: 'Well Captured', range: '<20%', color: '#36B37E' },
  2: { label: 'Mostly Captured', range: '20-40%', color: '#00B8D9' },
  3: { label: 'Partially Captured', range: '40-60%', color: '#FFAB00' },
  4: { label: 'Significant Gap', range: '60-80%', color: '#FF8B00' },
  5: { label: 'Major Gap', range: '>80%', color: '#DE350B' },
};

const SurveyResults: React.FC<SurveyResultsProps> = ({ campaign, onBack }) => {
  const stats = calculateSurveyStats(campaign);
  const recipientsByStatus = getRecipientsByStatus(campaign);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getResponseRateColor = (rate: number): string => {
    if (rate >= 80) return '#36B37E';
    if (rate >= 50) return '#FFAB00';
    return '#DE350B';
  };

  const maxCategoryCount = Math.max(...(Object.values(stats.categoryDistribution) as number[]));

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button style={styles.backButton} onClick={onBack}>
            <ArrowLeftIcon label="Back" primaryColor="white" />
            <span>Back to Dashboard</span>
          </button>

          <div style={styles.titleSection}>
            <h1 style={styles.title}>{campaign.name}</h1>
            <div style={styles.meta}>
              <span style={styles.metaItem}>{campaign.projectName}</span>
              <span style={styles.metaDot}>-</span>
              <span style={styles.metaItem}>
                {formatDate(campaign.periodStart)} - {formatDate(campaign.periodEnd)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Overview Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Response Rate</span>
              <div style={styles.responseRateDisplay}>
                <span
                  style={{
                    ...styles.statValue,
                    color: getResponseRateColor(stats.responseRate),
                  }}
                >
                  {Math.round(stats.responseRate)}%
                </span>
              </div>
              <span style={styles.statContext}>
                {stats.responseCount} of {stats.totalRecipients} responded
              </span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Average Response</span>
              <span style={styles.statValue}>
                {stats.averageCategory.toFixed(1)}
              </span>
              <span style={styles.statContext}>
                {CATEGORY_LABELS[Math.round(stats.averageCategory) as InvisibleWorkCategoryLevel]?.label || 'N/A'}
              </span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statLabel}>Survey Status</span>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: campaign.status === 'active' ? '#DEEBFF' : '#E3FCEF',
                  color: campaign.status === 'active' ? '#0052CC' : '#006644',
                }}
              >
                {campaign.status === 'active' ? 'Active' : 'Completed'}
              </span>
              <span style={styles.statContext}>
                {campaign.closesAt && (campaign.status === 'active'
                  ? `Closes ${formatDate(campaign.closesAt)}`
                  : `Closed ${formatDate(campaign.closesAt)}`)}
              </span>
            </div>
          </div>

          {/* Response Distribution */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Response Distribution</h3>
            <p style={styles.sectionDescription}>
              How team members rated their invisible work levels
            </p>

            <div style={styles.distributionChart}>
              {([1, 2, 3, 4, 5] as InvisibleWorkCategoryLevel[]).map((category) => {
                const count = stats.categoryDistribution[category];
                const percentage = stats.responseCount > 0 ? (count / stats.responseCount) * 100 : 0;
                const barWidth = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;

                return (
                  <div key={category} style={styles.distributionRow}>
                    <div style={styles.distributionLabel}>
                      <span style={styles.categoryLabel}>
                        {CATEGORY_LABELS[category].label}
                      </span>
                      <span style={styles.categoryRange}>
                        {CATEGORY_LABELS[category].range} invisible
                      </span>
                    </div>
                    <div style={styles.distributionBar}>
                      <div
                        style={{
                          ...styles.distributionFill,
                          width: `${barWidth}%`,
                          backgroundColor: CATEGORY_LABELS[category].color,
                        }}
                      />
                    </div>
                    <div style={styles.distributionValue}>
                      <span style={styles.countValue}>{count}</span>
                      <span style={styles.percentValue}>({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient Status */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recipient Status</h3>
            <p style={styles.sectionDescription}>
              Breakdown of survey delivery and response status
            </p>

            <div style={styles.statusGrid}>
              <div style={styles.statusCard}>
                <div style={{ ...styles.statusIcon, backgroundColor: '#E3FCEF' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="#36B37E" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={styles.statusInfo}>
                  <span style={styles.statusCount}>{recipientsByStatus.completed.length}</span>
                  <span style={styles.statusLabel}>Completed</span>
                </div>
              </div>

              <div style={styles.statusCard}>
                <div style={{ ...styles.statusIcon, backgroundColor: '#DEEBFF' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h14M3 15h14" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={styles.statusInfo}>
                  <span style={styles.statusCount}>{recipientsByStatus.sent.length}</span>
                  <span style={styles.statusLabel}>Sent (Awaiting)</span>
                </div>
              </div>

              <div style={styles.statusCard}>
                <div style={{ ...styles.statusIcon, backgroundColor: '#FFFAE6' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="6" stroke="#FFAB00" strokeWidth="2" />
                    <path d="M10 7v3l2 2" stroke="#FFAB00" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={styles.statusInfo}>
                  <span style={styles.statusCount}>{recipientsByStatus.reminded.length}</span>
                  <span style={styles.statusLabel}>Reminded</span>
                </div>
              </div>

              <div style={styles.statusCard}>
                <div style={{ ...styles.statusIcon, backgroundColor: '#F4F5F7' }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="6" stroke="#6B778C" strokeWidth="2" strokeDasharray="3 3" />
                  </svg>
                </div>
                <div style={styles.statusInfo}>
                  <span style={styles.statusCount}>{recipientsByStatus.pending.length}</span>
                  <span style={styles.statusLabel}>Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Responses (Anonymized) */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Response Timeline</h3>
            <p style={styles.sectionDescription}>
              Anonymous view of when responses were submitted
            </p>

            <div style={styles.responseList}>
              {campaign.responses
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .slice(0, 10)
                .map((response, index) => (
                  <div key={index} style={styles.responseItem}>
                    <div style={styles.responseAvatar}>
                      <span style={styles.avatarText}>#{index + 1}</span>
                    </div>
                    <div style={styles.responseContent}>
                      <span style={styles.responseCategory}>
                        <span
                          style={{
                            ...styles.categoryDot,
                            backgroundColor: CATEGORY_LABELS[response.invisibleWorkCategory].color,
                          }}
                        />
                        {CATEGORY_LABELS[response.invisibleWorkCategory].label}
                      </span>
                      <span style={styles.responseTime}>
                        {formatDate(response.submittedAt)}
                      </span>
                    </div>
                    <div style={styles.responseConfidence}>
                      <span style={styles.confidenceLabel}>Confidence:</span>
                      <div style={styles.confidenceDots}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            style={{
                              ...styles.confidenceDot,
                              backgroundColor: dot <= response.confidence ? '#0052CC' : '#DFE1E6',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {campaign.responses.length > 10 && (
              <p style={styles.moreResponses}>
                + {campaign.responses.length - 10} more responses
              </p>
            )}
          </div>

          {/* Interpretation Note */}
          <div style={styles.interpretNote}>
            <h4 style={styles.interpretTitle}>How to Interpret These Results</h4>
            <p style={styles.interpretText}>
              Team members rated what percentage of their actual work effort was NOT reflected in Jira
              during the survey period. A higher average response indicates more invisible work.
              Compare these self-reported results with the automated detection scores to calibrate
              the accuracy of the invisible work detection system.
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
  },
  titleSection: {
    marginTop: '16px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: 'white',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaItem: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  metaDot: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  main: {
    padding: '24px',
  },
  contentWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#172B4D',
    marginBottom: '4px',
  },
  responseRateDisplay: {
    display: 'flex',
    alignItems: 'baseline',
  },
  statContext: {
    fontSize: '13px',
    color: '#6B778C',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  section: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  sectionDescription: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#6B778C',
  },
  distributionChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  distributionLabel: {
    width: '160px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  categoryLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  categoryRange: {
    fontSize: '11px',
    color: '#6B778C',
  },
  distributionBar: {
    flex: 1,
    height: '24px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  distributionValue: {
    width: '80px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    justifyContent: 'flex-end',
  },
  countValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  percentValue: {
    fontSize: '12px',
    color: '#6B778C',
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '8px',
  },
  statusIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statusCount: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#172B4D',
  },
  statusLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  responseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  responseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
  },
  responseAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#DFE1E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
  },
  responseContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  responseCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
  },
  categoryDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  responseTime: {
    fontSize: '12px',
    color: '#6B778C',
  },
  responseConfidence: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  confidenceLabel: {
    fontSize: '11px',
    color: '#6B778C',
  },
  confidenceDots: {
    display: 'flex',
    gap: '4px',
  },
  confidenceDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  moreResponses: {
    margin: '12px 0 0 0',
    fontSize: '13px',
    color: '#6B778C',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  interpretNote: {
    padding: '20px',
    backgroundColor: '#DEEBFF',
    borderRadius: '8px',
    border: '1px solid #B3D4FF',
  },
  interpretTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0747A6',
  },
  interpretText: {
    margin: 0,
    fontSize: '13px',
    color: '#0747A6',
    lineHeight: 1.5,
  },
};

export default SurveyResults;
