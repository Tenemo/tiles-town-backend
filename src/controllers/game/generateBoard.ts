import seedrandom from 'seedrandom';
import md5 from 'md5';
import { flip } from './checkMoves';

interface Board {
    size: number;
    tiles: number[][];
    blankCount?: number;
    seed: string;
}

/**
 * Inserts a single cross at given coordinates, updating blankCount
 * and flipping all adjacent potentially conflicting tiles to 2
 */
const generateCross = (board: Board, y: number, x: number): Board => {
    if (!board.blankCount) {
        throw new Error('Missing blankCount.');
    }
    board.tiles[y][x] = 1;
    board.blankCount--;

    // checks if side squares were actually generated or were outside board bounds
    // decrements the counter for each square generated and flips tiles to 1
    if (y - 1 > -1) {
        if (board.tiles[y - 1][x] === -1) board.blankCount--;
        board.tiles[y - 1][x] = 1;
    }
    if (x - 1 > -1) {
        if (board.tiles[y][x - 1] === -1) board.blankCount--;
        board.tiles[y][x - 1] = 1;
    }
    if (y + 1 < board.size) {
        if (board.tiles[y + 1][x] === -1) board.blankCount--;
        board.tiles[y + 1][x] = 1;
    }
    if (x + 1 < board.size) {
        if (board.tiles[y][x + 1] === -1) board.blankCount--;
        board.tiles[y][x + 1] = 1;
    }

    // changes surrounding, potentially conflicting, tiles to 2's
    // it works great but i forgot how half an hour after writing and debugging this
    for (let i = -1; i < 2; i += 2) {
        if (
            y + i > -1 &&
            y + i < board.size &&
            x + i > -1 &&
            x + i < board.size
        ) {
            if (board.tiles[y + i][x + i] === -1) {
                board.tiles[y + i][x + i] = 2;
                board.blankCount--;
            }
        }
        if (
            y - i > -1 &&
            y - i < board.size &&
            x + i > -1 &&
            x + i < board.size
        ) {
            if (board.tiles[y - i][x + i] === -1) {
                board.tiles[y - i][x + i] = 2;
                board.blankCount--;
            }
        }
    }
    for (let j = -2; j < 3; j += 4) {
        if (x + j > -1 && x + j < board.size) {
            if (board.tiles[y][x + j] === -1) {
                board.tiles[y][x + j] = 2;
                board.blankCount--;
            }
        }
        if (y + j > -1 && y + j < board.size) {
            if (board.tiles[y + j][x] === -1) {
                board.tiles[y + j][x] = 2;
                board.blankCount--;
            }
        }
    }
    return board;
};

/**
 * Progresses board generation by a single step, safely generating
 * a single cross in a random position not colliding with other ones
 */
const nextStep = (board: Board, rng: () => number): Board => {
    if (!board.blankCount) {
        throw new Error('Missing blankCount.');
    }
    const randN = Math.floor(rng() * board.blankCount) + 1;
    let y = 0;
    let x = 0;
    let i = 0;
    if (randN !== 1 || board.tiles[0][0] !== -1) {
        // iterating over board tiles, looking for a free spot
        do {
            if (board.tiles[y][x] === -1) {
                i++;
            }
            if (i === randN) {
                board = generateCross(board, y, x);
            }
            if (x === board.size - 1) {
                x = 0;
                y++;
            } else {
                x++;
            }
        } while (i < randN);
    } else {
        board = generateCross(board, y, x);
    }
    return board;
};

const hardMode = (board: Board, rng: () => number): Board => {
    const moveCount = board.size * board.size * 2;
    const move: [number, number] = [0, 0];

    for (let i = 0; i < moveCount; i++) {
        const randY = Math.floor(rng() * (board.size - 1 - 0 + 1) + 0);
        const randX = Math.floor(rng() * (board.size - 1 - 0 + 1) + 0);
        move[0] = randY;
        move[1] = randX;
        if (
            board.tiles[move[1]][move[0]] === 1 ||
            board.tiles[move[1]][move[0]] === 0
        ) {
            board.tiles[move[1]][move[0]] = flip(board.tiles[move[1]][move[0]]);
            // tile UP
            if (move[1] + 1 <= board.tiles.length - 1) {
                board.tiles[move[1] + 1][move[0]] = flip(
                    board.tiles[move[1] + 1][move[0]],
                );
            }

            // tile RIGHT
            if (move[0] + 1 <= board.tiles.length - 1) {
                board.tiles[move[1]][move[0] + 1] = flip(
                    board.tiles[move[1]][move[0] + 1],
                );
            }

            // tile DOWN
            if (move[1] - 1 >= 0) {
                board.tiles[move[1] - 1][move[0]] = flip(
                    board.tiles[move[1] - 1][move[0]],
                );
            }

            // tile LEFT
            if (move[0] - 1 >= 0) {
                board.tiles[move[1]][move[0] - 1] = flip(
                    board.tiles[move[1]][move[0] - 1],
                );
            }
        }
    }
    return board;
};

export const generateBoard = (
    size: number,
    seed?: string,
    easyMode = false,
): Board => {
    if (!seed) {
        seed = md5(`${Date.now() + size + Math.random()}`).slice(0, -16);
    }
    let board: Board = {
        size: size,
        tiles: [],
        blankCount: size * size,
        seed: seed,
    };

    const rng = seedrandom(seed);

    for (let i = 0; i < size; i++) {
        board.tiles[i] = [];
        for (let j = 0; j < size; j++) {
            board.tiles[i][j] = -1;
        }
    }

    while (board.blankCount) {
        board = nextStep(board, rng);
    }
    if (!easyMode) {
        board = hardMode(board, rng);
    }

    delete board.blankCount;

    return board;
};
