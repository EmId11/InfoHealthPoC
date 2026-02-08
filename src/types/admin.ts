// Admin Types for Invisible Work Assessment
// Defines types for admin dashboard, user management, org structure, and analytics

import { IssueTypeKey, SprintCadence, StaleThreshold, IssueTypeConfig } from './wizard';

// ============================================
// User Management Types
// ============================================

export type UserRole = 'viewer' | 'creator' | 'admin';
export type UserStatus = 'active' | 'pending' | 'deactivated';

export interface ManagedUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt?: string;
  invitedBy?: string;
  invitedAt?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  groupIds: string[];
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];  // User IDs in this group
  memberCount: number;  // Kept for backward compatibility (should match memberIds.length)
  createdAt: string;
  createdBy: string;
}

export interface UserInvite {
  email: string;
  role: UserRole;
  groupIds: string[];
  message?: string;
}

// ============================================
// Group Access Rules (Jira Group → App Role mapping)
// ============================================

export interface GroupAccessRule {
  id: string;
  jiraGroupName: string;       // e.g., "project-admins", "jira-administrators"
  jiraGroupId?: string;        // Optional Jira group ID
  appRole: UserRole;           // 'viewer' | 'creator' | 'admin'
  createdAt: string;
  createdBy: string;
  memberCount?: number;        // How many users this affects
  isActive: boolean;
}

// User Group Access Rules (App User Group → App Role mapping)
export interface UserGroupAccessRule {
  id: string;
  userGroupId: string;         // References UserGroup.id
  userGroupName: string;       // Denormalized for display
  appRole: UserRole;           // 'viewer' | 'creator' | 'admin'
  createdAt: string;
  createdBy: string;
  memberCount?: number;        // How many users this affects
  isActive: boolean;
}

// Mock Jira groups for PoC
export interface JiraGroup {
  id: string;
  name: string;
  memberCount: number;
}

export const MOCK_JIRA_GROUPS: JiraGroup[] = [
  { id: 'jira-admins', name: 'jira-administrators', memberCount: 5 },
  { id: 'project-admins', name: 'project-administrators', memberCount: 12 },
  { id: 'developers', name: 'developers', memberCount: 45 },
  { id: 'scrum-masters', name: 'scrum-masters', memberCount: 8 },
  { id: 'product-owners', name: 'product-owners', memberCount: 6 },
  { id: 'qa-team', name: 'qa-engineers', memberCount: 15 },
  { id: 'devops', name: 'devops-engineers', memberCount: 7 },
];

// ============================================
// Access Request Types
// ============================================

export type AccessRequestStatus = 'pending' | 'approved' | 'denied';

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  reason: string;
  requestedAt: string;
  status: AccessRequestStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerNote?: string;
}

// ============================================
// Organization Defaults Types
// ============================================

// Each setting can be enforced org-wide OR delegated to teams
export type SettingMode = 'org-defined' | 'team-decides';

export interface OrgSetting<T> {
  mode: SettingMode;
  value: T | null; // null when mode is 'team-decides'
}

// ============================================
// Field Health Configuration Types
// ============================================

export interface StandardFieldConfig {
  fieldId: string;
  fieldName: string;
  description: string;
  enabled: boolean;
  isDefault: boolean;  // True for current 8 fields
}

export interface CustomFieldConfig {
  id: string;
  jiraFieldId: string;
  displayName: string;
  description?: string;
  enabled: boolean;
}

export interface FieldHealthConfig {
  standardFields: StandardFieldConfig[];
  customFields: CustomFieldConfig[];
}

// ============================================
// Workflow Configuration Types
// ============================================

export interface WorkflowStatus {
  statusId: string;
  statusName: string;
  category: 'todo' | 'in-progress' | 'done';
}

export interface WorkflowConfig {
  issueType: string;
  statuses: WorkflowStatus[];
  isInferred: boolean;
  lastInferredAt?: string;
}

// ============================================
// Estimation Configuration Types
// ============================================

export interface EstimationPolicy {
  issueType: string;
  isEstimated: boolean;
  estimationField: 'storyPoints' | 'timeEstimate' | 'custom';
  customFieldId?: string;
  estimationTrigger: 'onCreation' | 'onTransition' | 'manual';
  triggerStatus?: string;  // Status that triggers estimation requirement
  isInferred: boolean;
}

// ============================================
// Blocker Configuration Types
// ============================================

