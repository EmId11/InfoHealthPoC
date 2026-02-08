// ============================================
// JQL Parser Types
// ============================================

import { QueryEntityType } from '../../types/reports';

// ============================================
// Token Types
// ============================================

export type TokenType =
  | 'ENTITY'      // Teams, Issues, Sprints, etc.
  | 'KEYWORD'     // WHERE, AND, OR, HAS, WITH, ALL, HAVE, COUNT, ORDER, BY, LIMIT, ASC, DESC, BETWEEN, IN, NOT, TRUE, FALSE, HAVING
  | 'IDENTIFIER'  // Field names
  | 'OPERATOR'    // =, !=, >, <, >=, <=, ~, !~
  | 'STRING'      // "value" or 'value'
  | 'NUMBER'      // 123, 45.6, -7d (relative dates)
  | 'LPAREN'      // (
  | 'RPAREN'      // )
  | 'COMMA'       // ,
  | 'DOT'         // . (for dot notation like Teams.dimensions)
  | 'EOF'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
  length: number;
}

// ============================================
// Entity Types (subset that can be queried)
// ============================================

export type JQLEntityType = QueryEntityType;

export const ENTITY_NAMES: Record<string, JQLEntityType> = {
  'teams': 'teams',
  'team': 'teams',
  'assessments': 'assessments',
  'assessment': 'assessments',
  'dimensions': 'dimensions',
  'dimension': 'dimensions',
  'indicators': 'indicators',
  'indicator': 'indicators',
  'users': 'users',
  'user': 'users',
  'issues': 'issues',
  'issue': 'issues',
  'sprints': 'sprints',
  'sprint': 'sprints',
  'teammetrics': 'teamMetrics',
  'sprintmetrics': 'sprintMetrics',
  'useractivity': 'userActivity',
  'outcomeconfidence': 'outcomeConfidence',
};

// ============================================
// Keywords
// ============================================

export const KEYWORDS = new Set([
  'WHERE', 'AND', 'OR', 'NOT',
  'HAS', 'WITH', 'ALL', 'HAVE', 'COUNT',
  'ORDER', 'BY', 'LIMIT',
  'ASC', 'DESC',
  'BETWEEN', 'IN',
  'TRUE', 'FALSE',
  'LIKE', 'IS', 'NULL',
  'HAVING',  // For dot notation: Teams.dimensions WHERE ... HAVING COUNT > 2
]);

// ============================================
// AST Node Types
// ============================================

export interface JQLQuery {
  entity: JQLEntityType;          // Base entity (e.g., "teams" in "Teams.dimensions")
  pathEntity?: JQLEntityType;     // Related entity via dot notation (e.g., "dimensions" in "Teams.dimensions")
  where?: ConditionExpr;
  orderBy?: OrderByClause;
  limit?: number;
  havingCount?: {                 // For HAVING COUNT > N syntax
    operator: '>' | '<' | '=' | '>=' | '<=';
    value: number;
  };
}

export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC';
}

// ============================================
// Condition Expressions
// ============================================

export type ConditionExpr =
  | SimpleCondition
  | CrossEntityCondition
  | LogicalExpr
  | NotExpr;

export type ComparisonOperator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | '~'    // contains
  | '!~'   // not contains
  | 'IN'
  | 'NOT IN'
  | 'BETWEEN';

export interface SimpleCondition {
  type: 'simple';
  field: string;
  operator: ComparisonOperator;
  value: ConditionValue;
  secondValue?: ConditionValue;  // For BETWEEN
}

export type ConditionValue = string | number | boolean | string[] | null;

export interface CrossEntityCondition {
  type: 'cross_entity';
  quantifier: 'HAS' | 'ALL' | 'COUNT';
  relatedEntity: JQLEntityType;
  conditions: ConditionExpr;
  countOp?: '>' | '<' | '=' | '>=' | '<=';
  countValue?: number;
}

export interface LogicalExpr {
  type: 'logical';
  operator: 'AND' | 'OR';
  left: ConditionExpr;
  right: ConditionExpr;
}

export interface NotExpr {
  type: 'not';
  expr: ConditionExpr;
}

// ============================================
// Related Entity Mappings
// ============================================

// Which entities can be queried from a base entity
export const RELATED_ENTITIES: Record<JQLEntityType, JQLEntityType[]> = {
  'teams': ['dimensions', 'issues', 'sprints', 'teamMetrics', 'outcomeConfidence', 'assessments'],
  'assessments': ['dimensions', 'indicators'],
  'dimensions': ['indicators'],
  'indicators': [],
  'users': ['userActivity', 'assessments'],
  'issues': [],
  'sprints': ['issues', 'sprintMetrics'],
  'teamMetrics': [],
  'sprintMetrics': [],
  'userActivity': [],
  'outcomeConfidence': [],
};

// How entities are linked (foreign key relationships)
export const ENTITY_LINKS: Record<string, { from: string; to: string }[]> = {
  'teams->dimensions': [{ from: 'teamName', to: 'teamName' }, { from: 'id', to: 'teamId' }],
  'teams->issues': [{ from: 'teamName', to: 'teamName' }],
  'teams->sprints': [{ from: 'teamName', to: 'teamName' }],
  'teams->teamMetrics': [{ from: 'teamName', to: 'teamName' }],
  'teams->outcomeConfidence': [{ from: 'teamName', to: 'teamName' }, { from: 'id', to: 'teamId' }],
  'teams->assessments': [{ from: 'teamName', to: 'teamName' }, { from: 'id', to: 'teamId' }],
  'assessments->dimensions': [{ from: 'id', to: 'assessmentId' }],
  'assessments->indicators': [{ from: 'id', to: 'assessmentId' }],
  'dimensions->indicators': [{ from: 'dimensionKey', to: 'dimensionKey' }, { from: 'assessmentId', to: 'assessmentId' }],
  'users->userActivity': [{ from: 'id', to: 'userId' }],
  'users->assessments': [{ from: 'id', to: 'createdByUserId' }],
  'sprints->issues': [{ from: 'sprintName', to: 'sprintName' }],
  'sprints->sprintMetrics': [{ from: 'sprintName', to: 'sprintName' }],
};

// ============================================
// Autocomplete Types
// ============================================

export type SuggestionType = 'entity' | 'keyword' | 'field' | 'operator' | 'value' | 'related_entity';

export interface AutocompleteSuggestion {
  type: SuggestionType;
  value: string;
  label: string;
  description?: string;
  insertText?: string;
}

export interface AutocompleteContext {
  position: number;
  entity?: JQLEntityType;
  inCrossEntity?: boolean;
  crossEntityType?: JQLEntityType;
  expectingField?: boolean;
  expectingOperator?: boolean;
  expectingValue?: boolean;
  currentField?: string;
  currentFieldType?: 'string' | 'number' | 'boolean' | 'enum' | 'date';
}

// ============================================
// Parse Result
// ============================================

export interface ParseResult {
  success: boolean;
  query?: JQLQuery;
  error?: ParseError;
}

export interface ParseError {
  message: string;
  position: number;
  length: number;
  suggestion?: string;
}
