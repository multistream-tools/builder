import { createHash } from 'crypto';
import { basename } from 'path';
import { loadEnv } from 'vite';

import {
  dockURL,
  hashType,
  https,
  keyField,
  localhost,
  themeParameter,
  wrapperURL
} from './constants.js';

export const is = (path, type) => path.endsWith('.' + type);

export const notEmpty = array => array.length > 0;

export const fileName = ({ filename }) => basename(filename, '.js');

export const getEnv = ({ mode }, envDir) => loadEnv(mode, envDir, '');

export const openHelpers = (port, { isPreview, ...data }, root) => {
  const env = getEnv(data, root);
  const dock = dockURL + env[keyField];
  const local = localhost + `${port}/`;

  const toURL = path => path.startsWith(https) ? path : local + path;

  const overlay = path => {
    path = path.replace(/%26/g, '%2526').replace(/&/g, '%26');
    return wrapperURL + toURL(path);
  };

  const theme = (path, tester) => {
    const apply = url => {
      url = url + (/\?/.test(url) ? '&' : '?');
      return url + `${themeParameter}=${toURL(path)}`;
    };

    return tester ? overlay(apply(tester)) : apply(dock);
  };

  return { dock, env, isPreview, overlay, theme };
};

export class CSP extends Map {
  constructor(rules) {
    super();

    rules?.trim().split(/(?:\s*;+\s*)+/).forEach(rule => {
      rule = rule.split(/\s+/);
      this.set(rule.shift(), ...rule);
    });
  }

  toString() {
    return [...this.entries()]
      .map(([directive, values]) => [directive, ...values].join(' '))
      .join('; ');
  }

  set(directive, ...values) {
    if (directive) {
      values = new Set(values);
      super.set(directive, values);
      return values;
    }
  }

  get(directive) {
    return super.get(directive) || this.set(directive);
  }

  add(directive, ...values) {
    directive = this.get(directive);
    values.forEach(value => directive.add(value));
  }

  addHash(directive, content) {
    content = createHash(hashType).update(content).digest('base64');
    this.add(directive, `'${hashType}-${content}'`);
  }

  has(directive, value) {
    return value
      ? !!super.get(directive)?.has(value)
      : super.has(directive);
  }
}
