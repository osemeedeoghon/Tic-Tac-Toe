// -------------------------
// Game state variables
// -------------------------
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let difficultyLevel = 1; // starts easy

const winningCombinations = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

const messageElement = document.getElementById('message');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');

// -------------------------
// Event Handlers
// -------------------------
function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameBoard[index] !== '' || !gameActive) return;

    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWinner()) {
        messageElement.textContent = `Player ${currentPlayer} wins!`;
        highlightWinningCells();
        gameActive = false;
        return;
    }

    if (checkDraw()) {
        messageElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    gameActive = false;
    messageElement.textContent = "Computer is thinking...";

    setTimeout(() => {
        computerMove();

        if (checkWinner()) {
            messageElement.textContent = "Computer wins!";
            highlightWinningCells();
            gameActive = false;
            return;
        }

        if (checkDraw()) {
            messageElement.textContent = "It's a draw!";
            gameActive = false;
            return;
        }

        gameActive = true;
        messageElement.textContent = "Your turn";

    }, 300);
}

// -------------------------
// Check win/draw
// -------------------------
function checkWinner() {
    for (let combination of winningCombinations) {
        const [a,b,c] = combination;
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

function highlightWinningCells() {
    for (let combination of winningCombinations) {
        const [a,b,c] = combination;
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            break;
        }
    }
}

// -------------------------
// Computer Move
// -------------------------
function computerMove() {
    let emptyCells = gameBoard
        .map((val,index)=> val === '' ? index : null)
        .filter(val => val !== null);

    if (emptyCells.length === 0) return;

    // Level 1: random
    if (difficultyLevel === 1) {
        let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameBoard[randomIndex] = 'O';
        cells[randomIndex].textContent = 'O';
        return;
    }

    // Level 2: block player
    if (difficultyLevel === 2) {
        for (let index of emptyCells) {
            gameBoard[index] = 'X';
            if (checkWinner()) {
                gameBoard[index] = 'O';
                cells[index].textContent = 'O';
                return;
            }
            gameBoard[index] = '';
        }
        let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameBoard[randomIndex] = 'O';
        cells[randomIndex].textContent = 'O';
        return;
    }

    // Level 3-4: try to win + block
    if (difficultyLevel === 3 || difficultyLevel === 4) {
        // Try to win
        for (let index of emptyCells) {
            gameBoard[index] = 'O';
            if (checkWinner()) {
                cells[index].textContent = 'O';
                return;
            }
            gameBoard[index] = '';
        }
        // Block player
        for (let index of emptyCells) {
            gameBoard[index] = 'X';
            if (checkWinner()) {
                gameBoard[index] = 'O';
                cells[index].textContent = 'O';
                return;
            }
            gameBoard[index] = '';
        }
        // Otherwise random
        let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameBoard[randomIndex] = 'O';
        cells[randomIndex].textContent = 'O';
        return;
    }

    // Level 5+: Minimax (unbeatable)
    let bestMove = minimax(gameBoard, 'O').index;
    gameBoard[bestMove] = 'O';
    cells[bestMove].textContent = 'O';
}

// -------------------------
// Minimax Algorithm
// -------------------------
function minimax(newBoard, player) {
    const availSpots = newBoard.map((v,i)=> v===''?i:null).filter(v=>v!==null);

    if (checkWinnerStatic(newBoard, 'X')) return {score: -10};
    if (checkWinnerStatic(newBoard, 'O')) return {score: 10};
    if (availSpots.length === 0) return {score: 0};

    let moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === 'O') {
            let result = minimax(newBoard, 'X');
            move.score = result.score;
        } else {
            let result = minimax(newBoard, 'O');
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

// Static checkWinner for minimax (does not affect main board)
function checkWinnerStatic(board, player) {
    for (let [a,b,c] of winningCombinations) {
        if (board[a] === player &&
            board[a] === board[b] &&
            board[a] === board[c]) return true;
    }
    return false;
}

// -------------------------
// Restart Game
// -------------------------
function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    messageElement.textContent = "Your turn";

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
    });

    // Increase difficulty each restart (max 5)
    if (difficultyLevel < 5) difficultyLevel++;
    console.log("Difficulty level:", difficultyLevel);
}

// -------------------------
// Event Listeners
// -------------------------
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame);
