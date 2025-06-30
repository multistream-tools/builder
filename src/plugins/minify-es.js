import { transform } from 'esbuild';

import { is, name } from '../utils.js';

export const minifyES = () => {
  /** @type {import('vite').PluginOption} */
  const plugin = {
    name: name(import.meta),
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
