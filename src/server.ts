import dotenv from 'dotenv';
import express from 'express';
import Joi from 'joi';
import parseDbUrl from 'parse-database-url';
import winston from 'winston';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import httpStatus from 'http-status';
import routes from '../server/routes/index.route';
import { config } from './config';
import APIError from '../server/helpers/APIError';
import cors from 'cors';

import { healthCheck } from 'routes/health-check';

dotenv.config();

type DatabaseConfig = {
    database: string;
    port: string;
    host: string;
    user: string;
    password: string;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const databaseConfig: DatabaseConfig = parseDbUrl(
    process.env.DATABASE_URL,
) as DatabaseConfig;

const configSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow('development', 'production')
        .default('development'),
    PORT: Joi.number().default(8080),
    driver: Joi.string(),
    database: Joi.string().required().description('Postgres database name'),
    port: Joi.number().default(5432),
    host: Joi.string().default('localhost'),
    user: Joi.string().required().description('Postgres username'),
    password: Joi.string().allow('').description('Postgres password'),
})
    .unknown()
    .required();

Joi.assert(databaseConfig, configSchema);

const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    postgres: {
        database: databaseConfig.database,
        port: databaseConfig.port,
        host: databaseConfig.host,
        user: databaseConfig.user,
        password: databaseConfig.password,
    },
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true,
        }),
    ],
});

export const app = express();
const port = process.env.PORT ?? 8080;

Sentry.init({
    dsn: 'https://fe2d28a5bda54932b1914fdb2e81ab4c@o502294.ingest.sentry.io/4504889416089600',
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// All controllers should live here
app.get('/', function rootHandler(req, res) {
    res.end('Hello world!');
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
});

if (config.env === 'development') {
    app.use(logger('dev'));
}

app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(cookieParser());

if (config.env === 'development') {
    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    app.use(
        expressWinston.logger({
            winstonInstance,
            meta: true, // optional: log meta data about request (defaults to true)
            msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
            colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
        }),
    );
}

app.use('/api', routes);

// if error is not an instanceOf APIError, convert it
app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
        // validation error contains errors which is an array of error each containing message[]
        const unifiedErrorMessage = err.errors
            .map((error) => error.messages.join('. '))
            .join(' and ');
        const error = new APIError(unifiedErrorMessage, err.status, true);
        return next(error);
    } else if (!(err instanceof APIError)) {
        const apiError = new APIError(err.message, err.status, err.isPublic);
        return next(apiError);
    }
    return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API not found', httpStatus.NOT_FOUND);
    return next(err);
});

// function to calculate the time between two dates in days
function dateDiffInDays(a: Date, b: Date) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    const _msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((utc2 - utc1) / _msPerDay);
}

// error handler, send stacktrace only during development
app.use(
    (
        err,
        req,
        res,
        next, // eslint-disable-line no-unused-vars
    ) =>
        res.status(err.status).json({
            message: err.isPublic ? err.message : httpStatus[err.status],
            stack: config.env === 'development' ? err.stack : {},
        }),
);

app.get('/health-check', healthCheck);

app.listen(port, () => {
    console.log(
        `Server running on port ${port} in ${
            process.env.NODE_ENV ?? ''
        } environment`,
    );
});
