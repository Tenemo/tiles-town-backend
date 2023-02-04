import Joi from 'joi';
import parseDbUrl from 'parse-database-url';

require('dotenv').config();

let databaseConfig = parseDbUrl(process.env.DATABASE_URL);

const configSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow('development', 'production')
        .default('development'),
    PORT: Joi.number()
        .default(8080),
    driver: Joi.string(),
    database: Joi.string().required()
        .description('Postgres database name'),
    port: Joi.number()
        .default(5432),
    host: Joi.string()
        .default('localhost'),
    user: Joi.string().required()
        .description('Postgres username'),
    password: Joi.string().allow('')
        .description('Postgres password'),
}).unknown()
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

export { config };
