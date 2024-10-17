const board = document.getElementById("chess-board");
const statusDisplay = document.getElementById("status");

const initialBoardSetup = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

let turn = "black"; // "white" or "black"
let selectedPiece = null;
let selectedSquare = null;
let validMoves = [];

// Store the positions of kings for check/checkmate detection
let whiteKingPosition = { row: 7, col: 4 };
let blackKingPosition = { row: 0, col: 4 };

function createChessBoard() {
    board.innerHTML = ''; // Clear the board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = initialBoardSetup[row][col];
            if (piece) {
                square.innerHTML = `<span class="piece">${piece}</span>`;
            }

            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }
}

function handleSquareClick(event) {
    const clickedSquare = event.target.closest('.square');
    const clickedPiece = clickedSquare.querySelector('.piece');
    const row = parseInt(clickedSquare.dataset.row);
    const col = parseInt(clickedSquare.dataset.col);

    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
        // Move piece if valid move
        movePiece(row, col);
    } else if (clickedPiece) {
        // Select a piece if it's the player's turn
        const pieceColor = getPieceColor(clickedPiece.innerHTML);
        if (pieceColor === turn) {
            selectPiece(clickedSquare);
        }
    }
}

function selectPiece(square) {
    if (selectedPiece) {
        deselectPiece();
    }

    selectedPiece = square.querySelector('.piece');
    selectedSquare = square;
    validMoves = calculateValidMoves(selectedSquare); // Get valid moves
    highlightValidMoves(validMoves);

    square.classList.add('selected');
}

function deselectPiece() {
    if (selectedSquare) {
        selectedSquare.classList.remove('selected');
    }
    clearValidMoveHighlights();
    selectedPiece = null;
    selectedSquare = null;
}

function movePiece(row, col) {
    if (selectedPiece) {
        const targetSquare = getSquare(row, col);
        const piece = selectedPiece.innerHTML;

        // Move the piece on the board
        targetSquare.innerHTML = `<span class="piece">${piece}</span>`;
        selectedSquare.innerHTML = ''; // Clear the original square

        // Update king position if necessary
        if (piece === "♔") whiteKingPosition = { row, col };
        if (piece === "♚") blackKingPosition = { row, col };

        deselectPiece();

        // Check for game-ending conditions
        if (isCheckmate()) {
            statusDisplay.innerText = `Checkmate! ${turn === 'white' ? 'Black' : 'White'} wins!`;
        } else if (isStalemate()) {
            statusDisplay.innerText = "Stalemate! It's a draw.";
        } else {
            switchTurn();
        }
    }
}

function switchTurn() {
    turn = (turn === "white") ? "black" : "white";
    statusDisplay.innerText = `Turn: ${turn}`;
}

function calculateValidMoves(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = square.querySelector('.piece').innerHTML;

    // Implement move logic for each piece type (pawn, rook, knight, etc.)
    let moves = [];

    switch (piece) {
        case "♙":
            moves = calculatePawnMoves(row, col, "white");
            break;
        case "♟":
            moves = calculatePawnMoves(row, col, "black");
            break;
        // Add other pieces here (♖, ♜, ♘, ♞, etc.)
    }

    return moves.filter(move => !wouldCauseCheck(move));
}

function highlightValidMoves(moves) {
    moves.forEach(move => {
        const square = getSquare(move.row, move.col);
        square.classList.add('valid-move');
    });
}

function clearValidMoveHighlights() {
    const highlightedSquares = document.querySelectorAll('.valid-move');
    highlightedSquares.forEach(square => square.classList.remove('valid-move'));
}

function getSquare(row, col) {
    return board.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}

function getPieceColor(piece) {
    return ["♙", "♖", "♘", "♗", "♕", "♔"].includes(piece) ? "white" : "black";
}

function calculatePawnMoves(row, col, color) {
    let moves = [];
    let direction = (color === "white") ? -1 : 1;

    if (isInBounds(row + direction, col) && isEmptySquare(row + direction, col)) {
        moves.push({ row: row + direction, col: col });
    }

    return moves;
}

function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isEmptySquare(row, col) {
    return !getSquare(row, col).querySelector('.piece');
}

function wouldCauseCheck(move) {
    // Check if a move would leave the player's king in check
    // Placeholder logic; implement check detection here
    return false;
}

function isCheckmate() {
    // Placeholder logic for checkmate detection
    return false;
}

function isStalemate() {
    // Placeholder logic for stalemate detection
    return false;
}

// Initialize the chessboard
createChessBoard();
switchTurn();
