// tests/ampscript.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeAmpscript, formatAmpscript } from '../src/ampscript';

const MOCKUP = `%%[
VAR @nome,@cliente
SET @nome=AttributeValue("FirstName")
IF Empty(@nome) THEN
SET @nome="Cliente"
ELSE
SET @cliente=true
ENDIF
]%%`;

describe('formatAmpscript', () => {
  it('normaliza keywords e indenta blocos', () => {
    const out = formatAmpscript(MOCKUP);
    expect(out).toContain('VAR @nome, @cliente');
    expect(out).toContain('SET @nome = AttributeValue("FirstName")');
    expect(out).toContain('  IF Empty(@nome) THEN');
    expect(out).toContain('    SET @nome = "Cliente"');
  });

  it('é idempotente', () => {
    const once = formatAmpscript(MOCKUP);
    expect(formatAmpscript(once)).toBe(once);
  });

  it('preserva HTML fora dos blocos', () => {
    const src = '<p>Ola %%=proper(@n)=%%</p>';
    expect(formatAmpscript(src)).toBe('<p>Ola %%=proper(@n)=%%</p>');
  });
});

describe('diagnósticos (batem com o mockup)', () => {
  const { diagnostics } = analyzeAmpscript(MOCKUP);

  it('acusa espaçamento na linha 2 (VAR @nome,@cliente)', () => {
    const spacing = diagnostics.filter((d) => d.ruleId === 'spacing');
    expect(spacing.some((d) => d.line === 2)).toBe(true);
  });

  it('acusa indentação na linha 5 (SET dentro do IF)', () => {
    const indent = diagnostics.filter((d) => d.ruleId === 'indentation');
    expect(indent.some((d) => d.line === 5)).toBe(true);
  });

  it('código válido e formatado não gera erros estruturais', () => {
    const good = analyzeAmpscript(formatAmpscript(MOCKUP));
    expect(good.diagnostics.filter((d) => d.severity === 'error')).toHaveLength(0);
  });
});

describe('estrutura', () => {
  it('detecta IF sem ENDIF', () => {
    const { diagnostics } = analyzeAmpscript('%%[\nIF @x == 1 THEN\nSET @y = 2\n]%%');
    expect(diagnostics.some((d) => d.title.includes('IF sem ENDIF'))).toBe(true);
  });
});
