import React, { useState, useRef, useEffect } from 'react';
import { SavedAssessment, getStatusLabel, getStatusColor, SharePermission } from '../../types/home';
import { formatRelativeTime } from '../../constants/mockHomeData';

interface AssessmentCardProps {
  assessment: SavedAssessment;
  permission?: SharePermission | 'owner';
  sharedBy?: string;
  onView: (assessment: SavedAssessment) => void;
  onEdit?: (assessment: SavedAssessment) => void;
  onShare?: (assessment: SavedAssessment) => void;
  onDelete?: (assessment: SavedAssessment) => void;
  onDuplicate?: (assessment: SavedAssessment) => void;
  onRename?: (assessment: SavedAssessment) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  permission = 'owner',
  sharedBy,
  onView,
  onEdit,
  onShare,
  onDelete,
  onDuplicate,
  onRename,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = permission === 'owner';
  const canEdit = isOwner || permission === 'editable';

  // Format date range for display
  const formatDateRange = () => {
    const { startDate, endDate } = assessment.dateRange;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    action();
  };

  // Determine if this is a completed assessment
  const isCompleted = assessment.status === 'completed';

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHovered : {}),
        ...(showMenu ? { zIndex: 100, position: 'relative' as const } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left accent bar - neutral color */}
      <div
        style={{
          ...styles.accentBar,
          backgroundColor: isCompleted ? '#0052CC' : '#6B778C',
        }}
      />

      <div style={styles.cardContent}>
        <div style={styles.mainInfo}>
          <div style={styles.titleRow}>
            <h3 style={styles.title}>{assessment.name}</h3>
          </div>

          <div style={styles.meta}>
            {/* Draft badge - only show for drafts */}
            {assessment.status === 'draft' && isOwner && (
              <span style={styles.statusBadge}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {getStatusLabel(assessment.status)}
              </span>
            )}

            {/* Permission badge for shared */}
            {!isOwner && (
              <span style={styles.permissionBadge}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                  {permission === 'read-only' ? (
                    <path d="M6 2.5c-2.5 0-4.5 2-4.5 3.5s2 3.5 4.5 3.5 4.5-2 4.5-3.5-2-3.5-4.5-3.5zM6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" stroke="currentColor" strokeWidth="1"/>
                  ) : (
                    <path d="M8.5 5.5l-1.75 1.75L5.5 6M3 6.5v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2M6 7V2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </svg>
                {permission === 'read-only' ? 'View only' : 'Can edit'}
              </span>
            )}

            {/* Shared by - for shared assessments */}
            {sharedBy && (
              <span style={styles.metaBadge}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                  <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M10 10.5c0-2-1.8-3.5-4-3.5s-4 1.5-4 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                <span style={styles.metaBadgeLabel}>Shared by</span>
                {sharedBy}
              </span>
            )}

            {/* Created/Generated time */}
            <span style={styles.metaBadge}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M6 3v3.5l2.5 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span style={styles.metaBadgeLabel}>{isCompleted ? 'Generated' : 'Created'}</span>
              {formatRelativeTime(assessment.createdAt)}
            </span>

            {/* Last refreshed - for completed assessments */}
            {isCompleted && (
              <span style={styles.metaBadge}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                  <path d="M1.5 6a4.5 4.5 0 1 0 1.3-3.2M1.5 2v1.8h1.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={styles.metaBadgeLabel}>Last refreshed</span>
                {formatRelativeTime(assessment.createdAt)}
              </span>
            )}

            {/* Shares count - clickable to open share modal */}
            {assessment.shares.length > 0 && isOwner && onShare && (
              <button
                style={styles.metaBadgeClickable}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(assessment);
                }}
                title="Manage sharing"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                  <path d="M8 9v-.5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2V9M5 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM10 5v2M9 6h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
                <span style={styles.metaBadgeLabel}>Shared with</span>
                {assessment.shares.length}
              </button>
            )}
          </div>
        </div>

        <div style={styles.rightSection}>
          <div style={styles.actions}>
            {assessment.status === 'completed' ? (
              <button
                style={{
                  ...styles.viewButton,
                  ...(isHovered ? styles.viewButtonHovered : {}),
                }}
                onClick={() => onView(assessment)}
              >
                View Report
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '6px' }}>
                  <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : canEdit && onEdit ? (
              <button
                style={{
                  ...styles.continueButton,
                  ...(isHovered ? styles.continueButtonHovered : {}),
                }}
                onClick={() => onEdit(assessment)}
              >
                Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: '6px' }}>
                  <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : null}

            {isOwner && (
              <div style={styles.menuContainer} ref={menuRef}>
                <button
                  style={{
                    ...styles.iconButton,
                    ...(showMenu ? styles.iconButtonActive : {}),
                  }}
                  onClick={() => setShowMenu(!showMenu)}
                  title="More options"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                    <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                  </svg>
                </button>

                {showMenu && (
                  <div style={styles.dropdown}>
                    {assessment.status === 'completed' && onShare && (
                      <button
                        style={styles.menuItem}
                        onClick={() => handleMenuAction(() => onShare(assessment))}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11 5.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM11 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M7.27 7.27l1.46-1.46M7.27 8.73l1.46 1.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Share
                      </button>
                    )}
                    {onDuplicate && (
                      <button
                        style={styles.menuItem}
                        onClick={() => handleMenuAction(() => onDuplicate(assessment))}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        Duplicate
                      </button>
                    )}
                    {onRename && (
                      <button
                        style={styles.menuItem}
                        onClick={() => handleMenuAction(() => onRename(assessment))}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 2.5l2 2M2 14l.5-2L11 3.5l2 2L4.5 14 2.5 14.5 2 14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Rename
                      </button>
                    )}
                    <div style={styles.menuDivider} />
                    {onDelete && (
                      <button
                        style={{ ...styles.menuItem, ...styles.menuItemDanger }}
                        onClick={() => handleMenuAction(() => onDelete(assessment))}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4h12M5.5 4V2.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4M6.5 7v5M9.5 7v5M3.5 4l.5 9.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5L12.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6E8EB',
    borderRadius: '10px',
    marginBottom: '10px',
    transition: 'all 0.2s ease',
  },
  cardHovered: {
    border: '1px solid #C1C7D0',
    boxShadow: '0 2px 8px rgba(9, 30, 66, 0.08)',
    transform: 'translateY(-1px)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderTopLeftRadius: '10px',
    borderBottomLeftRadius: '10px',
  },
  cardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 16px 24px',
  },
  mainInfo: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
  },
  permissionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
  },
  metaDot: {
    color: '#C1C7D0',
    fontSize: '12px',
  },
  metaItem: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#6B778C',
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#42526E',
  },
  metaBadgeLabel: {
    color: '#8993A4',
    marginRight: '4px',
    fontWeight: 500,
  },
  metaBadgeClickable: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#F4F5F7',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#42526E',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginLeft: '20px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  viewButtonHovered: {
    backgroundColor: '#0747A6',
  },
  continueButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    color: '#0052CC',
    border: '2px solid #0052CC',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  continueButtonHovered: {
    backgroundColor: '#DEEBFF',
  },
  menuContainer: {
    position: 'relative',
  },
  iconButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  iconButtonActive: {
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
    minWidth: '160px',
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
  menuItemDanger: {
    color: '#DE350B',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '6px 0',
  },
};

export default AssessmentCard;
