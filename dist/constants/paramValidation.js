"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _joi = _interopRequireDefault(require("joi"));
var _config = require("../config");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  // POST /api/game/new
  newGame: {
    body: _joi.default.object({
      size: _joi.default.number().integer().min(_config.GAME_CONFIG.minSize).max(_config.GAME_CONFIG.maxSize).required(),
      seed: _joi.default.string().max(256).allow(null).allow('').trim(),
      previousId: _joi.default.string().length(32).alphanum().lowercase().allow(null).allow(''),
      easyMode: _joi.default.boolean()
    })
  },
  // PUT /api/game/:id
  winGame: {
    params: _joi.default.object({
      id: _joi.default.string().length(32).alphanum().lowercase().options({
        convert: false
      }).required()
    }),
    body: _joi.default.object({
      moves: _joi.default.array().items(_joi.default.string().alphanum().max(4)).max(10000).required(),
      playerName: _joi.default.string().max(32).allow('').trim()
    })
  }
};
exports.default = _default;