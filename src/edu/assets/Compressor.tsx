import React from "react";
import { palette } from "../palette";

export type CompressorProps = {
  width?: number;
  /** Rotasi motor dalam derajat (dianimasikan dari luar) */
  motorRotation?: number;
  /** 0..1 level oli yang sudah tersirkulasi (naik mengisi bagian bawah) */
  oilLevel?: number;
  /** Kompresi pegas, 0 = rileks, 1 = tertekan */
  springCompress?: number;
  style?: React.CSSProperties;
};

/**
 * Penampang kompresor kulkas gaya flat-isometrik.
 * Versi sederhana (2D) dari model 3D referensi: cangkang dome, motor,
 * kumparan, pegas penyangga, dan genangan oli di dasar.
 */
export const Compressor: React.FC<CompressorProps> = ({
  width = 420,
  motorRotation = 0,
  oilLevel = 0,
  springCompress = 0,
  style,
}) => {
  const height = width * 1.05;
  const oilH = 40 + oilLevel * 30; // tinggi genangan oli
  const springY = springCompress * 10;

  return (
    <svg width={width} height={height} viewBox="0 0 420 440" style={style} fill="none">
      {/* Cangkang (dome) kompresor - potongan */}
      <path
        d="M 60 380 L 60 180 A 150 150 0 0 1 360 180 L 360 380 Z"
        fill={palette.caption}
      />
      {/* Interior lebih terang */}
      <path
        d="M 85 365 L 85 185 A 125 125 0 0 1 335 185 L 335 365 Z"
        fill="#2B2B2B"
      />

      {/* Genangan oli di dasar (naik sesuai oilLevel) */}
      <rect x="85" y={365 - oilH} width="250" height={oilH} fill={palette.oil} opacity={0.9} />
      <rect x="85" y={365 - oilH} width="250" height="6" fill={palette.oilDark} />

      {/* Pegas penyangga kiri & kanan */}
      <Spring x={140} yTop={300 + springY} />
      <Spring x={280} yTop={300 + springY} />

      {/* Blok motor (kumparan) */}
      <g>
        <rect x={150} y={200} width={120} height={110} rx={10} fill={palette.steel} />
        {/* Kumparan salmon kiri & kanan */}
        <rect x={120} y={220} width={40} height={70} rx={8} fill={palette.salmon} />
        <rect x={260} y={220} width={40} height={70} rx={8} fill={palette.salmon} />
        <rect x={120} y={220} width={40} height={10} rx={5} fill={palette.salmonDark} />
        <rect x={260} y={220} width={40} height={10} rx={5} fill={palette.salmonDark} />
      </g>

      {/* Poros + rotor yang berputar */}
      <g style={{ transformOrigin: "210px 255px", transform: `rotate(${motorRotation}deg)` }}>
        <circle cx={210} cy={255} r={34} fill={palette.steelDark} />
        <rect x={204} y={215} width={12} height={80} rx={6} fill={palette.steel} />
        <rect x={170} y={249} width={80} height={12} rx={6} fill={palette.steel} />
        <circle cx={210} cy={255} r={10} fill={palette.oil} />
      </g>

      {/* Pipa tembaga keluar atas */}
      <path
        d="M 210 120 C 210 80, 300 80, 340 110"
        stroke={palette.copper}
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 210 120 C 210 80, 300 80, 340 110"
        stroke={palette.copperDark}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
    </svg>
  );
};

const Spring: React.FC<{ x: number; yTop: number }> = ({ x, yTop }) => {
  const coils = [0, 1, 2, 3];
  return (
    <g stroke={palette.steel} strokeWidth="6" fill="none" strokeLinecap="round">
      {coils.map((i) => (
        <path key={i} d={`M ${x - 16} ${yTop + i * 14} Q ${x} ${yTop + i * 14 - 8} ${x + 16} ${yTop + i * 14}`} />
      ))}
      <line x1={x} y1={yTop - 6} x2={x} y2={yTop} />
    </g>
  );
};
