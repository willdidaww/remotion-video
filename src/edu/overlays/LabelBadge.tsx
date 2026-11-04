import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../palette";
import { fontFamily_Inter } from "../../loadFonts";

export type LabelBadgeProps = {
  text: string;
  delay?: number;
  fontSize?: number;
  /** Gaya: putih biasa, atau merah peringatan dengan garis putus-putus */
  variant?: "default" | "danger";
  style?: React.CSSProperties;
};

/**
 * Label kotak kecil seperti "STEKER → COLOKAN" / "GERAK LAMBAT" /
 * "KALAU LANGSUNG DICOLOK" pada referensi. Masuk dengan pop spring.
 */
export const LabelBadge: React.FC<LabelBadgeProps> = ({
  text,
  delay = 0,
  fontSize = 30,
  variant = "default",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.6 } });
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const isDanger = variant === "danger";

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "inline-block",
        backgroundColor: isDanger ? palette.danger : palette.labelBg,
        color: isDanger ? palette.white : palette.labelText,
        border: isDanger ? `3px dashed ${palette.white}` : `2px solid ${palette.bgDark}`,
        borderRadius: 10,
        padding: isDanger ? "10px 20px" : "8px 16px",
        fontFamily: fontFamily_Inter,
        fontWeight: 800,
        fontSize,
        letterSpacing: 0.5,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
