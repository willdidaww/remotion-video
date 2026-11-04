import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette } from "./palette";
import { Room } from "./assets/Room";
import { Fridge } from "./assets/Fridge";
import { PlugSocket } from "./assets/PlugSocket";
import { Compressor } from "./assets/Compressor";
import { ElectricFlow } from "./assets/ElectricFlow";
import { KaraokeCaption } from "./overlays/KaraokeCaption";
import { LabelBadge } from "./overlays/LabelBadge";
import { Inset } from "./overlays/Inset";
import { Watermark } from "./overlays/Watermark";
import { fontFamily_Inter } from "../loadFonts";

/**
 * Video edukatif 9:16 ~20 detik:
 * "Kenapa jangan langsung colok kulkas setelah dipindah".
 * Full 2D/vektor (Opsi B) — semua aset digambar dengan SVG.
 */
export const FridgeExplainer: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill>
      <Room />

      {/* Watermark tetap di pojok kanan atas sepanjang video */}
      <div style={{ position: "absolute", top: 40, right: 40, zIndex: 50 }}>
        <Watermark />
      </div>

      {/* SCENE 1 — HOOK (0-3s) */}
      <Sequence durationInFrames={s(3)}>
        <SceneHook />
      </Sequence>

      {/* SCENE 2 — COLOK & LISTRIK MENGALIR (3-7s) */}
      <Sequence from={s(3)} durationInFrames={s(4)}>
        <ScenePlug />
      </Sequence>

      {/* SCENE 3 — DALAM KOMPRESOR (7-13s) */}
      <Sequence from={s(7)} durationInFrames={s(6)}>
        <SceneCompressor />
      </Sequence>

      {/* SCENE 4 — MASALAH OLI (13-18s) */}
      <Sequence from={s(13)} durationInFrames={s(5)}>
        <SceneOil />
      </Sequence>

      {/* SCENE 5 — KESIMPULAN (18-21s) */}
      <Sequence from={s(18)} durationInFrames={durationInFrames - s(18)}>
        <SceneConclusion />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ----------------------------- SCENES ----------------------------- */

