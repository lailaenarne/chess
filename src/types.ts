/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OpponentType = "gemma" | "fallback" | "pass";

export type BoardStyle = "wood" | "gameboy" | "arcade" | "dungeon" | "cyber" | "pastel" | "pastelPeach" | "pastelMint" | "pastelLavender";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "system" | "user" | "gemma" | "error" | "success";
  message: string;
}

export interface GameSettings {
  opponent: OpponentType;
  boardStyle: BoardStyle;
  soundEnabled: boolean;
  apiBaseUrl: string;
  modelName: string;
  systemPrompt: string;
  cpuDelay: number; // in ms
}

export interface ChessMoveDetails {
  san: string;
  from: string;
  to: string;
  color: "w" | "b";
  piece: string;
  flags: string;
  captured?: string;
  promotion?: string;
}

export interface AISettings {
  apiBaseUrl: string;
  modelName: string;
  systemPrompt: string;
}
