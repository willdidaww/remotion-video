import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { theme } from "../theme";

/**
 * Video showcase berbagai preset animasi teks.
 * Setiap Sequence adalah satu "scene" yang muncul berurutan.
 */
export const TextAnimation: React.FC = () => {
  const { fps } = useVideoConfig();
  const scene = 2.5 * fps; // durasi tiap scene (detik -> frame)

  const center: React.CSSProperties = {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: theme.spacing.xl,
  };

  return (
    <AbsoluteFill>
      <Background />

      {/* Scene 1: Fade in judul */}
      <Sequence durationInFrames={scene}>
        <AbsoluteFill style={center}>
          <AnimatedText
            text="Animasi Teks"
            type="scale"
            fontSize={theme.sizes.titleXL}
            color={theme.colors.text}
          />
          <AnimatedText
            text="dengan Remotion"
            type="fade"
            delay={12}
            fontSize={theme.sizes.title}
            color={theme.colors.primary}
            style={{ marginTop: theme.spacing.md }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Stagger per kata */}
      <Sequence from={scene} durationInFrames={scene}>
        <AbsoluteFill style={center}>
          <AnimatedText
            text="Setiap kata muncul satu per satu"
            type="slide-up"
            staggerWords
            fontSize={theme.sizes.heading}
            color={theme.colors.text}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Typewriter */}
      <Sequence from={scene * 2} durationInFrames={scene}>
        <AbsoluteFill style={center}>
          <AnimatedText
            text="Efek mesin ketik_"
            type="typewriter"
            fontSize={theme.sizes.title}
            color={theme.colors.accent}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: Slide kombinasi */}
      <Sequence from={scene * 3} durationInFrames={scene}>
        <AbsoluteFill style={{ ...center, alignItems: "flex-start" }}>
          <AnimatedText
            text="Semua mulus,"
            type="slide-left"
            fontSize={theme.sizes.title}
            color={theme.colors.secondary}
          />
          <AnimatedText
            text="di semua frame rate."
            type="slide-left"
            delay={10}
            fontSize={theme.sizes.title}
            color={theme.colors.text}
            style={{ marginTop: theme.spacing.sm }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
