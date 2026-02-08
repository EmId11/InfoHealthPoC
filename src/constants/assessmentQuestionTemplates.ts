// ============================================
// Assessment Question Templates
// Pre-built questions for querying assessment data
// ============================================

import {
  AssessmentQuestionTemplate,
  AssessmentQuestionCategory,
  AssessmentQueryResult,
  AssessmentQueryColumn,
} from '../types/assessmentReports';
import { AssessmentResult, DimensionResult, IndicatorResult, Recommendation } from '../types/assessment';

// ============================================
// Helper Functions
// ============================================

// Get all indicators from all dimensions
function getAllIndicators(assessment: AssessmentResult): Array<{
  indicator: IndicatorResult;
  dimension: DimensionResult;
  categoryName: string;
}> {
  const results: Array<{
    indicator: IndicatorResult;
    dimension: DimensionResult;
    categoryName: string;
  }> = [];

  for (const dimension of assessment.dimensions) {
    for (const category of dimension.categories) {
      for (const indicator of category.indicators) {
        results.push({
          indicator,
          dimension,
          categoryName: category.name,
        });
      }
    }
  }

  return results;
}

// Get all recommendations from all dimensions
function getAllRecommendations(assessment: AssessmentResult): Array<{
  recommendation: Recommendation;
  dimension: DimensionResult;
}> {
  const results: Array<{
    recommendation: Recommendation;
    dimension: DimensionResult;
  }> = [];

  for (const dimension of assessment.dimensions) {
    for (const rec of dimension.recommendations) {
      results.push({
        recommendation: rec,
        dimension,
      });
    }
  }

  return results;
}

// Standard columns
const DIMENSION_COLUMNS: AssessmentQueryColumn[] = [
  { id: 'dimensionName', label: 'Dimension', type: 'string', sortable: true },
  { id: 'healthScore', label: 'Health Score', type: 'percentage', sortable: true },
  { id: 'riskLevel', label: 'Risk', type: 'riskLevel', sortable: true },
  { id: 'trend', label: 'Trend', type: 'trend', sortable: true },
  { id: 'flaggedIndicators', label: 'Flagged', type: 'number', sortable: true },
];

const INDICATOR_COLUMNS: AssessmentQueryColumn[] = [
  { id: 'indicatorName', label: 'Indicator', type: 'string', sortable: true },
  { id: 'dimensionName', label: 'Dimension', type: 'string', sortable: true },
  { id: 'value', label: 'Value', type: 'string', sortable: false },
  { id: 'benchmarkValue', label: 'Benchmark', type: 'string', sortable: false },
  { id: 'percentile', label: 'Percentile', type: 'percentage', sortable: true },
  { id: 'trend', label: 'Trend', type: 'trend', sortable: true },
];

const RECOMMENDATION_COLUMNS: AssessmentQueryColumn[] = [
  { id: 'title', label: 'Recommendation', type: 'string', sortable: true },
  { id: 'dimensionName', label: 'Dimension', type: 'string', sortable: true },
  { id: 'effort', label: 'Effort', type: 'string', sortable: true },
  { id: 'impact', label: 'Impact', type: 'string', sortable: true },
  { id: 'category', label: 'Category', type: 'string', sortable: true },
];

// ============================================
// Dimension Questions
// ============================================

