// ============================================
// JQL Autocomplete Engine
// ============================================

import {
  Token,
  JQLEntityType,
  AutocompleteSuggestion,
  AutocompleteContext,
  ENTITY_NAMES,
  KEYWORDS,
  RELATED_ENTITIES,
} from './types';
import { tokenize, getTokenBeforePosition } from './lexer';
import { getFieldsForEntity, QueryFieldDefinition } from '../../types/reports';

// ============================================
// Main Autocomplete Function
// ============================================

export function getAutocompleteSuggestions(
  query: string,
  cursorPosition: number
): AutocompleteSuggestion[] {
  // Check if cursor is right after a space (trigger for suggestions)
  const charBeforeCursor = cursorPosition > 0 ? query[cursorPosition - 1] : '';
  const endsWithSpace = charBeforeCursor === ' ';

  // Quick pattern check for common cases where suggestions should appear
  const textBeforeCursor = query.substring(0, cursorPosition).trim();

  // === SPACE-TRIGGERED SUGGESTIONS ===
  if (endsWithSpace) {
    // Pattern: "Entity " - suggest WHERE or dot notation hint
    const entityOnlyPattern = /^(\w+)$/i;
    const entityOnlyMatch = textBeforeCursor.match(entityOnlyPattern);
    if (entityOnlyMatch) {
      const entityName = entityOnlyMatch[1].toLowerCase();
      const entity = ENTITY_NAMES[entityName];
      if (entity) {
        const relatedEntities = RELATED_ENTITIES[entity] || [];
        const suggestions: AutocompleteSuggestion[] = [
          { type: 'keyword', value: 'WHERE', label: 'WHERE', description: 'Add filter conditions' },
        ];
        if (relatedEntities.length > 0) {
          suggestions.push({
            type: 'keyword',
            value: '.',
            label: '. (dot notation)',
            description: `Access related entities: ${relatedEntities.slice(0, 3).join(', ')}${relatedEntities.length > 3 ? '...' : ''}`,
            insertText: '.',
          });
        }
        return suggestions;
      }
    }

    // Pattern: "Entity.relatedEntity " - suggest WHERE
    const dotEntityPattern = /^(\w+)\.(\w+)$/i;
    const dotEntityMatch = textBeforeCursor.match(dotEntityPattern);
    if (dotEntityMatch) {
      const relatedEntityName = dotEntityMatch[2].toLowerCase();
      if (ENTITY_NAMES[relatedEntityName]) {
        return [
          { type: 'keyword', value: 'WHERE', label: 'WHERE', description: 'Add filter conditions' },
        ];
      }
    }

    // Pattern: "... WHERE field = value " - suggest AND/OR/HAVING/ORDER/LIMIT
    const afterValuePattern = /^(\w+)(?:\.(\w+))?\s+WHERE\s+.+\s+(=|!=|>|<|>=|<=|~|!~)\s*("[^"]*"|\w+)$/i;
    const afterValueMatch = textBeforeCursor.match(afterValuePattern);
    if (afterValueMatch) {
      const hasDotNotation = !!afterValueMatch[2];
      const suggestions: AutocompleteSuggestion[] = [
        { type: 'keyword', value: 'AND', label: 'AND', description: 'Add another condition (all must match)' },
        { type: 'keyword', value: 'OR', label: 'OR', description: 'Add alternative condition (any can match)' },
        { type: 'keyword', value: 'ORDER BY', label: 'ORDER BY', description: 'Sort results', insertText: 'ORDER BY ' },
        { type: 'keyword', value: 'LIMIT', label: 'LIMIT', description: 'Limit number of results' },
      ];
      if (hasDotNotation) {
        suggestions.splice(2, 0, {
          type: 'keyword',
          value: 'HAVING COUNT',
          label: 'HAVING COUNT',
          description: 'Filter by count of matching rows',
          insertText: 'HAVING COUNT ',
        });
      }
      return suggestions;
    }

    // Pattern: "... WHERE field " - suggest operators
    const afterFieldPattern = /^(\w+)(?:\.(\w+))?\s+WHERE\s+(?:.*\s+(?:AND|OR)\s+)?(\w+)$/i;
    const afterFieldMatch = textBeforeCursor.match(afterFieldPattern);
    if (afterFieldMatch) {
      const entityName = afterFieldMatch[2] || afterFieldMatch[1];
      const fieldName = afterFieldMatch[3];
      const entity = ENTITY_NAMES[entityName.toLowerCase()];
      if (entity) {
        const fields = getFieldsForEntity(entity);
        const field = fields.find(f => f.id.toLowerCase() === fieldName.toLowerCase());
        if (field) {
          return getOperatorSuggestions(field.valueType);
        }
      }
    }
  }

  // === DOT-TRIGGERED SUGGESTIONS ===
  // Pattern: "Entity." - should suggest related entities for dot notation
  const dotPattern = /^(\w+)\.\s*$/i;
  const dotMatch = textBeforeCursor.match(dotPattern);
  if (dotMatch) {
    const entityName = dotMatch[1].toLowerCase();
    const entity = ENTITY_NAMES[entityName];
    if (entity) {
      const relatedEntities = RELATED_ENTITIES[entity] || [];
      return relatedEntities.map(e => ({
        type: 'related_entity' as const,
        value: capitalize(e),
        label: formatEntityName(e),
        description: `Query ${formatEntityName(e)} linked to ${formatEntityName(entity)}`,
      }));
    }
  }

  // Pattern: "Entity.relatedEntity WHERE " - should suggest fields from related entity
  const dotWherePattern = /^(\w+)\.(\w+)\s+WHERE\s*$/i;
  const dotWhereMatch = textBeforeCursor.match(dotWherePattern);
  if (dotWhereMatch) {
    const relatedEntityName = dotWhereMatch[2].toLowerCase();
    const relatedEntity = ENTITY_NAMES[relatedEntityName];
    if (relatedEntity) {
      const fieldSuggestions = getFieldsForEntity(relatedEntity).map(f => ({
        type: 'field' as const,
        value: f.id,
        label: f.label,
        description: `${f.valueType}`,
      }));
      return fieldSuggestions;
    }
  }

  // Pattern: "Entity WHERE " - should suggest fields
  const wherePattern = /^(\w+)\s+WHERE\s*$/i;
  const whereMatch = textBeforeCursor.match(wherePattern);
  if (whereMatch) {
    const entityName = whereMatch[1].toLowerCase();
    const entity = ENTITY_NAMES[entityName];
    if (entity) {
      const fieldSuggestions = getFieldsForEntity(entity).map(f => ({
        type: 'field' as const,
        value: f.id,
        label: f.label,
        description: `${f.valueType}`,
      }));
      const crossEntityKeywords: AutocompleteSuggestion[] = [
        { type: 'keyword', value: 'HAS', label: 'HAS', description: 'Filter by ANY related entity having condition' },
        { type: 'keyword', value: 'ALL', label: 'ALL', description: 'Filter by ALL related entities having condition' },
        { type: 'keyword', value: 'COUNT', label: 'COUNT', description: 'Filter by COUNT of related entities' },
      ];
      return [...crossEntityKeywords, ...fieldSuggestions];
    }
  }

  // Pattern: "Entity.relatedEntity WHERE ... AND/OR " - should suggest fields from related entity
  const dotAndOrPattern = /^(\w+)\.(\w+)\s+WHERE\s+.+\s+(AND|OR)\s*$/i;
  const dotAndOrMatch = textBeforeCursor.match(dotAndOrPattern);
  if (dotAndOrMatch) {
    const relatedEntityName = dotAndOrMatch[2].toLowerCase();
    const relatedEntity = ENTITY_NAMES[relatedEntityName];
    if (relatedEntity) {
      const fieldSuggestions = getFieldsForEntity(relatedEntity).map(f => ({
        type: 'field' as const,
        value: f.id,
        label: f.label,
        description: `${f.valueType}`,
      }));
      return fieldSuggestions;
    }
  }

  // Pattern: "Entity WHERE ... AND/OR " - should suggest fields
  const andOrPattern = /^(\w+)\s+WHERE\s+.+\s+(AND|OR)\s*$/i;
  const andOrMatch = textBeforeCursor.match(andOrPattern);
  if (andOrMatch) {
    const entityName = andOrMatch[1].toLowerCase();
    const entity = ENTITY_NAMES[entityName];
    if (entity) {
      const fieldSuggestions = getFieldsForEntity(entity).map(f => ({
        type: 'field' as const,
        value: f.id,
        label: f.label,
        description: `${f.valueType}`,
      }));
      const crossEntityKeywords: AutocompleteSuggestion[] = [
        { type: 'keyword', value: 'HAS', label: 'HAS', description: 'Filter by ANY related entity having condition' },
        { type: 'keyword', value: 'ALL', label: 'ALL', description: 'Filter by ALL related entities having condition' },
        { type: 'keyword', value: 'COUNT', label: 'COUNT', description: 'Filter by COUNT of related entities' },
      ];
      return [...crossEntityKeywords, ...fieldSuggestions];
    }
  }

  // Pattern: "Entity WHERE field " or "Entity WHERE field =" - should suggest operators or values
  const fieldPattern = /^(\w+)\s+WHERE\s+(?:.*\s+(?:AND|OR)\s+)?(\w+)\s*$/i;
  const fieldMatch = textBeforeCursor.match(fieldPattern);
  if (fieldMatch) {
    const entityName = fieldMatch[1].toLowerCase();
    const fieldName = fieldMatch[2];
    const entity = ENTITY_NAMES[entityName];
    if (entity) {
      const fields = getFieldsForEntity(entity);
      const field = fields.find(f => f.id.toLowerCase() === fieldName.toLowerCase());
      if (field) {
        // Suggest operators based on field type
        return getOperatorSuggestions(field.valueType);
      }
    }
  }

  // Pattern: ends with an operator - should suggest values
  const operatorPattern = /^(\w+)\s+WHERE\s+(?:.*\s+(?:AND|OR)\s+)?(\w+)\s*(=|!=|>|<|>=|<=|~|!~|IN|BETWEEN)\s*$/i;
  const operatorMatch = textBeforeCursor.match(operatorPattern);
  if (operatorMatch) {
    const entityName = operatorMatch[1].toLowerCase();
    const fieldName = operatorMatch[2];
    const entity = ENTITY_NAMES[entityName];
    if (entity) {
      return getValueSuggestions(entity, fieldName);
    }
  }

  // Fall back to full context analysis
  const context = analyzeContext(query, cursorPosition);
  return generateSuggestions(context, query, cursorPosition);
}

