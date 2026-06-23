/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Chess, Square } from "chess.js";
import { GameSettings, LogEntry, ChessMoveDetails, OpponentType } from "./types";
import { sfx } from "./utils/audio";
import { getBestMoveOffline, getPositionStats } from "./utils/chessComputer";
import { getGemmaMove, DEFAULT_URL, DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from "./utils/llmService";
import { ChessBoard } from "./components/ChessBoard";
import { RetroLCDHeader } from "./components/RetroLCDHeader";
import { ControlPanel } from "./components/ControlPanel";
import { PixelChessPiece } from "./components/PixelChessPiece";
import { Button } from "@/components/ui/button";

export default function App() {
  // 1. Core Chess Engine Referencing (holds the actual engine instance for state transitions)
  const gameRef = useRef<Chess>(new Chess());

  // 2. Mirror Engine States (to trigger react triggers)
  const [board, setBoard] = useState(gameRef.current.board());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [moveHistory, setMoveHistory] = useState<ChessMoveDetails[]>([]);

  // 3. Game Settings & Configurations
  const [settings, setSettings] = useState<GameSettings>({
    opponent: "fallback", // Default to local offline CPU for instant playability!
    boardStyle: "cyber",
    soundEnabled: true,
    apiBaseUrl: DEFAULT_URL,
    modelName: DEFAULT_MODEL,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    cpuDelay: 1000,
  });

  // 4. UI Focus states
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalDestinations, setLegalDestinations] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gemmaThinking, setGemmaThinking] = useState<string | null>(null);
  const [isGemmaLoading, setIsGemmaLoading] = useState(false);

  // 5. Game Status HUD states
  const [kingInCheckSquare, setKingInCheckSquare] = useState<string | null>(null);
  const [isCheck, setIsCheck] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // 6. Promotion Prompt State
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string } | null>(null);

  // 7. System console logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Add standard logger
  const addLog = (type: LogEntry["type"], message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        timestamp,
        type,
        message,
      },
    ]);
  };

  // 8. Boot hook: welcome diagnostics
  useEffect(() => {
    sfx.setEnabled(settings.soundEnabled);
    addLog("system", "SYSTEM COLD BOOT: SUCCESSFUL.");
    addLog("system", "CHESS LOGIC PROCESSOR ONLINE.");
    addLog("system", "Sfx sound engine loaded.");
    addLog("system", "Default opponent: Minimax CPU (Offline Core).");
    addLog("system", "Click SETUP GUIDE above to connect LM Studio.");
  }, []);

  // Sync Audio Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.soundEnabled !== undefined) {
        sfx.setEnabled(newSettings.soundEnabled);
      }
      return merged;
    });
    
    // Add log for certain updates
    if (newSettings.opponent) {
      let text = "Two-player hotseat pass & play activated.";
      if (newSettings.opponent === "gemma") text = "Target set to Local LM Studio (Gemma model).";
      if (newSettings.opponent === "fallback") text = "Target set to local Minimax Offline CPU.";
      addLog("system", `Opponent adjusted: ${text}`);
    }
    if (newSettings.boardStyle) {
      addLog("system", `Palette adjusted: Theme set to "${newSettings.boardStyle}".`);
    }
  };

  // Helper: Computes captured pieces list currently
  const getCapturedState = () => {
    const initialPieces = {
      w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
      b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    };

    const currentPieces = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    };

    // Scan
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq) {
          const type = sq.type as keyof typeof currentPieces.w;
          const color = sq.color as "w" | "b";
          currentPieces[color][type]++;
        }
      }
    }

    const captured = {
      w: [] as string[], // captured by White (meaning Black pieces captured)
      b: [] as string[], // captured by Black (meaning White pieces captured)
    };

    // Calculate White captured (diff black pieces)
    for (const key in initialPieces.b) {
      const k = key as keyof typeof initialPieces.b;
      const count = initialPieces.b[k] - currentPieces.b[k];
      for (let i = 0; i < count; i++) {
        captured.w.push(k);
      }
    }

    // Calculate Black captured (diff white pieces)
    for (const key in initialPieces.w) {
      const k = key as keyof typeof initialPieces.w;
      const count = initialPieces.w[k] - currentPieces.w[k];
      for (let i = 0; i < count; i++) {
        captured.b.push(k);
      }
    }

    return captured;
  };

  // Helper: Locates King's square for the check highlights
  const locateKing = (color: "w" | "b") => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === "k" && sq.color === color) {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
          return `${files[c]}${ranks[r]}`;
        }
      }
    }
    return null;
  };

  // Re-verify and sync game over results
  const syncGameStateStats = (chess: Chess) => {
    const stats = getPositionStats(chess);
    const activeTurn = chess.turn();

    setBoard(chess.board());
    setFen(chess.fen());
    setTurn(activeTurn);
    setIsCheck(stats.isCheck);

    if (stats.isCheck) {
      const kingSq = locateKing(activeTurn);
      setKingInCheckSquare(kingSq);
    } else {
      setKingInCheckSquare(null);
    }

    if (chess.isGameOver()) {
      setIsGameOver(true);
      let text = "DRAW COMBAT!";
      if (stats.result === "white_win") {
        text = "VICTORY! HUMAN (W) CHЕСKMATES CPU.";
        sfx.playVictory();
      } else if (stats.result === "black_win") {
        text = "DEFEAT! CPU (B) WINNER.";
        sfx.playDefeat();
      } else {
        text = "DECLARED DRAW COMBAT (STALEMATE/REPETITION/MATERIAL).";
        sfx.playVictory(); // draw is neutral
      }
      setResultMessage(text);
      addLog("error", `SYSTEM HALT: ${text}`);
    } else {
      setIsGameOver(false);
      setResultMessage(null);
    }

    // Rebuild history list
    const historyObjs = chess.history({ verbose: true }) as any[];
    const details = historyObjs.map((m) => ({
      san: m.san,
      from: m.from,
      to: m.to,
      color: m.color,
      piece: m.piece,
      flags: m.flags,
      captured: m.captured,
      promotion: m.promotion,
    }));
    setMoveHistory(details);
  };

  // Handle direct player clicks on board squares
  const handleSquareClick = (squareName: string) => {
    if (isGameOver || isGemmaLoading || (turn === "b" && settings.opponent !== "pass")) {
      return; // Awaiting CPU or match is finalized
    }

    const clickedPiece = gameRef.current.get(squareName as Square);

    // 1. Initial selection click:
    if (!selectedSquare) {
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare(squareName);
        // Get valid square coordinates
        const allMoves = gameRef.current.moves({ square: squareName as Square, verbose: true }) as any[];
        setLegalDestinations(allMoves.map((m) => m.to));
      }
      return;
    }

    // 2. Destinational / second click:
    if (selectedSquare === squareName) {
      // De-select tap
      setSelectedSquare(null);
      setLegalDestinations([]);
      return;
    }

    // If tap onto another of their own pieces, switch selection focus to that piece!
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare(squareName);
      const allMoves = gameRef.current.moves({ square: squareName as Square, verbose: true }) as any[];
      setLegalDestinations(allMoves.map((m) => m.to));
      return;
    }

    // Is legal move square coordinate target chosen?
    if (legalDestinations.includes(squareName)) {
      const sourcePiece = gameRef.current.get(selectedSquare as Square);

      // Check for Promo Condition
      const isPawn = sourcePiece?.type === "p";
      const isPromoRank = squareName[1] === "8" || squareName[1] === "1";

      if (isPawn && isPromoRank) {
        // Halt and prompt upgrade modal!
        setPromotionPending({ from: selectedSquare, to: squareName });
        setSelectedSquare(null);
        setLegalDestinations([]);
        return;
      }

      // Standard Move
      executeMove({ from: selectedSquare, to: squareName });
    } else {
      // Off-beat tap, wipe click context
      setSelectedSquare(null);
      setLegalDestinations([]);
    }
  };

  // Make move on engine chess.js and synchronize everything
  const executeMove = (moveOptions: { from: string; to: string; promotion?: string }) => {
    try {
      const isCapture = !!gameRef.current.get(moveOptions.to as Square);
      
      const moveResult = gameRef.current.move(moveOptions);

      if (moveResult) {
        // Trigger sounds
        if (gameRef.current.inCheck()) {
          sfx.playCheck();
        } else if (isCapture) {
          sfx.playCapture();
        } else {
          sfx.playMove();
        }

        // Highlights last move
        setLastMove({ from: moveOptions.from, to: moveOptions.to });
        setSelectedSquare(null);
        setLegalDestinations([]);

        // Sync view with state logs
        const humanName = turn === "w" ? "Human" : "Opponent";
        const logType = turn === "w" ? "user" : "gemma";
        addLog(logType, `${humanName} plays: ${moveResult.san} (${moveResult.from} ➔ ${moveResult.to})`);

        syncGameStateStats(gameRef.current);
      }
    } catch (e) {
      console.error("Illegal move attempt checked", e);
    }
  };

  // Promo selector callback
  const handleSelectPromotion = (type: "q" | "r" | "b" | "n") => {
    if (promotionPending) {
      executeMove({
        from: promotionPending.from,
        to: promotionPending.to,
        promotion: type,
      });
      setPromotionPending(null);
      addLog("success", `Pawn promoted safely to: ${type.toUpperCase()}`);
    }
  };

  // Hard Reset Game Action
  const handleResetGame = () => {
    gameRef.current.reset();
    setBoard(gameRef.current.board());
    setFen(gameRef.current.fen());
    setTurn("w");
    setMoveHistory([]);
    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    setKingInCheckSquare(null);
    setIsCheck(false);
    setIsGameOver(false);
    setResultMessage(null);
    setGemmaThinking(null);
    setIsGemmaLoading(false);
    setPromotionPending(null);
    addLog("system", "SYS REBOOT INITIATED: Board wiped. Match restarted!");
  };

  // Undo / rewind state Log Action
  const handleUndoMove = () => {
    if (isGemmaLoading) return; // Safeguard during network calls

    // In Play vs AI, undo once will undo user, but AI would move again instantly!
    // So we should pop TWICE to step back user's turn (user move + AI move)!
    // If it's pass-and-play, one undo is fine.

    if (settings.opponent === "pass") {
      gameRef.current.undo();
    } else {
      // Undo computer move + human move (2 entries)
      if (moveHistory.length >= 2) {
        gameRef.current.undo();
        gameRef.current.undo();
      } else if (moveHistory.length === 1) {
        // If Black moved first somehow, or only one move on board
        gameRef.current.undo();
      }
    }

    setSelectedSquare(null);
    setLegalDestinations([]);
    setLastMove(null);
    
    // Clear last thinking bubble if stepping back
    setGemmaThinking(null);

    syncGameStateStats(gameRef.current);
    addLog("system", "TIME REVERSED: Retracted transactions.");
  };

  // Toggles black at the bottom
  const handleFlipBoard = () => {
    setIsFlipped(!isFlipped);
  };

  // Clear system Terminal Logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // =========================================================
  // AI Bot Processor Loop: runs on Black's turn (unless Pass & Play)
  // =========================================================
  useEffect(() => {
    if (isGameOver || turn === "w" || settings.opponent === "pass") return;

    let isSubscribed = true;

    // Trigger AI compilation delay (creates cool arcade suspended wait visual)
    setIsGemmaLoading(true);
    const delayTimer = setTimeout(async () => {
      if (!isSubscribed) return;

      const legalMovesUCI = gameRef.current.moves({ verbose: true }).map(
        (m) => m.lan || `${m.from}${m.to}${m.promotion || ""}`
      );

      if (legalMovesUCI.length === 0) {
        setIsGemmaLoading(false);
        return;
      }

      // Mode A: Offline local minimax fallback engine
      if (settings.opponent === "fallback") {
        try {
          const move = getBestMoveOffline(gameRef.current, "b", 2);
          if (move && isSubscribed) {
            // Parse coordinate parsing format (e.g. e7e5)
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.slice(4) || undefined;

            executeMove({ from, to, promotion });
            setGemmaThinking("Beep boop! Offline calculation executed.");
          }
        } catch (err) {
          console.error("Local Minimax Error", err);
        } finally {
          setIsGemmaLoading(false);
        }
      }

      // Mode B: Local Gemma 4 / Gemma 2 via LM Studio Server
      else if (settings.opponent === "gemma") {
        try {
          addLog("system", "Initiating LM Studio prompt pipeline...");
          
          const result = await getGemmaMove(
            fen,
            legalMovesUCI,
            "Black",
            {
              apiBaseUrl: settings.apiBaseUrl,
              modelName: settings.modelName,
              systemPrompt: settings.systemPrompt,
            },
            (type, msg) => {
              if (isSubscribed) addLog(type, msg);
            }
          );

          if (result && result.move && isSubscribed) {
            const move = result.move.toLowerCase();
            const from = move.slice(0, 2);
            const to = move.slice(2, 4);
            const promotion = move.slice(4) || undefined;

            executeMove({ from, to, promotion });
            setGemmaThinking(result.thinking || "Tactical calculations updated.");
            addLog("gemma", `Gemma thinking: "${result.thinking || ""}"`);
          }
        } catch (error: any) {
          if (!isSubscribed) return;
          // FLUID FAILOVER CRITICAL:
          addLog("error", "FAILOVER DETECTED: Engaging Offline minimax engine backup Core to avoid game crash.");
          const fallbackMove = getBestMoveOffline(gameRef.current, "b", 2);
          if (fallbackMove) {
            const from = fallbackMove.slice(0, 2);
            const to = fallbackMove.slice(2, 4);
            const promotion = fallbackMove.slice(4) || undefined;

            executeMove({ from, to, promotion });
            setGemmaThinking("FAILOVER: Connection failed. Used fallback chess engine.");
          }
        } finally {
          if (isSubscribed) setIsGemmaLoading(false);
        }
      }
    }, settings.cpuDelay);

    return () => {
      isSubscribed = false;
      clearTimeout(delayTimer);
    };
  }, [turn, settings.opponent, fen, isGameOver]);

  const getThemeClass = (style: typeof settings.boardStyle) => {
    switch (style) {
      case "pastel":
        return {
          bg: "bg-[#faf5ff]",
          text: "text-[#be185d]",
          borderColor: "border-[#fb7185]",
          cabinet: "bg-[#fff7ed] border-[12px] border-[#fb7185] shadow-[0_0_40px_rgba(251,207,232,0.6),0_0_40px_rgba(186,230,253,0.5)] rounded-2xl",
          neonTitle: "text-[#be185d] drop-shadow-[0_0_10px_#fbcfe8]",
          badgeOpponent: "bg-white border-2 border-[#fb7185] shadow-[4px_4px_0px_0px_#fb7185] text-[#be185d]",
          badgeStatus: "bg-white border-2 border-[#bae6fd] shadow-[4px_4px_0px_0px_#bae6fd] text-sky-650",
          sub: "text-rose-500 font-bold tracking-wider"
        };
      case "pastelPeach":
        return {
          bg: "bg-[#fdfbfc]",
          text: "text-[#c2410c]",
          borderColor: "border-[#fb923c]",
          cabinet: "bg-[#fffcf5] border-[12px] border-[#fb923c] shadow-[0_0_40px_rgba(253,224,71,0.5),0_0_40px_rgba(251,146,60,0.5)] rounded-2xl",
          neonTitle: "text-[#c2410c] drop-shadow-[0_0_10px_#fef08a]",
          badgeOpponent: "bg-white border-2 border-[#fb923c] shadow-[4px_4px_0px_0px_#fb923c] text-[#c2410c]",
          badgeStatus: "bg-white border-2 border-[#fef08a] shadow-[4px_4px_0px_0px_#fef08a] text-yellow-700",
          sub: "text-orange-500 font-bold tracking-wider"
        };
      case "pastelMint":
        return {
          bg: "bg-[#f5fdfb]",
          text: "text-[#0f766e]",
          borderColor: "border-[#2dd4bf]",
          cabinet: "bg-[#f0fdfa] border-[12px] border-[#2dd4bf] shadow-[0_0_40px_rgba(45,212,191,0.5),0_0_40px_rgba(233,213,255,0.5)] rounded-2xl",
          neonTitle: "text-[#0f766e] drop-shadow-[0_0_10px_#ccfbf1]",
          badgeOpponent: "bg-white border-2 border-[#2dd4bf] shadow-[4px_4px_0px_0px_#2dd4bf] text-[#0f7654]",
          badgeStatus: "bg-white border-2 border-[#e9d5ff] shadow-[4px_4px_0px_0px_#e9d5ff] text-indigo-700",
          sub: "text-teal-600 font-bold tracking-wider"
        };
      case "pastelLavender":
        return {
          bg: "bg-[#f9f9ff]",
          text: "text-[#3730a3]",
          borderColor: "border-[#818cf8]",
          cabinet: "bg-[#fafaff] border-[12px] border-[#818cf8] shadow-[0_0_40px_rgba(129,140,248,0.5),0_0_40px_rgba(251,207,232,0.5)] rounded-2xl",
          neonTitle: "text-[#3730a3] drop-shadow-[0_0_10px_#e0e7ff]",
          badgeOpponent: "bg-white border-2 border-[#818cf8] shadow-[4px_4px_0px_0px_#818cf8] text-[#3730a3]",
          badgeStatus: "bg-white border-2 border-[#fbcfe8] shadow-[4px_4px_0px_0px_#fbcfe8] text-pink-700",
          sub: "text-indigo-500 font-bold tracking-wider"
        };
      case "wood":
        return {
          bg: "bg-[#2c1d11]",
          text: "text-[#ecd3bc]",
          borderColor: "border-[#5c3e21]",
          cabinet: "bg-[#3e2715] border-[12px] border-[#5c3e21] shadow-[0_15px_30px_rgba(0,0,0,0.6)] rounded-2xl",
          neonTitle: "text-[#ecd3bc] drop-shadow-[0_0_5px_rgba(0,0,0,0.4)]",
          badgeOpponent: "bg-[#2c1d11] border-2 border-[#5c3e21] shadow-[4px_4px_0px_0px_#2c1d11] text-[#ecd3bc]",
          badgeStatus: "bg-[#2c1d11] border-2 border-[#5c3e21] shadow-[4px_4px_0px_0px_#2c1d11] text-[#ecd3bc]",
          sub: "text-[#d6a567] font-bold"
        };
      case "gameboy":
        return {
          bg: "bg-[#0f2c0f]",
          text: "text-[#8bac0f]",
          borderColor: "border-[#0f380f]",
          cabinet: "bg-[#9bbc0f] border-[12px] border-[#0f380f] shadow-[0_10px_25px_rgba(0,0,0,0.5)] rounded-2xl",
          neonTitle: "text-[#0f380f] drop-shadow-none",
          badgeOpponent: "bg-[#8bac0f]/30 border-2 border-[#0f380f] shadow-[3px_3px_0px_0px_#0f380f] text-[#0f380f]",
          badgeStatus: "bg-[#8bac0f]/30 border-2 border-[#0f380f] shadow-[3px_3px_0px_0px_#0f380f] text-[#306230]",
          sub: "text-[#306230] font-bold"
        };
      case "arcade":
        return {
          bg: "bg-[#0c051a]",
          text: "text-pink-400",
          borderColor: "border-purple-600",
          cabinet: "bg-[#180a2b] border-[12px] border-purple-600 shadow-[0_0_40px_rgba(168,85,247,0.3)] rounded-2xl",
          neonTitle: "text-fuchsia-400 drop-shadow-[0_0_10px_#e879f9]",
          badgeOpponent: "bg-[#090514] border-2 border-fuchsia-500 shadow-[4px_4px_0px_0px_#c084fc] text-pink-400",
          badgeStatus: "bg-[#090514] border-2 border-cyan-500 shadow-[4px_4px_0px_0px_#22d3ee] text-cyan-400",
          sub: "text-purple-400 font-bold"
        };
      case "dungeon":
        return {
          bg: "bg-[#1c1c1c]",
          text: "text-stone-300",
          borderColor: "border-[#44403c]",
          cabinet: "bg-[#292524] border-[12px] border-[#44403c] shadow-[0_15px_30px_rgba(0,0,0,0.8)] rounded-2xl",
          neonTitle: "text-stone-100 drop-shadow-noneLine",
          badgeOpponent: "bg-[#1c1917] border-2 border-[#44403c] shadow-[4px_4px_0px_0px_#18181b] text-amber-500",
          badgeStatus: "bg-[#1c1917] border-2 border-[#44403c] shadow-[4px_4px_0px_0px_#18181b] text-stone-300",
          sub: "text-stone-500 font-bold"
        };
      case "cyber":
      default:
        return {
          bg: "bg-[#07080f]",
          text: "text-[#00E5FF]",
          borderColor: "border-[#1e1e2f]",
          cabinet: "bg-[#090a15] border-[12px] border-[#1e1e2f] shadow-[0_0_50px_rgba(0,229,255,0.15),0_0_50px_rgba(255,96,181,0.15)] rounded-2xl",
          neonTitle: "text-[#00E5FF] drop-shadow-[0_0_10px_#00E5FF]",
          badgeOpponent: "bg-[#121424] border-2 border-[#ff60b5] shadow-[4px_4px_0px_0px_#ff60b5] text-[#ff60b5]",
          badgeStatus: "bg-[#121424] border-2 border-[#00E5FF] shadow-[4px_4px_0px_0px_#00E5FF] text-[#00E5FF]",
          sub: "text-[#ff60b5] font-bold tracking-wider"
        };
    }
  };

  const curr = getThemeClass(settings.boardStyle);

  return (
    <div className={`min-h-screen ${curr.bg} flex flex-col items-center justify-start p-2 md:p-6 ${curr.text} overflow-x-hidden font-mono antialiased relative`}>
      {/* Case cabinet frame */}
      <div className={`w-full max-w-5xl ${curr.cabinet} relative overflow-hidden p-4 md:p-8 flex flex-col gap-4 z-10`}>
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,1)_0px,rgba(0,0,0,1)_1px,transparent_1px,transparent_2px)]"></div>

        {/* Header Section */}
        <div className={`flex flex-col md:flex-row justify-between items-center border-b-4 ${curr.borderColor} pb-4 mb-2 gap-4 z-10`}>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold tracking-tighter uppercase ${curr.neonTitle} font-retro`}>
              Gemma-8 Chess Engine
            </h1>
            <p className={`text-xs mt-1 ${curr.sub}`}>v0.4.2-alpha // LM-STUDIO // GEMMA-4B-IT-Q8</p>
          </div>
          <div className="flex gap-4 md:gap-6 items-center text-right">
            <div className={`px-3 py-1.5 md:px-4 md:py-2 ${curr.badgeOpponent}`}>
              <div className="text-[10px] uppercase opacity-85 font-black">Opponent</div>
              <div className="text-sm md:text-base font-bold">
                {settings.opponent === "gemma" ? "GEMMA-AI" : settings.opponent === "fallback" ? "MINIMAX" : "2P-HUMAN"}
              </div>
            </div>
            <div className={`px-3 py-1.5 md:px-4 md:py-2 ${curr.badgeStatus}`}>
              <div className="text-[10px] uppercase opacity-85 font-black font-retro">Status</div>
              <div className="text-sm md:text-base font-bold animate-pulse">
                {isGameOver ? "HALTED" : turn === "w" ? "YOUR MOVE" : "CALCULATING"}
              </div>
            </div>
          </div>
        </div>

        {/* LCD Information Scoreboard Banner */}
        <div className="w-full z-10">
          <RetroLCDHeader
            turn={turn}
            opponent={settings.opponent}
            capturedPieces={getCapturedState()}
            isCheck={isCheck}
            isGameOver={isGameOver}
            resultMessage={resultMessage}
            boardStyle={settings.boardStyle}
            isGemmaLoading={isGemmaLoading}
          />
        </div>

      {/* Primary Game Console Cabinet Structure */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start z-10 relative">
        <div className="flex justify-center items-center relative">
          
          {/* Main active Chessboard */}
          <ChessBoard
            board={board}
            turn={turn}
            boardStyle={settings.boardStyle}
            isFlipped={isFlipped}
            legalDestinations={legalDestinations}
            selectedSquare={selectedSquare}
            lastMove={lastMove}
            kingInCheckSquare={kingInCheckSquare}
            onSquareClick={handleSquareClick}
          />

          {/* Prompt Dialog Pawn Promotion Modal (Custom Retro Style Overlay) */}
          {promotionPending && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-40 rounded border-4 border-yellow-600 animate-fade-in">
              <div className="bg-zinc-950 border-4 border-double border-yellow-600 p-5 text-center max-w-xs space-y-4 select-none">
                <span className="text-red-500 font-retro text-[10px] block animate-bounce">
                  ⚡ UPGRADE TRIGGERED! ⚡
                </span>
                <p className="text-[10px] text-zinc-400 font-retro leading-relaxed">
                  YOUR PAWN HAS BROKEN THE BORDER! SELECT CHESS SUIT:
                </p>

                <div className="grid grid-cols-2 gap-2 pb-1">
                  {/* Queen */}
                  <Button
                    onClick={() => handleSelectPromotion("q")}
                    className="border-2 border-zinc-700 bg-zinc-900 font-retro text-[9px] hover:bg-zinc-800 text-yellow-500 py-1 flex flex-col h-14 items-center justify-center"
                  >
                    <PixelChessPiece type="q" color={turn} boardStyle={settings.boardStyle} size={24} className="mb-0.5" />
                    QUEEN
                  </Button>
                  
                  {/* Rook */}
                  <Button
                    onClick={() => handleSelectPromotion("r")}
                    className="border-2 border-zinc-700 bg-zinc-900 font-retro text-[9px] hover:bg-zinc-800 text-yellow-500 py-1 flex flex-col h-14 items-center justify-center"
                  >
                    <PixelChessPiece type="r" color={turn} boardStyle={settings.boardStyle} size={24} className="mb-0.5" />
                    ROOK
                  </Button>

                  {/* Bishop */}
                  <Button
                    onClick={() => handleSelectPromotion("b")}
                    className="border-2 border-zinc-700 bg-zinc-900 font-retro text-[9px] hover:bg-zinc-800 text-yellow-500 py-1 flex flex-col h-14 items-center justify-center"
                  >
                    <PixelChessPiece type="b" color={turn} boardStyle={settings.boardStyle} size={24} className="mb-0.5" />
                    BISHOP
                  </Button>

                  {/* Knight */}
                  <Button
                    onClick={() => handleSelectPromotion("n")}
                    className="border-2 border-zinc-700 bg-zinc-900 font-retro text-[9px] hover:bg-zinc-800 text-yellow-500 py-1 flex flex-col h-14 items-center justify-center"
                  >
                    <PixelChessPiece type="n" color={turn} boardStyle={settings.boardStyle} size={24} className="mb-0.5" />
                    KNIGHT
                  </Button>
                </div>

                <div className="text-[7.5px] text-zinc-600 font-retro">
                  * CHOOSE WISELY FOR TACTICAL ASCENSION *
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console control cockpit & parameters panels */}
        <div className="h-[496px] max-h-[496px]">
          <ControlPanel
            settings={settings}
            updateSettings={handleUpdateSettings}
            logs={logs}
            moveHistory={moveHistory}
            currentFen={fen}
            onReset={handleResetGame}
            onUndo={handleUndoMove}
            onFlipBoard={handleFlipBoard}
            isFlipped={isFlipped}
            clearLogs={handleClearLogs}
            gemmaThinking={gemmaThinking}
          />
        </div>
      </main>

      {/* Retro Arcade Credit Subtitle Footer */}
      <footer className="pt-4 text-center select-none z-10 w-full border-t border-[#00FF00]/30 mt-4">
        <span className="text-[7.5px] md:text-[9.5px] text-[#00FF00]/60 font-retro">
          GEMMA-8 COGNITIVE REASONING MATRIX • RETRO-GREEN CHIP TELEMETRY ONLINE
        </span>
      </footer>
      </div>
    </div>
  );
}
