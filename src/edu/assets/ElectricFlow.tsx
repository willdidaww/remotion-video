import React from "react";
import { useCurrentFrame } from "remotion";
import { palette } from "../palette";

export type ElectricFlowProps = {
  width?: number;
  height?: number;
  /** Jumlah partikel yang mengalir */
  count?: number;
  /** Kecepatan aliran */
  speed?: number;
  style?: React.CSSProperties;
};

/**
 * Partikel listrik kuning yang mengalir sepanjang jalur kabel.
 * Posisi partikel dihitung murni dengan matematika kurva Bezier kubik,
 * jadi deterministik di setiap frame (aman untuk render server-side).
 */
export const ElectricFlow: React.FC<ElectricFlowProps> = ({
  width = 400,
  height = 120,
  count = 6,
  speed = 1,
  style,
}) => {
  const frame = useCurrentFrame();

  // Titik-titik kurva Bezier kubik (P0, P1, P2, P3)
  const p0 = { x: 10, y: height - 20 };
  const p1 = { x: width * 0.3, y: 10 };
  const p2 = { x: width * 0.7, y: height };
  const p3 = { x: width - 10, y: 20 };
  const pathD = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

  const bezier = (t: number) => {
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
    return { x, y };
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} fill="none">
      {/* Jalur kabel */}
      <path d={pathD} stroke={palette.caption} strokeWidth="10" strokeLinecap="round" />
      <path
        d={pathD}
        stroke={palette.electric}
        strokeWidth="3"
        strokeLinecap="round"
        opacity={0.4}
        strokeDasharray="4 12"
      />

      {/* Partikel yang bergerak di sepanjang path */}
      {Array.from({ length: count }).map((_, i) => {
        const t = (frame * 0.012 * speed + i / count) % 1;
        const { x, y } = bezier(t);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={9} fill={palette.electric} opacity={0.25} />
            <circle cx={x} cy={y} r={5} fill={palette.electric} />
          </g>
        );
      })}
    </svg>
  );
};
