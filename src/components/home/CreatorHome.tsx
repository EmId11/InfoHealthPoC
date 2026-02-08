import React, { useState } from 'react';
import { SavedAssessment, AppUser, getStatusLabel, SavedMultiTeamAssessment } from '../../types/home';
import { PersonaSwitcher } from '../persona';

interface CreatorHomeProps {
  currentUser: AppUser;
  myAssessments: SavedAssessment[];
  sharedWithMe: SavedAssessment[];
  myMultiTeamAssessments?: SavedMultiTeamAssessment[];
  activeTab: 'my' | 'shared' | 'portfolio';
  onTabChange: (tab: 'my' | 'shared' | 'portfolio') => void;
  onCreateAssessment: () => void;
  onCreateMultiTeamAssessment?: () => void;
  onViewAssessment: (assessment: SavedAssessment) => void;
  onViewMultiTeamAssessment?: (assessment: SavedMultiTeamAssessment) => void;
  onEditAssessment: (assessment: SavedAssessment) => void;
  onShareAssessment: (assessment: SavedAssessment) => void;
  onDeleteAssessment: (assessment: SavedAssessment) => void;
  onDuplicateAssessment: (assessment: SavedAssessment) => void;
  onRenameAssessment: (assessment: SavedAssessment) => void;
  onViewSettings?: () => void;
}

