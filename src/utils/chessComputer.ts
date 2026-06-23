/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chess } from "chess.js";

// Basic Piece Values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simplified positional tables to make the AI play standard developing moves (center control, king safety, active pieces).
// These are from Black's perspective or flipped for White.
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  5, 10, 10,  5,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

// King Middle Game table
const KING_TABLE_MID = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

// Evaluates the board score from White's perspective (+ values benefit White).
export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (square) {
        const type = square.type;
        const color = square.color;
        let pScore = PIECE_VALUES[type] || 0;

        // Apply positional values
        let tableScore = 0;
        const row = color === "w" ? 7 - r : r; // Flip row index for white
        const col = c;

        switch (type) {
          case "p":
            tableScore = PAWN_TABLE[row][col];
            break;
          case "n":
            tableScore = KNIGHT_TABLE[row][col];
            break;
          case "b":
            tableScore = BISHOP_TABLE[row][col];
            break;
          case "r":
            tableScore = ROOK_TABLE[row][col];
            break;
          case "q":
            tableScore = QUEEN_TABLE[row][col];
            break;
          case "k":
            tableScore = KING_TABLE_MID[row][col];
            break;
        }

        const worth = pScore + tableScore;
        if (color === "w") {
          score += worth;
        } else {
          score -= worth;
        }
      }
    }
  }

  return score;
}

// Minimax with Alpha-Beta Pruning
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): [number, string | null] {
  if (depth === 0 || chess.isGameOver()) {
    return [evaluateBoard(chess), null];
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return [evaluateBoard(chess), null];
  }

  // Sort moves slightly: captures first, for better pruning
  moves.sort((a, b) => {
    const aCap = a.captured ? 10 : 0;
    const bCap = b.captured ? 10 : 0;
    return bCap - aCap;
  });

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move.lan || move.san);
      const [evaluation] = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move.lan || `${move.from}${move.to}`;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move.lan || move.san);
      const [evaluation] = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move.lan || `${move.from}${move.to}`;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }
    return [minEval, bestMove];
  }
}

/**
 * Calculates the best move for a given color.
 * Default depth is 3, which strikes a wonderful balance between strength and responsiveness.
 */
export function getBestMoveOffline(chess: Chess, color: "w" | "b", depth: number = 2): string {
  const isWhite = color === "w";
  // Minimax will return the best move
  const [_, move] = minimax(chess, depth, -Infinity, Infinity, isWhite);
  
  if (move) return move;

  // Fallback to a random legal move if minimax returns null (extremely rare)
  const moves = chess.moves({ verbose: true });
  if (moves.length > 0) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return randomMove.lan || `${randomMove.from}${randomMove.to}`;
  }
  return "";
}
export function getPositionStats(chess: Chess) {
  const isCheck = chess.inCheck();
  const isCheckmate = chess.isCheckmate();
  const isDraw = chess.isDraw();
  const isStalemate = chess.isStalemate();
  
  let result = "active";
  if (isCheckmate) {
    result = chess.turn() === "w" ? "black_win" : "white_win";
  } else if (isStalemate) {
    result = "stalemate";
  } else if (isDraw) {
    result = "draw";
  }

  return { isCheck, isCheckmate, isDraw, isStalemate, result };
}
