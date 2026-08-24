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
  it('normaliza keywords em Pascal case e indenta blocos', () => {
    const out = formatAmpscript(MOCKUP);
    expect(out).toContain('Var @nome, @cliente');
    expect(out).toContain('Set @nome = AttributeValue("FirstName")');
    expect(out).toContain('  If Empty(@nome) Then');
    expect(out).toContain('    Set @nome = "Cliente"');
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

import { FUNCTION_COUNT, isKnownFunction, canonicalName } from '../src/ampscript/data/functions';

describe('catálogo de funções (base de verdade)', () => {
  it('carregou um catálogo não trivial', () => {
    expect(FUNCTION_COUNT).toBeGreaterThan(150);
  });

  it('reconhece funções conhecidas independente da caixa', () => {
    expect(isKnownFunction('lookup')).toBe(true);
    expect(isKnownFunction('ATTRIBUTEVALUE')).toBe(true);
    expect(canonicalName('concat')).toBe('Concat');
  });

  it('sinaliza função desconhecida', () => {
    const { diagnostics } = analyzeAmpscript('%%[ SET @x = FooBar(@y) ]%%');
    expect(diagnostics.some((d) => d.ruleId === 'unknown-function')).toBe(true);
  });

  it('sugere grafia canônica quando a caixa diverge', () => {
    const { diagnostics } = analyzeAmpscript('%%[ SET @x = lookup("DE","c","k",@v) ]%%');
    expect(diagnostics.some((d) => d.ruleId === 'function-casing')).toBe(true);
  });

  it('não reclama de função canônica correta', () => {
    const { diagnostics } = analyzeAmpscript('%%[ SET @x = AttributeValue("FirstName") ]%%');
    expect(diagnostics.filter((d) => d.ruleId === 'unknown-function')).toHaveLength(0);
  });
});

describe('formatador (correções guiadas pela doc)', () => {
  it('corrige a grafia da função para a canônica', () => {
    const out = formatAmpscript('%%[ set @x = lookup("de","ret","c","v") ]%%');
    expect(out).toContain('Lookup("de", "ret", "c", "v")');
    expect(out).toContain('Set @x =');
  });

  it('formata bloco tag-based <script language="ampscript">', () => {
    const src = '<script runat="server" language="ampscript">\nset @x="a"\nif @y==1 then\nset @z=2\nendif\n</script>';
    const out = formatAmpscript(src);
    expect(out).toContain('<script runat="server" language="ampscript">');
    expect(out).toContain('  Set @x = "a"');
    expect(out).toContain('  If @y == 1 Then');
    expect(out).toContain('    Set @z = 2');
    expect(out).toContain('</script>');
  });
});

describe('regras guiadas pela doc (PDF Salesforce)', () => {
  it('bloqueia statement em inline', () => {
    const { diagnostics } = analyzeAmpscript('<p>%%= Set @x = 1 =%%</p>');
    expect(diagnostics.some((d) => d.ruleId === 'inline-statement')).toBe(true);
  });

  it('permite função única em inline', () => {
    const { diagnostics } = analyzeAmpscript('<p>%%= Concat(@a, @b) =%%</p>');
    expect(diagnostics.filter((d) => d.ruleId.startsWith('inline'))).toHaveLength(0);
  });

  it('aceita AND/OR/NOT dentro de função inline', () => {
    const { diagnostics } = analyzeAmpscript('%%= Iif(@a and @b, "x", "y") =%%');
    expect(diagnostics.filter((d) => d.ruleId.startsWith('inline'))).toHaveLength(0);
  });

  it('sinaliza valor inválido de _messagecontext', () => {
    const { diagnostics } = analyzeAmpscript('%%[ IF _messagecontext == "EMAIL" THEN\nSET @x = 1\nENDIF ]%%');
    expect(diagnostics.some((d) => d.ruleId === 'message-context')).toBe(true);
  });

  it('aceita valor válido de _messagecontext', () => {
    const { diagnostics } = analyzeAmpscript('%%[ IF _messagecontext == "SEND" THEN\nSET @x = 1\nENDIF ]%%');
    expect(diagnostics.some((d) => d.ruleId === 'message-context')).toBe(false);
  });

  it('checa número de argumentos (FormatCurrency)', () => {
    const bad = analyzeAmpscript('%%= FormatCurrency(@v) =%%');
    expect(bad.diagnostics.some((d) => d.ruleId === 'arg-count')).toBe(true);
    const ok = analyzeAmpscript('%%= FormatCurrency(@v, "en-US") =%%');
    expect(ok.diagnostics.some((d) => d.ruleId === 'arg-count')).toBe(false);
  });

  it('conta argumentos ignorando parênteses aninhados', () => {
    const ok = analyzeAmpscript('%%[ Set @r = Field(Row(@rs, 1), "Nome") ]%%');
    expect(ok.diagnostics.some((d) => d.ruleId === 'arg-count')).toBe(false);
  });

  it('valida estrutura em bloco tag-based (IF sem ENDIF)', () => {
    const { diagnostics } = analyzeAmpscript('<script runat="server" language="ampscript">If @x == 1 then</script>');
    expect(diagnostics.some((d) => d.title.includes('IF sem ENDIF'))).toBe(true);
  });
});
