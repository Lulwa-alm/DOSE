'use client';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { FLAVORS } from '@/lib/flavors';
import { asset } from '@/lib/asset';
import { CAN_H, makeDropletNormalMap, makeLabelTexture } from '@/lib/canTexture';
import { canRig, useDose } from '@/lib/store';
import { sans } from '@/lib/fonts';
import { pointer, reducedMotion } from './pointer';

/** Rotation that puts the DOSE logo toward the camera; +2.51 shows the nutrition panel. */
export const FRONT = 0.63;

const lathe = (pts: [number, number][], y0: number) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y + y0)), 128);

export const Can = forwardRef<THREE.Group>(function Can(_, ref) {
  const flavor = useDose((s) => s.flavor);
  const gl = useThree((s) => s.gl);
  const imgs = useLoader(THREE.ImageLoader, FLAVORS.map((f) => asset(f.tex)));
  const font = sans.style.fontFamily;

  const labels = useMemo(() => {
    const size = typeof window !== 'undefined' && window.innerWidth < 700 ? 1536 : 2048;
    return imgs.map((im, i) => makeLabelTexture(im, FLAVORS[i], font, size));
  }, [imgs, font]);

  const droplets = useMemo(() => makeDropletNormalMap(1024), []);

  const mats = useMemo(() => {
    const body = new THREE.MeshPhysicalMaterial({
      map: labels[0].tex,
      metalness: 0.12,
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      normalMap: droplets,
      normalScale: new THREE.Vector2(0.32, 0.32),
      clearcoatNormalMap: droplets,
      clearcoatNormalScale: new THREE.Vector2(0.55, 0.55),
      envMapIntensity: 1.0,
    });
    const metal = new THREE.MeshPhysicalMaterial({
      color: 0xdfe3e8,
      metalness: 1,
      roughness: 0.2,
      clearcoat: 0.4,
      envMapIntensity: 1.3,
      side: THREE.DoubleSide,
    });
    const dark = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 1, roughness: 0.45 });
    return { body, metal, dark };
  }, [labels, droplets]);

  const geo = useMemo(() => {
    const h = CAN_H;
    return {
      body: new THREE.CylinderGeometry(1, 1, h, 160, 1, true),
      bottom: lathe([[0, -0.2], [0.6, -0.2], [0.8, -0.15], [0.93, -0.08], [0.99, -0.02], [1, 0]], -h / 2),
      top: lathe(
        [[1, 0], [0.99, 0.08], [0.95, 0.17], [0.9, 0.24], [0.87, 0.28], [0.875, 0.32], [0.9, 0.35], [0.89, 0.37], [0.85, 0.355], [0.83, 0.31], [0.8, 0.27], [0, 0.27]],
        h / 2,
      ),
      tab: new THREE.CapsuleGeometry(0.11, 0.42, 6, 16),
      rivet: new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20),
    };
  }, []);

  // Max anisotropy for the label, repaint once web fonts are ready (nutrition text uses DM Sans).
  useEffect(() => {
    const a = gl.capabilities.getMaxAnisotropy();
    labels.forEach((l) => (l.tex.anisotropy = a));
    let live = true;
    document.fonts
      .load(`700 20px ${font}`)
      .then(() => document.fonts.load(`400 20px ${font}`))
      .then(() => live && labels.forEach((l) => l.paint()))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [labels, gl, font]);

  useEffect(
    () => () => {
      labels.forEach((l) => l.tex.dispose());
      droplets.dispose();
      Object.values(mats).forEach((m) => m.dispose());
      Object.values(geo).forEach((g) => g.dispose());
    },
    [labels, droplets, mats, geo],
  );

  const st = useRef({ acc: 0, vel: 0, pop: 1, shown: 0, swapAt: -1 });

  // Flavour change: whip the can around and swap the wrap mid-spin.
  useEffect(() => {
    const s = st.current;
    if (s.shown === flavor) return;
    s.shown = flavor;
    if (reducedMotion()) {
      mats.body.map = labels[flavor].tex;
      return;
    }
    s.vel += 15;
    s.pop = 0.9;
    s.swapAt = performance.now() + 110;
  }, [flavor, labels, mats]);

  const spin = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = spin.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const s = st.current;
    const still = reducedMotion();
    if (s.swapAt > 0 && performance.now() > s.swapAt) {
      mats.body.map = labels[s.shown].tex;
      s.swapAt = -1;
    }
    const idle = still ? 0 : 0.42 * (1 - Math.min(canRig.face, 1));
    s.vel *= Math.exp(-dt * 2.4);
    s.acc += (idle + s.vel) * dt;
    if (canRig.face > 0) {
      const target = Math.round(s.acc / (Math.PI * 2)) * Math.PI * 2;
      s.acc += (target - s.acc) * (1 - Math.exp(-dt * 2.2)) * Math.min(canRig.face, 1);
    }
    s.pop += (1 - s.pop) * (1 - Math.exp(-dt * 7));
    const intro = canRig.intro;
    const t = state.clock.elapsedTime;
    g.rotation.y = FRONT + s.acc + canRig.rotY + pointer.sx * 0.35 + (1 - intro) * 5;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.sy * 0.12, 4, dt);
    g.rotation.z = canRig.tiltZ + (still ? 0 : Math.sin(t * 0.7) * 0.025);
    g.scale.setScalar(s.pop);
  });

  const h = CAN_H;
  return (
    <group ref={ref}>
      <group ref={spin}>
        <mesh geometry={geo.body} material={mats.body} castShadow />
        <mesh geometry={geo.bottom} material={mats.metal} />
        <mesh geometry={geo.top} material={mats.metal} />
        <group position={[0, h / 2 + 0.29, 0]}>
          <mesh geometry={geo.tab} material={mats.metal} rotation={[0, 0, Math.PI / 2]} position={[0.16, 0.01, 0]} scale={[0.2, 1, 1]} />
          <mesh geometry={geo.rivet} material={mats.dark} />
          <mesh position={[-0.42, -0.005, 0]} scale={[0.32, 0.02, 0.22]} material={mats.dark}>
            <sphereGeometry args={[1, 24, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
});
