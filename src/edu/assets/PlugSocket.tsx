import React from "react";
import { palette } from "../palette";

export type PlugSocketProps = {
  width?: number;
  /** 0 = steker jauh dari colokan, 1 = tercolok penuh */
  inserted?: number;
  style?: React.CSSProperties;
};

/**
 * Steker + stop kontak gaya flat. Steker bergerak masuk sesuai `inserted`.
 */
export const PlugSocket: React.FC<PlugSocketProps> = ({ width = 260, inserted = 0, style }) => {
  const height = width * 0.62;
  // Steker mulai dari kanan, bergerak ke kiri masuk ke colokan
  const plugX = 150 - inserted * 60;

  return (
    <svg width={width} height={height} viewBox="0 0 260 160" style={style} fill="none">
      {/* Stop kontak (power strip) */}
      <rect x="10" y="60" width="120" height="70" rx="12" fill={palette.labelBg} stroke={palette.bgDark} strokeWidth="4" />
      {/* Lubang colokan */}
      <circle cx="45" cy="95" r="7" fill={palette.bgDark} />
      <circle cx="70" cy="95" r="7" fill={palette.bgDark} />
      {/* Tombol power */}
      <rect x="92" y="78" width="28" height="34" rx="6" fill={inserted > 0.9 ? palette.danger : palette.steel} />

      {/* Steker + kabel (beranimasi masuk) */}
      <g style={{ transform: `translateX(${plugX}px)` }}>
        {/* Kabel melengkung */}
        <path
          d="M 90 50 C 120 20, 170 20, 200 60 C 215 80, 215 110, 190 120"
          stroke={palette.caption}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Badan steker */}
        <rect x="55" y="78" width="45" height="34" rx="8" fill={palette.caption} />
        {/* Pin steker */}
        <rect x="42" y="86" width="16" height="6" rx="3" fill={palette.steel} />
        <rect x="42" y="100" width="16" height="6" rx="3" fill={palette.steel} />
      </g>
    </svg>
  );
};
