// ampscript/rules/indentation.ts
// Detecta comandos dentro de IF/FOR que não estão indentados.
// Corresponde ao diagnóstico "Indentação recomendada" do mockup.

import { segmentTemplate, SegmentType, lex, TokenType, type Token } from '../tokenizer';
import type { Diagnostic } from '../../shared/types';

const UNIT = 2; // espaços esperados por nível

export function checkIndentation(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (seg.type !== SegmentType.BLOCK || seg.inner == null) continue;
    checkBlock(seg.inner, diags);
  }
  return diags;
}

function checkBlock(inner: string, diags: Diagnostic[]): void {
  const tokens = lex(inner);
  // Agrupa por linha preservando o SPACE inicial (indentação real).
  const lines = new Map<number, { indent: number; first: Token | null; kw: string | null }>();
  for (const tok of tokens) {
    if (tok.type === TokenType.NEWLINE) continue;
    let entry = lines.get(tok.line);
    if (!entry) { entry = { indent: 0, first: null, kw: null }; lines.set(tok.line, entry); }
    if (tok.type === TokenType.SPACE && entry.first === null) {
      entry.indent += tok.value.replace(/\t/g, '  ').length;
    } else if (entry.first === null && tok.type !== TokenType.SPACE) {
      entry.first = tok;
      entry.kw = tok.type === TokenType.KEYWORD ? tok.value.toUpperCase() : null;
    }
  }

  let depth = 0;
  for (const [line, info] of [...lines.entries()].sort((a, b) => a[0] - b[0])) {
    if (!info.first) continue;
    const kw = info.kw;
    if (kw === 'ENDIF' || kw === 'NEXT') depth = Math.max(0, depth - 1);
    let expectedDepth = depth;
    if (kw === 'ELSE' || kw === 'ELSEIF') expectedDepth = Math.max(0, depth - 1);

    if (expectedDepth > 0 && info.indent < expectedDepth * UNIT) {
      diags.push({
        ruleId: 'indentation',
        severity: 'info',
        title: 'Indentação recomendada',
        detail: 'Indente os comandos internos do bloco condicional.',
        line,
      });
    }
    if (kw === 'IF' || kw === 'FOR') depth++;
  }
}
