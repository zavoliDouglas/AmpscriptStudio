// ampscript/index.ts
// API pública do módulo AMPscript: formata + valida em uma chamada.

import { formatAmpscript } from './formatter';
import { analyzeStructure } from './parser';
import { runRules } from './rules';
import type { AnalysisResult } from '../shared/types';

export function analyzeAmpscript(source: string): AnalysisResult {
  const diagnostics = [...analyzeStructure(source), ...runRules(source)];
  return { formatted: formatAmpscript(source), diagnostics };
}

export { formatAmpscript } from './formatter';
export { analyzeStructure } from './parser';
