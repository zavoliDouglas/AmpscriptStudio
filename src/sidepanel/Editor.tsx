// sidepanel/Editor.tsx
// Editor de código. No MVP usamos um <textarea> monoespaçado para o scaffold
// compilar e rodar de imediato.
//
// TODO(build together): trocar por CodeMirror 6 (deps já em package.json):
//   import { EditorView, basicSetup } from 'codemirror';
//   + criar uma linguagem/realce simples para AMPscript.
// Deixei a assinatura de props estável para a troca não afetar o App.

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
  return (
    <textarea
      className="editor"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
