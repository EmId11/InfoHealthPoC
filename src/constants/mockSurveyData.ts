// Mock Survey Campaign Data
// Sample data for demonstrating the team-wide calibration survey feature

import {
  SurveyCampaign,
  SurveyRecipient,
  ProjectRole,
  ProjectMember,
  CalibrationSurveyResponse,
  InvisibleWorkCategoryLevel,
} from '../types/assessment';

// ============================================
// Mock Project Roles
// ============================================

export const MOCK_PROJECT_ROLES: ProjectRole[] = [
  { id: 'developers', name: 'Developers', description: 'Team members who write code', memberCount: 8 },
  { id: 'administrators', name: 'Administrators', description: 'Project administrators', memberCount: 2 },
  { id: 'qa', name: 'QA Engineers', description: 'Quality assurance team', memberCount: 3 },
  { id: 'designers', name: 'Designers', description: 'UX/UI designers', memberCount: 2 },
  { id: 'product', name: 'Product Managers', description: 'Product owners and managers', memberCount: 2 },
  { id: 'viewers', name: 'Viewers', description: 'Read-only access members', memberCount: 5 },
];

// ============================================
// Mock Project Members
// ============================================

export const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  // Developers
  { id: 'user-1', displayName: 'Sarah Chen', email: 'sarah.chen@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-2', displayName: 'Marcus Johnson', email: 'marcus.j@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-3', displayName: 'Priya Patel', email: 'priya.p@company.com', avatarUrl: undefined, roles: ['developers', 'qa'] },
  { id: 'user-4', displayName: 'James Wilson', email: 'james.w@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-5', displayName: 'Emily Rodriguez', email: 'emily.r@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-6', displayName: 'David Kim', email: 'david.kim@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-7', displayName: 'Anna Kowalski', email: 'anna.k@company.com', avatarUrl: undefined, roles: ['developers'] },
  { id: 'user-8', displayName: 'Michael Brown', email: 'michael.b@company.com', avatarUrl: undefined, roles: ['developers'] },
  // Administrators
  { id: 'user-9', displayName: 'Rachel Green', email: 'rachel.g@company.com', avatarUrl: undefined, roles: ['administrators', 'product'] },
  { id: 'user-10', displayName: 'Tom Anderson', email: 'tom.a@company.com', avatarUrl: undefined, roles: ['administrators'] },
  // QA
  { id: 'user-11', displayName: 'Lisa Park', email: 'lisa.p@company.com', avatarUrl: undefined, roles: ['qa'] },
  { id: 'user-12', displayName: 'Kevin Lee', email: 'kevin.lee@company.com', avatarUrl: undefined, roles: ['qa'] },
  // Designers
  { id: 'user-13', displayName: 'Sophie Martin', email: 'sophie.m@company.com', avatarUrl: undefined, roles: ['designers'] },
  { id: 'user-14', displayName: 'Alex Rivera', email: 'alex.r@company.com', avatarUrl: undefined, roles: ['designers'] },
  // Product
  { id: 'user-15', displayName: 'Chris Taylor', email: 'chris.t@company.com', avatarUrl: undefined, roles: ['product'] },
];

// ============================================
// Helper Functions
// ============================================

const getMembersForRoles = (roles: string[]): ProjectMember[] => {
  return MOCK_PROJECT_MEMBERS.filter(member =>
    member.roles.some(role => roles.includes(role))
  );
};

const createRecipientsFromMembers = (
  members: ProjectMember[],
  statuses: RecipientStatus[] = ['pending']
): SurveyRecipient[] => {
  return members.map((member, index) => ({
    id: `recipient-${member.id}`,
    email: member.email,
    displayName: member.displayName,
    avatarUrl: member.avatarUrl,
    role: member.roles[0],
    status: statuses[index % statuses.length],
    sentAt: statuses[index % statuses.length] !== 'pending' ? '2024-10-02T09:00:00Z' : undefined,
    remindedAt: statuses[index % statuses.length] === 'reminded' ? '2024-10-05T09:00:00Z' : undefined,
    completedAt: statuses[index % statuses.length] === 'completed' ? '2024-10-03T14:30:00Z' : undefined,
  }));
};

