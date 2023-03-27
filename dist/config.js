"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = exports.GAME_CONFIG = void 0;
var _joi = _interopRequireDefault(require("joi"));
var _parseDatabaseUrl = _interopRequireDefault(require("parse-database-url"));
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dotenv.default.config();
const GAME_CONFIG = {
  minSize: 4,
  maxSize: 16,
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};
exports.GAME_CONFIG = GAME_CONFIG;
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const databaseConfig = (0, _parseDatabaseUrl.default)(process.env.DATABASE_URL);
const configSchema = _joi.default.object({
  NODE_ENV: _joi.default.string().allow('development', 'production').default('production'),
  PORT: _joi.default.number().default(8080),
  driver: _joi.default.string(),
  database: _joi.default.string().required().description('Postgres database name'),
  port: _joi.default.number().default(5432),
  host: _joi.default.string().default('localhost'),
  user: _joi.default.string().required().description('Postgres username'),
  password: _joi.default.string().allow('').description('Postgres password')
}).unknown().required();
_joi.default.assert(databaseConfig, configSchema);
const config = {
  env: process.env.NODE_ENV,
  // Joi sets defaults
  port: parseInt(process.env.PORT ?? '8080', 10),
  postgres: {
    database: databaseConfig.database,
    port: databaseConfig.port,
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password
  }
};
exports.config = config;