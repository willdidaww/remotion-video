import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily_Inter } from "../loadFonts";

/**
 * Video edukatif 9:16 ~20 detik: "Kenapa langit biru?"
 * Semua animasi dihitung dari frame (deterministik), tanpa aset eksternal.
 */

const W = 1080;
const H = 1920;
const EARTH_TOP = 1100;

const C = {
  skyDay: "#8FD3FF",
  skyDayLight: "#E6F7FF",
  dusk: "#FF9A6B",
  duskDeep: "#FF6F61",
  sun: "#FFD23F",
  earth: "#2F7D4F",
  atmo: "rgba(170, 225, 255, 0.5)",
  ink: "#0E1A2B",
  blue: "#2D8CFF",
  red: "#FF4B4B",
  molecule: "#5B6B7F",
  observer: "#2B5BD7",
  white: "#FFFFFF",
};

const RAINBOW = ["#FF3B3B", "#FF8A00", "#FFE14D", "#3BD16F", "#3BA7FF", "#4B4BFF", "#9B4BFF"];

/** Angka acak deterministik dari seed (0..1). */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ramp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Posisi molekul udara (titik gelap) di lapisan atmosfer. */
const molecule = (k: number): Pt => [150 + rnd(k * 2 + 1) * 780, 960 + rnd(k * 2 + 2) * 100];

/* ------------------------------ Komponen dasar ------------------------------ */

const Earth: React.FC = () => (
  <>
    <circle cx={W / 2} cy={EARTH_TOP + 2200} r={2200 + 160} fill={C.atmo} />
    <circle cx={W / 2} cy={EARTH_TOP + 2200} r={2200} fill={C.earth} />
  </>
);

const Caption: React.FC<{ title: string; sub?: string; delay?: number }> = ({ title, sub, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - delay, fps, config: { damping: 200 } });
  const y = interpolate(enter, [0, 1], [30, 0]);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 170,
        opacity: enter,
        transform: `translateY(${y}px)`,
        fontFamily: fontFamily_Inter,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: C.white,
          color: C.ink,
          borderRadius: 18,
          padding: "18px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 60, lineHeight: 1.15 }}>{title}</div>
        {sub && <div style={{ fontWeight: 600, fontSize: 38, marginTop: 10, color: "#3A4A5E" }}>{sub}</div>}
      </div>
    </div>
  );
};

