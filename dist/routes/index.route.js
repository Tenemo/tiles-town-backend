"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _game = _interopRequireDefault(require("./game.route"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const router = _express.default.Router();

/** GET /health-check - Check service health */
router.get('/health-check', (_req, res) => res.send('OK'));
router.use('/game', _game.default);
var _default = router;
exports.default = _default;