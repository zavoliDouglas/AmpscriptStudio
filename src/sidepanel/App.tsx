// sidepanel/App.tsx
// Casca da UI seguindo o mockup: cabeçalho com nome do asset, alternância
// AMPscript/SSJS, editor, ação primária "Formatar e validar", diagnósticos
// e rodapé indicando validação local. Ligada ao core via analyze().

import { useState } from 'react';
import { Editor } from './Editor';
import { Diagnostics } from './Diagnostics';
import { analyze } from '../shared/analyze';
import type { AnalysisResult, Language } from '../shared/types';

const SAMPLE = `%%[
VAR @nome,@cliente
SET @nome=AttributeValue("FirstName")
IF Empty(@nome) THEN
SET @nome="Cliente"
ELSE
SET @cliente=true
ENDIF
]%%`;

// TODO(build together): puxar o nome do asset atual do Content Builder.
const ASSET_NAME = 'MC_CAP_DEMO_SVM_DN_FREE';

export function App() {
  // Por enquanto só AMPscript; a aba SSJS está bloqueada (em breve).
  const language: Language = 'ampscript';
  const [code, setCode] = useState(SAMPLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);

  const lineCount = code.split('\n').length;

  async function onFormat() {
    setBusy(true);
    try {
      const r = await analyze(language, code);
      setResult(r);
      setCode(r.formatted);
    } finally {
      setBusy(false);
    }
  }

  async function onCopy() {
    try { await navigator.clipboard.writeText(code); } catch { /* ignore */ }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">%%</div>
        <div>
          <h1 className="app__title">AMP Studio</h1>
          <p className="app__asset">{ASSET_NAME}</p>
        </div>
        <button className="app__gear" title="Configurações" aria-label="Configurações">⚙</button>
      </header>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={language === 'ampscript'}
          className="tab tab--active"
        >
          AMPscript
        </button>
        <button
          role="tab"
          aria-selected={false}
          className="tab tab--disabled"
          disabled
          title="Em breve"
        >
          SSJS <span className="tab__soon">em breve</span>
        </button>
      </div>

      <div className="section-head">
        <span>Código selecionado</span>
        <span className="muted">{lineCount} linhas</span>
      </div>

      <Editor value={code} onChange={setCode} />

      <div className="actions">
        <button className="btn btn--primary" onClick={onFormat} disabled={busy}>
          {busy ? 'Processando…' : '✦ Formatar e validar'}
        </button>
        <button className="btn" onClick={onCopy}>⧉ Copiar</button>
      </div>

      <Diagnostics diagnostics={result?.diagnostics ?? []} />

      <footer className="app__footer">
        <span>Validação local</span>
        <span className="muted">Nenhum código enviado</span>
      </footer>
    </div>
  );
}
