import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fontFamily_Inter } from "../loadFonts";

/**
 * Video edukatif 9:16, 50 detik: "Kenapa es mengapung?"
 * Semua gerak dihitung dari nomor frame (deterministik), tanpa aset eksternal.
 */

const W = 1080;
const H = 1920;

const C = {
  bgLight: "#EAF6FB",
  sky: "#CDEBFA",
  water: "#4FA9DD",
  waterDeep: "#2E7FB8",
  waterDarker: "#1F5F8F",
  waterOverlay: "rgba(46, 127, 184, 0.55)",
  ice: "#E6F6FF",
  iceStroke: "#9AD3F0",
  glass: "#9FB3C8",
  wax: "rgba(242, 193, 78, 0.75)",
  waxSolid: "#D99A1E",
  o: "#E8504A",
  h: "#FFFFFF",
  hStroke: "#B8C6D3",
  bond: "#7FD0FF",
  ink: "#0E1A2B",
  muted: "#3A4A5E",
  fish: "#F2A541",
  bed: "#6B5B45",
  white: "#FFFFFF",
};

type Pt = [number, number];

/** Angka acak deterministik dari seed (0..1). */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ramp = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/* ------------------------- Kisi heksagon (es) ------------------------- */

const R = 92;
const SQ3 = Math.sqrt(3);

/** Bangun kisi sarang lebah: titik sudut = posisi molekul, sisi = ikatan hidrogen. */
const buildLattice = () => {
  const vMap = new Map<string, Pt>();
  const edgeMap = new Map<string, [string, string]>();
  const hexKeys: string[][] = [];
  const key = (x: number, y: number) => `${Math.round(x)}_${Math.round(y)}`;

  for (let j = 0; j < 5; j++) {
    for (let i = 0; i < 4; i++) {
      const cx = i * SQ3 * R + (j % 2) * ((SQ3 * R) / 2);
      const cy = j * 1.5 * R;
      const ks: string[] = [];
      for (let k = 0; k < 6; k++) {
        const a = ((60 * k + 30) * Math.PI) / 180;
        const x = cx + R * Math.cos(a);
        const y = cy + R * Math.sin(a);
        const kk = key(x, y);
        if (!vMap.has(kk)) vMap.set(kk, [x, y]);
        ks.push(kk);
      }
      for (let k = 0; k < 6; k++) {
        const a = ks[k];
        const b = ks[(k + 1) % 6];
        edgeMap.set(a < b ? `${a}|${b}` : `${b}|${a}`, [a, b]);
      }
      hexKeys.push(ks);
    }
  }

  const keys = [...vMap.keys()];
  const raw = keys.map((k) => vMap.get(k) as Pt);
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const dx = 540 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const dy = 880 - (Math.min(...ys) + Math.max(...ys)) / 2;
  const pts: Pt[] = raw.map(([x, y]) => [x + dx, y + dy]);
  const idx = new Map(keys.map((k, i) => [k, i] as const));
  const edges = [...edgeMap.values()].map(([a, b]) => [idx.get(a) as number, idx.get(b) as number] as const);
  const hexes = hexKeys.map((ks) => ks.map((k) => idx.get(k) as number));
  return { pts, edges, hexes };
};

const LATTICE = buildLattice();
const N = LATTICE.pts.length;

/* ------------------------- Molekul air cair ------------------------- */

const COLS = 8;
const ROWS = Math.ceil(N / COLS);

/** Posisi dasar molekul air cair: lebih rapat dari kisi es. */
const liquidPos = (k: number): Pt => {
  const col = k % COLS;
  const row = Math.floor(k / COLS);
  const y0 = 880 - ((ROWS - 1) * 88) / 2;
  return [218 + col * 92 + (rnd(k + 1) - 0.5) * 30, y0 + row * 88 + (rnd(k + 7) - 0.5) * 30];
};

const wobble = (k: number, f: number): Pt => [Math.sin(f * 0.09 + k * 1.7) * 18, Math.cos(f * 0.11 + k * 2.3) * 18];
const liquidRot = (k: number, f: number) => rnd(k + 3) * 360 + f * (1.5 + rnd(k + 5) * 2) * (k % 2 ? 1 : -1);

const bounds = (pts: Pt[], m: number) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs) - m, y0: Math.min(...ys) - m, x1: Math.max(...xs) + m, y1: Math.max(...ys) + m };
};
const LIQ_BOX = bounds(Array.from({ length: N }, (_, k) => liquidPos(k)), 50);
const ICE_BOX = bounds(LATTICE.pts, 50);

