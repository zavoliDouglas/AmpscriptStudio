// ssjs/rules/index.ts
// TODO(build together): regras específicas de SSJS (ex.: uso de var vs. let,
// APIs bloqueadas, Platform.Load correto). Placeholder por enquanto.
import type { Diagnostic } from '../../shared/types';

export function runSsjsRules(_source: string): Diagnostic[] {
  return [];
}
