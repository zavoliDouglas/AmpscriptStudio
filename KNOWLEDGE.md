# Base de conhecimento (fonte de verdade)

Tudo que o AMP Studio valida e formata se apoia na documentação oficial da
Salesforce. A base vive no repositório como **dados versionados** — não na
memória de uma sessão de chat.

## Fontes

| Fonte | Status | O que extraímos |
|-------|--------|-----------------|
| PDF da doc Salesforce (20 páginas, fornecido) | ✅ conteúdo real em contexto | Regras de sintaxe, strings de sistema/contexto/destinatário, assinaturas, tag-based syntax |
| ampscript.guide (índice público) | ✅ | Catálogo canônico de 152 funções → `src/ampscript/data/functions.ts` |
| developer.salesforce.com (online) | ⚠️ parcial | Corpo renderiza via JS; o PDF supre isso |
| ampscript.com | ⛔ bloqueado | robots.txt proíbe acesso automatizado |

## Regras extraídas do PDF e já implementadas

| Doc (página) | Vira no projeto |
|--------------|-----------------|
| Case Sensitivity → doc usa **Pascal case** | Formatter normaliza keywords para Set, If, Then, EndIf, For, Next, Var… |
| Adding AMPscript → **tag-based** script language=ampscript | Segmentador reconhece como bloco de código (formata e valida) |
| Adding AMPscript / Comments → inline só executa **uma função**, sem comentário/statement | Regras inline-statement / inline-comment |
| Message Context Variable → 10 valores válidos | Regra message-context |
| Function Parameters → ordem/aridade, opcionais | Regra arg-count + SIGNATURES (FormatCurrency, Lookup, Field…) |
| Case Sensitivity → funções canônicas | Formatter autocorrige grafia (lookup → Lookup) |

## Dados codificados

- **152 funções** em 17 categorias (data/functions.ts).
- **Assinaturas** de funções com aridade conhecida (SIGNATURES).
- **Strings do sistema/contexto/destinatário** (data/strings.ts): system date
  strings, valores de _messagecontext, personalization strings do remetente e
  do destinatário.

## Conjunto de regras ativas (AMPscript)

1. structure — blocos, IF/ENDIF, FOR/NEXT, strings, parênteses, script.
2. spacing — espaço após vírgula e ao redor de operadores.
3. indentation — corpo de blocos condicionais/loops indentado.
4. unknown-function / function-casing — catálogo canônico.
5. inline-statement / inline-comment — restrições do inline.
6. message-context — valores válidos de _messagecontext.
7. arg-count — nº de argumentos conforme assinatura.

## O que ainda dá pra crescer

- Preencher mais assinaturas em SIGNATURES (uma por vez, direto da doc).
- Validar ENT. prefix (Enterprise Awareness) nas funções Lookup.
- Autocomplete/realce usando data/strings.ts e o catálogo.
- SSJS (aba bloqueada por ora — "em breve").
