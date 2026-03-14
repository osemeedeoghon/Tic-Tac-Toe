// Game state variables
let currentPlayer = 'X'; // X starts first
let gameBoard = ['', '', '', '', '', '', '', '', '']; // 3x3 grid, empty initially
let gameActive = true; // Game is active until someone wins or draw

// Winning combinations: indices of the board that form a win
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal from top-left
    [2, 4, 6]  // Diagonal from top-right
];

// DOM elements
const messageElement = document.getElementById('message');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');

// Function to handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

    // Check if the cell is already occupied or game is not active
    if (gameBoard[index] !== '' || !gameActive) {
        return;
    }

    // Update the board and UI
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;

    // Check for a winner
    if (checkWinner()) {
        messageElement.textContent = `Player ${currentPlayer} wins!`;
        highlightWinningCells();
        gameActive = false;
        return;
    }

    // Check for a draw
    if (checkDraw()) {
        messageElement.textContent = "It's a draw!";
        gameActive = false;
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    messageElement.textContent = `Player ${currentPlayer}'s turn`;
}

// Function to check if there's a winner
function checkWinner() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return true;
        }
    }
    return false;
}

// Function to check for a draw
function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

// Function to highlight winning cells
function highlightWinningCells() {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            break; // Only one winning combination possible
        }
    }
}

// Function to restart the game
function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    messageElement.textContent = `Player ${currentPlayer}'s turn`;

    // Clear the board UI
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning');
    });
}

// Add event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);