// Game state variables
let currentPlayer = ‘X’; // X starts first
let gameBoard = [’’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’]; // 3x3 grid, empty initially
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
const messageElement = document.getElementById(‘message’);
const cells = document.querySelectorAll(’.cell’);
const restartButton = document.getElementById(‘restart’);

// Function to handle cell click
function handleCellClick(event) {
const cell = event.target;
const index = parseInt(cell.getAttribute(‘data-index’));

```
// Check if the cell is already occupied or game is not active
if (gameBoard[index] !== '' || !gameActive) {
    return;
}

// Update the board and UI for the human player (X)
gameBoard[index] = currentPlayer;
cell.textContent = currentPlayer;

// Check if human player wins
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

// Computer's turn
gameActive = false; // Prevent clicks during computer's turn
messageElement.textContent = "Computer is thinking...";

setTimeout(() => {
    computerMove();

    // Check if computer wins
    if (checkWinner()) {
        messageElement.textContent = "Computer wins!";
        highlightWinningCells();
        return;
    }

    // Check for a draw after computer's move
    if (checkDraw()) {
        messageElement.textContent = "It's a draw!";
        return;
    }

    // Hand control back to human player
    gameActive = true;
    messageElement.textContent = "Your turn";
}, 300);
```

}

// Function to check if there’s a winner
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
return gameBoard.every(cell => cell !== ‘’);
}

// Function to highlight winning cells
function highlightWinningCells() {
for (let combination of winningCombinations) {
const [a, b, c] = combination;
if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
cells[a].classList.add(‘winning’);
cells[b].classList.add(‘winning’);
cells[c].classList.add(‘winning’);
break;
}
}
}

// Function for computer’s move (random empty cell)
function computerMove() {
let emptyCells = gameBoard
.map((val, index) => val === ‘’ ? index : null)
.filter(val => val !== null);

```
if (emptyCells.length === 0) return;

let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

gameBoard[randomIndex] = 'O';
cells[randomIndex].textContent = 'O';
```

}

// Function to restart the game
function restartGame() {
gameBoard = [’’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’, ‘’];
gameActive = true;
currentPlayer = ‘X’;
messageElement.textContent = “Your turn”;

```
// Clear the board UI
cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
});
```

}

// Add event listeners
cells.forEach(cell => {
cell.addEventListener(‘click’, handleCellClick);
});

restartButton.addEventListener(‘click’, restartGame);