// Calculation Explanation Content
// Centralized content explaining HOW scores are calculated

export interface CalculationStep {
  number: number;
  title: string;
  description: string;
}

export interface FormulaComponent {
  value: string;
  label: string;
  weight?: string;
}

export interface CalculationExplanation {
  title: string;
  intro: string;
  formula?: {
    components: FormulaComponent[];
    result: FormulaComponent;
  };
  steps: CalculationStep[];
  additionalInfo?: string;
}

// Assessment (Overall Health Score) calculation
export const ASSESSMENT_CALCULATION: CalculationExplanation = {
  title: 'How Your Health Score is Calculated',
  intro:
    'Your Composite Health Score (CHS) combines three factors: Current State Score (50%), ' +
    'Trajectory Score (35%), and Peer Growth Score (15%).',
  steps: [
    {
      number: 1,
      title: 'Indicators',
      description:
        'We measure 42 specific indicators from your Jira data, each capturing a specific aspect ' +
        'of how your team uses Jira.',
    },
    {
      number: 2,
      title: 'Dimensions',
      description:
        'Related indicators are grouped into 11 dimensions. Each dimension receives a health score ' +
        '(0-100) where 50 represents baseline practices.',
    },
    {
      number: 3,
      title: 'Composite Score',
      description:
        'CSS (50%) measures current health, TRS (35%) rewards consistent improvement, ' +
        'and PGS (15%) compares your growth rate to peers.',
    },
    {
      number: 4,
      title: 'Categories',
      description:
        'Your final score maps to a category: Excellent (70+), Good (55-69), Average (45-54), ' +
        'Below Average (30-44), or Needs Attention (<30).',
    },
  ],
  additionalInfo:
    'Teams with CHS 80+ are already strong. Focus shifts to sustaining health and mentoring others. ' +
    'Scores include a standard error range to account for measurement uncertainty.',
};

// Outcome calculation explanation
export const OUTCOME_CALCULATION: CalculationExplanation = {
  title: 'How Your Outcome Score is Calculated',
  intro:
    'Outcome scores use the Composite Health Score (CHS) methodology, combining Current State (50%), ' +
    'Trajectory (35%), and Peer Growth (15%) from contributing dimensions.',
  steps: [
    {
      number: 1,
      title: 'Current State (CSS)',
      description:
        'Each contributing dimension\'s CSS is weighted by its importance to this outcome. ' +
        'The weighted average becomes the outcome\'s Current State Score.',
    },
    {
      number: 2,
      title: 'Trajectory (TRS)',
      description:
        'Compares early vs recent periods within your assessment. A score above 50 means ' +
        'this outcome is improving; below 50 means declining. Requires 2+ assessment periods.',
    },
    {
      number: 3,
      title: 'Peer Growth (PGS)',
      description:
        'Ranks your improvement rate against teams who started at a similar level. ' +
        'Requires 5+ comparable teams with trajectory data.',
    },
    {
      number: 4,
      title: 'Composite Score',
      description:
        'CHS = 0.50×CSS + 0.35×TRS + 0.15×PGS. The result is a 0-100 score where 50 = baseline, ' +
        'with categories: Excellent (70+), Good (55-69), Average (45-54), Below Average (30-44), Needs Attention (<30).',
    },
  ],
  additionalInfo:
    'If TRS or PGS data is unavailable, the formula adjusts weights automatically. ' +
    'Critical dimension thresholds may cap outcome scores if foundational capabilities are lacking.',
};

// Dimension calculation explanation
export const DIMENSION_CALCULATION: CalculationExplanation = {
  title: 'How Your Dimension Score is Calculated',
  intro:
    'Dimension scores use the Composite Health Score (CHS) methodology: Current State (50%), ' +
    'Trajectory (35%), and Peer Growth (15%). A score of 50 = baseline practices.',
  steps: [
    {
      number: 1,
      title: 'Current State (CSS)',
      description:
        'Indicators are converted to z-scores against baseline norms, weighted by importance, ' +
        'then scaled to 0-100. This measures where you stand right now.',
    },
    {
      number: 2,
      title: 'Trajectory (TRS)',
      description:
        'Compares early vs recent CSS within your assessment period. Above 50 = improving, ' +
        'below 50 = declining. Requires historical data from 2+ periods.',
    },
    {
      number: 3,
      title: 'Peer Growth (PGS)',
      description:
        'Ranks your improvement rate against peers who started at a similar level. ' +
        'Requires 5+ comparable teams with trajectory data.',
    },
    {
      number: 4,
      title: 'Composite Score',
      description:
        'CHS = 0.50×CSS + 0.35×TRS + 0.15×PGS. Categories: Excellent (70+), Good (55-69), ' +
        'Average (45-54), Below Average (30-44), Needs Attention (<30).',
    },
  ],
  additionalInfo:
    'If TRS or PGS is unavailable (first assessment or few peers), the formula adjusts automatically. ' +
    'Teams with CHS 80+ should focus on sustaining health rather than chasing further gains.',
};
