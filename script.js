// -------------------------
// Game state variables
// -------------------------
const { createBoard, getWinner, isDraw, chooseMove, otherPlayer, DIFFICULTIES } = window.TicTacToe;

const HUMAN = 'X';
const COMPUTER = 'O';
const COMPUTER_DELAY = 450; // ms — long enough to feel like a turn, short enough not to drag
const STORAGE_KEY = 'tictactoe:v2';

let gameBoard = createBoard();
let currentPlayer = 'X';
let startingPlayer = 'X';
let gameActive = true;
let computerTimer = null;
let mode = 'cpu';             // 'cpu' | 'pvp'
let difficulty = 'medium';
let scores = { cpu: { X: 0, O: 0, draw: 0 }, pvp: { X: 0, O: 0, draw: 0 } };

const messageElement = document.getElementById('message');
const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');
const resetScoresButton = document.getElementById('reset-scores');
const difficultySelect = document.getElementById('difficulty');
const difficultyControl = document.getElementById('difficulty-control');
const modeButtons = document.querySelectorAll('.segment');
const winLine = document.getElementById('win-line');
const scoreElements = {
    X: document.getElementById('score-x'),
    O: document.getElementById('score-o'),
    draw: document.getElementById('score-draw')
};
const scoreCards = {
    X: document.querySelector('.score-x'),
    O: document.querySelector('.score-o')
};
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');

// -------------------------
// Persistence (best effort — private mode may block storage)
// -------------------------
function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!saved) return;
        if (saved.mode === 'cpu' || saved.mode === 'pvp') mode = saved.mode;
        if (DIFFICULTIES[saved.difficulty]) difficulty = saved.difficulty;
        if (saved.scores) {
            for (const key of ['cpu', 'pvp']) {
                if (saved.scores[key]) scores[key] = { ...scores[key], ...saved.scores[key] };
            }
        }
    } catch (error) {
        // Ignore corrupt or unavailable storage
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, difficulty, scores }));
    } catch (error) {
        // Storage unavailable — scores just won't persist
    }
}

// -------------------------
// Rendering
// -------------------------
function playerName(player) {
    if (mode === 'cpu') return player === HUMAN ? 'You' : 'Computer';
    return `Player ${player}`;
}

function setMessage(text, tone = '') {
    messageElement.textContent = text;
    messageElement.dataset.tone = tone;
}

function updateTurnMessage() {
    if (mode === 'cpu') {
        setMessage(currentPlayer === HUMAN ? 'Your turn' : 'Computer is thinking…', currentPlayer.toLowerCase());
    } else {
        setMessage(`Player ${currentPlayer}'s turn`, currentPlayer.toLowerCase());
    }
}

function renderScores() {
    const current = scores[mode];
    scoreElements.X.textContent = current.X;
    scoreElements.O.textContent = current.O;
    scoreElements.draw.textContent = current.draw;
    labelX.textContent = mode === 'cpu' ? 'You (X)' : 'Player X';
    labelO.textContent = mode === 'cpu' ? 'Computer (O)' : 'Player O';
}

function renderTurnIndicator() {
    scoreCards.X.classList.toggle('active', gameActive && currentPlayer === 'X');
    scoreCards.O.classList.toggle('active', gameActive && currentPlayer === 'O');
    boardElement.dataset.turn = currentPlayer.toLowerCase();
    const locked = !gameActive || (mode === 'cpu' && currentPlayer === COMPUTER);
    boardElement.classList.toggle('locked', locked);
}

function renderControls() {
    modeButtons.forEach(button => {
        button.setAttribute('aria-checked', String(button.dataset.mode === mode));
    });
    difficultySelect.value = difficulty;
    difficultyControl.hidden = mode !== 'cpu';
}

function cellLabel(index) {
    const row = Math.floor(index / 3) + 1;
    const col = (index % 3) + 1;
    return `Row ${row}, column ${col}, ${gameBoard[index] || 'empty'}`;
}

function renderCell(index) {
    const cell = cells[index];
    const value = gameBoard[index];
    cell.textContent = value;
    cell.classList.toggle('x', value === 'X');
    cell.classList.toggle('o', value === 'O');
    cell.setAttribute('aria-label', cellLabel(index));
    cell.setAttribute('aria-disabled', String(value !== '' || !gameActive));
}

function renderBoard() {
    cells.forEach((cell, index) => renderCell(index));
}

function showWinLine(line, winner) {
    const center = i => ({ x: (i % 3) * 100 + 50, y: Math.floor(i / 3) * 100 + 50 });
    const start = center(line[0]);
    const end = center(line[2]);
    // Extend slightly past the outer cell centres
    const dx = (end.x - start.x) * 0.18;
    const dy = (end.y - start.y) * 0.18;
    winLine.setAttribute('x1', start.x - dx);
    winLine.setAttribute('y1', start.y - dy);
    winLine.setAttribute('x2', end.x + dx);
    winLine.setAttribute('y2', end.y + dy);
    winLine.dataset.player = winner.toLowerCase();
    winLine.classList.remove('visible');
    void winLine.getBoundingClientRect(); // restart the draw animation
    winLine.classList.add('visible');
}

