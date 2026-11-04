/**
 * Palet warna untuk video edukatif gaya flat/isometrik.
 * Meniru look referensi: abu hangat, aksen tembaga/oranye, salmon, highlight kuning.
 */
export const palette = {
  // Background & permukaan
  bg: "#C9C6BF", // abu-abu hangat (lantai/dinding)
  bgDark: "#A8A49B",
  wall: "#E3E0D8",

  // Komponen mesin
  copper: "#C87E4F", // pipa tembaga
  copperDark: "#A5633A",
  salmon: "#E8927C", // kumparan / bagian motor
  salmonDark: "#C9705C",
  steel: "#8A8F99", // logam / pegas
  steelDark: "#6B707A",
  oil: "#E9C46A", // oli
  oilDark: "#D4A843",

  // UI overlay
  caption: "#1A1A1A", // background caption (hitam pekat)
  highlight: "#F2C14E", // kuning highlight kata
  labelBg: "#F5F3EE", // label putih
  labelText: "#1A1A1A",
  danger: "#E34B4B", // merah peringatan
  white: "#FFFFFF",
  textLight: "#F5F3EE",

  // Listrik
  electric: "#FFD84D",
} as const;

export type Palette = typeof palette;
