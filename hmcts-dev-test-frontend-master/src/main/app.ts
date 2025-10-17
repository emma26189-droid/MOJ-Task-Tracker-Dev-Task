import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import { glob } from 'glob';

import { HTTPError } from './HttpError';
import { Nunjucks } from './modules/nunjucks';
import taskRoutes from './routes/tasks';

const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

//  Enable Nunjucks with GOV.UK macros
new Nunjucks(developmentMode).enableFor(app);

//  Favicon
app.use(favicon(path.join(__dirname, 'public/assets/images/favicon.ico')));

//  Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//  Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', '..', 'dist')));

//  Cache control
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  next();
});

//  Route for homepage → renders home.njk
app.get('/', (req, res) => {
  res.render('home', {
    example: {
      id: '12345',
      caseNumber: 'CASE-2025-001',
      title: 'Emma vs Build Pipeline',
      description: 'Troubleshooting Yarn PnP and SCSS extraction',
      status: 'In Progress',
      createdDate: '17 October 2025',
    }
  });
});

//  Dynamic route loading
glob
  .sync(path.join(__dirname, 'routes/**/*.+(ts|js)'))
  .map(filename => require(filename))
  .forEach(route => route.default(app));

//  Explicit task routes
app.use(taskRoutes);

//  Dev setup
setupDev(app, developmentMode);

//  Error handler
app.use((err: HTTPError, req: express.Request, res: express.Response) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = developmentMode ? err : {};
  res.status(err.status || 500);
  res.render('error');
});