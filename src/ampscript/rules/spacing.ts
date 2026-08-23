// ampscript/rules/spacing.ts
// Detecta falta de espaço após vírgulas e ao redor de operadores.
// Corresponde ao diagnóstico "Espaçamento inconsistente" do mockup.

import { segmentTemplate, SegmentType, lex, needSpace, TokenType, type Token } from '../tokenizer';
import type { Diagnostic } from '../../shared/types';

export function checkSpacing(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (seg.type !== SegmentType.BLOCK || seg.inner == null) continue;
    const tokens = lex(seg.inner);
    let prevMeaningful: Token | null = null;
    let sawSpaceSincePrev = false;

    for (const tok of tokens) {
      if (tok.type === TokenType.SPACE) { sawSpaceSincePrev = true; continue; }
      if (tok.type === TokenType.NEWLINE) { prevMeaningful = null; sawSpaceSincePrev = false; continue; }
      if (tok.type === TokenType.COMMENT) { prevMeaningful = tok; sawSpaceSincePrev = false; continue; }

      if (prevMeaningful && !sawSpaceSincePrev && needSpace(prevMeaningful, tok)) {
        diags.push({
          ruleId: 'spacing',
          severity: 'warning',
          title: 'Espaçamento inconsistente',
          detail: 'Adicione espaços após vírgulas e ao redor de operadores.',
          line: tok.line,
          column: tok.col,
        });
      }
      prevMeaningful = tok;
      sawSpaceSincePrev = false;
    }
  }
  return diags;
}
