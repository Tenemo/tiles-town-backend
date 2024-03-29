import { Sequelize } from 'sequelize';
import _ from 'lodash';
import { initGame } from 'models/game.model';
import { config } from './config';

const sequelize = new Sequelize(
    config.postgres.database,
    config.postgres.user,
    config.postgres.password,
    {
        logging: () => {
            if (config.env === 'development') return true;
            else return false;
        },
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        port: config.postgres.port,
        host: config.postgres.host,
        pool: {
            max: 10,
            idle: 30000,
            acquire: 3600 * 1000 * 6,
        },
    },
);
sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.'); // eslint-disable-line no-console
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err); // eslint-disable-line no-console
    });

const game = initGame(sequelize);

sequelize
    .sync()
    .then(() => {
        console.log('Database synchronized'); // eslint-disable-line no-console
    })
    .catch((err) => {
        console.log('Rolled back, an error occurred:'); // eslint-disable-line no-console
        console.log(err); // eslint-disable-line no-console
    });

export default _.extend(
    {
        sequelize,
        Sequelize,
    },
    { game },
);
