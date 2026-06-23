/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AISettings, LogEntry } from "../types";

export const DEFAULT_URL = "http://localhost:1234/v1";
export const DEFAULT_MODEL = "gemma-2-2b-it"; // Standard lightweight local gemma

export const DEFAULT_SYSTEM_PROMPT = `You are "GEMMA-BOT", an 8-bit retro arcade AI chess master.
You are playing chess against a human opponent.
You must analyze the FEN position and select the absolute best move only from the provided list of LEGAL MOVES.

You must respond in valid JSON format. Do not write any explanations outside the JSON object.
The JSON must have this exact structure:
{
  "thinking": "Your short 8-bit tactical commentary (eg. 'I SEE YOUR BISHOP IS CORNERED! PREPARE TO FACE MY CAVALRY!'). Keep it short, retro, and fun.",
  "move": "The exact UCI code of your selected move (must be in the legal moves list, e.g. 'e2e4')"
}`;

interface LLMResponse {
  move: string;
  thinking: string;
  rawResponse?: string;
}

/**
 * Sends a request to LM Studio local server to compute Gemma's move
 */
export async function getGemmaMove(
  fen: string,
  legalMoves: string[],
  colorName: "White" | "Black",
  settings: AISettings,
  addLog: (type: LogEntry["type"], message: string) => void
): Promise<LLMResponse> {
  const url = `${settings.apiBaseUrl.trim()}/chat/completions`;
  const systemPrompt = settings.systemPrompt.replace("{COLOR}", colorName);

  const userPrompt = `CURRENT BOARD STATE (FEN): ${fen}
LEGAL MOVES FOR YOU (UCI format): ${JSON.stringify(legalMoves)}

Choose the best move from the list of legal moves. You play as ${colorName}. Remember, your chosen move MUST be an exact string from the legal moves list.
Respond ONLY with a JSON object. Ensure it is valid JSON.`;

  addLog("system", `Contacting local Gemma at ${settings.apiBaseUrl}...`);
  addLog("system", `System model requested: "${settings.modelName}"`);

  // Prepare body
  const payload = {
    model: settings.modelName,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 250,
    // Standard LM Studio parameter to force JSON response
    response_format: { type: "json_object" }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000); // 18 seconds timeout

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    addLog("success", "Response received from LM Studio!");

    // Parse Response
    const parsed = parseLLMResponse(content, legalMoves);
    return {
      move: parsed.move,
      thinking: parsed.thinking,
      rawResponse: content
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    let errorMsg = error.message || "Unknown error";
    if (error.name === "AbortError") {
      errorMsg = "Connection timed out (18s). Please check if LM Studio is responding or if the system prompt is too complex.";
    } else if (errorMsg.includes("Failed to fetch")) {
      errorMsg = `Connection failed to ${url}. Is LM Studio active? Make sure local API server is enabled (default port 1234) and CORS handles local requests.`;
    }
    
    addLog("error", `Local Gemma Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }
}

/**
 * Parsing utility with extensive fallbacks in case Gemma fails to output pristine JSON format
 */
function parseLLMResponse(content: string, legalMoves: string[]): { move: string; thinking: string } {
  let move = "";
  let thinking = "Beep boop! Calculating tactical options...";

  const cleanContent = content.trim();

  // Try parsing directly
  try {
    const data = JSON.parse(cleanContent);
    if (data.move) move = data.move.trim().toLowerCase();
    if (data.thinking) thinking = data.thinking.trim();
  } catch (err) {
    // Parsing failed, use regex lookups as a fallback
    console.warn("Direct JSON parsing failed, attempting regex extraction...", err);

    // Look for "move": "..." or "move" : "..."
    const moveRegex = /"move"\s*:\s*"([a-h][1-8][a-h][1-8][qrbn]?)"/i;
    const moveMatch = cleanContent.match(moveRegex);
    if (moveMatch && moveMatch[1]) {
      move = moveMatch[1].trim().toLowerCase();
    }

    // Look for "thinking": "..."
    const thinkingRegex = /"thinking"\s*:\s*"([^"]+)"/i;
    const thinkingMatch = cleanContent.match(thinkingRegex);
    if (thinkingMatch && thinkingMatch[1]) {
      thinking = thinkingMatch[1].trim();
    }
  }

  // Final fallback: if move extracted is invalid, look for first legal move code mentioned inside the content!
  if (!legalMoves.includes(move)) {
    console.warn(`Extracted move "${move}" is not in the legal moves list. Scanning raw text...`);
    const foundMove = legalMoves.find((legal) => {
      // Find UCI move code (e.g., e2e4) that is fully isolated or surrounded by non-alphanumeric chars
      const regex = new RegExp(`\\b${legal}\\b`, "i");
      return regex.test(cleanContent);
    });

    if (foundMove) {
      move = foundMove;
      thinking = `(Parsed from text) ${thinking}`;
    } else {
      // Pick first legal move out of desperation so the game doesn't crash
      move = legalMoves[0];
      thinking = `Beep! Warning: Choosing fallback move: ${move}`;
    }
  }

  return { move, thinking };
}
