import { basename } from 'path';
import { loadEnv } from 'vite';

import {
  dockURL,
  https,
  keyField,
  themeParameter,
  wrapperURL
} from './constants.js';

export const is = (path, type) => path.endsWith('.' + type);

export const name = ({ filename }) => basename(filename, '.js');

export const getEnv = ({ mode }, envDir) => loadEnv(mode, envDir, '');

export const helpers = (port, { isPreview, ...data }, root) => {
  const env = getEnv(data, root);
  const dock = dockURL + env[keyField];
  const local = `${https}localhost:${port}/`;

  const toURL = path => path.startsWith(https) ? path : local + path;

  const overlay = path => {
    path = path.replace(/%26/g, '%2526').replace(/&/g, '%26');
    return wrapperURL + toURL(path);
  };

  const theme = (path, tester) => {
    const apply = url => {
      url = url + (/\?/.test(url) ? '&' : '?');
      return `${url}${themeParameter}=${toURL(path)}`;
    };

    return tester ? overlay(apply(tester)) : apply(dock);
  };

  return { dock, env, isPreview, overlay, theme };
};
