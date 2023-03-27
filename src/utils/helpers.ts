import { GAME_CONFIG } from 'config';

/**
 * Converts numbers to corresponding alphabet letters, eg. 25 -> Z, 0 -> A
 * @param {number} numberInput -numberInput
 * @return {string}
 */
export const intToLetter = (numberInput: number): string => {
    const base = GAME_CONFIG.alphabet.length;
    const digits = [];
    let leftover = numberInput + 1;
    do {
        leftover -= 1;
        const v = leftover % base;
        digits.push(v);
        leftover = Math.floor(leftover / base);
    } while (leftover > 0);
    return digits
        .reverse()
        .map((digit) => GAME_CONFIG.alphabet[digit])
        .join('');
};

/**
 * Converts alphabet letters to corresponding number, eg. AC -> 28, A -> 0
 */
export const letterToInt = (input: string): number =>
    input
        .toUpperCase()
        .split('')
        .reverse()
        .reduce(
            (result, character, index) =>
                result +
                (GAME_CONFIG.alphabet.indexOf(character) + 1) *
                    GAME_CONFIG.alphabet.length ** index,
            0,
        ) - 1;

/**
 * Converts alphanumeric notation to numerical
 */
export const convertMoves = (moveArray: string[], size: number): number[][] => {
    const numericalMoveArray = moveArray.map((_, i) => {
        // extract integer from the end of the string to row
        const row = (moveArray[i].match(/\d+$/) || []).pop();
        // remove row from the string
        const column = moveArray[i].replace(/\d+$/, '');
        return [letterToInt(column), size - parseInt(row ?? '', 10)];
    });
    return numericalMoveArray;
};

/**
 * Generates a random number between two integers, inclusive
 */
export const randBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
