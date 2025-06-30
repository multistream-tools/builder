# Multistream Tools builder

[Vite](https://vite.dev/) wrapper designed to **package/optimize** [Multistream Tools components](https://multistream.tools/documentation/concepts/).

It **requires** [Node](https://nodejs.org/en/download) 22+.

## Installation

Run the following **command** in your project root directory (if you don't already have a _package.json_ file, run `npm init` first):

```
npm install multistream-tools/builder --save-dev
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
    "@multistream-tools/builder": "github:multistream-tools/builder"
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

Then optionally run the `npm run preview` command (delegates to the `vite preview` [command](https://vite.dev/guide/cli.html#vite-preview)) which starts a server to preview the **current build**. Do not use this as a **production server**.

### Both

When running the `npm start` and `npm run preview` commands, files are served over **HTTPS** via Vite's [basic SSL](https://github.com/vitejs/vite-plugin-basic-ssl) plugin which automatically generates **self-signed certificates**. Your browser will thus show **a warning** from time to time, this is normal, you can accept and continue to work on your project.

## Configuration

Our `builder` function accepts the following **optional parameters** in case you want to customize its behavior:

| name | type | description | default |
| - | - | - | - |
| `assets` | string | name of the _assets_ directory | `'assets'` |
| `build` | string | name of the _build_ directory | `'dist'` |
| `sources` | string | name of the _sources_ directory | `'src'` |
| `port` | number | port for the developement and preview servers | `5173` |
| `open` | boolean, string or function | `true` to open  a browser tab at the project root when starting the development or preview server, file path (relative to the root of the sources or build directory), HTTPS URL or a [function](#open-function) that returns such a boolean, path or URL | - |
| `csp` | strings array | Content-Security-Policy header [rules](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy#directives) for the developement and preview servers, to simulate a production environment | - |
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
  csp: [
    "base-uri 'self'",
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src https: data: 'self'",
    "font-src https://fonts.gstatic.com"
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

Your Multistream Tooks [license key](https://multistream.tools/documentation/dock/#parameters) is **sensitive information** so you should not store it in your Git repository. If you make use of our previously listed **URL helpers** and don't want to manually type your license key in your browser URL bar, take advantage of the dedicated `MULTISTREAM_TOOLS_KEY` **environment variable**; for example add the following line to your _.env.local_ file:

```
MULTISTREAM_TOOLS_KEY=<YOUR LICENSE KEY>
```

That's it!