/* ------------------------------ Komponen dasar ------------------------------ */

const H2O: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={-20} cy={22} r={13} fill={C.h} stroke={C.hStroke} strokeWidth={3} />
    <circle cx={20} cy={22} r={13} fill={C.h} stroke={C.hStroke} strokeWidth={3} />
    <circle cx={0} cy={0} r={22} fill={C.o} />
  </g>
);

/** Kubus es. x = tengah, y = sisi atas. */
const IceCube: React.FC<{ x: number; y: number; size: number; rot?: number }> = ({ x, y, size, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-size / 2} y={0} width={size} height={size} rx={size * 0.16} fill={C.white} stroke="#5FB4E5" strokeWidth={6} />
    <rect x={-size / 2 + size * 0.15} y={size * 0.12} width={size * 0.25} height={size * 0.12} rx={6} fill={C.white} opacity={0.9} />
  </g>
);

/**
 * Gelas meruncing ke bawah. Cairan digambar SETELAH isi (children)
 * dengan warna transparan, jadi bagian yang terendam terlihat di bawah air.
 */
const Glass: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  surface: number;
  liquid: string;
  children?: React.ReactNode;
}> = ({ x, y, w, h, surface, liquid, children }) => {
  const taper = 24;
  const lx = (yy: number) => x + (taper * (yy - y)) / h;
  const rx = (yy: number) => x + w - (taper * (yy - y)) / h;
  const b = y + h;
  return (
    <g>
      <polygon points={`${lx(y)},${y} ${rx(y)},${y} ${rx(b)},${b} ${lx(b)},${b}`} fill="rgba(255,255,255,0.55)" />
      {children}
      <polygon points={`${lx(surface)},${surface} ${rx(surface)},${surface} ${rx(b)},${b} ${lx(b)},${b}`} fill={liquid} />
      <path
        d={`M ${lx(y)} ${y} L ${lx(b)} ${b} L ${rx(b)} ${b} L ${rx(y)} ${y}`}
        stroke={C.glass}
        strokeWidth={8}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
};

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
        {sub && <div style={{ fontWeight: 600, fontSize: 35, marginTop: 10, color: C.muted }}>{sub}</div>}
      </div>
    </div>
  );
};

