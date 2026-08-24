// ampscript/rules/arg-count.ts
// Doc (Function Parameters): funções têm parâmetros ordenados, alguns opcionais.
// Conferimos a aridade das funções cuja assinatura conhecemos (SIGNATURES),
// contando argumentos de nível superior (respeitando parênteses aninhados).

import { segmentTemplate, SegmentType, lex, TokenType, isCodeBlock, type Token } from '../tokenizer';
import { signatureOf } from '../data/functions';
import type { Diagnostic } from '../../shared/types';

export function checkArgCount(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (!(isCodeBlock(seg) || seg.type === SegmentType.INLINE) || seg.inner == null) continue;
    const toks = lex(seg.inner).filter((t) => t.type !== TokenType.SPACE && t.type !== TokenType.NEWLINE);
    scan(toks, diags);
  }
  return diags;
}

function scan(toks: Token[], diags: Diagnostic[]): void {
  for (let i = 0; i < toks.length - 1; i++) {
    const fn = toks[i];
    if (fn.type !== TokenType.IDENT || toks[i + 1].type !== TokenType.LPAREN) continue;
    const sig = signatureOf(fn.value);
    if (!sig) continue;

    // Conta argumentos de nível 1 a partir do '(' em i+1.
    let depth = 0;
    let commas = 0;
    let sawArg = false;
    let j = i + 1;
    for (; j < toks.length; j++) {
      const t = toks[j];
      if (t.type === TokenType.LPAREN) { depth++; continue; }
      if (t.type === TokenType.RPAREN) { depth--; if (depth === 0) break; continue; }
      if (depth === 1) {
        sawArg = true;
        if (t.type === TokenType.COMMA) commas++;
      }
    }
    const args = sawArg ? commas + 1 : 0;

    if (args < sig.min || (sig.max != null && args > sig.max)) {
      const expected = sig.max == null
        ? `pelo menos ${sig.min}`
        : sig.min === sig.max ? `${sig.min}` : `${sig.min}–${sig.max}`;
      diags.push({
        ruleId: 'arg-count', severity: 'warning',
        title: 'Número de argumentos',
        detail: `${fn.value}() espera ${expected} argumento(s), mas recebeu ${args}.`,
        line: fn.line, column: fn.col,
      });
    }
  }
}
