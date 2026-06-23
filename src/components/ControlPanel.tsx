/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from "react";
import { GameSettings, LogEntry, ChessMoveDetails } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RulesInfo } from "./RulesInfo";
import { sfx } from "../utils/audio";
import {
  RotateCcw,
  Undo2,
  Terminal,
  Volume2,
  VolumeX,
  Copy,
  Sliders,
  Cpu,
  BookOpen,
} from "lucide-react";

interface ControlPanelProps {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  logs: LogEntry[];
  moveHistory: ChessMoveDetails[];
  currentFen: string;
  onReset: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  isFlipped: boolean;
  clearLogs: () => void;
  gemmaThinking: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  logs,
  moveHistory,
  currentFen,
  onReset,
  onUndo,
  onFlipBoard,
  isFlipped,
  clearLogs,
  gemmaThinking,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom when new logs stream in
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Format move history into clean standard algebraic columns (e.g. 1. e4 e5 2. Nf3 Nc6)
  const renderFormattedHistory = () => {
    const formatted: { num: number; w: string; b: string }[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const turnNum = Math.floor(i / 2) + 1;
      formatted.push({
        num: turnNum,
        w: moveHistory[i]?.san || "",
        b: moveHistory[i + 1]?.san || "",
      });
    }

    if (formatted.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500 font-retro text-[9px]">
          NO MOVES YET
        </div>
      );
    }