const TopTitle: React.FC<{ text: string; color?: string; delay?: number; size?: number }> = ({
  text,
  color = C.ink,
  delay = 0,
  size = 64,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily: fontFamily_Inter,
        fontWeight: 900,
        fontSize: size,
        color,
        opacity: ramp(f, delay, delay + 15, 0, 1),
        transform: `translateY(${ramp(f, delay, delay + 15, -20, 0)}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** Fade masuk & keluar di tepi tiap adegan. */
const Fade: React.FC<{ dur: number; noIn?: boolean; children: React.ReactNode }> = ({ dur, noIn, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(noIn ? 1 : ramp(f, 0, 10, 0, 1), ramp(f, dur - 10, dur, 1, 0));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/* ------------------------------- Adegan 1 ------------------------------- */
/** 0-4 detik: es jatuh ke gelas, memercik, lalu terapung. */
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const surface = 900;
  const cube = 170;
  const drop = spring({ frame: f - 8, fps, config: { damping: 9, mass: 0.8 } });
  const top = interpolate(drop, [0, 1], [120, surface - cube * 0.1]) + Math.sin(f * 0.12) * 6 * drop;
  const rot = Math.sin(f * 0.08) * 4 * drop;
  const hit = 20;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Glass x={320} y={640} w={440} h={700} surface={surface} liquid="rgba(79,169,221,0.45)">
          <IceCube x={540} y={top} size={cube} rot={rot} />
        </Glass>
        {/* Riak di permukaan */}
        {[0, 12].map((d) => (
          <ellipse
            key={d}
            cx={540}
            cy={surface}
            rx={ramp(f, hit + d, hit + d + 40, 0, 200)}
            ry={ramp(f, hit + d, hit + d + 40, 0, 22)}
            fill="none"
            stroke={C.white}
            strokeWidth={5}
            opacity={ramp(f, hit + d, hit + d + 40, 0.9, 0)}
          />
        ))}
        {/* Percikan */}
        {Array.from({ length: 8 }).map((_, i) => {
          const t = ramp(f, hit, hit + 24, 0, 1);
          const dir = (i % 2 ? 1 : -1) * (0.5 + rnd(i + 20));
          const x = 540 + dir * t * 170;
          const y = surface - Math.sin(Math.PI * t) * (90 + rnd(i + 30) * 90);
          return t > 0 && t < 1 ? <circle key={i} cx={x} cy={y} r={9} fill={C.water} /> : null;
        })}
      </svg>
      <TopTitle text="Kenapa es mengapung?" size={72} />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fontFamily_Inter,
          fontWeight: 600,
          fontSize: 44,
          color: C.muted,
          opacity: ramp(f, 50, 65, 0, 1),
        }}
      >
        Padahal es itu air juga.
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 2 ------------------------------- */
/** 4-10 detik: lilin padat tenggelam, es mengapung. */
const SceneCompare: React.FC = () => {
  const f = useCurrentFrame();
  const surface = 860;
  const waxTop = interpolate(f, [15, 90], [790, 1130], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const iceTop = surface - 15 + Math.sin(f * 0.12) * 6;
  const label = (x: number, text: string, sub: string, delay: number) => (
    <g opacity={ramp(f, delay, delay + 15, 0, 1)}>
      <text x={x} y={1360} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={900} fontSize={48} fill={C.ink}>
        {text}
      </text>
      <text x={x} y={1412} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={600} fontSize={34} fill={C.muted}>
        {sub}
      </text>
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
      <TopTitle text="Padat vs cair" />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <Glass x={100} y={700} w={400} h={580} surface={surface} liquid={C.wax}>
          <rect x={230} y={waxTop} width={140} height={140} rx={18} fill={C.waxSolid} />
        </Glass>
        <Glass x={580} y={700} w={400} h={580} surface={surface} liquid="rgba(79,169,221,0.45)">
          <IceCube x={780} y={iceTop} size={150} rot={Math.sin(f * 0.08) * 3} />
        </Glass>
        {label(300, "Lilin", "padatnya tenggelam", 70)}
        {label(780, "Air", "esnya mengapung", 85)}
      </svg>
      {f < 100 ? (
        <Caption title="Biasanya, wujud padat lebih berat" sub="jadi tenggelam di cairannya sendiri." delay={10} />
      ) : (
        <Caption title="Air adalah pengecualian" sub="esnya justru mengapung." delay={100} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 3 ------------------------------- */
/** 10-20 detik: zoom ke molekul air cair yang bergerak bebas. */
const SceneLiquid: React.FC = () => {
  const f = useCurrentFrame();
  const lens = ramp(f, 0, 30, 0, 1300);
  const pos = (k: number): Pt => {
    const [bx, by] = liquidPos(k);
    const [wx, wy] = wobble(k, f);
    return [bx + wx, by + wy];
  };

  const bonds: React.ReactNode[] = [];
  for (let k = 0; k < N; k++) {
    const nb = [k % COLS < COLS - 1 ? k + 1 : -1, k + COLS].filter((n) => n >= 0 && n < N);
    nb.forEach((n, j) => {
      const on = Math.sin(f * 0.25 + k * 1.3 + j * 2.1) > 0.55 && f > 120;
      if (!on) return;
      const [x1, y1] = pos(k);
      const [x2, y2] = pos(n);
      bonds.push(
        <line key={`${k}-${n}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.bond} strokeWidth={5} strokeDasharray="8 8" opacity={0.9} />,
      );
    });
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="lens-liquid">
            <circle cx={540} cy={880} r={lens} />
          </clipPath>
          <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.waterDeep} />
            <stop offset="1" stopColor={C.waterDarker} />
          </linearGradient>
        </defs>
        <g clipPath="url(#lens-liquid)">
          <rect x={0} y={0} width={W} height={H} fill="url(#water-grad)" />
          {bonds}
          {Array.from({ length: N }).map((_, k) => {
            const [x, y] = pos(k);
            return <H2O key={k} x={x} y={y} rot={liquidRot(k, f)} />;
          })}
        </g>
      </svg>
      <TopTitle text="Diperbesar jutaan kali" color={C.white} delay={20} size={56} />
      {f < 150 ? (
        <Caption title="Air cair" sub="molekulnya bergerak bebas dan berdesakan rapat." delay={30} />
      ) : (
        <Caption title="Ikatan hidrogen" sub="terus putus-sambung, jadi molekul bisa saling mendekat." delay={150} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 4 ------------------------------- */
/** 20-30 detik: suhu turun ke 0°C, molekul mengunci jadi kisi heksagon. */
const SceneFreeze: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const temp = ramp(f, 0, 90, 20, 0);
  const t = spring({ frame: f - 80, fps, config: { damping: 200 }, durationInFrames: 90 });
  const amp = ramp(f, 0, 80, 1, 0.4) * (1 - t);
  const bg = interpolateColors(f, [60, 200], [C.waterDeep, "#BFE6F7"]);
  const bondsOn = ramp(f, 170, 200, 0, 1);
  const holes = ramp(f, 200, 230, 0, 1) * (0.75 + 0.25 * Math.sin(f * 0.15));

  const pos = (k: number): Pt => {
    const [bx, by] = liquidPos(k);
    const [wx, wy] = wobble(k, f);
    return lerp([bx + wx * amp, by + wy * amp], LATTICE.pts[k], t);
  };
  const rot = (k: number) => interpolate(t, [0, 1], [liquidRot(k, f * (1 - t)), (k % 2) * 180]);

  const box = {
    x0: interpolate(t, [0, 1], [LIQ_BOX.x0, ICE_BOX.x0]),
    y0: interpolate(t, [0, 1], [LIQ_BOX.y0, ICE_BOX.y0]),
    x1: interpolate(t, [0, 1], [LIQ_BOX.x1, ICE_BOX.x1]),
    y1: interpolate(t, [0, 1], [LIQ_BOX.y1, ICE_BOX.y1]),
  };
  const mercury = interpolate(temp, [0, 20], [25, 125]);

  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        {/* Rongga heksagon */}
        {LATTICE.hexes.map((hx, i) => (
          <polygon
            key={i}
            points={hx.map((k) => LATTICE.pts[k].join(",")).join(" ")}
            fill={C.white}
            opacity={holes * 0.45}
          />
        ))}
        {/* Ikatan hidrogen yang terkunci */}
        {LATTICE.edges.map(([a, b], i) => {
          const [x1, y1] = pos(a);
          const [x2, y2] = pos(b);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.waterDeep} strokeWidth={5} strokeDasharray="8 8" opacity={bondsOn} />
          );
        })}
        {Array.from({ length: N }).map((_, k) => {
          const [x, y] = pos(k);
          return <H2O key={k} x={x} y={y} rot={rot(k)} />;
        })}
        {/* Kotak volume yang membesar */}
        <rect
          x={box.x0}
          y={box.y0}
          width={box.x1 - box.x0}
          height={box.y1 - box.y0}
          rx={24}
          fill="none"
          stroke={C.ink}
          strokeWidth={4}
          strokeDasharray="16 12"
          opacity={ramp(f, 90, 110, 0, 0.7)}
        />
        <text
          x={540}
          y={box.y0 - 22}
          textAnchor="middle"
          fontFamily={fontFamily_Inter}
          fontWeight={800}
          fontSize={36}
          fill={C.ink}
          opacity={ramp(f, 150, 170, 0, 1)}
        >
          volume membesar
        </text>
        {/* Termometer */}
        <g transform="translate(110 250)">
          <rect x={-20} y={0} width={40} height={150} rx={20} fill={C.white} stroke={C.ink} strokeWidth={5} />
          <rect x={-9} y={150 - mercury} width={18} height={mercury + 10} rx={9} fill={C.o} />
          <circle cx={0} cy={166} r={30} fill={C.o} stroke={C.ink} strokeWidth={5} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 60,
          backgroundColor: C.white,
          borderRadius: 16,
          padding: "8px 18px",
          fontFamily: fontFamily_Inter,
          fontWeight: 900,
          fontSize: 48,
          color: temp < 1 ? C.waterDeep : C.o,
        }}
      >
        {Math.round(temp)}°C
      </div>
      {f < 200 ? (
        <Caption title="Saat membeku (0°C)" sub="ikatan hidrogen mengunci molekul di posisinya." delay={20} />
      ) : (
        <Caption title="Polanya heksagon berongga" sub="molekulnya jadi lebih renggang daripada air cair." delay={200} />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 5 ------------------------------- */
/** 30-38 detik: timbangan, volume sama, es lebih ringan. */
const SceneDensity: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = spring({ frame: f - 40, fps, config: { damping: 10, mass: 1.2 } });
  const theta = ((7 * tilt) * Math.PI) / 180;
  const cx = 540;
  const cy = 560;
  const L = 330;
  const left: Pt = [cx - L * Math.cos(theta), cy + L * Math.sin(theta)];
  const right: Pt = [cx + L * Math.cos(theta), cy - L * Math.sin(theta)];
  const enter = ramp(f, 0, 20, 0, 1);

  const pan = (e: Pt, kind: "air" | "es") => {
    const panY = e[1] + 330;
    const bx = e[0] - 110;
    const by = panY - 220;
    const mols: React.ReactNode[] = [];
    if (kind === "air") {
      for (let r = 0; r < 5; r++)
        for (let c = 0; c < 5; c++)
          mols.push(<H2O key={`${r}-${c}`} x={bx + 30 + c * 40} y={by + 26 + r * 40} rot={rnd(r * 5 + c) * 360 + f * 2} s={0.42} />);
    } else {
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 5; c++)
          mols.push(<H2O key={`${r}-${c}`} x={bx + 30 + c * 40 + (r % 2) * 10} y={by + 30 + r * 52} rot={(c % 2) * 180} s={0.42} />);
    }
    return (
      <g>
        <line x1={e[0]} y1={e[1]} x2={e[0] - 120} y2={panY} stroke={C.ink} strokeWidth={4} />
        <line x1={e[0]} y1={e[1]} x2={e[0] + 120} y2={panY} stroke={C.ink} strokeWidth={4} />
        <rect x={bx} y={by} width={220} height={220} rx={16} fill={kind === "air" ? C.water : C.ice} stroke={kind === "air" ? C.waterDeep : C.iceStroke} strokeWidth={5} />
        {mols}
        <rect x={e[0] - 140} y={panY} width={280} height={18} rx={9} fill={C.ink} />
        <text x={e[0]} y={panY + 76} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={900} fontSize={46} fill={C.ink}>
          {kind === "air" ? "Air" : "Es"}
        </text>
        <text x={e[0]} y={panY + 124} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={700} fontSize={36} fill={C.muted} opacity={ramp(f, 70, 85, 0, 1)}>
          {kind === "air" ? "1,00 g/cm³" : "0,92 g/cm³"}
        </text>
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
      <TopTitle text="Volume sama, berat beda" />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, opacity: enter }}>
        <rect x={cx - 10} y={cy} width={20} height={800} fill={C.ink} />
        <rect x={cx - 150} y={cy + 790} width={300} height={30} rx={15} fill={C.ink} />
        <line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={C.ink} strokeWidth={16} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={22} fill={C.o} stroke={C.ink} strokeWidth={5} />
        {pan(left, "air")}
        {pan(right, "es")}
      </svg>
      {f > 60 && <Caption title="Es sekitar 9% lebih ringan" sub="benda yang lebih ringan dari air akan mengapung." delay={60} />}
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 6 ------------------------------- */
/** 38-46 detik: gunung es muncul dari bawah, sebagian besar terendam. */
const ICEBERG: Pt[] = [
  [-90, 0], [-50, -60], [10, -95], [70, -50], [110, 0], [220, 120], [300, 380],
  [250, 620], [120, 760], [-60, 790], [-220, 680], [-300, 420], [-260, 160],
];

const SceneIceberg: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const waterY = 820;
  const rise = spring({ frame: f, fps, config: { damping: 8, mass: 1.4 } });
  const y = interpolate(rise, [0, 1], [1500, waterY]) + Math.sin(f * 0.07) * 8;
  const s = 0.85;
  const poly = ICEBERG.map(([px, py]) => `${540 + px * s},${y + py * s}`).join(" ");

  const wave: string[] = [];
  for (let x = 0; x <= W; x += 40) wave.push(`${x},${waterY + Math.sin(x * 0.02 + f * 0.1) * 8}`);
  const waterPath = `M ${wave.join(" L ")} L ${W} ${H} L 0 ${H} Z`;

  const topY = waterY - 95 * s;
  const botY = waterY + 790 * s;
  const bracket = (y0: number, y1: number, big: string, small: string, delay: number) => (
    <g opacity={ramp(f, delay, delay + 15, 0, 1)}>
      <path d={`M 830 ${y0} L 850 ${y0} L 850 ${y1} L 830 ${y1}`} stroke={C.ink} strokeWidth={5} fill="none" />
      <text x={870} y={(y0 + y1) / 2} fontFamily={fontFamily_Inter} fontWeight={900} fontSize={52} fill={C.ink}>
        {big}
      </text>
      <text x={870} y={(y0 + y1) / 2 + 42} fontFamily={fontFamily_Inter} fontWeight={700} fontSize={32} fill={C.ink}>
        {small}
      </text>
    </g>
  );

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#8CCBEB, #CDEBFA 42%)" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <polygon points={poly} fill={C.white} stroke="#5FB4E5" strokeWidth={6} strokeLinejoin="round" />
        {/* Sisi gelap untuk kesan volume */}
        <polygon
          points={[[10, -95], [70, -50], [110, 0], [220, 120], [300, 380], [250, 620], [40, 300]]
            .map(([px, py]) => `${540 + px * s},${y + py * s}`)
            .join(" ")}
          fill="#CFE9F7"
        />
        <path d={waterPath} fill={C.waterOverlay} />
        <path d={`M ${wave.join(" L ")}`} stroke={C.white} strokeWidth={5} fill="none" opacity={0.8} />
        {bracket(topY, waterY - 6, "10%", "di atas", 60)}
        {bracket(waterY + 6, botY, "90%", "di bawah", 90)}
      </svg>
      <TopTitle text="Gunung es" delay={10} />
      <Caption title="Gunung es pun begitu" sub="hanya sekitar 10% bagiannya yang muncul di atas air." delay={110} />
    </AbsoluteFill>
  );
};

