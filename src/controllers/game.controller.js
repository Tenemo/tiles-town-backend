import db from '../../config/sequelize';
import md5 from 'md5';
import generateBoard from './game/generate';
import checkMoves from './game/checkMoves';
import calculateScore from './game/score';
import { randBetween } from '../helpers/helpers';
import gameConfig from '../../config/gameConfig';
import sequelize from 'sequelize';

const Game = db.game;
const Op = sequelize.Op;

/**
 * - POST /api/game/new
 * - Initialize new game
 * @param {number} req.body.size - Requested size of the board
 * @param {string} req.body.seed - Optional seed for board generation
 * @param {string} req.body.easyMode - Optional parameter for much easier board generation
 * @param {string} req.body.previousId - Optional id of the previous game, remove it if the user didn't finish it
 * @returns {array} - sends back generated board array of tile rows
 */
function newGame(req, res, next) {
    if (req.body.previousId != null) {
        Game.destroy({
            where: {
                game_id: req.body.previousId,
                game_isWon: false,
            },
        });
    }
    const board = generateBoard(
        req.body.size,
        req.body.seed,
        req.body.easyMode,
    );
    const gameId = md5((Date.now() + board.tiles).toString());
    const game = Game.build({
        game_id: gameId,
        game_size: board.size,
        game_seed: board.seed,
        game_isSeedCustom: (() => {
            if (!req.body.seed) return false;
            else if (req.body.seed != null) return true;
        })(),
        game_easyMode: req.body.easyMode || false,
        isWon: false,
    });
    game.save()
        .then(() => res.json({ board: board.tiles, gameId, size: board.size }))
        .catch((err) => next(err));
}

/**
 * - PUT /api/game/:id
 * - Win given game
 * @param {string} req.params.id - game_id of the game
 * @param {array} req.body.moves - ["A1","C5","B9","B9","B9","B9"]
 * @param {string} req.body.playerName - optional, defaults to "Anonymous"
 * @returns {boolean} - sends back isWon boolean, false should only happen in extreme cases
 * @returns {number} - sends back score
 */
function winGame(req, res, next) {
    Game.findOne({ where: { game_id: req.params.id } })
        .then((game) => {
            if (!game) {
                return res.json({ info: "Game doesn't exist" });
            }
            if (game.game_isWon === true) {
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
            console.log('PLAYER: ' + req.body.playerName);
            console.log('MOVE COUNT: ' + req.body.moves.length);
            game.game_player_name = req.body.playerName;
            game.game_end_time = Date.now();
            game.game_time = game.game_end_time - game.game_start_time;
            game.game_move_count = req.body.moves.length;
            game.game_isWon = isWon;
            game.game_score = calculateScore(game);
            return game.save().then(() => {
                return res.json({
                    score: game.game_score,
                    time: game.game_time,
                    moveCount: game.game_move_count,
                    seed: game.game_seed,
                    isSeedCustom: game.game_isSeedCustom,
                });
            });
        })
        .catch((err) => next(err));
}

function highScores(req, res, next) {
    Game.findAll({
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
    })
        .then((scores) => res.json(scores))
        .catch((err) => next(err));
}

export function updateScores(req, res, next) {
    Game.findAll({
        where: {
            game_isWon: true,
            game_isSeedCustom: false,
            game_player_name: { [Op.ne]: '' },
        },
    }).then((result) => {
        result.forEach((element) => {
            Game.findOne({ where: { game_id: element.game_id } }).then(
                (game) => {
                    let oldScore = game.game_score;
                    game.game_score = calculateScore(game);
                    return game.save().then(() => {
                        console.log(
                            'Updated ' +
                                element.game_id +
                                "'s score from " +
                                oldScore +
                                ' to ' +
                                game.game_score,
                        ); //eslint-disable-line no-console
                    });
                },
            );
        });
        res.send('Updated score in ' + result.length + ' rows').catch((err) =>
            next(err),
        );
    });
}

/**
 * - for testing with a database of random entries
 */
export function fakeData(res, req, next) {
    for (let i = 0; i < 10000; i++) {
        const game = Game.create({
            game_id: md5(Date.now()),
            game_size: randBetween(gameConfig.minSize, gameConfig.maxSize),
            game_seed: Date.now() * 2,
            game_isSeedCustom: false,
            game_isWon: true,
            game_score: randBetween(1000, 200000),
            game_player_name: md5(Date.now()).substring(0, 3),
            game_move_count: randBetween(10, 50),
            game_moves: (() => {
                let moves = [];
                let possible = 'ABCDEFGHIJKLMNOP';
                for (let j = 0; j < randBetween(10, 200); j++) {
                    let letter = possible.charAt(
                        Math.floor(Math.random() * possible.length),
                    );
                    let number = randBetween(1, 16);
                    moves[j] = letter + number;
                }
                return moves.toString();
            })(),
            game_start_time: Date.now() - randBetween(1000, 20000),
            game_end_time: Date.now() + randBetween(1000, 20000),
            gamet_time: game.game_end_time - game.game_start_time,
        })
            .then(() => {
                return;
            })
            .catch((err) => next(err));
    }
}

export default { newGame, winGame, highScores, updateScores };