type RecipientStatus = 'pending' | 'sent' | 'reminded' | 'completed';

// ============================================
// Mock Survey Responses
// ============================================

const createMockResponse = (
  _recipientId: string,  // Kept for call compatibility but not used (anonymous)
  category: InvisibleWorkCategoryLevel,
  campaignId: string
): CalibrationSurveyResponse => ({
  campaignId,
  invisibleWorkCategory: category,
  confidence: Math.floor(Math.random() * 3) + 3 as 3 | 4 | 5,
  invisibleWorkTypes: ['adhoc_requests', 'meetings', 'support'].slice(0, Math.floor(Math.random() * 3) + 1),
  trend: ['increased', 'stable', 'decreased'][Math.floor(Math.random() * 3)] as 'increased' | 'stable' | 'decreased',
  additionalContext: '',
  submittedAt: '2024-10-03T14:30:00Z',
});

// ============================================
// Mock Survey Campaigns
// ============================================

export const MOCK_SURVEY_CAMPAIGNS: SurveyCampaign[] = [
  // Active campaign with partial responses
  {
    id: 'campaign-1',
    name: 'Q4 2024 Survey',
    projectId: 'project-phoenix',
    projectName: 'Phoenix Backend',
    projectKey: 'PHX',
    periodStart: '2024-10-01',
    periodEnd: '2024-12-31',
    status: 'active',
    createdAt: '2024-10-01T08:00:00Z',
    createdBy: 'Rachel Green',
    closesAt: '2024-12-31T23:59:59Z',
    recipients: [
      // Completed responses
      { id: 'r-1', email: 'sarah.chen@company.com', displayName: 'Sarah Chen', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-02T10:15:00Z' },
      { id: 'r-2', email: 'marcus.j@company.com', displayName: 'Marcus Johnson', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-01T14:30:00Z' },
      { id: 'r-3', email: 'priya.p@company.com', displayName: 'Priya Patel', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-03T11:45:00Z' },
      { id: 'r-4', email: 'james.w@company.com', displayName: 'James Wilson', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-02T09:00:00Z' },
      { id: 'r-5', email: 'emily.r@company.com', displayName: 'Emily Rodriguez', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-04T16:20:00Z' },
      { id: 'r-6', email: 'david.kim@company.com', displayName: 'David Kim', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-01T11:00:00Z' },
      { id: 'r-7', email: 'anna.k@company.com', displayName: 'Anna Kowalski', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-05T08:30:00Z' },
      { id: 'r-8', email: 'michael.b@company.com', displayName: 'Michael Brown', role: 'developers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-02T15:45:00Z' },
      { id: 'r-9', email: 'lisa.p@company.com', displayName: 'Lisa Park', role: 'qa', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-03T10:00:00Z' },
      { id: 'r-10', email: 'kevin.lee@company.com', displayName: 'Kevin Lee', role: 'qa', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-02T13:15:00Z' },
      { id: 'r-11', email: 'sophie.m@company.com', displayName: 'Sophie Martin', role: 'designers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-04T09:30:00Z' },
      { id: 'r-12', email: 'alex.r@company.com', displayName: 'Alex Rivera', role: 'designers', status: 'completed', sentAt: '2024-10-01T09:00:00Z', completedAt: '2024-10-03T14:00:00Z' },
      // Reminded but not completed
      { id: 'r-13', email: 'rachel.g@company.com', displayName: 'Rachel Green', role: 'administrators', status: 'reminded', sentAt: '2024-10-01T09:00:00Z', remindedAt: '2024-10-04T09:00:00Z' },
      { id: 'r-14', email: 'tom.a@company.com', displayName: 'Tom Anderson', role: 'administrators', status: 'reminded', sentAt: '2024-10-01T09:00:00Z', remindedAt: '2024-10-04T09:00:00Z' },
      // Sent but no action
      { id: 'r-15', email: 'chris.t@company.com', displayName: 'Chris Taylor', role: 'product', status: 'sent', sentAt: '2024-10-01T09:00:00Z' },
      // Additional pending
      { id: 'r-16', email: 'new.hire@company.com', displayName: 'New Hire', role: 'developers', status: 'sent', sentAt: '2024-10-08T09:00:00Z' },
      { id: 'r-17', email: 'contractor@company.com', displayName: 'John Contractor', role: 'developers', status: 'sent', sentAt: '2024-10-08T09:00:00Z' },
      { id: 'r-18', email: 'intern@company.com', displayName: 'Summer Intern', role: 'developers', status: 'sent', sentAt: '2024-10-08T09:00:00Z' },
    ],
    responses: [
      createMockResponse('r-1', 3, 'campaign-1'),
      createMockResponse('r-2', 2, 'campaign-1'),
      createMockResponse('r-3', 3, 'campaign-1'),
      createMockResponse('r-4', 4, 'campaign-1'),
      createMockResponse('r-5', 3, 'campaign-1'),
      createMockResponse('r-6', 2, 'campaign-1'),
      createMockResponse('r-7', 3, 'campaign-1'),
      createMockResponse('r-8', 3, 'campaign-1'),
      createMockResponse('r-9', 2, 'campaign-1'),
      createMockResponse('r-10', 3, 'campaign-1'),
      createMockResponse('r-11', 4, 'campaign-1'),
      createMockResponse('r-12', 3, 'campaign-1'),
    ],
    remindersSent: 1,
    selectedRoles: ['developers', 'qa', 'designers', 'administrators', 'product'],
    notificationSettings: {
      sendImmediately: true,
      reminderDays: [3, 7],
    },
  },

  // Completed campaign from previous quarter
  {
    id: 'campaign-2',
    name: 'Q3 2024 Survey',
    projectId: 'project-phoenix',
    projectName: 'Phoenix Backend',
    projectKey: 'PHX',
    periodStart: '2024-07-01',
    periodEnd: '2024-09-30',
    status: 'closed',
    createdAt: '2024-07-01T08:00:00Z',
    createdBy: 'Rachel Green',
    closesAt: '2024-09-30T23:59:59Z',
    recipients: [
      { id: 'r-q3-1', email: 'sarah.chen@company.com', displayName: 'Sarah Chen', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-02T10:15:00Z' },
      { id: 'r-q3-2', email: 'marcus.j@company.com', displayName: 'Marcus Johnson', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-01T14:30:00Z' },
      { id: 'r-q3-3', email: 'priya.p@company.com', displayName: 'Priya Patel', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-03T11:45:00Z' },
      { id: 'r-q3-4', email: 'james.w@company.com', displayName: 'James Wilson', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-02T09:00:00Z' },
      { id: 'r-q3-5', email: 'emily.r@company.com', displayName: 'Emily Rodriguez', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-04T16:20:00Z' },
      { id: 'r-q3-6', email: 'david.kim@company.com', displayName: 'David Kim', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-01T11:00:00Z' },
      { id: 'r-q3-7', email: 'anna.k@company.com', displayName: 'Anna Kowalski', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-05T08:30:00Z' },
      { id: 'r-q3-8', email: 'michael.b@company.com', displayName: 'Michael Brown', role: 'developers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-02T15:45:00Z' },
      { id: 'r-q3-9', email: 'lisa.p@company.com', displayName: 'Lisa Park', role: 'qa', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-03T10:00:00Z' },
      { id: 'r-q3-10', email: 'kevin.lee@company.com', displayName: 'Kevin Lee', role: 'qa', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-02T13:15:00Z' },
      { id: 'r-q3-11', email: 'sophie.m@company.com', displayName: 'Sophie Martin', role: 'designers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-04T09:30:00Z' },
      { id: 'r-q3-12', email: 'alex.r@company.com', displayName: 'Alex Rivera', role: 'designers', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-03T14:00:00Z' },
      { id: 'r-q3-13', email: 'rachel.g@company.com', displayName: 'Rachel Green', role: 'administrators', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-05T11:00:00Z' },
      { id: 'r-q3-14', email: 'tom.a@company.com', displayName: 'Tom Anderson', role: 'administrators', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-06T09:30:00Z' },
      { id: 'r-q3-15', email: 'chris.t@company.com', displayName: 'Chris Taylor', role: 'product', status: 'completed', sentAt: '2024-07-01T09:00:00Z', completedAt: '2024-07-04T10:00:00Z' },
      // One person didn't complete
      { id: 'r-q3-16', email: 'former.employee@company.com', displayName: 'Former Employee', role: 'developers', status: 'reminded', sentAt: '2024-07-01T09:00:00Z', remindedAt: '2024-07-08T09:00:00Z' },
    ],
    responses: [
      createMockResponse('r-q3-1', 3, 'campaign-2'),
      createMockResponse('r-q3-2', 3, 'campaign-2'),
      createMockResponse('r-q3-3', 2, 'campaign-2'),
      createMockResponse('r-q3-4', 3, 'campaign-2'),
      createMockResponse('r-q3-5', 4, 'campaign-2'),
      createMockResponse('r-q3-6', 2, 'campaign-2'),
      createMockResponse('r-q3-7', 3, 'campaign-2'),
      createMockResponse('r-q3-8', 3, 'campaign-2'),
      createMockResponse('r-q3-9', 2, 'campaign-2'),
      createMockResponse('r-q3-10', 2, 'campaign-2'),
      createMockResponse('r-q3-11', 3, 'campaign-2'),
      createMockResponse('r-q3-12', 3, 'campaign-2'),
      createMockResponse('r-q3-13', 2, 'campaign-2'),
      createMockResponse('r-q3-14', 2, 'campaign-2'),
      createMockResponse('r-q3-15', 3, 'campaign-2'),
    ],
    remindersSent: 2,
    selectedRoles: ['developers', 'qa', 'designers', 'administrators', 'product'],
    notificationSettings: {
      sendImmediately: true,
      reminderDays: [3, 7],
    },
  },

  // Draft campaign not yet launched
  {
    id: 'campaign-3',
    name: 'Q1 2025 Survey',
    projectId: 'project-phoenix',
    projectName: 'Phoenix Backend',
    projectKey: 'PHX',
    periodStart: '2025-01-01',
    periodEnd: '2025-03-31',
    status: 'draft',
    createdAt: '2024-12-20T10:00:00Z',
    createdBy: 'Rachel Green',
    closesAt: '2025-03-31T23:59:59Z',
    recipients: [],
    responses: [],
    remindersSent: 0,
    selectedRoles: ['developers', 'qa'],
    notificationSettings: {
      sendImmediately: false,
      scheduledFor: '2025-01-02T09:00:00Z',
      reminderDays: [3, 7, 14],
    },
  },
];

// ============================================
// Mock Projects
// ============================================

export interface MockProject {
  id: string;
  key: string;
  name: string;
  avatarUrl?: string;
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: 'project-phoenix', key: 'PHX', name: 'Phoenix Backend' },
  { id: 'project-atlas', key: 'ATL', name: 'Atlas Frontend' },
  { id: 'project-hermes', key: 'HRM', name: 'Hermes API Gateway' },
  { id: 'project-zeus', key: 'ZEU', name: 'Zeus Analytics' },
];

// ============================================
// Helper Functions for Survey Stats
// ============================================

export const calculateSurveyStats = (campaign: SurveyCampaign): {
  totalRecipients: number;
  responseCount: number;
  responseRate: number;
  averageCategory: number;
  categoryDistribution: Record<InvisibleWorkCategoryLevel, number>;
} => {
  const totalRecipients = campaign.recipients.length;
  const responseCount = campaign.responses.length;
  const responseRate = totalRecipients > 0 ? (responseCount / totalRecipients) * 100 : 0;

  const categoryDistribution: Record<InvisibleWorkCategoryLevel, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let categorySum = 0;
  campaign.responses.forEach((response) => {
    categoryDistribution[response.invisibleWorkCategory]++;
    categorySum += response.invisibleWorkCategory;
  });

  const averageCategory = responseCount > 0 ? categorySum / responseCount : 0;

  return {
    totalRecipients,
    responseCount,
    responseRate,
    averageCategory,
    categoryDistribution,
  };
};

export const getRecipientsByStatus = (
  campaign: SurveyCampaign
): Record<RecipientStatus, SurveyRecipient[]> => {
  const result: Record<RecipientStatus, SurveyRecipient[]> = {
    pending: [],
    sent: [],
    reminded: [],
    completed: [],
  };

  campaign.recipients.forEach((recipient) => {
    result[recipient.status].push(recipient);
  });

  return result;
};
