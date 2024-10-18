

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

let turn = "white"; // "white" or "black"
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

function switchTurn() {
    turn = (turn === "white") ? "black" : "white";
    statusDisplay.innerText = `Turn: ${turn}`;

    if (turn === "black") {
        // AI makes a move
        setTimeout(aiMove, 500); // Small delay to simulate thinking
    }
}

function aiMove() {
    const allMoves = getAllPossibleMoves("black");
    if (allMoves.length > 0) {
        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        movePiece(randomMove.row, randomMove.col);
    }
}

function getAllPossibleMoves(color) {
    let moves = [];
    const pieces = document.querySelectorAll('.piece');
    
    pieces.forEach(piece => {
        const pieceColor = getPieceColor(piece.innerHTML);
        if (pieceColor === color) {
            const square = piece.closest('.square');
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const validMoves = calculateValidMoves(square);
            
            validMoves.forEach(move => {
                moves.push({ ...move, row: row, col: col });
            });
        }
    });

    return moves;
}

function calculateValidMoves(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = square.querySelector('.piece').innerHTML;

    let moves = [];

    switch (piece) {
        case "♙":
            moves = calculatePawnMoves(row, col, "white");
            break;
        case "♟":
            moves = calculatePawnMoves(row, col, "black");
            break;
        case "♖":
        case "♜":
            moves = calculateRookMoves(row, col);
            break;
        case "♘":
        case "♞":
            moves = calculateKnightMoves(row, col);
            break;
        case "♗":
        case "♝":
            moves = calculateBishopMoves(row, col);
            break;
        case "♕":
        case "♛":
            moves = calculateQueenMoves(row, col);
            break;
        case "♔":
        case "♚":
            moves = calculateKingMoves(row, col);
            break;
    }

    return moves.filter(move => !wouldCauseCheck(move));
}
function highlightValidMoves(moves) {
    // Clear any existing highlights
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('highlight');
    });

    // Highlight the valid move squares
    moves.forEach(move => {
        const square = getSquare(move.row, move.col);
        square.classList.add('highlight');
    });
}
function clearValidMoveHighlights() {
    const highlightedSquares = document.querySelectorAll('.highlight');
    highlightedSquares.forEach(square => {
        square.classList.remove('highlight');
    });
}

// Piece movement logic functions

// PAWN MOVEMENT
function calculatePawnMoves(row, col, color) {
    let moves = [];
    let direction = (color === "white") ? -1 : 1;
    
    // Single step forward
    if (isInBounds(row + direction, col) && isEmptySquare(row + direction, col)) {
        moves.push({ row: row + direction, col: col });
    }
    
    // Double step from starting position
    if ((color === "white" && row === 6) || (color === "black" && row === 1)) {
        if (isInBounds(row + 2 * direction, col) && isEmptySquare(row + 2 * direction, col)) {
            moves.push({ row: row + 2 * direction, col: col });
        }
    }
    
    // Diagonal capture
    if (isInBounds(row + direction, col - 1) && isOpponentPiece(row + direction, col - 1, color)) {
        moves.push({ row: row + direction, col: col - 1 });
    }
    if (isInBounds(row + direction, col + 1) && isOpponentPiece(row + direction, col + 1, color)) {
        moves.push({ row: row + direction, col: col + 1 });
    }

    return moves;
}

// ROOK MOVEMENT
function calculateRookMoves(row, col) {
    let moves = [];

    // Horizontal and vertical movements
    for (let i = -1; i <= 1; i += 2) {
        // Vertical movement
        for (let r = row + i; isInBounds(r, col) && isEmptySquare(r, col); r += i) {
            moves.push({ row: r, col: col });
        }
        if (isInBounds(row + i, col) && isOpponentPiece(row + i, col, turn)) {
            moves.push({ row: row + i, col: col });
        }

        // Horizontal movement
        for (let c = col + i; isInBounds(row, c) && isEmptySquare(row, c); c += i) {
            moves.push({ row: row, col: c });
        }
        if (isInBounds(row, col + i) && isOpponentPiece(row, col + i, turn)) {
            moves.push({ row: row, col: col + i });
        }
    }

    return moves;
}

// KNIGHT MOVEMENT
function calculateKnightMoves(row, col) {
    let moves = [];
    const knightMoves = [
        { row: row + 2, col: col + 1 }, { row: row + 2, col: col - 1 },
        { row: row - 2, col: col + 1 }, { row: row - 2, col: col - 1 },
        { row: row + 1, col: col + 2 }, { row: row + 1, col: col - 2 },
        { row: row - 1, col: col + 2 }, { row: row - 1, col: col - 2 }
    ];

    knightMoves.forEach(move => {
        if (isInBounds(move.row, move.col) && (isEmptySquare(move.row, move.col) || isOpponentPiece(move.row, move.col, turn))) {
            moves.push(move);
        }
    });

    return moves;
}

// BISHOP MOVEMENT
function calculateBishopMoves(row, col) {
    let moves = [];

    // Diagonal movements
    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            let r = row + i, c = col + j;
            while (isInBounds(r, c) && isEmptySquare(r, c)) {
                moves.push({ row: r, col: c });
                r += i;
                c += j;
            }
            if (isInBounds(r, c) && isOpponentPiece(r, c, turn)) {
                moves.push({ row: r, col: c });
            }
        }
    }

    return moves;
}