const dimensionQuestions: AssessmentQuestionTemplate[] = [
  {
    id: 'dim-high-risk',
    question: 'Which dimensions are at highest risk?',
    description: 'Dimensions with high risk or health score below 30',
    category: 'dimensions',
    keywords: ['high', 'risk', 'worst', 'problem', 'concern', 'attention', 'critical'],
    queryFn: (assessment) => {
      const highRisk = assessment.dimensions
        .filter(d => d.riskLevel === 'high' || d.overallPercentile < 25)
        .sort((a, b) => a.overallPercentile - b.overallPercentile);

      return {
        title: 'High Risk Dimensions',
        description: `${highRisk.length} dimension${highRisk.length !== 1 ? 's' : ''} are at high risk`,
        columns: DIMENSION_COLUMNS,
        rows: highRisk.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: highRisk.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'dim-healthy',
    question: 'Which dimensions are healthy?',
    description: 'Dimensions with low risk or health score above 70',
    category: 'dimensions',
    keywords: ['healthy', 'good', 'strong', 'best', 'performing', 'low risk'],
    queryFn: (assessment) => {
      const healthy = assessment.dimensions
        .filter(d => d.riskLevel === 'low' || d.overallPercentile > 75)
        .sort((a, b) => b.overallPercentile - a.overallPercentile);

      return {
        title: 'Healthy Dimensions',
        description: `${healthy.length} dimension${healthy.length !== 1 ? 's' : ''} are healthy`,
        columns: DIMENSION_COLUMNS,
        rows: healthy.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: healthy.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'dim-all',
    question: 'Show all dimensions ranked by health',
    description: 'All dimensions sorted by health score',
    category: 'dimensions',
    keywords: ['all', 'dimensions', 'ranked', 'sorted', 'overview', 'summary'],
    queryFn: (assessment) => {
      const sorted = [...assessment.dimensions]
        .sort((a, b) => a.overallPercentile - b.overallPercentile);

      return {
        title: 'All Dimensions by Health',
        description: `${sorted.length} dimensions in your assessment`,
        columns: DIMENSION_COLUMNS,
        rows: sorted.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: sorted.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'dim-moderate-risk',
    question: 'Which dimensions need monitoring?',
    description: 'Dimensions with moderate risk (health score 30-69)',
    category: 'dimensions',
    keywords: ['moderate', 'watch', 'monitor', 'attention', 'borderline'],
    queryFn: (assessment) => {
      const moderate = assessment.dimensions
        .filter(d => d.riskLevel === 'moderate' || (d.overallPercentile >= 25 && d.overallPercentile <= 75))
        .sort((a, b) => a.overallPercentile - b.overallPercentile);

      return {
        title: 'Dimensions to Monitor',
        description: `${moderate.length} dimension${moderate.length !== 1 ? 's' : ''} at moderate risk`,
        columns: DIMENSION_COLUMNS,
        rows: moderate.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: moderate.length,
        rowClickable: true,
      };
    },
  },
];

// ============================================
// Indicator Questions
// ============================================

const indicatorQuestions: AssessmentQuestionTemplate[] = [
  {
    id: 'ind-flagged',
    question: 'Which indicators need the most attention?',
    description: 'Indicators below 25th benchmark percentile (flagged)',
    category: 'indicators',
    keywords: ['attention', 'flagged', 'worst', 'problem', 'concern', 'low', 'below'],
    queryFn: (assessment) => {
      const allIndicators = getAllIndicators(assessment);
      const flagged = allIndicators
        .filter(({ indicator }) => indicator.benchmarkPercentile < 25)
        .sort((a, b) => a.indicator.benchmarkPercentile - b.indicator.benchmarkPercentile);

      return {
        title: 'Flagged Indicators',
        description: `${flagged.length} indicator${flagged.length !== 1 ? 's' : ''} below benchmark`,
        columns: INDICATOR_COLUMNS,
        rows: flagged.map(({ indicator, dimension }) => ({
          id: `${dimension.dimensionKey}-${indicator.id}`,
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          dimensionName: dimension.dimensionName,
          value: indicator.displayValue,
          benchmarkValue: indicator.benchmarkDisplayValue,
          percentile: indicator.benchmarkPercentile,
          trend: indicator.trend,
        })),
        totalCount: flagged.length,
      };
    },
  },
  {
    id: 'ind-driving-low',
    question: 'What\'s driving my low scores?',
    description: 'Worst performing indicators in high-risk dimensions',
    category: 'indicators',
    keywords: ['driving', 'causing', 'why', 'low', 'scores', 'reason', 'root cause'],
    queryFn: (assessment) => {
      const highRiskDimensions = assessment.dimensions.filter(d => d.riskLevel === 'high');
      const allIndicators = getAllIndicators(assessment);
      const drivers = allIndicators
        .filter(({ dimension, indicator }) =>
          highRiskDimensions.some(hrd => hrd.dimensionKey === dimension.dimensionKey) &&
          indicator.benchmarkPercentile < 50
        )
        .sort((a, b) => a.indicator.benchmarkPercentile - b.indicator.benchmarkPercentile)
        .slice(0, 15);

      return {
        title: 'Indicators Driving Low Scores',
        description: 'Weakest indicators in your highest-risk dimensions',
        columns: INDICATOR_COLUMNS,
        rows: drivers.map(({ indicator, dimension }) => ({
          id: `${dimension.dimensionKey}-${indicator.id}`,
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          dimensionName: dimension.dimensionName,
          value: indicator.displayValue,
          benchmarkValue: indicator.benchmarkDisplayValue,
          percentile: indicator.benchmarkPercentile,
          trend: indicator.trend,
        })),
        totalCount: drivers.length,
      };
    },
  },
  {
    id: 'ind-best',
    question: 'What are my best indicators?',
    description: 'Indicators above 75th benchmark percentile',
    category: 'indicators',
    keywords: ['best', 'top', 'strongest', 'good', 'healthy', 'above'],
    queryFn: (assessment) => {
      const allIndicators = getAllIndicators(assessment);
      const best = allIndicators
        .filter(({ indicator }) => indicator.benchmarkPercentile > 75)
        .sort((a, b) => b.indicator.benchmarkPercentile - a.indicator.benchmarkPercentile);

      return {
        title: 'Best Performing Indicators',
        description: `${best.length} indicator${best.length !== 1 ? 's' : ''} above benchmark`,
        columns: INDICATOR_COLUMNS,
        rows: best.map(({ indicator, dimension }) => ({
          id: `${dimension.dimensionKey}-${indicator.id}`,
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          dimensionName: dimension.dimensionName,
          value: indicator.displayValue,
          benchmarkValue: indicator.benchmarkDisplayValue,
          percentile: indicator.benchmarkPercentile,
          trend: indicator.trend,
        })),
        totalCount: best.length,
      };
    },
  },
];

// ============================================
// Comparison Questions
// ============================================

const comparisonQuestions: AssessmentQuestionTemplate[] = [
  {
    id: 'comp-below-avg',
    question: 'Where am I below average?',
    description: 'Dimensions with health score below 50 (below baseline)',
    category: 'comparison',
    keywords: ['below', 'average', 'worse', 'behind', 'lagging'],
    queryFn: (assessment) => {
      const belowAvg = assessment.dimensions
        .filter(d => d.overallPercentile < 50)
        .sort((a, b) => a.overallPercentile - b.overallPercentile);

      return {
        title: 'Below Average Areas',
        description: `${belowAvg.length} dimension${belowAvg.length !== 1 ? 's' : ''} below baseline (health score < 50)`,
        columns: [
          ...DIMENSION_COLUMNS,
          { id: 'comparison', label: 'vs Similar Teams', type: 'string', sortable: false },
        ],
        rows: belowAvg.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
          comparison: d.benchmarkComparison,
        })),
        totalCount: belowAvg.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'comp-above-avg',
    question: 'Where am I above average?',
    description: 'Dimensions with health score above 50 (above baseline)',
    category: 'comparison',
    keywords: ['above', 'average', 'better', 'ahead', 'leading'],
    queryFn: (assessment) => {
      const aboveAvg = assessment.dimensions
        .filter(d => d.overallPercentile >= 50)
        .sort((a, b) => b.overallPercentile - a.overallPercentile);

      return {
        title: 'Above Average Areas',
        description: `${aboveAvg.length} dimension${aboveAvg.length !== 1 ? 's' : ''} above baseline (health score ≥ 50)`,
        columns: [
          ...DIMENSION_COLUMNS,
          { id: 'comparison', label: 'vs Similar Teams', type: 'string', sortable: false },
        ],
        rows: aboveAvg.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
          comparison: d.benchmarkComparison,
        })),
        totalCount: aboveAvg.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'comp-group-info',
    question: 'What is my comparison group?',
    description: 'Details about the teams you\'re compared against',
    category: 'comparison',
    keywords: ['comparison', 'group', 'teams', 'benchmark', 'peer', 'similar'],
    queryFn: (assessment) => {
      return {
        title: 'Comparison Group',
        description: assessment.comparisonGroupDescription,
        columns: [
          { id: 'property', label: 'Property', type: 'string', sortable: false },
          { id: 'value', label: 'Value', type: 'string', sortable: false },
        ],
        rows: [
          { id: 'count', property: 'Number of Teams', value: String(assessment.comparisonTeamCount) },
          { id: 'criteria', property: 'Criteria', value: assessment.comparisonCriteria.join(', ') },
          { id: 'dateRange', property: 'Date Range', value: `${assessment.dateRange.startDate} to ${assessment.dateRange.endDate}` },
          { id: 'grouping', property: 'Data Grouping', value: assessment.dataGrouping },
        ],
        totalCount: 4,
      };
    },
  },
];

// ============================================
// Trend Questions
// ============================================

const trendQuestions: AssessmentQuestionTemplate[] = [
  {
    id: 'trend-declining',
    question: 'What\'s trending downward?',
    description: 'Dimensions and indicators with declining trends',
    category: 'trends',
    keywords: ['declining', 'downward', 'worse', 'dropping', 'decreasing', 'negative'],
    queryFn: (assessment) => {
      const declining = assessment.dimensions
        .filter(d => d.trend === 'declining')
        .sort((a, b) => a.overallPercentile - b.overallPercentile);

      return {
        title: 'Declining Trends',
        description: `${declining.length} dimension${declining.length !== 1 ? 's' : ''} declining`,
        columns: DIMENSION_COLUMNS,
        rows: declining.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: declining.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'trend-improving',
    question: 'What\'s improving?',
    description: 'Dimensions and indicators with improving trends',
    category: 'trends',
    keywords: ['improving', 'upward', 'better', 'increasing', 'positive', 'growing'],
    queryFn: (assessment) => {
      const improving = assessment.dimensions
        .filter(d => d.trend === 'improving')
        .sort((a, b) => b.overallPercentile - a.overallPercentile);

      return {
        title: 'Improving Trends',
        description: `${improving.length} dimension${improving.length !== 1 ? 's' : ''} improving`,
        columns: DIMENSION_COLUMNS,
        rows: improving.map(d => ({
          id: d.dimensionKey,
          dimensionKey: d.dimensionKey,
          dimensionName: d.dimensionName,
          healthScore: d.healthScore ?? d.overallPercentile,
          riskLevel: d.riskLevel,
          trend: d.trend,
          flaggedIndicators: d.categories.reduce((sum, c) =>
            sum + c.indicators.filter(i => i.benchmarkPercentile < 33).length, 0),
          totalIndicators: d.categories.reduce((sum, c) => sum + c.indicators.length, 0),
        })),
        totalCount: improving.length,
        rowClickable: true,
      };
    },
  },
  {
    id: 'trend-declining-indicators',
    question: 'Which indicators are getting worse?',
    description: 'Specific indicators with declining trends',
    category: 'trends',
    keywords: ['indicators', 'declining', 'worse', 'dropping', 'specific'],
    queryFn: (assessment) => {
      const allIndicators = getAllIndicators(assessment);
      const declining = allIndicators
        .filter(({ indicator }) => indicator.trend === 'declining')
        .sort((a, b) => a.indicator.benchmarkPercentile - b.indicator.benchmarkPercentile);

      return {
        title: 'Declining Indicators',
        description: `${declining.length} indicator${declining.length !== 1 ? 's' : ''} getting worse`,
        columns: INDICATOR_COLUMNS,
        rows: declining.map(({ indicator, dimension }) => ({
          id: `${dimension.dimensionKey}-${indicator.id}`,
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          dimensionName: dimension.dimensionName,
          value: indicator.displayValue,
          benchmarkValue: indicator.benchmarkDisplayValue,
          percentile: indicator.benchmarkPercentile,
          trend: indicator.trend,
        })),
        totalCount: declining.length,
      };
    },
  },
  {
    id: 'trend-improving-indicators',
    question: 'Which indicators are improving?',
    description: 'Specific indicators with improving trends',
    category: 'trends',
    keywords: ['indicators', 'improving', 'better', 'growing', 'specific'],
    queryFn: (assessment) => {
      const allIndicators = getAllIndicators(assessment);
      const improving = allIndicators
        .filter(({ indicator }) => indicator.trend === 'improving')
        .sort((a, b) => b.indicator.benchmarkPercentile - a.indicator.benchmarkPercentile);

      return {
        title: 'Improving Indicators',
        description: `${improving.length} indicator${improving.length !== 1 ? 's' : ''} getting better`,
        columns: INDICATOR_COLUMNS,
        rows: improving.map(({ indicator, dimension }) => ({
          id: `${dimension.dimensionKey}-${indicator.id}`,
          indicatorId: indicator.id,
          indicatorName: indicator.name,
          dimensionName: dimension.dimensionName,
          value: indicator.displayValue,
          benchmarkValue: indicator.benchmarkDisplayValue,
          percentile: indicator.benchmarkPercentile,
          trend: indicator.trend,
        })),
        totalCount: improving.length,
      };
    },
  },
];

// ============================================
// Recommendation Questions
// ============================================

const recommendationQuestions: AssessmentQuestionTemplate[] = [
  {
    id: 'rec-quick-wins',
    question: 'What are quick wins I can tackle?',
    description: 'Low effort, high impact recommendations',
    category: 'recommendations',
    keywords: ['quick', 'wins', 'easy', 'fast', 'low effort', 'high impact', 'simple'],
    queryFn: (assessment) => {
      const allRecs = getAllRecommendations(assessment);
      const quickWins = allRecs
        .filter(({ recommendation }) =>
          recommendation.effort === 'low' &&
          (recommendation.impact === 'high' || recommendation.impact === 'medium')
        );

      return {
        title: 'Quick Wins',
        description: `${quickWins.length} low-effort improvement${quickWins.length !== 1 ? 's' : ''} available`,
        columns: RECOMMENDATION_COLUMNS,
        rows: quickWins.map(({ recommendation, dimension }) => ({
          id: recommendation.id,
          recommendationId: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          dimensionName: dimension.dimensionName,
          effort: recommendation.effort,
          impact: recommendation.impact,
          category: recommendation.category,
        })),
        totalCount: quickWins.length,
      };
    },
  },
  {
    id: 'rec-priority',
    question: 'What should I prioritize?',
    description: 'High impact recommendations regardless of effort',
    category: 'recommendations',
    keywords: ['prioritize', 'priority', 'important', 'focus', 'first', 'top'],
    queryFn: (assessment) => {
      const allRecs = getAllRecommendations(assessment);
      const priority = allRecs
        .filter(({ recommendation }) => recommendation.impact === 'high')
        .sort((a, b) => {
          // Sort by effort: low first, then medium, then high
          const effortOrder = { low: 0, medium: 1, high: 2 };
          return effortOrder[a.recommendation.effort] - effortOrder[b.recommendation.effort];
        });

      return {
        title: 'Priority Recommendations',
        description: `${priority.length} high-impact recommendation${priority.length !== 1 ? 's' : ''}`,
        columns: RECOMMENDATION_COLUMNS,
        rows: priority.map(({ recommendation, dimension }) => ({
          id: recommendation.id,
          recommendationId: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          dimensionName: dimension.dimensionName,
          effort: recommendation.effort,
          impact: recommendation.impact,
          category: recommendation.category,
        })),
        totalCount: priority.length,
      };
    },
  },
  {
    id: 'rec-all',
    question: 'Show all recommendations',
    description: 'All recommendations across all dimensions',
    category: 'recommendations',
    keywords: ['all', 'recommendations', 'suggestions', 'improvements', 'list'],
    queryFn: (assessment) => {
      const allRecs = getAllRecommendations(assessment);

      return {
        title: 'All Recommendations',
        description: `${allRecs.length} recommendation${allRecs.length !== 1 ? 's' : ''} across all dimensions`,
        columns: RECOMMENDATION_COLUMNS,
        rows: allRecs.map(({ recommendation, dimension }) => ({
          id: recommendation.id,
          recommendationId: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          dimensionName: dimension.dimensionName,
          effort: recommendation.effort,
          impact: recommendation.impact,
          category: recommendation.category,
        })),
        totalCount: allRecs.length,
      };
    },
  },
  {
    id: 'rec-by-category',
    question: 'What recommendations exist for process improvements?',
    description: 'Recommendations grouped by category type',
    category: 'recommendations',
    keywords: ['process', 'tooling', 'culture', 'governance', 'category', 'type'],
    queryFn: (assessment) => {
      const allRecs = getAllRecommendations(assessment);
      const byCategory = allRecs.reduce((acc, { recommendation, dimension }) => {
        if (!acc[recommendation.category]) {
          acc[recommendation.category] = [];
        }
        acc[recommendation.category].push({ recommendation, dimension });
        return acc;
      }, {} as Record<string, typeof allRecs>);

      // Return process recommendations (most common category)
      const processRecs = byCategory['process'] || [];

      return {
        title: 'Process Improvement Recommendations',
        description: `${processRecs.length} process-related recommendation${processRecs.length !== 1 ? 's' : ''}`,
        columns: RECOMMENDATION_COLUMNS,
        rows: processRecs.map(({ recommendation, dimension }) => ({
          id: recommendation.id,
          recommendationId: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          dimensionName: dimension.dimensionName,
          effort: recommendation.effort,
          impact: recommendation.impact,
          category: recommendation.category,
        })),
        totalCount: processRecs.length,
      };
    },
  },
];

// ============================================
// Export All Templates
// ============================================

export const ALL_ASSESSMENT_QUESTION_TEMPLATES: AssessmentQuestionTemplate[] = [
  ...dimensionQuestions,
  ...indicatorQuestions,
  ...comparisonQuestions,
  ...trendQuestions,
  ...recommendationQuestions,
];

// ============================================
// Helper Functions
// ============================================

export function getAssessmentQuestionsByCategory(
  category: AssessmentQuestionCategory
): AssessmentQuestionTemplate[] {
  return ALL_ASSESSMENT_QUESTION_TEMPLATES.filter(q => q.category === category);
}

export function getAssessmentQuestionCountByCategory(): Map<AssessmentQuestionCategory, number> {
  const counts = new Map<AssessmentQuestionCategory, number>();

  for (const q of ALL_ASSESSMENT_QUESTION_TEMPLATES) {
    const current = counts.get(q.category) || 0;
    counts.set(q.category, current + 1);
  }

  return counts;
}
