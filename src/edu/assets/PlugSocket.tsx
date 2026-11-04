import React from "react";
import { palette } from "../palette";

export type PlugSocketProps = {
  width?: number;
  /** 0 = steker jauh dari colokan, 1 = tercolok penuh */
  inserted?: number;
  /** true = tampilkan percikan kecil saat tercolok penuh */
  spark?: boolean;
  style?: React.CSSProperties;
};

/**
 * Steker + stop kontak gaya flat, versi diperbesar & jelas.
 * Saat `inserted` = 1, pin steker benar-benar masuk ke lubang colokan
 * dan badan steker menempel ke muka colokan.
 */
export const PlugSocket: React.FC<PlugSocketProps> = ({
  width = 420,
  inserted = 0,
  spark = false,
  style,
}) => {
  const height = width * 0.66;
  // viewBox 420 x 280. Muka colokan (lubang) ada di x~130.
  // Posisi "diam" (digambar): pin steker mulai di x=178. Agar pin masuk ke
  // lubang (x~124), steker perlu bergeser ~54px ke kiri saat tercolok penuh.
  const seatOffset = 54; // offset agar pin benar-benar masuk saat inserted=1
  const travel = 150; // jarak tempuh animasi masuk
  const plugX = travel * (1 - inserted) - seatOffset * inserted;

  const seated = inserted > 0.92;

  return (
    <svg width={width} height={height} viewBox="0 0 420 280" style={style} fill="none">
      {/* ===== Stop kontak (kiri) ===== */}
      <g>
        {/* Badan */}
        <rect x="20" y="70" width="170" height="140" rx="22" fill={palette.labelBg} stroke={palette.bgDark} strokeWidth="5" />
        {/* Muka colokan (recessed) */}
        <circle cx="110" cy="140" r="58" fill={palette.wall} stroke={palette.bgDark} strokeWidth="4" />
        {/* Dua lubang */}
        <rect x="95" y="118" width="12" height="44" rx="6" fill={palette.caption} />
        <rect x="118" y="118" width="12" height="44" rx="6" fill={palette.caption} />
        {/* Lampu indikator */}
        <circle cx="45" cy="92" r="8" fill={seated ? palette.danger : palette.bgDark} />
      </g>

      {/* ===== Steker + kabel (geser masuk) ===== */}
      <g style={{ transform: `translateX(${plugX}px)` }}>
        {/* Kabel keluar ke kanan lalu melengkung */}
        <path
          d="M 300 140 C 360 140, 390 110, 390 70 C 390 40, 360 30, 335 45"
          stroke={palette.caption}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        {/* Badan steker */}
        <rect x="205" y="98" width="100" height="84" rx="16" fill={palette.caption} />
        <rect x="205" y="98" width="100" height="84" rx="16" fill="none" stroke={palette.steelDark} strokeWidth="3" />
        {/* Dua pin menghadap kiri (menuju lubang) */}
        <rect x="178" y="122" width="30" height="12" rx="6" fill={palette.steel} />
        <rect x="178" y="146" width="30" height="12" rx="6" fill={palette.steel} />
      </g>

      {/* ===== Percikan kecil saat tercolok ===== */}
      {spark && seated && (
        <g stroke={palette.electric} strokeWidth="4" strokeLinecap="round">
          <line x1="150" y1="110" x2="162" y2="98" />
          <line x1="155" y1="140" x2="172" y2="140" />
          <line x1="150" y1="170" x2="162" y2="182" />
        </g>
      )}
    </svg>
  );
};
