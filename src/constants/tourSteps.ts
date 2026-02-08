import { TourStep } from '../components/onboarding/TourContext';

// Simple page-level guidance - ONE tooltip per page explaining what to do
// User dismisses the tooltip, then uses normal wizard navigation (Continue button)
export const pageGuidanceSteps: Record<number, TourStep> = {
  1: {
    target: '[data-tour="team-select"]',
    title: 'Set Up Your Assessment',
    content: 'Select your team, choose how far back to analyse, and pick how you want data grouped in reports. Click Continue when ready.',
    tip: 'We recommend at least 3 months of data for reliable patterns.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 1,
  },
  2: {
    target: '[data-tour="comparison-options"]',
    title: 'Choose Comparisons',
    content: 'Select which teams or benchmarks to compare your results against. This helps put your scores in context.',
    tip: 'Comparing to similar teams gives the most useful insights.',
    allowInteraction: true,
    placement: 'right',
    wizardStep: 2,
  },
  3: {
    target: '[data-tour="issue-types"]',
    title: 'Select Issue Types',
    content: 'Choose which Jira issue types to include. We detected these from your project - deselect any you don\'t want analysed.',
    tip: 'Include all types your team regularly works with.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 3,
  },
  4: {
    target: '[data-tour="sprint-cadence"]',
    title: 'Define Sprint Rhythm',
    content: 'Tell us your sprint length. If it changed recently, toggle the option below to let us know.',
    tip: 'This helps us understand your workflow patterns.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 4,
  },
  5: {
    target: '[data-tour="stale-thresholds"]',
    title: 'Set Stale Thresholds',
    content: 'Define how many days without activity makes an issue "stale". Different issue types often have different expectations.',
    tip: 'Bugs typically need faster attention than epics.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 5,
  },
  6: {
    target: '[data-tour="calibration-options"]',
    title: 'Calibration Options',
    content: 'Choose whether to collect team feedback first (recommended) or generate results immediately. Team surveys improve accuracy significantly.',
    tip: 'Calibrated assessments are typically 30-40% more accurate.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 6,
  },
  7: {
    target: '[data-tour="report-options"]',
    title: 'Customise Your Report',
    content: 'Choose what to include in your assessment report. Toggle options on or off based on your preferences.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 7,
  },
  8: {
    target: '[data-tour="review-summary"]',
    title: 'Review & Run',
    content: 'Check your settings look correct, then click "Run Assessment" to generate your health report.',
    tip: 'You can always come back and adjust settings later.',
    allowInteraction: true,
    placement: 'bottom',
    wizardStep: 8,
  },
};

// Get the guidance step for a specific wizard page
export const getPageGuidance = (wizardStep: number): TourStep | null => {
  return pageGuidanceSteps[wizardStep] || null;
};

