import { transform } from 'esbuild';

import { fileName, is } from '../utils.js';

export const minifyES = () => {
  /** @type {import('vite').PluginOption} */
  const plugin = {
    name: fileName(import.meta),
    renderChunk: {
      order: 'post',
      handler(code, { facadeModuleId }) {
        if (is(facadeModuleId, 'js')) {
          return transform(code, { minifyWhitespace: true });
        }
      }
    }
  };

  return plugin;
};
