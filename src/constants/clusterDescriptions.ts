// Centralized descriptions for all clusters and dimensions
// Provides consistent "What / Why / Do" messaging throughout the app

// ===========================================
// Types
// ===========================================

export interface ClusterDescription {
  id: string;
  name: string;
  headline: string;      // The core question
  summary: string;       // One-line plain English summary
  whatWeMeasure: string; // Concrete explanation
  whyItMatters: string;  // Business impact / consequences
  whatYouCanDo: string;  // Actionable next steps
}

export interface DimensionDescription {
  key: string;
  name: string;
  headline: string;      // Risk question
  summary: string;       // One-liner
  whatWeMeasure: string; // Concrete explanation
  whyItMatters: string;  // Business impact
  whatYouCanDo: string;  // Actionable guidance
  clusterId: string;     // Which cluster this belongs to
}

// ===========================================
// Cluster Descriptions
// ===========================================

export const clusterDescriptions: ClusterDescription[] = [
  {
    id: 'dataQuality',
    name: 'Data Quality & Completeness',
    headline: 'Is our Jira data complete and accurate?',
    summary: 'Checks whether tickets contain the information needed for planning, tracking, and reporting.',
    whatWeMeasure: `We examine whether key fields are populated—descriptions, acceptance criteria, estimates, links, and assignments. Data quality is the foundation everything else depends on.`,
    whyItMatters: `Incomplete data means unreliable reports, missed dependencies, and decisions made on guesswork. If estimates are missing, velocity is meaningless. If links are missing, impact analysis fails.`,
    whatYouCanDo: `Review flagged indicators to see which fields are most commonly empty. Consider whether fields are truly needed (if never filled, maybe remove them) or if the team needs reminders or training to populate them.`,
  },
  {
    id: 'estimation',
    name: 'Estimation Health',
    headline: 'Is our estimation data reliable?',
    summary: 'Checks whether estimates exist and whether they are consistent enough to trust for planning.',
    whatWeMeasure: `We look at two things: coverage (do items have estimates?) and consistency (when estimates exist, are similar items estimated similarly?). Both matter for forecasting.`,
    whyItMatters: `Unreliable estimates make sprint planning a guessing game and long-term roadmaps fiction. If a "3-point story" takes anywhere from 1 day to 3 weeks, the number is noise, not signal.`,
    whatYouCanDo: `If coverage is low, focus on getting more items estimated. If consistency is low, consider team estimation calibration sessions—compare past estimates to actuals and discuss what surprised you.`,
  },
  {
    id: 'collaboration',
    name: 'Effective Collaboration',
    headline: 'Are we using Jira as a collaboration tool?',
    summary: 'Checks whether Jira is facilitating teamwork or functioning as isolated task lists.',
    whatWeMeasure: `Jira has features designed for collaboration—comments, @mentions, links, watchers. We measure whether teams actually use them. We also look at whether work involves multiple contributors or flows through siloed individuals.`,
    whyItMatters: `When collaboration happens outside Jira (Slack, meetings, hallways), decisions are not captured, context is lost, and Jira becomes a passive record rather than an active workspace. The tool could be helping more.`,
    whatYouCanDo: `Look at which collaboration features are underused. Are people linking related issues? Commenting on each other's work? If not, the team may need encouragement to treat Jira as a communication hub, not just a task tracker.`,
  },
  {
    id: 'efficiency',
    name: 'Jira Efficiency',
    headline: 'Are we wasting time in Jira?',
    summary: 'Checks whether your Jira setup creates unnecessary overhead.',
    whatWeMeasure: `We examine workflow complexity (too many statuses?), unused configuration (fields no one fills, statuses no one uses), and repetitive manual work that could be automated or templated.`,
    whyItMatters: `Every unnecessary click, field, and status is friction. Over-engineered Jira setups slow teams down and lead to shortcuts that undermine data quality. Jira should accelerate work, not create busywork.`,
    whatYouCanDo: `Review flagged areas. Are there statuses that issues routinely skip? Fields that are always empty? Tickets that get recreated repeatedly? These are simplification opportunities.`,
  },
  {
    id: 'discipline',
    name: 'Methodology Support',
    headline: 'Is Jira helping or hindering your methodology?',
    summary: 'Checks whether Jira practices support your Scrum, Kanban, or hybrid approach.',
    whatWeMeasure: `Jira can reinforce methodology discipline or undermine it. We look for practices that signal whether the tool is actively supporting your chosen way of working: sprint goals, WIP limits, consistent cadence, maintained backlogs.`,
    whyItMatters: `When these practices are absent in Jira, it does not mean your methodology is broken—you might have great practices that just are not captured. But it does mean Jira is not reinforcing them, and the tool could be helping more.`,
    whatYouCanDo: `For flagged areas, ask: "Is this practice happening but not in Jira, or not happening at all?" If the former, consider whether capturing it in Jira would add value. If the latter, that is a methodology conversation for the team.`,
  },
];

