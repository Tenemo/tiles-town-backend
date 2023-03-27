import { Request, Response, NextFunction } from 'express';
import db from 'database';
import md5 from 'md5';
import { generateBoard } from './game/generateBoard';
import { checkMoves } from './game/checkMoves';
import { calculateScore } from './game/score';
import { randBetween } from 'utils/helpers';
import { GAME_CONFIG } from 'config';
import { Op } from 'sequelize';

const Game = db.game;

interface NewGameRequestBody {
    size?: number;
    seed?: string;
    easyMode?: boolean;
    previousId?: string;
}

interface WinGameRequestBody {
    moves: string[];
    playerName?: string;
}

const newGame = async (
    req: Request<unknown, unknown, NewGameRequestBody>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    if (req.body.previousId !== null) {
        await Game.destroy({
            where: {
                game_id: req.body.previousId,
                game_isWon: false,
            },
        });
    }
    if (req.body.size === null || req.body.size === undefined) {
        throw new Error('Size is required');
    }
    const board = generateBoard(
        req.body.size,
        req.body.seed,
        req.body.easyMode,
    );
    const gameId = md5(`${Date.now()}${board.tiles.join()}`);
    const game_isSeedCustom = !!req.body.seed;
    const game = Game.build({
        game_id: gameId,
        game_size: board.size,
        game_seed: board.seed,
        game_isSeedCustom,
        game_easyMode: req.body.easyMode || false,
        game_isWon: false,
    });
    game.save()
        .then(() => res.json({ board: board.tiles, gameId, size: board.size }))
        .catch((err) => next(err));
};

const winGame = async (
    req: Request<{ id: string }, unknown, WinGameRequestBody>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    Game.findOne({ where: { game_id: req.params.id } })
        .then((game) => {
            if (!game) {
                return res.json({ info: "Game doesn't exist" });
            }
            if (game.game_isWon) {
                return res.json({
                    isWon: game.game_isWon,
                    score: game.game_score,
                    info: "You've won already",
                });
            }
            game.game_moves = req.body.moves.toString();
            const isWon = checkMoves(game);
            if (!isWon) {
                return res.status(400).send(res);
            }
            console.log('GAME WON');
            console.log(`PLAYER: ${req.body.playerName ?? ''}`);
            console.log(`MOVE COUNT: ${req.body.moves.length ?? ''}`);
            game.game_player_name = req.body.playerName ?? 'anonymous';
            game.game_end_time = new Date();
            game.game_time =
                Number(game.game_end_time) - Number(game.game_start_time);
            game.game_move_count = req.body.moves.length;
            game.game_isWon = isWon;
            const score = calculateScore(game);
            if (score === null) {
                throw new Error('Score is null.');
            }
            game.game_score = score;
            return game.save().then(() =>
                res.json({
                    score: game.game_score,
                    time: game.game_time,
                    moveCount: game.game_move_count,
                    seed: game.game_seed,
                    isSeedCustom: game.game_isSeedCustom,
                }),
            );
        })
        .catch((err) => next(err));
};

const highScores = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const scores = await Game.findAll({
            limit: 20,
            where: {
                game_isWon: true,
                game_isSeedCustom: false,
                game_easyMode: false,
                game_player_name: { [Op.ne]: '' },
            },
            order: [
                ['game_score', 'DESC'],
                ['game_size', 'DESC'],
            ],
            attributes: [
                'game_score',
                'game_player_name',
                'game_size',
                'game_move_count',
                'game_time',
            ],
        });
        res.json(scores);
    } catch (err) {
        next(err);
    }
};

const updateScores = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await Game.findAll({
            where: {
                game_isWon: true,
                game_isSeedCustom: false,
                game_player_name: { [Op.ne]: '' },
            },
        });

        for (const element of result) {
            const game = await Game.findOne({
                where: { game_id: element.game_id },
            });

            if (game) {
                const oldScore = game.game_score;
                const newScore = calculateScore(game);
                if (newScore === null) {
                    throw new Error('Score is null.');
                }
                game.game_score = newScore;

                await game.save();
                console.log(
                    `Updated ${element.game_id}'s score from ${
                        oldScore?.toString() ?? ''
                    } to ${game.game_score?.toString() ?? ''}`,
                );
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
export const fakeData = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        for (let i = 0; i < 10000; i++) {
            await Game.create({
                game_id: md5(Date.now().toString()),
                game_size: randBetween(
                    GAME_CONFIG.minSize,
                    GAME_CONFIG.maxSize,
                ),
                game_easyMode: Math.random() < 0.5,
                game_seed: (Date.now() * 2).toString(),
                game_isSeedCustom: false,
                game_isWon: true,
                game_score: randBetween(1000, 200000),
                game_player_name: md5(Date.now().toString()).substring(0, 3),
                game_move_count: randBetween(10, 50),
                game_moves: (() => {
                    const moves = [];
                    const possibleCharacters = GAME_CONFIG.alphabet.slice(
                        0,
                        GAME_CONFIG.maxSize,
                    );
                    for (let j = 0; j < randBetween(10, 200); j++) {
                        const letter = possibleCharacters.charAt(
                            Math.floor(Math.random() * GAME_CONFIG.maxSize),
                        );
                        const number = randBetween(1, 16);
                        moves[j] = `${letter}${number.toString()}`;
                    }
                    return moves.toString();
                })(),
                game_start_time: new Date(
                    Date.now() - randBetween(1000, 20000),
                ),
                game_end_time: new Date(Date.now() + randBetween(1000, 20000)),
                game_time:
                    Date.now() +
                    randBetween(1000, 20000) -
                    (Date.now() - randBetween(1000, 20000)),
            });
        }

        res.send('Fake data generated successfully');
    } catch (err) {
        next(err);
    }
};
export default { newGame, winGame, highScores, updateScores };
