// ampscript/rules/index.ts
// Agrega todas as regras de lint do AMPscript. Para adicionar uma regra nova,
// crie o arquivo em rules/ e registre aqui.

import { checkSpacing } from './spacing';
import { checkIndentation } from './indentation';
import { checkUnknownFunctions } from './unknown-function';
import { checkInline } from './inline';
import { checkMessageContext } from './message-context';
import { checkArgCount } from './arg-count';
import type { Diagnostic } from '../../shared/types';

export function runRules(source: string): Diagnostic[] {
  return [
    ...checkSpacing(source),
    ...checkIndentation(source),
    ...checkUnknownFunctions(source),
    ...checkInline(source),
    ...checkMessageContext(source),
    ...checkArgCount(source),
  ];
}
