"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.server = exports.app = void 0;
var _logging = require("./logging");
var _express = _interopRequireDefault(require("express"));
var _cookieParser = _interopRequireDefault(require("cookie-parser"));
var _index = _interopRequireDefault(require("./routes/index.route"));
var _config = require("./config");
var _cors = _interopRequireDefault(require("cors"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const app = (0, _express.default)();
exports.app = app;
app.use((0, _cors.default)());
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: true
}));
app.use((0, _cookieParser.default)());
app.use('/api', _index.default);
(0, _logging.setupLogging)(app);
const server = app.listen(_config.config.port, () => {
  console.log(`Server running on port ${_config.config.port} in ${_config.config.env} environment`);
});
exports.server = server;