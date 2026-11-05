'use client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Can } from './Can';
import { Atmosphere, Flecks } from './Effects';
import { bindPointer, pointer } from './pointer';
import { CAN_H, makeSoftSprite } from '@/lib/canTexture';
import { FLAVORS } from '@/lib/flavors';
import { canRig, useDose } from '@/lib/store';

const ORIGIN = new THREE.Vector3();

/** Places the whole can rig from the scroll-driven canRig values (x/y in half-viewport units). */
function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    pointer.sx = THREE.MathUtils.damp(pointer.sx, pointer.x, 3, dt);
    pointer.sy = THREE.MathUtils.damp(pointer.sy, pointer.y, 3, dt);
    const vp = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const intro = canRig.intro;
    const ease = 1 - Math.pow(1 - intro, 3);
    const bob = Math.sin(state.clock.elapsedTime * 1.1) * 0.08;
    g.position.set(
      canRig.x * (vp.width / 2) + pointer.sx * 0.15,
      canRig.y * (vp.height / 2) + bob - (1 - ease) * vp.height * 1.1 + pointer.sy * 0.1,
      canRig.z,
    );
    // fit the can to the viewport height so it reads the same on every screen
    const fit = Math.min(1, (vp.height * 0.78) / (CAN_H + 0.6), (vp.width * 0.9) / 2.4);
    g.scale.setScalar(canRig.scale * fit);
  });
  return <group ref={ref}>{children}</group>;
}

function GroundShadow() {
  const tex = useMemo(() => makeSoftSprite(128, 'rgba(20,12,16,0.55)', 'rgba(20,12,16,0)'), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - canRig.dark * 0.6) * canRig.intro;
  });
  return (
    <mesh ref={ref} position={[0, -CAN_H / 2 - 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.2, 1.4, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/** Key + flavour-tinted rims; one light chases the cursor for live highlights. */
function Lights() {
  const rimL = useRef<THREE.SpotLight>(null);
  const rimR = useRef<THREE.SpotLight>(null);
  const chase = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    target.set(FLAVORS[useDose.getState().flavor].accent);
    const k = 1 - Math.exp(-dt * 3);
    rimL.current?.color.lerp(target, k);
    rimR.current?.color.lerp(target, k);
    if (chase.current) {
      chase.current.position.x = THREE.MathUtils.damp(chase.current.position.x, pointer.x * 6, 4, dt);
      chase.current.position.y = THREE.MathUtils.damp(chase.current.position.y, pointer.y * 4 + 1, 4, dt);
      chase.current.intensity = 18 + canRig.dark * 22;
    }
    if (rimL.current && rimR.current) {
      const r = 260 + canRig.dark * 320;
      rimL.current.intensity = r;
      rimR.current.intensity = r * 0.8;
    }
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 6, 8]} intensity={1.6} color="#fff6ec" />
      <spotLight ref={rimL} position={[-7, 4, -5]} angle={0.5} penumbra={1} distance={30} decay={2} />
      <spotLight ref={rimR} position={[7, -2, -5]} angle={0.5} penumbra={1} distance={30} decay={2} />
      <pointLight ref={chase} position={[0, 1, 6]} distance={18} decay={2} color="#ffffff" />
    </>
  );
}

function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#1c1a1d']} />
      {/* big softbox overhead */}
      <Lightformer form="rect" intensity={3.2} position={[0, 7, 2]} scale={[12, 3, 1]} />
      {/* tall strip lights: the long vertical highlights you expect on an aluminium can */}
      <Lightformer form="rect" intensity={5} position={[-5, 0.5, 3]} scale={[1.1, 12, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[5, 0, 2]} scale={[0.6, 12, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[2.5, 0, 6]} scale={[0.35, 10, 1]} />
      {/* warm kicker and a ring for a sparkle in the clearcoat */}
      <Lightformer form="rect" intensity={1.2} color="#ffcfb0" position={[0, -2, -7]} scale={[14, 6, 1]} />
      <Lightformer form="ring" intensity={2.2} position={[3, 3, 7]} scale={1.4} />
    </Environment>
  );
}

function Scene() {
  return (
    <>
      <StudioEnvironment />
      <Lights />
      <Rig>
        <Can />
        <GroundShadow />
        <Atmosphere />
      </Rig>
      <Flecks count={typeof window !== 'undefined' && window.innerWidth < 700 ? 60 : 120} />
    </>
  );
}

export default function Stage() {
  const on = useDose((s) => s.stageOn);
  useEffect(() => bindPointer(), []);
  return (
    <div
      id="stage"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] transition-opacity duration-500"
      style={{ opacity: on ? 1 : 0 }}
    >
      <Canvas
        frameloop={on ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ fov: 26, position: [0, 0, 17], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.0 }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
