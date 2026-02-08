import React, { useState, useMemo } from 'react';
import { ManagedUser, UserGroup, UserRole, UserStatus, UserInvite, AccessRequest, GroupAccessRule, UserGroupAccessRule, MOCK_JIRA_GROUPS } from '../../../types/admin';
import InfoButton from '../../common/InfoButton';

interface UsersSectionProps {
  users: ManagedUser[];
  groups: UserGroup[];
  onUpdateUsers: (users: ManagedUser[]) => void;
  onUpdateGroups: (groups: UserGroup[]) => void;
  accessRequests: AccessRequest[];
  onApproveAccessRequest: (requestId: string) => void;
  onDenyAccessRequest: (requestId: string, note?: string) => void;
  groupAccessRules: GroupAccessRule[];
  onUpdateGroupAccessRules: (rules: GroupAccessRule[]) => void;
  userGroupAccessRules: UserGroupAccessRule[];
  onUpdateUserGroupAccessRules: (rules: UserGroupAccessRule[]) => void;
}

// Access entry types for unified view
type AccessType = 'individual' | 'user-group' | 'jira-group';

interface AccessEntry {
  id: string;
  type: AccessType;
  name: string;
  email?: string;
  role: UserRole;
  status?: UserStatus;
  memberCount?: number;
  sourceId?: string; // For groups: the group ID
}

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  admin: { bg: '#EAE6FF', color: '#5243AA' },
  creator: { bg: '#DEEBFF', color: '#0052CC' },
  viewer: { bg: '#F4F5F7', color: '#6B778C' },
};

const STATUS_COLORS: Record<UserStatus, { bg: string; color: string }> = {
  active: { bg: '#E3FCEF', color: '#006644' },
  pending: { bg: '#FFFAE6', color: '#974F0C' },
  deactivated: { bg: '#FFEBE6', color: '#BF2600' },
};

const TYPE_LABELS: Record<AccessType, { label: string; color: string; bg: string }> = {
  'individual': { label: 'Individual', color: '#172B4D', bg: '#F4F5F7' },
  'user-group': { label: 'User Group', color: '#0052CC', bg: '#DEEBFF' },
  'jira-group': { label: 'Jira Group', color: '#5243AA', bg: '#EAE6FF' },
};

