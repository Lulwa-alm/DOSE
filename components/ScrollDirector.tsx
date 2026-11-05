'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { canRig, useDose } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

type Pose = { x: number; y: number; scale: number; tiltZ: number; face: number; rotY: number; dark: number };
const KEYS: (keyof Pose)[] = ['x', 'y', 'scale', 'tiltZ', 'face', 'rotY', 'dark'];
const TAU = Math.PI * 2;
const BACK = 2.51; // extra turn that brings the nutrition panel to the front

const DESK: Record<string, Pose> = {
  hero: { x: 0, y: 0, scale: 0.9, tiltZ: -0.12, face: 0, rotY: 0, dark: 0 },
  story: { x: 0.52, y: 0, scale: 0.92, tiltZ: 0.16, face: 0, rotY: 0, dark: 1 },
  storyEnd: { x: 0.5, y: 0.02, scale: 0.98, tiltZ: 0.08, face: 0, rotY: TAU, dark: 1 },
  flavors: { x: -0.5, y: -0.04, scale: 1.02, tiltZ: -0.06, face: 1, rotY: TAU, dark: 0 },
  ingredients: { x: 0, y: -0.12, scale: 0.7, tiltZ: 0, face: 1, rotY: TAU + BACK, dark: 0 },
  ingredientsEnd: { x: 0, y: -0.12, scale: 0.72, tiltZ: 0.04, face: 1, rotY: TAU + BACK + 0.3, dark: 0 },
  out: { x: 0, y: 1.9, scale: 0.6, tiltZ: 0.3, face: 1, rotY: TAU * 2, dark: 0 },
};
const MOB: Record<string, Pose> = {
  hero: { x: 0, y: 0.13, scale: 0.5, tiltZ: -0.1, face: 0, rotY: 0, dark: 0 },
  story: { x: 0, y: 0.5, scale: 0.42, tiltZ: 0.12, face: 0, rotY: 0, dark: 1 },
  storyEnd: { x: 0, y: 0.5, scale: 0.44, tiltZ: 0.06, face: 0, rotY: TAU, dark: 1 },
  flavors: { x: 0, y: 0.5, scale: 0.38, tiltZ: -0.06, face: 1, rotY: TAU, dark: 0 },
  ingredients: { x: 0, y: 0.14, scale: 0.42, tiltZ: 0, face: 1, rotY: TAU + BACK, dark: 0 },
  ingredientsEnd: { x: 0, y: 0.14, scale: 0.42, tiltZ: 0.04, face: 1, rotY: TAU + BACK + 0.3, dark: 0 },
  out: { x: 0, y: 1.9, scale: 0.4, tiltZ: 0.3, face: 1, rotY: TAU * 2, dark: 0 },
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Choreographs the single fixed 3D can across the story.
 * Scroll position maps onto a list of keyframed poses (piecewise, eased), and the rig glides toward
 * the target every tick. One source of truth, so jumping anywhere on the page always lands right.
 * x/y are in half-viewport units (-1 = left edge); scale is relative to a height-fit can.
 */
export default function ScrollDirector() {
  const ready = useDose((s) => s.ready);

  useEffect(() => {
    if (!ready) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(canRig, { intro: 1, duration: still ? 0 : 2.2, ease: 'expo.out', delay: 0.15 });
    ScrollTrigger.refresh();
  }, [ready]);

  useEffect(() => {
    let frames: { y: number; p: Pose }[] = [];
    const target: Pose = { ...DESK.hero };
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const top = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    };
    const bottom = (sel: string) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().bottom + window.scrollY : 0;
    };

    const measure = () => {
      const vh = window.innerHeight;
      const P = window.innerWidth >= 900 ? DESK : MOB;
      frames = [
        { y: top('#story') - vh, p: P.hero },
        { y: top('#story'), p: P.story },
        { y: bottom('#story') - vh, p: P.storyEnd },
        { y: top('#flavors'), p: P.flavors },
        { y: top('#ingredients') - vh, p: P.flavors },
        { y: top('#ingredients'), p: P.ingredients },
        { y: bottom('#ingredients') - vh, p: P.ingredientsEnd },
        { y: top('#label') - vh * 0.25, p: P.out },
      ];
      update(window.scrollY);
    };

    const update = (y: number) => {
      if (!frames.length) return;
      let i = 0;
      while (i < frames.length - 1 && y > frames[i + 1].y) i++;
      const a = frames[i];
      const b = frames[Math.min(i + 1, frames.length - 1)];
      const span = b.y - a.y;
      const t = span > 0 ? smooth(Math.min(1, Math.max(0, (y - a.y) / span))) : 1;
      for (const k of KEYS) target[k] = a.p[k] + (b.p[k] - a.p[k]) * t;
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => update(self.scroll()),
      onRefresh: measure,
    });

    // stop rendering WebGL once the can has left
    const off = ScrollTrigger.create({
      trigger: '#label',
      start: 'top 20%',
      onEnter: () => useDose.getState().setStageOn(false),
      onLeaveBack: () => useDose.getState().setStageOn(true),
    });

    Object.assign(canRig, target);
    measure();
    Object.assign(canRig, target);

    const tick = (_t: number, dtMs: number) => {
      const k = still ? 1 : 1 - Math.exp(-(dtMs / 1000) * 6);
      for (const key of KEYS) canRig[key] += (target[key] - canRig[key]) * k;
    };
    gsap.ticker.add(tick);

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(document.body);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      off.kill();
      ro.disconnect();
    };
  }, []);

  return null;
}
