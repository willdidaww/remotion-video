# Remotion Explainer 🎬

Starter project untuk membuat **motion graphic programatik** dengan [Remotion](https://www.remotion.dev) — fokus pada **video penjelasan konsep** dan **animasi teks**. Semua animasi ditulis dengan React + TypeScript dan di-render menjadi file video MP4.

## ✨ Isi

Dua komposisi video siap pakai (Full HD 1920×1080, 30 fps, 10 detik):

| ID | Deskripsi |
|----|-----------|
| `TextAnimation` | Showcase 4 preset animasi teks: scale, stagger per kata, typewriter, dan slide. |
| `ConceptExplainer` | Template penjelasan konsep langkah-demi-langkah dengan kartu beranimasi. |

## 🚀 Cara Pakai

```bash
# 1. Install dependencies
npm install

# 2. Buka Remotion Studio (preview real-time di browser)
npm run dev

# 3. Render ke MP4
npm run render:text      # -> out/text-animation.mp4
npm run render:concept   # -> out/concept-explainer.mp4
```

> Render butuh Chrome/Chromium. Saat pertama kali render, Remotion akan mengunduh browser secara otomatis.

## 🛠️ Cara Kustomisasi

### Mengganti isi penjelasan konsep
Edit objek `concept` di `src/compositions/ConceptExplainer.tsx`:

```ts
const concept = {
  title: "Judul Topik Kamu",
  steps: [
    { title: "Langkah 1", description: "..." },
    // tambah langkah sebanyak yang kamu mau
  ],
};
```

### Mengganti animasi teks
Komponen `<AnimatedText>` (`src/components/AnimatedText.tsx`) mendukung:
- `type`: `"fade" | "slide-up" | "slide-left" | "scale" | "typewriter"`
- `staggerWords`: munculkan kata satu per satu
- `delay`: tunda mulai animasi (dalam frame)

### Mengganti warna & font
Semua token desain ada di `src/theme.ts` — ubah di satu tempat, berlaku ke semua video.

## 📁 Struktur

```
src/
├── index.ts                  # Entry point (registerRoot)
├── Root.tsx                  # Daftar semua <Composition>
├── theme.ts                  # Design system (warna, ukuran, spacing)
├── loadFonts.ts              # Memuat font Google (Inter)
├── components/
│   ├── AnimatedText.tsx      # Teks dengan preset animasi
│   ├── Background.tsx        # Background gradien bergerak
│   └── ConceptCard.tsx       # Kartu langkah untuk penjelasan
└── compositions/
    ├── TextAnimation.tsx     # Video showcase animasi teks
    └── ConceptExplainer.tsx  # Video penjelasan konsep
```

## 📐 Mengubah resolusi / durasi / fps
Edit konstanta di `src/Root.tsx` (`FPS`, `WIDTH`, `HEIGHT`, `durationInFrames`).
