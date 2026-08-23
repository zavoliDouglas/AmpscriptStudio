// sidepanel/Diagnostics.tsx
// Lista de diagnósticos/sugestões, com o ícone por severidade e a linha (Lx),
// como no mockup ("Espaçamento inconsistente L2", "Indentação recomendada L5").

import type { Diagnostic } from '../shared/types';

const ICON: Record<Diagnostic['severity'], string> = {
  error: '⛔',
  warning: '≡',
  info: '→',
};

export function Diagnostics({ diagnostics }: { diagnostics: Diagnostic[] }) {
  return (
    <section className="diag">
      <div className="section-head">
        <span>Diagnóstico</span>
        {diagnostics.length > 0 && (
          <span className="badge">{diagnostics.length} sugest{diagnostics.length === 1 ? 'ão' : 'ões'}</span>
        )}
      </div>

      {diagnostics.length === 0 ? (
        <p className="muted diag__empty">Nenhum problema encontrado.</p>
      ) : (
        <ul className="diag__list">
          {diagnostics.map((d, i) => (
            <li key={i} className={`diag__item diag__item--${d.severity}`}>
              <span className="diag__icon">{ICON[d.severity]}</span>
              <div className="diag__body">
                <div className="diag__title">{d.title}</div>
                <div className="diag__detail muted">{d.detail}</div>
              </div>
              {d.line != null && <span className="diag__line">L{d.line}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
