// shared/types.ts
// Tipos usados tanto pelo core (ampscript/ssjs) quanto pela UI.

export type Language = 'ampscript' | 'ssjs';

export type Severity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  /** Regra que gerou o diagnóstico (ex.: 'spacing', 'indentation', 'structure'). */
  ruleId: string;
  severity: Severity;
  /** Título curto, ex.: "Espaçamento inconsistente". */
  title: string;
  /** Explicação orientada à ação, ex.: "Adicione espaços após vírgulas...". */
  detail: string;
  /** Linha (1-based) dentro do trecho analisado, quando aplicável. */
  line?: number;
  column?: number;
}

export interface AnalysisResult {
  /** Código já formatado (mesmo que existam sugestões). */
  formatted: string;
  /** Lista de problemas/sugestões encontrados. */
  diagnostics: Diagnostic[];
}
