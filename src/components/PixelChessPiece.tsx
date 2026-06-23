/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from "react";

// Standard smooth vector paths for 100x100 resolution
const SHAPES: Record<string, string> = {
  p: "M50,15 C58,15 65,22 65,30 C65,38 58,45 50,45 C42,45 35,38 35,30 C35,22 42,15 50,15 Z M38,48 L62,48 C63,48 64,50 63.5,52 C61,62 59,75 58,82 L42,82 C41,75 39,62 36.5,52 C36,50 37,48 38,48 Z M28,82 L72,82 C74,82 74,85 72,85 L28,85 C26,85 26,82 28,82 Z M22,86 L78,86 C80,86 80,90 78,90 L22,90 C20,90 20,86 22,86 Z",
  r: "M30,20 L30,30 L36,30 L36,20 L42,20 L42,30 L48,30 L48,20 L54,20 L54,30 L60,30 L60,20 L66,20 L66,35 L34,35 Z M35,35 C35,35 32,54 30,78 L70,78 C68,54 65,35 65,35 Z M24,78 L76,78 C78,78 78,82 76,82 L24,82 Z M20,84 L80,84 C82,84 82,88 80,88 L20,88 Z",
  n: "M35,25 C35,25 36,15 48,12 C58,12 66,16 68,26 C70,36 67,44 65,48 C63,52 56,56 56,56 C56,56 49,58 45,64 C42,69 41,74 41,80 L72,80 C74,80 74,83 72,83 L28,83 C26,83 26,80 28,80 C28,80 33,74 35,66 C37,58 32,53 28,45 C24,37 25,29 28,25 C31,21 35,25 35,25 Z M22,84 L78,84 C80,84 80,88 78,88 L22,88 Z",
  b: "M50,11 C51.5,11 52.5,12 52.5,13.5 C52.5,15 51.5,16 50,16 C48.5,16 47.5,15 47.5,13.5 C47.5,12 48.5,11 50,11 Z M50,18 C58,18 63,26 63,38 C63,50 56,62 55,72 L45,72 C44,62 37,50 37,38 C37,26 42,18 50,18 Z M50,30 L50,45 M42,37 L58,37 M28,74 L72,74 C74,74 74,78 72,78 L28,78 Z M24,80 L76,80 C78,80 78,84 76,84 L24,84 Z M20,86 L80,86 C82,86 82,90 80,90 L20,90 Z",
  q: "M50,12 C51.5,12 52.5,13 52.5,14.5 C52.5,16 51.5,17 50,17 C48.5,17 47.5,13 50,12 Z M26,26 C27.5,26 28.5,27 28.5,28.5 C28.5,30 27.5,31 26,31 C24.5,31 23.5,30 23.5,28.5 C23.5,27 24.5,26 26,26 Z M74,26 C75.5,26 76.5,27 76.5,28.5 C76.5,30 75.5,31 74,31 C72.5,31 71.5,30 71.5,28.5 C71.5,27 72.5,26 74,26 Z M26,31 L36,46 L50,23 L64,46 L74,31 L66,74 L34,74 Z M22,76 L78,76 C80,76 80,80 78,80 L22,80 Z M18,82 L82,82 C84,82 84,86 82,86 L18,86 C16,86 16,82 18,82 Z",
  k: "M50,7 L50,17 M45,12 L55,12 M50,19 C58,19 66,28 66,48 L66,74 L34,74 L34,48 C34,28 42,19 50,19 Z M36,28 L64,28 M36,36 L64,36 M22,76 L78,76 C80,76 80,80 78,80 L22,80 Z M18,82 L82,82 C84,82 84,86 82,86 L18,86 C16,86 16,82 18,82 Z"
};

interface PixelChessPieceProps {
  type: string;  // p, r, n, b, q, k
  color: "w" | "b"; // w, b
  size?: number | string;
  className?: string;
  boardStyle?: string;
}

