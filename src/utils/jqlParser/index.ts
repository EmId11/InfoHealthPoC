// ============================================
// JQL Parser Module Exports
// ============================================

// Types
export type {
  Token,
  TokenType,
  JQLEntityType,
  JQLQuery,
  OrderByClause,
  ConditionExpr,
  SimpleCondition,
  CrossEntityCondition,
  LogicalExpr,
  NotExpr,
  ComparisonOperator,
  ConditionValue,
  AutocompleteSuggestion,
  AutocompleteContext,
  SuggestionType,
  ParseResult,
  ParseError,
} from './types';

export {
  ENTITY_NAMES,
  KEYWORDS,
  RELATED_ENTITIES,
  ENTITY_LINKS,
} from './types';

// Lexer
export { Lexer, tokenize, getTokenAtPosition, getTokenBeforePosition } from './lexer';

// Parser
export { Parser, parseJQL, isValidJQL } from './parser';

// Executor
export type { JQLExecutionResult } from './executor';
export { executeJQL, executeQuery } from './executor';

// Autocomplete
export { getAutocompleteSuggestions, SAMPLE_QUERIES } from './autocomplete';

// Errors
export {
  JQLError,
  LexerError,
  ParseError as JQLParseError,
  ExecutionError,
  formatErrorWithContext,
} from './errors';
