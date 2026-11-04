import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { palette } from "../palette";
import { fontFamily_Inter } from "../../loadFonts";

export type CaptionWord = {
  text: string;
  /** true jika kata ini di-highlight kuning */
  highlight?: boolean;
};

export type KaraokeCaptionProps = {
  /** Baris-baris caption; tiap baris berisi array kata */
  lines: CaptionWord[][];
  /** Frame mulai muncul */
  delay?: number;
  fontSize?: number;
  style?: React.CSSProperties;
};

/**
 * Caption gaya karaoke/subtitle: tiap kata punya background chip,
 * kata tertentu di-highlight kuning (seperti referensi "pompanya JALAN").
 * Kata muncul berurutan (stagger) untuk kesan diketik/di-sync audio.
 */
export const KaraokeCaption: React.FC<KaraokeCaptionProps> = ({
  lines,
  delay = 0,
  fontSize = 48,
  style,
}) => {
  const frame = useCurrentFrame();
  let wordIndex = 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        fontFamily: fontFamily_Inter,
        fontWeight: 800,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {line.map((word, wi) => {
            const appearAt = delay + wordIndex * 3;
            wordIndex += 1;
            const opacity = interpolate(frame, [appearAt, appearAt + 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(frame, [appearAt, appearAt + 4], [8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <span
                key={wi}
                style={{
                  opacity,
                  transform: `translateY(${y}px)`,
                  backgroundColor: word.highlight ? palette.highlight : palette.caption,
                  color: word.highlight ? palette.caption : palette.textLight,
                  fontSize,
                  padding: "4px 12px",
                  borderRadius: 8,
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
