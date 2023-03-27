import { letterToInt } from '../../helpers/helpers';

/**
 * Converts numeric notation to alphanumeric
 * @param {string} numInput
 * @return {string}
 */
export function numToAlpha() {}

/**
 * Converts alphanumeric notation to numerical
 * @param {string} moveArray -alphanumeric notation
 * @param {number} size -board size
 * @return {string}
 */
export function alphaToNum(moveArray, size) {
    moveArray.forEach((element, i) => {
        // extract integer from the end of the string to row
        let row = (moveArray[i].match(/\d+$/) || []).pop();
        // remove row from the string
        let column = moveArray[i].replace(/\d+$/, '');
        column = letterToInt(column);
        row = size - row;
        moveArray[i] = [column, row];
    });
    return moveArray;
}

export default { alphaToNum, numToAlpha };
