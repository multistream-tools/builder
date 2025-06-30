import { load } from 'cheerio';

import {
  contentSecurityPolicy,
  data,
  https,
  none,
  noTheme,
  self,
  toolsURL
} from '../constants.js';

import { CSP, fileName, is, notEmpty } from '../utils.js';

const name = fileName(import.meta);

const updater = (element, $, callback) => {
  const content = (...args) => element.attr('content', ...args);
  const has = selector => notEmpty($(selector));

  const csp = new CSP(content());
  const themable = !csp.has('default-src', noTheme);

  csp.set('default-src', none);

  // Handle inline scripts and styles.
  $('script:not([src]),style').each((_, element) => {
    csp.addHash(element.type + '-src-elem', $(element).text());
  });

  // Handle internal styles.
  if (has('link[rel=stylesheet][href^=.]')) {
    csp.add('style-src-elem', self);
  }

  // Handle themes.
  if (themable && has('link[rel=stylesheet][href],style')) {
    csp.add('style-src-elem', self, data, https);
    csp.add('font-src', self, data, https);
    csp.add('img-src', self, data, https);
  }

  callback(csp, has);
  content(csp);
};

const getHandler = option => {
  const handler = option !== false ? updater : element => element.remove();

  return (html, callback) => {
    const $ = load(html);
    const element = $(`meta[http-equiv="${contentSecurityPolicy}"]`);

    if (notEmpty(element)) {
      handler(element, $, callback);
      html = $.html();
    }

    return html;
  };
};

export const build = option => {
  const handler = getHandler(option);

  /** @type {import('vite').PluginOption} */
  const plugin = {
    name,
    enforce: 'post',
    generateBundle(_, bundle) {
      const callback = (csp, has) => {
        // Handle internal scripts.
        if (has('script[src^=.]')) {
          csp.add('script-src-elem', self);
        }

        // Handle remote scripts.
        if (has(`script[src^=${toolsURL}]`)) {
          csp.add('script-src-elem', toolsURL);
        }
      };

      Object.values(bundle).forEach(file => {
        const { fileName, source } = file;

        if (is(fileName, 'html')) {
          file.source = handler(source, callback);
        }
      });
    }
  };

  return plugin;
};

export const serve = option => {
  const handler = getHandler(option);

  /** @type {import('vite').PluginOption} */
  const plugin = {
    name,
    transformIndexHtml(source) {
      const callback = csp => {
        // Handle live reload.
        csp.add('connect-src', self);
        // Handle live reload, internal and remote scripts.
        csp.add('script-src-elem', self, toolsURL);
      };

      return handler(source, callback);
    }
  };

  return plugin;
};