// ============================================
// Context Analysis
// ============================================

function analyzeContext(query: string, cursorPosition: number): AutocompleteContext {
  const context: AutocompleteContext = {
    position: cursorPosition,
  };

  // Empty query - suggest entities
  if (!query.trim()) {
    return context;
  }

  try {
    const tokens = tokenize(query.substring(0, cursorPosition));
    const lastToken = tokens.length > 1 ? tokens[tokens.length - 2] : null; // -2 because last is EOF

    // Analyze token sequence to determine context
    let currentEntity: JQLEntityType | undefined;
    let inCrossEntity = false;
    let crossEntityType: JQLEntityType | undefined;
    let expectingField = false;
    let expectingOperator = false;
    let expectingValue = false;
    let currentField: string | undefined;
    let lastKeyword: string | undefined;

    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];

      if (token.type === 'ENTITY') {
        currentEntity = ENTITY_NAMES[token.value.toLowerCase()];
      }

      if (token.type === 'KEYWORD') {
        lastKeyword = token.value;

        if (token.value === 'WHERE' || token.value === 'AND' || token.value === 'OR') {
          expectingField = true;
          expectingOperator = false;
          expectingValue = false;
        }

        if (token.value === 'HAS' || token.value === 'ALL' || token.value === 'COUNT') {
          inCrossEntity = true;
        }

        if (token.value === 'WITH' || token.value === 'HAVE') {
          expectingField = true;
        }
      }

      if (token.type === 'IDENTIFIER') {
        if (inCrossEntity && !crossEntityType) {
          // This identifier is the related entity name
          crossEntityType = ENTITY_NAMES[token.value.toLowerCase()];
        } else if (expectingField) {
          currentField = token.value;
          expectingField = false;
          expectingOperator = true;
        }
      }

      if (token.type === 'OPERATOR') {
        expectingOperator = false;
        expectingValue = true;
      }

      if (token.type === 'STRING' || token.type === 'NUMBER') {
        expectingValue = false;
        expectingField = false;
      }
    }

    context.entity = currentEntity;
    context.inCrossEntity = inCrossEntity;
    context.crossEntityType = crossEntityType;
    context.expectingField = expectingField;
    context.expectingOperator = expectingOperator;
    context.expectingValue = expectingValue;
    context.currentField = currentField;

    // Get field type if we have a current field
    if (currentField && (currentEntity || crossEntityType)) {
      const entity = crossEntityType || currentEntity;
      const fieldName = currentField; // Capture for TypeScript narrowing
      if (entity) {
        const fields = getFieldsForEntity(entity);
        const field = fields.find(f => f.id.toLowerCase() === fieldName.toLowerCase());
        if (field) {
          context.currentFieldType = field.valueType;
        }
      }
    }

    // Adjust expectations based on last token
    if (lastToken) {
      if (lastToken.type === 'KEYWORD' && (lastToken.value === 'WHERE' || lastToken.value === 'AND' || lastToken.value === 'OR')) {
        context.expectingField = true;
      }
      if (lastToken.type === 'KEYWORD' && (lastToken.value === 'HAS' || lastToken.value === 'ALL')) {
        context.expectingField = false; // Actually expecting related entity
      }
      if (lastToken.type === 'KEYWORD' && lastToken.value === 'WITH') {
        context.expectingField = true;
      }
      if (lastToken.type === 'IDENTIFIER' && !context.expectingOperator && !context.expectingValue) {
        context.expectingOperator = true;
      }
      if (lastToken.type === 'OPERATOR') {
        context.expectingValue = true;
      }
    }
  } catch {
    // If tokenization fails, provide basic suggestions
  }

  return context;
}

