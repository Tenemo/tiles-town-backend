"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupLogging = void 0;
var _winston = _interopRequireDefault(require("winston"));
var Sentry = _interopRequireWildcard(require("@sentry/node"));
var Tracing = _interopRequireWildcard(require("@sentry/tracing"));
var _morgan = _interopRequireDefault(require("morgan"));
var _expressWinston = _interopRequireDefault(require("express-winston"));
var _config = require("./config");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const setupLogging = app => {
  Sentry.init({
    dsn: 'https://fe2d28a5bda54932b1914fdb2e81ab4c@o502294.ingest.sentry.io/4504889416089600',
    integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({
      tracing: true
    }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      app
    })],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  const onError = (_err, _req, res) => {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    // @ts-ignore
    res.end(res.sentry + '\n');
  };
  app.use(onError);
  const logger = _winston.default.createLogger({
    level: 'http',
    format: _winston.default.format.json(),
    transports: [new _winston.default.transports.File({
      filename: './logs/error.log',
      level: 'error',
      handleExceptions: true,
      maxsize: 10 * 1048576,
      // 10 MB
      maxFiles: 5
    }), new _winston.default.transports.File({
      filename: './logs/combined.log',
      maxsize: 10 * 1048576,
      // 10 MB
      maxFiles: 5
    })]
  });
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new _winston.default.transports.Console({
      format: _winston.default.format.simple()
    }));
  }
  if (_config.config.env === 'development') {
    _expressWinston.default.requestWhitelist.push('body');
    _expressWinston.default.responseWhitelist.push('body');
    app.use(_expressWinston.default.logger({
      winstonInstance: logger,
      meta: true,
      // optional: log meta data about request (defaults to true)
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms'
    }));
  }
  const morganMiddleware = (0, _morgan.default)(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: message => logger.http(message.trim())
    }
  });
  app.use(morganMiddleware);
};
exports.setupLogging = setupLogging;