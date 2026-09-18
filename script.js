// Prevent loading chess game page directly
window.addEventListener("beforeunload", function (e) {
    if (window.location.hash === "#chessgame") {
        e.preventDefault();
		return "";
    }
});


// Player Name Modal
document.getElementById('startButton').onclick = function() {
	document.getElementById('playerModal').style.display = 'flex';
};

document.getElementById('closeModal').onclick = function() {
	document.getElementById('playerModal').style.display = 'none';
};

window.onclick = function(event) {
	const modal = document.getElementById('playerModal');
	if (event.target === modal) {
		modal.style.display = 'none';
	}
};

document.getElementById('playerForm').onsubmit = function(e) {
    e.preventDefault();

    const p1 = document.getElementById('player1').value.trim();
    const p2 = document.getElementById('player2').value.trim();

    if (p1 && p2) {
        playerWhite = p1;
        playerBlack = p2;

        document.getElementById('playerModal').style.display = 'none';

        navigate('#chessgame');
    }
};

// Back Button
document.getElementById('backHomeBtn').onclick = function() {
    if(moveNumber === 1){
        goHome();
        return;
    }
    document.getElementById("confirmExitModal").style.display = "flex";
};

document.getElementById("confirmExitYes").onclick = function(){
    document.getElementById("confirmExitModal").style.display = "none";
    goHome();
};

document.getElementById("confirmExitNo").onclick = function(){
    document.getElementById("confirmExitModal").style.display = "none";
};

function goHome(){
    clearInterval(timerInterval);
    selectedSquare = null;
    currentPlayer = "white";
    whiteTime = 300;
    blackTime = 300;
    moveNumber = 1;

    document.getElementById("moveHistory").innerHTML = "";
    document.getElementById("capturedWhite").innerHTML = "";
    document.getElementById("capturedBlack").innerHTML = "";

    setInitialBoard();

    whiteKingMoved = false;
    blackKingMoved = false;
    whiteRookLeftMoved = false;
    whiteRookRightMoved = false;
    blackRookLeftMoved = false;
    blackRookRightMoved = false;
    enPassantTarget = null;

    document.querySelector(".board-wrapper").classList.remove("flipped");

    window.history.replaceState({}, '', '');
    showPage('');
}

window.addEventListener("click", function(e){
    const modal = document.getElementById("confirmExitModal");
    if(e.target === modal){
        modal.style.display = "none";
    }
});

// Game Over Modal
const gameOverModal = document.getElementById("gameOverModal");
window.addEventListener("click", function(e){
    if(e.target === gameOverModal){
        gameOverModal.style.display = "none";
    }
});

document.getElementById("playAgainBtn").onclick = function(){
    restartGame();
};

// Chess Game Logic
let board = [];
let selectedSquare = null;
let currentPlayer = "white";
let playerWhite = "White";
let playerBlack = "Black";

let whiteKingMoved = false;
let blackKingMoved = false;
let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;
let blackRookLeftMoved = false;
let blackRookRightMoved = false;

let enPassantTarget = null;
let whiteTime = 300;
let blackTime = 300;
let timerInterval = null;
let timedGame = true;
let moveNumber = 1;
let flipBoard = true;
const pieceValue = {p:1, n:2, b:3, r:4, q:5};


function showPage(route) {
    const home = document.getElementById('homePage');
    const chess = document.getElementById('chessGamePage');

    if (route === '#chessgame') {
        home.style.display = 'none';
        chess.style.display = 'block';

        document.getElementById("playerInfo").textContent =
            `${playerWhite} (White) vs ${playerBlack} (Black)`;

        document.getElementById("turn").textContent =
            `${playerWhite}'s Turn`;

        setInitialBoard();

		const whiteTimerEl = document.getElementById("whiteTimer");
		const blackTimerEl = document.getElementById("blackTimer");
		if (whiteTimerEl) whiteTimerEl.textContent = `White: ${whiteTime}`;
		if (blackTimerEl) blackTimerEl.textContent = `Black: ${blackTime}`;
		
		startTimer();
    } else {
        home.style.display = 'block';
        chess.style.display = 'none';
    }

	if(!timedGame){
		document.getElementById("timerPanel").innerHTML =
			"<h3>Timers</h3><div class='timer-box'>No Time Limit</div>";
	}
}