// ============================================
// Suggestion Generation
// ============================================

function generateSuggestions(
  context: AutocompleteContext,
  query: string,
  cursorPosition: number
): AutocompleteSuggestion[] {
  try {
    // Get the current word being typed
    const currentWord = getCurrentWord(query, cursorPosition);
    const filterFn = (s: AutocompleteSuggestion) =>
      !currentWord || s.value.toLowerCase().startsWith(currentWord.toLowerCase());

    // If no entity yet, suggest entities
    if (!context.entity) {
      return getEntitySuggestions().filter(filterFn);
    }

    // After HAS/ALL - suggest related entities
    if (context.inCrossEntity && !context.crossEntityType) {
      const relatedEntities = RELATED_ENTITIES[context.entity] || [];
      return relatedEntities.map(e => ({
        type: 'related_entity' as const,
        value: e,
        label: formatEntityName(e),
        description: `Query ${formatEntityName(e)} related to ${formatEntityName(context.entity!)}`,
      })).filter(filterFn);
    }

    // Expecting field
    if (context.expectingField) {
      const entity = context.crossEntityType || context.entity;
      if (entity) {
        const fieldSuggestions = getFieldSuggestions(entity);

        // Also suggest cross-entity keywords
        if (!context.inCrossEntity && context.entity) {
          const crossEntityKeywords: AutocompleteSuggestion[] = [
            { type: 'keyword', value: 'HAS', label: 'HAS', description: 'Filter by ANY related entity having condition' },
            { type: 'keyword', value: 'ALL', label: 'ALL', description: 'Filter by ALL related entities having condition' },
            { type: 'keyword', value: 'COUNT', label: 'COUNT', description: 'Filter by COUNT of related entities' },
          ];
          return [...crossEntityKeywords, ...fieldSuggestions].filter(filterFn);
        }

        return fieldSuggestions.filter(filterFn);
      }
    }

    // Expecting operator
    if (context.expectingOperator) {
      return getOperatorSuggestions(context.currentFieldType).filter(filterFn);
    }

    // Expecting value
    if (context.expectingValue && context.currentField) {
      const entity = context.crossEntityType || context.entity;
      if (entity) {
        return getValueSuggestions(entity, context.currentField).filter(filterFn);
      }
    }

    // Default - suggest keywords
    const keywordSuggestions: AutocompleteSuggestion[] = [
      { type: 'keyword', value: 'WHERE', label: 'WHERE', description: 'Add filter conditions' },
      { type: 'keyword', value: 'AND', label: 'AND', description: 'Add another condition (all must match)' },
      { type: 'keyword', value: 'OR', label: 'OR', description: 'Add alternative condition (any can match)' },
      { type: 'keyword', value: 'ORDER', label: 'ORDER BY', description: 'Sort results', insertText: 'ORDER BY ' },
      { type: 'keyword', value: 'LIMIT', label: 'LIMIT', description: 'Limit number of results' },
    ];

    return keywordSuggestions.filter(filterFn);
  } catch (e) {
    // On any error, return entity suggestions as fallback
    console.warn('Autocomplete error:', e);
    return getEntitySuggestions();
  }
}

