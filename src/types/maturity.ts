/**
 * Unified Maturity Model - CHS Aligned
 *
 * This module defines the central 5-level maturity model used consistently
 * across the entire application for measuring team and dimension health.
 *
 * CHS (Composite Health Score) Thresholds: 70 / 55 / 45 / 30
 *
 * Key Semantic: Score of 50 = "baseline average" (not "satisfactory")
 *
 * Levels:
 * 1. Needs Attention (0-30) - Significantly below baseline, intervention required
 * 2. Below Average (30-45) - Under baseline, needs attention
 * 3. Average (45-55) - Near baseline, stable
 * 4. Good (55-70) - Above baseline with positive direction
 * 5. Excellent (70-100) - Significantly above baseline
 */

/** Maturity level as a numeric value (1-5) */
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

/** Human-readable maturity level names - CHS aligned */
export type MaturityLevelName = 'Needs Attention' | 'Below Average' | 'Average' | 'Good' | 'Excellent';

/** Trend direction indicator */
export type TrendDirection = 'improving' | 'stable' | 'declining';

/** Configuration for a single maturity level */
export interface MaturityLevelConfig {
  /** Numeric level (1-5) */
  level: MaturityLevel;
  /** Human-readable name */
  name: MaturityLevelName;
  /** Minimum percentile (inclusive) */
  minPercentile: number;
  /** Maximum percentile (inclusive) */
  maxPercentile: number;
  /** Primary color for badges, icons */
  color: string;
  /** Background color for cards, banners */
  backgroundColor: string;
  /** Border color for containers */
  borderColor: string;
  /** Brief description of this level */
  description: string;
  /** Longer guidance text */
  guidance: string;
}

/** Complete maturity result with all context */
export interface MaturityResult {
  /** Numeric level (1-5) */
  level: MaturityLevel;
  /** Level configuration with colors and descriptions */
  levelConfig: MaturityLevelConfig;
  /** Original percentile value */
  percentile: number;
  /** Trend direction */
  trend?: TrendDirection;
}

/**
 * The canonical maturity level definitions - CHS aligned.
 * Uses CHS thresholds: 70 / 55 / 45 / 30
 *
 * Key difference from old system:
 * - 50 = baseline average (not "satisfactory")
 * - Asymmetric splits optimized for progress measurement
 */
export const MATURITY_LEVELS: readonly MaturityLevelConfig[] = [
  {
    level: 1,
    name: 'Needs Attention',
    minPercentile: 0,
    maxPercentile: 29,
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    borderColor: '#FFBDAD',
    description: 'Significantly below baseline, intervention required',
    guidance: 'Requires immediate focus. Establish basic processes and capture work consistently.',
  },
  {
    level: 2,
    name: 'Below Average',
    minPercentile: 30,
    maxPercentile: 44,
    color: '#FF8B00',
    backgroundColor: '#FFF7ED',
    borderColor: '#FFE380',
    description: 'Under baseline, needs attention',
    guidance: 'Focus on building stronger practices. Identify and address key gaps.',
  },
  {
    level: 3,
    name: 'Average',
    minPercentile: 45,
    maxPercentile: 54,
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    borderColor: '#DFE1E6',
    description: 'Near baseline, stable performance',
    guidance: 'You have stable practices in place. Look for improvement opportunities.',
  },
  {
    level: 4,
    name: 'Good',
    minPercentile: 55,
    maxPercentile: 69,
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    borderColor: '#79F2C0',
    description: 'Above baseline with positive direction',
    guidance: 'Strong performance! Fine-tune and share best practices with other teams.',
  },
  {
    level: 5,
    name: 'Excellent',
    minPercentile: 70,
    maxPercentile: 100,
    color: '#006644',
    backgroundColor: '#E3FCEF',
    borderColor: '#ABF5D1',
    description: 'Significantly above baseline with strong trajectory',
    guidance: 'Exceptional! Consider mentoring other teams and documenting your approach.',
  },
] as const;

// ============================================================================
// Dimension-Specific Maturity Descriptions
// ============================================================================

/**
 * Contextual descriptions for each maturity level within a specific dimension.
 * Names (Basic, Emerging, etc.) stay the same, but descriptions reflect
 * what that level means for what's being measured.
 */
export type DimensionMaturityDescriptions = Record<MaturityLevel, string>;

