# AMP Studio

Extensão Chrome (Manifest V3) que **formata e valida AMPscript e SSJS** dentro do
Content Builder do Salesforce Marketing Cloud, num **side panel** persistente.
Toda a análise é **local** — nenhum código sai do navegador.

> Status: **scaffold**. Estrutura e a lógica-base do AMPscript já funcionam e
> têm testes. UI, SSJS e integração com o editor estão como stubs marcados com
> `TODO(build together)` para evoluirmos juntos.

## Stack

- **Node.js + TypeScript** (dev/build/testes — não roda servidor Node no navegador)
- **Vite** para o side panel (React) + **esbuild** para content script e service worker
- **React** na interface / **Manifest V3** + **Side Panel API**
- **CodeMirror 6** (deps instaladas; editor ainda como `<textarea>` no MVP)
- **Prettier** (standalone) para SSJS
- **Vitest** para os testes
- Parser próprio para AMPscript

## Arquitetura

```
sidepanel (React)              content-script            background
  App.tsx                        contentBuilder.ts         service-worker.ts
   ├─ Editor.tsx                  (lê seleção do             (abre o side panel
   ├─ Diagnostics.tsx             Content Builder)            no clique do ícone)
   └─ analyze(language, code) ─┐
                               │
        shared/analyze.ts  ────┤ despacha por linguagem
                               │
      ampscript/               │            ssjs/
        tokenizer.ts  (segmenta HTML×AMPscript, lexer)   formatter.ts (Prettier)
        parser.ts     (estrutura: IF/FOR, blocos)        rules/       (TODO)
        formatter.ts  (reindenta, normaliza)
        rules/
          spacing.ts       → "Espaçamento inconsistente"
          indentation.ts   → "Indentação recomendada"
```

O fluxo do core: `tokenizer` separa HTML de código e gera tokens → `parser`
checa a estrutura → `rules` produzem as sugestões → `formatter` devolve o
código arrumado. É `analyzeAmpscript(source)` que junta tudo.

## Comandos

```bash
npm install
npm test        # roda os testes do core (Vitest)
npm run typecheck
npm run dev      # abre o side panel isolado no navegador (desenvolvimento)
npm run build    # gera dist/ pronta para carregar no Chrome
```

Carregar no Chrome: `chrome://extensions` → Modo do desenvolvedor →
**Carregar sem compactação** → selecione a pasta `dist/`.

## Roadmap (o que vamos construir juntos)

- [ ] Trocar o `<textarea>` por CodeMirror 6 com realce de AMPscript.
- [ ] Content script pegar o trecho selecionado do editor real (CodeMirror/ACE).
- [ ] Puxar o nome do asset atual pro cabeçalho.
- [ ] SSJS: extrair `<script runat="server">`, formatar com Prettier, regras próprias.
- [ ] Clicar no diagnóstico e pular pra linha.
- [ ] "Aplicar no editor" com backup/undo.
- [ ] Atalho `Ctrl+Shift+F` e configurações de indentação.
- [ ] Ícones da extensão em `public/icons/`.
```
```