// ============================================
// Suggestion Helpers
// ============================================

function getEntitySuggestions(): AutocompleteSuggestion[] {
  const entities: JQLEntityType[] = [
    'teams', 'issues', 'sprints', 'dimensions', 'assessments',
    'users', 'teamMetrics', 'sprintMetrics', 'userActivity', 'outcomeConfidence',
  ];

  return entities.map(e => ({
    type: 'entity' as const,
    value: capitalize(e),
    label: formatEntityName(e),
    description: getEntityDescription(e),
  }));
}

function getFieldSuggestions(entity: JQLEntityType): AutocompleteSuggestion[] {
  const fields = getFieldsForEntity(entity);

  return fields.map(f => ({
    type: 'field' as const,
    value: f.id,
    label: f.label,
    description: getFieldTypeDescription(f),
  }));
}

function getOperatorSuggestions(fieldType?: string): AutocompleteSuggestion[] {
  const operators: AutocompleteSuggestion[] = [];

  // Common operators
  operators.push(
    { type: 'operator', value: '=', label: '=', description: 'Equals' },
    { type: 'operator', value: '!=', label: '!=', description: 'Not equals' },
  );

  if (fieldType === 'string' || !fieldType) {
    operators.push(
      { type: 'operator', value: '~', label: '~', description: 'Contains' },
      { type: 'operator', value: '!~', label: '!~', description: 'Does not contain' },
      { type: 'operator', value: 'IN', label: 'IN', description: 'Is one of (list)' },
      { type: 'operator', value: 'NOT IN', label: 'NOT IN', description: 'Is not one of (list)', insertText: 'NOT IN ' },
    );
  }

  if (fieldType === 'number' || fieldType === 'date' || !fieldType) {
    operators.push(
      { type: 'operator', value: '>', label: '>', description: 'Greater than' },
      { type: 'operator', value: '<', label: '<', description: 'Less than' },
      { type: 'operator', value: '>=', label: '>=', description: 'Greater than or equal' },
      { type: 'operator', value: '<=', label: '<=', description: 'Less than or equal' },
      { type: 'operator', value: 'BETWEEN', label: 'BETWEEN', description: 'Between two values' },
    );
  }

  if (fieldType === 'enum' || !fieldType) {
    operators.push(
      { type: 'operator', value: 'IN', label: 'IN', description: 'Is one of (list)' },
      { type: 'operator', value: 'NOT IN', label: 'NOT IN', description: 'Is not one of (list)', insertText: 'NOT IN ' },
    );
  }

  return operators;
}

