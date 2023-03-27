"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flip = exports.checkMoves = void 0;
var _generateBoard = require("./generateBoard");
var _helpers = require("../../utils/helpers");
/**
 * Flips a single tile
 * @param {num} tile -tile
 * @return {num}
 */
const flip = tile => {
  if (tile === 2) return 2;
  if (tile === 1) return 0;
  if (tile === 0) return 1;
  throw new Error(`Wrong tile value to flip: ${tile}`);
};

/**
 * Checks if moves are legal and end up in a victory
 */
exports.flip = flip;
const checkMoves = game => {
  const board = (0, _generateBoard.generateBoard)(game.game_size, game.game_seed, game.game_easyMode).tiles;
  let moves;
  if (!game.game_moves) {
    return false;
  }
  if (typeof game.game_moves === 'string') {
    moves = game.game_moves.split(',');
  } else {
    moves = game.game_moves;
  }
  moves = (0, _helpers.convertMoves)(moves, game.game_size);
  moves.forEach(move => {
    if (board[move[1]][move[0]] !== 1 && board[move[1]][move[0]] !== 0) throw new Error('Illegal move!');
    board[move[1]][move[0]] = flip(board[move[1]][move[0]]);

    // tile UP
    if (move[1] + 1 <= board.length - 1) {
      board[move[1] + 1][move[0]] = flip(board[move[1] + 1][move[0]]);
    }

    // tile RIGHT
    if (move[0] + 1 <= board.length - 1) {
      board[move[1]][move[0] + 1] = flip(board[move[1]][move[0] + 1]);
    }

    // tile DOWN
    if (move[1] - 1 >= 0) {
      board[move[1] - 1][move[0]] = flip(board[move[1] - 1][move[0]]);
    }

    // tile LEFT
    if (move[0] - 1 >= 0) {
      board[move[1]][move[0] - 1] = flip(board[move[1]][move[0] - 1]);
    }
  });
  let isWon = true;
  board.forEach(move => {
    if (move.includes(1)) isWon = false;
  });
  return isWon;
};
exports.checkMoves = checkMoves;