export interface BlockerMethodConfig {
  useFlags: boolean;
  flagNames?: string[];
  useLabels: boolean;
  labelPatterns?: string[];
  useStatus: boolean;
  blockedStatuses?: string[];
  useLinks: boolean;
  linkTypes?: string[];  // e.g., "is blocked by"
}

// ============================================
// Organization Defaults Types
// ============================================

export interface OrganizationDefaults {
  id: string;
  issueTypes: OrgSetting<IssueTypeConfig[]>;  // Which issue types to include in assessments
  staleThresholds: OrgSetting<Record<IssueTypeKey, StaleThreshold>>;
  sprintCadence: OrgSetting<{
    cadence: SprintCadence;
    customDays: number | null;
  }>;
  dimensionPresets: OrgSetting<string[]>; // IDs of enabled presets
  fieldHealth: OrgSetting<FieldHealthConfig>;
  workflows: OrgSetting<WorkflowConfig[]>;
  estimation: OrgSetting<EstimationPolicy[]>;
  blockers: OrgSetting<BlockerMethodConfig>;
  updatedAt: string;
  updatedBy: string;
}

// ============================================
// Team Attributes System Types
// ============================================

/**
 * AttributeType distinguishes between admin-defined and system-calculated attributes.
 */
export type AttributeType = 'admin' | 'system' | 'org-structure';

/**
 * A TeamAttribute is a dimension for classifying teams.
 * Admin-defined: "Tribe", "Work Type", "Domain"
 * System-defined: "Team Size", "Tenure", "Volume", "Process"
 */
export interface TeamAttribute {
  id: string;
  name: string; // "Work Type", "Tribe", "Team Size"
  description: string; // "The type of work this team does"
  type: AttributeType; // 'admin' = custom, 'system' = auto-calculated
  color?: string; // For visual distinction
  isRequired: boolean; // Must Creator select a value?
  allowMultiple: boolean; // Can a team have multiple values?
  parentAttributeId?: string; // For hierarchy (e.g., Tribe → Portfolio)
  createdAt: string;
  createdBy: string;
}

/**
 * An AttributeValue is an option within an attribute.
 * Examples: Work Type → ["Product", "BAU", "Non-tech"]
 * For system attributes: Team Size → ["Small", "Medium", "Large"]
 */
export interface AttributeValue {
  id: string;
  attributeId: string; // Parent attribute
  categoryId?: string; // Legacy alias for attributeId (backward compatibility)
  name: string; // "Product", "Alpha Tribe", "Small"
  description?: string;
  filterRule: FilterRule | null; // Auto-assignment rule (null = manual only)
  manualTeamIds: string[]; // Manually assigned teams (in addition to filter)
  parentValueId?: string; // For hierarchy (e.g., "Mobile Tribe" → "Consumer Portfolio")
  // System attribute threshold (e.g., for "Small" team size: min=1, max=5)
  threshold?: { min?: number; max?: number };
  // For Portfolio: filter rule to auto-assign Teams of Teams
  teamOfTeamsFilterRule?: FilterRule;
  // For Portfolio: manually assigned Teams of Teams (value IDs from Team of Teams attribute)
  manualTeamOfTeamsIds?: string[];
  createdAt: string;
  createdBy: string;
}

// Legacy aliases for backward compatibility
export type TeamCategory = TeamAttribute;
export type CategoryValue = AttributeValue;

/**
 * FilterRule defines auto-assignment logic (JQL-like).
 * A team matches if ALL conditions are true (AND logic).
 */
export interface FilterRule {
  conditions: FilterCondition[];
}

// Fields available for filtering (no cross-category references)
export type FilterField = 'teamName' | 'teamKey' | 'isOnboarded';
// Future: memberCount, methodology, etc.

// Simple operators only (no regex, no cross-category refs)
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains' // Case-insensitive substring match
  | 'startsWith'
  | 'endsWith'
  | 'in' // Value in list
  | 'notIn'
  | 'isTrue' // Boolean
  | 'isFalse';

export interface FilterCondition {
  field: FilterField;
  operator: FilterOperator;
  value: string | string[] | boolean;
}

/**
 * Container for the entire team attributes system.
 * Supports both new naming (attributes/attributeValues) and legacy (categories/categoryValues)
 */
export interface TeamAttributeConfig {
  // New naming
  attributes: TeamAttribute[];
  attributeValues: AttributeValue[];
  // Legacy aliases (for backward compatibility)
  categories: TeamAttribute[];
  categoryValues: AttributeValue[];
}

// Legacy alias for backward compatibility
export type TeamCategorizationConfig = TeamAttributeConfig;

/**
 * System-defined attribute IDs (constants)
 */
