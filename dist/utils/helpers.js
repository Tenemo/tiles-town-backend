"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randBetween = exports.letterToInt = exports.intToLetter = exports.convertMoves = void 0;
var _config = require("../config");
/**
 * Converts numbers to corresponding alphabet letters, eg. 25 -> Z, 0 -> A
 * @param {number} numberInput -numberInput
 * @return {string}
 */
const intToLetter = numberInput => {
  const base = _config.GAME_CONFIG.alphabet.length;
  const digits = [];
  let leftover = numberInput + 1;
  do {
    leftover -= 1;
    const v = leftover % base;
    digits.push(v);
    leftover = Math.floor(leftover / base);
  } while (leftover > 0);
  return digits.reverse().map(digit => _config.GAME_CONFIG.alphabet[digit]).join('');
};

/**
 * Converts alphabet letters to corresponding number, eg. AC -> 28, A -> 0
 */
exports.intToLetter = intToLetter;
const letterToInt = input => input.toUpperCase().split('').reverse().reduce((result, character, index) => result + (_config.GAME_CONFIG.alphabet.indexOf(character) + 1) * _config.GAME_CONFIG.alphabet.length ** index, 0) - 1;

/**
 * Converts alphanumeric notation to numerical
 */
exports.letterToInt = letterToInt;
const convertMoves = (moveArray, size) => {
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
exports.convertMoves = convertMoves;
const randBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.randBetween = randBetween;