const UsersSection: React.FC<UsersSectionProps> = ({
  users,
  groups,
  onUpdateUsers,
  onUpdateGroups,
  accessRequests,
  onApproveAccessRequest,
  onDenyAccessRequest,
  groupAccessRules,
  onUpdateGroupAccessRules,
  userGroupAccessRules,
  onUpdateUserGroupAccessRules,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccessType | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false);
  const [editingAccessEntry, setEditingAccessEntry] = useState<AccessEntry | null>(null);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  // Build unified access list
  const accessEntries: AccessEntry[] = useMemo(() => {
    const entries: AccessEntry[] = [];

    // Add individual users
    users.forEach(user => {
      entries.push({
        id: `user-${user.id}`,
        type: 'individual',
        name: user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        sourceId: user.id,
      });
    });

    // Add user group access rules
    userGroupAccessRules.forEach(rule => {
      entries.push({
        id: `ug-rule-${rule.id}`,
        type: 'user-group',
        name: rule.userGroupName,
        role: rule.appRole,
        memberCount: rule.memberCount,
        sourceId: rule.userGroupId,
      });
    });

    // Add Jira group access rules
    groupAccessRules.forEach(rule => {
      entries.push({
        id: `jira-rule-${rule.id}`,
        type: 'jira-group',
        name: rule.jiraGroupName,
        role: rule.appRole,
        memberCount: rule.memberCount,
        sourceId: rule.jiraGroupId,
      });
    });

    return entries;
  }, [users, userGroupAccessRules, groupAccessRules]);

  // Filter access entries
  const filteredEntries = accessEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesRole = roleFilter === 'all' || entry.role === roleFilter;
    return matchesSearch && matchesType && matchesRole;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handlers
  const handleGrantAccess = (type: AccessType, targetId: string, role: UserRole, email?: string) => {
    if (type === 'individual') {
      const newUser: ManagedUser = {
        id: `user-${Date.now()}`,
        displayName: email?.split('@')[0] || 'New User',
        email: email || '',
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        invitedAt: new Date().toISOString(),
        invitedBy: 'Current Admin',
        groupIds: [],
      };
      onUpdateUsers([...users, newUser]);
    } else if (type === 'user-group') {
      const userGroup = groups.find(g => g.id === targetId);
      if (!userGroup) return;
      const newRule: UserGroupAccessRule = {
        id: `ug-rule-${Date.now()}`,
        userGroupId: userGroup.id,
        userGroupName: userGroup.name,
        appRole: role,
        createdAt: new Date().toISOString(),
        createdBy: 'Current Admin',
        memberCount: userGroup.memberCount,
        isActive: true,
      };
      onUpdateUserGroupAccessRules([...userGroupAccessRules, newRule]);
    } else if (type === 'jira-group') {
      const jiraGroup = MOCK_JIRA_GROUPS.find(g => g.id === targetId);
      if (!jiraGroup) return;
      const newRule: GroupAccessRule = {
        id: `jira-rule-${Date.now()}`,
        jiraGroupName: jiraGroup.name,
        jiraGroupId: jiraGroup.id,
        appRole: role,
        createdAt: new Date().toISOString(),
        createdBy: 'Current Admin',
        memberCount: jiraGroup.memberCount,
        isActive: true,
      };
      onUpdateGroupAccessRules([...groupAccessRules, newRule]);
    }
    setShowGrantAccessModal(false);
  };

  const handleUpdateAccessRole = (entry: AccessEntry, newRole: UserRole) => {
    if (entry.type === 'individual' && entry.sourceId) {
      const updatedUsers = users.map(u =>
        u.id === entry.sourceId ? { ...u, role: newRole } : u
      );
      onUpdateUsers(updatedUsers);
    } else if (entry.type === 'user-group') {
      const ruleId = entry.id.replace('ug-rule-', '');
      const updatedRules = userGroupAccessRules.map(r =>
        r.id === ruleId ? { ...r, appRole: newRole } : r
      );
      onUpdateUserGroupAccessRules(updatedRules);
    } else if (entry.type === 'jira-group') {
      const ruleId = entry.id.replace('jira-rule-', '');
      const updatedRules = groupAccessRules.map(r =>
        r.id === ruleId ? { ...r, appRole: newRole } : r
      );
      onUpdateGroupAccessRules(updatedRules);
    }
    setEditingAccessEntry(null);
  };

  const handleRevokeAccess = (entry: AccessEntry) => {
    if (entry.type === 'individual' && entry.sourceId) {
      const updatedUsers = users.map(u =>
        u.id === entry.sourceId ? { ...u, status: 'deactivated' as UserStatus, deactivatedAt: new Date().toISOString() } : u
      );
      onUpdateUsers(updatedUsers);
    } else if (entry.type === 'user-group') {
      const ruleId = entry.id.replace('ug-rule-', '');
      onUpdateUserGroupAccessRules(userGroupAccessRules.filter(r => r.id !== ruleId));
    } else if (entry.type === 'jira-group') {
      const ruleId = entry.id.replace('jira-rule-', '');
      onUpdateGroupAccessRules(groupAccessRules.filter(r => r.id !== ruleId));
    }
    setEditingAccessEntry(null);
  };

  const handleReactivateUser = (entry: AccessEntry) => {
    if (entry.type === 'individual' && entry.sourceId) {
      const updatedUsers = users.map(u =>
        u.id === entry.sourceId ? { ...u, status: 'active' as UserStatus, deactivatedAt: undefined } : u
      );
      onUpdateUsers(updatedUsers);
    }
  };

  const handleDeleteUser = (entry: AccessEntry) => {
    if (entry.type === 'individual' && entry.sourceId) {
      onUpdateUsers(users.filter(u => u.id !== entry.sourceId));
    }
    setEditingAccessEntry(null);
  };

  // User Group handlers
  const handleUpdateGroup = (updatedGroup: UserGroup) => {
    const updatedGroups = groups.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    );
    onUpdateGroups(updatedGroups);
    setEditingGroup(null);
  };

  const handleAddGroup = (name: string, description: string, memberIds: string[], role: UserRole | null) => {
    const groupId = `group-${Date.now()}`;
    const newGroup: UserGroup = {
      id: groupId,
      name,
      description,
      memberIds,
      memberCount: memberIds.length,
      createdAt: new Date().toISOString(),
      createdBy: 'Current Admin',
    };
    onUpdateGroups([...groups, newGroup]);

    // Update user groupIds for all members
    if (memberIds.length > 0) {
      const updatedUsers = users.map(u =>
        memberIds.includes(u.id) ? { ...u, groupIds: [...u.groupIds, groupId] } : u
      );
      onUpdateUsers(updatedUsers);
    }

    // Create access rule if role is specified
    if (role) {
      const newRule: UserGroupAccessRule = {
        id: `ug-rule-${Date.now()}`,
        userGroupId: groupId,
        userGroupName: name,
        appRole: role,
        createdAt: new Date().toISOString(),
        createdBy: 'Current Admin',
        memberCount: memberIds.length,
        isActive: true,
      };
      onUpdateUserGroupAccessRules([...userGroupAccessRules, newRule]);
    }

    setShowAddGroupModal(false);
  };

  const handleGrantGroupAccess = (group: UserGroup, role: UserRole) => {
    const existingRule = userGroupAccessRules.find(r => r.userGroupId === group.id);
    if (existingRule) {
      // Update existing rule
      const updatedRules = userGroupAccessRules.map(r =>
        r.userGroupId === group.id ? { ...r, appRole: role } : r
      );
      onUpdateUserGroupAccessRules(updatedRules);
    } else {
      // Create new rule
      const newRule: UserGroupAccessRule = {
        id: `ug-rule-${Date.now()}`,
        userGroupId: group.id,
        userGroupName: group.name,
        appRole: role,
        createdAt: new Date().toISOString(),
        createdBy: 'Current Admin',
        memberCount: group.memberCount,
        isActive: true,
      };
      onUpdateUserGroupAccessRules([...userGroupAccessRules, newRule]);
    }
  };

  const handleRevokeGroupAccess = (groupId: string) => {
    onUpdateUserGroupAccessRules(userGroupAccessRules.filter(r => r.userGroupId !== groupId));
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedUsers = users.map(u => ({
      ...u,
      groupIds: u.groupIds.filter(gid => gid !== groupId),
    }));
    onUpdateUsers(updatedUsers);
    onUpdateGroups(groups.filter(g => g.id !== groupId));
    onUpdateUserGroupAccessRules(userGroupAccessRules.filter(r => r.userGroupId !== groupId));
    setEditingGroup(null);
  };

  const handleAddUserToGroup = (userId: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || group.memberIds.includes(userId)) return;

    const updatedGroup: UserGroup = {
      ...group,
      memberIds: [...group.memberIds, userId],
      memberCount: group.memberIds.length + 1,
    };
    handleUpdateGroup(updatedGroup);

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, groupIds: [...u.groupIds, groupId] } : u
    );
    onUpdateUsers(updatedUsers);
  };

  const handleRemoveUserFromGroup = (userId: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const updatedGroup: UserGroup = {
      ...group,
      memberIds: group.memberIds.filter(id => id !== userId),
      memberCount: Math.max(0, group.memberCount - 1),
    };
    handleUpdateGroup(updatedGroup);

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, groupIds: u.groupIds.filter(gid => gid !== groupId) } : u
    );
    onUpdateUsers(updatedUsers);
  };

  const pendingRequests = accessRequests.filter(r => r.status === 'pending');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.titleRow}>
            <h2 style={styles.title}>Access Management</h2>
            <InfoButton title="Access Management">
              <p>Control who has access to the app and what they can do.</p>
              <p><strong>Grant access to:</strong></p>
              <ul>
                <li><strong>Individuals:</strong> Invite specific people by email</li>
                <li><strong>User Groups:</strong> Your internal groups (manage in section below)</li>
                <li><strong>Jira Groups:</strong> Sync access with existing Jira groups</li>
              </ul>
            </InfoButton>
          </div>
          <p style={styles.subtitle}>
            Grant and manage access for individuals and groups
          </p>
        </div>
        <button style={styles.grantAccessButton} onClick={() => setShowGrantAccessModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Grant Access
        </button>
      </div>

      {/* Pending Access Requests */}
      {pendingRequests.length > 0 && (
        <div style={styles.requestsSection}>
          <div style={styles.requestsHeader}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="#FF8B00" strokeWidth="2"/>
              <path d="M10 6v4M10 13v1" stroke="#FF8B00" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={styles.requestsTitle}>
              Access Requests
              <span style={styles.requestsBadge}>{pendingRequests.length}</span>
            </span>
          </div>
          <div style={styles.requestsList}>
            {pendingRequests.map(request => (
              <div key={request.id} style={styles.requestCard}>
                <div style={styles.requestAvatar}>{getInitials(request.requesterName)}</div>
                <div style={styles.requestInfo}>
                  <span style={styles.requestName}>{request.requesterName}</span>
                  <span style={styles.requestMeta}>
                    Requesting {request.requestedRole} access • {formatDate(request.requestedAt)}
                  </span>
                </div>
                <div style={styles.requestActions}>
                  <button style={styles.denyButton} onClick={() => onDenyAccessRequest(request.id)}>
                    Deny
                  </button>
                  <button style={styles.approveButton} onClick={() => onApproveAccessRequest(request.id)}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchContainer}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={styles.searchIcon}>
            <circle cx="7" cy="7" r="5" stroke="#6B778C" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="#6B778C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AccessType | 'all')}
            style={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="individual">Individuals</option>
            <option value="user-group">User Groups</option>
            <option value="jira-group">Jira Groups</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            style={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Unified Access Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Details</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.emptyState}>
                  No access entries found. Click "Grant Access" to add users or groups.
                </td>
              </tr>
            ) : (
              filteredEntries.map(entry => (
                <tr key={entry.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={{
                        ...styles.avatar,
                        backgroundColor: entry.type === 'jira-group' ? '#5243AA' :
                                        entry.type === 'user-group' ? '#0052CC' : '#5243AA',
                      }}>
                        {entry.type === 'individual' ? (
                          getInitials(entry.name)
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M1 14v-1a3 3 0 0 1 3-3h2M10 14v-1a3 3 0 0 1 3-3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div style={styles.nameInfo}>
                        <span style={styles.nameText}>{entry.name}</span>
                        {entry.email && <span style={styles.emailText}>{entry.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.typeBadge,
                      backgroundColor: TYPE_LABELS[entry.type].bg,
                      color: TYPE_LABELS[entry.type].color,
                    }}>
                      {TYPE_LABELS[entry.type].label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: ROLE_COLORS[entry.role].bg,
                      color: ROLE_COLORS[entry.role].color,
                    }}>
                      {entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {entry.type === 'individual' && entry.status ? (
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: STATUS_COLORS[entry.status].bg,
                        color: STATUS_COLORS[entry.status].color,
                      }}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    ) : entry.memberCount !== undefined ? (
                      <span style={styles.memberCount}>{entry.memberCount} members</span>
                    ) : null}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.actionButton}
                        onClick={() => setEditingAccessEntry(entry)}
                        title="Edit access"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 2.5l2 2M2 14l1-4L11.5 1.5l2 2L5 12l-4 1 1 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {entry.type === 'individual' && entry.status === 'deactivated' ? (
                        <button
                          style={styles.actionButton}
                          onClick={() => handleReactivateUser(entry)}
                          title="Reactivate"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 8a6 6 0 0 1 6-6M14 8a6 6 0 0 1-6 6" stroke="#00875A" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M8 2l2 2-2 2M8 14l-2-2 2-2" stroke="#00875A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          style={styles.actionButton}
                          onClick={() => handleRevokeAccess(entry)}
                          title="Revoke access"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="#DE350B" strokeWidth="1.5"/>
                            <path d="M5 8h6" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsBar}>
        <span style={styles.statItem}>
          <strong>{users.filter(u => u.status === 'active').length}</strong> active users
        </span>
        <span style={styles.statDivider}>•</span>
        <span style={styles.statItem}>
          <strong>{userGroupAccessRules.length}</strong> user group rules
        </span>
        <span style={styles.statDivider}>•</span>
        <span style={styles.statItem}>
          <strong>{groupAccessRules.length}</strong> Jira group rules
        </span>
      </div>

      {/* User Groups Section */}
      <div style={styles.groupsSection}>
        <div style={styles.groupsHeader}>
          <div style={styles.groupsTitleRow}>
            <h3 style={styles.groupsTitle}>User Groups</h3>
            <InfoButton title="User Groups">
              <p>Organize users into groups for easier management.</p>
              <p>To grant a group access to the app, use the "Grant Access" button above and select "User Group".</p>
            </InfoButton>
          </div>
          <p style={styles.groupsSubtitle}>Organize users into groups, then grant access above</p>
        </div>

        <div style={styles.groupsList}>
          {groups.length === 0 ? (
            <div style={styles.noGroupsMessage}>
              No user groups created yet. Create groups to organize your users.
            </div>
          ) : (
            groups.map(group => {
              const accessRule = userGroupAccessRules.find(r => r.userGroupId === group.id);
              return (
                <div
                  key={group.id}
                  style={styles.groupCard}
                  onClick={() => setEditingGroup(group)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={styles.groupIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="13" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 17v-1a4 4 0 0 1 4-4h2M12 17v-1a4 4 0 0 1 4-4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={styles.groupInfo}>
                    <span style={styles.groupName}>{group.name}</span>
                    <span style={styles.groupDescription}>{group.description}</span>
                  </div>
                  <div style={styles.groupRight}>
                    {accessRule && (
                      <span style={{
                        ...styles.groupRoleBadge,
                        backgroundColor: ROLE_COLORS[accessRule.appRole].bg,
                        color: ROLE_COLORS[accessRule.appRole].color,
                      }}>
                        {accessRule.appRole.charAt(0).toUpperCase() + accessRule.appRole.slice(1)}
                      </span>
                    )}
                    <span style={styles.groupMemberCount}>{group.memberCount} members</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#6B778C' }}>
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              );
            })
          )}
          <button style={styles.addGroupButton} onClick={() => setShowAddGroupModal(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Group
          </button>
        </div>
      </div>

      {/* Grant Access Modal */}
      {showGrantAccessModal && (
        <GrantAccessModal
          groups={groups}
          existingUserGroupRules={userGroupAccessRules}
          existingJiraGroupRules={groupAccessRules}
          onGrant={handleGrantAccess}
          onClose={() => setShowGrantAccessModal(false)}
        />
      )}

      {/* Edit Access Modal */}
      {editingAccessEntry && (
        <EditAccessModal
          entry={editingAccessEntry}
          onUpdateRole={(role) => handleUpdateAccessRole(editingAccessEntry, role)}
          onRevoke={() => handleRevokeAccess(editingAccessEntry)}
          onDelete={editingAccessEntry.type === 'individual' ? () => handleDeleteUser(editingAccessEntry) : undefined}
          onClose={() => setEditingAccessEntry(null)}
        />
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          users={users}
          accessRule={userGroupAccessRules.find(r => r.userGroupId === editingGroup.id)}
          onUpdate={handleUpdateGroup}
          onDelete={() => handleDeleteGroup(editingGroup.id)}
          onAddUser={(userId) => handleAddUserToGroup(userId, editingGroup.id)}
          onRemoveUser={(userId) => handleRemoveUserFromGroup(userId, editingGroup.id)}
          onGrantAccess={(role) => handleGrantGroupAccess(editingGroup, role)}
          onRevokeAccess={() => handleRevokeGroupAccess(editingGroup.id)}
          onClose={() => setEditingGroup(null)}
        />
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <AddGroupModal
          users={users}
          onAdd={handleAddGroup}
          onClose={() => setShowAddGroupModal(false)}
        />
      )}
    </div>
  );
};

// ============================================
// Grant Access Modal - Unified for all types
// ============================================
const GrantAccessModal: React.FC<{
  groups: UserGroup[];
  existingUserGroupRules: UserGroupAccessRule[];
  existingJiraGroupRules: GroupAccessRule[];
  onGrant: (type: AccessType, targetId: string, role: UserRole, email?: string) => void;
  onClose: () => void;
}> = ({ groups, existingUserGroupRules, existingJiraGroupRules, onGrant, onClose }) => {
  const [accessType, setAccessType] = useState<AccessType>('individual');
  const [email, setEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  const availableUserGroups = groups.filter(
    g => !existingUserGroupRules.some(r => r.userGroupId === g.id)
  );
  const availableJiraGroups = MOCK_JIRA_GROUPS.filter(
    g => !existingJiraGroupRules.some(r => r.jiraGroupId === g.id)
  );

  const handleSubmit = () => {
    if (accessType === 'individual') {
      if (!email) return;
      onGrant('individual', '', role, email);
    } else if (accessType === 'user-group') {
      if (!selectedGroupId) return;
      onGrant('user-group', selectedGroupId, role);
    } else if (accessType === 'jira-group') {
      if (!selectedGroupId) return;
      onGrant('jira-group', selectedGroupId, role);
    }
  };

  const isValid = accessType === 'individual'
    ? email.includes('@')
    : selectedGroupId !== '';

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Grant Access</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          {/* Access Type Selection */}
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Grant access to</label>
            <div style={modalStyles.typeSelector}>
              <button
                style={{
                  ...modalStyles.typeOption,
                  ...(accessType === 'individual' ? modalStyles.typeOptionActive : {}),
                }}
                onClick={(e) => { e.currentTarget.blur(); setAccessType('individual'); setSelectedGroupId(''); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 18v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Individual</span>
              </button>
              <button
                style={{
                  ...modalStyles.typeOption,
                  ...(accessType === 'user-group' ? modalStyles.typeOptionActive : {}),
                }}
                onClick={(e) => { e.currentTarget.blur(); setAccessType('user-group'); setSelectedGroupId(''); setEmail(''); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="13" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 17v-1a4 4 0 0 1 4-4h2M12 17v-1a4 4 0 0 1 4-4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>User Group</span>
              </button>
              <button
                style={{
                  ...modalStyles.typeOption,
                  ...(accessType === 'jira-group' ? modalStyles.typeOptionActive : {}),
                }}
                onClick={(e) => { e.currentTarget.blur(); setAccessType('jira-group'); setSelectedGroupId(''); setEmail(''); }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Jira Group</span>
              </button>
            </div>
          </div>

          {/* Dynamic Input based on type */}
          {accessType === 'individual' && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                style={modalStyles.input}
              />
            </div>
          )}

          {accessType === 'user-group' && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Select User Group</label>
              {availableUserGroups.length === 0 ? (
                <div style={modalStyles.emptyMessage}>
                  All user groups already have access rules. Create a new group first.
                </div>
              ) : (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={modalStyles.select}
                >
                  <option value="">Select a group...</option>
                  {availableUserGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.memberCount} members)</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {accessType === 'jira-group' && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Select Jira Group</label>
              {availableJiraGroups.length === 0 ? (
                <div style={modalStyles.emptyMessage}>
                  All Jira groups already have access rules.
                </div>
              ) : (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={modalStyles.select}
                >
                  <option value="">Select a Jira group...</option>
                  {availableJiraGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.memberCount} members)</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>App Role</label>
            <div style={modalStyles.roleOptions}>
              {(['viewer', 'creator', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  style={{
                    ...modalStyles.roleOption,
                    ...(role === r ? modalStyles.roleOptionActive : {}),
                  }}
                  onClick={(e) => { e.currentTarget.blur(); setRole(r); }}
                >
                  <span style={modalStyles.roleLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  <span style={modalStyles.roleDesc}>
                    {r === 'admin' && 'Full access'}
                    {r === 'creator' && 'Create assessments'}
                    {r === 'viewer' && 'View only'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.submitButton,
              ...(!isValid ? modalStyles.submitButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Grant Access
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Edit Access Modal
// ============================================
const EditAccessModal: React.FC<{
  entry: AccessEntry;
  onUpdateRole: (role: UserRole) => void;
  onRevoke: () => void;
  onDelete?: () => void;
  onClose: () => void;
}> = ({ entry, onUpdateRole, onRevoke, onDelete, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(entry.role);

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Edit Access</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.entryPreview}>
            <div style={{
              ...modalStyles.previewAvatar,
              backgroundColor: entry.type === 'jira-group' ? '#5243AA' :
                              entry.type === 'user-group' ? '#0052CC' : '#5243AA',
            }}>
              {entry.type === 'individual' ? (
                entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="13" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 17v-1a4 4 0 0 1 4-4h2M12 17v-1a4 4 0 0 1 4-4h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <div>
              <div style={modalStyles.previewName}>{entry.name}</div>
              <div style={modalStyles.previewType}>
                {TYPE_LABELS[entry.type].label}
                {entry.memberCount !== undefined && ` • ${entry.memberCount} members`}
              </div>
            </div>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Role</label>
            <div style={modalStyles.roleOptions}>
              {(['viewer', 'creator', 'admin'] as UserRole[]).map(r => (
                <button
                  key={r}
                  style={{
                    ...modalStyles.roleOption,
                    ...(selectedRole === r ? modalStyles.roleOptionActive : {}),
                  }}
                  onClick={(e) => { e.currentTarget.blur(); setSelectedRole(r); }}
                >
                  <span style={modalStyles.roleLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.dangerButton} onClick={onRevoke}>
            {entry.type === 'individual' ? 'Deactivate' : 'Remove Rule'}
          </button>
          {onDelete && entry.status === 'deactivated' && (
            <button style={modalStyles.dangerButton} onClick={onDelete}>
              Delete Permanently
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={() => onUpdateRole(selectedRole)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Edit Group Modal
// ============================================
const EditGroupModal: React.FC<{
  group: UserGroup;
  users: ManagedUser[];
  accessRule?: UserGroupAccessRule;
  onUpdate: (group: UserGroup) => void;
  onDelete: () => void;
  onAddUser: (userId: string) => void;
  onRemoveUser: (userId: string) => void;
  onGrantAccess: (role: UserRole) => void;
  onRevokeAccess: () => void;
  onClose: () => void;
}> = ({ group, users, accessRule, onUpdate, onDelete, onAddUser, onRemoveUser, onGrantAccess, onRevokeAccess, onClose }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'none'>(accessRule?.appRole || 'none');

  const groupMembers = users.filter(u => group.memberIds.includes(u.id));
  const availableUsers = users.filter(u => !group.memberIds.includes(u.id) && u.status === 'active');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = () => {
    onUpdate({ ...group, name, description });
    // Handle access changes
    if (selectedRole === 'none' && accessRule) {
      onRevokeAccess();
    } else if (selectedRole !== 'none' && selectedRole !== accessRule?.appRole) {
      onGrantAccess(selectedRole);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div style={modalStyles.overlay} onClick={onClose}>
        <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={modalStyles.header}>
            <h3 style={modalStyles.title}>Delete Group?</h3>
          </div>
          <div style={modalStyles.content}>
            <p style={{ margin: 0, color: '#172B4D' }}>
              Delete "{group.name}"? This will remove all {group.memberCount} members from the group and any access rules.
            </p>
          </div>
          <div style={modalStyles.footer}>
            <button style={modalStyles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
            <button style={modalStyles.dangerButton} onClick={onDelete}>
              Delete Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Edit Group</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Members ({groupMembers.length})</label>
            <div style={modalStyles.membersList}>
              {groupMembers.length === 0 ? (
                <div style={modalStyles.noMembersMessage}>No members yet</div>
              ) : (
                groupMembers.map(member => (
                  <div key={member.id} style={modalStyles.memberItem}>
                    <div style={modalStyles.memberAvatar}>{getInitials(member.displayName)}</div>
                    <div style={modalStyles.memberInfo}>
                      <span style={modalStyles.memberName}>{member.displayName}</span>
                      <span style={modalStyles.memberEmail}>{member.email}</span>
                    </div>
                    <button
                      style={modalStyles.removeMemberButton}
                      onClick={() => onRemoveUser(member.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {availableUsers.length > 0 && (
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Add Members</label>
              <select
                onChange={(e) => { if (e.target.value) { onAddUser(e.target.value); e.target.value = ''; }}}
                style={modalStyles.select}
                defaultValue=""
              >
                <option value="">Select user to add...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.displayName}</option>
                ))}
              </select>
            </div>
          )}

          <div style={modalStyles.divider} />

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Group Access</label>
            <p style={modalStyles.fieldHint}>Grant all members of this group access to the app</p>
            <div style={modalStyles.accessRoleSelector}>
              {(['none', 'viewer', 'creator', 'admin'] as const).map(role => (
                <button
                  key={role}
                  style={{
                    ...modalStyles.accessRoleOption,
                    ...(selectedRole === role ? modalStyles.accessRoleOptionActive : {}),
                  }}
                  onClick={(e) => { e.currentTarget.blur(); setSelectedRole(role); }}
                >
                  {role === 'none' ? 'No Access' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.dangerButton} onClick={() => setShowDeleteConfirm(true)}>
            Delete Group
          </button>
          <div style={{ flex: 1 }} />
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={modalStyles.submitButton} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Add Group Modal
// ============================================
const AddGroupModal: React.FC<{
  users: ManagedUser[];
  onAdd: (name: string, description: string, memberIds: string[], role: UserRole | null) => void;
  onClose: () => void;
}> = ({ users, onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'none'>('none');

  const activeUsers = users.filter(u => u.status === 'active');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAddMember = (userId: string) => {
    if (userId && !selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId));
  };

  const handleCreate = () => {
    onAdd(name.trim(), description.trim(), selectedMembers, selectedRole === 'none' ? null : selectedRole);
  };

  const availableUsers = activeUsers.filter(u => !selectedMembers.includes(u.id));

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={{ ...modalStyles.modal, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Create User Group</h3>
          <button style={modalStyles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={modalStyles.content}>
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Engineering Leads"
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Team leads and senior engineers"
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Members {selectedMembers.length > 0 && `(${selectedMembers.length})`}</label>
            {selectedMembers.length > 0 && (
              <div style={modalStyles.membersList}>
                {selectedMembers.map(memberId => {
                  const user = users.find(u => u.id === memberId);
                  if (!user) return null;
                  return (
                    <div key={memberId} style={modalStyles.memberItem}>
                      <div style={modalStyles.memberAvatar}>{getInitials(user.displayName)}</div>
                      <div style={modalStyles.memberInfo}>
                        <span style={modalStyles.memberName}>{user.displayName}</span>
                        <span style={modalStyles.memberEmail}>{user.email}</span>
                      </div>
                      <button
                        style={modalStyles.removeMemberButton}
                        onClick={() => handleRemoveMember(memberId)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {availableUsers.length > 0 && (
              <select
                onChange={(e) => { handleAddMember(e.target.value); e.target.value = ''; }}
                style={modalStyles.select}
                defaultValue=""
              >
                <option value="">Add members...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.displayName}</option>
                ))}
              </select>
            )}
          </div>

          <div style={modalStyles.divider} />

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Group Access</label>
            <p style={modalStyles.fieldHint}>Grant all members of this group access to the app</p>
            <div style={modalStyles.accessRoleSelector}>
              {(['none', 'viewer', 'creator', 'admin'] as const).map(role => (
                <button
                  key={role}
                  style={{
                    ...modalStyles.accessRoleOption,
                    ...(selectedRole === role ? modalStyles.accessRoleOptionActive : {}),
                  }}
                  onClick={(e) => { e.currentTarget.blur(); setSelectedRole(role); }}
                >
                  {role === 'none' ? 'No Access' : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...modalStyles.submitButton,
              ...(!name.trim() ? modalStyles.submitButtonDisabled : {}),
            }}
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Styles
// ============================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    color: '#172B4D',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6B778C',
  },
  grantAccessButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  requestsSection: {
    backgroundColor: '#FFFAE6',
    borderRadius: '12px',
    border: '1px solid #FFE380',
    padding: '16px',
  },
  requestsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  requestsTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#172B4D',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  requestsBadge: {
    backgroundColor: '#FF8B00',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  requestCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
  },
  requestAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
  },
  requestInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  requestName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  requestMeta: {
    fontSize: '12px',
    color: '#6B778C',
  },
  requestActions: {
    display: 'flex',
    gap: '8px',
  },
  approveButton: {
    padding: '6px 14px',
    backgroundColor: '#00875A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  denyButton: {
    padding: '6px 14px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
  },
  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EBECF0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#F7F8FA',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #EBECF0',
  },
  tableRow: {
    borderBottom: '1px solid #EBECF0',
  },
  td: {
    padding: '14px 16px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#6B778C',
    fontSize: '14px',
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
  },
  nameInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  nameText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  emailText: {
    fontSize: '12px',
    color: '#6B778C',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
  },
  memberCount: {
    fontSize: '13px',
    color: '#6B778C',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#6B778C',
  },
  statItem: {
    display: 'flex',
    gap: '4px',
  },
  statDivider: {
    color: '#C1C7D0',
  },
  groupsSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #EBECF0',
  },
  groupsHeader: {
    marginBottom: '16px',
  },
  groupsTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  groupsTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  groupsSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  groupsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  noGroupsMessage: {
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    color: '#6B778C',
    fontSize: '14px',
    textAlign: 'center',
  },
  groupCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #EBECF0',
    cursor: 'pointer',
  },
  groupIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#F4F5F7',
    color: '#5243AA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  groupName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  groupDescription: {
    fontSize: '12px',
    color: '#6B778C',
  },
  groupRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  groupMemberCount: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
  },
  groupRoleBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  addGroupButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    backgroundColor: 'transparent',
    border: '2px dashed #DFE1E6',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
  },
};

const modalStyles: Record<string, React.CSSProperties> = {
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
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(9, 30, 66, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #EBECF0',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#172B4D',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  content: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6B778C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  emptyMessage: {
    padding: '12px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#6B778C',
    textAlign: 'center' as const,
  },
  typeSelector: {
    display: 'flex',
    gap: '8px',
  },
  typeOption: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px',
    backgroundColor: '#F4F5F7',
    border: '2px solid #EBECF0',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    outline: 'none',
  },
  typeOptionActive: {
    backgroundColor: '#F3F0FF',
    border: '2px solid #5243AA',
    color: '#5243AA',
  },
  roleOptions: {
    display: 'flex',
    gap: '8px',
  },
  roleOption: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
    cursor: 'pointer',
    outline: 'none',
  },
  roleOptionActive: {
    backgroundColor: '#F3F0FF',
    border: '1px solid #5243AA',
  },
  roleLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#172B4D',
  },
  roleDesc: {
    fontSize: '11px',
    color: '#6B778C',
  },
  entryPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F7F8FA',
    borderRadius: '8px',
  },
  previewAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 600,
  },
  previewName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#172B4D',
  },
  previewType: {
    fontSize: '13px',
    color: '#6B778C',
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '180px',
    overflowY: 'auto',
    padding: '8px',
    backgroundColor: '#F7F8FA',
    borderRadius: '6px',
  },
  noMembersMessage: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#6B778C',
    fontSize: '13px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
  },
  memberAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  memberName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#172B4D',
  },
  memberEmail: {
    fontSize: '11px',
    color: '#6B778C',
  },
  removeMemberButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6B778C',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #EBECF0',
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#F4F5F7',
    color: '#6B778C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 16px',
    backgroundColor: '#5243AA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    backgroundColor: '#DFE1E6',
    color: '#A5ADBA',
    cursor: 'not-allowed',
  },
  dangerButton: {
    padding: '10px 16px',
    backgroundColor: '#FFEBE6',
    color: '#BF2600',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    backgroundColor: '#EBECF0',
    margin: '4px 0',
  },
  fieldHint: {
    margin: 0,
    fontSize: '13px',
    color: '#6B778C',
  },
  accessRoleSelector: {
    display: 'flex',
    gap: '8px',
  },
  accessRoleOption: {
    flex: 1,
    padding: '10px 8px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #EBECF0',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#6B778C',
    cursor: 'pointer',
    textAlign: 'center' as const,
    outline: 'none',
  },
  accessRoleOptionActive: {
    backgroundColor: '#F3F0FF',
    border: '1px solid #5243AA',
    color: '#5243AA',
  },
};

export default UsersSection;
