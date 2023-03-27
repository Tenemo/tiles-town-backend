"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _express = _interopRequireDefault(require("express"));
var _expressValidation = require("express-validation");
var _paramValidation = _interopRequireDefault(require("../constants/paramValidation"));
var _game = _interopRequireDefault(require("../controllers/game.controller"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* TODO: remove */
/* eslint-disable @typescript-eslint/no-misused-promises */

const router = _express.default.Router();
router.route('/new')
/* POST /api/game/new - Initialize new game */.post((0, _expressValidation.validate)(_paramValidation.default.newGame), _game.default.newGame);
router.route('/:id')
/* PUT /api/game/:id - Win given game */.put((0, _expressValidation.validate)(_paramValidation.default.winGame), _game.default.winGame);
router.route('/highScores')
/* GET /api/game/highScores - Get highscores */.get(_game.default.highScores);

// router.route('/update')
//     /* GET /api/game/highScores - Get highscores */
//     .get(gameController.updateScores);
var _default = router;
exports.default = _default;