/**
 * Dimension-specific descriptions for all 17 dimensions.
 * Each dimension gets 5 descriptions (one per level) that explain
 * what that maturity level means in the context of what's being measured.
 *
 * CHS semantics: Level 3 = "near baseline/stable", not "middle quality tier"
 */
export const DIMENSION_MATURITY_DESCRIPTIONS: Record<string, DimensionMaturityDescriptions> = {
  // Overall Health (aggregate across all dimensions)
  overallHealth: {
    1: 'Critical Jira health issues requiring immediate intervention',
    2: 'Below baseline Jira health with gaps needing attention',
    3: 'Stable Jira health at baseline with room for improvement',
    4: 'Good Jira health above baseline with positive trajectory',
    5: 'Excellent Jira health significantly above baseline',
  },

  // Dimension 1: Invisible Work
  workCaptured: {
    1: 'High risk of significant invisible work not being captured in Jira',
    2: 'Notable gaps in work visibility with inconsistent tracking',
    3: 'Most work is captured but some gaps likely remain',
    4: 'Work is consistently tracked with only minor gaps',
    5: 'Work is comprehensively captured with excellent visibility',
  },

  // Dimension 2: Ticket Readiness
  ticketReadiness: {
    1: 'Issue information is sparse with critical fields missing',
    2: 'Information quality is inconsistent across issues',
    3: 'Most issues have adequate information with some gaps',
    4: 'Issues are well-documented with good detail',
    5: 'Issue information is comprehensive and consistently high-quality',
  },

  // Dimension 3: Estimation Coverage
  estimationCoverage: {
    1: 'Most work items lack estimates',
    2: 'Estimation coverage is inconsistent and patchy',
    3: 'Moderate estimation coverage with some gaps',
    4: 'Good estimation coverage across most work',
    5: 'Comprehensive estimation coverage with few exceptions',
  },

  // Dimension 4: Sizing Consistency
  sizingConsistency: {
    1: 'Sizing is highly inconsistent with large variances',
    2: 'Sizing shows notable inconsistency across similar work',
    3: 'Sizing is moderately consistent with some outliers',
    4: 'Sizing is consistent and predictable',
    5: 'Sizing is highly consistent with excellent calibration',
  },

  // Dimension 5: Issue Type Consistency
  issueTypeConsistency: {
    1: 'Issue types are used inconsistently or incorrectly',
    2: 'Issue type usage has notable inconsistencies',
    3: 'Issue types are mostly used correctly with some exceptions',
    4: 'Issue types are used consistently and appropriately',
    5: 'Issue type usage is exemplary with clear standards',
  },

  // Dimension 6: Data Freshness
  dataFreshness: {
    1: 'Data is stale with infrequent updates',
    2: 'Data freshness is inconsistent with notable lag',
    3: 'Data is reasonably fresh with some delays',
    4: 'Data is kept fresh with regular updates',
    5: 'Data is highly current with real-time accuracy',
  },

  // Dimension 7: Blocker Management
  blockerManagement: {
    1: 'Blockers are poorly tracked and often unresolved',
    2: 'Blocker management is inconsistent and reactive',
    3: 'Blockers are tracked but resolution could improve',
    4: 'Blockers are well-managed with timely resolution',
    5: 'Blocker management is excellent with proactive handling',
  },

  // Dimension 8: Work Hierarchy Linkage
  workHierarchy: {
    1: 'Work hierarchy is poorly linked or missing',
    2: 'Hierarchy linkage is inconsistent with many orphaned items',
    3: 'Most work is linked but gaps exist in the hierarchy',
    4: 'Work hierarchy is well-maintained with good traceability',
    5: 'Work hierarchy is comprehensive with excellent linkage',
  },

  // Dimension 9: Sprint Hygiene
  sprintHygiene: {
    1: 'Sprint hygiene is poor with messy practices',
    2: 'Sprint hygiene has notable issues affecting clarity',
    3: 'Sprint hygiene is adequate but could improve',
    4: 'Sprint hygiene is good with clean practices',
    5: 'Sprint hygiene is excellent with disciplined execution',
  },

  // Dimension 10: Team Collaboration
  teamCollaboration: {
    1: 'Team collaboration is minimal with siloed work',
    2: 'Collaboration is inconsistent and could improve',
    3: 'Moderate team collaboration with room for growth',
    4: 'Good team collaboration with regular engagement',
    5: 'Excellent team collaboration with strong engagement',
  },

  // Dimension 11: Automation Opportunities
  automationOpportunities: {
    1: 'Many automation opportunities are missed',
    2: 'Some automation exists but significant gaps remain',
    3: 'Moderate automation with room for improvement',
    4: 'Good automation adoption reducing manual effort',
    5: 'Excellent automation with optimized workflows',
  },

  // Dimension 12: Collaboration Feature Usage
  collaborationFeatureUsage: {
    1: 'Jira collaboration features are underutilized',
    2: 'Some collaboration features used but inconsistently',
    3: 'Moderate use of collaboration features',
    4: 'Good adoption of collaboration features',
    5: 'Collaboration features are fully leveraged',
  },

  // Note: Dimension 13 (Collaboration Breadth) was merged into Dimension 10 (Team Collaboration)

  // Dimension 14: Configuration Efficiency
  configurationEfficiency: {
    1: 'Jira configuration is bloated with unnecessary complexity',
    2: 'Configuration has notable overhead and unused elements',
    3: 'Configuration is adequate but has room for simplification',
    4: 'Configuration is efficient with minimal overhead',
    5: 'Configuration is streamlined and optimally efficient',
  },

  // Dimension 16: Backlog Discipline
  backlogDiscipline: {
    1: 'Backlog is neglected with stale and obsolete items',
    2: 'Backlog health is inconsistent with some neglect',
    3: 'Backlog is moderately maintained',
    4: 'Backlog is well-maintained and healthy',
    5: 'Backlog is excellently maintained with great hygiene',
  },

  // ============================================================================
  // Cluster (Theme) Maturity Descriptions
  // ============================================================================

  // Cluster: Data Quality & Completeness
  dataQuality: {
    1: 'Jira data has critical gaps affecting reliability and decision-making',
    2: 'Data quality is inconsistent with notable completeness issues',
    3: 'Data is reasonably complete with some quality gaps to address',
    4: 'Data quality is good with consistent completeness across most areas',
    5: 'Excellent data quality with comprehensive and accurate information',
  },

  // Cluster: Estimation Health
  estimation: {
    1: 'Estimation practices are unreliable or largely absent',
    2: 'Estimation has significant gaps and inconsistencies',
    3: 'Estimation is moderately reliable with room for improvement',
    4: 'Estimation practices are consistent and dependable',
    5: 'Estimation is highly reliable with excellent calibration',
  },

  // Cluster: Effective Collaboration
  collaboration: {
    1: 'Collaboration through Jira is minimal - mostly isolated work',
    2: 'Collaboration is inconsistent with limited team engagement',
    3: 'Moderate collaboration with some team interaction patterns',
    4: 'Good collaboration with regular team engagement in Jira',
    5: 'Excellent collaboration with Jira as a true teamwork hub',
  },

  // Cluster: Jira Efficiency
  efficiency: {
    1: 'Jira setup creates significant overhead and wasted effort',
    2: 'Notable inefficiencies in Jira configuration and usage',
    3: 'Moderate efficiency with some optimization opportunities',
    4: 'Efficient Jira setup with minimal unnecessary overhead',
    5: 'Highly optimized Jira configuration maximizing productivity',
  },

  // Cluster: Methodology Support
  discipline: {
    1: 'Jira practices poorly support your chosen methodology',
    2: 'Methodology support is inconsistent with notable gaps',
    3: 'Moderate methodology adherence with room for improvement',
    4: 'Good methodology support with disciplined practices',
    5: 'Excellent methodology alignment with exemplary discipline',
  },
};

