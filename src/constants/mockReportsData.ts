import { SavedReport, ReportsState } from '../types/reports';

// Sample saved reports for demonstration
export const MOCK_MY_REPORTS: SavedReport[] = [
  {
    id: 'rpt-001',
    name: 'High Risk Dimensions',
    description: 'All dimensions with high risk level across teams',
    query: {
      entityType: 'dimensions',
      groups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [
            {
              id: 'cond-1',
              fieldId: 'riskLevel',
              operator: 'equals',
              value: 'high',
            },
          ],
        },
      ],
      groupOperator: 'AND',
    },
    createdAt: '2024-01-15T10:30:00Z',
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Sarah Chen',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'saved',
    isPublicLink: false,
    visibleColumns: ['teamName', 'dimensionName', 'riskLevel', 'overallPercentile', 'trend'],
    sortColumn: 'overallPercentile',
    sortDirection: 'asc',
  },
  {
    id: 'rpt-002',
    name: 'Large Product Teams',
    description: 'Product development teams with 16+ members',
    query: {
      entityType: 'teams',
      groups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [
            {
              id: 'cond-1',
              fieldId: 'workType',
              operator: 'equals',
              value: 'product',
            },
            {
              id: 'cond-2',
              fieldId: 'teamSize',
              operator: 'equals',
              value: 'large',
            },
          ],
        },
      ],
      groupOperator: 'AND',
    },
    createdAt: '2024-01-10T14:00:00Z',
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Sarah Chen',
    updatedAt: '2024-01-12T09:15:00Z',
    status: 'saved',
    shareToken: 'rpt_abc123xyz',
    sharedAt: '2024-01-12T09:15:00Z',
    isPublicLink: true,
    visibleColumns: ['teamName', 'teamSize', 'workType', 'process', 'portfolio'],
  },
  {
    id: 'rpt-003',
    name: 'Inactive Users',
    description: 'Users who haven\'t been active in the last 30 days',
    query: {
      entityType: 'users',
      groups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [
            {
              id: 'cond-1',
              fieldId: 'status',
              operator: 'equals',
              value: 'active',
            },
            {
              id: 'cond-2',
              fieldId: 'lastActiveAt',
              operator: 'before',
              value: '2024-01-01',
            },
          ],
        },
      ],
      groupOperator: 'AND',
    },
    createdAt: '2024-01-08T11:00:00Z',
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Sarah Chen',
    updatedAt: '2024-01-08T11:00:00Z',
    status: 'saved',
    isPublicLink: false,
    visibleColumns: ['displayName', 'email', 'role', 'lastActiveAt'],
    sortColumn: 'lastActiveAt',
    sortDirection: 'asc',
  },
];

export const MOCK_SHARED_REPORTS: SavedReport[] = [
  {
    id: 'rpt-shared-001',
    name: 'Declining Teams Q4',
    description: 'Teams showing declining health scores in Q4 2024',
    query: {
      entityType: 'dimensions',
      groups: [
        {
          id: 'group-1',
          logicalOperator: 'AND',
          conditions: [
            {
              id: 'cond-1',
              fieldId: 'trend',
              operator: 'equals',
              value: 'declining',
            },
          ],
        },
      ],
      groupOperator: 'AND',
    },
    createdAt: '2024-01-05T16:30:00Z',
    createdByUserId: 'user-admin-2',
    createdByUserName: 'Michael Torres',
    updatedAt: '2024-01-05T16:30:00Z',
    status: 'saved',
    shareToken: 'rpt_shared_q4decline',
    sharedAt: '2024-01-06T10:00:00Z',
    isPublicLink: true,
    visibleColumns: ['teamName', 'dimensionName', 'trend', 'overallPercentile'],
  },
];

// Initial reports state for the admin dashboard
export const INITIAL_REPORTS_STATE: ReportsState = {
  myReports: MOCK_MY_REPORTS,
  sharedWithMe: MOCK_SHARED_REPORTS,
  currentReport: null,
  currentResults: null,
  isExecuting: false,
};
