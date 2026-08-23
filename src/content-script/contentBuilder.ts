// content-script/contentBuilder.ts
// Roda dentro das páginas do Content Builder. Responsabilidade mínima do MVP:
// capturar o código SELECIONADO e responder ao side panel quando pedido.
//
// TODO(build together):
//  - detectar o editor real (CodeMirror/ACE) para pegar o trecho selecionado
//    com precisão (por ora usamos window.getSelection()).
//  - futuramente: "Aplicar no editor" (escrever de volta) com backup/undo.

type Msg = { type: 'AMP_STUDIO_GET_SELECTION' };

chrome.runtime.onMessage.addListener((msg: Msg, _sender, sendResponse) => {
  if (msg?.type === 'AMP_STUDIO_GET_SELECTION') {
    const selection = window.getSelection?.()?.toString() ?? '';
    sendResponse({ ok: true, code: selection });
  }
  return true; // resposta assíncrona
});

export {};
