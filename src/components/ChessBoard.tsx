/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BoardStyle } from "../types";
import { PixelChessPiece } from "./PixelChessPiece";
import { sfx } from "../utils/audio";

interface ChessBoardProps {
  board: any[][]; // chess.js board state
  turn: "w" | "b";
  boardStyle: BoardStyle;
  isFlipped: boolean; // if true, Black is at the bottom, White at the top
  legalDestinations: string[]; // e.g. ["e3", "e4"]
  selectedSquare: string | null; // e.g. "e2"
  lastMove: { from: string; to: string } | null;
  kingInCheckSquare: string | null; // e.g. "e1" (if in check)
  onSquareClick: (square: string) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  boardStyle,
  isFlipped,
  legalDestinations,
  selectedSquare,
  lastMove,
  kingInCheckSquare,
  onSquareClick,
}) => {
  // Dragging support states
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);

  // Style configurations
  const getStyleClasses = () => {
    switch (boardStyle) {
      case "gameboy":
        return {
          lightSquare: "bg-[#8bac0f] border border-[#a3c220]/20",
          darkSquare: "bg-[#306230] border border-[#1b3e1b]/20",
          lightText: "text-[#0f380f]",
          darkText: "text-[#8bac0f]",
          border: "border-8 border-[#0f380f] rounded-none bg-[#9bbc0f]",
          highlight: "bg-[#9ff050]/50 mix-blend-multiply border-2 border-dashed border-[#0f380f] animate-pulse",
          possibleMove: "after:w-4 after:h-4 after:rounded-none after:bg-[#0f380f]/40 hover:bg-[#8bac0f]/80",
          possibleMoveCapture: "border-4 border-dotted border-[#0f380f] bg-red-800/10",
          lastMoveHighlight: "bg-[#8bac0f]/40 border-2 border-dotted border-[#306230]",
          checkHighlight: "bg-red-500/60 border-4 border-double border-red-950 animate-bounce"
        };
      case "arcade":
        return {
          lightSquare: "bg-purple-950/40 border border-purple-500/10",
          darkSquare: "bg-[#180a2b] border border-fuchsia-500/10",
          lightText: "text-pink-400",
          darkText: "text-purple-400",
          border: "border-8 border-purple-700 rounded-none bg-zinc-950 shadow-[0_0_20px_rgba(168,85,247,0.5)]",
          highlight: "bg-fuchsia-500/40 border-2 border-dashed border-fuchsia-400 animate-pulse",
          possibleMove: "after:w-4 after:h-4 after:rounded-none after:bg-cyan-400/50 hover:bg-cyan-500/10",
          possibleMoveCapture: "border-4 border-dashed border-cyan-400 bg-cyan-900/10",
          lastMoveHighlight: "bg-teal-500/20 border-2 border-teal-500/40",
          checkHighlight: "bg-red-500/40 border-4 border-double border-red-500 animate-pulse"
        };
      case "dungeon":
        return {
          lightSquare: "bg-stone-500 border border-stone-600/10",
          darkSquare: "bg-stone-800 border border-stone-900/10",
          lightText: "text-emerald-100",
          darkText: "text-emerald-500",
          border: "border-8 border-stone-900 rounded-lg bg-stone-950 shadow-2xl",
          highlight: "bg-amber-500/40 border-4 border-dotted border-amber-600",
          possibleMove: "after:w-3 after:h-3 after:bg-emerald-400/50 hover:bg-emerald-500/10",
          possibleMoveCapture: "border-4 border-double border-emerald-500 bg-red-950/20",
          lastMoveHighlight: "bg-stone-650/50 border-2 border-stone-400",
          checkHighlight: "bg-[#710c0c] border-4 border-dashed border-red-500 animate-pulse"
        };
      case "pastel":
        return {
          lightSquare: "bg-[#fed7aa] border border-[#fef3c7]/30", // soft pastel orange / peach
          darkSquare: "bg-[#fbcfe8] border border-[#fdf2f8]/30", // soft pastel pink / rose
          lightText: "text-[#be185d] font-bold",
          darkText: "text-[#0369a1] font-bold",
          border: "border-[8px] border-[#fb7185] p-2 bg-[#fff7ed] shadow-[12px_12px_0px_0px_#bae6fd]",
          highlight: "bg-[#fb7185]/35 border-2 border-solid border-[#fb7185] [box-shadow:0_0_12px_#fb7185] animate-pulse",
          possibleMove: "after:w-3 after:h-3 after:bg-[#38bdf8]/50 hover:bg-[#38bdf8]/15",
          possibleMoveCapture: "border-4 border-double border-[#fb7185] bg-[#fbcfe8]",
          lastMoveHighlight: "bg-[#bae6fd]/30 border border-dashed border-[#bae6fd]",
          checkHighlight: "bg-[#ffe4e6] border-4 border-double border-[#f43f5e] shadow-[0_0_10px_rgb(244,63,94)] animate-bounce"
        };
      case "pastelPeach":
        return {
          lightSquare: "bg-[#ffedd5] border border-[#fffbeb]/30", // peach/orange light
          darkSquare: "bg-[#fef9c3] border border-[#fefcf0]/30", // soft yellow dark
          lightText: "text-[#c2410c] font-bold",
          darkText: "text-[#854d0e] font-bold",
          border: "border-[8px] border-[#fb923c] p-2 bg-[#fffcf5] shadow-[12px_12px_0px_0px_#fef08a]",
          highlight: "bg-[#f97316]/35 border-2 border-solid border-[#f97316] [box-shadow:0_0_12px_#f97316] animate-pulse",
          possibleMove: "after:w-3 after:h-3 after:bg-[#eab308]/50 hover:bg-[#eab308]/15",
          possibleMoveCapture: "border-4 border-double border-[#f97316] bg-[#fef9c3]",
          lastMoveHighlight: "bg-[#fef08a]/30 border border-dashed border-[#fef08a]",
          checkHighlight: "bg-[#fffbeb] border-4 border-double border-[#ea580c] shadow-[0_0_10px_rgb(234,88,12)] animate-bounce"
        };
      case "pastelMint":
        return {
          lightSquare: "bg-[#ccfbf1] border border-[#f0fdfa]/30", // soft mint light
          darkSquare: "bg-[#f3e8ff] border border-[#faf5ff]/30", // soft lilac dark
          lightText: "text-[#0f766e] font-bold",
          darkText: "text-[#6b21a8] font-bold",
          border: "border-[8px] border-[#2dd4bf] p-2 bg-[#f0fdfa] shadow-[12px_12px_0px_0px_#e9d5ff]",
          highlight: "bg-[#0d9488]/35 border-2 border-solid border-[#0d9488] [box-shadow:0_0_12px_#0d9488] animate-pulse",
          possibleMove: "after:w-3 after:h-3 after:bg-[#a855f7]/50 hover:bg-[#a855f7]/15",
          possibleMoveCapture: "border-4 border-double border-[#2dd4bf] bg-[#f3e8ff]",
          lastMoveHighlight: "bg-[#e9d5ff]/30 border border-dashed border-[#e9d5ff]",
          checkHighlight: "bg-[#f5f3ff] border-4 border-double border-[#7c3aed] shadow-[0_0_10px_rgb(124,58,237)] animate-bounce"
        };
      case "pastelLavender":
        return {
          lightSquare: "bg-[#e0e7ff] border border-[#f5f7ff]/30", // indigo light
          darkSquare: "bg-[#fce7f3] border border-[#fdf4ff]/30", // rose dark
          lightText: "text-[#3730a3] font-bold",
          darkText: "text-[#9d174d] font-bold",
          border: "border-[8px] border-[#818cf8] p-2 bg-[#fafaff] shadow-[12px_12px_0px_0px_#fbcfe8]",
          highlight: "bg-[#6366f1]/35 border-2 border-solid border-[#6366f1] [box-shadow:0_0_12px_#6366f1] animate-pulse",
          possibleMove: "after:w-3 after:h-3 after:bg-[#f43f5e]/50 hover:bg-[#f43f5e]/15",
          possibleMoveCapture: "border-4 border-double border-[#818cf8] bg-[#fce7f3]",
          lastMoveHighlight: "bg-[#fbcfe8]/30 border border-dashed border-[#fbcfe8]",
          checkHighlight: "bg-[#fff1f2] border-4 border-double border-[#e11d48] shadow-[0_0_10px_rgb(225,29,72)] animate-bounce"
        };
      case "cyber":
        return {
          lightSquare: "bg-[#042030] border border-[#00e5ff]/25",
          darkSquare: "bg-[#2b041a] border border-[#ff60b5]/25",
          lightText: "text-[#00e5ff] font-bold",
          darkText: "text-[#ff60b5] font-bold",
          border: "border-[8px] border-[#ff60b5] p-2 bg-[#0a0c16] shadow-[12px_12px_0px_0px_#00e5ff]",
          highlight: "bg-[#ff60b5]/30 border-2 border-solid border-[#ff60b5] [box-shadow:0_0_12px_#ff60b5] animate-pulse",
          possibleMove: "after:w-3 after:h-3 after:bg-[#00e5ff]/50 hover:bg-[#00e5ff]/15",
          possibleMoveCapture: "border-4 border-double border-[#ff60b5] bg-[#2b041a]",
          lastMoveHighlight: "bg-[#00e5ff]/20 border border-dashed border-[#00e5ff]",
          checkHighlight: "bg-red-950 border-4 border-double border-red-500 shadow-[0_0_10px_rgb(239,68,68)] animate-bounce"
        };
      case "wood":
      default:
        // Classic Retro 80s PC wood pixel styling
        return {
          lightSquare: "bg-[#e5c292] border border-[#d6a567]/20",
          darkSquare: "bg-[#b07844] border border-[#945f2e]/20",
          lightText: "text-[#4a2e16]",
          darkText: "text-[#ecd3bc]",
          border: "border-8 border-[#4a2e16] rounded-md bg-[#664426] shadow-2xl",
          highlight: "bg-yellow-400/30 border-2 border-dashed border-yellow-500",
          possibleMove: "after:w-4 after:h-4 after:rounded-full after:bg-[#4a2e16]/35 hover:bg-[#ffe5b4]/20",
          possibleMoveCapture: "border-4 border-dotted border-red-600 bg-red-900/10",
          lastMoveHighlight: "bg-blue-400/20 border-2 border-dashed border-blue-500/50",
          checkHighlight: "bg-red-600/40 border-4 border-double border-red-700 animate-pulse"
        };
    }
  };

  const style = getStyleClasses();

  // Helper arrays for files and ranks
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  // Reorder for when board is flipped
  const activeRanks = isFlipped ? [...ranks].reverse() : ranks;
  const activeFiles = isFlipped ? [...files].reverse() : files;

  const handleSquareClick = (square: string) => {
    sfx.playSelect();
    onSquareClick(square);
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, square: string) => {
    const piece = getPieceAtSquare(square);
    if (!piece) {
      e.preventDefault();
      return;
    }
    sfx.playSelect();
    setDraggedSquare(square);
    // Standard transport
    e.dataTransfer.setData("text/plain", square);
    
    // Custom translucent pixel indicator (or rely on default)
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, square: string) => {
    e.preventDefault(); // Required to allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const sourceSquare = e.dataTransfer.getData("text/plain") || draggedSquare;
    setDraggedSquare(null);

    if (sourceSquare && sourceSquare !== targetSquare) {
      // Direct clicks flow
      // First click: select source
      if (selectedSquare !== sourceSquare) {
        onSquareClick(sourceSquare);
      }
      // Second click: target
      setTimeout(() => {
        onSquareClick(targetSquare);
      }, 30);
    }
  };

  const getPieceAtSquare = (square: string) => {
    const fileIdx = files.indexOf(square[0]);
    const rankIdx = ranks.indexOf(square[1]);
    if (fileIdx === -1 || rankIdx === -1) return null;
    return board[rankIdx]?.[fileIdx];
  };

  return (
    <div className={`p-1 select-none flex flex-col items-center ${style.border}`}>
      {/* 8-bit Screen Reflection Bezel effects for arcade mode */}
      {boardStyle === "arcade" && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-purple-500/5 to-white/5 mix-blend-overlay z-20" />
      )}

      {/* Ranks & Files Wrapper */}
      <div className="grid grid-cols-[30px_1fr] md:grid-cols-[40px_1fr] relative">
        {/* Left labels: Ranks */}
        <div className="flex flex-col justify-around text-center py-2 text-[8px] md:text-[10px] font-retro pr-1 md:pr-2 select-none">
          {activeRanks.map((rank) => (
            <div
              key={rank}
              className={`flex items-center justify-center font-bold h-10 w-6 md:h-14 md:w-8 ${
                isFlipped ? style.lightText : style.lightText
              }`}
            >
              {rank}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-8 grid-rows-8 border-4 border-zinc-950 bg-zinc-950 overflow-hidden shadow-inner">
          {activeRanks.map((rank, rNumIdx) => {
            const actualRowIdx = rNumIdx;
            return activeFiles.map((file, fNumIdx) => {
              const fileIdx = files.indexOf(file);
              const rankIdx = ranks.indexOf(rank);

              // Get square name (e.g. "e4")
              const squareName = `${file}${rank}`;

              // Determine physical light or dark square
              const isDark = (fileIdx + rankIdx) % 2 === 1;

              const piece = board[rankIdx]?.[fileIdx];

              const isSelected = selectedSquare === squareName;
              const isLegalDest = legalDestinations.includes(squareName);
              const isCheck = kingInCheckSquare === squareName;
              const isLastMoveSrc = lastMove?.from === squareName;
              const isLastMoveDst = lastMove?.to === squareName;

              // Grid square styling classes logic
              let squareBgColor = isDark ? style.darkSquare : style.lightSquare;

              // Apply modifiers
              let overlayClass = "";
              if (isSelected) {
                overlayClass = style.highlight;
              } else if (isCheck) {
                overlayClass = style.checkHighlight;
              } else if (isLastMoveSrc || isLastMoveDst) {
                overlayClass = style.lastMoveHighlight;
              }

              // Legal moves overlay dots
              let moveDotClass = "";
              if (isLegalDest) {
                if (piece) {
                  // Capture visual indicator
                  overlayClass += ` ${style.possibleMoveCapture}`;
                } else {
                  // Empty square path dot indicator
                  moveDotClass = `flex items-center justify-center ${style.possibleMove}`;
                }
              }

              return (
                <div
                  id={`square-${squareName}`}
                  key={squareName}
                  className={`relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center cursor-pointer transition-colors duration-150 ${squareBgColor} ${moveDotClass}`}
                  onClick={() => handleSquareClick(squareName)}
                  onDragOver={(e) => handleDragOver(e, squareName)}
                  onDrop={(e) => handleDrop(e, squareName)}
                >
                  {/* Glowing Overlay highlighting state */}
                  {overlayClass && (
                    <div id={`overlay-${squareName}`} className={`absolute inset-0 z-0 ${overlayClass}`} />
                  )}

                  {/* Move indicator dot or ring */}
                  {isLegalDest && !piece && (
                    <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-[#00e5ff]/90 border border-[#090a15] z-10 animate-pulse" />
                  )}

                  {/* Render piece */}
                  {piece && (
                    <div
                      id={`piece-${squareName}`}
                      className="w-8 h-8 md:w-11 md:h-11 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleDragStart(e, squareName)}
                    >
                      <PixelChessPiece
                        type={piece.type}
                        color={piece.color}
                        boardStyle={boardStyle}
                        className="animate-fade-in"
                      />
                    </div>
                  )}
                  
                  {/* Mini Coordinate HUD inside corner square for arcade mode */}
                  {boardStyle === "cyber" && (fNumIdx === 0 || rNumIdx === 7) && (
                    <span className="absolute bottom-0.5 right-1 text-[6px] font-mono opacity-25 text-emerald-300 select-none">
                      {squareName}
                    </span>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Bottom labels: Files */}
      <div className="grid grid-cols-8 w-[320px] md:w-[448px] ml-[30px] md:ml-[40px] text-center pt-2 text-[8px] md:text-[10px] font-retro select-none">
        {activeFiles.map((file) => (
          <div key={file} className={`font-bold ${style.lightText}`}>
            {file.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
};