function navigate(route) {
	window.history.pushState({}, '', route);
	showPage(route);
}


function setInitialBoard() {
    board = [
        ["br","bn","bb","bq","bk","bb","bn","br"],
        ["bp","bp","bp","bp","bp","bp","bp","bp"],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["","","","","","","",""],
        ["wp","wp","wp","wp","wp","wp","wp","wp"],
        ["wr","wn","wb","wq","wk","wb","wn","wr"]
    ];

    renderBoard();
}

function renderBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const squareId = `${col+1}_${8-row}`;
            const square = document.getElementById(squareId);

            square.textContent = "";
            square.classList.remove("white-piece", "black-piece", "king-in-check");

            const piece = board[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
                square.classList.add(piece[0] === "w" ? "white-piece" : "black-piece");
            }
        }
    }
}

function getPieceSymbol(piece) {
    const symbols = {
        wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
        bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚"
    };
    return symbols[piece];
}


window.addEventListener('DOMContentLoaded', function() {
    showPage(window.location.hash);
});

document.querySelectorAll(".gamebox").forEach(square => {
    square.addEventListener("click", handleSquareClick);
});

// Selection logic
function handleSquareClick(e) {
    const id = e.target.id;
    const col = parseInt(id.split("_")[0]) - 1;
    const row = 8 - parseInt(id.split("_")[1]);
    const piece = board[row][col];
	clearHighlights();

    if (selectedSquare) {
        const [fromRow, fromCol] = selectedSquare;
        
        if (fromRow === row && fromCol === col) {
            selectedSquare = null;
            return;
        }

        if (piece && piece[0] === currentPlayer[0]) {
            selectedSquare = [row, col];
			highlightSelected(row, col);

			const moves = getValidMoves(row, col);
			highlightMoves(moves);
            return;
        }

        const validMoves = getValidMoves(fromRow, fromCol);
        const isMoveAllowed = validMoves.some(
            move => move[0] === row && move[1] === col
        );

        if (isMoveAllowed) {
			const captured = board[row][col];
			board[row][col] = board[fromRow][fromCol];
			board[fromRow][fromCol] = "";
			if(captured){
				showCapturedPiece(captured);
			}

			const movedPiece = board[row][col];

			//For En Passant
			const previousEnPassant = enPassantTarget;
			enPassantTarget = null;

			// En Passant capture
			if (movedPiece === "wp" && previousEnPassant &&
				row === previousEnPassant[0] && col === previousEnPassant[1]) {
				board[row + 1][col] = "";
			}
			if (movedPiece === "bp" && previousEnPassant &&
				row === previousEnPassant[0] && col === previousEnPassant[1]) {
				board[row - 1][col] = "";
			}

			// New en passant target
			if (movedPiece === "wp" && fromRow === 6 && row === 4) {
				enPassantTarget = [5, col];
			}
			if (movedPiece === "bp" && fromRow === 1 && row === 3) {
				enPassantTarget = [2, col];
			}

			//For Castling
			if (movedPiece === "wk") whiteKingMoved = true;
			if (movedPiece === "bk") blackKingMoved = true;
			if (movedPiece === "wr" && fromRow === 7 && fromCol === 0) whiteRookLeftMoved = true;
			if (movedPiece === "wr" && fromRow === 7 && fromCol === 7) whiteRookRightMoved = true;
			if (movedPiece === "br" && fromRow === 0 && fromCol === 0) blackRookLeftMoved = true;
			if (movedPiece === "br" && fromRow === 0 && fromCol === 7) blackRookRightMoved = true;

			// Castling Rook Movement
			if (movedPiece === "wk" && fromCol === 4 && col === 6) {
				board[7][5] = "wr";
				board[7][7] = "";
			}
			if (movedPiece === "wk" && fromCol === 4 && col === 2) {
				board[7][3] = "wr";
				board[7][0] = "";
			}
			if (movedPiece === "bk" && fromCol === 4 && col === 6) {
				board[0][5] = "br";
				board[0][7] = "";
			}
			if (movedPiece === "bk" && fromCol === 4 && col === 2) {
				board[0][3] = "br";
				board[0][0] = "";
			}

			recordMove(fromRow, fromCol, row, col, captured);
			handlePawnPromotion(row, col);
			renderBoard();

			currentPlayer = currentPlayer === "white" ? "black" : "white";
			const playerColor = currentPlayer === "white" ? "w" : "b";
			startTimer();
			if(flipBoard){
				flipBoardView();
			}
			addCapturedPiece(captured);
			
			if (isCheckmate(playerColor)) {
				highlightKingInCheck(playerColor);
				const winnerColor = currentPlayer === "white" ? "black" : "white";
				endGame(winnerColor, "wins by Checkmate!");
				return;
			}

			if (isStalemate(playerColor)) {
				endGame("draw", "Draw by Stalemate!");
				return;
			}

			if (isInsufficientMaterial()) {
				endGame("draw", "Draw by Insufficient Material!");
				return;
			}

			if (isKingInCheck(playerColor)) {
				highlightKingInCheck(playerColor);
				document.getElementById("turn").textContent =
					currentPlayer === "white"
						? `${playerWhite}'s Turn — CHECK!`
						: `${playerBlack}'s Turn — CHECK!`;

			}else {
				document.getElementById("turn").textContent =
					currentPlayer === "white"
						? `${playerWhite}'s Turn`
						: `${playerBlack}'s Turn`;
			}
		}
		selectedSquare = null;
		clearHighlights();

		} else {
		if (piece && piece[0] === currentPlayer[0]) {
			selectedSquare = [row, col];
			highlightSelected(row, col);

			const moves = getValidMoves(row, col);
			highlightMoves(moves);
		}
	}
}



