// shared/analyze.ts
// Ponto único de entrada da UI: despacha por linguagem.
import { analyzeAmpscript } from '../ampscript';
import { analyzeSsjs } from '../ssjs';
import type { AnalysisResult, Language } from './types';

export async function analyze(language: Language, source: string): Promise<AnalysisResult> {
  if (language === 'ampscript') return analyzeAmpscript(source);
  return analyzeSsjs(source);
}
