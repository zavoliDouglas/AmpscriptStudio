// ampscript/parser.ts
// "Parser" leve: por enquanto faz a análise ESTRUTURAL e devolve diagnósticos
// (blocos e pares IF/ENDIF, FOR/NEXT, strings, parênteses). A construção de uma
// AST completa fica como TODO para evoluirmos juntos — a base de tokens já
// permite crescer para lá quando precisarmos (ex.: análise de tipos, escopo).

import { segmentTemplate, SegmentType, lex, TokenType, isCodeBlock } from './tokenizer';
import type { Diagnostic } from '../shared/types';

export function analyzeStructure(source: string): Diagnostic[] {
  const diags: Diagnostic[] = [];
  for (const seg of segmentTemplate(source)) {
    if (seg.type === SegmentType.BLOCK && seg.unterminated) {
      diags.push(err('structure', 'Bloco não fechado', 'Abra %%[ e feche com ]%%.'));
    } else if (seg.type === SegmentType.INLINE && seg.unterminated) {
      diags.push(err('structure', 'Saída inline não fechada', 'Feche a saída %%= ... =%%.'));
    } else if (seg.type === SegmentType.SCRIPT && seg.unterminated) {
      diags.push(err('structure', 'Bloco <script> não fechado', 'Feche o bloco com </script>.'));
    } else if (isCodeBlock(seg) && seg.inner != null) {
      analyzeBlock(seg.inner, diags);
    }
  }
  return diags;
}

function analyzeBlock(inner: string, diags: Diagnostic[]): void {
  const stack: Array<{ kw: 'IF' | 'FOR'; line: number }> = [];
  let parenDepth = 0;

  for (const tok of lex(inner)) {
    if (tok.type === TokenType.STRING && tok.unterminated) {
      diags.push(err('structure', 'String não fechada', 'Falta aspas de fechamento.', tok.line));
    }
    if (tok.type === TokenType.COMMENT && tok.unterminated) {
      diags.push(err('structure', 'Comentário não fechado', 'Abriu /* mas não fechou */.', tok.line));
    }
    if (tok.type === TokenType.LPAREN) parenDepth++;
    if (tok.type === TokenType.RPAREN) {
      if (--parenDepth < 0) {
        diags.push(err('structure', 'Parêntese extra', 'Há ) sem ( correspondente.', tok.line));
        parenDepth = 0;
      }
    }
    if (tok.type === TokenType.KEYWORD) {
      const kw = tok.value.toUpperCase();
      if (kw === 'IF') stack.push({ kw: 'IF', line: tok.line });
      else if (kw === 'FOR') stack.push({ kw: 'FOR', line: tok.line });
      else if (kw === 'ENDIF') {
        if (stack[stack.length - 1]?.kw !== 'IF') diags.push(err('structure', 'ENDIF sem IF', 'ENDIF sem um IF aberto.', tok.line));
        else stack.pop();
      } else if (kw === 'NEXT') {
        if (stack[stack.length - 1]?.kw !== 'FOR') diags.push(err('structure', 'NEXT sem FOR', 'NEXT sem um FOR aberto.', tok.line));
        else stack.pop();
      } else if ((kw === 'ELSE' || kw === 'ELSEIF') && !stack.some((s) => s.kw === 'IF')) {
        diags.push({ ruleId: 'structure', severity: 'warning', title: `${kw} fora de IF`, detail: `${kw} deve estar dentro de um bloco IF.`, line: tok.line });
      }
    }
  }

  if (parenDepth > 0) diags.push(err('structure', 'Parêntese não fechado', `${parenDepth} parêntese(s) ( sem fechamento.`));
  for (const open of stack) {
    const missing = open.kw === 'IF' ? 'ENDIF' : 'NEXT';
    diags.push(err('structure', `${open.kw} sem ${missing}`, `Abriu ${open.kw} mas faltou ${missing}.`, open.line));
  }
}

function err(ruleId: string, title: string, detail: string, line?: number): Diagnostic {
  return { ruleId, severity: 'error', title, detail, line };
}
