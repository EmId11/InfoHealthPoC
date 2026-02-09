// Methodology content configuration for all 11 dimensions
// Used by GenericMethodologyExplainer to display dimension-specific content

export interface MethodologyCategory {
  name: string;
  shortName: string;
  description: string;
  color: string;
  bgColor: string;
  indicatorCount: number;
  examples: string[];
}

export interface DimensionMethodologyContent {
  dimensionNumber: number;
  dimensionName: string;
  modalTitle: string;
  modalSubtitle: string;
  keyQuestion: string;
  overviewText: string;
  totalIndicatorCount: number;
  categories: MethodologyCategory[];
}

// ============================================
// Dimension 1: Invisible Work
// ============================================
export const dimension1Content: DimensionMethodologyContent = {
  dimensionNumber: 1,
  dimensionName: 'Invisible Work',
  modalTitle: 'How We Detect Invisible Work',
  modalSubtitle: 'Our statistical approach to measuring risk',
  keyQuestion: 'Is all the work captured in Jira?',
  overviewText: 'We analyze <strong>17 Jira indicators</strong> that correlate with invisible work, then compare your team against similar teams to identify <strong>relative risk levels</strong>. This comparison-based approach highlights where your team may need attention.',
  totalIndicatorCount: 17,
  categories: [
    {
      name: 'Unexplained Variability',
      shortName: 'Dark Matter',
      description: 'High variability without corresponding demand changes suggests work is entering/exiting outside Jira',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 7,
      examples: ['Throughput swings', 'Cycle time spikes', 'Member output variability'],
    },
    {
      name: 'Infrequent Tool Use',
      shortName: 'Tool Use',
      description: 'Stale items and infrequent updates indicate the team isn\'t using Jira as their source of truth',
      color: '#974F0C',
      bgColor: '#FFFAE6',
      indicatorCount: 7,
      examples: ['Aging items', 'Bulk status changes', 'Low update frequency'],
    },
    {
      name: 'Work Intake Process',
      shortName: 'Front Door',
      description: 'Work appearing without proper intake suggests side-channels bypassing the official process',
      color: '#006644',
      bgColor: '#E3FCEF',
      indicatorCount: 3,
      examples: ['Mid-sprint additions', 'Siloed work items', 'Split capacity'],
    },
  ],
};

// ============================================
// Dimension 2: Ticket Readiness
// ============================================
export const dimension2Content: DimensionMethodologyContent = {
  dimensionNumber: 2,
  dimensionName: 'Ticket Readiness',
  modalTitle: 'How We Measure Ticket Readiness',
  modalSubtitle: 'Assessing the completeness and quality of ticket data',
  keyQuestion: 'Do your tickets have the information needed for planning?',
  overviewText: 'We analyze <strong>14 Jira indicators</strong> that measure whether your tickets contain sufficient information for effective planning and execution. Complete, well-refined tickets lead to better estimates and fewer surprises.',
  totalIndicatorCount: 14,
  categories: [
    {
      name: 'Field Completeness',
      shortName: 'Availability',
      description: 'Measures whether critical fields are populated before work begins',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 6,
      examples: ['Missing descriptions', 'No acceptance criteria', 'Empty estimates'],
    },
    {
      name: 'Refinement Quality',
      shortName: 'Readiness',
      description: 'Measures whether work is properly prepared before development begins',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 5,
      examples: ['Late refinement', 'High carryover', 'Frequent re-opens'],
    },
    {
      name: 'Priority Effectiveness',
      shortName: 'Prioritisation',
      description: 'Measures whether priority labels actually predict delivery order',
      color: '#974F0C',
      bgColor: '#FFFAE6',
      indicatorCount: 3,
      examples: ['Priority drift', 'Delivery order mismatch', 'Priority inflation'],
    },
  ],
};

// ============================================
// Dimension 3: Estimation Coverage
// ============================================
export const dimension3Content: DimensionMethodologyContent = {
  dimensionNumber: 3,
  dimensionName: 'Estimation Coverage',
  modalTitle: 'How We Measure Estimation Coverage',
  modalSubtitle: 'Evaluating how much of your work is estimated',
  keyQuestion: 'What proportion of work has usable estimates?',
  overviewText: 'We analyze <strong>3 Jira indicators</strong> that measure estimation coverage. Before assessing estimate quality, you need to know how much of your work is even estimated and usable for planning.',
  totalIndicatorCount: 3,
  categories: [
    {
      name: 'Estimation Coverage',
      shortName: 'Coverage',
      description: 'What proportion of your work is estimated and usable for planning?',
      color: '#974F0C',
      bgColor: '#FFFAE6',
      indicatorCount: 3,
      examples: ['Unestimated stories', 'Task-heavy sprints', 'Velocity blind spots'],
    },
  ],
};

