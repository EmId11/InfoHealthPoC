// ============================================
// JQL Parser (Recursive Descent)
// ============================================

import {
  Token,
  TokenType,
  JQLQuery,
  JQLEntityType,
  ConditionExpr,
  SimpleCondition,
  CrossEntityCondition,
  LogicalExpr,
  ComparisonOperator,
  ConditionValue,
  OrderByClause,
  ParseResult,
  ENTITY_NAMES,
  RELATED_ENTITIES,
} from './types';
import { tokenize } from './lexer';
import { ParseError, LexerError, JQLError, createUnexpectedTokenError, createUnknownEntityError } from './errors';

export class Parser {
  private tokens: Token[] = [];
  private position: number = 0;
  private currentEntity: JQLEntityType = 'teams';

  parse(input: string): ParseResult {
    try {
      this.tokens = tokenize(input);
      this.position = 0;

      const query = this.parseQuery();

      return { success: true, query };
    } catch (error) {
      // Handle all JQL errors (LexerError, ParseError, etc.)
      if (error instanceof JQLError) {
        return {
          success: false,
          error: {
            message: error.message,
            position: error.position,
            length: error.length,
            suggestion: error.suggestion,
          },
        };
      }
      // For unexpected errors, return a generic parse error
      if (error instanceof Error) {
        return {
          success: false,
          error: {
            message: error.message,
            position: 0,
            length: 1,
          },
        };
      }
      throw error;
    }
  }

  private parseQuery(): JQLQuery {
    // Parse entity name
    const entityToken = this.expect('ENTITY', 'entity name (e.g., Teams, Issues)');
    const entityName = entityToken.value.toLowerCase();

    if (!ENTITY_NAMES[entityName]) {
      throw createUnknownEntityError(
        entityToken.value,
        entityToken.position,
        Object.keys(ENTITY_NAMES)
      );
    }

    const entity = ENTITY_NAMES[entityName];
    this.currentEntity = entity;

    const query: JQLQuery = { entity };

    // Check for dot notation: Entity.relatedEntity
    if (this.match('DOT')) {
      this.advance(); // consume the dot

      // Parse related entity name
      const relatedEntityToken = this.expect('ENTITY', 'related entity name');
      const relatedEntityName = relatedEntityToken.value.toLowerCase();
      const relatedEntity = ENTITY_NAMES[relatedEntityName];

      if (!relatedEntity) {
        throw createUnknownEntityError(
          relatedEntityToken.value,
          relatedEntityToken.position,
          Object.keys(ENTITY_NAMES)
        );
      }

      // Validate that the relationship exists
      const allowedRelated = RELATED_ENTITIES[entity] || [];
      if (!allowedRelated.includes(relatedEntity)) {
        throw new ParseError(
          `Entity "${relatedEntity}" cannot be accessed from "${entity}"`,
          relatedEntityToken.position,
          relatedEntityToken.length,
          allowedRelated.length > 0
            ? `Available: ${allowedRelated.join(', ')}`
            : undefined
        );
      }

      query.pathEntity = relatedEntity;
      this.currentEntity = relatedEntity; // Switch context for WHERE parsing
    }

    // Parse optional WHERE clause
    if (this.matchKeyword('WHERE')) {
      this.advance();
      query.where = this.parseConditionExpr();
    }

    // Parse optional HAVING COUNT clause (only valid with dot notation)
    if (this.matchKeyword('HAVING')) {
      if (!query.pathEntity) {
        const token = this.current();
        throw new ParseError(
          'HAVING is only valid with dot notation queries (e.g., Teams.dimensions WHERE ... HAVING COUNT > 2)',
          token.position,
          token.length
        );
      }
      this.advance(); // consume HAVING

      // Expect COUNT
      this.expectKeyword('COUNT');

      // Parse comparison operator
      const opToken = this.expect('OPERATOR', 'comparison operator');
      const countOp = opToken.value as '>' | '<' | '=' | '>=' | '<=';
      if (!['>', '<', '=', '>=', '<='].includes(countOp)) {
        throw new ParseError(
          `Invalid HAVING COUNT operator "${countOp}"`,
          opToken.position,
          opToken.length,
          'Use >, <, =, >=, or <='
        );
      }

      // Parse count value
      const valueToken = this.expect('NUMBER', 'number');
      query.havingCount = {
        operator: countOp,
        value: parseInt(valueToken.value, 10),
      };
    }

    // Parse optional ORDER BY clause
    if (this.matchKeyword('ORDER')) {
      this.advance();
      this.expectKeyword('BY');
      query.orderBy = this.parseOrderBy();
    }

    // Parse optional LIMIT clause
    if (this.matchKeyword('LIMIT')) {
      this.advance();
      const limitToken = this.expect('NUMBER', 'number');
      query.limit = parseInt(limitToken.value, 10);
    }

    // Expect end of input
    if (!this.isAtEnd()) {
      const token = this.current();
      throw createUnexpectedTokenError(
        token.value,
        ['end of query'],
        token.position,
        token.length
      );
    }

    return query;
  }

  private parseConditionExpr(): ConditionExpr {
    return this.parseOrExpr();
  }