// -------------------------
// Game flow
// -------------------------
function placeMove(index, player) {
    gameBoard[index] = player;
    renderCell(index);
    cells[index].classList.add('placed');
}

function finishTurn() {
    const result = getWinner(gameBoard);
    if (result) {
        gameActive = false;
        scores[mode][result.winner]++;
        result.line.forEach(i => cells[i].classList.add('winning'));
        boardElement.classList.add('game-over');
        showWinLine(result.line, result.winner);
        if (mode === 'cpu') {
            setMessage(result.winner === HUMAN ? 'You win! 🎉' : 'Computer wins!', result.winner.toLowerCase());
        } else {
            setMessage(`Player ${result.winner} wins! 🎉`, result.winner.toLowerCase());
        }
        endRound();
        return;
    }

    if (isDraw(gameBoard)) {
        gameActive = false;
        scores[mode].draw++;
        boardElement.classList.add('game-over');
        setMessage("It's a draw!", 'draw');
        endRound();
        return;
    }

    currentPlayer = otherPlayer(currentPlayer);
    updateTurnMessage();
    renderTurnIndicator();
    if (mode === 'cpu' && currentPlayer === COMPUTER) scheduleComputerMove();
}

function endRound() {
    saveState();
    renderScores();
    renderBoard();
    renderTurnIndicator();
    restartButton.classList.add('pulse');
}

function scheduleComputerMove() {
    clearTimeout(computerTimer);
    computerTimer = setTimeout(() => {
        computerTimer = null;
        if (!gameActive || currentPlayer !== COMPUTER) return;
        const index = chooseMove(gameBoard, COMPUTER, difficulty);
        if (index === -1) return;
        placeMove(index, COMPUTER);
        finishTurn();
    }, COMPUTER_DELAY);
}

// -------------------------
// Event Handlers
// -------------------------
function handleCellClick(event) {
    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);

    if (!gameActive || gameBoard[index] !== '') return;
    if (mode === 'cpu' && currentPlayer !== HUMAN) return;

    placeMove(index, currentPlayer);
    finishTurn();
}

function handleBoardKeydown(event) {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (!(event.key in moves)) return;
    const current = Number(document.activeElement.dataset.index);
    if (Number.isNaN(current)) return;
    event.preventDefault();
    let next = current + moves[event.key];
    // Wrap within the row / column instead of jumping rows
    if (event.key === 'ArrowLeft' && current % 3 === 0) next = current + 2;
    if (event.key === 'ArrowRight' && current % 3 === 2) next = current - 2;
    if (next < 0) next += 9;
    if (next > 8) next -= 9;
    cells[next].focus();
}

// -------------------------
// Restart Game
// -------------------------
function restartGame() {
    clearTimeout(computerTimer);
    computerTimer = null;

    gameBoard = createBoard();
    gameActive = true;
    // Alternate who opens each round so neither side always has the advantage
    startingPlayer = otherPlayer(startingPlayer);
    currentPlayer = startingPlayer;

    cells.forEach(cell => cell.classList.remove('winning', 'placed'));
    boardElement.classList.remove('game-over');
    winLine.classList.remove('visible');
    restartButton.classList.remove('pulse');

    renderBoard();
    updateTurnMessage();
    renderTurnIndicator();
    if (mode === 'cpu' && currentPlayer === COMPUTER) scheduleComputerMove();
}

// Settings changes start a fresh round with X opening
function startFresh() {
    startingPlayer = 'O'; // restartGame flips this to X
    restartGame();
}

function setMode(newMode) {
    if (newMode === mode) return;
    mode = newMode;
    saveState();
    renderControls();
    renderScores();
    startFresh();
}

function resetScores() {
    scores[mode] = { X: 0, O: 0, draw: 0 };
    saveState();
    renderScores();
}

// -------------------------
// Event Listeners
// -------------------------
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
boardElement.addEventListener('keydown', handleBoardKeydown);
restartButton.addEventListener('click', restartGame);
resetScoresButton.addEventListener('click', resetScores);
modeButtons.forEach(button => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
});
difficultySelect.addEventListener('change', () => {
    difficulty = difficultySelect.value;
    saveState();
    startFresh();
});
document.addEventListener('keydown', event => {
    // "R" starts a new round (ignored while typing in a control)
    if ((event.key === 'r' || event.key === 'R') && !event.metaKey && !event.ctrlKey &&
        event.target.tagName !== 'SELECT') {
        restartGame();
    }
});

// -------------------------
// Init
// -------------------------
loadState();
renderControls();
renderScores();
renderBoard();
updateTurnMessage();
renderTurnIndicator();
