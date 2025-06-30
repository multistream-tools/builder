import { viteSingleFile } from 'vite-plugin-singlefile';

import { inlineBuildGlob } from '../constants.js';

export const singleFile = () => viteSingleFile({
  useRecommendedBuildConfig: false,
  inlinePattern: [inlineBuildGlob]
});
