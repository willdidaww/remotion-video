import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily_Inter } from "../loadFonts";

type AnimationType = "fade" | "slide-up" | "slide-left" | "scale" | "typewriter";

export type AnimatedTextProps = {
  text: string;
  /** Jenis animasi masuk */
  type?: AnimationType;
  /** Frame mulai animasi (relatif terhadap komponen) */
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  /** Jika true, setiap kata muncul berurutan */
  staggerWords?: boolean;
  style?: React.CSSProperties;
};

/**
 * Komponen teks dengan beberapa preset animasi masuk.
 * Dibangun di atas spring() & interpolate() milik Remotion agar mulus pada semua fps.
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  type = "fade",
  delay = 0,
  fontSize = 64,
  color = "#F5F7FF",
  fontWeight = 700,
  staggerWords = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseStyle: React.CSSProperties = {
    fontFamily: fontFamily_Inter,
    fontSize,
    color,
    fontWeight,
    margin: 0,
    lineHeight: 1.15,
    ...style,
  };

  // Mode typewriter: tampilkan karakter satu per satu.
  if (type === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(frame - delay, [0, text.length * 2], [0, text.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    const showCursor = Math.floor(frame / (fps / 2)) % 2 === 0;
    return (
      <p style={baseStyle}>
        {text.slice(0, charsToShow)}
        <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
      </p>
    );
  }

  // Mode stagger per kata.
  if (staggerWords) {
    const words = text.split(" ");
    return (
      <p style={{ ...baseStyle, display: "flex", flexWrap: "wrap", gap: fontSize * 0.25 }}>
        {words.map((word, i) => (
          <Word
            key={`${word}-${i}`}
            word={word}
            type={type}
            delay={delay + i * 4}
            fps={fps}
            frame={frame}
          />
        ))}
      </p>
    );
  }

  const { opacity, transform } = getAnimation(type, frame, delay, fps);
  return <p style={{ ...baseStyle, opacity, transform }}>{text}</p>;
};

const Word: React.FC<{
  word: string;
  type: AnimationType;
  delay: number;
  fps: number;
  frame: number;
}> = ({ word, type, delay, fps, frame }) => {
  const { opacity, transform } = getAnimation(type, frame, delay, fps);
  return <span style={{ display: "inline-block", opacity, transform }}>{word}</span>;
};

function getAnimation(
  type: AnimationType,
  frame: number,
  delay: number,
  fps: number,
): { opacity: number; transform: string } {
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  switch (type) {
    case "slide-up":
      return { opacity, transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)` };
    case "slide-left":
      return { opacity, transform: `translateX(${interpolate(progress, [0, 1], [60, 0])}px)` };
    case "scale":
      return { opacity, transform: `scale(${interpolate(progress, [0, 1], [0.6, 1])})` };
    case "fade":
    default:
      return { opacity, transform: "none" };
  }
}
