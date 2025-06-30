export const assetsPath = 'assets';

export const buildPath = 'dist';

export const sourcesPath = 'src';

export const serverPort = 5173;

export const sourcesGlob = '**/*.{html,js,css}';

export const inlineBuildGlob = '**/*.html*.{js,css}';

export const inlineSourcesGlob = '**/*.html.{js,css}';

export const contentSecurityPolicy = 'Content-Security-Policy';

export const https = 'https://';

export const domain = 'multistream.tools';

const toolsURL = `${https}obs.${domain}/v1/`;

export const dockURL = toolsURL + 'dock?key=';

export const wrapperURL = toolsURL + 'wrapper?url=';

export const themeParameter = 'theme';

export const keyField = 'MULTISTREAM_TOOLS_KEY';
