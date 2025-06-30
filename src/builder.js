import { globSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import basicSSLPlugin from '@vitejs/plugin-basic-ssl';

import { minifyES } from './plugins/minify-es.js';
import { minifyHTML } from './plugins/minify-html.js';
import { onBuildEnd } from './plugins/on-build-end.js';
import { singleFile } from './plugins/single-file.js';
import { updateCSP } from './plugins/update-csp.js';

import {
  assetsPath,
  buildPath,
  contentSecurityPolicy,
  domain,
  inlineSourcesGlob,
  serverPort,
  sourcesGlob,
  sourcesPath
} from './constants.js';

import { helpers } from './utils.js';

export const builder = ({
  assets = assetsPath,
  build = buildPath,
  csp,
  onEnd,
  open,
  port = serverPort,
  sources = sourcesPath
} = {}) => defineConfig(({ command, ...data }) => {
  build = resolve(build);
  sources = resolve(sources);

  const root = resolve();

  /** @type {import('vite').UserConfig['plugins']} */
  let plugins;

  if (command === 'build') {
    plugins = [minifyES(), singleFile(), minifyHTML(), updateCSP()];

    if (onEnd) {
      plugins.push(onBuildEnd(onEnd, data, root, build, sources));
    }
  } else {
    plugins = [basicSSLPlugin({ name: domain })];
  }

  /** @type {import('vite').CommonServerOptions} */
  const server = {
    headers: csp && { [contentSecurityPolicy]: csp.join(';') },
    open: typeof open === 'function' ? open(helpers(port, data, root)) : open,
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