  private parseOrExpr(): ConditionExpr {
    let left = this.parseAndExpr();

    while (this.matchKeyword('OR')) {
      this.advance();
      const right = this.parseAndExpr();
      left = {
        type: 'logical',
        operator: 'OR',
        left,
        right,
      } as LogicalExpr;
    }

    return left;
  }

  private parseAndExpr(): ConditionExpr {
    let left = this.parsePrimaryExpr();

    while (this.matchKeyword('AND')) {
      this.advance();
      const right = this.parsePrimaryExpr();
      left = {
        type: 'logical',
        operator: 'AND',
        left,
        right,
      } as LogicalExpr;
    }

    return left;
  }

  private parsePrimaryExpr(): ConditionExpr {
    // Handle parenthesized expressions
    if (this.match('LPAREN')) {
      this.advance();
      const expr = this.parseConditionExpr();
      this.expect('RPAREN', ')');
      return expr;
    }

    // Handle NOT expressions
    if (this.matchKeyword('NOT')) {
      this.advance();
      const expr = this.parsePrimaryExpr();
      return { type: 'not', expr };
    }

    // Handle cross-entity predicates (HAS, ALL, COUNT)
    if (this.matchKeyword('HAS') || this.matchKeyword('ALL') || this.matchKeyword('COUNT')) {
      return this.parseCrossEntityCondition();
    }

    // Handle simple conditions
    return this.parseSimpleCondition();
  }

  private parseCrossEntityCondition(): CrossEntityCondition {
    const quantifierToken = this.current();
    const quantifier = quantifierToken.value as 'HAS' | 'ALL' | 'COUNT';
    this.advance();

    // For COUNT, expect opening parenthesis
    let expectCloseParen = false;
    if (quantifier === 'COUNT' && this.match('LPAREN')) {
      this.advance();
      expectCloseParen = true;
    }

    // Parse related entity name - must be ENTITY token (not IDENTIFIER)
    const entityToken = this.expect('ENTITY', 'related entity name');
    const entityName = entityToken.value.toLowerCase();

    // Validate the related entity
    const relatedEntity = ENTITY_NAMES[entityName];
    if (!relatedEntity) {
      const availableRelated = RELATED_ENTITIES[this.currentEntity] || [];
      throw new ParseError(
        `Unknown entity "${entityToken.value}"`,
        entityToken.position,
        entityToken.length,
        availableRelated.length > 0
          ? `Available: ${availableRelated.join(', ')}`
          : undefined
      );
    }

    // Check if this entity can be related from the current entity
    const allowedRelated = RELATED_ENTITIES[this.currentEntity] || [];
    if (!allowedRelated.includes(relatedEntity)) {
      throw new ParseError(
        `Entity "${relatedEntity}" cannot be queried from "${this.currentEntity}"`,
        entityToken.position,
        entityToken.length,
        allowedRelated.length > 0
          ? `Available: ${allowedRelated.join(', ')}`
          : undefined
      );
    }

    // Expect WITH (for HAS) or HAVE (for ALL)
    if (quantifier === 'HAS' || quantifier === 'COUNT') {
      this.expectKeyword('WITH');
    } else if (quantifier === 'ALL') {
      this.expectKeyword('HAVE');
    }

    // Parse the conditions for the related entity
    const savedEntity = this.currentEntity;
    this.currentEntity = relatedEntity;
    const conditions = this.parseConditionExpr();
    this.currentEntity = savedEntity;

    const condition: CrossEntityCondition = {
      type: 'cross_entity',
      quantifier,
      relatedEntity,
      conditions,
    };

    // For COUNT, parse the comparison and close paren
    if (quantifier === 'COUNT') {
      if (expectCloseParen) {
        this.expect('RPAREN', ')');
      }

      // Parse comparison operator
      const opToken = this.expect('OPERATOR', 'comparison operator');
      const countOp = opToken.value as '>' | '<' | '=' | '>=' | '<=';
      if (!['>', '<', '=', '>=', '<='].includes(countOp)) {
        throw new ParseError(
          `Invalid COUNT comparison operator "${countOp}"`,
          opToken.position,
          opToken.length,
          'Use >, <, =, >=, or <='
        );
      }
      condition.countOp = countOp;

      // Parse count value
      const valueToken = this.expect('NUMBER', 'number');
      condition.countValue = parseInt(valueToken.value, 10);
    }

    return condition;
  }

  private parseSimpleCondition(): SimpleCondition {
    // Parse field name
    const fieldToken = this.expect('IDENTIFIER', 'field name');
    const field = fieldToken.value;

    // Parse operator
    const operator = this.parseOperator();

    // Parse value(s)
    const value = this.parseValue(operator);

    const condition: SimpleCondition = {
      type: 'simple',
      field,
      operator,
      value,
    };

    // Handle BETWEEN - parse second value
    if (operator === 'BETWEEN') {
      this.expectKeyword('AND');
      condition.secondValue = this.parseValue('=');
    }

    return condition;
  }

