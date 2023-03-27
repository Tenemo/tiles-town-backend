import gameConfig from '../../../config/gameConfig';
/**
 * Checks if moves are legal and end up in victory
 * @param {object} game
 * @return {number}
 */
function score(game) {
    const minSize = gameConfig.minSize;
    if (
        game.game_size < minSize ||
        game.game_isSeedCustom === true ||
        game.game_easyMode === true
    )
        return null;

    const sizeScore = Math.pow(2.5, game.game_size);
    // console.log('sizeScore: ' + sizeScore);

    const moveScore = game.game_size / Math.sqrt(game.game_move_count);
    // console.log('moveScore: ' + moveScore);

    const timeScore =
        game.game_size /
        Math.sqrt((game.game_end_time - game.game_start_time) / 1000);
    // console.log('timeScore: ' + timeScore);

    const result = sizeScore * moveScore * Math.sqrt(timeScore);
    // console.log('TOTAL SCORE: ' + result);

    return Math.trunc(result);
}

export default score;