// Handle browser navigation
window.onpopstate = function() {
	showPage(window.location.hash);
};



//Pawn Logic
function getPawnMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    const color = piece[0];

    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;

    const nextRow = row + direction;

    // Forward move
    if (board[nextRow] && board[nextRow][col] === "") {
        moves.push([nextRow, col]);

        if (row === startRow && board[row + 2 * direction][col] === "") {
            moves.push([row + 2 * direction, col]);
        }
    }

    // Diagonal Capture
    for (let offset of [-1, 1]) {
        const captureCol = col + offset;

        if (
            board[nextRow] &&
            board[nextRow][captureCol] &&
            board[nextRow][captureCol] !== "" &&
            board[nextRow][captureCol][0] !== color
        ) {
            moves.push([nextRow, captureCol]);
        }

		// En Passant Capture
		if (
			enPassantTarget && enPassantTarget[0] === nextRow && enPassantTarget[1] === captureCol){
			moves.push([nextRow, captureCol]);
		}
    }

    return moves;
}

//Pawn Promotion Logic
function handlePawnPromotion(row, col) {
    const piece = board[row][col];

    if (piece === "wp" && row === 0) {
        promotePawn(row, col, "w");
    }

    if (piece === "bp" && row === 7) {
        promotePawn(row, col, "b");
    }
}

function promotePawn(row, col, color) {
    const choice = prompt(
        "Promote pawn to: q (Queen), r (Rook), b (Bishop), n (Knight)"
    );
    const validChoices = ["q", "r", "b", "n"];
    let pieceType = "q";
    if (validChoices.includes(choice)) {
        pieceType = choice;
    }
    board[row][col] = color + pieceType;
    renderBoard();
}


// Knight Logic
function getKnightMoves(row, col) {
    const moves = [];
    const piece = board[row][col];
    const color = piece[0];
    const knightOffsets = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1]
    ];

    knightOffsets.forEach(offset => {
        const newRow = row + offset[0];
        const newCol = col + offset[1];
        if (
            newRow >= 0 && newRow < 8 &&
            newCol >= 0 && newCol < 8
        ) {
            const target = board[newRow][newCol];
            if (!target || target[0] !== color) {
                moves.push([newRow, newCol]);
            }
        }
    });
    return moves;
}


// Bishop Logic
function getBishopMoves(row, col) {
	const moves = [];
	const piece = board[row][col];
	const color = piece[0];
	const directions = [
		[-1, -1], [-1, 1],
		[1, -1], [1, 1]
	];

	for (let [dr, dc] of directions) {
		let r= row + dr;
		let c = col + dc;

		while (r >= 0 && r < 8 && c >= 0 && c < 8) {
			if (board[r][c] === "") {
				moves.push([r, c]);
			} else {
				if (board[r][c][0] !== color) {
					moves.push([r, c]);
				}
				break;
			}
			r += dr;
			c += dc;
		}
	}

	return moves;
}


