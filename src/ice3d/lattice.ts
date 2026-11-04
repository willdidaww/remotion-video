import * as THREE from "three";

/**
 * Bangun kisi es heksagonal (ice Ih) sederhana: honeycomb di bidang XZ,
 * ditumpuk beberapa lapis ke sumbu Y. Dipakai bersama oleh scene Remotion.
 */

export const A = 2.6; // jarak antar molekul
const SQ3 = Math.sqrt(3);
export const LAYERS = 3;
const RINGS = 2;

export type Molecule = { pos: THREE.Vector3; seed: number };

function layerPositions(y: number, parity: boolean): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let q = -RINGS; q <= RINGS; q++) {
    for (let r = -RINGS; r <= RINGS; r++) {
      const x = A * SQ3 * (q + r / 2);
      const z = A * 1.5 * r;
      if (Math.hypot(x, z) > A * 3.2) continue;
      pts.push(new THREE.Vector3(x, y, z));
      pts.push(new THREE.Vector3(x, y, z + A * (parity ? 0.9 : -0.9)));
    }
  }
  return pts;
}

export function buildMolecules(): Molecule[] {
  const mols: Molecule[] = [];
  let seed = 0;
  for (let l = 0; l < LAYERS; l++) {
    const y = (l - (LAYERS - 1) / 2) * A * 1.7;
    const pts = layerPositions(y, l % 2 === 0);
    pts.forEach((p) => mols.push({ pos: p, seed: seed++ }));
  }
  return mols;
}

export type Bond = { mid: THREE.Vector3; len: number; quat: THREE.Quaternion };

export function buildBonds(mols: Molecule[]): Bond[] {
  const BOND_MIN = A * 0.7;
  const BOND_MAX = A * 1.25;
  const up = new THREE.Vector3(0, 1, 0);
  const bonds: Bond[] = [];
  for (let i = 0; i < mols.length; i++) {
    for (let j = i + 1; j < mols.length; j++) {
      const a = mols[i].pos;
      const b = mols[j].pos;
      const d = a.distanceTo(b);
      if (d < BOND_MIN || d > BOND_MAX) continue;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, b.clone().sub(a).normalize());
      bonds.push({ mid, len: d, quat });
    }
  }
  return bonds;
}

/** Posisi relatif 2 atom hidrogen untuk satu molekul (sudut ~104.5°). */
export function hydrogenOffsets(seed: number): THREE.Vector3[] {
  const half = (104.5 * Math.PI) / 180 / 2;
  const len = 0.95;
  const base = seed * 2.399;
  return [-half, half].map(
    (a) => new THREE.Vector3(Math.cos(base + a) * len, Math.sin(seed) * 0.3, Math.sin(base + a) * len),
  );
}
