// ============================================
// JQL Parse Error Types
// ============================================

export class JQLError extends Error {
  position: number;
  length: number;
  suggestion?: string;

  constructor(message: string, position: number, length: number = 1, suggestion?: string) {
    super(message);
    this.name = 'JQLError';
    this.position = position;
    this.length = length;
    this.suggestion = suggestion;
  }
}

export class LexerError extends JQLError {
  constructor(message: string, position: number, length: number = 1) {
    super(message, position, length);
    this.name = 'LexerError';
  }
}

export class ParseError extends JQLError {
  expectedTokens?: string[];

  constructor(
    message: string,
    position: number,
    length: number = 1,
    suggestion?: string,
    expectedTokens?: string[]
  ) {
    super(message, position, length, suggestion);
    this.name = 'ParseError';
    this.expectedTokens = expectedTokens;
  }
}

export class ExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionError';
  }
}

// ============================================
// Error Helpers
// ============================================

export function createUnexpectedTokenError(
  found: string,
  expected: string[],
  position: number,
  length: number
): ParseError {
  const expectedStr = expected.length === 1
    ? expected[0]
    : `${expected.slice(0, -1).join(', ')} or ${expected[expected.length - 1]}`;

  return new ParseError(
    `Unexpected "${found}", expected ${expectedStr}`,
    position,
    length,
    `Try: ${expected[0]}`,
    expected
  );
}

export function createUnknownFieldError(
  field: string,
  entity: string,
  position: number,
  availableFields?: string[]
): ParseError {
  let suggestion: string | undefined;

  if (availableFields && availableFields.length > 0) {
    // Find similar field names
    const similar = availableFields.filter(f =>
      f.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(f.toLowerCase())
    );

    if (similar.length > 0) {
      suggestion = `Did you mean "${similar[0]}"?`;
    } else {
      suggestion = `Available fields: ${availableFields.slice(0, 5).join(', ')}...`;
    }
  }

  return new ParseError(
    `Unknown field "${field}" for entity "${entity}"`,
    position,
    field.length,
    suggestion
  );
}

export function createUnknownEntityError(
  entity: string,
  position: number,
  availableEntities: string[]
): ParseError {
  const similar = availableEntities.filter(e =>
    e.toLowerCase().includes(entity.toLowerCase()) ||
    entity.toLowerCase().includes(e.toLowerCase())
  );

  const suggestion = similar.length > 0
    ? `Did you mean "${similar[0]}"?`
    : `Available entities: ${availableEntities.join(', ')}`;

  return new ParseError(
    `Unknown entity "${entity}"`,
    position,
    entity.length,
    suggestion
  );
}

export function createInvalidOperatorError(
  operator: string,
  fieldType: string,
  position: number,
  validOperators: string[]
): ParseError {
  return new ParseError(
    `Operator "${operator}" is not valid for ${fieldType} fields`,
    position,
    operator.length,
    `Valid operators: ${validOperators.join(', ')}`
  );
}

export function createMissingValueError(
  field: string,
  position: number
): ParseError {
  return new ParseError(
    `Missing value for field "${field}"`,
    position,
    1,
    `Add a value after the operator, e.g., = "value"`
  );
}

export function createInvalidValueError(
  value: string,
  expectedType: string,
  position: number
): ParseError {
  return new ParseError(
    `Invalid value "${value}" - expected ${expectedType}`,
    position,
    value.length,
    expectedType === 'number'
      ? 'Use a numeric value, e.g., 42'
      : `Use a ${expectedType} value`
  );
}

// ============================================
// Error Formatting
// ============================================

export function formatErrorWithContext(
  query: string,
  error: JQLError
): string {
  const lines: string[] = [];

  // Add the query
  lines.push(query);

  // Add pointer to error position
  const pointer = ' '.repeat(error.position) + '^'.repeat(Math.min(error.length, query.length - error.position));
  lines.push(pointer);

  // Add error message
  lines.push(`Error: ${error.message}`);

  // Add suggestion if available
  if (error.suggestion) {
    lines.push(`Suggestion: ${error.suggestion}`);
  }

  return lines.join('\n');
}
