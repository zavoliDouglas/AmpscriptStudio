// ampscript/rules/index.ts
// Agrega todas as regras de lint do AMPscript. Para adicionar uma regra nova,
// crie o arquivo em rules/ e registre aqui.

import { checkSpacing } from './spacing';
import { checkIndentation } from './indentation';
import type { Diagnostic } from '../../shared/types';

export function runRules(source: string): Diagnostic[] {
  return [
    ...checkSpacing(source),
    ...checkIndentation(source),
  ];
}
