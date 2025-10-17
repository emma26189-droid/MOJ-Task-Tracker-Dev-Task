// src/main/development.ts
import type { Express } from 'express';

export function setupDev(app: Express, developmentMode: boolean): void {
  if (!developmentMode) return;

  // require dev-only deps at runtime so production builds don't need them
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const webpack = require('webpack') as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const webpackDevMiddleware = require('webpack-dev-middleware') as any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const webpackConfig = require('../../webpack.config') as any;

  const compiler = webpack(webpackConfig);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output?.publicPath ?? '/',
      stats: { colors: true },
      writeToDisk: false
    })
  );
}