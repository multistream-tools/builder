import { fileName, getEnv } from '../utils.js';

export const onBuildEnd = (callback, data, root, build, sources) => {
  /** @type {import('vite').PluginOption} */
  const plugin = {
    name: fileName(import.meta),
    closeBundle(error) {
      if (!error) {
        const env = getEnv(data, root);
        callback({ build, env, root, sources });
      }
    }
  };

  return plugin;
};