// ============================================
// Dimension 4: Sizing Consistency
// ============================================
export const dimension4Content: DimensionMethodologyContent = {
  dimensionNumber: 4,
  dimensionName: 'Sizing Consistency',
  modalTitle: 'How We Measure Sizing Consistency',
  modalSubtitle: 'Evaluating estimate quality and work size patterns',
  keyQuestion: 'Are your estimates reliable and consistent?',
  overviewText: 'We analyze <strong>10 Jira indicators</strong> that measure estimation quality and size consistency. Inconsistent estimates and variable work sizes make velocity meaningless and forecasts unreliable.',
  totalIndicatorCount: 10,
  categories: [
    {
      name: 'Estimate Quality & Reliability',
      shortName: 'Quality',
      description: 'For work that IS estimated, how consistent and reliable are those estimates?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 6,
      examples: ['Estimation variance', 'Lost original estimates', 'Poor calibration'],
    },
    {
      name: 'Size Consistency',
      shortName: 'Consistency',
      description: 'For work you DON\'T estimate, are actual sizes consistent enough for forecasting?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 4,
      examples: ['Variable task durations', 'Unpredictable bug sizes', 'Size outliers'],
    },
  ],
};

// ============================================
// Dimension 5: Issue Type Consistency
// ============================================
export const dimension5Content: DimensionMethodologyContent = {
  dimensionNumber: 5,
  dimensionName: 'Issue Type Consistency',
  modalTitle: 'How We Measure Issue Type Consistency',
  modalSubtitle: 'Evaluating how consistently issue types are used',
  keyQuestion: 'Are issue types used consistently across the team?',
  overviewText: 'We analyze <strong>6 Jira indicators</strong> that measure issue type usage patterns. Inconsistent issue type usage makes metrics unreliable and prevents meaningful comparison across teams.',
  totalIndicatorCount: 6,
  categories: [
    {
      name: 'Issue Type Usage Patterns',
      shortName: 'Issue Type Consistency',
      description: 'How consistently do you use different issue types?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 6,
      examples: ['Type inconsistency', 'Misclassified work', 'Workflow mismatches'],
    },
  ],
};

// ============================================
// Dimension 6: Data Freshness
// ============================================
export const dimension6Content: DimensionMethodologyContent = {
  dimensionNumber: 6,
  dimensionName: 'Data Freshness',
  modalTitle: 'How We Measure Data Freshness',
  modalSubtitle: 'Evaluating how current your Jira data is',
  keyQuestion: 'Does your Jira reflect the current state of work?',
  overviewText: 'We analyze <strong>7 Jira indicators</strong> that measure data freshness and staleness. Stale data leads to inaccurate reporting, missed dependencies, and poor decision-making.',
  totalIndicatorCount: 7,
  categories: [
    {
      name: 'Data Freshness & Staleness',
      shortName: 'Data Freshness',
      description: 'Does the data in Jira represent an up-to-date view of the work?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 7,
      examples: ['Stale work items', 'Bulk updates', 'Parent-child sync gaps'],
    },
  ],
};

// ============================================
// Dimension 7: Blocker Management
// ============================================
export const dimension7Content: DimensionMethodologyContent = {
  dimensionNumber: 7,
  dimensionName: 'Blocker Management',
  modalTitle: 'How We Measure Blocker Management',
  modalSubtitle: 'Evaluating how effectively blockers are tracked',
  keyQuestion: 'How effectively are blockers captured and managed?',
  overviewText: 'We analyze <strong>6 Jira indicators</strong> that measure blocker and impediment tracking. Untracked blockers lead to silent delays, missed dependencies, and reduced team velocity.',
  totalIndicatorCount: 6,
  categories: [
    {
      name: 'Blocker & Impediment Tracking',
      shortName: 'Blocker Management',
      description: 'How effectively do you capture and manage blockers in Jira?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 6,
      examples: ['Low blocker ratio', 'Missing descriptions', 'Cross-project visibility'],
    },
  ],
};

// ============================================
// Dimension 8: Work Hierarchy Linkage
// ============================================
export const dimension8Content: DimensionMethodologyContent = {
  dimensionNumber: 8,
  dimensionName: 'Work Hierarchy Linkage',
  modalTitle: 'How We Measure Work Hierarchy',
  modalSubtitle: 'Evaluating how well work connects to strategic goals',
  keyQuestion: 'Is work connected from tasks to epics and initiatives?',
  overviewText: 'We analyze <strong>4 Jira indicators</strong> that measure work hierarchy and linkage. Unlinked work items break the connection between daily tasks and strategic objectives.',
  totalIndicatorCount: 4,
  categories: [
    {
      name: 'Work Hierarchy & Linkage',
      shortName: 'Work Hierarchy',
      description: 'How well is work connected from tasks up to epics and initiatives?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 4,
      examples: ['Unlinked stories', 'Orphaned tasks', 'Roadmap gaps'],
    },
  ],
};

