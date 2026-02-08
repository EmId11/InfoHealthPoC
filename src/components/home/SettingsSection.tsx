import React from 'react';
import { AppUser } from '../../types/home';

interface SettingsSectionProps {
  user: AppUser;
  onViewSettings?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ user, onViewSettings }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.sectionLabel}>PROFILE</span>
      </div>
      <div style={styles.content}>
        <div style={styles.avatar}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} style={styles.avatarImage} />
          ) : (
            <span style={styles.avatarInitials}>{getInitials(user.displayName)}</span>
          )}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user.displayName}</span>
          <span style={styles.userEmail}>{user.email}</span>
        </div>
      </div>
      {onViewSettings && (
        <button style={styles.settingsButton} onClick={onViewSettings}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          View Settings
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '16px',
    minWidth: '200px',
  },
  header: {
    marginBottom: '14px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6B778C',
    letterSpacing: '0.5px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarInitials: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '12px',
    color: '#6B778C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  settingsButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    marginTop: '14px',
    padding: '8px 12px',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#42526E',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

export default SettingsSection;
