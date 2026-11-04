import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../palette";
import { fontFamily_Inter } from "../../loadFonts";
import { Arrow } from "./Arrow";

export type InsetProps = {
  /** Judul kecil di atas kotak (mis. "STEKER") */
  title?: string;
  /** Jika diisi, bagian judul dirangkai dengan panah SVG di antaranya
   *  (mis. ["STEKER", "COLOKAN"] -> STEKER → COLOKAN). */
  titleParts?: string[];
  /** Caption kecil di bawah kotak (mis. "GERAK LAMBAT") */
  caption?: string;
  width?: number;
  height?: number;
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Kotak picture-in-picture (inset) seperti pojok kiri atas referensi:
 * bingkai dengan judul di atas & caption di bawah, berisi ilustrasi kecil.
 */
export const Inset: React.FC<InsetProps> = ({
  title,
  titleParts,
  caption,
  width = 320,
  height = 240,
  delay = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 16 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const x = interpolate(enter, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        fontFamily: fontFamily_Inter,
        ...style,
      }}
    >
      {(title || titleParts) && (
        <div
          style={{
            backgroundColor: palette.caption,
            color: palette.textLight,
            fontWeight: 800,
            fontSize: 24,
            padding: "6px 14px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {titleParts
            ? titleParts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Arrow size={22} color={palette.textLight} />}
                  <span>{part}</span>
                </React.Fragment>
              ))
            : title}
        </div>
      )}
      <div
        style={{
          width,
          height,
          borderRadius: 14,
          border: `3px solid ${palette.caption}`,
          backgroundColor: palette.wall,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      {caption && (
        <div
          style={{
            backgroundColor: palette.labelBg,
            color: palette.labelText,
            border: `2px solid ${palette.bgDark}`,
            fontWeight: 800,
            fontSize: 22,
            padding: "6px 14px",
            borderRadius: 8,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
