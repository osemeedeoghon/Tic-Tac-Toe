// Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('../game.js');

const board = str => str.split('').map(c => (c === '.' ? '' : c));

test('detects winners on rows, columns and diagonals', () => {
    assert.deepEqual(game.getWinner(board('XXX......')), { winner: 'X', line: [0, 1, 2] });
    assert.deepEqual(game.getWinner(board('O..O..O..')), { winner: 'O', line: [0, 3, 6] });
    assert.deepEqual(game.getWinner(board('..X.X.X..')), { winner: 'X', line: [2, 4, 6] });
    assert.equal(game.getWinner(board('XOX......')), null);
});

test('a full board with a winner is not a draw', () => {
    assert.equal(game.isDraw(board('XXXOOXXOO')), false);
    assert.equal(game.isDraw(board('XOXXOOOXX')), true);
    assert.equal(game.isDraw(board('XO.......')), false);
});

test('medium takes a win before blocking', () => {
    // O can win at 5; X threatens at 2
    const b = board('XX.OO....');
    assert.equal(game.chooseMove(b, 'O', 'medium', () => 0.99), 5);
});

test('medium blocks an immediate threat', () => {
    const b = board('XX..O....');
    assert.equal(game.chooseMove(b, 'O', 'medium', () => 0.99), 2);
});

test('chooseMove never mutates the board and always picks an empty cell', () => {
    for (const level of Object.keys(game.DIFFICULTIES)) {
        const b = board('X.O.X....');
        const copy = b.slice();
        const move = game.chooseMove(b, 'O', level);
        assert.deepEqual(b, copy);
        assert.equal(b[move], '');
    }
});

test('unbeatable AI never loses against every possible opponent line', () => {
    let games = 0;
    function play(b, turn) {
        const result = game.getWinner(b);
        if (result) {
            assert.notEqual(result.winner, 'X', `AI lost: ${b.join(',')}`);
            games++;
            return;
        }
        if (game.emptyCells(b).length === 0) { games++; return; }
        if (turn === 'O') {
            const move = game.chooseMove(b, 'O', 'unbeatable', () => 0);
            b[move] = 'O';
            play(b, 'X');
            b[move] = '';
        } else {
            for (const i of game.emptyCells(b)) {
                b[i] = 'X';
                play(b, 'O');
                b[i] = '';
            }
        }
    }
    play(game.createBoard(), 'X'); // human opens
    play(game.createBoard(), 'O'); // AI opens
    assert.ok(games > 0);
});

test('unbeatable AI prefers the fastest win', () => {
    // O can win immediately at 2 instead of prolonging
    const b = board('OO.XX....');
    assert.equal(game.chooseMove(b, 'O', 'unbeatable', () => 0), 2);
});
