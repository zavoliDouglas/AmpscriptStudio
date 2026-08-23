// ampscript/formatter.ts
// Reemite o AMPscript formatado: keywords em MAIÚSCULO, espaçamento
// consistente e indentação por nível de IF/FOR. Não toca no HTML.

import { segmentTemplate, SegmentType, lex, needSpace, TokenType, type Token } from './tokenizer';

const INDENT = '  '; // 2 espaços

function splitLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [];
  let cur: Token[] = [];
  for (const t of tokens) {
    if (t.type === TokenType.NEWLINE) { lines.push(cur); cur = []; }
    else if (t.type !== TokenType.SPACE) cur.push(t);
  }
  lines.push(cur);
  return lines;
}

function firstKeyword(line: Token[]): string | null {
  const t = line.find((x) => x.type !== TokenType.COMMENT);
  return t && t.type === TokenType.KEYWORD ? t.value.toUpperCase() : null;
}

function renderTokens(line: Token[]): string {
  let out = '';
  let prev: Token | null = null;
  for (const t of line) {
    const val = t.type === TokenType.KEYWORD ? t.value.toUpperCase() : t.value;
    if (prev && needSpace(prev, t)) out += ' ';
    out += val;
    prev = t;
  }
  return out;
}

export function formatBlockInner(inner: string): string {
  const lines = splitLines(lex(inner));
  const out: string[] = [];
  let depth = 0;
  for (const line of lines) {
    if (line.length === 0) { out.push(''); continue; }
    const kw = firstKeyword(line);
    if (kw === 'ENDIF' || kw === 'NEXT') depth = Math.max(0, depth - 1);
    let renderDepth = depth;
    if (kw === 'ELSE' || kw === 'ELSEIF') renderDepth = Math.max(0, depth - 1);
    const text = renderTokens(line);
    out.push(text ? INDENT.repeat(renderDepth) + text : '');
    if (kw === 'IF' || kw === 'FOR') depth++;
  }
  while (out.length && out[0] === '') out.shift();
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
}

export function formatInlineInner(inner: string): string {
  const tokens = lex(inner).filter((t) => t.type !== TokenType.SPACE && t.type !== TokenType.NEWLINE);
  return renderTokens(tokens);
}

export function formatAmpscript(source: string): string {
  let out = '';
  for (const seg of segmentTemplate(source)) {
    if (seg.type === SegmentType.HTML) {
      out += seg.value;
    } else if (seg.type === SegmentType.INLINE) {
      out += seg.unterminated ? seg.value : `%%=${formatInlineInner(seg.inner ?? '')}=%%`;
    } else {
      if (seg.unterminated) { out += seg.value; continue; }
      const body = formatBlockInner(seg.inner ?? '')
        .split('\n')
        .map((l) => (l ? INDENT + l : ''))
        .join('\n');
      out += `%%[\n${body}\n]%%`;
    }
  }
  return out;
}
