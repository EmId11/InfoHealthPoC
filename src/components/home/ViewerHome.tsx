import React, { useState } from 'react';
import { SavedAssessment, AppUser } from '../../types/home';
import { AccessRequest } from '../../types/admin';
import { PersonaSwitcher } from '../persona';

interface ViewerHomeProps {
  currentUser: AppUser;
  sharedWithMe: SavedAssessment[];
  onViewAssessment: (assessment: SavedAssessment) => void;
  pendingAccessRequest: AccessRequest | null;
  onRequestCreatorAccess: (reason: string) => void;
}

const ViewerHome: React.FC<ViewerHomeProps> = ({
  currentUser,
  sharedWithMe,
  onViewAssessment,
  pendingAccessRequest,
  onRequestCreatorAccess,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [starredAssessments, setStarredAssessments] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('viewer-starred-assessments');
    return saved ? JSON.parse(saved) : {};
  });
  const [customOrder, setCustomOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewer-assessment-order');
    return saved ? JSON.parse(saved) : [];
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Calculate stats
  const uniqueTeams = new Set(sharedWithMe.map(a => a.teamId)).size;
  const uniqueSharers = new Set(sharedWithMe.map(a => a.createdByUserId)).size;

  // Save starred assessments to localStorage
  const toggleStar = (assessmentId: string) => {
    setStarredAssessments(prev => {
      const newStarred = { ...prev };
      if (newStarred[assessmentId]) {
        delete newStarred[assessmentId];
      } else {
        newStarred[assessmentId] = Date.now();
      }
      localStorage.setItem('viewer-starred-assessments', JSON.stringify(newStarred));
      return newStarred;
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, assessmentId: string) => {
    setDraggedId(assessmentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', assessmentId);
  };

  const handleDragOver = (e: React.DragEvent, assessmentId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (assessmentId !== draggedId) {
      setDragOverId(assessmentId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const assessments = getSortedAssessments();
    const currentIds = assessments.map(a => a.id);

    const draggedIndex = currentIds.indexOf(draggedId);
    const targetIndex = currentIds.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrderIds = [...currentIds];
    newOrderIds.splice(draggedIndex, 1);
    newOrderIds.splice(targetIndex, 0, draggedId);

    setCustomOrder(newOrderIds);
    localStorage.setItem('viewer-assessment-order', JSON.stringify(newOrderIds));

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Sort assessments: starred first, then by custom order or creation date
  const getSortedAssessments = () => {
    return [...sharedWithMe].sort((a, b) => {
      const aStarred = starredAssessments[a.id];
      const bStarred = starredAssessments[b.id];

      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;

      if (aStarred && bStarred) {
        return bStarred - aStarred;
      }

      if (customOrder.length > 0) {
        const aIndex = customOrder.indexOf(a.id);
        const bIndex = customOrder.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = (name: string) => name.split(' ')[0];

  const getShareInfo = (assessment: SavedAssessment) => {
    const share = assessment.shares.find(s => s.sharedWithUserId === currentUser.id);
    return {
      permission: share?.permission || 'read-only',
      sharedBy: assessment.createdByUserName,
    };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoContainer}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGradientViewerHome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#logoGradientViewerHome)" />
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.95" />
                <circle cx="20" cy="22" r="3" fill="rgba(0,137,123,0.8)" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <span style={styles.titleSmall}>Jira Health Check</span>
              <h1 style={styles.title}>Team Health Assessment</h1>
            </div>
          </div>
          <div style={styles.headerActions}>
            <PersonaSwitcher />
            {/* Viewer badge with request access option */}
            <div style={styles.viewerBadgeContainer}>
              <span style={styles.viewerBadge}>Viewer</span>
              {pendingAccessRequest ? (
                <span style={styles.requestPendingBadge}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pending
                </span>
              ) : (
                <button
                  style={styles.requestAccessButton}
                  onClick={() => setShowRequestModal(true)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Request Creator
                </button>
              )}
            </div>
            <div style={styles.userPill}>
              <div style={styles.userAvatar}>
                {getInitials(currentUser.displayName)}
              </div>
              <span style={styles.userName}>{getFirstName(currentUser.displayName)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.heroLeft}>
            <h2 style={styles.greeting}>
              {getGreeting()}, {getFirstName(currentUser.displayName)}
            </h2>
            <p style={styles.heroSubtitle}>
              View health assessments shared with you and explore insights to help improve your team's practices.
            </p>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="6" height="6" rx="1" stroke="white" strokeWidth="2"/>
                  <rect x="11" y="3" width="6" height="6" rx="1" stroke="white" strokeWidth="2"/>
                  <rect x="3" y="11" width="6" height="6" rx="1" stroke="white" strokeWidth="2"/>
                  <rect x="11" y="11" width="6" height="6" rx="1" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{sharedWithMe.length}</span>
                <span style={styles.statLabel}>Assessments</span>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="8" r="4" stroke="white" strokeWidth="2"/>
                  <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{uniqueTeams}</span>
                <span style={styles.statLabel}>Teams</span>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14 17v-1.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="8.5" cy="6" r="3" stroke="white" strokeWidth="2"/>
                  <path d="M17 17v-1.5a3 3 0 0 0-2-2.83M13 3.17a3 3 0 0 1 0 5.66" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{uniqueSharers}</span>
                <span style={styles.statLabel}>Shared by</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Shared Assessments Section */}
        <div style={styles.contentWrapper}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '8px' }}>
                <path d="M14 17v-1.5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M17 17v-1.5a3 3 0 0 0-2-2.83M13 3.17a3 3 0 0 1 0 5.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Shared With Me
              {sharedWithMe.length > 0 && (
                <span style={styles.countBadge}>{sharedWithMe.length}</span>
              )}
            </h3>
          </div>

          {sharedWithMe.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIllustration}>
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" fill="#F4F5F7"/>
                  <circle cx="45" cy="50" r="12" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                  <circle cx="75" cy="50" r="12" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                  <circle cx="60" cy="80" r="12" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                  <path d="M53 55l-5 17M67 55l5 17" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 style={styles.emptyTitle}>No shared assessments yet</h3>
              <p style={styles.emptyText}>
                When someone shares an assessment with you, it will appear here. Ask a team lead to share their assessment results.
              </p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={{ ...styles.tableHeader, width: '5%' }}></th>
                    <th style={{ ...styles.tableHeader, width: '25%' }}>Assessment</th>
                    <th style={{ ...styles.tableHeader, width: '16%' }}>Shared By</th>
                    <th style={{ ...styles.tableHeader, width: '10%' }}>Permission</th>
                    <th style={{ ...styles.tableHeader, width: '14%' }}>Created</th>
                    <th style={{ ...styles.tableHeader, width: '14%' }}>Last Refreshed</th>
                    <th style={{ ...styles.tableHeader, width: '16%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedAssessments().map(assessment => {
                    const { sharedBy } = getShareInfo(assessment);
                    const isHovered = hoveredRow === assessment.id;
                    const isStarred = !!starredAssessments[assessment.id];
                    const isDragging = draggedId === assessment.id;
                    const isDragOver = dragOverId === assessment.id;
                    return (
                      <tr
                        key={assessment.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, assessment.id)}
                        onDragOver={(e) => handleDragOver(e, assessment.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, assessment.id)}
                        onDragEnd={handleDragEnd}
                        style={{
                          ...styles.tableRow,
                          ...(isHovered ? styles.tableRowHovered : {}),
                          ...(isStarred ? styles.tableRowStarred : {}),
                          ...(isDragging ? styles.tableRowDragging : {}),
                          ...(isDragOver ? styles.tableRowDragOver : {}),
                        }}
                        onMouseEnter={() => setHoveredRow(assessment.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {/* Drag handle + Star button */}
                        <td style={styles.tableCell}>
                          <div style={styles.dragStarCell}>
                            <div style={styles.dragHandle} title="Drag to reorder">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M4 3h1M4 6h1M4 9h1M7 3h1M7 6h1M7 9h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <button
                              style={{
                                ...styles.starButton,
                                ...(isStarred ? styles.starButtonActive : {}),
                              }}
                              onClick={() => toggleStar(assessment.id)}
                              title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill={isStarred ? 'currentColor' : 'none'}>
                                <path d="M8 1.5l2 4.5 5 .5-3.75 3.5 1 5-4.25-2.5-4.25 2.5 1-5L1 6.5l5-.5 2-4.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.assessmentInfo}>
                            <div style={styles.assessmentAccent} />
                            <div>
                              <div style={styles.assessmentName}>{assessment.name}</div>
                              <div style={styles.assessmentTeam}>{assessment.teamName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.sharedByCell}>
                            <div style={styles.sharedByAvatar}>
                              {getInitials(sharedBy)}
                            </div>
                            <span style={styles.sharedByName}>{sharedBy}</span>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.permissionBadge}>
                            View only
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.dateText}>
                            {new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.dateText}>
                            {new Date(assessment.lastRefreshed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            style={styles.viewButton}
                            onClick={() => onViewAssessment(assessment)}
                          >
                            View
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '4px' }}>
                              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Request Creator Access Modal */}
      {showRequestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRequestModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Request Creator Access</h3>
              <button
                style={styles.modalCloseButton}
                onClick={() => setShowRequestModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Creator access allows you to create your own assessments and run the configuration wizard.
                Please provide a reason for your request.
              </p>
              <label style={styles.inputLabel}>Reason for request</label>
              <textarea
                style={styles.textarea}
                placeholder="e.g., I need to create assessments for my team as part of our quarterly health checks..."
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                rows={4}
              />
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowRequestModal(false);
                  setRequestReason('');
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.submitButton,
                  ...(requestReason.trim().length < 10 ? styles.submitButtonDisabled : {}),
                }}
                onClick={() => {
                  if (requestReason.trim().length >= 10) {
                    onRequestCreatorAccess(requestReason.trim());
                    setShowRequestModal(false);
                    setRequestReason('');
                  }
                }}
                disabled={requestReason.trim().length < 10}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
  },
  header: {
    background: 'linear-gradient(135deg, #00695C 0%, #00897B 50%, #26A69A 100%)',
    padding: '14px 32px',
    boxShadow: '0 2px 8px rgba(0, 137, 123, 0.15)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleSmall: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  viewerBadgeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 4px 4px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  viewerBadge: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  requestAccessButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '14px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  requestPendingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    backgroundColor: '#FF8B00',
    borderRadius: '14px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#00897B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
  },
  userName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  heroSection: {
    background: 'linear-gradient(180deg, #00897B 0%, #00695C 100%)',
    padding: '32px 32px 48px',
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '40px',
  },
  heroLeft: {
    flex: '0 0 auto',
  },
  greeting: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    margin: 0,
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '400px',
    lineHeight: 1.5,
  },
  statsGrid: {
    display: 'flex',
    gap: '16px',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '16px 20px',
    minWidth: '120px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  statCardUrgent: {
    backgroundColor: '#FF8B00',
    borderRadius: '12px',
    padding: '16px 20px',
    minWidth: '120px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  statIconWrapperUrgent: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  statValueUrgent: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1,
  },
  statLabelUrgent: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  main: {
    padding: '24px 32px 32px',
    marginTop: '-24px',
  },
  surveySection: {
    backgroundColor: '#FFFAE6',
    border: '1px solid #FFE380',
    borderRadius: '12px',
    marginBottom: '20px',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
  },
  surveyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  surveyHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  surveyIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#FF8B00',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surveyHeaderText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  surveyTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  surveySubtitle: {
    fontSize: '13px',
    color: '#6B778C',
  },
  surveyHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0052CC',
  },
  expandText: {
    fontSize: '13px',
    fontWeight: 600,
  },
  surveyList: {
    borderTop: '1px solid #FFE380',
    padding: '8px 12px 12px',
  },
  surveyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    marginTop: '8px',
    border: '1px solid #F0F0F0',
  },
  surveyItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  surveyItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surveyItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  surveyItemName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  surveyItemMeta: {
    fontSize: '12px',
    color: '#6B778C',
  },
  takeSurveyButton: {
    padding: '8px 16px',
    backgroundColor: '#FF8B00',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08), 0 8px 24px rgba(9, 30, 66, 0.08)',
  },
  sectionHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  sectionTitle: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
  },
  countBadge: {
    marginLeft: '10px',
    padding: '2px 10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#6B778C',
  },
  assessmentsList: {
    padding: '16px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    textAlign: 'center',
  },
  emptyIllustration: {
    marginBottom: '24px',
  },
  emptyTitle: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emptyText: {
    margin: 0,
    fontSize: '15px',
    color: '#6B778C',
    maxWidth: '360px',
    lineHeight: 1.5,
  },
  tableContainer: {
    padding: '20px 0 0 0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #EBECF0',
  },
  tableHeader: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: '1px solid #F4F5F7',
    transition: 'background-color 0.15s ease',
    cursor: 'default',
  },
  tableRowHovered: {
    backgroundColor: '#FAFBFC',
  },
  tableRowStarred: {
    backgroundColor: '#FFFAE6',
  },
  tableRowDragging: {
    opacity: 0.5,
    backgroundColor: '#E6F7F5',
  },
  tableRowDragOver: {
    borderTop: '2px solid #00897B',
  },
  tableCell: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  dragStarCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dragHandle: {
    width: '20px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#C1C7D0',
    cursor: 'grab',
    borderRadius: '3px',
  },
  starButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#C1C7D0',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'color 0.15s ease',
  },
  starButtonActive: {
    color: '#FFAB00',
  },
  assessmentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  assessmentAccent: {
    width: '4px',
    height: '40px',
    backgroundColor: '#00897B',
    borderRadius: '2px',
    flexShrink: 0,
  },
  assessmentName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '2px',
  },
  assessmentTeam: {
    fontSize: '12px',
    color: '#6B778C',
  },
  sharedByCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sharedByAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#DFE1E6',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
  },
  sharedByName: {
    fontSize: '13px',
    color: '#172B4D',
  },
  permissionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    whiteSpace: 'nowrap',
  },
  dateText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#00897B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '480px',
    maxWidth: '90vw',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  modalCloseButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#6B778C',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  modalDescription: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#5E6C84',
    lineHeight: 1.5,
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #DFE1E6',
    borderRadius: '6px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
    borderRadius: '0 0 12px 12px',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#00897B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    backgroundColor: '#DFE1E6',
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
};

export default ViewerHome;