// ===========================================
// Dimension Descriptions
// ===========================================

export const dimensionDescriptions: DimensionDescription[] = [
  // =====================
  // Cluster 1: Data Quality & Completeness
  // =====================
  {
    key: 'workCaptured',
    name: 'Invisible Work',
    headline: 'Is all work being captured in Jira?',
    summary: 'Detects signs that work is happening outside Jira.',
    whatWeMeasure: `We look for statistical anomalies—unexplained variability in throughput, stale items, bulk updates, and work patterns that suggest Jira is not the source of truth.`,
    whyItMatters: `Work that happens outside Jira creates blind spots. You cannot track what you cannot see, and invisible work makes velocity, capacity, and progress reports misleading.`,
    whatYouCanDo: `Review the flagged indicators. If throughput varies wildly without corresponding demand changes, ask where the other work is going. If items are stale, ask why people are not updating them.`,
    clusterId: 'dataQuality',
  },
  {
    key: 'informationHealth',
    name: 'Information Health',
    headline: 'Do tickets have the information needed for planning?',
    summary: 'Measures whether critical fields are populated before work begins.',
    whatWeMeasure: `We check field completeness (descriptions, acceptance criteria, estimates), refinement quality (work readiness), and priority effectiveness (do labels predict delivery order?).`,
    whyItMatters: `Incomplete tickets lead to ambiguity, rework, and delays. When developers start work without acceptance criteria, they build the wrong thing. When estimates are missing, planning is guesswork.`,
    whatYouCanDo: `Identify which fields are consistently empty and determine if they are needed. Add refinement checklists or definition of ready criteria to ensure work is prepared before sprint planning.`,
    clusterId: 'dataQuality',
  },
  {
    key: 'dataFreshness',
    name: 'Data Freshness',
    headline: 'Does Jira reflect the current state of work?',
    summary: 'Measures how up-to-date your Jira data is.',
    whatWeMeasure: `We identify stale items, look for bulk updates that suggest catch-up sessions, and check whether parent-child relationships stay in sync.`,
    whyItMatters: `Stale data leads to bad decisions. If Jira does not reflect reality, standups become status-gathering sessions, and managers make plans based on outdated information.`,
    whatYouCanDo: `Encourage real-time updates as part of the workflow. Consider automation that prompts updates when items have been unchanged too long.`,
    clusterId: 'dataQuality',
  },
  {
    key: 'issueTypeConsistency',
    name: 'Issue Type Consistency',
    headline: 'Are issue types used consistently?',
    summary: 'Checks whether teams apply issue types in a standardized way.',
    whatWeMeasure: `We look at how different issue types are used across the team—whether similar work gets categorized the same way, and whether issue types follow expected workflow patterns.`,
    whyItMatters: `Inconsistent issue type usage makes metrics unreliable. If one person logs bugs as tasks and another uses the bug type, bug counts and task metrics both become meaningless.`,
    whatYouCanDo: `Establish clear guidelines for when to use each issue type. Review examples of inconsistent usage with the team and align on standards.`,
    clusterId: 'dataQuality',
  },
  {
    key: 'workHierarchy',
    name: 'Work Hierarchy Linkage',
    headline: 'Is work connected from tasks to strategic goals?',
    summary: 'Checks whether work items link to epics and initiatives.',
    whatWeMeasure: `We examine whether stories and tasks connect to epics, whether epics connect to initiatives, and whether the hierarchy is maintained consistently.`,
    whyItMatters: `Unlinked work breaks the connection between daily tasks and strategic objectives. Leaders cannot see how work contributes to goals, and impact analysis becomes impossible.`,
    whatYouCanDo: `Require parent links during ticket creation. Use bulk operations to link orphaned items. Review unlinked work in backlog grooming sessions.`,
    clusterId: 'dataQuality',
  },

  // =====================
  // Cluster 2: Estimation Health
  // =====================
  {
    key: 'estimationCoverage',
    name: 'Estimation Coverage',
    headline: 'What proportion of work is estimated?',
    summary: 'Measures how much of your work has usable estimates.',
    whatWeMeasure: `We check the percentage of items with story points or time estimates, identify issue types that rarely get estimated, and flag sprints with low estimation coverage.`,
    whyItMatters: `Unestimated work makes velocity unreliable. If half your sprint is tasks without points, your velocity only measures half your work—and forecasts are based on incomplete data.`,
    whatYouCanDo: `Decide which issue types should be estimated and ensure estimates are added during refinement. Track estimation coverage as a health metric.`,
    clusterId: 'estimation',
  },
  {
    key: 'sizingConsistency',
    name: 'Sizing Consistency',
    headline: 'Are estimates reliable and consistent?',
    summary: 'Evaluates whether similar work gets similar estimates.',
    whatWeMeasure: `We look at estimation variance—whether a "3-point story" means the same thing across the team. We also check whether estimates change significantly during work and whether actuals match estimates.`,
    whyItMatters: `Inconsistent estimates undermine forecasting. If estimates vary wildly for similar work, sprint planning is guesswork and stakeholder commitments are unreliable.`,
    whatYouCanDo: `Hold estimation calibration sessions where the team compares past estimates to actuals. Use reference stories as benchmarks for common point values.`,
    clusterId: 'estimation',
  },

  // =====================
  // Cluster 3: Effective Collaboration
  // =====================
  {
    key: 'teamCollaboration',
    name: 'Team Collaboration',
    headline: 'How effectively does the team collaborate in Jira?',
    summary: 'Measures whether work involves discussion and shared contribution.',
    whatWeMeasure: `We look at comment activity, whether issues receive input from multiple people, and whether handoffs include context. Silent tickets that flow from creation to done without discussion are a warning sign.`,
    whyItMatters: `Work without discussion creates silos. When all collaboration happens in Slack or meetings, Jira becomes a passive record. Decisions and context are lost.`,
    whatYouCanDo: `Encourage commenting and @mentions in Jira. Model good behavior by documenting decisions and context on tickets rather than just in conversations.`,
    clusterId: 'collaboration',
  },
  {
    key: 'blockerManagement',
    name: 'Blocker Management',
    headline: 'Are blockers captured and managed effectively?',
    summary: 'Checks whether impediments are visible in Jira.',
    whatWeMeasure: `We look at blocker flag usage, whether blocked items have descriptions explaining the blocker, and whether cross-project dependencies are made visible.`,
    whyItMatters: `Untracked blockers lead to silent delays. When impediments are not visible, the team cannot swarm to resolve them, and managers do not know about risks until it is too late.`,
    whatYouCanDo: `Make flagging blockers part of the culture. Ensure blocked items have explanations. Review blocked items in standup to drive resolution.`,
    clusterId: 'collaboration',
  },
  {
    key: 'collaborationFeatureUsage',
    name: 'Collaboration Feature Usage',
    headline: 'Are we leveraging Jira collaboration features?',
    summary: 'Checks whether linking, @mention, and watcher features are used.',
    whatWeMeasure: `We measure issue link adoption, @mention usage, cross-team coordination, and watcher engagement. These features exist to facilitate collaboration—but only if used.`,
    whyItMatters: `Jira provides tools for making relationships visible, notifying stakeholders, and routing attention. Underused features mean the team is missing collaboration opportunities the tool provides.`,
    whatYouCanDo: `Review which features are underused. Demonstrate the value of linking and @mentions. Consider whether Jira training would help the team use collaboration features more effectively.`,
    clusterId: 'collaboration',
  },
  // Note: collaborationBreadth was merged into teamCollaboration

  // =====================
  // Cluster 4: Jira Efficiency
  // =====================
  {
    key: 'automationOpportunities',
    name: 'Automation Opportunities',
    headline: 'What manual work could be automated?',
    summary: 'Identifies repetitive manual work that could be automated.',
    whatWeMeasure: `We look for patterns suggesting automation opportunities: tickets recreated repeatedly, status updates that could trigger automatically, and manual work that follows predictable patterns.`,
    whyItMatters: `Manual repetitive work wastes capacity and introduces human error. Time spent on Jira busywork is time not spent on actual delivery.`,
    whatYouCanDo: `Review flagged patterns. Consider Jira automation rules for common transitions. Create templates for frequently recreated tickets.`,
    clusterId: 'efficiency',
  },
  {
    key: 'configurationEfficiency',
    name: 'Configuration Efficiency',
    headline: 'Is our Jira setup lean or bloated?',
    summary: 'Checks whether Jira configuration creates unnecessary overhead.',
    whatWeMeasure: `We examine workflow status counts, unused statuses and fields, workflow bypass rates (skipped statuses), and required field load. Configuration complexity has a cost.`,
    whyItMatters: `Over-engineered Jira creates friction. Too many statuses confuse users, unused fields clutter screens, and excessive required fields slow down ticket creation. Every configuration element should earn its place.`,
    whatYouCanDo: `Audit unused statuses and fields—if they are rarely used, consider removing them. Simplify workflows to match how work actually flows. Minimize required fields to true essentials.`,
    clusterId: 'efficiency',
  },

  // =====================
  // Cluster 5: Methodology Support
  // =====================
  {
    key: 'sprintHygiene',
    name: 'Sprint Hygiene',
    headline: 'Are sprint best practices being followed?',
    summary: 'Checks whether sprints have goals, consistent cadence, and clean execution.',
    whatWeMeasure: `We look at sprint goals (are they set?), carryover rates, last-day completion spikes, and cadence consistency. These patterns indicate whether sprints are well-managed.`,
    whyItMatters: `Poor sprint hygiene makes velocity unreliable and planning unpredictable. High carryover means commitments are not met. Last-day spikes suggest rush or gaming.`,
    whatYouCanDo: `Set sprint goals at planning. Track carryover as a team metric. Investigate last-day spikes—are items being rushed or just updated late?`,
    clusterId: 'discipline',
  },
  {
    key: 'backlogDiscipline',
    name: 'Backlog Discipline',
    headline: 'Is the backlog well-maintained and ready for planning?',
    summary: 'Checks backlog freshness, grooming, and sprint-readiness.',
    whatWeMeasure: `We look at backlog staleness (old items), zombie items (untouched for months), sprint-ready coverage (top items have estimates and criteria), and refinement-to-intake ratio.`,
    whyItMatters: `A stale, bloated backlog slows down planning and contains obsolete items. If top items are not sprint-ready, planning sessions become refinement sessions.`,
    whatYouCanDo: `Schedule regular backlog pruning. Close or archive items older than a threshold. Ensure top 20 items always meet definition of ready.`,
    clusterId: 'discipline',
  },
];

// ===========================================
// Helper Functions
// ===========================================

export const getClusterDescription = (clusterId: string): ClusterDescription | undefined => {
  return clusterDescriptions.find(c => c.id === clusterId);
};

export const getDimensionDescription = (dimensionKey: string): DimensionDescription | undefined => {
  return dimensionDescriptions.find(d => d.key === dimensionKey);
};

export const getDimensionsForCluster = (clusterId: string): DimensionDescription[] => {
  return dimensionDescriptions.filter(d => d.clusterId === clusterId);
};

// Map for quick lookup by key
export const dimensionDescriptionsByKey: Record<string, DimensionDescription> =
  dimensionDescriptions.reduce((acc, dim) => {
    acc[dim.key] = dim;
    return acc;
  }, {} as Record<string, DimensionDescription>);

// Map for quick lookup by cluster ID
export const clusterDescriptionsById: Record<string, ClusterDescription> =
  clusterDescriptions.reduce((acc, cluster) => {
    acc[cluster.id] = cluster;
    return acc;
  }, {} as Record<string, ClusterDescription>);
