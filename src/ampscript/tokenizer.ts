// ampscript/tokenizer.ts
// Duas camadas léxicas:
//  1. segmentTemplate(): separa HTML de blocos %%[ ]%% e saídas %%= =%%.
//  2. lex(): quebra o conteúdo de um bloco em tokens.
//
// Mantemos tokens de SPACE e NEWLINE no fluxo porque as regras de lint
// (spacing/indentation) precisam saber onde havia — ou faltava — espaço.

export const SegmentType = {
  HTML: 'html',
  BLOCK: 'block',   // %%[ ... ]%%
  INLINE: 'inline', // %%= ... =%%
} as const;
export type SegmentKind = (typeof SegmentType)[keyof typeof SegmentType];

export interface Segment {
  type: SegmentKind;
  value: string;
  /** Conteúdo interno (sem os delimitadores) — só para BLOCK/INLINE. */
  inner?: string;
  unterminated?: boolean;
}

export function segmentTemplate(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  const n = input.length;
  let htmlStart = 0;

  const pushHtml = (end: number) => {
    if (end > htmlStart) segments.push({ type: SegmentType.HTML, value: input.slice(htmlStart, end) });
  };

  while (i < n) {
    if (input.startsWith('%%[', i)) {
      pushHtml(i);
      const close = input.indexOf(']%%', i + 3);
      const end = close === -1 ? n : close + 3;
      segments.push({
        type: SegmentType.BLOCK,
        value: input.slice(i, end),
        inner: input.slice(i + 3, close === -1 ? n : close),
        unterminated: close === -1,
      });
      i = end;
      htmlStart = i;
    } else if (input.startsWith('%%=', i)) {
      pushHtml(i);
      const close = input.indexOf('=%%', i + 3);
      const end = close === -1 ? n : close + 3;
      segments.push({
        type: SegmentType.INLINE,
        value: input.slice(i, end),
        inner: input.slice(i + 3, close === -1 ? n : close),
        unterminated: close === -1,
      });
      i = end;
      htmlStart = i;
    } else {
      i++;
    }
  }
  pushHtml(n);
  return segments;
}

// ---------------------------------------------------------------------------

export const TokenType = {
  NEWLINE: 'newline',
  SPACE: 'space',
  COMMENT: 'comment',
  STRING: 'string',
  VAR: 'var',
  NUMBER: 'number',
  IDENT: 'ident',
  KEYWORD: 'keyword',
  OP: 'op',
  COMMA: 'comma',
  LPAREN: 'lparen',
  RPAREN: 'rparen',
  UNKNOWN: 'unknown',
} as const;
export type TokenKind = (typeof TokenType)[keyof typeof TokenType];

export interface Token {
  type: TokenKind;
  value: string;
  line: number;
  col: number;
  unterminated?: boolean;
}

export const KEYWORDS = new Set([
  'SET', 'VAR', 'IF', 'THEN', 'ELSEIF', 'ELSE', 'ENDIF',
  'FOR', 'TO', 'DOWNTO', 'DO', 'NEXT', 'AND', 'OR', 'NOT',
]);

const isIdentStart = (c: string) => /[A-Za-z_]/.test(c);
const isIdentPart = (c: string) => /[A-Za-z0-9_]/.test(c);
const isDigit = (c: string) => c >= '0' && c <= '9';

export function lex(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;
  let line = 1;
  let col = 1;

  const push = (type: TokenKind, value: string, extra: Partial<Token> = {}) => {
    tokens.push({ type, value, line, col, ...extra });
    for (const ch of value) {
      if (ch === '\n') { line++; col = 1; } else { col++; }
    }
  };

  while (i < n) {
    const c = src[i];

    if (c === '\n') { push(TokenType.NEWLINE, '\n'); i++; continue; }
    if (c === '\r') {
      if (src[i + 1] === '\n') { push(TokenType.NEWLINE, '\r\n'); i += 2; }
      else { push(TokenType.NEWLINE, '\r'); i++; }
      continue;
    }
    if (c === ' ' || c === '\t') {
      let j = i;
      while (j < n && (src[j] === ' ' || src[j] === '\t')) j++;
      push(TokenType.SPACE, src.slice(i, j)); i = j; continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      push(TokenType.COMMENT, src.slice(i, stop), { unterminated: end === -1 });
      i = stop; continue;
    }
    if (c === '"') {
      let j = i + 1;
      let terminated = false;
      while (j < n) {
        if (src[j] === '"') {
          if (src[j + 1] === '"') { j += 2; continue; } // "" = aspas escapadas
          terminated = true; j++; break;
        }
        j++;
      }
      push(TokenType.STRING, src.slice(i, j), { unterminated: !terminated });
      i = j; continue;
    }
    if (c === '@') {
      let j = i + 1;
      while (j < n && isIdentPart(src[j])) j++;
      push(TokenType.VAR, src.slice(i, j)); i = j; continue;
    }
    if (isDigit(c)) {
      let j = i;
      while (j < n && (isDigit(src[j]) || src[j] === '.')) j++;
      push(TokenType.NUMBER, src.slice(i, j)); i = j; continue;
    }
    if (isIdentStart(c)) {
      let j = i;
      while (j < n && isIdentPart(src[j])) j++;
      const word = src.slice(i, j);
      const type = KEYWORDS.has(word.toUpperCase()) ? TokenType.KEYWORD : TokenType.IDENT;
      push(type, word); i = j; continue;
    }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '<>', '>=', '<=', '&&', '||'].includes(two)) {
      push(TokenType.OP, two); i += 2; continue;
    }
    if ('=<>+-*/%'.includes(c)) { push(TokenType.OP, c); i++; continue; }
    if (c === ',') { push(TokenType.COMMA, c); i++; continue; }
    if (c === '(') { push(TokenType.LPAREN, c); i++; continue; }
    if (c === ')') { push(TokenType.RPAREN, c); i++; continue; }

    push(TokenType.UNKNOWN, c); i++;
  }
  return tokens;
}

/** Regra de espaçamento entre dois tokens — compartilhada pelo formatter e pela regra de lint. */
export function needSpace(prev: Token | null, cur: Token): boolean {
  if (!prev) return false;
  if (cur.type === TokenType.COMMA) return false;
  if (prev.type === TokenType.LPAREN) return false;
  if (cur.type === TokenType.RPAREN) return false;
  if (prev.type === TokenType.IDENT && cur.type === TokenType.LPAREN) return false; // Func(
  if (prev.type === TokenType.COMMA) return true;
  if (prev.type === TokenType.OP || cur.type === TokenType.OP) return true;
  return true;
}
