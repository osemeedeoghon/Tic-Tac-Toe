🎮 Tic-Tac-Toe (Web Game)

A polished Tic-Tac-Toe game built with plain HTML, CSS, and JavaScript — no frameworks, no build step.
Play against a computer opponent on four difficulty levels, or pass the device to a friend for local two-player games.

🚀 Play Locally

Clone the repository

git clone https://github.com/osemeedeoghon/tic-tac-toe.git

Open index.html in your browser — no installation or dependencies required.

📌 Features

✅ vs Computer mode with Easy, Medium, Hard and Unbeatable (minimax) difficulty
✅ Local two-player mode
✅ Scoreboard for wins and draws, saved between visits
✅ First move alternates each round
✅ Animated moves, winning-line strike-through and turn indicator
✅ Hover preview of the mark you're about to place
✅ Keyboard play: arrow keys to move, Enter/Space to place, R for a new round
✅ Screen-reader friendly (labelled cells, live status updates)
✅ Responsive layout for phones, tablets and desktops; respects reduced-motion settings

🛠️ Technologies Used

HTML5 – structure of the game

CSS3 – styling, layout and animations

JavaScript (Vanilla) – game logic and interactivity

📂 Project Structure
Tic-Tac-Toe
│
├── index.html          # Game layout and board
├── style.css           # Game styling
├── game.js             # Pure game rules and computer AI (no DOM)
├── script.js           # UI, input handling and game flow
├── tests/game.test.js  # Unit tests for the game logic
└── README.md           # Project documentation

🎯 How to Play

Choose vs Computer or 2 Players (and a difficulty when playing the computer).

Players take turns placing X and O on an empty square.

The first player to get three in a row (horizontal, vertical, or diagonal) wins.

If all cells are filled and no player wins, the game ends in a draw.

Click New Round to play again — the other player opens next.

🧠 Difficulty Levels

Easy – plays random moves

Medium – takes a winning move, otherwise blocks yours

Hard – plays perfectly most of the time, with the occasional slip

Unbeatable – full minimax search; the best you can do is draw

🧪 Running Tests

The game logic is covered by tests that use Node's built-in test runner (Node 18+, no packages needed):

node --test

🔮 Future Improvements

Sound effects

Online multiplayer

Deploy a live version using GitHub Pages

📜 License

This project is open source and available for learning and educational purposes.

👤 Author
Oseme Edeoghon
