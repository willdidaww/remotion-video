/**
 * Design system sederhana untuk semua video.
 * Ubah nilai di sini untuk mengganti look & feel semua komposisi sekaligus.
 */
export const theme = {
  colors: {
    background: "#0B1021",
    backgroundAlt: "#141A32",
    primary: "#6C8CFF",
    secondary: "#FF6CAB",
    accent: "#4BE3C8",
    text: "#F5F7FF",
    textMuted: "#9BA6C9",
    card: "#1C2342",
    cardBorder: "#2A3358",
  },
  fonts: {
    // Diisi di components via @remotion/google-fonts (lihat loadFonts.ts)
    family: "Inter, sans-serif",
  },
  sizes: {
    titleXL: 120,
    title: 90,
    heading: 64,
    body: 42,
    caption: 32,
  },
  spacing: {
    sm: 16,
    md: 32,
    lg: 64,
    xl: 120,
  },
  radius: 24,
} as const;

export type Theme = typeof theme;
