// ampscript/rules/message-context.ts
// Doc (Message Context Variable): _messagecontext só assume 10 valores. Se o
// código comparar _messagecontext com uma string fora dessa lista, é provável bug.

import { segmentTemplate, lex, TokenType, isCodeBlock } from '../tokenizer';
import { MESSAGE_CONTEXT_VALUES } from '../data/strings';
import type { Diagnostic } from '../../shared/types';

export function checkMessageContext(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (!isCodeBlock(seg) || seg.inner == null) continue;
    const toks = lex(seg.inner).filter((t) => t.type !== TokenType.SPACE && t.type !== TokenType.NEWLINE);
    for (let i = 0; i < toks.length - 2; i++) {
      const a = toks[i], op = toks[i + 1], val = toks[i + 2];
      const isCtx = a.type === TokenType.IDENT && a.value.toUpperCase() === '_MESSAGECONTEXT';
      const isCmp = op.type === TokenType.OP && (op.value === '==' || op.value === '!=' || op.value === '<>');
      if (isCtx && isCmp && val.type === TokenType.STRING) {
        const raw = unquote(val.value);
        if (!MESSAGE_CONTEXT_VALUES.has(raw.toUpperCase())) {
          diags.push({
            ruleId: 'message-context', severity: 'warning',
            title: 'Valor de _messagecontext inválido',
            detail: `"${raw}" não é um contexto válido. Use um de: ${[...MESSAGE_CONTEXT_VALUES].join(', ')}.`,
            line: val.line, column: val.col,
          });
        }
      }
    }
  }
  return diags;
}

function unquote(s: string): string {
  return s.replace(/^"|"$/g, '').replace(/""/g, '"');
}
