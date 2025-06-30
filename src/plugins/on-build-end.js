import { getEnv, name } from '../utils.js';

export const onBuildEnd = (callback, data, root, build, sources) => {
  /** @type {import('vite').PluginOption} */
  const plugin = {
    name: name(import.meta),
    closeBundle() {
      const env = getEnv(data, root);
      callback({ build, env, root, sources });
    }
  };

  return plugin;
};
