import { GAME_CONFIG } from 'config';
import { GameAttributes } from 'models/game.model';
/**
 * Checks if moves are legal and end up in victory
 * @param {object} game
 * @return {number}
 */
export const calculateScore = ({
    game_size,
    game_isSeedCustom,
    game_easyMode,
    game_move_count,
    game_start_time,
    game_end_time,
}: GameAttributes): number | null => {
    if (!game_move_count || !game_start_time || !game_end_time) {
        throw new Error('Missing game data. Cannot calculate score.');
    }
    if (
        game_size < GAME_CONFIG.minSize ||
        game_isSeedCustom === true ||
        game_easyMode === true
    )
        return null;

    const sizeScore = Math.pow(2.5, game_size);
    // console.log('sizeScore: ' + sizeScore);

    const moveScore = game_size / Math.sqrt(game_move_count);
    // console.log('moveScore: ' + moveScore);

    let timeScore: number;
    if (game_end_time.getTime && game_start_time.getTime) {
        timeScore =
            game_size /
            Math.sqrt(
                (game_end_time.getTime() - game_start_time.getTime()) / 1000,
            );
    } else {
        timeScore =
            game_size /
            Math.sqrt(
                ((game_end_time as unknown as number) -
                    (game_start_time as unknown as number)) /
                    1000,
            );
    }
    // console.log('timeScore: ' + timeScore);

    const result = sizeScore * moveScore * Math.sqrt(timeScore);
    // console.log('TOTAL SCORE: ' + result);

    return Math.trunc(result);
};