export const PixelChessPiece: React.FC<PixelChessPieceProps> = ({
  type,
  color,
  size = "100%",
  className = "",
  boardStyle = "cyber"
}) => {
  const normType = type.toLowerCase();
  const pathData = SHAPES[normType] || SHAPES["p"];
  const componentId = useId();
  const safeId = componentId.replace(/:/g, "");

  // Determine precise colors and gradients based on board style & team (w/b)
  let outlineColor = color === "w" ? "#031625" : "#26031A";
  let bodyGradStart = color === "w" ? "#ffffff" : "#ffe4e6";
  let bodyGradEnd = color === "w" ? "#e0f7fa" : "#ff60b5";
  let accentColor = color === "w" ? "#00e5ff" : "#ff1493";

  if (boardStyle === "pastel") {
    outlineColor = color === "w" ? "#0ea5e9" : "#db2777";
    bodyGradStart = color === "w" ? "#ffffff" : "#ffffff";
    bodyGradEnd = color === "w" ? "#bae6fd" : "#fbcfe8";
    accentColor = color === "w" ? "#38bdf8" : "#f43f5e";
  } else if (boardStyle === "pastelPeach") {
    outlineColor = color === "w" ? "#ea580c" : "#ca8a04";
    bodyGradStart = color === "w" ? "#ffffff" : "#ffffff";
    bodyGradEnd = color === "w" ? "#ffedd5" : "#fef9c3";
    accentColor = color === "w" ? "#fb923c" : "#fde047";
  } else if (boardStyle === "pastelMint") {
    outlineColor = color === "w" ? "#0d9488" : "#6d28d9";
    bodyGradStart = color === "w" ? "#ffffff" : "#ffffff";
    bodyGradEnd = color === "w" ? "#ccfbf1" : "#f3e8ff";
    accentColor = color === "w" ? "#2dd4bf" : "#c084fc";
  } else if (boardStyle === "pastelLavender") {
    outlineColor = color === "w" ? "#4338ca" : "#be185d";
    bodyGradStart = color === "w" ? "#ffffff" : "#ffffff";
    bodyGradEnd = color === "w" ? "#e0e7ff" : "#fce7f3";
    accentColor = color === "w" ? "#818cf8" : "#fbcfe8";
  } else if (boardStyle === "wood") {
    outlineColor = color === "w" ? "#422006" : "#2c1d11";
    bodyGradStart = color === "w" ? "#fef3c7" : "#ffd4a8";
    bodyGradEnd = color === "w" ? "#b45309" : "#78350f";
    accentColor = color === "w" ? "#f59e0b" : "#ecd3bc";
  } else if (boardStyle === "gameboy") {
    outlineColor = color === "w" ? "#0a1f0a" : "#020702";
    bodyGradStart = color === "w" ? "#e1eda4" : "#94ae76";
    bodyGradEnd = color === "w" ? "#8bac0f" : "#306230";
    accentColor = color === "w" ? "#306230" : "#0f380f";
  } else if (boardStyle === "arcade") {
    outlineColor = color === "w" ? "#090514" : "#250025";
    bodyGradStart = color === "w" ? "#ffffff" : "#fff5f5";
    bodyGradEnd = color === "w" ? "#e879f9" : "#701a75";
    accentColor = color === "w" ? "#22d3ee" : "#f43f5e";
  } else if (boardStyle === "dungeon") {
    outlineColor = color === "w" ? "#1c1917" : "#090504";
    bodyGradStart = color === "w" ? "#fafaf9" : "#e7e5e4";
    bodyGradEnd = color === "w" ? "#78716c" : "#44403c";
    accentColor = color === "w" ? "#f59e0b" : "#b91c1c";
  }

  const gradBodyId = `glassBodyGrad-${normType}-${color}-${safeId}`;
  const gradHighlightId = `glassHighlightGrad-${normType}-${color}-${safeId}`;
  const clipId = `glassClip-${normType}-${color}-${safeId}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:scale-[1.08] ${className}`}
    >
      <defs>
        {/* Dynamic Specular Radial Gradient for High-End Glass refraction */}
        <radialGradient id={gradBodyId} cx="35%" cy="30%" r="75%" fx="35%" fy="30%">
          <stop offset="0%" stopColor={bodyGradStart} stopOpacity="0.9" />
          <stop offset="50%" stopColor={bodyGradEnd} stopOpacity="0.75" />
          <stop offset="90%" stopColor={outlineColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
        </radialGradient>

        {/* Shiny Specular Spot Gradient */}
        <radialGradient id={gradHighlightId} cx="30%" cy="25%" r="45%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor={bodyGradStart} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>

        {/* ClipPath of the chess piece to confine specular overlay gloss exactly */}
        <clipPath id={clipId}>
          <path d={pathData} />
        </clipPath>

        {/* Diagonal Gloss Shine Linear Gradient */}
        <linearGradient id="diagonalShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="26%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Ambient Soft Outer Drop Shadow */}
        <filter id="glassDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.65" />
          <feDropShadow dx="-1" dy="-1" stdDeviation="1.5" floodColor={accentColor} floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#glassDropShadow)">
        {/* 1. Underlying Base Glass Body */}
        <path
          d={pathData}
          fill={`url(#${gradBodyId})`}
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 2. Glass-Clipped Interactive Reflections & Highlights */}
        <g clipPath={`url(#${clipId})`} pointerEvents="none">
          {/* Main Top-Left Specular Light Bubble */}
          <ellipse
            cx="35"
            cy="30"
            rx="25"
            ry="20"
            fill="url(#diagonalShine)"
            transform="rotate(-15 35 30)"
            opacity="0.85"
          />

          {/* Sharp diagonal gloss streak */}
          <path
            d="M-20,10 L120,70 L100,100 L-40,40 Z"
            fill="url(#diagonalShine)"
            opacity="0.35"
          />

          {/* Core glow spot */}
          <circle
            cx="35"
            cy="30"
            r="18"
            fill={`url(#${gradHighlightId})`}
            opacity="0.9"
          />

          {/* Base Inner Refraction Rim Glow */}
          <ellipse
            cx="50"
            cy="86"
            rx="32"
            ry="8"
            fill="#ffffff"
            opacity="0.3"
          />
        </g>

        {/* 3. Non-Clipped External Fine Highlights (Top Rim & Bevel) */}
        <g opacity="0.65" pointerEvents="none">
          {normType === "p" && (
            <ellipse cx="50" cy="22" rx="8" ry="3" fill="#ffffff" opacity="0.35" />
          )}
          {normType === "k" && (
            <path d="M45,12 L55,12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          )}
          {normType === "b" && (
            <circle cx="50" cy="13.5" r="2" fill="#ffffff" opacity="0.6" />
          )}
        </g>
      </g>
    </svg>
  );
};
