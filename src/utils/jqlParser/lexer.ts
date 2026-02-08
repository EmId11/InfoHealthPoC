// ============================================
// JQL Lexer (Tokenizer)
// ============================================

import { Token, TokenType, KEYWORDS, ENTITY_NAMES } from './types';
import { LexerError } from './errors';

export class Lexer {
  private input: string;
  private position: number = 0;
  private tokens: Token[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;

    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.position >= this.input.length) {
        break;
      }

      const char = this.input[this.position];

      // Single character tokens
      if (char === '(') {
        this.addToken('LPAREN', '(');
        this.position++;
        continue;
      }

      if (char === ')') {
        this.addToken('RPAREN', ')');
        this.position++;
        continue;
      }

      if (char === ',') {
        this.addToken('COMMA', ',');
        this.position++;
        continue;
      }

      if (char === '.') {
        this.addToken('DOT', '.');
        this.position++;
        continue;
      }

      // Operators
      if (this.isOperatorStart(char)) {
        this.readOperator();
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      // Numbers (including negative and relative dates like -7d)
      if (this.isDigit(char) || (char === '-' && this.isDigit(this.peek(1)))) {
        this.readNumber();
        continue;
      }

      // Identifiers and keywords
      if (this.isIdentifierStart(char)) {
        this.readIdentifier();
        continue;
      }

      // Unknown character
      throw new LexerError(`Unexpected character: ${char}`, this.position);
    }

    // Add EOF token
    this.addToken('EOF', '', this.position);

    return this.tokens;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private addToken(type: TokenType, value: string, position?: number): void {
    this.tokens.push({
      type,
      value,
      position: position ?? this.position - value.length,
      length: value.length,
    });
  }

  private peek(offset: number = 0): string {
    const pos = this.position + offset;
    return pos < this.input.length ? this.input[pos] : '';
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return ['=', '!', '>', '<', '~'].includes(char);
  }

  private readOperator(): void {
    const startPos = this.position;
    let op = this.input[this.position];
    this.position++;

    // Check for two-character operators
    const nextChar = this.peek();
    if (nextChar === '=' && ['!', '>', '<'].includes(op)) {
      op += nextChar;
      this.position++;
    } else if (op === '!' && nextChar === '~') {
      op += nextChar;
      this.position++;
    }

    this.addToken('OPERATOR', op, startPos);
  }

  private readString(quote: string): void {
    const startPos = this.position;
    this.position++; // Skip opening quote

    let value = '';
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === quote) {
        this.position++; // Skip closing quote
        this.addToken('STRING', value, startPos);
        return;
      }

      // Handle escape sequences
      if (char === '\\' && this.position + 1 < this.input.length) {
        const nextChar = this.input[this.position + 1];
        if (nextChar === quote || nextChar === '\\') {
          value += nextChar;
          this.position += 2;
          continue;
        }
      }

      value += char;
      this.position++;
    }

    throw new LexerError(`Unterminated string starting at position ${startPos}`, startPos);
  }

  private readNumber(): void {
    const startPos = this.position;
    let value = '';

    // Handle negative sign
    if (this.input[this.position] === '-') {
      value += '-';
      this.position++;
    }

    // Read digits
    while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    // Handle decimal point
    if (this.input[this.position] === '.' && this.isDigit(this.peek(1))) {
      value += '.';
      this.position++;
      while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
        value += this.input[this.position];
        this.position++;
      }
    }

    // Handle relative date suffix (d for days, w for weeks, m for months)
    if (['d', 'w', 'm', 'h'].includes(this.input[this.position]?.toLowerCase())) {
      value += this.input[this.position].toLowerCase();
      this.position++;
    }

    this.addToken('NUMBER', value, startPos);
  }

  private readIdentifier(): void {
    const startPos = this.position;
    let value = '';

    while (this.position < this.input.length && this.isIdentifierChar(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    const upperValue = value.toUpperCase();
    const lowerValue = value.toLowerCase();

    // Check if it's an entity name
    if (ENTITY_NAMES[lowerValue]) {
      this.addToken('ENTITY', lowerValue, startPos);
      return;
    }

    // Check if it's a keyword
    if (KEYWORDS.has(upperValue)) {
      this.addToken('KEYWORD', upperValue, startPos);
      return;
    }

    // Otherwise it's an identifier (field name)
    this.addToken('IDENTIFIER', value, startPos);
  }
}

// ============================================
// Helper Functions
// ============================================

export function tokenize(input: string): Token[] {
  const lexer = new Lexer(input);
  return lexer.tokenize();
}

export function getTokenAtPosition(tokens: Token[], position: number): Token | null {
  for (const token of tokens) {
    if (position >= token.position && position < token.position + token.length) {
      return token;
    }
  }
  return null;
}

export function getTokenBeforePosition(tokens: Token[], position: number): Token | null {
  let lastToken: Token | null = null;

  for (const token of tokens) {
    if (token.position >= position) {
      break;
    }
    lastToken = token;
  }

  return lastToken;
}
