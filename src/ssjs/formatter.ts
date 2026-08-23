// ssjs/formatter.ts
// SSJS é essencialmente JavaScript (ECMAScript 3, motor Rhino). Vamos formatar
// com o Prettier standalone. Por enquanto é um stub funcional — a gente refina
// as opções e o tratamento de erro juntos.
//
// TODO(build together):
//  - importar prettier/standalone + prettier/plugins/babel + estree
//  - lidar com blocos <script runat="server"> ... </script> (extrair/reinserir)

import type { AnalysisResult } from '../shared/types';

export async function analyzeSsjs(source: string): Promise<AnalysisResult> {
  try {
    // Import dinâmico pra não pesar no bundle quando o usuário só usa AMPscript.
    const prettier = await import('prettier/standalone');
    const babel = await import('prettier/plugins/babel');
    const estree = await import('prettier/plugins/estree');

    const formatted = await prettier.format(source, {
      parser: 'babel',
      plugins: [babel.default ?? babel, estree.default ?? estree],
      singleQuote: false,
      semi: true,
    });

    return { formatted: formatted.trimEnd(), diagnostics: [] };
  } catch (e) {
    return {
      formatted: source,
      diagnostics: [{
        ruleId: 'ssjs-parse',
        severity: 'error',
        title: 'Não foi possível formatar',
        detail: e instanceof Error ? e.message : 'Erro de sintaxe no SSJS.',
      }],
    };
  }
}
