import Joi from 'joi';
import { GAME_CONFIG } from 'config';

export default {
    // POST /api/game/new
    newGame: {
        body: Joi.object({
            size: Joi.number()
                .integer()
                .min(GAME_CONFIG.minSize)
                .max(GAME_CONFIG.maxSize)
                .required(),
            seed: Joi.string().max(256).allow(null).allow('').trim(),
            previousId: Joi.string()
                .length(32)
                .alphanum()
                .lowercase()
                .allow(null)
                .allow(''),
            easyMode: Joi.boolean(),
        }),
    },
    // PUT /api/game/:id
    winGame: {
        params: Joi.object({
            id: Joi.string()
                .length(32)
                .alphanum()
                .lowercase()
                .options({ convert: false })
                .required(),
        }),
        body: Joi.object({
            moves: Joi.array()
                .items(Joi.string().alphanum().max(4))
                .max(10000)
                .required(),
            playerName: Joi.string().max(32).allow('').trim(),
        }),
    },
};