// Rook Logic
function getRookMoves(row, col) {
	const moves = [];
	const piece = board[row][col];
	const color = piece[0];
	const directions = [
		[-1, 0], [1, 0],
		[0, -1], [0, 1]
	];

	for (let [dr, dc] of directions) {
		let r= row + dr;
		let c = col + dc;

		while (r >= 0 && r < 8 && c >= 0 && c < 8) {
			if (board[r][c] === "") {
				moves.push([r, c]);
			} else {
				if (board[r][c][0] !== color) {
					moves.push([r, c]);
				}
				break;
			}
			r += dr;
			c += dc;
		}
	}
	return moves;
}


// Queen Logic
function getQueenMoves(row, col) {
	return [
		...getBishopMoves(row, col),
		...getRookMoves(row, col)
	];
}

// King Logic
function getKingMoves(row, col) {
	const moves = [];
	const piece = board[row][col];
	const color = piece[0];
	const directions = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1],           [0, 1],
		[1, -1], [1, 0], [1, 1]
	];

	directions.forEach(([dr, dc]) => {
		const newRow = row + dr;
		const newCol = col + dc;
		if (
			newRow >= 0 && newRow < 8 &&
			newCol >= 0 && newCol < 8
		) {
			const target = board[newRow][newCol];
			if (!target || target[0] !== color) {
				moves.push([newRow, newCol]);
			}
		}
	});

	// Castling (from both Queen and King side)
	if (color === "w" && !whiteKingMoved && row === 7 && col === 4) {
		if (!whiteRookRightMoved && board[7][7] === "wr"&& board[7][5] === "" && board[7][6] === "" && !isSquareAttacked(7,4,"b") && !isSquareAttacked(7,5,"b") && !isSquareAttacked(7,6,"b")) {
			moves.push([7,6]);
		}
		if (!whiteRookLeftMoved && board[7][0] === "wr"&& board[7][3] === "" && board[7][2] === "" && board[7][1] === "" && !isSquareAttacked(7,4,"b") && !isSquareAttacked(7,3,"b") && !isSquareAttacked(7,2,"b")) {
			moves.push([7,2]);
		}
	}

	if (color === "b" && !blackKingMoved && row === 0 && col === 4) {
		if (!blackRookRightMoved && board[0][7] === "br"&& board[0][5] === "" && board[0][6] === "" && !isSquareAttacked(0,4,"w") && !isSquareAttacked(0,5,"w") && !isSquareAttacked(0,6,"w")) {
			moves.push([0,6]);
		}
		if (!blackRookLeftMoved && board[0][0] === "br"&& board[0][3] === "" && board[0][2] === "" && board[0][1] === "" && !isSquareAttacked(0,4,"w") && !isSquareAttacked(0,3,"w") && !isSquareAttacked(0,2,"w")) {
			moves.push([0,2]);
		}
	}

	return moves;
}

//Getting Vaid Moves for Selected Piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const type = piece[1];
    let moves = [];

    switch (type) {
        case "p": moves = getPawnMoves(row, col); break;
        case "n": moves = getKnightMoves(row, col); break;
        case "b": moves = getBishopMoves(row, col); break;
        case "r": moves = getRookMoves(row, col); break;
        case "q": moves = getQueenMoves(row, col); break;
        case "k": moves = getKingMoves(row, col); break;
    }

    return moves.filter(move =>
        isMoveLegal(row, col, move[0], move[1])
    );
}


//Selcted Piece and Possible Moves
function highlightSelected(row, col) {
    const squareId = `${col+1}_${8-row}`;
    const square = document.getElementById(squareId);
    square.classList.add("selected");
}

function highlightMoves(moves) {
    moves.forEach(move => {
        const [row, col] = move;
        const squareId = `${col+1}_${8-row}`;
        const square = document.getElementById(squareId);

        if ((row === 7 && (col === 6 || col === 2)) || (row === 0 && (col === 6 || col === 2))) {
            square.classList.add("possible-move");
        } else {
            square.classList.add("possible-move");
        }
    });
}

function clearHighlights() {
    document.querySelectorAll(".selected").forEach(s => {
        s.classList.remove("selected");
    });

    document.querySelectorAll(".possible-move").forEach(s => {
        s.classList.remove("possible-move");
    });

	document.querySelectorAll(".castle-move").forEach(s => {
        s.classList.remove("castle-move");
    });
}