// Multi-step tours for wizard pages - triggered by "Take a Tour" button
export const wizardTours: Record<number, TourStep[]> = {
  // Step 1: Basics
  1: [
    {
      target: '[data-tour="team-select"]',
      title: 'Select Your Team',
      content: 'Choose the team you want to assess. Teams with previous assessments show a "Configured" badge - you can reuse those settings to save time.',
      tip: 'If you\'ve run assessments before, your previous settings are preserved.',
      placement: 'bottom',
      wizardStep: 1,
    },
    {
      target: '[data-tour="date-range"]',
      title: 'Set the Analysis Period',
      content: 'Choose how far back to look at your Jira data. We recommend at least 3 months for reliable patterns - shorter periods may miss important trends or seasonal variations.',
      tip: 'Longer periods give more data points, but very long periods may include outdated practices.',
      placement: 'bottom',
      wizardStep: 1,
    },
    {
      target: '[data-tour="data-grouping"]',
      title: 'Group Your Results',
      content: 'Decide how data appears in your reports. Weekly grouping shows more granular detail and sprint-level patterns. Monthly grouping is easier to scan for long-term trends.',
      placement: 'bottom',
      wizardStep: 1,
    },
  ],

  // Step 2: Comparison
  2: [
    {
      target: '[data-tour="comparison-options"]',
      title: 'Why Compare Teams?',
      content: 'Comparing your team to similar teams helps put your scores in context. A score of 75% means more when you know similar teams average 65% or 85%.',
      tip: 'Comparisons are optional but highly recommended for meaningful insights.',
      placement: 'right',
      wizardStep: 2,
    },
    {
      target: '[data-tour="org-structure"]',
      title: 'Organisation Structure',
      content: 'If your organisation uses Portfolios or Teams of Teams, select where your team fits. This helps identify the right comparison groups automatically.',
      placement: 'bottom',
      wizardStep: 2,
    },
    {
      target: '[data-tour="team-attributes"]',
      title: 'Team Attributes',
      content: 'Team attributes like size, tenure, and work type help find truly comparable teams. A 3-person team has different dynamics than a 15-person team.',
      tip: 'System attributes are detected from Jira; custom ones are defined by your admin.',
      placement: 'bottom',
      wizardStep: 2,
    },
  ],

  // Step 3: Issue Types (maps to wizard step 3)
  3: [
    {
      target: '[data-tour="issue-types"]',
      title: 'What Are Issue Types?',
      content: 'Jira organises work into types like Stories (features), Bugs (defects), Tasks (to-dos), and Epics (large initiatives). Each has different workflow patterns.',
      placement: 'bottom',
      wizardStep: 3,
    },
    {
      target: '[data-tour="issue-types"]',
      title: 'Why Include or Exclude?',
      content: 'Including the right types ensures accurate analysis. If your team doesn\'t use Sub-tasks, excluding them avoids counting empty data. If you track all work as Stories, include only that.',
      tip: 'We detected these types from your project - deselect any you don\'t want analysed.',
      placement: 'bottom',
      wizardStep: 3,
    },
  ],

  // Step 4: Sprint Cadence (maps to wizard step 4)
  4: [
    {
      target: '[data-tour="sprint-cadence"]',
      title: 'What is Sprint Cadence?',
      content: 'Sprint cadence is the length of your team\'s iteration cycle. Most Scrum teams use 2-week sprints, but 1, 3, or 4 weeks are also common. Kanban teams can choose the cycle that best fits their flow.',
      placement: 'bottom',
      wizardStep: 4,
    },
    {
      target: '[data-tour="sprint-cadence"]',
      title: 'Why Does It Matter?',
      content: 'Your sprint length affects how we measure velocity, completion rates, and carry-over. A team completing 10 stories per month means different things for 1-week vs 4-week sprints.',
      tip: 'If your cadence changed recently, toggle the option to let us know - we\'ll adjust the analysis.',
      placement: 'bottom',
      wizardStep: 4,
    },
  ],

  // Step 5: Stale Thresholds (maps to wizard step 5)
  5: [
    {
      target: '[data-tour="stale-thresholds"]',
      title: 'What Does "Stale" Mean?',
      content: 'An issue becomes "stale" when it hasn\'t been updated for a certain number of days. This often indicates blocked work, forgotten tasks, or issues that need attention.',
      placement: 'bottom',
      wizardStep: 5,
    },
    {
      target: '[data-tour="stale-thresholds"]',
      title: 'Different Types, Different Thresholds',
      content: 'Bugs often need faster attention (5-7 days) since they affect users. Stories and Tasks typically have 7-14 day thresholds. Epics can be longer (14-30 days) since they\'re larger initiatives.',
      tip: 'The system checks the "Last Updated" timestamp - any comment, status change, or field update resets the clock.',
      placement: 'bottom',
      wizardStep: 5,
    },
  ],

  // Step 6: Report Options (maps to wizard step 6)
  6: [
    {
      target: '[data-tour="report-options"]',
      title: 'Customise Your Report',
      content: 'Choose what to include in your assessment report. You can add trend analysis, detailed descriptions, "why it matters" sections, and comparison data.',
      placement: 'bottom',
      wizardStep: 6,
    },
    {
      target: '[data-tour="report-options"]',
      title: 'Finding the Right Detail Level',
      content: 'More options = more comprehensive report, but also longer. For quick team reviews, start with essentials. For stakeholder presentations, include trends and comparisons.',
      tip: 'You can always regenerate the report with different options later.',
      placement: 'bottom',
      wizardStep: 6,
    },
  ],

  // Step 7: Review (maps to wizard step 7)
  7: [
    {
      target: '[data-tour="review-summary"]',
      title: 'Review Your Settings',
      content: 'This summary shows all your choices. Take a moment to verify everything looks correct before running the assessment.',
      tip: 'You can go back to any previous step to make changes.',
      placement: 'bottom',
      wizardStep: 7,
    },
    {
      target: '[data-tour="review-summary"]',
      title: 'Run the Assessment',
      content: 'When you\'re ready, click "Run Assessment" to generate your health report. The analysis typically takes just a few seconds.',
      placement: 'bottom',
      wizardStep: 7,
    },
  ],
};