function getValueSuggestions(entity: JQLEntityType, fieldId: string): AutocompleteSuggestion[] {
  const fields = getFieldsForEntity(entity);
  const field = fields.find(f => f.id.toLowerCase() === fieldId.toLowerCase());

  if (!field) return [];

  // For enum fields, suggest enum values
  if (field.valueType === 'enum' && field.enumValues) {
    return field.enumValues.map(ev => ({
      type: 'value' as const,
      value: `"${ev.value}"`,
      label: ev.label,
      description: `Value: ${ev.value}`,
    }));
  }

  // For boolean fields
  if (field.valueType === 'boolean') {
    return [
      { type: 'value', value: 'true', label: 'true', description: 'Boolean true' },
      { type: 'value', value: 'false', label: 'false', description: 'Boolean false' },
    ];
  }

  // For date fields, suggest relative dates
  if (field.valueType === 'date') {
    return [
      { type: 'value', value: '-1d', label: 'Last 1 day', description: 'Relative date' },
      { type: 'value', value: '-7d', label: 'Last 7 days', description: 'Relative date' },
      { type: 'value', value: '-14d', label: 'Last 14 days', description: 'Relative date' },
      { type: 'value', value: '-30d', label: 'Last 30 days', description: 'Relative date' },
      { type: 'value', value: '-90d', label: 'Last 90 days', description: 'Relative date' },
    ];
  }

  return [];
}

