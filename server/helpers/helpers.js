import gameConfig from '../../config/gameConfig.js';

/**
 * Returns type
 * @param {any} any -any
 * @return {string}
 */
export function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/**
 * Converts numbers to corresponding alphabet letters, eg. 25 -> Z, 0 -> A
 * @param {number} numberInput -numberInput
 * @return {string}
 */
export function intToLetter(numberInput) {
    const alphabet = gameConfig.alphabet;
    const base = alphabet.length;

    let digits = [];
    let chars = [];

    do {
        let v = numberInput % base;
        digits.push(v);
        numberInput = Math.floor(numberInput / base);
    } while (numberInput-- > 0);

    while (digits.length) {
        chars.push(alphabet[digits.pop()]);
    }

    return chars.join('');
}

/**
 * Converts alphabet letters to corresponding number, eg. AC -> 28, A -> 0
 * @param {string} stringInput -stringInput
 * @return {number}
 */
export function letterToInt(stringInput) {
    const alphabet = gameConfig.alphabet;
    stringInput = stringInput.toUpperCase();
    let i, j, result = 0;

        for (i = 0, j = stringInput.length - 1; i < stringInput.length; i += 1, j -= 1) {
            result += Math.pow(alphabet.length, j) * (alphabet.indexOf(stringInput[i]) + 1);
        }

        return result - 1;
}

/**
 * Generates a random number between two integers, inclusive
 * @param {number} min -min
 * @param {number} max -max
 * @return {number}
 */
export function randBetween(min, max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default { toType, intToLetter, letterToInt, randBetween };