/* ------------------------------- Adegan 7 ------------------------------- */
/** 46-50 detik: danau membeku dari atas, ikan tetap hidup di bawah. */
const Fish: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <polygon points="-48,0 -78,-24 -78,24" fill={color} />
    <ellipse cx={0} cy={0} rx={52} ry={26} fill={color} />
    <circle cx={26} cy={-6} r={6} fill={C.ink} />
  </g>
);

const SceneLake: React.FC = () => {
  const f = useCurrentFrame();
  const iceH = ramp(f, 0, 40, 0, 80);
  const iceTop = 640;

  return (
    <AbsoluteFill style={{ backgroundColor: C.sky }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="lake-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.water} />
            <stop offset="1" stopColor={C.waterDarker} />
          </linearGradient>
        </defs>
        {/* Salju */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = rnd(i + 900) * W + Math.sin(f * 0.05 + i) * 20;
          const y = (f * (2 + rnd(i + 950) * 2) + rnd(i + 990) * iceTop) % iceTop;
          return <circle key={i} cx={x} cy={y} r={6 + rnd(i) * 4} fill={C.white} />;
        })}
        <rect x={0} y={iceTop} width={W} height={1460 - iceTop} fill="url(#lake-grad)" />
        <rect x={0} y={iceTop} width={W} height={iceH} fill={C.ice} stroke={C.iceStroke} strokeWidth={iceH > 0 ? 5 : 0} />
        <rect x={0} y={1460} width={W} height={H - 1460} fill={C.bed} />
        {[
          { y: 900, speed: 4, off: 0, color: C.fish },
          { y: 1080, speed: 3, off: 500, color: "#FF7A59" },
          { y: 1260, speed: 5, off: 900, color: C.fish },
        ].map((fi, i) => (
          <Fish key={i} x={((f * fi.speed + fi.off) % 1300) - 110} y={fi.y + Math.sin(f * 0.1 + i) * 10} color={fi.color} />
        ))}
        <text x={540} y={iceTop + 54} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={800} fontSize={36} fill={C.waterDeep} opacity={ramp(f, 30, 45, 0, 1)}>
          lapisan es
        </text>
        <text x={540} y={1410} textAnchor="middle" fontFamily={fontFamily_Inter} fontWeight={800} fontSize={36} fill={C.white} opacity={ramp(f, 40, 55, 0, 1)}>
          air di dasar tetap sekitar 4°C
        </text>
      </svg>
      <Caption title="Karena es mengapung," sub="danau membeku dari atas, ikan tetap hidup di bawahnya." delay={10} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Komposisi ------------------------------ */

export const IceExplainer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  const scenes: { from: number; dur: number; El: React.FC }[] = [
    { from: 0, dur: 4, El: SceneHook },
    { from: 4, dur: 6, El: SceneCompare },
    { from: 10, dur: 10, El: SceneLiquid },
    { from: 20, dur: 10, El: SceneFreeze },
    { from: 30, dur: 8, El: SceneDensity },
    { from: 38, dur: 8, El: SceneIceberg },
    { from: 46, dur: 4, El: SceneLake },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
      {scenes.map(({ from, dur, El }, i) => (
        <Sequence key={i} from={s(from)} durationInFrames={s(dur)}>
          <Fade dur={s(dur)} noIn={i === 0}>
            <El />
          </Fade>
        </Sequence>
      ))}
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 10,
          width: `${(f / (durationInFrames - 1)) * 100}%`,
          backgroundColor: C.waterDeep,
        }}
      />
    </AbsoluteFill>
  );
};
