"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _lodash = _interopRequireDefault(require("lodash"));
var _game = require("./models/game.model");
var _config = require("./config");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const sequelize = new _sequelize.Sequelize(_config.config.postgres.database, _config.config.postgres.user, _config.config.postgres.password, {
  logging: () => {
    if (_config.config.env === 'development') return true;else return false;
  },
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  port: _config.config.postgres.port,
  host: _config.config.postgres.host,
  pool: {
    max: 10,
    idle: 30000,
    acquire: 3600 * 1000 * 6
  }
});
sequelize.authenticate().then(() => {
  console.log('Database connection has been established successfully.'); // eslint-disable-line no-console
}).catch(err => {
  console.error('Unable to connect to the database:', err); // eslint-disable-line no-console
});

const game = (0, _game.initGame)(sequelize);
sequelize.sync().then(() => {
  console.log('Database synchronized'); // eslint-disable-line no-console
}).catch(err => {
  console.log('Rolled back, an error occurred:'); // eslint-disable-line no-console
  console.log(err); // eslint-disable-line no-console
});
var _default = _lodash.default.extend({
  sequelize,
  Sequelize: _sequelize.Sequelize
}, {
  game
});
exports.default = _default;