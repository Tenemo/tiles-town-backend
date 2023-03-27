import { Express, ErrorRequestHandler } from 'express';
import winston from 'winston';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import morgan from 'morgan';
import expressWinston from 'express-winston';
import { config } from './config';

export const setupLogging = (app: Express): void => {
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

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    // Optional fallthrough error handler
    const onError: ErrorRequestHandler = (_err, _req, res) => {
        // The error id is attached to `res.sentry` to be returned
        // and optionally displayed to the user for support.
        res.statusCode = 500;
        // @ts-ignore
        res.end((res.sentry as string) + '\n');
    };

    app.use(onError);

    const logger = winston.createLogger({
        level: 'http',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({
                filename: './logs/error.log',
                level: 'error',
                handleExceptions: true,
                maxsize: 10 * 1048576, // 10 MB
                maxFiles: 5,
            }),
            new winston.transports.File({
                filename: './logs/combined.log',
                maxsize: 10 * 1048576, // 10 MB
                maxFiles: 5,
            }),
        ],
    });
    if (process.env.NODE_ENV !== 'production') {
        logger.add(
            new winston.transports.Console({
                format: winston.format.simple(),
            }),
        );
    }

    if (config.env === 'development') {
        expressWinston.requestWhitelist.push('body');
        expressWinston.responseWhitelist.push('body');
        app.use(
            expressWinston.logger({
                winstonInstance: logger,
                meta: true, // optional: log meta data about request (defaults to true)
                msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
            }),
        );
    }

    const morganMiddleware = morgan(
        ':method :url :status :res[content-length] - :response-time ms',
        {
            stream: {
                // Configure Morgan to use our custom logger with the http severity
                write: (message) => logger.http(message.trim()),
            },
        },
    );

    app.use(morganMiddleware);
};
