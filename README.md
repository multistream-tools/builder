# Multistream Tools builder

[Vite](https://vite.dev/) wrapper designed to **package/optimize** [Multistream Tools components](https://multistream.tools/documentation/concepts/).

It **requires** [Node](https://nodejs.org/en/download) 22+.

## Installation

Run the following **command** in your project root directory (if you don't already have a _package.json_ file, run `npm init` first):

```
npm install multistream-tools/builder#semver:1 --save-dev
```

Then add the following [type](https://nodejs.org/docs/latest-v22.x/api/esm.html#enabling) and [scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) **fields** to your _package.json file_ which should, at the minimum, look like this:

```json
{
  "private": true,
  "name": "<YOUR PROJECT NAME>",
  "version": "<YOUR PROJECT VERSION>",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite"
  },
  "devDependencies": {
    "@multistream-tools/builder": "github:multistream-tools/builder#semver:1"
  }
}
```

Now, in your project root directory, create **a file** named _vite.config.js_ which should, at the minimum, contain this:

```js
import { builder } from '@multistream-tools/builder';

export default builder();
```

And finally, still in your project root directory, create **two directories** named _src_ and _assets_, **a file** named _.env.local_, then make sure that the _dist_ **directory** and _.env.local_ **file** are added to your _.gitignore_ file ([create one](https://git-scm.com/docs/gitignore) if needed) like so:

```
node_modules/
dist/
*.local
```

## Usage

The _src_ directory is where your **HTML**, **JS** and **CSS** files should go to be processed. You can **name** them however you please and organize them in **nested** directories if you want to but we recommend you take a look at how [we do it](https://github.com/multistream-tools/open-source) and follow this as a **convention**.

Files named _*.html.js_ and _*.html.css_ that are imported in an HTML file will be processed and **inlined** in that HTML file after a build. Other JS and CSS files will also be processed but **not inlined**; this behavior is, among other things, useful for **sharing** code between multiple HTML files ([example](https://github.com/multistream-tools/open-source/tree/main/src/overlays/chat)) or public API.

The _assets_ directory is where you can create folders/files that will be **copied** to the root of the build directory, as-is, without any processing. This behavior is, among other things, useful for server **configuration** files, audio files, and so on.

The _dist_ directory is where the **built files** will be found. Its content is **cleaned** before every build. 

### Development

Run the `npm start` command (delegates to the `vite` [command](https://vite.dev/guide/cli.html#vite)) which starts a **development server** with live reload functionality.

### Production

Run the `npm run build` command (delegates to the `vite build` [command](https://vite.dev/guide/cli.html#build)) which starts the **build process**. The build result, content of the _dist_ directory, should be sent to your **hosting provider** of choice.

Then optionally run the `npm run preview` command (delegates to the `vite preview` [command](https://vite.dev/guide/cli.html#vite-preview)) which starts a server to preview the **current build**. Don't use this as a **production server**.

### Both

When running the `npm start` and `npm run preview` commands, files are served over **HTTPS** via Vite's [basic SSL](https://github.com/vitejs/vite-plugin-basic-ssl) plugin which automatically generates **self-signed certificates**. Your browser will thus show **a warning** from time to time, this is normal, you can [accept](https://cybercafe.dev/thisisunsafe-bypassing-chrome-security-warnings/) and continue to work on your project. What you can also do is **import** the __cert.pem_ certificate file - located under _node_modules/.vite/basic-ssl/_ - into your browser of choice to get rid of all warnings; keep in mind that this certificate is valid for **one month** and will be regenerated after that. 

Sometimes (notably in Google Chrome) when using our `open` [helpers](#open-function), you can get **stuck** on an error page (_chrome-error://chromewebdata_). What we recommend in this case is to [import the certificate](https://support.securly.com/hc/en-us/articles/206081828-How-do-I-manually-install-the-Securly-SSL-certificate-in-Chrome) or navigate once to the server root (_https://localhost:5173_ by default) to accept the warning, and then **go back** to the URL you wanted to load in the first place.

If you want to **open** a [different browser](https://vite.dev/config/server-options.html#server-open) than your system default one, you can add the following line to your _.env.local_ file:

```
BROWSER=<YOUR BROWSER OF CHOICE>
```

Note that OBS [browser sources](https://github.com/obsproject/obs-browser) are based on [Chromium](https://en.wikipedia.org/wiki/Chromium_(web_browser)) so you should **preferably** work on browsers like Google Chrome or Microsoft Edge. Firefox may work too but Safari is known to have issues thus should be avoided. 

#### CSP

[Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) is a **security feature** that should preferably be enabled.

By default, every HTML page containing a `<meta http-equiv="Content-Security-Policy" />` tag will **automatically** be configured so that:

- the `default-src` directive is **always set** to `'none'`,
- inline scripts and styles [hashes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP#hashes) are computed and **added** to both `script-src-elem` and `style-src-elem` directives,
- the `'self'` value is **added** to both `script-src-elem` and `style-src-elem` directives when needed (not inlined scripts and styles),
- the `https://obs.multistream.tools/v1/` value is **added** to the `script-src-elem` directive when needed
- `'self'`, `data:` and `https:` values are **added** to the `style-src-elem`, `font-src` and `img-src` directives if the page has style sheets (meaning it probably is an [overlay](https://multistream.tools/documentation/overlays/) which allows [theming](https://multistream.tools/documentation/themes/)),
- the `'self'` value is **added** to the `connect-src` directive, in development only, to let the live reload functionality work as expected.

Existing values (except for the `default-src` directive) and other directives will be **kept as-is** so that you can write only needed additional rules, for example:

```
<meta http-equiv="Content-Security-Policy" content="media-src 'self'; connect-src https://api.streamelements.com" />
```

Note that if - for some reason - a given HTML page of yours has some style sheets but **doesn't allow theming**, you should use the special `'no-theme'` value for the `default-src` directive which avoids theming configuration of the `style-src-elem`, `font-src` and `img-src` directives:

```
<meta http-equiv="Content-Security-Policy" content="default-src 'no-theme'" />
```

Some Content Security Policy [rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#directives) should be set on the server side so you should configure your **hosting provider** of choice to send the following as the value (which you can of course tweak) of the `Content-Security-Policy` header sent with HTML pages:

```
base-uri 'self'; form-action 'none'; frame-ancestors 'self' https://obs.multistream.tools; sandbox allow-forms allow-same-origin allow-scripts; upgrade-insecure-requests
```

Finally, you can also pass `false` as the `csp` [option](#configuration) value to totally **disable the feature** which removes the dedicated meta tags from HTML pages.

## Configuration

Our `builder` function accepts the following **optional parameters** in case you want to customize its behavior:

| name | type | description | default |
| - | - | - | - |
| `assets` | string | name of the _assets_ directory | `'assets'` |
| `build` | string | name of the _build_ directory | `'dist'` |
| `sources` | string | name of the _sources_ directory | `'src'` |
| `port` | number | port for the developement and preview servers | `5173` |
| `open` | boolean, string or function | `true` to open a browser tab at the project root when starting the development or preview server, file path (relative to the root of the sources or build directory), HTTPS URL or a [function](#open-function) that returns such a boolean, path or URL | - |
| `csp` | strings array, `false` | Content-Security-Policy header rules for the developement and preview servers, to simulate a production environment, or `false` to disable the [feature](#csp) | - |
| `onEnd` | function | to be called when the build ends, parameter is an [object](#examples) containing environment variables and the full paths to the root, _build_ and _sources_ directories; useful to change things afterwards via scripting | - |

In order to pass **sensitive information** to the build `onEnd` and server `open` functions without storing it in your Git repository, you can take advantage of [environment variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs) notably via the _.env.local_ file you created [earlier](#installation); learn more on how to use it on the [Vite website](https://vite.dev/guide/env-and-mode.html#env-variables).

### Examples

```js
import { renameSync } from 'fs';
import { join } from 'path';
import { builder } from '@multistream-tools/builder';

export default builder({
  assets: 'public',
  build: 'build',
  sources: 'sources',
  port: 5174,
  open: 'overlays/overlay.html',
  // Default value.
  csp: [
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'self' https://obs.multistream.tools",
    'sandbox allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
    'upgrade-insecure-requests'
  ],
  onEnd({ env, root, build, sources }) {
    console.log(env, root, build, sources);

    renameSync(join(build, 'from.html'), join(build, 'to.html'));
  }
});
```

#### `open` function

```js
import { builder } from '@multistream-tools/builder';

export default builder({
  open({ env, dock, overlay, theme, isPreview }) {
    console.log(env);

    // Open the project root:
    // https://localhost:5173/
    return true;

    /* `dock` is the URL of our dock, useful for testing adapters */

    // Open dock (with optional parameters):
    // https://obs.multistream.tools/v1/dock?key=<YOUR LICENSE KEY>&lang=fr
    return dock + '&lang=fr';
 
    /* `overlay` is a helper function that returns a overlay testing URL */

    // Open local overlay (with optional parameters):
    // https://obs.multistream.tools/v1/wrapper?url=https://localhost:5173/overlays/overlay.html?param1=1%26param2=2
    return overlay('overlays/overlay.html?param1=1&param2=2');

    /* `theme` is a helper function that returns a theme testing URL */

    // Apply local theme on our dock:
    // https://obs.multistream.tools/v1/dock?key=&theme=https://localhost:5173/themes/theme.css
    return theme('themes/theme.css');

    // Apply local theme on local overlay (with optional parameters):
    // https://obs.multistream.tools/v1/wrapper?url=https://localhost:5173/overlays/overlay.html?param1=1%26param2=2%26theme=https://localhost:5173/themes/theme.css
    return theme('themes/theme.css', 'overlays/overlay.html?param1=1&param2=2');

    // Apply local theme on remote overlay (with optional parameters):
    // https://obs.multistream.tools/v1/wrapper?url=https://domain.ext/overlay.html?param1=1&param2=2%26theme=https://localhost:5173/themes/theme.css
    return theme('themes/theme.css', 'https://domain.ext/overlay.html?param1=1&param2=2');

    // Apply remote theme on local overlay (with optional parameters):
    // https://obs.multistream.tools/v1/wrapper?url=https://localhost:5173/overlays/overlay.html?param1=1%26param2=2%26theme=https://domain.ext/theme.css
    return theme('https://domain.ext/theme.css', 'overlays/overlay.html?param1=1&param2=2');

    /* `isPreview` is a boolean that allows you to differentiate the preview command */

    return isPreview ? 'preview.html' : 'development.html';
  }
});
```

Your Multistream Tooks [license key](https://multistream.tools/documentation/dock/#parameters) is **sensitive information** so you shouldn't store it in your Git repository. If you make use of our previously listed **URL helpers** and don't want to manually type your license key in your browser URL bar, take advantage of the dedicated `MULTISTREAM_TOOLS_KEY` **environment variable**; for example add the following line to your _.env.local_ file:

```
MULTISTREAM_TOOLS_KEY=<YOUR LICENSE KEY>
```

That's it!
