// scripts/build-extension.mjs
// Depois do `vite build` (que gera o side panel em dist/), este script empacota
// o content script e o service worker com esbuild e copia o manifest.
import { build } from 'esbuild';
import { cp } from 'node:fs/promises';

const common = { bundle: true, target: 'chrome116', logLevel: 'info', format: 'esm' };

await build({ ...common, entryPoints: ['src/content-script/contentBuilder.ts'], outfile: 'dist/content/contentBuilder.js', format: 'iife' });
await build({ ...common, entryPoints: ['src/background/service-worker.ts'], outfile: 'dist/background/service-worker.js' });

await cp('public/manifest.json', 'dist/manifest.json');
console.log('Extensao empacotada em dist/');
