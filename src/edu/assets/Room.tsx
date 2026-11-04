import React from "react";
import { AbsoluteFill } from "remotion";
import { palette } from "../palette";

/**
 * Background ruangan gaya flat-isometrik: dinding + lantai berubin,
 * meniru suasana referensi (abu-abu hangat).
 */
export const Room: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg }}>
      {/* Dinding atas */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", backgroundColor: palette.wall }} />
      {/* Lantai dengan ubin perspektif sederhana */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%" }}
        viewBox="0 0 1080 1150"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="1080" height="1150" fill={palette.bg} />
        {/* Garis ubin menuju titik hilang */}
        {Array.from({ length: 9 }).map((_, i) => {
          const x = (i / 8) * 1080;
          return <line key={`v${i}`} x1={x} y1="0" x2={540 + (x - 540) * 0.2} y2="1150" stroke={palette.bgDark} strokeWidth="2" opacity={0.4} />;
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const y = Math.pow(i / 6, 1.8) * 1150;
          return <line key={`h${i}`} x1="0" y1={y} x2="1080" y2={y} stroke={palette.bgDark} strokeWidth="2" opacity={0.3} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
