import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { buildMolecules, buildBonds, hydrogenOffsets, A, LAYERS } from "./lattice";
import { fontFamily_Inter } from "../loadFonts";

/* ------------------------------ Geometri & material ------------------------------ */
const geoO = new THREE.SphereGeometry(0.62, 24, 24);
const geoH = new THREE.SphereGeometry(0.3, 16, 16);
const geoStick = new THREE.CylinderGeometry(0.08, 0.08, 1, 10);
const geoBond = new THREE.CylinderGeometry(0.11, 0.11, 1, 8);

const matO = new THREE.MeshStandardMaterial({ color: 0xe8504a, roughness: 0.35, metalness: 0.05 });
const matH = new THREE.MeshStandardMaterial({ color: 0xf2f6fa, roughness: 0.5 });
const matBond = new THREE.MeshStandardMaterial({
  color: 0x7fd0ff,
  roughness: 0.3,
  metalness: 0.1,
  transparent: true,
  opacity: 0.55,
  emissive: new THREE.Color(0x2a5a7a),
  emissiveIntensity: 0.3,
});

const UP = new THREE.Vector3(0, 1, 0);

/* --------------------------------- Satu molekul --------------------------------- */
const Molecule: React.FC<{ pos: THREE.Vector3; seed: number }> = ({ pos, seed }) => {
  const hs = useMemo(() => hydrogenOffsets(seed), [seed]);
  return (
    <group position={pos}>
      <mesh geometry={geoO} material={matO} castShadow receiveShadow />
      {hs.map((h, i) => {
        const dir = h.clone().normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir);
        return (
          <React.Fragment key={i}>
            <mesh geometry={geoH} material={matH} position={h} castShadow />
            <mesh
              geometry={geoStick}
              material={matH}
              position={h.clone().multiplyScalar(0.5)}
              quaternion={quat}
              scale={[1, 0.95, 1]}
            />
          </React.Fragment>
        );
      })}
    </group>
  );
};

/* --------------------------------- Isi scene --------------------------------- */
const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const molecules = useMemo(() => buildMolecules(), []);
  const bonds = useMemo(() => buildBonds(molecules), [molecules]);

  // Rotasi deterministik berdasarkan frame (bukan OrbitControls).
  const rotY = (frame / fps) * 0.35;
  const rotX = Math.sin((frame / fps) * 0.25) * 0.15;

  return (
    <>
      <ambientLight args={[0xbfd8ff, 0.55]} />
      <directionalLight position={[12, 20, 10]} intensity={1.4} castShadow />
      <directionalLight position={[-14, -6, -10]} intensity={0.5} color={0x4be3c8} />
      <group rotation={[rotX, rotY, 0]}>
        {molecules.map((m, i) => (
          <Molecule key={i} pos={m.pos} seed={m.seed} />
        ))}
        {bonds.map((b, i) => (
          <mesh
            key={`b${i}`}
            geometry={geoBond}
            material={matBond}
            position={b.mid}
            quaternion={b.quat}
            scale={[1, b.len, 1]}
          />
        ))}
      </group>
    </>
  );
};

/* --------------------------------- Komposisi --------------------------------- */
export const IceCrystal3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Kamera zoom masuk pelan di awal.
  const camZ = interpolate(frame, [0, 60], [34, 26], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outro = interpolate(frame, [durationInFrames - 20, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #1b3c5a 0%, #0a1826 70%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 45, position: [camZ * 0.5, camZ * 0.4, camZ], near: 0.1, far: 1000 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene />
      </ThreeCanvas>

      {/* Judul */}
      <AbsoluteFill
        style={{
          padding: 60,
          fontFamily: fontFamily_Inter,
          color: "#eaf6fb",
          pointerEvents: "none",
        }}
      >
        <div style={{ opacity: titleOp }}>
          <div style={{ fontSize: 64, fontWeight: 900 }}>Kristal Es Heksagonal</div>
          <div style={{ fontSize: 36, fontWeight: 600, opacity: 0.8, marginTop: 8 }}>
            Struktur molekul air saat membeku (ice Ih)
          </div>
        </div>

        {/* Legenda */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 60,
            display: "flex",
            gap: 36,
            fontSize: 30,
            fontWeight: 700,
            opacity: titleOp,
          }}
        >
          <Legend color="#e8504a" label="Oksigen" />
          <Legend color="#ffffff" label="Hidrogen" />
          <Legend color="#7fd0ff" label="Ikatan hidrogen" />
        </div>
      </AbsoluteFill>

      {/* Fade out di akhir */}
      <AbsoluteFill style={{ backgroundColor: "#0a1826", opacity: outro, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: color }} />
    {label}
  </div>
);

export const ICE3D_FRAMES_HINT = LAYERS * A; // (dipakai agar import A & LAYERS tidak dianggap unused)
