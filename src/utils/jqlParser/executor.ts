// ============================================
// JQL Query Executor
// ============================================

import {
  JQLQuery,
  JQLEntityType,
  ConditionExpr,
  SimpleCondition,
  CrossEntityCondition,
  ComparisonOperator,
  ConditionValue,
  ENTITY_LINKS,
} from './types';
import { parseJQL } from './parser';
import { ExecutionError } from './errors';
import { ReportResults, ReportResultRow, ReportColumnDefinition, getFieldsForEntity } from '../../types/reports';
import { MOCK_TEAMS } from '../reportQueryEngine';
import { MOCK_MY_ASSESSMENTS, MOCK_SHARED_WITH_ME } from '../../constants/mockHomeData';
import { MOCK_MANAGED_USERS } from '../../constants/mockAdminData';
import {
  getMockIssues,
  getMockSprints,
  getMockTeamMetrics,
  getMockSprintMetrics,
} from '../../constants/mockJiraQueryData';
import { MOCK_USER_ACTIVITY, MOCK_OUTCOME_CONFIDENCE } from '../../constants/mockUserActivityData';

// ============================================
// Data Retrieval
// ============================================

function getRawDataForEntity(entityType: JQLEntityType): Record<string, unknown>[] {
  switch (entityType) {
    case 'teams':
      return MOCK_TEAMS.map(t => ({ ...t }));
    case 'assessments':
      return [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME].map(a => ({
        id: a.id,
        assessmentName: a.name,
        teamId: a.teamId,
        teamName: a.teamName,
        status: a.status,
        createdAt: a.createdAt,
        createdByUserId: a.createdByUserId,
        createdByUserName: a.createdByUserName,
      }));
    case 'dimensions':
      return generateMockDimensions();
    case 'indicators':
      return generateMockIndicators();
    case 'users':
      return MOCK_MANAGED_USERS.map(u => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
      }));
    case 'issues':
      return getMockIssues() as unknown as Record<string, unknown>[];
    case 'sprints':
      return getMockSprints() as unknown as Record<string, unknown>[];
    case 'teamMetrics':
      return getMockTeamMetrics() as unknown as Record<string, unknown>[];
    case 'sprintMetrics':
      return getMockSprintMetrics() as unknown as Record<string, unknown>[];
    case 'userActivity':
      return MOCK_USER_ACTIVITY.map(u => ({ ...u }));
    case 'outcomeConfidence':
      return MOCK_OUTCOME_CONFIDENCE.map(oc => ({ ...oc }));
    default:
      return [];
  }
}

function generateMockDimensions(): Record<string, unknown>[] {
  const dimensions: Record<string, unknown>[] = [];
  const allAssessments = [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME];

  allAssessments.forEach(assessment => {
    if (assessment.result?.dimensions) {
      assessment.result.dimensions.forEach(dim => {
        dimensions.push({
          id: `${assessment.id}-${dim.dimensionKey}`,
          teamName: assessment.teamName,
          teamId: assessment.teamId,
          assessmentId: assessment.id,
          assessmentName: assessment.name,
          dimensionKey: dim.dimensionKey,
          dimensionName: dim.dimensionName,
          riskLevel: dim.riskLevel,
          overallPercentile: dim.overallPercentile,
          trend: dim.trend,
        });
      });
    }
  });

  return dimensions;
}

function generateMockIndicators(): Record<string, unknown>[] {
  const indicators: Record<string, unknown>[] = [];
  const allAssessments = [...MOCK_MY_ASSESSMENTS, ...MOCK_SHARED_WITH_ME];

  allAssessments.forEach(assessment => {
    if (assessment.result?.dimensions) {
      assessment.result.dimensions.forEach(dim => {
        dim.categories?.forEach(category => {
          category.indicators?.forEach(indicator => {
            indicators.push({
              id: `${assessment.id}-${dim.dimensionKey}-${indicator.id}`,
              teamName: assessment.teamName,
              teamId: assessment.teamId,
              assessmentId: assessment.id,
              dimensionKey: dim.dimensionKey,
              dimensionName: dim.dimensionName,
              indicatorId: indicator.id,
              indicatorName: indicator.name,
              value: indicator.value,
              benchmarkValue: indicator.benchmarkValue,
              benchmarkPercentile: indicator.benchmarkPercentile,
              trend: indicator.trend,
            });
          });
        });
      });
    }
  });

  return indicators;
}

// ============================================
// Condition Evaluation
// ============================================

