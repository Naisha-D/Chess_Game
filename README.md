# ♟️ Chess Game

A fully playable chess engine built from scratch with HTML, CSS (Bootstrap), and JavaScript, with no external chess libraries. It implements complete rule based move validation, a board that flips after every turn, timed and untimed game modes, and an AI opponent with selectable difficulty levels, all backed by efficient, DSA driven move generation.

## Why This Project

Chess is a deceptively hard problem to model correctly. Legal move generation alone involves board state tracking, special case rules, and check/checkmate detection that most beginner chess implementations skip or get wrong. This project was built to implement the full rule set correctly and reason carefully about move generation performance, rather than relying on an existing chess library.

## Features

- **Complete move validation**: castling, en passant, pawn promotion, and check/checkmate detection, all implemented from the underlying rules rather than a library
- **Board flip after every turn**: the board automatically flips to face the current player, keeping the game oriented from each player's own perspective
- **Timed and untimed modes**: play a casual untimed game or set a clock for a timed match
- **AI opponent**: three difficulty modes (Easy, Medium, Hard) with distinct move selection strategies
- **Dual move tracking**: a PGN style log of recent moves alongside a full, plain move list view, toggleable from the sidebar
- **Themed UI**: a wooden fireplace background for a warm, focused playing atmosphere, styled with Bootstrap

## Technical Highlights

- **Board representation and move validation**: the board is modeled as an 8x8 matrix. Each piece generates its candidate moves via direction vectors (rank, file, and diagonal offsets for sliding pieces, fixed offset sets for knights and kings), which are then filtered against board boundaries and occupied squares before being checked against check and checkmate constraints by simulating the move on a cloned board state.
- **Pruning before simulation**: rather than generating every pseudo legal move for all pieces and validating each individually, moves are pre filtered against piece specific movement patterns first, reducing the number of expensive "does this leave my king in check" simulations needed per turn.
- **AI difficulty scaling**:
  - **Easy**: selects a random legal move from the current position
  - **Medium**: applies a material based evaluation function (standard piece values) to prefer captures and avoid obviously losing exchanges
  - **Hard**: runs a fixed depth minimax search with alpha beta pruning over the evaluation function, allowing the AI to look ahead multiple moves and avoid short term traps
- **Move history via notation encoding**: each move is converted to standard algebraic (PGN style) notation on the fly rather than stored as raw coordinates, keeping game state human readable and easy to debug or export later.
- **Timer management**: turn based countdown timers are tracked independently per player and synced with the move handler, so the clock pauses and resumes cleanly across turns and board flips.

## Tech Stack

`HTML` · `CSS` · `Bootstrap` · `JavaScript`

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.)

### Installation

```bash
git clone https://github.com/Naisha-D/Chess_Game.git
cd Chess_Game
```

### Running the App

Simply open `index.html` in your browser, or serve it locally:

```bash
# Using Python
python -m http.server 8000

# Then visit http://localhost:8000
```

## How to Play

1. Open the app in your browser
2. Choose timed or untimed mode, and select an AI difficulty level (Easy, Medium, or Hard)
3. Play as White, selecting a piece and then its destination square
4. The board flips after each turn so the current player always views it from their own side
5. The AI responds automatically as Black
6. Track recent moves in PGN style in the sidebar, or switch to the full move list view

## Project Structure

```
├── index.html          # Main game page and board markup
├── style.css           # Styling (Bootstrap, custom CSS, background theme)
├── script.js           # Game logic, move validation, timers, and AI opponent
├── backgroundimg.png   # Wooden fireplace background asset
└── README.md
```

## Roadmap

- [ ] Multiplayer support
- [ ] Online matchmaking
- [ ] PGN export/import

## Author

**Naisha D**
GitHub: [@Naisha-D](https://github.com/Naisha-D)

## License

This project is licensed under the MIT License.
