// ampscript/rules/inline.ts
// Doc (Adding AMPscript / Comments): inline (%%= =%%) executa APENAS uma função
// (pode aninhar), e NÃO aceita comentários nem statements (Set, If, For, Var...).

import { segmentTemplate, SegmentType, lex, TokenType, STATEMENT_KEYWORDS } from '../tokenizer';
import type { Diagnostic } from '../../shared/types';

export function checkInline(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (seg.type !== SegmentType.INLINE || seg.inner == null) continue;
    for (const tok of lex(seg.inner)) {
      if (tok.type === TokenType.COMMENT) {
        diags.push({
          ruleId: 'inline-comment', severity: 'error',
          title: 'Comentário em inline',
          detail: 'Comentários não são permitidos em AMPscript inline (%%= =%%).',
          line: tok.line, column: tok.col,
        });
      } else if (tok.type === TokenType.KEYWORD && STATEMENT_KEYWORDS.has(tok.value.toUpperCase())) {
        diags.push({
          ruleId: 'inline-statement', severity: 'error',
          title: 'Statement em inline',
          detail: `"${tok.value}" não é permitido inline. Inline executa apenas uma função — use um bloco %%[ ]%%.`,
          line: tok.line, column: tok.col,
        });
      }
    }
  }
  return diags;
}
