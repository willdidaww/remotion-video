import React from "react";
import { palette } from "../palette";

export type FridgeProps = {
  width?: number;
  /** 0 = pintu tertutup, 1 = pintu terbuka penuh (dipakai untuk animasi) */
  doorOpen?: number;
  style?: React.CSSProperties;
};

/**
 * Kulkas tampak depan, gaya flat. Pintu bisa "terbuka" dengan sedikit skew.
 * Semua digambar dengan SVG shape — tanpa aset eksternal.
 */
export const Fridge: React.FC<FridgeProps> = ({ width = 300, doorOpen = 0, style }) => {
  const height = width * 1.6;
  // Pintu membuka: geser + miring sedikit untuk kesan 3D ringan
  const doorSkew = doorOpen * 14;
  const doorShift = doorOpen * width * 0.12;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 480"
      style={style}
      fill="none"
    >
      {/* Badan kulkas */}
      <rect x="30" y="20" width="240" height="440" rx="20" fill={palette.wall} stroke={palette.bgDark} strokeWidth="4" />
      {/* Garis pembatas freezer/bawah */}
      <line x1="30" y1="150" x2="270" y2="150" stroke={palette.bgDark} strokeWidth="4" />

      {/* Interior (terlihat saat pintu terbuka) */}
      {doorOpen > 0.05 && (
        <g>
          <rect x="40" y="160" width="220" height="290" rx="10" fill={palette.bgDark} opacity={0.5} />
          <line x1="55" y1="220" x2="245" y2="220" stroke={palette.bg} strokeWidth="6" />
          <line x1="55" y1="300" x2="245" y2="300" stroke={palette.bg} strokeWidth="6" />
          <line x1="55" y1="380" x2="245" y2="380" stroke={palette.bg} strokeWidth="6" />
        </g>
      )}

      {/* Pintu bawah (beranimasi) */}
      <g
        style={{
          transformOrigin: "40px 160px",
          transform: `translateX(${doorShift}px) skewY(${doorSkew * -0.2}deg) scaleX(${1 - doorOpen * 0.25})`,
        }}
      >
        <rect x="40" y="160" width="220" height="290" rx="12" fill={palette.labelBg} stroke={palette.bgDark} strokeWidth="4" />
        {/* Handle */}
        <rect x="56" y="185" width="14" height="80" rx="7" fill={palette.steel} />
      </g>

      {/* Pintu freezer (tetap) */}
      <rect x="40" y="35" width="220" height="100" rx="12" fill={palette.labelBg} stroke={palette.bgDark} strokeWidth="4" />
      <rect x="56" y="55" width="14" height="60" rx="7" fill={palette.steel} />
    </svg>
  );
};
