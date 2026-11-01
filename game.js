// -------------------------
// Pure game logic (no DOM) — shared by the browser UI and the Node tests
// -------------------------
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.TicTacToe = api;
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Chance that each difficulty plays the optimal (minimax) move
    const DIFFICULTIES = {
        easy:       { label: 'Easy',       optimalRate: 0 },
        medium:     { label: 'Medium',     optimalRate: 0 },
        hard:       { label: 'Hard',       optimalRate: 0.75 },
        unbeatable: { label: 'Unbeatable', optimalRate: 1 }
    };

    function createBoard() {
        return Array(9).fill('');
    }

    function otherPlayer(player) {
        return player === 'X' ? 'O' : 'X';
    }

    function emptyCells(board) {
        const result = [];
        board.forEach((value, index) => {
            if (value === '') result.push(index);
        });
        return result;
    }

    // Returns { winner, line } or null
    function getWinner(board) {
        for (const line of WINNING_COMBINATIONS) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], line };
            }
        }
        return null;
    }

    function isDraw(board) {
        return !getWinner(board) && board.every(cell => cell !== '');
    }

    function randomItem(array, random) {
        return array[Math.floor(random() * array.length)];
    }

    // Index that completes three-in-a-row for `player`, or -1
    function findWinningMove(board, player) {
        for (const index of emptyCells(board)) {
            board[index] = player;
            const wins = getWinner(board) !== null;
            board[index] = '';
            if (wins) return index;
        }
        return -1;
    }

    // Depth-aware minimax: prefers faster wins and slower losses
    function minimax(board, player, ai, depth) {
        const result = getWinner(board);
        if (result) return result.winner === ai ? 10 - depth : depth - 10;
        const spots = emptyCells(board);
        if (spots.length === 0) return 0;

        const maximizing = player === ai;
        let best = maximizing ? -Infinity : Infinity;
        for (const index of spots) {
            board[index] = player;
            const score = minimax(board, otherPlayer(player), ai, depth + 1);
            board[index] = '';
            best = maximizing ? Math.max(best, score) : Math.min(best, score);
        }
        return best;
    }

    // All moves sharing the best minimax score (so the AI isn't predictable)
    function bestMoves(board, ai) {
        let bestScore = -Infinity;
        let moves = [];
        for (const index of emptyCells(board)) {
            board[index] = ai;
            const score = minimax(board, otherPlayer(ai), ai, 1);
            board[index] = '';
            if (score > bestScore) {
                bestScore = score;
                moves = [index];
            } else if (score === bestScore) {
                moves.push(index);
            }
        }
        return moves;
    }

    function chooseMove(board, ai, difficulty, random = Math.random) {
        const spots = emptyCells(board);
        if (spots.length === 0) return -1;
        const settings = DIFFICULTIES[difficulty] || DIFFICULTIES.medium;
        const work = board.slice();

        if (difficulty === 'easy') return randomItem(spots, random);

        if (random() < settings.optimalRate) {
            return randomItem(bestMoves(work, ai), random);
        }

        // Medium (and Hard's off-moments): win if possible, otherwise block
        const win = findWinningMove(work, ai);
        if (win !== -1) return win;
        const block = findWinningMove(work, otherPlayer(ai));
        if (block !== -1) return block;
        if (work[4] === '' && random() < 0.5) return 4;
        return randomItem(spots, random);
    }

    return {
        WINNING_COMBINATIONS,
        DIFFICULTIES,
        createBoard,
        otherPlayer,
        emptyCells,
        getWinner,
        isDraw,
        findWinningMove,
        chooseMove
    };
});
