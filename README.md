# AMP Studio

Extensão Chrome (Manifest V3) que **formata, valida e corrige AMPscript** dentro
do Content Builder do Salesforce Marketing Cloud, num **side panel** persistente.
Toda a análise é **local** — nenhum código sai do navegador.

Fonte de verdade: documentação oficial da Salesforce + índice do ampscript.guide
(ver `KNOWLEDGE.md`).

## Stack

- Node.js + TypeScript (dev/build/testes — não roda servidor Node no navegador)
- Vite (side panel React) + esbuild (content script e service worker)
- React · Manifest V3 · Side Panel API
- Vitest para testes · parser próprio de AMPscript

## Rodar do zero

Pré-requisito: Node.js 18+ instalado.

```bash
npm install
npm test          # 22 testes do core
npm run typecheck # checagem de tipos
npm run dev       # abre o side panel em http://localhost:5173/sidepanel.html
npm run build     # gera dist/ pronto para o Chrome
```

### Windows / PowerShell

Se o `npm` der erro de "execution policy" (scripts .ps1 bloqueados), use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

Ou libere de vez para o seu usuário (recomendado):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Carregar a extensão no Chrome

1. `npm run build`
2. Acesse `chrome://extensions`
3. Ative o **Modo do desenvolvedor**
4. **Carregar sem compactação** → selecione a pasta `dist/`
5. Abra o Content Builder e clique no ícone para abrir o side panel

## Subir no seu GitHub

O projeto já vem com git inicializado e commits. Para publicar:

```bash
# com GitHub CLI:
gh repo create amp-studio --private --source=. --remote=origin --push

# ou manual (crie um repo vazio em github.com/new, sem README):
git remote add origin https://github.com/SEU_USUARIO/amp-studio.git
git branch -M main
git push -u origin main
```

## O que funciona hoje (AMPscript)

**Formatação**
- Keywords em Pascal case (`Set`, `If`, `Then`, `EndIf`, `For`, `Next`, `Var`)
- Indentação por nível de `IF`/`FOR`
- Espaçamento consistente (vírgulas e operadores)
- Autocorreção da grafia de funções (`lookup` → `Lookup`)
- Preserva o HTML; formata `%%[ ]%%`, `%%= =%%` e `<script language="ampscript">`

**Validação (regras)**
- `structure` — blocos, `IF/ENDIF`, `FOR/NEXT`, strings, parênteses, `<script>`
- `spacing` / `indentation`
- `unknown-function` / `function-casing` (catálogo de 152 funções)
- `inline-statement` / `inline-comment` (inline só executa uma função)
- `message-context` (valores válidos de `_messagecontext`)
- `arg-count` (nº de argumentos por assinatura conhecida)

**UI**
- Aba SSJS bloqueada ("em breve")

## Estrutura

```
src/
├── ampscript/
│   ├── tokenizer.ts      segmenta HTML×código, lexer, Pascal case
│   ├── parser.ts         análise estrutural
│   ├── formatter.ts      formatação + autocorreções
│   ├── rules/            spacing, indentation, unknown-function,
│   │                     inline, message-context, arg-count
│   └── data/             functions.ts (catálogo+assinaturas), strings.ts
├── ssjs/                 stubs (em breve)
├── sidepanel/            App, Editor, Diagnostics (React)
├── content-script/       contentBuilder.ts
├── background/           service-worker.ts
└── shared/               types.ts, analyze.ts
tests/                    ampscript.test.ts
```

## Roadmap

- Preencher mais assinaturas em `SIGNATURES` (uma a uma, direto da doc)
- CodeMirror 6 com realce de AMPscript
- Content script capturar a seleção real do editor + "Aplicar no editor"
- Validar prefixo `ENT.` (Enterprise Awareness)
- SSJS (desbloquear a aba)