/** Foton: titik + ekor. Jika `hit` ada, foton memantul di titik itu. */
const Photon: React.FC<{
  start: Pt;
  hit?: Pt;
  end: Pt;
  color: string;
  delay: number;
  dur: number;
}> = ({ start, hit, end, color, delay, dur }) => {
  const f = useCurrentFrame();
  const p = Math.min(1, Math.max(0, (f - delay) / dur));
  const pos = (q: number): Pt => {
    if (!hit) return lerp(start, end, q);
    return q < 0.5 ? lerp(start, hit, q * 2) : lerp(hit, end, (q - 0.5) * 2);
  };
  const [x1, y1] = pos(Math.max(0, p - 0.12));
  const [x2, y2] = pos(p);
  return (
    <g opacity={f >= delay ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
      <circle cx={x2} cy={y2} r={10} fill={color} />
    </g>
  );
};

/* ------------------------------- Adegan 1 ------------------------------- */
/** 0-3 detik: matahari terbit, judul muncul. */
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 45 });
  const sunY = interpolate(rise, [0, 1], [1300, 720]);
  const rot = f * 1.2;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${W / 2} ${sunY})`}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2 + (rot * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 190}
                y1={Math.sin(a) * 190}
                x2={Math.cos(a) * (250 + Math.sin(f * 0.2 + i) * 20)}
                y2={Math.sin(a) * (250 + Math.sin(f * 0.2 + i) * 20)}
                stroke={C.sun}
                strokeWidth={16}
                strokeLinecap="round"
              />
            );
          })}
          <circle r={150} fill={C.sun} />
        </g>
        <Earth />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fontFamily_Inter,
          fontWeight: 900,
          fontSize: 96,
          color: C.ink,
          opacity: ramp(f, 0, 15, 0, 1),
        }}
      >
        Kenapa langit biru?
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 2 ------------------------------- */
/** 3-6 detik: cahaya putih dipecah prisma jadi pelangi. */
const SceneSpectrum: React.FC = () => {
  const f = useCurrentFrame();
  const beam = ramp(f, 0, 25, 0, 1);
  const split = ramp(f, 25, 55, 0, 1);
  const prismIn: Pt = [500, 915];
  const exit: Pt = [575, 915];

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Earth />
        {/* Matahari */}
        <circle cx={150} cy={300} r={110} fill={C.sun} />
        {/* Sinar putih menuju prisma */}
        <line
          x1={230}
          y1={380}
          x2={230 + (prismIn[0] - 230) * beam}
          y2={380 + (prismIn[1] - 380) * beam}
          stroke={C.white}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Prisma */}
        <polygon points="540,840 470,980 610,980" fill="rgba(255,255,255,0.35)" stroke={C.ink} strokeWidth={5} />
        {/* Pelangi */}
        {RAINBOW.map((c, i) => {
          const endX = 720 + i * 50;
          const end = lerp(exit, [endX, 1040], split);
          return (
            <line
              key={c}
              x1={exit[0]}
              y1={exit[1]}
              x2={end[0]}
              y2={end[1]}
              stroke={c}
              strokeWidth={12}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <Caption title="Cahaya matahari" sub="ternyata berisi semua warna pelangi." delay={20} />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 3 ------------------------------- */
/** 6-11 detik: foton biru terpantul molekul udara, merah lurus. */
const SceneScatter: React.FC = () => {
  const f = useCurrentFrame();
  const glow = ramp(f, 0, 30, 0, 1);

  // Matahari di pojok kiri atas sebagai sumber cahaya
  const SUN: Pt = [110, 230];

  // 3 gelombang foton, masing-masing 12 foton (6 biru terpantul, 6 merah lurus)
  const photons = Array.from({ length: 36 }).map((_, n) => {
    const wave = Math.floor(n / 12);
    const i = n % 12;
    const m = molecule(i + wave * 12);
    const delay = wave * 90 + 8 + i * 9;
    if (i % 2 === 0) {
      // Biru: terpantul ke atas ke segala arah
      const end: Pt = [540 + (rnd(i + 50 + wave * 17) * 2 - 1) * 700, 150 + rnd(i + 60 + wave * 17) * 550];
      return <Photon key={n} start={SUN} hit={m} end={end} color={C.blue} delay={delay} dur={70} />;
    }
    // Merah: lurus, hampir tidak terpantul
    // Berhenti di lapisan atmosfer (y = 1040), tidak menembus tanah
    const kk = (1040 - m[1]) / (m[1] - SUN[1]);
    const end: Pt = [m[0] + (m[0] - SUN[0]) * kk, 1040];
    return <Photon key={n} start={SUN} end={end} color={C.red} delay={delay} dur={60} />;
  });

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Earth />
        {/* Matahari sebagai sumber cahaya */}
        <circle cx={110} cy={230} r={90} fill={C.sun} />
        {/* Molekul udara */}
        {Array.from({ length: 36 }).map((_, k) => {
          const [x, y] = molecule(k);
          const pulse = 1 + Math.sin(f * 0.15 + k) * 0.15 * glow;
          return <circle key={k} cx={x} cy={y} r={11 * pulse} fill={C.molecule} opacity={0.85} />;
        })}
        {photons}
      </svg>
      <Caption
        title="Gas di atmosfer"
        sub="memantulkan cahaya biru paling banyak."
        delay={10}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 4 ------------------------------- */
/** 11-15 detik: pantulan biru turun dari segala arah ke mata pengamat. */
const SceneEye: React.FC = () => {
  const f = useCurrentFrame();
  const sky = ramp(f, 0, 20, 0, 1);
  const eye: Pt = [540, 1140];

  const drops = Array.from({ length: 80 }).map((_, i) => {
    const x = rnd(i + 300) * W;
    const speed = 6 + rnd(i + 400) * 6;
    const y = (f * speed + rnd(i + 500) * H) % H;
    const visible = y < EARTH_TOP - 20;
    return visible ? (
      <circle key={i} cx={x} cy={y} r={7} fill={C.blue} opacity={0.75} />
    ) : null;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.skyDay, opacity: 0.6 + 0.4 * sky }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Earth />
        {drops}
        {/* Garis pandang ke atas */}
        <line x1={eye[0]} y1={eye[1] - 60} x2={eye[0]} y2={700} stroke={C.ink} strokeWidth={4} strokeDasharray="12 14" opacity={0.5} />
        {/* Pengamat */}
        <circle cx={eye[0]} cy={eye[1]} r={58} fill={C.ink} />
        <circle cx={eye[0] + 14} cy={eye[1] - 14} r={8} fill={C.white} />
        <rect x={eye[0] - 80} y={1200} width={160} height={230} rx={60} fill={C.observer} />
      </svg>
      <Caption title="Makanya langit terlihat biru" sub="cahaya biru datang dari segala arah." delay={6} />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 5 ------------------------------- */
/** 15-20 detik: senja, jalur cahaya makin panjang, biru hilang. */
const SceneSunset: React.FC = () => {
  const f = useCurrentFrame();
  const dusk = ramp(f, 0, 90, 0, 1);
  const sunY = ramp(f, 0, 110, 700, 1060);
  const sunX = 880;
  const eye: Pt = [540, 1140];
  const longPath = `M ${sunX} ${sunY} Q 80 ${sunY - 380} ${eye[0]} ${eye[1]}`;
  const draw = ramp(f, 20, 110, 0, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: C.skyDay }}>
      <AbsoluteFill style={{ background: `linear-gradient(${C.skyDayLight}, ${C.dusk})`, opacity: dusk }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Earth />
        {/* Jalur pendek (siang) */}
        <line x1={sunX} y1={sunY} x2={eye[0]} y2={eye[1]} stroke={C.white} strokeWidth={4} strokeDasharray="10 12" opacity={0.6 * (1 - dusk)} />
        {/* Jalur panjang (senja) */}
        <path d={longPath} fill="none" stroke={C.duskDeep} strokeWidth={12} strokeLinecap="round" strokeDasharray="1200" strokeDashoffset={1200 * (1 - draw)} />
        {/* Matahari terbenam */}
        <circle cx={sunX} cy={sunY} r={120} fill={dusk > 0.5 ? C.duskDeep : C.sun} />
        {/* Pengamat */}
        <circle cx={eye[0]} cy={eye[1]} r={58} fill={C.ink} />
        <rect x={eye[0] - 80} y={1200} width={160} height={230} rx={60} fill={C.observer} />
      </svg>
      <Caption title="Saat senja" sub="cahaya menempuh jalur lebih panjang, biru tersaring, sisanya oranye." delay={30} />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 6 ------------------------------- */
/** Intensitas hamburan sebanding dengan 1/λ⁴ (hukum Rayleigh). */
const WAVELENGTHS = [
  { name: "Merah", nm: 700, color: "#FF3B3B" },
  { name: "Jingga", nm: 620, color: "#FF8A00" },
  { name: "Kuning", nm: 580, color: "#FFD21F" },
  { name: "Hijau", nm: 530, color: "#3BD16F" },
  { name: "Biru", nm: 470, color: "#3BA7FF" },
  { name: "Nila", nm: 445, color: "#4B4BFF" },
  { name: "Ungu", nm: 400, color: "#9B4BFF" },
];

const SceneWhyNotViolet: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxI = Math.max(...WAVELENGTHS.map((w) => 1 / Math.pow(w.nm, 4)));
  const baseY = 1080;
  const maxH = 620;
  const barW = 96;
  const gap = 22;
  const startX = (W - (WAVELENGTHS.length * barW + (WAVELENGTHS.length - 1) * gap)) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: C.skyDayLight }}>
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fontFamily_Inter,
          fontWeight: 800,
          fontSize: 56,
          color: C.ink,
          opacity: ramp(f, 0, 15, 0, 1),
        }}
      >
        Seberapa banyak tersebar
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <line x1={startX - 20} y1={baseY} x2={W - startX + 20} y2={baseY} stroke={C.ink} strokeWidth={4} />
        {WAVELENGTHS.map((w, i) => {
          const grow = spring({ frame: f - 10 - i * 6, fps, config: { damping: 200 }, durationInFrames: 40 });
          const h = ((1 / Math.pow(w.nm, 4)) / maxI) * maxH * grow;
          const x = startX + i * (barW + gap);
          return (
            <g key={w.name}>
              <rect x={x} y={baseY - h} width={barW} height={h} rx={12} fill={w.color} />
              <text
                x={x + barW / 2}
                y={baseY + 46}
                textAnchor="middle"
                fontFamily={fontFamily_Inter}
                fontWeight={700}
                fontSize={26}
                fill={C.ink}
              >
                {w.name}
              </text>
            </g>
          );
        })}
      </svg>
      <Caption title="Ungu tersebar lebih banyak," sub="tapi mata kita lebih peka ke biru." delay={60} />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 7 ------------------------------- */
/** 46-50 detik: kesimpulan. */
const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sunIn = spring({ frame: f, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${C.skyDayLight}, ${C.skyDay})` }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <circle cx={860} cy={300 + (1 - sunIn) * 200} r={110} fill={C.sun} opacity={sunIn} />
        <Earth />
      </svg>
      <Caption title="Jadi, langit biru" sub="karena cahaya biru paling banyak tersebar oleh udara." delay={5} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Komposisi ------------------------------ */

export const SkyExplainer: React.FC = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: C.skyDay }}>
      <Sequence from={s(0)} durationInFrames={s(4)}>
        <SceneHook />
      </Sequence>
      <Sequence from={s(4)} durationInFrames={s(6)}>
        <SceneSpectrum />
      </Sequence>
      <Sequence from={s(10)} durationInFrames={s(12)}>
        <SceneScatter />
      </Sequence>
      <Sequence from={s(22)} durationInFrames={s(8)}>
        <SceneEye />
      </Sequence>
      <Sequence from={s(30)} durationInFrames={s(8)}>
        <SceneWhyNotViolet />
      </Sequence>
      <Sequence from={s(38)} durationInFrames={s(8)}>
        <SceneSunset />
      </Sequence>
      <Sequence from={s(46)} durationInFrames={s(4)}>
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