export const SYSTEM_ATTRIBUTE_IDS = {
  TEAM_SIZE: 'sys-team-size',
  TENURE: 'sys-tenure',
  VOLUME: 'sys-volume',
  PROCESS: 'sys-process',
} as const;

/**
 * Team matching uses UNION logic:
 * - A team matches a category value if it matches the filter rule OR is manually assigned
 * - Manual assignments are additive (don't override filter)
 */
export type TeamMatchResult = {
  teamId: string;
  matchedBy: 'filter' | 'manual' | 'both';
};

// ============================================
// Organization Structure Types (Legacy - kept for backward compatibility)
// ============================================

export interface HierarchyLevel {
  id: string;
  name: string; // e.g., "Tribe", "Portfolio", "Squad"
  pluralName: string; // e.g., "Tribes", "Portfolios", "Squads"
  order: number; // 0 = top level, 1 = second level, etc.
  color?: string;
}

export interface OrgNode {
  id: string;
  name: string;
  levelId: string; // References HierarchyLevel.id
  parentId: string | null; // null for top-level nodes
  teamIds: string[]; // Teams assigned to this node
  createdAt: string;
  createdBy: string;
}

export interface OrganizationStructure {
  hierarchyLevels: HierarchyLevel[];
  nodes: OrgNode[];
}

// ============================================
// Analytics Types
// ============================================

export interface UsageMetrics {
  totalUsers: number;
  activeUsers: number; // Active in last 30 days
  weeklyActiveUsers: number; // Active in last 7 days
  dailyActiveUsers: number; // Active today
  newUsersThisMonth: number;
  totalAssessments: number;
  completedAssessments: number;
  assessmentsThisWeek: number;
  assessmentsThisMonth: number;
  avgAssessmentsPerWeek: number;
  reportsViewed: number;
  totalSessions: number;
  avgSessionDuration: number; // minutes
}

export interface ActivityDataPoint {
  date: string;
  assessmentsCreated: number;
  activeUsers: number;
  sessionsCount: number;
  reportsViewed: number;
}

export interface UsageTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  percentOfUsers: number;
}

export interface TopUser {
  userId: string;
  userName: string;
  assessmentsCreated: number;
  lastActive: string;
}

// Impact is now based on INDICATOR VALUE improvements
export interface IndicatorImpact {
  totalIndicatorsTracked: number;
  indicatorsImproved: number; // Value improved (not percentile)
  indicatorsDeclined: number;
  indicatorsStable: number;
  improvementRate: number; // % of tracked indicators that improved
  // Top improving indicators
  topImprovingIndicators: {
    indicatorName: string;
    teamsImproved: number;
    avgValueChange: number;
  }[];
  // Teams with most indicator improvements
  teamsWithMostImprovements: {
    teamName: string;
    indicatorsImproved: number;
    totalIndicators: number;
  }[];
}

export interface HealthSummary {
  totalTeamsAssessed: number;
  improvingTeams: number;
  decliningTeams: number;
  stableTeams: number;
}

export interface AdminAnalytics {
  usageMetrics: UsageMetrics;
  activityOverTime: ActivityDataPoint[];
  weeklyTrends: UsageTrend[];
  featureUsage: FeatureUsage[];
  topUsers: TopUser[];
  indicatorImpact: IndicatorImpact;
  healthSummary: HealthSummary;
  lastUpdated: string;
}

// ============================================
// Org Structure Settings
// ============================================

/**
 * Defines a custom hierarchy level in the organization structure.
 * These are the levels above "Teams" (e.g., Portfolio, Division, Value Stream).
 */
export interface OrgHierarchyLevel {
  id: string;
  name: string;           // "Portfolio", "Value Stream", etc.
  pluralName: string;     // "Portfolios", "Value Streams"
  aliases?: string[];     // Alternative names (e.g., ["Program", "ART"])
  color: string;          // Atlaskit color hex
  isMandatory: boolean;   // Must every team belong to this level?
  order: number;          // 0 = top level, higher = closer to teams
}

/**
 * Template IDs for pre-defined organization structures.
 */
export type StructureTemplateId = 'flat' | 'simple' | 'standard' | 'enterprise' | 'custom';

export interface OrgStructureSettings {
  useHierarchy: boolean; // false = flat structure (no levels above Teams)
  structureTemplate: StructureTemplateId; // Which template was selected
  customLevels: OrgHierarchyLevel[]; // The actual levels (populated from template or customized)
  // DEPRECATED: Use customLevels[n].isMandatory instead
  teamOfTeamsMandatory: boolean;
  portfolioMandatory: boolean;
}

