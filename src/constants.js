import project from '../package.json' with { type: 'json' };

const [version] = project.version.split('.');

export const assetsPath = 'assets';

export const buildPath = 'dist';

export const sourcesPath = 'src';

export const serverPort = 5173;

export const sourcesGlob = '**/*.{html,js,css}';

export const inlineBuildGlob = '**/*.html*.{js,css}';

export const inlineSourcesGlob = '**/*.html.{js,css}';

export const themeParameter = 'theme';

export const keyField = 'MULTISTREAM_TOOLS_KEY';

export const contentSecurityPolicy = 'Content-Security-Policy';

export const hashType = 'sha384';

export const data = 'data:';

export const https = 'https:';

export const none = "'none'";

export const self = "'self'";

export const noTheme = `'no-${themeParameter}'`;

const domain = 'multistream.tools';

const root = https + `//obs.${domain}`;

export const toolsURL = root + `/v${version}/`;

export const dockURL = toolsURL + 'dock?key=';

export const wrapperURL = toolsURL + 'wrapper?url=';

export const localhost = https + '//localhost:';

export const certificateName = domain + ' dev';

export const defaultCSP = [
  `base-uri ${self}`,
  `form-action ${none}`,
  `frame-ancestors ${self} ${root}`,
  'sandbox allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts',
  'upgrade-insecure-requests'
];
