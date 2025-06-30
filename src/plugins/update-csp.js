import { createHash } from 'crypto';
import { load } from 'cheerio';

import { contentSecurityPolicy } from '../constants.js';
import { is, name } from '../utils.js';

export const updateCSP = () => {
  /** @type {import('vite').PluginOption} */
  const plugin = {
    name: name(import.meta),
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        for (const file of Object.values(bundle)) {
          const { fileName, source } = file;

          if (is(fileName, 'html')) {
            const $ = load(source);
            const csp = $(`meta[http-equiv="${contentSecurityPolicy}"]`);

            if (csp.length) {
              const content = (...args) => csp.attr('content', ...args);
              const replace = (a, b) => content(content().replace(a, b));

              $('style,script:not([src])').each((_, element) => {
                const type = 'sha384';

                const hash = createHash(type)
                  .update($(element).text())
                  .digest()
                  .toString('base64');

                replace(`${element.type}-src-elem`, `$& '${type}-${hash}'`);
              });
            }

            file.source = $.html();
          }
        }
      }
    }
  };

  return plugin;
};
