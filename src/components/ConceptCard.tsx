import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";
import { fontFamily_Inter } from "../loadFonts";

export type ConceptCardProps = {
  /** Nomor langkah, mis. 1 */
  step: number;
  title: string;
  description: string;
  /** Frame mulai (relatif) */
  delay?: number;
  color?: string;
};

/**
 * Kartu "langkah" untuk video penjelasan konsep.
 * Masuk dengan efek slide + scale pakai spring.
 */
export const ConceptCard: React.FC<ConceptCardProps> = ({
  step,
  title,
  description,
  delay = 0,
  color = theme.colors.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, mass: 0.8 },
  });

  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [50, 0]);
  const scale = interpolate(enter, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.md,
        backgroundColor: theme.colors.card,
        border: `2px solid ${theme.colors.cardBorder}`,
        borderRadius: theme.radius,
        padding: theme.spacing.lg,
        width: 1200,
        fontFamily: fontFamily_Inter,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 96,
          height: 96,
          borderRadius: "50%",
          backgroundColor: color,
          color: theme.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          fontWeight: 800,
        }}
      >
        {step}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: theme.sizes.heading, color: theme.colors.text }}>
          {title}
        </h3>
        <p
          style={{
            margin: `${theme.spacing.sm}px 0 0`,
            fontSize: theme.sizes.body,
            color: theme.colors.textMuted,
            fontWeight: 400,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
