// Page Explanation Content
// Centralized content for info modals explaining WHAT each page shows

export interface PageExplanation {
  title: string;
  whatThisShows: string;
  keyMetrics: {
    score: string;
    rating: string;
    trend: string;
  };
  howToUse: string[];
}

// Assessment Results (overall health score)
export const ASSESSMENT_EXPLANATION: PageExplanation = {
  title: 'About Your Health Score',
  whatThisShows:
    'Your Health Score measures your team\'s Jira health across all dimensions. ' +
    'It combines data quality, estimation practices, collaboration patterns, and process discipline ' +
    'into a single score (0-100) where 50 is baseline.',
  keyMetrics: {
    score: 'A number from 0-100 showing your overall Jira health. 50 is baseline, higher is better.',
    rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
    trend: 'Whether your score is improving, declining, or stable compared to previous periods.',
  },
  howToUse: [
    'Use the score to identify if your Jira data needs attention before making important decisions.',
    'Click on individual outcomes to see which business questions your data can answer.',
    'Drill into dimensions to find specific areas that need improvement.',
  ],
};

// Outcome page explanations (keyed by outcome ID)
export const OUTCOME_EXPLANATIONS: Record<string, PageExplanation> = {
  commitments: {
    title: 'About Delivery Commitments',
    whatThisShows:
      'This score measures whether your Jira data supports sprint planning and delivery forecasting. ' +
      'It examines estimation coverage, sizing consistency, and sprint execution patterns to determine if you can ' +
      'confidently answer "what will be delivered when?"',
    keyMetrics: {
      score: 'How well your data supports delivery commitments (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether your ability to make commitments is improving or declining.',
    },
    howToUse: [
      'Low scores suggest estimates may be missing or inconsistent—review estimation practices.',
      'Check the contributing dimensions to find where delivery capability breaks down.',
      'Focus on dimensions with the highest weights first for maximum impact.',
    ],
  },
  progress: {
    title: 'About Progress Tracking',
    whatThisShows:
      'This score measures whether Jira accurately reflects work state for status reporting. ' +
      'It examines data freshness, work capture, and hierarchy completeness to determine if burndowns and dashboards ' +
      'provide an accurate picture.',
    keyMetrics: {
      score: 'How accurately Jira reflects real progress (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether tracking accuracy is improving or declining.',
    },
    howToUse: [
      'If stale data is flagged, encourage more frequent status updates.',
      'Low work capture suggests some work happens outside Jira—investigate shadow work.',
      'Check hierarchy health if portfolio-level rollups show inconsistencies.',
    ],
  },
  productivity: {
    title: 'About Productivity Measurement',
    whatThisShows:
      'This score measures whether your Jira data supports meaningful productivity metrics. ' +
      'It examines work capture, estimation coverage, and sizing consistency to determine if velocity and throughput ' +
      'numbers are accurate.',
    keyMetrics: {
      score: 'How well you can measure team productivity (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether measurement accuracy is improving or declining.',
    },
    howToUse: [
      'Low scores mean velocity numbers may be misleading—focus on improving estimation first.',
      'Check if work is being captured before measuring throughput.',
      'Ensure consistent sizing before comparing productivity across team members.',
    ],
  },
  improvement: {
    title: 'About Continuous Improvement',
    whatThisShows:
      'This score measures whether Jira provides the data needed to identify process bottlenecks and improvement opportunities. ' +
      'It examines sprint hygiene, data freshness, and pattern visibility to determine if retrospectives can be data-driven.',
    keyMetrics: {
      score: 'How useful your Jira data is for process improvement (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether improvement insights are getting clearer or murkier.',
    },
    howToUse: [
      'High scores mean cycle time and velocity trends support improvement decisions.',
      'Check sprint hygiene if retro discussions lack quality data.',
      'Review automation opportunities to identify repetitive manual work.',
    ],
  },
  collaboration: {
    title: 'About Collaboration Effectiveness',
    whatThisShows:
      'This score measures whether your team uses Jira as an active collaboration hub. ' +
      'It examines comment activity, feature usage, and cross-contributor patterns to determine if Jira facilitates teamwork ' +
      'or just serves as a passive task dump.',
    keyMetrics: {
      score: 'How effectively Jira supports team collaboration (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether collaboration patterns are strengthening or weakening.',
    },
    howToUse: [
      'Low scores suggest discussions happen elsewhere—consider moving more coordination into Jira.',
      'Check linking patterns to see if related work is connected.',
      'Review blocker management to see if impediments are surfaced promptly.',
    ],
  },
  portfolio: {
    title: 'About Portfolio Planning',
    whatThisShows:
      'This score measures whether your Jira data supports strategic portfolio decisions. ' +
      'It examines work hierarchy, estimation coverage, and cross-team consistency to determine if data can roll up ' +
      'for executive reporting.',
    keyMetrics: {
      score: 'How well your data supports portfolio-level decisions (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether portfolio data quality is improving or declining.',
    },
    howToUse: [
      'Check hierarchy health first—without proper epic/initiative linking, rollups fail.',
      'Ensure estimation coverage is consistent across teams for capacity planning.',
      'Review issue type consistency for accurate cross-team aggregation.',
    ],
  },
  awareness: {
    title: 'About Risk Detection',
    whatThisShows:
      'This score measures whether Jira helps surface risks and blockers early. ' +
      'It examines blocker flagging, data freshness, and dependency visibility to determine if problems are caught ' +
      'before they become emergencies.',
    keyMetrics: {
      score: 'How effectively Jira surfaces risks early (0-100). 50 is baseline.',
      rating: 'Your health category: Needs Attention, Below Average, Average, Good, or Excellent.',
      trend: 'Whether early warning capabilities are improving or declining.',
    },
    howToUse: [
      'Check blocker management to ensure impediments are flagged promptly.',
      'Review data freshness—stale data hides emerging risks.',
      'Ensure dependencies are linked so impact analysis is possible.',
    ],
  },
};

// Dimension page explanation (generic, supplemented by clusterDescriptions.ts content)
export const DIMENSION_EXPLANATION: PageExplanation = {
  title: 'About This Dimension',
  whatThisShows:
    'Each dimension measures a specific aspect of how your team uses Jira. ' +
    'The health score shows your current state relative to baseline practices, helping you identify areas of strength and opportunity.',
  keyMetrics: {
    score: 'Your health score (0-100) where 50 is baseline. Higher indicates better Jira health.',
    rating: 'The category your score falls into: Excellent (70+), Good (55-69), Average (45-54), Below Average (30-44), Needs Attention (<30).',
    trend: 'Whether this dimension is improving, declining, or stable over time.',
  },
  howToUse: [
    'Review individual indicators to see exactly what is being measured.',
    'Focus on indicators with declining trends or low health scores.',
    'Check which outcomes this dimension affects to understand business impact.',
  ],
};
