import React, { useState, useMemo } from 'react';
import { ProjectRole, ProjectMember } from '../../types/assessment';
import { MOCK_PROJECT_ROLES, MOCK_PROJECT_MEMBERS } from '../../constants/mockSurveyData';
import CheckIcon from '@atlaskit/icon/glyph/check';

interface TeamMemberPickerProps {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  projectId: string;
}

const TeamMemberPicker: React.FC<TeamMemberPickerProps> = ({
  selectedRoles,
  onRolesChange,
  projectId,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const roles = MOCK_PROJECT_ROLES;
  const members = MOCK_PROJECT_MEMBERS;

  const selectedMembers = useMemo(() => {
    if (selectedRoles.length === 0) return [];
    return members.filter((member) =>
      member.roles.some((role) => selectedRoles.includes(role))
    );
  }, [selectedRoles, members]);

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter((r) => r !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const selectAll = () => {
    onRolesChange(roles.map((r) => r.id));
  };

  const clearAll = () => {
    onRolesChange([]);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={styles.container}>
      {/* Role Selection */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>Select Roles to Survey</h4>
          <div style={styles.bulkActions}>
            <button style={styles.textButton} onClick={selectAll}>
              Select All
            </button>
            <span style={styles.divider}>|</span>
            <button style={styles.textButton} onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <div style={styles.roleGrid}>
          {roles.map((role) => (
            <button
              key={role.id}
              style={{
                ...styles.roleCard,
                ...(selectedRoles.includes(role.id) ? styles.roleCardSelected : {}),
              }}
              onClick={() => toggleRole(role.id)}
            >
              <div style={styles.roleCheckbox}>
                {selectedRoles.includes(role.id) && (
                  <CheckIcon label="" size="small" primaryColor="#0052CC" />
                )}
              </div>
              <div style={styles.roleInfo}>
                <span style={styles.roleName}>{role.name}</span>
                <span style={styles.roleCount}>{role.memberCount} members</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        <div style={styles.summaryContent}>
          <span style={styles.summaryNumber}>{selectedMembers.length}</span>
          <span style={styles.summaryText}>
            team member{selectedMembers.length !== 1 ? 's' : ''} will receive survey invitations
          </span>
        </div>
        {selectedMembers.length > 0 && (
          <button
            style={styles.previewButton}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Preview Recipients'}
          </button>
        )}
      </div>

      {/* Member Preview */}
      {showPreview && selectedMembers.length > 0 && (
        <div style={styles.previewSection}>
          <div style={styles.memberGrid}>
            {selectedMembers.map((member) => (
              <div key={member.id} style={styles.memberCard}>
                <div style={styles.avatar}>
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="" style={styles.avatarImage} />
                  ) : (
                    <span style={styles.avatarInitials}>{getInitials(member.displayName)}</span>
                  )}
                </div>
                <div style={styles.memberInfo}>
                  <span style={styles.memberName}>{member.displayName}</span>
                  <span style={styles.memberEmail}>{member.email}</span>
                </div>
                <span style={styles.memberRole}>
                  {member.roles.find((r) => selectedRoles.includes(r)) || member.roles[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div style={styles.note}>
        <p style={styles.noteText}>
          Recipients are derived from Jira project roles. In production, this would use the Jira REST API
          to fetch actual project members.
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
  section: {},
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  textButton: {
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#0052CC',
    fontSize: '13px',
    cursor: 'pointer',
  },
  divider: {
    color: '#DFE1E6',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  roleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  roleCardSelected: {
    backgroundColor: '#DEEBFF',
    border: '1px solid #0052CC',
  },
  roleCheckbox: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: '2px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  roleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  roleName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#172B4D',
  },
  roleCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
  },
  summaryContent: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0052CC',
  },
  summaryText: {
    fontSize: '14px',
    color: '#172B4D',
  },
  previewButton: {
    padding: '8px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    cursor: 'pointer',
  },
  previewSection: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
  },
  memberGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  memberCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '6px',
  },
  avatar: {
    width: '32px',
    height: '32px',
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
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  memberName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#172B4D',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  memberEmail: {
    fontSize: '12px',
    color: '#6B778C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  memberRole: {
    padding: '4px 8px',
    backgroundColor: '#EBECF0',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#5E6C84',
    textTransform: 'capitalize',
  },
  note: {
    padding: '12px',
    backgroundColor: '#F4F5F7',
    borderRadius: '6px',
    borderLeft: '3px solid #6B778C',
  },
  noteText: {
    margin: 0,
    fontSize: '12px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
};

export default TeamMemberPicker;