// Check Detection Logic
function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];

            if (piece === color + "k") {
                return [row, col];
            }
        }
    }
}

function isSquareAttacked(row, col, attackerColor) {

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];

            if (piece && piece[0] === attackerColor) {
                let moves = [];
                const type = piece[1];

                switch (type) {
                    case "p": moves = getPawnMoves(r, c); break;
                    case "n": moves = getKnightMoves(r, c); break;
                    case "b": moves = getBishopMoves(r, c); break;
                    case "r": moves = getRookMoves(r, c); break;
                    case "q": moves = getQueenMoves(r, c); break;
                    case "k": moves = [];
						const kingDirs = [
							[-1,-1],[-1,0],[-1,1],
							[0,-1],[0,1],
							[1,-1],[1,0],[1,1]
						];

						kingDirs.forEach(([dr,dc])=>{
							const nr=r+dr;
							const nc=c+dc;

							if(nr>=0 && nr<8 && nc>=0 && nc<8){
								moves.push([nr,nc]);
							}
						});
						break;
                }
                if (moves.some(m => m[0] === row && m[1] === col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isKingInCheck(color) {
    const [kingRow, kingCol] = findKing(color);
    const opponent = color === "w" ? "b" : "w";
    return isSquareAttacked(kingRow, kingCol, opponent);
}



// Move Simulation for Check Detection
function simulateMove(fromRow, fromCol, toRow, toCol) {
    const movingPiece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    board[toRow][toCol] = movingPiece;
    board[fromRow][fromCol] = "";
    return capturedPiece;
}

function undoMove(fromRow, fromCol, toRow, toCol, capturedPiece) {
    const movingPiece = board[toRow][toCol];
    board[fromRow][fromCol] = movingPiece;
    board[toRow][toCol] = capturedPiece;
}

function isMoveLegal(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const color = piece[0];
    const capturedPiece = simulateMove(fromRow, fromCol, toRow, toCol);
    const kingInCheck = isKingInCheck(color);
    undoMove(fromRow, fromCol, toRow, toCol, capturedPiece);
    return !kingInCheck;
}


// Checkmate Detection Logic
function hasAnyLegalMoves(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === color) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;
    return !hasAnyLegalMoves(color);
}

function highlightKingInCheck(color) {
    const [row, col] = findKing(color);
    const squareId = `${col+1}_${8-row}`;
    const square = document.getElementById(squareId);
    square.classList.remove("selected");
    square.classList.add("king-in-check");
}


//Stalemate Detection Logic
function isStalemate(color) {
    if (isKingInCheck(color)) return false;
    return !hasAnyLegalMoves(color);
}


// Insufficient Material / Advance Draw
function isInsufficientMaterial() {
    let pieces = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] !== "") {
                pieces.push(board[r][c]);
            }
        }
    }

    if (pieces.length === 2) return true;
    if (pieces.length === 3 && pieces.some(p => p[1] === "b")) return true;
    if (pieces.length === 3 && pieces.some(p => p[1] === "n")) return true;
    return false;
}


// Time formatting
function formatTime(seconds){
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    const mm = String(m).padStart(2,"0");
    const ss = String(s).padStart(2,"0");

    return `${mm}:${ss}`;
}


// Timer
function startTimer() {
    if (!timedGame) return;

    clearInterval(timerInterval);

    const whiteTimerEl = document.getElementById("whiteTimer");
    const blackTimerEl = document.getElementById("blackTimer");

    timerInterval = setInterval(() => {

        if (currentPlayer === "white") {
            whiteTime--;
            if (whiteTimerEl) {
                whiteTimerEl.textContent = `White: ${formatTime(whiteTime)}`;
            }
            if (whiteTime <= 0) {
                endGame("black", "wins on Time!");
            }

        } else {
            blackTime--;
            if (blackTimerEl) {
                blackTimerEl.textContent = `Black: ${formatTime(blackTime)}`;
            }
            if (blackTime <= 0) {
                endGame("white", "wins on Time!");
            }
        }
    }, 1000);
}