// ============================================
// Admin Overview Value-Centric Dashboard Types
// ============================================

export type OutcomeConfidenceLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type OutcomeTrend = 'improving' | 'stable' | 'declining';

export interface OutcomeOrgStats {
  outcomeId: string;
  outcomeName: string;
  avgScore: number;
  confidenceLevel: OutcomeConfidenceLevel;
  teamsAtLow: number;
  teamsAtModerate: number;
  teamsAtHigh: number;
  teamsAtVeryHigh: number;
  criticalGaps: { dimensionKey: string; dimensionName: string; teamCount: number }[];
  trend: OutcomeTrend;
  trendChange: number;
}

export interface ImprovementJourneyStats {
  plansCreated: number;
  plansActive: number;
  plansCompleted: number;
  playsInFlight: number;
  tasksCompleted: number;
  tasksTotal: number;
  stalledPlanCount: number;
  teamsWithPlans: number;
  teamsWithoutPlans: number;
}

export interface DimensionGapStats {
  dimensionKey: string;
  dimensionName: string;
  teamsAtRisk: number;
  teamsNeedsAttention: number;
  avgMaturityLevel: number;
  impactedOutcomes: string[];
}

export interface OutcomeTrendPoint {
  period: string;
  outcomes: { outcomeId: string; avgScore: number }[];
}

export interface AdoptionFunnelStats {
  totalTeams: number;
  teamsEverAssessed: number;
  teamsFreshlyAssessed: number;
  teamsWithPlans: number;
  teamsWithActiveProgress: number;
}

export type ActionableAlertType =
  | 'critical_gap'
  | 'stalled_plan'
  | 'declining_team'
  | 'stale_assessment'
  | 'quick_win';

export type ActionableAlertPriority = 'high' | 'medium' | 'low';

export interface ActionableAlert {
  id: string;
  type: ActionableAlertType;
  priority: ActionableAlertPriority;
  title: string;
  description: string;
  teamId?: string;
  teamName?: string;
  outcomeId?: string;
  dimensionKey?: string;
  actionLabel: string;
  actionTarget: string;
  metadata?: Record<string, string | number>;
}

export interface AdminOverviewStats {
  outcomeStats: OutcomeOrgStats[];
  improvementJourney: ImprovementJourneyStats;
  dimensionGaps: DimensionGapStats[];
  outcomeTrends: OutcomeTrendPoint[];
  adoptionFunnel: AdoptionFunnelStats;
  actionableAlerts: ActionableAlert[];
}

// ============================================
// Admin Dashboard State
// ============================================

export type AdminSection =
  | 'overview'
  | 'users'
  | 'reports'
  | 'appSettings'
  | 'appSettings.orgHierarchy'
  | 'appSettings.jiraStandards'
  | 'appSettings.teamAttributes'
  | 'analytics';

// Import setup progress type
import { AdminSetupProgress } from './adminSetup';
import { ReportsState } from './reports';

export interface AdminState {
  currentSection: AdminSection;
  organizationDefaults: OrganizationDefaults;
  users: ManagedUser[];
  userGroups: UserGroup[];
  accessRequests: AccessRequest[]; // Role upgrade requests from viewers
  groupAccessRules: GroupAccessRule[]; // Jira group → App role mappings
  userGroupAccessRules: UserGroupAccessRule[]; // App user group → App role mappings
  organizationStructure: OrganizationStructure; // Legacy - to be removed
  teamAttributes: TeamAttributeConfig; // Team attributes system
  orgStructureSettings: OrgStructureSettings; // Org hierarchy settings
  analytics: AdminAnalytics;
  setupProgress: AdminSetupProgress; // Track setup wizard completion
  reports: ReportsState; // Reports feature state
}

// ============================================
// Admin Onboarding Types
// ============================================

export type OnboardingStepId =
  | 'invite-users'
  | 'configure-hierarchy'
  | 'setup-attributes'
  | 'define-standards'
  | 'create-assessment';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  description: string;
  targetSection: AdminSection;
}

export interface OnboardingState {
  isDismissed: boolean;
  isCollapsed: boolean;
}