  private parseOperator(): ComparisonOperator {
    // Check for keyword operators first
    if (this.matchKeyword('IN')) {
      this.advance();
      return 'IN';
    }

    if (this.matchKeyword('NOT')) {
      this.advance();
      this.expectKeyword('IN');
      return 'NOT IN';
    }

    if (this.matchKeyword('BETWEEN')) {
      this.advance();
      return 'BETWEEN';
    }

    // Parse symbol operators
    const opToken = this.expect('OPERATOR', 'operator');
    const op = opToken.value;

    const validOps: ComparisonOperator[] = ['=', '!=', '>', '<', '>=', '<=', '~', '!~'];
    if (!validOps.includes(op as ComparisonOperator)) {
      throw new ParseError(
        `Unknown operator "${op}"`,
        opToken.position,
        opToken.length,
        'Valid operators: =, !=, >, <, >=, <=, ~, !~, IN, NOT IN, BETWEEN'
      );
    }

    return op as ComparisonOperator;
  }

  private parseValue(operator: ComparisonOperator): ConditionValue {
    // Handle IN operator - expect list of values
    if (operator === 'IN' || operator === 'NOT IN') {
      return this.parseValueList();
    }

    const token = this.current();

    // Boolean values
    if (token.type === 'KEYWORD' && (token.value === 'TRUE' || token.value === 'FALSE')) {
      this.advance();
      return token.value === 'TRUE';
    }

    // NULL value
    if (token.type === 'KEYWORD' && token.value === 'NULL') {
      this.advance();
      return null;
    }

    // String value
    if (token.type === 'STRING') {
      this.advance();
      return token.value;
    }

    // Number value
    if (token.type === 'NUMBER') {
      this.advance();
      // Check for relative date suffix
      if (token.value.endsWith('d') || token.value.endsWith('w') || token.value.endsWith('m') || token.value.endsWith('h')) {
        return token.value; // Keep as string for relative date
      }
      const num = parseFloat(token.value);
      return isNaN(num) ? token.value : num;
    }

    // Identifier as string value (unquoted)
    if (token.type === 'IDENTIFIER') {
      this.advance();
      return token.value;
    }

    throw createUnexpectedTokenError(
      token.value || 'end of input',
      ['string', 'number', 'true', 'false'],
      token.position,
      token.length
    );
  }

  private parseValueList(): string[] {
    this.expect('LPAREN', '(');

    const values: string[] = [];

    // Parse first value
    const firstToken = this.current();
    if (firstToken.type === 'STRING' || firstToken.type === 'IDENTIFIER') {
      values.push(firstToken.value);
      this.advance();
    } else if (firstToken.type === 'NUMBER') {
      values.push(firstToken.value);
      this.advance();
    } else {
      throw createUnexpectedTokenError(
        firstToken.value,
        ['value'],
        firstToken.position,
        firstToken.length
      );
    }

    // Parse additional values
    while (this.match('COMMA')) {
      this.advance();
      const valueToken = this.current();
      if (valueToken.type === 'STRING' || valueToken.type === 'IDENTIFIER') {
        values.push(valueToken.value);
        this.advance();
      } else if (valueToken.type === 'NUMBER') {
        values.push(valueToken.value);
        this.advance();
      } else {
        throw createUnexpectedTokenError(
          valueToken.value,
          ['value'],
          valueToken.position,
          valueToken.length
        );
      }
    }

    this.expect('RPAREN', ')');

    return values;
  }

  private parseOrderBy(): OrderByClause {
    const fieldToken = this.expect('IDENTIFIER', 'field name');

    let direction: 'ASC' | 'DESC' = 'ASC';
    if (this.matchKeyword('ASC') || this.matchKeyword('DESC')) {
      direction = this.current().value as 'ASC' | 'DESC';
      this.advance();
    }

    return { field: fieldToken.value, direction };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private current(): Token {
    return this.tokens[this.position] || { type: 'EOF', value: '', position: this.position, length: 0 };
  }

  private advance(): Token {
    const token = this.current();
    this.position++;
    return token;
  }

  private isAtEnd(): boolean {
    return this.current().type === 'EOF';
  }

  private match(type: TokenType): boolean {
    return this.current().type === type;
  }

  private matchKeyword(keyword: string): boolean {
    const token = this.current();
    return token.type === 'KEYWORD' && token.value === keyword;
  }

  private expect(type: TokenType, expected: string): Token {
    const token = this.current();
    if (token.type !== type) {
      throw createUnexpectedTokenError(
        token.value || 'end of input',
        [expected],
        token.position,
        token.length || 1
      );
    }
    return this.advance();
  }

  private expectKeyword(keyword: string): Token {
    const token = this.current();
    if (token.type !== 'KEYWORD' || token.value !== keyword) {
      throw createUnexpectedTokenError(
        token.value || 'end of input',
        [keyword],
        token.position,
        token.length || 1
      );
    }
    return this.advance();
  }
}

// ============================================
// Helper Functions
// ============================================

export function parseJQL(input: string): ParseResult {
  const parser = new Parser();
  return parser.parse(input);
}

export function isValidJQL(input: string): boolean {
  const result = parseJQL(input);
  return result.success;
}
