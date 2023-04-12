import express, { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import { router } from 'routes/router';
import { config } from './config';
import cors from 'cors';
import { setupLogging } from './logging';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(cookieParser());

const { errorLogger, logger, sentryErrorHandler } = setupLogging(app);

app.use('/api', router);

// The error handler must be before any other error middleware and after all controllers
app.use(sentryErrorHandler);

// Optional fallthrough error handler
const onError: ErrorRequestHandler = (_err, _req, res) => {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    // @ts-ignore
    res.end((res.sentry as string) + '\n');
};

app.use(onError);

// express-winston errorLogger makes sense AFTER the router.
app.use(errorLogger);

console.log = (message: string) =>
    logger.log({
        level: 'info',
        message,
    });
console.warn = (message: string) =>
    logger.warn({
        level: 'warn',
        message,
    });
console.error = (message: string) =>
    logger.error({
        level: 'error',
        message,
    });

export const server = app.listen(config.port, () => {
    console.log(
        `Server running on port ${config.port} in ${config.env} environment`,
    );
});
