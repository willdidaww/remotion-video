import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { ConceptCard } from "../components/ConceptCard";
import { theme } from "../theme";

/**
 * Template video penjelasan konsep.
 * Ubah `concept` di bawah untuk membuat video penjelasan topik apa pun.
 */
const concept = {
  title: "Cara Kerja HTTP Request",
  steps: [
    { title: "Client mengirim request", description: "Browser mengirim permintaan ke server lewat URL." },
    { title: "Server memproses", description: "Server menerima, memproses, dan menyiapkan data." },
    { title: "Server mengirim response", description: "Data dikirim kembali dalam bentuk HTML/JSON." },
    { title: "Client merender hasil", description: "Browser menampilkan hasil ke pengguna." },
  ],
};

export const ConceptExplainer: React.FC = () => {
  const { fps } = useVideoConfig();
  const intro = 2 * fps;
  const perStep = 2 * fps;

  return (
    <AbsoluteFill>
      <Background />

      {/* Intro: judul konsep */}
      <Sequence durationInFrames={intro}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: theme.spacing.xl }}
        >
          <AnimatedText
            text={concept.title}
            type="scale"
            fontSize={theme.sizes.title}
            color={theme.colors.text}
          />
          <AnimatedText
            text="Penjelasan langkah demi langkah"
            type="fade"
            delay={14}
            fontSize={theme.sizes.body}
            color={theme.colors.textMuted}
            fontWeight={400}
            style={{ marginTop: theme.spacing.md }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Langkah-langkah: kartu menumpuk satu per satu */}
      <Sequence from={intro}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: theme.spacing.md,
            padding: theme.spacing.xl,
          }}
        >
          {concept.steps.map((step, i) => (
            <Sequence key={i} from={i * perStep} layout="none">
              <ConceptCard
                step={i + 1}
                title={step.title}
                description={step.description}
                color={i % 2 === 0 ? theme.colors.accent : theme.colors.primary}
              />
            </Sequence>
          ))}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