// Record Moves
function recordMove(fromRow, fromCol, toRow, toCol, captured){
    const files = ["a","b","c","d","e","f","g","h"];
    const piece = board[toRow][toCol];
    const symbol = getPieceSymbol(piece);
    const from = files[fromCol] + (8 - fromRow);
    const to = files[toCol] + (8 - toRow);
    let notation;

    if(captured !== ""){
        notation = `${symbol} ${from} × ${to}`;
    }else{
        notation = `${symbol} ${from}→${to}`;
    }

    const moveText = `${moveNumber}.  ${notation}`;
    const div = document.createElement("div");
    div.textContent = moveText;
    const history = document.getElementById("moveHistory");

    if(history){
        history.prepend(div);
    }
    moveNumber++;
}


// End Game
function endGame(resultColor, message) {
    clearInterval(timerInterval);
	document.getElementById("turn").textContent = "Game Over";

    let text;
    if(resultColor === "draw"){
        text = message;
    } else {
        const winner = resultColor === "white" ? playerWhite : playerBlack;
        text = `${winner} ${message}`;
    }
    document.getElementById("winnerText").textContent = text;
    document.getElementById("gameOverModal").style.display = "flex";
    document.querySelectorAll(".gamebox").forEach(sq => {
        sq.removeEventListener("click", handleSquareClick);
    });
}

// Captured Pieces Display
function showCapturedPiece(piece){
    const symbol = getPieceSymbol(piece);
    if(piece[0] === "w"){
        document.getElementById("capturedWhite")
        .insertAdjacentHTML("beforeend", symbol);
    }
    else{
        document.getElementById("capturedBlack")
        .insertAdjacentHTML("beforeend", symbol);
    }
}


//Restart Game
function restartGame(){
    document.getElementById("gameOverModal").style.display = "none";
    clearInterval(timerInterval);

    let temp = playerWhite;
    playerWhite = playerBlack;
    playerBlack = temp;

	document.querySelector(".board-wrapper").classList.remove("flipped");
    document.getElementById("playerInfo").textContent =
        `${playerWhite} (White) vs ${playerBlack} (Black)`;

    currentPlayer = "white";
    document.getElementById("turn").textContent =
        `${playerWhite}'s Turn`;

    whiteTime = 300;
    blackTime = 300;

    document.getElementById("whiteTimer").textContent = "White: 00:30";
    document.getElementById("blackTimer").textContent = "Black: 00:30";

    document.getElementById("moveHistory").innerHTML = "";
    moveNumber = 1;

    document.getElementById("capturedWhite").innerHTML = "";
    document.getElementById("capturedBlack").innerHTML = "";

    setInitialBoard();
	whiteKingMoved = false;
	blackKingMoved = false;
	whiteRookLeftMoved = false;
	whiteRookRightMoved = false;
	blackRookLeftMoved = false;
	blackRookRightMoved = false;
	enPassantTarget = null;

    document.querySelectorAll(".gamebox").forEach(sq=>{
        sq.removeEventListener("click", handleSquareClick);
        sq.addEventListener("click", handleSquareClick);
    });
    startTimer();
}

// Toggle logic
function setupToggle(yesBtn,noBtn,setter){
    const yes = document.getElementById(yesBtn);
    const no = document.getElementById(noBtn);

    yes.onclick = ()=>{
        yes.classList.add("active");
        no.classList.remove("active");
        setter(true);
    };

    no.onclick = ()=>{
        no.classList.add("active");
        yes.classList.remove("active");
        setter(false);
    };
}
setupToggle("timedYes","timedNo",v=>timedGame=v);
setupToggle("flipYes","flipNo",v=>flipBoard=v);


// Board Flip
function flipBoardView(){
    const boardWrapper = document.querySelector(".board-wrapper");
    boardWrapper.classList.toggle("flipped");
}



function addCapturedPiece(piece){
    if(!piece) return;
    const color = piece[0];
    const type = piece[1];
    const container = color === "w"
        ? document.getElementById("capturedWhite")
        : document.getElementById("capturedBlack");

    const span = document.createElement("span");
    span.dataset.type = type;
    span.textContent = getPieceSymbol(piece);
    container.appendChild(span);
    const pieces = Array.from(container.children);
    pieces.sort((a,b)=>{
        return pieceValue[a.dataset.type] - pieceValue[b.dataset.type];
    });

    container.innerHTML="";
    pieces.forEach(p=>container.appendChild(p));
}