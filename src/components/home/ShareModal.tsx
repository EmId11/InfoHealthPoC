import React, { useState, useRef, useEffect } from 'react';
import { SavedAssessment, ShareRecord, SharePermission, AppUser } from '../../types/home';
import { MOCK_USERS, CURRENT_USER } from '../../constants/mockHomeData';

interface ShareModalProps {
  isOpen: boolean;
  assessment: SavedAssessment;
  onClose: () => void;
  onShare: (assessmentId: string, shares: ShareRecord[]) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  assessment,
  onClose,
  onShare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentShares, setCurrentShares] = useState<ShareRecord[]>(assessment.shares);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<SharePermission>('read-only');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter users for search (exclude current user and already shared users)
  const filteredUsers = MOCK_USERS.filter(user => {
    if (user.id === CURRENT_USER.id) return false;
    if (currentShares.some(s => s.sharedWithUserId === user.id)) return false;
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const handleSelectUser = (user: AppUser) => {
    setSelectedUser(user);
    setSearchQuery(user.displayName);
    setShowDropdown(false);
  };

  const handleAddUser = () => {
    if (!selectedUser) return;

    const newShare: ShareRecord = {
      id: `share-${Date.now()}`,
      sharedWithUserId: selectedUser.id,
      sharedWithUserName: selectedUser.displayName,
      sharedWithUserEmail: selectedUser.email,
      permission: selectedPermission,
      sharedAt: new Date().toISOString(),
      sharedByUserId: CURRENT_USER.id,
      sharedByUserName: CURRENT_USER.displayName,
    };
    setCurrentShares(prev => [...prev, newShare]);
    setSearchQuery('');
    setSelectedUser(null);
    setSelectedPermission('read-only');
    inputRef.current?.focus();
  };

  const handleRemoveUser = (shareId: string) => {
    setCurrentShares(prev => prev.filter(s => s.id !== shareId));
  };

  const handleUpdatePermission = (shareId: string, permission: SharePermission) => {
    setCurrentShares(prev =>
      prev.map(s => (s.id === shareId ? { ...s, permission } : s))
    );
  };

  const handleSave = () => {
    onShare(assessment.id, currentShares);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedUser(null);
    setShowDropdown(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#0052CC', '#00875A', '#FF5630', '#6554C0', '#00B8D9', '#36B37E'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Share assessment</h2>
            <p style={styles.subtitle}>{assessment.name}</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Add People Section */}
          <div style={styles.addSection}>
            <label style={styles.sectionLabel}>Add people</label>
            <div style={styles.addRow}>
              <div style={styles.searchWrapper} ref={searchRef}>
                <input
                  ref={inputRef}
                  style={styles.searchInput}
                  type="text"
                  placeholder="Enter name or email..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                />

                {/* Search Results Dropdown */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div style={styles.dropdown}>
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        style={styles.dropdownItem}
                        onClick={() => handleSelectUser(user)}
                      >
                        <div style={{ ...styles.avatar, backgroundColor: getAvatarColor(user.displayName) }}>
                          <span style={styles.avatarInitials}>{getInitials(user.displayName)}</span>
                        </div>
                        <div style={styles.dropdownUserInfo}>
                          <span style={styles.dropdownUserName}>{user.displayName}</span>
                          <span style={styles.dropdownUserEmail}>{user.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select
                style={styles.permissionSelect}
                value={selectedPermission}
                onChange={e => setSelectedPermission(e.target.value as SharePermission)}
              >
                <option value="read-only">Can view</option>
                <option value="editable">Can edit</option>
              </select>

              <button
                style={{
                  ...styles.addButton,
                  ...(selectedUser ? {} : styles.addButtonDisabled),
                }}
                onClick={handleAddUser}
                disabled={!selectedUser}
              >
                Add
              </button>
            </div>
          </div>

          {/* People with Access Section */}
          <div style={styles.accessSection}>
            <label style={styles.sectionLabel}>People with access</label>

            <div style={styles.peopleList}>
              {/* Owner (non-removable) */}
              <div style={styles.personRow}>
                <div style={{ ...styles.avatar, backgroundColor: getAvatarColor(CURRENT_USER.displayName) }}>
                  <span style={styles.avatarInitials}>{getInitials(CURRENT_USER.displayName)}</span>
                </div>
                <div style={styles.personInfo}>
                  <span style={styles.personName}>{CURRENT_USER.displayName} (you)</span>
                  <span style={styles.personEmail}>{CURRENT_USER.email}</span>
                </div>
                <span style={styles.ownerBadge}>Owner</span>
              </div>

              {/* Shared Users */}
              {currentShares.map(share => (
                <div key={share.id} style={styles.personRow}>
                  <div style={{ ...styles.avatar, backgroundColor: getAvatarColor(share.sharedWithUserName) }}>
                    <span style={styles.avatarInitials}>{getInitials(share.sharedWithUserName)}</span>
                  </div>
                  <div style={styles.personInfo}>
                    <span style={styles.personName}>{share.sharedWithUserName}</span>
                    <span style={styles.personEmail}>{share.sharedWithUserEmail}</span>
                  </div>
                  <select
                    style={styles.inlinePermissionSelect}
                    value={share.permission}
                    onChange={e => handleUpdatePermission(share.id, e.target.value as SharePermission)}
                  >
                    <option value="read-only">Can view</option>
                    <option value="editable">Can edit</option>
                  </select>
                  <button
                    style={styles.removeButton}
                    onClick={() => handleRemoveUser(share.id)}
                    title="Remove access"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M5 5l8 8M13 5L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}

              {currentShares.length === 0 && (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>Only you have access to this assessment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.saveButton} onClick={handleSave}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
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
  modal: {
    width: '520px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(9, 30, 66, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 24px 16px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#6B778C',
  },
  closeButton: {
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
    marginTop: '-4px',
    marginRight: '-8px',
  },
  content: {
    flex: 1,
    padding: '20px 24px',
    overflowY: 'auto',
  },
  addSection: {
    marginBottom: '24px',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  addRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'stretch',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  dropdownUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownUserName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  dropdownUserEmail: {
    fontSize: '12px',
    color: '#6B778C',
  },
  permissionSelect: {
    padding: '10px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    minWidth: '110px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  addButtonDisabled: {
    backgroundColor: '#F4F5F7',
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
  accessSection: {
    borderTop: '1px solid #EBECF0',
    paddingTop: '20px',
  },
  peopleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  personRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 8px',
    borderRadius: '6px',
    transition: 'background-color 0.15s ease',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  personInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  personName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  personEmail: {
    fontSize: '12px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ownerBadge: {
    padding: '4px 12px',
    backgroundColor: '#E3FCEF',
    color: '#006644',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '12px',
  },
  inlinePermissionSelect: {
    padding: '6px 10px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    color: '#172B4D',
  },
  removeButton: {
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
    flexShrink: 0,
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
    backgroundColor: '#FAFBFC',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#42526E',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

export default ShareModal;
