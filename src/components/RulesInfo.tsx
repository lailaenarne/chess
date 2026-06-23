/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Terminal, Laptop, HelpCircle as InfoIcon } from "lucide-react";

export const RulesInfo: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-[#00e5ff] bg-black text-[#00e5ff] hover:bg-[#00e5ff] hover:text-black font-retro text-[9px] h-8 flex items-center gap-1.5 shadow-[3px_3px_0px_0px_#004e5a] hover:translate-y-[1px] hover:translate-x-[1px] transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            SETUP GUIDE
          </Button>
        }
      />
      <DialogContent className="bg-black border-4 border-[#ff60b5] max-w-lg text-[#00e5ff] font-mono p-6 shadow-[8px_8px_0px_0px_#ff60b5]/30 rounded-none">
        <DialogHeader className="space-y-2 border-b-2 border-[#00e5ff] pb-3">
          <DialogTitle className="text-[#00e5ff] font-retro text-sm flex items-center gap-2">
            👾 USER MANUAL & SETUP 🕹️
          </DialogTitle>
          <DialogDescription className="text-pink-400 text-xs font-mono">
            How to play and interface your local Gemma Model using LM Studio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs leading-relaxed max-h-[380px] overflow-y-auto pr-2">
          {/* Section 1: Gameplay */}
          <div className="space-y-1.5">
            <h3 className="text-yellow-500 font-bold border-b border-zinc-850 pb-0.5 flex items-center gap-1.5 text-xs">
              🕹️ 1. HOW TO PLAY
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-300">
              <li>Choose your game mode: <span className="text-yellow-400 font-bold">LM Studio (Gemma)</span>, <span className="text-cyan-400 font-bold">Minimax CPU (Offline)</span>, or <span className="text-stone-400 font-bold">Pass & play</span>.</li>
              <li>You play as <span className="text-white font-bold">White</span> and move first.</li>
              <li>Select any piece by clicking/tapping it or dragging it to its destination square. Legal squares are highlighted with a bright cyan pixel indicator.</li>
              <li>Promote pawns on reaching the opposite edge via our custom upgrade option.</li>
            </ul>
          </div>

          {/* Section 2: LM Studio Configuration */}
          <div className="space-y-2 bg-zinc-900/60 p-3 border-2 border-zinc-850 rounded">
            <h3 className="text-cyan-400 font-retro text-[10px] flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-cyan-400" />
              2. CONFIGURING LM STUDIO
            </h3>
            <p className="text-[10px] text-zinc-300">
              To drive your opponent using your graphics card, follow these steps:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-[10px] text-zinc-300">
              <li>
                Open <span className="text-cyan-400 font-bold">LM Studio</span> on your machine.
              </li>
              <li>
                Search for and download a model from the search tab. We recommend a local lightweight model like:
                <br />
                <span className="text-yellow-400 font-mono text-[9px] bg-black px-1 border border-zinc-800">gemma-2-2b-it</span> or <span className="text-yellow-400 font-mono text-[9px] bg-black px-1 border border-zinc-800">gemma-2-9b-it</span>.
              </li>
              <li>
                Navigate to the <span className="text-cyan-400 font-bold">Local Server</span> (developer double arrow icon ⇄ in the left-hand bar).
              </li>
              <li>
                Select your model from the top dropdown to load it into memory.
              </li>
              <li>
                Under settings, ensure <span className="text-lime-400 font-bold">Cross-Origin Resource Sharing (CORS)</span> is set to <span className="text-lime-400">ON / Enabled</span>. This is vital, otherwise the browser will block requests to port 1234.
              </li>
              <li>
                Click <span className="text-green-500 font-bold">"Start Server"</span>.
              </li>
              <li>
                Look for your local endpoint URL (defaults to <span className="font-bold text-yellow-400">http://localhost:1234/v1</span>).
              </li>
              <li>
                Input this URL and the model ID inside this game's Settings tab on the right, and unleash Gemma-Bot!
              </li>
            </ol>
          </div>

          {/* Section 3: Troubleshooting */}
          <div className="space-y-1.5">
            <h3 className="text-red-400 font-bold border-b border-zinc-800 pb-0.5 flex items-center gap-1.5 text-xs">
              🩹 3. TROUBLESHOOTING
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-[10px] text-zinc-300">
              <li>
                <span className="text-red-400 font-bold">CORS Blocked?</span> Go to LM Studio and double-check CORS settings. It must be turned to "ON" or "Allow ALL sources (*)".
              </li>
              <li>
                <span className="text-red-400 font-bold">Connection timed out?</span> Check if your GPU has finished compiling previous prompts, or lower the context/max tokens setting.
              </li>
              <li>
                <span className="text-red-400 font-bold">Offline / No LM Studio?</span> Toggle opponent to <span className="text-yellow-400 font-bold">Minimax CPU</span> to play a high-grade local chess engine written directly in the code!
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#00e5ff]/20 pt-3">
          <DialogClose
            render={
              <Button className="border-2 border-[#ff60b5] bg-[#ff60b5] text-black font-retro text-[9px] hover:bg-white rounded-none">
                OK, READY!
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
