import React from "react";

export type ArrowProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

/**
 * Panah kanan sebagai SVG (bukan glyph font) agar selalu ter-render,
 * apa pun font yang dipakai. Pengganti karakter "→".
 */
export const Arrow: React.FC<ArrowProps> = ({ size = 22, color = "currentColor", style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <path
        d="M4 12 H18 M13 7 L18 12 L13 17"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
