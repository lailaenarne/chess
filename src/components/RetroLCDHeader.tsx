/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { OpponentType, BoardStyle } from "../types";
import { PixelChessPiece } from "./PixelChessPiece";

interface RetroLCDHeaderProps {
  turn: "w" | "b";
  opponent: OpponentType;
  capturedPieces: { w: string[]; b: string[] }; // w: pieces captured by White, b: pieces captured by Black
  isCheck: boolean;
  isGameOver: boolean;
  resultMessage: string | null;
  boardStyle: BoardStyle;
  isGemmaLoading: boolean;
}

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const RetroLCDHeader: React.FC<RetroLCDHeaderProps> = ({
  turn,
  opponent,
  capturedPieces,
  isCheck,
  isGameOver,
  resultMessage,
  boardStyle,
  isGemmaLoading
}) => {
  const [seconds, setSeconds] = useState(0);

  // Simple game clock
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isGameOver) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameOver]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get opponent literal label
  const getOpponentLabel = () => {
    switch (opponent) {
      case "gemma":
        return "GEMMA LLM";
      case "fallback":
        return "MINIMAX CPU";
      case "pass":
        return "2P HUMAN";
    }
  };

  // Calculate scores
  const whitePoints = (capturedPieces.w || []).reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] || 0), 0);
  const blackPoints = (capturedPieces.b || []).reduce((sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] || 0), 0);
  const whiteAdv = whitePoints - blackPoints;
  const blackAdv = blackPoints - whitePoints;

  const getHeaderStyles = () => {
    switch (boardStyle) {
      case "pastel":
        return {
          bg: "bg-[#fff7ed]", 
          border: "border-2 border-[#fb7185]",
          shadow: "shadow-[4px_4px_0px_0px_#bae6fd]",
          textMuted: "text-rose-500",
          textAccent: "text-[#be185d]",
          subtext: "text-sky-600",
          glow: "drop-shadow-[0_0_5px_#fbcfe8]",
          terminalBg: "bg-white border-2 border-[#fed7aa] rounded",
          warningBg: "bg-rose-50 border border-rose-200 rounded",
          warningText: "text-rose-500",
          subWarningText: "text-sky-600",
          infoText: "text-[#be185d]",
          timerBg: "bg-white border border-[#fed7aa] text-sky-700",
          scanlineOpacity: "opacity-[0.02]"
        };
      case "pastelPeach":
        return {
          bg: "bg-[#fffcf5]", 
          border: "border-2 border-[#fb923c]",
          shadow: "shadow-[4px_4px_0px_0px_#fef08a]",
          textMuted: "text-orange-500",
          textAccent: "text-[#c2410c]",
          subtext: "text-yellow-600",
          glow: "drop-shadow-[0_0_5px_#fef08a]",
          terminalBg: "bg-white border-2 border-[#fcd34d] rounded",
          warningBg: "bg-orange-50 border border-orange-200 rounded",
          warningText: "text-orange-600",
          subWarningText: "text-yellow-600",
          infoText: "text-[#c2410c]",
          timerBg: "bg-white border border-[#fcd34d] text-orange-700",
          scanlineOpacity: "opacity-[0.02]"
        };
      case "pastelMint":
        return {
          bg: "bg-[#f0fdfa]", 
          border: "border-2 border-[#2dd4bf]",
          shadow: "shadow-[4px_4px_0px_0px_#e9d5ff]",
          textMuted: "text-teal-600",
          textAccent: "text-[#0f766e]",
          subtext: "text-purple-600",
          glow: "drop-shadow-[0_0_5px_#ccfbf1]",
          terminalBg: "bg-white border-2 border-[#e9d5ff] rounded",
          warningBg: "bg-teal-50 border border-teal-200 rounded",
          warningText: "text-teal-600",
          subWarningText: "text-purple-600",
          infoText: "text-[#0f7654]",
          timerBg: "bg-white border border-[#e9d5ff] text-teal-700",
          scanlineOpacity: "opacity-[0.02]"
        };
      case "pastelLavender":
        return {
          bg: "bg-[#fafaff]", 
          border: "border-2 border-[#818cf8]",
          shadow: "shadow-[4px_4px_0px_0px_#fbcfe8]",
          textMuted: "text-indigo-500",
          textAccent: "text-[#3730a3]",
          subtext: "text-pink-600",
          glow: "drop-shadow-[0_0_5px_#e0e7ff]",
          terminalBg: "bg-white border-2 border-[#fbcfe8] rounded",
          warningBg: "bg-indigo-50 border border-indigo-200 rounded",
          warningText: "text-indigo-600",
          subWarningText: "text-pink-600",
          infoText: "text-[#3730a3]",
          timerBg: "bg-white border border-[#fbcfe8] text-indigo-700",
          scanlineOpacity: "opacity-[0.02]"
        };
      case "wood":
        return {
          bg: "bg-[#3e2715]",
          border: "border-2 border-[#5c3e21]",
          shadow: "shadow-[4px_4px_0px_0px_#2c1d11]",
          textMuted: "text-[#d6a567]",
          textAccent: "text-[#ecd3bc]",
          subtext: "text-[#be9871]",
          glow: "",
          terminalBg: "bg-[#2c1d11] border-2 border-[#4a2e16] rounded",
          warningBg: "bg-red-950/20 border border-red-500/20 rounded",
          warningText: "text-amber-500",
          subWarningText: "text-[#ecd3bc]",
          infoText: "text-[#ecd3bc]",
          timerBg: "bg-[#2c1d11] border border-[#4a2e16] text-[#ecd3bc]",
          scanlineOpacity: "opacity-[0.01]"
        };
      case "gameboy":
        return {
          bg: "bg-[#9bbc0f]",
          border: "border-2 border-[#0f380f]",
          shadow: "shadow-[4px_4px_0px_0px_#306230]",
          textMuted: "text-[#0f380f]/75",
          textAccent: "text-[#0f380f]",
          subtext: "text-[#306230]",
          glow: "",
          terminalBg: "bg-[#8bac0f]/30 border-2 border-[#0f380f] rounded",
          warningBg: "bg-[#8bac0f]/50 border border-[#0f380f]/45 rounded",
          warningText: "text-[#0f380f]",
          subWarningText: "text-[#306230]",
          infoText: "text-[#0f380f]",
          timerBg: "bg-[#8bac0f] border border-[#0f380f] text-[#0f380f]",
          scanlineOpacity: "opacity-[0.05]"
        };
      case "arcade":
        return {
          bg: "bg-[#180a2b]",
          border: "border-2 border-purple-500",
          shadow: "shadow-[4px_4px_0px_0px_rgba(168,85,247,0.25)]",
          textMuted: "text-pink-400",
          textAccent: "text-purple-300",
          subtext: "text-fuchsia-400",
          glow: "drop-shadow-[0_0_8px_rgba(232,121,249,0.4)]",
          terminalBg: "bg-[#090514] border-2 border-fuchsia-500/50 rounded",
          warningBg: "bg-pink-950/20 border border-pink-500/30 rounded",
          warningText: "text-pink-500",
          subWarningText: "text-purple-300",
          infoText: "text-pink-400",
          timerBg: "bg-[#090514] border border-fuchsia-500/30 text-pink-400",
          scanlineOpacity: "opacity-[0.04]"
        };
      case "dungeon":
        return {
          bg: "bg-[#292524]",
          border: "border-2 border-[#44403c]",
          shadow: "shadow-[4px_4px_0px_0px_#1c1917]",
          textMuted: "text-stone-400",
          textAccent: "text-stone-200",
          subtext: "text-[#f59e0b]",
          glow: "",
          terminalBg: "bg-[#1c1917] border-2 border-[#44403c] rounded",
          warningBg: "bg-red-950/30 border border-red-500/25 rounded",
          warningText: "text-rose-500",
          subWarningText: "text-amber-500",
          infoText: "text-stone-300",
          timerBg: "bg-[#1c1917] border border-[#44403c] text-stone-300",
          scanlineOpacity: "opacity-[0.02]"
        };
      case "cyber":
      default:
        return {
          bg: "bg-[#0a0c16]",
          border: "border-2 border-[#ff60b5]",
          shadow: "shadow-[4px_4px_0px_0px_#00e5ff]",
          textMuted: "text-zinc-400",
          textAccent: "text-[#00e5ff]",
          subtext: "text-[#ff60b5]",
          glow: "drop-shadow-[0_0_5px_#00e5ff]",
          terminalBg: "bg-[#121424] p-2 border-2 border-[#ff60b5]/50 rounded",
          warningBg: "bg-red-950/20 border border-red-500/25 rounded",
          warningText: "text-[#ff60b5]",
          subWarningText: "text-[#00e5ff]",
          infoText: "text-[#00e5ff]",
          timerBg: "bg-zinc-900 border border-zinc-800 text-zinc-300",
          scanlineOpacity: "opacity-[0.03]"
        };
    }
  };

  const hStyle = getHeaderStyles();

  return (
    <div
      className={`relative w-full max-w-full p-4 border-2 ${hStyle.border} rounded-xl ${hStyle.bg} font-retro ${hStyle.shadow} overflow-hidden`}
    >
      {/* Glitch/Scanline effect overlay */}
      <div className={`absolute inset-0 pointer-events-none ${hStyle.scanlineOpacity} bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,229,255,0.06),rgba(255,96,181,0.02),rgba(0,229,255,0.06))] bg-[size:100%_4px,6px_100%]`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative z-10">
        
        {/* Left Side: Players & Active Turn Status */}
        <div className="space-y-2.5 text-center md:text-left">
          {/* USER Header */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div
              className={`w-3 h-3 ${
                turn === "w" && !isGameOver ? "bg-emerald-400 animate-ping" : "bg-emerald-800"
              } border border-black`}
            />
            <span className="text-[10px] md:text-xs text-zinc-400">1P:</span>
            <span className={`text-[10px] md:text-xs ${turn === "w" && !isGameOver ? `${hStyle.textAccent} font-bold` : "text-zinc-500"}`}>
              HUMAN (WHT)
            </span>
            {whiteAdv > 0 && (
              <span className="text-[8px] px-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-sans font-bold">
                +{whiteAdv}
              </span>
            )}
          </div>

          {/* CPU/Opponent Header */}
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div
              className={`w-3 h-3 ${
                turn === "b" && !isGameOver ? "bg-rose-500 animate-ping" : "bg-rose-950"
              } border border-black`}
            />
            <span className="text-[10px] md:text-xs text-zinc-400">2P:</span>
            <span className={`text-[10px] md:text-xs ${turn === "b" && !isGameOver ? `${hStyle.subtext} font-bold` : "text-zinc-500"}`}>
              {getOpponentLabel()} (BLK)
            </span>
            {blackAdv > 0 && (
              <span className="text-[8px] px-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-sans font-bold">
                +{blackAdv}
              </span>
            )}
          </div>
        </div>

        {/* Center: System Status & Banners */}
        <div className={`text-center ${hStyle.terminalBg} p-2 flex flex-col justify-center items-center h-14 overflow-hidden shadow-inner`}>
          {isGameOver ? (
            <div className="text-center">
              <span className="text-[9px] text-[#ff60b5] block animate-pulse">GAME OVER</span>
              <span className={`text-[10px] block truncate uppercase ${hStyle.glow} ${hStyle.textAccent}`}>
                {resultMessage || "Draw Match!"}
              </span>
            </div>
          ) : isCheck ? (
            <div className={`animate-pulse w-full h-full flex flex-col justify-center items-center`}>
              <span className={`${hStyle.warningText} text-[10px] block tracking-tighter font-extrabold animate-bounce`}>
                ⚠️ WARNING: CHECK ⚠️
              </span>
              <span className={`${hStyle.subWarningText} text-[8px] block`}>PROTECT YOUR KING!</span>
            </div>
          ) : isGemmaLoading ? (
            <div>
              <span className={`${hStyle.textAccent} text-[10px] block animate-bounce`}>GEMMA COMPILING...</span>
              <span className="text-[7px] text-zinc-500 block font-sans">AWAITING LOCAL INFERENCE</span>
            </div>
          ) : (
            <div>
              <span className={`text-[10px] md:text-[11px] uppercase ${hStyle.glow} ${hStyle.textAccent}`}>
                {turn === "w" ? "YOUR TURN (1P)" : "CPU COMPILING (2P)"}
              </span>
              <span className={`text-[7px] ${hStyle.subtext}/80 text-center uppercase block mt-1`}>
                {opponent === "gemma" ? "LOCAL LLM MODE" : "OFFLINE ENGINE MODE"}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Captured Pieces HUD, Points Tracker & Timer */}
        <div className="flex flex-col items-center md:items-end justify-between gap-1.5 h-full">
          {/* Time Counter */}
          <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 justify-end w-full md:justify-end">
            <span className="text-[8px]">CLOCK:</span>
            <span className={`font-mono px-1 rounded text-xs ${hStyle.timerBg}`}>
              {formatTime(seconds)}
            </span>
          </div>

          {/* Captured Pieces lists */}
          <div className="space-y-1 w-full text-center md:text-right flex flex-col justify-end">
            {/* White captured: captured Black pieces */}
            <div className="flex items-center justify-center md:justify-end gap-1 flex-wrap">
              <span className="text-[7.5px] text-zinc-400 font-bold" title="Total Value of Eliminated Black Pieces">
                1P SACRIFICES ({whitePoints} pts):
              </span>
              <div className="flex flex-wrap gap-0.5 max-h-[30px] overflow-x-auto">
                {capturedPieces.w.length === 0 ? (
                  <span className="text-[8px] text-zinc-500 font-sans italic">-</span>
                ) : (
                  capturedPieces.w.map((p, idx) => (
                    <div key={idx} className="w-5 h-5 bg-black/60 border border-zinc-800 p-0.5 rounded shadow-sm flex items-center justify-center">
                      <PixelChessPiece type={p} color="b" boardStyle={boardStyle} size={15} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Black captured: captured White pieces */}
            <div className="flex items-center justify-center md:justify-end gap-1 flex-wrap">
              <span className="text-[7.5px] text-zinc-400 font-bold" title="Total Value of Eliminated White Pieces">
                2P SACRIFICES ({blackPoints} pts):
              </span>
              <div className="flex flex-wrap gap-0.5 max-h-[30px] overflow-x-auto">
                {capturedPieces.b.length === 0 ? (
                  <span className="text-[8px] text-zinc-500 font-sans italic">-</span>
                ) : (
                  capturedPieces.b.map((p, idx) => (
                    <div key={idx} className="w-5 h-5 bg-black/60 border border-zinc-800 p-0.5 rounded shadow-sm flex items-center justify-center">
                      <PixelChessPiece type={p} color="w" boardStyle={boardStyle} size={15} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