/**
 * Get the contextual description for a maturity level in a specific dimension.
 * Falls back to the default generic description if dimension not found.
 *
 * @param level - Maturity level (1-5)
 * @param dimensionKey - Optional dimension key for contextual description
 * @returns Description string
 */
export function getDimensionDescription(level: MaturityLevel, dimensionKey?: string): string {
  if (dimensionKey && DIMENSION_MATURITY_DESCRIPTIONS[dimensionKey]) {
    return DIMENSION_MATURITY_DESCRIPTIONS[dimensionKey][level];
  }
  // Fall back to default description
  return MATURITY_LEVELS[level - 1].description;
}

/**
 * Get the maturity level configuration for a given percentile.
 *
 * @param percentile - Value from 0-100
 * @returns The matching MaturityLevelConfig
 */
export function getMaturityLevelConfig(percentile: number): MaturityLevelConfig {
  // Clamp percentile to valid range
  const clampedPercentile = Math.max(0, Math.min(100, percentile));

  // Find matching level
  const config = MATURITY_LEVELS.find(
    level => clampedPercentile >= level.minPercentile && clampedPercentile <= level.maxPercentile
  );

  // Should always find a match, but default to Basic if not
  return config || MATURITY_LEVELS[0];
}

/**
 * Get the maturity level number (1-5) for a given percentile.
 *
 * @param percentile - Value from 0-100
 * @returns MaturityLevel (1-5)
 */
