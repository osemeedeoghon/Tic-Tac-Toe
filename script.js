// Game state variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningCombinations = [
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]
];

const messageElement = document.getElementById('message');
const cells = document.querySelectorAll('.cell');
const restartButton = document.getElementById('restart');

function handleCellClick(event) {
const cell = event.target;
const index = parseInt(cell.getAttribute('data-index'));

if (gameBoard[index] !== '' || !gameActive) {
return;
}

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
return;
}

if (checkDraw()) {
messageElement.textContent = "It's a draw!";
return;
}

gameActive = true;
messageElement.textContent = "Your turn";

}, 300);
}

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

function computerMove() {

let emptyCells = gameBoard
.map((val,index)=> val === '' ? index : null)
.filter(val => val !== null);

if (emptyCells.length === 0) return;

let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];

gameBoard[randomIndex] = 'O';
cells[randomIndex].textContent = 'O';
}

function restartGame() {

gameBoard = ['', '', '', '', '', '', '', '', ''];
gameActive = true;
currentPlayer = 'X';

messageElement.textContent = "Your turn";

cells.forEach(cell => {
cell.textContent = '';
cell.classList.remove('winning');
});
}

cells.forEach(cell => {
cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', restartGame);
