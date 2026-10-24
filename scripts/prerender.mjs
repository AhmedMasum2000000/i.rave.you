import { readFile, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const renderedApp = renderToString(createElement(App));
  const htmlPath = new URL('../dist/index.html', import.meta.url);
  const html = await readFile(htmlPath, 'utf8');
  const rootMarkup = '<div id="root"></div>';

  if (!html.includes(rootMarkup)) {
    throw new Error('Could not find the empty application root in dist/index.html.');
  }

  await writeFile(htmlPath, html.replace(rootMarkup, `<div id="root">${renderedApp}</div>`));
} finally {
  await server.close();
}
