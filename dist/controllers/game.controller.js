"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fakeData = exports.default = void 0;
var _database = _interopRequireDefault(require("../database"));
var _md = _interopRequireDefault(require("md5"));
var _generateBoard = require("./game/generateBoard");
var _checkMoves = require("./game/checkMoves");
var _score = require("./game/score");
var _helpers = require("../utils/helpers");
var _config = require("../config");
var _sequelize = require("sequelize");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Game = _database.default.game;
const newGame = async (req, res, next) => {
  if (req.body.previousId !== null) {
    await Game.destroy({
      where: {
        game_id: req.body.previousId,
        game_isWon: false
      }
    });
  }
  if (req.body.size === null || req.body.size === undefined) {
    throw new Error('Size is required');
  }
  const board = (0, _generateBoard.generateBoard)(req.body.size, req.body.seed, req.body.easyMode);
  const gameId = (0, _md.default)(`${Date.now()}${board.tiles.join()}`);
  const game_isSeedCustom = !!req.body.seed;
  const game = Game.build({
    game_id: gameId,
    game_size: board.size,
    game_seed: board.seed,
    game_isSeedCustom,
    game_easyMode: req.body.easyMode || false,
    game_isWon: false
  });
  game.save().then(() => res.json({
    board: board.tiles,
    gameId,
    size: board.size
  })).catch(err => next(err));
};
const winGame = async (req, res, next) => {
  Game.findOne({
    where: {
      game_id: req.params.id
    }
  }).then(game => {
    if (!game) {
      return res.json({
        info: "Game doesn't exist"
      });
    }
    if (game.game_isWon) {
      return res.json({
        isWon: game.game_isWon,
        score: game.game_score,
        info: "You've won already"
      });
    }
    game.game_moves = req.body.moves.toString();
    const isWon = (0, _checkMoves.checkMoves)(game);
    if (!isWon) {
      return res.status(400).send(res);
    }
    console.log('GAME WON');
    console.log(`PLAYER: ${req.body.playerName ?? ''}`);
    console.log(`MOVE COUNT: ${req.body.moves.length ?? ''}`);
    game.game_player_name = req.body.playerName ?? 'anonymous';
    game.game_end_time = new Date();
    game.game_time = Number(game.game_end_time) - Number(game.game_start_time);
    game.game_move_count = req.body.moves.length;
    game.game_isWon = isWon;
    const score = (0, _score.calculateScore)(game);
    if (score === null) {
      throw new Error('Score is null.');
    }
    game.game_score = score;
    return game.save().then(() => res.json({
      score: game.game_score,
      time: game.game_time,
      moveCount: game.game_move_count,
      seed: game.game_seed,
      isSeedCustom: game.game_isSeedCustom
    }));
  }).catch(err => next(err));
};
const highScores = async (_req, res, next) => {
  try {
    const scores = await Game.findAll({
      limit: 20,
      where: {
        game_isWon: true,
        game_isSeedCustom: false,
        game_easyMode: false,
        game_player_name: {
          [_sequelize.Op.ne]: ''
        }
      },
      order: [['game_score', 'DESC'], ['game_size', 'DESC']],
      attributes: ['game_score', 'game_player_name', 'game_size', 'game_move_count', 'game_time']
    });
    res.json(scores);
  } catch (err) {
    next(err);
  }
};
const updateScores = async (_req, res, next) => {
  try {
    const result = await Game.findAll({
      where: {
        game_isWon: true,
        game_isSeedCustom: false,
        game_player_name: {
          [_sequelize.Op.ne]: ''
        }
      }
    });
    for (const element of result) {
      const game = await Game.findOne({
        where: {
          game_id: element.game_id
        }
      });
      if (game) {
        const oldScore = game.game_score;
        const newScore = (0, _score.calculateScore)(game);
        if (newScore === null) {
          throw new Error('Score is null.');
        }
        game.game_score = newScore;
        await game.save();
        console.log(`Updated ${element.game_id}'s score from ${oldScore?.toString() ?? ''} to ${game.game_score?.toString() ?? ''}`);
      }
    }
    res.send(`Updated score in ${result.length} rows`);
  } catch (err) {
    next(err);
  }
};

/**
 * - for testing with a database of random entries
 */
const fakeData = async (_req, res, next) => {
  try {
    for (let i = 0; i < 10000; i++) {
      await Game.create({
        game_id: (0, _md.default)(Date.now().toString()),
        game_size: (0, _helpers.randBetween)(_config.GAME_CONFIG.minSize, _config.GAME_CONFIG.maxSize),
        game_easyMode: Math.random() < 0.5,
        game_seed: (Date.now() * 2).toString(),
        game_isSeedCustom: false,
        game_isWon: true,
        game_score: (0, _helpers.randBetween)(1000, 200000),
        game_player_name: (0, _md.default)(Date.now().toString()).substring(0, 3),
        game_move_count: (0, _helpers.randBetween)(10, 50),
        game_moves: (() => {
          const moves = [];
          const possibleCharacters = _config.GAME_CONFIG.alphabet.slice(0, _config.GAME_CONFIG.maxSize);
          for (let j = 0; j < (0, _helpers.randBetween)(10, 200); j++) {
            const letter = possibleCharacters.charAt(Math.floor(Math.random() * _config.GAME_CONFIG.maxSize));
            const number = (0, _helpers.randBetween)(1, 16);
            moves[j] = `${letter}${number.toString()}`;
          }
          return moves.toString();
        })(),
        game_start_time: new Date(Date.now() - (0, _helpers.randBetween)(1000, 20000)),
        game_end_time: new Date(Date.now() + (0, _helpers.randBetween)(1000, 20000)),
        game_time: Date.now() + (0, _helpers.randBetween)(1000, 20000) - (Date.now() - (0, _helpers.randBetween)(1000, 20000))
      });
    }
    res.send('Fake data generated successfully');
  } catch (err) {
    next(err);
  }
};
exports.fakeData = fakeData;
var _default = {
  newGame,
  winGame,
  highScores,
  updateScores
};
exports.default = _default;