    return (
      <div className="w-full text-xs font-mono border-collapse">
        <div className="grid grid-cols-3 border-b-2 border-zinc-800 pb-1 text-zinc-500 font-bold uppercase text-[9px] font-retro text-center">
          <div>TURN</div>
          <div>1P (W)</div>
          <div>2P (B)</div>
        </div>
        <div className="divide-y divide-zinc-900">
          {formatted.map((row) => (
            <div
              key={row.num}
              className="grid grid-cols-3 py-1.5 text-center text-zinc-300 hover:bg-zinc-900/40"
            >
              <div className="font-retro text-[8px] text-yellow-600 mr-2 flex items-center justify-center">
                {row.num.toString().padStart(2, "0")}
              </div>
              <div className="font-bold font-mono tracking-wide">{row.w}</div>
              <div className="font-bold font-mono tracking-wide text-red-400">
                {row.b || "..."}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const copyFenToClipboard = () => {
    sfx.playSelect();
    navigator.clipboard.writeText(currentFen);
    // Add temporary event to console
    const logId = Math.random().toString();
  };

  return (
    <Card className="w-full h-full bg-[#0a0c16] border-2 border-[#ff60b5] p-4 shadow-[4px_4px_0px_0px_#00e5ff] rounded-none font-mono flex flex-col justify-between text-[#00e5ff] overflow-hidden select-none">
      <Tabs defaultValue="controls" className="w-full flex flex-col h-full justify-start">
        {/* Nav Tabs List Header */}
        <TabsList className="grid grid-cols-3 w-full bg-[#05060d] display-flex border-2 border-[#ff60b5]/40 p-0.5 rounded-none mb-3">
          <TabsTrigger
            value="controls"
            className="rounded-none font-retro text-[8px] py-1.5 cursor-pointer data-[state=active]:bg-[#00e5ff] data-[state=active]:text-black text-[#00e5ff]"
            onClick={() => sfx.playSelect()}
          >
            <Terminal className="w-3 h-3 mr-1 inline-block" />
            CONSOLE
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none font-retro text-[8px] py-1.5 cursor-pointer data-[state=active]:bg-[#ff60b5] data-[state=active]:text-black text-[#ff60b5]"
            onClick={() => sfx.playSelect()}
          >
            <BookOpen className="w-3 h-3 mr-1 inline-block" />
            HISTORY
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-none font-retro text-[8px] py-1.5 cursor-pointer data-[state=active]:bg-[#00e5ff] data-[state=active]:text-black text-[#00e5ff]"
            onClick={() => sfx.playSelect()}
          >
            <Sliders className="w-3 h-3 mr-1 inline-block" />
            CONFIG
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* Tab 1: Terminal Console Logs & Active strategy thoughts */}
        {/* ========================================================= */}
        <TabsContent value="controls" className="flex-1 flex flex-col space-y-3 mt-0 focus-visible:outline-none">
          {/* Gemma Thinking Bubble */}
          <div className="bg-[#241224]/40 border-2 border-dashed border-[#ff60b5]/60 p-3 rounded-none relative">
            <span className="absolute -top-2.5 left-3 bg-[#0a0c16] px-1.5 border border-[#ff60b5]/40 text-[8px] text-[#ff60b5] font-retro">
              GEMMA-BOT TRANSMISSION
            </span>
            <div className="text-[11px] font-sans italic text-pink-300 min-h-[44px] flex items-center">
              {gemmaThinking ? (
                <span>&ldquo;{gemmaThinking}&rdquo;</span>
              ) : (
                <span className="text-[#ff60b5]/70 font-mono text-[10px]/relaxed">
                  * Awaiting cognitive computation streams from Gemma... *
                </span>
              )}
            </div>
          </div>

          {/* Glowing Green Phosphor Phosphor Terminal */}
          <div className="flex-1 min-h-[180px] bg-black border-2 border-[#00e5ff]/40 p-2 relative flex flex-col justify-between overflow-hidden">
            {/* Hologram visual screen noise effects */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#00e5ff]/10 pointer-events-none animate-pulse" />
            
            <div className="flex items-center justify-between border-b border-[#00e5ff]/20 pb-1 mb-1.5">
              <span className="font-retro text-[8px] text-[#00e5ff] flex items-center gap-1">
                <Terminal className="w-3 h-3 animate-pulse" />
                SYSTEM LOG:
              </span>
              <button
                onClick={() => {
                  sfx.playSelect();
                  clearLogs();
                }}
                className="text-[7px] text-[#00b2c4] hover:text-[#00e5ff] font-retro uppercase cursor-pointer"
              >
                [WIPE BUFFER]
              </button>
            </div>

            <ScrollArea className="flex-1 h-36 pr-1 text-[10px] text-zinc-400">
              <div className="space-y-1 pr-1">
                {logs.map((log) => {
                  let color = "text-zinc-500";
                  let prefix = "[SYS]";
                  if (log.type === "gemma") {
                    color = "text-yellow-400 font-sans font-bold";
                    prefix = "[GEM]";
                  } else if (log.type === "error") {
                    color = "text-rose-500 font-bold";
                    prefix = "[ERR]";
                  } else if (log.type === "success") {
                    color = "text-emerald-400 font-bold";
                    prefix = "[OK!]";
                  } else if (log.type === "user") {
                    color = "text-sky-400";
                    prefix = "[1P ]";
                  }

                  return (
                    <div key={log.id} className={`leading-relaxed break-words font-mono ${color}`}>
                      <span className="text-zinc-600 mr-1 text-[8px] font-mono">{log.timestamp}</span>
                      <span className="text-zinc-500 font-bold mr-1.5 select-none">{prefix}</span>
                      {log.message}
                    </div>
                  );
                })}
                <div ref={terminalEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Interactive Game Action Controllers */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              onClick={() => {
                sfx.playUndo();
                onUndo();
              }}
              disabled={moveHistory.length === 0}
              variant="outline"
              size="sm"
              className="border-2 border-[#00e5ff] bg-[#05060d] text-[#00e5ff] font-retro text-[8px] hover:bg-[#00e5ff] hover:text-black transition-all h-9 flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#004e5a] disabled:opacity-40 disabled:pointer-events-none hover:translate-y-[1px] hover:translate-x-[1px]"
            >
              <Undo2 className="w-3 h-3" />
              UNDO REWIND
            </Button>

            <Button
              onClick={() => {
                sfx.playSelect();
                onFlipBoard();
              }}
              variant="outline"
              size="sm"
              className="border-2 border-[#ff60b5] bg-[#05060d] text-[#ff60b5] font-retro text-[8px] hover:bg-[#ff60b5] hover:text-black transition-all h-9 flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#6c0f44] hover:translate-y-[1px] hover:translate-x-[1px]"
            >
              ⚔️ FLIP ({isFlipped ? "BLK" : "WHT"})
            </Button>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* Tab 2: Standard Move History List */}
        {/* ========================================================= */}
        <TabsContent value="history" className="flex-1 flex flex-col space-y-3 mt-0 focus-visible:outline-none">
          <div className="flex-1 min-h-[220px] bg-zinc-900 border-2 border-zinc-800 p-3 shadow-inner overflow-hidden flex flex-col justify-start">
            <span className="text-zinc-500 font-retro text-[8px] uppercase tracking-wider mb-2 border-b border-zinc-800 pb-1 flex justify-between items-center">
              <span>📖 CHRONICLE INDEX:</span>
              <span className="text-[7px] font-mono text-zinc-400">ALGEBRAIC SAN</span>
            </span>
            <ScrollArea className="flex-1 max-h-[240px] pr-2">
              {renderFormattedHistory()}
            </ScrollArea>
          </div>

          {/* FEN Output Copy */}
          <div className="space-y-1 px-1 bg-zinc-900/40 p-2.5 border border-zinc-850">
            <div className="flex justify-between items-center text-[8px] font-retro text-zinc-500">
              <span>CURRENT FEN STRING:</span>
              <button
                onClick={copyFenToClipboard}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[9px] uppercase cursor-pointer"
              >
                <Copy className="w-2.5 h-2.5" />
                [MEMORIZE FEN]
              </button>
            </div>
            <div className="text-[9px] font-mono select-all bg-black px-2 py-1.5 rounded text-zinc-400 border border-zinc-900 truncate">
              {currentFen}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* Tab 3: Detailed LM Studio & Graphics custom settings */}
        {/* ========================================================= */}
        <TabsContent value="settings" className="flex-1 flex flex-col space-y-3 mt-0 pr-1 max-h-[350px] overflow-y-auto focus-visible:outline-none">
          {/* Opponent Selection dropdown */}
          <div className="space-y-1">
            <Label className="text-[8px] font-retro text-zinc-400">🎮 CHOOSE OPPONENT</Label>
            <Select
              value={settings.opponent}
              onValueChange={(val: any) => {
                sfx.playSelect();
                updateSettings({ opponent: val });
              }}
            >
              <SelectTrigger className="border-2 border-zinc-850 bg-[#05060d] rounded-none text-[10px] font-retro text-[#00e5ff] py-1.5 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#05060d] border-2 border-[#ff60b5] text-white rounded-none">
                <SelectItem value="gemma" className="font-retro text-[9px] focus:bg-pink-600 focus:text-stone-950 cursor-pointer text-pink-400 py-1.5">
                  👾 GEMMA-HUMAN MODE
                </SelectItem>
                <SelectItem value="fallback" className="font-retro text-[9px] focus:bg-cyan-600 focus:text-stone-950 cursor-pointer text-cyan-400 py-1.5">
                  🤖 HUMAN-BOT MODE
                </SelectItem>
                <SelectItem value="pass" className="font-retro text-[9px] focus:bg-purple-600 focus:text-stone-950 cursor-pointer text-purple-400 py-1.5">
                  🤝 HUMAN-HUMAN MODE
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Board Theme picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[8px] font-retro text-zinc-400">🎨 SELECT BOARD SKIN</Label>
              <span className="text-[6.5px] font-retro text-pink-400 uppercase tracking-wider">Tap Swatch to Change</span>
            </div>
            
            {/* Visual Quick-Selection Swatches */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-zinc-900 rounded-none">
              {[
                { id: "pastel", name: "SWEET ROSE", gradient: "from-pink-300 to-sky-300", emoji: "🌸" },
                { id: "pastelPeach", name: "PEACH GLOW", gradient: "from-orange-300 to-yellow-200", emoji: "🍑" },
                { id: "pastelMint", name: "COOL MINT", gradient: "from-teal-200 to-purple-200", emoji: "🌿" },
                { id: "pastelLavender", name: "LAVENDER", gradient: "from-[#c7d2fe] to-[#fbcfe8]", emoji: "🔮" },
                { id: "cyber", name: "NEON GRID", gradient: "from-cyan-950 to-pink-950", emoji: "⚡" },
                { id: "wood", name: "WOOD PC", gradient: "from-[#b45309] to-[#78350f]", emoji: "🌳" },
                { id: "gameboy", name: "GAMEBOY", gradient: "from-[#8bac0f] to-[#306230]", emoji: "🎮" },
                { id: "arcade", name: "ARCADE", gradient: "from-purple-950 to-fuchsia-950", emoji: "👾" },
                { id: "dungeon", name: "DUNGEON", gradient: "from-stone-600 to-stone-850", emoji: "🪨" },
              ].map((theme) => {
                const isActive = settings.boardStyle === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    title={theme.name}
                    onClick={() => {
                      sfx.playSelect();
                      updateSettings({ boardStyle: theme.id as any });
                    }}
                    className={`group relative flex flex-col items-center justify-between p-1.5 h-[52px] rounded-none border transition-all text-center ${
                      isActive
                        ? "border-[#ff60b5] bg-zinc-950 ring-2 ring-[#ff60b5]/30 scale-[1.03] z-10"
                        : "border-zinc-800 bg-[#05060d] hover:bg-zinc-900 hover:border-zinc-700"
                    }`}
                  >
                    {/* Tiny Color Swatch Indicator */}
                    <div className={`w-full h-2 rounded-none bg-gradient-to-r ${theme.gradient} border border-black/40`} />
                    
                    {/* Emoji + Title Label */}
                    <div className="flex flex-col items-center justify-center mt-1">
                      <span className="text-[10px] leading-none mb-0.5">{theme.emoji}</span>
                      <span className={`text-[7px] font-retro tracking-tight truncate max-w-full ${isActive ? "text-[#ff60b5]" : "text-zinc-400"}`}>
                        {theme.name}
                      </span>
                    </div>

                    {/* Active Corner Pin */}
                    {isActive && (
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#ff60b5] rounded-none animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound & Auto-move Toggles */}
          <div className="grid grid-cols-2 gap-3 py-1">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between border-2 border-zinc-900 bg-zinc-950 p-1.5">
              <span className="text-[8px] font-retro text-zinc-400">AUDIO CHIPS:</span>
              <div className="flex items-center">
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => {
                    sfx.setEnabled(checked);
                    sfx.playSelect();
                    updateSettings({ soundEnabled: checked });
                  }}
                  className="data-[state=checked]:bg-yellow-600 border border-zinc-700"
                />
              </div>
            </div>

            {/* Simulated delay slider label */}
            <div className="flex flex-col justify-center border-2 border-zinc-900 bg-zinc-950 px-2 py-1">
              <span className="text-[7px] font-retro text-zinc-500 block mb-1">
                CPU DELAY: {settings.cpuDelay}ms
              </span>
              <Slider
                value={[settings.cpuDelay]}
                min={200}
                max={3000}
                step={200}
                onValueChange={(val) => updateSettings({ cpuDelay: val[0] })}
                className="[&>[role=slider]]:bg-yellow-600 [&>[role=slider]]:w-3 [&>[role=slider]]:h-3"
              />
            </div>
          </div>

          {/* API settings, shown only if Gemma opponent is active */}
          {settings.opponent === "gemma" && (
            <div className="space-y-3 bg-zinc-900/40 p-2.5 border-2 border-dashed border-zinc-850 mt-1">
              <div className="text-[8px] font-retro text-yellow-500 flex items-center gap-1 border-b border-zinc-800 pb-1.5">
                <Cpu className="w-3.5 h-3.5" />
                LM STUDIO LOCAL LINK
              </div>

              {/* Endpoint API URL */}
              <div className="space-y-1">
                <Label htmlFor="api-base" className="text-[8px] text-zinc-400 font-retro">API BASE URL</Label>
                <Input
                  id="api-base"
                  value={settings.apiBaseUrl}
                  onChange={(e) => updateSettings({ apiBaseUrl: e.target.value })}
                  placeholder="http://localhost:1234/v1"
                  className="h-7 text-xs bg-black text-lime-400 font-mono border-zinc-800 focus-visible:ring-1 focus-visible:ring-yellow-600 rounded-none py-1 px-2"
                />
              </div>

              {/* Model identifier */}
              <div className="space-y-1">
                <Label htmlFor="model-name" className="text-[8px] text-zinc-400 font-retro">MODEL NAME ID</Label>
                <Input
                  id="model-name"
                  value={settings.modelName}
                  onChange={(e) => updateSettings({ modelName: e.target.value })}
                  placeholder="gemma-2-2b-it"
                  className="h-7 text-xs bg-black text-cyan-400 font-mono border-zinc-800 focus-visible:ring-1 focus-visible:ring-yellow-600 rounded-none py-1 px-2"
                />
              </div>

              {/* Customizable system prompt instructions */}
              <div className="space-y-1">
                <Label htmlFor="sys-prompt" className="text-[8px] text-zinc-400 font-retro">SYSTEM PROMPT TARGET</Label>
                <textarea
                  id="sys-prompt"
                  rows={4}
                  value={settings.systemPrompt}
                  onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                  className="w-full text-[10px] bg-black text-zinc-300 font-mono border border-zinc-800 p-1.5 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-600"
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Retro Reset & Help Command Footer */}
      <div className="flex gap-2 items-center justify-between border-t border-[#00e5ff]/20 pt-3 mt-3">
        <RulesInfo />

        <Button
          onClick={() => {
            sfx.playVictory();
            onReset();
          }}
          className="border-2 border-[#ff60b5] bg-[#ff60b5] hover:bg-white text-black font-retro text-[9px] h-8 flex items-center justify-center gap-1.5 px-3 rounded-none shadow-[3px_3px_0px_0px_#6c0f44] hover:translate-y-[1px] hover:translate-x-[1px] flex-1 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-black" />
          HARD RESET
        </Button>
      </div>
    </Card>
  );
};