const CreatorHome: React.FC<CreatorHomeProps> = ({
  currentUser,
  myAssessments,
  sharedWithMe,
  myMultiTeamAssessments = [],
  activeTab,
  onTabChange,
  onCreateAssessment,
  onCreateMultiTeamAssessment,
  onViewAssessment,
  onViewMultiTeamAssessment,
  onEditAssessment,
  onShareAssessment,
  onDeleteAssessment,
  onDuplicateAssessment,
  onRenameAssessment,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredAssessments, setStarredAssessments] = useState<Record<string, number>>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('starred-assessments');
    return saved ? JSON.parse(saved) : {};
  });
  const [customOrder, setCustomOrder] = useState<Record<string, string[]>>(() => {
    // Load from localStorage - keyed by 'my' or 'shared'
    const saved = localStorage.getItem('assessment-order');
    return saved ? JSON.parse(saved) : { my: [], shared: [] };
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Save starred assessments to localStorage
  const toggleStar = (assessmentId: string) => {
    setStarredAssessments(prev => {
      const newStarred = { ...prev };
      if (newStarred[assessmentId]) {
        delete newStarred[assessmentId];
      } else {
        newStarred[assessmentId] = Date.now();
      }
      localStorage.setItem('starred-assessments', JSON.stringify(newStarred));
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

  const handleDrop = (e: React.DragEvent, targetId: string, list: 'my' | 'shared') => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const assessments = list === 'my' ? getSortedAssessments(myAssessments) : getSortedAssessments(sharedWithMe);
    const currentIds = assessments.map(a => a.id);

    const draggedIndex = currentIds.indexOf(draggedId);
    const targetIndex = currentIds.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at new position
    const newOrderIds = [...currentIds];
    newOrderIds.splice(draggedIndex, 1);
    newOrderIds.splice(targetIndex, 0, draggedId);

    setCustomOrder(prev => {
      const newOrder = { ...prev, [list]: newOrderIds };
      localStorage.setItem('assessment-order', JSON.stringify(newOrder));
      return newOrder;
    });

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Sort assessments: starred first (by star time desc), then by custom order or creation date
  const getSortedAssessments = (assessments: SavedAssessment[]) => {
    const listKey = assessments === myAssessments ? 'my' : 'shared';
    const order = customOrder[listKey];

    return [...assessments].sort((a, b) => {
      const aStarred = starredAssessments[a.id];
      const bStarred = starredAssessments[b.id];

      // Starred items come first
      if (aStarred && !bStarred) return -1;
      if (!aStarred && bStarred) return 1;

      // Both starred: sort by star time (most recent first)
      if (aStarred && bStarred) {
        return bStarred - aStarred;
      }

      // Both not starred: use custom order if available
      if (order.length > 0) {
        const aIndex = order.indexOf(a.id);
        const bIndex = order.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
      }

      // Default: sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Filter assessments by search query
  const filterAssessments = (assessments: SavedAssessment[]) => {
    if (!searchQuery.trim()) return assessments;
    const query = searchQuery.toLowerCase();
    return assessments.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.teamName.toLowerCase().includes(query)
    );
  };

  // Get filtered and sorted assessments
  const getDisplayAssessments = (assessments: SavedAssessment[]) => {
    return getSortedAssessments(filterAssessments(assessments));
  };

  // Calculate stats
  const completedCount = myAssessments.filter(a => a.status === 'completed').length;
  const draftCount = myAssessments.filter(a => a.status === 'draft').length;

  const getShareInfo = (assessment: SavedAssessment) => {
    const share = assessment.shares.find(s => s.sharedWithUserId === currentUser.id);
    return {
      permission: share?.permission || 'read-only',
      sharedBy: assessment.createdByUserName,
    };
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleMenuAction = (action: () => void) => {
    setOpenMenuId(null);
    action();
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
                  <linearGradient id="logoGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#logoGradientHome)" />
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.95" />
                <circle cx="20" cy="22" r="3" fill="rgba(0,82,204,0.8)" />
              </svg>
            </div>
            <div style={styles.titleSection}>
              <span style={styles.titleSmall}>Jira Health Check</span>
              <h1 style={styles.title}>Team Health Assessment</h1>
            </div>
          </div>
          <div style={styles.headerActions}>
            <PersonaSwitcher />
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
              Run health assessments to uncover improvement opportunities and track your team's progress over time.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.heroButton} onClick={onCreateAssessment}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                New Assessment
              </button>
              {onCreateMultiTeamAssessment && (
                <button style={styles.heroButtonSecondary} onClick={onCreateMultiTeamAssessment}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M14 4v12M6 4v12M4 8h12M4 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Portfolio Assessment
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 10l2.5 2.5 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{completedCount}</span>
                <span style={styles.statLabel}>Completed</span>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5v5l3.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{draftCount}</span>
                <span style={styles.statLabel}>In Progress</span>
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
                <span style={styles.statValue}>{sharedWithMe.length}</span>
                <span style={styles.statLabel}>Shared with me</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <div style={styles.tabs}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'my' ? styles.tabActive : {}),
                }}
                onClick={() => onTabChange('my')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '8px' }}>
                  <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 9h8M5 6h5M5 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                My Assessments
                {myAssessments.length > 0 && (
                  <span style={styles.tabBadge}>{myAssessments.length}</span>
                )}
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'shared' ? styles.tabActive : {}),
                }}
                onClick={() => onTabChange('shared')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '8px' }}>
                  <path d="M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8.5 8.5l1-1M8.5 9.5l1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Shared With Me
                {sharedWithMe.length > 0 && (
                  <span style={styles.tabBadge}>{sharedWithMe.length}</span>
                )}
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'portfolio' ? styles.tabActive : {}),
                }}
                onClick={() => onTabChange('portfolio')}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginRight: '8px' }}>
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="11" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="2" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="11" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                Portfolios
                {myMultiTeamAssessments.length > 0 && (
                  <span style={styles.tabBadge}>{myMultiTeamAssessments.length}</span>
                )}
              </button>
            </div>

            <div style={styles.tabsRight}>
              {/* Search Input */}
              <div style={styles.searchContainer}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.searchIcon}>
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    style={styles.clearSearchButton}
                    onClick={() => setSearchQuery('')}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {activeTab === 'my' && myAssessments.length > 0 && (
                <button style={styles.createButtonSmall} onClick={onCreateAssessment}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  New Assessment
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'my' ? (
            myAssessments.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#F4F5F7"/>
                    <rect x="35" y="30" width="50" height="60" rx="4" fill="white" stroke="#DFE1E6" strokeWidth="2"/>
                    <path d="M45 45h30M45 55h20M45 65h25" stroke="#DFE1E6" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="85" cy="75" r="18" fill="#0052CC"/>
                    <path d="M85 68v14M78 75h14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 style={styles.emptyTitle}>Create your first assessment</h3>
                <p style={styles.emptyText}>
                  Run your first health assessment to identify improvement opportunities and benchmark your team's practices.
                </p>
                <button style={styles.emptyButton} onClick={onCreateAssessment}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Create Assessment
                </button>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.tableHeader, width: '4%' }}></th>
                      <th style={{ ...styles.tableHeader, width: '31%' }}>Assessment</th>
                      <th style={{ ...styles.tableHeader, width: '10%' }}>Status</th>
                      <th style={{ ...styles.tableHeader, width: '14%' }}>Created</th>
                      <th style={{ ...styles.tableHeader, width: '14%' }}>Last Refreshed</th>
                      <th style={{ ...styles.tableHeader, width: '8%' }}>Shared</th>
                      <th style={{ ...styles.tableHeader, width: '19%', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDisplayAssessments(myAssessments).map((assessment, index, arr) => {
                      const isCompleted = assessment.status === 'completed';
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
                          onDrop={(e) => handleDrop(e, assessment.id, 'my')}
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
                            <div style={styles.assessmentNameCell}>
                              <div
                                style={{
                                  ...styles.statusIndicator,
                                  backgroundColor: isCompleted ? '#0052CC' : '#6B778C',
                                }}
                              />
                              <div>
                                <div style={styles.assessmentName}>{assessment.name}</div>
                                <div style={styles.teamName}>{assessment.teamName}</div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: isCompleted ? '#E3FCEF' : '#F4F5F7',
                                color: isCompleted ? '#006644' : '#6B778C',
                              }}
                            >
                              {getStatusLabel(assessment.status)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.timeText}>
                              {formatDate(assessment.createdAt)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.timeText}>
                              {isCompleted ? formatDate(assessment.createdAt) : '—'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {assessment.shares.length > 0 ? (
                              <button
                                style={styles.sharedButton}
                                onClick={() => onShareAssessment(assessment)}
                                title="Manage sharing"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path d="M9.5 10.5v-.75c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v.75M6.25 5.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5zM11.5 6v2.5M10.25 7.25h2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                                </svg>
                                {assessment.shares.length}
                              </button>
                            ) : (
                              <span style={styles.noShareText}>—</span>
                            )}
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsCell}>
                              {isCompleted ? (
                                <button
                                  style={styles.viewButton}
                                  onClick={() => onViewAssessment(assessment)}
                                >
                                  View
                                </button>
                              ) : (
                                <button
                                  style={styles.continueButton}
                                  onClick={() => onEditAssessment(assessment)}
                                >
                                  Continue
                                </button>
                              )}
                              <div style={styles.menuWrapper}>
                                <button
                                  style={{
                                    ...styles.menuButton,
                                    ...(openMenuId === assessment.id ? styles.menuButtonActive : {}),
                                  }}
                                  onClick={() => setOpenMenuId(openMenuId === assessment.id ? null : assessment.id)}
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="3.5" r="1.25" fill="currentColor"/>
                                    <circle cx="8" cy="8" r="1.25" fill="currentColor"/>
                                    <circle cx="8" cy="12.5" r="1.25" fill="currentColor"/>
                                  </svg>
                                </button>
                                {openMenuId === assessment.id && (
                                  <div style={styles.dropdown}>
                                    {isCompleted && (
                                      <button
                                        style={styles.menuItem}
                                        onClick={() => handleMenuAction(() => onShareAssessment(assessment))}
                                      >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                          <path d="M11 5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM11 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5"/>
                                          <path d="M7.27 7.27l1.46-1.46M7.27 8.73l1.46 1.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        Share
                                      </button>
                                    )}
                                    <button
                                      style={styles.menuItem}
                                      onClick={() => handleMenuAction(() => onDuplicateAssessment(assessment))}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5"/>
                                      </svg>
                                      Duplicate
                                    </button>
                                    <button
                                      style={styles.menuItem}
                                      onClick={() => handleMenuAction(() => onRenameAssessment(assessment))}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M11.5 2.5l2 2M2 14l.5-2L11 3.5l2 2L4.5 14 2.5 14.5 2 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      Rename
                                    </button>
                                    <div style={styles.menuDivider} />
                                    <button
                                      style={{ ...styles.menuItem, color: '#DE350B' }}
                                      onClick={() => handleMenuAction(() => onDeleteAssessment(assessment))}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4M6.5 7v5M9.5 7v5M3.5 4l.5 9.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5L12.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'shared' ? (
            sharedWithMe.length === 0 ? (
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
                  When someone shares an assessment with you, it will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.tableHeader, width: '4%' }}></th>
                      <th style={{ ...styles.tableHeader, width: '28%' }}>Assessment</th>
                      <th style={{ ...styles.tableHeader, width: '14%' }}>Shared By</th>
                      <th style={{ ...styles.tableHeader, width: '11%' }}>Permission</th>
                      <th style={{ ...styles.tableHeader, width: '13%' }}>Created</th>
                      <th style={{ ...styles.tableHeader, width: '13%' }}>Last Refreshed</th>
                      <th style={{ ...styles.tableHeader, width: '17%', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getDisplayAssessments(sharedWithMe).map((assessment, index, arr) => {
                      const { permission, sharedBy } = getShareInfo(assessment);
                      const isHovered = hoveredRow === assessment.id;
                      const canEdit = permission === 'editable';
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
                          onDrop={(e) => handleDrop(e, assessment.id, 'shared')}
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
                            <div style={styles.assessmentNameCell}>
                              <div
                                style={{
                                  ...styles.statusIndicator,
                                  backgroundColor: '#0052CC',
                                }}
                              />
                              <div>
                                <div style={styles.assessmentName}>{assessment.name}</div>
                                <div style={styles.teamName}>{assessment.teamName}</div>
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
                            <span
                              style={{
                                ...styles.permissionBadge,
                                backgroundColor: canEdit ? '#DEEBFF' : '#F4F5F7',
                                color: canEdit ? '#0747A6' : '#6B778C',
                              }}
                            >
                              {canEdit ? 'Can edit' : 'View only'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.timeText}>
                              {formatDate(assessment.createdAt)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.timeText}>
                              {formatDate(assessment.createdAt)}
                            </span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsCell}>
                              <button
                                style={styles.viewButton}
                                onClick={() => onViewAssessment(assessment)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            myMultiTeamAssessments.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIllustration}>
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#F4F5F7"/>
                    <rect x="25" y="35" width="25" height="25" rx="3" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                    <rect x="70" y="35" width="25" height="25" rx="3" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                    <rect x="25" y="70" width="25" height="25" rx="3" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                    <rect x="70" y="70" width="25" height="25" rx="3" stroke="#DFE1E6" strokeWidth="2" fill="white"/>
                  </svg>
                </div>
                <h3 style={styles.emptyTitle}>No portfolio assessments yet</h3>
                <p style={styles.emptyText}>
                  Create a portfolio assessment to analyze multiple teams at once and get cross-team insights.
                </p>
                {onCreateMultiTeamAssessment && (
                  <button style={styles.emptyButton} onClick={onCreateMultiTeamAssessment}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Create Portfolio Assessment
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={{ ...styles.tableHeader, width: '4%' }}></th>
                      <th style={{ ...styles.tableHeader, width: '28%' }}>Portfolio</th>
                      <th style={{ ...styles.tableHeader, width: '12%' }}>Teams</th>
                      <th style={{ ...styles.tableHeader, width: '12%' }}>Scope</th>
                      <th style={{ ...styles.tableHeader, width: '11%' }}>Status</th>
                      <th style={{ ...styles.tableHeader, width: '13%' }}>Created</th>
                      <th style={{ ...styles.tableHeader, width: '20%', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myMultiTeamAssessments.map((assessment) => {
                      const isCompleted = assessment.status === 'completed';
                      const scopeLabel = assessment.scopeType === 'portfolio' ? 'Portfolio' :
                        assessment.scopeType === 'team-of-teams' ? 'Team of Teams' : 'Custom';

                      return (
                        <tr
                          key={assessment.id}
                          style={{
                            ...styles.tableRow,
                            ...(hoveredRow === assessment.id ? styles.tableRowHover : {}),
                          }}
                          onMouseEnter={() => setHoveredRow(assessment.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={styles.tableCell}>
                            <button
                              style={{
                                ...styles.starButton,
                                color: starredAssessments[assessment.id] ? '#FFAB00' : '#C1C7D0',
                              }}
                              onClick={() => toggleStar(assessment.id)}
                            >
                              {starredAssessments[assessment.id] ? '★' : '☆'}
                            </button>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.assessmentInfo}>
                              <div style={styles.portfolioIcon}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                  <rect x="12" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                  <rect x="2" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                  <rect x="12" y="12" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                              </div>
                              <div>
                                <div style={styles.assessmentName}>{assessment.name}</div>
                                <div style={styles.teamNameList}>
                                  {assessment.teamNames.slice(0, 3).join(', ')}
                                  {assessment.teamNames.length > 3 && ` +${assessment.teamNames.length - 3} more`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.teamCountBadge}>
                              {assessment.teamCount} teams
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.scopeBadge}>
                              {scopeLabel}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: isCompleted ? '#E3FCEF' : '#F4F5F7',
                                color: isCompleted ? '#006644' : '#6B778C',
                              }}
                            >
                              {getStatusLabel(assessment.status)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.timeText}>
                              {formatDate(assessment.createdAt)}
                            </span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsCell}>
                              {isCompleted && onViewMultiTeamAssessment ? (
                                <button
                                  style={styles.viewButton}
                                  onClick={() => onViewMultiTeamAssessment(assessment)}
                                >
                                  View Dashboard
                                </button>
                              ) : (
                                <button
                                  style={styles.continueButton}
                                  onClick={() => onViewMultiTeamAssessment?.(assessment)}
                                >
                                  Continue
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
  },
  header: {
    background: 'linear-gradient(135deg, #0747A6 0%, #0052CC 50%, #0065FF 100%)',
    padding: '14px 32px',
    boxShadow: '0 2px 8px rgba(0, 82, 204, 0.15)',
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
    color: '#0052CC',
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
    background: 'linear-gradient(180deg, #0052CC 0%, #0747A6 100%)',
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
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    maxWidth: '400px',
    lineHeight: 1.5,
  },
  heroButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  heroButtonSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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
  statCardHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
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
  statValueSmall: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginBottom: '4px',
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
  volumeBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
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
  main: {
    padding: '24px 32px 32px',
    marginTop: '-24px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08), 0 8px 24px rgba(9, 30, 66, 0.08)',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    borderBottom: '1px solid #EBECF0',
  },
  tabs: {
    display: 'flex',
    gap: '0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    marginBottom: '-1px',
  },
  tabActive: {
    color: '#0052CC',
    borderBottomColor: '#0052CC',
    fontWeight: 600,
  },
  tabBadge: {
    marginLeft: '8px',
    padding: '2px 8px',
    backgroundColor: '#F4F5F7',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
  },
  createButtonSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tabsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    color: '#6B778C',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '220px',
    padding: '8px 32px 8px 34px',
    fontSize: '13px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    backgroundColor: '#FAFBFC',
    color: '#172B4D',
    outline: 'none',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  },
  clearSearchButton: {
    position: 'absolute',
    right: '8px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6B778C',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  assessmentsList: {
    padding: '16px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  // Table styles
  tableContainer: {
    padding: '20px 0 0 0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeaderRow: {
    backgroundColor: '#FAFBFC',
    borderBottom: '1px solid #EBECF0',
  },
  tableHeader: {
    padding: '12px 16px',
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
  },
  tableRowHovered: {
    backgroundColor: '#FAFBFC',
  },
  tableRowStarred: {
    backgroundColor: '#FFFAE6',
  },
  tableCell: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  assessmentNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusIndicator: {
    width: '4px',
    height: '36px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  assessmentName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    marginBottom: '2px',
  },
  teamName: {
    fontSize: '12px',
    color: '#6B778C',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  timeText: {
    fontSize: '13px',
    color: '#6B778C',
  },
  sharedButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  noShareText: {
    color: '#C1C7D0',
    fontSize: '13px',
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
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
    transition: 'all 0.15s ease',
  },
  starButtonActive: {
    color: '#FFAB00',
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
    transition: 'color 0.15s ease',
  },
  tableRowDragging: {
    opacity: 0.5,
    backgroundColor: '#DEEBFF',
  },
  tableRowDragOver: {
    borderTop: '2px solid #0052CC',
  },
  viewButton: {
    padding: '6px 14px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  continueButton: {
    padding: '6px 14px',
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    border: '1.5px solid #0052CC',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  menuWrapper: {
    position: 'relative',
  },
  menuButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  menuButtonActive: {
    backgroundColor: '#F4F5F7',
    color: '#172B4D',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6E8EB',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(9, 30, 66, 0.15)',
    minWidth: '150px',
    zIndex: 1000,
    padding: '6px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#172B4D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '6px 0',
  },
  sharedByCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sharedByAvatar: {
    width: '24px',
    height: '24px',
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
    color: '#42526E',
  },
  permissionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
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
    margin: '0 0 24px 0',
    fontSize: '15px',
    color: '#6B778C',
    maxWidth: '360px',
    lineHeight: 1.5,
  },
  emptyButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)',
  },
  portfolioIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#DEEBFF',
    color: '#0052CC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teamNameList: {
    fontSize: '12px',
    color: '#6B778C',
    marginTop: '2px',
  },
  teamCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#DEEBFF',
    color: '#0747A6',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  scopeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    color: '#5E6C84',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
};

export default CreatorHome;