// ============================================
// Dimension 9: Sprint Hygiene
// ============================================
export const dimension9Content: DimensionMethodologyContent = {
  dimensionNumber: 9,
  dimensionName: 'Sprint Hygiene',
  modalTitle: 'How We Measure Sprint Hygiene',
  modalSubtitle: 'Evaluating sprint management practices',
  keyQuestion: 'How well does your team follow sprint best practices?',
  overviewText: 'We analyze <strong>8 Jira indicators</strong> that measure sprint practices and hygiene. Poor sprint hygiene makes velocity unreliable and planning unpredictable.',
  totalIndicatorCount: 8,
  categories: [
    {
      name: 'Sprint Practices & Hygiene',
      shortName: 'Sprint Hygiene',
      description: 'How well does your team maintain healthy sprint practices?',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 8,
      examples: ['Missing goals', 'High carryover', 'Last-day spikes', 'Cadence drift'],
    },
  ],
};

// ============================================
// Dimension 10: Team Collaboration
// ============================================
export const dimension10Content: DimensionMethodologyContent = {
  dimensionNumber: 10,
  dimensionName: 'Team Collaboration',
  modalTitle: 'How We Measure Team Collaboration',
  modalSubtitle: 'Evaluating collaboration patterns in Jira',
  keyQuestion: 'How effectively does the team collaborate in Jira?',
  overviewText: 'We analyze <strong>7 Jira indicators</strong> that measure team collaboration patterns. Poor collaboration in Jira leads to knowledge silos and communication gaps.',
  totalIndicatorCount: 7,
  categories: [
    {
      name: 'Team Collaboration',
      shortName: 'Collaboration',
      description: 'Indicators measuring how effectively the team uses Jira for collaboration and communication',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 7,
      examples: ['No comments', 'Siloed work', 'Poor documentation', 'Stale carryover'],
    },
  ],
};

// ============================================
// Dimension 11: Automation Opportunities
// ============================================
export const dimension11Content: DimensionMethodologyContent = {
  dimensionNumber: 11,
  dimensionName: 'Automation Opportunities',
  modalTitle: 'How We Identify Automation Opportunities',
  modalSubtitle: 'Finding repetitive work that could be automated',
  keyQuestion: 'What manual work could be automated?',
  overviewText: 'We analyze <strong>5 Jira indicators</strong> that identify automation opportunities. Manual repetitive work wastes capacity and introduces human error.',
  totalIndicatorCount: 5,
  categories: [
    {
      name: 'Repetitive Work',
      shortName: 'Repetitive',
      description: 'Identifying repetitive manual work that could be automated',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 1,
      examples: ['Recreating tickets', 'Copy-paste patterns'],
    },
    {
      name: 'Automatic Status Updates',
      shortName: 'Auto Status',
      description: 'Status updates that could be automated based on rules',
      color: '#BF2600',
      bgColor: '#FFEBE6',
      indicatorCount: 4,
      examples: ['Child completion triggers', 'Delayed status updates', 'Epic closure gaps'],
    },
  ],
};

// ============================================
// Dimension 12: Collaboration Feature Usage
// ============================================
export const dimension12Content: DimensionMethodologyContent = {
  dimensionNumber: 12,
  dimensionName: 'Collaboration Feature Usage',
  modalTitle: 'How We Measure Collaboration Feature Usage',
  modalSubtitle: 'Assessing adoption of Jira collaboration features',
  keyQuestion: 'Are we leveraging Jira collaboration features?',
  overviewText: 'We analyze <strong>7 Jira indicators</strong> that measure whether teams are using Jira\'s built-in collaboration features—links, comments, @mentions, and watchers—to facilitate teamwork and make relationships visible.',
  totalIndicatorCount: 7,
  categories: [
    {
      name: 'Feature Adoption',
      shortName: 'Adoption',
      description: 'Measures whether teams are using Jira\'s collaboration features',
      color: '#0747A6',
      bgColor: '#DEEBFF',
      indicatorCount: 7,
      examples: ['Link adoption', 'Comment engagement', '@mention usage', 'Watcher engagement'],
    },
  ],
};

// ============================================
// Dimension 13: Collaboration Breadth
// ============================================
export const dimension13Content: DimensionMethodologyContent = {
  dimensionNumber: 13,
  dimensionName: 'Collaboration Breadth',
  modalTitle: 'How We Measure Collaboration Breadth',
  modalSubtitle: 'Assessing whether work is collaborative or siloed',
  keyQuestion: 'Is work collaborative or siloed?',
  overviewText: 'We analyze <strong>5 Jira indicators</strong> that measure whether work items receive input from multiple people through Jira, or whether they flow through individuals without collaboration.',
  totalIndicatorCount: 5,
  categories: [
    {
      name: 'Multi-Contributor Patterns',
      shortName: 'Breadth',
      description: 'Measures whether work involves multiple people or flows through silos',
      color: '#0747A6',
      bgColor: '#DEEBFF',
      indicatorCount: 5,
      examples: ['Single-contributor work', 'Epic collaboration', 'Handoff documentation', 'Review engagement'],
    },
  ],
};

