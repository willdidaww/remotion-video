import React from "react";
import { palette } from "../palette";
import { fontFamily_Inter } from "../../loadFonts";

export type WatermarkProps = {
  brand?: string;
  tag?: string;
  style?: React.CSSProperties;
};

/**
 * Watermark pojok kanan seperti "kita bedah / ILUSTRASI" pada referensi.
 * Default memakai placeholder yang netral.
 */
export const Watermark: React.FC<WatermarkProps> = ({
  brand = "ilustrasi",
  tag = "EDUKASI",
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
        fontFamily: fontFamily_Inter,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: palette.labelBg,
          borderRadius: 8,
          padding: "6px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {/* Ikon heksagon kecil */}
        <svg width="22" height="22" viewBox="0 0 24 24">
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" fill={palette.highlight} stroke={palette.caption} strokeWidth="1.5" />
        </svg>
        <span style={{ fontWeight: 800, fontSize: 22, color: palette.labelText }}>{brand}</span>
      </div>
      <div
        style={{
          backgroundColor: palette.caption,
          color: palette.textLight,
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: 1,
          padding: "4px 10px",
          borderRadius: 6,
        }}
      >
        {tag}
      </div>
    </div>
  );
};
