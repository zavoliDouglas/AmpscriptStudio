// background/service-worker.ts
// Abre o side panel ao clicar no ícone da extensão.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    ?.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error('[AMP Studio]', err));
});
