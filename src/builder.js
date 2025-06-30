import { globSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import basicSSLPlugin from '@vitejs/plugin-basic-ssl';

import * as handleCSP from './plugins/handle-csp.js';
import { minifyES } from './plugins/minify-es.js';
import { minifyHTML } from './plugins/minify-html.js';
import { onBuildEnd } from './plugins/on-build-end.js';
import { singleFile } from './plugins/single-file.js';

import {
  assetsPath,
  buildPath,
  certificateName,
  contentSecurityPolicy,
  defaultCSP,
  inlineSourcesGlob,
  serverPort,
  sourcesGlob,
  sourcesPath
} from './constants.js';

import { openHelpers } from './utils.js';

export const builder = ({
  assets = assetsPath,
  build = buildPath,
  csp = defaultCSP,
  onEnd,
  open,
  port = serverPort,
  sources = sourcesPath
} = {}) => defineConfig(({ command, ...data }) => {
  const root = resolve();

  build = resolve(build);
  sources = resolve(sources);

  /** @type {import('vite').UserConfig['plugins']} */
  let plugins;

  if (command === 'build') {
    plugins = [
      minifyES(),
      singleFile(),
      minifyHTML(),
      handleCSP.build(csp)
    ];

    if (onEnd) {
      plugins.push(onBuildEnd(onEnd, data, root, build, sources));
    }
  } else {
    plugins = [
      basicSSLPlugin({ name: certificateName }),
      handleCSP.serve(csp)
    ];
  }

   /** @type {import('vite').CommonServerOptions['headers']} */
  let headers;

  if (csp) {
    headers = { [contentSecurityPolicy]: csp.join(';') };
  }

  /** @type {import('vite').CommonServerOptions} */
  const server = {
    headers,
    open: typeof open === 'function'
      ? open(openHelpers(port, data, root))
      : open,
    port,
    strictPort: true
  };

  /** @type {import('vite').UserConfig} */
  const config = {
    base: '',
    build: {
      cssCodeSplit: true,
      emptyOutDir: true,
      lib: {
        entry: globSync(`${sources}/${sourcesGlob}`, {
          exclude: [inlineSourcesGlob]
        }),
        formats: ['es']
      },
      modulePreload: { polyfill: false },
      outDir: build,
      target: 'esnext',
      rollupOptions: {
        output: { preserveModules: true }
      }
    },
    envDir: root,
    plugins,
    preview: server,
    publicDir: resolve(assets),
    root: sources,
    server
  };

  return config;
});

