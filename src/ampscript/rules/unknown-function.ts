// ampscript/rules/unknown-function.ts
// Usa o catálogo canônico como base de verdade:
//  - função chamada mas fora do catálogo  -> aviso "Função desconhecida"
//  - função certa com grafia divergente    -> info "Ajustar grafia" (ex.: lookup -> Lookup)
//
// Detecta chamada de função como IDENT seguido imediatamente de "(".

import { segmentTemplate, SegmentType, lex, TokenType, isCodeBlock, type Token } from '../tokenizer';
import { isKnownFunction, canonicalName } from '../data/functions';
import type { Diagnostic } from '../../shared/types';

export function checkUnknownFunctions(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    // Funções aparecem tanto em blocos quanto em saídas inline (%%=Func()=%%).
    if (!(isCodeBlock(seg) || seg.type === SegmentType.INLINE) || seg.inner == null) continue;
    scan(lex(seg.inner), diags);
  }
  return diags;
}

function scan(tokens: Token[], diags: Diagnostic[]): void {
  const meaningful = tokens.filter((t) => t.type !== TokenType.SPACE && t.type !== TokenType.NEWLINE);
  for (let i = 0; i < meaningful.length - 1; i++) {
    const tok = meaningful[i];
    const next = meaningful[i + 1];
    if (tok.type !== TokenType.IDENT || next.type !== TokenType.LPAREN) continue;

    const canonical = canonicalName(tok.value);
    if (!isKnownFunction(tok.value)) {
      diags.push({
        ruleId: 'unknown-function',
        severity: 'warning',
        title: 'Função desconhecida',
        detail: `"${tok.value}" não consta no catálogo de funções AMPscript.`,
        line: tok.line,
        column: tok.col,
      });
    } else if (canonical && canonical !== tok.value) {
      diags.push({
        ruleId: 'function-casing',
        severity: 'info',
        title: 'Ajustar grafia da função',
        detail: `Use a grafia canônica: "${canonical}" em vez de "${tok.value}".`,
        line: tok.line,
        column: tok.col,
      });
    }
  }
}