export function getMaturityLevel(percentile: number): MaturityLevel {
  return getMaturityLevelConfig(percentile).level;
}

/**
 * Get the maturity level name for a given percentile.
 *
 * @param percentile - Value from 0-100
 * @returns MaturityLevelName
 */
export function getMaturityLevelName(percentile: number): MaturityLevelName {
  return getMaturityLevelConfig(percentile).name;
}

/**
 * Get complete maturity result for a percentile.
 *
 * @param percentile - Value from 0-100
 * @param trend - Optional trend direction
 * @returns Complete MaturityResult
 */
export function getMaturityResult(percentile: number, trend?: TrendDirection): MaturityResult {
  const levelConfig = getMaturityLevelConfig(percentile);
  return {
    level: levelConfig.level,
    levelConfig,
    percentile,
    trend,
  };
}

/**
 * Get trend configuration for display.
 */
export function getTrendConfig(trend: TrendDirection): {
  label: string;
  icon: string;
  color: string;
} {
  switch (trend) {
    case 'improving':
      return { label: 'Improving', icon: 'improving', color: '#36B37E' };
    case 'declining':
      return { label: 'Declining', icon: 'declining', color: '#DE350B' };
    case 'stable':
    default:
      return { label: 'Stable', icon: 'stable', color: '#6B778C' };
  }
}

/**
 * Compare maturity levels for sorting.
 * Lower levels (Basic=1) come first as higher priority.
 *
 * @param a - First maturity level
 * @param b - Second maturity level
 * @returns Negative if a should come first, positive if b should come first
 */
export function compareMaturityLevels(a: MaturityLevel, b: MaturityLevel): number {
  return a - b;
}

/**
 * Compare by maturity level first, then by trend (declining > stable > improving).
 * Used for priority ordering of recommendations.
 */
export function compareMaturityPriority(
  a: { level: MaturityLevel; trend?: TrendDirection },
  b: { level: MaturityLevel; trend?: TrendDirection }
): number {
  // First compare by maturity level (lower = higher priority)
  const levelDiff = a.level - b.level;
  if (levelDiff !== 0) return levelDiff;

  // Then by trend (declining = higher priority)
  const trendPriority: Record<TrendDirection, number> = {
    declining: 0,
    stable: 1,
    improving: 2,
  };

  const aTrendPriority = a.trend ? trendPriority[a.trend] : 1;
  const bTrendPriority = b.trend ? trendPriority[b.trend] : 1;

  return aTrendPriority - bTrendPriority;
}

// ============================================================================
// Backwards Compatibility Helpers
// ============================================================================

/** @deprecated Use MaturityLevel instead */
export type LegacyRiskLevel = 'low' | 'moderate' | 'high';

/**
 * Convert legacy RiskLevel to MaturityLevel.
 * @deprecated Use getMaturityLevel() with percentile instead
 */
export function riskLevelToMaturity(riskLevel: LegacyRiskLevel): MaturityLevel {
  switch (riskLevel) {
    case 'low':
      return 4; // Advanced
    case 'moderate':
      return 3; // Established
    case 'high':
      return 2; // Emerging
    default:
      return 3; // Default to Established
  }
}

/**
 * Convert MaturityLevel back to legacy RiskLevel (for compatibility).
 * @deprecated Use maturity level directly
 */
export function maturityToRiskLevel(level: MaturityLevel): LegacyRiskLevel {
  if (level >= 4) return 'low';
  if (level >= 3) return 'moderate';
  return 'high';
}