// ============================================
// Utility Functions
// ============================================

function getCurrentWord(query: string, cursorPosition: number): string {
  // Find the start of the current word
  let start = cursorPosition;
  while (start > 0 && /[a-zA-Z0-9_]/.test(query[start - 1])) {
    start--;
  }
  return query.substring(start, cursorPosition);
}

function formatEntityName(entity: JQLEntityType): string {
  const names: Record<JQLEntityType, string> = {
    teams: 'Teams',
    assessments: 'Assessments',
    dimensions: 'Dimensions',
    indicators: 'Indicators',
    users: 'Users',
    issues: 'Issues',
    sprints: 'Sprints',
    teamMetrics: 'Team Metrics',
    sprintMetrics: 'Sprint Metrics',
    userActivity: 'User Activity',
    outcomeConfidence: 'Outcome Confidence',
  };
  return names[entity] || entity;
}

function getEntityDescription(entity: JQLEntityType): string {
  const descriptions: Record<JQLEntityType, string> = {
    teams: 'Query teams by properties and health metrics',
    assessments: 'Query health assessments',
    dimensions: 'Query health dimensions with risk levels',
    indicators: 'Query health indicators',
    users: 'Query users by role and status',
    issues: 'Query Jira issues',
    sprints: 'Query sprints',
    teamMetrics: 'Query aggregated team metrics',
    sprintMetrics: 'Query sprint-level metrics',
    userActivity: 'Query user activity data',
    outcomeConfidence: 'Query outcome confidence scores',
  };
  return descriptions[entity] || '';
}

function getFieldTypeDescription(field: QueryFieldDefinition): string {
  const types: Record<string, string> = {
    string: 'Text',
    number: 'Number',
    boolean: 'Yes/No',
    enum: 'Choice',
    date: 'Date',
  };
  return `${types[field.valueType] || field.valueType}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// Sample Queries
// ============================================

export const SAMPLE_QUERIES = [
  {
    query: 'Teams WHERE workType = "product"',
    description: 'Find all product teams',
  },
  {
    query: 'Teams.dimensions WHERE riskLevel = "high"',
    description: 'Find high-risk dimensions across all teams',
  },
  {
    query: 'Teams.outcomeConfidence WHERE confidenceLevel = "low"',
    description: 'Find low confidence outcomes across teams',
  },
  {
    query: 'Issues WHERE status = "In Progress" AND daysStale > 7',
    description: 'Find stale in-progress issues',
  },
  {
    query: 'Teams.dimensions WHERE trend = "declining"',
    description: 'Find declining dimensions',
  },
  {
    query: 'Sprints WHERE hasGoal = false',
    description: 'Find sprints without goals',
  },
  {
    query: 'Users WHERE role = "viewer" ORDER BY lastActiveAt DESC',
    description: 'List viewers by recent activity',
  },
  {
    query: 'Teams.dimensions WHERE riskLevel = "high" HAVING COUNT > 2',
    description: 'Find dimensions from teams with more than 2 high-risk dimensions',
  },
];