function evaluateSimpleCondition(condition: SimpleCondition, row: Record<string, unknown>): boolean {
  const { field, operator, value, secondValue } = condition;
  const fieldValue = row[field];

  // Handle null/undefined field values
  if (fieldValue === null || fieldValue === undefined) {
    if (value === null) {
      return operator === '=' ? true : false;
    }
    return false;
  }

  switch (operator) {
    case '=':
      return compareEqual(fieldValue, value);

    case '!=':
      return !compareEqual(fieldValue, value);

    case '>':
      return compareNumeric(fieldValue, value) > 0;

    case '<':
      return compareNumeric(fieldValue, value) < 0;

    case '>=':
      return compareNumeric(fieldValue, value) >= 0;

    case '<=':
      return compareNumeric(fieldValue, value) <= 0;

    case '~':  // contains
      return containsValue(fieldValue, value);

    case '!~':  // not contains
      return !containsValue(fieldValue, value);

    case 'IN':
      if (Array.isArray(value)) {
        return value.some(v => compareEqual(fieldValue, v));
      }
      return false;

    case 'NOT IN':
      if (Array.isArray(value)) {
        return !value.some(v => compareEqual(fieldValue, v));
      }
      return true;

    case 'BETWEEN':
      if (secondValue !== undefined) {
        const cmp1 = compareNumeric(fieldValue, value);
        const cmp2 = compareNumeric(fieldValue, secondValue);
        return cmp1 >= 0 && cmp2 <= 0;
      }
      return false;

    default:
      return true;
  }
}

function compareEqual(fieldValue: unknown, value: ConditionValue): boolean {
  if (typeof fieldValue === 'string' && typeof value === 'string') {
    return fieldValue.toLowerCase() === value.toLowerCase();
  }
  if (typeof fieldValue === 'boolean') {
    return fieldValue === value;
  }
  return String(fieldValue) === String(value);
}

function compareNumeric(fieldValue: unknown, value: ConditionValue): number {
  const numFieldValue = typeof fieldValue === 'number' ? fieldValue : parseFloat(String(fieldValue));
  const numValue = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(numFieldValue) || isNaN(numValue)) {
    // Fall back to string comparison
    return String(fieldValue).localeCompare(String(value));
  }

  return numFieldValue - numValue;
}

function containsValue(fieldValue: unknown, value: ConditionValue): boolean {
  const strFieldValue = String(fieldValue).toLowerCase();
  const strValue = String(value).toLowerCase();

  // Handle array fields (like labels)
  if (Array.isArray(fieldValue)) {
    return fieldValue.some(v => String(v).toLowerCase().includes(strValue));
  }

  return strFieldValue.includes(strValue);
}

function evaluateCrossEntityCondition(
  condition: CrossEntityCondition,
  baseRow: Record<string, unknown>,
  baseEntity: JQLEntityType
): boolean {
  const { quantifier, relatedEntity, conditions, countOp, countValue } = condition;

  // Get related data
  const relatedData = getRawDataForEntity(relatedEntity);

  // Find linked rows
  const linkKey = `${baseEntity}->${relatedEntity}`;
  const links = ENTITY_LINKS[linkKey] || [];

  const linkedRows = relatedData.filter(relatedRow => {
    // Check if any link matches
    return links.some(link => {
      const baseValue = baseRow[link.from];
      const relatedValue = relatedRow[link.to];
      return baseValue !== undefined && relatedValue !== undefined &&
        String(baseValue).toLowerCase() === String(relatedValue).toLowerCase();
    });
  });

  // Evaluate conditions on linked rows
  const matchingRows = linkedRows.filter(relatedRow =>
    evaluateCondition(conditions, relatedRow, relatedEntity)
  );

  switch (quantifier) {
    case 'HAS':
      return matchingRows.length > 0;

    case 'ALL':
      return linkedRows.length > 0 && matchingRows.length === linkedRows.length;

    case 'COUNT':
      if (countOp && countValue !== undefined) {
        const count = matchingRows.length;
        switch (countOp) {
          case '>': return count > countValue;
          case '<': return count < countValue;
          case '=': return count === countValue;
          case '>=': return count >= countValue;
          case '<=': return count <= countValue;
        }
      }
      return false;

    default:
      return false;
  }
}

function evaluateCondition(
  condition: ConditionExpr,
  row: Record<string, unknown>,
  entity: JQLEntityType
): boolean {
  switch (condition.type) {
    case 'simple':
      return evaluateSimpleCondition(condition, row);

    case 'cross_entity':
      return evaluateCrossEntityCondition(condition, row, entity);

    case 'logical':
      const left = evaluateCondition(condition.left, row, entity);
      const right = evaluateCondition(condition.right, row, entity);
      return condition.operator === 'AND' ? left && right : left || right;

    case 'not':
      return !evaluateCondition(condition.expr, row, entity);

    default:
      return true;
  }
}

// ============================================
// Column Generation
// ============================================

function getColumnsForEntity(entityType: JQLEntityType): ReportColumnDefinition[] {
  const fields = getFieldsForEntity(entityType);
  return fields.map(f => ({
    id: f.id,
    label: f.label,
    type: f.valueType,
    sortable: true,
    filterable: true,
  }));
}

// ============================================
// Query Execution
// ============================================

