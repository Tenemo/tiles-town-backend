import generateBoard from './generate';
import { alphaToNum } from './moveConverter';

/**
 * Checks if moves are legal and end up in victory
 * @param {object} game
 * @return {boolean}
 */
function checkMoves(game) {
    const board = generateBoard(
        game.game_size,
        game.game_seed,
        game.game_easyMode,
    ).tiles;
    let moves = [];
    if (
        typeof game.game_moves === 'string' ||
        game.game_moves instanceof String
    ) {
        moves = game.game_moves.split(',');
    } else {
        moves = game.game_moves;
    }
    moves = alphaToNum(moves, game.game_size);

    moves.forEach((element) => {
        if (
            board[element[1]][element[0]] != 1 &&
            board[element[1]][element[0]] != 0
        )
            throw new Error('Illegal move!');
        board[element[1]][element[0]] = flip(board[element[1]][element[0]]);

        // tile UP
        if (element[1] + 1 <= board.length - 1) {
            board[element[1] + 1][element[0]] = flip(
                board[element[1] + 1][element[0]],
            );
        }

        // tile RIGHT
        if (element[0] + 1 <= board.length - 1) {
            board[element[1]][element[0] + 1] = flip(
                board[element[1]][element[0] + 1],
            );
        }

        // tile DOWN
        if (element[1] - 1 >= 0) {
            board[element[1] - 1][element[0]] = flip(
                board[element[1] - 1][element[0]],
            );
        }

        // tile LEFT
        if (element[0] - 1 >= 0) {
            board[element[1]][element[0] - 1] = flip(
                board[element[1]][element[0] - 1],
            );
        }
    });
    let isWon = true;
    board.forEach((element) => {
        if (element.includes(1)) isWon = false;
    });
    return isWon;
}

/**
 * Flips a single tile
 * @param {num} tile -tile
 * @return {num}
 */
export function flip(tile) {
    try {
        if (tile === 2) return 2;
        if (tile === 1) return 0;
        if (tile === 0) return 1;
    } catch (err) {
        return;
    }
}

export default checkMoves;
