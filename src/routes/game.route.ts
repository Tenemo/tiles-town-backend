/* TODO: remove */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { validate } from 'express-validation';
import paramValidation from 'constants/paramValidation';
import gameController from 'controllers/game.controller';

const router = express.Router();

router
    .route('/new')
    /* POST /api/game/new - Initialize new game */
    .post(validate(paramValidation.newGame), gameController.newGame);

router
    .route('/:id')
    /* PUT /api/game/:id - Win given game */
    .put(validate(paramValidation.winGame), gameController.winGame);

router
    .route('/highScores')
    /* GET /api/game/highScores - Get highscores */
    .get(gameController.highScores);

// router.route('/update')
//     /* GET /api/game/highScores - Get highscores */
//     .get(gameController.updateScores);

export default router;