const centered: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
};

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 14 } });
  const scale = interpolate(pop, [0, 1], [0.8, 1]);

  return (
    <AbsoluteFill style={centered}>
      <div style={{ transform: `scale(${scale})`, marginBottom: 40 }}>
        <Fridge width={340} doorOpen={0} />
      </div>
      <div style={{ position: "absolute", bottom: 360, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <LabelBadge text="JANGAN LANGSUNG DICOLOK!" variant="danger" fontSize={42} delay={8} />
      </div>
      <TitleBelow text="Kulkas baru dipindah?" sub="Tunggu dulu sebelum menyalakannya." />
    </AbsoluteFill>
  );
};

const ScenePlug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Steker masuk pada paruh pertama scene
  const inserted = spring({ frame, fps, config: { damping: 18 }, durationInFrames: Math.round(fps * 1.5) });

  return (
    <AbsoluteFill style={centered}>
      <div style={{ marginBottom: 60 }}>
        <PlugSocket width={420} inserted={inserted} />
      </div>
      {/* Listrik mulai mengalir setelah tercolok */}
      <Sequence from={Math.round(fps * 1.5)}>
        <div style={{ position: "absolute", top: "40%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <ElectricFlow width={520} height={160} count={7} speed={1.6} />
        </div>
      </Sequence>
      <TitleBelow text="Begitu dicolok..." sub="listrik langsung mengalir ke kompresor." />
    </AbsoluteFill>
  );
};

const SceneCompressor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Motor berputar makin cepat
  const rotation = (frame * frame) * 0.06;
  const zoom = interpolate(frame, [0, fps], [0.85, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={centered}>
      <div style={{ transform: `scale(${zoom})`, marginTop: -60 }}>
        <Compressor width={520} motorRotation={rotation} oilLevel={0} />
      </div>

      {/* Label di sekitar kompresor */}
      <div style={{ position: "absolute", top: 180, left: 60 }}>
        <LabelBadge text="MOTOR LANGSUNG BEKERJA" delay={6} fontSize={30} />
      </div>
      <div style={{ position: "absolute", top: 180, right: 60 }}>
        <Inset title="GERAK CEPAT" delay={14} width={240} height={180}>
          <MiniGauge />
        </Inset>
      </div>

      <KaraokeCaption
        delay={20}
        style={{ position: "absolute", bottom: 300, left: 0, right: 0 }}
        lines={[
          [{ text: "Di dalam" }, { text: "ada" }, { text: "motor" }, { text: "&" }, { text: "pompa", highlight: true }],
        ]}
      />
    </AbsoluteFill>
  );
};

const SceneOil: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rotation = frame * 9;
  // Oli perlahan naik (mengilustrasikan sirkulasi yang butuh waktu)
  const oilLevel = interpolate(frame, [0, fps * 3.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={centered}>
      <div style={{ marginTop: -60 }}>
        <Compressor width={520} motorRotation={rotation} oilLevel={oilLevel} />
      </div>

      <div style={{ position: "absolute", top: 160, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <LabelBadge text="KALAU LANGSUNG DICOLOK:" variant="danger" fontSize={38} delay={2} />
      </div>

      {/* Inset pojok kiri seperti referensi */}
      <div style={{ position: "absolute", top: 320, left: 50 }}>
        <Inset title="STEKER → COLOKAN" caption="GERAK LAMBAT" delay={10} width={280} height={200}>
          <PlugSocket width={220} inserted={1} />
        </Inset>
      </div>

      <KaraokeCaption
        delay={24}
        fontSize={52}
        style={{ position: "absolute", bottom: 280, left: 0, right: 0 }}
        lines={[
          [{ text: "pompanya" }, { text: "jalan", highlight: true }],
          [{ text: "sebelum" }, { text: "olinya" }, { text: "pulang." }],
        ]}
      />
    </AbsoluteFill>
  );
};

const SceneConclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 13 } });
  const scale = interpolate(pop, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={centered}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>⏱️</div>
        <div style={{ fontFamily: fontFamily_Inter, fontWeight: 900, fontSize: 72, color: palette.caption, lineHeight: 1.15 }}>
          Tunggu 15–30 menit
        </div>
        <div style={{ fontFamily: fontFamily_Inter, fontWeight: 600, fontSize: 44, color: palette.steelDark, marginTop: 20 }}>
          sebelum menyalakan kulkas
          <br />
          yang baru dipindah.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------- HELPERS --------------------------- */

const TitleBelow: React.FC<{ text: string; sub: string }> = ({ text, sub }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [4, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        opacity,
        position: "absolute",
        bottom: 220,
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 60px",
        fontFamily: fontFamily_Inter,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 56, color: palette.caption }}>{text}</div>
      <div style={{ fontWeight: 600, fontSize: 38, color: palette.steelDark, marginTop: 10 }}>{sub}</div>
    </div>
  );
};

/** Gauge kecil untuk inset "GERAK CEPAT" */
const MiniGauge: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = interpolate(Math.sin(frame * 0.3), [-1, 1], [-60, 60]);
  return (
    <svg width={180} height={140} viewBox="0 0 180 140">
      <path d="M 20 120 A 70 70 0 0 1 160 120" fill="none" stroke={palette.bgDark} strokeWidth="10" strokeLinecap="round" />
      <path d="M 20 120 A 70 70 0 0 1 90 50" fill="none" stroke={palette.danger} strokeWidth="10" strokeLinecap="round" />
      <g style={{ transformOrigin: "90px 120px", transform: `rotate(${angle}deg)` }}>
        <line x1="90" y1="120" x2="90" y2="60" stroke={palette.caption} strokeWidth="6" strokeLinecap="round" />
      </g>
      <circle cx="90" cy="120" r="10" fill={palette.caption} />
    </svg>
  );
};