export const ADMIN_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'invite-users',
    title: 'Invite team members',
    description: 'Add users who will create or view assessments',
    targetSection: 'users',
  },
  {
    id: 'configure-hierarchy',
    title: 'Configure org hierarchy',
    description: 'Set up Portfolios and Teams of Teams',
    targetSection: 'appSettings.orgHierarchy',
  },
  {
    id: 'setup-attributes',
    title: 'Set up team attributes',
    description: 'Define how teams are categorized',
    targetSection: 'appSettings.teamAttributes',
  },
  {
    id: 'define-standards',
    title: 'Define Jira standards',
    description: 'Set org-wide defaults for assessments',
    targetSection: 'appSettings.jiraStandards',
  },
];

// ============================================
// Filter Evaluation Helper Functions
// ============================================

interface TeamForFilter {
  label: string; // teamName
  value: string; // teamKey
  isOnboarded: boolean;
}

/**
 * Evaluates a single filter condition against a team.
 */
export function evaluateCondition(
  condition: FilterCondition,
  team: TeamForFilter
): boolean {
  const { field, operator, value } = condition;

  // Get the field value from the team
  let fieldValue: string | boolean;
  switch (field) {
    case 'teamName':
      fieldValue = team.label;
      break;
    case 'teamKey':
      fieldValue = team.value;
      break;
    case 'isOnboarded':
      fieldValue = team.isOnboarded;
      break;
    default:
      return false;
  }

  // Evaluate based on operator
  switch (operator) {
    case 'equals':
      return typeof fieldValue === 'string' && typeof value === 'string'
        ? fieldValue.toLowerCase() === value.toLowerCase()
        : fieldValue === value;
    case 'notEquals':
      return typeof fieldValue === 'string' && typeof value === 'string'
        ? fieldValue.toLowerCase() !== value.toLowerCase()
        : fieldValue !== value;
    case 'contains':
      return (
        typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().includes(value.toLowerCase())
      );
    case 'startsWith':
      return (
        typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().startsWith(value.toLowerCase())
      );
    case 'endsWith':
      return (
        typeof fieldValue === 'string' &&
        typeof value === 'string' &&
        fieldValue.toLowerCase().endsWith(value.toLowerCase())
      );
    case 'in':
      if (typeof fieldValue === 'string' && Array.isArray(value)) {
        const strFieldValue = fieldValue;
        return value.some(
          (v) => typeof v === 'string' && strFieldValue.toLowerCase() === v.toLowerCase()
        );
      }
      return false;
    case 'notIn':
      if (typeof fieldValue === 'string' && Array.isArray(value)) {
        const strFieldValue = fieldValue;
        return !value.some(
          (v) => typeof v === 'string' && strFieldValue.toLowerCase() === v.toLowerCase()
        );
      }
      return true;
    case 'isTrue':
      return fieldValue === true;
    case 'isFalse':
      return fieldValue === false;
    default:
      return false;
  }
}

/**
 * Evaluates a filter rule against a team.
 * All conditions must match (AND logic).
 */
export function evaluateFilterRule(
  rule: FilterRule | null,
  team: TeamForFilter
): boolean {
  if (!rule || rule.conditions.length === 0) return false;
  return rule.conditions.every((condition) => evaluateCondition(condition, team));
}

/**
 * Gets all teams matching an attribute value (filter + manual union).
 */
export function getMatchingTeams(
  attributeValue: AttributeValue,
  allTeams: TeamForFilter[]
): TeamMatchResult[] {
  const results: TeamMatchResult[] = [];
  const manualSet = new Set(attributeValue.manualTeamIds);

  for (const team of allTeams) {
    const matchesFilter = evaluateFilterRule(attributeValue.filterRule, team);
    const isManual = manualSet.has(team.value);

    if (matchesFilter && isManual) {
      results.push({ teamId: team.value, matchedBy: 'both' });
    } else if (matchesFilter) {
      results.push({ teamId: team.value, matchedBy: 'filter' });
    } else if (isManual) {
      results.push({ teamId: team.value, matchedBy: 'manual' });
    }
  }

  return results;
}

/**
 * Gets inherited attribute values for a team based on hierarchy.
 * E.g., if team is in "Mobile Tribe" which belongs to "Consumer Portfolio",
 * this returns both "Mobile Tribe" and "Consumer Portfolio".
 */
export function getInheritedAttributeValues(
  directValueIds: string[],
  allValues: AttributeValue[]
): string[] {
  const inherited = new Set<string>(directValueIds);

  // Walk up the hierarchy for each direct value
  for (const valueId of directValueIds) {
    let currentValue = allValues.find(v => v.id === valueId);
    while (currentValue?.parentValueId) {
      inherited.add(currentValue.parentValueId);
      currentValue = allValues.find(v => v.id === currentValue!.parentValueId);
    }
  }

  return Array.from(inherited);
}
