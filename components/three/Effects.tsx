'use client';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { CAN_H, makeSoftSprite } from '@/lib/canTexture';
import { FLAVORS } from '@/lib/flavors';
import { canRig, useDose } from '@/lib/store';
import { reducedMotion } from './pointer';

const rand = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ------------------------------------------------------------------ */
/* Cold vapour: soft wisps curling off the top of a chilled can        */
/* ------------------------------------------------------------------ */
const mistVert = /* glsl */ `
  attribute vec4 aSeed; // phase, angle, radius, speed
  uniform float uTime, uTop, uSize, uPR, uDir;
  varying float vAlpha; varying float vRot;
  void main(){
    float life = fract(uTime * aSeed.w + aSeed.x);
    float ang = aSeed.y + life * 1.6 * (aSeed.z - .5);
    float rad = mix(.25, 1.25 + aSeed.z * 1.1, life);
    vec3 p = vec3(cos(ang) * rad, uTop + uDir * (life * (1.6 + aSeed.z * 1.3)) + sin(life * 6.2831 + aSeed.y) * .06, sin(ang) * rad * .8);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + life * 1.7) * uPR * (10. / -mv.z);
    vAlpha = smoothstep(0., .22, life) * (1. - smoothstep(.45, 1., life));
    vRot = aSeed.y + life * 2.;
  }`;
const mistFrag = /* glsl */ `
  uniform sampler2D uMap; uniform float uOpacity; uniform vec3 uColor;
  varying float vAlpha; varying float vRot;
  void main(){
    vec2 c = gl_PointCoord - .5;
    float s = sin(vRot), co = cos(vRot);
    c = mat2(co, -s, s, co) * c;
    c.x *= 1.35; // slightly stretched, less "ball"-like
    float a = texture2D(uMap, c + .5).a;
    gl_FragColor = vec4(uColor, a * vAlpha * uOpacity);
  }`;