// QUEEN MOVEMENT (Combination of Rook + Bishop)
function calculateQueenMoves(row, col) {
    return [...calculateRookMoves(row, col), ...calculateBishopMoves(row, col)];
}

// KING MOVEMENT
function calculateKingMoves(row, col) {
    let moves = [];
    const kingMoves = [
        { row: row + 1, col: col }, { row: row - 1, col: col },
        { row: row, col: col + 1 }, { row: row, col: col - 1 },
        { row: row + 1, col: col + 1 }, { row: row + 1, col: col - 1 },
        { row: row - 1, col: col + 1 }, { row: row - 1, col: col - 1 }
    ];

    kingMoves.forEach(move => {
        if (isInBounds(move.row, move.col) && (isEmptySquare(move.row, move.col) || isOpponentPiece(move.row, move.col, turn))) {
            moves.push(move);
        }
    });

    return moves;
}

// Helper functions

function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isEmptySquare(row, col) {
    return !getSquare(row, col).querySelector('.piece');
}

function isOpponentPiece(row, col, color) {
    const piece = getSquare(row, col).querySelector('.piece');
    if (!piece) return false;

    const pieceColor = getPieceColor(piece.innerHTML);
    return pieceColor !== color;
}

function getPieceColor(piece) {
    return ["♙", "♖", "♘", "♗", "♕", "♔"].includes(piece) ? "white" : "black";
}

function getSquare(row, col) {
    return board.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}

// Get all possible moves
function isCheckmate() {
    const allMoves = getAllPossibleMoves(turn);

    // If the current player has no valid moves
    if (allMoves.length === 0) {
        // Check if the player is in check
        const kingPosition = (turn === "white") ? whiteKingPosition : blackKingPosition;
        const inCheck = isKingInCheck(copyBoardState(), kingPosition.row, kingPosition.col, turn);

        if (inCheck) {
            return true; // It's checkmate
        }
    }

    return false; // Not checkmate
}

function wouldCauseCheck(move) {
    // Ensure selectedSquare is not null
    if (!selectedSquare) return false;

    const simulatedBoard = copyBoardState(); // Simulate the current board state

    // Temporarily move the piece on the simulated board
    const { row, col } = move;
    const tempPiece = simulatedBoard[selectedSquare.dataset.row][selectedSquare.dataset.col];
    
    // Make sure tempPiece exists (in case no piece is selected)
    if (!tempPiece) return false;

    simulatedBoard[row][col] = tempPiece;
    simulatedBoard[selectedSquare.dataset.row][selectedSquare.dataset.col] = "";

    // Find the king's position after the move
    const kingPosition = (turn === "white") ? whiteKingPosition : blackKingPosition;
    const kingRow = (tempPiece === "♔") ? row : kingPosition.row;
    const kingCol = (tempPiece === "♔") ? col : kingPosition.col;

    // Check if the king would be in check after this move
    const isInCheck = isKingInCheck(simulatedBoard, kingRow, kingCol, turn);

    return isInCheck;
}


// Helper function to check if the king is in check
function isKingInCheck(board, kingRow, kingCol, color) {
    const opponentColor = (color === "white") ? "black" : "white";

    // Iterate over all squares to see if any opponent piece can attack the king
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && getPieceColor(piece) === opponentColor) {
                const opponentMoves = calculateValidMovesForSimulation(board, r, c);
                if (opponentMoves.some(move => move.row === kingRow && move.col === kingCol)) {
                    return true; // King is under attack
                }
            }
        }
    }
    return false;
}

// Helper function to calculate valid moves in a simulated board state (no recursion)
function calculateValidMovesForSimulation(board, row, col) {
    const piece = board[row][col];
    let moves = [];

    // Implement simplified move calculation for simulation
    switch (piece) {
        case "♙":
            moves = calculatePawnMoves(row, col, "white");
            break;
        case "♟":
            moves = calculatePawnMoves(row, col, "black");
            break;
        case "♖":
        case "♜":
            moves = calculateRookMoves(row, col);
            break;
        case "♘":
        case "♞":
            moves = calculateKnightMoves(row, col);
            break;
        case "♗":
        case "♝":
            moves = calculateBishopMoves(row, col);
            break;
        case "♕":
        case "♛":
            moves = calculateQueenMoves(row, col);
            break;
        case "♔":
        case "♚":
            moves = calculateKingMoves(row, col);
            break;
    }

    return moves;
}

// Helper function to copy the current board state for simulation
function copyBoardState() {
    const boardCopy = [];
    const squares = document.querySelectorAll('.square');
    for (let i = 0; i < 8; i++) {
        const row = [];
        for (let j = 0; j < 8; j++) {
            const square = getSquare(i, j);
            const piece = square.querySelector('.piece') ? square.querySelector('.piece').innerHTML : "";
            row.push(piece);
        }
        boardCopy.push(row);
    }
    return boardCopy;
}

// Initialize the chessboard
createChessBoard();
switchTurn();

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
            // Switch the turn if no game-ending condition
            switchTurn();
        }
    }
}

function switchTurn() {
    // Toggle the turn between white and black
    turn = (turn === "white") ? "black" : "white";
    
    // Update the game status to reflect the current player's turn
    statusDisplay.innerText = `Turn: ${turn}`;

    // If it's black's turn and you have an AI for black, handle the AI move
    if (turn === "black") {
        setTimeout(aiMove, 500); // Simulate AI move with a small delay
    }
}
