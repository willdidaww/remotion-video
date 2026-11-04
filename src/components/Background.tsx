import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

/**
 * Background gradien halus dengan "blob" yang bergerak pelan.
 * Memberi kedalaman tanpa mengganggu teks di depan.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 300], [0, 40]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${20 + drift}% 30%, ${theme.colors.primary}33, transparent 45%),
                       radial-gradient(circle at ${80 - drift}% 70%, ${theme.colors.secondary}2E, transparent 45%)`,
        }}
      />
    </AbsoluteFill>
  );
};
