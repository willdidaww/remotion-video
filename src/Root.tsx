import React from "react";
import { Composition } from "remotion";
import { TextAnimation } from "./compositions/TextAnimation";
import { ConceptExplainer } from "./compositions/ConceptExplainer";
import { FridgeExplainer } from "./edu/FridgeExplainer";
import { SkyExplainer } from "./sky/SkyExplainer";
import { IceExplainer } from "./ice/IceExplainer";
import { IceCrystal3D } from "./ice3d/IceCrystal3D";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

/**
 * Daftar semua komposisi video.
 * Tiap <Composition> muncul sebagai entri di Remotion Studio dan bisa di-render.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Showcase animasi teks: 4 scene x 2.5 detik = 10 detik */}
      <Composition
        id="TextAnimation"
        component={TextAnimation}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* Penjelasan konsep: intro 2s + 4 langkah x 2s = 10 detik */}
      <Composition
        id="ConceptExplainer"
        component={ConceptExplainer}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* Video edukatif 2D (Opsi B) — vertikal 9:16, ~21 detik */}
      <Composition
        id="FridgeExplainer"
        component={FridgeExplainer}
        durationInFrames={21 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Video edukatif 2: "Kenapa langit biru?" — vertikal 9:16, 20 detik */}
      <Composition
        id="SkyExplainer"
        component={SkyExplainer}
        durationInFrames={50 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Video edukatif 3: "Kenapa es mengapung?" — vertikal 9:16, 50 detik */}
      <Composition
        id="IceExplainer"
        component={IceExplainer}
        durationInFrames={50 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Kristal es 3D (Three.js) — landscape 16:9, 12 detik */}
      <Composition
        id="IceCrystal3D"
        component={IceCrystal3D}
        durationInFrames={12 * FPS}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