export interface JQLExecutionResult {
  success: boolean;
  results?: ReportResults;
  error?: string;
}

export function executeJQL(queryString: string): JQLExecutionResult {
  // Parse the query
  const parseResult = parseJQL(queryString);

  if (!parseResult.success || !parseResult.query) {
    return {
      success: false,
      error: parseResult.error?.message || 'Failed to parse query',
    };
  }

  try {
    const results = executeQuery(parseResult.query);
    return { success: true, results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown execution error',
    };
  }
}

export function executeQuery(query: JQLQuery): ReportResults {
  const { entity, pathEntity, where, orderBy, limit, havingCount } = query;

  // Determine which entity's data to return
  const targetEntity = pathEntity || entity;

  // Get raw data for the target entity
  let rows = getRawDataForEntity(targetEntity);

  // If using dot notation, filter to only rows linked to the base entity
  if (pathEntity) {
    const baseRows = getRawDataForEntity(entity);
    const linkKey = `${entity}->${pathEntity}`;
    const links = ENTITY_LINKS[linkKey] || [];

    // Filter pathEntity rows to only those linked to ANY base entity row
    rows = rows.filter(pathRow => {
      return baseRows.some(baseRow => {
        return links.some(link => {
          const baseValue = baseRow[link.from];
          const pathValue = pathRow[link.to];
          return baseValue !== undefined && pathValue !== undefined &&
            String(baseValue).toLowerCase() === String(pathValue).toLowerCase();
        });
      });
    });
  }

  // Apply WHERE conditions
  if (where) {
    rows = rows.filter(row => evaluateCondition(where, row, targetEntity));
  }

  // Apply HAVING COUNT (only for dot notation queries)
  if (pathEntity && havingCount) {
    // Group rows by their link to base entity
    const baseRows = getRawDataForEntity(entity);
    const linkKey = `${entity}->${pathEntity}`;
    const links = ENTITY_LINKS[linkKey] || [];

    // Count how many path rows match each base row
    const baseRowCounts = new Map<string, number>();
    const pathRowsByBase = new Map<string, Set<string>>();

    for (const pathRow of rows) {
      for (const baseRow of baseRows) {
        const baseId = String(baseRow.id || baseRow.teamName || JSON.stringify(baseRow));

        const isLinked = links.some(link => {
          const baseValue = baseRow[link.from];
          const pathValue = pathRow[link.to];
          return baseValue !== undefined && pathValue !== undefined &&
            String(baseValue).toLowerCase() === String(pathValue).toLowerCase();
        });

        if (isLinked) {
          const pathId = String(pathRow.id || JSON.stringify(pathRow));
          if (!pathRowsByBase.has(baseId)) {
            pathRowsByBase.set(baseId, new Set());
          }
          pathRowsByBase.get(baseId)!.add(pathId);
        }
      }
    }

    // Calculate counts
    pathRowsByBase.forEach((pathIds, baseId) => {
      baseRowCounts.set(baseId, pathIds.size);
    });

    // Filter base rows by count condition
    const passingBaseIds = new Set<string>();
    baseRowCounts.forEach((count, baseId) => {
      let passes = false;
      switch (havingCount.operator) {
        case '>': passes = count > havingCount.value; break;
        case '<': passes = count < havingCount.value; break;
        case '=': passes = count === havingCount.value; break;
        case '>=': passes = count >= havingCount.value; break;
        case '<=': passes = count <= havingCount.value; break;
      }
      if (passes) {
        passingBaseIds.add(baseId);
      }
    });

    // Filter path rows to only those linked to passing base rows
    rows = rows.filter(pathRow => {
      for (const baseRow of baseRows) {
        const baseId = String(baseRow.id || baseRow.teamName || JSON.stringify(baseRow));
        if (!passingBaseIds.has(baseId)) continue;

        const isLinked = links.some(link => {
          const baseValue = baseRow[link.from];
          const pathValue = pathRow[link.to];
          return baseValue !== undefined && pathValue !== undefined &&
            String(baseValue).toLowerCase() === String(pathValue).toLowerCase();
        });

        if (isLinked) return true;
      }
      return false;
    });
  }

  // Apply ORDER BY
  if (orderBy) {
    const { field, direction } = orderBy;
    rows.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      let cmp: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal || '').localeCompare(String(bVal || ''));
      }

      return direction === 'DESC' ? -cmp : cmp;
    });
  }

  // Apply LIMIT
  if (limit && limit > 0) {
    rows = rows.slice(0, limit);
  }

  // Transform to result rows
  const resultRows: ReportResultRow[] = rows.map((row, index) => ({
    id: String(row.id || `row-${index}`),
    ...row,
  })) as ReportResultRow[];

  return {
    columns: getColumnsForEntity(targetEntity),
    rows: resultRows,
    totalCount: resultRows.length,
    executedAt: new Date().toISOString(),
  };
}