// ============================================
// Dimension 14: Configuration Efficiency
// ============================================
export const dimension14Content: DimensionMethodologyContent = {
  dimensionNumber: 14,
  dimensionName: 'Configuration Efficiency',
  modalTitle: 'How We Measure Configuration Efficiency',
  modalSubtitle: 'Assessing whether Jira configuration creates unnecessary overhead',
  keyQuestion: 'Is our Jira setup lean or bloated?',
  overviewText: 'We analyze <strong>7 Jira indicators</strong> that examine workflow complexity, unused configuration, and repetitive manual work. Every configuration element has a cost—we help you identify where simplification would help.',
  totalIndicatorCount: 7,
  categories: [
    {
      name: 'Configuration Overhead',
      shortName: 'Overhead',
      description: 'Measures workflow complexity and unused configuration',
      color: '#FF991F',
      bgColor: '#FFF0B3',
      indicatorCount: 4,
      examples: ['Status count', 'Unused statuses', 'Workflow bypasses', 'Required fields'],
    },
    {
      name: 'Repetitive Patterns',
      shortName: 'Patterns',
      description: 'Identifies repetitive work that could be templated or automated',
      color: '#FF991F',
      bgColor: '#FFF0B3',
      indicatorCount: 3,
      examples: ['Empty optional fields', 'Duplicate tickets', 'Manual transitions'],
    },
  ],
};

// ============================================
// Dimension 15: Backlog Discipline
// ============================================
export const dimension15Content: DimensionMethodologyContent = {
  dimensionNumber: 15,
  dimensionName: 'Backlog Discipline',
  modalTitle: 'How We Measure Backlog Discipline',
  modalSubtitle: 'Assessing backlog health and readiness',
  keyQuestion: 'Is the backlog well-maintained and ready for planning?',
  overviewText: 'We analyze <strong>8 Jira indicators</strong> that measure backlog freshness, grooming cadence, and sprint-readiness. A healthy backlog is the foundation of effective planning.',
  totalIndicatorCount: 8,
  categories: [
    {
      name: 'Backlog Health',
      shortName: 'Health',
      description: 'Measures backlog staleness and bloat',
      color: '#00875A',
      bgColor: '#E3FCEF',
      indicatorCount: 4,
      examples: ['Staleness distribution', 'Depth ratio', 'Zombie items', 'Pruning rate'],
    },
    {
      name: 'Refinement Practices',
      shortName: 'Refinement',
      description: 'Measures how well refinement keeps up with intake',
      color: '#00875A',
      bgColor: '#E3FCEF',
      indicatorCount: 4,
      examples: ['Sprint-ready coverage', 'Refinement lag', 'Priority stability', 'Refinement ratio'],
    },
  ],
};

// ============================================
// Lookup map for getting content by dimension number
// ============================================
export const methodologyContentByDimension: Record<number, DimensionMethodologyContent> = {
  1: dimension1Content,
  2: dimension2Content,
  3: dimension3Content,
  4: dimension4Content,
  5: dimension5Content,
  6: dimension6Content,
  7: dimension7Content,
  8: dimension8Content,
  9: dimension9Content,
  10: dimension10Content,
  11: dimension11Content,
  // New dimensions (Dim 13 merged into Dim 10)
  12: dimension12Content,
  14: dimension14Content,
  15: dimension15Content,
};

// Lookup by dimension key
export const methodologyContentByKey: Record<string, DimensionMethodologyContent> = {
  workCaptured: dimension1Content,
  ticketReadiness: dimension2Content,
  estimationCoverage: dimension3Content,
  sizingConsistency: dimension4Content,
  issueTypeConsistency: dimension5Content,
  dataFreshness: dimension6Content,
  blockerManagement: dimension7Content,
  workHierarchy: dimension8Content,
  sprintHygiene: dimension9Content,
  teamCollaboration: dimension10Content,
  automationOpportunities: dimension11Content,
  // New dimensions (collaborationBreadth merged into teamCollaboration)
  collaborationFeatureUsage: dimension12Content,
  configurationEfficiency: dimension14Content,
  backlogDiscipline: dimension15Content,
};

export const getMethodologyContent = (dimensionNumber: number): DimensionMethodologyContent | undefined => {
  return methodologyContentByDimension[dimensionNumber];
};

export const getMethodologyContentByKey = (dimensionKey: string): DimensionMethodologyContent | undefined => {
  return methodologyContentByKey[dimensionKey];
};