// Multi-step tours for admin sections
export const adminTours: Record<string, TourStep[]> = {
  overview: [
    {
      target: '[data-tour="overview-section"]',
      title: 'Admin Overview',
      content: 'Your dashboard at a glance. See quick actions, user summary, team health trends, and organisation settings status.',
      placement: 'bottom',
      sectionId: 'overview',
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Common tasks you can jump to: invite users, configure Jira standards, or create a new assessment.',
      placement: 'right',
      sectionId: 'overview',
    },
    {
      target: '[data-tour="user-summary"]',
      title: 'User Summary',
      content: 'See how many admins, creators, and viewers you have. Pending invitations are highlighted.',
      placement: 'left',
      sectionId: 'overview',
    },
    {
      target: '[data-tour="health-overview"]',
      title: 'Health Summary',
      content: 'Organisation-wide health score and trends. See which teams are improving, stable, or need attention.',
      placement: 'right',
      sectionId: 'overview',
    },
  ],
  assessments: [
    {
      target: '[data-tour="assessments-section"]',
      title: 'My Assessments',
      content: 'All assessments you\'ve created or that have been shared with you. View completed reports or continue drafts.',
      placement: 'bottom',
      sectionId: 'assessments',
    },
    {
      target: '[data-tour="assessment-tabs"]',
      title: 'Filter Assessments',
      content: 'Switch between assessments you\'ve created and those shared with you by colleagues.',
      placement: 'bottom',
      sectionId: 'assessments',
    },
  ],
  defaults: [
    {
      target: '[data-tour="stale-thresholds-section"]',
      title: 'Organisation-Wide Defaults',
      content: 'Set default values that apply to all teams. Individual teams can override these if you allow it, or you can enforce organisation-wide standards.',
      placement: 'bottom',
      sectionId: 'defaults',
    },
    {
      target: '[data-tour="dimension-presets"]',
      title: 'Assessment Dimension Presets',
      content: 'Define which health dimensions to measure. Quick Start covers essentials, Comprehensive includes all 12 dimensions, or choose focused presets for planning or execution.',
      placement: 'bottom',
      sectionId: 'defaults',
    },
  ],
  users: [
    {
      target: '[data-tour="users-section"]',
      title: 'User Management',
      content: 'Manage who can access the health assessment tool. Admins can configure settings, Creators can run assessments, and Viewers can only see shared reports.',
      placement: 'bottom',
      sectionId: 'users',
    },
  ],
  structure: [
    {
      target: '[data-tour="team-attributes-section"]',
      title: 'Team Attributes',
      content: 'Define attributes to categorise teams for comparison grouping. Attributes help teams find similar teams to benchmark against.',
      placement: 'bottom',
      sectionId: 'structure',
    },
    {
      target: '[data-tour="system-attributes"]',
      title: 'System Attributes',
      content: 'These attributes are auto-calculated from Jira data. Team Size, Tenure, and Issue Volume are assigned dynamically based on your team\'s actual metrics.',
      placement: 'bottom',
      sectionId: 'structure',
    },
    {
      target: '[data-tour="custom-attributes"]',
      title: 'Custom Attributes',
      content: 'Create your own attributes to classify teams. Define values with filter rules (e.g., team name contains "Mobile") or manually assign teams.',
      placement: 'bottom',
      sectionId: 'structure',
    },
  ],
  hierarchy: [
    {
      target: '[data-tour="org-hierarchy-section"]',
      title: 'Organisational Structure',
      content: 'Define how teams are organised. This determines how teams are grouped for comparison and rolled-up reporting.',
      placement: 'bottom',
      sectionId: 'hierarchy',
    },
    {
      target: '[data-tour="team-grouping-structure"]',
      title: 'Choose Your Structure',
      content: 'Use hierarchical for Portfolio → Team of Teams → Teams, or flat if your organisation doesn\'t have nested layers.',
      placement: 'bottom',
      sectionId: 'hierarchy',
    },
    {
      target: '[data-tour="portfolio-section"]',
      title: 'Portfolios',
      content: 'Top-level groupings (e.g., "Consumer Products", "Enterprise"). Each portfolio can contain multiple teams of teams.',
      placement: 'top',
      sectionId: 'hierarchy',
    },
    {
      target: '[data-tour="team-of-teams-section"]',
      title: 'Teams of Teams',
      content: 'Mid-level groupings (e.g., "Mobile Tribe", "Platform Squad"). Teams of teams belong to a portfolio and contain individual teams.',
      placement: 'top',
      sectionId: 'hierarchy',
    },
  ],
  analytics: [
    {
      target: '[data-tour="analytics-section"]',
      title: 'Analytics & Reports',
      content: 'Monitor usage and team health across your organisation. Track adoption trends and identify teams that need support.',
      placement: 'bottom',
      sectionId: 'analytics',
    },
    {
      target: '[data-tour="usage-metrics"]',
      title: 'Usage Metrics',
      content: 'See how many users are active, assessments created, and reports viewed. Use this to track tool adoption.',
      placement: 'top',
      sectionId: 'analytics',
    },
    {
      target: '[data-tour="activity-chart"]',
      title: 'Activity Trends',
      content: 'Track usage patterns over time. Identify spikes in activity and understand when teams are most engaged.',
      placement: 'top',
      sectionId: 'analytics',
    },
    {
      target: '[data-tour="health-summary"]',
      title: 'Health Summary',
      content: 'Get an overview of team health scores. See which teams are improving, stable, or need attention.',
      placement: 'top',
      sectionId: 'analytics',
    },
  ],
};