function Mist({ count = 46, top = CAN_H / 2 + 0.2, dir = 1, opacity = 0.16, size = 70 }) {
  const gl = useThree((s) => s.gl);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seeds.set([rand(i + 1), rand(i + 7) * Math.PI * 2, rand(i + 13), 0.06 + rand(i + 21) * 0.08], i * 4);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    const m = new THREE.ShaderMaterial({
      vertexShader: mistVert,
      fragmentShader: mistFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uTop: { value: top },
        uDir: { value: dir },
        uSize: { value: size },
        uPR: { value: 1 },
        uOpacity: { value: opacity },
        uColor: { value: new THREE.Color('#ffffff') },
        uMap: { value: makeSoftSprite(128, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)') },
      },
    });
    return { geometry: g, material: m };
  }, [count, top, dir, opacity, size]);

  useFrame((state) => {
    material.uniforms.uTime.value = reducedMotion() ? 3 : state.clock.elapsedTime;
    material.uniforms.uPR.value = gl.getPixelRatio();
    // vapour reads better against light stages, keep it quieter on dark
    material.uniforms.uOpacity.value = opacity * (1 - canRig.dark * 0.35);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Fizz: carbonation bubbles rising around the can                     */
/* ------------------------------------------------------------------ */
const fizzVert = /* glsl */ `
  attribute vec4 aSeed; // phase, angle, radius, speed
  uniform float uTime, uH, uSize, uPR;
  varying float vAlpha;
  void main(){
    float life = fract(uTime * aSeed.w + aSeed.x);
    float ang = aSeed.y + sin(life * 9. + aSeed.x * 20.) * .08;
    float rad = 1.35 + aSeed.z * 1.6;
    vec3 p = vec3(cos(ang) * rad, mix(-uH * .55, uH * .65, life), sin(ang) * rad);
    p.x += sin(life * 14. + aSeed.y * 5.) * .05;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aSeed.z) * uPR * (10. / -mv.z);
    vAlpha = smoothstep(0., .12, life) * (1. - smoothstep(.8, 1., life));
  }`;
const fizzFrag = /* glsl */ `
  uniform vec3 uColor; varying float vAlpha;
  void main(){
    vec2 c = gl_PointCoord - .5; float d = length(c);
    if (d > .5) discard;
    float rim = smoothstep(.33, .47, d) * (1. - smoothstep(.47, .5, d));
    float hi = smoothstep(.16, .0, length(c - vec2(-.16, .16)));
    float a = rim * .85 + hi + .08;
    gl_FragColor = vec4(uColor, a * vAlpha);
  }`;

function Fizz({ count = 70 }) {
  const gl = useThree((s) => s.gl);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seeds.set([rand(i * 3 + 2), rand(i * 5 + 1) * Math.PI * 2, rand(i * 11 + 4), 0.05 + rand(i * 7 + 9) * 0.12], i * 4);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    const m = new THREE.ShaderMaterial({
      vertexShader: fizzVert,
      fragmentShader: fizzFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uH: { value: CAN_H },
        uSize: { value: 9 },
        uPR: { value: 1 },
        uColor: { value: new THREE.Color('#ffffff') },
      },
    });
    return { geometry: g, material: m };
  }, [count]);
  useFrame((state) => {
    material.uniforms.uTime.value = reducedMotion() ? 2 : state.clock.elapsedTime;
    material.uniforms.uPR.value = gl.getPixelRatio();
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Flavour particles: tiny tinted flecks drifting through the light    */
/* ------------------------------------------------------------------ */
const fleckVert = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime, uSize, uPR;
  varying float vTw; varying float vMix;
  void main(){
    float t = uTime * (.05 + aSeed.w * .08);
    vec3 p = vec3(
      (aSeed.x - .5) * 11. + sin(t * 2. + aSeed.y * 6.) * .6,
      mod((aSeed.y - .5) * 9. + t * 1.4, 9.) - 4.5,
      (aSeed.z - .5) * 6. + cos(t * 1.7 + aSeed.x * 6.) * .4);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (.4 + aSeed.w) * uPR * (10. / -mv.z);
    vTw = .55 + .45 * sin(uTime * (1. + aSeed.w * 2.) + aSeed.x * 30.);
    vMix = aSeed.z;
  }`;
const fleckFrag = /* glsl */ `
  uniform vec3 uA, uB; uniform float uOpacity; varying float vTw; varying float vMix;
  void main(){
    vec2 c = gl_PointCoord - .5;
    // little irregular flake: diamond-ish falloff
    float d = abs(c.x) + abs(c.y) * 1.3;
    float a = smoothstep(.5, .1, d);
    gl_FragColor = vec4(mix(uA, uB, step(.62, vMix)), a * vTw * uOpacity);
  }`;

function Flecks({ count = 120 }) {
  const gl = useThree((s) => s.gl);
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) seeds.set([rand(i + 101), rand(i + 202), rand(i + 303), rand(i + 404)], i * 4);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    const m = new THREE.ShaderMaterial({
      vertexShader: fleckVert,
      fragmentShader: fleckFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 7 },
        uPR: { value: 1 },
        uOpacity: { value: 0.9 },
        uA: { value: new THREE.Color(FLAVORS[0].accent) },
        uB: { value: new THREE.Color('#ffffff') },
      },
    });
    return { geometry: g, material: m };
  }, [count]);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((state, dt) => {
    const u = material.uniforms;
    u.uTime.value = reducedMotion() ? 0 : state.clock.elapsedTime;
    u.uPR.value = gl.getPixelRatio();
    target.set(FLAVORS[useDose.getState().flavor].accent);
    u.uA.value.lerp(target, 1 - Math.exp(-dt * 4));
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

/* ------------------------------------------------------------------ */
/* Glossy jelly drops, echoing the splashes printed on the wrap        */
/* ------------------------------------------------------------------ */
const BLOBS: { p: [number, number, number]; r: [number, number, number]; s: number; k: 'cap' | 'sph' }[] = [
  { p: [-2.2, 1.7, -0.8], r: [0.4, 0.2, 0.9], s: 0.24, k: 'cap' },
  { p: [2.2, 2.2, -1.2], r: [-0.3, 0.5, -0.6], s: 0.2, k: 'cap' },
  { p: [2.3, -1.2, 0.3], r: [0.2, 0.1, 0.4], s: 0.27, k: 'cap' },
  { p: [-1.9, -1.6, 0.6], r: [0.1, 0.3, -0.8], s: 0.18, k: 'cap' },
  { p: [-1.7, 0.1, 1.4], r: [0, 0, 0], s: 0.14, k: 'sph' },
  { p: [1.6, 0.6, 1.5], r: [0, 0, 0], s: 0.11, k: 'sph' },
  { p: [0.9, -2.6, -1.0], r: [0, 0, 0], s: 0.17, k: 'sph' },
  { p: [-0.8, 2.9, -0.9], r: [0, 0, 0], s: 0.12, k: 'sph' },
];

function Jelly() {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: FLAVORS[0].accent,
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        sheen: 0.6,
        sheenColor: new THREE.Color('#ffffff'),
        envMapIntensity: 1.6,
        iridescence: 0.25,
      }),
    [],
  );
  const cap = useMemo(() => new THREE.CapsuleGeometry(1, 2.2, 12, 32), []);
  const sph = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    target.set(FLAVORS[useDose.getState().flavor].accent);
    mat.color.lerp(target, 1 - Math.exp(-dt * 4));
    if (group.current) {
      // scatter outward as the can appears, tuck back in on dark stages for calm
      const s = THREE.MathUtils.damp(group.current.scale.x, canRig.intro * (1 - canRig.dark * 0.15), 3, dt);
      group.current.scale.setScalar(s);
    }
  });
  const still = reducedMotion();
  return (
    <group ref={group} scale={0}>
      {BLOBS.map((b, i) => (
        <Float key={i} speed={still ? 0 : 1.2 + (i % 3) * 0.4} rotationIntensity={0.8} floatIntensity={1.2} floatingRange={[-0.15, 0.15]}>
          <mesh position={b.p} rotation={b.r} scale={b.s} geometry={b.k === 'cap' ? cap : sph} material={mat} />
        </Float>
      ))}
    </group>
  );
}

export function Atmosphere() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 700;
  return (
    <>
      <Mist count={mobile ? 26 : 46} />
      <Mist count={mobile ? 14 : 24} top={-CAN_H / 2 - 0.1} dir={-0.18} opacity={0.12} size={110} />
      <Fizz count={mobile ? 36 : 70} />
      <Jelly />
    </>
  );
}

export { Flecks };
